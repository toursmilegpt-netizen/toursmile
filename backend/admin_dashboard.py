"""
Admin Dashboard Routes
Analytics, booking management, and customer profiles
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, date
import logging

from database import get_db, Booking, User, Waitlist
from admin_auth import get_current_admin, AdminUser

router = APIRouter(prefix="/admin/dashboard")

# Pydantic models for dashboard responses
class DashboardStats(BaseModel):
    total_bookings: int
    total_revenue: float
    total_customers: int
    bookings_today: int
    revenue_today: float
    bookings_this_month: int
    revenue_this_month: float
    conversion_rate: float

class BookingOverview(BaseModel):
    booking_reference: str
    customer_name: str
    customer_email: str
    booking_type: str
    total_amount: float
    status: str
    created_at: str
    payment_status: str

class CustomerProfile(BaseModel):
    customer_id: str
    email: str
    phone: str
    full_name: str
    total_bookings: int
    total_spent: float
    last_booking: Optional[str] = None
    is_verified: bool
    created_at: str

class RevenueAnalytics(BaseModel):
    period: str
    revenue: float
    bookings: int
    average_booking_value: float

@router.get("/stats")
async def get_dashboard_stats(current_admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Get main dashboard statistics"""
    try:
        today = date.today()
        this_month = date(today.year, today.month, 1)
        
        # Total statistics
        total_bookings = db.query(Booking).count()
        total_revenue = db.query(func.sum(Booking.final_price)).scalar() or 0.0
        total_customers = db.query(User).count()
        total_waitlist = db.query(Waitlist).count()
        
        # Today's statistics
        bookings_today = db.query(Booking).filter(
            func.date(Booking.created_at) == today
        ).count()
        
        revenue_today = db.query(func.sum(Booking.final_price)).filter(
            func.date(Booking.created_at) == today
        ).scalar() or 0.0
        
        # This month's statistics
        bookings_this_month = db.query(Booking).filter(
            Booking.created_at >= this_month
        ).count()
        
        revenue_this_month = db.query(func.sum(Booking.final_price)).filter(
            Booking.created_at >= this_month
        ).scalar() or 0.0
        
        # Conversion rate (bookings / total customers if customers exist)
        conversion_rate = (total_bookings / total_customers * 100) if total_customers > 0 else 0.0
        
        # Top destinations (from flight and hotel bookings)
        top_destinations = []
        try:
            # Flight destinations
            flight_destinations = db.query(
                Booking.flight_details.op('->>')('destination').label('destination'),
                func.count('*').label('count')
            ).filter(
                Booking.booking_type == 'flight',
                Booking.flight_details.isnot(None)
            ).group_by(
                Booking.flight_details.op('->>')('destination')
            ).order_by(desc('count')).limit(5).all()
            
            for dest in flight_destinations:
                if dest.destination:
                    top_destinations.append({
                        'destination': dest.destination,
                        'bookings': dest.count,
                        'type': 'flight'
                    })
        except Exception as e:
            logging.warning(f"Error getting flight destinations: {e}")
        
        # Recent bookings (last 10)
        recent_bookings = db.query(Booking).order_by(desc(Booking.created_at)).limit(10).all()
        recent_bookings_data = []
        
        for booking in recent_bookings:
            customer_name = "Unknown"
            customer_email = ""
            
            if booking.contact_info:
                customer_name = f"{booking.contact_info.get('first_name', '')} {booking.contact_info.get('last_name', '')}".strip()
                customer_email = booking.contact_info.get('email', '')
            
            recent_bookings_data.append({
                'booking_reference': booking.booking_reference,
                'customer_name': customer_name or "Unknown",
                'customer_email': customer_email,
                'booking_type': booking.booking_type,
                'total_amount': booking.final_price or 0.0,
                'status': booking.status,
                'created_at': booking.created_at.isoformat() if booking.created_at else '',
                'payment_status': booking.payment_details.get('payment_status', 'unknown') if booking.payment_details else 'unknown'
            })
        
        return {
            "success": True,
            "stats": {
                "total_bookings": total_bookings,
                "total_revenue": float(total_revenue),
                "total_customers": total_customers,
                "total_waitlist": total_waitlist,
                "bookings_today": bookings_today,
                "revenue_today": float(revenue_today),
                "bookings_this_month": bookings_this_month,
                "revenue_this_month": float(revenue_this_month),
                "conversion_rate": round(conversion_rate, 2)
            },
            "top_destinations": top_destinations,
            "recent_bookings": recent_bookings_data
        }
        
    except Exception as e:
        logging.error(f"Dashboard stats error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard statistics")

