from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime
import os
import pymongo

router = APIRouter(prefix="/waitlist", tags=["waitlist"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL')
client = pymongo.MongoClient(MONGO_URL)
db = client.toursmile
waitlist_collection = db.waitlist

class WaitlistSubscription(BaseModel):
    email: EmailStr
    source: Optional[str] = "website"
    timestamp: Optional[str] = None

class WaitlistResponse(BaseModel):
    message: str
    success: bool
    email: str

@router.post("/subscribe", response_model=WaitlistResponse)
async def subscribe_to_waitlist(subscription: WaitlistSubscription):
    """
    Subscribe email to TourSmile waitlist
    """
    try:
        # Check if email already exists
        existing = waitlist_collection.find_one({"email": subscription.email})
        if existing:
            return WaitlistResponse(
                message="You're already on our waitlist! We'll notify you when we launch.",
                success=True,
                email=subscription.email
            )
        
        # Create new subscription
        waitlist_entry = {
            "id": str(uuid.uuid4()),
            "email": subscription.email,
            "source": subscription.source,
            "timestamp": subscription.timestamp or datetime.now().isoformat(),
            "created_at": datetime.now(),
            "status": "active"
        }
        
        # Insert into database
        result = waitlist_collection.insert_one(waitlist_entry)
        
        if result.inserted_id:
            return WaitlistResponse(
                message="Success! You'll be first to know when we launch.",
                success=True,
                email=subscription.email
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save email subscription"
            )
    
    except Exception as e:
        print(f"Waitlist subscription error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/count")
async def get_waitlist_count():
    """
    Get total number of waitlist subscribers
    """
    try:
        count = waitlist_collection.count_documents({"status": "active"})
        return {"count": count, "success": True}
    except Exception as e:
        print(f"Waitlist count error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/recent")
async def get_recent_subscribers(limit: int = 10):
    """
    Get recent waitlist subscribers (for admin use)
    """
    try:
        recent = list(waitlist_collection.find(
            {"status": "active"},
            {"_id": 0, "email": 1, "source": 1, "timestamp": 1, "created_at": 1}  # Exclude _id field
        ).sort("created_at", -1).limit(limit))
        
        # Convert datetime objects to strings for JSON serialization
        for subscriber in recent:
            if "created_at" in subscriber and hasattr(subscriber["created_at"], "isoformat"):
                subscriber["created_at"] = subscriber["created_at"].isoformat()
        
        return {"subscribers": recent, "success": True}
    except Exception as e:
        print(f"Recent subscribers error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )