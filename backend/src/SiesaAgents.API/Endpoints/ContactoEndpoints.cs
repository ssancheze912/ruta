using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SiesaAgents.Application.Contactos.Commands;
using SiesaAgents.Application.Contactos.DTOs;
using SiesaAgents.Application.Contactos.Queries;

namespace SiesaAgents.API.Endpoints;

public static class ContactoEndpoints
{
    public static RouteGroupBuilder MapContactoEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/contactos", async (
            [FromQuery] Guid? clienteId,
            GetContactosQueryHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new GetContactosQuery(clienteId), ct);
            return Results.Ok(result);
        })
        .WithName("GetContactos")
        .WithSummary("Lista todos los contactos, con filtro opcional por clienteId")
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

        group.MapPut("/contactos/{id:guid}", async (
            Guid id,
            UpdateContactoRequest request,
            IValidator<UpdateContactoRequest> validator,
            UpdateContactoCommandHandler handler,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await handler.HandleAsync(
                new UpdateContactoCommand(id, request.Nombre, request.Cargo, request.Telefono, request.Email), ct);

            return result is null
                ? Results.Problem(statusCode: StatusCodes.Status404NotFound, title: "Not Found", detail: "Contacto no encontrado.")
                : Results.Ok(result);
        })
        .WithName("UpdateContacto")
        .WithSummary("Actualiza un contacto existente")
        .Produces<ContactoDto>()
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesValidationProblem();

        group.MapDelete("/contactos/{id:guid}", async (
            Guid id,
            DeleteContactoCommandHandler handler,
            CancellationToken ct) =>
        {
            var deleted = await handler.HandleAsync(new DeleteContactoCommand(id), ct);
            return deleted
                ? Results.NoContent()
                : Results.Problem(statusCode: StatusCodes.Status404NotFound, title: "Not Found", detail: "Contacto no encontrado.");
        })
        .WithName("DeleteContacto")
        .WithSummary("Elimina un contacto")
        .Produces(StatusCodes.Status204NoContent)
        .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapPut("/contactos/{id:guid}/cliente", async (
            Guid id,
            [FromBody] AssignContactoClienteRequest request,
            IValidator<AssignContactoClienteRequest> validator,
            AssignContactoClienteCommandHandler handler,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await handler.HandleAsync(new AssignContactoClienteCommand(id, request.ClienteId), ct);
            return result is null
                ? Results.Problem(statusCode: StatusCodes.Status404NotFound, title: "Not Found", detail: "Contacto o cliente no encontrado.")
                : Results.Ok(result);
        })
        .WithName("AssignContactoCliente")
        .WithSummary("Asigna o desasigna el cliente de un contacto (clienteId: uuid | null)")
        .Produces<ContactoDto>()
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesValidationProblem();

        return group;
    }
}
