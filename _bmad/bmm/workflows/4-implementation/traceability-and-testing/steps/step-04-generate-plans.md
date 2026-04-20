---
name: 'step-04-generate-plans'
description: 'Generate consolidated feature-level test plans with comprehensive test case organization and coverage analysis'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/traceability-and-testing'

# File References
thisStepFile: '{workflow_path}/steps/step-04-generate-plans.md'
nextStepFile: '{workflow_path}/steps/step-05-export.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{implementation_artifacts}/traceability-artifacts/traceability-map.md'
templateFile: '{workflow_path}/templates/epic-test-plan-template.md'
featurePlansDir: '{implementation_artifacts}/feature-test-plans'
---

# Step 4: Generate Feature Test Plans

## STEP GOAL:

To generate comprehensive, consolidated test plans organized by Feature, incorporating all mapped test cases, acceptance criteria, coverage analysis, and execution strategy.

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
- ✅ Together we create comprehensive feature test plans

### Step-Specific Rules:

- 🎯 Focus ONLY on organizing existing test cases into feature plans
- 🚫 FORBIDDEN to create new test cases (use existing mapped cases only)
- 💬 Validate test plan structure with user
- 📊 Include coverage analysis and gap identification per feature

## EXECUTION PROTOCOLS:

- 🎯 Generate one test plan document per Feature
- 📖 Update frontmatter with `stepsCompleted: [1, 2, 3, 4]`
- 🚫 FORBIDDEN to load next step until all feature test plans are generated and validated

**IMPORTANT:** traceability-map.md is NOT updated in this step. It contains only pure traceability (PRD→FR→Feature→Story→Task), not test plan information.

## CONTEXT BOUNDARIES:

- Input data from step 03 frontmatter (test coverage statistics)
- Test case CSV file and summary from step 03
- Traceability hierarchy from sections 1-3
- Acceptance Criteria from feature epic_source file story definitions
- Focus on test plan organization, NOT new test case creation

## FEATURE TEST PLAN GENERATION PROCESS:

### 1. Load Context from Step 03

Read frontmatter from {outputFile}:

```yaml
stepsCompleted: [1, 2, 3]
featureScopeMode: "all" | "multiple"
targetFeatureIds: null | ["feature-1", "feature-3"]  # Array of selected feature IDs
featureCount: {number}  # Number of features being processed
selectedFeatures: [...]  # Already filtered if multiple feature mode
testCoverage:
  totalTestCases: X
  mappedTestCases: Y
  featureCoverageRate: P%
  featuresWithoutTests: [...]
```

**Display scope-aware message:**

```
{if featureScopeMode === "all":
  "Generando planes de prueba por feature para **{projectName}**...

  📊 Datos cargados:
  - {totalFeatures} Features a procesar
  - {mappedTestCases} Casos de prueba mapeados
  - Cobertura de features: {featureCoverageRate}%

  🎯 **Alcance:** Todos los features (se generará 1 plan por feature)

  Iniciando generación de planes de prueba..."
else:
  "Generando plan de prueba CONSOLIDADO para **{projectName}** ({featureCount} feature(s) seleccionado(s))...

  📊 Datos cargados:
  - {featureCount} Feature(s) a procesar:
    {for each feature_id in targetFeatureIds:
      \"  • Feature {feature_id}: {feature_title}\"
    }
  - {mappedTestCases} Casos de prueba mapeados
  - Cobertura: {featureCoverageRate}%

  🎯 **Alcance:** {featureCount} feature(s) agrupados en 1 plan consolidado

  💡 Esta agrupación permite generar un plan coherente que cubre una unidad funcional completa.

  Iniciando generación de plan consolidado..."
}
```

---

### 2. Load Feature Test Plan Template

Read template file:

```
Read: {templateFile}
```

Template should include placeholders for:
- Feature metadata (ID, title, FRs covered, stories)
- Test objectives
- Scope (in-scope / out-of-scope)
- Test cases organized by story
- Acceptance criteria checklist
- Coverage analysis
- Test execution strategy
- Dependencies and prerequisites
- Risk assessment

---

### 3. Create Feature Test Plans Directory

Create directory for individual feature test plan files:

```
Create directory: {featurePlansDir}/
```

"📁 Directorio creado para planes de prueba: `{featurePlansDir}/`"

---

### 4. Generate Test Plan(s)

**Note:** The features list was already filtered in Step 01 based on `featureScopeMode`:
- If `featureScopeMode = "all"`: Process all features in the project (generate 1 plan per feature)
- If `featureScopeMode = "multiple"`: Process only the features specified in `targetFeatureIds` (generate 1 consolidated plan)

**Branching logic:**

**If `featureScopeMode = "all"`:** Generate one test plan per feature (loop through all features)

**If `featureScopeMode = "multiple"`:** Generate ONE consolidated test plan that groups all selected features

