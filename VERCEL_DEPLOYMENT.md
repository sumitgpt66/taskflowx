# Vercel Deployment Guide (Frontend)

## Step-by-Step Vercel Deployment

### Prerequisites

- Your Railway backend is deployed and running
- You have your Railway backend URL (e.g., `https://taskflowx-server-production-xxxx.railway.app`)
- Code is pushed to GitHub

---

### 1. Connect GitHub to Vercel

1. Go to https://vercel.com/
2. Sign up/Login with GitHub
3. Click **"Import Project"**
4. Select **"Import Git Repository"**
5. Find and select your `taskflowx` repository

---

### 2. Configure Project Settings

In the import dialog, set:

#### Build Settings
- **Framework Preset**: `Other` (because it's static React)
- **Build Command**: (leave empty or clear if auto-filled)
- **Install Command**: `exit 0`
- **Output Directory**: (leave empty)

#### Root Directory
- Click **"Edit"** next to "Root Directory"
- Change from `.` to `./client`
- This tells Vercel to deploy only the client folder

---

### 3. Add Environment Variables

Before clicking Deploy, add the environment variable:

1. In the same import dialog, look for **"Environment Variables"** section
2. Click **"+ Add"**
3. Add:
   ```
   Name: REACT_APP_API_URL
   Value: https://your-railway-backend-url/api
   ```

**Example:**
```
REACT_APP_API_URL=https://taskflowx-server-production-abc123.railway.app/api
```

Replace with your actual Railway URL (without `/api` - app.js adds it).

---

### 4. Deploy

Click **"Deploy"** button and wait for the build to complete (1-2 minutes).

**Success indicators:**
- Build status shows ✅ "Ready"
- You get a deployment URL like: `https://taskflowx.vercel.app`

---

### 5. Get Your Frontend URL

From the Vercel dashboard:
- Your main URL: `https://taskflowx.vercel.app`
- This is what you provide to users

---

### 6. Update Railway CORS (Important!)

Now that you have your Vercel URL, update your Railway server to allow it:

1. In your `server.js`, update the CORS configuration:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://taskflowx.vercel.app'  // Add your Vercel URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

2. Commit and push to GitHub:
```bash
git add server/server.js
git commit -m "Add Vercel frontend to CORS origins"
git push origin main
```

3. Railway will automatically redeploy

---

## Testing the Deployment

1. Visit your Vercel URL: `https://taskflowx.vercel.app`
2. You should see the TaskFlowX login page
3. Try logging in with: `admin@gmail.com` / `1234`
4. Create a project and task to test

---

## Environment Variables Explained

The `REACT_APP_` prefix is important - Vercel only injects variables that start with this prefix into your React app at build time.

**In your app.js:**
```javascript
const API = window.__TASKFLOWX_API_URL__ || 'http://127.0.0.1:5000/api';
```

**In your index.html:**
```javascript
window.__TASKFLOWX_API_URL__ = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
```

Vercel will replace `process.env.REACT_APP_API_URL` with your actual Railway URL.

---

## Troubleshooting

### Frontend Shows Blank Page
- Check browser console for errors (F12)
- Verify files are in `/client` folder
- Check that `index.html` and `app.js` exist

### "Cannot reach API" Errors
1. Open browser console (F12) → Network tab
2. Check if API requests are being made
3. Verify `REACT_APP_API_URL` environment variable is set in Vercel
4. Confirm it matches your Railway backend URL
5. Check that Railway CORS allows your Vercel URL

### Build Failed
- Check Vercel build logs (in dashboard)
- Verify no JavaScript syntax errors in `/client` files
- Confirm `package.json` (if exists) has no issues

### API Calls Get CORS Error
This means Railway doesn't recognize your Vercel domain.

**Solution:**
1. Update `server.js` CORS with your Vercel URL
2. Push to GitHub
3. Wait for Railway to redeploy
4. Try again in 1-2 minutes

### Vercel Can't Find Files
- Verify root directory is set to `./client`
- Check files are actually in the client folder
- Ensure no file name typos

---

## Updating Code

Vercel auto-redeploys when you push to GitHub:

```bash
# Make changes to client files
git add client/
git commit -m "Update frontend"
git push origin main
```

Watch deployment status in Vercel dashboard (should take 1-2 minutes).

---

## Domain Configuration (Optional)

To use a custom domain:

1. In Vercel dashboard, click your project
2. Go to **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS instructions

Example: `taskflowx.yourdomain.com`

---

## Environment Variables Reference

| Variable | Example | Required |
|----------|---------|----------|
| `REACT_APP_API_URL` | `https://taskflowx-server.railway.app/api` | ✅ Yes |

---

## Common URLs

| Service | URL Pattern | Example |
|---------|------------|---------|
| Frontend | `https://[project].vercel.app` | `https://taskflowx.vercel.app` |
| Backend | `https://[service]-production-xxxx.railway.app` | `https://taskflowx-server-production-abc123.railway.app` |

---

## Next Steps

1. ✅ Deploy backend to Railway (RAILWAY_DEPLOYMENT.md)
2. ✅ Deploy frontend to Vercel (this file)
3. Test both services
4. Configure custom domain (optional)
5. Monitor logs and uptime

---

## Support

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app/
- Common Issues: https://vercel.com/docs/troubleshooting
