#!/usr/bin/env python3
"""
TBO FLIGHT API AUTHENTICATION AND INTEGRATION TEST
Testing TBO Flight API authentication and integration with the updated credentials provided by TBO support.

**Updated TBO Credentials:**
- Username: Smile
- Password: Smile@123
- Status: Confirmed working at TBO's end for Authentication and Hotel APIs

**Test Requirements:**
1. Test TBO authentication endpoint with these exact credentials
2. Verify the request format matches TBO's expectations
3. Test flight search functionality if authentication succeeds
4. Check backend flight search endpoint (/api/flights/search) with Delhi to Mumbai sample data
5. Verify environment variables are properly configured
6. Test both the staging demo URL and any alternative endpoints

**Expected Results:**
- Valid TokenId should be returned from authentication
- Flight search should return real TBO data instead of mock data
- Backend endpoints should integrate properly with TBO API
"""

import requests
import json
import time
import sys
import os
from typing import Dict, List, Any
import httpx
import asyncio

# Backend URL from environment
BACKEND_URL = "https://flywise-search.preview.emergentagent.com/api"

# TBO API Configuration - Updated credentials from review request
TBO_USERNAME = "Smile"
TBO_PASSWORD = "Smile@123"
TBO_CLIENT_ID = "ApiIntegrationNew"

# TBO API URLs to test
TBO_URLS = {
    "staging_demo": "https://Tboairdemo.techmaster.in/API/API/v1",
    "auth_staging": "https://Tboairdemo.techmaster.in/API/API/v1/Authenticate/ValidateAgency",
    "production": "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest",
    "auth_production": "http://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate"
}

class TBOReviewTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.test_results = []
        self.successful_auth_token = None
        self.successful_auth_endpoint = None
        
    def log_test(self, test_name: str, success: bool, details: str, response_time: float = None, response_data: dict = None):
        """Log test result with detailed response data"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_time": response_time,
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        time_info = f" ({response_time:.3f}s)" if response_time else ""
        print(f"{status}: {test_name}{time_info}")
        print(f"   {details}")
        if response_data and len(str(response_data)) < 500:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
        print()
        
    def test_backend_health(self):
        """Test if backend is responding"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.backend_url}/", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                self.log_test("Backend Health Check", True, 
                            f"Backend responding correctly (HTTP {response.status_code})", response_time)
                return True
            else:
                self.log_test("Backend Health Check", False, 
                            f"Backend returned HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Backend Health Check", False, f"Backend connection failed: {str(e)}")
            return False
    
    def test_environment_variables(self):
        """Test 5: Verify environment variables are properly configured"""
        print("🔍 TEST 1: ENVIRONMENT VARIABLES VERIFICATION")
        print("=" * 80)
        
        # Check backend environment variables by making a request that would use them
        try:
            # Make a request to trigger TBO service initialization
            start_time = time.time()
            response = requests.post(f"{self.backend_url}/flights/search", 
                                   json={
                                       "origin": "DEL",
                                       "destination": "BOM",
                                       "departure_date": "2025-02-15",
                                       "passengers": 1,
                                       "class_type": "economy"
                                   }, timeout=30)
            response_time = time.time() - start_time
            
            # Check if backend is using TBO credentials
            if response.status_code == 200:
                data = response.json()
                data_source = data.get("data_source", "unknown")
                
                if "tbo" in data_source.lower():
                    self.log_test("Environment Variables - TBO Integration", True, 
                                f"Backend successfully using TBO credentials, data source: {data_source}", 
                                response_time)
                elif "mock" in data_source.lower():
                    self.log_test("Environment Variables - TBO Integration", False, 
                                f"Backend falling back to mock data, TBO credentials may not be configured", 
                                response_time)
                else:
                    self.log_test("Environment Variables - TBO Integration", False, 
                                f"Backend using unknown data source: {data_source}", 
                                response_time)
            else:
                self.log_test("Environment Variables - TBO Integration", False, 
                            f"Backend flight search failed: HTTP {response.status_code}", 
                            response_time)
                
        except Exception as e:
            self.log_test("Environment Variables - TBO Integration", False, 
                        f"Environment variable test failed: {str(e)}")
        
        # Display expected environment variables
        expected_vars = {
            "TBO_USERNAME": TBO_USERNAME,
            "TBO_PASSWORD": TBO_PASSWORD,
            "TBO_CLIENT_ID": TBO_CLIENT_ID,
            "TBO_BASE_URL": TBO_URLS["staging_demo"],
            "TBO_AUTH_URL": TBO_URLS["auth_staging"]
        }
        
        print("🔑 Expected TBO Environment Variables:")
        for var, value in expected_vars.items():
            print(f"   {var}={value}")
        print()
    
    def test_tbo_authentication_staging(self):
        """Test 1: TBO authentication endpoint with exact credentials - Staging Demo URL"""
        print("🔍 TEST 2: TBO AUTHENTICATION - STAGING DEMO URL")
        print("=" * 80)
        
        # Test the staging demo URL from review request
        auth_url = TBO_URLS["auth_staging"]
        
        # Exact payload format for TBO staging
        auth_payload = {
            "ClientId": TBO_CLIENT_ID,
            "UserName": TBO_USERNAME,
            "Password": TBO_PASSWORD,
            "EndUserIp": "192.168.1.1"
        }
        
        try:
            start_time = time.time()
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            print(f"🌐 Testing TBO Staging Authentication URL: {auth_url}")
            print(f"📦 Payload: {json.dumps(auth_payload, indent=2)}")
            
            response = requests.post(auth_url, 
                                   json=auth_payload, 
                                   headers=headers,
                                   timeout=30)
            response_time = time.time() - start_time
            
            print(f"📊 Response Status: {response.status_code}")
            print(f"📊 Response Headers: {dict(response.headers)}")
            
            try:
                response_data = response.json()
                print(f"📊 Response JSON: {json.dumps(response_data, indent=2)}")
            except:
                response_data = {"raw_text": response.text}
                print(f"📊 Response Text: {response.text}")
            
            if response.status_code == 200:
                # Check for various token field names
                token_fields = ["TokenId", "token", "authToken", "Token", "access_token"]
                token_found = None
                
                for field in token_fields:
                    if isinstance(response_data, dict) and field in response_data:
                        token_found = response_data[field]
                        break
                
                if token_found:
                    self.successful_auth_token = token_found
                    self.successful_auth_endpoint = auth_url
                    self.log_test("TBO Staging Authentication", True, 
                                f"Authentication successful! Token: {token_found[:20]}...", 
                                response_time, response_data)
                    return response_data
                else:
                    self.log_test("TBO Staging Authentication", False, 
                                f"Authentication response missing token field", 
                                response_time, response_data)
            else:
                self.log_test("TBO Staging Authentication", False, 
                            f"HTTP {response.status_code}: {response.text}", 
                            response_time, response_data)
                
        except requests.exceptions.Timeout:
            self.log_test("TBO Staging Authentication", False, 
                        f"Request timeout after 30 seconds")
        except requests.exceptions.ConnectionError as e:
            self.log_test("TBO Staging Authentication", False, 
                        f"Connection error: {str(e)}")
        except Exception as e:
            self.log_test("TBO Staging Authentication", False, 
                        f"Request failed: {str(e)}")
        
        return None
    
    def test_tbo_authentication_production(self):
        """Test 2: TBO authentication endpoint - Production URL"""
        print("🔍 TEST 3: TBO AUTHENTICATION - PRODUCTION URL")
        print("=" * 80)
        
        # Test the production URL as alternative
        auth_url = TBO_URLS["auth_production"]
        
        auth_payload = {
            "ClientId": TBO_CLIENT_ID,
            "UserName": TBO_USERNAME,
            "Password": TBO_PASSWORD,
            "EndUserIp": "192.168.1.1"
        }
        
        try:
            start_time = time.time()
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            print(f"🌐 Testing TBO Production Authentication URL: {auth_url}")
            
            response = requests.post(auth_url, 
                                   json=auth_payload, 
                                   headers=headers,
                                   timeout=30)
            response_time = time.time() - start_time
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_text": response.text}
            
            if response.status_code == 200:
                token_fields = ["TokenId", "token", "authToken", "Token", "access_token"]
                token_found = None
                
                for field in token_fields:
                    if isinstance(response_data, dict) and field in response_data:
                        token_found = response_data[field]
                        break
                
                if token_found:
                    if not self.successful_auth_token:  # Only set if staging didn't work
                        self.successful_auth_token = token_found
                        self.successful_auth_endpoint = auth_url
                    self.log_test("TBO Production Authentication", True, 
                                f"Authentication successful! Token: {token_found[:20]}...", 
                                response_time, response_data)
                    return response_data
                else:
                    self.log_test("TBO Production Authentication", False, 
                                f"Authentication response missing token field", 
                                response_time, response_data)
            else:
                self.log_test("TBO Production Authentication", False, 
                            f"HTTP {response.status_code}: {response.text}", 
                            response_time, response_data)
                
        except Exception as e:
            self.log_test("TBO Production Authentication", False, 
                        f"Request failed: {str(e)}")
        
        return None
    
    def test_request_format_verification(self):
        """Test 2: Verify the request format matches TBO's expectations"""
        print("🔍 TEST 4: REQUEST FORMAT VERIFICATION")
        print("=" * 80)
        
        # Test different request formats to find the correct one
        request_formats = [
            {
                "name": "Standard JSON Format",
                "payload": {
                    "ClientId": TBO_CLIENT_ID,
                    "UserName": TBO_USERNAME,
                    "Password": TBO_PASSWORD,
                    "EndUserIp": "192.168.1.1"
                },
                "headers": {"Content-Type": "application/json"}
            },
            {
                "name": "BookingMode Format",
                "payload": {
                    "BookingMode": "API",
                    "UserName": TBO_USERNAME,
                    "Password": TBO_PASSWORD,
                    "IPAddress": "192.168.1.1"
                },
                "headers": {"Content-Type": "application/json"}
            },
            {
                "name": "Alternative Field Names",
                "payload": {
                    "clientId": TBO_CLIENT_ID,
                    "userName": TBO_USERNAME,
                    "password": TBO_PASSWORD,
                    "endUserIp": "192.168.1.1"
                },
                "headers": {"Content-Type": "application/json"}
            }
        ]
        
        for format_test in request_formats:
            for auth_url in [TBO_URLS["auth_staging"], TBO_URLS["auth_production"]]:
                test_name = f"Format: {format_test['name']} - URL: {auth_url.split('/')[-1]}"
                
                try:
                    start_time = time.time()
                    response = requests.post(auth_url, 
                                           json=format_test["payload"], 
                                           headers=format_test["headers"],
                                           timeout=20)
                    response_time = time.time() - start_time
                    
                    try:
                        response_data = response.json()
                    except:
                        response_data = {"raw_text": response.text[:200]}
                    
                    if response.status_code == 200:
                        token_fields = ["TokenId", "token", "authToken", "Token", "access_token"]
                        token_found = any(field in response_data for field in token_fields if isinstance(response_data, dict))
                        
                        if token_found:
                            self.log_test(test_name, True, 
                                        f"Format works! HTTP {response.status_code}", 
                                        response_time, response_data)
                        else:
                            self.log_test(test_name, False, 
                                        f"HTTP 200 but no token found", 
                                        response_time, response_data)
                    else:
                        self.log_test(test_name, False, 
                                    f"HTTP {response.status_code}", 
                                    response_time, response_data)
                        
                except Exception as e:
                    self.log_test(test_name, False, f"Request failed: {str(e)}")
    
    def test_flight_search_functionality(self):
        """Test 3: Test flight search functionality if authentication succeeds"""
        print("🔍 TEST 5: FLIGHT SEARCH FUNCTIONALITY")
        print("=" * 80)
        
        if not self.successful_auth_token:
            self.log_test("Flight Search - Authentication Required", False, 
                        "Cannot test flight search - no valid authentication token obtained")
            return
        
        # Test flight search with successful token
        base_url = self.successful_auth_endpoint.replace("/Authenticate/ValidateAgency", "").replace("/rest/Authenticate", "")
        search_url = f"{base_url}/Search"
        
        # Delhi to Mumbai flight search as requested
        search_payload = {
            "EndUserIp": "192.168.1.1",
            "TokenId": self.successful_auth_token,
            "AdultCount": 1,
            "ChildCount": 0,
            "InfantCount": 0,
            "DirectFlight": "false",
            "OneStopFlight": "false",
            "JourneyType": "1",  # One way
            "PreferredAirlines": None,
            "Segments": [
                {
                    "Origin": "DEL",
                    "Destination": "BOM",
                    "FlightCabinClass": "1",  # Economy
                    "PreferredDepartureTime": "2025-02-15T00:00:00",
                    "PreferredArrivalTime": "2025-02-15T23:59:59"
                }
            ]
        }
        
        try:
            start_time = time.time()
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            print(f"🌐 Testing Flight Search URL: {search_url}")
            print(f"📦 Search Payload: {json.dumps(search_payload, indent=2)}")
            
            response = requests.post(search_url, 
                                   json=search_payload, 
                                   headers=headers,
                                   timeout=60)
            response_time = time.time() - start_time
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_text": response.text[:500]}
            
            if response.status_code == 200:
                # Check for flight results
                if isinstance(response_data, dict):
                    # Look for various result structures
                    results_found = False
                    flight_count = 0
                    
                    # Check common TBO response structures
                    if "Response" in response_data and "Results" in response_data["Response"]:
                        results = response_data["Response"]["Results"]
                        if results and len(results) > 0:
                            results_found = True
                            flight_count = sum(len(group) for group in results if isinstance(group, list))
                    elif "Results" in response_data:
                        results = response_data["Results"]
                        if results and len(results) > 0:
                            results_found = True
                            flight_count = len(results)
                    elif "flights" in response_data:
                        flights = response_data["flights"]
                        if flights and len(flights) > 0:
                            results_found = True
                            flight_count = len(flights)
                    
                    if results_found:
                        self.log_test("Flight Search - Delhi to Mumbai", True, 
                                    f"Flight search successful! Found {flight_count} flights", 
                                    response_time, {"flight_count": flight_count, "status": "success"})
                    else:
                        self.log_test("Flight Search - Delhi to Mumbai", False, 
                                    f"Flight search returned no results", 
                                    response_time, response_data)
                else:
                    self.log_test("Flight Search - Delhi to Mumbai", False, 
                                f"Invalid response format", 
                                response_time, response_data)
            else:
                self.log_test("Flight Search - Delhi to Mumbai", False, 
                            f"HTTP {response.status_code}: {response.text[:200]}", 
                            response_time, response_data)
                
        except Exception as e:
            self.log_test("Flight Search - Delhi to Mumbai", False, 
                        f"Flight search failed: {str(e)}")
    
    def test_backend_flight_search_endpoint(self):
        """Test 4: Check backend flight search endpoint with Delhi to Mumbai sample data"""
        print("🔍 TEST 6: BACKEND FLIGHT SEARCH ENDPOINT")
        print("=" * 80)
        
        # Test backend flight search endpoint as requested
        search_data = {
            "origin": "Delhi",
            "destination": "Mumbai", 
            "departure_date": "2025-02-15",
            "passengers": 1,
            "class_type": "economy"
        }
        
        try:
            start_time = time.time()
            response = requests.post(f"{self.backend_url}/flights/search", 
                                   json=search_data, 
                                   timeout=60)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                data_source = data.get("data_source", "unknown")
                
                print(f"📊 Backend Response: {json.dumps(data, indent=2)}")
                
                if "tbo" in data_source.lower():
                    self.log_test("Backend Flight Search - TBO Integration", True, 
                                f"Backend successfully using TBO API! Found {len(flights)} flights, source: {data_source}", 
                                response_time, {"flight_count": len(flights), "data_source": data_source})
                elif "mock" in data_source.lower():
                    self.log_test("Backend Flight Search - TBO Integration", False, 
                                f"Backend falling back to mock data, TBO integration not working. Found {len(flights)} flights, source: {data_source}", 
                                response_time, {"flight_count": len(flights), "data_source": data_source})
                else:
                    self.log_test("Backend Flight Search - TBO Integration", False, 
                                f"Backend using unknown data source: {data_source}. Found {len(flights)} flights", 
                                response_time, {"flight_count": len(flights), "data_source": data_source})
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"raw_text": response.text}
                
                self.log_test("Backend Flight Search - TBO Integration", False, 
                            f"Backend flight search failed: HTTP {response.status_code}", 
                            response_time, error_data)
                
        except Exception as e:
            self.log_test("Backend Flight Search - TBO Integration", False, 
                        f"Backend flight search failed: {str(e)}")
    
    def test_alternative_endpoints(self):
        """Test 6: Test both the staging demo URL and any alternative endpoints"""
        print("🔍 TEST 7: ALTERNATIVE ENDPOINTS TESTING")
        print("=" * 80)
        
        # Test all available TBO endpoints
        alternative_endpoints = [
            {
                "name": "TBO Staging Demo",
                "auth_url": "https://Tboairdemo.techmaster.in/API/API/v1/Authenticate/ValidateAgency",
                "base_url": "https://Tboairdemo.techmaster.in/API/API/v1"
            },
            {
                "name": "TBO Production REST",
                "auth_url": "http://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate",
                "base_url": "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest"
            },
            {
                "name": "TBO Alternative Format",
                "auth_url": "http://api.tektravels.com/SharedServices/SharedData.svc/Authenticate",
                "base_url": "http://api.tektravels.com/BookingEngineService_Air/AirService.svc"
            }
        ]
        
        for endpoint in alternative_endpoints:
            auth_payload = {
                "ClientId": TBO_CLIENT_ID,
                "UserName": TBO_USERNAME,
                "Password": TBO_PASSWORD,
                "EndUserIp": "192.168.1.1"
            }
            
            try:
                start_time = time.time()
                response = requests.post(endpoint["auth_url"], 
                                       json=auth_payload, 
                                       headers={"Content-Type": "application/json"},
                                       timeout=30)
                response_time = time.time() - start_time
                
                try:
                    response_data = response.json()
                except:
                    response_data = {"raw_text": response.text[:200]}
                
                if response.status_code == 200:
                    token_fields = ["TokenId", "token", "authToken", "Token", "access_token"]
                    token_found = any(field in response_data for field in token_fields if isinstance(response_data, dict))
                    
                    if token_found:
                        self.log_test(f"Alternative Endpoint - {endpoint['name']}", True, 
                                    f"Endpoint working! URL: {endpoint['auth_url']}", 
                                    response_time, {"endpoint": endpoint["name"], "status": "success"})
                    else:
                        self.log_test(f"Alternative Endpoint - {endpoint['name']}", False, 
                                    f"HTTP 200 but no token. URL: {endpoint['auth_url']}", 
                                    response_time, response_data)
                else:
                    self.log_test(f"Alternative Endpoint - {endpoint['name']}", False, 
                                f"HTTP {response.status_code}. URL: {endpoint['auth_url']}", 
                                response_time, response_data)
                    
            except Exception as e:
                self.log_test(f"Alternative Endpoint - {endpoint['name']}", False, 
                            f"Failed. URL: {endpoint['auth_url']}, Error: {str(e)}")
    
    def generate_comprehensive_summary(self):
        """Generate comprehensive test summary"""
        print("\n" + "=" * 100)
        print("🎯 TBO FLIGHT API AUTHENTICATION AND INTEGRATION TEST SUMMARY")
        print("=" * 100)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)")
        print()
        
        # Analyze authentication results
        auth_success = False
        flight_search_success = False
        backend_integration_success = False
        
        for result in self.test_results:
            if "Authentication" in result["test"] and result["success"]:
                auth_success = True
            elif "Flight Search" in result["test"] and "Backend" not in result["test"] and result["success"]:
                flight_search_success = True
            elif "Backend" in result["test"] and "TBO" in result["details"] and result["success"]:
                backend_integration_success = True
        
        # Critical findings
        print("🔍 CRITICAL FINDINGS:")
        print("=" * 50)
        
        if auth_success:
            print("✅ TBO API AUTHENTICATION: SUCCESS")
            print(f"   - Valid TokenId obtained from TBO API")
            print(f"   - Credentials (Username: {TBO_USERNAME}, Password: {TBO_PASSWORD}) are working")
            if self.successful_auth_endpoint:
                print(f"   - Working endpoint: {self.successful_auth_endpoint}")
        else:
            print("❌ TBO API AUTHENTICATION: FAILED")
            print("   - No valid TokenId obtained from any TBO endpoint")
            print("   - Credentials may be invalid or endpoints may be down")
        
        if flight_search_success:
            print("✅ TBO FLIGHT SEARCH: SUCCESS")
            print("   - Flight search returning real TBO data")
            print("   - Delhi to Mumbai sample search working")
        else:
            print("❌ TBO FLIGHT SEARCH: FAILED")
            print("   - Flight search not working with TBO API")
            print("   - May be due to authentication failure or API issues")
        
        if backend_integration_success:
            print("✅ BACKEND TBO INTEGRATION: SUCCESS")
            print("   - Backend properly integrated with TBO API")
            print("   - Real TBO data being returned instead of mock data")
        else:
            print("❌ BACKEND TBO INTEGRATION: FAILED")
            print("   - Backend falling back to mock data")
            print("   - TBO integration not working in backend")
        
        # Environment variables status
        env_tests = [r for r in self.test_results if "Environment" in r["test"]]
        if env_tests:
            env_success = any(r["success"] for r in env_tests)
            if env_success:
                print("✅ ENVIRONMENT VARIABLES: PROPERLY CONFIGURED")
            else:
                print("❌ ENVIRONMENT VARIABLES: CONFIGURATION ISSUES")
        
        # Detailed error analysis
        failed_tests = [r for r in self.test_results if not r["success"]]
        if failed_tests:
            print("\n🚨 DETAILED ERROR ANALYSIS:")
            print("=" * 50)
            for result in failed_tests:
                print(f"   ❌ {result['test']}: {result['details']}")
        
        # Recommendations based on results
        print("\n📋 RECOMMENDATIONS:")
        print("=" * 50)
        
        if auth_success and flight_search_success and backend_integration_success:
            print("🎉 ALL SYSTEMS WORKING!")
            print("1. ✅ TBO API authentication is working with provided credentials")
            print("2. ✅ Flight search is returning real TBO data")
            print("3. ✅ Backend integration is properly configured")
            print("4. ✅ Ready for production use")
        elif auth_success and flight_search_success:
            print("⚠️ TBO API WORKING, BACKEND INTEGRATION NEEDS FIXING")
            print("1. ✅ TBO API authentication and flight search working")
            print("2. ❌ Fix backend TBO integration")
            print("3. 🔧 Update backend environment variables")
            print("4. 🔧 Check backend TBO service implementation")
        elif auth_success:
            print("⚠️ AUTHENTICATION WORKING, FLIGHT SEARCH NEEDS FIXING")
            print("1. ✅ TBO API authentication working")
            print("2. ❌ Fix flight search implementation")
            print("3. 🔧 Check flight search request format")
            print("4. 🔧 Verify search endpoint URLs")
        else:
            print("❌ CRITICAL ISSUES IDENTIFIED")
            print("1. ❌ TBO API authentication not working")
            print("2. 🔧 Verify credentials with TBO support")
            print("3. 🔧 Check network connectivity to TBO endpoints")
            print("4. 🔧 Try alternative authentication endpoints")
        
        # Next steps
        print("\n🎯 NEXT STEPS:")
        print("=" * 50)
        
        if auth_success and backend_integration_success:
            print("1. ✅ System ready for production deployment")
            print("2. 🧪 Conduct end-to-end testing with real bookings")
            print("3. 📊 Monitor TBO API performance and error rates")
        elif auth_success:
            print("1. 🔧 Fix backend TBO integration using working authentication")
            print("2. 🔧 Update backend to use successful endpoint")
            print("3. 🧪 Test end-to-end flight search flow")
        else:
            print("1. 📞 Contact TBO support to verify credentials and endpoints")
            print("2. 🔧 Request updated staging environment details")
            print("3. 🧪 Test with alternative authentication methods")
            print("4. 🔄 Re-run tests after receiving updated credentials")
        
        return auth_success and backend_integration_success

def main():
    """Run TBO Flight API authentication and integration test"""
    print("🚀 STARTING TBO FLIGHT API AUTHENTICATION AND INTEGRATION TEST")
    print("=" * 100)
    print("Testing TBO Flight API authentication and integration with updated credentials")
    print("provided by TBO support as per review request.")
    print()
    print("Updated TBO Credentials:")
    print(f"- Username: {TBO_USERNAME}")
    print(f"- Password: {TBO_PASSWORD}")
    print("- Status: Confirmed working at TBO's end for Authentication and Hotel APIs")
    print()
    
    tester = TBOReviewTester()
    
    # Check backend health first
    if not tester.test_backend_health():
        print("❌ Backend not accessible. Continuing with direct TBO API tests...")
    
    # Run all test phases as requested in review
    tester.test_environment_variables()
    tester.test_tbo_authentication_staging()
    tester.test_tbo_authentication_production()
    tester.test_request_format_verification()
    tester.test_flight_search_functionality()
    tester.test_backend_flight_search_endpoint()
    tester.test_alternative_endpoints()
    
    # Generate comprehensive summary
    integration_working = tester.generate_comprehensive_summary()
    
    return integration_working

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)