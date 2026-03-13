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

        return group;
    }
}
