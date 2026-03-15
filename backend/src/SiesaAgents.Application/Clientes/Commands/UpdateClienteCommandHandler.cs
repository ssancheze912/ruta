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
        if (existing is not null && existing.Id != entity.Id)
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
