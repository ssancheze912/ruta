---
name: run-acceptance-tests
description: "Ejecución de casos de prueba a nivel de épica con Playwright MCP — Valida criterios de aceptación desde test-cases.csv y actualiza resultados en tiempo real."
version: 1.0.0
web_bundle: true
parameters:
  epic_id:
    description: 'Opcional: ID de Épica a ejecutar (ej: "EPIC-PPS-F1"). Si se omite, el workflow muestra menú de selección.'
    required: false
    type: string
  test_case_id:
    description: 'Opcional: ID de caso de prueba específico (ej: "TC-F1-001"). Solo aplica si epic_id también fue provisto.'
    required: false
    type: string
---

# Workflow — Ejecución de Pruebas de Aceptación por Épica

**Goal:** Ejecutar los casos de prueba definidos en `test-cases.csv` sobre la aplicación real usando el **MCP de Playwright**. Valida los criterios de aceptación a nivel de épica y actualiza el CSV con los resultados de ejecución (`Estado`, `Fecha Ejecución`, `ID Defecto`, `Descripción Fallo`).

**Your Role:** Actúas como **QA Engineer Senior** con experiencia en pruebas E2E automatizadas, Playwright, y sistemas empresariales. Ejecutas los pasos de cada caso de prueba paso a paso usando las herramientas del MCP de Playwright, evalúas los resultados esperados y registras evidencia.

---

## WORKFLOW ARCHITECTURE

**EXECUTION MODE:** Interactive — Selección de épica → Carga de casos → Ejecución con Playwright MCP → Actualización de resultados

### Reglas Críticas (SIN EXCEPCIONES)

- ✅ **SIEMPRE** comunicar al usuario en `{communication_language}` (Español)
- 🎭 **SIEMPRE** usar el MCP de Playwright para todas las interacciones con el navegador — NUNCA simular resultados
- 📋 **SIEMPRE** actualizar el CSV de resultados después de cada caso de prueba ejecutado
- 🔄 **NUNCA** marcar un test como `Pass` sin haber ejecutado los pasos en el navegador
- 📁 **SIEMPRE** usar rutas relativas (desde project-root) en documentos generados
- 🚨 Si el MCP de Playwright no está disponible, **DETENER** y notificar al usuario

---

## INITIALIZATION SEQUENCE

### INIT.1: Cargar Configuración

Cargar y leer ambos archivos de configuración:

1. `{project-root}/_bmad/core/config.yaml` → resolver: `{user_name}`, `{communication_language}`, `{output_folder}`
2. `{project-root}/_bmad/bmm/config.yaml` → resolver: `{project_name}`, `{implementation_artifacts}`, `{planning_artifacts}`

**Variables de rutas base:**
```
quality_process_root  = {implementation_artifacts}/quality-process
planeacion_root       = {quality_process_root}/planeacion
test_cases_csv        = {planeacion_root}/test-design-2026-04-09-100000/test-cases.csv
test_design_root      = {planeacion_root}/test-design-2026-04-09-100000
```

### INIT.2: Verificar MCP de Playwright

Verificar que las herramientas del MCP de Playwright están disponibles en el entorno antes de continuar.

Herramientas requeridas del MCP de Playwright:
- `playwright_navigate` / `browser_navigate` — Navegar a URL
- `playwright_screenshot` / `browser_screenshot` — Capturar pantalla
- `playwright_click` / `browser_click` — Hacer clic en elemento
- `playwright_fill` / `browser_fill` — Llenar campos de formulario
- `playwright_evaluate` / `browser_evaluate` — Ejecutar JavaScript
- `playwright_wait_for_element` / `browser_wait_for` — Esperar elemento
- `playwright_get_text` / `browser_get_text` — Obtener texto visible

> **Nota:** Los nombres exactos de las herramientas dependen del servidor MCP configurado.
> Usar los nombres disponibles en el entorno actual. Si ninguna herramienta Playwright está disponible,
> mostrar el error y detener el workflow.

