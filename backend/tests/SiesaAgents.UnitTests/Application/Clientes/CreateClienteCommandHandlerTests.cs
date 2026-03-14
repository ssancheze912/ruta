using NSubstitute;
using SiesaAgents.Application.Clientes.Commands;
using SiesaAgents.Domain.Clientes.Entities;
using SiesaAgents.Domain.Clientes.Interfaces;

namespace SiesaAgents.UnitTests.Application.Clientes;

public class CreateClienteCommandHandlerTests
{
    private readonly IClienteRepository _repository = Substitute.For<IClienteRepository>();
    private readonly CreateClienteCommandHandler _handler;

    public CreateClienteCommandHandlerTests()
    {
        _handler = new CreateClienteCommandHandler(_repository);
    }

    [Fact]
    public async Task HandleAsync_WithValidCommand_ReturnsClienteDto()
    {
        // Arrange
        var command = new CreateClienteCommand("Empresa X", "900-001-1", "3001234567", "Bogotá");
        _repository.FindByNitAsync(command.Nit, Arg.Any<CancellationToken>())
            .Returns((ClienteEntity?)null);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Empresa X", result.Nombre);
        Assert.Equal("900-001-1", result.Nit);
        Assert.Equal("3001234567", result.Telefono);
        Assert.Equal("Bogotá", result.Ciudad);
        Assert.NotEqual(Guid.Empty, result.Id);
        await _repository.Received(1).CreateAsync(Arg.Any<ClienteEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleAsync_WithDuplicateNit_ReturnsNull()
    {
        // Arrange
        var command = new CreateClienteCommand("Empresa Y", "900-001-1", "3007654321", "Medellín");
        _repository.FindByNitAsync(command.Nit, Arg.Any<CancellationToken>())
            .Returns(new ClienteEntity { Nombre = "Empresa X", Nit = "900-001-1" });

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task HandleAsync_WithDuplicateNit_DoesNotCallCreateAsync()
    {
        // Arrange
        var command = new CreateClienteCommand("Empresa Z", "900-001-1", "3001230000", "Cali");
        _repository.FindByNitAsync(command.Nit, Arg.Any<CancellationToken>())
            .Returns(new ClienteEntity { Nit = "900-001-1" });

        // Act
        await _handler.HandleAsync(command);

        // Assert
        await _repository.DidNotReceive().CreateAsync(Arg.Any<ClienteEntity>(), Arg.Any<CancellationToken>());
    }
}
