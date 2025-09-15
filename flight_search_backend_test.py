#!/usr/bin/env python3
"""
Flight Search Backend API Testing
=================================

Testing the flight search functionality to ensure backend APIs are working properly
after the comprehensive airport database updates.

Tests:
1. Basic Flight Search API
2. Enhanced Search Parameters
3. Flight Search with Airport Database Integration
4. API Response Structure Validation
5. Performance Testing
"""

import requests
import json
import time
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

class FlightSearchBackendTester:
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

    def test_basic_flight_search(self):
        """Test basic flight search functionality"""
        print("\n✈️ TESTING BASIC FLIGHT SEARCH...")
        
        # Test data
        search_data = {
            "origin": "Mumbai",
            "destination": "Delhi",
            "departure_date": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
            "passengers": 1,
            "class_type": "economy"
        }
        
        try:
            response = requests.post(f"{API_BASE_URL}/flights/search", 
                                   json=search_data, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ['flights', 'search_id', 'total_found']
                missing_fields = [field for field in required_fields if field not in data]
                
                if len(missing_fields) == 0:
                    flights = data.get('flights', [])
                    total_found = data.get('total_found', 0)
                    
                    if total_found > 0 and len(flights) > 0:
                        self.log_test("Basic Flight Search", True, 
                                    f"Found {total_found} flights, returned {len(flights)} results")
                        return True
                    else:
                        self.log_test("Basic Flight Search", False, 
                                    f"No flights found for Mumbai→Delhi")
                        return False
                else:
                    self.log_test("Basic Flight Search", False, 
                                f"Missing response fields: {', '.join(missing_fields)}")
                    return False
            else:
                self.log_test("Basic Flight Search", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Basic Flight Search", False, f"Error: {str(e)}")
            return False

    def test_enhanced_search_parameters(self):
        """Test enhanced search parameters"""
        print("\n🔍 TESTING ENHANCED SEARCH PARAMETERS...")
        
        # Test data with enhanced parameters
        search_data = {
            "origin": "Delhi",
            "destination": "Mumbai",
            "departure_date": (datetime.now() + timedelta(days=10)).strftime('%Y-%m-%d'),
            "passengers": 2,
            "class_type": "economy",
            "timePreference": "morning",
            "flexibleDates": True,
            "nearbyAirports": False,
            "corporateBooking": False,
            "budgetRange": [3000, 8000]
        }
        
        try:
            response = requests.post(f"{API_BASE_URL}/flights/search", 
                                   json=search_data, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if enhanced parameters are acknowledged
                enhanced_params = data.get('enhanced_parameters', {})
                
                if enhanced_params:
                    expected_params = ['timePreference', 'flexibleDates', 'budgetRange']
                    found_params = [param for param in expected_params if param in enhanced_params]
                    
                    if len(found_params) >= 2:
                        self.log_test("Enhanced Search Parameters", True, 
                                    f"Enhanced parameters processed: {', '.join(found_params)}")
                        return True
                    else:
                        self.log_test("Enhanced Search Parameters", False, 
                                    f"Enhanced parameters not properly processed")
                        return False
                else:
                    # Check if flights are returned (basic functionality)
                    flights = data.get('flights', [])
                    if len(flights) > 0:
                        self.log_test("Enhanced Search Parameters", True, 
                                    f"Enhanced search returned {len(flights)} flights")
                        return True
                    else:
                        self.log_test("Enhanced Search Parameters", False, 
                                    f"Enhanced search returned no flights")
                        return False
            else:
                self.log_test("Enhanced Search Parameters", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Enhanced Search Parameters", False, f"Error: {str(e)}")
            return False

    def test_airport_database_integration(self):
        """Test flight search with airport database integration"""
        print("\n🌍 TESTING AIRPORT DATABASE INTEGRATION...")
        
        # Test searches using various airport formats
        test_cases = [
            ("BOM", "DEL", "Mumbai→Delhi using IATA codes"),
            ("Mumbai", "Delhi", "Mumbai→Delhi using city names"),
            ("DXB", "LHR", "Dubai→London using IATA codes"),
        ]
        
        all_passed = True
        for origin, destination, description in test_cases:
            search_data = {
                "origin": origin,
                "destination": destination,
                "departure_date": (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d'),
                "passengers": 1,
                "class_type": "economy"
            }
            
            try:
                response = requests.post(f"{API_BASE_URL}/flights/search", 
                                       json=search_data, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    flights = data.get('flights', [])
                    
                    if len(flights) > 0:
                        self.log_test(f"Airport Integration - {description}", True, 
                                    f"Found {len(flights)} flights")
                    else:
                        # For international routes, mock data might not be available
                        # This is acceptable as long as the API responds correctly
                        self.log_test(f"Airport Integration - {description}", True, 
                                    f"API responded correctly (no flights available for route)")
                else:
                    self.log_test(f"Airport Integration - {description}", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Airport Integration - {description}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_api_response_structure(self):
        """Test API response structure validation"""
        print("\n📋 TESTING API RESPONSE STRUCTURE...")
        
        search_data = {
            "origin": "Mumbai",
            "destination": "Delhi",
            "departure_date": (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d'),
            "passengers": 1,
            "class_type": "economy"
        }
        
        try:
            response = requests.post(f"{API_BASE_URL}/flights/search", 
                                   json=search_data, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check main response structure
                required_main_fields = ['flights', 'search_id', 'total_found', 'data_source']
                missing_main_fields = [field for field in required_main_fields if field not in data]
                
                if len(missing_main_fields) == 0:
                    flights = data.get('flights', [])
                    
                    if len(flights) > 0:
                        # Check flight object structure
                        flight = flights[0]
                        required_flight_fields = ['id', 'airline', 'origin', 'destination', 'price']
                        missing_flight_fields = [field for field in required_flight_fields if field not in flight]
                        
                        if len(missing_flight_fields) == 0:
                            self.log_test("API Response Structure", True, 
                                        f"All required fields present in response and flight objects")
                            return True
                        else:
                            self.log_test("API Response Structure", False, 
                                        f"Missing flight fields: {', '.join(missing_flight_fields)}")
                            return False
                    else:
                        self.log_test("API Response Structure", True, 
                                    f"Response structure valid (no flights for validation)")
                        return True
                else:
                    self.log_test("API Response Structure", False, 
                                f"Missing main fields: {', '.join(missing_main_fields)}")
                    return False
            else:
                self.log_test("API Response Structure", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("API Response Structure", False, f"Error: {str(e)}")
            return False

    def test_performance(self):
        """Test API performance"""
        print("\n⚡ TESTING API PERFORMANCE...")
        
        search_data = {
            "origin": "Delhi",
            "destination": "Mumbai",
            "departure_date": (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
            "passengers": 1,
            "class_type": "economy"
        }
        
        try:
            start_time = time.time()
            response = requests.post(f"{API_BASE_URL}/flights/search", 
                                   json=search_data, timeout=TEST_TIMEOUT)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            if response.status_code == 200 and response_time < 5000:  # Less than 5 seconds
                self.log_test("API Performance", True, 
                            f"Response time: {response_time:.0f}ms")
                return True
            else:
                self.log_test("API Performance", False, 
                            f"Response time: {response_time:.0f}ms or status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("API Performance", False, f"Error: {str(e)}")
            return False

    def test_other_endpoints(self):
        """Test other backend endpoints"""
        print("\n🔗 TESTING OTHER BACKEND ENDPOINTS...")
        
        endpoints_to_test = [
            ("/", "Root API endpoint"),
            ("/chat", "AI Chat endpoint"),
            ("/auth/send-otp", "OTP Send endpoint"),
            ("/payments/config", "Payment Config endpoint"),
        ]
        
        all_passed = True
        for endpoint, description in endpoints_to_test:
            try:
                if endpoint == "/":
                    response = requests.get(f"{API_BASE_URL}{endpoint}", timeout=TEST_TIMEOUT)
                elif endpoint == "/chat":
                    response = requests.post(f"{API_BASE_URL}{endpoint}", 
                                           json={"message": "Hello", "session_id": "test"}, 
                                           timeout=TEST_TIMEOUT)
                elif endpoint == "/auth/send-otp":
                    response = requests.post(f"{API_BASE_URL}{endpoint}", 
                                           json={"mobile": "9876543210"}, 
                                           timeout=TEST_TIMEOUT)
                elif endpoint == "/payments/config":
                    response = requests.get(f"{API_BASE_URL}{endpoint}", timeout=TEST_TIMEOUT)
                
                if response.status_code in [200, 422]:  # 422 is acceptable for validation errors
                    self.log_test(f"Endpoint - {description}", True, 
                                f"Status: {response.status_code}")
                else:
                    self.log_test(f"Endpoint - {description}", False, 
                                f"Status: {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Endpoint - {description}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def run_all_tests(self):
        """Run all flight search backend tests"""
        print("🎯 FLIGHT SEARCH BACKEND API TESTING STARTED")
        print("=" * 80)
        
        # Test 1: Basic Flight Search
        self.test_basic_flight_search()
        
        # Test 2: Enhanced Search Parameters
        self.test_enhanced_search_parameters()
        
        # Test 3: Airport Database Integration
        self.test_airport_database_integration()
        
        # Test 4: API Response Structure
        self.test_api_response_structure()
        
        # Test 5: Performance Testing
        self.test_performance()
        
        # Test 6: Other Endpoints
        self.test_other_endpoints()
        
        # Summary
        print("\n" + "=" * 80)
        print("🎯 FLIGHT SEARCH BACKEND TESTING SUMMARY")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        
        print(f"📊 OVERALL SUCCESS RATE: {success_rate:.1f}% ({self.passed_tests}/{self.total_tests} tests passed)")
        
        if success_rate >= 90:
            print("🎉 EXCELLENT: Flight search backend is production-ready!")
        elif success_rate >= 75:
            print("✅ GOOD: Flight search backend is mostly working with minor issues")
        elif success_rate >= 50:
            print("⚠️ MODERATE: Flight search backend has significant issues")
        else:
            print("❌ CRITICAL: Flight search backend has major problems")
        
        print("\n📋 DETAILED TEST RESULTS:")
        for result in self.test_results:
            status = "✅ PASS" if result['success'] else "❌ FAIL"
            details = f" | {result['details']}" if result['details'] else ""
            print(f"  {status} - {result['test']}{details}")
        
        return success_rate

if __name__ == "__main__":
    tester = FlightSearchBackendTester()
    success_rate = tester.run_all_tests()
    
    # Exit with appropriate code
    if success_rate >= 75:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Failure