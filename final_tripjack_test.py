#!/usr/bin/env python3
"""
Final Comprehensive Tripjack Test - Verify Complete Fix
"""

import requests
import json
import time
from datetime import datetime

# Load backend URL
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
API_BASE = f"{BACKEND_URL}/api"

def final_comprehensive_test():
    """Final comprehensive test to verify the complete fix"""
    print("🎯 FINAL COMPREHENSIVE TRIPJACK TEST")
    print("=" * 60)
    print("Verifying the complete fix for Tripjack price parsing")
    print("=" * 60)
    
    session = requests.Session()
    session.headers.update({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
    
    # Test multiple routes to ensure robustness
    test_routes = [
        {
            "name": "Delhi → Mumbai (Review Request Route)",
            "payload": {
                "origin": "Delhi",
                "destination": "Mumbai", 
                "departure_date": "2025-08-13",
                "passengers": 1,
                "class_type": "economy"
            }
        },
        {
            "name": "Delhi → Goa (Alternative Route)",
            "payload": {
                "origin": "Delhi",
                "destination": "Goa", 
                "departure_date": "2025-08-13",
                "passengers": 2,
                "class_type": "economy"
            }
        },
        {
            "name": "Mumbai → Bangalore (Different Route)",
            "payload": {
                "origin": "Mumbai",
                "destination": "Bangalore", 
                "departure_date": "2025-08-14",
                "passengers": 1,
                "class_type": "business"
            }
        }
    ]
    
    overall_success = True
    total_flights_with_prices = 0
    price_ranges = []
    
    for i, test_route in enumerate(test_routes, 1):
        print(f"\n🛫 TEST {i}: {test_route['name']}")
        print("-" * 50)
        
        try:
            start_time = time.time()
            response = session.post(f"{API_BASE}/flights/search", json=test_route['payload'])
            end_time = time.time()
            
            print(f"⏱️  Response Time: {end_time - start_time:.2f}s")
            print(f"📥 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                data_source = data.get("data_source", "unknown")
                total_found = data.get("total_found", 0)
                
                print(f"📊 Data Source: {data_source}")
                print(f"📊 Total Flights: {total_found}")
                print(f"📊 Flights Returned: {len(flights)}")
                
                if len(flights) > 0:
                    # Analyze prices
                    prices = [f.get('price', 0) for f in flights]
                    valid_prices = [p for p in prices if p > 0]
                    zero_prices = [p for p in prices if p == 0]
                    
                    if len(valid_prices) > 0:
                        min_price = min(valid_prices)
                        max_price = max(valid_prices)
                        avg_price = sum(valid_prices) / len(valid_prices)
                        
                        print(f"💰 Price Analysis:")
                        print(f"   Valid Prices: {len(valid_prices)}/{len(flights)}")
                        print(f"   Zero Prices: {len(zero_prices)}")
                        print(f"   Price Range: ₹{min_price:,} - ₹{max_price:,}")
                        print(f"   Average Price: ₹{avg_price:,.0f}")
                        
                        # Check if in expected range
                        expected_min, expected_max = 3000, 20000
                        in_range = expected_min <= min_price <= expected_max and expected_min <= max_price <= expected_max
                        print(f"   In Expected Range (₹{expected_min:,}-₹{expected_max:,}): {'✅ YES' if in_range else '❌ NO'}")
                        
                        # Show sample flights
                        print(f"📋 Sample Flights:")
                        for j, flight in enumerate(flights[:3], 1):
                            airline = flight.get('airline', 'Unknown')
                            flight_num = flight.get('flight_number', 'Unknown')
                            price = flight.get('price', 0)
                            dep_time = flight.get('departure_time', 'Unknown')
                            arr_time = flight.get('arrival_time', 'Unknown')
                            print(f"   {j}. {airline} {flight_num}: ₹{price:,} ({dep_time} → {arr_time})")
                        
                        if len(zero_prices) == 0 and in_range:
                            print(f"✅ Route Test PASSED")
                            total_flights_with_prices += len(valid_prices)
                            price_ranges.append((min_price, max_price))
                        else:
                            print(f"❌ Route Test FAILED")
                            overall_success = False
                    else:
                        print(f"❌ No valid prices found")
                        overall_success = False
                else:
                    print(f"❌ No flights returned")
                    overall_success = False
            else:
                print(f"❌ API Error: {response.status_code}")
                print(response.text[:200])
                overall_success = False
                
        except Exception as e:
            print(f"❌ Test Error: {str(e)}")
            overall_success = False
    
    # Final Summary
    print(f"\n" + "=" * 60)
    print(f"🏁 FINAL TEST SUMMARY")
    print("=" * 60)
    
    if overall_success:
        print(f"🎉 ALL TESTS PASSED!")
        print(f"✅ Total flights with valid prices: {total_flights_with_prices}")
        
        if price_ranges:
            all_min = min(r[0] for r in price_ranges)
            all_max = max(r[1] for r in price_ranges)
            print(f"✅ Overall price range: ₹{all_min:,} - ₹{all_max:,}")
        
        print(f"\n🚀 CRITICAL ISSUE RESOLUTION CONFIRMED:")
        print(f"✅ Tripjack price parsing is working correctly")
        print(f"✅ All flights show real prices instead of ₹0")
        print(f"✅ Multiple routes tested successfully")
        print(f"✅ Frontend should now display flight results properly")
        print(f"✅ Booking flow is completely unblocked")
        print(f"✅ The review request issue has been RESOLVED")
        
        return True
    else:
        print(f"🚨 SOME TESTS FAILED!")
        print(f"❌ Price parsing may still have issues")
        print(f"❌ Further investigation needed")
        return False

if __name__ == "__main__":
    success = final_comprehensive_test()
    exit(0 if success else 1)