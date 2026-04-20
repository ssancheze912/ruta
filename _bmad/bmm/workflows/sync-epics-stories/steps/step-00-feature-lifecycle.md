---
name: 'step-00-feature-lifecycle'
description: 'Audit and resolve FEATURE_CODE_JIRA markers before epic synchronization'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/sync-epics-stories'

# File References
thisStepFile: '{workflow_path}/steps/step-00-feature-lifecycle.md'
nextStepFile: '{workflow_path}/steps/step-03-scope.md'
outputFile: '{project-root}/_bmad-output/jira_docs/project_config.yaml'

# Shard Paths
prdShardsPath: '{project-root}/prd'
epicsShardsPath: '{project-root}/epics'

---

# Step 0: Feature Lifecycle Audit

## STEP GOAL:

Audit all local feature shards against Jira before any epic synchronization. Resolves PENDING features, conflicts, orphaned KEYs, and deleted shards. Ensures every feature has a valid `FEATURE_CODE_JIRA=` before proceeding.

## MANDATORY EXECUTION RULES:

- 🛑 NEVER skip this step — always execute before step-03
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔒 STRICT MCP ONLY: Use only MCP tools for Jira API calls
- ⏸️ ALWAYS halt and wait for user input when conflicts or deletions are detected
- 🚫 NEVER proceed to step-03 if there are unresolved conflicts (Caso 2)

---

## EXECUTION SEQUENCE:

### 0.1 — Inventario local de features

1. Usar Glob para buscar todos los archivos `{prdShardsPath}/f*.md` y `{epicsShardsPath}/f*.md`.
2. Por cada número `{N}` encontrado, construir un registro:
   - `shard_id`: `f{N}`
   - `prd_file`: ruta al shard PRD si existe
   - `epics_file`: ruta al shard épicas si existe
   - `prd_code`: valor de `FEATURE_CODE_JIRA=` en el shard PRD (o `null` si no existe el archivo)
   - `epics_code`: valor de `FEATURE_CODE_JIRA=` en el shard épicas (o `null` si no existe el archivo)
   - `feature_name`: título del feature extraído del shard (primera línea `# ` o `## `)
3. Leer `{outputFile}` y extraer el campo `synced_features` si existe (lista de KEYs previamente sincronizados).
4. Si **no hay ningún shard** en `prd/` ni `epics/` → saltar directamente a sección 0.5, no hay nada que auditar.

---

### 0.2 — Detectar y resolver conflictos (Caso 2)

Para cada `f{N}` donde `prd_code` y `epics_code` son distintos y **ambos tienen valor** (uno es `PENDING:*` y el otro es un KEY real, o viceversa):

1. **DETENER el procesamiento** de ese feature.
2. Notificar al ingeniero:
   > ⚠️ **Conflicto en `f{N}` — '{feature_name}'**
   > - `{prd_file}` tiene: `FEATURE_CODE_JIRA={prd_code}`
   > - `{epics_file}` tiene: `FEATURE_CODE_JIRA={epics_code}`
   > ¿Cuál valor es el correcto?
   > **[1]** Usar `{KEY_real}` — el feature ya existe en Jira. Se actualiza el shard con PENDING.
   > **[2]** Usar `PENDING:{slug}` — el KEY es incorrecto. Ambos shards quedarán con PENDING y el feature se creará en Jira.

3. Aplicar la elección antes de continuar:
   - Si **[1]**: reemplazar `FEATURE_CODE_JIRA=PENDING:*` por `FEATURE_CODE_JIRA={KEY_real}` en el shard afectado.
   - Si **[2]**: reemplazar `FEATURE_CODE_JIRA={KEY_real}` por `FEATURE_CODE_JIRA=PENDING:{slug}` en el shard afectado.
4. Actualizar el registro en memoria con el valor resuelto antes de continuar con los demás.

---

### 0.3 — Crear features PENDING en Jira (Caso 1)

Para cada `f{N}` donde el código resuelto empieza por `PENDING:`:

1. Informar al ingeniero:
   > 🔄 Se crearán en Jira los siguientes features: [listar slugs]

