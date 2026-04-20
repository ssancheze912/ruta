# Test Design: Epic 3 - Contact Management (Gestión de Contactos)

**Date:** 2026-04-08
**Author:** SiesaTeam
**Status:** Draft
**Epic:** 3 — Gestión de Contactos
**Stories covered:** 3.1 (Contact List & Search), 3.2 (Contact Detail View), 3.3 (Create Contact), 3.4 (Edit Contact), 3.5 (Delete Contact)

---

## Executive Summary

**Scope:** Full test design for Epic 3 — complete CRUD for Contact records, including list with "Sin cliente" filter, detail view, create with email validation, edit with ClienteId preservation, and delete.

**Story Status at Time of Design:**

| Story | Title | Status | Notes |
|-------|-------|--------|-------|
| 3.1 | Contact List & Search | done | |
| 3.2 | Contact Detail View | done | |
| 3.3 | Create Contact | **review** | Status header says "review" |
| 3.4 | Edit Contact | done | |
| 3.5 | Delete Contact | done | `stepsCompleted: []` — checklist not updated |

> **Flag:** Story 3.5 has `stepsCompleted: []` despite `status: done`. Verify that DELETE `/api/v1/contactos/{id}` and frontend `useDeleteContacto` are fully implemented before running P0 tests.

**Key architectural differences from Epic 2 (Clients):**

| Aspect | Epic 2 (Clientes) | Epic 3 (Contactos) |
|--------|-------------------|--------------------|
| Unique field | NIT/RUC (unique index) | Email (non-unique — no 409 conflict) |
| DELETE response | 200 + `{contactosDesasociados: N}` | **204 No Content** |
| Update complexity | Duplicate NIT check required | No uniqueness check — simpler PUT |
| Domain FK | No FK dependency | `ClienteId` nullable FK (must be preserved on update) |
| Extra UI | None | "Sin cliente" filter chip |
| Email validation | None | FluentValidation `EmailAddress()` + Zod email |

**Risk Summary:**

- Total risks identified: 8
- High-priority risks (≥6): **1** (ClienteId preservation on update)
- Medium risks (3–5): 3
- Low risks (1–2): 4
- Critical categories: DATA, BUS, TECH, SEC

**Coverage Summary:**

- P0 scenarios: 10 (20 hours)
- P1 scenarios: 10 (10 hours)
- P2 scenarios: 5 (2.5 hours)
- P3 scenarios: 1 (0.25 hours — manual)
- **Total effort:** ~33 hours (~4 days)

**Existing test coverage:**

| Layer | File | Tests | Stories |
|-------|------|-------|---------|
| Frontend Unit | `useContactos.test.ts` | 3 | 3.1 |
| Frontend Unit | `ContactoListView.test.tsx` | 6 | 3.1 |
| Frontend Unit | `useContacto.test.ts` | ~3 | 3.2 |
| Frontend Unit | `ContactoDetailView.test.tsx` | ~5 | 3.2, 3.4, 3.5 |
| Frontend Unit | `useCreateContacto.test.ts` | ~3 | 3.3 |
| Frontend Unit | `ContactoForm.test.tsx` | ~6 | 3.3, 3.4 |
| Frontend Unit | `useUpdateContacto.test.ts` | ~4 | 3.4 |
| Frontend Unit | `useDeleteContacto.test.ts` | ~3 | 3.5 |
| Backend Unit | `GetContactosQueryHandlerTests.cs` | 4 | 3.1 |
| Backend Unit | `GetContactoByIdQueryHandlerTests.cs` | 2 | 3.2 |
| Backend Unit | `CreateContactoCommandHandlerTests.cs` | ~3 | 3.3 |
| Backend Unit | `UpdateContactoCommandHandlerTests.cs` | ~4 | 3.4 |
| Backend Unit | `DeleteContactoCommandHandlerTests.cs` | ~3 | 3.5 |
| Backend Integration | `ContactoEndpointsTests.cs` | ~12 | 3.1–3.5 |
| **Total existing** | | **~61** | |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|------------|-------|
| R-001 | DATA | `ClienteId` not preserved during contact update — `ContactoEntity.Update()` is called with `entity.ClienteId` as explicit parameter; if handler loads entity with `AsNoTracking()` or passes wrong value, client association is silently wiped | 2 | 3 | 6 | Add integration test: assign contact to client, PUT contact, verify `clienteId` unchanged in DB response | DEV |

