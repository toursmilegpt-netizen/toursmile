# 🚀 VPS Deployment Guide for TourSmile Priority 2 Features

## 📋 **Quick Deployment Steps**

### **Step 1: Upload Code to GitHub (Manual)**
Since we can't push from here directly, you'll need to:

1. **Download your current code:**
   - Use Emergent's export/download feature to get all files
   - Or copy the code manually

2. **Upload to GitHub:**
   - Go to your GitHub repo: https://github.com/toursmilegpt-netizen/toursmile-app
   - Click "uploading an existing file" or use GitHub Desktop
   - Upload all your files with Priority 2 features

### **Step 2: VPS Deployment Commands**

SSH into your VPS and run these commands:

```bash
# Navigate to your website directory
cd /var/www/beta.vimanpravas.com

# Pull latest code from GitHub
git pull origin main

# Install any new dependencies
cd backend
pip install -r requirements.txt

# Build frontend with Priority 2 features
cd ../frontend
yarn install
yarn build

# Restart services
sudo pm2 restart all
sudo systemctl reload nginx

# Check if everything is running
sudo pm2 status
```

### **Step 3: Verify Deployment**

Visit https://beta.vimanpravas.com and test:
- ✅ Flexible Date Calendar (±3 days checkbox)
- ✅ Smart Auto-complete (recent searches)
- ✅ Promotional Integration (promo codes)
- ✅ Optimized Passenger Selector

## 🔧 **Alternative: Direct File Transfer**

If GitHub upload is complex, you can also:

1. **SCP files directly:**
```bash
scp -r /local/app/* user@beta.vimanpravas.com:/var/www/beta.vimanpravas.com/
```

2. **Or use SFTP client** like FileZilla to transfer files

## 📞 **Troubleshooting**

If anything breaks:
```bash
# Check service status
sudo pm2 logs
sudo nginx -t
sudo supervisorctl status

# Restart everything
sudo pm2 restart all
sudo systemctl restart nginx
```

**Your Priority 2 features are ready for production!** 🎉