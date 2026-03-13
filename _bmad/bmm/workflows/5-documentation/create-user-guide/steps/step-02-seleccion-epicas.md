---
name: 'step-02-seleccion-epicas'
description: 'Select which epics to include in the user guide'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/5-documentation/create-user-guide'

# File References
thisStepFile: '{workflow_path}/steps/step-02-seleccion-epicas.md'
nextStepFile: '{workflow_path}/steps/step-03-analisis-fuentes.md'
workflowFile: '{workflow_path}/workflow.md'
outputFileSpanish: '{output_folder}/documentation-artifacts/user-guide/es/{audience}-guide.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

# Config
bmmConfig: '{project-root}/_bmad/bmm/config.yaml'
---

# Step 2: Selección de Épicas

## STEP GOAL:

Identificar y presentar todas las épicas disponibles del proyecto al usuario, permitiéndole seleccionar cuáles deben incluirse en la guía de usuario. Registrar épicas seleccionadas/excluidas en el frontmatter del documento de output.

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
- ✅ You bring documentation expertise, user brings project knowledge
- ✅ Maintain collaborative professional tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on epic discovery and selection
- 🚫 FORBIDDEN to read epic content in this step (that happens in step-03)
- 💬 Present epics clearly and wait for user selection
- 🚫 DO NOT make assumptions about which epics to include

## EXECUTION PROTOCOLS:

- 🎯 Scan multiple locations for epic files
- 💾 Update frontmatter with epic selection
- 📖 Set `stepsCompleted: [1, 2]` before loading next step
- 🚫 FORBIDDEN to proceed without user confirmation

## CONTEXT BOUNDARIES:

- Spanish output document created in step-01
- Target audience configured in frontmatter
- Epic files need to be discovered and listed
- No content reading yet - just file discovery

## EXECUTION SEQUENCE:

### 1. Load Consolidated Epics File

Search for consolidated epics file in:

**Primary location:**
- `{planning_artifacts}/epics.md`

**Fallback locations (if primary not found):**
- `{implementation_artifacts}/epics.md`
- `{project_knowledge}/epics.md`

**Read and Parse Epics:**
1. Read the complete epics.md file
2. Search for epic headers matching pattern: `### Epic X: [Title]` (H3 headers)
3. Extract epic number and title from each header
4. Add to discovery list with: number, title, file_path

### 2. Present Epics to User

Display in Spanish (using `{communication_language}`):

"📚 **Épicas Encontradas en el Proyecto**

He encontrado las siguientes épicas disponibles para documentar:

{for each epic in sorted order by number}
- **Epic {number}:** {title}
  Archivo: {relative_path}
{end for}

**Total:** {count} épicas encontradas"

### 3. Request Epic Selection (PRESCRIPTIVE)

Ask user with exact text:

"¿Cuáles épicas deseas incluir en la guía de usuario?

**[A]** Todas las épicas - Incluir todas las {count} épicas encontradas

**[E]** Épicas específicas - Proporcionar números separados por comas (ej: 1,3,5)

**[X]** Excluir específicas - Incluir todas EXCEPTO las que especifiques (ej: 2,4)

Por favor selecciona una opción (A/E/X):"

HALT and wait for user input.

### 4. Parse User Response

**IF A (All epics):**
- Set `epics_selected` = [all epic numbers found]
- Set `epics_excluded` = []
- Message: "✅ Incluidas: {count} épicas (todas)"

**IF E (Specific epics):**
- Parse comma-separated numbers from user input
- Validate each number exists in discovered epics
- Set `epics_selected` = [parsed numbers]
- Set `epics_excluded` = [remaining numbers]
- Message: "✅ Incluidas: {selected_count} épicas | Excluidas: {excluded_count}"

**IF X (Exclude specific):**
- Parse comma-separated numbers from user input
- Validate each number exists in discovered epics
- Set `epics_selected` = [all numbers EXCEPT excluded]
- Set `epics_excluded` = [parsed numbers]
- Message: "✅ Incluidas: {selected_count} épicas | Excluidas: {excluded_count}"

### 5. Update Frontmatter

Update `{outputFileSpanish}` frontmatter with:

```yaml
epics_selected: [1, 3, 5]  # Example - epic numbers from consolidated file
epics_excluded: [2, 4]     # Example - epic numbers excluded
source_artifacts:
  epics_file: "path/to/epics.md"  # Single consolidated epics file
```

### 6. Confirmation Message

"✅ **Selección de Épicas Completada**

Documentaremos las siguientes épicas:
{for each selected epic}
- Epic {number}: {title}
{end for}

Excluidas: {excluded_count} épicas

Procediendo al análisis de documentación..."

### 7. Update State Before Next Step

Before loading next step:
- Ensure frontmatter.stepsCompleted = [1, 2]
- Ensure frontmatter.currentStep = "step-03-analisis-fuentes"
- Save outputFileSpanish

### 8. Present MENU OPTIONS

Display: **Select an Option:** [R] Refresh [C] Continue

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu

#### Menu Handling Logic:

- IF R: Re-scan directories for epic files and return to step 2
- IF C: Update frontmatter, then load, read entire file, then execute `{nextStepFile}`
- IF Any other: Respond and redisplay menu

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and epic selection is saved to frontmatter, will you then load, read entire file, then execute `{nextStepFile}` to begin artifact analysis.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All epic locations scanned
- Epics discovered and listed with titles
- User provided clear selection (all/specific/exclude)
- Selection parsed and validated
- Frontmatter updated with epics_selected and epics_excluded
- frontmatter.stepsCompleted = [1, 2]
- Confirmation message displayed
- Ready to proceed to step 3

### ❌ SYSTEM FAILURE:

- Not scanning all locations
- Making assumptions about which epics to include
- Not validating user input
- Proceeding without user confirmation
- Not updating frontmatter correctly

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
