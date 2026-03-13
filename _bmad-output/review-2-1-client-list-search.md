---
stepsCompleted: [1, 2, 3]
story_path: _bmad-output/implementation-artifacts/2-1-client-list-search.md
story_key: 2-1-client-list-search
status: In Progress
---

# Code Review: 2-1-client-list-search

- **Date**: 2026-03-13
- **Reviewer**: SiesaTeam (AI Agent — Adversarial Senior Dev)
- **Status**: In Progress

---

## Initial Discovery

### Actual Git Changes (Story 2.1 commit `3e947fc`)

**Backend files committed:**
- `backend/src/SiesaAgents.Domain/Clientes/Entities/ClienteEntity.cs` ✅
- `backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs` ✅
- `backend/src/SiesaAgents.Infrastructure/Data/Configurations/ClienteConfiguration.cs` ✅
- `backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs` ✅
- `backend/src/SiesaAgents.Application/Clientes/DTOs/ClienteDto.cs` ✅
- `backend/src/SiesaAgents.Application/Clientes/Queries/GetClientesQuery.cs` ✅
- `backend/src/SiesaAgents.Application/Clientes/Queries/GetClientesQueryHandler.cs` ✅
- `backend/src/SiesaAgents.API/Endpoints/ClienteEndpoints.cs` ✅
- `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs` ✅
- `backend/tests/SiesaAgents.IntegrationTests/SiesaAgents.IntegrationTests.csproj` ✅
- `backend/tests/SiesaAgents.UnitTests/Application/Clientes/GetClientesQueryHandlerTests.cs` ✅

**Frontend submodule pointer:** updated (but submodule has no dedicated Story 2.1 commit)

### Undocumented Changes (in Git but NOT in Story File List)

1. `backend/src/SiesaAgents.Infrastructure/Migrations/20260313224907_AddClienteEntity.cs` — committed in Story 3.1 commit (`fba88a8`), not Story 2.1.
2. `AppDbContext.cs` + `Program.cs` — listed in Story 2.1 File List as "Modified" but committed in Story 3.1 commit (`fba88a8`).
3. `frontend/src/routes/__root.tsx` — modified in frontend submodule (uncommitted), not in Story 2.1 File List.
4. `frontend/package.json` + `frontend/package-lock.json` — modified (uncommitted), not documented.

### Files in Story but NOT in Story 2.1 Git Commit

- `backend/src/SiesaAgents.Infrastructure/Data/AppDbContext.cs` — committed in Story 3.1.
- `backend/src/SiesaAgents.API/Program.cs` — committed in Story 3.1.
- `backend/src/SiesaAgents.Infrastructure/Migrations/` — committed in Story 3.1.

### Frontend Submodule Integrity Issue

The frontend submodule has uncommitted changes for Story 2.1:
- **Untracked** (new files never committed): `src/modules/crm/clientes/` (entire module), `src/shared/components/ClientListItem.tsx`, `src/shared/components/EmptyState.tsx`
- **Modified** (not staged): `src/routes/_app/clientes.tsx`, `src/shared/components/ErrorPanel.tsx`, `src/routes/__tests__/navigation.test.tsx`, `src/routes/__root.tsx`, `package.json`, `package-lock.json`, `src/modules/crm/contactos/presentation/ContactoListView.test.tsx`

The parent repo Story 2.1 commit points to the Story 3.1 frontend commit — NOT a dedicated Story 2.1 frontend commit. Implementation exists on disk but is not in version control.

---

## Review Plan

### AC Validation Checklist

| AC | Verificar en | Criterio de éxito |
|---|---|---|
| AC1 — Lista 280px, Nombre+NIT | `clientes.tsx`, `ClientListItem.tsx` | `w-[280px]`, renders nombre + nit, overflow-y-auto |
| AC2 — Búsqueda tiempo real | `ClienteListView.tsx` | useMemo filtra por nombre y nit, case-insensitive |
| AC3 — EmptyState | `ClienteListView.tsx`, `EmptyState.tsx` | Render cuando clientes array API está vacío |
| AC4 — ErrorPanel + Reintentar | `ClienteListView.tsx`, `ErrorPanel.tsx` | Render cuando `isError`, botón llama `refetch` |
| AC5 — GET /api/v1/clientes | `ClienteEndpoints.cs`, `ClienteDto.cs` | 200 OK, array ClienteDto, camelCase JSON, `[]` when empty |
| AC6 — Tabla clientes en DB | Migración, `ClienteConfiguration.cs` | id uuid PK, nit unique, timestamps TIMESTAMPTZ |

### Focus Areas

- Testing violations: InMemory vs TestContainers, vi.mock vs MSW
- Entity design: UpdatedAt setter scope
- EmptyState behavior on search vs. empty API
- Undocumented dependency changes

---

## Review Findings

### CRITICAL Issues (Must Fix Before Merge)

