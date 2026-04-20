# Test Design: Epic 4 - Client-Contact Association (Asociación Cliente-Contacto)

**Date:** 2026-04-08
**Author:** SiesaTeam
**Status:** Draft
**Epic:** 4 — Asociación Cliente-Contacto
**Stories covered:** 4.1 (View Associated Contacts in Client Detail), 4.2 (Associate & Disassociate Contacts from Client), 4.3 (Navigate from Client Detail to Contact Detail), 4.4 (View Associated Client from Contact Detail), 4.5 (Orphan Contacts Filter), 4.6 (Reassign Contact to Different Client)

---

## Executive Summary

**Scope:** Full test design for Epic 4 — bidirectional Client-Contact relationship management, including viewing, associating, disassociating, navigating, filtering orphans, and reassigning contacts across clients.

**Story Status at Time of Design:**

| Story | Title | Status | Notes |
|-------|-------|--------|-------|
| 4.1 | View Associated Contacts in Client Detail | done | ContactManager incompatible; custom Table + AssociatedContactsSection used |
| 4.2 | Associate & Disassociate Contacts from Client | done | PUT /api/v1/contactos/{id}/cliente shared endpoint |
| 4.3 | Navigate from Client Detail to Contact Detail | done | "Volver" uses router.history.back() |
| 4.4 | View Associated Client from Contact Detail | done | useCliente extended with enabled option |
| 4.5 | Orphan Contacts Filter | done | Toggle always enabled (design override from AC1) |
| 4.6 | Reassign Contact to Different Client | done | `stepsCompleted: []` — checklist not updated |

> **Flag:** Story 4.6 has `stepsCompleted: []` despite `status: done`. Completion notes show 88/88 tests passing. Verify that `useReassignContactoCliente` and `ReasignarClienteDialog` are fully integrated before running P0 tests. This is the same pattern as story 3.5.

**Key architectural facts for this epic:**

| Aspect | Detail |
|--------|--------|
| Shared assignment endpoint | `PUT /api/v1/contactos/{id}/cliente` — handles assign (`clienteId: uuid`), disassociate (`clienteId: null`), and reassign (`clienteId: new_uuid`) |
| Domain entity method | `ContactoEntity.AssignCliente(Guid? clienteId)` — sets `ClienteID` and `UpdatedAt` atomically |
| Query key — global contacts | `['contactos']` |
| Query key — scoped per client | `['contactos', { clienteId }]` |
| ContactManager (siesa-ui-kit) | **NOT used** — incompatible with project Contacto domain type; `AssociatedContactsSection` (custom) used instead |
| Orphan filter | Client-side only; no backend query param; `contactos.filter(c => c.clienteId === null)` |
| Back navigation | `router.history.back()` — not hardcoded `/contactos` |
| Cross-module import | `ContactoDetailView` imports `useCliente` from clientes module (intentional, documented) |
| Reassign hook separation | `useReassignContactoCliente` is separate from `useAssignContactoCliente` to avoid regression — invalidates 3 keys vs 2 |

**Risk Summary:**

- Total risks identified: 7
- High-priority risks (≥6): **1** (missing new clienteId invalidation in reassign)
- Medium risks (3–5): 3
- Low risks (1–2): 3
- Critical categories: BUS, DATA, TECH

**Coverage Summary:**

- Total scenarios: 30
- P0 scenarios: 9
- P1 scenarios: 14
- P2 scenarios: 5
- P3 scenarios: 2
- New tests required: **2** (both backend integration)

---

## 1. Context

### 1.1 Epic Overview

Epic 4 closes the data model loop by linking Contact and Client records bidirectionally. The commercial team can:
- View a client's associated contacts directly in the client detail view
- Associate unassigned (orphan) contacts to a client; disassociate them without deleting either record
- Navigate forward from client → contact (≤ 2 clicks, FR22, NFR8) and back
- See which client a contact belongs to; navigate backward from contact → client (1 click, FR23, FR24)
- Filter the contact list to surface orphan contacts (FR25)
- Reassign a contact from one client to another without navigating away (FR26)
- See all changes immediately without page refresh (FR27)

