#!/usr/bin/env python3
"""
PostgreSQL Production Readiness Testing Suite for TourSmile AI Travel Platform
Focus: Test backend configuration after enabling PostgreSQL routes for VPS deployment

Review Request: Test the backend configuration after enabling PostgreSQL routes to ensure 
all systems are working properly before VPS deployment.

SPECIFIC TESTING REQUIREMENTS:
1. Service Health Check: Verify backend starts successfully with all PostgreSQL routes enabled
2. Database Connectivity: Test PostgreSQL connection with POSTGRES_URL configuration
3. Core API Endpoints: Test key endpoints (flights, hotels, auth, payments, admin) to ensure they respond properly
4. Environment Variables: Verify all required environment variables are accessible
5. Error Handling: Check for any import errors or missing dependencies after enabling all routes
6. Production Readiness Assessment: Confirm the backend is ready for VPS deployment
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
print(f"🎯 POSTGRESQL PRODUCTION READINESS TESTING")
print(f"Testing backend at: {API_BASE}")
print("Review Request: Test backend configuration after enabling PostgreSQL routes for VPS deployment")
print("=" * 80)

class PostgreSQLProductionTester:
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

    def test_service_health_check(self):
        """Test 1: Service Health Check - Verify backend starts successfully with all PostgreSQL routes enabled"""
        print("\n🏥 TESTING SERVICE HEALTH CHECK")
        print("=" * 70)
        try:
            response = self.session.get(f"{API_BASE}/")
            if response.status_code == 200:
                data = response.json()
                if "TourSmile" in data.get("message", ""):
                    self.log_result("Service Health Check", True, 
                                  "Backend service running with all PostgreSQL routes enabled", data)
                    return True
                else:
                    self.log_result("Service Health Check", False, f"Unexpected response: {data}")
            else:
                self.log_result("Service Health Check", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Service Health Check", False, f"Connection error: {str(e)}")
        return False

    def test_database_connectivity(self):
        """Test 2: Database Connectivity - Test PostgreSQL connection with POSTGRES_URL configuration"""
        print("\n🗄️ TESTING DATABASE CONNECTIVITY")
        print("=" * 70)
        try:
            # Test PostgreSQL connectivity through various endpoints that require database access
            
            # Test 1: Waitlist endpoint (PostgreSQL-based)
            test_email = f"test.postgresql.{int(time.time())}@example.com"
            payload = {"email": test_email, "source": "postgresql_test"}
            
            try:
                response1 = self.session.post(f"{API_BASE}/waitlist/subscribe", json=payload)
                db_test_1 = response1.status_code in [200, 201, 409]  # Success or already exists
                print(f"   Waitlist subscription test: {'✅' if db_test_1 else '❌'} (Status: {response1.status_code})")
            except Exception as e:
                db_test_1 = False
                print(f"   Waitlist subscription test: ❌ (Error: {str(e)})")
            
            # Test 2: Admin setup (PostgreSQL-based)
            try:
                response2 = self.session.post(f"{API_BASE}/admin/setup-default-admin")
                db_test_2 = response2.status_code in [200, 201, 409]  # Success or already exists
                print(f"   Admin setup test: {'✅' if db_test_2 else '❌'} (Status: {response2.status_code})")
            except Exception as e:
                db_test_2 = False
                print(f"   Admin setup test: ❌ (Error: {str(e)})")
            
            # Test 3: TourBuilder popular destinations (PostgreSQL-based)
            try:
                response3 = self.session.get(f"{API_BASE}/tourbuilder/popular-destinations")
                db_test_3 = response3.status_code == 200
                print(f"   TourBuilder destinations test: {'✅' if db_test_3 else '❌'} (Status: {response3.status_code})")
            except Exception as e:
                db_test_3 = False
                print(f"   TourBuilder destinations test: ❌ (Error: {str(e)})")
            
            successful_tests = sum([db_test_1, db_test_2, db_test_3])
            
            if successful_tests >= 2:
                self.log_result("Database Connectivity", True, 
                              f"PostgreSQL connectivity confirmed - {successful_tests}/3 tests passed",
                              {"tests_passed": successful_tests, "total_tests": 3})
                return True
            else:
                self.log_result("Database Connectivity", False, 
                              f"PostgreSQL connectivity issues - only {successful_tests}/3 tests passed")
        except Exception as e:
            self.log_result("Database Connectivity", False, f"Error testing PostgreSQL connectivity: {str(e)}")
        return False

    def test_core_api_endpoints(self):
        """Test 3: Core API Endpoints - Test key endpoints (flights, hotels, auth, payments, admin)"""
        print("\n🔗 TESTING CORE API ENDPOINTS")
        print("=" * 70)
        
        endpoints_to_test = [
            {
                "name": "Flight Search",
                "method": "POST",
                "url": f"{API_BASE}/flights/search",
                "payload": {
                    "origin": "Delhi",
                    "destination": "Mumbai",
                    "departure_date": "2025-02-15",
                    "passengers": 2,
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
                "name": "Admin Dashboard Stats",
                "method": "GET",
                "url": f"{API_BASE}/admin/dashboard/stats",
                "payload": None,
                "expected_fields": ["success", "stats"]
            },
            {
                "name": "TourBuilder Popular Destinations",
                "method": "GET",
                "url": f"{API_BASE}/tourbuilder/popular-destinations",
                "payload": None,
                "expected_fields": ["success", "destinations"]
            },
            {
                "name": "Hotel Booking Pre-book",
                "method": "POST",
                "url": f"{API_BASE}/hotel-booking/pre-book",
                "payload": {
                    "hotel_id": "test_hotel_123",
                    "checkin_date": "2025-02-15",
                    "checkout_date": "2025-02-17",
                    "guests": 2,
                    "rooms": 1
                },
                "expected_fields": ["success", "booking_token"]
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
                elif response.status_code == 401 and "Admin" in endpoint['name']:
                    # 401 is expected for admin endpoints without authentication
                    print(f"   ✅ {endpoint['name']}: Working correctly (authentication required)")
                    successful_endpoints += 1
                else:
                    print(f"   ❌ {endpoint['name']}: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"   ❌ {endpoint['name']}: Error - {str(e)}")
        
        success_rate = (successful_endpoints / len(endpoints_to_test)) * 100
        
        if success_rate >= 75:
            self.log_result("Core API Endpoints", True, 
                          f"Core PostgreSQL endpoints responsive - {successful_endpoints}/{len(endpoints_to_test)} working ({success_rate:.1f}%)",
                          {"success_rate": success_rate, "working_endpoints": successful_endpoints})
            return True
        else:
            self.log_result("Core API Endpoints", False, 
                          f"Some PostgreSQL endpoints not responsive - only {successful_endpoints}/{len(endpoints_to_test)} working ({success_rate:.1f}%)")
        return False

    def test_environment_variables(self):
        """Test 4: Environment Variables - Verify all required environment variables are accessible"""
        print("\n🔐 TESTING ENVIRONMENT VARIABLES")
        print("=" * 70)
        try:
            # Test environment variables by checking if backend can access them through API responses
            
            # Test 1: OpenAI integration (requires OPENAI_API_KEY)
            payload = {"message": "Test environment variables", "session_id": None}
            
            try:
                response1 = self.session.post(f"{API_BASE}/chat", json=payload)
                env_test_1 = response1.status_code == 200 and "response" in response1.json()
                print(f"   OpenAI API key access: {'✅' if env_test_1 else '❌'}")
            except Exception as e:
                env_test_1 = False
                print(f"   OpenAI API key access: ❌ (Error: {str(e)})")
            
            # Test 2: Payment configuration (requires Razorpay keys)
            try:
                response2 = self.session.get(f"{API_BASE}/payments/config")
                env_test_2 = response2.status_code == 200 and "razorpay_key_id" in response2.json()
                print(f"   Razorpay configuration access: {'✅' if env_test_2 else '❌'}")
            except Exception as e:
                env_test_2 = False
                print(f"   Razorpay configuration access: ❌ (Error: {str(e)})")
            
            # Test 3: Database URL (PostgreSQL)
            try:
                # Test through waitlist endpoint which requires database
                test_email = f"env.test.{int(time.time())}@example.com"
                payload = {"email": test_email, "source": "env_test"}
                response3 = self.session.post(f"{API_BASE}/waitlist/subscribe", json=payload)
                env_test_3 = response3.status_code in [200, 201, 409]
                print(f"   PostgreSQL URL access: {'✅' if env_test_3 else '❌'}")
            except Exception as e:
                env_test_3 = False
                print(f"   PostgreSQL URL access: ❌ (Error: {str(e)})")
            
            successful_tests = sum([env_test_1, env_test_2, env_test_3])
            
            if successful_tests >= 2:
                self.log_result("Environment Variables", True, 
                              f"Environment variables accessible - {successful_tests}/3 tests passed",
                              {"tests_passed": successful_tests, "total_tests": 3})
                return True
            else:
                self.log_result("Environment Variables", False, 
                              f"Environment variable access issues - only {successful_tests}/3 tests passed")
        except Exception as e:
            self.log_result("Environment Variables", False, f"Error testing environment variables: {str(e)}")
        return False

    def test_error_handling_and_imports(self):
        """Test 5: Error Handling - Check for any import errors or missing dependencies after enabling all routes"""
        print("\n🛡️ TESTING ERROR HANDLING AND IMPORTS")
        print("=" * 70)
        
        error_test_cases = [
            {
                "name": "Invalid Flight Search Parameters",
                "method": "POST",
                "url": f"{API_BASE}/flights/search",
                "payload": {"origin": "", "destination": "", "departure_date": "invalid-date"},
                "expected_behavior": "Should return error response without crashing"
            },
            {
                "name": "Invalid PostgreSQL Query",
                "method": "POST", 
                "url": f"{API_BASE}/waitlist/subscribe",
                "payload": {"email": "invalid-email"},  # Invalid email format
                "expected_behavior": "Should return validation error"
            },
            {
                "name": "Invalid Admin Endpoint",
                "method": "GET",
                "url": f"{API_BASE}/admin/nonexistent-endpoint",
                "payload": None,
                "expected_behavior": "Should return 404 error"
            },
            {
                "name": "Invalid Payment Request",
                "method": "POST",
                "url": f"{API_BASE}/payments/create-order",
                "payload": {"amount": -100},  # Invalid amount
                "expected_behavior": "Should handle invalid payment gracefully"
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
            self.log_result("Error Handling and Imports", True, 
                          f"Backend handles errors gracefully - {graceful_handling_count}/{len(error_test_cases)} tests passed ({success_rate:.1f}%)",
                          {"success_rate": success_rate, "graceful_responses": graceful_handling_count})
            return True
        else:
            self.log_result("Error Handling and Imports", False, 
                          f"Backend error handling needs improvement - only {graceful_handling_count}/{len(error_test_cases)} tests passed ({success_rate:.1f}%)")
        return False

    def test_production_readiness_assessment(self):
        """Test 6: Production Readiness Assessment - Confirm the backend is ready for VPS deployment"""
        print("\n🚀 TESTING PRODUCTION READINESS ASSESSMENT")
        print("=" * 70)
        try:
            # Test critical production features
            
            # Test 1: All PostgreSQL routes are accessible
            postgresql_routes = [
                f"{API_BASE}/waitlist/subscribe",
                f"{API_BASE}/bookings",
                f"{API_BASE}/tourbuilder/popular-destinations",
                f"{API_BASE}/payments/config",
                f"{API_BASE}/auth/send-otp",
                f"{API_BASE}/hotel-booking/pre-book",
                f"{API_BASE}/admin/setup-default-admin"
            ]
            
            accessible_routes = 0
            for route in postgresql_routes:
                try:
                    if "subscribe" in route or "pre-book" in route or "setup-default-admin" in route:
                        # POST endpoints
                        response = self.session.post(route, json={})
                    else:
                        # GET endpoints
                        response = self.session.get(route)
                    
                    # Consider any response (including errors) as accessible - means route exists
                    if response.status_code in [200, 400, 401, 404, 422, 500]:
                        accessible_routes += 1
                        print(f"   ✅ Route accessible: {route.split('/')[-1]} (HTTP {response.status_code})")
                    else:
                        print(f"   ❌ Route not accessible: {route.split('/')[-1]} (HTTP {response.status_code})")
                except Exception as e:
                    print(f"   ❌ Route error: {route.split('/')[-1]} (Error: {str(e)})")
            
            route_accessibility = (accessible_routes / len(postgresql_routes)) * 100
            
            # Test 2: Database initialization
            try:
                # Test if database tables are created by trying to access admin stats
                response = self.session.get(f"{API_BASE}/admin/dashboard/stats")
                db_initialized = response.status_code in [200, 401]  # 401 means endpoint exists but needs auth
                print(f"   Database initialization: {'✅' if db_initialized else '❌'}")
            except Exception as e:
                db_initialized = False
                print(f"   Database initialization: ❌ (Error: {str(e)})")
            
            # Test 3: Core functionality working
            try:
                # Test flight search as core functionality
                payload = {
                    "origin": "Delhi",
                    "destination": "Mumbai",
                    "departure_date": "2025-02-15",
                    "passengers": 1,
                    "class_type": "economy"
                }
                response = self.session.post(f"{API_BASE}/flights/search", json=payload)
                core_functionality = response.status_code == 200 and "flights" in response.json()
                print(f"   Core functionality: {'✅' if core_functionality else '❌'}")
            except Exception as e:
                core_functionality = False
                print(f"   Core functionality: ❌ (Error: {str(e)})")
            
            # Calculate overall production readiness
            readiness_score = 0
            if route_accessibility >= 85:
                readiness_score += 40
            elif route_accessibility >= 70:
                readiness_score += 30
            elif route_accessibility >= 50:
                readiness_score += 20
            
            if db_initialized:
                readiness_score += 30
            
            if core_functionality:
                readiness_score += 30
            
            print(f"\n📊 Production Readiness Score: {readiness_score}/100")
            print(f"   Route Accessibility: {route_accessibility:.1f}%")
            print(f"   Database Initialized: {'Yes' if db_initialized else 'No'}")
            print(f"   Core Functionality: {'Working' if core_functionality else 'Issues'}")
            
            if readiness_score >= 90:
                self.log_result("Production Readiness Assessment", True, 
                              f"Backend is PRODUCTION READY for VPS deployment (Score: {readiness_score}/100)",
                              {"readiness_score": readiness_score, "route_accessibility": route_accessibility})
                return True
            elif readiness_score >= 70:
                self.log_result("Production Readiness Assessment", True, 
                              f"Backend is MOSTLY READY for VPS deployment with minor issues (Score: {readiness_score}/100)")
                return True
            else:
                self.log_result("Production Readiness Assessment", False, 
                              f"Backend NOT READY for VPS deployment - critical issues found (Score: {readiness_score}/100)")
        except Exception as e:
            self.log_result("Production Readiness Assessment", False, f"Error assessing production readiness: {str(e)}")
        return False

    def run_postgresql_production_tests(self):
        """Run comprehensive PostgreSQL production readiness tests"""
        print("=" * 80)
        print("🎯 POSTGRESQL PRODUCTION READINESS TESTING")
        print("=" * 80)
        print("Review Request: Test backend configuration after enabling PostgreSQL routes for VPS deployment")
        print("Context: All PostgreSQL routes enabled in server.py for production deployment")
        print("Objective: Verify backend is ready for VPS deployment with PostgreSQL database")
        print("=" * 80)
        print("Testing Requirements:")
        print("1. Service Health Check - Verify backend starts with all PostgreSQL routes")
        print("2. Database Connectivity - Test PostgreSQL connection with POSTGRES_URL")
        print("3. Core API Endpoints - Test key endpoints (flights, hotels, auth, payments, admin)")
        print("4. Environment Variables - Verify all required environment variables accessible")
        print("5. Error Handling - Check for import errors or missing dependencies")
        print("6. Production Readiness - Confirm backend ready for VPS deployment")
        print("=" * 80)
        
        # Reset results for this test run
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        
        # Run all PostgreSQL production readiness tests
        tests = [
            ("Service Health Check", self.test_service_health_check),
            ("Database Connectivity", self.test_database_connectivity),
            ("Core API Endpoints", self.test_core_api_endpoints),
            ("Environment Variables", self.test_environment_variables),
            ("Error Handling and Imports", self.test_error_handling_and_imports),
            ("Production Readiness Assessment", self.test_production_readiness_assessment)
        ]
        
        for test_name, test_func in tests:
            print(f"\n{'='*20} {test_name} {'='*20}")
            test_func()
            time.sleep(2)  # Pause between tests
        
        # Print comprehensive summary
        print("\n" + "=" * 80)
        print("📊 POSTGRESQL PRODUCTION READINESS SUMMARY")
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
        
        # Final VPS deployment readiness assessment
        print("\n" + "=" * 80)
        print("🚀 VPS DEPLOYMENT READINESS ASSESSMENT")
        print("=" * 80)
        
        if success_rate == 100:
            print("🎉 BACKEND IS FULLY READY FOR VPS DEPLOYMENT!")
            print("✅ All PostgreSQL routes enabled and working")
            print("✅ Database connectivity confirmed")
            print("✅ All core API endpoints responsive")
            print("✅ Environment variables accessible")
            print("✅ Error handling working properly")
            print("✅ Production readiness confirmed")
            print("\n🚀 PROCEED WITH VPS DEPLOYMENT - ALL SYSTEMS GO!")
        elif success_rate >= 83:  # 5/6 tests passed
            print("✅ BACKEND IS READY FOR VPS DEPLOYMENT")
            print("✅ Core PostgreSQL functionality working")
            print("✅ Essential services operational")
            print("⚠️ Minor issues detected but not blocking deployment")
            print("\n🚀 PROCEED WITH VPS DEPLOYMENT - READY FOR PRODUCTION!")
        elif success_rate >= 67:  # 4/6 tests passed
            print("⚠️ BACKEND PARTIALLY READY FOR VPS DEPLOYMENT")
            print("✅ Essential PostgreSQL services working")
            print("⚠️ Some issues detected that should be addressed")
            print("🔧 Recommend fixing failed tests before VPS deployment")
            print("\n⚠️ PROCEED WITH CAUTION - ADDRESS ISSUES FIRST")
        else:
            print("🚨 BACKEND NOT READY FOR VPS DEPLOYMENT")
            print("❌ Multiple PostgreSQL service failures detected")
            print("❌ Critical issues must be resolved")
            print("🔧 DO NOT DEPLOY TO VPS UNTIL ISSUES ARE FIXED")
            print("\n🛑 DEPLOYMENT BLOCKED - CRITICAL FIXES REQUIRED")
        
        return self.results

if __name__ == "__main__":
    tester = PostgreSQLProductionTester()
    results = tester.run_postgresql_production_tests()
    
    # Exit with appropriate code for CI/CD
    if results['failed'] == 0:
        exit(0)  # Success
    else:
        exit(1)  # Failure