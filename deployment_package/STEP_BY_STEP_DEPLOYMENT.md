# TourSmile VPS Deployment Guide
## Step-by-Step Instructions for beta.vimanpravas.com

### Prerequisites:
- VPS IP: `157.230.158.6`
- Root password: (as set during VPS creation)
- DNS: Update beta.vimanpravas.com to point to 157.230.158.6

---

## Step 1: Connect to VPS
```bash
ssh root@157.230.158.6
# Enter your root password when prompted
```

## Step 2: Upload Deployment Files
From your local machine, upload the deployment package:
```bash
# Upload the deployment files (use SCP or FileZilla)
scp -r /path/to/deployment_package root@157.230.158.6:/root/
```

## Step 3: Run Initial Setup
```bash
# On VPS, run the setup script
cd /root/deployment_package
chmod +x deploy_to_vps.sh
./deploy_to_vps.sh
```

## Step 4: Upload Application Files
```bash
# Create application structure
mkdir -p /var/www/toursmile/frontend
mkdir -p /var/www/toursmile/backend

# Copy frontend build files
cp -r beta_frontend_build/* /var/www/toursmile/frontend/

# Copy backend files
cp -r backend/* /var/www/toursmile/backend/

# Copy production environment file
cp backend_env_production /var/www/toursmile/backend/.env
```

## Step 5: Configure Nginx
```bash
# Copy nginx configuration
sudo cp nginx_config.conf /etc/nginx/sites-available/toursmile
sudo ln -s /etc/nginx/sites-available/toursmile /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 6: Start Backend
```bash
# Make start script executable and run
chmod +x start_backend.sh
./start_backend.sh
```

## Step 7: Configure SSL (Let's Encrypt)
```bash
# Get SSL certificate
sudo certbot --nginx -d beta.vimanpravas.com

# Test SSL renewal
sudo certbot renew --dry-run
```

## Step 8: Verify Deployment
1. Visit: `https://beta.vimanpravas.com`
2. Should show TourSmile booking system (not coming soon page)
3. Test flight search functionality
4. Check browser console for any errors

---

## Troubleshooting Commands:

### Check Services Status:
```bash
# Check nginx
sudo systemctl status nginx

# Check MongoDB
sudo systemctl status mongod

# Check backend process
pm2 status
pm2 logs toursmile-backend
```

### View Logs:
```bash
# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Backend logs
pm2 logs toursmile-backend --lines 50
```

### Restart Services:
```bash
# Restart nginx
sudo systemctl restart nginx

# Restart backend
pm2 restart toursmile-backend

# Restart MongoDB
sudo systemctl restart mongod
```

---

## Expected Result:
✅ **https://beta.vimanpravas.com** shows full TourSmile booking system
✅ **SSL certificate** working (green lock in browser)
✅ **Flight search** functional with Amadeus API
✅ **Email notifications** working via Interserver SMTP
✅ **Mobile responsive** design working

## Files Included:
- `deploy_to_vps.sh` - Initial VPS setup script
- `nginx_config.conf` - Nginx web server configuration
- `backend_env_production` - Production environment variables
- `start_backend.sh` - Backend startup script
- `beta_frontend_build/` - React app optimized for beta subdomain
- `backend/` - Complete FastAPI backend application