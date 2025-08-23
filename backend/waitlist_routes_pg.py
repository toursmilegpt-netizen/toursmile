from fastapi import APIRouter, HTTPException, BackgroundTasks, Request, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime
import os
import uuid
import requests
from email_service import email_service
from database import get_db, get_redis, Waitlist

router = APIRouter(prefix="/waitlist")

class WaitlistSubscription(BaseModel):
    email: EmailStr
    source: str = "website"

class WaitlistResponse(BaseModel):
    message: str
    success: bool

def get_location_from_ip(ip_address: str):
    """Get location information from IP address using free ipapi.co service"""
    try:
        # Skip localhost and private IPs
        if ip_address in ['127.0.0.1', 'localhost'] or ip_address.startswith('192.168.') or ip_address.startswith('10.'):
            return {
                "city": "Local Development",
                "country": "Local",
                "region": "Dev Environment",
                "timezone": "Local"
            }
        
        # Use free ipapi.co service (1000 requests/day free)
        response = requests.get(f"https://ipapi.co/{ip_address}/json/", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "city": data.get("city", "Unknown"),
                "country": data.get("country_name", "Unknown"),
                "region": data.get("region", "Unknown"), 
                "timezone": data.get("timezone", "Unknown"),
                "country_code": data.get("country_code", "Unknown")
            }
    except Exception as e:
        print(f"Location lookup failed for {ip_address}: {e}")
    
    # Fallback if service fails
    return {
        "city": "Unknown",
        "country": "Unknown", 
        "region": "Unknown",
        "timezone": "Unknown"
    }

def get_client_ip(request: Request):
    """Extract client IP address from request headers"""
    # Check for forwarded IP first (common in production behind proxy/CDN)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can contain multiple IPs, take the first one
        return forwarded_for.split(",")[0].strip()
    
    # Check for real IP header (some proxy configurations)
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    
    # Fall back to client host
    return request.client.host

@router.post("/subscribe", response_model=WaitlistResponse)
async def subscribe_to_waitlist(subscription: WaitlistSubscription, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Subscribe to waitlist with email notifications and location tracking"""
    try:
        # Get client IP and location
        client_ip = get_client_ip(request)
        location_info = get_location_from_ip(client_ip)
        
        print(f"📍 New subscription from IP: {client_ip}")
        print(f"📍 Location: {location_info['city']}, {location_info['country']}")
        
        # Check if email already exists
        existing = db.query(Waitlist).filter(Waitlist.email == subscription.email).first()
        if existing:
            # Send notification for duplicate attempt (still valuable info)
            background_tasks.add_task(
                email_service.send_waitlist_notification,
                subscription.email,
                f"{subscription.source} (duplicate attempt)",
                location_info,
                client_ip
            )
            return WaitlistResponse(
                message="You're already on our waitlist! We'll notify you when we launch.",
                success=True
            )
        
        # Create new subscription with location data
        new_subscriber = Waitlist(
            email=subscription.email,
            source=subscription.source,
            timestamp=datetime.utcnow().isoformat(),
            ip_address=client_ip,
            location=location_info,
            user_agent=request.headers.get("User-Agent", "Unknown")
        )
        
        # Save to database
        db.add(new_subscriber)
        db.commit()
        
        # Send notifications in background with location info
        background_tasks.add_task(
            email_service.send_waitlist_notification,
            subscription.email,
            subscription.source,
            location_info,
            client_ip
        )
        
        # Optional: Send welcome email to subscriber
        background_tasks.add_task(
            email_service.send_welcome_email,
            subscription.email
        )
        
        return WaitlistResponse(
            message="🎉 Welcome to TourSmile waitlist! You'll be notified when we launch.",
            success=True
        )
            
    except Exception as e:
        print(f"Error in waitlist subscription: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/count")
async def get_waitlist_count(db: Session = Depends(get_db)):
    """Get total number of waitlist subscribers"""
    try:
        count = db.query(Waitlist).count()
        return {"count": count, "success": True}
    except Exception as e:
        print(f"Error getting waitlist count: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/recent")
async def get_recent_subscribers(limit: int = 10, db: Session = Depends(get_db)):
    """Get recent waitlist subscribers with location info (for admin use)"""
    try:
        subscribers = db.query(Waitlist).order_by(Waitlist.created_at.desc()).limit(limit).all()
        
        # Convert to dict for response
        subscribers_list = []
        for subscriber in subscribers:
            subscriber_dict = {
                "id": subscriber.id,
                "email": subscriber.email,
                "source": subscriber.source,
                "timestamp": subscriber.timestamp,
                "created_at": subscriber.created_at.isoformat() if subscriber.created_at else None,
                "ip_address": subscriber.ip_address,
                "location": subscriber.location,
                "user_agent": subscriber.user_agent
            }
            subscribers_list.append(subscriber_dict)
            
        return {"subscribers": subscribers_list, "success": True}
    except Exception as e:
        print(f"Error getting recent subscribers: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/analytics")
async def get_waitlist_analytics(db: Session = Depends(get_db)):
    """Get waitlist analytics with location breakdown"""
    try:
        # Total count
        total_count = db.query(Waitlist).count()
        
        # Get all subscribers for analytics (we'll process in Python since complex aggregations are easier here)
        all_subscribers = db.query(Waitlist).all()
        
        # Country breakdown
        countries = {}
        cities = {}
        sources = {}
        
        for sub in all_subscribers:
            if sub.location and isinstance(sub.location, dict):
                country = sub.location.get("country", "Unknown")
                city = sub.location.get("city", "Unknown")
                
                countries[country] = countries.get(country, 0) + 1
                cities[f"{city}, {country}"] = cities.get(f"{city}, {country}", 0) + 1
            
            source = sub.source or "Unknown"
            sources[source] = sources.get(source, 0) + 1
        
        # Convert to list format
        countries_list = [{"_id": k, "count": v} for k, v in sorted(countries.items(), key=lambda x: x[1], reverse=True)]
        cities_list = [{"_id": k, "count": v} for k, v in sorted(cities.items(), key=lambda x: x[1], reverse=True)]
        sources_list = [{"_id": k, "count": v} for k, v in sorted(sources.items(), key=lambda x: x[1], reverse=True)]
        
        return {
            "total_subscribers": total_count,
            "top_countries": countries_list[:10],
            "top_cities": cities_list[:10], 
            "sources": sources_list,
            "success": True
        }
    except Exception as e:
        print(f"Error getting waitlist analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")