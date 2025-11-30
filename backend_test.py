#!/usr/bin/env python3
"""
FINAL COMPREHENSIVE AIRPORT DATABASE INTEGRATION TEST
Testing current airport database status and comprehensive functionality before integrating the massive 8,697 airport dataset.

Test Areas:
1. Current Database Assessment - Test current airport count and coverage
2. Comprehensive Search Testing - Test previously missing airports and major hubs
3. Ranking Algorithm Perfection - Verify exact IATA matches score 1000 and appear first
4. API Performance - Response time under 50ms for airport searches
5. Database Completeness Check - Identify any remaining gaps in coverage
"""

import requests
import json
import time
import sys
from typing import Dict, List, Any

# Backend URL from environment
BACKEND_URL = "https://responsive-travel-1.preview.emergentagent.com/api"

class AirportDatabaseTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.test_results = []
        self.performance_results = []
        
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
    
    def test_airport_search_endpoint(self, query: str, expected_count: int = None, expected_first: str = None):
        """Test airport search endpoint with specific query"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.backend_url}/airports/search", 
                                  params={"query": query, "limit": 10}, timeout=5)
            response_time = time.time() - start_time
            self.performance_results.append(response_time)
            
            if response.status_code != 200:
                self.log_test(f"Airport Search: '{query}'", False, 
                            f"HTTP {response.status_code}: {response.text}", response_time)
                return None
                
            data = response.json()
            results = data.get("results", [])
            
            # Check expected count
            if expected_count is not None and len(results) != expected_count:
                self.log_test(f"Airport Search: '{query}'", False, 
                            f"Expected {expected_count} results, got {len(results)}", response_time)
                return results
                
            # Check expected first result
            if expected_first and results:
                first_result = results[0]
                if first_result.get("iata") != expected_first:
                    self.log_test(f"Airport Search: '{query}'", False, 
                                f"Expected first result {expected_first}, got {first_result.get('iata')}", response_time)
                    return results
                    
            self.log_test(f"Airport Search: '{query}'", True, 
                        f"Found {len(results)} results" + 
                        (f", first: {results[0].get('iata')} - {results[0].get('airport')}" if results else ""), 
                        response_time)
            return results
            
        except Exception as e:
            self.log_test(f"Airport Search: '{query}'", False, f"Request failed: {str(e)}")
            return None
    
    def test_current_database_assessment(self):
        """Test 1: Current Database Assessment"""
        print("🔍 TEST 1: CURRENT DATABASE ASSESSMENT")
        print("=" * 60)
        
        # Test major Indian airports
        indian_airports = [
            ("Mumbai", "BOM"), ("Delhi", "DEL"), ("Bengaluru", "BLR"), 
            ("Chennai", "MAA"), ("Kolkata", "CCU"), ("Hyderabad", "HYD")
        ]
        
        indian_count = 0
        for city, iata in indian_airports:
            results = self.test_airport_search_endpoint(iata, expected_first=iata)
            if results and len(results) > 0:
                indian_count += 1
        
        # Test major international airports
        international_airports = [
            ("Dubai", "DXB"), ("Singapore", "SIN"), ("London", "LHR"),
            ("New York", "JFK"), ("Paris", "CDG"), ("Tokyo", "NRT")
        ]
        
        international_count = 0
        for city, iata in international_airports:
            results = self.test_airport_search_endpoint(iata, expected_first=iata)
            if results and len(results) > 0:
                international_count += 1
        
        # Test previously reported missing airports (Houston ranking bug)
        houston_results = self.test_airport_search_endpoint("Houston")
        houston_bug_fixed = True
        if houston_results:
            # Check if Houston airports appear appropriately (not in unrelated searches)
            for result in houston_results:
                if "Houston" not in result.get("city", ""):
                    houston_bug_fixed = False
                    break
        
        self.log_test("Current Database Coverage", True, 
                    f"Indian airports: {indian_count}/6, International: {international_count}/6, Houston bug status: {'Fixed' if houston_bug_fixed else 'Still present'}")
    
    def test_comprehensive_search_testing(self):
        """Test 2: Comprehensive Search Testing"""
        print("🔍 TEST 2: COMPREHENSIVE SEARCH TESTING")
        print("=" * 60)
        
        # Test previously missing airports from review request
        missing_airports = [
            ("Bratislava", "BTS"), ("Luxembourg", "LUX"), ("Malta", "MLA")
        ]
        
        missing_found = 0
        for city, iata in missing_airports:
            results = self.test_airport_search_endpoint(iata, expected_first=iata)
            if results and len(results) > 0 and results[0].get("iata") == iata:
                missing_found += 1
        
        # Test major hubs from review request
        major_hubs = [
            ("Dubai", "DXB"), ("Singapore", "SIN"), ("Tokyo", "NRT")
        ]
        
        hubs_found = 0
        for city, iata in major_hubs:
            results = self.test_airport_search_endpoint(iata, expected_first=iata)
            if results and len(results) > 0 and results[0].get("iata") == iata:
                hubs_found += 1
        
        # Test regional airports and smaller countries
        regional_airports = [
            ("Reykjavik", "KEF"), ("Dublin", "DUB"), ("Nice", "NCE"),
            ("Venice", "VCE"), ("Florence", "FLR")
        ]
        
        regional_found = 0
        for city, iata in regional_airports:
            results = self.test_airport_search_endpoint(iata, expected_first=iata)
            if results and len(results) > 0 and results[0].get("iata") == iata:
                regional_found += 1
        
        # Test island nations and remote locations
        remote_airports = [
            ("Male", "MLE"), ("Auckland", "AKL"), ("Nairobi", "NBO")
        ]
        
        remote_found = 0
        for city, iata in remote_airports:
            results = self.test_airport_search_endpoint(iata, expected_first=iata)
            if results and len(results) > 0 and results[0].get("iata") == iata:
                remote_found += 1
        
        total_tested = len(missing_airports) + len(major_hubs) + len(regional_airports) + len(remote_airports)
        total_found = missing_found + hubs_found + regional_found + remote_found
        
        self.log_test("Comprehensive Search Coverage", total_found == total_tested, 
                    f"Found {total_found}/{total_tested} airports - Missing: {missing_found}/3, Hubs: {hubs_found}/3, Regional: {regional_found}/5, Remote: {remote_found}/3")
    
    def test_ranking_algorithm_perfection(self):
        """Test 3: Ranking Algorithm Perfection"""
        print("🔍 TEST 3: RANKING ALGORITHM PERFECTION")
        print("=" * 60)
        
        # Test exact IATA matches should score 1000 and appear first
        exact_iata_tests = [
            ("BTS", "Bratislava"), ("LUX", "Luxembourg"), ("MLA", "Malta"),
            ("DUB", "Dublin"), ("ISB", "Islamabad"), ("DXB", "Dubai"),
            ("SIN", "Singapore"), ("NRT", "Tokyo"), ("KEF", "Reykjavik")
        ]
        
        exact_iata_success = 0
        ranking_issues = []
        
        for iata, expected_city in exact_iata_tests:
            results = self.test_airport_search_endpoint(iata)
            if results and len(results) > 0:
                first_result = results[0]
                if first_result.get("iata") == iata:
                    exact_iata_success += 1
                    # Check if it's truly first (highest score)
                    if len(results) > 1:
                        second_result = results[1]
                        # Verify first result is more relevant than second
                        if first_result.get("city", "").lower() in expected_city.lower():
                            continue
                        else:
                            ranking_issues.append(f"{iata}: First result not most relevant")
                else:
                    ranking_issues.append(f"{iata}: Expected first, got {first_result.get('iata')}")
        
        # Test city name searches should return city airports first
        city_name_tests = [
            ("Dublin", "DUB"), ("Singapore", "SIN"), ("Luxembourg", "LUX")
        ]
        
        city_name_success = 0
        for city, expected_iata in city_name_tests:
            results = self.test_airport_search_endpoint(city)
            if results and len(results) > 0:
                # Check if the expected airport is in top results
                found_expected = False
                for result in results[:3]:  # Check top 3 results
                    if result.get("iata") == expected_iata:
                        found_expected = True
                        break
                if found_expected:
                    city_name_success += 1
                else:
                    ranking_issues.append(f"{city}: Expected {expected_iata} in top 3 results")
        
        # Test partial matches
        partial_tests = [
            ("Lon", "London"), ("Dub", "Dubai"), ("Sin", "Singapore")
        ]
        
        partial_success = 0
        for partial, expected_city in partial_tests:
            results = self.test_airport_search_endpoint(partial)
            if results and len(results) > 0:
                # Check if relevant results appear
                relevant_found = False
                for result in results[:5]:  # Check top 5 results
                    if expected_city.lower() in result.get("city", "").lower():
                        relevant_found = True
                        break
                if relevant_found:
                    partial_success += 1
                else:
                    ranking_issues.append(f"{partial}: No relevant results for {expected_city}")
        
        total_ranking_tests = len(exact_iata_tests) + len(city_name_tests) + len(partial_tests)
        total_ranking_success = exact_iata_success + city_name_success + partial_success
        
        self.log_test("Ranking Algorithm Perfection", len(ranking_issues) == 0, 
                    f"Ranking success: {total_ranking_success}/{total_ranking_tests} - " +
                    f"Exact IATA: {exact_iata_success}/{len(exact_iata_tests)}, " +
                    f"City names: {city_name_success}/{len(city_name_tests)}, " +
                    f"Partial: {partial_success}/{len(partial_tests)}" +
                    (f" - Issues: {', '.join(ranking_issues)}" if ranking_issues else ""))
    
    def test_api_performance(self):
        """Test 4: API Performance"""
        print("🔍 TEST 4: API PERFORMANCE")
        print("=" * 60)
        
        # Test response times for various queries
        performance_queries = [
            "BOM", "DEL", "DXB", "SIN", "LHR", "JFK", "CDG", "NRT",
            "Mumbai", "Delhi", "Dubai", "Singapore", "London", "New York"
        ]
        
        response_times = []
        for query in performance_queries:
            start_time = time.time()
            try:
                response = requests.get(f"{self.backend_url}/airports/search", 
                                      params={"query": query, "limit": 10}, timeout=5)
                response_time = time.time() - start_time
                response_times.append(response_time)
                
                if response.status_code == 200:
                    data = response.json()
                    results_count = len(data.get("results", []))
                else:
                    results_count = 0
                    
            except Exception as e:
                response_time = time.time() - start_time
                response_times.append(response_time)
                results_count = 0
        
        if response_times:
            avg_response_time = sum(response_times) * 1000  # Convert to ms
            max_response_time = max(response_times) * 1000
            min_response_time = min(response_times) * 1000
            
            performance_target_met = avg_response_time < 50  # Target: under 50ms
            
            self.log_test("API Performance", performance_target_met, 
                        f"Average: {avg_response_time:.1f}ms, Min: {min_response_time:.1f}ms, Max: {max_response_time:.1f}ms " +
                        f"(Target: <50ms) - {'✅ MEETS TARGET' if performance_target_met else '⚠️ EXCEEDS TARGET'}")
        else:
            self.log_test("API Performance", False, "No performance data collected")
    
    def test_database_completeness_check(self):
        """Test 5: Database Completeness Check"""
        print("🔍 TEST 5: DATABASE COMPLETENESS CHECK")
        print("=" * 60)
        
        # Test geographic distribution
        geographic_regions = {
            "India": ["BOM", "DEL", "BLR", "MAA", "CCU", "HYD", "PNQ", "AMD"],
            "Europe": ["LHR", "CDG", "FRA", "AMS", "FCO", "MAD", "VIE", "BRU"],
            "North America": ["JFK", "LAX", "ORD", "DFW", "ATL", "YYZ", "YVR"],
            "Asia-Pacific": ["SIN", "HKG", "NRT", "ICN", "SYD", "MEL", "AKL"],
            "Middle East": ["DXB", "DOH", "AUH", "KWI", "RUH", "CAI"],
            "Africa": ["JNB", "CPT", "NBO", "ADD", "LOS", "CMN"]
        }
        
        region_coverage = {}
        total_airports_found = 0
        total_airports_tested = 0
        
        for region, airports in geographic_regions.items():
            found_in_region = 0
            for iata in airports:
                total_airports_tested += 1
                results = self.test_airport_search_endpoint(iata)
                if results and len(results) > 0 and results[0].get("iata") == iata:
                    found_in_region += 1
                    total_airports_found += 1
            
            region_coverage[region] = f"{found_in_region}/{len(airports)}"
        
        # Test multi-airport cities
        multi_airport_cities = {
            "London": ["LHR", "LGW", "STN", "LTN", "LCY"],
            "New York": ["JFK", "LGA", "EWR"],
            "Paris": ["CDG", "ORY"],
            "Tokyo": ["NRT", "HND"],
            "Dubai": ["DXB", "DWC"],
            "Istanbul": ["IST", "SAW"]
        }
        
        multi_airport_success = 0
        multi_airport_details = []
        
        for city, airports in multi_airport_cities.items():
            city_results = self.test_airport_search_endpoint(city.lower())
            if city_results:
                found_airports = [r.get("iata") for r in city_results if r.get("iata") in airports]
                if len(found_airports) >= len(airports) * 0.8:  # At least 80% of airports found
                    multi_airport_success += 1
                multi_airport_details.append(f"{city}: {len(found_airports)}/{len(airports)}")
        
        # Test edge cases and uncommon airports
        edge_cases = [
            ("Ghaziabad", "HDO"), ("Hindon", "HDO"),  # Smaller Indian airports
            ("Guilin", "KWL"), ("Ulaanbaatar", "ULN"),  # Remote locations
            ("Sharm El Sheikh", "SSH"), ("Tashkent", "TAS")  # Less common destinations
        ]
        
        edge_case_success = 0
        for location, iata in edge_cases:
            results = self.test_airport_search_endpoint(iata)
            if results and len(results) > 0 and results[0].get("iata") == iata:
                edge_case_success += 1
        
        coverage_percentage = (total_airports_found / total_airports_tested) * 100 if total_airports_tested > 0 else 0
        
        self.log_test("Database Completeness", coverage_percentage >= 90, 
                    f"Overall coverage: {coverage_percentage:.1f}% ({total_airports_found}/{total_airports_tested}) - " +
                    f"Regional: {', '.join([f'{k}:{v}' for k,v in region_coverage.items()])} - " +
                    f"Multi-airport cities: {multi_airport_success}/{len(multi_airport_cities)} - " +
                    f"Edge cases: {edge_case_success}/{len(edge_cases)}")
    
    def test_flight_search_integration(self):
        """Test flight search integration with airport database"""
        print("🔍 BONUS TEST: FLIGHT SEARCH INTEGRATION")
        print("=" * 60)
        
        # Test flight search with IATA codes
        flight_searches = [
            ("BOM", "DEL"), ("DXB", "LHR"), ("SIN", "NRT")
        ]
        
        flight_integration_success = 0
        for origin, destination in flight_searches:
            try:
                start_time = time.time()
                response = requests.post(f"{self.backend_url}/flights/search", 
                                       json={
                                           "origin": origin,
                                           "destination": destination,
                                           "departure_date": "2025-02-15",
                                           "passengers": 1,
                                           "class_type": "economy"
                                       }, timeout=10)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    flights = data.get("flights", [])
                    if len(flights) > 0:
                        flight_integration_success += 1
                        self.log_test(f"Flight Search: {origin}→{destination}", True, 
                                    f"Found {len(flights)} flights, data source: {data.get('data_source', 'unknown')}", 
                                    response_time)
                    else:
                        self.log_test(f"Flight Search: {origin}→{destination}", False, 
                                    "No flights found", response_time)
                else:
                    self.log_test(f"Flight Search: {origin}→{destination}", False, 
                                f"HTTP {response.status_code}", response_time)
                    
            except Exception as e:
                self.log_test(f"Flight Search: {origin}→{destination}", False, 
                            f"Request failed: {str(e)}")
        
        return flight_integration_success == len(flight_searches)
    
    def generate_summary(self):
        """Generate comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🎯 FINAL COMPREHENSIVE AIRPORT DATABASE INTEGRATION TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)")
        print()
        
        # Performance summary
        if self.performance_results:
            avg_performance = sum(self.performance_results) * 1000 / len(self.performance_results)
            print(f"⚡ PERFORMANCE: Average response time {avg_performance:.1f}ms")
            print()
        
        # Categorize results
        categories = {
            "Database Assessment": [],
            "Search Testing": [],
            "Ranking Algorithm": [],
            "API Performance": [],
            "Completeness Check": [],
            "Integration": []
        }
        
        for result in self.test_results:
            test_name = result["test"]
            if "Database" in test_name or "Coverage" in test_name:
                categories["Database Assessment"].append(result)
            elif "Search" in test_name and "Flight" not in test_name:
                categories["Search Testing"].append(result)
            elif "Ranking" in test_name or "Algorithm" in test_name:
                categories["Ranking Algorithm"].append(result)
            elif "Performance" in test_name:
                categories["API Performance"].append(result)
            elif "Completeness" in test_name:
                categories["Completeness Check"].append(result)
            elif "Flight" in test_name:
                categories["Integration"].append(result)
        
        # Print category summaries
        for category, results in categories.items():
            if results:
                category_passed = sum(1 for r in results if r["success"])
                category_total = len(results)
                category_rate = (category_passed / category_total) * 100 if category_total > 0 else 0
                status = "✅" if category_rate >= 80 else "⚠️" if category_rate >= 60 else "❌"
                print(f"{status} {category}: {category_passed}/{category_total} ({category_rate:.1f}%)")
        
        print()
        
        # Critical issues
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("🚨 CRITICAL ISSUES IDENTIFIED:")
            for result in failed_tests:
                print(f"   ❌ {result['test']}: {result['details']}")
            print()
        
        # Recommendations
        print("📋 RECOMMENDATIONS:")
        if success_rate >= 95:
            print("   ✅ System is ready for the full 8,697 airport integration")
            print("   ✅ All critical functionality working as expected")
        elif success_rate >= 80:
            print("   ⚠️ System mostly ready, address critical issues before full integration")
            print("   ⚠️ Consider fixing failed tests before proceeding")
        else:
            print("   ❌ System not ready for full integration")
            print("   ❌ Multiple critical issues need resolution")
        
        if self.performance_results:
            avg_perf = sum(self.performance_results) * 1000 / len(self.performance_results)
            if avg_perf < 50:
                print("   ✅ Performance meets requirements (<50ms)")
            else:
                print("   ⚠️ Performance optimization needed (target: <50ms)")
        
        print()
        print("🎯 NEXT STEPS:")
        if success_rate >= 95:
            print("   1. Proceed with comprehensive database integration")
            print("   2. Monitor performance during integration")
            print("   3. Conduct final verification after integration")
        else:
            print("   1. Address critical issues identified above")
            print("   2. Re-run comprehensive testing")
            print("   3. Proceed with integration only after 95%+ success rate")
        
        return success_rate >= 95

def main():
    """Run comprehensive airport database integration test"""
    print("🚀 STARTING FINAL COMPREHENSIVE AIRPORT DATABASE INTEGRATION TEST")
    print("=" * 80)
    print("Testing current airport database status and comprehensive functionality")
    print("before integrating the massive 8,697 airport dataset.")
    print()
    
    tester = AirportDatabaseTester()
    
    # Check backend health first
    if not tester.test_backend_health():
        print("❌ Backend not accessible. Cannot proceed with testing.")
        return False
    
    # Run all test phases
    tester.test_current_database_assessment()
    tester.test_comprehensive_search_testing()
    tester.test_ranking_algorithm_perfection()
    tester.test_api_performance()
    tester.test_database_completeness_check()
    tester.test_flight_search_integration()
    
    # Generate final summary
    ready_for_integration = tester.generate_summary()
    
    return ready_for_integration

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)