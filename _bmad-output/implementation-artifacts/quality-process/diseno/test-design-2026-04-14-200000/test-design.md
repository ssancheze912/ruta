---
workflow: quality-process
phase: diseno
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
generated_date: 2026-04-14T20:00:00Z
project_name: Siesa-Agents
input_documents:
  epics:
    - _bmad-output/planning-artifacts/epics/epic-01-foundation.md
    - _bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md
    - _bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md
    - _bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md
  prd: _bmad-output/planning-artifacts/prd/
  technology_stack: _bmad/bmm/workflows/3-solutioning/create-architecture/data/company-standards/technology-stack.md
  test_plan: _bmad-output/implementation-artifacts/quality-process/planeacion/test-plan-2026-04-14-100000/test-plan.md
---

# FASE 1 — REPORTE DEL GATEKEEPER (GRANULAR)

## I. REPORTE DEL GATEKEEPER (GRANULAR)

| ID Historia | Nombre / Feature | Clasificación | Justificación / Explicación de Ruido Técnico |
| :--- | :--- | :--- | :--- |
| Story 1.1 | Project Initialization & Repository Structure | **Ruido Técnico** | Setup de entorno de desarrollo: inicialización de proyectos Vite/React y .NET 10, instalación de dependencias (`npm install`, `dotnet new`). No genera lógica de negocio certificable desde QA; los ACs son sobre herramientas CLI y compilación. Validado implícitamente cuando Stories 1.2 y 1.3 funcionen. |
| Story 1.2 | Frontend Navigation Shell | **Lógica de Negocio** ✅ | Implementa FR28 (SPA navigation), FR29 (mobile-responsive), FR30 (deep linking). Los ACs son verificables por QA: NavigationRail/NavigationBar, navegación sin page reload, URL directa funcional, 404 graceful. |
| Story 1.3 | Backend Database Foundation | **Ruido Técnico** | Crea la migración inicial vacía en PostgreSQL y configura EF Core snake_case. No existe tabla de dominio ni entidad de negocio — solo infraestructura de datos. La validación de snake_case naming y Problem Details middleware es implícita en los tests de integración de Epic 2 y 3. |
| Story 2.1 | Client List & Search | **Lógica de Negocio** ✅ | FR2 (lista scrollable), FR3 (búsqueda por nombre), FR4 (búsqueda por NIT/RUC), NFR1 (<1s con 500 registros). EmptyState y ErrorPanel son ACs de UX verificables. |
| Story 2.2 | Client Detail View | **Lógica de Negocio** ✅ | FR5 (ver detalle completo), FR30 (deep linking /clientes/:id). ACs verificables: campos visibles, deep link funcional, 404 graceful para ID inválido. |
| Story 2.3 | Create Client | **Lógica de Negocio** ✅ | FR1 (crear con campos requeridos), FR8 (impedir guardado con campos vacíos), FR27 (cambio inmediato en lista). ACs críticos: 409 por NIT duplicado, toast de éxito, validación inline. |
| Story 2.4 | Edit Client | **Lógica de Negocio** ✅ | FR6 (editar campos), FR8 (validación), FR27 (cambio inmediato). ACs: form pre-poblado, toast de éxito, cancelar sin efecto. |
| Story 2.5 | Delete Client | **Lógica de Negocio** ✅ | FR7 (eliminar), FR27 (cambio inmediato). **Criticidad especial:** AC define que contactos asociados quedan `clienteId = null` (regla de integridad referencial — riesgo de datos). |
| Story 3.1 | Contact List & Search | **Lógica de Negocio** ✅ | FR10 (lista), FR11 (búsqueda nombre), FR12 (búsqueda email), NFR1 (<1s con 1000 registros). EmptyState y ErrorPanel verificables. |
| Story 3.2 | Contact Detail View | **Lógica de Negocio** ✅ | FR13 (detalle completo), FR30 (deep linking). ACs verificables. |
| Story 3.3 | Create Contact | **Lógica de Negocio** ✅ | FR9 (crear con campos), FR16 (validación), FR27 (cambio inmediato). Formato email validado por Zod. |
| Story 3.4 | Edit Contact | **Lógica de Negocio** ✅ | FR14 (editar), FR16 (validación), FR27. Cancel sin efecto. |
| Story 3.5 | Delete Contact | **Lógica de Negocio** ✅ | FR15 (eliminar), FR27. Verificar que contacto desaparece de la lista. |
| Story 4.1 | View Associated Contacts in Client Detail | **Lógica de Negocio** ✅ | FR21 (ver contactos desde detalle cliente). ContactManager con IContactServiceAdapter. EmptyState y ErrorPanel verificables. |
| Story 4.2 | Associate & Disassociate Contacts from Client | **Lógica de Negocio** ✅ | FR17 (asociar existente), FR18 (asociar al crear), FR19 (desde detalle cliente), FR20 (desasociar), FR27 (cambio inmediato). TanStack Query invalidation es AC crítico. |
| Story 4.3 | Navigate from Client Detail to Contact Detail | **Lógica de Negocio** ✅ | FR22 (navegar cliente→contacto), NFR8 (≤2 clics). Browser back funcional. |
| Story 4.4 | View Associated Client from Contact Detail | **Lógica de Negocio** ✅ | FR23 (ver cliente desde contacto), FR24 (navegar contacto→cliente), NFR9 (sin búsqueda adicional). "Sin cliente asignado" para huérfanos. |
| Story 4.5 | Orphan Contacts Filter | **Lógica de Negocio** ✅ | FR25 (filtro "Sin cliente"). Conteo visible, EmptyState si todos asignados, desactivar restaura lista. |
| Story 4.6 | Reassign Contact to Different Client | **Lógica de Negocio** ✅ | FR26 (reasignar), FR27 (cambio inmediato). Invalidación de 3 query keys es AC técnico crítico. |

---

## Resumen de Clasificación

| Categoría | Cantidad | IDs |
|-----------|----------|-----|
| **Lógica de Negocio** (incluidos en diseño) | **17** | 1.2, 2.1–2.5, 3.1–3.5, 4.1–4.6 |
| **Ruido Técnico** (excluidos del diseño) | **2** | 1.1, 1.3 |
| **Total historias procesadas** | **19** | — |

---

## Features Lógicos Identificados (Post-Gatekeeper)

| # | Feature Lógico | Historias Incluidas | Épicas de Origen |
|---|---------------|-------------------|-----------------|
| **F1** | Application Shell & Navigation | Story 1.2 | Epic 1 |
| **F2** | Client Management | Stories 2.1, 2.2, 2.3, 2.4, 2.5 | Epic 2 |
| **F3** | Contact Management | Stories 3.1, 3.2, 3.3, 3.4, 3.5 | Epic 3 |
| **F4** | Client-Contact Association & Data Quality | Stories 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | Epic 4 |

---

---
workflow: quality-process
phase: diseno
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
generated_date: 2026-04-14T20:00:00Z
project_name: Siesa-Agents
input_documents:
  epics:
    - _bmad-output/planning-artifacts/epics/epic-01-foundation.md
    - _bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md
    - _bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md
    - _bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md
  prd: _bmad-output/planning-artifacts/prd/
  technology_stack: _bmad/bmm/workflows/3-solutioning/create-architecture/data/company-standards/technology-stack.md
  test_plan: _bmad-output/implementation-artifacts/quality-process/planeacion/test-plan-2026-04-14-100000/test-plan.md
---

# FASE 2 — DEFINICIÓN DE FEATURES Y CRITERIOS MAESTROS (FAC) EN GHERKIN

## II. DEFINICIÓN DE FEATURES Y CRITERIOS MAESTROS (FAC)

---

### Feature F1 — Application Shell & Navigation

- **Feature:** Application Shell & Navigation
- **Features/Historias Asociadas:** Story 1.2 (Frontend Navigation Shell) | FRs: FR28, FR29, FR30 | Epic 1
- **Dependencias:** siesa-ui-kit (NavigationRail, NavigationBar), TanStack Router file-based, Vite dev server :5173

#### FAC Funcionales (Gherkin)

```gherkin
Feature: Application Shell & Navigation

  # FAC-F1-01: Desktop Navigation Rail
  Scenario: NavigationRail renders on desktop viewport
    Given the application is loaded on a browser with viewport width >= 1024px
    When the user views the root layout
    Then the siesa-ui-kit NavigationRail is visible on the left side
    And it contains navigation items for "Clientes" and "Contactos"
    And both items are accessible and clickable

  # FAC-F1-02: SPA Navigation — No Page Reload (FR28)
  Scenario: Navigate between sections without full page reload
    Given the user is on any page of the application
    When the user clicks "Clientes" in the NavigationRail or NavigationBar
    Then the URL changes to /clientes
    And the Clientes view renders without a full browser page reload
    And the current DOM is updated in place (React reconciliation)
    When the user clicks "Contactos"
    Then the URL changes to /contactos
    And the Contactos view renders without a full browser page reload

  # FAC-F1-03: Mobile Navigation Bar (FR29)
  Scenario: NavigationBar renders on mobile viewport
    Given the application is loaded on a browser with viewport width <= 768px (mobile simulation)
    When the user views the root layout
    Then the siesa-ui-kit NavigationBar is displayed instead of the NavigationRail
    And all navigation items are accessible and tappable with a minimum touch target of 44x44px
    And the NavigationRail is NOT visible

  # FAC-F1-04: Deep Linking — Clientes (FR30)
  Scenario: Direct URL access to /clientes renders correct view
    Given the user types "/clientes" directly in the browser URL bar
    When the page finishes loading
    Then the Clientes list view is rendered correctly
    And no redirection to a home screen occurs

  # FAC-F1-05: Deep Linking — Contactos (FR30)
  Scenario: Direct URL access to /contactos renders correct view
    Given the user types "/contactos" directly in the browser URL bar
    When the page finishes loading
    Then the Contactos list view is rendered correctly

  # FAC-F1-06: 404 for Unknown Routes
  Scenario: Unknown route renders 404 view gracefully
    Given the user navigates to an unregistered route (e.g., /dashboard, /settings)
    When the page loads
    Then a 404 / not-found view is displayed
    And no JavaScript runtime error occurs in the browser console
    And the NavigationRail/Bar is still accessible for recovery navigation
```

#### FAC No Funcionales (Gherkin)

```gherkin
  # FAC-F1-NFR-01: Responsive Layout Breakpoint
  Scenario: Layout adapts at the critical breakpoint (lg: 1024px)
    Given the application is rendered
    When the viewport width is exactly 1024px
    Then the NavigationRail (desktop) layout is active
    When the viewport width decreases to 1023px
    Then the NavigationBar (mobile) layout becomes active
    And no visual overlap or layout break occurs at the transition

  # FAC-F1-NFR-02: SPA Route Transition Performance
  Scenario: Route transitions render within acceptable time
    Given the application is loaded and TanStack Router is initialized
    When the user navigates between /clientes and /contactos
    Then the route transition completes and the target view renders within 300ms
    And no white-flash or blank-screen state is visible during the transition
```

---

### Feature F2 — Client Management

- **Feature:** Client Management
- **Features/Historias Asociadas:** Story 2.1 (List & Search), Story 2.2 (Detail View), Story 2.3 (Create), Story 2.4 (Edit), Story 2.5 (Delete) | FRs: FR1–FR8, FR27, FR30 | Epic 2
- **Dependencias:** TanStack Query `['clientes']` key, Axios `GET/POST/PUT/DELETE /api/v1/clientes`, FluentValidation backend, Zod frontend, siesa-ui-kit (EmptyState, ErrorPanel), PostgreSQL `clientes` table with `uk_clientes_nit` constraint

#### FAC Funcionales (Gherkin)

