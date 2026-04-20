# Test Design: Epic 2 - Client Management (Gestión de Clientes)

**Date:** 2026-04-08
**Author:** SiesaTeam
**Status:** Draft
**Epic:** 2 — Gestión de Clientes
**Stories covered:** 2.1 (Client List & Search), 2.2 (Client Detail View), 2.3 (Create Client), 2.4 (Edit Client), 2.5 (Delete Client)

---

## Executive Summary

**Scope:** Full test design for Epic 2 — complete CRUD for Client records including list, search, detail view, create, edit, and delete with cascade contact unassignment.

**Story Status at Time of Design:**

| Story | Title | Status |
|-------|-------|--------|
| 2.1 | Client List & Search | done |
| 2.2 | Client Detail View | **review** |
| 2.3 | Create Client | done |
| 2.4 | Edit Client | done |
| 2.5 | Delete Client | done |

> **Note:** Story 2.2 is in `review` status. Test design assumes implementation is complete but not yet merged/approved.

**Risk Summary:**

- Total risks identified: 8
- High-priority risks (≥6): 0
- Medium risks (3–5): 5
- Low risks (1–2): 3
- Critical categories: TECH, DATA, BUS, SEC

**Coverage Summary:**

- P0 scenarios: 12 (24 hours)
- P1 scenarios: 14 (14 hours)
- P2 scenarios: 8 (4 hours)
- P3 scenarios: 3 (0.75 hours)
- **Total effort:** ~43 hours (~5.5 days)

**Existing test coverage:**

| Layer | File | Tests | Stories |
|-------|------|-------|---------|
| Frontend Unit | `useClientes.test.ts` | 3 | 2.1 |
| Frontend Unit | `ClienteListView.test.tsx` | 6 | 2.1 |
| Frontend Unit | `useCliente.test.ts` | ~3 | 2.2 |
| Frontend Unit | `ClienteDetailView.test.tsx` | ~5 | 2.2, 2.4, 2.5 |
| Frontend Unit | `useCreateCliente.test.ts` | ~3 | 2.3 |
| Frontend Unit | `ClienteFormDialog.test.tsx` | ~6 | 2.3, 2.4 |
| Frontend Unit | `useUpdateCliente.test.ts` | ~3 | 2.4 |
| Frontend Unit | `useDeleteCliente.test.ts` | 3 | 2.5 |
| Frontend Unit | `ClienteDeleteDialog.test.tsx` | 4 | 2.5 |
| Backend Unit | `GetClientesQueryHandlerTests.cs` | 2 | 2.1 |
| Backend Unit | `GetClienteByIdQueryHandlerTests.cs` | 2 | 2.2 |
| Backend Unit | `CreateClienteCommandHandlerTests.cs` | 3 | 2.3 |
| Backend Unit | `UpdateClienteCommandHandlerTests.cs` | 4 | 2.4 |
| Backend Unit | `DeleteClienteCommandHandlerTests.cs` | 3 | 2.5 |
| Backend Integration | `ClienteEndpointsTests.cs` | ~14 | 2.1–2.5 |
| **Total existing** | | **~64** | |

---

## Risk Assessment

### Medium-Priority Risks (Score 3–5)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|------------|-------|
| R-001 | TECH | TanStack Query cache invalidation mismatch after mutations — wrong query key in `invalidateQueries` could leave list stale after create/update/delete | 2 | 2 | 4 | Verify canonical query keys `['clientes']` + `['clientes', id]` in integration test; MSW-based tests confirm list re-fetch | DEV |
| R-002 | DATA | Contact cascade `SetNull` behavior when client with contacts is deleted — `OnDelete(DeleteBehavior.SetNull)` configured in EF Core but not explicitly validated end-to-end | 1 | 3 | 3 | Add integration test: create client + contact, delete client, verify contact still exists with `clienteId = null` | DEV |
| R-003 | BUS | Incorrect toast message when deleting client with contacts — wrong `contactosDesasociados` count from backend → wrong toast shown to user | 2 | 2 | 4 | Unit test handler's count logic; integration test verifies 200 response body has `contactosDesasociados > 0` | DEV |
| R-004 | SEC | Zod validation gaps: form could emit empty strings or whitespace-only values to backend if schema uses `z.string()` without `.trim().min(1)` | 2 | 2 | 4 | Audit Zod schema for all 4 fields; add unit test verifying whitespace-only triggers validation error | DEV |
| R-005 | TECH | PUT request with same NIT as current client must return 200 (not 409) — boundary case in `UpdateClienteCommandHandler` where NIT belongs to self, not another client | 2 | 2 | 4 | Unit test explicitly covers this case; integration test confirms 200 for same-NIT update | DEV |

