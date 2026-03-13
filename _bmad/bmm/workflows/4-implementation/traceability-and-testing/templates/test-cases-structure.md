# Test Cases File Structure Documentation

**Version:** 5.0
**Last Updated:** 2026-01-19
**Purpose:** Complete reference for test case CSV/Excel file format used in traceability workflow

---

## Overview

This document defines the standard structure for test case files used in the `traceability-and-testing` workflow. This structure is based on the Siesa test case format and serves as the canonical reference for all projects.

**Test Scope:** This workflow handles **functional-level testing and above** - validating that the system meets functional requirements and user expectations. It does NOT handle unit tests or component-level tests.

**Supported Test Levels:**
- ✅ **Funcional:** Feature validation from user perspective
- ✅ **Integración:** Component/module interaction validation
- ✅ **E2E:** Complete user journey validation
- ❌ **Unit tests:** Code-level testing (OUT OF SCOPE)

---

## Test Generation Modes

This workflow supports **TWO MODES** for test case generation, each optimized for different project types and target audiences:

### Mode 1: UI Functional Testing (`ui-functional`)

**Target Audience:** Manual testers or users with NO technical background who will execute tests from the user interface.

**Characteristics:**
- Test cases written in **functional, user-visible language**
- Steps describe **actions the user can see and perform**
- Results describe **visual outcomes** the user can verify
- **NO technical terms**: No code, APIs, callbacks, localStorage, HTTP codes, etc.

**Language Guidelines:**
- ✅ USE: "Hacer clic en el botón Guardar", "Aparece mensaje de confirmación", "El campo Nombre está habilitado"
- ❌ NEVER: "Llamar handleSubmit()", "Verificar localStorage", "Esperar HTTP 200", "State cambia a loading"

**Example Test Case (UI Mode):**
```
Title: Crear usuario con datos completos
Description: Verificar que el usuario puede crear un nuevo usuario ingresando todos los campos requeridos y guardando exitosamente

Preconditions:
• Usuario con rol Administrador activo
• Formulario de usuarios accesible

Steps:
1. Ir al menú Configuración → Usuarios
2. Hacer clic en el botón "Nuevo Usuario"
3. Escribir "Juan Pérez" en el campo Nombre
4. Escribir "juan.perez@empresa.com" en el campo Email
5. Seleccionar "Vendedor" del menú desplegable Rol
6. Hacer clic en el botón "Guardar"

Expected Results:
1. Se abre la pantalla de usuarios
2. Formulario de nuevo usuario visible
3. Nombre ingresado correctamente
4. Email ingresado correctamente
5. Rol seleccionado visible
6. Mensaje "Usuario creado exitosamente" aparece
7. Nuevo usuario visible en la lista de usuarios
```

---

### Mode 2: Backend API Testing (`backend-api`)

**Target Audience:** QA engineers who validate APIs using tools like Postman, Insomnia, or test scripts. They do NOT touch source code.

**Characteristics:**
- Test cases include **endpoint, method, headers, body structure**
- Focus on **request/response validation**
- Include **positive AND negative test cases**
- Specify **expected HTTP status codes**
- Provide **JSON examples** for request and response

**Test Categories Generated:**
- ✅ **Happy path:** Valid data, expected response
- ✅ **Validation:** Missing required fields, incorrect types
- ✅ **Authentication:** No token, expired token, invalid token
- ✅ **Authorization:** User without permissions
- ✅ **Edge cases:** Empty arrays, null values, boundary conditions

**Example Test Case (API Mode):**
```
Title: POST /api/users - Crear usuario exitosamente
Description: Validar que el endpoint crea correctamente un usuario con todos los campos requeridos - Tipo: Positivo

Preconditions:
• Endpoint /api/v1/users disponible
• Token de admin válido
• Email "juan.perez@empresa.com" no existe en sistema

Steps:
1. Configurar headers:
   - Authorization: Bearer {{admin_token}}
   - Content-Type: application/json
2. Preparar body JSON:
   {
     "nombre": "Juan Pérez",
     "email": "juan.perez@empresa.com",
     "rol": "vendedor",
     "activo": true
   }
3. Enviar POST a /api/v1/users
4. Capturar respuesta

Expected Results:
• Status: 201 Created
• Body contiene:
  {
    "success": true,
    "data": {
      "id": "[uuid-generado]",
      "nombre": "Juan Pérez",
      "email": "juan.perez@empresa.com",
      "rol": "vendedor",
      "activo": true,
      "created_at": "[timestamp]"
    }
  }
• Usuario creado en base de datos
• ID único generado automáticamente
```

