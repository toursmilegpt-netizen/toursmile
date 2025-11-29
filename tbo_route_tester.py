#!/usr/bin/env python3
"""
TBO Route Availability Tester
Tests various routes to find which ones actually return data in TBO staging environment
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from tbo_flight_api import tbo_flight_service

# Test routes - Common Indian domestic routes
TEST_ROUTES = [
    # Major metro routes
    ("BOM", "DEL", "Mumbai → Delhi"),
    ("DEL", "BOM", "Delhi → Mumbai"),
    ("BOM", "BLR", "Mumbai → Bangalore"),
    ("BLR", "BOM", "Bangalore → Mumbai"),
    ("DEL", "BLR", "Delhi → Bangalore"),
    ("BLR", "DEL", "Bangalore → Delhi"),
    ("BOM", "MAA", "Mumbai → Chennai"),
    ("MAA", "BOM", "Chennai → Mumbai"),
    ("DEL", "MAA", "Delhi → Chennai"),
    ("MAA", "DEL", "Chennai → Delhi"),
    ("BOM", "CCU", "Mumbai → Kolkata"),
    ("CCU", "BOM", "Kolkata → Mumbai"),
    ("DEL", "HYD", "Delhi → Hyderabad"),
    ("HYD", "DEL", "Hyderabad → Delhi"),
    ("BOM", "HYD", "Mumbai → Hyderabad"),
    ("HYD", "BOM", "Hyderabad → Mumbai"),
    
    # Secondary city routes
    ("BOM", "PNQ", "Mumbai → Pune"),
    ("DEL", "JAI", "Delhi → Jaipur"),
    ("BLR", "HYD", "Bangalore → Hyderabad"),
    ("HYD", "BLR", "Hyderabad → Bangalore"),
    ("MAA", "BLR", "Chennai → Bangalore"),
    ("BLR", "MAA", "Bangalore → Chennai"),
    ("BOM", "GOI", "Mumbai → Goa"),
    ("GOI", "BOM", "Goa → Mumbai"),
    ("DEL", "GOI", "Delhi → Goa"),
    ("BLR", "GOI", "Bangalore → Goa"),
    ("MAA", "HYD", "Chennai → Hyderabad"),
    ("HYD", "MAA", "Hyderabad → Chennai"),
    ("CCU", "BLR", "Kolkata → Bangalore"),
    ("BLR", "CCU", "Bangalore → Kolkata"),
    ("CJB", "BOM", "Coimbatore → Mumbai"),
    ("BOM", "CJB", "Mumbai → Coimbatore"),
    
    # North India routes
    ("DEL", "AMD", "Delhi → Ahmedabad"),
    ("AMD", "DEL", "Ahmedabad → Delhi"),
    ("DEL", "LKO", "Delhi → Lucknow"),
    ("DEL", "IXC", "Delhi → Chandigarh"),
    ("DEL", "SXR", "Delhi → Srinagar"),
    ("BOM", "AMD", "Mumbai → Ahmedabad"),
    ("AMD", "BOM", "Ahmedabad → Mumbai"),
    
    # Tourist routes
    ("DEL", "IXL", "Delhi → Leh"),
    ("BOM", "UDR", "Mumbai → Udaipur"),
    ("DEL", "UDR", "Delhi → Udaipur"),
    ("BOM", "JAI", "Mumbai → Jaipur"),
]

# Test dates
TEST_DATES = [
    (datetime.now() + timedelta(days=3), "3 days from now"),
    (datetime.now() + timedelta(days=7), "1 week from now"),
    (datetime.now() + timedelta(days=14), "2 weeks from now"),
    (datetime.now() + timedelta(days=21), "3 weeks from now"),
]

async def test_route(origin, destination, route_name, departure_date, date_name, passengers=1, class_type="economy"):
    """Test a single route"""
    try:
        results = await tbo_flight_service.search_flights(
            origin=origin,
            destination=destination,
            departure_date=departure_date.strftime("%Y-%m-%d"),
            passengers=passengers,
            class_type=class_type,
            trip_type="oneway"
        )
        
        if results and len(results) > 0:
            return {
                "status": "SUCCESS",
                "route": route_name,
                "origin": origin,
                "destination": destination,
                "date": departure_date.strftime("%Y-%m-%d"),
                "date_desc": date_name,
                "flight_count": len(results),
                "sample_airline": results[0].get('airline'),
                "sample_price": results[0].get('base_price')
            }
        else:
            return {
                "status": "NO_FLIGHTS",
                "route": route_name,
                "origin": origin,
                "destination": destination,
                "date": departure_date.strftime("%Y-%m-%d"),
                "date_desc": date_name
            }
    except Exception as e:
        return {
            "status": "ERROR",
            "route": route_name,
            "origin": origin,
            "destination": destination,
            "date": departure_date.strftime("%Y-%m-%d"),
            "date_desc": date_name,
            "error": str(e)
        }

async def main():
    """Run comprehensive route testing"""
    print("=" * 80)
    print("🧪 TBO STAGING ENVIRONMENT - ROUTE AVAILABILITY TEST")
    print("=" * 80)
    print(f"Testing {len(TEST_ROUTES)} routes across {len(TEST_DATES)} date ranges")
    print(f"Total test combinations: {len(TEST_ROUTES) * len(TEST_DATES)}")
    print("=" * 80)
    print()
    
    successful_routes = []
    failed_routes = []
    error_routes = []
    
    total_tests = len(TEST_ROUTES) * len(TEST_DATES)
    current_test = 0
    
    for origin, destination, route_name in TEST_ROUTES:
        for departure_date, date_name in TEST_DATES:
            current_test += 1
            print(f"\r[{current_test}/{total_tests}] Testing {route_name} ({date_name})...", end="", flush=True)
            
            result = await test_route(origin, destination, route_name, departure_date, date_name)
            
            if result["status"] == "SUCCESS":
                successful_routes.append(result)
            elif result["status"] == "NO_FLIGHTS":
                failed_routes.append(result)
            else:
                error_routes.append(result)
            
            # Small delay to avoid overwhelming the API
            await asyncio.sleep(0.5)
    
    print("\n")
    print("=" * 80)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 80)
    print(f"✅ Successful routes with data: {len(successful_routes)}")
    print(f"⚠️  Routes with no flights: {len(failed_routes)}")
    print(f"❌ Routes with errors: {len(error_routes)}")
    print(f"📈 Success rate: {(len(successful_routes)/total_tests)*100:.1f}%")
    print()
    
    if successful_routes:
        print("=" * 80)
        print("✅ WORKING ROUTES (Use these for certification!)")
        print("=" * 80)
        
        # Group by route
        route_groups = {}
        for result in successful_routes:
            key = f"{result['origin']}-{result['destination']}"
            if key not in route_groups:
                route_groups[key] = []
            route_groups[key].append(result)
        
        for route_key, results in sorted(route_groups.items()):
            first = results[0]
            print(f"\n🔹 {first['route']} ({first['origin']} → {first['destination']})")
            for r in results:
                print(f"   📅 {r['date']} ({r['date_desc']}): {r['flight_count']} flights | Sample: {r['sample_airline']} @ ₹{r['sample_price']}")
        
        print()
        print("=" * 80)
        print("📝 RECOMMENDED TEST CASES FOR TBO CERTIFICATION")
        print("=" * 80)
        
        # Pick the best routes for certification
        if len(route_groups) > 0:
            sorted_routes = sorted(route_groups.items(), key=lambda x: len(x[1]), reverse=True)
            
            print("\n✅ Test Case 1: High-traffic metro route")
            best_route = sorted_routes[0][1][0]
            print(f"   Route: {best_route['route']} ({best_route['origin']} → {best_route['destination']})")
            print(f"   Date: {best_route['date']}")
            print(f"   Passengers: 2 Adults")
            print(f"   Expected Results: {best_route['flight_count']} flights")
            
            if len(sorted_routes) > 1:
                print("\n✅ Test Case 2: Secondary route")
                second_route = sorted_routes[1][1][0]
                print(f"   Route: {second_route['route']} ({second_route['origin']} → {second_route['destination']})")
                print(f"   Date: {second_route['date']}")
                print(f"   Passengers: 1 Adult")
                print(f"   Expected Results: {second_route['flight_count']} flights")
            
            if len(sorted_routes) > 2:
                print("\n✅ Test Case 3: Alternate route")
                third_route = sorted_routes[2][1][0]
                print(f"   Route: {third_route['route']} ({third_route['origin']} → {third_route['destination']})")
                print(f"   Date: {third_route['date']}")
                print(f"   Passengers: 1 Adult, 1 Child")
                print(f"   Expected Results: {third_route['flight_count']} flights")
    
    if error_routes:
        print()
        print("=" * 80)
        print("❌ ROUTES WITH ERRORS")
        print("=" * 80)
        for result in error_routes[:10]:  # Show first 10 errors
            print(f"🔸 {result['route']}: {result['error']}")
    
    print()
    print("=" * 80)
    print("💡 RECOMMENDATION FOR TBO EMAIL")
    print("=" * 80)
    if len(successful_routes) > 0:
        success_rate = (len(successful_routes)/total_tests)*100
        print(f"✅ {len(successful_routes)} out of {total_tests} route/date combinations work ({success_rate:.1f}% success)")
        print(f"✅ {len(route_groups)} unique routes have available data")
        print()
        print("📧 Include in your email to TBO:")
        print(f"   - Total routes tested: {len(TEST_ROUTES)}")
        print(f"   - Working routes: {len(route_groups)}")
        print(f"   - Success rate: {success_rate:.1f}%")
        print(f"   - Request: Use the {len(route_groups)} working routes for certification")
    else:
        print("⚠️  No working routes found in TBO staging environment")
        print("📧 Include in your email to TBO:")
        print("   - All test routes returned 'Code 25: No result found'")
        print("   - Request specific routes with guaranteed data availability")
    
    print()
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(main())
