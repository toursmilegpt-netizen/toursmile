from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware

# Import the real APIs
from real_hotel_api import hotel_api_service
from tripjack_flight_api import tripjack_flight_service  # NEW: Tripjack with comprehensive LCC coverage
from tripjack_hotel_api import tripjack_hotel_service   # NEW: Tripjack hotel search

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

# Skip database initialization for testing
print("🔄 Skipping PostgreSQL database initialization for testing...")

# OpenAI API Key
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
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
    # Enhanced search parameters from Priority 2 implementation
    timePreference: Optional[str] = None  # morning, afternoon, evening, night, any
    flexibleDates: Optional[bool] = None  # ±3 days search
    nearbyAirports: Optional[bool] = None  # include nearby airports
    corporateBooking: Optional[bool] = None  # corporate booking rates
    budgetRange: Optional[List[int]] = None  # [min, max] price range

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

@api_router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """Chat with AI"""
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        response = await get_ai_response(
            message=request.message,
            session_id=session_id
        )
        
        return {
            "response": response,
            "session_id": session_id
        }
            
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        return {
            "response": "I apologize for the technical issue. How can I help you plan your trip?",
            "session_id": session_id,
            "error": "chat_unavailable"
        }

@api_router.post("/flights/search")
async def search_flights(request: FlightSearchRequest):
    """Search for flights with enhanced parameters support"""
    try:
        # Log enhanced parameters for verification
        enhanced_params = {}
        if request.timePreference:
            enhanced_params['timePreference'] = request.timePreference
        if request.flexibleDates is not None:
            enhanced_params['flexibleDates'] = request.flexibleDates
        if request.nearbyAirports is not None:
            enhanced_params['nearbyAirports'] = request.nearbyAirports
        if request.corporateBooking is not None:
            enhanced_params['corporateBooking'] = request.corporateBooking
        if request.budgetRange:
            enhanced_params['budgetRange'] = request.budgetRange
        
        if enhanced_params:
            logging.info(f"🚀 Enhanced search parameters received: {enhanced_params}")
        
        # Try to get real flight data first
        real_flights = []
        use_real_api = False
        
        try:
            # Check if Tripjack credentials are configured
            if tripjack_flight_service.api_key:
                logging.info(f"Using Tripjack API for route: {request.origin} → {request.destination}")
                real_flights = tripjack_flight_service.search_flights(
                    request.origin,
                    request.destination, 
                    request.departure_date,
                    request.passengers if hasattr(request, 'passengers') and isinstance(request.passengers, int) else 1
                )
                if real_flights:
                    use_real_api = True
                    logging.info(f"✅ Tripjack API returned {len(real_flights)} flights")
                else:
                    logging.warning("Tripjack API returned no flights, falling back to mock data")
            else:
                logging.info("Tripjack API key not configured, using mock data")
        except Exception as api_error:
            logging.error(f"Tripjack API error: {str(api_error)}, falling back to mock data")
        
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
        
        # Apply enhanced search filters to results
        if enhanced_params:
            logging.info(f"🔍 Applying enhanced filters to {len(real_flights)} flights")
            
            # Filter by budget range if provided
            if request.budgetRange and len(request.budgetRange) == 2:
                min_budget, max_budget = request.budgetRange
                real_flights = [
                    flight for flight in real_flights 
                    if min_budget <= flight.get('price', 0) <= max_budget
                ]
                logging.info(f"💰 Budget filter applied: ₹{min_budget}-₹{max_budget}, {len(real_flights)} flights remaining")
            
            # Filter by time preference (basic implementation)
            if request.timePreference and request.timePreference != 'any':
                def extract_hour_from_time(time_str):
                    """Extract hour from time string, handling both ISO format and simple time format"""
                    try:
                        if 'T' in time_str:  # ISO format like "2025-08-24T06:00"
                            time_part = time_str.split('T')[1]
                            return int(time_part.split(':')[0])
                        else:  # Simple format like "06:00"
                            return int(time_str.split(':')[0])
                    except (ValueError, IndexError):
                        return 12  # Default to noon if parsing fails
                
                time_filters = {
                    'morning': lambda t: 5 <= extract_hour_from_time(t) < 12,
                    'afternoon': lambda t: 12 <= extract_hour_from_time(t) < 17, 
                    'evening': lambda t: 17 <= extract_hour_from_time(t) < 21,
                    'night': lambda t: extract_hour_from_time(t) >= 21 or extract_hour_from_time(t) < 5
                }
                
                if request.timePreference in time_filters:
                    filter_func = time_filters[request.timePreference]
                    real_flights = [
                        flight for flight in real_flights 
                        if filter_func(flight.get('departure_time', '12:00'))
                    ]
                    logging.info(f"🕐 Time preference filter applied: {request.timePreference}, {len(real_flights)} flights remaining")
        
        # Get AI recommendations
        ai_prompt = f"Provide a brief travel tip for flying from {request.origin} to {request.destination} on {request.departure_date}"
        ai_tip = await get_ai_response(ai_prompt, str(uuid.uuid4()))
        
        response_data = {
            "flights": real_flights,
            "search_id": str(uuid.uuid4()),
            "ai_recommendation": ai_tip,
            "data_source": "real_api" if use_real_api else "mock",
            "total_found": len(real_flights)
        }
        
        # Include enhanced parameters in response for verification
        if enhanced_params:
            response_data["enhanced_parameters"] = enhanced_params
        
        return response_data
        
    except Exception as e:
        logging.error(f"Flight search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search flights")

@api_router.post("/hotels/search")
async def search_hotels(request: HotelSearchRequest):
    """Search for hotels"""
    try:
        filtered_hotels = [
            hotel for hotel in MOCK_HOTELS
            if request.location.lower() in hotel["location"].lower()
        ]
        
        if not filtered_hotels:
            filtered_hotels = MOCK_HOTELS[:1]
        
        # Get AI recommendations
        ai_prompt = f"Give a brief travel tip for staying in {request.location} from {request.checkin_date} to {request.checkout_date}"
        ai_tip = await get_ai_response(ai_prompt, str(uuid.uuid4()))
        
        return {
            "hotels": filtered_hotels,
            "search_id": str(uuid.uuid4()),
            "ai_recommendation": ai_tip,
            "data_source": "mock",
            "total_found": len(filtered_hotels)
        }
        
    except Exception as e:
        logging.error(f"Hotel search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search hotels")

@api_router.get("/activities/{location}")
async def get_activities(location: str):
    """Get activities for a location"""
    try:
        filtered_activities = [
            activity for activity in MOCK_ACTIVITIES
            if location.lower() in activity["location"].lower()
        ]
        
        if not filtered_activities:
            filtered_activities = MOCK_ACTIVITIES[:1]
            
        return {"activities": filtered_activities}
        
    except Exception as e:
        logging.error(f"Activities error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get activities")

@api_router.get("/")
async def root():
    return {"message": "TourSmile AI Travel Platform API - Test Mode"}

# Include the router in the main app
app.include_router(api_router)

# Include the popular trips router (if it doesn't depend on database)
try:
    app.include_router(popular_trips_router, prefix="/api", tags=["popular-trips"])
except Exception as e:
    logging.warning(f"Could not include popular trips router: {e}")

# Include the destinations router (if it doesn't depend on database)
try:
    app.include_router(destinations_router, prefix="/api", tags=["destinations"])
except Exception as e:
    logging.warning(f"Could not include destinations router: {e}")

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)