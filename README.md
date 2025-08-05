# TourSmile - AI-Powered Travel Website

A comprehensive travel booking platform built with React, FastAPI, and MongoDB.

## Features

- **Flight Search & Booking**: Search flights with AI-powered recommendations
- **Hotel Search & Booking**: Find accommodations with detailed amenities 
- **Activities & Attractions**: Discover local experiences and tours
- **AI Trip Planner**: Generate personalized itineraries using OpenAI GPT-4
- **AI Chat Assistant**: 24/7 travel assistance and support
- **Natural Language Search**: Command bar for conversational search queries

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI Integration**: OpenAI GPT-4 via emergentintegrations
- **Deployment**: Emergent Platform

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB
- OpenAI API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/toursmile-app.git
cd toursmile-app
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# backend/.env
OPENAI_API_KEY=your_openai_api_key_here
MONGO_URL=mongodb://localhost:27017/toursmile

# frontend/.env
REACT_APP_BACKEND_URL=http://localhost:8001
```

5. Start the application:

Backend:
```bash
cd backend
python server.py
```

Frontend:
```bash
cd frontend
npm start
```

## Deployment

This application is configured for deployment on the Emergent platform with custom domain support.

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/flights/search` - Search flights
- `POST /api/hotels/search` - Search hotels  
- `GET /api/activities/{location}` - Get activities by location
- `POST /api/itinerary/generate` - Generate AI itinerary
- `POST /api/chat` - AI chat assistant

## Environment Variables

### Backend (.env)
- `OPENAI_API_KEY` - OpenAI API key for GPT-4 integration
- `MONGO_URL` - MongoDB connection string

### Frontend (.env)  
- `REACT_APP_BACKEND_URL` - Backend API URL

## License

Private - All rights reserved

## Contact

For support, contact: [your-email@domain.com]