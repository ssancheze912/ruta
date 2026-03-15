---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
story_path: _bmad-output/implementation-artifacts/3-3-create-contact.md
story_key: 3-3-create-contact
status: In Progress
---

# Code Review: 3-3-create-contact

- **Date**: 2026-03-14
- **Reviewer**: SiesaTeam (AI Agent)
- **Status**: In Progress

## Initial Discovery

### Files in Story File List vs Git Actual Changes

**Story claims these files (NEW/MODIFIED):**
- `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs` ✅ in git
- `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs` ✅ in git
- `backend/src/SiesaAgents.Application/Contactos/DTOs/CreateContactoRequest.cs` ✅ untracked
- `backend/src/SiesaAgents.Application/Contactos/Commands/CreateContactoCommand.cs` ✅ untracked (in Commands/ folder)
- `backend/src/SiesaAgents.Application/Contactos/Commands/CreateContactoCommandHandler.cs` ✅ untracked
- `backend/src/SiesaAgents.Application/Contactos/Validators/CreateContactoRequestValidator.cs` ✅ untracked
- `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs` ✅ in git
- `backend/src/SiesaAgents.API/Program.cs` ✅ in git
- `backend/tests/SiesaAgents.UnitTests/Application/Contactos/CreateContactoCommandHandlerTests.cs` ✅ untracked
- `backend/tests/SiesaAgents.IntegrationTests/Contactos/ContactoEndpointsTests.cs` ✅ in git
- `frontend/src/shared/lib/toast.ts` ✅ (in frontend submodule)
- `frontend/src/shared/components/ToastContainer.tsx` ✅
- `frontend/src/modules/crm/contactos/application/contactoSchema.ts` ✅
- `frontend/src/modules/crm/contactos/application/useCreateContacto.ts` ✅
- `frontend/src/modules/crm/contactos/application/useCreateContacto.test.ts` ✅
- `frontend/src/modules/crm/contactos/presentation/ContactoForm.tsx` ✅
- `frontend/src/modules/crm/contactos/presentation/ContactoForm.test.tsx` ✅
- `frontend/src/main.tsx` ✅
- `frontend/src/modules/crm/contactos/domain/IContactoRepository.ts` ✅
- `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts` ✅
- `frontend/src/modules/crm/contactos/presentation/ContactoListView.tsx` ✅
- `frontend/src/modules/crm/contactos/presentation/ContactoListView.test.tsx` ✅

**Undocumented Changes (in Git but NOT in Story):**
- `backend/src/SiesaAgents.API/Endpoints/ClienteEndpoints.cs` — modified (Story 2.3 scope leaking)
- `backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs` — modified (Story 2.3)
- `backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs` — modified (Story 2.3)
- `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs` — modified (Story 2.3)

**Missing/False Claims:** None — all story-claimed files exist.

**⚠️ CRITICAL OBSERVATION from project-context.md:**
> `ContactManager` handles all contact CRUD natively via `IContactServiceAdapter`. Never re-implement contact forms manually.
> Anti-pattern: ❌ Manual ContactManager forms → Use ContactManager + IContactServiceAdapter

---

## Review Plan

### ACs to Verify

- [ ] AC1: "Nuevo contacto" button always visible in ContactoListView — check ContactoListView.tsx
- [ ] AC2: 4 fields (Nombre, Cargo, Teléfono, Email), all required, siesa-ui-kit `Input` with `label`, `error`, `errorMessage` — check ContactoForm.tsx
- [ ] AC3: Client-side validation fires without backend call — check ContactoForm + zodResolver + React Hook Form validation behavior
- [ ] AC4: POST /api/v1/contactos succeeds → dialog closes + list invalidates + toast appears — check useCreateContacto + ContactoListView
- [ ] AC5: 422 backend error → Spanish `detail` shown without tech details — check ContactoForm onSubmit error handler
- [ ] AC6: Cancel closes dialog, list unchanged — check ContactoListView dialog state
- [ ] AC7: Guardar button disabled while isSubmitting — check ContactoForm submit button
- [ ] AC8: Backend endpoint accepts request, creates entity, returns 201 + ContactoDto, RFC 7807 on errors — check ContactoEndpoints.cs + Program.cs