**Example Negative Test Case (API Mode):**
```
Title: POST /api/users - Validar campo email requerido
Description: Validar que el endpoint rechaza petición cuando falta el campo email - Tipo: Negativo - Validación

Preconditions:
• Endpoint /api/v1/users disponible
• Token de admin válido

Steps:
1. Configurar headers:
   - Authorization: Bearer {{admin_token}}
   - Content-Type: application/json
2. Preparar body JSON SIN campo email:
   {
     "nombre": "Juan Pérez",
     "rol": "vendedor"
   }
3. Enviar POST a /api/v1/users
4. Capturar respuesta

Expected Results:
• Status: 400 Bad Request
• Body contiene:
  {
    "success": false,
    "error": "El campo email es requerido",
    "field": "email"
  }
• Usuario NO creado en base de datos
• Mensaje de error claro y específico
```

---

### Mode Selection in Workflow

The mode is selected during **Step 1: Initialization** and stored in frontmatter:

```yaml
testGenerationMode: "ui-functional" | "backend-api"
```

This mode determines:
- **Language style** used in test case titles, descriptions, steps
- **Level of technical detail** included
- **Type of validation** performed
- **Target audience** for the test cases

---

## File Format Support

The workflow supports two formats:
- **Excel (.xlsm)** - Original format with macros
- **CSV (.csv)** - Simplified format, faster to process

**Recommendation:** Use CSV for better performance and simpler parsing.

---

## File Structure

### A. Header Section (Rows 1-10)

Contains metadata and document formatting. These rows are NOT data rows.

```
Row 1-4:   Document title and approval signatures
Row 5-6:   Document code and version information
Row 7-8:   Application metadata
Row 9-10:  Empty separator rows
```

### B. Column Headers (Row 11)

The actual column names for test cases. This is THE definitive row for column structure.

### C. Test Case Data (Row 12+)

Actual test cases start from row 12 onwards.

---

## Column Structure (Row 11)

| # | Column Name | Description | Format/Values |
|---|-------------|-------------|---------------|
| 1 | **ID Épica** | Epic identifier | `EPIC-XXX-####` (e.g., EPIC-FACT-2025-01) |
| 2 | **ID Caso de Prueba** | Test case ID | `TC-XXX-###` (e.g., TC-FACT-001) |
| 3 | **Título** | Test case title | Short and clear description |
| 4 | **Descripción Completa** | Complete test description | Detailed objective and purpose of the test |
| 5 | **Precondiciones** | Preconditions | Bulleted (•) or numbered list of prerequisites |
| 6 | **Pasos de Ejecución** | Execution steps | Numbered list starting with verbs |
| 7 | **Resultados Esperados** | Expected results | Numbered list describing expected outcomes |
| 8 | **Tipo prueba** | Test type | Funcional, Integración, E2E, Manual, Automatica |
| 9 | **Fecha Ejecución** | Execution date and time | DD/MM/YYYY HH:MM |
| 10 | **Estado** | Execution status | Passed, Failed, Blocked, Not Started |
| 11 | **ID Defecto** | Defect ID | Defect tracking ID if test fails (e.g., OP-2345) |
| 12 | **Descripción Fallo** | Failure description | Detailed failure description if test fails |
| 13 | **Notas** | Notes and observations | Additional notes (duration, logs, observations) |

---

## Field Value Standards

### Test Execution Status (Column 10)

Valid values:
- `Passed` - Test passed successfully
- `Failed` - Test failed
- `Blocked` - Test blocked (cannot execute)
- `Not Started` - Test not yet executed

### Test Type (Column 8)

**IMPORTANT:** This workflow focuses on **functional-level testing and above**, NOT unit tests.

**Primary test types (recommended):**
- `Funcional` - Functional testing (validates complete features from user perspective)
- `Integración` - Integration testing (validates interaction between components/modules)
- `E2E` - End-to-end testing (validates complete user journeys)
- `Manual` - Manual test execution
- `Automatica` - Automated test execution

**Additional types (if applicable):**
- `Regresión` - Regression testing
- `Performance` - Performance testing
- `Seguridad` - Security testing

**NOT SUPPORTED:**
- Unit tests (code-level tests)
- Component tests (isolated UI component tests)

### Epic ID Format (Column 1)

Format: `EPIC-[MODULE]-[YEAR]-[NUMBER]`

Examples:
- `EPIC-FACT-2025-01` - Facturación module, year 2025, epic #1
- `EPIC-NOM-2025-02` - Nómina module, year 2025, epic #2
- `EPIC-INV-2025-03` - Inventory module, year 2025, epic #3

### Test Case ID Format (Column 2)

Format: `TC-[MODULE]-[NUMBER]`

Examples:
- `TC-FACT-001` - Test case for Facturación module
- `TC-NOM-015` - Test case for Nómina module
- `TC-INV-042` - Test case for Inventory module

---

## Multiple Sheet Structure

When using Excel format, the file typically contains multiple sheets:

### 1. API Sheet
Contains API-level test cases
- Focus: API endpoints, request/response validation
- Type: Usually "Funcional" or "Integración"

### 2. Integracion Sheet
Contains integration test cases
- Focus: Component integration, data flow
- Type: Usually "Integración"

### 3. E2E Sheet
Contains end-to-end test cases
- Focus: Complete user workflows
- Type: Usually "E2E"

### 4. Resumen de Métricas Pruebas Sheet
Summary metrics and statistics
- Contains: Test counts, success rates, defect tracking

---

## Data Organization Hierarchy

The test cases follow a three-level hierarchy:

```
Test Type (Funcional, Integración, E2E)
└── Suite/Scenario
    └── Test Case (TC)
```

**Example:**
```
Funcional
└── Suite Login y Autenticación
    ├── TC001: Login exitoso con credenciales válidas
    ├── TC002: Login fallido con contraseña incorrecta
    └── TC003: Login con usuario no existente
Integración
└── Suite Integración de Módulos
    ├── TC010: Sincronización entre módulos
    └── TC011: Propagación de datos entre sistemas
```

---

## Parsing Instructions for Workflow

When reading this file in the workflow:

### Step 1: Identify Data Start Row
- Column headers are in Row 11
- Data starts at Row 12
- Rows 1-10 are metadata
- Row 11 is column headers

### Step 2: Read Column Names
- Read Row 11 to get column names (13 columns)
- Map columns to expected structure

### Step 3: Parse Test Cases
- Start reading from Row 12
- Each row is one test case
- Stop when encountering completely empty rows

### Step 4: Build Hierarchy
- Group by `ID Épica` (Column 1)
- Sub-group by `Tipo prueba` (Column 8)
- Individual test cases by `ID Caso de Prueba` (Column 2)

### Step 5: Extract Relationships
- Link to epics via `ID Épica` (Column 1)
- Track test coverage per Epic
- Track execution status per Epic
- Identify gaps in coverage

---

## CSV vs Excel Differences

### CSV Format
- Single file = single sheet
- Need separate CSV files for API, Integracion, E2E
- Simpler to parse
- No formulas or macros
- UTF-8 encoding recommended

### Excel Format (.xlsm)
- Multiple sheets in one file
- May contain formulas and macros
- Larger file size
- Original format from Siesa

---

## Usage in Traceability Workflow

This file structure is used in the workflow's **Step 3: Interpret Test Cases**

The workflow will:
1. Read the test case file (CSV or XLSM)
2. Parse according to this structure
3. Build Type → Suite → Test Case hierarchy
4. Map test cases to requirements (if epics.md available)
5. Generate test coverage reports
6. Create consolidated epic-level test plans
7. Export to markdown and Excel formats

---

## Template File Location

**Standard template:** `{workflow_path}/templates/test-cases-template.csv`

This template includes:
- Proper header structure (rows 1-33)
- Example test cases
- All column definitions
- Sample data for each test type

---

## Best Practices

### 1. Test Type Grouping
- Use standard types: `Funcional`, `Integración`, `E2E`
- Group test cases by test type first
- Keep type classification consistent
- Align test types with project testing strategy

### 2. Test Case IDs
- Use format: `TC###` or `TC###-E##`
- Keep IDs unique within the file
- Consider prefixing with sheet name for multi-sheet files

### 3. Preconditions and Steps
- Always use numbered lists
- Start each step with an action verb
- Keep steps atomic (one action per step)
- Maximum 15 steps per test case

### 4. Expected Results
- Match to steps (step N → expected result N)
- Start with verbs describing outcomes
- Be specific and measurable

### 5. Test Case Organization
- Group related test cases in same Suite
- Keep Suite scope focused
- Use clear, descriptive Suite names

### 6. Mode-Specific Best Practices

**For UI Functional Mode (`ui-functional`):**
- ✅ Write all steps as if explaining to a non-technical user
- ✅ Reference UI elements by their visible text/labels
- ✅ Describe only what the user can see and interact with
- ✅ Use simple, clear language without jargon
- ❌ Never mention: code, APIs, callbacks, state, localStorage, HTTP codes
- ❌ Never use technical event names (onClick, onChange, etc.)
- ❌ Never reference CSS selectors or HTML IDs

**Example Good Practices (UI Mode):**
```
✅ GOOD: "Hacer clic en el botón Guardar"
❌ BAD: "Ejecutar handleSave() callback"

✅ GOOD: "Verificar que aparece mensaje de confirmación"
❌ BAD: "Verificar que el estado cambia a 'success'"

✅ GOOD: "El campo Email está resaltado en rojo"
❌ BAD: "La clase CSS .error-field se aplica al input#email"
```