**Si MCP no disponible:**
```
❌ ERROR: El MCP de Playwright no está disponible en este entorno.

Para habilitar el MCP de Playwright:
  1. Instala el servidor MCP: @playwright/mcp o @microsoft/playwright-mcp
  2. Configúralo en .claude/mcp-servers.json
  3. Reinicia la sesión y vuelve a ejecutar este workflow

Este workflow REQUIERE interacción real con el navegador — no puede simularse.
```

---

## STEP 1 — CARGA DE ARTEFACTOS DE CALIDAD

### 1.1: Cargar Documentos de Quality Process

Cargar automáticamente los documentos de quality-process disponibles:

**Documento 1 — Test Cases CSV (PRINCIPAL):**
- Ruta fija: `{test_cases_csv}`
- Acción: Leer contenido completo del CSV
- Almacenar como: `raw_csv_content`
- Si no existe: buscar el CSV más reciente en `{planeacion_root}/**/test-cases.csv`

**Documento 2 — Criterios de Aceptación (FAC):**
- Ruta: `{test_design_root}/test-design-phase2-fac.md`
- Acción: Leer → almacenar como `doc_fac`
- Contiene: Feature Acceptance Criteria en formato Gherkin

**Documento 3 — Matriz de Pruebas:**
- Ruta: `{test_design_root}/test-design-phase4-test-matrix.md`
- Acción: Leer → almacenar como `doc_test_matrix`
- Contiene: Casos de prueba detallados con técnicas y riesgos

**Documento 4 — Test Plan (Estrategia):**
- Buscar en `{quality_process_root}/diseno/*/test-plan.md` (más reciente)
- Acción: Leer → almacenar como `doc_test_plan`
- Si no existe: `doc_test_plan = null`

**Documento 5 — Test Design Completo:**
- Ruta: `{test_design_root}/test-design-complete.md`
- Acción: Leer → almacenar como `doc_test_design`

Notificar al usuario:
```
📋 Artefactos de Quality Process cargados:
  ✅ test-cases.csv      — {N} casos de prueba encontrados
  ✅ FAC (Gherkin)       — {test_design_root}/test-design-phase2-fac.md
  ✅ Matriz de Pruebas   — {test_design_root}/test-design-phase4-test-matrix.md
  ✅ Test Plan           — {ruta o "No encontrado"}
  ✅ Test Design Maestro — {test_design_root}/test-design-complete.md
```

### 1.2: Parsear Test Cases CSV

Parsear `raw_csv_content` en estructura de datos en memoria.

**Columnas del CSV (13 campos):**
```
"ID Épica" | "ID Caso de Prueba" | "Título" | "Descripción Completa" |
"Precondiciones" | "Pasos de Ejecución" | "Resultados Esperados" |
"Tipo prueba" | "Fecha Ejecución" | "Estado" | "ID Defecto" |
"Descripción Fallo" | "Notas"
```

**Estructura parseada:**
```
test_cases = [
  {
    epic_id: string,          // "EPIC-PPS-F1"
    tc_id: string,            // "TC-F1-001"
    title: string,
    description: string,
    preconditions: string,
    steps: string[],          // split por "\|" o "\n"
    expected_results: string,
    test_type: string,        // "Automated-E2E", "Manual", etc.
    execution_date: string,   // vacío si no ejecutado
    status: string,           // "Not Started", "Pass", "Fail", "Blocked", "Skipped"
    defect_id: string,
    defect_description: string,
    notes: string
  },
  ...
]
```

**Agrupar por épica:**
```
epics_map = {
  "EPIC-PPS-F1": { name: "Application Navigation Shell", cases: [...] },
  "EPIC-PPS-F2": { name: "Client Management",            cases: [...] },
  "EPIC-PPS-F3": { name: "Contact Management",           cases: [...] },
  "EPIC-PPS-F4": { name: "Client-Contact Association",   cases: [...] }
}
```

---

## STEP 2 — MODO DE EJECUCIÓN Y SELECCIÓN

### 2.0: Selección de Modo

