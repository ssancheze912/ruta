# REGLA OBLIGATORIA: TEST-REVIEW CON INTEGRIDAD CSV ↔ SPECS

**TRIGGER:** Cada vez que se ejecute `/testarch-test-review` o `test-review`.

Esta extensión **agrega** checks de integridad entre el `test-cases.csv` y los spec files.
No reemplaza ningún check estándar del workflow — se ejecuta en paralelo.

---

## 1. CARGAR EL CSV MÁS RECIENTE

Ejecutar al inicio de **Step 1** (junto con la carga del knowledge base):

```
FUNCTION find_latest_test_cases_csv():
  search_root = "{output_folder}/implementation-artifacts/quality-process/diseno/"
  folders = glob("{search_root}test-design-*/test-cases.csv")

  IF folders IS EMPTY:
    csv_available = false
    RETURN null

  csv_path = sort(folders, descending=true)[0]
  LOAD csv_path into memory as csv_cases
  csv_available = true
  RETURN csv_path
```

Si no existe CSV, omitir las secciones 2–5 de esta extensión y ejecutar solo el workflow estándar.

---

## 2. INDEXAR CSV POR ID DE CASO

Una vez cargado, construir dos índices para búsqueda rápida:

```
FUNCTION build_csv_index(csv_cases):
  // Índice por ID de caso → fila completa
  by_id = {}
  FOR each row IN csv_cases:
    by_id[row["ID Caso de Prueba"]] = row

  // Índice por spec file esperado → lista de IDs
  // Derivar qué spec file debería tener cada caso
  // "EPIC-SA-F1" → "frontend/tests/e2e/clientes.spec.ts" (usando mapeo de epic a spec)
  by_spec = {}
  FOR each row IN csv_cases:
    expected_spec = resolve_spec_file(row["ID Épica"])
    IF expected_spec NOT IN by_spec:
      by_spec[expected_spec] = []
    by_spec[expected_spec].APPEND(row["ID Caso de Prueba"])

  RETURN { by_id, by_spec }
```

---

## 3. INDEXAR SPEC FILES POR ID DE CASO

Durante **Step 2** (Discover and Parse Test Files), extraer adicionalmente los IDs de caso presentes en los nombres de los tests:

```
FUNCTION extract_test_ids_from_specs(spec_files):
  ids_found = {}  // ID → { file, test_name }

  FOR each spec_file IN spec_files:
    content = READ(spec_file)

    // Buscar patrón TC-F{N}-{NN} en nombres de test
    matches = regex_findall(r"TC-[A-Z0-9]+-\d+", content)

    FOR each match IN matches:
      ids_found[match] = {
        file:      spec_file,
        test_name: extract_surrounding_test_name(content, match)
      }

  RETURN ids_found
```

---

## 4. EJECUTAR CHECKS DE INTEGRIDAD CSV ↔ SPECS

Ejecutar **después del Step 2** (parse) y **antes del Step 3** (quality validation).

Estos son los 4 checks de integridad nuevos:

---

### CHECK A — Trazabilidad: specs sin ID de caso

Detecta tests en los spec files que **no tienen** un `TC-XX-YY` en su nombre.

```
FUNCTION check_a_untraceable_tests(spec_files, ids_found):
  issues = []

  FOR each spec_file IN spec_files:
    tests = parse_all_test_names(spec_file)
    FOR each test_name IN tests:
      IF no TC-*.* pattern IN test_name:
        issues.APPEND({
          severity: "WARN",
          file:     spec_file,
          test:     test_name,
          message:  "Test sin ID de caso — no es trazable al CSV"
        })

  RETURN issues
```

**Criterio:**
- ✅ PASS: Todos los tests tienen `TC-XX-YY` en su nombre
- ⚠️ WARN: Algunos tests no tienen ID (no son trazables)
- ❌ FAIL: Ningún test tiene IDs (suite completamente no trazable)

---

### CHECK B — Cobertura: casos `Not Started` sin implementación

Detecta casos del CSV con `Estado = "Not Started"` para los que **no existe** ningún test en los specs.

```
FUNCTION check_b_unimplemented_cases(csv_cases, ids_found):
  issues = []

  FOR each row IN csv_cases WHERE Estado == "Not Started":
    case_id = row["ID Caso de Prueba"]
    IF case_id NOT IN ids_found:
      issues.APPEND({
        severity: "FAIL",
        case_id:  case_id,
        title:    row["Título"],
        epic:     row["ID Épica"],
        priority: extract_priority(row["Notas"]),
        message:  "Caso diseñado sin implementación en specs"
      })

  // Ordenar por prioridad (P0 primero)
  RETURN sort(issues, by=priority)
```

