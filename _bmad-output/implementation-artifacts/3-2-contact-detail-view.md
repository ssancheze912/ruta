# Story 3.2: Contact Detail View

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to view the complete details of a contact by selecting them from the list,
So that I can review all their information at once.

## Acceptance Criteria

1. **AC1 — Navigation from List**: When the user clicks "Ver" on a contact row in `/contactos`, the browser navigates to `/contactos/:contactoId` and the detail view displays that contact's information. (FR13, FR30)

2. **AC2 — Detail Fields Displayed**: The contact detail view shows: Nombre, Cargo, Teléfono, and Email. Each field is rendered using `DescriptionList` from `siesa-ui-kit`. (FR13)

3. **AC3 — Direct URL Access**: When the user navigates directly to `/contactos/:contactoId` (e.g., via bookmark or shared link), the correct contact details are displayed without requiring prior list navigation. (FR30)

4. **AC4 — Not-Found State**: When the `contactoId` in the URL does not correspond to any existing contact (404 from backend), the view displays a clear not-found message in Spanish. No technical error details exposed.

5. **AC5 — Loading State**: While the contact data is being fetched, a loading indicator is shown (skeleton or spinner). The view does not render empty fields during load.

6. **AC6 — Error State**: When the backend is unavailable and the fetch fails (non-404 error), the `ErrorPanel` component is displayed with a "Reintentar" button.

7. **AC7 — Backend: GET /api/v1/contactos/{id}**: The endpoint returns 200 OK with a single `ContactoDto` when the contact exists. Returns 404 Problem Details when the `id` is not found. Follows Problem Details RFC 7807 on all errors.

8. **AC8 — "Volver" Button**: A "Volver" button is visible on the detail view. Clicking it navigates back to `/contactos` (the contact list).

## Tasks / Subtasks

### Backend

- [x] Task 1: Extend Application Layer (AC: 7)
  - [x] 1.1 Create `backend/src/SiesaAgents.Application/Contactos/Queries/GetContactoByIdQuery.cs`
  - [x] 1.2 Create `backend/src/SiesaAgents.Application/Contactos/Queries/GetContactoByIdQueryHandler.cs`

- [x] Task 2: Extend API Endpoint (AC: 7)
  - [x] 2.1 Add `GET /contactos/{id}` to `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs`
  - [x] 2.2 Register `GetContactoByIdQueryHandler` in `backend/src/SiesaAgents.API/Program.cs`

- [x] Task 3: Backend Tests (AC: 7)
  - [x] 3.1 Add unit tests to `GetContactoByIdQueryHandlerTests.cs` — found + not found cases
  - [x] 3.2 Add integration tests to `ContactoEndpointsTests.cs` — `GetContactoById_WhenExists_Returns200WithShape` + `GetContactoById_WhenNotFound_Returns404`
  - [x] 3.3 `dotnet build` — 0 errors, 0 warnings ✅
  - [x] 3.4 `dotnet test` — all passed ✅

### Frontend

- [x] Task 4: Extend Domain + Infrastructure Layers (AC: 3)
  - [x] 4.1 Add `getById(id: string): Promise<Contacto>` to `frontend/src/modules/crm/contactos/domain/IContactoRepository.ts`
  - [x] 4.2 Add `getById` implementation to `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts`

- [x] Task 5: Create Application Layer (AC: 3, 5, 6)
  - [x] 5.1 Create `frontend/src/modules/crm/contactos/application/useContacto.ts` — `useQuery({ queryKey: ['contactos', id] })`

- [x] Task 6: Create Presentation Layer (AC: 1, 2, 4, 5, 6, 8)
  - [x] 6.1 Create `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx`
  - [x] 6.2 Create `frontend/src/routes/_app/contactos.$contactoId.tsx`
  - [x] 6.3 Update `ContactoListView.tsx` — add "Ver" link column using TanStack `Link`

