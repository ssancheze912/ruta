namespace SiesaAgents.Application.Clientes.Commands;

public sealed record DeleteClienteResult
{
    public bool IsNotFound { get; private init; }
    /// <summary>Number of contacts disassociated. Only meaningful when <see cref="IsNotFound"/> is false.</summary>
    public int ContactosDesasociados { get; private init; }

    public static DeleteClienteResult NotFound() => new() { IsNotFound = true };
    public static DeleteClienteResult Success(int contactosDesasociados) =>
        new() { ContactosDesasociados = contactosDesasociados };
}
