using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SiesaAgents.Application.Contactos.DTOs;
using SiesaAgents.Domain.Clientes.Entities;
using SiesaAgents.Domain.Contactos.Entities;
using SiesaAgents.Infrastructure.Data;
using Testcontainers.PostgreSql;

namespace SiesaAgents.IntegrationTests.Contactos;

public class AssignContactoClienteTests : IAsyncLifetime
{
    private static readonly JsonSerializerOptions JsonOptions =
        new() { PropertyNameCaseInsensitive = true };

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .WithDatabase("siesa_test")
        .WithUsername("test")
        .WithPassword("test")
        .Build();

    public async Task InitializeAsync() => await _postgres.StartAsync();

    public async Task DisposeAsync() => await _postgres.DisposeAsync();

    private WebApplicationFactory<Program> CreateFactory()
    {
        return new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:DefaultConnection"] = _postgres.GetConnectionString(),
                });
            });
        });
    }

    private static async Task MigrateAsync(WebApplicationFactory<Program> factory)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
    }

    private static async Task<Guid> SeedClienteAsync(WebApplicationFactory<Program> factory)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var cliente = new ClienteEntity { Nombre = "Cliente Test", Nit = Guid.NewGuid().ToString("N")[..12] };
        db.Clientes.Add(cliente);
        await db.SaveChangesAsync();
        return cliente.Id;
    }

    private static async Task<Guid> SeedContactoAsync(WebApplicationFactory<Program> factory, Guid? clienteId = null)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var contacto = new ContactoEntity
        {
            Nombre = "Contacto Test",
            Cargo = "Dev",
            Telefono = "3001234567",
            Email = $"{Guid.NewGuid():N}@test.com",
            ClienteId = clienteId,
        };
        db.Contactos.Add(contacto);
        await db.SaveChangesAsync();
        return contacto.Id;
    }

    private static StringContent JsonBody(object obj) =>
        new(JsonSerializer.Serialize(obj), Encoding.UTF8, "application/json");

    [Fact]
    public async Task AssignContacto_WithValidClienteId_Returns200AndUpdatedContacto()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        var clienteId = await SeedClienteAsync(factory);
        var contactoId = await SeedContactoAsync(factory, clienteId: null);

        var client = factory.CreateClient();
        var response = await client.PutAsync(
            $"/api/v1/contactos/{contactoId}/cliente",
            JsonBody(new { clienteId }));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var dto = JsonSerializer.Deserialize<ContactoDto>(json, JsonOptions)!;
        Assert.Equal(contactoId, dto.Id);
        Assert.Equal(clienteId, dto.ClienteId);
    }

    [Fact]
    public async Task DisassociateContacto_WithNullClienteId_Returns200AndNullClienteId()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        var clienteId = await SeedClienteAsync(factory);
        var contactoId = await SeedContactoAsync(factory, clienteId: clienteId);

        var client = factory.CreateClient();
        var response = await client.PutAsync(
            $"/api/v1/contactos/{contactoId}/cliente",
            JsonBody(new { clienteId = (Guid?)null }));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var dto = JsonSerializer.Deserialize<ContactoDto>(json, JsonOptions)!;
        Assert.Equal(contactoId, dto.Id);
        Assert.Null(dto.ClienteId);
    }

    [Fact]
    public async Task AssignContacto_WithUnknownContactoId_Returns404()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        var clienteId = await SeedClienteAsync(factory);
        var unknownContactoId = Guid.NewGuid();

        var client = factory.CreateClient();
        var response = await client.PutAsync(
            $"/api/v1/contactos/{unknownContactoId}/cliente",
            JsonBody(new { clienteId }));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task AssignContacto_WithUnknownClienteId_Returns404()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        var contactoId = await SeedContactoAsync(factory, clienteId: null);
        var unknownClienteId = Guid.NewGuid();

        var client = factory.CreateClient();
        var response = await client.PutAsync(
            $"/api/v1/contactos/{contactoId}/cliente",
            JsonBody(new { clienteId = unknownClienteId }));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ReassignContacto_WithDifferentClienteId_Returns200AndUpdatesClienteId()
    {
        // GIVEN: Two clients and a contact assigned to clienteA
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        Guid clienteAId, clienteBId, contactoId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var clienteA = new ClienteEntity { Nombre = "Cliente A Reassign", Nit = "reassign-a-001" };
            var clienteB = new ClienteEntity { Nombre = "Cliente B Reassign", Nit = "reassign-b-001" };
            db.Clientes.Add(clienteA);
            db.Clientes.Add(clienteB);
            await db.SaveChangesAsync();
            clienteAId = clienteA.Id;
            clienteBId = clienteB.Id;

            var contacto = new ContactoEntity
            {
                Nombre = "Contacto Para Reasignar",
                Cargo = "Cargo Test",
                Telefono = "3001234567",
                Email = "reassign@test.com",
                ClienteId = clienteAId,
            };
            db.Contactos.Add(contacto);
            await db.SaveChangesAsync();
            contactoId = contacto.Id;
        }

        // WHEN: The contact is reassigned to clienteB
        var client = factory.CreateClient();
        var response = await client.PutAsync(
            $"/api/v1/contactos/{contactoId}/cliente",
            JsonBody(new { clienteId = clienteBId }));

        // THEN: 200 OK and dto.ClienteId reflects the new client
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var dto = JsonSerializer.Deserialize<ContactoDto>(json, JsonOptions);
        Assert.NotNull(dto);
        Assert.Equal(clienteBId, dto!.ClienteId);
        Assert.NotEqual(clienteAId, dto.ClienteId);
    }
}
