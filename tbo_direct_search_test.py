#!/usr/bin/env python3
"""
TBO Direct Flight Search Test
Testing TBO flight search API directly to see the actual response.
"""

import asyncio
import httpx
import json
from datetime import datetime, timedelta

class TBODirectSearchTester:
    def __init__(self):
        self.tbo_auth_url = "https://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate"
        self.tbo_search_url = "https://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search"
        self.tbo_credentials = {
            "ClientId": "ApiIntegrationNew",
            "UserName": "Smile", 
            "Password": "Smile@123",
            "EndUserIp": "192.168.11.120"
        }
        self.token = None
        
    async def get_auth_token(self):
        """Get TBO authentication token"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.tbo_auth_url,
                    json=self.tbo_credentials,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    auth_data = response.json()
                    if auth_data.get("Status") == 1:
                        self.token = auth_data.get("TokenId")
                        print(f"✅ Authentication successful! Token: {self.token[:10]}...")
                        return self.token
                        
        except Exception as e:
            print(f"❌ Authentication failed: {str(e)}")
            
        return None

    async def test_flight_search(self):
        """Test TBO flight search with different date formats"""
        print("🔍 Testing TBO Flight Search API Directly")
        print("=" * 60)
        
        # Get authentication token
        token = await self.get_auth_token()
        if not token:
            print("❌ Cannot proceed without authentication token")
            return
            
        # Use tomorrow's date to avoid "date in past" error
        tomorrow = datetime.now() + timedelta(days=1)
        departure_date = tomorrow.strftime("%Y-%m-%d")
        
        print(f"Using departure date: {departure_date}")
        
        # Test different search payload formats
        search_payloads = [
            {
                "name": "Standard Format",
                "payload": {
                    "EndUserIp": "192.168.1.1",
                    "TokenId": token,
                    "AdultCount": 1,
                    "ChildCount": 0,
                    "InfantCount": 0,
                    "DirectFlight": "false",
                    "OneStopFlight": "false",
                    "JourneyType": "1",
                    "PreferredAirlines": None,
                    "Segments": [
                        {
                            "Origin": "DEL",
                            "Destination": "BOM",
                            "FlightCabinClass": "1",
                            "PreferredDepartureTime": departure_date + "T00:00:00",
                            "PreferredArrivalTime": departure_date + "T23:59:59"
                        }
                    ]
                }
            },
            {
                "name": "Alternative Format 1",
                "payload": {
                    "EndUserIp": "192.168.1.1",
                    "TokenId": token,
                    "AdultCount": 1,
                    "ChildCount": 0,
                    "InfantCount": 0,
                    "DirectFlight": False,
                    "OneStopFlight": False,
                    "JourneyType": 1,
                    "Segments": [
                        {
                            "Origin": "DEL",
                            "Destination": "BOM",
                            "FlightCabinClass": 1,
                            "PreferredDepartureTime": departure_date + "T06:00:00",
                            "PreferredArrivalTime": departure_date + "T23:59:59"
                        }
                    ]
                }
            }
        ]
        
        for test_case in search_payloads:
            print(f"\n🧪 Testing {test_case['name']}")
            print(f"Payload: {json.dumps(test_case['payload'], indent=2)}")
            
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        self.tbo_search_url,
                        json=test_case['payload'],
                        headers={
                            "Content-Type": "application/json",
                            "Accept-Encoding": "gzip"
                        }
                    )
                    
                    print(f"Status: {response.status_code}")
                    
                    if response.status_code == 200:
                        try:
                            data = response.json()
                            print(f"✅ SUCCESS! Response received")
                            print(f"Response: {json.dumps(data, indent=2)}")
                            
                            # Check response structure
                            if "Response" in data:
                                response_data = data["Response"]
                                status = response_data.get("ResponseStatus", 0)
                                
                                if status == 1:
                                    print(f"🎉 FLIGHT SEARCH SUCCESSFUL!")
                                    results = response_data.get("Results", [])
                                    print(f"Found {len(results)} result groups")
                                    
                                    if results:
                                        first_group = results[0]
                                        print(f"First group has {len(first_group)} flights")
                                        if first_group:
                                            first_flight = first_group[0]
                                            print(f"Sample flight: {json.dumps(first_flight, indent=2)[:500]}...")
                                            
                                elif status == 3:
                                    error = response_data.get("Error", {})
                                    print(f"❌ Search failed: {error.get('ErrorMessage', 'Unknown error')}")
                                else:
                                    print(f"⚠️ Unexpected status: {status}")
                                    
                        except json.JSONDecodeError:
                            print(f"❌ Invalid JSON response")
                            print(f"Response text: {response.text[:500]}...")
                            
                    else:
                        print(f"❌ HTTP {response.status_code}")
                        print(f"Response: {response.text[:300]}...")
                        
            except Exception as e:
                print(f"❌ Exception: {str(e)}")

async def main():
    """Main test execution"""
    tester = TBODirectSearchTester()
    await tester.test_flight_search()

if __name__ == "__main__":
    asyncio.run(main())