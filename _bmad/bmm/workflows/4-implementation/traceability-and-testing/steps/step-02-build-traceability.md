---
name: 'step-02-build-traceability'
description: 'Build complete FR→Feature→Story→Task hierarchy with validation and coverage analysis'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/traceability-and-testing'

# File References
thisStepFile: '{workflow_path}/steps/step-02-build-traceability.md'
nextStepFile: '{workflow_path}/steps/step-03-interpret-tests.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{implementation_artifacts}/traceability-artifacts/traceability-map.md'
---

# Step 2: Build Traceability Map

## STEP GOAL:

To construct the complete FR→Feature→Story→Task hierarchy, validate all relationships, generate traceability matrices, and calculate coverage statistics.

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
- ✅ You bring expertise in requirements traceability
- ✅ Together we build comprehensive traceability artifacts

### Step-Specific Rules:

- 🎯 Focus ONLY on building traceability hierarchy
- 🚫 FORBIDDEN to start mapping test cases in this step
- 💬 Validate relationships and alert user to gaps
- 📊 Generate clear visual representations (ASCII trees, tables)

## EXECUTION PROTOCOLS:

- 🎯 Build hierarchy systematically from FR → Feature → Story → Task
- 💾 Update traceability-map.md with sections 1-3
- 📖 Update frontmatter with `stepsCompleted: [1, 2]` and statistics
- 🚫 FORBIDDEN to load next step until traceability is complete and validated

## CONTEXT BOUNDARIES:

- Input data from step 01 frontmatter (FRs, Features, Stories)
- Feature epic_source files for FR Coverage Map and Story details
- Optional story files for task extraction
- Focus on requirements traceability, NOT test cases yet

## TRACEABILITY BUILDING PROCESS:

### 1. Load Context from Step 01

Read frontmatter from {outputFile}:

```yaml
stepsCompleted: [1]
featureScopeMode: "all" | "multiple"
targetFeatureIds: null | ["feature-1", "feature-3"]  # Array of selected feature IDs
featureCount: {number}  # Number of features being processed
frs: [FR-001, FR-002, ...]  # Already filtered if multiple feature mode
selectedFeatures: ["feature-1", "feature-2", ...]  # Already filtered if multiple feature mode
stories: [1.1, 1.2, 2.1, ...]  # Already filtered if multiple feature mode
inputDocuments: [...]
```

**Display scope-aware message:**

```
{if featureScopeMode === "all":
  "Construyendo el mapa de trazabilidad para **{projectName}**...

  📊 Elementos a procesar:
  - {count_frs} Requerimientos Funcionales
  - {count_features} Features
  - {count_stories} Historias de Usuario

  🎯 **Alcance:** Todos los features

  Comenzando construcción de jerarquía..."
else:
  "Construyendo el mapa de trazabilidad para **{projectName}** ({featureCount} feature(s) seleccionado(s))...

  📊 Elementos a procesar:
  - {count_frs} Requerimientos Funcionales (relacionados a los features seleccionados)
  - {featureCount} Feature(s):
    {for each feature_id in targetFeatureIds:
      \"  • {feature_id}: {feature_title}\"
    }
  - {count_stories} Historias de Usuario

  🎯 **Alcance:** {featureCount} feature(s) seleccionado(s)

  💡 Esta agrupación permite generar trazabilidad coherente para funcionalidades completas.

  Comenzando construcción de jerarquía..."
}
```

**Note:** The FRs, Features, and Stories arrays were already filtered in Step 01 if multiple feature mode was selected, so no additional filtering is needed in this step.

---

### 2. Build FR → Feature Mapping

For each feature in `selectedFeatures`, read its `epic_source` file and locate the "FR Coverage Map" section or FR references.

**Extract FR→Feature relationships:**

Parse lines like:
```
FR1 → feature-1
FR2 → feature-1, feature-2
FR3 → feature-3
```

Build bidirectional mapping:
```javascript
fr_to_feature = {
  "FR-001": ["feature-1"],
  "FR-002": ["feature-1", "feature-2"],
  "FR-003": ["feature-3"]
}

feature_to_frs = {
  "feature-1": ["FR-001", "FR-002"],
  "feature-2": ["FR-002"],
  "feature-3": ["FR-003"]
}
```

---

### 3. Build Feature → Story Hierarchy

For each feature in `selectedFeatures`, read its `epic_source` file and extract all Stories:

```
## Feature 1: User Management
  ### Story 1.1: User Registration
  ### Story 1.2: User Profile Management

## Feature 2: Authentication
  ### Story 2.1: Login Functionality
  ### Story 2.2: Password Reset
```

