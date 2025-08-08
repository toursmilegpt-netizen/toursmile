import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import HeroVideo from './HeroVideo';
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Popular Indian and International cities for autocomplete
const POPULAR_CITIES = [
  // Indian Cities
  { code: "DEL", name: "Delhi", fullName: "Delhi, India" },
  { code: "BOM", name: "Mumbai", fullName: "Mumbai, India" }, 
  { code: "BLR", name: "Bangalore", fullName: "Bangalore, India" },
  { code: "MAA", name: "Chennai", fullName: "Chennai, India" },
  { code: "CCU", name: "Kolkata", fullName: "Kolkata, India" },
  { code: "HYD", name: "Hyderabad", fullName: "Hyderabad, India" },
  { code: "PNQ", name: "Pune", fullName: "Pune, India" },
  { code: "AMD", name: "Ahmedabad", fullName: "Ahmedabad, India" },
  { code: "GOI", name: "Goa", fullName: "Goa, India" },
  { code: "COK", name: "Kochi", fullName: "Kochi, India" },
  { code: "JAI", name: "Jaipur", fullName: "Jaipur, India" },
  { code: "LKO", name: "Lucknow", fullName: "Lucknow, India" },
  { code: "CJB", name: "Coimbatore", fullName: "Coimbatore, India" },
  { code: "TRV", name: "Trivandrum", fullName: "Trivandrum, India" },
  { code: "BBI", name: "Bhubaneswar", fullName: "Bhubaneswar, India" },
  { code: "IXC", name: "Chandigarh", fullName: "Chandigarh, India" },
  { code: "NAG", name: "Nagpur", fullName: "Nagpur, India" },
  { code: "IXM", name: "Madurai", fullName: "Madurai, India" },
  { code: "VNS", name: "Varanasi", fullName: "Varanasi, India" },
  { code: "IXB", name: "Bagdogra", fullName: "Bagdogra, India" },
  
  // Popular International Destinations
  // Middle East
  { code: "DXB", name: "Dubai", fullName: "Dubai, UAE" },
  { code: "AUH", name: "Abu Dhabi", fullName: "Abu Dhabi, UAE" },
  { code: "DOH", name: "Doha", fullName: "Doha, Qatar" },
  { code: "KWI", name: "Kuwait City", fullName: "Kuwait City, Kuwait" },
  { code: "RUH", name: "Riyadh", fullName: "Riyadh, Saudi Arabia" },
  { code: "JED", name: "Jeddah", fullName: "Jeddah, Saudi Arabia" },
  { code: "MCT", name: "Muscat", fullName: "Muscat, Oman" },
  { code: "BAH", name: "Bahrain", fullName: "Manama, Bahrain" },
  
  // Southeast Asia
  { code: "SIN", name: "Singapore", fullName: "Singapore" },
  { code: "KUL", name: "Kuala Lumpur", fullName: "Kuala Lumpur, Malaysia" },
  { code: "BKK", name: "Bangkok", fullName: "Bangkok, Thailand" },
  { code: "CGK", name: "Jakarta", fullName: "Jakarta, Indonesia" },
  { code: "MNL", name: "Manila", fullName: "Manila, Philippines" },
  { code: "HAN", name: "Hanoi", fullName: "Hanoi, Vietnam" },
  { code: "SGN", name: "Ho Chi Minh City", fullName: "Ho Chi Minh City, Vietnam" },
  { code: "PNH", name: "Phnom Penh", fullName: "Phnom Penh, Cambodia" },
  { code: "RGN", name: "Yangon", fullName: "Yangon, Myanmar" },
  
  // East Asia
  { code: "NRT", name: "Tokyo", fullName: "Tokyo (Narita), Japan" },
  { code: "HND", name: "Tokyo Haneda", fullName: "Tokyo (Haneda), Japan" },
  { code: "ICN", name: "Seoul", fullName: "Seoul, South Korea" },
  { code: "PEK", name: "Beijing", fullName: "Beijing, China" },
  { code: "PVG", name: "Shanghai", fullName: "Shanghai, China" },
  { code: "HKG", name: "Hong Kong", fullName: "Hong Kong" },
  { code: "TPE", name: "Taipei", fullName: "Taipei, Taiwan" },
  
  // Europe
  { code: "LHR", name: "London", fullName: "London (Heathrow), UK" },
  { code: "LGW", name: "London Gatwick", fullName: "London (Gatwick), UK" },
  { code: "CDG", name: "Paris", fullName: "Paris (Charles de Gaulle), France" },
  { code: "FRA", name: "Frankfurt", fullName: "Frankfurt, Germany" },
  { code: "MUC", name: "Munich", fullName: "Munich, Germany" },
  { code: "AMS", name: "Amsterdam", fullName: "Amsterdam, Netherlands" },
  { code: "ZUR", name: "Zurich", fullName: "Zurich, Switzerland" },
  { code: "VIE", name: "Vienna", fullName: "Vienna, Austria" },
  { code: "FCO", name: "Rome", fullName: "Rome, Italy" },
  { code: "MAD", name: "Madrid", fullName: "Madrid, Spain" },
  { code: "BCN", name: "Barcelona", fullName: "Barcelona, Spain" },
  { code: "IST", name: "Istanbul", fullName: "Istanbul, Turkey" },
  { code: "SVO", name: "Moscow", fullName: "Moscow, Russia" },
  
  // North America
  { code: "JFK", name: "New York", fullName: "New York (JFK), USA" },
  { code: "LGA", name: "New York LaGuardia", fullName: "New York (LaGuardia), USA" },
  { code: "EWR", name: "Newark", fullName: "Newark, USA" },
  { code: "LAX", name: "Los Angeles", fullName: "Los Angeles, USA" },
  { code: "SFO", name: "San Francisco", fullName: "San Francisco, USA" },
  { code: "ORD", name: "Chicago", fullName: "Chicago, USA" },
  { code: "MIA", name: "Miami", fullName: "Miami, USA" },
  { code: "DFW", name: "Dallas", fullName: "Dallas, USA" },
  { code: "YYZ", name: "Toronto", fullName: "Toronto, Canada" },
  { code: "YVR", name: "Vancouver", fullName: "Vancouver, Canada" },
  
  // Australia & Oceania
  { code: "SYD", name: "Sydney", fullName: "Sydney, Australia" },
  { code: "MEL", name: "Melbourne", fullName: "Melbourne, Australia" },
  { code: "BNE", name: "Brisbane", fullName: "Brisbane, Australia" },
  { code: "PER", name: "Perth", fullName: "Perth, Australia" },
  { code: "AKL", name: "Auckland", fullName: "Auckland, New Zealand" },
  
  // Africa
  { code: "CAI", name: "Cairo", fullName: "Cairo, Egypt" },
  { code: "JNB", name: "Johannesburg", fullName: "Johannesburg, South Africa" },
  { code: "CPT", name: "Cape Town", fullName: "Cape Town, South Africa" },
  { code: "NBO", name: "Nairobi", fullName: "Nairobi, Kenya" },
  { code: "ADD", name: "Addis Ababa", fullName: "Addis Ababa, Ethiopia" },
  
  // South America
  { code: "GRU", name: "São Paulo", fullName: "São Paulo, Brazil" },
  { code: "GIG", name: "Rio de Janeiro", fullName: "Rio de Janeiro, Brazil" },
  { code: "EZE", name: "Buenos Aires", fullName: "Buenos Aires, Argentina" },
  { code: "SCL", name: "Santiago", fullName: "Santiago, Chile" },
  { code: "LIM", name: "Lima", fullName: "Lima, Peru" },
  
  // Popular vacation destinations
  { code: "MLE", name: "Maldives", fullName: "Malé, Maldives" },
  { code: "CMB", name: "Colombo", fullName: "Colombo, Sri Lanka" },
  { code: "KTM", name: "Kathmandu", fullName: "Kathmandu, Nepal" },
  { code: "DAC", name: "Dhaka", fullName: "Dhaka, Bangladesh" },
  { code: "TAS", name: "Tashkent", fullName: "Tashkent, Uzbekistan" },
  { code: "BKS", name: "Bangkok", fullName: "Bangkok, Thailand" },
  { code: "DPS", name: "Bali", fullName: "Denpasar (Bali), Indonesia" }
];

