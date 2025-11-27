#!/usr/bin/env python3
"""
TBO Flight API Endpoint Discovery Test
Testing different TBO flight search endpoints to find the correct one.
"""

import asyncio
import httpx
import json
from datetime import datetime

class TBOEndpointDiscoveryTester:
    def __init__(self):
        self.tbo_auth_url = "https://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate"
        self.tbo_credentials = {
            "ClientId": "ApiIntegrationNew",
            "UserName": "Smile", 
            "Password": "Smile@123",
            "EndUserIp": "192.168.11.120"
        }
        self.token = None
        
    async def get_auth_token(self):
        """Get TBO authentication token"""
        if self.token:
            return self.token
            
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

    async def test_search_endpoint(self, endpoint_url: str, endpoint_name: str):
        """Test a specific search endpoint"""
        print(f"\n🔍 Testing {endpoint_name}")
        print(f"URL: {endpoint_url}")
        
        # Sample search payload
        search_payload = {
            "EndUserIp": "192.168.1.1",
            "TokenId": self.token,
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
                    "PreferredDepartureTime": "2025-01-20T00:00:00",
                    "PreferredArrivalTime": "2025-01-20T23:59:59"
                }
            ]
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    endpoint_url,
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
                        print(f"Response keys: {list(data.keys())}")
                        
                        # Check if it looks like a valid flight search response
                        if "Response" in data or "Results" in data or "flights" in data:
                            print(f"🎉 FOUND VALID FLIGHT SEARCH ENDPOINT!")
                            print(f"Response sample: {json.dumps(data, indent=2)[:500]}...")
                            return True
                        else:
                            print(f"⚠️ Response doesn't look like flight search data")
                            print(f"Response: {json.dumps(data, indent=2)[:300]}...")
                            
                    except json.JSONDecodeError:
                        print(f"❌ Invalid JSON response")
                        print(f"Response text: {response.text[:200]}...")
                        
                elif response.status_code == 404:
                    print(f"❌ 404 Not Found - Endpoint doesn't exist")
                elif response.status_code == 401:
                    print(f"❌ 401 Unauthorized - Authentication issue")
                elif response.status_code == 500:
                    print(f"❌ 500 Server Error")
                    print(f"Response: {response.text[:200]}...")
                else:
                    print(f"❌ HTTP {response.status_code}")
                    print(f"Response: {response.text[:200]}...")
                    
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            
        return False

    async def discover_endpoints(self):
        """Test multiple possible TBO flight search endpoints"""
        print("🚀 TBO Flight API Endpoint Discovery")
        print("=" * 60)
        
        # Get authentication token first
        token = await self.get_auth_token()
        if not token:
            print("❌ Cannot proceed without authentication token")
            return
            
        # List of possible endpoints to test
        base_urls = [
            "https://Sharedapi.tektravels.com",
            "https://api.tektravels.com",
            "https://Tboairdemo.techmaster.in/API/API/v1"
        ]
        
        endpoint_paths = [
            "/SharedData.svc/rest/Search",
            "/SharedData.svc/rest/FlightSearch", 
            "/BookingEngineService_Air/AirService.svc/rest/Search",
            "/Api/TP_Flight/FlightSearch",
            "/Flight/Search",
            "/AirService.svc/rest/Search",
            "/rest/Search",
            "/Search"
        ]
        
        successful_endpoints = []
        
        for base_url in base_urls:
            print(f"\n🌐 Testing base URL: {base_url}")
            
            for path in endpoint_paths:
                endpoint_url = f"{base_url}{path}"
                endpoint_name = f"{base_url.split('//')[1].split('.')[0]}{path}"
                
                success = await self.test_search_endpoint(endpoint_url, endpoint_name)
                if success:
                    successful_endpoints.append(endpoint_url)
                    
                # Small delay between requests
                await asyncio.sleep(0.5)
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 ENDPOINT DISCOVERY SUMMARY")
        print("=" * 60)
        
        if successful_endpoints:
            print(f"✅ Found {len(successful_endpoints)} working endpoint(s):")
            for endpoint in successful_endpoints:
                print(f"   - {endpoint}")
        else:
            print("❌ No working flight search endpoints found")
            print("\nPossible reasons:")
            print("1. Incorrect endpoint URLs")
            print("2. Different authentication method required")
            print("3. Different request payload format needed")
            print("4. Service temporarily unavailable")
            
        print("\n🔧 Next steps:")
        print("1. Contact TBO support for correct endpoint documentation")
        print("2. Verify API access permissions")
        print("3. Check if different base URL or authentication is needed")

async def main():
    """Main test execution"""
    tester = TBOEndpointDiscoveryTester()
    await tester.discover_endpoints()

if __name__ == "__main__":
    asyncio.run(main())