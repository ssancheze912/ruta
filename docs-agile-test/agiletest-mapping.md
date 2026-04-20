# AgileTest Integration Guide — BMAD → AgileTest

> Documento complementario a `epics.md`, `test-design.md` y `global-test-strategy.md`.
> Define cómo los artefactos generados por BMAD aterrizan en AgileTest (DevSamurai).
>
> **Versión:** 1.0 — 29 de marzo de 2026
> **Autor:** Juan Manuel Reina Montoya — Líder QA, SIESA

---

## 1. Mapeo de Entidades BMAD → AgileTest

| Artefacto BMAD | Entidad AgileTest | typeId | Relación |
|----------------|-------------------|--------|----------|
| Story (epics.md) | Requisito (Tarea Jira) | 10013 | 1 Story = 1 Requisito |
| Test Case (test-design.md) | Caso de Prueba con Steps | 10029 | 1 TC BMAD = 1 TC AgileTest |
| Given/When/Then (FACs) | Pasos de prueba (Action / Expected Result) | — | Cada bloque Gherkin = 1 Step |
| Prioridad P0/P1/P2/P3 | Priority en Test Case | — | P0=Highest, P1=High, P2=Medium, P3=Low |
| Epic (epics.md) | Plan de Pruebas | 10026 | 1 Epic = 1 Plan (o por tipo de validación) |
| Risk Assessment (P×I) | Criterios de priorización en Test Plan | — | Score ≥6 = cobertura exhaustiva |
| Archetype Blind Spots | Test Cases adicionales de seguridad/edge | 10029 | 1 Blind Spot = 1 TC extra |

### Ejemplo concreto

```
BMAD (test-design.md):
  TC-P0-007: Override COALESCE — NULL inherits base IsActive
    Given Country has IsActive = true
    And CountryOverride for Company A has IsActive = NULL
    When GET /countries/{id} with X-Company-Id: {CompanyA}
    Then response.IsActive = true (inherited from base)

AgileTest:
  Summary:     TC-P0-007: Override COALESCE — NULL inherits base IsActive
  Priority:    Highest (P0)
  Requirement: BASE-SRVENT-E002-S005 (Override Pattern)
  Step 1 — Action:   Crear Country con IsActive = true
  Step 1 — Expected: Country creado exitosamente
  Step 2 — Action:   Crear CountryOverride para Company A con IsActive = NULL
  Step 2 — Expected: Override creado, IsActive queda NULL
  Step 3 — Action:   GET /countries/{id} con header X-Company-Id: CompanyA
  Step 3 — Expected: response.IsActive = true (COALESCE: NULL hereda del base)
```

---

## 2. Cardinalidades

```
Requisito (Tarea)
  │
  ├── 1 → N ── Plan de Pruebas (funcional, regresión, no funcional)
  │              │
  │              ├── 1 → N ── Caso de Prueba (feliz, triste, límite, seguridad, performance)
  │              │
  │              └── 1 → N ── Plan de Ejecución (ciclo 1, re-test, regresión post-fix)
  │                             │
  │                             └── 1 → N ── Resultado por TC (PASS / FAIL / TODO)
```

| Relación | Card. | Descripción |
|----------|-------|-------------|
| Requisito → Plan de Pruebas | 1 → N | Un requisito puede tener varios planes: funcional, regresión, no funcional |
| Plan de Pruebas → Caso de Prueba | 1 → N | Un plan agrupa múltiples TCs: camino feliz, triste, límite, regresión, seguridad, performance |
| Plan de Pruebas → Plan de Ejecución | 1 → N | Una sola ejecución cubre todos los TCs del plan; el "N" son re-ejecuciones |
| Plan de Ejecución → Resultado por TC | 1 → N | Cada TC dentro de la ejecución registra su PASS/FAIL/TODO individual |

**Importante:** Una sola ejecución evalúa TODOS los TCs del plan simultáneamente. No se necesita una ejecución por cada TC. Las múltiples ejecuciones son para re-test tras fixes, validación en otro ambiente, o regresión pre-release.

---

## 3. Reglas de Vinculación

### Regla 1: Requisito → Planes de Prueba (1 → N)
Cada Requisito debe tener al menos 1 Plan de Pruebas vinculado. Un mismo requisito puede agrupar planes por tipo de validación: funcional, regresión, no funcional (performance, seguridad).

### Regla 2: Plan de Pruebas → Casos de Prueba (1 → N)
Cada Plan agrupa múltiples TCs que cubren distintos escenarios: camino feliz, camino triste, casos límite, regresión, seguridad y performance. Un TC no asociado a ningún plan no será ejecutado ni contabilizado.

### Regla 3: Plan de Pruebas → Plan de Ejecución (1 → N)
Cada Plan debe tener al menos 1 Ejecución creada. Una ejecución cubre todos los TCs del plan. Las múltiples ejecuciones se justifican para:
- **Ciclo 2:** re-test tras corrección de defectos
- **Otro ambiente:** validación en QA Beta → Test Delivery
- **Regresión post-fix:** corrida final pre-release

