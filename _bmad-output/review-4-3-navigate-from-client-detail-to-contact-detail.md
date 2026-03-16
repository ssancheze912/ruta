---
stepsCompleted: [1, 2, 3, 4, 5, 6]
story_path: _bmad-output/implementation-artifacts/4-3-navigate-from-client-detail-to-contact-detail.md
story_key: 4-3-navigate-from-client-detail-to-contact-detail
status: in-progress
date: 2026-03-16
---

# Code Review: 4-3-navigate-from-client-detail-to-contact-detail

- **Date**: 2026-03-16
- **Reviewer**: SiesaTeam (AI Agent — Adversarial Senior Developer)
- **Status**: In Progress

## Initial Discovery

### Files Claimed in Story vs Git Reality

**All story files confirmed present in git** ✓

**Frontend — Modified (git diff):**
- `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx` ✓
- `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx` ✓

### Undocumented Changes (in Git but NOT in Story)
- `frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.tsx` — ⚠️ Modified, NOT in story 4.3
- `frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.test.tsx` — ⚠️ Modified, NOT in story 4.3
- `frontend/src/modules/crm/clientes/application/useUpdateCliente.ts` — ⚠️ Untracked NEW, NOT in story 4.3
- `frontend/src/modules/crm/clientes/application/useUpdateCliente.test.ts` — ⚠️ Untracked NEW, NOT in story 4.3

> Note: These undocumented files appear to be pre-existing uncommitted changes from story 2-4 (edit client), not introduced by story 4.3.

---

## Review Plan

### Context Documents
- **Epic**: `_bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md` (Selective Load)
- **Architecture**: `_bmad-output/planning-artifacts/architecture.md` (Full Load)
- **Project Context**: `_bmad-output/project-context.md` ✓ (already loaded)

### Items to Verify

#### Acceptance Criteria
- [ ] AC1 — Forward navigation: row click in `AssociatedContactsSection` navigates to `/contactos/:contactoId`
- [ ] AC2 — Click count: ≤2 clicks from client record (row click = 1 click total)
- [ ] AC3 — "Volver" calls `router.history.back()` — not hardcoded to `/contactos`
- [ ] AC4 — Browser back works natively (TanStack Router push adds to history by default)
- [ ] AC5 — "Volver" works from any origin (history.back() is origin-agnostic)

#### Tasks
- [ ] Task 1.1 — `useRouter` imported alongside `useNavigate`; `router.history.back()` on "Volver"; `useNavigate` KEPT for delete redirect
- [ ] Task 1.1 — 404-state "Volver a contactos" button still hardcoded to `/contactos` (intentional fallback)
- [ ] Task 2.1 — `useRouter` mock present in test file; test `"Volver button calls router.history.back()"` asserts `mockHistoryBack.toHaveBeenCalledOnce()`
- [ ] Task 3.1 — Test `"navigates to contact on row click"` exists in `AssociatedContactsSection.test.tsx`

### Focus Areas

#### Security
- No security surface — pure frontend navigation, no user input, no API calls

#### Performance
- No performance concern — `router.history.back()` is a one-line browser history call

#### Maintainability
- `ContactoDetailView.tsx` — dual navigation hooks (`useNavigate` + `useRouter`) must both be present and used correctly
- Mock pattern in test file — `vi.mock('@tanstack/react-router', () => ({...}))` vs story-specified `importOriginal` pattern

#### Tests
- `ContactoDetailView.test.tsx` — does simple `vi.mock` factory (without `importOriginal`) break any other router-dependent test behavior?
- Pre-existing failures (2 tests re: Alert "Confirmar") — are they truly pre-existing or caused by the new `useRouter` mock?
- `mockHistoryBack.mockReset()` in `beforeEach` — is reset vs clear sufficient?

#### High-Risk Suspicions (Adversarial Red Flags)
1. **`vi.mock` without `importOriginal`** — Story Dev Notes specify `async (importOriginal)` pattern to spread all actual exports. Implementation uses `() => ({...})` which only exports `useNavigate` and `useRouter` — any test relying on other `@tanstack/react-router` exports (e.g., `Link`, `createRoute`) would get `undefined`. Needs verification.
2. **`useNavigate` retention for delete flow** — If `useNavigate` was accidentally removed, the post-delete redirect would silently fail. Must verify it's still in the component.
3. **404 fallback button** — Must still navigate to `/contactos`, NOT call `history.back()`.
4. **Pre-existing test failures** — 2 failing tests (`calls delete mutation and navigates`, `does not navigate when delete mutation fails`) — need to verify these failed BEFORE story 4.3 changes, not after introducing the new mock structure.

---

## Review Findings

### Critical Issues (Must Fix)

None.

### High Issues (Must Fix)

None.

### Medium Issues (Should Fix)

