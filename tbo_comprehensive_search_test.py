#!/usr/bin/env python3
"""
TBO COMPREHENSIVE SEARCH TEST
============================

Now that authentication is working, let's test different search scenarios
to find working flight routes and dates.
"""

import asyncio
import httpx
import json
from datetime import datetime, timedelta

# Correct TBO URLs
TBO_AUTH_URL = "https://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate"
TBO_SEARCH_URL = "https://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search"

# TBO Credentials
TBO_USERNAME = "Smile"
TBO_PASSWORD = "Smile@123"

async def get_tbo_token():
    """Get TBO authentication token"""
    auth_payload = {
        "ClientId": "ApiIntegrationNew",
        "UserName": TBO_USERNAME,
        "Password": TBO_PASSWORD,
        "EndUserIp": "192.168.11.120"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(TBO_AUTH_URL, json=auth_payload)
        if response.status_code == 200:
            auth_data = response.json()
            if auth_data.get("Status") == 1:
                return auth_data.get("TokenId")
    return None

async def test_flight_search(token, origin, destination, departure_date, test_name):
    """Test flight search with specific parameters"""
    
    search_payload = {
        "EndUserIp": "192.168.1.1",
        "TokenId": token,
        "AdultCount": 1,
        "ChildCount": 0,
        "InfantCount": 0,
        "DirectFlight": "false",
        "OneStopFlight": "false",
        "JourneyType": "1",
        "PreferredAirlines": None,
        "Segments": [
            {
                "Origin": origin,
                "Destination": destination,
                "FlightCabinClass": "1",
                "PreferredDepartureTime": departure_date + "T00:00:00",
                "PreferredArrivalTime": departure_date + "T00:00:00"
            }
        ]
    }
    
    print(f"\n--- {test_name} ---")
    print(f"Route: {origin} → {destination}")
    print(f"Date: {departure_date}")
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(TBO_SEARCH_URL, json=search_payload)
            
            if response.status_code == 200:
                search_data = response.json()
                
                # Check if search was successful
                response_obj = search_data.get("Response", {})
                error = response_obj.get("Error", {})
                error_code = error.get("ErrorCode", 0)
                error_message = error.get("ErrorMessage", "")
                
                if error_code == 0:  # Success
                    results = search_data.get("Response", {}).get("Results", [])
                    if results:
                        total_flights = sum(len(group) for group in results)
                        print(f"✅ SUCCESS: Found {total_flights} flights!")
                        
                        # Show first flight details
                        if results[0]:
                            first_flight = results[0][0]
                            segments = first_flight.get("Segments", [[]])[0]
                            if segments:
                                airline = segments[0].get("Airline", {})
                                airline_name = airline.get("AirlineName", "Unknown")
                                flight_number = airline.get("FlightNumber", "")
                                fare = first_flight.get("Fare", {})
                                published_fare = fare.get("PublishedFare", 0)
                                
                                print(f"   Sample: {airline_name} {flight_number} - ₹{published_fare}")
                        
                        return True
                    else:
                        print(f"❌ No flights in results")
                        return False
                else:
                    print(f"❌ Error {error_code}: {error_message}")
                    return False
            else:
                print(f"❌ HTTP {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return False

async def main():
    """Test comprehensive TBO search scenarios"""
    print("🚀 TBO COMPREHENSIVE SEARCH TEST")
    print("=" * 50)
    
    # Get authentication token
    print("Getting TBO token...")
    token = await get_tbo_token()
    if not token:
        print("❌ Failed to get token")
        return False
    
    print(f"✅ Token obtained: {token[:20]}...")
    
    # Test different scenarios
    test_scenarios = []
    
    # Popular Indian routes with different dates
    routes = [
        ("DEL", "BOM"),  # Delhi to Mumbai
        ("BOM", "DEL"),  # Mumbai to Delhi  
        ("DEL", "BLR"),  # Delhi to Bangalore
        ("BLR", "DEL"),  # Bangalore to Delhi
        ("BOM", "BLR"),  # Mumbai to Bangalore
        ("BLR", "BOM"),  # Bangalore to Mumbai
        ("DEL", "MAA"),  # Delhi to Chennai
        ("MAA", "DEL"),  # Chennai to Delhi
        ("BOM", "CCU"),  # Mumbai to Kolkata
        ("CCU", "BOM"),  # Kolkata to Mumbai
    ]
    
    # Test dates: tomorrow, day after tomorrow, next week
    base_date = datetime.now()
    test_dates = [
        (base_date + timedelta(days=1)).strftime("%Y-%m-%d"),
        (base_date + timedelta(days=2)).strftime("%Y-%m-%d"),
        (base_date + timedelta(days=7)).strftime("%Y-%m-%d"),
        (base_date + timedelta(days=14)).strftime("%Y-%m-%d"),
    ]
    
    # Create test scenarios
    for i, (origin, destination) in enumerate(routes[:5]):  # Test first 5 routes
        for j, date in enumerate(test_dates[:2]):  # Test first 2 dates
            test_scenarios.append({
                "origin": origin,
                "destination": destination,
                "date": date,
                "name": f"Route {i+1}.{j+1}: {origin}-{destination} on {date}"
            })
    
    # Run tests
    successful_searches = 0
    total_searches = len(test_scenarios)
    
    for scenario in test_scenarios:
        success = await test_flight_search(
            token,
            scenario["origin"],
            scenario["destination"], 
            scenario["date"],
            scenario["name"]
        )
        
        if success:
            successful_searches += 1
        
        # Small delay between requests
        await asyncio.sleep(1)
    
    # Summary
    print("\n" + "=" * 50)
    print("🎯 COMPREHENSIVE SEARCH SUMMARY")
    print("=" * 50)
    
    success_rate = (successful_searches / total_searches) * 100
    
    print(f"📊 Results: {successful_searches}/{total_searches} searches successful ({success_rate:.1f}%)")
    
    if successful_searches > 0:
        print("✅ TBO INTEGRATION IS WORKING!")
        print("✅ Authentication successful")
        print("✅ Search endpoint functional")
        print("✅ Real flight data available")
        print("✅ Ready for certification testing")
    else:
        print("❌ No successful searches found")
        print("❌ May need to check:")
        print("   - Date ranges (try further in future)")
        print("   - Route availability")
        print("   - Search parameters")
        print("   - TBO account permissions")
    
    return successful_searches > 0

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)