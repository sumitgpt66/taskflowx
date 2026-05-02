# Railway Deployment Guide (Backend)

## Step-by-Step Railway Deployment

### 1. Connect GitHub to Railway

1. Go to https://railway.app/
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub"**
5. Authorize Railway to access your repositories
6. Select `taskflowx` repository

### 2. Configure Node.js Service

Railway will auto-detect `package.json` and create a Node.js service.

1. Click the **Node.js service** card
2. Go to **"Settings"** tab
3. Set:
   - **Start Command**: `node server.js`
   - **Build Command**: (empty)
   - **Install Command**: (empty - npm install runs automatically)

### 3. Add MySQL Database

1. In your project, click **"+ Add Service"**
2. Select **"MySQL"**
3. Wait for database to provision (2-3 minutes)

### 4. Copy MySQL Credentials

1. Click the **MySQL service** card
2. Go to **"Variables"** tab
3. You'll see auto-generated variables like:
   ```
   MYSQLHOST=mysql.railway.internal
   MYSQLPORT=3306
   MYSQLUSER=root
   MYSQLPASSWORD=<random-password>
   MYSQLDATABASE=railway
   ```

4. **Copy these values** - you'll need them in the next step

### 5. Set Node.js Environment Variables

1. Click the **Node.js service** card
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add:

   ```
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-must-be-at-least-32-chars-long-change-this
   DB_HOST=mysql.railway.internal
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=<copy from MySQL MYSQLPASSWORD>
   DB_NAME=railway
   ```

**Important**: Replace `<copy from MySQL MYSQLPASSWORD>` with the actual password from MySQL variables.

### 6. Initialize Database Schema

You need to run the SQL schema to create tables.

#### Option A: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# List services
railway service

# Connect to MySQL and run schema
mysql -h mysql.railway.internal -u root -p < database/schema.sql
```

#### Option B: Using MySQL Workbench

1. Download MySQL Workbench
2. Get your public MySQL URL from Railway:
   - Click MySQL service
   - Go to **"Connect"** tab
   - Use the **Public Connection URL**
3. Create new connection
4. Open `database/schema.sql` and execute

#### Option C: Using Railway Web Shell

1. Click **MySQL service**
2. Click **"Web Shell"** (if available)
3. Run:
   ```sql
   CREATE DATABASE taskflowx;
   USE taskflowx;
   ```
4. Copy-paste contents of `database/schema.sql` and execute

### 7. Get Your Backend URL

1. Click **Node.js service**
2. Go to **"Deployments"** tab
3. Your public URL appears at the top, like:
   ```
   https://taskflowx-server-production-xxxx.railway.app
   ```

4. **Save this URL** - you'll need it for Vercel configuration

### 8. Monitor Deployment

The **"Deployments"** tab shows:
- Build status (should say "Success")
- Logs (click **"View Logs"** for debugging)

### Testing Backend

```bash
# Test health check
curl https://your-railway-url.railway.app

# Should return:
# {"message":"🚀 TaskFlowX API is running",...}
```

---

## Troubleshooting

### Build Failed
- Check logs for errors
- Verify `package.json` is in `/server` folder
- Ensure all dependencies are listed

### Database Connection Failed
- Verify all DB_ environment variables are set correctly
- Check DB_HOST is `mysql.railway.internal` (not localhost)
- Confirm MySQL service is running (green checkmark in Railway)
- Run schema.sql to initialize tables

### Port 5000 Already in Use
- Railway handles port automatically
- Remove any hardcoded port numbers
- Use `process.env.PORT || 5000`

### Permission Denied on Schema Upload
- Use Railway CLI instead of direct MySQL connection
- Or use MySQL Workbench with public URL

---

## Updating Code

Every time you push to GitHub, Railway auto-redeploys:

```bash
git add .
git commit -m "Update code"
git push origin main
```

Watch deployment status in Railway dashboard.

---

## Environment Variables Reference

| Variable | Example | Notes |
|----------|---------|-------|
| `PORT` | `5000` | Railway assigns automatically |
| `NODE_ENV` | `production` | Required |
| `JWT_SECRET` | `min-32-chars-long-secret` | Change for production |
| `DB_HOST` | `mysql.railway.internal` | Railway internal DNS |
| `DB_PORT` | `3306` | MySQL default |
| `DB_USER` | `root` | Default MySQL user |
| `DB_PASSWORD` | `<generated>` | From Railway MySQL |
| `DB_NAME` | `taskflowx` | Database name |

---

## CORS Configuration

Update `server.js` to allow requests from your Vercel frontend:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://taskflowx.vercel.app'  // Add your Vercel URL
  ],
  credentials: true
}));
```

Then redeploy to Railway.

---

## Next Step

Deploy frontend to Vercel using [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
