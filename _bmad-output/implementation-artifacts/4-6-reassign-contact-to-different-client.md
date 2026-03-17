---
stepsCompleted: []
status: done
epic: 4
story: 6
storyKey: 4-6-reassign-contact-to-different-client
createdAt: '2026-03-16'
---

# Story 4.6: Reassign Contact to Different Client

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to reassign a contact from one client to a different client,
so that I can correct associations or reflect organizational changes without navigating to a separate screen.

## Acceptance Criteria

1. **AC1 — Reassign trigger**: Given the user is viewing the detail of a contact that is associated with a client (`contacto.clienteId !== null`), when the page loads, then a "Reasignar cliente" button is visible in the header action row. The button is NOT shown when `contacto.clienteId === null` (orphan contacts are assigned via story 4.2, not this story).

2. **AC2 — Client selector dialog**: Given the user clicks "Reasignar cliente", when the dialog opens, then a `Select` component shows all available clients EXCEPT the currently assigned one (to prevent no-op reassignments). If clients are loading, the Select is disabled. If no other clients exist, the Select shows an empty options list and the confirm button is disabled.

3. **AC3 — Confirm reassignment**: Given the user selects a target client and clicks "Guardar", when the mutation succeeds:
   - `PUT /api/v1/contactos/{id}/cliente` is called with `{ clienteId: newClienteId }` (FR26)
   - Query keys invalidated: `['contactos']`, `['contactos', { clienteId: oldClienteId }]`, `['contactos', { clienteId: newClienteId }]` — ensuring all affected client views update immediately (FR27)
   - Toast: "Contacto reasignado correctamente"
   - Dialog closes

4. **AC4 — Cancel**: Given the dialog is open, when the user clicks "Cancelar" or closes the dialog, then no API call is made and the contact's `clienteId` remains unchanged.

5. **AC5 — Error handling**: Given the mutation fails, when the API returns an error, then a toast shows "No se pudo completar la operación. Intenta de nuevo." and the dialog remains open (user can retry or cancel).

## Tasks / Subtasks

### Frontend

- [x] Task 1: Create `useReassignContactoCliente` mutation hook (AC: 3, 5)
  - [x] 1.1 Create `frontend/src/modules/crm/contactos/application/useReassignContactoCliente.ts`:
    ```typescript
    interface ReassignParams {
      contactoId: string
      newClienteId: string
      oldClienteId: string
    }

    export function useReassignContactoCliente() {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: ({ contactoId, newClienteId }: ReassignParams) =>
          contactoRepository.assignCliente(contactoId, newClienteId),
        onSuccess: (_, { oldClienteId, newClienteId }) => {
          queryClient.invalidateQueries({ queryKey: ['contactos'] })
          queryClient.invalidateQueries({ queryKey: ['contactos', { clienteId: oldClienteId }] })
          queryClient.invalidateQueries({ queryKey: ['contactos', { clienteId: newClienteId }] })
          toast.success('Contacto reasignado correctamente')
        },
        onError: () => {
          toast.error('No se pudo completar la operación. Intenta de nuevo.')
        },
      })
    }
    ```