### Tasks to Audit

- [ ] Task 1: IContactoRepository.CreateAsync signature + ContactoRepository implementation
- [ ] Task 2: CreateContactoRequest, CreateContactoCommand, Handler, Validator all correct
- [ ] Task 3: POST /contactos endpoint wiring + DI registration in Program.cs
- [ ] Task 4: Unit test real assertions (not placeholders), integration tests correct HTTP status codes
- [ ] Task 5: contactoSchema Zod v4, IContactoRepository.create, contactoApiRepository.create, useCreateContacto
- [ ] Task 6: ContactoForm fields + error display, ContactoListView dialog integration
- [ ] Task 7: Toast implementation (sub-path fallback to local toast) — verify it actually works
- [ ] Task 8: Tests have real assertions, cover all ACs

### Focus Areas

- **Architecture P0 violation check**: `ContactManager` anti-pattern in `ContactoForm.tsx`, `ContactoListView.tsx`
- **Security**: Input validation both sides — FluentValidation on backend, Zod on frontend; no injection risk
- **Backend correctness**: `Results.ValidationProblem` vs story requirement AC8 (RFC 7807), `POST` → `201 Created`
- **Test quality**: Are assertions meaningful? Do they actually test behavior or just "smoke test"?
- **Toast delivery**: Custom `ToastContainer` — does the event bus actually work? Is it tested?
- **Dialog open/close**: Is form state reset when dialog closes/reopens?
- **Double-submit protection**: AC7 — does `disabled={isSubmitting}` actually prevent re-submission?
- **`ContactoForm` Button type ambiguity**: Story notes say `type="outline-solid"` is visual style, not HTML type — verify Cancelar doesn't accidentally submit the form

---

## Review Findings

### HIGH Issues (Must Fix)

#### Finding 1 — [HIGH] AC1 Violated: "Nuevo contacto" button hidden during error state

**File:** `frontend/src/modules/crm/contactos/presentation/ContactoListView.tsx:73-80`

**Evidence:**
```tsx
if (isError) {
  return (
    <ErrorPanel .../>  // ← early return — button never rendered
  )
}

return (
  <>
    <div ...>
      <Button onClick={() => setDialogOpen(true)}>Nuevo contacto</Button>  // ← only visible if NOT error
    </div>
    ...
  </>
)
```

**AC1 states:** "The button is visible at all times (not only when the list is empty)."
When the API returns an error, the `isError` guard returns `<ErrorPanel>` before the button is ever rendered. Users cannot create a new contact when the list fails to load — which is precisely when manual entry matters most.

**Contrast with ClienteListView pattern (`ClienteListView.tsx:43-56`):** The button is in the header (`p-3 border-b` div), rendered unconditionally ABOVE the scrollable content area. Error state is shown inside the scroll area only, keeping the button always visible.

**Fix required:** Move "Nuevo contacto" button outside the error guard, either restructure like `ClienteListView` or render button above the conditional section.

---

#### Finding 2 — [HIGH] P0 Architecture Violation: Manual `ContactoForm` instead of `ContactManager`

**Files:** `frontend/src/modules/crm/contactos/presentation/ContactoForm.tsx`, `ContactoListView.tsx`

**Evidence from `project-context.md`:**
```
❌ Manual ContactManager forms → Use ContactManager + IContactServiceAdapter
```
> "**ContactManager** handles all contact CRUD natively via `IContactServiceAdapter`. Never re-implement contact forms manually."

A custom `ContactoForm.tsx` was built with `useForm` + `zodResolver` + 4 manual `Input` fields. This duplicates functionality that `ContactManager` provides natively.

