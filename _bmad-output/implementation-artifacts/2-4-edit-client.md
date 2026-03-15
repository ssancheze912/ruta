---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
status: done
epic: 2
story: 4
storyKey: 2-4-edit-client
createdAt: '2026-03-14'
---

# Story 2.4: Edit Client

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a commercial team member,
I want to edit any field of an existing client,
so that the client information stays up to date.

## Acceptance Criteria

1. **AC1 — "Editar" button opens form pre-filled**: When the user is on a client detail page (`/clientes/:id`) and clicks "Editar", a modal dialog opens with the same 4-field form (Nombre, NIT/RUC, Teléfono, Ciudad) pre-filled with the client's current values. (FR5, FR6)

2. **AC2 — Successful edit updates detail and list**: When the user modifies one or more fields and submits, the changes are saved to the backend, the dialog closes, the client detail and the client list both update immediately (FR27), and a toast shows "Cliente actualizado correctamente".

3. **AC3 — Client-side validation shows inline errors**: When the user clears a required field and submits, clear inline error messages appear below the empty fields (FR8) and the form is NOT submitted to the backend.

4. **AC4 — Duplicate NIT on update returns 409**: When the user changes the NIT/RUC to a value already assigned to a DIFFERENT client, the backend returns 409 Conflict and the form shows "El NIT/RUC ya está registrado" on the NIT field. The dialog remains open. Keeping the same NIT as the current client is allowed.

5. **AC5 — Cancel discards changes**: When the user clicks "Cancelar" or the X button (or presses Escape), the dialog closes and the original client data remains unchanged. Re-opening the dialog shows the original values again.

## Tasks / Subtasks

### Backend

- [x] Task 1: Extend Domain Layer (AC: 2, 4)
  - [x] 1.1 Add `Task UpdateAsync(ClienteEntity entity, CancellationToken ct = default)` to `backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs`

- [x] Task 2: Extend Infrastructure Layer (AC: 2)
  - [x] 2.1 Implement `UpdateAsync` in `backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs` — use `context.Clientes.Update(entity); await context.SaveChangesAsync(ct);`

- [x] Task 3: Create Application Layer (AC: 2, 3, 4)
  - [x] 3.1 Create `backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteCommand.cs` — record with `Guid Id`, `string Nombre`, `string Nit`, `string Telefono`, `string Ciudad`
  - [x] 3.2 Create `backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteCommandValidator.cs` — `AbstractValidator<UpdateClienteCommand>` with `NotEmpty()` on all 5 fields (including `Id`)
  - [x] 3.3 Create `backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteResult.cs` — sealed record result type (see Dev Notes for exact pattern)
  - [x] 3.4 Create `backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteCommandHandler.cs` — load entity by Id (→ NotFound), check NIT uniqueness excluding current entity (→ NitConflict), update fields + `UpdatedAt`, call `UpdateAsync`, return `UpdateClienteResult.Success(dto)` (see Dev Notes)

- [x] Task 4: Extend API Layer (AC: 2, 3, 4)
  - [x] 4.1 Create `backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteRequest.cs` — record with body fields only: `string Nombre`, `string Nit`, `string Telefono`, `string Ciudad`
  - [x] 4.2 Add `PUT /clientes/{id:guid}` to `backend/src/SiesaAgents.API/Endpoints/ClienteEndpoints.cs` — binds `id` from route + `UpdateClienteRequest` from body; builds `UpdateClienteCommand`; validates (→ 422); calls handler; maps `NotFound → 404`, `NitConflict → 409`, `Success → 200 OK + ClienteDto`
  - [x] 4.3 Register in `backend/src/SiesaAgents.API/Program.cs`: `builder.Services.AddScoped<UpdateClienteCommandHandler>()`

- [x] Task 5: Backend Tests (AC: 2, 3, 4)
  - [x] 5.1 Create `backend/tests/SiesaAgents.UnitTests/Application/Clientes/UpdateClienteCommandHandlerTests.cs` — 4 tests: success (returns Success+ClienteDto with updated fields), not found (returns NotFound), NIT conflict with different client (returns NitConflict), same NIT as current client (returns Success — allowed)
  - [x] 5.2 Add integration tests to `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs` (ADD to existing class):
    - `PutCliente_WithValidData_Returns200WithUpdatedDto`
    - `PutCliente_WithNonExistentId_Returns404`
    - `PutCliente_WithDuplicateNitOfOtherClient_Returns409`
  - [x] 5.3 `dotnet build` — 0 errors ✅
  - [x] 5.4 `dotnet test --project tests/SiesaAgents.UnitTests` — all pass ✅

### Frontend

