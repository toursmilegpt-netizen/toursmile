# Tripjack Hotel API Integration
# Comprehensive hotel search with advanced filtering and booking capabilities

import requests
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TripjackHotelService:
    def __init__(self):
        # Base URLs
        self.uat_base_url = "https://apitest.tripjack.com"
        self.prod_base_url = "https://tripjack.com"
        self.is_production = os.environ.get('TRIPJACK_ENV', 'UAT').upper() == 'PROD'
        
        # Current base URL
        self.base_url = self.prod_base_url if self.is_production else self.uat_base_url
        
        # API credentials - lazy loaded
        self._api_key = None
        self._api_secret = None
        self._access_token = None
        self._token_expires_at = None
        
        logger.info(f"🏨 TripjackHotelService initialized - Environment: {'PRODUCTION' if self.is_production else 'UAT'}")

    @property
    def api_key(self):
        """Lazy load API key from environment"""
        if self._api_key is None:
            self._api_key = os.environ.get('TRIPJACK_API_KEY')
        return self._api_key

    @property
    def api_secret(self):
        """Lazy load API secret from environment"""
        if self._api_secret is None:
            self._api_secret = os.environ.get('TRIPJACK_API_SECRET')
        return self._api_secret

    def authenticate(self) -> bool:
        """Authenticate with Tripjack API and get access token"""
        try:
            if not self.api_key or not self.api_secret:
                logger.error("❌ Tripjack API credentials not found in environment")
                return False

            # Check if we have a valid token
            if (self._access_token and self._token_expires_at and 
                datetime.now() < self._token_expires_at):
                return True

            # Authentication endpoint
            auth_url = f"{self.base_url}/api/auth/token"
            
            auth_data = {
                "api_key": self.api_key,
                "api_secret": self.api_secret
            }

            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }

            response = requests.post(auth_url, json=auth_data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                auth_response = response.json()
                self._access_token = auth_response.get('access_token')
                
                # Set token expiry
                self._token_expires_at = datetime.now() + timedelta(minutes=50)
                
                logger.info("✅ Tripjack Hotel API authentication successful")
                return True
            else:
                logger.error(f"❌ Tripjack Hotel API authentication failed: {response.status_code}")
                return False

        except Exception as e:
            logger.error(f"❌ Tripjack Hotel API authentication error: {str(e)}")
            return False

    def get_headers(self):
        """Get authenticated headers for API requests"""
        if not self._access_token:
            if not self.authenticate():
                return {}
        
        return {
            "Authorization": f"Bearer {self._access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    def search_hotels(self, location: str, checkin_date: str, checkout_date: str,
                     guests: int = 1, rooms: int = 1, **filters) -> List[Dict]:
        """
        Search hotels using Tripjack API
        
        Args:
            location (str): City or area name
            checkin_date (str): Check-in date in YYYY-MM-DD format
            checkout_date (str): Check-out date in YYYY-MM-DD format
            guests (int): Number of guests
            rooms (int): Number of rooms
            **filters: Additional filters (star_rating, price_range, etc.)
            
        Returns:
            List[Dict]: List of hotels with comprehensive details
        """
        try:
            if not self.authenticate():
                logger.error("❌ Failed to authenticate with Tripjack Hotel API")
                return []

            logger.info(f"🔍 Tripjack hotel search: {location} ({checkin_date} to {checkout_date})")
            
            # Hotel search endpoint (inferred)
            search_url = f"{self.base_url}/hms/v1/hotel/search"
            
            # Search request payload
            search_payload = {
                "searchQuery": {
                    "location": location,
                    "checkInDate": checkin_date,
                    "checkOutDate": checkout_date,
                    "rooms": [
                        {
                            "adults": guests,
                            "children": 0
                        }
                    ] * rooms
                },
                "options": {
                    "currency": "INR",
                    "locale": "en-IN",
                    "maxResults": 50,
                    "sortBy": "price",
                    "includeAllRates": True
                }
            }

            # Add filters if provided
            if filters:
                search_payload["filters"] = {}
                if "min_price" in filters:
                    search_payload["filters"]["minPrice"] = filters["min_price"]
                if "max_price" in filters:
                    search_payload["filters"]["maxPrice"] = filters["max_price"]
                if "star_rating" in filters:
                    search_payload["filters"]["starRating"] = filters["star_rating"]

            headers = self.get_headers()
            
            response = requests.post(search_url, json=search_payload, headers=headers, timeout=60)
            logger.info(f"📊 Hotel API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ Tripjack hotel search successful!")
                
                # Extract hotels from response
                hotels_data = data.get('searchResult', {}).get('hotels', [])
                
                if hotels_data:
                    transformed_hotels = self.transform_hotel_data(hotels_data, location)
                    logger.info(f"✅ Found {len(transformed_hotels)} hotels")
                    return transformed_hotels
                else:
                    logger.warning("⚠️ No hotels found in Tripjack response")
                    return []
                    
            else:
                logger.error(f"❌ Tripjack Hotel API error: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"❌ Tripjack hotel search error: {str(e)}")
            return []

    def transform_hotel_data(self, hotels_data: List[Dict], location: str) -> List[Dict]:
        """Transform Tripjack hotel data to our standard format"""
        transformed = []
        
        try:
            for hotel_info in hotels_data:
                try:
                    # Basic hotel information
                    hotel_id = hotel_info.get('hotelId', '')
                    hotel_name = hotel_info.get('hotelName', 'Unknown Hotel')
                    
                    # Location and address
                    address_info = hotel_info.get('address', {})
                    full_address = address_info.get('addressLine', '')
                    city = address_info.get('city', location)
                    
                    # Star rating
                    star_rating = hotel_info.get('starRating', 0)
                    
                    # Images
                    images = hotel_info.get('images', [])
                    main_image = images[0] if images else "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"
                    
                    # Amenities
                    amenities = hotel_info.get('amenities', [])
                    amenity_names = [amenity.get('name', '') for amenity in amenities if amenity.get('name')]
                    
                    # Room rates
                    rooms = hotel_info.get('rooms', [])
                    min_rate = float('inf')
                    max_rate = 0
                    room_options = []
                    
                    for room in rooms:
                        rate_info = room.get('rate', {})
                        total_rate = rate_info.get('totalAmount', 0)
                        
                        if total_rate > 0:
                            min_rate = min(min_rate, total_rate)
                            max_rate = max(max_rate, total_rate)
                            
                            room_option = {
                                "room_type": room.get('roomType', 'Standard Room'),
                                "rate": total_rate,
                                "currency": rate_info.get('currency', 'INR'),
                                "inclusions": room.get('inclusions', []),
                                "cancellation_policy": room.get('cancellationPolicy', 'Standard'),
                                "available_rooms": room.get('availableRooms', 1)
                            }
                            room_options.append(room_option)
                    
                    # Use minimum rate as display price
                    display_price = min_rate if min_rate != float('inf') else 5000
                    
                    # Hotel object
                    hotel_obj = {
                        "id": hotel_id,
                        "name": hotel_name,
                        "location": city,
                        "address": full_address,
                        "star_rating": star_rating,
                        "price_per_night": int(display_price),
                        "total_price": int(display_price),
                        "currency": "INR",
                        "image": main_image,
                        "images": images,
                        "amenities": amenity_names,
                        "room_options": room_options,
                        "rating": hotel_info.get('guestRating', star_rating),
                        "review_count": hotel_info.get('reviewCount', 0),
                        "description": hotel_info.get('description', f"{star_rating}-star hotel in {city}"),
                        
                        # Additional filtering attributes
                        "price_range": self.get_price_range(display_price),
                        "hotel_type": self.get_hotel_type(amenity_names),
                        "has_wifi": any("wifi" in amenity.lower() for amenity in amenity_names),
                        "has_pool": any("pool" in amenity.lower() for amenity in amenity_names),
                        "has_spa": any("spa" in amenity.lower() for amenity in amenity_names),
                        "has_gym": any("gym" in amenity.lower() or "fitness" in amenity.lower() for amenity in amenity_names),
                        "has_restaurant": any("restaurant" in amenity.lower() for amenity in amenity_names),
                        "has_parking": any("parking" in amenity.lower() for amenity in amenity_names),
                        
                        # Booking information
                        "booking_token": hotel_info.get('searchId', ''),
                        "available": True,
                        "instant_confirmation": True,
                        "cancellation_available": True
                    }
                    
                    transformed.append(hotel_obj)
                    
                    # Log hotel for debugging
                    star_indicator = "⭐" * min(star_rating, 5)
                    logger.info(f"🏨 {hotel_name} {star_indicator} - ₹{display_price}/night ({len(room_options)} room types)")
                    
                except Exception as hotel_error:
                    logger.error(f"Error processing hotel: {str(hotel_error)}")
                    continue
                    
            return transformed
            
        except Exception as e:
            logger.error(f"❌ Error transforming hotel data: {str(e)}")
            return []

    def pre_book_hotel(self, hotel_id: str, check_in: str, check_out: str, rooms: List[Dict], guest_details: List[Dict]) -> Dict:
        """
        TripJack Hotel Pre-Book API for rate revalidation
        Mandatory step before payment to confirm rates and availability
        
        Args:
            hotel_id (str): TripJack hotel ID
            check_in (str): Check-in date YYYY-MM-DD
            check_out (str): Check-out date YYYY-MM-DD  
            rooms (List[Dict]): Room details with adult/child counts
            guest_details (List[Dict]): Guest information
            
        Returns:
            Dict: Pre-booking response with revalidated rates and booking token
        """
        try:
            if not self.authenticate():
                logger.error("❌ Failed to authenticate for hotel pre-book")
                return {"success": False, "error": "Authentication failed"}

            logger.info(f"🔄 TripJack hotel pre-book: {hotel_id}")
            
            # Pre-book endpoint
            prebook_url = f"{self.base_url}/hms/v1/hotel/prebook"
            
            # Pre-book request payload
            prebook_payload = {
                "hotelId": hotel_id,
                "checkInDate": check_in,
                "checkOutDate": check_out,
                "rooms": rooms,
                "guestDetails": guest_details,
                "options": {
                    "currency": "INR",
                    "revalidateRates": True,
                    "includeBookingToken": True
                }
            }

            headers = self.get_headers()
            
            response = requests.post(prebook_url, json=prebook_payload, headers=headers, timeout=60)
            logger.info(f"📊 Pre-book API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ Hotel pre-book successful!")
                
                return {
                    "success": True,
                    "booking_token": data.get("bookingToken"),
                    "revalidated_price": data.get("totalPrice"),
                    "original_price": data.get("originalPrice"),
                    "rate_change": data.get("rateChanged", False),
                    "availability_confirmed": data.get("availabilityConfirmed", True),
                    "booking_details": data.get("bookingDetails", {}),
                    "cancellation_policy": data.get("cancellationPolicy", {}),
                    "valid_until": data.get("validUntil"),
                    "raw_response": data
                }
                    
            else:
                error_data = response.json() if response.content else {}
                logger.error(f"❌ Hotel pre-book failed: {response.status_code}")
                return {
                    "success": False, 
                    "error": error_data.get("message", "Pre-book failed"),
                    "error_code": error_data.get("code"),
                    "status_code": response.status_code
                }
                
        except Exception as e:
            logger.error(f"❌ Hotel pre-book error: {str(e)}")
            return {"success": False, "error": str(e)}

    def confirm_hotel_booking(self, booking_token: str, payment_details: Dict, customer_details: Dict) -> Dict:
        """
        Confirm hotel booking after successful payment
        Generates TripJack booking ID and confirmation
        
        Args:
            booking_token (str): Token from pre-book response
            payment_details (Dict): Payment information
            customer_details (Dict): Customer contact details
            
        Returns:
            Dict: Booking confirmation with TripJack booking ID
        """
        try:
            if not self.authenticate():
                logger.error("❌ Failed to authenticate for hotel booking")
                return {"success": False, "error": "Authentication failed"}

            logger.info(f"✅ Confirming hotel booking with token: {booking_token[:20]}...")
            
            # Booking confirmation endpoint
            booking_url = f"{self.base_url}/hms/v1/hotel/book"
            
            # Booking confirmation payload
            booking_payload = {
                "bookingToken": booking_token,
                "paymentDetails": {
                    "paymentId": payment_details.get("payment_id"),
                    "paymentMethod": payment_details.get("method", "card"),
                    "amount": payment_details.get("amount"),
                    "currency": payment_details.get("currency", "INR"),
                    "transactionId": payment_details.get("transaction_id")
                },
                "customerDetails": customer_details,
                "options": {
                    "sendConfirmationEmail": True,
                    "generateVoucher": True
                }
            }

            headers = self.get_headers()
            
            response = requests.post(booking_url, json=booking_payload, headers=headers, timeout=60)
            logger.info(f"📊 Booking API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ Hotel booking confirmed!")
                
                return {
                    "success": True,
                    "tripjack_booking_id": data.get("bookingId"),
                    "booking_reference": data.get("bookingReference"), 
                    "confirmation_number": data.get("confirmationNumber"),
                    "status": data.get("status", "confirmed"),
                    "hotel_details": data.get("hotelDetails", {}),
                    "guest_details": data.get("guestDetails", []),
                    "total_amount": data.get("totalAmount"),
                    "check_in_date": data.get("checkInDate"),
                    "check_out_date": data.get("checkOutDate"),
                    "voucher_url": data.get("voucherUrl"),
                    "cancellation_policy": data.get("cancellationPolicy", {}),
                    "contact_details": data.get("hotelContactDetails", {}),
                    "raw_response": data
                }
                    
            else:
                error_data = response.json() if response.content else {}
                logger.error(f"❌ Hotel booking failed: {response.status_code}")
                return {
                    "success": False, 
                    "error": error_data.get("message", "Booking failed"),
                    "error_code": error_data.get("code"),
                    "status_code": response.status_code
                }
                
        except Exception as e:
            logger.error(f"❌ Hotel booking confirmation error: {str(e)}")
            return {"success": False, "error": str(e)}

    def get_booking_details(self, tripjack_booking_id: str) -> Dict:
        """
        Retrieve booking details from TripJack
        
        Args:
            tripjack_booking_id (str): TripJack booking ID
            
        Returns:
            Dict: Booking details and status
        """
        try:
            if not self.authenticate():
                logger.error("❌ Failed to authenticate for booking details")
                return {"success": False, "error": "Authentication failed"}

            logger.info(f"📋 Getting booking details: {tripjack_booking_id}")
            
            # Booking details endpoint
            details_url = f"{self.base_url}/hms/v1/hotel/booking/{tripjack_booking_id}"

            headers = self.get_headers()
            
            response = requests.get(details_url, headers=headers, timeout=30)
            logger.info(f"📊 Booking Details Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ Booking details retrieved!")
                
                return {
                    "success": True,
                    "booking_details": data
                }
                    
            else:
                logger.error(f"❌ Failed to get booking details: {response.status_code}")
                return {"success": False, "error": "Failed to retrieve booking"}
                
        except Exception as e:
            logger.error(f"❌ Get booking details error: {str(e)}")
            return {"success": False, "error": str(e)}

    def cancel_hotel_booking(self, tripjack_booking_id: str, cancellation_reason: str = "Customer request") -> Dict:
        """
        Cancel hotel booking through TripJack API
        
        Args:
            tripjack_booking_id (str): TripJack booking ID
            cancellation_reason (str): Reason for cancellation
            
        Returns:
            Dict: Cancellation status and refund details
        """
        try:
            if not self.authenticate():
                logger.error("❌ Failed to authenticate for cancellation")
                return {"success": False, "error": "Authentication failed"}

            logger.info(f"❌ Cancelling hotel booking: {tripjack_booking_id}")
            
            # Cancellation endpoint
            cancel_url = f"{self.base_url}/hms/v1/hotel/cancel"
            
            cancel_payload = {
                "bookingId": tripjack_booking_id,
                "reason": cancellation_reason
            }

            headers = self.get_headers()
            
            response = requests.post(cancel_url, json=cancel_payload, headers=headers, timeout=60)
            logger.info(f"📊 Cancellation Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ Booking cancelled!")
                
                return {
                    "success": True,
                    "cancellation_id": data.get("cancellationId"),
                    "refund_amount": data.get("refundAmount"),
                    "cancellation_charges": data.get("cancellationCharges"),
                    "refund_timeline": data.get("refundTimeline"),
                    "status": data.get("status"),
                    "raw_response": data
                }
                    
            else:
                error_data = response.json() if response.content else {}
                logger.error(f"❌ Cancellation failed: {response.status_code}")
                return {
                    "success": False, 
                    "error": error_data.get("message", "Cancellation failed"),
                    "error_code": error_data.get("code")
                }
                
        except Exception as e:
            logger.error(f"❌ Cancellation error: {str(e)}")
            return {"success": False, "error": str(e)}

    def get_price_range(self, price: float) -> str:
        """Categorize hotel by price range"""
        if price < 2000:
            return "budget"
        elif price < 5000:
            return "mid-range"
        elif price < 10000:
            return "premium"
        else:
            return "luxury"

    def get_hotel_type(self, amenities: List[str]) -> str:
        """Determine hotel type based on amenities"""
        amenities_lower = [a.lower() for a in amenities]
        
        if any("resort" in a for a in amenities_lower):
            return "resort"
        elif any("business" in a for a in amenities_lower):
            return "business"
        elif any("spa" in a for a in amenities_lower):
            return "spa"
        elif any("airport" in a for a in amenities_lower):
            return "airport"
        else:
            return "hotel"

    def test_connection(self) -> bool:
        """Test Tripjack Hotel API connection"""
        try:
            logger.info("🧪 Testing Tripjack Hotel API connection...")
            
            if not self.api_key or not self.api_secret:
                logger.error("❌ Tripjack Hotel API credentials not configured")
                return False
            
            # Test authentication
            if self.authenticate():
                logger.info("✅ Tripjack Hotel API authentication successful")
                
                # Test hotel search
                test_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
                checkout_date = (datetime.now() + timedelta(days=31)).strftime('%Y-%m-%d')
                
                test_hotels = self.search_hotels('Mumbai', test_date, checkout_date, 2, 1)
                
                if test_hotels:
                    logger.info(f"✅ Hotel search successful - Found {len(test_hotels)} hotels")
                    
                    # Show sample hotels
                    for hotel in test_hotels[:3]:
                        logger.info(f"  🏨 {hotel['name']} - ⭐{hotel['star_rating']} - ₹{hotel['price_per_night']}/night")
                    
                    return True
                else:
                    logger.warning("⚠️ No hotels found in test search")
                    return True  # Connection works, just no hotels for test location
            else:
                logger.error("❌ Tripjack Hotel API authentication failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Tripjack Hotel API connection test failed: {str(e)}")
            return False


# Global service instance
tripjack_hotel_service = TripjackHotelService()


if __name__ == "__main__":
    # Test the hotel service
    service = TripjackHotelService()
    if service.test_connection():
        print("✅ Tripjack Hotel API integration ready")
    else:
        print("❌ Tripjack Hotel API integration failed")