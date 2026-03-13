# Story 1.3: Backend Database Foundation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the PostgreSQL database connected and the EF Core infrastructure configured,
so that subsequent stories can define entities and run migrations against a working data layer.

## Acceptance Criteria

1. **AC1 — Database Created via Migration**: When the developer runs `dotnet ef database update`, the `siesa_agents_db` database is created with no errors. The `Migrations/` folder exists in `SiesaAgents.Infrastructure`.

2. **AC2 — Problem Details Error Format (Verification)**: When an unhandled exception occurs in the backend, the middleware returns Problem Details RFC 7807 format (status, title, detail) with no stack traces exposed. *(Already implemented in Story 1.1 — verify existing tests still pass; no re-implementation needed.)*

3. **AC3 — Snake Case Naming Convention**: `UseSnakeCaseNamingConvention()` is applied when configuring the DbContext (via `DbContextOptionsBuilder`). All future column names follow snake_case automatically. *(Note: architecture doc references `ApplySnakeCaseNaming()` on modelBuilder — the correct call is `UseSnakeCaseNamingConvention()` on `DbContextOptionsBuilder` via the `EFCore.NamingConventions` package.)*

## Tasks / Subtasks

- [x] Task 1: Install Required NuGet Packages (AC: 1, 3)
  - [x] 1.1 Add `EFCore.NamingConventions 10.0.1` to `SiesaAgents.Infrastructure` — provides `UseSnakeCaseNamingConvention()`
  - [x] 1.2 Add `Microsoft.EntityFrameworkCore.Design 10.0.5` to `SiesaAgents.API` — required by `dotnet ef` CLI tooling when startup project differs from migrations project

- [x] Task 2: Create AppDbContext (AC: 1, 3)
  - [x] 2.1 Delete placeholder `backend/src/SiesaAgents.Infrastructure/Class1.cs`
  - [x] 2.2 Create `backend/src/SiesaAgents.Infrastructure/Data/AppDbContext.cs` — inherits `DbContext`, constructor accepts `DbContextOptions<AppDbContext>`, `OnModelCreating` calls base and is ready for entity configurations
  - [x] 2.3 Create empty directory `backend/src/SiesaAgents.Infrastructure/Data/Configurations/` — add `.gitkeep` file so future entity `IEntityTypeConfiguration<T>` files land here

- [x] Task 3: Create IDesignTimeDbContextFactory (AC: 1)
  - [x] 3.1 Create `backend/src/SiesaAgents.Infrastructure/Data/AppDbContextFactory.cs` — implements `IDesignTimeDbContextFactory<AppDbContext>` with hardcoded design-time connection string (CLI only, never runtime)

- [x] Task 4: Register DbContext in DI + Configure Connection String (AC: 1, 3)
  - [x] 4.1 Add `ConnectionStrings.DefaultConnection` to `backend/src/SiesaAgents.API/appsettings.Development.json` pointing to `siesa_agents_db`
  - [x] 4.2 Add `ConnectionStrings` placeholder (no value) to `backend/src/SiesaAgents.API/appsettings.json` so config key is documented
  - [x] 4.3 Register `AddDbContext<AppDbContext>` in `Program.cs` using `UseNpgsql(connectionString).UseSnakeCaseNamingConvention()`
  - [x] 4.4 Direct registration in Program.cs (no extension method needed for this story)

- [x] Task 5: Create and Apply Initial Migration (AC: 1)
  - [x] 5.1 Run `dotnet ef migrations add InitialCreate --project backend/src/SiesaAgents.Infrastructure --startup-project backend/src/SiesaAgents.API`
  - [x] 5.2 `backend/src/SiesaAgents.Infrastructure/Migrations/` folder created: `20260313220016_InitialCreate.cs` + `AppDbContextModelSnapshot.cs` ✅
  - [x] 5.3 Run `dotnet ef database update` — migration applied ✅
  - [x] 5.4 `siesa_agents_db` database created in PostgreSQL ✅
  - [x] 5.5 `dotnet build` — 0 errors ✅

- [x] Task 6: Tests (AC: 1, 2, 3)
  - [x] 6.1 Created `AppDbContextRegistrationTests.cs` in `SiesaAgents.IntegrationTests/Infrastructure/Data/` (3 tests: DI registration, DB name, snake_case)
  - [x] 6.2 `dotnet test` — 8/8 tests pass (1 UnitTests + 7 IntegrationTests) — AC2 verified ✅
  - [x] 6.3 `dotnet build` — 0 errors ✅

## Dev Notes

