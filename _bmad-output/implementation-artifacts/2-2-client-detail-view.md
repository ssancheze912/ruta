---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
status: review
epic: 2
story: 2
storyKey: 2-2-client-detail-view
createdAt: '2026-03-13'
---

# Story 2.2: Client Detail View

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to view the complete details of a client by selecting them from the list,
So that I can review all their information without navigating away from the clients section.

## Acceptance Criteria

1. **AC1 — Client Selection Updates Right Panel & URL**: When the user clicks on a client item in the left panel, the right panel shows the complete client details (Nombre, NIT/RUC, Teléfono, Ciudad) and the URL updates to `/clientes/:clienteId`. The selected client is visually highlighted in the list. (FR30)

2. **AC2 — Direct URL Access**: When the user navigates directly to `/clientes/:clienteId` (e.g., via bookmark or browser reload), the split-panel layout renders correctly: the client list is shown on the left with the matching client highlighted, and the correct client details are displayed on the right. (FR30)

3. **AC3 — Not-Found State**: When the `clienteId` in the URL does not correspond to any existing client (404 from backend), the right panel displays a clear not-found message in Spanish ("Cliente no encontrado.") and a "Volver" button that navigates back to `/clientes`. No technical error details exposed. (NFR6)

4. **AC4 — Loading State**: While the client data is being fetched, a loading skeleton is shown in the right panel. Empty fields are NOT rendered during load.

5. **AC5 — Error State**: When the backend is unavailable and the fetch fails (non-404 error), the `ErrorPanel` component is displayed in the right panel with a "Reintentar" button that re-triggers the fetch.

6. **AC6 — "Volver" Button**: A "Volver" button is visible on the client detail view. Clicking it navigates back to `/clientes`.

7. **AC7 — Backend: GET /api/v1/clientes/{id}**: The endpoint returns `200 OK` with a single `ClienteDto` when the client exists. Returns `404 Problem Details` when the `id` is not found. Follows Problem Details RFC 7807 on all errors.

## Tasks / Subtasks

### Backend

- [x] Task 1: Extend Domain + Infrastructure Layers (AC: 7)
  - [x]1.1 Add `Task<ClienteEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)` to `backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs`
  - [x]1.2 Implement `GetByIdAsync` in `backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs` — use `AsNoTracking()`, returns `ClienteEntity?` (null when not found)

- [x] Task 2: Extend Application Layer (AC: 7)
  - [x]2.1 Create `backend/src/SiesaAgents.Application/Clientes/Queries/GetClienteByIdQuery.cs` — record with `Guid Id`
  - [x]2.2 Create `backend/src/SiesaAgents.Application/Clientes/Queries/GetClienteByIdQueryHandler.cs` — returns `ClienteDto?`, maps entity or returns null

- [x] Task 3: Extend API Layer (AC: 7)
  - [x]3.1 Add `GET /clientes/{id:guid}` to `backend/src/SiesaAgents.API/Endpoints/ClienteEndpoints.cs` inside `MapClienteEndpoints` — returns `Results.Ok(dto)` or `Results.NotFound()`
  - [x]3.2 Register `GetClienteByIdQueryHandler` as scoped in `backend/src/SiesaAgents.API/Program.cs`

- [x] Task 4: Backend Tests (AC: 7)
  - [x]4.1 Create `backend/tests/SiesaAgents.UnitTests/Application/Clientes/GetClienteByIdQueryHandlerTests.cs` — test: found (returns ClienteDto), not found (returns null)
  - [x]4.2 Add integration tests to `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs`: `GetClienteById_WhenExists_Returns200WithShape` + `GetClienteById_WhenNotFound_Returns404`
  - [x]4.3 `dotnet build` — 0 errors ✅
  - [x]4.4 `dotnet test` — all passed ✅

### Frontend

- [x] Task 5: Extend Domain + Infrastructure Layers (AC: 1, 2, 3)
  - [x]5.1 Add `getById(id: string): Promise<Cliente>` to `frontend/src/modules/crm/clientes/domain/IClienteRepository.ts`
  - [x]5.2 Implement `getById` in `frontend/src/modules/crm/clientes/infrastructure/clienteApiRepository.ts` — calls `GET /api/v1/clientes/:id` via `apiClient`

