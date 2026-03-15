using SiesaAgents.Application.Clientes.DTOs;

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