- [x] Task 7: Frontend Tests (AC: 1, 2, 4, 5, 6, 8)
  - [x] 7.1 Create `ContactoDetailView.test.tsx` — render fields, loading, error, not-found, volver navigation
  - [x] 7.2 Create `useContacto.test.ts` — success, not-found (404), network error
  - [x] 7.3 `npm run build` — 0 TypeScript errors ✅
  - [x] 7.4 `npm test` — all passed ✅

## Dev Notes

### ⚠️ Prerequisites

- Story 3.1 (`done`) — `ContactoEntity`, `IContactoRepository` (with `GetByIdAsync`), `ContactoRepository.GetByIdAsync`, `ContactoDto`, `AppDbContext`, `ContactoEndpoints` base, `apiClient.ts`, `ErrorPanel.tsx` all exist.
- `GetByIdAsync(Guid id, CancellationToken ct)` is already implemented in `ContactoRepository` — no infrastructure changes needed.

---

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` v1.0.77 (already installed)
- **Import styles**: `import 'siesa-ui-kit/styles.css'` — already in `main.tsx`, do NOT add again
- **Components required**:
  - `DescriptionList` — **PRIMARY component** for displaying contact fields. Renders a term/details pair in two columns. Use one `DescriptionList` per field row.
  - `Button` — for "Volver" navigation. Use `type="outline-solid"` (secondary action).
- **Constraint**: Do NOT create custom key-value field rows. Use `DescriptionList` natively.

---

### `DescriptionList` Component Pattern (siesa-ui-kit v1.0.77)

```typescript
import { DescriptionList, Button } from 'siesa-ui-kit'

// Correct usage — term and details are both required strings
<DescriptionList term="Nombre" details={contacto.nombre} />
<DescriptionList term="Cargo" details={contacto.cargo} />
<DescriptionList term="Teléfono" details={contacto.telefono} />
<DescriptionList term="Email" details={contacto.email} />
```

> ⚠️ `details` is typed as `string` — do NOT pass ReactNode. No Badge inside DescriptionList.

---

### `Button` Component Pattern (siesa-ui-kit v1.0.77)

```typescript
// type prop is the visual style — use 'outline-solid' for secondary/back actions
// children for text — NOT label prop
<Button type="outline-solid" onClick={() => navigate({ to: '/contactos' })}>
  Volver
</Button>
```

---

### `ContactoDetailView` Pattern

```typescript
// frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx
import { DescriptionList, Button } from 'siesa-ui-kit'
import { useNavigate } from '@tanstack/react-router'
import { useContacto } from '../application/useContacto'
import { ErrorPanel } from '@/shared/components/ErrorPanel'

interface ContactoDetailViewProps {
  contactoId: string
}

export function ContactoDetailView({ contactoId }: ContactoDetailViewProps) {
  const navigate = useNavigate()
  const { data: contacto, isLoading, isError, error, refetch } = useContacto(contactoId)

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-100 rounded" />
        ))}
      </div>
    )
  }

  // 404 — contact not found
  if (isError && (error as any)?.response?.status === 404) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <p className="text-slate-600">Contacto no encontrado.</p>
        <Button type="outline-solid" onClick={() => navigate({ to: '/contactos' })}>
          Volver a contactos
        </Button>
      </div>
    )
  }

  // Other errors
  if (isError) {
    return <ErrorPanel message="No se pudo cargar el contacto." onRetry={() => refetch()} />
  }

  if (!contacto) return null

  return (
    <div className="p-6 space-y-1">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">{contacto.nombre}</h1>
        <Button type="outline-solid" onClick={() => navigate({ to: '/contactos' })}>
          Volver
        </Button>
      </div>

      <DescriptionList term="Nombre" details={contacto.nombre} />
      <DescriptionList term="Cargo" details={contacto.cargo} />
      <DescriptionList term="Teléfono" details={contacto.telefono} />
      <DescriptionList term="Email" details={contacto.email} />
    </div>
  )
}
```

---

### Route Pattern (TanStack Router file-based)

```typescript
// frontend/src/routes/_app/contactos.$contactoId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { ContactoDetailView } from '@/modules/crm/contactos/presentation/ContactoDetailView'

