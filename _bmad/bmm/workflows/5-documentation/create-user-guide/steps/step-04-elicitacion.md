---
name: 'step-04-elicitacion'
description: 'Elicit additional information from user to refine user guide scope and style'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/5-documentation/create-user-guide'

# File References
thisStepFile: '{workflow_path}/steps/step-04-elicitacion.md'
nextStepFile: '{workflow_path}/steps/step-05-generacion-espanol.md'
workflowFile: '{workflow_path}/workflow.md'
outputFileSpanish: '{output_folder}/documentation-artifacts/user-guide/es/{audience}-guide.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

# Config
bmmConfig: '{project-root}/_bmad/bmm/config.yaml'
---

# Step 4: Elicitación de Información

## STEP GOAL:

Realizar elicitación conversacional con el usuario para refinar el alcance de la guía, determinar nivel técnico de la audiencia, identificar escenarios críticos a documentar y decidir sobre secciones opcionales (ej: troubleshooting). Registrar todas las preferencias en frontmatter para uso en steps de generación.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a technical writer and requirements elicitation specialist
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring elicitation expertise and documentation best practices
- ✅ Maintain collaborative conversational tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on elicitation and preference gathering (INTENT-BASED)
- 🚫 FORBIDDEN to generate guide content yet
- 💬 Engage conversationally, adapt questions to context
- 📊 Capture user preferences for generation steps

## EXECUTION PROTOCOLS:

- 🎯 Use conversational elicitation, not interrogation
- 💾 Update frontmatter with all user preferences
- 📖 Set `stepsCompleted: [1, 2, 3, 4]` before loading next step
- 🚫 FORBIDDEN to skip elicitation topics

## CONTEXT BOUNDARIES:

- Features identified in step-03 (from context section)
- Target audience from frontmatter
- This is collaborative - requires active user participation
- Preferences captured here directly influence content generation

## EXECUTION APPROACH (INTENT-BASED):

This step uses INTENT-BASED execution. Adapt your elicitation style to the user's responses. Be conversational, not mechanical. The goal is to understand the user's vision for the guide.

### Core Elicitation Goals:

1. **Feature Scope Refinement:**
   - Which features should be prioritized?
   - Any features to exclude or de-emphasize?
   - Any features missing that should be added?

2. **Critical Use Cases:**
   - What are the most important user scenarios?
   - Which workflows are most frequently used?
   - What pain points should be addressed?

3. **Technical Level:**
   - How technically savvy is the target audience?
   - What can we assume they know?
   - What needs detailed explanation?

4. **Known Issues & Limitations:**
   - Are there limitations users should know about?
   - Common pitfalls or warnings?
   - Workarounds for known issues?

5. **Optional Sections:**
   - Should we include troubleshooting section?
   - Need for advanced configuration section?
   - API integration examples (if applicable)?

## EXECUTION SEQUENCE:

### 1. Present Features Summary

"📋 **Funcionalidades Identificadas para Documentar**

Basándome en el análisis de las {epic_count} épicas seleccionadas, he identificado las siguientes funcionalidades:

{List top 10-15 features with sources, grouped by category if possible}

Antes de comenzar a generar la guía, necesito tu input en algunas áreas clave para asegurar que la documentación sea exactamente lo que necesitas..."

### 2. Elicit Feature Scope Refinement

**Conversational Approach:**

"**Refinamiento del Alcance:**

De todas estas funcionalidades identificadas:

1. ¿Hay alguna que NO debería documentarse en esta guía de usuario? (Por ejemplo, features deprecadas, experimentales, o no relevantes para {audience_name})

2. ¿Hay alguna funcionalidad que debería tener prioridad o documentarse con mayor detalle?

3. ¿Falta alguna funcionalidad importante que no aparece en la lista pero que debería incluirse?

No hay respuestas incorrectas - estoy aquí para adaptar la guía a tus necesidades específicas."

**Wait for user response and discuss.**

**Capture:**
- features_to_exclude: [list]
- features_to_prioritize: [list]
- features_to_add_manually: [list with descriptions]

### 3. Elicit Critical Scenarios

**Conversational Approach:**

"**Escenarios de Uso Críticos:**

Para hacer la guía más útil, quiero enfocarme en los escenarios reales que tus usuarios enfrentan.

1. ¿Cuáles son los 3-5 casos de uso más comunes o importantes para documentar en detalle?

2. ¿Hay workflows específicos que causan confusión actualmente y necesitan documentación clara?

3. ¿Hay integraciones con otros sistemas o procesos externos que deberíamos explicar?

Puedes ser tan específico o general como desees."

**Wait for user response and discuss.**

**Capture:**
- additional_scenarios: [list of scenarios described by user]

### 4. Determine Technical Level

**Conversational Approach:**

"**Nivel Técnico de la Audiencia:**

Para ajustar el tono y profundidad de la guía, necesito entender mejor a tus usuarios finales.

