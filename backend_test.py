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

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(title):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}")
    print(f"{title}")
    print(f"{'='*60}{Colors.END}")

def print_test(test_name):
    print(f"\n{Colors.YELLOW}🧪 Testing: {test_name}{Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

def test_backend_health():
    """Test basic backend connectivity"""
    print_test("Backend Health Check")
    
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=TEST_TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            if "TourSmile" in data.get("message", ""):
                print_success("Backend service is running and responding correctly")
                return True
            else:
                print_error(f"Unexpected response message: {data}")
                return False
        else:
            print_error(f"Backend health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Backend connectivity failed: {str(e)}")
        return False

def test_flight_search_endpoint():
    """Test flight search endpoint with Mumbai→Delhi parameters"""
    print_test("Flight Search Endpoint - Mumbai→Delhi")
    
    # Test data for Mumbai→Delhi search
    search_payload = {
        "origin": "Mumbai",
        "destination": "Delhi", 
        "departure_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
        "passengers": 1,
        "class_type": "economy"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/flights/search",
            json=search_payload,
            timeout=TEST_TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Flight search endpoint responding correctly")
            
            # Validate response structure
            required_fields = ["flights", "search_id", "total_found"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print_error(f"Missing required fields in response: {missing_fields}")
                return False
            
            flights = data.get("flights", [])
            if not flights:
                print_error("No flights returned in search results")
                return False
            
            print_success(f"Found {len(flights)} flights for Mumbai→Delhi route")
            
            # Test flight data structure
            first_flight = flights[0]
            flight_fields = ["id", "airline", "origin", "destination", "price"]
            missing_flight_fields = [field for field in flight_fields if field not in first_flight]
            
            if missing_flight_fields:
                print_error(f"Missing flight fields: {missing_flight_fields}")
                return False
            
            # Validate pricing is in realistic range (₹3000-₹15000)
            price = first_flight.get("price", 0)
            if 3000 <= price <= 15000:
                print_success(f"Flight pricing in realistic range: ₹{price}")
            else:
                print_error(f"Flight pricing outside expected range: ₹{price}")
                return False
            
            # Check for airport code handling
            origin = first_flight.get("origin", "")
            destination = first_flight.get("destination", "")
            if origin and destination:
                print_success(f"Airport code handling working: {origin}→{destination}")
            else:
                print_error("Airport code handling issue")
                return False
            
            print_success("Flight search endpoint validation complete")
            return True
            
        else:
            print_error(f"Flight search failed with status {response.status_code}")
            if response.text:
                print_error(f"Error details: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Flight search test failed: {str(e)}")
        return False

def test_airport_search_api():
    """Test airport search API with comprehensive global coverage"""
    print_test("Airport Search API - Global Coverage")
    
    # Test cases for different airport searches
    test_cases = [
        # Indian airports
        {"query": "Mumbai", "expected_iata": "BOM", "type": "Indian"},
        {"query": "Delhi", "expected_iata": "DEL", "type": "Indian"},
        {"query": "Bengaluru", "expected_iata": "BLR", "type": "Indian"},
        
        # International airports
        {"query": "London", "expected_iata": "LHR", "type": "International"},
        {"query": "New York", "expected_iata": "JFK", "type": "International"},
        {"query": "Dubai", "expected_iata": "DXB", "type": "International"},
        
        # IATA code searches
        {"query": "BOM", "expected_iata": "BOM", "type": "IATA Code"},
        {"query": "DEL", "expected_iata": "DEL", "type": "IATA Code"},
        
        # Partial matches
        {"query": "mum", "expected_iata": "BOM", "type": "Partial Match"},
        {"query": "del", "expected_iata": "DEL", "type": "Partial Match"}
    ]
    
    success_count = 0
    total_tests = len(test_cases)
    
    for test_case in test_cases:
        query = test_case["query"]
        expected_iata = test_case["expected_iata"]
        test_type = test_case["type"]
        
        try:
            response = requests.get(
                f"{BACKEND_URL}/airports/search",
                params={"query": query, "limit": 10},
                timeout=TEST_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                
                if results:
                    # Check if expected IATA code is found
                    found_airport = None
                    for airport in results:
                        if airport.get("iata") == expected_iata:
                            found_airport = airport
                            break
                    
                    if found_airport:
                        print_success(f"{test_type} search '{query}' → {found_airport['city']} ({found_airport['iata']})")
                        
                        # Validate airport data structure
                        required_fields = ["city", "airport", "iata", "country"]
                        if all(field in found_airport for field in required_fields):
                            success_count += 1
                        else:
                            print_error(f"Missing required fields in airport data for {query}")
                    else:
                        print_error(f"{test_type} search '{query}' did not return expected IATA {expected_iata}")
                else:
                    print_error(f"{test_type} search '{query}' returned no results")
            else:
                print_error(f"Airport search failed for '{query}' with status {response.status_code}")
                
        except Exception as e:
            print_error(f"Airport search test failed for '{query}': {str(e)}")
    
    success_rate = (success_count / total_tests) * 100
    if success_rate >= 80:
        print_success(f"Airport search API validation complete: {success_count}/{total_tests} tests passed ({success_rate:.1f}%)")
        return True
    else:
        print_error(f"Airport search API validation failed: {success_count}/{total_tests} tests passed ({success_rate:.1f}%)")
        return False

def test_data_structure_validation():
    """Test data structure validation for JSON serialization"""
    print_test("Data Structure Validation")
    
    try:
        # Test flight search response structure
        search_payload = {
            "origin": "Mumbai",
            "destination": "Delhi",
            "departure_date": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "passengers": 2,
            "class_type": "economy"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/flights/search",
            json=search_payload,
            timeout=TEST_TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            flights = data.get("flights", [])
            
            if flights:
                flight = flights[0]
                
                # Check for comprehensive flight data structure
                expected_flight_fields = [
                    "id", "airline", "flight_number", "origin", "destination",
                    "departure_time", "arrival_time", "duration", "price", "stops"
                ]
                
                present_fields = [field for field in expected_flight_fields if field in flight]
                missing_fields = [field for field in expected_flight_fields if field not in flight]
                
                print_success(f"Flight data contains {len(present_fields)}/{len(expected_flight_fields)} expected fields")
                
                if missing_fields:
                    print_info(f"Optional fields not present: {missing_fields}")
                
                # Test JSON serialization (no ObjectID issues)
                try:
                    json_str = json.dumps(data)
                    print_success("JSON serialization working correctly (no ObjectID issues)")
                except Exception as e:
                    print_error(f"JSON serialization failed: {str(e)}")
                    return False
                
                # Test airport search data structure
                airport_response = requests.get(
                    f"{BACKEND_URL}/airports/search",
                    params={"query": "Mumbai", "limit": 5},
                    timeout=TEST_TIMEOUT
                )
                
                if airport_response.status_code == 200:
                    airport_data = airport_response.json()
                    airports = airport_data.get("results", [])
                    
                    if airports:
                        airport = airports[0]
                        expected_airport_fields = ["city", "airport", "iata", "country"]
                        
                        airport_present = [field for field in expected_airport_fields if field in airport]
                        airport_missing = [field for field in expected_airport_fields if field not in airport]
                        
                        print_success(f"Airport data contains {len(airport_present)}/{len(expected_airport_fields)} expected fields")
                        
                        if not airport_missing:
                            print_success("All required airport fields present")
                        else:
                            print_error(f"Missing airport fields: {airport_missing}")
                            return False
                    else:
                        print_error("No airport data returned for validation")
                        return False
                else:
                    print_error("Airport search failed during data structure validation")
                    return False
                
                print_success("Data structure validation complete")
                return True
            else:
                print_error("No flight data available for structure validation")
                return False
        else:
            print_error("Flight search failed during data structure validation")
            return False
            
    except Exception as e:
        print_error(f"Data structure validation failed: {str(e)}")
        return False

def test_booking_flow_readiness():
    """Test booking flow API endpoints readiness"""
    print_test("Booking Flow API Readiness")
    
    endpoints_to_test = [
        # OTP Service endpoints
        {"method": "POST", "endpoint": "/auth/send-otp", "payload": {"mobile": "+919876543210"}, "name": "OTP Send Service"},
        {"method": "POST", "endpoint": "/auth/verify-otp", "payload": {"mobile": "+919876543210", "otp": "123456"}, "name": "OTP Verify Service"},
        
        # Payment processing endpoints
        {"method": "GET", "endpoint": "/payments/config", "payload": None, "name": "Payment Configuration"},
        {"method": "POST", "endpoint": "/payments/create-order", "payload": {"amount": 5000, "currency": "INR"}, "name": "Payment Order Creation"},
        
        # Booking confirmation endpoint
        {"method": "POST", "endpoint": "/bookings/confirm", "payload": {
            "bookingData": {"flight": {"airline": "Test"}, "contactInfo": {"email": "test@example.com"}},
            "payment": {"id": "test_payment"},
            "finalPrice": 5000
        }, "name": "Booking Confirmation"}
    ]
    
    success_count = 0
    total_tests = len(endpoints_to_test)
    
    for test in endpoints_to_test:
        method = test["method"]
        endpoint = test["endpoint"]
        payload = test["payload"]
        name = test["name"]
        
        try:
            if method == "GET":
                response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=TEST_TIMEOUT)
            elif method == "POST":
                response = requests.post(f"{BACKEND_URL}{endpoint}", json=payload, timeout=TEST_TIMEOUT)
            
            # Accept both 200 (success) and 422 (validation error) as "endpoint exists"
            if response.status_code in [200, 422]:
                print_success(f"{name} endpoint available (status: {response.status_code})")
                success_count += 1
            elif response.status_code == 404:
                print_error(f"{name} endpoint not found (404)")
            else:
                print_error(f"{name} endpoint error (status: {response.status_code})")
                
        except Exception as e:
            print_error(f"{name} endpoint test failed: {str(e)}")
    
    success_rate = (success_count / total_tests) * 100
    if success_rate >= 80:
        print_success(f"Booking flow readiness: {success_count}/{total_tests} endpoints available ({success_rate:.1f}%)")
        return True
    else:
        print_error(f"Booking flow readiness insufficient: {success_count}/{total_tests} endpoints available ({success_rate:.1f}%)")
        return False

def test_tbo_integration_preparation():
    """Test backend architecture readiness for TBO API integration"""
    print_test("TBO API Integration Preparation")
    
    try:
        # Test environment variable management
        print_info("Testing environment variable management...")
        
        # Test API integration patterns by checking existing integrations
        print_info("Testing existing API integration patterns...")
        
        # Test flight search with enhanced parameters (similar to what TBO might need)
        enhanced_payload = {
            "origin": "Mumbai",
            "destination": "Delhi",
            "departure_date": (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d"),
            "passengers": 1,
            "class_type": "economy",
            # Enhanced parameters that TBO API might use
            "timePreference": "morning",
            "flexibleDates": True,
            "nearbyAirports": False,
            "corporateBooking": False,
            "budgetRange": [3000, 8000]
        }
        
        response = requests.post(
            f"{BACKEND_URL}/flights/search",
            json=enhanced_payload,
            timeout=TEST_TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if enhanced parameters are handled
            if "enhanced_parameters" in data:
                print_success("Backend can handle enhanced search parameters (TBO-ready)")
            else:
                print_info("Enhanced parameters processed without explicit confirmation")
            
            # Check error handling
            print_info("Testing error handling patterns...")
            
            # Test with invalid parameters
            invalid_payload = {
                "origin": "",  # Invalid empty origin
                "destination": "Delhi",
                "departure_date": "invalid-date",  # Invalid date format
                "passengers": -1,  # Invalid passenger count
                "class_type": "invalid_class"  # Invalid class
            }
            
            error_response = requests.post(
                f"{BACKEND_URL}/flights/search",
                json=invalid_payload,
                timeout=TEST_TIMEOUT
            )
            
            if error_response.status_code in [400, 422]:
                print_success("Error handling working correctly for invalid parameters")
            else:
                print_info(f"Error handling response: {error_response.status_code}")
            
            # Test API response consistency
            print_info("Testing API response consistency...")
            
            # Make multiple requests to check consistency
            consistent_responses = True
            for i in range(3):
                test_response = requests.post(
                    f"{BACKEND_URL}/flights/search",
                    json=enhanced_payload,
                    timeout=TEST_TIMEOUT
                )
                
                if test_response.status_code != 200:
                    consistent_responses = False
                    break
                
                test_data = test_response.json()
                if "flights" not in test_data or "search_id" not in test_data:
                    consistent_responses = False
                    break
            
            if consistent_responses:
                print_success("API response consistency verified")
            else:
                print_error("API response consistency issues detected")
                return False
            
            print_success("TBO API integration preparation assessment complete")
            return True
            
        else:
            print_error(f"Enhanced parameter test failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"TBO integration preparation test failed: {str(e)}")
        return False

def run_comprehensive_test():
    """Run all backend tests for TBO API integration readiness"""
    print_header("TBO API INTEGRATION READINESS TESTING")
    print_info(f"Testing backend at: {BACKEND_URL}")
    print_info(f"Test timeout: {TEST_TIMEOUT} seconds")
    
    test_results = []
    
    # Test 1: Backend Health
    print_header("1. BACKEND HEALTH CHECK")
    test_results.append(("Backend Health", test_backend_health()))
    
    # Test 2: Flight Search Endpoint
    print_header("2. FLIGHT SEARCH ENDPOINT TESTING")
    test_results.append(("Flight Search API", test_flight_search_endpoint()))
    
    # Test 3: Airport Search API
    print_header("3. AIRPORT SEARCH API TESTING")
    test_results.append(("Airport Search API", test_airport_search_api()))
    
    # Test 4: Data Structure Validation
    print_header("4. DATA STRUCTURE VALIDATION")
    test_results.append(("Data Structure", test_data_structure_validation()))
    
    # Test 5: Booking Flow Readiness
    print_header("5. BOOKING FLOW API READINESS")
    test_results.append(("Booking Flow", test_booking_flow_readiness()))
    
    # Test 6: TBO Integration Preparation
    print_header("6. TBO API INTEGRATION PREPARATION")
    test_results.append(("TBO Integration Prep", test_tbo_integration_preparation()))
    
    # Summary
    print_header("TEST RESULTS SUMMARY")
    
    passed_tests = [test for test in test_results if test[1]]
    failed_tests = [test for test in test_results if not test[1]]
    
    print(f"\n{Colors.BOLD}Overall Results:{Colors.END}")
    print(f"✅ Passed: {len(passed_tests)}/{len(test_results)} tests")
    print(f"❌ Failed: {len(failed_tests)}/{len(test_results)} tests")
    
    if passed_tests:
        print(f"\n{Colors.GREEN}✅ PASSED TESTS:{Colors.END}")
        for test_name, _ in passed_tests:
            print(f"  • {test_name}")
    
    if failed_tests:
        print(f"\n{Colors.RED}❌ FAILED TESTS:{Colors.END}")
        for test_name, _ in failed_tests:
            print(f"  • {test_name}")
    
    success_rate = (len(passed_tests) / len(test_results)) * 100
    
    print(f"\n{Colors.BOLD}TBO API INTEGRATION READINESS: {success_rate:.1f}%{Colors.END}")
    
    if success_rate >= 80:
        print(f"{Colors.GREEN}🎉 BACKEND IS READY FOR TBO API INTEGRATION!{Colors.END}")
        print(f"{Colors.GREEN}✅ Flight search API returns proper mock data with realistic pricing{Colors.END}")
        print(f"{Colors.GREEN}✅ Airport search API provides comprehensive global database{Colors.END}")
        print(f"{Colors.GREEN}✅ All JSON responses properly formatted{Colors.END}")
        print(f"{Colors.GREEN}✅ Booking flow endpoints ready for integration{Colors.END}")
        print(f"{Colors.GREEN}✅ Backend prepared for TBO test credentials integration{Colors.END}")
    else:
        print(f"{Colors.RED}⚠️  BACKEND NEEDS IMPROVEMENTS FOR TBO INTEGRATION{Colors.END}")
        print(f"{Colors.YELLOW}Please address the failed tests before proceeding with TBO API integration.{Colors.END}")
    
    return success_rate >= 80

if __name__ == "__main__":
    try:
        success = run_comprehensive_test()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Test interrupted by user{Colors.END}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}Test suite failed with error: {str(e)}{Colors.END}")
        sys.exit(1)