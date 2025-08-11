import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'mail.smileholidays.net')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.sender_email = os.getenv('SENDER_EMAIL', 'noreply@smileholidays.net')
        self.sender_password = os.getenv('SENDER_PASSWORD', '')
        self.notification_email = os.getenv('NOTIFICATION_EMAIL', 'sujit@smileholidays.net')
        
        if self.sender_password:
            logger.info("SMTP email service initialized successfully")
        else:
            logger.warning("SMTP password not found. Email notifications disabled.")
    
    def send_email(self, to_email: str, subject: str, html_content: str):
        """
        Send email via SMTP
        """
        if not self.sender_password:
            logger.warning("SMTP not configured. Skipping email notification.")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.sender_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Connect to SMTP server and send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()  # Enable encryption
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return False
    
    def send_waitlist_notification(self, subscriber_email: str, source: str = "website", location_info: dict = None, ip_address: str = "Unknown"):
        """
        Send email notification to admin when someone subscribes to waitlist
        """
        try:
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Format location info
            if location_info:
                location_display = f"{location_info.get('city', 'Unknown')}, {location_info.get('country', 'Unknown')}"
                if location_info.get('region') and location_info.get('region') != location_info.get('city'):
                    location_display = f"{location_info.get('city', 'Unknown')}, {location_info.get('region', '')}, {location_info.get('country', 'Unknown')}"
                timezone_display = location_info.get('timezone', 'Unknown')
                country_flag = "🌍"  # Default flag
                
                # Add country flag based on country code
                country_code = location_info.get('country_code', '').upper()
                flag_map = {
                    'IN': '🇮🇳', 'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
                    'DE': '🇩🇪', 'FR': '🇫🇷', 'SG': '🇸🇬', 'AE': '🇦🇪', 'MY': '🇲🇾',
                    'TH': '🇹🇭', 'ID': '🇮🇩', 'PH': '🇵🇭', 'VN': '🇻🇳', 'KR': '🇰🇷',
                    'JP': '🇯🇵', 'CN': '🇨🇳', 'HK': '🇭🇰', 'TW': '🇹🇼'
                }
                country_flag = flag_map.get(country_code, '🌍')
            else:
                location_display = "Unknown Location"
                timezone_display = "Unknown"
                country_flag = "🌍"
            
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                        <h2 style="margin: 0;">🎉 New TourSmile Waitlist Subscriber!</h2>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h3 style="color: #333; margin-top: 0;">Subscriber Details:</h3>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                            <p style="margin: 5px 0;"><strong>📧 Email:</strong> {subscriber_email}</p>
                            <p style="margin: 5px 0;"><strong>🌐 Source:</strong> {source}</p>
                            <p style="margin: 5px 0;"><strong>⏰ Time:</strong> {current_time}</p>
                            <p style="margin: 5px 0;"><strong>{country_flag} Location:</strong> {location_display}</p>
                            <p style="margin: 5px 0;"><strong>🕐 Timezone:</strong> {timezone_display}</p>
                            <p style="margin: 5px 0; font-family: monospace; font-size: 12px; color: #666;"><strong>🌐 IP:</strong> {ip_address}</p>
                        </div>
                        
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196F3;">
                            <p style="margin: 0; color: #1976d2;">
                                <strong>💡 Action Required:</strong> This subscriber is from <strong>{location_display}</strong>! 
                                Consider tailoring your outreach for this region or adding them to location-specific marketing campaigns.
                            </p>
                        </div>
                        
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-top: 15px;">
                            <p style="margin: 0; color: #856404; font-size: 14px;">
                                <strong>📊 Marketing Tip:</strong> Track location patterns to identify your target markets and optimize advertising spend geographically.
                            </p>
                        </div>
                        
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                        
                        <p style="color: #666; font-size: 14px; margin: 0;">
                            This is an automated notification from TourSmile waitlist system.
                            <br>
                            <em>Building the future of travel planning, one subscriber at a time! ✈️</em>
                        </p>
                    </div>
                </body>
            </html>
            """
            
            return self.send_email(
                self.notification_email,
                f"🚀 New TourSmile Subscriber from {location_display}: {subscriber_email}",
                html_content
            )
                
        except Exception as e:
            logger.error(f"Error sending waitlist notification: {str(e)}")
            return False
    
    def send_welcome_email(self, subscriber_email: str):
        """
        Send welcome email to new subscriber
        """
        try:
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; font-size: 28px;">Welcome to TourSmile! ✈️</h1>
                        <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Travel planning made simple</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 40px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333; text-align: center; margin-top: 0;">Thank you for your interest! 🎉</h2>
                        
                        <p style="color: #555; line-height: 1.6; font-size: 16px;">
                            Hi there! Thank you for joining our waitlist. We're working hard to launch the simplest 
                            travel planning experience you've ever used.
                        </p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #333; margin-top: 0;">What to expect:</h3>
                            <ul style="color: #555; line-height: 1.8;">
                                <li>🔍 <strong>Smart Flight Search:</strong> Find the best deals instantly</li>
                                <li>🏨 <strong>Hotel Booking:</strong> Transparent pricing, no surprises</li>
                                <li>🎯 <strong>Activity Planning:</strong> Curated experiences just for you</li>
                                <li>🤖 <strong>AI Assistant:</strong> Your personal travel companion</li>
                            </ul>
                        </div>
                        
                        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #4caf50;">
                            <p style="margin: 0; color: #2e7d32; font-weight: bold;">
                                🚀 You'll be among the first to know when we launch!
                            </p>
                        </div>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        
                        <p style="color: #666; font-size: 14px; text-align: center; margin: 0;">
                            Stay tuned for updates! We can't wait to simplify your travel planning.
                            <br><br>
                            <em>The TourSmile Team</em>
                        </p>
                    </div>
                </body>
            </html>
            """
            
            return self.send_email(
                subscriber_email,
                "Welcome to TourSmile! Your travel planning adventure begins soon ✈️",
                html_content
            )
                
        except Exception as e:
            logger.error(f"Error sending welcome email: {str(e)}")
            return False

# Global email service instance
email_service = EmailService()