# Production Deployment Guide

## 🚨 CRITICAL SECURITY ISSUES TO FIX BEFORE DEPLOYMENT

### 1. Move Google Drive Credentials to Environment Variables

**Current Issue**: Credentials are hardcoded in `backend/services/googleDriveService.js`

**Solution**: Create a `.env` file and update the service:

```bash
# .env file (DO NOT COMMIT TO GIT)
GOOGLE_DRIVE_TYPE=service_account
GOOGLE_DRIVE_PROJECT_ID=your-project-id
GOOGLE_DRIVE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_CLIENT_ID=your-client-id
GOOGLE_DRIVE_FOLDER_ID=1qWrBDsrm-Ghih3sfL0MsBiXx4vNLLKXx
```

### 2. Update Google Drive Service

```javascript
// backend/services/googleDriveService.js
require('dotenv').config();

const credentials = {
  type: process.env.GOOGLE_DRIVE_TYPE,
  project_id: process.env.GOOGLE_DRIVE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_DRIVE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
  // ... rest of credentials
};

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
```

### 3. Update Frontend API Calls

**Current Issue**: Frontend calls `http://localhost:3001/api/upload`

**Solution**: Use environment variable for API URL:

```typescript
// src/components/SiteUploadForm.tsx
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const response = await fetch(`${API_BASE_URL}/api/upload`, {
  method: 'POST',
  body: formData,
});
```

### 4. Update Backend CORS Configuration

**Current Issue**: CORS only allows `http://localhost:8081`

**Solution**: Allow your production domain:

```javascript
// backend/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || [
    'http://localhost:8081',
    'https://your-production-domain.com'
  ],
  credentials: true
}));
```

## 📋 Deployment Checklist

### Backend (.env file):
```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
GOOGLE_DRIVE_TYPE=service_account
GOOGLE_DRIVE_PROJECT_ID=your-project-id
GOOGLE_DRIVE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_CLIENT_ID=your-client-id
GOOGLE_DRIVE_FOLDER_ID=1qWrBDsrm-Ghih3sfL0MsBiXx4vNLLKXx
```

### Frontend (.env file):
```bash
VITE_API_URL=https://your-backend-api.com
```

### Files to Update:
1. `backend/services/googleDriveService.js` - Use environment variables
2. `backend/server.js` - Update CORS origins
3. `src/components/SiteUploadForm.tsx` - Use VITE_API_URL
4. Add `.env` files to `.gitignore`

## 🚀 Recommended Deployment Strategy

### Option 1: Separate Frontend/Backend (Recommended)
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Backend**: Railway, Render, or Heroku

### Option 2: Monorepo Deployment
- **Vercel**: Can deploy both frontend and backend
- **Railway**: Supports full-stack apps

## ⚠️ Security Notes

1. **Never commit `.env` files to git**
2. **Use different Google Service Accounts for dev/prod**
3. **Set up proper Google Drive folder permissions**
4. **Enable HTTPS in production**
5. **Set up proper error logging (not console.log)**

## 🧪 Testing Production Build

Before deploying, test locally with production settings:

```bash
# Backend
cd backend
NODE_ENV=production npm start

# Frontend
npm run build
npm run preview
```

Would you like me to help you implement these production-ready changes?
