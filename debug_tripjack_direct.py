#!/usr/bin/env python3
"""
Direct Tripjack API Test to Debug Price Structure
"""

import requests
import json
import os
import sys
from datetime import datetime
sys.path.append('/app/backend')

# Load environment variables
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

def test_tripjack_direct():
    """Test Tripjack API directly to see raw response"""
    print("🔍 DIRECT TRIPJACK API TEST")
    print("=" * 60)
    
    try:
        # Get credentials
        api_key = os.environ.get('TRIPJACK_API_KEY')
        base_url = "https://apitest.tripjack.com"
        
        if not api_key:
            print("❌ No Tripjack API key found")
            return
            
        print(f"🔑 API Key: {api_key[:20]}...")
        print(f"🌐 Base URL: {base_url}")
        
        # Prepare search data
        search_data = {
            "searchQuery": {
                "cabinClass": "Y",
                "paxInfo": {
                    "ADULT": 1,
                    "CHILD": 0,
                    "INFANT": 0
                },
                "routeInfos": [
                    {
                        "fromCityOrAirport": {
                            "code": "DEL"
                        },
                        "toCityOrAirport": {
                            "code": "BOM"
                        },
                        "travelDate": "2025-08-13"
                    }
                ],
                "searchModifiers": {
                    "isDirectFlight": False,
                    "isConnectingFlight": False
                }
            }
        }
        
        headers = {
            'Content-Type': 'application/json',
            'apikey': api_key
        }
        
        search_url = f"{base_url}/fms/v1/air-search-all"
        print(f"📡 Making request to: {search_url}")
        
        response = requests.post(search_url, json=search_data, headers=headers, timeout=30)
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            
            # Save full response for analysis
            with open('/app/tripjack_raw_response.json', 'w') as f:
                json.dump(response_data, f, indent=2)
            print("💾 Full response saved to /app/tripjack_raw_response.json")
            
            # Analyze structure
            print(f"\n🔍 RESPONSE STRUCTURE ANALYSIS:")
            print(f"   Top-level keys: {list(response_data.keys())}")
            
            if 'searchResult' in response_data:
                search_result = response_data['searchResult']
                print(f"   searchResult keys: {list(search_result.keys())}")
                
                if 'tripInfos' in search_result:
                    trip_infos = search_result['tripInfos']
                    print(f"   tripInfos keys: {list(trip_infos.keys())}")
                    
                    if 'ONWARD' in trip_infos:
                        onward_flights = trip_infos['ONWARD']
                        print(f"   ONWARD flights count: {len(onward_flights)}")
                        
                        if len(onward_flights) > 0:
                            first_flight = onward_flights[0]
                            print(f"\n💰 FIRST FLIGHT PRICE ANALYSIS:")
                            print(f"   Flight keys: {list(first_flight.keys())}")
                            
                            # Look for price-related fields
                            if 'totalPriceList' in first_flight:
                                price_list = first_flight['totalPriceList']
                                print(f"   totalPriceList count: {len(price_list)}")
                                
                                if len(price_list) > 0:
                                    first_price = price_list[0]
                                    print(f"   First price structure:")
                                    print(json.dumps(first_price, indent=4))
                                    
                                    # Try to extract price using different methods
                                    print(f"\n🔧 PRICE EXTRACTION ATTEMPTS:")
                                    
                                    # Method 1: fd.ADULT.fF or tF
                                    try:
                                        adult_fare = first_price.get('fd', {}).get('ADULT', {})
                                        price1 = adult_fare.get('fF', 0) or adult_fare.get('tF', 0)
                                        print(f"   Method 1 (fd.ADULT.fF/tF): ₹{price1}")
                                    except Exception as e:
                                        print(f"   Method 1 failed: {e}")
                                    
                                    # Method 2: Direct total
                                    try:
                                        price2 = first_price.get('total', 0)
                                        print(f"   Method 2 (total): ₹{price2}")
                                    except Exception as e:
                                        print(f"   Method 2 failed: {e}")
                                    
                                    # Method 3: totalAmount
                                    try:
                                        price3 = first_price.get('totalAmount', 0)
                                        print(f"   Method 3 (totalAmount): ₹{price3}")
                                    except Exception as e:
                                        print(f"   Method 3 failed: {e}")
                                    
                                    # Method 4: price field
                                    try:
                                        price4 = first_price.get('price', 0)
                                        print(f"   Method 4 (price): ₹{price4}")
                                    except Exception as e:
                                        print(f"   Method 4 failed: {e}")
                                        
                                    # Method 5: Look for any numeric fields
                                    print(f"\n🔍 ALL NUMERIC FIELDS IN PRICE STRUCTURE:")
                                    def find_numeric_fields(obj, prefix=""):
                                        if isinstance(obj, dict):
                                            for key, value in obj.items():
                                                if isinstance(value, (int, float)) and value > 0:
                                                    print(f"   {prefix}{key}: {value}")
                                                elif isinstance(value, dict):
                                                    find_numeric_fields(value, f"{prefix}{key}.")
                                    
                                    find_numeric_fields(first_price)
                            
                            else:
                                print("   ❌ No totalPriceList found")
                                
                                # Check for other price fields at flight level
                                print(f"\n🔍 FLIGHT-LEVEL PRICE FIELDS:")
                                for key, value in first_flight.items():
                                    if isinstance(value, (int, float)) and value > 0:
                                        print(f"   {key}: {value}")
                        
        else:
            print(f"❌ API Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_tripjack_direct()