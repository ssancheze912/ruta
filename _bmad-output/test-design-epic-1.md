# Test Design: Epic 1 - Project Foundation & Application Shell

**Date:** 2026-04-08
**Author:** SiesaTeam
**Status:** Draft
**Epic:** 1 — Project Foundation & Application Shell
**Stories covered:** 1.1 (Project Init), 1.2 (Frontend Nav Shell), 1.3 (Backend DB Foundation)

---

## Executive Summary

**Scope:** Full test design for Epic 1 — foundational infrastructure covering frontend project setup, SPA navigation shell, and backend database layer.

**Risk Summary:**

- Total risks identified: 7
- High-priority risks (≥6): 0
- Medium risks (3–5): 4
- Low risks (1–2): 3
- Critical categories: TECH, SEC, BUS, OPS

**Coverage Summary:**

- P0 scenarios: 5 (10 hours)
- P1 scenarios: 6 (6 hours)
- P2 scenarios: 5 (2.5 hours)
- P3 scenarios: 2 (0.5 hours)
- **Total effort:** 19 hours (~2.5 days)

**Existing test coverage (do not re-implement):**

| File | Tests | Stories covered |
|------|-------|-----------------|
| `ExceptionHandlingMiddlewareTests.cs` | 2 | 1.1 AC5 |
| `ExceptionHandlingMiddlewareIntegrationTests.cs` | 2 | 1.1 AC5 (integration) |
| `AppDbContextRegistrationTests.cs` | 3 | 1.3 AC1, AC3 |
| `navigation.test.tsx` | 6 | 1.2 AC1–AC6 |
| **Total existing** | **13** | |

---

## Risk Assessment

### Medium-Priority Risks (Score 3–4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|------------|-------|
| R-001 | TECH | CORS preflight (OPTIONS) requests not explicitly validated — `AllowAnyMethod()` configured but not integration-tested | 2 | 2 | 4 | Add integration test verifying OPTIONS returns correct CORS headers for all relevant methods | DEV |
| R-002 | SEC | Problem Details middleware catches only `Exception`; exception subtypes (e.g., `OperationCanceledException`) may produce different formats | 2 | 2 | 4 | Add unit tests for multiple exception types; verify consistent Problem Details shape | DEV |
| R-003 | BUS | Mobile NavigationBar active state may drift from NavigationRail state — two components both read `routerState` independently | 2 | 2 | 4 | Add component test explicitly verifying both nav components share same active state | DEV |
| R-004 | TECH | Deep linking (`/clientes`, `/contactos`) works in Vite dev server but may fail on server-less deployment (SPA historyApiFallback not verified) | 2 | 2 | 4 | Document server-side routing requirement; add E2E smoke test verifying direct URL access | QA |

### Low-Priority Risks (Score 1–2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
|---------|----------|-------------|-------------|--------|-------|--------|
| R-005 | DATA | `UseSnakeCaseNamingConvention()` applied at options level — not validated against actual DB column names in isolation | 1 | 2 | 2 | Monitor |
| R-006 | OPS | `AppDbContextFactory` has hardcoded default password `postgres` — risk of committing real credentials if developers forget | 2 | 1 | 2 | Verify `.gitignore` excludes `appsettings.Development.json`; code review convention |
| R-007 | TECH | TypeScript strict mode may accumulate type drift as dependencies update without `npm run build` enforcement in CI | 1 | 2 | 2 | Document: run `npm run build` in CI pipeline |

### Risk Category Legend

- **TECH**: Technical/Architecture (routing config, compiler flags)
- **SEC**: Security (error handling, no stack trace exposure)
- **BUS**: Business Impact (UX — mobile navigation correctness)
- **OPS**: Operations (secret management, design-time credentials)

---

## Test Coverage Plan

### P0 (Critical) — Run on every commit

**Criteria**: Blocks core infrastructure + covers foundation that all subsequent epics depend on

