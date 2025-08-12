#!/usr/bin/env python3
"""
Debug Tripjack Price Structure
"""

import requests
import json
import os
import sys
sys.path.append('/app/backend')

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

def debug_tripjack_response():
    """Debug the actual Tripjack response structure"""
    print("🔍 DEBUGGING TRIPJACK RESPONSE STRUCTURE")
    print("=" * 60)
    
    try:
        payload = {
            "origin": "Delhi",
            "destination": "Mumbai", 
            "departure_date": "2025-08-13",
            "passengers": 1,
            "class_type": "economy"
        }
        
        response = requests.post(f"{API_BASE}/flights/search", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            flights = data.get("flights", [])
            
            if len(flights) > 0:
                print(f"📊 Found {len(flights)} flights")
                
                # Look at the first flight's structure
                first_flight = flights[0]
                print(f"\n🔍 FIRST FLIGHT STRUCTURE:")
                print(json.dumps(first_flight, indent=2))
                
                # Check if there are any price-related fields
                print(f"\n💰 PRICE-RELATED FIELDS:")
                for key, value in first_flight.items():
                    if 'price' in key.lower() or 'fare' in key.lower() or 'cost' in key.lower():
                        print(f"   {key}: {value}")
                
                # Check a few more flights
                print(f"\n📋 PRICE SUMMARY (First 5 flights):")
                for i, flight in enumerate(flights[:5], 1):
                    price = flight.get('price', 0)
                    airline = flight.get('airline', 'Unknown')
                    flight_num = flight.get('flight_number', 'Unknown')
                    print(f"   {i}. {airline} {flight_num}: ₹{price}")
                
            else:
                print("❌ No flights found")
        else:
            print(f"❌ API Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    debug_tripjack_response()