- [x] Task 2: Create `ReasignarClienteDialog` component (AC: 2, 3, 4)
  - [x] 2.1 Create `frontend/src/modules/crm/contactos/presentation/ReasignarClienteDialog.tsx`:
    - Props: `contactoId: string`, `currentClienteId: string`, `open: boolean`, `onOpenChange: (open: boolean) => void`
    - Uses `useClientes()` for client list
    - Uses `useReassignContactoCliente()` for mutation
    - Local state: `selectedClienteId: string | undefined`
    - `Select` options = `clientes.filter(c => c.id !== currentClienteId).map(c => ({ value: c.id, label: c.nombre }))`
    - "Guardar" button: disabled when `!selectedClienteId || isPending`; calls `mutate({ contactoId, newClienteId: selectedClienteId, oldClienteId: currentClienteId }, { onSuccess: () => onOpenChange(false) })`
    - "Cancelar" button: calls `onOpenChange(false)`
    - Wrap in `Dialog` + `DialogContent` from `@/components/ui/dialog`
    - Reset `selectedClienteId` to `undefined` when dialog closes (`onOpenChange(false)`)
  - [x] 2.2 Full implementation structure:
    ```tsx
    import { useState } from 'react'
    import { Button, Select } from 'siesa-ui-kit'
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
    import { useClientes } from '@/modules/crm/clientes/application/useClientes'
    import { useReassignContactoCliente } from '../application/useReassignContactoCliente'

    export function ReasignarClienteDialog({ contactoId, currentClienteId, open, onOpenChange }) {
      const [selectedClienteId, setSelectedClienteId] = useState<string | undefined>(undefined)
      const { clientes, isLoading: isClientesLoading } = useClientes()
      const reassignMutation = useReassignContactoCliente()

      const options = clientes
        .filter((c) => c.id !== currentClienteId)
        .map((c) => ({ value: c.id, label: c.nombre }))

      const handleClose = () => {
        setSelectedClienteId(undefined)
        onOpenChange(false)
      }

      const handleConfirm = () => {
        if (!selectedClienteId) return
        reassignMutation.mutate(
          { contactoId, newClienteId: selectedClienteId, oldClienteId: currentClienteId },
          { onSuccess: handleClose },
        )
      }

      return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reasignar a otro cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Select
                options={options}
                value={selectedClienteId}
                onChange={(val) => setSelectedClienteId(String(val))}
                placeholder="Seleccionar cliente..."
                disabled={isClientesLoading || reassignMutation.isPending}
                fullWidth
                ariaLabel="Seleccionar cliente destino"
              />
              <div className="flex justify-end gap-2">
                <Button type="outline-solid" onClick={handleClose} disabled={reassignMutation.isPending}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedClienteId || reassignMutation.isPending}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )
    }
    ```

- [x] Task 3: Modify `ContactoDetailView` to wire the reassign flow (AC: 1, 2, 3, 4)
  - [x] 3.1 In `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx`:
    - Add import: `import { ReasignarClienteDialog } from './ReasignarClienteDialog'`
    - Add state: `const [reassignDialogOpen, setReassignDialogOpen] = useState(false)`
    - Add button in header `<div className="flex gap-2">` — only when `contacto.clienteId !== null`:
      ```tsx
      {contacto.clienteId && (
        <Button onClick={() => setReassignDialogOpen(true)}>Reasignar cliente</Button>
      )}
      ```
    - Add `ReasignarClienteDialog` after existing dialogs:
      ```tsx
      {contacto.clienteId && (
        <ReasignarClienteDialog
          contactoId={contactoId}
          currentClienteId={contacto.clienteId}
          open={reassignDialogOpen}
          onOpenChange={setReassignDialogOpen}
        />
      )}
      ```

- [x] Task 4: Unit tests (AC: 1, 2, 3, 4, 5)
  - [x] 4.1 Create `frontend/src/modules/crm/contactos/application/useReassignContactoCliente.test.ts`:
    - Test: "calls assignCliente with correct contactoId and newClienteId"
    - Test: "invalidates contactos, old clienteId, and new clienteId on success"
    - Test: "shows success toast on success"
    - Test: "shows error toast on failure"
  - [x] 4.2 Create `frontend/src/modules/crm/contactos/presentation/ReasignarClienteDialog.test.tsx`:
    - Test: "renders Select with all clients except current one"
    - Test: "Guardar button disabled until client is selected"
    - Test: "calls mutation with correct params on confirm"
    - Test: "closes dialog on successful mutation"
    - Test: "calls onOpenChange(false) when Cancelar is clicked"
    - Test: "resets selection when dialog closes"
  - [x] 4.3 Extend `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx`:
    - Test: "shows 'Reasignar cliente' button when contact has clienteId"
    - Test: "does not show 'Reasignar cliente' button when contact has no clienteId"
    - Test: "opens ReasignarClienteDialog when button is clicked"

