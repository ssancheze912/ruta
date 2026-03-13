# Story 3.1: Contact List & Search

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to see a list of all contacts and search them by name or email,
So that I can quickly find any contact regardless of their client association.

## Acceptance Criteria

1. **AC1 — Contact List View**: When the user navigates to `/contactos`, a list of all contacts is displayed showing Nombre, Cargo, and Email per item. The route replaces the current Story 1.2 placeholder. (FR10)

2. **AC2 — Real-time Search**: When the user types in the search field, the list filters in real time showing only contacts whose Nombre or Email match the input. Results appear in under 1 second with up to 1,000 records. No submit button required — filtering is client-side via `useMemo`. (NFR1, FR11, FR12)

3. **AC3 — Empty State**: When there are no contacts in the system, an empty state message is displayed guiding the user to create the first contact. (Uses `emptyMessage` prop on `ListView`.)

4. **AC4 — Error State**: When the backend is unavailable and the fetch fails, an `ErrorPanel` with a "Reintentar" button is displayed instead of the list. The retry re-triggers the TanStack Query fetch.

5. **AC5 — "Sin cliente" Quick Filter**: A "Sin cliente" filter chip is visible in the toolbar. When activated, the list shows only contacts where `clienteId === null`. Badge color: amber. Filter is client-side only.

6. **AC6 — Loading State**: While contacts are being fetched, the `ListView` renders skeleton rows (`loading={true}`, `loadingRows={6}`).

7. **AC7 — Backend: GET /api/v1/contactos**: The endpoint returns a JSON array of all contacts (no filtering server-side for MVP). Response: 200 OK with array of `ContactoDto`. Empty array when no records. Follows Problem Details RFC 7807 on error.

8. **AC8 — EF Migration**: The `contactos` table exists in `siesa_agents_db` with columns: `id` (uuid PK), `nombre`, `cargo`, `telefono`, `email`, `cliente_id` (uuid nullable FK → `clientes.id` ON DELETE SET NULL), `created_at`, `updated_at`. Indexes: `ix_contactos_cliente_id`, `ix_contactos_email`.

## Tasks / Subtasks

### Backend

- [x] Task 1: Create Domain Layer (AC: 7, 8)
  - [x] 1.1 Create `backend/src/SiesaAgents.Domain/Contactos/Entities/ContactoEntity.cs`
  - [x] 1.2 Create `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs`

- [x] Task 2: Create Application Layer (AC: 7)
  - [x] 2.1 Create `backend/src/SiesaAgents.Application/Contactos/DTOs/ContactoDto.cs`
  - [x] 2.2 Create `backend/src/SiesaAgents.Application/Contactos/Queries/GetContactosQuery.cs`
  - [x] 2.3 Create `backend/src/SiesaAgents.Application/Contactos/Queries/GetContactosQueryHandler.cs`

- [x] Task 3: Create Infrastructure Layer (AC: 8)
  - [x] 3.1 Create `backend/src/SiesaAgents.Infrastructure/Data/Configurations/ContactoConfiguration.cs`
  - [x] 3.2 Update `backend/src/SiesaAgents.Infrastructure/Data/AppDbContext.cs` — added `DbSet<ContactoEntity> Contactos`
  - [x] 3.3 Create `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs`
  - [x] 3.4 Migration `AddContactosTable` applied — `contactos` table created in `siesa_agents_db`

- [x] Task 4: Create API Endpoint (AC: 7)
  - [x] 4.1 Create `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs`
  - [x] 4.2 Register `IContactoRepository` → `ContactoRepository` in `Program.cs`
  - [x] 4.3 Register `GetContactosQueryHandler` in `Program.cs`

- [x] Task 5: Backend Tests (AC: 7, 8)
  - [x] 5.1 Create `GetContactosQueryHandlerTests.cs` — 4 tests (empty list, list with records, field mapping, null clienteId)
  - [x] 5.2 `dotnet build` — 0 errors, 0 warnings ✅
  - [x] 5.3 `dotnet test` — 8/8 passed ✅

### Frontend

