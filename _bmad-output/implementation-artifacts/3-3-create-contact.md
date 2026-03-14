---
stepsCompleted: []
status: ready-for-dev
epic: 3
story: 3
storyKey: 3-3-create-contact
createdAt: '2026-03-14'
---

# Story 3.3: Create Contact

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to register a new contact by filling in a form,
So that the contact is available in the system immediately for the whole team.

## Acceptance Criteria

1. **AC1 — "Nuevo contacto" Button**: A "Nuevo contacto" button is visible on the `/contactos` view (in `ContactoListView`). Clicking it opens a modal dialog with a form. The button is visible at all times (not only when the list is empty).

2. **AC2 — Form Fields**: The dialog form contains four fields: **Nombre**, **Cargo**, **Teléfono**, **Email** — all required. Each field uses the `Input` component from `siesa-ui-kit` with the `label` prop set. (FR9)

3. **AC3 — Client-side Validation**: When the user submits the form with one or more empty fields, inline error messages appear directly below each empty field (via `Input` `error` + `errorMessage` props). The form is NOT submitted to the backend. (FR16, NFR5)

4. **AC4 — Successful Creation**: When the user fills all fields and submits, the contact is created via `POST /api/v1/contactos`, the dialog closes, the contact list refreshes immediately showing the new contact, and a success toast "Contacto creado correctamente" appears. (FR27)

5. **AC5 — Backend Validation Error**: When the backend returns a 422/400 error (e.g., validation failure), the error `detail` from the Problem Details response is displayed in the form in Spanish without exposing technical details. (NFR6)

6. **AC6 — Cancel**: A "Cancelar" button closes the dialog without submitting. The contact list is unchanged.

7. **AC7 — Loading State**: While the form is submitting, the "Guardar" button shows a disabled/loading state to prevent double submission.

8. **AC8 — Backend: POST /api/v1/contactos**: The endpoint accepts `CreateContactoRequest` (Nombre, Cargo, Teléfono, Email), creates the `ContactoEntity`, and returns `201 Created` with the full `ContactoDto`. Follows Problem Details RFC 7807 on validation errors. Uses FluentValidation for all field constraints. (FR9)

## Tasks / Subtasks

### Backend

- [ ] Task 1: Extend Domain + Infrastructure Layers (AC: 8)
  - [ ] 1.1 Add `CreateAsync(ContactoEntity entity, CancellationToken ct = default): Task<ContactoEntity>` to `backend/src/SiesaAgents.Domain/Contactos/Interfaces/IContactoRepository.cs`
  - [ ] 1.2 Implement `CreateAsync` in `backend/src/SiesaAgents.Infrastructure/Repositories/ContactoRepository.cs` — `context.Contactos.Add(entity); await context.SaveChangesAsync(ct); return entity;`

- [ ] Task 2: Create Application Layer (AC: 8)
  - [ ] 2.1 Create `backend/src/SiesaAgents.Application/Contactos/DTOs/CreateContactoRequest.cs` — record with `string Nombre, string Cargo, string Telefono, string Email`
  - [ ] 2.2 Create `backend/src/SiesaAgents.Application/Contactos/Commands/CreateContactoCommand.cs` — record with `string Nombre, string Cargo, string Telefono, string Email`
  - [ ] 2.3 Create `backend/src/SiesaAgents.Application/Contactos/Commands/CreateContactoCommandHandler.cs` — maps command → `ContactoEntity` → calls `repository.CreateAsync` → returns `ContactoDto`
  - [ ] 2.4 Create `backend/src/SiesaAgents.Application/Contactos/Validators/CreateContactoRequestValidator.cs` — FluentValidation: all fields `NotEmpty()`, Email `EmailAddress()`, Nombre/Cargo/Telefono `MaximumLength(200)`, Email `MaximumLength(254)`

- [ ] Task 3: Extend API Layer (AC: 8)
  - [ ] 3.1 Add `POST /contactos` to `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs` inside `MapContactoEndpoints` — validates request, calls handler, returns `Results.Created(..., dto)`
  - [ ] 3.2 Register `CreateContactoCommandHandler` + `IValidator<CreateContactoRequest>` as scoped in `backend/src/SiesaAgents.API/Program.cs`

