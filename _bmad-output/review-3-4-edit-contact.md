---
stepsCompleted: [1,2,3,4,5,6]
story_path: _bmad-output/implementation-artifacts/3-4-edit-contact.md
story_key: 3-4-edit-contact
status: in-progress
date: 2026-03-14
reviewer: SiesaTeam (AI Agent)
---

# Code Review: 3-4-edit-contact

- **Date**: 2026-03-14
- **Reviewer**: SiesaTeam (AI Agent)
- **Status**: In Progress

## Initial Discovery

### Story Files Claimed (Dev Agent Record)
**New files:**
- `backend/src/SiesaAgents.Application/Contactos/DTOs/UpdateContactoRequest.cs`
- `backend/src/SiesaAgents.Application/Contactos/Commands/UpdateContactoCommand.cs`
- `backend/src/SiesaAgents.Application/Contactos/Commands/UpdateContactoCommandHandler.cs`
- `backend/src/SiesaAgents.Application/Contactos/Validators/UpdateContactoRequestValidator.cs`
- `backend/tests/SiesaAgents.UnitTests/Application/Contactos/UpdateContactoCommandHandlerTests.cs`
- `frontend/src/modules/crm/contactos/application/useUpdateContacto.ts`
- `frontend/src/modules/crm/contactos/application/useUpdateContacto.test.ts`

**Modified files:**
- `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs`
- `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs`
- `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs`
- `backend/src/SiesaAgents.API/Program.cs`
- `backend/tests/SiesaAgents.IntegrationTests/Contactos/ContactoEndpointsTests.cs`
- `frontend/src/modules/crm/contactos/application/contactoSchema.ts`
- `frontend/src/modules/crm/contactos/domain/IContactoRepository.ts`
- `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts`
- `frontend/src/modules/crm/contactos/presentation/ContactoForm.tsx`
- `frontend/src/modules/crm/contactos/presentation/ContactoForm.test.tsx`
- `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx`
- `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx`

### Git Reality
- **Story 3.4 backend new files**: All present as untracked (??) ✅
- **Story 3.4 backend modified files**: All present as modified (M) ✅
- **Frontend changes**: Tracked inside `frontend` submodule (shows as submodule modified) ✅
- **Undocumented changes in git**: `ClienteEndpoints.cs`, `IClienteRepository.cs`, `ClienteRepository.cs`, `ClienteEndpointsTests.cs` + Clientes untracked files → These belong to **Story 2.4** (concurrent work), NOT Story 3.4 ✅ not a concern
- **False claims**: None detected ✅
- **Missing documentation**: None detected ✅

## Review Plan

### Items to Verify

**Acceptance Criteria:**
- [ ] AC1: "Editar" button visible only when contacto loaded (not during loading/error/404) — check `ContactoDetailView.tsx` conditional render
- [ ] AC2: Pre-filled form with 4 fields (Nombre, Cargo, Teléfono, Email) using `siesa-ui-kit` `Input` with `label` prop — check `ContactoForm.tsx` defaultValues + props
- [ ] AC3: Client-side validation on empty submit — check Zod schema + RHF error display, NO backend call
- [ ] AC4: Successful PUT, dialog closes, list + detail refresh, success toast — check `useUpdateContacto.ts` invalidation, `onSuccess` flow
- [ ] AC5: Backend 422/400 `detail` shown in form — check error catch in `ContactoForm.tsx`
- [ ] AC6: Cancelar closes without saving — check `onCancel` handler
- [ ] AC7: Guardar disabled while submitting — check `mutation.isPending`
- [ ] AC8: `PUT /api/v1/contactos/{id}` — FluentValidation → handler → UpdateAsync → 200/404 — check `ContactoEndpoints.cs`, `UpdateContactoCommandHandler.cs`, `IContactoRepository.cs`

**Tasks:**
- [ ] Task 1: `UpdateAsync` signature correct in interface + FindAsync (not AsNoTracking) in implementation
- [ ] Task 2: `UpdateContactoRequest`, `UpdateContactoCommand`, `UpdateContactoCommandHandler`, `UpdateContactoRequestValidator` — correct namespace/structure
- [ ] Task 3: PUT endpoint registered, DI `UpdateContactoCommandHandler` registered in Program.cs
- [ ] Task 4: Unit tests have real assertions (not placeholders); integration tests cover 200/404/422
- [ ] Task 5: `useUpdateContacto` dual invalidation (`['contactos']` + `['contactos', contactoId]`), toast message correct
- [ ] Task 6: `ContactoForm` calls both hooks unconditionally; `mutation = contactoId ? updateMutation : createMutation`
- [ ] Task 7: "Editar" button only renders post-data-load (after `if (!contacto) return null`)
- [ ] Task 8: `useUpdateContacto.test.ts` mocks toast; form tests mock `useUpdateContacto`; detail view tests mock `ContactoForm`

