using Microsoft.EntityFrameworkCore;
using SiesaAgents.Domain.Clientes.Entities;
using SiesaAgents.Domain.Clientes.Interfaces;
using SiesaAgents.Infrastructure.Data;

namespace SiesaAgents.Infrastructure.Repositories;

public class ClienteRepository(AppDbContext context) : IClienteRepository
{
    public async Task<IEnumerable<ClienteEntity>> GetAllAsync(CancellationToken ct = default)
    {
        return await context.Clientes.ToListAsync(ct);
    }

    public async Task<ClienteEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Clientes
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public async Task<ClienteEntity?> FindByNitAsync(string nit, CancellationToken ct = default)
    {
        return await context.Clientes
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Nit == nit, ct);
    }

    public async Task CreateAsync(ClienteEntity entity, CancellationToken ct = default)
    {
        context.Clientes.Add(entity);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ClienteEntity entity, CancellationToken ct = default)
    {
        context.Clientes.Update(entity);
        await context.SaveChangesAsync(ct);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await context.Clientes.FindAsync([id], ct);
        if (entity is null) return false;
        context.Clientes.Remove(entity);
        await context.SaveChangesAsync(ct);
        return true;
    }
}
