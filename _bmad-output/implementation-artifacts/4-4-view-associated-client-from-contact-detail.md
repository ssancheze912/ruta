---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
status: review
epic: 4
story: 4
storyKey: 4-4-view-associated-client-from-contact-detail
createdAt: '2026-03-16'
---

# Story 4.4: View Associated Client from Contact Detail

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to see which client a contact is associated with directly from the contact detail view,
so that I can understand the relationship and navigate to that client with a single click.

## Acceptance Criteria

1. **AC1 — Display associated client name**: Given a contact is associated with a client (`clienteId !== null`), when the user views the contact detail (`/contactos/:contactoId`), then the associated client's name is displayed in the contact detail section (FR23). No additional search or navigation is required to see this information (NFR9).

2. **AC2 — Navigate to client on click**: Given the associated client's name is displayed in the contact detail, when the user clicks on the client name, then the user is navigated to `/clientes/:clienteId` showing the full client detail (FR24).

3. **AC3 — No client state**: Given a contact has no associated client (`clienteId === null`), when the user views the contact detail, then the text "Sin cliente asignado" is displayed in the client field (FR23).

4. **AC4 — Loading state**: Given the contact has a `clienteId` and the client data is being fetched, when `useCliente` is loading, then a loading indicator ("Cargando...") is shown in the client field instead of an empty or broken state.

## Tasks / Subtasks

### Frontend

- [x] Task 1: Update `useCliente` to support conditional execution (AC: 1, 3, 4)
  - [x] 1.1 In `frontend/src/modules/crm/clientes/application/useCliente.ts`:
    - Add optional second parameter: `options?: { enabled?: boolean }`
    - Pass `enabled: options?.enabled ?? true` to the `useQuery` config
    - Existing call sites without the second argument are unaffected (defaults to `true`)

- [x] Task 2: Add associated client section to `ContactoDetailView` (AC: 1, 2, 3, 4)
  - [x] 2.1 In `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx`:
    - Import `useCliente` from `../../clientes/application/useCliente`
    - After the existing `const router = useRouter()` line, add:
      ```typescript
      const { data: cliente, isLoading: isClienteLoading } = useCliente(
        contacto?.clienteId ?? '',
        { enabled: !!contacto?.clienteId }
      )
      ```
      ⚠️ This hook call must be at the top level of the component (React hooks rules) — place it BEFORE any conditional returns. Use `enabled: false` when `clienteId` is null to avoid unnecessary API calls.
    - In the `<div className="space-y-1">` block, after the last `<DescriptionList>` item, add the client section:
      ```tsx
      {contacto.clienteId ? (
        isClienteLoading ? (
          <DescriptionList term="Cliente" details="Cargando..." />
        ) : (
          <DescriptionList
            term="Cliente"
            details={
              <Button
                type="plain"
                onClick={() =>
                  navigate({ to: '/clientes/$clienteId', params: { clienteId: contacto.clienteId! } })
                }
              >
                {cliente?.nombre ?? '—'}
              </Button>
            }
          />
        )
      ) : (
        <DescriptionList term="Cliente" details="Sin cliente asignado" />
      )}
      ```
      ⚠️ **siesa-ui-kit caveat**: If `DescriptionList` does not accept `ReactNode` for `details`, use this fallback layout instead:
      ```tsx
      {contacto.clienteId ? (
        isClienteLoading ? (
          <DescriptionList term="Cliente" details="Cargando..." />
        ) : (
          <div className="flex flex-wrap gap-1 items-start py-2.5 border-b border-border-secondary dark:border-gray-700">
            <div className="flex-1 min-w-[180px]">
              <p className="text-sm font-medium text-content-secondary dark:text-dark-content-secondary">Cliente</p>
            </div>
            <div className="flex-1 min-w-[180px]">
              <Button
                type="plain"
                onClick={() =>
                  navigate({ to: '/clientes/$clienteId', params: { clienteId: contacto.clienteId! } })
                }
              >
                {cliente?.nombre ?? '—'}
              </Button>
            </div>
          </div>
        )
      ) : (
        <DescriptionList term="Cliente" details="Sin cliente asignado" />
      )}
      ```
      Verify `DescriptionList` API before choosing approach. Primary approach preferred.

