namespace SiesaAgents.Domain.Contactos.Entities;

public class ContactoEntity
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Nombre { get; set; } = string.Empty;
    public string Cargo { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Guid? ClienteId { get; set; }
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; private set; } = DateTimeOffset.UtcNow;

    public void Update(string nombre, string cargo, string telefono, string email, Guid? clienteId)
    {
        Nombre = nombre;
        Cargo = cargo;
        Telefono = telefono;
        Email = email;
        ClienteId = clienteId;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void AssignCliente(Guid? clienteId)
    {
        ClienteId = clienteId;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
