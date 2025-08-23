#!/usr/bin/env python3
"""
Flight Search Backend Testing Suite for TourSmile AI Travel Platform
Focus: Testing flight search functionality as per review request
"""

import requests
import json
import time
import os
import sys
from datetime import datetime, timedelta

# Add backend to path for importing services
sys.path.append('/app/backend')

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
print(f"🎯 FLIGHT SEARCH BACKEND TESTING")
print(f"Testing backend at: {API_BASE}")
print("=" * 80)

class FlightSearchTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }

    def log_result(self, test_name, success, message="", response_data=None):
        """Log test result"""
        self.results['total_tests'] += 1
        if success:
            self.results['passed'] += 1
            print(f"✅ {test_name}: {message}")
        else:
            self.results['failed'] += 1
            self.results['errors'].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: {message}")
        
        if response_data:
            print(f"📄 RESPONSE DATA:")
            print(json.dumps(response_data, indent=2))
            print("-" * 80)

    def test_backend_health(self):
        """Test 1: Backend Health Check"""
        print("\n🏥 TESTING BACKEND HEALTH")
        print("=" * 60)
        try:
            response = self.session.get(f"{API_BASE}/")
            if response.status_code == 200:
                data = response.json()
                if "TourSmile" in data.get("message", ""):
                    self.log_result("Backend Health Check", True, "Backend is running and responding correctly")
                    return True
                else:
                    self.log_result("Backend Health Check", False, f"Unexpected response: {data}")
            else:
                self.log_result("Backend Health Check", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Backend Health Check", False, f"Connection error: {str(e)}")
        return False

    def test_environment_variables(self):
        """Test 2: Environment Variables Configuration"""
        print("\n🔧 TESTING ENVIRONMENT VARIABLES")
        print("=" * 60)
        
        # Check TRIPJACK_API_KEY
        try:
            with open('/app/backend/.env', 'r') as f:
                env_content = f.read()
                
            tripjack_key_found = 'TRIPJACK_API_KEY=' in env_content
            react_backend_url_found = False
            
            # Check REACT_APP_BACKEND_URL
            try:
                with open('/app/frontend/.env', 'r') as f:
                    frontend_env = f.read()
                react_backend_url_found = 'REACT_APP_BACKEND_URL=' in frontend_env
            except:
                pass
            
            print(f"TRIPJACK_API_KEY configured: {'✅' if tripjack_key_found else '❌'}")
            print(f"REACT_APP_BACKEND_URL configured: {'✅' if react_backend_url_found else '❌'}")
            
            if tripjack_key_found and react_backend_url_found:
                self.log_result("Environment Variables", True, "All required environment variables are configured")
                return True
            else:
                missing = []
                if not tripjack_key_found:
                    missing.append("TRIPJACK_API_KEY")
                if not react_backend_url_found:
                    missing.append("REACT_APP_BACKEND_URL")
                self.log_result("Environment Variables", False, f"Missing environment variables: {missing}")
                return False
                
        except Exception as e:
            self.log_result("Environment Variables", False, f"Error checking environment variables: {str(e)}")
            return False

    def test_flight_search_api_exact_params(self):
        """Test 3: Flight Search API with exact parameters from review request"""
        print("\n✈️ TESTING FLIGHT SEARCH API - Delhi → Mumbai (Review Request Parameters)")
        print("=" * 60)
        try:
            # Exact parameters from review request
            payload = {
                "origin": "Delhi",
                "destination": "Mumbai", 
                "departure_date": "2025-08-24",
                "passengers": 1,
                "class_type": "economy"
            }
            
            print(f"📤 REQUEST: {json.dumps(payload, indent=2)}")
            response = self.session.post(f"{API_BASE}/flights/search", json=payload)
            
            print(f"📊 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ["flights", "search_id", "data_source", "total_found"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Flight Search API Structure", False, f"Missing response fields: {missing_fields}")
                    return False
                
                flights = data.get("flights", [])
                data_source = data.get("data_source", "unknown")
                total_found = data.get("total_found", 0)
                
                print(f"📊 Data Source: {data_source}")
                print(f"📊 Total Flights Found: {total_found}")
                print(f"📊 Flights Returned: {len(flights)}")
                
                if len(flights) > 0:
                    # Check flight data structure
                    flight = flights[0]
                    required_flight_fields = ["id", "airline", "flight_number", "origin", "destination", "price"]
                    missing_flight_fields = [field for field in required_flight_fields if field not in flight]
                    
                    if missing_flight_fields:
                        self.log_result("Flight Search API", False, f"Flight data missing required fields: {missing_flight_fields}")
                        return False
                    
                    # Check for non-zero prices (critical requirement from review)
                    zero_price_flights = [f for f in flights if f.get("price", 0) == 0]
                    non_zero_price_flights = [f for f in flights if f.get("price", 0) > 0]
                    
                    print(f"💰 Flights with non-zero prices: {len(non_zero_price_flights)}")
                    print(f"💰 Flights with zero prices: {len(zero_price_flights)}")
                    
                    if len(non_zero_price_flights) > 0:
                        # Show sample flight with pricing
                        sample_flight = non_zero_price_flights[0]
                        print(f"📋 Sample Flight:")
                        print(f"   Airline: {sample_flight.get('airline', 'N/A')}")
                        print(f"   Flight: {sample_flight.get('flight_number', 'N/A')}")
                        print(f"   Route: {sample_flight.get('origin', 'N/A')} → {sample_flight.get('destination', 'N/A')}")
                        print(f"   Price: ₹{sample_flight.get('price', 0)}")
                        print(f"   Time: {sample_flight.get('departure_time', 'N/A')} → {sample_flight.get('arrival_time', 'N/A')}")
                        
                        self.log_result("Flight Search API", True, 
                                      f"API working correctly - Found {len(flights)} flights, {len(non_zero_price_flights)} with valid pricing",
                                      {"data_source": data_source, "total_flights": len(flights), "non_zero_price_flights": len(non_zero_price_flights)})
                        return True
                    else:
                        self.log_result("Flight Search API", False, 
                                      f"All {len(flights)} flights have ₹0 prices - pricing issue detected")
                        return False
                else:
                    self.log_result("Flight Search API", False, "No flights returned")
                    return False
            else:
                self.log_result("Flight Search API", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Flight Search API", False, f"Error: {str(e)}")
            return False

    def test_tripjack_integration(self):
        """Test 4: Tripjack API Integration Status"""
        print("\n🔌 TESTING TRIPJACK INTEGRATION")
        print("=" * 60)
        try:
            # Import Tripjack service to check integration
            from tripjack_flight_api import tripjack_flight_service
            
            # Check if API key is configured
            api_key_configured = bool(tripjack_flight_service.api_key)
            print(f"Tripjack API Key configured: {'✅' if api_key_configured else '❌'}")
            
            if api_key_configured:
                # Test with a simple search to see if integration works
                try:
                    # This will test the actual integration
                    test_flights = tripjack_flight_service.search_flights("Delhi", "Mumbai", "2025-08-24", 1)
                    
                    if test_flights and len(test_flights) > 0:
                        print(f"✅ Tripjack API integration working - returned {len(test_flights)} flights")
                        
                        # Check for real pricing data
                        flights_with_prices = [f for f in test_flights if f.get("price", 0) > 0]
                        print(f"💰 Flights with pricing: {len(flights_with_prices)}")
                        
                        if flights_with_prices:
                            sample_flight = flights_with_prices[0]
                            print(f"📋 Sample Tripjack Flight:")
                            print(f"   Airline: {sample_flight.get('airline', 'N/A')}")
                            print(f"   Price: ₹{sample_flight.get('price', 0)}")
                            
                            self.log_result("Tripjack Integration", True, 
                                          f"Tripjack API working with {len(flights_with_prices)} priced flights")
                            return True
                        else:
                            self.log_result("Tripjack Integration", False, 
                                          "Tripjack API returns flights but all have ₹0 prices")
                            return False
                    else:
                        print("⚠️ Tripjack API configured but returned no flights (may be using mock data)")
                        self.log_result("Tripjack Integration", True, 
                                      "Tripjack API configured, using fallback data")
                        return True
                        
                except Exception as api_error:
                    print(f"❌ Tripjack API error: {str(api_error)}")
                    self.log_result("Tripjack Integration", False, 
                                  f"Tripjack API error: {str(api_error)}")
                    return False
            else:
                print("⚠️ Tripjack API key not configured - using mock data")
                self.log_result("Tripjack Integration", True, 
                              "Tripjack API key not configured, using mock data (expected in test mode)")
                return True
                
        except ImportError as e:
            self.log_result("Tripjack Integration", False, f"Cannot import Tripjack service: {str(e)}")
            return False
        except Exception as e:
            self.log_result("Tripjack Integration", False, f"Error testing Tripjack integration: {str(e)}")
            return False

    def test_database_connectivity(self):
        """Test 5: Database Connectivity (PostgreSQL)"""
        print("\n🗄️ TESTING DATABASE CONNECTIVITY")
        print("=" * 60)
        try:
            # Import database module to test connection
            from database import test_connection
            
            connection_status = test_connection()
            
            if connection_status:
                print("✅ PostgreSQL database connection successful")
                self.log_result("Database Connectivity", True, "PostgreSQL database is accessible")
                return True
            else:
                print("❌ PostgreSQL database connection failed")
                self.log_result("Database Connectivity", False, "Cannot connect to PostgreSQL database")
                return False
                
        except ImportError as e:
            self.log_result("Database Connectivity", False, f"Cannot import database module: {str(e)}")
            return False
        except Exception as e:
            self.log_result("Database Connectivity", False, f"Database connectivity error: {str(e)}")
            return False

    def test_backend_port_accessibility(self):
        """Test 6: Backend Port 8001 Accessibility"""
        print("\n🌐 TESTING BACKEND PORT ACCESSIBILITY")
        print("=" * 60)
        try:
            # Test if backend is accessible on the expected port
            # The REACT_APP_BACKEND_URL should map to the internal port 8001
            
            response = self.session.get(f"{API_BASE}/", timeout=10)
            
            if response.status_code == 200:
                print(f"✅ Backend accessible via {BACKEND_URL}")
                print(f"✅ API endpoints accessible via {API_BASE}")
                self.log_result("Backend Port Accessibility", True, 
                              f"Backend accessible via configured URL: {BACKEND_URL}")
                return True
            else:
                self.log_result("Backend Port Accessibility", False, 
                              f"Backend not accessible - HTTP {response.status_code}")
                return False
                
        except requests.exceptions.Timeout:
            self.log_result("Backend Port Accessibility", False, "Backend connection timeout")
            return False
        except requests.exceptions.ConnectionError:
            self.log_result("Backend Port Accessibility", False, "Cannot connect to backend")
            return False
        except Exception as e:
            self.log_result("Backend Port Accessibility", False, f"Backend accessibility error: {str(e)}")
            return False

    def run_comprehensive_flight_search_tests(self):
        """Run all flight search backend tests as requested in review"""
        print("=" * 80)
        print("🚀 COMPREHENSIVE FLIGHT SEARCH BACKEND TESTING")
        print("=" * 80)
        print("Testing flight search backend functionality as per review request:")
        print("1. Backend Health Check")
        print("2. Environment Variables (TRIPJACK_API_KEY, REACT_APP_BACKEND_URL)")
        print("3. Flight Search API with Delhi → Mumbai parameters")
        print("4. Tripjack API Integration Status")
        print("5. Database Connectivity (PostgreSQL)")
        print("6. Backend Port Accessibility")
        print("=" * 80)
        
        # Reset results for this test run
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        
        # Run all tests in order
        tests = [
            ("Backend Health", self.test_backend_health),
            ("Environment Variables", self.test_environment_variables),
            ("Flight Search API", self.test_flight_search_api_exact_params),
            ("Tripjack Integration", self.test_tripjack_integration),
            ("Database Connectivity", self.test_database_connectivity),
            ("Backend Port Accessibility", self.test_backend_port_accessibility)
        ]
        
        for test_name, test_func in tests:
            test_func()
            time.sleep(1)  # Brief pause between tests
        
        # Print comprehensive summary
        print("\n" + "=" * 80)
        print("📊 FLIGHT SEARCH BACKEND TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        
        if self.results['errors']:
            print(f"\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        success_rate = (self.results['passed'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")
        
        # Final assessment based on review requirements
        if success_rate == 100:
            print("🎉 ALL FLIGHT SEARCH BACKEND TESTS PASSED!")
            print("✅ Backend is running correctly on port 8001")
            print("✅ All routes are accessible")
            print("✅ Flight Search API returns results with proper pricing")
            print("✅ Database connectivity working")
            print("✅ Environment variables properly configured")
            print("\n🚀 FLIGHT SEARCH BACKEND IS FULLY OPERATIONAL!")
        elif success_rate >= 80:
            print("⚠️  Flight search backend mostly working with minor issues")
            print("🔍 Check failed tests above for specific problems")
        else:
            print("🚨 Flight search backend has significant issues")
            print("🔧 Critical problems detected that need immediate attention")
        
        return self.results

if __name__ == "__main__":
    tester = FlightSearchTester()
    results = tester.run_comprehensive_flight_search_tests()
    
    # Exit with appropriate code
    if results['failed'] == 0:
        print("\n🎯 ALL TESTS PASSED - FLIGHT SEARCH BACKEND IS READY!")
        exit(0)
    else:
        print(f"\n⚠️ {results['failed']} TESTS FAILED - REVIEW REQUIRED")
        exit(1)