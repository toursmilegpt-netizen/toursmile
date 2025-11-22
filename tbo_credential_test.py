#!/usr/bin/env python3
"""
TBO API CREDENTIAL TESTING
Testing different TBO API credentials and authentication formats based on web search results.
"""

import requests
import json
import time

# TBO API Configuration
TBO_AUTH_URL = "https://Tboairdemo.techmaster.in/API/API/v1/Authenticate/ValidateAgency"

def test_credentials(username, password, test_name):
    """Test TBO authentication with given credentials"""
    print(f"\n🧪 Testing {test_name}")
    print(f"   Username: {username}")
    print(f"   Password: {password}")
    
    auth_payload = {
        "BookingMode": "API",
        "UserName": username,
        "Password": password,
        "IPAddress": "192.168.1.1"
    }
    
    try:
        start_time = time.time()
        response = requests.post(TBO_AUTH_URL, 
                               json=auth_payload, 
                               headers={"Content-Type": "application/json"},
                               timeout=30)
        response_time = time.time() - start_time
        
        print(f"   Status: {response.status_code}")
        
        try:
            response_data = response.json()
            print(f"   Response: {json.dumps(response_data, indent=2)}")
            
            if response_data.get("IsSuccess") == True:
                token_id = response_data.get("TokenId")
                print(f"   ✅ SUCCESS! TokenId: {token_id}")
                return True, token_id
            else:
                errors = response_data.get("Errors", [])
                error_msg = errors[0].get("UserMessage", "Unknown error") if errors else "Unknown error"
                print(f"   ❌ FAILED: {error_msg}")
                return False, None
                
        except:
            print(f"   ❌ FAILED: Invalid JSON response - {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ FAILED: {str(e)}")
        return False, None

def main():
    print("🚀 TBO API CREDENTIAL TESTING")
    print("=" * 60)
    
    # Test different credential combinations
    credential_tests = [
        ("Smile", "Smile@123", "Original SMILE HOLIDAYS Credentials"),
        ("testuser", "testpwd", "Demo Credentials from Web Search"),
        ("demo", "demo", "Common Demo Credentials"),
        ("test", "test", "Simple Test Credentials"),
        ("smile", "smile@123", "Lowercase SMILE Credentials"),
        ("SMILE", "SMILE@123", "Uppercase SMILE Credentials"),
        ("SmileHolidays", "Smile@123", "Full Agency Name"),
        ("Smile_Holidays", "Smile@123", "Agency Name with Underscore"),
    ]
    
    successful_credentials = []
    
    for username, password, test_name in credential_tests:
        success, token = test_credentials(username, password, test_name)
        if success:
            successful_credentials.append((username, password, token))
    
    print("\n" + "=" * 60)
    print("🎯 CREDENTIAL TEST SUMMARY")
    print("=" * 60)
    
    if successful_credentials:
        print("✅ SUCCESSFUL CREDENTIALS FOUND:")
        for username, password, token in successful_credentials:
            print(f"   Username: {username}")
            print(f"   Password: {password}")
            print(f"   TokenId: {token[:20]}...")
            print()
    else:
        print("❌ NO SUCCESSFUL CREDENTIALS FOUND")
        print("   All tested credential combinations failed")
        print("   Possible issues:")
        print("   - TBO demo environment may be down")
        print("   - Credentials may need to be obtained from TBO support")
        print("   - API endpoint may be incorrect")
        print("   - Account may need activation")
    
    return len(successful_credentials) > 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)