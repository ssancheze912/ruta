---
name: traceability-and-testing
description: 'Generate functional traceability map (FR→Epic→Story→Task) and consolidated epic-level test plans from existing test cases'
web_bundle: true
version: 1.0.0
testCaseFormat: 'Siesa Standard (FT-SD-007 v5.0)'
parameters:
  feature_id:
    description: 'Optional: Feature ID to process (e.g., "feature-1", "feature-2"). If not provided, user will be prompted to select from features-status.yaml'
    required: false
    type: string
---

# Traceability & Test Planning Workflow

**Goal:** Create comprehensive functional traceability from requirements to tasks and generate epic-level test plans consolidating existing test cases.

**Your Role:** In addition to your name, communication_style, and persona, you are also a Test Architect and Requirements Engineer collaborating with the project team. This is a partnership, not a client-vendor relationship. You bring expertise in requirements traceability, test planning, and quality assurance, while the user brings their project context, requirements documentation, and testing needs. Work together as equals.

---

## Test Case File Format

This workflow uses a standardized test case format based on Siesa standards (FT-SD-007 v5.0).

**Complete Documentation:** `{workflow_path}/templates/test-cases-structure.md`
**CSV Template:** `{workflow_path}/templates/test-cases-template.csv`
**Templates README:** `{workflow_path}/templates/README.md`

The workflow has **permanent built-in knowledge** of the test case file structure through these template files. All projects using this workflow should follow the documented structure for consistent parsing and traceability generation.

---

## Test Scope and Levels

**IMPORTANT:** This workflow focuses on **functional-level testing and above**, NOT unit testing.

**Supported Test Types:**
- **Funcional (Functional):** Tests that validate complete features, user flows, and business requirements from an end-user perspective
- **Integración (Integration):** Tests that validate interaction between components, modules, or systems
- **E2E (End-to-End):** Tests that validate complete user journeys across the entire application

**OUT OF SCOPE:**
- Unit tests (code-level, developer-focused tests)
- Component tests (isolated UI component tests)
- Code coverage metrics

**Focus:** This workflow generates and organizes test cases at the **acceptance level** - validating that the system meets functional requirements and user expectations, not testing individual code units.

---

## TEST GENERATION MODES

This workflow supports **TWO MODES** for test case generation, each tailored to different project types and target audiences. The mode is selected during initialization and affects how test cases are written.

### Mode 1: UI Functional Testing

**When to use:** Projects with user interface (Frontend, Fullstack)

**Target audience:** Manual testers or users with NO technical background who execute tests from the UI

**Test case characteristics:**
- Written in **functional, user-visible language**
- Steps describe user actions (click, type, select, navigate)
- Results describe visual outcomes (appears, displays, shows)
- **Strictly prohibits technical terms:** No code references, API details, callbacks, localStorage, HTTP codes, state management, or framework-specific concepts

**Example test case (UI mode):**
```
Title: Crear factura con múltiples productos
Steps:
1. Iniciar sesión como usuario Facturador
2. Ir al menú Ventas → Nueva Factura
3. Hacer clic en "Agregar Producto"
4. Escribir "PROD001" en el campo Código
5. Hacer clic en "Guardar"

Expected Results:
1. Sistema autentica al usuario
2. Pantalla de factura se muestra
3. Producto aparece en la lista
4. Total se calcula automáticamente
5. Mensaje "Factura guardada" aparece
```

**Language validation:**
- ✅ "Hacer clic en el botón Guardar" | ❌ "Ejecutar callback handleSave()"
- ✅ "Aparece mensaje de error" | ❌ "Estado cambia a 'error'"
- ✅ "El campo está deshabilitado" | ❌ "Propiedad disabled=true"

---

### Mode 2: Backend API Testing

**When to use:** Backend-only projects (APIs, Microservices)

**Target audience:** QA engineers who validate APIs using Postman, Insomnia, or test scripts (NO source code access)

**Test case characteristics:**
- Include **endpoint, HTTP method, headers, body structure**
- Specify **expected HTTP status codes** and response structure
- Generate **positive AND negative test cases** (happy path + validation/auth/edge cases)
- Provide **executable JSON examples** that can be copied to API testing tools

**Example test case (API mode):**
```
Title: POST /api/facturas - Crear factura exitosamente
Type: Positivo

Preconditions:
• Endpoint /api/v1/facturas disponible
• Token de admin válido
• Cliente ID "CLI-001" existe

Steps:
1. Configurar headers:
   - Authorization: Bearer {{admin_token}}
   - Content-Type: application/json
2. Preparar body:
   {
     "cliente_id": "CLI-001",
     "productos": [{"codigo": "PROD001", "cantidad": 5}]
   }
3. Enviar POST a /api/v1/facturas
4. Capturar respuesta

Expected Results:
• Status: 201 Created
• Body contiene:
  {
    "success": true,
    "data": {
      "factura_id": "[uuid]",
      "numero": "FAC-2026-0001",
      "total": 5000
    }
  }
```