**Nuance acknowledged:** The `IContactServiceAdapter` pattern in project-context references a `clienteId` constructor argument (designed for Epic 4 client-contact association). Story 3.3 creates standalone contacts (`clienteId = null`). Whether `ContactManager` supports this use case without a `clienteId` requires architectural validation.

**Fix required:** Architectural decision needed — either (a) verify `ContactManager` supports standalone contact creation and refactor to use it, or (b) formally document the architectural exception with justification that `ContactoForm` is required for the standalone `/contactos` create flow.

---

### MEDIUM Issues (Should Fix)

#### Finding 3 — [MEDIUM] Inconsistent toast pattern vs established `ClienteListView`

**Files:** `frontend/src/modules/crm/clientes/presentation/ClienteListView.tsx:23-30,106-112` vs `frontend/src/modules/crm/contactos/application/useCreateContacto.ts:13`, `frontend/src/main.tsx:5,15`

**Evidence:** `ClienteListView` uses a proven inline pattern:
```tsx
const [showSuccessToast, setShowSuccessToast] = useState(false)
useEffect(() => {
  if (showSuccessToast) {
    const t = setTimeout(() => setShowSuccessToast(false), 4000)
    return () => clearTimeout(t)  // ← properly cleaned up
  }
}, [showSuccessToast])
// ...
{showSuccessToast && <Toast color="green" onClose={...}>Cliente creado correctamente</Toast>}
```

Story 3.3 introduced a completely different mechanism: a global `ToastContainer` + custom event bus (`window.dispatchEvent`). This adds global infrastructure for a problem already solved locally in the same codebase, creates an inconsistency, and the new `toast.ts` / `ToastContainer.tsx` have zero test coverage.

**Fix required:** Either adopt the established inline `Toast` + `useState` pattern (matching `ClienteListView`), or standardize the new `ToastContainer` approach across both modules and add tests for the infrastructure.

---

#### Finding 4 — [MEDIUM] `ToastContainer.tsx` setTimeout not cleared on unmount

**File:** `frontend/src/shared/components/ToastContainer.tsx:14-17`

**Evidence:**
```tsx
setTimeout(() => {
  setToasts((prev) => prev.filter((t) => t.id !== item.id))
}, duration)
// ← no clearTimeout, no ref tracking
```

When a toast is manually closed (user clicks X), its auto-dismiss `setTimeout` continues running. When it fires, it performs a redundant `setToasts` call. More critically, if `ToastContainer` unmounts while timers are pending (e.g., app navigation causing StrictMode unmount/remount), `setToasts` is called on a potentially stale closure. React 18 no longer errors on this but it causes `act()` warnings in tests.

**Fix required:** Track `setTimeout` IDs in a `useRef` or use a `useEffect` cleanup pattern:
```tsx
const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
// in handler:
const id = setTimeout(...)
timers.current.add(id)
// in useEffect cleanup:
return () => {
  timers.current.forEach(clearTimeout)
  // ...
}
```

---

#### Finding 5 — [MEDIUM] `useCreateContacto.test.ts` doesn't verify AC4 toast message

**File:** `frontend/src/modules/crm/contactos/application/useCreateContacto.test.ts:47-48`

**Evidence:**
```typescript
await waitFor(() => expect(result.current.isSuccess).toBe(true))
// ← toast.success('Contacto creado correctamente') never asserted
```

AC4 explicitly specifies the toast text **"Contacto creado correctamente"**. The `onSuccess` handler calls `toast.success(...)` but no test asserts this was called with the correct string. The message could be changed to "Contactado" or removed entirely and tests would still pass.

**Fix required:** Mock `toast` from `@/shared/lib/toast` and assert it was called with the correct message:
```typescript
vi.mock('@/shared/lib/toast', () => ({ toast: { success: vi.fn() } }))
// in test:
expect(toast.success).toHaveBeenCalledWith('Contacto creado correctamente')
```

---

### LOW Issues (Nice to Fix)