- [x] Task 6: Create Application Layer — useCliente hook (AC: 1, 2, 3)
  - [x]6.1 Create `frontend/src/modules/crm/clientes/application/useCliente.ts` — `useQuery({ queryKey: ['clientes', id] })`, `retry: false` on 404, `staleTime: 5 * 60 * 1000`

- [x] Task 7: Create Presentation Layer — ClienteDetailView (AC: 1, 2, 3, 4, 5, 6)
  - [x]7.1 Create `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.tsx` — loading skeleton (4 rows), 404 state, ErrorPanel on other errors, `DescriptionList` for Nombre/NIT/Teléfono/Ciudad, "Volver" `Button`

- [x] Task 8: Route Layer (AC: 1, 2)
  - [x]8.1 Create `frontend/src/routes/_app/clientes.$clienteId.tsx` — split panel: left (`ClienteListView` with `selectedId={clienteId}` + `onSelect` navigate) + right (`ClienteDetailView`)
  - [x]8.2 Update `frontend/src/routes/_app/clientes.tsx` — wire `onSelect` to `navigate({ to: '/clientes/$clienteId', params: { clienteId: id } })`

- [x] Task 9: Frontend Tests (AC: 1, 2, 3, 4, 5, 6)
  - [x]9.1 Create `frontend/src/modules/crm/clientes/application/useCliente.test.ts` — MSW: success returns ClienteDto, 404 returns error (no retry), network error retries
  - [x]9.2 Create `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.test.tsx` — renders fields, loading skeleton, 404 message, ErrorPanel on error, Volver navigates
  - [x]9.3 `npm run build` — 0 TypeScript errors ✅
  - [x]9.4 `npm test` — all passed ✅

## Dev Notes

### ⚠️ Prerequisites

- Story 2.1 (`done`) — `ClienteEntity`, `IClienteRepository` (only `GetAllAsync`), `ClienteRepository`, `ClienteDto`, `AppDbContext`, `ClienteEndpoints` base, `apiClient.ts`, `ErrorPanel.tsx`, `ClienteListView.tsx` (with `selectedId`/`onSelect` props) all exist.
- `ClienteListView` already accepts `selectedId?: string` and `onSelect?: (id: string) => void` — no props changes needed.
- MSW server setup (`frontend/src/mocks/server.ts`, `frontend/src/mocks/handlers.ts`, `frontend/src/test/setup.ts`) — already configured from Story 2.1 code-review fix. Do NOT recreate.
- TestContainers (`IAsyncLifetime`, `CreateFactory`, `MigrateAsync`) — already in `ClienteEndpointsTests.cs`. Add new tests to the EXISTING class.

---

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` v1.0.77 (already installed — do NOT run `npm install siesa-ui-kit` again)
- **Import styles**: `import 'siesa-ui-kit/styles.css'` — already in `main.tsx`, do NOT add again
- **Components required**:
  - `DescriptionList` — **PRIMARY component** for displaying client fields. Props: `term: string`, `details: string` — both required strings, `details` CANNOT be ReactNode.
  - `Button` — for "Volver" navigation. Use `type="outline-solid"` (secondary action). Pass text as `children`, NOT `label` prop.
- **Constraint**: Do NOT create custom key-value rows. Use `DescriptionList` natively.

---

### `DescriptionList` Component Pattern

```typescript
import { DescriptionList, Button } from 'siesa-ui-kit'

// Fields — details is always string (use '—' for null/empty nullable fields)
<DescriptionList term="Nombre"   details={cliente.nombre} />
<DescriptionList term="NIT/RUC"  details={cliente.nit} />
<DescriptionList term="Teléfono" details={cliente.telefono ?? '—'} />
<DescriptionList term="Ciudad"   details={cliente.ciudad ?? '—'} />
```

---

### `ClienteDetailView` Pattern

```typescript
// frontend/src/modules/crm/clientes/presentation/ClienteDetailView.tsx
import { DescriptionList, Button } from 'siesa-ui-kit'
import { useNavigate } from '@tanstack/react-router'
import { useCliente } from '../application/useCliente'
import { ErrorPanel } from '@/shared/components/ErrorPanel'

