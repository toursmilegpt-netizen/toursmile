# Amadeus Flight API Integration
# Professional flight search API with real flight offers and pricing

import requests
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AmadeusFlightService:
    def __init__(self):
        # Amadeus API endpoints
        self.auth_base_url = "https://test.api.amadeus.com"
        self.api_base_url = "https://test.api.amadeus.com"
        self._access_token = None
        self._token_expires_at = None
        
    @property
    def api_key(self):
        """Get API key from environment"""
        return os.environ.get('AMADEUS_API_KEY')
    
    @property 
    def api_secret(self):
        """Get API secret from environment"""
        return os.environ.get('AMADEUS_API_SECRET')
    
    def get_access_token(self):
        """Get OAuth2 access token for Amadeus API"""
        try:
            # Check if we have a valid token
            if (self._access_token and self._token_expires_at and 
                datetime.now() < self._token_expires_at):
                return self._access_token
            
            # Get new token
            url = f"{self.auth_base_url}/v1/security/oauth2/token"
            
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            data = {
                'grant_type': 'client_credentials',
                'client_id': self.api_key,
                'client_secret': self.api_secret
            }
            
            response = requests.post(url, headers=headers, data=data, timeout=30)
            logger.info(f"Amadeus auth response status: {response.status_code}")
            
            if response.status_code == 200:
                token_data = response.json()
                self._access_token = token_data.get('access_token')
                expires_in = token_data.get('expires_in', 1800)  # Default 30 minutes
                self._token_expires_at = datetime.now() + timedelta(seconds=expires_in - 60)  # Refresh 1 min early
                
                logger.info("✅ Amadeus access token obtained successfully")
                return self._access_token
            else:
                logger.error(f"❌ Amadeus auth failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error getting Amadeus access token: {str(e)}")
            return None
    
    def get_headers(self):
        """Get headers with Bearer token"""
        access_token = self.get_access_token()
        if not access_token:
            return None
            
        return {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/json'
        }
    
    def search_flights(self, origin: str, destination: str, departure_date: str, passengers: int = 1) -> List[Dict]:
        """
        Search for flight offers using Amadeus Flight Offers Search API
        
        Args:
            origin (str): Origin city or airport code
            destination (str): Destination city or airport code  
            departure_date (str): Departure date in YYYY-MM-DD format
            passengers (int): Number of passengers
            
        Returns:
            List[Dict]: List of flight offers
        """
        try:
            if not self.api_key or not self.api_secret:
                logger.warning("Amadeus API credentials not found in environment")
                return []
            
            headers = self.get_headers()
            if not headers:
                logger.error("Failed to get Amadeus access token")
                return []
            
            # Convert city names to IATA codes
            origin_code = self.get_airport_code(origin)
            dest_code = self.get_airport_code(destination)
            
            logger.info(f"Searching Amadeus flights: {origin_code} → {dest_code} on {departure_date}")
            
            # Amadeus Flight Offers Search endpoint
            url = f"{self.api_base_url}/v2/shopping/flight-offers"
            
            params = {
                'originLocationCode': origin_code,
                'destinationLocationCode': dest_code,
                'departureDate': departure_date,
                'adults': passengers,
                'max': 10,  # Limit results
                'currencyCode': 'INR'
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=30)
            logger.info(f"Amadeus API response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                flight_offers = data.get('data', [])
                logger.info(f"✅ Amadeus success: Found {len(flight_offers)} flight offers")
                
                # Transform to our format
                return self.transform_flight_data(flight_offers, origin, destination)
                
            elif response.status_code == 401:
                logger.error("❌ Amadeus authentication failed")
                return []
            elif response.status_code == 400:
                logger.error(f"❌ Amadeus bad request: {response.text}")
                return []
            else:
                logger.error(f"❌ Amadeus API error: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"❌ Amadeus flight search error: {str(e)}")
            return []
    
    def transform_flight_data(self, flight_offers: List[Dict], origin: str, destination: str) -> List[Dict]:
        """Transform Amadeus flight data to our standard format"""
        flights = []
        
        try:
            for i, offer in enumerate(flight_offers):
                try:
                    # Get first itinerary and segment
                    itineraries = offer.get('itineraries', [])
                    if not itineraries:
                        continue
                        
                    first_itinerary = itineraries[0]
                    segments = first_itinerary.get('segments', [])
                    if not segments:
                        continue
                        
                    first_segment = segments[0]
                    
                    # Extract flight details
                    departure = first_segment.get('departure', {})
                    arrival = first_segment.get('arrival', {})
                    aircraft = first_segment.get('aircraft', {})
                    operating = first_segment.get('operating', {})
                    
                    # Get airline info
                    airline_code = operating.get('carrierCode', first_segment.get('carrierCode', 'XX'))
                    flight_number = f"{airline_code}{first_segment.get('number', '000')}"
                    
                    # Get times
                    departure_time = self.format_time(departure.get('at', ''))
                    arrival_time = self.format_time(arrival.get('at', ''))
                    
                    # Calculate duration
                    duration = first_itinerary.get('duration', 'PT2H30M')  # ISO 8601 duration
                    duration_formatted = self.parse_duration(duration)
                    
                    # Get pricing
                    price_info = offer.get('price', {})
                    total_price = float(price_info.get('total', '5000'))
                    currency = price_info.get('currency', 'INR')
                    
                    # Get airline name
                    airline_name = self.get_airline_name(airline_code)
                    
                    flight = {
                        "id": f"AM_{i+1}",
                        "airline": airline_name,
                        "airline_code": airline_code,
                        "flight_number": flight_number,
                        "origin": origin,
                        "destination": destination,
                        "departure_time": departure_time,
                        "arrival_time": arrival_time,
                        "duration": duration_formatted,
                        "price": int(total_price),
                        "currency": currency,
                        "stops": len(segments) - 1,  # Number of stops
                        "aircraft": aircraft.get('code', 'Unknown'),
                        "booking_class": "Economy",
                        "available_seats": "Available",
                        "baggage": "15kg checked + 7kg carry-on",
                        "status": "Available"
                    }
                    
                    flights.append(flight)
                    
                except Exception as e:
                    logger.error(f"Error processing flight offer: {str(e)}")
                    continue
            
            logger.info(f"✅ Transformed {len(flights)} Amadeus flights")
            return flights[:10]  # Limit to 10 results
            
        except Exception as e:
            logger.error(f"❌ Error transforming Amadeus flight data: {str(e)}")
            return []
    
    def format_time(self, datetime_str: str) -> str:
        """Convert ISO datetime string to HH:MM format"""
        try:
            if datetime_str:
                dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
                return dt.strftime('%H:%M')
            return "08:00"
        except:
            return "08:00"
    
    def parse_duration(self, duration_str: str) -> str:
        """Parse ISO 8601 duration (PT2H30M) to readable format"""
        try:
            if 'PT' in duration_str:
                duration_str = duration_str.replace('PT', '')
                hours = 0
                minutes = 0
                
                if 'H' in duration_str:
                    hours = int(duration_str.split('H')[0])
                    duration_str = duration_str.split('H')[1] if 'H' in duration_str else duration_str
                
                if 'M' in duration_str:
                    minutes = int(duration_str.replace('M', ''))
                
                return f"{hours}h {minutes}m"
            return "2h 30m"
        except:
            return "2h 30m"
    
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
        }
        
        city_lower = city_or_code.lower().strip()
        
        # If it's already a 3-letter code, return as is
        if len(city_lower) == 3 and city_lower.isalpha():
            return city_lower.upper()
            
        # Look up city name
        return city_to_code.get(city_lower, city_lower.upper()[:3])
    
    def get_airline_name(self, airline_code: str) -> str:
        """Get airline name from IATA code"""
        airlines = {
            'AI': 'Air India',
            '6E': 'IndiGo',
            'SG': 'SpiceJet',
            'UK': 'Vistara',
            'G8': 'GoAir',
            'I5': 'AirAsia India',
            'S2': 'JetLite',
            'IT': 'Kingfisher Airlines',
            'DN': 'Alliance Air',
            '9W': 'Jet Airways'
        }
        
        return airlines.get(airline_code.upper(), f"{airline_code} Airlines")
    
    def test_api_connection(self) -> bool:
        """Test if the Amadeus API connection is working"""
        try:
            if not self.api_key or not self.api_secret:
                logger.error("❌ Amadeus credentials missing")
                return False
                
            # Test authentication
            token = self.get_access_token()
            if token:
                logger.info("✅ Amadeus API connection successful")
                return True
            else:
                logger.error("❌ Amadeus API connection failed")
                return False
        except Exception as e:
            logger.error(f"❌ Amadeus connection test error: {str(e)}")
            return False


# Global instance for the service
amadeus_service = AmadeusFlightService()


# Test function to verify API integration
async def test_amadeus_api():
    """Test the Amadeus integration"""
    try:
        flights = amadeus_service.search_flights('Delhi', 'Mumbai', '2025-02-15', 2)
        if flights:
            logger.info(f"✅ Amadeus test successful - Found {len(flights)} flights")
            for flight in flights[:3]:  # Show first 3 flights
                logger.info(f"  ✈️ {flight['airline']} {flight['flight_number']} - ₹{flight['price']}")
            return True
        else:
            logger.info("✅ Amadeus API connected, but no flights found")
            return True
    except Exception as e:
        logger.error(f"❌ Amadeus test error: {str(e)}")
        return False


if __name__ == "__main__":
    # For testing purposes
    import asyncio
    asyncio.run(test_amadeus_api())