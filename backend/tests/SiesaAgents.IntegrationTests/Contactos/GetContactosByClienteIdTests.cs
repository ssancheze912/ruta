using System.Net;
using System.Net.Http.Json;
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

public class GetContactosByClienteIdTests : IAsyncLifetime
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

    private static async Task SeedContactoAsync(
        WebApplicationFactory<Program> factory,
        string nombre,
        Guid? clienteId)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Contactos.Add(new ContactoEntity
        {
            Nombre = nombre,
            Cargo = "Cargo",
            Telefono = "123456",
            Email = $"{nombre.ToLower().Replace(" ", "")}@test.com",
            ClienteId = clienteId,
        });
        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task GetContactos_WithClienteIdFilter_ReturnsOnlyMatchingContactos()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        var clienteIdA = await SeedClienteAsync(factory);
        var clienteIdB = await SeedClienteAsync(factory);

        await SeedContactoAsync(factory, "Contacto A1", clienteIdA);
        await SeedContactoAsync(factory, "Contacto A2", clienteIdA);
        await SeedContactoAsync(factory, "Contacto B1", clienteIdB);

        var client = factory.CreateClient();
        var response = await client.GetAsync($"/api/v1/contactos?clienteId={clienteIdA}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var contactos = JsonSerializer.Deserialize<List<ContactoDto>>(json, JsonOptions)!;

        Assert.Equal(2, contactos.Count);
        Assert.All(contactos, c => Assert.Equal(clienteIdA, c.ClienteId));
    }

    [Fact]
    public async Task GetContactos_WithClienteIdFilter_ReturnsEmptyArray_WhenNoneAssociated()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        var clienteId = await SeedClienteAsync(factory);
        var otherClienteId = await SeedClienteAsync(factory);
        await SeedContactoAsync(factory, "Otro Contacto", otherClienteId);

        var client = factory.CreateClient();
        var response = await client.GetAsync($"/api/v1/contactos?clienteId={clienteId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var contactos = JsonSerializer.Deserialize<List<ContactoDto>>(json, JsonOptions)!;
        Assert.Empty(contactos);
    }

    [Fact]
    public async Task GetContactos_WithoutFilter_ReturnsAllContactos()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        await SeedContactoAsync(factory, "Contacto 1", Guid.NewGuid());
        await SeedContactoAsync(factory, "Contacto 2", null);

        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/v1/contactos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var contactos = JsonSerializer.Deserialize<List<ContactoDto>>(json, JsonOptions)!;
        Assert.Equal(2, contactos.Count);
    }

    [Fact]
    public async Task GetContactosByCliente_AfterReassign_ReflectsNewAssignment()
    {
        // GIVEN: Two clients and one contact initially assigned to clienteA
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        var clienteIdA = await SeedClienteAsync(factory);
        var clienteIdB = await SeedClienteAsync(factory);

        Guid contactoId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var contacto = new ContactoEntity
            {
                Nombre = "Contacto Reasignar",
                Cargo = "Cargo",
                Telefono = "123456",
                Email = "reasignar@test.com",
                ClienteId = clienteIdA,
            };
            db.Contactos.Add(contacto);
            await db.SaveChangesAsync();
            contactoId = contacto.Id;
        }

        var client = factory.CreateClient();

        // WHEN: The contact is reassigned to clienteB
        var reassignResponse = await client.PutAsJsonAsync(
            $"/api/v1/contactos/{contactoId}/cliente",
            new { clienteId = clienteIdB });
        Assert.Equal(HttpStatusCode.OK, reassignResponse.StatusCode);

        // THEN: Old client's query no longer includes the contact
        var responseA = await client.GetAsync($"/api/v1/contactos?clienteId={clienteIdA}");
        Assert.Equal(HttpStatusCode.OK, responseA.StatusCode);
        var jsonA = await responseA.Content.ReadAsStringAsync();
        var contactosA = JsonSerializer.Deserialize<List<ContactoDto>>(jsonA, JsonOptions)!;
        Assert.DoesNotContain(contactosA, c => c.Id == contactoId);

        // AND: New client's query now includes the contact
        var responseB = await client.GetAsync($"/api/v1/contactos?clienteId={clienteIdB}");
        Assert.Equal(HttpStatusCode.OK, responseB.StatusCode);
        var jsonB = await responseB.Content.ReadAsStringAsync();
        var contactosB = JsonSerializer.Deserialize<List<ContactoDto>>(jsonB, JsonOptions)!;
        Assert.Contains(contactosB, c => c.Id == contactoId);
    }
}
