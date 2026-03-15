---
stepsCompleted: []
status: ready-for-dev
epic: 3
story: 5
storyKey: 3-5-delete-contact
createdAt: '2026-03-15'
---

# Story 3.5: Delete Contact

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to delete a contact record,
so that the contact list only contains relevant records.

## Acceptance Criteria

1. **AC1 — "Eliminar" Button**: An "Eliminar" button is visible on `ContactoDetailView` when contact data has loaded (not during loading skeleton, error states, or 404). It appears alongside the existing "Editar" button in the header action group.

2. **AC2 — Confirmation Dialog**: Clicking "Eliminar" opens a modal confirmation dialog with title "¿Eliminar este contacto?" and two buttons: "Confirmar" and "Cancelar". The dialog uses the existing `Dialog` component from `@/components/ui/dialog` with `showCloseButton={false}`.

3. **AC3 — Cancelar**: Clicking "Cancelar" in the confirmation dialog closes it without performing any action. The contact record remains unchanged.

4. **AC4 — Successful Delete**: When the user confirms, a `DELETE /api/v1/contactos/{id}` request is sent. On success (204), the dialog closes, the contact list refreshes, the view navigates to `/contactos`, and a toast "Contacto eliminado correctamente" appears. (FR27, AC-E3.5)

5. **AC5 — Loading State**: While the deletion is in progress, both "Confirmar" and "Cancelar" buttons are disabled to prevent double submission. The "Confirmar" button text changes to "Eliminando...".

6. **AC6 — Backend: DELETE /api/v1/contactos/{id}**: The endpoint finds the contact by ID, deletes it, and returns `204 No Content`. Returns `404` Problem Details if the contact is not found. No request body or FluentValidation needed.

## Tasks / Subtasks

### Backend

- [ ] Task 1: Extend Domain + Infrastructure (AC: 6)
  - [ ] 1.1 Add `DeleteAsync` to `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs`:
    ```csharp
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
    ```
  - [ ] 1.2 Implement `DeleteAsync` in `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs`:
    ```csharp
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await context.Contactos.FindAsync([id], ct);
        if (entity is null) return false;
        context.Contactos.Remove(entity);
        await context.SaveChangesAsync(ct);
        return true;
    }
    ```
    > ⚠️ Use `FindAsync` (tracked) so EF Core can call `Remove()` on the tracked entity. Returns `true` if deleted, `false` if not found.

- [ ] Task 2: Create Application Layer (AC: 6)
  - [ ] 2.1 Create `backend/src/SiesaAgents.Application/Contactos/Commands/DeleteContactoCommand.cs`:
    ```csharp
    namespace SiesaAgents.Application.Contactos.Commands;
    public record DeleteContactoCommand(Guid Id);
    ```
  - [ ] 2.2 Create `backend/src/SiesaAgents.Application/Contactos/Commands/DeleteContactoCommandHandler.cs`:
    ```csharp
    namespace SiesaAgents.Application.Contactos.Commands;

    public class DeleteContactoCommandHandler(IContactoRepository repository)
    {
        public async Task<bool> HandleAsync(DeleteContactoCommand command, CancellationToken ct = default)
        {
            return await repository.DeleteAsync(command.Id, ct);
        }
    }
    ```
    > No validator needed — DELETE has no request body.

- [ ] Task 3: Extend API Layer (AC: 6)
  - [ ] 3.1 Add `DELETE /contactos/{id}` to `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs` inside `MapContactoEndpoints`, after the `PUT` handler (before `return group;`):
    ```csharp
    group.MapDelete("/contactos/{id:guid}", async (
        Guid id,
        DeleteContactoCommandHandler handler,
        CancellationToken ct) =>
    {
        var deleted = await handler.HandleAsync(new DeleteContactoCommand(id), ct);
        return deleted
            ? Results.NoContent()
            : Results.Problem(statusCode: StatusCodes.Status404NotFound, title: "Not Found", detail: "Contacto no encontrado.");
    })
    .WithName("DeleteContacto")
    .WithSummary("Elimina un contacto")
    .Produces(StatusCodes.Status204NoContent)
    .ProducesProblem(StatusCodes.Status404NotFound);
    ```
  - [ ] 3.2 Register `DeleteContactoCommandHandler` as scoped in `backend/src/SiesaAgents.API/Program.cs` (under `// Contactos — DI` section, below the `UpdateContactoCommandHandler` line):
    ```csharp
    builder.Services.AddScoped<DeleteContactoCommandHandler>();
    ```
    > No `DeleteContactoRequestValidator` exists — no registration needed.

