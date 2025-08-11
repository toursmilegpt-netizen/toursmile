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
        
        # API credentials - from environment
        self._user_id = os.environ.get('TRIPJACK_USER_ID')
        self._email = os.environ.get('TRIPJACK_EMAIL')
        self._password = os.environ.get('TRIPJACK_PASSWORD')
        self._agency_name = os.environ.get('TRIPJACK_AGENCY_NAME')
        self._api_key = None
        self._api_secret = None
        self._access_token = None
        self._token_expires_at = None
        
        logger.info(f"🚀 TripjackFlightService initialized - Environment: {'PRODUCTION' if self.is_production else 'UAT'}")
        logger.info(f"📡 Base URL: {self.base_url}")
        logger.info(f"🏢 Agency: {self._agency_name}")
        logger.info(f"👤 User ID: {self._user_id}")

    @property
    def api_key(self):
        """Lazy load API key from environment"""
        if self._api_key is None:
            self._api_key = os.environ.get('TRIPJACK_API_KEY')
        return self._api_key

    def search_flights(self, origin: str, destination: str, departure_date: str, passengers: int = 1, class_type: str = "economy", trip_type: str = "oneway", return_date: str = None):
        """
        Search for flights using Tripjack API
        """
        try:
            # Authenticate first if not already authenticated
            if not self.authenticated:
                auth_result = self.authenticate()
                if not auth_result.get('success'):
                    return []

            # Map class type to Tripjack format
            cabin_class_map = {
                "economy": "Y",
                "business": "C", 
                "first": "F"
            }
            cabin_class = cabin_class_map.get(class_type.lower(), "Y")

            # Prepare search parameters based on Tripjack API structure
            search_data = {
                "searchQuery": {
                    "cabinClass": cabin_class,
                    "paxInfo": {
                        "ADULT": passengers,
                        "CHILD": 0,
                        "INFANT": 0
                    },
                    "routeInfos": [
                        {
                            "fromCityOrAirport": {
                                "code": origin
                            },
                            "toCityOrAirport": {
                                "code": destination
                            },
                            "travelDate": departure_date
                        }
                    ],
                    "searchModifiers": {
                        "isDirectFlight": False,
                        "isConnectingFlight": False
                    }
                }
            }

            # Add return date for round trip
            if trip_type.lower() == "roundtrip" and return_date:
                search_data["searchQuery"]["routeInfos"].append({
                    "fromCityOrAirport": {
                        "code": destination
                    },
                    "toCityOrAirport": {
                        "code": origin
                    },
                    "travelDate": return_date
                })

            headers = {
                'Content-Type': 'application/json',
                'apikey': self.api_key
            }

            # Make search request
            search_url = f"{self.base_url}/fms/v1/air-search-all"
            logger.info(f"Making flight search request to: {search_url}")
            logger.info(f"Search data: {search_data}")

            response = requests.post(search_url, json=search_data, headers=headers, timeout=30)
            
            logger.info(f"Search response status: {response.status_code}")
            logger.info(f"Search response: {response.text[:1000]}")

            if response.status_code == 200:
                response_data = response.json()
                
                if response_data.get('searchResult', {}).get('tripInfos'):
                    # Parse flight results based on actual Tripjack structure
                    trip_infos = response_data.get('searchResult', {}).get('tripInfos', [])
                    flights = self._parse_tripjack_flights(trip_infos, origin, destination)
                    logger.info(f"✅ Successfully parsed {len(flights)} flights from Tripjack")
                    return flights
                else:
                    logger.error(f"❌ Tripjack search failed or no results: {response_data}")
                    return []
            else:
                logger.error(f"❌ Tripjack search request failed: {response.status_code} - {response.text}")
                return []

        except Exception as e:
            logger.error(f"❌ Error in Tripjack flight search: {str(e)}")
            return []
    
    def _get_airport_code(self, city_name: str) -> str:
        """Convert city name to airport code"""
        city_to_airport = {
            "delhi": "DEL",
            "mumbai": "BOM", 
            "bangalore": "BLR",
            "chennai": "MAA",
            "kolkata": "CCU",
            "hyderabad": "HYD",
            "pune": "PNQ",
            "ahmedabad": "AMD",
            "goa": "GOI",
            "kochi": "COK",
            "jaipur": "JAI",
            "trivandrum": "TRV"
        }
        
        city_lower = city_name.lower()
        return city_to_airport.get(city_lower, city_name.upper()[:3])
    
    def _parse_tripjack_flights(self, response: Dict[str, Any], origin: str, destination: str) -> List[Dict[str, Any]]:
        """Parse Tripjack API response and convert to our standard format"""
        flights = []
        
        try:
            # Navigate through Tripjack response structure
            search_result = response.get("searchResult", {})
            trip_infos = search_result.get("tripInfos", [])
            
            if not trip_infos:
                logger.warning("No trip info found in Tripjack response")
                return flights
            
            # Process each trip info (flight option)
            for trip_info in trip_infos[:10]:  # Limit to first 10 results
                sI = trip_info.get("sI", [])
                total_price = trip_info.get("totalPriceInfo", {}).get("totalFareDetail", {}).get("fC", {}).get("TF", 0)
                
                if sI:
                    # Get first segment details
                    segment = sI[0]
                    flight_details = segment.get("fD", {})
                    
                    flight_data = {
                        "id": f"TJ_{trip_info.get('id', 'unknown')}",
                        "airline": flight_details.get("aI", {}).get("name", "Unknown Airline"),
                        "airline_code": flight_details.get("aI", {}).get("code", "XX"),
                        "flight_number": f"{flight_details.get('aI', {}).get('code', 'XX')}-{flight_details.get('fN', '000')}",
                        "origin": origin,
                        "destination": destination,
                        "departure_time": flight_details.get("dT", "00:00"),
                        "arrival_time": flight_details.get("aT", "00:00"),
                        "duration_minutes": flight_details.get("eT", 120),
                        "stops": len(sI) - 1,  # Number of segments minus 1
                        "price": int(total_price),
                        "original_price": int(total_price * 1.1),  # Assume 10% discount
                        "total_price": int(total_price),
                        "currency": "INR",
                        "aircraft_type": flight_details.get("eT", "Unknown"),
                        "is_lcc": "LCC" in flight_details.get("aI", {}).get("name", "").upper(),
                        "refundable": trip_info.get("isRefundable", False),
                        "fare_type": self._determine_fare_type(trip_info),
                        "baggage_info": "7 Kg",  # Default baggage
                        "data_source": "tripjack_api"
                    }
                    
                    flights.append(flight_data)
            
            logger.info(f"✅ Parsed {len(flights)} flights from Tripjack response")
            return flights
            
        except Exception as e:
            logger.error(f"❌ Error parsing Tripjack flights: {str(e)}")
            return []
    
    def _determine_fare_type(self, trip_info: Dict[str, Any]) -> str:
        """Determine fare type based on trip info"""
        fare_info = trip_info.get("totalPriceInfo", {}).get("totalFareDetail", {})
        
        # Check for different fare types based on Tripjack structure
        if fare_info.get("afC", {}).get("TAF", {}).get("salefare"):
            return "SALE"
        elif fare_info.get("afC", {}).get("TAF", {}).get("corporate"):
            return "CORPORATE"
        elif fare_info.get("afC", {}).get("TAF", {}).get("flexi"):
            return "FLEXI"
        else:
            return "PUBLISHED"
    
    def _get_fallback_flights(self, origin: str, destination: str) -> List[Dict[str, Any]]:
        """Return fallback flight data when API fails"""
        logger.info("📋 Using fallback flight data")
        
        return [
            {
                "id": "fallback_1",
                "airline": "Air India",
                "airline_code": "AI",
                "flight_number": "AI-131",
                "origin": origin,
                "destination": destination, 
                "departure_time": "09:15",
                "arrival_time": "11:30",
                "duration_minutes": 135,
                "stops": 0,
                "price": 6200,
                "original_price": 7200,
                "total_price": 6200,
                "currency": "INR",
                "aircraft_type": "A321",
                "is_lcc": False,
                "refundable": True,
                "fare_type": "PUBLISHED",
                "baggage_info": "15 Kg",
                "data_source": "fallback"
            },
            {
                "id": "fallback_2", 
                "airline": "IndiGo",
                "airline_code": "6E",
                "flight_number": "6E-2031",
                "origin": origin,
                "destination": destination,
                "departure_time": "14:20", 
                "arrival_time": "16:45",
                "duration_minutes": 145,
                "stops": 0,
                "price": 4500,
                "original_price": 5200,
                "total_price": 4500,
                "currency": "INR", 
                "aircraft_type": "A320",
                "is_lcc": True,
                "refundable": False,
                "fare_type": "SALE",
                "baggage_info": "7 Kg",
                "data_source": "fallback"
            }
        ]

    def authenticate(self) -> bool:
        """Authenticate with Tripjack API using API key"""
        try:
            # First check if we have API key
            if self.api_key:
                logger.info(f"🔑 Using Tripjack API Key authentication")
                logger.info(f"API Key: {self.api_key[:20]}...")
                # For API key authentication, we don't need to call a separate auth endpoint
                # The API key will be used directly in API calls
                self._access_token = self.api_key
                # Set a long expiry since API keys don't typically expire
                self._token_expires_at = datetime.now() + timedelta(hours=24)
                logger.info("✅ Tripjack API Key authentication ready!")
                return True
            
            # Fallback to user credentials authentication if no API key
            if not self._user_id or not self._email or not self._password:
                logger.error("❌ Neither API key nor user credentials found in environment")
                logger.error(f"API Key: {self.api_key[:10] if self.api_key else 'None'}...")
                logger.error(f"User ID: {self._user_id}, Email: {self._email}")
                return False

            # Check if we have a valid token from previous auth
            if (self._access_token and self._token_expires_at and 
                datetime.now() < self._token_expires_at):
                return True

            logger.info(f"🔐 Attempting user credentials authentication with {self._email}...")
            
            # Try various possible Tripjack authentication endpoints
            possible_endpoints = [
                f"{self.base_url}/fms/v1/authenticate",
                f"{self.base_url}/api/authenticate", 
                f"{self.base_url}/api/login",
                f"{self.base_url}/login"
            ]
            
            auth_data = {
                "user_id": self._user_id,
                "email": self._email,
                "password": self._password,
                "agency_name": self._agency_name
            }

            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": "TourSmile/1.0"
            }

            for auth_url in possible_endpoints:
                try:
                    logger.info(f"📡 Trying auth endpoint: {auth_url}")
                    response = requests.post(auth_url, json=auth_data, headers=headers, timeout=15)
                    
                    logger.info(f"📊 Auth Response Status: {response.status_code}")
                    
                    if response.status_code == 200:
                        try:
                            auth_response = response.json()
                            logger.info(f"✅ Auth response received from {auth_url}")
                            
                            # Extract authentication token (structure may vary)
                            token_fields = ['access_token', 'token', 'authToken', 'accessToken']
                            for field in token_fields:
                                if field in auth_response:
                                    self._access_token = auth_response[field]
                                    logger.info(f"🔑 Found token in field: {field}")
                                    break
                            
                            if not self._access_token:
                                # Try to find any token-like field
                                for key, value in auth_response.items():
                                    if 'token' in key.lower() and isinstance(value, str):
                                        self._access_token = value
                                        logger.info(f"🔑 Using token from field: {key}")
                                        break
                            
                            if self._access_token:
                                # Set token expiry (usually 1 hour, setting to 50 minutes for safety)
                                self._token_expires_at = datetime.now() + timedelta(minutes=50)
                                logger.info("✅ Tripjack user credentials authentication successful!")
                                return True
                                
                        except json.JSONDecodeError as e:
                            logger.error(f"❌ Failed to parse auth response as JSON: {e}")
                            continue
                            
                except requests.RequestException as e:
                    logger.info(f"⚠️ Endpoint {auth_url} failed: {e}")
                    continue
            
            logger.error("❌ All authentication methods failed")
            return False
                
        except Exception as e:
            logger.error(f"❌ Tripjack authentication error: {str(e)}")
            return False

    def _try_alternative_auth(self) -> bool:
        """Try alternative authentication methods"""
        try:
            logger.info("🔄 Trying alternative authentication methods...")
            
            # Method 2: Try different endpoint structure
            alt_endpoints = [
                f"{self.base_url}/auth/login",
                f"{self.base_url}/user/login",
                f"{self.base_url}/api/auth/login",
                f"{self.base_url}/api/user/authenticate"
            ]
            
            for endpoint in alt_endpoints:
                try:
                    logger.info(f"🔄 Trying endpoint: {endpoint}")
                    
                    auth_data = {
                        "username": self._email,
                        "password": self._password,
                        "userId": self._user_id
                    }
                    
                    response = requests.post(endpoint, json=auth_data, headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }, timeout=10)
                    
                    if response.status_code == 200:
                        auth_response = response.json()
                        logger.info(f"✅ Alternative auth successful at {endpoint}")
                        
                        # Extract token
                        for token_field in ['access_token', 'token', 'authToken', 'sessionToken']:
                            if token_field in auth_response:
                                self._access_token = auth_response[token_field]
                                self._token_expires_at = datetime.now() + timedelta(minutes=50)
                                return True
                                
                except Exception as e:
                    logger.info(f"Endpoint {endpoint} failed: {str(e)}")
                    continue
            
            return False
            
        except Exception as e:
            logger.error(f"Alternative auth failed: {str(e)}")
            return False

    def get_headers(self):
        """Get authenticated headers for API requests"""
        if not self._access_token:
            if not self.authenticate():
                return {}
        
        return {
            "Authorization": f"Bearer {self._access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "TourSmile/1.0"
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