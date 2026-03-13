using NSubstitute;
using SiesaAgents.Application.Clientes.Queries;
using SiesaAgents.Domain.Clientes.Entities;
using SiesaAgents.Domain.Clientes.Interfaces;

namespace SiesaAgents.UnitTests.Application.Clientes;

public class GetClientesQueryHandlerTests
{
    private readonly IClienteRepository _repository = Substitute.For<IClienteRepository>();
    private readonly GetClientesQueryHandler _handler;

    public GetClientesQueryHandlerTests()
    {
        _handler = new GetClientesQueryHandler(_repository);
    }

    [Fact]
    public async Task HandleAsync_WhenClientsExist_ReturnsMappedDtos()
    {
        // Arrange
        var clientes = new List<ClienteEntity>
        {
            new() { Nombre = "Empresa A", Nit = "900111111-1", Telefono = "123", Ciudad = "Bogotá" },
            new() { Nombre = "Empresa B", Nit = "900222222-2", Telefono = null, Ciudad = null },
        };
        _repository.GetAllAsync(Arg.Any<CancellationToken>()).Returns(clientes);

        // Act
        var result = (await _handler.HandleAsync(new GetClientesQuery())).ToList();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Equal("Empresa A", result[0].Nombre);
        Assert.Equal("900111111-1", result[0].Nit);
        Assert.Equal("Bogotá", result[0].Ciudad);
        Assert.Equal("Empresa B", result[1].Nombre);
        Assert.Null(result[1].Ciudad);
    }

    [Fact]
    public async Task HandleAsync_WhenNoClients_ReturnsEmptyList()
    {
        // Arrange
        _repository.GetAllAsync(Arg.Any<CancellationToken>()).Returns([]);

        // Act
        var result = (await _handler.HandleAsync(new GetClientesQuery())).ToList();

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public async Task HandleAsync_MapsAllFields_Correctly()
    {
        // Arrange
        var entity = new ClienteEntity
        {
            Nombre = "Test Corp",
            Nit = "800999999-9",
            Telefono = "+57 1 555 0000",
            Ciudad = "Medellín"
        };
        _repository.GetAllAsync(Arg.Any<CancellationToken>()).Returns([entity]);

        // Act
        var result = (await _handler.HandleAsync(new GetClientesQuery())).Single();

        // Assert
        Assert.Equal(entity.Id, result.Id);
        Assert.Equal(entity.Nombre, result.Nombre);
        Assert.Equal(entity.Nit, result.Nit);
        Assert.Equal(entity.Telefono, result.Telefono);
        Assert.Equal(entity.Ciudad, result.Ciudad);
        Assert.Equal(entity.CreatedAt, result.CreatedAt);
        Assert.Equal(entity.UpdatedAt, result.UpdatedAt);
    }
}
