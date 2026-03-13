---
name: 'step-02-build-traceability'
description: 'Build complete FR→Epic→Story→Task hierarchy with validation and coverage analysis'

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

To construct the complete FR→Epic→Story→Task hierarchy, validate all relationships, generate traceability matrices, and calculate coverage statistics.

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

- 🎯 Build hierarchy systematically from FR → Epic → Story → Task
- 💾 Update traceability-map.md with sections 1-3
- 📖 Update frontmatter with `stepsCompleted: [1, 2]` and statistics
- 🚫 FORBIDDEN to load next step until traceability is complete and validated

## CONTEXT BOUNDARIES:

- Input data from step 01 frontmatter (FRs, Epics, Stories)
- epics.md content for FR Coverage Map and Story details
- Optional story files for task extraction
- Focus on requirements traceability, NOT test cases yet

## TRACEABILITY BUILDING PROCESS:

### 1. Load Context from Step 01

Read frontmatter from {outputFile}:

```yaml
stepsCompleted: [1]
epicScopeMode: "all" | "multiple"
targetEpicNumbers: null | [1, 3, 5]  # Array of selected epic numbers
epicCount: {number}  # Number of epics being processed
frs: [FR-001, FR-002, ...]  # Already filtered if multiple epic mode
epics: [Epic 1, Epic 2, ...]  # Already filtered if multiple epic mode
stories: [1.1, 1.2, 2.1, ...]  # Already filtered if multiple epic mode
inputDocuments: [...]
```

**Display scope-aware message:**

```
{if epicScopeMode === "all":
  "Construyendo el mapa de trazabilidad para **{projectName}**...

  📊 Elementos a procesar:
  - {count_frs} Requerimientos Funcionales
  - {count_epics} Épicas
  - {count_stories} Historias de Usuario

  🎯 **Alcance:** Todas las épicas

  Comenzando construcción de jerarquía..."
else:
  "Construyendo el mapa de trazabilidad para **{projectName}** ({epicCount} épica(s) seleccionada(s))...

  📊 Elementos a procesar:
  - {count_frs} Requerimientos Funcionales (relacionados a las épicas seleccionadas)
  - {epicCount} Épica(s):
    {for each epic_number in targetEpicNumbers:
      \"  • Epic {epic_number}: {epic_title}\"
    }
  - {count_stories} Historias de Usuario

  🎯 **Alcance:** {epicCount} épica(s) seleccionada(s)

  💡 Esta agrupación permite generar trazabilidad coherente para funcionalidades completas.

  Comenzando construcción de jerarquía..."
}
```

**Note:** The FRs, Epics, and Stories arrays were already filtered in Step 01 if multiple epic mode was selected, so no additional filtering is needed in this step.

---

### 2. Build FR → Epic Mapping

Read epics.md and locate the "FR Coverage Map" section.

**Extract FR→Epic relationships:**

Parse lines like:
```
FR1 → Epic 1
FR2 → Epic 1, Epic 2
FR3 → Epic 3
```

Build bidirectional mapping:
```javascript
fr_to_epic = {
  "FR-001": ["Epic 1"],
  "FR-002": ["Epic 1", "Epic 2"],
  "FR-003": ["Epic 3"]
}

epic_to_frs = {
  "Epic 1": ["FR-001", "FR-002"],
  "Epic 2": ["FR-002"],
  "Epic 3": ["FR-003"]
}
```

---

### 3. Build Epic → Story Hierarchy

For each Epic section in epics.md, extract all Stories:

```
## Epic 1: User Management
  ### Story 1.1: User Registration
  ### Story 1.2: User Profile Management

## Epic 2: Authentication
  ### Story 2.1: Login Functionality
  ### Story 2.2: Password Reset
```

Build mapping:
```javascript
epic_to_stories = {
  "Epic 1": ["Story 1.1", "Story 1.2"],
  "Epic 2": ["Story 2.1", "Story 2.2"]
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

"ℹ️ No se encontraron archivos de historias individuales con tareas. La trazabilidad se limitará a FR→Epic→Story."

---

### 5. Validate Relationships

Perform validation checks:

**Validation 1: All FRs have Epic coverage**

```javascript
frs_without_epics = []
for fr in all_frs:
    if fr not in fr_to_epic or len(fr_to_epic[fr]) == 0:
        frs_without_epics.append(fr)