**Negative test example (API mode):**
```
Title: POST /api/facturas - Validar campo cliente_id requerido
Type: Negativo - Validación

Body: { "productos": [...] }  // Sin cliente_id

Expected Results:
• Status: 400 Bad Request
• Body: { "error": "El campo cliente_id es requerido" }
```

**Test categories generated:**
- ✅ Happy path (valid data)
- ✅ Validation (missing/invalid fields)
- ✅ Authentication (no token, expired token)
- ✅ Authorization (insufficient permissions)
- ✅ Edge cases (boundaries, null values, special characters)

---

### Mode Selection

**During workflow initialization (Step 1):**
1. User is prompted to select project type:
   - **"Proyecto con UI (Frontend/Fullstack)"** → `ui-functional` mode
   - **"Proyecto solo Backend (APIs/Servicios)"** → `backend-api` mode

2. Mode is stored in frontmatter:
   ```yaml
   testGenerationMode: "ui-functional" | "backend-api"
   ```

3. Test generation (Step 3) applies mode-specific guidelines:
   - **UI mode:** Prohibits all technical terms, focuses on user-visible actions
   - **API mode:** Includes HTTP details, generates positive + negative cases

**Reference documentation:**
- Full quality guidelines: See `{workflow_path}/steps/step-03-interpret-tests.md > Section 1.5`
- Structure reference: See `{workflow_path}/templates/test-cases-structure.md > Test Generation Modes`

---

## WORKFLOW ARCHITECTURE

**EXECUTION MODE: Feature-Selection + Automated Megaprompt**

This workflow asks the user which features to analyze, then executes the megaprompt automatically with the selected data. One interactive step at the start, then fully autonomous execution.

### Architecture Principles

- **Single Feature-Selection Step**: Ask user which features to process before anything else
- **Automated Execution After Selection**: Once features are chosen, no more user input required
- **Comprehensive Output**: Generates complete test design documentation in one pass
- **BMAD V6.0 Methodology**: Implements all 4 phases (Gatekeeper, FAC, Blind Spots, ISO 29119-4)
- **Structured Output**: Produces formatted tables (I-V) plus traceability matrix

### Execution Flow

1. **Select Features** → Ask user which features from `feature-status.yaml` to process
2. **Load Configuration** → Read project config and load selected feature files
3. **Execute Megaprompt** → Run complete analysis (4 phases)
4. **Generate Output** → Create comprehensive test-design-complete.md file
5. **Confirm Completion** → Report metrics and file location to user

### Critical Rules (NO EXCEPTIONS)

- 🎯 **ALWAYS** ask the user to select features BEFORE loading data or executing the megaprompt
- 🎯 **ALWAYS** execute the complete megaprompt without stopping
- 📄 **ALWAYS** load `prompts/MegaPrompt_DiseñoPruebas_BMAD_V6_Feb6.md` as the execution source
- 📁 **ALWAYS** create timestamped folder: `{implementation_artifacts}/traceability-artifacts/test-design-YYYY-MM-DD-HHmmss/` (use current date and time)
- 💾 **ALWAYS** save all 6 documents inside the timestamped folder
- 📋 **ALWAYS** include frontmatter with metadata in generated files
- ✅ **ALWAYS** communicate in `{communication_language}` (Spanish for user messages)
- 📝 **ALWAYS** generate documents in `{document_output_language}` (English for test design)
- 📁 **ALWAYS** use relative paths (from project-root) in generated documents, NEVER absolute paths

### Alternative Mode (Preserved for Future Use)

The original interactive step-by-step workflow files are preserved in the `steps/` directory. These can be used if interactive, user-guided execution is needed in the future. However, the default execution mode is now fully automated via the megaprompt.

---

## WORKFLOW PARAMETERS

### Feature Selection (Optional)

This workflow can process:
- **All features** (default): Generate traceability and test plans for all features in `feature-status.yaml`
- **Multiple features**: Process a specific subset of features to group related functionality
- **Single feature**: Process only a specific feature by ID (e.g., "feature-1", "feature-2")

**Why group features?**
Test cases are high-level and functional. Sometimes a complete functional unit (like "lead capture") spans multiple features. Grouping N features allows generating coherent test cases that cover a complete functional unit.

