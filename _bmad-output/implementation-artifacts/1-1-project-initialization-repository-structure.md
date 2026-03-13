# Story 1.1: Project Initialization & Repository Structure

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the frontend (Vite react-ts) and backend (.NET 10 Clean Architecture) projects initialized with all required dependencies,
so that the team has a working development environment with both servers running.

## Acceptance Criteria

1. **AC1 — Frontend Server**: `npm run dev` starts the Vite dev server on port 5173 with no errors. The app compiles with TypeScript strict mode enabled.
2. **AC2 — Backend Server**: `dotnet run` in `SiesaAgents.API` starts the backend on port 5000. The Scalar API documentation page loads at `/scalar` without errors.
3. **AC3 — Clean Architecture**: The four Clean Architecture projects (API, Application, Domain, Infrastructure) are created and referenced correctly in the solution (`SiesaAgents.sln`). `dotnet build` succeeds with 0 errors.
4. **AC4 — CORS**: When the frontend (localhost:5173) makes a request to the backend (localhost:5000), CORS allows the request without errors (no blocked-by-CORS errors in browser console).
5. **AC5 — Global Error Middleware**: An unhandled exception in the backend returns a Problem Details RFC 7807 response (status, title, detail) with no stack traces exposed.

## Tasks / Subtasks

- [x] Task 1: Initialize Frontend Project (AC: 1)
  - [x] 1.1 Run `npm create vite@latest frontend -- --template react-ts` at repo root
  - [x] 1.2 Install all required dependencies (see Dev Notes for exact commands)
  - [x] 1.3 Configure `tsconfig.app.json` with `"strict": true` (verify it's enabled by default in the template)
  - [x] 1.4 Configure `vite.config.ts` with `@tanstack/router-plugin` and `@tailwindcss/vite`
  - [x] 1.5 Initialize Tailwind v4 (`@tailwindcss/vite` approach — no `tailwind.config.ts` needed in v4)
  - [x] 1.6 Run `npx shadcn@latest init && npx shadcn@latest add dialog breadcrumb`
  - [x] 1.7 Verify `npm run dev` starts on port 5173 with no TypeScript or compile errors

- [x] Task 2: Initialize Backend Solution (AC: 2, 3)
  - [x] 2.1 Create solution and 4 Clean Architecture projects (see Dev Notes for exact commands)
  - [x] 2.2 Add project references: API → Application + Infrastructure; Application → Domain; Infrastructure → Domain
  - [x] 2.3 Add test project `SiesaAgents.UnitTests` (xUnit) with reference to Application + Domain
  - [x] 2.4 Install NuGet packages: `Scalar.AspNetCore`, `FluentValidation`, `Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.EntityFrameworkCore.Tools`
  - [x] 2.5 Configure `Program.cs`: register Scalar, set HTTP port to 5000, remove any Swagger/OpenAPI references
  - [x] 2.6 Verify `dotnet run` starts on port 5000 and `http://localhost:5000/scalar` loads the docs page

- [x] Task 3: Configure CORS (AC: 4)
  - [x] 3.1 Add CORS policy in `Program.cs` allowing origin `http://localhost:5173`
  - [x] 3.2 Register `app.UseCors()` in middleware pipeline before endpoints
  - [x] 3.3 Verify from browser: no CORS errors when frontend fetches from backend

- [x] Task 4: Implement Global Exception Middleware (AC: 5)
  - [x] 4.1 Create `src/SiesaAgents.API/Middleware/ExceptionHandlingMiddleware.cs`
  - [x] 4.2 Catch all unhandled exceptions and return Problem Details RFC 7807 (status, title, detail) — no stack traces
  - [x] 4.3 Register middleware in `Program.cs` before all other middleware
  - [x] 4.4 Write unit test verifying a simulated exception returns 500 with Problem Details shape

## Dev Notes

### Frontend Initialization Commands

```bash
# Run from repo root
npm create vite@latest frontend -- --template react-ts
cd frontend

# Core runtime dependencies
npm install siesa-ui-kit
npm install @tanstack/react-router @tanstack/react-query zustand
npm install axios react-hook-form zod @hookform/resolvers react-loading-skeleton

# Shadcn UI (Dialog + Breadcrumb only per architecture)
npx shadcn@latest init
npx shadcn@latest add dialog breadcrumb

# Styling
npm install tailwindcss @tailwindcss/vite

# Dev dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom msw @tanstack/router-plugin
```

### Frontend `vite.config.ts` Setup

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
  },
})
```

### Tailwind v4 Configuration

Tailwind v4 no longer uses `tailwind.config.ts`. Configuration is done via CSS `@import "tailwindcss"` in `src/index.css`. No separate config file needed.

### Backend Initialization Commands

```bash
# Run from repo root
dotnet new sln -n SiesaAgents