- [x] Task 6: Create Domain Layer (AC: 1, 2)
  - [x] 6.1 Create `frontend/src/modules/crm/contactos/domain/Contacto.ts`
  - [x] 6.2 Create `frontend/src/modules/crm/contactos/domain/IContactoRepository.ts`

- [x] Task 7: Create Infrastructure Layer (AC: 1)
  - [x] 7.1 Create `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts`
  - [x] 7.2 Create `frontend/src/shared/lib/apiClient.ts` — Axios singleton with `VITE_API_URL` env var

- [x] Task 8: Create Application Layer (AC: 1, 2, 3, 4, 6)
  - [x] 8.1 Create `frontend/src/modules/crm/contactos/application/useContactos.ts`

- [x] Task 9: Create Presentation Layer (AC: 1, 2, 3, 4, 5, 6)
  - [x] 9.1 Create `frontend/src/modules/crm/contactos/presentation/ContactoListView.tsx` — uses `ListView` from siesa-ui-kit v1.0.77
  - [x] 9.2 Update `frontend/src/routes/_app/contactos.tsx` — replaced placeholder with `ContactoListView`
  - [x] 9.3 Create `frontend/src/shared/components/ErrorPanel.tsx`

- [x] Task 10: Frontend Tests (AC: 1, 2, 3, 4)
  - [x] 10.1 Create `useContactos.test.ts` — 3 tests (success, empty, error)
  - [x] 10.2 Create `ContactoListView.test.tsx` — 6 tests (render, badge, empty, error, retry, search by name, search by email)
  - [x] 10.3 `npm run build` — 0 TypeScript errors ✅
  - [x] 10.4 `npm test` — 19/19 passed ✅

## Dev Notes

### ⚠️ Prerequisite: Story 1.3 Must Be Done

Story 3.1 depends on Story 1.3 (`AppDbContext` + PostgreSQL connection + initial migration). Before running `dotnet ef migrations add`, verify Story 1.3 is in `done` status. The `AppDbContext` must already exist with `ApplyConfigurationsFromAssembly` wired up.

Current status of 1.3: **review** — coordinate with dev team before running migrations.

---

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` v1.0.76 (already installed — confirm with `frontend/package.json`)
- **Import styles**: `import 'siesa-ui-kit/styles.css'` — already present in `main.tsx`, do NOT add again
- **Components required**:
  - `ListView` — **PRIMARY component** for the contacts view. Includes search, table, action buttons, quick filters, loading skeletons. Do NOT build manually.
  - `Badge` — for "Sin cliente" indicator in table rows
- **Constraint**: Do NOT create a custom table, custom search input, or custom skeleton. Use `ListView` natively.

---

### `ListView` Component Pattern (siesa-ui-kit v1.0.76)

```typescript
// frontend/src/modules/crm/contactos/presentation/ContactoListView.tsx
import { useMemo, useState } from 'react'
import { ListView, ListViewColumn, ListViewQuickFilter, Badge } from 'siesa-ui-kit'
import { useRouter } from '@tanstack/react-router'
import { useContactos } from '../application/useContactos'
import { Contacto } from '../domain/Contacto'
import { ErrorPanel } from '@/shared/components/ErrorPanel'

const columns: ListViewColumn<Contacto>[] = [
  {
    header: 'Nombre',
    accessor: 'nombre',
    sortable: true,
  },
  {
    header: 'Cargo',
    accessor: 'cargo',
  },
  {
    header: 'Email',
    accessor: 'email',
  },
  {
    header: 'Cliente',
    accessor: 'clienteId',
    render: (value) =>
      value ? null : (
        <Badge color="amber">Sin cliente</Badge>
      ),
  },
]

