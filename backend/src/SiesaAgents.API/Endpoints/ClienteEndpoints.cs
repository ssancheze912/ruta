using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SiesaAgents.Application.Clientes.Commands;
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

        group.MapPost("/clientes", async (
            CreateClienteCommand command,
            IValidator<CreateClienteCommand> validator,
            CreateClienteCommandHandler handler,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(command, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await handler.HandleAsync(command, ct);
            if (result is null)
                return Results.Problem(
                    statusCode: StatusCodes.Status409Conflict,
                    title: "Conflict",
                    detail: "El NIT/RUC ya está registrado.");

            return Results.Created($"/api/v1/clientes/{result.Id}", result);
        })
        .WithName("CreateCliente")
        .WithSummary("Crea un nuevo cliente")
        .Produces<ClienteDto>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status409Conflict)
        .ProducesValidationProblem();

        group.MapPut("/clientes/{id:guid}", async (
            Guid id,
            UpdateClienteRequest request,
            IValidator<UpdateClienteCommand> validator,
            UpdateClienteCommandHandler handler,
            CancellationToken ct) =>
        {
            var command = new UpdateClienteCommand(
                id, request.Nombre, request.Nit, request.Telefono, request.Ciudad);

            var validation = await validator.ValidateAsync(command, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await handler.HandleAsync(command, ct);

            if (result.IsNotFound)
                return Results.Problem(
                    statusCode: StatusCodes.Status404NotFound,
                    title: "Not Found",
                    detail: "Cliente no encontrado.");

            if (result.IsNitConflict)
                return Results.Problem(
                    statusCode: StatusCodes.Status409Conflict,
                    title: "Conflict",
                    detail: "El NIT/RUC ya está registrado.");

            return Results.Ok(result.Dto);
        })
        .WithName("UpdateCliente")
        .WithSummary("Actualiza un cliente existente")
        .Produces<ClienteDto>()
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status409Conflict)
        .ProducesValidationProblem();

        group.MapDelete("/clientes/{id:guid}", async (
            Guid id,
            DeleteClienteCommandHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new DeleteClienteCommand(id), ct);

            if (result.IsNotFound)
                return Results.Problem(
                    statusCode: StatusCodes.Status404NotFound,
                    title: "Not Found",
                    detail: "Cliente no encontrado.");

            return Results.Ok(new { contactosDesasociados = result.ContactosDesasociados });
        })
        .WithName("DeleteCliente")
        .WithSummary("Elimina un cliente y desasocia sus contactos")
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound);

        return group;
    }
}
