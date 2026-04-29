using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using ZMS.Core.Models;

namespace ZMS.Connectors.SharePointOnline.Services;

public class SharePointGraphClient
{
    private const long SmallFileUploadLimitInBytes = 250L * 1024 * 1024;
    private const int UploadChunkSizeInBytes = 320 * 1024 * 20;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<SharePointGraphClient> _logger;
    private readonly ConcurrentDictionary<Guid, CachedToken> _tokenCache = new();

    public SharePointGraphClient(
        IHttpClientFactory httpClientFactory,
        ILogger<SharePointGraphClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<ConnectionTestResult> TestConnectionAsync(
        ConnectionProfile connection,
        CancellationToken cancellationToken)
    {
        if (!Uri.TryCreate(connection.Url, UriKind.Absolute, out _))
        {
            return new ConnectionTestResult
            {
                IsSuccess = false,
                Message = "Provide a valid SharePoint Online site URL."
            };
        }

        if (string.IsNullOrWhiteSpace(connection.TenantId)
            || string.IsNullOrWhiteSpace(connection.ClientId)
            || string.IsNullOrWhiteSpace(connection.ClientSecret))
        {
            return new ConnectionTestResult
            {
                IsSuccess = false,
                Message = "SharePoint Online requires tenant ID, client ID, and client secret for direct transfers."
            };
        }

        try
        {
            var site = await ResolveSiteAsync(connection, connection.Url, cancellationToken);
            return new ConnectionTestResult
            {
                IsSuccess = true,
                Message = $"SharePoint Online connection verified for '{site.WebUrl}'."
            };
        }
        catch (Exception exception)
        {
            _logger.LogWarning(exception, "SharePoint Online connection test failed for '{ConnectionName}'.", connection.Name);
            return new ConnectionTestResult
            {
                IsSuccess = false,
                Message = exception.Message
            };
        }
    }

    public async Task<SharePointSiteDescriptor> ResolveSiteAsync(
        ConnectionProfile connection,
        string siteUrl,
        CancellationToken cancellationToken)
    {
        var effectiveSiteUrl = string.IsNullOrWhiteSpace(siteUrl) ? connection.Url : siteUrl;
        if (!Uri.TryCreate(effectiveSiteUrl, UriKind.Absolute, out var uri))
        {
            throw new InvalidOperationException("A valid SharePoint site URL is required.");
        }

        var relativePath = string.Join(
            '/',
            uri.AbsolutePath
                .Split('/', StringSplitOptions.RemoveEmptyEntries)
                .Select(Uri.EscapeDataString));

        var requestUri = string.IsNullOrWhiteSpace(relativePath)
            ? $"https://graph.microsoft.com/v1.0/sites/{uri.Host}:/"
            : $"https://graph.microsoft.com/v1.0/sites/{uri.Host}:/{relativePath}";

        using var response = await SendGraphAsync(connection, HttpMethod.Get, requestUri, null, cancellationToken);
        var site = await ReadRequiredAsync<GraphSiteResponse>(response, cancellationToken);

        return new SharePointSiteDescriptor(
            site.Id,
            string.IsNullOrWhiteSpace(site.WebUrl) ? effectiveSiteUrl : site.WebUrl,
            site.DisplayName ?? uri.Host);
    }

    public async Task<SharePointDriveDescriptor> ResolveDriveAsync(
        ConnectionProfile connection,
        string siteUrl,
        string libraryName,
        CancellationToken cancellationToken)
    {
        var site = await ResolveSiteAsync(connection, siteUrl, cancellationToken);
        using var response = await SendGraphAsync(
            connection,
            HttpMethod.Get,
            $"https://graph.microsoft.com/v1.0/sites/{site.Id}/drives?$select=id,name,webUrl,driveType",
            null,
            cancellationToken);

        var drives = await ReadRequiredAsync<GraphDriveCollectionResponse>(response, cancellationToken);
        var requestedLibraryName = string.IsNullOrWhiteSpace(libraryName) ? "Documents" : libraryName.Trim();

        var drive = drives.Value.FirstOrDefault(candidate =>
            string.Equals(candidate.Name, requestedLibraryName, StringComparison.OrdinalIgnoreCase));

        if (drive is null)
        {
            var defaultNames = new[] { "Documents", "Shared Documents" };
            if (defaultNames.Contains(requestedLibraryName, StringComparer.OrdinalIgnoreCase))
            {
                drive = drives.Value.FirstOrDefault(candidate =>
                    defaultNames.Contains(candidate.Name ?? string.Empty, StringComparer.OrdinalIgnoreCase));
            }
        }

        if (drive is null)
        {
            throw new InvalidOperationException(
                $"The SharePoint document library '{requestedLibraryName}' was not found under '{site.WebUrl}'.");
        }

        return new SharePointDriveDescriptor(
            drive.Id,
            drive.Name ?? requestedLibraryName,
            string.IsNullOrWhiteSpace(drive.WebUrl)
                ? $"{site.WebUrl.TrimEnd('/')}/{Uri.EscapeDataString(requestedLibraryName)}"
                : drive.WebUrl);
    }

    public async Task<string> EnsureFolderPathAsync(
        ConnectionProfile connection,
        string driveId,
        string? relativeFolderPath,
        CancellationToken cancellationToken)
    {
        var token = await GetAccessTokenAsync(connection, cancellationToken);
        var parentItemId = await GetRootItemIdAsync(token, driveId, cancellationToken);

        if (string.IsNullOrWhiteSpace(relativeFolderPath))
        {
            return parentItemId;
        }

        foreach (var segment in relativeFolderPath.Split('/', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            parentItemId = await GetOrCreateFolderAsync(token, driveId, parentItemId, segment, cancellationToken);
        }

        return parentItemId;
    }

    public Task<SharePointDriveItemDescriptor> UploadAsync(
        ConnectionProfile connection,
        string driveId,
        string parentItemId,
        string fileName,
        Stream content,
        long fileSizeInBytes,
        CancellationToken cancellationToken)
    {
        return fileSizeInBytes > SmallFileUploadLimitInBytes
            ? UploadLargeFileAsync(connection, driveId, parentItemId, fileName, content, fileSizeInBytes, cancellationToken)
            : UploadSmallFileAsync(connection, driveId, parentItemId, fileName, content, cancellationToken);
    }

    private async Task<SharePointDriveItemDescriptor> UploadSmallFileAsync(
        ConnectionProfile connection,
        string driveId,
        string parentItemId,
        string fileName,
        Stream content,
        CancellationToken cancellationToken)
    {
        var requestUri =
            $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{parentItemId}:/{Uri.EscapeDataString(fileName)}:/content";

        using var contentBody = new StreamContent(content);
        contentBody.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

        using var response = await SendGraphAsync(connection, HttpMethod.Put, requestUri, contentBody, cancellationToken);
        var uploadedItem = await ReadRequiredAsync<GraphDriveItemResponse>(response, cancellationToken);

        return new SharePointDriveItemDescriptor(uploadedItem.Id, uploadedItem.Name ?? fileName, uploadedItem.WebUrl);
    }

    private async Task<SharePointDriveItemDescriptor> UploadLargeFileAsync(
        ConnectionProfile connection,
        string driveId,
        string parentItemId,
        string fileName,
        Stream content,
        long fileSizeInBytes,
        CancellationToken cancellationToken)
    {
        if (fileSizeInBytes <= 0)
        {
            throw new InvalidOperationException(
                $"Large-file upload for '{fileName}' requires a known source size.");
        }

        var sessionRequestUri =
            $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{parentItemId}:/{Uri.EscapeDataString(fileName)}:/createUploadSession";
        var requestBody = JsonContent.Create(new Dictionary<string, object?>
        {
            ["item"] = new Dictionary<string, object?>
            {
                ["@microsoft.graph.conflictBehavior"] = "replace"
            }
        });

        using var sessionResponse = await SendGraphAsync(connection, HttpMethod.Post, sessionRequestUri, requestBody, cancellationToken);
        var session = await ReadRequiredAsync<GraphUploadSessionResponse>(sessionResponse, cancellationToken);

        var client = _httpClientFactory.CreateClient();
        var buffer = new byte[UploadChunkSizeInBytes];
        long position = 0;

        while (position < fileSizeInBytes)
        {
            var bytesToRead = (int)Math.Min(buffer.Length, fileSizeInBytes - position);
            var bytesRead = await ReadAtMostAsync(content, buffer, bytesToRead, cancellationToken);
            if (bytesRead == 0)
            {
                throw new InvalidOperationException(
                    $"The source stream for '{fileName}' ended before the expected {fileSizeInBytes} bytes were uploaded.");
            }

            using var chunkRequest = new HttpRequestMessage(HttpMethod.Put, session.UploadUrl)
            {
                Content = new ByteArrayContent(buffer, 0, bytesRead)
            };

            chunkRequest.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            chunkRequest.Content.Headers.ContentRange = new ContentRangeHeaderValue(
                position,
                position + bytesRead - 1,
                fileSizeInBytes);

            using var chunkResponse = await client.SendAsync(chunkRequest, HttpCompletionOption.ResponseHeadersRead, cancellationToken);

            if (chunkResponse.StatusCode is HttpStatusCode.OK or HttpStatusCode.Created)
            {
                var uploadedItem = await ReadRequiredAsync<GraphDriveItemResponse>(chunkResponse, cancellationToken);
                return new SharePointDriveItemDescriptor(uploadedItem.Id, uploadedItem.Name ?? fileName, uploadedItem.WebUrl);
            }

            if (chunkResponse.StatusCode != HttpStatusCode.Accepted)
            {
                var error = await chunkResponse.Content.ReadAsStringAsync(cancellationToken);
                throw new InvalidOperationException(
                    $"SharePoint large-file upload failed for '{fileName}' with status {(int)chunkResponse.StatusCode}: {error}");
            }

            position += bytesRead;
        }

        throw new InvalidOperationException($"SharePoint large-file upload did not complete for '{fileName}'.");
    }

    private async Task<string> GetRootItemIdAsync(
        string accessToken,
        string driveId,
        CancellationToken cancellationToken)
    {
        using var response = await SendAuthorizedAsync(
            accessToken,
            HttpMethod.Get,
            $"https://graph.microsoft.com/v1.0/drives/{driveId}/root?$select=id",
            null,
            cancellationToken);

        var root = await ReadRequiredAsync<GraphDriveItemResponse>(response, cancellationToken);
        return root.Id;
    }

    private async Task<string> GetOrCreateFolderAsync(
        string accessToken,
        string driveId,
        string parentItemId,
        string folderName,
        CancellationToken cancellationToken)
    {
        var existingFolder = await TryGetItemAsync(accessToken, driveId, parentItemId, folderName, cancellationToken);
        if (existingFolder is not null)
        {
            return existingFolder.Id;
        }

        var requestBody = JsonContent.Create(new Dictionary<string, object?>
        {
            ["name"] = folderName,
            ["folder"] = new Dictionary<string, object?>(),
            ["@microsoft.graph.conflictBehavior"] = "fail"
        });

        using var response = await SendAuthorizedAsync(
            accessToken,
            HttpMethod.Post,
            $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{parentItemId}/children",
            requestBody,
            cancellationToken);

        if (response.StatusCode == HttpStatusCode.Conflict)
        {
            var currentFolder = await TryGetItemAsync(accessToken, driveId, parentItemId, folderName, cancellationToken);
            if (currentFolder is not null)
            {
                return currentFolder.Id;
            }
        }

        var createdFolder = await ReadRequiredAsync<GraphDriveItemResponse>(response, cancellationToken);
        return createdFolder.Id;
    }

    private async Task<GraphDriveItemResponse?> TryGetItemAsync(
        string accessToken,
        string driveId,
        string parentItemId,
        string itemName,
        CancellationToken cancellationToken)
    {
        var requestUri =
            $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{parentItemId}:/{Uri.EscapeDataString(itemName)}?$select=id,name,webUrl";

        using var response = await SendAuthorizedAsync(accessToken, HttpMethod.Get, requestUri, null, cancellationToken);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"SharePoint path lookup failed for '{itemName}' with status {(int)response.StatusCode}: {error}");
        }

        return await response.Content.ReadFromJsonAsync<GraphDriveItemResponse>(JsonOptions, cancellationToken);
    }

