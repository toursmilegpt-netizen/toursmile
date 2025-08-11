#!/bin/bash

echo "🚀 TourSmile VPS Deployment Script"
echo "=================================="

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.11 and pip
echo "📦 Installing Python..."
sudo apt update
sudo apt install -y python3 python3-pip python3-venv

# Install MongoDB
echo "📦 Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install serve for React
echo "📦 Installing serve..."
sudo npm install -g serve

# Create application directory
echo "📁 Creating application directories..."
sudo mkdir -p /var/www/toursmile
sudo chown -R $USER:$USER /var/www/toursmile

# Install Certbot for SSL
echo "🔒 Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

echo "✅ Basic setup complete!"
echo "Next: Upload your application files to /var/www/toursmile/"