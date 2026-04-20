# Extensiones TEA — test-cases.csv como fuente de verdad

Este directorio contiene extensiones (`workflow_ext.md`) para tres comandos del agente TEA.
Las extensiones conectan el flujo estándar de BMAD con el archivo `test-cases.csv` generado
por el proceso de calidad QA (`/quality-process`).

---

## ¿Por qué estas extensiones?

El workflow estándar de TEA diseña, implementa y revisa tests de forma independiente al
`test-cases.csv`. Sin las extensiones, cada comando parte desde cero escaneando el código
fuente sin saber qué ya fue diseñado, qué está pendiente de implementar o qué está
desincronizado.

Las extensiones establecen el CSV como la fuente de verdad compartida entre los tres comandos:

```
/quality-process  →  test-cases.csv
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    test-design       test-automate    test-review
    (baseline)         (targets)       (integrity)
```

---

## CSV de referencia

**Ubicación:** `_bmad-output/implementation-artifacts/quality-process/diseno/test-design-{timestamp}/test-cases.csv`

Los comandos siempre toman el CSV **más reciente** disponible (ordenado por timestamp descendente).

**Columnas relevantes:**

| Columna | Uso en las extensiones |
|---|---|
| `ID Épica` | Agrupa casos por épica (`EPIC-SA-F1`) |
| `ID Caso de Prueba` | Identificador único (`TC-F1-01`) — clave de trazabilidad |
| `Título` | Nombre del escenario — se compara contra specs para detectar duplicados |
| `Estado` | `Not Started` / `Pass` / `Fail` — controla qué hace cada comando |
| `Notas` | `Level: FE \| Technique: EP \| Risk: 3x3=9 \| Priority: P2` |

---

## Extensión 1 — `test-design`

**Archivo:** `test-design/workflow_ext.md`
**Comando:** `/testarch-test-design` o `test-design` desde el agente TEA
**Aplica solo en:** Epic-Level Mode (Phase 4) — se ignora en System-Level Mode (Phase 3)

### Qué cambia

El workflow estándar diseña todos los casos de prueba de una épica partiendo de PRD,
epics y stories. Con la extensión, el CSV actúa como **baseline**: el workflow sabe qué
ya fue diseñado y enfoca su trabajo solo en los gaps.

### Flujo extendido

1. Carga el CSV más reciente y pregunta sobre qué épica trabajar
2. Muestra el baseline de esa épica: total de casos, distribución por estado y prioridad
3. En Step 3, solo diseña casos para criterios de aceptación **no cubiertos** en el CSV
4. Genera los nuevos casos en formato CSV compatible (continuando la numeración del CSV original)

### Outputs

- `test-design-epic-{N}.md` — documento estándar de diseño (sin cambios)
- `test-cases-new-{EPIC-ID}.csv` — solo los casos nuevos diseñados, listos para mergear al CSV original

### Reglas clave

- Nunca rediseña casos que ya existen en el CSV
- Nunca modifica el CSV original
- Los IDs de casos nuevos continúan la secuencia (`last_id_seq + 1`)
- Si todos los criterios ya tienen cobertura, reporta que no hay gaps y termina

---

## Extensión 2 — `test-automate`

**Archivo:** `automate/workflow_ext.md`
**Comando:** `/testarch-automate` o `test-automate` desde el agente TEA

### Qué cambia

El workflow estándar descubre qué testear escaneando el código fuente. Con la extensión,
el CSV reemplaza ese descubrimiento: los **targets de automatización son exclusivamente
los casos con `Estado = "Not Started"`**.

### Flujo extendido

1. Carga el CSV más reciente
2. Filtra los casos con `Estado = "Not Started"`
3. Clasifica por `Level` (FE/API/BE/Unit) y `Priority` (P0→P3) desde el campo `Notas`
4. Reporta el resumen antes de generar: total pendientes, distribución por prioridad y nivel
5. Genera los spec files en el orden P0 → P1 → P2 → P3

### Mapeo Level → archivo generado

| Level en CSV | Tipo de test | Carpeta destino |
|---|---|---|
| `FE` | E2E Playwright | `frontend/tests/e2e/` |
| `API` | Integración REST | `tests/api/` |
| `BE` | Lógica backend | `tests/unit/` |
| `Unit` | Unitario puro | `tests/unit/` |

