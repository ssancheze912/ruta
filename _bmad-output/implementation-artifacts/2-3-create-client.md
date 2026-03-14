---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
status: done
epic: 2
story: 3
storyKey: 2-3-create-client
createdAt: '2026-03-14'
---

# Story 2.3: Create Client

Status: in-review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to register a new client by filling in a form,
so that the client is available in the system immediately for the whole team.

## Acceptance Criteria

1. **AC1 — "Nuevo cliente" button opens form**: When the user is on `/clientes` and clicks the "Nuevo cliente" button, a modal dialog opens with a form containing four required fields: Nombre, NIT/RUC, Teléfono, Ciudad. (FR1)

2. **AC2 — Success creates client and updates list**: When the user fills all required fields and submits the form, the client is created, the dialog closes, the client list updates immediately with the new entry (FR27), and a success toast shows "Cliente creado correctamente".

3. **AC3 — Client-side validation shows inline errors**: When the user submits the form with one or more required fields empty, clear inline error messages appear below the empty fields (FR8) and the form is NOT submitted to the backend.

4. **AC4 — Backend 409 for duplicate NIT/RUC**: When the user submits a NIT/RUC that already exists in the system, the backend returns 409 Conflict and the form shows the error "El NIT/RUC ya está registrado" without exposing technical details (NFR6). The dialog remains open.

## Tasks / Subtasks

### Backend

- [x] Task 1: Extend Domain Layer (AC: 2, 4)
  - [x] 1.1 Add `Task<ClienteEntity?> FindByNitAsync(string nit, CancellationToken ct = default)` to `backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs`
  - [x] 1.2 Add `Task CreateAsync(ClienteEntity entity, CancellationToken ct = default)` to `backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs`

- [x] Task 2: Extend Infrastructure Layer (AC: 2, 4)
  - [x] 2.1 Implement `FindByNitAsync` in `backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs` — use `AsNoTracking()`, match on `c.Nit == nit` (case-sensitive)
  - [x] 2.2 Implement `CreateAsync` in `backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs` — `context.Clientes.Add(entity); await context.SaveChangesAsync(ct);`

- [x] Task 3: Create Application Layer (AC: 2, 3, 4)
  - [x] 3.1 Create `backend/src/SiesaAgents.Application/Clientes/Commands/CreateClienteCommand.cs` — record with `string Nombre`, `string Nit`, `string Telefono`, `string Ciudad`
  - [x] 3.2 Create `backend/src/SiesaAgents.Application/Clientes/Commands/CreateClienteCommandValidator.cs` — FluentValidation `AbstractValidator<CreateClienteCommand>` with `NotEmpty()` on all 4 fields
  - [x] 3.3 Create `backend/src/SiesaAgents.Application/Clientes/Commands/CreateClienteCommandHandler.cs` — checks `FindByNitAsync` → returns `null` on duplicate; creates `ClienteEntity`, calls `CreateAsync`, returns `ClienteDto`

- [x] Task 4: Extend API Layer (AC: 2, 3, 4)
  - [x] 4.1 Add `POST /` to `backend/src/SiesaAgents.API/Endpoints/ClienteEndpoints.cs` inside `MapClienteEndpoints` — injects `IValidator<CreateClienteCommand>`, `CreateClienteCommandHandler`; validates first (→ 422), checks handler result (null → 409), returns `Results.Created($"/api/v1/clientes/{result.Id}", result)` on success
  - [x] 4.2 Register in `backend/src/SiesaAgents.API/Program.cs`: manual `AddScoped<IValidator<CreateClienteCommand>, CreateClienteCommandValidator>()` + `builder.Services.AddScoped<CreateClienteCommandHandler>()` (see Completion Notes)

- [x] Task 5: Backend Tests (AC: 2, 3, 4)
  - [x] 5.1 Create `backend/tests/SiesaAgents.UnitTests/Application/Clientes/CreateClienteCommandHandlerTests.cs` — 3 tests: success (returns ClienteDto with correct fields), duplicate NIT (returns null), verify `CreateAsync` NOT called when NIT exists
  - [x] 5.2 Add integration tests to `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs` (ADD to existing class — DO NOT re-declare `IAsyncLifetime`/`_postgres`):
    - `PostCliente_WithValidData_Returns201WithLocation`
    - `PostCliente_WithDuplicateNit_Returns409WithProblemDetails`
  - [x] 5.3 `dotnet build` — 0 errors ✅
  - [x] 5.4 `dotnet test` — 20 unit tests passed ✅ (integration tests require Docker — skipped in this environment)

### Frontend

- [x] Task 6: Extend Domain + Infrastructure Layers (AC: 2)
  - [x] 6.1 Add `create(data: CreateClienteDto): Promise<Cliente>` to `frontend/src/modules/crm/clientes/domain/IClienteRepository.ts`; add `CreateClienteDto` interface: `{ nombre: string; nit: string; telefono: string; ciudad: string }`
  - [x] 6.2 Implement `create` in `frontend/src/modules/crm/clientes/infrastructure/clienteApiRepository.ts` — `POST /api/v1/clientes`, returns `response.data` typed as `Cliente`

