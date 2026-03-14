using NSubstitute;
using SiesaAgents.Application.Contactos.Queries;
using SiesaAgents.Domain.Contactos.Entities;
using SiesaAgents.Domain.Contactos.Interfaces;

namespace SiesaAgents.UnitTests.Application.Contactos;

public class GetContactoByIdQueryHandlerTests
{
    private readonly IContactoRepository _repository = Substitute.For<IContactoRepository>();
    private readonly GetContactoByIdQueryHandler _handler;

    public GetContactoByIdQueryHandlerTests()
    {
        _handler = new GetContactoByIdQueryHandler(_repository);
    }

    [Fact]
    public async Task HandleAsync_WhenContactoExists_ReturnsMappedDto()
    {
        // Arrange
        var clienteId = Guid.NewGuid();
        var entity = new ContactoEntity
        {
            Nombre = "Ana García",
            Cargo = "Gerente",
            Telefono = "3001234567",
            Email = "ana@empresa.com",
            ClienteId = clienteId,
        };
        _repository.GetByIdAsync(entity.Id, Arg.Any<CancellationToken>()).Returns(entity);

        // Act
        var result = await _handler.HandleAsync(new GetContactoByIdQuery(entity.Id));

        // Assert
        Assert.NotNull(result);
        Assert.Equal(entity.Id, result.Id);
        Assert.Equal("Ana García", result.Nombre);
        Assert.Equal("Gerente", result.Cargo);
        Assert.Equal("3001234567", result.Telefono);
        Assert.Equal("ana@empresa.com", result.Email);
        Assert.Equal(clienteId, result.ClienteId);
    }

    [Fact]
    public async Task HandleAsync_WhenContactoNotFound_ReturnsNull()
    {
        // Arrange
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((ContactoEntity?)null);

        // Act
        var result = await _handler.HandleAsync(new GetContactoByIdQuery(id));

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task HandleAsync_MapsAllFields_Correctly()
    {
        // Arrange
        var id = Guid.NewGuid();
        var entity = new ContactoEntity
        {
            Nombre = "Test User",
            Cargo = "Analista",
            Telefono = "+57 300 000 0000",
            Email = "test@test.com",
            ClienteId = null,
        };
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(entity);

        // Act
        var result = await _handler.HandleAsync(new GetContactoByIdQuery(id));

        // Assert
        Assert.NotNull(result);
        Assert.Equal(entity.Nombre, result.Nombre);
        Assert.Equal(entity.Cargo, result.Cargo);
        Assert.Equal(entity.Telefono, result.Telefono);
        Assert.Equal(entity.Email, result.Email);
        Assert.Null(result.ClienteId);
        Assert.Equal(entity.CreatedAt, result.CreatedAt);
        Assert.Equal(entity.UpdatedAt, result.UpdatedAt);
    }
}
