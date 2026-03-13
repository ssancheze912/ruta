---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
status: review
epic: 2
story: 1
storyKey: 2-1-client-list-search
createdAt: '2026-03-13'
---

# Story 2.1: Client List & Search

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to see a list of all clients and search them by name or NIT/RUC,
so that I can quickly find the client I'm looking for.

## Acceptance Criteria

1. **AC1 — Client List Displayed**: When the user navigates to `/clientes`, the left panel (exactly 280px wide) shows a scrollable list of all clients. Each list item displays the client's **Nombre** and **NIT/RUC**.

2. **AC2 — Real-Time Search**: When the user types in the search field, the list filters in real time (client-side) showing only clients whose Nombre or NIT/RUC match the input (case-insensitive). Results appear in under 1 second with up to 500 records (NFR1).

3. **AC3 — Empty State**: When there are no clients in the system (empty array from API), an `EmptyState` component is displayed with a message guiding the user to create the first client.

4. **AC4 — Error State**: When the backend is unavailable or the fetch fails, an error panel is displayed with a "Reintentar" button that re-triggers the fetch.

5. **AC5 — Backend Endpoint**: `GET /api/v1/clientes` returns an array of `ClienteDto` objects with fields `id`, `nombre`, `nit`, `telefono`, `ciudad`, `createdAt`, `updatedAt`. Returns `200 OK` with an empty array `[]` when no clients exist.

6. **AC6 — Database Table**: The `clientes` table exists in `siesa_agents_db` after running the migration. Columns: `id` (uuid PK), `nombre` (varchar, not null), `nit` (varchar, unique not null), `telefono` (varchar), `ciudad` (varchar), `created_at` (timestamptz), `updated_at` (timestamptz).

## Tasks / Subtasks

### BACKEND

- [x] Task 1: Domain Layer — ClienteEntity & Repository Interface (AC: 5, 6)
  - [x] 1.1 Create `backend/src/SiesaAgents.Domain/Clientes/Entities/ClienteEntity.cs` — UUID PK, Nombre, NIT, Telefono, Ciudad, `DateTimeOffset` timestamps (NEVER DateTime)
  - [x] 1.2 Create `backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs` — declare `Task<IEnumerable<ClienteEntity>> GetAllAsync(CancellationToken ct)` method (additional methods for future stories can be added later)

- [x] Task 2: Infrastructure Layer — EF Core Config, AppDbContext, Repository (AC: 6)
  - [x] 2.1 Create `backend/src/SiesaAgents.Infrastructure/Data/Configurations/ClienteConfiguration.cs` — implements `IEntityTypeConfiguration<ClienteEntity>`: table name `clientes`, unique index on `nit` (index name `uk_clientes_nit`), required fields for Nombre and NIT
  - [x] 2.2 Update `backend/src/SiesaAgents.Infrastructure/Data/AppDbContext.cs` — add `public DbSet<ClienteEntity> Clientes => Set<ClienteEntity>();`
  - [x] 2.3 Create `backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs` — implements `IClienteRepository`, uses `AppDbContext`, `GetAllAsync` returns `await _context.Clientes.ToListAsync(ct)` (no sorting needed for MVP)

- [x] Task 3: Application Layer — Query, Handler, DTO (AC: 5)
  - [x] 3.1 Create `backend/src/SiesaAgents.Application/Clientes/DTOs/ClienteDto.cs` — record with `Guid Id`, `string Nombre`, `string Nit`, `string? Telefono`, `string? Ciudad`, `DateTimeOffset CreatedAt`, `DateTimeOffset UpdatedAt`
  - [x] 3.2 Create `backend/src/SiesaAgents.Application/Clientes/Queries/GetClientesQuery.cs` — empty record (no parameters for full list)
  - [x] 3.3 Create `backend/src/SiesaAgents.Application/Clientes/Queries/GetClientesQueryHandler.cs` — injects `IClienteRepository`, maps `ClienteEntity` → `ClienteDto`, returns `IEnumerable<ClienteDto>`

- [x] Task 4: API Layer — Endpoint & DI Registration (AC: 5)
  - [x] 4.1 Create `backend/src/SiesaAgents.API/Endpoints/ClienteEndpoints.cs` — static class with `MapClienteEndpoints(this RouteGroupBuilder group)` extension, registers `GET /clientes` → calls handler → returns `Results.Ok(dtos)`
  - [x] 4.2 Update `backend/src/SiesaAgents.API/Program.cs` — register `IClienteRepository` → `ClienteRepository` as scoped, register `GetClientesQueryHandler` as scoped, call `app.MapGroup("/api/v1").MapClienteEndpoints()`
  - [x] 4.3 Verify `GET /api/v1/clientes` returns `200 OK` with `[]` when no clients exist (integration test) ✅