## Dev Notes

### Architecture Pattern

- **Story scope**: Frontend only — `PUT /api/v1/contactos/{id}/cliente` already exists (implemented in story 4.2). Zero backend changes required.
- `useAssignContactoCliente` (existing) handles assign/disassociate but only invalidates the OLD client's query key. Story 4.6 needs a new hook that **also** invalidates the NEW client's query key.
- Do NOT modify `useAssignContactoCliente` — it is used by `AssociatedContactsSection` and `ClienteContactServiceAdapter`. A separate hook prevents regression.
- `contactoRepository.assignCliente(id, clienteId)` already calls `PUT /api/v1/contactos/{id}/cliente` — reuse it directly.

### Query Invalidation — Critical Detail

Per epic AC and architecture spec:
```typescript
// MUST invalidate all 3 keys:
queryClient.invalidateQueries({ queryKey: ['contactos'] })                            // global list
queryClient.invalidateQueries({ queryKey: ['contactos', { clienteId: oldClienteId }] }) // old client's panel
queryClient.invalidateQueries({ queryKey: ['contactos', { clienteId: newClienteId }] }) // new client's panel
// Note: ['contactos', contactoId] single-contact cache is automatically refreshed
// because ['contactos'] invalidation triggers refetch of all contactos queries
```

### siesa-ui-kit `Select` Usage

```typescript
import { Select } from 'siesa-ui-kit'
import type { SelectOption } from 'siesa-ui-kit'

const options: SelectOption[] = clientes
  .filter((c) => c.id !== currentClienteId)
  .map((c) => ({ value: c.id, label: c.nombre }))

<Select
  options={options}
  value={selectedClienteId}
  onChange={(val) => setSelectedClienteId(String(val))}
  placeholder="Seleccionar cliente..."
  disabled={isClientesLoading || isPending}
  fullWidth
  ariaLabel="Seleccionar cliente destino"
/>
```

### ⚠️ Do NOT Change

