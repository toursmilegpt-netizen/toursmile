#!/usr/bin/env python3
"""
Test Flight Search API with a date that has Amadeus flights available
"""

import requests
import json

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
API_BASE = f"{BACKEND_URL}/api"

def test_flight_search_with_real_amadeus_data():
    """Test flight search API with a date that has Amadeus flights"""
    print("🚀 TESTING FLIGHT SEARCH API WITH REAL AMADEUS DATA")
    print("=" * 70)
    
    session = requests.Session()
    session.headers.update({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
    
    # Use a date that we know has flights available
    payload = {
        "origin": "Delhi",
        "destination": "Mumbai", 
        "departure_date": "2025-08-07",  # Date with available flights
        "passengers": 2,
        "class_type": "economy"
    }
    
    print(f"📤 REQUEST: {json.dumps(payload, indent=2)}")
    response = session.post(f"{API_BASE}/flights/search", json=payload)
    
    print(f"Response Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        flights = data.get("flights", [])
        data_source = data.get("data_source", "unknown")
        ai_recommendation = data.get("ai_recommendation", "")
        search_id = data.get("search_id", "")
        
        print(f"Data Source: {data_source}")
        print(f"Flights Found: {len(flights)}")
        print(f"Search ID: {search_id}")
        print(f"AI Recommendation: {'✅ Present' if ai_recommendation else '❌ Missing'}")
        
        if data_source == "real_api":
            print("\n🎉 SUCCESS: USING REAL AMADEUS DATA!")
            print("=" * 50)
            
            # Display real flight details
            for i, flight in enumerate(flights[:5], 1):  # Show first 5 flights
                print(f"\nFlight {i}:")
                print(f"  ✈️ Airline: {flight.get('airline', 'Unknown')}")
                print(f"  🔢 Flight Number: {flight.get('flight_number', 'XX000')}")
                print(f"  💰 Price: ₹{flight.get('price', 0)} {flight.get('currency', 'INR')}")
                print(f"  ⏰ Departure: {flight.get('departure_time', 'N/A')}")
                print(f"  🛬 Arrival: {flight.get('arrival_time', 'N/A')}")
                print(f"  ⏱️ Duration: {flight.get('duration', 'N/A')}")
                print(f"  🛑 Stops: {flight.get('stops', 0)}")
                print(f"  ✈️ Aircraft: {flight.get('aircraft', 'Unknown')}")
                print(f"  🎫 Class: {flight.get('booking_class', 'Economy')}")
                print(f"  💼 Baggage: {flight.get('baggage', 'N/A')}")
            
            print(f"\n✅ AMADEUS INTEGRATION SUCCESSFUL!")
            print(f"✅ Real flight data from Amadeus test environment")
            print(f"✅ {len(flights)} flights available for Delhi → Mumbai")
            print(f"✅ Data includes airlines, prices, times, and aircraft info")
            return True
            
        elif data_source == "mock":
            print("\n⚠️ Using mock data - Amadeus API fallback")
            print("This might be due to the specific date or route")
            return False
        else:
            print(f"\n❌ Unknown data source: {data_source}")
            return False
    else:
        print(f"❌ API Error: HTTP {response.status_code}: {response.text}")
        return False

if __name__ == "__main__":
    test_flight_search_with_real_amadeus_data()