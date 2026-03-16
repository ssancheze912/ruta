---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
status: done
epic: 4
story: 1
storyKey: 4-1-view-associated-contacts-in-client-detail
createdAt: '2026-03-15'
---

# Story 4.1: View Associated Contacts in Client Detail

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to see all contacts associated with a client directly within the client detail view,
so that I have a complete picture of that client's contacts without navigating elsewhere.

## Acceptance Criteria

1. **AC1 — Contacts Section Rendered**: When the user opens the client detail view (`/clientes/:clienteId`) and the client data has loaded, an "Asociados" section appears below the client fields listing all contacts linked to that client.

2. **AC2 — Contacts Data Source**: The section calls `GET /api/v1/contactos?clienteId={id}` to fetch only the contacts linked to this client. The query key must be `['contactos', { clienteId }]`.

3. **AC3 — Contact Row Navigation**: Each contact row is clickable and navigates the user to `/contactos/:contactoId` — fulfilling the "no more than 2 clicks from the client record" requirement (NFR8, FR22).

4. **AC4 — Empty State**: When the client has no associated contacts the section shows the text "Sin contactos asociados aún."

5. **AC5 — Loading Skeleton**: While fetching contacts, the section renders 3 skeleton rows.

6. **AC6 — Error State**: If the contacts fetch fails, the section shows a retry button (reuse `ErrorPanel`). The client header/fields are unaffected by a contacts fetch error.

7. **AC7 — Backend: `GET /api/v1/contactos?clienteId={guid}`**: The endpoint accepts an optional `clienteId` query parameter. When provided it returns only the contactos whose `ClienteId` matches. When absent it returns all contactos (existing behavior preserved). Returns `200 OK` with an array (empty array if none found).

## Tasks / Subtasks

### Backend

- [x] Task 1: Add `GetByClienteIdAsync` to Repository (AC: 7)
  - [x] 1.1 Add method signature to `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs`:
    ```csharp
    Task<IEnumerable<ContactoEntity>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default);
    ```
  - [x] 1.2 Implement in `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs`:
    ```csharp
    public async Task<IEnumerable<ContactoEntity>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
    {
        return await context.Contactos
            .AsNoTracking()
            .Where(c => c.ClienteId == clienteId)
            .ToListAsync(ct);
    }
    ```

- [x] Task 2: Extend Query Layer (AC: 7)
  - [x] 2.1 Update `backend/src/SiesaAgents.Application/Contactos/Queries/GetContactosQuery.cs` to accept optional `ClienteId`:
    ```csharp
    public record GetContactosQuery(Guid? ClienteId = null);
    ```
  - [x] 2.2 Update `GetContactosQueryHandler.HandleAsync` to branch on `ClienteId`:
    ```csharp
    public async Task<IEnumerable<ContactoDto>> HandleAsync(GetContactosQuery query, CancellationToken ct = default)
    {
        IEnumerable<ContactoEntity> contactos = query.ClienteId.HasValue
            ? await repository.GetByClienteIdAsync(query.ClienteId.Value, ct)
            : await repository.GetAllAsync(ct);

        return contactos.Select(c => new ContactoDto(
            c.Id, c.Nombre, c.Cargo, c.Telefono, c.Email,
            c.ClienteId, c.CreatedAt, c.UpdatedAt));
    }
    ```

- [x] Task 3: Update Endpoint (AC: 7)
  - [x] 3.1 Update `GET /contactos` in `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs` to accept optional `clienteId` query param:
    ```csharp
    group.MapGet("/contactos", async (
        [FromQuery] Guid? clienteId,
        GetContactosQueryHandler handler,
        CancellationToken ct) =>
    {
        var result = await handler.HandleAsync(new GetContactosQuery(clienteId), ct);
        return Results.Ok(result);
    })
    .WithName("GetContactos")
    .WithSummary("Lista todos los contactos, con filtro opcional por clienteId")
    .Produces<IEnumerable<ContactoDto>>();
    ```

- [x] Task 4: Integration Tests (AC: 7)
  - [x] 4.1 Add test class `backend/tests/SiesaAgents.IntegrationTests/Contactos/GetContactosByClienteIdTests.cs` with:
    - `GetContactos_WithClienteIdFilter_ReturnsOnlyMatchingContactos` — seed 2 contactos for clienteId A and 1 for clienteId B, call `GET /api/v1/contactos?clienteId={A}`, assert 2 items returned and all have `clienteId == A`.
    - `GetContactos_WithClienteIdFilter_ReturnsEmptyArray_WhenNoneAssociated` — call with a valid guid that has no contacts, assert 200 OK with `[]`.
    - `GetContactos_WithoutFilter_ReturnsAllContactos` — assert existing behavior preserved (all contactos returned when no param).

