---
name: skill-jira-ext
description:
  Personaliza la sincronización base de Siesa-Agents
allowed-tools: Read, Grep, Glob, Bash, Write

storiesFolder: '_bmad-output/implementation-artifacts/'
outputFile: '_bmad-output/jira_docs/project_config.yaml'
---

# Personalización de Sincronización Jira: Jerarquía Personalizada y Sincronización Granular

Este skill extiende la funcionalidad base de sincronización con Jira permitiendo jerarquías personalizadas y alcances de sincronización específicos.

## Paso 1: Configuración de Jerarquía (Opcional)

> ℹ️ **Nota:** La gestión del ciclo de vida de features (creación de PENDING, resolución de conflictos, verificación de KEYs, detección de shards eliminados) está implementada en el step formal `_bmad/bmm/workflows/sync-epics-stories/steps/step-00-feature-lifecycle.md`, el cual se ejecuta automáticamente entre step-02 y step-03 del workflow base.

**Acción Inicial:**
Antes de proceder con cualquier configuración, PREGUNTA al usuario:
"¿Deseas habilitar la configuración de Jerarquía Personalizada (Ej: Subproyecto -> Feature -> Epic)? (La jerarquía por defecto es Proyecto -> Epic -> Story)"
Opciones:
- Sí
- No

### Opción A: Usuario responde "Sí" (Configuración de Jerarquía Personalizada)

Si el usuario selecciona "Sí", procede con las siguientes instrucciones para configurar la jerarquía extendida:

**Instrucción de Jerarquía Personalizada:**

1. **Solicitar Datos:** El usuario DEBE proporcionar el **nombre de los Issue Type** para el Nivel 1 (Raíz) y Nivel 2 (Agrupador), así como los nombres de los issues padres e hijos.

2. **Verificar/Almacenar Configuración:** Verifica si estos datos existen en el archivo `{outputFile}`. Si no existen, **pregunta al usuario y guárdalos en `{outputFile}` en formato YAML**. **IMPORTANTE: NO crees archivos separados como hierarchy_config.yaml. Todo debe ir en `{outputFile}`.**

   Formato esperado en `{outputFile}`:
   ```yaml
   hierarchy_level_1_type: "NombreTipoNivel1"
   hierarchy_level_1_name: "NombreIssueNivel1"
   hierarchy_level_2_type: "NombreTipoNivel2"
   hierarchy_level_2_name: "NombreIssueNivel2"
   ```

**Contexto:** Mi Jira tiene una jerarquía personalizada. Las Épicas NO deben crearse en la raíz del proyecto, sino bajo un issue agrupador específico (Nivel 2), que a su vez cuelga de una Raíz (Nivel 1).

**Estructura requerida(Ejemplo):**
A continuacion se presenta un ejemplo de la estructura jerárquica personalizada. En este ejemplo, el issue de Nivel 1 es un `Subproyecto`, el issue de Nivel 2 es un `Feature`, y las Épicas son hijas del `Feature`.

| Nivel | Issue Type | Nombre | Relación |
|-------|------------|--------|----------|
| 1 (Raíz) | `Subproyecto` | `(revisar) MIGRACION BACK DE SINCRONIZACION A .NET - Q1` | Padre de todo |
| 2 (Agrupador) | `Feature` | `Migración del backend a .NET - V 1.0 - Q1` | Hijo del Nivel 1 |
| 3 (Sincronización) | `Epic` | *Del workflow* | Hijas del Nivel 2 |

**Acciones requeridas:**

1. **Verificar Issue Nivel 1:** Verificar existencia en Jira. Si no existe, informar al usuario.
2. **Verificar Issue Nivel 2:** Verificar existencia en Jira y que sea hijo del Nivel 1.
3. **Sincronizar:** Las Épicas se crearán como hijas del issue de Nivel 2.

**Visualización(Ejmplo):**
```
(revisar) MIGRACION BACK DE SINCRONIZACION A .NET - Q1 (Subproyecto)
└── Migración del backend a .NET - V 1.0 - Q1 (Feature)
      ├── Epic 1
      ├── Epic 2
      └── Epic N...
```