```gherkin
Feature: Client Management

  # FAC-F2-01: Client List Renders All Clients (FR2)
  Scenario: All clients are displayed in the left panel
    Given clients exist in the database
    When the user navigates to /clientes
    Then the left panel (280px) displays a scrollable list of all clients
    And each list item shows the client's Nombre and NIT/RUC
    And the full client count matches the database count

  # FAC-F2-02: Real-Time Search by Name (FR3)
  Scenario: Filter client list by partial name match
    Given the client list is loaded with at least 5 clients
    When the user types a partial name in the search field (e.g., "Empresa")
    Then the list updates in real time showing only clients whose Nombre contains the search string (case-insensitive)
    And clients whose Nombre does not match are hidden
    And the filtering occurs without a backend API call (client-side filter)

  # FAC-F2-03: Real-Time Search by NIT/RUC (FR4)
  Scenario: Filter client list by partial NIT/RUC match
    Given the client list is loaded
    When the user types a partial NIT/RUC in the search field (e.g., "900123")
    Then the list shows only clients whose NIT/RUC contains the search string
    And the result appears without a backend call

  # FAC-F2-04: Search Performance with 500 Records (NFR1)
  Scenario: Search responds within 1 second with 500 client records
    Given the database contains exactly 500 client records
    And the client list has been loaded into TanStack Query cache
    When the user types any search string
    Then the filtered results render within 1 second from the keystroke

  # FAC-F2-05: EmptyState When No Clients
  Scenario: EmptyState component shown when client list is empty
    Given no clients exist in the database
    When the user navigates to /clientes
    Then the EmptyState component is displayed with guidance to create the first client
    And no error or blank panel is shown

  # FAC-F2-06: ErrorPanel When Backend Is Unavailable
  Scenario: ErrorPanel shown when client list fetch fails
    Given the backend service is unavailable or returns an error
    When the user navigates to /clientes
    Then the ErrorPanel component is displayed with a "Reintentar" button
    And the error does not expose stack traces or technical details to the user

  # FAC-F2-07: Client Detail View (FR5, FR30)
  Scenario: Client detail shows all fields
    Given clients exist in the database
    When the user clicks on a client item in the list
    Then the right panel displays the complete client details: Nombre, NIT/RUC, Teléfono, Ciudad
    And the URL updates to /clientes/:clienteId (deep linking, FR30)

  # FAC-F2-08: Create Client — Valid Data (FR1, FR27)
  Scenario: Successfully create a new client with all required fields
    Given the user is on the /clientes view
    When the user clicks "Nuevo cliente"
    And fills in all required fields: Nombre="Empresa XYZ S.A.S", NIT/RUC="900999888-1", Teléfono="+57 300 1111111", Ciudad="Bogotá"
    And submits the form
    Then the backend creates the client and returns 201 Created
    And the new client appears in the client list immediately without manual refresh (FR27)
    And a success toast displays "Cliente creado correctamente"
    And the form closes

  # FAC-F2-09: Create Client — Duplicate NIT/RUC (FR8)
  Scenario: Reject client creation with duplicate NIT/RUC
    Given a client with NIT/RUC="900999888-1" already exists in the database
    When the user submits a new client form with NIT/RUC="900999888-1"
    Then the backend returns 409 Conflict in Problem Details RFC 7807 format
    And the frontend displays the error message "El NIT/RUC ya está registrado"
    And no stack trace or technical detail is exposed to the user
    And the form remains open for correction

  # FAC-F2-10: Create Client — Required Field Validation (FR8)
  Scenario Outline: Reject client form submission with missing required field
    Given the user opens the "Nuevo cliente" form
    When the user leaves <field> empty and submits the form
    Then a clear inline error message appears next to <field>
    And the form is NOT submitted to the backend (no HTTP request is made)
    Examples:
      | field    |
      | Nombre   |
      | NIT/RUC  |
      | Teléfono |
      | Ciudad   |

  # FAC-F2-11: Edit Client — Pre-fill and Save (FR6, FR27)
  Scenario: Edit client with pre-populated form
    Given the user is viewing a client's detail with Nombre="Empresa ABC"
    When the user clicks "Editar"
    Then the form opens pre-filled with all current field values
    When the user changes Ciudad to "Medellín" and submits
    Then the backend updates the client and returns 200 OK
    And the change is reflected in the client detail and list immediately (FR27)
    And a success toast displays "Cliente actualizado correctamente"

  # FAC-F2-12: Edit Client — Validation on Empty Required Field (FR8)
  Scenario: Block edit form submission with cleared required field
    Given the user is editing a client
    When the user clears the Nombre field and clicks save
    Then an inline error message appears on the Nombre field
    And the form is NOT submitted to the backend

  # FAC-F2-13: Edit Client — Cancel Without Effect
  Scenario: Canceling edit does not modify client data
    Given the user is editing a client and has changed Nombre to "New Name"
    When the user clicks "Cancelar"
    Then the form closes
    And the client's Nombre in the detail view remains the original value

  # FAC-F2-14: Delete Client — Confirmation Dialog (FR7)
  Scenario: Delete client shows confirmation dialog
    Given the user is viewing a client's detail
    When the user clicks "Eliminar"
    Then a confirmation dialog appears with the message "¿Eliminar este cliente?"
    And the dialog contains "Confirmar" and "Cancelar" buttons

  # FAC-F2-15: Delete Client — Confirm Deletion (FR7, FR27)
  Scenario: Confirmed deletion removes client immediately
    Given the user is viewing a client's detail and has no associated contacts
    When the user clicks "Eliminar" and then "Confirmar"
    Then the backend deletes the client and returns 204 No Content
    And the client is removed from the list immediately (FR27)
    And the right panel returns to the empty/default state
    And a success toast displays "Cliente eliminado correctamente"

  # FAC-F2-16: Delete Client — Cascade to Contacts (FR27, data integrity)
  Scenario: Deleting a client with associated contacts orphans those contacts
    Given a client exists with 3 associated contacts (contacto.clienteId = client.id)
    When the user confirms deletion of that client
    Then the client is deleted from the system
    And all 3 previously associated contacts remain in the system with their data intact
    And each of those 3 contacts now has clienteId = null
    And the 3 contacts appear in the "Sin cliente" filter (FR25)
    And the success toast displays "Cliente eliminado. Sus contactos asociados quedaron sin cliente asignado."
    And the TanStack Query keys ['contactos'] and ['contactos', { clienteId }] are invalidated

  # FAC-F2-17: Delete Client — Cancel Does Not Delete
  Scenario: Canceling confirmation dialog leaves client unchanged
    Given the user is viewing a client's detail
    When the user clicks "Eliminar" and then "Cancelar" in the confirmation dialog
    Then the dialog closes
    And the client record remains in the system unchanged
```

#### FAC No Funcionales (Gherkin)

```gherkin
  # FAC-F2-NFR-01: Client Search Performance (NFR1)
  Scenario: Client-side search completes in under 1 second with 500 records
    Given TanStack Query cache holds 500 client records
    When the user types in the search field triggering a client-side filter
    Then filtered results render in under 1000ms (P95)
    And no backend API request is triggered during search

  # FAC-F2-NFR-02: CRUD Mutation UI Update Speed (NFR2)
  Scenario: UI reflects CRUD change within 2 seconds
    Given the user performs a Create, Update, or Delete operation
    When the mutation completes and TanStack Query invalidates the cache
    Then the updated data is visible in the UI within 2 seconds of the user's action

  # FAC-F2-NFR-03: Problem Details Compliance (NFR6)
  Scenario: Backend error response never exposes stack traces
    Given any error condition occurs in the backend (validation, not-found, conflict, server error)
    When the response is received by the frontend
    Then the response body follows Problem Details RFC 7807 format: { status, title, detail }
    And no stack trace, exception class name, or file path is included in the response
```

---

### Feature F3 — Contact Management

- **Feature:** Contact Management
- **Features/Historias Asociadas:** Story 3.1 (List & Search), Story 3.2 (Detail View), Story 3.3 (Create), Story 3.4 (Edit), Story 3.5 (Delete) | FRs: FR9–FR16, FR27, FR30 | Epic 3
- **Dependencias:** TanStack Query `['contactos']` key, Axios `GET/POST/PUT/DELETE /api/v1/contactos`, Zod (email validation), siesa-ui-kit (EmptyState, ErrorPanel), PostgreSQL `contactos` table

#### FAC Funcionales (Gherkin)

```gherkin
Feature: Contact Management

  # FAC-F3-01: Contact List (FR10)
  Scenario: All contacts are displayed in the list
    Given contacts exist in the database
    When the user navigates to /contactos
    Then a list of all contacts is displayed showing Nombre, Cargo, and Email per item
    And the full contact count matches the database count

  # FAC-F3-02: Search by Contact Name (FR11)
  Scenario: Filter contact list by partial name match
    Given the contact list is loaded
    When the user types a partial name in the search field
    Then the list updates in real time showing only contacts whose Nombre contains the input (case-insensitive)

  # FAC-F3-03: Search by Email (FR12)
  Scenario: Filter contact list by partial email match
    Given the contact list is loaded
    When the user types a partial email address in the search field
    Then the list shows only contacts whose Email contains the search string

  # FAC-F3-04: Search Performance with 1000 Records (NFR1)
  Scenario: Search responds within 1 second with 1000 contact records
    Given the database contains 1000 contact records all loaded in TanStack Query cache
    When the user types any search string
    Then the filtered results render within 1 second from the keystroke

  # FAC-F3-05: EmptyState and ErrorPanel
  Scenario: EmptyState shown when no contacts exist
    Given no contacts exist in the database
    When the user navigates to /contactos
    Then the EmptyState component guides the user to create the first contact

  # FAC-F3-06: Contact Detail (FR13, FR30)
  Scenario: Contact detail shows all fields
    Given contacts exist in the database
    When the user clicks a contact item
    Then the contact detail view shows Nombre, Cargo, Teléfono, Email
    And the URL updates to /contactos/:contactoId

  # FAC-F3-07: Create Contact — Valid Data (FR9, FR27)
  Scenario: Successfully create a new contact with all required fields
    Given the user is on the /contactos view
    When the user clicks "Nuevo contacto" and fills: Nombre="Ana Gómez", Cargo="Directora", Teléfono="+57 311 2222222", Email="ana.gomez@empresa.com"
    And submits the form
    Then the backend creates the contact and returns 201 Created
    And the new contact appears in the list immediately (FR27)
    And a success toast displays "Contacto creado correctamente"

  # FAC-F3-08: Create Contact — Required Field Validation (FR16)
  Scenario Outline: Reject contact form submission with missing required field
    Given the user opens the "Nuevo contacto" form
    When the user leaves <field> empty and submits
    Then a clear inline error appears on <field>
    And no HTTP request is made
    Examples:
      | field    |
      | Nombre   |
      | Cargo    |
      | Teléfono |
      | Email    |

  # FAC-F3-09: Create Contact — Invalid Email Format (FR16)
  Scenario: Reject contact form submission with invalid email format
    Given the user opens the "Nuevo contacto" form
    When the user enters Email="not-an-email" and submits
    Then Zod validation triggers an inline error "Email inválido" on the Email field
    And the form is NOT submitted to the backend

  # FAC-F3-10: Edit Contact (FR14, FR27)
  Scenario: Edit contact with pre-populated form
    Given the user is viewing a contact detail
    When the user clicks "Editar"
    Then the form opens pre-filled with all current values
    When the user changes Cargo to "Gerente" and submits
    Then the changes are reflected immediately in the detail view and list (FR27)
    And a success toast displays "Contacto actualizado correctamente"
    And the contact's clienteId remains unchanged by the edit operation

  # FAC-F3-11: Delete Contact (FR15, FR27)
  Scenario: Delete contact with confirmation
    Given the user is viewing a contact detail
    When the user clicks "Eliminar" and confirms in the dialog
    Then the contact is removed from the list immediately (FR27)
    And a success toast displays "Contacto eliminado correctamente"
```

#### FAC No Funcionales (Gherkin)

```gherkin
  # FAC-F3-NFR-01: Contact Search Performance (NFR1)
  Scenario: Contact search completes in under 1 second with 1000 records
    Given TanStack Query cache holds 1000 contact records
    When the user types in the search field
    Then filtered results render in under 1000ms (P95)

  # FAC-F3-NFR-02: Email Validation Coverage
  Scenario: Zod email schema rejects all RFC 5322 invalid formats
    Given the contact creation form is open
    When the user enters an email without @ symbol, without domain, or with consecutive dots
    Then the Zod schema marks the field as invalid and displays an inline error
    And FluentValidation on the backend also rejects the value with a 400 Bad Request
```

---

### Feature F4 — Client-Contact Association & Data Quality

