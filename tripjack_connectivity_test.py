#!/usr/bin/env python3
"""
TripJack Connectivity Test
Quick backend connectivity test to TripJack via flight search endpoint
"""

import requests
import json
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend .env
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

def test_tripjack_connectivity():
    """Test TripJack connectivity via flight search endpoint"""
    print("🚀 TripJack Connectivity Test Starting...")
    print(f"Backend URL: {BACKEND_URL}")
    
    # Calculate tomorrow's date
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    print(f"Testing for date: {tomorrow}")
    
    # Prepare payload as requested
    payload = {
        "origin": "DEL",
        "destination": "BOM", 
        "departure_date": tomorrow,
        "passengers": 1,
        "class_type": "economy"
    }
    
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        # Make POST request to flight search endpoint
        print("\n📡 Making request to /api/flights/search...")
        response = requests.post(
            f"{API_BASE}/flights/search",
            json=payload,
            timeout=30,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            flights = data.get('flights', [])
            data_source = data.get('data_source', 'unknown')
            total_found = data.get('total_found', 0)
            
            print(f"✅ SUCCESS - Response received")
            print(f"Data Source: {data_source}")
            print(f"Total Flights Found: {total_found}")
            print(f"Flights Array Length: {len(flights)}")
            
            # Analyze data type
            if data_source == 'real_api':
                print("🎯 REAL TRIPJACK DATA - Live API connection working")
                if flights:
                    sample_flight = flights[0]
                    print(f"Sample Flight: {sample_flight.get('airline', 'N/A')} {sample_flight.get('flight_number', 'N/A')}")
                    print(f"Price: ₹{sample_flight.get('price', 0)}")
            elif data_source == 'mock':
                print("🔄 MOCK DATA - TripJack API not connected, using fallback")
            else:
                print(f"❓ UNKNOWN DATA SOURCE: {data_source}")
            
            # Check if flights array is non-empty as requested
            if len(flights) > 0:
                print("✅ Non-empty flights array confirmed")
                return {
                    'success': True,
                    'status_code': 200,
                    'data_source': data_source,
                    'flights_count': len(flights),
                    'is_real_data': data_source == 'real_api'
                }
            else:
                print("❌ Empty flights array")
                return {
                    'success': False,
                    'status_code': 200,
                    'error': 'Empty flights array',
                    'data_source': data_source
                }
        else:
            print(f"❌ FAILED - Status Code: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error Response: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error Text: {response.text}")
            
            return {
                'success': False,
                'status_code': response.status_code,
                'error': response.text
            }
            
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT - Request timed out after 30 seconds")
        return {
            'success': False,
            'error': 'Request timeout'
        }
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR - Could not connect to backend")
        return {
            'success': False,
            'error': 'Connection error'
        }
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def main():
    """Main test execution"""
    print("=" * 60)
    print("TRIPJACK CONNECTIVITY TEST")
    print("=" * 60)
    
    result = test_tripjack_connectivity()
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    if result['success']:
        print("✅ CONNECTIVITY TEST PASSED")
        print(f"   - Status: 200 OK")
        print(f"   - Flights Found: {result['flights_count']}")
        print(f"   - Data Type: {'REAL TripJack API' if result['is_real_data'] else 'Mock/Fallback Data'}")
    else:
        print("❌ CONNECTIVITY TEST FAILED")
        print(f"   - Status: {result.get('status_code', 'N/A')}")
        print(f"   - Error: {result.get('error', 'Unknown error')}")
    
    return result

if __name__ == "__main__":
    main()