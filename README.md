# Zettalogix Migration Suite

Zettalogix Migration Suite (ZMS) is a starter codebase for migrating:

- Google Drive folders to SharePoint Online
- File Shares to SharePoint Online
- SharePoint On-Prem to SharePoint Online (demo stub source)

The repository uses a modular clean-architecture layout with an ASP.NET Core API, EF Core persistence, a background migration engine, React web UI, SQL schema, and an Electron desktop shell.

## Solution Structure

```text
ZettalogixMigrationSuite/
|-- ZMS.API
|-- ZMS.Application
|-- ZMS.Connectors.FileShare
|-- ZMS.Connectors.GoogleDrive
|-- ZMS.Connectors.SharePointOnPrem
|-- ZMS.Connectors.SharePointOnline
|-- ZMS.Core
|-- ZMS.Database
|-- ZMS.DesktopApp
|-- ZMS.Infrastructure
|-- ZMS.MigrationEngine
|-- ZMS.Reporting
`-- ZMS.WebUI
```

## Current Flow

The app supports per-connection configuration. It is not tied to one Google Drive folder, one SharePoint tenant, or one SharePoint document library.

1. Open the React app.
2. Go to `Connections`.
3. Add a `Google Drive` source connection by pasting a Google Drive folder link or folder ID.
4. Add a `SharePoint Online` target connection with that user's tenant ID, app client ID, app client secret, site URL, and document library name.
5. Test both saved connections.
6. Go to `Migrations`.
7. Create a migration job by selecting the saved source and saved target.
8. Start the job and monitor progress, completed files, failed files, and logs.

The backend stores `sourceConnectionId` and `targetConnectionId` on each job. The migration processor loads those selected connection records from the database before listing Google Drive files or uploading to SharePoint.

## Help Center

The React UI includes a Help Center at `/help`. It gives operators:

- A step-by-step migration runbook.
- Direct links to Microsoft Entra, Microsoft Graph, Google Cloud, Google OAuth, and Google Picker setup pages.
- Google Drive, SharePoint Online, and deployment requirement checklists.
- Error explanations for common API, Google, SharePoint, file share, upload, throttling, and Data Protection failures.

The job detail page and connection cards also use the same error guidance so failed tests and failed migrations show likely causes and concrete checks instead of only raw exception text.

## Backend Modules

- `ZMS.Core`: domain models, enums, and repository/connector contracts.
- `ZMS.Application`: service layer for connection management, discovery, dashboard summaries, and job orchestration.
- `ZMS.Infrastructure`: EF Core `DbContext`, SQL Server configuration, and repository implementations.
- `ZMS.MigrationEngine`: background queue, batch processor, and retry mechanism.
- `ZMS.Connectors.GoogleDrive`: Google Drive source connector using backend-configured OAuth refresh-token access.
- `ZMS.Connectors.SharePointOnline`: Microsoft Graph target connector for per-connection site/library validation, folder creation, and file uploads.
- `ZMS.Connectors.FileShare`: file system source connector with real folder enumeration.
- `ZMS.Connectors.SharePointOnPrem`: source discovery stub for SharePoint On-Prem.
- `ZMS.Reporting`: report composition for failed items and recent logs.
- `ZMS.API`: API host exposing connection, discovery, jobs, dashboard, reports, and health endpoints.

## Frontend Env

Frontend `.env` contains only public Google Picker/browser values:

```env
VITE_API_BASE_URL=http://localhost:5206
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_API_KEY=
VITE_GOOGLE_APP_ID=
VITE_GOOGLE_DRIVE_SCOPE=https://www.googleapis.com/auth/drive.readonly
```

Do not put Google Drive folder links, Google client secrets, Google refresh tokens, SharePoint client secrets, or tenant-specific SharePoint values in `.env`.

## Backend Google Configuration

Google Drive OAuth values are configured on the backend only. Set these environment variables before running `ZMS.API`:

```powershell
$env:GOOGLE_CLIENT_ID = "your-google-oauth-client-id.apps.googleusercontent.com"
$env:GOOGLE_CLIENT_SECRET = "your-google-client-secret"
$env:GOOGLE_REFRESH_TOKEN = "your-google-refresh-token"
```

You can also use the `GoogleDrive` section in `ZMS.API/appsettings.json` for local testing, but do not commit real values.

## Secret Protection

Saved connection secrets are protected with ASP.NET Core Data Protection before they are written to the database. In production, configure a persistent key ring path so secrets can still be decrypted after restarts, redeployments, or horizontal scaling:

```powershell
$env:DataProtection__KeyRingPath = "D:\zms\data-protection-keys"
```

Use a folder outside the repo and back it up with the deployment. If the key ring is lost, existing protected connection secrets cannot be decrypted and those connections must be recreated.

## Per-Connection Inputs

Google Drive source connection values are entered inside the app:

- Connection name
- Google Drive folder link or folder ID

SharePoint Online target connection values are entered inside the app:

- Connection name
- Microsoft Entra tenant ID
- Microsoft Entra app client ID
- Microsoft Entra app client secret
- SharePoint site URL
- SharePoint document library name

API responses do not return raw secrets. The UI only shows masked indicators such as `********` after a connection is saved.

## API Endpoints

- `GET /api/health`
- `GET /api/dashboard/summary`
- `GET /api/connections`
- `POST /api/connections`
- `POST /api/connections/{connectionId}/test`
- `GET /api/discovery/{sourceConnectionId}/sites`
- `GET /api/discovery/{sourceConnectionId}/libraries?sourceLocation=...`
- `GET /api/discovery/{sourceConnectionId}/summary?sourceLocation=...&libraryName=...`
- `GET /api/jobs`
- `GET /api/jobs/{jobId}`
- `GET /api/jobs/{jobId}/items`
- `POST /api/jobs`
- `POST /api/jobs/{jobId}/start`
- `POST /api/jobs/{jobId}/pause`
- `POST /api/jobs/{jobId}/resume`
- `GET /api/reports/jobs/{jobId}`

## Database

- EF Core uses the `ZmsDatabase` connection string from `ZMS.API/appsettings.json`.
- The explicit SQL starter schema is in `ZMS.Database/Scripts/001_initial_schema.sql`.
- The API also calls `Database.EnsureCreated()` on startup for a quick first-run experience.

## Production Deployment Checklist

1. Use a real SQL Server database and supply it through `ConnectionStrings__ZmsDatabase`.
2. Set backend-only Google variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN`.
3. Set `DataProtection__KeyRingPath` to a persistent, private folder on the API host.
4. Set `Cors__AllowedOrigins__0` to the deployed frontend origin.
5. Build and publish the API:

