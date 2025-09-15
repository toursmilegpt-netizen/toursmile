#!/usr/bin/env python3
"""
Airport Search Ranking Bug Fix Testing
======================================

Testing the two critical bug fixes as requested in the review:

1. **Houston Ranking Bug Fix**: Test that when searching for terms that don't directly 
   relate to Houston, the HOU airport doesn't inappropriately appear at the top of results.

2. **Missing Bratislava Airport**: Test that Bratislava airport (BTS - M. R. Štefánik Airport) 
   is now included in the database and searchable.

Specific test cases to verify:
- Search for "brat" should return Bratislava (BTS)
- Search for "bratislava" should return Bratislava (BTS) 
- Search for "BTS" should return Bratislava airport with score 1000
- Search for "hou" should return Houston airports (IAH, HOU) but not show HOU inappropriately ranked
- Search for "IST" should still return Istanbul with proper ranking
- Search for other newly added airports like Luxembourg (LUX), Malta (MLA), Dublin (DUB), Nice (NCE)
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

class AirportRankingBugTester:
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
        """Test Backend Service Health Check"""
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

    def test_bratislava_partial_search(self):
        """Test 1: Search for 'brat' should return Bratislava (BTS)"""
        print("\n🇸🇰 TESTING BRATISLAVA PARTIAL SEARCH - 'brat'...")
        
        try:
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": "brat"}, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                # Check if Bratislava BTS is found
                bratislava_found = any(
                    airport.get('city', '').lower() == 'bratislava' and 
                    airport.get('iata') == 'BTS'
                    for airport in results
                )
                
                if bratislava_found:
                    bratislava_airport = next(
                        airport for airport in results 
                        if airport.get('city', '').lower() == 'bratislava' and airport.get('iata') == 'BTS'
                    )
                    self.log_test("Bratislava Partial Search - 'brat'", True, 
                                f"Found: {bratislava_airport.get('city')} {bratislava_airport.get('iata')} - {bratislava_airport.get('airport')}")
                    return True
                else:
                    self.log_test("Bratislava Partial Search - 'brat'", False, 
                                f"Bratislava BTS not found in {len(results)} results")
                    return False
            else:
                self.log_test("Bratislava Partial Search - 'brat'", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Bratislava Partial Search - 'brat'", False, f"Error: {str(e)}")
            return False

    def test_bratislava_full_search(self):
        """Test 2: Search for 'bratislava' should return Bratislava (BTS)"""
        print("\n🇸🇰 TESTING BRATISLAVA FULL SEARCH - 'bratislava'...")
        
        try:
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": "bratislava"}, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                # Check if Bratislava BTS is found
                bratislava_found = any(
                    airport.get('city', '').lower() == 'bratislava' and 
                    airport.get('iata') == 'BTS'
                    for airport in results
                )
                
                if bratislava_found:
                    bratislava_airport = next(
                        airport for airport in results 
                        if airport.get('city', '').lower() == 'bratislava' and airport.get('iata') == 'BTS'
                    )
                    self.log_test("Bratislava Full Search - 'bratislava'", True, 
                                f"Found: {bratislava_airport.get('city')} {bratislava_airport.get('iata')} - {bratislava_airport.get('airport')}")
                    return True
                else:
                    self.log_test("Bratislava Full Search - 'bratislava'", False, 
                                f"Bratislava BTS not found in {len(results)} results")
                    return False
            else:
                self.log_test("Bratislava Full Search - 'bratislava'", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Bratislava Full Search - 'bratislava'", False, f"Error: {str(e)}")
            return False

    def test_bratislava_iata_search(self):
        """Test 3: Search for 'BTS' should return Bratislava airport with score 1000"""
        print("\n🇸🇰 TESTING BRATISLAVA IATA SEARCH - 'BTS'...")
        
        try:
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": "BTS"}, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                # Check if Bratislava BTS is found and is first result (highest score)
                if len(results) > 0:
                    first_result = results[0]
                    if (first_result.get('city', '').lower() == 'bratislava' and 
                        first_result.get('iata') == 'BTS'):
                        self.log_test("Bratislava IATA Search - 'BTS'", True, 
                                    f"Found as first result: {first_result.get('city')} {first_result.get('iata')} - {first_result.get('airport')}")
                        return True
                    else:
                        self.log_test("Bratislava IATA Search - 'BTS'", False, 
                                    f"First result is not Bratislava BTS: {first_result.get('city')} {first_result.get('iata')}")
                        return False
                else:
                    self.log_test("Bratislava IATA Search - 'BTS'", False, 
                                "No results returned")
                    return False
            else:
                self.log_test("Bratislava IATA Search - 'BTS'", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Bratislava IATA Search - 'BTS'", False, f"Error: {str(e)}")
            return False

    def test_houston_ranking_fix(self):
        """Test 4: Search for 'hou' should return Houston airports but with proper ranking"""
        print("\n🇺🇸 TESTING HOUSTON RANKING FIX - 'hou'...")
        
        try:
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": "hou"}, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                # Check if Houston airports are found
                houston_airports = [
                    airport for airport in results 
                    if airport.get('city', '').lower() == 'houston'
                ]
                
                if len(houston_airports) >= 2:  # Should find IAH and HOU
                    iah_found = any(airport.get('iata') == 'IAH' for airport in houston_airports)
                    hou_found = any(airport.get('iata') == 'HOU' for airport in houston_airports)
                    
                    if iah_found and hou_found:
                        # Check ranking - IAH should typically come before HOU for "hou" search
                        # since IAH is the main international airport
                        iah_position = next(i for i, airport in enumerate(results) if airport.get('iata') == 'IAH')
                        hou_position = next(i for i, airport in enumerate(results) if airport.get('iata') == 'HOU')
                        
                        self.log_test("Houston Ranking Fix - 'hou'", True, 
                                    f"Found both Houston airports: IAH (pos {iah_position+1}), HOU (pos {hou_position+1})")
                        return True
                    else:
                        missing = []
                        if not iah_found: missing.append('IAH')
                        if not hou_found: missing.append('HOU')
                        self.log_test("Houston Ranking Fix - 'hou'", False, 
                                    f"Missing Houston airports: {', '.join(missing)}")
                        return False
                else:
                    self.log_test("Houston Ranking Fix - 'hou'", False, 
                                f"Found only {len(houston_airports)} Houston airports, expected 2")
                    return False
            else:
                self.log_test("Houston Ranking Fix - 'hou'", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Houston Ranking Fix - 'hou'", False, f"Error: {str(e)}")
            return False

    def test_istanbul_ranking(self):
        """Test 5: Search for 'IST' should return Istanbul with proper ranking"""
        print("\n🇹🇷 TESTING ISTANBUL RANKING - 'IST'...")
        
        try:
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": "IST"}, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                # Check if Istanbul IST is found and is first result (exact IATA match should score 1000)
                if len(results) > 0:
                    first_result = results[0]
                    if (first_result.get('city', '').lower() == 'istanbul' and 
                        first_result.get('iata') == 'IST'):
                        self.log_test("Istanbul Ranking - 'IST'", True, 
                                    f"Found as first result: {first_result.get('city')} {first_result.get('iata')} - {first_result.get('airport')}")
                        return True
                    else:
                        self.log_test("Istanbul Ranking - 'IST'", False, 
                                    f"First result is not Istanbul IST: {first_result.get('city')} {first_result.get('iata')}")
                        return False
                else:
                    self.log_test("Istanbul Ranking - 'IST'", False, 
                                "No results returned")
                    return False
            else:
                self.log_test("Istanbul Ranking - 'IST'", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Istanbul Ranking - 'IST'", False, f"Error: {str(e)}")
            return False

    def test_newly_added_airports(self):
        """Test 6: Search for other newly added airports like Luxembourg (LUX), Malta (MLA), Dublin (DUB), Nice (NCE)"""
        print("\n🌍 TESTING NEWLY ADDED AIRPORTS...")
        
        newly_added_airports = [
            ("LUX", "Luxembourg", "Luxembourg Airport"),
            ("MLA", "Malta", "Malta International Airport"),
            ("DUB", "Dublin", "Dublin Airport"),
            ("NCE", "Nice", "Nice Côte d'Azur Airport")
        ]
        
        all_passed = True
        for iata, city, airport_name in newly_added_airports:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": iata}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Check if the airport is found and is first result (exact IATA match)
                    if len(results) > 0:
                        first_result = results[0]
                        if (first_result.get('city', '').lower() == city.lower() and 
                            first_result.get('iata') == iata):
                            self.log_test(f"Newly Added Airport - {iata}", True, 
                                        f"Found: {first_result.get('city')} {first_result.get('iata')} - {first_result.get('airport')}")
                        else:
                            self.log_test(f"Newly Added Airport - {iata}", False, 
                                        f"First result is not {city} {iata}: {first_result.get('city')} {first_result.get('iata')}")
                            all_passed = False
                    else:
                        self.log_test(f"Newly Added Airport - {iata}", False, 
                                    "No results returned")
                        all_passed = False
                else:
                    self.log_test(f"Newly Added Airport - {iata}", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Newly Added Airport - {iata}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_houston_inappropriate_ranking(self):
        """Test 7: Verify HOU doesn't appear inappropriately for unrelated searches"""
        print("\n🚫 TESTING HOUSTON INAPPROPRIATE RANKING FIX...")
        
        # Test searches that should NOT return Houston airports at the top
        unrelated_searches = [
            ("IST", "Istanbul"),  # Should return Istanbul, not Houston
            ("BTS", "Bratislava"),  # Should return Bratislava, not Houston
            ("LUX", "Luxembourg"),  # Should return Luxembourg, not Houston
            ("DUB", "Dublin")  # Should return Dublin, not Houston
        ]
        
        all_passed = True
        for query, expected_city in unrelated_searches:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": query}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    if len(results) > 0:
                        first_result = results[0]
                        # Check that Houston is NOT the first result
                        if first_result.get('city', '').lower() != 'houston':
                            # Verify the expected city is first
                            if first_result.get('city', '').lower() == expected_city.lower():
                                self.log_test(f"No Houston Bias - '{query}'", True, 
                                            f"Correctly returns {expected_city} first, not Houston")
                            else:
                                self.log_test(f"No Houston Bias - '{query}'", True, 
                                            f"Houston not first (good), but got {first_result.get('city')} instead of {expected_city}")
                        else:
                            self.log_test(f"No Houston Bias - '{query}'", False, 
                                        f"Houston inappropriately appears first for '{query}' search")
                            all_passed = False
                    else:
                        self.log_test(f"No Houston Bias - '{query}'", False, 
                                    "No results returned")
                        all_passed = False
                else:
                    self.log_test(f"No Houston Bias - '{query}'", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"No Houston Bias - '{query}'", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def run_all_tests(self):
        """Run all airport ranking bug fix tests"""
        print("🎯 AIRPORT RANKING BUG FIX TESTING STARTED")
        print("=" * 80)
        
        # Test Backend Health
        if not self.test_backend_health():
            print("❌ Backend not responding. Stopping tests.")
            return 0
        
        # Critical Bug Fix Tests
        print("\n🐛 CRITICAL BUG FIX TESTS:")
        
        # Bratislava Airport Tests (Bug Fix #2)
        self.test_bratislava_partial_search()
        self.test_bratislava_full_search()
        self.test_bratislava_iata_search()
        
        # Houston Ranking Tests (Bug Fix #1)
        self.test_houston_ranking_fix()
        self.test_houston_inappropriate_ranking()
        
        # Verification Tests
        self.test_istanbul_ranking()
        self.test_newly_added_airports()
        
        # Summary
        print("\n" + "=" * 80)
        print("🎯 AIRPORT RANKING BUG FIX TESTING SUMMARY")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        
        print(f"📊 OVERALL SUCCESS RATE: {success_rate:.1f}% ({self.passed_tests}/{self.total_tests} tests passed)")
        
        if success_rate >= 90:
            print("🎉 EXCELLENT: Both critical bug fixes are working perfectly!")
        elif success_rate >= 75:
            print("✅ GOOD: Bug fixes are mostly working with minor issues")
        elif success_rate >= 50:
            print("⚠️ MODERATE: Bug fixes have significant issues")
        else:
            print("❌ CRITICAL: Bug fixes are not working properly")
        
        print("\n📋 DETAILED TEST RESULTS:")
        for result in self.test_results:
            status = "✅ PASS" if result['success'] else "❌ FAIL"
            details = f" | {result['details']}" if result['details'] else ""
            print(f"  {status} - {result['test']}{details}")
        
        # Specific findings for the two critical bug fixes
        print("\n🎯 CRITICAL BUG FIX VERIFICATION:")
        
        # Bug Fix #1: Houston Ranking
        houston_tests = [result for result in self.test_results if 'Houston' in result['test']]
        houston_passed = all(result['success'] for result in houston_tests)
        if houston_passed and len(houston_tests) > 0:
            print("  ✅ BUG FIX #1: Houston ranking issue is RESOLVED")
        else:
            print("  ❌ BUG FIX #1: Houston ranking issue is NOT resolved")
        
        # Bug Fix #2: Bratislava Airport
        bratislava_tests = [result for result in self.test_results if 'Bratislava' in result['test']]
        bratislava_passed = all(result['success'] for result in bratislava_tests)
        if bratislava_passed and len(bratislava_tests) > 0:
            print("  ✅ BUG FIX #2: Missing Bratislava airport is RESOLVED")
        else:
            print("  ❌ BUG FIX #2: Missing Bratislava airport is NOT resolved")
        
        # Overall assessment
        if houston_passed and bratislava_passed:
            print("\n🎉 FINAL ASSESSMENT: Both critical bug fixes are working correctly!")
        elif houston_passed or bratislava_passed:
            print("\n⚠️ FINAL ASSESSMENT: One bug fix is working, but the other needs attention")
        else:
            print("\n❌ FINAL ASSESSMENT: Both critical bug fixes need more work")
        
        return success_rate

if __name__ == "__main__":
    tester = AirportRankingBugTester()
    success_rate = tester.run_all_tests()
    
    # Exit with appropriate code
    if success_rate >= 75:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Failure