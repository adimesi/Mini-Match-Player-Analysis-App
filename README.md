# EasyCoach (local copy)

This repository contains a small full-stack React + Express example used for match details, players and events. The frontend consumes a local JSON for player/event breakdowns and can call the backend to fetch match metadata/video URLs.

## Requirements
- Node.js (recommended v16 or v18)
- npm (bundled with Node)

## Setup
1. Clone the repository (if not already done).
2. Install dependencies for backend and frontend.

From the project root (PowerShell):

```powershell
cd .\backend
# EasyCoach — local development copy

EasyCoach — Quick start

Minimal setup to run the app locally.

Prerequisites
- Node.js (v16 or v18)
- npm

Install

```powershell
cd .\backend
npm install
cd ..\frontend
npm install
```

Environment (optional)
- `backend/.env`: `EASYCOACH_MATCHES_API_URL`, `API_BASE_URL`, `USER_TOKEN` (only if you want real API proxying)
- `frontend/.env`: `REACT_APP_BACKEND_API=http://localhost:5000`

Run

Backend:
```powershell
cd .\backend
node .\index.js
# or: npx nodemon .\index.js
```

Frontend:
```powershell
cd .\frontend
npm start
```

Notes
- The frontend uses a local JSON (`frontend/src/data/...`) for player/events when remote APIs aren’t available.
- The backend is a simple proxy; if env vars are missing, proxy requests to external services will fail.
- No database is required to run the example.

Want shortcuts? I can add `start` scripts to `backend/package.json` or a small helper to launch both services.