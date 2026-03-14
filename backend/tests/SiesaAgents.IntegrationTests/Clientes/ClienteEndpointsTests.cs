using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SiesaAgents.Application.Clientes.DTOs;
using SiesaAgents.Domain.Clientes.Entities;
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
    }

    [Fact]
    public async Task GetClienteById_WhenNotFound_Returns404()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var response = await client.GetAsync($"/api/v1/clientes/{Guid.NewGuid()}");

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
