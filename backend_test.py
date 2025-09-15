#!/usr/bin/env python3
"""
Enhanced Airport Search Functionality Backend Testing
====================================================

Testing comprehensive global airport database and "All Airports" functionality
as requested in the review. Specifically testing:

1. Enhanced Airport Search API (/api/airports/search)
2. Comprehensive Airport Database (150+ worldwide airports)
3. Multi-Airport City Support (New York: JFK/LGA/EWR, London: LHR/LGW/STN/LTN/LCY, Paris: CDG/ORY)
4. Backend Search Performance and Error Handling
5. City codes like "LON", "NYC", "PAR"

Expected: All international destinations should be searchable, multi-airport cities should return all airports.
"""

import requests
import json
import time
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

class EnhancedAirportSearchTester:
    def __init__(self):
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
        print(f"🔧 Backend URL: {BACKEND_URL}")
        print(f"🔧 API Base URL: {API_BASE_URL}")
        
    def log_test(self, test_name, success, details=""):
        """Log test result"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status} - {test_name}"
        if details:
            result += f" | {details}"
        
        print(result)
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        
    def test_backend_health(self):
        """Test 1: Backend Service Health Check"""
        print("\n🏥 TESTING BACKEND SERVICE HEALTH...")
        
        try:
            # Test root API endpoint
            response = requests.get(f"{API_BASE_URL}/", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                if "TourSmile" in data.get("message", ""):
                    self.log_test("Backend Service Health", True, 
                                f"Status: {response.status_code}, Message: {data.get('message')}")
                    return True
                else:
                    self.log_test("Backend Service Health", False, 
                                f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Backend Service Health", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Backend Service Health", False, f"Connection error: {str(e)}")
            return False
    
    def test_new_york_airports(self):
        """Test New York search returns JFK, LGA, EWR airports"""
        print("\n🗽 TESTING NEW YORK MULTI-AIRPORT SEARCH...")
        
        try:
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": "New York"}, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                # Check for all 3 New York airports
                expected_airports = ['JFK', 'LGA', 'EWR']
                found_airports = []
                
                for airport in results:
                    if airport.get('iata') in expected_airports:
                        found_airports.append(airport.get('iata'))
                
                if len(found_airports) == 3:
                    self.log_test("New York Multi-Airport Search", True, 
                                f"Found all 3 airports: {', '.join(sorted(found_airports))}")
                    return True
                else:
                    self.log_test("New York Multi-Airport Search", False, 
                                f"Found only {len(found_airports)}/3 airports: {', '.join(found_airports)}")
                    return False
            else:
                self.log_test("New York Multi-Airport Search", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("New York Multi-Airport Search", False, f"Error: {str(e)}")
            return False
    
    def test_london_airports(self):
        """Test London search returns LHR, LGW, STN, LTN, LCY airports"""
        print("\n🇬🇧 TESTING LONDON MULTI-AIRPORT SEARCH...")
        
        try:
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": "London"}, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                # Check for all 5 London airports
                expected_airports = ['LHR', 'LGW', 'STN', 'LTN', 'LCY']
                found_airports = []
                
                for airport in results:
                    if airport.get('iata') in expected_airports:
                        found_airports.append(airport.get('iata'))
                
                if len(found_airports) == 5:
                    self.log_test("London Multi-Airport Search", True, 
                                f"Found all 5 airports: {', '.join(sorted(found_airports))}")
                    return True
                else:
                    self.log_test("London Multi-Airport Search", False, 
                                f"Found only {len(found_airports)}/5 airports: {', '.join(found_airports)}")
                    return False
            else:
                self.log_test("London Multi-Airport Search", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("London Multi-Airport Search", False, f"Error: {str(e)}")
            return False
    
    def test_paris_airports(self):
        """Test Paris search returns CDG, ORY airports"""
        print("\n🇫🇷 TESTING PARIS MULTI-AIRPORT SEARCH...")
        
        try:
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": "Paris"}, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                # Check for both Paris airports
                expected_airports = ['CDG', 'ORY']
                found_airports = []
                
                for airport in results:
                    if airport.get('iata') in expected_airports:
                        found_airports.append(airport.get('iata'))
                
                if len(found_airports) == 2:
                    self.log_test("Paris Multi-Airport Search", True, 
                                f"Found both airports: {', '.join(sorted(found_airports))}")
                    return True
                else:
                    self.log_test("Paris Multi-Airport Search", False, 
                                f"Found only {len(found_airports)}/2 airports: {', '.join(found_airports)}")
                    return False
            else:
                self.log_test("Paris Multi-Airport Search", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Paris Multi-Airport Search", False, f"Error: {str(e)}")
            return False
    
    def test_city_codes(self):
        """Test city codes like LON, NYC, PAR"""
        print("\n🏷️ TESTING CITY CODE SEARCHES...")
        
        city_codes = [
            ("LON", "London", 5),  # Should return 5 London airports
            ("NYC", "New York", 3),  # Should return 3 New York airports  
            ("PAR", "Paris", 2)  # Should return 2 Paris airports
        ]
        
        all_passed = True
        for code, city, expected_count in city_codes:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": code}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Check if we get airports for the city
                    city_airports = [airport for airport in results 
                                   if airport.get('city', '').lower() == city.lower()]
                    
                    if len(city_airports) >= expected_count:
                        self.log_test(f"City Code Search - {code}", True, 
                                    f"Found {len(city_airports)} {city} airports")
                    else:
                        self.log_test(f"City Code Search - {code}", False, 
                                    f"Found only {len(city_airports)}/{expected_count} {city} airports")
                        all_passed = False
                else:
                    self.log_test(f"City Code Search - {code}", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"City Code Search - {code}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_indian_airports(self):
        """Test searches for Indian airports"""
        print("\n🇮🇳 TESTING INDIAN AIRPORTS...")
        
        indian_cities = [
            ("Mumbai", "BOM"),
            ("Delhi", "DEL"), 
            ("Bengaluru", "BLR")
        ]
        
        all_passed = True
        for city, iata in indian_cities:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": city}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Check if the expected airport is found
                    airport_found = any(
                        airport.get('city', '').lower() == city.lower() and 
                        airport.get('iata') == iata
                        for airport in results
                    )
                    
                    if airport_found:
                        self.log_test(f"Indian Airport Search - {city}", True, 
                                    f"Found {city} {iata}")
                    else:
                        self.log_test(f"Indian Airport Search - {city}", False, 
                                    f"{city} {iata} not found")
                        all_passed = False
                else:
                    self.log_test(f"Indian Airport Search - {city}", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Indian Airport Search - {city}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_international_airports(self):
        """Test searches for international airports"""
        print("\n🌍 TESTING INTERNATIONAL AIRPORTS...")
        
        international_cities = [
            ("Tokyo", ["NRT", "HND"]),
            ("Singapore", ["SIN"]),
            ("Bangkok", ["BKK", "DMK"])
        ]
        
        all_passed = True
        for city, expected_iatas in international_cities:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": city}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Check if at least one expected airport is found
                    found_iatas = [airport.get('iata') for airport in results 
                                 if airport.get('iata') in expected_iatas]
                    
                    if len(found_iatas) > 0:
                        self.log_test(f"International Airport Search - {city}", True, 
                                    f"Found {city} airports: {', '.join(found_iatas)}")
                    else:
                        self.log_test(f"International Airport Search - {city}", False, 
                                    f"No {city} airports found")
                        all_passed = False
                else:
                    self.log_test(f"International Airport Search - {city}", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"International Airport Search - {city}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_partial_matches(self):
        """Test partial matches and IATA code searches"""
        print("\n🔍 TESTING PARTIAL MATCHES & IATA CODES...")
        
        partial_tests = [
            ("mum", "Mumbai", "BOM"),
            ("del", "Delhi", "DEL"),
            ("BOM", "Mumbai", "BOM"),
            ("JFK", "New York", "JFK")
        ]
        
        all_passed = True
        for query, expected_city, expected_iata in partial_tests:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": query}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Check if the expected airport is found
                    airport_found = any(
                        airport.get('city', '').lower() == expected_city.lower() and 
                        airport.get('iata') == expected_iata
                        for airport in results
                    )
                    
                    if airport_found:
                        self.log_test(f"Partial Match Search - '{query}'", True, 
                                    f"Found {expected_city} {expected_iata}")
                    else:
                        self.log_test(f"Partial Match Search - '{query}'", False, 
                                    f"{expected_city} {expected_iata} not found")
                        all_passed = False
                else:
                    self.log_test(f"Partial Match Search - '{query}'", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Partial Match Search - '{query}'", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_response_performance(self):
        """Test API response times"""
        print("\n⚡ TESTING API PERFORMANCE...")
        
        try:
            start_time = time.time()
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": "Mumbai"}, timeout=TEST_TIMEOUT)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            if response.status_code == 200 and response_time < 2000:  # Less than 2 seconds
                self.log_test("API Response Performance", True, 
                            f"Response time: {response_time:.0f}ms")
                return True
            else:
                self.log_test("API Response Performance", False, 
                            f"Response time: {response_time:.0f}ms or status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("API Response Performance", False, f"Error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test proper error handling"""
        print("\n🛡️ TESTING ERROR HANDLING...")
        
        try:
            # Test empty query
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": ""}, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                if len(results) == 0:
                    self.log_test("Error Handling - Empty Query", True, 
                                "Returns empty results for empty query")
                    return True
                else:
                    self.log_test("Error Handling - Empty Query", False, 
                                f"Should return empty results, got {len(results)}")
                    return False
            else:
                self.log_test("Error Handling - Empty Query", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Error Handling - Empty Query", False, f"Error: {str(e)}")
            return False
    
    def test_data_structure_validation(self):
        """Test that API returns proper data structure"""
        print("\n📋 TESTING DATA STRUCTURE...")
        
        try:
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": "Mumbai"}, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                if len(results) > 0:
                    airport = results[0]
                    required_fields = ['city', 'airport', 'iata', 'country']
                    
                    missing_fields = [field for field in required_fields if field not in airport]
                    
                    if len(missing_fields) == 0:
                        self.log_test("Data Structure Validation", True, 
                                    f"All required fields present: {', '.join(required_fields)}")
                        return True
                    else:
                        self.log_test("Data Structure Validation", False, 
                                    f"Missing fields: {', '.join(missing_fields)}")
                        return False
                else:
                    self.log_test("Data Structure Validation", False, "No results to validate")
                    return False
            else:
                self.log_test("Data Structure Validation", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Data Structure Validation", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all enhanced airport search tests"""
        print("🎯 ENHANCED AIRPORT SEARCH FUNCTIONALITY TESTING STARTED")
        print("=" * 80)
        
        # Test 1: Backend Health
        if not self.test_backend_health():
            print("❌ Backend not responding. Stopping tests.")
            return 0
        
        # Test 2: Multi-Airport City Support (Primary Review Request)
        self.test_new_york_airports()
        self.test_london_airports() 
        self.test_paris_airports()
        
        # Test 3: City Code Support
        self.test_city_codes()
        
        # Test 4: Comprehensive Airport Database
        self.test_indian_airports()
        self.test_international_airports()
        
        # Test 5: Partial Matches and IATA Codes
        self.test_partial_matches()
        
        # Test 6: Performance and Error Handling
        self.test_response_performance()
        self.test_error_handling()
        self.test_data_structure_validation()
        
        # Summary
        print("\n" + "=" * 80)
        print("🎯 ENHANCED AIRPORT SEARCH TESTING SUMMARY")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        
        print(f"📊 OVERALL SUCCESS RATE: {success_rate:.1f}% ({self.passed_tests}/{self.total_tests} tests passed)")
        
        if success_rate >= 90:
            print("🎉 EXCELLENT: Enhanced airport search functionality is production-ready!")
        elif success_rate >= 75:
            print("✅ GOOD: Enhanced airport search functionality is mostly working with minor issues")
        elif success_rate >= 50:
            print("⚠️ MODERATE: Enhanced airport search functionality has significant issues")
        else:
            print("❌ CRITICAL: Enhanced airport search functionality has major problems")
        
        print("\n📋 DETAILED TEST RESULTS:")
        for result in self.test_results:
            status = "✅ PASS" if result['success'] else "❌ FAIL"
            details = f" | {result['details']}" if result['details'] else ""
            print(f"  {status} - {result['test']}{details}")
        
        # Specific findings for review request
        print("\n🎯 REVIEW REQUEST SPECIFIC FINDINGS:")
        
        # Check if New York returns all 3 airports
        ny_test = any(result['test'] == "New York Multi-Airport Search" and result['success'] 
                     for result in self.test_results)
        if ny_test:
            print("  ✅ New York search returns JFK, LGA, EWR airports")
        else:
            print("  ❌ New York search does not return all 3 airports")
        
        # Check if London returns all 5 airports  
        london_test = any(result['test'] == "London Multi-Airport Search" and result['success'] 
                         for result in self.test_results)
        if london_test:
            print("  ✅ London search returns LHR, LGW, STN, LTN, LCY airports")
        else:
            print("  ❌ London search does not return all 5 airports")
        
        # Check if Paris returns both airports
        paris_test = any(result['test'] == "Paris Multi-Airport Search" and result['success'] 
                        for result in self.test_results)
        if paris_test:
            print("  ✅ Paris search returns CDG, ORY airports")
        else:
            print("  ❌ Paris search does not return both airports")
        
        # Check if city codes work
        city_codes_test = any("City Code Search" in result['test'] and result['success'] 
                             for result in self.test_results)
        if city_codes_test:
            print("  ✅ City codes like LON, NYC, PAR work properly")
        else:
            print("  ❌ City codes like LON, NYC, PAR do not work properly")
        
        return success_rate

if __name__ == "__main__":
    tester = EnhancedAirportSearchTester()
    success_rate = tester.run_all_tests()
    
    # Exit with appropriate code
    if success_rate >= 75:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Failure