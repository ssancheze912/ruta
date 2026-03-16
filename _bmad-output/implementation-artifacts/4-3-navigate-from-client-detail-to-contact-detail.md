---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
status: done
epic: 4
story: 3
storyKey: 4-3-navigate-from-client-detail-to-contact-detail
createdAt: '2026-03-16'
---

# Story 4.3: Navigate from Client Detail to Contact Detail

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to navigate from a contact listed in the client detail view to that contact's full detail page,
so that I can access all contact information with no more than 2 clicks from the client record.

## Acceptance Criteria

1. **AC1 — Forward Navigation**: Given the user is in the client detail view (`/clientes/:clienteId`) and contacts are listed in the `AssociatedContactsSection`, when the user clicks on a contact row, then the user is navigated to `/contactos/:contactoId` showing the full contact detail (FR22, NFR8).

2. **AC2 — Click Count Constraint**: The navigation requires no more than 2 clicks from the client record. Clicking the contact row is 1 click total — NFR8 satisfied.

3. **AC3 — Back Navigation via "Volver"**: Given the user navigated to a contact detail from the client detail view, when the user clicks the "Volver" button in `ContactoDetailView`, then the user returns to the previous page (the client detail view) — not hardcoded to `/contactos`.

4. **AC4 — Back Navigation via browser back**: Given the user is in the contact detail view, when the user clicks the browser back button, then the user returns to the client detail view.

5. **AC5 — "Volver" works from any origin**: The "Volver" button in `ContactoDetailView` always returns to the previous page, whether the user arrived from the client detail, the contact list, or any other origin.

## Tasks / Subtasks

### Frontend

