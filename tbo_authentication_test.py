#!/usr/bin/env python3
"""
TBO API AUTHENTICATION COMPREHENSIVE TEST
Testing TBO API authentication directly to debug authentication failure as per review request.

Test Areas:
1. Direct TBO API Authentication Test - Test exact authentication endpoint with exact payload
2. Alternative TBO Endpoints - Try different URL formats and authentication methods
3. Backend Service Testing - Test our tbo_flight_service.get_auth_token() method directly
4. Network Connectivity - Verify backend can reach api.tektravels.com
5. Credential Validation - Confirm TBO staging credentials are still valid

Expected Results:
- TBO API returns proper authentication response with TokenId
- OR identify specific error message explaining authentication failure
- OR determine if TBO staging environment is unavailable
- OR confirm if credentials need updating
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
BACKEND_URL = "https://flight-cert-runner.preview.emergentagent.com/api"

# TBO API Configuration from backend/.env
TBO_USERNAME = "Smile"
TBO_PASSWORD = "Smile@123"
TBO_BASE_URL = "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest"
TBO_AUTH_URL = "http://api.tektravels.com/SharedServices/SharedData.svc"
TBO_CLIENT_ID = "ApiIntegrationNew"

class TBOAuthenticationTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.test_results = []
        self.tbo_responses = []
        
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
        if response_data:
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
    
    def test_direct_tbo_authentication_rest(self):
        """Test 1: Direct TBO API Authentication Test - REST endpoint"""
        print("🔍 TEST 1: DIRECT TBO API AUTHENTICATION TEST - REST ENDPOINT")
        print("=" * 80)
        
        # Exact payload as specified in review request
        auth_payload = {
            "ClientId": TBO_CLIENT_ID,
            "UserName": TBO_USERNAME,
            "Password": TBO_PASSWORD,
            "EndUserIp": "192.168.1.1"
        }
        
        # Test REST authentication endpoint
        rest_auth_url = f"{TBO_AUTH_URL}/rest/Authenticate"
        
        try:
            start_time = time.time()
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            print(f"🌐 Testing TBO REST Authentication URL: {rest_auth_url}")
            print(f"📦 Payload: {json.dumps(auth_payload, indent=2)}")
            print(f"📋 Headers: {json.dumps(headers, indent=2)}")
            
            response = requests.post(rest_auth_url, 
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
                # Check if response contains TokenId
                if isinstance(response_data, dict) and "TokenId" in response_data:
                    self.log_test("TBO REST Authentication", True, 
                                f"Authentication successful! TokenId: {response_data.get('TokenId')}", 
                                response_time, response_data)
                    return response_data
                else:
                    self.log_test("TBO REST Authentication", False, 
                                f"Authentication response missing TokenId", 
                                response_time, response_data)
            else:
                self.log_test("TBO REST Authentication", False, 
                            f"HTTP {response.status_code}: {response.text}", 
                            response_time, response_data)
                
        except requests.exceptions.Timeout:
            self.log_test("TBO REST Authentication", False, 
                        f"Request timeout after 30 seconds")
        except requests.exceptions.ConnectionError as e:
            self.log_test("TBO REST Authentication", False, 
                        f"Connection error: {str(e)}")
        except Exception as e:
            self.log_test("TBO REST Authentication", False, 
                        f"Request failed: {str(e)}")
        
        return None
    
    def test_alternative_tbo_endpoints(self):
        """Test 2: Alternative TBO Endpoints"""
        print("🔍 TEST 2: ALTERNATIVE TBO ENDPOINTS")
        print("=" * 80)
        
        auth_payload = {
            "ClientId": TBO_CLIENT_ID,
            "UserName": TBO_USERNAME,
            "Password": TBO_PASSWORD,
            "EndUserIp": "192.168.1.1"
        }
        
        # Test alternative authentication URLs
        alternative_urls = [
            f"{TBO_AUTH_URL}/Authenticate",  # Without /rest
            f"{TBO_AUTH_URL}/rest/Authenticate",  # Original with /rest
            "http://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate",  # Full path with /rest
        ]
        
        # Test different Content-Type headers
        content_types = [
            "application/json",
            "application/x-www-form-urlencoded",
            "text/xml",
            "application/soap+xml"
        ]
        
        for i, url in enumerate(alternative_urls):
            for j, content_type in enumerate(content_types):
                test_name = f"Alternative URL {i+1} with Content-Type {j+1}"
                
                try:
                    start_time = time.time()
                    headers = {
                        "Content-Type": content_type,
                        "Accept": "application/json"
                    }
                    
                    print(f"🌐 Testing URL: {url}")
                    print(f"📋 Content-Type: {content_type}")
                    
                    if content_type == "application/json":
                        response = requests.post(url, json=auth_payload, headers=headers, timeout=15)
                    elif content_type == "application/x-www-form-urlencoded":
                        response = requests.post(url, data=auth_payload, headers=headers, timeout=15)
                    else:
                        # For XML/SOAP, try JSON first
                        response = requests.post(url, json=auth_payload, headers=headers, timeout=15)
                    
                    response_time = time.time() - start_time
                    
                    try:
                        response_data = response.json()
                    except:
                        response_data = {"raw_text": response.text[:500]}  # Limit text length
                    
                    if response.status_code == 200 and isinstance(response_data, dict) and "TokenId" in response_data:
                        self.log_test(test_name, True, 
                                    f"SUCCESS! URL: {url}, Content-Type: {content_type}, TokenId: {response_data.get('TokenId')}", 
                                    response_time, response_data)
                        return response_data
                    else:
                        self.log_test(test_name, False, 
                                    f"HTTP {response.status_code}, URL: {url}, Content-Type: {content_type}", 
                                    response_time, response_data)
                        
                except Exception as e:
                    self.log_test(test_name, False, 
                                f"Failed - URL: {url}, Content-Type: {content_type}, Error: {str(e)}")
        
        return None
    
    def test_soap_authentication(self):
        """Test SOAP format authentication"""
        print("🔍 TEST 2B: SOAP FORMAT AUTHENTICATION")
        print("=" * 80)
        
        # SOAP XML payload
        soap_payload = f"""<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <Authenticate xmlns="http://tempuri.org/">
            <ClientId>{TBO_CLIENT_ID}</ClientId>
            <UserName>{TBO_USERNAME}</UserName>
            <Password>{TBO_PASSWORD}</Password>
            <EndUserIp>192.168.1.1</EndUserIp>
        </Authenticate>
    </soap:Body>