- [x] Task 5: Database Migration (AC: 6)
  - [x] 5.1 Run migration from repo root: `dotnet ef migrations add AddClienteEntity --project backend/src/SiesaAgents.Infrastructure --startup-project backend/src/SiesaAgents.API`
  - [x] 5.2 Verify generated migration creates `clientes` table with `id uuid PK`, `nombre`, `nit` (unique), `telefono`, `ciudad`, `created_at`, `updated_at` columns ✅
  - [x] 5.3 Run `dotnet ef database update --project backend/src/SiesaAgents.Infrastructure --startup-project backend/src/SiesaAgents.API`
  - [x] 5.4 Confirm `clientes` table exists in `siesa_agents_db` ✅

- [x] Task 6: Backend Tests (AC: 5, 6)
  - [x] 6.1 Create `backend/tests/SiesaAgents.UnitTests/Application/Clientes/GetClientesQueryHandlerTests.cs` — mock `IClienteRepository`, assert handler returns mapped DTOs; test empty list returns empty enumerable ✅
  - [x] 6.2 Create `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs` — test `GET /api/v1/clientes` returns `200 OK` and empty array `[]` using WebApplicationFactory with InMemory EF Core ✅
  - [x] 6.3 Run `dotnet test` — all tests pass ✅
  - [x] 6.4 Run `dotnet build` — 0 errors ✅

### FRONTEND

- [x] Task 7: Domain & Repository Interfaces (AC: 1, 2)
  - [x] 7.1 Create `frontend/src/modules/crm/clientes/domain/Cliente.ts` — TypeScript interface: `{ id: string; nombre: string; nit: string; telefono: string | null; ciudad: string | null; createdAt: string; updatedAt: string }`
  - [x] 7.2 Create `frontend/src/modules/crm/clientes/domain/IClienteRepository.ts` — interface with `getAll(): Promise<Cliente[]>`

- [x] Task 8: Infrastructure — API Repository (AC: 1)
  - [x] 8.1 Create `frontend/src/modules/crm/clientes/infrastructure/clienteApiRepository.ts` — implements `IClienteRepository`, uses `apiClient` Axios instance (`import { apiClient } from '@/shared/lib/apiClient'`), `getAll()` calls `GET /api/v1/clientes`
  - [x] 8.2 Verify `src/shared/lib/apiClient.ts` exists and exports Axios instance with `baseURL: import.meta.env.VITE_API_URL` (created in Story 1.1) ✅

- [x] Task 9: Application — TanStack Query Hook (AC: 1, 2, 4)
  - [x] 9.1 Create `frontend/src/modules/crm/clientes/application/useClientes.ts` — uses `useQuery({ queryKey: ['clientes'], queryFn: () => clienteRepository.getAll() })`; exports `{ clientes, isLoading, isError, refetch }` ✅
  - [x] 9.2 Query key MUST be `['clientes']` — canonical key used for mutation invalidation in future stories ✅

- [x] Task 10: Shared Components (AC: 3, 4)
  - [x] 10.1 Create `frontend/src/shared/components/EmptyState.tsx` — accepts `message: string` prop, renders centered placeholder with SVG icon and message ✅
  - [x] 10.2 Create `frontend/src/shared/components/ErrorPanel.tsx` — accepts `onRetry: () => void` + optional `message?: string` props, renders error message in Spanish + siesa-ui-kit `Button` "Reintentar" ✅

- [x] Task 11: Presentation — ClienteListItem & ClienteListView (AC: 1, 2, 3, 4)
  - [x] 11.1 Create `frontend/src/shared/components/ClientListItem.tsx` — accepts `cliente: Cliente`, `isSelected: boolean`, `onClick: () => void` props. Displays Nombre (primary, truncate) + NIT/RUC (secondary). Visual selection state with `border-l-2 border-l-blue-500` ✅
  - [x] 11.2 Create `frontend/src/modules/crm/clientes/presentation/ClienteListView.tsx` — siesa-ui-kit `Input`, loading skeleton, `ErrorPanel`, `EmptyState`, scrollable `ClientListItem` list, client-side `useMemo` filter on nombre+nit ✅

