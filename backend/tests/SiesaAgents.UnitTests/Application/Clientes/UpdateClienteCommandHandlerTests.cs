using NSubstitute;
using SiesaAgents.Application.Clientes.Commands;
using SiesaAgents.Domain.Clientes.Entities;
using SiesaAgents.Domain.Clientes.Interfaces;

namespace SiesaAgents.UnitTests.Application.Clientes;

public class UpdateClienteCommandHandlerTests
{
    private readonly IClienteRepository _repository = Substitute.For<IClienteRepository>();
    private readonly UpdateClienteCommandHandler _handler;

    public UpdateClienteCommandHandlerTests()
    {
        _handler = new UpdateClienteCommandHandler(_repository);
    }

    [Fact]
    public async Task HandleAsync_WithValidCommand_ReturnsSuccess()
    {
        var id = Guid.NewGuid();
        var command = new UpdateClienteCommand(id, "Empresa Nueva", "900-001-1", "3001234567", "Bogotá");
        var existingEntity = new ClienteEntity { Nombre = "Empresa Vieja", Nit = "900-001-1" };
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(existingEntity);
        _repository.FindByNitAsync(command.Nit, Arg.Any<CancellationToken>()).Returns(existingEntity);

        var result = await _handler.HandleAsync(command);

        Assert.False(result.IsNotFound);
        Assert.False(result.IsNitConflict);
        Assert.NotNull(result.Dto);
        Assert.Equal("Empresa Nueva", result.Dto!.Nombre);
        await _repository.Received(1).UpdateAsync(Arg.Any<ClienteEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentId_ReturnsNotFound()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((ClienteEntity?)null);

        var result = await _handler.HandleAsync(new UpdateClienteCommand(id, "X", "Y", "Z", "W"));

        Assert.True(result.IsNotFound);
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<ClienteEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleAsync_WithNitBelongingToDifferentClient_ReturnsNitConflict()
    {
        var currentId = Guid.NewGuid();
        var command = new UpdateClienteCommand(currentId, "Empresa A", "nit-dup", "300", "Cali");
        var currentEntity = new ClienteEntity { Nit = "old-nit" };
        var otherEntity = new ClienteEntity { Nit = "nit-dup" };
        _repository.GetByIdAsync(currentId, Arg.Any<CancellationToken>()).Returns(currentEntity);
        _repository.FindByNitAsync("nit-dup", Arg.Any<CancellationToken>()).Returns(otherEntity);

        var result = await _handler.HandleAsync(command);

        Assert.True(result.IsNitConflict);
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<ClienteEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleAsync_WithSameNitAsCurrentClient_ReturnsSuccess()
    {
        var id = Guid.NewGuid();
        var command = new UpdateClienteCommand(id, "Empresa A", "same-nit", "300", "Medellín");
        var entity = new ClienteEntity { Nit = "same-nit" };
        // Same instance returned by both queries → existing.Id == entity.Id → no conflict
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(entity);
        _repository.FindByNitAsync("same-nit", Arg.Any<CancellationToken>()).Returns(entity);

        var result = await _handler.HandleAsync(command);

        Assert.False(result.IsNitConflict);
        Assert.False(result.IsNotFound);
    }
}