### Convención de nombres de tests

Cada test generado incluye el ID del caso en su nombre para mantener trazabilidad:

```typescript
test('TC-F1-03 — Navegación a /clientes sin page reload', async ({ page }) => {
  // ...
})
```

### Reglas clave

- El CSV es la única fuente de targets — no escanea código fuente
- Solo genera tests para casos con `Estado = "Not Started"`
- Nunca modifica el CSV
- Si no hay casos `Not Started`, reporta que todo está implementado y termina

---

## Extensión 3 — `test-review`

**Archivo:** `test-review/workflow_ext.md`
**Comando:** `/testarch-test-review` o `test-review` desde el agente TEA

### Qué cambia

El workflow estándar revisa la calidad interna de los spec files (BDD format, hard waits,
determinismo, aislamiento, etc.). La extensión **agrega** 4 checks de integridad entre
el CSV y los specs — sin reemplazar ningún check existente.

### Los 4 checks de integridad

#### Check A — Trazabilidad
Detecta tests en los spec files que no tienen un `TC-XX-YY` en su nombre.
Tests sin ID no son trazables al CSV ni al diseño formal.

| Resultado | Condición |
|---|---|
| ✅ PASS | Todos los tests tienen ID |
| ⚠️ WARN | Algunos tests sin ID |
| ❌ FAIL | Ningún test tiene ID |

#### Check B — Casos sin implementación *(el más crítico)*
Detecta casos con `Estado = "Not Started"` en el CSV que no tienen spec correspondiente.
Indica qué casos diseñados aún no tienen test real escrito.

| Resultado | Condición |
|---|---|
| ✅ PASS | Todos los `Not Started` ya tienen spec |
| ⚠️ WARN | Algunos `Not Started` sin spec |
| ❌ FAIL | Mayoría de `Not Started` sin spec |

#### Check C — CSV desincronizado
Detecta casos marcados como `Pass` o `Fail` en el CSV cuyo spec ya no existe en el proyecto.
Indica specs eliminados o renombrados sin actualizar el CSV.

| Resultado | Condición |
|---|---|
| ✅ PASS | Todos los ejecutados tienen su spec presente |
| ❌ FAIL | Algún caso `Pass`/`Fail` sin spec — CSV desincronizado |

#### Check D — Specs huérfanos
Detecta tests con un `TC-XX-YY` en su nombre que no existe en el CSV.
Indica tests escritos ad-hoc sin pasar por el proceso de diseño formal.

| Resultado | Condición |
|---|---|
| ✅ PASS | Todos los IDs en specs existen en CSV |
| ⚠️ WARN | Algunos IDs en specs no están en CSV |

### Impacto en el score de calidad

Los checks contribuyen al score general del workflow (sobre 100 puntos):

| Check | Impacto |
|---|---|
| A — Test sin ID | -3 por test |
| B — Not Started sin spec | -5 por caso P0/P1 · -2 por P2/P3 |
| C — CSV desincronizado | -10 por caso |
| D — Specs huérfanos | -2 por spec |

### Reglas clave

- Solo lectura — nunca modifica CSV ni spec files
- Si el CSV no existe, los 4 checks se omiten silenciosamente
- Los checks estándar del workflow corren completos independientemente

---

## Archivos modificados por las extensiones

| Archivo | Cambio |
|---|---|
| `.claude/commands/bmad/bmm/workflows/testarch-test-design.md` | Step 1 carga `workflow_ext.md` antes del workflow |
| `.claude/commands/bmad/bmm/workflows/testarch-automate.md` | Step 1 carga `workflow_ext.md` antes del workflow |
| `.claude/commands/bmad/bmm/workflows/testarch-test-review.md` | Step 1 carga `workflow_ext.md` antes del workflow |
| `_bmad/_config/agents/bmm-tea.customize.yaml` | Menu items custom para los 3 comandos (necesario para ejecutarlos desde el agente TEA) |

---

## Cómo ejecutar

### Como slash command (desde cualquier contexto)
```
/testarch-test-design
/testarch-automate
/testarch-test-review
```

### Desde el agente TEA
```
test-design
test-automate
test-review
```

> El agente TEA debe reiniciarse (`DA` + volver a entrar) después de cambios en `bmm-tea.customize.yaml`.
