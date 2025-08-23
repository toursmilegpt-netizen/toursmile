from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any, Optional
import os
import uuid
from email_service import email_service
from database import get_db, Booking, User

router = APIRouter()

class Passenger(BaseModel):
    title: str
    firstName: str
    lastName: str
    dateOfBirth: str
    gender: str
    nationality: str = "Indian"
    type: str = "adult"
    specialRequests: str = ""

class ContactInfo(BaseModel):
    email: EmailStr
    phone: str
    countryCode: str = "+91"

class Flight(BaseModel):
    airline: str
    flightNumber: str
    origin: str
    destination: str
    departure: Dict[str, Any]
    arrival: Dict[str, Any]
    duration: str
    date: str
    aircraft: Optional[str] = None

class SelectedFare(BaseModel):
    id: str
    name: str
    type: str
    price: float
    features: Dict[str, str]

class Payment(BaseModel):
    id: str
    orderId: str
    signature: str
    amount: float
    currency: str = "INR"
    status: str = "completed"
    method: str = "razorpay"
    timestamp: str

class BookingRequest(BaseModel):
    bookingReference: str
    flight: Flight
    selectedFare: SelectedFare
    passengers: List[Passenger]
    contactInfo: ContactInfo
    payment: Payment
    finalPrice: float
    promo: Optional[Dict[str, Any]] = None

class BookingResponse(BaseModel):
    success: bool
    message: str
    bookingId: str
    bookingReference: str