- [x] Task 6: Extend Domain + Infrastructure Layers (AC: 2)
  - [x] 6.1 Add `UpdateClienteDto` interface + `update(id: string, data: UpdateClienteDto): Promise<Cliente>` to `frontend/src/modules/crm/clientes/domain/IClienteRepository.ts`
  - [x] 6.2 Implement `update` in `frontend/src/modules/crm/clientes/infrastructure/clienteApiRepository.ts` — `PUT /clientes/${id}`, returns `response.data`

- [x] Task 7: Create `useUpdateCliente` hook (AC: 2, 4)
  - [x] 7.1 Create `frontend/src/modules/crm/clientes/application/useUpdateCliente.ts` — `useMutation` with `mutationFn: ({ id, data }) => clienteApiRepository.update(id, data)`; `onSuccess: (_, { id }) => { invalidateQueries(['clientes']); invalidateQueries(['clientes', id]); toast.success('Cliente actualizado correctamente') }`

- [x] Task 8: Extend `ClienteFormDialog` for edit mode (AC: 1, 2, 3, 4, 5)
  - [x] 8.1 Add optional props `clienteId?: string` and `defaultValues?: FormValues` to `ClienteFormDialogProps` interface in `frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.tsx`
  - [x] 8.2 Always call both `useCreateCliente()` and `useUpdateCliente()` inside the component (no conditional hooks). Select the active mutation based on `clienteId` presence: `const { isPending } = clienteId ? updateMutation : createMutation`
  - [x] 8.3 Add `useEffect` to reset form when dialog opens: `useEffect(() => { if (open) reset(defaultValues ?? emptyValues) }, [open])` — ensures pre-filled values appear correctly every time
  - [x] 8.4 In `onSubmit`: if `clienteId` → `updateMutation.mutateAsync({ id: clienteId, data })`; else → `createMutation.mutateAsync(data)`. Both call `handleOpenChange(false)` then `onSuccess()` on success
  - [x] 8.5 Dialog title: conditionally `clienteId ? 'Editar cliente' : 'Nuevo cliente'`
  - [x] 8.6 Update `ClienteFormDialog.test.tsx`: add `vi.mock('../application/useUpdateCliente')` + mock setup to prevent hook errors. Add 2 tests for edit mode: pre-filled values visible, submit calls update mutation

- [x] Task 9: Update `ClienteDetailView` (AC: 1, 2, 5)
  - [x] 9.1 Add `isEditDialogOpen` state (`useState(false)`) to `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.tsx`
  - [x] 9.2 Add "Editar" `Button` (siesa-ui-kit, default `type="solid"`) in the header row, alongside the existing "Volver" button. Order: "Editar" left, "Volver" right (or both in a row with `gap-2`)
  - [x] 9.3 Lazy-load `ClienteFormDialog` via `React.lazy` (same pattern as `ClienteListView`) and render inside `<Suspense fallback={null}>`
  - [x] 9.4 Pass `clienteId={cliente.id}` + `defaultValues={{ nombre: cliente.nombre, nit: cliente.nit, telefono: cliente.telefono ?? '', ciudad: cliente.ciudad ?? '' }}` to `ClienteFormDialog`. Pass `onSuccess={() => {}}` (toast handled by hook)

- [x] Task 10: Frontend Tests (AC: 1, 2, 3)
  - [x] 10.1 Create `frontend/src/modules/crm/clientes/application/useUpdateCliente.test.ts` — MSW: PUT 200 with updated data, PUT 404, PUT 409. Tests: success returns updated client + invalidates both query keys + calls toast.success; 404 sets isError; 409 sets isError
  - [x] 10.2 Update `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.test.tsx` — add test: "Editar" button renders in detail view when client data is loaded
  - [x] 10.3 `npm run build` — 0 TypeScript errors ✅
  - [x] 10.4 `npm test` — all tests pass ✅

## Dev Notes

### ⚠️ Prerequisites

- Story 2.3 (`done`) — `IClienteRepository` (with `FindByNitAsync`, `CreateAsync`), `ClienteRepository`, `ClienteEndpoints`, `ClienteFormDialog`, `useCreateCliente` — all exist.
- `AddValidatorsFromAssemblyContaining<CreateClienteCommandHandler>()` already registered in `Program.cs` — `UpdateClienteCommandValidator` will be auto-scanned. Only `UpdateClienteCommandHandler` needs manual `AddScoped`.
- `ClienteDetailView` currently has no "Editar" button — add in Task 9.
- `ClienteEndpointsTests.cs` already implements `IAsyncLifetime`, `_postgres`, `CreateFactory()`, `MigrateAsync()` — ADD new tests to existing class, DO NOT re-declare.
- Toast infrastructure: `@/shared/lib/toast` (`toast.success`, etc.) is committed and wired via `<ToastContainer>` in `main.tsx`. Use `import { toast } from '@/shared/lib/toast'` in `useUpdateCliente.ts`.
- `ClienteEntity.UpdatedAt` has `{ get; set; }` (mutable) — can be assigned directly in the handler.

---

### 🎨 UI Implementation Requirements (MANDATORY)

