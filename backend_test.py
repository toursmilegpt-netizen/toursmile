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

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("🚀 Starting TourSmile Backend API Tests")
        print("=" * 60)
        
        # Test in order of priority
        tests = [
            ("Health Check", self.test_health_check),
            ("OpenAI GPT-4 Integration", self.test_ai_chat),
            ("Flight Search API", self.test_flight_search),
            ("Hotel Search API", self.test_hotel_search),
            ("Activities API", self.test_activities_api),
            ("AI Itinerary Generator", self.test_ai_itinerary_generator)
        ]
        
        for test_name, test_func in tests:
            print(f"\n🔍 Testing {test_name}...")
            test_func()
            time.sleep(1)  # Brief pause between tests
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        
        if self.results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        success_rate = (self.results['passed'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 Backend testing completed successfully!")
        else:
            print("⚠️  Backend has critical issues that need attention.")
        
        return self.results

if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_all_tests()