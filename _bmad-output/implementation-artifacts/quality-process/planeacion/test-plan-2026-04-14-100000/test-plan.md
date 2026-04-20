---
workflow: quality-process
phase: planeacion
version: 1.0.0
methodology: BMAD v3.0 Spec-Driven Quality
generated_date: 2026-04-14T10:00:00Z
project_name: Siesa-Agents
source_documents:
  prd: _bmad-output/planning-artifacts/prd/ (14 files)
  architecture: _bmad-output/planning-artifacts/architecture.md
  epics:
    - _bmad-output/planning-artifacts/epics/epic-01-foundation.md
    - _bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md
    - _bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md
    - _bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md
  regulatory: null
  ux_design: _bmad-output/planning-artifacts/ux-design-specification.md
---

# QA Test Plan & Strategy — Siesa-Agents

---

## SECTION 1 — GENERAL INFORMATION

```
Project:              Siesa-Agents
Module/Domain:        CRM — Client & Contact Management (Full MVP)
Sprint / Cycle:       Sprint 1–4 (Full Product MVP)
Plan Date:            2026-04-14
Author:               SiesaTeam — AI-assisted (BMAD v3.0)
Stack:
  Backend:            .NET 10 · C# Minimal API · EF Core 10 · FluentValidation · xUnit
                      · PostgreSQL 18+ · Npgsql · Scalar API docs
  Frontend:           Vite 7 · React 18 · TypeScript strict · TanStack Router · TanStack Query 5
                      · Zustand 5 · React Hook Form · Zod · Axios · siesa-ui-kit · shadcn/ui
                      · Vitest · @testing-library/react · MSW
  Architecture:       Clean Architecture + DDD (both frontend and backend)
  CI/CD:              GitHub Actions, GitFlow
  Error Format:       Problem Details RFC 7807 (backend)
  API Docs:           Scalar (never Swagger)
```

---

## SECTION 2 — OBJECTIVES & DoR / DoD

### 2.1 Business Objectives

- **OBJ-01:** Deliver a functional, zero-training CRM that enables commercial teams to register, search, and manage clients and contacts from any device (desktop + mobile 375px+).
- **OBJ-02:** Ensure the bidirectional Client ↔ Contact relationship is navigable in both directions with no context loss, satisfying the core UX differentiator.
- **OBJ-03:** Protect data integrity for the cascade deletion rule: deleting a client must set `contacto.clienteId = null` for all linked contacts without data loss.
- **OBJ-04:** Guarantee real-time data visibility across all users (FR27) via correct TanStack Query key invalidation after every mutation.
- **OBJ-05:** Meet all NFR thresholds: search < 1s with 500/1,000 records (NFR1), CRUD UI update < 2s (NFR2), no stack traces exposed to users (NFR6).

### 2.2 Quality Criteria

| Criterion | Target |
|-----------|--------|
| Backend unit test coverage | ≥ 80% |
| Frontend unit test coverage | ≥ 75% |
| Backend integration test coverage | ≥ 70% |
| P1 defects in production | 0 |
| Search response time (NFR1) | < 1s at 500 clients / 1,000 contacts |
| CRUD UI update time (NFR2) | < 2s under normal conditions |
| Concurrent users (NFR3) | 10 simultaneous users without degradation |
| Problem Details RFC 7807 compliance | 100% of error responses |
| NIT/RUC uniqueness enforcement | 100% (no duplicates created) |
| Cascade deletion correctness | 100% (contacts become `clienteId = null`) |

### 2.3 DoR — Definition of Ready Checklist

> ✅ = Meets | ⚠️ = Partial (indicate what is missing) | ❌ = Blocks QA start