- [x] Task 7: Create Application Layer — useCreateCliente hook (AC: 2, 4)
  - [x] 7.1 Create `frontend/src/modules/crm/clientes/application/useCreateCliente.ts` — `useMutation({ mutationFn: clienteApiRepository.create, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }) })`

- [x] Task 8: Create Presentation Layer — ClienteFormDialog (AC: 1, 2, 3, 4)
  - [x] 8.1 Create `frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.tsx` — Dialog (shadcn `@/components/ui/dialog`) + React Hook Form (`useForm` + `zodResolver`) + Zod schema (4 required string fields) + `Input` (siesa-ui-kit) for each field + `Button` (siesa-ui-kit) for submit + 409 server error shown below NIT field
  - [x] 8.2 Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `onSuccess: () => void`
  - [x] 8.3 On mutation success: call `onOpenChange(false)` then `onSuccess()`
  - [x] 8.4 On 409 response: set form error on `nit` field: `setError('nit', { message: 'El NIT/RUC ya está registrado' })`

- [x] Task 9: Update ClienteListView (AC: 1, 2)
  - [x] 9.1 Add `isDialogOpen`, `showSuccessToast` state to `frontend/src/modules/crm/clientes/presentation/ClienteListView.tsx`
  - [x] 9.2 Add "Nuevo cliente" `Button` (siesa-ui-kit) in the header area above the search input (inside the `p-3 border-b` div or in a new header row)
  - [x] 9.3 Render `<ClienteFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={() => setShowSuccessToast(true)} />` (lazy-loaded via `React.lazy`)
  - [x] 9.4 Render success `<Toast>` from siesa-ui-kit when `showSuccessToast` is true — positioned fixed bottom-right; auto-dismiss after 4s via `useEffect`

- [x] Task 10: Frontend Tests (AC: 1, 2, 3, 4)
  - [x] 10.1 Create `frontend/src/modules/crm/clientes/application/useCreateCliente.test.ts` — MSW handlers: success (201 returns ClienteDto), 409 error. Test: mutation success triggers `invalidateQueries`; 409 is surfaced as error
  - [x] 10.2 Create `frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.test.tsx` — mock `useCreateCliente`; test: renders all 4 fields, submit with empty fields shows inline errors (no mutation call), submit with valid data calls mutation, 409 error sets NIT field error "El NIT/RUC ya está registrado"
  - [x] 10.3 `npm run build` — 0 TypeScript errors ✅
  - [x] 10.4 `npm test` — 68/68 passed ✅

## Dev Notes

### ⚠️ Prerequisites

- Story 2.2 (`done`) — `IClienteRepository` (with `GetAllAsync`, `GetByIdAsync`), `ClienteRepository`, `ClienteDto`, `ClienteEndpoints` base, `ClienteListView` (with `selectedId`/`onSelect`), `clienteApiRepository`, MSW server, Testcontainers class — all exist.
- `ClienteListView` currently has no "Nuevo cliente" button or dialog state — add both in Task 9.
- `ClienteEndpointsTests.cs` already implements `IAsyncLifetime`, `_postgres`, `CreateFactory()`, `MigrateAsync()` — ADD new tests to the existing class, DO NOT re-declare.
- FluentValidation 12.1.1 is installed in `SiesaAgents.Application.csproj`.
- shadcn `dialog.tsx` is at `frontend/src/components/ui/dialog.tsx` — uses `@base-ui/react` internals, NOT Radix UI.
- `react-hook-form` v7.71.2 and `@hookform/resolvers` v5.2.2 are installed.
- **Zod v4.3.6** is installed — `z.string().min(1)`, `z.object()`, `z.infer<>` work as in v3.
- `Toast` component is exported from `siesa-ui-kit` main index (line 86 of `dist/index.d.ts`). Import: `import { Toast } from 'siesa-ui-kit'`. Use declaratively with state (see pattern below).

---

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` v1.0.77 (already installed — do NOT run `npm install siesa-ui-kit` again)
- **Import styles**: `import 'siesa-ui-kit/styles.css'` — already in `main.tsx`, do NOT add again
- **Components required**:
  - `Input` — for all 4 form fields. Props: `label`, `error` (boolean), `errorMessage` (string), `fullWidth`. Do NOT use native `<input>`.
  - `Button` — for "Nuevo cliente" trigger and form submit. Pass text as `children`, NOT `label` prop. Use `type="solid"` for primary action (submit), `type="outline-solid"` for secondary (cancel).
  - `Toast` — for success notification. Use **declaratively with state** (see Toast Pattern below). Do NOT attempt to import `toast` (imperative function) — it is NOT in the public bundle.

---

### Backend — Command + Validator + Handler Pattern

```csharp
// backend/src/SiesaAgents.Application/Clientes/Commands/CreateClienteCommand.cs
namespace SiesaAgents.Application.Clientes.Commands;

