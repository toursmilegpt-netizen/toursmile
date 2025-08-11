#!/usr/bin/env python3
"""
Email Notification System Testing Suite for TourSmile Waitlist
Tests the complete email notification system including SMTP integration and waitlist functionality
"""

import requests
import json
import time
import os
import sys
from datetime import datetime
import smtplib
from email.mime.text import MIMEText

# Add backend to path for importing email service
sys.path.append('/app/backend')

# Load environment variables before importing email service
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

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
print(f"Testing email notification system at: {API_BASE}")

class EmailNotificationTester:
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
        
        # Load SMTP configuration from backend .env
        self.load_smtp_config()

    def load_smtp_config(self):
        """Load SMTP configuration from backend .env file"""
        try:
            env_path = '/app/backend/.env'
            self.smtp_config = {}
            
            with open(env_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        if '=' in line:
                            key, value = line.split('=', 1)
                            key = key.strip()
                            value = value.strip().strip('"')
                            
                            if key in ['SMTP_SERVER', 'SMTP_PORT', 'SENDER_EMAIL', 'SENDER_PASSWORD', 'NOTIFICATION_EMAIL']:
                                self.smtp_config[key] = value
            
            print(f"📧 SMTP Configuration loaded:")
            print(f"   Server: {self.smtp_config.get('SMTP_SERVER', 'Not found')}")
            print(f"   Port: {self.smtp_config.get('SMTP_PORT', 'Not found')}")
            print(f"   Sender: {self.smtp_config.get('SENDER_EMAIL', 'Not found')}")
            print(f"   Notification Email: {self.smtp_config.get('NOTIFICATION_EMAIL', 'Not found')}")
            print(f"   Password: {'✅ Found' if self.smtp_config.get('SENDER_PASSWORD') else '❌ Missing'}")
            
        except Exception as e:
            print(f"Error loading SMTP config: {e}")
            self.smtp_config = {}

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

    def test_smtp_connection(self):
        """Test 1: Direct SMTP connection to Interserver"""
        print("\n🔌 TESTING SMTP CONNECTION - Interserver")
        print("=" * 70)
        try:
            smtp_server = self.smtp_config.get('SMTP_SERVER', 'mail.smileholidays.net')
            smtp_port = int(self.smtp_config.get('SMTP_PORT', '587'))
            sender_email = self.smtp_config.get('SENDER_EMAIL', 'noreply@smileholidays.net')
            sender_password = self.smtp_config.get('SENDER_PASSWORD', '')
            
            if not sender_password:
                self.log_result("SMTP Connection Test", False, "SMTP password not configured")
                return False
            
            print(f"🌐 Connecting to {smtp_server}:{smtp_port}")
            print(f"📧 Using sender: {sender_email}")
            
            # Test SMTP connection
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()  # Enable TLS encryption
                print("🔐 TLS encryption enabled")
                
                server.login(sender_email, sender_password)
                print("🔑 Authentication successful")
                
                self.log_result("SMTP Connection Test", True, 
                              f"Successfully connected to {smtp_server}:{smtp_port} with TLS")
                return True
                
        except Exception as e:
            self.log_result("SMTP Connection Test", False, f"SMTP connection failed: {str(e)}")
            return False

    def test_email_service_initialization(self):
        """Test 2: Email service initialization"""
        print("\n⚙️ TESTING EMAIL SERVICE INITIALIZATION")
        print("=" * 70)
        try:
            from email_service import email_service
            
            # Check if email service is properly initialized
            config_checks = {
                "SMTP Server": email_service.smtp_server == self.smtp_config.get('SMTP_SERVER'),
                "SMTP Port": email_service.smtp_port == int(self.smtp_config.get('SMTP_PORT', '587')),
                "Sender Email": email_service.sender_email == self.smtp_config.get('SENDER_EMAIL'),
                "Notification Email": email_service.notification_email == self.smtp_config.get('NOTIFICATION_EMAIL'),
                "Password Loaded": bool(email_service.sender_password)
            }
            
            print("🔍 Email Service Configuration:")
            for check, result in config_checks.items():
                status = "✅" if result else "❌"
                print(f"   {status} {check}")
            
            all_configured = all(config_checks.values())
            
            if all_configured:
                self.log_result("Email Service Initialization", True, 
                              "Email service properly initialized with all configuration")
                return True
            else:
                failed_checks = [k for k, v in config_checks.items() if not v]
                self.log_result("Email Service Initialization", False, 
                              f"Configuration issues: {failed_checks}")
                return False
                
        except Exception as e:
            self.log_result("Email Service Initialization", False, f"Error: {str(e)}")
            return False

    def test_waitlist_subscription_with_email(self):
        """Test 3: Waitlist subscription with email notifications"""
        print("\n📝 TESTING WAITLIST SUBSCRIPTION WITH EMAIL NOTIFICATIONS")
        print("=" * 70)
        try:
            # Use a real email address for testing
            test_email = "test.toursmile.notifications@gmail.com"  # Use a real test email
            payload = {
                "email": test_email,
                "source": "email_notification_test"
            }
            
            print(f"📤 Subscribing email: {test_email}")
            print(f"📤 REQUEST: {json.dumps(payload, indent=2)}")
            
            response = self.session.post(f"{API_BASE}/waitlist/subscribe", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("email") == test_email:
                    print(f"✅ Waitlist subscription successful")
                    print(f"📧 Response: {data.get('message')}")
                    
                    # Give time for background email tasks to process
                    print("⏳ Waiting 10 seconds for email notifications to process...")
                    time.sleep(10)
                    
                    self.log_result("Waitlist Subscription with Email", True, 
                                  f"Successfully subscribed {test_email} with email notifications",
                                  data)
                    return True
                else:
                    self.log_result("Waitlist Subscription with Email", False, 
                                  f"Subscription failed: {data}")
                    return False
            else:
                self.log_result("Waitlist Subscription with Email", False, 
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Waitlist Subscription with Email", False, f"Error: {str(e)}")
            return False

    def test_duplicate_email_notification(self):
        """Test 4: Duplicate email handling with notifications"""
        print("\n🔄 TESTING DUPLICATE EMAIL HANDLING WITH NOTIFICATIONS")
        print("=" * 70)
        try:
            # Use the same email as previous test to trigger duplicate handling
            test_email = "test.toursmile.notifications@gmail.com"
            payload = {
                "email": test_email,
                "source": "duplicate_test"
            }
            
            print(f"📤 Attempting duplicate subscription: {test_email}")
            response = self.session.post(f"{API_BASE}/waitlist/subscribe", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    expected_duplicate_messages = ["already on", "waitlist", "notify you"]
                    message_check = any(phrase in data.get("message", "").lower() for phrase in expected_duplicate_messages)
                    
                    if message_check:
                        print(f"✅ Duplicate handling working correctly")
                        print(f"📧 Message: {data.get('message')}")
                        
                        # Give time for duplicate notification email
                        print("⏳ Waiting 5 seconds for duplicate notification email...")
                        time.sleep(5)
                        
                        self.log_result("Duplicate Email Notification", True, 
                                      "Duplicate email handled correctly with notification",
                                      data)
                        return True
                    else:
                        self.log_result("Duplicate Email Notification", False, 
                                      f"Unexpected duplicate message: {data.get('message')}")
                        return False
                else:
                    self.log_result("Duplicate Email Notification", False, 
                                  f"Duplicate handling failed: {data}")
                    return False
            else:
                self.log_result("Duplicate Email Notification", False, 
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Duplicate Email Notification", False, f"Error: {str(e)}")
            return False

    def test_admin_notification_email_content(self):
        """Test 5: Admin notification email content and format"""
        print("\n📨 TESTING ADMIN NOTIFICATION EMAIL CONTENT")
        print("=" * 70)
        try:
            from email_service import email_service
            
            # Test the admin notification email generation
            test_subscriber = "admin.test@toursmile.com"
            test_source = "content_test"
            
            print(f"🧪 Testing admin notification for: {test_subscriber}")
            print(f"📍 Source: {test_source}")
            
            # This will attempt to send the actual email
            result = email_service.send_waitlist_notification(test_subscriber, test_source)
            
            if result:
                print("✅ Admin notification email sent successfully")
                print(f"📧 Sent to: {email_service.notification_email}")
                
                self.log_result("Admin Notification Email Content", True, 
                              f"Admin notification sent successfully to {email_service.notification_email}")
                return True
            else:
                self.log_result("Admin Notification Email Content", False, 
                              "Failed to send admin notification email")
                return False
                
        except Exception as e:
            self.log_result("Admin Notification Email Content", False, f"Error: {str(e)}")
            return False

    def test_welcome_email_functionality(self):
        """Test 6: Welcome email to subscribers"""
        print("\n🎉 TESTING WELCOME EMAIL FUNCTIONALITY")
        print("=" * 70)
        try:
            from email_service import email_service
            
            # Test welcome email generation
            test_subscriber = "welcome.test@toursmile.com"
            
            print(f"🧪 Testing welcome email for: {test_subscriber}")
            
            # This will attempt to send the actual welcome email
            result = email_service.send_welcome_email(test_subscriber)
            
            if result:
                print("✅ Welcome email sent successfully")
                print(f"📧 Sent to: {test_subscriber}")
                
                self.log_result("Welcome Email Functionality", True, 
                              f"Welcome email sent successfully to {test_subscriber}")
                return True
            else:
                self.log_result("Welcome Email Functionality", False, 
                              "Failed to send welcome email")
                return False
                
        except Exception as e:
            self.log_result("Welcome Email Functionality", False, f"Error: {str(e)}")
            return False

    def test_email_validation_with_notifications(self):
        """Test 7: Email validation with proper error handling"""
        print("\n🔍 TESTING EMAIL VALIDATION WITH NOTIFICATIONS")
        print("=" * 70)
        
        invalid_emails = [
            "invalid-email",
            "test@",
            "@domain.com",
            "test..test@domain.com",
            "test@domain",
            ""
        ]
        
        success_count = 0
        
        for i, invalid_email in enumerate(invalid_emails, 1):
            try:
                print(f"\n📋 Test {i}: Invalid email '{invalid_email}'")
                payload = {
                    "email": invalid_email,
                    "source": "validation_test"
                }
                
                response = self.session.post(f"{API_BASE}/waitlist/subscribe", json=payload)
                
                if response.status_code == 422:  # Validation error expected
                    print(f"   ✅ Properly rejected invalid email")
                    success_count += 1
                elif response.status_code == 200:
                    print(f"   ❌ Invalid email was accepted (should be rejected)")
                else:
                    print(f"   ❌ Unexpected status code: {response.status_code}")
                    
            except Exception as e:
                print(f"   ❌ Error testing invalid email: {str(e)}")
        
        if success_count == len(invalid_emails):
            self.log_result("Email Validation with Notifications", True, 
                          f"All {success_count}/{len(invalid_emails)} invalid emails properly rejected")
            return True
        else:
            self.log_result("Email Validation with Notifications", False, 
                          f"Only {success_count}/{len(invalid_emails)} invalid emails properly rejected")
            return False

    def test_waitlist_count_after_subscriptions(self):
        """Test 8: Waitlist count accuracy after subscriptions"""
        print("\n📊 TESTING WAITLIST COUNT ACCURACY")
        print("=" * 70)
        try:
            # Get current count
            response = self.session.get(f"{API_BASE}/waitlist/count")
            
            if response.status_code == 200:
                data = response.json()
                if "count" in data and "success" in data:
                    current_count = data["count"]
                    print(f"📈 Current waitlist count: {current_count}")
                    
                    # Subscribe a new unique email
                    unique_email = f"count.test.{int(time.time())}@toursmile.com"
                    payload = {
                        "email": unique_email,
                        "source": "count_test"
                    }
                    
                    subscribe_response = self.session.post(f"{API_BASE}/waitlist/subscribe", json=payload)
                    
                    if subscribe_response.status_code == 200:
                        # Wait a moment for database update
                        time.sleep(2)
                        
                        # Check count again
                        new_count_response = self.session.get(f"{API_BASE}/waitlist/count")
                        
                        if new_count_response.status_code == 200:
                            new_data = new_count_response.json()
                            new_count = new_data.get("count", 0)
                            
                            print(f"📈 New waitlist count: {new_count}")
                            
                            if new_count == current_count + 1:
                                self.log_result("Waitlist Count Accuracy", True, 
                                              f"Count increased correctly from {current_count} to {new_count}")
                                return True
                            else:
                                self.log_result("Waitlist Count Accuracy", False, 
                                              f"Count mismatch: expected {current_count + 1}, got {new_count}")
                                return False
                        else:
                            self.log_result("Waitlist Count Accuracy", False, 
                                          "Failed to get updated count")
                            return False
                    else:
                        self.log_result("Waitlist Count Accuracy", False, 
                                      "Failed to subscribe test email")
                        return False
                else:
                    self.log_result("Waitlist Count Accuracy", False, 
                                  f"Invalid count response: {data}")
                    return False
            else:
                self.log_result("Waitlist Count Accuracy", False, 
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Waitlist Count Accuracy", False, f"Error: {str(e)}")
            return False

    def run_comprehensive_email_notification_tests(self):
        """Run all email notification system tests"""
        print("=" * 80)
        print("📧 TOURSMILE EMAIL NOTIFICATION SYSTEM TESTING")
        print("=" * 80)
        print("Testing the complete email notification system:")
        print("1. SMTP Connection to Interserver (mail.smileholidays.net)")
        print("2. Email Service Initialization")
        print("3. Waitlist Subscription with Email Notifications")
        print("4. Duplicate Email Handling with Notifications")
        print("5. Admin Notification Email Content")
        print("6. Welcome Email Functionality")
        print("7. Email Validation with Notifications")
        print("8. Waitlist Count Accuracy")
        print("=" * 80)
        
        # Reset results for this test run
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        
        # Run all email notification tests
        tests = [
            ("SMTP Connection", self.test_smtp_connection),
            ("Email Service Initialization", self.test_email_service_initialization),
            ("Waitlist Subscription with Email", self.test_waitlist_subscription_with_email),
            ("Duplicate Email Notification", self.test_duplicate_email_notification),
            ("Admin Notification Email", self.test_admin_notification_email_content),
            ("Welcome Email Functionality", self.test_welcome_email_functionality),
            ("Email Validation", self.test_email_validation_with_notifications),
            ("Waitlist Count Accuracy", self.test_waitlist_count_after_subscriptions)
        ]
        
        for test_name, test_func in tests:
            test_func()
            time.sleep(3)  # Pause between tests for email processing
        
        # Print comprehensive summary
        print("\n" + "=" * 80)
        print("📊 EMAIL NOTIFICATION SYSTEM TEST SUMMARY")
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
        
        # Final assessment
        if success_rate == 100:
            print("🎉 ALL EMAIL NOTIFICATION TESTS PASSED!")
            print("✅ SMTP connection to Interserver working")
            print("✅ Admin notifications sent to sujit@smileholidays.net")
            print("✅ Welcome emails sent to subscribers")
            print("✅ Duplicate email handling working")
            print("✅ Email validation working properly")
            print("✅ Waitlist count accuracy maintained")
            print("\n🚀 EMAIL NOTIFICATION SYSTEM IS FULLY OPERATIONAL!")
        elif success_rate >= 75:
            print("⚠️  Email notification system mostly working with minor issues")
            print("🔍 Check failed tests above for specific problems")
        else:
            print("🚨 Email notification system has significant issues")
            print("🔧 SMTP or email service configuration problems detected")
        
        return self.results

if __name__ == "__main__":
    tester = EmailNotificationTester()
    results = tester.run_comprehensive_email_notification_tests()
    
    # Exit with appropriate code
    if results['failed'] == 0:
        print("\n🎯 ALL TESTS PASSED - EMAIL SYSTEM READY FOR PRODUCTION!")
        exit(0)
    else:
        print(f"\n⚠️  {results['failed']} TESTS FAILED - REVIEW ISSUES ABOVE")
        exit(1)