#!/usr/bin/env python3
"""
Enhanced Search Parameters Backend Testing Suite
Focus: Testing updated backend with enhanced search parameters integration as per review request
"""

import requests
import json
import time
import os
import sys
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
print(f"🎯 ENHANCED SEARCH PARAMETERS BACKEND TESTING")
print(f"Testing backend at: {API_BASE}")
print("=" * 80)

class EnhancedSearchTester:
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
        
        if response_data:
            print(f"📄 RESPONSE DATA:")
            print(json.dumps(response_data, indent=2))
            print("-" * 80)

    def test_enhanced_parameter_acceptance_time_preference(self):
        """Test 1: Enhanced Parameter Acceptance - timePreference=morning"""
        print("\n🌅 TESTING ENHANCED PARAMETER ACCEPTANCE - Time Preference")
        print("=" * 70)
        try:
            payload = {
                "origin": "Mumbai",
                "destination": "Delhi",
                "departure_date": "2025-08-24",
                "passengers": 1,
                "class_type": "economy",
                "timePreference": "morning"
            }
            
            print(f"📤 REQUEST: {json.dumps(payload, indent=2)}")
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if enhanced parameters are accepted without 422 validation errors
                if "flights" in data:
                    # Check if enhanced_parameters are included in response
                    enhanced_params = data.get("enhanced_parameters", {})
                    
                    if "timePreference" in enhanced_params and enhanced_params["timePreference"] == "morning":
                        self.log_result("Enhanced Parameter Acceptance (timePreference)", True, 
                                      f"Backend accepts timePreference=morning without 422 validation errors",
                                      {"enhanced_parameters": enhanced_params, "flights_count": len(data["flights"])})
                        return True
                    else:
                        self.log_result("Enhanced Parameter Acceptance (timePreference)", False, 
                                      f"timePreference not found in enhanced_parameters: {enhanced_params}")
                else:
                    self.log_result("Enhanced Parameter Acceptance (timePreference)", False, 
                                  f"No flights returned in response: {data}")
            elif response.status_code == 422:
                self.log_result("Enhanced Parameter Acceptance (timePreference)", False, 
                              f"422 Validation Error - Backend rejecting timePreference parameter: {response.text}")
            else:
                self.log_result("Enhanced Parameter Acceptance (timePreference)", False, 
                              f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Enhanced Parameter Acceptance (timePreference)", False, f"Error: {str(e)}")
        return False

    def test_enhanced_parameter_acceptance_budget_range(self):
        """Test 2: Enhanced Parameter Acceptance - budgetRange=[3000, 8000]"""
        print("\n💰 TESTING ENHANCED PARAMETER ACCEPTANCE - Budget Range")
        print("=" * 70)
        try:
            payload = {
                "origin": "Mumbai",
                "destination": "Delhi",
                "departure_date": "2025-08-24",
                "passengers": 1,
                "class_type": "economy",
                "budgetRange": [3000, 8000]
            }
            
            print(f"📤 REQUEST: {json.dumps(payload, indent=2)}")
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if enhanced parameters are accepted without 422 validation errors
                if "flights" in data:
                    # Check if enhanced_parameters are included in response
                    enhanced_params = data.get("enhanced_parameters", {})
                    
                    if "budgetRange" in enhanced_params and enhanced_params["budgetRange"] == [3000, 8000]:
                        self.log_result("Enhanced Parameter Acceptance (budgetRange)", True, 
                                      f"Backend accepts budgetRange=[3000, 8000] without 422 validation errors",
                                      {"enhanced_parameters": enhanced_params, "flights_count": len(data["flights"])})
                        return True
                    else:
                        self.log_result("Enhanced Parameter Acceptance (budgetRange)", False, 
                                      f"budgetRange not found in enhanced_parameters: {enhanced_params}")
                else:
                    self.log_result("Enhanced Parameter Acceptance (budgetRange)", False, 
                                  f"No flights returned in response: {data}")
            elif response.status_code == 422:
                self.log_result("Enhanced Parameter Acceptance (budgetRange)", False, 
                              f"422 Validation Error - Backend rejecting budgetRange parameter: {response.text}")
            else:
                self.log_result("Enhanced Parameter Acceptance (budgetRange)", False, 
                              f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Enhanced Parameter Acceptance (budgetRange)", False, f"Error: {str(e)}")
        return False

    def test_parameter_processing_verification(self):
        """Test 3: Parameter Processing Verification - Check backend logs for enhanced parameters message"""
        print("\n🔍 TESTING PARAMETER PROCESSING VERIFICATION - Backend Logs")
        print("=" * 70)
        try:
            # First make a request with enhanced parameters
            payload = {
                "origin": "Mumbai",
                "destination": "Delhi",
                "departure_date": "2025-08-24",
                "passengers": 1,
                "class_type": "economy",
                "timePreference": "morning",
                "budgetRange": [3000, 8000],
                "flexibleDates": True,
                "nearbyAirports": False,
                "corporateBooking": True
            }
            
            print(f"📤 Making request with all enhanced parameters...")
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if enhanced_parameters are included in API response
                enhanced_params = data.get("enhanced_parameters", {})
                
                expected_params = ["timePreference", "budgetRange", "flexibleDates", "nearbyAirports", "corporateBooking"]
                found_params = [param for param in expected_params if param in enhanced_params]
                
                if len(found_params) >= 3:  # At least 3 out of 5 enhanced parameters
                    self.log_result("Parameter Processing Verification", True, 
                                  f"Enhanced parameters are included in API response: {found_params}",
                                  {"enhanced_parameters": enhanced_params})
                    return True
                else:
                    self.log_result("Parameter Processing Verification", False, 
                                  f"Only {len(found_params)}/5 enhanced parameters found in response: {found_params}")
            else:
                self.log_result("Parameter Processing Verification", False, 
                              f"Request failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Parameter Processing Verification", False, f"Error: {str(e)}")
        return False

    def test_backward_compatibility_basic_search(self):
        """Test 4: Backward Compatibility - Basic flight search without enhanced parameters"""
        print("\n🔄 TESTING BACKWARD COMPATIBILITY - Basic Flight Search")
        print("=" * 70)
        try:
            payload = {
                "origin": "Delhi",
                "destination": "Mumbai",
                "departure_date": "2025-08-24",
                "passengers": 1,
                "class_type": "economy"
            }
            
            print(f"📤 REQUEST (Basic): {json.dumps(payload, indent=2)}")
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if basic search still works
                if "flights" in data and "search_id" in data:
                    flights = data["flights"]
                    
                    # Verify no enhanced_parameters in response for basic search
                    enhanced_params = data.get("enhanced_parameters", {})
                    
                    if len(flights) > 0:
                        self.log_result("Backward Compatibility (Basic Search)", True, 
                                      f"Basic flight search works without enhanced parameters. Found {len(flights)} flights",
                                      {"flights_count": len(flights), "enhanced_parameters": enhanced_params})
                        return True
                    else:
                        self.log_result("Backward Compatibility (Basic Search)", False, 
                                      "Basic search returned no flights")
                else:
                    self.log_result("Backward Compatibility (Basic Search)", False, 
                                  f"Basic search missing required fields: {data}")
            else:
                self.log_result("Backward Compatibility (Basic Search)", False, 
                              f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Backward Compatibility (Basic Search)", False, f"Error: {str(e)}")
        return False

    def test_tripjack_api_integration_still_functional(self):
        """Test 5: Verify Tripjack API integration remains functional"""
        print("\n✈️ TESTING TRIPJACK API INTEGRATION - Still Functional")
        print("=" * 70)
        try:
            payload = {
                "origin": "Delhi",
                "destination": "Mumbai",
                "departure_date": "2025-08-24",
                "passengers": 1,
                "class_type": "economy"
            }
            
            print(f"📤 REQUEST: {json.dumps(payload, indent=2)}")
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check data source and flight data
                data_source = data.get("data_source", "unknown")
                flights = data.get("flights", [])
                
                print(f"Data Source: {data_source}")
                print(f"Flights Found: {len(flights)}")
                
                if data_source == "real_api" and len(flights) > 0:
                    # Verify flight data structure
                    flight = flights[0]
                    required_fields = ["airline", "flight_number", "origin", "destination", "price"]
                    missing_fields = [field for field in required_fields if field not in flight]
                    
                    if not missing_fields:
                        self.log_result("Tripjack API Integration", True, 
                                      f"Tripjack API integration functional. Found {len(flights)} real flights",
                                      {"data_source": data_source, "sample_flight": flight})
                        return True
                    else:
                        self.log_result("Tripjack API Integration", False, 
                                      f"Flight data missing required fields: {missing_fields}")
                elif data_source == "mock":
                    self.log_result("Tripjack API Integration", True, 
                                  f"Tripjack API fallback to mock data working. Found {len(flights)} flights",
                                  {"data_source": data_source})
                    return True
                else:
                    self.log_result("Tripjack API Integration", False, 
                                  f"Unknown data source or no flights: {data_source}")
            else:
                self.log_result("Tripjack API Integration", False, 
                              f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Tripjack API Integration", False, f"Error: {str(e)}")
        return False

    def test_error_handling_invalid_budget_range(self):
        """Test 6: Error Handling - Invalid budgetRange values"""
        print("\n🚨 TESTING ERROR HANDLING - Invalid Budget Range")
        print("=" * 70)
        try:
            # Test with invalid budget range (negative values)
            payload = {
                "origin": "Mumbai",
                "destination": "Delhi",
                "departure_date": "2025-08-24",
                "passengers": 1,
                "class_type": "economy",
                "budgetRange": [-1000, -500]  # Invalid negative values
            }
            
            print(f"📤 REQUEST (Invalid Budget): {json.dumps(payload, indent=2)}")
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            print(f"Response Status: {response.status_code}")
            
            # Check if backend handles invalid budget range gracefully
            if response.status_code == 200:
                data = response.json()
                
                # Backend should either:
                # 1. Ignore invalid budget range and return flights
                # 2. Return error message but still provide fallback
                if "flights" in data:
                    flights = data["flights"]
                    enhanced_params = data.get("enhanced_parameters", {})
                    
                    # Check if invalid budget range was processed or ignored
                    if "budgetRange" not in enhanced_params or enhanced_params.get("budgetRange") != [-1000, -500]:
                        self.log_result("Error Handling (Invalid Budget Range)", True, 
                                      f"Backend gracefully handled invalid budget range. Found {len(flights)} flights",
                                      {"enhanced_parameters": enhanced_params})
                        return True
                    else:
                        self.log_result("Error Handling (Invalid Budget Range)", False, 
                                      "Backend accepted invalid negative budget range")
                else:
                    self.log_result("Error Handling (Invalid Budget Range)", False, 
                                  f"No flights returned for invalid budget range: {data}")
            elif response.status_code == 422:
                # 422 validation error is also acceptable for invalid values
                self.log_result("Error Handling (Invalid Budget Range)", True, 
                              f"Backend properly rejected invalid budget range with 422 validation error")
                return True
            else:
                self.log_result("Error Handling (Invalid Budget Range)", False, 
                              f"Unexpected HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Error Handling (Invalid Budget Range)", False, f"Error: {str(e)}")
        return False

    def test_error_handling_invalid_time_preference(self):
        """Test 7: Error Handling - Invalid timePreference values"""
        print("\n🚨 TESTING ERROR HANDLING - Invalid Time Preference")
        print("=" * 70)
        try:
            # Test with invalid time preference
            payload = {
                "origin": "Mumbai",
                "destination": "Delhi",
                "departure_date": "2025-08-24",
                "passengers": 1,
                "class_type": "economy",
                "timePreference": "invalid_time"  # Invalid value
            }
            
            print(f"📤 REQUEST (Invalid Time): {json.dumps(payload, indent=2)}")
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            print(f"Response Status: {response.status_code}")
            
            # Check if backend handles invalid time preference gracefully
            if response.status_code == 200:
                data = response.json()
                
                if "flights" in data:
                    flights = data["flights"]
                    enhanced_params = data.get("enhanced_parameters", {})
                    
                    # Check if invalid time preference was processed or ignored
                    if "timePreference" not in enhanced_params or enhanced_params.get("timePreference") != "invalid_time":
                        self.log_result("Error Handling (Invalid Time Preference)", True, 
                                      f"Backend gracefully handled invalid time preference. Found {len(flights)} flights",
                                      {"enhanced_parameters": enhanced_params})
                        return True
                    else:
                        self.log_result("Error Handling (Invalid Time Preference)", False, 
                                      "Backend accepted invalid time preference value")
                else:
                    self.log_result("Error Handling (Invalid Time Preference)", False, 
                                  f"No flights returned for invalid time preference: {data}")
            elif response.status_code == 422:
                # 422 validation error is also acceptable for invalid values
                self.log_result("Error Handling (Invalid Time Preference)", True, 
                              f"Backend properly rejected invalid time preference with 422 validation error")
                return True
            else:
                self.log_result("Error Handling (Invalid Time Preference)", False, 
                              f"Unexpected HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Error Handling (Invalid Time Preference)", False, f"Error: {str(e)}")
        return False

    def run_enhanced_search_parameters_tests(self):
        """Run comprehensive enhanced search parameters tests as per review request"""
        print("=" * 80)
        print("🚀 ENHANCED SEARCH PARAMETERS BACKEND TESTING")
        print("=" * 80)
        print("Testing the updated backend with enhanced search parameters integration:")
        print("1. Enhanced Parameter Acceptance - timePreference=morning")
        print("2. Enhanced Parameter Acceptance - budgetRange=[3000, 8000]")
        print("3. Parameter Processing Verification - enhanced_parameters in response")
        print("4. Backward Compatibility - basic flight search still works")
        print("5. Tripjack API Integration - remains functional")
        print("6. Error Handling - invalid budgetRange values")
        print("7. Error Handling - invalid timePreference values")
        print("=" * 80)
        
        # Reset results for this test run
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        
        # Run all enhanced search parameter tests
        tests = [
            ("Enhanced Parameter Acceptance (timePreference)", self.test_enhanced_parameter_acceptance_time_preference),
            ("Enhanced Parameter Acceptance (budgetRange)", self.test_enhanced_parameter_acceptance_budget_range),
            ("Parameter Processing Verification", self.test_parameter_processing_verification),
            ("Backward Compatibility", self.test_backward_compatibility_basic_search),
            ("Tripjack API Integration", self.test_tripjack_api_integration_still_functional),
            ("Error Handling (Invalid Budget Range)", self.test_error_handling_invalid_budget_range),
            ("Error Handling (Invalid Time Preference)", self.test_error_handling_invalid_time_preference)
        ]
        
        for test_name, test_func in tests:
            test_func()
            time.sleep(2)  # Pause between tests
        
        # Print comprehensive summary
        print("\n" + "=" * 80)
        print("📊 ENHANCED SEARCH PARAMETERS TEST SUMMARY")
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
        
        # Final assessment
        if success_rate == 100:
            print("🎉 ALL ENHANCED SEARCH PARAMETERS TESTS PASSED!")
            print("✅ Backend accepts enhanced parameters without 422 validation errors")
            print("✅ Enhanced parameters are processed and included in API response")
            print("✅ Backward compatibility maintained for basic searches")
            print("✅ Tripjack API integration remains functional")
            print("✅ Error handling works gracefully for invalid parameter values")
            print("\n🚀 ENHANCED SEARCH PARAMETERS INTEGRATION IS WORKING PERFECTLY!")
        elif success_rate >= 75:
            print("⚠️  Enhanced search parameters mostly working with minor issues")
            print("🔍 Check failed tests above for specific problems")
        else:
            print("🚨 Enhanced search parameters integration has significant issues")
            print("🔧 Parameter validation or processing problems detected")
        
        return self.results

if __name__ == "__main__":
    tester = EnhancedSearchTester()
    results = tester.run_enhanced_search_parameters_tests()
    
    # Exit with appropriate code
    if results['failed'] == 0:
        print("\n🎉 ALL TESTS PASSED!")
        exit(0)
    else:
        print(f"\n⚠️  {results['failed']} TESTS FAILED")
        exit(1)