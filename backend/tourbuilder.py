"""
TourBuilder - Automatic Flight + Hotel Package Generator
Creates intelligent travel packages with transparent pricing and duration filters
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import logging

from database import get_db, get_redis, Package, Booking
from tripjack_flight_api import tripjack_flight_service
from tripjack_hotel_api import tripjack_hotel_service

router = APIRouter(prefix="/tourbuilder")

class PackageRequest(BaseModel):
    """Request model for package search"""
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    adults: int = 1
    children: int = 0
    infants: int = 0
    room_count: int = 1
    budget_tier: str = "economy"  # economy, premium, luxury
    duration_preference: Optional[str] = None  # 2N3D, 3N4D, etc.

class PackageComponent(BaseModel):
    """Individual component of a package (flight/hotel)"""
    type: str  # flight, hotel
    details: Dict[str, Any]
    base_price: float
    taxes: float
    total_price: float

class PackageOffer(BaseModel):
    """Complete package offer"""
    package_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    destination: str
    duration_nights: int
    duration_days: int
    budget_tier: str
    
    # Components
    outbound_flight: Optional[PackageComponent] = None
    return_flight: Optional[PackageComponent] = None
    hotel: PackageComponent
    
    # Pricing breakdown
    base_price: float
    taxes: float
    convenience_fee: float
    total_price: float
    price_per_person: float
    savings_amount: float = 0  # Savings compared to individual booking
    
    # Package details
    highlights: List[str] = []
    inclusions: List[str] = []
    exclusions: List[str] = []
    
    # Metadata
    validity_hours: int = 24  # Package price valid for 24 hours
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class PackageSearchResponse(BaseModel):
    """Response for package search"""
    success: bool
    packages: List[PackageOffer]
    search_id: str
    total_packages: int
    filters: Dict[str, Any]

class PackageBookingRequest(BaseModel):
    """Request to book a package"""
    package_id: str
    passengers: List[Dict[str, Any]]
    contact_info: Dict[str, str]
    payment_details: Dict[str, Any]

def calculate_duration(departure_date: str, return_date: Optional[str] = None) -> tuple:
    """Calculate nights and days for package duration"""
    try:
        dep_date = datetime.strptime(departure_date, '%Y-%m-%d')
        
        if return_date:
            ret_date = datetime.strptime(return_date, '%Y-%m-%d')
            nights = (ret_date - dep_date).days
            days = nights + 1
        else:
            # Default to 2N3D for one-way
            nights = 2
            days = 3
            
        return nights, days
    except:
        return 2, 3  # Default fallback

def calculate_pricing_breakdown(components: List[PackageComponent], adults: int, budget_tier: str) -> Dict[str, float]:
    """Calculate transparent pricing breakdown"""
    base_total = sum(comp.base_price for comp in components)
    taxes_total = sum(comp.taxes for comp in components)
    
    # Convenience fee based on budget tier
    convenience_rates = {
        "economy": 0.02,    # 2%
        "premium": 0.015,   # 1.5%
        "luxury": 0.01      # 1%
    }
    
    convenience_fee = base_total * convenience_rates.get(budget_tier, 0.02)
    total_price = base_total + taxes_total + convenience_fee
    price_per_person = total_price / adults
    
    return {
        "base_price": base_total,
        "taxes": taxes_total,
        "convenience_fee": convenience_fee,
        "total_price": total_price,
        "price_per_person": price_per_person
    }

def generate_package_highlights(destination: str, nights: int, budget_tier: str) -> List[str]:
    """Generate package highlights based on destination and tier"""
    base_highlights = [
        f"{nights} nights accommodation in {destination}",
        "Round-trip flights included",
        "24/7 customer support",
        "Flexible cancellation policy"
    ]
    
    tier_highlights = {
        "economy": ["Budget-friendly accommodation", "Essential amenities"],
        "premium": ["4-star accommodation", "Complimentary breakfast", "Airport transfers"],
        "luxury": ["5-star luxury accommodation", "Premium amenities", "Concierge services", "Welcome drinks"]
    }
    
    return base_highlights + tier_highlights.get(budget_tier, [])

def generate_inclusions_exclusions(budget_tier: str) -> tuple:
    """Generate what's included and excluded in the package"""
    base_inclusions = [
        "Round-trip flights",
        "Hotel accommodation",
        "All taxes and fees",
        "24/7 support"
    ]
    
    tier_inclusions = {
        "economy": ["Standard room accommodation"],
        "premium": ["Deluxe room accommodation", "Daily breakfast", "Airport transfers"],
        "luxury": ["Suite accommodation", "All meals", "Airport transfers", "Local sightseeing"]
    }
    
    inclusions = base_inclusions + tier_inclusions.get(budget_tier, [])
    
    exclusions = [
        "Travel insurance",
        "Visa fees",
        "Personal expenses",
        "Tips and gratuities"
    ]
    
    if budget_tier == "economy":
        exclusions.extend(["Meals", "Airport transfers", "Local transportation"])
    
    return inclusions, exclusions