**Si `epic_id` fue provisto como parámetro:** saltar esta sección e ir directo a 2.1 (modo Por Épica).

**Si no se proveyó parámetro**, preguntar el modo de ejecución:

Usar AskUserQuestion:
```json
{
  "questions": [
    {
      "question": "¿Cómo deseas ejecutar las pruebas?",
      "header": "Modo de Ejecución",
      "multiSelect": false,
      "options": [
        {
          "label": "Por Épica",
          "description": "Selecciona una épica específica y ejecuta sus casos de prueba"
        },
        {
          "label": "Por Feature",
          "description": "Selecciona un feature completo y ejecuta todos sus casos en secuencia"
        }
      ]
    }
  ]
}
```

- Si **Por Épica** → continuar en 2.1
- Si **Por Feature** → continuar en 2.1-F

---

### 2.1: Selección de Épica (Modo Por Épica)

**Si `epic_id` fue provisto como parámetro:**
- Validar que existe en `epics_map`. Si no, listar IDs y detener.
- `selected_epics = [epics_map[epic_id]]`
- Notificar: `✅ Épica seleccionada por parámetro: {epic_id}`
- Ir a 2.2

**Si se eligió el modo Por Épica sin parámetro, mostrar resumen y preguntar:**

```
📊 Épicas disponibles en test-cases.csv:

  • EPIC-PPS-F1  Application Navigation Shell    → {N} casos  [{X} Pass | {Y} Fail | {Z} Not Started]
  • EPIC-PPS-F2  Client Management               → {N} casos  [{X} Pass | {Y} Fail | {Z} Not Started]
  • EPIC-PPS-F3  Contact Management              → {N} casos  [{X} Pass | {Y} Fail | {Z} Not Started]
  • EPIC-PPS-F4  Client-Contact Association      → {N} casos  [{X} Pass | {Y} Fail | {Z} Not Started]

Tipos de prueba incluidos: Automated-E2E, Automated-FE, Automated-BE, Manual, Security, Performance
```

Usar AskUserQuestion:
```json
{
  "questions": [
    {
      "question": "¿Qué épica deseas ejecutar?",
      "header": "Selección de Épica",
      "multiSelect": false,
      "options": [
        { "label": "EPIC-PPS-F1 — Application Navigation Shell", "description": "Pruebas de NavigationRail, NavigationBar y deep linking" },
        { "label": "EPIC-PPS-F2 — Client Management", "description": "Pruebas de listado, búsqueda y CRUD de clientes" },
        { "label": "EPIC-PPS-F3 — Contact Management", "description": "Pruebas de listado, búsqueda y CRUD de contactos" },
        { "label": "EPIC-PPS-F4 — Client-Contact Association", "description": "Pruebas de asociación, desasociación y reasignación" }
      ]
    }
  ]
}
```

Almacenar `selected_epics = [epics_map[selección]]` → ir a 2.2

---

### 2.1-F: Selección de Feature (Modo Por Feature)

**Cargar `{implementation_artifacts}/feature-status.yaml`** y parsear la lista de features.

Por cada feature, leer las primeras líneas de su `epic_source` para extraer el nombre legible (el heading `##` o `###` del archivo).

**Tabla de referencia del proyecto:**

| feature-id | epic_source | Nombre legible | Epic CSV |
|---|---|---|---|
| feature-1 | epic-01-foundation.md | Foundation — Application Shell | EPIC-PPS-F1 |
| feature-2 | epic-02-gestion-de-clientes.md | Gestión de Clientes | EPIC-PPS-F2 |
| feature-3 | epic-03-gestion-de-contactos.md | Gestión de Contactos | EPIC-PPS-F3 |
| feature-4 | epic-04-asociacion-cliente-contacto.md | Asociación Cliente-Contacto | EPIC-PPS-F4 |

**Mapeo feature → Epic CSV:** El número del feature (`feature-{N}`) se corresponde directamente con `EPIC-PPS-F{N}` en el CSV.

Mostrar resumen de features con sus conteos de casos:

```
📦 Features disponibles:

  • feature-1  Foundation — Application Shell    → {N} casos  [{X} Pass | {Y} Fail | {Z} Not Started]
  • feature-2  Gestión de Clientes               → {N} casos  [{X} Pass | {Y} Fail | {Z} Not Started]
  • feature-3  Gestión de Contactos              → {N} casos  [{X} Pass | {Y} Fail | {Z} Not Started]
  • feature-4  Asociación Cliente-Contacto       → {N} casos  [{X} Pass | {Y} Fail | {Z} Not Started]
```

Usar AskUserQuestion:
```json
{
  "questions": [
    {
      "question": "¿Qué feature deseas ejecutar?",
      "header": "Selección de Feature",
      "multiSelect": false,
      "options": [
        { "label": "feature-1 — Foundation (Application Shell)", "description": "NavigationRail, NavigationBar, deep linking, 404" },
        { "label": "feature-2 — Gestión de Clientes", "description": "Listado, búsqueda, creación, edición y eliminación de clientes" },
        { "label": "feature-3 — Gestión de Contactos", "description": "Listado, búsqueda, creación, edición y eliminación de contactos" },
        { "label": "feature-4 — Asociación Cliente-Contacto", "description": "Asociar, desasociar, reasignar contactos a clientes" },
        { "label": "Todos los features (suite completa)", "description": "Ejecutar los casos de todos los features en secuencia" }
      ]
    }
  ]
}
```

**Resolver epics a ejecutar:**
- Si selecciona un feature específico: `selected_epics = [epics_map["EPIC-PPS-F{N}"]]`
- Si selecciona "Todos los features": `selected_epics = [F1, F2, F3, F4]` en orden

Almacenar `selected_epics` → ir a 2.2

**Nota para suite completa:** el STEP 4 se ejecutará en bucle para cada epic en `selected_epics`. El reporte final del STEP 5 consolidará los resultados de todos los features.

### 2.2: Selección de Tipo de Caso

**PASO A — Clasificar casos por compatibilidad con Playwright:**

Los tipos compatibles con el MCP de Playwright son:

```
PLAYWRIGHT_COMPATIBLE = ["Automated-E2E", "Manual"]
SKIP_AUTO             = ["Automated-FE", "Automated-BE", "Security", "Performance"]
```

A partir de los casos de `selected_epics`, separar en dos grupos:

```
casos_ejecutables = casos donde "Tipo prueba" IN PLAYWRIGHT_COMPATIBLE
casos_skip        = casos donde "Tipo prueba" IN SKIP_AUTO
```

Los `casos_skip` se marcan automáticamente como `Skipped` en el CSV con la nota:
```
Auto-Skipped: requiere {herramienta} — no ejecutable con Playwright MCP
```

Donde la herramienta es:
- `Automated-FE`  → `Vitest + React Testing Library`
- `Automated-BE`  → `xUnit / Supertest`
- `Security`      → `OWASP ZAP / Burp Suite`
- `Performance`   → `k6 / JMeter`

**PASO B — Mostrar resumen al usuario:**

```
📋 Casos disponibles — {nombre(s) de épica/feature seleccionado(s)}

   ✅ Ejecutables con Playwright ({N} casos):
      • Automated-E2E  → {N} casos
      • Manual         → {N} casos

   ⏭️ Se omitirán automáticamente ({N} casos):
      • Automated-FE   → {N} casos  (requiere Vitest + RTL)
      • Automated-BE   → {N} casos  (requiere xUnit)
      • Security       → {N} casos  (requiere OWASP ZAP / Burp)
      • Performance    → {N} casos  (requiere k6 / JMeter)
```

Si `casos_ejecutables` está vacío, notificar y detener:
```
⚠️ No hay casos ejecutables con Playwright en esta selección.
   Todos los casos ({N}) son de tipos que requieren otras herramientas.
   Selecciona otra épica/feature o ejecuta esos casos con su herramienta correspondiente.
```

**PASO C — Preguntar qué ejecutar dentro de los casos compatibles:**

