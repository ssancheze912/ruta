---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
story_path: _bmad-output/implementation-artifacts/3-2-contact-detail-view.md
story_key: 3-2-contact-detail-view
---

# Code Review: 3-2-contact-detail-view

- **Date**: 2026-03-13
- **Reviewer**: SiesaTeam (AI Agent — Adversarial Senior Developer)
- **Status**: In Progress

## Initial Discovery

- **Undocumented Changes**: None — all committed files match Story Dev Agent Record
- **Missing Files**: None
- **Git Validation**: ✅ Story File List matches actual commit `bcbfbf6` (main) + `40c1365` (frontend submodule)
- **Project Context**: No project-context.md found — reviewing against architecture docs and story constraints

## Review Plan

### Items to Verify

- [ ] AC1: "Ver" Link in ContactoListView navigates to `/contactos/$contactoId` with correct params
- [ ] AC2: ContactoDetailView renders Nombre/Cargo/Teléfono/Email via `DescriptionList` (string details)
- [ ] AC3: Route file extracts `contactoId` via `Route.useParams()` — direct URL access works
- [ ] AC4: 404 shows Spanish not-found message; `useContacto` does NOT retry 404
- [ ] AC5: Loading skeleton renders during fetch, no empty fields shown
- [ ] AC6: Non-404 errors render `ErrorPanel` with `onRetry`
- [ ] AC7: `GET /api/v1/contactos/{id}` returns 200+ContactoDto or 404; `{id:guid}` constraint present
- [ ] AC8: "Volver" button navigates to `/contactos`
- [ ] Task 1.1/1.2: Query record + handler null-check + all fields mapped
- [ ] Task 2.1: Route constraint, `.Produces<>()` metadata, 404 path
- [ ] Task 2.2: `AddScoped<GetContactoByIdQueryHandler>()` in Program.cs
- [ ] Task 3.1: Unit tests cover found/not-found/field-mapping; 3 tests total
- [ ] Task 3.2: Integration tests use Testcontainers; 2 tests (200 shape + 404)
- [ ] Task 4.1/4.2: `getById` in interface + implementation hitting `/contactos/${id}`
- [ ] Task 5.1: `queryKey: ['contactos', id]`, `staleTime: 5*60*1000`, 404 retry suppression
- [ ] Task 6.1: All 4 states (loading/404/error/success) present and correct
- [ ] Task 6.2: Route ID `'/_app/contactos/$contactoId'`, `useParams()` extracts correctly
- [ ] Task 6.3: `Link` with `to` + `params` as last column in columns array
- [ ] Task 7.1/7.2: Tests have real behavioral assertions, cover all branches

### Focus Areas

- **Security checks on**: `ContactoEndpoints.cs` (input validation, guid constraint), `ContactoDetailView.tsx` (no HTML injection)
- **Performance checks on**: `GetContactoByIdQueryHandler.cs` (AsNoTracking), `useContacto.ts` (staleTime, retry policy)
- **Type safety checks on**: `useContacto.ts` (error cast pattern), `contactos.$contactoId.tsx` (useParams typing)
- **Test quality checks on**: `ContactoDetailView.test.tsx`, `useContacto.test.ts`, `GetContactoByIdQueryHandlerTests.cs`, `ContactoEndpointsTests.cs`
- **Architecture compliance on**: DI lifetime, Clean Architecture layers, no cross-layer violations

## Review Findings

### Critical Issues (Must Fix)

_None found._

### Medium Issues (Should Fix)

- **[MED-1]** `ContactoEndpoints.cs:26` — `Results.NotFound()` returns HTTP 404 with **empty body**. AC7 explicitly requires "Follows Problem Details RFC 7807 on all errors." `ExceptionHandlingMiddleware` only catches exceptions — it does NOT intercept `Results.NotFound()`. Story dev note claiming automatic Problem Details formatting is incorrect. Fix: use `Results.Problem(statusCode: 404, title: "Not Found", detail: "Contacto no encontrado.")` and add a body assertion to the integration test.

- **[MED-2]** `useContacto.ts:10` + `ContactoDetailView.tsx:14-15` — Error shape cast `(error as { response?: { status?: number } })?.response?.status` is **duplicated in two files**. Maintainability risk: if the HTTP client changes (e.g., axios → fetch), the error shape needs updating in both places. Fix: extract to a shared utility `getHttpStatus(error: unknown): number | undefined`.

