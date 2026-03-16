---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
status: done
epic: 4
story: 2
storyKey: 4-2-associate-disassociate-contacts-from-client
createdAt: '2026-03-16'
---

# Story 4.2: Associate & Disassociate Contacts from Client

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to associate existing contacts to a client and disassociate them directly from the client detail view,
so that I can manage the client's contact relationships without navigating away.

## Acceptance Criteria

1. **AC1 — Associate Existing Contact**: Given the user is in the client detail view (`/clientes/:clienteId`), when the user clicks "Asociar contacto" and selects an existing contact from the selector, then `PUT /api/v1/contactos/{id}/cliente` is called with `{ clienteId: uuid }`, the contact appears in the `AssociatedContactsSection` immediately, and queryKeys `['contactos']` and `['contactos', { clienteId }]` are invalidated (FR17, FR19, FR27).

2. **AC2 — Disassociate Contact**: Given the user is in the client detail view and contacts are listed, when the user clicks "Desasociar" on a contact row and confirms, then `PUT /api/v1/contactos/{id}/cliente` is called with `{ clienteId: null }`, the contact is removed from the `AssociatedContactsSection` immediately, and the contact record still exists and is accessible from `/contactos` (FR20, FR27).

3. **AC3 — Contact Selector shows only eligible contacts**: The "Asociar contacto" selector shows only contacts whose `clienteId` is `null` (unassigned). Contacts already assigned to any client (including this one) must not appear in the selector.

4. **AC4 — Immediate visibility**: After any association or disassociation, the `AssociatedContactsSection` re-renders without a full page reload (FR27). TanStack Query cache invalidation drives the refresh.

5. **AC5 — Toast feedback**: On successful association: toast "Contacto asociado correctamente". On successful disassociation: toast "Contacto desasociado correctamente". On error: toast "No se pudo completar la operación. Intenta de nuevo."

6. **AC6 — Backend: `PUT /api/v1/contactos/{id}/cliente`**: Endpoint accepts body `{ clienteId: uuid | null }`. Returns `200 OK` with updated `ContactoDto`. If `contactoId` not found → `404`. If `clienteId` provided but not found → `404`. Returns Problem Details RFC 7807 on error.

7. **AC7 — Loading state**: While the association/disassociation mutation is pending, the action button shows a disabled/loading state to prevent double-submit.

8. **AC8 — Empty selector state**: If all contacts are already assigned to a client, the selector shows "No hay contactos disponibles para asociar."

## Tasks / Subtasks

### Backend

- [x] Task 1: Create `AssignContactoClienteCommand` and handler (AC: 6)
  - [x] 1.1 Create `backend/src/SiesaAgents.Application/Contactos/Commands/AssignContactoClienteCommand.cs`:
    ```csharp
    namespace SiesaAgents.Application.Contactos.Commands;

    public record AssignContactoClienteCommand(Guid ContactoId, Guid? ClienteId);
    ```
  - [x] 1.2 Create `backend/src/SiesaAgents.Application/Contactos/Commands/AssignContactoClienteCommandHandler.cs`:
    ```csharp
    namespace SiesaAgents.Application.Contactos.Commands;

    public class AssignContactoClienteCommandHandler(
        IContactoRepository contactoRepository,
        IClienteRepository clienteRepository)
    {
        public async Task<ContactoDto> HandleAsync(AssignContactoClienteCommand command, CancellationToken ct = default)
        {
            var contacto = await contactoRepository.GetByIdAsync(command.ContactoId, ct)
                ?? throw new NotFoundException($"Contacto {command.ContactoId} not found");

            if (command.ClienteId.HasValue)
            {
                var clienteExists = await clienteRepository.ExistsAsync(command.ClienteId.Value, ct);
                if (!clienteExists)
                    throw new NotFoundException($"Cliente {command.ClienteId.Value} not found");
            }

            contacto.ClienteID = command.ClienteId;
            contacto.UpdatedAt = DateTimeOffset.UtcNow;

            await contactoRepository.UpdateAsync(contacto, ct);

            return new ContactoDto(
                contacto.ID, contacto.Nombre, contacto.Cargo,
                contacto.Telefono, contacto.Email,
                contacto.ClienteID, contacto.CreatedAt, contacto.UpdatedAt);
        }
    }
    ```
    > **Note:** If `IContactoRepository` does not yet expose `UpdateAsync`, add it (see Task 2).

