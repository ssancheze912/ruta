---
name: 'step-03-analisis-fuentes'
description: 'Analyze source artifacts (PRDs, epics, architecture) to extract context for user guide'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/5-documentation/create-user-guide'

# File References
thisStepFile: '{workflow_path}/steps/step-03-analisis-fuentes.md'
nextStepFile: '{workflow_path}/steps/step-04-elicitacion.md'
workflowFile: '{workflow_path}/workflow.md'
outputFileSpanish: '{output_folder}/documentation-artifacts/user-guide/es/{audience}-guide.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

# Config
bmmConfig: '{project-root}/_bmad/bmm/config.yaml'
---

# Step 3: Análisis de Fuentes

## STEP GOAL:

Leer y analizar todos los artefactos de documentación del proyecto (PRDs, épicas seleccionadas, arquitectura, workflows) para extraer información clave que se utilizará en la generación de la guía de usuario. Este es un step autónomo donde el agente trabaja sin requerir input constante del usuario.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a technical writer and documentation analyst
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring analytical and synthesis skills, user brings project artifacts
- ✅ Maintain collaborative professional tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on reading and analyzing artifacts (INTENT-BASED execution)
- 🚫 FORBIDDEN to generate user guide content yet (that happens in step-05)
- 💬 Work autonomously but provide progress updates
- 📊 Extract key information: features, user roles, workflows, concepts

## EXECUTION PROTOCOLS:

- 🎯 Read all selected artifacts completely
- 💾 Append "## Contexto del Proyecto" section to outputFile
- 📖 Set `stepsCompleted: [1, 2, 3]` before loading next step
- 🚫 FORBIDDEN to skip artifact reading

## CONTEXT BOUNDARIES:

- Epics selected in step-02 (from frontmatter.epics_selected)
- Target audience from frontmatter.target_audience
- This is autonomous work - minimal user interaction
- Information extracted here feeds into step-04 and step-05

## EXECUTION APPROACH (INTENT-BASED):

This step uses INTENT-BASED execution. You have flexibility in HOW you analyze, but must accomplish the GOAL of extracting comprehensive project context.

### Core Analysis Goals:

1. **Understand the Product:**
   - What is the system/application about?
   - What problem does it solve?
   - Who are the users?

2. **Identify Key Features:**
   - What are the main functionalities?
   - Which features are documented in the selected epics?
   - What acceptance criteria exist?

3. **Map User Workflows:**
   - What are the common user journeys?
   - What processes do users follow?
   - What are the critical paths?

4. **Extract Technical Context:**
   - What is the architecture?
   - What are the key components?
   - What technologies are used?

5. **Understand User Roles:**
   - What types of users exist?
   - What permissions/capabilities do they have?
   - How do roles differ?

## EXECUTION SEQUENCE:

### 1. Announce Analysis Start

"🔍 **Iniciando Análisis de Documentación**

Voy a leer y analizar todos los artefactos del proyecto para extraer la información necesaria para tu guía de usuario.

**Artefactos a analizar:**
- PRD documents (goals, requirements, UI design)
- {count} épicas seleccionadas
- Architecture documentation
- Workflow documentation (si existe)

Esto puede tomar un momento. Te mantendré informado del progreso..."

### 2. Discover and Read PRD Documents

**Scan locations (in priority order):**

- `{planning_artifacts}/goals-and-background-context.md`
- `{planning_artifacts}/requirements.md`
- `{planning_artifacts}/user-interface-design-goals.md`

**For each PRD found:**
- Read complete file
- Extract: system purpose, goals, target users, key requirements
- Add to frontmatter.source_artifacts.prd_docs

**Progress update:**
"✓ PRD analysis completado - {count} documentos leídos"

### 3. Read Selected Epics from Consolidated File