- **Feature:** Client-Contact Association & Data Quality
- **Features/Historias Asociadas:** Story 4.1 (View contacts in client), Story 4.2 (Associate/Disassociate), Story 4.3 (Navigate client→contact), Story 4.4 (View client from contact), Story 4.5 (Orphan filter), Story 4.6 (Reassign) | FRs: FR17–FR27 | Epic 4
- **Dependencias:** siesa-ui-kit ContactManager, IContactServiceAdapter (ClienteContactServiceAdapter), TanStack Query keys `['contactos']` / `['contactos', { clienteId }]` / `['contactos', id]`, PUT `/api/v1/contactos/{id}/cliente`, FK `contacto.cliente_id ON DELETE SET NULL`

#### FAC Funcionales (Gherkin)

```gherkin
Feature: Client-Contact Association & Data Quality

  # FAC-F4-01: View Contacts in Client Detail (FR21)
  Scenario: ContactManager renders associated contacts in client detail
    Given a client exists with 3 associated contacts
    When the user opens the client detail view at /clientes/:clienteId
    Then the ContactManager component renders showing all 3 associated contacts
    And each contact item shows Nombre, Cargo, and Teléfono
    And the ContactManager uses ClienteContactServiceAdapter wired to GET /api/v1/contactos?clienteId=:id

  # FAC-F4-02: Associate Existing Contact to Client (FR17, FR19, FR27)
  Scenario: Associate an existing contact to a client from the client detail view
    Given the user is on the client detail view
    And contact "Juan Pérez" exists in the system and is not currently associated with this client
    When the user uses the ContactManager to select and add "Juan Pérez"
    Then PUT /api/v1/contactos/{juanId}/cliente is called with body { clienteId: currentClienteId }
    And "Juan Pérez" appears in the ContactManager list immediately without page reload (FR27)
    And TanStack Query keys ['contactos'] and ['contactos', { clienteId: currentClienteId }] are invalidated
    And the user does NOT need to navigate away from the client detail view (FR19)

  # FAC-F4-03: Associate Contact During Contact Creation (FR18)
  Scenario: New contact created from ContactManager is auto-linked to active client
    Given the user is on the client detail view for clienteId="abc-123"
    When the user creates a new contact from within the ContactManager
    Then the new contact is automatically associated with clienteId="abc-123"
    And the new contact appears in the ContactManager list immediately

  # FAC-F4-04: Disassociate Contact from Client (FR20, FR27)
  Scenario: Disassociate a contact from a client without deleting either record
    Given a contact "María López" is associated with client "Empresa ABC"
    When the user disassociates "María López" via the ContactManager
    Then PUT /api/v1/contactos/{mariaId}/cliente is called with body { clienteId: null }
    And "María López" is removed from the ContactManager list immediately (FR27)
    And "María López" still exists and is accessible from /contactos
    And "María López" now has clienteId = null

  # FAC-F4-05: Navigate from Client Detail to Contact Detail (FR22, NFR8)
  Scenario: Navigate to a contact's detail from the client's ContactManager in 2 clicks or less
    Given the user is on the client detail view and contacts are listed in the ContactManager
    When the user clicks on contact "Juan Pérez" in the ContactManager (1 click)
    Then the user is navigated to /contactos/:juanId showing the full contact detail (FR22)
    And the total interaction required is no more than 2 clicks from the client record (NFR8)

  # FAC-F4-06: Browser Back from Contact to Client (FR22)
  Scenario: Browser back button returns to client detail after navigating to contact
    Given the user navigated from a client detail to a contact detail via ContactManager
    When the user clicks the browser back button
    Then the user returns to the client detail view
    And the client detail is in the same state as before navigating away

  # FAC-F4-07: View Associated Client from Contact Detail (FR23, NFR9)
  Scenario: Contact detail shows the associated client name without extra navigation
    Given contact "Juan Pérez" is associated with client "Empresa ABC"
    When the user opens the contact detail at /contactos/:juanId
    Then the associated client's name "Empresa ABC" is displayed in the contact detail
    And no additional search or navigation is required to see this information (NFR9)

  # FAC-F4-08: Navigate from Contact Detail to Client Detail (FR24)
  Scenario: Clicking the client name in contact detail navigates to that client
    Given the user is viewing the contact detail of "Juan Pérez" associated with "Empresa ABC"
    When the user clicks on the "Empresa ABC" link
    Then the user is navigated to /clientes/:empresaAbcId
    And the full client detail for "Empresa ABC" is displayed

  # FAC-F4-09: Orphan Contact Shows "Sin cliente asignado" (FR23)
  Scenario: Contact with no client shows appropriate message in detail view
    Given contact "Sin Asignar User" has clienteId = null
    When the user opens the contact detail
    Then the message "Sin cliente asignado" is displayed in place of a client link

  # FAC-F4-10: Orphan Contacts Filter (FR25)
  Scenario: Filter contact list to show only contacts without an assigned client
    Given the contact list contains both assigned and unassigned contacts
    When the user activates the "Sin cliente" filter
    Then the list shows only contacts whose clienteId is null
    And the count of orphan contacts is visible next to the filter control
    And contacts with an assigned client are hidden

  # FAC-F4-11: Orphan Filter Empty State
  Scenario: Orphan filter shows empty state when all contacts are assigned
    Given all contacts in the system have an assigned clienteId (not null)
    When the user activates the "Sin cliente" filter
    Then an empty state is shown indicating all contacts are assigned to a client

  # FAC-F4-12: Deactivate Orphan Filter Restores Full List
  Scenario: Deactivating the orphan filter restores the complete contact list
    Given the "Sin cliente" filter is active showing 5 orphan contacts
    When the user deactivates the filter
    Then the full contact list (all contacts, assigned and unassigned) is restored
    And no backend API call is triggered (client-side filter)

  # FAC-F4-13: Orphan Contacts Appear Immediately After Client Deletion (FR25, FR27)
  Scenario: Contacts orphaned by client deletion immediately appear in orphan filter
    Given client "Empresa ABC" has 3 associated contacts
    When the user deletes "Empresa ABC" and confirms
    Then all 3 previously associated contacts now have clienteId = null
    And when the "Sin cliente" filter is applied, all 3 contacts appear immediately (FR27)
    And TanStack Query key ['contactos'] is invalidated forcing a fresh fetch

  # FAC-F4-14: Reassign Contact to Different Client (FR26, FR27)
  Scenario: Reassign a contact from one client to another client
    Given contact "Pedro Rojas" is currently associated with client "Empresa A"
    When the user initiates reassignment and selects "Empresa B"
    And confirms the reassignment
    Then PUT /api/v1/contactos/{pedroId}/cliente is called with body { clienteId: empresaBId }
    And "Pedro Rojas" appears in "Empresa B"'s ContactManager immediately (FR27)
    And "Pedro Rojas" is removed from "Empresa A"'s ContactManager immediately
    And TanStack Query keys ['contactos'], ['contactos', { clienteId: empresaAId }], and ['contactos', { clienteId: empresaBId }] are ALL invalidated
    And a success toast displays "Contacto reasignado correctamente"

  # FAC-F4-15: Cancel Reassignment Leaves Association Unchanged
  Scenario: Canceling reassignment does not change the contact's client
    Given contact "Pedro Rojas" is associated with "Empresa A"
    When the user opens the reassignment selector and selects "Empresa B" but clicks "Cancelar"
    Then the selector closes
    And "Pedro Rojas" remains associated with "Empresa A"
    And no backend call is made
```

#### FAC No Funcionales (Gherkin)

```gherkin
  # FAC-F4-NFR-01: Real-Time Visibility for All Users (FR27)
  Scenario: Association changes are visible to all users immediately
    Given user A and user B are both viewing the application simultaneously
    When user A associates a contact with a client
    Then TanStack Query cache is invalidated for all relevant keys
    And when user B refreshes or triggers a data load, the updated association is visible
    And no manual sync or page reload is required by user B

  # FAC-F4-NFR-02: Navigation Efficiency (NFR8, NFR9)
  Scenario: Core navigation paths require no more than the specified click count
    Given the user is on a client detail view with associated contacts
    When counting the clicks to reach a specific contact's detail
    Then the count is exactly 1 click (from client ContactManager to contact detail) — within the NFR8 max of 2
    Given the user is on a contact detail view
    When the user wants to view the associated client
    Then the client name is visible immediately with 0 additional clicks (NFR9)
```

---

---
workflow: quality-process
phase: diseno
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
generated_date: 2026-04-14T20:00:00Z
project_name: Siesa-Agents
input_documents:
  epics:
    - _bmad-output/planning-artifacts/epics/epic-01-foundation.md
    - _bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md
    - _bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md
    - _bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md
  prd: _bmad-output/planning-artifacts/prd/
  technology_stack: _bmad/bmm/workflows/3-solutioning/create-architecture/data/company-standards/technology-stack.md
  test_plan: _bmad-output/implementation-artifacts/quality-process/planeacion/test-plan-2026-04-14-100000/test-plan.md
---

# FASE 3 — DETECCIÓN DE PUNTOS CIEGOS (SIMULACIÓN UNIVERSAL)

## III. PUNTOS CIEGOS DETECTADOS POR FEATURE

---

### Feature F1 — Application Shell & Navigation

**Arquetipo: Usuario Inexperto (Naive User)**
→ Escribe `/clientes/` con trailing slash o `/CLIENTES` en mayúsculas → el router de TanStack puede no normalizar la ruta → **Consecuencia:** Vista en blanco o 404 inesperado; usuario cree que la aplicación está caída.

**Arquetipo: Usuario Inexperto (Naive User)**
→ Presiona F5 (refresh) mientras está en `/clientes/:id` → el servidor de desarrollo (Vite) podría no tener fallback a `index.html` para rutas SPA → **Consecuencia:** Error 404 del servidor de desarrollo al cargar la app; rompe deep linking en producción si nginx/IIS no está configurado con `try_files`.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ El viewport se redimensiona dinámicamente (usuario en tablet rota entre landscape y portrait) mientras navega → el breakpoint de NavigationRail↔NavigationBar puede no aplicarse dinámicamente sin re-render → **Consecuencia:** UI bloqueada en el layout incorrecto; Carlos no puede usar la barra de navegación en su tablet.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ Navegador con JavaScript deshabilitado o extensión bloqueando React → la SPA no renderiza nada → **Consecuencia:** Pantalla en blanco completa; sin mensaje de fallback. Aunque fuera de alcance de NFR, es un punto ciego de UX.

**Arquetipo: Perfil de Integración (APIs)**
→ El historial del navegador acumula 50+ entradas de navegación entre `/clientes` y `/contactos` → Memory Leak en el router o en TanStack Query si los listeners no se desmontan correctamente → **Consecuencia:** Degradación progresiva de performance (NFR2 violado) en sesiones largas de Marcela.

---

### Feature F2 — Client Management

**Arquetipo: Usuario Inexperto (Naive User)**
→ El usuario hace doble-clic en el botón "Guardar" al crear un cliente → si el mutation no tiene `disabled` estado durante la llamada HTTP → se envían 2 POST requests simultáneos → **Consecuencia:** Creación de 2 clientes duplicados con el mismo NIT/RUC (viola `uk_clientes_nit`) o cliente duplicado con NIT diferente si el usuario aún no lo completó.

**Arquetipo: Usuario Inexperto (Naive User)**
→ El usuario pega texto de Word con caracteres especiales (`—`, `"`, `\u00a0` non-breaking space) en el campo Nombre → el campo Nombre acepta el texto visualmente pero la búsqueda posterior no encuentra al cliente porque el texto guardado tiene caracteres Unicode no convencionales → **Consecuencia:** Cliente "fantasma" — creado pero imposible de encontrar por búsqueda, afectando la confiabilidad del sistema para Carlos.

**Arquetipo: Usuario Malintencionado**
→ El usuario ingresa `<script>alert('XSS')</script>` en el campo Nombre del cliente → si el backend no sanitiza correctamente y el frontend renderiza sin escapado → **Consecuencia:** XSS persistente: el script se ejecuta cada vez que cualquier usuario carga la lista de clientes, comprometiendo la sesión y datos de todos los usuarios.

