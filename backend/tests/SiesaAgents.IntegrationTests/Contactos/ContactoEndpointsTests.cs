using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SiesaAgents.Application.Contactos.DTOs;
using SiesaAgents.Domain.Contactos.Entities;
using SiesaAgents.Infrastructure.Data;
using Testcontainers.PostgreSql;

namespace SiesaAgents.IntegrationTests.Contactos;

public class ContactoEndpointsTests : IAsyncLifetime
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

    [Fact]
    public async Task GetContactos_WhenEmpty_Returns200WithEmptyArray()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
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
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
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
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/contactos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
    }
}