### Focus Areas

**Security checks on:**
- `ContactoEndpoints.cs` — input validation before handler call
- `UpdateContactoRequestValidator.cs` — validation rules complete/correct

**Performance checks on:**
- `ContactoRepository.cs` — `UpdateAsync` uses `FindAsync`, no N+1
- `useUpdateContacto.ts` — dual `invalidateQueries` scope

**React Hook compliance:**
- `ContactoForm.tsx` — both hooks called unconditionally (Rules of Hooks)

**P0 Rule compliance:**
- All UI text in Spanish
- `siesa-ui-kit` components used (not custom)
- No `DateTime` in backend (DateTimeOffset only)

---

## Review Findings

### AC & Task Verification Summary

| Item | Status | Notes |
|---|---|---|
| AC1 — Editar button guard | ✅ | Only after `if (!contacto) return null` |
| AC2 — Pre-filled form, siesa-ui-kit Inputs | ✅ | `defaultValues` to `useForm`, Input with `label` prop |
| AC3 — Client-side validation, no backend call | ✅ | Zod + RHF errors |
| AC4 — PUT, dialog closes, dual refresh, toast | ✅ | `invalidateQueries` both keys, `onSuccess → setEditDialogOpen(false)` |
| AC5 — Backend error displayed in form | ✅ | `axios.isAxiosError` catch, `setError('root', ...)` |
| AC6 — Cancelar closes without saving | ✅ | `onCancel` handler, no mutation called |
| AC7 — Guardar disabled while submitting | ✅ | `disabled={mutation.isPending}` |
| AC8 — PUT endpoint: validation → handler → 200/404 | ✅ | FluentValidation, `UpdateContactoCommandHandler`, `ContactoRepository.UpdateAsync` |
| Task 1 — `UpdateAsync` with `FindAsync` (tracked) | ✅ | `context.Contactos.FindAsync([id], ct)` — no AsNoTracking |
| Task 2 — App layer files | ✅ | All 4 files present |
| Task 3 — PUT endpoint + DI | ✅ | `UpdateContactoCommandHandler` registered line 56 |
| Task 4 — Backend tests | ✅ | 3 unit + 3 integration |
| Task 5 — Schema aliases + `useUpdateContacto` | ⚠️ | Aliases unused — see Finding 1 |
| Task 6 — `ContactoForm` dual hooks | ✅ | Both hooks unconditional |
| Task 7 — Editar dialog | ✅ | After `if (!contacto) return null` guard |
| Task 8 — Frontend tests | ⚠️ | `onSuccess` not asserted in edit mode — see Finding 3 |

---

### Medium Issues (Should Fix)

**Finding 1 — [MED] Schema aliases added in Task 5.1 are completely unused**

`contactoSchema.ts` exports `contactoSchema` and `ContactoFormValues` as aliases, but neither `ContactoForm.tsx` nor `useUpdateContacto.ts` imports them. Both still use `createContactoSchema` / `CreateContactoFormValues`. Task 5.1 added dead exports with no consumer.

- `useUpdateContacto.ts:4`: `import type { CreateContactoFormValues } from './contactoSchema'` → should be `ContactoFormValues`
- `ContactoForm.tsx:5`: `import { createContactoSchema, type CreateContactoFormValues }` → should use `contactoSchema`, `ContactoFormValues`

The alias was meant to decouple the form from "create" semantics — currently the update hook types are named after "create".

---

**Finding 2 — [MED] `ContactoDetailView.test.tsx` mock of `ContactoForm` doesn't expose `onSuccess` — AC4 "dialog closes on success" is untested**

The mock:
```tsx
vi.mock('./ContactoForm', () => ({
  ContactoForm: ({ onCancel }: { onCancel: () => void }) => (...)
}))
```

Only `onCancel` is exposed. There is no test that calls `onSuccess()` and verifies `editDialogOpen` becomes `false` (dialog closes). AC4 states "the dialog closes" after a successful update — this is only tested at the form level, not at the view level where `onSuccess={() => setEditDialogOpen(false)}` is wired.