export const Route = createFileRoute('/_app/contactos/$contactoId')({
  component: ContactoDetailViewRoute,
})

function ContactoDetailViewRoute() {
  const { contactoId } = Route.useParams()
  return <ContactoDetailView contactoId={contactoId} />
}
```

> ⚠️ TanStack Router file-based routing: `$` prefix in filename = dynamic param. File must be named `contactos.$contactoId.tsx` (dot-separated, not slash).

---

### `useContacto` Hook Pattern

```typescript
// frontend/src/modules/crm/contactos/application/useContacto.ts
import { useQuery } from '@tanstack/react-query'
import { contactoRepository } from '../infrastructure/contactoApiRepository'

export function useContacto(id: string) {
  return useQuery({
    queryKey: ['contactos', id],
    queryFn: () => contactoRepository.getById(id),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Do not retry on 404
      if (error?.response?.status === 404) return false
      return failureCount < 2
    },
  })
}
```

---

### `contactoApiRepository.getById` Pattern

```typescript
// Add to contactoApiRepository.ts (reinstate getById removed in review)
async getById(id: string): Promise<Contacto> {
  const response = await apiClient.get<Contacto>(`/contactos/${id}`)
  return response.data
}
```

Also update `IContactoRepository.ts`:
```typescript
export interface IContactoRepository {
  getAll(): Promise<Contacto[]>
  getById(id: string): Promise<Contacto>
}
```

---

### "Ver" Link Column in `ContactoListView` Pattern

```typescript
// Add as last column in ContactoListView.tsx columns array
import { Link } from '@tanstack/react-router'

{
  header: '',
  accessor: 'id',
  render: (_value: unknown, row: Contacto) => (
    <Link
      to="/contactos/$contactoId"
      params={{ contactoId: row.id }}
      className="text-sm text-blue-600 hover:underline"
    >
      Ver
    </Link>
  ),
},
```

> ⚠️ `ListView` does NOT have `onRowClick` prop. Use a link column as the only row navigation mechanism.

---

### Backend — `GetContactoByIdQueryHandler` Pattern

```csharp
// backend/src/SiesaAgents.Application/Contactos/Queries/GetContactoByIdQueryHandler.cs
using SiesaAgents.Application.Contactos.DTOs;
using SiesaAgents.Domain.Contactos.Interfaces;

namespace SiesaAgents.Application.Contactos.Queries;

