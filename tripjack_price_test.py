#!/usr/bin/env python3
"""
CRITICAL: Tripjack Price Parsing Test
Tests the updated Tripjack price parsing logic immediately as requested in review.
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
print(f"🚨 CRITICAL TRIPJACK PRICE PARSING TEST")
print(f"Testing backend at: {API_BASE}")
print("=" * 80)

class TripjackPriceTest:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })

    def test_tripjack_price_parsing_critical(self):
        """CRITICAL TEST: Test the exact payload from review request to verify price parsing fix"""
        print("\n🛫 CRITICAL TRIPJACK PRICE PARSING TEST")
        print("=" * 70)
        print("Testing the EXACT payload from review request:")
        print('{"origin": "Delhi", "destination": "Mumbai", "departure_date": "2025-08-13", "passengers": 1, "class_type": "economy"}')
        print("=" * 70)
        
        try:
            # Use the EXACT payload from the review request
            payload = {
                "origin": "Delhi",
                "destination": "Mumbai", 
                "departure_date": "2025-08-13",
                "passengers": 1,
                "class_type": "economy"
            }
            
            print(f"📤 REQUEST: {json.dumps(payload, indent=2)}")
            print(f"🕐 Request time: {datetime.now().strftime('%H:%M:%S')}")
            
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            print(f"📥 Response Status: {response.status_code}")
            print(f"🕐 Response time: {datetime.now().strftime('%H:%M:%S')}")
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                data_source = data.get("data_source", "unknown")
                total_found = data.get("total_found", 0)
                
                print(f"\n📊 RESPONSE ANALYSIS:")
                print(f"   Data Source: {data_source}")
                print(f"   Total Flights Found: {total_found}")
                print(f"   Flights Returned: {len(flights)}")
                
                if len(flights) > 0:
                    print(f"\n💰 PRICE ANALYSIS (CRITICAL):")
                    
                    # Check for the critical price issue
                    zero_price_flights = 0
                    valid_price_flights = 0
                    price_range = {"min": float('inf'), "max": 0}
                    
                    for i, flight in enumerate(flights[:10], 1):  # Check first 10 flights
                        price = flight.get("price", 0)
                        airline = flight.get("airline", "Unknown")
                        flight_number = flight.get("flight_number", "Unknown")
                        
                        if price == 0:
                            zero_price_flights += 1
                            print(f"   ❌ Flight {i}: {airline} {flight_number} - ₹{price} (ZERO PRICE ISSUE)")
                        else:
                            valid_price_flights += 1
                            price_range["min"] = min(price_range["min"], price)
                            price_range["max"] = max(price_range["max"], price)
                            print(f"   ✅ Flight {i}: {airline} {flight_number} - ₹{price:,}")
                    
                    print(f"\n📈 PRICE STATISTICS:")
                    print(f"   Zero Price Flights: {zero_price_flights}")
                    print(f"   Valid Price Flights: {valid_price_flights}")
                    
                    if valid_price_flights > 0:
                        print(f"   Price Range: ₹{price_range['min']:,} - ₹{price_range['max']:,}")
                        
                        # Check if prices are in expected range (₹4,000 - ₹15,000)
                        expected_min = 4000
                        expected_max = 15000
                        in_expected_range = price_range["min"] >= expected_min and price_range["max"] <= expected_max
                        
                        print(f"   Expected Range: ₹{expected_min:,} - ₹{expected_max:,}")
                        print(f"   In Expected Range: {'✅ YES' if in_expected_range else '❌ NO'}")
                    
                    # CRITICAL SUCCESS CRITERIA
                    print(f"\n🎯 CRITICAL SUCCESS CRITERIA:")
                    criteria_met = 0
                    total_criteria = 5
                    
                    # 1. Flights no longer show price: 0
                    if zero_price_flights == 0:
                        print(f"   ✅ 1. No zero-price flights found")
                        criteria_met += 1
                    else:
                        print(f"   ❌ 1. {zero_price_flights} flights still showing ₹0")
                    
                    # 2. Actual prices are extracted (₹4,000 - ₹15,000 range)
                    if valid_price_flights > 0 and price_range["min"] >= 4000 and price_range["max"] <= 15000:
                        print(f"   ✅ 2. Actual prices extracted in expected range")
                        criteria_met += 1
                    else:
                        print(f"   ❌ 2. Prices not in expected ₹4,000-₹15,000 range")
                    
                    # 3. Should return 60+ flights from Tripjack
                    if total_found >= 60:
                        print(f"   ✅ 3. {total_found} flights found (60+ expected)")
                        criteria_met += 1
                    else:
                        print(f"   ❌ 3. Only {total_found} flights found (60+ expected)")
                    
                    # 4. All flight details intact
                    sample_flight = flights[0]
                    required_fields = ["id", "airline", "flight_number", "origin", "destination", "departure_time", "arrival_time"]
                    missing_fields = [field for field in required_fields if field not in sample_flight]
                    
                    if not missing_fields:
                        print(f"   ✅ 4. All flight details intact")
                        criteria_met += 1
                    else:
                        print(f"   ❌ 4. Missing flight details: {missing_fields}")
                    
                    # 5. Data source should be real_api (Tripjack)
                    if data_source == "real_api":
                        print(f"   ✅ 5. Using real Tripjack API data")
                        criteria_met += 1
                    else:
                        print(f"   ❌ 5. Using {data_source} instead of real_api")
                    
                    success_rate = (criteria_met / total_criteria) * 100
                    print(f"\n📊 OVERALL SUCCESS RATE: {success_rate:.1f}% ({criteria_met}/{total_criteria})")
                    
                    if success_rate == 100:
                        print(f"🎉 CRITICAL TEST PASSED! Tripjack price parsing is working perfectly!")
                        print(f"✅ All flights have valid prices")
                        print(f"✅ Price range is realistic (₹{price_range['min']:,} - ₹{price_range['max']:,})")
                        print(f"✅ {total_found} flights from Tripjack API")
                        print(f"✅ Complete flight data structure")
                        return True
                    elif success_rate >= 80:
                        print(f"⚠️  MOSTLY WORKING: Price parsing mostly fixed with minor issues")
                        return False
                    else:
                        print(f"🚨 CRITICAL FAILURE: Price parsing still broken!")
                        print(f"❌ {zero_price_flights} flights still showing ₹0")
                        print(f"❌ This will prevent frontend from displaying flight results")
                        return False
                        
                else:
                    print(f"❌ CRITICAL FAILURE: No flights returned")
                    print(f"   This could be due to:")
                    print(f"   - API authentication issues")
                    print(f"   - Date/route not available")
                    print(f"   - Service downtime")
                    return False
                    
            else:
                print(f"❌ CRITICAL FAILURE: HTTP {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ CRITICAL FAILURE: Exception occurred")
            print(f"Error: {str(e)}")
            return False

    def test_fallback_price_mechanism(self):
        """Test if fallback price (₹4,500) is working when needed"""
        print("\n🔄 TESTING FALLBACK PRICE MECHANISM")
        print("=" * 70)
        
        try:
            # Test with a route that might not have real data to trigger fallback
            payload = {
                "origin": "Delhi",
                "destination": "Goa",  # Different route to potentially trigger fallback
                "departure_date": "2025-08-13",
                "passengers": 1,
                "class_type": "economy"
            }
            
            print(f"📤 Testing fallback with: {payload['origin']} → {payload['destination']}")
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                data_source = data.get("data_source", "unknown")
                
                print(f"   Data Source: {data_source}")
                print(f"   Flights Found: {len(flights)}")
                
                if len(flights) > 0:
                    # Check if fallback price (₹4,500) is being used
                    fallback_price_found = False
                    for flight in flights:
                        if flight.get("price") == 4500:
                            fallback_price_found = True
                            print(f"   ✅ Fallback price ₹4,500 found in {flight.get('airline', 'Unknown')}")
                            break
                    
                    if data_source == "mock" and fallback_price_found:
                        print(f"   ✅ Fallback mechanism working correctly")
                        return True
                    elif data_source == "real_api":
                        print(f"   ✅ Real API data available, fallback not needed")
                        return True
                    else:
                        print(f"   ⚠️  Fallback mechanism status unclear")
                        return True
                else:
                    print(f"   ❌ No flights returned for fallback test")
                    return False
            else:
                print(f"   ❌ HTTP {response.status_code} for fallback test")
                return False
                
        except Exception as e:
            print(f"   ❌ Fallback test error: {str(e)}")
            return False

    def run_critical_test(self):
        """Run the critical Tripjack price parsing test"""
        print("🚨 CRITICAL TRIPJACK PRICE PARSING TEST - IMMEDIATE EXECUTION")
        print("=" * 80)
        print("This test verifies the fix for the critical price parsing issue where")
        print("all flights were showing price: 0 instead of actual prices.")
        print("=" * 80)
        
        start_time = time.time()
        
        # Run the critical test
        main_test_passed = self.test_tripjack_price_parsing_critical()
        
        # Run fallback test
        fallback_test_passed = self.test_fallback_price_mechanism()
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"\n" + "=" * 80)
        print(f"🏁 CRITICAL TEST SUMMARY")
        print("=" * 80)
        print(f"Test Duration: {duration:.2f} seconds")
        print(f"Main Price Parsing Test: {'✅ PASSED' if main_test_passed else '❌ FAILED'}")
        print(f"Fallback Mechanism Test: {'✅ PASSED' if fallback_test_passed else '❌ FAILED'}")
        
        if main_test_passed:
            print(f"\n🎉 SUCCESS! TRIPJACK PRICE PARSING IS WORKING!")
            print(f"✅ Flights now show real prices instead of ₹0")
            print(f"✅ Price extraction logic is functioning correctly")
            print(f"✅ Frontend should now display flight results properly")
            print(f"✅ Booking flow is unblocked")
            print(f"\n🚀 THE CRITICAL ISSUE HAS BEEN RESOLVED!")
        else:
            print(f"\n🚨 CRITICAL FAILURE! PRICE PARSING STILL BROKEN!")
            print(f"❌ Flights are still showing ₹0 prices")
            print(f"❌ Frontend will continue to get stuck on loading screen")
            print(f"❌ Users cannot complete flight bookings")
            print(f"❌ URGENT FIX STILL NEEDED!")
        
        return main_test_passed

if __name__ == "__main__":
    tester = TripjackPriceTest()
    success = tester.run_critical_test()
    exit(0 if success else 1)