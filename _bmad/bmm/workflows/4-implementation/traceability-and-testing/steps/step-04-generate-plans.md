---
name: 'step-04-generate-plans'
description: 'Generate consolidated epic-level test plans with comprehensive test case organization and coverage analysis'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/traceability-and-testing'

# File References
thisStepFile: '{workflow_path}/steps/step-04-generate-plans.md'
nextStepFile: '{workflow_path}/steps/step-05-export.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{implementation_artifacts}/traceability-artifacts/traceability-map.md'
templateFile: '{workflow_path}/templates/epic-test-plan-template.md'
epicPlansDir: '{implementation_artifacts}/epic-test-plans'
---

# Step 4: Generate Epic Test Plans

## STEP GOAL:

To generate comprehensive, consolidated test plans organized by Epic, incorporating all mapped test cases, acceptance criteria, coverage analysis, and execution strategy.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Test Architect and Requirements Engineer
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring expertise in test planning and test strategy
- ✅ Together we create comprehensive epic test plans

### Step-Specific Rules:

- 🎯 Focus ONLY on organizing existing test cases into epic plans
- 🚫 FORBIDDEN to create new test cases (use existing mapped cases only)
- 💬 Validate test plan structure with user
- 📊 Include coverage analysis and gap identification per epic

## EXECUTION PROTOCOLS:

- 🎯 Generate one test plan document per Epic
- 📖 Update frontmatter with `stepsCompleted: [1, 2, 3, 4]`
- 🚫 FORBIDDEN to load next step until all epic test plans are generated and validated

**IMPORTANT:** traceability-map.md is NOT updated in this step. It contains only pure traceability (PRD→FR→Epic→Story→Task), not test plan information.

## CONTEXT BOUNDARIES:

- Input data from step 03 frontmatter (test coverage statistics)
- Test case CSV file and summary from step 03
- Traceability hierarchy from sections 1-3
- Acceptance Criteria from epics.md story definitions
- Focus on test plan organization, NOT new test case creation

## EPIC TEST PLAN GENERATION PROCESS:

### 1. Load Context from Step 03

Read frontmatter from {outputFile}:

```yaml
stepsCompleted: [1, 2, 3]
epicScopeMode: "all" | "multiple"
targetEpicNumbers: null | [1, 3, 5]  # Array of selected epic numbers
epicCount: {number}  # Number of epics being processed
epics: [...]  # Already filtered if multiple epic mode
testCoverage:
  totalTestCases: X
  mappedTestCases: Y
  epicCoverageRate: P%
  epicsWithoutTests: [...]
```

**Display scope-aware message:**

```
{if epicScopeMode === "all":
  "Generando planes de prueba por épica para **{projectName}**...

  📊 Datos cargados:
  - {totalEpics} Épicas a procesar
  - {mappedTestCases} Casos de prueba mapeados
  - Cobertura de épicas: {epicCoverageRate}%

  🎯 **Alcance:** Todas las épicas (se generará 1 plan por épica)

  Iniciando generación de planes de prueba..."
else:
  "Generando plan de prueba CONSOLIDADO para **{projectName}** ({epicCount} épica(s) seleccionada(s))...

  📊 Datos cargados:
  - {epicCount} Épica(s) a procesar:
    {for each epic_number in targetEpicNumbers:
      \"  • Epic {epic_number}: {epic_title}\"
    }
  - {mappedTestCases} Casos de prueba mapeados
  - Cobertura: {epicCoverageRate}%

  🎯 **Alcance:** {epicCount} épica(s) agrupadas en 1 plan consolidado

  💡 Esta agrupación permite generar un plan coherente que cubre una unidad funcional completa.

  Iniciando generación de plan consolidado..."
}
```

---

### 2. Load Epic Test Plan Template

Read template file:

```
Read: {templateFile}
```

Template should include placeholders for:
- Epic metadata (ID, title, FRs covered, stories)
- Test objectives
- Scope (in-scope / out-of-scope)
- Test cases organized by story
- Acceptance criteria checklist
- Coverage analysis
- Test execution strategy
- Dependencies and prerequisites
- Risk assessment

---

### 3. Create Epic Test Plans Directory

