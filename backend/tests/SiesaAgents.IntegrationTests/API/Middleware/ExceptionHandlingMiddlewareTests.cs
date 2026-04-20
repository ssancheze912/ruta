using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NSubstitute;
using SiesaAgents.API.Middleware;

namespace SiesaAgents.IntegrationTests.API.Middleware;

/// <summary>
/// Unit-style tests for ExceptionHandlingMiddleware using DefaultHttpContext directly.
/// These isolate the middleware class without a running HTTP pipeline.
/// For full HTTP pipeline coverage see ExceptionHandlingMiddlewareIntegrationTests.cs.
/// </summary>
public class ExceptionHandlingMiddlewareUnitTests
{
    [Fact]
    public async Task InvokeAsync_WhenExceptionThrown_Returns500ProblemDetails()
    {
        // Arrange
        var logger = Substitute.For<ILogger<ExceptionHandlingMiddleware>>();
        RequestDelegate next = _ => throw new InvalidOperationException("Test error");
        var middleware = new ExceptionHandlingMiddleware(next, logger);

        var context = new DefaultHttpContext();
        var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(StatusCodes.Status500InternalServerError, context.Response.StatusCode);
        Assert.Equal("application/problem+json", context.Response.ContentType);

        responseBody.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(responseBody).ReadToEndAsync();
        var problem = JsonSerializer.Deserialize<ProblemDetails>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(problem);
        Assert.Equal(500, problem.Status);
        Assert.Equal("Internal Server Error", problem.Title);
        // ⚠️ Verify stack trace and exception details are NOT exposed (NFR6)
        Assert.DoesNotContain("Test error", problem.Detail ?? string.Empty);
        Assert.DoesNotContain("InvalidOperationException", json);
    }

    [Fact]
    public async Task InvokeAsync_WhenNoException_PassesThrough()
    {
        // Arrange
        var logger = Substitute.For<ILogger<ExceptionHandlingMiddleware>>();
        var wasCalled = false;
        RequestDelegate next = _ =>
        {
            wasCalled = true;
            return Task.CompletedTask;
        };
        var middleware = new ExceptionHandlingMiddleware(next, logger);
        var context = new DefaultHttpContext();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.True(wasCalled);
        Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
    }

    [Fact]
    public async Task InvokeAsync_WhenArgumentExceptionThrown_Returns500SameProblemDetailsShape()
    {
        // GIVEN: Middleware receives an ArgumentException (same catch-all path as InvalidOperationException)
        var logger = Substitute.For<ILogger<ExceptionHandlingMiddleware>>();
        RequestDelegate next = _ => throw new ArgumentException("Invalid argument value");
        var middleware = new ExceptionHandlingMiddleware(next, logger);

        var context = new DefaultHttpContext();
        var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        // Act
        await middleware.InvokeAsync(context);

        // THEN: Same 500 Problem Details shape — consistent across all unhandled exception types
        Assert.Equal(StatusCodes.Status500InternalServerError, context.Response.StatusCode);
        Assert.Equal("application/problem+json", context.Response.ContentType);

        responseBody.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(responseBody).ReadToEndAsync();
        var problem = JsonSerializer.Deserialize<ProblemDetails>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(problem);
        Assert.Equal(500, problem.Status);
        Assert.Equal("Internal Server Error", problem.Title);
        // AND: Argument details are NOT exposed to client (NFR6 — no exception leakage)
        Assert.DoesNotContain("Invalid argument value", problem.Detail ?? string.Empty);
        Assert.DoesNotContain("ArgumentException", json);
    }

    [Fact]
    public async Task InvokeAsync_WhenResponseAlreadyStarted_DoesNotThrow()
    {
        // Arrange
        var logger = Substitute.For<ILogger<ExceptionHandlingMiddleware>>();
        RequestDelegate next = _ => throw new InvalidOperationException("Error");
        var middleware = new ExceptionHandlingMiddleware(next, logger);

        // Simulate HasStarted = true via feature substitution
        var context = new DefaultHttpContext();
        var responseMock = Substitute.For<IHttpResponseFeature>();
        responseMock.HasStarted.Returns(true);
        context.Features.Set<IHttpResponseFeature>(responseMock);
        context.Response.Body = new MemoryStream();

        // Act — should not throw, guard must handle gracefully
        var exception = await Record.ExceptionAsync(() => middleware.InvokeAsync(context));

        // Assert — no exception propagated
        Assert.Null(exception);
    }
}
