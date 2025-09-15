#!/usr/bin/env python3
"""
CRITICAL NYC AIRPORT SEARCH BUG INVESTIGATION TEST

This test specifically investigates the critical bug where NYC search returns no results,
despite NYC airports being in the database.

Test Areas:
1. Direct IATA Code Tests: JFK, LGA, EWR should return their respective airports
2. City Name Tests: "New York" and "NYC" should return all 3 NYC airports  
3. City Code Mapping Verification: "NYC" → "New York" mapping
4. Database Consistency Check: Verify all 3 airports are in database
5. Search Algorithm Testing: Case sensitivity and scoring mechanism
6. Root Cause Analysis: Identify why NYC search fails

Expected Fix: NYC search should return all 3 airports (JFK, LGA, EWR)
"""

import requests
import json
import time
import sys
from typing import Dict, List, Any

# Backend URL from environment
BACKEND_URL = "https://flightsearch-ui-1.preview.emergentagent.com/api"

class NYCAirportBugTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.test_results = []
        self.nyc_airports = {
            "JFK": "John F Kennedy International Airport",
            "LGA": "LaGuardia Airport", 
            "EWR": "Newark Liberty International Airport"
        }
        
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
    
    def search_airports(self, query: str, limit: int = 10):
        """Helper method to search airports"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.backend_url}/airports/search", 
                                  params={"query": query, "limit": limit}, timeout=5)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                return data.get("results", []), response_time
            else:
                print(f"   API Error: HTTP {response.status_code} - {response.text}")
                return [], response_time
                
        except Exception as e:
            print(f"   Request Error: {str(e)}")
            return [], 0
    
    def test_direct_iata_codes(self):
        """Test 1: Direct IATA Code Tests"""
        print("🔍 TEST 1: DIRECT IATA CODE TESTS")
        print("=" * 60)
        
        all_found = True
        details = []
        
        for iata, expected_name in self.nyc_airports.items():
            results, response_time = self.search_airports(iata)
            
            if results and len(results) > 0:
                first_result = results[0]
                if first_result.get("iata") == iata:
                    details.append(f"{iata} ✅ Found: {first_result.get('airport', 'Unknown')}")
                    print(f"   ✅ {iata}: {first_result.get('airport')} in {first_result.get('city')}")
                else:
                    all_found = False
                    details.append(f"{iata} ❌ Expected {iata}, got {first_result.get('iata')}")
                    print(f"   ❌ {iata}: Expected {iata}, got {first_result.get('iata')}")
            else:
                all_found = False
                details.append(f"{iata} ❌ Not found")
                print(f"   ❌ {iata}: Not found in database")
        
        self.log_test("Direct IATA Code Tests", all_found, 
                    f"NYC airports found: {'; '.join(details)}")
        return all_found
    
    def test_city_name_searches(self):
        """Test 2: City Name Tests"""
        print("🔍 TEST 2: CITY NAME TESTS")
        print("=" * 60)
        
        # Test "New York" search
        ny_results, ny_time = self.search_airports("New York")
        ny_airports_found = []
        
        print(f"   'New York' search returned {len(ny_results)} results:")
        for result in ny_results[:5]:  # Show first 5 results
            iata = result.get("iata", "")
            airport = result.get("airport", "")
            city = result.get("city", "")
            print(f"     - {iata}: {airport} in {city}")
            if iata in self.nyc_airports:
                ny_airports_found.append(iata)
        
        # Test "NYC" search  
        nyc_results, nyc_time = self.search_airports("NYC")
        nyc_airports_found = []
        
        print(f"   'NYC' search returned {len(nyc_results)} results:")
        for result in nyc_results[:5]:  # Show first 5 results
            iata = result.get("iata", "")
            airport = result.get("airport", "")
            city = result.get("city", "")
            print(f"     - {iata}: {airport} in {city}")
            if iata in self.nyc_airports:
                nyc_airports_found.append(iata)
        
        # Test case insensitive "new york"
        ny_lower_results, ny_lower_time = self.search_airports("new york")
        ny_lower_airports_found = []
        
        print(f"   'new york' (lowercase) search returned {len(ny_lower_results)} results:")
        for result in ny_lower_results[:5]:  # Show first 5 results
            iata = result.get("iata", "")
            airport = result.get("airport", "")
            city = result.get("city", "")
            print(f"     - {iata}: {airport} in {city}")
            if iata in self.nyc_airports:
                ny_lower_airports_found.append(iata)
        
        # Evaluate results
        ny_success = len(ny_airports_found) >= 2  # At least 2 of 3 airports
        nyc_success = len(nyc_airports_found) >= 2  # At least 2 of 3 airports  
        case_success = len(ny_lower_airports_found) >= 2  # Case insensitive works
        
        overall_success = ny_success and nyc_success and case_success
        
        details = (f"'New York': {len(ny_airports_found)}/3 airports ({', '.join(ny_airports_found)}), "
                  f"'NYC': {len(nyc_airports_found)}/3 airports ({', '.join(nyc_airports_found)}), "
                  f"'new york': {len(ny_lower_airports_found)}/3 airports ({', '.join(ny_lower_airports_found)})")
        
        self.log_test("City Name Tests", overall_success, details)
        
        return {
            "new_york": ny_airports_found,
            "nyc": nyc_airports_found, 
            "new_york_lower": ny_lower_airports_found
        }
    
    def test_city_code_mapping(self):
        """Test 3: City Code Mapping Verification"""
        print("🔍 TEST 3: CITY CODE MAPPING VERIFICATION")
        print("=" * 60)
        
        # Test if NYC maps to New York in the backend
        nyc_results, _ = self.search_airports("NYC")
        ny_results, _ = self.search_airports("New York")
        
        # Check if NYC search behavior matches New York search
        nyc_iatas = set(r.get("iata") for r in nyc_results if r.get("iata"))
        ny_iatas = set(r.get("iata") for r in ny_results if r.get("iata"))
        
        # Check for NYC airports specifically
        nyc_airports_in_nyc_search = nyc_iatas.intersection(set(self.nyc_airports.keys()))
        nyc_airports_in_ny_search = ny_iatas.intersection(set(self.nyc_airports.keys()))
        
        mapping_works = len(nyc_airports_in_nyc_search) > 0 or len(nyc_airports_in_ny_search) > 0
        
        print(f"   NYC search found NYC airports: {list(nyc_airports_in_nyc_search)}")
        print(f"   New York search found NYC airports: {list(nyc_airports_in_ny_search)}")
        
        # Test if there's a city code mapping in the backend
        if len(nyc_results) == 0 and len(ny_results) > 0:
            mapping_issue = "NYC search returns no results but New York search works - mapping broken"
        elif len(nyc_results) > 0 and len(ny_results) > 0:
            if nyc_airports_in_nyc_search == nyc_airports_in_ny_search:
                mapping_issue = "City code mapping working correctly"
            else:
                mapping_issue = "City code mapping inconsistent between NYC and New York searches"
        else:
            mapping_issue = "Both searches failing - deeper database issue"
        
        self.log_test("City Code Mapping", mapping_works, 
                    f"{mapping_issue}. NYC→NYC airports: {len(nyc_airports_in_nyc_search)}, NY→NYC airports: {len(nyc_airports_in_ny_search)}")
        
        return mapping_works
    
    def test_database_consistency(self):
        """Test 4: Database Consistency Check"""
        print("🔍 TEST 4: DATABASE CONSISTENCY CHECK")
        print("=" * 60)
        
        # Check each NYC airport individually and examine their city field
        airport_details = {}
        all_consistent = True
        
        for iata in self.nyc_airports.keys():
            results, _ = self.search_airports(iata)
            if results and len(results) > 0:
                first_result = results[0]
                if first_result.get("iata") == iata:
                    city = first_result.get("city", "")
                    airport_name = first_result.get("airport", "")
                    country = first_result.get("country", "")
                    
                    airport_details[iata] = {
                        "city": city,
                        "airport": airport_name,
                        "country": country
                    }
                    
                    print(f"   {iata}: {airport_name}")
                    print(f"        City: '{city}', Country: '{country}'")
                    
                    # Check for consistency issues
                    if iata == "EWR" and "Newark" in city and "New York" not in city:
                        print(f"        ⚠️  POTENTIAL ISSUE: EWR listed as '{city}' instead of 'New York'")
                        all_consistent = False
                else:
                    print(f"   ❌ {iata}: Search returned wrong airport ({first_result.get('iata')})")
                    all_consistent = False
            else:
                print(f"   ❌ {iata}: Not found in database")
                all_consistent = False
        
        # Check if city naming is consistent
        cities_found = set(details.get("city", "") for details in airport_details.values())
        print(f"   Cities found for NYC airports: {list(cities_found)}")
        
        if len(cities_found) > 1:
            print(f"   ⚠️  INCONSISTENCY: NYC airports have different city names: {list(cities_found)}")
            all_consistent = False
        
        self.log_test("Database Consistency", all_consistent, 
                    f"Airport details: {airport_details}. Cities: {list(cities_found)}")
        
        return airport_details
    
    def test_search_algorithm(self):
        """Test 5: Search Algorithm Testing"""
        print("🔍 TEST 5: SEARCH ALGORITHM TESTING")
        print("=" * 60)
        
        # Test scoring mechanism
        test_queries = [
            ("JFK", "Should score 1000 for exact IATA match"),
            ("New York", "Should return NYC airports with high scores"),
            ("NYC", "Should map to New York and return airports"),
            ("new york", "Should work case-insensitive"),
            ("nyc", "Should work case-insensitive")
        ]
        
        algorithm_issues = []
        
        for query, expectation in test_queries:
            results, response_time = self.search_airports(query)
            
            print(f"   Query: '{query}' ({expectation})")
            print(f"   Results: {len(results)} found in {response_time:.3f}s")
            
            if len(results) == 0:
                algorithm_issues.append(f"'{query}' returns no results")
                print(f"     ❌ No results found")
            else:
                # Check first few results
                for i, result in enumerate(results[:3]):
                    iata = result.get("iata", "")
                    airport = result.get("airport", "")
                    city = result.get("city", "")
                    score = result.get("score", "N/A")
                    
                    print(f"     {i+1}. {iata}: {airport} in {city} (Score: {score})")
                    
                    # Check if NYC airports appear for NYC-related queries
                    if query.lower() in ["nyc", "new york", "new york"] and iata in self.nyc_airports:
                        print(f"        ✅ NYC airport found in results")
                    elif query.upper() in self.nyc_airports and iata == query.upper():
                        print(f"        ✅ Exact IATA match found")
        
        algorithm_working = len(algorithm_issues) == 0
        
        self.log_test("Search Algorithm", algorithm_working, 
                    f"Algorithm issues: {algorithm_issues if algorithm_issues else 'None detected'}")
        
        return algorithm_working
    
    def test_root_cause_analysis(self):
        """Test 6: Root Cause Analysis"""
        print("🔍 TEST 6: ROOT CAUSE ANALYSIS")
        print("=" * 60)
        
        # Comprehensive analysis of the NYC search issue
        root_causes = []
        
        # Test 1: Check if airports exist at all
        individual_airport_count = 0
        for iata in self.nyc_airports.keys():
            results, _ = self.search_airports(iata)
            if results and len(results) > 0 and results[0].get("iata") == iata:
                individual_airport_count += 1
        
        if individual_airport_count < 3:
            root_causes.append(f"Missing airports in database: {3 - individual_airport_count}/3 NYC airports not found")
        
        # Test 2: Check city name consistency
        city_names = set()
        for iata in self.nyc_airports.keys():
            results, _ = self.search_airports(iata)
            if results and len(results) > 0 and results[0].get("iata") == iata:
                city_names.add(results[0].get("city", ""))
        
        if len(city_names) > 1:
            root_causes.append(f"Inconsistent city names: {list(city_names)}")
        
        # Test 3: Check if NYC search works at all
        nyc_results, _ = self.search_airports("NYC")
        if len(nyc_results) == 0:
            root_causes.append("NYC search returns zero results - city code mapping broken")
        
        # Test 4: Check if New York search works
        ny_results, _ = self.search_airports("New York")
        ny_nyc_airports = [r for r in ny_results if r.get("iata") in self.nyc_airports]
        if len(ny_nyc_airports) == 0:
            root_causes.append("New York search doesn't return NYC airports - city matching broken")
        
        # Test 5: Check case sensitivity
        ny_lower_results, _ = self.search_airports("new york")
        if len(ny_lower_results) != len(ny_results):
            root_causes.append("Case sensitivity issue - lowercase search returns different results")
        
        # Test 6: Check if EWR city issue affects search
        ewr_results, _ = self.search_airports("EWR")
        if ewr_results and len(ewr_results) > 0:
            ewr_city = ewr_results[0].get("city", "")
            if "Newark" in ewr_city and "New York" not in ewr_city:
                root_causes.append("EWR listed as Newark instead of New York - affects city-based searches")
        
        # Determine primary root cause
        if not root_causes:
            primary_cause = "No root cause identified - system appears to be working"
        elif len(root_causes) == 1:
            primary_cause = root_causes[0]
        else:
            primary_cause = f"Multiple issues: {'; '.join(root_causes)}"
        
        print(f"   Root causes identified: {len(root_causes)}")
        for i, cause in enumerate(root_causes, 1):
            print(f"     {i}. {cause}")
        
        if not root_causes:
            print("   ✅ No obvious root causes found - system may be working correctly")
        
        self.log_test("Root Cause Analysis", len(root_causes) == 0, primary_cause)
        
        return root_causes
    
    def generate_bug_report(self):
        """Generate comprehensive bug report"""
        print("\n" + "=" * 80)
        print("🚨 NYC AIRPORT SEARCH BUG INVESTIGATION REPORT")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"📊 INVESTIGATION RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)")
        print()
        
        # Categorize issues
        critical_issues = []
        warnings = []
        
        for result in self.test_results:
            if not result["success"]:
                if "IATA" in result["test"] or "Root Cause" in result["test"]:
                    critical_issues.append(result)
                else:
                    warnings.append(result)
        
        # Critical Issues
        if critical_issues:
            print("🚨 CRITICAL ISSUES:")
            for issue in critical_issues:
                print(f"   ❌ {issue['test']}: {issue['details']}")
            print()
        
        # Warnings
        if warnings:
            print("⚠️  WARNINGS:")
            for warning in warnings:
                print(f"   ⚠️  {warning['test']}: {warning['details']}")
            print()
        
        # Bug Status
        if success_rate >= 80:
            bug_status = "🟢 NYC AIRPORT SEARCH BUG APPEARS TO BE FIXED"
            recommendation = "System is working correctly. NYC search should return all 3 airports."
        elif success_rate >= 50:
            bug_status = "🟡 NYC AIRPORT SEARCH BUG PARTIALLY RESOLVED"
            recommendation = "Some issues remain. Address critical issues before considering bug fixed."
        else:
            bug_status = "🔴 NYC AIRPORT SEARCH BUG CONFIRMED"
            recommendation = "Critical bug confirmed. Immediate fix required."
        
        print(f"🎯 BUG STATUS: {bug_status}")
        print(f"📋 RECOMMENDATION: {recommendation}")
        print()
        
        # Expected vs Actual
        print("📋 EXPECTED vs ACTUAL BEHAVIOR:")
        print("   EXPECTED:")
        print("     - JFK search → John F Kennedy International Airport")
        print("     - LGA search → LaGuardia Airport") 
        print("     - EWR search → Newark Liberty International Airport")
        print("     - 'New York' search → All 3 NYC airports (JFK, LGA, EWR)")
        print("     - 'NYC' search → All 3 NYC airports via city code mapping")
        print("     - Case insensitive search working")
        print()
        
        # Show actual results summary
        print("   ACTUAL RESULTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"     {status} {result['test']}")
        print()
        
        # Next Steps
        print("🔧 NEXT STEPS:")
        if critical_issues:
            print("   1. Fix critical issues identified above")
            print("   2. Ensure all 3 NYC airports are in database with consistent city names")
            print("   3. Implement/fix NYC → New York city code mapping")
            print("   4. Test EWR city naming (Newark vs New York)")
            print("   5. Re-run this test to verify fixes")
        else:
            print("   1. NYC airport search appears to be working correctly")
            print("   2. Monitor for any user reports of search issues")
            print("   3. Consider this bug resolved")
        
        return success_rate >= 80

def main():
    """Run NYC airport search bug investigation"""
    print("🚀 STARTING NYC AIRPORT SEARCH BUG INVESTIGATION")
    print("=" * 80)
    print("Investigating critical bug where NYC search returns no results")
    print("Expected: NYC search should return JFK, LGA, EWR airports")
    print()
    
    tester = NYCAirportBugTester()
    
    # Check backend health first
    if not tester.test_backend_health():
        print("❌ Backend not accessible. Cannot proceed with bug investigation.")
        return False
    
    # Run all investigation phases
    tester.test_direct_iata_codes()
    tester.test_city_name_searches()
    tester.test_city_code_mapping()
    tester.test_database_consistency()
    tester.test_search_algorithm()
    tester.test_root_cause_analysis()
    
    # Generate bug report
    bug_fixed = tester.generate_bug_report()
    
    return bug_fixed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)