</soap:Envelope>"""
        
        soap_urls = [
            f"{TBO_AUTH_URL}",
            f"{TBO_AUTH_URL}/Authenticate"
        ]
        
        for url in soap_urls:
            try:
                start_time = time.time()
                headers = {
                    "Content-Type": "text/xml; charset=utf-8",
                    "SOAPAction": "http://tempuri.org/Authenticate",
                    "Accept": "text/xml"
                }
                
                print(f"🌐 Testing SOAP URL: {url}")
                print(f"📦 SOAP Payload: {soap_payload}")
                
                response = requests.post(url, data=soap_payload, headers=headers, timeout=30)
                response_time = time.time() - start_time
                
                print(f"📊 SOAP Response Status: {response.status_code}")
                print(f"📊 SOAP Response: {response.text[:1000]}")  # First 1000 chars
                
                if response.status_code == 200:
                    # Check if SOAP response contains authentication token
                    if "TokenId" in response.text or "AuthToken" in response.text:
                        self.log_test("SOAP Authentication", True, 
                                    f"SOAP authentication successful! URL: {url}", 
                                    response_time, {"soap_response": response.text[:500]})
                        return response.text
                    else:
                        self.log_test("SOAP Authentication", False, 
                                    f"SOAP response missing token, URL: {url}", 
                                    response_time, {"soap_response": response.text[:500]})
                else:
                    self.log_test("SOAP Authentication", False, 
                                f"SOAP HTTP {response.status_code}, URL: {url}", 
                                response_time, {"soap_response": response.text[:500]})
                    
            except Exception as e:
                self.log_test("SOAP Authentication", False, 
                            f"SOAP request failed - URL: {url}, Error: {str(e)}")
        
        return None
    
    def test_backend_tbo_service(self):
        """Test 3: Backend Service Testing"""
        print("🔍 TEST 3: BACKEND TBO SERVICE TESTING")
        print("=" * 80)
        
        # Test our backend's TBO flight service
        try:
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
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                data_source = data.get("data_source", "unknown")
                
                print(f"📊 Backend Flight Search Response: {json.dumps(data, indent=2)}")
                
                if "tbo" in data_source.lower():
                    self.log_test("Backend TBO Service", True, 
                                f"Backend successfully using TBO API, found {len(flights)} flights", 
                                response_time, data)
                elif "mock" in data_source.lower():
                    self.log_test("Backend TBO Service", False, 
                                f"Backend falling back to mock data, TBO integration not working", 
                                response_time, data)
                else:
                    self.log_test("Backend TBO Service", False, 
                                f"Backend using unknown data source: {data_source}", 
                                response_time, data)
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"raw_text": response.text}
                
                self.log_test("Backend TBO Service", False, 
                            f"Backend flight search failed: HTTP {response.status_code}", 
                            response_time, error_data)
                
        except Exception as e:
            self.log_test("Backend TBO Service", False, 
                        f"Backend service test failed: {str(e)}")
    
    def test_network_connectivity(self):
        """Test 4: Network Connectivity"""
        print("🔍 TEST 4: NETWORK CONNECTIVITY")
        print("=" * 80)
        
        # Test basic connectivity to TBO domain
        tbo_hosts = [
            "api.tektravels.com",
            "www.tektravels.com",
            "tektravels.com"
        ]
        
        for host in tbo_hosts:
            try:
                start_time = time.time()
                response = requests.get(f"http://{host}", timeout=10)
                response_time = time.time() - start_time
                
                self.log_test(f"Network Connectivity - {host}", True, 
                            f"Host reachable: HTTP {response.status_code}", response_time)
                
            except requests.exceptions.Timeout:
                self.log_test(f"Network Connectivity - {host}", False, 
                            f"Host timeout after 10 seconds")
            except requests.exceptions.ConnectionError:
                self.log_test(f"Network Connectivity - {host}", False, 
                            f"Host unreachable - connection error")
            except Exception as e:
                self.log_test(f"Network Connectivity - {host}", False, 
                            f"Host test failed: {str(e)}")
        
        # Test specific TBO API endpoints accessibility
        tbo_endpoints = [
            "http://api.tektravels.com/SharedServices/SharedData.svc",
            "http://api.tektravels.com/SharedServices/SharedData.svc/rest",
            "http://api.tektravels.com/BookingEngineService_Air/AirService.svc"
        ]
        
        for endpoint in tbo_endpoints:
            try:
                start_time = time.time()
                response = requests.get(endpoint, timeout=15)
                response_time = time.time() - start_time
                
                print(f"🌐 Endpoint: {endpoint}")
                print(f"📊 Status: {response.status_code}")
                print(f"📊 Response: {response.text[:200]}")  # First 200 chars
                
                if response.status_code in [200, 405, 500]:  # 405 = Method Not Allowed is OK for GET on POST endpoint
                    self.log_test(f"TBO Endpoint - {endpoint.split('/')[-1]}", True, 
                                f"Endpoint accessible: HTTP {response.status_code}", response_time)
                else:
                    self.log_test(f"TBO Endpoint - {endpoint.split('/')[-1]}", False, 
                                f"Endpoint returned: HTTP {response.status_code}", response_time)
                    
            except Exception as e:
                self.log_test(f"TBO Endpoint - {endpoint.split('/')[-1]}", False, 
                            f"Endpoint test failed: {str(e)}")
    
    def test_credential_validation(self):
        """Test 5: Credential Validation"""
        print("🔍 TEST 5: CREDENTIAL VALIDATION")
        print("=" * 80)
        
        print(f"🔑 TBO Credentials Being Tested:")
        print(f"   Username: {TBO_USERNAME}")
        print(f"   Password: {TBO_PASSWORD}")
        print(f"   Client ID: {TBO_CLIENT_ID}")
        print(f"   Base URL: {TBO_BASE_URL}")
        print(f"   Auth URL: {TBO_AUTH_URL}")
        print()
        
        # Test with different credential combinations
        credential_tests = [
            {
                "name": "Original Credentials",
                "username": TBO_USERNAME,
                "password": TBO_PASSWORD,
                "client_id": TBO_CLIENT_ID
            },
            {
                "name": "Alternative Client ID",
                "username": TBO_USERNAME,
                "password": TBO_PASSWORD,
                "client_id": "ApiIntegration"  # Without "New"
            },
            {
                "name": "Case Sensitive Test",
                "username": TBO_USERNAME.lower(),
                "password": TBO_PASSWORD,
                "client_id": TBO_CLIENT_ID
            }
        ]
        
        for cred_test in credential_tests:
            auth_payload = {
                "ClientId": cred_test["client_id"],
                "UserName": cred_test["username"],
                "Password": cred_test["password"],
                "EndUserIp": "192.168.1.1"
            }
            
            try:
                start_time = time.time()
                response = requests.post(f"{TBO_AUTH_URL}/rest/Authenticate", 
                                       json=auth_payload, 
                                       headers={"Content-Type": "application/json"},
                                       timeout=20)
                response_time = time.time() - start_time
                
                try:
                    response_data = response.json()
                except:
                    response_data = {"raw_text": response.text}
                
                if response.status_code == 200 and isinstance(response_data, dict) and "TokenId" in response_data:
                    self.log_test(f"Credential Test - {cred_test['name']}", True, 
                                f"Credentials valid! TokenId: {response_data.get('TokenId')}", 
                                response_time, response_data)
                else:
                    self.log_test(f"Credential Test - {cred_test['name']}", False, 
                                f"Credentials failed: HTTP {response.status_code}", 
                                response_time, response_data)
                    
            except Exception as e:
                self.log_test(f"Credential Test - {cred_test['name']}", False, 
                            f"Credential test failed: {str(e)}")
    
    def test_backend_logs_analysis(self):
        """Test 6: Backend Logs Analysis"""
        print("🔍 TEST 6: BACKEND LOGS ANALYSIS")
        print("=" * 80)
        
        # Check backend logs for TBO-related errors
        try:
            # Trigger a flight search to generate logs
            print("🔄 Triggering flight search to generate backend logs...")
            requests.post(f"{self.backend_url}/flights/search", 
                         json={
                             "origin": "DEL",
                             "destination": "BOM", 
                             "departure_date": "2025-02-15",
                             "passengers": 1,
                             "class_type": "economy"
                         }, timeout=10)
            
            self.log_test("Backend Logs Analysis", True, 
                        "Flight search triggered to generate logs. Check supervisor logs for TBO authentication errors.")
            
        except Exception as e:
            self.log_test("Backend Logs Analysis", False, 
                        f"Could not trigger backend logs: {str(e)}")
    
    def generate_comprehensive_summary(self):
        """Generate comprehensive test summary with TBO API analysis"""
        print("\n" + "=" * 100)
        print("🎯 TBO API AUTHENTICATION COMPREHENSIVE TEST SUMMARY")
        print("=" * 100)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)")
        print()
        
        # Analyze TBO API responses
        tbo_auth_success = False
        tbo_error_messages = []
        
        for result in self.test_results:
            if "TBO" in result["test"] and "Authentication" in result["test"]:
                if result["success"]:
                    tbo_auth_success = True
                    print(f"✅ TBO AUTHENTICATION SUCCESS: {result['test']}")
                    if result.get("response_data"):
                        print(f"   TokenId: {result['response_data'].get('TokenId', 'Not found')}")
                else:
                    tbo_error_messages.append(f"{result['test']}: {result['details']}")
        
        # Root cause analysis
        print("\n🔍 ROOT CAUSE ANALYSIS:")
        print("=" * 50)
        
        if tbo_auth_success:
            print("✅ TBO API AUTHENTICATION IS WORKING!")
            print("   - Authentication successful with provided credentials")
            print("   - TokenId received from TBO API")
            print("   - Issue may be in backend integration, not TBO API itself")
        else:
            print("❌ TBO API AUTHENTICATION FAILED!")
            print("   - No successful authentication with any tested method")
            print("   - Possible causes:")
            
            # Analyze error patterns
            connection_errors = sum(1 for msg in tbo_error_messages if "connection" in msg.lower() or "timeout" in msg.lower())
            credential_errors = sum(1 for msg in tbo_error_messages if "401" in msg or "403" in msg or "unauthorized" in msg.lower())
            server_errors = sum(1 for msg in tbo_error_messages if "500" in msg or "502" in msg or "503" in msg)
            
            if connection_errors > 0:
                print("     🌐 Network connectivity issues detected")
                print("     🌐 TBO API servers may be unreachable")
            
            if credential_errors > 0:
                print("     🔑 Credential validation failures detected")
                print("     🔑 TBO staging credentials may be expired or invalid")
            
            if server_errors > 0:
                print("     🖥️ TBO server errors detected")
                print("     🖥️ TBO staging environment may be down")
            
            if not any([connection_errors, credential_errors, server_errors]):
                print("     ❓ Unknown authentication failure")
                print("     ❓ May require TBO support contact")
        
        # Detailed error analysis
        if tbo_error_messages:
            print("\n🚨 DETAILED ERROR ANALYSIS:")
            print("=" * 50)
            for error in tbo_error_messages:
                print(f"   ❌ {error}")
        
        # Network connectivity analysis
        network_tests = [r for r in self.test_results if "Network" in r["test"] or "Endpoint" in r["test"]]
        network_success = sum(1 for r in network_tests if r["success"])
        
        if network_tests:
            print(f"\n🌐 NETWORK CONNECTIVITY: {network_success}/{len(network_tests)} tests passed")
            if network_success == len(network_tests):
                print("   ✅ All TBO endpoints are reachable")
            else:
                print("   ⚠️ Some TBO endpoints are unreachable")
        
        # Backend integration analysis
        backend_tests = [r for r in self.test_results if "Backend" in r["test"]]
        backend_success = sum(1 for r in backend_tests if r["success"])
        
        if backend_tests:
            print(f"\n🖥️ BACKEND INTEGRATION: {backend_success}/{len(backend_tests)} tests passed")
            for test in backend_tests:
                if not test["success"] and "mock" in test["details"].lower():
                    print("   ⚠️ Backend is falling back to mock data")
                    print("   ⚠️ TBO integration is not working in backend")
        
        # Recommendations
        print("\n📋 RECOMMENDATIONS:")
        print("=" * 50)
        
        if tbo_auth_success:
            print("1. ✅ TBO API authentication is working - focus on backend integration")
            print("2. 🔍 Check backend TBO service implementation")
            print("3. 🔍 Verify backend is using correct TBO API endpoints")
            print("4. 🔍 Check backend error handling and logging")
        else:
            if connection_errors > 0:
                print("1. 🌐 Check network connectivity to api.tektravels.com")
                print("2. 🌐 Verify firewall rules allow outbound HTTP traffic")
                print("3. 🌐 Test from different network if possible")
            
            if credential_errors > 0:
                print("1. 🔑 Contact TBO support to verify staging credentials")
                print("2. 🔑 Check if account needs reactivation")
                print("3. 🔑 Verify ClientId 'ApiIntegrationNew' is correct")
            
            if server_errors > 0:
                print("1. 🖥️ Check TBO staging environment status")
                print("2. 🖥️ Contact TBO support about server issues")
                print("3. 🖥️ Try again later if temporary outage")
            
            print("4. 📞 Contact TBO support with test results for assistance")
        
        # Next steps
        print("\n🎯 NEXT STEPS:")
        print("=" * 50)
        
        if tbo_auth_success:
            print("1. Fix backend TBO integration using working authentication method")
            print("2. Update backend to use successful authentication endpoint")
            print("3. Test end-to-end flight search with TBO API")
        else:
            print("1. Contact TBO support with detailed error analysis")
            print("2. Verify staging environment status and credentials")
            print("3. Request updated credentials or alternative endpoints")
            print("4. Consider temporary fallback to mock data until resolved")
        
        return tbo_auth_success

def main():
    """Run comprehensive TBO API authentication test"""
    print("🚀 STARTING TBO API AUTHENTICATION COMPREHENSIVE TEST")
    print("=" * 100)
    print("Testing TBO API authentication directly to debug authentication failure")
    print("as per review request.")
    print()
    
    tester = TBOAuthenticationTester()
    
    # Check backend health first
    if not tester.test_backend_health():
        print("❌ Backend not accessible. Continuing with direct TBO API tests...")
    
    # Run all test phases as requested
    tester.test_direct_tbo_authentication_rest()
    tester.test_alternative_tbo_endpoints()
    tester.test_soap_authentication()
    tester.test_backend_tbo_service()
    tester.test_network_connectivity()
    tester.test_credential_validation()
    tester.test_backend_logs_analysis()
    
    # Generate comprehensive summary
    tbo_auth_working = tester.generate_comprehensive_summary()
    
    return tbo_auth_working

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)