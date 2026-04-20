---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
status: in-progress
story_path: _bmad-output/implementation-artifacts/4-6-reassign-contact-to-different-client.md
story_key: 4-6-reassign-contact-to-different-client
---

# Code Review: 4-6-reassign-contact-to-different-client

- **Date**: 2026-03-17
- **Reviewer**: SiesaTeam (AI Agent)
- **Status**: In Progress

## Initial Discovery

- **Undocumented Changes**: None — all git-changed files match story's File List
- **Missing Files**: None — all story-claimed files present in git commit `832db00`

### Files in Scope (frontend submodule commit `832db00`)

| File | Type |
|------|------|
| `src/modules/crm/contactos/application/useReassignContactoCliente.ts` | New |
| `src/modules/crm/contactos/application/useReassignContactoCliente.test.ts` | New |
| `src/modules/crm/contactos/presentation/ReasignarClienteDialog.tsx` | New |
| `src/modules/crm/contactos/presentation/ReasignarClienteDialog.test.tsx` | New |
| `src/modules/crm/contactos/presentation/ContactoDetailView.tsx` | Modified |
| `src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx` | Modified |

---

## Review Plan

### Items to Verify

#### Acceptance Criteria

- [ ] **AC1** — "Reasignar cliente" button visible in header when `contacto.clienteId !== null`; NOT shown when `clienteId === null`
  - Files: `ContactoDetailView.tsx`, `ContactoDetailView.test.tsx`
- [ ] **AC2** — Dialog opens on click; `Select` lists all clients EXCEPT current one; Select disabled while loading; confirm disabled when no other clients exist
  - Files: `ReasignarClienteDialog.tsx`, `ReasignarClienteDialog.test.tsx`
- [ ] **AC3** — On confirm: `PUT /api/v1/contactos/{id}/cliente` called with `{ clienteId: newClienteId }`; 3 query keys invalidated; toast "Contacto reasignado correctamente"; dialog closes
  - Files: `useReassignContactoCliente.ts`, `useReassignContactoCliente.test.ts`, `ReasignarClienteDialog.tsx`
- [ ] **AC4** — Cancel / close: no API call, `clienteId` unchanged
  - Files: `ReasignarClienteDialog.tsx`, `ReasignarClienteDialog.test.tsx`
- [ ] **AC5** — Mutation failure: toast "No se pudo completar la operación. Intenta de nuevo."; dialog stays open
  - Files: `useReassignContactoCliente.ts`, `useReassignContactoCliente.test.ts`

#### Tasks Audit

- [ ] **Task 1** — `useReassignContactoCliente` hook: correct `mutationFn`, 3 invalidations, toasts
- [ ] **Task 2** — `ReasignarClienteDialog`: options filter, reset on close, disabled states, correct `mutate` call
- [ ] **Task 3** — `ContactoDetailView` wiring: state, button, dialog mount
- [ ] **Task 4** — Tests: 4 hook tests + 7 dialog tests + 3 CDV tests = 14 new tests; assertions meaningful (not placeholders)

### Focus Areas

| Area | Files |
|------|-------|
| **Query invalidation correctness** | `useReassignContactoCliente.ts`, `.test.ts` |
| **State reset on dialog close** | `ReasignarClienteDialog.tsx` |
| **Disabled-state logic** | `ReasignarClienteDialog.tsx`, `.test.tsx` |
| **No-op prevention** (current client excluded from list) | `ReasignarClienteDialog.tsx` |
| **Test quality** — real assertions vs stub-only | all `.test.ts/tsx` |
| **Regression safety** — `useAssignContactoCliente` untouched | `useAssignContactoCliente.ts` |

---

## Review Findings

### Critical Issues (Must Fix)

None.

### Medium Issues (Should Fix)

- **[MED-1]** Two test cases from Task 4.2 spec are marked `[x]` (done) but **do not exist** in `ReasignarClienteDialog.test.tsx`:
  - *"closes dialog on successful mutation"* — Test 4 only verifies `mutate` is called with `onSuccess: expect.any(Function)`. It never invokes that callback and never asserts `onOpenChange(false)` is called, so the dialog-close behaviour on success is untested.
  - *"resets selection when dialog closes"* — No test verifies that `selectedClienteId` resets to `undefined` after dialog close (i.e. reopening the dialog always starts with blank selection).
  - **Fix**: Add the two missing tests to `ReasignarClienteDialog.test.tsx`.

### Low Issues (Nice to Fix)

- **[LOW-1]** `useClientes()` is subscribed unconditionally inside `ReasignarClienteDialog`. The component stays mounted whenever `contacto.clienteId !== null` (even when `open=false`), creating an active TanStack Query subscription to the full clients list during normal contact viewing — not just when the dialog is open. TanStack Query caching makes this cheap in practice, but it's an unnecessary subscription.
  - **Fix**: Consider conditional rendering of the dialog only when `open=true`, or lazy-load clients via `enabled: open`.

- **[LOW-2]** No error feedback when `useClientes()` fails inside the dialog. If the clients fetch errors, `clientes` will be empty and the Select shows only the placeholder — silent failure with no user-facing message. AC2 specifies "If clients are loading, the Select is disabled" but is silent on the error case. This is a UX gap.
  - **Fix**: Add an `isError` branch in the dialog body (e.g., short `Alert` or disabled Select with error `ariaLabel`) when `isError === true`.

- **[LOW-3]** `options` array is recomputed on every render without `useMemo` (`ReasignarClienteDialog.tsx` line 25). With ≤500 clients the cost is negligible, but it's inconsistent with the project's pattern for derived data in hooks.
  - **Fix**: `const options = useMemo(() => clientes.filter(...).map(...), [clientes, currentClienteId])`

---

## Fix Outcome

- **Action Taken**: Fixed automatically
- **Fixed Count**: 1 (MED-1 — 2 missing tests added to `ReasignarClienteDialog.test.tsx`)
- **Task Count**: 0
- **Recommended Status**: done

## Status Sync

- **Story File Status**: Updated to `done`
- **Sprint Status YAML**: Synced — `4-6-reassign-contact-to-different-client` → `done`

## Repository Sync

- **Branch**: `develop-santidev-ssancheze-epics-2-3`
- **Commit**: `2257659` — fix: code-review 4.6 — add 2 missing tests to ReasignarClienteDialog
- **Push**: Performed ✅
- **GitFlow Compliance**: ✅ Verified
- **Status**: Workflow Completed Successfully