### Medium-Priority Risks (Score 3–5)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|------------|-------|
| R-002 | BUS | "Sin cliente" filter chip uses wrong condition — `contacto.clienteId === null` vs `undefined` check differs in TypeScript; filter may show wrong results | 2 | 2 | 4 | Add unit test verifying contacts with `clienteId: null` appear in filter; contacts with non-null `clienteId` are excluded | DEV |
| R-003 | BUS | Backend 422 error `detail` field not extracted and displayed in form — AC5 of Stories 3.3/3.4 requires showing Problem Details `detail` string in Spanish; frontend may show generic error instead | 2 | 2 | 4 | Add component test verifying form displays server error message from 422 response body | DEV |
| R-004 | TECH | Story 3.5 `stepsCompleted: []` despite `status: done` — implementation checklist was not tracked; may indicate incomplete backend or frontend steps | 2 | 2 | 4 | Verify DELETE endpoint exists and returns 204; run existing tests; confirm `useDeleteContacto` wired in `ContactoDetailView` | QA |

### Low-Priority Risks (Score 1–2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
|---------|----------|-------------|-------------|--------|-------|--------|
| R-005 | SEC | Email format not validated on frontend — Zod schema may use `z.string().min(1)` instead of `z.string().email()`, allowing malformed emails to reach backend | 1 | 2 | 2 | Audit `contactoSchema.ts`; verify Zod uses `.email()` rule |
| R-006 | DATA | DELETE returns 204 No Content — Axios response may throw on empty body if `response.data` is accessed; `useDeleteContacto` must handle void response | 1 | 2 | 2 | Verify `mutationFn` doesn't access `.data` on DELETE response |
| R-007 | PERF | Client-side search with 1,000 contacts (double the client dataset) — NFR1 requires <1s | 1 | 2 | 2 | Manual benchmark; useMemo handles 1k in <10ms |
| R-008 | DATA | `UpdatedAt` not set by `ContactoEntity.Update()` domain method | 1 | 1 | 1 | Verify `entity.Update(...)` sets `UpdatedAt = DateTimeOffset.UtcNow` |

### Risk Category Legend

- **DATA**: Data Integrity (ClienteId preserved, timestamp correctness)
- **BUS**: Business Impact (filter correctness, error message display)
- **TECH**: Technical (incomplete implementation checklist)
- **SEC**: Security (email validation layer coverage)
- **PERF**: Performance (search with 1,000 records)

---

## Test Coverage Plan

### P0 (Critical) — Run on every commit

**Criteria**: Core CRUD API endpoints + client-side search + form validation — all existing