- [ ] Task 4: Backend Tests (AC: 8)
  - [ ] 4.1 Create `backend/tests/SiesaAgents.UnitTests/Application/Contactos/CreateContactoCommandHandlerTests.cs` — NSubstitute: creates entity, returns mapped DTO, maps all fields
  - [ ] 4.2 Add integration tests to `backend/tests/SiesaAgents.IntegrationTests/Contactos/ContactoEndpointsTests.cs` — `CreateContacto_WithValidData_Returns201WithShape` + `CreateContacto_WithEmptyNombre_Returns422`
  - [ ] 4.3 `dotnet build` — 0 errors ✅
  - [ ] 4.4 `dotnet test` — all passed ✅

### Frontend

- [ ] Task 5: Create Application Layer — Schema + Mutation Hook (AC: 3, 4, 5)
  - [ ] 5.1 Create `frontend/src/modules/crm/contactos/application/contactoSchema.ts` — Zod v4 schema for `CreateContactoFormValues` (Nombre, Cargo, Teléfono, Email — all required strings)
  - [ ] 5.2 Add `create(data: CreateContactoRequest): Promise<Contacto>` to `frontend/src/modules/crm/contactos/domain/IContactoRepository.ts`
  - [ ] 5.3 Add `create` implementation to `frontend/src/modules/crm/contactos/infrastructure/contactoApiRepository.ts` — POST `/contactos`, returns `response.data`
  - [ ] 5.4 Create `frontend/src/modules/crm/contactos/application/useCreateContacto.ts` — `useMutation` that calls `contactoRepository.create`, invalidates `['contactos']` on success, calls `toast.success('Contacto creado correctamente')` on success, `toast.error('No se pudo guardar. Intenta de nuevo.')` on error

- [ ] Task 6: Create Presentation Layer — ContactoForm + Dialog (AC: 1, 2, 3, 4, 5, 6, 7)
  - [ ] 6.1 Create `frontend/src/modules/crm/contactos/presentation/ContactoForm.tsx` — React Hook Form + zodResolver + 4 `Input` fields + "Guardar"/"Cancelar" buttons + backend error display
  - [ ] 6.2 Update `frontend/src/modules/crm/contactos/presentation/ContactoListView.tsx` — add "Nuevo contacto" `Button` + `Dialog` state + render `<ContactoForm>` inside `<DialogContent>`

- [ ] Task 7: Mount ToastManager globally (AC: 4)
  - [ ] 7.1 Update `frontend/src/main.tsx` — import `ToastManager` from `siesa-ui-kit/dist/components/Toast/ToastManager` and render `<ToastManager />` alongside `<RouterProvider />`

- [ ] Task 8: Frontend Tests (AC: 1, 2, 3, 4, 5, 6, 7)
  - [ ] 8.1 Create `frontend/src/modules/crm/contactos/application/useCreateContacto.test.ts` — MSW: POST returns 201 → mutation succeeds; POST returns 422 → mutation errors
  - [ ] 8.2 Update `frontend/src/modules/crm/contactos/presentation/ContactoListView.test.tsx` — add: "Nuevo contacto" button is visible; clicking opens dialog; form shows 4 fields; Cancelar closes dialog
  - [ ] 8.3 Create `frontend/src/modules/crm/contactos/presentation/ContactoForm.test.tsx` — submitting empty form shows validation errors; submitting valid form calls mutation; loading state disables submit button
  - [ ] 8.4 `npm run build` — 0 TypeScript errors ✅
  - [ ] 8.5 `npm test` — all passed ✅

## Dev Notes

### ⚠️ Prerequisites

- Story 3.2 (`done`) — `contactoRepository` (class instance), `ContactoApiRepository`, `IContactoRepository` (with `getAll`, `getById`), `ContactoEntity`, `ContactoDto`, `useContactos`, all exist.
- `src/components/ui/dialog.tsx` — already installed (uses `@base-ui/react` v1.3.0). Import from `@/components/ui/dialog`.
- `ToastManager` is NOT yet mounted in the app — Task 7 adds it to `main.tsx`.