- **[MED] Pre-existing delete test failures carried forward unaddressed — delete confirmation has zero passing test coverage**
  - Files: `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx` lines 311, 331
  - Tests `'calls delete mutation and navigates when Confirmar is clicked'` and `'does not navigate when delete mutation fails'` both fail because `screen.getByText('Confirmar')` finds no element. Root cause: component uses `confirmText="Eliminar"` (line 109 of component) which makes the Alert confirm button say "Eliminar", not "Confirmar". The tests have never exercised the delete confirmation path and have been broken for 3+ stories (4.1, 4.2, 4.3).
  - Story 4.3 was narrow-scope (navigation only) but the delete flow is a critical feature — leaving 2 broken tests silently through multiple stories accumulates test debt and gives false confidence in coverage.
  - Fix: Change `await userEvent.click(screen.getByText('Confirmar'))` to `await userEvent.click(screen.getAllByText('Eliminar')[1])` (second "Eliminar" is the confirm button inside the Alert dialog) — or use `screen.getByRole('button', { name: 'Eliminar' })` within the dialog.

### Low Issues (Nice to Fix)

- **[LOW] `vi.mock('@tanstack/react-router', ...)` uses simple factory without `importOriginal` — deviates from project-specified pattern**
  - File: `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx` lines 11–14
  - Story Dev Notes explicitly specify the `importOriginal` spread pattern: `async (importOriginal) => { const actual = await importOriginal<...>(); return { ...actual, useRouter: ..., useNavigate: ... } }`. The implementation uses the simpler `() => ({ useNavigate: ..., useRouter: ... })` — meaning ONLY those two exports exist in the mock. Currently safe (component only imports `useNavigate` and `useRouter`), but diverges from the project-standard defensive pattern.
  - Not a bug today, but fragile for future extensions.

- **[LOW] `mockHistoryBack.mockReset()` in `beforeEach` is redundant — inconsistent cleanup strategy**
  - File: `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx` lines 54–58
  - `vi.clearAllMocks()` (line 55) already clears `mockHistoryBack`'s call history. The additional `mockHistoryBack.mockReset()` (line 56) is redundant since `mockHistoryBack = vi.fn()` has no set implementation to reset. Inconsistent: `mockNavigate` is only cleared (via `vi.clearAllMocks()`), `mockHistoryBack` is cleared then additionally reset. Dead code, minor inconsistency.

- **[LOW] "Volver" test assertion slightly imprecise — `not.toHaveBeenCalledWith` vs `not.toHaveBeenCalled`**
  - File: `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx` line 150
  - `expect(mockNavigate).not.toHaveBeenCalledWith({ to: '/contactos' })` would still pass if `navigate` was called with a different argument (e.g., `{ to: '/contactos/123' }`). The stronger assertion is `expect(mockNavigate).not.toHaveBeenCalled()` — after clicking "Volver", no navigation at all should occur. Functionally equivalent for this component today, but imprecise.

---

## AC Verification Summary

| AC | Status | Evidence |
|---|---|---|
| AC1 — Forward navigation row click → /contactos/:contactoId | ✅ PASS | `AssociatedContactsSection.test.tsx` line 171 — `"navigates to contact on row click"` passes |
| AC2 — ≤2 clicks from client record | ✅ PASS | Row click = 1 click total |
| AC3 — "Volver" → `router.history.back()` | ✅ PASS | `ContactoDetailView.tsx` line 64; test `"Volver button calls router.history.back()"` passes |
| AC4 — Browser back works natively | ✅ PASS | TanStack Router `navigate()` pushes to history by default |
| AC5 — "Volver" works from any origin | ✅ PASS | `router.history.back()` is origin-agnostic |

---

## Fix Outcome

- **Action Taken**: Fixed automatically
- **Fixed Count**: 4 (1 Medium, 3 Low)
- **Task Count**: 0
- **Changes Applied**:
  1. `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx` — updated `vi.mock` to use `importOriginal` spread pattern
  2. `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx` — removed redundant `mockHistoryBack.mockReset()` from `beforeEach`
  3. `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx` — strengthened assertion to `expect(mockNavigate).not.toHaveBeenCalled()`
  4. `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx` — fixed pre-existing delete confirmation tests: `screen.getByText('Confirmar')` → `screen.getAllByText('Eliminar')[1]` (Alert renders confirm button with `confirmText="Eliminar"`)
- **Test Results**: 19/19 pass in ContactoDetailView.test.tsx; 133/139 pass overall (+2 from pre-existing fixes, 0 regressions)
- **TypeScript**: 0 errors
- **Recommended Status**: `done`

## Status Sync

- **Story File Status**: Updated to `done`
- **Sprint Status YAML**: Synced — `4-3-navigate-from-client-detail-to-contact-detail` → `done`

### Missing Documentation
- None — all story-claimed files are present in git.
