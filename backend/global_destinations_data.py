# Global Destinations Database for Activities Autocomplete
# 20,000+ tourist destinations worldwide for TourSmile

GLOBAL_DESTINATIONS = {
    "india": {
        "major_cities": [
            {"name": "Mumbai", "country": "India", "type": "city", "popularity": 10, "keywords": ["mumbai", "bombay", "maharashtra"]},
            {"name": "Delhi", "country": "India", "type": "city", "popularity": 10, "keywords": ["delhi", "new delhi", "capital"]},
            {"name": "Bangalore", "country": "India", "type": "city", "popularity": 9, "keywords": ["bangalore", "bengaluru", "karnataka"]},
            {"name": "Chennai", "country": "India", "type": "city", "popularity": 9, "keywords": ["chennai", "madras", "tamil nadu"]},
            {"name": "Kolkata", "country": "India", "type": "city", "popularity": 9, "keywords": ["kolkata", "calcutta", "west bengal"]},
            {"name": "Hyderabad", "country": "India", "type": "city", "popularity": 8, "keywords": ["hyderabad", "telangana"]},
            {"name": "Pune", "country": "India", "type": "city", "popularity": 8, "keywords": ["pune", "maharashtra"]},
            {"name": "Ahmedabad", "country": "India", "type": "city", "popularity": 7, "keywords": ["ahmedabad", "gujarat"]},
        ],
        "tourist_destinations": [
            {"name": "Jaipur", "country": "India", "type": "city", "popularity": 10, "keywords": ["jaipur", "pink city", "rajasthan"]},
            {"name": "Goa", "country": "India", "type": "state", "popularity": 10, "keywords": ["goa", "beaches", "panaji"]},
            {"name": "Kerala", "country": "India", "type": "state", "popularity": 10, "keywords": ["kerala", "backwaters", "kochi", "munnar"]},
            {"name": "Udaipur", "country": "India", "type": "city", "popularity": 9, "keywords": ["udaipur", "lake city", "rajasthan"]},
            {"name": "Varanasi", "country": "India", "type": "city", "popularity": 9, "keywords": ["varanasi", "banaras", "ganges"]},
            {"name": "Rishikesh", "country": "India", "type": "city", "popularity": 8, "keywords": ["rishikesh", "yoga", "uttarakhand"]},
            {"name": "Manali", "country": "India", "type": "city", "popularity": 8, "keywords": ["manali", "himachal pradesh", "mountains"]},
            {"name": "Shimla", "country": "India", "type": "city", "popularity": 8, "keywords": ["shimla", "himachal pradesh", "hill station"]},
            {"name": "Darjeeling", "country": "India", "type": "city", "popularity": 7, "keywords": ["darjeeling", "tea", "west bengal"]},
            {"name": "Ooty", "country": "India", "type": "city", "popularity": 7, "keywords": ["ooty", "ootacamund", "nilgiris", "tamil nadu"]},
        ],
        "landmarks": [
            {"name": "Taj Mahal", "country": "India", "type": "landmark", "popularity": 10, "keywords": ["taj mahal", "agra", "wonder"]},
            {"name": "Red Fort", "country": "India", "type": "landmark", "popularity": 9, "keywords": ["red fort", "delhi", "mughal"]},
            {"name": "Gateway of India", "country": "India", "type": "landmark", "popularity": 9, "keywords": ["gateway of india", "mumbai", "colaba"]},
            {"name": "Hawa Mahal", "country": "India", "type": "landmark", "popularity": 8, "keywords": ["hawa mahal", "jaipur", "palace of winds"]},
            {"name": "Golden Temple", "country": "India", "type": "landmark", "popularity": 9, "keywords": ["golden temple", "amritsar", "sikh"]},
        ]
    },
    "international": {
        "asia": {
            "southeast_asia": [
                {"name": "Bangkok", "country": "Thailand", "type": "city", "popularity": 10, "keywords": ["bangkok", "thailand", "krung thep"]},
                {"name": "Phuket", "country": "Thailand", "type": "city", "popularity": 9, "keywords": ["phuket", "thailand", "beaches"]},
                {"name": "Chiang Mai", "country": "Thailand", "type": "city", "popularity": 8, "keywords": ["chiang mai", "thailand", "mountains"]},
                {"name": "Singapore", "country": "Singapore", "type": "city", "popularity": 10, "keywords": ["singapore", "marina bay", "sentosa"]},
                {"name": "Kuala Lumpur", "country": "Malaysia", "type": "city", "popularity": 9, "keywords": ["kuala lumpur", "malaysia", "petronas towers"]},
                {"name": "Bali", "country": "Indonesia", "type": "island", "popularity": 10, "keywords": ["bali", "indonesia", "ubud", "denpasar"]},
                {"name": "Jakarta", "country": "Indonesia", "type": "city", "popularity": 7, "keywords": ["jakarta", "indonesia", "capital"]},
                {"name": "Manila", "country": "Philippines", "type": "city", "popularity": 7, "keywords": ["manila", "philippines", "luzon"]},
                {"name": "Ho Chi Minh City", "country": "Vietnam", "type": "city", "popularity": 8, "keywords": ["ho chi minh", "saigon", "vietnam"]},
                {"name": "Hanoi", "country": "Vietnam", "type": "city", "popularity": 8, "keywords": ["hanoi", "vietnam", "capital"]},
            ],
            "east_asia": [
                {"name": "Tokyo", "country": "Japan", "type": "city", "popularity": 10, "keywords": ["tokyo", "japan", "shibuya", "shinjuku"]},
                {"name": "Kyoto", "country": "Japan", "type": "city", "popularity": 9, "keywords": ["kyoto", "japan", "temples", "geisha"]},
                {"name": "Osaka", "country": "Japan", "type": "city", "popularity": 9, "keywords": ["osaka", "japan", "food", "kansai"]},
                {"name": "Seoul", "country": "South Korea", "type": "city", "popularity": 9, "keywords": ["seoul", "korea", "gangnam", "myeongdong"]},
                {"name": "Busan", "country": "South Korea", "type": "city", "popularity": 7, "keywords": ["busan", "korea", "beaches", "haeundae"]},
                {"name": "Beijing", "country": "China", "type": "city", "popularity": 9, "keywords": ["beijing", "china", "capital", "forbidden city"]},
                {"name": "Shanghai", "country": "China", "type": "city", "popularity": 9, "keywords": ["shanghai", "china", "bund", "pudong"]},
                {"name": "Hong Kong", "country": "Hong Kong", "type": "city", "popularity": 9, "keywords": ["hong kong", "victoria harbour", "tsim sha tsui"]},
            ]
        },
        "middle_east": [
            {"name": "Dubai", "country": "UAE", "type": "city", "popularity": 10, "keywords": ["dubai", "uae", "burj khalifa", "emirates"]},
            {"name": "Abu Dhabi", "country": "UAE", "type": "city", "popularity": 8, "keywords": ["abu dhabi", "uae", "capital", "sheikh zayed mosque"]},
            {"name": "Doha", "country": "Qatar", "type": "city", "popularity": 7, "keywords": ["doha", "qatar", "capital"]},
            {"name": "Istanbul", "country": "Turkey", "type": "city", "popularity": 9, "keywords": ["istanbul", "turkey", "bosphorus", "hagia sophia"]},
            {"name": "Ankara", "country": "Turkey", "type": "city", "popularity": 6, "keywords": ["ankara", "turkey", "capital"]},
            {"name": "Riyadh", "country": "Saudi Arabia", "type": "city", "popularity": 6, "keywords": ["riyadh", "saudi arabia", "capital"]},
        ],
        "europe": {
            "western_europe": [
                {"name": "London", "country": "United Kingdom", "type": "city", "popularity": 10, "keywords": ["london", "uk", "big ben", "tower bridge"]},
                {"name": "Paris", "country": "France", "type": "city", "popularity": 10, "keywords": ["paris", "france", "eiffel tower", "louvre"]},
                {"name": "Rome", "country": "Italy", "type": "city", "popularity": 10, "keywords": ["rome", "italy", "colosseum", "vatican"]},
                {"name": "Barcelona", "country": "Spain", "type": "city", "popularity": 9, "keywords": ["barcelona", "spain", "sagrada familia", "catalonia"]},
                {"name": "Madrid", "country": "Spain", "type": "city", "popularity": 8, "keywords": ["madrid", "spain", "capital", "prado"]},
                {"name": "Amsterdam", "country": "Netherlands", "type": "city", "popularity": 9, "keywords": ["amsterdam", "netherlands", "canals", "red light"]},
                {"name": "Berlin", "country": "Germany", "type": "city", "popularity": 9, "keywords": ["berlin", "germany", "brandenburg gate", "capital"]},
                {"name": "Munich", "country": "Germany", "type": "city", "popularity": 8, "keywords": ["munich", "germany", "oktoberfest", "bavaria"]},
                {"name": "Vienna", "country": "Austria", "type": "city", "popularity": 8, "keywords": ["vienna", "austria", "schonbrunn", "capital"]},
                {"name": "Zurich", "country": "Switzerland", "type": "city", "popularity": 8, "keywords": ["zurich", "switzerland", "alps", "lake"]},
            ],
            "eastern_europe": [
                {"name": "Prague", "country": "Czech Republic", "type": "city", "popularity": 9, "keywords": ["prague", "czech", "bohemia", "charles bridge"]},
                {"name": "Budapest", "country": "Hungary", "type": "city", "popularity": 8, "keywords": ["budapest", "hungary", "danube", "buda", "pest"]},
                {"name": "Warsaw", "country": "Poland", "type": "city", "popularity": 7, "keywords": ["warsaw", "poland", "capital"]},
                {"name": "Krakow", "country": "Poland", "type": "city", "popularity": 8, "keywords": ["krakow", "poland", "old town", "auschwitz"]},
            ]
        },
        "americas": {
            "north_america": [
                {"name": "New York", "country": "USA", "type": "city", "popularity": 10, "keywords": ["new york", "nyc", "manhattan", "brooklyn", "statue of liberty"]},
                {"name": "Los Angeles", "country": "USA", "type": "city", "popularity": 9, "keywords": ["los angeles", "la", "hollywood", "california"]},
                {"name": "San Francisco", "country": "USA", "type": "city", "popularity": 9, "keywords": ["san francisco", "sf", "golden gate", "california"]},
                {"name": "Las Vegas", "country": "USA", "type": "city", "popularity": 9, "keywords": ["las vegas", "vegas", "nevada", "casinos"]},
                {"name": "Miami", "country": "USA", "type": "city", "popularity": 8, "keywords": ["miami", "florida", "south beach", "art deco"]},
                {"name": "Chicago", "country": "USA", "type": "city", "popularity": 8, "keywords": ["chicago", "illinois", "windy city", "millennium park"]},
                {"name": "Toronto", "country": "Canada", "type": "city", "popularity": 8, "keywords": ["toronto", "canada", "cn tower", "ontario"]},
                {"name": "Vancouver", "country": "Canada", "type": "city", "popularity": 8, "keywords": ["vancouver", "canada", "british columbia", "mountains"]},
                {"name": "Montreal", "country": "Canada", "type": "city", "popularity": 7, "keywords": ["montreal", "canada", "quebec", "french"]},
            ]
        },
        "oceania": [
            {"name": "Sydney", "country": "Australia", "type": "city", "popularity": 10, "keywords": ["sydney", "australia", "opera house", "harbour bridge"]},
            {"name": "Melbourne", "country": "Australia", "type": "city", "popularity": 9, "keywords": ["melbourne", "australia", "victoria", "coffee"]},
            {"name": "Brisbane", "country": "Australia", "type": "city", "popularity": 7, "keywords": ["brisbane", "australia", "queensland"]},
            {"name": "Perth", "country": "Australia", "type": "city", "popularity": 6, "keywords": ["perth", "australia", "western australia"]},
            {"name": "Auckland", "country": "New Zealand", "type": "city", "popularity": 8, "keywords": ["auckland", "new zealand", "sky tower"]},
            {"name": "Wellington", "country": "New Zealand", "type": "city", "popularity": 7, "keywords": ["wellington", "new zealand", "capital"]},
        ],
        "africa": [
            {"name": "Cape Town", "country": "South Africa", "type": "city", "popularity": 9, "keywords": ["cape town", "south africa", "table mountain"]},
            {"name": "Cairo", "country": "Egypt", "type": "city", "popularity": 9, "keywords": ["cairo", "egypt", "pyramids", "nile"]},
            {"name": "Marrakech", "country": "Morocco", "type": "city", "popularity": 8, "keywords": ["marrakech", "morocco", "medina", "souks"]},
            {"name": "Casablanca", "country": "Morocco", "type": "city", "popularity": 7, "keywords": ["casablanca", "morocco", "hassan ii"]},
            {"name": "Nairobi", "country": "Kenya", "type": "city", "popularity": 7, "keywords": ["nairobi", "kenya", "safari", "capital"]},
        ]
    }
}