Usar AskUserQuestion con opciones construidas dinámicamente (solo mostrar las que tienen casos):

```json
{
  "questions": [
    {
      "question": "¿Qué casos deseas ejecutar?",
      "header": "Selección de Casos — Playwright",
      "multiSelect": false,
      "options": [
        { "label": "Automated-E2E ({N} casos)", "description": "Flujos completos usuario → navegador → backend" },
        { "label": "Manual ({N} casos)", "description": "El QA ejecuta los pasos y confirma visualmente el resultado" },
        { "label": "Ambos tipos ({N} casos en total)", "description": "Ejecutar todos los casos compatibles con Playwright" },
        { "label": "Otra opción →", "description": "Filtrar por estado: Not Started, fallidos, o un caso específico" }
      ]
    }
  ]
}
```

**Si elige "Automated-E2E":**
- `test_cases_to_run = casos_ejecutables donde Tipo prueba == "Automated-E2E"`

**Si elige "Manual":**
- `test_cases_to_run = casos_ejecutables donde Tipo prueba == "Manual"`

**Si elige "Ambos tipos":**
- `test_cases_to_run = casos_ejecutables`

**Si elige "Otra opción →"**, mostrar submenú:

```json
{
  "questions": [
    {
      "question": "¿Cómo deseas filtrar los casos ejecutables?",
      "header": "Filtro adicional",
      "multiSelect": false,
      "options": [
        { "label": "Solo Not Started", "description": "Casos compatibles que aún no han sido ejecutados" },
        { "label": "Solo fallidos (re-test)", "description": "Casos en estado Fail o Blocked" },
        { "label": "Todos (incluyendo re-ejecución)", "description": "Todos los casos compatibles sin importar su estado" },
        { "label": "Caso específico por ID", "description": "Ingresar el TC-ID exacto" }
      ]
    }
  ]
}
```

- `Solo Not Started` → `test_cases_to_run = casos_ejecutables donde Estado == "Not Started"`
- `Solo fallidos` → `test_cases_to_run = casos_ejecutables donde Estado IN ["Fail", "Blocked"]`
- `Todos` → `test_cases_to_run = casos_ejecutables`
- `Caso específico por ID`:
  - Si `test_case_id` fue provisto como parámetro: usarlo directamente
  - Si no: pedir `Ingresa el ID del caso (ej: TC-F1-003):`
  - Validar que existe en `casos_ejecutables`; si no, mostrar lista de IDs disponibles
  - `test_cases_to_run = [ese caso]`

**PASO D — Actualizar CSV con los Skipped automáticos:**

Antes de continuar al STEP 3, persistir los `casos_skip` en el CSV:
- `Estado = "Skipped"`
- `Fecha Ejecución = {DD-MM-YYYY de hoy}`
- `Notas = {Notas originales} | Auto-Skipped: requiere {herramienta}`

Notificar:
```
✅ Filtro aplicado — Casos a ejecutar con Playwright: {N}
⏭️ Casos omitidos (auto-Skipped en CSV): {N}
```

### 2.3: Ambiente de Ejecución

Cargar `{workflow_root}/environments.yaml` y tomar automáticamente el ambiente con `id: local`.

Almacenar su `url` como `app_base_url`. No preguntar al usuario.

Notificar:
```
🌐 Ambiente: Local (mi máquina) → {url}
```

---

## STEP 3 — PRE-TEST SETUP

### 3.1: Mostrar Contexto de la Épica