| AC | Requirement | Test Level | Risk Link | Test ID | Owner | Status |
|----|-------------|------------|-----------|---------|-------|--------|
| 3.1-AC7 | `GET /api/v1/contactos` → 200 + empty array | API (Integration) | — | 3.1-INT-001 | DEV | Existing |
| 3.1-AC7 | `GET /api/v1/contactos` → 200 + ContactoDto shape (id, nombre, cargo, telefono, email, clienteId, createdAt, updatedAt) | API (Integration) | — | 3.1-INT-002 | DEV | Existing |
| 3.1-AC2 | Contact list filters by `nombre` (case-insensitive) | Unit (Component) | — | 3.1-UNIT-001 | DEV | Existing |
| 3.1-AC2 | Contact list filters by `email` | Unit (Component) | — | 3.1-UNIT-002 | DEV | Existing |
| 3.3-AC3 | Submit empty form → inline errors per field, no backend call | Unit (Component) | R-005 | 3.3-UNIT-001 | DEV | Existing |
| 3.3-AC8 | `POST /api/v1/contactos` with valid data → 201 + ContactoDto | API (Integration) | — | 3.3-INT-001 | DEV | Existing |
| 3.3-AC8 | `POST /api/v1/contactos` with empty Nombre → 422 Problem Details | API (Integration) | — | 3.3-INT-002 | DEV | Existing |
| 3.3-AC8 | `POST /api/v1/contactos` with invalid Email format → 422 | API (Integration) | R-005 | 3.3-INT-003 | DEV | Existing |
| 3.4-AC8 | `PUT /api/v1/contactos/{id}` with valid data → 200 + updated ContactoDto | API (Integration) | R-001 | 3.4-INT-001 | DEV | Existing |
| 3.5-AC6 | `DELETE /api/v1/contactos/{id}` → 204 No Content | API (Integration) | R-004 | 3.5-INT-001 | DEV | Existing |

**Total P0:** 10 tests (all existing — must remain passing; verify 3.5-INT-001 given incomplete checklist)

---

### P1 (High) — Run on PR to main

**Criteria**: Critical detail view, cascade integrity, edge cases on delete/filter

| AC | Requirement | Test Level | Risk Link | Test ID | Owner | Status |
|----|-------------|------------|-----------|---------|-------|--------|
| 3.2-AC7 | `GET /api/v1/contactos/{id}` → 200 + ContactoDto when exists | API (Integration) | — | 3.2-INT-001 | DEV | Existing |
| 3.2-AC7 | `GET /api/v1/contactos/{id}` → 404 Problem Details when not found | API (Integration) | — | 3.2-INT-002 | DEV | Existing |
| 3.4-AC8 | `PUT /api/v1/contactos/{id}` → `clienteId` field preserved (not nulled) after update | API (Integration) | **R-001** | 3.4-INT-002 | DEV | **NEW** |
| 3.4-AC8 | `PUT /api/v1/contactos/{id}` → 404 for non-existent ID | API (Integration) | — | 3.4-INT-003 | DEV | Existing |
| 3.5-AC6 | `DELETE /api/v1/contactos/{id}` → 404 for non-existent ID | API (Integration) | — | 3.5-INT-002 | DEV | Existing |
| 3.1-AC5 | "Sin cliente" filter chip shows only contacts with `clienteId === null` | Unit (Component) | R-002 | 3.1-UNIT-003 | DEV | Existing |
| 3.2-AC4 | Non-existent contactoId in URL → "Contacto no encontrado." message | Unit (Component) | — | 3.2-UNIT-001 | DEV | Existing |
| 3.3-AC4 | Success → toast "Contacto creado correctamente" + `['contactos']` invalidated | Unit (Application) | — | 3.3-UNIT-002 | DEV | Existing |
| 3.5-AC4 | Confirm delete → navigates to `/contactos` + toast "Contacto eliminado correctamente" | Unit (Component) | R-004 | 3.5-UNIT-001 | DEV | Existing |
| 3.5-AC3 | Cancel in delete dialog → contact not deleted | Unit (Component) | — | 3.5-UNIT-002 | DEV | Existing |

**Total P1:** 10 tests (9 existing, 1 new)

**New P1 test to implement:**
- `3.4-INT-002`: `PutContacto_PreservesClienteId_AfterUpdate` — add to `ContactoEndpointsTests.cs`
  - Setup: create contact, assign `clienteId` directly via DB, PUT contact with updated fields
  - Assert: response includes same `clienteId`, contact still associated in DB

---

### P2 (Medium) — Run nightly/weekly

**Criteria**: Email validation, server error display, loading states, Zod schema audit