**Usage:**
```
/traceability-and-testing                  # Process all features (user will be prompted)
/traceability-and-testing feature-1        # Process only feature-1
```

If no feature ID is provided as a parameter, the workflow will ask the user to select:
1. **All features**: Process everything from `feature-status.yaml`
2. **N features**: Specify which feature IDs to analyze

Each feature points to its `epic_source` file defined in `feature-status.yaml`.

---

## PATH HANDLING RULES

🚨 **CRITICAL:** All file paths written to generated documents (frontmatter, content, messages) MUST be relative to {project-root}.

**Why:** Absolute paths (e.g., `C:\Users\username\Desktop\project\...`) are specific to one machine and break portability.

**Rule:** Before writing ANY path to a document or frontmatter:
1. Check if path is absolute (contains drive letter like `C:\` or starts with `/` on Unix)
2. Convert to relative path by removing {project-root} prefix
3. Use the relative path in the document

**Example:**
```javascript
// Absolute path (DON'T use in documents)
absolute_path = "C:\Users\ssancheze\Desktop\Dev\project\_bmad-output\4-implementation\test-cases.csv"

// Relative path (DO use in documents)
relative_path = "_bmad-output\4-implementation\test-cases.csv"
```

**Apply to:**
- Frontmatter fields: `inputDocuments`, `outputFiles`
- Document content: any file references
- User-facing messages: any displayed paths

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from {project-root}/_bmad/bmm/config.yaml and resolve:

- `project_name`, `output_folder`, `planning_artifacts`, `implementation_artifacts`
- `user_name`, `communication_language`, `document_output_language`
- ✅ YOU MUST COMMUNICATE in `{communication_language}` (Spanish for user interaction)
- ✅ DOCUMENTS MUST BE in `{document_output_language}` (English for all generated documents)

### 2. Parameter Capture

Capture the `feature_id` parameter if provided by the user (e.g., from command arguments).

Store in memory as: `selected_feature_id` (can be null if not provided)

### 3. Input Collection and Megaprompt Execution

**Execution Instructions:**

#### Step 3.0: Feature Selection (Interactive)

1. **Load feature registry:**
   - Read: `{implementation_artifacts}/feature-status.yaml`
   - Parse YAML to extract all features: `[{id, epic_source, status, last_update}, ...]`

2. **If `selected_feature_id` was provided as parameter:**
   - Validate it exists in the registry; if not, list available IDs and halt
   - Set `filtered_features = [that single feature]`
   - Notify: `✅ Feature seleccionado por parámetro: {selected_feature_id}`
   - **Skip to Step 3.1**

3. **If no parameter was provided, ask the user:**

   Display available features:
   ```
   📋 Features disponibles en el proyecto:

   {for each feature:
     "  • {feature.id}  [{feature.status}]  →  {feature.epic_source}"
   }
   ```

   Ask using AskUserQuestion tool:
   ```json
   {
     "questions": [
       {
         "question": "¿Qué features deseas analizar?",
         "header": "Selección de Features",
         "multiSelect": false,
         "options": [
           {
             "label": "Todos los features",
             "description": "Procesar todos los features del registro"
           },
           {
             "label": "Seleccionar features específicos",
             "description": "Elegir uno o más features por ID"
           }
         ]
       }
     ]
   }
   ```

   **If "Todos los features":**
   - `filtered_features = all_features`
   - Notify: `✅ Se procesarán todos los features ({count} features)`

   **If "Seleccionar features específicos":**
   - If ≤ 4 features, use AskUserQuestion multiSelect with one option per feature
   - If > 4 features, ask via text: "Ingresa los IDs separados por comas (ej: feature-1,feature-3):"
   - Parse and validate each ID against the registry
   - `filtered_features = matching features`
   - Notify:
     ```
     ✅ Features seleccionados ({count}):
     {for each feature in filtered_features:
       "  • {feature.id} → {feature.epic_source}"
     }
     ```

4. Store `filtered_features` in memory for use in Step 3.1.

---

#### Step 3.1: Automatic Data Loading (Zero User Interaction)

**LOAD ALL INPUTS AUTOMATICALLY:**

1. **INPUT 1 - PROYECTO:**
   - Load from config: `{project_name}`
   - Store as: `input_proyecto`

2. **INPUT 2 - FEATURES / HISTORIAS DE USUARIO:**
   - Use `filtered_features` resolved in Step 3.0
   - For each feature in `filtered_features`, read its `epic_source` file and concatenate content
   - Store combined content as: `input_epicas`
   - Store feature list as: `input_features` (array of {id, epic_source, status})

3. **INPUT 3 - METAS DE NEGOCIO (PRD):**
   - Search for PRD file in: `{planning_artifacts}/`
   - Look for files matching: `prd.md`, `PRD.md`, `product-requirements.md`, or similar
   - If found, read complete content and store as: `input_metas`
   - If not found, extract business goals from `epics.md` and store as: `input_metas`

4. **INPUT 4 - STACK TECNOLÓGICO:**
   - Load from: `{project-root}/_siesa-agents/bmm/data/company-standards/technology-stack.md`
   - Read complete file content
   - Store as: `input_stack`

**Notify user in `{communication_language}`:**

```
🎯 BMAD V6.0 - Diseño de Pruebas con Megaprompt

✅ Iniciando análisis automático...

📋 Datos cargados:
  • Proyecto: {input_proyecto}
  • Features registry: {implementation_artifacts}/feature-status.yaml
  • Features seleccionados: [lista de feature IDs procesados]
  • PRD: [ruta encontrada o "extraído de epic_source files"]
  • Stack Tecnológico: _siesa-agents/bmm/data/company-standards/technology-stack.md

🚀 Ejecutando las 4 fases de análisis BMAD V6.0...
```

**NO user input required - proceed directly to Step 3.2**

#### Step 3.2: Load and Prepare Megaprompt

1. **Load the Master Prompt:**
   - Read the complete file: `{workflow_path}/prompts/MegaPrompt_DiseñoPruebas_BMAD_V6_Feb6.md`
   - This prompt transforms you into a Principal QA Architect

2. **Inject Collected Inputs:**
   Replace the `[INPUT]` section placeholders with the collected data:
   ```
   # [INPUT]:
   - **PROYECTO**: {input_proyecto}
   - **FEATURES / HISTORIAS DE USUARIO**: {input_epicas}
   - **METAS DE NEGOCIO (PRD)**: {input_metas}
   - **STACK TECNOLÓGICO**: {input_stack}
   ```

#### Step 3.3: Execute the Complete Analysis

**Execute ALL 4 PHASES sequentially:**
- FASE 1: GATEKEEPER GRANULAR Y LIMPIEZA DE BACKLOG
- FASE 2: EL ESCALÓN DE CRITERIOS (FAC)
- FASE 3: DETECCIÓN DE PUNTOS CIEGOS
- FASE 4: INGENIERÍA DE DISEÑO (ISO 29119-4) Y CALCULADORA DE RIESGO

**Generate outputs in EXACT format:**
- I. REPORTE DEL GATEKEEPER (GRANULAR)
- II. DEFINICIÓN DE FEATURES Y CRITERIOS MAESTROS (FAC) EN GHERKIN
- III. PUNTOS CIEGOS DETECTADOS POR FEATURE
- IV. MATRIZ INTEGRAL DE PRUEBAS (DISEÑO 360°)
- V. INFORME TSR (TEST SUMMARY REPORT)
- APÉNDICE: MATRIZ DE TRAZABILIDAD

#### Step 3.4: Save Output

**Create timestamped folder structure:**

1. Generate current date and time in format: `YYYY-MM-DD-HHmmss` (e.g., `2026-02-09-143052`)
2. Create folder: `{implementation_artifacts}/traceability-artifacts/test-design-YYYY-MM-DD-HHmmss/`
3. Save the following 6 documents inside the timestamped folder:

**Document 1**: `test-design-complete.md` (Master document)
**Document 2**: `test-design-phase1-gatekeeper.md` (Gatekeeper classification)
**Document 3**: `test-design-phase2-fac.md` (Features and FAC in Gherkin)
**Document 4**: `test-design-phase3-blind-spots.md` (Blind spots detected)
**Document 5**: `test-design-phase4-test-matrix.md` (Complete test matrix)

#### Step 3.4b: Export Test Cases to CSV

After saving `test-design-phase4-test-matrix.md`, extract all test cases to a structured CSV file following the Siesa standard format (FT-SD-007 v5.0).

**Process:**

1. **Read the generated matrix file:**
   - Read the full content of: `{implementation_artifacts}/traceability-artifacts/test-design-YYYY-MM-DD-HHmmss/test-design-phase4-test-matrix.md`

2. **Parse feature sections and test case rows:**
   - Identify section headers matching `## F# — [Feature Name]` to determine the current `ID Épica`
   - For each section header, derive the Epic ID in format `EPIC-POS-F{n}` (e.g., `## F1 — Waiter Authentication` → `EPIC-POS-F1`)
   - Parse all table data rows starting with `| TC-` extracting the 12 matrix columns: ID, Feature, Associated Stories, Level, Technique, Scenario, Preconditions, Steps, Expected Result, Risk (IxP), Priority, Strategy
   - Track which feature section each row belongs to in order to assign the correct `ID Épica`

3. **Map matrix columns → 13-column Siesa CSV format (FT-SD-007 v5.0):**

   | Matrix Column | → CSV Column |
   |---|---|
   | Section header `## F{n} — ...` | `ID Épica` (e.g., `EPIC-POS-F1`) |
   | `ID` | `ID Caso de Prueba` |
   | `Scenario` | `Título` |
   | `Feature` + `: ` + `Scenario` | `Descripción Completa` |
   | `Preconditions` | `Precondiciones` |
   | `Steps` | `Pasos de Ejecución` |
   | `Expected Result` | `Resultados Esperados` |
   | `Strategy` | `Tipo prueba` |
   | _(empty)_ | `Fecha Ejecución` |
   | `"Not Started"` | `Estado` |
   | _(empty)_ | `ID Defecto` |
   | _(empty)_ | `Descripción Fallo` |
   | `Level: [Level] \| Technique: [Technique] \| Risk: [Risk] \| Priority: [Priority]` | `Notas` |

4. **Build the complete CSV string in memory:**

   **Rows 1–11 (header):** Read from `{workflow_path}/templates/test-cases-template.csv` — these 11 rows contain the Siesa document metadata and column labels.

   **Rows 12+ (data):** One row per test case. Template for each row:
   ```
   "EPIC-POS-F{n}","TC-F{n}-{###}","[Scenario]","[Feature]: [Scenario]","[Preconditions]","[Steps]","[Expected Result]","[Strategy]","","Not Started","","","Level: [Level] | Technique: [Technique] | Risk: [Risk] | Priority: [Priority]"
   ```

   **🚨 CRITICAL — Windows CSV compatibility rules:**
   - ✅ Use **Write tool ONLY** — NEVER use bash, cat, echo, sed, awk, or heredocs
   - ✅ Build the **complete CSV string in memory** first, then call Write tool once
   - ✅ Wrap **ALL fields** in double quotes
   - ✅ Escape internal double quotes by doubling them: `"` → `""`
   - ✅ Multi-line field content: embed `\n` directly inside the quoted string
   - ✅ Encoding: UTF-8

5. **Write the file using Write tool:**
   - `file_path`: `{implementation_artifacts}/traceability-artifacts/test-design-YYYY-MM-DD-HHmmss/test-cases.csv`
   - Use the **same timestamp folder** generated in Step 3.4

6. **Notify progress in `{communication_language}`:**
   ```
   📊 Exportando casos de prueba a CSV (formato Siesa FT-SD-007 v5.0)...
   ✅ test-cases.csv generado — [N] casos de prueba exportados
   ```

**Document 6**: `test-design-phase5-tsr.md` (TSR + Traceability matrix)

**Frontmatter for all documents:**
```yaml
---
workflow: traceability-and-testing
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
generated_date: [ISO 8601 date]
project_name: {input_proyecto}
input_documents:
  epics: [source path/content]
  prd: [source path/content]
technology_stack: {input_stack}
---
```

**Body:** Each document contains its corresponding phase content as specified in the megaprompt output format

#### Step 3.5: Completion

Present to user in `{communication_language}`:
```
✅ DISEÑO DE PRUEBAS COMPLETADO

📁 Carpeta generada: {implementation_artifacts}/traceability-artifacts/test-design-YYYY-MM-DD-HHmmss/

📄 6 documentos + 1 CSV creados:
  1. test-design-complete.md (Documento maestro)
  2. test-design-phase1-gatekeeper.md (Fase 1)
  3. test-design-phase2-fac.md (Fase 2)
  4. test-design-phase3-blind-spots.md (Fase 3)
  5. test-design-phase4-test-matrix.md (Fase 4 - [count] casos)
  6. test-cases.csv (Casos de prueba — formato Siesa FT-SD-007 v5.0)
  7. test-design-phase5-tsr.md (Fase 5 - TSR)

📊 Métricas:
- Features identificados: [count]
- Casos de prueba totales: [count]
- Casos P0 (Críticos): [count]
- Cobertura de riesgos críticos: [percentage]%

🔍 Revisa los documentos para ver:
- Fase 1: Reporte del Gatekeeper (clasificación historias)
- Fase 2: Features y FAC (criterios Gherkin)
- Fase 3: Puntos Ciegos (29 riesgos detectados)
- Fase 4: Matriz Integral de Pruebas (127 casos detallados)
- Fase 5: Test Summary Report + Trazabilidad completa
```

**Note:** The original step-by-step workflow files remain in `steps/` directory for reference or alternative execution modes if needed in the future.