**Fix**: Expose `onSuccess` in mock and add a test: click Editar → dialog opens → call `onSuccess` → dialog closes.

---

**Finding 3 — [MED] `ContactoForm.test.tsx` edit-mode submit test doesn't assert `onSuccess` was called**

Test `'calls update mutation not create when contactoId is provided'` (line 171) only asserts `updateMutateAsync` was called. It does NOT assert `onSuccess` was called — meaning if `onSuccess()` were removed from `onSubmit`, the test would still pass.

The create-mode test (`'calls mutateAsync with form data on valid submit (create mode)'`) correctly asserts `onSuccess`. Parity is missing for edit mode.

---

### Low Issues (Nice to Fix)

**Finding 4 — [LOW] `UpdateContactoCommandHandlerTests` — weak Id assertion in `WhenFound_ReturnsMappedDto`**

Line 43: `Assert.NotEqual(Guid.Empty, result.Id)` — This only verifies the Id is non-empty, not that it equals `entity.Id`. The mock entity's Id is auto-generated (different from the command's `id`). The handler maps `updated.Id` → the assertion should be `Assert.Equal(entity.Id, result.Id)` to verify the handler maps the entity's actual Id to the DTO.

As-is, this test would pass even if the handler returned the wrong Id.

**Fix**: Capture `entity.Id` before the mock and assert `Assert.Equal(entity.Id, result.Id)`.

---

**Finding 5 — [LOW] `UpdateContactoRequestValidator.cs` — `Telefono` uses `MaximumLength(50)` but story spec says `MaximumLength(200)`**

Story Task 2.4 specifies `MaximumLength(200)` for Telefono in `UpdateContactoRequestValidator`. Implementation uses `MaximumLength(50)`, mirroring `CreateContactoRequestValidator`. 50 is a more appropriate domain constraint for phone numbers, and consistency with Create is desirable — but the spec deviation should be acknowledged.

This is a spec inconsistency (not a bug). 50 is arguably correct.

---

### P0 Rule Compliance

| Rule | Status |
|---|---|
| siesa-ui-kit first | ✅ Input, Button, DescriptionList — no custom UI |
| Spanish UI text | ✅ Editar, Guardar, Cancelar, Guardando..., Volver, Contacto actualizado correctamente |
| DateTimeOffset | ✅ No DateTime usage |
| Scalar, never Swagger | ✅ |
| UUID PKs | ✅ |
| Problem Details RFC 7807 | ✅ 404 via `Results.Problem`, 422 via `Results.ValidationProblem` |
| ContactManager exception | ✅ Accepted architectural exception (ADR in review-3-3) |
| React Hook Rules | ✅ Both hooks called unconditionally |

---

### Outcome

**Changes Requested** — 3 medium findings, 2 low. No critical or high severity issues.

The backend implementation is solid. The frontend architecture (dual hooks, conditional mutation, defaultValues, dual invalidation) is correct. Findings are focused on test coverage gaps and unused code from an incomplete refactor of schema naming.

---

## Fix Outcome

- **Action Taken**: Fixed automatically
- **Fixed Count**: 3 (all Medium findings)
- **Remaining**: 2 Low findings (accepted as-is)
- **Recommended Status**: done

### Fixes Applied

| Finding | Fix |
|---|---|
| Finding 1 — Schema aliases unused | `useUpdateContacto.ts`: `CreateContactoFormValues` → `ContactoFormValues`. `ContactoForm.tsx`: `createContactoSchema` → `contactoSchema`, `CreateContactoFormValues` → `ContactoFormValues` |
| Finding 2 — AC4 dialog-closes untested | `ContactoDetailView.test.tsx`: mock `ContactoForm` now exposes `onSuccess`; added test `'closes dialog when form onSuccess is called (AC4)'` |
| Finding 3 — Edit-mode `onSuccess` not asserted | `ContactoForm.test.tsx`: added `expect(onSuccess).toHaveBeenCalledOnce()` to edit-mode submit test |

### Verification

- `npx vitest run src/modules/crm/contactos/` — **44/44 pass** (7 files) ✅
- `dotnet build` — **0 errors** ✅

---

## Status Sync

- **Story File Status**: Updated to `done`
- **Sprint Status YAML**: Synced — `3-4-edit-contact` → `done`
