# EasyCoach

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
