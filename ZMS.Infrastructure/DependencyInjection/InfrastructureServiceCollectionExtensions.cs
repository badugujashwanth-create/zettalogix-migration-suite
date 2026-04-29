using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ZMS.Core.Interfaces;
using ZMS.Infrastructure.Persistence;
using ZMS.Infrastructure.Repositories;

namespace ZMS.Infrastructure.DependencyInjection;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddZmsInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("ZmsDatabase")
            ?? "Server=(localdb)\\MSSQLLocalDB;Database=ZMS;Trusted_Connection=True;TrustServerCertificate=True;";

        services.AddDbContext<ZmsDbContext>(options =>
            options.UseSqlServer(connectionString, sqlOptions => sqlOptions.EnableRetryOnFailure()));

        services.AddScoped<IConnectionRepository, ConnectionRepository>();
        services.AddScoped<IMigrationJobRepository, MigrationJobRepository>();
        services.AddScoped<IMigrationItemRepository, MigrationItemRepository>();
        services.AddScoped<ILogRepository, LogRepository>();

        return services;
    }
}
