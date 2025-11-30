#!/usr/bin/env python3
"""
PRIORITY AIRPORTS INTEGRATION VERIFICATION TEST
Testing the specific priority airports mentioned in the review request:
- Major Asian Hubs: TPE, KUL, CGK, MNL, ICN, GMP, KIX, ITM
- African Airports: JNB, CPT, LOS, ACC, ADD, NBO
- Middle Eastern Hubs: DOH, AUH, KWI, MCT, BAH, RUH, JED, AMM, BEY
- South American Hubs: GRU, CGH, GIG, SDU, EZE, AEP, SCL, LIM, BOG
- Canadian Airports: YYZ, YVR, YUL, YYC, YEG, YOW
- Mexican Airports: MEX, CUN, GDL, MTY, PVR, SJD
- Australian/NZ: SYD, MEL, BNE, PER, ADL, AKL, CHC, ZQN
- European Regional: ARN, OSL, CPH, HEL, WAW, PRG, BUD, SOF, OTP, BEG
- Island Nations: SUV, NAN, APW, TBU, RAR, PPT, NOU, VLI, POM
"""

import requests
import json
import time
import sys
import os
from typing import Dict, List, Any

# Backend URL from environment
BACKEND_URL = "https://responsive-travel-1.preview.emergentagent.com/api"

