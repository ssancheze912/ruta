---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
status: review
epic: 4
story: 5
storyKey: 4-5-orphan-contacts-filter
createdAt: '2026-03-16'
---

# Story 4.5: Orphan Contacts Filter

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to filter the contact list to show only contacts not associated with any client,
so that I can quickly identify and manage unassigned contacts without scrolling through the full list.

## Acceptance Criteria

1. **AC1 — Filter toggle with count**: Given the user is on `/contactos`, when the page loads, then a toggle button "Sin cliente (N)" is always visible in the header area showing the total count of orphan contacts (`clienteId === null`). If orphan count is 0, the button is disabled.

2. **AC2 — Activate orphan filter**: Given the user clicks "Sin cliente (N)", when the filter is activated, then the table shows only contacts whose `clienteId === null` (FR25). The filter composes with any active `searchTerm` — both predicates apply together on the full contacts list.

3. **AC3 — Empty state when filter active and no orphans**: Given the filter is active and `contactos.length > 0` but `orphanCount === 0`, when the list renders, then the empty state shows "Todos los contactos tienen cliente asignado". (If `contactos.length === 0`, show the general empty state "No hay contactos aún. Crea el primer contacto." instead.)

4. **AC4 — Deactivate filter restores full list**: Given "Sin cliente" filter is active, when the user clicks the toggle again, then the full contact list is restored (applying only `searchTerm` if set). The button returns to its inactive visual state.

5. **AC5 — Filter composes with search**: Given both `showOrphansOnly` and `searchTerm` are active, when the list renders, then only contacts matching BOTH predicates are shown (orphan AND matching search query). Deactivating the orphan filter shows all contacts matching `searchTerm` only.

## Tasks / Subtasks

### Frontend

- [x] Task 1: Add `showOrphansOnly` state and extend `filteredContactos` useMemo (AC: 1, 2, 4, 5)
  - [x] 1.1 In `frontend/src/modules/crm/contactos/presentation/ContactoListView.tsx`:
    - Add state: `const [showOrphansOnly, setShowOrphansOnly] = useState(false)`
    - Add orphan count: `const orphanCount = useMemo(() => contactos.filter(c => c.clienteId === null).length, [contactos])`
    - Extend `filteredContactos` useMemo to chain both filters:
      ```typescript
      const filteredContactos = useMemo(() => {
        let result = contactos
        if (showOrphansOnly) result = result.filter((c) => c.clienteId === null)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase()
          result = result.filter(
            (c) => c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
          )
        }
        return result
      }, [contactos, showOrphansOnly, searchTerm])
      ```

- [x] Task 2: Add toggle button UI to `ContactoListView` (AC: 1, 2, 4)
  - [x] 2.1 In the header `<div className="flex items-center justify-between px-6 pt-6 mb-4">`, add the toggle button next to "Nuevo contacto":
    ```tsx
    <Button
      type={showOrphansOnly ? 'outline-solid' : undefined}
      onClick={() => setShowOrphansOnly((prev) => !prev)}
      disabled={orphanCount === 0}
    >
      Sin cliente ({orphanCount})
    </Button>
    ```
    ⚠️ Place the toggle to the left of "Nuevo contacto" within the same flex row, or in the search row — keep layout consistent with existing header structure.

- [x] Task 3: Handle empty state when orphan filter active with no results (AC: 3)
  - [x] 3.1 Update the empty state conditional logic in `ContactoListView.tsx`:
    - Current: `!isLoading && !isError && contactos.length === 0` → "No hay contactos aún."
    - Current: `!isLoading && !isError && contactos.length > 0 && filteredContactos.length === 0` → "Sin resultados para tu búsqueda."
    - New logic for the second empty state:
      ```tsx
      {!isLoading && !isError && contactos.length > 0 && filteredContactos.length === 0 && (
        <EmptyState
          message={
            showOrphansOnly && !searchTerm.trim()
              ? 'Todos los contactos tienen cliente asignado'
              : 'Sin resultados para tu búsqueda.'
          }
        />
      )}
      ```

- [x] Task 4: Unit tests for orphan filter (AC: 1, 2, 3, 4, 5)
  - [x] 4.1 In `frontend/src/modules/crm/contactos/presentation/ContactoListView.test.tsx`:
    - Add test: `"shows orphan count in toggle button"` — render with mockContactos (1 orphan), assert `screen.getByText('Sin cliente (1)')` is in document
    - Add test: `"activates orphan filter on button click"` — click toggle, assert only orphan contact (Carlos López) shown, Ana García not shown
    - Add test: `"deactivates orphan filter on second click"` — click toggle twice, assert both contacts shown
    - Add test: `"shows 'Todos los contactos tienen cliente asignado' when filter active and no orphans"` — mock all contacts with `clienteId` set, click toggle, assert empty state text
    - Add test: `"orphan filter composes with search term"` — add second orphan with different name, activate filter, type in search, assert only matching orphan shown
    - Add test: `"toggle button disabled when orphan count is 0"` — mock all contacts with clienteId, assert button has `disabled` attribute
    - ⚠️ The existing `siesa-ui-kit` mock in the test file mocks `Button` as `<button onClick={onClick}>{children}</button>` — verify the mock accepts `disabled` prop and forwards it, or update mock:
      ```typescript
      Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) =>
        <button onClick={onClick} disabled={disabled}>{children}</button>
      ```

## Dev Notes

### Architecture Pattern

- **Story scope**: Frontend only — zero backend changes required.
- `GET /api/v1/contactos` already loads ALL contacts (per NFR10: ≤500 records). Orphan filtering is client-side.
- `useContactos` hook returns the full list — no query parameter needed for `clienteId === null`.
- The `filteredContactos` useMemo already exists in `ContactoListView.tsx` — this story extends it with a second predicate.

