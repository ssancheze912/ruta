using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SiesaAgents.Application.Clientes.DTOs;
using SiesaAgents.Domain.Clientes.Entities;
using SiesaAgents.Domain.Contactos.Entities;
using SiesaAgents.Infrastructure.Data;
using Testcontainers.PostgreSql;

namespace SiesaAgents.IntegrationTests.Clientes;

public class ClienteEndpointsTests : IAsyncLifetime
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

    /// <summary>
    /// Creates a WebApplicationFactory pointing at the TestContainers PostgreSQL instance.
    /// Overrides the connection string so Program.cs uses the test database.
    /// EF Core migrations are run before each test to ensure schema is up-to-date.
    /// </summary>
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

    [Fact]
    public async Task GetClientes_WhenEmpty_Returns200WithEmptyArray()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/clientes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var clientes = JsonSerializer.Deserialize<List<ClienteDto>>(json, JsonOptions);
        Assert.NotNull(clientes);
        Assert.Empty(clientes);
    }

    [Fact]
    public async Task GetClientes_WhenClientsExist_ReturnsCorrectShape()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        // Seed via EF Core using the factory's service scope
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Clientes.Add(new ClienteEntity
            {
                Nombre = "Empresa Test",
                Nit = "900000099-9",
                Ciudad = "Cali",
                Telefono = "+57 1 000 0000",
            });
            await db.SaveChangesAsync();
        }

        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/v1/clientes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var clientes = JsonSerializer.Deserialize<List<ClienteDto>>(json, JsonOptions);
        Assert.NotNull(clientes);
        var found = clientes.FirstOrDefault(c => c.Nit == "900000099-9");
        Assert.NotNull(found);
        Assert.Equal("Empresa Test", found.Nombre);
        Assert.NotEqual(Guid.Empty, found.Id);
    }

    [Fact]
    public async Task GetClienteById_WhenExists_Returns200WithShape()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        Guid clienteId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var entity = new ClienteEntity
            {
                Nombre = "Empresa Detail Test",
                Nit = "999-detail-1",
                Ciudad = "Medellín",
                Telefono = "3001234567",
            };
            db.Clientes.Add(entity);
            await db.SaveChangesAsync();
            clienteId = entity.Id;
        }

        var client = factory.CreateClient();
        var response = await client.GetAsync($"/api/v1/clientes/{clienteId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var cliente = JsonSerializer.Deserialize<ClienteDto>(json, JsonOptions);
        Assert.NotNull(cliente);
        Assert.Equal("Empresa Detail Test", cliente.Nombre);
        Assert.Equal(clienteId, cliente.Id);
        Assert.Equal("999-detail-1", cliente.Nit);
        Assert.NotEqual(default, cliente.CreatedAt);
        Assert.NotEqual(default, cliente.UpdatedAt);
    }

    [Fact]
    public async Task GetClienteById_WhenNotFound_Returns404ProblemDetails()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var response = await client.GetAsync($"/api/v1/clientes/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Not Found", json);
    }

    [Fact]
    public async Task PostCliente_WithValidData_Returns201WithLocation()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var payload = new
        {
            nombre = "Nueva Empresa",
            nit = "901-test-1",
            telefono = "3001234567",
            ciudad = "Bogotá"
        };

        var response = await client.PostAsJsonAsync("/api/v1/clientes", payload);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
        var json = await response.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ClienteDto>(json, JsonOptions);
        Assert.NotNull(created);
        Assert.Equal("Nueva Empresa", created.Nombre);
        Assert.Equal("901-test-1", created.Nit);
        Assert.NotEqual(Guid.Empty, created.Id);
    }

    [Fact]
    public async Task PostCliente_WithDuplicateNit_Returns409WithProblemDetails()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Clientes.Add(new ClienteEntity
            {
                Nombre = "Empresa Existente",
                Nit = "duplicate-nit-001",
            });
            await db.SaveChangesAsync();
        }

        var client = factory.CreateClient();
        var payload = new { nombre = "Otra Empresa", nit = "duplicate-nit-001", telefono = "3000000000", ciudad = "Cali" };

        var response = await client.PostAsJsonAsync("/api/v1/clientes", payload);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task PutCliente_WithValidData_Returns200WithUpdatedDto()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        Guid clienteId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var e = new ClienteEntity { Nombre = "Original", Nit = "900-update-1", Telefono = "300", Ciudad = "Cali" };
            db.Clientes.Add(e);
            await db.SaveChangesAsync();
            clienteId = e.Id;
        }

        var client = factory.CreateClient();
        var payload = new { nombre = "Actualizado", nit = "900-update-1", telefono = "3009999999", ciudad = "Bogotá" };
        var response = await client.PutAsJsonAsync($"/api/v1/clientes/{clienteId}", payload);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var dto = JsonSerializer.Deserialize<ClienteDto>(json, JsonOptions);
        Assert.NotNull(dto);
        Assert.Equal("Actualizado", dto!.Nombre);
        Assert.Equal("Bogotá", dto.Ciudad);
        Assert.True(dto.UpdatedAt > dto.CreatedAt, "UpdatedAt should be bumped after update");
    }

    [Fact]
    public async Task PutCliente_WithNonExistentId_Returns404()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();
        var payload = new { nombre = "X", nit = "Y", telefono = "Z", ciudad = "W" };

        var response = await client.PutAsJsonAsync($"/api/v1/clientes/{Guid.NewGuid()}", payload);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PutCliente_WithDuplicateNitOfOtherClient_Returns409()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        Guid targetId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Clientes.Add(new ClienteEntity { Nombre = "Ocupado", Nit = "nit-taken" });
            var target = new ClienteEntity { Nombre = "Target", Nit = "nit-target" };
            db.Clientes.Add(target);
            await db.SaveChangesAsync();
            targetId = target.Id;
        }

        var client = factory.CreateClient();
        var payload = new { nombre = "Target", nit = "nit-taken", telefono = "300", ciudad = "Cali" };
        var response = await client.PutAsJsonAsync($"/api/v1/clientes/{targetId}", payload);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task PutCliente_WithSameNitAsCurrentClient_Returns200()
    {
        // GIVEN: A cliente exists with a specific NIT
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        Guid clienteId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var entity = new ClienteEntity { Nombre = "Original", Nit = "same-nit-200", Telefono = "300", Ciudad = "Cali" };
            db.Clientes.Add(entity);
            await db.SaveChangesAsync();
            clienteId = entity.Id;
        }

        var client = factory.CreateClient();

        // WHEN: PUT sends the same NIT (only Nombre and Ciudad change)
        var payload = new { nombre = "Actualizado", nit = "same-nit-200", telefono = "3009999999", ciudad = "Bogotá" };
        var response = await client.PutAsJsonAsync($"/api/v1/clientes/{clienteId}", payload);

        // THEN: 200 OK — not 409 Conflict (same NIT on same entity is not a duplicate)
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var dto = JsonSerializer.Deserialize<ClienteDto>(json, JsonOptions);
        Assert.NotNull(dto);
        Assert.Equal("Actualizado", dto!.Nombre);
        Assert.Equal("same-nit-200", dto.Nit);
        Assert.Equal("Bogotá", dto.Ciudad);
    }

    [Fact]
    public async Task DeleteCliente_Existing_WithNoContacts_Returns200WithZeroCount()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        Guid clienteId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var e = new ClienteEntity { Nombre = "Para Borrar", Nit = "nit-del-1", Telefono = "300", Ciudad = "Cali" };
            db.Clientes.Add(e);
            await db.SaveChangesAsync();
            clienteId = e.Id;
        }

        var client = factory.CreateClient();
        var response = await client.DeleteAsync($"/api/v1/clientes/{clienteId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        Assert.Equal(0, doc.RootElement.GetProperty("contactosDesasociados").GetInt32());
    }

    [Fact]
    public async Task DeleteCliente_Existing_WithAssociatedContacts_Returns200WithCount()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        Guid clienteId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var cliente = new ClienteEntity { Nombre = "Con Contactos", Nit = "nit-del-2", Telefono = "300", Ciudad = "Medellín" };
            db.Clientes.Add(cliente);
            await db.SaveChangesAsync();
            clienteId = cliente.Id;

            db.Contactos.Add(new ContactoEntity { Nombre = "C1", Cargo = "CEO", Telefono = "300", Email = "c1@del.com", ClienteId = clienteId });
            db.Contactos.Add(new ContactoEntity { Nombre = "C2", Cargo = "CTO", Telefono = "301", Email = "c2@del.com", ClienteId = clienteId });
            await db.SaveChangesAsync();
        }

        var client = factory.CreateClient();
        var response = await client.DeleteAsync($"/api/v1/clientes/{clienteId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        Assert.Equal(2, doc.RootElement.GetProperty("contactosDesasociados").GetInt32());

        // Verify contacts are now unassigned (clienteId = null)
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var orphanCount = await db.Contactos.CountAsync(c => c.ClienteId == null && (c.Email == "c1@del.com" || c.Email == "c2@del.com"));
            Assert.Equal(2, orphanCount);
        }
    }

    [Fact]
    public async Task DeleteCliente_NonExistent_Returns404()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var response = await client.DeleteAsync($"/api/v1/clientes/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetClientes_EnforcesUniqueNit_DuplicateNitThrowsOnSave()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Clientes.Add(new ClienteEntity { Nombre = "Empresa A", Nit = "999-1" });
        db.Clientes.Add(new ClienteEntity { Nombre = "Empresa B", Nit = "999-1" });

        // Real PostgreSQL enforces the uk_clientes_nit unique index
        await Assert.ThrowsAnyAsync<Exception>(() => db.SaveChangesAsync());
    }
}