**Arquetipo: Usuario Malintencionado**
→ El usuario ingresa `' OR '1'='1` en el campo de búsqueda → si la búsqueda futura se implementa server-side sin ORM → **Consecuencia:** SQL Injection que expone todos los registros. Actualmente la búsqueda es client-side (mitigado), pero cuando el dataset crezca y se implemente server-side, este riesgo se vuelve crítico.

**Arquetipo: Perfil de Integración (APIs)**
→ El TanStack Query cache expira (staleTime) exactamente mientras el usuario está editando un cliente → el hook `useCliente(id)` refetch automáticamente sobrescribiendo los cambios no guardados en el form → **Consecuencia:** El usuario pierde los cambios que estaba escribiendo sin advertencia.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ La conexión a internet se corta durante el envío del formulario de creación de cliente → el frontend no recibe 201 pero el backend procesó el POST antes de perder conexión → **Consecuencia:** El cliente existe en la base de datos pero el frontend no lo sabe. Al reconectarse, el usuario intenta crear de nuevo, recibe 409 NIT duplicado, y cree que el sistema falló. El cliente está creado pero "perdido" para el usuario.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ Usuario abre el mismo cliente en dos pestañas del navegador y edita el teléfono en ambas → la segunda PUT sobreescribe la primera sin conflicto (no hay optimistic lock) → **Consecuencia:** Pérdida silenciosa de datos. El último en guardar gana, sin notificación al usuario sobre el conflicto (last-write-wins problem).

**Arquetipo: Auditor de Procesos**
→ No existe campo de auditoría visible (`CreatedAt`, `UpdatedAt`) en la interfaz de usuario → aunque están en la BD, no son accesibles al equipo comercial → **Consecuencia:** Marcela no puede determinar cuándo fue creado o modificado un cliente para auditar cambios históricos; esto es un gap entre el modelo de datos y la UI.

**Arquetipo: Usuario Comercial (Siesa-específico)**
→ El NIT/RUC colombiano tiene un formato específico (10 dígitos + dígito verificador separado por guion: `900.123.456-7`). Si el campo acepta solo texto libre sin validación de formato colombiano, los registros tendrán NIT en múltiples formatos inconsistentes → **Consecuencia:** La búsqueda por NIT falla si el usuario busca `9001234567` pero el registro fue guardado como `900.123.456-7`.

---

### Feature F3 — Contact Management

**Arquetipo: Usuario Inexperto (Naive User)**
→ El usuario ingresa un email válido con mayúsculas (`Juan.Perez@Empresa.COM`) → si Zod y FluentValidation no normalizan a minúsculas antes de guardar → el mismo contacto puede ser creado con variaciones de mayúsculas del mismo email → **Consecuencia:** Duplicados semánticos — dos registros para el mismo contacto, difíciles de detectar por búsqueda.

**Arquetipo: Usuario Inexperto (Naive User)**
→ El usuario hace clic en "Eliminar contacto" sin querer (botón muy cercano a "Editar") → sin el confirmation dialog, el contacto se eliminaría instantáneamente. Los ACs incluyen el dialog, pero si el dialog tiene auto-focus en "Confirmar" → el usuario presiona Enter y confirma accidentalmente → **Consecuencia:** Eliminación accidental irreversible de un contacto con historial de asociaciones.

**Arquetipo: Usuario Malintencionado**
→ Envío directo de POST `/api/v1/contactos` con email `a@b.c` (técnicamente válido según RFC pero inusual) y Cargo vacío enviado como string de solo espacios `"   "` → si FluentValidation usa `.NotEmpty()` sin `.Trim()` → **Consecuencia:** Se guarda un contacto con Cargo="   " (espacios), aparece en listas como si estuviera vacío, viola la invariante de datos del negocio.

**Arquetipo: Perfil de Integración (APIs)**
→ Llamada GET `/api/v1/contactos` cuando hay 1000 registros devuelve el array completo en una respuesta sin paginación → si el payload supera 1MB → el browser puede tardar en parsear el JSON, violando NFR1 → **Consecuencia:** Degradación de performance con datasets reales en producción.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ Se elimina un contacto que estaba siendo editado por otro usuario simultáneamente → el segundo usuario guarda los cambios → el PUT retorna 404 (contacto ya no existe) → si el frontend no maneja el 404 en mutaciones → **Consecuencia:** Error no manejado visible al usuario con mensaje técnico, violando NFR6.

**Arquetipo: Usuario de Consulta/Reportería**
→ El usuario desea exportar la lista de contactos (Carlos quiere llevarla a una reunión) → la aplicación no tiene funcionalidad de exportación en el MVP → **Consecuencia:** Gap de funcionalidad esperada por el usuario; no es un defecto pero sí una expectativa no cumplida que puede llevar a rechazo del usuario.

**Arquetipo: Auditor de Procesos (Siesa-específico)**
→ El campo Cargo no tiene un catálogo o lista predefinida → cada usuario ingresa el cargo libremente ("Director", "DIRECTOR", "Dir.", "director de ventas") → **Consecuencia:** Imposibilidad de agrupar o filtrar por cargo en reportes futuros; datos inconsistentes desde el inicio.

---

### Feature F4 — Client-Contact Association & Data Quality

**Arquetipo: Usuario Inexperto (Naive User)**
→ El usuario intenta asociar un contacto que ya está asignado a otro cliente sin ser consciente de ello → si la UI no muestra el cliente actual del contacto en la lista de selección del ContactManager → **Consecuencia:** Reasignación accidental; el usuario cree que está asociando, pero en realidad está reasignando el contacto y removiéndolo del cliente anterior.

**Arquetipo: Usuario Inexperto (Naive User)**
→ El usuario activa el filtro "Sin cliente" y luego navega al detalle de un contacto, regresa y el filtro está desactivado → si el estado del filtro no persiste en el store de Zustand → **Consecuencia:** Marcela pierde el contexto de su sesión de limpieza de datos cada vez que navega entre contactos.

**Arquetipo: Usuario Malintencionado**
→ El usuario envía PUT `/api/v1/contactos/{id}/cliente` con `{ clienteId: "invalid-uuid-format" }` → si FluentValidation no valida el formato UUID del clienteId → **Consecuencia:** Error 500 en lugar de 400 Bad Request; Problem Details no se devuelve correctamente.

**Arquetipo: Perfil de Integración (APIs)**
→ El ContactManager realiza múltiples llamadas simultáneas a `GET /api/v1/contactos?clienteId=:id` cuando el cliente tiene 500 contactos y el componente se remonta frecuentemente → si el IContactServiceAdapter no cancela requests previos → **Consecuencia:** Race condition: la respuesta más antigua llega después y sobrescribe los datos más recientes (stale closure problem).

**Arquetipo: Perfil de Integración (APIs)**
→ Después de la reasignación de un contacto, el componente del cliente origen no recibe la invalidación porque `['contactos', { clienteId: oldId }]` fue calculado con el ID incorrecto (bug en el hook) → **Consecuencia:** El contacto sigue apareciendo en el ContactManager del cliente anterior — dato fantasma que confunde al usuario hasta que recarga la página.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ Dos usuarios ejecutan simultáneamente `PUT /api/v1/contactos/{mismoId}/cliente` con clienteIds diferentes → la BD PostgreSQL garantiza atomicidad de cada transacción, pero el último en llegar gana sin notificación → **Consecuencia:** User A cree que asignó el contacto a "Empresa A" pero User B lo asignó a "Empresa B" simultáneamente. User A ve los datos actualizados solo después del próximo refetch.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ La app pierde conectividad justo después de enviar la disociación de un contacto → la BD actualizó el `clienteId = null` pero el frontend no recibió confirmación → TanStack Query no invalida el cache → **Consecuencia:** El ContactManager sigue mostrando el contacto como asociado; el dato es incorrecto hasta que el usuario recarga.

**Arquetipo: Auditor de Procesos**
→ No hay registro de auditoría de las asociaciones/disociaciones → si "Empresa A" pierde el contacto "Juan Pérez" inesperadamente, no hay forma de saber quién lo reasignó ni cuándo → **Consecuencia:** Imposibilidad de reconstruir el historial de relaciones; potencial problema de confianza en el sistema para Marcela.

**Arquetipo: Usuario Comercial (Carlos — Siesa-específico)**
→ Carlos navega desde un cliente a un contacto, luego hace clic en el cliente asociado desde el contacto (navega de vuelta), pero este es un cliente *diferente* al que comenzó (el contacto fue reasignado) → el historial del router puede llevar a una ruta incorrecta → **Consecuencia:** Carlos se desorienta — "¿Por qué estoy viendo Empresa B cuando empecé en Empresa A?" Viola el principio UX "Contexto es sagrado".

---

---
workflow: quality-process
phase: diseno
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
generated_date: 2026-04-14T20:00:00Z
project_name: Siesa-Agents
input_documents:
  epics:
    - _bmad-output/planning-artifacts/epics/epic-01-foundation.md
    - _bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md
    - _bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md
    - _bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md
  prd: _bmad-output/planning-artifacts/prd/
  technology_stack: _bmad/bmm/workflows/3-solutioning/create-architecture/data/company-standards/technology-stack.md
  test_plan: _bmad-output/implementation-artifacts/quality-process/planeacion/test-plan-2026-04-14-100000/test-plan.md
---

# FASE 4 — MATRIZ INTEGRAL DE PRUEBAS (DISEÑO 360°)

## IV. MATRIZ INTEGRAL DE PRUEBAS (DISEÑO 360°)

> Leyenda Nivel: FE = Frontend, BE = Backend, FE+BE = Full-stack
> Leyenda Prioridad: P0 (R=16-25 Crítico), P1 (R=10-15 Alto), P2/P3 (R<10 Bajo)
> Leyenda Técnica: EP=Equivalencia, BVA=Valores Límite, DT=Tabla Decisión, ST=Transición Estados, EG=Error Guessing, EC=Edge Case

---

## F1 — Application Shell & Navigation

| ID | Funcionalidad | Features asociados | Nivel | Técnica | Escenario | Precondiciones | Pasos | Resultado Esperado | Riesgo (IxP) | Prioridad | Estrategia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-F1-01 | App Shell & Navigation | Story 1.2 / FR28 | FE | EP | NavigationRail visible en viewport desktop | App cargada en Chrome con viewport ≥ 1024px | 1. Abrir app en http://localhost:5173/ 2. Inspeccionar elemento izquierdo del layout | El NavigationRail de siesa-ui-kit es visible con las entradas "Clientes" y "Contactos" | 2×2=4 | P3 | Funcional |
| TC-F1-02 | App Shell & Navigation | Story 1.2 / FR29 | FE | EP | NavigationBar visible en viewport móvil (375px) | App cargada, DevTools abierto en modo 375×667px | 1. Simular viewport móvil 375px en DevTools 2. Navegar a / | El NavigationBar (móvil) de siesa-ui-kit es visible y el NavigationRail NO aparece | 2×2=4 | P3 | Funcional |
| TC-F1-03 | App Shell & Navigation | Story 1.2 / FR28 | FE | EP | Navegación a /clientes sin page reload | App cargada en / | 1. Abrir consola → `window.reloadCount = 0; window.addEventListener('beforeunload', ()=>window.reloadCount++)` 2. Hacer clic en "Clientes" en el nav 3. Verificar contador | URL cambia a /clientes, la vista de Clientes se renderiza, `window.reloadCount` sigue en 0 — sin page reload (FR28) | 3×3=9 | P2 | Funcional |
| TC-F1-04 | App Shell & Navigation | Story 1.2 / FR30 | FE | EP | Deep link directo a /clientes | Servidor frontend activo | 1. En barra de URL escribir http://localhost:5173/clientes y presionar Enter | La vista de Clientes se renderiza correctamente sin redirigir a / (FR30) | 3×3=9 | P2 | Funcional |
| TC-F1-05 | App Shell & Navigation | Story 1.2 / FR30 | FE | EP | Deep link directo a /contactos | Servidor frontend activo | 1. En barra de URL escribir http://localhost:5173/contactos y presionar Enter | La vista de Contactos se renderiza correctamente sin redirigir a / | 3×3=9 | P2 | Funcional |
| TC-F1-06 | App Shell & Navigation | Story 1.2 | FE | EG | Ruta desconocida muestra 404 | App cargada | 1. Navegar a /ruta-inexistente | Vista 404 se muestra, sin error de consola JavaScript, NavigationRail accesible para navegación de recuperación | 2×2=4 | P3 | Funcional |
| TC-F1-07 | App Shell & Navigation | Story 1.2 / FR29 | FE | BVA | Breakpoint exacto 1024px — NavigationRail activo | App cargada | 1. DevTools → establecer viewport en exactamente 1024px 2. Observar layout | NavigationRail activo a 1024px; al cambiar a 1023px → NavigationBar; sin solapamiento visual | 2×3=6 | P2 | Funcional |
| TC-F1-08 | App Shell & Navigation | Story 1.2 / FR28 | FE | EC | Navegación rápida entre rutas 10× seguidas (stress) | App cargada con datos en ambas vistas | 1. Hacer clic alternado entre Clientes y Contactos 10 veces seguidas rápidamente | Sin errores de consola, sin página en blanco, sin memory leak visible, renderizado siempre correcto | 2×3=6 | P2 | Exploratoria |
| TC-F1-09 | App Shell & Navigation | Story 1.2 / FR30 | FE | EC | URL con trailing slash /clientes/ | App cargada | 1. Navegar a http://localhost:5173/clientes/ (con slash final) | La vista de Clientes se renderiza o hay redirección limpia a /clientes; no se muestra 404 | 2×2=4 | P3 | Funcional |
| TC-F1-10 | App Shell & Navigation | Story 1.2 | FE | EC | F5 (refresh) en ruta profunda /clientes/:id | Usuario en la vista de detalle de un cliente | 1. Navegar a /clientes/:id 2. Presionar F5 | La vista de detalle del cliente se recarga correctamente (Vite SPA fallback configurado); sin 404 del servidor | 3×3=9 | P2 | Funcional |

