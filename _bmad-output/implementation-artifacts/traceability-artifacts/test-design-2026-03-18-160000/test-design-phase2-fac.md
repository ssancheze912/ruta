---
workflow: traceability-and-testing
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
phase: 2 - Feature Acceptance Criteria (FAC) in Gherkin
generated_date: 2026-03-18T16:00:00Z
project_name: Siesa-Agents
features_defined: 4
---

# FASE 2: DEFINICIÓN DE FEATURES Y CRITERIOS MAESTROS (FAC) EN GHERKIN

**Project:** Siesa-Agents
**Methodology:** BMAD V6.0 — Phase 2 of 5
**Generated:** 2026-03-18

---

## II. DEFINICIÓN DE FEATURES Y CRITERIOS MAESTROS (FAC) EN GHERKIN

---

### Feature F1 — Application Shell & Navigation

**Feature:** Application Shell & Navigation
**Features/Historias Asociadas:** Story 1.2 (Frontend Navigation Shell)
**FRs Cubiertos:** FR28, FR29, FR30
**Dependencies:** TanStack Router, siesa-ui-kit NavigationRail/NavigationBar, Vite SPA build

#### FAC Funcionales (Gherkin)

```gherkin
Feature: Application Shell & Navigation

  Scenario: NavigationRail visible on desktop
    Given the application is loaded on a desktop browser with viewport >= 1024px
    When the user views the application layout
    Then a NavigationRail is visible on the left side
    And it contains exactly two entries: "Clientes" and "Contactos"
    And both entries are clickable

  Scenario: Navigate to Clientes without full page reload
    Given the application is open on desktop
    When the user clicks the "Clientes" entry in the NavigationRail
    Then the URL changes to /clientes
    And the Clientes view renders
    And no full page reload occurs (SPA navigation — FR28)

  Scenario: Navigate to Contactos without full page reload
    Given the application is open on desktop and the user is on /clientes
    When the user clicks the "Contactos" entry in the NavigationRail
    Then the URL changes to /contactos
    And the Contactos view renders
    And no full page reload occurs (FR28)

  Scenario: Mobile viewport renders NavigationBar
    Given the application is loaded on a mobile browser with viewport < 1024px
    When the user views the application
    Then a NavigationBar is displayed at the bottom (siesa-ui-kit)
    And the NavigationRail is NOT visible
    And all navigation items are accessible and tappable (FR29)

  Scenario: Active nav item reflects current route
    Given the user is on /clientes
    When the user observes the NavigationRail
    Then the "Clientes" entry shows an active/selected visual state
    And the "Contactos" entry does not show an active state

  Scenario: Deep link direct URL access to /clientes
    Given the user opens a new browser tab
    When the user types /clientes directly in the URL bar and presses Enter
    Then the Clientes view is rendered correctly (FR30)
    And no redirection to a home or default screen occurs

  Scenario: Deep link direct URL access to /contactos
    Given the user opens a new browser tab
    When the user types /contactos directly in the URL bar and presses Enter
    Then the Contactos view is rendered correctly (FR30)

  Scenario: Unknown route displays 404 view gracefully
    Given the application is running
    When the user navigates to an unknown route such as /ruta-desconocida
    Then a 404 not-found view is displayed
    And the application does not crash or show a blank screen
```

#### FAC No Funcionales (Gherkin)

```gherkin
  Scenario: Navigation responsive across viewport breakpoints
    Given the application is running
    When the browser viewport is resized from 1200px to 375px
    Then the NavigationRail is replaced by the NavigationBar
    And the transition occurs without a full page reload
    And the current route remains active (FR29, NFR7)

  Scenario: Navigation functions on slow connection
    Given the browser network is throttled to Slow 3G
    When the user clicks a navigation item
    Then the application shows a loading indicator or skeleton
    And navigation eventually completes successfully
    And no error or blank screen is shown due to slow loading
```

---

### Feature F2 — Client Management CRUD

**Feature:** Client Management CRUD
**Features/Historias Asociadas:** Stories 2.1, 2.2, 2.3, 2.4, 2.5
**FRs Cubiertos:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR27 (partial)
**Dependencies:** TanStack Query (cache invalidation), React Hook Form + Zod (validation), .NET 10 Minimal API, PostgreSQL 18+

#### FAC Funcionales (Gherkin)

