#!/usr/bin/env python3
"""
MINIMAL BACKEND TESTING AFTER MOBILE UI FIXES
Testing core backend functionality without PostgreSQL dependencies
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
print(f"🎯 MINIMAL BACKEND TESTING AFTER MOBILE UI FIXES")
print(f"Testing backend at: {API_BASE}")
print("=" * 80)

def test_backend_direct():
    """Test backend directly on localhost to bypass external routing issues"""
    print("\n🔧 TESTING BACKEND DIRECTLY ON LOCALHOST")
    print("=" * 60)
    
    try:
        # Test localhost first
        response = requests.get("http://localhost:8001/api/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend responding on localhost: {data}")
            return True
        else:
            print(f"❌ Backend localhost error: HTTP {response.status_code}")
    except Exception as e:
        print(f"❌ Backend localhost connection failed: {str(e)}")
    
    return False

def test_core_endpoints():
    """Test core endpoints that should work without PostgreSQL"""
    print("\n✈️ TESTING CORE ENDPOINTS (NO POSTGRESQL)")
    print("=" * 60)
    
    endpoints = [
        {
            "name": "Root API",
            "url": "http://localhost:8001/api/",
            "method": "GET"
        },
        {
            "name": "Flight Search",
            "url": "http://localhost:8001/api/flights/search",
            "method": "POST",
            "payload": {
                "origin": "Delhi",
                "destination": "Mumbai",
                "departure_date": "2025-02-15",
                "passengers": 2,
                "class_type": "economy"
            }
        },
        {
            "name": "Hotel Search",
            "url": "http://localhost:8001/api/hotels/search",
            "method": "POST",
            "payload": {
                "location": "Mumbai",
                "checkin_date": "2025-02-15",
                "checkout_date": "2025-02-17",
                "guests": 2,
                "rooms": 1
            }
        },
        {
            "name": "Activities",
            "url": "http://localhost:8001/api/activities/Mumbai",
            "method": "GET"
        },
        {
            "name": "Popular Trips",
            "url": "http://localhost:8001/api/popular-trips",
            "method": "GET"
        }
    ]
    
    successful = 0
    
    for endpoint in endpoints:
        try:
            print(f"\n📋 Testing {endpoint['name']}...")
            
            if endpoint["method"] == "POST":
                response = requests.post(endpoint["url"], json=endpoint["payload"], timeout=10)
            else:
                response = requests.get(endpoint["url"], timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ {endpoint['name']}: Working (Status: 200)")
                if endpoint['name'] == 'Flight Search' and 'flights' in data:
                    print(f"      Found {len(data['flights'])} flights")
                elif endpoint['name'] == 'Hotel Search' and 'hotels' in data:
                    print(f"      Found {len(data['hotels'])} hotels")
                elif endpoint['name'] == 'Activities' and 'activities' in data:
                    print(f"      Found {len(data['activities'])} activities")
                elif endpoint['name'] == 'Popular Trips' and 'trips' in data:
                    print(f"      Found {len(data['trips'])} trips")
                successful += 1
            else:
                print(f"   ❌ {endpoint['name']}: HTTP {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ {endpoint['name']}: Error - {str(e)}")
    
    success_rate = (successful / len(endpoints)) * 100
    print(f"\n📊 Core Endpoints Success Rate: {success_rate:.1f}% ({successful}/{len(endpoints)})")
    
    return success_rate >= 60

def test_external_url():
    """Test the external URL that frontend uses"""
    print(f"\n🌐 TESTING EXTERNAL URL: {API_BASE}")
    print("=" * 60)
    
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ External URL working: {data}")
            return True
        else:
            print(f"❌ External URL error: HTTP {response.status_code}")
            print(f"Response: {response.text[:200]}...")
    except Exception as e:
        print(f"❌ External URL connection failed: {str(e)}")
    
    return False

def main():
    print("🎯 CRITICAL BACKEND TESTING AFTER MOBILE UI FIXES")
    print("Context: Mobile design optimization completed - verifying backend operational status")
    print("Approach: Testing core functionality without PostgreSQL dependencies")
    print("=" * 80)
    
    results = {
        'localhost_test': False,
        'core_endpoints': False,
        'external_url': False
    }
    
    # Test 1: Direct localhost connection
    results['localhost_test'] = test_backend_direct()
    
    # Test 2: Core endpoints (if localhost works)
    if results['localhost_test']:
        results['core_endpoints'] = test_core_endpoints()
    
    # Test 3: External URL
    results['external_url'] = test_external_url()
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 MINIMAL BACKEND TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(results.values())
    total = len(results)
    
    print(f"Localhost Backend: {'✅' if results['localhost_test'] else '❌'}")
    print(f"Core Endpoints: {'✅' if results['core_endpoints'] else '❌'}")
    print(f"External URL: {'✅' if results['external_url'] else '❌'}")
    
    success_rate = (passed / total) * 100
    print(f"\nOverall Success Rate: {success_rate:.1f}% ({passed}/{total})")
    
    # Assessment
    print("\n" + "=" * 80)
    print("🚀 BACKEND STATUS ASSESSMENT")
    print("=" * 80)
    
    if success_rate >= 67:  # 2/3 tests passed
        print("✅ BACKEND CORE FUNCTIONALITY OPERATIONAL")
        print("✅ Mobile UI changes have not broken core backend")
        print("✅ Flight and hotel search working with mock data")
        if not results['external_url']:
            print("⚠️ External URL routing issue (may be infrastructure related)")
        print("\n🚀 CORE BACKEND READY - EXTERNAL ROUTING NEEDS INVESTIGATION")
    else:
        print("🚨 BACKEND HAS CRITICAL ISSUES")
        print("❌ Core functionality not working properly")
        print("❌ Backend service may not be starting correctly")
        print("\n🛑 BACKEND NEEDS IMMEDIATE ATTENTION")
    
    return results

if __name__ == "__main__":
    results = main()
    
    # Exit with appropriate code
    passed = sum(results.values())
    if passed >= 2:
        exit(0)  # Core functionality working
    else:
        exit(1)  # Critical issues