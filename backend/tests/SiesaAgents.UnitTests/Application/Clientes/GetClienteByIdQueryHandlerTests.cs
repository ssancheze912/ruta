using NSubstitute;
using SiesaAgents.Application.Clientes.Queries;
using SiesaAgents.Domain.Clientes.Entities;
using SiesaAgents.Domain.Clientes.Interfaces;

namespace SiesaAgents.UnitTests.Application.Clientes;

public class GetClienteByIdQueryHandlerTests
{
    private readonly IClienteRepository _repository = Substitute.For<IClienteRepository>();
    private readonly GetClienteByIdQueryHandler _handler;

    public GetClienteByIdQueryHandlerTests()
    {
        _handler = new GetClienteByIdQueryHandler(_repository);
    }

    [Fact]
    public async Task HandleAsync_WhenClienteExists_ReturnsMappedDto()
    {
        // Arrange
        var entity = new ClienteEntity
        {
            Nombre = "Empresa X",
            Nit = "900000001-1",
            Telefono = "+57 1 234 5678",
            Ciudad = "Bogotá",
        };
        _repository.GetByIdAsync(entity.Id, Arg.Any<CancellationToken>()).Returns(entity);

        // Act
        var result = await _handler.HandleAsync(new GetClienteByIdQuery(entity.Id));

        // Assert
        Assert.NotNull(result);
        Assert.Equal(entity.Id, result.Id);
        Assert.Equal("Empresa X", result.Nombre);
        Assert.Equal("900000001-1", result.Nit);
        Assert.Equal("+57 1 234 5678", result.Telefono);
        Assert.Equal("Bogotá", result.Ciudad);
    }

    [Fact]
    public async Task HandleAsync_WhenClienteNotFound_ReturnsNull()
    {
        // Arrange
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((ClienteEntity?)null);

        // Act
        var result = await _handler.HandleAsync(new GetClienteByIdQuery(id));

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task HandleAsync_MapsAllFields_Correctly()
    {
        // Arrange
        var entity = new ClienteEntity
        {
            Nombre = "Test Corp",
            Nit = "800999999-9",
            Telefono = null,
            Ciudad = null,
        };
        _repository.GetByIdAsync(entity.Id, Arg.Any<CancellationToken>()).Returns(entity);

        // Act
        var result = await _handler.HandleAsync(new GetClienteByIdQuery(entity.Id));

        // Assert
        Assert.NotNull(result);
        Assert.Equal(entity.Id, result.Id);
        Assert.Equal(entity.Nombre, result.Nombre);
        Assert.Equal(entity.Nit, result.Nit);
        Assert.Null(result.Telefono);
        Assert.Null(result.Ciudad);
        Assert.Equal(entity.CreatedAt, result.CreatedAt);
        Assert.Equal(entity.UpdatedAt, result.UpdatedAt);
    }
}
