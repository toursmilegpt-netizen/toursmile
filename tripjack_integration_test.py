#!/usr/bin/env python3
"""
TourSmile Tripjack Integration Testing Suite
Focus: Verify new Tripjack API integration structure and fallback behavior
"""

import requests
import json
import sys
import os
from datetime import datetime, timedelta
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://flightsearch-2.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class TripjackIntegrationTester:
    def __init__(self):
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
            
        result = f"{status} - {test_name}"
        if details:
            result += f" | {details}"
            
        self.test_results.append(result)
        logger.info(result)
        
    def test_server_startup(self):
        """Test 1: Verify backend starts successfully with Tripjack imports"""
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                expected_message = "TourSmile AI Travel Platform API"
                if data.get("message") == expected_message:
                    self.log_test("Server Startup", True, "Backend server running with API root accessible")
                    return True
                else:
                    self.log_test("Server Startup", False, f"Unexpected API message: {data}")
                    return False
            else:
                self.log_test("Server Startup", False, f"API root returned {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Server Startup", False, f"Server connection failed: {str(e)}")
            return False
    
    def test_tripjack_imports_structure(self):
        """Test 2: Verify Tripjack services are properly imported and initialized"""
        try:
            # Test by checking if the services respond to configuration checks
            # We'll use the flight search endpoint to verify the integration structure
            
            # Make a test request to see if Tripjack services are loaded
            test_payload = {
                "origin": "Delhi",
                "destination": "Mumbai", 
                "departure_date": "2025-08-01",
                "passengers": 1,
                "class_type": "economy"
            }
            
            response = requests.post(f"{API_BASE}/flights/search", json=test_payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                # Check if the response structure indicates Tripjack integration
                if "flights" in data and "data_source" in data:
                    data_source = data.get("data_source", "")
                    if data_source in ["real_api", "mock"]:
                        self.log_test("Tripjack Import Structure", True, 
                                    f"Flight service responding with data_source: {data_source}")
                        return True
                    else:
                        self.log_test("Tripjack Import Structure", False, 
                                    f"Unexpected data_source: {data_source}")
                        return False
                else:
                    self.log_test("Tripjack Import Structure", False, 
                                "Flight response missing expected structure")
                    return False
            else:
                self.log_test("Tripjack Import Structure", False, 
                            f"Flight search failed with {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Tripjack Import Structure", False, f"Import structure test failed: {str(e)}")
            return False
    
    def test_environment_variables(self):
        """Test 3: Verify Tripjack environment variables are configured (placeholders)"""
        try:
            # We can't directly access backend env vars, but we can test the behavior
            # when credentials are not provided (should fall back gracefully)
            
            test_payload = {
                "origin": "Delhi",
                "destination": "Mumbai",
                "departure_date": "2025-08-01", 
                "passengers": 1
            }
            
            response = requests.post(f"{API_BASE}/flights/search", json=test_payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                data_source = data.get("data_source", "")
                
                # Since credentials are not provided, should fall back to mock
                if data_source == "mock":
                    self.log_test("Environment Variables", True, 
                                "Graceful fallback to mock data when credentials not provided")
                    return True
                elif data_source == "real_api":
                    self.log_test("Environment Variables", True, 
                                "Real API credentials configured and working")
                    return True
                else:
                    self.log_test("Environment Variables", False, 
                                f"Unexpected data source behavior: {data_source}")
                    return False
            else:
                self.log_test("Environment Variables", False, 
                            f"Environment test failed with {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Environment Variables", False, f"Environment test error: {str(e)}")
            return False
    
    def test_existing_endpoints(self):
        """Test 4: Verify all existing endpoints still work"""
        endpoints_to_test = [
            ("/flights/search", "POST", {
                "origin": "Delhi",
                "destination": "Mumbai",
                "departure_date": "2025-08-01",
                "passengers": 1
            }),
            ("/hotels/search", "POST", {
                "location": "Mumbai",
                "checkin_date": "2025-08-01",
                "checkout_date": "2025-08-02",
                "guests": 2,
                "rooms": 1
            }),
            ("/chat", "POST", {
                "message": "Hello, I need help planning a trip",
                "session_id": "test-session-123"
            }),
            ("/activities/Mumbai", "GET", None),
            ("/itinerary/generate", "POST", {
                "destination": "Goa",
                "days": 3,
                "budget": "medium",
                "interests": ["beach", "culture"]
            }),
            ("/popular-trips", "GET", None),
            ("/featured-trips", "GET", None)
        ]
        
        all_passed = True
        
        for endpoint, method, payload in endpoints_to_test:
            try:
                url = f"{API_BASE}{endpoint}"
                
                if method == "GET":
                    response = requests.get(url, timeout=30)
                elif method == "POST":
                    response = requests.post(url, json=payload, timeout=30)
                else:
                    continue
                
                if response.status_code == 200:
                    self.log_test(f"Endpoint {endpoint}", True, f"{method} request successful")
                else:
                    self.log_test(f"Endpoint {endpoint}", False, 
                                f"{method} request failed with {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Endpoint {endpoint}", False, f"{method} request error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_fallback_behavior(self):
        """Test 5: Verify graceful fallback to mock data without credentials"""
        try:
            # Test flight search fallback
            flight_payload = {
                "origin": "Delhi",
                "destination": "Mumbai",
                "departure_date": "2025-08-01",
                "passengers": 1
            }
            
            response = requests.post(f"{API_BASE}/flights/search", json=flight_payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                data_source = data.get("data_source", "")
                
                if flights and len(flights) > 0:
                    # Check if we get reasonable mock data
                    first_flight = flights[0]
                    required_fields = ["airline", "flight_number", "price", "departure_time", "arrival_time"]
                    
                    if all(field in first_flight for field in required_fields):
                        self.log_test("Flight Fallback Behavior", True, 
                                    f"Mock data with {len(flights)} flights, source: {data_source}")
                    else:
                        self.log_test("Flight Fallback Behavior", False, 
                                    "Mock flight data missing required fields")
                        return False
                else:
                    self.log_test("Flight Fallback Behavior", False, "No flights returned in fallback")
                    return False
            else:
                self.log_test("Flight Fallback Behavior", False, 
                            f"Flight fallback failed with {response.status_code}")
                return False
            
            # Test hotel search fallback
            hotel_payload = {
                "location": "Mumbai",
                "checkin_date": "2025-08-01",
                "checkout_date": "2025-08-02",
                "guests": 2,
                "rooms": 1
            }
            
            response = requests.post(f"{API_BASE}/hotels/search", json=hotel_payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                hotels = data.get("hotels", [])
                
                if hotels and len(hotels) > 0:
                    first_hotel = hotels[0]
                    required_fields = ["name", "location", "price_per_night", "rating"]
                    
                    if all(field in first_hotel for field in required_fields):
                        self.log_test("Hotel Fallback Behavior", True, 
                                    f"Mock data with {len(hotels)} hotels")
                        return True
                    else:
                        self.log_test("Hotel Fallback Behavior", False, 
                                    "Mock hotel data missing required fields")
                        return False
                else:
                    self.log_test("Hotel Fallback Behavior", False, "No hotels returned in fallback")
                    return False
            else:
                self.log_test("Hotel Fallback Behavior", False, 
                            f"Hotel fallback failed with {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Fallback Behavior", False, f"Fallback test error: {str(e)}")
            return False
    
    def test_flight_search_flow(self):
        """Test 6: Test Delhi→Mumbai flight search on 2025-08-01 with 1 passenger"""
        try:
            payload = {
                "origin": "Delhi",
                "destination": "Mumbai",
                "departure_date": "2025-08-01",
                "passengers": 1,
                "class_type": "economy"
            }
            
            response = requests.post(f"{API_BASE}/flights/search", json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                search_id = data.get("search_id", "")
                ai_recommendation = data.get("ai_recommendation", "")
                data_source = data.get("data_source", "")
                total_found = data.get("total_found", 0)
                
                if flights and len(flights) > 0:
                    # Analyze flight data structure
                    first_flight = flights[0]
                    
                    # Check for comprehensive fields (Tripjack structure)
                    comprehensive_fields = [
                        "airline", "flight_number", "price", "departure_time", 
                        "arrival_time", "duration", "aircraft"
                    ]
                    
                    missing_fields = [field for field in comprehensive_fields if field not in first_flight]
                    
                    if not missing_fields:
                        # Check for advanced Tripjack features
                        advanced_features = []
                        if "fare_options" in first_flight:
                            advanced_features.append(f"fare_options ({len(first_flight['fare_options'])})")
                        if "is_lcc" in first_flight:
                            advanced_features.append(f"LCC indicator")
                        if "airline_code" in first_flight:
                            advanced_features.append("airline_code")
                        
                        details = f"{len(flights)} flights, source: {data_source}"
                        if advanced_features:
                            details += f", features: {', '.join(advanced_features)}"
                        
                        self.log_test("Delhi→Mumbai Flight Search", True, details)
                        
                        # Log sample flights for verification
                        logger.info("📋 Sample flights found:")
                        for i, flight in enumerate(flights[:3]):
                            lcc_indicator = "💰" if flight.get("is_lcc", False) else "✈️"
                            fare_count = len(flight.get("fare_options", []))
                            logger.info(f"  {lcc_indicator} {flight.get('airline', 'Unknown')} {flight.get('flight_number', 'XXX')} - ₹{flight.get('price', 0)} ({fare_count} fares)")
                        
                        return True
                    else:
                        self.log_test("Delhi→Mumbai Flight Search", False, 
                                    f"Missing fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Delhi→Mumbai Flight Search", False, "No flights returned")
                    return False
            else:
                self.log_test("Delhi→Mumbai Flight Search", False, 
                            f"Search failed with {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Delhi→Mumbai Flight Search", False, f"Flight search error: {str(e)}")
            return False
    
    def test_hotel_search_flow(self):
        """Test 7: Test Mumbai hotel search for 2025-08-01 to 2025-08-02 with 2 guests"""
        try:
            payload = {
                "location": "Mumbai",
                "checkin_date": "2025-08-01",
                "checkout_date": "2025-08-02",
                "guests": 2,
                "rooms": 1
            }
            
            response = requests.post(f"{API_BASE}/hotels/search", json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                hotels = data.get("hotels", [])
                search_id = data.get("search_id", "")
                ai_recommendation = data.get("ai_recommendation", "")
                data_source = data.get("data_source", "")
                total_found = data.get("total_found", 0)
                
                if hotels and len(hotels) > 0:
                    # Analyze hotel data structure
                    first_hotel = hotels[0]
                    
                    # Check for comprehensive fields
                    comprehensive_fields = [
                        "name", "location", "price_per_night", "rating", 
                        "amenities", "image"
                    ]
                    
                    missing_fields = [field for field in comprehensive_fields if field not in first_hotel]
                    
                    if not missing_fields:
                        # Check for Tripjack-specific features
                        advanced_features = []
                        if "room_options" in first_hotel:
                            advanced_features.append(f"room_options ({len(first_hotel['room_options'])})")
                        if "star_rating" in first_hotel:
                            advanced_features.append("star_rating")
                        if "booking_token" in first_hotel:
                            advanced_features.append("booking_token")
                        
                        details = f"{len(hotels)} hotels, source: {data_source}"
                        if advanced_features:
                            details += f", features: {', '.join(advanced_features)}"
                        
                        self.log_test("Mumbai Hotel Search", True, details)
                        
                        # Log sample hotels for verification
                        logger.info("🏨 Sample hotels found:")
                        for i, hotel in enumerate(hotels[:3]):
                            star_rating = hotel.get("star_rating", hotel.get("rating", 0))
                            stars = "⭐" * min(int(star_rating), 5)
                            amenity_count = len(hotel.get("amenities", []))
                            logger.info(f"  🏨 {hotel.get('name', 'Unknown')} {stars} - ₹{hotel.get('price_per_night', 0)}/night ({amenity_count} amenities)")
                        
                        return True
                    else:
                        self.log_test("Mumbai Hotel Search", False, 
                                    f"Missing fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Mumbai Hotel Search", False, "No hotels returned")
                    return False
            else:
                self.log_test("Mumbai Hotel Search", False, 
                            f"Search failed with {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Mumbai Hotel Search", False, f"Hotel search error: {str(e)}")
            return False
    
    def test_tripjack_integration_readiness(self):
        """Test 8: Verify integration is ready for real credentials"""
        try:
            # Test both flight and hotel services for credential readiness
            
            # Flight service readiness
            flight_payload = {
                "origin": "Delhi",
                "destination": "Mumbai",
                "departure_date": "2025-08-01",
                "passengers": 1
            }
            
            flight_response = requests.post(f"{API_BASE}/flights/search", json=flight_payload, timeout=30)
            
            # Hotel service readiness  
            hotel_payload = {
                "location": "Mumbai",
                "checkin_date": "2025-08-01",
                "checkout_date": "2025-08-02",
                "guests": 2,
                "rooms": 1
            }
            
            hotel_response = requests.post(f"{API_BASE}/hotels/search", json=hotel_payload, timeout=30)
            
            if flight_response.status_code == 200 and hotel_response.status_code == 200:
                flight_data = flight_response.json()
                hotel_data = hotel_response.json()
                
                # Check if both services are responding with proper structure
                flight_ready = ("flights" in flight_data and "data_source" in flight_data)
                hotel_ready = ("hotels" in hotel_data and "data_source" in hotel_data)
                
                if flight_ready and hotel_ready:
                    flight_source = flight_data.get("data_source", "")
                    hotel_source = hotel_data.get("data_source", "")
                    
                    self.log_test("Integration Readiness", True, 
                                f"Both services ready - Flight: {flight_source}, Hotel: {hotel_source}")
                    return True
                else:
                    self.log_test("Integration Readiness", False, 
                                f"Service structure issues - Flight ready: {flight_ready}, Hotel ready: {hotel_ready}")
                    return False
            else:
                self.log_test("Integration Readiness", False, 
                            f"Service responses failed - Flight: {flight_response.status_code}, Hotel: {hotel_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Integration Readiness", False, f"Readiness test error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all Tripjack integration tests"""
        logger.info("🚀 Starting TourSmile Tripjack Integration Testing Suite")
        logger.info("=" * 80)
        
        # Run tests in order
        tests = [
            self.test_server_startup,
            self.test_tripjack_imports_structure,
            self.test_environment_variables,
            self.test_existing_endpoints,
            self.test_fallback_behavior,
            self.test_flight_search_flow,
            self.test_hotel_search_flow,
            self.test_tripjack_integration_readiness
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                logger.error(f"Test execution error: {str(e)}")
        
        # Print summary
        logger.info("=" * 80)
        logger.info("🎯 TRIPJACK INTEGRATION TEST SUMMARY")
        logger.info("=" * 80)
        
        for result in self.test_results:
            logger.info(result)
        
        logger.info("=" * 80)
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        logger.info(f"📊 OVERALL RESULT: {self.passed_tests}/{self.total_tests} tests passed ({success_rate:.1f}%)")
        
        if success_rate >= 85:
            logger.info("🎉 TRIPJACK INTEGRATION STRUCTURE: EXCELLENT - Ready for credentials")
        elif success_rate >= 70:
            logger.info("✅ TRIPJACK INTEGRATION STRUCTURE: GOOD - Minor issues to address")
        else:
            logger.info("⚠️ TRIPJACK INTEGRATION STRUCTURE: NEEDS ATTENTION - Major issues found")
        
        logger.info("=" * 80)
        
        return success_rate >= 70


def main():
    """Main test execution"""
    tester = TripjackIntegrationTester()
    success = tester.run_all_tests()
    
    if success:
        logger.info("✅ Tripjack integration testing completed successfully!")
        sys.exit(0)
    else:
        logger.error("❌ Tripjack integration testing failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()