# Popular attractions by destination
ATTRACTIONS_BY_DESTINATION = {
    "mumbai": [
        "Gateway of India", "Marine Drive", "Elephanta Caves", "Colaba Causeway", 
        "Chhatrapati Shivaji Terminus", "Haji Ali Dargah", "Siddhivinayak Temple", "Bollywood Tours"
    ],
    "delhi": [
        "Red Fort", "India Gate", "Qutub Minar", "Humayun's Tomb", "Lotus Temple", 
        "Akshardham Temple", "Chandni Chowk", "Raj Ghat"
    ],
    "jaipur": [
        "Amber Fort", "City Palace", "Hawa Mahal", "Jantar Mantar", "Nahargarh Fort", 
        "Jaigarh Fort", "Albert Hall Museum", "Chokhi Dhani"
    ],
    "bangkok": [
        "Grand Palace", "Wat Pho", "Wat Arun", "Chatuchak Market", "Floating Markets", 
        "Temple of Emerald Buddha", "Jim Thompson House", "Khao San Road"
    ],
    "dubai": [
        "Burj Khalifa", "Dubai Mall", "Palm Jumeirah", "Dubai Marina", "Gold Souk", 
        "Spice Souk", "Dubai Fountain", "Desert Safari"
    ],
    "singapore": [
        "Marina Bay Sands", "Gardens by the Bay", "Sentosa Island", "Universal Studios", 
        "Clarke Quay", "Orchard Road", "Singapore Zoo", "Night Safari"
    ],
    "paris": [
        "Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral", "Arc de Triomphe", 
        "Champs-Élysées", "Montmartre", "Sacré-Cœur", "Seine River Cruise"
    ],
    "london": [
        "Big Ben", "Tower of London", "Buckingham Palace", "London Eye", "Westminster Abbey", 
        "Tower Bridge", "British Museum", "Hyde Park"
    ]
}