- [x] Task 1: Update "Volver" button in `ContactoDetailView` to use history back (AC: 3, 4, 5)
  - [x] 1.1 In `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx`:
    - Import `useRouter` from `@tanstack/react-router`
    - Replace `const navigate = useNavigate()` with `const router = useRouter()` (keep `useNavigate` only if used for other navigations in the file)
    - Change `onClick={() => navigate({ to: '/contactos' })}` on the "Volver" button to `onClick={() => router.history.back()}`
    - The 404-state "Volver a contactos" button should remain pointing to `/contactos` (explicit fallback when there's no history — this is intentional)
    - Verify: `useNavigate` is still needed for the post-delete redirect (`navigate({ to: '/contactos' })`) — keep it in file

- [x] Task 2: Unit tests for `ContactoDetailView` — back navigation (AC: 3, 5)
  - [x] 2.1 Update `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx`:
    - Add mock for `useRouter` from `@tanstack/react-router`
    - Add test: `"Volver button calls router.history.back()"` — render loaded contacto state, click "Volver", assert `mockHistoryBack` was called
    - Ensure existing tests still pass (delete, edit, 404 behavior)

- [x] Task 3: Verify forward navigation test coverage in `AssociatedContactsSection` (AC: 1, 2)
  - [x] 3.1 Confirm test `"navigates to contact on row click"` exists and passes in `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.test.tsx` (added in story 4.2 — already implemented). No new code needed, just validation.

## Dev Notes

### Architecture Pattern

- **Story scope**: Frontend only — zero backend changes required.
- **Forward nav**: Already implemented in story 4.2 via `AssociatedContactsSection.tsx` `onRowClick`:
  ```typescript
  onRowClick={(row) => navigate({ to: '/contactos/$contactoId', params: { contactoId: row.id } })}
  ```
  TanStack Router `navigate()` pushes to history by default — browser back works natively.
- **Back nav fix**: `ContactoDetailView` currently hardcodes `navigate({ to: '/contactos' })` for "Volver". This breaks the back-to-client UX when arriving from the client detail. Fix: use `router.history.back()`.

### Implementation Detail — Dual Navigation in ContactoDetailView

`ContactoDetailView` uses both `useNavigate` and `useRouter` after the fix:

```typescript
import { useNavigate, useRouter } from '@tanstack/react-router'

// In component:
const navigate = useNavigate()   // kept for post-delete redirect → '/contactos'
const router = useRouter()       // used for "Volver" button → history.back()
```

The 404 fallback button ("Volver a contactos") keeps `navigate({ to: '/contactos' })` — when the contact doesn't exist there's no meaningful history to go back to.

### ⚠️ Do NOT Change

- `AssociatedContactsSection.tsx` — already correct, no modifications needed
- `AssociatedContactsSection.test.tsx` — forward nav test already exists from story 4.2
- Backend endpoints — not touched in this story
- The 404 error state "Volver a contactos" button — keep hardcoded to `/contactos`

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` v1.0.77 (already installed)
- **Usage**: `Button` from `siesa-ui-kit` is already used in `ContactoDetailView`. No new siesa-ui-kit components needed.
- **Constraint**: Do not replace siesa-ui-kit `Button` with native `<button>`.

### Testing Requirements

- **Framework**: Vitest + React Testing Library + MSW
- **Mock pattern for `useRouter`**:
  ```typescript
  const mockHistoryBack = vi.fn()
  vi.mock('@tanstack/react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tanstack/react-router')>()
    return {
      ...actual,
      useRouter: () => ({ history: { back: mockHistoryBack } }),
      useNavigate: () => vi.fn(),
    }
  })
  ```
- **Do NOT** mock `AssociatedContactsSection` for the forward-nav test — it already has its own dedicated test file

### Project Structure Notes

**Frontend — Modified files:**
```
frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx       ← change "Volver" to router.history.back()
frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx  ← add back-nav test
```

**No new files needed.** No backend files touched.

### References

- Forward navigation implementation: `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.tsx` line 88–91
- Current "Volver" hardcode: `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx` line 63
- TanStack Router `useRouter`: `frontend/node_modules/@tanstack/react-router/dist/esm/index.js` (confirmed exported)
- Epic 4 Story 4.3 ACs: `_bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md`
- NFR8 (≤2 clicks): Architecture doc — `_bmad-output/planning-artifacts/architecture.md`
- Existing forward-nav test: `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.test.tsx` — `"navigates to contact on row click"`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

1. **Task 1**: Updated `ContactoDetailView.tsx` — imported `useRouter` from `@tanstack/react-router` (alongside existing `useNavigate`), added `const router = useRouter()`, changed "Volver" button `onClick` from `navigate({ to: '/contactos' })` to `router.history.back()`. The 404-state "Volver a contactos" button intentionally keeps the hardcoded `/contactos` route.
2. **Task 2**: Updated `ContactoDetailView.test.tsx` — added `mockHistoryBack = vi.fn()`, extended the `@tanstack/react-router` mock to include `useRouter: () => ({ history: { back: mockHistoryBack } })`, added `mockHistoryBack.mockReset()` in `beforeEach`, renamed/updated existing "Volver" test to `'Volver button calls router.history.back()'` asserting `mockHistoryBack.toHaveBeenCalledOnce()` and `mockNavigate` NOT called with `{ to: '/contactos' }`.
3. **Task 3**: Confirmed test `"navigates to contact on row click"` exists in `AssociatedContactsSection.test.tsx` (line 173) — already passing from story 4.2. No new code needed.
4. **Pre-existing test failures**: 2 tests (`calls delete mutation and navigates when Confirmar is clicked`, `does not navigate when delete mutation fails`) were already failing before this story due to siesa-ui-kit Alert component rendering "Confirmar" text differently in test environment. These are NOT introduced by story 4.3.

### File List

**Modified:**
- `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx`
- `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx`

**No new files created. No backend files touched.**

### Code Review Fixes Applied

1. `vi.mock('@tanstack/react-router', ...)` updated to use `importOriginal` spread pattern per project standard
2. Removed redundant `mockHistoryBack.mockReset()` from `beforeEach` — `vi.clearAllMocks()` sufficient
3. Strengthened "Volver" test assertion to `expect(mockNavigate).not.toHaveBeenCalled()`
4. Fixed pre-existing delete confirmation tests: `screen.getByText('Confirmar')` → `screen.getAllByText('Eliminar')[1]` (Alert renders confirm button with `confirmText="Eliminar"` value)
