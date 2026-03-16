---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: in-progress
story_key: 4-4-view-associated-client-from-contact-detail
story_path: _bmad-output/implementation-artifacts/4-4-view-associated-client-from-contact-detail.md
createdAt: '2026-03-16'
---

# Code Review: 4-4-view-associated-client-from-contact-detail

- **Date**: 2026-03-16
- **Reviewer**: SiesaTeam (AI Agent)
- **Status**: In Progress

## Initial Discovery

- **Undocumented Changes**: `_bmad-output/implementation-artifacts/4-4-view-associated-client-from-contact-detail.md` (new), `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified) — expected workflow artifacts, not code
- **Missing Files**: None — all 4 files in Story File List confirmed in git commit `55e3b54`
- **Git Claim vs Reality**: ✅ Exact match

## Review Plan

### Items to Verify
- [ ] AC1: `clienteId !== null` → client name rendered in ContactoDetailView
- [ ] AC2: Click on client name button → `navigate({ to: '/clientes/$clienteId', params: { clienteId } })` called
- [ ] AC3: `clienteId === null` → "Sin cliente asignado" text displayed
- [ ] AC4: `clienteId` set + `isLoading: true` → "Cargando..." text displayed
- [ ] Task 1: `useCliente` accepts `options?: { enabled?: boolean }`, passes to useQuery `enabled` field
- [ ] Task 2: Hook call at top level (before conditional returns), `enabled: !!contacto?.clienteId`
- [ ] Task 3: 4 new tests exist, are real assertions (not placeholders), cover all 4 ACs

### Focus Areas
- **React hooks compliance**: `useCliente` called unconditionally (not inside if/conditional) — `ContactoDetailView.tsx`
- **siesa-ui-kit compliance**: `Button type="plain"` used (not `<button>` or `<a>`) — `ContactoDetailView.tsx`
- **Null safety**: `contacto?.clienteId`, `contacto.clienteId!` non-null assertion scope — `ContactoDetailView.tsx`
- **Test mock correctness**: `vi.mock` + `vi.mocked` pattern, `beforeEach` default setup, fixture completeness — `ContactoDetailView.test.tsx`
- **Enabled option default**: Existing callers without second arg must remain unaffected (`enabled` defaults to `true`) — `useCliente.ts`
- **Query key stability**: Empty string `''` passed when no `clienteId` — could cause query cache pollution — `ContactoDetailView.tsx`
- **Project context rules**: API mocking in hook tests (MSW), UI text in Spanish, no custom components

## Review Findings

### Critical Issues (Must Fix)
_None_

### High Issues (Should Fix Before Merge)
_None_

### Medium Issues (Should Fix)

- **[MED-1]** Missing error state for `useCliente` failure in `ContactoDetailView.tsx` lines 81-97.
  When `useCliente` enters error state (`isError: true`, e.g. network failure or 500), `isClienteLoading` is `false` and `cliente` is `undefined`. The ternary falls to the else branch rendering `<Button>—</Button>`. The user sees a clickable dash and can navigate to a client detail that will also error. The component has no protection against it — contrast: the contact load failure shows an `ErrorPanel` with retry.

### Low Issues (Nice to Fix)

- **[LOW-1]** Empty string `''` used as query key sentinel instead of `skipToken` — `ContactoDetailView.tsx` line 21.
  `contacto?.clienteId ?? ''` passes `''` as the query ID, registering `['clientes', '']` in the TanStack Query cache. TanStack Query v5 provides `skipToken` specifically for this pattern, which is semantically explicit and eliminates the risk of cache key `['clientes', '']` being accidentally fetched if the `enabled` logic changes.

- **[LOW-2]** No test for `useCliente` error state — `ContactoDetailView.test.tsx`.
  All 4 AC tests cover client name, navigation, no-client, and loading — but there is no test for `{ data: undefined, isLoading: false, isError: true }`. The "—" button behavior in error state is untested. Combined with MED-1, this gap hides a real UX defect.

- **[LOW-3]** Redundant non-null assertion `contacto.clienteId!` — `ContactoDetailView.tsx` line 90.
  Inside the `{contacto.clienteId ? (...)` truthy branch, TypeScript already narrows `clienteId` from `string | null` to `string`. The `!` is redundant — confirmed by `tsc --noEmit` passing without it. Redundant assertions train reviewers to ignore `!` when they genuinely matter.

## Code Review Fixes Applied

| Finding | Fix |
|---------|-----|
| MED-1 | Added `isClienteError` destructuring from `useCliente`; added `isClienteError ?` branch in JSX rendering `<DescriptionList term="Cliente" details="Error al cargar cliente" />` |
| LOW-2 | Added test `shows "Error al cargar cliente" when client fetch fails` — mocks `{ data: undefined, isLoading: false, isError: true }`, asserts text in document |
| LOW-3 | Removed redundant `!` from `contacto.clienteId!` → `contacto.clienteId` (TypeScript narrows inside truthy branch) |
| LOW-1 | Accepted as-is — `enabled: false` with empty string key is standard TanStack Query v5 pattern; `skipToken` would require API changes to `useCliente` signature |

## Fix Outcome
- **Action Taken**: Fixed automatically
- **Fixed Count**: 3 (MED-1, LOW-2, LOW-3)
- **Won't Fix**: 1 (LOW-1 — accepted pattern)
- **Tests after fixes**: 24/24 ContactoDetailView ✅
- **Recommended Status**: done

## Status Sync
- **Story File Status**: Updated to `done`
- **Sprint Status YAML**: ✅ Synced — `4-4-view-associated-client-from-contact-detail` → `done`