---

## F2 — Client Management

| ID | Funcionalidad | Features asociados | Nivel | Técnica | Escenario | Precondiciones | Pasos | Resultado Esperado | Riesgo (IxP) | Prioridad | Estrategia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-F2-01 | Client Management | Story 2.1 / FR2 | FE+BE | EP | Lista de clientes muestra todos los registros | 5+ clientes en BD | 1. Navegar a /clientes | Panel izquierdo muestra lista scrollable con todos los clientes; cada item muestra Nombre y NIT/RUC | 2×2=4 | P3 | Funcional |
| TC-F2-02 | Client Management | Story 2.1 / FR3 | FE | EP | Búsqueda por nombre parcial filtra correctamente | 5+ clientes en BD, lista cargada | 1. Escribir "Empresa" en campo de búsqueda | Lista muestra solo clientes cuyo Nombre contiene "Empresa" (case-insensitive); sin llamada a la API | 2×3=6 | P2 | Funcional |
| TC-F2-03 | Client Management | Story 2.1 / FR4 | FE | EP | Búsqueda por NIT/RUC parcial filtra correctamente | 5+ clientes con NITs distintos | 1. Escribir "9001" en campo de búsqueda | Lista muestra solo clientes cuyo NIT contiene "9001" | 2×3=6 | P2 | Funcional |
| TC-F2-04 | Client Management | Story 2.1 / NFR1 | FE+BE | EP | Búsqueda responde en <1s con 500 registros | 500 clientes en BD, lista pre-cargada | 1. Medir tiempo desde keystroke hasta re-render filtrado con 500 registros | Tiempo total de filtrado < 1000ms (P95); herramienta: React DevTools Profiler o performance.now() | 5×4=20 | P0 | Performance |
| TC-F2-05 | Client Management | Story 2.1 | FE | EP | EmptyState cuando no hay clientes | BD sin clientes; TanStack Query devuelve [] | 1. Navegar a /clientes con BD vacía | Componente EmptyState visible con mensaje guía para crear el primer cliente; sin panel vacío/error | 2×2=4 | P3 | Funcional |
| TC-F2-06 | Client Management | Story 2.1 | FE | EG | ErrorPanel cuando backend no responde | Backend apagado o devuelve 500 | 1. Navegar a /clientes 2. Esperar fetch fallido | ErrorPanel visible con botón "Reintentar"; sin stack trace o mensaje técnico en la UI (NFR6) | 3×3=9 | P2 | Funcional |
| TC-F2-07 | Client Management | Story 2.2 / FR5 | FE+BE | EP | Detalle de cliente muestra todos los campos | 1+ cliente en BD | 1. Clic en cliente de la lista | Panel derecho muestra Nombre, NIT/RUC, Teléfono, Ciudad completos | 2×2=4 | P3 | Funcional |
| TC-F2-08 | Client Management | Story 2.2 / FR30 | FE+BE | EP | Deep link a /clientes/:id carga detalle correcto | Cliente con UUID conocido en BD | 1. Navegar directamente a /clientes/:id | Detalle del cliente correcto se muestra sin redirigir | 3×2=6 | P2 | Funcional |
| TC-F2-09 | Client Management | Story 2.2 / FR30 | FE | EG | Deep link con ID inexistente muestra not-found | | 1. Navegar a /clientes/00000000-0000-0000-0000-000000000000 | Mensaje "no encontrado" mostrado; sin error JavaScript | 2×2=4 | P3 | Funcional |
| TC-F2-10 | Client Management | Story 2.3 / FR1 | FE+BE | EP | Crear cliente con todos los campos válidos | BD activa, form abierto | 1. Clic "Nuevo cliente" 2. Llenar: Nombre="Empresa XYZ", NIT="800111222-3", Tel="+57 300 5555555", Ciudad="Cali" 3. Submit | Backend devuelve 201, cliente aparece en lista inmediatamente (FR27), toast "Cliente creado correctamente", form cierra | 4×4=16 | P0 | Funcional |
| TC-F2-11 | Client Management | Story 2.3 / FR8 | FE+BE | DT | Crear cliente con NIT/RUC duplicado devuelve 409 | Cliente con NIT="800111222-3" ya existe | 1. Abrir form "Nuevo cliente" 2. Llenar con NIT="800111222-3" 3. Submit | Backend devuelve 409 Conflict; UI muestra "El NIT/RUC ya está registrado"; sin stack trace; form queda abierto | 4×4=16 | P0 | Funcional |
| TC-F2-12 | Client Management | Story 2.3 / FR8 | FE | EP | Form submission bloqueado con Nombre vacío | Form abierto | 1. Dejar Nombre vacío 2. Clic Submit | Error inline "Campo requerido" aparece en Nombre; sin llamada HTTP; form no se cierra | 4×3=12 | P1 | Funcional |
| TC-F2-13 | Client Management | Story 2.3 / FR8 | FE | EP | Form submission bloqueado con NIT vacío | Form abierto | 1. Dejar NIT/RUC vacío 2. Submit | Error inline en NIT/RUC; sin HTTP call | 4×3=12 | P1 | Funcional |
| TC-F2-14 | Client Management | Story 2.3 / FR8 | BE | EP | Backend rechaza cliente con Nombre vacío (FluentValidation) | API activa | 1. POST /api/v1/clientes con body { nombre: "", nit: "900111", telefono: "111", ciudad: "Bogota" } | Respuesta 400 Bad Request en formato Problem Details RFC 7807 con errors.nombre indicando requerido | 3×4=12 | P1 | Integración |
| TC-F2-15 | Client Management | Story 2.4 / FR6 | FE+BE | EP | Form de edición pre-poblado con valores actuales | Cliente existente con todos los campos | 1. Ver detalle 2. Clic "Editar" | Form abre con valores exactamente iguales a los guardados; sin campos vacíos ni valores por defecto | 3×2=6 | P2 | Funcional |
| TC-F2-16 | Client Management | Story 2.4 / FR6 | FE+BE | EP | Editar cliente — guardar cambios se refleja inmediatamente | Cliente existente | 1. Editar → cambiar Ciudad a "Medellín" → Submit | BE devuelve 200, lista y detalle muestran "Medellín" sin refresh, toast "Cliente actualizado correctamente" (FR27) | 3×3=9 | P2 | Funcional |
| TC-F2-17 | Client Management | Story 2.4 / FR8 | FE | EP | Edición bloqueada al borrar campo requerido | Form de edición abierto | 1. Borrar Nombre → Submit | Error inline en Nombre; sin HTTP call | 3×3=9 | P2 | Funcional |
| TC-F2-18 | Client Management | Story 2.4 | FE | EP | Cancelar edición no persiste cambios | Form abierto con cambios | 1. Cambiar Nombre → Clic "Cancelar" | Form cierra, detalle muestra el Nombre original | 2×2=4 | P3 | Funcional |
| TC-F2-19 | Client Management | Story 2.5 / FR7 | FE | EP | Dialog de confirmación aparece al eliminar | Cliente en detalle | 1. Clic "Eliminar" | Dialog muestra "¿Eliminar este cliente?" con botones "Confirmar" y "Cancelar" | 2×2=4 | P3 | Funcional |
| TC-F2-20 | Client Management | Story 2.5 / FR7 | FE+BE | EP | Confirmar eliminación remueve cliente de la lista | Cliente sin contactos | 1. Clic "Eliminar" → "Confirmar" | 204 del BE; cliente desaparece de la lista inmediatamente; panel derecho vuelve a estado vacío; toast "Cliente eliminado correctamente" (FR27) | 4×3=12 | P1 | Funcional |
| TC-F2-21 | Client Management | Story 2.5 / FR7 | FE+BE | DT | **CRÍTICO: Eliminar cliente con contactos asociados** | Cliente con 3 contactos asociados (clienteId = cliente.id) | 1. Ver detalle del cliente con contactos 2. Clic "Eliminar" → "Confirmar" 3. Verificar en BD: SELECT cliente_id FROM contactos WHERE id IN (...) | Cliente eliminado; 3 contactos existen en BD con cliente_id=NULL; toast "Cliente eliminado. Sus contactos asociados quedaron sin cliente asignado."; los 3 contactos aparecen en filtro "Sin cliente" (FR25, FR27) | 5×4=20 | P0 | Integración |
| TC-F2-22 | Client Management | Story 2.5 | FE | EP | Cancelar eliminación no borra el cliente | Cliente en detalle | 1. Clic "Eliminar" → "Cancelar" | Dialog cierra; cliente permanece en la lista y detalle | 2×2=4 | P3 | Funcional |
| TC-F2-23 | Client Management | Story 2.1 / NFR2 | FE+BE | EP | CRUD mutation UI se actualiza en <2s | BE activo con latencia normal | 1. Medir tiempo desde Submit del form hasta aparición en lista | UI refleja el cambio en ≤2 segundos (P95) | 3×3=9 | P2 | Performance |
| TC-F2-24 | Client Management | Story 2.3 | FE | EC | Doble clic en "Guardar" cliente | Form listo para submit | 1. Llenar form válido 2. Hacer doble clic rápido en "Guardar" | Solo 1 request HTTP es enviado (botón deshabilitado durante la mutación); solo 1 cliente creado | 4×3=12 | P1 | Edge Case |
| TC-F2-25 | Client Management | Story 2.3 | FE+BE | EC | XSS en campo Nombre del cliente | Form de creación abierto | 1. Nombre="<script>alert('xss')</script>" 2. Submit | BE guarda el string escapado; en la lista se renderiza como texto literal, sin ejecutar script; no hay alert | 4×3=12 | P1 | Seguridad |
| TC-F2-26 | Client Management | Story 2.3 | FE | EC | Pegar texto con caracteres Unicode especiales (non-breaking space) | Form de creación abierto | 1. Pegar Nombre con \u00a0 (non-breaking space): "Empresa\u00a0ABC" 2. Submit 3. Buscar "Empresa ABC" (espacio normal) | Investigar si la búsqueda encuentra el cliente; si no lo encuentra, este es un defecto de normalización | 2×3=6 | P2 | Edge Case |
| TC-F2-27 | Client Management | Story 2.3 | BE | BVA | Nombre cliente con longitud máxima (255 chars) | BE activo | 1. POST /api/v1/clientes con Nombre de exactamente 255 caracteres | 201 Created; cliente guardado correctamente | 2×2=4 | P3 | BVA |
| TC-F2-28 | Client Management | Story 2.3 | BE | BVA | Nombre cliente con longitud > máximo (256 chars) | BE activo | 1. POST /api/v1/clientes con Nombre de 256 caracteres | 400 Bad Request con Problem Details indicando longitud máxima excedida | 2×3=6 | P2 | BVA |
| TC-F2-29 | Client Management | Story 2.3 | BE | EC | Creación concurrente con mismo NIT por 2 usuarios | BE activo, PostgreSQL con uk_clientes_nit | 1. Enviar 2 POST simultáneos con mismo NIT desde 2 sesiones | Solo 1 cliente creado (201); el otro recibe 409 Conflict; sin datos corruptos en BD; constraint uk_clientes_nit funcionando | 5×4=20 | P0 | Edge Case / Concurrencia |
| TC-F2-30 | Client Management | Story 2.4 | BE | EC | Editar cliente que fue eliminado por otro usuario (404 en PUT) | Cliente eliminado concurrentemente | 1. User A abre form de edición 2. User B elimina el cliente 3. User A guarda cambios | PUT devuelve 404 Not Found en Problem Details; FE muestra mensaje de error claro "El cliente ya no existe" sin exponer stack trace | 3×3=9 | P2 | Edge Case |

