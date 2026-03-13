---
project_name: 'Siesa-Agents'
user_name: 'SiesaTeam'
date: '2026-03-12'
sections_completed: ['technology_stack', 'p0_rules', 'siesa_ui_kit_catalog', 'frontend_patterns', 'backend_patterns', 'testing_rules', 'anti_patterns']
existing_patterns_found: 42
status: complete
rule_count: 48
optimized_for_llm: true
---

# Project Context for AI Agents — Siesa-Agents

Critical rules and patterns for consistent implementation.
Read this before writing any code.

---

## Technology Stack

### Frontend
| Technology | Version | Notes |
|---|---|---|
| Vite | 7+ | react-ts template |
| React | 18+ | Functional components only |
| TypeScript | 5+ | strict: true mandatory |
| TanStack Router | 1+ | File-based routing |
| TanStack Query | 5+ | Server state only |
| Zustand | 5+ | Not needed in MVP (URL is source of truth) |
| siesa-ui-kit | latest | P0 — check catalog FIRST |
| shadcn/ui | latest | Dialog + Breadcrumb ONLY |
| TailwindCSS | v4 | |
| React Hook Form | latest | Always pair with Zod |
| Zod | latest | Schema validation |
| Axios | latest | Via shared apiClient.ts |

### Backend
| Technology | Version | Notes |
|---|---|---|
| .NET | 10 | C# Minimal API |
| EF Core | 10 | Primary ORM |
| PostgreSQL | 18+ | snake_case via UseSnakeCaseNamingConvention() (EFCore.NamingConventions 10.0.1) |
| FluentValidation | latest | All request DTOs |
| xUnit | latest | Unit + integration tests |
| Scalar | latest | API docs — NEVER Swagger |

---

## P0 Corporate Rules — Never Break These

1. **siesa-ui-kit FIRST**: Before creating ANY UI component, check the siesa-ui-kit catalog below. Use native components whenever available.
2. **Spanish UI text**: ALL user-facing text must be in Spanish — labels, placeholders, error messages, button text, empty states, toasts.
3. **DateTimeOffset always**: NEVER use `DateTime` in C# entities or DTOs. Always `DateTimeOffset`. Maps to PostgreSQL `TIMESTAMPTZ`.
4. **Scalar, never Swagger**: Register `builder.Services.AddOpenApi()` + `app.MapScalarApiReference()`. Never `AddSwaggerGen` or `UseSwagger`.
5. **UUID primary keys**: All entities use `Guid` in C# / `uuid` in PostgreSQL. Never `int` or `long` PKs.
6. **snake_case in PostgreSQL**: Call `UseSnakeCaseNamingConvention()` on `DbContextOptionsBuilder` when registering `AddDbContext<AppDbContext>` (in `Program.cs` and `AppDbContextFactory`). Requires `EFCore.NamingConventions` package. Do NOT call anything snake_case in `OnModelCreating`. Column names, table names, indexes — all snake_case automatically.
7. **ContactManager options in Spanish**: When using `ContactManager`, `useForOptions` and `phoneCategoryOptions` arrays must have Spanish labels.
8. **Problem Details RFC 7807**: Backend never returns raw exceptions. `ExceptionHandlingMiddleware` intercepts all errors → Problem Details format.
9. **No implicit navigation properties**: Never rely on EF Core lazy loading. Load related data with explicit queries only.

---

## siesa-ui-kit Component Catalog

**MANDATORY**: Check this list before creating any custom component.

### Core UI
`Alert` `Avatar` `Badge` `Button` `Checkbox` `Divider` `Dropdown` `Info` `Input` `Notification` `Radio` `Select` `Switch` `Textarea`

### Navigation
`Navbar` `NavigationBar` `NavigationRail` `NavigationRailGroup` `NavigationRailItem` `NavigationRailPanel` `NavigationRailTypes`

### Layout & Views
`LayoutBase` `ListView` `LoginView` `SignUpView` `RecoverPasswordView`

### Data Display
`DescriptionList` `Pagination` `Table` `Tabs`

### Form & Input
`FileUploader` `LookupField` `MatchModal` `ParameterEditor`

### Complex Components
`ChatWidget` **`ContactManager`** `DropdownItemCollapsible` `DropdownItemHeading` `Quantity` `Toast`

### Advanced
`MasterCrud` `Dynamic Entities/Admin` `Dynamic Entities/Componentes`

> **ContactManager** handles all contact CRUD natively via `IContactServiceAdapter`. Never re-implement contact forms manually.

---

## Frontend Patterns

### File-Based Routing (TanStack Router)
```
routes/
  __root.tsx         → Root layout (LayoutBase + NavigationRail)
  index.tsx          → Redirect to /clientes
  _app.tsx           → App shell
  _app/
    clientes.tsx              → /clientes
    clientes.$clienteId.tsx   → /clientes/:clienteId
    contactos.tsx             → /contactos
    contactos.$contactoId.tsx → /contactos/:contactoId
```
- Never use `useNavigate` for initial redirects — use `<Navigate>` or route `beforeLoad`
- Route params: `$clienteId`, `$contactoId` (camelCase after `$`)
- `routeTree.gen.ts` is auto-generated — never edit manually

### TanStack Query — Canonical Query Keys
```typescript
['clientes']                          // GET /api/v1/clientes
['clientes', clienteId]               // GET /api/v1/clientes/:id
['contactos']                         // GET /api/v1/contactos
['contactos', { clienteId }]          // GET /api/v1/contactos?clienteId=...
['contactos', contactoId]             // GET /api/v1/contactos/:id
```
- ALWAYS use array query keys — never strings
- Mutation `onSuccess`: `queryClient.invalidateQueries({ queryKey: ['clientes'] })`
- Never `queryClient.resetQueries` on mutation success — use `invalidateQueries`

