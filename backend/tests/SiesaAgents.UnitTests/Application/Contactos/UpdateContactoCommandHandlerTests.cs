using NSubstitute;
using SiesaAgents.Application.Contactos.Commands;
using SiesaAgents.Domain.Contactos.Entities;
using SiesaAgents.Domain.Contactos.Interfaces;

namespace SiesaAgents.UnitTests.Application.Contactos;

public class UpdateContactoCommandHandlerTests
{
    private readonly IContactoRepository _repository = Substitute.For<IContactoRepository>();
    private readonly UpdateContactoCommandHandler _handler;

    public UpdateContactoCommandHandlerTests()
    {
        _handler = new UpdateContactoCommandHandler(_repository);
    }

    [Fact]
    public async Task UpdateContacto_WhenFound_ReturnsMappedDto()
    {
        var id = Guid.NewGuid();
        var entity = new ContactoEntity
        {
            Nombre = "Ana García",
            Cargo = "Analista",
            Telefono = "3001234567",
            Email = "ana@test.com",
            ClienteId = null,
        };
        entity.Update("Ana Updated", "Senior Analista", "3009999999", "ana.updated@test.com", null);

        _repository.UpdateAsync(id, "Ana Updated", "Senior Analista", "3009999999", "ana.updated@test.com", Arg.Any<CancellationToken>())
            .Returns(entity);

        var command = new UpdateContactoCommand(id, "Ana Updated", "Senior Analista", "3009999999", "ana.updated@test.com");
        var result = await _handler.HandleAsync(command);

        Assert.NotNull(result);
        Assert.Equal("Ana Updated", result.Nombre);
        Assert.Equal("Senior Analista", result.Cargo);
        Assert.Equal("3009999999", result.Telefono);
        Assert.Equal("ana.updated@test.com", result.Email);
        Assert.NotEqual(Guid.Empty, result.Id);
    }

    [Fact]
    public async Task UpdateContacto_WhenNotFound_ReturnsNull()
    {
        var id = Guid.NewGuid();
        _repository.UpdateAsync(id, Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((ContactoEntity?)null);

        var command = new UpdateContactoCommand(id, "Nombre", "Cargo", "Telefono", "email@test.com");
        var result = await _handler.HandleAsync(command);

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateContacto_MapsCommandFieldsCorrectly()
    {
        var id = Guid.NewGuid();
        string? capturedNombre = null, capturedCargo = null, capturedTelefono = null, capturedEmail = null;
        Guid capturedId = Guid.Empty;

        _repository.UpdateAsync(
            Arg.Do<Guid>(v => capturedId = v),
            Arg.Do<string>(v => capturedNombre = v),
            Arg.Do<string>(v => capturedCargo = v),
            Arg.Do<string>(v => capturedTelefono = v),
            Arg.Do<string>(v => capturedEmail = v),
            Arg.Any<CancellationToken>())
            .Returns(new ContactoEntity
            {
                Nombre = "Test",
                Cargo = "Test",
                Telefono = "123",
                Email = "test@test.com",
            });

        var command = new UpdateContactoCommand(id, "Carlos López", "Director", "3001111111", "carlos@empresa.com");
        await _handler.HandleAsync(command);

        Assert.Equal(id, capturedId);
        Assert.Equal("Carlos López", capturedNombre);
        Assert.Equal("Director", capturedCargo);
        Assert.Equal("3001111111", capturedTelefono);
        Assert.Equal("carlos@empresa.com", capturedEmail);
    }
}
