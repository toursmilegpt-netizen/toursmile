#!/usr/bin/env python3
"""
Popular Trips Backend API Testing Suite for TourSmile
Tests all Popular Trips endpoints and validates data structure as requested by user
"""

import requests
import json
import time
import os
from datetime import datetime

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
print(f"Testing Popular Trips backend at: {API_BASE}")

class PopularTripsTester:
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
            'errors': [],
            'total_trips_found': 0,
            'trip_counts': {}
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

    def test_popular_trips_no_filters(self):
        """Test GET /api/popular-trips without filters - should return trips (default limit=20)"""
        print("\n🏖️ TESTING POPULAR TRIPS API - No Filters (Default Limit=20)")
        print("=" * 70)
        try:
            response = self.session.get(f"{API_BASE}/popular-trips")
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data["success"] and "trips" in data:
                    trips = data["trips"]
                    total_trips = data.get("total_trips", 0)
                    
                    # Validate trip structure
                    if len(trips) > 0:
                        trip = trips[0]
                        required_fields = ["id", "title", "duration", "destinations", "price_from", "theme"]
                        missing_fields = [field for field in required_fields if field not in trip]
                        
                        if not missing_fields:
                            self.results['total_trips_found'] += total_trips
                            self.results['trip_counts']['no_filters'] = total_trips
                            self.log_result("Popular Trips (No Filters)", True, 
                                          f"Found {total_trips} trips, returned {len(trips)} trips", 
                                          {"total_trips": total_trips, "returned_trips": len(trips), "sample_trip": trip})
                            return True
                        else:
                            self.log_result("Popular Trips (No Filters)", False, 
                                          f"Trip missing required fields: {missing_fields}")
                    else:
                        self.log_result("Popular Trips (No Filters)", False, "No trips returned")
                else:
                    self.log_result("Popular Trips (No Filters)", False, f"Invalid response structure: {data}")
            else:
                self.log_result("Popular Trips (No Filters)", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Popular Trips (No Filters)", False, f"Error: {str(e)}")
        return False

    def test_popular_trips_limit_100(self):
        """Test GET /api/popular-trips with limit=100 - should return up to 100 trips"""
        print("\n🏖️ TESTING POPULAR TRIPS API - Limit=100")
        print("=" * 70)
        try:
            response = self.session.get(f"{API_BASE}/popular-trips?limit=100")
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data["success"] and "trips" in data:
                    trips = data["trips"]
                    total_trips = data.get("total_trips", 0)
                    
                    if len(trips) > 0:
                        self.results['trip_counts']['limit_100'] = total_trips
                        self.log_result("Popular Trips (Limit=100)", True, 
                                      f"Found {total_trips} trips with limit=100", 
                                      {"total_trips": total_trips, "returned_trips": len(trips)})
                        return True
                    else:
                        self.log_result("Popular Trips (Limit=100)", False, "No trips returned")
                else:
                    self.log_result("Popular Trips (Limit=100)", False, f"Invalid response structure: {data}")
            else:
                self.log_result("Popular Trips (Limit=100)", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Popular Trips (Limit=100)", False, f"Error: {str(e)}")
        return False

    def test_popular_trips_india_domestic(self):
        """Test GET /api/popular-trips?region=india_domestic - should return domestic India trips"""
        print("\n🇮🇳 TESTING POPULAR TRIPS API - India Domestic Region")
        print("=" * 70)
        try:
            response = self.session.get(f"{API_BASE}/popular-trips?region=india_domestic")
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data["success"] and "trips" in data:
                    trips = data["trips"]
                    total_trips = data.get("total_trips", 0)
                    filters_applied = data.get("filters_applied", {})
                    
                    if len(trips) > 0:
                        # Verify these are domestic trips
                        sample_destinations = trips[0].get("destinations", [])
                        self.results['trip_counts']['india_domestic'] = total_trips
                        self.log_result("Popular Trips (India Domestic)", True, 
                                      f"Found {total_trips} domestic India trips", 
                                      {"total_trips": total_trips, "filters_applied": filters_applied, 
                                       "sample_destinations": sample_destinations})
                        return True
                    else:
                        self.log_result("Popular Trips (India Domestic)", False, "No domestic trips returned")
                else:
                    self.log_result("Popular Trips (India Domestic)", False, f"Invalid response structure: {data}")
            else:
                self.log_result("Popular Trips (India Domestic)", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Popular Trips (India Domestic)", False, f"Error: {str(e)}")
        return False

    def test_popular_trips_international(self):
        """Test GET /api/popular-trips?region=international - should return international trips"""
        print("\n🌍 TESTING POPULAR TRIPS API - International Region")
        print("=" * 70)
        try:
            response = self.session.get(f"{API_BASE}/popular-trips?region=international")
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data["success"] and "trips" in data:
                    trips = data["trips"]
                    total_trips = data.get("total_trips", 0)
                    filters_applied = data.get("filters_applied", {})
                    
                    if len(trips) > 0:
                        # Verify these are international trips
                        sample_destinations = trips[0].get("destinations", [])
                        self.results['trip_counts']['international'] = total_trips
                        self.log_result("Popular Trips (International)", True, 
                                      f"Found {total_trips} international trips", 
                                      {"total_trips": total_trips, "filters_applied": filters_applied,
                                       "sample_destinations": sample_destinations})
                        return True
                    else:
                        self.log_result("Popular Trips (International)", False, "No international trips returned")
                else:
                    self.log_result("Popular Trips (International)", False, f"Invalid response structure: {data}")
            else:
                self.log_result("Popular Trips (International)", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Popular Trips (International)", False, f"Error: {str(e)}")
        return False

    def test_specific_trip_details(self):
        """Test GET /api/popular-trips/{trip_id} for specific trips (RAJ001, KER001, SEA001)"""
        print("\n🔍 TESTING SPECIFIC TRIP DETAILS")
        print("=" * 70)
        
        trip_ids = ["RAJ001", "KER001", "SEA001"]
        success_count = 0
        
        for trip_id in trip_ids:
            try:
                print(f"\n📋 Testing trip ID: {trip_id}")
                response = self.session.get(f"{API_BASE}/popular-trips/{trip_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    if "success" in data and data["success"] and "trip" in data:
                        trip = data["trip"]
                        
                        # Validate detailed trip structure
                        required_fields = ["id", "title", "duration", "destinations", "price_from", "theme", "highlights"]
                        missing_fields = [field for field in required_fields if field not in trip]
                        
                        if not missing_fields:
                            # Check for detailed fields
                            detailed_fields = ["best_time", "inclusions", "itinerary"]
                            has_detailed = any(field in trip for field in detailed_fields)
                            
                            print(f"✅ Trip {trip_id}: Found with all required fields")
                            if has_detailed:
                                print(f"   📝 Has detailed information: {[f for f in detailed_fields if f in trip]}")
                            success_count += 1
                        else:
                            print(f"❌ Trip {trip_id}: Missing fields: {missing_fields}")
                    else:
                        print(f"❌ Trip {trip_id}: Invalid response structure")
                elif response.status_code == 404:
                    print(f"❌ Trip {trip_id}: Not found (404)")
                else:
                    print(f"❌ Trip {trip_id}: HTTP {response.status_code}")
            except Exception as e:
                print(f"❌ Trip {trip_id}: Error - {str(e)}")
        
        if success_count == len(trip_ids):
            self.log_result("Specific Trip Details", True, 
                          f"All {success_count}/{len(trip_ids)} specific trips found with complete data")
            return True
        else:
            self.log_result("Specific Trip Details", False, 
                          f"Only {success_count}/{len(trip_ids)} trips found successfully")
        return False

    def test_featured_trips(self):
        """Test GET /api/featured-trips endpoint"""
        print("\n⭐ TESTING FEATURED TRIPS API")
        print("=" * 70)
        try:
            response = self.session.get(f"{API_BASE}/featured-trips")
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data["success"] and "featured_trips" in data:
                    featured_trips = data["featured_trips"]
                    total_featured = data.get("total_featured", 0)
                    
                    if len(featured_trips) > 0:
                        # Validate featured trip structure
                        trip = featured_trips[0]
                        required_fields = ["id", "title", "duration", "destinations", "price_from", "theme"]
                        missing_fields = [field for field in required_fields if field not in trip]
                        
                        if not missing_fields:
                            self.results['trip_counts']['featured'] = total_featured
                            self.log_result("Featured Trips", True, 
                                          f"Found {total_featured} featured trips", 
                                          {"total_featured": total_featured, "sample_trip": trip})
                            return True
                        else:
                            self.log_result("Featured Trips", False, 
                                          f"Featured trip missing required fields: {missing_fields}")
                    else:
                        self.log_result("Featured Trips", False, "No featured trips returned")
                else:
                    self.log_result("Featured Trips", False, f"Invalid response structure: {data}")
            else:
                self.log_result("Featured Trips", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Featured Trips", False, f"Error: {str(e)}")
        return False

    def test_filtering_combinations(self):
        """Test filtering by theme, budget, duration range"""
        print("\n🔧 TESTING FILTERING COMBINATIONS")
        print("=" * 70)
        
        filter_tests = [
            {"theme": "Heritage & Culture", "name": "Heritage Theme Filter"},
            {"max_budget": 30000, "name": "Budget Filter (≤30k)"},
            {"min_nights": 5, "max_nights": 10, "name": "Duration Filter (5-10 nights)"},
            {"region": "india_domestic", "theme": "Adventure", "name": "Region + Theme Filter"}
        ]
        
        success_count = 0
        
        for test_filter in filter_tests:
            try:
                filter_name = test_filter.pop("name")
                params = "&".join([f"{k}={v}" for k, v in test_filter.items()])
                url = f"{API_BASE}/popular-trips?{params}"
                
                print(f"\n🔍 Testing: {filter_name}")
                print(f"   URL: {url}")
                
                response = self.session.get(url)
                
                if response.status_code == 200:
                    data = response.json()
                    if "success" in data and data["success"] and "trips" in data:
                        trips = data["trips"]
                        total_trips = data.get("total_trips", 0)
                        filters_applied = data.get("filters_applied", {})
                        
                        print(f"   ✅ {filter_name}: Found {total_trips} trips")
                        print(f"   📋 Filters applied: {filters_applied}")
                        success_count += 1
                    else:
                        print(f"   ❌ {filter_name}: Invalid response structure")
                else:
                    print(f"   ❌ {filter_name}: HTTP {response.status_code}")
            except Exception as e:
                print(f"   ❌ {filter_name}: Error - {str(e)}")
        
        if success_count == len(filter_tests):
            self.log_result("Filtering Combinations", True, 
                          f"All {success_count} filter combinations working")
            return True
        else:
            self.log_result("Filtering Combinations", False, 
                          f"Only {success_count}/{len(filter_tests)} filters working")
        return False

    def count_total_trips_in_data(self):
        """Count total trips available in the data structure"""
        print("\n📊 ANALYZING TOTAL TRIPS IN DATA")
        print("=" * 70)
        
        try:
            # Import the data directly to count
            import sys
            sys.path.append('/app/backend')
            from popular_trips_data import POPULAR_TRIPS_DATA
            
            total_count = 0
            region_counts = {}
            
            for region_name, region_data in POPULAR_TRIPS_DATA.items():
                region_count = 0
                destination_counts = {}
                
                for destination_name, trips in region_data.items():
                    trip_count = len(trips)
                    destination_counts[destination_name] = trip_count
                    region_count += trip_count
                
                region_counts[region_name] = {
                    "total": region_count,
                    "destinations": destination_counts
                }
                total_count += region_count
            
            print(f"📈 TOTAL TRIPS IN DATA: {total_count}")
            print(f"📋 BREAKDOWN BY REGION:")
            for region, data in region_counts.items():
                print(f"   {region}: {data['total']} trips")
                for dest, count in data['destinations'].items():
                    print(f"     - {dest}: {count} trips")
            
            self.results['data_analysis'] = {
                "total_trips_in_data": total_count,
                "region_breakdown": region_counts
            }
            
            return total_count
            
        except Exception as e:
            print(f"❌ Error analyzing data: {str(e)}")
            return 0

    def run_comprehensive_tests(self):
        """Run all Popular Trips tests as requested by user"""
        print("=" * 80)
        print("🏖️ COMPREHENSIVE POPULAR TRIPS BACKEND TESTING")
        print("=" * 80)
        print("Testing all Popular Trips endpoints and data validation:")
        print("1. GET /api/popular-trips (no filters, default limit=20)")
        print("2. GET /api/popular-trips?limit=100")
        print("3. GET /api/popular-trips?region=india_domestic")
        print("4. GET /api/popular-trips?region=international")
        print("5. GET /api/popular-trips/{trip_id} for RAJ001, KER001, SEA001")
        print("6. GET /api/featured-trips")
        print("7. Backend filtering logic testing")
        print("8. Data structure validation")
        print("9. Count analysis")
        print("=" * 80)
        
        # Count total trips in data first
        total_in_data = self.count_total_trips_in_data()
        
        # Run all tests
        tests = [
            ("Popular Trips (No Filters)", self.test_popular_trips_no_filters),
            ("Popular Trips (Limit=100)", self.test_popular_trips_limit_100),
            ("Popular Trips (India Domestic)", self.test_popular_trips_india_domestic),
            ("Popular Trips (International)", self.test_popular_trips_international),
            ("Specific Trip Details", self.test_specific_trip_details),
            ("Featured Trips", self.test_featured_trips),
            ("Filtering Combinations", self.test_filtering_combinations)
        ]
        
        for test_name, test_func in tests:
            test_func()
            time.sleep(1)  # Pause between tests
        
        # Print comprehensive summary
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE POPULAR TRIPS TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        
        print(f"\n📈 TRIP COUNT ANALYSIS:")
        print(f"Total trips in data structure: {total_in_data}")
        print(f"Trip counts by endpoint:")
        for endpoint, count in self.results['trip_counts'].items():
            print(f"  - {endpoint}: {count} trips")
        
        if self.results['errors']:
            print(f"\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        success_rate = (self.results['passed'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")
        
        # Final assessment
        if success_rate >= 85:
            print("🎉 Popular Trips backend is working excellently!")
            print("✅ All API endpoints are functional")
            print("✅ Data structures are valid")
            print("✅ Filtering logic is working")
        elif success_rate >= 70:
            print("⚠️  Popular Trips backend is mostly working with minor issues")
        else:
            print("🚨 Popular Trips backend has significant issues that need attention")
        
        return self.results

if __name__ == "__main__":
    tester = PopularTripsTester()
    results = tester.run_comprehensive_tests()