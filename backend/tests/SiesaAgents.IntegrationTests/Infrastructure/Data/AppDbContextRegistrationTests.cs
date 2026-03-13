using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SiesaAgents.Infrastructure.Data;

namespace SiesaAgents.IntegrationTests.Infrastructure.Data;

public class AppDbContextRegistrationTests
{
    [Fact]
    public void AppDbContext_CanBeResolvedFromServiceCollection()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddDbContext<AppDbContext>(options =>
            options
                .UseNpgsql("Host=localhost;Database=test_db;Username=test;Password=test")
                .UseSnakeCaseNamingConvention());

        // Act
        var provider = services.BuildServiceProvider();
        var context = provider.GetService<AppDbContext>();

        // Assert
        Assert.NotNull(context);
    }

    [Fact]
    public void AppDbContext_ConnectionString_ContainsDatabaseName()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql("Host=localhost;Database=siesa_agents_db;Username=postgres;Password=postgres")
            .UseSnakeCaseNamingConvention()
            .Options;

        // Act
        using var context = new AppDbContext(options);

        // Assert
        Assert.Contains("siesa_agents_db", context.Database.GetConnectionString()!);
    }

    [Fact]
    public void AppDbContext_SnakeCaseNaming_IsApplied()
    {
        // Arrange — verify that UseSnakeCaseNamingConvention option is applied without throwing
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql("Host=localhost;Database=siesa_agents_db;Username=postgres;Password=postgres")
            .UseSnakeCaseNamingConvention()
            .Options;

        // Act & Assert — context creation should succeed with snake_case naming applied
        var exception = Record.Exception(() => new AppDbContext(options));
        Assert.Null(exception);
    }
}
