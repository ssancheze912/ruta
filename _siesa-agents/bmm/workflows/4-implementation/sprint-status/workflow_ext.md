# REGLA OBLIGATORIA: SPRINT-STATUS CON SINCRONIZACIÓN DE FEATURE-STATUS

**TRIGGER:** Cada vez que se ejecute `/sprint-status`.

---

## 1. DETECCIÓN DE ÉPICAS RECIÉN COMPLETADAS

Después de ejecutar el **Step 2** del `instructions.md` (parse de `sprint-status.yaml`), detectar si alguna épica acaba de quedar completa pero su feature no refleja ese estado en `feature-status.yaml`.

**LÓGICA:**

```
FUNCTION detect_completed_epics():
  completed_epics = []

  FOR each epic_key IN development_status:
    IF epic_key MATCHES "epic-{N}" (not source, not retrospective):
      IF development_status[epic_key] == "done":
        // Verificar que todas sus stories también estén done
        stories = [key for key in development_status if key STARTS WITH "{N}-"]
        IF ALL stories have status "done":
          completed_epics.APPEND(N)

  RETURN completed_epics
```

---

## 2. SINCRONIZACIÓN AUTOMÁTICA DE FEATURE-STATUS

**TRIGGER:** Ejecutar **siempre al final del Step 2**, antes de continuar al Step 3.

### 2.1 Cargar feature-status.yaml

- Leer `{implementation_artifacts}/feature-status.yaml`
- Si no existe, no ejecutar esta sección (el archivo lo genera sprint-planning)

### 2.2 Ejecutar sync_feature_status() para cada feature

Aplicar la misma lógica definida en `_siesa-agents/bmm/workflows/4-implementation/sprint-planning/workflow_ext.md §3.4`:

```
FUNCTION sync_feature_status(feature):
  IF feature.status == "done":
    RETURN  // ya completado, no tocar

  // 1. Encontrar todas las épicas que pertenecen a este feature
  epics_of_feature = []
  FOR each key IN sprint_status.development_status:
    IF key MATCHES "epic-{N}-source" AND value == feature.epic_source:
      epics_of_feature.APPEND(N)

  IF epics_of_feature IS EMPTY:
    RETURN

  // 2. Recopilar todas las stories y sus statuses
  all_statuses = []
  FOR each N IN epics_of_feature:
    FOR each key IN sprint_status.development_status:
      IF key STARTS WITH "{N}-" AND NOT ends with "-source":
        all_statuses.APPEND(sprint_status.development_status[key])

  IF all_statuses IS EMPTY:
    RETURN

  // 3. Derivar nuevo status
  IN_PROGRESS_STATUSES = ["in-progress", "review", "ready-for-dev"]

  IF ALL statuses IN all_statuses == "done":
    new_status = "done"
  ELSE IF ANY status IN all_statuses IN IN_PROGRESS_STATUSES:
    new_status = "in-progress"
  ELSE:
    new_status = "backlog"

  // 4. Solo avanzar, nunca retroceder
  STATUS_ORDER = ["backlog", "in-progress", "done"]
  IF STATUS_ORDER.index(new_status) > STATUS_ORDER.index(feature.status):
    feature.status = new_status
    feature.last_update = {date}
```

**Reglas:**
- El status solo avanza (`backlog` → `in-progress` → `done`), **nunca retrocede**
- `ready-for-dev` y `review` cuentan como `in-progress` a nivel feature
- Si un feature ya está en `done`, no se toca

### 2.3 Guardar y reportar

- Si algún feature cambió de status, escribir el `feature-status.yaml` actualizado
- Reportar en el output del Step 4 cuántos features cambiaron (si alguno)

**FORMATO del reporte (agregar al bloque del Step 4 si hay cambios):**

```
**Feature Status sincronizado:**
  • feature-{N}: {status_anterior} → {status_nuevo}
```

Si no hubo cambios, no mostrar nada (silencioso).

---

## 3. REGLA CRÍTICA

**NUNCA** modificar el `status` ni `last_update` de features que ya están en `done`.

**NUNCA** retroceder un status (e.g., de `in-progress` a `backlog`).

**SIEMPRE** ejecutar esta sincronización, incluso si el usuario eligió la opción 4 (Exit) en el Step 5 — la sincronización ocurre antes de mostrar las opciones.
