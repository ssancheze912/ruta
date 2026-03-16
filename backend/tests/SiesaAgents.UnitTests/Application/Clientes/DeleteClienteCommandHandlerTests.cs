using NSubstitute;
using SiesaAgents.Application.Clientes.Commands;
using SiesaAgents.Domain.Clientes.Interfaces;
using SiesaAgents.Domain.Contactos.Interfaces;

namespace SiesaAgents.UnitTests.Application.Clientes;

public class DeleteClienteCommandHandlerTests
{
    private readonly IClienteRepository _clienteRepo = Substitute.For<IClienteRepository>();
    private readonly IContactoRepository _contactoRepo = Substitute.For<IContactoRepository>();
    private readonly DeleteClienteCommandHandler _handler;

    public DeleteClienteCommandHandlerTests()
    {
        _handler = new DeleteClienteCommandHandler(_clienteRepo, _contactoRepo);
    }

    [Fact]
    public async Task HandleAsync_WithExistingClientAndNoContacts_ReturnsSuccessWithZero()
    {
        var id = Guid.NewGuid();
        _contactoRepo.CountByClienteIdAsync(id, Arg.Any<CancellationToken>()).Returns(0);
        _clienteRepo.DeleteAsync(id, Arg.Any<CancellationToken>()).Returns(true);

        var result = await _handler.HandleAsync(new DeleteClienteCommand(id));

        Assert.False(result.IsNotFound);
        Assert.Equal(0, result.ContactosDesasociados);
        await _clienteRepo.Received(1).DeleteAsync(id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleAsync_WithExistingClientAndContacts_ReturnsSuccessWithCount()
    {
        var id = Guid.NewGuid();
        _contactoRepo.CountByClienteIdAsync(id, Arg.Any<CancellationToken>()).Returns(2);
        _clienteRepo.DeleteAsync(id, Arg.Any<CancellationToken>()).Returns(true);

        var result = await _handler.HandleAsync(new DeleteClienteCommand(id));

        Assert.False(result.IsNotFound);
        Assert.Equal(2, result.ContactosDesasociados);
        await _clienteRepo.Received(1).DeleteAsync(id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentId_ReturnsNotFound()
    {
        var id = Guid.NewGuid();
        _contactoRepo.CountByClienteIdAsync(id, Arg.Any<CancellationToken>()).Returns(0);
        _clienteRepo.DeleteAsync(id, Arg.Any<CancellationToken>()).Returns(false);

        var result = await _handler.HandleAsync(new DeleteClienteCommand(id));

        Assert.True(result.IsNotFound);
    }
}
