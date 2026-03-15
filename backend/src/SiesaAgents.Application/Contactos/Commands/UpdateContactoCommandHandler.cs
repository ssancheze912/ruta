using SiesaAgents.Application.Contactos.DTOs;
using SiesaAgents.Domain.Contactos.Interfaces;

namespace SiesaAgents.Application.Contactos.Commands;

public class UpdateContactoCommandHandler(IContactoRepository repository)
{
    public async Task<ContactoDto?> HandleAsync(UpdateContactoCommand command, CancellationToken ct = default)
    {
        var updated = await repository.UpdateAsync(
            command.Id, command.Nombre, command.Cargo, command.Telefono, command.Email, ct);

        if (updated is null) return null;

        return new ContactoDto(
            updated.Id, updated.Nombre, updated.Cargo, updated.Telefono,
            updated.Email, updated.ClienteId, updated.CreatedAt, updated.UpdatedAt);
    }
}