### Low-Priority Risks (Score 1–2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
|---------|----------|-------------|-------------|--------|-------|--------|
| R-006 | PERF | Client-side search with 500 records using `useMemo` — NFR1 (<1s) not measured under load | 1 | 2 | 2 | Document: manual performance test with seeded DB; useMemo is O(n) which handles 500 records in <10ms |
| R-007 | DATA | `UpdatedAt` not explicitly updated in `UpdateClienteCommandHandler` — field may remain stale | 2 | 1 | 2 | Verify unit test asserts `UpdatedAt` changes; inspect handler implementation |
| R-008 | OPS | Testcontainers integration tests require Docker running locally — may fail in CI environments without Docker daemon | 2 | 1 | 2 | Document Docker requirement for CI; use GitHub Actions with Docker-in-Docker or skip integration tests in limited envs |

### Risk Category Legend

- **TECH**: Technical/Architecture (query cache, routing)
- **DATA**: Data Integrity (cascade delete, timestamp correctness)
- **BUS**: Business Impact (incorrect messaging, UX)
- **SEC**: Security (validation gaps, data sanitization)
- **PERF**: Performance (search speed under NFR limits)
- **OPS**: Operations (CI/CD test environment requirements)

---

## Test Coverage Plan

### P0 (Critical) — Run on every commit

**Criteria**: Core user journeys that block Epic 2 business value; data integrity at API level

| AC | Requirement | Test Level | Risk Link | Test ID | Owner | Status |
|----|-------------|------------|-----------|---------|-------|--------|
| 2.1-AC5 | `GET /api/v1/clientes` → 200 + empty array when no clients | API (Integration) | — | 2.1-INT-001 | DEV | Existing |
| 2.1-AC5 | `GET /api/v1/clientes` → 200 + array with correct ClienteDto shape (id, nombre, nit, telefono, ciudad, createdAt, updatedAt) | API (Integration) | — | 2.1-INT-002 | DEV | Existing |
| 2.1-AC2 | Client list filters by `nombre` in real-time (case-insensitive) | Unit (Component) | — | 2.1-UNIT-001 | DEV | Existing |
| 2.1-AC2 | Client list filters by `nit` in real-time | Unit (Component) | — | 2.1-UNIT-002 | DEV | Existing |
| 2.2-AC7 | `GET /api/v1/clientes/{id}` → 200 + ClienteDto when exists | API (Integration) | — | 2.2-INT-001 | DEV | Existing |
| 2.2-AC7 | `GET /api/v1/clientes/{id}` → 404 Problem Details when not found | API (Integration) | — | 2.2-INT-002 | DEV | Existing |
| 2.3-AC3 | Submit empty form → inline errors per field, NO backend call | Unit (Component) | R-004 | 2.3-UNIT-001 | DEV | Existing |
| 2.3-AC4 | POST with duplicate NIT → 409 Conflict with Problem Details | API (Integration) | — | 2.3-INT-001 | DEV | Existing |
| 2.3-AC2 | POST with valid data → 201 Created + Location header | API (Integration) | — | 2.3-INT-002 | DEV | Existing |
| 2.4-AC4 | PUT with NIT belonging to different client → 409 | API (Integration) | R-005 | 2.4-INT-001 | DEV | Existing |
| 2.4-AC2 | PUT with valid data → 200 + updated ClienteDto | API (Integration) | — | 2.4-INT-002 | DEV | Existing |
| 2.5-AC2 | DELETE existing client → 200 + `contactosDesasociados: 0` | API (Integration) | R-003 | 2.5-INT-001 | DEV | Existing |

