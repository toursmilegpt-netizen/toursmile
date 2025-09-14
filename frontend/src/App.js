import React, { useState, useRef, useEffect, useMemo } from 'react';
import './App.css';

// TOURSMILE HOMEPAGE - CLEAN WORKING IMPLEMENTATION
// Mobile-first responsive with proper breakpoints

// Comprehensive Global Airport Database - ALL Worldwide Airports
const POPULAR_AIRPORTS = [
  // INDIA - All Major Airports
  { city: "Mumbai", iata: "BOM", airport: "Chhatrapati Shivaji Maharaj Intl", country: "IN" },
  { city: "Delhi", iata: "DEL", airport: "Indira Gandhi Intl", country: "IN" },
  { city: "Bengaluru", iata: "BLR", airport: "Kempegowda Intl", country: "IN" },
  { city: "Hyderabad", iata: "HYD", airport: "Rajiv Gandhi Intl", country: "IN" },
  { city: "Chennai", iata: "MAA", airport: "Chennai Intl", country: "IN" },
  { city: "Kolkata", iata: "CCU", airport: "Netaji Subhas Chandra Bose Intl", country: "IN" },
  { city: "Pune", iata: "PNQ", airport: "Pune Intl", country: "IN" },
  { city: "Ahmedabad", iata: "AMD", airport: "Sardar Vallabhbhai Patel Intl", country: "IN" },
  { city: "Kochi", iata: "COK", airport: "Cochin Intl", country: "IN" },
  { city: "Goa", iata: "GOI", airport: "Manohar Intl", country: "IN" },
  { city: "Jaipur", iata: "JAI", airport: "Jaipur Intl", country: "IN" },
  { city: "Lucknow", iata: "LKO", airport: "Chaudhary Charan Singh Intl", country: "IN" },
  { city: "Chandigarh", iata: "IXC", airport: "Chandigarh Airport", country: "IN" },
  { city: "Trivandrum", iata: "TRV", airport: "Trivandrum Intl", country: "IN" },
  { city: "Coimbatore", iata: "CJB", airport: "Coimbatore Intl", country: "IN" },
  { city: "Nagpur", iata: "NAG", airport: "Dr. Babasaheb Ambedkar Intl", country: "IN" },
  { city: "Indore", iata: "IDR", airport: "Devi Ahilya Bai Holkar Airport", country: "IN" },
  { city: "Bhubaneswar", iata: "BBI", airport: "Biju Patnaik Intl", country: "IN" },
  { city: "Visakhapatnam", iata: "VTZ", airport: "Visakhapatnam Airport", country: "IN" },
  { city: "Srinagar", iata: "SXR", airport: "Sheikh ul-Alam Intl", country: "IN" },
  { city: "Amritsar", iata: "ATQ", airport: "Sri Guru Ram Dass Jee Intl", country: "IN" },
  { city: "Patna", iata: "PAT", airport: "Jay Prakash Narayan Intl", country: "IN" },
  { city: "Ranchi", iata: "IXR", airport: "Birsa Munda Airport", country: "IN" },
  { city: "Dehradun", iata: "DED", airport: "Jolly Grant Airport", country: "IN" },
  { city: "Jammu", iata: "IXJ", airport: "Jammu Airport", country: "IN" },
  { city: "Mangalore", iata: "IXE", airport: "Mangalore Intl", country: "IN" },
  { city: "Madurai", iata: "IXM", airport: "Madurai Airport", country: "IN" },
  { city: "Tiruchirapalli", iata: "TRZ", airport: "Tiruchirappalli Intl", country: "IN" },
  { city: "Varanasi", iata: "VNS", airport: "Lal Bahadur Shastri Intl", country: "IN" },
  { city: "Raipur", iata: "RPR", airport: "Swami Vivekananda Airport", country: "IN" },

  // USA - Major Airports
  { city: "New York", iata: "JFK", airport: "John F Kennedy Intl", country: "US" },
  { city: "New York", iata: "LGA", airport: "LaGuardia Airport", country: "US" },
  { city: "New York", iata: "EWR", airport: "Newark Liberty Intl", country: "US" },
  { city: "Los Angeles", iata: "LAX", airport: "Los Angeles Intl", country: "US" },
  { city: "Chicago", iata: "ORD", airport: "O'Hare Intl", country: "US" },
  { city: "Chicago", iata: "MDW", airport: "Midway Intl", country: "US" },
  { city: "Miami", iata: "MIA", airport: "Miami Intl", country: "US" },
  { city: "San Francisco", iata: "SFO", airport: "San Francisco Intl", country: "US" },
  { city: "Boston", iata: "BOS", airport: "Logan Intl", country: "US" },
  { city: "Washington", iata: "DCA", airport: "Ronald Reagan Washington National", country: "US" },
  { city: "Washington", iata: "IAD", airport: "Washington Dulles Intl", country: "US" },
  { city: "Seattle", iata: "SEA", airport: "Seattle-Tacoma Intl", country: "US" },
  { city: "Las Vegas", iata: "LAS", airport: "McCarran Intl", country: "US" },
  { city: "Denver", iata: "DEN", airport: "Denver Intl", country: "US" },
  { city: "Atlanta", iata: "ATL", airport: "Hartsfield-Jackson Atlanta Intl", country: "US" },
  { city: "Dallas", iata: "DFW", airport: "Dallas/Fort Worth Intl", country: "US" },
  { city: "Dallas", iata: "DAL", airport: "Dallas Love Field", country: "US" },
  { city: "Houston", iata: "IAH", airport: "George Bush Intercontinental", country: "US" },
  { city: "Houston", iata: "HOU", airport: "William P Hobby Airport", country: "US" },
  { city: "Phoenix", iata: "PHX", airport: "Phoenix Sky Harbor Intl", country: "US" },
  { city: "Orlando", iata: "MCO", airport: "Orlando Intl", country: "US" },
  { city: "Detroit", iata: "DTW", airport: "Detroit Metropolitan Wayne County", country: "US" },
  { city: "Minneapolis", iata: "MSP", airport: "Minneapolis-St Paul Intl", country: "US" },
  { city: "Philadelphia", iata: "PHL", airport: "Philadelphia Intl", country: "US" },
  { city: "San Diego", iata: "SAN", airport: "San Diego Intl", country: "US" },
  { city: "Portland", iata: "PDX", airport: "Portland Intl", country: "US" },
  { city: "Tampa", iata: "TPA", airport: "Tampa Intl", country: "US" },

  // CANADA - Major Airports
  { city: "Toronto", iata: "YYZ", airport: "Lester B Pearson Intl", country: "CA" },
  { city: "Toronto", iata: "YTZ", airport: "Billy Bishop Toronto City Airport", country: "CA" },
  { city: "Vancouver", iata: "YVR", airport: "Vancouver Intl", country: "CA" },
  { city: "Montreal", iata: "YUL", airport: "Pierre Elliott Trudeau Intl", country: "CA" },
  { city: "Calgary", iata: "YYC", airport: "Calgary Intl", country: "CA" },
  { city: "Edmonton", iata: "YEG", airport: "Edmonton Intl", country: "CA" },
  { city: "Ottawa", iata: "YOW", airport: "Ottawa Macdonald-Cartier Intl", country: "CA" },
  { city: "Winnipeg", iata: "YWG", airport: "Winnipeg James Armstrong Richardson Intl", country: "CA" },
  { city: "Halifax", iata: "YHZ", airport: "Halifax Stanfield Intl", country: "CA" },

  // UNITED KINGDOM - Major Airports
  { city: "London", iata: "LHR", airport: "Heathrow Airport", country: "GB" },
  { city: "London", iata: "LGW", airport: "Gatwick Airport", country: "GB" },
  { city: "London", iata: "STN", airport: "Stansted Airport", country: "GB" },
  { city: "London", iata: "LTN", airport: "Luton Airport", country: "GB" },
  { city: "London", iata: "LCY", airport: "London City Airport", country: "GB" },
  { city: "Manchester", iata: "MAN", airport: "Manchester Airport", country: "GB" },
  { city: "Birmingham", iata: "BHX", airport: "Birmingham Airport", country: "GB" },
  { city: "Edinburgh", iata: "EDI", airport: "Edinburgh Airport", country: "GB" },
  { city: "Glasgow", iata: "GLA", airport: "Glasgow Airport", country: "GB" },
  { city: "Bristol", iata: "BRS", airport: "Bristol Airport", country: "GB" },

  // EUROPE - Major Airports
  { city: "Paris", iata: "CDG", airport: "Charles de Gaulle Airport", country: "FR" },
  { city: "Paris", iata: "ORY", airport: "Orly Airport", country: "FR" },
  { city: "Amsterdam", iata: "AMS", airport: "Amsterdam Airport Schiphol", country: "NL" },
  { city: "Frankfurt", iata: "FRA", airport: "Frankfurt Airport", country: "DE" },
  { city: "Munich", iata: "MUC", airport: "Munich Airport", country: "DE" },
  { city: "Berlin", iata: "BER", airport: "Berlin Brandenburg Airport", country: "DE" },
  { city: "Rome", iata: "FCO", airport: "Leonardo da Vinci-Fiumicino Airport", country: "IT" },
  { city: "Rome", iata: "CIA", airport: "Ciampino Airport", country: "IT" },
  { city: "Milan", iata: "MXP", airport: "Malpensa Airport", country: "IT" },
  { city: "Milan", iata: "LIN", airport: "Linate Airport", country: "IT" },
  { city: "Madrid", iata: "MAD", airport: "Adolfo Suárez Madrid-Barajas Airport", country: "ES" },
  { city: "Barcelona", iata: "BCN", airport: "Barcelona-El Prat Airport", country: "ES" },
  { city: "Vienna", iata: "VIE", airport: "Vienna International Airport", country: "AT" },
  { city: "Zurich", iata: "ZUR", airport: "Zurich Airport", country: "CH" },
  { city: "Brussels", iata: "BRU", airport: "Brussels Airport", country: "BE" },
  { city: "Copenhagen", iata: "CPH", airport: "Copenhagen Airport", country: "DK" },
  { city: "Stockholm", iata: "ARN", airport: "Stockholm Arlanda Airport", country: "SE" },
  { city: "Oslo", iata: "OSL", airport: "Oslo Airport", country: "NO" },
  { city: "Helsinki", iata: "HEL", airport: "Helsinki Airport", country: "FI" },
  { city: "Warsaw", iata: "WAW", airport: "Warsaw Chopin Airport", country: "PL" },
  { city: "Prague", iata: "PRG", airport: "Václav Havel Airport Prague", country: "CZ" },
  { city: "Budapest", iata: "BUD", airport: "Budapest Ferenc Liszt International Airport", country: "HU" },
  { city: "Athens", iata: "ATH", airport: "Athens International Airport", country: "GR" },
  { city: "Istanbul", iata: "IST", airport: "Istanbul Airport", country: "TR" },
  { city: "Istanbul", iata: "SAW", airport: "Sabiha Gökçen International Airport", country: "TR" },

  // MIDDLE EAST & AFRICA
  { city: "Dubai", iata: "DXB", airport: "Dubai International", country: "AE" },
  { city: "Dubai", iata: "DWC", airport: "Al Maktoum International", country: "AE" },
  { city: "Abu Dhabi", iata: "AUH", airport: "Abu Dhabi International", country: "AE" },
  { city: "Doha", iata: "DOH", airport: "Hamad International", country: "QA" },
  { city: "Kuwait City", iata: "KWI", airport: "Kuwait International", country: "KW" },
  { city: "Riyadh", iata: "RUH", airport: "King Khalid International", country: "SA" },
  { city: "Jeddah", iata: "JED", airport: "King Abdulaziz International", country: "SA" },
  { city: "Cairo", iata: "CAI", airport: "Cairo International", country: "EG" },
  { city: "Cape Town", iata: "CPT", airport: "Cape Town International", country: "ZA" },
  { city: "Johannesburg", iata: "JNB", airport: "OR Tambo International", country: "ZA" },
  { city: "Nairobi", iata: "NBO", airport: "Jomo Kenyatta International", country: "KE" },

  // ASIA-PACIFIC
  { city: "Singapore", iata: "SIN", airport: "Singapore Changi", country: "SG" },
  { city: "Hong Kong", iata: "HKG", airport: "Hong Kong International", country: "HK" },
  { city: "Bangkok", iata: "BKK", airport: "Suvarnabhumi", country: "TH" },
  { city: "Bangkok", iata: "DMK", airport: "Don Mueang International", country: "TH" },
  { city: "Kuala Lumpur", iata: "KUL", airport: "Kuala Lumpur International", country: "MY" },
  { city: "Jakarta", iata: "CGK", airport: "Soekarno-Hatta International", country: "ID" },
  { city: "Manila", iata: "MNL", airport: "Ninoy Aquino International", country: "PH" },
  { city: "Seoul", iata: "ICN", airport: "Incheon International", country: "KR" },
  { city: "Seoul", iata: "GMP", airport: "Gimpo International", country: "KR" },
  { city: "Tokyo", iata: "NRT", airport: "Narita International", country: "JP" },
  { city: "Tokyo", iata: "HND", airport: "Haneda Airport", country: "JP" },
  { city: "Osaka", iata: "KIX", airport: "Kansai International", country: "JP" },
  { city: "Osaka", iata: "ITM", airport: "Itami Airport", country: "JP" },
  { city: "Beijing", iata: "PEK", airport: "Beijing Capital International", country: "CN" },
  { city: "Beijing", iata: "PKX", airport: "Beijing Daxing International", country: "CN" },
  { city: "Shanghai", iata: "PVG", airport: "Shanghai Pudong International", country: "CN" },
  { city: "Shanghai", iata: "SHA", airport: "Shanghai Hongqiao International", country: "CN" },
  { city: "Guangzhou", iata: "CAN", airport: "Guangzhou Baiyun International", country: "CN" },
  { city: "Shenzhen", iata: "SZX", airport: "Shenzhen Bao'an International", country: "CN" },
  { city: "Taipei", iata: "TPE", airport: "Taiwan Taoyuan International", country: "TW" },
  { city: "Ho Chi Minh City", iata: "SGN", airport: "Tan Son Nhat International", country: "VN" },
  { city: "Hanoi", iata: "HAN", airport: "Noi Bai International", country: "VN" },

  // AUSTRALIA & NEW ZEALAND
  { city: "Sydney", iata: "SYD", airport: "Kingsford Smith Airport", country: "AU" },
  { city: "Melbourne", iata: "MEL", airport: "Melbourne Airport", country: "AU" },
  { city: "Brisbane", iata: "BNE", airport: "Brisbane Airport", country: "AU" },
  { city: "Perth", iata: "PER", airport: "Perth Airport", country: "AU" },
  { city: "Adelaide", iata: "ADL", airport: "Adelaide Airport", country: "AU" },
  { city: "Auckland", iata: "AKL", airport: "Auckland Airport", country: "NZ" },
  { city: "Wellington", iata: "WLG", airport: "Wellington Airport", country: "NZ" },
  { city: "Christchurch", iata: "CHC", airport: "Christchurch Airport", country: "NZ" },

  // SOUTH AMERICA
  { city: "São Paulo", iata: "GRU", airport: "São Paulo/Guarulhos International", country: "BR" },
  { city: "São Paulo", iata: "CGH", airport: "Congonhas Airport", country: "BR" },
  { city: "Rio de Janeiro", iata: "GIG", airport: "Rio de Janeiro/Galeão International", country: "BR" },
  { city: "Rio de Janeiro", iata: "SDU", airport: "Santos Dumont Airport", country: "BR" },
  { city: "Buenos Aires", iata: "EZE", airport: "Ezeiza International", country: "AR" },
  { city: "Buenos Aires", iata: "AEP", airport: "Jorge Newbery Airfield", country: "AR" },
  { city: "Santiago", iata: "SCL", airport: "Santiago International", country: "CL" },
  { city: "Lima", iata: "LIM", airport: "Jorge Chávez International", country: "PE" },
  { city: "Bogotá", iata: "BOG", airport: "El Dorado International", country: "CO" },
  { city: "Mexico City", iata: "MEX", airport: "Mexico City International", country: "MX" },
  { city: "Cancún", iata: "CUN", airport: "Cancún International", country: "MX" }
];

