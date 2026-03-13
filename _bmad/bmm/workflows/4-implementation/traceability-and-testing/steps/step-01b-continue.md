---
name: 'step-01b-continue'
description: 'Resume the traceability workflow from the last completed step'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/traceability-and-testing'

# File References
thisStepFile: '{workflow_path}/steps/step-01b-continue.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{implementation_artifacts}/epic-test-plans/traceability-map.md'

# Possible next steps (routing based on stepsCompleted)
step02File: '{workflow_path}/steps/step-02-build-traceability.md'
step03File: '{workflow_path}/steps/step-03-interpret-tests.md'
step04File: '{workflow_path}/steps/step-04-generate-plans.md'
step05File: '{workflow_path}/steps/step-05-export.md'
---

# Step 1b: Continue Workflow

## STEP GOAL:

To resume the traceability and test planning workflow from the last completed step by reading the existing state and routing to the appropriate next step.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step, ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Test Architect and Requirements Engineer
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring expertise in requirements traceability and test planning

### Step-Specific Rules:

- 🎯 Focus ONLY on reading state and routing to correct step
- 🚫 FORBIDDEN to skip ahead or modify existing state
- 💬 Present clear summary of what's been completed
- 🚪 ROUTE to the exact next incomplete step

## EXECUTION PROTOCOLS:

- 🎯 Read frontmatter from output document
- 💾 Determine last completed step
- 📖 Present summary to user
- 🚫 FORBIDDEN to proceed without user confirmation

## CONTEXT BOUNDARIES:

- All context comes from the output document frontmatter
- Don't make assumptions about what was completed
- Trust the stepsCompleted array as source of truth

## CONTINUATION SEQUENCE:

### 1. Welcome Back

"¡Bienvenido de nuevo {user_name}!

Detecté que ya tienes un workflow de trazabilidad en progreso. Voy a cargar el estado y mostrarte dónde te quedaste."

---

### 2. Read Workflow State

Read the output document frontmatter:

```
Read frontmatter from: {outputFile}
```

Extract:
- `stepsCompleted` array
- `projectName`
- `generatedDate`
- `inputDocuments`
- `statistics` (if available)
- `testCases` (if available)
- `testPlans` (if available)
- `workflowCompleted` (if exists)

---

### 3. Analyze Completion State

Determine which steps have been completed:

**If `stepsCompleted` = [1]:**
- Last completed: Step 1 (Initialize & Validate Prerequisites)
- Next step: Step 2 (Build Traceability Map)
- Progress: 20%

**If `stepsCompleted` = [1, 2]:**
- Last completed: Step 2 (Build Traceability Map)
- Next step: Step 3 (Interpret Test Cases)
- Progress: 40%

**If `stepsCompleted` = [1, 2, 3]:**
- Last completed: Step 3 (Interpret Test Cases)
- Next step: Step 4 (Generate Epic Test Plans)
- Progress: 60%

**If `stepsCompleted` = [1, 2, 3, 4]:**
- Last completed: Step 4 (Generate Epic Test Plans)
- Next step: Step 5 (Export Artifacts)
- Progress: 80%

**If `stepsCompleted` = [1, 2, 3, 4, 5]:**
- Workflow is COMPLETE
- No next step needed

**If `workflowCompleted` = true:**
- Workflow is fully complete
- All artifacts have been generated

---

### 4. Present Status Summary

Display a comprehensive summary:

"📊 **Estado del Workflow de Trazabilidad**

**Proyecto:** {projectName}
**Iniciado:** {generatedDate}
**Progreso:** {percentage}%

---

**✅ Pasos Completados:**

{List each completed step with checkmark}

**Ejemplo para stepsCompleted = [1, 2]:**

✅ **Step 1: Validar Prerequisitos**
   - Documentos validados: {inputDocuments}
   - FRs encontrados: {count}
   - Épicas encontradas: {count}
   - Historias encontradas: {count}

✅ **Step 2: Construir Mapa de Trazabilidad**
   - Jerarquía FR→Epic→Story→Task construida
   - Tasa de cobertura: {coverageRate}%
   - Estadísticas:
     - Total FRs: {totalFRs}
     - Total Épicas: {totalEpics}
     - Total Historias: {totalStories}
     - Total Tareas: {totalTasks}

---

**⏭️ Siguiente Paso:**

