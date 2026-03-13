using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SiesaAgents.Application.Clientes.DTOs;
using SiesaAgents.Domain.Clientes.Entities;
using SiesaAgents.Infrastructure.Data;

namespace SiesaAgents.IntegrationTests.Clientes;

public class ClienteEndpointsTests
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    /// <summary>
    /// Creates an isolated WebApplicationFactory with InMemory EF Core.
    /// Direct scoped registration avoids EF Core internal service provider conflict
    /// caused by both Npgsql and InMemory providers being present simultaneously.
    /// </summary>
    private static WebApplicationFactory<Program> CreateFactory(string dbName)
    {
        return new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, config) =>
            {
                // Provide a placeholder so Program.cs doesn't throw on startup
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:DefaultConnection"] =
                        "Host=localhost;Database=placeholder;Username=test;Password=test"
                });
            });

            builder.ConfigureServices(services =>
            {
                // Remove ALL DbContext registrations to eliminate provider conflicts
                var toRemove = services
                    .Where(d =>
                        d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                        d.ServiceType == typeof(AppDbContext) ||
                        (d.ServiceType.IsGenericType &&
                         d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>)))
                    .ToList();
                foreach (var d in toRemove) services.Remove(d);

                // Register AppDbContext directly with a fresh options object per scope.
                // This bypasses EF Core's internal service provider caching and avoids
                // the "multiple providers registered" conflict (Npgsql + InMemory).
                services.AddScoped(_ =>
                {
                    var options = new DbContextOptionsBuilder<AppDbContext>()
                        .UseInMemoryDatabase(dbName)
                        .Options;
                    return new AppDbContext(options);
                });
            });
        });
    }

    [Fact]
    public async Task GetClientes_WhenEmpty_Returns200WithEmptyArray()
    {
        await using var factory = CreateFactory("TestClientes_Empty_" + Guid.NewGuid());
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
        var dbName = "TestClientes_WithData_" + Guid.NewGuid();
        await using var factory = CreateFactory(dbName);

        // Seed data using the same InMemory database name
        var seedOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        await using (var db = new AppDbContext(seedOptions))
        {
            db.Clientes.Add(new ClienteEntity
            {
                Nombre = "Empresa Test",
                Nit = "900000099-9",
                Ciudad = "Cali",
                Telefono = "+57 1 000 0000"
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
}
