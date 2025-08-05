#!/usr/bin/env python3
"""
Live Chatbot Testing Suite for TourSmile AI Travel Platform
Specifically tests OpenAI API integration and chatbot functionality on the live website
"""

import requests
import json
import time
import os
from datetime import datetime

# Load backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("ERROR: Could not find REACT_APP_BACKEND_URL in frontend/.env")
    exit(1)

API_BASE = f"{BACKEND_URL}/api"
print(f"🌐 Testing LIVE chatbot at: {API_BASE}")
print(f"🎯 Target website: https://smartrip.emergent.host/")

class LiveChatbotTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'TourSmile-ChatBot-Tester/1.0'
        })
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': [],
            'session_id': None
        }

    def log_result(self, test_name, success, message="", response_data=None, error_details=None):
        """Log test result with detailed error information"""
        self.results['total_tests'] += 1
        if success:
            self.results['passed'] += 1
            print(f"✅ {test_name}: {message}")
        else:
            self.results['failed'] += 1
            error_msg = f"{test_name}: {message}"
            if error_details:
                error_msg += f" | Details: {error_details}"
            self.results['errors'].append(error_msg)
            print(f"❌ {test_name}: {message}")
            if error_details:
                print(f"   🔍 Error Details: {error_details}")
        
        if response_data:
            print(f"📄 Response Data:")
            if isinstance(response_data, dict) and 'response' in response_data:
                # Truncate long AI responses for readability
                response_preview = response_data['response'][:200] + "..." if len(response_data['response']) > 200 else response_data['response']
                print(f"   Session ID: {response_data.get('session_id', 'N/A')}")
                print(f"   AI Response: {response_preview}")
            else:
                print(json.dumps(response_data, indent=2))
            print("-" * 80)

    def test_api_connectivity(self):
        """Test basic API connectivity to live deployment"""
        print("\n🔌 TESTING API CONNECTIVITY")
        print("=" * 60)
        try:
            response = self.session.get(f"{API_BASE}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "TourSmile" in data.get("message", ""):
                    self.log_result("API Connectivity", True, "Live API is responding correctly", data)
                    return True
                else:
                    self.log_result("API Connectivity", False, f"Unexpected API response", data)
            else:
                self.log_result("API Connectivity", False, 
                              f"HTTP {response.status_code}", 
                              error_details=response.text[:200])
        except requests.exceptions.Timeout:
            self.log_result("API Connectivity", False, "Connection timeout (>10s)")
        except requests.exceptions.ConnectionError as e:
            self.log_result("API Connectivity", False, "Connection failed", error_details=str(e))
        except Exception as e:
            self.log_result("API Connectivity", False, "Unexpected error", error_details=str(e))
        return False

    def test_openai_api_key_configuration(self):
        """Test if OpenAI API key is properly configured"""
        print("\n🔑 TESTING OPENAI API KEY CONFIGURATION")
        print("=" * 60)
        try:
            # Send a simple test message to check OpenAI integration
            payload = {
                "message": "Hello",
                "session_id": None
            }
            
            response = self.session.post(f"{API_BASE}/chat", json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "response" in data and "session_id" in data:
                    # Check if we got a meaningful response (not just fallback)
                    ai_response = data["response"]
                    if "trouble processing" in ai_response.lower() or "try again" in ai_response.lower():
                        self.log_result("OpenAI API Configuration", False, 
                                      "OpenAI API key issue - getting fallback response", 
                                      data, 
                                      "API key may be invalid, expired, or quota exceeded")
                    else:
                        self.log_result("OpenAI API Configuration", True, 
                                      "OpenAI API key working correctly", 
                                      data)
                        self.results['session_id'] = data['session_id']
                        return True
                else:
                    self.log_result("OpenAI API Configuration", False, 
                                  "Invalid response structure", 
                                  data)
            elif response.status_code == 401:
                self.log_result("OpenAI API Configuration", False, 
                              "Authentication error - Invalid API key", 
                              error_details="OpenAI API key is invalid or missing")
            elif response.status_code == 429:
                self.log_result("OpenAI API Configuration", False, 
                              "Rate limit exceeded - API quota issue", 
                              error_details="OpenAI API quota exceeded or billing issue")
            elif response.status_code == 500:
                self.log_result("OpenAI API Configuration", False, 
                              "Server error - Backend issue", 
                              error_details=response.text[:200])
            else:
                self.log_result("OpenAI API Configuration", False, 
                              f"HTTP {response.status_code}", 
                              error_details=response.text[:200])
                
        except requests.exceptions.Timeout:
            self.log_result("OpenAI API Configuration", False, 
                          "Request timeout (>30s) - OpenAI API may be slow")
        except Exception as e:
            self.log_result("OpenAI API Configuration", False, 
                          "Unexpected error", 
                          error_details=str(e))
        return False

    def test_specific_travel_prompts(self):
        """Test specific travel-related prompts as requested by user"""
        print("\n🧳 TESTING SPECIFIC TRAVEL PROMPTS")
        print("=" * 60)
        
        test_prompts = [
            "Hello, I need help planning a trip to Dubai",
            "What are the best hotels in Mumbai?", 
            "Can you suggest a 3-day itinerary for Goa?"
        ]
        
        session_id = self.results.get('session_id')
        prompt_results = []
        
        for i, prompt in enumerate(test_prompts, 1):
            print(f"\n📝 Testing Prompt {i}: '{prompt}'")
            try:
                payload = {
                    "message": prompt,
                    "session_id": session_id
                }
                
                response = self.session.post(f"{API_BASE}/chat", json=payload, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    if "response" in data and "session_id" in data:
                        ai_response = data["response"]
                        session_id = data["session_id"]  # Update session for next prompt
                        
                        # Check response quality
                        if len(ai_response) > 50 and not ("trouble processing" in ai_response.lower()):
                            self.log_result(f"Travel Prompt {i}", True, 
                                          f"Got meaningful response ({len(ai_response)} chars)", 
                                          data)
                            prompt_results.append(True)
                        else:
                            self.log_result(f"Travel Prompt {i}", False, 
                                          "Response too short or fallback message", 
                                          data)
                            prompt_results.append(False)
                    else:
                        self.log_result(f"Travel Prompt {i}", False, 
                                      "Invalid response structure", 
                                      data)
                        prompt_results.append(False)
                else:
                    self.log_result(f"Travel Prompt {i}", False, 
                                  f"HTTP {response.status_code}", 
                                  error_details=response.text[:200])
                    prompt_results.append(False)
                    
            except Exception as e:
                self.log_result(f"Travel Prompt {i}", False, 
                              "Request failed", 
                              error_details=str(e))
                prompt_results.append(False)
            
            time.sleep(2)  # Pause between prompts
        
        # Summary of prompt testing
        successful_prompts = sum(prompt_results)
        print(f"\n📊 Prompt Testing Summary: {successful_prompts}/{len(test_prompts)} prompts successful")
        return successful_prompts == len(test_prompts)

    def test_session_handling(self):
        """Test session ID tracking and persistence"""
        print("\n🔄 TESTING SESSION HANDLING")
        print("=" * 60)
        
        try:
            # First message without session_id
            payload1 = {
                "message": "Start new conversation",
                "session_id": None
            }
            
            response1 = self.session.post(f"{API_BASE}/chat", json=payload1, timeout=20)
            
            if response1.status_code == 200:
                data1 = response1.json()
                session_id = data1.get('session_id')
                
                if session_id:
                    # Second message with same session_id
                    payload2 = {
                        "message": "Continue conversation",
                        "session_id": session_id
                    }
                    
                    response2 = self.session.post(f"{API_BASE}/chat", json=payload2, timeout=20)
                    
                    if response2.status_code == 200:
                        data2 = response2.json()
                        session_id2 = data2.get('session_id')
                        
                        if session_id == session_id2:
                            self.log_result("Session Handling", True, 
                                          f"Session ID persistent: {session_id}", 
                                          {"session_consistency": True})
                            return True
                        else:
                            self.log_result("Session Handling", False, 
                                          "Session ID not consistent between requests")
                    else:
                        self.log_result("Session Handling", False, 
                                      f"Second request failed: HTTP {response2.status_code}")
                else:
                    self.log_result("Session Handling", False, 
                                  "No session_id returned in response")
            else:
                self.log_result("Session Handling", False, 
                              f"First request failed: HTTP {response1.status_code}")
                
        except Exception as e:
            self.log_result("Session Handling", False, 
                          "Session test failed", 
                          error_details=str(e))
        return False

    def test_response_format(self):
        """Test that chat responses have correct JSON structure"""
        print("\n📋 TESTING RESPONSE FORMAT")
        print("=" * 60)
        
        try:
            payload = {
                "message": "Test response format",
                "session_id": None
            }
            
            response = self.session.post(f"{API_BASE}/chat", json=payload, timeout=20)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    
                    # Check required fields
                    required_fields = ['response', 'session_id']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        # Check data types
                        if (isinstance(data['response'], str) and 
                            isinstance(data['session_id'], str) and 
                            len(data['response']) > 0 and 
                            len(data['session_id']) > 0):
                            
                            self.log_result("Response Format", True, 
                                          "JSON structure is correct", 
                                          {"format_check": "passed", "fields": list(data.keys())})
                            return True
                        else:
                            self.log_result("Response Format", False, 
                                          "Field types or values incorrect", 
                                          data)
                    else:
                        self.log_result("Response Format", False, 
                                      f"Missing required fields: {missing_fields}", 
                                      data)
                        
                except json.JSONDecodeError:
                    self.log_result("Response Format", False, 
                                  "Response is not valid JSON", 
                                  error_details=response.text[:200])
            else:
                self.log_result("Response Format", False, 
                              f"HTTP {response.status_code}", 
                              error_details=response.text[:200])
                
        except Exception as e:
            self.log_result("Response Format", False, 
                          "Format test failed", 
                          error_details=str(e))
        return False

    def run_comprehensive_chatbot_test(self):
        """Run comprehensive chatbot testing for live deployment"""
        print("=" * 80)
        print("🤖 LIVE CHATBOT COMPREHENSIVE TESTING")
        print("🌐 Testing OpenAI API integration on live TourSmile website")
        print("=" * 80)
        
        # Test sequence
        tests = [
            ("API Connectivity", self.test_api_connectivity),
            ("OpenAI API Configuration", self.test_openai_api_key_configuration),
            ("Specific Travel Prompts", self.test_specific_travel_prompts),
            ("Session Handling", self.test_session_handling),
            ("Response Format", self.test_response_format)
        ]
        
        for test_name, test_func in tests:
            print(f"\n⏳ Running {test_name}...")
            test_func()
            time.sleep(1)
        
        # Final summary
        print("\n" + "=" * 80)
        print("📊 LIVE CHATBOT TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        
        if self.results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        success_rate = (self.results['passed'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")
        
        # Diagnosis
        print("\n🔍 DIAGNOSIS:")
        if success_rate >= 80:
            print("✅ Chatbot is working correctly on live deployment")
        elif self.results['passed'] == 0:
            print("❌ CRITICAL: Chatbot is completely non-functional")
            print("   Possible causes: API connectivity, server down, configuration issues")
        else:
            print("⚠️  Chatbot has partial functionality issues")
            if any("API key" in error for error in self.results['errors']):
                print("   🔑 OpenAI API key configuration issue detected")
            if any("timeout" in error.lower() for error in self.results['errors']):
                print("   ⏱️  Network connectivity or performance issues detected")
            if any("quota" in error.lower() for error in self.results['errors']):
                print("   💳 OpenAI API quota/billing issue detected")
        
        return self.results

if __name__ == "__main__":
    tester = LiveChatbotTester()
    results = tester.run_comprehensive_chatbot_test()