| AC | Requirement | Test Level | Risk Link | Test ID | Owner | Status |
|----|-------------|------------|-----------|---------|-------|--------|
| 3.3-AC3 | Invalid email format (e.g., `"not-an-email"`) rejected by Zod — error shown below Email field | Unit (Component) | R-005 | 3.3-UNIT-003 | DEV | **NEW** |
| 3.3-AC5 | Backend 422 error: `detail` from Problem Details shown inside form in Spanish | Unit (Component) | R-003 | 3.3-UNIT-004 | DEV | **NEW** |
| 3.4-AC5 | Backend 422 on edit: `detail` from Problem Details shown inside form | Unit (Component) | R-003 | 3.4-UNIT-001 | DEV | Existing |
| 3.1-AC3 | EmptyState shown when API returns `[]` | Unit (Component) | — | 3.1-UNIT-004 | DEV | Existing |
| 3.5-AC5 | While delete pending, "Confirmar" button is disabled (loading state) | Unit (Component) | — | 3.5-UNIT-003 | DEV | Existing |

**Total P2:** 5 tests (3 existing, 2 new)

**New P2 tests to implement:**
- `3.3-UNIT-003`: Invalid email format rejected by Zod — add to `ContactoForm.test.tsx`
- `3.3-UNIT-004`: 422 `detail` field displayed in form — add to `ContactoForm.test.tsx` or `useCreateContacto.test.ts`

---

### P3 (Low) — Run on-demand

| AC | Requirement | Test Level | Test ID | Owner | Status |
|----|-------------|------------|---------|-------|--------|
| 3.1-AC2 | Search with 1,000 contacts returns results in <1s (NFR1) | Performance (Manual) | 3.1-PERF-001 | QA | Manual |

**Total P3:** 1 test (manual)

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Verify contact CRUD API endpoints are operational

- [ ] 3.1-INT-001: GET /api/v1/contactos → 200 + `[]`
- [ ] 3.1-INT-002: GET /api/v1/contactos → 200 + ContactoDto shape
- [ ] 3.3-INT-001: POST → 201 + ContactoDto
- [ ] 3.4-INT-001: PUT → 200 + updated ContactoDto
- [ ] 3.5-INT-001: DELETE → 204 No Content

### P0 Tests (<10 min)

All 10 P0 scenarios. Frontend tests (Vitest parallel): <2 min. Backend unit + integration (Testcontainers): <10 min.

### P1 Tests (<25 min)

All 10 P1 scenarios including new `3.4-INT-002` (ClienteId preservation).

### P2/P3 Tests (<20 min)

5 P2 scenarios including new email + 422 tests. 1 P3 manual benchmark.

---

## Resource Estimates

### Test Development Effort

| Priority | New Tests | Hours/Test | Total Hours | Notes |
|----------|-----------|------------|-------------|-------|
| P0 | 0 | — | 0 | All existing |
| P1 | 1 | 2.0 | 2.0 | Testcontainers: create contact with clienteId, PUT, verify FK preserved |
| P2 | 2 | 1.5 | 3.0 | Email Zod test + 422 error display test |
| P3 | 0 | — | 0 | Manual only |
| **Total** | **3** | — | **5.0** | **~0.5 day** |

### Prerequisites

**Test Data:**
- `ContactoEndpointsTests.cs` already uses Testcontainers + `MigrateAsync()` pattern
- New test `3.4-INT-002` requires a Cliente to be created first (FK reference), then a Contacto assigned to that client — both via `AppDbContext` in test setup

**Tooling:**
- Testcontainers.PostgreSql + xUnit (backend integration) — already configured
- MSW + Vitest + @testing-library/react (frontend) — already configured
- Docker required for integration tests

**Environment:**
- Both `clientes` and `contactos` tables required (cross-epic FK for `3.4-INT-002`)
- Migration `AddContactosTable` must be applied (done in Story 3.1)

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (10/10 — confirm Story 3.5 DELETE test passes given incomplete checklist)
- **P1 pass rate**: ≥95% (9/10 minimum; `3.4-INT-002` is new and required)
- **P2/P3 pass rate**: ≥90% (informational)
- **High-risk mitigations**: 100% — R-001 (ClienteId preservation) must be verified