**Total P0:** 12 tests (all existing — must remain passing)

---

### P1 (High) — Run on PR to main

**Criteria**: Important flows covering edge cases, medium-risk boundary conditions, and UX correctness

| AC | Requirement | Test Level | Risk Link | Test ID | Owner | Status |
|----|-------------|------------|-----------|---------|-------|--------|
| 2.1-AC3 | EmptyState shown when API returns `[]` | Unit (Component) | — | 2.1-UNIT-003 | DEV | Existing |
| 2.1-AC4 | ErrorPanel + Reintentar button shown on fetch failure | Unit (Component) | — | 2.1-UNIT-004 | DEV | Existing |
| 2.1-AC6 | `clientes` table has correct columns: id (uuid PK), nombre, nit (unique), telefono, ciudad, created_at, updated_at | API (Integration) | — | 2.1-INT-003 | DEV | Existing (unique constraint test) |
| 2.2-AC1 | Clicking client item updates right panel AND URL to `/clientes/:clienteId` | Unit (Component) | — | 2.2-UNIT-001 | DEV | Existing |
| 2.2-AC3 | Non-existent clienteId in URL → "Cliente no encontrado." + Volver button | Unit (Component) | — | 2.2-UNIT-002 | DEV | Existing |
| 2.2-AC4 | Loading skeleton shown while fetching (not client fields) | Unit (Component) | — | 2.2-UNIT-003 | DEV | Existing |
| 2.3-AC1 | "Nuevo cliente" button opens dialog with 4 fields | Unit (Component) | — | 2.3-UNIT-002 | DEV | Existing |
| 2.3-AC2 | Success → toast "Cliente creado correctamente" + list invalidated | Unit (Application) | R-001 | 2.3-UNIT-003 | DEV | Existing |
| 2.4-AC4 | PUT with same NIT as current client → 200 (allowed) | API (Integration) | R-005 | 2.4-INT-003 | DEV | **NEW** |
| 2.4-AC1 | "Editar" dialog opens pre-filled with current values | Unit (Component) | — | 2.4-UNIT-001 | DEV | Existing |
| 2.4-AC5 | Cancel/X closes dialog without submitting or changing data | Unit (Component) | — | 2.4-UNIT-002 | DEV | Existing |
| 2.5-AC4 | DELETE client with contacts → 200 + `contactosDesasociados > 0`, contacts still exist with `clienteId = null` | API (Integration) | R-002, R-003 | 2.5-INT-002 | DEV | **NEW** |
| 2.5-AC1 | "Eliminar" opens confirmation dialog | Unit (Component) | — | 2.5-UNIT-001 | DEV | Existing |
| 2.5-AC3 | Cancel in confirmation dialog → client not deleted | Unit (Component) | — | 2.5-UNIT-002 | DEV | Existing |

**Total P1:** 14 tests (12 existing, 2 new)

**New P1 tests to implement:**
- `2.4-INT-003`: `PutCliente_WithSameNitAsCurrentClient_Returns200` — add to `ClienteEndpointsTests.cs`
- `2.5-INT-002`: `DeleteCliente_WithContacts_Returns200WithContactCount_ContactsBecomeUnassigned` — add to `ClienteEndpointsTests.cs`

---

### P2 (Medium) — Run nightly/weekly

**Criteria**: Edge cases, Zod schema validation boundaries, toast behavior, whitespace handling