| AC | Requirement | Test Level | Risk Link | Test ID | Test Count | Owner | Notes |
|----|-------------|------------|-----------|---------|------------|-------|-------|
| 1.1-AC5 | Exception middleware returns Problem Details 500 with no stack trace | API (Integration) | R-002 | 1.1-INT-001 | 2 | DEV | **Existing** — `ExceptionHandlingMiddlewareTests.cs` |
| 1.1-AC5 | Exception middleware passes through successful requests unchanged | API (Integration) | R-002 | 1.1-INT-002 | 1 | DEV | **Existing** — passthrough test |
| 1.2-AC4 | Root `/` redirects to `/clientes` without leaving history entry | Unit (Component) | — | 1.2-UNIT-001 | 1 | DEV | **Existing** — `navigation.test.tsx` |
| 1.2-AC3 | `/clientes` deep link renders correct view | Unit (Component) | R-004 | 1.2-UNIT-002 | 1 | DEV | **Existing** — `navigation.test.tsx` |
| 1.2-AC3 | `/contactos` deep link renders correct view | Unit (Component) | R-004 | 1.2-UNIT-003 | 1 | DEV | **Existing** — `navigation.test.tsx` |

**Total P0:** 6 tests (5 existing, 0 new required) — **no new P0 tests needed**

> All P0 scenarios are already covered by existing tests. These must remain passing.

---

### P1 (High) — Run on PR to main

**Criteria**: Important behavioral correctness + medium-risk areas (R-001, R-002, R-003)

| AC | Requirement | Test Level | Risk Link | Test ID | Test Count | Owner | Notes |
|----|-------------|------------|-----------|---------|------------|-------|-------|
| 1.1-AC4 | CORS: OPTIONS preflight returns correct `Access-Control-Allow-Origin` for `localhost:5173` | API (Integration) | R-001 | 1.1-INT-003 | 1 | DEV | **NEW** — not yet tested |
| 1.1-AC4 | CORS: GET/POST/PUT/DELETE methods from `localhost:5173` are allowed | API (Integration) | R-001 | 1.1-INT-004 | 1 | DEV | **NEW** |
| 1.1-AC5 | Exception middleware: `ArgumentException` returns same Problem Details shape as generic Exception | Unit | R-002 | 1.1-UNIT-001 | 1 | DEV | **NEW** |
| 1.2-AC1 | NavigationRail desktop: Clientes and Contactos entries visible | Unit (Component) | — | 1.2-UNIT-004 | 1 | DEV | **Existing** — `navigation.test.tsx` |
| 1.2-AC2 | NavigationBar mobile: items visible and accessible (rendered in DOM) | Unit (Component) | R-003 | 1.2-UNIT-005 | 1 | DEV | **Existing** — `navigation.test.tsx` |
| 1.2-AC3 | Active nav item: correct item highlighted when navigating to `/clientes` vs `/contactos` | Unit (Component) | R-003 | 1.2-UNIT-006 | 1 | DEV | **Existing** — `navigation.test.tsx` |
| 1.2-AC5 | Unknown route renders NotFoundView with "Página no encontrada" + "Ir a Clientes" link | Unit (Component) | — | 1.2-UNIT-007 | 1 | DEV | **Existing** — `navigation.test.tsx` |
| 1.3-AC1 | DbContext resolves from DI container without errors | Integration | — | 1.3-INT-001 | 1 | DEV | **Existing** — `AppDbContextRegistrationTests.cs` |
| 1.3-AC3 | Snake_case naming: DbContext connection string references `siesa_agents_db` | Integration | R-005 | 1.3-INT-002 | 1 | DEV | **Existing** — `AppDbContextRegistrationTests.cs` |

**Total P1:** 9 tests (7 existing, 2 new required)

**New P1 tests to implement:**
- `1.1-INT-003`: CORS preflight OPTIONS test — add to `ExceptionHandlingMiddlewareIntegrationTests.cs` or new `CorsIntegrationTests.cs`
- `1.1-INT-004`: CORS method validation — same file
- `1.1-UNIT-001`: ArgumentException → Problem Details — add to `ExceptionHandlingMiddlewareTests.cs`

---

### P2 (Medium) — Run nightly/weekly

