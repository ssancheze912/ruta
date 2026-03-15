using NSubstitute;
using SiesaAgents.Application.Contactos.Commands;
using SiesaAgents.Domain.Contactos.Interfaces;

namespace SiesaAgents.UnitTests.Application.Contactos;

public class DeleteContactoCommandHandlerTests
{
    private readonly IContactoRepository _repository = Substitute.For<IContactoRepository>();
    private readonly DeleteContactoCommandHandler _handler;

    public DeleteContactoCommandHandlerTests()
    {
        _handler = new DeleteContactoCommandHandler(_repository);
    }

    [Fact]
    public async Task DeleteContacto_WhenFound_ReturnsTrue()
    {
        var id = Guid.NewGuid();
        _repository.DeleteAsync(id, Arg.Any<CancellationToken>()).Returns(true);

        var result = await _handler.HandleAsync(new DeleteContactoCommand(id));

        Assert.True(result);
    }

    [Fact]
    public async Task DeleteContacto_WhenNotFound_ReturnsFalse()
    {
        var id = Guid.NewGuid();
        _repository.DeleteAsync(id, Arg.Any<CancellationToken>()).Returns(false);

        var result = await _handler.HandleAsync(new DeleteContactoCommand(id));

        Assert.False(result);
    }

    [Fact]
    public async Task DeleteContacto_PassesCorrectIdToRepository()
    {
        var id = Guid.NewGuid();
        Guid capturedId = Guid.Empty;
        _repository.DeleteAsync(Arg.Do<Guid>(v => capturedId = v), Arg.Any<CancellationToken>())
            .Returns(true);

        await _handler.HandleAsync(new DeleteContactoCommand(id));

        Assert.Equal(id, capturedId);
    }
}
