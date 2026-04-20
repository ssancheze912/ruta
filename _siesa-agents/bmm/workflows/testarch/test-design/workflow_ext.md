# REGLA OBLIGATORIA: TEST-DESIGN EPIC-LEVEL CON TEST-CASES.CSV COMO BASELINE

**TRIGGER:** Cada vez que se ejecute `/testarch-test-design` o `test-design` en **Epic-Level Mode** (Phase 4).
**No aplica** en System-Level Mode (Phase 3) — ignorar esta extensión si el modo detectado es System-Level.

---

## 1. DESCUBRIR Y CARGAR EL CSV MÁS RECIENTE

Ejecutar **inmediatamente después del Preflight** (detección de modo), antes de Step 1:

```
FUNCTION find_latest_test_cases_csv():
  search_root = "{output_folder}/implementation-artifacts/quality-process/diseno/"

  folders = glob("{search_root}test-design-*/test-cases.csv")

  IF folders IS EMPTY:
    // Sin CSV — ejecutar el workflow estándar sin cambios
    RETURN null

  csv_path = sort(folders, descending=true)[0]
  LOAD csv_path into memory as existing_cases
  RETURN csv_path
```

Si el CSV no existe, ignorar esta extensión y ejecutar el workflow estándar sin cambios.

---

## 2. IDENTIFICAR LA ÉPICA OBJETIVO

Antes de Step 1, determinar sobre qué épica se va a trabajar:

```
FUNCTION resolve_target_epic():
  // Prioridad 1: variable del workflow si viene seteada
  IF {epic_num} IS SET AND NOT EMPTY:
    RETURN {epic_num}

  // Prioridad 2: preguntar al usuario
  epics_in_csv = unique values of column "ID Épica" in existing_cases
  // e.g. ["EPIC-SA-F1", "EPIC-SA-F2", "EPIC-SA-F3"]

  ASK user:
    "📋 CSV cargado desde {csv_path}
     Épicas con casos diseñados: {epics_in_csv}

     ¿Sobre qué épica deseas trabajar? (escribe el ID o 'nueva' para una épica sin casos)"

  RETURN user_input
```

---

## 3. ANALIZAR BASELINE DE LA ÉPICA OBJETIVO

Una vez identificada la épica objetivo, filtrar el CSV:

```
FUNCTION analyze_epic_baseline(epic_id):
  epic_cases = filter(existing_cases, "ID Épica" == epic_id)

  IF epic_cases IS EMPTY AND epic_id != "nueva":
    // La épica existe en el proyecto pero no tiene casos diseñados aún
    RETURN { total: 0, by_status: {}, by_priority: {}, existing_ids: [] }

  summary = {
    total:        COUNT(epic_cases),
    by_status: {
      not_started: COUNT(WHERE Estado == "Not Started"),
      pass:        COUNT(WHERE Estado == "Pass"),
      fail:        COUNT(WHERE Estado == "Fail"),
    },
    by_priority: {
      p0: COUNT(WHERE Notas CONTAINS "Priority: P0"),
      p1: COUNT(WHERE Notas CONTAINS "Priority: P1"),
      p2: COUNT(WHERE Notas CONTAINS "Priority: P2"),
      p3: COUNT(WHERE Notas CONTAINS "Priority: P3"),
    },
    existing_ids: list of all "ID Caso de Prueba" values,
    last_id_seq:  max numeric suffix from existing IDs
                  // e.g. "TC-F1-07" → last_id_seq = 7
  }

  RETURN summary
```

Reportar al usuario el baseline encontrado:

```
"📊 Baseline de {epic_id}:
  Total casos existentes: {total}
  ├─ Not Started: {not_started}
  ├─ Pass: {pass}
  └─ Fail: {fail}

  Por prioridad: P0={p0} | P1={p1} | P2={p2} | P3={p3}

  ℹ️  El diseño se enfocará en completar los gaps de cobertura.
     Los casos existentes NO serán rediseñados."
```

---

## 4. INYECCIÓN EN STEP 1 (LOAD CONTEXT — EPIC-LEVEL)

**OVERRIDE de "Analyze Existing Test Coverage" (Step 1, punto 3):**

En lugar de escanear el filesystem para detectar coverage gaps, usar el CSV como fuente de cobertura existente:

- Los casos del CSV con `Estado = "Pass"` o `Estado = "Fail"` = **ya implementados y ejecutados**
- Los casos con `Estado = "Not Started"` = **diseñados pero no implementados aún**
- Los campos `Notas` con `Level`, `Technique`, `Risk`, `Priority` = metadata de diseño ya aplicada

