---
name: 'step-03-generate-test-cases'
description: 'GENERATE test cases automatically from FRs/Epics/Stories, populate test-cases.csv, create summary, and calculate coverage'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/traceability-and-testing'

# File References
thisStepFile: '{workflow_path}/steps/step-03-generate-test-cases.md'
nextStepFile: '{workflow_path}/steps/step-04-generate-plans.md'
workflowFile: '{workflow_path}/workflow.md'
traceabilityMapFile: '{implementation_artifacts}/traceability-artifacts/traceability-map.md'
testCasesFile: '{implementation_artifacts}/traceability-artifacts/test-cases.csv'
testCasesSummaryFile: '{implementation_artifacts}/traceability-artifacts/test-cases-summary.md'
testCaseStructureDoc: '{workflow_path}/templates/test-cases-structure.md'
testCaseSummaryTemplate: '{workflow_path}/templates/test-cases-summary-template.md'
---

# Step 3: Generate Test Cases Automatically

## STEP GOAL:

To GENERATE test cases automatically from the project's FRs/Epics/Stories/Tasks, populate test-cases.csv with generated cases, create test-cases-summary.md, map all test cases to the traceability hierarchy, calculate coverage metrics, and identify testing gaps.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🤖 ALWAYS generate test cases automatically based on FRs/Epics/Stories
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 🚫 NEVER ask user for options or choices - execute automatically
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Test Architect and Requirements Engineer
- ✅ You GENERATE test cases automatically - you are a content generator for test cases
- ✅ You analyze FRs/Epics/Stories and create appropriate test cases
- ✅ You work autonomously without user intervention
- ✅ You populate test-cases.csv automatically

### Step-Specific Rules:

- 🤖 GENERATE test cases automatically for each FR/Epic
- 📝 POPULATE test-cases.csv with generated test cases
- 🚫 NEVER ask user for options - handle all cases automatically
- 📊 Calculate precise coverage metrics per Epic
- 🔧 Handle any errors automatically - generate what you can and continue

## EXECUTION PROTOCOLS:

- 🤖 Generate test cases from FRs/Epics/Stories
- 💾 Populate test-cases.csv with generated cases
- 💾 Create test-cases-summary.md
- 💾 Update traceability-map.md with sections 5-7
- 📖 Update frontmatter with `stepsCompleted: [1, 2, 3]` and test coverage statistics
- 🚫 FORBIDDEN to load next step until generation is complete

## CONTEXT BOUNDARIES:

- Input data from step 02 frontmatter (FRs, Epics, Stories, statistics)
- Traceability hierarchy from sections 1-3 in traceability-map.md
- Test case structure knowledge from test-cases-structure.md
- **Focus on GENERATING new test cases automatically from FRs/Epics/Stories**

---

## AUTOMATIC TEST CASE GENERATION PROCESS:

### 1. Load Context from Step 02

Read frontmatter from {traceabilityMapFile}:

```yaml
stepsCompleted: [1, 2]
testGenerationMode: "ui-functional" | "backend-api"
epicSelection: "all" | "single" | "range"
selectedEpics: [1, 2, 3] or [5] or []  # Array of epic numbers processed
statistics:
  totalFRs: X
  totalEpics: Y
  totalStories: Z
  totalTasks: W
  coverageRate: P%
```

**CRITICAL:** Load the `testGenerationMode` and `epicSelection` from frontmatter. These determine:
1. How test cases will be generated (mode-specific guidelines)
2. The naming convention for the output folder

---

### 1.1. Generate Dynamic Test Cases Folder Name

**CRITICAL:** Create a timestamped folder for test case outputs using the approved nomenclature.

**Nomenclature Pattern:**
```
testcases-{tipo}-{alcance}-{fecha}-{hora}
```

**Build folder name components:**

1. **{tipo}** - Extract from `testGenerationMode`:
   - If `testGenerationMode === "ui-functional"` → `tipo = "ui"`
   - If `testGenerationMode === "backend-api"` → `tipo = "backend"`

2. **{alcance}** - Extract from `epicSelection` and `selectedEpics`:
   - If `epicSelection === "all"` → `alcance = "all-epics"`
   - If `epicSelection === "single"` → `alcance = "epic-{epic_number}"` (e.g., "epic-3")
   - If `epicSelection === "range"` → `alcance = "epics-{first}-to-{last}"` (e.g., "epics-1-to-5")

3. **{fecha}** - Current date in format `YYYYMMDD`:
   - Example: `20260129` for January 29, 2026

4. **{hora}** - Current time in format `HHMMSS`:
   - Example: `143025` for 14:30:25

**Example folder names:**
```
testcases-ui-all-epics-20260129-143025
testcases-backend-epics-1-to-5-20260129-143025
testcases-ui-epic-3-20260129-143025
```

