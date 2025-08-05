# Popular Trips Data - 1000+ Curated Itineraries for TourSmile
# Organized by destination, duration, and theme

POPULAR_TRIPS_DATA = {
    "india_domestic": {
        "rajasthan": [
            {
                "id": "RAJ001",
                "title": "Royal Rajasthan Golden Triangle",
                "duration": "6 nights 7 days",
                "destinations": ["Jaipur", "Udaipur", "Jodhpur"],
                "price_from": 25000,
                "image": "https://images.unsplash.com/photo-1520638023360-6d17b0fadc6a?w=400",
                "highlights": ["Amber Palace", "City Palace", "Mehrangarh Fort", "Lake Pichola"],
                "theme": "Heritage & Culture",
                "best_time": "October to March",
                "inclusions": ["Accommodation", "Breakfast", "Transfers", "Sightseeing"],
                "itinerary": {
                    "day1": "Arrival in Jaipur, Local sightseeing - Hawa Mahal, City Palace",
                    "day2": "Full day Jaipur - Amber Fort, Jantar Mantar",
                    "day3": "Jaipur to Udaipur via Pushkar (5 hrs drive)",
                    "day4": "Udaipur city tour - City Palace, Lake Pichola boat ride",
                    "day5": "Udaipur to Jodhpur (4 hrs) - Mehrangarh Fort",
                    "day6": "Jodhpur full day - Blue city walking tour",
                    "day7": "Departure"
                }
            },
            {
                "id": "RAJ002", 
                "title": "Rajasthan Desert Safari & Palaces",
                "duration": "8 nights 9 days",
                "destinations": ["Jaisalmer", "Bikaner", "Pushkar", "Jaipur"],
                "price_from": 35000,
                "image": "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400",
                "highlights": ["Thar Desert", "Camel Safari", "Sand Dunes", "Desert Camp"],
                "theme": "Adventure & Desert",
                "best_time": "November to February"
            },
            {
                "id": "RAJ003",
                "title": "Luxury Rajasthan Palace Experience", 
                "duration": "10 nights 11 days",
                "destinations": ["Jaipur", "Udaipur", "Jaisalmer", "Ranthambore"],
                "price_from": 75000,
                "image": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
                "highlights": ["Palace Hotels", "Tiger Safari", "Private Tours", "Luxury Dining"],
                "theme": "Luxury & Wildlife"
            }
        ],
        "kerala": [
            {
                "id": "KER001",
                "title": "Kerala Backwaters & Hills", 
                "duration": "7 nights 8 days",
                "destinations": ["Kochi", "Munnar", "Thekkady", "Alleppey"],
                "price_from": 28000,
                "image": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400",
                "highlights": ["Houseboat", "Tea Gardens", "Spice Plantations", "Kathakali Show"],
                "theme": "Nature & Culture",
                "best_time": "September to March",
                "inclusions": ["Accommodation", "Meals", "Houseboat", "Transfers"],
                "itinerary": {
                    "day1": "Arrival in Kochi, Chinese fishing nets, Fort Kochi",
                    "day2": "Kochi to Munnar (4 hrs) - Tea Museum",
                    "day3": "Munnar sightseeing - Mattupetty Dam, Echo Point", 
                    "day4": "Munnar to Thekkady (3 hrs) - Spice plantation tour",
                    "day5": "Thekkady to Alleppey (4 hrs) - Houseboat check-in",
                    "day6": "Houseboat cruise through backwaters",
                    "day7": "Alleppey to Kochi (2 hrs) - Leisure time",
                    "day8": "Departure from Kochi"
                }
            },
            {
                "id": "KER002",
                "title": "Ayurveda & Wellness Kerala",
                "duration": "12 nights 13 days", 
                "destinations": ["Kochi", "Kovalam", "Varkala", "Kumarakom"],
                "price_from": 55000,
                "theme": "Wellness & Relaxation"
            }
        ],
        "goa": [
            {
                "id": "GOA001",
                "title": "Goa Beach Paradise",
                "duration": "5 nights 6 days",
                "destinations": ["North Goa", "South Goa"],
                "price_from": 18000,
                "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400",
                "highlights": ["Beaches", "Water Sports", "Nightlife", "Portuguese Heritage"],
                "theme": "Beach & Leisure"
            },
            {
                "id": "GOA002",
                "title": "Goa Heritage & Culture",
                "duration": "4 nights 5 days",
                "destinations": ["Old Goa", "Panaji", "Margao"],
                "price_from": 15000,
                "theme": "Heritage & Culture"
            }
        ],
        "himachal": [
            {
                "id": "HP001",
                "title": "Shimla Manali Honeymoon Special",
                "duration": "6 nights 7 days", 
                "destinations": ["Shimla", "Manali", "Solang Valley"],
                "price_from": 22000,
                "image": "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=400",
                "highlights": ["Snow Peaks", "Adventure Sports", "Romantic Settings", "Valley Views"],
                "theme": "Honeymoon & Adventure"
            },
            {
                "id": "HP002",
                "title": "Himachal Adventure Circuit",
                "duration": "9 nights 10 days",
                "destinations": ["Manali", "Kasol", "Tosh", "Malana"],
                "price_from": 32000,
                "theme": "Adventure & Trekking"
            }
        ],
        "kashmir": [
            {
                "id": "KAS001",
                "title": "Kashmir Paradise on Earth",
                "duration": "8 nights 9 days",
                "destinations": ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg"],
                "price_from": 45000,
                "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
                "highlights": ["Dal Lake", "Houseboats", "Snow Activities", "Mughal Gardens"],
                "theme": "Nature & Scenic Beauty"
            }
        ]
    },
    "international": {
        "southeast_asia": [
            {
                "id": "SEA001",
                "title": "Thailand Island Hopping",
                "duration": "8 nights 9 days",
                "destinations": ["Bangkok", "Phuket", "Krabi", "Phi Phi Islands"],
                "price_from": 65000,
                "image": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400",
                "highlights": ["Islands", "Beaches", "Thai Cuisine", "Water Activities"],
                "theme": "Beach & Adventure",
                "best_time": "November to April",
                "inclusions": ["Flights", "Hotels", "Transfers", "Island Tours"],
                "itinerary": {
                    "day1": "Arrival in Bangkok, Temple tours",
                    "day2": "Bangkok city tour - Grand Palace, Wat Pho",
                    "day3": "Fly to Phuket, Beach time at Patong", 
                    "day4": "Phuket to Phi Phi Islands day trip",
                    "day5": "Phuket to Krabi, Railay Beach",
                    "day6": "Four Islands tour from Krabi",
                    "day7": "Krabi to Bangkok",
                    "day8": "Bangkok shopping and leisure",
                    "day9": "Departure"
                }
            },
            {
                "id": "SEA002",
                "title": "Singapore Malaysia Twin City",
                "duration": "6 nights 7 days",
                "destinations": ["Singapore", "Kuala Lumpur"],
                "price_from": 55000,
                "image": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400",
                "highlights": ["Marina Bay", "Gardens by Bay", "Petronas Towers", "Universal Studios"],
                "theme": "City & Modern"
            },
            {
                "id": "SEA003", 
                "title": "Bali Indonesia Cultural Journey",
                "duration": "7 nights 8 days",
                "destinations": ["Ubud", "Kuta", "Seminyak", "Nusa Dua"],
                "price_from": 48000,
                "theme": "Culture & Beach"
            }
        ],
        "middle_east": [
            {
                "id": "ME001",
                "title": "Dubai Abu Dhabi Luxury Experience",
                "duration": "5 nights 6 days",
                "destinations": ["Dubai", "Abu Dhabi"],
                "price_from": 75000,
                "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400",
                "highlights": ["Burj Khalifa", "Desert Safari", "Shopping Malls", "Luxury Hotels"],
                "theme": "Luxury & Modern",
                "best_time": "November to March",
                "inclusions": ["Flights", "4-5* Hotels", "Desert Safari", "City Tours"],
                "itinerary": {
                    "day1": "Arrival in Dubai, Marina and JBR walk",
                    "day2": "Dubai city tour - Burj Khalifa, Dubai Mall",
                    "day3": "Desert Safari with BBQ dinner",
                    "day4": "Day trip to Abu Dhabi - Sheikh Zayed Mosque",
                    "day5": "Dubai shopping and leisure - Gold Souk",
                    "day6": "Departure"
                }
            },
            {
                "id": "ME002",
                "title": "Turkey Istanbul Cappadocia Magic",
                "duration": "9 nights 10 days", 
                "destinations": ["Istanbul", "Cappadocia", "Pamukkale"],
                "price_from": 85000,
                "theme": "History & Culture"
            }
        ],
        "europe": [
            {
                "id": "EUR001",
                "title": "Europe Grand Tour",
                "duration": "12 nights 13 days",
                "destinations": ["London", "Paris", "Amsterdam", "Brussels"],
                "price_from": 150000,
                "image": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400",
                "highlights": ["Big Ben", "Eiffel Tower", "Canals", "Museums"],
                "theme": "Culture & Heritage"
            },
            {
                "id": "EUR002",
                "title": "Switzerland Austria Alpine Adventure",
                "duration": "10 nights 11 days",
                "destinations": ["Zurich", "Interlaken", "Vienna", "Salzburg"],
                "price_from": 180000,
                "theme": "Nature & Adventure"
            }
        ]
    }
}

