# REGLA OBLIGATORIA: PRD WORKFLOW — CONTEXTO PARA MEGA-PROYECTOS (SHARDING-AWARE)

**TRIGGER:** Cada vez que el usuario solicite crear un PRD, como `/create-prd`.

**CONTEXTO A INYECTAR (aplicar durante todo el workflow):**

Las siguientes reglas deben mantenerse en memoria y aplicarse en el momento oportuno sin alterar el flujo estándar del workflow:

## 1. Durante el Step 2 (Descubrimiento): Solicitar Features

Cuando el workflow llegue a la fase de descubrimiento, presentar al usuario este menú exacto:

> *"Para estructurar correctamente el PRD, necesito conocer los features que contemplas para este proyecto. ¿Cómo prefieres proporcionarlos?*
>
> **1. Extraer desde Jira automáticamente** — Me conecto a Jira, seleccionamos el proyecto y extraigo los features directamente.
> **2. Proporcionarlos manualmente** — Puedes pegarlos aquí, compartir un archivo `.txt` o `.md`, o describirlos en texto libre."

<!-- INSTRUCCIONES DE WORKFLOW — NO mostrar al usuario -->
- Si el usuario elige **opción 1 (Jira):** Invocar el skill `get-features` (UBICADO EN .claude\commands\get-features\SKILL.md) usando el Skill tool con `skill: "get-features"`. El skill se encargará de autenticarse con Jira, seleccionar instancia y proyecto, y generar el árbol de features en `_bmad-output/planning-artifacts/jira-trees/`. Una vez generado, leer ese archivo y extraer la lista de features del resultado para usarla como estructura del PRD. Por cada feature extraído de Jira, **incluir obligatoriamente** el marcador `FEATURE_CODE_JIRA={ISSUE_KEY}` en su sección del PRD (donde `{ISSUE_KEY}` es el ID del issue en Jira, ej: `PROY-123`). Este marcador es crítico para la sincronización posterior con Jira:
  - Los shards del PRD (`prd/f{N}-*.md`) y los shards de épicas (`epics/f{N}-*.md`) deben contener este marcador.
  - Al sincronizar, el workflow resuelve el ID con este orden de prioridad: (1) busca `FEATURE_CODE_JIRA=` en el shard de la épica; (2) si no lo encuentra, lo busca en el shard del PRD correspondiente.
  - ⚠️ Si ninguno de los dos shards contiene el marcador, la sincronización fallará para ese feature. Es responsabilidad del ingeniero asegurar que el marcador exista en al menos uno de los dos shards antes de ejecutar la sincronización.
- Si el usuario elige **opción 2 (Manual):** Aceptar la lista de features que el usuario proporcione en cualquier formato (texto libre, `.txt`, `.md` o copia-pegado) y procesarla directamente. Por cada feature creado manualmente, incluir el marcador `FEATURE_CODE_JIRA=PENDING:{feature-slug}` (donde `{feature-slug}` es el nombre del feature en kebab-case, ej: `FEATURE_CODE_JIRA=PENDING:gestion-de-clientes`). Este valor temporal indica que el feature aún no existe en Jira y será creado automáticamente cuando el ingeniero ejecute `jira_sync`.

Inyectar los features confirmados como estructura del PRD: cada feature debe quedar como una sección `### feature — {Name}` dentro del documento.

<!-- INSTRUCCIONES DE WORKFLOW — NO mostrar al usuario -->
**Si el PRD ya fue shardeado (existe la carpeta `prd/` con archivos `f{N}-*.md`):**
- **NO modificar** el PRD maestro original.
- Por cada nuevo feature que el ingeniero quiera agregar, ejecutar el siguiente flujo de resolución **antes de crear el shard**:

  1. Invocar el skill `get-features` (usando el Skill tool con `skill: "get-features"`) para traer el árbol actualizado de features desde Jira.
  2. Leer el árbol generado en `_bmad-output/planning-artifacts/jira-trees/` y filtrar los features que **no tienen shard local** (cuyo `ISSUE_KEY` no aparece en ningún `prd/f{N}-*.md` existente).
  3. Mostrar al ingeniero la lista filtrada y preguntar:
     > *"Se encontraron los siguientes features en Jira sin shard local. ¿Alguno corresponde al feature que acabas de describir?"*
     - Listar cada feature con su KEY y nombre (ej: `PROY-89 — Gestión de Clientes`).
     - Incluir siempre la opción: **"Ninguno — es un feature completamente nuevo, no existe en Jira"**.
  4. **Si el ingeniero selecciona un feature de Jira** → crear el shard `f{N}-{feature-name}.md` con `FEATURE_CODE_JIRA={ISSUE_KEY}` del feature seleccionado.
  5. **Si el ingeniero elige "Ninguno"** → crear el shard `f{N}-{feature-name}.md` con `FEATURE_CODE_JIRA=PENDING:{feature-slug}`.

- Informar al ingeniero qué archivo shard fue creado y que puede enriquecerlo con detalle adicional de forma independiente.

## 2. Naturaleza del PRD Generado

El PRD que produce este workflow es un **documento maestro general**. Contiene la definición base de cada feature a nivel de alcance, objetivos y requisitos generales — NO el detalle profundo de implementación de cada uno.

## 3. Post-Workflow: Indicar Siguiente Paso

Al finalizar el workflow, informar al ingeniero:
> *"El PRD maestro ha sido generado. Para continuar, ejecuta `/shard-doc` sobre este archivo para dividirlo en shards por feature (`prd/feature-{name}.md`). Luego, cada feature shard puede alimentarse con mayor detalle de forma independiente."*
