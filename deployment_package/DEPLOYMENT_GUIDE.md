# TourSmile Beta Deployment Guide
## Deploy to beta.vimanpravas.com on Interserver

### IMPORTANT: Environment Configuration Required

**CRITICAL**: The backend URL needs to be updated for production deployment.

Current frontend configuration points to Emergent platform:
```
REACT_APP_BACKEND_URL=https://skyseeker.preview.emergentagent.com
```

**This needs to be changed to your Interserver domain before deployment.**

---

## Deployment Options Based on Your Hosting Type

### Option A: Shared Hosting (cPanel/DirectAdmin)

#### Frontend Deployment:
1. **Upload Files**: 
   - Upload contents of `beta_frontend_build/` to subdomain document root
   - Usually: `/public_html/beta/` or `/subdomains/beta/public_html/`

2. **Configure Subdomain**:
   - In cPanel: Go to "Subdomains" → Create "beta" subdomain
   - Point to the directory where you uploaded files

#### Backend Deployment:
⚠️ **Limitation**: Shared hosting typically doesn't support Python FastAPI applications
- You may need to upgrade to VPS hosting
- Alternative: Use serverless deployment (Vercel, Railway, etc.)

### Option B: VPS/Dedicated Server (SSH Access)

#### Prerequisites:
- SSH access to server
- Python 3.8+ installed
- Node.js installed (for serving React)
- Web server (Nginx/Apache) configured

#### Frontend Deployment:
1. Upload `beta_frontend_build/` to `/var/www/beta.vimanpravas.com/`
2. Configure Nginx/Apache virtual host for subdomain

#### Backend Deployment:
1. Upload `backend/` folder to server
2. Install Python dependencies: `pip install -r requirements.txt`
3. Configure FastAPI to run as service
4. Set up reverse proxy in web server

---

## Files Prepared for Deployment:

1. **`beta_frontend_build/`** - React app configured for beta subdomain
2. **`backend/`** - Complete FastAPI backend
3. **`frontend_build/`** - Original React app with coming soon logic

## Environment Variables Needed:

### Backend (.env file):
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=toursmile_production
OPENAI_API_KEY=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
SMTP_SERVER=mail.smileholidays.net
SMTP_PORT=587
SENDER_EMAIL=noreply@smileholidays.net
SENDER_PASSWORD=$c1Fz319n
NOTIFICATION_EMAIL=sujit@smileholidays.net
AMADEUS_API_KEY=zWqPgsnzkQVd4BNs2XW3eGbrjpvBknFJ
AMADEUS_API_SECRET=b607PXRZzOne4Z6L
```

### Frontend Environment:
```
REACT_APP_BACKEND_URL=https://beta.vimanpravas.com/api
```

---

## Next Steps:

1. **Identify your hosting type in control panel**
2. **Determine backend hosting capability**
3. **Update frontend environment variable**
4. **Follow appropriate deployment option above**

## Support:
If you encounter issues, provide:
- Hosting type (shared/VPS/dedicated)
- Control panel type (cPanel/DirectAdmin/Plesk)
- Any error messages during deployment