All six stories share the single backend endpoint `PUT /api/v1/contactos/{id}/cliente`.

### 1.2 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite 8 / React 19 / TypeScript strict / TanStack Router / TanStack Query / Zustand 5 |
| UI Kit | siesa-ui-kit v1.0.77 (Button, Table, Select, Badge) + shadcn Dialog |
| Form | React Hook Form + Zod v4 |
| Frontend test | Vitest + React Testing Library + MSW |
| Backend | .NET 10 / C# Minimal API / EF Core 10 / PostgreSQL |
| Backend domain | Clean Architecture — Domain / Application / Infrastructure / API layers |
| Backend test | xUnit + Testcontainers.PostgreSql 4.2.0 + NSubstitute |
| Error format | Problem Details RFC 7807 (`{ status, title, detail }`) |

### 1.3 Architecture Notes

**Backend — AssignContactoClienteCommandHandler:**
```csharp
// Validates contacto exists; if clienteId != null validates cliente exists
// Sets contacto.ClienteID = command.ClienteId via AssignCliente(Guid?) domain method
// Returns ContactoDto with updated clienteId
```

**Frontend — Query invalidation contracts:**

| Hook | Action | Keys invalidated |
|------|--------|-----------------|
| useAssignContactoCliente | Associate | ['contactos'], ['contactos', { clienteId: currentClienteId }] |
| useAssignContactoCliente | Disassociate | ['contactos'], ['contactos', { clienteId: currentClienteId }] |
| useReassignContactoCliente | Reassign | ['contactos'], ['contactos', { clienteId: oldClienteId }], ['contactos', { clienteId: newClienteId }] |

> Critical distinction: reassign requires 3 invalidations; assign/disassociate require 2. Using the wrong hook for reassign breaks immediate visibility for the new client (AC-E4.7, FR27).

---

## 2. Risk Assessment

### 2.1 Risk Register

| Risk ID | Story | Category | Risk Description | Probability (1–3) | Impact (1–3) | Score | Classification | Mitigation |
|---------|-------|----------|-----------------|:-----------------:|:------------:|:-----:|:--------------:|------------|
| R4-1 | 4.6 | BUS | `useReassignContactoCliente` missing `['contactos', { clienteId: newClienteId }]` invalidation — new client's AssociatedContactsSection does not refresh immediately, violating AC-E4.7 and FR27 | 2 | 3 | **6** | **HIGH — MITIGATE** | Add backend integration test for reassign case in `AssignContactoClienteTests.cs`. Unit tests mock invalidation calls but cannot verify actual cache behavior. |
| R4-2 | 4.2 | BUS | `currentClienteId` not passed correctly to `useAssignContactoCliente` mutateAsync — scoped key `['contactos', { clienteId }]` is not invalidated, so AssociatedContactsSection does not refresh after associate/disassociate | 2 | 2 | 4 | MEDIUM — MONITOR | Explicit integration test validates section refreshes. Review AssociatedContactsSection.test.tsx coverage for key invalidation assertions. |
| R4-3 | 4.4 | TECH | `useCliente` called with `id: ''` (empty string) when `contacto?.clienteId` is null/undefined — `enabled: !!contacto?.clienteId` guard should prevent the call but boundary case during initial render (contacto undefined) must be safe | 2 | 2 | 4 | MEDIUM — MONITOR | Story 4.4 completion notes add test `does not fetch when enabled is false`. Confirm test covers the empty-string id edge specifically. |
| R4-4 | 4.6 | DATA | `stepsCompleted: []` — formal per-step verification checklist not filled, same pattern as story 3.5 | 2 | 2 | 4 | MEDIUM — MONITOR | Completion notes confirm 88/88 tests pass. Manually verify `ReasignarClienteDialog` and `useReassignContactoCliente` files exist in repo before sprint close. |
| R4-5 | 4.2 | DATA | `AssociarContactoDialog` filter uses `!c.clienteId` (falsy check) instead of `c.clienteId === null`. An empty string clienteId (malformed data) would be incorrectly treated as orphan and shown in the selector | 1 | 2 | 2 | LOW — DOCUMENT | Backend returns `null` for unassigned (never empty string); domain type enforces `clienteId: string \| null`. Backend data contract is canonical. |
| R4-6 | 4.3 | TECH | Pre-existing test failures in `ContactoDetailView.test.tsx` for delete confirmation (siesa-ui-kit Alert renders "Confirmar" differently in test env) — these failures may mask regressions in stories 4.3–4.6 test additions | 2 | 1 | 2 | LOW — DOCUMENT | Failures documented in story 4.3 completion notes. Tracked separately; not introduced by epic 4 stories. |
| R4-7 | 4.4 | TECH | Bidirectional cross-module import: `ContactoDetailView` (contactos module) imports `useCliente` (clientes module), while `AssociatedContactsSection` (clientes module) imports contacto hooks. Circular-ish dependency could complicate future modularization | 1 | 2 | 2 | LOW — DOCUMENT | Explicitly documented as intentional architecture decision in story 4.4 dev notes. No runtime issue in current Vite bundler setup. |

