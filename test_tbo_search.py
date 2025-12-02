import asyncio
import httpx
import json
from datetime import datetime, timedelta

async def test_tbo_search():
    # 1. Authenticate
    auth_url = "https://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate"
    auth_payload = {
        "ClientId": "ApiIntegrationNew",
        "UserName": "Smile",
        "Password": "Smile@123",
        "EndUserIp": "192.168.11.120"
    }
    
    token = None
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(auth_url, json=auth_payload)
            if resp.status_code == 200 and resp.json().get("Status") == 1:
                token = resp.json().get("TokenId")
                print("✅ Auth Successful. Token:", token)
            else:
                print("❌ Auth Failed:", resp.text)
                return
    except Exception as e:
        print("❌ Auth Exception:", e)
        return

    # 2. Search
    search_url = "https://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search"
    
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%dT00:00:00")
    
    search_payload = {
        "EndUserIp": "192.168.11.120",
        "TokenId": token,
        "AdultCount": 1,
        "ChildCount": 0,
        "InfantCount": 0,
        "DirectFlight": "false",
        "OneStopFlight": "false",
        "JourneyType": "1", # One Way
        "PreferredAirlines": None,
        "Segments": [
            {
                "Origin": "BOM",
                "Destination": "DEL",
                "FlightCabinClass": "1", # Economy
                "PreferredDepartureTime": tomorrow,
                "PreferredArrivalTime": tomorrow
            }
        ],
        "Sources": None
    }
    
    print(f"\nSearching BOM -> DEL for {tomorrow}")
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(search_url, json=search_payload)
            print(f"Search Status: {resp.status_code}")
            
            if resp.status_code == 200:
                data = resp.json()
                err = data.get("Response", {}).get("Error", {})
                if err.get("ErrorCode") == 0:
                    results = data.get("Response", {}).get("Results", [])
                    count = 0
                    if results:
                        count = len(results[0])
                    print(f"✅ Search Successful! Found {count} flight options.")
                    if count > 0:
                        first = results[0][0]
                        airline = first.get("Segments", [[]])[0][0].get("Airline", {}).get("AirlineName")
                        price = first.get("Fare", {}).get("PublishedFare")
                        print(f"   Sample: {airline} - ₹{price}")
                else:
                    print(f"❌ Search API Error: {err.get('ErrorMessage')}")
            else:
                print("❌ Search HTTP Error:", resp.text)

    except Exception as e:
        print("❌ Search Exception:", e)

if __name__ == "__main__":
    asyncio.run(test_tbo_search())
