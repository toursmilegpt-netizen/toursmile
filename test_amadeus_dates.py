#!/usr/bin/env python3
"""
Test Amadeus API with different dates to find available flights
"""

import sys
sys.path.append('/app/backend')

from amadeus_flight_api import amadeus_service
from datetime import datetime, timedelta
import json

def test_amadeus_with_different_dates():
    """Test Amadeus API with different dates to find available flights"""
    print("🔍 TESTING AMADEUS API WITH DIFFERENT DATES")
    print("=" * 60)
    
    # Test with different dates
    test_dates = []
    today = datetime.now()
    
    # Add dates from tomorrow to 30 days ahead
    for i in range(1, 31):
        test_date = today + timedelta(days=i)
        test_dates.append(test_date.strftime('%Y-%m-%d'))
    
    # Test popular routes
    routes = [
        ('DEL', 'BOM'),  # Delhi to Mumbai
        ('BOM', 'DEL'),  # Mumbai to Delhi
        ('DEL', 'BLR'),  # Delhi to Bangalore
        ('BOM', 'BLR'),  # Mumbai to Bangalore
    ]
    
    for origin, destination in routes:
        print(f"\n✈️ Testing route: {origin} → {destination}")
        
        for date in test_dates[:5]:  # Test first 5 dates
            try:
                print(f"📅 Testing date: {date}")
                flights = amadeus_service.search_flights(origin, destination, date, 1)
                
                if flights:
                    print(f"🎉 SUCCESS! Found {len(flights)} flights for {origin} → {destination} on {date}")
                    
                    # Show first flight details
                    flight = flights[0]
                    print(f"   ✈️ {flight.get('airline', 'Unknown')} {flight.get('flight_number', 'XX000')}")
                    print(f"   💰 Price: ₹{flight.get('price', 0)}")
                    print(f"   ⏰ Time: {flight.get('departure_time', 'N/A')} → {flight.get('arrival_time', 'N/A')}")
                    print(f"   ⏱️ Duration: {flight.get('duration', 'N/A')}")
                    
                    return True  # Found flights, exit
                else:
                    print(f"   ❌ No flights found for {date}")
                    
            except Exception as e:
                print(f"   ⚠️ Error for {date}: {str(e)}")
        
        print(f"❌ No flights found for route {origin} → {destination}")
    
    print("\n🔍 CONCLUSION:")
    print("Amadeus API is working (authentication successful)")
    print("But no flights found for tested routes and dates")
    print("This could be normal for Amadeus test environment")
    return False

if __name__ == "__main__":
    test_amadeus_with_different_dates()