@router.post("/create", response_model=BookingResponse)
async def create_booking(booking: BookingRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Create a new flight booking"""
    try:
        # Check if user exists, create if not
        user = db.query(User).filter(User.email == booking.contactInfo.email).first()
        if not user:
            user = User(
                email=booking.contactInfo.email,
                phone=booking.contactInfo.phone,
                country_code=booking.contactInfo.countryCode
            )
            db.add(user)
            db.flush()  # To get the user ID
        
        # Create booking document
        new_booking = Booking(
            booking_reference=booking.bookingReference,
            user_id=user.id,
            status="confirmed",
            booking_type="flight",
            
            # Flight details
            flight_details=booking.flight.dict(),
            selected_fare=booking.selectedFare.dict(),
            
            # Passenger details
            passengers=[p.dict() for p in booking.passengers],
            contact_info=booking.contactInfo.dict(),
            
            # Payment details
            payment_details=booking.payment.dict(),
            base_price=booking.selectedFare.price,
            final_price=booking.finalPrice,
            promo=booking.promo,
            
            # Additional metadata
            source="website",
            passenger_count=len(booking.passengers)
        )
        
        # Save to database
        db.add(new_booking)
        db.commit()
        
        # Send confirmation email in background
        background_tasks.add_task(
            send_booking_confirmation_email,
            booking
        )
        
        return BookingResponse(
            success=True,
            message="Booking confirmed successfully",
            bookingId=new_booking.id,
            bookingReference=booking.bookingReference
        )
            
    except Exception as e:
        print(f"Error creating booking: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/details/{booking_reference}")
async def get_booking_details(booking_reference: str, db: Session = Depends(get_db)):
    """Get booking details by reference number"""
    try:
        booking = db.query(Booking).filter(Booking.booking_reference == booking_reference).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        booking_dict = {
            "id": booking.id,
            "booking_reference": booking.booking_reference,
            "status": booking.status,
            "booking_type": booking.booking_type,
            "flight_details": booking.flight_details,
            "hotel_details": booking.hotel_details,
            "package_details": booking.package_details,
            "selected_fare": booking.selected_fare,
            "base_price": booking.base_price,
            "taxes": booking.taxes,
            "convenience_fee": booking.convenience_fee,
            "final_price": booking.final_price,
            "passengers": booking.passengers,
            "contact_info": booking.contact_info,
            "payment_details": booking.payment_details,
            "source": booking.source,
            "passenger_count": booking.passenger_count,
            "promo": booking.promo,
            "created_at": booking.created_at.isoformat() if booking.created_at else None,
            "updated_at": booking.updated_at.isoformat() if booking.updated_at else None
        }
        
        return {"booking": booking_dict, "success": True}
    except Exception as e:
        print(f"Error getting booking details: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/user/{email}")
async def get_user_bookings(email: str, limit: int = 10, db: Session = Depends(get_db)):
    """Get all bookings for a user by email"""
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return {"bookings": [], "count": 0, "success": True}
        
        bookings = db.query(Booking).filter(Booking.user_id == user.id).order_by(Booking.created_at.desc()).limit(limit).all()
        
        bookings_list = []
        for booking in bookings:
            booking_dict = {
                "id": booking.id,
                "booking_reference": booking.booking_reference,
                "status": booking.status,
                "booking_type": booking.booking_type,
                "final_price": booking.final_price,
                "created_at": booking.created_at.isoformat() if booking.created_at else None
            }
            bookings_list.append(booking_dict)
        
        return {"bookings": bookings_list, "count": len(bookings_list), "success": True}
    except Exception as e:
        print(f"Error getting user bookings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/analytics")
async def get_booking_analytics(db: Session = Depends(get_db)):
    """Get booking analytics (admin use)"""
    try:
        # Total bookings
        total_bookings = db.query(Booking).count()
        
        # Total revenue
        bookings = db.query(Booking).all()
        total_revenue = sum(booking.final_price or 0 for booking in bookings)
        
        # Popular routes (from flight details)
        routes = {}
        for booking in bookings:
            if booking.flight_details:
                origin = booking.flight_details.get("origin", "Unknown")
                destination = booking.flight_details.get("destination", "Unknown")
                route_key = f"{origin}-{destination}"
                routes[route_key] = routes.get(route_key, 0) + 1
        
        popular_routes = [{"_id": k, "count": v} for k, v in sorted(routes.items(), key=lambda x: x[1], reverse=True)][:10]
        
        # Bookings by date (last 7 days)
        from datetime import datetime, timedelta
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_bookings = db.query(Booking).filter(Booking.created_at >= seven_days_ago).all()
        
        daily_bookings = {}
        for booking in recent_bookings:
            if booking.created_at:
                date_key = booking.created_at.strftime("%Y-%m-%d")
                daily_bookings[date_key] = daily_bookings.get(date_key, 0) + 1
        
        daily_bookings_list = [{"_id": k, "count": v} for k, v in sorted(daily_bookings.items())]
        
        return {
            "totalBookings": total_bookings,
            "totalRevenue": total_revenue,
            "popularRoutes": popular_routes,
            "dailyBookings": daily_bookings_list,
            "success": True
        }
    except Exception as e:
        print(f"Error getting booking analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def send_booking_confirmation_email(booking: BookingRequest):
    """Send booking confirmation email to customer"""
    try:
        passenger_names = ", ".join([f"{p.title} {p.firstName} {p.lastName}" for p in booking.passengers])
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">✈️ Booking Confirmed!</h1>
                    <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your TourSmile flight is booked</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 40px; border-radius: 0 0 10px 10px;">
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h2 style="color: #333; margin-top: 0;">Booking Reference</h2>
                        <div style="font-size: 24px; font-weight: bold; color: #3B82F6; letter-spacing: 2px;">
                            {booking.bookingReference}
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Flight Details</h3>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin: 15px 0;">
                            <div>
                                <div style="font-size: 18px; font-weight: bold;">{booking.flight.departure.get('time', 'N/A')}</div>
                                <div style="color: #666;">{booking.flight.origin}</div>
                            </div>
                            <div style="text-align: center; color: #3B82F6;">
                                <div>✈️</div>
                                <div style="font-size: 12px;">{booking.flight.duration}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 18px; font-weight: bold;">{booking.flight.arrival.get('time', 'N/A')}</div>
                                <div style="color: #666;">{booking.flight.destination}</div>
                            </div>
                        </div>
                        <div style="text-align: center; color: #666; border-top: 1px solid #eee; padding-top: 15px;">
                            <strong>{booking.flight.airline} {booking.flight.flightNumber}</strong> • {booking.flight.date}
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Passengers</h3>
                        <p style="color: #666;">{passenger_names}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Payment Summary</h3>
                        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #3B82F6;">
                            <span>Total Paid:</span>
                            <span>₹{booking.finalPrice:,.0f}</span>
                        </div>
                        <div style="font-size: 12px; color: #666; margin-top: 5px;">
                            Payment ID: {booking.payment.id}
                        </div>
                    </div>
                    
                    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196F3;">
                        <h4 style="margin: 0 0 10px 0; color: #1976d2;">Important Reminders:</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #1976d2; font-size: 14px;">
                            <li>Check-in online 24 hours before departure</li>
                            <li>Carry valid government-issued photo ID</li>
                            <li>Arrive at airport 2 hours before domestic flights</li>
                            <li>Download your e-ticket from the booking confirmation</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #666;">Need help? Contact us at <strong>support@toursmile.com</strong></p>
                        <p style="color: #666; font-size: 14px;">Thank you for choosing TourSmile. Safe travels! ✈️</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return email_service.send_email(
            booking.contactInfo.email,
            f"Flight Booking Confirmed - {booking.bookingReference}",
            html_content
        )
        
    except Exception as e:
        print(f"Error sending booking confirmation email: {e}")
        return False