**Criteria**: Edge cases + secondary validation + operational correctness

| AC | Requirement | Test Level | Risk Link | Test ID | Test Count | Owner | Notes |
|----|-------------|------------|-----------|---------|------------|-------|-------|
| 1.1-AC2 | Scalar docs endpoint `/scalar` returns HTTP 200 | API (Integration) | — | 1.1-INT-005 | 1 | DEV | **NEW** |
| 1.1-AC5 | Exception middleware: `OperationCanceledException` returns 500 Problem Details (not 499) | Unit | R-002 | 1.1-UNIT-002 | 1 | DEV | **NEW** |
| 1.2-AC6 | `RouterProvider` and `QueryClientProvider` are present in rendered tree | Unit (Component) | — | 1.2-UNIT-008 | 1 | DEV | **NEW** — verify providers wrap app correctly |
| 1.3-AC3 | `UseSnakeCaseNamingConvention` applied: verify `__EFMigrationsHistory` table uses snake_case | Integration | R-005 | 1.3-INT-003 | 1 | DEV | **NEW** — actual DB query |
| 1.2-AC3 | Navigation between routes does not trigger full page reload | Unit (Component) | — | 1.2-UNIT-009 | 1 | DEV | **Existing** — `navigation.test.tsx` (navigation without reload) |

**Total P2:** 5 tests (1 existing, 4 new required)

---

### P3 (Low) — Run on-demand

**Criteria**: Sanity checks, cosmetic, exploratory

| AC | Requirement | Test Level | Test ID | Test Count | Owner | Notes |
|----|-------------|------------|---------|------------|-------|-------|
| 1.1-AC1 | Frontend TypeScript strict compilation: `npm run build` passes with 0 errors | Build | 1.1-BUILD-001 | 1 | DEV | Manual/CI gate verification |
| 1.1-AC3 | Backend solution: `dotnet build` succeeds with 0 errors | Build | 1.1-BUILD-002 | 1 | DEV | Manual/CI gate verification |

**Total P3:** 2 tests (build validations — enforced by CI, no automation needed)

---

## Execution Order

### Smoke Tests (<3 min)

**Purpose**: Catch infrastructure breakage immediately

- [ ] 1.1-INT-001: Exception middleware returns 500 Problem Details (no stack trace) (~30s)
- [ ] 1.2-UNIT-001: Root `/` redirects to `/clientes` (~5s)
- [ ] 1.2-UNIT-004: NavigationRail renders Clientes + Contactos (~5s)

**Total smoke:** 3 scenarios

### P0 Tests (<5 min)

**Purpose**: Foundation validation — must pass for all subsequent epics

- [ ] 1.1-INT-001: Exception middleware 500 + Problem Details
- [ ] 1.1-INT-002: Exception middleware passthrough for success
- [ ] 1.2-UNIT-001: Root redirect → /clientes (replace)
- [ ] 1.2-UNIT-002: Deep link /clientes renders ClientesView
- [ ] 1.2-UNIT-003: Deep link /contactos renders ContactosView

**Total P0:** 5 scenarios

### P1 Tests (<15 min)

**Purpose**: Core correctness coverage

- [ ] 1.1-INT-003: CORS preflight OPTIONS allowed
- [ ] 1.1-INT-004: CORS methods GET/POST/PUT/DELETE allowed
- [ ] 1.1-UNIT-001: ArgumentException → Problem Details (not leaked)
- [ ] 1.2-UNIT-004: Desktop NavigationRail visible
- [ ] 1.2-UNIT-005: Mobile NavigationBar accessible
- [ ] 1.2-UNIT-006: Active nav item highlighted
- [ ] 1.2-UNIT-007: Unknown route → NotFoundView
- [ ] 1.3-INT-001: DbContext DI resolution
- [ ] 1.3-INT-002: DbContext points to siesa_agents_db

**Total P1:** 9 scenarios

### P2/P3 Tests (<30 min)

**Purpose**: Edge cases + build verification