---

#### Mode A: Individual Plans (featureScopeMode = "all")

For each Feature in the traceability hierarchy:

#### 4.1. Extract Feature Metadata

```javascript
feature_metadata = {
  id: "feature-1",
  title: "User Management System",
  description: extract_from_epic_source(feature.id),
  frs_covered: get_frs_for_feature(feature.id),  // from section 2
  stories: get_stories_for_feature(feature.id),  // from section 1
  test_cases: get_test_cases_for_feature(feature.id)  // from section 6
}
```

#### 4.2. Extract Story-level Details

For each story in the feature:

```javascript
for each story in feature.stories:
    story_details = {
      id: story.id,
      title: story.title,
      description: extract_from_epic_source(story.id),
      acceptance_criteria: extract_ACs_from_epic_source(story.id),
      tasks: extract_tasks_from_story_files(story.id),  // if available
      test_cases: get_test_cases_for_story(story.id),  // from section 7
      test_coverage: calculate_story_coverage(story.id)
    }
```

#### 4.3. Calculate Feature-level Coverage Metrics

```javascript
feature_coverage = {
  total_stories: count(feature.stories),
  stories_with_tests: count(stories with ≥1 test case),
  stories_without_tests: count(stories with 0 test cases),

  total_acs: count(all acceptance criteria in feature),
  acs_covered_by_tests: count(ACs referenced by test cases),
  acs_not_covered: count(ACs without test coverage),

  total_test_cases: count(feature.test_cases),
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

Based on Feature scope and FRs:

```markdown
## Test Objectives

This test plan validates:

1. **{FR1}**: {Description}
   - Verify all user management capabilities function correctly
   - Ensure data validation and security controls

2. **{FR2}**: {Description}
   - Validate authentication flows
   - Test error handling and edge cases

{Derive from FRs covered by this Feature}
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

{Repetir para cada Historia en el Feature}
```

#### 4.7. Generate Scope Section

```markdown
## Alcance

### Dentro del Alcance
- Validación funcional de {Feature title}
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

#### 4.10. Write Feature Test Plan Document

Create individual test plan file:

```
File: {featurePlansDir}/feature-{feature_id}-test-plan.md
```

Populate from template with all sections:

```markdown
---
feature_id: feature-1
feature_title: Sistema de Gestión de Usuarios
frs_covered: [FR-001, FR-002]
total_stories: 3
total_test_cases: 12
coverage_rate: 75%
generated_date: {current_date}
---

# Plan de Pruebas: feature-1 - Sistema de Gestión de Usuarios

## Descripción General del Feature
{feature.description}

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

"✅ Plan de prueba generado: `feature-{feature_id}-test-plan.md`
   - Historias: {count}
   - Casos de prueba: {count}
   - Cobertura: {coverage_rate}%"

---

#### Mode B: Consolidated Plan (featureScopeMode = "multiple")

**Generate ONE test plan that consolidates all selected features:**

#### 4B.1. Extract Consolidated Metadata

```javascript
consolidated_metadata = {
  feature_ids: targetFeatureIds,  // e.g., ["feature-1", "feature-3"]
  feature_titles: get_titles_for_features(targetFeatureIds),
  combined_title: "Consolidated Test Plan - " + join_feature_titles(feature_titles),
  description: "This consolidated test plan covers {featureCount} features that together form a complete functional unit.",
  frs_covered: get_all_frs_for_features(targetFeatureIds),
  stories: get_all_stories_for_features(targetFeatureIds),
  test_cases: get_all_test_cases_for_features(targetFeatureIds)
}
```

#### 4B.2. Test Objectives (Consolidated)

Generate consolidated test objectives:

```markdown
## Objetivos de Prueba

Validar la funcionalidad completa que abarca los siguientes features:

{for each feature_id in targetFeatureIds:
  "- **{feature_id}:** {feature_title} - {feature_description_brief}"}

**Objetivos específicos:**
1. Verificar la integración entre funcionalidades desarrolladas en diferentes features
2. Validar flujos end-to-end que cruzan múltiples features
3. Confirmar que la unidad funcional completa cumple con los requisitos de negocio

**Ejemplo:** Si los features seleccionados son Login (feature-1), Gestión de Sesión (feature-2), y Recuperación de Contraseña (feature-3), los objetivos validarían el flujo completo de autenticación del usuario.
```

#### 4B.3. Functional Requirements (Consolidated)

List all FRs covered by the selected features:

```markdown
## Requerimientos Funcionales Cubiertos

