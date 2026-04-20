---
name: 'step-05-export'
description: 'Export traceability map (PRD→FR→Feature→Story→Task) to CSV format'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/traceability-and-testing'

# File References
thisStepFile: '{workflow_path}/steps/step-05-export.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{implementation_artifacts}/traceability-artifacts/traceability-map.md'
traceabilityCSV: '{implementation_artifacts}/traceability-artifacts/traceability-export.csv'
---

# Step 5: Export Traceability to CSV

## STEP GOAL:

To export the traceability map (PRD→FR→Feature→Story→Task hierarchy ONLY) to CSV format and finalize the workflow.

**IMPORTANT:** This step exports ONLY traceability (implementation hierarchy), NOT test cases or test plans.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 📖 CRITICAL: Read the complete step file before taking any action
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`
- 🚫 DO NOT create exports/ directory
- 🚫 DO NOT create Python scripts
- 🚫 DO NOT create INDEX.md files

### Step-Specific Rules:

- 🎯 Focus ONLY on creating simple CSV export of traceability hierarchy
- 🚫 FORBIDDEN to include test information in CSV
- ✅ Use Write tool to create CSV directly
- 📊 Keep CSV simple and clean

## EXECUTION PROTOCOLS:

- 📊 Generate simple CSV export of traceability (PRD→FR→Feature→Story→Task ONLY)
- 📖 Update frontmatter with `stepsCompleted: [1, 2, 3, 4, 5]` and `workflowCompleted: true`
- 🎉 Present final summary to user

## CONTEXT BOUNDARIES:

- Input data from traceability-map.md (sections 1-3 ONLY - pure traceability)
- Feature test plan files from {implementation_artifacts}/feature-test-plans/ (separate from traceability CSV)
- Focus on simple CSV export, NOT complex scripts or Excel files

**CRITICAL:** Traceability CSV contains ONLY implementation hierarchy (PRD→FR→Feature→Story→Task), NO test information.

---

## EXPORT PROCESS:

### 1. Load Context from Traceability Map

Read {outputFile} to extract traceability data from sections 1-3:

- Section 1: Árbol de Trazabilidad (tree structure)
- Section 2: Análisis de Cobertura (coverage stats)
- Section 3: Trazabilidad Detallada (detailed breakdowns)

**Extract data:**
- PRD sections → FR mappings
- FR → Epic mappings
- Epic → Story mappings
- Story → Task mappings

"📊 Exportando mapa de trazabilidad a CSV...

🔍 Leyendo trazabilidad desde `{outputFile}`
📋 Extrayendo jerarquía: PRD → FR → Epic → Story → Task"

---

### 2. Generate Traceability CSV Export

**CRITICAL:** Create CSV with ONLY traceability hierarchy. Use Write tool (NOT bash, NOT Python scripts).

**CSV Structure:**

```csv
PRD;ID_FR;Titulo_FR;ID_Feature;Titulo_Feature;ID_Historia;Titulo_Historia;ID_Tarea;Titulo_Tarea
```

**IMPORTANT:** Use `;` (semicolon) as delimiter — required for Spanish/Latin American Excel locale where `,` is the decimal separator.

**Example rows:**
```csv
PRD;ID_FR;Titulo_FR;ID_Feature;Titulo_Feature;ID_Historia;Titulo_Historia;ID_Tarea;Titulo_Tarea
"Sección 3.1";"FR-001";"Gestión de usuarios";"Epic-1";"Sistema de autenticación";"Story-1.1";"Login de usuario";"Task-1.1.1";"Implementar formulario de login"
"Sección 3.1";"FR-001";"Gestión de usuarios";"Epic-1";"Sistema de autenticación";"Story-1.1";"Login de usuario";"Task-1.1.2";"Validar credenciales en backend"
"Sección 3.1";"FR-001";"Gestión de usuarios";"Epic-1";"Sistema de autenticación";"Story-1.2";"Recuperar contraseña";"Task-1.2.1";"Implementar flujo de recuperación"
"Sección 3.2";"FR-002";"Gestión de productos";"Epic-2";"Catálogo de productos";"Story-2.1";"Listar productos";"Task-2.1.1";"Crear API de productos"
```

**Build CSV content in memory:**

```
Step 1: Create header row
header = "PRD;ID_FR;Titulo_FR;ID_Feature;Titulo_Feature;ID_Historia;Titulo_Historia;ID_Tarea;Titulo_Tarea"