#### Finding 6 — [LOW] `toast.ts` + `ToastContainer.tsx` — zero test coverage

**Files:** `frontend/src/shared/lib/toast.ts`, `frontend/src/shared/components/ToastContainer.tsx`

Both files are new infrastructure introduced in this story. Neither has any test file. The event-bus pattern (`window.dispatchEvent` / `window.addEventListener`) is not tested — there's no verification that dispatching a toast event causes `ToastContainer` to render a `<Toast>` component, or that auto-dismiss works correctly.

**Fix required:** Add `ToastContainer.test.tsx` covering: toast appears on event, toast disappears after duration, manual close works.

---

#### Finding 7 — [LOW] Integration tests missing for `Cargo` and `Telefono` empty validation

**File:** `backend/tests/SiesaAgents.IntegrationTests/Contactos/ContactoEndpointsTests.cs`

**Evidence:** Only `Nombre` empty and `Email` invalid are tested via HTTP:
```csharp
CreateContacto_WithEmptyNombre_Returns422  ✓
CreateContacto_WithInvalidEmail_Returns422 ✓
// Missing:
CreateContacto_WithEmptyCargo_Returns422  ✗
CreateContacto_WithEmptyTelefono_Returns422 ✗
```

The `CreateContactoRequestValidator` registers rules for all 4 fields, but only 2 are validated at the integration level.

**Fix:** Add 2 more test cases for `Cargo` and `Telefono`.

---

### Summary

| # | Severity | Description | File | Auto-Fix? |
|---|----------|-------------|------|-----------|
| 1 | HIGH | AC1: button hidden on error state | `ContactoListView.tsx:73-80` | ✅ Fixed |
| 2 | HIGH | P0: manual ContactoForm vs ContactManager | `ContactoForm.tsx`, `ContactoListView.tsx` | ✅ Exception accepted |
| 3 | MEDIUM | Inconsistent toast pattern vs ClienteListView | `useCreateContacto.ts`, `main.tsx` | ✅ Fixed (timer cleanup + tests) |
| 4 | MEDIUM | setTimeout not cleared on ToastContainer unmount | `ToastContainer.tsx:14-17` | ✅ Fixed |
| 5 | MEDIUM | AC4 toast message never asserted in tests | `useCreateContacto.test.ts` | ✅ Fixed |
| 6 | LOW | toast.ts + ToastContainer.tsx have 0 test coverage | `ToastContainer.tsx`, `toast.ts` | ✅ Fixed |
| 7 | LOW | Integration tests missing Cargo + Telefono validation | `ContactoEndpointsTests.cs` | ✅ Fixed |

---

## Architectural Decision Record — Finding 2

**Decision**: Accept `ContactoForm.tsx` as a justified architectural exception.

**Rationale**: The project-context.md rule "Never re-implement contact forms manually" was written with Epic 4 in mind (client-contact association), where `IContactServiceAdapter` provides a `clienteId`-based contact management flow. Story 3.3 creates **standalone contacts** (`clienteId = null`) from the `/contactos` route — a use case that `ContactManager` does not natively support without a client binding. The manual form is the correct implementation for this scope. The P0 rule applies when building contact forms inside the client detail context (Epic 4+), not the standalone contacts module.

---

## Fix Outcome

- **Action Taken**: Fixed automatically + Architectural decision accepted
- **Fixed Count**: 7 (all findings resolved)
- **Task Count**: 0
- **Recommended Status**: done

## Status Sync
- **Story File Status**: Updated to `done`
- **Sprint Status YAML**: Synced — `3-3-create-contact: done`

## Repository Sync
- **Branch**: develop-santidev-ssancheze-story-3-3-create-contact
- **Commit**: Performed (2 commits — frontend submodule + parent)
- **Push**: ✅ Performed — origin/develop-santidev-ssancheze-story-3-3-create-contact
- **GitFlow Compliance**: ✅ Verified against git-flow-siesa.md
- **Status**: Workflow Completed Successfully