### 2.2 Risk Summary

```
Score 6 (HIGH):    1 risk  → MITIGATE  → add new backend integration test
Score 3–5 (MED):   3 risks → MONITOR   → verify in sprint review
Score 1–2 (LOW):   3 risks → DOCUMENT  → no action required
```

**Overall risk posture: MEDIUM** — one HIGH risk (R4-1) is partially mitigated by existing unit tests that mock invalidation calls, but lacks a true integration-level assertion. A new backend reassign test is required to close the gap.

---

## 3. Test Coverage Design

### 3.1 Scenario Coverage Matrix

| Scenario ID | Story | AC | Scenario Description | Test Level | Priority | Status |
|-------------|-------|----|---------------------|------------|:--------:|--------|
| S4.1.1 | 4.1 | AC1 | Client with contacts → AssociatedContactsSection renders all linked contacts (FR21) | Component | P0 | Existing — AssociatedContactsSection.test.tsx |
| S4.1.2 | 4.1 | AC2 | Client with no contacts → empty state "Sin contactos asociados aún." displayed | Component | P1 | Existing — AssociatedContactsSection.test.tsx |
| S4.1.3 | 4.1 | AC3 | Backend unavailable → ErrorPanel with retry option rendered | Component | P1 | Existing — AssociatedContactsSection.test.tsx |
| S4.1.4 | 4.1 | AC1 | GET /api/v1/contactos?clienteId={guid} returns only contacts for that clienteId | API Integration | P0 | Existing — GetContactosByClienteIdTests.cs |
| S4.1.5 | 4.1 | AC1 | GET /api/v1/contactos?clienteId={guid} for unknown clienteId returns empty array (not 404) | API Integration | P1 | Existing — GetContactosByClienteIdTests.cs |
| S4.2.1 | 4.2 | AC1 | Associate contact → PUT called with clienteId, contact appears in AssociatedContactsSection (FR17, FR19) | Component + Hook | P0 | Existing — AssociatedContactsSection.test.tsx, useAssignContactoCliente.test.ts |
| S4.2.2 | 4.2 | AC2 | Disassociate contact → PUT called with null, contact removed from section; record still in /contactos (FR20) | Component + Hook | P0 | Existing — AssociatedContactsSection.test.tsx, useAssignContactoCliente.test.ts |
| S4.2.3 | 4.2 | AC3 | AssociarContactoDialog shows only unassigned contacts (clienteId === null) | Component | P1 | Existing — AssociarContactoDialog.test.tsx |
| S4.2.4 | 4.2 | AC8 | AssociarContactoDialog shows "No hay contactos disponibles" when all contacts are assigned | Component | P1 | Existing — AssociarContactoDialog.test.tsx |
| S4.2.5 | 4.2 | AC7 | Action buttons disabled while mutation isPending (prevent double-submit) | Component | P1 | Existing — AssociatedContactsSection.test.tsx |
| S4.2.6 | 4.2 | AC5 | Toast "Contacto asociado correctamente" on successful association | Hook | P1 | Existing — useAssignContactoCliente.test.ts |
| S4.2.7 | 4.2 | AC5 | Toast "Contacto desasociado correctamente" on successful disassociation | Hook | P1 | Existing — useAssignContactoCliente.test.ts |
| S4.2.8 | 4.2 | AC5 | Toast "No se pudo completar la operación" on error | Hook | P1 | Existing — useAssignContactoCliente.test.ts |
| S4.2.9 | 4.2 | AC4 | Both ['contactos'] and ['contactos', { clienteId }] invalidated on success (FR27) | Hook | P0 | Existing — useAssignContactoCliente.test.ts |
| S4.2.10 | 4.2 | AC6 | PUT /api/v1/contactos/{id}/cliente with valid clienteId → 200 OK + updated dto | API Integration | P0 | Existing — AssignContactoClienteTests.cs |
| S4.2.11 | 4.2 | AC6 | PUT /api/v1/contactos/{id}/cliente with clienteId: null → 200 OK + dto.clienteId null | API Integration | P0 | Existing — AssignContactoClienteTests.cs |
| S4.2.12 | 4.2 | AC6 | PUT with unknown contactoId → 404 Problem Details | API Integration | P1 | Existing — AssignContactoClienteTests.cs |
| S4.2.13 | 4.2 | AC6 | PUT with valid contactoId + unknown clienteId → 404 Problem Details | API Integration | P1 | Existing — AssignContactoClienteTests.cs |
| **S4.2.14** | **4.2/4.6** | **AC6** | **PUT with contact already having a clienteId → reassign to different clienteId → 200 OK + updated dto (handles overwrite, not just null→value)** | **API Integration** | **P1** | **NEW — AssignContactoClienteTests.cs** |
| S4.3.1 | 4.3 | AC1 | Click contact row in AssociatedContactsSection → navigate to /contactos/:id (FR22, NFR8 ≤2 clicks) | Component | P0 | Existing — AssociatedContactsSection.test.tsx |
| S4.3.2 | 4.3 | AC3/AC5 | "Volver" button calls router.history.back() (not hardcoded /contactos) | Component | P1 | Existing — ContactoDetailView.test.tsx |
| S4.3.3 | 4.3 | AC4 | Browser back button returns to client detail view | E2E / Manual | P3 | Not automated — manual verification |
| S4.3.4 | 4.3 | AC3 | "Volver a contactos" in 404 state uses hardcoded /contactos (fallback when no history) | Component | P2 | Existing — ContactoDetailView.test.tsx |
| S4.4.1 | 4.4 | AC1 | Contact with clienteId → client name displayed in detail view (FR23, NFR9) | Component | P0 | Existing — ContactoDetailView.test.tsx |
| S4.4.2 | 4.4 | AC2 | Click client name → navigate to /clientes/:clienteId (FR24) | Component | P1 | Existing — ContactoDetailView.test.tsx |
| S4.4.3 | 4.4 | AC3 | Contact with no clienteId → "Sin cliente asignado" displayed (FR23) | Component | P0 | Existing — ContactoDetailView.test.tsx |
| S4.4.4 | 4.4 | AC4 | Client data loading → "Cargando..." shown in client field | Component | P2 | Existing — ContactoDetailView.test.tsx |
| S4.4.5 | 4.4 | AC3 | useCliente not called (enabled: false) when contact has no clienteId | Hook | P2 | Existing — useCliente.test.ts |
| S4.5.1 | 4.5 | AC1 | Toggle button shows "Sin cliente (N)" with real-time orphan count (FR25) | Component | P1 | Existing — ContactoListView.test.tsx |
| S4.5.2 | 4.5 | AC2 | Activate orphan filter → only contacts with clienteId === null shown (FR25) | Component | P0 | Existing — ContactoListView.test.tsx |
| S4.5.3 | 4.5 | AC4 | Deactivate orphan filter → full contact list restored | Component | P1 | Existing — ContactoListView.test.tsx |
| S4.5.4 | 4.5 | AC5 | Orphan filter + search compose: only contacts matching both predicates shown | Component | P1 | Existing — ContactoListView.test.tsx |
| S4.5.5 | 4.5 | AC3 | Filter active + all contacts assigned → "Todos los contactos tienen cliente asignado" empty state | Component | P2 | Existing — ContactoListView.test.tsx |
| S4.5.6 | 4.5 | AC1 | Toggle button always enabled (design override: disabled contradicts AC3 reachability) | Component | P2 | Existing — ContactoListView.test.tsx (aria-pressed assertion) |
| S4.6.1 | 4.6 | AC1 | "Reasignar cliente" button visible when contact has clienteId != null | Component | P1 | Existing — ContactoDetailView.test.tsx |
| S4.6.2 | 4.6 | AC1 | "Reasignar cliente" button NOT visible when contact is orphan (clienteId null) | Component | P1 | Existing — ContactoDetailView.test.tsx |
| S4.6.3 | 4.6 | AC2 | ReasignarClienteDialog Select shows all clients EXCEPT current one | Component | P1 | Existing — ReasignarClienteDialog.test.tsx |
| S4.6.4 | 4.6 | AC2 | "Guardar" button disabled until a client is selected | Component | P2 | Existing — ReasignarClienteDialog.test.tsx |
| S4.6.5 | 4.6 | AC3 | Confirm → PUT called with newClienteId (FR26) | Hook | P0 | Existing — useReassignContactoCliente.test.ts |
| S4.6.6 | 4.6 | AC3 | All 3 query keys invalidated: ['contactos'], [{clienteId: oldId}], [{clienteId: newId}] (FR27) | Hook | P0 | Existing — useReassignContactoCliente.test.ts |
| **S4.6.7** | **4.6** | **AC3** | **GET /api/v1/contactos?clienteId=oldId excludes contact; ?clienteId=newId includes contact after reassign (validates full data flow post-reassign at DB level)** | **API Integration** | **P2** | **NEW — GetContactosByClienteIdTests.cs** |
| S4.6.8 | 4.6 | AC3 | Toast "Contacto reasignado correctamente" on success | Hook | P1 | Existing — useReassignContactoCliente.test.ts |
| S4.6.9 | 4.6 | AC4 | Cancel → no API call; dialog closes; selection reset | Component | P1 | Existing — ReasignarClienteDialog.test.tsx |
| S4.6.10 | 4.6 | AC5 | Error → error toast shown; dialog stays open (user can retry) | Hook + Component | P1 | Existing — useReassignContactoCliente.test.ts |
| S4.6.11 | 4.6 | AC4 | Selection resets to undefined when dialog reopened after cancel | Component | P3 | Existing — ReasignarClienteDialog.test.tsx |

