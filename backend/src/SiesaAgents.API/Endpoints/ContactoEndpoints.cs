using SiesaAgents.Application.Contactos.DTOs;
using SiesaAgents.Application.Contactos.Queries;

namespace SiesaAgents.API.Endpoints;

public static class ContactoEndpoints
{
    public static RouteGroupBuilder MapContactoEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/contactos", async (GetContactosQueryHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new GetContactosQuery(), ct);
            return Results.Ok(result);
        })
        .WithName("GetContactos")
        .WithSummary("Lista todos los contactos")
        .Produces<IEnumerable<ContactoDto>>();

        group.MapGet("/contactos/{id:guid}", async (
            Guid id,
            GetContactoByIdQueryHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new GetContactoByIdQuery(id), ct);
            return result is null
                ? Results.NotFound()
                : Results.Ok(result);
        })
        .WithName("GetContactoById")
        .WithSummary("Obtiene un contacto por ID")
        .Produces<ContactoDto>()
        .Produces(StatusCodes.Status404NotFound);

        return group;
    }
}
