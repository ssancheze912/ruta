using SiesaAgents.Application.Contactos.DTOs;
using SiesaAgents.Domain.Contactos.Interfaces;

namespace SiesaAgents.Application.Contactos.Queries;

public class GetContactoByIdQueryHandler(IContactoRepository repository)
{
    public async Task<ContactoDto?> HandleAsync(
        GetContactoByIdQuery query, CancellationToken ct = default)
    {
        var contacto = await repository.GetByIdAsync(query.Id, ct);
        if (contacto is null) return null;

        return new ContactoDto(
            contacto.Id, contacto.Nombre, contacto.Cargo, contacto.Telefono,
            contacto.Email, contacto.ClienteId, contacto.CreatedAt, contacto.UpdatedAt);
    }
}