- [x] Task 3: Unit tests for the associated client section (AC: 1, 2, 3, 4)
  - [x] 3.1 In `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx`:
    - Add import: `import * as useClienteModule from '../../clientes/application/useCliente'`
    - Add `vi.mock('../../clientes/application/useCliente')` (or mock inline — see Testing Requirements below)
    - Add `const mockUseCliente = vi.mocked(useClienteModule.useCliente)`
    - In `beforeEach`, add default mock for `useCliente`: returns `{ data: undefined, isLoading: false }` (safe default)
    - Add test: `"shows associated client name when contact has clienteId"` — render contacto with `clienteId: 'cliente-abc'`, mock useCliente returning `{ data: { id: 'cliente-abc', nombre: 'Empresa XYZ', ... }, isLoading: false }`, assert `screen.getByText('Empresa XYZ')` is in the document
    - Add test: `"navigates to client detail on client name click"` — same setup, click the client name button, assert `mockNavigate` was called with `{ to: '/clientes/$clienteId', params: { clienteId: 'cliente-abc' } }`
    - Add test: `"shows 'Sin cliente asignado' when contact has no clienteId"` — render contacto with `clienteId: null`, assert `screen.getByText('Sin cliente asignado')` is in the document, assert `mockUseCliente` was called with `{ enabled: false }` (or verify no client name is shown)
    - Add test: `"shows 'Cargando...' while client data is loading"` — render contacto with `clienteId: 'cliente-abc'`, mock useCliente returning `{ data: undefined, isLoading: true }`, assert `screen.getByText('Cargando...')` is in the document

## Dev Notes

### Architecture Pattern

- **Story scope**: Frontend only — zero backend changes required.
- `GET /api/v1/clientes/{id}` already exists from Epic 2, implemented in `ClienteEndpoints.cs`.
- `useCliente` hook already exists at `frontend/src/modules/crm/clientes/application/useCliente.ts` — only minor enhancement needed (add `enabled` option).
- `ContactoDetailView` already renders `DescriptionList` items and uses `useNavigate` — this story adds one more conditional section.
- Architecture doc explicitly plans: `ContactoDetailView (detail + client link)` — story 4.4 completes this spec.

### ⚠️ CRITICAL: Conditional Hook Call Pattern

`useCliente` MUST be called at the **top level** of `ContactoDetailView` (not inside a conditional block — React hooks rules). The `enabled: false` option prevents the API call when `clienteId` is null:

```typescript
// CORRECT — called unconditionally at top of component
const { data: cliente, isLoading: isClienteLoading } = useCliente(
  contacto?.clienteId ?? '',       // safe empty string when clienteId is null
  { enabled: !!contacto?.clienteId } // enabled: false → no API call, data stays undefined
)

// WRONG — conditional hook call (React rules violation)
// if (contacto?.clienteId) { const { data } = useCliente(contacto.clienteId) }
```

Note: `contacto` may be `undefined` during initial render (before `useContacto` resolves), so use optional chaining `contacto?.clienteId`.

### Implementation Detail — useCliente with enabled option

```typescript
// frontend/src/modules/crm/clientes/application/useCliente.ts — AFTER change
export function useCliente(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['clientes', id],
    queryFn: () => clienteApiRepository.getById(id),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: unknown) => {
      if (!axios.isAxiosError(error) || !error.response || error.response.status === 404) return false
      return failureCount < 2
    },
  })
}
```

### Implementation Detail — Navigation to Client

Use `useNavigate` already present in the component for the client click:
```typescript
navigate({ to: '/clientes/$clienteId', params: { clienteId: contacto.clienteId! } })
```
The `!` non-null assertion is safe here because this code only executes inside `contacto.clienteId ? (...)` block.

### ⚠️ Do NOT Change