- [ ] All user stories have defined and reviewed acceptance criteria
- [ ] Architecture document approved (`architecture.md`)
- [ ] REST endpoints documented in Scalar (`/scalar` route on backend)
- [ ] Test data identified and available in QA environment (seeds)
- [ ] EF Core migrations applied in QA environment (`dotnet ef database update`)
- [ ] CORS configured for `localhost:5173` in development
- [ ] `ApplySnakeCaseNaming()` verified active in `OnModelCreating`
- [ ] All unique indexes created: `uk_clientes_nit`, `ix_contactos_cliente_id`, `ix_contactos_email`
- [ ] `ON DELETE SET NULL` FK constraint verified: `fk_contactos_clientes`
- [ ] Frontend builds without TypeScript strict mode errors (`npm run build`)
- [ ] siesa-ui-kit components confirmed available: NavigationRail, NavigationBar, ContactManager, EmptyState, ErrorPanel
- [ ] Preliminary AI analysis executed (BMAD)

> ⚠️ **Note:** No RBAC (authentication not in MVP — explicit PRD decision). Skip all RBAC-related DoR items.

### 2.4 DoD — Definition of Done Checklist

- [ ] Code implemented with approved code review
- [ ] Unit tests ≥ 80% backend / ≥ 75% frontend — all passing
- [ ] Integration tests (EF Core + real PostgreSQL) passing
- [ ] Zero open P1/blocking defects
- [ ] All REST endpoints documented in Scalar
- [ ] CI/CD pipeline green on `develop`
- [ ] Functional validation in QA environment completed
- [ ] NFR thresholds verified: search < 1s, CRUD < 2s
- [ ] Cascade deletion validated: client delete → contacts unassigned (`clienteId = null`)
- [ ] TanStack Query cache invalidation validated for all mutation paths
- [ ] All user-facing text in Spanish (labels, toasts, errors, ARIA labels)
- [ ] No stack traces returned by backend (Problem Details only)
- [ ] Post-sprint AI analysis executed (BMAD)

---

## SECTION 3 — TEST SCOPE

> All 4 features and 19 user stories from `feature-status.yaml` are included. No exclusions.

### 3.1 Features Included

| # | Feature | Epic | Stories | Domain | Mutability | Risk Level | QA Priority |
|---|---------|------|---------|--------|------------|------------|-------------|
| F1 | Project Foundation & Application Shell | Epic 1 | 1.1, 1.2, 1.3 | Infrastructure + Navigation | High (foundational) | Medium | P2 |
| F2 | Client Management | Epic 2 | 2.1–2.5 | CRUD + Search | High (core entity) | High | P1 |
| F3 | Contact Management | Epic 3 | 3.1–3.5 | CRUD + Search | High (core entity) | High | P1 |
| F4 | Client-Contact Association & Data Quality | Epic 4 | 4.1–4.6 | Relationship + Data Quality | Very High (cross-domain) | Critical | P0 |

### 3.2 Out-of-Scope (MVP)

| Item | Reason |
|------|--------|
| Authentication / JWT | Explicit PRD decision — not in MVP |
| Role-based access control (RBAC) | Not in MVP |
| Server-side pagination | Post-MVP — dataset fits in memory |
| Redis caching | Post-MVP |
| CI/CD pipeline tests | Post-MVP |
| Docker production deployment | Production only — out of dev scope |
| `feature-payment-service` | Present in PRD folder but not in `feature-status.yaml` — not in current sprint |

---

## SECTION 4 — TEST STRATEGY

### 4.1 Test Types

| Type | Scope | Coverage Target | Automation |
|------|-------|-----------------|------------|
| Backend Unit | Validators (FluentValidation), Command Handlers, Domain logic | ≥ 80% | 100% |
| Frontend Unit | Hooks (TanStack Query), Zustand stores, presentational components | ≥ 75% | 100% (Vitest + RTL) |
| Backend Integration | EF Core repos, Minimal API endpoints, migrations, FK cascade | ≥ 70% | 100% (real PostgreSQL) |
| Frontend Integration | Axios calls, TanStack Query mutation/invalidation cycle, MSW | ≥ 60% | 100% (MSW mocks) |
| Contract Tests | Request/response shape — all 11 REST endpoints | 100% endpoints | 100% |
| Cascade Deletion Tests | Client delete → contacto.clienteId = null for all linked contacts | 100% | 100% |
| Query Invalidation Tests | Every mutation invalidates correct TanStack Query keys | 100% mutations | 100% |
| Smoke Tests | Critical endpoints post-deploy: GET /clientes, GET /contactos, POST /clientes | 100% critical | 100% |
| Performance Tests | Search endpoints with 500 clients / 1,000 contacts (NFR1, NFR2) | P95 < 1s | Semi-auto |
| Exploratory Tests | F4 complex flows: reassignment, orphan detection, bidirectional navigation | F1 + F4 flows | Manual |

