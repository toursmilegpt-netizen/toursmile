#!/usr/bin/env python3
"""Quick TBO Route Tester - Tests 10 most popular routes"""

import asyncio
import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from tbo_flight_api import tbo_flight_service

# Top 10 most popular routes
TEST_ROUTES = [
    ("BOM", "DEL", "Mumbai → Delhi"),
    ("DEL", "BOM", "Delhi → Mumbai"),
    ("BOM", "BLR", "Mumbai → Bangalore"),
    ("BLR", "BOM", "Bangalore → Mumbai"),
    ("DEL", "BLR", "Delhi → Bangalore"),
    ("BLR", "DEL", "Bangalore → Delhi"),
    ("BOM", "GOI", "Mumbai → Goa"),
    ("CJB", "BOM", "Coimbatore → Mumbai"),
    ("DEL", "HYD", "Delhi → Hyderabad"),
    ("BOM", "MAA", "Mumbai → Chennai"),
]

async def test_route(origin, destination, route_name):
    """Test a single route for next week"""
    departure_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    
    try:
        print(f"\n🧪 Testing: {route_name}")
        print(f"   Date: {departure_date}, Passengers: 1 Adult, Class: Economy")
        
        results = await tbo_flight_service.search_flights(
            origin=origin,
            destination=destination,
            departure_date=departure_date,
            passengers=1,
            class_type="economy",
            trip_type="oneway"
        )
        
        if results and len(results) > 0:
            print(f"   ✅ SUCCESS: {len(results)} flights found")
            print(f"   Sample: {results[0].get('airline')} {results[0].get('flight_number')} @ ₹{results[0].get('base_price')}")
            return {"route": route_name, "origin": origin, "dest": destination, "status": "✅", "count": len(results), "date": departure_date}
        else:
            print(f"   ❌ FAILED: No flights found (Code 25)")
            return {"route": route_name, "origin": origin, "dest": destination, "status": "❌", "count": 0, "date": departure_date}
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)[:100]}")
        return {"route": route_name, "origin": origin, "dest": destination, "status": "❌", "count": 0, "error": str(e)[:100], "date": departure_date}

async def main():
    print("=" * 80)
    print("🚀 TBO STAGING - QUICK ROUTE AVAILABILITY TEST")
    print("=" * 80)
    print(f"Testing {len(TEST_ROUTES)} popular routes for 1 week from now")
    print("=" * 80)
    
    results = []
    for origin, destination, route_name in TEST_ROUTES:
        result = await test_route(origin, destination, route_name)
        results.append(result)
        await asyncio.sleep(1)  # Small delay between tests
    
    print("\n")
    print("=" * 80)
    print("📊 SUMMARY RESULTS")
    print("=" * 80)
    
    working = [r for r in results if r['status'] == '✅']
    failed = [r for r in results if r['status'] == '❌']
    
    print(f"✅ Working routes: {len(working)}/{len(results)}")
    print(f"❌ Failed routes: {len(failed)}/{len(results)}")
    print(f"📈 Success rate: {(len(working)/len(results))*100:.1f}%")
    
    if working:
        print("\n" + "=" * 80)
        print("✅ WORKING ROUTES FOR CERTIFICATION")
        print("=" * 80)
        for r in working:
            print(f"✓ {r['route']} ({r['origin']}-{r['dest']}) | Date: {r['date']} | {r['count']} flights")
    
    if failed:
        print("\n" + "=" * 80)
        print("❌ FAILED ROUTES (Code 25: No Result Found)")
        print("=" * 80)
        for r in failed:
            print(f"✗ {r['route']} ({r['origin']}-{r['dest']})")
    
    print("\n" + "=" * 80)
    print("📧 FOR YOUR TBO EMAIL")
    print("=" * 80)
    if working:
        print(f"✅ Working Routes Found: {len(working)} out of {len(TEST_ROUTES)}")
        print("\nRECOMMENDED TEST CASES:")
        for i, r in enumerate(working[:3], 1):
            print(f"\nTest Case {i}:")
            print(f"  Route: {r['origin']} → {r['dest']} ({r['route']})")
            print(f"  Date: {r['date']}")
            print(f"  Expected Results: ~{r['count']} flights")
    else:
        print("⚠️  NO working routes found!")
        print("Include this in email: All {len(TEST_ROUTES)} tested routes returned 'Code 25: No result found'")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    asyncio.run(main())
