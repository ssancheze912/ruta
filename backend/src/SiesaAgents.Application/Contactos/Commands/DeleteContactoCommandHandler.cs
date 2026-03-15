using SiesaAgents.Domain.Contactos.Interfaces;

namespace SiesaAgents.Application.Contactos.Commands;

public class DeleteContactoCommandHandler(IContactoRepository repository)
{
    public async Task<bool> HandleAsync(DeleteContactoCommand command, CancellationToken ct = default)
    {
        return await repository.DeleteAsync(command.Id, ct);
    }
}