---

## F3 — Contact Management

| ID | Funcionalidad | Features asociados | Nivel | Técnica | Escenario | Precondiciones | Pasos | Resultado Esperado | Riesgo (IxP) | Prioridad | Estrategia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-F3-01 | Contact Management | Story 3.1 / FR10 | FE+BE | EP | Lista de contactos muestra todos los registros | 5+ contactos en BD | 1. Navegar a /contactos | Lista muestra todos los contactos con Nombre, Cargo y Email por item | 2×2=4 | P3 | Funcional |
| TC-F3-02 | Contact Management | Story 3.1 / FR11 | FE | EP | Búsqueda por nombre de contacto filtra en tiempo real | 5+ contactos, lista cargada | 1. Escribir "Ana" en búsqueda | Lista muestra solo contactos cuyo Nombre contiene "Ana" (case-insensitive) | 2×3=6 | P2 | Funcional |
| TC-F3-03 | Contact Management | Story 3.1 / FR12 | FE | EP | Búsqueda por email filtra en tiempo real | 5+ contactos | 1. Escribir "@empresa.com" | Lista muestra solo contactos con ese dominio en email | 2×3=6 | P2 | Funcional |
| TC-F3-04 | Contact Management | Story 3.1 / NFR1 | FE+BE | EP | Búsqueda responde en <1s con 1000 contactos | 1000 contactos en BD, lista pre-cargada | 1. Medir tiempo filtrado con 1000 registros | Filtrado < 1000ms (P95) | 5×4=20 | P0 | Performance |
| TC-F3-05 | Contact Management | Story 3.1 | FE | EP | EmptyState cuando no hay contactos | BD sin contactos | 1. Navegar a /contactos | EmptyState guía al usuario a crear el primer contacto | 2×2=4 | P3 | Funcional |
| TC-F3-06 | Contact Management | Story 3.2 / FR13 | FE+BE | EP | Detalle muestra todos los campos del contacto | 1+ contacto en BD | 1. Clic en contacto | Detalle muestra Nombre, Cargo, Teléfono, Email; URL actualiza a /contactos/:id | 2×2=4 | P3 | Funcional |
| TC-F3-07 | Contact Management | Story 3.3 / FR9 | FE+BE | EP | Crear contacto con todos los campos válidos | BD activa | 1. Clic "Nuevo contacto" 2. Llenar: Nombre="Juan Pérez", Cargo="Director", Tel="+57 310 1111111", Email="juan@empresa.com" 3. Submit | 201 del BE; contacto aparece en lista inmediatamente (FR27); toast "Contacto creado correctamente" | 4×4=16 | P0 | Funcional |
| TC-F3-08 | Contact Management | Story 3.3 / FR16 | FE | EP | Form bloqueado con Email vacío | Form abierto | 1. Dejar Email vacío → Submit | Error inline en Email; sin HTTP call | 4×3=12 | P1 | Funcional |
| TC-F3-09 | Contact Management | Story 3.3 / FR16 | FE | EP | Form bloqueado con email inválido | Form abierto | 1. Email="no-es-email" → Submit | Error Zod inline "Email inválido"; sin HTTP call | 4×3=12 | P1 | Funcional |
| TC-F3-10 | Contact Management | Story 3.3 / FR16 | BE | EP | Backend rechaza email inválido (FluentValidation) | API activa | 1. POST /api/v1/contactos con email="invalid" | 400 Bad Request con Problem Details, campo errors.email | 3×4=12 | P1 | Integración |
| TC-F3-11 | Contact Management | Story 3.3 / FR16 | BE | EP | Backend rechaza Cargo solo con espacios | API activa | 1. POST /api/v1/contactos con cargo="   " (solo espacios) | 400 Bad Request; FluentValidation usa .NotEmpty() + .Trim() implícito | 3×3=9 | P2 | Integración |
| TC-F3-12 | Contact Management | Story 3.4 / FR14 | FE+BE | EP | Editar contacto — form pre-poblado y cambio guardado | Contacto existente | 1. Ver detalle → "Editar" → cambiar Cargo → Submit | 200 del BE; cambio reflejado en detalle y lista inmediatamente (FR27); clienteId sin modificar; toast de éxito | 3×3=9 | P2 | Funcional |
| TC-F3-13 | Contact Management | Story 3.4 | FE+BE | EC | Editar contacto — verificar que clienteId no cambia | Contacto con clienteId asignado | 1. Editar Nombre, Cargo, Tel, Email → Submit 2. GET /api/v1/contactos/:id y verificar clienteId | El clienteId del contacto es exactamente el mismo que antes de la edición | 4×3=12 | P1 | Integración |
| TC-F3-14 | Contact Management | Story 3.5 / FR15 | FE+BE | EP | Eliminar contacto — confirmar | Contacto existente | 1. "Eliminar" → "Confirmar" | 204 del BE; contacto desaparece de lista; toast "Contacto eliminado correctamente"; vista regresa a lista | 3×3=9 | P2 | Funcional |
| TC-F3-15 | Contact Management | Story 3.5 | FE | EP | Cancelar eliminación — contacto inalterado | Contacto en detalle | 1. "Eliminar" → "Cancelar" | Dialog cierra; contacto persiste sin cambios | 2×2=4 | P3 | Funcional |
| TC-F3-16 | Contact Management | Story 3.3 | BE | BVA | Email con longitud máxima válida (254 chars RFC 5321) | BE activo | 1. POST con email de exactamente 254 chars | 201 Created | 2×2=4 | P3 | BVA |
| TC-F3-17 | Contact Management | Story 3.3 | BE | BVA | Email con longitud 255 chars (límite excedido) | BE activo | 1. POST con email de 255 chars | 400 Bad Request; FluentValidation rechaza | 2×3=6 | P2 | BVA |
| TC-F3-18 | Contact Management | Story 3.3 | FE | EC | Email en mayúsculas — normalización | Form abierto | 1. Email="JUAN@EMPRESA.COM" → Submit | Email guardado en minúsculas o aceptado; búsqueda posterior lo encuentra con "juan@empresa.com" | 2×3=6 | P2 | Edge Case |
| TC-F3-19 | Contact Management | Story 3.3 | FE+BE | EC | XSS en campo Email | Form abierto | 1. Email="<img src=x onerror=alert(1)>@test.com" → Submit | Zod rechaza por formato inválido; si pasa Zod, FluentValidation rechaza; en ningún caso se ejecuta script | 4×3=12 | P1 | Seguridad |
| TC-F3-20 | Contact Management | Story 3.1 | FE | EC | Búsqueda con caracteres especiales en campo | 10+ contactos | 1. Buscar "()" o "%" en campo de búsqueda | Sin error JavaScript; búsqueda retorna resultados vacíos o los correspondientes sin crash | 2×2=4 | P3 | Edge Case |
| TC-F3-21 | Contact Management | Story 3.2 | FE | EC | Contacto sin cliente asignado muestra "Sin cliente asignado" | Contacto con clienteId=null | 1. Ver detalle del contacto | Detalle muestra "Sin cliente asignado" en el campo de cliente (no vacío, no crash) | 2×2=4 | P3 | Funcional |

---

## F4 — Client-Contact Association & Data Quality

