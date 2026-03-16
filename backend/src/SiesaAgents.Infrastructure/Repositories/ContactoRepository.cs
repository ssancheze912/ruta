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

    public async Task<ContactoEntity> CreateAsync(ContactoEntity entity, CancellationToken ct = default)
    {
        context.Contactos.Add(entity);
        await context.SaveChangesAsync(ct);
        return entity;
    }

    public async Task<ContactoEntity?> UpdateAsync(Guid id, string nombre, string cargo, string telefono, string email, CancellationToken ct = default)
    {
        var entity = await context.Contactos.FindAsync([id], ct);
        if (entity is null) return null;
        entity.Update(nombre, cargo, telefono, email, entity.ClienteId);
        await context.SaveChangesAsync(ct);
        return entity;
    }

    public async Task<IEnumerable<ContactoEntity>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
    {
        return await context.Contactos
            .AsNoTracking()
            .Where(c => c.ClienteId == clienteId)
            .ToListAsync(ct);
    }

    public async Task<int> CountByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
    {
        return await context.Contactos.CountAsync(c => c.ClienteId == clienteId, ct);
    }

    public async Task<ContactoEntity?> AssignClienteAsync(Guid id, Guid? clienteId, CancellationToken ct = default)
    {
        var entity = await context.Contactos.FindAsync([id], ct);
        if (entity is null) return null;
        entity.AssignCliente(clienteId);
        await context.SaveChangesAsync(ct);
        return entity;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await context.Contactos.FindAsync([id], ct);
        if (entity is null) return false;
        context.Contactos.Remove(entity);
        await context.SaveChangesAsync(ct);
        return true;
    }
}