| AC | Requirement | Test Level | Risk Link | Test ID | Owner | Status |
|----|-------------|------------|-----------|---------|-------|--------|
| 2.3-AC3 | Whitespace-only input in required field → validation error (Zod `trim + min(1)`) | Unit (Application) | R-004 | 2.3-UNIT-004 | DEV | **NEW** |
| 2.4-AC3 | Update form — clear required field → inline error, no backend call | Unit (Component) | R-004 | 2.4-UNIT-003 | DEV | Existing |
| 2.4-AC4 | 409 response sets error on NIT field "El NIT/RUC ya está registrado", dialog stays open | Unit (Component) | — | 2.4-UNIT-004 | DEV | Existing |
| 2.5-AC4 | Toast shows "Sus contactos asociados quedaron sin cliente asignado." when contactosDesasociados > 0 | Unit (Component) | R-003 | 2.5-UNIT-003 | DEV | **NEW** |
| 2.2-AC5 | ErrorPanel shown on non-404 backend error in detail view | Unit (Component) | — | 2.2-UNIT-004 | DEV | Existing |
| 2.4-AC2 | After successful edit, both `['clientes']` and `['clientes', id]` query keys are invalidated | Unit (Application) | R-001 | 2.4-UNIT-005 | DEV | Existing |
| 2.5-AC5 | DELETE non-existent client → 404 Problem Details | API (Integration) | — | 2.5-INT-003 | DEV | Existing |
| 2.4-AC2 | `UpdatedAt` is updated to a timestamp later than `CreatedAt` after PUT | API (Integration) | R-007 | 2.4-INT-004 | DEV | **NEW** |

**Total P2:** 8 tests (5 existing, 3 new)

**New P2 tests to implement:**
- `2.3-UNIT-004`: Whitespace-only value triggers Zod validation error — add to `ClienteFormDialog.test.tsx` or `useCreateCliente.test.ts`
- `2.5-UNIT-003`: Toast message with contacts count > 0 — add to `ClienteDeleteDialog.test.tsx`
- `2.4-INT-004`: `PutCliente_UpdatedAt_IsGreaterThanCreatedAt` — add to `ClienteEndpointsTests.cs`

---

### P3 (Low) — Run on-demand

**Criteria**: Performance validation, visual behavior, exploratory

| AC | Requirement | Test Level | Test ID | Owner | Status |
|----|-------------|------------|---------|-------|--------|
| 2.1-AC2 | Search with 500 mocked records completes in <1 second (NFR1) | Performance (Manual) | 2.1-PERF-001 | QA | Manual |
| 2.2-AC6 | "Volver" button navigates to `/clientes` from detail view | Unit (Component) | 2.2-UNIT-005 | DEV | Existing |
| 2.3-AC4 | 409 dialog remains open (not closed on error) | Unit (Component) | 2.3-UNIT-005 | DEV | Existing |

**Total P3:** 3 tests (2 existing, 1 manual)

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Verify CRUD API endpoints + basic list render

- [ ] 2.1-INT-001: GET /api/v1/clientes → 200 + `[]` (no clients)
- [ ] 2.1-INT-002: GET /api/v1/clientes → 200 + ClienteDto shape
- [ ] 2.3-INT-002: POST → 201 + Location header
- [ ] 2.2-INT-001: GET /api/v1/clientes/{id} → 200 + ClienteDto
- [ ] 2.4-INT-002: PUT → 200 + updated dto
- [ ] 2.5-INT-001: DELETE → 200 + `contactosDesasociados: 0`

**Total smoke:** 6 scenarios

### P0 Tests (<10 min)

**Purpose**: Core CRUD correctness + validation + search

- All 12 P0 scenarios listed above
- Frontend tests execute in Vitest (parallel) — <2 min
- Backend unit tests (all 14) — <1 min
- Backend integration tests (Testcontainers) — <10 min total (container startup + all tests)

### P1 Tests (<30 min)

**Purpose**: Edge cases + UX correctness + cascade behavior

- All 14 P1 scenarios
- 2 new integration tests added to `ClienteEndpointsTests.cs`

### P2/P3 Tests (<30 min)

**Purpose**: Validation boundaries + timestamp correctness + performance

- 8 P2 scenarios
- 3 P3 scenarios (1 manual performance test)

---

## Resource Estimates

### Test Development Effort

| Priority | New Tests | Hours/Test | Total Hours | Notes |
|----------|-----------|------------|-------------|-------|
| P0 | 0 | — | 0 | All existing |
| P1 | 2 | 1.5 | 3 | Testcontainers integration tests |
| P2 | 3 | 1.5 | 4.5 | Whitespace Zod, toast, UpdatedAt |
| P3 | 0 | — | 0 | Existing + manual |
| **Total** | **5** | — | **7.5** | **~1 day** |

### Prerequisites

**Test Data:**
- `ClienteEndpointsTests.cs` already uses Testcontainers + `MigrateAsync()` — new tests follow existing factory pattern
- Frontend tests use MSW + `vi.mock` — no additional setup needed