**Generate timestamp and folder name:**
```
current_datetime = get_current_datetime()
fecha = current_datetime.strftime("%Y%m%d")  # e.g., "20260129"
hora = current_datetime.strftime("%H%M%S")    # e.g., "143025"

# Build tipo
tipo = "ui" if testGenerationMode == "ui-functional" else "backend"

# Build alcance
if epicSelection == "all":
    alcance = "all-epics"
elif epicSelection == "single":
    alcance = f"epic-{selectedEpics[0]}"
elif epicSelection == "range":
    alcance = f"epics-{min(selectedEpics)}-to-{max(selectedEpics)}"

# Construct folder name
folder_name = f"testcases-{tipo}-{alcance}-{fecha}-{hora}"

# Full folder path
testcases_folder = f"{{implementation_artifacts}}/traceability-artifacts/{folder_name}"
```

**Update file paths to use dynamic folder:**
```yaml
testCasesFile: "{testcases_folder}/test-cases.csv"
testCasesSummaryFile: "{testcases_folder}/test-cases-summary.md"
```

**Create the folder using Bash:**
```bash
mkdir -p {testcases_folder}
```

Display:
"🤖 Iniciando GENERACIÓN AUTOMÁTICA de casos de prueba para **{projectName}**...

📊 Jerarquía de trazabilidad cargada:
- {totalFRs} Requerimientos Funcionales
- {totalEpics} Épicas
- {totalStories} Historias de Usuario
- {totalTasks} Tareas (si disponibles)

🎯 **Modo de generación:** {if testGenerationMode === "ui-functional": "UI Funcional (para usuarios no técnicos)" else: "Backend API (validación de endpoints)"}

📁 **Carpeta de salida:** `{testcases_folder}`
   - Tipo: {tipo}
   - Alcance: {alcance}
   - Timestamp: {fecha}-{hora}

🔧 El workflow generará automáticamente casos de prueba para cada FR/Epic encontrado siguiendo las guías de calidad del modo seleccionado.

Procediendo con la generación automática..."

---

### 1.5. Load Test Generation Quality Guidelines

**CRITICAL:** Before generating test cases, understand the quality guidelines for the selected mode.

The workflow has **BUILT-IN QUALITY STANDARDS** for each mode to ensure generated test cases meet professional QA standards.

---

#### MODE 1: UI FUNCTIONAL TESTING GUIDELINES

**When `testGenerationMode === "ui-functional"`:**

**Audiencia Objetivo:** Testers manuales o usuarios con formación NO técnica que ejecutarán las pruebas desde la interfaz de usuario.

**⛔ PROHIBICIONES ABSOLUTAS - NEVER include in test cases:**
- Términos técnicos de desarrollo: callbacks, hooks, estados del navegador, localStorage, sessionStorage
- Referencias a código: funciones, métodos, clases, componentes
- Eventos técnicos: onChange, onSave, onSubmit, onClick (como términos técnicos)
- Respuestas de API: códigos HTTP, JSON, payloads, headers
- Librerías o frameworks: React, Vue, Angular, Redux
- Conceptos de estado: re-render, state management, props
- Consola del navegador o herramientas de desarrollo
- Selectores CSS, IDs de elementos, o XPath

**✅ LENGUAJE PERMITIDO - Use functional language:**
- Verbos de acción del usuario: hacer clic, escribir, seleccionar, navegar, buscar, abrir, cerrar, desplazar
- Elementos visuales: botón, campo de texto, menú desplegable, casilla de verificación, enlace, mensaje de error, ventana emergente
- Estados visibles: aparece, desaparece, se muestra, cambia de color, está habilitado, está deshabilitado

**Estructura de pasos:**
```
1. Abrir [URL o sección de la aplicación]
2. Hacer clic en el botón [nombre visible del botón]
3. Escribir "[texto]" en el campo [nombre del campo]
4. Seleccionar "[opción]" del menú [nombre del menú]
5. Verificar que aparece [elemento/mensaje esperado]
```

**Ejemplo CORRECTO (Modo UI):**
```
Título: Crear nueva orden de compra con múltiples productos
Descripción: Verificar que el usuario puede crear una orden agregando varios productos, aplicando descuentos y completando el proceso hasta la confirmación
Precondiciones:
• Usuario con rol Vendedor activo en el sistema
• Al menos 3 productos disponibles en inventario
• Cliente "Comercial ABC" registrado

Pasos:
1. Iniciar sesión con usuario vendedor
2. Ir al menú Ventas → Nueva Orden
3. Buscar y seleccionar cliente "Comercial ABC"
4. En la sección de productos, escribir "PROD001" y presionar Enter
5. Cambiar la cantidad a 5 unidades
6. Repetir pasos 4-5 para agregar 2 productos más
7. Hacer clic en "Aplicar descuento" y seleccionar "10% Mayorista"
8. Verificar que el total se actualiza con el descuento
9. Hacer clic en "Confirmar Orden"
10. Verificar el mensaje de confirmación con número de orden

Resultados Esperados:
1. Acceso exitoso al sistema
2. Pantalla de nueva orden visible
3. Datos del cliente aparecen en el formulario
4-6. Cada producto aparece en la lista con precio unitario
7. Descuento del 10% aplicado
8. Total refleja: subtotal - 10%
9. Orden procesada sin errores
10. Mensaje "Orden #[número] creada exitosamente" visible
```