{for each FR in consolidated_metadata.frs_covered:
  "### {FR_id}: {FR_title}

  **Descripción:** {FR_description}

  **Features relacionados:** {list features that cover this FR}

  **Prioridad:** {FR_priority}"}
```

#### 4B.4. Scope (Consolidated)

Define scope for the consolidated plan:

```markdown
## Alcance del Plan de Pruebas Consolidado

### En Alcance

Funcionalidades desarrolladas en los {featureCount} features seleccionados:

{for each feature in selectedFeatures:
  "**{feature.id}: {feature.title}**
  - Historias: {list story IDs}
  - Funcionalidades clave: {list key features}"}

**Flujos integrados:**
- Flujos que cruzan múltiples features
- Integración entre componentes de diferentes features
- Validación de la unidad funcional completa

### Fuera de Alcance

{List other features NOT included in this consolidated plan}
```

#### 4B.5. Test Cases Organized by Feature and Story (Consolidated)

Organize test cases grouped first by feature, then by story:

```markdown
## Casos de Prueba por Feature y Historia

{for each feature in selectedFeatures:
  "### {feature.id}: {feature.title}

  {for each story in feature.stories:
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

Add a special section for flows that span multiple features:

```markdown
## Flujos Integrados (Cross-Feature)

Esta sección identifica flujos end-to-end que cruzan múltiples features seleccionados.

**Ejemplo de Flujo Integrado: Autenticación Completa del Usuario**

**Features involucrados:** feature-1 (Login), feature-2 (Gestión de Sesión), feature-3 (Recuperación de Contraseña)

**Flujo:**
1. [feature-1] Usuario ingresa credenciales
2. [feature-1] Sistema valida y autentica
3. [feature-2] Sistema crea sesión activa
4. [feature-2] Usuario navega con sesión activa
5. [feature-3] Usuario solicita recuperación de contraseña (si olvidó)
6. [feature-2] Sistema cierra sesión tras timeout

**Casos de Prueba Relacionados:**
{list test cases from different features that validate this integrated flow}

{Identify and document other integrated flows}
```

#### 4B.7. Coverage Analysis (Consolidated)

Analyze coverage across all selected features:

```markdown
## Resumen de Cobertura Consolidada

**Cobertura por Feature:**

{for each feature in selectedFeatures:
  "- **{feature.id}:** {feature.coverage_rate}% ({feature.covered_stories}/{feature.total_stories} historias con pruebas)"}

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

**RIESGO ALTO:** Flujos que cruzan múltiples features
- {Identify integrated flows with insufficient test coverage}
- Recomendación: Agregar casos de prueba E2E que validen flujos completos

### Áreas de Alto Riesgo por Feature

{for each feature in selectedFeatures:
  "**{feature.id}: {feature.title}**
  {Identify high-risk stories within this feature based on coverage}"}

### Resumen de Brechas de Prueba

- Historias sin cobertura de pruebas: {count_total}
  {list all uncovered stories across all features}
- Criterios de Aceptación sin pruebas: {count_total}
  {list critical uncovered ACs}
- Flujos integrados sin validación E2E: {count}

**Recomendaciones Prioritarias:**
1. Agregar casos E2E para flujos integrados (CRÍTICO)
2. Completar cobertura de historias sin pruebas
3. Validar puntos de integración entre features
```

#### 4B.9. Execution Strategy (Consolidated)

Define execution strategy for the consolidated plan:

```markdown
## Estrategia de Ejecución de Pruebas Consolidada

### Fase 1: Pruebas por Feature (Aisladas)
Ejecutar casos de prueba por feature individualmente antes de validar integración.

{for each feature in selectedFeatures:
  "**{feature.id}:**
  - Ejecutar {feature.test_count} casos de prueba
  - Validar funcionalidad aislada
  - Duración estimada: {estimated_time}"}

### Fase 2: Pruebas de Integración (Cross-Feature)
Ejecutar casos que validan integración entre features.

- Flujos integrados identificados: {integrated_flows_count}
- Casos de prueba E2E: {e2e_count}
- Validar puntos de integración

### Fase 3: Validación Completa del Flujo
Ejecutar flujos end-to-end completos que cruzan todos los features seleccionados.

### Prerequisitos y Dependencias

**Dependencias entre Features:**
{Identify if feature-X must be validated before feature-Y}

**Datos de Prueba Requeridos:**
{Consolidate test data requirements from all features}

**Entorno de Pruebas:**
{Specify environment requirements}
```

#### 4B.10. Write Consolidated Test Plan Document

Create ONE consolidated test plan file:

```
File: {featurePlansDir}/consolidated-test-plan-features-{join_feature_ids_with_dash}.md
Example: consolidated-test-plan-features-feature-1-feature-3.md
```

Populate from template with all consolidated sections:

```markdown
---
plan_type: "consolidated"
feature_ids: ["feature-1", "feature-3"]
feature_titles:
  - "feature-1: User Authentication"
  - "feature-3: Session Management"
feature_count: 2
functional_unit: "Complete User Authentication Flow"
frs_covered: [FR-001, FR-002, FR-005]
total_stories: 12
total_test_cases: 45
coverage_rate: 78%
generated_date: {current_date}
---

# Plan de Pruebas Consolidado: {functional_unit_name}

## Features Incluidos

{for each feature:
  "- **{feature.id}:** {feature.title}"}

## Descripción del Plan Consolidado

Este plan de pruebas consolida {featureCount} features que juntos forman una unidad funcional completa: **{functional_unit_name}**.

El objetivo es validar no solo cada feature individualmente, sino también la integración y los flujos end-to-end que cruzan múltiples features.

## Requerimientos Funcionales Cubiertos
{sección 4B.3}

## Objetivos de Prueba
{sección 4B.2}

## Alcance
{sección 4B.4}

## Casos de Prueba por Feature y Historia
{sección 4B.5}

## Flujos Integrados (Cross-Feature)
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

"✅ Plan de prueba CONSOLIDADO generado: `consolidated-test-plan-features-{join_feature_ids}.md`
   - Features agrupados: {featureCount}
   - Historias totales: {count}
   - Casos de prueba totales: {count}
   - Cobertura consolidada: {coverage_rate}%

💡 Este plan agrupa múltiples features en una unidad funcional coherente."

---

### 5. Update workflow progress

**IMPORTANT:** Do NOT add test plan information to traceability-map.md.
The traceability map contains ONLY the implementation hierarchy (PRD→FR→Feature→Story→Task), not test plan information.

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
{if featureScopeMode === "all":
  "✅ **Planes de Prueba por Feature Generados con Éxito**

  📊 **Estadísticas de Planes de Prueba:**
  - Total de planes generados: {count}
  - Features procesados: {count}/{totalFeatures}
  - Casos de prueba organizados: {totalTestCases}

  🎯 **Alcance:** Todos los features procesados (1 plan por feature)

  📁 **Archivos generados:**
  - Directorio: `{featurePlansDir}/`
  - {count} planes de prueba individuales

  **Planes generados:**

  {for each feature:
    \"✅ **{feature.id}: {feature.title}**
        - Archivo: `feature-{feature.id}-test-plan.md`
        - Historias: {count}
        - Casos de prueba: {count}
        - Cobertura: {coverage_rate}%\"
  }"
else:
  "✅ **Plan de Prueba CONSOLIDADO Generado con Éxito**

  📊 **Estadísticas del Plan Consolidado:**
  - Plan consolidado para {featureCount} feature(s)
  - Features agrupados:
    {for each feature_id in targetFeatureIds:
      \"  • {feature_id}: {feature_title}\"
    }
  - Historias procesadas: {count_stories_total}
  - Casos de prueba organizados: {totalTestCases}
  - Flujos integrados identificados: {integrated_flows_count}

  🎯 **Alcance:** {featureCount} feature(s) consolidados en 1 plan

  💡 Este plan agrupa múltiples features que forman una unidad funcional completa.

  📁 **Archivo generado:**
  - Directorio: `{featurePlansDir}/`
  - Archivo: `consolidated-test-plan-features-{join_feature_ids}.md`"
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
- [1-{count}] Ver plan de Feature {id}
- [A] Ver el índice maestro completo
- [N] No, continuar al siguiente paso

Selecciona opción:"

If user selects a plan number:
- Read and display that feature test plan file
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

- IF C: Ensure all feature test plans are saved, workflow progress updated, frontmatter updated with `stepsCompleted: [1, 2, 3, 4]`, only then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#10-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected, all feature test plans are written to {featurePlansDir} section 8 is written to {outputFile}, and frontmatter is updated with `stepsCompleted: [1, 2, 3, 4]` and test plan metadata, will you then load, read entire file, then execute {nextStepFile} to begin the export process.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Template loaded correctly
- Feature test plans directory created
- One test plan generated per Feature
- Feature metadata extracted accurately
- Story-level details extracted from feature epic_source files
- Acceptance criteria mapped to test cases
- Coverage metrics calculated per feature
- Testing gaps identified per feature
- Test execution strategy defined with phases and dependencies
- Risk assessment completed identifying high-risk areas
- Individual test plan files created
- Frontmatter updated with stepsCompleted: [1, 2, 3, 4]
- User confirmed completion

**IMPORTANT:** traceability-map.md is NOT updated in this step. It contains only pure traceability (PRD→FR→Feature→Story→Task), not test plan information.

### ❌ SYSTEM FAILURE:

- Template not loaded
- Directory not created
- Incomplete test plan generation (missing features)
- Missing feature or story metadata
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

**Master Rule:** Feature test plans must be comprehensive, including all mapped test cases, coverage analysis, execution strategy, and gap identification. All plans must be validated before export. The traceability map remains pure (only PRD→FR→Feature→Story→Task).
