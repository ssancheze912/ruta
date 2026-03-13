---
name: 'step-01-init'
description: 'Initialize the traceability workflow by detecting continuation state and validating prerequisites'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/traceability-and-testing'

# File References
thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-build-traceability.md'
continueFile: '{workflow_path}/steps/step-01b-continue.md'
workflowFile: '{workflow_path}/workflow.md'

# Output Directories
traceabilityArtifactsDir: '{implementation_artifacts}/traceability-artifacts'
epicTestPlansDir: '{implementation_artifacts}/epic-test-plans'

# Output Files (4 main files in traceability-artifacts/)
testCasesFile: '{implementation_artifacts}/traceability-artifacts/test-cases.csv'
testCasesSummaryFile: '{implementation_artifacts}/traceability-artifacts/test-cases-summary.md'
traceabilityMapFile: '{implementation_artifacts}/traceability-artifacts/traceability-map.md'
traceabilityExportFile: '{implementation_artifacts}/traceability-artifacts/traceability-export.csv'

# Epic test plan files go in epic-test-plans/ (generated in Step 4)
# epicTestPlansDir: '{implementation_artifacts}/epic-test-plans'

# Template Files
templateFile: '{workflow_path}/templates/traceability-map-template.md'
testCaseTemplateFile: '{workflow_path}/templates/test-cases-template.csv'
testCaseReferenceFile: '{workflow_path}/templates/test-cases-reference.csv'
testCaseStructureDoc: '{workflow_path}/templates/test-cases-structure.md'

# No task references - not using Advanced Elicitation or Party Mode per design
---

# Step 1: Workflow Initialization

## STEP GOAL:

To initialize the traceability and test planning workflow by detecting continuation state, validating prerequisite documents exist (epics.md, pruebas_comandera.xlsm), and extracting FR/Epic/Story structure.

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
- ✅ You bring expertise in requirements traceability and test planning
- ✅ User brings their project context and requirements documentation
- ✅ Together we create comprehensive traceability and test artifacts

### Step-Specific Rules:

- 🎯 Focus ONLY on initialization and prerequisite validation
- 🚫 FORBIDDEN to start building traceability in this step
- 💬 Handle initialization professionally and detect continuation state
- 🚪 DETECT existing workflow state and route to continuation if needed

## EXECUTION PROTOCOLS:

- 🎯 Show analysis before taking any action
- 💾 Initialize document and update frontmatter
- 📖 Set up frontmatter `stepsCompleted: [1]` before loading next step
- 🚫 FORBIDDEN to load next step until setup is complete

## CONTEXT BOUNDARIES:

- Variables from workflow.md are available in memory
- Previous context = what's in output document + frontmatter if it exists
- Don't assume knowledge from other steps
- Input document discovery happens in this step

## TEST CASE FILE STRUCTURE KNOWLEDGE BASE:

🔒 **CRITICAL PRINCIPLE:** This workflow has PERMANENT BUILT-IN KNOWLEDGE of test case file structure.

**NEVER ask the user to describe or explain the structure.**
**ALWAYS use the internal reference files to understand structure.**

The workflow KNOWS the structure through:
1. **Reference File:** `{testCaseReferenceFile}` (1.2 KB, structure only)
2. **Documentation:** `{testCaseStructureDoc}` (complete specification)
3. **Template:** `{testCaseTemplateFile}` (1.2 KB, empty structure)

---

**COMPLETE DOCUMENTATION:** See `{workflow_path}/templates/test-cases-structure.md`
**REFERENCE FILE (FULL):** See `{workflow_path}/templates/test-cases-reference.csv`
**TEMPLATE FILE (MINIMAL):** See `{workflow_path}/templates/test-cases-template.csv`

**Quick Reference:**

**Supported Formats:** Excel (.xlsm) or CSV (.csv)

**Structure:**
- Header rows: 1-10 (metadata and formatting)
- Column names: Row 11 (THE definitive column headers)
- Instructions: Rows 12-33 (help text, not data)
- Data starts: Row 34+

