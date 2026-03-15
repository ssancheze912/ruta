---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: in-progress
story_path: _bmad-output/implementation-artifacts/2-4-edit-client.md
story_key: 2-4-edit-client
---

# Code Review: 2-4-edit-client

- **Date**: 2026-03-14
- **Reviewer**: SiesaTeam (AI Agent)
- **Status**: In Progress

## Initial Discovery

- **Undocumented Changes**: None — all story 2.4 files accounted for. Contactos-module changes in git belong to Story 3.4 (different story on same branch).
- **Missing Files**: None — all 17 documented files exist in git.
- **Notes**: Frontend is a git submodule. Story 2.4 scope is the `clientes` module only.

## Review Plan

### Items to Verify

**Acceptance Criteria:**
- [ ] AC1: "Editar" button opens pre-filled form dialog from `/clientes/:id`
- [ ] AC2: Successful edit → backend saved, dialog closes, list + detail both refresh, toast shows "Cliente actualizado correctamente"
- [ ] AC3: Client-side validation shows inline errors; form NOT submitted to backend on invalid
- [ ] AC4: Duplicate NIT on update (different client) → 409 + inline error "El NIT/RUC ya está registrado"; same-NIT on same client → allowed
- [ ] AC5: Cancel/X/Escape closes dialog; re-opening shows original values again

**Tasks Audit:**
- [ ] T1: `IClienteRepository.UpdateAsync` added — correct signature
- [ ] T2: `ClienteRepository.UpdateAsync` implemented — EF Core Update + SaveChanges
- [ ] T3: `UpdateClienteCommand`, `UpdateClienteCommandValidator`, `UpdateClienteResult`, `UpdateClienteCommandHandler` — all correct patterns
- [ ] T4: `UpdateClienteRequest`, PUT endpoint, Program.cs DI registration
- [ ] T5: Unit tests (4) + integration tests (3) — real assertions, correct HTTP codes
- [ ] T6-7: Frontend domain + infra + `useUpdateCliente` hook
- [ ] T8: `ClienteFormDialog` edit mode — props, useEffect reset, both hooks always called
- [ ] T9: `ClienteDetailView` — Editar button, lazy-loaded dialog with correct props
- [ ] T10: Frontend tests — hook tests (3), dialog edit tests (2), detail button test (1)

### Focus Areas

**Security:**
- `ClienteEndpoints.cs` PUT endpoint — input validation path (FluentValidation → 422)
- NIT uniqueness check — boundary case (same client)

**Correctness:**
- `UpdateClienteCommandHandler.cs` — NIT conflict logic `existing.Id != entity.Id` (changed from `command.Id`)
- `ClienteFormDialog.tsx` — `useEffect([open])` reset logic; dialog re-open shows correct values
- React rules of hooks — both mutations always called, `isPending` selection

**Data integrity:**
- `DateTimeOffset.UtcNow` for `entity.UpdatedAt`
- `Results.Ok(result.Dto)` → 200 (not 204)
- Both `['clientes']` and `['clientes', id]` invalidated in `useUpdateCliente`

**Tests:**
- Backend: unit test "same NIT" case validity
- Frontend: `useUpdateCliente` invalidates both query keys (needs assertion)
- Integration tests: 200 body shape, 404 body, 409 body

---

## Review Findings

### High Issues (Must Fix)

**FINDING-01 [HIGH] — `useUpdateCliente.test.ts` does not assert query key invalidation**

- **File**: `frontend/src/modules/crm/clientes/application/useUpdateCliente.test.ts`
- **Issue**: The success test asserts `toast.success` was called but does NOT verify that `queryClient.invalidateQueries` was called with `['clientes']` or `['clientes', id]`. This is a critical behavior from AC2 and the architecture constraint ("Must invalidate both `['clientes']` AND `['clientes', id]`"). The invalidation logic could be silently removed and all tests would still pass.
- **Impact**: A regression deleting one or both `invalidateQueries` calls would not be caught by the test suite, causing stale UI data after an update.
- **Fix**: Use a spy on `queryClient.invalidateQueries` and assert both query keys are invalidated. Pattern established in existing `useCreateCliente` and `useCreateContacto` tests.