    private async Task<HttpResponseMessage> SendGraphAsync(
        ConnectionProfile connection,
        HttpMethod method,
        string requestUri,
        HttpContent? content,
        CancellationToken cancellationToken)
    {
        var accessToken = await GetAccessTokenAsync(connection, cancellationToken);
        return await SendAuthorizedAsync(accessToken, method, requestUri, content, cancellationToken);
    }

    private async Task<HttpResponseMessage> SendAuthorizedAsync(
        string accessToken,
        HttpMethod method,
        string requestUri,
        HttpContent? content,
        CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient();
        using var request = new HttpRequestMessage(method, requestUri) { Content = content };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        if (response.IsSuccessStatusCode || response.StatusCode == HttpStatusCode.NotFound || response.StatusCode == HttpStatusCode.Conflict)
        {
            return response;
        }

        var error = await response.Content.ReadAsStringAsync(cancellationToken);
        response.Dispose();
        throw new InvalidOperationException(
            $"SharePoint Graph request failed with status {(int)response.StatusCode}: {error}");
    }

    private async Task<string> GetAccessTokenAsync(
        ConnectionProfile connection,
        CancellationToken cancellationToken)
    {
        if (_tokenCache.TryGetValue(connection.Id, out var cachedToken)
            && cachedToken.ExpiresUtc > DateTimeOffset.UtcNow.AddMinutes(2))
        {
            return cachedToken.AccessToken;
        }

        if (string.IsNullOrWhiteSpace(connection.TenantId)
            || string.IsNullOrWhiteSpace(connection.ClientId)
            || string.IsNullOrWhiteSpace(connection.ClientSecret))
        {
            throw new InvalidOperationException(
                "SharePoint Online direct transfer requires tenant ID, client ID, and client secret.");
        }

        var tokenRequest = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["client_id"] = connection.ClientId,
            ["scope"] = "https://graph.microsoft.com/.default",
            ["client_secret"] = connection.ClientSecret,
            ["grant_type"] = "client_credentials"
        });

        var client = _httpClientFactory.CreateClient();
        using var response = await client.PostAsync(
            $"https://login.microsoftonline.com/{connection.TenantId}/oauth2/v2.0/token",
            tokenRequest,
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"Failed to acquire a Microsoft Graph access token: {error}");
        }

        var token = await ReadRequiredAsync<TokenResponse>(response, cancellationToken);
        var expiresUtc = DateTimeOffset.UtcNow.AddSeconds(Math.Max(60, token.ExpiresIn - 120));
        _tokenCache[connection.Id] = new CachedToken(token.AccessToken, expiresUtc);
        return token.AccessToken;
    }

    private static async Task<T> ReadRequiredAsync<T>(
        HttpResponseMessage response,
        CancellationToken cancellationToken)
    {
        var value = await response.Content.ReadFromJsonAsync<T>(JsonOptions, cancellationToken);
        if (value is null)
        {
            throw new InvalidOperationException("The remote service returned an empty response body.");
        }

        return value;
    }

    private static async Task<int> ReadAtMostAsync(
        Stream source,
        byte[] buffer,
        int bytesToRead,
        CancellationToken cancellationToken)
    {
        var totalBytesRead = 0;

        while (totalBytesRead < bytesToRead)
        {
            var bytesRead = await source.ReadAsync(
                buffer.AsMemory(totalBytesRead, bytesToRead - totalBytesRead),
                cancellationToken);

            if (bytesRead == 0)
            {
                break;
            }

            totalBytesRead += bytesRead;
        }

        return totalBytesRead;
    }

    private sealed record CachedToken(string AccessToken, DateTimeOffset ExpiresUtc);

    private sealed class TokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }

    private sealed class GraphSiteResponse
    {
        public string Id { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public string? WebUrl { get; set; }
    }

    private sealed class GraphDriveCollectionResponse
    {
        public IReadOnlyCollection<GraphDriveResponse> Value { get; set; } = Array.Empty<GraphDriveResponse>();
    }

    private sealed class GraphDriveResponse
    {
        public string Id { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? WebUrl { get; set; }
    }

    private sealed class GraphDriveItemResponse
    {
        public string Id { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? WebUrl { get; set; }
    }

    private sealed class GraphUploadSessionResponse
    {
        public string UploadUrl { get; set; } = string.Empty;
    }
}

public sealed record SharePointSiteDescriptor(string Id, string WebUrl, string Name);
public sealed record SharePointDriveDescriptor(string Id, string Name, string WebUrl);
public sealed record SharePointDriveItemDescriptor(string Id, string Name, string? WebUrl);
