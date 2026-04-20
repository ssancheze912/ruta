"""
bmad_to_agiletest.py — Parser + Cargador de artefactos BMAD V6.0 → AgileTest/Jira

Lee un archivo bmad-v6-*-test-design.md (documento unificado BMAD V6.0) y extrae:
  - Stories desde Seccion I (Gatekeeper)
  - FACs Gherkin desde Seccion II (Features & FAC)
  - Test Cases desde Seccion IV (Matriz 360°)
  - Traceability desde Apendice
Luego puede crear todo en Jira/AgileTest via API REST.

Uso:
    python bmad_to_agiletest.py --dry-run                              # Parsea y muestra resumen
    python bmad_to_agiletest.py --dry-run --detail                     # Muestra cada TC con steps
    python bmad_to_agiletest.py --dry-run --export                     # Exporta a JSON
    python bmad_to_agiletest.py --input mi-archivo.md --dry-run        # Archivo custom
    python bmad_to_agiletest.py --create                               # Crea en Jira/AgileTest

Autor: Juan Manuel Reina Montoya — Lider QA, SIESA
Fecha: 29 marzo 2026 | Actualizado: 09 abril 2026 (soporte BMAD V6.0)
"""

import re
import json
import os
import sys
import argparse
import time
from dataclasses import dataclass, field

# ============================================================
# Configuracion
# ============================================================

CONFIG = {
    # Archivo BMAD V6.0 (ruta relativa al script)
    'input_file': 'bmad-v6-segment-test-design.md',

    # Jira
    'jira_base_url': 'https://siesa-team.atlassian.net',
    'jira_project_key': 'CON',
    'jira_user_email': 'jmreinam@siesa.com',
    'jira_api_token': '<JIRA_API_TOKEN>',

    # Issue types en Jira (IDs de la instancia SIESA)
    # IMPORTANTE: Validar con GET /rest/api/3/issuetype antes de usar
    'issue_type_task': '10013',             # Tarea (Requirement en AgileTest)
    'issue_type_test_case': '10029',        # Caso de prueba
    'issue_type_test_plan': '10026',        # Plan de Pruebas
    'issue_type_test_execution': '10025',   # Ejecucion Pruebas

    # AgileTest API
    'agiletest_base_url': 'https://jira.agiletest.app',
    'agiletest_client_id': 'ohuKO8VOiFisZiEVm2GribrordlxhRJdc+DUUQ2mITeswQwCZrRvZLcS1L0GJf9/',
    'agiletest_client_secret': 'eb6f47b629da0ff73d078abd3d72fe2ad0009556dcace1d182828f861f3759d9',
    'agiletest_project_id': '10016',        # CON (Financiero) project ID

    # Mapeo de prioridad BMAD -> Jira (nombres en español — instancia SIESA)
    'priority_map': {
        'P0': 'Muy Alta',
        'P1': 'Alta',
        'P2': 'Media',
        'P3': 'Baja',
    },
}

# Normalizacion de niveles de test
LEVEL_NORMALIZE = {
    'BE-Integration': 'Integration (TI)',
    'BE-Integ': 'Integration (TI)',
    'BE-Unit': 'Unit (TU)',
    'BE-Unit+Integ': 'Unit (TU) + Integration (TI)',
    'FE-E2E': 'E2E (TE)',
    'FE-Unit': 'Unit (TU)',
    'Integration': 'Integration (TI)',
}

# ============================================================
# Modelos de datos
# ============================================================

@dataclass
class Story:
    story_id: str
    epic_id: str
    epic_name: str
    title: str
    description: str
    layer: str
    risk_level: str

@dataclass
class TestStep:
    action: str
    expected_result: str
    data: str = ''

@dataclass
class TestCase:
    tc_id: str              # TC-P0-CRUD-001
    title: str
    priority: str           # P0, P1, P2, P3
    level: str              # Integration (TI), Unit (TU), E2E (TE)
    feature: str = ''       # F1 - CRUD
    epics: str = ''         # E002-S002
    technique: str = ''     # PE, VL, TD, AR, EG
    scenario: str = ''
    preconditions: str = ''
    risk_score: str = ''    # 5x2=10
    strategy: str = ''      # Automatizado
    source_stories: list = field(default_factory=list)
    source_facs: list = field(default_factory=list)
    raw_body: str = ''
    steps: list = field(default_factory=list)

# ============================================================
# Parser: Metadata del documento
# ============================================================

def parse_metadata(content: str) -> dict:
    """Extrae metadata del header del documento BMAD V6.0."""
    meta = {'feature': '', 'feature_code': '', 'date': '', 'author': ''}

    m = re.search(r'\*\*M[oó]dulo/Feature:\*\*\s*(.+)', content)
    if m:
        meta['feature'] = m.group(1).strip()

    m = re.search(r'\*\*Feature Code:\*\*\s*(.+)', content)
    if m:
        meta['feature_code'] = m.group(1).strip()

    m = re.search(r'\*\*Fecha del Dise[nñ]o:\*\*\s*(.+)', content)
    if not m:
        m = re.search(r'\*\*Fecha.*?:\*\*\s*(.+)', content)
    if m:
        meta['date'] = m.group(1).strip()

    return meta

# ============================================================
# Parser: Seccion I — Gatekeeper (Stories)
# ============================================================

def parse_stories(content: str, feature_code: str) -> list:
    """Extrae stories de la tabla del Gatekeeper (Seccion I)."""
    stories = []

    # Buscar seccion I
    gk_match = re.search(
        r'## I\.\s*REPORTE DEL GATEKEEPER.*?\n(.*?)(?=\n---\s*\n\n## II|\Z)',
        content, re.DOTALL
    )
    if not gk_match:
        return stories

    section = gk_match.group(1)

    # Parsear tabla: | ID Historia | Nombre / Epica | Clasificacion | Justificacion |
    for line in section.split('\n'):
        line = line.strip()
        if not line.startswith('|'):
            continue
        cols = [c.strip() for c in line.split('|')[1:-1]]
        if len(cols) < 3:
            continue
        story_id = cols[0].strip()
        # Validar que es un ID de story real (contiene E0XX-S0XX)
        if not re.search(r'E\d+-S\d+', story_id):
            continue

        title = cols[1].strip()
        classification = cols[2].strip()
        justification = cols[3].strip() if len(cols) > 3 else ''

        # Extraer epic_id del story_id
        epic_match = re.search(r'(.*-E\d+)', story_id)
        epic_id = epic_match.group(1) if epic_match else ''

        # Inferir layer del titulo o justificacion
        layer = 'Backend'
        lower_all = (title + justification).lower()
        if any(kw in lower_all for kw in ['frontend', 'react', 'ui ', 'typescript', 'hook', 'page', 'drawer', 'form']):
            layer = 'Frontend'

        stories.append(Story(
            story_id=story_id,
            epic_id=epic_id,
            epic_name='',  # Se enriquece despues con traceability
            title=title,
            description=justification,
            layer=layer,
            risk_level='High' if classification == '**BL**' or 'BL' in classification else 'Low',
        ))

    return stories

