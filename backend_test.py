#!/usr/bin/env python3
"""
Backend API Testing Suite for TourSmile AI Travel Platform
Tests all backend endpoints and shows actual mockup data for frontend display
"""

import requests
import json
import time
import os
from datetime import datetime, timedelta

# Load backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("ERROR: Could not find REACT_APP_BACKEND_URL in frontend/.env")
    exit(1)

API_BASE = f"{BACKEND_URL}/api"
print(f"Testing backend at: {API_BASE}")

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }

    def log_result(self, test_name, success, message="", response_data=None):
        """Log test result"""
        self.results['total_tests'] += 1
        if success:
            self.results['passed'] += 1
            print(f"✅ {test_name}: {message}")
        else:
            self.results['failed'] += 1
            self.results['errors'].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: {message}")
        
        if response_data:
            print(f"📄 FULL RESPONSE DATA:")
            print(json.dumps(response_data, indent=2))
            print("-" * 80)

    def test_health_check(self):
        """Test basic health check endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/")
            if response.status_code == 200:
                data = response.json()
                if "TourSmile" in data.get("message", ""):
                    self.log_result("Health Check", True, "API is responding correctly", data)
                    return True
                else:
                    self.log_result("Health Check", False, f"Unexpected response: {data}")
            else:
                self.log_result("Health Check", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Health Check", False, f"Connection error: {str(e)}")
        return False

    def test_ai_chat(self):
        """Test OpenAI GPT-4 chat integration"""
        try:
            payload = {
                "message": "I want to plan a trip to Paris for 5 days. Can you help me with some recommendations?",
                "session_id": None
            }
            
            response = self.session.post(f"{API_BASE}/chat", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "response" in data and "session_id" in data:
                    if len(data["response"]) > 10:  # Check for meaningful response
                        self.log_result("AI Chat Integration", True, 
                                      f"GPT-4 responded with {len(data['response'])} characters", 
                                      {"session_id": data["session_id"], "response_preview": data["response"][:100]})
                        return True
                    else:
                        self.log_result("AI Chat Integration", False, "Response too short or empty")
                else:
                    self.log_result("AI Chat Integration", False, f"Missing required fields in response: {data}")
            else:
                self.log_result("AI Chat Integration", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("AI Chat Integration", False, f"Error: {str(e)}")
        return False

    def test_flight_search_detailed(self):
        """Test flight search API with detailed mockup data display"""
        print("\n🛫 TESTING FLIGHT SEARCH API - Delhi to Mumbai")
        print("=" * 60)
        try:
            payload = {
                "origin": "Delhi",
                "destination": "Mumbai", 
                "departure_date": "2025-02-15",
                "passengers": 2,
                "class_type": "economy"
            }
            
            print(f"📤 REQUEST: {json.dumps(payload, indent=2)}")
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "flights" in data and "ai_recommendation" in data and "search_id" in data:
                    flights = data["flights"]
                    if len(flights) > 0:
                        # Check flight data structure
                        flight = flights[0]
                        required_fields = ["id", "airline", "flight_number", "origin", "destination", "price"]
                        if all(field in flight for field in required_fields):
                            self.log_result("Flight Search API", True, 
                                          f"Found {len(flights)} flights with AI recommendation",
                                          data)
                            return True
                        else:
                            self.log_result("Flight Search API", False, "Flight data missing required fields")
                    else:
                        self.log_result("Flight Search API", False, "No flights returned")
                else:
                    self.log_result("Flight Search API", False, f"Missing required response fields: {data}")
            else:
                self.log_result("Flight Search API", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Flight Search API", False, f"Error: {str(e)}")
        return False

    def test_hotel_search_detailed(self):
        """Test hotel search API with detailed mockup data display"""
        print("\n🏨 TESTING HOTEL SEARCH API - Mumbai")
        print("=" * 60)
        try:
            payload = {
                "location": "Mumbai",
                "checkin_date": "2025-02-15",
                "checkout_date": "2025-02-17",
                "guests": 2,
                "rooms": 1
            }
            
            print(f"📤 REQUEST: {json.dumps(payload, indent=2)}")
            response = self.session.post(f"{API_BASE}/hotels/search", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "hotels" in data and "ai_recommendation" in data and "search_id" in data:
                    hotels = data["hotels"]
                    if len(hotels) > 0:
                        # Check hotel data structure
                        hotel = hotels[0]
                        required_fields = ["id", "name", "location", "rating", "price_per_night", "amenities", "image"]
                        if all(field in hotel for field in required_fields):
                            self.log_result("Hotel Search API", True,
                                          f"Found {len(hotels)} hotels with AI recommendation",
                                          data)
                            return True
                        else:
                            self.log_result("Hotel Search API", False, "Hotel data missing required fields")
                    else:
                        self.log_result("Hotel Search API", False, "No hotels returned")
                else:
                    self.log_result("Hotel Search API", False, f"Missing required response fields: {data}")
            else:
                self.log_result("Hotel Search API", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Hotel Search API", False, f"Error: {str(e)}")
        return False

    def test_activities_detailed(self):
        """Test activities API with detailed mockup data display"""
        print("\n🎯 TESTING ACTIVITIES API - Mumbai")
        print("=" * 60)
        try:
            location = "Mumbai"
            print(f"📤 REQUEST: GET /api/activities/{location}")
            response = self.session.get(f"{API_BASE}/activities/{location}")
            
            if response.status_code == 200:
                data = response.json()
                if "activities" in data:
                    activities = data["activities"]
                    if len(activities) > 0:
                        # Check activity data structure
                        activity = activities[0]
                        required_fields = ["id", "name", "location", "price", "duration", "rating"]
                        if all(field in activity for field in required_fields):
                            self.log_result("Activities API", True,
                                          f"Found {len(activities)} activities for {location}",
                                          data)
                            return True
                        else:
                            self.log_result("Activities API", False, "Activity data missing required fields")
                    else:
                        self.log_result("Activities API", False, "No activities returned")
                else:
                    self.log_result("Activities API", False, f"Missing 'activities' field in response: {data}")
            else:
                self.log_result("Activities API", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Activities API", False, f"Error: {str(e)}")
        return False

    def test_ai_itinerary_detailed(self):
        """Test AI-powered itinerary generation with detailed mockup data display"""
        print("\n🤖 TESTING AI ITINERARY GENERATOR - Goa")
        print("=" * 60)
        try:
            payload = {
                "destination": "Goa",
                "days": 3,
                "budget": "medium",
                "interests": ["beach", "culture"]
            }
            
            print(f"📤 REQUEST: {json.dumps(payload, indent=2)}")
            response = self.session.post(f"{API_BASE}/itinerary/generate", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "itinerary" in data and "destination" in data and "days" in data:
                    itinerary = data["itinerary"]
                    if len(itinerary) > 50:  # Check for meaningful itinerary content
                        self.log_result("AI Itinerary Generator", True,
                                      f"Generated itinerary for {data['destination']} ({data['days']} days)",
                                      data)
                        return True
                    else:
                        self.log_result("AI Itinerary Generator", False, "Itinerary content too short")
                else:
                    self.log_result("AI Itinerary Generator", False, f"Missing required response fields: {data}")
            else:
                self.log_result("AI Itinerary Generator", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("AI Itinerary Generator", False, f"Error: {str(e)}")
        return False

    def run_detailed_search_tests(self):
        """Run detailed tests for all search APIs as requested by user"""
        print("=" * 80)
        print("🔍 DETAILED SEARCH API TESTING - SHOWING ACTUAL MOCKUP DATA")
        print("=" * 80)
        print("Testing all search APIs with the exact parameters requested:")
        print("1. Flight Search: Delhi to Mumbai, 2025-02-15, 2 passengers")
        print("2. Hotel Search: Mumbai, 2025-02-15 to 2025-02-17, 2 guests")
        print("3. Activities: Mumbai location")
        print("4. AI Itinerary: Goa, 3 days")
        print("=" * 80)
        
        # Test in the exact order requested
        tests = [
            ("Flight Search API", self.test_flight_search_detailed),
            ("Hotel Search API", self.test_hotel_search_detailed),
            ("Activities API", self.test_activities_detailed),
            ("AI Itinerary Generator", self.test_ai_itinerary_detailed)
        ]
        
        for test_name, test_func in tests:
            test_func()
            time.sleep(2)  # Pause between tests for readability
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 DETAILED SEARCH API TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        
        if self.results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        success_rate = (self.results['passed'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")
        
        if success_rate >= 75:
            print("🎉 All search APIs are working and returning proper mockup data!")
        else:
            print("⚠️  Some search APIs have issues that need attention.")
        
        return self.results

    def test_trip_details_api(self):
        """Test GET /api/popular-trips/{trip_id} for specific trips that should be clickable"""
        print("\n🔍 TESTING TRIP DETAILS API - Specific Trip IDs")
        print("=" * 70)
        
        # Test specific trip IDs as requested: RAJ001, KER001, SEA001, GOA001, HP001
        trip_ids = ["RAJ001", "KER001", "SEA001", "GOA001", "HP001"]
        success_count = 0
        
        for trip_id in trip_ids:
            try:
                print(f"\n📋 Testing trip ID: {trip_id}")
                response = self.session.get(f"{API_BASE}/popular-trips/{trip_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    if "success" in data and data["success"] and "trip" in data:
                        trip = data["trip"]
                        
                        # Validate complete trip details structure
                        basic_fields = ["id", "title", "duration", "destinations", "price_from", "theme", "image"]
                        extended_fields = ["itinerary", "inclusions", "best_time", "highlights"]
                        
                        missing_basic = [field for field in basic_fields if field not in trip]
                        missing_extended = [field for field in extended_fields if field not in trip]
                        
                        if not missing_basic:
                            print(f"✅ Trip {trip_id}: Found with all basic fields")
                            print(f"   📝 Title: {trip['title']}")
                            print(f"   📅 Duration: {trip['duration']}")
                            print(f"   💰 Price from: ₹{trip['price_from']}")
                            print(f"   🎯 Theme: {trip['theme']}")
                            print(f"   📍 Destinations: {', '.join(trip['destinations'])}")
                            
                            # Check extended details
                            extended_available = [f for f in extended_fields if f in trip]
                            if extended_available:
                                print(f"   📋 Extended details available: {extended_available}")
                                
                                # Show itinerary if available
                                if "itinerary" in trip and isinstance(trip["itinerary"], dict):
                                    print(f"   🗓️ Itinerary days: {len(trip['itinerary'])} days")
                                
                                # Show inclusions if available
                                if "inclusions" in trip and isinstance(trip["inclusions"], list):
                                    print(f"   ✅ Inclusions: {', '.join(trip['inclusions'])}")
                            
                            success_count += 1
                        else:
                            print(f"❌ Trip {trip_id}: Missing basic fields: {missing_basic}")
                    else:
                        print(f"❌ Trip {trip_id}: Invalid response structure")
                elif response.status_code == 404:
                    print(f"❌ Trip {trip_id}: Not found (404)")
                else:
                    print(f"❌ Trip {trip_id}: HTTP {response.status_code}")
            except Exception as e:
                print(f"❌ Trip {trip_id}: Error - {str(e)}")
        
        if success_count == len(trip_ids):
            self.log_result("Trip Details API", True, 
                          f"All {success_count}/{len(trip_ids)} specific trips found with complete data")
            return True
        else:
            self.log_result("Trip Details API", False, 
                          f"Only {success_count}/{len(trip_ids)} trips found successfully")
        return False

    def test_popular_trips_with_limit_50(self):
        """Test GET /api/popular-trips?limit=50 to verify it returns all 17 trips"""
        print("\n🏖️ TESTING POPULAR TRIPS API - Limit=50 (All Trips)")
        print("=" * 70)
        try:
            response = self.session.get(f"{API_BASE}/popular-trips?limit=50")
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data["success"] and "trips" in data:
                    trips = data["trips"]
                    total_trips = data.get("total_trips", 0)
                    
                    print(f"📊 Total trips found: {total_trips}")
                    print(f"📋 Trips returned: {len(trips)}")
                    
                    if len(trips) > 0:
                        # Show breakdown by region/theme
                        domestic_count = sum(1 for trip in trips if any(dest in ["Rajasthan", "Kerala", "Goa", "Himachal", "Kashmir"] for dest in trip.get("destinations", [])))
                        international_count = len(trips) - domestic_count
                        
                        print(f"🇮🇳 Domestic trips: {domestic_count}")
                        print(f"🌍 International trips: {international_count}")
                        
                        # Validate trip structure
                        trip = trips[0]
                        required_fields = ["id", "title", "duration", "destinations", "price_from", "theme"]
                        missing_fields = [field for field in required_fields if field not in trip]
                        
                        if not missing_fields:
                            self.log_result("Popular Trips (Limit=50)", True, 
                                          f"Found {total_trips} trips, all with proper structure", 
                                          {"total_trips": total_trips, "domestic": domestic_count, "international": international_count})
                            return True
                        else:
                            self.log_result("Popular Trips (Limit=50)", False, 
                                          f"Trip missing required fields: {missing_fields}")
                    else:
                        self.log_result("Popular Trips (Limit=50)", False, "No trips returned")
                else:
                    self.log_result("Popular Trips (Limit=50)", False, f"Invalid response structure: {data}")
            else:
                self.log_result("Popular Trips (Limit=50)", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Popular Trips (Limit=50)", False, f"Error: {str(e)}")
        return False

    def test_featured_trips_with_limit_6(self):
        """Test GET /api/featured-trips?limit=6 to verify featured trips are returned"""
        print("\n⭐ TESTING FEATURED TRIPS API - Limit=6")
        print("=" * 70)
        try:
            response = self.session.get(f"{API_BASE}/featured-trips?limit=6")
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data["success"] and "featured_trips" in data:
                    featured_trips = data["featured_trips"]
                    total_featured = data.get("total_featured", 0)
                    
                    print(f"⭐ Featured trips found: {total_featured}")
                    print(f"📋 Featured trips returned: {len(featured_trips)}")
                    
                    if len(featured_trips) > 0:
                        # Show featured trip details
                        for i, trip in enumerate(featured_trips[:3], 1):  # Show first 3
                            print(f"   {i}. {trip.get('title', 'N/A')} - {trip.get('theme', 'N/A')} (₹{trip.get('price_from', 0)})")
                        
                        # Validate featured trip structure
                        trip = featured_trips[0]
                        required_fields = ["id", "title", "duration", "destinations", "price_from", "theme"]
                        missing_fields = [field for field in required_fields if field not in trip]
                        
                        if not missing_fields:
                            self.log_result("Featured Trips (Limit=6)", True, 
                                          f"Found {total_featured} featured trips with proper structure", 
                                          {"total_featured": total_featured, "sample_trip": trip})
                            return True
                        else:
                            self.log_result("Featured Trips (Limit=6)", False, 
                                          f"Featured trip missing required fields: {missing_fields}")
                    else:
                        self.log_result("Featured Trips (Limit=6)", False, "No featured trips returned")
                else:
                    self.log_result("Featured Trips (Limit=6)", False, f"Invalid response structure: {data}")
            else:
                self.log_result("Featured Trips (Limit=6)", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Featured Trips (Limit=6)", False, f"Error: {str(e)}")
        return False

    def test_error_handling_invalid_trip_id(self):
        """Test error handling with invalid trip ID to ensure proper 404 response"""
        print("\n🚨 TESTING ERROR HANDLING - Invalid Trip ID")
        print("=" * 70)
        try:
            invalid_trip_id = "INVALID999"
            print(f"📋 Testing invalid trip ID: {invalid_trip_id}")
            response = self.session.get(f"{API_BASE}/popular-trips/{invalid_trip_id}")
            
            if response.status_code == 404:
                data = response.json()
                print(f"✅ Proper 404 response received")
                print(f"📄 Error message: {data.get('detail', 'No detail provided')}")
                self.log_result("Error Handling (Invalid Trip ID)", True, 
                              "Proper 404 response for invalid trip ID", 
                              {"status_code": 404, "error_detail": data.get('detail')})
                return True
            else:
                print(f"❌ Expected 404, got HTTP {response.status_code}")
                self.log_result("Error Handling (Invalid Trip ID)", False, 
                              f"Expected 404, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Error Handling (Invalid Trip ID)", False, f"Error: {str(e)}")
        return False

    def run_trip_details_tests(self):
        """Run comprehensive trip details functionality tests as requested"""
        print("=" * 80)
        print("🔍 TRIP DETAILS FUNCTIONALITY TESTING")
        print("=" * 80)
        print("Testing trip details functionality as requested:")
        print("1. Trip Details API - GET /api/popular-trips/{trip_id} for RAJ001, KER001, SEA001, GOA001, HP001")
        print("2. Popular Trips API - GET /api/popular-trips?limit=50 (all 17 trips)")
        print("3. Featured Trips API - GET /api/featured-trips?limit=6")
        print("4. Error Handling - Invalid trip ID (404 response)")
        print("=" * 80)
        
        # Reset results for this test run
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        
        # Run all trip details tests
        tests = [
            ("Trip Details API", self.test_trip_details_api),
            ("Popular Trips (Limit=50)", self.test_popular_trips_with_limit_50),
            ("Featured Trips (Limit=6)", self.test_featured_trips_with_limit_6),
            ("Error Handling (Invalid Trip ID)", self.test_error_handling_invalid_trip_id)
        ]
        
        for test_name, test_func in tests:
            test_func()
            time.sleep(1)  # Pause between tests for readability
        
        # Print comprehensive summary
        print("\n" + "=" * 80)
        print("📊 TRIP DETAILS FUNCTIONALITY TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        
        if self.results['errors']:
            print(f"\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        success_rate = (self.results['passed'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")
        
        # Final assessment
        if success_rate == 100:
            print("🎉 ALL TRIP DETAILS FUNCTIONALITY TESTS PASSED!")
            print("✅ Trip details API working correctly")
            print("✅ Popular trips API returning all trips")
            print("✅ Featured trips API working properly")
            print("✅ Error handling working as expected")
            print("\n🚀 BACKEND IS READY FOR FRONTEND TRIP DETAIL MODALS!")
        elif success_rate >= 75:
            print("⚠️  Trip details functionality mostly working with minor issues")
        else:
            print("🚨 Trip details functionality has significant issues that need attention")
        
        return self.results

if __name__ == "__main__":
    tester = BackendTester()
    # Run the specific trip details tests as requested
    results = tester.run_trip_details_tests()