- [x] Task 2: Extend repository if needed (AC: 6)
  - [x] 2.1 Verify `IContactoRepository` has `GetByIdAsync(Guid id, CancellationToken ct)` — already exists from prior stories. If missing, add method signature to `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs` and implement in `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs`.
  - [x] 2.2 Verify `IClienteRepository` has `ExistsAsync(Guid id, CancellationToken ct)` — add if missing:
    ```csharp
    // IClienteRepository.cs
    Task<bool> ExistsAsync(Guid id, CancellationToken ct = default);

    // ClienteRepository.cs
    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await context.Clientes.AnyAsync(c => c.ID == id, ct);
    ```

- [x] Task 3: Create DTO and validator (AC: 6)
  - [x] 3.1 Create `backend/src/SiesaAgents.Application/Contactos/DTOs/AssignContactoClienteRequest.cs`:
    ```csharp
    namespace SiesaAgents.Application.Contactos.DTOs;

    public record AssignContactoClienteRequest(Guid? ClienteId);
    ```
  - [x] 3.2 Create `backend/src/SiesaAgents.Application/Contactos/Validators/AssignContactoClienteRequestValidator.cs`:
    ```csharp
    namespace SiesaAgents.Application.Contactos.Validators;

    public class AssignContactoClienteRequestValidator : AbstractValidator<AssignContactoClienteRequest>
    {
        public AssignContactoClienteRequestValidator()
        {
            // ClienteId is nullable — null means disassociate, valid uuid means associate
            // No additional rules needed beyond type safety
        }
    }
    ```

- [x] Task 4: Add `PUT /api/v1/contactos/{id}/cliente` endpoint (AC: 6)
  - [x] 4.1 Add endpoint to `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs` AFTER the existing `MapPut("/contactos/{id:guid}", ...)` endpoint:
    ```csharp
    group.MapPut("/contactos/{id:guid}/cliente", async (
        Guid id,
        [FromBody] AssignContactoClienteRequest request,
        AssignContactoClienteCommandHandler handler,
        CancellationToken ct) =>
    {
        var result = await handler.HandleAsync(
            new AssignContactoClienteCommand(id, request.ClienteId), ct);
        return Results.Ok(result);
    })
    .WithName("AssignContactoCliente")
    .WithSummary("Asigna o desasigna el cliente de un contacto (clienteId: uuid | null)")
    .Produces<ContactoDto>()
    .Produces(StatusCodes.Status404NotFound);
    ```
  - [x] 4.2 Register `AssignContactoClienteCommandHandler` in DI — add to `Program.cs` alongside other command handlers:
    ```csharp
    builder.Services.AddScoped<AssignContactoClienteCommandHandler>();
    ```

- [x] Task 5: Integration tests (AC: 6)
  - [x] 5.1 Create `backend/tests/SiesaAgents.IntegrationTests/Contactos/AssignContactoClienteTests.cs` with:
    - `AssignContacto_WithValidClienteId_Returns200AndUpdatedContacto` — seed a contacto (clienteId null) and a cliente, call `PUT /api/v1/contactos/{id}/cliente` with `{ clienteId: clienteGuid }`, assert 200 OK and returned dto has `clienteId == clienteGuid`.
    - `DisassociateContacto_WithNullClienteId_Returns200AndNullClienteId` — seed a contacto with clienteId set, call with `{ clienteId: null }`, assert 200 OK and `clienteId == null`.
    - `AssignContacto_WithUnknownContactoId_Returns404` — call with random guid, assert 404.
    - `AssignContacto_WithUnknownClienteId_Returns404` — seed contacto, call with non-existent clienteId guid, assert 404.

### Frontend

- [x] Task 6: Add `assignCliente` to repository layer (AC: 1, 2)
  - [x] 6.1 Add method signature to `frontend/src/modules/crm/contactos/domain/IContactoRepository.ts`:
    ```typescript
    assignCliente(id: string, clienteId: string | null): Promise<Contacto>
    ```
  - [x] 6.2 Implement in `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts`:
    ```typescript
    async assignCliente(id: string, clienteId: string | null): Promise<Contacto> {
      const response = await apiClient.put<Contacto>(`/contactos/${id}/cliente`, { clienteId })
      return response.data
    }
    ```

