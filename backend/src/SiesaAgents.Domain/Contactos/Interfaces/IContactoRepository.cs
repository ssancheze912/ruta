using SiesaAgents.Domain.Contactos.Entities;

namespace SiesaAgents.Domain.Contactos.Interfaces;

public interface IContactoRepository
{
    Task<IEnumerable<ContactoEntity>> GetAllAsync(CancellationToken ct = default);
    Task<ContactoEntity?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ContactoEntity> CreateAsync(ContactoEntity entity, CancellationToken ct = default);
    Task<ContactoEntity?> UpdateAsync(Guid id, string nombre, string cargo, string telefono, string email, CancellationToken ct = default);
}
