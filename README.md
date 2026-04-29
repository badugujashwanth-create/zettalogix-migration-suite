# Zettalogix Migration Suite

Zettalogix Migration Suite (ZMS) is a starter codebase for migrating:

- SharePoint On-Prem to SharePoint Online
- File Shares to SharePoint Online

The repository follows a modular clean-architecture layout and includes an ASP.NET Core API, EF Core persistence, a background migration engine, React web UI, SQL schema, and an Electron desktop shell.

## Solution Structure

```text
ZettalogixMigrationSuite/
├── ZMS.API
├── ZMS.Application
├── ZMS.Connectors.FileShare
├── ZMS.Connectors.SharePointOnPrem
├── ZMS.Connectors.SharePointOnline
├── ZMS.Core
├── ZMS.Database
├── ZMS.DesktopApp
├── ZMS.Infrastructure
├── ZMS.MigrationEngine
├── ZMS.Reporting
└── ZMS.WebUI
```

## Backend Modules

- `ZMS.Core`: domain models, enums, and repository/connector contracts.
- `ZMS.Application`: service layer for connection management, discovery, dashboard summaries, and job orchestration.
- `ZMS.Infrastructure`: EF Core `DbContext`, SQL Server configuration, and repository implementations.
- `ZMS.MigrationEngine`: background queue, batch processor, and retry mechanism.
- `ZMS.Connectors.SharePointOnPrem`: source discovery stub for SharePoint On-Prem.
- `ZMS.Connectors.FileShare`: file system source connector with real folder enumeration.
- `ZMS.Connectors.SharePointOnline`: target connector stub for site/library creation and file upload orchestration.
- `ZMS.Reporting`: report composition for failed items and recent logs.
- `ZMS.API`: API host exposing connection, discovery, jobs, dashboard, reports, and health endpoints.

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

## Frontend

The React app includes:

- `DashboardPage`: platform summary cards, recent jobs, and saved connections.
- `CreateJobPage`: connection management, connection testing, job creation, and discovery summary.
- `JobMonitorPage`: progress monitoring, start/pause/resume actions, failed items, and log stream.

Set the API URL for the frontend in `.env` using:

```env
VITE_API_BASE_URL=http://localhost:5206
```

## Desktop App

The Electron shell loads:

- `http://localhost:5173` during development
- `../ZMS.WebUI/dist/index.html` when packaged

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

## Notes For Expansion

- Replace the SharePoint connector stubs with Graph API, CSOM, or PnP Framework implementations.
- Move secrets out of SQL tables and into a secure store such as Azure Key Vault or Windows Credential Manager.
- Replace `EnsureCreated()` with EF Core migrations once the schema begins to evolve.
- Add authentication, authorization, and job scheduling isolation before production deployment.