- [x] Task 7: Create `useAssignContactoCliente` mutation hook (AC: 1, 2, 4, 5, 7)
  - [x] 7.1 Create `frontend/src/modules/crm/contactos/application/useAssignContactoCliente.ts`:
    ```typescript
    import { useMutation, useQueryClient } from '@tanstack/react-query'
    import { toast } from 'sonner'
    import { contactoRepository } from '../infrastructure/contactoApiRepository'

    interface AssignParams {
      contactoId: string
      clienteId: string | null
      currentClienteId: string
    }

    export function useAssignContactoCliente() {
      const queryClient = useQueryClient()

      return useMutation({
        mutationFn: ({ contactoId, clienteId }: AssignParams) =>
          contactoRepository.assignCliente(contactoId, clienteId),
        onSuccess: (_, { clienteId, currentClienteId }) => {
          queryClient.invalidateQueries({ queryKey: ['contactos'] })
          queryClient.invalidateQueries({ queryKey: ['contactos', { clienteId: currentClienteId }] })
          const msg = clienteId
            ? 'Contacto asociado correctamente'
            : 'Contacto desasociado correctamente'
          toast.success(msg)
        },
        onError: () => {
          toast.error('No se pudo completar la operación. Intenta de nuevo.')
        },
      })
    }
    ```

- [x] Task 8: Create `AssociarContactoDialog` component (AC: 3, 8)
  - [x] 8.1 Create `frontend/src/modules/crm/clientes/presentation/AssociarContactoDialog.tsx`:
    ```tsx
    import { useState } from 'react'
    import { Button } from 'siesa-ui-kit'
    import { useContactos } from '@/modules/crm/contactos/application/useContactos'
    import type { Contacto } from '@/modules/crm/contactos/domain/Contacto'

    interface AssociarContactoDialogProps {
      onSelect: (contacto: Contacto) => void
      isLoading: boolean
    }

    export function AssociarContactoDialog({ onSelect, isLoading }: AssociarContactoDialogProps) {
      const [open, setOpen] = useState(false)
      const { data: allContactos = [] } = useContactos()

      // Only show contacts with no client assigned
      const available = allContactos.filter((c) => !c.clienteId)

      const handleSelect = (contacto: Contacto) => {
        onSelect(contacto)
        setOpen(false)
      }

      return (
        <>
          <Button
            type="default"
            size="sm"
            onClick={() => setOpen(true)}
            disabled={isLoading}
          >
            Asociar contacto
          </Button>

          {open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h3 className="text-base font-semibold text-slate-800 mb-4">
                  Seleccionar contacto a asociar
                </h3>

                {available.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No hay contactos disponibles para asociar.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {available.map((c) => (
                      <li key={c.id}>
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors"
                          onClick={() => handleSelect(c)}
                        >
                          <span className="font-medium text-sm text-slate-800">{c.nombre}</span>
                          {c.cargo && (
                            <span className="ml-2 text-xs text-slate-500">{c.cargo}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 flex justify-end">
                  <Button type="outline-solid" size="sm" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )
    }
    ```