**Ejemplo INCORRECTO (NO hacer esto):**
```
❌ Pasos:
1. Hacer clic en el botón que dispara el callback handleSubmit()
2. Verificar que el estado del componente cambia a "loading"
3. Esperar la respuesta HTTP 200 del endpoint /api/orders
4. Verificar que el localStorage contiene el token actualizado
```

**Ejemplo CORRECTO (versión corregida):**
```
✅ Pasos:
1. Hacer clic en el botón "Enviar Orden"
2. Verificar que aparece el indicador de carga
3. Esperar a que aparezca la pantalla de confirmación
4. Verificar que el sistema no solicita iniciar sesión nuevamente
```

---

#### MODE 2: BACKEND API TESTING GUIDELINES

**When `testGenerationMode === "backend-api"`:**

**Audiencia Objetivo:** Ingenieros QA que validan APIs usando herramientas como Postman, Insomnia, o scripts de prueba. NO tocarán código fuente.

**Enfoque de las Pruebas:**
1. **Casos Positivos:** Verificar que el endpoint cumple su función con datos válidos
2. **Casos Negativos:** Evaluar resiliencia enviando datos incorrectos, incompletos o maliciosos

**⛔ PROHIBICIONES:**
- Código fuente del backend o instrucciones para modificarlo
- Detalles de implementación interna (ORM, queries, servicios)
- Configuración de servidores o infraestructura
- Debugging de código o análisis de logs de aplicación

**✅ QUÉ SÍ INCLUIR:**
- Endpoint (método + ruta)
- Headers necesarios (especialmente autenticación)
- Body de ejemplo (JSON)
- Respuesta esperada (código HTTP + estructura de respuesta)

**Categorías de casos a generar:**

| Categoría | Descripción |
|-----------|-------------|
| **Flujo exitoso** | Datos válidos, respuesta esperada |
| **Validación de campos** | Campos requeridos faltantes, tipos incorrectos |
| **Límites de datos** | Strings muy largos, números fuera de rango |
| **Autenticación** | Sin token, token expirado, token inválido |
| **Autorización** | Usuario sin permisos para el recurso |
| **Datos inexistentes** | IDs que no existen en el sistema |
| **Casos borde** | Arrays vacíos, valores null, caracteres especiales |

**Plantilla para Caso de Endpoint:**
```
Título: [Nombre descriptivo]
Descripción: [Qué se está validando] - Tipo: Positivo/Negativo
Endpoint: [MÉTODO] /ruta/del/endpoint

Precondiciones:
• Endpoint disponible
• Token válido de pruebas (si requiere auth)
• Datos de prueba configurados

Pasos:
1. Configurar headers: Authorization: Bearer {{token}}, Content-Type: application/json
2. Preparar body: [JSON structure]
3. Enviar petición [MÉTODO] a [endpoint]
4. Capturar respuesta

Resultados Esperados:
• Status: [código HTTP]
• Body contiene: [estructura esperada]
• [Criterio específico de validación]
```

**Ejemplo Completo - Suite de Endpoint:**

**TC-API-001: Crear usuario exitosamente**
```
Tipo: Positivo
Endpoint: POST /api/v1/users
Descripción: Validar creación exitosa de usuario con todos los campos requeridos

Precondiciones:
• Endpoint /api/v1/users disponible
• Token de admin válido
• Email "nuevo.usuario@ejemplo.com" no existe en sistema

Pasos:
1. Configurar headers:
   - Authorization: Bearer {{admin_token}}
   - Content-Type: application/json
2. Preparar body:
   {
     "email": "nuevo.usuario@ejemplo.com",
     "nombre": "Juan Pérez",
     "rol": "vendedor",
     "activo": true
   }
3. Enviar POST a /api/v1/users
4. Capturar respuesta

Resultados Esperados:
• Status: 201 Created
• Body contiene:
  {
    "success": true,
    "data": {
      "id": "[uuid-generado]",
      "email": "nuevo.usuario@ejemplo.com",
      "nombre": "Juan Pérez",
      "rol": "vendedor"
    }
  }
• Usuario creado y retornado con ID único
```