Step 2: For each traceability path extracted from sections 1-3:
  for each_path in traceability_data:
      # Escape quotes: replace " with ""
      prd_section = escape_csv(path.prd_section)
      fr_id = escape_csv(path.fr_id)
      fr_title = escape_csv(path.fr_title)
      feature_id = escape_csv(path.feature_id)
      feature_title = escape_csv(path.feature_title)
      story_id = escape_csv(path.story_id)
      story_title = escape_csv(path.story_title)
      task_id = escape_csv(path.task_id or "")
      task_title = escape_csv(path.task_title or "")

      row = f'"{prd_section}";"{fr_id}";"{fr_title}";"{feature_id}";"{feature_title}";"{story_id}";"{story_title}";"{task_id}";"{task_title}"'

      csv_rows.append(row)

Step 3: Combine all rows separated by actual newlines
complete_csv = header + "\n" + "\n".join(csv_rows)
```

**Write CSV using Write tool:**

```
Write tool:
- file_path: {traceabilityCSV}
- content: {complete_csv}
```

**CRITICAL:** The `content` field must contain the fully materialized CSV string with real newline characters between rows — NOT the literal text `\n`. Each row must be on its own line.

**DO NOT:**
- ❌ Create exports/ directory
- ❌ Create Python scripts
- ❌ Use bash commands
- ❌ Include test case information

Display after writing:
"✅ **Exportación CSV de trazabilidad completada**

📄 **Archivo creado:** `{traceabilityCSV}`

📊 **Contenido:**
- {total_rows} filas de trazabilidad
- Jerarquía: PRD → FR → Epic → Story → Task
- Formato: CSV estándar (9 columnas)
- Encoding: UTF-8

💡 **Nota:** Este archivo contiene SOLO la jerarquía de implementación, sin información de casos de prueba."

---

### 3. Update Workflow Completion

Update {outputFile} frontmatter:

```yaml
stepsCompleted: [1, 2, 3, 4, 5]
workflowCompleted: true
exportFiles:
  traceabilityCSV: "{traceabilityCSV}"
```

---

### 4. Present Final Summary to User

**IMPORTANT:** Load the `testcasesFolderPath` from frontmatter (stored in step 3) to display the correct location.

Display:
"✅ **Workflow de Trazabilidad Completado con Éxito**

📋 **Artefactos Generados:**

**1. Mapa de Trazabilidad (Markdown)**
   - 📄 Archivo: `{outputFile}`
   - 📊 Contiene: PRD → FR → Epic → Story → Task
   - ✅ Secciones 1-3: Jerarquía de implementación completa

**2. Exportación CSV de Trazabilidad**
   - 📄 Archivo: `{traceabilityCSV}`
   - 📊 Formato: CSV con 9 columnas
   - ✅ Listo para importar en herramientas externas

**3. Casos de Prueba**
   - 📁 **Carpeta:** `{testcasesFolderPath}`
   - 📄 Archivo CSV: `test-cases.csv`
   - 📄 Resumen MD: `test-cases-summary.md`
   - ✅ Casos de prueba generados automáticamente
   - 💡 **Nota:** Carpeta con timestamp que identifica tipo, alcance y fecha de generación

**4. Planes de Prueba por Feature**
   - 📁 Directorio: `{implementation_artifacts}/feature-test-plans/`
   - 📄 Archivos: feature-1-test-plan.md, feature-2-test-plan.md, etc.
   - ✅ Un plan detallado por cada feature

---

📁 **Ubicación de archivos principales:**
`{implementation_artifacts}/traceability-artifacts/`

📁 **Ubicación de casos de prueba (timestamped):**
`{testcasesFolderPath}`

📁 **Ubicación de planes de prueba por feature:**
`{implementation_artifacts}/feature-test-plans/`

---

✅ **Workflow completado. Todos los artefactos están listos para uso.**"

**Wait for user confirmation.**

---

### 5. Present MENU OPTIONS

Display: **El workflow ha finalizado. Opciones:**

- **[F]** - Finalizar y cerrar workflow
- **[V]** - Ver resumen de archivos generados

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY exit when user selects 'F'

#### Menu Handling Logic:

- IF F: Display final goodbye message and exit workflow
- IF V: Display detailed file list and statistics, then redisplay menu
- IF Any other comments: Help user, then redisplay menu

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Traceability data extracted from traceability-map.md
- CSV file created successfully with traceability hierarchy
- CSV contains ONLY implementation hierarchy (PRD→FR→Feature→Story→Task)
- NO test information included in CSV
- Frontmatter updated with workflowCompleted: true
- User confirmed completion
- NO exports/ directory created
- NO Python scripts created
- NO INDEX.md files created

### ❌ SYSTEM FAILURE:

- CSV file not created
- Test information included in traceability CSV
- Created exports/ directory (NOT allowed)
- Created Python scripts (NOT allowed)
- Created INDEX.md files (NOT allowed)
- Using bash commands instead of Write tool
- Complex Excel exports (NOT needed)

**Master Rule:** Keep exports SIMPLE. Only create traceability CSV using Write tool. NO additional directories, scripts, or files.
