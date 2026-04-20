using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace SiesaAgents.IntegrationTests.API.Cors;

/// <summary>
/// Integration tests for CORS policy through the full ASP.NET Core pipeline.
/// Verifies that the default CORS policy correctly handles preflight OPTIONS requests.
/// Allowed origins default: ["http://localhost:5173"] (Program.cs fallback when no config provided).
/// Allowed methods: GET, POST, PUT, DELETE (explicit in Program.cs WithMethods).
/// </summary>
public class CorsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public CorsIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((_, config) =>
                {
                    // Provide a valid-format connection string so Program.cs does not throw on startup.
                    // CORS middleware responds before the endpoint handler, so no DB access occurs.
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
    public async Task CorsPreflightOptions_WithAllowedOrigin_ReturnsAccessControlAllowOriginHeader()
    {
        // GIVEN: A CORS preflight OPTIONS request from the allowed origin
        var request = new HttpRequestMessage(HttpMethod.Options, "/api/v1/clientes");
        request.Headers.Add("Origin", "http://localhost:5173");
        request.Headers.Add("Access-Control-Request-Method", "GET");

        // WHEN: The request is sent
        var response = await _client.SendAsync(request);

        // THEN: Response is not a rejection (200 or 204 for CORS preflight)
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);

        // AND: Access-Control-Allow-Origin header is present with the allowed origin
        Assert.True(
            response.Headers.Contains("Access-Control-Allow-Origin"),
            "Response must include Access-Control-Allow-Origin header for allowed origin");
        var allowOrigin = response.Headers.GetValues("Access-Control-Allow-Origin").First();
        Assert.Equal("http://localhost:5173", allowOrigin);
    }

    [Fact]
    public async Task CorsPreflightOptions_WithAllowedOrigin_ReturnsExpectedAllowedMethods()
    {
        // GIVEN: A CORS preflight OPTIONS request asking about POST method
        var request = new HttpRequestMessage(HttpMethod.Options, "/api/v1/clientes");
        request.Headers.Add("Origin", "http://localhost:5173");
        request.Headers.Add("Access-Control-Request-Method", "POST");

        // WHEN: The request is sent
        var response = await _client.SendAsync(request);

        // THEN: Access-Control-Allow-Methods is present
        Assert.True(
            response.Headers.Contains("Access-Control-Allow-Methods"),
            "Response must include Access-Control-Allow-Methods header");

        var allowMethods = response.Headers.GetValues("Access-Control-Allow-Methods").First();

        // AND: The policy explicitly allows GET, POST, PUT, DELETE (WithMethods in Program.cs)
        Assert.Contains("GET", allowMethods, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("POST", allowMethods, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("PUT", allowMethods, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("DELETE", allowMethods, StringComparison.OrdinalIgnoreCase);
    }
}
