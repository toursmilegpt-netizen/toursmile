#!/usr/bin/env python3
"""
TBO DIAGNOSTIC TEST - Deep Investigation
=======================================

This test will investigate the TBO search failure in detail to understand
why authentication works but search fails.
"""

import requests
import json
import asyncio
import httpx
import os
from datetime import datetime, timedelta

# TBO Configuration
TBO_USERNAME = "Smile"
TBO_PASSWORD = "Smile@123"
TBO_AUTH_URL = "https://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate"
TBO_SEARCH_URL = "https://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search"

async def test_tbo_authentication():
    """Test TBO authentication directly"""
    print("🔍 TESTING TBO AUTHENTICATION DIRECTLY")
    print("=" * 50)
    
    auth_payload = {
        "ClientId": "ApiIntegrationNew",
        "UserName": TBO_USERNAME,
        "Password": TBO_PASSWORD,
        "EndUserIp": "192.168.11.120"
    }
    
    print(f"Auth URL: {TBO_AUTH_URL}")
    print(f"Auth Payload: {json.dumps(auth_payload, indent=2)}")
    print()
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                TBO_AUTH_URL,
                json=auth_payload,
                headers={
                    "Content-Type": "application/json",
                    "Accept-Encoding": "gzip"
                }
            )
            
            print(f"Response Status: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                auth_data = response.json()
                print(f"Auth Response: {json.dumps(auth_data, indent=2)}")
                
                if auth_data.get("Status") == 1:
                    token = auth_data.get("TokenId")
                    print(f"✅ Authentication successful! Token: {token[:20]}...")
                    return token
                else:
                    print(f"❌ Authentication failed: {auth_data}")
                    return None
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return None

async def test_tbo_search(token):
    """Test TBO search directly with token"""
    print("\n🔍 TESTING TBO SEARCH DIRECTLY")
    print("=" * 50)
    
    # Tomorrow's date
    departure_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    search_payload = {
        "EndUserIp": "192.168.1.1",
        "TokenId": token,
        "AdultCount": 1,
        "ChildCount": 0,
        "InfantCount": 0,
        "DirectFlight": "false",
        "OneStopFlight": "false",
        "JourneyType": "1",  # One way
        "PreferredAirlines": None,
        "Segments": [
            {
                "Origin": "DEL",
                "Destination": "BOM",
                "FlightCabinClass": "1",  # Economy
                "PreferredDepartureTime": departure_date + "T00:00:00",
                "PreferredArrivalTime": departure_date + "T00:00:00"
            }
        ]
    }
    
    print(f"Search URL: {TBO_SEARCH_URL}")
    print(f"Search Payload: {json.dumps(search_payload, indent=2)}")
    print()
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                TBO_SEARCH_URL,
                json=search_payload,
                headers={
                    "Content-Type": "application/json",
                    "Accept-Encoding": "gzip"
                }
            )
            
            print(f"Response Status: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                search_data = response.json()
                print(f"Search Response: {json.dumps(search_data, indent=2)}")
                
                # Analyze response
                status = search_data.get("Status", {})
                if isinstance(status, dict):
                    success = status.get("Success", False)
                    description = status.get("Description", "")
                    print(f"\nStatus Success: {success}")
                    print(f"Status Description: {description}")
                    
                    if success:
                        results = search_data.get("Response", {}).get("Results", [])
                        print(f"✅ Search successful! Found {len(results)} result groups")
                        
                        # Count total flights
                        total_flights = 0
                        for result_group in results:
                            total_flights += len(result_group)
                        print(f"Total flights: {total_flights}")
                        
                        return True
                    else:
                        print(f"❌ Search failed: {description}")
                        return False
                else:
                    print(f"❌ Unexpected status format: {status}")
                    return False
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return False

async def test_alternative_search_parameters(token):
    """Test with different search parameters"""
    print("\n🔍 TESTING ALTERNATIVE SEARCH PARAMETERS")
    print("=" * 50)
    
    # Try different parameter combinations
    test_cases = [
        {
            "name": "Minimal Parameters",
            "payload": {
                "EndUserIp": "192.168.1.1",
                "TokenId": token,
                "AdultCount": 1,
                "ChildCount": 0,
                "InfantCount": 0,
                "JourneyType": "1",
                "Segments": [
                    {
                        "Origin": "DEL",
                        "Destination": "BOM",
                        "FlightCabinClass": "1",
                        "PreferredDepartureTime": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%dT06:00:00"),
                        "PreferredArrivalTime": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%dT23:59:00")
                    }
                ]
            }
        },
        {
            "name": "With Direct Flight Preference",
            "payload": {
                "EndUserIp": "192.168.1.1",
                "TokenId": token,
                "AdultCount": 1,
                "ChildCount": 0,
                "InfantCount": 0,
                "DirectFlight": "true",
                "OneStopFlight": "false",
                "JourneyType": "1",
                "Segments": [
                    {
                        "Origin": "DEL",
                        "Destination": "BOM",
                        "FlightCabinClass": "1",
                        "PreferredDepartureTime": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%dT06:00:00"),
                        "PreferredArrivalTime": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%dT23:59:00")
                    }
                ]
            }
        },
        {
            "name": "Different Route (BOM-DEL)",
            "payload": {
                "EndUserIp": "192.168.1.1",
                "TokenId": token,
                "AdultCount": 1,
                "ChildCount": 0,
                "InfantCount": 0,
                "JourneyType": "1",
                "Segments": [
                    {
                        "Origin": "BOM",
                        "Destination": "DEL",
                        "FlightCabinClass": "1",
                        "PreferredDepartureTime": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%dT06:00:00"),
                        "PreferredArrivalTime": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%dT23:59:00")
                    }
                ]
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n--- Testing: {test_case['name']} ---")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    TBO_SEARCH_URL,
                    json=test_case["payload"],
                    headers={
                        "Content-Type": "application/json",
                        "Accept-Encoding": "gzip"
                    }
                )
                
                print(f"Status: {response.status_code}")
                
                if response.status_code == 200:
                    search_data = response.json()
                    status = search_data.get("Status", {})
                    
                    if isinstance(status, dict):
                        success = status.get("Success", False)
                        description = status.get("Description", "")
                        print(f"Success: {success}")
                        print(f"Description: {description}")
                        
                        if success:
                            results = search_data.get("Response", {}).get("Results", [])
                            total_flights = sum(len(group) for group in results)
                            print(f"✅ Found {total_flights} flights")
                        else:
                            print(f"❌ Failed: {description}")
                    else:
                        print(f"Status: {status}")
                else:
                    print(f"❌ HTTP {response.status_code}: {response.text[:200]}")
                    
            except Exception as e:
                print(f"❌ Exception: {str(e)}")

async def main():
    """Run TBO diagnostic tests"""
    print("🚀 TBO DIAGNOSTIC TEST SUITE")
    print("=" * 60)
    print("Investigating TBO search failure in detail")
    print()
    
    # Step 1: Test authentication
    token = await test_tbo_authentication()
    
    if not token:
        print("❌ Cannot proceed without valid token")
        return False
    
    # Step 2: Test basic search
    search_success = await test_tbo_search(token)
    
    # Step 3: Test alternative parameters
    await test_alternative_search_parameters(token)
    
    print("\n" + "=" * 60)
    print("🎯 DIAGNOSTIC SUMMARY")
    print("=" * 60)
    
    if search_success:
        print("✅ TBO integration is working correctly")
        print("✅ Authentication successful")
        print("✅ Search successful")
        print("✅ Ready for certification")
    else:
        print("❌ TBO search is failing")
        print("✅ Authentication works")
        print("❌ Search fails - needs investigation")
        print("❌ Not ready for certification")
    
    return search_success

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)