# ============================================================
# Parser: Seccion II — FACs Gherkin
# ============================================================

def parse_facs(content: str) -> dict:
    """Extrae FAC Gherkin de Seccion II. Retorna dict: fac_id -> gherkin_text."""
    facs = {}

    # Buscar todos los Scenario dentro de bloques ```gherkin
    gherkin_blocks = re.findall(r'```gherkin\s*\n(.*?)```', content, re.DOTALL)

    for block in gherkin_blocks:
        # Separar scenarios
        scenarios = re.split(r'\n\s*(?=Scenario(?:\s+Outline)?:)', block)
        for scenario in scenarios:
            scenario = scenario.strip()
            if not scenario.startswith('Scenario'):
                continue
            # Extraer FAC ID del titulo
            title_match = re.match(r'Scenario(?:\s+Outline)?:\s*(F\d+-(?:FAC|NF)-\d+)\s*', scenario)
            if title_match:
                fac_id = title_match.group(1)
                facs[fac_id] = scenario

    return facs

# ============================================================
# Parser: Seccion IV — Matriz 360° (Test Cases)
# ============================================================

def parse_matrix_row(cols: list) -> TestCase:
    """Parsea una fila de la matriz 360° (12 columnas) en un TestCase."""
    # Columnas: ID | Funcionalidad | Epicas | Nivel | Tecnica | Escenario |
    #           Precondiciones | Pasos | Resultado Esperado | Riesgo (IxP) | Prioridad | Estrategia
    tc_id = cols[0].strip()
    feature = cols[1].strip() if len(cols) > 1 else ''
    epics = cols[2].strip() if len(cols) > 2 else ''
    level_raw = cols[3].strip() if len(cols) > 3 else ''
    technique = cols[4].strip() if len(cols) > 4 else ''
    scenario = cols[5].strip() if len(cols) > 5 else ''
    preconditions = cols[6].strip() if len(cols) > 6 else ''
    pasos = cols[7].strip() if len(cols) > 7 else ''
    expected = cols[8].strip() if len(cols) > 8 else ''
    risk_score = cols[9].strip() if len(cols) > 9 else ''
    priority = cols[10].strip() if len(cols) > 10 else ''
    strategy = cols[11].strip() if len(cols) > 11 else ''

    # Normalizar nivel
    level = LEVEL_NORMALIZE.get(level_raw, level_raw)

    # Construir steps: Precondiciones -> Setup, Pasos -> Action, Expected -> Result
    steps = []
    if preconditions and preconditions != '—' and preconditions != '-':
        steps.append(TestStep(
            action=f'SETUP: {preconditions}',
            expected_result='Precondiciones verificadas',
        ))
    if pasos:
        # Separar pasos numerados (1. xxx 2. yyy)
        numbered = re.split(r'\d+\.\s+', pasos)
        numbered = [p.strip() for p in numbered if p.strip()]
        if len(numbered) > 1:
            # Multiples pasos: uno por cada numerado, el ultimo lleva el expected
            for i, paso in enumerate(numbered):
                if i < len(numbered) - 1:
                    steps.append(TestStep(
                        action=paso,
                        expected_result='Paso ejecutado correctamente',
                    ))
                else:
                    steps.append(TestStep(
                        action=paso,
                        expected_result=expected,
                    ))
        else:
            steps.append(TestStep(
                action=pasos,
                expected_result=expected,
            ))
    elif expected:
        steps.append(TestStep(
            action=scenario or 'Ejecutar escenario',
            expected_result=expected,
        ))

    # Extraer story refs del campo Epicas
    source_stories = []
    story_refs = re.findall(r'E\d+-S\d+', epics)
    # Se enriquecen despues con feature_code prefix

    # Construir titulo: escenario como titulo descriptivo
    title = scenario if scenario else tc_id

    # Raw body para descripcion en Jira
    raw_body = (
        f'Escenario: {scenario}\n'
        f'Precondiciones: {preconditions}\n'
        f'Pasos: {pasos}\n'
        f'Resultado Esperado: {expected}\n'
        f'Tecnica: {technique}\n'
        f'Riesgo: {risk_score}'
    )

    return TestCase(
        tc_id=tc_id,
        title=title,
        priority=priority,
        level=level,
        feature=feature,
        epics=epics,
        technique=technique,
        scenario=scenario,
        preconditions=preconditions,
        risk_score=risk_score,
        strategy=strategy,
        source_stories=source_stories,
        raw_body=raw_body,
        steps=steps,
    )


def parse_test_cases(content: str) -> list:
    """Extrae Test Cases de Seccion IV (Matriz 360°)."""
    test_cases = []

    # Buscar seccion IV
    matrix_match = re.search(
        r'## IV\.\s*MATRIZ INTEGRAL.*?\n(.*?)(?=\n---\s*\n\n## V|\Z)',
        content, re.DOTALL
    )
    if not matrix_match:
        return test_cases

    section = matrix_match.group(1)

    # Parsear todas las filas de tabla que empiecen con | TC-
    for line in section.split('\n'):
        line = line.strip()
        if not line.startswith('|'):
            continue
        # Saltar headers y separadores
        if '---' in line or 'ID' in line.split('|')[1]:
            continue

        cols = [c.strip() for c in line.split('|')[1:-1]]
        if len(cols) < 8:
            continue
        # Verificar que la primera columna es un TC ID
        if not cols[0].startswith('TC-'):
            continue

        tc = parse_matrix_row(cols)
        test_cases.append(tc)

    return test_cases

# ============================================================
# Parser: Apendice — Traceability
# ============================================================