@router.post("/search", response_model=PackageSearchResponse)
async def search_packages(request: PackageRequest, db: Session = Depends(get_db)):
    """Search for flight + hotel packages with intelligent pricing"""
    try:
        search_id = str(uuid.uuid4())
        nights, days = calculate_duration(request.departure_date, request.return_date)
        
        # Search flights
        flight_results = []
        try:
            # Search outbound flights
            outbound_flights = await tripjack_flight_service.search_flights(
                origin=request.origin,
                destination=request.destination,
                departure_date=request.departure_date,
                passengers=request.adults + request.children,
                cabin_class="economy" if request.budget_tier == "economy" else "business"
            )
            
            # Search return flights if needed
            return_flights = []
            if request.return_date:
                return_flights = await tripjack_flight_service.search_flights(
                    origin=request.destination,
                    destination=request.origin,
                    departure_date=request.return_date,
                    passengers=request.adults + request.children,
                    cabin_class="economy" if request.budget_tier == "economy" else "business"
                )
            
            flight_results = {"outbound": outbound_flights[:5], "return": return_flights[:5]}
            
        except Exception as e:
            logging.error(f"Flight search failed: {e}")
            flight_results = {"outbound": [], "return": []}
        
        # Search hotels
        hotel_results = []
        try:
            check_in = datetime.strptime(request.departure_date, '%Y-%m-%d')
            check_out = check_in + timedelta(days=nights)
            
            hotels = await tripjack_hotel_service.search_hotels(
                destination=request.destination,
                check_in=check_in.strftime('%Y-%m-%d'),
                check_out=check_out.strftime('%Y-%m-%d'),
                rooms=request.room_count,
                adults=request.adults,
                children=request.children
            )
            
            # Filter by budget tier
            star_filters = {
                "economy": [2, 3],
                "premium": [3, 4],
                "luxury": [4, 5]
            }
            
            budget_stars = star_filters.get(request.budget_tier, [2, 3, 4])
            hotel_results = [h for h in hotels if h.get("star_rating", 3) in budget_stars][:3]
            
        except Exception as e:
            logging.error(f"Hotel search failed: {e}")
            hotel_results = []
        
        # Generate packages by combining flights and hotels
        packages = []
        
        for hotel in hotel_results[:3]:  # Top 3 hotels per tier
            for outbound_flight in (flight_results["outbound"][:2] if flight_results["outbound"] else [{}]):
                components = []
                
                # Add outbound flight component
                if outbound_flight:
                    flight_comp = PackageComponent(
                        type="flight",
                        details=outbound_flight,
                        base_price=outbound_flight.get("price", 5000),
                        taxes=outbound_flight.get("price", 5000) * 0.12,
                        total_price=outbound_flight.get("price", 5000) * 1.12
                    )
                    components.append(flight_comp)
                
                # Add return flight component if available
                return_flight_comp = None
                if request.return_date and flight_results["return"]:
                    return_flight = flight_results["return"][0]  # Best return flight
                    return_flight_comp = PackageComponent(
                        type="flight",
                        details=return_flight,
                        base_price=return_flight.get("price", 5000),
                        taxes=return_flight.get("price", 5000) * 0.12,
                        total_price=return_flight.get("price", 5000) * 1.12
                    )
                    components.append(return_flight_comp)
                
                # Add hotel component
                hotel_price_per_night = hotel.get("price_per_night", 3000)
                hotel_base_price = hotel_price_per_night * nights
                hotel_comp = PackageComponent(
                    type="hotel",
                    details=hotel,
                    base_price=hotel_base_price,
                    taxes=hotel_base_price * 0.18,  # GST
                    total_price=hotel_base_price * 1.18
                )
                components.append(hotel_comp)
                
                # Calculate pricing
                pricing = calculate_pricing_breakdown(components, request.adults, request.budget_tier)
                
                # Generate package details
                highlights = generate_package_highlights(request.destination, nights, request.budget_tier)
                inclusions, exclusions = generate_inclusions_exclusions(request.budget_tier)
                
                # Create package offer
                package = PackageOffer(
                    destination=request.destination,
                    duration_nights=nights,
                    duration_days=days,
                    budget_tier=request.budget_tier,
                    outbound_flight=flight_comp if outbound_flight else None,
                    return_flight=return_flight_comp,
                    hotel=hotel_comp,
                    base_price=pricing["base_price"],
                    taxes=pricing["taxes"],
                    convenience_fee=pricing["convenience_fee"],
                    total_price=pricing["total_price"],
                    price_per_person=pricing["price_per_person"],
                    highlights=highlights,
                    inclusions=inclusions,
                    exclusions=exclusions
                )
                
                packages.append(package)
        
        # Sort packages by price
        packages.sort(key=lambda p: p.total_price)
        
        # Apply filters if needed
        if request.duration_preference:
            duration_map = {"2N3D": (2, 3), "3N4D": (3, 4), "4N5D": (4, 5)}
            if request.duration_preference in duration_map:
                target_nights, target_days = duration_map[request.duration_preference]
                packages = [p for p in packages if p.duration_nights == target_nights]
        
        return PackageSearchResponse(
            success=True,
            packages=packages[:6],  # Top 6 packages
            search_id=search_id,
            total_packages=len(packages),
            filters={
                "budget_tiers": ["economy", "premium", "luxury"],
                "duration_options": ["2N3D", "3N4D", "4N5D"],
                "sort_options": ["price_low_to_high", "price_high_to_low", "rating"]
            }
        )
        
    except Exception as e:
        logging.error(f"Package search error: {e}")
        raise HTTPException(status_code=500, detail=f"Package search failed: {str(e)}")