**TC-API-002: Crear usuario sin email (validación)**
```
Tipo: Negativo - Validación
Endpoint: POST /api/v1/users
Descripción: Validar que API rechaza petición cuando falta campo email requerido

Precondiciones:
• Endpoint /api/v1/users disponible
• Token de admin válido

Pasos:
1. Configurar headers:
   - Authorization: Bearer {{admin_token}}
   - Content-Type: application/json
2. Preparar body SIN campo email:
   {
     "nombre": "Juan Pérez",
     "rol": "vendedor"
   }
3. Enviar POST a /api/v1/users
4. Capturar respuesta

Resultados Esperados:
• Status: 400 Bad Request
• Body contiene:
  {
    "success": false,
    "error": "El campo email es requerido"
  }
• API rechaza la petición con mensaje claro de validación
```

**TC-API-003: Crear usuario sin autenticación (seguridad)**
```
Tipo: Negativo - Seguridad
Endpoint: POST /api/v1/users
Descripción: Validar que API rechaza peticiones sin token de autenticación

Precondiciones:
• Endpoint /api/v1/users disponible

Pasos:
1. NO incluir header Authorization
2. Configurar header Content-Type: application/json
3. Preparar body válido:
   {
     "email": "test@ejemplo.com",
     "nombre": "Test",
     "rol": "vendedor"
   }
4. Enviar POST a /api/v1/users
5. Capturar respuesta

Resultados Esperados:
• Status: 401 Unauthorized
• Body contiene:
  {
    "success": false,
    "error": "Token de autenticación requerido"
  }
• API rechaza peticiones no autenticadas
```

---

#### REGLAS GENERALES PARA AMBOS MODOS

1. **Un caso = Un escenario específico:** No mezclar múltiples flujos en un solo caso
2. **Precondiciones claras:** Todo lo que debe existir ANTES de ejecutar
3. **Pasos atómicos:** Cada paso es una sola acción verificable
4. **Resultados mapeados:** Cada paso importante tiene su resultado esperado
5. **Independencia:** Los casos no deben depender del orden de ejecución
6. **Reproducibilidad:** Cualquier persona debe poder ejecutar el caso y obtener el mismo resultado

---

#### CHECKLIST DE VALIDACIÓN

**Para Modo UI (`ui-functional`):**
- [ ] ¿Todos los pasos usan lenguaje que un usuario no técnico entiende?
- [ ] ¿Se describen elementos por su texto visible, no por selectores técnicos?
- [ ] ¿Los resultados esperados son verificables visualmente?
- [ ] ¿No hay menciones a código, APIs, o estados internos?

**Para Modo Backend (`backend-api`):**
- [ ] ¿Cada caso tiene endpoint, método, y respuesta esperada?
- [ ] ¿Se incluyen casos negativos (validación, auth, datos inválidos)?
- [ ] ¿Los ejemplos de JSON son válidos y copiables?
- [ ] ¿No se requiere acceso al código fuente para ejecutar las pruebas?

---

**These guidelines are NOW LOADED and will be applied during test case generation in section 2.**

---

### 2. Generate Test Cases Automatically from FRs/Epics

**🎯 CRITICAL - TEST LEVEL FOCUS:**
This workflow generates **FUNCTIONAL-LEVEL tests and above** (Funcional, Integración, E2E).
- ✅ DO generate: Acceptance tests, feature tests, integration tests, end-to-end tests
- ❌ DO NOT generate: Unit tests, component tests, code-level tests

**Test Types Generated:**
- **Funcional:** Validates complete features from user perspective
- **Integración:** Validates interaction between components/modules
- **E2E:** Validates complete user journeys across the system

**🚨 CRITICAL - APPLY MODE-SPECIFIC GUIDELINES:**

**If `testGenerationMode === "ui-functional"`:**
- ✅ Follow UI Functional Testing Guidelines from section 1.5
- ✅ Use ONLY functional, user-visible language
- ✅ Describe actions by visible button/field names
- ✅ Results must be visually verifiable
- ❌ NEVER use technical terms (callbacks, APIs, localStorage, etc.)
- ❌ NEVER reference code or internal states

**If `testGenerationMode === "backend-api"`:**
- ✅ Follow Backend API Testing Guidelines from section 1.5
- ✅ Include endpoint, method, headers, body structure
- ✅ Generate positive AND negative test cases
- ✅ Include expected HTTP status codes
- ✅ Provide JSON examples for request/response
- ✅ Cover categories: validation, auth, authorization, edge cases

**Validation:** After generating each test case, validate against the checklist in section 1.5 for the selected mode.

---

**FOR EACH FR in the project:**

1. Analyze the FR description and acceptance criteria
2. Generate appropriate test cases:
   - **Positive test case:** Validate the requirement works as expected
   - **Negative test case:** Validate error handling
   - **Edge case test:** Validate boundary conditions

