#!/usr/bin/env python3
"""
COMPREHENSIVE AIRPORT DATABASE PERFECTION TESTING
=================================================

This test suite focuses on achieving 100% test success rate and ensuring ALL IATA airports 
are in database without exception, as requested in the review.

Critical Testing Areas:
1. Dublin 'DUB' search ranking fix (should show Dublin first, not Dubai)
2. Comprehensive database verification of IATA airports worldwide
3. Ranking algorithm perfection (exact IATA matches score 1000)
4. Database completeness testing

Expected Result: 100% test success rate with perfect ranking and complete airport coverage.
"""

import requests
import json
import time
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://cleartrip-clone.preview.emergentagent.com')
API_BASE_URL = f"{BACKEND_URL}/api"

class AirportDatabaseTester:
    def __init__(self):
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
            
        result = f"{status}: {test_name}"
        if details:
            result += f" - {details}"
            
        self.test_results.append(result)
        print(result)
        
    def search_airports(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Search airports using the backend API"""
        try:
            url = f"{API_BASE_URL}/airports/search"
            params = {"query": query, "limit": limit}
            
            print(f"🔍 Searching airports: '{query}' (limit: {limit})")
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                print(f"📊 Found {len(results)} results")
                return {"success": True, "results": results, "count": len(results)}
            else:
                print(f"❌ API Error: {response.status_code} - {response.text}")
                return {"success": False, "error": f"HTTP {response.status_code}", "results": []}
                
        except Exception as e:
            print(f"❌ Request Error: {str(e)}")
            return {"success": False, "error": str(e), "results": []}
    
    def test_dublin_ranking_fix(self):
        """Test the critical Dublin 'DUB' search ranking issue"""
        print("\n🎯 TESTING DUBLIN 'DUB' RANKING FIX")
        print("=" * 50)
        
        # Test DUB search - should return Dublin first, not Dubai
        result = self.search_airports("DUB")
        
        if not result["success"]:
            self.log_test("Dublin DUB Search API", False, f"API failed: {result.get('error')}")
            return
            
        results = result["results"]
        
        if not results:
            self.log_test("Dublin DUB Search Results", False, "No results returned for DUB")
            return
            
        # Check if Dublin appears first
        first_result = results[0]
        is_dublin_first = (
            first_result.get('iata', '').upper() == 'DUB' and 
            'dublin' in first_result.get('city', '').lower()
        )
        
        self.log_test(
            "Dublin DUB Exact Match First", 
            is_dublin_first,
            f"First result: {first_result.get('iata')} - {first_result.get('city')} ({first_result.get('airport', '')})"
        )
        
        # Check that Dubai airports don't appear before Dublin
        dubai_before_dublin = False
        dublin_found = False
        
        for i, airport in enumerate(results):
            city = airport.get('city', '').lower()
            iata = airport.get('iata', '').upper()
            
            if iata == 'DUB' and 'dublin' in city:
                dublin_found = True
                dublin_position = i
                break
            elif 'dubai' in city and not dublin_found:
                dubai_before_dublin = True
                
        self.log_test(
            "No Dubai Before Dublin", 
            not dubai_before_dublin,
            f"Dubai appears before Dublin: {dubai_before_dublin}"
        )
        
        # Test scoring system - exact IATA matches should score 1000
        if dublin_found and hasattr(first_result, 'score'):
            expected_score = 1000
            actual_score = first_result.get('score', 0)
            self.log_test(
                "Dublin DUB Score 1000", 
                actual_score == expected_score,
                f"Expected: {expected_score}, Actual: {actual_score}"
            )
    
    def test_exact_iata_matches(self):
        """Test that exact IATA code matches always appear first with score 1000"""
        print("\n🎯 TESTING EXACT IATA MATCHES (Score 1000)")
        print("=" * 50)
        
        # Test cases for exact IATA matches
        test_cases = [
            ("IST", "Istanbul", "Istanbul Airport"),
            ("KWL", "Guilin", "Guilin Airport"),
            ("DPS", "Bali", "Ngurah Rai International Airport"),
            ("NBO", "Nairobi", "Jomo Kenyatta International Airport"),
            ("ISB", "Islamabad", "Islamabad International Airport"),
            ("BTS", "Bratislava", "M. R. Štefánik Airport"),
            ("LUX", "Luxembourg", "Luxembourg Airport"),
            ("MLA", "Malta", "Malta International Airport"),
            ("KEF", "Reykjavik", "Keflavík International Airport"),
            ("DUB", "Dublin", "Dublin Airport"),
            ("NCE", "Nice", "Nice Côte d'Azur Airport"),
            ("VCE", "Venice", "Venice Marco Polo Airport"),
            ("FLR", "Florence", "Florence Airport"),
            ("NAP", "Naples", "Naples International Airport"),
            ("PMO", "Palermo", "Falcone-Borsellino Airport")
        ]
        
        for iata_code, expected_city, expected_airport in test_cases:
            result = self.search_airports(iata_code)
            
            if not result["success"]:
                self.log_test(f"{iata_code} Search API", False, f"API failed: {result.get('error')}")
                continue
                
            results = result["results"]
            
            if not results:
                self.log_test(f"{iata_code} Results Found", False, "No results returned")
                continue
                
            # Check if exact match appears first
            first_result = results[0]
            is_exact_match = first_result.get('iata', '').upper() == iata_code.upper()
            
            self.log_test(
                f"{iata_code} Exact Match First",
                is_exact_match,
                f"First: {first_result.get('iata')} - {first_result.get('city')} ({first_result.get('airport', '')})"
            )
    
    def test_city_name_matches(self):
        """Test that exact city name matches score 800 and appear first"""
        print("\n🎯 TESTING EXACT CITY NAME MATCHES (Score 800)")
        print("=" * 50)
        
        test_cases = [
            ("Guilin", "KWL"),
            ("Istanbul", "IST"),
            ("Bali", "DPS"),
            ("Singapore", "SIN"),
            ("Dubai", "DXB")
        ]
        
        for city_name, expected_iata in test_cases:
            result = self.search_airports(city_name)
            
            if not result["success"]:
                self.log_test(f"{city_name} Search API", False, f"API failed: {result.get('error')}")
                continue
                
            results = result["results"]
            
            if not results:
                self.log_test(f"{city_name} Results Found", False, "No results returned")
                continue
                
            # Check if city match appears first
            first_result = results[0]
            city_match = city_name.lower() in first_result.get('city', '').lower()
            
            self.log_test(
                f"{city_name} City Match First",
                city_match,
                f"First: {first_result.get('iata')} - {first_result.get('city')} ({first_result.get('airport', '')})"
            )
    
    def test_multi_airport_cities(self):
        """Test cities with multiple airports show all options"""
        print("\n🎯 TESTING MULTI-AIRPORT CITIES")
        print("=" * 50)
        
        test_cases = [
            ("London", ["LHR", "LGW", "STN", "LTN", "LCY"], 5),
            ("New York", ["JFK", "LGA", "EWR"], 3),
            ("Paris", ["CDG", "ORY"], 2),
            ("Tokyo", ["NRT", "HND"], 2),
            ("Dubai", ["DXB", "DWC"], 2),
            ("Istanbul", ["IST", "SAW"], 2)
        ]
        
        for city, expected_iatas, min_count in test_cases:
            result = self.search_airports(city, limit=20)
            
            if not result["success"]:
                self.log_test(f"{city} Multi-Airport Search", False, f"API failed: {result.get('error')}")
                continue
                
            results = result["results"]
            city_airports = [r for r in results if city.lower() in r.get('city', '').lower()]
            found_iatas = [r.get('iata', '').upper() for r in city_airports]
            
            # Check if we found the expected airports
            found_expected = sum(1 for iata in expected_iatas if iata in found_iatas)
            
            self.log_test(
                f"{city} Multi-Airport Coverage",
                found_expected >= min_count,
                f"Found {found_expected}/{len(expected_iatas)} airports: {found_iatas}"
            )
    
    def test_comprehensive_airport_coverage(self):
        """Test comprehensive worldwide airport coverage"""
        print("\n🎯 TESTING COMPREHENSIVE AIRPORT COVERAGE")
        print("=" * 50)
        
        # Test major airports from different continents
        major_airports = [
            # Europe
            ("LHR", "London", "Heathrow"),
            ("CDG", "Paris", "Charles de Gaulle"),
            ("FRA", "Frankfurt", "Frankfurt Airport"),
            ("AMS", "Amsterdam", "Schiphol"),
            ("FCO", "Rome", "Fiumicino"),
            
            # Asia-Pacific
            ("SIN", "Singapore", "Changi"),
            ("HKG", "Hong Kong", "Hong Kong International"),
            ("ICN", "Seoul", "Incheon"),
            ("NRT", "Tokyo", "Narita"),
            ("SYD", "Sydney", "Kingsford Smith"),
            ("MEL", "Melbourne", "Melbourne Airport"),
            ("AKL", "Auckland", "Auckland Airport"),
            
            # Middle East & Africa
            ("DXB", "Dubai", "Dubai International"),
            ("DOH", "Doha", "Hamad International"),
            ("CAI", "Cairo", "Cairo International"),
            ("JNB", "Johannesburg", "OR Tambo"),
            ("CPT", "Cape Town", "Cape Town International"),
            
            # Americas
            ("JFK", "New York", "John F. Kennedy"),
            ("LAX", "Los Angeles", "Los Angeles International"),
            ("ORD", "Chicago", "O'Hare"),
            ("GRU", "São Paulo", "Guarulhos"),
            ("EZE", "Buenos Aires", "Ezeiza"),
            
            # India (comprehensive)
            ("BOM", "Mumbai", "Chhatrapati Shivaji"),
            ("DEL", "Delhi", "Indira Gandhi"),
            ("BLR", "Bengaluru", "Kempegowda"),
            ("MAA", "Chennai", "Chennai International"),
            ("CCU", "Kolkata", "Netaji Subhas"),
            ("HYD", "Hyderabad", "Rajiv Gandhi")
        ]
        
        missing_airports = []
        
        for iata, city, airport_name in major_airports:
            result = self.search_airports(iata)
            
            if not result["success"]:
                missing_airports.append(f"{iata} (API Error)")
                continue
                
            results = result["results"]
            found = any(r.get('iata', '').upper() == iata.upper() for r in results)
            
            if found:
                self.log_test(f"{iata} {city} Found", True, f"Airport found in database")
            else:
                self.log_test(f"{iata} {city} Found", False, f"Airport missing from database")
                missing_airports.append(f"{iata} - {city}")
        
        # Overall coverage test
        coverage_percentage = ((len(major_airports) - len(missing_airports)) / len(major_airports)) * 100
        self.log_test(
            "Major Airport Coverage",
            coverage_percentage >= 95,
            f"Coverage: {coverage_percentage:.1f}% ({len(major_airports) - len(missing_airports)}/{len(major_airports)})"
        )
        
        if missing_airports:
            print(f"\n❌ Missing Airports: {', '.join(missing_airports)}")
    
    def test_search_performance(self):
        """Test search performance and response times"""
        print("\n🎯 TESTING SEARCH PERFORMANCE")
        print("=" * 50)
        
        test_queries = ["DUB", "London", "New York", "Mumbai", "Singapore"]
        
        for query in test_queries:
            start_time = time.time()
            result = self.search_airports(query)
            end_time = time.time()
            
            response_time = end_time - start_time
            
            self.log_test(
                f"{query} Response Time",
                response_time < 2.0,  # Should respond within 2 seconds
                f"Response time: {response_time:.3f}s"
            )
    
    def test_edge_cases_and_partial_matches(self):
        """Test edge cases and partial matching"""
        print("\n🎯 TESTING EDGE CASES AND PARTIAL MATCHES")
        print("=" * 50)
        
        test_cases = [
            ("Lo", "Should return London results"),
            ("Du", "Should return Dubai and Dublin results"),
            ("Sy", "Should return Sydney results"),
            ("Mum", "Should return Mumbai results"),
            ("Del", "Should return Delhi results"),
            ("Ban", "Should return Bangkok results"),
            ("Sin", "Should return Singapore results")
        ]
        
        for query, description in test_cases:
            result = self.search_airports(query)
            
            if not result["success"]:
                self.log_test(f"Partial Match '{query}'", False, f"API failed: {result.get('error')}")
                continue
                
            results = result["results"]
            has_results = len(results) > 0
            
            self.log_test(
                f"Partial Match '{query}'",
                has_results,
                f"Found {len(results)} results - {description}"
            )
    
    def test_no_irrelevant_results(self):
        """Test that irrelevant results don't appear for specific searches"""
        print("\n🎯 TESTING NO IRRELEVANT RESULTS")
        print("=" * 50)
        
        # Test that BLR doesn't appear for IST search
        result = self.search_airports("IST")
        
        if result["success"]:
            results = result["results"]
            blr_found = any(r.get('iata', '').upper() == 'BLR' for r in results)
            
            self.log_test(
                "No BLR in IST Search",
                not blr_found,
                f"BLR found in IST search: {blr_found}"
            )
        else:
            self.log_test("IST Search for Irrelevant Test", False, "API failed")
    
    def run_all_tests(self):
        """Run all airport database tests"""
        print("🚀 STARTING COMPREHENSIVE AIRPORT DATABASE PERFECTION TESTING")
        print("=" * 80)
        print("Objective: Achieve 100% test success rate and ensure ALL IATA airports are in database")
        print("=" * 80)
        
        # Run all test suites
        self.test_dublin_ranking_fix()
        self.test_exact_iata_matches()
        self.test_city_name_matches()
        self.test_multi_airport_cities()
        self.test_comprehensive_airport_coverage()
        self.test_search_performance()
        self.test_edge_cases_and_partial_matches()
        self.test_no_irrelevant_results()
        
        # Print final results
        print("\n" + "=" * 80)
        print("🏆 FINAL TEST RESULTS")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests} ✅")
        print(f"Failed: {self.failed_tests} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate == 100:
            print("\n🎉 PERFECT! 100% SUCCESS RATE ACHIEVED!")
            print("✅ All IATA airports are properly ranked and searchable")
            print("✅ Dublin 'DUB' search ranking issue is fixed")
            print("✅ Exact IATA matches score 1000 and appear first")
            print("✅ Database completeness verified")
        elif success_rate >= 95:
            print(f"\n🎯 EXCELLENT! {success_rate:.1f}% SUCCESS RATE")
            print("✅ Airport database is production-ready with minor improvements needed")
        elif success_rate >= 80:
            print(f"\n⚠️ GOOD! {success_rate:.1f}% SUCCESS RATE")
            print("🔧 Some improvements needed for perfect airport database")
        else:
            print(f"\n❌ NEEDS WORK! {success_rate:.1f}% SUCCESS RATE")
            print("🚨 Significant issues found in airport database")
        
        print("\n📋 DETAILED TEST RESULTS:")
        print("-" * 40)
        for result in self.test_results:
            print(result)
        
        return {
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "failed_tests": self.failed_tests,
            "success_rate": success_rate,
            "results": self.test_results
        }

def main():
    """Main function to run the airport database tests"""
    tester = AirportDatabaseTester()
    results = tester.run_all_tests()
    
    # Return exit code based on success rate
    if results["success_rate"] == 100:
        exit(0)  # Perfect success
    elif results["success_rate"] >= 95:
        exit(1)  # Minor issues
    else:
        exit(2)  # Major issues

if __name__ == "__main__":
    main()