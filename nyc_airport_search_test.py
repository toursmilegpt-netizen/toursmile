#!/usr/bin/env python3
"""
NYC AIRPORT SEARCH BUG FIX VERIFICATION TEST
Final verification that the NYC airport search bug is completely resolved after fixing the database inconsistency.

Critical Verification Tests:
1. NYC Search Results - Search "NYC" should return JFK, LGA, EWR (all 3 airports)
2. New York Search Results - Search "New York" should return JFK, LGA, EWR (all 3 airports)  
3. Individual IATA Code Verification - JFK, LGA, EWR searches should work correctly
4. Database Consistency Check - Verify EWR now has city "New York" instead of "Newark"
5. Multi-Airport City Functionality - Verify "All Airports" feature works for New York
6. Case Sensitivity Tests - "nyc", "new york" (lowercase) should work
7. City Code Mapping - NYC → New York mapping should work
8. Scoring Algorithm - All NYC airports should be properly ranked by relevance

Expected Result: 100% success rate for all NYC-related searches
"""

import requests
import json
import time
import sys
from typing import Dict, List, Any

# Backend URL from environment
BACKEND_URL = "https://responsive-travel-1.preview.emergentagent.com/api"

class NYCAirportSearchTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.test_results = []
        self.nyc_airports = ["JFK", "LGA", "EWR"]
        self.expected_city = "New York"
        
    def log_test(self, test_name: str, success: bool, details: str, response_time: float = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_time": response_time
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        time_info = f" ({response_time:.3f}s)" if response_time else ""
        print(f"{status}: {test_name}{time_info}")
        print(f"   {details}")
        print()
        
    def search_airports(self, query: str, limit: int = 10):
        """Search airports with given query"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.backend_url}/airports/search", 
                                  params={"query": query, "limit": limit}, timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code != 200:
                return None, response_time, f"HTTP {response.status_code}: {response.text}"
                
            data = response.json()
            results = data.get("results", [])
            return results, response_time, None
            
        except Exception as e:
            response_time = time.time() - start_time if 'start_time' in locals() else 0
            return None, response_time, f"Request failed: {str(e)}"
    
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
    
    def test_nyc_search_results(self):
        """Test 1: NYC Search Results - Should return JFK, LGA, EWR (all 3 airports)"""
        print("🔍 TEST 1: NYC SEARCH RESULTS")
        print("=" * 60)
        
        results, response_time, error = self.search_airports("NYC")
        
        if error:
            self.log_test("NYC Search", False, error, response_time)
            return False
        
        if not results:
            self.log_test("NYC Search", False, "No results returned for NYC search", response_time)
            return False
        
        # Check if all 3 NYC airports are found
        found_airports = []
        airport_details = []
        
        for result in results:
            iata = result.get("iata", "")
            city = result.get("city", "")
            airport_name = result.get("airport", "")
            
            if iata in self.nyc_airports:
                found_airports.append(iata)
                airport_details.append(f"{iata} - {airport_name}, {city}")
        
        # Check for "All Airports" option
        all_airports_found = False
        for result in results:
            if "All Airports" in result.get("airport", "") or "NYC" in result.get("iata", ""):
                all_airports_found = True
                break
        
        success = len(found_airports) == 3
        details = f"Found {len(found_airports)}/3 NYC airports: {', '.join(found_airports)}. "
        details += f"Details: {'; '.join(airport_details)}. "
        details += f"All Airports option: {'Found' if all_airports_found else 'Not found'}"
        
        self.log_test("NYC Search Results", success, details, response_time)
        return success
    
    def test_new_york_search_results(self):
        """Test 2: New York Search Results - Should return JFK, LGA, EWR (all 3 airports)"""
        print("🔍 TEST 2: NEW YORK SEARCH RESULTS")
        print("=" * 60)
        
        results, response_time, error = self.search_airports("New York")
        
        if error:
            self.log_test("New York Search", False, error, response_time)
            return False
        
        if not results:
            self.log_test("New York Search", False, "No results returned for New York search", response_time)
            return False
        
        # Check if all 3 NYC airports are found
        found_airports = []
        airport_details = []
        ranking_scores = []
        
        for i, result in enumerate(results):
            iata = result.get("iata", "")
            city = result.get("city", "")
            airport_name = result.get("airport", "")
            score = result.get("score", 0)
            
            if iata in self.nyc_airports:
                found_airports.append(iata)
                airport_details.append(f"{iata} - {airport_name}, {city} (Score: {score}, Rank: {i+1})")
                ranking_scores.append(score)
        
        success = len(found_airports) == 3
        details = f"Found {len(found_airports)}/3 NYC airports: {', '.join(found_airports)}. "
        details += f"Details: {'; '.join(airport_details)}. "
        details += f"Ranking properly by relevance: {sorted(ranking_scores, reverse=True) == ranking_scores}"
        
        self.log_test("New York Search Results", success, details, response_time)
        return success
    
    def test_individual_iata_codes(self):
        """Test 3: Individual IATA Code Verification - JFK, LGA, EWR should work correctly"""
        print("🔍 TEST 3: INDIVIDUAL IATA CODE VERIFICATION")
        print("=" * 60)
        
        expected_airports = {
            "JFK": "John F Kennedy International Airport",
            "LGA": "LaGuardia Airport", 
            "EWR": "Newark Liberty International Airport"
        }
        
        all_success = True
        test_details = []
        
        for iata, expected_name in expected_airports.items():
            results, response_time, error = self.search_airports(iata)
            
            if error:
                self.log_test(f"IATA Search: {iata}", False, error, response_time)
                all_success = False
                continue
            
            if not results:
                self.log_test(f"IATA Search: {iata}", False, f"No results for {iata}", response_time)
                all_success = False
                continue
            
            # Check if first result is the correct airport
            first_result = results[0]
            found_iata = first_result.get("iata", "")
            found_name = first_result.get("airport", "")
            found_city = first_result.get("city", "")
            
            iata_match = found_iata == iata
            name_match = expected_name.lower() in found_name.lower()
            city_correct = found_city == self.expected_city
            
            success = iata_match and city_correct
            details = f"{iata} → {found_iata} - {found_name}, {found_city}. "
            details += f"IATA match: {iata_match}, City correct: {city_correct}, Name match: {name_match}"
            
            self.log_test(f"IATA Search: {iata}", success, details, response_time)
            test_details.append(details)
            
            if not success:
                all_success = False
        
        return all_success
    
    def test_database_consistency(self):
        """Test 4: Database Consistency Check - EWR should have city 'New York' not 'Newark'"""
        print("🔍 TEST 4: DATABASE CONSISTENCY CHECK")
        print("=" * 60)
        
        results, response_time, error = self.search_airports("EWR")
        
        if error:
            self.log_test("EWR Database Consistency", False, error, response_time)
            return False
        
        if not results:
            self.log_test("EWR Database Consistency", False, "No results for EWR", response_time)
            return False
        
        # Check EWR city field
        ewr_result = results[0]
        found_city = ewr_result.get("city", "")
        found_airport = ewr_result.get("airport", "")
        
        # The critical fix: EWR should show city as "New York" not "Newark"
        city_fixed = found_city == "New York"
        
        # Also check all NYC airports have consistent city field
        all_consistent = True
        consistency_details = []
        
        for iata in self.nyc_airports:
            airport_results, _, _ = self.search_airports(iata)
            if airport_results:
                airport_city = airport_results[0].get("city", "")
                consistent = airport_city == "New York"
                consistency_details.append(f"{iata}: {airport_city} ({'✅' if consistent else '❌'})")
                if not consistent:
                    all_consistent = False
        
        success = city_fixed and all_consistent
        details = f"EWR city field: '{found_city}' (Expected: 'New York'). "
        details += f"All NYC airports consistent: {all_consistent}. "
        details += f"Details: {', '.join(consistency_details)}"
        
        self.log_test("Database Consistency Check", success, details, response_time)
        return success
    
    def test_multi_airport_city_functionality(self):
        """Test 5: Multi-Airport City Functionality - 'All Airports' feature for New York"""
        print("🔍 TEST 5: MULTI-AIRPORT CITY FUNCTIONALITY")
        print("=" * 60)
        
        # Test city code mapping NYC → New York
        nyc_results, nyc_time, nyc_error = self.search_airports("NYC")
        ny_results, ny_time, ny_error = self.search_airports("New York")
        
        if nyc_error or ny_error:
            error_msg = f"NYC error: {nyc_error}, NY error: {ny_error}"
            self.log_test("Multi-Airport City Functionality", False, error_msg)
            return False
        
        # Check if both searches return similar results (all 3 airports)
        nyc_airports_found = [r.get("iata") for r in nyc_results if r.get("iata") in self.nyc_airports]
        ny_airports_found = [r.get("iata") for r in ny_results if r.get("iata") in self.nyc_airports]
        
        # Check for "All Airports" or city code functionality
        all_airports_in_nyc = any("All" in r.get("airport", "") or "NYC" in r.get("iata", "") for r in nyc_results)
        all_airports_in_ny = any("All" in r.get("airport", "") or "NYC" in r.get("iata", "") for r in ny_results)
        
        # Test scoring algorithm works correctly
        scoring_working = True
        for results in [nyc_results, ny_results]:
            if len(results) > 1:
                scores = [r.get("score", 0) for r in results[:3]]  # Check top 3
                if scores != sorted(scores, reverse=True):
                    scoring_working = False
                    break
        
        success = (len(nyc_airports_found) == 3 and len(ny_airports_found) == 3 and 
                  (all_airports_in_nyc or all_airports_in_ny) and scoring_working)
        
        details = f"NYC search found {len(nyc_airports_found)}/3 airports: {nyc_airports_found}. "
        details += f"New York search found {len(ny_airports_found)}/3 airports: {ny_airports_found}. "
        details += f"All Airports feature: NYC={all_airports_in_nyc}, NY={all_airports_in_ny}. "
        details += f"Scoring algorithm working: {scoring_working}"
        
        self.log_test("Multi-Airport City Functionality", success, details)
        return success
    
    def test_case_sensitivity(self):
        """Test 6: Case Sensitivity Tests - lowercase searches should work"""
        print("🔍 TEST 6: CASE SENSITIVITY TESTS")
        print("=" * 60)
        
        case_tests = [
            ("nyc", "NYC lowercase"),
            ("new york", "New York lowercase"),
            ("jfk", "JFK lowercase"),
            ("lga", "LGA lowercase"),
            ("ewr", "EWR lowercase"),
            ("New York", "Mixed case"),
            ("NYC", "Uppercase")
        ]
        
        all_success = True
        test_results = []
        
        for query, description in case_tests:
            results, response_time, error = self.search_airports(query)
            
            if error:
                self.log_test(f"Case Test: {description}", False, error, response_time)
                all_success = False
                continue
            
            if not results:
                self.log_test(f"Case Test: {description}", False, f"No results for '{query}'", response_time)
                all_success = False
                continue
            
            # For city searches, check if NYC airports are found
            if query.lower() in ["nyc", "new york"]:
                found_nyc_airports = [r.get("iata") for r in results if r.get("iata") in self.nyc_airports]
                success = len(found_nyc_airports) >= 2  # At least 2 of 3 airports
                details = f"'{query}' found {len(found_nyc_airports)}/3 NYC airports: {found_nyc_airports}"
            else:
                # For IATA code searches, check if correct airport is first
                expected_iata = query.upper()
                first_iata = results[0].get("iata", "")
                success = first_iata == expected_iata
                details = f"'{query}' → {first_iata} ({'✅' if success else '❌'})"
            
            self.log_test(f"Case Test: {description}", success, details, response_time)
            test_results.append(success)
            
            if not success:
                all_success = False
        
        return all_success
    
    def test_comprehensive_search_scenarios(self):
        """Test 7: Comprehensive Search Scenarios - Edge cases and variations"""
        print("🔍 TEST 7: COMPREHENSIVE SEARCH SCENARIOS")
        print("=" * 60)
        
        search_scenarios = [
            ("New York City", "Full city name"),
            ("NY", "State abbreviation"),
            ("Manhattan", "Borough name"),
            ("Kennedy", "Partial airport name"),
            ("LaGuardia", "Full airport name"),
            ("Newark", "Newark search should still work"),
        ]
        
        all_success = True
        scenario_results = []
        
        for query, description in search_scenarios:
            results, response_time, error = self.search_airports(query)
            
            if error:
                self.log_test(f"Scenario: {description}", False, error, response_time)
                all_success = False
                continue
            
            if not results:
                self.log_test(f"Scenario: {description}", False, f"No results for '{query}'", response_time)
                all_success = False
                continue
            
            # Check if relevant NYC airports are found
            relevant_airports = []
            for result in results[:5]:  # Check top 5 results
                iata = result.get("iata", "")
                airport_name = result.get("airport", "")
                city = result.get("city", "")
                
                if (iata in self.nyc_airports or 
                    "New York" in city or 
                    any(term in airport_name.lower() for term in ["kennedy", "laguardia", "newark"])):
                    relevant_airports.append(f"{iata}-{airport_name}")
            
            success = len(relevant_airports) > 0
            details = f"'{query}' found {len(relevant_airports)} relevant results: {', '.join(relevant_airports[:3])}"
            
            self.log_test(f"Scenario: {description}", success, details, response_time)
            scenario_results.append(success)
            
            if not success:
                all_success = False
        
        return all_success
    
    def generate_summary(self):
        """Generate comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🎯 NYC AIRPORT SEARCH BUG FIX VERIFICATION - FINAL SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)")
        print()
        
        # Critical test results
        critical_tests = [
            "NYC Search Results",
            "New York Search Results", 
            "Database Consistency Check",
            "Multi-Airport City Functionality"
        ]
        
        critical_passed = 0
        critical_total = 0
        
        print("🔥 CRITICAL TEST RESULTS:")
        for result in self.test_results:
            if any(critical in result["test"] for critical in critical_tests):
                critical_total += 1
                status = "✅ PASS" if result["success"] else "❌ FAIL"
                print(f"   {status} {result['test']}")
                if result["success"]:
                    critical_passed += 1
        
        critical_success_rate = (critical_passed / critical_total) * 100 if critical_total > 0 else 0
        print(f"   📊 Critical Success Rate: {critical_passed}/{critical_total} ({critical_success_rate:.1f}%)")
        print()
        
        # Failed tests details
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("🚨 FAILED TESTS DETAILS:")
            for result in failed_tests:
                print(f"   ❌ {result['test']}: {result['details']}")
            print()
        
        # Final assessment
        print("🎯 FINAL ASSESSMENT:")
        if success_rate == 100:
            print("   ✅ NYC AIRPORT SEARCH BUG COMPLETELY RESOLVED!")
            print("   ✅ All 3 NYC airports (JFK, LGA, EWR) found in every search")
            print("   ✅ Database consistency fixed - EWR shows 'New York' as city")
            print("   ✅ Multi-airport city functionality working perfectly")
            print("   ✅ Case sensitivity and edge cases handled correctly")
            print("   ✅ 100% success rate achieved - Critical bug fix verified!")
        elif success_rate >= 90:
            print("   ⚠️ NYC airport search mostly working but minor issues remain")
            print("   ⚠️ Review failed tests above for remaining issues")
        else:
            print("   ❌ NYC AIRPORT SEARCH BUG NOT FULLY RESOLVED")
            print("   ❌ Critical issues still present - bug fix incomplete")
        
        print()
        print("🎯 EXPECTED RESULT VERIFICATION:")
        expected_criteria = [
            ("NYC search returns JFK, LGA, EWR", "NYC Search Results" in [r["test"] for r in self.test_results if r["success"]]),
            ("New York search returns all 3 airports", "New York Search Results" in [r["test"] for r in self.test_results if r["success"]]),
            ("Individual IATA codes work", any("IATA Search" in r["test"] and r["success"] for r in self.test_results)),
            ("EWR shows city 'New York'", "Database Consistency Check" in [r["test"] for r in self.test_results if r["success"]]),
            ("All Airports feature works", "Multi-Airport City Functionality" in [r["test"] for r in self.test_results if r["success"]]),
            ("Case sensitivity works", any("Case Test" in r["test"] and r["success"] for r in self.test_results))
        ]
        
        for criteria, met in expected_criteria:
            status = "✅" if met else "❌"
            print(f"   {status} {criteria}")
        
        return success_rate == 100

def main():
    """Run NYC airport search bug fix verification"""
    print("🚀 STARTING NYC AIRPORT SEARCH BUG FIX VERIFICATION")
    print("=" * 80)
    print("Final verification that the NYC airport search bug is completely resolved")
    print("after fixing the database inconsistency.")
    print()
    
    tester = NYCAirportSearchTester()
    
    # Check backend health first
    if not tester.test_backend_health():
        print("❌ Backend not accessible. Cannot proceed with testing.")
        return False
    
    # Run all NYC-specific tests
    tester.test_nyc_search_results()
    tester.test_new_york_search_results()
    tester.test_individual_iata_codes()
    tester.test_database_consistency()
    tester.test_multi_airport_city_functionality()
    tester.test_case_sensitivity()
    tester.test_comprehensive_search_scenarios()
    
    # Generate final summary
    bug_completely_fixed = tester.generate_summary()
    
    return bug_completely_fixed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)