Create directory for individual epic test plan files:

```
Create directory: {epicPlansDir}/
```

"📁 Directorio creado para planes de prueba: `{epicPlansDir}/`"

---

### 4. Generate Test Plan(s)

**Note:** The epics list was already filtered in Step 01 based on `epicScopeMode`:
- If `epicScopeMode = "all"`: Process all epics in the project (generate 1 plan per epic)
- If `epicScopeMode = "multiple"`: Process only the epics specified in `targetEpicNumbers` (generate 1 consolidated plan)

**Branching logic:**

**If `epicScopeMode = "all"`:** Generate one test plan per epic (loop through all epics)

**If `epicScopeMode = "multiple"`:** Generate ONE consolidated test plan that groups all selected epics

---

#### Mode A: Individual Plans (epicScopeMode = "all")

For each Epic in the traceability hierarchy:

#### 4.1. Extract Epic Metadata

```javascript
epic_metadata = {
  id: "Epic 1",
  title: "User Management System",
  description: extract_from_epics_md(epic.id),
  frs_covered: get_frs_for_epic(epic.id),  // from section 2
  stories: get_stories_for_epic(epic.id),  // from section 1
  test_cases: get_test_cases_for_epic(epic.id)  // from section 6
}
```

#### 4.2. Extract Story-level Details

For each story in the epic:

```javascript
for each story in epic.stories:
    story_details = {
      id: story.id,
      title: story.title,
      description: extract_from_epics_md(story.id),
      acceptance_criteria: extract_ACs_from_epics_md(story.id),
      tasks: extract_tasks_from_story_files(story.id),  // if available
      test_cases: get_test_cases_for_story(story.id),  // from section 7
      test_coverage: calculate_story_coverage(story.id)
    }
```

#### 4.3. Calculate Epic-level Coverage Metrics

```javascript
epic_coverage = {
  total_stories: count(epic.stories),
  stories_with_tests: count(stories with ≥1 test case),
  stories_without_tests: count(stories with 0 test cases),

  total_acs: count(all acceptance criteria in epic),
  acs_covered_by_tests: count(ACs referenced by test cases),
  acs_not_covered: count(ACs without test coverage),

  total_test_cases: count(epic.test_cases),
  high_priority_tests: count(tests with priority=High),
  medium_priority_tests: count(tests with priority=Medium),
  low_priority_tests: count(tests with priority=Low),

  coverage_rate_stories: (stories_with_tests / total_stories) * 100,
  coverage_rate_acs: (acs_covered_by_tests / total_acs) * 100
}
```

#### 4.4. Identify Testing Gaps

```javascript
testing_gaps = {
  stories_without_tests: [list of story IDs],
  acs_without_tests: [list of AC IDs],
  missing_test_types: identify_missing_types(),  // e.g., no integration tests
  high_risk_areas: identify_high_risk_areas()    // complex stories with low coverage
}
```

#### 4.5. Define Test Objectives

Based on Epic scope and FRs:

```markdown
## Test Objectives

This test plan validates:

1. **{FR1}**: {Description}
   - Verify all user management capabilities function correctly
   - Ensure data validation and security controls

2. **{FR2}**: {Description}
   - Validate authentication flows
   - Test error handling and edge cases

{Derive from FRs covered by this Epic}
```

#### 4.6. Organize Test Cases by Story

```markdown
## Casos de Prueba por Historia

### Historia 1.1: {Title}

**Descripción:** {story.description}

**Criterios de Aceptación:**
- AC1: {criteria} {✅ Cubierto por TC-001 | ❌ No cubierto}
- AC2: {criteria} {✅ Cubierto por TC-002 | ❌ No cubierto}
- AC3: {criteria} {✅ Cubierto por TC-003, TC-004 | ❌ No cubierto}

**Casos de Prueba ({count}):**

| ID Prueba | Nombre Prueba | Prioridad | Tipo | Pasos | Resultado Esperado |
|-----------|---------------|-----------|------|-------|--------------------|
| TC-001 | Registro de usuario con datos válidos | Alta | Funcional | {resumen pasos} | {resumen esperado} |
| TC-002 | Errores de validación en registro | Alta | Funcional | {resumen pasos} | {resumen esperado} |
| TC-003 | Manejo de email duplicado | Media | Funcional | {resumen pasos} | {resumen esperado} |

**Análisis de Cobertura:**
- Criterios de Aceptación: {X}/{Y} cubiertos ({percentage}%)
- Casos de Prueba: {count}
- Distribución de Prioridad: {high} Alta, {medium} Media, {low} Baja

{If gaps:}
⚠️ **Brechas de Prueba:**
- {AC que no está cubierto}
- {Tipo de prueba o escenario faltante}

{Repetir para cada Historia en la Épica}
```