public class GetContactoByIdQueryHandler(IContactoRepository repository)
{
    public async Task<ContactoDto?> HandleAsync(
        GetContactoByIdQuery query, CancellationToken ct = default)
    {
        var contacto = await repository.GetByIdAsync(query.Id, ct);
        if (contacto is null) return null;

        return new ContactoDto(
            contacto.Id, contacto.Nombre, contacto.Cargo, contacto.Telefono,
            contacto.Email, contacto.ClienteId, contacto.CreatedAt, contacto.UpdatedAt);
    }
}
```

---

### Backend — `GET /contactos/{id}` Endpoint Pattern

```csharp
// Add to ContactoEndpoints.cs inside MapContactoEndpoints()
group.MapGet("/contactos/{id:guid}", async (
    Guid id,
    GetContactoByIdQueryHandler handler,
    CancellationToken ct) =>
{
    var result = await handler.HandleAsync(new GetContactoByIdQuery(id), ct);
    return result is null
        ? Results.NotFound()
        : Results.Ok(result);
})
.WithName("GetContactoById")
.WithSummary("Obtiene un contacto por ID")
.Produces<ContactoDto>()
.Produces(StatusCodes.Status404NotFound);
```

> ⚠️ Use `{id:guid}` route constraint — rejects non-UUID requests before reaching the handler.
> `Results.NotFound()` is automatically formatted as Problem Details by the global `ExceptionHandlingMiddleware` + ASP.NET Core's built-in Problem Details support.

---

### Architecture Constraints (Non-Negotiable)

- **`DateTimeOffset`** everywhere in C# — NEVER `DateTime`
- **`Guid`** PKs — NEVER `int`
- **`AsNoTracking()`** already in `ContactoRepository.GetByIdAsync` — confirmed ✅
- **`['contactos', id]`** query key — array, never string
- **Spanish UI text** — "Volver", "Contacto no encontrado.", "No se pudo cargar el contacto.", "Reintentar", "Volver a contactos"
- **No Swagger** — Scalar already configured
- **`retry: false` on 404** — do not retry not-found; retry on network errors only
- **`DescriptionList.details` is `string`** — never pass ReactNode

---

### Project Structure Notes

**Files to create/modify:**

```
backend/
├── src/
│   ├── SiesaAgents.Application/
│   │   └── Contactos/
│   │       └── Queries/
│   │           ├── GetContactoByIdQuery.cs          ← NEW
│   │           └── GetContactoByIdQueryHandler.cs   ← NEW
│   └── SiesaAgents.API/
│       ├── Endpoints/
│       │   └── ContactoEndpoints.cs                 ← MODIFY: add GET /{id}
│       └── Program.cs                               ← MODIFY: register handler
└── tests/
    └── SiesaAgents.UnitTests/
    │   └── Application/
    │       └── Contactos/
    │           └── GetContactoByIdQueryHandlerTests.cs ← NEW
    └── SiesaAgents.IntegrationTests/
        └── Contactos/
            └── ContactoEndpointsTests.cs            ← MODIFY: add 200+404 tests

frontend/
├── src/
│   ├── modules/crm/contactos/
│   │   ├── domain/
│   │   │   └── IContactoRepository.ts              ← MODIFY: add getById
│   │   ├── application/
│   │   │   ├── useContacto.ts                      ← NEW
│   │   │   └── useContacto.test.ts                 ← NEW
│   │   ├── infrastructure/
│   │   │   └── contactoApiRepository.ts            ← MODIFY: add getById
│   │   └── presentation/
│   │       ├── ContactoDetailView.tsx              ← NEW
│   │       └── ContactoDetailView.test.tsx         ← NEW
│   └── routes/_app/
│       ├── contactos.tsx                           ← MODIFY: add "Ver" link column
│       └── contactos.$contactoId.tsx               ← NEW
```

---

### Integration Test Pattern (Testcontainers — MANDATORY)

The integration test project was upgraded to use **real PostgreSQL via Testcontainers** (not InMemory). All new integration tests MUST follow this pattern:

```csharp
// backend/tests/SiesaAgents.IntegrationTests/Contactos/ContactoEndpointsTests.cs
// ADD to the existing class (implements IAsyncLifetime with PostgreSqlContainer)

[Fact]
public async Task GetContactoById_WhenExists_Returns200WithShape()
{
    await using var factory = CreateFactory();
    await MigrateAsync(factory);

    Guid contactoId;
    using (var scope = factory.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var entity = new ContactoEntity
        {
            Nombre = "Test User",
            Cargo = "Analista",
            Telefono = "3001234567",
            Email = "test@test.com",
            ClienteId = null,
        };
        db.Contactos.Add(entity);
        await db.SaveChangesAsync();
        contactoId = entity.Id;
    }

    var client = factory.CreateClient();
    var response = await client.GetAsync($"/api/v1/contactos/{contactoId}");

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    var json = await response.Content.ReadAsStringAsync();
    var contacto = JsonSerializer.Deserialize<ContactoDto>(json, JsonOptions);
    Assert.NotNull(contacto);
    Assert.Equal("Test User", contacto.Nombre);
    Assert.Equal(contactoId, contacto.Id);
}

