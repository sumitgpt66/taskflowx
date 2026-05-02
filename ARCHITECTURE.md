# Deployment Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL FRONTEND                          │
│                  https://taskflowx.vercel.app                   │
│                                                                  │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  React App (No-JSX)                                   │     │
│  │  - index.html                                         │     │
│  │  - app.js                                             │     │
│  │  - style.css                                          │     │
│  │                                                       │     │
│  │  Env: REACT_APP_API_URL = <railway-backend-url>/api  │     │
│  └───────────────────────────────────────────────────────┘     │
│                              ↓                                   │
│                    API Calls to Backend                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/HTTPS
                         (CORS enabled)
┌─────────────────────────────────────────────────────────────────┐
│                      RAILWAY BACKEND                             │
│              https://taskflowx-api.railway.app                  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  Node.js/Express Server (server.js)                   │     │
│  │  - PORT: 5000                                         │     │
│  │  - Routes: /api/login, /api/signup, /api/tasks, etc. │     │
│  │                                                       │     │
│  │  Env: JWT_SECRET, DB_HOST, DB_USER, DB_PASSWORD      │     │
│  └───────────────────────────────────────────────────────┘     │
│                              ↓                                   │
│                     Database Queries                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RAILWAY DATABASE                              │
│                       MySQL 8.0                                 │
│                  mysql.railway.internal:3306                    │
│                                                                  │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  taskflowx Database                                   │     │
│  │  - users table                                        │     │
│  │  - projects table                                     │     │
│  │  - tasks table                                        │     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deployment Flow

### Step 1: Push Code to GitHub
```
Local Development
    ↓
$ git add .
$ git commit -m "..."
$ git push origin main
    ↓
GitHub Repository (taskflowx)
```

### Step 2: Deploy Backend to Railway
```
GitHub Repo
    ↓
Railway Auto-Detects package.json
    ↓
    ├─ Runs: npm install
    ├─ Runs: node server.js
    ├─ Connects to MySQL (auto-provisioned)
    ├─ Sets environment variables
    └─ Deploys to: https://taskflowx-api.railway.app
```

### Step 3: Deploy Frontend to Vercel
```
GitHub Repo
    ↓
Vercel Auto-Detects client/ folder
    ↓
    ├─ Sets REACT_APP_API_URL env var
    ├─ Serves index.html + app.js + style.css
    └─ Deploys to: https://taskflowx.vercel.app
```

### Step 4: Update CORS & Test
```
Update server.js with Vercel URL
    ↓
Push to GitHub
    ↓
Railway Auto-Redeploys
    ↓
Frontend & Backend work together ✅
```

---

## File Structure Overview

```
taskflowx/
│
├─── CLIENT (Deploy to Vercel)
│    └── client/
│        ├── index.html              ← Entry point (updated)
│        ├── app.js                  ← React app (updated)
│        ├── style.css
│        ├── vercel.json             ← Vercel config (NEW)
│        ├── .vercelignore           ← Ignore patterns (NEW)
│        └── .env.local              ← Local dev vars (NEW)
│
├─── BACKEND (Deploy to Railway)
│    └── server/
│        ├── server.js               ← Express server (updated)
│        ├── routes.js               ← API endpoints
│        ├── db.js                   ← Database (updated)
│        ├── package.json            ← Dependencies (updated)
│        └── .env.example            ← Template (NEW)
│
├─── DATABASE
│    └── database/
│        └── schema.sql              ← SQL init script
│
└─── DOCS & CONFIG
     ├── .gitignore                  ← Git ignore (NEW)
     ├── DEPLOYMENT.md               ← Full guide (NEW)
     ├── RAILWAY_DEPLOYMENT.md       ← Backend guide (NEW)
     ├── VERCEL_DEPLOYMENT.md        ← Frontend guide (NEW)
     ├── DEPLOYMENT_CHECKLIST.md     ← Quick ref (NEW)
     └── SETUP_SUMMARY.md            ← This summary (NEW)
```

---

## Environment Variables Overview

### How They Flow

#### Local Development
```
app.js                                    app.js
window.__TASKFLOWX_API_URL__ ← index.html ← fallback: http://localhost:5000/api
```

#### Production (Vercel)
```
Vercel Platform
    ↓
Sets: REACT_APP_API_URL=https://railway-api.app/api
    ↓
Injected into HTML at build time
    ↓
index.html: process.env.REACT_APP_API_URL
    ↓
app.js receives correct backend URL
```

#### Production (Railway)
```
Railway Dashboard
    ↓
Sets: DB_HOST, DB_USER, DB_PASSWORD, etc.
    ↓
db.js reads: process.env.DB_HOST
    ↓
Connects to MySQL at deployment time
```

---

## Critical URLs

| Component | Local | Production |
|-----------|-------|------------|
| Frontend | http://localhost:3000 | https://taskflowx.vercel.app |
| Backend | http://localhost:5000 | https://taskflowx-api.railway.app |
| Database | localhost:3306 | mysql.railway.internal:3306 |
| API Endpoint | http://localhost:5000/api | https://taskflowx-api.railway.app/api |

---

## Deployment Checklist

### Before Deploy ✓
- [ ] Code committed to GitHub
- [ ] `.gitignore` prevents secrets from uploading
- [ ] `DEPLOYMENT.md` reviewed
- [ ] GitHub account ready

### Deploy Backend (Railway) ✓
- [ ] Railway account created
- [ ] GitHub connected to Railway
- [ ] MySQL database created
- [ ] Environment variables set (DB_HOST, DB_USER, etc.)
- [ ] schema.sql executed in database
- [ ] Backend URL noted: `https://xxx.railway.app`
- [ ] Health check passes: `curl https://xxx.railway.app`

### Deploy Frontend (Vercel) ✓
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Root directory set to `./client`
- [ ] `REACT_APP_API_URL` set to Railway URL
- [ ] Deployment successful
- [ ] Frontend URL noted: `https://xxx.vercel.app`

### Post-Deploy ✓
- [ ] Update CORS in server.js with Vercel URL
- [ ] Push to GitHub
- [ ] Railway auto-redeploys
- [ ] Test login on Vercel URL
- [ ] Test API calls work

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot reach API" | CORS not configured | Add Vercel URL to server.js CORS |
| "Blank page" | API URL not injected | Check REACT_APP_API_URL in Vercel |
| "Database error" | Schema not initialized | Run schema.sql in Railway MySQL |
| "Port already in use" | Process still running | Kill process or use different port |
| "Build failed" | Missing dependencies | Run `npm install` locally first |

---

## Monitoring & Logs

### Railway Logs
1. Dashboard → Node.js service
2. Click "View Logs"
3. See real-time server output

### Vercel Logs
1. Dashboard → Your project
2. Click "Deployments"
3. Click successful deployment
4. See build and runtime logs

### Local Logs
```bash
# Terminal 1: Server
cd server && npm start
# See all console.log and errors

# Terminal 2: Check requests
curl -X GET http://localhost:5000/api/stats \
  -H "Authorization: Bearer <token>"
```

---

## Next: Quick Start

1. **Read**: `DEPLOYMENT.md` for overview
2. **Backend**: Follow `RAILWAY_DEPLOYMENT.md` 
3. **Frontend**: Follow `VERCEL_DEPLOYMENT.md`
4. **Test**: Login at your Vercel URL
5. **Success**: Both platforms working together ✅