### Coverage Targets

- **CRUD happy paths**: 100% (GET list, GET by ID, POST, PUT, DELETE all covered)
- **Email validation**: 100% — both FluentValidation (backend) and Zod (frontend) tested
- **Error handling (SEC)**: 100% — 404, 422 all handled; no stack trace exposure
- **ClienteId integrity (DATA)**: 100% — preserve FK on update explicitly tested
- **"Sin cliente" filter (BUS)**: 100% — filter condition validated

### Non-Negotiable Requirements

- [ ] All P0 tests pass (10/10), including Story 3.5 DELETE
- [ ] `ClienteId` preserved after contact update — R-001 (Score 6) **verified by `3.4-INT-002`**
- [ ] Email validation at both Zod + FluentValidation layers
- [ ] No stack traces in any error response
- [ ] 422 backend error `detail` displayed in form without raw JSON

---

## Mitigation Plans

### R-001: ClienteId Preservation on PUT (Score: 6 — HIGH)

**Mitigation Strategy:** Add integration test `3.4-INT-002`:

```
1. Create a ClienteEntity via AppDbContext (or POST /api/v1/clientes)
2. Create a ContactoEntity with clienteId = client.Id via AppDbContext
3. PUT /api/v1/contactos/{contactoId} with updated Nombre/Cargo/Telefono/Email
4. Assert: response body clienteId == original client.Id (not null, not changed)
5. Assert: GET /api/v1/contactos/{contactoId} still returns same clienteId
```

The implementation in Story 3.4 explicitly passes `entity.ClienteId` to `entity.Update(...)`. This test validates that the runtime behavior matches the intent.

**Owner:** DEV
**Timeline:** Before Epic 3 test design sign-off
**Status:** Planned
**Verification:** `3.4-INT-002` passes

---

### R-002: "Sin cliente" Filter Correctness (Score: 4)

**Mitigation Strategy:** Verify `ContactoListView.test.tsx` has a test that:
1. Mocks contacts with `clienteId: null` AND `clienteId: "some-id"`
2. Activates "Sin cliente" filter chip
3. Asserts only contacts with `clienteId: null` are shown
4. Asserts contacts with non-null `clienteId` are hidden

The existing test (3.1-UNIT-003) likely covers this — review and strengthen if assertion is weak.

**Owner:** DEV
**Timeline:** Review existing test before Epic 3 sign-off
**Status:** Review existing test

---

### R-003: 422 Error Detail Display in Form (Score: 4)

**Mitigation Strategy:** Add `3.3-UNIT-004` to `ContactoForm.test.tsx`:
1. Mock `useCreateContacto` to return error with `response.data.detail: "El email no es válido"`
2. Fill form with valid data, submit
3. Assert error message appears inside the form
4. Assert form remains open (not closed on error)

This verifies the frontend correctly extracts `error.response.data.detail` from Axios error and displays it.

**Owner:** DEV
**Timeline:** Before Story 3.3 review approval
**Status:** Planned

---

### R-004: Story 3.5 Incomplete Checklist (Score: 4)

**Mitigation Strategy:**
1. Manually verify `ContactoEndpointsTests.cs` contains `DeleteContacto_WhenExists_Returns204` and `DeleteContacto_WhenNotFound_Returns404`
2. Verify `ContactoDetailView` renders "Eliminar" button and confirmation dialog
3. Verify `useDeleteContacto` is imported and wired in `ContactoDetailView.tsx`
4. Run `dotnet test` and `npm test` to confirm all 3.5 tests pass

**Owner:** QA
**Timeline:** Immediate — before any P0 test run
**Status:** Verification required

---

## Assumptions and Dependencies

### Assumptions