// City Autocomplete Component
const CityAutocomplete = ({ value, onChange, placeholder, label }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setInputValue(inputValue);
    onChange(inputValue);

    if (inputValue.length > 0) {
      const filteredSuggestions = POPULAR_CITIES.filter(city =>
        city.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        city.fullName.toLowerCase().includes(inputValue.toLowerCase()) ||
        city.code.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 8);
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city) => {
    setInputValue(city.name);
    onChange(city.name);
    setShowSuggestions(false);
  };

  const handleBlur = (e) => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleFocus = () => {
    if (inputValue.length > 0) {
      const filteredSuggestions = POPULAR_CITIES.filter(city =>
        city.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        city.fullName.toLowerCase().includes(inputValue.toLowerCase()) ||
        city.code.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 8);
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    }
  };

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          ✈️
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto"
          >
            {suggestions.map((city, index) => (
              <div
                key={city.code}
                onClick={() => handleSuggestionClick(city)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{city.name}</div>
                    <div className="text-sm text-gray-500">{city.fullName}</div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                    {city.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [popularTrips, setPopularTrips] = useState([]);
  const [featuredTrips, setFeaturedTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [tripFilters, setTripFilters] = useState({
    region: '',
    theme: '',
    maxBudget: '',
    duration: ''
  });
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [commandBarInput, setCommandBarInput] = useState('');
  const [commandBarProcessing, setCommandBarProcessing] = useState(false);
  const [showCommandBar, setShowCommandBar] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch featured trips on component mount
  useEffect(() => {
    fetchFeaturedTrips();
  }, []);

  // Auto-load popular trips when Popular Trips tab is opened
  useEffect(() => {
    if (activeTab === 'popular-trips' && popularTrips.length === 0 && featuredTrips.length > 0) {
      // Load all trips (increase limit to show more than just 6 featured trips)
      fetchPopularTrips({});
    }
  }, [activeTab]);

  const fetchFeaturedTrips = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/featured-trips?limit=6`);
      const data = await response.json();
      if (data.success) {
        setFeaturedTrips(data.featured_trips);
      }
    } catch (error) {
      console.error('Error fetching featured trips:', error);
    }
  };

  const fetchPopularTrips = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.region) queryParams.append('region', filters.region);
      if (filters.theme) queryParams.append('theme', filters.theme);
      if (filters.maxBudget) queryParams.append('max_budget', filters.maxBudget);
      if (filters.duration) {
        const [min, max] = filters.duration.split('-');
        queryParams.append('min_nights', min);
        queryParams.append('max_nights', max);
      }
      
      // Default to showing more trips (50 instead of 20)
      if (!queryParams.has('limit')) {
        queryParams.append('limit', '50');
      }
      
      const response = await fetch(`${BACKEND_URL}/api/popular-trips?${queryParams}`);
      const data = await response.json();
      if (data.success) {
        setPopularTrips(data.trips);
      }
    } catch (error) {
      console.error('Error fetching popular trips:', error);
    }
  };

  const handleTripInquiry = async (tripId) => {
    // For now, show alert - in production this would open a proper inquiry form
    alert(`Thank you for your interest! Please call us at +91-XXXXXXXXXX to book trip ${tripId} or use our AI assistant for more details.`);
  };

  const handleTripClick = async (tripId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/popular-trips/${tripId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedTrip(data.trip);
        setShowTripDetails(true);
      } else {
        console.error('Trip not found:', tripId);
        alert('Trip details not found. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
      alert('Error loading trip details. Please try again.');
    }
  };

  const closeTripDetails = () => {
    setShowTripDetails(false);
    setSelectedTrip(null);
  };

  // Global destination search for activities
  const searchDestinations = async (query) => {
    if (query.length < 2) {
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/destinations/search?query=${encodeURIComponent(query)}&limit=8`);
      const data = await response.json();
      
      if (data.success) {
        setDestinationSuggestions(data.destinations);
        setShowDestinationSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching destinations:', error);
    }
  };

  const selectDestination = (destination) => {
    setSelectedLocation(destination.full_name || destination.name);
    setShowDestinationSuggestions(false);
    setDestinationSuggestions([]);
  };

  // Flight search state
  const [flightSearch, setFlightSearch] = useState({
    tripType: 'oneway', // oneway, return, multicity
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    class_type: 'economy',
    specialFares: {
      seniorCitizen: false,
      student: false,
      armedForces: false
    },
    preferences: {
      directFlights: false,
      flexibleDates: false
    },
    multiCityFlights: [
      { origin: '', destination: '', departure_date: '' },
      { origin: '', destination: '', departure_date: '' }
    ]
  });
  const [flightResults, setFlightResults] = useState([]);
  const [flightSearching, setFlightSearching] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showFareOptions, setShowFareOptions] = useState({});
  const [flightFilters, setFlightFilters] = useState({
    sortBy: 'price',
    priceRange: [0, 20000],
    airlines: [],
    stops: [],
    departureTime: [],
    fareTypes: []
  });

  // Flight Booking State Management
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Flight Details, 2: Passengers, 3: Seats, 4: Add-ons, 5: Payment, 6: Confirmation
  const [selectedFareType, setSelectedFareType] = useState(null);
  const [bookingData, setBookingData] = useState({
    flight: null,
    fareType: null,
    passengers: [],
    seats: [],
    addons: {
      meals: [],
      baggage: [],
      insurance: false
    },
    contactDetails: {
      email: '',
      phone: '',
      alternatePhone: ''
    },
    totalAmount: 0,
    bookingReference: null
  });
  const [passengerForms, setPassengerForms] = useState([]);
  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState({});
  const [bookingLoading, setBookingLoading] = useState(false);

  // AI Search State
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [currentHighlightedField, setCurrentHighlightedField] = useState('origin');

  // Hotel search state
  const [hotelSearch, setHotelSearch] = useState({
    location: '',
    checkin_date: '',
    checkout_date: '',
    guests: 1,
    rooms: 1
  });
  const [hotelResults, setHotelResults] = useState([]);
  const [hotelSearching, setHotelSearching] = useState(false);

  // Activities state
  const [activities, setActivities] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  // Itinerary state
  const [itineraryForm, setItineraryForm] = useState({
    destination: '',
    days: 3,
    budget: 'medium',
    interests: []
  });
  const [generatedItinerary, setGeneratedItinerary] = useState('');
  const [generatingItinerary, setGeneratingItinerary] = useState(false);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Keyboard shortcut for command bar (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandBar(true);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { type: 'user', message: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: chatInput,
        session_id: sessionId
      });

      const aiMessage = { type: 'ai', message: response.data.response };
      setChatMessages(prev => [...prev, aiMessage]);
      setSessionId(response.data.session_id);
    } catch (error) {
      const errorMessage = { type: 'ai', message: 'Sorry, I encountered an error. Please try again.' };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setChatInput('');
    }
  };

  const searchFlights = async () => {
    if (!flightSearch.origin || !flightSearch.destination || !flightSearch.departure_date) {
      alert('Please fill in all required fields');
      return;
    }

    setFlightSearching(true);
    try {
      // Fix passengers format for backend - send total count as integer
      const flightRequestData = {
        ...flightSearch,
        passengers: flightSearch.passengers.adults + flightSearch.passengers.children + flightSearch.passengers.infants
      };
      
      const response = await axios.post(`${API}/flights/search`, flightRequestData);
      setFlightResults(response.data.flights);
    } catch (error) {
      console.error('Flight search error:', error);
      alert('Failed to search flights. Please try again.');
    } finally {
      setFlightSearching(false);
    }
  };

  const searchHotels = async () => {
    if (!hotelSearch.location || !hotelSearch.checkin_date || !hotelSearch.checkout_date) {
      alert('Please fill in all required fields');
      return;
    }

    setHotelSearching(true);
    try {
      const response = await axios.post(`${API}/hotels/search`, hotelSearch);
      setHotelResults(response.data.hotels);
    } catch (error) {
      console.error('Hotel search error:', error);
      alert('Failed to search hotels. Please try again.');
    } finally {
      setHotelSearching(false);
    }
  };

  const getActivities = async (location) => {
    try {
      const response = await axios.get(`${API}/activities/${location}`);
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Activities error:', error);
    }
  };

  const searchActivities = () => {
    if (selectedLocation.trim()) {
      getActivities(selectedLocation);
    }
  };

  const generateItinerary = async () => {
    if (!itineraryForm.destination) {
      alert('Please enter a destination');
      return;
    }

    setGeneratingItinerary(true);
    try {
      const response = await axios.post(`${API}/itinerary/generate`, itineraryForm);
      setGeneratedItinerary(response.data.itinerary);
    } catch (error) {
      console.error('Itinerary generation error:', error);
      alert('Failed to generate itinerary. Please try again.');
    } finally {
      setGeneratingItinerary(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // AI Search Processing Function
  const processAISearch = async (query) => {
    setAiSearchLoading(true);
    
    try {
      console.log('🤖 Processing AI search:', query);
      
      // Send query to backend AI processing
      const response = await axios.post(`${API}/ai/parse-travel-query`, {
        query: query,
        context: 'flight_search'
      });
      
      if (response.data.success) {
        const parsed = response.data.parsed;
        
        // Auto-fill flight search form based on AI parsing
        setFlightSearch({
          origin: parsed.origin || '',
          destination: parsed.destination || '',
          departure_date: parsed.departure_date || '',
          return_date: parsed.return_date || '',
          passengers: {
            adults: parsed.adults || 1,
            children: parsed.children || 0,
            infants: parsed.infants || 0
          },
          tripType: parsed.trip_type || 'oneway',
          class: parsed.class || 'economy',
          multiCityFlights: parsed.multi_city || [
            { origin: '', destination: '', departure_date: '' },
            { origin: '', destination: '', departure_date: '' }
          ]
        });
        
        // Auto-trigger search if all required fields are populated
        if (parsed.origin && parsed.destination && parsed.departure_date) {
          console.log('🎯 AI parsed complete search - auto-executing...');
          await searchFlights();
        } else {
          // Show manual form with populated fields for completion
          setShowManualSearch(true);
          highlightNextRequiredField(parsed);
        }
        
      } else {
        // Fallback: Show manual form
        setShowManualSearch(true);
        alert('I understood some parts of your request. Please complete the details below.');
      }
      
    } catch (error) {
      console.error('AI Search Error:', error);
      // Graceful fallback to manual form
      setShowManualSearch(true);
      alert('Let me help you search manually. Please fill in the details below.');
    } finally {
      setAiSearchLoading(false);
    }
  };

  const highlightNextRequiredField = (parsed) => {
    // Determine which field to highlight next based on what's missing
    if (!parsed.origin) {
      setCurrentHighlightedField('origin');
    } else if (!parsed.destination) {
      setCurrentHighlightedField('destination');
    } else if (!parsed.departure_date) {
      setCurrentHighlightedField('departure_date');
    } else if (parsed.trip_type === 'return' && !parsed.return_date) {
      setCurrentHighlightedField('return_date');
    } else {
      setCurrentHighlightedField('search_button');
    }
  };

  const handleAISearchSubmit = (e) => {
    e.preventDefault();
    if (aiSearchQuery.trim()) {
      processAISearch(aiSearchQuery.trim());
    }
  };

  const processCommandBarInput = async () => {
    if (!commandBarInput.trim()) return;

    setCommandBarProcessing(true);
    
    try {
      const response = await axios.post(`${API}/chat`, {
        message: `Parse this flight search request and return ONLY a JSON object with the extracted information: "${commandBarInput}". 
        
        Return JSON in this exact format:
        {
          "tripType": "oneway|return|multicity",
          "origin": "city name",
          "destination": "city name", 
          "departure_date": "YYYY-MM-DD",
          "return_date": "YYYY-MM-DD or null",
          "adults": number,
          "children": number,
          "infants": number,
          "class_type": "economy|premium_economy|business|first"
        }
        
        Extract information from natural language. If information is missing, use reasonable defaults. Only return the JSON, no other text.`,
        session_id: sessionId || `cmd-${Date.now()}`
      });

      let parsedData;
      try {
        // Try to extract JSON from the AI response
        const jsonMatch = response.data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        // Fallback: try to extract basic info using regex
        parsedData = extractBasicFlightInfo(commandBarInput);
      }

      // Update flight search form with parsed data
      if (parsedData) {
        setFlightSearch({
          ...flightSearch,
          tripType: parsedData.tripType || 'oneway',
          origin: parsedData.origin || '',
          destination: parsedData.destination || '',
          departure_date: parsedData.departure_date || '',
          return_date: parsedData.return_date || '',
          passengers: {
            adults: parsedData.adults || 1,
            children: parsedData.children || 0,
            infants: parsedData.infants || 0
          },
          class_type: parsedData.class_type || 'economy'
        });

        // Switch to flights tab and trigger search
        setActiveTab('flights');
        
        // Give a moment for the form to update, then search
        setTimeout(() => {
          if (parsedData.origin && parsedData.destination && parsedData.departure_date) {
            searchFlights();
          }
        }, 500);

        // Show success message
        alert(`✅ Parsed your request! Searching flights from ${parsedData.origin} to ${parsedData.destination}`);
      }

    } catch (error) {
      console.error('Command bar processing error:', error);
      // Fallback parsing
      const fallbackData = extractBasicFlightInfo(commandBarInput);
      if (fallbackData.origin && fallbackData.destination) {
        setFlightSearch({
          ...flightSearch,
          origin: fallbackData.origin,
          destination: fallbackData.destination,
          departure_date: fallbackData.departure_date || '',
          passengers: {
            adults: fallbackData.adults || 1,
            children: 0,
            infants: 0
          }
        });
        setActiveTab('flights');
        alert(`✅ Found basic info! Please verify the details and search.`);
      } else {
        alert('❌ Could not parse your request. Please try again with more details like "Delhi to Mumbai on March 15"');
      }
    } finally {
      setCommandBarProcessing(false);
      setCommandBarInput('');
      setShowCommandBar(false);
    }
  };

  // Fallback function to extract basic flight info using regex
  const extractBasicFlightInfo = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Extract cities (simple pattern)
    const fromMatch = lowerInput.match(/from\s+([a-zA-Z\s]+?)(?:\s+to|\s+→)/);
    const toMatch = lowerInput.match(/to\s+([a-zA-Z\s]+?)(?:\s+on|\s+date|\s+for|\s*$)/);
    
    // Extract date patterns
    const datePatterns = [
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
      /(\d{4}-\d{1,2}-\d{1,2})/,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}/i
    ];
    
    let extractedDate = '';
    for (const pattern of datePatterns) {
      const match = input.match(pattern);
      if (match) {
        extractedDate = match[1];
        break;
      }
    }

    // Extract passenger count
    const passengersMatch = lowerInput.match(/(\d+)\s*(?:adults?|passengers?|people)/);
    const adults = passengersMatch ? parseInt(passengersMatch[1]) : 1;

    // Extract class
    let classType = 'economy';
    if (lowerInput.includes('business')) classType = 'business';
    else if (lowerInput.includes('first')) classType = 'first';
    else if (lowerInput.includes('premium')) classType = 'premium_economy';

    return {
      origin: fromMatch ? fromMatch[1].trim() : '',
      destination: toMatch ? toMatch[1].trim() : '',
      departure_date: extractedDate,
      adults: adults,
      class_type: classType,
      tripType: lowerInput.includes('return') || lowerInput.includes('round') ? 'return' : 'oneway'
    };
  };

  // Flight Booking Flow Functions
  const startBookingFlow = (flight, fareType) => {
    console.log('Starting booking flow for:', flight.airline, flight.flight_number);
    
    // Initialize booking data
    const initialPassengers = [];
    const totalPassengers = flightSearch.passengers.adults + flightSearch.passengers.children + flightSearch.passengers.infants;
    
    // Create passenger forms based on search criteria
    for (let i = 0; i < flightSearch.passengers.adults; i++) {
      initialPassengers.push({
        type: 'adult',
        title: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: 'IN',
        passportNumber: '',
        passportExpiry: '',
        panCard: '',
        gender: '',
        frequentFlyerNumber: ''
      });
    }
    
    for (let i = 0; i < flightSearch.passengers.children; i++) {
      initialPassengers.push({
        type: 'child',
        title: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: 'IN',
        passportNumber: '',
        passportExpiry: '',
        gender: ''
      });
    }
    
    for (let i = 0; i < flightSearch.passengers.infants; i++) {
      initialPassengers.push({
        type: 'infant',
        title: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: 'IN',
        passportNumber: '',
        passportExpiry: '',
        gender: ''
      });
    }

    setBookingData({
      flight: flight,
      fareType: fareType,
      passengers: initialPassengers,
      seats: [],
      addons: {
        meals: [],
        baggage: [],
        insurance: false
      },
      contactDetails: {
        email: '',
        phone: '',
        alternatePhone: ''
      },
      totalAmount: fareType ? fareType.totalPrice * totalPassengers : flight.price * totalPassengers,
      bookingReference: null
    });

    setPassengerForms(initialPassengers);
    setShowBookingFlow(true);
    setBookingStep(1);
  };

  const nextBookingStep = () => {
    if (bookingStep < 6) {
      setBookingStep(bookingStep + 1);
      
      // Load seat map when moving to seat selection
      if (bookingStep === 2) {
        loadSeatMap();
      }
    }
  };

  const previousBookingStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  const loadSeatMap = async () => {
    try {
      // This will integrate with Tripjack seat map API once credentials are available
      // For now, generate a mock seat map
      const mockSeatMap = generateMockSeatMap();
      setSeatMap(mockSeatMap);
    } catch (error) {
      console.error('Error loading seat map:', error);
    }
  };

  const generateMockSeatMap = () => {
    // Generate a mock seat map similar to Tripjack structure
    const rows = 32;
    const columns = 6;
    const seats = [];
    
    const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    for (let row = 1; row <= rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (row === 13) continue; // Skip row 13 (common in aviation)
        
        const seatNo = `${row}${seatLetters[col]}`;
        const isBooked = Math.random() < 0.3; // 30% seats already booked
        const isLegroom = row <= 3 || row === 15 || row === 16;
        const isAisle = col === 2 || col === 3;
        
        let amount = 0;
        if (isLegroom) amount = 1200;
        else if (isAisle) amount = 600;
        else amount = 400;

        seats.push({
          seatNo,
          seatPosition: { row, column: col + 1 },
          isBooked,
          isLegroom,
          isAisle,
          amount,
          code: seatNo
        });
      }
    }
    
    return {
      tripSeat: {
        sData: { row: rows, column: columns },
        sInfo: seats
      }
    };
  };

  const selectSeat = (seat, passengerIndex) => {
    if (seat.isBooked) return;
    
    setSelectedSeats(prev => {
      const updated = { ...prev };
      
      // Remove previous seat selection for this passenger
      Object.keys(updated).forEach(key => {
        if (updated[key].passengerIndex === passengerIndex) {
          delete updated[key];
        }
      });
      
      // Add new seat selection
      updated[seat.seatNo] = {
        passengerIndex,
        seat,
        amount: seat.amount
      };
      
      return updated;
    });
    
    // Update total amount
    updateBookingTotal();
  };

  const updateBookingTotal = () => {
    const baseAmount = bookingData.fareType 
      ? bookingData.fareType.totalPrice * bookingData.passengers.length 
      : bookingData.flight.price * bookingData.passengers.length;
    
    const seatAmount = Object.values(selectedSeats).reduce((total, seat) => total + seat.amount, 0);
    
    const mealsAmount = bookingData.addons.meals.reduce((total, meal) => total + meal.amount, 0);
    const baggageAmount = bookingData.addons.baggage.reduce((total, bag) => total + bag.amount, 0);
    const insuranceAmount = bookingData.addons.insurance ? 500 : 0;
    
    const totalAmount = baseAmount + seatAmount + mealsAmount + baggageAmount + insuranceAmount;
    
    setBookingData(prev => ({ ...prev, totalAmount }));
  };

  const updatePassengerForm = (index, field, value) => {
    setPassengerForms(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const completeBooking = async () => {
    setBookingLoading(true);
    
    try {
      // Prepare booking payload
      const bookingPayload = {
        flight: bookingData.flight,
        fareType: bookingData.fareType,
        passengers: passengerForms,
        seats: Object.values(selectedSeats),
        addons: bookingData.addons,
        contactDetails: bookingData.contactDetails,
        totalAmount: bookingData.totalAmount,
        searchData: flightSearch
      };

      // This will integrate with Tripjack booking API
      const response = await axios.post(`${API}/flights/book`, bookingPayload);
      
      if (response.data.success) {
        setBookingData(prev => ({
          ...prev,
          bookingReference: response.data.bookingReference || `TJ${Date.now()}`
        }));
        setBookingStep(6); // Move to confirmation step
      } else {
        alert('Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelBookingFlow = () => {
    setShowBookingFlow(false);
    setBookingStep(1);
    setBookingData({
      flight: null,
      fareType: null,
      passengers: [],
      seats: [],
      addons: { meals: [], baggage: [], insurance: false },
      contactDetails: { email: '', phone: '', alternatePhone: '' },
      totalAmount: 0,
      bookingReference: null
    });
    setPassengerForms([]);
    setSelectedSeats({});
    setSeatMap(null);
  };

  const handleCommandBarKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processCommandBarInput();
    }
    if (e.key === 'Escape') {
      setShowCommandBar(false);
      setCommandBarInput('');
    }
  };

  const NavButton = ({ tabName, children, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
        isActive && tabName !== 'home'
          ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg transform scale-105' 
          : isActive && tabName === 'home'
          ? 'text-orange-600 font-semibold'
          : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_booking-buddy-5/artifacts/5qov7o4f_FINAL%20LOGO%20-%20Copy.png" 
                alt="TourSmile Logo" 
                className="h-16 w-auto"
              />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              <NavButton tabName="home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')}>
                🏠 Home
              </NavButton>
              <NavButton tabName="flights" isActive={activeTab === 'flights'} onClick={() => setActiveTab('flights')}>
                ✈️ Flights
              </NavButton>
              <NavButton tabName="hotels" isActive={activeTab === 'hotels'} onClick={() => setActiveTab('hotels')}>
                🏨 Hotels
              </NavButton>
              <NavButton tabName="activities" isActive={activeTab === 'activities'} onClick={() => setActiveTab('activities')}>
                🎯 Activities
              </NavButton>
              <NavButton tabName="popular-trips" isActive={activeTab === 'popular-trips'} onClick={() => setActiveTab('popular-trips')}>
                🌟 Popular Trips
              </NavButton>
              <NavButton tabName="itinerary" isActive={activeTab === 'itinerary'} onClick={() => setActiveTab('itinerary')}>
                🤖 AI Planner
              </NavButton>
            </nav>

            {/* Command Bar Button */}
            <div className="hidden md:flex items-center ml-4">
              <button
                onClick={() => setShowCommandBar(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-2 rounded-full hover:from-orange-700 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Press Cmd/Ctrl + K to open"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Quick Search</span>
                <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded text-white/80">⌘K</span>
              </button>
            </div>

            {/* Mobile menu button and command bar */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCommandBar(true)}
                className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 md:hidden"
              >
                🚀
              </button>
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 md:hidden"
              >
                💬
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-600 hover:text-orange-600 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200 mt-4 pt-4">
              <div className="flex flex-wrap gap-2">
                <NavButton tabName="home" isActive={activeTab === 'home'} onClick={() => {setActiveTab('home'); setIsMobileMenuOpen(false);}}>
                  🏠 Home
                </NavButton>
                <NavButton tabName="flights" isActive={activeTab === 'flights'} onClick={() => {setActiveTab('flights'); setIsMobileMenuOpen(false);}}>
                  ✈️ Flights
                </NavButton>
                <NavButton tabName="hotels" isActive={activeTab === 'hotels'} onClick={() => {setActiveTab('hotels'); setIsMobileMenuOpen(false);}}>
                  🏨 Hotels
                </NavButton>
                <NavButton tabName="activities" isActive={activeTab === 'activities'} onClick={() => {setActiveTab('activities'); setIsMobileMenuOpen(false);}}>
                  🎯 Activities
                </NavButton>
                <NavButton tabName="popular-trips" isActive={activeTab === 'popular-trips'} onClick={() => {setActiveTab('popular-trips'); setIsMobileMenuOpen(false);}}>
                  🌟 Popular Trips
                </NavButton>
                <NavButton tabName="itinerary" isActive={activeTab === 'itinerary'} onClick={() => {setActiveTab('itinerary'); setIsMobileMenuOpen(false);}}>
                  🤖 AI Planner
                </NavButton>
              </div>
            </div>
          )}
        </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div>
            {activeTab === 'home' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Hero Video Section */}
                <div className="text-center">
                  <HeroVideo />
                </div>
                
                {/* Hero Section with Command Bar Highlight */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20 hover:shadow-2xl transition-all duration-500">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
                      Unlock Extraordinary Travel Experiences
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                      Discover handcrafted journeys, exclusive destinations, and personalized service that transforms ordinary trips into unforgettable adventures.
                    </p>

                    {/* REVOLUTIONARY COMMAND BAR SHOWCASE */}
                    <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-1 rounded-2xl mb-8 shadow-2xl">
                      <div className="bg-white rounded-xl p-6 sm:p-8 relative z-10">
                        <div className="flex items-center justify-center mb-4">
                          <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                            <span className="animate-pulse">✨</span> CAREFULLY CRAFTED TRAVEL EXPERIENCES
                          </div>
                        </div>
                        
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                          Simply Describe Your Journey
                        </h2>
                        
                        <p className="text-gray-600 mb-6">
                          Our travel experts understand your needs and craft personalized experiences with human attention to detail
                        </p>

                        {/* Interactive Demo Command Bar */}
                        <div 
                          onClick={() => setShowCommandBar(true)}
                          className="relative bg-gradient-to-r from-gray-50 to-orange-50 border-2 border-dashed border-orange-400 rounded-xl p-4 sm:p-6 cursor-pointer hover:border-orange-500 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-500 group shadow-lg hover:shadow-xl animate-glow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 text-left">
                              <div className="text-lg text-gray-600 group-hover:text-orange-700 transition-colors duration-500 font-medium">
                                "Executive trip to Dubai next week, business class preferred"
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                                Try Now
                              </div>
                              <svg className="w-6 h-6 text-orange-600 group-hover:scale-110 group-hover:text-orange-700 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                          </div>
                          
                          {/* Enhanced animated border effect */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                          
                          {/* Glowing ring effect */}
                          <div className="absolute inset-0 rounded-xl ring-2 ring-orange-300 ring-opacity-50 animate-ping"></div>
                        </div>

                        {/* Professional Example Commands */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="bg-orange-50 text-orange-800 px-4 py-3 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors duration-300">
                            <span className="font-semibold">Business Travel:</span> "First class to London, flexible dates"
                          </div>
                          <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors duration-300">
                            <span className="font-semibold">Family Vacation:</span> "Premium family trip to Singapore"
                          </div>
                          <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors duration-300">
                            <span className="font-semibold">Corporate Group:</span> "Team travel to Mumbai, 8 executives"
                          </div>
                          <div className="bg-orange-50 text-orange-800 px-4 py-3 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors duration-300">
                            <span className="font-semibold">Luxury Travel:</span> "Premium weekend getaway to Goa"
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="font-medium text-orange-600">Quick Access:</span>
                            <span className="ml-2">Press Cmd/Ctrl + K from anywhere</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">⌘K</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="group text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 cursor-pointer transform hover:scale-105">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">✈️</div>
                      <h3 className="font-semibold text-gray-900 mb-2">Expert Flight Curation</h3>
                      <p className="text-gray-600 text-sm">Handpicked flights with personalized recommendations from travel specialists</p>
                    </div>
                    
                    <div className="group text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl hover:from-amber-100 hover:to-amber-200 transition-all duration-300 cursor-pointer transform hover:scale-105">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🏨</div>
                      <h3 className="font-semibold text-gray-900 mb-2">Curated Accommodations</h3>
                      <p className="text-gray-600 text-sm">Carefully selected hotels and resorts that match your preferences and standards</p>
                    </div>
                    
                    <div className="group text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 cursor-pointer transform hover:scale-105 sm:col-span-2 lg:col-span-1">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🗺️</div>
                      <h3 className="font-semibold text-gray-900 mb-2">Bespoke Trip Planning</h3>
                      <p className="text-gray-600 text-sm">Personalized itineraries crafted by experienced travel consultants</p>
                    </div>
                  </div>
                </div>

                {/* Professional CTA Section */}
                <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl shadow-xl p-1">
                  <div className="bg-white rounded-xl p-6 sm:p-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                      🎯 India's Most Personalized Travel Service Platform
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Experience handcrafted travel planning with our expert consultants who understand your unique preferences. Perfect for business executives, corporate teams, and discerning travelers.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 hover:shadow-md transition-shadow duration-300">
                        <div className="text-3xl mb-3">👥</div>
                        <h3 className="font-semibold text-orange-800 mb-2">Expert Human Consultation</h3>
                        <p className="text-orange-600 text-sm">Dedicated travel experts who listen, understand, and craft your perfect journey with personal attention</p>
                      </div>
                      
                      <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 hover:shadow-md transition-shadow duration-300">
                        <div className="text-3xl mb-3">✨</div>
                        <h3 className="font-semibold text-amber-800 mb-2">Carefully Curated Experiences</h3>
                        <p className="text-amber-600 text-sm">Handpicked accommodations, meticulously planned itineraries, and thoughtfully selected experiences</p>
                      </div>
                      
                      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow duration-300">
                        <div className="text-3xl mb-3">🏆</div>
                        <h3 className="font-semibold text-yellow-800 mb-2">Premium Service Excellence</h3>
                        <p className="text-yellow-600 text-sm">24/7 dedicated support, real-time assistance, and commitment to exceeding your expectations</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowCommandBar(true)}
                      className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-xl hover:from-orange-700 hover:to-amber-700 font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      Experience Personalized Travel Planning
                    </button>
                    
                    <div className="mt-6 text-sm text-gray-500">
                      Trusted by executives and premium travelers across India
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Popular Destinations</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500">
                      <img src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=400&fit=crop" alt="India Gate" className="w-full h-48 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                        <div className="text-white p-4 sm:p-6">
                          <h3 className="text-xl sm:text-2xl font-bold mb-1">Delhi</h3>
                          <p className="text-sm sm:text-base opacity-90">India's vibrant capital</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500">
                      <img src="https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=600&h=400&fit=crop" alt="Mumbai" className="w-full h-48 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                        <div className="text-white p-4 sm:p-6">
                          <h3 className="text-xl sm:text-2xl font-bold mb-1">Mumbai</h3>
                          <p className="text-sm sm:text-base opacity-90">The city of dreams</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'flights' && (
              <div className="space-y-6">
                {/* AI Search Section - Hero Feature */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">🤖✈️</div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      Smart Flight Search
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Just tell us your travel plans in natural language!
                    </p>
                  </div>

                  <form onSubmit={handleAISearchSubmit} className="max-w-2xl mx-auto">
                    <div className="relative">
                      <input
                        type="text"
                        value={aiSearchQuery}
                        onChange={(e) => setAiSearchQuery(e.target.value)}
                        placeholder="e.g., 'Delhi to Mumbai tomorrow 2 passengers'"
                        className="w-full pl-4 pr-16 py-4 text-base border-2 border-blue-200 rounded-2xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80"
                        disabled={aiSearchLoading}
                      />
                      <button
                        type="submit"
                        disabled={aiSearchLoading || !aiSearchQuery.trim()}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {aiSearchLoading ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                        ) : (
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                            <span className="text-sm font-semibold px-2">Search</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="text-center mt-6">
                    <button
                      onClick={() => setShowManualSearch(!showManualSearch)}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      {showManualSearch ? '🤖 Use AI Search' : '📝 Use Manual Search'}
                    </button>
                  </div>
                </div>

                {/* Manual Search Form */}
                {showManualSearch && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                  <div className="flex items-center mb-6">
                    <div className="text-3xl mr-3">✈️</div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Manual Flight Search</h2>
                  </div>
                
                {/* Trip Type Selection */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setFlightSearch({...flightSearch, tripType: 'oneway'})}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        flightSearch.tripType === 'oneway'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      One Way
                    </button>
                    <button
                      onClick={() => setFlightSearch({...flightSearch, tripType: 'return'})}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        flightSearch.tripType === 'return'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Round Trip
                    </button>
                    <button
                      onClick={() => setFlightSearch({...flightSearch, tripType: 'multicity'})}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        flightSearch.tripType === 'multicity'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Multi City
                    </button>
                  </div>
                </div>

                {/* One Way & Round Trip Form */}
                {(flightSearch.tripType === 'oneway' || flightSearch.tripType === 'return') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <CityAutocomplete
                      label="From"
                      placeholder="Origin city"
                      value={flightSearch.origin}
                      onChange={(value) => setFlightSearch({...flightSearch, origin: value})}
                    />
                    
                    <CityAutocomplete
                      label="To"
                      placeholder="Destination city"
                      value={flightSearch.destination}
                      onChange={(value) => setFlightSearch({...flightSearch, destination: value})}
                    />
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Departure</label>
                      <input
                        type="date"
                        value={flightSearch.departure_date}
                        onChange={(e) => setFlightSearch({...flightSearch, departure_date: e.target.value})}
                        className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                      />
                    </div>
                    
                    {flightSearch.tripType === 'return' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Return</label>
                        <input
                          type="date"
                          value={flightSearch.return_date}
                          onChange={(e) => setFlightSearch({...flightSearch, return_date: e.target.value})}
                          className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Multi City Form */}
                {flightSearch.tripType === 'multicity' && (
                  <div className="space-y-4 mb-6">
                    {flightSearch.multiCityFlights.map((flight, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                        <CityAutocomplete
                          label={`From ${index + 1}`}
                          placeholder="Origin city"
                          value={flight.origin}
                          onChange={(value) => {
                            const updatedFlights = [...flightSearch.multiCityFlights];
                            updatedFlights[index].origin = value;
                            setFlightSearch({...flightSearch, multiCityFlights: updatedFlights});
                          }}
                        />
                        
                        <CityAutocomplete
                          label={`To ${index + 1}`}
                          placeholder="Destination city"
                          value={flight.destination}
                          onChange={(value) => {
                            const updatedFlights = [...flightSearch.multiCityFlights];
                            updatedFlights[index].destination = value;
                            setFlightSearch({...flightSearch, multiCityFlights: updatedFlights});
                          }}
                        />
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Departure {index + 1}</label>
                          <input
                            type="date"
                            value={flight.departure_date}
                            onChange={(e) => {
                              const updatedFlights = [...flightSearch.multiCityFlights];
                              updatedFlights[index].departure_date = e.target.value;
                              setFlightSearch({...flightSearch, multiCityFlights: updatedFlights});
                            }}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => {
                        setFlightSearch({
                          ...flightSearch,
                          multiCityFlights: [...flightSearch.multiCityFlights, { origin: '', destination: '', departure_date: '' }]
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                    >
                      + Add Another City
                    </button>
                  </div>
                )}

                {/* Passengers & Class */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Passengers Dropdown */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Passengers</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                        className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 text-left flex items-center justify-between"
                      >
                        <span>
                          {flightSearch.passengers.adults + flightSearch.passengers.children + flightSearch.passengers.infants} Passenger
                          {(flightSearch.passengers.adults + flightSearch.passengers.children + flightSearch.passengers.infants) > 1 ? 's' : ''}
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showPassengerDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">Adults</div>
                                <div className="text-sm text-gray-500">12+ years</div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => setFlightSearch({
                                    ...flightSearch,
                                    passengers: {...flightSearch.passengers, adults: Math.max(1, flightSearch.passengers.adults - 1)}
                                  })}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">{flightSearch.passengers.adults}</span>
                                <button
                                  onClick={() => setFlightSearch({
                                    ...flightSearch,
                                    passengers: {...flightSearch.passengers, adults: Math.min(9, flightSearch.passengers.adults + 1)}
                                  })}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">Children</div>
                                <div className="text-sm text-gray-500">2-12 years</div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => setFlightSearch({
                                    ...flightSearch,
                                    passengers: {...flightSearch.passengers, children: Math.max(0, flightSearch.passengers.children - 1)}
                                  })}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">{flightSearch.passengers.children}</span>
                                <button
                                  onClick={() => setFlightSearch({
                                    ...flightSearch,
                                    passengers: {...flightSearch.passengers, children: Math.min(6, flightSearch.passengers.children + 1)}
                                  })}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">Infants</div>
                                <div className="text-sm text-gray-500">0-2 years</div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => setFlightSearch({
                                    ...flightSearch,
                                    passengers: {...flightSearch.passengers, infants: Math.max(0, flightSearch.passengers.infants - 1)}
                                  })}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">{flightSearch.passengers.infants}</span>
                                <button
                                  onClick={() => setFlightSearch({
                                    ...flightSearch,
                                    passengers: {...flightSearch.passengers, infants: Math.min(flightSearch.passengers.adults, flightSearch.passengers.infants + 1)}
                                  })}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setShowPassengerDropdown(false)}
                            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Travel Class */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <select
                      value={flightSearch.class_type}
                      onChange={(e) => setFlightSearch({...flightSearch, class_type: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    >
                      <option value="economy">Economy</option>
                      <option value="premium_economy">Premium Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First Class</option>
                    </select>
                  </div>
                </div>

                {/* Special Fares */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Special Fares</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={flightSearch.specialFares.seniorCitizen}
                        onChange={(e) => setFlightSearch({
                          ...flightSearch,
                          specialFares: {...flightSearch.specialFares, seniorCitizen: e.target.checked}
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-orange-500 mr-2"
                      />
                      <span className="text-sm text-gray-700">Senior Citizen (60+)</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={flightSearch.specialFares.student}
                        onChange={(e) => setFlightSearch({
                          ...flightSearch,
                          specialFares: {...flightSearch.specialFares, student: e.target.checked}
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-orange-500 mr-2"
                      />
                      <span className="text-sm text-gray-700">Student Fares</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={flightSearch.specialFares.armedForces}
                        onChange={(e) => setFlightSearch({
                          ...flightSearch,
                          specialFares: {...flightSearch.specialFares, armedForces: e.target.checked}
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-orange-500 mr-2"
                      />
                      <span className="text-sm text-gray-700">Armed Forces</span>
                    </label>
                  </div>
                </div>

                {/* Preferences */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Preferences</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={flightSearch.preferences.directFlights}
                        onChange={(e) => setFlightSearch({
                          ...flightSearch,
                          preferences: {...flightSearch.preferences, directFlights: e.target.checked}
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-orange-500 mr-2"
                      />
                      <span className="text-sm text-gray-700">Direct Flights Only</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={flightSearch.preferences.flexibleDates}
                        onChange={(e) => setFlightSearch({
                          ...flightSearch,
                          preferences: {...flightSearch.preferences, flexibleDates: e.target.checked}
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-orange-500 mr-2"
                      />
                      <span className="text-sm text-gray-700">Flexible Dates</span>
                    </label>
                  </div>
                </div>
                
                <button
                  onClick={searchFlights}
                  disabled={flightSearching}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {flightSearching ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Searching Flights...
                    </div>
                  ) : `🔍 Search ${flightSearch.tripType === 'multicity' ? 'Multi-City' : flightSearch.tripType === 'return' ? 'Round Trip' : 'One Way'} Flights`}
                </button>

                {flightResults.length > 0 && (
                  <div className="space-y-6">
                    {/* Flight Results Header with Filters */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6">
                        <h3 className="text-xl font-semibold flex items-center">
                          <span className="mr-2">🎯</span>Available Flights ({flightResults.length} results)
                        </h3>
                        
                        {/* Sort Options */}
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">Sort by:</span>
                          <select 
                            value={flightFilters.sortBy}
                            onChange={(e) => setFlightFilters({...flightFilters, sortBy: e.target.value})}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="price">Price (Low to High)</option>
                            <option value="price-desc">Price (High to Low)</option>
                            <option value="duration">Duration</option>
                            <option value="departure">Departure Time</option>
                            <option value="arrival">Arrival Time</option>
                          </select>
                        </div>
                      </div>

                      {/* Advanced Filters Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Price Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Price Range</label>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">₹{flightFilters.priceRange[0]}</span>
                            <div className="flex-1 px-2">
                              <input
                                type="range"
                                min="0"
                                max="20000"
                                value={flightFilters.priceRange[1]}
                                onChange={(e) => setFlightFilters({
                                  ...flightFilters, 
                                  priceRange: [flightFilters.priceRange[0], parseInt(e.target.value)]
                                })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                              />
                            </div>
                            <span className="text-xs text-gray-500">₹{flightFilters.priceRange[1]}</span>
                          </div>
                        </div>

                        {/* Airlines Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Airlines</label>
                          <div className="max-h-20 overflow-y-auto">
                            {[...new Set(flightResults.map(f => f.airline))].map(airline => (
                              <label key={airline} className="flex items-center text-xs space-x-1">
                                <input
                                  type="checkbox"
                                  className="text-blue-600"
                                  checked={flightFilters.airlines.includes(airline)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFlightFilters({...flightFilters, airlines: [...flightFilters.airlines, airline]});
                                    } else {
                                      setFlightFilters({...flightFilters, airlines: flightFilters.airlines.filter(a => a !== airline)});
                                    }
                                  }}
                                />
                                <span className="truncate">{airline}</span>
                                <span className="text-gray-400">
                                  {flightResults.filter(f => f.airline === airline).length > 0 && 
                                   flightResults.find(f => f.airline === airline)?.is_lcc && (
                                    <span className="text-orange-500 font-bold">💰</span>
                                  )}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Stops Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Stops</label>
                          <div className="space-y-1">
                            {[0, 1, 2].map(stops => (
                              <label key={stops} className="flex items-center text-xs space-x-1">
                                <input
                                  type="checkbox"
                                  className="text-blue-600"
                                  checked={flightFilters.stops.includes(stops)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFlightFilters({...flightFilters, stops: [...flightFilters.stops, stops]});
                                    } else {
                                      setFlightFilters({...flightFilters, stops: flightFilters.stops.filter(s => s !== stops)});
                                    }
                                  }}
                                />
                                <span>{stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`}</span>
                                <span className="text-gray-400">({flightResults.filter(f => f.stops === stops).length})</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Departure Time Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Departure Time</label>
                          <div className="space-y-1">
                            {[
                              { key: 'morning', label: 'Morning (6AM-12PM)', emoji: '🌅' },
                              { key: 'afternoon', label: 'Afternoon (12PM-6PM)', emoji: '☀️' },
                              { key: 'evening', label: 'Evening (6PM-12AM)', emoji: '🌆' },
                              { key: 'night', label: 'Night (12AM-6AM)', emoji: '🌙' }
                            ].map(time => (
                              <label key={time.key} className="flex items-center text-xs space-x-1">
                                <input
                                  type="checkbox"
                                  className="text-blue-600"
                                  checked={flightFilters.departureTime.includes(time.key)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFlightFilters({...flightFilters, departureTime: [...flightFilters.departureTime, time.key]});
                                    } else {
                                      setFlightFilters({...flightFilters, departureTime: flightFilters.departureTime.filter(t => t !== time.key)});
                                    }
                                  }}
                                />
                                <span>{time.emoji}</span>
                                <span className="truncate">{time.label.split(' (')[0]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Clear Filters */}
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => setFlightFilters({
                            sortBy: 'price',
                            priceRange: [0, 20000],
                            airlines: [],
                            stops: [],
                            departureTime: [],
                            fareTypes: []
                          })}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>

                    {/* Flight Results List */}
                    <div className="space-y-4">
                      {flightResults
                        .filter(flight => {
                          // Apply filters
                          if (flightFilters.priceRange[1] < flight.price) return false;
                          if (flightFilters.airlines.length > 0 && !flightFilters.airlines.includes(flight.airline)) return false;
                          if (flightFilters.stops.length > 0 && !flightFilters.stops.includes(flight.stops || 0)) return false;
                          
                          // Departure time filter
                          if (flightFilters.departureTime.length > 0) {
                            const hour = parseInt(flight.departure_time?.split(':')[0] || '12');
                            const timeSlots = {
                              morning: hour >= 6 && hour < 12,
                              afternoon: hour >= 12 && hour < 18,
                              evening: hour >= 18 && hour < 24,
                              night: hour >= 0 && hour < 6
                            };
                            if (!flightFilters.departureTime.some(slot => timeSlots[slot])) return false;
                          }
                          
                          return true;
                        })
                        .sort((a, b) => {
                          switch (flightFilters.sortBy) {
                            case 'price': return a.price - b.price;
                            case 'price-desc': return b.price - a.price;
                            case 'duration': return (a.duration_minutes || 150) - (b.duration_minutes || 150);
                            case 'departure': return (a.departure_time || '').localeCompare(b.departure_time || '');
                            case 'arrival': return (a.arrival_time || '').localeCompare(b.arrival_time || '');
                            default: return 0;
                          }
                        })
                        .map(flight => (
                        <div key={flight.id} className="group border border-gray-200 rounded-2xl p-4 sm:p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300 bg-white/60 backdrop-blur-sm">
                          {/* Main Flight Info */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-3">
                                <span className="font-bold text-lg text-gray-900 flex items-center">
                                  {flight.airline}
                                  {flight.is_lcc && <span className="ml-1 text-orange-500 font-bold" title="Low Cost Carrier">💰</span>}
                                </span>
                                <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                                  {flight.flight_number || flight.airline_code}
                                </span>
                                {flight.aircraft_type && (
                                  <span className="text-gray-400 text-xs">({flight.aircraft_type})</span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 sm:flex sm:items-center sm:space-x-6 gap-2 text-sm text-gray-600 mb-3">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-lg">{flight.departure_time}</span>
                                  <span className="text-xs text-gray-500">
                                    {flight.origin_code || flight.origin?.slice(0,3).toUpperCase()}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                  <span className="font-bold text-lg">{flight.arrival_time}</span>
                                  <span className="text-xs text-gray-500">
                                    {flight.destination_code || flight.destination?.slice(0,3).toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                  {flight.duration || '2h 30m'}
                                </span>
                                <span className={`px-2 py-1 rounded-full font-medium ${
                                  (flight.stops || 0) === 0 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {(flight.stops || 0) === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                </span>
                                {flight.baggage_info && (
                                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                    📋 {flight.baggage_info.checked || '15kg'}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-center sm:text-right">
                              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ₹{flight.price.toLocaleString()}
                              </div>
                              {flight.lowest_fare && flight.lowest_fare !== flight.price && (
                                <div className="text-xs text-gray-500">
                                  From ₹{flight.lowest_fare.toLocaleString()}
                                </div>
                              )}
                              
                              <div className="flex flex-col space-y-2 mt-3">
                                <button 
                                  onClick={() => setShowFareOptions({...showFareOptions, [flight.id]: !showFareOptions[flight.id]})}
                                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                                >
                                  {showFareOptions[flight.id] ? 'Hide Fare Options' : `View ${flight.fare_options?.length || 3} Fare Types`}
                                </button>
                                
                                <button 
                                  onClick={() => startBookingFlow(flight, flight.fare_options?.[0] || {
                                    fareType: "Regular Fare",
                                    totalPrice: flight.price,
                                    basePrice: Math.floor(flight.price * 0.7),
                                    taxes: Math.floor(flight.price * 0.3),
                                    refundable: false,
                                    changeable: true
                                  })}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                  Book Now ₹{flight.price.toLocaleString()}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Fare Options */}
                          {showFareOptions[flight.id] && (
                            <div className="mt-6 border-t border-gray-200 pt-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">💎 Available Fare Types</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {(flight.fare_options || [
                                  {
                                    fareType: "Regular Fare",
                                    totalPrice: flight.price,
                                    basePrice: Math.floor(flight.price * 0.7),
                                    taxes: Math.floor(flight.price * 0.3),
                                    refundable: false,
                                    changeable: true,
                                    fareRules: ["Date change with penalty", "No refund on cancellation"]
                                  },
                                  {
                                    fareType: "Flexi Fare", 
                                    totalPrice: flight.price + 1500,
                                    basePrice: Math.floor((flight.price + 1500) * 0.7),
                                    taxes: Math.floor((flight.price + 1500) * 0.3),
                                    refundable: true,
                                    changeable: true,
                                    fareRules: ["Free date change", "Cancellation charges apply"]
                                  },
                                  {
                                    fareType: "Saver Fare",
                                    totalPrice: flight.price - 500,
                                    basePrice: Math.floor((flight.price - 500) * 0.7),
                                    taxes: Math.floor((flight.price - 500) * 0.3),
                                    refundable: false,
                                    changeable: false,
                                    fareRules: ["No date change allowed", "No refund on cancellation", "Limited baggage"]
                                  }
                                ]).map((fare, index) => (
                                  <div key={index} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                      <h5 className="font-semibold text-sm text-gray-800">{fare.fareType}</h5>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        fare.refundable 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-red-100 text-red-700'
                                      }`}>
                                        {fare.refundable ? 'Refundable' : 'Non-Refundable'}
                                      </span>
                                    </div>
                                    
                                    <div className="text-lg font-bold text-blue-600 mb-2">
                                      ₹{fare.totalPrice.toLocaleString()}
                                    </div>
                                    
                                    <div className="text-xs text-gray-600 mb-2">
                                      <div>Base: ₹{fare.basePrice.toLocaleString()}</div>
                                      <div>Taxes: ₹{fare.taxes.toLocaleString()}</div>
                                    </div>
                                    
                                    <div className="text-xs text-gray-500 mb-3">
                                      {fare.fareRules.map((rule, rIndex) => (
                                        <div key={rIndex}>• {rule}</div>
                                      ))}
                                    </div>
                                    
                                    <button 
                                      onClick={() => startBookingFlow(flight, fare)}
                                      className="w-full bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                      Book This Fare
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hotels' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                <div className="flex items-center mb-6">
                  <div className="text-3xl mr-3">🏨</div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Search Hotels</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      placeholder="City or hotel name"
                      value={hotelSearch.location}
                      onChange={(e) => setHotelSearch({...hotelSearch, location: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Guests</label>
                    <select
                      value={hotelSearch.guests}
                      onChange={(e) => setHotelSearch({...hotelSearch, guests: parseInt(e.target.value)})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    >
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
                    <input
                      type="date"
                      value={hotelSearch.checkin_date}
                      onChange={(e) => setHotelSearch({...hotelSearch, checkin_date: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
                    <input
                      type="date"
                      value={hotelSearch.checkout_date}
                      onChange={(e) => setHotelSearch({...hotelSearch, checkout_date: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    />
                  </div>
                </div>
                
                <button
                  onClick={searchHotels}
                  disabled={hotelSearching}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {hotelSearching ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Searching...
                    </div>
                  ) : 'Search Hotels'}
                </button>

                {hotelResults.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <span className="mr-2">🏨</span>Available Hotels
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {hotelResults.map(hotel => (
                        <div key={hotel.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all duration-500 bg-white/50 backdrop-blur-sm transform hover:scale-105">
                          <div className="relative overflow-hidden">
                            <img src={hotel.image} alt={hotel.name} className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center">
                              <span className="text-yellow-500 mr-1">★</span>
                              <span className="text-sm font-semibold">{hotel.rating}</span>
                            </div>
                          </div>
                          <div className="p-4 sm:p-6">
                            <h4 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">{hotel.name}</h4>
                            <p className="text-gray-600 text-sm mb-4">{hotel.description}</p>
                            <div className="flex flex-wrap gap-1 mb-4">
                              {hotel.amenities.slice(0, 4).map(amenity => (
                                <span key={amenity} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">₹{hotel.price_per_night.toLocaleString()}</span>
                                <span className="text-gray-500 text-sm">/night</span>
                              </div>
                              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                <div className="flex items-center mb-6">
                  <div className="text-3xl mr-3">🎯</div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Activities & Attractions</h2>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Global Destination</label>
                  <div className="relative">
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search destinations worldwide (e.g., Paris, Mumbai, Dubai, Tokyo)"
                          value={selectedLocation}
                          onChange={(e) => {
                            setSelectedLocation(e.target.value);
                            searchDestinations(e.target.value);
                          }}
                          onFocus={() => {
                            if (destinationSuggestions.length > 0) {
                              setShowDestinationSuggestions(true);
                            }
                          }}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm text-lg"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <div className="text-sm">🌍</div>
                        </div>
                        
                        {/* Global Destination Suggestions Dropdown */}
                        {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 mt-2 max-h-64 overflow-y-auto">
                            {destinationSuggestions.map((destination, index) => (
                              <div
                                key={index}
                                onClick={() => selectDestination(destination)}
                                className="flex items-center p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg">
                                      {destination.type === 'city' ? '🏙️' : 
                                       destination.type === 'landmark' ? '🏛️' : 
                                       destination.type === 'country' ? '🏳️' : '📍'}
                                    </span>
                                    <div>
                                      <div className="font-medium text-gray-900">{destination.name}</div>
                                      <div className="text-sm text-gray-500">{destination.country}</div>
                                    </div>
                                  </div>
                                  {destination.attractions && destination.attractions.length > 0 && (
                                    <div className="mt-1 text-xs text-blue-600">
                                      Popular: {destination.attractions.slice(0, 3).join(', ')}
                                      {destination.attractions.length > 3 && '...'}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 capitalize">{destination.type}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={searchActivities}
                        className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 sm:px-8 py-4 rounded-xl hover:from-orange-700 hover:to-amber-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                      >
                        🔍 Find Activities
                      </button>
                    </div>
                    
                    {/* Quick Destination Suggestions */}
                    {!selectedLocation && !showDestinationSuggestions && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600 mr-2">Popular:</span>
                        {['Mumbai', 'Delhi', 'Paris', 'Dubai', 'Tokyo', 'London', 'Singapore', 'Bangkok'].map(dest => (
                          <button
                            key={dest}
                            onClick={() => {
                              setSelectedLocation(dest);
                              searchActivities();
                            }}
                            className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-200 transition-colors duration-200"
                          >
                            {dest}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {activities.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <span className="mr-2">🎭</span>Popular Activities
                    </h3>
                    {activities.map(activity => (
                      <div key={activity.id} className="group border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.name}</h3>
                            <p className="text-gray-600 mb-3">{activity.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">📍 {activity.location}</span>
                              <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">⏱️ {activity.duration}</span>
                              <span className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">⭐ {activity.rating}</span>
                            </div>
                          </div>
                          <div className="text-center sm:text-right sm:ml-6">
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">₹{activity.price}</div>
                            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                              Book Activity
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'popular-trips' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                <div className="flex items-center mb-6">
                  <div className="text-3xl mr-3">🌟</div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Popular Trip Packages</h2>
                </div>
                
                {/* Filter Section */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 sm:p-6 mb-6 border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Your Perfect Trip</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                      <select 
                        value={tripFilters.region}
                        onChange={(e) => setTripFilters({...tripFilters, region: e.target.value})}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      >
                        <option value="">All Regions</option>
                        <option value="india_domestic">India</option>
                        <option value="international">International</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                      <select 
                        value={tripFilters.theme}
                        onChange={(e) => setTripFilters({...tripFilters, theme: e.target.value})}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      >
                        <option value="">All Themes</option>
                        <option value="Heritage">Heritage & Culture</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Beach">Beach & Leisure</option>
                        <option value="Luxury">Luxury</option>
                        <option value="Nature">Nature & Wildlife</option>
                        <option value="Honeymoon">Honeymoon</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <select 
                        value={tripFilters.duration}
                        onChange={(e) => setTripFilters({...tripFilters, duration: e.target.value})}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      >
                        <option value="">Any Duration</option>
                        <option value="4-6">4-6 Nights</option>
                        <option value="7-9">7-9 Nights</option>
                        <option value="10-12">10-12 Nights</option>
                        <option value="13-15">13-15 Nights</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
                      <select 
                        value={tripFilters.maxBudget}
                        onChange={(e) => setTripFilters({...tripFilters, maxBudget: e.target.value})}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      >
                        <option value="">Any Budget</option>
                        <option value="25000">Under ₹25,000</option>
                        <option value="50000">Under ₹50,000</option>
                        <option value="100000">Under ₹1,00,000</option>
                        <option value="200000">Above ₹1,00,000</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => fetchPopularTrips(tripFilters)}
                      className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-amber-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      🔍 Find Trips
                    </button>
                  </div>
                </div>

                {/* Featured Trips Section - Show when no filters applied */}
                {featuredTrips.length > 0 && popularTrips.length === 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                      <span className="mr-2">⭐</span>Featured Destinations
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredTrips.map(trip => (
                        <div key={trip.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100 cursor-pointer" onClick={() => handleTripClick(trip.id)}>
                          <div className="relative">
                            <img 
                              src={trip.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
                              alt={trip.title}
                              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
                              }}
                            />
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {trip.duration}
                            </div>
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                              {trip.theme}
                            </div>
                          </div>
                          <div className="p-6">
                            <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                              {trip.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              📍 {trip.destinations?.join(' • ') || 'Multiple Destinations'}
                            </p>
                            <div className="flex items-center mb-4">
                              {trip.highlights?.slice(0, 2).map((highlight, idx) => (
                                <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full mr-2 font-medium">
                                  {highlight}
                                </span>
                              ))}
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-sm text-gray-500">Starting from</span>
                                <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                  ₹{trip.price_from?.toLocaleString() || '25,000'}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTripClick(trip.id);
                                  }}
                                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm"
                                >
                                  View Details
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTripInquiry(trip.id);
                                  }}
                                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3 py-2 rounded-xl hover:from-orange-700 hover:to-amber-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm"
                                >
                                  Inquire Now
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Trips Results */}
                {popularTrips.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                      <span className="mr-2">🎒</span>Matching Trips ({popularTrips.length} found)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {popularTrips.map(trip => (
                        <div key={trip.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100 cursor-pointer" onClick={() => handleTripClick(trip.id)}>
                          <div className="relative">
                            <img 
                              src={trip.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
                              alt={trip.title}
                              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
                              }}
                            />
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {trip.duration}
                            </div>
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                              {trip.theme}
                            </div>
                            {trip.best_time && (
                              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                                Best: {trip.best_time}
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                              {trip.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              📍 {trip.destinations?.join(' • ') || 'Multiple Destinations'}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-4">
                              {trip.highlights?.slice(0, 3).map((highlight, idx) => (
                                <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                                  {highlight}
                                </span>
                              ))}
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-sm text-gray-500">Starting from</span>
                                <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                  ₹{trip.price_from?.toLocaleString()}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTripClick(trip.id);
                                  }}
                                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm"
                                >
                                  View Details
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTripInquiry(trip.id);
                                  }}
                                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3 py-2 rounded-xl hover:from-orange-700 hover:to-amber-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm"
                                >
                                  Inquire Now
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No trips found message */}
                {popularTrips.length === 0 && featuredTrips.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌍</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No trips found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your filters or browse our featured destinations</p>
                    <button
                      onClick={() => {
                        setTripFilters({region: '', theme: '', maxBudget: '', duration: ''});
                        fetchFeaturedTrips();
                      }}
                      className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-amber-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Show All Destinations
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                <div className="flex items-center mb-6">
                  <div className="text-3xl mr-3">🤖</div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Trip Planner</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Destination</label>
                    <input
                      type="text"
                      placeholder="Where do you want to go?"
                      value={itineraryForm.destination}
                      onChange={(e) => setItineraryForm({...itineraryForm, destination: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Duration (days)</label>
                    <select
                      value={itineraryForm.days}
                      onChange={(e) => setItineraryForm({...itineraryForm, days: parseInt(e.target.value)})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num} Day{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Budget</label>
                    <select
                      value={itineraryForm.budget}
                      onChange={(e) => setItineraryForm({...itineraryForm, budget: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    >
                      <option value="budget">Budget-Friendly</option>
                      <option value="medium">Medium Range</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Interests</label>
                    <input
                      type="text"
                      placeholder="e.g., culture, food, adventure"
                      value={itineraryForm.interests.join(', ')}
                      onChange={(e) => setItineraryForm({...itineraryForm, interests: e.target.value.split(', ').filter(i => i.trim())})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    />
                  </div>
                </div>
                
                <button
                  onClick={generateItinerary}
                  disabled={generatingItinerary}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {generatingItinerary ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Your Perfect Trip...
                    </div>
                  ) : '✨ Generate AI Itinerary'}
                </button>

                {generatedItinerary && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                      <span className="mr-2">🗺️</span>Your Personalized Itinerary
                    </h3>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-white/50 p-4 rounded-lg">
                        {generatedItinerary}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
      </div>
    </div>
  );
}

export default App;