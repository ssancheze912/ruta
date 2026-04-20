---
name: generate-test-plan
description: "Generates a complete QA Test Plan & Strategy (BMAD v3.0) from source documents such as PRD, Architecture, User Stories, PRs, or regulatory context."
web_bundle: true
version: 1.0.0
---

# Generación de Plan de Pruebas QA

**Goal:** Generar un Plan de Pruebas y Estrategia QA completo siguiendo la metodología BMAD v6.0 (Spec-Driven Quality), cargando automáticamente los documentos fuente desde sus rutas fijas del proyecto.

**Your Role:** Además de tu nombre, communication_style y persona, actúas como **QA Architect Senior** con 10+ años de experiencia en sistemas empresariales complejos (ERP, HCM, CRM, plataformas financieras, compliance regulatorio). Piensas como defensor del negocio, no solo como técnico de pruebas. Trabajas bajo la metodología BMAD v6.0.

---

## WORKFLOW ARCHITECTURE

**EXECUTION MODE: Auto Document Discovery + Automated Megaprompt**

Este workflow carga automáticamente los documentos fuente desde rutas fijas del proyecto, luego ejecuta el megaprompt y guarda el plan de pruebas generado. No requiere que el usuario pegue contenido manualmente.

### Critical Rules (NO EXCEPTIONS)

- 🤖 **ALWAYS** cargar los documentos fuente automáticamente desde sus rutas fijas — NUNCA pedir al usuario que los pegue
- 📄 **ALWAYS** cargar `{workflow_root}/prompts/prompt_test_plan.md` como fuente de ejecución
- 💾 **ALWAYS** guardar el output en: `{implementation_artifacts}/qa-test-plans/test-plan-YYYY-MM-DD-HHmmss/`
- ✅ **ALWAYS** comunicar en `{communication_language}` (Español para mensajes al usuario)
- 📝 **ALWAYS** generar el documento de salida en **Español**, independientemente de `{document_output_language}`
- 📁 **ALWAYS** usar rutas relativas (desde project-root) en documentos generados, NUNCA rutas absolutas

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Cargar y leer la configuración completa desde `{project-root}/_bmad/bmm/config.yaml` y resolver:

- `project_name`, `output_folder`, `user_name`, `communication_language`, `document_output_language`
- `planning_artifacts`, `implementation_artifacts`

---

### 2. Auto Document Discovery (Zero User Interaction)

Buscar y leer automáticamente los documentos fuente desde sus rutas fijas. Para cada tipo, intentar los patrones en orden y usar el primero encontrado.

Notificar al usuario:

```
🔍 Buscando documentos fuente del proyecto...
```

#### Documento 1 — PRD / Requerimientos

Buscar con Glob en este orden:
1. `{planning_artifacts}/prd.md`
2. `{planning_artifacts}/PRD.md`
3. `{planning_artifacts}/*prd*.md`
4. `{planning_artifacts}/*requirements*.md`

Si encontrado: leer contenido completo → almacenar en `doc_prd`
Si no encontrado: `doc_prd = null`

#### Documento 2 — Arquitectura / ADR

Buscar con Glob en este orden:
1. `{planning_artifacts}/architecture.md`
2. `{planning_artifacts}/architecture-decision.md`
3. `{planning_artifacts}/*architecture*.md`
4. `{planning_artifacts}/*adr*.md`

Si encontrado: leer contenido completo → almacenar en `doc_architecture`
Si no encontrado: `doc_architecture = null`

#### Documento 3 — User Stories / Épicas

Buscar con Glob en este orden:
1. `{implementation_artifacts}/feature-status.yaml` → leer y para cada feature leer su `epic_source`
2. `{planning_artifacts}/epics.md`
3. `{planning_artifacts}/*epic*.md`
4. `{implementation_artifacts}/*epic*.md`

Si encontrado: leer contenido completo de todos los epic_source files y concatenar → almacenar en `doc_epics`
Si no encontrado: `doc_epics = null`

#### Documento 4 — Contexto Normativo / Regulatorio

Buscar con Glob en este orden:
1. `{project-root}/docs/*normativ*.md`
2. `{project-root}/docs/*regulat*.md`
3. `{project-root}/docs/*compliance*.md`
4. `{project-root}/docs/*legal*.md`
5. `{planning_artifacts}/*normativ*.md`

Si encontrado: leer contenido completo → almacenar en `doc_regulatory`
Si no encontrado: `doc_regulatory = null`

#### Documento 5 — Diseño UX / Wireframes

Buscar con Glob en este orden:
1. `{planning_artifacts}/ux-design.md`
2. `{planning_artifacts}/*ux*.md`
3. `{planning_artifacts}/*wireframe*.md`
4. `{planning_artifacts}/*design*.md`