```
existing_coverage = {
  designed_cases:     epic_cases,           // ya están en el CSV
  implemented_cases:  WHERE Estado != "Not Started",
  pending_cases:      WHERE Estado == "Not Started",
  covered_scenarios:  list of all "Título" values  // para evitar duplicados
}
```

**Regla crítica:** Al diseñar nuevos casos en Step 3, verificar siempre contra `covered_scenarios` para **no duplicar** escenarios que ya están en el CSV.

---

## 5. INYECCIÓN EN STEP 3 (DESIGN TEST COVERAGE)

**OVERRIDE de "Break Down Acceptance Criteria" (Step 3, punto 1):**

El workflow estándar convierte cada criterio de aceptación en un caso de prueba. Con esta extensión:

```
FUNCTION design_new_cases(acceptance_criteria, existing_coverage):
  new_cases = []

  FOR each criterion IN acceptance_criteria:
    // Verificar si ya existe un caso que cubre este criterio
    IF any title IN existing_coverage.covered_scenarios
       MATCHES criterion (semantic similarity):
      SKIP — ya está cubierto
      CONTINUE

    // Solo diseñar casos para criterios NO cubiertos
    new_case = design_test_case(criterion)
    new_cases.APPEND(new_case)

  RETURN new_cases
```

**Regla:** Si todos los criterios ya tienen cobertura en el CSV, reportar:
`"✅ Todos los criterios de aceptación de {epic_id} ya tienen casos diseñados en el CSV. No hay gaps de cobertura."` y terminar el workflow.

---

## 6. FORMATO DE SALIDA — COMPATIBLE CON EL CSV EXISTENTE

Los nuevos casos diseñados deben generarse **directamente en formato CSV**, compatibles con el archivo existente, para poder ser mergeados.

**Columnas requeridas (mismo orden que el CSV existente):**
```
"ID Épica","ID Caso de Prueba","Título","Descripción Completa","Precondiciones","Pasos de Ejecución","Resultados Esperados","Tipo prueba","Fecha Ejecución","Estado","ID Defecto","Descripción Fallo","Notas"
```

**Reglas de generación:**

```
FUNCTION generate_csv_row(new_case, epic_id, baseline_summary):
  // ID secuencial continuando desde el último del CSV
  next_seq   = baseline_summary.last_id_seq + 1
  feature_n  = extract_feature_number(epic_id)  // "EPIC-SA-F1" → "F1"
  case_id    = "TC-{feature_n}-{next_seq:02d}"  // "TC-F1-08"

  ROW = {
    "ID Épica":           epic_id,
    "ID Caso de Prueba":  case_id,
    "Título":             new_case.title,
    "Descripción Completa": new_case.description,
    "Precondiciones":     new_case.preconditions,
    "Pasos de Ejecución": new_case.steps,
    "Resultados Esperados": new_case.expected,
    "Tipo prueba":        new_case.type,           // "Funcional", "Negativo", etc.
    "Fecha Ejecución":    "",                       // vacío — pendiente
    "Estado":             "Not Started",
    "ID Defecto":         "",
    "Descripción Fallo":  "",
    "Notas":              "Level: {level} | Technique: {technique} | Risk: {prob}x{impact}={score} | Priority: {priority}"
  }

  next_seq += 1
  RETURN ROW
```

**Output final del workflow:**
- Generar el diseño completo en markdown en `{output_folder}/test-design-epic-{epic_num}.md` (estándar)
- **Adicionalmente:** Generar un archivo CSV de solo los casos nuevos en:
  `{output_folder}/implementation-artifacts/quality-process/diseno/test-design-{date}/test-cases-new-{epic_id}.csv`
- Indicar al usuario cómo mergear: `"Agrega las filas de test-cases-new-{epic_id}.csv al final de {csv_path} para actualizar el baseline."`

---

## 7. REGLAS CRÍTICAS

- **NUNCA** rediseñar casos que ya existen en el CSV (`existing_ids`).
- **NUNCA** modificar el CSV original — solo generar el archivo de nuevos casos.
- **SOLO** aplica en Epic-Level Mode — en System-Level Mode esta extensión es invisible.
- Los IDs de los nuevos casos deben continuar la secuencia del CSV (`last_id_seq + 1`).
- El campo `Estado` de todos los nuevos casos es siempre `"Not Started"`.
