---
stepsCompleted: [1,2,3,4,5]
status: ready-for-dev
epic: 3
story: 4
storyKey: 3-4-edit-contact
createdAt: '2026-03-14'
---

# Story 3.4: Edit Contact

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to edit any field of an existing contact,
So that the contact information stays current.

## Acceptance Criteria

1. **AC1 — "Editar" Button**: A "Editar" button is visible on `ContactoDetailView` when contact data has loaded (not during loading skeleton, error states, or 404). Clicking it opens a modal dialog. (FR14)

2. **AC2 — Pre-filled Form**: The edit dialog contains four fields: **Nombre**, **Cargo**, **Teléfono**, **Email** — all required — each using the `Input` component from `siesa-ui-kit` with the `label` prop. Each field is pre-populated with the contact's current values when the dialog opens. (FR14)

3. **AC3 — Client-side Validation**: When the user submits with one or more empty required fields, inline error messages appear below the empty fields. The form is NOT submitted to the backend. (FR16)

4. **AC4 — Successful Update**: When all fields are filled and the form is submitted, the contact is updated via `PUT /api/v1/contactos/:id`, the dialog closes, the contact list AND detail view refresh immediately showing the updated values, and a success toast "Contacto actualizado correctamente" appears. (FR27)

5. **AC5 — Backend Validation Error**: When the backend returns a 422/400 error, the `detail` field from the Problem Details response body is displayed inside the form in Spanish, without exposing technical details. (NFR6)

6. **AC6 — Cancel**: A "Cancelar" button closes the dialog without saving. The contact data remains unchanged.

7. **AC7 — Loading State**: While the form is submitting, the "Guardar" button is disabled to prevent double submission.

8. **AC8 — Backend: PUT /api/v1/contactos/{id}**: The endpoint accepts `UpdateContactoRequest` (Nombre, Cargo, Teléfono, Email), validates it via FluentValidation (same rules as Create), finds the entity by ID, calls `entity.Update(...)`, and returns `200 OK` with the updated `ContactoDto`. Returns `404` Problem Details if the contact is not found. Follows RFC 7807 on validation errors. (FR14)

## Tasks / Subtasks

### Backend

- [ ] Task 1: Extend Domain + Infrastructure (AC: 8)
  - [ ] 1.1 Add `UpdateAsync` to `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs`:
    ```csharp
    Task<ContactoEntity?> UpdateAsync(Guid id, string nombre, string cargo, string telefono, string email, CancellationToken ct = default);
    ```
  - [ ] 1.2 Implement `UpdateAsync` in `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs`:
    ```csharp
    public async Task<ContactoEntity?> UpdateAsync(Guid id, string nombre, string cargo, string telefono, string email, CancellationToken ct = default)
    {
        var entity = await context.Contactos.FindAsync([id], ct); // tracked — NOT AsNoTracking
        if (entity is null) return null;
        entity.Update(nombre, cargo, telefono, email, entity.ClienteId); // preserves ClienteId
        await context.SaveChangesAsync(ct);
        return entity;
    }
    ```
    > ⚠️ **Important**: Must use `FindAsync` (no `AsNoTracking`) so EF Core tracks the entity for update. `entity.Update(...)` calls the existing domain method on `ContactoEntity` which sets `UpdatedAt = DateTimeOffset.UtcNow`.