**Tooling:**
- xUnit + NSubstitute (backend unit) — already installed
- Testcontainers.PostgreSql 4.2.0 (backend integration) — already installed
- Vitest + MSW + @testing-library/react (frontend) — already installed
- Docker required for integration tests

**Environment:**
- Docker daemon running locally (Testcontainers)
- PostgreSQL port availability (Testcontainers auto-allocates)

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (12/12 must pass before any merge to main)
- **P1 pass rate**: ≥95% (13/14 minimum; single waiver allowed with owner sign-off)
- **P2/P3 pass rate**: ≥90% (informational)
- **High-risk mitigations**: N/A (no score ≥6 risks)

### Coverage Targets

- **CRUD happy paths**: 100% (create, read, update, delete all covered at API level)
- **Error paths**: 100% — 404, 409, 422 all handled and tested
- **Validation**: 100% of required fields covered (Zod + FluentValidation)
- **Cascade behavior (DATA)**: 100% — contact SetNull on client delete tested
- **Business logic (BUS)**: ≥90% — toast differentiation, cancel behavior tested

### Non-Negotiable Requirements

- [ ] All P0 tests pass (12/12)
- [ ] NIT uniqueness enforced at both app and DB level (R-005 boundary tested)
- [ ] Contact SetNull cascade validated end-to-end (R-002 verified)
- [ ] No stack traces in any error response (inherited from Epic 1 middleware)
- [ ] Client-side validation (Zod) prevents empty/whitespace data reaching backend (R-004)

---

## Mitigation Plans

### R-001: TanStack Query Cache Invalidation (Score: 4)

**Mitigation Strategy:** Ensure `useCreateCliente`, `useUpdateCliente`, `useDeleteCliente` hooks all invalidate `['clientes']`. Edit also invalidates `['clientes', id]`. Existing MSW-based tests verify query invalidation is called. Review existing `useUpdateCliente.test.ts` to confirm both keys are asserted.

**Owner:** DEV
**Timeline:** Before Story 2.2 review approval
**Status:** Planned (review existing tests)
**Verification:** `useUpdateCliente.test.ts` asserts `invalidateQueries` called with `['clientes']` AND `['clientes', id]`

---

### R-002: Contact Cascade SetNull (Score: 3)

**Mitigation Strategy:** Add integration test `2.5-INT-002` that:
1. Creates a client
2. Creates a contact assigned to that client
3. Deletes the client
4. Verifies the contact still exists via `GET /api/v1/contactos/:id`
5. Verifies contact's `clienteId` is `null`
6. Verifies response body has `contactosDesasociados: 1`

**Owner:** DEV
**Timeline:** Before Epic 2 review sign-off
**Status:** Planned
**Verification:** `2.5-INT-002` passes

---

### R-003: Delete Toast Message Accuracy (Score: 4)

**Mitigation Strategy:** Add unit test `2.5-UNIT-003` verifying that when `useDeleteCliente` receives `contactosDesasociados: 1`, the toast message includes "sus contactos asociados quedaron sin cliente asignado". The count → message logic must be explicitly tested, not just the success path.

**Owner:** DEV
**Timeline:** Before Epic 2 review sign-off
**Status:** Planned
**Verification:** `2.5-UNIT-003` passes

---

### R-004: Zod Validation Gaps (Score: 4)

**Mitigation Strategy:** Add `2.3-UNIT-004` testing whitespace-only string in each of the 4 required fields. Confirm Zod schema uses `.trim().min(1, 'Este campo es requerido')` (not just `.min(1)`). If not, update schema.

**Owner:** DEV
**Timeline:** Before Story 2.3 is marked done
**Status:** Planned (audit schema first)
**Verification:** `2.3-UNIT-004` passes; form shows error for `"   "` input

---

### R-005: Same-NIT Update Boundary (Score: 4)

**Mitigation Strategy:** Add `2.4-INT-003` to `ClienteEndpointsTests.cs`:
1. Create client A with NIT "900-001"
2. PUT client A with same NIT "900-001" → should return 200 (not 409)