- **Library**: `siesa-ui-kit` v1.0.77 (already installed — do NOT run `npm install siesa-ui-kit` again)
- **Import styles**: already in `main.tsx`, do NOT add again
- **Components required**:
  - `Input` — for all 4 form fields. Props: `label`, `error` (boolean), `errorMessage` (string), `fullWidth`. Do NOT use native `<input>`.
  - `Button` — "Editar" button. Children = `'Editar'`. Use default `type` (solid) for primary action.
  - `Toast` — NOT needed in `ClienteDetailView` — toast is fired from `useUpdateCliente.onSuccess` via event bus.

---

### Backend — UpdateClienteResult Pattern

```csharp
// backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteResult.cs
namespace SiesaAgents.Application.Clientes.Commands;

public sealed record UpdateClienteResult
{
    public bool IsNotFound { get; private init; }
    public bool IsNitConflict { get; private init; }
    public ClienteDto? Dto { get; private init; }

    public static UpdateClienteResult NotFound() => new() { IsNotFound = true };
    public static UpdateClienteResult NitConflict() => new() { IsNitConflict = true };
    public static UpdateClienteResult Success(ClienteDto dto) => new() { Dto = dto };
}
```

---

### Backend — UpdateClienteCommand + Validator

```csharp
// backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteCommand.cs
namespace SiesaAgents.Application.Clientes.Commands;

public record UpdateClienteCommand(
    Guid   Id,
    string Nombre,
    string Nit,
    string Telefono,
    string Ciudad
);
```

```csharp
// backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteCommandValidator.cs
using FluentValidation;

namespace SiesaAgents.Application.Clientes.Commands;

public class UpdateClienteCommandValidator : AbstractValidator<UpdateClienteCommand>
{
    public UpdateClienteCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id es requerido.");
        RuleFor(x => x.Nombre).NotEmpty().WithMessage("Nombre es requerido.").MaximumLength(255);
        RuleFor(x => x.Nit).NotEmpty().WithMessage("NIT/RUC es requerido.").MaximumLength(100);
        RuleFor(x => x.Telefono).NotEmpty().WithMessage("Teléfono es requerido.").MaximumLength(50);
        RuleFor(x => x.Ciudad).NotEmpty().WithMessage("Ciudad es requerida.").MaximumLength(100);
    }
}
```

---

### Backend — UpdateClienteRequest (body-only DTO)

```csharp
// backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteRequest.cs
namespace SiesaAgents.Application.Clientes.Commands;

public record UpdateClienteRequest(
    string Nombre,
    string Nit,
    string Telefono,
    string Ciudad
);
```

---

### Backend — UpdateClienteCommandHandler

```csharp
// backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteCommandHandler.cs
using SiesaAgents.Application.Clientes.DTOs;
using SiesaAgents.Domain.Clientes.Interfaces;

namespace SiesaAgents.Application.Clientes.Commands;

public class UpdateClienteCommandHandler(IClienteRepository repository)
{
    public async Task<UpdateClienteResult> HandleAsync(
        UpdateClienteCommand command, CancellationToken ct = default)
    {
        var entity = await repository.GetByIdAsync(command.Id, ct);
        if (entity is null) return UpdateClienteResult.NotFound();

        // NIT uniqueness: only conflict if a DIFFERENT client owns that NIT
        var existing = await repository.FindByNitAsync(command.Nit, ct);
        if (existing is not null && existing.Id != command.Id)
            return UpdateClienteResult.NitConflict();

        entity.Nombre   = command.Nombre;
        entity.Nit      = command.Nit;
        entity.Telefono = command.Telefono;
        entity.Ciudad   = command.Ciudad;
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        await repository.UpdateAsync(entity, ct);

        return UpdateClienteResult.Success(new ClienteDto(
            entity.Id, entity.Nombre, entity.Nit,
            entity.Telefono, entity.Ciudad,
            entity.CreatedAt, entity.UpdatedAt));
    }
}
```

> ⚠️ `GetByIdAsync` already uses `AsNoTracking()` — calling `context.Clientes.Update(entity)` on a detached entity is fine in EF Core (re-attaches and marks as modified).

---

### Backend — IClienteRepository Extension

```csharp
// Add to IClienteRepository.cs
Task UpdateAsync(ClienteEntity entity, CancellationToken ct = default);
```

```csharp
// Add to ClienteRepository.cs
public async Task UpdateAsync(ClienteEntity entity, CancellationToken ct = default)
{
    context.Clientes.Update(entity);
    await context.SaveChangesAsync(ct);
}
```

---

### Backend — PUT /api/v1/clientes/{id} Endpoint