> **No RBAC/Security SAST tests** in this plan — authentication is not in MVP scope.

### 4.2 Test Design Techniques

| Technique | Target Features | Notes |
|-----------|----------------|-------|
| Equivalence Partitioning | F2, F3 — form fields (Nombre, NIT/RUC, Email, Teléfono) | Valid/invalid/boundary classes |
| Boundary Value Analysis | F2 — NIT/RUC uniqueness; F3 — Email format; NFR1 — 500/1,000 records | Edge of acceptance ranges |
| Decision Table | F4 — Association state machine: unassigned → assigned → reassigned → disassociated | All state transitions |
| State Transition | F4 — contacto.clienteId: null → uuid → different uuid → null | Model all state changes |
| Error Guessing | All — empty submissions, concurrent PUTs, network failure during mutation, stale cache | Race conditions, cache staleness, cascade edge cases |
| Exploratory / Session-Based | F4 — bidirectional navigation sessions, orphan filter accuracy | Persona: Carlos (speed), Marcela (data quality) |

### 4.3 Human–AI Integration (BMAD)

**AI usage level for this sprint:**

| Level | % Ref | Applies | Justification | Validation Owner |
|-------|-------|---------|---------------|-----------------|
| Manual | 0% | ❌ | Not applicable for this MVP | — |
| AI-Assisted | 30% | ❌ | Below team capability | — |
| AI Design validated by QA | 60% | ✅ | BMAD generates design + QA validates content | QA Lead |
| AI + Predictive Analysis | 90% | ✅ | Applied to F4 (cascade, cache invalidation) | QA Architect |

**BMAD agents activated:**

| AI Agent | Activated | Phase | Impact | Notes |
|----------|-----------|-------|--------|-------|
| Functional Analyzer | ✅ | Pre-build | FR1–FR30 coverage mapping | All 30 FRs analyzed |
| Test Case Generator | ✅ | Pre-build | F2–F4 scenario generation | Positive, negative, boundary |
| Predictive Risk Analyzer | ✅ | Pre-build | R-F2-02, R-F4-02 identified | Critical cascade + cache risks |
| Data Validator (Alquimista) | ✅ | Execution | Data Buckets F2–F4 | See Section 5.2 |
| Intelligent Explorer | ✅ | Execution | F4 complex association flows | Carlos + Marcela personas |
| Defect Classifier | ✅ | Execution | Cascade bugs, stale cache, form validation | Taxonomy pre-loaded |
| Post-Sprint Analyzer | ⬜ | Post-sprint | Sprint closure metrics | Activate at sprint end |

---

## SECTION 5 — ENVIRONMENT & TEST DATA

### 5.1 Sprint Environment

| Environment | Required State | Owner | Notes |
|-------------|---------------|-------|-------|
| LOCAL (dev) | Both servers running — frontend :5173, backend :5000 | Developer | `npm run dev` + `dotnet run` |
| QA | PostgreSQL `siesa_agents_db` initialized, seeds loaded, both services healthy | Dev + QA | `dotnet ef database update` + seed scripts |
| STAGING | Both services deployed, smoke tests passing | DevOps | Pre-release validation |

### 5.2 Data Buckets per Feature (Alquimista Agent)

---

#### F1 — Foundation