class PriorityAirportsTester:
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
        
    def test_airport_search_endpoint(self, query: str, expected_first: str = None):
        """Test airport search endpoint with specific query"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.backend_url}/airports/search", 
                                  params={"query": query, "limit": 10}, timeout=5)
            response_time = time.time() - start_time
            self.performance_results.append(response_time)
            
            if response.status_code != 200:
                return None, response_time
                
            data = response.json()
            results = data.get("results", [])
            
            return results, response_time
            
        except Exception as e:
            return None, 0

    def test_priority_airports_by_region(self):
        """Test all priority airports by region"""
        print("🌍 TESTING PRIORITY AIRPORTS BY REGION")
        print("=" * 60)
        
        # Define priority airports by region as per review request
        priority_regions = {
            "Major Asian Hubs": [
                ("TPE", "Taipei"), ("KUL", "Kuala Lumpur"), ("CGK", "Jakarta"), 
                ("MNL", "Manila"), ("ICN", "Seoul"), ("GMP", "Seoul"),
                ("KIX", "Osaka"), ("ITM", "Osaka")
            ],
            "African Airports": [
                ("JNB", "Johannesburg"), ("CPT", "Cape Town"), ("LOS", "Lagos"),
                ("ACC", "Accra"), ("ADD", "Addis Ababa"), ("NBO", "Nairobi")
            ],
            "Middle Eastern Hubs": [
                ("DOH", "Doha"), ("AUH", "Abu Dhabi"), ("KWI", "Kuwait"),
                ("MCT", "Muscat"), ("BAH", "Bahrain"), ("RUH", "Riyadh"),
                ("JED", "Jeddah"), ("AMM", "Amman"), ("BEY", "Beirut")
            ],
            "South American Hubs": [
                ("GRU", "São Paulo"), ("CGH", "São Paulo"), ("GIG", "Rio de Janeiro"), 
                ("SDU", "Rio de Janeiro"), ("EZE", "Buenos Aires"), ("AEP", "Buenos Aires"),
                ("SCL", "Santiago"), ("LIM", "Lima"), ("BOG", "Bogotá")
            ],
            "Canadian Airports": [
                ("YYZ", "Toronto"), ("YVR", "Vancouver"), ("YUL", "Montreal"),
                ("YYC", "Calgary"), ("YEG", "Edmonton"), ("YOW", "Ottawa")
            ],
            "Mexican Airports": [
                ("MEX", "Mexico City"), ("CUN", "Cancún"), ("GDL", "Guadalajara"),
                ("MTY", "Monterrey"), ("PVR", "Puerto Vallarta"), ("SJD", "Los Cabos")
            ],
            "Australian/NZ": [
                ("SYD", "Sydney"), ("MEL", "Melbourne"), ("BNE", "Brisbane"),
                ("PER", "Perth"), ("ADL", "Adelaide"), ("AKL", "Auckland"),
                ("CHC", "Christchurch"), ("ZQN", "Queenstown")
            ],
            "European Regional": [
                ("ARN", "Stockholm"), ("OSL", "Oslo"), ("CPH", "Copenhagen"),
                ("HEL", "Helsinki"), ("WAW", "Warsaw"), ("PRG", "Prague"),
                ("BUD", "Budapest"), ("SOF", "Sofia"), ("OTP", "Bucharest"), ("BEG", "Belgrade")
            ],
            "Island Nations": [
                ("SUV", "Suva"), ("NAN", "Nadi"), ("APW", "Apia"),
                ("TBU", "Nuku'alofa"), ("RAR", "Rarotonga"), ("PPT", "Papeete"),
                ("NOU", "Nouméa"), ("VLI", "Port Vila"), ("POM", "Port Moresby")
            ]
        }
        
        region_results = {}
        total_airports = 0
        total_found = 0
        
        for region, airports in priority_regions.items():
            print(f"\n🔍 Testing {region}:")
            region_found = 0
            region_total = len(airports)
            
            for iata, city in airports:
                total_airports += 1
                results, response_time = self.test_airport_search_endpoint(iata)
                
                if results and len(results) > 0:
                    # Check if the exact IATA match is found
                    exact_match = any(r.get("iata") == iata for r in results)
                    if exact_match:
                        region_found += 1
                        total_found += 1
                        print(f"  ✅ {iata} ({city}) - Found")
                    else:
                        print(f"  ❌ {iata} ({city}) - Not found as exact match")
                else:
                    print(f"  ❌ {iata} ({city}) - No results")
            
            region_percentage = (region_found / region_total) * 100
            region_results[region] = {
                "found": region_found,
                "total": region_total,
                "percentage": region_percentage
            }
            
            print(f"  📊 {region}: {region_found}/{region_total} ({region_percentage:.1f}%)")
        
        overall_percentage = (total_found / total_airports) * 100
        
        self.log_test("Priority Airports Coverage", overall_percentage >= 90,
                    f"Overall: {total_found}/{total_airports} ({overall_percentage:.1f}%) - " +
                    ", ".join([f"{k}: {v['found']}/{v['total']}" for k, v in region_results.items()]))
        
        return region_results

    def test_all_airports_functionality(self):
        """Test 'All Airports' functionality for multi-airport cities"""
        print("\n🏙️ TESTING 'ALL AIRPORTS' FUNCTIONALITY")
        print("=" * 60)
        
        # Multi-airport cities as per review request
        multi_airport_cities = {
            "Seoul": ["ICN", "GMP"],
            "São Paulo": ["GRU", "CGH"],
            "Rio de Janeiro": ["GIG", "SDU"],
            "Buenos Aires": ["EZE", "AEP"],
            "Osaka": ["KIX", "ITM"],
            "New York": ["JFK", "LGA", "EWR"],
            "London": ["LHR", "LGW", "STN", "LTN", "LCY"]
        }
        
        all_airports_success = 0
        all_airports_details = []
        
        for city, expected_airports in multi_airport_cities.items():
            print(f"\n🔍 Testing {city}:")
            results, response_time = self.test_airport_search_endpoint(city.lower())
            
            if results:
                found_airports = []
                for result in results:
                    if result.get("iata") in expected_airports:
                        found_airports.append(result.get("iata"))
                        print(f"  ✅ Found {result.get('iata')} - {result.get('airport')}")
                
                # Check coverage
                coverage = len(found_airports) / len(expected_airports)
                if coverage >= 0.8:  # At least 80% of airports found
                    all_airports_success += 1
                    all_airports_details.append(f"{city}: {len(found_airports)}/{len(expected_airports)} ✅")
                else:
                    all_airports_details.append(f"{city}: {len(found_airports)}/{len(expected_airports)} ❌")
                
                print(f"  📊 Coverage: {len(found_airports)}/{len(expected_airports)} ({coverage*100:.1f}%)")
            else:
                all_airports_details.append(f"{city}: No results ❌")
                print(f"  ❌ No results found")
        
        success_rate = (all_airports_success / len(multi_airport_cities)) * 100
        
        self.log_test("All Airports Functionality", success_rate >= 80,
                    f"Multi-airport cities: {all_airports_success}/{len(multi_airport_cities)} ({success_rate:.1f}%) - " +
                    ", ".join(all_airports_details))

    def test_iata_exact_matching(self):
        """Test IATA code exact matching for priority airports"""
        print("\n🎯 TESTING IATA CODE EXACT MATCHING")
        print("=" * 60)
        
        # Sample of priority airports for exact matching test
        exact_match_tests = [
            ("TPE", "Taipei"),
            ("DOH", "Doha"),
            ("JNB", "Johannesburg"),
            ("GRU", "São Paulo"),
            ("YYZ", "Toronto"),
            ("MEX", "Mexico City"),
            ("SYD", "Sydney"),
            ("ARN", "Stockholm"),
            ("SUV", "Suva")
        ]
        
        exact_match_success = 0
        
        for iata, expected_city in exact_match_tests:
            print(f"\n🔍 Testing {iata} → {expected_city}:")
            results, response_time = self.test_airport_search_endpoint(iata)
            
            if results and len(results) > 0:
                first_result = results[0]
                if first_result.get("iata") == iata:
                    exact_match_success += 1
                    print(f"  ✅ {iata} appears first: {first_result.get('airport')}")
                else:
                    print(f"  ❌ {iata} not first, got: {first_result.get('iata')} - {first_result.get('airport')}")
            else:
                print(f"  ❌ No results for {iata}")
        
        success_rate = (exact_match_success / len(exact_match_tests)) * 100
        
        self.log_test("IATA Exact Matching", success_rate >= 90,
                    f"Exact matches: {exact_match_success}/{len(exact_match_tests)} ({success_rate:.1f}%)")

    def test_city_name_mapping(self):
        """Test city name to airport mapping"""
        print("\n🗺️ TESTING CITY NAME MAPPING")
        print("=" * 60)
        
        # City name to IATA mapping tests
        city_mapping_tests = [
            ("taipei", "TPE"),
            ("doha", "DOH"),
            ("johannesburg", "JNB"),
            ("toronto", "YYZ"),
            ("sydney", "SYD"),
            ("stockholm", "ARN")
        ]
        
        mapping_success = 0
        
        for city_name, expected_iata in city_mapping_tests:
            print(f"\n🔍 Testing '{city_name}' → {expected_iata}:")
            results, response_time = self.test_airport_search_endpoint(city_name)
            
            if results:
                # Check if expected IATA is in top 3 results
                found_in_top3 = False
                for i, result in enumerate(results[:3]):
                    if result.get("iata") == expected_iata:
                        found_in_top3 = True
                        print(f"  ✅ {expected_iata} found at position {i+1}: {result.get('airport')}")
                        break
                
                if found_in_top3:
                    mapping_success += 1
                else:
                    top_results = [f"{r.get('iata')}" for r in results[:3]]
                    print(f"  ❌ {expected_iata} not in top 3. Got: {', '.join(top_results)}")
            else:
                print(f"  ❌ No results for '{city_name}'")
        
        success_rate = (mapping_success / len(city_mapping_tests)) * 100
        
        self.log_test("City Name Mapping", success_rate >= 80,
                    f"City mappings: {mapping_success}/{len(city_mapping_tests)} ({success_rate:.1f}%)")

    def test_api_performance(self):
        """Test API performance with expanded database"""
        print("\n⚡ TESTING API PERFORMANCE")
        print("=" * 60)
        
        if self.performance_results:
            avg_response_time = sum(self.performance_results) / len(self.performance_results)
            max_response_time = max(self.performance_results)
            min_response_time = min(self.performance_results)
            
            # Convert to milliseconds
            avg_ms = avg_response_time * 1000
            max_ms = max_response_time * 1000
            min_ms = min_response_time * 1000
            
            performance_target_met = avg_ms < 100  # Target: under 100ms
            
            print(f"📊 Performance Statistics:")
            print(f"  Average: {avg_ms:.1f}ms")
            print(f"  Minimum: {min_ms:.1f}ms")
            print(f"  Maximum: {max_ms:.1f}ms")
            print(f"  Total queries: {len(self.performance_results)}")
            
            self.log_test("API Performance", performance_target_met,
                        f"Average: {avg_ms:.1f}ms, Max: {max_ms:.1f}ms (Target: <100ms) - " +
                        f"{'✅ MEETS TARGET' if performance_target_met else '⚠️ EXCEEDS TARGET'}")
        else:
            self.log_test("API Performance", False, "No performance data collected")

    def generate_summary(self):
        """Generate comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🎯 PRIORITY AIRPORTS INTEGRATION VERIFICATION SUMMARY")
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
        
        # Detailed results
        print("📋 DETAILED TEST RESULTS:")
        for result in self.test_results:
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            print(f"  {status} {result['test']}: {result['details']}")
        
        print()
        
        # Final assessment
        print("📋 FINAL ASSESSMENT:")
        if success_rate >= 95:
            print("   ✅ EXCELLENT: Priority airports integration is working perfectly")
            print("   ✅ All critical functionality verified")
            print("   ✅ Ready for production use")
        elif success_rate >= 85:
            print("   ✅ GOOD: Most priority airports integrated successfully")
            print("   ⚠️ Minor issues identified but core functionality intact")
        elif success_rate >= 70:
            print("   ⚠️ ACCEPTABLE: Basic functionality working")
            print("   ⚠️ Some priority airports missing - improvements needed")
        else:
            print("   ❌ CRITICAL: Major issues with priority airports integration")
            print("   ❌ Significant gaps in coverage - immediate attention required")
        
        return success_rate >= 85

def main():
    """Run priority airports integration verification"""
    print("🚀 STARTING PRIORITY AIRPORTS INTEGRATION VERIFICATION")
    print("=" * 80)
    print("Testing specific priority airports mentioned in review request")
    print()
    
    tester = PriorityAirportsTester()
    
    # Run all test phases
    tester.test_priority_airports_by_region()
    tester.test_all_airports_functionality()
    tester.test_iata_exact_matching()
    tester.test_city_name_mapping()
    tester.test_api_performance()
    
    # Generate final summary
    verification_passed = tester.generate_summary()
    
    return verification_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)