- [x] Task 9: Update `AssociatedContactsSection` to add associate/disassociate actions (AC: 1, 2, 4, 5, 7)
  - [x] 9.1 Modify `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.tsx` to:
    - Import `useAssignContactoCliente` and `AssociarContactoDialog`
    - Import `Button` from `siesa-ui-kit`
    - Add "Asociar contacto" button (uses `AssociarContactoDialog`)
    - Add a "Desasociar" column to the table with a `Button type="plain"` per row
    - On "Desasociar" click: call `mutateAsync({ contactoId: row.id, clienteId: null, currentClienteId: clienteId })`
    - On contacto selected in dialog: call `mutateAsync({ contactoId: contacto.id, clienteId, currentClienteId: clienteId })`

    ```tsx
    import { useNavigate } from '@tanstack/react-router'
    import Skeleton from 'react-loading-skeleton'
    import { Button, Table } from 'siesa-ui-kit'
    import type { TableColumn } from 'siesa-ui-kit'
    import { useContactosByCliente } from '@/modules/crm/contactos/application/useContactosByCliente'
    import { useAssignContactoCliente } from '@/modules/crm/contactos/application/useAssignContactoCliente'
    import type { Contacto } from '@/modules/crm/contactos/domain/Contacto'
    import { ErrorPanel } from '@/shared/components/ErrorPanel'
    import { AssociarContactoDialog } from './AssociarContactoDialog'

    interface AssociatedContactsSectionProps {
      clienteId: string
    }

    export function AssociatedContactsSection({ clienteId }: AssociatedContactsSectionProps) {
      const navigate = useNavigate()
      const { data: contactos = [], isLoading, isError, refetch } = useContactosByCliente(clienteId)
      const { mutateAsync, isPending } = useAssignContactoCliente()

      const handleDisassociate = async (contacto: Contacto) => {
        try {
          await mutateAsync({ contactoId: contacto.id, clienteId: null, currentClienteId: clienteId })
        } catch {
          // onError in hook handles toast
        }
      }

      const handleAssociate = async (contacto: Contacto) => {
        try {
          await mutateAsync({ contactoId: contacto.id, clienteId, currentClienteId: clienteId })
        } catch {
          // onError in hook handles toast
        }
      }

      const columns: TableColumn<Contacto>[] = [
        { header: 'Nombre', accessor: 'nombre', sortable: true },
        { header: 'Cargo', accessor: 'cargo' },
        { header: 'Teléfono', accessor: 'telefono' },
        { header: 'Email', accessor: 'email' },
        {
          header: '',
          accessor: 'id',
          render: (row: Contacto) => (
            <Button
              type="plain"
              size="xs"
              onClick={(e) => { e.stopPropagation(); handleDisassociate(row) }}
              disabled={isPending}
            >
              Desasociar
            </Button>
          ),
        },
      ]

      if (isLoading) {
        return (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={40} />
            ))}
          </div>
        )
      }

      if (isError) {
        return <ErrorPanel message="No se pudieron cargar los contactos." onRetry={refetch} />
      }

      return (
        <div className="space-y-3">
          <div className="flex justify-end">
            <AssociarContactoDialog
              clienteId={clienteId}
              onSelect={handleAssociate}
              isLoading={isPending}
            />
          </div>

          {contactos.length === 0 ? (
            <p className="text-sm text-slate-500">Sin contactos asociados aún.</p>
          ) : (
            <Table
              columns={columns}
              data={contactos}
              variant="fullWidth"
              onRowClick={(row) =>
                navigate({ to: '/contactos/$contactoId', params: { contactoId: row.id } })
              }
            />
          )}
        </div>
      )
    }
    ```

    > **⚠️ Note on `TableColumn` render prop**: Check `siesa-ui-kit` v1.0.77 `TableColumn` type definition. If `render` prop is not supported, use a wrapper approach or check if `Table` accepts custom cell renderers. If not available, place the "Desasociar" button outside the table as a row-level action triggered differently (e.g., a selected-row state pattern).

- [x] Task 10: Unit tests (AC: 1–8)
  - [x] 10.1 Create `frontend/src/modules/crm/contactos/application/useAssignContactoCliente.test.ts`:
    - `calls PUT /contactos/:id/cliente with clienteId on associate` — mock `contactoRepository.assignCliente`, assert called with correct args.
    - `calls PUT /contactos/:id/cliente with null on disassociate` — assert clienteId is null.
    - `invalidates both queryKeys on success` — spy on `queryClient.invalidateQueries`, assert both `['contactos']` and `['contactos', { clienteId }]` invalidated.
    - `shows success toast on associate` — assert toast.success called with "Contacto asociado correctamente".
    - `shows success toast on disassociate` — assert toast.success called with "Contacto desasociado correctamente".
    - `shows error toast on failure` — mock repository throws, assert toast.error called.
  - [x] 10.2 Create `frontend/src/modules/crm/clientes/presentation/AssociarContactoDialog.test.tsx`:
    - `renders Asociar contacto button` — assert button present.
    - `opens selector on button click` — click button, assert dialog content visible.
    - `shows available (unassigned) contacts only` — mock useContactos with mixed data, assert only null-clienteId contacts listed.
    - `shows empty state when no available contacts` — mock returns all assigned, assert "No hay contactos disponibles".
    - `calls onSelect with contact when item clicked` — simulate click on contact row, assert onSelect called.
    - `closes dialog on Cancelar` — click Cancelar, assert dialog hidden.
  - [x] 10.3 Update `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.test.tsx`:
    - `renders Asociar contacto button` — assert `AssociarContactoDialog` button rendered.
    - `renders Desasociar button per contact row` — mock 2 contacts, assert 2 Desasociar buttons.
    - `calls disassociate mutation on Desasociar click` — mock mutation, simulate click, assert called with `{ clienteId: null }`.
    - `disables Desasociar buttons while mutation is pending` — mock isPending: true, assert buttons disabled.