- `AssociatedContactsSection.tsx` — not touched
- `ClienteDetailView.tsx` — not touched
- Backend endpoints — not touched
- The 404 error state "Volver a contactos" button in `ContactoDetailView` — keep unchanged
- The delete/edit dialogs in `ContactoDetailView` — keep unchanged

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` v1.0.77 (already installed)
- **Usage**: All UI elements MUST use `siesa-ui-kit` components.
- **Constraint**: Do not replace siesa-ui-kit `Button` with native `<button>` or `<a>` for the client name link.
- **Components used**:
  - `DescriptionList` (already imported) — for "Sin cliente asignado" and "Cargando..." states
  - `Button type="plain"` (already imported) — for the clickable client name link

### Testing Requirements

- **Framework**: Vitest + React Testing Library
- **Mock pattern for `useCliente`**:
  ```typescript
  import * as useClienteModule from '../../clientes/application/useCliente'

  vi.mock('../../clientes/application/useCliente')
  const mockUseCliente = vi.mocked(useClienteModule.useCliente)

  // In beforeEach — safe default (no client data):
  mockUseCliente.mockReturnValue({
    data: undefined,
    isLoading: false,
  } as unknown as ReturnType<typeof useClienteModule.useCliente>)
  ```
- **Contact fixture with clienteId**:
  ```typescript
  const contactoConCliente = {
    ...contactoFake,
    clienteId: 'cliente-abc',
  }
  ```
- **Cliente fixture**:
  ```typescript
  const clienteFake = {
    id: 'cliente-abc',
    nombre: 'Empresa XYZ',
    nit: '900123456',
    telefono: '6011234567',
    ciudad: 'Bogotá',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
  ```
- **Do NOT** use MSW for these tests — mock `useCliente` directly via `vi.mocked`

### Project Structure Notes

**Frontend — Modified files:**
```
frontend/src/modules/crm/clientes/application/useCliente.ts           ← add enabled option
frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx ← add client section
frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx ← add 4 new tests
```

**No new files needed. No backend files touched.**

**Cross-module import** (contactos → clientes) is intentional and follows the existing pattern established in stories 4.1–4.3 where contactos and clientes modules interact directly.

### References

- Epic 4 Story 4.4 ACs: `_bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md`
- FR23, FR24: `_bmad-output/planning-artifacts/prd/feature-asociacion-cliente-contacto.md`
- NFR9 (no additional search): `_bmad-output/planning-artifacts/architecture.md`
- `useCliente` hook: `frontend/src/modules/crm/clientes/application/useCliente.ts`
- `Contacto` domain model (clienteId field): `frontend/src/modules/crm/contactos/domain/Contacto.ts` line 7
- `ContactoDetailView` current structure: `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx`
- Architecture note on ContactoDetailView: `_bmad-output/planning-artifacts/architecture.md` line 271 — `/contactos/:id → ContactoDetailView (detail + client link)`
- TanStack Query `enabled` option: used in pattern `useQuery({ ..., enabled: !!someId })`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Task 1: Added `options?: { enabled?: boolean }` parameter to `useCliente` hook. Passed `enabled: options?.enabled ?? true` to `useQuery` config. Existing call sites unaffected (defaults to `true`). TDD: added test `does not fetch when enabled is false` — all 4 useCliente tests pass.
- Task 2: Added `useCliente` import and conditional hook call at top level of `ContactoDetailView` (before conditional returns, per React hooks rules). Used `enabled: !!contacto?.clienteId` to skip API call when no client. Added client section in JSX using `DescriptionList` (primary approach — ReactNode `details` prop accepted). `Button type="plain"` navigates to `/clientes/$clienteId` on click.
- Task 3: Added `useCliente` mock (`vi.mock` + `vi.mocked`), fixtures (`contactoConCliente`, `clienteFake`), default mock in `beforeEach` (returns `{ data: undefined, isLoading: false }`). Added 4 new tests covering all 4 ACs: client name display, navigation on click, "Sin cliente asignado" when no clienteId, "Cargando..." during loading. All 23/23 ContactoDetailView tests pass.
- Full suite: 138/144 pass — 6 pre-existing failures (ClienteDeleteDialog "Confirmar" text mismatch + navigation integration tests), unrelated to this story.

### File List

- `frontend/src/modules/crm/clientes/application/useCliente.ts` — modified: added `options?: { enabled?: boolean }` parameter and `enabled` option to useQuery
- `frontend/src/modules/crm/clientes/application/useCliente.test.ts` — modified: added test `does not fetch when enabled is false`
- `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx` — modified: added `useCliente` import, conditional hook call, client section in JSX
- `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx` — modified: added useCliente mock, fixtures, default mock in beforeEach, 4 new AC tests