### Regla 4: Plan de Ejecución → Resultado por TC (1 → N)
Cada TC dentro de la ejecución registra su resultado individual:
- `15017` = PASS
- `15018` = FAIL
- `15016` = TODO
- `null` = SIN RESULTADO

---

## 4. Configuración del Dashboard (Informe QA Live)

El dashboard Forge en Confluence requiere dos campos de configuración separados:

| Campo | Contenido | Formato | Ejemplo |
|-------|-----------|---------|---------|
| `planKeys` | Keys de Planes de Pruebas (PPR) | HCM-XXXX separados por coma | HCM-1332, HCM-1520 |
| `execKeys` | Keys de Planes de Ejecución (PEP) | HCM-XXXX separados por coma | HCM-1348, HCM-1522 |

### Nomenclatura recomendada

| Prefijo | Tipo | Ejemplo |
|---------|------|---------|
| PPR | Plan de Pruebas | PPR: Regresión Sprint Mar1 — HCM |
| PEP | Plan de Ejecución | PEP: Ejecución Sprint Mar1 — HCM |
| TC | Caso de Prueba | TC: Validar cálculo nómina mensual |
| REQ | Requisito | REQ: MVP Sprint Mar1 — Liquidación |

### Checklist pre-generación

- [ ] Cada Requisito tiene al menos 1 TC vinculado
- [ ] Cada TC está asociado a un Plan de Pruebas
- [ ] Cada Plan tiene al menos 1 Ejecución creada
- [ ] Cada Ejecución tiene TCs con resultado (PASS/FAIL/TODO)
- [ ] `planKeys` configurados con keys de tipo PPR
- [ ] `execKeys` configurados con keys de tipo PEP
- [ ] No hay planes clonados activos que dupliquen conteos

---

## 5. Script de Automatización

**Script:** `bmad_to_agiletest.py`

```bash
# Vista previa sin crear nada
python bmad_to_agiletest.py --dry-run

# Ver detalle del parseo
python bmad_to_agiletest.py --detail

# Exportar datos parseados a JSON
python bmad_to_agiletest.py --export

# Crear entidades en AgileTest (producción)
python bmad_to_agiletest.py --create
```

### Flujo de automatización

```
epics.md ──────────┐
                    ├──► bmad_to_agiletest.py ──► AgileTest API ──► Dashboard Forge
test-design.md ────┤                                                    │
                    │                                                    ▼
agiletest-mapping.md ◄── (este documento: reglas y configuración)   Informe QA Live
```

### APIs utilizadas

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/api/apikeys/authenticate` | POST | Obtener JWT token |
| `/ds/test-cases/search` | POST | Buscar/crear test cases |
| `/ds/test-plans?projectId=X` | GET | Listar planes de prueba |
| `/ds/test-plans/{id}/test-cases` | GET | TCs vinculados a un plan |
| `/ds/test-plans/{id}/test-executions` | GET | Ejecuciones de un plan |
| `/ds/test-executions/{id}/test-cases` | GET | Resultados por TC |
| `/ds/test-cases/{id}/steps` | GET | Pasos de un test case |
| `/rest/api/3/search/jql` | POST | Búsqueda Jira (requisitos) |

---

## 6. Lecciones Aprendidas (Resumen)

| # | Lección | Impacto |
|---|---------|---------|
| L1 | issueId mismatch entre planes viejos (16K) y nuevos (68K) | No se puede filtrar ejecuciones por TC directamente |
| L2 | Planes sin ejecución muestran "—" en dashboard | Crear ejecución ANTES de generar informe |
| L3 | Mezclar tipos de keys en un solo campo distorsiona métricas | Separar planKeys y execKeys siempre |
| L4 | Issues AgileTest no aparecen en JQL estándar | Usar API dedicada de AgileTest (JWT) |
| L5 | Clonación de planes duplica conteo de TCs | Excluir plan original al clonar |
| L6 | Name matching por similitud es frágil | Usar issueId/issueKey como fuente de verdad |

> Documento detallado: `Lecciones Aprendidas - AgileTest Integracion Dashboard QA.docx`

---

## 7. Relación con otros documentos BMAD

| Documento | Rol | Lee AgileTest? |
|-----------|-----|----------------|
| `epics.md` | Define QUÉ construir (epics, stories) | No — es input para crear Requisitos |
| `test-design.md` | Define CÓMO probar (TCs, Gherkin, riesgos) | No — es input para crear TCs y Steps |
| `global-test-strategy.md` | Define la estrategia (pirámide, gates) | No — es referencia para priorización |
| **`agiletest-mapping.md`** (este) | Define CÓMO aterrizar los artefactos en AgileTest | **Sí — es el puente entre BMAD y la herramienta** |

---

*"O ganamos todos, o perdemos todos" — y con este mapeo, ganamos todos.*