### 3.2 Scenario Summary

| Priority | Count | Estimated Effort | Execution Gate |
|:--------:|:-----:|:----------------:|:--------------:|
| P0 | 9 | ~18 hours | Every commit |
| P1 | 14 | ~14 hours | Every PR to main |
| P2 | 6 | ~3 hours | Nightly |
| P3 | 2 | ~1 hour | On-demand |
| **Total** | **31** | **~36 hours** | |

---

## 4. New Tests Required

### 4.1 Test Gap Analysis

**2 new integration tests are required.** All other scenarios are covered by existing test files.

---

### Test 1 — Backend Integration: Reassign Contact (Contact Already Assigned)

**Scenario:** S4.2.14  
**Priority:** P1  
**Risk mitigated:** R4-1 (HIGH)  
**File:** `backend/tests/SiesaAgents.IntegrationTests/Contactos/AssignContactoClienteTests.cs`

**Rationale:** The existing `AssignContactoClienteTests.cs` covers:
- Assigning a contact with `clienteId: null` (fresh assign)
- Disassociating with `clienteId: null`

It does **not** cover the reassign case — a contact whose `clienteId` is already set to ClienteA being overwritten with ClienteB. This is the exact path `useReassignContactoCliente` calls in Story 4.6. Without this test, a handler regression (e.g., conditional early-return when `ClienteID != null`) would go undetected at the integration level.