---

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` v1.0.77 (already installed)
- **Import styles**: `import 'siesa-ui-kit/styles.css'` — already in `main.tsx`, do NOT add again
- **Components required for this story**:
  - `Input` — **PRIMARY form field component**. Use `label`, `error: boolean`, `errorMessage: string`, `fullWidth` props.
  - `Button` — for "Nuevo contacto" trigger, "Guardar" (submit), "Cancelar". Use `type="outline-solid"` for secondary actions.
- **Constraint**: Do NOT create custom input components. Use `Input` from siesa-ui-kit natively.

---

### `Input` Component Pattern (siesa-ui-kit v1.0.77)

```typescript
import { Input, Button } from 'siesa-ui-kit'

// Correct usage with React Hook Form
<Input
  label="Nombre"
  fullWidth
  error={!!errors.nombre}
  errorMessage={errors.nombre?.message}
  {...register('nombre')}
/>
```

> ⚠️ `Input` extends `InputHTMLAttributes<HTMLInputElement>` — spread `register(...)` directly. `error` is `boolean`, `errorMessage` is `string`.

---

### Zod v4 Schema Pattern (MANDATORY — project uses Zod v4.3.6)

```typescript
// frontend/src/modules/crm/contactos/application/contactoSchema.ts
import { z } from 'zod'

export const createContactoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  cargo: z.string().min(1, 'El cargo es requerido'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
})

export type CreateContactoFormValues = z.infer<typeof createContactoSchema>
```

> ⚠️ **Zod v4** (not v3): shorthand string messages (`z.string().min(1, "message")`) work directly. `@hookform/resolvers` v5 is required for Zod v4 compatibility.

---

### `ContactoForm` Component Pattern

```typescript
// frontend/src/modules/crm/contactos/presentation/ContactoForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, Button } from 'siesa-ui-kit'
import { createContactoSchema, type CreateContactoFormValues } from '../application/contactoSchema'
import { useCreateContacto } from '../application/useCreateContacto'