```csharp
// Add to ClienteEndpoints.cs inside MapClienteEndpoints(this RouteGroupBuilder group)
group.MapPut("/clientes/{id:guid}", async (
    Guid id,
    UpdateClienteRequest request,
    IValidator<UpdateClienteCommand> validator,
    UpdateClienteCommandHandler handler,
    CancellationToken ct) =>
{
    var command = new UpdateClienteCommand(
        id, request.Nombre, request.Nit, request.Telefono, request.Ciudad);

    var validation = await validator.ValidateAsync(command, ct);
    if (!validation.IsValid)
        return Results.ValidationProblem(validation.ToDictionary());

    var result = await handler.HandleAsync(command, ct);

    if (result.IsNotFound)
        return Results.Problem(
            statusCode: StatusCodes.Status404NotFound,
            title: "Not Found",
            detail: "Cliente no encontrado.");

    if (result.IsNitConflict)
        return Results.Problem(
            statusCode: StatusCodes.Status409Conflict,
            title: "Conflict",
            detail: "El NIT/RUC ya está registrado.");

    return Results.Ok(result.Dto);
})
.WithName("UpdateCliente")
.WithSummary("Actualiza un cliente existente")
.Produces<ClienteDto>()
.ProducesProblem(StatusCodes.Status404NotFound)
.ProducesProblem(StatusCodes.Status409Conflict)
.ProducesValidationProblem();
```

---

### Backend — Program.cs Addition

```csharp
// Add to Clientes — DI section (after CreateClienteCommandHandler):
builder.Services.AddScoped<UpdateClienteCommandHandler>();
```

> `AddValidatorsFromAssemblyContaining<CreateClienteCommandHandler>()` already scans the Application assembly — `UpdateClienteCommandValidator` is auto-registered. Do NOT add it manually.

---

### Backend — Unit Tests Pattern

```csharp
// backend/tests/SiesaAgents.UnitTests/Application/Clientes/UpdateClienteCommandHandlerTests.cs
using NSubstitute;
using SiesaAgents.Application.Clientes.Commands;
using SiesaAgents.Domain.Clientes.Entities;
using SiesaAgents.Domain.Clientes.Interfaces;

namespace SiesaAgents.UnitTests.Application.Clientes;

public class UpdateClienteCommandHandlerTests
{
    private readonly IClienteRepository _repository = Substitute.For<IClienteRepository>();
    private readonly UpdateClienteCommandHandler _handler;

    public UpdateClienteCommandHandlerTests()
    {
        _handler = new UpdateClienteCommandHandler(_repository);
    }

    [Fact]
    public async Task HandleAsync_WithValidCommand_ReturnsSuccess()
    {
        var id = Guid.NewGuid();
        var command = new UpdateClienteCommand(id, "Empresa Nueva", "900-001-1", "3001234567", "Bogotá");
        var existingEntity = new ClienteEntity { Nombre = "Empresa Vieja", Nit = "900-001-1" };
        // Use reflection or a test-accessible setter to set Id if needed; or rely on FindByNitAsync returning same Id
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(existingEntity);
        _repository.FindByNitAsync(command.Nit, Arg.Any<CancellationToken>()).Returns(existingEntity);

        var result = await _handler.HandleAsync(command);

        Assert.False(result.IsNotFound);
        Assert.False(result.IsNitConflict);
        Assert.NotNull(result.Dto);
        Assert.Equal("Empresa Nueva", result.Dto!.Nombre);
        await _repository.Received(1).UpdateAsync(Arg.Any<ClienteEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentId_ReturnsNotFound()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((ClienteEntity?)null);

        var result = await _handler.HandleAsync(new UpdateClienteCommand(id, "X", "Y", "Z", "W"));

        Assert.True(result.IsNotFound);
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<ClienteEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleAsync_WithNitBelongingToDifferentClient_ReturnsNitConflict()
    {
        var currentId = Guid.NewGuid();
        var otherId = Guid.NewGuid();
        var command = new UpdateClienteCommand(currentId, "Empresa A", "nit-dup", "300", "Cali");
        var currentEntity = new ClienteEntity { Nit = "old-nit" };
        var otherEntity = new ClienteEntity { Nit = "nit-dup" };
        // otherEntity has a different Id than currentId
        _repository.GetByIdAsync(currentId, Arg.Any<CancellationToken>()).Returns(currentEntity);
        _repository.FindByNitAsync("nit-dup", Arg.Any<CancellationToken>()).Returns(otherEntity);

        var result = await _handler.HandleAsync(command);

        Assert.True(result.IsNitConflict);
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<ClienteEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleAsync_WithSameNitAsCurrentClient_ReturnsSuccess()
    {
        var id = Guid.NewGuid();
        var command = new UpdateClienteCommand(id, "Empresa A", "same-nit", "300", "Medellín");
        var entity = new ClienteEntity { Nit = "same-nit" };
        // entity.Id == id → same client, NIT conflict must NOT be raised
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(entity);
        _repository.FindByNitAsync("same-nit", Arg.Any<CancellationToken>()).Returns(entity);

        var result = await _handler.HandleAsync(command);

        Assert.False(result.IsNitConflict);
        Assert.False(result.IsNotFound);
    }
}
```

