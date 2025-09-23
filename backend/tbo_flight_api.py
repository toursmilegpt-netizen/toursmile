import os
import asyncio
import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import httpx
import structlog
from pydantic import BaseModel

# Configure logging
logger = structlog.get_logger(__name__)

class TBOFlightService:
    def __init__(self):
        self.username = os.getenv('TBO_USERNAME', 'Smile')
        self.password = os.getenv('TBO_PASSWORD', 'Smile@123')
        self.base_url = os.getenv('TBO_BASE_URL', 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest')
        self.auth_url = os.getenv('TBO_AUTH_URL', 'http://api.tektravels.com/SharedServices/SharedData.svc')
        self.client_id = os.getenv('TBO_CLIENT_ID', 'ApiIntegrationNew')
        
        # Token management
        self.auth_token = None
        self.token_expires_at = None
        
        logger.info("TBO Flight Service initialized", 
                   username=self.username, 
                   base_url=self.base_url)

    async def get_auth_token(self, trace_id: str = None) -> str:
        """Get or refresh TBO authentication token"""
        if not trace_id:
            trace_id = str(uuid.uuid4())
        
        # Check if current token is still valid (with 5 min buffer)
        if self.auth_token and self.token_expires_at:
            if datetime.now() < self.token_expires_at - timedelta(minutes=5):
                return self.auth_token
        
        logger.info("Refreshing TBO authentication token", trace_id=trace_id)
        
        auth_payload = {
            "ClientId": self.client_id,
            "UserName": self.username,
            "Password": self.password,
            "EndUserIp": "192.168.1.1"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.auth_url}/rest/Authenticate",
                    json=auth_payload,
                    headers={
                        "Content-Type": "application/json",
                        "Accept-Encoding": "gzip"
                    }
                )
                
                response.raise_for_status()
                auth_data = response.json()
                
                if auth_data.get("Status", {}).get("Success"):
                    self.auth_token = auth_data.get("TokenId")
                    # Token expires at 23:59:59 IST - for now use 23 hours from now
                    self.token_expires_at = datetime.now() + timedelta(hours=23)
                    
                    logger.info("TBO token refreshed successfully", 
                               trace_id=trace_id,
                               token_preview=self.auth_token[:10] + "..." if self.auth_token else None)
                    return self.auth_token
                else:
                    error_msg = auth_data.get("Status", {}).get("Description", "Authentication failed")
                    logger.error("TBO authentication failed", 
                                error=error_msg, 
                                trace_id=trace_id)
                    raise Exception(f"TBO authentication failed: {error_msg}")
                    
            except httpx.TimeoutException:
                logger.error("TBO authentication timeout", trace_id=trace_id)
                raise Exception("TBO authentication request timed out")
            except Exception as e:
                logger.error("TBO authentication error", 
                            error=str(e), 
                            trace_id=trace_id)
                raise Exception(f"TBO authentication error: {str(e)}")

    def convert_city_to_iata(self, city_name: str) -> str:
        """Convert city name to IATA code"""
        city_mapping = {
            "mumbai": "BOM",
            "delhi": "DEL", 
            "bangalore": "BLR",
            "bengaluru": "BLR",
            "chennai": "MAA",
            "kolkata": "CCU",
            "hyderabad": "HYD",
            "pune": "PNQ",
            "ahmedabad": "AMD",
            "goa": "GOI",
            "jaipur": "JAI",
            "cochin": "COK",
            "kochi": "COK",
            "trivandrum": "TRV",
            "coimbatore": "CJB",
            "new york": "JFK",
            "london": "LHR",
            "dubai": "DXB",
            "singapore": "SIN",
            "bangkok": "BKK",
            "kuala lumpur": "KUL",
            "hong kong": "HKG",
            "tokyo": "NRT",
            "paris": "CDG",
            "amsterdam": "AMS",
            "frankfurt": "FRA"
        }
        
        return city_mapping.get(city_name.lower(), city_name.upper())

    async def search_flights(
        self, 
        origin: str, 
        destination: str, 
        departure_date: str,
        passengers: int = 1,
        class_type: str = "economy",
        trip_type: str = "oneway",
        return_date: Optional[str] = None,
        trace_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search flights using TBO API"""
        
        if not trace_id:
            trace_id = str(uuid.uuid4())
        
        logger.info("Searching flights via TBO API", 
                   origin=origin,
                   destination=destination,
                   departure_date=departure_date,
                   passengers=passengers,
                   trace_id=trace_id)
        
        try:
            token = await self.get_auth_token(trace_id)
            
            # Convert city names to IATA codes if necessary
            origin_code = self.convert_city_to_iata(origin)
            destination_code = self.convert_city_to_iata(destination)
            
            # Map journey type
            journey_type = "1" if trip_type == "oneway" else "2"
            
            # Map cabin class
            cabin_class_mapping = {
                "economy": "1",
                "premium_economy": "2", 
                "business": "3",
                "first": "4"
            }
            cabin_class = cabin_class_mapping.get(class_type.lower(), "1")
            
            segments = [
                {
                    "Origin": origin_code,
                    "Destination": destination_code,
                    "FlightCabinClass": cabin_class,
                    "PreferredDepartureTime": departure_date + "T00:00:00",
                    "PreferredArrivalTime": departure_date + "T23:59:59"
                }
            ]
            
            # Add return segment for round trip
            if journey_type == "2" and return_date:
                segments.append({
                    "Origin": destination_code,
                    "Destination": origin_code,
                    "FlightCabinClass": cabin_class,
                    "PreferredDepartureTime": return_date + "T00:00:00",
                    "PreferredArrivalTime": return_date + "T23:59:59"
                })
            
            search_payload = {
                "EndUserIp": "192.168.1.1",
                "TokenId": token,
                "AdultCount": passengers,
                "ChildCount": 0,
                "InfantCount": 0,
                "DirectFlight": "false",
                "OneStopFlight": "false",
                "JourneyType": journey_type,
                "PreferredAirlines": None,
                "Segments": segments
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/Search",
                    json=search_payload,
                    headers={
                        "Content-Type": "application/json",
                        "Accept-Encoding": "gzip"
                    }
                )
                
                if response.status_code == 401:
                    # Token expired, refresh and retry
                    logger.warning("Token expired during search, refreshing", trace_id=trace_id)
                    token = await self.get_auth_token(trace_id)
                    search_payload["TokenId"] = token
                    
                    response = await client.post(
                        f"{self.base_url}/Search",
                        json=search_payload,
                        headers={
                            "Content-Type": "application/json", 
                            "Accept-Encoding": "gzip"
                        }
                    )
                
                response.raise_for_status()
                search_data = response.json()
                
                if not search_data.get("Status", {}).get("Success"):
                    error_msg = search_data.get("Status", {}).get("Description", "Search failed")
                    logger.error("TBO flight search failed", 
                                error=error_msg, 
                                trace_id=trace_id)
                    return []
                
                # Process search results
                flights = []
                results = search_data.get("Response", {}).get("Results", [])
                
                logger.info("Processing TBO search results", 
                           result_groups=len(results),
                           trace_id=trace_id)
                
                for result_group in results:
                    for flight_option in result_group:
                        try:
                            processed_flight = self._process_flight_option(
                                flight_option, 
                                origin_code, 
                                destination_code,
                                trace_id
                            )
                            if processed_flight:
                                flights.append(processed_flight)
                                
                        except Exception as e:
                            logger.warning("Error processing flight option", 
                                         error=str(e), 
                                         trace_id=trace_id)
                            continue
                
                logger.info("TBO flight search completed", 
                           flight_count=len(flights),
                           trace_id=trace_id)
                
                return flights
                
        except httpx.TimeoutException:
            logger.error("TBO flight search timeout", trace_id=trace_id)
            return []
        except Exception as e:
            logger.error("TBO flight search error", 
                        error=str(e), 
                        trace_id=trace_id)
            return []

    def _process_flight_option(
        self, 
        option: Dict[str, Any], 
        origin_code: str, 
        destination_code: str,
        trace_id: str
    ) -> Optional[Dict[str, Any]]:
        """Process individual flight option from TBO search results"""
        
        try:
            # Extract flight segments
            segments = option.get("Segments", [[]])[0] if option.get("Segments") else []
            if not segments:
                return None
                
            first_segment = segments[0]
            last_segment = segments[-1]
            
            # Calculate stops
            stops = len(segments) - 1
            
            # Extract airline information
            airline_info = first_segment.get("Airline", {})
            airline_name = airline_info.get("AirlineName", "Unknown")
            airline_code = airline_info.get("AirlineCode", "")
            flight_number = airline_info.get("FlightNumber", "")
            
            # Extract timing information
            origin_info = first_segment.get("Origin", {})
            destination_info = last_segment.get("Destination", {})
            
            departure_time = origin_info.get("DepTime", "")
            arrival_time = destination_info.get("ArrTime", "")
            
            # Format times to HH:MM
            dep_time_formatted = departure_time[:5] if len(departure_time) >= 5 else departure_time
            arr_time_formatted = arrival_time[:5] if len(arrival_time) >= 5 else arrival_time
            
            # Calculate duration
            duration_minutes = 0
            if "Duration" in first_segment:
                duration_minutes = first_segment.get("Duration", 0)
            
            # Extract fare information
            fare = option.get("Fare", {})
            price = fare.get("PublishedFare", 0)
            currency = fare.get("Currency", "INR")
            refundable = fare.get("IsRefundable", False)
            
            # Extract additional information
            is_lcc = option.get("IsLCC", False)
            booking_class = first_segment.get("BookingClass", "")
            aircraft_type = first_segment.get("Equipment", "")
            
            flight_data = {
                "id": option.get("ResultIndex", str(uuid.uuid4())),
                "airline": airline_name,
                "airline_code": airline_code,
                "flight_number": flight_number,
                "origin": origin_code,
                "destination": destination_code,
                "departure_time": dep_time_formatted,
                "arrival_time": arr_time_formatted,
                "duration_minutes": duration_minutes,
                "stops": stops,
                "price": price,
                "currency": currency,
                "baggage_allowance": "15 kg",  # Default, extract from segments if available
                "refundable": refundable,
                "cabin_class": "Economy",  # Map from booking class if needed
                "booking_class": booking_class,
                "aircraft_type": aircraft_type,
                "is_lcc": is_lcc,
                "fare_basis_code": option.get("FareBasisCode", ""),
                "validation_key": option.get("Key", "")
            }
            
            return flight_data
            
        except Exception as e:
            logger.warning("Error processing flight option details", 
                         error=str(e), 
                         trace_id=trace_id)
            return None

# Global service instance
tbo_flight_service = TBOFlightService()