interface ContactoFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function ContactoForm({ onSuccess, onCancel }: ContactoFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<CreateContactoFormValues>({
    resolver: zodResolver(createContactoSchema),
  })

  const createMutation = useCreateContacto()

  const onSubmit = async (data: CreateContactoFormValues) => {
    try {
      await createMutation.mutateAsync(data)
      onSuccess()
    } catch (error) {
      // Show backend error detail on form
      const detail = axios.isAxiosError(error)
        ? (error.response?.data as { detail?: string })?.detail
        : undefined
      setError('root', {
        message: detail ?? 'No se pudo guardar. Intenta de nuevo.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Nombre" fullWidth error={!!errors.nombre} errorMessage={errors.nombre?.message} {...register('nombre')} />
      <Input label="Cargo" fullWidth error={!!errors.cargo} errorMessage={errors.cargo?.message} {...register('cargo')} />
      <Input label="Teléfono" fullWidth error={!!errors.telefono} errorMessage={errors.telefono?.message} {...register('telefono')} />
      <Input label="Email" type="email" fullWidth error={!!errors.email} errorMessage={errors.email?.message} {...register('email')} />

      {errors.root && (
        <p className="text-sm text-red-600">{errors.root.message}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="outline-solid" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
```

> ⚠️ `Button type` prop is the **visual style** (e.g. `"outline-solid"`), NOT the HTML `type` attribute. For submit, do NOT set `type="submit"` on `Button` — the form's `onSubmit` handles it. For "Cancelar" use `onClick` + `type="outline-solid"`.

---

### `useCreateContacto` Hook Pattern

```typescript
// frontend/src/modules/crm/contactos/application/useCreateContacto.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'siesa-ui-kit/dist/components/Toast/toastApi'
import { contactoRepository } from '../infrastructure/contactoApiRepository'
import type { CreateContactoFormValues } from './contactoSchema'

export function useCreateContacto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContactoFormValues) => contactoRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactos'] })
      toast.success('Contacto creado correctamente')
    },
  })
}
```

> ⚠️ `toast` is imported from the sub-path `siesa-ui-kit/dist/components/Toast/toastApi` — it is NOT exported from the main `siesa-ui-kit` index. Do NOT use `toast.error` in `onError` — let the caller (`ContactoForm`) handle the error display since it needs `setError('root', ...)`.

---

### `IContactoRepository` + `contactoApiRepository` Extension

```typescript
// IContactoRepository.ts — add create method
export interface IContactoRepository {
  getAll(): Promise<Contacto[]>
  getById(id: string): Promise<Contacto>
  create(data: { nombre: string; cargo: string; telefono: string; email: string }): Promise<Contacto>
}

// contactoApiRepository.ts — add create implementation
async create(data: { nombre: string; cargo: string; telefono: string; email: string }): Promise<Contacto> {
  const response = await apiClient.post<Contacto>('/contactos', data)
  return response.data
}
```

---

### Dialog Integration in `ContactoListView`

```typescript
// ContactoListView.tsx — add button + dialog
import { useState } from 'react'
import { Button } from 'siesa-ui-kit'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ContactoForm } from './ContactoForm'

// Inside ContactoListView:
const [open, setOpen] = useState(false)

// Add above ListView:
<div className="flex justify-end mb-4">
  <Button onClick={() => setOpen(true)}>Nuevo contacto</Button>
</div>

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Nuevo contacto</DialogTitle>
    </DialogHeader>
    <ContactoForm
      onSuccess={() => setOpen(false)}
      onCancel={() => setOpen(false)}
    />
  </DialogContent>
</Dialog>
```

> ⚠️ `Dialog` from `@base-ui/react` uses `open` + `onOpenChange` props (same pattern as Radix UI). `DialogContent` includes the overlay and close button automatically.

---

### ToastManager Setup (one-time, in `main.tsx`)

```typescript
// main.tsx — add ToastManager ONCE globally
import { ToastManager } from 'siesa-ui-kit/dist/components/Toast/ToastManager'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastManager />   {/* ← add this */}
    </QueryClientProvider>
  </StrictMode>,
)
```

> ⚠️ `ToastManager` is NOT exported from the main `siesa-ui-kit` index — use the sub-path import. Mount it ONCE at the app root. It renders a portal that listens to the global toast event bus.

---

### Backend — `CreateContactoRequest` + Validator Pattern

```csharp
// CreateContactoRequest.cs
namespace SiesaAgents.Application.Contactos.DTOs;
public record CreateContactoRequest(
    string Nombre,
    string Cargo,
    string Telefono,
    string Email);

// CreateContactoRequestValidator.cs
using FluentValidation;
namespace SiesaAgents.Application.Contactos.Validators;
public class CreateContactoRequestValidator : AbstractValidator<CreateContactoRequest>
{
    public CreateContactoRequestValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Cargo).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Telefono).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(254);
    }
}
```

---

### Backend — `POST /contactos` Endpoint Pattern

```csharp
// ContactoEndpoints.cs — add inside MapContactoEndpoints()
group.MapPost("/contactos", async (
    CreateContactoRequest request,
    IValidator<CreateContactoRequest> validator,
    CreateContactoCommandHandler handler,
    CancellationToken ct) =>
{
    var validation = await validator.ValidateAsync(request, ct);
    if (!validation.IsValid)
    {
        var errors = validation.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
        return Results.Problem(
            statusCode: StatusCodes.Status422UnprocessableEntity,
            title: "Validation failed",
            extensions: new Dictionary<string, object?> { ["errors"] = errors });
    }

    var result = await handler.HandleAsync(
        new CreateContactoCommand(request.Nombre, request.Cargo, request.Telefono, request.Email), ct);

    return Results.Created($"/api/v1/contactos/{result.Id}", result);
})
.WithName("CreateContacto")
.WithSummary("Crea un nuevo contacto")
.Produces<ContactoDto>(StatusCodes.Status201Created)
.ProducesProblem(StatusCodes.Status422UnprocessableEntity);
```

---

### Backend — `CreateContactoCommandHandler` Pattern

```csharp
// CreateContactoCommandHandler.cs
using SiesaAgents.Application.Contactos.DTOs;
using SiesaAgents.Domain.Contactos.Entities;
using SiesaAgents.Domain.Contactos.Interfaces;

