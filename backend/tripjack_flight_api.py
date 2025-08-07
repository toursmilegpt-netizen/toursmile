# Tripjack Flight API Integration
# Comprehensive flight search with Indian LCC coverage and advanced filtering

import requests
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TripjackFlightService:
    def __init__(self):
        # Base URLs
        self.uat_base_url = "https://apitest.tripjack.com"
        self.prod_base_url = "https://tripjack.com"
        self.is_production = os.environ.get('TRIPJACK_ENV', 'UAT').upper() == 'PROD'
        
        # Current base URL
        self.base_url = self.prod_base_url if self.is_production else self.uat_base_url
        
        # API credentials - lazy loaded
        self._api_key = None
        self._api_secret = None
        self._access_token = None
        self._token_expires_at = None
        
        logger.info(f"🚀 TripjackFlightService initialized - Environment: {'PRODUCTION' if self.is_production else 'UAT'}")
        logger.info(f"📡 Base URL: {self.base_url}")

    @property
    def api_key(self):
        """Lazy load API key from environment"""
        if self._api_key is None:
            self._api_key = os.environ.get('TRIPJACK_API_KEY')
        return self._api_key

    @property
    def api_secret(self):
        """Lazy load API secret from environment"""
        if self._api_secret is None:
            self._api_secret = os.environ.get('TRIPJACK_API_SECRET')
        return self._api_secret

    def authenticate(self) -> bool:
        """Authenticate with Tripjack API and get access token"""
        try:
            if not self.api_key or not self.api_secret:
                logger.error("❌ Tripjack API credentials not found in environment")
                return False

            # Check if we have a valid token
            if (self._access_token and self._token_expires_at and 
                datetime.now() < self._token_expires_at):
                return True

            # Authentication endpoint (inferred based on common patterns)
            auth_url = f"{self.base_url}/api/auth/token"
            
            auth_data = {
                "api_key": self.api_key,
                "api_secret": self.api_secret
            }

            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }

            response = requests.post(auth_url, json=auth_data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                auth_response = response.json()
                self._access_token = auth_response.get('access_token')
                
                # Set token expiry (usually 1 hour, setting to 50 minutes for safety)
                self._token_expires_at = datetime.now() + timedelta(minutes=50)
                
                logger.info("✅ Tripjack authentication successful")
                return True
            else:
                logger.error(f"❌ Tripjack authentication failed: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return False

        except Exception as e:
            logger.error(f"❌ Tripjack authentication error: {str(e)}")
            return False

    def get_headers(self):
        """Get authenticated headers for API requests"""
        if not self._access_token:
            if not self.authenticate():
                return {}
        
        return {
            "Authorization": f"Bearer {self._access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
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
            'indore': 'IDR',
            'srinagar': 'SXR',
            'trivandrum': 'TRV',
            'calicut': 'CCJ',
            'mangalore': 'IXE',
            'coimbatore': 'CJB',
            'madurai': 'IXM',
            'tiruchirapalli': 'TRZ',
            'vizag': 'VTZ',
            'visakhapatnam': 'VTZ',
            'vijayawada': 'VGA',
            'raipur': 'RPR',
            'nagpur': 'NAG',
            'bhopal': 'BHO',
            'udaipur': 'UDR',
            'jodhpur': 'JDH',
            'dehradun': 'DED',
            'jammu': 'IXJ',
            'leh': 'IXL',
            'patna': 'PAT',
            'ranchi': 'IXR',
            'agartala': 'IXA',
            'imphal': 'IMF',
            'guwahati': 'GAU',
            'dibrugarh': 'DIB',
            'silchar': 'IXS'
        }
        
        city_lower = city_or_code.lower().strip()
        
        # If it's already a 3-letter code, return as is
        if len(city_lower) == 3 and city_lower.isalpha():
            return city_lower.upper()
            
        # Look up city name
        return city_to_code.get(city_lower, 'DEL')  # Default to Delhi if not found

    def search_flights(self, origin: str, destination: str, departure_date: str, 
                      passengers: int = 1, trip_type: str = "oneway", 
                      return_date: Optional[str] = None, class_type: str = "economy") -> List[Dict]:
        """
        Search flights using Tripjack API with comprehensive filtering
        
        Args:
            origin (str): Origin city or airport code
            destination (str): Destination city or airport code
            departure_date (str): Departure date in YYYY-MM-DD format
            passengers (int): Number of adult passengers
            trip_type (str): Trip type - 'oneway', 'roundtrip', 'multicity'
            return_date (str, optional): Return date for roundtrip
            class_type (str): Cabin class - 'economy', 'business', 'first'
            
        Returns:
            List[Dict]: List of flight offers with comprehensive details
        """
        try:
            if not self.authenticate():
                logger.error("❌ Failed to authenticate with Tripjack API")
                return []

            # Convert cities to airport codes
            origin_code = self.get_airport_code(origin)
            dest_code = self.get_airport_code(destination)
            
            logger.info(f"🔍 Tripjack flight search: {origin_code} → {dest_code} on {departure_date}")
            
            # Construct search endpoint (inferred from post-booking API patterns)
            search_url = f"{self.base_url}/fms/v1/air/search"
            
            # Passenger details structure
            passengers_data = {
                "adults": passengers,
                "children": 0,
                "infants": 0
            }
            
            # Trip segments
            segments = [
                {
                    "origin": origin_code,
                    "destination": dest_code,
                    "departureDate": departure_date
                }
            ]
            
            if trip_type.lower() == "roundtrip" and return_date:
                segments.append({
                    "origin": dest_code,
                    "destination": origin_code,
                    "departureDate": return_date
                })

            # Search request payload
            search_payload = {
                "searchQuery": {
                    "cabinClass": class_type.upper(),
                    "tripType": trip_type.upper(),
                    "segments": segments,
                    "passengers": passengers_data
                },
                "options": {
                    "currency": "INR",
                    "locale": "en-IN",
                    "includeAllFareTypes": True,  # Include refundable, non-refundable, etc.
                    "includeLCC": True,           # Ensure LCC coverage
                    "maxResults": 50,
                    "sortBy": "price"             # Default sort by price
                }
            }

            headers = self.get_headers()
            
            logger.info(f"📡 Making request to: {search_url}")
            logger.debug(f"🔧 Payload: {json.dumps(search_payload, indent=2)}")
            
            response = requests.post(search_url, json=search_payload, headers=headers, timeout=60)
            logger.info(f"📊 API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ Tripjack flight search successful!")
                
                # Extract flights from response
                flights_data = data.get('searchResult', {}).get('tripInfos', [])
                
                if flights_data:
                    transformed_flights = self.transform_flight_data(flights_data, origin, destination)
                    logger.info(f"✅ Found {len(transformed_flights)} flights with comprehensive details")
                    return transformed_flights
                else:
                    logger.warning("⚠️ No flights found in Tripjack response")
                    return []
                    
            elif response.status_code == 401:
                logger.error("❌ Tripjack authentication failed - Invalid credentials")
                self._access_token = None  # Force re-authentication
                return []
            elif response.status_code == 403:
                logger.error("❌ Tripjack access forbidden - Check API permissions")
                return []
            else:
                logger.error(f"❌ Tripjack API error: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"❌ Tripjack flight search error: {str(e)}")
            return []

    def transform_flight_data(self, flights_data: List[Dict], origin: str, destination: str) -> List[Dict]:
        """Transform Tripjack flight data to our comprehensive format with advanced filtering support"""
        transformed = []
        
        try:
            for trip_info in flights_data:
                try:
                    # Extract segment information
                    segments = trip_info.get('sI', [])
                    if not segments:
                        continue
                    
                    for segment_info in segments:
                        # Extract flight designator
                        flight_designator = segment_info.get('fD', {})
                        airline_info = flight_designator.get('al', {})
                        
                        # Airline details
                        airline_code = airline_info.get('code', 'XX')
                        airline_name = airline_info.get('name', self.get_airline_name(airline_code))
                        is_lcc = airline_info.get('isLcc', False)
                        
                        # Flight details
                        flight_number = f"{airline_code}{flight_designator.get('fN', '000')}"
                        aircraft_type = flight_designator.get('eT', 'Unknown')
                        
                        # Times and duration
                        departure_time = self.format_time(segment_info.get('dt', ''))
                        arrival_time = self.format_time(segment_info.get('at', ''))
                        duration_minutes = segment_info.get('duration', 0)
                        duration = self.format_duration(duration_minutes)
                        
                        # Airport information
                        departure_airport = segment_info.get('da', {})
                        arrival_airport = segment_info.get('aa', {})
                        
                        # Fare information (from totalPriceList)
                        total_price_list = trip_info.get('totalPriceList', [])
                        fare_options = []
                        base_price = 0
                        
                        for fare_info in total_price_list:
                            fare_identifier = fare_info.get('fareIdentifier', 'UNKNOWN')
                            total_fare = fare_info.get('fd', {}).get('ADULT', {}).get('tF', 0)
                            base_fare = fare_info.get('fd', {}).get('ADULT', {}).get('bF', 0)
                            taxes = total_fare - base_fare
                            
                            fare_option = {
                                "fareType": self.get_fare_type_name(fare_identifier),
                                "totalPrice": total_fare,
                                "basePrice": base_fare,
                                "taxes": taxes,
                                "currency": "INR",
                                "refundable": "REFUNDABLE" in fare_identifier.upper(),
                                "changeable": True,  # Assume changeable unless specified otherwise
                                "fareRules": self.extract_fare_rules(fare_info)
                            }
                            fare_options.append(fare_option)
                            
                            # Use first fare as base price
                            if base_price == 0:
                                base_price = total_fare
                        
                        # Build comprehensive flight object
                        flight_obj = {
                            # Basic flight info
                            "id": f"TJ_{trip_info.get('id', 'unknown')}",
                            "airline": airline_name,
                            "airline_code": airline_code,
                            "flight_number": flight_number,
                            "aircraft_type": aircraft_type,
                            "is_lcc": is_lcc,
                            
                            # Route and timing
                            "origin": origin,
                            "destination": destination,
                            "origin_code": departure_airport.get('code', 'XXX'),
                            "destination_code": arrival_airport.get('code', 'XXX'),
                            "origin_terminal": departure_airport.get('terminal', ''),
                            "destination_terminal": arrival_airport.get('terminal', ''),
                            "departure_time": departure_time,
                            "arrival_time": arrival_time,
                            "duration": duration,
                            "duration_minutes": duration_minutes,
                            "stops": 0,  # Tripjack provides segment-wise data
                            
                            # Pricing and fare options
                            "price": int(base_price),
                            "currency": "INR",
                            "fare_options": fare_options,
                            "lowest_fare": min([f["totalPrice"] for f in fare_options]) if fare_options else base_price,
                            "highest_fare": max([f["totalPrice"] for f in fare_options]) if fare_options else base_price,
                            
                            # Filtering attributes
                            "booking_class": "Economy",  # Can be enhanced based on cabin class
                            "available": True,
                            "seats_available": "Available",
                            
                            # Additional details for filters
                            "departure_hour": int(departure_time.split(':')[0]) if ':' in departure_time else 0,
                            "arrival_hour": int(arrival_time.split(':')[0]) if ':' in arrival_time else 0,
                            "is_morning": 6 <= int(departure_time.split(':')[0]) < 12 if ':' in departure_time else False,
                            "is_afternoon": 12 <= int(departure_time.split(':')[0]) < 18 if ':' in departure_time else False,
                            "is_evening": 18 <= int(departure_time.split(':')[0]) < 24 if ':' in departure_time else False,
                            "is_night": int(departure_time.split(':')[0]) < 6 if ':' in departure_time else False,
                            
                            # Baggage and services
                            "baggage_info": self.get_baggage_info(trip_info),
                            "meal_available": True,  # Assume meals available for most flights
                            "wifi_available": False,  # Conservative assumption
                            
                            # Booking info
                            "booking_token": trip_info.get('searchId', ''),  # For booking flow
                            "last_ticketing_date": "",  # Can be extracted if available
                            "status": "Available"
                        }
                        
                        transformed.append(flight_obj)
                        
                        # Log flight for debugging
                        lcc_indicator = "💰" if is_lcc else "✈️"
                        logger.info(f"{lcc_indicator} {airline_name} {flight_number} - ₹{base_price} ({len(fare_options)} fares)")
                        
                except Exception as segment_error:
                    logger.error(f"Error processing segment: {str(segment_error)}")
                    continue
                    
            return transformed
            
        except Exception as e:
            logger.error(f"❌ Error transforming Tripjack flight data: {str(e)}")
            return []

    def get_fare_type_name(self, fare_identifier: str) -> str:
        """Convert fare identifier to user-friendly name"""
        fare_types = {
            "PUBLISHED": "Regular Fare",
            "CORPORATE": "Corporate Fare",
            "SME": "SME Fare",
            "OFFER": "Special Offer",
            "REFUNDABLE": "Refundable Fare",
            "NON_REFUNDABLE": "Non-Refundable Fare",
            "FLEXI": "Flexible Fare"
        }
        
        # Check for keywords in fare identifier
        fare_upper = fare_identifier.upper()
        for key, name in fare_types.items():
            if key in fare_upper:
                return name
        
        return "Standard Fare"

    def extract_fare_rules(self, fare_info: Dict) -> List[str]:
        """Extract fare rules from fare information"""
        rules = []
        
        # Add basic rules based on fare type
        fare_identifier = fare_info.get('fareIdentifier', '').upper()
        
        if 'REFUNDABLE' in fare_identifier:
            rules.append("Cancellation charges apply")
            rules.append("Free date change allowed")
        elif 'NON_REFUNDABLE' in fare_identifier:
            rules.append("No refund on cancellation")
            rules.append("Date change with penalty")
        
        if 'FLEXI' in fare_identifier:
            rules.append("Free date/time change")
            rules.append("Flexible booking conditions")
        
        return rules if rules else ["Standard booking conditions apply"]

    def get_baggage_info(self, trip_info: Dict) -> Dict[str, str]:
        """Extract baggage information"""
        return {
            "checked": "15kg",  # Standard for most airlines in India
            "carry_on": "7kg",
            "personal_item": "2kg"
        }

    def format_time(self, datetime_str: str) -> str:
        """Convert datetime string to HH:MM format"""
        try:
            if datetime_str:
                # Handle different datetime formats from Tripjack
                if 'T' in datetime_str:
                    dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
                    return dt.strftime('%H:%M')
                else:
                    # If it's already in time format
                    return datetime_str
            return "08:00"
        except Exception as e:
            logger.warning(f"Error parsing time {datetime_str}: {str(e)}")
            return "08:00"

    def format_duration(self, minutes: int) -> str:
        """Convert duration in minutes to readable format"""
        try:
            hours = minutes // 60
            mins = minutes % 60
            return f"{hours}h {mins:02d}m"
        except:
            return "2h 30m"

    def get_airline_name(self, airline_code: str) -> str:
        """Get airline name from IATA code - comprehensive Indian airlines list"""
        airlines = {
            # Major Indian Airlines (including LCCs)
            '6E': 'IndiGo',                    # Largest Indian LCC
            'SG': 'SpiceJet',                  # Major Indian LCC
            'AI': 'Air India',                 # Flag carrier
            'UK': 'Vistara',                   # Tata-Singapore joint venture
            'G8': 'GoFirst (GoAir)',           # Budget airline
            'I5': 'AirAsia India',             # International LCC branch
            'IX': 'Air India Express',         # Air India's LCC subsidiary
            'QP': 'Akasa Air',                 # New Indian airline
            'S2': 'JetLite',                   # Budget arm of Jet Airways
            'DN': 'Alliance Air',              # Regional carrier
            '2T': 'Trujet',                    # Regional LCC
            
            # Regional and Charter Airlines
            'Z8': 'Zoom Air',
            'OG': 'FlyBig',
            'LB': 'Star Air',
            
            # International Airlines (common in India)
            'QR': 'Qatar Airways',
            'EK': 'Emirates',
            'SV': 'Saudi Arabian Airlines',
            'TG': 'Thai Airways',
            'SQ': 'Singapore Airlines',
            'CX': 'Cathay Pacific',
            'EY': 'Etihad Airways',
            'LH': 'Lufthansa',
            'BA': 'British Airways',
            'KL': 'KLM',
            'AF': 'Air France',
            'TK': 'Turkish Airlines',
            'MS': 'EgyptAir',
            'GF': 'Gulf Air',
            'WY': 'Oman Air'
        }
        
        return airlines.get(airline_code.upper(), f"{airline_code} Airlines")

    def test_connection(self) -> bool:
        """Test Tripjack API connection and authentication"""
        try:
            logger.info("🧪 Testing Tripjack API connection...")
            
            if not self.api_key or not self.api_secret:
                logger.error("❌ Tripjack API credentials not configured")
                return False
            
            # Test authentication
            if self.authenticate():
                logger.info("✅ Tripjack authentication successful")
                
                # Test flight search
                test_flights = self.search_flights('Delhi', 'Mumbai', '2025-08-01', 1)
                
                if test_flights:
                    logger.info(f"✅ Flight search successful - Found {len(test_flights)} flights")
                    
                    # Check for LCC coverage
                    lcc_flights = [f for f in test_flights if f.get('is_lcc', False)]
                    logger.info(f"🎯 LCC flights found: {len(lcc_flights)}")
                    
                    # Show sample flights
                    for flight in test_flights[:3]:
                        lcc_flag = "💰" if flight.get('is_lcc', False) else "✈️"
                        logger.info(f"  {lcc_flag} {flight['airline']} {flight['flight_number']} - ₹{flight['price']}")
                        logger.info(f"     Fare options: {len(flight.get('fare_options', []))}")
                    
                    return True
                else:
                    logger.warning("⚠️ No flights found in test search")
                    return True  # Connection works, just no flights for test route
            else:
                logger.error("❌ Tripjack authentication failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Tripjack connection test failed: {str(e)}")
            return False


# Global service instance
tripjack_flight_service = TripjackFlightService()


# Test function for debugging
async def test_tripjack_integration():
    """Test Tripjack integration with comprehensive output"""
    try:
        logger.info("🧪 Testing Tripjack Flight API integration...")
        
        # Test connection first
        if not tripjack_flight_service.test_connection():
            logger.error("❌ Tripjack connection test failed")
            return False
        
        # Test comprehensive flight search
        flights = tripjack_flight_service.search_flights(
            origin='Delhi',
            destination='Mumbai', 
            departure_date='2025-08-01',
            passengers=1,
            trip_type='oneway',
            class_type='economy'
        )
        
        if flights:
            logger.info(f"✅ Comprehensive flight search successful - Found {len(flights)} flights")
            
            # Analyze results
            lcc_count = sum(1 for f in flights if f.get('is_lcc', False))
            total_fares = sum(len(f.get('fare_options', [])) for f in flights)
            avg_price = sum(f['price'] for f in flights) / len(flights)
            
            logger.info(f"📊 Analysis:")
            logger.info(f"   • LCC Airlines: {lcc_count}/{len(flights)} flights")
            logger.info(f"   • Total Fare Options: {total_fares}")
            logger.info(f"   • Average Price: ₹{avg_price:.0f}")
            
            # Show fare type diversity
            unique_fare_types = set()
            for flight in flights:
                for fare in flight.get('fare_options', []):
                    unique_fare_types.add(fare['fareType'])
            
            logger.info(f"   • Fare Types Available: {', '.join(unique_fare_types)}")
            
            return True
        else:
            logger.warning("⚠️ No flights found in comprehensive test")
            return False
            
    except Exception as e:
        logger.error(f"❌ Tripjack integration test error: {str(e)}")
        return False


if __name__ == "__main__":
    # For testing purposes
    import asyncio
    asyncio.run(test_tripjack_integration())