Antes de ejecutar, mostrar el contexto de aceptación de la épica seleccionada:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 ÉPICA: {selected_epic.id} — {selected_epic.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Criterios de Aceptación (FAC en Gherkin):
{extraer del doc_fac los criterios correspondientes a la épica seleccionada}

🔧 Estrategia de prueba:
  • Tipos de prueba: {tipos presentes en test_cases_to_run}
  • Técnicas: UC (Use Case), BVA, EC, EP, DT, ST
  • Riesgo residual: ver test-design-phase5-tsr.md

📊 Casos a ejecutar: {len(test_cases_to_run)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3.2: Abrir Navegador y Navegar

Usar Playwright MCP para abrir la aplicación:

```
🌐 Abriendo navegador → {app_base_url}
```

Ejecutar con MCP:
1. `playwright_navigate` con `url = {app_base_url}`
2. `playwright_screenshot` para confirmar que la aplicación cargó
3. Verificar que la aplicación responde (status HTTP 200 o DOM cargado)

Si la aplicación no carga:
```
❌ ERROR: No se puede conectar a {app_base_url}

Verifica que:
  1. La aplicación está ejecutándose
  2. La URL es correcta
  3. No hay firewall o proxy bloqueando

¿Deseas reintentar con otra URL?
```

---

## STEP 4 — EJECUCIÓN DE CASOS DE PRUEBA

### 4.1: Bucle de Ejecución

Para cada `test_case` en `test_cases_to_run`, ejecutar secuencialmente:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Ejecutando: [{tc_id}] {title}
   Épica: {epic_id} | Tipo: {test_type} | Prioridad: {extraer de Notas}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 4.1.1: Verificar Precondiciones

Mostrar las precondiciones del caso:
```
📋 Precondiciones:
{test_case.preconditions}
```

Si las precondiciones incluyen "viewport desktop (≥ 1024px)": usar viewport 1280x800.
Si incluyen "viewport móvil": usar viewport 375x812.

#### 4.1.2: Setup del Estado Inicial

Navegar a la URL base si el caso requiere estado inicial limpio:
- `playwright_navigate` → `{app_base_url}`

Si las precondiciones requieren datos específicos (ej: "cliente registrado con NIT"), ejecutar pasos de setup antes del test principal.

#### 4.1.3: Ejecutar Pasos del Test Case

Los pasos vienen en el campo `Pasos de Ejecución` separados por ` | ` o numerados.

Para cada paso, interpretar y ejecutar con las herramientas del MCP:

| Tipo de Paso | Herramienta MCP |
|---|---|
| Navegar a ruta | `playwright_navigate` |
| Hacer clic en elemento | `playwright_click` |
| Escribir en campo | `playwright_fill` |
| Verificar visibilidad | `playwright_evaluate` / `browser_wait_for` |
| Tomar captura | `playwright_screenshot` |
| Obtener texto | `playwright_get_text` |
| Esperar carga | `playwright_wait_for_element` |
| Ejecutar acción JS | `playwright_evaluate` |
| Verificar URL | `playwright_evaluate` con `window.location.href` |
| Verificar respuesta API | `playwright_evaluate` con intercepción de red |

Mostrar progreso por paso:
```
  ▶ Paso 1: {descripción del paso}
    → {herramienta MCP usada} ejecutada
    → Resultado: {captura o texto obtenido}

  ▶ Paso 2: {descripción del paso}
    → ...
```

#### 4.1.4: Validar Resultado Esperado

Comparar el estado actual del navegador contra `test_case.expected_results`:

```
🔍 Validando resultado esperado:
   Expected: {test_case.expected_results}
   Observed: {lo que se observa en el navegador}
```

Capturar screenshot final como evidencia con:
- `playwright_screenshot`

#### 4.1.5: Determinar Estado del Test

```
resultado = {
  "Pass":    si el resultado observado coincide con el esperado,
  "Fail":    si el resultado observado NO coincide con el esperado,
  "Blocked": si no se pudo ejecutar por prerequisito faltante o error de ambiente,
  "Skipped": si el tipo de prueba no aplica en el ambiente actual (ej: Performance en dev)
}
```

Mostrar:
```
  ✅ PASS  — Resultado observado coincide con el esperado
  ❌ FAIL  — Resultado observado: {descripción de la discrepancia}
  ⚠️ BLOCKED — {razón del bloqueo}
  ⏭️ SKIPPED — {razón del skip}
```

**Si FAIL:** Pedir al usuario el ID del defecto (si lo tiene) y la descripción del fallo observado:
```
❌ Caso fallido: [{tc_id}] {title}

¿Qué observaste? (describe brevemente el comportamiento incorrecto):
[texto libre]

¿Tienes un ID de defecto (Jira/tracking)? [opcional]:
```

#### 4.1.6: Actualizar CSV Inmediatamente

Después de cada test case ejecutado, actualizar el CSV con los resultados.

**Campos a actualizar en el CSV:**

| Campo | Valor |
|---|---|
| `Fecha Ejecución` | `{DD-MM-YYYY}` de hoy |
| `Estado` | `Pass` / `Fail` / `Blocked` / `Skipped` |
| `ID Defecto` | ID del defecto si existe, vacío si Pass |
| `Descripción Fallo` | Descripción del fallo si Fail/Blocked |

**Proceso de actualización:**
1. Cargar el CSV completo en memoria
2. Localizar la fila por `ID Caso de Prueba` = `{tc_id}`
3. Actualizar solo los 4 campos correspondientes
4. Reconstruir el CSV completo con todos los campos entre comillas dobles
5. Escribir usando Write tool (NUNCA bash, sed, awk)
6. Confirmar: `✅ CSV actualizado: [{tc_id}] → {estado}`

### 4.2: Resumen de Progreso

Después de cada caso ejecutado, mostrar progreso:

```
📊 Progreso [{n}/{total}]:
   ✅ Pass:    {X}
   ❌ Fail:    {Y}
   ⚠️ Blocked: {Z}
   ⏭️ Skipped: {W}
   ⬜ Pendientes: {remaining}
```

### 4.3: Manejo de Errores de Playwright

Si una herramienta del MCP de Playwright falla:

```
⚠️ Error en Playwright MCP: {mensaje de error}
   Caso: [{tc_id}] {title}
   Paso: {número de paso}

¿Cómo deseas proceder?
  [R] Reintentar el paso
  [S] Saltar este paso y continuar
  [B] Marcar como Blocked y pasar al siguiente caso
  [P] Pausar la ejecución
```

---

## STEP 5 — GENERACIÓN DE REPORTE DE EJECUCIÓN

### 5.1: Generar Test Execution Report

Al finalizar todos los casos de la épica seleccionada, generar el reporte:

**Ruta de salida:**
```
{quality_process_root}/ejecucion/test-run-{epic_id}-{YYYY-MM-DD-HHmmss}/test-execution-report.md
```

**Contenido del reporte:**

```markdown
---
workflow: run-acceptance-tests
phase: ejecucion
epic_id: {selected_epic.id}
epic_name: {selected_epic.name}
execution_date: {ISO 8601}
executed_by: {user_name}
app_url: {app_base_url}
test_cases_csv: {ruta relativa al CSV}
---

# Test Execution Report
## {selected_epic.id} — {selected_epic.name}

**Fecha de Ejecución:** {DD-MM-YYYY}
**Ejecutado por:** {user_name}
**Ambiente:** {app_base_url}
**Total de Casos:** {total}

---

## Resumen Ejecutivo

| Resultado | Cantidad | % |
|---|---|---|
| ✅ Pass | {X} | {X/total * 100}% |
| ❌ Fail | {Y} | {Y/total * 100}% |
| ⚠️ Blocked | {Z} | {Z/total * 100}% |
| ⏭️ Skipped | {W} | {W/total * 100}% |
| **Total** | **{total}** | **100%** |

**Tasa de Éxito:** {X/total * 100}%
**Decisión Go/No-Go:** {PASS si Pass% ≥ umbral | FAIL si hay casos P0 fallidos}

---

## Criterios de Aceptación Evaluados

{lista de criterios FAC con estado: ✅ Validado / ❌ No cumple / ⚠️ Parcial}

---

## Detalle de Casos Ejecutados

| ID Caso | Título | Tipo | Estado | Defecto | Notas |
|---|---|---|---|---|---|
{por cada caso ejecutado:}
| {tc_id} | {title} | {test_type} | {estado_emoji} {estado} | {defect_id} | {notas_breves} |

---

## Defectos Encontrados

{si hay casos Fail:}
| ID Defecto | TC asociado | Descripción | Prioridad |
|---|---|---|---|
| {defect_id} | {tc_id} | {descripción} | {P de Notas} |

{si no hay defectos:}
✅ No se encontraron defectos en esta ejecución.

---

## Riesgos Residuales No Cubiertos

{casos Skipped o Blocked que representan riesgos pendientes}

---

## Próximos Pasos

- [ ] {si Fail: corregir defectos y re-ejecutar}
- [ ] {si Blocked: resolver prerequisitos y re-ejecutar}
- [ ] {si todo Pass: ejecutar siguiente épica o emitir Go/No-Go final}
```

### 5.2: Actualizar CSV Final

Verificar que el CSV está completamente actualizado con todos los resultados de la ejecución actual.

Mostrar un diff de los cambios:
```
📝 Cambios en test-cases.csv:
   {N} casos actualizados
   {lista de: TC-ID → "Not Started" → "Pass/Fail/Blocked"}
```

### 5.3: Completion Message

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ EJECUCIÓN COMPLETADA — {selected_epic.id}: {selected_epic.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Resultado Final:
   ✅ Pass:    {X}/{total} ({X/total*100}%)
   ❌ Fail:    {Y}/{total} ({Y/total*100}%)
   ⚠️ Blocked: {Z}/{total} ({Z/total*100}%)
   ⏭️ Skipped: {W}/{total} ({W/total*100}%)

🎯 Decisión Go/No-Go:
   {✅ GO — Todos los criterios de aceptación validados}
   {❌ NO-GO — {N} defecto(s) crítico(s) detectado(s)}

📁 Artefactos generados:
   • CSV actualizado: {ruta relativa al test-cases.csv}
   • Reporte de ejecución: {ruta relativa al report}

💡 Próximo paso:
   {Si hay más épicas pendientes: ejecutar /run-acceptance-tests con la siguiente épica}
   {Si todas las épicas Pass: emitir Go/No-Go final del sprint}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## APÉNDICE: Tipos de Prueba y Estrategia Playwright

### Tipos de Prueba y Cómo Ejecutarlos con MCP

| Tipo | Descripción | Estrategia Playwright MCP |
|---|---|---|
| `Automated-E2E` | Flujo completo usuario-browser-backend | Navegar → interactuar → validar UI y red |
| `Automated-FE` | Lógica frontend aislada | Navegar → interactuar → evaluar DOM/estado |
| `Automated-BE` | Endpoints y lógica de negocio | Evaluar requests/responses vía network interception |
| `Manual` | Pruebas que requieren juicio humano | Ejecutar pasos → pedir confirmación visual al operador |
| `Security` | Inyección, XSS, auth | Enviar payloads maliciosos → verificar respuesta segura |
| `Performance` | Tiempos de respuesta | Medir con `performance.timing` vía `playwright_evaluate` |

### Selectores CSS Esperados (Siesa UI Kit)

Selectores comunes del proyecto basados en el stack (React 18 + Siesa UI Kit):

```
NavigationRail:    [data-testid="navigation-rail"]
NavigationBar:     [data-testid="navigation-bar"]
ClientList:        [data-testid="client-list"]
ContactList:       [data-testid="contact-list"]
SearchInput:       input[placeholder*="buscar"], input[type="search"]
FormSubmit:        button[type="submit"]
ErrorMessage:      [role="alert"], .error-message
SuccessToast:      [data-testid="toast-success"]
Modal:             [role="dialog"]
LoadingSpinner:    [data-testid="loading-spinner"]
```

*(Nota: Ajustar selectores según los atributos `data-testid` reales del proyecto.)*

---

*(Note: `workflow_root` es `{project-root}/_siesa-agents/bmm/workflows/4-implementation/run-acceptance-tests`)*
*(Note: `implementation_artifacts` es `{project-root}/_bmad-output/implementation-artifacts`)*
*(Note: `quality_process_root` es `{implementation_artifacts}/quality-process`)*
