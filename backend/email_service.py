from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.api_key = os.getenv('SENDGRID_API_KEY')
        self.sender_email = os.getenv('SENDER_EMAIL', 'noreply@toursmile.com')
        self.notification_email = os.getenv('NOTIFICATION_EMAIL', 'sujit@smileholidays.net')
        
        if self.api_key:
            self.client = SendGridAPIClient(self.api_key)
            logger.info("SendGrid client initialized successfully")
        else:
            logger.warning("SendGrid API key not found. Email notifications disabled.")
            self.client = None
    
    def send_waitlist_notification(self, subscriber_email: str, source: str = "website"):
        """
        Send email notification to admin when someone subscribes to waitlist
        """
        if not self.client:
            logger.warning("SendGrid not configured. Skipping email notification.")
            return False
        
        try:
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
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
                        </div>
                        
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196F3;">
                            <p style="margin: 0; color: #1976d2;">
                                <strong>💡 Action Required:</strong> Consider reaching out to this potential customer 
                                or add them to your marketing campaigns for TourSmile launch updates.
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
            
            message = Mail(
                from_email=self.sender_email,
                to_emails=self.notification_email,
                subject=f"🚀 New TourSmile Subscriber: {subscriber_email}",
                html_content=html_content
            )
            
            response = self.client.send(message)
            
            if response.status_code == 202:
                logger.info(f"Waitlist notification sent successfully for {subscriber_email}")
                return True
            else:
                logger.error(f"Failed to send notification. Status code: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending waitlist notification: {str(e)}")
            return False
    
    def send_welcome_email(self, subscriber_email: str):
        """
        Send welcome email to new subscriber (optional feature)
        """
        if not self.client:
            return False
        
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
            
            message = Mail(
                from_email=self.sender_email,
                to_emails=subscriber_email,
                subject="Welcome to TourSmile! Your travel planning adventure begins soon ✈️",
                html_content=html_content
            )
            
            response = self.client.send(message)
            
            if response.status_code == 202:
                logger.info(f"Welcome email sent successfully to {subscriber_email}")
                return True
            else:
                logger.error(f"Failed to send welcome email. Status code: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending welcome email: {str(e)}")
            return False

# Global email service instance
email_service = EmailService()