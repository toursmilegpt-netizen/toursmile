#!/bin/bash

echo "🚀 VimanaRavas Beta Deployment Script for Ubuntu VPS"
echo "=================================================="
echo "VPS IP: 157.250.198.6"
echo "Domain: beta.vimanpravas.com"
echo "Repository: /var/www/vimanpravas"
echo ""

# Check if we're in the correct directory
if [ ! -d "/var/www/vimanpravas" ]; then
    echo "❌ Repository not found at /var/www/vimanpravas"
    echo "Please ensure the repository is cloned first:"
    echo "sudo git clone https://github.com/toursmilegpt-netizen/toursmile.git /var/www/vimanpravas"
    exit 1
fi

cd /var/www/vimanpravas

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (if not already installed)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Install Python and pip (if not already installed)
if ! command -v python3 &> /dev/null; then
    echo "📦 Installing Python..."
    sudo apt install -y python3 python3-pip python3-venv
else
    echo "✅ Python already installed: $(python3 --version)"
fi

# Install Nginx (if not already installed)
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt install -y nginx
else
    echo "✅ Nginx already installed"
fi

# Install PM2 globally (for process management)
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
else
    echo "✅ PM2 already installed"
fi

# Install Redis (if not already installed)
if ! command -v redis-server &> /dev/null; then
    echo "📦 Installing Redis..."
    sudo apt install -y redis-server
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
else
    echo "✅ Redis already installed"
fi

# PostgreSQL should already be installed and configured by user
echo "🔍 Checking PostgreSQL installation..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw vimanpravas_db; then
    echo "✅ PostgreSQL database 'vimanpravas_db' found"
else
    echo "❌ PostgreSQL database 'vimanpravas_db' not found"
    echo "Please ensure PostgreSQL is properly configured with:"
    echo "  - Database: vimanpravas_db"
    echo "  - User: vimanpravas_user"
    echo "  - Password: VimPrav2024!Secure#"
    exit 1
fi

# Setup Backend
echo "🔧 Setting up Backend..."
cd /var/www/vimanpravas/backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy production environment file
echo "🔧 Configuring backend environment..."
cd /var/www/vimanpravas
cp production_backend.env backend/.env

# Setup Frontend
echo "🔧 Setting up Frontend..."
cd /var/www/vimanpravas/frontend

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Copy production environment file
echo "🔧 Configuring frontend environment..."
cd /var/www/vimanpravas
cp production_frontend.env frontend/.env

# Build the frontend
echo "🏗️ Building frontend..."
cd /var/www/vimanpravas/frontend
npm run build

# Configure Nginx
echo "🔧 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/beta.vimanpravas.com > /dev/null <<EOF
server {
    listen 80;
    server_name beta.vimanpravas.com www.beta.vimanpravas.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend (React app)
    location / {
        root /var/www/vimanpravas/frontend/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API (FastAPI)
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/beta.vimanpravas.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# Start Backend Service
echo "🚀 Starting backend service..."
cd /var/www/vimanpravas/backend
source venv/bin/activate

# Stop any existing backend process
pm2 delete vimanpravas-backend 2>/dev/null || true

# Start the backend with PM2
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name "vimanpravas-backend"

# Save PM2 configuration
pm2 save
pm2 startup

# Restart services
echo "🔄 Restarting services..."
sudo systemctl restart nginx
sudo systemctl enable nginx
sudo systemctl restart redis-server

# Install SSL certificate with certbot
echo "🔒 Setting up SSL certificate..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
fi

# Check if domain is properly configured
echo "🌐 Checking domain configuration..."
echo "Please ensure beta.vimanpravas.com points to 157.250.198.6"
echo "You can check this with: nslookup beta.vimanpravas.com"

# Verification
echo ""
echo "🎉 Deployment completed!"
echo "======================================"
echo "✅ Backend running on: http://localhost:8001"
echo "✅ Frontend built and served by Nginx"
echo "✅ PostgreSQL database configured"
echo "✅ Redis cache running"
echo "✅ PM2 process manager configured"
echo ""
echo "🔗 Access your application:"
echo "   HTTP:  http://beta.vimanpravas.com"
echo "   HTTPS: https://beta.vimanpravas.com (after SSL setup)"
echo ""
echo "📋 Next steps:"
echo "1. Ensure beta.vimanpravas.com DNS points to 157.250.198.6"
echo "2. Run SSL setup: sudo certbot --nginx -d beta.vimanpravas.com"
echo "3. Test the application functionality"
echo ""
echo "🔧 Useful commands:"
echo "   Check backend logs: pm2 logs vimanpravas-backend"
echo "   Restart backend: pm2 restart vimanpravas-backend"
echo "   Check nginx status: sudo systemctl status nginx"
echo "   Check nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""