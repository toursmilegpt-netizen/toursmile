#!/usr/bin/env python3
"""
URGENT FLIGHT SEARCH API DEBUG TEST
Specifically testing the flight search API to debug why frontend isn't receiving results
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
print(f"🔍 DEBUGGING FLIGHT SEARCH API AT: {API_BASE}")

class FlightSearchDebugger:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': BACKEND_URL.replace('/api', ''),
            'Referer': BACKEND_URL.replace('/api', '')
        })
        self.results = []

    def log_result(self, test_name, success, message="", response_data=None, status_code=None):
        """Log detailed test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'status_code': status_code,
            'timestamp': datetime.now().isoformat()
        }
        
        if success:
            print(f"✅ {test_name}: {message}")
        else:
            print(f"❌ {test_name}: {message}")
        
        if status_code:
            print(f"   📊 Status Code: {status_code}")
        
        if response_data:
            print(f"   📄 RESPONSE DATA:")
            print(json.dumps(response_data, indent=4))
        
        print("-" * 80)
        self.results.append(result)

    def test_exact_payload_from_review(self):
        """Test 1: Test the EXACT payload specified in the review request"""
        print("\n🎯 TESTING EXACT PAYLOAD FROM REVIEW REQUEST")
        print("=" * 80)
        
        # Exact payload from review request
        payload = {
            "tripType": "oneway",
            "origin": "Delhi", 
            "destination": "Mumbai",
            "departure_date": "2025-08-13",
            "passengers": 1,
            "class": "economy"
        }
        
        print(f"📤 EXACT PAYLOAD FROM REVIEW:")
        print(json.dumps(payload, indent=2))
        
        try:
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            print(f"📊 Response Status: {response.status_code}")
            print(f"📊 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    self.log_result("Exact Review Payload Test", True, 
                                  f"API accepted exact payload and returned response",
                                  data, response.status_code)
                    return data
                except json.JSONDecodeError:
                    self.log_result("Exact Review Payload Test", False, 
                                  f"Response not valid JSON: {response.text}",
                                  None, response.status_code)
            else:
                try:
                    error_data = response.json()
                    self.log_result("Exact Review Payload Test", False, 
                                  f"API rejected payload with error",
                                  error_data, response.status_code)
                except:
                    self.log_result("Exact Review Payload Test", False, 
                                  f"API error: {response.text}",
                                  None, response.status_code)
            
        except Exception as e:
            self.log_result("Exact Review Payload Test", False, f"Request failed: {str(e)}")
        
        return None

    def test_corrected_payload_format(self):
        """Test 2: Test with corrected payload format based on backend expectations"""
        print("\n🔧 TESTING CORRECTED PAYLOAD FORMAT")
        print("=" * 80)
        
        # Corrected payload based on backend FlightSearchRequest model
        payload = {
            "origin": "Delhi",
            "destination": "Mumbai", 
            "departure_date": "2025-08-13",
            "passengers": 1,
            "class_type": "economy"  # Note: class_type instead of class
        }
        
        print(f"📤 CORRECTED PAYLOAD:")
        print(json.dumps(payload, indent=2))
        
        try:
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            print(f"📊 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    
                    # Analyze response structure
                    flights = data.get("flights", [])
                    data_source = data.get("data_source", "unknown")
                    total_found = data.get("total_found", 0)
                    
                    print(f"🔍 RESPONSE ANALYSIS:")
                    print(f"   Data Source: {data_source}")
                    print(f"   Flights Count: {len(flights)}")
                    print(f"   Total Found: {total_found}")
                    
                    if flights:
                        print(f"   First Flight Sample:")
                        first_flight = flights[0]
                        for key, value in first_flight.items():
                            print(f"     {key}: {value}")
                    
                    self.log_result("Corrected Payload Test", True, 
                                  f"API returned {len(flights)} flights from {data_source}",
                                  data, response.status_code)
                    return data
                    
                except json.JSONDecodeError:
                    self.log_result("Corrected Payload Test", False, 
                                  f"Response not valid JSON: {response.text}",
                                  None, response.status_code)
            else:
                try:
                    error_data = response.json()
                    self.log_result("Corrected Payload Test", False, 
                                  f"API error with corrected payload",
                                  error_data, response.status_code)
                except:
                    self.log_result("Corrected Payload Test", False, 
                                  f"API error: {response.text}",
                                  None, response.status_code)
                    
        except Exception as e:
            self.log_result("Corrected Payload Test", False, f"Request failed: {str(e)}")
        
        return None

    def test_tripjack_integration_status(self):
        """Test 3: Check if Tripjack integration is returning the expected 68 flights"""
        print("\n🚀 TESTING TRIPJACK INTEGRATION STATUS")
        print("=" * 80)
        
        payload = {
            "origin": "Delhi",
            "destination": "Mumbai",
            "departure_date": "2025-08-13", 
            "passengers": 1,
            "class_type": "economy"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                data_source = data.get("data_source", "unknown")
                
                print(f"🔍 TRIPJACK INTEGRATION ANALYSIS:")
                print(f"   Data Source: {data_source}")
                print(f"   Flights Returned: {len(flights)}")
                
                if data_source == "real_api":
                    print(f"   ✅ Using REAL Tripjack API data")
                    
                    # Check if we're getting the expected ~68 flights
                    if len(flights) >= 60:
                        print(f"   ✅ Flight count matches expectation (~68 flights)")
                        
                        # Analyze flight data structure
                        if flights:
                            sample_flight = flights[0]
                            print(f"   📋 Sample Flight Structure:")
                            for key, value in sample_flight.items():
                                print(f"     {key}: {value}")
                            
                            # Check for price issues (₹0 problem)
                            zero_price_count = sum(1 for f in flights if f.get("price", 0) == 0)
                            if zero_price_count > 0:
                                print(f"   ⚠️  WARNING: {zero_price_count}/{len(flights)} flights have ₹0 price")
                            else:
                                print(f"   ✅ All flights have valid pricing")
                        
                        self.log_result("Tripjack Integration Status", True, 
                                      f"Tripjack returning {len(flights)} flights with real API data",
                                      {"sample_flights": flights[:3], "data_source": data_source})
                    else:
                        self.log_result("Tripjack Integration Status", False, 
                                      f"Expected ~68 flights, got {len(flights)}",
                                      {"flights_count": len(flights), "data_source": data_source})
                        
                elif data_source == "mock":
                    print(f"   ⚠️  Using MOCK data - Tripjack API not working")
                    self.log_result("Tripjack Integration Status", False, 
                                  "Tripjack API falling back to mock data",
                                  {"data_source": data_source, "flights_count": len(flights)})
                else:
                    print(f"   ❌ Unknown data source: {data_source}")
                    self.log_result("Tripjack Integration Status", False, 
                                  f"Unknown data source: {data_source}")
                    
            else:
                self.log_result("Tripjack Integration Status", False, 
                              f"API request failed with status {response.status_code}")
                
        except Exception as e:
            self.log_result("Tripjack Integration Status", False, f"Request failed: {str(e)}")

    def test_response_format_structure(self):
        """Test 4: Verify the response format matches frontend expectations"""
        print("\n📋 TESTING RESPONSE FORMAT STRUCTURE")
        print("=" * 80)
        
        payload = {
            "origin": "Delhi",
            "destination": "Mumbai",
            "departure_date": "2025-08-13",
            "passengers": 1,
            "class_type": "economy"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                print(f"🔍 RESPONSE FORMAT ANALYSIS:")
                
                # Check top-level structure
                expected_top_level = ["flights", "search_id", "ai_recommendation", "data_source", "total_found"]
                missing_top_level = [field for field in expected_top_level if field not in data]
                present_top_level = [field for field in expected_top_level if field in data]
                
                print(f"   ✅ Present fields: {present_top_level}")
                if missing_top_level:
                    print(f"   ❌ Missing fields: {missing_top_level}")
                
                # Check flights array structure
                flights = data.get("flights", [])
                if flights:
                    sample_flight = flights[0]
                    expected_flight_fields = ["id", "airline", "flight_number", "origin", "destination", "price", "departure_time", "arrival_time"]
                    missing_flight_fields = [field for field in expected_flight_fields if field not in sample_flight]
                    present_flight_fields = [field for field in expected_flight_fields if field in sample_flight]
                    
                    print(f"   ✅ Flight fields present: {present_flight_fields}")
                    if missing_flight_fields:
                        print(f"   ❌ Flight fields missing: {missing_flight_fields}")
                    
                    # Check if response is in {"flights": [...]} format as expected
                    if "flights" in data and isinstance(data["flights"], list):
                        print(f"   ✅ Response in correct {{\"flights\": [...]}} format")
                        
                        self.log_result("Response Format Structure", True, 
                                      f"Response structure matches frontend expectations",
                                      {"structure_analysis": {
                                          "top_level_present": present_top_level,
                                          "top_level_missing": missing_top_level,
                                          "flight_fields_present": present_flight_fields,
                                          "flight_fields_missing": missing_flight_fields,
                                          "flights_count": len(flights)
                                      }})
                    else:
                        self.log_result("Response Format Structure", False, 
                                      "Response not in expected {\"flights\": [...]} format")
                else:
                    self.log_result("Response Format Structure", False, 
                                  "No flights in response to analyze structure")
                    
            else:
                self.log_result("Response Format Structure", False, 
                              f"Cannot analyze structure - API returned {response.status_code}")
                
        except Exception as e:
            self.log_result("Response Format Structure", False, f"Request failed: {str(e)}")

    def test_cors_and_network_issues(self):
        """Test 5: Check for CORS issues and network problems"""
        print("\n🌐 TESTING CORS AND NETWORK ISSUES")
        print("=" * 80)
        
        # Test with various headers to simulate frontend request
        frontend_headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': BACKEND_URL.replace('/api', ''),
            'Referer': BACKEND_URL.replace('/api', ''),
            'User-Agent': 'Mozilla/5.0 (compatible; TourSmile-Frontend-Test)',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type'
        }
        
        # First test OPTIONS request (CORS preflight)
        try:
            print("🔍 Testing CORS preflight (OPTIONS request)...")
            options_response = self.session.options(f"{API_BASE}/flights/search", headers=frontend_headers)
            
            print(f"   OPTIONS Status: {options_response.status_code}")
            print(f"   CORS Headers:")
            cors_headers = {k: v for k, v in options_response.headers.items() if 'access-control' in k.lower()}
            for header, value in cors_headers.items():
                print(f"     {header}: {value}")
            
            if options_response.status_code in [200, 204]:
                print("   ✅ CORS preflight successful")
                cors_ok = True
            else:
                print("   ⚠️  CORS preflight returned unexpected status")
                cors_ok = False
                
        except Exception as e:
            print(f"   ❌ CORS preflight failed: {str(e)}")
            cors_ok = False
        
        # Test actual POST request with frontend headers
        try:
            print("\n🔍 Testing POST request with frontend headers...")
            
            payload = {
                "origin": "Delhi",
                "destination": "Mumbai",
                "departure_date": "2025-08-13",
                "passengers": 1,
                "class_type": "economy"
            }
            
            post_response = self.session.post(f"{API_BASE}/flights/search", 
                                            json=payload, 
                                            headers=frontend_headers)
            
            print(f"   POST Status: {post_response.status_code}")
            print(f"   Response Time: {post_response.elapsed.total_seconds():.2f}s")
            
            if post_response.status_code == 200:
                try:
                    data = post_response.json()
                    print("   ✅ POST request successful with frontend headers")
                    network_ok = True
                except:
                    print("   ❌ POST response not valid JSON")
                    network_ok = False
            else:
                print(f"   ❌ POST request failed: {post_response.text}")
                network_ok = False
                
        except Exception as e:
            print(f"   ❌ POST request failed: {str(e)}")
            network_ok = False
        
        if cors_ok and network_ok:
            self.log_result("CORS and Network Issues", True, 
                          "No CORS or network issues detected")
        else:
            issues = []
            if not cors_ok:
                issues.append("CORS preflight issues")
            if not network_ok:
                issues.append("Network/POST request issues")
            
            self.log_result("CORS and Network Issues", False, 
                          f"Issues detected: {', '.join(issues)}")

    def test_price_formatting_issue(self):
        """Test 6: Specifically check the ₹0 price issue mentioned in review"""
        print("\n💰 TESTING PRICE FORMATTING ISSUE")
        print("=" * 80)
        
        payload = {
            "origin": "Delhi",
            "destination": "Mumbai",
            "departure_date": "2025-08-13",
            "passengers": 1,
            "class_type": "economy"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                
                if flights:
                    print(f"🔍 PRICE ANALYSIS FOR {len(flights)} FLIGHTS:")
                    
                    zero_price_flights = []
                    valid_price_flights = []
                    
                    for i, flight in enumerate(flights):
                        price = flight.get("price", 0)
                        airline = flight.get("airline", "Unknown")
                        flight_number = flight.get("flight_number", "Unknown")
                        
                        if price == 0:
                            zero_price_flights.append(f"{airline} {flight_number}")
                        else:
                            valid_price_flights.append(f"{airline} {flight_number} - ₹{price}")
                    
                    print(f"   ✅ Flights with valid prices: {len(valid_price_flights)}")
                    if valid_price_flights[:5]:  # Show first 5
                        for flight_info in valid_price_flights[:5]:
                            print(f"     {flight_info}")
                    
                    print(f"   ❌ Flights with ₹0 price: {len(zero_price_flights)}")
                    if zero_price_flights[:5]:  # Show first 5
                        for flight_info in zero_price_flights[:5]:
                            print(f"     {flight_info} - ₹0")
                    
                    if len(zero_price_flights) == 0:
                        self.log_result("Price Formatting Issue", True, 
                                      "All flights have valid pricing - no ₹0 issue",
                                      {"valid_prices": len(valid_price_flights), "zero_prices": len(zero_price_flights)})
                    elif len(zero_price_flights) < len(flights) / 2:
                        self.log_result("Price Formatting Issue", False, 
                                      f"Partial price issue: {len(zero_price_flights)}/{len(flights)} flights have ₹0",
                                      {"valid_prices": len(valid_price_flights), "zero_prices": len(zero_price_flights)})
                    else:
                        self.log_result("Price Formatting Issue", False, 
                                      f"Major price issue: {len(zero_price_flights)}/{len(flights)} flights have ₹0",
                                      {"valid_prices": len(valid_price_flights), "zero_prices": len(zero_price_flights)})
                else:
                    self.log_result("Price Formatting Issue", False, 
                                  "No flights returned to analyze pricing")
            else:
                self.log_result("Price Formatting Issue", False, 
                              f"Cannot test pricing - API returned {response.status_code}")
                
        except Exception as e:
            self.log_result("Price Formatting Issue", False, f"Request failed: {str(e)}")

    def run_complete_debug_analysis(self):
        """Run all debug tests and provide comprehensive analysis"""
        print("=" * 100)
        print("🚨 URGENT FLIGHT SEARCH API DEBUG ANALYSIS")
        print("=" * 100)
        print("Debugging why frontend isn't receiving flight search results...")
        print("Testing based on review request:")
        print("1. Exact payload from review: tripType=oneway, Delhi→Mumbai, 2025-08-13")
        print("2. API response format verification")
        print("3. Tripjack integration status (expected 68 flights)")
        print("4. Response structure analysis")
        print("5. CORS and network issues")
        print("6. Price formatting issues (₹0 problem)")
        print("=" * 100)
        
        # Run all debug tests
        tests = [
            ("Exact Review Payload", self.test_exact_payload_from_review),
            ("Corrected Payload Format", self.test_corrected_payload_format),
            ("Tripjack Integration Status", self.test_tripjack_integration_status),
            ("Response Format Structure", self.test_response_format_structure),
            ("CORS and Network Issues", self.test_cors_and_network_issues),
            ("Price Formatting Issue", self.test_price_formatting_issue)
        ]
        
        for test_name, test_func in tests:
            test_func()
            time.sleep(1)  # Brief pause between tests
        
        # Comprehensive analysis
        print("\n" + "=" * 100)
        print("📊 FLIGHT SEARCH DEBUG ANALYSIS SUMMARY")
        print("=" * 100)
        
        passed_tests = sum(1 for result in self.results if result['success'])
        total_tests = len(self.results)
        
        print(f"Total Debug Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {total_tests - passed_tests} ❌")
        
        print(f"\n🔍 DETAILED FINDINGS:")
        for result in self.results:
            status = "✅" if result['success'] else "❌"
            print(f"  {status} {result['test']}: {result['message']}")
        
        # Root cause analysis
        print(f"\n🎯 ROOT CAUSE ANALYSIS:")
        
        failed_tests = [r for r in self.results if not r['success']]
        if not failed_tests:
            print("✅ No issues found - API working correctly")
            print("🔍 Frontend issue likely in results display logic")
        else:
            print("❌ Issues identified:")
            for failed in failed_tests:
                print(f"  • {failed['test']}: {failed['message']}")
        
        print(f"\n🚀 RECOMMENDATIONS:")
        if passed_tests == total_tests:
            print("✅ Backend API is working correctly")
            print("🔍 Issue is likely in frontend results display/rendering")
            print("📋 Check frontend JavaScript console for errors")
            print("🔧 Verify frontend state management for flight results")
        else:
            print("🔧 Backend issues need to be resolved:")
            for failed in failed_tests:
                if "payload" in failed['test'].lower():
                    print("  • Fix API payload format compatibility")
                elif "tripjack" in failed['test'].lower():
                    print("  • Check Tripjack API credentials and integration")
                elif "price" in failed['test'].lower():
                    print("  • Fix price data handling in Tripjack response parsing")
                elif "cors" in failed['test'].lower():
                    print("  • Configure CORS headers properly")
        
        return self.results

if __name__ == "__main__":
    debugger = FlightSearchDebugger()
    results = debugger.run_complete_debug_analysis()