def parse_traceability(content: str, feature_code: str) -> dict:
    """Extrae mapping Story -> TCs desde el Apendice de Traceability."""
    mapping = {}  # story_id -> [tc_ids]

    # Buscar seccion de traceability: "Funcionalidad -> Epicas -> Casos de Prueba"
    trace_match = re.search(
        r'### Funcionalidad.*?Casos de Prueba\s*\n(.*?)(?=\n### Requerimientos|\Z)',
        content, re.DOTALL
    )
    if not trace_match:
        # Fallback: buscar "MATRIZ DE TRAZABILIDAD"
        trace_match = re.search(
            r'MATRIZ DE TRAZABILIDAD\s*\n(.*?)(?=\n### Requerimientos|\Z)',
            content, re.DOTALL
        )
    if not trace_match:
        return mapping

    section = trace_match.group(1)

    # Formato: - E001-S001 (Entities & EF Core) -> TC-P0-CRUD-004
    #          - E002-S002 (POST/GET/DELETE) -> TC-P0-CRUD-001, TC-P0-CRUD-002, ...
    line_pattern = re.compile(
        r'-\s*(E\d+-S\d+)\s*\(.*?\)\s*(?:→|->)\s*(.+?)$', re.MULTILINE
    )

    for m in line_pattern.finditer(section):
        story_suffix = m.group(1)
        story_id = f'{feature_code}-{story_suffix}'
        tc_text = m.group(2)

        # Extraer TC IDs (formato: TC-P0-CRUD-001, TC-P1-GUARD-002, etc.)
        tc_ids = re.findall(r'TC-P\d+-[\w]+-\d+', tc_text)
        # Tambien formato corto TC-P0-001
        short_ids = re.findall(r'TC-P\d+-\d+', tc_text)
        for sid in short_ids:
            if sid not in tc_ids:
                tc_ids.append(sid)

        if tc_ids:
            if story_id in mapping:
                mapping[story_id] = list(set(mapping[story_id] + tc_ids))
            else:
                mapping[story_id] = list(set(tc_ids))

    # Tambien parsear la tabla "Requerimientos Funcionales -> FAC -> Test Cases"
    req_match = re.search(
        r'### Requerimientos Funcionales.*?\n(.*?)(?=\n---|\Z)',
        content, re.DOTALL
    )
    if req_match:
        req_section = req_match.group(1)
        for line in req_section.split('\n'):
            line = line.strip()
            if not line.startswith('|') or '---' in line or 'Req' in line:
                continue
            cols = [c.strip() for c in line.split('|')[1:-1]]
            if len(cols) >= 3:
                fac_col = cols[1]
                tc_col = cols[2]
                tc_ids = re.findall(r'TC-P\d+-[\w]+-\d+', tc_col)
                short_ids = re.findall(r'TC-P\d+-\d+', tc_col)
                for sid in short_ids:
                    if sid not in tc_ids:
                        tc_ids.append(sid)
                fac_ids = re.findall(r'F\d+-(?:FAC|NF)-\d+', fac_col)
                # Guardar en mapeo FAC -> TCs (auxiliar)
                # No se agrega al story mapping aqui, se usa para enriquecer TCs

    return mapping

# ============================================================
# Enriquecimiento: propagar traceability y FACs a TCs
# ============================================================

def enrich_test_cases(test_cases: list, trace_map: dict, facs: dict, feature_code: str):
    """Propaga traceability a TC objects y enriquece steps con FAC Gherkin."""
    # 1. Propagar story -> TC desde traceability
    tc_by_id = {tc.tc_id: tc for tc in test_cases}
    for story_id, tc_ids in trace_map.items():
        for tc_id in tc_ids:
            if tc_id in tc_by_id:
                tc = tc_by_id[tc_id]
                if story_id not in tc.source_stories:
                    tc.source_stories.append(story_id)

    # 2. Inferir story refs del campo epics de cada TC
    for tc in test_cases:
        if tc.epics:
            refs = re.findall(r'E\d+-S\d+', tc.epics)
            for ref in refs:
                full_id = f'{feature_code}-{ref}'
                if full_id not in tc.source_stories:
                    tc.source_stories.append(full_id)

    # 3. Normalizar niveles
    for tc in test_cases:
        tc.level = LEVEL_NORMALIZE.get(tc.level, tc.level)

# ============================================================
# Enriquecimiento: epic names en stories
# ============================================================

def enrich_stories_from_traceability(content: str, stories: list):
    """Extrae nombres de Feature/Epic del texto de traceability y los asigna a stories."""
    # Buscar lineas como: **F1 — Gestion del Ciclo de Vida de Segmentos**
    feature_blocks = re.findall(
        r'\*\*(F\d+)\s*(?:—|--)\s*(.+?)\*\*', content
    )
    feature_names = {fid: fname.strip() for fid, fname in feature_blocks}

    # Buscar en traceability lineas como:
    # - E001-S001 (Entities & EF Core) -> ...
    epic_names = {}
    for m in re.finditer(r'-\s*(E\d+-S\d+)\s*\((.+?)\)', content):
        epic_names[m.group(1)] = m.group(2).strip()

    for s in stories:
        # Buscar nombre de epic
        suffix = re.search(r'E\d+-S\d+', s.story_id)
        if suffix:
            key = suffix.group(0)
            if key in epic_names and not s.epic_name:
                s.epic_name = epic_names[key]

# ============================================================
# API: Jira REST
# ============================================================

class JiraAPI:
    def __init__(self, config: dict):
        self.base = config['jira_base_url']
        self.email = config['jira_user_email']
        self.token = config['jira_api_token']
        self.project = config['jira_project_key']

    def _headers(self):
        import base64
        creds = base64.b64encode(f'{self.email}:{self.token}'.encode()).decode()
        return {
            'Authorization': f'Basic {creds}',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }

    def search_issues(self, jql: str) -> list:
        """Busca issues por JQL. Retorna lista de issues."""
        import urllib.request
        payload = {'jql': jql, 'maxResults': 50, 'fields': ['summary', 'key']}
        data = json.dumps(payload).encode()
        req = urllib.request.Request(
            f'{self.base}/rest/api/3/search',
            data=data,
            headers=self._headers(),
            method='POST',
        )
        try:
            with urllib.request.urlopen(req) as res:
                result = json.loads(res.read())
                return result.get('issues', [])
        except Exception:
            return []

    def create_issue(self, summary, description, issue_type_id, priority='Media', labels=None):
        """Crea un issue en Jira y retorna el ID y key."""
        import urllib.request
        payload = {
            'fields': {
                'project': {'key': self.project},
                'summary': summary[:255],
                'description': {
                    'type': 'doc', 'version': 1,
                    'content': [{'type': 'paragraph', 'content': [{'type': 'text', 'text': description}]}]
                },
                'issuetype': {'id': issue_type_id},
                'priority': {'name': priority},
                'timetracking': {'originalEstimate': '1h'},
            }
        }
        if labels:
            payload['fields']['labels'] = labels

        data = json.dumps(payload).encode()
        req = urllib.request.Request(
            f'{self.base}/rest/api/3/issue',
            data=data,
            headers=self._headers(),
            method='POST',
        )
        with urllib.request.urlopen(req) as res:
            result = json.loads(res.read())
            return result.get('id'), result.get('key')

    def create_link(self, inward_key, outward_key, link_type='Tests'):
        """Crea un link entre issues (ej: TC 'tests' Requirement)."""
        import urllib.request
        payload = {
            'type': {'name': link_type},
            'inwardIssue': {'key': inward_key},
            'outwardIssue': {'key': outward_key},
        }
        data = json.dumps(payload).encode()
        req = urllib.request.Request(
            f'{self.base}/rest/api/3/issueLink',
            data=data,
            headers=self._headers(),
            method='POST',
        )
        urllib.request.urlopen(req)


# ============================================================
# API: AgileTest
# ============================================================