public record CreateClienteCommand(
    string Nombre,
    string Nit,
    string Telefono,
    string Ciudad
);
```

```csharp
// backend/src/SiesaAgents.Application/Clientes/Commands/CreateClienteCommandValidator.cs
using FluentValidation;

namespace SiesaAgents.Application.Clientes.Commands;

public class CreateClienteCommandValidator : AbstractValidator<CreateClienteCommand>
{
    public CreateClienteCommandValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().WithMessage("Nombre es requerido.").MaximumLength(255);
        RuleFor(x => x.Nit).NotEmpty().WithMessage("NIT/RUC es requerido.").MaximumLength(100);
        RuleFor(x => x.Telefono).NotEmpty().WithMessage("Teléfono es requerido.").MaximumLength(50);
        RuleFor(x => x.Ciudad).NotEmpty().WithMessage("Ciudad es requerida.").MaximumLength(100);
    }
}
```

```csharp
// backend/src/SiesaAgents.Application/Clientes/Commands/CreateClienteCommandHandler.cs
using SiesaAgents.Application.Clientes.DTOs;
using SiesaAgents.Domain.Clientes.Entities;
using SiesaAgents.Domain.Clientes.Interfaces;

namespace SiesaAgents.Application.Clientes.Commands;

public class CreateClienteCommandHandler(IClienteRepository repository)
{
    /// <returns>ClienteDto on success; null if NIT already exists (409).</returns>
    public async Task<ClienteDto?> HandleAsync(
        CreateClienteCommand command, CancellationToken ct = default)
    {
        var existing = await repository.FindByNitAsync(command.Nit, ct);
        if (existing is not null) return null;   // signal duplicate NIT → 409

        var entity = new ClienteEntity
        {
            Nombre   = command.Nombre,
            Nit      = command.Nit,
            Telefono = command.Telefono,
            Ciudad   = command.Ciudad,
        };

        await repository.CreateAsync(entity, ct);

        return new ClienteDto(
            entity.Id, entity.Nombre, entity.Nit,
            entity.Telefono, entity.Ciudad,
            entity.CreatedAt, entity.UpdatedAt);
    }
}
```

---

### Backend — IClienteRepository Extension

```csharp
// backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs
public interface IClienteRepository
{
    Task<IEnumerable<ClienteEntity>> GetAllAsync(CancellationToken ct = default);
    Task<ClienteEntity?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ClienteEntity?> FindByNitAsync(string nit, CancellationToken ct = default);  // ADD
    Task CreateAsync(ClienteEntity entity, CancellationToken ct = default);             // ADD
}
```

---

### Backend — Repository Implementations

```csharp
// FindByNitAsync — add to ClienteRepository.cs
public async Task<ClienteEntity?> FindByNitAsync(string nit, CancellationToken ct = default)
{
    return await context.Clientes
        .AsNoTracking()
        .FirstOrDefaultAsync(c => c.Nit == nit, ct);
}

// CreateAsync — add to ClienteRepository.cs
public async Task CreateAsync(ClienteEntity entity, CancellationToken ct = default)
{
    context.Clientes.Add(entity);
    await context.SaveChangesAsync(ct);
}
```

---

### Backend — POST /api/v1/clientes Endpoint

```csharp
// Add to ClienteEndpoints.cs inside MapClienteEndpoints(this RouteGroupBuilder group)
group.MapPost("/", async (
    CreateClienteCommand command,
    IValidator<CreateClienteCommand> validator,
    CreateClienteCommandHandler handler,
    CancellationToken ct) =>
{
    var validation = await validator.ValidateAsync(command, ct);
    if (!validation.IsValid)
        return Results.ValidationProblem(validation.ToDictionary());

    var result = await handler.HandleAsync(command, ct);
    if (result is null)
        return Results.Problem(
            statusCode: StatusCodes.Status409Conflict,
            title: "Conflict",
            detail: "El NIT/RUC ya está registrado.");

    return Results.Created($"/api/v1/clientes/{result.Id}", result);
})
.WithName("CreateCliente")
.WithSummary("Crea un nuevo cliente")
.Produces<ClienteDto>(StatusCodes.Status201Created)
.Produces<ProblemDetails>(StatusCodes.Status409Conflict)
.ProducesValidationProblem();
```

> ⚠️ `IValidator<T>` requires `using FluentValidation;` at the top of the file.
> ⚠️ `Results.ValidationProblem` returns HTTP 422 with `application/problem+json`.
> ⚠️ `Results.Problem(statusCode: 409)` returns `application/problem+json` — consistent with RFC 7807 (AC4, NFR6).

---

### Backend — Program.cs Registration

```csharp
// Add ONCE (if not already present from a previous story):
builder.Services.AddValidatorsFromAssemblyContaining<CreateClienteCommandValidator>();

