# Excel Test Cases Structure Guide

**Purpose:** This document serves as a reference for understanding common Excel test case repository structures and how the workflow interprets them.

---

## Common Column Names

The workflow recognizes these common column name patterns when normalizing test cases from Excel:

### Test Case Identification

- **Test ID / TC ID / ID / Caso de Prueba / Test Case ID**
  - Maps to: `test_case.id`
  - Expected format: TC-001, TC-002, etc.

- **Test Name / Name / Nombre / Descripción Corta / Title**
  - Maps to: `test_case.name`
  - The short title or name of the test case

### Test Case Details

- **Description / Descripción / Detalle / Test Description**
  - Maps to: `test_case.description`
  - Detailed description of what is being tested

- **Module / Módulo / Feature / Funcionalidad / Componente / Area**
  - Maps to: `test_case.module`
  - The module or feature area this test belongs to

- **Priority / Prioridad / Criticidad / Severity**
  - Maps to: `test_case.priority`
  - Common values: High, Medium, Low / Alta, Media, Baja / Critical, Major, Minor

- **Type / Tipo / Category / Categoría / Test Type**
  - Maps to: `test_case.type`
  - Common values: Functional, Integration, Regression, Smoke, UAT

### Test Case Execution

- **Steps / Pasos / Procedimiento / Test Steps / Procedure**
  - Maps to: `test_case.steps`
  - Step-by-step instructions for executing the test

- **Expected Result / Resultado Esperado / Expected / Expected Outcome**
  - Maps to: `test_case.expected`
  - The expected outcome when test is executed correctly

- **Preconditions / Precondiciones / Setup / Prerequisites**
  - Maps to: `test_case.preconditions`
  - Required setup or state before executing the test

### Traceability Links

- **FR / Requerimiento / FR ID / Req / Requirement**
  - Maps to: `test_case.related_fr`
  - Link to Functional Requirement (e.g., FR-001)

- **Epic / Épica / Epic ID**
  - Maps to: `test_case.related_epic`
  - Link to Epic (e.g., Epic 1)

- **Story / Historia / User Story / Story ID**
  - Maps to: `test_case.related_story`
  - Link to Story (e.g., Story 1.1)

---

## Example Excel Structures

### Structure 1: Functional Test Cases

| TC ID | Test Name | Module | Priority | Steps | Expected Result | FR |
|-------|-----------|--------|----------|-------|----------------|-----|
| TC-001 | User login with valid credentials | Authentication | High | 1. Open login page<br>2. Enter valid email<br>3. Enter valid password<br>4. Click Login | User is logged in successfully | FR-002 |
| TC-002 | User login with invalid password | Authentication | High | 1. Open login page<br>2. Enter valid email<br>3. Enter invalid password<br>4. Click Login | Error message displayed | FR-002 |

**Workflow Interpretation:**
- `TC ID` → `test_case.id`
- `Test Name` → `test_case.name`
- `Module` → `test_case.module`
- `Priority` → `test_case.priority`
- `Steps` → `test_case.steps`
- `Expected Result` → `test_case.expected`
- `FR` → `test_case.related_fr`

---

### Structure 2: Detailed Test Cases with Preconditions

| ID | Nombre | Descripción | Módulo | Precondiciones | Pasos | Resultado Esperado | Prioridad | Tipo |
|----|--------|-------------|--------|----------------|-------|-------------------|-----------|------|
| 001 | Registro de usuario | Validar registro con datos válidos | User Management | DB limpia | 1. Ir a /register<br>2. Completar form<br>3. Submit | Usuario creado | Alta | Funcional |

**Workflow Interpretation:**
- `ID` → `test_case.id`
- `Nombre` → `test_case.name`
- `Descripción` → `test_case.description`
- `Módulo` → `test_case.module`
- `Precondiciones` → `test_case.preconditions`
- `Pasos` → `test_case.steps`
- `Resultado Esperado` → `test_case.expected`
- `Prioridad` → `test_case.priority`
- `Tipo` → `test_case.type`

---

### Structure 3: Test Cases with Epic/Story Links

| Test ID | Test Case | Epic | Story | Priority | Type | Status |
|---------|-----------|------|-------|----------|------|--------|
| TC-001 | User registration validation | Epic 1 | Story 1.1 | High | Functional | Draft |
| TC-002 | Profile update | Epic 1 | Story 1.2 | Medium | Functional | Approved |

