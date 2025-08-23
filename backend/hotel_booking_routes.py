"""
Complete Hotel Booking Routes with TripJack Integration
Handles hotel search, pre-booking, rate revalidation, and confirmation
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
import uuid
import logging

from database import get_db, Booking, User
from tripjack_hotel_api import TripjackHotelService
from payment_service import PaymentOrderRequest, PaymentOrderResponse

router = APIRouter(prefix="/hotel-booking")

# Initialize TripJack Hotel Service
tripjack_hotel_service = TripjackHotelService()

# Remove the search endpoint since it conflicts with the existing one in server.py
# Focus on pre-booking, confirmation, and management endpoints

# Pydantic models for hotel booking
class HotelSearchRequest(BaseModel):
    """Hotel search request model"""
    destination: str
    check_in_date: str  # YYYY-MM-DD
    check_out_date: str  # YYYY-MM-DD
    rooms: int = 1
    adults: int = 2
    children: int = 0
    star_rating: Optional[List[int]] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None

class GuestDetails(BaseModel):
    """Guest information for booking"""
    title: str  # Mr, Ms, Mrs, Dr
    first_name: str
    last_name: str
    age: Optional[int] = None
    guest_type: str = "adult"  # adult, child

class RoomDetails(BaseModel):
    """Room booking details"""
    room_id: str
    adults: int = 2
    children: int = 0
    guests: List[GuestDetails]

class CustomerDetails(BaseModel):
    """Customer contact information"""
    email: EmailStr
    phone: str
    country_code: str = "+91"
    first_name: str
    last_name: str
    address: Optional[str] = None
    city: Optional[str] = None
    country: str = "India"

class HotelPreBookRequest(BaseModel):
    """Hotel pre-booking request for rate revalidation"""
    hotel_id: str
    check_in_date: str
    check_out_date: str
    rooms: List[RoomDetails]
    customer_details: CustomerDetails
    total_price: float  # Expected price for validation

class HotelBookingRequest(BaseModel):
    """Final hotel booking request"""
    booking_token: str  # From pre-book response
    payment_id: str  # Razorpay payment ID
    customer_details: CustomerDetails
    
class HotelBookingResponse(BaseModel):
    """Hotel booking confirmation response"""
    success: bool
    booking_reference: str
    tripjack_booking_id: Optional[str] = None
    message: str
    hotel_details: Optional[Dict] = None
    total_amount: Optional[float] = None

@router.post("/search")
async def search_hotels(request: HotelSearchRequest):
    """Search hotels using TripJack API"""
    try:
        # Validate dates
        check_in = datetime.strptime(request.check_in_date, '%Y-%m-%d').date()
        check_out = datetime.strptime(request.check_out_date, '%Y-%m-%d').date()
        
        if check_in <= date.today():
            raise HTTPException(status_code=400, detail="Check-in date must be in the future")
        
        if check_out <= check_in:
            raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")
        
        # Search hotels via TripJack
        hotels = []
        try:
            hotels = tripjack_hotel_service.search_hotels(
                location=request.destination,
                checkin_date=request.check_in_date,
                checkout_date=request.check_out_date,
                guests=request.adults,
                rooms=request.rooms,
                **{k: v for k, v in {
                    "star_rating": request.star_rating,
                    "min_price": request.min_price,
                    "max_price": request.max_price
                }.items() if v is not None}
            )
        except Exception as e:
            logging.warning(f"TripJack hotel search failed: {e}")
            hotels = []
        
        if not hotels:
            # Fallback to mock data if no real results
            hotels = get_mock_hotel_data(request.destination)
        
        return {
            "success": True,
            "hotels": hotels,
            "search_params": {
                "destination": request.destination,
                "check_in": request.check_in_date,
                "check_out": request.check_out_date,
                "rooms": request.rooms,
                "guests": request.adults + request.children
            },
            "total_hotels": len(hotels),
            "data_source": "tripjack_api" if hotels and 'tripjack_id' in hotels[0] else "mock_data"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        logging.error(f"Hotel search error: {e}")
        raise HTTPException(status_code=500, detail="Hotel search failed")

@router.post("/pre-book")
async def pre_book_hotel(request: HotelPreBookRequest, db: Session = Depends(get_db)):
    """
    Pre-book hotel for rate revalidation (mandatory before payment)
    Generates booking token and confirms current rates
    """
    try:
        # Prepare room details for TripJack API
        rooms_data = []
        guest_details = []
        
        for room in request.rooms:
            rooms_data.append({
                "adults": room.adults,
                "children": room.children
            })
            
            # Collect guest details
            for guest in room.guests:
                guest_details.append({
                    "title": guest.title,
                    "firstName": guest.first_name,
                    "lastName": guest.last_name,
                    "age": guest.age,
                    "type": guest.guest_type
                })
        
        # Call TripJack pre-book API
        prebook_result = tripjack_hotel_service.pre_book_hotel(
            hotel_id=request.hotel_id,
            check_in=request.check_in_date,
            check_out=request.check_out_date,
            rooms=rooms_data,
            guest_details=guest_details
        )
        
        if not prebook_result.get("success"):
            raise HTTPException(
                status_code=400, 
                detail=f"Pre-booking failed: {prebook_result.get('error', 'Unknown error')}"
            )
        
        # Check for rate changes
        revalidated_price = prebook_result.get("revalidated_price", request.total_price)
        rate_changed = prebook_result.get("rate_change", False)
        
        if rate_changed:
            price_difference = abs(revalidated_price - request.total_price)
            if price_difference > (request.total_price * 0.05):  # 5% threshold
                return {
                    "success": False,
                    "rate_change_detected": True,
                    "original_price": request.total_price,
                    "new_price": revalidated_price,
                    "price_difference": price_difference,
                    "message": "Hotel rates have changed significantly. Please confirm the new price.",
                    "booking_token": prebook_result.get("booking_token"),
                    "valid_until": prebook_result.get("valid_until")
                }
        
        # Create preliminary booking record
        booking_reference = f"HTL{uuid.uuid4().hex[:8].upper()}"
        
        preliminary_booking = Booking(
            booking_reference=booking_reference,
            booking_type="hotel",
            status="pre_booked",
            hotel_details={
                "hotel_id": request.hotel_id,
                "check_in": request.check_in_date,
                "check_out": request.check_out_date,
                "rooms": [room.dict() for room in request.rooms],
                "booking_token": prebook_result.get("booking_token")
            },
            contact_info=request.customer_details.dict(),
            base_price=revalidated_price,
            final_price=revalidated_price,
            source="tripjack_hotel",
            passenger_count=sum(room.adults + room.children for room in request.rooms)
        )
        
        db.add(preliminary_booking)
        db.commit()
        
        return {
            "success": True,
            "booking_token": prebook_result.get("booking_token"),
            "booking_reference": booking_reference,
            "revalidated_price": revalidated_price,
            "rate_changed": rate_changed,
            "availability_confirmed": prebook_result.get("availability_confirmed", True),
            "valid_until": prebook_result.get("valid_until"),
            "cancellation_policy": prebook_result.get("cancellation_policy", {}),
            "message": "Rates confirmed. Proceed to payment."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Hotel pre-book error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Pre-booking failed: {str(e)}")

@router.post("/confirm-booking", response_model=HotelBookingResponse)
async def confirm_hotel_booking(request: HotelBookingRequest, db: Session = Depends(get_db)):
    """
    Confirm hotel booking after successful payment
    Generates TripJack booking ID and updates database
    """
    try:
        # Find pre-booking record
        booking = db.query(Booking).filter(
            Booking.hotel_details.op('->>')('booking_token') == request.booking_token
        ).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Pre-booking not found")
        
        if booking.status != "pre_booked":
            raise HTTPException(status_code=400, detail=f"Booking already {booking.status}")
        
        # Verify payment was successful (you'll integrate with your payment service)
        # This would typically check with Razorpay that the payment was captured
        
        # Prepare customer details for TripJack
        customer_details = {
            "email": request.customer_details.email,
            "phone": f"{request.customer_details.country_code}{request.customer_details.phone}",
            "firstName": request.customer_details.first_name,
            "lastName": request.customer_details.last_name,
            "address": request.customer_details.address or "",
            "city": request.customer_details.city or "",
            "country": request.customer_details.country
        }
        
        # Payment details for TripJack
        payment_details = {
            "payment_id": request.payment_id,
            "method": "card",  # This should come from payment service
            "amount": booking.final_price,
            "currency": "INR",
            "transaction_id": request.payment_id  # Using payment_id as transaction_id
        }
        
        # Confirm booking with TripJack
        booking_result = tripjack_hotel_service.confirm_hotel_booking(
            booking_token=request.booking_token,
            payment_details=payment_details,
            customer_details=customer_details
        )
        
        if not booking_result.get("success"):
            raise HTTPException(
                status_code=400, 
                detail=f"Booking confirmation failed: {booking_result.get('error', 'Unknown error')}"
            )
        
        # Update booking record with TripJack booking ID
        hotel_details = booking.hotel_details.copy() if booking.hotel_details else {}
        hotel_details.update({
            "tripjack_booking_id": booking_result.get("tripjack_booking_id"),
            "confirmation_number": booking_result.get("confirmation_number"),
            "voucher_url": booking_result.get("voucher_url"),
            "hotel_contact": booking_result.get("contact_details", {}),
            "booking_confirmed_at": datetime.utcnow().isoformat()
        })
        
        booking.hotel_details = hotel_details
        booking.status = "confirmed"
        booking.updated_at = datetime.utcnow()
        
        # Store payment details
        payment_details_record = booking.payment_details.copy() if booking.payment_details else {}
        payment_details_record.update({
            "razorpay_payment_id": request.payment_id,
            "payment_status": "completed",
            "payment_confirmed_at": datetime.utcnow().isoformat()
        })
        booking.payment_details = payment_details_record
        
        db.commit()
        
        return HotelBookingResponse(
            success=True,
            booking_reference=booking.booking_reference,
            tripjack_booking_id=booking_result.get("tripjack_booking_id"),
            message="Hotel booking confirmed successfully",
            hotel_details=booking_result.get("hotel_details", {}),
            total_amount=booking_result.get("total_amount", booking.final_price)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Hotel booking confirmation error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Booking confirmation failed: {str(e)}")

@router.get("/booking/{booking_reference}")
async def get_hotel_booking_details(booking_reference: str, db: Session = Depends(get_db)):
    """Get hotel booking details"""
    try:
        booking = db.query(Booking).filter(
            Booking.booking_reference == booking_reference,
            Booking.booking_type == "hotel"
        ).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Hotel booking not found")
        
        # Get latest details from TripJack if available
        tripjack_booking_id = None
        if booking.hotel_details:
            tripjack_booking_id = booking.hotel_details.get("tripjack_booking_id")
        
        tripjack_details = {}
        if tripjack_booking_id:
            tripjack_result = tripjack_hotel_service.get_booking_details(tripjack_booking_id)
            if tripjack_result.get("success"):
                tripjack_details = tripjack_result.get("booking_details", {})
        
        return {
            "success": True,
            "booking": {
                "booking_reference": booking.booking_reference,
                "status": booking.status,
                "hotel_details": booking.hotel_details,
                "contact_info": booking.contact_info,
                "payment_details": booking.payment_details,
                "total_amount": booking.final_price,
                "created_at": booking.created_at.isoformat() if booking.created_at else None,
                "tripjack_details": tripjack_details
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get booking details error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve booking details")

@router.post("/cancel/{booking_reference}")
async def cancel_hotel_booking(booking_reference: str, reason: str = "Customer request", db: Session = Depends(get_db)):
    """Cancel hotel booking"""
    try:
        booking = db.query(Booking).filter(
            Booking.booking_reference == booking_reference,
            Booking.booking_type == "hotel"
        ).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Hotel booking not found")
        
        if booking.status == "cancelled":
            raise HTTPException(status_code=400, detail="Booking already cancelled")
        
        tripjack_booking_id = None
        if booking.hotel_details:
            tripjack_booking_id = booking.hotel_details.get("tripjack_booking_id")
        
        cancellation_result = {"success": True}
        if tripjack_booking_id:
            cancellation_result = tripjack_hotel_service.cancel_hotel_booking(
                tripjack_booking_id=tripjack_booking_id,
                cancellation_reason=reason
            )
        
        # Update booking status
        booking.status = "cancelled"
        booking.updated_at = datetime.utcnow()
        
        # Store cancellation details
        hotel_details = booking.hotel_details.copy() if booking.hotel_details else {}
        hotel_details.update({
            "cancellation_reason": reason,
            "cancelled_at": datetime.utcnow().isoformat(),
            "cancellation_result": cancellation_result
        })
        booking.hotel_details = hotel_details
        
        db.commit()
        
        return {
            "success": True,
            "message": "Hotel booking cancelled successfully",
            "cancellation_details": cancellation_result,
            "refund_details": cancellation_result.get("refund_amount") if cancellation_result.get("success") else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Hotel cancellation error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Cancellation failed")

def get_mock_hotel_data(destination: str) -> List[Dict]:
    """Fallback mock hotel data"""
    mock_hotels = [
        {
            "hotel_id": "mock_hotel_001",
            "name": f"Premium Hotel {destination}",
            "star_rating": 5,
            "address": f"Prime Location, {destination}",
            "description": "Luxury hotel with world-class amenities",
            "price_per_night": 8500,
            "total_price": 17000,  # 2 nights
            "currency": "INR",
            "amenities": ["Free WiFi", "Pool", "Spa", "Restaurant", "Gym", "Conference Room"],
            "images": [
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
            ],
            "rating": 4.8,
            "reviews_count": 1250,
            "location": {"latitude": 18.5204, "longitude": 73.8567},
            "check_in_time": "14:00",
            "check_out_time": "11:00",
            "data_source": "mock"
        },
        {
            "hotel_id": "mock_hotel_002", 
            "name": f"Business Hotel {destination}",
            "star_rating": 4,
            "address": f"Business District, {destination}",
            "description": "Modern business hotel with excellent connectivity",
            "price_per_night": 5500,
            "total_price": 11000,  # 2 nights
            "currency": "INR",
            "amenities": ["Free WiFi", "Business Center", "Restaurant", "Airport Shuttle"],
            "images": [
                "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"
            ],
            "rating": 4.2,
            "reviews_count": 890,
            "data_source": "mock"
        }
    ]
    
    return mock_hotels

@router.get("/destinations")
async def get_popular_hotel_destinations():
    """Get popular hotel destinations"""
    destinations = [
        {"code": "GOA", "name": "Goa", "type": "Beach Destination", "hotels_count": 450},
        {"code": "MUM", "name": "Mumbai", "type": "Business Hub", "hotels_count": 380},
        {"code": "DEL", "name": "Delhi", "type": "Capital City", "hotels_count": 520},
        {"code": "BLR", "name": "Bangalore", "type": "IT Capital", "hotels_count": 320},
        {"code": "HYD", "name": "Hyderabad", "type": "Tech City", "hotels_count": 290},
        {"code": "PUN", "name": "Pune", "type": "Cultural Hub", "hotels_count": 250},
        {"code": "JAI", "name": "Jaipur", "type": "Heritage City", "hotels_count": 180},
        {"code": "KOC", "name": "Kochi", "type": "Port City", "hotels_count": 160},
        {"code": "UDR", "name": "Udaipur", "type": "Lake City", "hotels_count": 140},
        {"code": "AGR", "name": "Agra", "type": "Historical", "hotels_count": 120}
    ]
    
    return {
        "destinations": destinations,
        "success": True
    }