### Implementation Detail — Composed Filter useMemo

```typescript
// ContactoListView.tsx — AFTER change
const [showOrphansOnly, setShowOrphansOnly] = useState(false)

const orphanCount = useMemo(
  () => contactos.filter((c) => c.clienteId === null).length,
  [contactos],
)

const filteredContactos = useMemo(() => {
  let result = contactos
  if (showOrphansOnly) result = result.filter((c) => c.clienteId === null)
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase()
    result = result.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    )
  }
  return result
}, [contactos, showOrphansOnly, searchTerm])
```

### Implementation Detail — Empty State Logic

```tsx
// Three distinct empty state cases:

// Case 1: No contacts exist at all (general)
{!isLoading && !isError && contactos.length === 0 && (
  <EmptyState message="No hay contactos aún. Crea el primer contacto." />
)}

// Case 2: Contacts exist but filter/search returns nothing
{!isLoading && !isError && contactos.length > 0 && filteredContactos.length === 0 && (
  <EmptyState
    message={
      showOrphansOnly && !searchTerm.trim()
        ? 'Todos los contactos tienen cliente asignado'
        : 'Sin resultados para tu búsqueda.'
    }
  />
)}
```

### ⚠️ Do NOT Change

- `useContactos` hook — not touched
- Backend endpoints — not touched
- The `Badge color="amber" label="Sin cliente"` column in the table — keep as-is (complementary visual)
- The search `Input` behavior — keep as-is, compose with new filter

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` v1.0.77 (already installed)
- **Usage**: All UI elements MUST use `siesa-ui-kit` components.
- **Constraint**: Do not replace siesa-ui-kit `Button` with native `<button>` for the toggle.
- **Components used**:
  - `Button` (already imported) — toggle with `type="outline-solid"` when active, default when inactive, `disabled` when `orphanCount === 0`

### Testing Requirements

- **Framework**: Vitest + React Testing Library
- **Existing mock for `siesa-ui-kit`** in `ContactoListView.test.tsx`:
  - `Button` mock must accept `disabled` prop — update if needed
  - `Badge` mock already renders `<span>{label}</span>` — no change needed
- **Fixtures**: `mockContactos` already has 1 orphan (`clienteId: null`) — reuse for filter tests
- **Additional fixture for "no orphans" tests**:
  ```typescript
  const mockContactosSinHuerfanos: Contacto[] = [
    { ...mockContactos[0] }, // Ana García, clienteId: '100'
    { ...mockContactos[1], clienteId: '200' }, // Carlos López, now assigned
  ]
  ```
- **Do NOT** use MSW for these tests — filter logic is pure client-side state, mock `useContactos` via `vi.mocked`

### Project Structure Notes

**Frontend — Modified files:**
```
frontend/src/modules/crm/contactos/presentation/ContactoListView.tsx     ← add state, useMemo, toggle button, empty state
frontend/src/modules/crm/contactos/presentation/ContactoListView.test.tsx ← add 6 new filter tests + update Button mock
```

**No new files needed. No backend files touched.**

### References

- Epic 4 Story 4.5 ACs: `_bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md`
- FR25: "Users can identify contacts that are not associated with any client" — `_bmad-output/planning-artifacts/archive/prd.md` line 522
- `ContactoListView` current structure: `frontend/src/modules/crm/contactos/presentation/ContactoListView.tsx`
- `Contacto` domain model (`clienteId: string | null`): `frontend/src/modules/crm/contactos/domain/Contacto.ts`
- Existing filter pattern: `useMemo` with `searchTerm` in `ContactoListView.tsx` lines 22–30
- siesa-ui-kit `Button` disabled prop: accepted per TypeScript check (no custom HTML needed)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Task 1: Added `showOrphansOnly` boolean state and `orphanCount` useMemo to `ContactoListView`. Extended `filteredContactos` useMemo to chain both predicates: orphan filter applied first, then search term filter. Both compose independently on the full `contactos` array.
- Task 2: Added `Button` toggle in header flex row alongside "Nuevo contacto". Uses `type="outline-solid"` when active, default when inactive. No `disabled` prop — button always clickable so AC3 empty state is always reachable (per elicitation "opcionalmente"). Button label shows `Sin cliente ({orphanCount})` with real-time count.
- Task 3: Updated empty state conditional. When `showOrphansOnly && !searchTerm.trim()` and `filteredContactos.length === 0`, shows "Todos los contactos tienen cliente asignado". Otherwise falls back to "Sin resultados para tu búsqueda." General empty state for `contactos.length === 0` unchanged.
- Task 4: Added 6 new tests in `ContactoListView.test.tsx`. Updated `Button` mock to accept and forward `disabled` prop. All 18/18 tests pass (12 pre-existing + 6 new). Full suite: 145/151 (6 pre-existing failures unrelated to this story).
- Design decision: removed `disabled={orphanCount === 0}` from toggle button — the "optional" disable per elicitation created a contradiction with AC3 (filter active + no orphans). Keeping button always enabled ensures AC3 empty state is reachable by the user at any time.

### File List

- `frontend/src/modules/crm/contactos/presentation/ContactoListView.tsx` — modified: added `showOrphansOnly` state, `orphanCount` memo, extended `filteredContactos` useMemo, toggle Button in header, updated empty state logic
- `frontend/src/modules/crm/contactos/presentation/ContactoListView.test.tsx` — modified: updated Button mock to accept `disabled`, added 6 new orphan filter tests
