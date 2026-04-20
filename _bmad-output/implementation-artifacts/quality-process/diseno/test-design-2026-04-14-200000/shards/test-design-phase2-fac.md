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