Una vez ejecutado, invoca el workflow (/bmad:bmm:workflows:sync-epics-stories) en consola y continúa con el proceso de sincronización con ese contexto.

### Opción B: Usuario responde "No" (Jerarquía Estándar)

Si el usuario selecciona "No":
- Omitir toda la configuración de "Jerarquía Personalizada".
- Usar la jerarquía estándar de Jira (Proyecto -> Epic -> Story).
- Continuar inmediatamente al **Paso 2**.

---

## Paso 2: Extensión del Menú de Alcance (step-03-scope)

**Independientemente de la elección en el Paso 1, ESTA SECCIÓN SE DEBE EJECUTAR SIEMPRE.**

Una vez completada la configuración de jerarquía (o si fue omitida), cuando el workflow (/bmad:bmm:workflows:sync-epics-stories) llegue al paso de selección de alcance, extiende su menú.

**Contexto:** El workflow base presenta un menú con 3 opciones que operan sobre el lote completo. Esta skill extiende ese menú agregando opciones de sincronización granular (individual).

**Menú extendido:** Cuando el workflow llegue al paso 3 (Scope Selection), el menú que se presenta al usuario DEBE incluir las opciones originales MÁS las siguientes opciones adicionales:

**Select Synchronization Scope:**

1. **Epics Only** (Syncs todas las épicas -> Jira Epics)
2. **Stories & Tasks** (Syncs todas las stories -> Jira Stories & Sub-tasks)
3. **Both** (Syncs Epics primero, luego Stories & Tasks)
4. **Una o varias Épicas específicas** (Sync de una o varias épicas por nombre)
5. **Una Historia o varias Historias específicas** (Sync de una o varias historias por nombre)


### Lógica para las nuevas opciones:

**Opción 4 - Épica específica:**
1. Preguntar al usuario: "¿Cuál o cuáles épicas deseas sincronizar? Indica los nombres separados por comas."
2. El usuario debe proporcionar un listado de nombres de épicas.
    Ejemplo de input: "Épica 1, Épica 3, Épica N"
3. Validar que las épicas indicadas existen en el archivo `epics.md` del proyecto. Si alguna no existe, informar al usuario cuáles no se encontraron y volver a preguntar(Debe proporcionar la que no se encontro).
4. Ejecutar la sincronización SOLO de las épicas indicadas (y sus historias/tareas hijas si las tienen).
5. **Guardar Configuración:** Agregar al archivo `{outputFile}` la siguiente configuración en formato YAML (sin borrar el contenido existente):
   ```yaml
   target_scope: epics_specific
   target_names:
     - "Nombre Epica 1"
     - "Nombre Epica 2"
   ```

**Opción 5 - Historia específica:**
1. Preguntar al usuario: "¿Cuál o cuáles historias deseas sincronizar? Indica los nombres separados por comas."
2. El usuario debe proporcionar un listado de nombres de historias.
    Ejemplo de input: "Historia A, Historia C, Historia M"
3. Validar que las historias indicadas existen en `{storiesFolder}` del proyecto. Si alguna no existe, informar al usuario cuáles no se encontraron y volver a preguntar.
4. Ejecutar la sincronización SOLO de las historias indicadas (y sus tareas/subtareas hijas si las tiene).
5. **Guardar Configuración:** Agregar al archivo `{outputFile}` la siguiente configuración en formato YAML (sin borrar el contenido existente):
   ```yaml
   target_scope: stories_specific
   target_names:
     - "Nombre Historia A"
     - "Nombre Historia B"
   ```

### Reglas de las nuevas opciones:
- Las opciones 4 y 5 siguen las mismas reglas de jerarquía (personalizada o estándar) definidas en el Paso 1.
- Si el usuario selecciona la opción 4 o 5, NO se debe sincronizar ningún otro issue fuera del seleccionado.
- Si la épica o historia indicada no se encuentra en los archivos fuente, informar al usuario y volver a mostrar el menú.