class AgileTestAPI:
    """Cliente para AgileTest REST API (DevSamurai).
    Documentacion: https://jira.agiletest.app/api-docs/
    IMPORTANTE: Todos los IDs en payloads deben ser STRINGS, no ints.
    """

    def __init__(self, config: dict):
        self.base = config['agiletest_base_url']
        self.client_id = config['agiletest_client_id']
        self.client_secret = config['agiletest_client_secret']
        self.project_id = str(config['agiletest_project_id'])
        self.token = None

    def authenticate(self):
        """Obtiene JWT token via POST /api/apikeys/authenticate."""
        import urllib.request
        data = json.dumps({
            'clientId': self.client_id,
            'clientSecret': self.client_secret,
        }).encode()
        req = urllib.request.Request(
            f'{self.base}/api/apikeys/authenticate',
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST',
        )
        with urllib.request.urlopen(req) as res:
            self.token = res.read().decode().strip().strip('"')
        return self.token is not None

    def _headers(self):
        return {
            'Authorization': f'JWT {self.token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }

    def _api_call(self, method, path, payload=None):
        """Helper generico para llamadas a la API. Retorna parsed JSON o None."""
        import urllib.request
        url = f'{self.base}{path}'
        data = json.dumps(payload).encode() if payload else None
        try:
            req = urllib.request.Request(url, data=data, headers=self._headers(), method=method)
            with urllib.request.urlopen(req) as res:
                return json.loads(res.read())
        except Exception as e:
            safe_print(f'  [WARN] {method} {path}: {e}')
            return None

    # ── Registro de entidades (sincroniza Jira → AgileTest) ──

    def register_test_cases(self, jira_issue_ids):
        """POST /ds/test-cases/bulk — Registra TCs en AgileTest."""
        result = self._api_call('POST', '/ds/test-cases/bulk', {
            'testCaseIssueIds': [str(tid) for tid in jira_issue_ids],
            'projectId': self.project_id,
        })
        return result

    def register_test_plans(self, jira_issue_ids):
        """POST /ds/test-plans — Registra Plans en AgileTest."""
        return self._api_call('POST', '/ds/test-plans', {
            'testPlanIssueIds': [str(tid) for tid in jira_issue_ids],
            'projectId': self.project_id,
        })

    def register_test_executions(self, jira_issue_ids):
        """POST /ds/test-executions — Registra Executions en AgileTest."""
        return self._api_call('POST', '/ds/test-executions', {
            'testExecutionIssueIds': [str(tid) for tid in jira_issue_ids],
            'projectId': self.project_id,
        })

    # ── Lookup por issue IDs ──

    def get_test_cases_by_issue_ids(self, jira_issue_ids):
        """POST /ds/test-cases/issue/bulk — Obtiene TCs por Jira issue IDs."""
        result = self._api_call('POST', '/ds/test-cases/issue/bulk', {
            'projectId': self.project_id,
            'issueIds': [str(tid) for tid in jira_issue_ids],
        })
        return result if isinstance(result, list) else []

    def get_plans_by_issue_ids(self, jira_issue_ids):
        """POST /ds/test-plans/issue/bulk — Obtiene Plans por Jira issue IDs."""
        result = self._api_call('POST', '/ds/test-plans/issue/bulk', {
            'projectId': self.project_id,
            'testPlanIssueIds': [str(tid) for tid in jira_issue_ids],
        })
        return result if isinstance(result, list) else []

    def get_plan_by_issue_id(self, jira_issue_id):
        """Busca un plan en la lista completa del proyecto."""
        plans = self._api_call('GET',
            f'/ds/test-plans?projectId={self.project_id}&timezone=America/Bogota')
        if isinstance(plans, list):
            for p in plans:
                if str(p.get('issueId')) == str(jira_issue_id):
                    return p
        return None

    def get_plan_executions(self, plan_internal_id):
        """GET /ds/test-plans/{id}/test-executions."""
        result = self._api_call('GET',
            f'/ds/test-plans/{plan_internal_id}/test-executions'
            f'?projectId={self.project_id}&timezone=America/Bogota')
        return result if isinstance(result, list) else []

    # ── Link entidades ──

    def link_test_cases_to_plan(self, plan_internal_id, tc_jira_issue_ids):
        """POST /ds/test-plans/{id}/link/test-cases."""
        return self._api_call('POST',
            f'/ds/test-plans/{plan_internal_id}/link/test-cases', {
                'testCaseIssueIds': [str(tid) for tid in tc_jira_issue_ids],
                'projectId': self.project_id,
            })

    def link_test_cases_to_execution(self, exec_internal_id, tc_jira_issue_ids):
        """POST /ds/test-executions/{id}/link/test-cases."""
        return self._api_call('POST',
            f'/ds/test-executions/{exec_internal_id}/link/test-cases', {
                'testCaseIssueIds': [str(tid) for tid in tc_jira_issue_ids],
                'projectId': self.project_id,
            })

    def link_execution_to_plan(self, plan_internal_id, exec_jira_issue_ids):
        """POST /ds/test-plans/{id}/link/test-executions."""
        return self._api_call('POST',
            f'/ds/test-plans/{plan_internal_id}/link/test-executions', {
                'testExecutionIssueIds': [str(tid) for tid in exec_jira_issue_ids],
                'projectId': self.project_id,
            })

    # ── Steps ──

    def create_step(self, tc_internal_id, action, expected_result, data='', step_index=-1):
        """POST /ds/test-steps — Crea un step individual."""
        return self._api_call('POST', '/ds/test-steps', {
            'testCaseId': tc_internal_id,
            'projectId': self.project_id,
            'action': action,
            'data': data,
            'expectedResult': expected_result,
            'details': {},
            'stepIndex': step_index,
        })


# ============================================================
# Estado local (idempotencia)
# ============================================================

def load_state(state_path: str) -> dict:
    """Carga estado previo de creacion."""
    if os.path.exists(state_path):
        with open(state_path, 'r', encoding='utf-8') as f:
            state = json.load(f)
            # Backward compat: agregar claves nuevas si no existen
            state.setdefault('stories', {})
            state.setdefault('story_ids', {})
            state.setdefault('test_cases', {})
            state.setdefault('tc_ids', {})
            state.setdefault('plans', {})
            state.setdefault('plan_ids', {})
            state.setdefault('executions', {})
            state.setdefault('execution_ids', {})
            return state
    return {
        'stories': {}, 'story_ids': {},
        'test_cases': {}, 'tc_ids': {},
        'plans': {}, 'plan_ids': {},
        'executions': {}, 'execution_ids': {},
    }


def save_state(state_path: str, state: dict):
    """Guarda estado de creacion."""
    with open(state_path, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)


# ============================================================
# Utilidades de output
# ============================================================

def safe_print(text):
    """Print con fallback para caracteres Unicode en Windows."""
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode('ascii', 'replace').decode('ascii'))


# ============================================================
# Helper: mapeo Plan -> TCs
# ============================================================