**FOR EACH Epic in the project:**

1. Analyze the Epic scope and acceptance criteria
2. Generate appropriate test cases by type:

   **Functional tests:**
   - **Happy path:** Validate primary flow works
   - **Alternative flows:** Validate secondary scenarios
   - **Validation tests:** Validate input/output constraints

   **Integration tests:**
   - **Component integration:** Validate Epic components work together
   - **Data flow:** Validate data propagation between modules

   **E2E tests (if applicable):**
   - **Complete workflows:** Validate end-to-end Epic user journeys
   - **Cross-module flows:** Validate interaction across system boundaries

**Test Case Generation Template:**

For each FR/Epic, generate test cases following this format:

**Base CSV Structure (13 columns):**
```
Epic ID: EPIC-[MODULE]-[YEAR]-[NUMBER] (e.g., EPIC-FACT-2025-01)
Test Case ID: TC-[MODULE]-### (e.g., TC-FACT-001)
Title: Clear, descriptive test case name
Description: What functionality is being tested
Preconditions: Bulleted list of what must be true before test (use •)
Steps: Numbered steps to execute (start with verbs)
Expected Results: Numbered results that should happen (start with verbs)
Type: Funcional, Integración, or E2E
Execution Date: DD/MM/YYYY HH:MM (leave empty for now)
Status: Not Started
Defect ID: Empty initially
Failure Description: Empty initially
Notes: Any additional observations
```

**MODE-SPECIFIC CONTENT GENERATION:**

**If `testGenerationMode === "ui-functional"`:**
```
Title: [Action-oriented, user-visible description]
Example: "Crear factura con múltiples productos y descuento"
NOT: "Validar callback onSubmit del componente Factura"

Description: [What the user wants to accomplish]
Example: "Verificar que el usuario puede crear una factura agregando varios productos, aplicando descuentos, y guardando correctamente"
NOT: "Validar que el endpoint POST /api/facturas retorna 201"

Preconditions: [User-visible states]
Example:
• Usuario con rol Facturador activo en el sistema
• Cliente "ABC Corp" registrado
• Al menos 5 productos en inventario
NOT:
• Token JWT válido en localStorage
• Estado del reducer facturas inicializado
• API /api/productos respondiendo 200

Steps: [User actions only]
Example:
1. Iniciar sesión con usuario facturador
2. Ir al menú Ventas → Nueva Factura
3. Buscar y seleccionar cliente "ABC Corp"
4. Hacer clic en "Agregar Producto"
5. Escribir "PROD001" en el campo Código
NOT:
1. Llamar a handleLogin() con credentials
2. Verificar que el estado cambia a "authenticated"
3. Hacer fetch a /api/clientes
4. Parsear JSON response

Expected Results: [Visible outcomes]
Example:
1. Pantalla de facturas visible
2. Cliente seleccionado aparece en formulario
3. Producto agregado a la lista con precio
4. Total calculado correctamente
NOT:
1. HTTP 200 retornado
2. localStorage actualizado con nuevo token
3. Component re-renderizado con nuevo state
```

**If `testGenerationMode === "backend-api"`:**
```
Title: [Endpoint + scenario description]
Example: "POST /api/facturas - Crear factura exitosamente"
Example: "POST /api/facturas - Validar campo cliente_id requerido"

Description: [What API behavior is being validated + Type]
Example: "Validar que el endpoint crea correctamente una factura con todos los campos requeridos - Tipo: Positivo"
Example: "Validar que el endpoint rechaza peticiones sin campo cliente_id - Tipo: Negativo - Validación"

Preconditions: [API-testable conditions]
Example:
• Endpoint /api/facturas disponible
• Token de admin válido para pruebas
• Cliente con ID "CLI-001" existe en base de datos
• Producto con código "PROD001" existe en inventario

Steps: [API testing steps with actual HTTP details]
Example:
1. Configurar headers:
   - Authorization: Bearer {{admin_token}}
   - Content-Type: application/json
2. Preparar body JSON:
   {
     "cliente_id": "CLI-001",
     "productos": [{"codigo": "PROD001", "cantidad": 5}],
     "descuento": 10
   }
3. Enviar POST a /api/v1/facturas
4. Capturar respuesta y validar estructura

Expected Results: [HTTP response details]
Example:
• Status: 201 Created
• Body contiene:
  {
    "success": true,
    "data": {
      "factura_id": "[uuid]",
      "numero": "FAC-2026-0001",
      "cliente_id": "CLI-001",
      "total": 4500,
      "estado": "Generada"
    }
  }
• Factura creada en base de datos
• Número secuencial asignado correctamente

For NEGATIVE cases (Backend API mode), also generate:
- Validation test (missing required field)
- Auth test (no token)
- Authorization test (insufficient permissions)
- Edge case test (invalid data types, boundary values)
```