#### [CRITICAL-1] Frontend submodule has no Story 2.1 commit

**File:** `frontend` submodule
**Evidence:** `cd frontend && git status` shows untracked and modified files. `git log --oneline -3` shows last commit is Story 3.1 (`7465622`). `src/modules/crm/clientes/`, `ClientListItem.tsx`, `EmptyState.tsx` are untracked. Modified files (`clientes.tsx`, `ErrorPanel.tsx`, `navigation.test.tsx`, `__root.tsx`, `package.json`) are not staged.
**Risk:** If disk is lost or submodule is reset (`git checkout .` or `git submodule update --force`), entire Story 2.1 frontend implementation disappears. The parent repo commit `3e947fc` only updated the submodule pointer to the Story 3.1 frontend commit — it does NOT preserve Story 2.1 code.
**Fix:**
```bash
cd frontend
git add src/modules/crm/clientes/ \
  src/shared/components/ClientListItem.tsx \
  src/shared/components/EmptyState.tsx \
  src/shared/components/ErrorPanel.tsx \
  src/routes/_app/clientes.tsx \
  src/routes/__tests__/navigation.test.tsx \
  src/routes/__root.tsx \
  package.json package-lock.json \
  src/modules/crm/contactos/presentation/ContactoListView.test.tsx
git commit -m "feat: story 2.1 — client list & search (frontend)"
# Then update parent repo submodule pointer
```

---

### HIGH Issues (Must Fix)

#### [HIGH-1] Integration tests use InMemory database instead of TestContainers

**File:** `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs` lines 51-57
**Rule violated:** `project-context.md` — *"Test database: EF Core InMemory for unit tests, real PostgreSQL via TestContainers for integration tests"*
**Evidence:**
```csharp
services.AddScoped(_ => {
    var options = new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(dbName)  // VIOLATION
        .Options;
    return new AppDbContext(options);
});
```
**Risk:** InMemory does not enforce unique constraints (`uk_clientes_nit`), does not validate `TIMESTAMPTZ` semantics, and does not execute migration SQL. A broken migration passes integration tests but fails against real PostgreSQL. The same violation exists in contactos integration tests — this is a systemic issue.
**Fix:** Replace with `Testcontainers.PostgreSql` package. Use a real PostgreSQL container and run migrations via `db.Database.MigrateAsync()`. Add `Testcontainers.PostgreSql` to `SiesaAgents.IntegrationTests.csproj`.

---

### MEDIUM Issues (Should Fix)

#### [MED-1] EmptyState renders wrong message when search yields no results

**File:** `frontend/src/modules/crm/clientes/presentation/ClienteListView.tsx` lines 56-58
**Evidence:**
```tsx
{!isLoading && !isError && filteredClientes.length === 0 && (
  <EmptyState message="No hay clientes aún. Crea el primer cliente." />
)}
```
**Problem:** If 10 clients exist and user searches "xyz" (no match), `filteredClientes` is empty and the component renders "No hay clientes aún. Crea el primer cliente." — factually wrong. Clients DO exist.
**AC violated:** AC3 specifies "When there are no clients in the system (empty array from API)" — not when search filters produce empty results.
**No test covers this scenario** — `ClienteListView.test.tsx` has no case for "search with no results when clients exist".
**Fix:**
```tsx
const noApiClientes = clientes.length === 0
const noSearchResults = searchTerm.trim() && filteredClientes.length === 0

{!isLoading && !isError && noApiClientes && (
  <EmptyState message="No hay clientes aún. Crea el primer cliente." />
)}
{!isLoading && !isError && noSearchResults && (
  <EmptyState message="Sin resultados para tu búsqueda." />
)}
```

#### [MED-2] Frontend hook tests use `vi.mock` instead of MSW

**File:** `frontend/src/modules/crm/clientes/application/useClientes.test.ts` lines 9-13
**Rule violated:** `project-context.md` — *"API mocking: MSW (Mock Service Worker) — never mock Axios directly"*
**Evidence:**
```typescript
vi.mock('../infrastructure/clienteApiRepository', () => ({
  clienteApiRepository: { getAll: vi.fn() },
}))
```
**Problem:** Mocking at repository level bypasses the full HTTP layer (Axios config, URL construction, headers, response deserialization). A wrong URL in `clienteApiRepository.ts` (e.g., `/cliente` instead of `/clientes`) would pass all tests but break in production. Same violation in contactos tests — consistency does not make it correct.
**Fix:** Use MSW to intercept `GET http://localhost:5000/api/v1/clientes` at the network layer. Add `msw` server setup in `src/test/setup.ts` and define handlers per-test.

#### [MED-3] Undocumented changes — `__root.tsx` labels and `siesa-ui-kit` upgrade to 1.0.77

