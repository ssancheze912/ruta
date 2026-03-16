using SiesaAgents.Domain.Clientes.Interfaces;
using SiesaAgents.Domain.Contactos.Interfaces;

namespace SiesaAgents.Application.Clientes.Commands;

public class DeleteClienteCommandHandler(
    IClienteRepository clienteRepository,
    IContactoRepository contactoRepository)
{
    public async Task<DeleteClienteResult> HandleAsync(
        DeleteClienteCommand command, CancellationToken ct = default)
    {
        // Count contacts before deleting — after delete the DB cascade nulls clienteId,
        // making a post-delete count always return 0.
        var contactosCount = await contactoRepository.CountByClienteIdAsync(command.Id, ct);
        var deleted = await clienteRepository.DeleteAsync(command.Id, ct);

        if (!deleted) return DeleteClienteResult.NotFound();

        return DeleteClienteResult.Success(contactosCount);
    }
}
