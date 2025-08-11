#!/bin/bash

# Navigate to backend directory
cd /var/www/toursmile/backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI with uvicorn using PM2
pm2 delete toursmile-backend 2>/dev/null || true
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name "toursmile-backend"

# Save PM2 configuration
pm2 save
pm2 startup

echo "✅ Backend started successfully on port 8001"