**Load consolidated epics file:**
- Read complete epics.md file from frontmatter.source_artifacts.epics_file
- Parse file to locate each epic section (identified by H3 headers: `### Epic X:`)
- For each epic number in frontmatter.epics_selected:
  - Extract the complete epic section (from its H3 header to the next epic's H3 header or end of file)
  - Parse within that section:
    - Epic title and description
    - User stories with acceptance criteria
    - Features described
    - User workflows/journeys
    - Technical requirements
- Compile comprehensive list of features and their sources

**Progress update:**
"✓ Epic analysis completado - {count} épicas procesadas desde archivo consolidado, {features_count} features identificadas"

### 4. Read Architecture Documentation

**Scan locations:**

- `{planning_artifacts}/core-workflows.md`
- `{planning_artifacts}/components.md`
- `{planning_artifacts}/architecture-*.md`

**For each architecture doc found:**
- Read complete file
- Extract: system workflows, component structure, technical stack
- Add to frontmatter.source_artifacts.architecture_docs

**Progress update:**
"✓ Architecture analysis completado"

### 5. Read Workflow Documentation (Optional)

**If core-workflows.md exists:**
- Read complete file
- Extract: detailed user workflows, step-by-step processes
- Add to frontmatter.source_artifacts.workflow_docs

### 6. Synthesize Project Context

Create a synthesis of analyzed information:

**Key Information Extracted:**
- System name and purpose
- Target users and roles
- Core features (with epic/story references)
- Main user workflows
- Technical architecture overview
- UI components (if documented)

### 7. Append Context Section to Output

Append to `{outputFileSpanish}` after the frontmatter:

```markdown
## Contexto del Proyecto

### Propósito del Sistema

[Brief description from PRD goals]

### Usuarios Objetivo

[User types and roles from PRD and epics]

### Funcionalidades Principales Identificadas

Las siguientes funcionalidades han sido identificadas desde la documentación del proyecto:

{for each feature}
- **{Feature Name}** [Source: Epic {number} Story {number}]
  Brief description if available
{end for}

**Total:** {features_count} funcionalidades identificadas para documentar

### Workflows Identificados

{for each workflow}
- **{Workflow Name}** [Source: {source}]
  Brief description
{end for}

**Nota:** Los detalles completos de cada funcionalidad y workflow se documentarán en las secciones siguientes de esta guía.

---
```

### 8. Update Frontmatter

Update frontmatter with discovered information:

```yaml
source_artifacts:
  prd_docs: [list of PRD files read]
  epics_file: "path/to/epics.md"  # Single consolidated epics file
  architecture_docs: [list of architecture files read]
  workflow_docs: [list of workflow files read]

# Preliminary counts (will be updated in step-05)
features_documented: 0  # Will be populated during generation
workflows_documented: 0  # Will be populated during generation
```

### 9. Analysis Complete Message

"✅ **Análisis de Documentación Completado**

**Resumen del Análisis:**
- PRD documents: {prd_count} leídos
- Épicas analizadas: {epic_count}
- Funcionalidades identificadas: {features_count}
- Workflows identificados: {workflow_count}
- Architecture docs: {arch_count} leídos

He agregado una sección de "Contexto del Proyecto" al documento de la guía con un resumen de toda la información encontrada.

**Siguiente paso:** Elicitación de información adicional con el usuario para refinar el alcance y estilo de la guía.

¿Listo para continuar?"

### 10. Update State Before Next Step

Before loading next step:
- Ensure frontmatter.stepsCompleted = [1, 2, 3]
- Ensure frontmatter.currentStep = "step-04-elicitacion"
- Save outputFileSpanish with new context section

### 11. Present MENU OPTIONS

Display: **Select an Option:** [R] Re-scan [C] Continue

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu

#### Menu Handling Logic:

- IF R: Re-scan and re-analyze all artifacts, return to step 2
- IF C: Update frontmatter, then load, read entire file, then execute `{nextStepFile}`
- IF Any other: Respond and redisplay menu

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and analysis is complete with context section appended, will you then load, read entire file, then execute `{nextStepFile}` to begin information elicitation.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All artifact locations scanned
- All selected epics read completely
- PRD documents read and analyzed
- Architecture docs read
- Features identified with source citations
- Workflows identified
- Context section appended to outputFile
- Frontmatter updated with source_artifacts
- frontmatter.stepsCompleted = [1, 2, 3]
- User informed of analysis results
- Ready to proceed to step 4

### ❌ SYSTEM FAILURE:

- Skipping artifact reading
- Not reading complete files
- Missing source locations
- Not extracting features comprehensively
- Not appending context section
- Not updating frontmatter

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