**Workflow Interpretation:**
- `Test ID` → `test_case.id`
- `Test Case` → `test_case.name`
- `Epic` → `test_case.related_epic`
- `Story` → `test_case.related_story`
- `Priority` → `test_case.priority`
- `Type` → `test_case.type`

---

## Multi-Sheet Workbooks

If your Excel file has multiple sheets, the workflow will process all sheets. Common sheet naming patterns:

### Functional Test Cases
- **Sheet names:** "Functional Tests", "Casos Funcionales", "Functional", "Feature Tests"
- **Purpose:** Main functional test cases

### Integration Test Cases
- **Sheet names:** "Integration Tests", "Pruebas de Integración", "Integration"
- **Purpose:** Tests validating integration between components

### Regression Test Suite
- **Sheet names:** "Regression", "Regression Tests", "Pruebas de Regresión"
- **Purpose:** Tests run repeatedly to catch regressions

### Smoke / Sanity Tests
- **Sheet names:** "Smoke Tests", "Sanity", "Pruebas de Humo"
- **Purpose:** Quick critical path tests

---

## Mapping Strategy

The workflow uses multiple strategies to map test cases to traceability:

### 1. Direct Reference Mapping (Highest Priority)

If your Excel has columns like `FR`, `Epic`, or `Story`, the workflow uses these directly:

```
TC-001 has FR column value "FR-002"
  → Look up which Epic(s) cover FR-002
  → Map TC-001 to those Epic(s)
```

### 2. Module Name Similarity Matching

If no direct reference, the workflow compares the `Module` column to Epic titles:

```
TC-001 has Module "User Management"
Epic 1 has title "User Management System"
  → High similarity → Suggest mapping TC-001 to Epic 1
```

### 3. Description Text Similarity

If still unmapped, the workflow compares test case description to Story descriptions:

```
TC-001 description: "Test user registration with valid data"
Story 1.1 title: "User Registration"
  → Keyword overlap → Suggest mapping TC-001 to Story 1.1 (Epic 1)
```

### 4. Manual User Mapping

If all automatic strategies fail, the workflow asks the user to manually select the Epic.

---

## Best Practices for Excel Structure

To maximize automatic mapping success:

1. **Include FR/Epic/Story References**
   - Add columns linking test cases to requirements
   - Use consistent ID formats (FR-001, Epic 1, Story 1.1)

2. **Use Consistent Module Names**
   - Match module names to Epic titles where possible
   - Example: If Epic is "User Management System", use Module "User Management"

3. **Descriptive Test Names**
   - Use keywords from Epic/Story titles in test case names
   - Example: For Story "User Registration", name tests "User Registration - Valid Data"

4. **Organize by Sheets**
   - Group related test cases in named sheets
   - Example: All "User Management" tests in one sheet

5. **Standardize Column Names**
   - Use common column names (ID, Name, Module, Priority, etc.)
   - The workflow recognizes common patterns in English and Spanish

---

## Troubleshooting

### Test Cases Not Mapping Automatically

**Problem:** Many test cases remain unmapped after automatic mapping

**Solutions:**
1. Add FR/Epic/Story reference columns to Excel
2. Ensure module names align with Epic titles
3. Use descriptive test case names with Epic/Story keywords
4. Be prepared for manual mapping session with workflow

### Column Names Not Recognized

**Problem:** Workflow doesn't extract expected data from Excel

**Solutions:**
1. Check that column names match patterns in this guide
2. When workflow asks for confirmation, correct the mapping
3. Add this information to the workflow in Step 01

### Duplicate Test IDs

**Problem:** Multiple test cases with the same ID

**Solutions:**
1. Ensure all test case IDs are unique across all sheets
2. Use a consistent ID format (e.g., TC-001, TC-002)
3. Consider prefixing IDs by sheet (e.g., FUNC-001, INT-001)

---

## Example: pruebas_comandera.xlsm

**Structure captured from user in Step 01:**

{{user_provided_excel_structure}}

This structure will be used to map Excel columns to the normalized test case format during Step 03.

---

*This guide is for reference only. The actual Excel structure interpretation happens dynamically during workflow execution based on the user's input in Step 01.*