- `useAssignContactoCliente` — used by `AssociatedContactsSection` and `ContactManager` flow
- `contactoRepository.assignCliente` — reuse as-is, no modifications
- `useClientes` hook — reuse as-is
- The "Editar", "Eliminar", "Volver" buttons — keep existing layout

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` v1.0.77 (already installed)
- **Usage**: All UI elements MUST use `siesa-ui-kit` components.
- **Constraint**: Do not replace siesa-ui-kit `Button` or `Select` with native HTML equivalents.
- **Components used**:
  - `Button` (already imported in ContactoDetailView)
  - `Select` + `SelectOption` — new import from siesa-ui-kit for the client picker
- **Dialog**: Use `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle` from `@/components/ui/dialog` (shadcn/ui) — already used in ContactoDetailView, consistent pattern.

### Testing Requirements

- **Framework**: Vitest + React Testing Library
- **Pattern**: `vi.mock` + `vi.mocked` — match existing test patterns in ContactoDetailView.test.tsx
- **Mock `siesa-ui-kit`**: Add `Select` to the existing mock in test files:
  ```typescript
  Select: ({
    options,
    value,
    onChange,
    disabled,
    placeholder,
  }: {
    options: { value: string; label: string }[]
    value?: string
    onChange?: (val: string) => void
    disabled?: boolean
    placeholder?: string
  }) => (
    <select
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      aria-label="Seleccionar cliente destino"
    >
      <option value="">{placeholder ?? 'Seleccionar...'}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
  ```
- **Mock `useClientes`**: Use `vi.mock('@/modules/crm/clientes/application/useClientes')` + `vi.mocked(useClientesModule.useClientes).mockReturnValue(...)` in `ReasignarClienteDialog.test.tsx`
- **Mock `useReassignContactoCliente`**: Use `vi.mock('../application/useReassignContactoCliente')` in dialog test
- **Do NOT** use MSW — all logic is pure client-side state + mocked mutations

### Project Structure Notes

**Frontend — New files:**
```
frontend/src/modules/crm/contactos/application/useReassignContactoCliente.ts     ← new mutation hook
frontend/src/modules/crm/contactos/application/useReassignContactoCliente.test.ts ← hook tests
frontend/src/modules/crm/contactos/presentation/ReasignarClienteDialog.tsx        ← new dialog component
frontend/src/modules/crm/contactos/presentation/ReasignarClienteDialog.test.tsx   ← dialog tests
```

**Frontend — Modified files:**
```
frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx            ← add button + dialog
frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx       ← add 3 new tests
```

**No backend files touched.**

### References

- Epic 4 Story 4.6 AC: `_bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md` — lines 124–146
- FR26 (reassign contact): `_bmad-output/planning-artifacts/archive/prd.md`
- FR27 (immediate visibility): Architecture doc — "REST API + TanStack Query invalidateQueries"
- `contactoRepository.assignCliente`: `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts`
- `useAssignContactoCliente` (reference pattern): `frontend/src/modules/crm/contactos/application/useAssignContactoCliente.ts`
- `useClientes` hook: `frontend/src/modules/crm/clientes/application/useClientes.ts`
- `AssociarContactoDialog` (similar UI pattern): `frontend/src/modules/crm/clientes/presentation/AssociarContactoDialog.tsx`
- siesa-ui-kit `Select` types: `frontend/node_modules/siesa-ui-kit/dist/components/Select/Select.types.d.ts`
- TanStack Query key canonical list: `_bmad-output/planning-artifacts/architecture.md` — State Boundaries section
- `Dialog`/`DialogContent` pattern: `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx` lines 105–141

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Task 1: Created `useReassignContactoCliente` hook. Calls `contactoRepository.assignCliente(contactoId, newClienteId)`. On success invalidates 3 query keys: `['contactos']`, `['contactos', { clienteId: oldClienteId }]`, `['contactos', { clienteId: newClienteId }]`. Toast: "Contacto reasignado correctamente". Separate from `useAssignContactoCliente` to avoid regression in existing flows.
- Task 2: Created `ReasignarClienteDialog` using siesa-ui-kit `Select` + `Button`, wrapped in shadcn `Dialog`. Options = all clients except current one. `handleClose` resets `selectedClienteId` state. `handleConfirm` calls `mutate(...)` with `onSuccess: handleClose` in mutation options. Select disabled during loading or pending.
- Task 3: Modified `ContactoDetailView` — added `reassignDialogOpen` state, "Reasignar cliente" button (only when `contacto.clienteId !== null`), and `ReasignarClienteDialog` component after delete dialog.
- Task 4: Created 4 hook tests (PUT call, 3 invalidations, success toast, error toast), 7 dialog tests (options exclusion, disabled states, mutation params, cancel), 3 ContactoDetailView tests (button visible, not visible, opens dialog). 88/88 tests pass.

### File List

- `frontend/src/modules/crm/contactos/application/useReassignContactoCliente.ts` — new: mutation hook with 3 query key invalidations
- `frontend/src/modules/crm/contactos/application/useReassignContactoCliente.test.ts` — new: 4 tests
- `frontend/src/modules/crm/contactos/presentation/ReasignarClienteDialog.tsx` — new: siesa-ui-kit Select dialog
- `frontend/src/modules/crm/contactos/presentation/ReasignarClienteDialog.test.tsx` — new: 9 tests (2 added by code-review: "closes dialog on successful mutation", "resets selection when dialog closes")
- `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.tsx` — modified: reassign button + dialog
- `frontend/src/modules/crm/contactos/presentation/ContactoDetailView.test.tsx` — modified: mock + 3 new tests
