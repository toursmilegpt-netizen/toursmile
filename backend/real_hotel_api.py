# Real Hotel API Integration with HotelAPI.co
# This integrates with the free hotel API for real hotel data

import requests
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HotelAPIService:
    def __init__(self):
        self.auth_url = "https://api.makcorps.com/auth"
        self.api_base_url = "https://api.makcorps.com/free"
        
        # These will be loaded lazily from environment variables
        self._username = None
        self._password = None
        
        self.jwt_token = None
        self.token_expiry = None
    
    @property
    def username(self):
        """Lazy load username from environment"""
        if self._username is None:
            self._username = os.environ.get('HOTELAPI_USERNAME')
        return self._username
    
    @property
    def password(self):
        """Lazy load password from environment"""
        if self._password is None:
            self._password = os.environ.get('HOTELAPI_PASSWORD')
        return self._password
    
    def authenticate(self) -> bool:
        """
        Authenticate with HotelAPI.co and get JWT token
        Returns True if authentication successful, False otherwise
        """
        if not self.username or not self.password:
            logger.warning("HotelAPI credentials not found in environment variables")
            return False
        
        try:
            payload = {
                "username": self.username,
                "password": self.password
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            logger.info("Authenticating with HotelAPI...")
            response = requests.post(
                self.auth_url, 
                data=json.dumps(payload), 
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                self.jwt_token = data.get('access_token')
                # Set token expiry (assume 24 hours if not provided)
                self.token_expiry = datetime.now() + timedelta(hours=24)
                
                logger.info("HotelAPI authentication successful")
                return True
            else:
                logger.error(f"Authentication failed: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Authentication request failed: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return False
    
    def is_token_valid(self) -> bool:
        """Check if JWT token is still valid"""
        if not self.jwt_token or not self.token_expiry:
            return False
        return datetime.now() < self.token_expiry
    
    def ensure_authenticated(self) -> bool:
        """Ensure we have a valid JWT token"""
        if self.is_token_valid():
            return True
        return self.authenticate()
    
    def search_hotels(self, city: str) -> List[Dict]:
        """
        Search for hotels in a given city using the real HotelAPI
        
        Args:
            city (str): Name of the city to search hotels in
            
        Returns:
            List[Dict]: List of hotel data with pricing information
        """
        # Try using API key first if available
        api_key = os.environ.get('HOTELAPI_KEY')
        if api_key:
            try:
                # Clean city name for API call
                city_clean = city.strip().replace(' ', '').lower()
                
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "X-API-Key": api_key
                }
                
                url = f"{self.api_base_url}/{city_clean}"
                
                logger.info(f"Searching hotels for city: {city} using API key")
                response = requests.get(url, headers=headers, timeout=30)
                
                if response.status_code == 200:
                    raw_data = response.json()
                    return self.transform_hotel_data(raw_data, city)
                else:
                    logger.warning(f"API Key method failed: {response.status_code} - {response.text}")
            except Exception as e:
                logger.warning(f"API Key method error: {str(e)}")
        
        # Fallback to JWT authentication method
        if not self.ensure_authenticated():
            logger.error("Failed to authenticate with HotelAPI")
            return []
        
        try:
            # Clean city name for API call
            city_clean = city.strip().replace(' ', '').lower()
            
            headers = {
                "Authorization": f"JWT {self.jwt_token}"
            }
            
            url = f"{self.api_base_url}/{city_clean}"
            
            logger.info(f"Searching hotels for city: {city}")
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                raw_data = response.json()
                return self.transform_hotel_data(raw_data, city)
            else:
                logger.error(f"Hotel search failed: {response.status_code} - {response.text}")
                return []
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Hotel search request failed: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Hotel search error: {str(e)}")
            return []
    
    def transform_hotel_data(self, raw_data: List, city: str) -> List[Dict]:
        """
        Transform the raw API response into our standard hotel data format
        
        Args:
            raw_data (List): Raw response from HotelAPI
            city (str): City name for the search
            
        Returns:
            List[Dict]: Formatted hotel data
        """
        hotels = []
        
        try:
            for item in raw_data:
                if len(item) >= 2:
                    hotel_info = item[0]  # First element contains hotel basic info
                    pricing_info = item[1]  # Second element contains pricing from vendors
                    
                    # Get the best (lowest) price from all vendors
                    best_price = self.get_best_price(pricing_info)
                    
                    # Generate hotel amenities (since API doesn't provide them)
                    amenities = self.generate_amenities(hotel_info.get('hotelName', ''))
                    
                    # Create standardized hotel object
                    hotel = {
                        "id": hotel_info.get('hotelId', ''),
                        "name": hotel_info.get('hotelName', ''),
                        "location": city,
                        "price_per_night": best_price['price'],
                        "tax": best_price['tax'],
                        "total_price": int(best_price['price']) + int(best_price['tax']) if best_price['tax'] else int(best_price['price']),
                        "vendor": best_price['vendor'],
                        "rating": self.estimate_rating(hotel_info.get('hotelName', '')),
                        "amenities": amenities,
                        "image": self.get_hotel_image(hotel_info.get('hotelName', '')),
                        "all_pricing": pricing_info,  # Include all vendor pricing
                        "currency": "USD"  # API returns USD prices
                    }
                    
                    hotels.append(hotel)
            
            logger.info(f"Transformed {len(hotels)} hotels for {city}")
            return hotels
            
        except Exception as e:
            logger.error(f"Error transforming hotel data: {str(e)}")
            return []
    
    def get_best_price(self, pricing_info: List[Dict]) -> Dict:
        """Get the best (lowest) price from all vendors"""
        best_price = None
        best_vendor = ""
        best_tax = 0
        
        for vendor_data in pricing_info:
            for key, value in vendor_data.items():
                if key.startswith('price') and value is not None:
                    price = int(value)
                    tax_key = key.replace('price', 'tax')
                    vendor_key = key.replace('price', 'vendor')
                    
                    tax = int(vendor_data.get(tax_key, 0)) if vendor_data.get(tax_key) else 0
                    
                    if best_price is None or price < best_price:
                        best_price = price
                        best_tax = tax
                        best_vendor = vendor_data.get(vendor_key, 'Unknown')
        
        return {
            'price': best_price or 100,
            'tax': best_tax,
            'vendor': best_vendor
        }
    
    def generate_amenities(self, hotel_name: str) -> List[str]:
        """Generate realistic amenities based on hotel name/type"""
        basic_amenities = ["Free WiFi", "24-hour Reception"]
        
        hotel_name_lower = hotel_name.lower()
        
        # Add amenities based on hotel name/brand
        if any(word in hotel_name_lower for word in ['luxury', 'grand', 'palace', 'resort', 'oberoi', 'taj', 'itc']):
            return basic_amenities + ["Swimming Pool", "Spa & Wellness", "Fine Dining", "Business Center", "Concierge Service"]
        elif any(word in hotel_name_lower for word in ['radisson', 'marriott', 'hyatt', 'hilton', 'sheraton']):
            return basic_amenities + ["Swimming Pool", "Fitness Center", "Restaurant", "Business Center"]
        elif any(word in hotel_name_lower for word in ['airport', 'international']):
            return basic_amenities + ["Airport Shuttle", "Restaurant", "Business Center"]
        else:
            return basic_amenities + ["Restaurant", "Room Service"]
    
    def estimate_rating(self, hotel_name: str) -> float:
        """Estimate hotel rating based on hotel name/brand"""
        hotel_name_lower = hotel_name.lower()
        
        if any(word in hotel_name_lower for word in ['oberoi', 'taj', 'itc', 'grand', 'palace']):
            return 5.0
        elif any(word in hotel_name_lower for word in ['radisson', 'marriott', 'hyatt', 'hilton', 'sheraton']):
            return 4.5
        elif any(word in hotel_name_lower for word in ['luxury', 'premium', 'deluxe']):
            return 4.2
        else:
            return 4.0
    
    def get_hotel_image(self, hotel_name: str) -> str:
        """Get a representative image for the hotel"""
        # Using Unsplash for hotel images with relevant search terms
        hotel_name_lower = hotel_name.lower()
        
        if 'mumbai' in hotel_name_lower or 'bombay' in hotel_name_lower:
            return 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'
        elif any(word in hotel_name_lower for word in ['luxury', 'grand', 'palace']):
            return 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400'
        elif 'airport' in hotel_name_lower:
            return 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'
        else:
            return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'


# Global instance for the service
hotel_api_service = HotelAPIService()


# Test function to verify API integration
async def test_hotel_api():
    """Test the HotelAPI integration"""
    try:
        hotels = hotel_api_service.search_hotels("Mumbai")
        if hotels:
            logger.info(f"✅ HotelAPI test successful - Found {len(hotels)} hotels")
            for hotel in hotels[:3]:  # Show first 3 hotels
                logger.info(f"  🏨 {hotel['name']} - ${hotel['price_per_night']}/night via {hotel['vendor']}")
            return True
        else:
            logger.warning("❌ HotelAPI test failed - No hotels returned")
            return False
    except Exception as e:
        logger.error(f"❌ HotelAPI test error: {str(e)}")
        return False


if __name__ == "__main__":
    # For testing purposes
    import asyncio
    asyncio.run(test_hotel_api())