---
workflow: traceability-and-testing
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
generated_date: 2026-03-17
project_name: Siesa-Agents
title: Complete Test Design Document (Master)
testGenerationMode: ui-functional
test_case_count: 74
phases_completed: [1, 2, 3, 4, 5]
input_documents:
  epics: _bmad-output/planning-artifacts/epics/
  prd: _bmad-output/planning-artifacts/archive/prd.md
output_files:
  - _bmad-output/implementation-artifacts/traceability-artifacts/test-design-2026-03-17-100000/test-design-phase1-gatekeeper.md
  - _bmad-output/implementation-artifacts/traceability-artifacts/test-design-2026-03-17-100000/test-design-phase2-fac.md
  - _bmad-output/implementation-artifacts/traceability-artifacts/test-design-2026-03-17-100000/test-design-phase3-blind-spots.md
  - _bmad-output/implementation-artifacts/traceability-artifacts/test-design-2026-03-17-100000/test-design-phase4-test-matrix.md
  - _bmad-output/implementation-artifacts/traceability-artifacts/test-design-2026-03-17-100000/test-cases.csv
  - _bmad-output/implementation-artifacts/traceability-artifacts/test-design-2026-03-17-100000/test-design-phase5-tsr.md
  - _bmad-output/implementation-artifacts/traceability-artifacts/test-design-2026-03-17-100000/test-design-complete.md
---

# Complete Test Design Document — Siesa-Agents

> **BMAD V6.0 MegaPrompt** | Test Mode: UI Functional | Generated: 2026-03-17

This master document provides a consolidated view of all 5 phases of the BMAD V6.0 test design methodology. Each phase is summarized here with references to the detailed phase documents.

---

## Quick Reference

| Document | Phase | Description |
|----------|-------|-------------|
| [test-design-phase1-gatekeeper.md](test-design-phase1-gatekeeper.md) | Phase 1 | Gatekeeper classification of all 19 stories |
| [test-design-phase2-fac.md](test-design-phase2-fac.md) | Phase 2 | Feature Acceptance Criteria in Gherkin |
| [test-design-phase3-blind-spots.md](test-design-phase3-blind-spots.md) | Phase 3 | 41 blind spots detected across 4 features |
| [test-design-phase4-test-matrix.md](test-design-phase4-test-matrix.md) | Phase 4 | 74 test cases (Design 360°) |
| [test-cases.csv](test-cases.csv) | Export | Siesa FT-SD-007 v5.0 format — 74 test cases |
| [test-design-phase5-tsr.md](test-design-phase5-tsr.md) | Phase 5 | TSR + Full Traceability Matrix |

---

## I. REPORTE DEL GATEKEEPER (GRANULAR)

> **Full document:** [test-design-phase1-gatekeeper.md](test-design-phase1-gatekeeper.md)

### Summary

| Category | Count |
|----------|-------|
| Total Stories Analyzed | 19 |
| Lógica de Negocio (in scope) | 17 |
| Ruido Técnico (excluded) | 2 |

**Excluded stories (Ruido Técnico):**
- **1.1** — Project Initialization & Repository Structure (dev environment setup, no user-observable flow)
- **1.3** — Backend Database Foundation (EF Core migrations, infrastructure, no UI flow)

**4 Logical Features identified:**

| Feature ID | Business Capability | Associated Stories |
|------------|--------------------|--------------------|
| F1 | Application Shell & Navigation | 1.2 |
| F2 | Client Management | 2.1, 2.2, 2.3, 2.4, 2.5 |
| F3 | Contact Management | 3.1, 3.2, 3.3, 3.4, 3.5 |
| F4 | Client-Contact Association & Data Quality | 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 |

---

## II. DEFINICIÓN DE FEATURES Y CRITERIOS MAESTROS (FAC) EN GHERKIN

> **Full document:** [test-design-phase2-fac.md](test-design-phase2-fac.md)

### FAC Summary

| Feature | Functional Scenarios | NFR Scenarios | Total |
|---------|---------------------|---------------|-------|
| F1 — Navigation | 9 | 0 | 9 |
| F2 — Client Mgmt | 19 | 3 | 22 |
| F3 — Contact Mgmt | 15 | 2 | 17 |
| F4 — Association | 19 | 3 | 22 |
| **Total** | **62** | **8** | **70** |

**Key Gherkin scenarios include:** SPA navigation without full reload, NavigationRail/NavigationBar responsive behavior, real-time search (name + NIT), inline validation with duplicate NIT detection, immediate list refresh after all CRUD operations, bidirectional client↔contact navigation, orphan contacts filter with search composition, and reassignment flow with cache invalidation.

---

## III. PUNTOS CIEGOS DETECTADOS POR FEATURE

> **Full document:** [test-design-phase3-blind-spots.md](test-design-phase3-blind-spots.md)

### Blind Spots Summary