**Test case:**
```csharp
[Fact]
public async Task ReassignContacto_WithDifferentClienteId_Returns200AndUpdatesClienteId()
{
    // Arrange
    // Seed two clients: clienteA and clienteB
    var clienteA = /* seed cliente A */;
    var clienteB = /* seed cliente B */;
    // Seed a contacto already assigned to clienteA
    var contacto = /* seed contacto with ClienteId = clienteA.ID */;

    var request = new { clienteId = clienteB.ID };

    // Act
    var response = await Client.PutAsJsonAsync(
        $"/api/v1/contactos/{contacto.ID}/cliente", request);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    var dto = await response.Content.ReadFromJsonAsync<ContactoDto>();
    dto!.ClienteId.Should().Be(clienteB.ID);
    dto.ClienteId.Should().NotBe(clienteA.ID);
}
```

---

### Test 2 — Backend Integration: Query Reflects Post-Reassign State

**Scenario:** S4.6.7  
**Priority:** P2  
**Risk mitigated:** R4-1 (HIGH) — database layer verification  
**File:** `backend/tests/SiesaAgents.IntegrationTests/Contactos/GetContactosByClienteIdTests.cs`

**Rationale:** After a reassignment, the frontend relies on `GET /api/v1/contactos?clienteId=X` returning correctly filtered data for both the old and new client. This test verifies the database state is correct after `PUT /api/v1/contactos/{id}/cliente` — i.e., the EF Core `AssignCliente()` domain method and the `UpdateAsync` repository call are correctly persisted. This is complementary to Test 1 and exercises the full round-trip at the query level.

