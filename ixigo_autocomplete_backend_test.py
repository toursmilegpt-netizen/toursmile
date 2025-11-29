#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Ixigo-Style Autocomplete Functionality
Testing the newly integrated airport search and flight search flow
"""

import requests
import json
import sys
import time
from datetime import datetime, timedelta

# Backend URL from environment
BACKEND_URL = "https://travel-portal-15.preview.emergentagent.com/api"

class IxigoAutocompleteBackendTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status}: {test_name}"
        if details:
            result += f" - {details}"
        
        print(result)
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        
    def test_airport_search_basic(self):
        """Test basic airport search functionality"""
        print("\n🔍 TESTING AIRPORT SEARCH API - BASIC FUNCTIONALITY")
        
        try:
            # Test 1: Basic airport search with city name
            response = requests.get(f"{self.backend_url}/airports/search", 
                                  params={"query": "mumbai", "limit": 10})
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                # Check if Mumbai airport is found
                mumbai_found = any(airport.get('city', '').lower() == 'mumbai' for airport in results)
                if mumbai_found and len(results) > 0:
                    mumbai_airport = next(airport for airport in results if airport.get('city', '').lower() == 'mumbai')
                    expected_fields = ['city', 'airport', 'iata', 'country']
                    has_all_fields = all(field in mumbai_airport for field in expected_fields)
                    
                    if has_all_fields and mumbai_airport.get('iata') == 'BOM':
                        self.log_test("Airport Search - Mumbai by city name", True, 
                                    f"Found {len(results)} results, Mumbai airport with IATA: BOM")
                    else:
                        self.log_test("Airport Search - Mumbai by city name", False, 
                                    f"Missing fields or incorrect IATA code: {mumbai_airport}")
                else:
                    self.log_test("Airport Search - Mumbai by city name", False, 
                                f"Mumbai not found in results: {results}")
            else:
                self.log_test("Airport Search - Mumbai by city name", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Airport Search - Mumbai by city name", False, f"Exception: {str(e)}")
    
    def test_airport_search_iata_codes(self):
        """Test airport search with IATA codes"""
        print("\n🔍 TESTING AIRPORT SEARCH - IATA CODES")
        
        iata_tests = [
            ("BOM", "Mumbai"),
            ("DEL", "Delhi"), 
            ("BLR", "Bengaluru"),
            ("PNQ", "Pune")
        ]
        
        for iata_code, expected_city in iata_tests:
            try:
                response = requests.get(f"{self.backend_url}/airports/search", 
                                      params={"query": iata_code, "limit": 10})
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Check if the airport with this IATA code is found
                    airport_found = any(airport.get('iata', '').upper() == iata_code.upper() for airport in results)
                    
                    if airport_found:
                        airport = next(airport for airport in results if airport.get('iata', '').upper() == iata_code.upper())
                        self.log_test(f"Airport Search - IATA {iata_code}", True, 
                                    f"Found {airport.get('city')} ({airport.get('iata')})")
                    else:
                        self.log_test(f"Airport Search - IATA {iata_code}", False, 
                                    f"IATA {iata_code} not found in results")
                else:
                    self.log_test(f"Airport Search - IATA {iata_code}", False, 
                                f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Airport Search - IATA {iata_code}", False, f"Exception: {str(e)}")
    
    def test_airport_search_partial_matches(self):
        """Test airport search with partial matches"""
        print("\n🔍 TESTING AIRPORT SEARCH - PARTIAL MATCHES")
        
        partial_tests = [
            ("mum", "Mumbai"),
            ("del", "Delhi"),
            ("blr", "Bengaluru"), 
            ("pnq", "Pune")
        ]
        
        for partial_query, expected_city in partial_tests:
            try:
                response = requests.get(f"{self.backend_url}/airports/search", 
                                      params={"query": partial_query, "limit": 10})
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Check if expected city is found in results
                    city_found = any(expected_city.lower() in airport.get('city', '').lower() or 
                                   partial_query.upper() in airport.get('iata', '') for airport in results)
                    
                    if city_found and len(results) > 0:
                        self.log_test(f"Airport Search - Partial '{partial_query}'", True, 
                                    f"Found {len(results)} results including {expected_city}")
                    else:
                        self.log_test(f"Airport Search - Partial '{partial_query}'", False, 
                                    f"Expected city {expected_city} not found in {len(results)} results")
                else:
                    self.log_test(f"Airport Search - Partial '{partial_query}'", False, 
                                f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Airport Search - Partial '{partial_query}'", False, f"Exception: {str(e)}")
    
    def test_airport_search_full_city_names(self):
        """Test airport search with full city names"""
        print("\n🔍 TESTING AIRPORT SEARCH - FULL CITY NAMES")
        
        city_tests = [
            ("Mumbai", "BOM"),
            ("Delhi", "DEL"),
            ("Bengaluru", "BLR"),
            ("Chennai", "MAA")
        ]
        
        for city_name, expected_iata in city_tests:
            try:
                response = requests.get(f"{self.backend_url}/airports/search", 
                                      params={"query": city_name, "limit": 10})
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Check if city is found with correct IATA
                    city_found = any(airport.get('city', '').lower() == city_name.lower() and 
                                   airport.get('iata', '') == expected_iata for airport in results)
                    
                    if city_found:
                        self.log_test(f"Airport Search - Full city '{city_name}'", True, 
                                    f"Found {city_name} with IATA {expected_iata}")
                    else:
                        self.log_test(f"Airport Search - Full city '{city_name}'", False, 
                                    f"City {city_name} with IATA {expected_iata} not found")
                else:
                    self.log_test(f"Airport Search - Full city '{city_name}'", False, 
                                f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Airport Search - Full city '{city_name}'", False, f"Exception: {str(e)}")
    
    def test_popular_airports_coverage(self):
        """Test that popular Indian and international airports are included"""
        print("\n🔍 TESTING POPULAR AIRPORTS COVERAGE")
        
        # Test popular Indian airports
        indian_airports = [
            ("Mumbai", "BOM"), ("Delhi", "DEL"), ("Bengaluru", "BLR"), 
            ("Chennai", "MAA"), ("Kolkata", "CCU"), ("Hyderabad", "HYD"),
            ("Pune", "PNQ"), ("Ahmedabad", "AMD"), ("Goa", "GOX"), ("Kochi", "COK")
        ]
        
        indian_found = 0
        for city, iata in indian_airports:
            try:
                response = requests.get(f"{self.backend_url}/airports/search", 
                                      params={"query": city, "limit": 10})
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    if any(airport.get('iata') == iata for airport in results):
                        indian_found += 1
            except:
                pass
        
        # Test popular international airports
        international_airports = [
            ("Dubai", "DXB"), ("Singapore", "SIN"), ("Bangkok", "BKK"),
            ("London", "LHR"), ("Paris", "CDG"), ("New York", "JFK")
        ]
        
        international_found = 0
        for city, iata in international_airports:
            try:
                response = requests.get(f"{self.backend_url}/airports/search", 
                                      params={"query": city, "limit": 10})
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    if any(airport.get('iata') == iata for airport in results):
                        international_found += 1
            except:
                pass
        
        indian_coverage = (indian_found / len(indian_airports)) * 100
        international_coverage = (international_found / len(international_airports)) * 100
        
        if indian_coverage >= 80 and international_coverage >= 50:
            self.log_test("Popular Airports Coverage", True, 
                        f"Indian: {indian_coverage:.1f}% ({indian_found}/{len(indian_airports)}), "
                        f"International: {international_coverage:.1f}% ({international_found}/{len(international_airports)})")
        else:
            self.log_test("Popular Airports Coverage", False, 
                        f"Insufficient coverage - Indian: {indian_coverage:.1f}%, International: {international_coverage:.1f}%")
    
    def test_flight_search_integration(self):
        """Test that flight search still works properly after autocomplete integration"""
        print("\n🔍 TESTING FLIGHT SEARCH INTEGRATION")
        
        try:
            # Test flight search from Mumbai to Delhi
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            
            flight_search_payload = {
                "origin": "Mumbai",
                "destination": "Delhi", 
                "departure_date": tomorrow,
                "passengers": 1,
                "class_type": "economy"
            }
            
            response = requests.post(f"{self.backend_url}/flights/search", 
                                   json=flight_search_payload,
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['flights', 'search_id', 'ai_recommendation', 'data_source', 'total_found']
                
                if all(field in data for field in required_fields):
                    flights = data.get('flights', [])
                    if len(flights) > 0:
                        # Check flight data structure
                        first_flight = flights[0]
                        flight_fields = ['id', 'airline', 'origin', 'destination', 'price']
                        
                        if all(field in first_flight for field in flight_fields):
                            self.log_test("Flight Search Integration", True, 
                                        f"Found {len(flights)} flights, data source: {data.get('data_source')}")
                        else:
                            self.log_test("Flight Search Integration", False, 
                                        f"Missing flight fields: {first_flight}")
                    else:
                        self.log_test("Flight Search Integration", False, "No flights returned")
                else:
                    self.log_test("Flight Search Integration", False, 
                                f"Missing required fields in response: {list(data.keys())}")
            else:
                self.log_test("Flight Search Integration", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Flight Search Integration", False, f"Exception: {str(e)}")
    
    def test_error_handling(self):
        """Test API error handling"""
        print("\n🔍 TESTING ERROR HANDLING")
        
        # Test empty query
        try:
            response = requests.get(f"{self.backend_url}/airports/search", 
                                  params={"query": "", "limit": 10})
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                if len(results) == 0:
                    self.log_test("Error Handling - Empty Query", True, "Returns empty results for empty query")
                else:
                    self.log_test("Error Handling - Empty Query", False, f"Should return empty results, got {len(results)}")
            else:
                self.log_test("Error Handling - Empty Query", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling - Empty Query", False, f"Exception: {str(e)}")
        
        # Test invalid query
        try:
            response = requests.get(f"{self.backend_url}/airports/search", 
                                  params={"query": "xyz123invalid", "limit": 10})
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                self.log_test("Error Handling - Invalid Query", True, 
                            f"Gracefully handles invalid query, returns {len(results)} results")
            else:
                self.log_test("Error Handling - Invalid Query", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling - Invalid Query", False, f"Exception: {str(e)}")
    
    def test_response_format(self):
        """Test API response format validation"""
        print("\n🔍 TESTING API RESPONSE FORMAT")
        
        try:
            response = requests.get(f"{self.backend_url}/airports/search", 
                                  params={"query": "mumbai", "limit": 5})
            
            if response.status_code == 200:
                data = response.json()
                
                # Check top-level structure
                if 'results' in data and isinstance(data['results'], list):
                    results = data['results']
                    
                    if len(results) > 0:
                        # Check individual airport structure
                        airport = results[0]
                        required_fields = ['city', 'airport', 'iata', 'country']
                        
                        if all(field in airport for field in required_fields):
                            # Check data types
                            valid_types = (
                                isinstance(airport['city'], str) and
                                isinstance(airport['airport'], str) and
                                isinstance(airport['iata'], str) and
                                isinstance(airport['country'], str) and
                                len(airport['iata']) == 2 or len(airport['iata']) == 3  # IATA codes are 2-3 chars
                            )
                            
                            if valid_types:
                                self.log_test("API Response Format", True, 
                                            f"Proper JSON structure with required fields and types")
                            else:
                                self.log_test("API Response Format", False, 
                                            f"Invalid data types: {airport}")
                        else:
                            self.log_test("API Response Format", False, 
                                        f"Missing required fields: {airport}")
                    else:
                        self.log_test("API Response Format", True, "Valid empty results structure")
                else:
                    self.log_test("API Response Format", False, 
                                f"Invalid top-level structure: {data}")
            else:
                self.log_test("API Response Format", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("API Response Format", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 STARTING IXIGO-STYLE AUTOCOMPLETE BACKEND TESTING")
        print(f"Backend URL: {self.backend_url}")
        print("=" * 80)
        
        # Run all test categories
        self.test_airport_search_basic()
        self.test_airport_search_iata_codes()
        self.test_airport_search_partial_matches()
        self.test_airport_search_full_city_names()
        self.test_popular_airports_coverage()
        self.test_flight_search_integration()
        self.test_error_handling()
        self.test_response_format()
        
        # Print summary
        print("\n" + "=" * 80)
        print("🎯 IXIGO-STYLE AUTOCOMPLETE TESTING SUMMARY")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 OVERALL STATUS: EXCELLENT - Ixigo-style autocomplete functionality is working well!")
        elif success_rate >= 60:
            print("⚠️ OVERALL STATUS: GOOD - Most functionality working, some issues to address")
        else:
            print("❌ OVERALL STATUS: NEEDS ATTENTION - Multiple issues found")
        
        print("\n📋 DETAILED FINDINGS:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}")
            if result['details']:
                print(f"   └─ {result['details']}")
        
        return success_rate >= 80

if __name__ == "__main__":
    tester = IxigoAutocompleteBackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)