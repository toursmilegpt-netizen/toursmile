"""
OTP Authentication Service for TourSmile
Handles OTP generation, verification for user authentication
Prepared for MSG91 integration with sandbox fallback
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from typing import Optional, Dict, Any
import random
import string
import os
from datetime import datetime, timedelta
import requests
import logging

from database import get_db, OTPVerification, User

router = APIRouter(prefix="/auth")

# MSG91 Configuration (will be set when credentials are available)
MSG91_AUTHKEY = os.getenv('MSG91_AUTHKEY', 'sandbox_test_key')
MSG91_TEMPLATE_ID = os.getenv('MSG91_TEMPLATE_ID', 'sandbox_template')
MSG91_BASE_URL = "https://api.msg91.com/api/v5"

# Sandbox mode (True when no real MSG91 credentials)
SANDBOX_MODE = MSG91_AUTHKEY == 'sandbox_test_key'

# Pydantic models
class PhoneNumber(BaseModel):
    """Phone number validation model"""
    country_code: str = "+91"
    phone: str
    
    @validator('phone')
    def validate_phone(cls, v):
        # Remove any spaces or special characters
        phone_clean = ''.join(filter(str.isdigit, v))
        
        # Indian mobile number validation
        if not phone_clean.startswith(('6', '7', '8', '9')):
            raise ValueError('Invalid Indian mobile number')
        
        if len(phone_clean) != 10:
            raise ValueError('Phone number must be 10 digits')
            
        return phone_clean

class OTPSendRequest(BaseModel):
    """Request to send OTP"""
    country_code: str = "+91"
    phone: str
    purpose: str = "registration"  # registration, login, booking_verification
    
class OTPVerifyRequest(BaseModel):
    """Request to verify OTP"""
    country_code: str = "+91" 
    phone: str
    otp_code: str
    purpose: str = "registration"

class OTPResponse(BaseModel):
    """OTP operation response"""
    success: bool
    message: str
    session_id: Optional[str] = None
    expires_in: Optional[int] = None  # Seconds until expiry

class UserRegistrationRequest(BaseModel):
    """User registration with OTP verification"""
    country_code: str = "+91"
    phone: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    otp_code: str

class LoginRequest(BaseModel):
    """Login request with OTP"""
    country_code: str = "+91"
    phone: str
    otp_code: str

class AuthTokenResponse(BaseModel):
    """Authentication token response"""
    success: bool
    access_token: Optional[str] = None
    user_id: Optional[str] = None
    message: str

def generate_otp() -> str:
    """Generate 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def generate_session_id() -> str:
    """Generate session ID for OTP tracking"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=16))

def send_otp_msg91(phone: str, country_code: str, otp: str, template_id: str) -> bool:
    """Send OTP via MSG91 (when credentials available)"""
    try:
        if SANDBOX_MODE:
            # Sandbox mode - simulate successful send
            logging.info(f"SANDBOX: OTP {otp} sent to {country_code}{phone}")
            return True
            
        # Real MSG91 API call
        url = f"{MSG91_BASE_URL}/otp"
        payload = {
            "authkey": MSG91_AUTHKEY,
            "template_id": template_id,
            "mobile": f"{country_code.replace('+', '')}{phone}",
            "otp": otp
        }
        
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            return result.get("type") == "success"
        else:
            logging.error(f"MSG91 API error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        logging.error(f"MSG91 send error: {e}")
        return False

def verify_otp_msg91(phone: str, country_code: str, otp: str) -> bool:
    """Verify OTP via MSG91 (when credentials available)"""
    try:
        if SANDBOX_MODE:
            # Sandbox mode - accept specific test OTPs or any 6-digit OTP for testing
            test_otps = ["123456", "111111", "000000"]
            return otp in test_otps or (len(otp) == 6 and otp.isdigit())
            
        # Real MSG91 API verification
        url = f"{MSG91_BASE_URL}/otp/verify"
        payload = {
            "authkey": MSG91_AUTHKEY,
            "mobile": f"{country_code.replace('+', '')}{phone}",
            "otp": otp
        }
        
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            return result.get("type") == "success"
        else:
            return False
            
    except Exception as e:
        logging.error(f"MSG91 verify error: {e}")
        return False

@router.post("/send-otp", response_model=OTPResponse)
async def send_otp(request: OTPSendRequest, db: Session = Depends(get_db)):
    """Send OTP to phone number"""
    try:
        # Validate phone number
        phone_validator = PhoneNumber(country_code=request.country_code, phone=request.phone)
        clean_phone = phone_validator.phone
        
        # Generate OTP
        otp_code = generate_otp()
        session_id = generate_session_id()
        expires_at = datetime.utcnow() + timedelta(minutes=5)  # 5 minute expiry
        
        # Check for existing active OTP
        existing_otp = db.query(OTPVerification).filter(
            OTPVerification.phone == clean_phone,
            OTPVerification.country_code == request.country_code,
            OTPVerification.purpose == request.purpose,
            OTPVerification.is_verified == False,
            OTPVerification.expires_at > datetime.utcnow()
        ).first()
        
        if existing_otp:
            return OTPResponse(
                success=False,
                message=f"OTP already sent. Please wait {int((existing_otp.expires_at - datetime.utcnow()).seconds / 60)} minutes before requesting again."
            )
        
        # Send OTP via MSG91 or sandbox
        otp_sent = send_otp_msg91(clean_phone, request.country_code, otp_code, MSG91_TEMPLATE_ID)
        
        if not otp_sent:
            raise HTTPException(status_code=500, detail="Failed to send OTP")
        
        # Store OTP in database
        otp_verification = OTPVerification(
            phone=clean_phone,
            country_code=request.country_code,
            otp_code=otp_code,
            purpose=request.purpose,
            expires_at=expires_at
        )
        
        db.add(otp_verification)
        db.commit()
        
        message = "OTP sent successfully"
        if SANDBOX_MODE:
            message += f" (SANDBOX: Use OTP {otp_code} or any test OTP: 123456, 111111, 000000)"
        
        return OTPResponse(
            success=True,
            message=message,
            session_id=session_id,
            expires_in=300  # 5 minutes
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Send OTP error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

@router.post("/verify-otp", response_model=OTPResponse)
async def verify_otp(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify OTP code"""
    try:
        # Validate phone number
        phone_validator = PhoneNumber(country_code=request.country_code, phone=request.phone)
        clean_phone = phone_validator.phone
        
        # Find OTP record
        otp_record = db.query(OTPVerification).filter(
            OTPVerification.phone == clean_phone,
            OTPVerification.country_code == request.country_code,
            OTPVerification.purpose == request.purpose,
            OTPVerification.is_verified == False,
            OTPVerification.expires_at > datetime.utcnow()
        ).first()
        
        if not otp_record:
            return OTPResponse(
                success=False,
                message="OTP not found or expired. Please request a new OTP."
            )
        
        # Verify OTP
        if SANDBOX_MODE:
            # Sandbox verification
            otp_valid = verify_otp_msg91(clean_phone, request.country_code, request.otp_code)
        else:
            # Database verification for local OTP or MSG91 verification
            otp_valid = otp_record.otp_code == request.otp_code or verify_otp_msg91(clean_phone, request.country_code, request.otp_code)
        
        if not otp_valid:
            return OTPResponse(
                success=False,
                message="Invalid OTP. Please check and try again."
            )
        
        # Mark OTP as verified
        otp_record.is_verified = True
        db.commit()
        
        return OTPResponse(
            success=True,
            message="OTP verified successfully"
        )
        
    except Exception as e:
        logging.error(f"Verify OTP error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"OTP verification failed: {str(e)}")

@router.post("/register", response_model=AuthTokenResponse)
async def register_user(request: UserRegistrationRequest, db: Session = Depends(get_db)):
    """Register new user with OTP verification"""
    try:
        # First verify OTP
        otp_verify_request = OTPVerifyRequest(
            country_code=request.country_code,
            phone=request.phone,
            otp_code=request.otp_code,
            purpose="registration"
        )
        
        otp_result = await verify_otp(otp_verify_request, db)
        if not otp_result.success:
            return AuthTokenResponse(
                success=False,
                message=otp_result.message
            )
        
        # Check if user already exists
        phone_validator = PhoneNumber(country_code=request.country_code, phone=request.phone)
        clean_phone = phone_validator.phone
        
        existing_user = db.query(User).filter(
            User.phone == clean_phone,
            User.country_code == request.country_code
        ).first()
        
        if existing_user:
            return AuthTokenResponse(
                success=False,
                message="User already registered. Please login instead."
            )
        
        # Create new user
        new_user = User(
            phone=clean_phone,
            country_code=request.country_code,
            email=request.email,
            first_name=request.first_name,
            last_name=request.last_name,
            is_verified=True  # Phone verified via OTP
        )
        
        db.add(new_user)
        db.commit()
        
        # Generate simple token (in production, use JWT)
        access_token = f"token_{new_user.id}_{datetime.utcnow().timestamp()}"
        
        return AuthTokenResponse(
            success=True,
            access_token=access_token,
            user_id=new_user.id,
            message="User registered successfully"
        )
        
    except Exception as e:
        logging.error(f"User registration error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=AuthTokenResponse)
async def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    """Login user with OTP verification"""
    try:
        # Verify OTP
        otp_verify_request = OTPVerifyRequest(
            country_code=request.country_code,
            phone=request.phone,
            otp_code=request.otp_code,
            purpose="login"
        )
        
        otp_result = await verify_otp(otp_verify_request, db)
        if not otp_result.success:
            return AuthTokenResponse(
                success=False,
                message=otp_result.message
            )
        
        # Find user
        phone_validator = PhoneNumber(country_code=request.country_code, phone=request.phone)
        clean_phone = phone_validator.phone
        
        user = db.query(User).filter(
            User.phone == clean_phone,
            User.country_code == request.country_code
        ).first()
        
        if not user:
            return AuthTokenResponse(
                success=False,
                message="User not found. Please register first."
            )
        
        # Update last login
        user.updated_at = datetime.utcnow()
        db.commit()
        
        # Generate access token
        access_token = f"token_{user.id}_{datetime.utcnow().timestamp()}"
        
        return AuthTokenResponse(
            success=True,
            access_token=access_token,
            user_id=user.id,
            message="Login successful"
        )
        
    except Exception as e:
        logging.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/sandbox-info")
async def get_sandbox_info():
    """Get sandbox testing information"""
    return {
        "sandbox_mode": SANDBOX_MODE,
        "test_phone_numbers": [
            "+91 9876543210",
            "+91 8765432109",
            "+91 7654321098"
        ],
        "test_otps": [
            "123456",
            "111111", 
            "000000"
        ],
        "otp_expiry": "5 minutes",
        "supported_purposes": [
            "registration",
            "login",
            "booking_verification"
        ],
        "msg91_status": "Waiting for credentials" if SANDBOX_MODE else "Connected",
        "note": "In sandbox mode, any 6-digit OTP will work for testing. Test OTPs are provided for convenience.",
        "success": True
    }

@router.get("/config")
async def get_auth_config():
    """Get authentication configuration"""
    return {
        "otp_length": 6,
        "otp_expiry_minutes": 5,
        "supported_countries": ["+91"],
        "sandbox_mode": SANDBOX_MODE,
        "msg91_integrated": not SANDBOX_MODE,
        "success": True
    }