**Step 3: Interpretar Casos de Prueba**
   - Leer pruebas_comandera.xlsm
   - Mapear casos de prueba a elementos de trazabilidad
   - Calcular cobertura de pruebas

---

**📁 Artefactos Generados hasta ahora:**

- traceability-map.md (Secciones 1-3 completadas)

{If additional artifacts exist, list them}

---

¿Deseas continuar desde el paso {next_step_number}?"

---

### 5. Handle Special Cases

**If workflow is already complete:**

"🎉 **¡Workflow Completado!**

Este workflow ya fue ejecutado completamente el {completedDate}.

**Artefactos generados:**

**Markdown:**
{list all markdown files from outputs.markdown}

**Excel:**
{list all excel files from outputs.excel}

**Ubicación:** `{implementation_artifacts}/`

---

**Opciones:**

1. **[R] Re-ejecutar** - Ejecutar el workflow nuevamente (sobrescribirá archivos existentes)
2. **[V] Ver Artefactos** - Mostrar resumen de los artefactos generados
3. **[E] Salir** - Cerrar el workflow

¿Qué deseas hacer?"

Handle user selection:
- If R: Ask for confirmation, then delete existing output file and route to step-01-init.md
- If V: Display detailed summary of all generated artifacts
- If E: Exit workflow with final message

HALT - Do not proceed to next step if workflow is complete unless user explicitly re-executes.

---

**If stepsCompleted array is empty or corrupted:**

"⚠️ **Estado Inconsistente Detectado**

El archivo de trazabilidad existe pero no tiene información de pasos completados en el frontmatter.

Esto puede indicar:
1. El archivo fue modificado manualmente
2. Hubo un error en la ejecución anterior
3. El workflow se interrumpió abruptamente

**Opciones:**

1. **[S] Empezar de nuevo** - Borrar el archivo actual y comenzar desde cero
2. **[I] Inspeccionar** - Mostrar el contenido del frontmatter para diagnóstico
3. **[C] Cancelar** - Salir del workflow

¿Qué prefieres?"

Handle user selection appropriately.

---

### 6. Confirm Continuation

Ask user:

"¿Estás listo para continuar con el **Step {next_step_number}: {next_step_name}**?"

Wait for user confirmation.

---

### 7. Route to Next Step

Based on `stepsCompleted` array, route to the appropriate step:

**Routing Logic:**

```
IF stepsCompleted = [1]:
    Load, read entire file, then execute {step02File}

ELSE IF stepsCompleted = [1, 2]:
    Load, read entire file, then execute {step03File}

ELSE IF stepsCompleted = [1, 2, 3]:
    Load, read entire file, then execute {step04File}

ELSE IF stepsCompleted = [1, 2, 3, 4]:
    Load, read entire file, then execute {step05File}

ELSE IF stepsCompleted = [1, 2, 3, 4, 5] OR workflowCompleted = true:
    Display completion message and halt
    (See section 5 for complete workflow handling)

ELSE:
    Display error about corrupted state
    (See section 5 for error handling)
```

**CRITICAL:** Always load, read the ENTIRE next step file, then execute it. Never skip the read operation.

---

### 8. Present MENU OPTIONS (if needed)

Display: **Selecciona una opción: [C] Continuar, [I] Información, [S] Salir**

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- Handle user questions and provide requested information
- ONLY route to next step when user confirms

#### Menu Handling Logic:

- IF C: Route to appropriate next step file based on stepsCompleted (see section 7)
- IF I: Display detailed information about current state and what next step will do
- IF S: Exit workflow with summary message
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#8-present-menu-options-if-needed)

---

## CRITICAL ROUTING NOTE

This step ONLY reads state and routes to the next incomplete step. It does NOT perform any workflow work itself. The actual work happens in the step files (step-02, step-03, step-04, step-05).

ALWAYS load, read entire next step file, then execute it. The routing must be exact based on the stepsCompleted array.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Frontmatter read correctly from output document
- stepsCompleted array parsed successfully
- User presented with clear status summary
- Correct next step determined
- User confirmed continuation
- Routed to exact next step file (not skipped ahead)

### ❌ SYSTEM FAILURE:

- Not reading frontmatter from output document
- Incorrectly parsing stepsCompleted array
- Routing to wrong step
- Skipping user confirmation
- Not handling completed workflow case
- Not handling corrupted state case
- Loading wrong step file

**Master Rule:** This step is a router ONLY. It reads state and routes. All actual work happens in other step files.