- [x] Task 12: Route Update (AC: 1, 2, 3, 4)
  - [x] 12.1 Update `frontend/src/routes/_app/clientes.tsx` — split panel: 280px left (`ClienteListView`) + flex-1 right ("Selecciona un cliente para ver su detalle") ✅
  - [x] 12.2 Verify `contentClassName="p-0"` in `__root.tsx` LayoutBase allows split panel to fill full content area ✅

- [x] Task 13: Frontend Tests (AC: 1, 2, 3, 4)
  - [x] 13.1 Create `frontend/src/modules/crm/clientes/application/useClientes.test.ts` — vi.mock on repository, 3 tests: returns list, returns empty array, handles error ✅
  - [x] 13.2 Create `frontend/src/modules/crm/clientes/presentation/ClienteListView.test.tsx` — 6 tests: renders list, EmptyState, ErrorPanel, refetch on retry, filter by nombre, filter by nit ✅
  - [x] 13.3 Run `npm run test` — 28/28 tests pass ✅
  - [x] 13.4 Run `npm run build` — 0 TypeScript errors ✅

## Dev Notes

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` v1.0.76 (already installed — `npm install siesa-ui-kit` already done)
- **Import styles**: `import 'siesa-ui-kit/styles.css'` — already in `main.tsx`, do NOT add again
- **Components to use from siesa-ui-kit**:
  - `Input` — search field (`import { Input } from 'siesa-ui-kit'`)
  - `Button` — "Reintentar" in ErrorPanel (`import { Button } from 'siesa-ui-kit'`)
- **Constraint**: Do NOT create custom Input or Button components. siesa-ui-kit equivalents exist and must be used.
- **ClientListItem**: No direct siesa-ui-kit list-item component was found — build as custom Tailwind component
- **EmptyState / ErrorPanel**: No direct siesa-ui-kit equivalent — build as lightweight custom Tailwind components using siesa-ui-kit tokens

### Architecture Patterns

**Client-Side Search (NFR1 — < 1s for 500 records):**
```typescript
// In ClienteListView.tsx
const [searchTerm, setSearchTerm] = useState('')

const filteredClientes = useMemo(() => {
  if (!searchTerm.trim()) return clientes
  const q = searchTerm.toLowerCase()
  return clientes.filter(c =>
    c.nombre.toLowerCase().includes(q) ||
    c.nit.toLowerCase().includes(q)
  )
}, [clientes, searchTerm])
```

**TanStack Query Hook Pattern:**
```typescript
// src/modules/crm/clientes/application/useClientes.ts
import { useQuery } from '@tanstack/react-query'
import { clienteApiRepository } from '../infrastructure/clienteApiRepository'

export function useClientes() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['clientes'],          // CANONICAL key — used by mutations in 2.3, 2.4, 2.5
    queryFn: () => clienteApiRepository.getAll(),
    staleTime: 5 * 60 * 1000,       // matches queryClient config from Story 1.2
  })
  return {
    clientes: data ?? [],
    isLoading,
    isError,
    refetch,
  }
}
```

**Backend CQRS Pattern (aligned with 1-3 patterns):**
```csharp
// Application/Clientes/Queries/GetClientesQueryHandler.cs
public class GetClientesQueryHandler(IClienteRepository repository)
{
    public async Task<IEnumerable<ClienteDto>> HandleAsync(
        GetClientesQuery query, CancellationToken ct = default)
    {
        var clientes = await repository.GetAllAsync(ct);
        return clientes.Select(c => new ClienteDto(
            c.ID, c.Nombre, c.NIT, c.Telefono, c.Ciudad, c.CreatedAt, c.UpdatedAt));
    }
}
```

**API Endpoint Pattern (Minimal API — aligned with 1.1 patterns):**
```csharp
// API/Endpoints/ClienteEndpoints.cs
public static class ClienteEndpoints
{
    public static void MapClienteEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/v1/clientes");

