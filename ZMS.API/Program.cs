using Microsoft.AspNetCore.DataProtection;
using System.Text.Json.Serialization;
using ZMS.Application.DependencyInjection;
using ZMS.Connectors.FileShare.DependencyInjection;
using ZMS.Connectors.GoogleDrive.DependencyInjection;
using ZMS.Connectors.SharePointOnPrem.DependencyInjection;
using ZMS.Connectors.SharePointOnline.DependencyInjection;
using ZMS.Core.Options;
using ZMS.Infrastructure.DependencyInjection;
using ZMS.Infrastructure.Persistence;
using ZMS.MigrationEngine.DependencyInjection;
using ZMS.Reporting.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddCors(options =>
{
    options.AddPolicy("ZmsCors", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:5173", "http://127.0.0.1:5173"];

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.Configure<MigrationEngineOptions>(builder.Configuration.GetSection(MigrationEngineOptions.SectionName));
builder.Services.Configure<GoogleDriveOptions>(builder.Configuration.GetSection(GoogleDriveOptions.SectionName));

var dataProtectionBuilder = builder.Services
    .AddDataProtection()
    .SetApplicationName("ZettalogixMigrationSuite");
var dataProtectionKeyRingPath = builder.Configuration["DataProtection:KeyRingPath"];
if (!string.IsNullOrWhiteSpace(dataProtectionKeyRingPath))
{
    dataProtectionBuilder.PersistKeysToFileSystem(new DirectoryInfo(dataProtectionKeyRingPath));
}

builder.Services
    .AddZmsApplication()
    .AddZmsInfrastructure(builder.Configuration)
    .AddSharePointOnPremConnector()
    .AddFileShareConnector()
    .AddGoogleDriveConnector()
    .AddSharePointOnlineConnector()
    .AddZmsReporting()
    .AddZmsMigrationEngine(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors("ZmsCors");
app.MapControllers();

await EnsureDatabaseCreatedAsync(app.Services);

app.Run();

static async Task EnsureDatabaseCreatedAsync(IServiceProvider services)
{
    using var scope = services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ZmsDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
}
