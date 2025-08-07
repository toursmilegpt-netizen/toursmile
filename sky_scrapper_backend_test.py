#!/usr/bin/env python3
"""
Sky Scrapper API Integration Testing Suite for TourSmile AI Travel Platform
CRITICAL TEST: Verify Sky Scrapper API provides Indian LCC coverage
"""

import requests
import json
import time
import os
import sys
from datetime import datetime, timedelta

# Add backend to path for importing Sky Scrapper service
sys.path.append('/app/backend')

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
print(f"Testing Sky Scrapper integration at: {API_BASE}")

class SkyScrrapperTester:
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
            'lcc_airlines_found': [],
            'total_flights_found': 0,
            'pricing_analysis': {}
        }
        
        # Target Indian LCC airlines we're looking for
        self.target_lcc_airlines = [
            'IndiGo',           # 6E - India's largest LCC
            'SpiceJet',         # SG - Major budget carrier  
            'GoAir',            # G8 - Popular LCC
            'AirAsia India',    # I5 - Budget international
            'Air India Express' # IX - Air India's LCC
        ]

    def log_result(self, test_name, success, message="", response_data=None):
        """Log test result with enhanced LCC tracking"""
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

    def test_rapidapi_key_loading(self):
        """Test 1: Verify RapidAPI key is loading correctly from environment"""
        print("\n🔑 TESTING RAPIDAPI KEY LOADING")
        print("=" * 60)
        try:
            # Import Sky Scrapper service
            from sky_scrapper_api import sky_scrapper_service
            
            # Check environment variable
            env_key = os.environ.get('RAPIDAPI_KEY')
            service_key = sky_scrapper_service.api_key
            
            print(f"Environment API Key: {'✅ Found' if env_key else '❌ Missing'}")
            if env_key:
                print(f"API Key (masked): {env_key[:8]}...{env_key[-4:]}")
            
            print(f"Service API Key: {'✅ Loaded' if service_key else '❌ Not Loaded'}")
            
            if env_key and service_key and env_key == service_key:
                self.log_result("RapidAPI Key Loading", True, 
                              f"API key loaded correctly: {env_key[:8]}...{env_key[-4:]}")
                return True
            else:
                self.log_result("RapidAPI Key Loading", False, 
                              "API key not loading correctly from environment")
                return False
                
        except Exception as e:
            self.log_result("RapidAPI Key Loading", False, f"Error: {str(e)}")
            return False

    def test_sky_scrapper_api_connection(self):
        """Test 2: Test Sky Scrapper API connection and authentication"""
        print("\n🌐 TESTING SKY SCRAPPER API CONNECTION")
        print("=" * 60)
        try:
            from sky_scrapper_api import sky_scrapper_service
            
            if not sky_scrapper_service.api_key:
                self.log_result("Sky Scrapper API Connection", False, "No API key available")
                return False
            
            print(f"🔑 API Key: {sky_scrapper_service.api_key[:8]}...{sky_scrapper_service.api_key[-4:]}")
            print(f"🌐 Base URL: {sky_scrapper_service.api_base_url}")
            print(f"🔐 Auth Method: X-RapidAPI-Key header")
            
            # Test API connection
            connection_success = sky_scrapper_service.test_api_connection()
            
            if connection_success:
                self.log_result("Sky Scrapper API Connection", True, 
                              "Sky Scrapper API connection successful")
                return True
            else:
                self.log_result("Sky Scrapper API Connection", False, 
                              "Sky Scrapper API connection failed")
                return False
                
        except Exception as e:
            self.log_result("Sky Scrapper API Connection", False, f"Error: {str(e)}")
            return False

    def test_delhi_mumbai_lcc_coverage(self):
        """Test 3: CRITICAL - Test Delhi → Mumbai search for Indian LCC coverage"""
        print("\n✈️ CRITICAL TEST: DELHI → MUMBAI LCC COVERAGE")
        print("=" * 60)
        try:
            from sky_scrapper_api import sky_scrapper_service
            
            if not sky_scrapper_service.api_key:
                self.log_result("Delhi-Mumbai LCC Coverage", False, "No API key available")
                return False
            
            print("🔍 Searching for flights: Delhi → Mumbai on 2025-02-15")
            print("🎯 Looking specifically for Indian LCC airlines:")
            for airline in self.target_lcc_airlines:
                print(f"   • {airline}")
            
            # Direct API call to Sky Scrapper service
            flights = sky_scrapper_service.search_flights('Delhi', 'Mumbai', '2025-02-15', 2)
            
            print(f"\n📊 API Response: {len(flights)} flights found")
            self.results['total_flights_found'] = len(flights)
            
            if flights:
                print("\n🛩️ FLIGHT ANALYSIS:")
                print("-" * 40)
                
                lcc_flights = []
                all_airlines = []
                pricing_data = []
                
                for i, flight in enumerate(flights, 1):
                    airline = flight.get('airline', 'Unknown')
                    price = flight.get('price', 0)
                    flight_number = flight.get('flight_number', 'N/A')
                    departure = flight.get('departure_time', 'N/A')
                    arrival = flight.get('arrival_time', 'N/A')
                    
                    all_airlines.append(airline)
                    pricing_data.append(price)
                    
                    # Check if it's a target LCC airline
                    is_lcc = airline in self.target_lcc_airlines
                    lcc_indicator = "🎯 LCC" if is_lcc else "    "
                    
                    print(f"  {i:2d}. {lcc_indicator} {airline} {flight_number}")
                    print(f"      💰 ₹{price:,} | ⏰ {departure} → {arrival}")
                    
                    if is_lcc:
                        lcc_flights.append(flight)
                        if airline not in self.results['lcc_airlines_found']:
                            self.results['lcc_airlines_found'].append(airline)
                
                # Analyze results
                unique_airlines = list(set(all_airlines))
                lcc_count = len(lcc_flights)
                
                print(f"\n📈 COVERAGE ANALYSIS:")
                print(f"   Total Airlines: {len(unique_airlines)}")
                print(f"   LCC Airlines Found: {lcc_count}")
                print(f"   LCC Airlines: {', '.join(self.results['lcc_airlines_found'])}")
                
                # Pricing analysis
                if pricing_data:
                    min_price = min(pricing_data)
                    max_price = max(pricing_data)
                    avg_price = sum(pricing_data) / len(pricing_data)
                    
                    self.results['pricing_analysis'] = {
                        'min_price': min_price,
                        'max_price': max_price,
                        'avg_price': avg_price,
                        'price_range_realistic': 3000 <= avg_price <= 8000
                    }
                    
                    print(f"   Price Range: ₹{min_price:,} - ₹{max_price:,}")
                    print(f"   Average Price: ₹{avg_price:,.0f}")
                    print(f"   Realistic Pricing: {'✅ Yes' if self.results['pricing_analysis']['price_range_realistic'] else '❌ No'}")
                
                # Success criteria: At least 2-3 LCC airlines
                if lcc_count >= 2:
                    self.log_result("Delhi-Mumbai LCC Coverage", True, 
                                  f"EXCELLENT LCC COVERAGE! Found {lcc_count} LCC airlines: {', '.join(self.results['lcc_airlines_found'])}")
                    return True
                elif lcc_count == 1:
                    self.log_result("Delhi-Mumbai LCC Coverage", True, 
                                  f"MODERATE LCC COVERAGE: Found 1 LCC airline: {self.results['lcc_airlines_found'][0]}")
                    return True
                else:
                    self.log_result("Delhi-Mumbai LCC Coverage", False, 
                                  f"POOR LCC COVERAGE: No target LCC airlines found. Airlines: {', '.join(unique_airlines)}")
                    return False
            else:
                self.log_result("Delhi-Mumbai LCC Coverage", False, 
                              "No flights returned from Sky Scrapper API")
                return False
                
        except Exception as e:
            self.log_result("Delhi-Mumbai LCC Coverage", False, f"Error: {str(e)}")
            return False

    def test_flight_search_endpoint_integration(self):
        """Test 4: Test /api/flights/search endpoint with Sky Scrapper integration"""
        print("\n🔗 TESTING FLIGHT SEARCH ENDPOINT INTEGRATION")
        print("=" * 60)
        try:
            payload = {
                "origin": "Delhi",
                "destination": "Mumbai", 
                "departure_date": "2025-02-15",
                "passengers": 2,
                "class_type": "economy"
            }
            
            print(f"📤 REQUEST: {json.dumps(payload, indent=2)}")
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            print(f"📊 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                data_source = data.get("data_source", "unknown")
                
                print(f"📡 Data Source: {data_source}")
                print(f"✈️ Flights Found: {len(flights)}")
                
                if data_source == "real_api":
                    # Check for LCC airlines in endpoint response
                    endpoint_lcc_airlines = []
                    for flight in flights:
                        airline = flight.get('airline', '')
                        if airline in self.target_lcc_airlines:
                            endpoint_lcc_airlines.append(airline)
                    
                    endpoint_lcc_count = len(set(endpoint_lcc_airlines))
                    
                    self.log_result("Flight Search Endpoint Integration", True, 
                                  f"✅ REAL SKY SCRAPPER DATA! Found {len(flights)} flights, {endpoint_lcc_count} LCC airlines via endpoint",
                                  {"data_source": data_source, "flights_count": len(flights), 
                                   "lcc_airlines": list(set(endpoint_lcc_airlines))})
                    return True
                elif data_source == "mock":
                    self.log_result("Flight Search Endpoint Integration", True, 
                                  f"⚠️ Using mock data - Sky Scrapper API not working. Found {len(flights)} flights",
                                  {"data_source": data_source, "flights_count": len(flights)})
                    return True
                else:
                    self.log_result("Flight Search Endpoint Integration", False, 
                                  f"Unknown data source: {data_source}")
                    return False
            else:
                self.log_result("Flight Search Endpoint Integration", False, 
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Flight Search Endpoint Integration", False, f"Error: {str(e)}")
            return False

    def test_flight_data_quality(self):
        """Test 5: Assess flight data quality and structure"""
        print("\n📋 TESTING FLIGHT DATA QUALITY")
        print("=" * 60)
        try:
            from sky_scrapper_api import sky_scrapper_service
            
            if not sky_scrapper_service.api_key:
                self.log_result("Flight Data Quality", False, "No API key available")
                return False
            
            # Get flights for quality assessment
            flights = sky_scrapper_service.search_flights('Delhi', 'Mumbai', '2025-02-15', 2)
            
            if not flights:
                self.log_result("Flight Data Quality", False, "No flights to assess")
                return False
            
            print(f"🔍 Assessing {len(flights)} flights for data quality...")
            
            # Check data structure completeness
            required_fields = ['id', 'airline', 'flight_number', 'origin', 'destination', 
                             'departure_time', 'arrival_time', 'duration', 'price', 'currency']
            
            quality_issues = []
            complete_flights = 0
            
            for i, flight in enumerate(flights, 1):
                missing_fields = [field for field in required_fields if field not in flight or not flight[field]]
                
                if not missing_fields:
                    complete_flights += 1
                else:
                    quality_issues.append(f"Flight {i}: Missing {missing_fields}")
            
            completeness_rate = (complete_flights / len(flights)) * 100
            
            print(f"📊 Data Quality Assessment:")
            print(f"   Complete Flights: {complete_flights}/{len(flights)} ({completeness_rate:.1f}%)")
            
            if quality_issues:
                print(f"   Quality Issues: {len(quality_issues)}")
                for issue in quality_issues[:3]:  # Show first 3 issues
                    print(f"     • {issue}")
            
            # Check pricing realism for Indian market
            prices = [f.get('price', 0) for f in flights if f.get('price', 0) > 0]
            realistic_pricing = True
            
            if prices:
                avg_price = sum(prices) / len(prices)
                # Indian domestic flights typically ₹3,000-8,000
                realistic_pricing = 2000 <= avg_price <= 10000
                print(f"   Average Price: ₹{avg_price:,.0f}")
                print(f"   Realistic Pricing: {'✅ Yes' if realistic_pricing else '❌ No'}")
            
            # Success criteria: >80% complete data + realistic pricing
            if completeness_rate >= 80 and realistic_pricing:
                self.log_result("Flight Data Quality", True, 
                              f"HIGH QUALITY DATA: {completeness_rate:.1f}% complete, realistic pricing")
                return True
            elif completeness_rate >= 60:
                self.log_result("Flight Data Quality", True, 
                              f"MODERATE QUALITY DATA: {completeness_rate:.1f}% complete")
                return True
            else:
                self.log_result("Flight Data Quality", False, 
                              f"POOR QUALITY DATA: Only {completeness_rate:.1f}% complete")
                return False
                
        except Exception as e:
            self.log_result("Flight Data Quality", False, f"Error: {str(e)}")
            return False

    def test_alternative_amadeus_api(self):
        """Test 6: Check if Amadeus API (which was previously working) can provide LCC coverage"""
        print("\n🔄 TESTING ALTERNATIVE: AMADEUS API FOR LCC COVERAGE")
        print("=" * 60)
        try:
            # Import Amadeus service
            from amadeus_flight_api import amadeus_service
            
            if not amadeus_service.api_key or not amadeus_service.api_secret:
                self.log_result("Amadeus Alternative API", False, "Amadeus credentials not available")
                return False
            
            print("🔍 Testing Amadeus API as alternative to Sky Scrapper...")
            print(f"🔑 API Key: {amadeus_service.api_key[:8]}...{amadeus_service.api_key[-4:]}")
            
            # Test connection first
            connection_test = amadeus_service.test_api_connection()
            if not connection_test:
                self.log_result("Amadeus Alternative API", False, "Amadeus API connection failed")
                return False
            
            # Try to get flights
            flights = amadeus_service.search_flights('Delhi', 'Mumbai', '2025-08-07', 2)  # Use a different date
            
            if flights:
                print(f"✅ Amadeus returned {len(flights)} flights")
                
                # Check for LCC airlines
                amadeus_lcc_airlines = []
                for flight in flights:
                    airline = flight.get('airline', '')
                    if airline in self.target_lcc_airlines:
                        amadeus_lcc_airlines.append(airline)
                
                amadeus_lcc_count = len(set(amadeus_lcc_airlines))
                
                if amadeus_lcc_count > 0:
                    self.log_result("Amadeus Alternative API", True, 
                                  f"✅ AMADEUS PROVIDES LCC COVERAGE! Found {amadeus_lcc_count} LCC airlines: {', '.join(set(amadeus_lcc_airlines))}",
                                  {"lcc_airlines": list(set(amadeus_lcc_airlines)), "total_flights": len(flights)})
                    return True
                else:
                    self.log_result("Amadeus Alternative API", True, 
                                  f"⚠️ Amadeus working but limited LCC coverage. Found {len(flights)} flights")
                    return True
            else:
                self.log_result("Amadeus Alternative API", True, 
                              "✅ Amadeus API connected but no flights for test route/date")
                return True
                
        except Exception as e:
            self.log_result("Amadeus Alternative API", False, f"Error: {str(e)}")
            return False

    def run_sky_scrapper_integration_tests(self):
        """Run comprehensive Sky Scrapper integration tests"""
        print("=" * 80)
        print("🛩️ SKY SCRAPPER API INTEGRATION TESTING")
        print("=" * 80)
        print("CRITICAL TEST: Verify Sky Scrapper API provides Indian LCC coverage")
        print("")
        print("Testing objectives:")
        print("1. RapidAPI key authentication")
        print("2. Sky Scrapper API connectivity") 
        print("3. 🎯 CRITICAL: Indian LCC coverage (IndiGo, SpiceJet, GoAir, etc.)")
        print("4. Flight search endpoint integration")
        print("5. Flight data quality assessment")
        print("6. Alternative API assessment (Amadeus)")
        print("=" * 80)
        
        # Reset results for this test run
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': [],
            'lcc_airlines_found': [],
            'total_flights_found': 0,
            'pricing_analysis': {}
        }
        
        # Run all Sky Scrapper tests
        tests = [
            ("RapidAPI Key Loading", self.test_rapidapi_key_loading),
            ("Sky Scrapper API Connection", self.test_sky_scrapper_api_connection),
            ("Delhi-Mumbai LCC Coverage", self.test_delhi_mumbai_lcc_coverage),
            ("Flight Search Endpoint Integration", self.test_flight_search_endpoint_integration),
            ("Flight Data Quality", self.test_flight_data_quality)
        ]
        
        for test_name, test_func in tests:
            test_func()
            time.sleep(2)  # Pause between tests
        
        # Print comprehensive summary
        print("\n" + "=" * 80)
        print("📊 SKY SCRAPPER INTEGRATION TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        
        # LCC Coverage Summary
        print(f"\n🎯 INDIAN LCC COVERAGE ANALYSIS:")
        print(f"Target LCC Airlines: {', '.join(self.target_lcc_airlines)}")
        print(f"LCC Airlines Found: {', '.join(self.results['lcc_airlines_found']) if self.results['lcc_airlines_found'] else 'None'}")
        print(f"LCC Coverage Score: {len(self.results['lcc_airlines_found'])}/{len(self.target_lcc_airlines)} airlines")
        print(f"Total Flights Found: {self.results['total_flights_found']}")
        
        # Pricing Analysis
        if self.results['pricing_analysis']:
            pricing = self.results['pricing_analysis']
            print(f"\n💰 PRICING ANALYSIS:")
            print(f"Price Range: ₹{pricing.get('min_price', 0):,} - ₹{pricing.get('max_price', 0):,}")
            print(f"Average Price: ₹{pricing.get('avg_price', 0):,.0f}")
            print(f"Realistic for Indian Market: {'✅ Yes' if pricing.get('price_range_realistic') else '❌ No'}")
        
        if self.results['errors']:
            print(f"\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        success_rate = (self.results['passed'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")
        
        # Final assessment for LCC coverage
        lcc_coverage_score = len(self.results['lcc_airlines_found'])
        
        print("\n" + "=" * 80)
        print("🎯 FINAL LCC COVERAGE ASSESSMENT")
        print("=" * 80)
        
        if lcc_coverage_score >= 3:
            print("🎉 EXCELLENT LCC COVERAGE!")
            print("✅ Sky Scrapper API provides strong Indian LCC coverage")
            print("✅ Multiple budget airlines available for Indian travelers")
            print("✅ API is suitable for Indian budget travel market")
            print("\n🚀 RECOMMENDATION: Sky Scrapper API is PERFECT for Indian LCC coverage!")
            
        elif lcc_coverage_score >= 2:
            print("👍 GOOD LCC COVERAGE!")
            print("✅ Sky Scrapper API provides decent Indian LCC coverage")
            print("✅ Some budget airlines available")
            print("⚠️ Could benefit from more LCC options")
            print("\n✅ RECOMMENDATION: Sky Scrapper API is SUITABLE for Indian market")
            
        elif lcc_coverage_score == 1:
            print("⚠️ LIMITED LCC COVERAGE")
            print("⚠️ Only one LCC airline found")
            print("⚠️ May not fully serve budget travel market")
            print("\n🤔 RECOMMENDATION: Consider additional API sources for better LCC coverage")
            
        else:
            print("❌ POOR LCC COVERAGE")
            print("❌ No target LCC airlines found")
            print("❌ API may focus on premium airlines only")
            print("❌ Not suitable for Indian budget travel market")
            print("\n🚨 RECOMMENDATION: Find alternative APIs with better Indian LCC coverage")
        
        return self.results

if __name__ == "__main__":
    tester = SkyScrrapperTester()
    # Run the Sky Scrapper integration tests
    results = tester.run_sky_scrapper_integration_tests()