| Bucket | Description | Data / Example Values |
|--------|-------------|----------------------|
| `F1-CORS-VALID` | Valid CORS request from frontend | Origin: `http://localhost:5173`, Method: GET |
| `F1-CORS-INVALID` | Blocked CORS from unauthorized origin | Origin: `http://attacker.com` → expect CORS block |
| `F1-MIGRATION` | Fresh DB migration run | Empty `siesa_agents_db` → `dotnet ef database update` succeeds |
| `F1-NAV-DEEPLINK` | Direct URL navigation | `/clientes`, `/contactos` → each renders correct view |
| `F1-ROUTE-404` | Unknown route | `/unknown-path` → renders 404 view |
| `F1-PROBLEM-DETAILS` | Unhandled backend exception | Trigger domain error → verify RFC 7807 response shape: `{status, title, detail}` |

---

#### F2 — Client Management

| Bucket | Description | Data / Example Values |
|--------|-------------|----------------------|
| `F2-CREATE-VALID` | Valid client creation | `{ nombre: "Empresa ABC S.A.S", nit: "900123456-7", telefono: "+57 300 1234567", ciudad: "Bogotá" }` |
| `F2-CREATE-DUP-NIT` | Duplicate NIT/RUC → 409 conflict | Same NIT as existing client → expect error "El NIT/RUC ya está registrado" |
| `F2-CREATE-MISSING-FIELDS` | Required fields empty | Submit with `nombre: ""` or `nit: ""` → form validation blocks submission |
| `F2-SEARCH-NAME` | Search by client name | Query partial name "Empresa" → returns matching clients |
| `F2-SEARCH-NIT` | Search by NIT/RUC | Query "900123" → returns matching clients |
| `F2-SEARCH-500` | Performance: 500 records | Seed 500 clients, search "a" → results in < 1s (NFR1) |
| `F2-SEARCH-EMPTY` | Search yields no results | Query non-existent name → EmptyState displayed |
| `F2-EDIT-VALID` | Edit all fields and save | Change `ciudad: "Medellín"` → update reflected immediately |
| `F2-EDIT-CLEAR-REQUIRED` | Clear required field during edit | Clear `nombre` → inline error, no backend call |
| `F2-DELETE-NO-CONTACTS` | Delete client with no linked contacts | Client removed, list updates, toast shown |
| `F2-DELETE-WITH-CONTACTS` | **CRITICAL** Delete client with linked contacts | Client deleted → linked contacts become `clienteId = null` → toast includes "Sus contactos asociados quedaron sin cliente asignado" |
| `F2-DELETE-CANCEL` | Cancel delete dialog | Dialog closes, client record unchanged |
| `F2-BACKEND-DOWN` | Backend unavailable on load | GET /clientes fails → ErrorPanel with "Reintentar" shown |
| `F2-DEEPLINK-INVALID-ID` | Direct URL with non-existent clienteId | `/clientes/non-existent-uuid` → not-found message |

---

#### F3 — Contact Management

| Bucket | Description | Data / Example Values |
|--------|-------------|----------------------|
| `F3-CREATE-VALID` | Valid contact creation | `{ nombre: "Juan Pérez", cargo: "Gerente Comercial", telefono: "+57 315 9876543", email: "juan.perez@empresa.com" }` |
| `F3-CREATE-MISSING-FIELDS` | Required fields empty | Submit with `email: ""` → form validation blocks submission |
| `F3-SEARCH-NAME` | Search by contact name | Query "Juan" → matching contacts filtered |
| `F3-SEARCH-EMAIL` | Search by email | Query "@empresa.com" → matching contacts |
| `F3-SEARCH-1000` | Performance: 1,000 records | Seed 1,000 contacts, search → results in < 1s (NFR1) |
| `F3-EDIT-VALID` | Edit contact fields | Change `cargo: "Director"` → reflected immediately |
| `F3-DELETE-WITH-CLIENT` | Delete contact assigned to client | Contact removed, no client data affected |
| `F3-DELETE-ORPHAN` | Delete contact without client | Contact removed from list |
| `F3-BACKEND-DOWN` | Backend unavailable on load | GET /contactos fails → ErrorPanel shown |

---

#### F4 — Client-Contact Association & Data Quality