**Test case:**
```csharp
[Fact]
public async Task GetContactosByCliente_AfterReassign_ReflectsNewAssignment()
{
    // Arrange
    var clienteA = /* seed cliente A */;
    var clienteB = /* seed cliente B */;
    var contacto = /* seed contacto with ClienteId = clienteA.ID */;

    // Act — reassign to clienteB
    await Client.PutAsJsonAsync(
        $"/api/v1/contactos/{contacto.ID}/cliente",
        new { clienteId = clienteB.ID });

    // Assert — old client no longer lists the contact
    var responseA = await Client.GetFromJsonAsync<List<ContactoDto>>(
        $"/api/v1/contactos?clienteId={clienteA.ID}");
    responseA.Should().NotContain(c => c.Id == contacto.ID);

    // Assert — new client now lists the contact
    var responseB = await Client.GetFromJsonAsync<List<ContactoDto>>(
        $"/api/v1/contactos?clienteId={clienteB.ID}");
    responseB.Should().Contain(c => c.Id == contacto.ID);
}
```

---

## 5. Test Deliverables

### 5.1 Existing Test Artifacts Inventory

| File | Scope | Test Count | Priority Coverage |
|------|-------|:----------:|:-----------------:|
| `backend/tests/SiesaAgents.IntegrationTests/Contactos/GetContactosByClienteIdTests.cs` | Story 4.1 — filtered GET endpoint | ~3 | P0, P1 |
| `backend/tests/SiesaAgents.IntegrationTests/Contactos/AssignContactoClienteTests.cs` | Story 4.2 — assign/disassociate backend | 4 | P0, P1 |
| `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.test.tsx` | Stories 4.1, 4.2, 4.3 | ~10 | P0, P1 |
| `frontend/src/modules/crm/contactos/application/useAssignContactoCliente.test.ts` | Story 4.2 mutations | 6 | P0, P1 |
| `frontend/src/modules/crm/clientes/presentation/AssociarContactoDialog.test.tsx` | Story 4.2 selector | 6 | P1 |
| `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx` | Stories 4.3, 4.4, 4.6 | ~23 | P0, P1, P2 |
| `frontend/src/modules/crm/clientes/application/useCliente.test.ts` | Story 4.4 enabled option | ~4 | P2 |
| `frontend/src/modules/crm/contactos/presentation/ContactoListView.test.tsx` | Story 4.5 orphan filter | ~19 | P0, P1, P2 |
| `frontend/src/modules/crm/contactos/application/useReassignContactoCliente.test.ts` | Story 4.6 reassign hook | 4 | P0, P1 |
| `frontend/src/modules/crm/contactos/presentation/ReasignarClienteDialog.test.tsx` | Story 4.6 dialog | 9 | P1, P2, P3 |