Build mapping:
```javascript
feature_to_stories = {
  "feature-1": ["Story 1.1", "Story 1.2"],
  "feature-2": ["Story 2.1", "Story 2.2"]
}
```

---

### 4. Extract Story → Task Relationships (if available)

Check if individual story files exist (from step 01):

**If story files found:**

For each story file, extract tasks from "Tasks / Subtasks" section:

```markdown
## Tasks / Subtasks

- [ ] Task 1 (AC: #1)
  - [ ] Subtask 1.1
  - [ ] Subtask 1.2
- [ ] Task 2 (AC: #2)
```

Build mapping:
```javascript
story_to_tasks = {
  "Story 1.1": ["Task 1.1-1", "Task 1.1-2"],
  "Story 1.2": ["Task 1.2-1"]
}
```

**If no story files:**

"ℹ️ No se encontraron archivos de historias individuales con tareas. La trazabilidad se limitará a FR→Feature→Story."

---

### 5. Validate Relationships

Perform validation checks:

**Validation 1: All FRs have Feature coverage**

```javascript
frs_without_features = []
for fr in all_frs:
    if fr not in fr_to_feature or len(fr_to_feature[fr]) == 0:
        frs_without_features.append(fr)
```

**If gaps found:**

"⚠️ **Alerta: Requerimientos sin cobertura de Feature**

Los siguientes FRs no están cubiertos por ningún Feature:
{list frs_without_features}

Esto puede indicar:
1. Falta actualizar el FR Coverage Map en los archivos epic_source de los features
2. Estos FRs no fueron considerados en la planificación de features
3. Error en la extracción de datos

**Recomendación:** Revisar los archivos epic_source de los features antes de continuar.

¿Deseas continuar de todos modos o corregir esto primero?"

**Validation 2: All Features have Stories**

```javascript
features_without_stories = []
for feature in all_features:
    if feature not in feature_to_stories or len(feature_to_stories[feature]) == 0:
        features_without_stories.append(feature)
```

**If gaps found:**

"⚠️ **Alerta: Features sin Historias de Usuario**

Los siguientes Features no contienen Historias:
{list features_without_stories}

Esto es un problema crítico ya que los Features deben descomponerse en Historias para ser implementables.

**Acción requerida:** Revisar los archivos epic_source de los features y agregar historias para estos features."

**Validation 3: No duplicate IDs**

```javascript
all_ids = list(frs) + list(epics) + list(stories) + list(tasks)
duplicates = find_duplicates(all_ids)
```

**If duplicates found:**

"❌ **Error: IDs duplicados detectados**

Los siguientes IDs aparecen más de una vez:
{list duplicates}

Esto viola la regla de unicidad de IDs. Cada elemento debe tener un ID único.

**Acción requerida:** Corregir los IDs duplicados en epics.md antes de continuar."

HALT if critical errors found.

---

### 6. Generate Traceability Tree (ASCII Art)

Create hierarchical tree representation:

```
FR-001: User Management and Authentication
 └─ feature-1: User Management System
    ├─ Story 1.1: User Registration
    │  ├─ Task 1.1-1: Create registration API endpoint
    │  └─ Task 1.1-2: Implement email validation
    └─ Story 1.2: User Profile Management
       └─ Task 1.2-1: Build profile update UI

FR-002: User Authentication
 ├─ feature-1: User Management System
 │  └─ Story 1.3: Login Functionality
 │     ├─ Task 1.3-1: Implement OAuth integration
 │     └─ Task 1.3-2: Create session management
 └─ feature-2: Security Controls
    └─ Story 2.1: Multi-factor Authentication
       └─ Task 2.1-1: Implement 2FA with SMS
```

**Format rules:**
- Use box-drawing characters (├─ └─ │)
- Indent consistently (3 spaces per level)
- Include ID and title for each element
- Show parent-child relationships clearly

---

### 7. Calculate Coverage Statistics

Compute metrics:

```javascript
statistics = {
  totalFRs: count(all_frs),
  totalFeatures: count(all_features),
  totalStories: count(all_stories),
  totalTasks: count(all_tasks),

  frsWithFeatureCoverage: count(frs with ≥1 feature),
  featuresWithStories: count(features with ≥1 story),

  coverageRate: (frsWithFeatureCoverage / totalFRs) * 100,
  avgStoriesPerFeature: totalStories / totalFeatures,
  avgTasksPerStory: totalTasks / totalStories (if tasks exist)
}
```