- [ ] 1.1-INT-005: Scalar docs HTTP 200
- [ ] 1.1-UNIT-002: OperationCanceledException → Problem Details
- [ ] 1.2-UNIT-008: Provider tree verification
- [ ] 1.2-UNIT-009: No full page reload on navigation
- [ ] 1.3-INT-003: Snake_case column convention (actual DB)
- [ ] 1.1-BUILD-001: `npm run build` 0 errors
- [ ] 1.1-BUILD-002: `dotnet build` 0 errors

**Total P2/P3:** 7 scenarios

---

## Resource Estimates

### Test Development Effort

| Priority | New Tests | Hours/Test | Total Hours | Notes |
|----------|-----------|------------|-------------|-------|
| P0 | 0 | — | 0 | All existing — verify pass |
| P1 | 3 | 1.5 | 4.5 | CORS integration tests + exception subtype |
| P2 | 4 | 1.0 | 4.0 | Scalar check, provider tree, DB snake_case |
| P3 | 0 | — | 0 | Build gates (CI enforced) |
| **Total** | **7** | — | **8.5** | **~1 day** |

### Already Covered (13 existing tests)

Existing tests are COMPLETE and PASSING per Dev Agent Record. No re-implementation.

### Prerequisites

**Test Data:**
- No test data factories needed for Epic 1 (infrastructure setup, no domain entities)
- `IDesignTimeDbContextFactory<AppDbContext>` used for design-time tests

**Tooling:**
- xUnit for backend unit/integration tests (already configured)
- Vitest + @testing-library/react for frontend component tests (already configured)
- `WebApplicationFactory<Program>` or `HttpClient` for CORS integration tests
- Optional: Testcontainers for P2 snake_case DB column validation

**Environment:**
- PostgreSQL running locally for P2 snake_case test (or Testcontainers)
- No external services required for P0/P1

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions — all 6 scenarios must pass before merging)
- **P1 pass rate**: ≥95% (7 existing + 2 new must pass; single waiver allowed with owner)
- **P2/P3 pass rate**: ≥90% (informational)
- **High-risk mitigations**: N/A (no score ≥6 risks in Epic 1)

### Coverage Targets

- **Core navigation paths**: 100% (existing navigation tests)
- **Error handling (SEC)**: 100% (exception middleware scenarios)
- **CORS boundary**: 100% of configured origins + methods
- **DB setup**: ≥80% of AC coverage (DI + naming convention)

### Non-Negotiable Requirements

- [ ] All P0 tests pass (6/6)
- [ ] No stack traces in exception middleware response (Security requirement)
- [ ] CORS tests pass for `localhost:5173` origin
- [ ] Navigation tests pass (foundation for Epic 2+ stories)

---

## Mitigation Plans

### R-001: CORS Preflight Not Integration-Tested (Score: 4)

**Mitigation Strategy:** Add `CorsIntegrationTests.cs` (or extend existing middleware integration test file) with:
1. OPTIONS request to any endpoint → verify `Access-Control-Allow-Origin: http://localhost:5173`
2. GET/POST with `Origin: http://localhost:5173` header → verify allowed

**Owner:** DEV
**Timeline:** Before Epic 2 first story (next sprint)
**Status:** Planned
**Verification:** 1.1-INT-003 and 1.1-INT-004 pass

---

### R-002: Exception Subtypes Not Tested (Score: 4)

**Mitigation Strategy:** Extend `ExceptionHandlingMiddlewareTests.cs` with additional exception types (`ArgumentException`, `OperationCanceledException`) to confirm consistent Problem Details shape.

**Owner:** DEV
**Timeline:** Before Epic 2 first story
**Status:** Planned
**Verification:** 1.1-UNIT-001, 1.1-UNIT-002 pass

---

### R-003: Mobile NavigationBar Active State (Score: 4)

**Mitigation Strategy:** The existing `navigation.test.tsx` uses `getAllByRole` (not `getByRole`) because both desktop and mobile nav render the same items. Verify that the active state check covers both components in the test assertions.

