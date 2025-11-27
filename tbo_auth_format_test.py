#!/usr/bin/env python3
"""
TBO AUTHENTICATION FORMAT DISCOVERY TEST
Based on the test results, we need to find the correct request format for TBO API.

The API is responding with:
1. "Please enter valid booking mode" - suggests BookingMode field is required
2. "Please enter valid Username or Password" - suggests different field names

Let's test various combinations to find the working format.
"""

import requests
import json
import time

# TBO API Configuration
TBO_USERNAME = "Smile"
TBO_PASSWORD = "Smile@123"
TBO_CLIENT_ID = "ApiIntegrationNew"
TBO_AUTH_URL = "https://Tboairdemo.techmaster.in/API/API/v1/Authenticate/ValidateAgency"

def test_auth_format(payload, description):
    """Test a specific authentication format"""
    try:
        print(f"\n🧪 Testing: {description}")
        print(f"📦 Payload: {json.dumps(payload, indent=2)}")
        
        start_time = time.time()
        response = requests.post(TBO_AUTH_URL, 
                               json=payload, 
                               headers={"Content-Type": "application/json"},
                               timeout=30)
        response_time = time.time() - start_time
        
        print(f"📊 Status: {response.status_code}")
        
        try:
            response_data = response.json()
            print(f"📊 Response: {json.dumps(response_data, indent=2)}")
            
            # Check for success
            if response_data.get("IsSuccess") == True and response_data.get("TokenId"):
                print(f"✅ SUCCESS! TokenId: {response_data.get('TokenId')}")
                return True, response_data
            else:
                errors = response_data.get("Errors", [])
                if errors:
                    error_msg = errors[0].get("UserMessage", "Unknown error")
                    print(f"❌ Error: {error_msg}")
                else:
                    print(f"❌ Failed: IsSuccess={response_data.get('IsSuccess')}")
                return False, response_data
                
        except:
            print(f"📊 Raw Response: {response.text}")
            return False, {"raw_text": response.text}
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False, {"error": str(e)}

def main():
    print("🚀 TBO AUTHENTICATION FORMAT DISCOVERY TEST")
    print("=" * 80)
    
    # Test various authentication formats based on TBO documentation patterns
    test_formats = [
        {
            "description": "Standard Format with BookingMode",
            "payload": {
                "BookingMode": "API",
                "UserName": TBO_USERNAME,
                "Password": TBO_PASSWORD,
                "EndUserIp": "192.168.1.1"
            }
        },
        {
            "description": "Standard Format with ClientId and BookingMode",
            "payload": {
                "ClientId": TBO_CLIENT_ID,
                "BookingMode": "API",
                "UserName": TBO_USERNAME,
                "Password": TBO_PASSWORD,
                "EndUserIp": "192.168.1.1"
            }
        },
        {
            "description": "Alternative Format - AgencyId instead of ClientId",
            "payload": {
                "AgencyId": TBO_CLIENT_ID,
                "BookingMode": "API",
                "UserName": TBO_USERNAME,
                "Password": TBO_PASSWORD,
                "EndUserIp": "192.168.1.1"
            }
        },
        {
            "description": "B2B Format",
            "payload": {
                "BookingMode": "B2B",
                "UserName": TBO_USERNAME,
                "Password": TBO_PASSWORD,
                "EndUserIp": "192.168.1.1"
            }
        },
        {
            "description": "XML Format",
            "payload": {
                "BookingMode": "XML",
                "UserName": TBO_USERNAME,
                "Password": TBO_PASSWORD,
                "EndUserIp": "192.168.1.1"
            }
        },
        {
            "description": "Live Format",
            "payload": {
                "BookingMode": "Live",
                "UserName": TBO_USERNAME,
                "Password": TBO_PASSWORD,
                "EndUserIp": "192.168.1.1"
            }
        },
        {
            "description": "Test Format",
            "payload": {
                "BookingMode": "Test",
                "UserName": TBO_USERNAME,
                "Password": TBO_PASSWORD,
                "EndUserIp": "192.168.1.1"
            }
        },
        {
            "description": "Demo Format",
            "payload": {
                "BookingMode": "Demo",
                "UserName": TBO_USERNAME,
                "Password": TBO_PASSWORD,
                "EndUserIp": "192.168.1.1"
            }
        },
        {
            "description": "Alternative Field Names - Username/Password",
            "payload": {
                "BookingMode": "API",
                "Username": TBO_USERNAME,
                "Password": TBO_PASSWORD,
                "EndUserIp": "192.168.1.1"
            }
        },
        {
            "description": "Alternative Field Names - User/Pass",
            "payload": {
                "BookingMode": "API",
                "User": TBO_USERNAME,
                "Pass": TBO_PASSWORD,
                "EndUserIp": "192.168.1.1"
            }
        },
        {
            "description": "Alternative IP Field - IPAddress",
            "payload": {
                "BookingMode": "API",
                "UserName": TBO_USERNAME,
                "Password": TBO_PASSWORD,
                "IPAddress": "192.168.1.1"
            }
        },
        {
            "description": "Alternative IP Field - ClientIP",
            "payload": {
                "BookingMode": "API",
                "UserName": TBO_USERNAME,
                "Password": TBO_PASSWORD,
                "ClientIP": "192.168.1.1"
            }
        },
        {
            "description": "Complete Format with All Fields",
            "payload": {
                "ClientId": TBO_CLIENT_ID,
                "BookingMode": "API",
                "UserName": TBO_USERNAME,
                "Password": TBO_PASSWORD,
                "EndUserIp": "192.168.1.1",
                "IPAddress": "192.168.1.1"
            }
        }
    ]
    
    successful_formats = []
    
    for test_format in test_formats:
        success, response_data = test_auth_format(
            test_format["payload"], 
            test_format["description"]
        )
        
        if success:
            successful_formats.append({
                "description": test_format["description"],
                "payload": test_format["payload"],
                "response": response_data
            })
        
        time.sleep(1)  # Rate limiting
    
    # Summary
    print("\n" + "=" * 80)
    print("🎯 AUTHENTICATION FORMAT DISCOVERY SUMMARY")
    print("=" * 80)
    
    if successful_formats:
        print(f"✅ Found {len(successful_formats)} working authentication format(s):")
        for i, format_info in enumerate(successful_formats, 1):
            print(f"\n{i}. {format_info['description']}")
            print(f"   Payload: {json.dumps(format_info['payload'], indent=6)}")
            print(f"   TokenId: {format_info['response'].get('TokenId', 'Not found')}")
    else:
        print("❌ No working authentication formats found")
        print("\nPossible issues:")
        print("1. Credentials may be invalid")
        print("2. Account may be suspended or expired")
        print("3. IP address may need to be whitelisted")
        print("4. TBO staging environment may be down")
        print("5. Different authentication endpoint may be required")
    
    return len(successful_formats) > 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)