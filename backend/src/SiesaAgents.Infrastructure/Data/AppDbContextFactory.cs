using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SiesaAgents.Infrastructure.Data;

/// <summary>
/// Enables 'dotnet ef' CLI to create AppDbContext at design time.
/// Used ONLY by EF Core tooling (dotnet ef migrations / database update).
/// Never called at runtime — runtime DbContext comes from DI in Program.cs.
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    // Design-time connection string — used ONLY by 'dotnet ef' CLI, never at runtime.
    // ⚠️ If your local PostgreSQL uses a different password, update it here before running migrations.
    // This string is intentionally hardcoded: Infrastructure is a classlib with no
    // Microsoft.Extensions.Configuration.Json available at design time.
    private const string DesignTimeConnectionString =
        "Host=localhost;Port=5432;Database=siesa_agents_db;Username=postgres;Password=postgres";

    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder
            .UseNpgsql(DesignTimeConnectionString)
            .UseSnakeCaseNamingConvention();

        return new AppDbContext(optionsBuilder.Options);
    }
}
