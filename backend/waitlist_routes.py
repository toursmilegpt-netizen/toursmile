from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from datetime import datetime
import os
import uuid
import requests
from email_service import email_service

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URL)
db = client[os.getenv('DB_NAME', 'toursmile')]
waitlist_collection = db.waitlist

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
async def subscribe_to_waitlist(subscription: WaitlistSubscription, request: Request, background_tasks: BackgroundTasks):
    """Subscribe to waitlist with email notifications and location tracking"""
    try:
        # Get client IP and location
        client_ip = get_client_ip(request)
        location_info = get_location_from_ip(client_ip)
        
        print(f"📍 New subscription from IP: {client_ip}")
        print(f"📍 Location: {location_info['city']}, {location_info['country']}")
        
        # Check if email already exists
        existing = waitlist_collection.find_one({"email": subscription.email})
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
        subscription_data = {
            "id": str(uuid.uuid4()),
            "email": subscription.email,
            "source": subscription.source,
            "timestamp": datetime.utcnow().isoformat(),
            "created_at": datetime.utcnow(),
            # Location tracking data
            "ip_address": client_ip,
            "location": location_info,
            "user_agent": request.headers.get("User-Agent", "Unknown")
        }
        
        # Save to database
        result = waitlist_collection.insert_one(subscription_data)
        
        if result.inserted_id:
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
        else:
            raise HTTPException(status_code=500, detail="Failed to save subscription")
            
    except Exception as e:
        print(f"Error in waitlist subscription: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/count")
async def get_waitlist_count():
    """Get total number of waitlist subscribers"""
    try:
        count = waitlist_collection.count_documents({})
        return {"count": count, "success": True}
    except Exception as e:
        print(f"Error getting waitlist count: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/recent")
async def get_recent_subscribers(limit: int = 10):
    """Get recent waitlist subscribers with location info (for admin use)"""
    try:
        subscribers = list(
            waitlist_collection.find({})
            .sort("created_at", -1)
            .limit(limit)
        )
        
        # Convert ObjectId to string and format for response
        for subscriber in subscribers:
            subscriber["_id"] = str(subscriber["_id"])
            
        return {"subscribers": subscribers, "success": True}
    except Exception as e:
        print(f"Error getting recent subscribers: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/analytics")
async def get_waitlist_analytics():
    """Get waitlist analytics with location breakdown"""
    try:
        # Total count
        total_count = waitlist_collection.count_documents({})
        
        # Country breakdown
        country_pipeline = [
            {"$group": {"_id": "$location.country", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        countries = list(waitlist_collection.aggregate(country_pipeline))
        
        # City breakdown  
        city_pipeline = [
            {"$group": {"_id": {"city": "$location.city", "country": "$location.country"}, "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        cities = list(waitlist_collection.aggregate(city_pipeline))
        
        # Source breakdown
        source_pipeline = [
            {"$group": {"_id": "$source", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        sources = list(waitlist_collection.aggregate(source_pipeline))
        
        return {
            "total_subscribers": total_count,
            "top_countries": countries,
            "top_cities": cities, 
            "sources": sources,
            "success": True
        }
    except Exception as e:
        print(f"Error getting waitlist analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")