@router.get("/package/{package_id}")
async def get_package_details(package_id: str):
    """Get detailed information about a specific package"""
    try:
        # In production, this would fetch from cache/database
        return {
            "package_id": package_id,
            "message": "Package details will be fetched from cache/database",
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/book")
async def book_package(request: PackageBookingRequest, db: Session = Depends(get_db)):
    """Book a complete package (flights + hotel)"""
    try:
        booking_reference = f"PKG{uuid.uuid4().hex[:8].upper()}"
        
        # Create package booking record
        booking = Booking(
            booking_reference=booking_reference,
            booking_type="package",
            status="confirmed",
            package_details={
                "package_id": request.package_id,
                "components": ["flight", "hotel"],
                "booking_reference": booking_reference
            },
            passengers=request.passengers,
            contact_info=request.contact_info,
            payment_details=request.payment_details,
            source="tourbuilder",
            passenger_count=len(request.passengers)
        )
        
        db.add(booking)
        db.commit()
        
        return {
            "success": True,
            "booking_reference": booking_reference,
            "message": "Package booked successfully",
            "booking_id": booking.id
        }
        
    except Exception as e:
        db.rollback()
        logging.error(f"Package booking error: {e}")
        raise HTTPException(status_code=500, detail=f"Package booking failed: {str(e)}")

@router.get("/popular-destinations")
async def get_popular_destinations():
    """Get popular destinations for package building"""
    popular_destinations = [
        {"code": "GOI", "name": "Goa", "type": "Beach"},
        {"code": "DEL", "name": "Delhi", "type": "Cultural"},
        {"code": "BOM", "name": "Mumbai", "type": "Metropolitan"},
        {"code": "BLR", "name": "Bangalore", "type": "Tech Hub"},
        {"code": "MAA", "name": "Chennai", "type": "Cultural"},
        {"code": "CCU", "name": "Kolkata", "type": "Cultural"},
        {"code": "HYD", "name": "Hyderabad", "type": "Tech Hub"},
        {"code": "AMD", "name": "Ahmedabad", "type": "Business"},
        {"code": "PNQ", "name": "Pune", "type": "Tech Hub"},
        {"code": "JAI", "name": "Jaipur", "type": "Heritage"}
    ]
    
    return {
        "destinations": popular_destinations,
        "success": True
    }

@router.get("/duration-options")
async def get_duration_options():
    """Get available duration options"""
    duration_options = [
        {"code": "2N3D", "name": "2 Nights 3 Days", "nights": 2, "days": 3},
        {"code": "3N4D", "name": "3 Nights 4 Days", "nights": 3, "days": 4},
        {"code": "4N5D", "name": "4 Nights 5 Days", "nights": 4, "days": 5},
        {"code": "5N6D", "name": "5 Nights 6 Days", "nights": 5, "days": 6},
        {"code": "6N7D", "name": "6 Nights 7 Days", "nights": 6, "days": 7}
    ]
    
    return {
        "duration_options": duration_options,
        "success": True
    }

@router.get("/budget-tiers")
async def get_budget_tiers():
    """Get available budget tiers with descriptions"""
    budget_tiers = [
        {
            "code": "economy",
            "name": "Economy",
            "description": "Budget-friendly options with essential amenities",
            "features": ["2-3 star hotels", "Economy flights", "Basic amenities"]
        },
        {
            "code": "premium",
            "name": "Premium",
            "description": "Comfortable mid-range options with good amenities",
            "features": ["3-4 star hotels", "Premium economy flights", "Breakfast included", "Airport transfers"]
        },
        {
            "code": "luxury",
            "name": "Luxury",
            "description": "High-end options with premium amenities",
            "features": ["4-5 star hotels", "Business class flights", "All meals", "Concierge services"]
        }
    ]
    
    return {
        "budget_tiers": budget_tiers,
        "success": True
    }