---

### 8. Generate Coverage Analysis Section

```markdown
## Análisis de Cobertura

### Cobertura de Requerimientos Funcionales
- Total de RFs: {totalFRs}
- RFs con cobertura de Feature: {frsWithFeatureCoverage}
- RFs sin cobertura de Feature: {totalFRs - frsWithFeatureCoverage}
- Tasa de cobertura: {coverageRate}%

{If coverage < 100%}
⚠️ **Advertencia:** {percent}% de los RFs carecen de cobertura de Feature

### Descomposición de Features
- Total de Features: {totalFeatures}
- Total de Historias: {totalStories}
- Promedio de Historias por Feature: {avgStoriesPerFeature}
- Total de Tareas identificadas: {totalTasks} {if available}

{If tasks available}
- Promedio de Tareas por Historia: {avgTasksPerStory}
```

---

### 9. Write to Output Document

Update {outputFile} by appending sections 1-3:

```markdown
## 1. Árbol de Trazabilidad

{ASCII tree from section 6}

---

## 2. Análisis de Cobertura

{Analysis from section 8}

---

## 3. Trazabilidad Detallada

{For each FR, show complete hierarchy}

### FR-001: {Description}

**Cubierto por:**
- **feature-1:** {Title}
  - Story 1.1: {Title}
    - AC1: {Acceptance Criteria}
    - AC2: {Acceptance Criteria}
    - Tareas:
      - Task 1.1-1: {Description}
      - Task 1.1-2: {Description}
  - Story 1.2: {Title}
    - AC1: {Acceptance Criteria}
    - Tareas:
      - Task 1.2-1: {Description}
```

---

### 10. Update Frontmatter

Update frontmatter in {outputFile}:

```yaml
stepsCompleted: [1, 2]
statistics:
  totalFRs: {X}
  totalFeatures: {Y}
  totalStories: {Z}
  totalTasks: {W}
  coverageRate: {P}%
```

---

### 11. Present Summary to User

"✅ **Mapa de Trazabilidad Construido con Éxito**

📊 **Estadísticas Generales:**
- Requerimientos Funcionales: {totalFRs}
- Features: {totalFeatures}
- Historias de Usuario: {totalStories}
- Tareas identificadas: {totalTasks}

📈 **Cobertura:**
- FRs con cobertura de Feature: {frsWithFeatureCoverage}/{totalFRs} ({coverageRate}%)
- Features con Historias: {featuresWithStories}/{totalFeatures}

{If warnings exist}
⚠️ **Alertas:**
{list warnings}

📄 **Documento actualizado:**
`{outputFile}` (Secciones 1-3 completadas)

**Contenido generado:**
- ✅ Árbol de trazabilidad jerárquico
- ✅ Análisis de cobertura
- ✅ Trazabilidad detallada por FR

El siguiente paso generará los casos de prueba automáticamente basándose en esta jerarquía de trazabilidad.

¿Todo se ve correcto?"

Wait for user confirmation.

---

### 12. Present MENU OPTIONS

Display: **Confirma para [C] continuar:**

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- User can chat or ask questions - always respond and then end with display again of the menu option

#### Menu Handling Logic:

- IF C: Save all sections to {outputFile}, update frontmatter with `stepsCompleted: [1, 2]` and statistics, only then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#12-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected, all sections (1-3) are written to {outputFile}, and frontmatter is updated with `stepsCompleted: [1, 2]` and complete statistics, will you then load, read entire file, then execute {nextStepFile} to begin generating test cases.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Context loaded correctly from step 01 frontmatter
- FR→Feature mapping extracted from feature epic_source files
- Feature→Story hierarchy built correctly
- Story→Task relationships extracted (if available)
- All validations performed (FRs coverage, Features with Stories, no duplicate IDs)
- Warnings displayed for any gaps
- Traceability tree generated in ASCII format
- Coverage statistics calculated accurately
- Sections 1-3 written to output document
- Frontmatter updated with stepsCompleted: [1, 2] and statistics
- User confirmed completion

### ❌ SYSTEM FAILURE:

- Not loading context from step 01
- Incomplete extraction of FR→Feature mapping
- Missing Feature→Story hierarchy
- Validations not performed or skipped
- Gaps not reported to user
- Tree not generated
- Statistics not calculated
- Output document not updated
- Frontmatter not updated
- Proceeding without user confirmation

**Master Rule:** Traceability must be complete, validated, and accurate before proceeding to test case mapping.