### Search Strategy
- Load ALL records on mount via TanStack Query (≤500 records per NFR10)
- Filter client-side with `useMemo` — never add search params to API calls
- `searchQuery` is local component state — not Zustand, not URL param

### IContactServiceAdapter
```typescript
// ClienteContactServiceAdapter.ts — instantiated per ClienteDetailView
class ClienteContactServiceAdapter implements IContactServiceAdapter {
  constructor(private clienteId: string) {}
  // Wraps: useContactosByCliente, useCreateContacto, useUpdateContacto, useDeleteContacto
}
```
- One adapter instance per `clienteId` — recreate when `clienteId` changes
- Pass to `<ContactManager adapter={adapter} />`

### Axios API Client
```typescript
// shared/lib/apiClient.ts
const apiClient = axios.create({ baseURL: 'http://localhost:5000/api/v1' })
```
- All hooks import from `apiClient` — never create new axios instances
- Dev: `localhost:5000` (backend), `localhost:5173` (frontend)

### Module Structure (Clean Architecture + DDD)
```
modules/crm/{clientes,contactos}/
  domain/          → Entity interfaces, repository contracts
  application/     → TanStack Query hooks, Zod schemas
  infrastructure/  → Axios repository implementations
  presentation/    → React components (Views, Forms)
```

---

## Backend Patterns

### Minimal API Endpoint Registration
```csharp
// Program.cs — register endpoint groups
app.MapGroup("/api/v1").MapClienteEndpoints().MapContactoEndpoints();

// ClienteEndpoints.cs
public static class ClienteEndpoints {
  public static RouteGroupBuilder MapClienteEndpoints(this RouteGroupBuilder group) {
    group.MapGet("/clientes", ...);
    // ...
    return group;
  }
}
```

### EF Core DbContext
```csharp
// AppDbContext.cs — OnModelCreating (no snake_case call here)
protected override void OnModelCreating(ModelBuilder modelBuilder) {
  base.OnModelCreating(modelBuilder);
  modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
  // snake_case is applied via UseSnakeCaseNamingConvention() on DbContextOptionsBuilder
  // in Program.cs and AppDbContextFactory — NOT here
}

// Program.cs — DbContext registration (snake_case configured here)
builder.Services.AddDbContext<AppDbContext>(options =>
  options.UseNpgsql(connectionString).UseSnakeCaseNamingConvention());
```

### Entity Pattern
```csharp
public class ClienteEntity {
  public Guid Id { get; private set; } = Guid.NewGuid();
  public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow; // NOT DateTime
  // ... other properties
}
```

### FK Relationship — Contacto → Cliente
```csharp
// ContactoConfiguration.cs
builder.HasOne<ClienteEntity>()
  .WithMany()
  .HasForeignKey(c => c.ClienteId)
  .OnDelete(DeleteBehavior.SetNull); // ON DELETE SET NULL — orphan contacts persist
```
- `ClienteId` on `ContactoEntity` is `Guid?` (nullable) — never required

### REST API Endpoints
```
GET    /api/v1/clientes
GET    /api/v1/clientes/{id}
POST   /api/v1/clientes
PUT    /api/v1/clientes/{id}
DELETE /api/v1/clientes/{id}
GET    /api/v1/contactos
GET    /api/v1/contactos/{id}
GET    /api/v1/contactos?clienteId={id}
POST   /api/v1/contactos
PUT    /api/v1/contactos/{id}
DELETE /api/v1/contactos/{id}
```

### FluentValidation — always registered via DI
```csharp
builder.Services.AddValidatorsFromAssemblyContaining<CreateClienteRequestValidator>();
```

---

## Testing Rules

### Backend (xUnit)
- Unit tests: Command/Query handlers in `SiesaAgents.UnitTests/Application/`
- Integration tests: Full HTTP via `WebApplicationFactory` in `SiesaAgents.IntegrationTests/`
- Test database: EF Core InMemory for unit tests, real PostgreSQL via TestContainers for integration tests
- Never mock `DbContext` directly — use InMemory provider or TestContainers

### Frontend (Vitest + React Testing Library)
- Test files: `*.test.tsx` alongside component files
- API mocking: MSW (Mock Service Worker) — never mock Axios directly
- Test hooks: Use `renderHook` from React Testing Library

---

## Anti-Patterns — Never Do This

```
❌ DateTime in C# entities           → DateTimeOffset
❌ int/long PKs                      → Guid (UUID)
❌ Swagger / AddSwaggerGen           → Scalar
❌ String query keys ['clientes']    → Array ['clientes']
❌ English UI text                   → Spanish mandatory
❌ Creating custom components first  → Check siesa-ui-kit catalog first
❌ Manual ContactManager forms       → Use ContactManager + IContactServiceAdapter
❌ Lazy loading navigation props     → Explicit queries only
❌ Server-side search for ≤500 recs  → Client-side useMemo filter
❌ Raw exceptions to client          → Problem Details RFC 7807
❌ New axios instances per file      → Import shared apiClient.ts
❌ Zustand for search/filter state   → Local React state (useState)
❌ ContactManager options in English → Spanish labels mandatory
❌ DateTime.Now in C#                → DateTimeOffset.UtcNow
❌ Edit routeTree.gen.ts             → Auto-generated, never touch
```

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Check siesa-ui-kit catalog before creating any UI component

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack or patterns change
- Remove rules that become obvious over time

_Last Updated: 2026-03-12_
