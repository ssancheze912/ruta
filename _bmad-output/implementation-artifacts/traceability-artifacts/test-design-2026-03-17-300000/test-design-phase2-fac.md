---
workflow: traceability-and-testing
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
generated_date: 2026-03-17
project_name: Siesa-Agents
phase: 2
title: Feature Acceptance Criteria (FAC) in Gherkin
---

# Phase 2: Feature Acceptance Criteria (FAC) in Gherkin

## II. DEFINICIÓN DE FEATURES Y CRITERIOS MAESTROS (FAC) EN GHERKIN

---

## F1 — Application Shell & Navigation

- **Feature**: Application Shell & Navigation
- **Épicas/Historias Asociadas**: Epic 1 / Story 1.2
- **FRs cubiertos**: FR28, FR29, FR30

### FAC Funcionales (Gherkin)

```gherkin
Feature: Application Shell & Navigation

  Scenario: Desktop navigation displays NavigationRail
    Given the application is loaded in a desktop browser (viewport >= 1024px)
    When the user views the main layout
    Then a NavigationRail is visible on the left side
    And it contains entries for "Clientes" and "Contactos"
    And both entries are visible and interactive

  Scenario: SPA navigation to Clientes section
    Given the user is on any view of the application
    When the user clicks the "Clientes" navigation entry
    Then the browser navigates to /clientes
    And the Clients list view is displayed
    And no full page reload occurs (the SPA shell persists)

  Scenario: SPA navigation to Contactos section
    Given the user is on any view of the application
    When the user clicks the "Contactos" navigation entry
    Then the browser navigates to /contactos
    And the Contacts list view is displayed
    And no full page reload occurs

  Scenario: Mobile navigation displays NavigationBar
    Given the application is loaded in a mobile browser viewport (< 1024px)
    When the user views the main layout
    Then a NavigationBar is displayed (not a NavigationRail)
    And all navigation items are visible and tappable

  Scenario: Deep link to Clientes view
    Given the user types /clientes directly in the browser address bar
    When the page loads
    Then the Clients list view is rendered correctly
    And no redirection to a home or default screen occurs

  Scenario: Deep link to Contactos view
    Given the user types /contactos directly in the browser address bar
    When the page loads
    Then the Contacts list view is rendered correctly

  Scenario: Unknown route displays graceful 404
    Given the user navigates to any route that does not exist (e.g., /unknown)
    When the page loads
    Then a 404 / not-found view is displayed
    And the application does not crash or show a blank page
```

### FAC No Funcionales (Gherkin)

```gherkin
  Scenario: Navigation is accessible on minimum mobile viewport
    Given the application is loaded on a 375px wide viewport
    When the user views the navigation
    Then all navigation items remain accessible and tappable without horizontal scrolling

  Scenario: Navigation preserves active state
    Given the user is on /clientes
    When the user views the NavigationRail or NavigationBar
    Then the "Clientes" entry is visually highlighted as the active section
```

### Dependencies
- siesa-ui-kit NavigationRail, NavigationBar components
- TanStack Router file-based routing
- SPA shell: __root.tsx layout

---

## F2 — Client Management

- **Feature**: Client Management
- **Épicas/Historias Asociadas**: Epic 2 / Stories 2.1, 2.2, 2.3, 2.4, 2.5
- **FRs cubiertos**: FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR27

### FAC Funcionales (Gherkin)