```gherkin
Feature: Client Management CRUD

  # Story 2.1 — List & Search
  Scenario: Client list displays all clients with required fields
    Given there are clients registered in the system
    When the user navigates to /clientes
    Then the left panel shows a scrollable list of all clients
    And each item displays Nombre and NIT/RUC (FR2)

  Scenario: Real-time search by client name
    Given the client list is loaded with at least 5 clients with distinct names
    When the user types the first 3 letters of an existing client name in the search field
    Then only clients whose Nombre contains the typed text are shown
    And results appear without pressing Enter (FR3)
    And results render within 1 second with up to 500 records (NFR1)

  Scenario: Real-time search by NIT/RUC
    Given the client list is loaded
    When the user types a partial NIT/RUC in the search field
    Then only clients whose NIT/RUC contains the input are shown (FR4)

  Scenario: Empty state when no clients exist
    Given there are no clients in the system
    When the user navigates to /clientes
    Then an EmptyState component is displayed
    And a message guides the user to create the first client

  Scenario: ErrorPanel when backend is unavailable
    Given the backend API is offline
    When the user navigates to /clientes
    Then an ErrorPanel is displayed with a "Reintentar" button
    And no technical error details are exposed (NFR6)

  # Story 2.2 — Client Detail
  Scenario: Clicking a client shows complete detail
    Given the client list is displayed
    When the user clicks on a client item
    Then the right panel shows: Nombre, NIT/RUC, Teléfono, Ciudad (FR5)
    And the URL updates to /clientes/:clienteId (FR30)

  Scenario: Direct URL access to client detail
    Given a valid clienteId exists in the system
    When the user navigates directly to /clientes/:clienteId
    Then the correct client detail is displayed with all fields (FR30)

  # Story 2.3 — Create Client
  Scenario: Create client with all required fields — happy path
    Given the user is on /clientes
    When the user clicks "Nuevo cliente" and fills all required fields (Nombre, NIT/RUC, Teléfono, Ciudad)
    And clicks "Guardar"
    Then the client is persisted in the backend (FR1)
    And the new client appears in the list immediately without manual refresh (FR27)
    And a success toast shows "Cliente creado correctamente"

  Scenario: Create client with empty required fields shows validation
    Given the create client form is open
    When the user submits the form with one or more required fields empty
    Then inline error messages appear on each empty field (FR8)
    And the form is NOT submitted to the backend

  Scenario: Create client with duplicate NIT/RUC shows specific error
    Given a client with NIT/RUC "900123456" already exists
    When the user submits a new client with the same NIT/RUC
    Then an error message shows "El NIT/RUC ya está registrado"
    And no technical details are exposed (NFR6)
    And the client is NOT created

  # Story 2.4 — Edit Client
  Scenario: Edit form opens pre-filled with current values
    Given the user is viewing a client's detail
    When the user clicks "Editar"
    Then the edit form opens with all fields pre-filled with current values (FR6)

  Scenario: Saving edits reflects changes immediately
    Given the edit form is open with modified values
    When the user clicks "Guardar"
    Then changes are reflected in the client detail and list item immediately (FR27)
    And a success toast shows "Cliente actualizado correctamente"

  Scenario: Clearing required field in edit shows validation error
    Given the edit form is open
    When the user clears a required field and clicks "Guardar"
    Then an inline validation error appears on the cleared field (FR8)
    And the form is NOT submitted

  Scenario: Cancel edit preserves original client data
    Given the edit form is open with modified values
    When the user clicks "Cancelar"
    Then the form closes
    And the original client data remains unchanged

  # Story 2.5 — Delete Client
  Scenario: Delete client shows confirmation dialog
    Given the user is viewing a client's detail
    When the user clicks "Eliminar"
    Then a confirmation dialog appears with "¿Eliminar este cliente?"
    And two buttons are shown: "Confirmar" and "Cancelar"

  Scenario: Confirm deletion removes client immediately
    Given the confirmation dialog is open
    When the user clicks "Confirmar"
    Then the client is removed from the list immediately (FR7, FR27)
    And the right panel returns to default state
    And a toast shows "Cliente eliminado correctamente"

  Scenario: Delete client with contacts orphans those contacts
    Given the client being deleted has associated contacts
    When the user confirms the deletion
    Then the client record is deleted
    And all previously associated contacts remain with their data intact
    And those contacts have clienteId = null and appear in the "Sin cliente" filter (FR25)
    And the toast shows the orphan message

  Scenario: Cancel deletion preserves client record
    Given the confirmation dialog is open
    When the user clicks "Cancelar"
    Then the dialog closes
    And the client record remains in the system unchanged
```

#### FAC No Funcionales (Gherkin)

