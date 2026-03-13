---
name: 'step-07-validacion-guardado'
description: 'Validate bilingual user guides and save with language selector index'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/5-documentation/create-user-guide'

# File References
thisStepFile: '{workflow_path}/steps/step-07-validacion-guardado.md'
workflowFile: '{workflow_path}/workflow.md'
outputFileSpanish: '{output_folder}/documentation-artifacts/user-guide/es/{audience}-guide.md'
outputFileEnglish: '{output_folder}/documentation-artifacts/user-guide/en/{audience}-guide.md'
indexFile: '{output_folder}/documentation-artifacts/user-guide/index.md'

# Loop reference (for corrections)
correctionTargetStep: '{workflow_path}/steps/step-05-generacion-espanol.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

# Config
bmmConfig: '{project-root}/_bmad/bmm/config.yaml'
---

# Step 7: Validación y Guardado

## STEP GOAL:

Ejecutar validación comprehensiva (self-check) de ambas guías de usuario (español e inglés), verificar cumplimiento de criterios de éxito, presentar resultados al usuario y permitir correcciones si es necesario. Si todo está correcto, guardar ambas versiones y crear/actualizar el archivo index.md con selector de idioma.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a quality assurance specialist and technical writer
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring quality validation expertise, user brings approval authority
- ✅ Maintain collaborative professional tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on validation and finalization (PRESCRIPTIVE)
- 🚫 FORBIDDEN to skip validation checks
- 💬 Present clear validation results
- 🔄 Support loop back to step-05 if corrections needed

## EXECUTION PROTOCOLS:

- 🎯 Execute all validation checks systematically
- 💾 Only save/finalize with user approval
- 📖 Set `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]` when workflow complete
- 🔄 LOOP to step-05 if issues found and user requests fixes

## CONTEXT BOUNDARIES:

- Both complete guides (Spanish and English)
- All frontmatter metrics
- This is final quality gate before delivery
- User has final approval authority

## TOP 5 NON-NEGOTIABLE CRITERIA:

1. **📄 Bilingual Output Completo:** Both versions exist with identical structure
2. **🔗 Source Citations Obligatorias:** Every feature has citation
3. **📊 Diagramas Mermaid Completos:** Every feature/workflow has diagram
4. **📸 Screenshot Placeholders Presentes:** Correct format + Screenshot Index
5. **✅ Self-Check Pasado:** Completeness >= 90%, no TODOs

## EXECUTION SEQUENCE (PRESCRIPTIVE):

### 1. Announce Validation Start

"🔍 **Iniciando Validación Final**

Voy a ejecutar una verificación comprehensiva de ambas guías de usuario (español e inglés) para asegurar que cumplen todos los criterios de calidad.

**Criterios a Validar:**
1. Output bilingüe completo
2. Source citations obligatorias
3. Diagramas Mermaid completos
4. Screenshot placeholders presentes
5. Self-check de completitud

Este proceso tomará un momento..."

### 2. VALIDATION CHECK 1: Bilingual Output Completo

**Check 1.1: File Existence**
- Spanish file exists at `{outputFileSpanish}`: {YES/NO}
- English file exists at `{outputFileEnglish}`: {YES/NO}

**Check 1.2: File Non-Empty**
- Spanish file size: {bytes}
- English file size: {bytes}
- Both > 10KB: {YES/NO}

**Check 1.3: Identical Structure**

Read both files and count:

| Element | Spanish | English | Match |
|---------|---------|---------|-------|
| H1 headers | {count} | {count} | {✓/✗} |
| H2 headers | {count} | {count} | {✓/✗} |
| H3 headers | {count} | {count} | {✓/✗} |
| H4 headers | {count} | {count} | {✓/✗} |
| Total sections | {count} | {count} | {✓/✗} |

**Result:** {PASS/FAIL}

### 3. VALIDATION CHECK 2: Source Citations Obligatorias

**Check 2.1: Citation Presence**

Scan Spanish document for `[Source: Epic ` pattern:
- Total source citations found: {count}
- From frontmatter.features_documented: {count}
- Citation ratio: {citations / features}

