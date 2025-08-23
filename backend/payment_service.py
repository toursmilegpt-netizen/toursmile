"""
Razorpay Payment Integration for TourSmile
Handles payment processing for flights, hotels, and packages
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional, List
import razorpay
import os
import uuid
import json
import hmac
import hashlib
from datetime import datetime
import logging

from database import get_db, Booking, User

router = APIRouter(prefix="/payments")

# Razorpay configuration
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', 'rzp_test_sample_key')  # Sandbox for now
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', 'sample_secret')  # Sandbox for now
RAZORPAY_WEBHOOK_SECRET = os.getenv('RAZORPAY_WEBHOOK_SECRET', 'webhook_secret')

# Initialize Razorpay client
try:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    print("✅ Razorpay client initialized successfully")
except Exception as e:
    print(f"❌ Razorpay client initialization failed: {e}")
    razorpay_client = None

# Pydantic models
class PaymentOrderRequest(BaseModel):
    """Request to create a payment order"""
    booking_reference: str
    amount: float  # Amount in INR
    currency: str = "INR"
    customer_details: Dict[str, str]
    booking_type: str  # flight, hotel, package
    
class PaymentOrderResponse(BaseModel):
    """Response for payment order creation"""
    order_id: str
    amount: int  # Amount in paise
    currency: str
    razorpay_key_id: str
    booking_reference: str
    customer_details: Dict[str, str]

class PaymentVerificationRequest(BaseModel):
    """Request to verify payment"""
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    booking_reference: str

class PaymentRefundRequest(BaseModel):
    """Request to process refund"""
    payment_id: str
    amount: Optional[float] = None  # Full refund if None
    reason: str = "customer_request"

class PaymentStatusResponse(BaseModel):
    """Payment status response"""
    success: bool
    status: str
    payment_id: Optional[str] = None
    amount: Optional[float] = None
    message: str

def calculate_convenience_fee(amount: float, booking_type: str) -> float:
    """Calculate convenience fee based on booking type and amount"""
    fee_rates = {
        "flight": 0.02,    # 2% for flights
        "hotel": 0.015,    # 1.5% for hotels  
        "package": 0.01    # 1% for packages (discounted)
    }
    
    base_fee = amount * fee_rates.get(booking_type, 0.02)
    
    # Minimum and maximum fee limits
    min_fee = 10.0  # Minimum ₹10
    max_fee = 500.0  # Maximum ₹500
    
    return max(min_fee, min(base_fee, max_fee))

def calculate_total_amount(base_amount: float, taxes: float, booking_type: str) -> Dict[str, float]:
    """Calculate total amount breakdown"""
    convenience_fee = calculate_convenience_fee(base_amount, booking_type)
    total_amount = base_amount + taxes + convenience_fee
    
    return {
        "base_amount": base_amount,
        "taxes": taxes,
        "convenience_fee": convenience_fee,
        "total_amount": total_amount
    }

@router.post("/create-order", response_model=PaymentOrderResponse)
async def create_payment_order(request: PaymentOrderRequest, db: Session = Depends(get_db)):
    """Create a Razorpay payment order for booking"""
    try:
        if not razorpay_client:
            raise HTTPException(status_code=500, detail="Payment service not available")
        
        # Get booking details
        booking = db.query(Booking).filter(Booking.booking_reference == request.booking_reference).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Calculate amount breakdown
        amount_breakdown = calculate_total_amount(
            base_amount=request.amount,
            taxes=request.amount * 0.18,  # Assuming 18% tax
            booking_type=request.booking_type
        )
        
        # Convert to paise (Razorpay requires amount in smallest currency unit)
        amount_paise = int(amount_breakdown["total_amount"] * 100)
        
        # Create Razorpay order
        order_data = {
            "amount": amount_paise,
            "currency": request.currency,
            "payment_capture": 1,  # Auto-capture payment
            "notes": {
                "booking_reference": request.booking_reference,
                "booking_type": request.booking_type,
                "customer_email": request.customer_details.get("email", ""),
                "customer_phone": request.customer_details.get("phone", "")
            }
        }
        
        razorpay_order = razorpay_client.order.create(order_data)
        
        # Update booking with payment details
        booking.payment_details = {
            "razorpay_order_id": razorpay_order["id"],
            "amount_breakdown": amount_breakdown,
            "payment_status": "initiated",
            "created_at": datetime.utcnow().isoformat()
        }
        db.commit()
        
        return PaymentOrderResponse(
            order_id=razorpay_order["id"],
            amount=amount_paise,
            currency=request.currency,
            razorpay_key_id=RAZORPAY_KEY_ID,
            booking_reference=request.booking_reference,
            customer_details=request.customer_details
        )
        
    except Exception as e:
        logging.error(f"Payment order creation failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create payment order: {str(e)}")

@router.post("/verify", response_model=PaymentStatusResponse)
async def verify_payment(request: PaymentVerificationRequest, db: Session = Depends(get_db)):
    """Verify payment signature and update booking status"""
    try:
        if not razorpay_client:
            raise HTTPException(status_code=500, detail="Payment service not available")
        
        # Verify payment signature
        signature_payload = f"{request.razorpay_order_id}|{request.razorpay_payment_id}"
        expected_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            signature_payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if request.razorpay_signature != expected_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # Fetch payment details from Razorpay
        payment = razorpay_client.payment.fetch(request.razorpay_payment_id)
        
        if payment["status"] != "captured":
            raise HTTPException(status_code=400, detail="Payment not captured")
        
        # Update booking with successful payment
        booking = db.query(Booking).filter(Booking.booking_reference == request.booking_reference).first()
        if booking:
            payment_details = booking.payment_details or {}
            payment_details.update({
                "razorpay_payment_id": request.razorpay_payment_id,
                "payment_status": "completed",
                "payment_method": payment.get("method", "unknown"),
                "completed_at": datetime.utcnow().isoformat(),
                "amount_paid": payment["amount"] / 100,  # Convert back to INR
                "payment_details": payment
            })
            
            booking.payment_details = payment_details
            booking.status = "confirmed"
            db.commit()
        
        return PaymentStatusResponse(
            success=True,
            status="completed",
            payment_id=request.razorpay_payment_id,
            amount=payment["amount"] / 100,
            message="Payment verified and booking confirmed"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Payment verification failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")

@router.post("/webhook")
async def handle_razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Razorpay webhooks for payment status updates"""
    try:
        payload_body = await request.body()
        payload_str = payload_body.decode()
        
        # Get signature from headers
        signature = request.headers.get("X-Razorpay-Signature", "")
        
        # Verify webhook signature
        expected_signature = hmac.new(
            RAZORPAY_WEBHOOK_SECRET.encode(),
            payload_str.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if signature != expected_signature:
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
        
        # Parse webhook payload
        webhook_data = json.loads(payload_str)
        event = webhook_data.get("event", "")
        payment_data = webhook_data.get("payload", {}).get("payment", {})
        
        if event == "payment.captured":
            # Handle successful payment
            order_id = payment_data.get("order_id", "")
            payment_id = payment_data.get("id", "")
            
            # Find booking by order ID
            booking = db.query(Booking).filter(
                Booking.payment_details.op('->>')('razorpay_order_id') == order_id
            ).first()
            
            if booking:
                payment_details = booking.payment_details or {}
                payment_details.update({
                    "webhook_event": event,
                    "webhook_received_at": datetime.utcnow().isoformat(),
                    "payment_status": "completed"
                })
                booking.payment_details = payment_details
                booking.status = "confirmed"
                db.commit()
                
        elif event == "payment.failed":
            # Handle failed payment
            order_id = payment_data.get("order_id", "")
            
            # Find and update booking
            booking = db.query(Booking).filter(
                Booking.payment_details.op('->>')('razorpay_order_id') == order_id
            ).first()
            
            if booking:
                payment_details = booking.payment_details or {}
                payment_details.update({
                    "webhook_event": event,
                    "webhook_received_at": datetime.utcnow().isoformat(),
                    "payment_status": "failed",
                    "failure_reason": payment_data.get("error_description", "Unknown error")
                })
                booking.payment_details = payment_details
                booking.status = "payment_failed"
                db.commit()
        
        return {"status": "webhook_processed", "event": event}
        
    except Exception as e:
        logging.error(f"Webhook processing failed: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

@router.post("/refund", response_model=PaymentStatusResponse)
async def process_refund(request: PaymentRefundRequest, db: Session = Depends(get_db)):
    """Process refund for a payment"""
    try:
        if not razorpay_client:
            raise HTTPException(status_code=500, detail="Payment service not available")
        
        # Fetch payment details
        payment = razorpay_client.payment.fetch(request.payment_id)
        
        # Calculate refund amount
        refund_amount = request.amount
        if refund_amount is None:
            refund_amount = payment["amount"] / 100  # Full refund
        
        refund_amount_paise = int(refund_amount * 100)
        
        # Process refund
        refund = razorpay_client.payment.refund(request.payment_id, {
            "amount": refund_amount_paise,
            "notes": {
                "reason": request.reason,
                "refund_initiated_at": datetime.utcnow().isoformat()
            }
        })
        
        # Update booking with refund details
        booking = db.query(Booking).filter(
            Booking.payment_details.op('->>')('razorpay_payment_id') == request.payment_id
        ).first()
        
        if booking:
            payment_details = booking.payment_details or {}
            if "refunds" not in payment_details:
                payment_details["refunds"] = []
            
            payment_details["refunds"].append({
                "refund_id": refund["id"],
                "amount": refund_amount,
                "status": refund["status"],
                "reason": request.reason,
                "initiated_at": datetime.utcnow().isoformat()
            })
            
            booking.payment_details = payment_details
            booking.status = "refunded" if refund_amount == payment["amount"] / 100 else "partially_refunded"
            db.commit()
        
        return PaymentStatusResponse(
            success=True,
            status="refund_initiated",
            payment_id=request.payment_id,
            amount=refund_amount,
            message=f"Refund of ₹{refund_amount} initiated successfully"
        )
        
    except Exception as e:
        logging.error(f"Refund processing failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Refund processing failed: {str(e)}")

@router.get("/status/{booking_reference}")
async def get_payment_status(booking_reference: str, db: Session = Depends(get_db)):
    """Get payment status for a booking"""
    try:
        booking = db.query(Booking).filter(Booking.booking_reference == booking_reference).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        payment_details = booking.payment_details or {}
        
        return {
            "booking_reference": booking_reference,
            "payment_status": payment_details.get("payment_status", "pending"),
            "amount_breakdown": payment_details.get("amount_breakdown", {}),
            "payment_method": payment_details.get("payment_method", "unknown"),
            "razorpay_order_id": payment_details.get("razorpay_order_id", ""),
            "razorpay_payment_id": payment_details.get("razorpay_payment_id", ""),
            "completed_at": payment_details.get("completed_at", ""),
            "refunds": payment_details.get("refunds", []),
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching payment status: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch payment status")

@router.get("/test-cards")
async def get_test_cards():
    """Get Razorpay test card details for sandbox testing"""
    test_cards = [
        {
            "name": "Visa - Success",
            "number": "4111 1111 1111 1111",
            "expiry": "12/25",
            "cvv": "123",
            "result": "Success"
        },
        {
            "name": "Mastercard - Success", 
            "number": "5555 5555 5555 4444",
            "expiry": "12/25", 
            "cvv": "123",
            "result": "Success"
        },
        {
            "name": "Visa - Failure",
            "number": "4000 0000 0000 0002",
            "expiry": "12/25",
            "cvv": "123", 
            "result": "Payment Failed"
        },
        {
            "name": "American Express - Success",
            "number": "3782 8224 6310 005",
            "expiry": "12/25",
            "cvv": "1234",
            "result": "Success"
        }
    ]
    
    return {
        "test_cards": test_cards,
        "upi_id": "success@razorpay",
        "wallet_options": ["paytm", "phonepe", "googlepay"],
        "netbanking_options": ["HDFC", "ICICI", "SBI", "Axis"],
        "note": "These are sandbox test credentials. Do not use in production.",
        "success": True
    }

@router.get("/config")
async def get_payment_config():
    """Get payment configuration for frontend"""
    return {
        "razorpay_key_id": RAZORPAY_KEY_ID,
        "supported_payment_methods": [
            "card", "netbanking", "wallet", "upi"
        ],
        "currency": "INR",
        "environment": "sandbox" if "test" in RAZORPAY_KEY_ID else "production",
        "success": True
    }