def build_plan_tc_map(test_cases):
    """Construye mapeo feat_key -> lista de TC IDs para asignar a Plans."""
    plan_tc_map = {}
    for tc in test_cases:
        if tc.feature:
            feat_key = tc.feature.split(' - ')[0].strip() if ' - ' in tc.feature else tc.feature
            plan_tc_map.setdefault(feat_key, []).append(tc.tc_id)
    return plan_tc_map


# ============================================================
# Orquestador — Display
# ============================================================

def print_summary(stories, test_cases, trace_map, facs, meta):
    """Muestra resumen del parseo."""
    safe_print('\n' + '=' * 70)
    safe_print(' BMAD V6.0 -> AgileTest -- Resumen del parseo')
    safe_print('=' * 70)

    safe_print(f'\n  Feature: {meta.get("feature", "?")}')
    safe_print(f'  Feature Code: {meta.get("feature_code", "?")}')

    # Stories por Epic
    epics = {}
    for s in stories:
        epics.setdefault(s.epic_id, []).append(s)

    bl_count = sum(1 for s in stories if s.risk_level == 'High')
    tn_count = len(stories) - bl_count

    safe_print(f'\n  STORIES (Seccion I - Gatekeeper)')
    safe_print(f'   Total: {len(epics)} epics, {len(stories)} stories ({bl_count} BL / {tn_count} TN)\n')
    for eid, ss in sorted(epics.items()):
        safe_print(f'   {eid}: ({len(ss)} stories)')
        for s in ss:
            marker = 'BL' if s.risk_level == 'High' else 'TN'
            safe_print(f'      [{marker}] {s.story_id}: {s.title[:55]}')

    # FACs
    safe_print(f'\n  FACs (Seccion II)')
    safe_print(f'   Total: {len(facs)} FAC scenarios parseados')

    # Test Cases por prioridad
    by_prio = {}
    for tc in test_cases:
        by_prio.setdefault(tc.priority, []).append(tc)

    safe_print(f'\n  TEST CASES (Seccion IV - Matriz 360)')
    safe_print(f'   Total: {len(test_cases)} test cases\n')
    for p in ['P0', 'P1', 'P2', 'P3']:
        tcs = by_prio.get(p, [])
        safe_print(f'   {p} ({CONFIG["priority_map"].get(p, "?")}): {len(tcs)} test cases')

    # Steps
    total_steps = sum(len(tc.steps) for tc in test_cases)
    avg_steps = total_steps / len(test_cases) if test_cases else 0
    safe_print(f'\n   Total steps: {total_steps} (promedio {avg_steps:.1f} por TC)')

    # TCs con story vinculada
    linked = sum(1 for tc in test_cases if tc.source_stories)
    safe_print(f'   TCs con story vinculada: {linked}/{len(test_cases)} ({100*linked//max(len(test_cases),1)}%)')

    # Test Cases por nivel
    by_level = {}
    for tc in test_cases:
        by_level.setdefault(tc.level, []).append(tc)
    safe_print(f'\n   Por nivel:')
    for lvl, tcs in sorted(by_level.items()):
        safe_print(f'      {lvl}: {len(tcs)}')

    # Traceability
    safe_print(f'\n  TRACEABILITY (Apendice)')
    safe_print(f'   Stories con TCs mapeados: {len(trace_map)}')
    total_links = sum(len(v) for v in trace_map.values())
    safe_print(f'   Total links Story->TC: {total_links}')

    # Plan -> TCs -> Execution preview
    plan_tc_map = build_plan_tc_map(test_cases)
    feature_label = meta.get('feature_code', 'BMAD').replace('-', '_')
    features_map = {}
    for tc in test_cases:
        if tc.feature:
            fk = tc.feature.split(' - ')[0].strip() if ' - ' in tc.feature else tc.feature
            features_map.setdefault(fk, tc.feature)

    safe_print(f'\n  PLANES Y EJECUCIONES (preview)')
    safe_print(f'   {len(features_map)} Plans de Prueba (PPR) + {len(features_map)} Planes de Ejecucion (PEP)\n')
    for fk in sorted(features_map.keys()):
        fname = features_map[fk]
        tc_ids = plan_tc_map.get(fk, [])
        safe_print(f'   PPR: {fname} -- {feature_label}')
        safe_print(f'      {len(tc_ids)} TCs: {", ".join(tc_ids[:5])}{"..." if len(tc_ids) > 5 else ""}')
        safe_print(f'      PEP: Ciclo 1 - {fname} -- {feature_label}')
        safe_print(f'         -> {len(tc_ids)} TCs listos para ejecutar (TODO)')

    safe_print('\n' + '=' * 70)


def print_detail(test_cases):
    """Muestra detalle de cada TC con steps."""
    safe_print('\n' + '=' * 70)
    safe_print(' DETALLE DE TEST CASES')
    safe_print('=' * 70)
    for tc in test_cases:
        prio_label = CONFIG['priority_map'].get(tc.priority, 'Medium')
        safe_print(f'\n  {tc.tc_id}: {tc.title[:70]}')
        safe_print(f'   Prioridad: {tc.priority} ({prio_label}) | Nivel: {tc.level} | Riesgo: {tc.risk_score}')
        if tc.source_stories:
            safe_print(f'   Stories: {", ".join(tc.source_stories)}')
        if tc.feature:
            safe_print(f'   Feature: {tc.feature} | Epicas: {tc.epics}')
        safe_print(f'   Steps ({len(tc.steps)}):')
        for i, s in enumerate(tc.steps, 1):
            action_short = s.action[:90] + ('...' if len(s.action) > 90 else '')
            expect_short = s.expected_result[:90] + ('...' if len(s.expected_result) > 90 else '')
            safe_print(f'      {i}. Action:   {action_short}')
            safe_print(f'         Expected: {expect_short}')


def export_json(stories, test_cases, trace_map, facs, meta, output_path):
    """Exporta datos parseados a JSON para referencia."""
    data = {
        'meta': {
            'feature': meta.get('feature', ''),
            'feature_code': meta.get('feature_code', ''),
            'total_stories': len(stories),
            'total_test_cases': len(test_cases),
            'total_facs': len(facs),
            'total_trace_links': sum(len(v) for v in trace_map.values()),
            'generated_at': time.strftime('%Y-%m-%d %H:%M:%S'),
        },
        'stories': [
            {
                'story_id': s.story_id, 'epic_id': s.epic_id,
                'epic_name': s.epic_name, 'title': s.title,
                'description': s.description, 'layer': s.layer,
                'classification': 'BL' if s.risk_level == 'High' else 'TN',
            }
            for s in stories
        ],
        'test_cases': [
            {
                'tc_id': tc.tc_id, 'title': tc.title,
                'priority': tc.priority, 'level': tc.level,
                'feature': tc.feature, 'epics': tc.epics,
                'technique': tc.technique, 'risk_score': tc.risk_score,
                'source_stories': tc.source_stories,
                'steps': [
                    {'action': s.action, 'expected_result': s.expected_result, 'data': s.data}
                    for s in tc.steps
                ],
            }
            for tc in test_cases
        ],
        'traceability': {k: v for k, v in trace_map.items()},
    }
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    safe_print(f'\n  JSON exportado: {output_path}')