---

**FINDING-02 [HIGH] — Integration test does not assert `UpdatedAt` was bumped**

- **File**: `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs` — `PutCliente_WithValidData_Returns200WithUpdatedDto`
- **Issue**: The test seeds a client, calls PUT, and asserts `Nombre` and `Ciudad` were updated. It does NOT assert that `UpdatedAt` changed (i.e., is greater than `CreatedAt` and reflects a recent timestamp). The handler's `entity.UpdatedAt = DateTimeOffset.UtcNow;` is a P0 rule compliance item (`DateTimeOffset always`), yet no integration test validates this assignment.
- **Impact**: Removing `entity.UpdatedAt = DateTimeOffset.UtcNow;` from the handler would still pass all tests.
- **Fix**: After deserializing the PUT response DTO, assert `dto.UpdatedAt > dto.CreatedAt` (and optionally that it's within a few seconds of `DateTimeOffset.UtcNow`).

---

### Medium Issues (Should Fix)

**FINDING-03 [MEDIUM] — Stale comment says `command.Id` instead of `entity.Id`**

- **File**: `backend/tests/SiesaAgents.UnitTests/Application/Clientes/UpdateClienteCommandHandlerTests.cs`, line 70
- **Issue**: Comment reads `// Same instance returned by both queries → existing.Id == command.Id → no conflict`. The actual handler logic is `existing.Id != entity.Id` (not `command.Id`). This was corrected during implementation but the comment wasn't updated. A developer reading this will be confused when comparing the comment against the handler, and may "fix" it back to `command.Id`, reintroducing the test-breaking bug.
- **Fix**: Change comment to `// Same instance returned by both queries → existing.Id == entity.Id → no conflict`.

---

**FINDING-04 [MEDIUM] — Edit-mode test doesn't assert actual pre-filled input values**

- **File**: `frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.test.tsx` — `'renders pre-filled values in edit mode'`
- **Issue**: The test only checks that the `nombre` input element EXISTS (`toBeInTheDocument()`) and the title shows "Editar cliente". It does NOT assert that the inputs actually contain the pre-filled values (e.g., `expect(screen.getByLabelText(/nombre/i)).toHaveValue('Empresa X')`). AC1 requires the form is "pre-filled with the client's current values", and AC5 requires "Re-opening the dialog shows the original values again" — but neither behavior is verified by the input value assertion.
- **Impact**: If `useEffect` reset with `defaultValues` breaks (e.g., incorrect dependency array), the test still passes because it only checks element existence.
- **Fix**: Add `toHaveValue(...)` assertions for each field after `await waitFor(...)` to allow the `useEffect` reset to complete.

---

### Low Issues (Nice to Fix)

**FINDING-05 [LOW] — `ClienteDetailView.test.tsx` renders lazy `ClienteFormDialog` without `QueryClientProvider`**

- **File**: `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.test.tsx`
- **Issue**: `ClienteDetailView` now renders `ClienteFormDialog` (lazy-loaded) inside a `<Suspense>`. `ClienteFormDialog` internally calls `useCreateCliente()` and `useUpdateCliente()`, both of which require a `QueryClient` context. The test does NOT wrap the render in a `QueryClientProvider`. Currently tests pass because the radix-ui `Dialog` component doesn't render its children when `open=false` — but this is an implementation detail of the Dialog, not a contract. If the Dialog library changes this behavior, or if a test opens the dialog, the tests will break with a cryptic "No QueryClient set" error.
- **Fix**: Wrap the test render in a `QueryClientProvider` (same pattern as existing hook tests), or mock both hooks at the module level in this test file.
- **Status**: ⏭️ Not auto-fixed (LOW severity — deferred).

---

## Fix Outcome

- **Action Taken**: Fixed automatically
- **Fixed Count**: 4 (FINDING-01, FINDING-02, FINDING-03, FINDING-04)
- **Deferred Count**: 1 (FINDING-05 — LOW, tests still pass)
- **Recommended Status**: done

## Status Sync
- **Story File Status**: Updated to `done`
- **Sprint Status YAML**: Synced — `2-4-edit-client` → `done`