#### 4.7. Generate Scope Section

```markdown
## Alcance

### Dentro del Alcance
- Validación funcional de {Epic title}
- Todas las historias: {list story IDs}
- Requerimientos Funcionales: {list FRs}
- Tipos de prueba: {list types present in test cases}

### Fuera del Alcance
- Pruebas de rendimiento (cubierto en pruebas NFR separadas)
- Pruebas de penetración de seguridad (plan separado)
- {Otras exclusiones basadas en contexto del proyecto}
```

#### 4.8. Generate Test Execution Strategy

```markdown
## Estrategia de Ejecución de Pruebas

### Orden de Ejecución

**Fase 1: Pruebas Fundamentales (Deben pasar primero)**
{Identificar casos de prueba fundamentales - típicamente pruebas de alta prioridad para historias core}

- TC-001: Registro de usuario con datos válidos
- TC-005: Login de usuario con credenciales válidas

**Fase 2: Pruebas de Funcionalidades**
{Pruebas de funcionalidad principal}

- TC-002: Errores de validación en registro
- TC-003: Manejo de email duplicado
- TC-006: Flujo de reseteo de contraseña

**Fase 3: Casos Límite e Integración**
{Casos límite y escenarios de integración}

- TC-010: Registro concurrente de usuarios
- TC-011: Manejo de timeout de sesión

### Dependencias y Prerequisitos

**Dependencias Externas:**
- Base de datos debe ser accesible y poblada con datos de prueba
- Servicio de email debe estar configurado para pruebas de notificaciones
- {Otras dependencias de precondiciones de prueba}

**Requisitos de Datos de Prueba:**
- Credenciales de usuario válidas: {list}
- Datos de entrada inválidos: {list}
- {Otras necesidades de datos de prueba}

### Requisitos de Ambiente
- Ambiente de pruebas: {especificar}
- Acceso requerido: {especificar}
- Configuración: {especificar}
```

#### 4.9. Generate Risk Assessment

```markdown
## Evaluación de Riesgos

### Áreas de Alto Riesgo

{Identificar basándose en:}
- Historias con criterios de aceptación complejos pero baja cobertura de pruebas
- RFs críticos con casos de prueba insuficientes
- Historias sin cobertura de pruebas

**Historia 1.3: {Title}** - ⚠️ RIESGO ALTO
- Razón: Lógica de autenticación compleja con solo 1 caso de prueba
- Recomendación: Agregar casos de prueba para casos límite y escenarios de error
- Prioridad: Crítica

### Resumen de Brechas de Prueba

- Historias sin cobertura de pruebas: {count}
  {list stories}
- Criterios de Aceptación sin pruebas: {count}
  {list critical ACs}
- Tipos de prueba faltantes: {list}

**Recomendaciones:**
1. Agregar casos de prueba para Historia {ID} (cobertura cero)
2. Crear pruebas de integración para flujos multi-historia
3. Agregar pruebas de casos límite para {scenario}
```

#### 4.10. Write Epic Test Plan Document

Create individual test plan file:

```
File: {epicPlansDir}/epic-{epic_id}-test-plan.md
```

Populate from template with all sections:

```markdown
---
epic_id: Epic 1
epic_title: Sistema de Gestión de Usuarios
frs_covered: [FR-001, FR-002]
total_stories: 3
total_test_cases: 12
coverage_rate: 75%
generated_date: {current_date}
---

# Plan de Pruebas: Epic 1 - Sistema de Gestión de Usuarios

## Descripción General de la Épica
{epic.description}

## Requerimientos Funcionales Cubiertos
{lista de RFs con descripciones}

## Objetivos de Prueba
{sección 4.5}

## Alcance
{sección 4.7}

## Casos de Prueba por Historia
{sección 4.6}

## Resumen de Cobertura
- Historias: {stories_with_tests}/{total_stories} ({coverage_rate_stories}%)
- Criterios de Aceptación: {acs_covered}/{total_acs} ({coverage_rate_acs}%)
- Total de Casos de Prueba: {total_test_cases}
- Prioridad: {high} Alta, {medium} Media, {low} Baja

## Estrategia de Ejecución de Pruebas
{sección 4.8}

## Evaluación de Riesgos
{sección 4.9}

## Dependencias y Prerequisitos
{de sección 4.8}

## Firmas de Aprobación
- Autor del Plan de Pruebas: {generado por workflow}
- Revisión Requerida: Sí
- Estado de Aprobación: Pendiente
```

Display progress:

"✅ Plan de prueba generado: `epic-{epic_id}-test-plan.md`
   - Historias: {count}
   - Casos de prueba: {count}
   - Cobertura: {coverage_rate}%"

---

#### Mode B: Consolidated Plan (epicScopeMode = "multiple")

**Generate ONE test plan that consolidates all selected epics:**

#### 4B.1. Extract Consolidated Metadata

```javascript
consolidated_metadata = {
  epic_ids: targetEpicNumbers,  // e.g., [1, 3, 5]
  epic_titles: get_titles_for_epics(targetEpicNumbers),
  combined_title: "Consolidated Test Plan - " + join_epic_titles(epic_titles),
  description: "This consolidated test plan covers {epicCount} epics that together form a complete functional unit.",
  frs_covered: get_all_frs_for_epics(targetEpicNumbers),
  stories: get_all_stories_for_epics(targetEpicNumbers),
  test_cases: get_all_test_cases_for_epics(targetEpicNumbers)
}
```

#### 4B.2. Test Objectives (Consolidated)

Generate consolidated test objectives:

```markdown
## Objetivos de Prueba

Validar la funcionalidad completa que abarca las siguientes épicas:

{for each epic_number in targetEpicNumbers:
  "- **Epic {epic_number}:** {epic_title} - {epic_description_brief}"}

**Objetivos específicos:**
1. Verificar la integración entre funcionalidades desarrolladas en diferentes épicas
2. Validar flujos end-to-end que cruzan múltiples épicas
3. Confirmar que la unidad funcional completa cumple con los requisitos de negocio

**Ejemplo:** Si las épicas seleccionadas son Login (Epic 1), Gestión de Sesión (Epic 2), y Recuperación de Contraseña (Epic 3), los objetivos validarían el flujo completo de autenticación del usuario.
```

#### 4B.3. Functional Requirements (Consolidated)

List all FRs covered by the selected epics:

```markdown
## Requerimientos Funcionales Cubiertos

{for each FR in consolidated_metadata.frs_covered:
  "### {FR_id}: {FR_title}

  **Descripción:** {FR_description}

  **Épicas relacionadas:** {list epics that cover this FR}

  **Prioridad:** {FR_priority}"}
```

#### 4B.4. Scope (Consolidated)

Define scope for the consolidated plan:

```markdown
## Alcance del Plan de Pruebas Consolidado

### En Alcance

Funcionalidades desarrolladas en las {epicCount} épicas seleccionadas:

{for each epic in selected_epics:
  "**Epic {epic.id}: {epic.title}**
  - Historias: {list story IDs}
  - Funcionalidades clave: {list key features}"}

**Flujos integrados:**
- Flujos que cruzan múltiples épicas
- Integración entre componentes de diferentes épicas
- Validación de la unidad funcional completa

### Fuera de Alcance

{List other epics and features NOT included in this consolidated plan}
```

#### 4B.5. Test Cases Organized by Epic and Story (Consolidated)

Organize test cases grouped first by epic, then by story:

```markdown
## Casos de Prueba por Épica y Historia

{for each epic in selected_epics:
  "### Epic {epic.id}: {epic.title}

  {for each story in epic.stories:
    "#### Historia {story.id}: {story.title}

    **Criterios de Aceptación:**
    {list story.acceptance_criteria}

    **Casos de Prueba:**

    {for each test_case in story.test_cases:
      "##### {test_case.id}: {test_case.title}

      - **Tipo:** {test_case.type}
      - **Prioridad:** {test_case.priority}
      - **Precondiciones:** {test_case.preconditions}
      - **Pasos:** {test_case.steps}
      - **Resultados Esperados:** {test_case.expected_results}

      **Cobertura:** {list which ACs this test covers}"}

    **Cobertura de Historia:** {coverage_rate}% ({covered}/{total} ACs cubiertos)"}"}
```

#### 4B.6. Integrated Flows Section (Consolidated)

Add a special section for flows that span multiple epics:

```markdown
## Flujos Integrados (Cross-Epic)

Esta sección identifica flujos end-to-end que cruzan múltiples épicas seleccionadas.

**Ejemplo de Flujo Integrado: Autenticación Completa del Usuario**

**Épicas involucradas:** Epic 1 (Login), Epic 2 (Gestión de Sesión), Epic 3 (Recuperación de Contraseña)

**Flujo:**
1. [Epic 1] Usuario ingresa credenciales
2. [Epic 1] Sistema valida y autentica
3. [Epic 2] Sistema crea sesión activa
4. [Epic 2] Usuario navega con sesión activa
5. [Epic 3] Usuario solicita recuperación de contraseña (si olvidó)
6. [Epic 2] Sistema cierra sesión tras timeout

**Casos de Prueba Relacionados:**
{list test cases from different epics that validate this integrated flow}

{Identify and document other integrated flows}
```

#### 4B.7. Coverage Analysis (Consolidated)

Analyze coverage across all selected epics:

```markdown
## Resumen de Cobertura Consolidada

**Cobertura por Épica:**

{for each epic in selected_epics:
  "- **Epic {epic.id}:** {epic.coverage_rate}% ({epic.covered_stories}/{epic.total_stories} historias con pruebas)"}

**Cobertura Global:**
- Total de Historias: {total_stories}
- Historias con Pruebas: {stories_with_tests} ({coverage_rate_stories}%)
- Total de Criterios de Aceptación: {total_acs}
- ACs Cubiertos: {acs_covered} ({coverage_rate_acs}%)
- Total de Casos de Prueba: {total_test_cases}

**Distribución por Tipo de Prueba:**
- Funcional: {functional_count} casos
- Integración: {integration_count} casos
- E2E: {e2e_count} casos

**Distribución por Prioridad:**
- Alta: {high_priority_count} casos
- Media: {medium_priority_count} casos
- Baja: {low_priority_count} casos
```

#### 4B.8. Risk Assessment (Consolidated)

Identify risks across the consolidated functional unit:

```markdown
## Evaluación de Riesgos Consolidada

### Riesgos de Integración

**RIESGO ALTO:** Flujos que cruzan múltiples épicas
- {Identify integrated flows with insufficient test coverage}
- Recomendación: Agregar casos de prueba E2E que validen flujos completos

### Áreas de Alto Riesgo por Épica

{for each epic in selected_epics:
  "**Epic {epic.id}: {epic.title}**
  {Identify high-risk stories within this epic based on coverage}"}

### Resumen de Brechas de Prueba

- Historias sin cobertura de pruebas: {count_total}
  {list all uncovered stories across all epics}
- Criterios de Aceptación sin pruebas: {count_total}
  {list critical uncovered ACs}
- Flujos integrados sin validación E2E: {count}

**Recomendaciones Prioritarias:**
1. Agregar casos E2E para flujos integrados (CRÍTICO)
2. Completar cobertura de historias sin pruebas
3. Validar puntos de integración entre épicas
```

#### 4B.9. Execution Strategy (Consolidated)

Define execution strategy for the consolidated plan:

