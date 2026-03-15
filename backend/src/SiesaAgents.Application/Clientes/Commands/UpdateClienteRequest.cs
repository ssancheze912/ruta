namespace SiesaAgents.Application.Clientes.Commands;

public record UpdateClienteRequest(
    string Nombre,
    string Nit,
    string Telefono,
    string Ciudad
);
