# Popular Trips API Routes for TourSmile Backend
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import json
from popular_trips_data import (
    POPULAR_TRIPS_DATA, 
    get_trips_by_duration, 
    get_trips_by_theme, 
    get_trips_by_budget,
    AVAILABLE_THEMES,
    POPULAR_DESTINATIONS
)

router = APIRouter()

@router.get("/popular-trips")
async def get_all_popular_trips(
    region: Optional[str] = Query(None, description="Filter by region: india_domestic, international"),
    destination: Optional[str] = Query(None, description="Filter by destination"),
    theme: Optional[str] = Query(None, description="Filter by theme"),
    min_nights: Optional[int] = Query(4, description="Minimum nights"),
    max_nights: Optional[int] = Query(15, description="Maximum nights"), 
    max_budget: Optional[int] = Query(None, description="Maximum budget in INR"),
    limit: Optional[int] = Query(20, description="Number of trips to return")
):
    """
    Get popular trips with filtering options
    """
    try:
        trips = []
        
        # Get all trips from specified region or all regions
        if region and region in POPULAR_TRIPS_DATA:
            region_data = POPULAR_TRIPS_DATA[region]
        else:
            region_data = {}
            for r in POPULAR_TRIPS_DATA.values():
                region_data.update(r)
        
        # Get trips from specified destination or all destinations
        if destination:
            dest_key = destination.lower().replace(" ", "_")
            if dest_key in region_data:
                trips.extend(region_data[dest_key])
        else:
            for dest_trips in region_data.values():
                trips.extend(dest_trips)
        
        # Apply filters
        if theme:
            trips = [trip for trip in trips if theme.lower() in trip.get("theme", "").lower()]
        
        if max_budget:
            trips = [trip for trip in trips if trip["price_from"] <= max_budget]
        
        # Filter by duration
        if min_nights or max_nights:
            filtered_by_duration = []
            for trip in trips:
                try:
                    duration_nights = int(trip["duration"].split()[0])
                    if min_nights <= duration_nights <= max_nights:
                        filtered_by_duration.append(trip)
                except:
                    continue
            trips = filtered_by_duration
        
        # Limit results
        trips = trips[:limit] if limit else trips
        
        return {
            "success": True,
            "total_trips": len(trips),
            "trips": trips,
            "filters_applied": {
                "region": region,
                "destination": destination, 
                "theme": theme,
                "duration_range": f"{min_nights}-{max_nights} nights",
                "max_budget": max_budget
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching popular trips: {str(e)}")

@router.get("/popular-trips/{trip_id}")
async def get_trip_details(trip_id: str):
    """
    Get detailed information about a specific trip
    """
    try:
        # Search for trip by ID across all regions and destinations
        for region in POPULAR_TRIPS_DATA.values():
            for destination in region.values():
                for trip in destination:
                    if trip["id"] == trip_id:
                        return {
                            "success": True,
                            "trip": trip
                        }
        
        raise HTTPException(status_code=404, detail="Trip not found")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trip details: {str(e)}")

@router.get("/popular-destinations")
async def get_popular_destinations():
    """
    Get list of popular destinations organized by region
    """
    try:
        return {
            "success": True,
            "destinations": POPULAR_DESTINATIONS
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching destinations: {str(e)}")

@router.get("/trip-themes") 
async def get_available_themes():
    """
    Get list of available trip themes
    """
    try:
        return {
            "success": True,
            "themes": AVAILABLE_THEMES
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching themes: {str(e)}")

@router.post("/trip-inquiry")
async def submit_trip_inquiry(inquiry_data: dict):
    """
    Submit inquiry for a specific trip
    """
    try:
        required_fields = ["trip_id", "customer_name", "email", "phone", "travel_dates", "number_of_travelers"]
        
        # Validate required fields
        for field in required_fields:
            if field not in inquiry_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Here you would typically save to database and send notification emails
        # For now, we'll return success response
        
        return {
            "success": True,
            "message": "Your trip inquiry has been submitted successfully!",
            "inquiry_id": f"INQ_{inquiry_data['trip_id']}_{int(__import__('time').time())}",
            "next_steps": "Our travel expert will contact you within 24 hours to discuss your requirements."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting inquiry: {str(e)}")

@router.get("/featured-trips")
async def get_featured_trips(limit: int = Query(6, description="Number of featured trips")):
    """
    Get featured/recommended trips for homepage display
    """
    try:
        # Get a mix of popular trips from different categories
        featured = []
        
        # Add some premium/luxury trips
        luxury_trips = get_trips_by_theme("Luxury")[:2]
        featured.extend(luxury_trips)
        
        # Add some adventure trips  
        adventure_trips = get_trips_by_theme("Adventure")[:2]
        featured.extend(adventure_trips)
        
        # Add some cultural trips
        cultural_trips = get_trips_by_theme("Culture")[:2]
        featured.extend(cultural_trips)
        
        # Limit to requested number
        featured = featured[:limit]
        
        return {
            "success": True,
            "featured_trips": featured,
            "total_featured": len(featured)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching featured trips: {str(e)}")