```markdown
## Estrategia de Ejecución de Pruebas Consolidada

### Fase 1: Pruebas por Épica (Aisladas)
Ejecutar casos de prueba por épica individualmente antes de validar integración.

{for each epic in selected_epics:
  "**Epic {epic.id}:**
  - Ejecutar {epic.test_count} casos de prueba
  - Validar funcionalidad aislada
  - Duración estimada: {estimated_time}"}

### Fase 2: Pruebas de Integración (Cross-Epic)
Ejecutar casos que validan integración entre épicas.

- Flujos integrados identificados: {integrated_flows_count}
- Casos de prueba E2E: {e2e_count}
- Validar puntos de integración

### Fase 3: Validación Completa del Flujo
Ejecutar flujos end-to-end completos que cruzan todas las épicas seleccionadas.

### Prerequisitos y Dependencias

**Dependencias entre Épicas:**
{Identify if Epic X must be validated before Epic Y}

**Datos de Prueba Requeridos:**
{Consolidate test data requirements from all epics}

**Entorno de Pruebas:**
{Specify environment requirements}
```

#### 4B.10. Write Consolidated Test Plan Document

Create ONE consolidated test plan file:

```
File: {epicPlansDir}/consolidated-test-plan-epics-{join_epic_numbers_with_dash}.md
Example: consolidated-test-plan-epics-1-3-5.md
```

Populate from template with all consolidated sections:

```markdown
---
plan_type: "consolidated"
epic_ids: [1, 3, 5]
epic_titles:
  - "Epic 1: User Authentication"
  - "Epic 3: Session Management"
  - "Epic 5: Password Recovery"
epic_count: 3
functional_unit: "Complete User Authentication Flow"
frs_covered: [FR-001, FR-002, FR-005]
total_stories: 12
total_test_cases: 45
coverage_rate: 78%
generated_date: {current_date}
---

# Plan de Pruebas Consolidado: {functional_unit_name}

## Épicas Incluidas

{for each epic:
  "- **Epic {id}:** {title}"}

## Descripción del Plan Consolidado

Este plan de pruebas consolida {epicCount} épicas que juntas forman una unidad funcional completa: **{functional_unit_name}**.

El objetivo es validar no solo cada épica individualmente, sino también la integración y los flujos end-to-end que cruzan múltiples épicas.

## Requerimientos Funcionales Cubiertos
{sección 4B.3}

## Objetivos de Prueba
{sección 4B.2}

## Alcance
{sección 4B.4}

## Casos de Prueba por Épica y Historia
{sección 4B.5}

## Flujos Integrados (Cross-Epic)
{sección 4B.6}

## Resumen de Cobertura Consolidada
{sección 4B.7}

## Estrategia de Ejecución de Pruebas Consolidada
{sección 4B.9}

## Evaluación de Riesgos Consolidada
{sección 4B.8}

## Firmas de Aprobación
- Autor del Plan de Pruebas: {generado por workflow}
- Revisión Requerida: Sí
- Estado de Aprobación: Pendiente
```

Display progress:

"✅ Plan de prueba CONSOLIDADO generado: `consolidated-test-plan-epics-{join_epic_numbers}.md`
   - Épicas agrupadas: {epicCount}
   - Historias totales: {count}
   - Casos de prueba totales: {count}
   - Cobertura consolidada: {coverage_rate}%

💡 Este plan agrupa múltiples épicas en una unidad funcional coherente."

---

### 5. Update workflow progress

**IMPORTANT:** Do NOT add test plan information to traceability-map.md.
The traceability map contains ONLY the implementation hierarchy (PRD→FR→Epic→Story→Task), not test plan information.

**Only update frontmatter of step tracking:**

Update {outputFile} frontmatter:

```yaml
stepsCompleted: [1, 2, 3, 4]
```

**Do NOT add section 4 or 8 to traceability-map.md** - those sections are removed. The file only contains sections 1-3 (pure traceability).

---

### 6. Present Summary to User

**Display scope-aware summary:**