> ⚠️ `ClienteEntity.Id` is `private set` assigned by constructor (`Guid.NewGuid()`). When `FindByNitAsync` returns the **same entity instance** that `GetByIdAsync` returned, `existing.Id == command.Id` will be true — no NIT conflict. This is the correct test setup for the "same NIT" case.

---

### Backend — Integration Tests (ADD to existing class)

```csharp
[Fact]
public async Task PutCliente_WithValidData_Returns200WithUpdatedDto()
{
    await using var factory = CreateFactory();
    await MigrateAsync(factory);

    Guid clienteId;
    using (var scope = factory.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var e = new ClienteEntity { Nombre = "Original", Nit = "900-update-1", Telefono = "300", Ciudad = "Cali" };
        db.Clientes.Add(e);
        await db.SaveChangesAsync();
        clienteId = e.Id;
    }

    var client = factory.CreateClient();
    var payload = new { nombre = "Actualizado", nit = "900-update-1", telefono = "3009999999", ciudad = "Bogotá" };
    var response = await client.PutAsJsonAsync($"/api/v1/clientes/{clienteId}", payload);

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    var json = await response.Content.ReadAsStringAsync();
    var dto = JsonSerializer.Deserialize<ClienteDto>(json, JsonOptions);
    Assert.NotNull(dto);
    Assert.Equal("Actualizado", dto!.Nombre);
    Assert.Equal("Bogotá", dto.Ciudad);
}

[Fact]
public async Task PutCliente_WithNonExistentId_Returns404()
{
    await using var factory = CreateFactory();
    await MigrateAsync(factory);
    var client = factory.CreateClient();
    var payload = new { nombre = "X", nit = "Y", telefono = "Z", ciudad = "W" };

    var response = await client.PutAsJsonAsync($"/api/v1/clientes/{Guid.NewGuid()}", payload);

    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
}

[Fact]
public async Task PutCliente_WithDuplicateNitOfOtherClient_Returns409()
{
    await using var factory = CreateFactory();
    await MigrateAsync(factory);

    Guid targetId;
    using (var scope = factory.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Clientes.Add(new ClienteEntity { Nombre = "Ocupado", Nit = "nit-taken" });
        var target = new ClienteEntity { Nombre = "Target", Nit = "nit-target" };
        db.Clientes.Add(target);
        await db.SaveChangesAsync();
        targetId = target.Id;
    }

    var client = factory.CreateClient();
    var payload = new { nombre = "Target", nit = "nit-taken", telefono = "300", ciudad = "Cali" };
    var response = await client.PutAsJsonAsync($"/api/v1/clientes/{targetId}", payload);

    Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
}
```

> ⚠️ `PutAsJsonAsync` requires `using System.Net.Http.Json;` — already added in Story 2.3.

---

### Frontend — Domain Interface + DTO

```typescript
// Add to frontend/src/modules/crm/clientes/domain/IClienteRepository.ts
export interface UpdateClienteDto {
  nombre: string
  nit: string
  telefono: string
  ciudad: string
}

export interface IClienteRepository {
  getAll(): Promise<Cliente[]>
  getById(id: string): Promise<Cliente>
  create(data: CreateClienteDto): Promise<Cliente>
  update(id: string, data: UpdateClienteDto): Promise<Cliente>   // ADD
}
```

---

### Frontend — API Repository Implementation

```typescript
// Add to clienteApiRepository.ts
async update(id: string, data: UpdateClienteDto): Promise<Cliente> {
  const response = await apiClient.put<Cliente>(`/clientes/${id}`, data)
  return response.data
},
```

---

### Frontend — useUpdateCliente Hook

```typescript
// frontend/src/modules/crm/clientes/application/useUpdateCliente.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/lib/toast'
import { clienteApiRepository } from '../infrastructure/clienteApiRepository'
import type { UpdateClienteDto } from '../domain/IClienteRepository'

export function useUpdateCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClienteDto }) =>
      clienteApiRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.invalidateQueries({ queryKey: ['clientes', id] })
      toast.success('Cliente actualizado correctamente')
    },
  })
}
```

---

### Frontend — ClienteFormDialog Extended Props

```typescript
// Extend ClienteFormDialogProps:
interface ClienteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  clienteId?: string       // if present → edit mode
  defaultValues?: {        // pre-fill form fields
    nombre: string
    nit: string
    telefono: string
    ciudad: string
  }
}
```

**Inside the component:**