interface ClienteDetailViewProps {
  clienteId: string
}

export function ClienteDetailView({ clienteId }: ClienteDetailViewProps) {
  const navigate = useNavigate()
  const { data: cliente, isLoading, isError, error, refetch } = useCliente(clienteId)

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-100 rounded" />
        ))}
      </div>
    )
  }

  // 404 — client not found
  if (isError && (error as any)?.response?.status === 404) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <p className="text-slate-600">Cliente no encontrado.</p>
        <Button type="outline-solid" onClick={() => navigate({ to: '/clientes' })}>
          Volver a clientes
        </Button>
      </div>
    )
  }

  // Other errors
  if (isError) {
    return <ErrorPanel message="No se pudo cargar el cliente." onRetry={() => refetch()} />
  }

  if (!cliente) return null

  return (
    <div className="p-6 space-y-1">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">{cliente.nombre}</h1>
        <Button type="outline-solid" onClick={() => navigate({ to: '/clientes' })}>
          Volver
        </Button>
      </div>

      <DescriptionList term="Nombre"   details={cliente.nombre} />
      <DescriptionList term="NIT/RUC"  details={cliente.nit} />
      <DescriptionList term="Teléfono" details={cliente.telefono ?? '—'} />
      <DescriptionList term="Ciudad"   details={cliente.ciudad ?? '—'} />
    </div>
  )
}
```

---

### Route Pattern (TanStack Router file-based)

```typescript
// frontend/src/routes/_app/clientes.$clienteId.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ClienteListView } from '@/modules/crm/clientes/presentation/ClienteListView'
import { ClienteDetailView } from '@/modules/crm/clientes/presentation/ClienteDetailView'

export const Route = createFileRoute('/_app/clientes/$clienteId')({
  component: ClienteDetailViewRoute,
})

function ClienteDetailViewRoute() {
  const { clienteId } = Route.useParams()
  const navigate = useNavigate()

  return (
    <div className="flex h-full">
      {/* Panel izquierdo — lista de clientes (280px fijo) */}
      <div className="w-[280px] flex-shrink-0 border-r border-slate-200 overflow-hidden flex flex-col">
        <ClienteListView
          selectedId={clienteId}
          onSelect={(id) =>
            navigate({ to: '/clientes/$clienteId', params: { clienteId: id } })
          }
        />
      </div>

      {/* Panel derecho — detalle del cliente */}
      <div className="flex-1 overflow-y-auto">
        <ClienteDetailView clienteId={clienteId} />
      </div>
    </div>
  )
}
```

> ⚠️ TanStack Router file-based routing: `$` prefix in filename = dynamic param. File MUST be named `clientes.$clienteId.tsx` (dot-separated).

---

### Update `clientes.tsx` (wire onSelect)

```typescript
// frontend/src/routes/_app/clientes.tsx — add useNavigate + wire onSelect
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ClienteListView } from '@/modules/crm/clientes/presentation/ClienteListView'

export const Route = createFileRoute('/_app/clientes')({
  component: ClientesView,
})

function ClientesView() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full">
      <div className="w-[280px] flex-shrink-0 border-r border-slate-200 overflow-hidden flex flex-col">
        <ClienteListView
          onSelect={(id) =>
            navigate({ to: '/clientes/$clienteId', params: { clienteId: id } })
          }
        />
      </div>
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Selecciona un cliente para ver su detalle
      </div>
    </div>
  )
}
```

---

### `useCliente` Hook Pattern

```typescript
// frontend/src/modules/crm/clientes/application/useCliente.ts
import { useQuery } from '@tanstack/react-query'
import { clienteApiRepository } from '../infrastructure/clienteApiRepository'

