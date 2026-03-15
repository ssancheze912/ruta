using System.Net;
using System.Text;
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

    [Fact]
    public async Task GetContactoById_WhenExists_Returns200WithShape()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        Guid contactoId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var entity = new ContactoEntity
            {
                Nombre = "Test User",
                Cargo = "Analista",
                Telefono = "3001234567",
                Email = "test@test.com",
                ClienteId = null,
            };
            db.Contactos.Add(entity);
            await db.SaveChangesAsync();
            contactoId = entity.Id;
        }

        var client = factory.CreateClient();
        var response = await client.GetAsync($"/api/v1/contactos/{contactoId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var contacto = JsonSerializer.Deserialize<ContactoDto>(json, JsonOptions);
        Assert.NotNull(contacto);
        Assert.Equal("Test User", contacto.Nombre);
        Assert.Equal("Analista", contacto.Cargo);
        Assert.Equal(contactoId, contacto.Id);
        Assert.Null(contacto.ClienteId);
    }

    [Fact]
    public async Task GetContactoById_WhenNotFound_Returns404WithProblemDetails()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var response = await client.GetAsync($"/api/v1/contactos/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task CreateContacto_WithValidData_Returns201WithShape()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var request = new { Nombre = "Ana García", Cargo = "Analista", Telefono = "3001234567", Email = "ana@test.com" };
        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

        var response = await client.PostAsync("/api/v1/contactos", content);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var contacto = JsonSerializer.Deserialize<ContactoDto>(json, JsonOptions);
        Assert.NotNull(contacto);
        Assert.Equal("Ana García", contacto.Nombre);
        Assert.Equal("Analista", contacto.Cargo);
        Assert.Equal("3001234567", contacto.Telefono);
        Assert.Equal("ana@test.com", contacto.Email);
        Assert.NotEqual(Guid.Empty, contacto.Id);
        Assert.Null(contacto.ClienteId);
        Assert.NotEqual(default, contacto.CreatedAt);
    }

    [Fact]
    public async Task CreateContacto_WithEmptyNombre_Returns422()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var request = new { Nombre = "", Cargo = "Analista", Telefono = "3001234567", Email = "ana@test.com" };
        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

        var response = await client.PostAsync("/api/v1/contactos", content);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task CreateContacto_WithInvalidEmail_Returns422()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var request = new { Nombre = "Ana García", Cargo = "Analista", Telefono = "3001234567", Email = "not-an-email" };
        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

        var response = await client.PostAsync("/api/v1/contactos", content);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task CreateContacto_WithEmptyCargo_Returns422()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var request = new { Nombre = "Ana García", Cargo = "", Telefono = "3001234567", Email = "ana@test.com" };
        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

        var response = await client.PostAsync("/api/v1/contactos", content);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task CreateContacto_WithEmptyTelefono_Returns422()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var request = new { Nombre = "Ana García", Cargo = "Analista", Telefono = "", Email = "ana@test.com" };
        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

        var response = await client.PostAsync("/api/v1/contactos", content);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task UpdateContacto_WithValidData_Returns200WithUpdatedValues()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        Guid contactoId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var entity = new ContactoEntity
            {
                Nombre = "Ana García",
                Cargo = "Analista",
                Telefono = "3001234567",
                Email = "ana@test.com",
                ClienteId = null,
            };
            db.Contactos.Add(entity);
            await db.SaveChangesAsync();
            contactoId = entity.Id;
        }

        var client = factory.CreateClient();
        var request = new { Nombre = "Ana Actualizada", Cargo = "Senior Analista", Telefono = "3009999999", Email = "ana.nueva@test.com" };
        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

        var response = await client.PutAsync($"/api/v1/contactos/{contactoId}", content);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var contacto = JsonSerializer.Deserialize<ContactoDto>(json, JsonOptions);
        Assert.NotNull(contacto);
        Assert.Equal("Ana Actualizada", contacto.Nombre);
        Assert.Equal("Senior Analista", contacto.Cargo);
        Assert.Equal("3009999999", contacto.Telefono);
        Assert.Equal("ana.nueva@test.com", contacto.Email);
        Assert.Equal(contactoId, contacto.Id);
    }

    [Fact]
    public async Task UpdateContacto_WithNonExistentId_Returns404()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var request = new { Nombre = "Test", Cargo = "Test", Telefono = "123", Email = "test@test.com" };
        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

        var response = await client.PutAsync($"/api/v1/contactos/{Guid.NewGuid()}", content);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task UpdateContacto_WithEmptyNombre_Returns422()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        Guid contactoId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var entity = new ContactoEntity
            {
                Nombre = "Original",
                Cargo = "Analista",
                Telefono = "3001234567",
                Email = "original@test.com",
                ClienteId = null,
            };
            db.Contactos.Add(entity);
            await db.SaveChangesAsync();
            contactoId = entity.Id;
        }

        var client = factory.CreateClient();
        var request = new { Nombre = "", Cargo = "Analista", Telefono = "3001234567", Email = "original@test.com" };
        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

        var response = await client.PutAsync($"/api/v1/contactos/{contactoId}", content);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task DeleteContacto_WithValidId_Returns204()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);

        Guid contactoId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var entity = new ContactoEntity
            {
                Nombre = "Ana García",
                Cargo = "Analista",
                Telefono = "3001234567",
                Email = "ana@test.com",
                ClienteId = null,
            };
            db.Contactos.Add(entity);
            await db.SaveChangesAsync();
            contactoId = entity.Id;
        }

        var client = factory.CreateClient();
        var response = await client.DeleteAsync($"/api/v1/contactos/{contactoId}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Null(response.Content.Headers.ContentLength);
    }

    [Fact]
    public async Task DeleteContacto_WithNonExistentId_Returns404()
    {
        await using var factory = CreateFactory();
        await MigrateAsync(factory);
        var client = factory.CreateClient();

        var response = await client.DeleteAsync($"/api/v1/contactos/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }
}