```gherkin
Feature: Client Management

  # --- Client List & Search (2.1) ---

  Scenario: Client list shows all clients with key fields
    Given there are clients registered in the system
    When the user navigates to /clientes
    Then a scrollable list of all clients is displayed in the left panel
    And each list item shows the client's Nombre and NIT/RUC

  Scenario: Real-time search by Nombre
    Given the client list is loaded with multiple clients
    When the user types a name or partial name in the search field
    Then the list filters in real time showing only clients whose Nombre matches
    And the results appear in under 1 second

  Scenario: Real-time search by NIT/RUC
    Given the client list is loaded
    When the user types a NIT/RUC value in the search field
    Then the list filters showing only clients whose NIT/RUC matches the input

  Scenario: Empty state when no clients exist
    Given there are no clients registered in the system
    When the user navigates to /clientes
    Then an empty state component is displayed
    And it guides the user to create the first client

  Scenario: Error state when backend is unavailable
    Given the backend is unavailable when the page loads
    When the client list fetch fails
    Then an error panel with a "Reintentar" button is displayed instead of the list

  # --- Client Detail View (2.2) ---

  Scenario: Client detail loads on list item click
    Given the client list is displayed
    When the user clicks on a client item
    Then the right panel shows the complete client details: Nombre, NIT/RUC, Teléfono, Ciudad
    And the URL updates to /clientes/:clienteId

  Scenario: Deep link to client detail view
    Given the user accesses /clientes/:clienteId directly via URL
    When the page loads
    Then the correct client details are displayed

  Scenario: Non-existent clienteId shows not-found message
    Given the user accesses /clientes/:clienteId with an ID that does not exist
    When the page loads
    Then a not-found message is displayed gracefully

  # --- Create Client (2.3) ---

  Scenario: Create client happy path
    Given the user is on /clientes
    When the user clicks "Nuevo cliente" and fills in Nombre, NIT/RUC, Teléfono, and Ciudad
    And submits the form
    Then the client is created and appears in the client list immediately
    And a success toast shows "Cliente creado correctamente"
    And the form closes

  Scenario: Create client fails on missing required field
    Given the user opens the create client form
    When the user submits without filling one or more required fields
    Then inline error messages appear on each empty required field
    And the form is NOT submitted to the backend

  Scenario: Create client fails on duplicate NIT/RUC
    Given a client with NIT/RUC "900-123-456" already exists
    When the user submits a new client with the same NIT/RUC
    Then an error message shows "El NIT/RUC ya está registrado"
    And no technical details are exposed

  # --- Edit Client (2.4) ---

  Scenario: Edit client form opens pre-filled
    Given the user is viewing a client's detail
    When the user clicks "Editar"
    Then the client form opens with all current field values pre-filled

  Scenario: Edit client saves changes immediately
    Given the user has modified one or more fields in the edit form
    When the user submits the form
    Then the changes are reflected in the client detail and list immediately
    And a success toast shows "Cliente actualizado correctamente"

  Scenario: Edit client validates required fields
    Given the user has opened the edit form
    When the user clears a required field and submits
    Then an inline error appears and the form is NOT submitted

  Scenario: Edit client cancel keeps original data
    Given the user has opened the edit form and made changes
    When the user clicks "Cancelar"
    Then the form closes and the original client data is unchanged

  # --- Delete Client (2.5) ---

  Scenario: Delete client shows confirmation dialog
    Given the user is viewing a client's detail
    When the user clicks "Eliminar"
    Then a confirmation dialog appears asking "¿Eliminar este cliente?"
    And it shows "Confirmar" and "Cancelar" options

  Scenario: Delete client confirm removes record immediately
    Given the delete confirmation dialog is open
    When the user clicks "Confirmar"
    Then the client is removed from the list immediately
    And the right panel returns to empty/default state
    And a toast shows "Cliente eliminado correctamente"

  Scenario: Delete client cancel keeps record
    Given the delete confirmation dialog is open
    When the user clicks "Cancelar"
    Then the dialog closes and the client record remains in the system
```

### FAC No Funcionales (Gherkin)

```gherkin
  Scenario: Search returns results under 1 second with 500 clients
    Given there are up to 500 client records in the system
    When the user types in the search field
    Then filtered results appear in under 1 second

  Scenario: CRUD changes reflect in under 2 seconds
    Given the user performs any create, edit, or delete operation
    When the operation completes successfully
    Then the updated data is visible in the UI within 2 seconds

  Scenario: Error messages do not expose technical details
    Given any backend error occurs
    When the error message is shown to the user
    Then no stack traces, HTTP codes, or internal identifiers are visible
```

### Dependencies
- GET /api/v1/clientes, GET /api/v1/clientes/:id, POST, PUT, DELETE
- TanStack Query: ['clientes'], ['clientes', clienteId]
- siesa-ui-kit: Button, Input, Table, Alert, Badge, DescriptionList

---

## F3 — Contact Management

- **Feature**: Contact Management
- **Épicas/Historias Asociadas**: Epic 3 / Stories 3.1, 3.2, 3.3, 3.4, 3.5
- **FRs cubiertos**: FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR27

### FAC Funcionales (Gherkin)