export function useCliente(id: string) {
  return useQuery({
    queryKey: ['clientes', id],   // CANONICAL key — never string
    queryFn: () => clienteApiRepository.getById(id),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Do not retry on 404 — client genuinely not found
      if (error?.response?.status === 404) return false
      return failureCount < 2
    },
  })
}
```

---

### `clienteApiRepository.getById` Pattern

```typescript
// Add to clienteApiRepository.ts
async getById(id: string): Promise<Cliente> {
  const response = await apiClient.get<Cliente>(`/clientes/${id}`)
  return response.data
}
```

Also update `IClienteRepository.ts`:
```typescript
export interface IClienteRepository {
  getAll(): Promise<Cliente[]>
  getById(id: string): Promise<Cliente>
}
```

---

### Backend — `IClienteRepository` Extension

```csharp
// backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs
public interface IClienteRepository
{
    Task<IEnumerable<ClienteEntity>> GetAllAsync(CancellationToken ct = default);
    Task<ClienteEntity?> GetByIdAsync(Guid id, CancellationToken ct = default);  // ADD
}
```

---

### Backend — `ClienteRepository.GetByIdAsync` Pattern

```csharp
// backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs
public async Task<ClienteEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
{
    return await context.Clientes
        .AsNoTracking()
        .FirstOrDefaultAsync(c => c.Id == id, ct);
}
```

> ⚠️ `ClienteEntity` uses property `Id` (not `ID`) — verify against actual entity definition before writing. If the entity uses `ID`, use `c.ID == id`.

---

### Backend — `GetClienteByIdQuery` + Handler Pattern

```csharp
// backend/src/SiesaAgents.Application/Clientes/Queries/GetClienteByIdQuery.cs
namespace SiesaAgents.Application.Clientes.Queries;

public record GetClienteByIdQuery(Guid Id);
```

```csharp
// backend/src/SiesaAgents.Application/Clientes/Queries/GetClienteByIdQueryHandler.cs
using SiesaAgents.Application.Clientes.DTOs;
using SiesaAgents.Domain.Clientes.Interfaces;

namespace SiesaAgents.Application.Clientes.Queries;

public class GetClienteByIdQueryHandler(IClienteRepository repository)
{
    public async Task<ClienteDto?> HandleAsync(
        GetClienteByIdQuery query, CancellationToken ct = default)
    {
        var cliente = await repository.GetByIdAsync(query.Id, ct);
        if (cliente is null) return null;

        return new ClienteDto(
            cliente.Id, cliente.Nombre, cliente.Nit, cliente.Telefono,
            cliente.Ciudad, cliente.CreatedAt, cliente.UpdatedAt);
    }
}
```

> ⚠️ Verify exact property names on `ClienteEntity` (Nit vs NIT, Id vs ID) before writing. Match the actual entity.

---

### Backend — `GET /clientes/{id:guid}` Endpoint Pattern

```csharp
// Add to ClienteEndpoints.cs inside MapClienteEndpoints(this RouteGroupBuilder group)
group.MapGet("/{id:guid}", async (
    Guid id,
    GetClienteByIdQueryHandler handler,
    CancellationToken ct) =>
{
    var result = await handler.HandleAsync(new GetClienteByIdQuery(id), ct);
    return result is null
        ? Results.NotFound()
        : Results.Ok(result);
})
.WithName("GetClienteById")
.WithSummary("Obtiene un cliente por ID")
.Produces<ClienteDto>()
.Produces(StatusCodes.Status404NotFound);
```

> ⚠️ The group is already mapped at `/api/v1/clientes` in Program.cs. Use `/{id:guid}` (relative), NOT `/clientes/{id:guid}`.
> `Results.NotFound()` is automatically formatted as Problem Details RFC 7807 by ASP.NET Core's built-in Problem Details support.

---

### Backend Unit Test Pattern

```csharp
// backend/tests/SiesaAgents.UnitTests/Application/Clientes/GetClienteByIdQueryHandlerTests.cs
public class GetClienteByIdQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_WhenClienteExists_ReturnsMappedDto()
    {
        var id = Guid.NewGuid();
        var entity = new ClienteEntity { Id = id, Nombre = "Empresa X", Nit = "900-1" };
        var repo = Substitute.For<IClienteRepository>();
        repo.GetByIdAsync(id, default).Returns(entity);
        var handler = new GetClienteByIdQueryHandler(repo);

        var result = await handler.HandleAsync(new GetClienteByIdQuery(id));

        Assert.NotNull(result);
        Assert.Equal("Empresa X", result.Nombre);
        Assert.Equal(id, result.Id);
    }

    [Fact]
    public async Task HandleAsync_WhenClienteNotFound_ReturnsNull()
    {
        var repo = Substitute.For<IClienteRepository>();
        repo.GetByIdAsync(Arg.Any<Guid>(), default).Returns((ClienteEntity?)null);
        var handler = new GetClienteByIdQueryHandler(repo);

        var result = await handler.HandleAsync(new GetClienteByIdQuery(Guid.NewGuid()));

        Assert.Null(result);
    }
}
```

> ⚠️ Unit tests use `NSubstitute` (already installed in `SiesaAgents.UnitTests.csproj` — confirm before writing). Verify mock lib used in Story 2.1 unit tests and match.

---

### Integration Test Pattern (Testcontainers — ADD to existing class)

```csharp
// ADD to backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs
// The class already implements IAsyncLifetime with PostgreSqlContainer — DO NOT re-declare

