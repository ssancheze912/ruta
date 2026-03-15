---
stepsCompleted: [1, 2, 3, 4, 5, 6]
story_path: _bmad-output/implementation-artifacts/3-5-delete-contact.md
story_key: 3-5-delete-contact
reviewer: SiesaTeam (AI Agent)
date: 2026-03-15
status: In Progress
---

# Code Review: 3-5-delete-contact

- **Date**: 2026-03-15
- **Reviewer**: SiesaTeam (AI Agent)
- **Status**: In Progress

---

## Initial Discovery

### Git vs Story Claims

| Category | Files |
|---|---|
| **Undocumented changes (not in Story 3.5)** | `backend/.../ClienteEndpoints.cs`, `IClienteRepository.cs`, `ClienteRepository.cs`, `ClienteEndpointsTests.cs`, `DeleteClienteCommand.cs`, `DeleteClienteCommandHandler.cs`, `DeleteClienteResult.cs`, `DeleteClienteCommandHandlerTests.cs`, `2-5-delete-client.md` |
| **Story claims not found in git** | None |
| **Missing documentation** | None |

**Note**: All undocumented changes belong to Story 2.5 (Delete Cliente) which runs in parallel on the same branch. These will be committed separately. MEDIUM finding by rule, but expected and intentional — not a defect.

### Build Verification
- `dotnet build backend/SiesaAgents.slnx` → **Build succeeded. 0 Errors** ✅
- `npx vitest run src/modules/crm/contactos/` → **52/52 pass** ✅
- Pre-existing warning: EF Core version conflict in IntegrationTests (MSB3277) — pre-dates Story 3.5.

---

## Review Plan

### Items to Verify
- [x] AC1: "Eliminar" button visible only when contact loaded (not loading/error)
- [x] AC2: Confirmation dialog with correct title, Confirmar/Cancelar buttons, `showCloseButton={false}`
- [x] AC3: Cancelar closes dialog without action
- [x] AC4: DELETE request sent on confirm → 204 → navigate + toast
- [x] AC5: Buttons disabled + "Eliminando..." text during pending
- [x] AC6: Backend DELETE `/api/v1/contactos/{id}` → 204 / 404
- [x] Task 1: `DeleteAsync` in domain interface + infrastructure
- [x] Task 2: `DeleteContactoCommand` + handler
- [x] Task 3: DELETE endpoint in `ContactoEndpoints.cs` + DI in `Program.cs`
- [x] Task 4: Unit tests (3) + integration tests (2) + `dotnet build` + `dotnet test`
- [x] Task 5: `delete` in `IContactoRepository.ts` + `contactoApiRepository.ts` + `useDeleteContacto.ts`
- [x] Task 6: Delete dialog in `ContactoDetailView.tsx`
- [x] Task 7: `useDeleteContacto.test.ts` (2 tests) + `ContactoDetailView.test.tsx` (6 new tests)

### Focus Areas
- Security: `ContactoEndpoints.cs`, `ContactoRepository.cs`
- Error handling: `ContactoDetailView.tsx` (async `onClick`)
- Cache strategy: `useDeleteContacto.ts`
- Test quality: `DeleteContactoCommandHandlerTests.cs`, `ContactoEndpointsTests.cs`, `useDeleteContacto.test.ts`, `ContactoDetailView.test.tsx`

---

## Review Findings

### Critical Issues (Must Fix)
_None_

### High Issues (Must Fix)
_None_

### Medium Issues (Should Fix)

**[MED-1] No error handling on `mutateAsync()` in `ContactoDetailView.tsx` (line 109–112)**

```tsx
onClick={async () => {
  await deleteMutation.mutateAsync()
  navigate({ to: '/contactos' })
}}
```