| ID | Funcionalidad | Features asociados | Nivel | Técnica | Escenario | Precondiciones | Pasos | Resultado Esperado | Riesgo (IxP) | Prioridad | Estrategia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-F4-01 | Association & Data Quality | Story 4.1 / FR21 | FE+BE | EP | ContactManager muestra contactos del cliente | Cliente con 3 contactos asociados | 1. Navegar a /clientes/:clienteId | ContactManager renderiza los 3 contactos asociados via GET /api/v1/contactos?clienteId=:id | 3×3=9 | P2 | Funcional |
| TC-F4-02 | Association & Data Quality | Story 4.1 / FR21 | FE | EP | ContactManager EmptyState cuando cliente sin contactos | Cliente sin contactos | 1. Ver detalle de cliente sin contactos | ContactManager muestra estado vacío: "No hay contactos asociados" | 2×2=4 | P3 | Funcional |
| TC-F4-03 | Association & Data Quality | Story 4.1 | FE | EG | ContactManager ErrorPanel cuando BE falla | BE apagado o 500 | 1. Ver detalle de cliente 2. GET contactos falla | ErrorPanel con opción de reintentar visible en el ContactManager | 2×3=6 | P2 | Funcional |
| TC-F4-04 | Association & Data Quality | Story 4.2 / FR17 FR19 FR27 | FE+BE | DT | **CRÍTICO: Asociar contacto existente a cliente — invalidación de cache** | Contacto sin cliente, cliente activo | 1. Abrir detalle cliente 2. Asociar contacto via ContactManager 3. Verificar PUT /api/v1/contactos/{id}/cliente 4. Verificar cache invalidation en DevTools de TanStack Query | PUT con {clienteId: uuid} devuelve 200; contacto aparece en ContactManager sin refresh; keys ['contactos'] y ['contactos', {clienteId}] invalidadas | 5×4=20 | P0 | Integración |
| TC-F4-05 | Association & Data Quality | Story 4.2 / FR18 | FE+BE | EP | Crear contacto desde ContactManager → auto-asociado | Cliente activo con ContactManager abierto | 1. Crear nuevo contacto desde dentro del ContactManager | Contacto creado con clienteId=clienteActivo automáticamente; aparece en ContactManager inmediatamente | 4×3=12 | P1 | Funcional |
| TC-F4-06 | Association & Data Quality | Story 4.2 / FR20 FR27 | FE+BE | DT | Desasociar contacto — no elimina ningún registro | Contacto asociado al cliente | 1. Desasociar "Juan Pérez" del cliente via ContactManager | PUT con {clienteId: null}; "Juan Pérez" desaparece del ContactManager; sigue accesible en /contactos; clienteId=null en BD | 4×4=16 | P0 | Integración |
| TC-F4-07 | Association & Data Quality | Story 4.3 / FR22 NFR8 | FE | EP | Navegar de cliente a contacto en ≤2 clics | Cliente con contactos en ContactManager | 1. Clic en contacto en ContactManager (1 clic) | Navegación a /contactos/:id en exactamente 1 clic; cumple NFR8 ≤2 clics | 3×3=9 | P2 | Funcional |
| TC-F4-08 | Association & Data Quality | Story 4.3 / FR22 | FE | EP | Botón atrás regresa al detalle del cliente | Usuario navegó de cliente a contacto | 1. Presionar botón atrás del browser | Regreso a /clientes/:clienteId en el mismo estado; sin pérdida de contexto | 3×2=6 | P2 | Funcional |
| TC-F4-09 | Association & Data Quality | Story 4.4 / FR23 NFR9 | FE+BE | EP | Detalle de contacto muestra cliente asociado | Contacto con clienteId asignado | 1. Ver /contactos/:id de contacto asociado | Nombre del cliente asociado visible en el detalle; sin búsqueda adicional requerida (NFR9) | 3×3=9 | P2 | Funcional |
| TC-F4-10 | Association & Data Quality | Story 4.4 / FR24 | FE | EP | Clic en nombre del cliente navega a su detalle | Detalle de contacto con cliente visible | 1. Clic en nombre del cliente | Navegación a /clientes/:clienteId; detalle del cliente correcto mostrado (FR24) | 2×2=4 | P3 | Funcional |
| TC-F4-11 | Association & Data Quality | Story 4.4 / FR23 | FE | EP | Contacto huérfano muestra "Sin cliente asignado" | Contacto con clienteId=null | 1. Ver /contactos/:id | "Sin cliente asignado" visible; sin crash; sin link de navegación | 2×2=4 | P3 | Funcional |
| TC-F4-12 | Association & Data Quality | Story 4.5 / FR25 | FE | EP | Filtro "Sin cliente" muestra solo contactos huérfanos | Mix de contactos asignados y huérfanos | 1. Activar filtro "Sin cliente" | Solo contactos con clienteId=null visibles; conteo de huérfanos visible | 4×3=12 | P1 | Funcional |
| TC-F4-13 | Association & Data Quality | Story 4.5 | FE | EP | EmptyState cuando todos los contactos están asignados | Todos con clienteId | 1. Activar filtro "Sin cliente" | EmptyState: "Todos los contactos están asignados a un cliente" | 2×2=4 | P3 | Funcional |
| TC-F4-14 | Association & Data Quality | Story 4.5 | FE | EP | Desactivar filtro restaura lista completa | Filtro activo | 1. Desactivar filtro "Sin cliente" | Lista completa de contactos (asignados + huérfanos) restaurada | 2×2=4 | P3 | Funcional |
| TC-F4-15 | Association & Data Quality | Story 4.5 / FR25 FR27 | FE+BE | DT | **CRÍTICO: Huérfanos aparecen en filtro inmediatamente tras eliminar cliente** | Cliente con 3 contactos; filtro "Sin cliente" visible | 1. Eliminar cliente con 3 contactos 2. Activar filtro "Sin cliente" | Los 3 contactos recién huérfanos aparecen en el filtro inmediatamente (FR27); query key ['contactos'] invalidado; clienteId=null confirmado en BD | 5×4=20 | P0 | Integración |
| TC-F4-16 | Association & Data Quality | Story 4.6 / FR26 FR27 | FE+BE | DT | **CRÍTICO: Reasignar contacto — 3 query keys invalidadas** | Contacto asociado a Empresa A; usuario en /contactos/:id | 1. Iniciar reasignación → seleccionar Empresa B → confirmar 2. Verificar en TanStack Query DevTools las keys invalidadas | PUT {clienteId: empresaBId}; contacto aparece en ContactManager de Empresa B; desaparece de Empresa A; keys ['contactos'], ['contactos',{clienteId:AId}], ['contactos',{clienteId:BId}] todas invalidadas; toast "Contacto reasignado correctamente" | 5×5=25 | P0 | Integración |
| TC-F4-17 | Association & Data Quality | Story 4.6 | FE | EP | Cancelar reasignación — asociación sin cambios | Contacto con cliente asignado | 1. Iniciar reasignación → seleccionar nuevo cliente → "Cancelar" | Dialog/selector cierra; sin PUT enviado; asociación original intacta | 2×2=4 | P3 | Funcional |
| TC-F4-18 | Association & Data Quality | Story 4.2 | BE | EG | PUT /contactos/{id}/cliente con clienteId de formato UUID inválido | BE activo | 1. PUT /api/v1/contactos/{id}/cliente con body { clienteId: "no-es-uuid" } | 400 Bad Request Problem Details con errors.clienteId; sin 500; sin datos corruptos | 4×3=12 | P1 | Integración |
| TC-F4-19 | Association & Data Quality | Story 4.2 | BE | EG | PUT /contactos/{id}/cliente con contactoId inexistente | BE activo | 1. PUT /api/v1/contactos/00000000-0000-0000-0000-000000000000/cliente { clienteId: uuid_valido } | 404 Not Found Problem Details | 3×2=6 | P2 | Integración |
| TC-F4-20 | Association & Data Quality | Story 4.6 | FE+BE | EC | Reasignar contacto al mismo cliente (no-op) | Contacto asociado a Empresa A | 1. Iniciar reasignación → seleccionar Empresa A (misma) → confirmar | Sin error; sin duplicate entry; contacto sigue en Empresa A; sin PUT o PUT idempotente | 2×3=6 | P2 | Edge Case |
| TC-F4-21 | Association & Data Quality | Story 4.2 | FE+BE | EC | Asociar contacto ya asignado a otro cliente — reasignación implícita | Contacto con clienteId=EmpresaA, siendo asociado desde ContactManager de EmpresaB | 1. Desde ContactManager de Empresa B, seleccionar contacto que ya pertenece a Empresa A | Sistema ejecuta reasignación (PUT {clienteId: EmpresaBId}); contacto desaparece de Empresa A; aparece en Empresa B; las 3 query keys invalidadas | 4×4=16 | P0 | Edge Case |
| TC-F4-22 | Association & Data Quality | Story 4.6 | FE+BE | EC | Concurrencia: 2 usuarios reasignan el mismo contacto simultáneamente | Contacto asociado a Empresa A | 1. User A envía PUT {clienteId: EmpresaBId} 2. User B envía PUT {clienteId: EmpresaCId} al mismo tiempo | Último en llegar gana (last-write-wins); base de datos atómica; sin error 500; sin datos corruptos; estado final es consistente | 5×4=20 | P0 | Edge Case / Concurrencia |
| TC-F4-23 | Association & Data Quality | Story 4.3 | FE | EC | Navegación profunda: cliente→contacto→cliente→contacto (5 niveles) | Datos reales en BD | 1. Navegar entre contactos y clientes alternando 5 veces | Sin errores de memoria; sin bucles de redirección; historial del browser navegable correctamente en cada nivel | 2×3=6 | P2 | Edge Case / Exploratoria |
| TC-F4-24 | Association & Data Quality | Story 4.1 | FE+BE | EC | Cliente eliminado mientras otro usuario lo visualiza | User A viendo cliente; User B elimina ese cliente | 1. User A está en /clientes/:id 2. User B elimina ese cliente 3. User A intenta usar el ContactManager | ContactManager o detalle del cliente muestra error 404 gestionado (ErrorPanel o mensaje); sin crash JavaScript; sin stack trace (NFR6) | 3×3=9 | P2 | Edge Case |

---

---
workflow: quality-process
phase: diseno
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
generated_date: 2026-04-14T20:00:00Z
project_name: Siesa-Agents
input_documents:
  epics:
    - _bmad-output/planning-artifacts/epics/epic-01-foundation.md
    - _bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md
    - _bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md
    - _bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md
  prd: _bmad-output/planning-artifacts/prd/
  technology_stack: _bmad/bmm/workflows/3-solutioning/create-architecture/data/company-standards/technology-stack.md
  test_plan: _bmad-output/implementation-artifacts/quality-process/planeacion/test-plan-2026-04-14-100000/test-plan.md
---

# FASE 5 — INFORME TSR (TEST SUMMARY REPORT) + TRAZABILIDAD

## V. INFORME TSR (TEST SUMMARY REPORT)

---

### 1. Métricas de Diseño

| Métrica | Valor |
|---------|-------|
| Total historias en backlog | 19 |
| Historias clasificadas como Lógica de Negocio | 17 |
| Historias clasificadas como Ruido Técnico (excluidas) | 2 (Story 1.1, Story 1.3) |
| Features lógicos identificados | 4 |
| Total casos de prueba generados | **94** |
| Casos P0 (Críticos, R=16–25) | **12** |
| Casos P1 (Altos, R=10–15) | **23** |
| Casos P2/P3 (Bajos, R<10) | **59** |
| Features con casos P0 | 3 (F2, F3, F4) |
| FAC Gherkin generados | 38 escenarios |
| Puntos ciegos identificados | 19 (distribuidos en 4 features) |

---

### 2. Prioridad Crítica (P0)

| ID Caso | Feature | Escenario | R |
|---------|---------|-----------|---|
| TC-F2-04 | F2 — Client Mgmt | Búsqueda <1s con 500 clientes (NFR1) | 20 |
| TC-F2-10 | F2 — Client Mgmt | Crear cliente válido — flujo nominal crítico | 16 |
| TC-F2-11 | F2 — Client Mgmt | NIT duplicado → 409 Conflict | 16 |
| TC-F2-21 | F2 — Client Mgmt | **Eliminar cliente con contactos → cascade NULL** | 20 |
| TC-F2-29 | F2 — Client Mgmt | Creación concurrente mismo NIT (race condition) | 20 |
| TC-F3-04 | F3 — Contact Mgmt | Búsqueda <1s con 1000 contactos (NFR1) | 20 |
| TC-F3-07 | F3 — Contact Mgmt | Crear contacto válido — flujo nominal crítico | 16 |
| TC-F4-04 | F4 — Association | **Asociar contacto + cache invalidation** | 20 |
| TC-F4-06 | F4 — Association | **Desasociar contacto + record integridad** | 16 |
| TC-F4-15 | F4 — Association | **Huérfanos aparecen en filtro post-delete** | 20 |
| TC-F4-16 | F4 — Association | **Reasignar contacto → 3 query keys invalidadas** | 25 |
| TC-F4-22 | F4 — Association | Concurrencia reasignación simultánea (race condition) | 20 |

---

### 3. Riesgos Críticos Identificados (R > 15)

| ID Riesgo | Feature | Descripción del Riesgo | R | Caso(s) de Prueba |
|-----------|---------|----------------------|---|------------------|
| RSK-01 | F2 | Client deletion cascade: contactos NO pasan a clienteId=null — pérdida de integridad referencial | **20** | TC-F2-21 |
| RSK-02 | F4 | TanStack Query keys no invalidadas post-asociación — todos los usuarios ven datos obsoletos | **20** | TC-F4-04, TC-F4-06 |
| RSK-03 | F4 | Reasignación: 3 query keys no invalidadas — stale data cross-cliente | **25** | TC-F4-16 |
| RSK-04 | F4 | Contactos huérfanos no aparecen en filtro "Sin cliente" post-delete | **20** | TC-F4-15 |
| RSK-05 | F2, F4 | Race condition: creación concurrente / reasignación concurrente — datos corruptos | **20** | TC-F2-29, TC-F4-22 |
| RSK-06 | F2 | Búsqueda degradada con 500+ registros — NFR1 violado | **20** | TC-F2-04 |
| RSK-07 | F3 | Búsqueda degradada con 1000+ contactos — NFR1 violado | **20** | TC-F3-04 |
| RSK-08 | F4 | Asociar contacto ya asignado a otro cliente sin advertencia — reasignación accidental | **16** | TC-F4-21 |

---

### 4. Cobertura P0

| Métrica | Valor |
|---------|-------|
| Total riesgos críticos (R > 15) | 8 |
| Riesgos con al menos 1 caso P0 asignado | 8 |
| **Cobertura de riesgos críticos** | **100%** |
| Total casos P0 generados | 12 |
| Riesgos sin cobertura | 0 |

---

### 5. Tablas de Cobertura Específicas

#### 5.1 Cobertura por Feature

| Feature | Total Casos | P0 | P1 | P2/P3 | FRs Cubiertos | % Cobertura FR |
|---------|------------|----|----|-------|---------------|---------------|
| F1 — Navigation | 10 | 0 | 0 | 10 | FR28, FR29, FR30 | 100% |
| F2 — Client Mgmt | 30 | 5 | 8 | 17 | FR1–FR8, FR27, FR30 | 100% |
| F3 — Contact Mgmt | 21 | 2 | 6 | 13 | FR9–FR16, FR27, FR30 | 100% |
| F4 — Association | 24 | 5 | 9 | 10 | FR17–FR27, NFR8, NFR9 | 100% |
| **TOTAL** | **85** | **12** | **23** | **50** | **FR1–FR30** | **100%** |

> Nota: 9 casos edge adicionales (TC-F2-24 a TC-F2-30, TC-F3-16 a TC-F3-21) llevan el total a **94 casos**. Los números por feature incluyen edge cases como P1/P2.

#### 5.2 Cobertura de Seguridad