### Frontend

- [x] Task 5: Add `useContactosByCliente` hook (AC: 2)
  - [x] 5.1 Create `frontend/src/modules/crm/contactos/application/useContactosByCliente.ts`:
    ```typescript
    import { useQuery } from '@tanstack/react-query'
    import { contactoRepository } from '../infrastructure/contactoApiRepository'

    export function useContactosByCliente(clienteId: string) {
      return useQuery({
        queryKey: ['contactos', { clienteId }],
        queryFn: () => contactoRepository.getByClienteId(clienteId),
        staleTime: 5 * 60 * 1000,
      })
    }
    ```
  - [x] 5.2 Add `getByClienteId` to `IContactoRepository` interface in `frontend/src/modules/crm/contactos/domain/IContactoRepository.ts`:
    ```typescript
    getByClienteId(clienteId: string): Promise<Contacto[]>
    ```
  - [x] 5.3 Implement in `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts`:
    ```typescript
    async getByClienteId(clienteId: string): Promise<Contacto[]> {
      const response = await apiClient.get<Contacto[]>('/contactos', { params: { clienteId } })
      return response.data
    }
    ```

- [x] Task 6: Create `AssociatedContactsSection` component (AC: 1, 3, 4, 5, 6)
  - [x] 6.1 Create `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.tsx`:
    ```tsx
    import { useNavigate } from '@tanstack/react-router'
    import Skeleton from 'react-loading-skeleton'
    import { Table } from 'siesa-ui-kit'
    import type { TableColumn } from 'siesa-ui-kit'
    import { useContactosByCliente } from '@/modules/crm/contactos/application/useContactosByCliente'
    import type { Contacto } from '@/modules/crm/contactos/domain/Contacto'
    import { ErrorPanel } from '@/shared/components/ErrorPanel'

    interface AssociatedContactsSectionProps {
      clienteId: string
    }

    const columns: TableColumn<Contacto>[] = [
      { header: 'Nombre', accessor: 'nombre', sortable: true },
      { header: 'Cargo', accessor: 'cargo' },
      { header: 'Teléfono', accessor: 'telefono' },
      { header: 'Email', accessor: 'email' },
    ]

    export function AssociatedContactsSection({ clienteId }: AssociatedContactsSectionProps) {
      const navigate = useNavigate()
      const { data: contactos = [], isLoading, isError, refetch } = useContactosByCliente(clienteId)

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

      if (contactos.length === 0) {
        return <p className="text-sm text-slate-500">Sin contactos asociados aún.</p>
      }

      return (
        <Table
          columns={columns}
          data={contactos}
          variant="fullWidth"
          onRowClick={(row) =>
            navigate({ to: '/contactos/$contactoId', params: { contactoId: row.id } })
          }
          emptyMessage="Sin contactos asociados aún."
        />
      )
    }
    ```

- [x] Task 7: Integrate section into `ClienteDetailView` (AC: 1, 3, 4, 5, 6)
  - [x] 7.1 Import and render `AssociatedContactsSection` in `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.tsx` below the `DescriptionList` fields:
    ```tsx
    import { AssociatedContactsSection } from './AssociatedContactsSection'
    // ...inside return, after the DescriptionList items:
    <div className="mt-6">
      <h2 className="text-base font-semibold text-slate-700 mb-3">Contactos asociados</h2>
      <AssociatedContactsSection clienteId={clienteId} />
    </div>
    ```

- [x] Task 8: Unit Tests (AC: 1–6)
  - [x] 8.1 Create `frontend/src/modules/crm/contactos/application/useContactosByCliente.test.ts`:
    - `returns contacts for clienteId` — mock `contactoRepository.getByClienteId`, assert query key `['contactos', { clienteId }]` and returned data.
    - `returns empty array when no contacts` — mock returns `[]`, assert data is `[]`.
  - [x] 8.2 Create `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.test.tsx`:
    - `renders loading skeleton while fetching` — mock hook with `isLoading: true`, assert skeleton elements present.
    - `renders table when contacts loaded` — mock hook returning 2 contacts, assert rows present.
    - `renders empty state when no contacts` — mock hook returning `[]`, assert "Sin contactos asociados aún."
    - `renders error panel on fetch failure` — mock hook with `isError: true`, assert ErrorPanel rendered.
    - `navigates to contact on row click` — mock navigate, simulate row click, assert `navigate` called with correct params.