@router.get("/bookings")
async def get_all_bookings(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    booking_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all bookings with filtering and pagination"""
    try:
        query = db.query(Booking)
        
        # Apply filters
        if status:
            query = query.filter(Booking.status == status)
        
        if booking_type:
            query = query.filter(Booking.booking_type == booking_type)
        
        if search:
            # Search in booking reference, customer name, or email
            search_filter = or_(
                Booking.booking_reference.ilike(f"%{search}%"),
                Booking.contact_info.op('->>')('email').ilike(f"%{search}%"),
                Booking.contact_info.op('->>')('first_name').ilike(f"%{search}%"),
                Booking.contact_info.op('->>')('last_name').ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        # Get total count for pagination
        total_bookings = query.count()
        
        # Apply pagination and ordering
        bookings = query.order_by(desc(Booking.created_at)).offset((page - 1) * limit).limit(limit).all()
        
        # Format booking data
        booking_list = []
        for booking in bookings:
            customer_name = "Unknown"
            customer_email = ""
            
            if booking.contact_info:
                customer_name = f"{booking.contact_info.get('first_name', '')} {booking.contact_info.get('last_name', '')}".strip()
                customer_email = booking.contact_info.get('email', '')
            
            booking_data = {
                'id': booking.id,
                'booking_reference': booking.booking_reference,
                'customer_name': customer_name or "Unknown",
                'customer_email': customer_email,
                'booking_type': booking.booking_type,
                'status': booking.status,
                'base_price': booking.base_price or 0.0,
                'taxes': booking.taxes or 0.0,
                'convenience_fee': booking.convenience_fee or 0.0,
                'final_price': booking.final_price or 0.0,
                'passenger_count': booking.passenger_count or 0,
                'source': booking.source,
                'created_at': booking.created_at.isoformat() if booking.created_at else '',
                'updated_at': booking.updated_at.isoformat() if booking.updated_at else '',
                'payment_status': booking.payment_details.get('payment_status', 'unknown') if booking.payment_details else 'unknown'
            }
            
            booking_list.append(booking_data)
        
        return {
            "success": True,
            "bookings": booking_list,
            "pagination": {
                "current_page": page,
                "per_page": limit,
                "total_bookings": total_bookings,
                "total_pages": (total_bookings + limit - 1) // limit
            },
            "filters": {
                "status": status,
                "booking_type": booking_type,
                "search": search
            }
        }
        
    except Exception as e:
        logging.error(f"Get bookings error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch bookings")

@router.get("/bookings/{booking_reference}")
async def get_booking_details(
    booking_reference: str,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get detailed booking information"""
    try:
        booking = db.query(Booking).filter(Booking.booking_reference == booking_reference).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Get customer information
        customer = None
        if booking.user_id:
            customer = db.query(User).filter(User.id == booking.user_id).first()
        
        booking_details = {
            'id': booking.id,
            'booking_reference': booking.booking_reference,
            'status': booking.status,
            'booking_type': booking.booking_type,
            'user_id': booking.user_id,
            'flight_details': booking.flight_details,
            'hotel_details': booking.hotel_details,
            'package_details': booking.package_details,
            'selected_fare': booking.selected_fare,
            'base_price': booking.base_price,
            'taxes': booking.taxes,
            'convenience_fee': booking.convenience_fee,
            'final_price': booking.final_price,
            'passengers': booking.passengers,
            'contact_info': booking.contact_info,
            'payment_details': booking.payment_details,
            'source': booking.source,
            'passenger_count': booking.passenger_count,
            'promo': booking.promo,
            'created_at': booking.created_at.isoformat() if booking.created_at else None,
            'updated_at': booking.updated_at.isoformat() if booking.updated_at else None,
            'customer': {
                'id': customer.id if customer else None,
                'email': customer.email if customer else None,
                'phone': customer.phone if customer else None,
                'full_name': f"{customer.first_name} {customer.last_name}".strip() if customer and customer.first_name else None,
                'is_verified': customer.is_verified if customer else None,
                'created_at': customer.created_at.isoformat() if customer and customer.created_at else None
            } if customer else None
        }
        
        return {
            "success": True,
            "booking": booking_details
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get booking details error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch booking details")

@router.put("/bookings/{booking_reference}/status")
async def update_booking_status(
    booking_reference: str,
    new_status: str,
    reason: Optional[str] = None,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update booking status"""
    try:
        valid_statuses = ['confirmed', 'cancelled', 'pending', 'completed', 'refunded']
        if new_status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        booking = db.query(Booking).filter(Booking.booking_reference == booking_reference).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        old_status = booking.status
        booking.status = new_status
        booking.updated_at = datetime.utcnow()
        
        # Add admin action to booking details
        if not booking.payment_details:
            booking.payment_details = {}
        
        if 'admin_actions' not in booking.payment_details:
            booking.payment_details['admin_actions'] = []
        
        booking.payment_details['admin_actions'].append({
            'action': 'status_change',
            'old_status': old_status,
            'new_status': new_status,
            'reason': reason,
            'admin_id': current_admin.id,
            'admin_username': current_admin.username,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Booking status updated from '{old_status}' to '{new_status}'",
            "booking_reference": booking_reference,
            "old_status": old_status,
            "new_status": new_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Update booking status error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update booking status")

@router.get("/customers")
async def get_all_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all customers with their booking history"""
    try:
        query = db.query(User)
        
        # Apply search filter
        if search:
            search_filter = or_(
                User.email.ilike(f"%{search}%"),
                User.phone.ilike(f"%{search}%"),
                User.first_name.ilike(f"%{search}%"),
                User.last_name.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        # Get total count for pagination
        total_customers = query.count()
        
        # Apply pagination
        customers = query.order_by(desc(User.created_at)).offset((page - 1) * limit).limit(limit).all()
        
        # Format customer data with booking statistics
        customer_list = []
        for customer in customers:
            # Get customer's booking statistics
            customer_bookings = db.query(Booking).filter(Booking.user_id == customer.id).all()
            
            total_bookings = len(customer_bookings)
            total_spent = sum(booking.final_price or 0 for booking in customer_bookings)
            last_booking_date = max((booking.created_at for booking in customer_bookings), default=None)
            
            customer_data = {
                'id': customer.id,
                'email': customer.email,
                'phone': customer.phone,
                'country_code': customer.country_code,
                'full_name': f"{customer.first_name or ''} {customer.last_name or ''}".strip() or "Unknown",
                'is_verified': customer.is_verified,
                'total_bookings': total_bookings,
                'total_spent': total_spent,
                'last_booking': last_booking_date.isoformat() if last_booking_date else None,
                'created_at': customer.created_at.isoformat() if customer.created_at else None,
                'updated_at': customer.updated_at.isoformat() if customer.updated_at else None
            }
            
            customer_list.append(customer_data)
        
        return {
            "success": True,
            "customers": customer_list,
            "pagination": {
                "current_page": page,
                "per_page": limit,
                "total_customers": total_customers,
                "total_pages": (total_customers + limit - 1) // limit
            },
            "search": search
        }
        
    except Exception as e:
        logging.error(f"Get customers error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch customers")

@router.get("/customers/{customer_id}")
async def get_customer_profile(
    customer_id: str,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get detailed customer profile with booking history"""
    try:
        customer = db.query(User).filter(User.id == customer_id).first()
        
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get customer's bookings
        bookings = db.query(Booking).filter(Booking.user_id == customer_id).order_by(desc(Booking.created_at)).all()
        
        # Format booking history
        booking_history = []
        total_spent = 0.0
        
        for booking in bookings:
            total_spent += booking.final_price or 0
            booking_history.append({
                'booking_reference': booking.booking_reference,
                'booking_type': booking.booking_type,
                'status': booking.status,
                'final_price': booking.final_price,
                'created_at': booking.created_at.isoformat() if booking.created_at else None,
                'payment_status': booking.payment_details.get('payment_status', 'unknown') if booking.payment_details else 'unknown'
            })
        
        customer_profile = {
            'id': customer.id,
            'email': customer.email,
            'phone': customer.phone,
            'country_code': customer.country_code,
            'first_name': customer.first_name,
            'last_name': customer.last_name,
            'full_name': f"{customer.first_name or ''} {customer.last_name or ''}".strip() or "Unknown",
            'is_verified': customer.is_verified,
            'created_at': customer.created_at.isoformat() if customer.created_at else None,
            'updated_at': customer.updated_at.isoformat() if customer.updated_at else None,
            'booking_statistics': {
                'total_bookings': len(bookings),
                'total_spent': total_spent,
                'average_booking_value': total_spent / len(bookings) if bookings else 0,
                'last_booking_date': bookings[0].created_at.isoformat() if bookings else None
            },
            'booking_history': booking_history
        }
        
        return {
            "success": True,
            "customer": customer_profile
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get customer profile error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch customer profile")

@router.get("/analytics/revenue")
async def get_revenue_analytics(
    period: str = Query("monthly", regex="^(daily|weekly|monthly)$"),
    days: int = Query(30, ge=1, le=365),
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get revenue analytics for different periods"""
    try:
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days)
        
        analytics_data = []
        
        if period == "daily":
            # Group by day
            for i in range(days):
                day = start_date + timedelta(days=i)
                
                daily_bookings = db.query(Booking).filter(
                    func.date(Booking.created_at) == day
                ).all()
                
                daily_revenue = sum(booking.final_price or 0 for booking in daily_bookings)
                booking_count = len(daily_bookings)
                
                analytics_data.append({
                    'period': day.isoformat(),
                    'revenue': daily_revenue,
                    'bookings': booking_count,
                    'average_booking_value': daily_revenue / booking_count if booking_count > 0 else 0
                })
        
        elif period == "weekly":
            # Group by week
            current_date = start_date
            while current_date <= end_date:
                week_end = min(current_date + timedelta(days=6), end_date)
                
                weekly_bookings = db.query(Booking).filter(
                    and_(
                        func.date(Booking.created_at) >= current_date,
                        func.date(Booking.created_at) <= week_end
                    )
                ).all()
                
                weekly_revenue = sum(booking.final_price or 0 for booking in weekly_bookings)
                booking_count = len(weekly_bookings)
                
                analytics_data.append({
                    'period': f"{current_date.isoformat()} to {week_end.isoformat()}",
                    'revenue': weekly_revenue,
                    'bookings': booking_count,
                    'average_booking_value': weekly_revenue / booking_count if booking_count > 0 else 0
                })
                
                current_date += timedelta(days=7)
        
        else:  # monthly
            # Group by month
            current_date = start_date.replace(day=1)
            while current_date <= end_date:
                # Get last day of month
                if current_date.month == 12:
                    next_month = current_date.replace(year=current_date.year + 1, month=1)
                else:
                    next_month = current_date.replace(month=current_date.month + 1)
                
                month_end = next_month - timedelta(days=1)
                month_end = min(month_end, end_date)
                
                monthly_bookings = db.query(Booking).filter(
                    and_(
                        func.date(Booking.created_at) >= current_date,
                        func.date(Booking.created_at) <= month_end
                    )
                ).all()
                
                monthly_revenue = sum(booking.final_price or 0 for booking in monthly_bookings)
                booking_count = len(monthly_bookings)
                
                analytics_data.append({
                    'period': current_date.strftime("%Y-%m"),
                    'revenue': monthly_revenue,
                    'bookings': booking_count,
                    'average_booking_value': monthly_revenue / booking_count if booking_count > 0 else 0
                })
                
                if current_date.month == 12:
                    current_date = current_date.replace(year=current_date.year + 1, month=1)
                else:
                    current_date = current_date.replace(month=current_date.month + 1)
        
        return {
            "success": True,
            "analytics": analytics_data,
            "period": period,
            "date_range": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            }
        }
        
    except Exception as e:
        logging.error(f"Revenue analytics error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch revenue analytics")