# ============================================================
# Orquestador — Creacion en AgileTest
# ============================================================

def create_in_agiletest(stories, test_cases, trace_map, meta, config):
    """Crea requisitos, test cases, plans, executions y links en Jira/AgileTest.

    Flujo de 8 pasos:
      1. Crear Requirements (Stories BL → Tareas Jira)
      2. Crear Test Cases (Jira issue tipo Caso de Prueba)
      3. Crear Test Plans PPR + Test Executions PEP (Jira)
      4. Registrar Plans, Executions y TCs en AgileTest API
      5. Crear links Jira: TC → Requisito ('AgileTest'), TC → Plan ('Agile Test case')
      6. Asignar TCs a Plans via AgileTest API
      7. Asignar TCs a Executions via AgileTest API
      8. Agregar Steps a TCs via AgileTest API
    """
    jira = JiraAPI(config)
    at = AgileTestAPI(config)

    feature_label = meta.get('feature_code', 'BMAD').replace('-', '_')
    script_dir = os.path.dirname(os.path.abspath(__file__))
    state_path = os.path.join(script_dir, f'bmad_state_{feature_label}.json')
    state = load_state(state_path)

    safe_print('\n  Autenticando con AgileTest...')
    if not at.authenticate():
        safe_print('  ERROR: Autenticacion fallida con AgileTest')
        return
    safe_print('  Autenticado OK')

    # ── Paso 1: Crear Requirements (Stories BL como Tareas Jira) ──
    bl_stories = [s for s in stories if s.risk_level == 'High']
    safe_print(f'\n  [1/8] Creando {len(bl_stories)} requisitos en Jira...')
    for i, s in enumerate(bl_stories):
        if s.story_id in state['stories']:
            safe_print(f'   [{i+1}/{len(bl_stories)}] SKIP (existe): {state["stories"][s.story_id]}')
            continue
        summary = f'[{s.story_id}] {s.title}'
        desc = f'{s.description}\n\nEpic: {s.epic_id}\nLayer: {s.layer}'
        try:
            issue_id, issue_key = jira.create_issue(
                summary=summary,
                description=desc,
                issue_type_id=config['issue_type_task'],
                priority='Alta',
                labels=['BMAD', feature_label, s.epic_id],
            )
            state['stories'][s.story_id] = issue_key
            state['story_ids'][s.story_id] = issue_id
            safe_print(f'   [{i+1}/{len(bl_stories)}] {issue_key}: {summary[:55]}')
            time.sleep(0.3)
        except Exception as e:
            safe_print(f'   ERROR creando {s.story_id}: {e}')

    save_state(state_path, state)

    # ── Paso 2: Crear Test Cases ──
    safe_print(f'\n  [2/8] Creando {len(test_cases)} test cases en Jira...')
    for i, tc in enumerate(test_cases):
        if tc.tc_id in state['test_cases']:
            safe_print(f'   [{i+1}/{len(test_cases)}] SKIP (existe): {state["test_cases"][tc.tc_id]}')
            continue
        summary = f'[{tc.tc_id}] {tc.title}'
        prio = config['priority_map'].get(tc.priority, 'Media')
        desc = tc.raw_body
        try:
            issue_id, issue_key = jira.create_issue(
                summary=summary,
                description=desc,
                issue_type_id=config['issue_type_test_case'],
                priority=prio,
                labels=['BMAD', feature_label, tc.priority],
            )
            state['test_cases'][tc.tc_id] = issue_key
            state['tc_ids'][tc.tc_id] = issue_id
            safe_print(f'   [{i+1}/{len(test_cases)}] {issue_key}: {tc.tc_id} ({tc.priority})')
            time.sleep(0.3)
        except Exception as e:
            safe_print(f'   ERROR creando {tc.tc_id}: {e}')

    save_state(state_path, state)

    # ── Paso 3: Crear Test Plans (PPR) + Test Executions (PEP) por Feature ──
    features = {}
    for tc in test_cases:
        if tc.feature:
            feat_key = tc.feature.split(' - ')[0].strip() if ' - ' in tc.feature else tc.feature
            features.setdefault(feat_key, tc.feature)
    plan_tc_map = build_plan_tc_map(test_cases)

    safe_print(f'\n  [3/8] Creando {len(features)} plans + {len(features)} ejecuciones en Jira...')
    for feat_key, feat_name in sorted(features.items()):
        plan_label = f'{feature_label}_{feat_key}'
        # Plan de Pruebas (PPR)
        if plan_label not in state['plans']:
            summary = f'PPR: {feat_name} -- {feature_label}'
            try:
                plan_id, plan_key = jira.create_issue(
                    summary=summary,
                    description=f'Plan de pruebas para {feat_name}\nFeature: {meta.get("feature", "")}\nGenerado por BMAD->AgileTest',
                    issue_type_id=config['issue_type_test_plan'],
                    labels=['BMAD', feature_label, feat_key],
                )
                state['plans'][plan_label] = plan_key
                state['plan_ids'][plan_label] = plan_id
                safe_print(f'   PPR {plan_key}: {feat_name[:45]}')
                time.sleep(0.3)
            except Exception as e:
                safe_print(f'   ERROR plan {feat_key}: {e}')
        else:
            safe_print(f'   PPR SKIP: {state["plans"][plan_label]}')

        # Plan de Ejecucion (PEP)
        exec_label = f'{feature_label}_{feat_key}'
        if exec_label not in state['executions']:
            summary = f'PEP: Ciclo 1 - {feat_name} -- {feature_label}'
            try:
                exec_id, exec_key = jira.create_issue(
                    summary=summary,
                    description=(
                        f'Plan de Ejecucion - Ciclo 1\n'
                        f'Feature: {feat_name}\n'
                        f'Modulo: {meta.get("feature", "")}\n'
                        f'Generado por BMAD->AgileTest\n\n'
                        f'TCs incluidos: {len(plan_tc_map.get(feat_key, []))}'
                    ),
                    issue_type_id=config['issue_type_test_execution'],
                    labels=['BMAD', feature_label, feat_key, 'Ciclo-1'],
                )
                state['executions'][exec_label] = exec_key
                state['execution_ids'][exec_label] = exec_id
                safe_print(f'   PEP {exec_key}: Ciclo 1 - {feat_name[:35]}')
                time.sleep(0.3)
            except Exception as e:
                safe_print(f'   ERROR ejecucion {feat_key}: {e}')
        else:
            safe_print(f'   PEP SKIP: {state["executions"][exec_label]}')

    save_state(state_path, state)

    # ── Paso 4: Registrar entidades en AgileTest API ──
    safe_print(f'\n  [4/8] Registrando entidades en AgileTest...')

    # 4a. Registrar TCs (POST /ds/test-cases/bulk)
    all_tc_jira_ids = [jid for jid in state.get('tc_ids', {}).values() if jid]
    if all_tc_jira_ids:
        result = at.register_test_cases(all_tc_jira_ids)
        if result:
            safe_print(f'   {len(all_tc_jira_ids)} TCs registrados en AgileTest')
        else:
            safe_print(f'   WARN: TCs no se pudieron registrar')

    # 4b. Registrar Plans (POST /ds/test-plans)
    plan_jira_ids = [jid for jid in state.get('plan_ids', {}).values() if jid]
    if plan_jira_ids:
        result = at.register_test_plans(plan_jira_ids)
        if result:
            safe_print(f'   {len(plan_jira_ids)} Plans registrados en AgileTest')
        else:
            safe_print(f'   WARN: Plans no se pudieron registrar')

    # 4c. Registrar Executions (POST /ds/test-executions)
    exec_jira_ids = [jid for jid in state.get('execution_ids', {}).values() if jid]
    if exec_jira_ids:
        result = at.register_test_executions(exec_jira_ids)
        if result:
            safe_print(f'   {len(exec_jira_ids)} Executions registrados en AgileTest')
        else:
            safe_print(f'   WARN: Executions no se pudieron registrar')

    # ── Paso 5: Crear links Jira ──
    safe_print(f'\n  [5/8] Creando links en Jira...')
    links_created = 0

    # 5a. TC → Requisito (link type: "AgileTest" — outward="tests", inward="is tested by")
    for story_id, tc_ids in trace_map.items():
        if story_id not in state['stories']:
            continue
        req_key = state['stories'][story_id]
        for tc_id in tc_ids:
            if tc_id not in state['test_cases']:
                continue
            tc_key = state['test_cases'][tc_id]
            try:
                # TC "tests" Requirement: outward=TC, inward=Requirement
                jira.create_link(req_key, tc_key, 'AgileTest')
                links_created += 1
                time.sleep(0.1)
            except Exception as e:
                safe_print(f'   WARN Link {tc_id} -> {story_id}: {e}')
    safe_print(f'   Links TC->Requisito: {links_created}')

    # 5b. TC → Plan (link type: "Agile Test case")
    plan_links = 0
    for feat_key in sorted(plan_tc_map.keys()):
        plan_label = f'{feature_label}_{feat_key}'
        plan_key = state.get('plans', {}).get(plan_label)
        if not plan_key:
            continue
        for tc_id in plan_tc_map[feat_key]:
            tc_key = state.get('test_cases', {}).get(tc_id)
            if not tc_key:
                continue
            try:
                jira.create_link(tc_key, plan_key, 'Agile Test case')
                plan_links += 1
                time.sleep(0.1)
            except Exception as e:
                safe_print(f'   WARN Link {tc_id} -> Plan: {e}')
    safe_print(f'   Links TC->Plan: {plan_links}')

    # 5c. TC → Execution (link type: "Agile Test case")
    exec_links = 0
    for feat_key in sorted(plan_tc_map.keys()):
        exec_label = f'{feature_label}_{feat_key}'
        exec_key = state.get('executions', {}).get(exec_label)
        if not exec_key:
            continue
        for tc_id in plan_tc_map[feat_key]:
            tc_key = state.get('test_cases', {}).get(tc_id)
            if not tc_key:
                continue
            try:
                jira.create_link(tc_key, exec_key, 'Agile Test case')
                exec_links += 1
                time.sleep(0.1)
            except Exception as e:
                safe_print(f'   WARN Link {tc_id} -> Exec: {e}')
    safe_print(f'   Links TC->Execution: {exec_links}')

    save_state(state_path, state)

    # ── Paso 6: Agregar Steps a TCs (ANTES de vincular a Executions) ──
    safe_print(f'\n  [6/8] Agregando steps a test cases...')
    # Obtener internal IDs de todos los TCs de una sola vez
    tc_internal_map = {}  # jira_issue_id -> agiletest_internal_id
    all_tc_jira_ids = [jid for jid in state.get('tc_ids', {}).values() if jid]
    if all_tc_jira_ids:
        at_tcs = at.get_test_cases_by_issue_ids(all_tc_jira_ids)
        for at_tc in at_tcs:
            tc_internal_map[str(at_tc.get('issueId'))] = at_tc.get('id')
    safe_print(f'   {len(tc_internal_map)}/{len(all_tc_jira_ids)} TCs encontrados en AgileTest')

    steps_ok = 0
    for tc in test_cases:
        tc_jira_id = state.get('tc_ids', {}).get(tc.tc_id)
        if not tc_jira_id or not tc.steps:
            continue
        tc_internal_id = tc_internal_map.get(str(tc_jira_id))
        if not tc_internal_id:
            continue
        all_ok = True
        for i, step in enumerate(tc.steps):
            result = at.create_step(
                tc_internal_id,
                action=step.action,
                expected_result=step.expected_result,
                data=step.data or '',
                step_index=i,
            )
            if not result:
                all_ok = False
            time.sleep(0.1)
        if all_ok:
            steps_ok += 1
            safe_print(f'   {tc.tc_id}: {len(tc.steps)} steps OK')
    safe_print(f'   TCs con steps creados: {steps_ok}/{len(test_cases)}')

    # ── Paso 7: Link TCs a Plans y Executions via AgileTest API ──
    # (DESPUES de steps para que el snapshot de la Execution incluya los steps)
    safe_print(f'\n  [7/8] Vinculando TCs a Plans/Executions en AgileTest...')
    plans_assigned = 0
    execs_assigned = 0
    for feat_key in sorted(plan_tc_map.keys()):
        plan_label = f'{feature_label}_{feat_key}'
        exec_label = f'{feature_label}_{feat_key}'
        plan_jira_id = state.get('plan_ids', {}).get(plan_label)
        exec_jira_id_val = state.get('execution_ids', {}).get(exec_label)
        tc_issue_ids = [state['tc_ids'][tid] for tid in plan_tc_map[feat_key]
                        if tid in state.get('tc_ids', {})]
        if not tc_issue_ids:
            continue

        # Buscar plan internal ID
        if plan_jira_id:
            at_plan = at.get_plan_by_issue_id(plan_jira_id)
            if at_plan and at_plan.get('id'):
                plan_internal_id = at_plan['id']
                # Link TCs al Plan
                result = at.link_test_cases_to_plan(plan_internal_id, tc_issue_ids)
                if result:
                    plans_assigned += 1
                    safe_print(f'   {state["plans"][plan_label]}: {len(tc_issue_ids)} TCs -> plan')

                # Link Execution al Plan
                if exec_jira_id_val:
                    at.link_execution_to_plan(plan_internal_id, [exec_jira_id_val])

                # Buscar execution internal ID (via el plan)
                if exec_jira_id_val:
                    plan_execs = at.get_plan_executions(plan_internal_id)
                    for ex in plan_execs:
                        if str(ex.get('issueId')) == str(exec_jira_id_val):
                            exec_internal_id = ex['id']
                            result = at.link_test_cases_to_execution(exec_internal_id, tc_issue_ids)
                            if result:
                                execs_assigned += 1
                                safe_print(f'   {state["executions"][exec_label]}: {len(tc_issue_ids)} TCs -> exec')
                            break
            else:
                safe_print(f'   WARN {feat_key}: plan no encontrado en AgileTest')
        time.sleep(0.3)
    safe_print(f'   Plans con TCs: {plans_assigned}/{len(plan_tc_map)}')
    safe_print(f'   Executions con TCs: {execs_assigned}/{len(plan_tc_map)}')

    save_state(state_path, state)

    # ── Paso 8: Resumen Final ──
    safe_print(f'\n  {"=" * 55}')
    safe_print(f'  PROCESO COMPLETADO')
    safe_print(f'  {"=" * 55}')
    safe_print(f'   Requisitos creados:       {len(state["stories"])}')
    safe_print(f'   Test Cases creados:       {len(state["test_cases"])}')
    safe_print(f'   Test Plans (PPR):         {len(state["plans"])}')
    safe_print(f'   Ejecuciones (PEP):        {len(state["executions"])}')
    safe_print(f'   Links Jira TC->Req:       {links_created}')
    safe_print(f'   Links Jira TC->Plan:      {plan_links}')
    safe_print(f'   Links Jira TC->Exec:      {exec_links}')
    safe_print(f'   Plans con TCs (AgileTest): {plans_assigned}')
    safe_print(f'   Execs con TCs (AgileTest): {execs_assigned}')
    safe_print(f'   TCs con Steps (AgileTest): {steps_ok}')
    safe_print(f'   Estado guardado en:       {state_path}')
    safe_print(f'\n  Para el dashboard Forge, use:')
    plan_keys = [v for v in state['plans'].values()]
    exec_keys = [v for v in state['executions'].values()]
    if plan_keys:
        safe_print(f'   planKeys: {", ".join(plan_keys)}')
    if exec_keys:
        safe_print(f'   execKeys: {", ".join(exec_keys)}')