- [ ] Task 2: Create Application Layer (AC: 8)
  - [ ] 2.1 Create `backend/src/SiesaAgents.Application/Contactos/DTOs/UpdateContactoRequest.cs`:
    ```csharp
    namespace SiesaAgents.Application.Contactos.DTOs;
    public record UpdateContactoRequest(string Nombre, string Cargo, string Telefono, string Email);
    ```
  - [ ] 2.2 Create `backend/src/SiesaAgents.Application/Contactos/Commands/UpdateContactoCommand.cs`:
    ```csharp
    namespace SiesaAgents.Application.Contactos.Commands;
    public record UpdateContactoCommand(Guid Id, string Nombre, string Cargo, string Telefono, string Email);
    ```
  - [ ] 2.3 Create `backend/src/SiesaAgents.Application/Contactos/Commands/UpdateContactoCommandHandler.cs`:
    ```csharp
    public class UpdateContactoCommandHandler(IContactoRepository repository)
    {
        public async Task<ContactoDto?> HandleAsync(UpdateContactoCommand command, CancellationToken ct = default)
        {
            var updated = await repository.UpdateAsync(
                command.Id, command.Nombre, command.Cargo, command.Telefono, command.Email, ct);
            if (updated is null) return null;
            return new ContactoDto(
                updated.Id, updated.Nombre, updated.Cargo, updated.Telefono, updated.Email,
                updated.ClienteId, updated.CreatedAt, updated.UpdatedAt);
        }
    }
    ```
  - [ ] 2.4 Create `backend/src/SiesaAgents.Application/Contactos/Validators/UpdateContactoRequestValidator.cs` — same rules as `CreateContactoRequestValidator`: `NotEmpty()` + `MaximumLength(200)` for Nombre/Cargo/Telefono; `NotEmpty()` + `EmailAddress()` + `MaximumLength(254)` for Email:
    ```csharp
    public class UpdateContactoRequestValidator : AbstractValidator<UpdateContactoRequest>
    {
        public UpdateContactoRequestValidator()
        {
            RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Cargo).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Telefono).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(254);
        }
    }
    ```

- [ ] Task 3: Extend API Layer (AC: 8)
  - [ ] 3.1 Add `PUT /contactos/{id}` to `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs` inside `MapContactoEndpoints`, after the `POST` handler:
    ```csharp
    group.MapPut("/contactos/{id:guid}", async (
        Guid id,
        UpdateContactoRequest request,
        IValidator<UpdateContactoRequest> validator,
        UpdateContactoCommandHandler handler,
        CancellationToken ct) =>
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var result = await handler.HandleAsync(
            new UpdateContactoCommand(id, request.Nombre, request.Cargo, request.Telefono, request.Email), ct);

        return result is null
            ? Results.Problem(statusCode: StatusCodes.Status404NotFound, title: "Not Found", detail: "Contacto no encontrado.")
            : Results.Ok(result);
    })
    .WithName("UpdateContacto")
    .WithSummary("Actualiza un contacto existente")
    .Produces<ContactoDto>()
    .ProducesProblem(StatusCodes.Status404NotFound)
    .ProducesValidationProblem();
    ```
    > Add usings: `SiesaAgents.Application.Contactos.DTOs` and `SiesaAgents.Application.Contactos.Commands` are already imported.
  - [ ] 3.2 Register `UpdateContactoCommandHandler` as scoped in `backend/src/SiesaAgents.API/Program.cs` (under `// Contactos — DI` section):
    ```csharp
    builder.Services.AddScoped<UpdateContactoCommandHandler>();
    ```
    > `UpdateContactoRequestValidator` auto-registers via `AddValidatorsFromAssemblyContaining<CreateClienteCommandHandler>()` — no explicit registration needed.

- [ ] Task 4: Backend Tests (AC: 8)
  - [ ] 4.1 Create `backend/tests/SiesaAgents.UnitTests/Application/Contactos/UpdateContactoCommandHandlerTests.cs` — NSubstitute mocks:
    - `UpdateContacto_WhenFound_ReturnsMappedDto` — mock `UpdateAsync` returning entity → verify DTO fields match
    - `UpdateContacto_WhenNotFound_ReturnsNull` — mock `UpdateAsync` returning null → verify handler returns null
    - `UpdateContacto_MapsCommandFieldsCorrectly` — verify all 5 arguments (id, nombre, cargo, telefono, email) passed to `repository.UpdateAsync`
  - [ ] 4.2 Add 3 integration tests to `backend/tests/SiesaAgents.IntegrationTests/Contactos/ContactoEndpointsTests.cs`:
    - `UpdateContacto_WithValidData_Returns200WithUpdatedValues` — seed entity, PUT with changed values, assert 200 + updated fields in response
    - `UpdateContacto_WithNonExistentId_Returns404` — PUT with random Guid, assert 404 + `application/problem+json` content-type
    - `UpdateContacto_WithEmptyNombre_Returns422` — PUT with empty Nombre, assert 422
  - [ ] 4.3 `dotnet build` — 0 errors ✅
  - [ ] 4.4 `dotnet test tests/SiesaAgents.UnitTests` — all pass ✅ (integration tests require Docker)

