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
            Nombre   = command.Nombre,
            Cargo    = command.Cargo,
            Telefono = command.Telefono,
            Email    = command.Email,
            ClienteId = null,
        };

        var created = await repository.CreateAsync(entity, ct);

        return new ContactoDto(
            created.Id, created.Nombre, created.Cargo, created.Telefono,
            created.Email, created.ClienteId, created.CreatedAt, created.UpdatedAt);
    }
}
