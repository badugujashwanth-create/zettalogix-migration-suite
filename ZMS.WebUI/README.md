# ZMS Frontend Web UI

This project is the frontend service for Zettalogix Migration Suite.

It owns:

- React/Vite operator UI.
- Connection forms and migration wizard.
- Job monitor and detail views.
- Report download links that call the backend API.
- Public browser-only Google Picker configuration.

Run locally:

```powershell
Set-Location "d:\projects\Shearpoint to google\ZettalogixMigrationSuite\ZMS.WebUI"
Copy-Item .env.example .env -Force
npm install
npm run dev
```

Required frontend API setting:

```env
VITE_API_BASE_URL=http://localhost:5206
```

Only `VITE_*` values are available in browser code. Do not put backend secrets, database connection strings, SharePoint client secrets, Google client secrets, or refresh tokens in this project.