export function ContactoListView() {
  const router = useRouter()
  const { data: contactos = [], isLoading, isError, refetch } = useContactos()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSinCliente, setShowSinCliente] = useState(false)

  const filteredContactos = useMemo(() => {
    let result = contactos

    if (showSinCliente) {
      result = result.filter((c) => c.clienteId === null)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.nombre.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      )
    }

    return result
  }, [contactos, searchQuery, showSinCliente])

  const quickFilters: ListViewQuickFilter[] = [
    {
      id: 'sin-cliente',
      label: 'Sin cliente',
      color: 'amber',
      active: showSinCliente,
      onClick: () => setShowSinCliente((prev) => !prev),
    },
  ]

  if (isError) {
    return (
      <ErrorPanel
        message="No se pudo cargar los contactos."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <ListView
      title="Contactos"
      columns={columns}
      data={filteredContactos}
      loading={isLoading}
      loadingRows={6}
      emptyMessage="No hay contactos registrados"
      searchPlaceholder="Buscar por nombre o email..."
      onSearch={setSearchQuery}
      quickFilters={quickFilters}
      onRowClick={(row) =>
        router.navigate({
          to: '/contactos/$contactoId',
          params: { contactoId: row.id },
        })
      }
      fullWidth
    />
  )
}
```

> **Note**: `onRowClick` navigates to `/contactos/:contactoId` — this route (`_app/contactos.$contactoId.tsx`) will be implemented in Story 3.2. For Story 3.1, the navigation can be wired but the destination route may show a placeholder.

---

### `useContactos` Hook Pattern

```typescript
// frontend/src/modules/crm/contactos/application/useContactos.ts
import { useQuery } from '@tanstack/react-query'
import { contactoRepository } from '../infrastructure/contactoApiRepository'

export function useContactos() {
  return useQuery({
    queryKey: ['contactos'],
    queryFn: () => contactoRepository.getAll(),
    staleTime: 5 * 60 * 1000,
  })
}
```

---

### `contactoApiRepository` Pattern

```typescript
// frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts
import { apiClient } from '@/shared/lib/apiClient'
import { Contacto } from '../domain/Contacto'
import { IContactoRepository } from '../domain/IContactoRepository'

class ContactoApiRepository implements IContactoRepository {
  async getAll(): Promise<Contacto[]> {
    const response = await apiClient.get<Contacto[]>('/contactos')
    return response.data
  }
}

export const contactoRepository = new ContactoApiRepository()
```

---

### `ErrorPanel` Shared Component

If `ErrorPanel` doesn't exist in `frontend/src/shared/components/`, create it:

```typescript
// frontend/src/shared/components/ErrorPanel.tsx
interface ErrorPanelProps {
  message: string
  onRetry?: () => void
}