| Bucket | Description | Data / Example Values |
|--------|-------------|----------------------|
| `F4-ASSOC-VALID` | Associate existing contact to client | PUT `/api/v1/contactos/{id}/cliente` `{ clienteId: uuid }` → contact appears in ContactManager immediately |
| `F4-ASSOC-FROM-CREATE` | Create new contact from ContactManager | New contact auto-linked to active clienteId |
| `F4-DISASSOC-VALID` | Disassociate contact from client | PUT with `{ clienteId: null }` → contact removed from ContactManager, still in `/contactos` |
| `F4-REASSIGN-VALID` | Reassign contact to different client | Contact appears in new client's ContactManager, removed from previous |
| `F4-REASSIGN-CANCEL` | Cancel reassignment | Association unchanged |
| `F4-REASSIGN-STALE-CACHE` | **CRITICAL** Cache after reassignment | Verify `['contactos']`, `['contactos', { clienteId: oldId }]`, `['contactos', { clienteId: newId }]` all invalidated |
| `F4-NAV-CLIENT-TO-CONTACT` | Navigate client detail → contact detail | ≤ 2 clicks from client record (NFR8) |
| `F4-NAV-CONTACT-TO-CLIENT` | View client from contact detail | Client name visible without extra search (NFR9) |
| `F4-ORPHAN-FILTER-ACTIVE` | Filter contacts "Sin cliente" | Only contacts with `clienteId = null` shown, count visible |
| `F4-ORPHAN-FILTER-ALL-ASSIGNED` | Orphan filter with no orphans | EmptyState shown: all contacts assigned |
| `F4-ORPHAN-AFTER-CLIENT-DELETE` | **CRITICAL** Orphan appears after client deletion | After deleting client with contacts, those contacts appear in "Sin cliente" filter immediately |
| `F4-CONCURRENT-ASSOC` | Concurrent PUT on same contact | Two users reassign same contact simultaneously → last write wins, no data corruption |
| `F4-BACK-NAVIGATION` | Browser back after nav to contact | Returns to correct client detail |

---

## SECTION 6 — PREDICTIVE RISK MATRIX

### Evaluation Scale

| Value | Probability (P) | Impact (I) |
|-------|----------------|------------|
| 1 | Very low (< 5%) | Cosmetic |
| 2 | Low (5–15%) | Minor / workaround available |
| 3 | Medium (15–40%) | Moderate / degraded functionality |
| 4 | High (40–70%) | Major / blocked functionality |
| 5 | Very high (> 70%) | Critical / data loss or system down |

### Risk Matrix by Feature