If the DELETE request fails (e.g., network error, unexpected 500), `mutateAsync()` will throw an unhandled rejection. React does not catch errors from async event handlers. Result: the dialog stays open (navigation doesn't fire), but **no error feedback** is shown to the user — they don't know the deletion failed. The mutation enters `isError` state but nothing renders it in the dialog.

**Fix**: Wrap in try/catch and show an error state or rely on the toast from `onError` in the hook.

---

### Low Issues (Nice to Fix)

**[LOW-1] `DeleteContacto_WithValidId_Returns204` integration test: vacuous `ContentLength` assertion**

```csharp
Assert.Equal(0, response.Content.Headers.ContentLength ?? 0);
```

For `204 No Content` responses, `ContentLength` is `null` by HTTP spec. The `?? 0` coerces `null → 0`, making `Assert.Equal(0, 0)` — always passes regardless of actual response body. The assertion provides no real guard.

**Fix**: Remove the redundant assertion, or replace with `Assert.Null(response.Content.Headers.ContentLength)` to actually verify the header is absent.

**[LOW-2] `useDeleteContacto.test.ts` does not assert cache invalidation**

The two existing tests only verify `isSuccess`/`isError` and `toast.success`. Neither asserts that `queryClient.invalidateQueries(['contactos'])` or `queryClient.removeQueries(['contactos', contactoId])` were called. Cache behavior is silently untested.

**Note**: Verifying this requires spy setup on the QueryClient instance — not trivial with the current test wrapper, but worth documenting as a coverage gap.

---

## AC Verification Summary

| AC | Status | Evidence |
|---|---|---|
| AC1 — Eliminar button visible only with loaded data | ✅ PASS | Button rendered inside `if (!contacto) return null` guard; tests verify absence during loading/error |
| AC2 — Confirmation dialog with title + 2 buttons + showCloseButton=false | ✅ PASS | `ContactoDetailView.tsx:94-119`; `ContactoDetailView.test.tsx` tests 259–273 |
| AC3 — Cancelar closes without action | ✅ PASS | `onClick={() => setDeleteDialogOpen(false)}`; test line 275–291 |
| AC4 — DELETE 204 → navigate + toast | ✅ PASS | `useDeleteContacto.ts` onSuccess + navigate in onClick; tests 293–311 |
| AC5 — Loading state disables buttons + text changes | ✅ PASS | `disabled={deleteMutation.isPending}` + ternary on button text; mock covers |
| AC6 — Backend DELETE 204 / 404 | ✅ PASS | `ContactoEndpoints.cs:80-93`; integration tests 339–379 |

---

## Fix Outcome

- **Action Taken**: Fixed automatically
- **Fixed Count**: 3 (MED-1, LOW-1, LOW-2)
- **Task Count**: 0
- **Tests**: 53/53 pass (+1 new error-handling test)
- **Recommended Status**: `done`

### Changes Applied

| Issue | File | Fix |
|---|---|---|
| MED-1 | `useDeleteContacto.ts` | Added `onError` toast callback |
| MED-1 | `ContactoDetailView.tsx` | Wrapped `mutateAsync()` in try/catch |
| MED-1 | `ContactoDetailView.test.tsx` | Added `does not navigate when delete mutation fails` test |
| LOW-1 | `ContactoEndpointsTests.cs` | `Assert.Null(response.Content.Headers.ContentLength)` |
| LOW-2 | `useDeleteContacto.test.ts` | Added queryClient spy; asserts `invalidateQueries` + `removeQueries` calls |

---

## Status Sync

- **Story File Status**: Updated to `done`
- **Sprint Status YAML**: Synced — `3-5-delete-contact: done`

---

## Code Quality Observations

### Security
- No SQL injection risk: all DB access via EF Core + GUID route constraint `{id:guid}` rejects non-GUID inputs at the routing layer.
- No auth middleware on DELETE — consistent with all other endpoints in this project. Not a Story 3.5 concern.
- No user-supplied data passed to `DeleteAsync` beyond the GUID.

### Performance
- `FindAsync` (tracked entity) is correct for `Remove()`. Single DB round-trip.
- No N+1 query risk.

### Maintainability
- `DeleteContactoCommandHandler` is thin (1 line body) — appropriate for a delete command with no business rules.
- `DeleteContactoResult.cs` exists for Cliente but not for Contacto — correct, since DELETE Contacto returns `bool`, not a DTO.
- Hook placement in `ContactoDetailView` (unconditional) — React Hook Rules compliant.

### Test Quality
- Unit tests: 3 meaningful tests with real assertions ✅
- Integration tests: seeding + HTTP call + status code + content-type assertions ✅ (caveat: LOW-1)
- Frontend hook tests: MSW-based, realistic ✅ (caveat: LOW-2)
- Frontend component tests: 6 behavioral tests with proper mocking of hook ✅
