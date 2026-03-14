using Microsoft.AspNetCore.Http;
using SiesaAgents.Application.Clientes.DTOs;
using SiesaAgents.Application.Clientes.Queries;

namespace SiesaAgents.API.Endpoints;

public static class ClienteEndpoints
{
    public static RouteGroupBuilder MapClienteEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/clientes", async (GetClientesQueryHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new GetClientesQuery(), ct);
            return Results.Ok(result);
        })
        .WithName("GetClientes")
        .WithSummary("Lista todos los clientes");

        group.MapGet("/clientes/{id:guid}", async (
            Guid id,
            GetClienteByIdQueryHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new GetClienteByIdQuery(id), ct);
            return result is null
                ? Results.Problem(statusCode: StatusCodes.Status404NotFound, title: "Not Found", detail: "Cliente not found")
                : Results.Ok(result);
        })
        .WithName("GetClienteById")
        .WithSummary("Obtiene un cliente por ID")
        .Produces<ClienteDto>()
        .ProducesProblem(StatusCodes.Status404NotFound);

        return group;
    }
}
