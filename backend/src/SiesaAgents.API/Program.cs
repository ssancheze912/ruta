using Scalar.AspNetCore;
using SiesaAgents.API.Middleware;

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

// OpenAPI (for Scalar — NOT Swagger)
builder.Services.AddOpenApi();

var app = builder.Build();

// Global exception handler — must be first
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors();

// Scalar API docs at /scalar — NEVER UseSwagger
app.MapOpenApi();
app.MapScalarApiReference();

app.Run();