namespace SiesaAgents.Application.Contactos.Commands;

public class CreateContactoCommandHandler(IContactoRepository repository)
{
    public async Task<ContactoDto> HandleAsync(
        CreateContactoCommand command, CancellationToken ct = default)
    {
        var entity = new ContactoEntity
        {
            Nombre = command.Nombre,
            Cargo = command.Cargo,
            Telefono = command.Telefono,
            Email = command.Email,
            ClienteId = null,
        };
        var created = await repository.CreateAsync(entity, ct);
        return new ContactoDto(
            created.Id, created.Nombre, created.Cargo, created.Telefono,
            created.Email, created.ClienteId, created.CreatedAt, created.UpdatedAt);
    }
}
```

---

### Integration Test Pattern (Testcontainers — MANDATORY)

```csharp
// ADD to ContactoEndpointsTests.cs (existing class)

[Fact]
public async Task CreateContacto_WithValidData_Returns201WithShape()
{
    await using var factory = CreateFactory();
    await MigrateAsync(factory);
    var client = factory.CreateClient();

    var request = new { Nombre = "Ana García", Cargo = "Analista", Telefono = "3001234567", Email = "ana@test.com" };
    var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

    var response = await client.PostAsync("/api/v1/contactos", content);

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    var json = await response.Content.ReadAsStringAsync();
    var contacto = JsonSerializer.Deserialize<ContactoDto>(json, JsonOptions);
    Assert.NotNull(contacto);
    Assert.Equal("Ana García", contacto.Nombre);
    Assert.NotEqual(Guid.Empty, contacto.Id);
    Assert.NotEqual(default, contacto.CreatedAt);
}

[Fact]
public async Task CreateContacto_WithEmptyNombre_Returns422()
{
    await using var factory = CreateFactory();
    await MigrateAsync(factory);
    var client = factory.CreateClient();

    var request = new { Nombre = "", Cargo = "Analista", Telefono = "3001234567", Email = "ana@test.com" };
    var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

    var response = await client.PostAsync("/api/v1/contactos", content);

    Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
}
```

---

### MSW Test Pattern for `useCreateContacto`

```typescript
// useCreateContacto.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useCreateContacto } from './useCreateContacto'

const BASE = 'http://localhost:5000/api/v1'