This validates the handler's exclusion condition: `c.Nit == command.Nit && c.Id != command.Id`.

**Owner:** DEV
**Timeline:** Before Epic 2 review sign-off
**Status:** Planned
**Verification:** `2.4-INT-003` passes

---

## Assumptions and Dependencies

### Assumptions

1. Story 2.2 implementation is complete — in `review` means code is written but PR may be pending
2. Testcontainers tests already cover GET/POST/PUT/DELETE for the happy paths; new tests extend the existing class
3. FluentValidation 422 responses are handled as "validation error" in the frontend (not just generic error)
4. `ContactoConfiguration` has `OnDelete(DeleteBehavior.SetNull)` — verified in Story 2.5 Dev Notes
5. Toast infrastructure (`@/shared/lib/toast` + `<ToastContainer>`) is wired in `main.tsx`

### Dependencies

1. Story 2.2 review approval — needed before Epic 2 test design is considered complete
2. Docker daemon — required for Testcontainers integration tests (2.4-INT-003, 2.4-INT-004, 2.5-INT-002)
3. ContactoRepository + ContactoEntity must exist (for R-002 cascade test) — confirmed in Epic 3 but needed for `2.5-INT-002`

### Risks to Plan

- **Risk**: `2.5-INT-002` requires a contacto to be created, which implies knowing the contacto creation endpoint (from Epic 3)
  - **Impact**: Test may be deferred until Epic 3 is merged
  - **Contingency**: Insert contact directly via `AppDbContext` in the test setup (bypass API) — same pattern as other Testcontainers tests

---

## Follow-on Workflows (Manual)

- Run `*atdd` to generate failing P0 tests for Epic 3 stories (separate workflow)
- Run `*automate` for Playwright E2E coverage once all epics are complete (full user journey: create client → search → open detail → edit → delete)

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: — Date: —
- [ ] Tech Lead: — Date: —
- [ ] QA Lead: — Date: —

---

## Appendix

### Knowledge Base References

- `risk-governance.md` — Risk classification, gate decision engine
- `probability-impact.md` — Probability × Impact matrix
- `test-levels-framework.md` — E2E vs API vs Component decision framework
- `test-priorities-matrix.md` — P0–P3 prioritization rules

### FRs Covered in This Epic

| FR | Description | Story | Test Coverage |
|----|-------------|-------|---------------|
| FR1 | Register client with Nombre, NIT/RUC, Teléfono, Ciudad | 2.3 | P0 (2.3-INT-002) |
| FR2 | Search clients by name | 2.1 | P0 (2.1-UNIT-001) |
| FR3 | Search clients by NIT/RUC | 2.1 | P0 (2.1-UNIT-002) |
| FR4 | View client list | 2.1 | P0 (2.1-INT-001) |
| FR5 | View client detail | 2.2 | P1 (2.2-UNIT-001) |
| FR6 | Edit client fields | 2.4 | P0 (2.4-INT-002) |
| FR7 | Delete client | 2.5 | P0 (2.5-INT-001) |
| FR8 | Required field validation | 2.3, 2.4 | P0 (2.3-UNIT-001) |
| FR27 | Changes reflected immediately for all users | 2.3, 2.4, 2.5 | P1 (cache invalidation) |
| FR25 | Orphaned contacts after client delete | 2.5 | P1 (2.5-INT-002 NEW) |

### Related Documents

- Epic: `_bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md`
- Stories: `_bmad-output/implementation-artifacts/2-*.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- PRD NFRs: `_bmad-output/planning-artifacts/prd/non-functional-requirements.md`

### New Test File Locations

| Test file | Type | Tests | Priority |
|-----------|------|-------|----------|
| `ClienteEndpointsTests.cs` (extend) | Integration | +3 new | P1 + P2 |
| `ClienteFormDialog.test.tsx` or `CreateClienteCommand` (extend) | Unit | +1 new | P2 |
| `ClienteDeleteDialog.test.tsx` (extend) | Unit | +1 new | P2 |

---

**Generated by**: BMad TEA Agent — Test Architect Module
**Workflow**: `_bmad/bmm/testarch/test-design`
**Version**: 4.0 (BMad v6)