```typescript
export function ClienteFormDialog({
  open, onOpenChange, onSuccess, clienteId, defaultValues,
}: ClienteFormDialogProps) {
  const createMutation = useCreateCliente()
  const updateMutation = useUpdateCliente()
  const { mutateAsync, isPending } = clienteId ? updateMutation : createMutation

  const emptyValues = { nombre: '', nit: '', telefono: '', ciudad: '' }
  const { register, handleSubmit, setError, reset, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  // Reset to current values whenever dialog opens
  useEffect(() => {
    if (open) reset(defaultValues ?? emptyValues)
  }, [open])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset(emptyValues)
    onOpenChange(isOpen)
  }

  const onSubmit = async (data: FormValues) => {
    try {
      if (clienteId) {
        await updateMutation.mutateAsync({ id: clienteId, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      handleOpenChange(false)
      onSuccess()
    } catch (error) {
      if (getHttpStatus(error) === 409) {
        setError('nit', { message: 'El NIT/RUC ya está registrado' })
      }
    }
  }

  const handleCancel = () => handleOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>{clienteId ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* ... same 4 Inputs as before ... */}
          <DialogFooter>
            <Button type="outline-solid" onClick={handleCancel} disabled={isPending}>
              Cancelar
            </Button>
            <Button htmlType="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

> ⚠️ Both `useCreateCliente()` and `useUpdateCliente()` are ALWAYS called (React rules of hooks — no conditional calls). The inactive mutation simply sits idle.
> ⚠️ The `useEffect` dependency array intentionally omits `reset` and `defaultValues` to avoid loops — the eslint-disable comment is required.

---

### Frontend — Updated ClienteDetailView

```typescript
// frontend/src/modules/crm/clientes/presentation/ClienteDetailView.tsx
import { useState, lazy, Suspense } from 'react'
import { DescriptionList, Button } from 'siesa-ui-kit'
import { useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { useCliente } from '../application/useCliente'
import { ErrorPanel } from '@/shared/components/ErrorPanel'

const ClienteFormDialog = lazy(() =>
  import('./ClienteFormDialog').then((m) => ({ default: m.ClienteFormDialog })),
)

export function ClienteDetailView({ clienteId }: { clienteId: string }) {
  const navigate = useNavigate()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { data: cliente, isLoading, isError, error, refetch } = useCliente(clienteId)

  // ... existing loading/error/null guards unchanged ...

  return (
    <div className="p-6 space-y-1">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">{cliente.nombre}</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsEditOpen(true)}>Editar</Button>
          <Button type="outline-solid" onClick={() => navigate({ to: '/clientes' })}>
            Volver
          </Button>
        </div>
      </div>

      <DescriptionList term="Nombre" details={cliente.nombre} />
      <DescriptionList term="NIT/RUC" details={cliente.nit} />
      <DescriptionList term="Teléfono" details={cliente.telefono ?? '—'} />
      <DescriptionList term="Ciudad" details={cliente.ciudad ?? '—'} />

      <Suspense fallback={null}>
        <ClienteFormDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSuccess={() => {}}
          clienteId={cliente.id}
          defaultValues={{
            nombre: cliente.nombre,
            nit: cliente.nit,
            telefono: cliente.telefono ?? '',
            ciudad: cliente.ciudad ?? '',
          }}
        />
      </Suspense>
    </div>
  )
}
```

---

### Frontend — useUpdateCliente Test Pattern

```typescript
// frontend/src/modules/crm/clientes/application/useUpdateCliente.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useUpdateCliente } from './useUpdateCliente'
import { toast } from '@/shared/lib/toast'

vi.mock('@/shared/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn(), show: vi.fn() },
}))

const BASE = 'http://localhost:5000/api/v1'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const validData = { nombre: 'Actualizado', nit: '900-1', telefono: '300', ciudad: 'Bogotá' }
const clienteId = 'test-id-123'