function createWrapper() {
  const queryClient = new QueryClient()
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const validData = {
  nombre: 'Ana García',
  cargo: 'Analista',
  telefono: '3001234567',
  email: 'ana@test.com',
}

describe('useCreateContacto', () => {
  it('returns created contacto on 201', async () => {
    server.use(
      http.post(`${BASE}/contactos`, () =>
        HttpResponse.json({ id: 'new-id', ...validData, clienteId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, { status: 201 })
      )
    )
    const { result } = renderHook(() => useCreateContacto(), { wrapper: createWrapper() })
    await act(async () => { result.current.mutate(validData) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('sets isError true on 422', async () => {
    server.use(
      http.post(`${BASE}/contactos`, () =>
        HttpResponse.json({ title: 'Validation failed' }, { status: 422 })
      )
    )
    const { result } = renderHook(() => useCreateContacto(), { wrapper: createWrapper() })
    await act(async () => { result.current.mutate(validData) })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
```

---

### Architecture Constraints (Non-Negotiable)

- **`DateTimeOffset`** everywhere in C# — NEVER `DateTime`
- **`Guid`** PKs — NEVER `int`
- **`['contactos']`** invalidation key after create — array, never string
- **Spanish UI text** — "Nuevo contacto", "Guardar", "Cancelar", "Contacto creado correctamente", "El nombre es requerido", etc.
- **No Swagger** — Scalar already configured
- **`POST` → `201 Created`** + `ContactoDto` in body (architecture format pattern)
- **`ClienteId = null`** on new contacts — contacts start unassociated
- **`Input.error` is `boolean`** — pass `!!errors.field`, not the error object
- **Zod v4** — use `z.string().min(1, "message")` shorthand (not `{ message: "..." }`)
- **`Button type` prop = visual style** — NOT HTML button type; for submit, rely on `form onSubmit`
- **`ToastManager` sub-path** — `siesa-ui-kit/dist/components/Toast/ToastManager` (NOT main index)

---

### Project Structure Notes

**Files to create/modify:**

```
backend/
├── src/
│   ├── SiesaAgents.Application/
│   │   └── Contactos/
│   │       ├── Commands/
│   │       │   ├── CreateContactoCommand.cs          ← NEW
│   │       │   └── CreateContactoCommandHandler.cs   ← NEW
│   │       ├── DTOs/
│   │       │   └── CreateContactoRequest.cs           ← NEW
│   │       └── Validators/
│   │           └── CreateContactoRequestValidator.cs  ← NEW
│   └── SiesaAgents.API/
│       ├── Endpoints/
│       │   └── ContactoEndpoints.cs                   ← MODIFY: add POST /contactos
│       └── Program.cs                                 ← MODIFY: register handler + validator
└── tests/
    ├── SiesaAgents.UnitTests/
    │   └── Application/
    │       └── Contactos/
    │           └── CreateContactoCommandHandlerTests.cs ← NEW
    └── SiesaAgents.IntegrationTests/
        └── Contactos/
            └── ContactoEndpointsTests.cs              ← MODIFY: add 201+422 tests

frontend/
├── src/
│   ├── main.tsx                                       ← MODIFY: add ToastManager
│   └── modules/crm/contactos/
│       ├── domain/
│       │   └── IContactoRepository.ts                 ← MODIFY: add create method
│       ├── application/
│       │   ├── contactoSchema.ts                      ← NEW
│       │   ├── useCreateContacto.ts                   ← NEW
│       │   └── useCreateContacto.test.ts              ← NEW
│       ├── infrastructure/
│       │   └── contactoApiRepository.ts               ← MODIFY: add create method
│       └── presentation/
│           ├── ContactoForm.tsx                       ← NEW
│           ├── ContactoForm.test.tsx                  ← NEW
│           └── ContactoListView.tsx                   ← MODIFY: add button + dialog
```

---

### References

- Epic 3 story 3.3: `_bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md#Story 3.3`
- Architecture — mutation pattern: `_bmad-output/planning-artifacts/architecture.md#Process Patterns`
- Architecture — API format (POST → 201): `_bmad-output/planning-artifacts/architecture.md#Format Patterns`
- Architecture — validation (FluentValidation + Zod): `_bmad-output/planning-artifacts/architecture.md#Cross-Cutting Concerns`
- Story 3.2 patterns (contactoRepository class, getHttpStatus, useContacto): `_bmad-output/implementation-artifacts/3-2-contact-detail-view.md`
- siesa-ui-kit Input: `frontend/node_modules/siesa-ui-kit/dist/components/Input/Input.types.d.ts`
- siesa-ui-kit Toast API: `frontend/node_modules/siesa-ui-kit/dist/components/Toast/toastApi.d.ts`
- siesa-ui-kit ToastManager: `frontend/node_modules/siesa-ui-kit/dist/components/Toast/ToastManager.d.ts`
- Dialog component: `frontend/src/components/ui/dialog.tsx`

### Latest Verified Versions (March 2026)

| Library | Version | Notes |
|---|---|---|
| siesa-ui-kit | **1.0.77** | `Input`, `Button`, `Toast` from main index; `ToastManager`, `toast` via sub-path |
| react-hook-form | **7.71.2** | `useForm`, `register`, `handleSubmit`, `formState`, `setError` |
| zod | **4.3.6** | **v4** — shorthand messages; `@hookform/resolvers` v5 required |
| @hookform/resolvers | **5.2.2** | `zodResolver` from `@hookform/resolvers/zod` |
| @tanstack/react-query | **5.90.21** | `useMutation`, `useQueryClient`, `invalidateQueries` |
| @base-ui/react | **1.3.0** | Powers `Dialog` — `open` + `onOpenChange` props |
| FluentValidation | **12.1.1** | `NotEmpty()`, `EmailAddress()`, `MaximumLength()` |
| NSubstitute | **5.3.0** | Mock for unit tests |

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