```powershell
dotnet publish .\ZMS.API\ZMS.API.csproj -c Release -o .\artifacts\api
```

6. Build the frontend:

```powershell
Set-Location .\ZMS.WebUI
npm ci
npm run build
```

7. Deploy `ZMS.WebUI/dist` as static files and configure `VITE_API_BASE_URL` during the build for the deployed API URL.
8. Put HTTPS in front of both the API and web UI.
9. Verify the deployment:

```powershell
Invoke-RestMethod https://your-api-host/api/health
```

10. Create a Google Drive source connection and a SharePoint Online target connection, test both, create a small migration job, and verify the uploaded files in SharePoint.

Example production templates are included at `ZMS.API/appsettings.Production.example.json` and `ZMS.WebUI/.env.production.example`. Prefer host environment variables or a secret manager for real secrets.

## Render Deployment

Deploy the API as a separate Render web service. The frontend service that runs `npm run preview` only serves React files; it does not start `ZMS.API`.

### Backend API service

Use the included `Dockerfile.api` from the repository root:

- Runtime: `Docker`
- Dockerfile path: `./Dockerfile.api`
- Docker context: `.`

Set these Render environment variables:

```text
ASPNETCORE_ENVIRONMENT=Production
Database__Provider=Sqlite
ConnectionStrings__ZmsDatabase=Data Source=/tmp/zms.db
DataProtection__KeyRingPath=/tmp/dataprotection-keys
Cors__AllowedOrigins__0=https://your-frontend-service.onrender.com
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REFRESH_TOKEN=your-google-refresh-token
```

The free Render plan uses an ephemeral filesystem, so the SQLite database and Data Protection keys can be lost when the service restarts or redeploys. For durable saved connections and job history, use a paid persistent disk or switch `Database__Provider` back to SQL Server with a hosted SQL Server/Azure SQL connection string.

After the API deploys, verify:

```powershell
Invoke-RestMethod https://your-api-service.onrender.com/api/health
```

### Frontend service

Set this Render environment variable on the web UI service and redeploy:

```text
VITE_API_BASE_URL=https://your-api-service.onrender.com
```

Do not use `http://localhost:5206` in Render. In the browser, `localhost` means the visitor's machine, not the Render backend.

## Run Instructions

### 1. Restore and build the backend

```powershell
Set-Location "d:\projects\Shearpoint to google\ZettalogixMigrationSuite"
dotnet restore .\Zettalogix.MigrationSuite.sln
dotnet build .\Zettalogix.MigrationSuite.sln
```

### 2. Run the API

```powershell
Set-Location ".\ZMS.API"
$env:GOOGLE_CLIENT_ID = "your-google-oauth-client-id.apps.googleusercontent.com"
$env:GOOGLE_CLIENT_SECRET = "your-google-client-secret"
$env:GOOGLE_REFRESH_TOKEN = "your-google-refresh-token"
$env:ASPNETCORE_URLS = "http://localhost:5206"
dotnet run
```

### 3. Run the React web UI

```powershell
Set-Location "..\ZMS.WebUI"
Copy-Item .env.example .env -Force
npm install
npm run dev
```

### 4. Run the Electron shell

```powershell
Set-Location "..\ZMS.DesktopApp"
npm install
$env:ZMS_DESKTOP_START_URL = "http://localhost:5173"
npm run dev
```

## Demo Flow

1. Start the API.
2. Start the React UI.
3. Add a Google Drive source connection.
4. Add a SharePoint Online target connection.
5. Test both connections.
6. Create a migration job from the saved source and target.
7. Start migration.
8. Verify uploaded files in the selected SharePoint document library.

## Submission Notes

- Secrets must not be committed to GitHub.
- Google Drive folder links are entered in the app, not backend files.
- Google client secret and refresh token are backend-only values, not frontend form fields.
- Different users can create different Google Drive source and SharePoint Online target connections.
- SharePoint target tenant/site/library values are not hardcoded globally.
- SharePoint On-Prem is a stub/demo connector and should be replaced with CSOM or PnP Framework for live on-prem migration.
- Saved connection secrets use ASP.NET Core Data Protection; configure a persistent key ring before production.
- Replace `EnsureCreated()` with EF Core migrations once the schema begins to evolve.