### Frontend

- [ ] Task 5: Schema + Update Mutation Hook (AC: 3, 4, 5)
  - [ ] 5.1 Update `frontend/src/modules/crm/contactos/application/contactoSchema.ts` — add exports for shared use in both create and edit:
    ```typescript
    // Add below existing exports:
    export const contactoSchema = createContactoSchema
    export type ContactoFormValues = CreateContactoFormValues
    ```
    > `createContactoSchema` and `CreateContactoFormValues` remain unchanged for backward compatibility with `ContactoForm.tsx` and `useCreateContacto.ts`.
  - [ ] 5.2 Add `update` to `frontend/src/modules/crm/contactos/domain/IContactoRepository.ts`:
    ```typescript
    update(id: string, data: { nombre: string; cargo: string; telefono: string; email: string }): Promise<Contacto>
    ```
  - [ ] 5.3 Add `update` implementation to `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts`:
    ```typescript
    async update(id: string, data: { nombre: string; cargo: string; telefono: string; email: string }): Promise<Contacto> {
      const response = await apiClient.put<Contacto>(`/contactos/${id}`, data)
      return response.data
    }
    ```
  - [ ] 5.4 Create `frontend/src/modules/crm/contactos/application/useUpdateContacto.ts`:
    ```typescript
    import { useMutation, useQueryClient } from '@tanstack/react-query'
    import { toast } from '@/shared/lib/toast'
    import { contactoRepository } from '../infrastructure/contactoApiRepository'
    import type { CreateContactoFormValues } from './contactoSchema'

    export function useUpdateContacto(contactoId: string) {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: (data: CreateContactoFormValues) => contactoRepository.update(contactoId, data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['contactos'] })
          queryClient.invalidateQueries({ queryKey: ['contactos', contactoId] })
          toast.success('Contacto actualizado correctamente')
        },
      })
    }
    ```

- [ ] Task 6: Extend ContactoForm for Edit Mode (AC: 2, 3, 4, 5, 6, 7)
  - [ ] 6.1 Update `frontend/src/modules/crm/contactos/presentation/ContactoForm.tsx` — extend props interface and form logic:
    ```typescript
    interface ContactoFormProps {
      onSuccess: () => void
      onCancel: () => void
      contactoId?: string                      // if provided → edit mode
      defaultValues?: CreateContactoFormValues  // pre-fill fields in edit mode
    }
    ```
    - Pass `defaultValues` to `useForm({ resolver: zodResolver(createContactoSchema), defaultValues })`
    - Conditionally use mutation:
      ```typescript
      const createMutation = useCreateContacto()
      const updateMutation = useUpdateContacto(contactoId ?? '')
      const mutation = contactoId ? updateMutation : createMutation
      ```
    - Replace `createMutation.mutateAsync(data)` with `mutation.mutateAsync(data)` in `onSubmit`
    - Replace `isSubmitting` with `mutation.isPending` for button disabled state
    > ⚠️ `useUpdateContacto('')` is called even in create mode — this is a no-op since the form won't submit in edit mode when `contactoId` is undefined. Alternatively, use `useCreateContacto()` and `useUpdateContacto(contactoId!)` conditionally — but React hook rules prohibit conditional hooks. The `''` fallback is safe since the mutation is never called when `contactoId` is undefined.