**Key Columns (20 columns total):**
1. **# OP a Probar** - Operation ID (OP-###)
2. **Escenario o Suite de Prueba** - Test scenario/suite name
3. **ID Caso de Prueba** - Test case ID (TC###)
4. **Título del Caso de Prueba** - Test case title
5. **Descripción del Caso de Prueba** - Description
6. **Tipo de Pruebas** - Type (Funcional, Integración, E2E)
7. **Modo de Pruebas** - Mode (Manual, Automatizada)
8. **Precondiciones** - Preconditions
9. **Detalle de Pasos** - Test steps
10. **Resultados Esperados** - Expected results
11. **# Ciclo de prueba** - Cycle number
12. **Fecha de ejecución prueba** - Date (DD/MM/YYYY)
13. **Quien realiza la prueba** - Tester name
14. **Estado ejecución de la Prueba** - Status
15. **Titulo breve del posible Fallo** - Failure title
16. **Descripción completa del posible fallo** - Failure description
17. **Impacto del posible fallo** - Impact level
18. **Estado actual del posible fallo** - Failure status
19. **#OP Creada en Siesa Release** - Release OP number
20. **Notas u Observaciones** - Notes

**Multi-Sheet Structure (Excel):**
- API - API test cases
- Integracion - Integration test cases
- E2E - End-to-end test cases
- Resumen de Métricas Pruebas - Metrics summary

**Hierarchy:** OP → Suite/Scenario → Test Case (TC)

## INITIALIZATION SEQUENCE:

### 1. Check for Existing Workflow

First, check if the output document already exists:

```
Check for file: {outputFile}
```

**If {outputFile} EXISTS:**

"¡Hola {user_name}! Detecté que ya existe un archivo de trazabilidad para este proyecto.

📄 Archivo encontrado: `{outputFile}`

Esto significa que ya iniciaste este workflow anteriormente. Puedo ayudarte a continuar desde donde lo dejaste.

¿Deseas continuar el workflow existente?"

**If user confirms continuation:**

Load, read entire file, then execute `{continueFile}` to resume the workflow.

**If {outputFile} DOES NOT EXIST:**

Proceed to section 2 (Welcome and Overview).

---

### 2. Welcome and Overview

"¡Bienvenido {user_name} al workflow de Trazabilidad y Planificación de Pruebas!

Este workflow te ayudará a:
- 📊 Generar un mapa completo de trazabilidad (FR→Epic→Story→Task)
- 🧪 Crear planes de prueba consolidados por épica
- 📈 Analizar cobertura de casos de prueba
- ⚠️ Identificar gaps en la cobertura de testing

El workflow es lineal con 5 pasos:
1. **Validar Prerequisitos** (este paso)
2. **Construir Mapa de Trazabilidad**
3. **Interpretar Casos de Prueba**
4. **Generar Planes de Prueba por Épica**
5. **Exportar Artefactos** (Markdown + Excel)

Todos los artefactos se generarán en: `{implementation_artifacts}/`

¡Comencemos!"

---

### 3. Document Discovery and Validation

**PREREQUISITE VALIDATION:**

This workflow can operate in two modes:

**Mode 1: Complete Traceability** (epics.md + test cases)
- Generates FR→Epic→Story→Task→Test Case traceability
- Requires: epics.md + test case file

**Mode 2: Test-Based Traceability** (test cases only)
- Generates traceability from existing test cases
- Extracts structure from test case organization (OP, Suite, Test Case)
- Requires: Only test case file

**Search for epics.md:**

Use Glob to search for epics file in planning artifacts (output from Phase 3: Solutioning):

```
Pattern: {planning_artifacts}/*epic*.md
```

**If found:**
"✅ Archivo de épicas encontrado: `[path]`

El workflow operará en **Modo 1: Trazabilidad Completa** (FR→Epic→Story→Task→Test Case)"

Store: `workflow_mode = "complete"`

**If NOT found:**
"ℹ️ No se encontró el archivo de épicas.

El workflow operará en **Modo 2: Trazabilidad Basada en Casos de Prueba**.

En este modo:
- Se extraerá la estructura de trazabilidad desde los casos de prueba existentes
- Se organizará por Tipo de Prueba → Escenario/Suite → Caso de Prueba
- Se generarán planes de prueba consolidados por Tipo/Suite
- No se generará mapeo a FR/Epic/Story (requiere epics.md)

**Nota:** Si deseas trazabilidad completa con FRs/Epics/Stories, ejecuta primero el workflow `create-epics-and-stories`.

¿Deseas continuar en Modo 2?"

Store: `workflow_mode = "test-based"`

WAIT for user confirmation to proceed in Mode 2.

---

**Search for test case files in project:**

Use Glob to search for test case files (any CSV or XLSM):

```
Search patterns:
1. {project-root}/*prueba*.csv
2. {project-root}/*test*.csv
3. {project-root}/*.xlsm
```

**If ONE or MORE files found:**

List found files to user:

"✅ Archivo(s) de casos de prueba encontrado(s) en el proyecto:

{list_of_found_files}

El workflow usará el archivo: `{first_file_found}`"

**Action:**
- Store: `test_file_type = "csv" or "xlsm"`, `test_file_path = "{first_file_found}"`
- Inform: "✅ Usando archivo del proyecto: `{first_file_found}`

  El workflow parseará este archivo usando su conocimiento interno de la estructura estándar (20 columnas).

📝 **Archivos que se generarán en `{implementation_artifacts}/traceability-artifacts/`:**

1. **test-cases-summary.md** - Resumen de casos de prueba (Step 3)
2. **traceability-map.md** - Trazabilidad completa (Steps 2-4)
3. **traceability-export.csv** - Exportación CSV (Step 5)

El archivo `{first_file_found}` será analizado y usado como fuente de datos."

**If NO files found:**

"ℹ️ No se encontraron archivos de casos de prueba en el proyecto.

💡 **El workflow creará automáticamente los archivos necesarios.**

El workflow tiene una base de conocimiento interna con la estructura completa de casos de prueba (formato estándar Siesa - 20 columnas).

📋 **El workflow creará 4 archivos en `{implementation_artifacts}/traceability-artifacts/`:**

1. **test-cases.csv** - Estructura vacía (20 columnas) que el workflow poblará automáticamente
2. **test-cases-summary.md** - Resumen de casos de prueba generados
3. **traceability-map.md** - Trazabilidad completa (FR→Epic→Story→Task→Test Case)
4. **traceability-export.csv** - Trazabilidad exportada en CSV

🤖 **Generación Automática:** El workflow analizará los FRs/Epics/Stories de tu proyecto y generará automáticamente casos de prueba relevantes para cada funcionalidad.

¿Deseas continuar y crear estos archivos, {user_name}?"

**Handle user response:**

**If user confirms (Yes/Continue):**

"Perfecto. Voy a crear los archivos necesarios para el proyecto.

El archivo de casos de prueba se creará VACÍO (solo estructura). El workflow generará automáticamente los casos de prueba basándose en los FRs/Epics/Stories encontrados en tu proyecto."

**Actions:**

1. **Create traceability-artifacts directory:**
   - Create directory: {implementation_artifacts}/traceability-artifacts
   - This will contain the 4 main workflow output files

2. **Create epic-test-plans directory:**
   - Create directory: {implementation_artifacts}/epic-test-plans
   - This will contain individual epic test plan files (generated in Step 4)

3. **Create EMPTY test cases file (structure only, NO data):**
   - Copy {testCaseTemplateFile} to {testCasesFile}
   - Store: `test_file_type = "csv"`, `test_file_path = "{testCasesFile}"`
   - Note: File contains ONLY structure (rows 1-12 with headers), NO test case examples

4. **Initialize output files:**
   - Mark that 4 files will be generated during workflow execution
   - test-cases.csv (already created)
   - traceability-export.csv (will be created in Step 5)
   - test-cases-summary.md (will be created in Step 3)
   - traceability-map.md (will be created in Steps 2-4)

**Inform:**
"✅ **Archivo de casos de prueba creado:** `{testCasesFile}`

📋 **Contenido del archivo:**
- ✅ Estructura completa de 20 columnas (formato estándar Siesa)
- ✅ Encabezados e instrucciones (filas 1-12)
- 📄 **VACÍO** - Sin casos de prueba (el workflow los generará automáticamente)

🤖 **El workflow generará automáticamente casos de prueba basándose en:**
- ✅ Requerimientos Funcionales (FRs) del proyecto
- ✅ Épicas (Epics) del proyecto
- ✅ Historias de Usuario (Stories) del proyecto
- ✅ Funcionalidades identificadas

📝 **Los 4 archivos principales se generarán en `{implementation_artifacts}/traceability-artifacts/`:**

✅ **Ya creado (VACÍO - estructura solamente):**
1. **test-cases.csv** - Listo para poblarse automáticamente

⏳ **Se generarán y poblarán en los siguientes pasos:**
2. **test-cases-summary.md** - Resumen de casos generados (Step 3)
3. **traceability-map.md** - Trazabilidad completa (Steps 2-4)
4. **traceability-export.csv** - Exportación CSV (Step 5)

📁 **Planes de prueba por épica se generarán en `{implementation_artifacts}/epic-test-plans/`:**
- epic-1-test-plan.md (Step 4)
- epic-2-test-plan.md (Step 4)
- etc.

**En Step 3, el workflow:**
1. Analizará automáticamente todos los FRs/Epics/Stories
2. Generará casos de prueba para cada funcionalidad
3. Poblará test-cases.csv con los casos generados
4. Creará el resumen en test-cases-summary.md

No necesitas editar manualmente - el workflow genera todo automáticamente basándose en tu proyecto."

**If user cancels (No/Cancel):**

"Entendido. El workflow se cancelará.

El workflow requiere archivos de casos de prueba para generar la trazabilidad.

📋 **Para ejecutar este workflow después:**
- Ejecuta el workflow de nuevo y confirma la creación de archivos
- O coloca manualmente un archivo de casos de prueba en el proyecto

**Referencia de estructura:**
El workflow espera 20 columnas estándar (formato Siesa FT-SD-007 v5.0).
Ver documentación completa en: `{testCaseStructureDoc}`"

HALT workflow gracefully.

---

### 3.5. Select Test Generation Mode

**CRITICAL:** Before proceeding, determine the test case generation mode based on project type.

This workflow supports **TWO MODES** for test case generation:

**Mode 1: UI Functional Testing** - For projects with user interface
**Mode 2: Backend API Testing** - For backend-only projects (APIs/Services)

Ask user using AskUserQuestion tool:

```json
{
  "questions": [
    {
      "question": "¿Qué tipo de proyecto estás testeando?",
      "header": "Tipo Proyecto",
      "multiSelect": false,
      "options": [
        {
          "label": "Proyecto con UI (Frontend/Fullstack)",
          "description": "Generar casos funcionales para usuarios no técnicos que ejecutarán pruebas desde la interfaz de usuario"
        },
        {
          "label": "Proyecto solo Backend (APIs/Servicios)",
          "description": "Generar casos orientados a validación de endpoints para QA técnicos usando Postman/Insomnia"
        }
      ]
    }
  ]
}
```

**Process user selection:**

**If "Proyecto con UI" selected:**
```
test_generation_mode = "ui-functional"
```

Display:
"✅ **Modo seleccionado: UI Funcional**

📋 **Características de este modo:**
- Casos de prueba redactados para usuarios NO técnicos
- Lenguaje funcional (sin términos de código/API/estado interno)
- Pasos basados en acciones visibles del usuario
- Resultados esperados verificables visualmente
- Prohibido: referencias a código, callbacks, APIs, localStorage, etc.

**Audiencia objetivo:** Testers manuales sin conocimiento técnico"

**If "Proyecto solo Backend" selected:**
```
test_generation_mode = "backend-api"
```

Display:
"✅ **Modo seleccionado: Backend API**

📋 **Características de este modo:**
- Casos de prueba orientados a endpoints
- Incluye estructura de Request/Response
- Casos positivos y negativos (validación, auth, errores)
- Headers, Body, y códigos HTTP esperados
- Formato ejecutable en Postman/Insomnia

**Audiencia objetivo:** Ingenieros QA con herramientas de API testing"

**Store mode in memory:**
```yaml
test_generation_mode: "ui-functional" | "backend-api"
```

This variable will be saved to frontmatter in section 8 and used in Step 3 for test case generation.

---

### 4. Load Test Case Structure from Internal Knowledge Base

**CRITICAL:** The workflow has PERMANENT BUILT-IN KNOWLEDGE of test case file structure.

**NEVER ask the user about structure. ALWAYS use internal reference.**

Load structure knowledge from:

```
Primary Reference: {testCaseReferenceFile}
Documentation: {testCaseStructureDoc}
```

"✅ **Estructura de Casos de Prueba Cargada**

He cargado la estructura estándar de casos de prueba desde la base de conocimiento interna del workflow.

📋 **Estructura Conocida (Siempre la misma):**

**Formato:** CSV/Excel con estructura Siesa (FT-SD-007 v5.0)

**Estructura de archivo:**
- Filas 1-10: Metadatos y formato
- Fila 11: Nombres de columnas (encabezados definitivos)
- Filas 12-33: Instrucciones (no son datos)
- Fila 34+: Casos de prueba (datos)

**20 Columnas estándar:**
1. # OP a Probar
2. Escenario o Suite de Prueba
3. ID Caso de Prueba
4. Título del Caso de Prueba
5. Descripción del Caso de Prueba
6. Tipo de Pruebas
7. Modo de Pruebas
8. Precondiciones
9. Detalle de Pasos
10. Resultados Esperados
11-20. [Ciclo, Fecha, Tester, Estado, Fallos, Impacto, Notas...]

**Jerarquía:** OP → Suite → Test Case

Esta estructura se usará para:
- Parsear archivos existentes del proyecto
- Crear nuevos archivos cuando sea necesario
- Validar la integridad de los datos

**Fuente de conocimiento:** `{testCaseReferenceFile}` (1.2 KB, solo estructura)"

**NO WAIT for user input. This is automatic knowledge loading.**

Store structure information in memory for use in Step 3 parsing.

---

### 5. Extract Requirements and Epics (Mode 1 Only)

**CONDITIONAL:** Only execute this section if `workflow_mode = "complete"` (epics.md found)

**If Mode 1 (Complete Traceability):**

Read the epics.md file completely:

```
Read: {path_to_epics_md}
```

**Extract the following:**

**A. Functional Requirements (FRs):**

Look for section "### Functional Requirements" or similar.

Extract all items in format:
```
FR1: [Description]
FR2: [Description]
...
```

Store as array: `frs: [FR-001, FR-002, ...]`

**B. Epics:**

Look for sections starting with "## Epic" (e.g., "## Epic 1: User Management")

Extract Epic ID and Title:
```
Epic 1: User Management
Epic 2: Authentication System
...
```

Store as array: `epics: [Epic 1, Epic 2, ...]`

**C. Stories:**

For each Epic section, extract Stories (subsections starting with "### Story")

Extract Story ID and Title:
```
Story 1.1: User Registration
Story 1.2: User Profile Management
Story 2.1: Login Functionality
...
```

Store as hierarchical structure

**D. FR Coverage Map:**

Look for section "### FR Coverage Map" or similar.

Extract which Epics cover which FRs:
```
FR1 → Epic 1
FR2 → Epic 1, Epic 2
FR3 → Epic 3
...
```

---

**If Mode 2 (Test-Based Traceability):**

Skip this section. Traceability will be built from test case structure:
- OP → Suite/Scenario → Test Case

Store as: `frs: []`, `epics: []`, `stories: []`

"ℹ️ Operando en Modo 2: La trazabilidad se construirá desde la estructura de casos de prueba (OP → Suite → Test Case)"

---

### 6. Select Epic Scope

**CONDITIONAL:** Only execute this section if `workflow_mode = "complete"` (epics found)

**Check if epic number was provided as parameter:**

```javascript
if (selected_epic_number !== null && selected_epic_number !== undefined) {
    // Epic number was provided as parameter - treat as single epic selection
    epic_scope_mode = "multiple"
    epic_selection = "single"  // For folder naming (always single when from parameter)
    target_epic_numbers = [selected_epic_number]
    epic_count = 1

    // Validate that the epic exists
    epic_exists = check_epic_exists(target_epic_number, all_epics)

    if (!epic_exists) {
        Display error and list available epics
        HALT workflow
    }
} else {
    // No epic number provided - ask user
    PROCEED TO ASK USER
}
```

**If epic number NOT provided as parameter:**

"📋 **Selección de Alcance del Workflow**

**Épicas disponibles en el proyecto:**

{for each epic in all_epics:
  \"Epic {number}: {title}\"
}

**Total de épicas disponibles:** {count_all_epics}

Los casos de prueba son de alto nivel y a veces una funcionalidad completa (como 'login') se desarrolla en múltiples épicas. Agrupar N épicas permite generar casos de prueba más coherentes que cubran una unidad funcional completa.

¿Cuántas épicas deseas analizar?"

**Present options using AskUserQuestion tool:**

```json
{
  "questions": [
    {
      "question": "¿Cuántas épicas deseas analizar en este workflow?",
      "header": "Cantidad",
      "multiSelect": false,
      "options": [
        {
          "label": "Cantidad específica (N épicas)",
          "description": "Agrupar N épicas para generar casos de prueba consolidados de una unidad funcional completa"
        },
        {
          "label": "Todas las épicas",
          "description": "Generar trazabilidad y planes de prueba para todas las épicas del proyecto"
        }
      ]
    }
  ]
}
```

**Process user selection:**

**If user selects "Todas las épicas":**

```javascript
epic_scope_mode = "all"
epic_selection = "all"  // For folder naming
target_epic_numbers = null
epic_count = count_all_epics
filtered_epics = all_epics

"✅ **Alcance seleccionado:** Todas las épicas ({count_all_epics} épicas)

El workflow generará:
- 1 mapa de trazabilidad completo
- 1 plan de prueba consolidado que agrupa todas las épicas
- Casos de prueba para todas las funcionalidades del proyecto"
```

**If user selects "Cantidad específica (N épicas)":**

First, ask how many epics:

"¿Cuántas épicas deseas seleccionar para analizar?

Ingresa un número entre 1 y {count_all_epics}:"

Wait for user input and validate (must be number between 1 and count_all_epics).

Store: `epic_count = user_input_number`

Then, present epic selection using AskUserQuestion with multiSelect:

```json
{
  "questions": [
    {
      "question": "Selecciona las {epic_count} épicas que deseas analizar:",
      "header": "Épicas",
      "multiSelect": true,
      "options": [
        {
          "label": "Epic 1: {title}",
          "description": "FRs: {fr_list} | Historias: {story_count}"
        },
        {
          "label": "Epic 2: {title}",
          "description": "FRs: {fr_list} | Historias: {story_count}"
        },
        {
          "label": "Epic 3: {title}",
          "description": "FRs: {fr_list} | Historias: {story_count}"
        }
        // ... (generate one option per epic)
      ]
    }
  ]
}
```

**Note:** Since AskUserQuestion max options is 4, if there are more than 4 epics, use text input instead:

"**Épicas disponibles:**

{list all epics with numbers, FRs, and story counts}

Por favor ingresa los números de las épicas que deseas analizar, separados por comas.
Ejemplo: 1,3,5

Tu selección (debe seleccionar exactamente {epic_count} épicas):"

Wait for user input and parse response (validate that exactly epic_count numbers are provided).

**Process epic selection:**

```javascript
epic_scope_mode = "multiple"
target_epic_numbers = [extracted_epic_numbers]  // e.g., [1, 3, 5]

// Determine epic_selection for folder naming
if (target_epic_numbers.length === 1) {
    epic_selection = "single"
} else {
    epic_selection = "range"
}

filtered_epics = get_epics_by_numbers(target_epic_numbers)
filtered_stories = get_stories_for_epics(filtered_epics)
filtered_frs = get_frs_for_epics(filtered_epics)

"✅ **Alcance seleccionado:** {epic_count} épicas

**Épicas seleccionadas:**
{for each epic in filtered_epics:
  \"- Epic {number}: {title}\"
}

El workflow generará:
- 1 mapa de trazabilidad (épicas seleccionadas)
- 1 plan de prueba consolidado que agrupa las {epic_count} épicas seleccionadas
- Casos de prueba que cubren la unidad funcional completa

📊 **Elementos a procesar:**
- Épicas: {epic_count}
- FRs relacionados: {count_filtered_frs}
- Historias: {count_filtered_stories}
- Tareas: {count_filtered_tasks}

Esta agrupación permite generar casos de prueba coherentes que cubren funcionalidades completas que se desarrollaron en múltiples épicas."
```

**Store selection in memory:**

```yaml
epic_scope_mode: "all" | "multiple"
target_epic_numbers: null | [1, 3, 5]  # Array of epic numbers
epic_count: {number}  # Count of selected epics
```

This will be saved to frontmatter in section 8.

---

**If Mode 2 (Test-Based Traceability):**

Skip epic selection. Mode 2 always processes all test cases.

```
epic_scope_mode = "all"
epic_selection = "all"  // For folder naming
target_epic_numbers = null
epic_count = 0
```

---

### 7. Search for Individual Story Files (Optional)

Check if individual story files exist with detailed tasks:

```
Pattern: {implementation_artifacts}/*story*.md
```

**If found:**
"✅ Encontré [N] archivos de historias individuales. Estos se usarán para extraer tareas detalladas."

**If NOT found:**
"ℹ️ No se encontraron archivos de historias individuales. La trazabilidad se basará en la información de `epics.md`."

---

### 8. Initialize All Output Documents

**Create 4 output files that will be populated during workflow:**

**File 1: test-cases.csv**
- Already created if not found in project
- Contains test case data (20 columns)
- Location: `{testCasesFile}`

**File 2: test-cases-summary.md**
- Will be created in Step 3
- Location: `{testCasesSummaryFile}`

**File 3: traceability-map.md**
- Main output document
- Load template and create now:

```
Read: {templateFile}
Write to: {traceabilityMapFile}
```

**Convert all paths to relative paths before saving:**

🚨 **CRITICAL PATH RULE:** All file paths saved in frontmatter and document content MUST be relative to {project-root}, never absolute.

```javascript
// Convert absolute paths to relative paths
function make_relative_path(absolute_path, project_root) {
    // Remove project_root prefix to make path relative
    // Example: C:\Users\...\project\_bmad-output\... → _bmad-output\...
    return absolute_path.replace(project_root + path_separator, "")
}

// Apply to all paths before saving
path_to_epics_md_relative = make_relative_path(path_to_epics_md, project_root)
test_file_path_relative = make_relative_path(test_file_path, project_root)
testCasesFile_relative = make_relative_path(testCasesFile, project_root)
testCasesSummaryFile_relative = make_relative_path(testCasesSummaryFile, project_root)
traceabilityMapFile_relative = make_relative_path(traceabilityMapFile, project_root)
traceabilityExportFile_relative = make_relative_path(traceabilityExportFile, project_root)
```

**Initialize frontmatter (Mode-dependent):**

**If Mode 1 (Complete):**
```yaml
---
stepsCompleted: [1]
workflowMode: "complete"
epicScopeMode: "{epic_scope_mode}"  # "all" or "multiple"
epicSelection: "{epic_selection}"  # "all", "single", or "range" (for folder naming)
targetEpicNumbers: {target_epic_numbers}  # null or [1, 3, 5] (array of selected epic numbers)
epicCount: {epic_count}  # Number of epics being processed
selectedEpics: {target_epic_numbers}  # Duplicate for step-03 compatibility
testGenerationMode: "{test_generation_mode}"  # "ui-functional" or "backend-api"
generatedBy: "traceability-and-testing workflow"
generatedDate: "{current_date}"
projectName: "{project_name}"
outputFiles:
  - "{testCasesFile_relative}"
  - "{testCasesSummaryFile_relative}"
  - "{traceabilityMapFile_relative}"
  - "{traceabilityExportFile_relative}"
inputDocuments:
  - "{path_to_epics_md_relative}"
  - "{test_file_path_relative}"
testFileType: "{test_file_type}"
frs: [FR-001, FR-002, ...]  # Filtered to selected epics if multiple mode
epics: [Epic 1, Epic 2, ...]  # Filtered to selected epics if multiple mode
stories: [1.1, 1.2, 2.1, ...]  # Filtered to selected epics if multiple mode
testCaseStructure: "See workflow step-01-init.md > TEST CASE CSV STRUCTURE"
---
```

**IMPORTANT:** Use `{variable}_relative` for ALL paths in frontmatter to ensure relative paths are saved.

**If Mode 2 (Test-Based):**
```yaml
---
stepsCompleted: [1]
workflowMode: "test-based"
epicScopeMode: "all"  # Mode 2 always processes all
epicSelection: "all"  # For folder naming
targetEpicNumbers: null
selectedEpics: []  # Empty for Mode 2
testGenerationMode: "{test_generation_mode}"  # "ui-functional" or "backend-api"
generatedBy: "traceability-and-testing workflow"
generatedDate: "{current_date}"
projectName: "{project_name}"
outputFiles:
  - "{testCasesFile_relative}"
  - "{testCasesSummaryFile_relative}"
  - "{traceabilityMapFile_relative}"
  - "{traceabilityExportFile_relative}"
inputDocuments:
  - "{test_file_path_relative}"
testFileType: "{test_file_type}"
frs: []
epics: []
stories: []
testCaseStructure: "See workflow step-01-init.md > TEST CASE CSV STRUCTURE"
ops: []  # Will be populated in Step 2
suites: []  # Will be populated in Step 2
testCases: []  # Will be populated in Step 2
---
```

**IMPORTANT:** Use `{variable}_relative` for ALL paths in frontmatter to ensure relative paths are saved.

**Initialize document body from template:**

Replace placeholders in template:
- `{{project_name}}` → actual project name
- `{{date}}` → current date

Leave other placeholder sections for future steps.

**File 4: traceability-export.csv**
- Will be created in Step 5 (Export)
- Location: `{traceabilityExportFile}`

---

### 9. Present Summary to User

**Display extracted information (Mode-dependent):**

**If Mode 1 (Complete Traceability):**

"📋 **Prerequisitos Validados con Éxito - Modo 1: Trazabilidad Completa**

✅ **Archivo de Épicas:** `{path_to_epics_md_relative}`
   - Requerimientos Funcionales encontrados: {count_all_frs}
   - Épicas encontradas: {count_all_epics}
   - Historias de Usuario encontradas: {count_all_stories}

🎯 **Alcance del Workflow:**
   {if epic_scope_mode === "all":
     \"- ✅ Procesando TODAS las épicas ({count_all_epics} épicas)
     - Se generará 1 plan de prueba consolidado\"
   else:
     \"- ✅ Procesando {epic_count} épica(s) seleccionada(s):
     {for each epic_number in target_epic_numbers:
       \"  • Epic {epic_number}: {epic_title}\"
     }
     - FRs relacionados: {count_filtered_frs}
     - Historias relacionadas: {count_filtered_stories}
     - Tareas relacionadas: {count_filtered_tasks}
     - Se generará 1 plan de prueba consolidado que agrupa las {epic_count} épicas

     💡 Esta agrupación permite generar casos de prueba coherentes para funcionalidades completas.\"
   }

✅ **Archivo de Casos de Prueba:** `{test_file_path_relative}` ({test_file_type})
   - Formato: Documentado en workflow (ver sección TEST CASE CSV STRUCTURE)
   - Hojas: API, Integracion, E2E, Resumen de Métricas
   - Columnas clave: OP, Suite, ID Caso, Título, Descripción, Tipo, Pasos, Resultados

📁 **Archivos Opcionales:**
   - Archivos de historias individuales: {count_story_files} encontrados

**Ejemplos de elementos extraídos:**

**Requerimientos Funcionales (primeros 3):**
- {FR1}
- {FR2}
- {FR3}

{if epic_scope_mode === "all":
  \"**Épicas (primeras 3):**
  - {Epic 1}
  - {Epic 2}
  - {Epic 3}\"
else:
  \"**Épicas seleccionadas:**
  {for each epic in filtered_epics:
    \"- Epic {number}: {title}\"
  }\"
}

**Mapeo FR→Epic (ejemplos):**
- {FR1} → {Epics covering FR1}
- {FR2} → {Epics covering FR2}

📄 **Archivos de salida inicializados (en `{implementation_artifacts}/traceability-artifacts/`):**

✅ **Casos de Prueba:**
1. `{testCasesFile}` (CSV - 20 columnas)

⏳ **Se generarán durante el workflow:**
2. `{testCasesSummaryFile}` (MD - Resumen)
3. `{traceabilityMapFile}` (MD - Trazabilidad completa)
4. `{traceabilityExportFile}` (CSV - Exportación)

📁 **Planes de prueba (en `{implementation_artifacts}/epic-test-plans/`):**
- Se generará 1 plan de prueba consolidado en Step 4

El workflow generará trazabilidad completa: FR → Epic → Story → Task → Test Case

¿Todo se ve correcto? ¿Falta algo por incluir?"

---

**If Mode 2 (Test-Based Traceability):**

"📋 **Prerequisitos Validados con Éxito - Modo 2: Trazabilidad Basada en Casos de Prueba**

✅ **Archivo de Casos de Prueba:** `{test_file_path_relative}` ({test_file_type})
   - Formato: Documentado en workflow (ver sección TEST CASE CSV STRUCTURE)
   - Hojas: API, Integracion, E2E, Resumen de Métricas
   - Columnas clave: OP, Suite, ID Caso, Título, Descripción, Tipo, Pasos, Resultados

**Estructura de trazabilidad que se generará:**
- OP (Operación) → Suite/Escenario → Caso de Prueba
- Organización por tipo: API, Integración, E2E
- Mapeo con OPs de Siesa Release

📄 **Archivos de salida inicializados (4 archivos):**

✅ **Casos de Prueba:**
1. `{testCasesFile}` (CSV - 20 columnas)

⏳ **Se generarán durante el workflow:**
2. `{testCasesSummaryFile}` (MD - Resumen)
3. `{traceabilityMapFile}` (MD - Trazabilidad OP→Suite→TC)
4. `{traceabilityExportFile}` (CSV - Exportación)

**Nota:** Sin archivo epics.md, no se generará mapeo a FR/Epic/Story.
Si más adelante necesitas trazabilidad completa, ejecuta primero el workflow `create-epics-and-stories`.

¿Todo se ve correcto? ¿Deseas continuar?"

---

**Wait for user confirmation.**

If user requests changes, update the extracted data accordingly.

---

### 10. Final Validation

Ask user (Mode-dependent):

**If Mode 1:**

""**Confirmación final antes de continuar:**

✅ **Prerequisitos validados:**
- {count_frs} Requerimientos Funcionales (total en proyecto)
- {count_all_epics} Épicas (total en proyecto)
- {count_all_stories} Historias de Usuario (total en proyecto)
- Archivo de casos de prueba: `{test_file_path_relative}`

🎯 **Alcance seleccionado:**
{if epic_scope_mode === "all":
  \"- Procesando TODAS las épicas ({count_all_epics} épicas)
  - Se generará 1 plan de prueba consolidado para todas las épicas
  - FRs a procesar: {count_all_frs}
  - Historias a procesar: {count_all_stories}\"
else:
  \"- Procesando {epic_count} épica(s) seleccionada(s)
  - Épicas: {list_target_epic_numbers_with_titles}
  - Se generará 1 plan de prueba consolidado que agrupa las {epic_count} épicas
  - FRs relacionados: {count_filtered_frs}
  - Historias relacionadas: {count_filtered_stories}
  - Tareas relacionadas: {count_filtered_tasks}

  💡 Esta agrupación permite generar casos de prueba coherentes para funcionalidades completas que se desarrollaron en múltiples épicas (ej: 'login' que abarca autenticación, sesión, y recuperación de contraseña).\"
}

📋 **Los 4 archivos principales (en `{implementation_artifacts}/traceability-artifacts/`):**
1. **test-cases.csv** - Casos de prueba ✅ (creado)
2. **test-cases-summary.md** - Resumen ⏳ (Step 3)
3. **traceability-map.md** - Trazabilidad ⏳ (Steps 2-4)
4. **traceability-export.csv** - Exportación CSV ⏳ (Step 5)

📁 **Planes de prueba (en `{implementation_artifacts}/epic-test-plans/`):**
- Se generará 1 plan de prueba consolidado en Step 4

**Modo de operación:** Trazabilidad Completa

El siguiente paso construirá la jerarquía completa de trazabilidad (FR→Epic→Story→Task→Test Case).

¿Estás listo para continuar?""

---

**If Mode 2:**

"**Confirmación final antes de continuar:**

✅ **Prerequisitos validados:**
- Archivo de casos de prueba: `{test_file_path_relative}` ({test_file_type})
- Estructura de 20 columnas confirmada

📋 **Los 4 archivos principales (en `{implementation_artifacts}/traceability-artifacts/`):**
1. **test-cases.csv** - Casos de prueba ✅ (creado/encontrado)
2. **test-cases-summary.md** - Resumen ⏳ (Step 3)
3. **traceability-map.md** - Trazabilidad ⏳ (Steps 2-4)
4. **traceability-export.csv** - Exportación CSV ⏳ (Step 5)

📁 **Planes de prueba (en `{implementation_artifacts}/epic-test-plans/`):**
- Se generarán en Step 4

**Modo de operación:** Trazabilidad Basada en Casos de Prueba

El siguiente paso:
1. Parseará el archivo de casos de prueba
2. Construirá la jerarquía: OP → Suite → Test Case
3. Generará los 4 archivos de salida
4. Identificará gaps de cobertura

¿Estás listo para continuar?"

---

### 11. Present MENU OPTIONS

Display: **Confirma para [C] continuar:**

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- User can chat or ask questions - always respond and then end with display again of the menu option

#### Menu Handling Logic:

- IF C: Save all to {outputFile}, update frontmatter with `stepsCompleted: [1]`, only then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#10-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected, all information is saved to {outputFile}, and frontmatter is updated with `stepsCompleted: [1]`, will you then load, read entire file, then execute {nextStepFile} to begin building the traceability map.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Continuation detection worked correctly
- All prerequisite documents found and validated
- FRs, Epics, Stories extracted correctly
- Excel structure information captured
- Template loaded and output document created
- Frontmatter initialized with correct metadata
- User confirmed information is complete

### ❌ SYSTEM FAILURE:

- Not checking for existing workflow (continuation)
- Missing prerequisite documents not detected
- Incomplete extraction of FRs/Epics/Stories
- Not capturing Excel structure information
- Template not loaded or output file not created
- Frontmatter not properly initialized
- Proceeding to next step without user confirmation

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
