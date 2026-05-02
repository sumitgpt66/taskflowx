# Quick Command Reference

## Local Development

### Start Backend
```bash
cd server
npm install  # First time only
npm start
# Server runs at http://localhost:5000
```

### Start Frontend
```bash
# Just visit http://localhost:5000 in browser
# Backend serves frontend files
```

### View Logs
```bash
# Backend logs print to terminal where npm start runs
# Frontend logs visible in browser console (F12)
```

---

## GitHub Setup (Required for Deployment)

### Initialize Git
```bash
cd d:\Downloads\files
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskflowx.git
git push -u origin main
```

### Update Existing Repo
```bash
git add .
git commit -m "Your message"
git push origin main
```

### Check Status
```bash
git status
git log --oneline
```

---

## Local Testing Before Deploy

### Test Backend Health
```bash
curl http://localhost:5000
# Should return JSON with endpoints
```

### Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"1234"}'
```

### Test Stats (Authenticated)
```bash
# First get token from login response, then:
curl -X GET http://localhost:5000/api/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Environment Setup

### Create Server .env (Local Development)
```bash
# Copy template
copy server\.env.example server\.env

# Edit and update with your values
# On Windows: notepad server\.env
```

### Sample .env Content
```
PORT=5000
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Sumit@123
DB_NAME=taskflowx
```

---

## Railway Deployment Commands

### Install Railway CLI
```bash
npm install -g @railway/cli
```

### Login to Railway
```bash
railway login
```

### List Services
```bash
railway service
```

### Connect to Database
```bash
mysql -h mysql.railway.internal -u root -p
# Enter password when prompted
```

### Run Schema
```bash
mysql -h mysql.railway.internal -u root -p < database/schema.sql
```

### View Logs
```bash
railway logs
```

---

## Database Management

### Local MySQL - Check Connection
```bash
mysql -h localhost -u root -p
# Enter password: Sumit@123
```

### Create Database Locally
```bash
mysql -u root -p -e "CREATE DATABASE taskflowx;"
```

### Initialize Schema Locally
```bash
mysql -u root -p taskflowx < database/schema.sql
```

### View Tables
```bash
mysql -u root -p taskflowx -e "SHOW TABLES;"
```

### View Users Table
```bash
mysql -u root -p taskflowx -e "SELECT id, email, role FROM users;"
```

---

## Docker Commands (Optional)

### Run MySQL in Docker
```bash
docker run --name taskflowx-db -e MYSQL_ROOT_PASSWORD=Sumit@123 -e MYSQL_DATABASE=taskflowx -d -p 3306:3306 mysql:8.0
```

### Stop Container
```bash
docker stop taskflowx-db
```

### View Container Logs
```bash
docker logs taskflowx-db
```

---

## Port Management (Windows)

### Check Port Usage
```bash
netstat -ano | findstr :5000
```

### Kill Process on Port
```bash
taskkill /PID <PID_NUMBER> /F
```

### Example
```bash
# Find process
netstat -ano | findstr :5000
# Output: PID 12345

# Kill it
taskkill /PID 12345 /F
```

---

## Node.js Management

### Check Node Version
```bash
node --version
npm --version
```

### Clear npm Cache
```bash
npm cache clean --force
```

### Reinstall Dependencies
```bash
cd server
rm -r node_modules
rm package-lock.json
npm install
```

---

## File Operations

### Check Current Directory
```bash
pwd  # Linux/Mac
cd   # Windows
```

### List Files
```bash
ls -la  # Linux/Mac
dir    # Windows
```

### Create .env File
```bash
# Windows
copy server\.env.example server\.env
notepad server\.env

# Linux/Mac
cp server/.env.example server/.env
nano server/.env
```

### Remove Files
```bash
# Windows
del filename.txt
rmdir /s foldername

# Linux/Mac
rm filename.txt
rm -r foldername
```

---

## Git Useful Commands

### See Recent Commits
```bash
git log --oneline -5
```

### Revert Last Commit (Before Push)
```bash
git reset --soft HEAD~1
```

### Revert Last Push
```bash
git revert HEAD
git push origin main
```

### Switch Branch
```bash
git checkout -b new-feature
git checkout main
```

### Merge Branch
```bash
git checkout main
git merge new-feature
```

---

## Deployment Verification

### Test After Deploy

#### Frontend (Vercel)
```bash
# In browser, visit your Vercel URL
https://taskflowx.vercel.app

# Open console (F12) and check for errors
# Try logging in with admin@gmail.com / 1234
```

#### Backend (Railway)
```bash
# Test health endpoint
curl https://your-railway-url.railway.app

# Test API endpoint
curl https://your-railway-url.railway.app/api/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"1234"}'
```

---

## Quick Fixes

### Clear Browser Cache
- Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Or: Settings → Privacy → Clear browsing data

### Hard Refresh Page
- Press `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### Check Network Requests
- Open DevTools: `F12`
- Go to "Network" tab
- Refresh page
- Look for failed requests (red)

### View API Response
- In Network tab, click request URL
- Click "Response" tab to see full response

---

## Emergency Commands

### Kill All Node Processes
```bash
# Windows
taskkill /IM node.exe /F

# Linux/Mac
killall node
```

### Find Process by Port
```bash
# Linux/Mac
lsof -i :5000
ps aux | grep node
```

### Force Delete Directory
```bash
# Windows
rmdir /s /q foldername

# Linux/Mac
rm -rf foldername
```

---

## Tips & Best Practices

### Always Test Locally First
```bash
npm start  # Run server
# Test all features
# Then push to GitHub
```

### Keep Secrets Secure
```bash
# Never commit .env file
# Add to .gitignore ✓
# Use environment variables in production ✓
# Change JWT_SECRET for production ✓
```

### Monitor Deployment Logs
```bash
# Railway: Dashboard → Logs
# Vercel: Dashboard → Deployments
# Local: Terminal output
```

### Test CORS Before Changing
```bash
# Test local frontend → local backend first
# Then local frontend → production backend
# Then production frontend → production backend
```

### Keep Backups
```bash
# Before major changes
git tag v1.0.0
git push origin v1.0.0
```

---

## Documentation Files

- `DEPLOYMENT.md` - Full deployment guide
- `RAILWAY_DEPLOYMENT.md` - Railway backend setup
- `VERCEL_DEPLOYMENT.md` - Vercel frontend setup
- `ARCHITECTURE.md` - System architecture diagram
- `SETUP_SUMMARY.md` - Summary of all changes
- `DEPLOYMENT_CHECKLIST.md` - Quick checklist

**Start with `DEPLOYMENT.md`**