- [ ] Task 7: Add Edit Dialog to ContactoDetailView (AC: 1, 2, 4, 6)
  - [ ] 7.1 Update `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx`:
    - Add imports: `useState` (already via React), `Dialog, DialogContent, DialogHeader, DialogTitle` from `@/components/ui/dialog`, `ContactoForm` from `./ContactoForm`
    - Add state: `const [editDialogOpen, setEditDialogOpen] = useState(false)`
    - In the header `div` (the `flex items-center justify-between mb-6` container), add "Editar" button between the `<h1>` and "Volver" button — the button is only present when `contacto` is defined (i.e., inside the `if (!contacto) return null` guard, in the return below):
      ```tsx
      <Button onClick={() => setEditDialogOpen(true)}>Editar</Button>
      ```
    - Add `<Dialog>` at the bottom of the returned JSX (before closing `</div>`):
      ```tsx
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar contacto</DialogTitle>
          </DialogHeader>
          <ContactoForm
            contactoId={contactoId}
            defaultValues={{
              nombre: contacto.nombre,
              cargo: contacto.cargo,
              telefono: contacto.telefono,
              email: contacto.email,
            }}
            onSuccess={() => setEditDialogOpen(false)}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      ```
    > `useUpdateContacto` in `ContactoForm` invalidates `['contactos', contactoId]` on success, which triggers `useContacto(contactoId)` to refetch automatically — the detail view updates without manual `refetch()`.

- [ ] Task 8: Frontend Tests (AC: 1, 2, 3, 4, 5, 6, 7)
  - [ ] 8.1 Create `frontend/src/modules/crm/contactos/application/useUpdateContacto.test.ts`:
    - Mock `@/shared/lib/toast` with `vi.mock`
    - `returns updated contacto on 200` — MSW `http.put` returns 200 + updated body → assert `isSuccess`, `toast.success` called with `'Contacto actualizado correctamente'`
    - `sets isError true on 422` — MSW `http.put` returns 422 → assert `isError`
    - `sets isError true on 404` — MSW `http.put` returns 404 → assert `isError`
  - [ ] 8.2 Update `frontend/src/modules/crm/contactos/presentation/ContactoForm.test.tsx` — add edit-mode tests:
    - `pre-fills fields with defaultValues in edit mode` — render with `contactoId` + `defaultValues`, assert Input values match
    - `calls update mutation not create when contactoId is provided` — mock both hooks, submit, assert update mutation called
    - `shows backend error from 422 in edit mode` — mock 422 from MSW, submit, assert error message visible
  - [ ] 8.3 Create `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx`:
    - Mock `useContacto` returning a contact
    - `renders Editar button when contact is loaded` — assert `getByText('Editar')` visible
    - `opens edit dialog when Editar is clicked` — click "Editar", assert dialog title visible + form pre-filled
    - `closes dialog when Cancelar is clicked` — open dialog, click "Cancelar", assert dialog not visible
    - `does not render Editar button during loading` — mock `isLoading: true`, assert button not present
    - `does not render Editar button on error` — mock `isError: true`, assert button not present
  - [ ] 8.4 `npx vitest run src/modules/crm/contactos/` — all tests pass ✅

## Dev Notes

### Architecture Patterns