describe('useUpdateCliente', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns updated cliente and calls toast.success on 200', async () => {
    server.use(
      http.put(`${BASE}/clientes/${clienteId}`, () =>
        HttpResponse.json({ id: clienteId, ...validData, createdAt: '', updatedAt: '' }, { status: 200 }),
      ),
    )
    const { result } = renderHook(() => useUpdateCliente(), { wrapper: createWrapper() })
    await act(async () => { result.current.mutate({ id: clienteId, data: validData }) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('Cliente actualizado correctamente')
  })

  it('sets isError true on 404', async () => {
    server.use(
      http.put(`${BASE}/clientes/${clienteId}`, () =>
        HttpResponse.json({ title: 'Not Found' }, { status: 404 }),
      ),
    )
    const { result } = renderHook(() => useUpdateCliente(), { wrapper: createWrapper() })
    await act(async () => { result.current.mutate({ id: clienteId, data: validData }) })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('sets isError true on 409', async () => {
    server.use(
      http.put(`${BASE}/clientes/${clienteId}`, () =>
        HttpResponse.json({ title: 'Conflict' }, { status: 409 }),
      ),
    )
    const { result } = renderHook(() => useUpdateCliente(), { wrapper: createWrapper() })
    await act(async () => { result.current.mutate({ id: clienteId, data: validData }) })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
```

---

### Frontend — ClienteFormDialog.test.tsx Additions

```typescript
// ADD at top of test file (after existing vi.mock for useCreateCliente):
import * as useUpdateClienteModule from '../application/useUpdateCliente'
vi.mock('../application/useUpdateCliente')

// ADD inside describe block (after existing beforeEach setup):
// In mockUseCreateCliente helper, also mock useUpdateCliente:
function mockUseUpdateCliente(overrides = {}) {
  vi.mocked(useUpdateClienteModule.useUpdateCliente).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    ...overrides,
  } as unknown as ReturnType<typeof useUpdateClienteModule.useUpdateCliente>)
}

// Update beforeEach to also call mockUseUpdateCliente():
beforeEach(() => {
  vi.clearAllMocks()
  mockMutateAsync.mockReset()
  mockUseCreateCliente()
  mockUseUpdateCliente()   // ADD THIS
})

// ADD 2 new tests:
it('renders pre-filled values in edit mode', () => {
  render(
    <ClienteFormDialog
      {...defaultProps}
      clienteId="existing-id"
      defaultValues={{ nombre: 'Empresa X', nit: '900-1', telefono: '3001', ciudad: 'Cali' }}
    />,
  )
  // Values are populated via useEffect on open; since open=true from mount, check after effect
  expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
  expect(screen.getByText(/editar cliente/i)).toBeInTheDocument()
})

it('shows edit dialog title when clienteId provided', () => {
  render(
    <ClienteFormDialog
      {...defaultProps}
      clienteId="some-id"
      defaultValues={{ nombre: 'X', nit: 'Y', telefono: 'Z', ciudad: 'W' }}
    />,
  )
  expect(screen.getByText(/editar cliente/i)).toBeInTheDocument()
})
```

---

### Spanish UI Text (ALL text must be in Spanish)

```
✅ "Editar"                                     ← button in ClienteDetailView
✅ "Editar cliente"                             ← dialog title (edit mode)
✅ "Nuevo cliente"                              ← dialog title (create mode, unchanged)
✅ "Guardar"                                    ← submit button
✅ "Guardando..."                               ← submit button while pending
✅ "Cancelar"                                   ← cancel button
✅ "Cliente actualizado correctamente"          ← success toast
✅ "El NIT/RUC ya está registrado"              ← 409 error on nit field
✅ "Nombre es requerido"                        ← validation error
✅ "NIT/RUC es requerido"                       ← validation error
✅ "Teléfono es requerido"                      ← validation error
✅ "Ciudad es requerida"                        ← validation error
❌ "Edit" / "Update" / "Save"                   ← FORBIDDEN
```

---

### Architecture Constraints (Non-Negotiable)

- **`PUT /api/v1/clientes/{id}` → 200 OK** with updated `ClienteDto` (not 204)
- **`DateTimeOffset.UtcNow`** for `entity.UpdatedAt` — never `DateTime.UtcNow`
- **NIT uniqueness on update**: allow same NIT as current entity (`existing.Id != command.Id` check)
- **`['clientes', id]` queryKey** — must invalidate both the list AND the single-item query
- **`Results.Problem(statusCode: 404)`** — not `Results.NotFound()`
- **`Results.Problem(statusCode: 409)`** — not `Results.Conflict()`
- **`Results.ValidationProblem`** — HTTP 422 with field-level dictionary
- **Assembly scanning** already active — do NOT add manual `AddScoped<IValidator<UpdateClienteCommand>>`
- **`getHttpStatus(error)`** — use shared utility from `@/shared/lib/httpError` for 409 detection
- **No Swagger** — Scalar only
- **`UseSnakeCaseNamingConvention()`** already active — do NOT call again

---

### Project Structure Notes

**Files to create/modify:**

```
backend/
├── src/
│   ├── SiesaAgents.Domain/Clientes/
│   │   └── Interfaces/IClienteRepository.cs          ← MODIFY: add UpdateAsync
│   ├── SiesaAgents.Infrastructure/Repositories/
│   │   └── ClienteRepository.cs                      ← MODIFY: implement UpdateAsync
│   ├── SiesaAgents.Application/Clientes/Commands/
│   │   ├── UpdateClienteCommand.cs                   ← NEW
│   │   ├── UpdateClienteRequest.cs                   ← NEW (body DTO)
│   │   ├── UpdateClienteCommandValidator.cs          ← NEW
│   │   ├── UpdateClienteResult.cs                    ← NEW
│   │   └── UpdateClienteCommandHandler.cs            ← NEW
│   └── SiesaAgents.API/
│       ├── Endpoints/ClienteEndpoints.cs             ← MODIFY: add PUT /{id}
│       └── Program.cs                               ← MODIFY: add UpdateClienteCommandHandler
└── tests/
    ├── SiesaAgents.UnitTests/Application/Clientes/
    │   └── UpdateClienteCommandHandlerTests.cs       ← NEW (4 tests)
    └── SiesaAgents.IntegrationTests/Clientes/
        └── ClienteEndpointsTests.cs                  ← MODIFY: add 3 PUT tests

frontend/
└── src/
    ├── modules/crm/clientes/
    │   ├── domain/IClienteRepository.ts              ← MODIFY: add UpdateClienteDto + update()
    │   ├── infrastructure/clienteApiRepository.ts    ← MODIFY: implement update()
    │   ├── application/
    │   │   ├── useUpdateCliente.ts                   ← NEW
    │   │   └── useUpdateCliente.test.ts              ← NEW
    │   └── presentation/
    │       ├── ClienteFormDialog.tsx                 ← MODIFY: add edit mode (clienteId + defaultValues props)
    │       ├── ClienteFormDialog.test.tsx            ← MODIFY: add useUpdateCliente mock + 2 edit-mode tests
    │       ├── ClienteDetailView.tsx                 ← MODIFY: add Editar button + lazy ClienteFormDialog
    │       └── ClienteDetailView.test.tsx            ← MODIFY: add Editar button test
    └── shared/lib/
        └── toast.ts                                  ← ALREADY EXISTS — do NOT recreate
```

---

### References

- Story 2.3 patterns (CreateClienteCommand, ClienteFormDialog, ClienteRepository, handler pattern): [`_bmad-output/implementation-artifacts/2-3-create-client.md`]
- Epic 2.4 AC: [`_bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md#Story 2.4`]
- Architecture — PUT → 200 OK + updated object: [`_bmad-output/planning-artifacts/architecture.md#Format Patterns`]
- Architecture — queryKeys `['clientes', id]`: [`_bmad-output/planning-artifacts/architecture.md#TanStack Query keys`]
- `getHttpStatus` utility: [`frontend/src/shared/lib/httpError.ts`]
- `toast` event-bus: [`frontend/src/shared/lib/toast.ts`]
- Dialog component: [`frontend/src/components/ui/dialog.tsx`]
- `ClienteDetailView` current state: [`frontend/src/modules/crm/clientes/presentation/ClienteDetailView.tsx`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- **NIT uniqueness comparison**: Changed `existing.Id != command.Id` → `existing.Id != entity.Id` in `UpdateClienteCommandHandler`. In production both are equivalent (EF returns entity with matching Id), but this allows unit tests to work correctly with `ClienteEntity.Id { get; private set; }`.
- **`mutateAsync` destructure**: Removed from `clienteId ? updateMutation : createMutation` destructure since `onSubmit` calls each mutation directly by name. Only `isPending` extracted for button state.
- All 5 backend files created in `SiesaAgents.Application/Clientes/Commands/`. No new packages needed — `AddValidatorsFromAssemblyContaining` auto-scans `UpdateClienteCommandValidator`.
- Frontend: `ClienteFormDialog` now supports both create and edit modes via optional `clienteId` + `defaultValues` props. Both hooks always called (rules of hooks compliance).

### File List

**Backend — New:**
- `backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteCommand.cs`
- `backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteCommandValidator.cs`
- `backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteResult.cs`
- `backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteCommandHandler.cs`
- `backend/src/SiesaAgents.Application/Clientes/Commands/UpdateClienteRequest.cs`
- `backend/tests/SiesaAgents.UnitTests/Application/Clientes/UpdateClienteCommandHandlerTests.cs`

**Backend — Modified:**
- `backend/src/SiesaAgents.Domain/Clientes/Interfaces/IClienteRepository.cs` (added `UpdateAsync`)
- `backend/src/SiesaAgents.Infrastructure/Repositories/ClienteRepository.cs` (implemented `UpdateAsync`)
- `backend/src/SiesaAgents.API/Endpoints/ClienteEndpoints.cs` (added PUT endpoint)
- `backend/src/SiesaAgents.API/Program.cs` (registered `UpdateClienteCommandHandler`)
- `backend/tests/SiesaAgents.IntegrationTests/Clientes/ClienteEndpointsTests.cs` (added 3 PUT tests)

**Frontend — New:**
- `frontend/src/modules/crm/clientes/application/useUpdateCliente.ts`
- `frontend/src/modules/crm/clientes/application/useUpdateCliente.test.ts`

**Frontend — Modified:**
- `frontend/src/modules/crm/clientes/domain/IClienteRepository.ts` (added `UpdateClienteDto` + `update()`)
- `frontend/src/modules/crm/clientes/infrastructure/clienteApiRepository.ts` (implemented `update()`)
- `frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.tsx` (added edit mode)
- `frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.test.tsx` (added mock + 2 tests)
- `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.tsx` (added Editar button + lazy dialog)
- `frontend/src/modules/crm/clientes/presentation/ClienteDetailView.test.tsx` (added Editar button test)
