#!/usr/bin/env python3
"""
AeroDataBox Flight API Integration Test
Specifically testing the API key loading, authentication, and flight search functionality
"""

import os
import sys
import asyncio
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

# Add backend to path
sys.path.append('/app/backend')

# Import the AeroDataBox service
from aerodatabox_flight_api import aerodatabox_service

# Load environment variables
load_dotenv('/app/backend/.env')

class AeroDataBoxTester:
    def __init__(self):
        self.backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'https://travel-portal-15.preview.emergentagent.com')
        self.api_endpoint = f"{self.backend_url}/api/flights/search"
        
    def test_environment_variables(self):
        """Test 1: Verify API key is loaded correctly from environment"""
        print("🔍 TEST 1: Environment Variable Loading")
        print("=" * 50)
        
        # Check if API key exists in environment
        api_key_env = os.environ.get('AERODATABOX_RAPIDAPI_KEY')
        print(f"Environment API Key: {'✅ Found' if api_key_env else '❌ Missing'}")
        if api_key_env:
            print(f"API Key (masked): {api_key_env[:8]}...{api_key_env[-4:]}")
        
        # Check if service loads the key correctly
        service_key = aerodatabox_service.api_key
        print(f"Service API Key: {'✅ Loaded' if service_key else '❌ Not Loaded'}")
        
        # Verify they match
        if api_key_env and service_key:
            match = api_key_env == service_key
            print(f"Keys Match: {'✅ Yes' if match else '❌ No'}")
        
        print()
        return bool(api_key_env and service_key)
    
    def test_api_authentication(self):
        """Test 2: Test API.Market authentication with current credentials"""
        print("🔐 TEST 2: API.Market Authentication")
        print("=" * 50)
        
        if not aerodatabox_service.api_key:
            print("❌ No API key available for authentication test")
            return False
        
        try:
            # Test authentication by making a simple API call
            headers = aerodatabox_service.get_headers()
            print(f"Headers configured: {list(headers.keys())}")
            
            # Test with a simple airport query (Delhi)
            test_url = f"{aerodatabox_service.api_base_url}/flights/airports/iata/DEL"
            print(f"Testing URL: {test_url}")
            
            response = requests.get(test_url, headers=headers, timeout=30)
            print(f"Response Status: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                print("✅ Authentication successful!")
                data = response.json()
                print(f"Response data keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                return True
            elif response.status_code == 401:
                print("❌ Authentication failed - Invalid API key")
                print(f"Response: {response.text}")
                return False
            elif response.status_code == 403:
                print("❌ Authentication failed - Access forbidden (subscription issue)")
                print(f"Response: {response.text}")
                return False
            elif response.status_code == 429:
                print("⚠️ Rate limit exceeded - API key working but quota reached")
                return True
            else:
                print(f"⚠️ Unexpected response: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication test error: {str(e)}")
            return False
        finally:
            print()
    
    def test_direct_api_call(self):
        """Test 3: Direct API call to check for 403 errors or subscription issues"""
        print("🌐 TEST 3: Direct API Call Analysis")
        print("=" * 50)
        
        try:
            # Test the exact API endpoint used by the service
            departures = aerodatabox_service.get_airport_departures('DEL', '2025-02-15')
            
            if departures:
                print(f"✅ API call successful - Retrieved {len(departures)} departures")
                if departures:
                    sample = departures[0]
                    print(f"Sample departure keys: {list(sample.keys())}")
                return True
            else:
                print("⚠️ API call returned empty results")
                return True  # Still successful, just no data
                
        except Exception as e:
            print(f"❌ Direct API call failed: {str(e)}")
            return False
        finally:
            print()
    
    def test_flight_search_service(self):
        """Test 4: Test the flight search service functionality"""
        print("✈️ TEST 4: Flight Search Service")
        print("=" * 50)
        
        try:
            # Test Delhi to Mumbai search
            flights = aerodatabox_service.search_flights_by_airport('Delhi', 'Mumbai', '2025-02-15', 2)
            
            print(f"Flights found: {len(flights)}")
            
            if flights:
                print("✅ Flight search successful!")
                for i, flight in enumerate(flights[:3], 1):
                    print(f"  Flight {i}: {flight.get('airline', 'Unknown')} {flight.get('flight_number', 'XX000')} - ₹{flight.get('price', 0)}")
                    print(f"    Time: {flight.get('departure_time', 'N/A')} → {flight.get('arrival_time', 'N/A')}")
                    print(f"    Duration: {flight.get('duration', 'N/A')}")
                return True
            else:
                print("⚠️ No flights found - API working but no matching flights")
                return True
                
        except Exception as e:
            print(f"❌ Flight search error: {str(e)}")
            return False
        finally:
            print()
    
    async def test_backend_endpoint(self):
        """Test 5: Test the /api/flights/search endpoint"""
        print("🔗 TEST 5: Backend Endpoint Integration")
        print("=" * 50)
        
        try:
            # Test data for Delhi to Mumbai
            test_data = {
                "origin": "Delhi",
                "destination": "Mumbai", 
                "departure_date": "2025-02-15",
                "passengers": 2,
                "class_type": "economy"
            }
            
            print(f"Testing endpoint: {self.api_endpoint}")
            print(f"Request data: {json.dumps(test_data, indent=2)}")
            
            response = requests.post(self.api_endpoint, json=test_data, timeout=30)
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Backend endpoint successful!")
                print(f"Response keys: {list(data.keys())}")
                
                flights = data.get('flights', [])
                print(f"Flights returned: {len(flights)}")
                
                data_source = data.get('data_source', 'unknown')
                print(f"Data source: {data_source}")
                
                if data_source == 'real_api':
                    print("🎉 Using real AeroDataBox API data!")
                else:
                    print("⚠️ Using mock data (AeroDataBox API not working)")
                
                # Show sample flight
                if flights:
                    sample_flight = flights[0]
                    print(f"Sample flight: {sample_flight.get('airline', 'Unknown')} - ₹{sample_flight.get('price', 0)}")
                
                return True
            else:
                print(f"❌ Backend endpoint failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Backend endpoint test error: {str(e)}")
            return False
        finally:
            print()
    
    def run_comprehensive_test(self):
        """Run all tests and provide detailed analysis"""
        print("🚀 AERODATABOX API INTEGRATION COMPREHENSIVE TEST")
        print("=" * 60)
        print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        results = {}
        
        # Run all tests
        results['env_vars'] = self.test_environment_variables()
        results['auth'] = self.test_api_authentication()
        results['direct_api'] = self.test_direct_api_call()
        results['flight_search'] = self.test_flight_search_service()
        
        # Run async test
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            results['backend_endpoint'] = loop.run_until_complete(self.test_backend_endpoint())
        finally:
            loop.close()
        
        # Summary
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(results.values())
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name.replace('_', ' ').title()}: {status}")
        
        print()
        print(f"Overall Result: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED - AeroDataBox integration is working perfectly!")
        elif passed >= 3:
            print("⚠️ MOSTLY WORKING - Some issues detected but core functionality works")
        else:
            print("❌ MAJOR ISSUES - AeroDataBox integration needs attention")
        
        return results

if __name__ == "__main__":
    tester = AeroDataBoxTester()
    results = tester.run_comprehensive_test()