**Criterio:**
- ✅ PASS: Todos los `Not Started` ya tienen spec implementado (run `test-automate`)
- ⚠️ WARN: Algunos `Not Started` sin spec (pendientes de implementar)
- ❌ FAIL: Mayoría de `Not Started` sin spec (test-automate no se ha ejecutado)

---

### CHECK C — Sincronía: casos `Pass`/`Fail` sin spec correspondiente

Detecta casos que el CSV marca como ejecutados (`Pass`/`Fail`) pero cuyo test **ya no existe** en los specs.

```
FUNCTION check_c_orphan_csv_status(csv_cases, ids_found):
  issues = []

  FOR each row IN csv_cases WHERE Estado IN ["Pass", "Fail"]:
    case_id = row["ID Caso de Prueba"]
    IF case_id NOT IN ids_found:
      issues.APPEND({
        severity: "FAIL",
        case_id:  case_id,
        title:    row["Título"],
        estado:   row["Estado"],
        message:  "CSV marca este caso como '{Estado}' pero el spec no existe — posible spec eliminado o renombrado"
      })

  RETURN issues
```

**Criterio:**
- ✅ PASS: Todos los casos ejecutados tienen su spec presente
- ❌ FAIL: Casos con estado `Pass`/`Fail` sin spec → el CSV está desincronizado

---

### CHECK D — Specs huérfanos: tests implementados sin caso en CSV

Detecta tests en los spec files con un `TC-XX-YY` que **no existe** en el CSV.

```
FUNCTION check_d_orphan_specs(ids_found, csv_index):
  issues = []

  FOR each (case_id, location) IN ids_found:
    IF case_id NOT IN csv_index.by_id:
      issues.APPEND({
        severity: "WARN",
        case_id:  case_id,
        file:     location.file,
        test:     location.test_name,
        message:  "ID referenciado en spec no existe en el CSV — test no diseñado formalmente"
      })

  RETURN issues
```

**Criterio:**
- ✅ PASS: Todos los IDs en specs existen en el CSV
- ⚠️ WARN: Algunos IDs en specs no están en CSV → tests ad-hoc sin diseño formal

---

## 5. AGREGAR SECCIÓN AL REPORTE FINAL

En **Step 4** (Generate Review Report), agregar una sección nueva al reporte de salida **antes** del scoring general:

```markdown
## Integridad CSV ↔ Specs

**Fuente CSV:** {csv_path}
**Total casos en CSV:** {total} ({not_started} Not Started / {pass} Pass / {fail_count} Fail)
**Spec files analizados:** {spec_count}

### Check A — Trazabilidad
{resultado: PASS / WARN / FAIL}
{lista de tests sin ID si aplica}

### Check B — Casos sin implementación
{resultado: PASS / WARN / FAIL}
{lista de casos Not Started sin spec, ordenados por prioridad}

### Check C — Estado CSV desincronizado
{resultado: PASS / WARN / FAIL}
{lista de casos Pass/Fail sin spec correspondiente}

### Check D — Specs sin caso en CSV
{resultado: PASS / WARN / FAIL}
{lista de IDs en specs que no existen en el CSV}

### Resumen de Integridad
| Check | Estado | Issues |
|-------|--------|--------|
| A — Trazabilidad        | {estado} | {n} tests sin ID |
| B — Sin implementación  | {estado} | {n} casos Not Started huérfanos |
| C — CSV desincronizado  | {estado} | {n} casos Pass/Fail sin spec |
| D — Specs huérfanos     | {estado} | {n} IDs sin caso en CSV |
```

---

## 6. IMPACTO EN EL SCORE DE CALIDAD

Los checks de integridad contribuyen al score del workflow estándar con el siguiente peso:

| Check | Severidad | Impacto en score |
|---|---|---|
| A — Tests sin ID | WARN | -3 puntos por test |
| B — Not Started sin spec | FAIL | -5 puntos por caso P0/P1, -2 por P2/P3 |
| C — CSV desincronizado | FAIL | -10 puntos por caso |
| D — Specs huérfanos | WARN | -2 puntos por spec |

**Máximo descuento por integridad:** 20 puntos sobre el score total de 100.

---

## 7. REGLAS CRÍTICAS

- **NUNCA** modificar el CSV ni los spec files — esta extensión es solo lectura.
- Los checks de integridad son **adicionales** — el workflow estándar corre completo independientemente.
- Si el CSV no existe, omitir silenciosamente esta extensión (no bloquear el workflow estándar).
- El Check B es el más crítico para el equipo: indica casos diseñados que aún no tienen test real.