```
{if epicScopeMode === "all":
  "✅ **Planes de Prueba por Épica Generados con Éxito**

  📊 **Estadísticas de Planes de Prueba:**
  - Total de planes generados: {count}
  - Épicas procesadas: {count}/{totalEpics}
  - Casos de prueba organizados: {totalTestCases}

  🎯 **Alcance:** Todas las épicas procesadas (1 plan por épica)

  📁 **Archivos generados:**
  - Directorio: `{epicPlansDir}/`
  - {count} planes de prueba individuales

  **Planes generados:**

  {for each epic:
    \"✅ **Epic {id}: {title}**
        - Archivo: `epic-{id}-test-plan.md`
        - Historias: {count}
        - Casos de prueba: {count}
        - Cobertura: {coverage_rate}%\"
  }"
else:
  "✅ **Plan de Prueba CONSOLIDADO Generado con Éxito**

  📊 **Estadísticas del Plan Consolidado:**
  - Plan consolidado para {epicCount} épica(s)
  - Épicas agrupadas:
    {for each epic_number in targetEpicNumbers:
      \"  • Epic {epic_number}: {epic_title}\"
    }
  - Historias procesadas: {count_stories_total}
  - Casos de prueba organizados: {totalTestCases}
  - Flujos integrados identificados: {integrated_flows_count}

  🎯 **Alcance:** {epicCount} épica(s) consolidadas en 1 plan

  💡 Este plan agrupa múltiples épicas que forman una unidad funcional completa.

  📁 **Archivo generado:**
  - Directorio: `{epicPlansDir}/`
  - Archivo: `consolidated-test-plan-epics-{join_epic_numbers}.md`"
}
```

📈 **Cobertura General:**
- Cobertura de historias: {overallStoryCoverage}%
- Cobertura de criterios de aceptación: {overallACCoverage}%

¿El plan de prueba se ve correcto?"

Wait for user confirmation.

---

### 9. Offer Optional Test Plan Review

Ask user:

"¿Deseas revisar algún plan de prueba específico antes de continuar?

Puedo mostrarte el contenido completo de cualquiera de los planes generados.

**Opciones:**
- [1-{count}] Ver plan de Epic {number}
- [A] Ver el índice maestro completo
- [N] No, continuar al siguiente paso

Selecciona opción:"

If user selects a plan number:
- Read and display that epic test plan file
- Ask if they want to see another or continue
- Return to menu options

If user selects A:
- Read and display INDEX.md
- Ask if they want to see a specific plan or continue
- Return to menu options

If user selects N:
- Proceed to menu options (section 10)

---

### 10. Present MENU OPTIONS

Display: **Confirma para [C] continuar:**

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- User can chat or ask questions - always respond and then end with display again of the menu option

#### Menu Handling Logic:

- IF C: Ensure all epic test plans are saved, workflow progress updated, frontmatter updated with `stepsCompleted: [1, 2, 3, 4]`, only then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#10-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected, all epic test plans are written to {epicPlansDir} section 8 is written to {outputFile}, and frontmatter is updated with `stepsCompleted: [1, 2, 3, 4]` and test plan metadata, will you then load, read entire file, then execute {nextStepFile} to begin the export process.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Template loaded correctly
- Epic test plans directory created
- One test plan generated per Epic
- Epic metadata extracted accurately
- Story-level details extracted from epics.md
- Acceptance criteria mapped to test cases
- Coverage metrics calculated per epic
- Testing gaps identified per epic
- Test execution strategy defined with phases and dependencies
- Risk assessment completed identifying high-risk areas
- Individual test plan files created
- Frontmatter updated with stepsCompleted: [1, 2, 3, 4]
- User confirmed completion

**IMPORTANT:** traceability-map.md is NOT updated in this step. It contains only pure traceability (PRD→FR→Epic→Story→Task), not test plan information.

### ❌ SYSTEM FAILURE:

- Template not loaded
- Directory not created
- Incomplete test plan generation (missing epics)
- Missing epic or story metadata
- Acceptance criteria not extracted
- Coverage metrics not calculated
- Testing gaps not identified
- No test execution strategy
- No risk assessment
- Test plan files not created
- INDEX.md not generated
- Frontmatter not updated
- Proceeding without user confirmation
- Adding test plan information to traceability-map.md (WRONG - that file is for implementation hierarchy only)

**Master Rule:** Epic test plans must be comprehensive, including all mapped test cases, coverage analysis, execution strategy, and gap identification. All plans must be validated before export. The traceability map remains pure (only PRD→FR→Epic→Story→Task).
