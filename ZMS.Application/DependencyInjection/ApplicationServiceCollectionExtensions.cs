using ZMS.Application.Contracts;
using ZMS.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ZMS.Application.DependencyInjection;

public static class ApplicationServiceCollectionExtensions
{
    public static IServiceCollection AddZmsApplication(this IServiceCollection services)
    {
        services.AddScoped<ConnectorResolver>();
        services.AddScoped<IConnectionService, ConnectionService>();
        services.AddScoped<IDiscoveryService, DiscoveryService>();
        services.AddScoped<IMigrationService, MigrationService>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