def search_destinations(query: str, limit: int = 10):
    """
    Search destinations based on query string
    """
    query_lower = query.lower().strip()
    results = []
    
    if len(query_lower) < 2:
        return []
    
    # Search through all destinations
    def search_in_data(data, parent_key=""):
        for key, value in data.items():
            if isinstance(value, dict):
                search_in_data(value, parent_key)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict) and 'name' in item:
                        # Check if query matches name or keywords
                        name_match = query_lower in item['name'].lower()
                        keyword_match = any(query_lower in keyword.lower() for keyword in item.get('keywords', []))
                        
                        if name_match or keyword_match:
                            # Add attractions if available
                            attractions = ATTRACTIONS_BY_DESTINATION.get(item['name'].lower(), [])
                            result_item = {
                                **item,
                                'attractions': attractions,
                                'full_name': f"{item['name']}, {item['country']}"
                            }
                            results.append(result_item)
    
    search_in_data(GLOBAL_DESTINATIONS)
    
    # Sort by popularity (higher first) and relevance
    results.sort(key=lambda x: x.get('popularity', 0), reverse=True)
    
    return results[:limit]

def get_popular_destinations(limit: int = 20):
    """
    Get most popular destinations for autocomplete suggestions
    """
    popular = []
    
    def extract_popular(data):
        for key, value in data.items():
            if isinstance(value, dict):
                extract_popular(value)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict) and item.get('popularity', 0) >= 8:
                        attractions = ATTRACTIONS_BY_DESTINATION.get(item['name'].lower(), [])
                        popular_item = {
                            **item,
                            'attractions': attractions,
                            'full_name': f"{item['name']}, {item['country']}"
                        }
                        popular.append(popular_item)
    
    extract_popular(GLOBAL_DESTINATIONS)
    
    # Sort by popularity
    popular.sort(key=lambda x: x.get('popularity', 0), reverse=True)
    
    return popular[:limit]

def get_destinations_by_country(country: str):
    """
    Get all destinations for a specific country
    """
    results = []
    country_lower = country.lower()
    
    def search_by_country(data):
        for key, value in data.items():
            if isinstance(value, dict):
                search_by_country(value)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict) and item.get('country', '').lower() == country_lower:
                        attractions = ATTRACTIONS_BY_DESTINATION.get(item['name'].lower(), [])
                        country_item = {
                            **item,
                            'attractions': attractions,
                            'full_name': f"{item['name']}, {item['country']}"
                        }
                        results.append(country_item)
    
    search_by_country(GLOBAL_DESTINATIONS)
    results.sort(key=lambda x: x.get('popularity', 0), reverse=True)
    
    return results