### 5.2 New Test Artifacts Required

| File | Test Name | Priority | Effort |
|------|-----------|:--------:|:------:|
| `backend/tests/SiesaAgents.IntegrationTests/Contactos/AssignContactoClienteTests.cs` | `ReassignContacto_WithDifferentClienteId_Returns200AndUpdatesClienteId` | P1 | ~2h |
| `backend/tests/SiesaAgents.IntegrationTests/Contactos/GetContactosByClienteIdTests.cs` | `GetContactosByCliente_AfterReassign_ReflectsNewAssignment` | P2 | ~2h |

**Total new tests: 2**

### 5.3 Pre-Existing Failures to Track

| Location | Failing Tests | Root Cause | Owner Action |
|----------|--------------|------------|-------------|
| `ContactoDetailView.test.tsx` | Delete confirmation tests (2) | siesa-ui-kit Alert renders "Confirmar" differently in test env | Tracked since story 4.3; use `getAllByText('Eliminar')[1]` workaround documented |
| Navigation tests | ~6 tests | Integration navigation setup | Pre-existing, unrelated to epic 4 |

---

## 6. Gate Decisions

### 6.1 Risk-Based Gate

| Risk | Gate | Decision |
|------|------|----------|
| R4-1 — 3 key invalidation (HIGH) | P1 (PR gate) | **BLOCK PR to main** until `ReassignContacto_WithDifferentClienteId_Returns200AndUpdatesClienteId` test is written and passing |
| R4-4 — stepsCompleted: [] (MEDIUM) | Sprint review | **VERIFY** `ReasignarClienteDialog.tsx` and `useReassignContactoCliente.ts` exist in repo and 88 tests pass |
| R4-2, R4-3 — MEDIUM risks | Nightly | **MONITOR** — flag if related test suite regresses |

### 6.2 Epic Acceptance Criteria Traceability

| Epic AC | Story | Scenario(s) | Covered? |
|---------|-------|-------------|:--------:|
| AC-E4.1: Associate contact from client detail without navigating away | 4.2 | S4.2.1, S4.2.10 | ✓ |
| AC-E4.2: See all contacts in client detail; navigate to any in ≤2 clicks | 4.1, 4.3 | S4.1.1, S4.3.1 | ✓ |
| AC-E4.3: From contact detail, see which client it belongs to; navigate in 1 click | 4.4 | S4.4.1, S4.4.2 | ✓ |
| AC-E4.4: Disassociate contact without deleting either record | 4.2 | S4.2.2, S4.2.11 | ✓ |
| AC-E4.5: Filter contact list to show only orphan contacts | 4.5 | S4.5.1, S4.5.2 | ✓ |
| AC-E4.6: Reassign contact from one client to another | 4.6 | S4.6.5, **S4.2.14 (NEW)** | Partial → new test required |
| AC-E4.7: All changes visible immediately for all users without refresh | 4.2, 4.6 | S4.2.9, S4.6.6, **S4.6.7 (NEW)** | Partial → new test required |

---

*Test Design generated by BMAD testarch workflow — Epic-Level Mode (Phase 4)*
*Workflow: `_bmad/bmm/workflows/testarch/test-design/workflow.yaml`*