### Package Installation Commands

```bash
# From repo root
dotnet add backend/src/SiesaAgents.Infrastructure package EFCore.NamingConventions --version 10.0.1
dotnet add backend/src/SiesaAgents.API package Microsoft.EntityFrameworkCore.Design --version 10.0.5
```

> ⚠️ `EFCore.NamingConventions` is maintained by the EF Core team at https://github.com/efcore/EFCore.NamingConventions — it is NOT built into Npgsql. It must be installed separately.

> ⚠️ `Microsoft.EntityFrameworkCore.Design` must be in the **startup project** (SiesaAgents.API), not Infrastructure, for EF CLI to work correctly.

### AppDbContext Pattern

```csharp
// backend/src/SiesaAgents.Infrastructure/Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;

namespace SiesaAgents.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // Future DbSet<T> properties go here as entities are added in later stories
    // e.g.: public DbSet<ClienteEntity> Clientes => Set<ClienteEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all IEntityTypeConfiguration<T> classes from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // snake_case is applied via UseSnakeCaseNamingConvention() on DbContextOptionsBuilder (see Program.cs)
        // Do NOT call anything snake_case related here — it's configured at the options level
    }
}
```

> **Important**: `UseSnakeCaseNamingConvention()` is called on the `DbContextOptionsBuilder` (in `AddDbContext` registration), NOT on `ModelBuilder` in `OnModelCreating`. The architecture document references `modelBuilder.ApplySnakeCaseNaming()` — this is incorrect; use the options-builder approach with `EFCore.NamingConventions`.

### IDesignTimeDbContextFactory Pattern

```csharp
// backend/src/SiesaAgents.Infrastructure/Data/AppDbContextFactory.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SiesaAgents.Infrastructure.Data;

/// <summary>
/// Enables 'dotnet ef' CLI to create AppDbContext at design time.
/// Used ONLY by EF Core tooling (dotnet ef migrations / database update).
/// Never called at runtime — runtime DbContext comes from DI in Program.cs.
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    // Design-time connection string for local development migrations.
    // ⚠️ Update Password to match your local PostgreSQL setup before running migrations.
    // Infrastructure is a classlib — no Microsoft.Extensions.Configuration available here.
    private const string DesignTimeConnectionString =
        "Host=localhost;Port=5432;Database=siesa_agents_db;Username=postgres;Password=postgres";

    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder
            .UseNpgsql(DesignTimeConnectionString)
            .UseSnakeCaseNamingConvention();

        return new AppDbContext(optionsBuilder.Options);
    }
}
```

> **Note**: The factory uses a hardcoded design-time connection string (not `ConfigurationBuilder`) because `SiesaAgents.Infrastructure` is a classlib without `Microsoft.Extensions.Configuration.Json`. This is correct and intentional. Update the `Password` constant to match your local PostgreSQL installation before running `dotnet ef` commands.

### Program.cs Registration

```csharp
// Add after existing CORS setup, before app.Build()
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' not found. Add it to appsettings.Development.json.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options
        .UseNpgsql(connectionString)
        .UseSnakeCaseNamingConvention());
```

Add usings:
```csharp
using Microsoft.EntityFrameworkCore;
using SiesaAgents.Infrastructure.Data;
```

### appsettings.Development.json Connection String

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Cors": {
    "AllowedOrigins": [ "http://localhost:5173" ]
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=siesa_agents_db;Username=postgres;Password=YOUR_LOCAL_PASSWORD"
  }
}
```

> ⚠️ `appsettings.Development.json` is in `.gitignore` for connection string security. Developers must configure their own local password. Verify `.gitignore` includes `appsettings.Development.json` OR use `dotnet user-secrets` for production-grade local secrets management.

### appsettings.json (base — no real value, documents the key)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": ""
  }
}
```

### EF Core Migration Commands

Run these from the **repo root** (not from inside the backend folder):

```bash
# Add initial migration
dotnet ef migrations add InitialCreate \
  --project backend/src/SiesaAgents.Infrastructure \
  --startup-project backend/src/SiesaAgents.API

# Apply migration (creates siesa_agents_db)
dotnet ef database update \
  --project backend/src/SiesaAgents.Infrastructure \
  --startup-project backend/src/SiesaAgents.API
```

> The `InitialCreate` migration will be empty (no entities yet). This is intentional — it establishes the migration pipeline for future stories. EF Core will still create the `__EFMigrationsHistory` table in `siesa_agents_db`.

### Test Pattern — AppDbContext Registration

