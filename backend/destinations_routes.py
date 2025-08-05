# Destinations API Routes for Global Autocomplete
from fastapi import APIRouter, Query
from typing import List, Optional
from global_destinations_data import (
    search_destinations,
    get_popular_destinations, 
    get_destinations_by_country,
    ATTRACTIONS_BY_DESTINATION
)

router = APIRouter()

@router.get("/destinations/search")
async def search_global_destinations(
    query: str = Query(..., description="Search query for destinations"),
    limit: int = Query(10, description="Maximum number of results")
):
    """
    Search global destinations for autocomplete
    """
    try:
        results = search_destinations(query, limit)
        
        return {
            "success": True,
            "query": query,
            "total_results": len(results),
            "destinations": results
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Search error: {str(e)}",
            "destinations": []
        }

@router.get("/destinations/popular")
async def get_popular_global_destinations(
    limit: int = Query(20, description="Number of popular destinations to return")
):
    """
    Get popular destinations for quick suggestions
    """
    try:
        popular = get_popular_destinations(limit)
        
        return {
            "success": True,
            "total_popular": len(popular),
            "popular_destinations": popular
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Error fetching popular destinations: {str(e)}",
            "popular_destinations": []
        }

@router.get("/destinations/country/{country}")
async def get_destinations_by_country_name(country: str):
    """
    Get all destinations for a specific country
    """
    try:
        destinations = get_destinations_by_country(country)
        
        return {
            "success": True,
            "country": country,
            "total_destinations": len(destinations),
            "destinations": destinations
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Error fetching destinations for {country}: {str(e)}",
            "destinations": []
        }

@router.get("/destinations/attractions/{destination}")
async def get_destination_attractions(destination: str):
    """
    Get attractions for a specific destination
    """
    try:
        destination_key = destination.lower().replace(" ", "_")
        attractions = ATTRACTIONS_BY_DESTINATION.get(destination_key, [])
        
        return {
            "success": True,
            "destination": destination,
            "total_attractions": len(attractions),
            "attractions": attractions
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Error fetching attractions for {destination}: {str(e)}",
            "attractions": []
        }

@router.get("/destinations/suggestions")
async def get_autocomplete_suggestions(
    query: Optional[str] = Query(None, description="Partial search query"),
    type_filter: Optional[str] = Query(None, description="Filter by type: city, landmark, country"),
    region: Optional[str] = Query(None, description="Filter by region: asia, europe, americas, etc.")
):
    """
    Advanced autocomplete suggestions with filtering
    """
    try:
        if not query or len(query.strip()) < 2:
            # Return popular destinations if no query
            suggestions = get_popular_destinations(15)
        else:
            # Search based on query
            suggestions = search_destinations(query, 15)
        
        # Apply filters
        if type_filter:
            suggestions = [dest for dest in suggestions if dest.get('type') == type_filter]
        
        # Group suggestions by type for better UX
        grouped_suggestions = {
            "cities": [dest for dest in suggestions if dest.get('type') == 'city'],
            "landmarks": [dest for dest in suggestions if dest.get('type') == 'landmark'],
            "countries": [dest for dest in suggestions if dest.get('type') == 'country'],
            "regions": [dest for dest in suggestions if dest.get('type') in ['state', 'island']]
        }
        
        return {
            "success": True,
            "query": query,
            "suggestions": suggestions,
            "grouped_suggestions": grouped_suggestions,
            "total_suggestions": len(suggestions)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Suggestions error: {str(e)}",
            "suggestions": []
        }