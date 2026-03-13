using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SiesaAgents.Domain.Clientes.Entities;
using SiesaAgents.Domain.Contactos.Entities;

namespace SiesaAgents.Infrastructure.Data.Configurations;

public class ContactoConfiguration : IEntityTypeConfiguration<ContactoEntity>
{
    public void Configure(EntityTypeBuilder<ContactoEntity> builder)
    {
        builder.ToTable("contactos");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Nombre).IsRequired().HasMaxLength(255);
        builder.Property(c => c.Cargo).IsRequired().HasMaxLength(255);
        builder.Property(c => c.Telefono).IsRequired().HasMaxLength(50);
        builder.Property(c => c.Email).IsRequired().HasMaxLength(255);
        builder.Property(c => c.ClienteId).IsRequired(false);
        builder.Property(c => c.CreatedAt).IsRequired();
        builder.Property(c => c.UpdatedAt).IsRequired();

        // FK → clientes.id — ON DELETE SET NULL (contactos huérfanos persisten per FR23)
        builder.HasOne<ClienteEntity>()
            .WithMany()
            .HasForeignKey(c => c.ClienteId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("fk_contactos_clientes");

        builder.HasIndex(c => c.ClienteId)
            .HasDatabaseName("ix_contactos_cliente_id");

        builder.HasIndex(c => c.Email)
            .HasDatabaseName("ix_contactos_email");
    }
}