**Owner:** DEV
**Timeline:** Review existing test — if not explicitly asserting both components, add assertion
**Status:** Planned (review existing test first)
**Verification:** 1.2-UNIT-005 verifies mobile nav items are in DOM; confirm active state is asserted

---

### R-004: Deep Linking on Production Server (Score: 4)

**Mitigation Strategy:** Document requirement for server-side SPA fallback configuration. Add note in architecture docs: any deployment (even dev nginx) must serve `index.html` for all SPA routes. Add smoke test (1.2-UNIT-002/003) to confirm behavior.

**Owner:** QA + OPS
**Timeline:** Before any deployment
**Status:** Documented (existing tests cover dev environment behavior)
**Verification:** 1.2-UNIT-002, 1.2-UNIT-003

---

## Assumptions and Dependencies

### Assumptions

1. Stories 1.1, 1.2, 1.3 are all in **done** status — implementation is complete
2. Existing 13 tests are currently passing (per Dev Agent Records)
3. `AppDbContextFactory` with hardcoded `postgres:postgres` credentials is intentional and acceptable for local development only
4. No E2E (browser-based Playwright) tests are required for Epic 1 foundation — component + integration tests are sufficient for this scope
5. TypeScript strict mode is enforced by `npm run build` — no additional tooling needed

### Dependencies

1. PostgreSQL running locally — required by P2 test `1.3-INT-003` (snake_case column validation)
2. .NET 10 SDK — required by all backend test runners
3. Node.js 22+ — required by frontend test runner (Vitest)

### Risks to Plan

- **Risk**: P2 snake_case test (`1.3-INT-003`) requires real DB connection
  - **Impact**: Test may be environment-dependent; fails in CI without PostgreSQL
  - **Contingency**: Use Testcontainers (`Npgsql.TestContainers`) or mark as manual-only

---

## Follow-on Workflows (Manual)

- Run `*atdd` to generate failing P0 tests for new stories in Epic 2 (separate workflow; not auto-run)
- Run `*automate` for broader E2E coverage once Epic 2 frontend implementation exists (Playwright)

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: — Date: —
- [ ] Tech Lead: — Date: —
- [ ] QA Lead: — Date: —

---

## Appendix

### Knowledge Base References

- `risk-governance.md` — Risk classification framework (6 categories), gate decision engine
- `probability-impact.md` — Risk scoring methodology (probability × impact matrix)
- `test-levels-framework.md` — E2E vs API vs Component vs Unit decision framework
- `test-priorities-matrix.md` — P0–P3 automated priority calculation

### Related Documents

- Epic: `_bmad-output/planning-artifacts/epics/epic-01-foundation.md`
- Stories: `_bmad-output/implementation-artifacts/1-1-*.md`, `1-2-*.md`, `1-3-*.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- PRD NFRs: `_bmad-output/planning-artifacts/prd/non-functional-requirements.md`

### Test File Locations

| Test file | Framework | Tests | Status |
|-----------|-----------|-------|--------|
| `backend/tests/SiesaAgents.UnitTests/...ExceptionHandlingMiddlewareTests.cs` | xUnit | 2 | Existing |
| `backend/tests/SiesaAgents.IntegrationTests/API/Middleware/ExceptionHandlingMiddlewareIntegrationTests.cs` | xUnit | 2 | Existing |
| `backend/tests/SiesaAgents.IntegrationTests/Infrastructure/Data/AppDbContextRegistrationTests.cs` | xUnit | 3 | Existing |
| `frontend/src/routes/__tests__/navigation.test.tsx` | Vitest + RTL | 6 | Existing |
| `backend/tests/SiesaAgents.IntegrationTests/API/CorsIntegrationTests.cs` | xUnit | 2 | **NEW — to create** |
| `backend/tests/SiesaAgents.UnitTests/API/Middleware/ExceptionHandlingMiddlewareTests.cs` (extend) | xUnit | +2 | **NEW — extend** |

---

**Generated by**: BMad TEA Agent — Test Architect Module
**Workflow**: `_bmad/bmm/testarch/test-design`
**Version**: 4.0 (BMad v6)