**Example Auto-Generation:**

For FR-001 in Epic EPIC-FACT-2025-01: "El sistema debe permitir al usuario crear un nuevo ítem"

**If `testGenerationMode === "ui-functional"`:**
Generate:
- TC-FACT-001: Crear ítem con datos completos desde formulario
  - Title: "Crear ítem con código, nombre y descripción válidos"
  - Steps use: "Hacer clic en...", "Escribir en el campo...", "Seleccionar..."
  - Results use: "Aparece mensaje...", "Se muestra...", "El ítem se visualiza..."

- TC-FACT-002: Intentar guardar ítem sin código (campo obligatorio)
  - Title: "Validar mensaje de error cuando falta código de ítem"
  - Steps use: "Dejar campo Código vacío", "Hacer clic en Guardar"
  - Results use: "Aparece mensaje de error 'El código es obligatorio'"

- TC-FACT-003: Validar límite de 200 caracteres en descripción
  - Title: "Verificar que descripción no acepta más de 200 caracteres"
  - Steps use: "Escribir 201 caracteres en descripción", "Intentar guardar"
  - Results use: "Campo muestra solo 200 caracteres", "Mensaje indica límite"

**If `testGenerationMode === "backend-api"`:**
Generate:
- TC-API-001: POST /api/items - Crear ítem exitosamente
  - Title: "POST /api/items - Crear ítem con todos los campos válidos"
  - Preconditions: "Endpoint disponible", "Token válido"
  - Steps include: Full HTTP request with headers and JSON body
  - Results include: "Status: 201", JSON response structure

- TC-API-002: POST /api/items - Validar campo codigo requerido
  - Title: "POST /api/items - Rechazar petición sin campo codigo"
  - Type: Negativo - Validación
  - Body: JSON sin campo "codigo"
  - Expected: "Status: 400", error message

- TC-API-003: POST /api/items - Validar sin autenticación
  - Title: "POST /api/items - Rechazar petición sin token"
  - Type: Negativo - Seguridad
  - Headers: Sin Authorization
  - Expected: "Status: 401 Unauthorized"

- TC-API-004: POST /api/items - Validar límite descripción 200 caracteres
  - Title: "POST /api/items - Rechazar descripción > 200 caracteres"
  - Type: Negativo - Validación
  - Body: JSON con descripción de 201 caracteres
  - Expected: "Status: 400", validation error

Display progress:
"🔧 Generando casos de prueba automáticamente según modo {testGenerationMode}...

{if testGenerationMode === "ui-functional":
  "📱 Generando casos funcionales para usuarios no técnicos..."
else:
  "🔌 Generando casos de validación de endpoints API..."
}

✅ FR-001: {count} casos generados
✅ FR-002: {count} casos generados
✅ Epic 1: {count} casos de integración generados
✅ Epic 2: {count} casos funcionales generados
...

📊 Total de casos generados: {total_count}"

---

### 3. Populate test-cases.csv (REQUIRED - Windows-compatible approach)

**🚨 CRITICAL WINDOWS COMPATIBILITY RULE:**
- ✅ **ALWAYS use Write tool** for creating/modifying files
- ❌ **NEVER use bash commands** (cat, echo, sed, awk, >>, etc.)
- ❌ **NEVER use heredocs** (cat <<EOF, cat <<'EOF')
- ✅ **Build complete content in memory**, then write once with Write tool

**Why this matters:**
- Bash commands fail with special characters (á, é, í, ó, ú, ñ)
- Windows path handling breaks with bash
- Heredocs have quote escaping issues
- Write tool handles all Windows file operations correctly

**Windows-Compatible CSV Writing Strategy:**

1. **Read the template structure:**
   - Read {testCaseTemplateFile} to get header rows (rows 1-11)
   - Store header content

2. **Build complete CSV content in memory:**

   Start with header rows 1-11, then for EACH generated test case, create a CSV row:

   **CSV Row Format (13 columns, comma-separated):**
   ```
   EPIC-XXX-####,TC-XXX-###,Título,Descripción Completa,Precondiciones,Pasos de Ejecución,Resultados Esperados,Tipo prueba,Fecha Ejecución,Estado,ID Defecto,Descripción Fallo,Notas
   ```

   **IMPORTANT CSV Formatting Rules for Windows:**
   - Wrap ALL fields in double quotes: "value"
   - Escape internal double quotes by doubling them: "He said ""hello"""
   - For multi-line content (preconditions/steps/results), use newlines directly within quotes
   - Use only standard ASCII characters or UTF-8 encoding
   - Example row:
     ```csv
     "EPIC-FACT-2025-01","TC-FACT-001","Login exitoso","Validar login correcto del usuario","• Usuario registrado
     • Sistema disponible","1. Abrir aplicación
     2. Ingresar credenciales
     3. Click en Login","1. Usuario autenticado
     2. Redirigido a dashboard","Funcional","23/01/2026 10:00","Not Started","","",""
     ```

