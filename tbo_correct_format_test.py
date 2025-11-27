#!/usr/bin/env python3
"""
TBO Flight Search Test with Correct Time Format
Testing TBO flight search API with the correct time format as specified by the API.
"""

import asyncio
import httpx
import json
from datetime import datetime, timedelta

class TBOCorrectFormatTester:
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

    async def test_flight_search_correct_format(self):
        """Test TBO flight search with correct time format"""
        print("🔍 Testing TBO Flight Search API with Correct Time Format")
        print("=" * 70)
        
        # Get authentication token
        token = await self.get_auth_token()
        if not token:
            print("❌ Cannot proceed without authentication token")
            return
            
        # Use tomorrow's date
        tomorrow = datetime.now() + timedelta(days=1)
        departure_date = tomorrow.strftime("%Y-%m-%d")
        
        print(f"Using departure date: {departure_date}")
        print("Using correct time formats as specified by TBO API:")
        print("- AnyTime: '00:00:00'")
        print("- Morning: '08:00:00'") 
        print("- AfterNoon: '14:00:00'")
        print("- Evening: '19:00:00'")
        print("- Night: '01:00:00'")
        
        # Correct search payload with proper time format
        search_payload = {
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
                    "PreferredDepartureTime": departure_date + "T00:00:00",  # AnyTime format
                    "PreferredArrivalTime": departure_date + "T00:00:00"     # AnyTime format
                }
            ]
        }
        
        print(f"\n🧪 Testing with AnyTime format (00:00:00)")
        print(f"Payload: {json.dumps(search_payload, indent=2)}")
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.tbo_search_url,
                    json=search_payload,
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
                        
                        # Check response structure
                        if "Response" in data:
                            response_data = data["Response"]
                            status = response_data.get("ResponseStatus", 0)
                            
                            if status == 1:
                                print(f"🎉 FLIGHT SEARCH SUCCESSFUL!")
                                results = response_data.get("Results", [])
                                print(f"Found {len(results)} result groups")
                                
                                total_flights = 0
                                for group in results:
                                    total_flights += len(group)
                                
                                print(f"Total flights found: {total_flights}")
                                
                                if results and results[0]:
                                    first_flight = results[0][0]
                                    print(f"\n📋 Sample Flight Details:")
                                    print(f"Flight: {first_flight.get('Segments', [{}])[0].get('Airline', {}).get('AirlineName', 'N/A')}")
                                    print(f"Flight Number: {first_flight.get('Segments', [{}])[0].get('Airline', {}).get('FlightNumber', 'N/A')}")
                                    
                                    fare = first_flight.get('Fare', {})
                                    print(f"Price: {fare.get('Currency', 'INR')} {fare.get('PublishedFare', 'N/A')}")
                                    
                                    segments = first_flight.get('Segments', [[]])[0]
                                    if segments:
                                        origin = segments[0].get('Origin', {})
                                        destination = segments[-1].get('Destination', {})
                                        print(f"Route: {origin.get('Airport', {}).get('CityName', 'N/A')} → {destination.get('Airport', {}).get('CityName', 'N/A')}")
                                        print(f"Departure: {origin.get('DepTime', 'N/A')}")
                                        print(f"Arrival: {destination.get('ArrTime', 'N/A')}")
                                    
                                    print(f"\n🔍 Full Response Sample:")
                                    print(f"{json.dumps(data, indent=2)[:1000]}...")
                                    
                                    return True
                                    
                            elif status == 3:
                                error = response_data.get("Error", {})
                                print(f"❌ Search failed: {error.get('ErrorMessage', 'Unknown error')}")
                                print(f"Error Code: {error.get('ErrorCode', 'N/A')}")
                            else:
                                print(f"⚠️ Unexpected status: {status}")
                                print(f"Response: {json.dumps(data, indent=2)}")
                                
                    except json.JSONDecodeError:
                        print(f"❌ Invalid JSON response")
                        print(f"Response text: {response.text[:500]}...")
                        
                else:
                    print(f"❌ HTTP {response.status_code}")
                    print(f"Response: {response.text[:300]}...")
                    
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            
        return False

async def main():
    """Main test execution"""
    tester = TBOCorrectFormatTester()
    success = await tester.test_flight_search_correct_format()
    
    if success:
        print("\n🎉 TBO FLIGHT API INTEGRATION SUCCESSFUL!")
        print("✅ Authentication working with updated endpoint")
        print("✅ Flight search working with correct time format")
        print("✅ Real TBO flight data received")
    else:
        print("\n❌ TBO FLIGHT API INTEGRATION FAILED")
        print("Need to investigate further or contact TBO support")

if __name__ == "__main__":
    asyncio.run(main())