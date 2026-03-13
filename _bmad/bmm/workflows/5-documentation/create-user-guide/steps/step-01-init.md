---
name: 'step-01-init'
description: 'Initialize the user guide generation workflow by detecting continuation state and configuring target audience'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/5-documentation/create-user-guide'

# File References
thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-seleccion-epicas.md'
continueFile: '{workflow_path}/steps/step-01b-continue.md'
workflowFile: '{workflow_path}/workflow.md'
outputFileSpanish: '{output_folder}/documentation-artifacts/user-guide/es/{audience}-guide.md'
templateSpanish: '{workflow_path}/templates/user-guide-template-es.md'

# Data References
audienceTypesData: '{workflow_path}/data/audience-types.csv'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

# Config
bmmConfig: '{project-root}/_bmad/bmm/config.yaml'
---

# Step 1: Inicialización del Workflow

## STEP GOAL:

Detectar si existe un workflow en ejecución (continuación) o inicializar un nuevo workflow de generación de guías de usuario. Determinar audiencia objetivo, verificar guías existentes para evitar sobrescrituras accidentales, y crear el documento de output con frontmatter inicial.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a technical writer and documentation specialist
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring documentation expertise and structure, user brings project knowledge
- ✅ Maintain collaborative professional tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on initialization and audience configuration
- 🚫 FORBIDDEN to look ahead to future steps
- 💬 Handle initialization professionally
- 🚪 DETECT existing workflow state and handle continuation properly

## EXECUTION PROTOCOLS:

- 🎯 Show analysis before taking any action
- 💾 Initialize document and update frontmatter
- 📖 Set up frontmatter `stepsCompleted: [1]` before loading next step
- 🚫 FORBIDDEN to load next step until setup is complete

## CONTEXT BOUNDARIES:

- Variables from workflow.md and config.yaml are available
- Previous context = what's in output document + frontmatter (if exists)
- Don't assume knowledge from other steps
- Input document discovery happens in step-03

## INITIALIZATION SEQUENCE:

### 1. Load Configuration

Load `{bmmConfig}` and resolve:
- `{project_name}`
- `{communication_language}`
- `{document_output_language}`
- `{planning_artifacts}`
- `{implementation_artifacts}`
- `{project_knowledge}`

Communicate with user in `{communication_language}` (typically Spanish).

### 2. Load Audience Types Data

Load and parse `{audienceTypesData}` to understand available audience types:
- enduser (Usuarios Finales / End Users)
- admin (Administradores / Administrators)
- api (Consumidores de API / API Consumers)
- mixed (Audiencia Mixta / Mixed Audience)

### 3. Check for Existing User Guides

Scan for existing user guides in:
- `{output_folder}/documentation-artifacts/user-guide/es/*.md`
- `{output_folder}/documentation-artifacts/user-guide/en/*.md`

For each guide found:
- Read frontmatter to extract: target_audience, generated_date, review_status
- Check if it has `stepsCompleted` array

### 4. Handle Continuation (If Guides Exist with stepsCompleted)

**If guides exist with `stepsCompleted` array AND steps are incomplete:**

"🔄 **Workflow en Ejecución Detectado**

He encontrado una guía de usuario en progreso:
- Audiencia: {target_audience}
- Última modificación: {last_modified}
- Steps completados: {stepsCompleted}
- Step actual: {currentStep}

Voy a cargar el estado previo para continuar donde dejamos..."

**STOP here and immediately load, read entire file, then execute `{continueFile}`**

### 5. Handle Completed Guides

**If guides exist with ALL steps completed (stepsCompleted includes all 7 steps):**

"✅ **Guía Existente Encontrada**

He encontrado una guía de usuario completada:
- Audiencia: {target_audience}
- Generada: {generated_date}
- Estado: {review_status}

¿Qué deseas hacer?

**[N]** Nueva guía - Crear una nueva guía de usuario
**[U]** Update - Actualizar la guía existente (re-ejecutar workflow)
**[R]** Replace - Reemplazar completamente (borrar y crear nueva)
**[X]** Cancel - Cancelar workflow

Por favor selecciona una opción:"

**Menu Handling:**
- IF N: Continue with fresh workflow (step 6)
- IF U: Load `{continueFile}` to resume and update
- IF R: Delete existing files, continue with fresh workflow (step 6)
- IF X: HALT workflow and inform user

### 6. Fresh Workflow Setup (If No Guides or User Selected New)

"👋 **Bienvenido al Generador de Guías de Usuario**

Este workflow te ayudará a crear guías de usuario comprehensivas en español e inglés desde la documentación existente de tu proyecto (PRDs, épicas, stories).