export function ErrorPanel({ message, onRetry }: ErrorPanelProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <p className="text-slate-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
```

> ⚠️ Check if `ErrorPanel` already exists from previous stories before creating. If siesa-ui-kit exports an `Alert` component, consider using it instead.

---

### `ContactoEntity` Pattern (Backend)

```csharp
// backend/src/SiesaAgents.Domain/Contactos/Entities/ContactoEntity.cs
namespace SiesaAgents.Domain.Contactos.Entities;

public class ContactoEntity
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Nombre { get; set; } = string.Empty;
    public string Cargo { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Guid? ClienteId { get; set; }  // nullable — contact can exist without a client
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
```

---

### `ContactoConfiguration` Pattern (EF Core)

```csharp
// backend/src/SiesaAgents.Infrastructure/Data/Configurations/ContactoConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SiesaAgents.Domain.Clientes.Entities;
using SiesaAgents.Domain.Contactos.Entities;

namespace SiesaAgents.Infrastructure.Data.Configurations;

public class ContactoConfiguration : IEntityTypeConfiguration<ContactoEntity>
{
    public void Configure(EntityTypeBuilder<ContactoEntity> builder)
    {
        builder.ToTable("contactos");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Nombre).IsRequired().HasMaxLength(255);
        builder.Property(c => c.Cargo).IsRequired().HasMaxLength(255);
        builder.Property(c => c.Telefono).IsRequired().HasMaxLength(50);
        builder.Property(c => c.Email).IsRequired().HasMaxLength(255);
        builder.Property(c => c.ClienteId).IsRequired(false);
        builder.Property(c => c.CreatedAt).IsRequired();
        builder.Property(c => c.UpdatedAt).IsRequired();

        // FK → clientes.id — ON DELETE SET NULL (orphan contacts persist per FR23)
        builder.HasOne<ClienteEntity>()
            .WithMany()
            .HasForeignKey(c => c.ClienteId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("fk_contactos_clientes");

        // Indexes
        builder.HasIndex(c => c.ClienteId)
            .HasDatabaseName("ix_contactos_cliente_id");

        builder.HasIndex(c => c.Email)
            .HasDatabaseName("ix_contactos_email");
    }
}
```

> **Important**: `ClienteEntity` must be defined in `SiesaAgents.Domain.Clientes.Entities` before this configuration compiles. If Epic 2 (Clientes) hasn't been implemented yet, the FK relationship can reference the entity by type only (EF Core resolves it at migration time). If `ClienteEntity` doesn't exist yet, create a stub or add the FK as a shadow property.

---

### EF Core Migration Commands

Run from **repo root** after Story 1.3 is `done`:

```bash
dotnet ef migrations add AddContactosTable \
  --project backend/src/SiesaAgents.Infrastructure \
  --startup-project backend/src/SiesaAgents.API

dotnet ef database update \
  --project backend/src/SiesaAgents.Infrastructure \
  --startup-project backend/src/SiesaAgents.API
```

Verify: `contactos` table exists in `siesa_agents_db` with all columns and indexes.

---

### `ContactoEndpoints` Pattern

```csharp
// backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs
using SiesaAgents.Application.Contactos.Queries;

namespace SiesaAgents.API.Endpoints;

public static class ContactoEndpoints
{
    public static RouteGroupBuilder MapContactoEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/contactos", async (
            GetContactosQueryHandler handler,
            CancellationToken ct) =>
        {
            var contactos = await handler.HandleAsync(ct);
            return Results.Ok(contactos);
        })
        .WithName("GetContactos")
        .WithSummary("Obtener todos los contactos")
        .Produces<IEnumerable<ContactoDto>>();

        return group;
    }
}
```

Register in `Program.cs`:
```csharp
app.MapGroup("/api/v1")
    .MapClienteEndpoints()    // existing
    .MapContactoEndpoints();  // new
```

---

### Route Update (`_app/contactos.tsx`)

```typescript
// frontend/src/routes/_app/contactos.tsx
import { createFileRoute } from '@tanstack/react-router'
import { ContactoListView } from '@/modules/crm/contactos/presentation/ContactoListView'

export const Route = createFileRoute('/_app/contactos')({
  component: ContactoListView,
})
```

---

### MSW Test Handler Pattern

```typescript
// In test files or shared MSW handlers file
import { http, HttpResponse } from 'msw'

export const contactosHandlers = [
  http.get('http://localhost:5000/api/v1/contactos', () => {
    return HttpResponse.json([
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        nombre: 'Ana García',
        cargo: 'Gerente',
        telefono: '3001234567',
        email: 'ana@empresa.com',
        clienteId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: '2026-03-13T10:00:00Z',
        updatedAt: '2026-03-13T10:00:00Z',
      },
    ])
  }),
]
```

---

### Architecture Constraints (Non-Negotiable)

- **`DateTimeOffset`** everywhere in C# — NEVER `DateTime`
- **`Guid`** PKs — NEVER `int`
- **`useSnakeCaseNamingConvention()`** already active via Story 1.3 — no action needed
- **`['contactos']` query key** — array, never string
- **Client-side search** via `useMemo` — NEVER add `?q=` param to API calls
- **Spanish UI text** — "Buscar por nombre o email...", "Sin cliente", "No hay contactos registrados", "Reintentar"
- **`emptyMessage`** prop on `ListView` handles empty state — no separate component needed
- **`loading` + `loadingRows`** props on `ListView` handle skeleton — no `react-loading-skeleton` needed directly
- **No Swagger** — Scalar already configured
- **`AsNoTracking()`** on read queries — mandatory for GET endpoints

---

### Project Structure Notes

**Files to create/modify:**

```
backend/
├── src/
│   ├── SiesaAgents.Domain/
│   │   └── Contactos/
│   │       ├── Entities/
│   │       │   └── ContactoEntity.cs           ← NEW
│   │       └── Interfaces/
│   │           └── IContactoRepository.cs      ← NEW
│   ├── SiesaAgents.Application/
│   │   └── Contactos/
│   │       ├── DTOs/
│   │       │   └── ContactoDto.cs              ← NEW
│   │       └── Queries/
│   │           ├── GetContactosQuery.cs        ← NEW
│   │           └── GetContactosQueryHandler.cs ← NEW
│   ├── SiesaAgents.Infrastructure/
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs                 ← MODIFY: add DbSet<ContactoEntity>
│   │   │   └── Configurations/
│   │   │       └── ContactoConfiguration.cs    ← NEW
│   │   ├── Migrations/                         ← AUTO-GENERATED (AddContactosTable)
│   │   └── Repositories/
│   │       └── ContactoRepository.cs           ← NEW
│   └── SiesaAgents.API/
│       ├── Endpoints/
│       │   └── ContactoEndpoints.cs            ← NEW
│       └── Program.cs                          ← MODIFY: register endpoints + DI
└── tests/
    └── SiesaAgents.UnitTests/
        └── Application/
            └── Contactos/
                └── GetContactosQueryHandlerTests.cs ← NEW

