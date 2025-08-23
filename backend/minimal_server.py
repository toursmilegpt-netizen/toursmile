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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize database on startup
print("🔄 Skipping PostgreSQL database initialization for testing...")

# OpenAI API Key
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class FlightSearch(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    passengers: int = 1
    class_type: str = "economy"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    passengers: int = 1
    class_type: str = "economy"
    # Enhanced search parameters
    timePreference: Optional[str] = None
    flexibleDates: Optional[bool] = None
    nearbyAirports: Optional[bool] = None
    corporateBooking: Optional[bool] = None
    budgetRange: Optional[List[int]] = None

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

@api_router.post("/flights/search")
async def search_flights(request: FlightSearchRequest):
    """Search for flights with enhanced parameters and Tripjack API integration"""
    try:
        # Log enhanced parameters for testing
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
        
        # Save search query
        search = FlightSearch(**request.dict())
        
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
        
        # Apply enhanced search filters to results (for demonstration)
        if enhanced_params:
            # Filter by budget range if provided
            if request.budgetRange and len(request.budgetRange) == 2:
                min_budget, max_budget = request.budgetRange
                real_flights = [
                    flight for flight in real_flights 
                    if min_budget <= flight.get('price', 0) <= max_budget
                ]
                logging.info(f"🔍 Budget filter applied: {min_budget}-{max_budget}, {len(real_flights)} flights remaining")
            
            # Filter by time preference (basic implementation)
            if request.timePreference and request.timePreference != 'any':
                time_filters = {
                    'morning': lambda t: 5 <= int(t.split(':')[0]) < 12,
                    'afternoon': lambda t: 12 <= int(t.split(':')[0]) < 17,
                    'evening': lambda t: 17 <= int(t.split(':')[0]) < 21,
                    'night': lambda t: 21 <= int(t.split(':')[0]) or int(t.split(':')[0]) < 5
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
            "search_id": search.id,
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

@api_router.get("/")
async def root():
    return {"message": "TourSmile AI Travel Platform API - Enhanced Search Testing"}

# Include the router in the main app
app.include_router(api_router)

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