```gherkin
Feature: Contact Management

  Scenario: Contact list shows all contacts with key fields
    Given there are contacts registered in the system
    When the user navigates to /contactos
    Then a list of all contacts is displayed showing Nombre, Cargo, and Email per item

  Scenario: Real-time search by Nombre
    Given the contact list is loaded
    When the user types a name in the search field
    Then only contacts whose Nombre matches are shown in real time

  Scenario: Real-time search by Email
    Given the contact list is loaded
    When the user types an email in the search field
    Then only contacts whose Email matches are shown in real time

  Scenario: Empty state when no contacts exist
    Given there are no contacts in the system
    When the user navigates to /contactos
    Then an empty state component guides the user to create the first contact

  Scenario: Error state on load failure
    Given the backend is unavailable
    When the contact list fails to load
    Then an error panel with "Reintentar" is shown

  Scenario: Contact detail shows all fields
    Given the contact list is displayed
    When the user clicks on a contact
    Then the detail view shows Nombre, Cargo, Teléfono, Email
    And the URL updates to /contactos/:contactoId

  Scenario: Deep link to contact detail
    Given the user accesses /contactos/:contactoId directly
    When the page loads
    Then the correct contact details are displayed

  Scenario: Non-existent contactoId shows not-found message
    Given a contactoId does not exist in the system
    When the user accesses /contactos/:contactoId
    Then a graceful not-found message is displayed

  Scenario: Create contact happy path
    Given the user is on /contactos and clicks "Nuevo contacto"
    When the user fills Nombre, Cargo, Teléfono, Email and submits
    Then the contact is created and appears in the list immediately
    And a toast shows "Contacto creado correctamente"

  Scenario: Create contact fails on missing required field
    Given the create contact form is open
    When the user submits without filling one or more required fields
    Then inline error messages appear on each empty field
    And the form is NOT submitted

  Scenario: Edit contact form opens pre-filled
    Given the user is viewing a contact's detail
    When the user clicks "Editar"
    Then the form opens pre-filled with current values

  Scenario: Edit contact saves changes immediately
    Given the user has modified fields in the edit form
    When the user submits
    Then changes appear in the contact detail and list immediately
    And a toast shows "Contacto actualizado correctamente"

  Scenario: Edit contact cancel keeps original data
    Given the edit form is open with changes
    When the user clicks "Cancelar"
    Then the original contact data is preserved

  Scenario: Delete contact confirm removes record
    Given the delete confirmation dialog is open for a contact
    When the user clicks "Confirmar"
    Then the contact is removed from the list immediately
    And the view returns to the contact list
    And a toast shows "Contacto eliminado correctamente"

  Scenario: Delete contact cancel keeps record
    Given the delete confirmation dialog is open
    When the user clicks "Cancelar"
    Then the contact remains in the system unchanged
```

### FAC No Funcionales (Gherkin)

```gherkin
  Scenario: Search with up to 1000 contacts returns results under 1 second
    Given up to 1000 contact records exist
    When the user types in the search field
    Then results appear in under 1 second

  Scenario: Backend errors do not expose technical details
    Given any backend error occurs during contact operations
    When the error message is shown
    Then no stack traces or internal details are visible
```

### Dependencies
- GET /api/v1/contactos, GET /api/v1/contactos/:id, POST, PUT, DELETE
- TanStack Query: ['contactos'], ['contactos', contactoId]
- siesa-ui-kit: Button, Input, DescriptionList, Alert

---

## F4 — Client-Contact Association & Data Quality

- **Feature**: Client-Contact Association & Data Quality
- **Épicas/Historias Asociadas**: Epic 4 / Stories 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
- **FRs cubiertos**: FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27

### FAC Funcionales (Gherkin)