```gherkin
  Scenario: Client search response time with 500 records
    Given there are exactly 500 clients in the database
    When the user types a search query in the client search field
    Then results are rendered within 1 second from the first keystroke (NFR1)

  Scenario: CRUD changes visible within 2 seconds
    Given the user performs any CRUD operation (create, edit, delete)
    When the operation is confirmed
    Then the UI reflects the change within 2 seconds (NFR2)

  Scenario: No technical details exposed on errors
    Given any backend error occurs (validation, conflict, server error)
    When the error is surfaced to the UI
    Then no stack trace, SQL detail, or internal error code is shown (NFR6)
```

---

### Feature F3 — Contact Management CRUD

**Feature:** Contact Management CRUD
**Features/Historias Asociadas:** Stories 3.1, 3.2, 3.3, 3.4, 3.5
**FRs Cubiertos:** FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR27 (partial)
**Dependencies:** TanStack Query, React Hook Form + Zod, email format validation, .NET 10 Minimal API, PostgreSQL 18+

#### FAC Funcionales (Gherkin)

```gherkin
Feature: Contact Management CRUD

  # Story 3.1 — Contact List & Search
  Scenario: Contact list displays all contacts with required fields
    Given there are contacts registered in the system
    When the user navigates to /contactos
    Then a list of all contacts is displayed showing Nombre, Cargo, and Email per item (FR10)

  Scenario: Real-time search by contact name
    Given the contact list is loaded
    When the user types in the search field
    Then only contacts whose Nombre contains the typed text are shown (FR11)
    And results appear within 1 second (NFR1)

  Scenario: Real-time search by contact email
    Given the contact list is loaded
    When the user types an email fragment in the search field
    Then only contacts whose Email contains the input are shown (FR12)
    And results appear within 1 second (NFR1)

  # Story 3.2 — Contact Detail
  Scenario: Clicking contact shows complete detail
    Given the contact list is displayed
    When the user clicks on a contact item
    Then the contact detail shows: Nombre, Cargo, Teléfono, Email (FR13)
    And the URL updates to /contactos/:contactoId (FR30)

  # Story 3.3 — Create Contact
  Scenario: Create contact with all required fields — happy path
    Given the user is on /contactos
    When the user fills Nombre, Cargo, Teléfono, and Email and clicks "Guardar"
    Then the contact is persisted (FR9)
    And appears in the contact list immediately (FR27)
    And a success toast shows "Contacto creado correctamente"

  Scenario: Create contact with empty required fields shows validation
    Given the create contact form is open
    When the user submits with one or more required fields empty
    Then inline error messages appear on each empty field (FR16)
    And no backend request is made

  Scenario: Invalid email format shows validation error
    Given the create contact form is open
    When the user enters an email without "@" such as "juan.empresa.com"
    Then an inline validation error shows "El email no tiene un formato válido"
    And the form is NOT submitted

  # Story 3.4 — Edit Contact
  Scenario: Edit form opens pre-filled with current contact data
    Given the user is viewing a contact's detail
    When the user clicks "Editar"
    Then the edit form opens with Nombre, Cargo, Teléfono, Email pre-filled (FR14)

  Scenario: Saving contact edits reflects immediately
    Given the edit form is open
    When the user modifies a field and clicks "Guardar"
    Then changes reflect in contact detail and list immediately (FR27)
    And a toast shows "Contacto actualizado correctamente"

  # Story 3.5 — Delete Contact
  Scenario: Delete contact shows confirmation dialog
    Given the user is viewing a contact's detail
    When the user clicks "Eliminar"
    Then a dialog appears: "¿Eliminar este contacto?" with "Confirmar" and "Cancelar"

  Scenario: Confirm deletion removes contact immediately
    Given the confirmation dialog is open
    When the user clicks "Confirmar"
    Then the contact is removed from the list immediately (FR15, FR27)
    And a toast shows "Contacto eliminado correctamente"
```

#### FAC No Funcionales (Gherkin)

```gherkin
  Scenario: Contact search response time with 1000 records
    Given there are exactly 1000 contacts in the database
    When the user types in the contact search field
    Then results render within 1 second (NFR1)

  Scenario: Backend errors shown without technical details
    Given the backend returns any error during contact operations
    When the error reaches the UI
    Then no stack trace, HTTP code, or internal detail is displayed (NFR6)

  Scenario: Email injection payload sanitized at backend
    Given a user submits a contact with a malicious email payload
    When the backend processes the request
    Then the input is sanitized or rejected with a 400 validation error
    And no SQL execution occurs (NFR5)
```

---

### Feature F4 — Client-Contact Association & Data Quality

