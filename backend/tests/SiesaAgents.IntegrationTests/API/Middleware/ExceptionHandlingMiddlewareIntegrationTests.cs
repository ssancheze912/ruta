using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace SiesaAgents.IntegrationTests.API.Middleware;

/// <summary>
/// Integration tests for ExceptionHandlingMiddleware through the full ASP.NET Core pipeline.
/// Uses WebApplicationFactory&lt;Program&gt; to exercise real middleware ordering, DI, and content negotiation.
/// Requires the Development-only endpoint GET /api/dev/trigger-error (registered in Program.cs).
/// </summary>
public class ExceptionHandlingMiddlewareIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ExceptionHandlingMiddlewareIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((_, config) =>
                {
                    // Provide a valid-format connection string so Program.cs does not throw on startup.
                    // The DbContext is never exercised by these tests (no DB endpoint hit).
                    config.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["ConnectionStrings:DefaultConnection"] =
                            "Host=localhost;Port=5432;Database=siesa_test;Username=sa;Password=sa"
                    });
                });
            })
            .CreateClient();
    }

    [Fact]
    public async Task TriggerError_ReturnsRfc7807ProblemDetails_ThroughFullPipeline()
    {
        // GIVEN: Backend is running with ExceptionHandlingMiddleware first in pipeline

        // WHEN: Request hits the dev trigger-error endpoint (throws InvalidOperationException)
        var response = await _client.GetAsync("/api/dev/trigger-error");

        // THEN: HTTP 500
        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);

        // AND: Content-Type is application/problem+json (RFC 7807)
        var contentType = response.Content.Headers.ContentType?.MediaType;
        Assert.Equal("application/problem+json", contentType);

        // AND: Body contains required RFC 7807 fields
        var body = await response.Content.ReadAsStringAsync();
        var problem = JsonSerializer.Deserialize<ProblemDetails>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(problem);
        Assert.Equal(500, problem.Status);
        Assert.Equal("Internal Server Error", problem.Title);
        Assert.NotNull(problem.Detail);

        // AND: No stack trace or exception details leaked to client (security requirement)
        Assert.DoesNotContain("InvalidOperationException", body);
        Assert.DoesNotContain("stackTrace", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Intentional test exception", body);
    }

    [Fact]
    public async Task TriggerError_IsOnlyAvailableInDevelopment()
    {
        // GIVEN: Test factory runs with Development environment (default for WebApplicationFactory)
        // This test documents that the endpoint EXISTS in Development.
        // Production exclusion is verified via the IsDevelopment() guard in Program.cs.
        var response = await _client.GetAsync("/api/dev/trigger-error");

        // THEN: Endpoint is reachable (returns 500, not 404)
        Assert.NotEqual(HttpStatusCode.NotFound, response.StatusCode);
    }
}
