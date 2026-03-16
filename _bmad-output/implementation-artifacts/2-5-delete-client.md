---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
status: done
epic: 2
story: 5
storyKey: 2-5-delete-client
createdAt: '2026-03-15'
---

# Story 2.5: Delete Client

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to delete a client record,
so that the client list only contains active and relevant records.

## Acceptance Criteria

1. **AC1 — "Eliminar" button opens confirmation dialog**: When the user is on a client detail page (`/clientes/:id`) and clicks "Eliminar", a confirmation dialog opens asking "¿Eliminar este cliente?" with "Confirmar" and "Cancelar" buttons. (FR7)

2. **AC2 — Successful deletion removes client**: When the user clicks "Confirmar", the client is removed from the system, the client list updates immediately (FR27), the right panel returns to the empty/default state (user is navigated to `/clientes`), and a toast shows "Cliente eliminado correctamente". (FR7, FR27)

3. **AC3 — Cancel keeps client unchanged**: When the user clicks "Cancelar" or the X button in the confirmation dialog, the dialog closes and the client record remains in the system unchanged.

4. **AC4 — Deletion with associated contacts**: When the client being deleted has associated contacts, after confirmation the client is deleted, the previously associated contacts remain in the system with all their data intact, those contacts become unassigned (`clienteId = null`), and the toast shows "Cliente eliminado. Sus contactos asociados quedaron sin cliente asignado." (FR25)

5. **AC5 — Non-existent client returns 404**: If a DELETE request is made for a `clienteId` that does not exist, the backend returns 404 with Problem Details. (handled gracefully — unlikely in normal flow)

## Tasks / Subtasks

### Backend

- [x] Task 1: Extend Domain Layer (AC: 2, 4, 5)
  - [x] 1.1 Add `Task DeleteAsync(Guid id, CancellationToken ct = default)` to `backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs`
  - [x] 1.2 Add `Task<int> CountByClienteIdAsync(Guid clienteId, CancellationToken ct = default)` to `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs`

- [x] Task 2: Extend Infrastructure Layer (AC: 2, 4)
  - [x] 2.1 Implement `DeleteAsync` in `backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs` — `FindAsync([id], ct)` → if not null: `context.Clientes.Remove(entity); await context.SaveChangesAsync(ct)`
  - [x] 2.2 Implement `CountByClienteIdAsync` in `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs` — `context.Contactos.CountAsync(c => c.ClienteId == clienteId, ct)`

- [x] Task 3: Create Application Layer (AC: 2, 4, 5)
  - [x] 3.1 Create `backend/src/SiesaAgents.Application/Clientes/Commands/DeleteClienteCommand.cs` — `record DeleteClienteCommand(Guid Id)`
  - [x] 3.2 Create `backend/src/SiesaAgents.Application/Clientes/Commands/DeleteClienteResult.cs` — sealed record result type
  - [x] 3.3 Create `backend/src/SiesaAgents.Application/Clientes/Commands/DeleteClienteCommandHandler.cs` — load entity by Id (→ NotFound), count contactos via `IContactoRepository.CountByClienteIdAsync`, delete via `IClienteRepository.DeleteAsync`, return `DeleteClienteResult.Success(contactosCount)`

- [x] Task 4: Extend API Layer (AC: 2, 4, 5)
  - [x] 4.1 Add `DELETE /clientes/{id:guid}` to `backend/src/SiesaAgents.API/Endpoints/ClienteEndpoints.cs`
  - [x] 4.2 Register in `backend/src/SiesaAgents.API/Program.cs`: `builder.Services.AddScoped<DeleteClienteCommandHandler>()`

- [x] Task 5: Backend Tests (AC: 2, 4, 5)
  - [x] 5.1 Create `backend/tests/SiesaAgents.UnitTests/Application/Clientes/DeleteClienteCommandHandlerTests.cs` — 3 tests ✅
  - [x] 5.2 Add integration tests to `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs` — 3 DELETE tests added
  - [x] 5.3 `dotnet build` — 0 errors ✅
  - [x] 5.4 `dotnet test --project tests/SiesaAgents.UnitTests` — 33 pass ✅

### Frontend

- [x] Task 6: Extend Domain + Infrastructure Layers (AC: 2, 4)
  - [x] 6.1 Add `DeleteClienteResult` interface + `delete(id: string): Promise<DeleteClienteResult>` to `frontend/src/modules/crm/clientes/domain/IClienteRepository.ts`
  - [x] 6.2 Implement `delete` in `frontend/src/modules/crm/clientes/infrastructure/clienteApiRepository.ts`

- [x] Task 7: Create `useDeleteCliente` hook (AC: 2, 4)
  - [x] 7.1 Create `frontend/src/modules/crm/clientes/application/useDeleteCliente.ts`

- [x] Task 8: Create `ClienteDeleteDialog` component (AC: 1, 3)
  - [x] 8.1 Create `frontend/src/modules/crm/clientes/presentation/ClienteDeleteDialog.tsx`

