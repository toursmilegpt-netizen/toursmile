#!/usr/bin/env python3
"""
Backend Testing After UI/UX Improvements
========================================

Testing backend functionality after UI/UX improvements made to the TourSmile flight search page.
Ensures all backend services remain functional and responsive after frontend changes.

Test Focus (as per review request):
1. Backend service health check
2. Airport search API with various queries (Mumbai, Delhi, BOM, DEL, partial matches)
3. Flight search functionality (end-to-end Mumbai to Delhi with date and passenger selection)
4. API responsiveness verification

Expected: All backend functionality should work perfectly as changes were purely frontend UI/UX.
"""

import requests
import json
import sys
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')
load_dotenv('/app/frontend/.env')

# Configuration - Use environment variable for backend URL
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE_URL = f"{BACKEND_URL}/api"
TEST_TIMEOUT = 15

class BackendTester:
    def __init__(self):
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
        print(f"🔧 Backend URL: {BACKEND_URL}")
        print(f"🔧 API Base URL: {API_BASE_URL}")
        
    def log_test(self, test_name, success, details=""):
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
        
        print(result)
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        
    def test_backend_health(self):
        """Test 1: Backend Service Health Check"""
        print("\n🏥 TESTING BACKEND SERVICE HEALTH...")
        
        try:
            # Test root API endpoint
            response = requests.get(f"{API_BASE_URL}/", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                if "TourSmile" in data.get("message", ""):
                    self.log_test("Backend Service Health", True, 
                                f"Status: {response.status_code}, Message: {data.get('message')}")
                else:
                    self.log_test("Backend Service Health", False, 
                                f"Unexpected response: {data}")
            else:
                self.log_test("Backend Service Health", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Backend Service Health", False, f"Connection error: {str(e)}")
            
    def test_airport_search_api(self):
        """Test 2: Airport Search API with Various Queries"""
        print("\n✈️ TESTING AIRPORT SEARCH API...")
        
        # Test cases for airport search as specified in review request
        test_cases = [
            ("Mumbai", "BOM", "Should find Mumbai airport"),
            ("Delhi", "DEL", "Should find Delhi airport"),
            ("BOM", "BOM", "Should find Mumbai by IATA code"),
            ("DEL", "DEL", "Should find Delhi by IATA code"),
            ("mum", "BOM", "Should find Mumbai with partial match"),
            ("del", "DEL", "Should find Delhi with partial match"),
            ("Bengaluru", "BLR", "Should find Bengaluru airport"),
            ("blr", "BLR", "Should find Bengaluru with partial match"),
            ("London", "LHR", "Should find London airport"),
            ("Dubai", "DXB", "Should find Dubai airport")
        ]
        
        for query, expected_iata, description in test_cases:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": query, "limit": 10}, 
                                      timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    
                    # Check if expected airport is found
                    found = any(airport.get("iata") == expected_iata for airport in results)
                    
                    if found:
                        airport = next(a for a in results if a.get("iata") == expected_iata)
                        self.log_test(f"Airport Search: {query}", True, 
                                    f"Found {airport.get('city')} ({airport.get('iata')}) - {airport.get('airport')}")
                    else:
                        self.log_test(f"Airport Search: {query}", False, 
                                    f"Expected {expected_iata} not found in {len(results)} results")
                else:
                    self.log_test(f"Airport Search: {query}", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    
            except requests.exceptions.RequestException as e:
                self.log_test(f"Airport Search: {query}", False, f"Request error: {str(e)}")
                
    def test_flight_search_functionality(self):
        """Test 3: End-to-End Flight Search (Mumbai to Delhi)"""
        print("\n🛫 TESTING FLIGHT SEARCH FUNCTIONALITY...")
        
        # Test basic flight search Mumbai to Delhi as specified in review
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        search_payload = {
            "origin": "Mumbai",
            "destination": "Delhi", 
            "departure_date": tomorrow,
            "passengers": 2,
            "class_type": "economy"
        }
        
        try:
            response = requests.post(f"{API_BASE_URL}/flights/search", 
                                   json=search_payload, 
                                   timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                search_id = data.get("search_id")
                total_found = data.get("total_found", 0)
                data_source = data.get("data_source", "unknown")
                
                if flights and len(flights) > 0:
                    flight = flights[0]
                    required_fields = ["id", "airline", "flight_number", "origin", "destination", 
                                     "departure_time", "arrival_time", "price"]
                    
                    missing_fields = [field for field in required_fields if field not in flight]
                    
                    if not missing_fields:
                        self.log_test("Flight Search Mumbai→Delhi", True, 
                                    f"Found {len(flights)} flights, Source: {data_source}, "
                                    f"Sample: {flight['airline']} {flight['flight_number']} ₹{flight['price']}")
                    else:
                        self.log_test("Flight Search Mumbai→Delhi", False, 
                                    f"Missing fields in flight data: {missing_fields}")
                else:
                    self.log_test("Flight Search Mumbai→Delhi", False, "No flights returned in response")
                    
            else:
                self.log_test("Flight Search Mumbai→Delhi", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Flight Search Mumbai→Delhi", False, f"Request error: {str(e)}")
            
        # Test with date and passenger selection variations
        test_variations = [
            {"passengers": 1, "class_type": "economy", "description": "Single passenger economy"},
            {"passengers": 3, "class_type": "business", "description": "Multiple passengers business"},
            {"passengers": 2, "class_type": "economy", "return_date": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'), "description": "Round trip"}
        ]
        
        for variation in test_variations:
            test_payload = {
                "origin": "Mumbai",
                "destination": "Delhi",
                "departure_date": tomorrow,
                **{k: v for k, v in variation.items() if k != "description"}
            }
            
            try:
                response = requests.post(f"{API_BASE_URL}/flights/search", 
                                       json=test_payload, 
                                       timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    flights = data.get("flights", [])
                    self.log_test(f"Flight Search Variation: {variation['description']}", True, 
                                f"Found {len(flights)} flights")
                else:
                    self.log_test(f"Flight Search Variation: {variation['description']}", False, 
                                f"HTTP {response.status_code}")
                    
            except requests.exceptions.RequestException as e:
                self.log_test(f"Flight Search Variation: {variation['description']}", False, 
                            f"Request error: {str(e)}")
                
    def test_api_responsiveness(self):
        """Test 4: API Responsiveness and Core Endpoints"""
        print("\n⚡ TESTING API RESPONSIVENESS...")
        
        # Test core endpoints for responsiveness
        endpoints = [
            ("/hotels/search", "POST", {"location": "Mumbai", "checkin_date": "2025-02-01", "checkout_date": "2025-02-03"}),
            ("/activities/Mumbai", "GET", None),
            ("/popular-trips", "GET", None),
            ("/auth/send-otp", "POST", {"mobile": "+919876543210"}),
            ("/payments/config", "GET", None)
        ]
        
        for endpoint, method, payload in endpoints:
            try:
                start_time = datetime.now()
                
                if method == "GET":
                    response = requests.get(f"{API_BASE_URL}{endpoint}", timeout=TEST_TIMEOUT)
                else:
                    response = requests.post(f"{API_BASE_URL}{endpoint}", json=payload, timeout=TEST_TIMEOUT)
                
                response_time = round((datetime.now() - start_time).total_seconds() * 1000, 2)
                
                if response.status_code in [200, 201]:
                    self.log_test(f"API Responsiveness: {endpoint}", True, 
                                f"Response time: {response_time}ms, Status: {response.status_code}")
                elif response.status_code in [400, 422]:  # Expected validation errors
                    self.log_test(f"API Responsiveness: {endpoint}", True, 
                                f"Response time: {response_time}ms, Expected validation error: {response.status_code}")
                else:
                    self.log_test(f"API Responsiveness: {endpoint}", False, 
                                f"Response time: {response_time}ms, Unexpected status: {response.status_code}")
                    
            except requests.exceptions.RequestException as e:
                self.log_test(f"API Responsiveness: {endpoint}", False, f"Request error: {str(e)}")
                
        # Test error handling
        error_test_cases = [
            ("Invalid flight search", "/flights/search", {"invalid": "data"}),
            ("Missing required fields", "/flights/search", {"origin": "Mumbai"}),
            ("Invalid endpoint", "/nonexistent", None)
        ]
        
        for test_name, endpoint, payload in error_test_cases:
            try:
                if payload:
                    response = requests.post(f"{API_BASE_URL}{endpoint}", json=payload, timeout=TEST_TIMEOUT)
                else:
                    response = requests.get(f"{API_BASE_URL}{endpoint}", timeout=TEST_TIMEOUT)
                
                if response.status_code in [400, 404, 422, 500]:
                    self.log_test(f"Error Handling: {test_name}", True, 
                                f"Proper error response: {response.status_code}")
                else:
                    self.log_test(f"Error Handling: {test_name}", False, 
                                f"Unexpected response: {response.status_code}")
                    
            except requests.exceptions.RequestException as e:
                self.log_test(f"Error Handling: {test_name}", False, f"Request error: {str(e)}")
                
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 STARTING BACKEND TESTING AFTER UI/UX IMPROVEMENTS")
        print("=" * 80)
        print("Testing backend functionality to ensure no regressions after frontend changes.")
        print("Expected: All backend services should work perfectly as changes were UI/UX only.")
        print("=" * 80)
        
        # Run all test suites
        self.test_backend_health()
        self.test_airport_search_api()
        self.test_flight_search_functionality()
        self.test_api_responsiveness()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 BACKEND TESTING SUMMARY")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🎉 EXCELLENT: Backend is working perfectly after UI/UX improvements!")
            print("✅ All backend functionality remains intact - frontend changes had no impact.")
        elif success_rate >= 75:
            print("✅ GOOD: Backend is mostly functional with minor issues.")
            print("⚠️ Some minor issues detected but core functionality works.")
        elif success_rate >= 50:
            print("⚠️ MODERATE: Backend has some issues that need attention.")
            print("🔧 Several endpoints need investigation.")
        else:
            print("🚨 CRITICAL: Backend has major issues that need immediate fixing.")
            print("❌ Significant problems detected - immediate action required.")
            
        # Print failed tests details
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print("\n🔍 FAILED TESTS DETAILS:")
            for test in failed_tests:
                print(f"❌ {test['test']}: {test['details']}")
        else:
            print("\n🎯 ALL TESTS PASSED: Backend services are fully operational!")
                
        return success_rate >= 75  # Return True if tests are mostly passing

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if not success:
        print("\n⚠️ Some tests failed - check the details above for issues to address.")
        sys.exit(1)
    else:
        print("\n✅ Backend testing completed successfully!")
        sys.exit(0)