**Características:**
- 📄 Guías bilingües (español/inglés) con estructura idéntica
- 📊 Diagramas Mermaid para features y workflows
- 📸 Screenshot placeholders con índice consolidado
- 🔗 Trazabilidad completa a fuentes (épicas, stories)
- ✅ Validación de completitud y calidad

Comencemos configurando la guía de usuario..."

#### A. Determine Target Audience

"**¿Para qué audiencia deseas generar la guía de usuario?**

Según tu proyecto, puedo crear guías optimizadas para:

**[E]** Usuarios Finales (Enduser)
   - Personas que interactúan con la aplicación
   - Enfoque: tareas cotidianas, UI, workflows

**[A]** Administradores (Admin)
   - Personas que gestionan el sistema
   - Enfoque: configuración, gestión de usuarios, mantenimiento

**[I]** Consumidores de API (API)
   - Desarrolladores que integran con el sistema
   - Enfoque: endpoints, autenticación, ejemplos de código

**[M]** Audiencia Mixta (Mixed)
   - Usuarios finales + administradores
   - Enfoque: guía completa con todas las perspectivas

Por favor selecciona una opción (E/A/I/M):"

**Wait for user input and parse response:**
- E → audience_id = "enduser", filename_prefix = "enduser-guide"
- A → audience_id = "admin", filename_prefix = "admin-guide"
- I → audience_id = "api", filename_prefix = "api-guide"
- M → audience_id = "mixed", filename_prefix = "complete-guide"

Store selected audience information from CSV data.

#### B. Create Output Document

Load template from `{templateSpanish}` and create initial Spanish output file at:
`{output_folder}/documentation-artifacts/user-guide/es/{filename_prefix}.md`

Initialize with frontmatter:

```yaml
---
# Workflow state
stepsCompleted: [1]
currentStep: step-01-init
workflow_name: create-user-guide
workflow_version: 1.0.0

# Project context
project_name: "{project_name}"
generated_date: "{current_date}"
last_modified: "{current_timestamp}"

# Configuration
target_audience: "{audience_id}"
output_language: "es"
epics_selected: []
epics_excluded: []

# Source artifacts discovered (populated in step-03)
source_artifacts:
  prd_docs: []
  epics_file: ""  # Path to consolidated epics.md file
  architecture_docs: []
  workflow_docs: []

# Content tracking
features_documented: 0
workflows_documented: 0
diagrams_generated: 0
screenshot_placeholders: 0

# Quality metrics
source_citations_count: 0
completeness_score: 0
review_status: "draft"

# User preferences (populated in step-04)
technical_level: ""
include_troubleshooting: false
additional_scenarios: []

# Bilingual output
spanish_version: "{output_folder}/documentation-artifacts/user-guide/es/{filename_prefix}.md"
english_version: "{output_folder}/documentation-artifacts/user-guide/en/{filename_prefix}.md"
translation_completed: false
---

# {project_name} - Guía de Usuario

[El contenido se generará en los siguientes steps]
```

#### C. Confirmation Message

"✅ **Configuración Inicial Completada**

- Audiencia objetivo: **{audience_name_es}**
- Idioma base: Español (se traducirá a inglés en step-06)
- Documento creado: `{output_folder}/documentation-artifacts/user-guide/es/{filename_prefix}.md`

Continuando a la selección de épicas..."

### 7. Update State and Proceed

Before loading next step:
- Ensure frontmatter.stepsCompleted = [1]
- Ensure frontmatter.currentStep = "step-02-seleccion-epicas"
- Save outputFile

### 8. Present MENU OPTIONS

Display: **Select an Option:** [C] Continue

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- User can chat or ask questions - always respond and then end with display again of the menu options

#### Menu Handling Logic:

- IF C: Update frontmatter, then load, read entire file, then execute `{nextStepFile}`
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#8-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and initialization is complete (OR continuation is properly routed to step-01b-continue.md), will you then load, read entire file, then execute `{nextStepFile}` to begin epic selection.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Configuration loaded from config.yaml
- Audience types loaded from CSV
- Existing guides checked and handled appropriately
- Continuation routed to step-01b-continue.md if needed
- OR new document created from template with complete frontmatter
- frontmatter.stepsCompleted = [1]
- User welcomed and confirmed audience selection
- Ready to proceed to step 2

### ❌ SYSTEM FAILURE:

- Not checking for existing documents properly
- Not routing to step-01b-continue.md when appropriate
- Creating duplicate documents
- Missing audience configuration
- Not initializing frontmatter completely
- Proceeding without user confirmation

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