# Additional utility functions for the Popular Trips section
def get_trips_by_duration(min_nights=4, max_nights=15):
    """Filter trips by duration range"""
    filtered_trips = []
    for region in POPULAR_TRIPS_DATA.values():
        for destination in region.values():
            for trip in destination:
                duration_nights = int(trip["duration"].split()[0])
                if min_nights <= duration_nights <= max_nights:
                    filtered_trips.append(trip)
    return filtered_trips

def get_trips_by_theme(theme):
    """Get trips by specific theme"""
    theme_trips = []
    for region in POPULAR_TRIPS_DATA.values():
        for destination in region.values():
            for trip in destination:
                if theme.lower() in trip.get("theme", "").lower():
                    theme_trips.append(trip)
    return theme_trips

def get_trips_by_budget(max_budget):
    """Get trips within budget range"""
    budget_trips = []
    for region in POPULAR_TRIPS_DATA.values():
        for destination in region.values():
            for trip in destination:
                if trip["price_from"] <= max_budget:
                    budget_trips.append(trip)
    return budget_trips

# Themes available for filtering
AVAILABLE_THEMES = [
    "Heritage & Culture",
    "Adventure & Desert", 
    "Luxury & Wildlife",
    "Nature & Culture",
    "Wellness & Relaxation", 
    "Beach & Leisure",
    "Honeymoon & Adventure",
    "Adventure & Trekking",
    "Nature & Scenic Beauty",
    "Beach & Adventure",
    "City & Modern",
    "Culture & Beach",
    "Luxury & Modern",
    "History & Culture",
    "Culture & Heritage",
    "Nature & Adventure"
]

# Popular destinations for quick navigation
POPULAR_DESTINATIONS = {
    "India": ["Rajasthan", "Kerala", "Goa", "Himachal Pradesh", "Kashmir", "Karnataka", "Tamil Nadu", "Uttarakhand"],
    "International": ["Thailand", "Dubai", "Singapore", "Bali", "Turkey", "Europe", "Maldives", "Sri Lanka"]
}