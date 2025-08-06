# HotelAPI.co Integration Setup Instructions

## Overview
TourSmile has been integrated with HotelAPI.co to provide real hotel data with pricing from multiple vendors (Booking.com, Hotels.com, Expedia, etc.).

## Setup Instructions

### 1. Add Your Credentials
Once you receive the email from HotelAPI.co with your credentials, add them to the backend environment file:

```bash
# Open the backend .env file
nano /app/backend/.env

# Add these lines with your actual credentials:
HOTELAPI_USERNAME=your_username_from_email
HOTELAPI_PASSWORD=your_password_from_email
```

### 2. Restart Backend Service
After adding credentials, restart the backend:
```bash
sudo supervisorctl restart backend
```

### 3. Test the Integration
You can test if the integration is working by visiting:
```
https://vimanpravas.com/api/test-hotel-api
```

This will show you:
- ✅ Authentication status
- ✅ Number of hotels found
- ✅ Sample hotel data

### 4. How It Works

**Frontend Experience:**
- Users search for hotels as usual
- If real API credentials are available, it fetches live data
- Falls back to mock data if API is unavailable
- Displays vendor comparison (Booking.com, Hotels.com, etc.)

**Real Data Features:**
- Up to 30 real hotels per city
- Live pricing from multiple vendors
- Real hotel names and locations
- Automatic currency conversion
- Vendor comparison (shows cheapest option)

### 5. API Limitations (Free Tier)
- **30 hotels max** per city search
- **Random dates** (can't specify check-in/out dates)
- **No guest count** specification
- **USD pricing** (we convert to INR for display)

### 6. Example Response Format
```json
{
  "hotels": [
    {
      "name": "The Taj Mahal Palace",
      "price_per_night": 204,
      "tax": 31,
      "total_price": 235,
      "vendor": "Booking.com",
      "rating": 5.0,
      "amenities": ["Free WiFi", "Swimming Pool", "Spa & Wellness"],
      "currency": "USD"
    }
  ],
  "data_source": "real_api",
  "total_found": 30
}
```

### 7. Monitoring
Check backend logs to see API usage:
```bash
tail -f /var/log/supervisor/backend.*.log
```

### 8. Upgrade Path
For production use, consider upgrading to HotelAPI.co premium plans for:
- Custom date ranges
- More hotels per city
- Guest count specification
- Additional features

---

## Status: Waiting for Credentials ⏳
Once you receive your HotelAPI.co credentials via email, follow steps 1-2 above to activate real hotel data!