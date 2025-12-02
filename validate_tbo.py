import asyncio
import httpx
import json

async def validate_tbo():
    url = "https://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate"
    payload = {
        "ClientId": "ApiIntegrationNew",
        "UserName": "Smile",
        "Password": "Smile@123",
        "EndUserIp": "192.168.11.120"
    }
    
    print(f"Connecting to: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            print(f"Status Code: {response.status_code}")
            print(f"Response Body: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("Status") == 1: # 1 = Success
                    print("\n✅ SUCCESS! Credentials are VALID.")
                    print(f"Token ID: {data.get('TokenId')}")
                    print(f"Member: {data.get('Member', {}).get('FirstName')} {data.get('Member', {}).get('LastName')}")
                else:
                    print("\n❌ FAILED: API returned error status.")
                    print(f"Error: {data.get('Error', {}).get('ErrorMessage')}")
            else:
                print("\n❌ FAILED: HTTP Error.")

    except Exception as e:
        print(f"\n❌ EXCEPTION: {str(e)}")

if __name__ == "__main__":
    asyncio.run(validate_tbo())