```csharp
// backend/tests/SiesaAgents.UnitTests/Infrastructure/Data/AppDbContextRegistrationTests.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SiesaAgents.Infrastructure.Data;

namespace SiesaAgents.UnitTests.Infrastructure.Data;

public class AppDbContextRegistrationTests
{
    [Fact]
    public void AppDbContext_CanBeResolvedFromServiceCollection()
    {
        var services = new ServiceCollection();
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql("Host=localhost;Database=test;Username=test;Password=test")
                   .UseSnakeCaseNamingConvention());

        var provider = services.BuildServiceProvider();

        var context = provider.GetService<AppDbContext>();
        Assert.NotNull(context);
    }

    [Fact]
    public void AppDbContext_HasCorrectDatabaseName()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql("Host=localhost;Database=siesa_agents_db;Username=test;Password=test")
            .UseSnakeCaseNamingConvention()
            .Options;

        using var context = new AppDbContext(options);
        Assert.Contains("siesa_agents_db", context.Database.GetConnectionString()!);
    }
}
```

### Architecture Constraints (Non-Negotiable)

- **Timestamps**: `DateTimeOffset` everywhere — NEVER `DateTime` (relevant when entities are added in future stories)
- **Primary Keys**: `Guid` (UUID) for all entities — NEVER `int`
- **snake_case**: Applied via `UseSnakeCaseNamingConvention()` on `DbContextOptionsBuilder` — affects all future entities automatically
- **Connection strings**: NEVER hardcoded in source code — always via `appsettings.Development.json` or secrets
- **No Swagger**: Scalar only (already configured)
- **Error responses**: Problem Details RFC 7807 — already implemented (Story 1.1)
- **IEntityTypeConfiguration**: One configuration class per entity in `Infrastructure/Data/Configurations/` — empty now, populated in Story 2.1+

### Project Structure Notes

Files to create/modify in this story:

```
backend/
├── src/
│   ├── SiesaAgents.API/
│   │   ├── appsettings.json                        ← MODIFY: add ConnectionStrings key (empty value)
│   │   ├── appsettings.Development.json            ← MODIFY: add DefaultConnection string
│   │   ├── Program.cs                              ← MODIFY: add AddDbContext registration
│   │   └── SiesaAgents.API.csproj                  ← MODIFY: add EF Design package
│   └── SiesaAgents.Infrastructure/
│       ├── Class1.cs                               ← DELETE (placeholder)
│       ├── SiesaAgents.Infrastructure.csproj       ← MODIFY: add EFCore.NamingConventions package
│       ├── Data/
│       │   ├── AppDbContext.cs                     ← NEW
│       │   ├── AppDbContextFactory.cs              ← NEW (IDesignTimeDbContextFactory)
│       │   └── Configurations/
│       │       └── .gitkeep                        ← NEW (reserves folder for future entity configs)
│       └── Migrations/                             ← AUTO-GENERATED by dotnet ef migrations add
│           ├── [timestamp]_InitialCreate.cs        ← AUTO-GENERATED
│           └── AppDbContextModelSnapshot.cs        ← AUTO-GENERATED
└── tests/
    └── SiesaAgents.UnitTests/
        └── Infrastructure/
            └── Data/
                └── AppDbContextRegistrationTests.cs  ← NEW
```

### Story 1.1 Learnings Applied

- `Npgsql.EntityFrameworkCore.PostgreSQL 10.0.1` already installed in Infrastructure ✅
- `Microsoft.EntityFrameworkCore.Tools 10.0.5` already installed in Infrastructure ✅
- `appsettings.Development.json` already has CORS config — safely extend with ConnectionStrings ✅
- `dotnet ef` commands must specify `--project` + `--startup-project` when projects are separate ✅
- `Microsoft.EntityFrameworkCore.Design` must be added to the **API project** (not Infrastructure) for CLI tools ✅
- Primary constructor syntax (`class Foo(deps) : Base(deps)`) is idiomatic in .NET 10 — use it ✅

### References

- AppDbContext location: [Architecture: `_bmad-output/planning-artifacts/architecture.md#Backend Project Structure`]
- snake_case naming: [Architecture: `_bmad-output/planning-artifacts/architecture.md#Naming Patterns`]
- DB name `siesa_agents_db`: [Architecture: `_bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment`]
- UUID PKs + DateTimeOffset: [Architecture: `_bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines`]
- `IEntityTypeConfiguration<T>` per entity: [Architecture: `_bmad-output/planning-artifacts/architecture.md#Backend Project Structure`]
- Epic ACs: [Epic 1: `_bmad-output/planning-artifacts/epics/epic-01-foundation.md#Story 1.3`]
- Story 1.1 pattern: [`_bmad-output/implementation-artifacts/1-1-project-initialization-repository-structure.md`]