[Fact]
public async Task GetClienteById_WhenExists_Returns200WithShape()
{
    await using var factory = CreateFactory();
    await MigrateAsync(factory);

    Guid clienteId;
    using (var scope = factory.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var entity = new ClienteEntity
        {
            Nombre = "Empresa Detail Test",
            Nit = "999-detail-1",
            Ciudad = "Medellín",
            Telefono = "3001234567",
        };
        db.Clientes.Add(entity);
        await db.SaveChangesAsync();
        clienteId = entity.Id;
    }

    var client = factory.CreateClient();
    var response = await client.GetAsync($"/api/v1/clientes/{clienteId}");

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    var json = await response.Content.ReadAsStringAsync();
    var cliente = JsonSerializer.Deserialize<ClienteDto>(json, JsonOptions);
    Assert.NotNull(cliente);
    Assert.Equal("Empresa Detail Test", cliente.Nombre);
    Assert.Equal(clienteId, cliente.Id);
}

[Fact]
public async Task GetClienteById_WhenNotFound_Returns404()
{
    await using var factory = CreateFactory();
    await MigrateAsync(factory);
    var client = factory.CreateClient();

    var response = await client.GetAsync($"/api/v1/clientes/{Guid.NewGuid()}");

    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
}
```

> **Key Testcontainers facts:**
> - ADD tests to EXISTING class — `IAsyncLifetime`, `_postgres`, `CreateFactory()`, `MigrateAsync()` already defined.
> - `Microsoft.EntityFrameworkCore.InMemory` was removed — do NOT use `.UseInMemoryDatabase()`.

---

### Frontend Test Patterns

**`useCliente.test.ts` (MSW — MANDATORY):**
```typescript
// frontend/src/modules/crm/clientes/application/useCliente.test.ts
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { renderHook, waitFor } from '@testing-library/react'
import { createWrapper } from '@/test/utils'  // QueryClient wrapper — check if exists, create if not
import { useCliente } from './useCliente'

const BASE = 'http://localhost:5000/api/v1'

it('returns cliente data on success', async () => {
  const id = '550e8400-e29b-41d4-a716-446655440000'
  server.use(
    http.get(`${BASE}/clientes/${id}`, () =>
      HttpResponse.json({ id, nombre: 'Empresa X', nit: '900-1', telefono: null, ciudad: null })
    )
  )
  const { result } = renderHook(() => useCliente(id), { wrapper: createWrapper() })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data?.nombre).toBe('Empresa X')
})

it('returns error with status 404 on not found', async () => {
  const id = 'nonexistent-id'
  server.use(
    http.get(`${BASE}/clientes/${id}`, () =>
      HttpResponse.json({ title: 'Not Found' }, { status: 404 })
    )
  )
  const { result } = renderHook(() => useCliente(id), { wrapper: createWrapper() })
  await waitFor(() => expect(result.current.isError).toBe(true))
})
```

> ⚠️ Check if `@/test/utils` exists and exports a `createWrapper()` factory for `QueryClientProvider`. If not, create it inline.

**`ClienteDetailView.test.tsx`:**
```typescript
// frontend/src/modules/crm/clientes/presentation/ClienteDetailView.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { ClienteDetailView } from './ClienteDetailView'
// Wrap with QueryClientProvider + MemoryRouter for useNavigate

