using NSubstitute;
using SiesaAgents.Application.Contactos.Commands;
using SiesaAgents.Domain.Contactos.Entities;
using SiesaAgents.Domain.Contactos.Interfaces;

namespace SiesaAgents.UnitTests.Application.Contactos;

public class CreateContactoCommandHandlerTests
{
    private readonly IContactoRepository _repository = Substitute.For<IContactoRepository>();
    private readonly CreateContactoCommandHandler _handler;

    public CreateContactoCommandHandlerTests()
    {
        _handler = new CreateContactoCommandHandler(_repository);
    }

    [Fact]
    public async Task HandleAsync_WithValidCommand_ReturnsContactoDto()
    {
        var command = new CreateContactoCommand("Ana García", "Analista", "3001234567", "ana@test.com");

        _repository.CreateAsync(Arg.Any<ContactoEntity>(), Arg.Any<CancellationToken>())
            .Returns(call =>
            {
                var entity = call.Arg<ContactoEntity>();
                return entity;
            });

        var result = await _handler.HandleAsync(command);

        Assert.NotNull(result);
        Assert.Equal("Ana García", result.Nombre);
        Assert.Equal("Analista", result.Cargo);
        Assert.Equal("3001234567", result.Telefono);
        Assert.Equal("ana@test.com", result.Email);
        Assert.Null(result.ClienteId);
    }

    [Fact]
    public async Task HandleAsync_MapsAllFields_ToEntity()
    {
        var command = new CreateContactoCommand("Juan Pérez", "Gerente", "3009876543", "juan@empresa.co");
        ContactoEntity? captured = null;

        _repository.CreateAsync(Arg.Do<ContactoEntity>(e => captured = e), Arg.Any<CancellationToken>())
            .Returns(call => call.Arg<ContactoEntity>());

        await _handler.HandleAsync(command);

        Assert.NotNull(captured);
        Assert.Equal("Juan Pérez", captured.Nombre);
        Assert.Equal("Gerente", captured.Cargo);
        Assert.Equal("3009876543", captured.Telefono);
        Assert.Equal("juan@empresa.co", captured.Email);
        Assert.Null(captured.ClienteId);
    }

    [Fact]
    public async Task HandleAsync_ReturnsDto_WithTimestamps()
    {
        var command = new CreateContactoCommand("Carlos López", "Director", "3001111111", "carlos@test.com");

        _repository.CreateAsync(Arg.Any<ContactoEntity>(), Arg.Any<CancellationToken>())
            .Returns(call => call.Arg<ContactoEntity>());

        var result = await _handler.HandleAsync(command);

        Assert.NotEqual(default, result.CreatedAt);
        Assert.NotEqual(default, result.UpdatedAt);
    }
}