1. Story 3.3 in `review` status has full implementation — code written, pending approval
2. Story 3.5 `stepsCompleted: []` is a data entry oversight, not an implementation gap — verify at test time
3. `ContactoEntity.Update()` domain method takes `(nombre, cargo, telefono, email, clienteId)` — preserving FK
4. `ContactoConfiguration` has `OnDelete(DeleteBehavior.SetNull)` and FK → `clientes.id` — confirmed in Story 2.5 and 3.1-AC8
5. No unique constraint on email (unlike NIT for clients) — no 409 scenario for contacts

### Dependencies

1. Epic 2 (Clients) must be deployed — `3.4-INT-002` creates a client as FK reference
2. Migration `AddContactosTable` applied — confirmed in Story 3.1
3. Docker daemon — Testcontainers integration tests
4. `clientes` table + `ClienteEntity` — required for FK in `3.4-INT-002`

### Risks to Plan

- **Risk**: `3.4-INT-002` requires cross-epic data setup (create client + assign to contact)
  - **Impact**: If Clientes endpoint is unavailable in test context, test setup fails
  - **Contingency**: Use `AppDbContext.Clientes.Add(...)` directly in test setup (bypass API) — same approach as `ClienteEndpointsTests.cs`

---

## Follow-on Workflows (Manual)

- Run `*test-design 4` to generate test design for Epic 4 (Asociación Cliente-Contacto)
- Run `*atdd` to generate failing acceptance tests for P0 scenarios
- Run `*automate` for Playwright E2E coverage once Epics 2–4 complete (full contact lifecycle flow)

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: — Date: —
- [ ] Tech Lead: — Date: —
- [ ] QA Lead: — Date: —

---

## Appendix

### Knowledge Base References

- `risk-governance.md` — Risk classification, gate decisions
- `probability-impact.md` — Risk scoring methodology
- `test-levels-framework.md` — Test level selection
- `test-priorities-matrix.md` — P0–P3 criteria

### FRs Covered in This Epic

| FR | Description | Story | Test Coverage |
|----|-------------|-------|---------------|
| FR9 | Register contact with Nombre, Cargo, Teléfono, Email | 3.3 | P0 (3.3-INT-001) |
| FR10 | View contact list | 3.1 | P0 (3.1-INT-001) |
| FR11 | Search contacts by name | 3.1 | P0 (3.1-UNIT-001) |
| FR12 | Search contacts by email | 3.1 | P0 (3.1-UNIT-002) |
| FR13 | View contact detail | 3.2 | P1 (3.2-INT-001) |
| FR14 | Edit contact | 3.4 | P0 (3.4-INT-001) |
| FR15 | Delete contact | 3.5 | P0 (3.5-INT-001) |
| FR16 | Required field validation | 3.3, 3.4 | P0 (3.3-UNIT-001) |
| FR27 | Changes reflected immediately | 3.3, 3.4, 3.5 | P1 (cache invalidation) |

### Contact Domain Model

```
ContactoEntity:
  id          uuid PK
  nombre      varchar NOT NULL
  cargo       varchar NOT NULL
  telefono    varchar NOT NULL
  email       varchar NOT NULL (no unique constraint)
  cliente_id  uuid NULLABLE FK → clientes.id ON DELETE SET NULL
  created_at  timestamptz
  updated_at  timestamptz

Index: ix_contactos_cliente_id, ix_contactos_email
```

### Related Documents

- Epic: `_bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md`
- Stories: `_bmad-output/implementation-artifacts/3-*.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- PRD NFRs: `_bmad-output/planning-artifacts/prd/non-functional-requirements.md`

### New Test File Locations

| Test file | Type | Tests | Priority |
|-----------|------|-------|----------|
| `ContactoEndpointsTests.cs` (extend) | Integration | +1 new | P1 |
| `ContactoForm.test.tsx` (extend) | Unit | +2 new | P2 |

---

**Generated by**: BMad TEA Agent — Test Architect Module
**Workflow**: `_bmad/bmm/testarch/test-design`
**Version**: 4.0 (BMad v6)