it('renders client fields on success', async () => {
  const id = '...'
  server.use(http.get(`.../${id}`, () => HttpResponse.json({ id, nombre: 'Empresa X', nit: '900-1', ... })))
  render(<ClienteDetailView clienteId={id} />, { wrapper })
  await waitFor(() => expect(screen.getByText('Empresa X')).toBeInTheDocument())
  expect(screen.getByText('900-1')).toBeInTheDocument()
})

it('shows loading skeleton while fetching', () => { ... })
it('shows "Cliente no encontrado." on 404', async () => { ... })
it('shows ErrorPanel on network error', async () => { ... })
it('Volver button navigates to /clientes', async () => { ... })
```

---

### Spanish UI Text (ALL text must be in Spanish)

```
✅ "Cliente no encontrado."                     ← 404 message
✅ "No se pudo cargar el cliente."              ← generic error message
✅ "Reintentar"                                  ← retry button (from ErrorPanel)
✅ "Volver"                                      ← back button
✅ "Volver a clientes"                           ← back button in 404 state
✅ "Nombre"                                      ← DescriptionList term
✅ "NIT/RUC"                                     ← DescriptionList term
✅ "Teléfono"                                    ← DescriptionList term
✅ "Ciudad"                                      ← DescriptionList term
✅ "—"                                           ← null field placeholder
❌ "Client not found"                            ← FORBIDDEN
❌ "Loading..."                                  ← FORBIDDEN
```

---

### Architecture Constraints (Non-Negotiable)

- **`DateTimeOffset`** everywhere in C# — NEVER `DateTime`
- **`Guid`** PKs — NEVER `int`
- **`AsNoTracking()`** on `GetByIdAsync` — read-only operation
- **`['clientes', id]`** query key — array, NEVER string
- **`retry: false` on 404** — do not retry not-found; retry on network errors only
- **`DescriptionList.details` is `string`** — never pass ReactNode; use `?? '—'` for nullable fields
- **No Swagger** — Scalar already configured (no `.AddSwaggerGen()`)
- **`UseSnakeCaseNamingConvention()`** already in Program.cs — do NOT call in entity configurations
- **`AppDbContext` already applies configurations** via `ApplyConfigurationsFromAssembly` — no manual registration needed

---

### Project Structure Notes

**Files to create/modify:**

```
backend/
├── src/
│   ├── SiesaAgents.Domain/Clientes/
│   │   └── Interfaces/IClienteRepository.cs          ← MODIFY: add GetByIdAsync
│   ├── SiesaAgents.Infrastructure/Repositories/
│   │   └── ClienteRepository.cs                      ← MODIFY: implement GetByIdAsync
│   ├── SiesaAgents.Application/Clientes/Queries/
│   │   ├── GetClienteByIdQuery.cs                    ← NEW
│   │   └── GetClienteByIdQueryHandler.cs             ← NEW
│   └── SiesaAgents.API/
│       ├── Endpoints/ClienteEndpoints.cs             ← MODIFY: add GET /{id:guid}
│       └── Program.cs                               ← MODIFY: register handler
└── tests/
    ├── SiesaAgents.UnitTests/Application/Clientes/
    │   └── GetClienteByIdQueryHandlerTests.cs        ← NEW
    └── SiesaAgents.IntegrationTests/Clientes/
        └── ClienteEndpointsTests.cs                  ← MODIFY: add 2 new tests

frontend/
└── src/
    ├── modules/crm/clientes/
    │   ├── domain/IClienteRepository.ts              ← MODIFY: add getById
    │   ├── infrastructure/clienteApiRepository.ts    ← MODIFY: add getById
    │   ├── application/
    │   │   ├── useCliente.ts                         ← NEW
    │   │   └── useCliente.test.ts                    ← NEW
    │   └── presentation/
    │       ├── ClienteDetailView.tsx                 ← NEW
    │       └── ClienteDetailView.test.tsx            ← NEW
    └── routes/_app/
        ├── clientes.tsx                              ← MODIFY: wire onSelect → navigate
        └── clientes.$clienteId.tsx                  ← NEW