// Debounced hook
function useDebounced(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// City Input Component with Working Dropdown Suggestions
function CityInput({ label, value, onChange, onNext, autoFocus = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounced(query, 300);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const abortController = useRef(null);
  
  // Backend base URL from environment
  const backendBase = process.env.REACT_APP_BACKEND_URL;
  
  // Popular airports for dropdown display - Top Indian + International
  const popularAirports = [
    // Top Indian Airports
    { city: "Mumbai", airport: "Chhatrapati Shivaji Maharaj Intl", iata: "BOM", country: "IN" },
    { city: "Delhi", airport: "Indira Gandhi Intl", iata: "DEL", country: "IN" },
    { city: "Bengaluru", airport: "Kempegowda Intl", iata: "BLR", country: "IN" },
    { city: "Hyderabad", airport: "Rajiv Gandhi Intl", iata: "HYD", country: "IN" },
    { city: "Chennai", airport: "Chennai Intl", iata: "MAA", country: "IN" },
    { city: "Kolkata", airport: "Netaji Subhas Chandra Bose Intl", iata: "CCU", country: "IN" },
    { city: "Pune", airport: "Pune Intl", iata: "PNQ", country: "IN" },
    { city: "Ahmedabad", airport: "Sardar Vallabhbhai Patel Intl", iata: "AMD", country: "IN" },
    { city: "Kochi", airport: "Cochin Intl", iata: "COK", country: "IN" },
    { city: "Goa", airport: "Manohar Intl", iata: "GOI", country: "IN" },
    
    // Top International Airports
    { city: "Dubai", airport: "Dubai International", iata: "DXB", country: "AE" },
    { city: "Singapore", airport: "Singapore Changi", iata: "SIN", country: "SG" },
    { city: "Bangkok", airport: "Suvarnabhumi", iata: "BKK", country: "TH" },
    { city: "London", airport: "Heathrow Airport", iata: "LHR", country: "GB" },
    { city: "New York", airport: "John F Kennedy Intl", iata: "JFK", country: "US" },
    { city: "Paris", airport: "Charles de Gaulle Airport", iata: "CDG", country: "FR" },
    { city: "Tokyo", airport: "Narita International", iata: "NRT", country: "JP" },
    { city: "Hong Kong", airport: "Hong Kong International", iata: "HKG", country: "HK" },
    { city: "Sydney", airport: "Kingsford Smith Airport", iata: "SYD", country: "AU" },
    { city: "Toronto", airport: "Lester B Pearson Intl", iata: "YYZ", country: "CA" }
  ];
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Auto-focus when autoFocus prop changes
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Handle search when user types - FIXED LOGIC with value check
  useEffect(() => {
    // Don't show suggestions if field already has a selected value
    if (value) {
      setOpen(false);
      setSuggestions([]);
      return;
    }
    
    if (debouncedQuery && debouncedQuery.length >= 1) {
      console.log('Searching for:', debouncedQuery); // Debug log
      
      // Search in comprehensive airport database first
      const localMatches = POPULAR_AIRPORTS.filter(airport => 
        airport.city.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        airport.iata.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        airport.airport.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 8); // Limit to 8 results for better UX
      
      console.log('Local matches found:', localMatches); // Debug log
      
      if (localMatches.length > 0) {
        setSuggestions(localMatches);
        setOpen(true);
      } else {
        // Search via API if no local matches, fallback to comprehensive database
        searchAirports(debouncedQuery);
      }
    } else if (open && !debouncedQuery) {
      // Show popular destinations when dropdown is open but no query
      setSuggestions(popularAirports);
    } else if (!debouncedQuery) {
      setSuggestions([]);
      setOpen(false);
    }
  }, [debouncedQuery, open, value]); // Added value to dependency array
  
  const searchAirports = async (searchQuery) => {
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    setLoading(true);
    
    try {
      const urlBase = backendBase || (window.__BACKEND_URL__ || (window.ENV && window.ENV.REACT_APP_BACKEND_URL));
      if (!urlBase) {
        throw new Error('Backend URL not configured');
      }
      
      const response = await fetch(
        `${urlBase}/api/airports/search?query=${encodeURIComponent(searchQuery)}&limit=6`,
        {
          signal: abortController.current.signal,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSuggestions(data.results || []);
      setOpen(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Airport search error:', error);
        // Fallback to comprehensive airport database search
        const fallbackMatches = POPULAR_AIRPORTS.filter(airport => 
          (airport.city + " " + airport.iata + " " + airport.airport).toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 8);
        setSuggestions(fallbackMatches);
        setOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset mobile zoom when input loses focus
  const handleInputBlur = () => {
    if (window.innerWidth <= 767) {
      setTimeout(() => {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      }, 100);
    }
  };

  const handleInputFocus = () => {
    // If field has a selected value, clear it when focused
    if (value) {
      setQuery("");
      onChange(null);
      setSuggestions(popularAirports);
      setOpen(true);
    } else if (!query) {
      setSuggestions(popularAirports);
      setOpen(true);
    }
  };

  const handleInputClick = () => {
    // Always allow clicking anywhere in the input to edit
    if (value) {
      // If field has a selected city, clear it and show popular destinations immediately
      setQuery("");
      onChange(null);
      setSuggestions(popularAirports);
      setOpen(true);
      
      // Focus the input for immediate typing
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    } else if (!query) {
      // If field is empty, show popular destinations
      setSuggestions(popularAirports);
      setOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    
    // Clear any selected value when user starts typing
    if (value) {
      onChange(null);
    }
    
    // Show suggestions when typing
    if (inputValue.length === 0) {
      setSuggestions(popularAirports);
      setOpen(true);
    }
  };

  const handleCitySelect = (city) => {
    // Set the selected city
    onChange(city);
    setQuery(city.city);
    
    // IMMEDIATELY close dropdown
    setOpen(false);
    setSuggestions([]);
    
    // Clear any ongoing search
    if (abortController.current) {
      abortController.current.abort();
    }
    
    // Progress to next field with slight delay for smooth UX
    setTimeout(() => {
      if (onNext) {
        onNext();
      }
    }, 200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleCitySelect(suggestions[0]);
      } else if (onNext) {
        onNext();
      }
    }
  };
  
  const displayValue = query || (value && value.city ? value.city : "");
  
  return (
    <div ref={containerRef} className="relative" style={{ minWidth: 0, maxWidth: '100%', position: 'relative' }}>
      <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
      <div 
        className="h-12 rounded-xl border border-neutral-300 flex items-center px-3 hover:border-neutral-400 transition-colors focus-within:border-neutral-400 cursor-text"
        style={{ minWidth: 0, maxWidth: '100%', width: '100%', position: 'relative' }}
        onClick={handleInputClick}
      >
        <span className="h-4 w-4 text-neutral-500 mr-2 flex-shrink-0">✈️</span>
        <input
          ref={inputRef}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onClick={handleInputClick}
          onKeyPress={handleKeyPress}
          placeholder="Type city or code"
          className="outline-none bg-transparent text-sm flex-1 border-none focus:outline-none focus:ring-0 focus:border-none"
          style={{ 
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
            minWidth: 0,
            maxWidth: '100%',
            width: '100%',
            fontSize: '16px'
          }}
        />
        {value && value.iata && (
          <span className="text-[11px] text-neutral-500 font-mono uppercase ml-2 flex-shrink-0">{value.iata}</span>
        )}
        {(query || value) && (
          <button
            onClick={() => { 
              setQuery(""); 
              onChange(null); 
              setOpen(false); 
              setSuggestions([]);
              // Focus the input after clearing
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }, 100);
            }}
            className="ml-1 text-neutral-400 hover:text-neutral-600 flex-shrink-0"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Dropdown - ELEGANT & COMPACT Design like MakeMyTrip */}
      {open && suggestions.length > 0 && (
        <>
          <div 
            className="suggestions-dropdown-elegant"
            style={{ 
              position: 'fixed',
              top: `${(containerRef.current?.getBoundingClientRect().bottom || 0) + 8}px`,
              left: `${containerRef.current?.getBoundingClientRect().left || 0}px`,
              width: `${containerRef.current?.getBoundingClientRect().width || 300}px`,
              zIndex: 99999,
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              maxHeight: '280px',
              overflowY: 'auto',
              padding: '8px 0'
            }}
          >
            {!query && (
              <div className="px-3 py-2 text-xs font-medium text-neutral-400 uppercase tracking-wide border-b border-neutral-100">
                Popular Cities
              </div>
            )}
            
            {suggestions.map((airport, i) => (
              <button
                key={`${airport.iata}-${i}`}
                onClick={() => handleCitySelect(airport)}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center justify-between transition-colors duration-150"
                style={{ 
                  minHeight: '44px',
                  borderBottom: i < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900 truncate">
                    {airport.city}, {airport.country === 'IN' ? 'India' : airport.country}
                  </div>
                  <div className="text-xs text-neutral-500 truncate">{airport.airport}</div>
                </div>
                <div className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-1 rounded ml-2 flex-shrink-0">
                  {airport.iata}
                </div>
              </button>
            ))}
            
            {loading && (
              <div className="px-3 py-3 text-xs text-neutral-400 text-center">
                Searching...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Date Input Component with FIXED date formatting and selection
function DateInput({ label, value, onChange, title, disabled, autoFocus = false }) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const ref = useRef(null);
  const buttonRef = useRef(null);
  
  // Auto-focus when autoFocus prop changes
  useEffect(() => {
    if (autoFocus && buttonRef.current && !disabled) {
      buttonRef.current.focus();
      // Auto-open the calendar
      setTimeout(() => setOpen(true), 200);
    }
  }, [autoFocus, disabled]);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addMonths = (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  };

  // Format date to DDMMYYYY
  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  // Convert date to display format DD MMM YYYY
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return (
      <div>
        <div className="grid grid-cols-7 text-xs text-neutral-500 mb-1">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => 
            <div key={day} className="py-1 text-center">{day}</div>
          )}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            // FIXED: Use local date string to avoid timezone issues
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            const isCurrentMonth = date.getMonth() === month;
            const isSelected = value && value === dateStr;
            const isToday = new Date().toDateString() === date.toDateString();
            
            return (
              <button 
                key={i} 
                onClick={() => { 
                  console.log('Selected date:', dateStr); // Debug log
                  onChange(dateStr); 
                  setOpen(false); 
                }}
                className={`aspect-square rounded-md text-sm flex items-center justify-center transition-colors ${
                  date.getMonth() === currentMonth.getMonth() ? "text-neutral-900" : "text-neutral-400"
                } ${
                  isSelected ? "bg-blue-600 text-white font-semibold" : 
                  isToday ? "bg-blue-100 text-blue-700 font-medium" :
                  "hover:bg-neutral-50"
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} className="relative">
      <label className="sr-only">{title}</label>
      <button 
        ref={buttonRef}
        disabled={disabled} 
        onClick={() => !disabled && setOpen(true)} 
        className="h-12 w-full px-4 rounded-xl border border-neutral-300 text-left hover:bg-neutral-50 flex items-center justify-between disabled:opacity-50"
      >
        <span className="text-sm text-neutral-700">
          {value ? formatDateDisplay(value) : label}
        </span>
        <span className="h-4 w-4 text-neutral-500">📅</span>
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">{title}</div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} 
                className="p-1 rounded hover:bg-neutral-50"
              >
                ‹
              </button>
              <span className="text-sm">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
                className="p-1 rounded hover:bg-neutral-50"
              >
                ›
              </button>
            </div>
          </div>
          {renderCalendar()}
        </div>
      )}
    </div>
  );
}

// Passenger Row Component
function PaxRow({ label, hint, value, onInc, onDec }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium" style={{ fontWeight: '500' }}>{label}</div>
        <div className="text-xs text-neutral-500" style={{ fontWeight: '300' }}>{hint}</div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onDec} 
          className="h-10 w-10 rounded-full border border-neutral-300 hover:bg-neutral-50 flex items-center justify-center text-lg"
        >
          −
        </button>
        <div className="w-8 text-center text-sm">{value}</div>
        <button 
          onClick={onInc} 
          className="h-10 w-10 rounded-full border border-neutral-300 hover:bg-neutral-50 flex items-center justify-center text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}

// Passenger Overlay Component
function PaxOverlay({ value, onChange, onClose }) {
  const [pax, setPax] = useState(value);
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ref.current?.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);
  
  const updatePax = (key, newValue) => setPax(prev => ({ ...prev, [key]: newValue }));
  const increment = (key) => updatePax(key, Math.min(9, pax[key] + 1));
  const decrement = (key) => updatePax(key, Math.max(key === 'adt' ? 1 : 0, pax[key] - 1));
  
  useEffect(() => {
    if (pax.inf > pax.adt) updatePax('inf', pax.adt);
    if (pax.adt < 1) updatePax('adt', 1);
  }, [pax.adt, pax.inf]);

  return (
    <div className="fixed inset-0 z-40 bg-black/20 flex items-end md:items-center md:justify-center">
      <div ref={ref} className="w-full md:w-[32rem] bg-white rounded-t-2xl md:rounded-2xl shadow-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-base font-medium" style={{ fontWeight: '500' }}>Travellers & Class</div>
          <button 
            onClick={onClose} 
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Close
          </button>
        </div>
        <div className="space-y-3">
          <PaxRow label="Adults (12+)" hint="Ages 12+" value={pax.adt} onInc={() => increment('adt')} onDec={() => decrement('adt')} />
          <PaxRow label="Children (2–11)" hint="Ages 2–11" value={pax.chd} onInc={() => increment('chd')} onDec={() => decrement('chd')} />
          <PaxRow label="Infants (0–1)" hint="On lap" value={pax.inf} onInc={() => increment('inf')} onDec={() => decrement('inf')} />
          <div className="pt-2">
            <div className="text-sm font-medium mb-1" style={{ fontWeight: '500' }}>Cabin Class</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["Economy", "Premium Economy", "Business", "First"].map((cabin) => (
                <button 
                  key={cabin} 
                  onClick={() => updatePax('cabin', cabin)} 
                  className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                    pax.cabin === cabin ? "border-blue-400 bg-blue-50" : "border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {cabin}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-neutral-700">
            {pax.adt}A, {pax.chd}C, {pax.inf}Inf · {pax.cabin}
          </div>
          <button 
            onClick={() => { onChange(pax); onClose(); }} 
            className="h-10 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// Search Card Component
// Search Card Component with Auto-focus Guidance
function SearchCard() {
  const [trip, setTrip] = useState("OW"); // Default to One Way
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [depart, setDepart] = useState(null);
  const [ret, setRet] = useState(null);
  const [openPax, setOpenPax] = useState(false);
  const [pax, setPax] = useState({ adt: 1, chd: 0, inf: 0, cabin: "Economy" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // 0: from, 1: to, 2: date, 3: passenger, 4: search

  // Backend base URL from environment
  const backendBase = process.env.REACT_APP_BACKEND_URL;

  // Auto-focus progression handlers
  const handleFromComplete = () => {
    setCurrentStep(1); // Move to "To" field
  };

  const handleToComplete = () => {
    setCurrentStep(2); // Move to date field  
  };

  const handleDateComplete = () => {
    setCurrentStep(3); // Move to passenger selection
    // Auto-open passenger selector after date selection
    setTimeout(() => {
      setOpenPax(true);
    }, 300);
  };

  const handlePassengerComplete = () => {
    setCurrentStep(4); // Enable search button glow
  };

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="rounded-2xl shadow-sm border border-neutral-200 bg-white p-4 md:p-6">
        {/* Trip Type Tabs */}
        <div className="inline-flex rounded-full bg-neutral-100 p-1">
          {[
            { id: "OW", label: "One Way" },
            { id: "RT", label: "Round Trip" },
            { id: "MC", label: "Multi City" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTrip(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                trip === tab.id ? "bg-white shadow-sm" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* From/To Row - MOBILE OPTIMIZED Horizontal Layout */}
        <div className="mt-4 mobile-horizontal" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 44px 1fr', 
          gap: '6px', 
          alignItems: 'end',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <div style={{ minWidth: 0, maxWidth: '100%' }}>
            <CityInput 
              label="From" 
              value={from} 
              onChange={setFrom}
              onNext={handleFromComplete}
              autoFocus={currentStep === 0}
            />
          </div>
          
          <button
            aria-label="Swap From and To"
            onClick={() => { const temp = from; setFrom(to); setTo(temp); }}
            className="h-11 w-11 mx-auto rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center"
            style={{ 
              flexShrink: 0,
              minWidth: '44px',
              maxWidth: '44px',
              height: '44px',
              width: '44px'
            }}
          >
            <span className="text-lg">⇄</span>
          </button>
          
          <div style={{ minWidth: 0, maxWidth: '100%' }}>
            <CityInput 
              label="To" 
              value={to} 
              onChange={setTo}
              onNext={handleToComplete}
              autoFocus={currentStep === 1}
            />
          </div>
        </div>

        {/* Date and Passenger Row */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <DateInput 
            label="Select Date" 
            value={depart} 
            onChange={(date) => { setDepart(date); handleDateComplete(); }}
            title="Departure" 
            autoFocus={currentStep === 2}
          />
          {trip !== "OW" && (
            <DateInput label="Select Date" value={ret} onChange={setRet} title="Return" disabled={trip === "OW"} />
          )}
          <div>
            <label className="sr-only">Travellers & Class</label>
            <button
              onClick={() => setOpenPax(true)}
              className="h-12 w-full px-4 rounded-xl border border-neutral-300 text-left hover:bg-neutral-50 flex items-center justify-between"
            >
              <span className="text-sm text-neutral-700">
                {pax.adt} Adult{pax.adt > 1 ? "s" : ""}{pax.chd ? `, ${pax.chd} Child${pax.chd > 1 ? "ren" : ""}` : ""}{pax.inf ? `, ${pax.inf} Infant${pax.inf > 1 ? "s" : ""}` : ""} · {pax.cabin}
              </span>
              <span className="h-4 w-4 text-neutral-500">▼</span>
            </button>
            {openPax && (
              <PaxOverlay 
                onClose={() => {
                  setOpenPax(false);
                  handlePassengerComplete();
                }} 
                value={pax} 
                onChange={(newPax) => {
                  setPax(newPax);
                  handlePassengerComplete();
                }} 
              />
            )}
          </div>
        </div>

        {/* Options */}
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4" /> Direct flights only
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4" /> Flexible dates ±3 days
          </label>
        </div>

        {/* Search Button - Compact & Centered with Glow Effect */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={async () => {
              setError(null);
              setResults(null);
              if (!from || !to) {
                alert('Please select both departure and destination cities');
                return;
              }
              if (!depart) {
                alert('Please select a departure date');
                return;
              }
              try {
                setLoading(true);
                const urlBase = backendBase || (window.__BACKEND_URL__ || (window.ENV && window.ENV.REACT_APP_BACKEND_URL));
                if (!urlBase) {
                  throw new Error('Backend URL not configured');
                }
                const payload = {
                  origin: from.city,
                  destination: to.city,
                  departure_date: depart,
                  return_date: trip !== 'OW' ? ret : null,
                  passengers: pax.adt + pax.chd + pax.inf,
                  class_type: (pax.cabin || 'Economy').toLowerCase().includes('business') ? 'business' : (pax.cabin || 'Economy').toLowerCase().includes('first') ? 'first' : 'economy',
                  timePreference: null,
                  flexibleDates: false,
                  nearbyAirports: false,
                  corporateBooking: false,
                  budgetRange: null
                };
                const res = await fetch(`${urlBase}/api/flights/search`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                if (!res.ok) {
                  const txt = await res.text();
                  throw new Error(`Search failed (${res.status}): ${txt}`);
                }
                const data = await res.json();
                setResults(data);
              } catch (e) {
                console.error('Search error', e);
                setError(e.message || 'Search failed');
              } finally {
                setLoading(false);
              }
            }}
            className={`px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-300 disabled:opacity-60 ${
              currentStep === 4 && from && to && depart ? 'ring-4 ring-blue-300 shadow-2xl bg-blue-700 scale-105' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Searching…' : 'Search Flights'}
          </button>
        </div>

        {/* Results */}
        {error && (
          <div className="mt-4 p-3 rounded-lg border border-red-200 text-red-700 bg-red-50 text-sm">
            {error}
          </div>
        )}
        {results && (
          <div className="mt-6">
            <div className="text-sm text-neutral-700 mb-2">
              {results.total_found} flights found · Source: {results.data_source}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {(results.flights || []).map((f, idx) => (
                <div key={idx} className="rounded-xl border border-neutral-200 p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{f.airline || f.airline_name || 'Flight'}</div>
                    <div className="text-sm font-semibold">₹{(f.price || f.lowest_fare || 0).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">
                    {f.origin} → {f.destination} · {f.departure_time} → {f.arrival_time} · {f.duration}
                  </div>
                  {f.fare_options && f.fare_options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {f.fare_options.slice(0, 3).map((fo, i) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {fo.fareType || fo.name}: ₹{fo.totalPrice?.toLocaleString?.() || fo.totalPrice}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {results.ai_recommendation && (
              <div className="mt-4 p-3 rounded-lg border border-blue-200 bg-blue-50 text-sm text-blue-800">
                💡 {results.ai_recommendation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Footer Component  
function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 pt-8">
      <div className="mx-auto max-w-5xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-medium mb-2" style={{ fontWeight: '500' }}>About</div>
          <ul className="space-y-1 text-neutral-600" style={{ fontWeight: '300' }}>
            <li><a href="#" className="hover:text-neutral-900">Company</a></li>
            <li><a href="#" className="hover:text-neutral-900">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2" style={{ fontWeight: '500' }}>Help</div>
          <ul className="space-y-1 text-neutral-600" style={{ fontWeight: '300' }}>
            <li><a href="#" className="hover:text-neutral-900">Support</a></li>
            <li><a href="#" className="hover:text-neutral-900">FAQ</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2" style={{ fontWeight: '500' }}>Policies</div>
          <ul className="space-y-1 text-neutral-600" style={{ fontWeight: '300' }}>
            <li><a href="#" className="hover:text-neutral-900">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-neutral-900">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-neutral-900">Cancellation & Refund</a></li>
            <li><a href="#" className="hover:text-neutral-900">Cookie Policy</a></li>
            <li><a href="#" className="hover:text-neutral-900">Disclaimer</a></li>
            <li><a href="#" className="hover:text-neutral-900">Grievance Officer</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2" style={{ fontWeight: '500' }}>Follow</div>
          <ul className="space-y-1 text-neutral-600" style={{ fontWeight: '300' }}>
            <li><a href="#" className="hover:text-neutral-900">Instagram</a></li>
            <li><a href="#" className="hover:text-neutral-900">Twitter</a></li>
            <li><a href="#" className="hover:text-neutral-900">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-neutral-500">
        © {new Date().getFullYear()} TourSmile. All rights reserved.
      </div>
    </footer>
  );
}

// Main App Component
function App() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-xl">
            <img 
              src="https://customer-assets.emergentagent.com/job_pixel-perfect-ui-12/artifacts/7qb5obai_FINAL%20LOGO%20-%20Copy.png"
              alt="TourSmile"
              className="h-10 w-auto"
            />
          </div>
          
          {/* Navigation - Hidden on mobile, flex on desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {[
              { label: "Flights", icon: "✈️" },
              { label: "Hotels", icon: "🏨" },
              { label: "Packages", icon: "🎁" },
              { label: "Activities", icon: "🎟️" },
            ].map((tab, i) => (
              <button
                key={i}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                  i === 0 ? "bg-blue-50 text-blue-700" : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <span className="opacity-90">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-full border border-neutral-300 text-sm hover:bg-neutral-50">
              24×7 Support
            </button>
            <button className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-sm">
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 pb-24">
        {/* Hero Section */}
        <section className="text-center pt-14 md:pt-20 pb-8">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ letterSpacing: '-0.75px' }}>
            Book Your Perfect Flight
          </h1>
          <p className="mt-3 text-neutral-600">
            Smart Travel, Best Prices
          </p>
        </section>
        
        {/* Search Card */}
        <SearchCard />

        {/* Trust Section - Responsive Grid */}
        <section className="mt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
            {[
              { icon: "🔒", t: "Secure Booking", s: "SSL encrypted payments" },
              { icon: "💬", t: "24×7 Support", s: "WhatsApp & phone support" },
              { icon: "🎯", t: "Personal Travel Assistant", s: "AI-powered recommendations just for you" },
              { icon: "⚡", t: "Instant Booking", s: "Confirmed in seconds" },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 p-4 bg-white hover:shadow-sm transition-shadow">
                <div className="text-2xl mb-2" aria-hidden>{item.icon}</div>
                <div className="text-sm font-medium" style={{ fontWeight: '500' }}>{item.t}</div>
                <div className="text-xs text-neutral-600 mt-0.5" style={{ fontWeight: '300' }}>{item.s}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}

export default App;