```

**If gaps found:**

"⚠️ **Alerta: Requerimientos sin cobertura de Épica**

Los siguientes FRs no están cubiertos por ninguna Épica:
{list frs_without_epics}

Esto puede indicar:
1. Falta actualizar el FR Coverage Map en epics.md
2. Estos FRs no fueron considerados en la planificación de épicas
3. Error en la extracción de datos

**Recomendación:** Revisar y actualizar epics.md antes de continuar.

¿Deseas continuar de todos modos o corregir esto primero?"

**Validation 2: All Epics have Stories**

```javascript
epics_without_stories = []
for epic in all_epics:
    if epic not in epic_to_stories or len(epic_to_stories[epic]) == 0:
        epics_without_stories.append(epic)
```

**If gaps found:**

"⚠️ **Alerta: Épicas sin Historias de Usuario**

Las siguientes Épicas no contienen Historias:
{list epics_without_stories}

Esto es un problema crítico ya que las Épicas deben descomponerse en Historias para ser implementables.

**Acción requerida:** Revisar epics.md y agregar historias para estas épicas."

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
 └─ Epic 1: User Management System
    ├─ Story 1.1: User Registration
    │  ├─ Task 1.1-1: Create registration API endpoint
    │  └─ Task 1.1-2: Implement email validation
    └─ Story 1.2: User Profile Management
       └─ Task 1.2-1: Build profile update UI

FR-002: User Authentication
 ├─ Epic 1: User Management System
 │  └─ Story 1.3: Login Functionality
 │     ├─ Task 1.3-1: Implement OAuth integration
 │     └─ Task 1.3-2: Create session management
 └─ Epic 2: Security Controls
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
  totalEpics: count(all_epics),
  totalStories: count(all_stories),
  totalTasks: count(all_tasks),

  frsWithEpicCoverage: count(frs with ≥1 epic),
  epicsWithStories: count(epics with ≥1 story),

  coverageRate: (frsWithEpicCoverage / totalFRs) * 100,
  avgStoriesPerEpic: totalStories / totalEpics,
  avgTasksPerStory: totalTasks / totalStories (if tasks exist)
}
```

---

### 8. Generate Coverage Analysis Section

```markdown
## Análisis de Cobertura

### Cobertura de Requerimientos Funcionales
- Total de RFs: {totalFRs}
- RFs con cobertura de Épica: {frsWithEpicCoverage}
- RFs sin cobertura de Épica: {totalFRs - frsWithEpicCoverage}
- Tasa de cobertura: {coverageRate}%

{If coverage < 100%}
⚠️ **Advertencia:** {percent}% de los RFs carecen de cobertura de Épica

### Descomposición de Épicas
- Total de Épicas: {totalEpics}
- Total de Historias: {totalStories}
- Promedio de Historias por Épica: {avgStoriesPerEpic}
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
- **Epic 1:** {Title}
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
  totalEpics: {Y}
  totalStories: {Z}
  totalTasks: {W}
  coverageRate: {P}%
```

---

### 11. Present Summary to User

"✅ **Mapa de Trazabilidad Construido con Éxito**

📊 **Estadísticas Generales:**
- Requerimientos Funcionales: {totalFRs}
- Épicas: {totalEpics}
- Historias de Usuario: {totalStories}
- Tareas identificadas: {totalTasks}

📈 **Cobertura:**
- FRs con cobertura de Épica: {frsWithEpicCoverage}/{totalFRs} ({coverageRate}%)
- Épicas con Historias: {epicsWithStories}/{totalEpics}

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
- FR→Epic mapping extracted from epics.md
- Epic→Story hierarchy built correctly
- Story→Task relationships extracted (if available)
- All validations performed (FRs coverage, Epics with Stories, no duplicate IDs)
- Warnings displayed for any gaps
- Traceability tree generated in ASCII format
- Coverage statistics calculated accurately
- Sections 1-3 written to output document
- Frontmatter updated with stepsCompleted: [1, 2] and statistics
- User confirmed completion

### ❌ SYSTEM FAILURE:

- Not loading context from step 01
- Incomplete extraction of FR→Epic mapping
- Missing Epic→Story hierarchy
- Validations not performed or skipped
- Gaps not reported to user
- Tree not generated
- Statistics not calculated
- Output document not updated
- Frontmatter not updated
- Proceeding without user confirmation

**Master Rule:** Traceability must be complete, validated, and accurate before proceeding to test case mapping.
