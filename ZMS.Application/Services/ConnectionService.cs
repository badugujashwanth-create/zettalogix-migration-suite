using ZMS.Application.Contracts;
using ZMS.Core.Enums;
using ZMS.Core.Interfaces;
using ZMS.Core.Models;

namespace ZMS.Application.Services;

public class ConnectionService : IConnectionService
{
    private readonly IConnectionRepository _connectionRepository;
    private readonly ConnectorResolver _connectorResolver;

    public ConnectionService(IConnectionRepository connectionRepository, ConnectorResolver connectorResolver)
    {
        _connectionRepository = connectionRepository;
        _connectorResolver = connectorResolver;
    }

    public Task<IReadOnlyCollection<ConnectionProfile>> ListAsync(CancellationToken cancellationToken)
        => _connectionRepository.ListAsync(cancellationToken);

    public async Task<ConnectionProfile> CreateAsync(CreateConnectionRequest request, CancellationToken cancellationToken)
    {
        var connection = new ConnectionProfile
        {
            Name = request.Name.Trim(),
            Type = request.Type,
            Url = request.Url.Trim(),
            Username = request.Username,
            Password = request.Password,
            ClientId = request.ClientId,
            ClientSecret = request.ClientSecret,
            TenantId = request.TenantId,
            RootPath = request.RootPath,
            AdditionalSettings = new Dictionary<string, string>(request.AdditionalSettings, StringComparer.OrdinalIgnoreCase),
            CreatedUtc = DateTimeOffset.UtcNow,
            UpdatedUtc = DateTimeOffset.UtcNow
        };

        await _connectionRepository.AddAsync(connection, cancellationToken);
        return connection;
    }

    public async Task<ConnectionTestResult> TestConnectionAsync(Guid connectionId, CancellationToken cancellationToken)
    {
        var connection = await _connectionRepository.GetByIdAsync(connectionId, cancellationToken)
            ?? throw new KeyNotFoundException($"Connection '{connectionId}' was not found.");

        return connection.Type switch
        {
            ConnectionType.SharePointOnline => await _connectorResolver
                .ResolveTarget(connection)
                .TestConnectionAsync(connection, cancellationToken),
            _ when _connectorResolver.CanResolveSource(connection.Type) => await _connectorResolver
                .ResolveSource(connection)
                .TestConnectionAsync(connection, cancellationToken),
            _ => new ConnectionTestResult
            {
                IsSuccess = false,
                Message = $"No connector is available for '{connection.Type}'."
            }
        };
    }
}