- [ ] Task 4: Backend Tests (AC: 6)
  - [ ] 4.1 Create `backend/tests/SiesaAgents.UnitTests/Application/Contactos/DeleteContactoCommandHandlerTests.cs` — NSubstitute mocks:
    - `DeleteContacto_WhenFound_ReturnsTrue` — mock `DeleteAsync` returning `true` → verify handler returns `true`
    - `DeleteContacto_WhenNotFound_ReturnsFalse` — mock `DeleteAsync` returning `false` → verify handler returns `false`
    - `DeleteContacto_PassesCorrectIdToRepository` — verify `repository.DeleteAsync(command.Id, ct)` called with exact command Id
  - [ ] 4.2 Add 2 integration tests to `backend/tests/SiesaAgents.IntegrationTests/Contactos/ContactoEndpointsTests.cs`:
    - `DeleteContacto_WithValidId_Returns204` — seed entity, DELETE by id, assert 204 + no body
    - `DeleteContacto_WithNonExistentId_Returns404` — DELETE with random Guid, assert 404 + `application/problem+json` content-type
  - [ ] 4.3 `dotnet build` — 0 errors ✅
  - [ ] 4.4 `dotnet test tests/SiesaAgents.UnitTests` — all pass ✅ (integration tests require Docker)

### Frontend

- [ ] Task 5: Delete Mutation Hook (AC: 3, 4, 5)
  - [ ] 5.1 Add `delete` to `frontend/src/modules/crm/contactos/domain/IContactoRepository.ts`:
    ```typescript
    delete(id: string): Promise<void>
    ```
  - [ ] 5.2 Add `delete` implementation to `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts`:
    ```typescript
    async delete(id: string): Promise<void> {
      await apiClient.delete(`/contactos/${id}`)
    }
    ```
  - [ ] 5.3 Create `frontend/src/modules/crm/contactos/application/useDeleteContacto.ts`:
    ```typescript
    import { useMutation, useQueryClient } from '@tanstack/react-query'
    import { toast } from '@/shared/lib/toast'
    import { contactoRepository } from '../infrastructure/contactoApiRepository'

    export function useDeleteContacto(contactoId: string) {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: () => contactoRepository.delete(contactoId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['contactos'] })
          queryClient.removeQueries({ queryKey: ['contactos', contactoId] })
          toast.success('Contacto eliminado correctamente')
        },
      })
    }
    ```
    > `removeQueries` on the single-contact key prevents a stale 404 refetch after deletion. The list key uses `invalidateQueries` to force a fresh fetch. Navigation is handled by the component after `mutateAsync()` resolves.

- [ ] Task 6: Add Delete Dialog to ContactoDetailView (AC: 1, 2, 3, 4, 5)
  - [ ] 6.1 Update `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx`:
    - Add imports: `DialogDescription`, `DialogFooter` from `@/components/ui/dialog` (add to existing dialog import), `useDeleteContacto` from `../application/useDeleteContacto`
    - Add state: `const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)`
    - Add hook call (unconditional, top of component body):
      ```typescript
      const deleteMutation = useDeleteContacto(contactoId)
      ```
    - In the header `div` (the `flex gap-2` button group), add "Eliminar" button between the existing "Editar" and "Volver" buttons:
      ```tsx
      <Button onClick={() => setDeleteDialogOpen(true)}>Eliminar</Button>
      ```
    - Add second `<Dialog>` after the edit dialog (before closing `</div>`):
      ```tsx
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>¿Eliminar este contacto?</DialogTitle>
          </DialogHeader>
          <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          <DialogFooter>
            <Button
              type="outline-solid"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                await deleteMutation.mutateAsync()
                navigate({ to: '/contactos' })
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      ```
    > `deleteMutation` is called unconditionally at the component top level (React Hook Rules compliance). `useDeleteContacto` always receives `contactoId` (available from props). Navigation fires after `mutateAsync()` resolves (post-`onSuccess`).

- [ ] Task 7: Frontend Tests (AC: 1, 2, 3, 4, 5)
  - [ ] 7.1 Create `frontend/src/modules/crm/contactos/application/useDeleteContacto.test.ts`:
    - Mock `@/shared/lib/toast` with `vi.mock`
    - `deletes contacto and fires toast on 204` — MSW `http.delete` returns 204 → assert `isSuccess`, `toast.success` called with `'Contacto eliminado correctamente'`, `queryClient.invalidateQueries` called with `['contactos']`
    - `sets isError true on 404` — MSW `http.delete` returns 404 → assert `isError`
  - [ ] 7.2 Update `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx`:
    - Add `vi.mock('../application/useDeleteContacto')` and a `mockDeleteMutation()` helper (mirrors `mockUpdateMutation` pattern)
    - Add to the `vi.mock('./ContactoForm', ...)` — no change needed (form mock is already present)
    - Add tests:
      - `renders Eliminar button when contact is loaded` — assert `getByText('Eliminar')` visible when contact data present
      - `opens delete dialog when Eliminar is clicked` — click "Eliminar", assert `getByText('¿Eliminar este contacto?')` visible
      - `closes delete dialog when Cancelar is clicked` — open dialog, click "Cancelar", assert dialog not visible
      - `calls delete mutation and navigates when Confirmar is clicked` — mock `mutateAsync` resolves, click "Confirmar", assert `mutateAsync` called, `mockNavigate` called with `{ to: '/contactos' }`
      - `does not render Eliminar button during loading` — mock `isLoading: true`, assert button not present
      - `does not render Eliminar button on error` — mock `isError: true`, assert button not present
  - [ ] 7.3 `npx vitest run src/modules/crm/contactos/` — all tests pass ✅