Si encontrado: leer contenido completo → almacenar en `doc_ux`
Si no encontrado: `doc_ux = null`

#### Validación mínima

Verificar que al menos uno de los documentos fue encontrado. Si **ninguno** fue encontrado:

```
⚠️ No se encontraron documentos fuente en las rutas estándar del proyecto.

Rutas buscadas:
  • PRD:          {planning_artifacts}/prd.md (y variantes)
  • Arquitectura: {planning_artifacts}/architecture.md (y variantes)
  • Épicas:       {implementation_artifacts}/feature-status.yaml (y variantes)
  • Normativo:    {project-root}/docs/ (y variantes)
  • UX:           {planning_artifacts}/ux-design.md (y variantes)

¿Deseas continuar de todas formas o cancelar?
```

Esperar confirmación del usuario. Si cancela, detener el workflow.

#### Reporte de documentos encontrados

Notificar al usuario con el resultado del discovery:

```
📋 Documentos fuente encontrados:

  ✅ PRD:           {ruta relativa o "No encontrado"}
  ✅ Arquitectura:  {ruta relativa o "No encontrado"}
  ✅ Épicas:        {ruta(s) relativa(s) o "No encontrado"}
  ✅ Normativo:     {ruta relativa o "No encontrado"}
  ✅ UX Design:     {ruta relativa o "No encontrado"}

📄 Total documentos cargados: {N de 5}
```

Almacenar todos los contenidos encontrados concatenados en: `input_source_documents`

---

### 3. Automatic Megaprompt Execution

Proceder automáticamente sin más interacción:

#### Step 3.1: Load Megaprompt

1. Leer el archivo completo: `{workflow_root}/prompts/prompt_test_plan.md`
2. Este prompt transforma al agente en QA Architect Senior BMAD v3.0

#### Step 3.2: Execute

Notificar al usuario:

```
⚙️ Procesando documentos fuente...
🔍 Ejecutando análisis interno (Chain-of-Thought):
   • PASO 1: Impact Analysis (Blast Radius)
   • PASO 2: Technical Debt & Compliance Assessment
   • PASO 3: Risk Matrix Calculation
   • PASO 4: Synergy Mapping (Agentes BMAD)

📋 Generando Plan de Pruebas BMAD v3.0...
```

Ejecutar el megaprompt completo usando `input_source_documents` como los documentos fuente adjuntos.

El plan de pruebas generado debe incluir todas las secciones del prompt:
- Sección 1: Información General
- Sección 2: Objetivo & DoR / DoD
- Sección 3: Alcance de Pruebas
- Sección 4: Estrategia de Pruebas
- Sección 5: Ambiente & Datos de Prueba
- Sección 6: Matriz de Riesgo Predictivo
- Sección 7: Criterios de Entrada / Salida

#### Step 3.3: Save Output

1. Generar timestamp en formato: `YYYY-MM-DD-HHmmss` (ej: `2026-03-19-143052`)
2. Crear carpeta: `{implementation_artifacts}/qa-test-plans/test-plan-YYYY-MM-DD-HHmmss/`
3. Guardar el plan generado como: `test-plan.md`

**Frontmatter del documento generado:**
```yaml
---
workflow: generate-test-plan
version: 1.0.0
methodology: BMAD v3.0 Spec-Driven Quality
generated_date: [ISO 8601 date]
project_name: {project_name}
source_documents:
  prd: [ruta relativa o null]
  architecture: [ruta relativa o null]
  epics: [ruta(s) relativa(s) o null]
  regulatory: [ruta relativa o null]
  ux_design: [ruta relativa o null]
---
```

---

### 4. Completion

Presentar al usuario:

```
✅ PLAN DE PRUEBAS QA GENERADO

📁 Archivo: {implementation_artifacts}/qa-test-plans/test-plan-YYYY-MM-DD-HHmmss/test-plan.md

📋 Secciones incluidas:
  1. Información General
  2. Objetivo & DoR / DoD (Checklist de entrada y salida)
  3. Alcance de Pruebas (Features incluidas y excluidas)
  4. Estrategia de Pruebas (Tipos, técnicas, integración Human–AI)
  5. Ambiente & Datos de Prueba (Data Buckets por feature)
  6. Matriz de Riesgo Predictivo (Riesgos identificados por feature)
  7. Criterios de Entrada / Salida (Go / No-Go checklist)

⚠️  Riesgos críticos (R > 15): [N detectados — ver Sección 6]
🎯  Decisión Go/No-Go: [ver Sección 7]

🔍 Revisa el plan y completa las secciones marcadas como [PENDIENTE] con información
   específica de tu sprint/equipo.
```

---

*(Note: `workflow_root` es `{project-root}/_bmad/bmm/workflows/4-implementation/generate-test-plan`)*