3. **Build the full CSV string step by step:**

   **Step 3a:** Read template header
   ```
   header_content = Read({testCaseTemplateFile})
   # This gives you rows 1-11 with structure
   ```

   **Step 3b:** For each test case, create a row:
   ```python
   # Pseudocode for clarity
   csv_rows = []

   for test_case in generated_test_cases:
       # Escape quotes: replace " with ""
       def escape_csv(text):
           return text.replace('"', '""')

       # Format multi-line fields with actual newlines
       preconditions = "\n".join(test_case.preconditions)
       steps = "\n".join(test_case.steps)
       results = "\n".join(test_case.expected_results)

       # Create row with ALL 13 columns wrapped in quotes
       row = f'"{test_case.epic_id}","{test_case.id}","{escape_csv(test_case.title)}","{escape_csv(test_case.description)}","{escape_csv(preconditions)}","{escape_csv(steps)}","{escape_csv(results)}","{test_case.type}","","Not Started","","",""'

       csv_rows.append(row)

   # Combine everything
   complete_csv = header_content + "\n" + "\n".join(csv_rows)
   ```

   **Step 3c:** Verify CSV structure
   - Header: 11 rows (rows 1-10 metadata, row 11 column headers)
   - Data: N rows (one per test case, starting from row 12)
   - Each row: exactly 13 comma-separated fields
   - All fields wrapped in double quotes

4. **Write the complete CSV using Write tool (CRITICAL - NOT BASH):**

   **Use this exact approach:**
   ```
   Write tool:
   - file_path: {testCasesFile}
   - content: {complete_csv_string}
   ```

   **DO NOT use bash commands like:**
   - ❌ cat > file.csv
   - ❌ echo >> file.csv
   - ❌ sed, awk, or any bash text manipulation

   **ONLY use Write tool - it handles Windows correctly**

**Display after writing:**
"✅ Archivo test-cases.csv poblado exitosamente con {total_count} casos de prueba

📄 Ubicación: `{testCasesFile}`

✅ **Formato:** CSV estándar con 13 columnas
✅ **Encoding:** UTF-8"

**If Write tool fails, troubleshoot:**

1. **Check content length:**
   - If CSV string is very large (>1MB), split into chunks
   - Write header first, then append rows in batches

