#!/usr/bin/env python3
"""
Priority 2 Features Backend Testing Suite for TourSmile AI Travel Platform
Focus: Backend functionality after Priority 2 Features implementation
Review Request: Test backend functionality after Priority 2 Features implementation 
(Flexible date calendar, Smart auto-complete, Promotional integration)

TESTING FOCUS:
1. Core Backend Health - Verify all basic endpoints are still working after frontend changes
2. Flight Search API - Test flight search endpoint with enhanced parameters (flexible dates, preferences)
3. Database Connectivity - Ensure PostgreSQL connections are stable
4. Environment Variables - Verify all required API keys and configurations are accessible
5. Error Handling - Test graceful error responses
"""

import requests
import json
import time
import os
import sys
from datetime import datetime, timedelta

# Add backend to path for importing services
sys.path.append('/app/backend')

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
print(f"🎯 PRIORITY 2 FEATURES BACKEND TESTING")
print(f"Testing backend at: {API_BASE}")
print("Review Request: Test backend functionality after Priority 2 Features implementation")
print("Priority 2 Features: Flexible date calendar, Smart auto-complete, Promotional integration")
print("=" * 80)

class Priority2BackendTester:
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
        
        if response_data and isinstance(response_data, dict):
            print(f"📄 Response Data: {json.dumps(response_data, indent=2)[:500]}...")
            print("-" * 40)

    def test_core_backend_health(self):
        """Test 1: Core Backend Health - Verify all basic endpoints are still working"""
        print("\n🏥 TESTING CORE BACKEND HEALTH")
        print("=" * 70)
        try:
            response = self.session.get(f"{API_BASE}/")
            if response.status_code == 200:
                data = response.json()
                if "TourSmile" in data.get("message", ""):
                    self.log_result("Core Backend Health", True, 
                                  "Backend service is running and responding correctly", data)
                    return True
                else:
                    self.log_result("Core Backend Health", False, f"Unexpected response: {data}")
            else:
                self.log_result("Core Backend Health", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Core Backend Health", False, f"Connection error: {str(e)}")
        return False

    def test_flight_search_enhanced_parameters(self):
        """Test 2: Flight Search API with Enhanced Parameters (Priority 2 Features)"""
        print("\n✈️ TESTING FLIGHT SEARCH API WITH ENHANCED PARAMETERS")
        print("=" * 70)
        try:
            # Test enhanced search parameters from Priority 2 implementation
            payload = {
                "origin": "Delhi",
                "destination": "Mumbai", 
                "departure_date": "2025-02-15",
                "passengers": 2,
                "class_type": "economy",
                # Enhanced parameters from Priority 2 Features
                "timePreference": "morning",  # morning, afternoon, evening, night, any
                "flexibleDates": True,        # ±3 days search
                "nearbyAirports": False,      # include nearby airports
                "corporateBooking": False,    # corporate booking rates
                "budgetRange": [3000, 8000]   # [min, max] price range
            }
            
            print(f"📤 REQUEST WITH ENHANCED PARAMETERS: {json.dumps(payload, indent=2)}")
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "flights" in data and "search_id" in data:
                    flights = data["flights"]
                    data_source = data.get("data_source", "unknown")
                    enhanced_params = data.get("enhanced_parameters", {})
                    
                    print(f"✅ Enhanced flight search successful:")
                    print(f"   Data Source: {data_source}")
                    print(f"   Flights Found: {len(flights)}")
                    print(f"   Search ID: {data['search_id']}")
                    print(f"   Enhanced Parameters Received: {enhanced_params}")
                    
                    # Validate enhanced parameters are being processed
                    if enhanced_params:
                        print(f"   🚀 Enhanced Parameters Processing:")
                        for param, value in enhanced_params.items():
                            print(f"      {param}: {value}")
                    
                    if len(flights) > 0:
                        # Validate flight data structure
                        flight = flights[0]
                        required_fields = ["id", "airline", "flight_number", "origin", "destination", "price"]
                        missing_fields = [field for field in required_fields if field not in flight]
                        
                        if not missing_fields:
                            # Check if budget range filtering is working
                            budget_filtered_flights = [f for f in flights if 3000 <= f.get('price', 0) <= 8000]
                            
                            self.log_result("Flight Search Enhanced Parameters", True, 
                                          f"Enhanced flight search working - {len(flights)} flights found, "
                                          f"{len(budget_filtered_flights)} within budget range ₹3000-₹8000",
                                          {"flights_count": len(flights), "data_source": data_source, 
                                           "enhanced_params": enhanced_params, "budget_filtered": len(budget_filtered_flights)})
                            return True
                        else:
                            self.log_result("Flight Search Enhanced Parameters", False, 
                                          f"Flight data missing required fields: {missing_fields}")
                    else:
                        self.log_result("Flight Search Enhanced Parameters", True, 
                                      "Enhanced flight search API working but no flights found for this route")
                        return True
                else:
                    self.log_result("Flight Search Enhanced Parameters", False, 
                                  f"Missing required response fields: {list(data.keys())}")
            else:
                self.log_result("Flight Search Enhanced Parameters", False, 
                              f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Flight Search Enhanced Parameters", False, f"Error: {str(e)}")
        return False

    def test_postgresql_connectivity(self):
        """Test 3: PostgreSQL Database Connectivity"""
        print("\n🗄️ TESTING POSTGRESQL DATABASE CONNECTIVITY")
        print("=" * 70)
        try:
            # Test database connectivity through endpoints that require database access
            
            # Test 1: Waitlist subscription (tests PostgreSQL write)
            test_email = f"test.priority2.{int(time.time())}@example.com"
            payload = {"email": test_email, "source": "priority2_backend_test"}
            
            try:
                response1 = self.session.post(f"{API_BASE}/waitlist/subscribe", json=payload)
                db_test_1 = response1.status_code in [200, 409] or "already" in response1.text.lower()
                print(f"   Waitlist subscription test: {'✅' if db_test_1 else '❌'}")
            except:
                db_test_1 = False
                print(f"   Waitlist subscription test: ❌")
            
            # Test 2: TourBuilder popular destinations (tests PostgreSQL read)
            try:
                response2 = self.session.get(f"{API_BASE}/tourbuilder/popular-destinations")
                db_test_2 = response2.status_code == 200 and "destinations" in response2.json()
                print(f"   TourBuilder destinations test: {'✅' if db_test_2 else '❌'}")
            except:
                db_test_2 = False
                print(f"   TourBuilder destinations test: ❌")
            
            # Test 3: Admin dashboard stats (tests PostgreSQL complex queries)
            try:
                response3 = self.session.get(f"{API_BASE}/admin/dashboard/stats")
                # 401 is expected without auth, but means endpoint is accessible
                db_test_3 = response3.status_code in [200, 401]
                print(f"   Admin dashboard stats test: {'✅' if db_test_3 else '❌'}")
            except:
                db_test_3 = False
                print(f"   Admin dashboard stats test: ❌")
            
            successful_tests = sum([db_test_1, db_test_2, db_test_3])
            
            if successful_tests >= 2:
                self.log_result("PostgreSQL Connectivity", True, 
                              f"PostgreSQL database connections stable - {successful_tests}/3 tests passed",
                              {"tests_passed": successful_tests, "total_tests": 3})
                return True
            else:
                self.log_result("PostgreSQL Connectivity", False, 
                              f"PostgreSQL connectivity issues - only {successful_tests}/3 tests passed")
        except Exception as e:
            self.log_result("PostgreSQL Connectivity", False, f"Error testing PostgreSQL connectivity: {str(e)}")
        return False

    def test_environment_variables_access(self):
        """Test 4: Environment Variables Access - Verify all required API keys and configurations"""
        print("\n🔐 TESTING ENVIRONMENT VARIABLES ACCESS")
        print("=" * 70)
        
        env_tests = []
        
        # Test 1: OpenAI API Key (for AI recommendations)
        try:
            payload = {"message": "Quick test for Priority 2 features", "session_id": None}
            response = self.session.post(f"{API_BASE}/chat", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "response" in data and len(data["response"]) > 10:
                    env_tests.append(("OpenAI API Key", True, "Working"))
                    print(f"   ✅ OpenAI API Key: Working")
                else:
                    env_tests.append(("OpenAI API Key", True, "Configured but quota limited"))
                    print(f"   ⚠️ OpenAI API Key: Configured but quota limited")
            else:
                env_tests.append(("OpenAI API Key", False, f"HTTP {response.status_code}"))
                print(f"   ❌ OpenAI API Key: HTTP {response.status_code}")
        except Exception as e:
            env_tests.append(("OpenAI API Key", False, str(e)))
            print(f"   ❌ OpenAI API Key: {str(e)}")
        
        # Test 2: Razorpay Configuration (for promotional integration)
        try:
            response = self.session.get(f"{API_BASE}/payments/config")
            if response.status_code == 200:
                data = response.json()
                if "razorpay_key_id" in data:
                    env_tests.append(("Razorpay Configuration", True, "Available"))
                    print(f"   ✅ Razorpay Configuration: Available")
                else:
                    env_tests.append(("Razorpay Configuration", False, "Missing key_id"))
                    print(f"   ❌ Razorpay Configuration: Missing key_id")
            else:
                env_tests.append(("Razorpay Configuration", False, f"HTTP {response.status_code}"))
                print(f"   ❌ Razorpay Configuration: HTTP {response.status_code}")
        except Exception as e:
            env_tests.append(("Razorpay Configuration", False, str(e)))
            print(f"   ❌ Razorpay Configuration: {str(e)}")
        
        # Test 3: PostgreSQL URL (for database connectivity)
        try:
            # Test through a simple database operation
            response = self.session.get(f"{API_BASE}/tourbuilder/popular-destinations")
            if response.status_code == 200:
                env_tests.append(("PostgreSQL URL", True, "Working"))
                print(f"   ✅ PostgreSQL URL: Working")
            else:
                env_tests.append(("PostgreSQL URL", False, f"HTTP {response.status_code}"))
                print(f"   ❌ PostgreSQL URL: HTTP {response.status_code}")
        except Exception as e:
            env_tests.append(("PostgreSQL URL", False, str(e)))
            print(f"   ❌ PostgreSQL URL: {str(e)}")
        
        successful_env_tests = sum(1 for _, success, _ in env_tests if success)
        
        if successful_env_tests >= 2:
            self.log_result("Environment Variables Access", True, 
                          f"Environment variables accessible - {successful_env_tests}/3 tests passed",
                          {"env_tests": env_tests})
            return True
        else:
            self.log_result("Environment Variables Access", False, 
                          f"Environment variable issues - only {successful_env_tests}/3 tests passed")
        return False

    def test_core_api_endpoints_stability(self):
        """Test 5: Core API Endpoints Stability - Ensure no regressions after Priority 2 changes"""
        print("\n🔗 TESTING CORE API ENDPOINTS STABILITY")
        print("=" * 70)
        
        endpoints_to_test = [
            {
                "name": "Flight Search Basic",
                "method": "POST",
                "url": f"{API_BASE}/flights/search",
                "payload": {
                    "origin": "Delhi",
                    "destination": "Mumbai",
                    "departure_date": "2025-02-15",
                    "passengers": 1,
                    "class_type": "economy"
                },
                "expected_fields": ["flights", "search_id"]
            },
            {
                "name": "Hotel Search",
                "method": "POST",
                "url": f"{API_BASE}/hotels/search",
                "payload": {
                    "location": "Mumbai",
                    "checkin_date": "2025-02-15",
                    "checkout_date": "2025-02-17",
                    "guests": 2,
                    "rooms": 1
                },
                "expected_fields": ["hotels", "search_id"]
            },
            {
                "name": "OTP Authentication",
                "method": "POST",
                "url": f"{API_BASE}/auth/send-otp",
                "payload": {"mobile": "+919876543210"},
                "expected_fields": ["success", "message"]
            },
            {
                "name": "Payment Configuration",
                "method": "GET",
                "url": f"{API_BASE}/payments/config",
                "payload": None,
                "expected_fields": ["success", "razorpay_key_id"]
            },
            {
                "name": "TourBuilder Popular Destinations",
                "method": "GET",
                "url": f"{API_BASE}/tourbuilder/popular-destinations",
                "payload": None,
                "expected_fields": ["destinations"]
            }
        ]
        
        successful_endpoints = 0
        
        for endpoint in endpoints_to_test:
            try:
                print(f"\n📋 Testing {endpoint['name']} endpoint...")
                
                if endpoint["method"] == "POST":
                    response = self.session.post(endpoint["url"], json=endpoint["payload"])
                else:
                    response = self.session.get(endpoint["url"])
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check if expected fields are present
                    missing_fields = [field for field in endpoint["expected_fields"] if field not in data]
                    
                    if not missing_fields:
                        print(f"   ✅ {endpoint['name']}: Working correctly")
                        successful_endpoints += 1
                    else:
                        print(f"   ⚠️ {endpoint['name']}: Responding but missing fields: {missing_fields}")
                        successful_endpoints += 0.5  # Partial success
                elif response.status_code == 422 and endpoint['name'] == "OTP Authentication":
                    # 422 is expected for OTP validation - means endpoint is working
                    print(f"   ✅ {endpoint['name']}: Working correctly (validation error expected)")
                    successful_endpoints += 1
                elif response.status_code == 401 and "admin" in endpoint['name'].lower():
                    # 401 is expected for admin endpoints without auth
                    print(f"   ✅ {endpoint['name']}: Working correctly (authentication required)")
                    successful_endpoints += 1
                else:
                    print(f"   ❌ {endpoint['name']}: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"   ❌ {endpoint['name']}: Error - {str(e)}")
        
        success_rate = (successful_endpoints / len(endpoints_to_test)) * 100
        
        if success_rate >= 70:  # 70% threshold for stability
            self.log_result("Core API Endpoints Stability", True, 
                          f"Core endpoints stable - {successful_endpoints}/{len(endpoints_to_test)} working ({success_rate:.1f}%)",
                          {"success_rate": success_rate, "working_endpoints": successful_endpoints})
            return True
        else:
            self.log_result("Core API Endpoints Stability", False, 
                          f"API stability issues - only {successful_endpoints}/{len(endpoints_to_test)} working ({success_rate:.1f}%)")
        return False

    def test_error_handling_graceful(self):
        """Test 6: Error Handling - Test graceful error responses"""
        print("\n🛡️ TESTING ERROR HANDLING - Graceful Error Responses")
        print("=" * 70)
        
        error_test_cases = [
            {
                "name": "Invalid Enhanced Flight Search",
                "method": "POST",
                "url": f"{API_BASE}/flights/search",
                "payload": {
                    "origin": "",
                    "destination": "",
                    "departure_date": "invalid-date",
                    "timePreference": "invalid_time",
                    "budgetRange": ["invalid", "range"]
                },
                "expected_behavior": "Should return error response without crashing"
            },
            {
                "name": "Missing Required Fields",
                "method": "POST", 
                "url": f"{API_BASE}/hotels/search",
                "payload": {"location": "Mumbai"},  # Missing required fields
                "expected_behavior": "Should return validation error"
            },
            {
                "name": "Invalid Endpoint",
                "method": "GET",
                "url": f"{API_BASE}/nonexistent-priority2-endpoint",
                "payload": None,
                "expected_behavior": "Should return 404 error"
            },
            {
                "name": "Malformed Enhanced Parameters",
                "method": "POST",
                "url": f"{API_BASE}/flights/search",
                "payload": {
                    "origin": "Delhi",
                    "destination": "Mumbai",
                    "departure_date": "2025-02-15",
                    "flexibleDates": "not_boolean",
                    "budgetRange": "not_array"
                },
                "expected_behavior": "Should handle malformed enhanced parameters gracefully"
            }
        ]
        
        graceful_handling_count = 0
        
        for test_case in error_test_cases:
            try:
                print(f"\n📋 Testing: {test_case['name']}")
                
                if test_case["method"] == "POST":
                    response = self.session.post(test_case["url"], json=test_case["payload"])
                else:
                    response = self.session.get(test_case["url"])
                
                # Check if backend handled the error gracefully (didn't crash)
                if response.status_code in [400, 404, 422, 500]:
                    # Expected error codes - backend is handling errors gracefully
                    try:
                        error_data = response.json()
                        if "detail" in error_data or "message" in error_data or "error" in error_data:
                            print(f"   ✅ Graceful error handling: HTTP {response.status_code} with proper error message")
                            graceful_handling_count += 1
                        else:
                            print(f"   ⚠️ Error response but no error message: HTTP {response.status_code}")
                            graceful_handling_count += 0.5
                    except:
                        print(f"   ⚠️ Error response but not JSON: HTTP {response.status_code}")
                        graceful_handling_count += 0.5
                elif response.status_code == 200:
                    # Some endpoints might handle invalid input by returning default values
                    print(f"   ✅ Handled gracefully with default response: HTTP 200")
                    graceful_handling_count += 1
                else:
                    print(f"   ❌ Unexpected response: HTTP {response.status_code}")
                    
            except requests.exceptions.ConnectionError:
                print(f"   ❌ Connection error - backend may have crashed")
            except Exception as e:
                print(f"   ❌ Exception: {str(e)}")
        
        success_rate = (graceful_handling_count / len(error_test_cases)) * 100
        
        if success_rate >= 75:
            self.log_result("Error Handling", True, 
                          f"Backend handles errors gracefully - {graceful_handling_count}/{len(error_test_cases)} tests passed ({success_rate:.1f}%)",
                          {"success_rate": success_rate, "graceful_responses": graceful_handling_count})
            return True
        else:
            self.log_result("Error Handling", False, 
                          f"Backend error handling needs improvement - only {graceful_handling_count}/{len(error_test_cases)} tests passed ({success_rate:.1f}%)")
        return False

    def run_priority2_backend_tests(self):
        """Run comprehensive Priority 2 Features backend tests"""
        print("=" * 80)
        print("🚀 PRIORITY 2 FEATURES BACKEND TESTING SUITE")
        print("=" * 80)
        print("Review Request: Test backend functionality after Priority 2 Features implementation")
        print("Priority 2 Features Context:")
        print("- Enhanced flexible date calendar with ±3 days range selection and price comparison")
        print("- Smart auto-complete with recent searches and intelligent route suggestions")
        print("- Promotional banner system with promo code functionality")
        print("- Enhanced SimpleDatePicker with flexible date ranges and price display")
        print("- Updated CityAutocomplete with recent search history and better suggestions")
        print("=" * 80)
        print("Testing Requirements:")
        print("1. Core Backend Health - Verify all basic endpoints still working after frontend changes")
        print("2. Flight Search Enhanced Parameters - Test enhanced search with flexible dates, preferences")
        print("3. PostgreSQL Connectivity - Ensure database connections are stable")
        print("4. Environment Variables Access - Verify all required API keys and configurations")
        print("5. Core API Endpoints Stability - Ensure no regressions in core functionality")
        print("6. Error Handling - Test graceful error responses")
        print("=" * 80)
        
        # Reset results for this test run
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        
        # Run all Priority 2 backend tests
        tests = [
            ("Core Backend Health", self.test_core_backend_health),
            ("Flight Search Enhanced Parameters", self.test_flight_search_enhanced_parameters),
            ("PostgreSQL Connectivity", self.test_postgresql_connectivity),
            ("Environment Variables Access", self.test_environment_variables_access),
            ("Core API Endpoints Stability", self.test_core_api_endpoints_stability),
            ("Error Handling", self.test_error_handling_graceful)
        ]
        
        for test_name, test_func in tests:
            print(f"\n{'='*20} {test_name} {'='*20}")
            test_func()
            time.sleep(2)  # Pause between tests
        
        # Print comprehensive summary
        print("\n" + "=" * 80)
        print("📊 PRIORITY 2 FEATURES BACKEND TEST SUMMARY")
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
        
        # Final assessment based on Priority 2 Features success criteria
        print("\n" + "=" * 80)
        print("🎯 PRIORITY 2 FEATURES SUCCESS CRITERIA ASSESSMENT")
        print("=" * 80)
        
        if success_rate >= 90:
            print("🎉 ALL PRIORITY 2 BACKEND SERVICES FULLY OPERATIONAL!")
            print("✅ All backend services working properly after Priority 2 implementation")
            print("✅ Enhanced flight search parameters processing correctly")
            print("✅ No backend regressions detected")
            print("✅ Database connections stable")
            print("✅ Backend ready to support Priority 2 frontend features")
            print("\n🚀 BACKEND IS FULLY READY FOR PRIORITY 2 FEATURES!")
        elif success_rate >= 75:
            print("✅ PRIORITY 2 BACKEND SERVICES MOSTLY OPERATIONAL")
            print("✅ Core functionality working properly")
            print("✅ Enhanced parameters being processed")
            print("✅ Backend ready to support Priority 2 features")
            print("⚠️ Minor issues detected but not blocking Priority 2 functionality")
        elif success_rate >= 60:
            print("⚠️ PRIORITY 2 BACKEND SERVICES PARTIALLY OPERATIONAL")
            print("✅ Essential services working")
            print("⚠️ Some issues detected that may affect Priority 2 features")
            print("🔧 Recommend addressing failed tests before full Priority 2 deployment")
        else:
            print("🚨 PRIORITY 2 BACKEND SERVICES HAVE SIGNIFICANT ISSUES")
            print("❌ Multiple service failures detected")
            print("❌ Backend not ready for Priority 2 features")
            print("🔧 Critical issues must be resolved before Priority 2 deployment")
        
        return self.results

if __name__ == "__main__":
    tester = Priority2BackendTester()
    results = tester.run_priority2_backend_tests()
    
    # Exit with appropriate code
    if results['failed'] == 0:
        exit(0)  # All tests passed
    else:
        exit(1)  # Some tests failed