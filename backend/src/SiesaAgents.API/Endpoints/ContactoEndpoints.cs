using FluentValidation;
using SiesaAgents.Application.Contactos.Commands;
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
                ? Results.Problem(statusCode: StatusCodes.Status404NotFound, title: "Not Found", detail: "Contacto no encontrado.")
                : Results.Ok(result);
        })
        .WithName("GetContactoById")
        .WithSummary("Obtiene un contacto por ID")
        .Produces<ContactoDto>()
        .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapPost("/contactos", async (
            CreateContactoRequest request,
            IValidator<CreateContactoRequest> validator,
            CreateContactoCommandHandler handler,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await handler.HandleAsync(
                new CreateContactoCommand(request.Nombre, request.Cargo, request.Telefono, request.Email), ct);

            return Results.Created($"/api/v1/contactos/{result.Id}", result);
        })
        .WithName("CreateContacto")
        .WithSummary("Crea un nuevo contacto")
        .Produces<ContactoDto>(StatusCodes.Status201Created)
        .ProducesValidationProblem();

        return group;
    }
}