- **Backend pattern**: `PUT /api/v1/contactos/{id}` → FluentValidation → `UpdateContactoCommandHandler` → `IContactoRepository.UpdateAsync` → `ContactoEntity.Update(...)` → `SaveChangesAsync` → `200 OK + ContactoDto`
- **`ContactoEntity.Update(...)`** already exists with `private set` on `UpdatedAt` — call `entity.Update(nombre, cargo, telefono, email, entity.ClienteId)` to preserve `ClienteId` (Epic 4 concern)
- **`GetByIdAsync` uses `AsNoTracking`** — `UpdateAsync` MUST use `FindAsync` (tracked) internally, NOT `GetByIdAsync`, to enable EF Core change tracking
- **Validator auto-registration**: `AddValidatorsFromAssemblyContaining<CreateClienteCommandHandler>()` in `Program.cs` scans all validators in the Application assembly — `UpdateContactoRequestValidator` registers automatically; only `UpdateContactoCommandHandler` needs explicit `AddScoped<>()`
- **React Hook Form + defaultValues**: Passing `defaultValues` to `useForm` pre-fills fields on mount. Since Dialog uses `keepMounted=false` (default in `@base-ui/react`), the form component unmounts when dialog closes — `defaultValues` are correctly applied fresh on each dialog open
- **Dual query invalidation**: `useUpdateContacto` invalidates both `['contactos']` (list) and `['contactos', contactoId]` (single contact). The `useContacto(contactoId)` hook in `ContactoDetailView` subscribes to the single-contact key and auto-refetches after invalidation

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` — already installed
- **Usage**: Use `Input` and `Button` from `siesa-ui-kit` for all form fields. `Dialog` from `@/components/ui/dialog` (shadcn-based, already present from Story 3.3). Do NOT build custom components.
- **All user-facing text in Spanish**: "Editar", "Editar contacto", "Guardar", "Cancelar", "Guardando...", "Contacto actualizado correctamente", inline error messages

### React Hook Rules — Conditional Mutation Pattern

`useCreateContacto` and `useUpdateContacto(contactoId)` are both called unconditionally at the top of `ContactoForm`. The active mutation is selected via:
```typescript
const mutation = contactoId ? updateMutation : createMutation
```
This is compliant with React's rules of hooks (no conditional hook calls). The `''` fallback for `useUpdateContacto` when `contactoId` is undefined is safe — the update mutation is never called in create mode.

### Project Structure Notes

**New files (Story 3.4):**
```
backend/src/SiesaAgents.Application/Contactos/
  Commands/UpdateContactoCommand.cs          (NEW)
  Commands/UpdateContactoCommandHandler.cs   (NEW)
  DTOs/UpdateContactoRequest.cs              (NEW)
  Validators/UpdateContactoRequestValidator.cs (NEW)

frontend/src/modules/crm/contactos/
  application/useUpdateContacto.ts           (NEW)
  application/useUpdateContacto.test.ts      (NEW)
  presentation/ContactoDetailView.test.tsx   (NEW)
```

**Modified files (Story 3.4):**
```
backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs  (+ UpdateAsync)
backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs   (+ UpdateAsync)
backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs                  (+ PUT endpoint)
backend/src/SiesaAgents.API/Program.cs                                       (+ UpdateContactoCommandHandler DI)
backend/tests/SiesaAgents.UnitTests/Application/Contactos/UpdateContactoCommandHandlerTests.cs (NEW)
backend/tests/SiesaAgents.IntegrationTests/Contactos/ContactoEndpointsTests.cs (+3 tests)

frontend/src/modules/crm/contactos/domain/IContactoRepository.ts            (+ update)
frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts  (+ update)
frontend/src/modules/crm/contactos/application/contactoSchema.ts            (+ contactoSchema alias)
frontend/src/modules/crm/contactos/presentation/ContactoForm.tsx            (+ edit mode props)
frontend/src/modules/crm/contactos/presentation/ContactoForm.test.tsx       (+ edit mode tests)
frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx      (+ Editar button + Dialog)
```

### References

- `ContactoEntity.Update(...)` method: `backend/src/SiesaAgents.Domain/Contactos/Entities/ContactoEntity.cs:14-22`
- `IContactoRepository` (existing): `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs`
- `ContactoRepository` (existing): `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs`
- `ContactoEndpoints` (existing): `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs`
- `Program.cs` DI pattern: `backend/src/SiesaAgents.API/Program.cs:41-54`
- `ContactoForm` (existing): `frontend/src/modules/crm/contactos/presentation/ContactoForm.tsx`
- `ContactoDetailView` (existing): `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx`
- `useCreateContacto` pattern: `frontend/src/modules/crm/contactos/application/useCreateContacto.ts`
- API response shapes: `_bmad-output/planning-artifacts/architecture.md#Format Patterns`
- TanStack Query keys: `_bmad-output/project-context.md#TanStack Query — Canonical Query Keys`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