2. **Check for problematic characters:**
   - Verify all quotes are properly escaped (" → "")
   - Check for null bytes or control characters
   - Verify UTF-8 encoding

3. **Try simplified approach:**
   - Keep all 13 columns but simplify multi-line fields to single line
   - Remove special characters temporarily
   - Try without bullet points in preconditions

4. **If all attempts fail:**
   - Document failure reason clearly
   - Ensure test-cases-summary.md has ALL information
   - Display message:
     "⚠️ El archivo CSV no pudo ser creado debido a: {error_reason}
     ✅ Toda la información está en test-cases-summary.md
     Continuando con el workflow..."

**CRITICAL:** Never stop the workflow due to CSV issues - always continue to create test-cases-summary.md

---

### 4. Create test-cases-summary.md (CRITICAL OUTPUT)

**⚠️ CRITICAL:** This file is the PRIMARY output and MUST contain COMPLETE test case information (not just a summary). Since CSV may fail in Windows, this file must have ALL details.

Using template {testCaseSummaryTemplate}:

1. **Load template**
2. **Replace placeholders:**
   - {{project_name}} → actual project name
   - {{date}} → current date

3. **Populate sections with COMPLETE information:**

   **Estadísticas:**
   ```markdown
   - Total de Casos de Prueba: {total_count}
   - Por Tipo:
     - Funcional: {functional_count}
     - Integración: {integration_count}
     - E2E: {e2e_count}
   - Por Épica:
     {for each Epic: - Epic {number}: {count} casos}
   ```

   **Casos de Prueba por Tipo (DETALLES COMPLETOS):**
   ```markdown
   ### Funcional

   #### Suite: {Suite Name}

   ##### TC001: {Test Title}
   **Descripción:** {Full description}
   **Tipo:** Funcional
   **Modo:** Manual/Automatizada
   **Epic:** {Epic reference}
   **Precondiciones:**
   1. {precondition 1}
   2. {precondition 2}

   **Pasos:**
   1. {step 1}
   2. {step 2}

   **Resultados Esperados:**
   1. {expected result 1}
   2. {expected result 2}

   **Estado:** No iniciada

   ---

   ##### TC002: {Test Title}
   {repeat with full details}

   ### Integración

   {Same structure for integration tests}

   ### E2E

   {Same structure for E2E tests}
   ```

   **Tabla Resumen (Referencia Rápida):**
   ```markdown
   | ID | Título | Tipo | Suite | Épica | Estado |
   |----|--------|------|-------|-------|--------|
   | TC001 | ... | Funcional | Suite Name | Epic 1 | No iniciada |
   | TC002 | ... | Integración | Suite Name | Epic 2 | No iniciada |
   ```

4. **Write to {testCasesSummaryFile}**

Display:
"✅ **Resumen COMPLETO de casos de prueba creado**

📄 **Ubicación:** `{testCasesSummaryFile}`

📊 **Contenido COMPLETO:**
- ✅ {total_count} casos de prueba completamente documentados
- ✅ Todos los detalles: Precondiciones, Pasos, Resultados Esperados
- ✅ Organizado por Tipo de Prueba y Suite
- ✅ Tabla resumen para referencia rápida"

---

### 5. Update workflow progress

**IMPORTANT:** Do NOT add test case information to traceability-map.md.
The traceability map contains ONLY the implementation hierarchy (PRD→FR→Epic→Story→Task), not test information.

**Only update frontmatter of step tracking:**

Read {traceabilityMapFile} frontmatter and update:

```yaml
stepsCompleted: [1, 2, 3]
testcasesFolderPath: "{testcases_folder}"  # Store for step 5 reference
testCasesOutputFiles:
  csv: "{testCasesFile}"
  summary: "{testCasesSummaryFile}"
```

**Do NOT add sections 4, 5, 6, or 7 to traceability-map.md** - those are removed. The file only contains sections 1-3 (pure traceability).

---

### 6. Present Summary to User

Display:
"✅ **Generación Automática de Casos de Prueba Completada**

📊 **Casos de Prueba Generados:**
- Total: {total_count} casos
- Funcionales: {functional_count}
- Integración: {integration_count}
- E2E: {e2e_count}

📁 **Carpeta de Salida:**
`{testcases_folder}`

📋 **Archivos Creados:**
1. ✅ `test-cases.csv` - Poblado con {total_count} casos
2. ✅ `test-cases-summary.md` - Resumen completo creado

📈 **Cobertura de Pruebas:**
- FRs cubiertos: {frs_with_tests}/{total_frs} ({percentage}%)
- Épicas cubiertas: {epics_with_tests}/{total_epics} ({percentage}%)

💡 **Nota:** Los archivos están organizados en una carpeta con timestamp que indica el tipo de pruebas ({tipo}), alcance ({alcance}), y momento de generación.

¿Todo se ve correcto?"

**Wait for user confirmation.**

---

### 7. Present MENU OPTIONS

Display: **Confirma para [C] continuar:**

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- User can chat or ask questions - always respond and then end with display again of the menu option

#### Menu Handling Logic:

- IF C: Save all to files, update frontmatter with `stepsCompleted: [1, 2, 3]`, only then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#7-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected, all information is saved, and frontmatter is updated with `stepsCompleted: [1, 2, 3]`, will you then load, read entire file, then execute {nextStepFile} to generate epic test plans.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Test cases generated automatically from all FRs/Epics/Stories
- test-cases.csv populated successfully using Write tool (REQUIRED)
- test-cases-summary.md created with complete summary (CRITICAL - contains all test case data)
- Workflow progress updated (stepsCompleted: [1, 2, 3])
- All test cases mapped to FRs/Epics/Stories
- Coverage metrics calculated correctly
- User confirmed generation is complete

**IMPORTANT:** traceability-map.md is NOT updated in this step. It contains only pure traceability (PRD→FR→Epic→Story→Task), not test information.

### ⚠️ ACCEPTABLE (with workaround):

- If Write tool fails to populate test-cases.csv:
  - Try simplified CSV with essential columns only
  - If still fails, document in test-cases-summary.md that CSV population failed
  - Continue with workflow (test-cases-summary.md has all information)
  - Display clear message to user about CSV status

### ❌ SYSTEM FAILURE:

- No test cases generated at all
- test-cases-summary.md not created or empty
- Test cases not mapped to requirements
- Asking user for options instead of generating automatically
- Proceeding to next step without user confirmation
- Using bash commands instead of Write tool for CSV (causes Windows failures)
- Not attempting to populate CSV at all
- Adding test information to traceability-map.md (WRONG - that file is for implementation hierarchy only)

**Master Rule:** The workflow MUST:
1. Generate test cases automatically from FRs/Epics/Stories
2. Attempt to populate test-cases.csv using Write tool (NOT bash)
3. Create complete test-cases-summary.md with ALL test case details
4. Continue workflow even if CSV population fails (summary.md is sufficient)
5. NOT add test information to traceability-map.md (that's for implementation traceability only)