        group.MapGet("/", async (GetClientesQueryHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new GetClientesQuery(), ct);
            return Results.Ok(result);
        });
    }
}
```

**ClienteEntity Pattern (aligned with 1-3 notes):**
```csharp
// Domain/Clientes/Entities/ClienteEntity.cs
public class ClienteEntity
{
    public Guid ID { get; set; }                   // → column: id (uuid PK)
    public string Nombre { get; set; } = string.Empty;  // → column: nombre
    public string NIT { get; set; } = string.Empty;     // → column: nit (unique)
    public string? Telefono { get; set; }          // → column: telefono (nullable)
    public string? Ciudad { get; set; }            // → column: ciudad (nullable)
    public DateTimeOffset CreatedAt { get; set; }  // → column: created_at (NEVER DateTime)
    public DateTimeOffset UpdatedAt { get; set; }  // → column: updated_at
}
```

**ClienteConfiguration EF Core Pattern:**
```csharp
// Infrastructure/Data/Configurations/ClienteConfiguration.cs
public class ClienteConfiguration : IEntityTypeConfiguration<ClienteEntity>
{
    public void Configure(EntityTypeBuilder<ClienteEntity> builder)
    {
        builder.ToTable("clientes");
        builder.HasKey(c => c.ID);
        builder.Property(c => c.Nombre).IsRequired().HasMaxLength(200);
        builder.Property(c => c.NIT).IsRequired().HasMaxLength(50);
        builder.HasIndex(c => c.NIT).IsUnique().HasDatabaseName("uk_clientes_nit");
        builder.Property(c => c.Telefono).HasMaxLength(50);
        builder.Property(c => c.Ciudad).HasMaxLength(100);
    }
}
```

### ⚠️ Critical Corrections from Story 1-3

- `UseSnakeCaseNamingConvention()` is on `DbContextOptionsBuilder` (already configured in Program.cs) — do NOT call anything snake_case in `OnModelCreating`
- `EFCore.NamingConventions 10.0.1` is ALREADY installed in Infrastructure — do NOT reinstall
- Migration commands require `--project` + `--startup-project` flags, run from **repo root**
- `DateTimeOffset` ALWAYS — never `DateTime`
- `Guid` for ALL primary keys — never `int` or `string`
- `AppDbContext` already has `modelBuilder.ApplyConfigurationsFromAssembly(...)` — `ClienteConfiguration` will be auto-applied once created

### All UI Text MUST be in Spanish

```
✅ "Buscar por nombre o NIT/RUC"     ← search placeholder
✅ "No hay clientes aún. Crea el primer cliente."  ← empty state
✅ "No se pudo cargar la información."  ← error message
✅ "Reintentar"                       ← retry button
✅ "Selecciona un cliente para ver su detalle"  ← right panel placeholder
❌ "Search..."                        ← FORBIDDEN
❌ "No clients found"                 ← FORBIDDEN
```

### JSON Response Shape (auto-serialized by .NET camelCase)

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Empresa XYZ S.A.",
    "nit": "900123456-7",
    "telefono": "+57 1 234 5678",
    "ciudad": "Bogotá",
    "createdAt": "2026-03-13T10:30:00Z",
    "updatedAt": "2026-03-13T10:30:00Z"
  }
]
```

### Error Handling Pattern

- **Load failure** (useClientes isError): render `<ErrorPanel onRetry={refetch} />` — never show `error.message` raw
- **Backend errors**: `ExceptionHandlingMiddleware` already handles → Problem Details RFC 7807 (already implemented in 1.1)
- **Empty list**: `[]` from GET is valid — render `<EmptyState>`, NOT an error

### Project Structure Notes

**Files to CREATE:**

```
backend/
├── src/
│   ├── SiesaAgents.Domain/Clientes/Entities/ClienteEntity.cs          ← NEW
│   ├── SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs    ← NEW
│   ├── SiesaAgents.Infrastructure/Data/Configurations/
│   │   └── ClienteConfiguration.cs                                     ← NEW (replaces .gitkeep)
│   ├── SiesaAgents.Infrastructure/Data/AppDbContext.cs                 ← MODIFY: add DbSet
│   ├── SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs    ← NEW (create folder)
│   ├── SiesaAgents.Application/Clientes/DTOs/ClienteDto.cs             ← NEW (create folders)
│   ├── SiesaAgents.Application/Clientes/Queries/GetClientesQuery.cs    ← NEW
│   ├── SiesaAgents.Application/Clientes/Queries/GetClientesQueryHandler.cs ← NEW
│   └── SiesaAgents.API/Endpoints/ClienteEndpoints.cs                   ← NEW (create folder)
│   └── SiesaAgents.API/Program.cs                                      ← MODIFY: register + map
├── Migrations/[timestamp]_AddClienteEntity.cs                          ← AUTO-GENERATED
└── tests/
    ├── SiesaAgents.UnitTests/Application/Clientes/
    │   └── GetClientesQueryHandlerTests.cs                             ← NEW
    └── SiesaAgents.IntegrationTests/
        └── ClienteEndpointsTests.cs                                    ← NEW

frontend/
├── src/modules/crm/clientes/
│   ├── domain/Cliente.ts                                               ← NEW
│   ├── domain/IClienteRepository.ts                                    ← NEW
│   ├── infrastructure/clienteApiRepository.ts                          ← NEW
│   ├── application/useClientes.ts                                      ← NEW
│   ├── application/useClientes.test.ts                                 ← NEW
│   ├── presentation/ClienteListView.tsx                                ← NEW
│   └── presentation/ClienteListView.test.tsx                           ← NEW
├── src/shared/components/EmptyState.tsx                                ← NEW
├── src/shared/components/ErrorPanel.tsx                                ← NEW
├── src/shared/components/ClientListItem.tsx                            ← NEW
└── src/routes/_app/clientes.tsx                                        ← MODIFY: replace placeholder
```