## Dev Notes

### Architecture Pattern

- Follows exact CQRS-lite pattern used by all existing queries: `IContactoRepository` → `GetContactosQueryHandler` → `ContactoEndpoints`.
- Frontend follows the established hook pattern: `contactoApiRepository` → `useContactosByCliente` → component.
- Query key shape: `['contactos', { clienteId }]` — scoped so future `invalidateQueries(['contactos'])` invalidates both global and per-client caches.

### ⚠️ ContactManager Not Used — Architecture Decision

The epic (4-1) originally specified using `ContactManager` from `siesa-ui-kit`. **This has been overridden** because:
- `IContactServiceAdapter.getByRecordId` returns `Contact[]` from siesa-ui-kit, whose `Contact` type (phones[], emails[], socialNetworks[], address, cityId…) is **incompatible** with our `Contacto` domain entity (simple string fields).
- Implementing the `lookupConfig` required by `IContactServiceAdapter` (countries, social network types, cities fetcher) is out of scope for MVP.
- The `ContactManager` is a full form editor — Story 4.1 only requires **read-only viewing** of associated contacts.
- **Decision**: Use `Table` from siesa-ui-kit (same component used across clientes/contactos list views) inside a dedicated `AssociatedContactsSection` component.

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` (already installed)
- **Usage**: Use `Table` with `variant="fullWidth"` and `onRowClick` for the contacts list. Use `Skeleton` from `react-loading-skeleton` for loading state. Use existing `ErrorPanel` for errors.
- **Constraint**: Do not create custom table/list components — `Table` from siesa-ui-kit is the canonical pattern.

### Project Structure Notes

```
backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs      ← add GetByClienteIdAsync
backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs        ← implement GetByClienteIdAsync
backend/src/SiesaAgents.Application/Contactos/Queries/GetContactosQuery.cs       ← add ClienteId? param
backend/src/SiesaAgents.Application/Contactos/Queries/GetContactosQueryHandler.cs ← branch on ClienteId
backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs                       ← add [FromQuery] Guid? clienteId
backend/tests/SiesaAgents.IntegrationTests/Contactos/GetContactosByClienteIdTests.cs ← NEW

frontend/src/modules/crm/contactos/domain/IContactoRepository.ts                ← add getByClienteId
frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts       ← implement getByClienteId
frontend/src/modules/crm/contactos/application/useContactosByCliente.ts          ← NEW hook
frontend/src/modules/crm/contactos/application/useContactosByCliente.test.ts     ← NEW tests
frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.tsx     ← NEW component
frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.test.tsx ← NEW tests
frontend/src/modules/crm/clientes/presentation/ClienteDetailView.tsx             ← add section
```

### Previous Story Learnings (from 3.5)

- Use `mutateAsync` wrapped in try/catch; let `onError` in the mutation hook handle toast feedback.
- `ContentLength` assertion in integration tests: use `Assert.Null` not `Assert.Equal(0, ...)` for 204 No Content.
- `invalidateQueries` AND `removeQueries` both called on delete success — verify cache keys match.

### References

- Epic 4 AC: `_bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md`
- ContactManager types: `frontend/node_modules/siesa-ui-kit/dist/components/ContactManager/types/adapter.types.d.ts`
- Existing hook pattern: `frontend/src/modules/crm/contactos/application/useContactos.ts`
- Repo pattern: `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs`
- Endpoint pattern: `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List

**Backend — Modified:**
- `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs`
- `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs`
- `backend/src/SiesaAgents.Application/Contactos/Queries/GetContactosQuery.cs`
- `backend/src/SiesaAgents.Application/Contactos/Queries/GetContactosQueryHandler.cs`
- `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs`

**Backend — Created:**
- `backend/tests/SiesaAgents.IntegrationTests/Contactos/GetContactosByClienteIdTests.cs`

**Frontend — Modified:**
- `frontend/src/modules/crm/contactos/domain/IContactoRepository.ts`
- `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts`
- `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.tsx`

**Frontend — Created:**
- `frontend/src/modules/crm/contactos/application/useContactosByCliente.ts`
- `frontend/src/modules/crm/contactos/application/useContactosByCliente.test.ts`
- `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.tsx`
- `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.test.tsx`
