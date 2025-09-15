#!/usr/bin/env python3
"""
FINAL COMPREHENSIVE AIRPORT DATABASE VERIFICATION - 100% SUCCESS TARGET
=====================================================================

Testing comprehensive airport database updates to achieve absolute perfection 
with 100% success rate for all critical test cases as requested in review.

COMPREHENSIVE VERIFICATION TESTS:
1. Previously Fixed Issues Verification (Dublin 'DUB', Islamabad 'ISB')
2. User-Requested Critical Missing Airports (Bratislava 'BTS', Luxembourg 'LUX', etc.)
3. Houston Ranking Bug Final Verification
4. Comprehensive Database Size
5. Scoring Algorithm Perfection
6. Backend API Performance

Expected Result: 100% test success rate with comprehensive database coverage,
perfect ranking, and resolved critical bugs.
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

class ComprehensiveAirportDatabaseTester:
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

    def test_previously_fixed_issues(self):
        """Test 1: Previously Fixed Issues Verification"""
        print("\n🔧 TESTING PREVIOUSLY FIXED ISSUES...")
        
        # Test cases for previously reported bugs
        test_cases = [
            ("DUB", "Dublin", "Dublin Airport", 1000),  # Should return Dublin first with score 1000
            ("ISB", "Islamabad", "Islamabad International Airport", 1000),  # Should return Islamabad first with score 1000
        ]
        
        all_passed = True
        for iata_code, expected_city, expected_airport, expected_score in test_cases:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": iata_code}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    if len(results) > 0:
                        first_result = results[0]
                        
                        # Check if first result is the exact match
                        if (first_result.get('iata') == iata_code and 
                            expected_city.lower() in first_result.get('city', '').lower()):
                            self.log_test(f"Previously Fixed - {iata_code} Search", True, 
                                        f"Found {expected_city} first with IATA {iata_code}")
                        else:
                            self.log_test(f"Previously Fixed - {iata_code} Search", False, 
                                        f"Expected {expected_city} first, got {first_result.get('city')} {first_result.get('iata')}")
                            all_passed = False
                    else:
                        self.log_test(f"Previously Fixed - {iata_code} Search", False, 
                                    f"No results found for {iata_code}")
                        all_passed = False
                else:
                    self.log_test(f"Previously Fixed - {iata_code} Search", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Previously Fixed - {iata_code} Search", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_user_requested_missing_airports(self):
        """Test 2: User-Requested Critical Missing Airports"""
        print("\n🌍 TESTING USER-REQUESTED CRITICAL MISSING AIRPORTS...")
        
        # Critical airports that were reported missing by user
        critical_airports = [
            ("BTS", "Bratislava", "M. R. Štefánik Airport"),
            ("LUX", "Luxembourg", "Luxembourg Airport"),
            ("MLA", "Malta", "Malta International Airport"),
            ("KEF", "Reykjavik", "Keflavík International Airport"),
            ("NCE", "Nice", "Nice Côte d'Azur Airport"),
            ("VCE", "Venice", "Venice Marco Polo Airport"),
            ("FLR", "Florence", "Florence Airport"),
            ("NAP", "Naples", "Naples International Airport"),
            ("PMO", "Palermo", "Falcone-Borsellino Airport"),
        ]
        
        all_passed = True
        for iata_code, expected_city, expected_airport in critical_airports:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": iata_code}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Check if the airport is found
                    airport_found = any(
                        airport.get('iata') == iata_code and 
                        expected_city.lower() in airport.get('city', '').lower()
                        for airport in results
                    )
                    
                    if airport_found:
                        self.log_test(f"Critical Missing Airport - {iata_code}", True, 
                                    f"Found {expected_city} {iata_code} - {expected_airport}")
                    else:
                        self.log_test(f"Critical Missing Airport - {iata_code}", False, 
                                    f"Missing {expected_city} {iata_code} - {expected_airport}")
                        all_passed = False
                else:
                    self.log_test(f"Critical Missing Airport - {iata_code}", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Critical Missing Airport - {iata_code}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_houston_ranking_bug(self):
        """Test 3: Houston Ranking Bug Final Verification"""
        print("\n🏢 TESTING HOUSTON RANKING BUG VERIFICATION...")
        
        # Test that Houston HOU doesn't inappropriately appear in unrelated searches
        unrelated_searches = ["DUB", "ISB", "BTS", "LUX", "MLA"]
        
        all_passed = True
        for search_term in unrelated_searches:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": search_term}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Check if Houston appears inappropriately
                    houston_found = any(
                        airport.get('iata') in ['HOU', 'IAH'] or 
                        'houston' in airport.get('city', '').lower()
                        for airport in results
                    )
                    
                    if not houston_found:
                        self.log_test(f"Houston Bug Check - {search_term}", True, 
                                    f"Houston correctly NOT found in {search_term} search")
                    else:
                        self.log_test(f"Houston Bug Check - {search_term}", False, 
                                    f"Houston inappropriately found in {search_term} search")
                        all_passed = False
                else:
                    self.log_test(f"Houston Bug Check - {search_term}", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Houston Bug Check - {search_term}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_comprehensive_database_size(self):
        """Test 4: Comprehensive Database Size"""
        print("\n📊 TESTING COMPREHENSIVE DATABASE SIZE...")
        
        # Test various international destinations to verify global coverage
        global_destinations = [
            ("Singapore", "SIN"),
            ("Hong Kong", "HKG"),
            ("Seoul", "ICN"),
            ("Auckland", "AKL"),
            ("Melbourne", "MEL"),
            ("Tokyo", "NRT"),
            ("Bangkok", "BKK"),
            ("Dubai", "DXB"),
            ("London", "LHR"),
            ("Paris", "CDG"),
            ("New York", "JFK"),
            ("Los Angeles", "LAX"),
            ("Sydney", "SYD"),
            ("Toronto", "YYZ"),
            ("Vancouver", "YVR"),
        ]
        
        found_count = 0
        for city_or_code, expected_iata in global_destinations:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": city_or_code}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Check if the expected airport is found
                    airport_found = any(
                        airport.get('iata') == expected_iata
                        for airport in results
                    )
                    
                    if airport_found:
                        found_count += 1
                        
            except Exception as e:
                pass  # Continue testing other airports
        
        # Calculate coverage percentage
        coverage_percentage = (found_count / len(global_destinations)) * 100
        
        if coverage_percentage >= 90:
            self.log_test("Comprehensive Database Coverage", True, 
                        f"Found {found_count}/{len(global_destinations)} major airports ({coverage_percentage:.1f}%)")
            return True
        else:
            self.log_test("Comprehensive Database Coverage", False, 
                        f"Found only {found_count}/{len(global_destinations)} major airports ({coverage_percentage:.1f}%)")
            return False

    def test_scoring_algorithm_perfection(self):
        """Test 5: Scoring Algorithm Perfection"""
        print("\n🎯 TESTING SCORING ALGORITHM PERFECTION...")
        
        # Test exact IATA code matches should score 1000 and appear first
        exact_iata_tests = [
            ("BOM", "Mumbai"),
            ("DEL", "Delhi"),
            ("DUB", "Dublin"),
            ("ISB", "Islamabad"),
            ("BTS", "Bratislava"),
        ]
        
        all_passed = True
        for iata_code, expected_city in exact_iata_tests:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": iata_code}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    if len(results) > 0:
                        first_result = results[0]
                        
                        # Check if exact IATA match appears first
                        if first_result.get('iata') == iata_code:
                            self.log_test(f"Scoring Algorithm - {iata_code}", True, 
                                        f"Exact IATA match {iata_code} appears first")
                        else:
                            self.log_test(f"Scoring Algorithm - {iata_code}", False, 
                                        f"Exact IATA match {iata_code} not first, got {first_result.get('iata')}")
                            all_passed = False
                    else:
                        self.log_test(f"Scoring Algorithm - {iata_code}", False, 
                                    f"No results for {iata_code}")
                        all_passed = False
                else:
                    self.log_test(f"Scoring Algorithm - {iata_code}", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Scoring Algorithm - {iata_code}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_backend_api_performance(self):
        """Test 6: Backend API Performance"""
        print("\n⚡ TESTING BACKEND API PERFORMANCE...")
        
        # Test response time and reliability
        performance_tests = [
            ("Mumbai", "BOM"),
            ("London", "LHR"),
            ("New York", "JFK"),
            ("Dubai", "DXB"),
            ("Singapore", "SIN"),
        ]
        
        total_response_time = 0
        successful_requests = 0
        
        for query, expected_iata in performance_tests:
            try:
                start_time = time.time()
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": query}, timeout=TEST_TIMEOUT)
                end_time = time.time()
                
                response_time = (end_time - start_time) * 1000  # Convert to milliseconds
                total_response_time += response_time
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Check if expected airport is found
                    airport_found = any(
                        airport.get('iata') == expected_iata
                        for airport in results
                    )
                    
                    if airport_found:
                        successful_requests += 1
                        
            except Exception as e:
                pass  # Continue testing
        
        # Calculate average response time
        avg_response_time = total_response_time / len(performance_tests) if len(performance_tests) > 0 else 0
        success_rate = (successful_requests / len(performance_tests)) * 100
        
        # Performance criteria: < 1000ms average response time and > 90% success rate
        if avg_response_time < 1000 and success_rate >= 90:
            self.log_test("Backend API Performance", True, 
                        f"Avg response: {avg_response_time:.0f}ms, Success: {success_rate:.1f}%")
            return True
        else:
            self.log_test("Backend API Performance", False, 
                        f"Avg response: {avg_response_time:.0f}ms, Success: {success_rate:.1f}%")
            return False

    def test_multi_airport_cities(self):
        """Test Multi-Airport Cities Coverage"""
        print("\n🏙️ TESTING MULTI-AIRPORT CITIES...")
        
        multi_airport_cities = [
            ("London", ["LHR", "LGW", "STN", "LTN", "LCY"], 5),
            ("New York", ["JFK", "LGA", "EWR"], 3),
            ("Paris", ["CDG", "ORY"], 2),
            ("Tokyo", ["NRT", "HND"], 2),
            ("Milan", ["MXP", "LIN"], 2),
        ]
        
        all_passed = True
        for city, expected_iatas, expected_count in multi_airport_cities:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": city}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Count how many expected airports are found
                    found_airports = []
                    for airport in results:
                        if airport.get('iata') in expected_iatas:
                            found_airports.append(airport.get('iata'))
                    
                    if len(found_airports) >= expected_count:
                        self.log_test(f"Multi-Airport City - {city}", True, 
                                    f"Found {len(found_airports)}/{expected_count} airports: {', '.join(sorted(found_airports))}")
                    else:
                        self.log_test(f"Multi-Airport City - {city}", False, 
                                    f"Found only {len(found_airports)}/{expected_count} airports: {', '.join(found_airports)}")
                        all_passed = False
                else:
                    self.log_test(f"Multi-Airport City - {city}", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Multi-Airport City - {city}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def run_comprehensive_verification(self):
        """Run all comprehensive airport database verification tests"""
        print("🎯 FINAL COMPREHENSIVE AIRPORT DATABASE VERIFICATION STARTED")
        print("=" * 80)
        print("TARGET: 100% SUCCESS RATE FOR ALL CRITICAL TEST CASES")
        print("=" * 80)
        
        # Test 0: Backend Health Check
        if not self.test_backend_health():
            print("❌ Backend not responding. Stopping tests.")
            return 0
        
        # Test 1: Previously Fixed Issues Verification
        self.test_previously_fixed_issues()
        
        # Test 2: User-Requested Critical Missing Airports
        self.test_user_requested_missing_airports()
        
        # Test 3: Houston Ranking Bug Final Verification
        self.test_houston_ranking_bug()
        
        # Test 4: Comprehensive Database Size
        self.test_comprehensive_database_size()
        
        # Test 5: Scoring Algorithm Perfection
        self.test_scoring_algorithm_perfection()
        
        # Test 6: Backend API Performance
        self.test_backend_api_performance()
        
        # Test 7: Multi-Airport Cities Coverage
        self.test_multi_airport_cities()
        
        # Summary
        print("\n" + "=" * 80)
        print("🎯 FINAL COMPREHENSIVE VERIFICATION SUMMARY")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        
        print(f"📊 OVERALL SUCCESS RATE: {success_rate:.1f}% ({self.passed_tests}/{self.total_tests} tests passed)")
        
        if success_rate == 100:
            print("🎉 PERFECT: 100% SUCCESS RATE ACHIEVED! Airport database is production-ready!")
        elif success_rate >= 95:
            print("🎉 EXCELLENT: Near-perfect success rate! Airport database is production-ready!")
        elif success_rate >= 90:
            print("✅ VERY GOOD: High success rate with minor issues")
        elif success_rate >= 75:
            print("⚠️ GOOD: Acceptable success rate but needs improvements")
        else:
            print("❌ CRITICAL: Major issues found - requires immediate fixes")
        
        print("\n📋 DETAILED TEST RESULTS:")
        for result in self.test_results:
            status = "✅ PASS" if result['success'] else "❌ FAIL"
            details = f" | {result['details']}" if result['details'] else ""
            print(f"  {status} - {result['test']}{details}")
        
        # Critical findings summary
        print("\n🎯 CRITICAL FINDINGS SUMMARY:")
        
        # Previously fixed issues
        prev_fixed = [r for r in self.test_results if "Previously Fixed" in r['test']]
        prev_fixed_success = sum(1 for r in prev_fixed if r['success'])
        print(f"  📌 Previously Fixed Issues: {prev_fixed_success}/{len(prev_fixed)} passed")
        
        # Critical missing airports
        missing_airports = [r for r in self.test_results if "Critical Missing Airport" in r['test']]
        missing_success = sum(1 for r in missing_airports if r['success'])
        print(f"  🌍 Critical Missing Airports: {missing_success}/{len(missing_airports)} found")
        
        # Houston ranking bug
        houston_tests = [r for r in self.test_results if "Houston Bug Check" in r['test']]
        houston_success = sum(1 for r in houston_tests if r['success'])
        print(f"  🏢 Houston Ranking Bug: {houston_success}/{len(houston_tests)} verified")
        
        # Scoring algorithm
        scoring_tests = [r for r in self.test_results if "Scoring Algorithm" in r['test']]
        scoring_success = sum(1 for r in scoring_tests if r['success'])
        print(f"  🎯 Scoring Algorithm: {scoring_success}/{len(scoring_tests)} perfect")
        
        return success_rate

if __name__ == "__main__":
    tester = ComprehensiveAirportDatabaseTester()
    success_rate = tester.run_comprehensive_verification()
    
    # Exit with appropriate code
    if success_rate >= 95:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Failure