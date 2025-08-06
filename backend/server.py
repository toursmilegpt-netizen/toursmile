from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

# Import the real APIs
from real_hotel_api import hotel_api_service
from amadeus_flight_api import amadeus_service  # NEW: Working Amadeus API

import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import json
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage
from popular_trips_routes import router as popular_trips_router
from enhanced_chat_service import ExpertTravelConsultantChat
from destinations_routes import router as destinations_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# OpenAI API Key
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    message: str
    response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class FlightSearch(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    passengers: int = 1
    class_type: str = "economy"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class HotelSearch(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location: str
    checkin_date: str
    checkout_date: str
    guests: int = 1
    rooms: int = 1
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_email: str
    booking_type: str  # flight, hotel, activity
    booking_details: Dict[str, Any]
    total_amount: float
    status: str = "pending"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    passengers: int = 1
    class_type: str = "economy"

class HotelSearchRequest(BaseModel):
    location: str
    checkin_date: str
    checkout_date: str
    guests: int = 1
    rooms: int = 1

# Mock data for flights
MOCK_FLIGHTS = [
    {
        "id": "FL001",
        "airline": "Air India",
        "flight_number": "AI 101",
        "origin": "Delhi",
        "destination": "Mumbai",
        "departure_time": "06:00",
        "arrival_time": "08:30",
        "duration": "2h 30m",
        "price": 4500,
        "stops": 0,
        "aircraft": "Boeing 737"
    },
    {
        "id": "FL002", 
        "airline": "IndiGo",
        "flight_number": "6E 202",
        "origin": "Delhi",
        "destination": "Mumbai", 
        "departure_time": "14:30",
        "arrival_time": "17:00",
        "duration": "2h 30m",
        "price": 3800,
        "stops": 0,
        "aircraft": "Airbus A320"
    },
    {
        "id": "FL003",
        "airline": "SpiceJet",
        "flight_number": "SG 303",
        "origin": "Mumbai",
        "destination": "Goa",
        "departure_time": "10:15",
        "arrival_time": "11:45",
        "duration": "1h 30m", 
        "price": 2800,
        "stops": 0,
        "aircraft": "Boeing 737"
    }
]

# Mock data for hotels
MOCK_HOTELS = [
    {
        "id": "HT001",
        "name": "The Taj Mahal Palace",
        "location": "Mumbai",
        "rating": 5,
        "price_per_night": 15000,
        "amenities": ["WiFi", "Pool", "Spa", "Restaurant", "Gym"],
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
        "description": "Iconic luxury hotel overlooking the Gateway of India"
    },
    {
        "id": "HT002",
        "name": "The Oberoi",
        "location": "Delhi",
        "rating": 5,
        "price_per_night": 12000,
        "amenities": ["WiFi", "Pool", "Spa", "Restaurant", "Business Center"],
        "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400",
        "description": "Sophisticated luxury hotel in the heart of Delhi"
    },
    {
        "id": "HT003",
        "name": "The Leela Goa",
        "location": "Goa",
        "rating": 5,
        "price_per_night": 8000,
        "amenities": ["WiFi", "Beach Access", "Pool", "Spa", "Water Sports"],
        "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400",
        "description": "Beachfront luxury resort with stunning ocean views"
    }
]

# Mock data for activities
MOCK_ACTIVITIES = [
    {
        "id": "AC001",
        "name": "Gateway of India Tour",
        "location": "Mumbai",
        "price": 500,
        "duration": "2 hours",
        "rating": 4.5,
        "description": "Explore the iconic Gateway of India and nearby attractions"
    },
    {
        "id": "AC002",
        "name": "Red Fort Historical Walk", 
        "location": "Delhi",
        "price": 300,
        "duration": "3 hours",
        "rating": 4.7,
        "description": "Discover the rich history of Red Fort with expert guide"
    },
    {
        "id": "AC003",
        "name": "Beach Water Sports",
        "location": "Goa", 
        "price": 1200,
        "duration": "4 hours",
        "rating": 4.8,
        "description": "Exciting water sports including parasailing and jet skiing"
    }
]

async def get_ai_response(message: str, session_id: str) -> str:
    """Get AI response using OpenAI GPT-4"""
    try:
        chat = LlmChat(
            api_key=os.environ.get('OPENAI_API_KEY'),
            session_id=session_id,
            system_message="""You are TourSmile AI, a friendly and knowledgeable travel assistant for toursmile.in. 
            
            Your role is to:
            1. Help users plan their trips with personalized recommendations
            2. Assist with flight, hotel, and activity searches
            3. Provide travel tips and destination information
            4. Guide users through the booking process
            5. Be conversational, helpful, and engaging
            
            Always be enthusiastic about travel and provide specific, actionable advice. 
            If users ask about bookings, guide them to use the search features on the website.
            Keep responses concise but informative."""
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=message)
        response = await chat.send_message(user_message)
        return response
        
    except Exception as e:
        logging.error(f"AI response error: {str(e)}")
        return "I'm having trouble processing your request right now. Please try again in a moment, or feel free to browse our travel options!"

# Initialize Expert Travel Consultant Chat
async def get_expert_consultant_response(message: str, session_id: str) -> str:
    """Enhanced AI response with travel consultant expertise"""
    try:
        expert_system_prompt = """You are an Expert Travel Consultant for TourSmile, a premium travel platform. 

PERSONALITY: Professional, respectful, practical, and friendly. You are knowledgeable about destinations, practical logistics, and provide realistic insights.

CONSULTATION APPROACH:
- Always ask about client preferences (budget, hotel category, travel type)
- Be interactive and engaging
- Focus on convenience, comfort, and client needs  
- Follow booking sequence: Flights first → Hotels → Sightseeing
- Share realistic insights about destinations and timing

QUESTIONS TO ASK:
- What's your budget range for this trip?
- Which hotel category do you prefer? (Luxury 5*, Premium 4*, Comfort 3*, Budget)
- What type of experience are you looking for? (Luxury, adventure, cultural, family, honeymoon)
- What time of year are you planning to travel?

EXPERTISE TO SHARE:
- Best times to visit destinations (weather, crowds, pricing)
- Practical travel logistics and timing
- Local insights and hidden gems
- Cultural etiquette and customs
- Budget optimization strategies

Always be helpful, ask relevant questions, and provide expert travel guidance."""

        llm_chat = LlmChat(
            api_key=OPENAI_API_KEY,
            session_id=session_id,
            system_message=expert_system_prompt
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=message)
        response = await llm_chat.send_message(user_message)
        
        return response
        
    except Exception as e:
        logging.error(f"Expert consultant error: {str(e)}")
        return "As your travel consultant, I'm here to help you plan the perfect trip! Could you tell me about your destination preferences and what type of travel experience you're looking for?"

@api_router.post("/chat")
async def chat_with_expert_consultant(request: ChatRequest):
    """Chat with Expert Travel Consultant"""
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # Use Expert Travel Consultant instead of generic AI
        response = await get_expert_consultant_response(
            message=request.message,
            session_id=session_id
        )
        
        return {
            "response": response,
            "session_id": session_id
        }
            
    except Exception as e:
        logging.error(f"Expert consultation error: {str(e)}")
        return {
            "response": "I apologize for the technical issue. As your travel consultant, I'm here to help you plan the perfect trip. Could you please tell me about your destination preferences?",
            "session_id": session_id,
            "error": "consultation_unavailable"
        }

@api_router.post("/flights/search")
async def search_flights(request: FlightSearchRequest):
    """Search for flights with real Amadeus API integration and AI recommendations"""
    try:
        # Save search query
        search = FlightSearch(**request.dict())
        await db.flight_searches.insert_one(search.dict())
        
        # Try to get real flight data first
        real_flights = []
        use_real_api = False
        
        try:
            # Check if Amadeus credentials are configured
            if amadeus_service.api_key:
                logging.info(f"Using Amadeus API for route: {request.origin} → {request.destination}")
                real_flights = amadeus_service.search_flights_by_airport(
                    request.origin,
                    request.destination, 
                    request.departure_date,
                    request.passengers if hasattr(request, 'passengers') and isinstance(request.passengers, int) else 1
                )
                if real_flights:
                    use_real_api = True
                    logging.info(f"✅ Amadeus API returned {len(real_flights)} flights")
                else:
                    logging.warning("Amadeus API returned no flights, falling back to mock data")
            else:
                logging.info("Amadeus API key not configured, using mock data")
        except Exception as api_error:
            logging.error(f"Amadeus API error: {str(api_error)}, falling back to mock data")
        
        # Fallback to mock data if real API failed or no credentials
        if not use_real_api:
            filtered_flights = [
                flight for flight in MOCK_FLIGHTS 
                if (flight["origin"].lower() == request.origin.lower() and 
                    flight["destination"].lower() == request.destination.lower())
            ]
            
            # If no exact matches, return some sample flights
            if not filtered_flights:
                filtered_flights = MOCK_FLIGHTS[:2]
            
            # Use mock data in the same format as real API
            real_flights = filtered_flights
        
        # Get AI recommendations
        ai_prompt = f"Provide a brief travel tip for flying from {request.origin} to {request.destination} on {request.departure_date}"
        ai_tip = await get_ai_response(ai_prompt, str(uuid.uuid4()))
        
        return {
            "flights": real_flights,
            "search_id": search.id,
            "ai_recommendation": ai_tip,
            "data_source": "real_api" if use_real_api else "mock",
            "total_found": len(real_flights)
        }
        
    except Exception as e:
        logging.error(f"Flight search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search flights")

@api_router.post("/hotels/search")
async def search_hotels(request: HotelSearchRequest):
    """Search for hotels with real API integration and AI recommendations"""
    try:
        # Save search query
        search = HotelSearch(**request.dict())
        await db.hotel_searches.insert_one(search.dict())
        
        # Try to get real hotel data first
        real_hotels = []
        use_real_api = False
        
        try:
            # Check if HotelAPI credentials are configured
            if hotel_api_service.username and hotel_api_service.password:
                logging.info(f"Using real HotelAPI for location: {request.location}")
                real_hotels = hotel_api_service.search_hotels(request.location)
                if real_hotels:
                    use_real_api = True
                    logging.info(f"✅ Real API returned {len(real_hotels)} hotels")
                else:
                    logging.warning("Real API returned no hotels, falling back to mock data")
            else:
                logging.info("HotelAPI credentials not configured, using mock data")
        except Exception as api_error:
            logging.error(f"Real Hotel API error: {str(api_error)}, falling back to mock data")
        
        # Fallback to mock data if real API failed or no credentials
        if not use_real_api:
            filtered_hotels = [
                hotel for hotel in MOCK_HOTELS
                if request.location.lower() in hotel["location"].lower()
            ]
            
            if not filtered_hotels:
                filtered_hotels = MOCK_HOTELS[:2]
            
            # Convert mock data to match real API format
            real_hotels = []
            for hotel in filtered_hotels:
                real_hotels.append({
                    "id": hotel["id"],
                    "name": hotel["name"],
                    "location": hotel["location"],
                    "price_per_night": hotel["price_per_night"],
                    "total_price": hotel["price_per_night"],
                    "rating": hotel["rating"],
                    "amenities": hotel["amenities"],
                    "image": hotel["image"],
                    "vendor": "TourSmile",
                    "currency": "INR",
                    "tax": 0,
                    "description": hotel.get("description", "")
                })
        
        # Get AI recommendations
        ai_prompt = f"Give a brief travel tip for staying in {request.location} from {request.checkin_date} to {request.checkout_date}"
        ai_tip = await get_ai_response(ai_prompt, str(uuid.uuid4()))
        
        return {
            "hotels": real_hotels,
            "search_id": search.id,
            "ai_recommendation": ai_tip,
            "data_source": "real_api" if use_real_api else "mock",
            "total_found": len(real_hotels)
        }
        
    except Exception as e:
        logging.error(f"Hotel search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search hotels")

@api_router.get("/test-hotel-api")
async def test_hotel_api_endpoint():
    """Test endpoint to verify HotelAPI.co integration"""
    try:
        # Check if credentials are configured
        if not hotel_api_service.username or not hotel_api_service.password:
            return {
                "status": "credentials_missing",
                "message": "HotelAPI credentials not configured in environment variables",
                "required_env_vars": ["HOTELAPI_USERNAME", "HOTELAPI_PASSWORD"],
                "instructions": "Add your HotelAPI.co credentials to backend/.env file"
            }
        
        # Test authentication
        auth_success = hotel_api_service.authenticate()
        if not auth_success:
            return {
                "status": "authentication_failed",
                "message": "Failed to authenticate with HotelAPI.co",
                "check": "Verify your username and password are correct"
            }
        
        # Test hotel search
        test_hotels = hotel_api_service.search_hotels("Mumbai")
        
        return {
            "status": "success",
            "message": "HotelAPI.co integration working perfectly!",
            "authenticated": True,
            "test_search": {
                "city": "Mumbai",
                "hotels_found": len(test_hotels),
                "sample_hotels": test_hotels[:3] if test_hotels else []
            }
        }
        
    except Exception as e:
        logging.error(f"HotelAPI test error: {str(e)}")
        return {
            "status": "error", 
            "message": f"Test failed: {str(e)}",
            "authenticated": False
        }

@api_router.get("/activities/{location}")
async def get_activities(location: str):
    """Get activities for a location"""
    try:
        filtered_activities = [
            activity for activity in MOCK_ACTIVITIES
            if location.lower() in activity["location"].lower()
        ]
        
        if not filtered_activities:
            filtered_activities = MOCK_ACTIVITIES[:2]
            
        return {"activities": filtered_activities}
        
    except Exception as e:
        logging.error(f"Activities error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get activities")

@api_router.post("/itinerary/generate")
async def generate_itinerary(request: dict):
    """Generate AI-powered travel itinerary"""
    try:
        destination = request.get("destination", "")
        days = request.get("days", 3)
        budget = request.get("budget", "medium")
        interests = request.get("interests", [])
        
        ai_prompt = f"""Create a detailed {days}-day travel itinerary for {destination} with {budget} budget. 
        Interests: {', '.join(interests) if interests else 'general sightseeing'}.
        Include specific recommendations for hotels, restaurants, and activities with approximate costs."""
        
        itinerary = await get_ai_response(ai_prompt, str(uuid.uuid4()))
        
        return {
            "itinerary": itinerary,
            "destination": destination,
            "days": days
        }
        
    except Exception as e:
        logging.error(f"Itinerary error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate itinerary")

@api_router.get("/")
async def root():
    return {"message": "TourSmile AI Travel Platform API"}

# Include the router in the main app
app.include_router(api_router)

# Include the popular trips router
app.include_router(popular_trips_router, prefix="/api", tags=["popular-trips"])

# Include the destinations router
app.include_router(destinations_router, prefix="/api", tags=["destinations"])

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()