**Files:** `frontend/src/routes/__root.tsx`, `frontend/package.json`
**Evidence:**
```diff
// __root.tsx: Spanish labels added to NavigationRail (P0 compliance — good change, but undocumented)
+          labels: {
+            collapseButton: 'Colapsar menú',
+            searchPlaceholder: 'Buscar módulo',
+          },
// package.json: siesa-ui-kit bumped
-    "siesa-ui-kit": "^1.0.76",
+    "siesa-ui-kit": "^1.0.77",
```
**Problem:** Both files are uncommitted and not in the Story 2.1 File List. The `siesa-ui-kit` upgrade is a dependency change not tracked to any story. Future developers using `git blame` won't know why this was changed.
**Fix:** Add both files to the Story 2.1 File List. Include them in the frontend submodule commit. Document why the version was bumped in the story's Completion Notes.

---

### LOW Issues (Nice to Fix)

#### [LOW-1] `ClienteEntity.UpdatedAt` has public setter — no domain encapsulation

**File:** `backend/src/SiesaAgents.Domain/Clientes/Entities/ClienteEntity.cs` line 11
**Evidence:**
```csharp
public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;  // correct
public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;           // public — wrong
```
`CreatedAt` is correctly immutable. `UpdatedAt` is open to external mutation. Any code can write `entity.UpdatedAt = DateTimeOffset.MinValue` silently.
**Fix:** Change to `internal set` for infrastructure access, or add a `MarkAsUpdated()` method. For Story 2.1 (read-only), `private set` with value set via object initializer is sufficient since EF Core can populate it via column mapping.

#### [LOW-2] Story File List misattributes commits

**File:** `_bmad-output/implementation-artifacts/2-1-client-list-search.md`
**Evidence:** `git log --follow -- backend/src/SiesaAgents.Infrastructure/Data/AppDbContext.cs` shows last commit is `fba88a8` (Story 3.1). Same for `Program.cs` and all migration files.
**Problem:** Story 2.1 Dev Agent Record claims these as Story 2.1 changes. Future `git blame` analysis will contradict the story's claimed scope.
**Fix:** Update the File List with a note: `"NOTE: AppDbContext.cs, Program.cs, and AddClienteEntity migration were committed in Story 3.1 (fba88a8) due to parallel development."`.

#### [LOW-3] Navigation test has hardcoded 5000ms `waitFor` timeout

**File:** `frontend/src/routes/__tests__/navigation.test.tsx` line 27
**Evidence:**
```typescript
await waitFor(
  () => { expect(screen.getByText(/selecciona un cliente.../i)).toBeInTheDocument() },
  { timeout: 5000 },  // 5x default, observed runtime: ~2025ms
)
```
**Problem:** TanStack Router lazy-loads `ClientesView`, which fires a `useClientes` query that fails in JSDOM (no network). Default `waitFor` timeout (1000ms) is insufficient. The 5000ms is a band-aid that will grow test suite duration as more routes are added.
**Fix:** Mock `clienteApiRepository` in navigation test setup, or configure the test `QueryClient` with `networkMode: 'offlineFirst'` so TanStack Query doesn't wait for a network response before rendering the component.

---

## AC Verification Summary

| AC | Status | Evidence |
|---|---|---|
| AC1 — 280px panel, Nombre+NIT | ✅ PASS | `clientes.tsx` line 12: `w-[280px] flex-shrink-0`, `ClientListItem.tsx` renders nombre + nit |
| AC2 — Real-time search, case-insensitive | ⚠️ PARTIAL | Filter logic correct (`useMemo`, both campos), but EmptyState message wrong on 0 search results (MED-1) |
| AC3 — EmptyState (API empty) | ⚠️ PARTIAL | Renders on `filteredClientes.length === 0` not `clientes.length === 0` — triggered incorrectly on search (MED-1) |
| AC4 — ErrorPanel + Reintentar | ✅ PASS | `ErrorPanel` renders on `isError`, `onRetry={refetch}` passed, Reintentar button renders |
| AC5 — GET /api/v1/clientes | ✅ PASS | Endpoint at `/api/v1/clientes`, `IEnumerable<ClienteDto>`, `200 OK` with `[]` verified in integration test |
| AC6 — clientes table | ✅ PASS | Migration: id uuid PK, nombre/nit varchar, `timestamp with time zone`, unique index `uk_clientes_nit` |

**Total: 4 PASS, 2 PARTIAL, 0 FAIL**

---

## Summary

| Severity | Count | Items |
|---|---|---|
| CRITICAL | 1 | Frontend submodule uncommitted |
| HIGH | 1 | Integration tests use InMemory not TestContainers |
| MEDIUM | 3 | EmptyState wrong on search empty, vi.mock not MSW, undocumented __root.tsx + siesa-ui-kit 1.0.77 |
| LOW | 3 | UpdatedAt public setter, File List misattribution, navigation test 5000ms timeout |
| **Total** | **8** | |
