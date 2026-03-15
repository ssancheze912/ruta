using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using SiesaAgents.API.Endpoints;
using SiesaAgents.API.Middleware;
using SiesaAgents.Application.Clientes.Commands;
using SiesaAgents.Application.Clientes.Queries;
using SiesaAgents.Application.Contactos.Commands;
using SiesaAgents.Application.Contactos.Queries;
using SiesaAgents.Domain.Clientes.Interfaces;
using SiesaAgents.Domain.Contactos.Interfaces;
using SiesaAgents.Infrastructure.Data;
using SiesaAgents.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// CORS — allowed origins read from config (appsettings.json / appsettings.Development.json)
// ⚠️ Production: set Cors:AllowedOrigins in appsettings.Production.json — never use wildcard origins
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Database — PostgreSQL via EF Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' not found. Add it to appsettings.Development.json.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options
        .UseNpgsql(connectionString)
        .UseSnakeCaseNamingConvention());

// Validators — scan all validators from Application assembly
builder.Services.AddValidatorsFromAssemblyContaining<CreateClienteCommandHandler>();

// Clientes — DI
builder.Services.AddScoped<IClienteRepository, ClienteRepository>();
builder.Services.AddScoped<GetClientesQueryHandler>();
builder.Services.AddScoped<GetClienteByIdQueryHandler>();
builder.Services.AddScoped<CreateClienteCommandHandler>();
builder.Services.AddScoped<UpdateClienteCommandHandler>();
builder.Services.AddScoped<DeleteClienteCommandHandler>();

// Contactos — DI
builder.Services.AddScoped<IContactoRepository, ContactoRepository>();
builder.Services.AddScoped<GetContactosQueryHandler>();
builder.Services.AddScoped<GetContactoByIdQueryHandler>();
builder.Services.AddScoped<CreateContactoCommandHandler>();
builder.Services.AddScoped<UpdateContactoCommandHandler>();
builder.Services.AddScoped<DeleteContactoCommandHandler>();

// OpenAPI (for Scalar — NOT Swagger)
builder.Services.AddOpenApi();

var app = builder.Build();

// Global exception handler — must be first
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors();

// Scalar API docs at /scalar — NEVER UseSwagger
app.MapOpenApi();
app.MapScalarApiReference();

// API endpoints
app.MapGroup("/api/v1")
    .MapClienteEndpoints()
    .MapContactoEndpoints();

app.Run();

// Expose Program class for WebApplicationFactory in integration tests
public partial class Program { }