```gherkin
Feature: Client-Contact Association & Data Quality

  Scenario: Associated contacts visible in client detail
    Given a client has contacts associated to them
    When the user opens the client detail view
    Then the ContactManager component shows all linked contacts
    And the contacts are listed without requiring additional navigation

  Scenario: Empty ContactManager when client has no contacts
    Given a client has no contacts associated
    When the user opens the client detail view
    Then the ContactManager shows an empty state

  Scenario: Associate existing contact to client from ContactManager
    Given the user is in the client detail view
    When the user uses the ContactManager to add an existing contact
    Then the contact appears in the ContactManager list immediately
    And the association is reflected system-wide without manual refresh

  Scenario: Create new contact from ContactManager auto-associates to client
    Given the user creates a new contact from within the ContactManager
    When the contact is saved
    Then the new contact is automatically associated with the current client
    And appears in the ContactManager list immediately

  Scenario: Disassociate contact from client
    Given a contact is associated with a client
    When the user disassociates the contact via the ContactManager
    Then the contact disappears from the ContactManager list immediately
    And the contact still exists and is accessible from /contactos
    And the contact appears as "Sin cliente asignado" in its detail view

  Scenario: Navigate from client contact list to contact detail (2 clicks max)
    Given the user is in the client detail view with contacts listed
    When the user clicks on a contact in the ContactManager
    Then the user is navigated to /contactos/:contactoId
    And the full contact detail is displayed
    And the navigation required no more than 2 clicks from the client record

  Scenario: Back navigation returns to client detail
    Given the user navigated from a client detail to a contact detail
    When the user clicks "Volver" or the browser back button
    Then the user returns to the client detail view

  Scenario: Contact detail shows associated client name
    Given a contact is associated with a client named "Empresa XYZ"
    When the user views the contact detail
    Then "Empresa XYZ" is displayed as the associated client
    And no additional search or navigation was needed to see it

  Scenario: Click client name in contact detail navigates to client
    Given the contact detail shows an associated client name
    When the user clicks on the client name
    Then the user is navigated to /clientes/:clienteId showing the full client detail

  Scenario: Contact with no client shows "Sin cliente asignado"
    Given a contact has no client association (orphan)
    When the user views the contact detail
    Then the text "Sin cliente asignado" is displayed in the client field

  Scenario: Orphan contacts filter shows only unassigned contacts
    Given the user is on /contactos
    When the user activates the "Sin cliente" filter button
    Then only contacts with no client association are displayed
    And the count of orphan contacts is visible in the button label

  Scenario: Orphan filter with all contacts assigned shows empty state
    Given all contacts have a client assigned
    When the user activates the "Sin cliente" filter
    Then an empty state message is shown indicating all contacts are assigned

  Scenario: Deactivate orphan filter restores full list
    Given the "Sin cliente" filter is active
    When the user clicks the filter button again to deactivate it
    Then the full contact list is restored

  Scenario: Orphan filter combined with search
    Given the "Sin cliente" filter is active and a search term is entered
    When the user views the contact list
    Then only contacts matching both the orphan condition AND the search term are shown

  Scenario: Reasignar cliente button visible for associated contacts
    Given a contact has a client association (clienteId is not null)
    When the user views the contact detail
    Then the "Reasignar cliente" button is visible in the header

  Scenario: Reasignar cliente button NOT visible for orphan contacts
    Given a contact has no client association (clienteId is null)
    When the user views the contact detail
    Then the "Reasignar cliente" button is NOT visible

  Scenario: Reassign dialog shows all clients except current one
    Given the user clicks "Reasignar cliente" on a contact associated with "Cliente A"
    When the reassignment dialog opens
    Then the client selector shows all available clients EXCEPT "Cliente A"
    And the "Guardar" button is disabled until a client is selected

  Scenario: Confirm reassignment updates associations
    Given the user has selected "Cliente B" in the reassignment dialog
    When the user clicks "Guardar"
    Then the contact appears in "Cliente B"'s ContactManager immediately
    And the contact is removed from "Cliente A"'s ContactManager immediately
    And a toast shows "Contacto reasignado correctamente"
    And the dialog closes

  Scenario: Cancel reassignment leaves association unchanged
    Given the reassignment dialog is open
    When the user clicks "Cancelar"
    Then no change is made to the contact's client association
    And the dialog closes
```

### FAC No Funcionales (Gherkin)

```gherkin
  Scenario: Association changes reflect immediately system-wide
    Given any association or disassociation operation completes
    When the user views the affected client's detail or the contact list
    Then the updated data is visible without requiring a manual page refresh

  Scenario: Client navigation from contact requires no additional search
    Given a contact is associated with a client
    When the user views the contact detail
    Then the client is visible immediately without any search action (NFR9)

  Scenario: Navigation from client to contact requires no more than 2 clicks
    Given the user is on a client's detail page
    When the user navigates to a contact's detail
    Then it requires at most 2 clicks from the client record (NFR8)
```

### Dependencies
- PUT /api/v1/contactos/:id/cliente (assign/reassign/disassociate)
- TanStack Query: ['contactos'], ['contactos', {clienteId}], ['contactos', contactoId]
- siesa-ui-kit: ContactManager (IContactServiceAdapter), Button, Select, Dialog
- ClienteContactServiceAdapter, AssociarContactoDialog, ReasignarClienteDialog
