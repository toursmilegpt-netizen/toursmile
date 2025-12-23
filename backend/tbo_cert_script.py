import asyncio
import httpx
import json
import os
import uuid
from datetime import datetime, timedelta

# TBO Certification Config
AUTH_URL = "https://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate"
BASE_URL = "https://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest"
CLIENT_ID = "ApiIntegrationNew"
USERNAME = "Smile"
PASSWORD = "Smile@123"
IP_ADDRESS = "192.168.11.120" # As whitelisted

# Test Cases - Simple One Way
TEST_CASES = [
    {"origin": "HYD", "destination": "CCU", "adults": 1, "date_offset": 30, "case_id": "TC01"},
    {"origin": "JAI", "destination": "HYD", "adults": 2, "date_offset": 31, "case_id": "TC02"},
    {"origin": "HYD", "destination": "JAI", "adults": 1, "date_offset": 32, "case_id": "TC03"},
    {"origin": "HYD", "destination": "BOM", "adults": 1, "date_offset": 33, "case_id": "TC04"},
    {"origin": "HYD", "destination": "MAA", "adults": 2, "date_offset": 34, "case_id": "TC05"}
]

async def run_certification_tests():
    print("🚀 Starting TBO Certification Execution...")
    
    # 1. Authenticate
    print("\n🔐 1. Authenticating...")
    token = await authenticate()
    if not token:
        print("❌ Authentication Failed. Aborting.")
        return

    results = []

    # 2. Execute Test Cases
    async with httpx.AsyncClient(timeout=60.0) as client:
        for case in TEST_CASES:
            print(f"\n🧪 Running Case {case['case_id']}: {case['origin']} -> {case['destination']} ({case['adults']} Pax)")
            
            # Step A: Search
            search_res, result_index, trace_id = await search_flight(client, token, case)
            if not result_index:
                print(f"   ⚠️ No flights found for {case['case_id']}. Skipping.")
                continue
            
            # Step B: Fare Quote
            quote_res = await fare_quote(client, token, result_index, trace_id)
            
            # Step C: SSR (Optional but good for logs)
            ssr_res = await get_ssr(client, token, result_index, trace_id)
            
            # Save Logs
            log_data = {
                "TestCase": case['case_id'],
                "Route": f"{case['origin']}-{case['destination']}",
                "Date": search_res['Request']['Segments'][0]['PreferredDepartureTime'],
                "Logs": {
                    "1_Search_Request": search_res['Request'],
                    "1_Search_Response": search_res['Response'],
                    "2_FareQuote_Request": quote_res['Request'],
                    "2_FareQuote_Response": quote_res['Response'],
                    "3_SSR_Request": ssr_res['Request'] if ssr_res else None,
                    "3_SSR_Response": ssr_res['Response'] if ssr_res else None
                }
            }
            results.append(log_data)
            print(f"   ✅ Case {case['case_id']} Completed.")

    # 3. Export to JSON for Submission
    with open("tbo_certification_logs.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print("\n📄 Logs saved to 'tbo_certification_logs.json'. Ready for TBO submission.")

async def authenticate():
    payload = {
        "ClientId": CLIENT_ID,
        "UserName": USERNAME,
        "Password": PASSWORD,
        "EndUserIp": IP_ADDRESS
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(AUTH_URL, json=payload)
        if resp.status_code == 200 and resp.json().get("Status") == 1:
            return resp.json().get("TokenId")
    return None

async def search_flight(client, token, case):
    dep_date = (datetime.now() + timedelta(days=case['date_offset'])).strftime("%Y-%m-%dT00:00:00")
    payload = {
        "EndUserIp": IP_ADDRESS,
        "TokenId": token,
        "AdultCount": case['adults'],
        "ChildCount": 0, "InfantCount": 0,
        "DirectFlight": "false", "OneStopFlight": "false",
        "JourneyType": "1", # One Way
        "PreferredAirlines": None,
        "Segments": [{
            "Origin": case['origin'],
            "Destination": case['destination'],
            "FlightCabinClass": "1",
            "PreferredDepartureTime": dep_date,
            "PreferredArrivalTime": dep_date
        }],
        "Sources": None
    }
    
    try:
        resp = await client.post(f"{BASE_URL}/Search", json=payload)
        if resp.status_code == 200:
            data = resp.json()
            if data['Response']['Error']['ErrorCode'] == 0:
                # Pick first result
                first_flight = data['Response']['Results'][0][0]
                return {"Request": payload, "Response": data}, first_flight['ResultIndex'], data['Response']['TraceId']
    except Exception as e:
        print(f"   ❌ Search Error: {e}")
    
    return {"Request": payload, "Response": resp.json() if resp.status_code == 200 else "Error"}, None, None

async def fare_quote(client, token, result_index, trace_id):
    payload = {
        "EndUserIp": IP_ADDRESS,
        "TokenId": token,
        "TraceId": trace_id,
        "ResultIndex": result_index
    }
    try:
        resp = await client.post(f"{BASE_URL}/FareQuote", json=payload)
        return {"Request": payload, "Response": resp.json()}
    except Exception:
        return {"Request": payload, "Response": "Error"}

async def get_ssr(client, token, result_index, trace_id):
    payload = {
        "EndUserIp": IP_ADDRESS,
        "TokenId": token,
        "TraceId": trace_id,
        "ResultIndex": result_index
    }
    try:
        resp = await client.post(f"{BASE_URL}/SSR", json=payload)
        return {"Request": payload, "Response": resp.json()}
    except Exception:
        return None

if __name__ == "__main__":
    asyncio.run(run_certification_tests())