```

---

### References

- Story 2.2 AC: [`_bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md#Story 2.2`]
- Story 2.1 patterns (ClienteEntity, IClienteRepository, ClienteDto, ClienteListView props): [`_bmad-output/implementation-artifacts/2-1-client-list-search.md`]
- Story 3.2 parallel reference (ContactoDetailView, useContacto, route pattern, DescriptionList): [`_bmad-output/implementation-artifacts/3-2-contact-detail-view.md`]
- Architecture — API contracts: [`_bmad-output/planning-artifacts/architecture.md#API Endpoints`]
- Architecture — TanStack Query keys: [`_bmad-output/planning-artifacts/architecture.md#TanStack Query keys`]
- Architecture — routing: [`_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`]
- `DescriptionList` types: [`frontend/node_modules/siesa-ui-kit/dist/components/DescriptionList/DescriptionList.types.d.ts`]
- `Button` types: [`frontend/node_modules/siesa-ui-kit/dist/components/Button/Button.types.d.ts`]

### Latest Verified Versions (March 2026)

| Library | Version | Notes |
|---|---|---|
| siesa-ui-kit | **1.0.77** | `DescriptionList({ term, details })` + `Button({ type, onClick, children })` confirmed exported |
| @tanstack/react-router | **1.166.7** | `$` param prefix in filename, `Route.useParams()`, `useNavigate()` |
| @tanstack/react-query | **5.90.21** | `retry` callback for 404 suppression |
| react | **19.2.4** | React 19 compatible |
| Testcontainers.PostgreSql | **4.2.0** | Add tests to EXISTING class — do NOT recreate lifecycle |

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `useCliente` retry function: does NOT retry on network errors (no `response`) or 404 — only retries on server errors (5xx). This is intentional: network errors surface immediately to `ErrorPanel` for user-triggered retry via "Reintentar".
- `ClienteDetailView.test.tsx` uses `vi.mock('../application/useCliente')` and `vi.mock('@tanstack/react-router')` to avoid needing a full TanStack Router context. Cast uses `as unknown as ReturnType<...>` per project pattern.
- `nombre` field appears twice in `ClienteDetailView` (in `h1` heading and `DescriptionList`) — test uses `getAllByText` + `getByRole('heading')` to handle this.
- `clientes.tsx` updated to wire `onSelect → navigate` — previously had no navigation from list items (Story 2.1 placeholder).
- All 47 frontend tests pass; `npm run build` succeeds with 0 TypeScript errors.
- All 14 backend unit tests pass; `dotnet build` 0 errors.
- Integration tests require Docker running locally (Testcontainers).

### File List

**Backend — Modified:**
- `backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs` (added `GetByIdAsync`)
- `backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs` (implemented `GetByIdAsync` with `AsNoTracking`)
- `backend/src/SiesaAgents.API/Endpoints/ClienteEndpoints.cs` (added `GET /clientes/{id:guid}`)
- `backend/src/SiesaAgents.API/Program.cs` (registered `GetClienteByIdQueryHandler`)
- `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs` (added `GetClienteById_WhenExists_Returns200WithShape` + `GetClienteById_WhenNotFound_Returns404`)

**Backend — Created:**
- `backend/src/SiesaAgents.Application/Clientes/Queries/GetClienteByIdQuery.cs`
- `backend/src/SiesaAgents.Application/Clientes/Queries/GetClienteByIdQueryHandler.cs`
- `backend/tests/SiesaAgents.UnitTests/Application/Clientes/GetClienteByIdQueryHandlerTests.cs`

**Frontend — Created:**
- `frontend/src/modules/crm/clientes/application/useCliente.ts`
- `frontend/src/modules/crm/clientes/application/useCliente.test.ts`
- `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.tsx`
- `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.test.tsx`
- `frontend/src/routes/_app/clientes.$clienteId.tsx`

**Frontend — Modified:**
- `frontend/src/modules/crm/clientes/domain/IClienteRepository.ts` (added `getById`)
- `frontend/src/modules/crm/clientes/infrastructure/clienteApiRepository.ts` (implemented `getById`)
- `frontend/src/routes/_app/clientes.tsx` (wired `onSelect → navigate`)