- [x] Task 9: Update `ClienteDetailView` (AC: 1, 2, 3, 4)
  - [x] 9.1 Add `isDeleteOpen` state + `deleteMutation` to `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.tsx`
  - [x] 9.2 Add "Eliminar" `Button` (`type="outline-solid"`) between Editar and Volver
  - [x] 9.3 Import `useDeleteCliente` and `ClienteDeleteDialog` (inline, not lazy)
  - [x] 9.4 Render `ClienteDeleteDialog` with correct props; navigate on success

- [x] Task 10: Frontend Tests (AC: 1, 2, 3, 4)
  - [x] 10.1 Create `frontend/src/modules/crm/clientes/application/useDeleteCliente.test.ts` — 3 tests ✅
  - [x] 10.2 Create `frontend/src/modules/crm/clientes/presentation/ClienteDeleteDialog.test.tsx` — 4 tests ✅
  - [x] 10.3 Update `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.test.tsx` — Eliminar button test added ✅
  - [x] 10.4 `npm run build` — 0 TypeScript errors ✅
  - [x] 10.5 `npm test` — 107 tests pass (19 files) ✅

## Dev Notes

### ⚠️ Prerequisites

- Story 2.4 (`done`) — `IClienteRepository` (with `FindByNitAsync`, `CreateAsync`, `UpdateAsync`), `ClienteRepository`, `ClienteEndpoints`, `ClienteDetailView` with "Editar" button — all exist.
- `ContactoConfiguration` already has `OnDelete(DeleteBehavior.SetNull)` — when a client is deleted, PostgreSQL automatically sets `contactos.cliente_id = NULL` for all associated contacts. **No manual contact update needed in the handler.**
- `ClienteEndpointsTests.cs` already implements `IAsyncLifetime`, `_postgres`, `CreateFactory()`, `MigrateAsync()` — ADD new tests to existing class, DO NOT re-declare.
- Assembly scanning already active for FluentValidation — but this story needs **no** request body validator (route-only, Guid typed).
- `IContactoRepository` is already registered in Program.cs as `AddScoped<IContactoRepository, ContactoRepository>()` — no new registration needed for the contacto repo.

---

### ⚠️ Architecture Deviation — 200 OK instead of 204

Architecture specifies `DELETE → 204 No Content`. This story deviates intentionally:

**Reason:** AC4 requires the frontend to show a different toast message depending on whether the deleted client had associated contacts. The backend must communicate `contactosDesasociados: int` to enable this. Returning 204 with no body would prevent proper AC4 compliance.

**Decision:** `DELETE /api/v1/clientes/{id}` returns **200 OK** with `{ "contactosDesasociados": N }` on success, **404 Problem Details** if not found.

---

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` v1.0.77 (already installed — do NOT run `npm install siesa-ui-kit` again)
- **Import styles**: already in `main.tsx`, do NOT add again
- **Components required**:
  - `Button` — "Eliminar" button in `ClienteDetailView`. Use `type="outline-solid"` (secondary/destructive action consistent with "Volver")
  - `Button` — "Confirmar" in `ClienteDeleteDialog`. Use default solid for prominence.
  - `Button` — "Cancelar" in `ClienteDeleteDialog`. Use `type="outline-solid"`.
- **Dialog**: Use `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from `@/components/ui/dialog` (shadcn/base-ui — same as `ClienteFormDialog`). siesa-ui-kit has no AlertDialog equivalent.

---

### Architecture Constraints (Non-Negotiable)

- **`DELETE /api/v1/clientes/{id}` → 200 OK** with `{ contactosDesasociados: N }` (documented deviation from 204 — required by AC4)
- **`Results.Problem(statusCode: 404)`** — not `Results.NotFound()`
- **No FluentValidation** needed for DELETE (route param only, Guid-typed)
- **`['clientes', id]` removeQueries** — use `removeQueries` (not invalidate) for the deleted item
- **`['clientes']` invalidateQueries** — refresh the list
- **Navigation** to `/clientes` in component's `mutate` callback — NOT inside the hook
- **No lazy-loading** for `ClienteDeleteDialog` — import directly
- **EF Core cascade** already configured — DO NOT add manual contact nulling
- **`AddScoped<DeleteClienteCommandHandler>()`** — registered in Program.cs

---

### Project Structure Notes

**Files created/modified:**