La audiencia objetivo es: **{audience_name}**

¿Cómo describirías su nivel técnico?

- **Novato:** Usuarios sin experiencia técnica, necesitan explicaciones paso a paso muy detalladas
- **Intermedio:** Usuarios cómodos con tecnología, pueden seguir instrucciones técnicas con contexto adecuado
- **Avanzado:** Usuarios técnicamente expertos, prefieren información concisa y directa
- **Mixto:** Audiencia variada, necesitamos balancear explicaciones básicas con información avanzada

¿Qué nivel(es) aplica mejor?"

**Wait for user response.**

**Capture:**
- technical_level: "novice" | "intermediate" | "advanced" | "mixed"

### 5. Elicit Warnings and Limitations

**Conversational Approach:**

"**Limitaciones y Advertencias:**

1. ¿Hay limitaciones conocidas del sistema que los usuarios deberían conocer desde el principio?

2. ¿Hay configuraciones o acciones que podrían causar problemas si se hacen incorrectamente?

3. ¿Hay dependencias externas o requisitos especiales que impacten el uso?

Esta información nos ayudará a incluir advertencias y notas importantes en los lugares correctos."

**Wait for user response and discuss.**

**Capture:**
- known_limitations: [list]
- critical_warnings: [list]

### 6. Decide on Troubleshooting Section

**Direct Question:**

"**Sección de Troubleshooting:**

¿Deseas incluir una sección de "Solución de Problemas" (Troubleshooting) al final de la guía?

Esta sección incluiría:
- Problemas comunes y sus soluciones
- Mensajes de error típicos y cómo resolverlos
- Preguntas frecuentes relacionadas con issues

**[S]** Sí, incluir troubleshooting
**[N]** No, solo FAQ es suficiente

¿Qué prefieres?"

**Wait for user response.**

**Capture:**
- include_troubleshooting: true | false

### 7. Synthesis and Confirmation

"✅ **Resumen de Preferencias Capturadas:**

Voy a generar la guía de usuario con las siguientes configuraciones:

**Alcance:**
- Funcionalidades a documentar: {count} (excluyendo {excluded_count})
- Funcionalidades priorizadas: {prioritized_list if any}
- Escenarios adicionales: {scenario_count}

**Estilo:**
- Nivel técnico: **{technical_level_name}**
- Troubleshooting: **{yes/no}**

**Consideraciones especiales:**
- Limitaciones conocidas: {limitations_count}
- Advertencias críticas: {warnings_count}

¿Todo correcto o necesitas ajustar algo?"

**Wait for confirmation. If adjustments needed, revisit relevant sections.**

### 8. Update Frontmatter

Update `{outputFileSpanish}` frontmatter with all captured preferences:

```yaml
# User preferences (populated in step-04)
technical_level: "intermediate"  # Example
include_troubleshooting: true
additional_scenarios:
  - "Scenario 1 description"
  - "Scenario 2 description"
features_to_exclude:
  - "Feature X"
features_to_prioritize:
  - "Feature Y"
  - "Feature Z"
known_limitations:
  - "Limitation 1"
critical_warnings:
  - "Warning 1"
```

### 9. Transition Message

"✅ **Elicitación Completada**

Tengo toda la información que necesito para generar una guía de usuario comprehensiva y adaptada a tus necesidades.

**Próximo paso:** Generación del contenido en español.

El agente trabajará de manera autónoma para crear todas las secciones de la guía, incluyendo:
- Diagramas Mermaid para cada feature y workflow
- Screenshot placeholders con índice
- Source citations para trazabilidad
- Estructura navegable

Esto puede tomar algunos minutos. ¿Listo para continuar?"

### 10. Update State Before Next Step

Before loading next step:
- Ensure frontmatter.stepsCompleted = [1, 2, 3, 4]
- Ensure frontmatter.currentStep = "step-05-generacion-espanol"
- Save outputFileSpanish

### 11. Present MENU OPTIONS

Display: **Select an Option:** [C] Continue

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'

#### Menu Handling Logic:

- IF C: Update frontmatter, then load, read entire file, then execute `{nextStepFile}`
- IF Any other: Respond and redisplay menu

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and all preferences are captured in frontmatter, will you then load, read entire file, then execute `{nextStepFile}` to begin Spanish content generation.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Features summary presented to user
- Feature scope refined conversationally
- Critical scenarios identified
- Technical level determined
- Warnings and limitations captured
- Troubleshooting decision made
- All preferences stored in frontmatter
- frontmatter.stepsCompleted = [1, 2, 3, 4]
- User confirmed preferences
- Ready to proceed to step 5

### ❌ SYSTEM FAILURE:

- Using interrogation instead of conversation
- Skipping elicitation topics
- Not adapting to user responses
- Not capturing preferences in frontmatter
- Proceeding without user confirmation

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
