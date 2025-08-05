# Deployment Guide for TourSmile

## Emergent Platform Deployment

### Step 1: GitHub Setup
1. Repository: `toursmile-app` (Private)
2. All code exported with complete file structure
3. Environment variables configured

### Step 2: Emergent Deployment
1. Use "Deploy" button in Emergent interface
2. Select this repository
3. Configure environment variables:
   - `OPENAI_API_KEY`
   - `MONGO_URL`
   - `REACT_APP_BACKEND_URL`

### Step 3: Custom Domain (vimanpravas.com)
1. Get deployment URL from Emergent
2. Update DNS in InterServer control panel:
   - Type: A Record or CNAME
   - Host: @ (for root domain) or www
   - Value: Emergent provided IP/URL
   - TTL: 300

### Step 4: SSL Configuration
- Emergent provides automatic SSL certificates
- Domain will be accessible via HTTPS

## Alternative Deployment Options

### Self-Hosting Requirements
- Node.js 18+ runtime
- Python 3.8+ runtime  
- MongoDB database
- Process manager (PM2 recommended)
- Reverse proxy (Nginx recommended)
- SSL certificates

### Docker Deployment
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY frontend/ .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# Backend Dockerfile  
FROM python:3.9-slim
WORKDIR /app
COPY backend/ .
RUN pip install -r requirements.txt
EXPOSE 8001
CMD ["python", "server.py"]
```

## Environment Configuration

### Production Settings
- Set `NODE_ENV=production`
- Configure proper CORS origins
- Use production MongoDB cluster
- Set up monitoring and logging

### Security Considerations
- Keep API keys secure in environment variables
- Use HTTPS only in production
- Configure proper CORS settings
- Implement rate limiting for API endpoints

## Monitoring
- Monitor API response times
- Track error rates
- Monitor database performance
- Set up uptime monitoring

## Troubleshooting

### Common Issues
1. **API Connection Failed**: Check REACT_APP_BACKEND_URL
2. **Database Connection Error**: Verify MONGO_URL
3. **OpenAI API Error**: Check OPENAI_API_KEY validity
4. **CORS Issues**: Update backend CORS configuration

### Support
For deployment issues, contact Emergent support or check application logs.