// Add scoped handler:
builder.Services.AddScoped<CreateClienteCommandHandler>();
```

> `AddValidatorsFromAssemblyContaining<T>()` is in the `FluentValidation` package (no extra package needed). It scans and registers ALL validators in the assembly — future stories won't need to repeat this line.

---

### Backend — Unit Tests Pattern

```csharp
// backend/tests/SiesaAgents.UnitTests/Application/Clientes/CreateClienteCommandHandlerTests.cs
using FluentValidation;
using NSubstitute;
using SiesaAgents.Application.Clientes.Commands;
using SiesaAgents.Domain.Clientes.Entities;
using SiesaAgents.Domain.Clientes.Interfaces;

namespace SiesaAgents.UnitTests.Application.Clientes;

public class CreateClienteCommandHandlerTests
{
    private readonly IClienteRepository _repository = Substitute.For<IClienteRepository>();
    private readonly CreateClienteCommandHandler _handler;

    public CreateClienteCommandHandlerTests()
    {
        _handler = new CreateClienteCommandHandler(_repository);
    }

    [Fact]
    public async Task HandleAsync_WithValidCommand_ReturnsClienteDto()
    {
        // Arrange
        var command = new CreateClienteCommand("Empresa X", "900-001-1", "3001234567", "Bogotá");
        _repository.FindByNitAsync(command.Nit, Arg.Any<CancellationToken>())
            .Returns((ClienteEntity?)null);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Empresa X", result.Nombre);
        Assert.Equal("900-001-1", result.Nit);
        Assert.NotEqual(Guid.Empty, result.Id);
        await _repository.Received(1).CreateAsync(Arg.Any<ClienteEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleAsync_WithDuplicateNit_ReturnsNull()
    {
        // Arrange
        var command = new CreateClienteCommand("Empresa Y", "900-001-1", "3007654321", "Medellín");
        _repository.FindByNitAsync(command.Nit, Arg.Any<CancellationToken>())
            .Returns(new ClienteEntity { Nombre = "Empresa X", Nit = "900-001-1" });

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task HandleAsync_WithDuplicateNit_DoesNotCallCreateAsync()
    {
        // Arrange
        var command = new CreateClienteCommand("Empresa Z", "900-001-1", "3001230000", "Cali");
        _repository.FindByNitAsync(command.Nit, Arg.Any<CancellationToken>())
            .Returns(new ClienteEntity { Nit = "900-001-1" });

        // Act
        await _handler.HandleAsync(command);

        // Assert
        await _repository.DidNotReceive().CreateAsync(Arg.Any<ClienteEntity>(), Arg.Any<CancellationToken>());
    }
}
```

---

### Backend — Integration Tests Pattern (ADD to existing class)

```csharp
// ADD to backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs
// The class already implements IAsyncLifetime with PostgreSqlContainer — DO NOT re-declare

[Fact]
public async Task PostCliente_WithValidData_Returns201WithLocation()
{
    await using var factory = CreateFactory();
    await MigrateAsync(factory);
    var client = factory.CreateClient();

    var payload = new
    {
        nombre = "Nueva Empresa",
        nit = "901-test-1",
        telefono = "3001234567",
        ciudad = "Bogotá"
    };

    var response = await client.PostAsJsonAsync("/api/v1/clientes", payload);

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    Assert.NotNull(response.Headers.Location);
    var json = await response.Content.ReadAsStringAsync();
    var created = JsonSerializer.Deserialize<ClienteDto>(json, JsonOptions);
    Assert.NotNull(created);
    Assert.Equal("Nueva Empresa", created.Nombre);
    Assert.NotEqual(Guid.Empty, created.Id);
}

[Fact]
public async Task PostCliente_WithDuplicateNit_Returns409WithProblemDetails()
{
    await using var factory = CreateFactory();
    await MigrateAsync(factory);

    using (var scope = factory.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Clientes.Add(new ClienteEntity
        {
            Nombre = "Empresa Existente",
            Nit = "duplicate-nit-001",
        });
        await db.SaveChangesAsync();
    }

    var client = factory.CreateClient();
    var payload = new { nombre = "Otra Empresa", nit = "duplicate-nit-001", telefono = "3000000000", ciudad = "Cali" };

    var response = await client.PostAsJsonAsync("/api/v1/clientes", payload);

    Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
}
```

> ⚠️ `PostAsJsonAsync` requires `using System.Net.Http.Json;` — add at the top of the test file.

---

### Frontend — Domain Interface + DTO

```typescript
// Add to frontend/src/modules/crm/clientes/domain/IClienteRepository.ts
export interface CreateClienteDto {
  nombre: string
  nit: string
  telefono: string
  ciudad: string
}

export interface IClienteRepository {
  getAll(): Promise<Cliente[]>
  getById(id: string): Promise<Cliente>
  create(data: CreateClienteDto): Promise<Cliente>  // ADD
}
```

---

### Frontend — API Repository Implementation

```typescript
// Add to clienteApiRepository.ts
async create(data: CreateClienteDto): Promise<Cliente> {
  const response = await apiClient.post<Cliente>('/clientes', data)
  return response.data
},
```

---

### Frontend — useCreateCliente Hook Pattern

```typescript
// frontend/src/modules/crm/clientes/application/useCreateCliente.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clienteApiRepository } from '../infrastructure/clienteApiRepository'
import type { CreateClienteDto } from '../domain/IClienteRepository'

export function useCreateCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClienteDto) => clienteApiRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    },
  })
}
```

---

### Frontend — Zod Schema + React Hook Form

```typescript
// Inside ClienteFormDialog.tsx
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  nombre:   z.string().min(1, 'Nombre es requerido'),
  nit:      z.string().min(1, 'NIT/RUC es requerido'),
  telefono: z.string().min(1, 'Teléfono es requerido'),
  ciudad:   z.string().min(1, 'Ciudad es requerida'),
})
type FormValues = z.infer<typeof schema>
```

---

### Frontend — ClienteFormDialog Component Pattern

```typescript
// frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input, Button } from 'siesa-ui-kit'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateCliente } from '../application/useCreateCliente'
import { getHttpStatus } from '@/shared/lib/httpError'