# ============================================================
# Main
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description='BMAD V6.0 -> AgileTest: Parser + Cargador',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  python bmad_to_agiletest.py --dry-run                    Parsea y muestra resumen
  python bmad_to_agiletest.py --dry-run --detail            Muestra cada TC con steps
  python bmad_to_agiletest.py --dry-run --export            Exporta a JSON
  python bmad_to_agiletest.py --input mi-archivo.md --dry-run
  python bmad_to_agiletest.py --create                      Crea todo en Jira/AgileTest
        """,
    )
    parser.add_argument('--dry-run', action='store_true', help='Solo parsear, no crear')
    parser.add_argument('--create', action='store_true', help='Crear en Jira/AgileTest')
    parser.add_argument('--detail', action='store_true', help='Mostrar detalle de TCs')
    parser.add_argument('--export', action='store_true', help='Exportar a JSON')
    parser.add_argument('--pilot', action='store_true',
                        help='Modo piloto: solo procesa F4-Events (4 TCs) para validar el flujo')
    parser.add_argument('--feature-filter', default=None,
                        help='Filtrar por feature key (ej: F4, F1). Solo procesa TCs de esa feature')
    parser.add_argument('--input', default=CONFIG['input_file'],
                        help='Ruta al archivo bmad-v6-*-test-design.md')

    args = parser.parse_args()

    # Resolver ruta
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, args.input) if not os.path.isabs(args.input) else args.input

    if not os.path.exists(input_path):
        print(f'  ERROR: Archivo no encontrado: {input_path}')
        sys.exit(1)

    # Leer archivo completo
    print(f'Parseando: {os.path.basename(input_path)}')
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Parsear metadata
    meta = parse_metadata(content)
    feature_code = meta.get('feature_code', 'UNKNOWN')
    print(f'  Feature: {meta.get("feature", "?")} ({feature_code})')

    # Parsear todas las secciones
    stories = parse_stories(content, feature_code)
    facs = parse_facs(content)
    test_cases = parse_test_cases(content)
    trace_map = parse_traceability(content, feature_code)

    # Enriquecer datos cruzados
    enrich_test_cases(test_cases, trace_map, facs, feature_code)
    enrich_stories_from_traceability(content, stories)

    # Filtrado por feature (--pilot usa F4, --feature-filter usa lo indicado)
    feat_filter = None
    if args.pilot:
        feat_filter = 'F4'
        safe_print(f'\n  MODO PILOTO: filtrando solo Feature F4 (Events)')
    elif args.feature_filter:
        feat_filter = args.feature_filter
        safe_print(f'\n  FILTRO: solo Feature {feat_filter}')

    if feat_filter:
        test_cases = [tc for tc in test_cases if tc.feature and
                      tc.feature.split(' - ')[0].strip() == feat_filter]
        # Filtrar stories a solo las vinculadas a TCs restantes
        linked_stories = set()
        for tc in test_cases:
            linked_stories.update(tc.source_stories)
        stories = [s for s in stories if s.story_id in linked_stories]
        # Filtrar trace_map
        remaining_tc_ids = {tc.tc_id for tc in test_cases}
        trace_map = {
            sid: [tid for tid in tids if tid in remaining_tc_ids]
            for sid, tids in trace_map.items()
        }
        trace_map = {k: v for k, v in trace_map.items() if v}
        safe_print(f'  Filtrado: {len(stories)} stories, {len(test_cases)} TCs, {len(trace_map)} trace links')

    # Mostrar resumen
    print_summary(stories, test_cases, trace_map, facs, meta)

    if args.detail:
        print_detail(test_cases)

    if args.export or args.dry_run:
        json_path = os.path.join(script_dir, 'bmad_parsed_data.json')
        export_json(stories, test_cases, trace_map, facs, meta, json_path)

    if args.create:
        if not CONFIG['jira_user_email'] or not CONFIG['jira_api_token']:
            print('\n  ERROR: Configure jira_user_email y jira_api_token en CONFIG')
            sys.exit(1)
        if not CONFIG['agiletest_client_id'] or not CONFIG['agiletest_client_secret']:
            print('\n  ERROR: Configure agiletest_client_id y agiletest_client_secret en CONFIG')
            sys.exit(1)
        create_in_agiletest(stories, test_cases, trace_map, meta, CONFIG)

    if not args.dry_run and not args.create:
        print('\nUse --dry-run para parsear o --create para crear en Jira/AgileTest')


if __name__ == '__main__':
    main()
