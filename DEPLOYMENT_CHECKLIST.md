# Quick Deployment Checklist

## Before Deploying to Railway & Vercel

- [ ] Install dependencies locally:
  ```bash
  cd server
  npm install
  cd ../client
  npm install  # (if there's a package.json)
  ```

- [ ] Update server/db.js to use environment variables ✅ (Done)
- [ ] Add dotenv to server/package.json ✅ (Done)
- [ ] Create .env.example ✅ (Done)
- [ ] Update app.js for dynamic API URL ✅ (Done)
- [ ] Create .gitignore ✅ (Done)

## Deployment Steps

### Quick Summary

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/taskflowx.git
   git push -u origin main
   ```

2. **Deploy Backend (Railway)**
   - Connect GitHub repo to Railway
   - Add MySQL database
   - Set environment variables (DB_HOST, DB_USER, DB_PASSWORD, etc.)
   - Deploy schema.sql to MySQL
   - Get backend URL

3. **Deploy Frontend (Vercel)**
   - Connect GitHub repo to Vercel
   - Set root directory to `./client`
   - Set `REACT_APP_API_URL` environment variable
   - Deploy

4. **Update CORS in Server**
   - Add your Vercel URL to allowed origins
   - Redeploy

## Testing URLs

- Frontend: `https://taskflowx.vercel.app` (after deployment)
- Backend: `https://taskflowx-api.railway.app` (after deployment)

## See DEPLOYMENT.md for detailed steps
