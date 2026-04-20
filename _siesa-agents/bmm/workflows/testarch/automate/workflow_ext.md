# REGLA OBLIGATORIA: TEST-AUTOMATE CON TEST-CASES.CSV COMO FUENTE

**TRIGGER:** Cada vez que se ejecute `/testarch-automate` o `test-automate`.

---

## 1. DESCUBRIR Y CARGAR EL CSV MÁS RECIENTE

Antes de ejecutar el Step 1 estándar del workflow `instructions.md`, localizar el archivo `test-cases.csv` más reciente en la carpeta de diseño de pruebas:

```
FUNCTION find_latest_test_cases_csv():
  search_root = "{output_folder}/implementation-artifacts/quality-process/diseno/"

  // Listar todas las carpetas con patrón test-design-YYYY-MM-DD-HHMMSS/
  folders = glob("{search_root}test-design-*/test-cases.csv")

  IF folders IS EMPTY:
    // No hay CSV disponible — continuar con flujo estándar sin cambios
    RETURN null

  // Ordenar por nombre de carpeta descendente (el nombre incluye timestamp)
  csv_path = sort(folders, descending=true)[0]

  LOAD csv_path into memory as test_cases_data
  RETURN csv_path
```

**Regla:** Si no se encuentra ningún CSV, ignorar esta extensión y ejecutar el workflow estándar sin alteraciones.

---

## 2. PARSEAR Y FILTRAR LOS CASOS PENDIENTES

Una vez cargado el CSV, extraer los casos de prueba que no han sido implementados:

**Columnas del CSV:**
| Campo | Descripción |
|---|---|
| `ID Épica` | Épica a la que pertenece el caso (ej: `EPIC-SA-F1`) |
| `ID Caso de Prueba` | Identificador único (ej: `TC-F1-01`) |
| `Título` | Nombre corto del caso |
| `Descripción Completa` | Escenario completo con contexto |
| `Precondiciones` | Estado inicial requerido |
| `Pasos de Ejecución` | Pasos numerados a reproducir |
| `Resultados Esperados` | Assertions esperados |
| `Tipo prueba` | `Funcional`, `Negativo`, etc. |
| `Estado` | `Not Started`, `Pass`, `Fail` |
| `Notas` | Metadata: `Level: FE/BE/API/Unit \| Technique: ... \| Risk: NxN=N \| Priority: PN` |

```
FUNCTION filter_pending_cases(csv_data):
  pending = []

  FOR each row IN csv_data:
    IF row["Estado"] == "Not Started":
      pending.APPEND(row)

  RETURN pending
```

---

## 3. CLASIFICAR POR NIVEL Y PRIORIDAD

Para cada caso pendiente, extraer el `Level` y `Priority` del campo `Notas`:

```
FUNCTION classify_case(row):
  notes = row["Notas"]  // "Level: FE | Technique: EP | Risk: 3x3=9 | Priority: P2"

  level    = extract_value(notes, "Level")     // FE, BE, API, Unit
  priority = extract_value(notes, "Priority")  // P0, P1, P2, P3

  RETURN { level, priority }
```

**Mapeo de Level a tipo de test en Playwright:**

| Level | Tipo de archivo a generar |
|---|---|
| `FE` | Test E2E en `frontend/tests/e2e/` |
| `API` | Test de integración contra API REST |
| `BE` | Test de lógica backend / unit |
| `Unit` | Test unitario puro |

**Orden de prioridad de implementación:** P0 → P1 → P2 → P3

---

## 4. INYECCIÓN EN EL STEP 2 DEL WORKFLOW ESTÁNDAR

**OVERRIDE de "Determine What Needs Testing" (Step 2.1 del instructions.md):**

En lugar de descubrir features desde el código fuente, usar **exclusivamente** los casos pendientes del CSV como lista de automatización targets:

```
automation_targets = []

FOR each case IN pending_cases (ordenados por priority ASC):
  target = {
    id:           case["ID Caso de Prueba"],
    epic:         case["ID Épica"],
    title:        case["Título"],
    description:  case["Descripción Completa"],
    preconditions: case["Precondiciones"],
    steps:        case["Pasos de Ejecución"],
    expected:     case["Resultados Esperados"],
    type:         case["Tipo prueba"],
    level:        classify_case(case).level,
    priority:     classify_case(case).priority,
  }
  automation_targets.APPEND(target)
```

Reportar al usuario antes de continuar:

```
"📋 Fuente: {csv_path}
Total casos en CSV: {total}
✅ Ya implementados (Pass/Fail): {done}
🔴 Pendientes (Not Started): {pending_count}

Distribución por prioridad:
  P0: N | P1: N | P2: N | P3: N

Distribución por nivel:
  FE (E2E): N | API: N | BE: N | Unit: N

Procediendo a generar tests para los {pending_count} casos pendientes..."
```

---

## 5. CONVENCIÓN DE NOMBRES DE ARCHIVOS

Al generar los spec files, mapear cada caso de prueba a su archivo correspondiente basándose en el `ID Épica`:

```
FUNCTION resolve_spec_file(epic_id, level):
  // Extraer el sufijo del feature del ID de épica
  // "EPIC-SA-F1" → "F1", "EPIC-SA-F2" → "F2"
  feature_suffix = epic_id.split("-").last().lower()  // "f1", "f2"

  // Mapear a archivos existentes en frontend/tests/e2e/
  existing_specs = glob("frontend/tests/e2e/*.spec.ts")

  // Intentar match por sufijo
  FOR each spec IN existing_specs:
    IF feature_suffix IN spec.filename.lower():
      RETURN spec  // agregar al archivo existente

  // Si no existe, sugerir nombre basado en el ID
  RETURN "frontend/tests/e2e/{feature_suffix}.spec.ts"  // crear nuevo
```

**Regla:** Siempre agregar casos nuevos al archivo spec existente si ya existe uno para esa épica/feature. Solo crear un archivo nuevo si no existe ninguno relacionado.

---

## 6. ESTRUCTURA DE CADA TEST GENERADO

Cada caso del CSV debe traducirse a un bloque `test()` de Playwright siguiendo esta estructura:

```typescript
test('TC-F1-01 — {Título}', async ({ page }) => {
  // Precondiciones
  // {Precondiciones del CSV}

  // Pasos
  // {Pasos de Ejecución traducidos a acciones Playwright}

  // Assertions
  // {Resultados Esperados traducidos a expect()}
})
```

- El nombre del test **debe incluir el ID** (`TC-F1-01`) para trazabilidad con el CSV.
- Añadir el tag de prioridad como anotación: `test.describe` agrupado por `{ID Épica}`.
- No inventar lógica que no esté en el CSV — ceñirse a precondiciones, pasos y expected del CSV.

---

## 7. REGLAS CRÍTICAS

- **NUNCA** modificar el `test-cases.csv` — es solo lectura.
- **NUNCA** generar tests para casos con `Estado` distinto de `Not Started`.
- **SIEMPRE** incluir el `ID Caso de Prueba` en el nombre del test.
- Si el CSV no tiene casos `Not Started`, reportar: `"✅ Todos los casos del CSV ya están implementados. No hay tests pendientes."` y terminar el workflow.
- El CSV es la **única fuente de verdad** para los targets de automatización en esta extensión.