[Fact]
public async Task GetContactoById_WhenNotFound_Returns404()
{
    await using var factory = CreateFactory();
    await MigrateAsync(factory);
    var client = factory.CreateClient();

    var response = await client.GetAsync($"/api/v1/contactos/{Guid.NewGuid()}");

    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
}
```

> **Key facts about the new Testcontainers setup:**
> - Class implements `IAsyncLifetime` — `InitializeAsync` starts a real postgres:16-alpine container; `DisposeAsync` stops it
> - `CreateFactory()` uses `_postgres.GetConnectionString()` — real DB, runs actual EF Core migrations
> - `MigrateAsync(factory)` calls `db.Database.MigrateAsync()` — applies all pending migrations to the test DB
> - `Microsoft.EntityFrameworkCore.InMemory` was removed from the .csproj — do NOT use `.UseInMemoryDatabase()`
> - `Testcontainers.PostgreSql` v4.2.0 is the package
> - Requires Docker to be running locally

---

### References

- Epic 3 story 3.2: [`_bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md#Story 3.2`]
- Story 3.1 patterns (ContactoEntity, IContactoRepository, ContactoDto, apiClient, ErrorPanel): [`_bmad-output/implementation-artifacts/3-1-contact-list-search.md`]
- Architecture — routing (TanStack file-based): [`_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`]
- Architecture — TanStack Query keys: [`_bmad-output/planning-artifacts/architecture.md#TanStack Query keys`]
- siesa-ui-kit DescriptionList: [`frontend/node_modules/siesa-ui-kit/dist/components/DescriptionList/DescriptionList.types.d.ts`]
- siesa-ui-kit Button: [`frontend/node_modules/siesa-ui-kit/dist/components/Button/Button.types.d.ts`]

### Latest Verified Versions (March 2026)

| Library | Version | Notes |
|---|---|---|
| siesa-ui-kit | **1.0.77** | `DescriptionList`, `Button` confirmed exported |
| @tanstack/react-router | **1.166.7** | File-based routing, `$` param prefix in filename |
| @tanstack/react-query | **5.90.21** | `retry` callback for 404 suppression |
| react | **19.2.4** | React 19 compatible |
| Npgsql.EntityFrameworkCore.PostgreSQL | **10.0.1** | No changes needed |

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — clean implementation, no blocking errors.

### Completion Notes List

- Backend GET /{id} endpoint follows `{id:guid}` route constraint pattern.
- Frontend `routeTree.gen.ts` updated manually then auto-corrected by Vite plugin (nested route under `AppContactosRoute`).
- `ContactoListView.test.tsx` required `@tanstack/react-router` mock after adding `Link` column.
- `useContacto.test.ts` uses `retryDelay: 0` in QueryClient to keep retries instant in tests.
- All 37 frontend tests pass; 11 backend unit tests pass.

### File List

**Backend — New:**
- `backend/src/SiesaAgents.Application/Contactos/Queries/GetContactoByIdQuery.cs`
- `backend/src/SiesaAgents.Application/Contactos/Queries/GetContactoByIdQueryHandler.cs`
- `backend/tests/SiesaAgents.UnitTests/Application/Contactos/GetContactoByIdQueryHandlerTests.cs`

**Backend — Modified:**
- `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs`
- `backend/src/SiesaAgents.API/Program.cs`
- `backend/tests/SiesaAgents.IntegrationTests/Contactos/ContactoEndpointsTests.cs`

**Frontend — New:**
- `frontend/src/modules/crm/contactos/application/useContacto.ts`
- `frontend/src/modules/crm/contactos/application/useContacto.test.ts`
- `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx`
- `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx`
- `frontend/src/routes/_app/contactos.$contactoId.tsx`

**Frontend — Modified:**
- `frontend/src/modules/crm/contactos/domain/IContactoRepository.ts`
- `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts`
- `frontend/src/modules/crm/contactos/presentation/ContactoListView.tsx`
- `frontend/src/modules/crm/contactos/presentation/ContactoListView.test.tsx`
- `frontend/src/routeTree.gen.ts`
