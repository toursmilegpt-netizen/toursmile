#!/usr/bin/env python3
"""
REAL Tripjack Authentication and Flight Search Integration Test
Tests actual Tripjack staging credentials and live API integration

CRITICAL OBJECTIVES:
1. Real Authentication Test with staging credentials
2. IP Whitelisting Check (IP: 34.121.6.206)
3. Authentication Flow and Token Generation
4. Real Flight Search Delhi→Mumbai for tomorrow
5. Indian LCC Coverage Verification
6. Response Structure Validation
"""

import requests
import json
import time
import os
import sys
from datetime import datetime, timedelta

# Add backend to path for importing Tripjack service
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

# Tripjack staging credentials from .env
TRIPJACK_STAGING_URL = "https://apitest.tripjack.com"
TRIPJACK_USER_ID = "712709"
TRIPJACK_EMAIL = "sujit@smileholidays.net"
TRIPJACK_PASSWORD = "Smile@123"
TRIPJACK_AGENCY = "Smile Holidays"
OUR_IP = "34.121.6.206"

print(f"🚀 REAL TRIPJACK AUTHENTICATION & FLIGHT SEARCH TEST")
print(f"=" * 80)
print(f"Testing backend at: {API_BASE}")
print(f"Tripjack Staging URL: {TRIPJACK_STAGING_URL}")
print(f"User ID: {TRIPJACK_USER_ID}")
print(f"Email: {TRIPJACK_EMAIL}")
print(f"Agency: {TRIPJACK_AGENCY}")
print(f"Our IP: {OUR_IP}")
print(f"=" * 80)

class TripjackRealAuthTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'TourSmile-Testing/1.0'
        })
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': [],
            'critical_findings': []
        }
        self.access_token = None

    def log_result(self, test_name, success, message="", response_data=None, critical=False):
        """Log test result with critical findings tracking"""
        self.results['total_tests'] += 1
        if success:
            self.results['passed'] += 1
            print(f"✅ {test_name}: {message}")
        else:
            self.results['failed'] += 1
            self.results['errors'].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: {message}")
            
            if critical:
                self.results['critical_findings'].append(f"{test_name}: {message}")
        
        if response_data:
            print(f"📄 RESPONSE DATA:")
            if isinstance(response_data, dict):
                print(json.dumps(response_data, indent=2))
            else:
                print(str(response_data))
            print("-" * 80)

    def test_direct_tripjack_authentication(self):
        """Test 1: Direct authentication with Tripjack staging API"""
        print("\n🔐 TESTING DIRECT TRIPJACK AUTHENTICATION")
        print("=" * 70)
        
        try:
            # Test multiple authentication endpoints
            auth_endpoints = [
                f"{TRIPJACK_STAGING_URL}/api/login",
                f"{TRIPJACK_STAGING_URL}/auth/login", 
                f"{TRIPJACK_STAGING_URL}/user/login",
                f"{TRIPJACK_STAGING_URL}/api/auth/login",
                f"{TRIPJACK_STAGING_URL}/api/user/authenticate",
                f"{TRIPJACK_STAGING_URL}/fms/v1/authenticate"
            ]
            
            auth_payloads = [
                {
                    "user_id": TRIPJACK_USER_ID,
                    "email": TRIPJACK_EMAIL,
                    "password": TRIPJACK_PASSWORD,
                    "agency_name": TRIPJACK_AGENCY
                },
                {
                    "username": TRIPJACK_EMAIL,
                    "password": TRIPJACK_PASSWORD,
                    "userId": TRIPJACK_USER_ID
                },
                {
                    "email": TRIPJACK_EMAIL,
                    "password": TRIPJACK_PASSWORD
                }
            ]
            
            for i, endpoint in enumerate(auth_endpoints):
                for j, payload in enumerate(auth_payloads):
                    try:
                        print(f"\n🔄 Testing endpoint {i+1}.{j+1}: {endpoint}")
                        print(f"📤 Payload: {json.dumps(payload, indent=2)}")
                        
                        response = self.session.post(endpoint, json=payload, timeout=30)
                        
                        print(f"📊 Status Code: {response.status_code}")
                        print(f"📋 Response Headers: {dict(response.headers)}")
                        
                        if response.status_code == 200:
                            try:
                                data = response.json()
                                print(f"✅ SUCCESS! Authentication endpoint working")
                                
                                # Look for token in response
                                token_fields = ['access_token', 'token', 'authToken', 'sessionToken', 'jwt']
                                token_found = None
                                
                                for field in token_fields:
                                    if field in data:
                                        token_found = data[field]
                                        self.access_token = token_found
                                        print(f"🔑 Token found in field '{field}': {token_found[:20]}...")
                                        break
                                
                                if token_found:
                                    self.log_result("Direct Tripjack Authentication", True, 
                                                  f"Authentication successful at {endpoint}",
                                                  {"endpoint": endpoint, "token_field": field, "response_keys": list(data.keys())})
                                    return True
                                else:
                                    print(f"⚠️ No token found in response")
                                    self.log_result("Direct Tripjack Authentication", False,
                                                  f"No token in response from {endpoint}",
                                                  data)
                                    
                            except json.JSONDecodeError:
                                print(f"❌ Invalid JSON response: {response.text}")
                                
                        elif response.status_code == 401:
                            print(f"❌ 401 Unauthorized - Invalid credentials")
                            self.log_result("Direct Tripjack Authentication", False,
                                          f"401 Unauthorized at {endpoint} - Invalid credentials",
                                          {"status": 401, "response": response.text}, critical=True)
                            
                        elif response.status_code == 403:
                            print(f"🚨 403 Forbidden - IP WHITELISTING REQUIRED!")
                            print(f"Our IP {OUR_IP} needs to be whitelisted")
                            self.log_result("Direct Tripjack Authentication", False,
                                          f"403 Forbidden at {endpoint} - IP {OUR_IP} needs whitelisting",
                                          {"status": 403, "response": response.text, "our_ip": OUR_IP}, critical=True)
                            
                        elif response.status_code == 404:
                            print(f"❌ 404 Not Found - Endpoint doesn't exist")
                            
                        else:
                            print(f"❌ HTTP {response.status_code}: {response.text}")
                            
                    except requests.exceptions.Timeout:
                        print(f"⏰ Timeout connecting to {endpoint}")
                    except requests.exceptions.ConnectionError:
                        print(f"🔌 Connection error to {endpoint}")
                    except Exception as e:
                        print(f"❌ Error testing {endpoint}: {str(e)}")
            
            # If we reach here, no authentication succeeded
            self.log_result("Direct Tripjack Authentication", False,
                          "All authentication endpoints failed - check credentials or IP whitelisting",
                          critical=True)
            return False
            
        except Exception as e:
            self.log_result("Direct Tripjack Authentication", False, f"Test error: {str(e)}", critical=True)
            return False

    def test_ip_whitelisting_check(self):
        """Test 2: Check if our IP needs whitelisting"""
        print("\n🌐 TESTING IP WHITELISTING REQUIREMENTS")
        print("=" * 70)
        
        try:
            # Test basic connectivity to Tripjack
            test_endpoints = [
                f"{TRIPJACK_STAGING_URL}/",
                f"{TRIPJACK_STAGING_URL}/api/",
                f"{TRIPJACK_STAGING_URL}/health",
                f"{TRIPJACK_STAGING_URL}/status"
            ]
            
            for endpoint in test_endpoints:
                try:
                    print(f"\n🔄 Testing connectivity to: {endpoint}")
                    response = self.session.get(endpoint, timeout=10)
                    
                    print(f"📊 Status Code: {response.status_code}")
                    
                    if response.status_code == 200:
                        print(f"✅ Basic connectivity working")
                        self.log_result("IP Whitelisting Check", True,
                                      f"Basic connectivity to {endpoint} successful - IP not blocked",
                                      {"endpoint": endpoint, "status": 200})
                        return True
                    elif response.status_code == 403:
                        print(f"🚨 403 Forbidden - IP WHITELISTING REQUIRED!")
                        self.log_result("IP Whitelisting Check", False,
                                      f"IP {OUR_IP} blocked by Tripjack - whitelisting required",
                                      {"our_ip": OUR_IP, "endpoint": endpoint}, critical=True)
                        return False
                    else:
                        print(f"📋 Response: {response.status_code} - {response.text[:200]}")
                        
                except requests.exceptions.Timeout:
                    print(f"⏰ Timeout - possible network issue")
                except requests.exceptions.ConnectionError:
                    print(f"🔌 Connection refused - possible IP blocking")
                except Exception as e:
                    print(f"❌ Error: {str(e)}")
            
            # If no endpoint worked, assume IP issue
            self.log_result("IP Whitelisting Check", False,
                          f"No endpoints accessible - IP {OUR_IP} may need whitelisting",
                          {"our_ip": OUR_IP}, critical=True)
            return False
            
        except Exception as e:
            self.log_result("IP Whitelisting Check", False, f"Test error: {str(e)}")
            return False

    def test_backend_tripjack_integration(self):
        """Test 3: Test our backend's Tripjack integration"""
        print("\n🔧 TESTING BACKEND TRIPJACK INTEGRATION")
        print("=" * 70)
        
        try:
            # Import Tripjack service from backend
            from tripjack_flight_api import tripjack_flight_service
            
            print(f"📋 Service initialized: {tripjack_flight_service is not None}")
            print(f"🌐 Base URL: {tripjack_flight_service.base_url}")
            print(f"👤 User ID: {tripjack_flight_service._user_id}")
            print(f"📧 Email: {tripjack_flight_service._email}")
            print(f"🏢 Agency: {tripjack_flight_service._agency_name}")
            
            # Test authentication through our service
            print(f"\n🔐 Testing authentication through our service...")
            auth_success = tripjack_flight_service.authenticate()
            
            if auth_success:
                print(f"✅ Backend authentication successful!")
                print(f"🔑 Access token: {tripjack_flight_service._access_token[:20] if tripjack_flight_service._access_token else 'None'}...")
                
                self.log_result("Backend Tripjack Integration", True,
                              "Backend successfully authenticated with Tripjack",
                              {"auth_success": True, "has_token": bool(tripjack_flight_service._access_token)})
                return True
            else:
                print(f"❌ Backend authentication failed")
                self.log_result("Backend Tripjack Integration", False,
                              "Backend failed to authenticate with Tripjack",
                              {"auth_success": False}, critical=True)
                return False
                
        except ImportError as e:
            self.log_result("Backend Tripjack Integration", False,
                          f"Cannot import Tripjack service: {str(e)}", critical=True)
            return False
        except Exception as e:
            self.log_result("Backend Tripjack Integration", False,
                          f"Backend integration test error: {str(e)}", critical=True)
            return False

    def test_real_flight_search_delhi_mumbai(self):
        """Test 4: Real flight search Delhi→Mumbai for tomorrow"""
        print("\n✈️ TESTING REAL FLIGHT SEARCH: DELHI → MUMBAI")
        print("=" * 70)
        
        try:
            # Calculate tomorrow's date
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            
            payload = {
                "origin": "Delhi",
                "destination": "Mumbai",
                "departure_date": tomorrow,
                "passengers": 2,
                "class_type": "economy"
            }
            
            print(f"📤 Flight Search Request:")
            print(f"   Route: Delhi → Mumbai")
            print(f"   Date: {tomorrow}")
            print(f"   Passengers: 2")
            print(f"   Class: Economy")
            
            response = self.session.post(f"{API_BASE}/flights/search", json=payload, timeout=60)
            
            print(f"\n📊 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                data_source = data.get("data_source", "unknown")
                
                print(f"📋 Data Source: {data_source}")
                print(f"✈️ Flights Found: {len(flights)}")
                
                if data_source == "real_api" and flights:
                    print(f"🎉 REAL TRIPJACK DATA RECEIVED!")
                    
                    # Analyze real flight data
                    lcc_flights = [f for f in flights if f.get('is_lcc', False)]
                    airlines = set(f.get('airline', 'Unknown') for f in flights)
                    price_range = [f.get('price', 0) for f in flights if f.get('price', 0) > 0]
                    
                    print(f"\n📊 REAL FLIGHT DATA ANALYSIS:")
                    print(f"   • Total Flights: {len(flights)}")
                    print(f"   • LCC Flights: {len(lcc_flights)}")
                    print(f"   • Airlines: {', '.join(airlines)}")
                    if price_range:
                        print(f"   • Price Range: ₹{min(price_range)} - ₹{max(price_range)}")
                    
                    # Show sample flights
                    print(f"\n✈️ SAMPLE REAL FLIGHTS:")
                    for i, flight in enumerate(flights[:5], 1):
                        lcc_flag = "💰" if flight.get('is_lcc', False) else "✈️"
                        airline = flight.get('airline', 'Unknown')
                        flight_num = flight.get('flight_number', 'XX000')
                        price = flight.get('price', 0)
                        departure = flight.get('departure_time', 'N/A')
                        arrival = flight.get('arrival_time', 'N/A')
                        duration = flight.get('duration', 'N/A')
                        
                        print(f"   {i}. {lcc_flag} {airline} {flight_num}")
                        print(f"      Time: {departure} → {arrival} ({duration})")
                        print(f"      Price: ₹{price}")
                        
                        # Check fare options
                        fare_options = flight.get('fare_options', [])
                        if fare_options:
                            print(f"      Fare Options: {len(fare_options)} types")
                            for fare in fare_options[:2]:  # Show first 2 fare types
                                print(f"        - {fare.get('fareType', 'Unknown')}: ₹{fare.get('totalPrice', 0)}")
                    
                    # Verify Indian LCC coverage
                    indian_lcc_airlines = ['IndiGo', 'SpiceJet', 'AirAsia India', 'GoFirst', 'Air India Express']
                    found_lcc = [airline for airline in airlines if any(lcc in airline for lcc in indian_lcc_airlines)]
                    
                    print(f"\n🇮🇳 INDIAN LCC COVERAGE VERIFICATION:")
                    print(f"   • Expected LCCs: {', '.join(indian_lcc_airlines)}")
                    print(f"   • Found LCCs: {', '.join(found_lcc) if found_lcc else 'None'}")
                    
                    self.log_result("Real Flight Search Delhi→Mumbai", True,
                                  f"REAL Tripjack data received! {len(flights)} flights, {len(lcc_flights)} LCC flights",
                                  {
                                      "data_source": data_source,
                                      "total_flights": len(flights),
                                      "lcc_flights": len(lcc_flights),
                                      "airlines": list(airlines),
                                      "price_range": f"₹{min(price_range)} - ₹{max(price_range)}" if price_range else "N/A",
                                      "indian_lcc_found": found_lcc
                                  })
                    return True
                    
                elif data_source == "mock":
                    print(f"⚠️ Using mock data - Tripjack API not working")
                    self.log_result("Real Flight Search Delhi→Mumbai", False,
                                  "Flight search falling back to mock data - Tripjack API not accessible",
                                  {"data_source": data_source, "flights_count": len(flights)}, critical=True)
                    return False
                    
                else:
                    print(f"❌ No flights found or unknown data source")
                    self.log_result("Real Flight Search Delhi→Mumbai", False,
                                  f"No flights found, data_source: {data_source}",
                                  data, critical=True)
                    return False
                    
            else:
                print(f"❌ HTTP {response.status_code}: {response.text}")
                self.log_result("Real Flight Search Delhi→Mumbai", False,
                              f"HTTP {response.status_code}: {response.text}",
                              critical=True)
                return False
                
        except Exception as e:
            self.log_result("Real Flight Search Delhi→Mumbai", False,
                          f"Flight search test error: {str(e)}", critical=True)
            return False

    def test_response_structure_validation(self):
        """Test 5: Validate response structure matches our parsing logic"""
        print("\n📋 TESTING RESPONSE STRUCTURE VALIDATION")
        print("=" * 70)
        
        try:
            # Test with a simple flight search
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            
            payload = {
                "origin": "Delhi",
                "destination": "Mumbai", 
                "departure_date": tomorrow,
                "passengers": 1,
                "class_type": "economy"
            }
            
            response = self.session.post(f"{API_BASE}/flights/search", json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check top-level response structure
                required_fields = ["flights", "search_id", "data_source", "total_found"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Response Structure Validation", False,
                                  f"Missing top-level fields: {missing_fields}")
                    return False
                
                flights = data.get("flights", [])
                
                if flights:
                    # Validate flight object structure
                    flight = flights[0]
                    
                    # Required flight fields
                    required_flight_fields = [
                        "id", "airline", "flight_number", "origin", "destination",
                        "departure_time", "arrival_time", "duration", "price"
                    ]
                    
                    # Advanced fields for filtering
                    advanced_fields = [
                        "airline_code", "is_lcc", "fare_options", "aircraft_type",
                        "booking_class", "baggage_info"
                    ]
                    
                    missing_required = [field for field in required_flight_fields if field not in flight]
                    present_advanced = [field for field in advanced_fields if field in flight]
                    
                    print(f"📊 STRUCTURE ANALYSIS:")
                    print(f"   • Required fields present: {len(required_flight_fields) - len(missing_required)}/{len(required_flight_fields)}")
                    print(f"   • Advanced fields present: {len(present_advanced)}/{len(advanced_fields)}")
                    print(f"   • Missing required: {missing_required}")
                    print(f"   • Present advanced: {present_advanced}")
                    
                    # Check fare options structure if present
                    fare_options = flight.get("fare_options", [])
                    if fare_options:
                        fare = fare_options[0]
                        fare_fields = ["fareType", "totalPrice", "basePrice", "currency", "refundable"]
                        present_fare_fields = [field for field in fare_fields if field in fare]
                        
                        print(f"   • Fare option fields: {len(present_fare_fields)}/{len(fare_fields)}")
                        print(f"   • Fare types available: {len(fare_options)}")
                    
                    # Validate data types
                    type_validations = {
                        "price": isinstance(flight.get("price"), (int, float)),
                        "is_lcc": isinstance(flight.get("is_lcc"), bool),
                        "fare_options": isinstance(flight.get("fare_options"), list)
                    }
                    
                    correct_types = sum(type_validations.values())
                    print(f"   • Correct data types: {correct_types}/{len(type_validations)}")
                    
                    if not missing_required and correct_types == len(type_validations):
                        self.log_result("Response Structure Validation", True,
                                      f"Response structure valid with {len(present_advanced)} advanced fields",
                                      {
                                          "required_fields_ok": True,
                                          "advanced_fields": present_advanced,
                                          "fare_options_count": len(fare_options),
                                          "data_types_ok": True
                                      })
                        return True
                    else:
                        self.log_result("Response Structure Validation", False,
                                      f"Structure issues: missing={missing_required}, type_errors={len(type_validations)-correct_types}")
                        return False
                else:
                    self.log_result("Response Structure Validation", False,
                                  "No flights in response to validate structure")
                    return False
                    
            else:
                self.log_result("Response Structure Validation", False,
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Response Structure Validation", False,
                          f"Structure validation error: {str(e)}")
            return False

    def test_comprehensive_lcc_coverage(self):
        """Test 6: Verify comprehensive Indian LCC coverage"""
        print("\n🇮🇳 TESTING COMPREHENSIVE INDIAN LCC COVERAGE")
        print("=" * 70)
        
        try:
            # Test multiple routes to verify LCC coverage
            test_routes = [
                ("Delhi", "Mumbai"),
                ("Mumbai", "Bangalore"),
                ("Delhi", "Chennai"),
                ("Bangalore", "Hyderabad")
            ]
            
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            
            all_airlines = set()
            all_lcc_airlines = set()
            total_flights = 0
            
            for origin, destination in test_routes:
                try:
                    print(f"\n🔍 Testing route: {origin} → {destination}")
                    
                    payload = {
                        "origin": origin,
                        "destination": destination,
                        "departure_date": tomorrow,
                        "passengers": 1,
                        "class_type": "economy"
                    }
                    
                    response = self.session.post(f"{API_BASE}/flights/search", json=payload, timeout=30)
                    
                    if response.status_code == 200:
                        data = response.json()
                        flights = data.get("flights", [])
                        data_source = data.get("data_source", "unknown")
                        
                        if data_source == "real_api" and flights:
                            route_airlines = set(f.get('airline', 'Unknown') for f in flights)
                            route_lcc = set(f.get('airline', 'Unknown') for f in flights if f.get('is_lcc', False))
                            
                            all_airlines.update(route_airlines)
                            all_lcc_airlines.update(route_lcc)
                            total_flights += len(flights)
                            
                            print(f"   ✅ {len(flights)} flights, {len(route_lcc)} LCC airlines")
                            print(f"   Airlines: {', '.join(route_airlines)}")
                            
                        else:
                            print(f"   ⚠️ No real data for this route")
                            
                except Exception as route_error:
                    print(f"   ❌ Error testing route: {str(route_error)}")
            
            # Analyze overall LCC coverage
            expected_indian_lcc = {
                'IndiGo', 'SpiceJet', 'AirAsia India', 'GoFirst', 'Air India Express', 'Akasa Air'
            }
            
            found_lcc = set()
            for airline in all_lcc_airlines:
                for expected in expected_indian_lcc:
                    if expected.lower() in airline.lower():
                        found_lcc.add(expected)
            
            coverage_percentage = (len(found_lcc) / len(expected_indian_lcc)) * 100
            
            print(f"\n📊 COMPREHENSIVE LCC COVERAGE ANALYSIS:")
            print(f"   • Total flights analyzed: {total_flights}")
            print(f"   • Total airlines found: {len(all_airlines)}")
            print(f"   • Total LCC airlines: {len(all_lcc_airlines)}")
            print(f"   • Expected Indian LCCs: {', '.join(expected_indian_lcc)}")
            print(f"   • Found Indian LCCs: {', '.join(found_lcc)}")
            print(f"   • Coverage: {coverage_percentage:.1f}%")
            
            if coverage_percentage >= 50:  # At least 50% of major LCCs
                self.log_result("Comprehensive Indian LCC Coverage", True,
                              f"Good LCC coverage: {coverage_percentage:.1f}% ({len(found_lcc)}/{len(expected_indian_lcc)} major LCCs)",
                              {
                                  "total_flights": total_flights,
                                  "total_airlines": len(all_airlines),
                                  "lcc_airlines": len(all_lcc_airlines),
                                  "coverage_percentage": coverage_percentage,
                                  "found_lcc": list(found_lcc),
                                  "all_airlines": list(all_airlines)
                              })
                return True
            else:
                self.log_result("Comprehensive Indian LCC Coverage", False,
                              f"Limited LCC coverage: {coverage_percentage:.1f}% ({len(found_lcc)}/{len(expected_indian_lcc)} major LCCs)",
                              critical=True)
                return False
                
        except Exception as e:
            self.log_result("Comprehensive Indian LCC Coverage", False,
                          f"LCC coverage test error: {str(e)}")
            return False

    def run_comprehensive_tripjack_tests(self):
        """Run all comprehensive Tripjack authentication and integration tests"""
        print("=" * 80)
        print("🚀 COMPREHENSIVE REAL TRIPJACK AUTHENTICATION & INTEGRATION TESTING")
        print("=" * 80)
        print("CRITICAL OBJECTIVES:")
        print("1. Real Authentication Test with staging credentials")
        print("2. IP Whitelisting Check (IP: 34.121.6.206)")
        print("3. Authentication Flow and Token Generation")
        print("4. Real Flight Search Delhi→Mumbai for tomorrow")
        print("5. Indian LCC Coverage Verification")
        print("6. Response Structure Validation")
        print("=" * 80)
        
        # Reset results
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': [],
            'critical_findings': []
        }
        
        # Run all tests
        tests = [
            ("Direct Tripjack Authentication", self.test_direct_tripjack_authentication),
            ("IP Whitelisting Check", self.test_ip_whitelisting_check),
            ("Backend Tripjack Integration", self.test_backend_tripjack_integration),
            ("Real Flight Search Delhi→Mumbai", self.test_real_flight_search_delhi_mumbai),
            ("Response Structure Validation", self.test_response_structure_validation),
            ("Comprehensive Indian LCC Coverage", self.test_comprehensive_lcc_coverage)
        ]
        
        for test_name, test_func in tests:
            print(f"\n" + "="*50)
            test_func()
            time.sleep(3)  # Pause between tests
        
        # Print comprehensive summary
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TRIPJACK TESTING SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        
        success_rate = (self.results['passed'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        # Critical findings
        if self.results['critical_findings']:
            print(f"\n🚨 CRITICAL FINDINGS:")
            for finding in self.results['critical_findings']:
                print(f"  • {finding}")
        
        # All errors
        if self.results['errors']:
            print(f"\n❌ ALL FAILED TESTS:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        # Final assessment
        print(f"\n" + "=" * 80)
        print("🎯 FINAL ASSESSMENT")
        print("=" * 80)
        
        if success_rate == 100:
            print("🎉 ALL TRIPJACK TESTS PASSED!")
            print("✅ Real authentication working")
            print("✅ IP whitelisting not required")
            print("✅ Flight search returning real data")
            print("✅ Indian LCC coverage comprehensive")
            print("✅ Response structure compatible")
            print("\n🚀 TRIPJACK INTEGRATION IS FULLY OPERATIONAL!")
            
        elif success_rate >= 50:
            print("⚠️ TRIPJACK INTEGRATION PARTIALLY WORKING")
            
            if any("IP" in finding or "403" in finding for finding in self.results['critical_findings']):
                print("🚨 IP WHITELISTING REQUIRED!")
                print(f"   Contact Tripjack to whitelist IP: {OUR_IP}")
                
            if any("auth" in finding.lower() for finding in self.results['critical_findings']):
                print("🔐 AUTHENTICATION ISSUES DETECTED")
                print("   Verify credentials or check API endpoints")
                
            print("🔍 Check critical findings above for specific issues")
            
        else:
            print("🚨 TRIPJACK INTEGRATION HAS MAJOR ISSUES")
            print("❌ Multiple critical failures detected")
            print("🔧 Immediate attention required")
            
            if any("403" in finding for finding in self.results['critical_findings']):
                print(f"\n🎯 LIKELY CAUSE: IP {OUR_IP} needs whitelisting with Tripjack")
                print("📞 Contact Tripjack support to whitelist your IP address")
        
        return self.results


if __name__ == "__main__":
    tester = TripjackRealAuthTester()
    results = tester.run_comprehensive_tripjack_tests()