## Dev Notes

### Architecture Pattern

- **Backend**: New `AssignContactoClienteCommand` + handler following exact CQRS-lite pattern:
  `IContactoRepository` → `AssignContactoClienteCommandHandler` → `ContactoEndpoints`
- **Frontend**: New `useAssignContactoCliente` mutation hook + extended `AssociatedContactsSection` + new `AssociarContactoDialog`.
- The endpoint `PUT /api/v1/contactos/{id}/cliente` is a sub-resource action — **different from** `PUT /api/v1/contactos/{id}` (which updates all contact fields). Do not merge them.

### ⚠️ Critical: ContactManager NOT Used

Architectural decision from Story 4.1 remains: `ContactManager` from `siesa-ui-kit` is **incompatible** with the project's `Contacto` domain type. Use `Table` + `AssociatedContactsSection` + `AssociarContactoDialog` pattern established in 4.1. Do not revisit `ContactManager` for this story.

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` v1.0.77 (already installed)
- **Usage**: Use `Button` (`type="default"` for primary, `type="outline-solid"` for secondary, `type="plain"` for inline actions) and `Table` (`variant="fullWidth"`) from siesa-ui-kit.
- **Constraint**: Do not create custom button or table components.
- **TableColumn render**: Verify if `siesa-ui-kit` `TableColumn<T>` supports a `render` prop. Check `frontend/node_modules/siesa-ui-kit/dist/components/Table/` types. If not supported, implement Desasociar as a separate action bar below the selected row or via a hover overlay pattern.

### Query Key Invalidation (CRITICAL)

After any mutation both keys must be invalidated:
```typescript
queryClient.invalidateQueries({ queryKey: ['contactos'] })              // global list
queryClient.invalidateQueries({ queryKey: ['contactos', { clienteId }] }) // per-client list
```
Note: `currentClienteId` must be passed to `mutateAsync` so the hook can invalidate the scoped key.

### Contacto Selector — Filtering Logic

The `AssociarContactoDialog` uses `useContactos()` (all contacts, queryKey `['contactos']`) and filters client-side:
```typescript
const available = allContactos.filter((c) => !c.clienteId)
```
This is correct and consistent with NFR1 (< 1s with 500 records — client-side filter < 50ms).

### Mutation Pattern (from 3.5 learnings)

- Use `mutateAsync` wrapped in `try/catch`.
- Let `onError` in the mutation hook handle toast feedback — do **not** add duplicate toast calls in the component.
- Button disabled state driven by `isPending` from `useMutation`.

### Project Structure Notes

**Backend — New files:**
```
backend/src/SiesaAgents.Application/Contactos/Commands/AssignContactoClienteCommand.cs         ← NEW
backend/src/SiesaAgents.Application/Contactos/Commands/AssignContactoClienteCommandHandler.cs  ← NEW
backend/src/SiesaAgents.Application/Contactos/DTOs/AssignContactoClienteRequest.cs             ← NEW
backend/src/SiesaAgents.Application/Contactos/Validators/AssignContactoClienteRequestValidator.cs ← NEW
backend/tests/SiesaAgents.IntegrationTests/Contactos/AssignContactoClienteTests.cs             ← NEW
```

**Backend — Modified files:**
```
backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs     ← add PUT /contactos/{id}/cliente
backend/src/SiesaAgents.API/Program.cs                         ← register AssignContactoClienteCommandHandler
backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs   ← add ExistsAsync if missing
backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs     ← add ExistsAsync if missing
backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs    ← implement if needed
backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs     ← implement if needed
```

**Frontend — New files:**
```
frontend/src/modules/crm/contactos/application/useAssignContactoCliente.ts          ← NEW
frontend/src/modules/crm/contactos/application/useAssignContactoCliente.test.ts     ← NEW
frontend/src/modules/crm/clientes/presentation/AssociarContactoDialog.tsx            ← NEW
frontend/src/modules/crm/clientes/presentation/AssociarContactoDialog.test.tsx       ← NEW
```

**Frontend — Modified files:**
```
frontend/src/modules/crm/contactos/domain/IContactoRepository.ts            ← add assignCliente
frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts  ← implement assignCliente
frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.tsx ← add associate/disassociate UI
frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.test.tsx ← update tests
```

### References

- Epic 4 Story 4.2 AC: `_bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md`
- Architecture REST endpoints: `_bmad-output/planning-artifacts/architecture.md` — API & Communication Patterns
- Architecture query keys: `_bmad-output/planning-artifacts/architecture.md` — TanStack Query keys (canonical)
- Architecture mutation pattern: `_bmad-output/planning-artifacts/architecture.md` — Process Patterns
- Story 4.1 (previous): `_bmad-output/implementation-artifacts/4-1-view-associated-contacts-in-client-detail.md`
- Existing `AssociatedContactsSection`: `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.tsx`
- Button types: `frontend/node_modules/siesa-ui-kit/dist/components/Button/Button.d.ts`
- contactoApiRepository: `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- All tasks implemented and tests passing (22 new tests, 0 regressions)
- `ContactoEntity.AssignCliente(Guid? clienteId)` method added to keep UpdatedAt consistent
- Handler uses `GetByIdAsync` on IClienteRepository (existing) instead of `ExistsAsync` — avoids interface change
- `useAssignContactoCliente` uses `@/shared/lib/toast` (project convention), not `sonner` directly
- `TableColumn.render` prop confirmed available in siesa-ui-kit v1.0.77
- `ClienteDetailView.test.tsx` updated to mock `AssociatedContactsSection` (needed after hook dependency added)
- 8 pre-existing test failures remain unchanged (navigation, ClienteDeleteDialog, ContactoDetailView)

