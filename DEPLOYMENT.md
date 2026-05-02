# TaskFlowX Deployment Guide

This guide covers deploying TaskFlowX to **Railway** (backend) and **Vercel** (frontend).

---

## Architecture Overview

- **Backend**: Node.js + Express on Railway
- **Database**: MySQL on Railway
- **Frontend**: Static React app on Vercel

---

## Prerequisites

1. **GitHub Account** - Push your code to GitHub (both platforms support GitHub integration)
2. **Railway Account** - Create at https://railway.app/
3. **Vercel Account** - Create at https://vercel.com/
4. **Git** - Version control

---

## STEP 1: Prepare for GitHub

### 1.1 Initialize Git (if not already done)

```bash
cd d:\Downloads\files
git init
git add .
git commit -m "Initial commit - TaskFlowX"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create a repository named `taskflowx`
3. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/taskflowx.git
git branch -M main
git push -u origin main
```

---

## STEP 2: Deploy Backend to Railway

### 2.1 Create Railway Project

1. Visit https://railway.app/
2. Click **"New Project"**
3. Select **"Deploy from GitHub"**
4. Authorize Railway to access your GitHub account
5. Select your `taskflowx` repository

### 2.2 Add MySQL Database

1. In Railway dashboard, click **"+ Add Service"**
2. Select **"MySQL"**
3. Wait for the database to provision

### 2.3 Configure Environment Variables

Once the services are created:

1. Click on the **Node.js service**
2. Go to **"Variables"** tab
3. Add these variables:

```
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-change-this
```

### 2.4 Add Database Connection Variables

Railway auto-generates MySQL variables. Find them in the **MySQL service Variables** tab:

Copy all MySQL variables from Railway and add them to Node.js service:

```
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_USER=<from Railway MySQL>
DB_PASSWORD=<from Railway MySQL>
DB_NAME=taskflowx
```

### 2.5 Set Start Command

1. Click on **Node.js service**
2. Go to **"Settings"** tab
3. Under **"Deployment"**, set:
   - **Start Command**: `node server.js`
   - **Build Command**: (leave empty)
   - **Install Command**: `npm install`

### 2.6 Configure CORS for Vercel

In your server, the CORS should be set to allow your Vercel domain. Update `server.js`:

After deployment to Vercel, you'll get a URL like `taskflowx.vercel.app`. Update CORS:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://taskflowx.vercel.app'  // Add your Vercel domain
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 2.7 Deploy Database Schema

You need to initialize the database. Use Railway's query tool:

1. Click on **MySQL service**
2. Find the connection details
3. Run the SQL from `database/schema.sql`:

```bash
mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> < database/schema.sql
```

Or use a GUI tool like MySQL Workbench.

### 2.8 Get Your Backend URL

1. Click on **Node.js service**
2. Under **"Deployments"**, you'll see a domain like: `https://taskflowx-api.railway.app`
3. **Note this URL** - you'll need it for Vercel

---

## STEP 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project

1. Visit https://vercel.com/
2. Click **"Import Project"**
3. Select **"Import Git Repository"**
4. Choose your `taskflowx` repository

### 3.2 Configure Build Settings

In the import dialog:

1. **Framework Preset**: Select **"Other"** (static site)
2. **Root Directory**: Select **`./client`**
3. **Build Command**: (leave empty)
4. **Install Command**: `exit 0`
5. **Output Directory**: (leave empty)

### 3.3 Add Environment Variables

Before deploying, add:

```
REACT_APP_API_URL=https://taskflowx-api.railway.app/api
```

Replace `taskflowx-api.railway.app` with your actual Railway backend URL.

### 3.4 Deploy

Click **"Deploy"** and wait for the build to complete.

You'll get a URL like: `https://taskflowx.vercel.app`

---

## STEP 4: Update Railway CORS

Now that you have your Vercel URL, update your Railway server:

1. In Railway, click on **Node.js service**
2. Go to **"Variables"**
3. Update `CORS_ORIGIN` or modify `server.js`:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://taskflowx.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS error'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Commit and push this change to trigger a Railway redeploy.

---

## Testing

1. Visit your Vercel URL: `https://taskflowx.vercel.app`
2. Try logging in with: `admin@gmail.com / 1234`
3. Test creating projects and tasks

---

## Troubleshooting

### Frontend can't reach API

- Check that `REACT_APP_API_URL` is set correctly in Vercel
- Verify Railway backend is running (check deployments)
- Check browser console for CORS errors

### Database connection failed

- Verify MySQL variables are set in Railway Node.js service
- Run schema.sql manually in Railway MySQL
- Check DB_HOST is correct (should be `mysql.railway.internal`)

### Railway build fails

- Run `npm install` locally to verify all dependencies install
- Check `node_modules` isn't being pushed to GitHub (add to `.gitignore`)
- Verify `package.json` has all required dependencies

### Vercel shows blank page

- Check browser console for JavaScript errors
- Verify `index.html` and `app.js` are in the `client` folder
- Check that `REACT_APP_API_URL` environment variable is set

---

## Environment Variables Summary

### Railway (Node.js)

```
PORT=5000
NODE_ENV=production
JWT_SECRET=<your-secret>
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_USER=<from MySQL>
DB_PASSWORD=<from MySQL>
DB_NAME=taskflowx
```

### Vercel (React)

```
REACT_APP_API_URL=https://your-railway-domain.railway.app/api
```

---

## Future Updates

To update either service:

1. Make changes locally
2. Commit and push to GitHub
3. Both Railway and Vercel will automatically redeploy

---

## Support

- Railway Docs: https://docs.railway.app/
- Vercel Docs: https://vercel.com/docs