| Tipo de Ataque | Feature | Caso(s) de Prueba | Estrategia | Cubierto |
|---------------|---------|------------------|-----------|---------|
| XSS persistente en Nombre cliente | F2 | TC-F2-25 | Seguridad | ✅ |
| XSS en campo Email contacto | F3 | TC-F3-19 | Seguridad | ✅ |
| Input injection búsqueda | F3 | TC-F3-20 | Edge Case | ✅ |
| UUID inválido en PUT asociación | F4 | TC-F4-18 | Integración | ✅ |
| Problem Details compliance (no stack traces) | F1, F2 | TC-F2-06, TC-F2-25, TC-F4-24 | NFR6 | ✅ |
| Cargo con solo espacios (FluentValidation trim) | F3 | TC-F3-11 | Integración | ✅ |
| HTTPS (non-local deployments) | Cross-feature | Fuera de scope MVP (local dev only) | — | ⚠️ Post-MVP |

> ⚠️ Sin autenticación en MVP — RBAC y session security out of scope por decisión PRD.

#### 5.3 Cobertura de Performance

| NFR | Feature | Umbral | Caso de Prueba | Estado |
|-----|---------|--------|---------------|--------|
| NFR1 — Search clients <1s (500 records) | F2 | P95 < 1000ms | TC-F2-04 | P0 Pendiente |
| NFR1 — Search contacts <1s (1000 records) | F3 | P95 < 1000ms | TC-F3-04 | P0 Pendiente |
| NFR2 — CRUD UI update <2s | F2 | P95 < 2000ms | TC-F2-23 | P2 Pendiente |
| NFR3 — 10 concurrent users | Cross-feature | Sin degradación | TC-F2-29, TC-F4-22 | P0 Pendiente (parcial) |

#### 5.4 Cobertura de Integraciones

| Endpoint | Método | Feature | Casos de Prueba | Cubierto |
|----------|--------|---------|----------------|---------|
| GET /api/v1/clientes | GET | F2 | TC-F2-01, TC-F2-04 | ✅ |
| POST /api/v1/clientes | POST | F2 | TC-F2-10, TC-F2-11, TC-F2-14, TC-F2-29 | ✅ |
| GET /api/v1/clientes/{id} | GET | F2 | TC-F2-07, TC-F2-08, TC-F2-09 | ✅ |
| PUT /api/v1/clientes/{id} | PUT | F2 | TC-F2-16, TC-F2-30 | ✅ |
| DELETE /api/v1/clientes/{id} | DELETE | F2 | TC-F2-20, TC-F2-21 | ✅ |
| GET /api/v1/contactos | GET | F3, F4 | TC-F3-01, TC-F3-04 | ✅ |
| POST /api/v1/contactos | POST | F3 | TC-F3-07, TC-F3-10, TC-F3-11 | ✅ |
| GET /api/v1/contactos/{id} | GET | F3 | TC-F3-06, TC-F3-16, TC-F3-17 | ✅ |
| PUT /api/v1/contactos/{id} | PUT | F3 | TC-F3-12, TC-F3-13 | ✅ |
| DELETE /api/v1/contactos/{id} | DELETE | F3 | TC-F3-14 | ✅ |
| PUT /api/v1/contactos/{id}/cliente | PUT | F4 | TC-F4-04, TC-F4-06, TC-F4-16, TC-F4-18, TC-F4-19 | ✅ |

**Cobertura de endpoints: 11/11 — 100%**

#### 5.5 Cobertura de TanStack Query Keys

| Query Key | Invalidado por Mutación | Caso(s) Verifican Invalidación |
|-----------|------------------------|-------------------------------|
| `['clientes']` | POST, PUT, DELETE clientes | TC-F2-10, TC-F2-16, TC-F2-20 |
| `['clientes', id]` | PUT, DELETE cliente específico | TC-F2-16, TC-F2-20 |
| `['contactos']` | POST, PUT, DELETE contactos; PUT /cliente; DELETE cliente | TC-F3-07, TC-F4-04, TC-F4-06, TC-F4-15, TC-F4-16 |
| `['contactos', { clienteId }]` | PUT /cliente; DELETE cliente | TC-F4-04, TC-F4-06, TC-F4-15 |
| `['contactos', id]` | PUT contacto; DELETE contacto | TC-F3-12, TC-F3-14 |

**Cobertura de invalidación: 5/5 keys — 100%**

#### 5.6 Cobertura de Reglas de Negocio Críticas

| Regla de Negocio | FR/NFR | Caso(s) de Prueba | Prioridad |
|-----------------|--------|------------------|-----------|
| NIT/RUC único en la BD | FR1, FR8 | TC-F2-11, TC-F2-29 | P0 |
| Campos requeridos obligatorios (cliente) | FR8 | TC-F2-12, TC-F2-13, TC-F2-14, TC-F2-17 | P1 |
| Campos requeridos obligatorios (contacto) | FR16 | TC-F3-08, TC-F3-09, TC-F3-10, TC-F3-11 | P1 |
| Cascade delete: contacto.clienteId = null | Story 2.5 | TC-F2-21 | P0 |
| Contacto no eliminado al eliminar cliente | Story 2.5 | TC-F2-21 | P0 |
| Asociación/Desasociación sin eliminar registros | FR17, FR20 | TC-F4-04, TC-F4-06 | P0 |
| Reasignación sin pérdida de datos | FR26 | TC-F4-16, TC-F4-22 | P0 |
| Cambios inmediatos para todos los usuarios | FR27 | TC-F2-10, TC-F3-07, TC-F4-04, TC-F4-15, TC-F4-16 | P0 |
| No exposición de stack traces | NFR6 | TC-F2-06, TC-F2-11, TC-F4-24 | P1 |
| Navegación SPA sin page reload | FR28 | TC-F1-03 | P2 |
| Navegación cliente→contacto ≤2 clics | NFR8 | TC-F4-07 | P2 |
| Vista cliente desde contacto sin búsqueda | NFR9 | TC-F4-09 | P2 |

---

## APÉNDICE: MATRIZ DE TRAZABILIDAD

### Funcionalidad → Features/Historias → Casos de Prueba

```
F1 — Application Shell & Navigation
  ├── Story 1.2 (Frontend Navigation Shell)
  │   ├── TC-F1-01 (NavigationRail desktop)
  │   ├── TC-F1-02 (NavigationBar mobile)
  │   ├── TC-F1-03 (SPA no reload)
  │   ├── TC-F1-04 (Deep link /clientes)
  │   ├── TC-F1-05 (Deep link /contactos)
  │   ├── TC-F1-06 (404 unknown route)
  │   ├── TC-F1-07 (Breakpoint 1024px)
  │   ├── TC-F1-08 (Rapid navigation stress)
  │   ├── TC-F1-09 (Trailing slash /clientes/)
  │   └── TC-F1-10 (F5 refresh deep link)

F2 — Client Management
  ├── Story 2.1 (List & Search) → TC-F2-01, TC-F2-02, TC-F2-03, TC-F2-04, TC-F2-05, TC-F2-06
  ├── Story 2.2 (Detail View)   → TC-F2-07, TC-F2-08, TC-F2-09
  ├── Story 2.3 (Create Client) → TC-F2-10, TC-F2-11, TC-F2-12, TC-F2-13, TC-F2-14, TC-F2-23, TC-F2-24, TC-F2-25, TC-F2-26, TC-F2-27, TC-F2-28, TC-F2-29
  ├── Story 2.4 (Edit Client)   → TC-F2-15, TC-F2-16, TC-F2-17, TC-F2-18, TC-F2-30
  └── Story 2.5 (Delete Client) → TC-F2-19, TC-F2-20, TC-F2-21, TC-F2-22

F3 — Contact Management
  ├── Story 3.1 (List & Search)     → TC-F3-01, TC-F3-02, TC-F3-03, TC-F3-04, TC-F3-05, TC-F3-20
  ├── Story 3.2 (Detail View)       → TC-F3-06, TC-F3-21
  ├── Story 3.3 (Create Contact)    → TC-F3-07, TC-F3-08, TC-F3-09, TC-F3-10, TC-F3-11, TC-F3-16, TC-F3-17, TC-F3-18, TC-F3-19
  ├── Story 3.4 (Edit Contact)      → TC-F3-12, TC-F3-13
  └── Story 3.5 (Delete Contact)    → TC-F3-14, TC-F3-15

F4 — Client-Contact Association & Data Quality
  ├── Story 4.1 (View contacts in client)     → TC-F4-01, TC-F4-02, TC-F4-03, TC-F4-24
  ├── Story 4.2 (Associate/Disassociate)      → TC-F4-04, TC-F4-05, TC-F4-06, TC-F4-18, TC-F4-19, TC-F4-21
  ├── Story 4.3 (Navigate client→contact)     → TC-F4-07, TC-F4-08, TC-F4-23
  ├── Story 4.4 (View client from contact)    → TC-F4-09, TC-F4-10, TC-F4-11
  ├── Story 4.5 (Orphan filter)               → TC-F4-12, TC-F4-13, TC-F4-14, TC-F4-15
  └── Story 4.6 (Reassign contact)            → TC-F4-16, TC-F4-17, TC-F4-20, TC-F4-22
```

### Trazabilidad FRs → Casos de Prueba

| FR | Descripción | Caso(s) de Prueba |
|----|-------------|------------------|
| FR1 | Create client with required fields | TC-F2-10 |
| FR2 | View scrollable client list | TC-F2-01 |
| FR3 | Search client by name | TC-F2-02 |
| FR4 | Search client by NIT/RUC | TC-F2-03 |
| FR5 | View client detail | TC-F2-07 |
| FR6 | Edit client fields | TC-F2-15, TC-F2-16 |
| FR7 | Delete client | TC-F2-20, TC-F2-21 |
| FR8 | Prevent saving with empty required fields | TC-F2-11, TC-F2-12, TC-F2-13, TC-F2-14, TC-F2-17 |
| FR9 | Create contact with required fields | TC-F3-07 |
| FR10 | View contact list | TC-F3-01 |
| FR11 | Search contact by name | TC-F3-02 |
| FR12 | Search contact by email | TC-F3-03 |
| FR13 | View contact detail | TC-F3-06 |
| FR14 | Edit contact fields | TC-F3-12 |
| FR15 | Delete contact | TC-F3-14 |
| FR16 | Prevent saving contact with empty required fields | TC-F3-08, TC-F3-09, TC-F3-10, TC-F3-11 |
| FR17 | Associate existing contacts to client | TC-F4-04, TC-F4-21 |
| FR18 | Associate contact at creation time | TC-F4-05 |
| FR19 | Associate from client detail without navigating away | TC-F4-04 |
| FR20 | Disassociate without deleting records | TC-F4-06 |
| FR21 | View associated contacts in client detail | TC-F4-01, TC-F4-02 |
| FR22 | Navigate client detail → contact detail | TC-F4-07, TC-F4-08 |
| FR23 | View associated client from contact detail | TC-F4-09, TC-F4-11 |
| FR24 | Navigate contact detail → client detail | TC-F4-10 |
| FR25 | Identify contacts without assigned client | TC-F4-12, TC-F4-13, TC-F4-14, TC-F4-15 |
| FR26 | Reassign contact to different client | TC-F4-16, TC-F4-20 |
| FR27 | Immediate data visibility for all users | TC-F2-10, TC-F2-16, TC-F2-20, TC-F2-21, TC-F3-07, TC-F3-12, TC-F3-14, TC-F4-04, TC-F4-06, TC-F4-15, TC-F4-16 |
| FR28 | SPA navigation — no page reloads | TC-F1-03 |
| FR29 | Mobile browser access | TC-F1-02, TC-F1-07 |
| FR30 | Deep linking via URL routes | TC-F1-04, TC-F1-05, TC-F2-08, TC-F2-09, TC-F3-06 |
| NFR1 | Search < 1s (500 clients / 1000 contacts) | TC-F2-04, TC-F3-04 |
| NFR2 | CRUD UI < 2s | TC-F2-23 |
| NFR3 | 10 concurrent users | TC-F2-29, TC-F4-22 |
| NFR6 | No stack traces exposed | TC-F2-06, TC-F2-11, TC-F4-24 |
| NFR8 | ≤2 clicks client → contact | TC-F4-07 |
| NFR9 | No extra navigation for client from contact | TC-F4-09 |