## Dev Notes

### Architecture Patterns

- **Backend flow**: `DELETE /api/v1/contactos/{id}` → `DeleteContactoCommandHandler.HandleAsync` → `IContactoRepository.DeleteAsync` → `FindAsync` + `Remove` + `SaveChangesAsync` → `204 No Content` (or `404` if not found)
- **No request body** on DELETE → no `UpdateContactoRequest`-style DTO, no FluentValidation validator, no `IValidator<>` injection in endpoint
- **`FindAsync` required** in `DeleteAsync` (same reason as `UpdateAsync`): entity must be tracked for EF Core `Remove()` to work; `GetByIdAsync` uses `AsNoTracking()` and cannot be reused
- **`ON DELETE SET NULL`** on `contactos.cliente_id` FK (from `ContactoConfiguration.cs`) — deleting a contact does NOT affect the associated client. This is already configured; no story changes needed.
- **Dual cache operation**: `invalidateQueries(['contactos'])` refreshes the list. `removeQueries(['contactos', contactoId])` clears the single-contact entry so no stale 404 refetch is triggered after navigation.
- **Navigation after mutation**: `deleteMutation.mutateAsync()` is awaited in the `onClick` handler. `navigate({ to: '/contactos' })` fires immediately after it resolves (after `onSuccess` has run). This ensures toast + cache clear happen before navigation.
- **Hook called unconditionally**: `useDeleteContacto(contactoId)` is placed unconditionally in `ContactoDetailView` (below `useContacto`, above the loading guard). React Hook Rules compliance — no conditional call.

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` — already installed at v1.0.77
- **Usage**: Use `Button` from `siesa-ui-kit` for all button elements (Eliminar, Confirmar, Cancelar). Do NOT build custom button components.
- **Constraint**: No custom UI components if a `siesa-ui-kit` equivalent exists.
- **Confirmation Dialog**: Use `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` from `@/components/ui/dialog` — already present in the project. Do NOT install `alert-dialog` from shadcn; the existing `Dialog` with `showCloseButton={false}` covers this use case.

### All User-Facing Text in Spanish (P0 Rule)

- Button labels: `"Eliminar"`, `"Confirmar"`, `"Cancelar"`, `"Eliminando..."`
- Dialog title: `"¿Eliminar este contacto?"`
- Dialog description: `"Esta acción no se puede deshacer."`
- Toast: `"Contacto eliminado correctamente"`

### Project Structure Notes

**New files (Story 3.5):**
```
backend/src/SiesaAgents.Application/Contactos/
  Commands/DeleteContactoCommand.cs              (NEW)
  Commands/DeleteContactoCommandHandler.cs       (NEW)

backend/tests/SiesaAgents.UnitTests/Application/Contactos/
  DeleteContactoCommandHandlerTests.cs           (NEW)

frontend/src/modules/crm/contactos/
  application/useDeleteContacto.ts               (NEW)
  application/useDeleteContacto.test.ts          (NEW)
```

**Modified files (Story 3.5):**
```
backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs  (+ DeleteAsync)
backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs   (+ DeleteAsync)
backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs                  (+ DELETE endpoint)
backend/src/SiesaAgents.API/Program.cs                                       (+ DeleteContactoCommandHandler DI)
backend/tests/SiesaAgents.IntegrationTests/Contactos/ContactoEndpointsTests.cs (+2 DELETE tests)

frontend/src/modules/crm/contactos/domain/IContactoRepository.ts            (+ delete)
frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts  (+ delete)
frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx      (+ Eliminar button + delete dialog)
frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx (+ delete tests)
```

### References

- `IContactoRepository` (existing): `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs`
- `ContactoRepository` (existing, `FindAsync` pattern): `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs:28-35`
- `ContactoEndpoints` (existing): `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs`
- `Program.cs` DI pattern: `backend/src/SiesaAgents.API/Program.cs` — Contactos DI section
- `ContactoDetailView` (existing): `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx`
- `useUpdateContacto` pattern (dual invalidation): `frontend/src/modules/crm/contactos/application/useUpdateContacto.ts`
- `Dialog` component (base-ui): `frontend/src/components/ui/dialog.tsx` — includes `DialogFooter`, `DialogDescription`, `showCloseButton` prop
- Architecture DELETE pattern: `_bmad-output/planning-artifacts/architecture.md#Format Patterns` — `DELETE → 204 No Content`
- TanStack Query keys: `_bmad-output/planning-artifacts/architecture.md#TanStack Query keys`
- `ContactoConfiguration.cs` (ON DELETE SET NULL): `backend/src/SiesaAgents.Infrastructure/Data/Configurations/ContactoConfiguration.cs`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
