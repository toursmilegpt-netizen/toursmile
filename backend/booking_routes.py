from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from datetime import datetime
from typing import List, Dict, Any, Optional
import os
import uuid
from email_service import email_service

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URL)
db = client[os.getenv('DB_NAME', 'toursmile')]
bookings_collection = db.bookings

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
async def create_booking(booking: BookingRequest, background_tasks: BackgroundTasks):
    """Create a new flight booking"""
    try:
        # Create booking document
        booking_data = {
            "id": str(uuid.uuid4()),
            "bookingReference": booking.bookingReference,
            "status": "confirmed",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            # Flight details
            "flight": booking.flight.dict(),
            "selectedFare": booking.selectedFare.dict(),
            # Passenger details
            "passengers": [p.dict() for p in booking.passengers],
            "contactInfo": booking.contactInfo.dict(),
            # Payment details
            "payment": booking.payment.dict(),
            "finalPrice": booking.finalPrice,
            "promo": booking.promo,
            # Additional metadata
            "source": "website",
            "passengerCount": len(booking.passengers)
        }
        
        # Save to database
        result = bookings_collection.insert_one(booking_data)
        
        if result.inserted_id:
            # Send confirmation email in background
            background_tasks.add_task(
                send_booking_confirmation_email,
                booking
            )
            
            return BookingResponse(
                success=True,
                message="Booking confirmed successfully",
                bookingId=booking_data["id"],
                bookingReference=booking.bookingReference
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to save booking")
            
    except Exception as e:
        print(f"Error creating booking: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/details/{booking_reference}")
async def get_booking_details(booking_reference: str):
    """Get booking details by reference number"""
    try:
        booking = bookings_collection.find_one({"bookingReference": booking_reference})
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Convert ObjectId to string
        booking["_id"] = str(booking["_id"])
        
        return {"booking": booking, "success": True}
    except Exception as e:
        print(f"Error getting booking details: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/user/{email}")
async def get_user_bookings(email: str, limit: int = 10):
    """Get all bookings for a user by email"""
    try:
        bookings = list(
            bookings_collection.find({"contactInfo.email": email})
            .sort("createdAt", -1)
            .limit(limit)
        )
        
        # Convert ObjectId to string
        for booking in bookings:
            booking["_id"] = str(booking["_id"])
        
        return {"bookings": bookings, "count": len(bookings), "success": True}
    except Exception as e:
        print(f"Error getting user bookings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/analytics")
async def get_booking_analytics():
    """Get booking analytics (admin use)"""
    try:
        # Total bookings
        total_bookings = bookings_collection.count_documents({})
        
        # Revenue calculation
        revenue_pipeline = [
            {"$group": {"_id": None, "totalRevenue": {"$sum": "$finalPrice"}}}
        ]
        revenue_result = list(bookings_collection.aggregate(revenue_pipeline))
        total_revenue = revenue_result[0]["totalRevenue"] if revenue_result else 0
        
        # Popular routes
        routes_pipeline = [
            {"$group": {
                "_id": {"origin": "$flight.origin", "destination": "$flight.destination"}, 
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        popular_routes = list(bookings_collection.aggregate(routes_pipeline))
        
        # Bookings by date (last 7 days)
        date_pipeline = [
            {"$match": {"createdAt": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        daily_bookings = list(bookings_collection.aggregate(date_pipeline))
        
        return {
            "totalBookings": total_bookings,
            "totalRevenue": total_revenue,
            "popularRoutes": popular_routes,
            "dailyBookings": daily_bookings,
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