- **[MED-3]** `useContacto.test.ts:18` — `createWrapper()` passes `retry: false` to `defaultOptions`, but in TanStack Query v5 **query-level options override `defaultOptions`**. The "does not retry on 404" test passes because the hook's own retry callback correctly suppresses 404 retries — but if the callback is removed, the test would *still pass* because the wrapper's `retry: false` would apply. The test does not actually validate the hook's retry suppression logic in isolation. Fix: create the test wrapper WITHOUT `retry: false` (only use `retryDelay: 0`) so the test exercises the hook's retry callback.

### Low Issues (Nice to Fix)

- **[LOW-1]** `ContactoDetailView.test.tsx` — No test covers clicking "Volver a contactos" in the **404 not-found state**. Only the success-state "Volver" button navigation is tested (line 103). The 404 state back navigation is untested.

- **[LOW-2]** `ContactoDetailView.test.tsx:45-47` — Uses `.toBeTruthy()` instead of `.toBeInTheDocument()` for field presence assertions. Inconsistent with the established project pattern (see `ContactoListView.test.tsx` lines 58-62). `.toBeTruthy()` on a DOM element is weaker — it would pass even if the element were detached.

- **[LOW-3]** `GetContactoByIdQueryHandlerTests.cs:63-87` — `HandleAsync_MapsAllFields_Correctly` does not assert `result.Id`. If the DTO mapping accidentally mapped the wrong entity's `Id`, this test would not detect it. Test 1 (`HandleAsync_WhenContactoExists_ReturnsMappedDto`) does verify `Id` correctly, but test 3 claims to verify "all fields" while skipping one.

## Findings Summary

| # | Severity | File | Description |
|---|----------|------|-------------|
| 1 | MED | `ContactoEndpoints.cs:26` | `Results.NotFound()` empty body — not RFC 7807 compliant (AC7) |
| 2 | MED | `useContacto.ts:10` + `ContactoDetailView.tsx:15` | Error shape cast duplicated |
| 3 | MED | `useContacto.test.ts:18` | `retry: false` in wrapper masks hook's retry logic test |
| 4 | LOW | `ContactoDetailView.test.tsx` | 404-state Volver button navigation untested |
| 5 | LOW | `ContactoDetailView.test.tsx:45-47` | `.toBeTruthy()` instead of `.toBeInTheDocument()` |
| 6 | LOW | `GetContactoByIdQueryHandlerTests.cs:76` | `HandleAsync_MapsAllFields_Correctly` missing `result.Id` assertion |

## Fix Outcome

- **Action Taken**: Fixed automatically
- **Fixed Count**: 6 (3 Medium, 3 Low)
- **Task Count**: 0
- **Changes Applied**:
  - `ContactoEndpoints.cs` — `Results.NotFound()` → `Results.Problem(statusCode: 404, ...)` (RFC 7807 compliant)
  - `ContactoEndpointsTests.cs` — renamed test + added `application/problem+json` Content-Type assertion
  - `frontend/src/shared/lib/httpError.ts` — NEW: `getHttpStatus(error)` utility (extracted shared cast)
  - `useContacto.ts` — uses `getHttpStatus()` (eliminates duplicate cast)
  - `ContactoDetailView.tsx` — uses `getHttpStatus()` (eliminates duplicate cast)
  - `useContacto.test.ts` — removed `retry: false` from wrapper (now tests hook's own retry logic)
  - `ContactoDetailView.test.tsx` — added 404-state "Volver a contactos" navigation test
  - `ContactoDetailView.test.tsx` — `.toBeTruthy()` → `.toBeInTheDocument()`
  - `GetContactoByIdQueryHandlerTests.cs` — added `Assert.Equal(entity.Id, result.Id)` to third test
- **Build**: Backend 0 errors ✅ | Frontend 0 TS errors ✅
- **Tests**: Backend 14/14 ✅ | Frontend 48/48 ✅
- **Recommended Status**: done

## Status Sync

- **Story File Status**: Updated to `done`
- **Sprint Status YAML**: ✅ Synced — `3-2-contact-detail-view: review → done`

## Repository Sync

- **Branch**: develop-santidev-ssancheze-epics-2-3
- **Commit**: `9647240` — fix(review-3.2): apply code review fixes and mark story done
- **Push**: ✅ Pushed to origin/develop-santidev-ssancheze-epics-2-3
- **GitFlow Compliance**: ✅ Verified against git-flow-siesa.md
- **Status**: Workflow Completed Successfully
