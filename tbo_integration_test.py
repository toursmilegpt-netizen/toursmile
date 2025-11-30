#!/usr/bin/env python3
"""
TBO FLIGHT API INTEGRATION COMPREHENSIVE TEST
Testing TBO API integration with updated SMILE HOLIDAYS credentials as per review request.

Test Areas:
1. TBO Authentication Test - Test authentication endpoint with username "Smile" and password "Smile@123"
2. Authentication Request Format Verification - Verify request format and response structure
3. Flight Search Functionality - Test Delhi to Mumbai sample data
4. Token Response Validation - Check for valid TokenId or authentication errors
5. Backend Flight Search Endpoint - Verify /api/flights/search works with updated credentials
6. Basic Health Endpoints - Ensure no regressions in core functionality

Expected Results:
- If authentication succeeds: Valid TokenId in response
- If authentication fails: Error message explaining the issue
- Flight search should work with proper API integration
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
BACKEND_URL = "https://responsive-travel-1.preview.emergentagent.com/api"

# TBO API Configuration - SMILE HOLIDAYS CREDENTIALS
TBO_USERNAME = "Smile"
TBO_PASSWORD = "Smile@123"
TBO_BASE_URL = "https://Tboairdemo.techmaster.in/API/API/v1"
TBO_AUTH_URL = "https://Tboairdemo.techmaster.in/API/API/v1/Authenticate/ValidateAgency"
TBO_CLIENT_ID = "ApiIntegrationNew"

class TBOIntegrationTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.test_results = []
        self.tbo_token = None
        
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
        elif response_data:
            print(f"   Response: {str(response_data)[:200]}...")
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
    
    def test_tbo_authentication(self):
        """Test 1: TBO Authentication with SMILE HOLIDAYS credentials"""
        print("🔍 TEST 1: TBO AUTHENTICATION WITH SMILE HOLIDAYS CREDENTIALS")
        print("=" * 80)
        
        # Exact authentication payload as per TBO API documentation
        auth_payload = {
            "BookingMode": "API",
            "UserName": TBO_USERNAME,
            "Password": TBO_PASSWORD,
            "IPAddress": "192.168.1.1"
        }
        
        try:
            start_time = time.time()
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            print(f"🌐 Testing TBO Authentication URL: {TBO_AUTH_URL}")
            print(f"📦 Payload: {json.dumps(auth_payload, indent=2)}")
            print(f"📋 Headers: {json.dumps(headers, indent=2)}")
            
            response = requests.post(TBO_AUTH_URL, 
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
                # Check TBO API response structure
                if isinstance(response_data, dict):
                    if response_data.get("IsSuccess") == True:
                        token_id = response_data.get("TokenId")
                        if token_id:
                            self.tbo_token = token_id
                            self.log_test("TBO Authentication", True, 
                                        f"Authentication successful! TokenId: {token_id[:20]}...", 
                                        response_time, response_data)
                            return True
                        else:
                            self.log_test("TBO Authentication", False, 
                                        f"Authentication response missing TokenId", 
                                        response_time, response_data)
                    else:
                        errors = response_data.get("Errors", [])
                        error_msg = errors[0].get("UserMessage", "Authentication failed") if errors else "Authentication failed"
                        self.log_test("TBO Authentication", False, 
                                    f"Authentication failed: {error_msg}", 
                                    response_time, response_data)
                else:
                    self.log_test("TBO Authentication", False, 
                                f"Invalid response format", 
                                response_time, response_data)
            else:
                self.log_test("TBO Authentication", False, 
                            f"HTTP {response.status_code}: {response.text}", 
                            response_time, response_data)
                
        except requests.exceptions.Timeout:
            self.log_test("TBO Authentication", False, 
                        f"Request timeout after 30 seconds")
        except requests.exceptions.ConnectionError as e:
            self.log_test("TBO Authentication", False, 
                        f"Connection error: {str(e)}")
        except Exception as e:
            self.log_test("TBO Authentication", False, 
                        f"Request failed: {str(e)}")
        
        return False
    
    def test_authentication_request_format(self):
        """Test 2: Authentication Request Format Verification"""
        print("🔍 TEST 2: AUTHENTICATION REQUEST FORMAT VERIFICATION")
        print("=" * 80)
        
        # Test different request formats to ensure we're using the correct one
        test_formats = [
            {
                "name": "Standard TBO Format",
                "payload": {
                    "BookingMode": "API",
                    "UserName": TBO_USERNAME,
                    "Password": TBO_PASSWORD,
                    "IPAddress": "192.168.1.1"
                },
                "headers": {"Content-Type": "application/json"}
            },
            {
                "name": "Alternative Format with ClientId",
                "payload": {
                    "ClientId": TBO_CLIENT_ID,
                    "UserName": TBO_USERNAME,
                    "Password": TBO_PASSWORD,
                    "EndUserIp": "192.168.1.1"
                },
                "headers": {"Content-Type": "application/json"}
            },
            {
                "name": "XML Content-Type",
                "payload": {
                    "BookingMode": "API",
                    "UserName": TBO_USERNAME,
                    "Password": TBO_PASSWORD,
                    "IPAddress": "192.168.1.1"
                },
                "headers": {"Content-Type": "application/xml"}
            }
        ]
        
        successful_format = None
        
        for format_test in test_formats:
            try:
                start_time = time.time()
                
                print(f"🧪 Testing format: {format_test['name']}")
                print(f"📦 Payload: {json.dumps(format_test['payload'], indent=2)}")
                
                response = requests.post(TBO_AUTH_URL, 
                                       json=format_test['payload'], 
                                       headers=format_test['headers'],
                                       timeout=20)
                response_time = time.time() - start_time
                
                try:
                    response_data = response.json()
                except:
                    response_data = {"raw_text": response.text[:200]}
                
                if response.status_code == 200 and isinstance(response_data, dict):
                    if response_data.get("IsSuccess") == True and response_data.get("TokenId"):
                        successful_format = format_test['name']
                        self.log_test(f"Request Format - {format_test['name']}", True, 
                                    f"Format successful! TokenId received", 
                                    response_time, response_data)
                        break
                    else:
                        self.log_test(f"Request Format - {format_test['name']}", False, 
                                    f"Format failed: {response_data.get('Errors', 'Unknown error')}", 
                                    response_time, response_data)
                else:
                    self.log_test(f"Request Format - {format_test['name']}", False, 
                                f"HTTP {response.status_code}", 
                                response_time, response_data)
                    
            except Exception as e:
                self.log_test(f"Request Format - {format_test['name']}", False, 
                            f"Format test failed: {str(e)}")
        
        if successful_format:
            print(f"✅ Successful authentication format identified: {successful_format}")
            return True
        else:
            print("❌ No successful authentication format found")
            return False
    
    def test_flight_search_functionality(self):
        """Test 3: Flight Search Functionality with Delhi to Mumbai"""
        print("🔍 TEST 3: FLIGHT SEARCH FUNCTIONALITY - DELHI TO MUMBAI")
        print("=" * 80)
        
        if not self.tbo_token:
            print("⚠️ No TBO token available, attempting to get token first...")
            if not self.test_tbo_authentication():
                self.log_test("Flight Search - Token Required", False, 
                            "Cannot test flight search without valid TBO token")
                return False
        
        # Flight search payload for Delhi to Mumbai
        search_payload = {
            "EndUserIp": "192.168.1.1",
            "TokenId": self.tbo_token,
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
            
            search_url = f"{TBO_BASE_URL}/Search"
            print(f"🌐 Testing TBO Flight Search URL: {search_url}")
            print(f"📦 Search Payload: {json.dumps(search_payload, indent=2)}")
            
            response = requests.post(search_url, 
                                   json=search_payload, 
                                   headers=headers,
                                   timeout=60)
            response_time = time.time() - start_time
            
            print(f"📊 Search Response Status: {response.status_code}")
            
            try:
                response_data = response.json()
                print(f"📊 Search Response Keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Not a dict'}")
            except:
                response_data = {"raw_text": response.text[:500]}
                print(f"📊 Search Response Text: {response.text[:200]}")
            
            if response.status_code == 200:
                if isinstance(response_data, dict):
                    status = response_data.get("Status", {})
                    if status.get("Success") == True:
                        results = response_data.get("Response", {}).get("Results", [])
                        flight_count = sum(len(result_group) for result_group in results) if results else 0
                        
                        self.log_test("TBO Flight Search", True, 
                                    f"Flight search successful! Found {flight_count} flights for DEL→BOM", 
                                    response_time, {"flight_count": flight_count, "status": status})
                        return True
                    else:
                        error_msg = status.get("Description", "Search failed")
                        self.log_test("TBO Flight Search", False, 
                                    f"Search failed: {error_msg}", 
                                    response_time, response_data)
                else:
                    self.log_test("TBO Flight Search", False, 
                                f"Invalid search response format", 
                                response_time, response_data)
            else:
                self.log_test("TBO Flight Search", False, 
                            f"Search HTTP {response.status_code}: {response.text[:200]}", 
                            response_time, response_data)
                
        except requests.exceptions.Timeout:
            self.log_test("TBO Flight Search", False, 
                        f"Search request timeout after 60 seconds")
        except Exception as e:
            self.log_test("TBO Flight Search", False, 
                        f"Search request failed: {str(e)}")
        
        return False
    
    def test_token_response_validation(self):
        """Test 4: Token Response Validation"""
        print("🔍 TEST 4: TOKEN RESPONSE VALIDATION")
        print("=" * 80)
        
        if not self.tbo_token:
            self.log_test("Token Validation", False, 
                        "No token available for validation")
            return False
        
        # Validate token format and properties
        token_tests = [
            {
                "name": "Token Length",
                "test": len(self.tbo_token) > 10,
                "details": f"Token length: {len(self.tbo_token)} characters"
            },
            {
                "name": "Token Format",
                "test": isinstance(self.tbo_token, str) and self.tbo_token.strip() != "",
                "details": f"Token type: {type(self.tbo_token)}, non-empty: {self.tbo_token.strip() != ''}"
            },
            {
                "name": "Token Usability",
                "test": True,  # Will be tested in flight search
                "details": f"Token preview: {self.tbo_token[:20]}..."
            }
        ]
        
        all_passed = True
        for test in token_tests:
            if test["test"]:
                self.log_test(f"Token Validation - {test['name']}", True, test["details"])
            else:
                self.log_test(f"Token Validation - {test['name']}", False, test["details"])
                all_passed = False
        
        return all_passed
    
    def test_backend_flight_search_endpoint(self):
        """Test 5: Backend Flight Search Endpoint with TBO Integration"""
        print("🔍 TEST 5: BACKEND FLIGHT SEARCH ENDPOINT (/api/flights/search)")
        print("=" * 80)
        
        # Test backend flight search endpoint
        search_request = {
            "origin": "Delhi",
            "destination": "Mumbai",
            "departure_date": "2025-02-15",
            "passengers": 1,
            "class_type": "economy"
        }
        
        try:
            start_time = time.time()
            response = requests.post(f"{self.backend_url}/flights/search", 
                                   json=search_request, 
                                   timeout=30)
            response_time = time.time() - start_time
            
            print(f"📊 Backend Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                data_source = data.get("data_source", "unknown")
                
                print(f"📊 Backend Response: Found {len(flights)} flights, Source: {data_source}")
                
                if "tbo" in data_source.lower():
                    self.log_test("Backend Flight Search - TBO Integration", True, 
                                f"Backend successfully using TBO API, found {len(flights)} flights", 
                                response_time, {"flight_count": len(flights), "data_source": data_source})
                    return True
                elif "mock" in data_source.lower():
                    self.log_test("Backend Flight Search - TBO Integration", False, 
                                f"Backend falling back to mock data, TBO integration not working", 
                                response_time, {"flight_count": len(flights), "data_source": data_source})
                else:
                    # Check if flights have TBO-like structure
                    tbo_indicators = 0
                    if flights:
                        first_flight = flights[0]
                        if "fare_types" in first_flight:
                            tbo_indicators += 1
                        if "validation_key" in first_flight:
                            tbo_indicators += 1
                        if first_flight.get("data_source") == "tbo":
                            tbo_indicators += 1
                    
                    if tbo_indicators >= 1:
                        self.log_test("Backend Flight Search - TBO Integration", True, 
                                    f"Backend likely using TBO API (indicators: {tbo_indicators}), found {len(flights)} flights", 
                                    response_time, {"flight_count": len(flights), "data_source": data_source})
                        return True
                    else:
                        self.log_test("Backend Flight Search - TBO Integration", False, 
                                    f"Backend using unknown data source: {data_source}", 
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
                        f"Backend service test failed: {str(e)}")
        
        return False
    
    def test_basic_health_endpoints(self):
        """Test 6: Basic Health Endpoints - Ensure No Regressions"""
        print("🔍 TEST 6: BASIC HEALTH ENDPOINTS - REGRESSION CHECK")
        print("=" * 80)
        
        # Test core backend endpoints to ensure no regressions
        health_endpoints = [
            {
                "name": "Root Endpoint",
                "url": f"{self.backend_url}/",
                "method": "GET",
                "expected_status": 200
            },
            {
                "name": "Airport Search",
                "url": f"{self.backend_url}/airports/search",
                "method": "GET",
                "params": {"query": "Mumbai", "limit": 5},
                "expected_status": 200
            },
            {
                "name": "Hotel Search",
                "url": f"{self.backend_url}/hotels/search",
                "method": "POST",
                "json": {
                    "location": "Mumbai",
                    "checkin_date": "2025-02-15",
                    "checkout_date": "2025-02-16",
                    "guests": 1,
                    "rooms": 1
                },
                "expected_status": 200
            },
            {
                "name": "Activities Search",
                "url": f"{self.backend_url}/activities/search",
                "method": "POST",
                "json": {"location": "Mumbai"},
                "expected_status": 200
            },
            {
                "name": "AI Chat",
                "url": f"{self.backend_url}/chat",
                "method": "POST",
                "json": {"message": "Hello", "session_id": "test123"},
                "expected_status": 200
            }
        ]
        
        health_passed = 0
        total_health_tests = len(health_endpoints)
        
        for endpoint in health_endpoints:
            try:
                start_time = time.time()
                
                if endpoint["method"] == "GET":
                    response = requests.get(endpoint["url"], 
                                          params=endpoint.get("params"),
                                          timeout=15)
                else:
                    response = requests.post(endpoint["url"], 
                                           json=endpoint.get("json"),
                                           timeout=15)
                
                response_time = time.time() - start_time
                
                if response.status_code == endpoint["expected_status"]:
                    try:
                        response_data = response.json()
                        data_preview = str(response_data)[:100] + "..." if len(str(response_data)) > 100 else str(response_data)
                    except:
                        data_preview = response.text[:100] + "..." if len(response.text) > 100 else response.text
                    
                    self.log_test(f"Health Check - {endpoint['name']}", True, 
                                f"Endpoint working correctly: {data_preview}", 
                                response_time)
                    health_passed += 1
                else:
                    self.log_test(f"Health Check - {endpoint['name']}", False, 
                                f"Expected HTTP {endpoint['expected_status']}, got {response.status_code}", 
                                response_time)
                    
            except Exception as e:
                self.log_test(f"Health Check - {endpoint['name']}", False, 
                            f"Health check failed: {str(e)}")
        
        overall_health = health_passed == total_health_tests
        self.log_test("Overall Health Check", overall_health, 
                    f"Health endpoints: {health_passed}/{total_health_tests} passed")
        
        return overall_health
    
    def generate_comprehensive_summary(self):
        """Generate comprehensive test summary"""
        print("\n" + "=" * 100)
        print("🎯 TBO FLIGHT API INTEGRATION COMPREHENSIVE TEST SUMMARY")
        print("=" * 100)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)")
        print()
        
        # Categorize results by test area
        categories = {
            "Authentication": [],
            "Flight Search": [],
            "Backend Integration": [],
            "Health Checks": []
        }
        
        for result in self.test_results:
            test_name = result["test"]
            if "Authentication" in test_name or "Token" in test_name or "Request Format" in test_name:
                categories["Authentication"].append(result)
            elif "Flight Search" in test_name or "TBO Flight" in test_name:
                categories["Flight Search"].append(result)
            elif "Backend" in test_name:
                categories["Backend Integration"].append(result)
            elif "Health" in test_name:
                categories["Health Checks"].append(result)
        
        # Print category summaries
        for category, results in categories.items():
            if results:
                category_passed = sum(1 for r in results if r["success"])
                category_total = len(results)
                category_rate = (category_passed / category_total) * 100 if category_total > 0 else 0
                status = "✅" if category_rate >= 80 else "⚠️" if category_rate >= 60 else "❌"
                print(f"{status} {category}: {category_passed}/{category_total} ({category_rate:.1f}%)")
        
        print()
        
        # TBO Integration Analysis
        print("🔍 TBO INTEGRATION ANALYSIS:")
        print("=" * 50)
        
        auth_success = any(r["success"] for r in self.test_results if "TBO Authentication" in r["test"])
        search_success = any(r["success"] for r in self.test_results if "TBO Flight Search" in r["test"])
        backend_success = any(r["success"] for r in self.test_results if "Backend Flight Search" in r["test"] and "TBO" in r["test"])
        
        if auth_success:
            print("✅ TBO Authentication: WORKING")
            print(f"   - Successfully authenticated with username: {TBO_USERNAME}")
            print(f"   - Valid TokenId received from TBO API")
            if self.tbo_token:
                print(f"   - Token preview: {self.tbo_token[:20]}...")
        else:
            print("❌ TBO Authentication: FAILED")
            print("   - Unable to authenticate with provided credentials")
            print("   - Check credentials or TBO service availability")
        
        if search_success:
            print("✅ TBO Flight Search: WORKING")
            print("   - Successfully searched Delhi to Mumbai flights")
            print("   - TBO API returning flight results")
        else:
            print("❌ TBO Flight Search: FAILED")
            print("   - Flight search not working with TBO API")
            print("   - May be due to authentication or API issues")
        
        if backend_success:
            print("✅ Backend TBO Integration: WORKING")
            print("   - Backend successfully using TBO API")
            print("   - End-to-end integration functional")
        else:
            print("❌ Backend TBO Integration: FAILED")
            print("   - Backend not properly integrated with TBO API")
            print("   - May be falling back to mock data")
        
        # Critical Issues
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n🚨 CRITICAL ISSUES IDENTIFIED:")
            for result in failed_tests:
                print(f"   ❌ {result['test']}: {result['details']}")
            print()
        
        # Recommendations
        print("📋 RECOMMENDATIONS:")
        print("=" * 50)
        
        if success_rate >= 90:
            print("✅ TBO integration is working excellently")
            print("✅ All critical functionality operational")
            print("✅ Ready for production use")
        elif success_rate >= 70:
            print("⚠️ TBO integration mostly working")
            print("⚠️ Address remaining issues for full functionality")
            if not auth_success:
                print("🔑 Priority: Fix TBO authentication")
            if not backend_success:
                print("🔧 Priority: Fix backend integration")
        else:
            print("❌ TBO integration has significant issues")
            print("❌ Multiple critical components not working")
            if not auth_success:
                print("🔑 URGENT: TBO authentication completely broken")
                print("   - Verify credentials with TBO support")
                print("   - Check TBO service availability")
            if not search_success:
                print("🔍 URGENT: TBO flight search not working")
                print("   - Fix authentication first")
                print("   - Verify API endpoints and payload format")
        
        # Next Steps
        print("\n🎯 NEXT STEPS:")
        print("=" * 50)
        
        if success_rate >= 90:
            print("1. Monitor TBO integration in production")
            print("2. Set up error monitoring and alerting")
            print("3. Consider load testing with TBO API")
        elif auth_success and not backend_success:
            print("1. Fix backend TBO service integration")
            print("2. Update backend to use working TBO authentication")
            print("3. Test end-to-end flight booking flow")
        elif not auth_success:
            print("1. Contact TBO support to verify credentials")
            print("2. Check TBO staging environment status")
            print("3. Verify API endpoints and authentication format")
            print("4. Consider alternative authentication methods")
        
        return success_rate >= 70

def main():
    """Run comprehensive TBO integration test"""
    print("🚀 STARTING TBO FLIGHT API INTEGRATION COMPREHENSIVE TEST")
    print("=" * 100)
    print("Testing TBO API integration with updated SMILE HOLIDAYS credentials")
    print("as per review request.")
    print()
    
    tester = TBOIntegrationTester()
    
    # Check backend health first
    if not tester.test_backend_health():
        print("❌ Backend not accessible. Continuing with direct TBO API tests...")
    
    # Run all test phases as requested
    tester.test_tbo_authentication()
    tester.test_authentication_request_format()
    tester.test_flight_search_functionality()
    tester.test_token_response_validation()
    tester.test_backend_flight_search_endpoint()
    tester.test_basic_health_endpoints()
    
    # Generate comprehensive summary
    integration_working = tester.generate_comprehensive_summary()
    
    return integration_working

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)