dotnet new webapi -n SiesaAgents.API --no-openapi -o src/SiesaAgents.API
dotnet new classlib -n SiesaAgents.Application -o src/SiesaAgents.Application
dotnet new classlib -n SiesaAgents.Domain -o src/SiesaAgents.Domain
dotnet new classlib -n SiesaAgents.Infrastructure -o src/SiesaAgents.Infrastructure
dotnet new xunit -n SiesaAgents.UnitTests -o tests/SiesaAgents.UnitTests

# Add to solution
dotnet sln add src/SiesaAgents.API src/SiesaAgents.Application src/SiesaAgents.Domain src/SiesaAgents.Infrastructure tests/SiesaAgents.UnitTests

# Project references
dotnet add src/SiesaAgents.API reference src/SiesaAgents.Application src/SiesaAgents.Infrastructure
dotnet add src/SiesaAgents.Application reference src/SiesaAgents.Domain
dotnet add src/SiesaAgents.Infrastructure reference src/SiesaAgents.Domain
dotnet add tests/SiesaAgents.UnitTests reference src/SiesaAgents.Application src/SiesaAgents.Domain

# NuGet packages
dotnet add src/SiesaAgents.API package Scalar.AspNetCore
dotnet add src/SiesaAgents.Application package FluentValidation
dotnet add src/SiesaAgents.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add src/SiesaAgents.Infrastructure package Microsoft.EntityFrameworkCore.Tools
```

### Backend `Program.cs` Setup

```csharp
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// OpenAPI (for Scalar — NOT Swagger)
builder.Services.AddOpenApi();

var app = builder.Build();

// Exception middleware (must be first)
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors();

// Scalar docs at /scalar
app.MapOpenApi();
app.MapScalarApiReference();

