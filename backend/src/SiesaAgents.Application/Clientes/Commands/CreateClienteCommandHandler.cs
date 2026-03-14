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
        if (existing is not null) return null;

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
