using Microsoft.EntityFrameworkCore;
using SiesaAgents.Domain.Contactos.Entities;
using SiesaAgents.Domain.Contactos.Interfaces;
using SiesaAgents.Infrastructure.Data;

namespace SiesaAgents.Infrastructure.Repositories;

public class ContactoRepository(AppDbContext context) : IContactoRepository
{
    public async Task<IEnumerable<ContactoEntity>> GetAllAsync(CancellationToken ct = default)
    {
        return await context.Contactos.AsNoTracking().ToListAsync(ct);
    }

    public async Task<ContactoEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Contactos.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct);
    }
}