### File List

**Backend — Modified:**
- `backend/src/SiesaAgents.Domain/Contactos/Entities/ContactoEntity.cs` — added `AssignCliente(Guid?)` method
- `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs` — added `AssignClienteAsync`
- `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs` — implemented `AssignClienteAsync`
- `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs` — added `PUT /contactos/{id}/cliente`
- `backend/src/SiesaAgents.API/Program.cs` — registered `AssignContactoClienteCommandHandler`

**Backend — Created:**
- `backend/src/SiesaAgents.Application/Contactos/Commands/AssignContactoClienteCommand.cs`
- `backend/src/SiesaAgents.Application/Contactos/Commands/AssignContactoClienteCommandHandler.cs`
- `backend/src/SiesaAgents.Application/Contactos/DTOs/AssignContactoClienteRequest.cs`
- `backend/src/SiesaAgents.Application/Contactos/Validators/AssignContactoClienteRequestValidator.cs` ← added in code review
- `backend/tests/SiesaAgents.IntegrationTests/Contactos/AssignContactoClienteTests.cs`

**Frontend — Modified:**
- `frontend/src/modules/crm/contactos/domain/IContactoRepository.ts` — added `assignCliente`
- `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts` — implemented `assignCliente`
- `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.tsx` — added associate/disassociate UI
- `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.test.tsx` — updated with new test cases
- `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.test.tsx` — added mock for `AssociatedContactsSection`

**Frontend — Created:**
- `frontend/src/modules/crm/contactos/application/useAssignContactoCliente.ts`
- `frontend/src/modules/crm/contactos/application/useAssignContactoCliente.test.ts`
- `frontend/src/modules/crm/clientes/presentation/AssociarContactoDialog.tsx`
- `frontend/src/modules/crm/clientes/presentation/AssociarContactoDialog.test.tsx`
