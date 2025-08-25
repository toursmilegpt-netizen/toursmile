#!/usr/bin/env python3
"""
Simple Backend Health Check Test
As per review request: Hit GET /api (health) and optionally POST /api/flights/search
"""

import requests
import json
from datetime import datetime, timedelta

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
print(f"🎯 SIMPLE BACKEND HEALTH CHECK")
print(f"Testing backend at: {API_BASE}")
print("=" * 60)

def test_health_check():
    """Test GET /api (health) endpoint"""
    try:
        print("1. Testing GET /api (health check)...")
        response = requests.get(f"{API_BASE}/", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "TourSmile" in data.get("message", ""):
                print("✅ Health Check: Backend is UP and responding correctly")
                print(f"   Response: {data}")
                return True
            else:
                print(f"❌ Health Check: Unexpected response: {data}")
        else:
            print(f"❌ Health Check: HTTP {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Health Check: Connection error: {str(e)}")
    return False

def test_flight_search():
    """Test POST /api/flights/search with DEL->BOM tomorrow, 1 pax, economy"""
    try:
        print("\n2. Testing POST /api/flights/search (optional)...")
        
        # Calculate tomorrow's date
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        payload = {
            "origin": "Delhi",
            "destination": "Mumbai",
            "departure_date": tomorrow,
            "passengers": 1,
            "class_type": "economy"
        }
        
        print(f"   Payload: DEL->BOM, {tomorrow}, 1 pax, economy")
        response = requests.post(f"{API_BASE}/flights/search", json=payload, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if "flights" in data:
                flights_count = len(data.get("flights", []))
                data_source = data.get("data_source", "unknown")
                print(f"✅ Flight Search: 200 OK - Found {flights_count} flights (source: {data_source})")
                return True
            else:
                print(f"❌ Flight Search: Missing 'flights' in response: {data}")
        else:
            print(f"❌ Flight Search: HTTP {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Flight Search: Error: {str(e)}")
    return False

def main():
    """Run simple health tests"""
    health_ok = test_health_check()
    flight_ok = test_flight_search()
    
    print("\n" + "=" * 60)
    print("📊 SIMPLE HEALTH CHECK SUMMARY")
    print("=" * 60)
    
    if health_ok:
        print("✅ Backend Health: UP")
    else:
        print("❌ Backend Health: DOWN")
    
    if flight_ok:
        print("✅ Flight Search: Working")
    else:
        print("⚠️  Flight Search: Issues (optional test)")
    
    print("\n🎯 CONCLUSION:")
    if health_ok:
        print("✅ Backend is healthy and responding to requests")
        if flight_ok:
            print("✅ Flight search API is also working correctly")
        else:
            print("⚠️  Flight search has issues but backend core is healthy")
    else:
        print("🚨 Backend health check failed - service may be down")

if __name__ == "__main__":
    main()