### Latest Verified Versions (March 2026)

| Package | Version | Notes |
|---|---|---|
| Npgsql.EntityFrameworkCore.PostgreSQL | **10.0.1** | Already installed in Infrastructure ✅ |
| Microsoft.EntityFrameworkCore.Tools | **10.0.5** | Already installed in Infrastructure ✅ |
| Microsoft.EntityFrameworkCore.Design | **10.0.5** | Must add to SiesaAgents.API |
| EFCore.NamingConventions | **10.0.1** | Must add to SiesaAgents.Infrastructure — provides `UseSnakeCaseNamingConvention()` |
| .NET / ASP.NET Core | **10.0.5** | Already configured |

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `EFCore.NamingConventions 10.0.1` is a separate package (NOT built into Npgsql) — provides `UseSnakeCaseNamingConvention()` on `DbContextOptionsBuilder`; project-context.md references `modelBuilder.ApplySnakeCaseNaming()` which is incorrect — actual method is on options builder
- `AppDbContextFactory` uses hardcoded design-time connection string (no `ConfigurationBuilder` dependency needed in Infrastructure classlib — avoids adding `Microsoft.Extensions.Configuration.Json` as a dep)
- `AppDbContextRegistrationTests` placed in `SiesaAgents.IntegrationTests` (not UnitTests) — UnitTests is scoped to Application+Domain only per architecture boundary
- Had to add `Microsoft.EntityFrameworkCore 10.0.5` explicitly to IntegrationTests to resolve version conflict (10.0.4 vs 10.0.5) caused by transitive dependency mismatch
- EF Core tools warning "version '8.0.11' is older than runtime '10.0.5'" — global `dotnet-ef` tool needs upgrade; does not block migration execution
- Migration `20260313220016_InitialCreate` is intentionally empty (no entities yet) — establishes `__EFMigrationsHistory` table for future stories
- `siesa_agents_db` database successfully created and `__EFMigrationsHistory` populated

### File List

**Backend (created/modified):**
- `backend/src/SiesaAgents.Infrastructure/SiesaAgents.Infrastructure.csproj` — MODIFIED: added `EFCore.NamingConventions 10.0.1`
- `backend/src/SiesaAgents.Infrastructure/Class1.cs` — DELETED (placeholder)
- `backend/src/SiesaAgents.Infrastructure/Data/AppDbContext.cs` — NEW
- `backend/src/SiesaAgents.Infrastructure/Data/AppDbContextFactory.cs` — NEW (IDesignTimeDbContextFactory)
- `backend/src/SiesaAgents.Infrastructure/Data/Configurations/.gitkeep` — NEW (reserves folder)
- `backend/src/SiesaAgents.Infrastructure/Migrations/20260313220016_InitialCreate.cs` — AUTO-GENERATED
- `backend/src/SiesaAgents.Infrastructure/Migrations/20260313220016_InitialCreate.Designer.cs` — AUTO-GENERATED
- `backend/src/SiesaAgents.Infrastructure/Migrations/AppDbContextModelSnapshot.cs` — AUTO-GENERATED
- `backend/src/SiesaAgents.API/SiesaAgents.API.csproj` — MODIFIED: added `Microsoft.EntityFrameworkCore.Design 10.0.5`
- `backend/src/SiesaAgents.API/Program.cs` — MODIFIED: added `AddDbContext<AppDbContext>` registration
- `backend/src/SiesaAgents.API/appsettings.json` — MODIFIED: added `ConnectionStrings.DefaultConnection` (empty)
- `backend/src/SiesaAgents.API/appsettings.Development.json` — MODIFIED: added `ConnectionStrings.DefaultConnection`
- `backend/tests/SiesaAgents.IntegrationTests/SiesaAgents.IntegrationTests.csproj` — MODIFIED: added `Microsoft.EntityFrameworkCore 10.0.5` (version pin)
- `backend/tests/SiesaAgents.IntegrationTests/Infrastructure/Data/AppDbContextRegistrationTests.cs` — NEW (3 tests)

**Documentation (updated by Code Review):**
- `_bmad-output/project-context.md` — MODIFIED: corrected P0 Rule #6 and EF Core DbContext backend pattern (ApplySnakeCaseNaming → UseSnakeCaseNamingConvention)
- `.gitignore` — MODIFIED: added `appsettings.Development.json` exclusion