| ID | Feature | Risk Identified | P | I | R=P×I | Level | Mitigation |
|----|---------|----------------|---|---|-------|-------|-----------|
| R-F1-01 | Foundation | CORS misconfiguration blocks frontend↔backend communication | 3 | 4 | 12 | 🟡 | Explicit CORS policy test (`F1-CORS-VALID`, `F1-CORS-INVALID`) |
| R-F1-02 | Foundation | EF Core snake_case mapping failure (column naming breaks queries) | 2 | 4 | 8 | 🟡 | Integration test verifying `ApplySnakeCaseNaming()` output against DB schema |
| R-F1-03 | Foundation | Problem Details middleware not catching all exception types | 2 | 4 | 8 | 🟡 | `F1-PROBLEM-DETAILS` test + middleware unit test |
| R-F1-04 | Foundation | Deep link routes returning 404/blank instead of correct view | 3 | 3 | 9 | 🟡 | `F1-NAV-DEEPLINK` test on all defined routes |
| R-F2-01 | Client Mgmt | NIT/RUC duplicate check: frontend shows wrong error or swallows 409 | 3 | 3 | 9 | 🟡 | `F2-CREATE-DUP-NIT` — verify UI error message matches spec |
| R-F2-02 | Client Mgmt | **Client deletion cascade: contacts NOT set to null (data integrity failure)** | 4 | 5 | **20** | 🔴 | `F2-DELETE-WITH-CONTACTS` + DB assertion that `contacto.cliente_id IS NULL` after deletion |
| R-F2-03 | Client Mgmt | Form allows submission with empty required fields (Zod bypass) | 2 | 4 | 8 | 🟡 | `F2-CREATE-MISSING-FIELDS`, `F2-EDIT-CLEAR-REQUIRED` — both client-side and server-side validation |
| R-F2-04 | Client Mgmt | Search performance degrades above 200 records (client-side filter) | 2 | 3 | 6 | 🟢 | `F2-SEARCH-500` performance benchmark |
| R-F3-01 | Contact Mgmt | Search performance degrades above 500 contacts | 3 | 3 | 9 | 🟡 | `F3-SEARCH-1000` performance benchmark |
| R-F3-02 | Contact Mgmt | Contact form accepts invalid email format | 3 | 3 | 9 | 🟡 | Zod email validation tests + `F3-CREATE-MISSING-FIELDS` |
| R-F3-03 | Contact Mgmt | Contact loses `clienteId` reference unexpectedly after edit | 2 | 4 | 8 | 🟡 | Integration test: edit contact fields, verify `clienteId` unchanged |
| R-F4-01 | Association | TanStack Query keys NOT invalidated after mutation — stale data shown to all users | 4 | 4 | **16** | 🔴 | `F4-REASSIGN-STALE-CACHE` — verify all 3 query keys invalidated; `F4-ASSOC-VALID` + `F4-DISASSOC-VALID` |
| R-F4-02 | Association | Orphan contacts NOT appearing in "Sin cliente" filter after client deletion | 3 | 4 | 12 | 🟡 | `F4-ORPHAN-AFTER-CLIENT-DELETE` — immediate filter update verified |
| R-F4-03 | Association | Race condition: two concurrent PUT to same contact's clienteId | 3 | 4 | 12 | 🟡 | `F4-CONCURRENT-ASSOC` — last-write-wins verified, no data corruption |
| R-F4-04 | Association | Bidirectional navigation loses browser history (back button broken) | 3 | 3 | 9 | 🟡 | `F4-BACK-NAVIGATION` exploratory test |
| R-F4-05 | Association | ContactManager uses wrong query keys — shows other client's contacts | 3 | 4 | 12 | 🟡 | `F4-ASSOC-VALID` with multiple clients active in parallel |

### Critical Risks Summary (R > 15)

| ID | Feature | Risk | R | Immediate Action |
|----|---------|------|---|-----------------|
| R-F2-02 | Client Management | Client deletion does NOT cascade `clienteId = null` to linked contacts | **20** 🔴 | Full cascade suite + DB-level assertion. Verify `ON DELETE SET NULL` FK + EF Core config. Blocks release. |
| R-F4-01 | Client-Contact Association | TanStack Query cache NOT invalidated after mutation — all users see stale data | **16** 🔴 | Cache invalidation integration tests for ALL mutation endpoints (associate, disassociate, reassign, delete client). Verify `queryClient.invalidateQueries` calls. Blocks release. |

> **Rule:** R > 15 → Full regression suite activated for affected feature + mandatory defect-free gate before release.

---

## SECTION 7 — ENTRY / EXIT CRITERIA

### 7.1 Entry Criteria — Sprint DoR Checklist

| # | Criterion | Owner | Status |
|---|-----------|-------|--------|
| CE-01 | Build on `develop` compiles without errors (both frontend and backend) | Dev Lead | ⬜ |
| CE-02 | Developer unit tests ≥ 80% (backend) / ≥ 75% (frontend) — all passing | Developer | ⬜ |
| CE-03 | All 11 REST endpoints documented in Scalar (`/scalar`) | Developer | ⬜ |
| CE-04 | EF Core migrations applied in QA environment | Dev + DevOps | ⬜ |
| CE-05 | Test data seeds available: min 10 clients, 20 contacts, mix of assigned/unassigned | QA + Dev | ⬜ |
| CE-06 | CORS policy verified: `localhost:5173` allowed, other origins blocked | Developer | ⬜ |
| CE-07 | QA environment health check: both services responding at `/scalar` and frontend root | DevOps | ⬜ |
| CE-08 | All user stories have reviewed acceptance criteria (Epic 1–4) | PO | ⬜ |
| CE-09 | `ON DELETE SET NULL` FK constraint present in migration for `fk_contactos_clientes` | Developer | ⬜ |
| CE-10 | Preliminary BMAD AI analysis executed (this document) | QA Lead | ✅ |