**For Backend API Mode (`backend-api`):**
- ✅ Always specify full endpoint path and HTTP method
- ✅ Include complete request structure (headers + body)
- ✅ Specify expected HTTP status codes
- ✅ Provide actual JSON examples (copyable to Postman)
- ✅ Generate both positive AND negative test cases
- ✅ Cover validation, authentication, authorization, and edge cases
- ❌ Never include server configuration details
- ❌ Never reference internal implementation (ORM, services, etc.)
- ❌ Never require access to source code to execute tests

**Example Good Practices (API Mode):**
```
✅ GOOD: "Enviar POST a /api/v1/users con body: { email: 'test@example.com' }"
❌ BAD: "Llamar al método createUser() del UserService"

✅ GOOD: "Esperar Status: 401 Unauthorized"
❌ BAD: "Verificar que el middleware de auth rechaza la petición"

✅ GOOD: "Body debe contener campo 'error' con mensaje descriptivo"
❌ BAD: "Verificar que se lanza UserNotFoundException en el catch block"
```

---

## Example Test Case Structure

```csv
ID Épica,ID Caso de Prueba,Título,Descripción Completa,Precondiciones,Pasos de Ejecución,Resultados Esperados,Tipo prueba,Fecha Ejecución,Estado,ID Defecto,Descripción Fallo,Notas
EPIC-FACT-2025-01,TC-FACT-001,Factura electrónica con múltiples formas de pago,"Validar generación correcta de factura electrónica cuando se usan efectivo + tarjeta, cálculo de IVA 19%, y transmisión exitosa a DIAN con CUFE","• Usuario test.facturacion@siesa.com con permisos
• Empresa SIESA TEST configurada para FE
• Resolución DIAN vigente","1. Login en módulo Comercial
2. Nueva factura → Seleccionar cliente
3. Agregar 3 productos con IVA 19%
4. Aplicar descuento 10% en línea 2
5. Registrar pago: 50% efectivo + 50% tarjeta
6. Generar XML documento electrónico
7. Validar estructura XML vs esquema DIAN
8. Transmitir a DIAN
9. Verificar CUFE y estado Aceptado","1. Login exitoso
2. Cliente cargado correctamente
3. Productos agregados, IVA calculado
4. Descuento solo en línea 2
5. Ambas formas de pago registradas
6. XML generado conforme estándar
7. XML válido
8. HTTP 200, transmisión exitosa
9. CUFE generado, estado = Aceptado",Manual,22/01/2025 14:35,Passed,,,Duración: 3m 45s | CUFE: ABC123XYZ789
EPIC-NOM-2025-02,TC-NOM-015,Cálculo cesantías con salario variable,Validar cálculo correcto de cesantías e intereses sobre cesantías para empleado con salario variable durante 12 meses,"• Empleado Juan Pérez CC 1234567890 activo desde 01/01/2024
• 12 meses de nómina procesada
• Salario variable configurado","1. Acceder a Liquidaciones
2. Seleccionar empleado Juan Pérez
3. Configurar período 01/01/2024 - 31/12/2024
4. Calcular promedio salario variable
5. Calcular cesantías (salario promedio)
6. Calcular intereses cesantías (12% anual)
7. Generar comprobante
8. Validar totales vs cálculo manual","1. Módulo cargado
2. Empleado seleccionado
3. Período configurado
4. Promedio = $3,500,000
5. Cesantías = $3,500,000
6. Intereses = $420,000 (12% anual)
7. Comprobante generado
8. Totales correctos",Automatica,21/01/2025 10:15,Failed,OP-2345,"Cálculo de intereses cesantías aplica 1% mensual en lugar de 12% anual. Resultado: $35,000 vs esperado $420,000",Afecta todas las liquidaciones. Requiere hotfix urgente
```

---

## Integration with Epic/Story Structure

When `epics.md` is available, the workflow maps:

```
FR (Functional Requirement)
└── Epic
    └── Story
        └── Task
            └── **Test Case** (from this file)
```

**Mapping Strategy:**
- Use `ID Épica` field (Column 1) to link TCs to Epics
- Parse Epic ID format: EPIC-[MODULE]-[YEAR]-[NUMBER]
- Automatic grouping by Epic ID
- Track test coverage per Epic

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 5.0 | 2026-01-19 | Initial documentation for BMAD workflow |
| 5.0 | 2024-06-20 | Original Siesa format (FT-SD-007) |

---

## Related Documents

- **Workflow:** `_bmad/bmm/workflows/4-implementation/traceability-and-testing/workflow.md`
- **Template CSV:** `test-cases-template.csv`
- **Step 3:** `steps/step-03-interpret-test-cases.md`

---

**Note:** This structure is standardized for consistency across all projects using the BMAD traceability workflow. Any deviations should be documented and handled as exceptions in the workflow execution.