frontend/
├── src/
│   ├── modules/crm/contactos/
│   │   ├── domain/
│   │   │   ├── Contacto.ts                     ← NEW
│   │   │   └── IContactoRepository.ts          ← NEW
│   │   ├── application/
│   │   │   ├── useContactos.ts                 ← NEW
│   │   │   └── useContactos.test.ts            ← NEW
│   │   ├── infrastructure/
│   │   │   └── contactoApiRepository.ts        ← NEW
│   │   └── presentation/
│   │       ├── ContactoListView.tsx            ← NEW
│   │       └── ContactoListView.test.tsx       ← NEW
│   ├── routes/_app/
│   │   └── contactos.tsx                       ← MODIFY: replace placeholder
│   └── shared/components/
│       └── ErrorPanel.tsx                      ← NEW (if not exists)
```

---

### ClienteEntity Dependency Note

`ContactoConfiguration.cs` references `ClienteEntity` for the FK relationship. Since Epic 2 (Gestión de Clientes) is in `backlog`, `ClienteEntity` may not exist yet.

**Options:**
1. **Create ClienteEntity stub now** — define the entity class in Domain without the full Application/Infrastructure stack (just enough for EF Core FK resolution). Recommended.
2. **Use shadow property** — define FK without direct entity reference: `builder.Property<Guid?>("ClienteId")` — less type-safe but unblocks migration.

**Recommendation**: Option 1 — create `ClienteEntity.cs` in the Domain as a stub. Story 2.1 will complete the full cliente stack.

---

### References

- Epic 3 requirements: [`_bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md#Story 3.1`]
- Architecture — routing: [`_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`]
- Architecture — TanStack Query keys: [`_bmad-output/planning-artifacts/architecture.md#TanStack Query keys`]
- Architecture — REST endpoints: [`_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`]
- Architecture — ContactoEntity: [`_bmad-output/planning-artifacts/architecture.md#Data Architecture`]
- Architecture — ContactoConfiguration: [`_bmad-output/planning-artifacts/architecture.md#Backend Project Structure`]
- siesa-ui-kit ListView: [`frontend/node_modules/siesa-ui-kit/dist/views/ListView/ListView.types.d.ts`]
- siesa-ui-kit Table: [`frontend/node_modules/siesa-ui-kit/dist/components/Table/Table.types.d.ts`]
- Project context (P0 rules): [`_bmad-output/project-context.md`]
- UX Spec — búsqueda de contactos: [`_bmad-output/planning-artifacts/ux-design-specification.md#Búsqueda de contactos`]
- UX Spec — Journey 4 (Contact list): [`_bmad-output/planning-artifacts/ux-design-specification.md#Journey 4`]
- Story 1.3 pattern (Infrastructure layer): [`_bmad-output/implementation-artifacts/1-3-backend-database-foundation.md`]
- Story 1.2 learnings (siesa-ui-kit, framer-motion, testing setup): [`_bmad-output/implementation-artifacts/1-2-frontend-navigation-shell.md#Dev Agent Record`]