```
backend/
├── src/
│   ├── SiesaAgents.Domain/
│   │   ├── Clientes/Interfaces/IClienteRepository.cs       ← MODIFIED: added DeleteAsync
│   │   └── Contactos/Interfaces/IContactoRepository.cs    ← MODIFIED: added CountByClienteIdAsync
│   ├── SiesaAgents.Infrastructure/Repositories/
│   │   ├── ClienteRepository.cs                            ← MODIFIED: implemented DeleteAsync
│   │   └── ContactoRepository.cs                          ← MODIFIED: implemented CountByClienteIdAsync
│   ├── SiesaAgents.Application/Clientes/Commands/
│   │   ├── DeleteClienteCommand.cs                         ← NEW
│   │   ├── DeleteClienteResult.cs                          ← NEW
│   │   └── DeleteClienteCommandHandler.cs                  ← NEW
│   └── SiesaAgents.API/
│       ├── Endpoints/ClienteEndpoints.cs                   ← MODIFIED: added DELETE /{id}
│       └── Program.cs                                      ← MODIFIED: added DeleteClienteCommandHandler
└── tests/
    ├── SiesaAgents.UnitTests/Application/Clientes/
    │   └── DeleteClienteCommandHandlerTests.cs             ← NEW (3 tests)
    └── SiesaAgents.IntegrationTests/Clientes/
        └── ClienteEndpointsTests.cs                        ← MODIFIED: added 3 DELETE tests

frontend/
└── src/
    ├── modules/crm/clientes/
    │   ├── domain/IClienteRepository.ts                    ← MODIFIED: added DeleteClienteResult + delete()
    │   ├── infrastructure/clienteApiRepository.ts          ← MODIFIED: implemented delete()
    │   ├── application/
    │   │   ├── useDeleteCliente.ts                         ← NEW
    │   │   └── useDeleteCliente.test.ts                    ← NEW
    │   └── presentation/
    │       ├── ClienteDeleteDialog.tsx                     ← NEW
    │       ├── ClienteDeleteDialog.test.tsx                ← NEW
    │       ├── ClienteDetailView.tsx                       ← MODIFIED: added Eliminar button + dialog
    │       └── ClienteDetailView.test.tsx                  ← MODIFIED: added Eliminar button test + mock
```

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- **API response 200 vs 204**: `DELETE /api/v1/clientes/{id}` returns 200 OK with `{ contactosDesasociados: N }` (not 204) to enable AC4 dual-toast logic. This is a documented architecture deviation.
- **`contactosDesasociados` casing**: ASP.NET Core's default System.Text.Json serializes anonymous object properties as camelCase. `new { contactosDesasociados = N }` → JSON `{ "contactosDesasociados": N }`. Frontend `DeleteClienteResult` interface uses camelCase `contactosDesasociados: number`.
- **DB cascade handles contacts**: `ContactoConfiguration.OnDelete(DeleteBehavior.SetNull)` means PostgreSQL automatically nulls `contactos.cliente_id` on client deletion — no application-level contact update needed.
- **`ClienteDeleteDialog` not lazy-loaded**: Lightweight component with no heavy dependencies. Direct import in `ClienteDetailView`.
- **Navigation in component, not hook**: `navigate({ to: '/clientes' })` is in `ClienteDetailView`'s `mutate({ onSuccess })` callback — keeps `useDeleteCliente` navigation-agnostic and reusable.
- **`useDeleteCliente` added to `ClienteDetailView.test.tsx` mock**: Added `vi.mock('../application/useDeleteCliente')` and `mockUseDeleteCliente()` helper to prevent hook errors in existing tests.

### File List

**Backend — New:**
- `backend/src/SiesaAgents.Application/Clientes/Commands/DeleteClienteCommand.cs`
- `backend/src/SiesaAgents.Application/Clientes/Commands/DeleteClienteResult.cs`
- `backend/src/SiesaAgents.Application/Clientes/Commands/DeleteClienteCommandHandler.cs`
- `backend/tests/SiesaAgents.UnitTests/Application/Clientes/DeleteClienteCommandHandlerTests.cs`

**Backend — Modified:**
- `backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs` (added `DeleteAsync`)
- `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs` (added `CountByClienteIdAsync`)
- `backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs` (implemented `DeleteAsync`)
- `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs` (implemented `CountByClienteIdAsync`)
- `backend/src/SiesaAgents.API/Endpoints/ClienteEndpoints.cs` (added DELETE endpoint)
- `backend/src/SiesaAgents.API/Program.cs` (registered `DeleteClienteCommandHandler`)
- `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs` (added 3 DELETE tests)

**Frontend — New:**
- `frontend/src/modules/crm/clientes/application/useDeleteCliente.ts`
- `frontend/src/modules/crm/clientes/application/useDeleteCliente.test.ts`
- `frontend/src/modules/crm/clientes/presentation/ClienteDeleteDialog.tsx`
- `frontend/src/modules/crm/clientes/presentation/ClienteDeleteDialog.test.tsx`

**Frontend — Modified:**
- `frontend/src/modules/crm/clientes/domain/IClienteRepository.ts` (added `DeleteClienteResult` + `delete()`)
- `frontend/src/modules/crm/clientes/infrastructure/clienteApiRepository.ts` (implemented `delete()`)
- `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.tsx` (added Eliminar button + dialog)
- `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.test.tsx` (added mock + Eliminar test)