app.Run();
```

> ⚠️ NEVER use `app.UseSwagger()` or `app.UseSwaggerUI()`. Scalar is the only API documentation tool.

### `ExceptionHandlingMiddleware.cs` Pattern

```csharp
public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/problem+json";
            var problem = new ProblemDetails
            {
                Status = 500,
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred. Please try again."
                // ⚠️ NEVER expose ex.Message or ex.StackTrace to the client
            };
            await context.Response.WriteAsJsonAsync(problem);
        }
    }
}
```

### Backend `launchSettings.json` Port Configuration

In `src/SiesaAgents.API/Properties/launchSettings.json`, ensure the HTTP profile uses port 5000:

```json
{
  "profiles": {
    "http": {
      "commandName": "Project",
      "applicationUrl": "http://localhost:5000",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

### Architecture Constraints (Non-Negotiable)

- **Timestamps**: `DateTimeOffset` everywhere — NEVER `DateTime`
- **Primary Keys**: `Guid` (UUID) for all entities
- **API docs**: Scalar only — no Swagger
- **Error responses**: Problem Details RFC 7807 — no raw exception messages to client
- **UI text**: Spanish (for future stories — not relevant to this init story)
- **snake_case DB**: `modelBuilder.ApplySnakeCaseNaming()` applied in `OnModelCreating` (relevant for Story 1.3)

### Project Structure Notes

This story creates the root directory structure:

```
siesa-agents/          ← repo root
├── frontend/          ← Vite react-ts project
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── package.json
│   └── src/
│       └── main.tsx
├── backend/           ← .NET 10 solution
│   ├── SiesaAgents.sln
│   ├── src/
│   │   ├── SiesaAgents.API/
│   │   ├── SiesaAgents.Application/
│   │   ├── SiesaAgents.Domain/
│   │   └── SiesaAgents.Infrastructure/
│   └── tests/
│       └── SiesaAgents.UnitTests/
```

No application logic, domain entities, or database configuration is created in this story — those belong to Stories 1.2 and 1.3.

### References

- Initialization commands: [Source: `_bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation`]
- CORS + Scalar setup: [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]
- Problem Details pattern: [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`]
- Dev ports: [Source: `_bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment`]
- Anti-patterns: [Source: `_bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines`]

### Latest Verified Versions (March 2026)

| Library | Version | Notes |
|---|---|---|
| Vite | **8.0.0** | `npm create vite@latest` will install this. Architecture doc says "7+" — v8 is compatible. |
| React | **19.2.4** | Architecture doc says "18+" — v19 is the current stable, backward compatible. |
| @tanstack/react-router | 1.166.7 | |
| @tanstack/react-query | 5.90.21 | |
| Zustand | 5.0.11 | Requires React 18+ (satisfied by React 19). |
| .NET / ASP.NET Core | **10.0.5** | Latest servicing release. |
| EF Core + Npgsql | 10.0.1 | |
| Scalar.AspNetCore | **2.4.1** | |
| TailwindCSS | **4.2.1** | v4 config paradigm differs from v3 — no `tailwind.config.ts`. |
| @tanstack/router-plugin | 1.166.7 | |

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Vite 8.0.0 instalado (arquitectura decía "7+") — compatible, sin breaking changes para este proyecto
- React 19.2.4 instalado (arquitectura decía "18+") — compatible
- Scalar.AspNetCore 2.13.8 instalado (más nuevo que el 2.4.1 investigado)
- `@tailwindcss/vite` requirió `--legacy-peer-deps` y `.npmrc` para trabajar con Vite 8 (peerDep aún no actualizado para v8)
- shadcn requirió `paths` en `tsconfig.json` raíz (no solo en `tsconfig.app.json`)
- `Microsoft.AspNetCore.OpenApi` debió agregarse manualmente (removido por `--no-openapi` flag)
- TDD: Test de `ExceptionHandlingMiddleware` detectó que `WriteAsJsonAsync` sobrescribe content-type → se usó overload con parámetro `contentType` explícito
- CORS, Scalar y ExceptionHandlingMiddleware configurados en `Program.cs`
- 3 tests xUnit: 2 middleware tests + 1 heredado del template → 3/3 passing

### File List

**Frontend (created):**
- `frontend/` — Vite react-ts project root
- `frontend/vite.config.ts` — TanStackRouterVite + tailwindcss + @vitejs/plugin-react, port 5173, `@/` alias
- `frontend/tsconfig.app.json` — strict:true, baseUrl, paths
- `frontend/tsconfig.json` — compilerOptions with `@/*` alias for shadcn
- `frontend/.npmrc` — legacy-peer-deps=true (Tailwind/Vite 8 compatibility)
- `frontend/src/index.css` — @import tailwindcss + shadcn tokens + tw-animate-css
- `frontend/src/main.tsx` — import siesa-ui-kit/styles.css added
- `frontend/src/lib/utils.ts` — shadcn utility (cn function)
- `frontend/src/components/ui/dialog.tsx` — shadcn Dialog component
- `frontend/src/components/ui/breadcrumb.tsx` — shadcn Breadcrumb component

**Backend (created):**
- `backend/SiesaAgents.sln` — solution with 5 projects
- `backend/src/SiesaAgents.API/` — Minimal API project, net10.0
- `backend/src/SiesaAgents.API/Program.cs` — Scalar, CORS, ExceptionHandlingMiddleware
- `backend/src/SiesaAgents.API/Middleware/ExceptionHandlingMiddleware.cs` — Problem Details RFC 7807
- `backend/src/SiesaAgents.API/Properties/launchSettings.json` — port 5000 (HTTP), 5001 (HTTPS)
- `backend/src/SiesaAgents.Application/` — classlib, FluentValidation
- `backend/src/SiesaAgents.Domain/` — classlib
- `backend/src/SiesaAgents.Infrastructure/` — classlib, Npgsql EF Core, EF Tools
- `backend/tests/SiesaAgents.UnitTests/` — xUnit project
- `backend/tests/SiesaAgents.UnitTests/API/Middleware/ExceptionHandlingMiddlewareTests.cs` — 2 tests (500+passthrough)