2. Por cada feature PENDING:
   - Determinar el padre en Jira: usar el issue de Nivel 2 si `{outputFile}` contiene `hierarchy_level_2_name`; de lo contrario usar el proyecto raíz (`project_key`).
   - Derivar el nombre del feature: convertir `{slug}` de kebab-case a Title Case (ej: `gestion-de-clientes` → `Gestión de Clientes`).
   - **Crear el issue en Jira** usando MCP Tool `createJiraIssue` con:
     - `summary`: nombre derivado del slug
     - `issuetype`: tipo del Nivel 2 de la jerarquía (o `Epic` si es jerarquía estándar)
     - `parent`: KEY del issue padre si aplica
   - Obtener el `ISSUE_KEY` real devuelto por Jira.
   - **Actualizar ambos shards** (`prd/f{N}-*.md` y `epics/f{N}-*.md`) reemplazando `FEATURE_CODE_JIRA=PENDING:{slug}` por `FEATURE_CODE_JIRA={ISSUE_KEY}`.
   - Confirmar: `✓ Feature '{slug}' creado en Jira como {ISSUE_KEY} — shards actualizados.`

3. Si la creación falla:
   - Advertir: `⚠️ No se pudo crear '{slug}' en Jira. Las épicas de este feature serán omitidas en esta sincronización.`
   - Marcar el feature como bloqueado. Continuar con los demás.

---

### 0.4 — Verificar y actualizar features con KEY real (Caso 3)

Para cada `f{N}` con código resuelto que **no empieza por `PENDING:`** (KEY real):

1. Verificar existencia del issue en Jira usando MCP Tool `getJiraIssue` con el `ISSUE_KEY`.

2. **Si el issue NO existe**:
   - Advertir al ingeniero:
     > ⚠️ El feature `{ISSUE_KEY}` ('{feature_name}') no existe en Jira. Puede haber sido borrado o el KEY es incorrecto. Las épicas de `f{N}` serán omitidas hasta que corrijas el marcador `FEATURE_CODE_JIRA=` en el shard.
   - Marcar el feature como bloqueado. Continuar con los demás.

3. **Si el issue SÍ existe**:
   - Comparar el `summary` del issue en Jira con el `feature_name` del shard.
   - Si son diferentes → actualizar el issue en Jira usando MCP Tool `updateJiraIssue` con el nuevo nombre.
   - Confirmar: `✓ Feature {ISSUE_KEY} actualizado en Jira: '{nombre_anterior}' → '{nuevo_nombre}'.`
   - Si son iguales → continuar silenciosamente.

---

### 0.5 — Detectar shards eliminados (Caso 4)

1. Comparar la lista `synced_features` del `{outputFile}` contra el inventario actual del paso 0.1.
2. Para cada KEY en `synced_features` que **no tiene shard local** correspondiente:
   - Preguntar al ingeniero:
     > ⚠️ El feature `{ISSUE_KEY}` ('{feature_name}') ya no tiene shard local. ¿Qué deseas hacer con él en Jira?
     > **[1] Archivar** — transicionar a estado archivado/cancelado.
     > **[2] Cerrar** — transicionar al estado "Done" o "Closed".
     > **[3] Ignorar** — no tocar Jira, solo eliminar del registro local.
   - Ejecutar la acción elegida usando MCP Tool `transitionJiraIssue` (opciones 1 y 2).
   - Eliminar la entrada del registro `synced_features` en `{outputFile}`.

3. Si `synced_features` no existe en `{outputFile}` → omitir esta sección silenciosamente.

---

### 0.6 — Actualizar registro synced_features

1. Construir la lista actualizada con todos los features que tienen KEY real y shard local activo.
2. Agregar o actualizar el campo `synced_features` en `{outputFile}`:

```yaml
synced_features:
  - key: "{ISSUE_KEY}"
    name: "{feature_name}"
    shard: "f{N}"
```

3. Conservar todos los demás campos existentes en `{outputFile}` sin modificarlos.

---

### 0.7 — Resumen y continuación

Mostrar al ingeniero un resumen del audit:

> **Feature Lifecycle Audit completado:**
> - ✅ Features con KEY válido: {N}
> - 🆕 Features creados en Jira: {N}
> - ⚠️ Features bloqueados (omitidos): {N}
> - 🗑️ Features eliminados resueltos: {N}

Display: **"[C] Continuar a selección de alcance"**

#### Menu Handling Logic:

- IF C: load, read entire file, then execute `{nextStepFile}`.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Todos los conflictos resueltos con input del ingeniero
- Todos los PENDING creados en Jira o marcados como bloqueados
- Todos los KEYs reales verificados contra Jira
- `synced_features` actualizado en `{outputFile}`

### ❌ SYSTEM FAILURE:

- Proceder a step-03 con conflictos sin resolver
- Omitir la verificación de KEYs reales
- Modificar `{outputFile}` sin preservar campos existentes

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
