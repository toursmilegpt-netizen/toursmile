#!/usr/bin/env python3
"""
TBO Final Integration Test
Testing the complete TBO integration with corrected endpoint, credentials, and time format.
"""

import asyncio
import httpx
import json
from datetime import datetime, timedelta

class TBOFinalIntegrationTester:
    def __init__(self):
        self.backend_url = "https://flight-cert-runner.preview.emergentagent.com"
        self.tbo_auth_url = "https://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate"
        self.tbo_search_url = "https://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search"
        self.tbo_credentials = {
            "ClientId": "ApiIntegrationNew",
            "UserName": "Smile", 
            "Password": "Smile@123",
            "EndUserIp": "192.168.11.120"
        }
        
    async def test_tbo_authentication(self):
        """Test TBO authentication with updated endpoint and format"""
        print("🔐 Testing TBO Authentication")
        print(f"Endpoint: {self.tbo_auth_url}")
        print(f"Format: {json.dumps(self.tbo_credentials, indent=2)}")
        
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
                        token = auth_data.get("TokenId")
                        member = auth_data.get("Member", {})
                        print(f"✅ Authentication successful!")
                        print(f"   TokenId: {token[:10]}...")
                        print(f"   Member: {member.get('FirstName')} {member.get('LastName')}")
                        print(f"   Email: {member.get('Email')}")
                        return token
                    else:
                        print(f"❌ Authentication failed: {auth_data}")
                        return None
                else:
                    print(f"❌ HTTP {response.status_code}: {response.text}")
                    return None
                    
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return None

    async def test_tbo_flight_search_direct(self, token):
        """Test TBO flight search directly"""
        print(f"\n✈️ Testing TBO Flight Search (Direct API)")
        
        # Use a date 7 days in the future to ensure availability
        future_date = datetime.now() + timedelta(days=7)
        departure_date = future_date.strftime("%Y-%m-%d")
        
        print(f"Search: Delhi → Mumbai on {departure_date}")
        
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
                    "PreferredDepartureTime": departure_date + "T00:00:00",
                    "PreferredArrivalTime": departure_date + "T00:00:00"
                }
            ]
        }
        
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
                
                if response.status_code == 200:
                    data = response.json()
                    response_data = data.get("Response", {})
                    status = response_data.get("ResponseStatus", 0)
                    
                    if status == 1:
                        results = response_data.get("Results", [])
                        total_flights = sum(len(group) for group in results)
                        print(f"✅ TBO API returned {total_flights} flights!")
                        
                        if results and results[0]:
                            sample_flight = results[0][0]
                            airline_info = sample_flight.get('Segments', [{}])[0].get('Airline', {})
                            fare_info = sample_flight.get('Fare', {})
                            
                            print(f"   Sample: {airline_info.get('AirlineName')} {airline_info.get('FlightNumber')}")
                            print(f"   Price: {fare_info.get('Currency')} {fare_info.get('PublishedFare')}")
                            
                        return True
                    else:
                        error = response_data.get("Error", {})
                        print(f"❌ TBO search failed: {error.get('ErrorMessage', 'Unknown error')}")
                        return False
                else:
                    print(f"❌ HTTP {response.status_code}: {response.text[:200]}")
                    return False
                    
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return False

    async def test_backend_flight_search(self):
        """Test backend flight search integration"""
        print(f"\n🔧 Testing Backend Flight Search Integration")
        
        # Use a date 7 days in the future
        future_date = datetime.now() + timedelta(days=7)
        departure_date = future_date.strftime("%Y-%m-%d")
        
        search_payload = {
            "origin": "Delhi",
            "destination": "Mumbai", 
            "departure_date": departure_date,
            "passengers": 1,
            "class_type": "economy"
        }
        
        print(f"Backend search: {search_payload}")
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.backend_url}/api/flights/search",
                    json=search_payload,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    flights = data.get("flights", [])
                    
                    print(f"✅ Backend returned {len(flights)} flights")
                    
                    # Check if we're getting real TBO data
                    if flights:
                        first_flight = flights[0]
                        
                        # Look for TBO-specific fields
                        tbo_indicators = []
                        if "validation_key" in first_flight:
                            tbo_indicators.append("validation_key")
                        if "fare_basis_code" in first_flight:
                            tbo_indicators.append("fare_basis_code")
                        if first_flight.get("data_source") != "mock":
                            tbo_indicators.append("non_mock_source")
                        
                        if tbo_indicators:
                            print(f"✅ Real TBO data detected! Indicators: {tbo_indicators}")
                            print(f"   Flight: {first_flight.get('airline')} {first_flight.get('flight_number')}")
                            print(f"   Price: {first_flight.get('currency', 'INR')} {first_flight.get('base_price')}")
                            return True
                        else:
                            print(f"❌ Still using mock data")
                            print(f"   Sample flight: {first_flight.get('airline')} (source: {first_flight.get('data_source', 'unknown')})")
                            return False
                    else:
                        print(f"❌ No flights returned")
                        return False
                else:
                    print(f"❌ Backend HTTP {response.status_code}: {response.text[:200]}")
                    return False
                    
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return False

    async def run_comprehensive_test(self):
        """Run comprehensive TBO integration test"""
        print("🚀 TBO FLIGHT API FINAL INTEGRATION TEST")
        print("=" * 60)
        print("Testing updated TBO integration with:")
        print("1. Corrected authentication endpoint and format")
        print("2. Corrected flight search endpoint")
        print("3. Corrected time format")
        print("4. Backend integration verification")
        print("=" * 60)
        
        # Test 1: TBO Authentication
        token = await self.test_tbo_authentication()
        if not token:
            print("\n❌ FINAL RESULT: TBO Authentication Failed")
            return
            
        # Test 2: TBO Flight Search (Direct)
        tbo_search_success = await self.test_tbo_flight_search_direct(token)
        
        # Test 3: Backend Integration
        backend_success = await self.test_backend_flight_search()
        
        # Final Assessment
        print("\n" + "=" * 60)
        print("📊 FINAL INTEGRATION TEST RESULTS")
        print("=" * 60)
        
        print(f"✅ TBO Authentication: {'SUCCESS' if token else 'FAILED'}")
        print(f"✅ TBO Flight Search (Direct): {'SUCCESS' if tbo_search_success else 'FAILED'}")
        print(f"✅ Backend Integration: {'SUCCESS' if backend_success else 'FAILED'}")
        
        if token and tbo_search_success and backend_success:
            print("\n🎉 TBO INTEGRATION FULLY WORKING!")
            print("✅ All review request requirements met:")
            print("   - Authentication with new endpoint ✅")
            print("   - Correct request/response format ✅") 
            print("   - Flight search Delhi→Mumbai ✅")
            print("   - Real TBO data (not mock) ✅")
            print("   - No integration errors ✅")
        elif token and tbo_search_success:
            print("\n⚠️ TBO API WORKING, BACKEND INTEGRATION NEEDS FIXING")
            print("✅ TBO API authentication and search working")
            print("❌ Backend still returning mock data")
            print("🔧 Backend configuration needs adjustment")
        elif token:
            print("\n⚠️ TBO AUTHENTICATION WORKING, SEARCH ISSUES")
            print("✅ TBO authentication successful")
            print("❌ TBO flight search not returning results")
            print("🔧 May need different routes or dates")
        else:
            print("\n❌ TBO INTEGRATION FAILED")
            print("❌ Authentication issues prevent further testing")

async def main():
    """Main test execution"""
    tester = TBOFinalIntegrationTester()
    await tester.run_comprehensive_test()

if __name__ == "__main__":
    asyncio.run(main())