| Feature | Total | High | Medium | Low |
|---------|-------|------|--------|-----|
| F1 — Navigation | 8 | 3 | 4 | 1 |
| F2 — Client Mgmt | 11 | 6 | 5 | 0 |
| F3 — Contact Mgmt | 10 | 4 | 6 | 0 |
| F4 — Association | 12 | 8 | 3 | 1 |
| **Total** | **41** | **21** | **18** | **2** |

**Top 5 Critical Blind Spots:**

| ID | Feature | Risk |
|----|---------|------|
| BS-F1-07 | Navigation | Deep link in new tab fails to hydrate SPA correctly |
| BS-F2-02 | Client Mgmt | Rapid double-click creates duplicate client |
| BS-F2-06 | Client Mgmt | Cache invalidation failure shows stale list after creation |
| BS-F4-03 | Association | Reassign dialog includes current client in dropdown |
| BS-F4-08 | Association | Orphan filter + search combination returns incorrect results |

---

## IV. MATRIZ INTEGRAL DE PRUEBAS (DISEÑO 360°)

> **Full document:** [test-design-phase4-test-matrix.md](test-design-phase4-test-matrix.md)
> **CSV Export:** [test-cases.csv](test-cases.csv) — Siesa FT-SD-007 v5.0

### Test Matrix Summary

**Total Test Cases: 74**

| Feature | TCs | P0 | P1 | P2 |
|---------|-----|----|----|-----|
| F1 — Navigation | 10 | 4 | 4 | 2 |
| F2 — Client Mgmt | 22 | 13 | 8 | 1 |
| F3 — Contact Mgmt | 17 | 9 | 7 | 1 |
| F4 — Association | 25 | 13 | 11 | 1 |
| **Total** | **74** | **39** | **30** | **5** |

| Strategy | Count | % |
|----------|-------|---|
| Happy Path | 43 | 58% |
| Edge Case | 21 | 28% |
| Negativo | 7 | 9% |
| NFR | 3 | 5% |

| Level | Count | % |
|-------|-------|---|
| Funcional | 54 | 73% |
| Integración | 20 | 27% |
| E2E | 0 | 0% |

---

## V. INFORME TSR (TEST SUMMARY REPORT)

> **Full document:** [test-design-phase5-tsr.md](test-design-phase5-tsr.md)

### Quality Gate Result

**✅ PASS** — All acceptance criteria for test design are met.

| Criterion | Result |
|-----------|--------|
| P0 critical cases designed | ✅ 49/49 (100%) |
| Feature coverage | ✅ All 4 features (F1–F4) |
| Happy path coverage | ✅ All 17 in-scope stories |
| Validation/negative coverage | ✅ FR8 duplicates, FR16 required fields |
| Blind spot coverage (High) | ✅ 86% of High-severity blind spots covered |
| FR traceability | ✅ 30/30 FRs traced (100%) |

### FR Coverage

| Feature | FRs | Covered | % |
|---------|-----|---------|---|
| F1 | 3 | 3 | 100% |
| F2 | 8 | 8 | 100% |
| F3 | 8 | 8 | 100% |
| F4 | 11 | 11 | 100% |
| **Total** | **30** | **30** | **100%** |

---

## APÉNDICE: ÍNDICE DE TEST CASES POR FEATURE

### F1 — Application Shell & Navigation (10 TCs)
TC-F1-001 · TC-F1-002 · TC-F1-003 · TC-F1-004 · TC-F1-005 · TC-F1-006 · TC-F1-007 · TC-F1-008 · TC-F1-009 · TC-F1-010

### F2 — Client Management (22 TCs)
TC-F2-001 · TC-F2-002 · TC-F2-003 · TC-F2-004 · TC-F2-005 · TC-F2-006 · TC-F2-007 · TC-F2-008 · TC-F2-009 · TC-F2-010 · TC-F2-011 · TC-F2-012 · TC-F2-013 · TC-F2-014 · TC-F2-015 · TC-F2-016 · TC-F2-017 · TC-F2-018 · TC-F2-019 · TC-F2-020 · TC-F2-021 · TC-F2-022

### F3 — Contact Management (17 TCs)
TC-F3-001 · TC-F3-002 · TC-F3-003 · TC-F3-004 · TC-F3-005 · TC-F3-006 · TC-F3-007 · TC-F3-008 · TC-F3-009 · TC-F3-010 · TC-F3-011 · TC-F3-012 · TC-F3-013 · TC-F3-014 · TC-F3-015 · TC-F3-016 · TC-F3-017

### F4 — Client-Contact Association & Data Quality (25 TCs)
TC-F4-001 · TC-F4-002 · TC-F4-003 · TC-F4-004 · TC-F4-005 · TC-F4-006 · TC-F4-007 · TC-F4-008 · TC-F4-009 · TC-F4-010 · TC-F4-011 · TC-F4-012 · TC-F4-013 · TC-F4-014 · TC-F4-015 · TC-F4-016 · TC-F4-017 · TC-F4-018 · TC-F4-019 · TC-F4-020 · TC-F4-021 · TC-F4-022 · TC-F4-023 · TC-F4-024 · TC-F4-025