### Latest Verified Versions (March 2026)

| Library | Version | Notes |
|---|---|---|
| siesa-ui-kit | **1.0.76** | Confirmed in `package.json` — `ListView` available |
| @tanstack/react-query | **5.90.21** | Confirmed in `package.json` |
| @tanstack/react-router | **1.166.7** | Confirmed in `package.json` |
| react | **19.2.4** | Confirmed — React 19 compatible |
| Npgsql.EntityFrameworkCore.PostgreSQL | **10.0.1** | Confirmed in `Infrastructure.csproj` |
| EFCore.NamingConventions | **10.0.1** | Confirmed in `Infrastructure.csproj` |
| Microsoft.EntityFrameworkCore.Design | **10.0.5** | Confirmed in `API.csproj` |
| Scalar.AspNetCore | **2.13.8** | Confirmed in `API.csproj` |

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `siesa-ui-kit` v1.0.77 (updated from 1.0.76 during dev) — `ListView` available, `fullWidth` prop not in ListViewProps, removed
- `ListView` does not expose `onRowClick` — row navigation deferred to Story 3.2 (ContactoDetailView route doesn't exist yet)
- `Badge` uses `label` prop (not children) — corrected from story Dev Notes pattern
- `ListViewColumn`, `ListViewQuickFilter` not exported from index — used `TableColumn` from siesa-ui-kit and inline object literals
- `apiClient.ts` did not exist on branch — created as new shared lib
- `ErrorPanel.tsx` did not exist — created as new shared component
- Backend migration `AddContactosTable` applied successfully — `contactos` table with FK to `clientes` ON DELETE SET NULL
- `ContactoListView.test.tsx`: `getByText('Sin cliente')` throws when multiple matches (badge + quick filter) — changed to `getAllByText`
- Frontend build warning: chunk size > 500kB — expected, not a blocker (siesa-ui-kit is large)

### File List

**Backend (created/modified):**
- `backend/src/SiesaAgents.Domain/Contactos/Entities/ContactoEntity.cs` — NEW
- `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs` — NEW
- `backend/src/SiesaAgents.Application/Contactos/DTOs/ContactoDto.cs` — NEW
- `backend/src/SiesaAgents.Application/Contactos/Queries/GetContactosQuery.cs` — NEW
- `backend/src/SiesaAgents.Application/Contactos/Queries/GetContactosQueryHandler.cs` — NEW
- `backend/src/SiesaAgents.Infrastructure/Data/Configurations/ContactoConfiguration.cs` — NEW
- `backend/src/SiesaAgents.Infrastructure/Data/AppDbContext.cs` — MODIFIED: added `DbSet<ContactoEntity> Contactos`
- `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs` — NEW
- `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs` — NEW
- `backend/src/SiesaAgents.API/Program.cs` — MODIFIED: added Contactos DI + `MapContactoEndpoints()`
- `backend/src/SiesaAgents.Infrastructure/Migrations/[timestamp]_AddContactosTable.cs` — AUTO-GENERATED
- `backend/tests/SiesaAgents.UnitTests/Application/Contactos/GetContactosQueryHandlerTests.cs` — NEW

**Frontend (created/modified):**
- `frontend/src/modules/crm/contactos/domain/Contacto.ts` — NEW
- `frontend/src/modules/crm/contactos/domain/IContactoRepository.ts` — NEW
- `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts` — NEW
- `frontend/src/modules/crm/contactos/application/useContactos.ts` — NEW
- `frontend/src/modules/crm/contactos/application/useContactos.test.ts` — NEW
- `frontend/src/modules/crm/contactos/presentation/ContactoListView.tsx` — NEW
- `frontend/src/modules/crm/contactos/presentation/ContactoListView.test.tsx` — NEW
- `frontend/src/routes/_app/contactos.tsx` — MODIFIED: replaced placeholder with ContactoListView
- `frontend/src/shared/lib/apiClient.ts` — NEW
- `frontend/src/shared/components/ErrorPanel.tsx` — NEW