const schema = z.object({
  nombre:   z.string().min(1, 'Nombre es requerido'),
  nit:      z.string().min(1, 'NIT/RUC es requerido'),
  telefono: z.string().min(1, 'Teléfono es requerido'),
  ciudad:   z.string().min(1, 'Ciudad es requerida'),
})
type FormValues = z.infer<typeof schema>

interface ClienteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ClienteFormDialog({ open, onOpenChange, onSuccess }: ClienteFormDialogProps) {
  const { mutateAsync, isPending } = useCreateCliente()
  const { register, handleSubmit, setError, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await mutateAsync(data)
      reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      if (getHttpStatus(error) === 409) {
        setError('nit', { message: 'El NIT/RUC ya está registrado' })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Input
            label="Nombre"
            fullWidth
            error={!!errors.nombre}
            errorMessage={errors.nombre?.message}
            {...register('nombre')}
          />
          <Input
            label="NIT/RUC"
            fullWidth
            error={!!errors.nit}
            errorMessage={errors.nit?.message}
            {...register('nit')}
          />
          <Input
            label="Teléfono"
            fullWidth
            error={!!errors.telefono}
            errorMessage={errors.telefono?.message}
            {...register('telefono')}
          />
          <Input
            label="Ciudad"
            fullWidth
            error={!!errors.ciudad}
            errorMessage={errors.ciudad?.message}
            {...register('ciudad')}
          />
          <DialogFooter>
            <Button type="outline-solid" onClick={() => { reset(); onOpenChange(false) }} disabled={isPending}>
              Cancelar
            </Button>
            <Button disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

> ⚠️ `Button` from siesa-ui-kit: pass text as `children`. The default `type` for the submit button is fine (native HTML `submit`). Use `type="outline-solid"` for the cancel (secondary action).
> ⚠️ `getHttpStatus` utility already exists at `frontend/src/shared/lib/httpError.ts` — do NOT recreate.
> ⚠️ When `onOpenChange(false)` is called, `@base-ui/react` Dialog animates out. Reset the form on cancel AND on close button click.

---

### Frontend — Toast Pattern (Declarative — MANDATORY)

```typescript
// ⚠️ `toast` (imperative) is NOT in the siesa-ui-kit public bundle.
// Use the `Toast` component declaratively with state in ClienteListView.

import { Toast } from 'siesa-ui-kit'

// In ClienteListView:
const [showSuccessToast, setShowSuccessToast] = useState(false)

useEffect(() => {
  if (showSuccessToast) {
    const t = setTimeout(() => setShowSuccessToast(false), 4000)
    return () => clearTimeout(t)
  }
}, [showSuccessToast])

// Render (outside the dialog, inside ClienteListView return):
{showSuccessToast && (
  <div className="fixed bottom-4 right-4 z-50">
    <Toast color="green" onClose={() => setShowSuccessToast(false)}>
      Cliente creado correctamente
    </Toast>
  </div>
)}
```

---

### Frontend — Updated ClienteListView (Nuevo cliente button + dialog + toast)

```typescript
// frontend/src/modules/crm/clientes/presentation/ClienteListView.tsx
// ADD to imports:
import { useState, useEffect, useMemo } from 'react'  // add useEffect
import { Input, Button, Toast } from 'siesa-ui-kit'   // add Button, Toast
import { ClienteFormDialog } from './ClienteFormDialog'

// ADD state inside component:
const [isDialogOpen, setIsDialogOpen] = useState(false)
const [showSuccessToast, setShowSuccessToast] = useState(false)

// ADD auto-dismiss effect:
useEffect(() => {
  if (showSuccessToast) {
    const t = setTimeout(() => setShowSuccessToast(false), 4000)
    return () => clearTimeout(t)
  }
}, [showSuccessToast])

// MODIFY the header div (add button + dialog + toast to return):
return (
  <div className="flex flex-col h-full">
    <div className="p-3 border-b border-slate-200 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Clientes</span>
        <Button onClick={() => setIsDialogOpen(true)}>Nuevo cliente</Button>
      </div>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar por nombre o NIT/RUC"
        aria-label="Buscar clientes"
      />
    </div>
    {/* ... rest of existing list code unchanged ... */}

    <ClienteFormDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      onSuccess={() => setShowSuccessToast(true)}
    />

    {showSuccessToast && (
      <div className="fixed bottom-4 right-4 z-50">
        <Toast color="green" onClose={() => setShowSuccessToast(false)}>
          Cliente creado correctamente
        </Toast>
      </div>
    )}
  </div>
)
```

---

### Frontend — Test Patterns

**`useCreateCliente.test.ts` (MSW):**
```typescript
// frontend/src/modules/crm/clientes/application/useCreateCliente.test.ts
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createWrapper } from '@/test/utils'
import { useCreateCliente } from './useCreateCliente'

const BASE = 'http://localhost:5000/api/v1'

it('creates a client and returns ClienteDto on success', async () => {
  const mockCliente = { id: '123', nombre: 'Empresa X', nit: '900-1', telefono: '300', ciudad: 'Bogotá' }
  server.use(
    http.post(`${BASE}/clientes`, () => HttpResponse.json(mockCliente, { status: 201 }))
  )
  const { result } = renderHook(() => useCreateCliente(), { wrapper: createWrapper() })
  await act(async () => {
    await result.current.mutateAsync({ nombre: 'Empresa X', nit: '900-1', telefono: '300', ciudad: 'Bogotá' })
  })
  expect(result.current.isSuccess).toBe(true)
})

it('surfaces 409 error when NIT is duplicate', async () => {
  server.use(
    http.post(`${BASE}/clientes`, () =>
      HttpResponse.json({ title: 'Conflict' }, { status: 409 })
    )
  )
  const { result } = renderHook(() => useCreateCliente(), { wrapper: createWrapper() })
  await act(async () => {
    try {
      await result.current.mutateAsync({ nombre: 'X', nit: 'dup', telefono: '300', ciudad: 'Cali' })
    } catch { /* expected */ }
  })
  expect(result.current.isError).toBe(true)
})
```

**`ClienteFormDialog.test.tsx` (vi.mock pattern):**
```typescript
// frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ClienteFormDialog } from './ClienteFormDialog'

const mockMutateAsync = vi.fn()
vi.mock('../application/useCreateCliente', () => ({
  useCreateCliente: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  onSuccess: vi.fn(),
}

beforeEach(() => {
  mockMutateAsync.mockReset()
  defaultProps.onOpenChange.mockReset()
  defaultProps.onSuccess.mockReset()
})

it('renders all 4 form fields', () => {
  render(<ClienteFormDialog {...defaultProps} />)
  expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/nit\/ruc/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/ciudad/i)).toBeInTheDocument()
})

it('shows validation errors when submitting empty form', async () => {
  render(<ClienteFormDialog {...defaultProps} />)
  await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
  expect(await screen.findByText('Nombre es requerido')).toBeInTheDocument()
  expect(mockMutateAsync).not.toHaveBeenCalled()
})

it('submits valid form and calls onSuccess', async () => {
  mockMutateAsync.mockResolvedValue({})
  render(<ClienteFormDialog {...defaultProps} />)
  await userEvent.type(screen.getByLabelText(/nombre/i), 'Empresa Test')
  await userEvent.type(screen.getByLabelText(/nit\/ruc/i), '900-test')
  await userEvent.type(screen.getByLabelText(/teléfono/i), '3001234567')
  await userEvent.type(screen.getByLabelText(/ciudad/i), 'Bogotá')
  await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
  expect(mockMutateAsync).toHaveBeenCalledWith({
    nombre: 'Empresa Test', nit: '900-test', telefono: '3001234567', ciudad: 'Bogotá',
  })
  await waitFor(() => expect(defaultProps.onSuccess).toHaveBeenCalled())
})

it('shows "El NIT/RUC ya está registrado" on 409 error', async () => {
  mockMutateAsync.mockRejectedValue({ response: { status: 409 } })
  render(<ClienteFormDialog {...defaultProps} />)
  await userEvent.type(screen.getByLabelText(/nombre/i), 'Empresa Dup')
  await userEvent.type(screen.getByLabelText(/nit\/ruc/i), 'dup-nit')
  await userEvent.type(screen.getByLabelText(/teléfono/i), '3000000000')
  await userEvent.type(screen.getByLabelText(/ciudad/i), 'Cali')
  await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
  expect(await screen.findByText('El NIT/RUC ya está registrado')).toBeInTheDocument()
  expect(defaultProps.onSuccess).not.toHaveBeenCalled()
})
```

> ⚠️ `Input` from siesa-ui-kit renders a `<label>` associated with the input. Use `getByLabelText()` in tests.
> ⚠️ Add `import { waitFor } from '@testing-library/react'` if using `waitFor` in tests.

---

### Spanish UI Text (ALL text must be in Spanish)

```
✅ "Nuevo cliente"                              ← button label
✅ "Nuevo cliente"                              ← dialog title
✅ "Nombre"                                     ← input label
✅ "NIT/RUC"                                    ← input label
✅ "Teléfono"                                   ← input label
✅ "Ciudad"                                     ← input label
✅ "Guardar"                                    ← submit button
✅ "Guardando..."                               ← submit button while pending
✅ "Cancelar"                                   ← cancel button
✅ "Cliente creado correctamente"               ← success toast
✅ "El NIT/RUC ya está registrado"              ← 409 error on nit field
✅ "Nombre es requerido"                        ← validation error
✅ "NIT/RUC es requerido"                       ← validation error
✅ "Teléfono es requerido"                      ← validation error
✅ "Ciudad es requerida"                        ← validation error
❌ "Create client" / "Save" / "Cancel"          ← FORBIDDEN
```

---

### Architecture Constraints (Non-Negotiable)

- **`DateTimeOffset`** everywhere in C# — NEVER `DateTime`
- **`Guid`** PKs — NEVER `int`; `ClienteEntity.Id` is assigned by the entity constructor via `Guid.NewGuid()`
- **`AsNoTracking()`** on `FindByNitAsync` — read-only check
- **`['clientes']` queryKey** — `invalidateQueries` invalidates the list after create
- **`Results.Problem(statusCode: 409)`** — returns `application/problem+json` (RFC 7807) — not `Results.Conflict()`
- **`Results.ValidationProblem`** — returns HTTP 422 with field-level error dictionary — not `Results.BadRequest()`
- **No Dialog in siesa-ui-kit** — use `@/components/ui/dialog` (shadcn wrapper over `@base-ui/react`)
- **No imperative `toast()`** — use `<Toast>` declaratively with state
- **`getHttpStatus(error)`** — use shared utility from `@/shared/lib/httpError` for error.response.status
- **No Swagger** — Scalar configured; do NOT call `.AddSwaggerGen()`
- **`UseSnakeCaseNamingConvention()`** already in Program.cs — do NOT call in entity configurations

---

### Project Structure Notes

**Files to create/modify:**

```
backend/
├── src/
│   ├── SiesaAgents.Domain/Clientes/
│   │   └── Interfaces/IClienteRepository.cs          ← MODIFY: add FindByNitAsync + CreateAsync
│   ├── SiesaAgents.Infrastructure/Repositories/
│   │   └── ClienteRepository.cs                      ← MODIFY: implement both new methods
│   ├── SiesaAgents.Application/Clientes/Commands/
│   │   ├── CreateClienteCommand.cs                   ← NEW
│   │   ├── CreateClienteCommandValidator.cs          ← NEW
│   │   └── CreateClienteCommandHandler.cs            ← NEW
│   └── SiesaAgents.API/
│       ├── Endpoints/ClienteEndpoints.cs             ← MODIFY: add POST /
│       └── Program.cs                               ← MODIFY: AddValidatorsFromAssemblyContaining + handler
└── tests/
    ├── SiesaAgents.UnitTests/Application/Clientes/
    │   └── CreateClienteCommandHandlerTests.cs       ← NEW (3 tests)
    └── SiesaAgents.IntegrationTests/Clientes/
        └── ClienteEndpointsTests.cs                  ← MODIFY: add PostCliente_* tests

frontend/
└── src/
    ├── modules/crm/clientes/
    │   ├── domain/IClienteRepository.ts              ← MODIFY: add CreateClienteDto + create()
    │   ├── infrastructure/clienteApiRepository.ts    ← MODIFY: implement create()
    │   ├── application/
    │   │   ├── useCreateCliente.ts                   ← NEW
    │   │   └── useCreateCliente.test.ts              ← NEW
    │   └── presentation/
    │       ├── ClienteFormDialog.tsx                 ← NEW
    │       ├── ClienteFormDialog.test.tsx            ← NEW
    │       └── ClienteListView.tsx                   ← MODIFY: add button + dialog + toast
    └── shared/lib/
        └── httpError.ts                              ← ALREADY EXISTS — do NOT recreate
```

---

### References

- Story 2.3 AC: [`_bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md#Story 2.3`]
- Story 2.2 patterns (IClienteRepository, ClienteDto, ClienteRepository, Testcontainers class): [`_bmad-output/implementation-artifacts/2-2-client-detail-view.md`]
- `getHttpStatus` utility: [`frontend/src/shared/lib/httpError.ts`] — created in Story 3.2 review
- Dialog component: [`frontend/src/components/ui/dialog.tsx`] — `@base-ui/react` backed, controlled open/onOpenChange
- `Toast` types: [`frontend/node_modules/siesa-ui-kit/dist/components/Toast/Toast.types.d.ts`]
- `Input` types: [`frontend/node_modules/siesa-ui-kit/dist/components/Input/Input.types.d.ts`]
- Architecture — API patterns: [`_bmad-output/planning-artifacts/architecture.md`]
- FluentValidation 12: [`backend/src/SiesaAgents.Application/SiesaAgents.Application.csproj`]

### Latest Verified Versions (March 2026)

| Library | Version | Notes |
|---|---|---|
| siesa-ui-kit | **1.0.77** | `Toast` declarative only — `toast()` imperative NOT in public bundle |
| @tanstack/react-query | **5.90.21** | `useMutation` + `invalidateQueries` |
| react-hook-form | **7.71.2** | `useForm`, `handleSubmit`, `setError`, `register` |
| @hookform/resolvers | **5.2.2** | `zodResolver` from `@hookform/resolvers/zod` |
| zod | **4.3.6** | Zod v4 — `z.string().min(1)` syntax unchanged |
| @base-ui/react | **1.3.0** | Dialog via `frontend/src/components/ui/dialog.tsx` |
| FluentValidation | **12.1.1** | `AbstractValidator<T>`, `AddValidatorsFromAssemblyContaining<T>()` |
| Testcontainers.PostgreSql | **4.2.0** | ADD tests to EXISTING class |
| msw | **2.12.10** | `http.post(url, handler)`, `HttpResponse.json(body, { status })` |

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

1. **FluentValidation DI Registration**: Story Dev Notes suggested `AddValidatorsFromAssemblyContaining<T>()` which requires `FluentValidation.DependencyInjectionExtensions`. That package is NOT installed — only base `FluentValidation` 12.1.1 is present. Used manual `AddScoped<IValidator<CreateClienteCommand>, CreateClienteCommandValidator>()` instead. Future stories should be aware of this.

2. **`ClienteFormDialog` lazy-loaded**: Added as `React.lazy(() => import('./ClienteFormDialog'))` in `ClienteListView.tsx` to avoid pulling `@base-ui/react/dialog` into the initial route bundle. Rendered inside `<Suspense fallback={null}>` with conditional `{isDialogOpen && ...}`. No behavioral change.

3. **Pre-existing Story 3.3 issues fixed as side-effect**: `ContactoForm.tsx` was missing `htmlType="submit"` on the submit Button, and `useCreateContacto.ts` + `main.tsx` had broken `siesa-ui-kit/dist/...` imports that Vite 8 rejects. Fixed as a prerequisite for the frontend build.

4. **Navigation test infrastructure**: Added `GET /contactos` handler to `frontend/src/mocks/handlers.ts` (was missing, causing navigation test for `/contactos` to fail). Increased `waitFor` timeout on the Contactos navigation test from default 1000ms to 5000ms to handle full-suite environment latency.

5. **Backend integration tests**: Require Docker (Testcontainers). All 20 unit tests pass. Integration tests pass in Docker-enabled environments.

### File List

**Backend — Modified:**
- `backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs` — added `FindByNitAsync`, `CreateAsync`
- `backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs` — implemented both new methods
- `backend/src/SiesaAgents.API/Endpoints/ClienteEndpoints.cs` — added `POST /` endpoint
- `backend/src/SiesaAgents.API/Program.cs` — registered `CreateClienteCommandHandler`, `IValidator<CreateClienteCommand>`
- `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs` — added 2 integration tests

**Backend — Created:**
- `backend/src/SiesaAgents.Application/Clientes/Commands/CreateClienteCommand.cs`
- `backend/src/SiesaAgents.Application/Clientes/Commands/CreateClienteCommandValidator.cs`
- `backend/src/SiesaAgents.Application/Clientes/Commands/CreateClienteCommandHandler.cs`
- `backend/tests/SiesaAgents.UnitTests/Application/Clientes/CreateClienteCommandHandlerTests.cs`

**Frontend — Modified:**
- `frontend/src/modules/crm/clientes/domain/IClienteRepository.ts` — added `CreateClienteDto`, `create()`
- `frontend/src/modules/crm/clientes/infrastructure/clienteApiRepository.ts` — implemented `create()`
- `frontend/src/modules/crm/clientes/presentation/ClienteListView.tsx` — added button, lazy dialog, toast
- `frontend/src/modules/crm/clientes/presentation/ClienteListView.test.tsx` — added `vi.mock('./ClienteFormDialog')`
- `frontend/src/modules/crm/contactos/presentation/ContactoForm.tsx` — fixed `htmlType="submit"` (side-effect fix)
- `frontend/src/modules/crm/contactos/application/useCreateContacto.ts` — removed broken `toast` dist import (side-effect fix)
- `frontend/src/main.tsx` — removed broken `ToastManager` dist import (side-effect fix)
- `frontend/src/mocks/handlers.ts` — added `GET /contactos` handler
- `frontend/src/routes/__tests__/navigation.test.tsx` — increased waitFor timeout for contactos test

**Frontend — Created:**
- `frontend/src/modules/crm/clientes/application/useCreateCliente.ts`
- `frontend/src/modules/crm/clientes/application/useCreateCliente.test.ts`
- `frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.tsx`
- `frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.test.tsx`
- `frontend/src/siesa-ui-kit.d.ts` — type declarations for dist subpaths (TS only, not bundled)
