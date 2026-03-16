using NSubstitute;
using SiesaAgents.Application.Contactos.Queries;
using SiesaAgents.Domain.Contactos.Entities;
using SiesaAgents.Domain.Contactos.Interfaces;

namespace SiesaAgents.UnitTests.Application.Contactos;

public class GetContactosQueryHandlerTests
{
    private readonly IContactoRepository _repository = Substitute.For<IContactoRepository>();
    private readonly GetContactosQueryHandler _handler;

    public GetContactosQueryHandlerTests()
    {
        _handler = new GetContactosQueryHandler(_repository);
    }

    [Fact]
    public async Task HandleAsync_WhenContactosExist_ReturnsMappedDtos()
    {
        // Arrange
        var contactos = new List<ContactoEntity>
        {
            new() { Nombre = "Ana García", Cargo = "Gerente", Telefono = "300111", Email = "ana@emp.com", ClienteId = Guid.NewGuid() },
            new() { Nombre = "Carlos López", Cargo = "Comercial", Telefono = "300222", Email = "carlos@free.com", ClienteId = null },
        };
        _repository.GetAllAsync(Arg.Any<CancellationToken>()).Returns(contactos);

        // Act
        var result = (await _handler.HandleAsync(new GetContactosQuery())).ToList();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Equal("Ana García", result[0].Nombre);
        Assert.Equal("Gerente", result[0].Cargo);
        Assert.Equal("ana@emp.com", result[0].Email);
        Assert.NotNull(result[0].ClienteId);
        Assert.Equal("Carlos López", result[1].Nombre);
        Assert.Null(result[1].ClienteId);
    }

    [Fact]
    public async Task HandleAsync_WhenNoContactos_ReturnsEmptyList()
    {
        // Arrange
        _repository.GetAllAsync(Arg.Any<CancellationToken>()).Returns([]);

        // Act
        var result = (await _handler.HandleAsync(new GetContactosQuery())).ToList();

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public async Task HandleAsync_MapsAllFields_Correctly()
    {
        // Arrange
        var clienteId = Guid.NewGuid();
        var entity = new ContactoEntity
        {
            Nombre = "Test User",
            Cargo = "Analista",
            Telefono = "+57 300 000 0000",
            Email = "test@test.com",
            ClienteId = clienteId,
        };
        _repository.GetAllAsync(Arg.Any<CancellationToken>()).Returns([entity]);

        // Act
        var result = (await _handler.HandleAsync(new GetContactosQuery())).Single();

        // Assert
        Assert.Equal(entity.Id, result.Id);
        Assert.Equal(entity.Nombre, result.Nombre);
        Assert.Equal(entity.Cargo, result.Cargo);
        Assert.Equal(entity.Telefono, result.Telefono);
        Assert.Equal(entity.Email, result.Email);
        Assert.Equal(clienteId, result.ClienteId);
        Assert.Equal(entity.CreatedAt, result.CreatedAt);
        Assert.Equal(entity.UpdatedAt, result.UpdatedAt);
    }

    [Fact]
    public async Task HandleAsync_ContactoSinCliente_HasNullClienteId()
    {
        // Arrange
        var entity = new ContactoEntity
        {
            Nombre = "Contacto Libre",
            Cargo = "Freelance",
            Telefono = "300000000",
            Email = "libre@email.com",
            ClienteId = null,
        };
        _repository.GetAllAsync(Arg.Any<CancellationToken>()).Returns([entity]);

        // Act
        var result = (await _handler.HandleAsync(new GetContactosQuery())).Single();

        // Assert
        Assert.Null(result.ClienteId);
    }

    [Fact]
    public async Task HandleAsync_WithClienteId_CallsGetByClienteIdAsync()
    {
        // Arrange
        var clienteId = Guid.NewGuid();
        var contactos = new List<ContactoEntity>
        {
            new() { Nombre = "Contacto A", Cargo = "Gerente", Telefono = "300111", Email = "a@emp.com", ClienteId = clienteId },
            new() { Nombre = "Contacto B", Cargo = "Analista", Telefono = "300222", Email = "b@emp.com", ClienteId = clienteId },
        };
        _repository.GetByClienteIdAsync(clienteId, Arg.Any<CancellationToken>()).Returns(contactos);

        // Act
        var result = (await _handler.HandleAsync(new GetContactosQuery(clienteId))).ToList();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.All(result, r => Assert.Equal(clienteId, r.ClienteId));
        await _repository.Received(1).GetByClienteIdAsync(clienteId, Arg.Any<CancellationToken>());
        await _repository.DidNotReceive().GetAllAsync(Arg.Any<CancellationToken>());
    }
}