**Required:** Ratio >= 1.0 (at least one citation per feature)

**Check 2.2: Citation Format Validation**

For each citation:
- Matches pattern `[Source: Epic \d+ Story \d+]`: {valid_count}/{total_count}
- All epic numbers reference selected epics: {YES/NO}

**Check 2.3: No Invented Features**

- All features documented appear in analyzed epics: {YES/NO}
- No features without source: {YES/NO}

**Result:** {PASS/FAIL}

### 4. VALIDATION CHECK 3: Diagramas Mermaid Completos

**Check 3.1: Diagram Count**

Scan both documents for ```mermaid blocks:
- Spanish diagrams: {count}
- English diagrams: {count}
- Counts match: {YES/NO}

**Check 3.2: Minimum Diagram Coverage**

From frontmatter:
- features_documented: {count}
- workflows_documented: {count}
- Expected minimum diagrams: {features + workflows}
- Actual diagrams: {count}
- Coverage: {actual >= expected}

**Check 3.3: Diagram Localization**

Sample 5 random diagrams from each:
- Spanish diagrams use Spanish labels: {YES/NO}
- English diagrams use English labels: {YES/NO}

**Result:** {PASS/FAIL}

### 5. VALIDATION CHECK 4: Screenshot Placeholders

**Check 4.1: Screenshot Format**

Scan both documents for `[Screenshot: ` pattern:
- Spanish screenshots: {count}
- English screenshots: {count}
- Counts match: {YES/NO}

**Check 4.2: ID Format Validation**

For each screenshot placeholder:
- ID in UPPER_SNAKE_CASE: {valid_count}/{total_count}
- ID has valid prefix (FEATURE_/WORKFLOW_/UI_/ERROR_): {valid_count}/{total_count}
- All IDs are unique: {YES/NO}

**Check 4.3: Screenshot Index Validation**

- Screenshot Index section exists in Spanish: {YES/NO}
- Screenshot Index section exists in English: {YES/NO}
- All placeholder IDs appear in index: {YES/NO}
- Index table format correct: {YES/NO}

**Result:** {PASS/FAIL}

### 6. VALIDATION CHECK 5: Self-Check Completitud

**Check 5.1: Epic Coverage**

From frontmatter.epics_selected: [1, 3, 5]

- All selected epics referenced in content: {YES/NO}
  - Epic 1: {referenced count} times
  - Epic 3: {referenced count} times
  - Epic 5: {referenced count} times

**Check 5.2: No Incomplete Markers**

Scan both documents for:
- TODO markers: {count found} (should be 0)
- FIXME markers: {count found} (should be 0)
- [TBD] markers: {count found} (should be 0)
- Empty sections (## Header with no content): {count found}

**Check 5.3: Completeness Score Calculation**

Calculate score based on:
- All required sections present: {25 points if yes}
- All features have diagrams: {25 points if yes}
- All features have citations: {20 points if yes}
- Screenshot index complete: {15 points if yes}
- No incomplete markers: {15 points if yes}

**Completeness Score:** {total}/100

**Required:** Score >= 90

**Result:** {PASS/FAIL}

### 7. Compile Validation Report

**📊 VALIDATION REPORT**

```
=== USER GUIDE VALIDATION RESULTS ===

Project: {project_name}
Audience: {target_audience}
Date: {current_date}

CRITERIA 1: Bilingual Output Completo
├─ File Existence: {PASS/FAIL}
├─ File Size: {PASS/FAIL}
└─ Identical Structure: {PASS/FAIL}
   └─ Headers match: H1({es_count}={en_count}) H2({es_count}={en_count}) H3({es_count}={en_count})
Status: {✓ PASS / ✗ FAIL}

CRITERIA 2: Source Citations Obligatorias
├─ Citation Count: {count} citations for {features_count} features
├─ Citation Ratio: {ratio} (required: >= 1.0)
├─ Format Valid: {valid_count}/{total_count}
└─ Epic References Valid: {YES/NO}
Status: {✓ PASS / ✗ FAIL}

CRITERIA 3: Diagramas Mermaid Completos
├─ Diagram Count: {es_count} (Spanish) = {en_count} (English)
├─ Minimum Coverage: {actual} >= {expected} required
├─ Localization: Spanish labels in ES, English labels in EN
Status: {✓ PASS / ✗ FAIL}

CRITERIA 4: Screenshot Placeholders
├─ Placeholder Count: {es_count} (Spanish) = {en_count} (English)
├─ ID Format: {valid_count}/{total_count} valid (UPPER_SNAKE_CASE)
├─ Screenshot Index: {EXISTS/MISSING}
└─ Index Completeness: {matched}/{total} IDs
Status: {✓ PASS / ✗ FAIL}

CRITERIA 5: Self-Check Completitud
├─ Epic Coverage: {covered_count}/{selected_count} epics documented
├─ Incomplete Markers: {count} found (should be 0)
├─ Completeness Score: {score}/100 (required: >= 90)
Status: {✓ PASS / ✗ FAIL}

=== OVERALL RESULT ===

Criteria Passed: {passed_count}/5
Overall Status: {✅ APPROVED / ⚠️ NEEDS ATTENTION / ❌ FAILED}

{if issues found:}
=== ISSUES FOUND ===

{list all validation failures with specific details}

1. {Issue description}
   Location: {where}
   Required: {what's needed}

2. {Issue description}
   ...
{endif}
```

### 8. Present Validation Results to User

Display in Spanish (using `{communication_language}`):

"🔍 **Validación Completada**

{if all checks passed:}

✅ **¡Excelente! Todas las validaciones pasaron.**

Tu guía de usuario cumple con todos los criterios de calidad:

- ✓ Ambas versiones (español e inglés) generadas con estructura idéntica
- ✓ {citations_count} source citations presentes ({ratio} por feature)
- ✓ {diagrams_count} diagramas Mermaid completos y localizados
- ✓ {screenshots_count} screenshot placeholders con índice completo
- ✓ Completeness score: {score}/100 (excelente)

**Estadísticas Finales:**
- Features documentadas: {features_count}
- Workflows documentados: {workflows_count}
- Total páginas (aprox): {estimated_pages}
- Palabra count (aprox): {word_count}

¿Listo para guardar y finalizar?

{else:}

⚠️ **Atención: Se encontraron {issues_count} problemas que necesitan corrección.**

{Display issues list}

**Opciones:**
- Puedo intentar corregir estos problemas automáticamente (loop a step-05)
- O puedes revisar manualmente y volver a ejecutar el workflow

¿Qué prefieres hacer?

{endif}"

### 9. Update Completeness Score in Frontmatter

Update both Spanish and English frontmatter:

```yaml
completeness_score: {calculated_score}
review_status: "{approved/needs_review/failed}"
```

### 10. Present FINAL MENU OPTIONS

**IF all validations passed:**

Display: **Select an Option:** [V] View Report [S] Save and Finalize

**IF validations failed:**

Display: **Select an Option:** [V] View Report [F] Fix Issues [S] Save Anyway (not recommended)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- DO NOT proceed without explicit user choice
- After other menu items execution, return to this menu

#### Menu Handling Logic:

**Common options:**
- IF V: Display complete validation report in detail, return to menu
- IF A (if shown): Execute `{advancedElicitationTask}` for detailed issue analysis
- IF P (if shown): Execute `{partyModeWorkflow}` for collaborative review

**If ALL passed:**
- IF S: Proceed to finalization (section 11)

**If FAILED:**
- IF F: Collect issues, prepare corrections context, LOOP to `{correctionTargetStep}` with corrections
- IF S: Warn user, confirm, then proceed to finalization (not recommended)

### 11. Finalization Sequence (When User Selects [S] Save)

**11.1: Create/Update Language Selector Index**

Create `{indexFile}` with content:

```markdown
# {project_name} - User Guide

Select your preferred language / Selecciona tu idioma preferido:

## Available Languages / Idiomas Disponibles

### [📘 English Version](./en/{audience}-guide.md)

Complete user guide in English for {audience_description_en}.

**Contents:**
- Getting Started
- Core Concepts
- Features and How to Use Them
- Common Workflows
- FAQ and Troubleshooting
- Glossary

---

### [📗 Versión en Español](./es/{audience}-guide.md)

Guía de usuario completa en español para {audience_description_es}.

**Contenido:**
- Primeros Pasos
- Conceptos Clave
- Funcionalidades y Cómo Usarlas
- Flujos de Trabajo Comunes
- FAQ y Solución de Problemas
- Glosario

---

## Document Information / Información del Documento

- **Project / Proyecto:** {project_name}
- **Target Audience / Audiencia:** {audience_name}
- **Generated / Generado:** {generated_date}
- **Version / Versión:** {workflow_version}

## Statistics / Estadísticas

- **Features Documented / Funcionalidades:** {features_count}
- **Workflows Documented / Workflows:** {workflows_count}
- **Diagrams / Diagramas:** {diagrams_count}
- **Screenshots / Capturas:** {screenshots_count}
- **Quality Score / Calidad:** {completeness_score}/100
```

**11.2: Update Final Frontmatter**

Update both Spanish and English frontmatter:

```yaml
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
currentStep: "completed"
review_status: "approved"
last_modified: "{current_timestamp}"
```

**11.3: Save All Files**

- Save `{outputFileSpanish}`
- Save `{outputFileEnglish}`
- Save `{indexFile}`

**11.4: Generate Completion Summary**

"✅ **¡Workflow Completado Exitosamente!**

**📦 Archivos Generados:**

1. **Guía en Español:**
   - Ubicación: `{outputFileSpanish}`
   - Tamaño: {file_size}
   - Secciones: {section_count}

2. **Guía en Inglés:**
   - Ubicación: `{outputFileEnglish}`
   - Tamaño: {file_size}
   - Secciones: {section_count}

3. **Selector de Idioma:**
   - Ubicación: `{indexFile}`

**📊 Estadísticas Finales:**

| Métrica | Valor |
|---------|-------|
| Features documentadas | {features_count} |
| Workflows documentados | {workflows_count} |
| Diagramas Mermaid | {diagrams_count} |
| Screenshot placeholders | {screenshots_count} |
| Source citations | {citations_count} |
| Completeness score | {score}/100 |
| Palabra count total (aprox) | {word_count} |

**📋 Épicas Documentadas:**

{For each epic in epics_selected:}
- Epic {number}: {title} ✓ Documentada
{End for}

**✅ Próximos Pasos:**

1. Revisar las guías generadas
2. Capturar las {screenshots_count} screenshots identificadas en el Screenshot Index
3. Reemplazar placeholders con screenshots reales
4. Revisar diagramas Mermaid y ajustar si es necesario
5. Publicar o distribuir la documentación

**¡Gracias por usar el generador de guías de usuario!**"

### 12. Workflow Complete

Workflow has finished successfully. No further steps.

---

## LOOP MECHANISM (If [F] Fix Issues Selected):

**When user selects [F] Fix Issues:**

1. **Prepare Corrections Context:**
   - Compile list of all validation issues
   - Identify which features/workflows need correction
   - Prepare specific instructions for fixes

2. **Store Corrections in Frontmatter:**
   ```yaml
   corrections_needed:
     - issue: "{issue description}"
       location: "{section/feature}"
       fix: "{what needs to be done}"
   ```

3. **Loop to step-05:**
   - Load, read entire file `{correctionTargetStep}`
   - Execute step-05 with corrections context
   - Step-05 will regenerate problematic sections
   - After step-05 completes, flow continues to step-06 (translation)
   - After step-06, returns to step-07 (this step) for re-validation

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All 5 validation checks executed
- Validation report generated
- User presented with clear results
- IF issues: user offered fix or save options
- IF no issues: files saved successfully
- Index.md created with language selector
- Frontmatter updated with completion status
- frontmatter.stepsCompleted = [1, 2, 3, 4, 5, 6, 7]
- Completion summary displayed
- Workflow finished

### ❌ SYSTEM FAILURE:

- Skipping validation checks
- Not calculating completeness score
- Saving without user approval
- Not creating index.md
- Not updating frontmatter to "completed"
- Not offering fix option when issues found

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
