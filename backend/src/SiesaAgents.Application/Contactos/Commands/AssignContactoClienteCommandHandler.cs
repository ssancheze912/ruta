using SiesaAgents.Application.Contactos.DTOs;
using SiesaAgents.Domain.Clientes.Interfaces;
using SiesaAgents.Domain.Contactos.Interfaces;

namespace SiesaAgents.Application.Contactos.Commands;

public class AssignContactoClienteCommandHandler(
    IContactoRepository contactoRepository,
    IClienteRepository clienteRepository)
{
    public async Task<ContactoDto?> HandleAsync(AssignContactoClienteCommand command, CancellationToken ct = default)
    {
        if (command.ClienteId.HasValue)
        {
            var cliente = await clienteRepository.GetByIdAsync(command.ClienteId.Value, ct);
            if (cliente is null) return null;
        }

        var contacto = await contactoRepository.AssignClienteAsync(command.ContactoId, command.ClienteId, ct);
        if (contacto is null) return null;

        return new ContactoDto(
            contacto.Id,
            contacto.Nombre,
            contacto.Cargo,
            contacto.Telefono,
            contacto.Email,
            contacto.ClienteId,
            contacto.CreatedAt,
            contacto.UpdatedAt);
    }
}