### 7.2 Exit Criteria — Sprint DoD Checklist (Go / No-Go)

**✅ GO — Approved for Release if:**
- All "Blocks = Yes" criteria below are met
- 0 P1 defects open
- P2 defects ≤ 2 with documented workaround and PO approval
- Smoke tests in STAGING passing at 100%
- Both critical risks (R-F2-02, R-F4-01) have their specific mitigation tests passing

**❌ NO-GO — Blocked if:**

| No-Go Condition | Required Action |
|----------------|----------------|
| R-F2-02 test failing: contacts NOT set to `clienteId = null` after client deletion | Hotfix + re-validation of EF cascade config |
| R-F4-01 test failing: stale data shown after any mutation | Fix TanStack Query invalidation + re-test all mutation paths |
| ≥ 1 P1 defect open | Immediate hotfix + re-validation |
| Backend coverage < 75% | Complete missing tests before release |
| Any Problem Details compliance test failing (stack trace exposed) | Fix global exception middleware |
| STAGING smoke tests < 100% | Diagnose and fix before deploy |
| `F2-DELETE-WITH-CONTACTS` DB assertion failing | FK cascade fix required |

### Exit Criteria per Feature

| # | Criterion | Target | Tolerance | Blocks Release |
|---|-----------|--------|-----------|---------------|
| CS-01 | Unit tests passing | 100% | 0 failures | Yes |
| CS-02 | Integration tests passing | 100% | 0 failures | Yes |
| CS-03 | Backend coverage | ≥ 80% | Min 75% | Yes (< 75%) |
| CS-04 | Frontend coverage | ≥ 75% | Min 70% | Yes (< 70%) |
| CS-05 | P1 defects open | 0 | 0 | Yes |
| CS-06 | P2 defects open | 0 | ≤ 2 with workaround | No (with PO approval) |
| CS-07 | Search P95 — client list (500 records) | < 1s | Max 1.5s | Yes (> 2s) |
| CS-08 | Search P95 — contact list (1,000 records) | < 1s | Max 1.5s | Yes (> 2s) |
| CS-09 | CRUD mutation UI update time | < 2s | Max 3s | Yes (> 3s) |
| CS-10 | Cascade deletion: contacts unassigned after client delete | 100% | 0 failures | Yes |
| CS-11 | TanStack Query invalidation: all 3 keys invalidated after reassignment | 100% | 0 failures | Yes |
| CS-12 | Problem Details compliance: no stack traces in any error response | 100% | 0 violations | Yes |
| CS-13 | Contract tests: all 11 REST endpoints match documented shapes | 100% | 0 breaking changes | Yes |
| CS-14 | Smoke tests on STAGING | 100% | 0 failures | Yes |
| CS-15 | Bidirectional navigation: client → contact ≤ 2 clicks (NFR8) | 100% | 0 failures | Yes |
| CS-16 | Contact client view: no extra search required (NFR9) | 100% | 0 failures | Yes |

**Technical Definition of "Certified" for Siesa-Agents MVP:**

> The Siesa-Agents MVP is certified for release when:
> (1) All 19 user stories have their acceptance criteria validated in QA environment with no P1 defects open,
> (2) The cascade deletion rule (client delete → contacts `clienteId = null`) is verified by a DB-level assertion integration test,
> (3) TanStack Query cache invalidation is verified for all 5 mutation paths (create, update, delete client; associate, disassociate, reassign contact),
> (4) Search performance meets NFR1 thresholds with production-scale seed data (500 clients / 1,000 contacts),
> (5) No error response from the backend exposes a stack trace (Problem Details RFC 7807 compliance = 100%),
> and (6) STAGING smoke tests pass at 100% for the 11 REST endpoints.

---

> **Living Document.** Update at the end of each feature or when new risks are identified.
> Version history lives in the Git repository — not replicated here.
