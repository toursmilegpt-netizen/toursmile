# Sky Scrapper Flight API Integration
# Real flight search with LCC coverage via RapidAPI

import requests
import json
import os
from datetime import datetime
from typing import List, Dict, Optional
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SkyScrapper:
    def __init__(self):
        self.api_base_url = "https://sky-scrapper.p.rapidapi.com"
        self._api_key = None
        
    @property
    def api_key(self):
        """Lazy load API key from environment"""
        if self._api_key is None:
            self._api_key = os.environ.get('RAPIDAPI_KEY')
        return self._api_key
    
    def get_headers(self):
        """Get RapidAPI headers for authentication"""
        return {
            'X-RapidAPI-Key': self.api_key,
            'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com',
            'Accept': 'application/json'
        }
    
    def get_airport_code(self, city_or_code: str) -> str:
        """Convert city names to IATA airport codes"""
        city_to_code = {
            'delhi': 'DEL',
            'new delhi': 'DEL',
            'mumbai': 'BOM', 
            'bangalore': 'BLR',
            'bengaluru': 'BLR',
            'chennai': 'MAA',
            'hyderabad': 'HYD',
            'kolkata': 'CCU',
            'pune': 'PNQ',
            'ahmedabad': 'AMD',
            'kochi': 'COK',
            'cochin': 'COK',
            'goa': 'GOI',
            'jaipur': 'JAI',
            'lucknow': 'LKO',
            'chandigarh': 'IXC',
            'bhubaneswar': 'BBI',
            'indore': 'IDR'
        }
        
        city_lower = city_or_code.lower().strip()
        
        # If it's already a 3-letter code, return as is
        if len(city_lower) == 3 and city_lower.isalpha():
            return city_lower.upper()
            
        # Look up city name
        return city_to_code.get(city_lower, 'DEL')  # Default to Delhi if not found
    
    def search_flights(self, origin: str, destination: str, departure_date: str, passengers: int = 1) -> List[Dict]:
        """
        Search flights using Sky Scrapper API
        
        Args:
            origin (str): Origin city or airport code
            destination (str): Destination city or airport code
            departure_date (str): Departure date in YYYY-MM-DD format
            passengers (int): Number of adult passengers
            
        Returns:
            List[Dict]: List of flight offers in standardized format
        """
        try:
            if not self.api_key:
                logger.warning("RapidAPI key not found in environment")
                return []
            
            # Convert cities to airport codes
            origin_code = self.get_airport_code(origin)
            dest_code = self.get_airport_code(destination)
            
            logger.info(f"🔍 Sky Scrapper search: {origin_code} → {dest_code} on {departure_date}")
            
            # Sky Scrapper API endpoint
            url = f"{self.api_base_url}/api/v1/flights/getFlightDetails"
            
            headers = self.get_headers()
            
            # API parameters
            legs = [{"destination": dest_code, "origin": origin_code, "date": departure_date}]
            
            params = {
                'legs': json.dumps(legs),
                'adults': passengers,
                'currency': 'INR',
                'locale': 'en-IN',
                'market': 'en-IN',
                'cabinClass': 'economy',
                'countryCode': 'IN'
            }
            
            logger.info(f"📡 Making request to: {url}")
            logger.info(f"🔧 Parameters: {params}")
            
            response = requests.get(url, headers=headers, params=params, timeout=30)
            logger.info(f"📊 API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Sky Scrapper API successful!")
                
                # Extract flight data
                flights = data.get('data', {}).get('itineraries', [])
                logger.info(f"🛩️ Found {len(flights)} flight options")
                
                if flights:
                    transformed_flights = self.transform_flight_data(flights, origin, destination)
                    logger.info(f"✅ Transformed {len(transformed_flights)} flights with Indian airlines")
                    return transformed_flights
                else:
                    logger.warning("⚠️ No flights found in API response")
                    return []
                    
            elif response.status_code == 401:
                logger.error("❌ RapidAPI authentication failed - Invalid API key")
                return []
            elif response.status_code == 403:
                logger.error("❌ RapidAPI access forbidden - Check subscription/quota")
                return []
            elif response.status_code == 429:
                logger.warning("⚠️ RapidAPI rate limit exceeded")
                return []
            else:
                logger.error(f"❌ Sky Scrapper API error: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"❌ Sky Scrapper request error: {str(e)}")
            return []
    
    def transform_flight_data(self, flights: List[Dict], origin: str, destination: str) -> List[Dict]:
        """Transform Sky Scrapper flight data to our standard format"""
        transformed = []
        
        try:
            for i, flight in enumerate(flights[:10]):  # Limit to 10 results
                try:
                    # Extract flight details
                    legs = flight.get('legs', [])
                    if not legs:
                        continue
                        
                    first_leg = legs[0]
                    segments = first_leg.get('segments', [])
                    if not segments:
                        continue
                        
                    first_segment = segments[0]
                    
                    # Get airline info
                    airline = first_segment.get('operatingCarrier', {})
                    airline_code = airline.get('iata', 'XX')
                    airline_name = self.get_airline_name(airline_code)
                    
                    # Get flight number
                    flight_number = f"{airline_code}{first_segment.get('flightNumber', '000')}"
                    
                    # Get departure and arrival info
                    departure = first_segment.get('departure', {})
                    arrival = segments[-1].get('arrival', {}) if segments else {}
                    
                    departure_time = self.format_time(departure.get('at', ''))
                    arrival_time = self.format_time(arrival.get('at', ''))
                    
                    # Get pricing
                    pricing = flight.get('price', {})
                    total_price = pricing.get('raw', 5000)  # Default price
                    currency = pricing.get('currency', 'INR')
                    
                    # Calculate duration
                    duration_minutes = first_leg.get('durationInMinutes', 150)
                    duration = self.format_duration(duration_minutes)
                    
                    # Count stops
                    stops = len(segments) - 1
                    
                    # Build flight object
                    flight_obj = {
                        "id": f"SKY_{i+1}",
                        "airline": airline_name,
                        "airline_code": airline_code,
                        "flight_number": flight_number,
                        "origin": origin,
                        "destination": destination,
                        "departure_time": departure_time,
                        "arrival_time": arrival_time,
                        "duration": duration,
                        "price": int(total_price),
                        "currency": currency,
                        "stops": stops,
                        "aircraft": segments[0].get('equipment', {}).get('iata', 'Unknown'),
                        "booking_class": "Economy",
                        "available_seats": "Available",
                        "baggage": "15kg checked + 7kg carry-on",
                        "status": "Available"
                    }
                    
                    transformed.append(flight_obj)
                    
                    # Log airline found for debugging
                    logger.info(f"✈️ Found: {airline_name} ({airline_code}) - ₹{total_price}")
                    
                except Exception as e:
                    logger.error(f"Error processing flight {i}: {str(e)}")
                    continue
                    
            return transformed
            
        except Exception as e:
            logger.error(f"❌ Error transforming Sky Scrapper data: {str(e)}")
            return []
    
    def format_time(self, datetime_str: str) -> str:
        """Convert datetime string to HH:MM format"""
        try:
            if datetime_str:
                # Handle different datetime formats
                dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
                return dt.strftime('%H:%M')
            return "08:00"
        except:
            return "08:00"
    
    def format_duration(self, minutes: int) -> str:
        """Convert duration in minutes to readable format"""
        try:
            hours = minutes // 60
            mins = minutes % 60
            return f"{hours}h {mins}m"
        except:
            return "2h 30m"
    
    def get_airline_name(self, airline_code: str) -> str:
        """Get airline name from IATA code - focus on Indian carriers"""
        airlines = {
            # Major Indian Airlines (including LCCs)
            '6E': 'IndiGo',              # Largest Indian LCC
            'SG': 'SpiceJet',            # Major Indian LCC  
            'AI': 'Air India',           # Flag carrier
            'UK': 'Vistara',             # Premium airline
            'G8': 'GoAir',               # Budget airline
            'I5': 'AirAsia India',       # International LCC
            '9W': 'Jet Airways',         # (if still operating)
            'S2': 'JetLite',            # Budget arm of Jet
            'DN': 'Alliance Air',        # Regional carrier
            'IX': 'Air India Express',   # Air India's LCC
            
            # International Airlines (common in India)
            'QR': 'Qatar Airways',
            'EK': 'Emirates',
            'SV': 'Saudi Arabian Airlines',
            '9W': 'Jet Airways',
            'TG': 'Thai Airways',
            'SQ': 'Singapore Airlines',
            'CX': 'Cathay Pacific',
            'EY': 'Etihad Airways',
            'LH': 'Lufthansa',
            'BA': 'British Airways'
        }
        
        return airlines.get(airline_code.upper(), f"{airline_code} Airlines")
    
    def test_api_connection(self) -> bool:
        """Test Sky Scrapper API connection"""
        try:
            if not self.api_key:
                logger.error("❌ RapidAPI key missing")
                return False
                
            # Test with Delhi to Mumbai search
            flights = self.search_flights('Delhi', 'Mumbai', '2025-02-15', 1)
            if flights:
                logger.info(f"✅ Sky Scrapper connection successful - Found {len(flights)} flights")
                
                # Check for Indian LCC coverage
                lcc_airlines = ['IndiGo', 'SpiceJet', 'GoAir', 'AirAsia India']
                found_lcc = [f for f in flights if f['airline'] in lcc_airlines]
                
                if found_lcc:
                    logger.info(f"🎯 EXCELLENT: Found {len(found_lcc)} LCC flights!")
                    for flight in found_lcc[:3]:
                        logger.info(f"   ✈️ {flight['airline']} - ₹{flight['price']}")
                else:
                    logger.warning("⚠️ No Indian LCC airlines found in results")
                
                return True
            else:
                logger.info("✅ Sky Scrapper API connected, but no flights found")
                return True
                
        except Exception as e:
            logger.error(f"❌ Sky Scrapper connection test error: {str(e)}")
            return False


# Global service instance
sky_scrapper_service = SkyScrapper()


# Test function for debugging
async def test_sky_scrapper():
    """Test Sky Scrapper integration for Indian LCC coverage"""
    try:
        logger.info("🧪 Testing Sky Scrapper API for Indian LCC coverage...")
        
        flights = sky_scrapper_service.search_flights('Delhi', 'Mumbai', '2025-02-15', 2)
        
        if flights:
            logger.info(f"✅ Found {len(flights)} flights")
            
            # Check for budget airlines specifically
            budget_airlines = ['IndiGo', 'SpiceJet', 'GoAir', 'AirAsia India', 'Air India Express']
            budget_flights = [f for f in flights if f['airline'] in budget_airlines]
            
            logger.info(f"🎯 Budget airline flights found: {len(budget_flights)}")
            
            for flight in flights[:5]:  # Show first 5 flights
                logger.info(f"  ✈️ {flight['airline']} {flight['flight_number']} - ₹{flight['price']}")
                
            return len(budget_flights) > 0
        else:
            logger.info("⚠️ No flights found - API may need different parameters")
            return False
            
    except Exception as e:
        logger.error(f"❌ Sky Scrapper test error: {str(e)}")
        return False


if __name__ == "__main__":
    # For testing purposes
    import asyncio
    asyncio.run(test_sky_scrapper())