**Files to VERIFY EXIST (from previous stories):**
- `frontend/src/shared/lib/apiClient.ts` — Axios singleton (Story 1.1)
- `frontend/src/app/providers/queryClient.ts` — QueryClient singleton (Story 1.2)
- `backend/src/SiesaAgents.Infrastructure/Data/AppDbContext.cs` — exists (Story 1.3)
- `backend/src/SiesaAgents.Infrastructure/Data/Configurations/.gitkeep` — exists (Story 1.3)
- `backend/src/SiesaAgents.API/Middleware/ExceptionHandlingMiddleware.cs` — exists (Story 1.1)

### References

- Story User Story & AC: [Epic 2: `_bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md#Story 2.1`]
- API endpoint contract: [Architecture: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`]
- Frontend file structure: [Architecture: `_bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure`]
- Query keys canonical: [Architecture: `_bmad-output/planning-artifacts/architecture.md#TanStack Query keys`]
- Backend Clean Architecture: [Architecture: `_bmad-output/planning-artifacts/architecture.md#Backend Project Structure`]
- EF Core snake_case correction: [Story 1.3: `_bmad-output/implementation-artifacts/1-3-backend-database-foundation.md#Completion Notes List`]
- siesa-ui-kit exports (Input, Button): [local: `frontend/node_modules/siesa-ui-kit/dist/index.d.ts`]
- LayoutBase + contentClassName usage: [Story 1.2: `frontend/src/routes/__root.tsx`]

### Latest Verified Versions

| Item | Version | Source |
|---|---|---|
| siesa-ui-kit | **1.0.76** | `frontend/node_modules/siesa-ui-kit/package.json` |
| TanStack Query | **^5.90.21** | `frontend/package.json` |
| TanStack Router | **^1.166.7** | `frontend/package.json` |
| React | **^19.2.4** | `frontend/package.json` (backwards-compatible with React 18 patterns) |
| Zod | **^4.3.6** | `frontend/package.json` (not used in this story — needed in 2.3) |
| EFCore.NamingConventions | **10.0.1** | Already installed in Infrastructure (Story 1.3) |
| Npgsql.EntityFrameworkCore.PostgreSQL | **10.0.1** | Already installed in Infrastructure (Story 1.3) |

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- EF Core internal service provider conflict (Npgsql + InMemory) when using WebApplicationFactory: resolved by bypassing `AddDbContext` and registering `AppDbContext` directly via `services.AddScoped(_ => new AppDbContext(...UseInMemoryDatabase(dbName).Options))`.
- EFCore.Relational version conflict (10.0.4 vs 10.0.5): fixed by adding explicit `PackageReference` for `Microsoft.EntityFrameworkCore.Relational 10.0.5` in IntegrationTests.csproj.
- `ErrorPanel` extended with optional `message?: string` prop (default: "No se pudo cargar la información.") to satisfy ContactoListView contract from Story 3.1.
- Navigation test `renders Clientes view at /clientes` required `waitFor` timeout of 5000ms — first test run of TanStack Router lazy route needs extra mount time.

### Completion Notes List

- `MapClienteEndpoints` uses `RouteGroupBuilder` (not `WebApplication`) per project-context.md pattern, registered as `app.MapGroup("/api/v1").MapClienteEndpoints()`.
- `public partial class Program {}` added to end of Program.cs to expose for WebApplicationFactory integration tests.
- Frontend tests use `vi.mock` directly on the repository/hook (same pattern as contactos tests) — no MSW needed.
- `ContactoListView.test.tsx` cast fixed: `as unknown as ReturnType<...>` to handle TanStack Query v5 full type.
- All 28 frontend tests pass; `npm run build` succeeds with 0 TypeScript errors.
- All backend tests pass; `dotnet build` 0 errors.

### File List

**Backend — Created:**
- `backend/src/SiesaAgents.Domain/Clientes/Entities/ClienteEntity.cs`
- `backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs`
- `backend/src/SiesaAgents.Infrastructure/Data/Configurations/ClienteConfiguration.cs`
- `backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs`
- `backend/src/SiesaAgents.Application/Clientes/DTOs/ClienteDto.cs`
- `backend/src/SiesaAgents.Application/Clientes/Queries/GetClientesQuery.cs`
- `backend/src/SiesaAgents.Application/Clientes/Queries/GetClientesQueryHandler.cs`
- `backend/src/SiesaAgents.API/Endpoints/ClienteEndpoints.cs`
- `backend/tests/SiesaAgents.UnitTests/Application/Clientes/GetClientesQueryHandlerTests.cs`
- `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs`
- `backend/src/SiesaAgents.Infrastructure/Migrations/[timestamp]_AddClienteEntity.cs` (auto-generated)

**Backend — Modified:**
- `backend/src/SiesaAgents.Infrastructure/Data/AppDbContext.cs` (added `DbSet<ClienteEntity> Clientes`)
- `backend/src/SiesaAgents.API/Program.cs` (DI registration, endpoint mapping, `public partial class Program {}`)

**Frontend — Created:**
- `frontend/src/modules/crm/clientes/domain/Cliente.ts`
- `frontend/src/modules/crm/clientes/domain/IClienteRepository.ts`
- `frontend/src/modules/crm/clientes/infrastructure/clienteApiRepository.ts`
- `frontend/src/modules/crm/clientes/application/useClientes.ts`
- `frontend/src/modules/crm/clientes/application/useClientes.test.ts`
- `frontend/src/modules/crm/clientes/presentation/ClienteListView.tsx`
- `frontend/src/modules/crm/clientes/presentation/ClienteListView.test.tsx`
- `frontend/src/shared/components/EmptyState.tsx`
- `frontend/src/shared/components/ErrorPanel.tsx`
- `frontend/src/shared/components/ClientListItem.tsx`

**Frontend — Modified:**
- `frontend/src/routes/_app/clientes.tsx` (split-panel layout)
- `frontend/src/shared/components/ErrorPanel.tsx` (added optional `message` prop)
- `frontend/src/routes/__tests__/navigation.test.tsx` (updated stale heading assertions, increased waitFor timeout)
- `frontend/src/modules/crm/contactos/presentation/ContactoListView.test.tsx` (fixed type cast)
- `frontend/src/routes/__root.tsx` (added Spanish labels to NavigationRail: `collapseButton`, `searchPlaceholder` — P0 compliance)
- `frontend/package.json` + `frontend/package-lock.json` (siesa-ui-kit upgraded 1.0.76 → 1.0.77; required for NavigationRail labels support)

**Frontend — Created (code-review fixes):**
- `frontend/src/mocks/handlers.ts` (MSW default handlers)
- `frontend/src/mocks/server.ts` (MSW node server)
- `frontend/src/modules/crm/clientes/presentation/ClienteListView.tsx` — EmptyState logic fixed: distinguishes API-empty vs search-empty
- `frontend/src/modules/crm/clientes/application/useClientes.test.ts` — rewritten with MSW (was vi.mock)
- `frontend/src/test/setup.ts` — added MSW server lifecycle (beforeAll/afterEach/afterAll)

**Backend — Modified (code-review fixes):**
- `backend/tests/SiesaAgents.IntegrationTests/SiesaAgents.IntegrationTests.csproj` (removed InMemory, added Testcontainers.PostgreSql 4.2.0)
- `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs` (rewritten with TestContainers; added unique constraint test)
- `backend/tests/SiesaAgents.IntegrationTests/Contactos/ContactoEndpointsTests.cs` (rewritten with TestContainers)

**NOTE:** `AppDbContext.cs`, `Program.cs`, and `AddClienteEntity` migration were committed in Story 3.1 commit (`fba88a8`) due to parallel development — not in Story 2.1 commit (`3e947fc`).
