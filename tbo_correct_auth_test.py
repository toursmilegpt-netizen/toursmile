#!/usr/bin/env python3
"""
TBO CORRECT AUTHENTICATION TEST
==============================

Test TBO authentication with the correct HTTPS URLs from backend/.env
"""

import requests
import json
import time
from datetime import datetime

# Correct TBO Configuration from backend/.env
TBO_USERNAME = "Smile"
TBO_PASSWORD = "Smile@123"
TBO_AUTH_URL = "https://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate"
TBO_BASE_URL = "https://api.tektravels.com"

def test_tbo_correct_authentication():
    """Test TBO authentication with correct HTTPS URLs"""
    print("🔐 TESTING TBO AUTHENTICATION (CORRECT HTTPS URLs)")
    print("=" * 60)
    
    auth_payload = {
        "ClientId": "ApiIntegrationNew",
        "UserName": TBO_USERNAME,
        "Password": TBO_PASSWORD,
        "EndUserIp": "192.168.11.120"
    }
    
    try:
        print(f"🌐 Auth URL: {TBO_AUTH_URL}")
        print(f"👤 Username: {TBO_USERNAME}")
        print(f"🔑 Password: {'*' * len(TBO_PASSWORD)}")
        print()
        
        start_time = time.time()
        response = requests.post(
            TBO_AUTH_URL,
            json=auth_payload,
            headers={
                "Content-Type": "application/json",
                "Accept-Encoding": "gzip"
            },
            timeout=30
        )
        response_time = time.time() - start_time
        
        print(f"⏱️  Response Time: {response_time:.3f}s")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                auth_data = response.json()
                print("📄 Response Data:")
                print(json.dumps(auth_data, indent=2))
                
                # Analyze authentication response
                status = auth_data.get("Status")
                if status == 1:
                    token_id = auth_data.get("TokenId")
                    member_info = auth_data.get("Member", {})
                    
                    print(f"\n✅ AUTHENTICATION SUCCESS!")
                    print(f"🎫 Token ID: {token_id[:20]}..." if token_id else "No Token")
                    print(f"👤 Member: {member_info.get('FirstName', '')} {member_info.get('LastName', '')}")
                    print(f"🏢 Agency: {member_info.get('AgencyName', 'N/A')}")
                    print(f"💰 Balance: {member_info.get('Balance', 'N/A')}")
                    
                    return token_id
                else:
                    error_info = auth_data.get("Error", {})
                    print(f"\n❌ AUTHENTICATION FAILED!")
                    print(f"🚫 Status: {status}")
                    print(f"💬 Error: {error_info.get('ErrorMessage', 'Unknown error')}")
                    return None
                    
            except json.JSONDecodeError:
                print(f"❌ Invalid JSON response: {response.text}")
                return None
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"📄 Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return None

def test_tbo_search_with_correct_url(token_id):
    """Test TBO flight search with correct HTTPS URL"""
    if not token_id:
        print("❌ No valid token for search test")
        return False
        
    print("\n🔍 TESTING TBO FLIGHT SEARCH (CORRECT HTTPS URL)")
    print("=" * 60)
    
    search_payload = {
        "EndUserIp": "192.168.1.1",
        "TokenId": token_id,
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
                "PreferredDepartureTime": "2025-11-28T00:00:00",
                "PreferredArrivalTime": "2025-11-28T00:00:00"
            }
        ]
    }
    
    # Try different possible search endpoints
    search_endpoints = [
        f"{TBO_BASE_URL}/BookingEngineService_Air/AirService.svc/rest/Search",
        f"{TBO_BASE_URL}/SharedAPI/SharedData.svc/rest/Search",
        f"{TBO_BASE_URL}/Search"
    ]
    
    for search_url in search_endpoints:
        try:
            print(f"🌐 Trying Search URL: {search_url}")
            print(f"🎫 Using Token: {token_id[:20]}...")
            print(f"✈️  Route: DEL → BOM")
            
            start_time = time.time()
            response = requests.post(
                search_url,
                json=search_payload,
                headers={
                    "Content-Type": "application/json",
                    "Accept-Encoding": "gzip"
                },
                timeout=60
            )
            response_time = time.time() - start_time
            
            print(f"⏱️  Response Time: {response_time:.3f}s")
            print(f"📊 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    search_data = response.json()
                    
                    # Analyze search response structure
                    status = search_data.get("Status", {})
                    if isinstance(status, dict):
                        success = status.get("Success", False)
                        description = status.get("Description", "No description")
                        print(f"   Status Success: {success}")
                        print(f"   Status Description: {description}")
                        
                        if success:
                            response_data = search_data.get("Response", {})
                            if response_data:
                                results = response_data.get("Results", [])
                                print(f"   Results Groups: {len(results)}")
                                
                                if results:
                                    total_flights = sum(len(group) for group in results)
                                    print(f"   Total Flights: {total_flights}")
                                    
                                    if total_flights > 0:
                                        print(f"\n✅ SEARCH SUCCESS!")
                                        print(f"🛫 Found {total_flights} flights")
                                        return True
                        else:
                            print(f"   ⚠️  Search not successful: {description}")
                    else:
                        print(f"   Status: {status}")
                        
                except json.JSONDecodeError:
                    print(f"❌ Invalid JSON response: {response.text[:500]}...")
                    
            elif response.status_code == 404:
                print(f"   ❌ Endpoint not found (404)")
                continue  # Try next endpoint
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
                print(f"   📄 Response: {response.text[:200]}...")
                
        except Exception as e:
            print(f"   ❌ Request failed: {str(e)}")
            continue
        
        print()  # Space between endpoint attempts
    
    return False

def main():
    """Main test function"""
    print("🚀 TBO CORRECT AUTHENTICATION & SEARCH TEST")
    print("=" * 70)
    print(f"🕐 Test Time: {datetime.now().isoformat()}")
    print()
    
    # Test 1: Correct Authentication
    token_id = test_tbo_correct_authentication()
    
    # Test 2: Flight Search (if authentication succeeded)
    if token_id:
        search_success = test_tbo_search_with_correct_url(token_id)
    else:
        search_success = False
    
    # Summary
    print("\n" + "=" * 70)
    print("🎯 TEST SUMMARY")
    print("=" * 70)
    
    auth_status = "✅ PASS" if token_id else "❌ FAIL"
    search_status = "✅ PASS" if search_success else "❌ FAIL"
    
    print(f"🔐 Authentication: {auth_status}")
    print(f"🔍 Flight Search: {search_status}")
    
    if token_id and search_success:
        print("\n🎉 TBO API FULLY FUNCTIONAL!")
        print("✅ Ready for production flight searches")
        print("✅ Backend should be updated to use HTTPS URLs")
    elif token_id:
        print("\n⚠️  TBO AUTHENTICATION WORKS, SEARCH ENDPOINT ISSUES")
        print("🔧 Need to find correct search endpoint URL")
        print("✅ Authentication credentials are valid")
    else:
        print("\n❌ TBO AUTHENTICATION FAILED")
        print("🔧 Check credentials or TBO account status")
    
    print("=" * 70)
    
    return token_id is not None

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)