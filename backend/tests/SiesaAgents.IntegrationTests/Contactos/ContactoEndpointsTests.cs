using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SiesaAgents.Application.Contactos.DTOs;
using SiesaAgents.Domain.Contactos.Entities;
using SiesaAgents.Infrastructure.Data;

namespace SiesaAgents.IntegrationTests.Contactos;

public class ContactoEndpointsTests
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
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:DefaultConnection"] =
                        "Host=localhost;Database=placeholder;Username=test;Password=test"
                });
            });

            builder.ConfigureServices(services =>
            {
                var toRemove = services
                    .Where(d =>
                        d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                        d.ServiceType == typeof(AppDbContext) ||
                        (d.ServiceType.IsGenericType &&
                         d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>)))
                    .ToList();
                foreach (var d in toRemove) services.Remove(d);

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
    public async Task GetContactos_WhenEmpty_Returns200WithEmptyArray()
    {
        await using var factory = CreateFactory("TestContactos_Empty_" + Guid.NewGuid());
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/contactos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var contactos = JsonSerializer.Deserialize<List<ContactoDto>>(json, JsonOptions);
        Assert.NotNull(contactos);
        Assert.Empty(contactos);
    }

    [Fact]
    public async Task GetContactos_WhenContactosExist_ReturnsCorrectShape()
    {
        var dbName = "TestContactos_WithData_" + Guid.NewGuid();
        await using var factory = CreateFactory(dbName);

        var seedOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        await using (var db = new AppDbContext(seedOptions))
        {
            db.Contactos.Add(new ContactoEntity
            {
                Nombre = "Ana García",
                Cargo = "Gerente",
                Telefono = "3001234567",
                Email = "ana@empresa.com",
                ClienteId = null,
            });
            await db.SaveChangesAsync();
        }

        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/v1/contactos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var contactos = JsonSerializer.Deserialize<List<ContactoDto>>(json, JsonOptions);
        Assert.NotNull(contactos);
        var found = contactos.FirstOrDefault(c => c.Email == "ana@empresa.com");
        Assert.NotNull(found);
        Assert.Equal("Ana García", found.Nombre);
        Assert.Equal("Gerente", found.Cargo);
        Assert.NotEqual(Guid.Empty, found.Id);
        Assert.Null(found.ClienteId);
    }

    [Fact]
    public async Task GetContactos_ResponseContentType_IsApplicationJson()
    {
        await using var factory = CreateFactory("TestContactos_ContentType_" + Guid.NewGuid());
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/contactos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
    }
}