**Feature:** Client-Contact Association & Data Quality
**Features/Historias Asociadas:** Stories 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
**FRs Cubiertos:** FR17–FR27
**Dependencies:** ContactManager (siesa-ui-kit), ClienteContactServiceAdapter, TanStack Query cache invalidation (queryKeys ['contactos'], ['contactos', {clienteId}])

#### FAC Funcionales (Gherkin)

```gherkin
Feature: Client-Contact Association & Data Quality

  # Story 4.1 — View Associated Contacts
  Scenario: ContactManager renders all contacts for a client
    Given a client has associated contacts
    When the user opens the client detail view
    Then the ContactManager renders in the right panel showing all linked contacts (FR21)

  Scenario: ContactManager shows empty state for client with no contacts
    Given a client has no associated contacts
    When the user opens the client detail view
    Then the ContactManager displays: "No hay contactos vinculados"

  # Story 4.2 — Associate & Disassociate
  Scenario: Associate existing contact to client via ContactManager
    Given the user is in the client detail view
    When the user uses ContactManager to select and add an existing contact
    Then the contact is linked to the client immediately (FR17, FR19, FR27)
    And PUT /api/v1/contactos/{id}/cliente is called with { clienteId: uuid }
    And the contact appears in the ContactManager list without page refresh

  Scenario: Create new contact from ContactManager auto-associates it
    Given the user creates a new contact from within the ContactManager
    When the contact creation is saved
    Then the new contact is automatically associated with the current client (FR18)
    And appears in the ContactManager immediately

  Scenario: Disassociate contact from client
    Given the user triggers disassociation for an existing contact in the ContactManager
    When the disassociation is confirmed
    Then the contact is removed from the ContactManager list immediately (FR20, FR27)
    And PUT is called with { clienteId: null }
    And the contact remains accessible from /contactos

  # Story 4.3 — Client → Contact Navigation
  Scenario: Navigate from client detail to contact detail in at most 2 clicks
    Given the user is on a client detail view with at least one contact in the ContactManager
    When the user clicks on a contact in the ContactManager
    Then the user is navigated to /contactos/:contactoId (FR22)
    And the navigation required no more than 2 clicks from the client record (NFR8)

  Scenario: Browser back from contact detail returns to client detail
    Given the user navigated from client detail to contact detail
    When the user clicks the browser back button
    Then the user returns to the client detail view

  # Story 4.4 — Contact → Client Navigation
  Scenario: Contact detail shows associated client name
    Given a contact is associated with a client
    When the user views the contact detail
    Then the associated client's Nombre is displayed (FR23)
    And no additional search or navigation is required (NFR9)

  Scenario: Click client name navigates to client detail
    Given the client name is displayed in the contact detail
    When the user clicks on the client name link
    Then the user is navigated to /clientes/:clienteId (FR24)

  Scenario: Contact with no client shows "Sin cliente asignado"
    Given a contact has clienteId = null
    When the user views the contact detail
    Then "Sin cliente asignado" is displayed (FR23)

  # Story 4.5 — Orphan Filter
  Scenario: Sin cliente filter shows only orphan contacts
    Given there are both assigned and unassigned contacts
    When the user activates the "Sin cliente" filter
    Then only contacts with clienteId = null are displayed (FR25)
    And the count of orphan contacts is visible

  Scenario: Deactivating filter restores full contact list
    Given the "Sin cliente" filter is active
    When the user deactivates it
    Then the full contact list is restored without page reload

  # Story 4.6 — Reassign Contact
  Scenario: Reassign contact from Client A to Client B
    Given a contact is associated with Client A
    When the user selects Client B in the reassignment selector and confirms
    Then the contact is now associated with Client B (FR26, FR27)
    And PUT is called with the new { clienteId: uuid }
    And a toast shows "Contacto reasignado correctamente"
    And the contact appears in Client B ContactManager and is removed from Client A ContactManager

  Scenario: Cancel reassignment preserves current association
    Given the reassignment selector is open
    When the user clicks "Cancelar"
    Then the contact's client association remains unchanged
```

#### FAC No Funcionales (Gherkin)

```gherkin
  Scenario: All data mutations reflected immediately for all users
    Given two browser sessions are open on the same application
    When Session A performs any association/disassociation/reassignment
    Then Session B sees the change without manually refreshing (FR27, NFR2)

  Scenario: Navigation from client to contact in at most 2 clicks
    Given a user wants to view a contact from a client record
    When counting from the client record to the contact detail
    Then the navigation requires no more than 2 clicks (NFR8)

  Scenario: Associated client visible in contact detail without extra search
    Given a contact is associated with a client
    When the user opens the contact detail
    Then the client name is immediately visible (NFR9)
    And no search or additional navigation is required
```
