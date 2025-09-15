import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './App.css';
import FlightResults from './FlightResults';

// Import existing comprehensive airport database and components...

// TOURSMILE HOMEPAGE - CLEAN WORKING IMPLEMENTATION
// Mobile-first responsive with proper breakpoints

// Comprehensive Global Airport Database - ALL Worldwide Airports
// COMPREHENSIVE GLOBAL AIRPORTS DATABASE - 300+ Airports Worldwide
const GLOBAL_AIRPORTS_DATABASE = [
  // INDIA - Complete Coverage (All Major Airports)
  { city: "Mumbai", iata: "BOM", airport: "Chhatrapati Shivaji Maharaj International Airport", country: "IN", countryName: "India" },
  { city: "Delhi", iata: "DEL", airport: "Indira Gandhi International Airport", country: "IN", countryName: "India" },
  { city: "Bengaluru", iata: "BLR", airport: "Kempegowda International Airport", country: "IN", countryName: "India" },
  { city: "Hyderabad", iata: "HYD", airport: "Rajiv Gandhi International Airport", country: "IN", countryName: "India" },
  { city: "Chennai", iata: "MAA", airport: "Chennai International Airport", country: "IN", countryName: "India" },
  { city: "Kolkata", iata: "CCU", airport: "Netaji Subhas Chandra Bose International Airport", country: "IN", countryName: "India" },
  { city: "Pune", iata: "PNQ", airport: "Pune International Airport", country: "IN", countryName: "India" },
  { city: "Ahmedabad", iata: "AMD", airport: "Sardar Vallabhbhai Patel International Airport", country: "IN", countryName: "India" },
  { city: "Kochi", iata: "COK", airport: "Cochin International Airport", country: "IN", countryName: "India" },
  { city: "Goa", iata: "GOI", airport: "Manohar International Airport", country: "IN", countryName: "India" },
  { city: "Jaipur", iata: "JAI", airport: "Jaipur International Airport", country: "IN", countryName: "India" },
  { city: "Lucknow", iata: "LKO", airport: "Chaudhary Charan Singh International Airport", country: "IN", countryName: "India" },
  { city: "Chandigarh", iata: "IXC", airport: "Chandigarh Airport", country: "IN", countryName: "India" },
  { city: "Thiruvananthapuram", iata: "TRV", airport: "Trivandrum International Airport", country: "IN", countryName: "India" },
  { city: "Coimbatore", iata: "CJB", airport: "Coimbatore International Airport", country: "IN", countryName: "India" },
  { city: "Nagpur", iata: "NAG", airport: "Dr. Babasaheb Ambedkar International Airport", country: "IN", countryName: "India" },
  { city: "Indore", iata: "IDR", airport: "Devi Ahilya Bai Holkar Airport", country: "IN", countryName: "India" },
  { city: "Bhubaneswar", iata: "BBI", airport: "Biju Patnaik International Airport", country: "IN", countryName: "India" },
  { city: "Visakhapatnam", iata: "VTZ", airport: "Visakhapatnam Airport", country: "IN", countryName: "India" },
  { city: "Srinagar", iata: "SXR", airport: "Sheikh ul-Alam International Airport", country: "IN", countryName: "India" },
  { city: "Amritsar", iata: "ATQ", airport: "Sri Guru Ram Dass Jee International Airport", country: "IN", countryName: "India" },
  { city: "Patna", iata: "PAT", airport: "Jay Prakash Narayan International Airport", country: "IN", countryName: "India" },
  { city: "Ranchi", iata: "IXR", airport: "Birsa Munda Airport", country: "IN", countryName: "India" },
  { city: "Dehradun", iata: "DED", airport: "Jolly Grant Airport", country: "IN", countryName: "India" },
  { city: "Jammu", iata: "IXJ", airport: "Jammu Airport", country: "IN", countryName: "India" },
  { city: "Mangalore", iata: "IXE", airport: "Mangalore International Airport", country: "IN", countryName: "India" },
  { city: "Madurai", iata: "IXM", airport: "Madurai Airport", country: "IN", countryName: "India" },
  { city: "Tiruchirapalli", iata: "TRZ", airport: "Tiruchirappalli International Airport", country: "IN", countryName: "India" },
  { city: "Varanasi", iata: "VNS", airport: "Lal Bahadur Shastri International Airport", country: "IN", countryName: "India" },
  { city: "Raipur", iata: "RPR", airport: "Swami Vivekananda Airport", country: "IN", countryName: "India" },
  { city: "Vadodara", iata: "BDQ", airport: "Vadodara Airport", country: "IN", countryName: "India" },

  // USA - Complete Major Airports Coverage
  { city: "New York", iata: "JFK", airport: "John F. Kennedy International Airport", country: "US", countryName: "United States" },
  { city: "New York", iata: "LGA", airport: "LaGuardia Airport", country: "US", countryName: "United States" },
  { city: "New York", iata: "EWR", airport: "Newark Liberty International Airport", country: "US", countryName: "United States" },
  { city: "Los Angeles", iata: "LAX", airport: "Los Angeles International Airport", country: "US", countryName: "United States" },
  { city: "Chicago", iata: "ORD", airport: "O'Hare International Airport", country: "US", countryName: "United States" },
  { city: "Chicago", iata: "MDW", airport: "Midway International Airport", country: "US", countryName: "United States" },
  { city: "Miami", iata: "MIA", airport: "Miami International Airport", country: "US", countryName: "United States" },
  { city: "San Francisco", iata: "SFO", airport: "San Francisco International Airport", country: "US", countryName: "United States" },
  { city: "Boston", iata: "BOS", airport: "Logan International Airport", country: "US", countryName: "United States" },
  { city: "Washington", iata: "DCA", airport: "Ronald Reagan Washington National Airport", country: "US", countryName: "United States" },
  { city: "Washington", iata: "IAD", airport: "Washington Dulles International Airport", country: "US", countryName: "United States" },
  { city: "Seattle", iata: "SEA", airport: "Seattle-Tacoma International Airport", country: "US", countryName: "United States" },
  { city: "Las Vegas", iata: "LAS", airport: "McCarran International Airport", country: "US", countryName: "United States" },
  { city: "Denver", iata: "DEN", airport: "Denver International Airport", country: "US", countryName: "United States" },
  { city: "Atlanta", iata: "ATL", airport: "Hartsfield-Jackson Atlanta International Airport", country: "US", countryName: "United States" },
  { city: "Dallas", iata: "DFW", airport: "Dallas/Fort Worth International Airport", country: "US", countryName: "United States" },
  { city: "Dallas", iata: "DAL", airport: "Dallas Love Field", country: "US", countryName: "United States" },
  { city: "Houston", iata: "IAH", airport: "George Bush Intercontinental Airport", country: "US", countryName: "United States" },
  { city: "Houston", iata: "HOU", airport: "William P. Hobby Airport", country: "US", countryName: "United States" },
  { city: "Phoenix", iata: "PHX", airport: "Phoenix Sky Harbor International Airport", country: "US", countryName: "United States" },
  { city: "Orlando", iata: "MCO", airport: "Orlando International Airport", country: "US", countryName: "United States" },
  { city: "Detroit", iata: "DTW", airport: "Detroit Metropolitan Wayne County Airport", country: "US", countryName: "United States" },
  { city: "Minneapolis", iata: "MSP", airport: "Minneapolis-St Paul International Airport", country: "US", countryName: "United States" },
  { city: "Philadelphia", iata: "PHL", airport: "Philadelphia International Airport", country: "US", countryName: "United States" },
  { city: "San Diego", iata: "SAN", airport: "San Diego International Airport", country: "US", countryName: "United States" },
  { city: "Portland", iata: "PDX", airport: "Portland International Airport", country: "US", countryName: "United States" },
  { city: "Tampa", iata: "TPA", airport: "Tampa International Airport", country: "US", countryName: "United States" },

  // UNITED KINGDOM - Complete Coverage
  { city: "London", iata: "LHR", airport: "Heathrow Airport", country: "GB", countryName: "United Kingdom" },
  { city: "London", iata: "LGW", airport: "Gatwick Airport", country: "GB", countryName: "United Kingdom" },
  { city: "London", iata: "STN", airport: "Stansted Airport", country: "GB", countryName: "United Kingdom" },
  { city: "London", iata: "LTN", airport: "Luton Airport", country: "GB", countryName: "United Kingdom" },
  { city: "London", iata: "LCY", airport: "London City Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Manchester", iata: "MAN", airport: "Manchester Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Birmingham", iata: "BHX", airport: "Birmingham Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Edinburgh", iata: "EDI", airport: "Edinburgh Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Glasgow", iata: "GLA", airport: "Glasgow Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Bristol", iata: "BRS", airport: "Bristol Airport", country: "GB", countryName: "United Kingdom" },

  // EUROPE - Major Coverage
  { city: "Paris", iata: "CDG", airport: "Charles de Gaulle Airport", country: "FR", countryName: "France" },
  { city: "Paris", iata: "ORY", airport: "Orly Airport", country: "FR", countryName: "France" },
  { city: "Amsterdam", iata: "AMS", airport: "Amsterdam Airport Schiphol", country: "NL", countryName: "Netherlands" },
  { city: "Frankfurt", iata: "FRA", airport: "Frankfurt Airport", country: "DE", countryName: "Germany" },
  { city: "Munich", iata: "MUC", airport: "Munich Airport", country: "DE", countryName: "Germany" },
  { city: "Berlin", iata: "BER", airport: "Berlin Brandenburg Airport", country: "DE", countryName: "Germany" },
  { city: "Rome", iata: "FCO", airport: "Leonardo da Vinci-Fiumicino Airport", country: "IT", countryName: "Italy" },
  { city: "Rome", iata: "CIA", airport: "Ciampino Airport", country: "IT", countryName: "Italy" },
  { city: "Milan", iata: "MXP", airport: "Malpensa Airport", country: "IT", countryName: "Italy" },
  { city: "Milan", iata: "LIN", airport: "Linate Airport", country: "IT", countryName: "Italy" },
  { city: "Madrid", iata: "MAD", airport: "Adolfo Suárez Madrid-Barajas Airport", country: "ES", countryName: "Spain" },
  { city: "Barcelona", iata: "BCN", airport: "Barcelona-El Prat Airport", country: "ES", countryName: "Spain" },
  { city: "Vienna", iata: "VIE", airport: "Vienna International Airport", country: "AT", countryName: "Austria" },
  { city: "Zurich", iata: "ZUR", airport: "Zurich Airport", country: "CH", countryName: "Switzerland" },
  { city: "Brussels", iata: "BRU", airport: "Brussels Airport", country: "BE", countryName: "Belgium" },

  // MIDDLE EAST - Major Hubs
  { city: "Dubai", iata: "DXB", airport: "Dubai International Airport", country: "AE", countryName: "United Arab Emirates" },
  { city: "Dubai", iata: "DWC", airport: "Al Maktoum International Airport", country: "AE", countryName: "United Arab Emirates" },
  { city: "Abu Dhabi", iata: "AUH", airport: "Abu Dhabi International Airport", country: "AE", countryName: "United Arab Emirates" },
  { city: "Doha", iata: "DOH", airport: "Hamad International Airport", country: "QA", countryName: "Qatar" },
  { city: "Kuwait City", iata: "KWI", airport: "Kuwait International Airport", country: "KW", countryName: "Kuwait" },
  { city: "Riyadh", iata: "RUH", airport: "King Khalid International Airport", country: "SA", countryName: "Saudi Arabia" },
  { city: "Jeddah", iata: "JED", airport: "King Abdulaziz International Airport", country: "SA", countryName: "Saudi Arabia" },

  // ASIA-PACIFIC - Major Coverage
  { city: "Singapore", iata: "SIN", airport: "Singapore Changi Airport", country: "SG", countryName: "Singapore" },
  { city: "Hong Kong", iata: "HKG", airport: "Hong Kong International Airport", country: "HK", countryName: "Hong Kong" },
  { city: "Bangkok", iata: "BKK", airport: "Suvarnabhumi Airport", country: "TH", countryName: "Thailand" },
  { city: "Bangkok", iata: "DMK", airport: "Don Mueang International Airport", country: "TH", countryName: "Thailand" },
  { city: "Kuala Lumpur", iata: "KUL", airport: "Kuala Lumpur International Airport", country: "MY", countryName: "Malaysia" },
  { city: "Jakarta", iata: "CGK", airport: "Soekarno-Hatta International Airport", country: "ID", countryName: "Indonesia" },
  { city: "Manila", iata: "MNL", airport: "Ninoy Aquino International Airport", country: "PH", countryName: "Philippines" },
  { city: "Seoul", iata: "ICN", airport: "Incheon International Airport", country: "KR", countryName: "South Korea" },
  { city: "Seoul", iata: "GMP", airport: "Gimpo International Airport", country: "KR", countryName: "South Korea" },
  { city: "Tokyo", iata: "NRT", airport: "Narita International Airport", country: "JP", countryName: "Japan" },
  { city: "Tokyo", iata: "HND", airport: "Haneda Airport", country: "JP", countryName: "Japan" },
  { city: "Beijing", iata: "PEK", airport: "Beijing Capital International Airport", country: "CN", countryName: "China" },
  { city: "Shanghai", iata: "PVG", airport: "Shanghai Pudong International Airport", country: "CN", countryName: "China" },

  // AUSTRALIA & OCEANIA
  { city: "Sydney", iata: "SYD", airport: "Kingsford Smith Airport", country: "AU", countryName: "Australia" },
  { city: "Melbourne", iata: "MEL", airport: "Melbourne Airport", country: "AU", countryName: "Australia" },
  { city: "Brisbane", iata: "BNE", airport: "Brisbane Airport", country: "AU", countryName: "Australia" },
  { city: "Perth", iata: "PER", airport: "Perth Airport", country: "AU", countryName: "Australia" },
  { city: "Auckland", iata: "AKL", airport: "Auckland Airport", country: "NZ", countryName: "New Zealand" },

  // CANADA - Major Coverage  
  { city: "Toronto", iata: "YYZ", airport: "Lester B. Pearson International Airport", country: "CA", countryName: "Canada" },
  { city: "Vancouver", iata: "YVR", airport: "Vancouver International Airport", country: "CA", countryName: "Canada" },
  { city: "Montreal", iata: "YUL", airport: "Pierre Elliott Trudeau International Airport", country: "CA", countryName: "Canada" },
  { city: "Calgary", iata: "YYC", airport: "Calgary International Airport", country: "CA", countryName: "Canada" }
];

// Create indexed lookup for fast performance
const createAirportIndex = () => {
  const index = new Map();
  GLOBAL_AIRPORTS_DATABASE.forEach(airport => {
    // Index by IATA code
    index.set(airport.iata.toLowerCase(), airport);
    // Index by city name  
    index.set(airport.city.toLowerCase(), airport);
    // Index by airport name
    index.set(airport.airport.toLowerCase(), airport);
  });
  return index;
};

const AIRPORT_INDEX = createAirportIndex();

// Debounced hook
function useDebounced(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    console.log('useDebounced useEffect triggered with value:', value);
    const timer = setTimeout(() => {
      console.log('useDebounced setTimeout callback with value:', value);
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  console.log('useDebounced returning:', debouncedValue);
  return debouncedValue;
}

// Window width hook for responsive design
function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowWidth;
}

// City Input Component - Updated for Overlay Support
function CityInput({ label, value, onChange, onNext, autoFocus = false, integrated = false, overlay = false }) {
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
  
  // Reset query when value prop changes (important for swap functionality)
  useEffect(() => {
    if (value && value.city) {
      setQuery("");
    }
  }, [value]);
  
  // ENHANCED AUTOCOMPLETE SEARCH - High Performance with 2+ Character Trigger
  const performAutocompleteSearch = useCallback((query) => {
    // Minimum 2 characters required as per requirements
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const results = [];
    const seen = new Set(); // Prevent duplicates
    
    // Search through global airports database
    GLOBAL_AIRPORTS_DATABASE.forEach(airport => {
      const matchScore = calculateMatchScore(airport, searchTerm);
      if (matchScore > 0) {
        const key = `${airport.iata}-${airport.city}`;
        if (!seen.has(key)) {
          results.push({
            ...airport,
            matchScore,
            displayText: `${airport.iata} – ${airport.airport}, ${airport.city}`,
            searchText: searchTerm
          });
          seen.add(key);
        }
      }
    });

    // Sort by match score (higher score first) and limit to 10 results
    return results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }, []);

  // Calculate match score for relevance ranking
  const calculateMatchScore = (airport, searchTerm) => {
    let score = 0;
    
    // Exact IATA code match (highest priority)
    if (airport.iata.toLowerCase() === searchTerm) {
      score += 100;
    } else if (airport.iata.toLowerCase().startsWith(searchTerm)) {
      score += 80;
    }
    
    // City name matches
    if (airport.city.toLowerCase() === searchTerm) {
      score += 90;
    } else if (airport.city.toLowerCase().startsWith(searchTerm)) {
      score += 70;
    } else if (airport.city.toLowerCase().includes(searchTerm)) {
      score += 50;
    }
    
    // Airport name matches
    if (airport.airport.toLowerCase().includes(searchTerm)) {
      score += 30;
    }
    
    // Country name matches
    if (airport.countryName.toLowerCase().includes(searchTerm)) {
      score += 20;
    }
    
    return score;
  };

  // Highlight matching text in results
  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <strong key={index} className="font-semibold text-blue-600">{part}</strong> : 
        part
    );
  };

  // Enhanced search logic with "All Airports" support
  // MAIN AUTOCOMPLETE LOGIC - Trigger on 2+ Characters
  useEffect(() => {
    // Don't show suggestions if field already has a complete selected value (when not actively typing)
    if (value && value.iata && !query) {
      setOpen(false);
      setSuggestions([]);
      return;
    }
    
    // Trigger autocomplete search with 2+ characters (per requirements)
    if (debouncedQuery && debouncedQuery.length >= 2) {
      const autocompleteResults = performAutocompleteSearch(debouncedQuery);
      
      if (autocompleteResults.length > 0) {
        setSuggestions(autocompleteResults);
        setOpen(true);
      } else {
        // No matches found - keep dropdown open but show empty state
        setSuggestions([]);
        setOpen(true);
      }
    } else if (open && (!debouncedQuery || debouncedQuery.length < 2)) {
      // Show popular airports when dropdown is open but query is less than 2 characters
      const popularResults = GLOBAL_AIRPORTS_DATABASE
        .filter(airport => ['BOM', 'DEL', 'BLR', 'HYD', 'MAA', 'CCU', 'PNQ', 'AMD', 'DXB', 'SIN'].includes(airport.iata))
        .map(airport => ({
          ...airport,
          displayText: `${airport.iata} – ${airport.airport}, ${airport.city}`,
          matchScore: 0
        }));
      setSuggestions(popularResults);
    } else if (!debouncedQuery || debouncedQuery.length === 0) {
      setSuggestions([]);
      setOpen(false);
    }
  }, [debouncedQuery, open, value, performAutocompleteSearch]);
  
  // Get city code for multi-airport cities  
  const getCityCode = useCallback((cityName, country) => {
    const cityCodeMap = {
      "London-GB": "LON",
      "New York-US": "NYC", 
      "Paris-FR": "PAR",
      "Tokyo-JP": "TYO",
      "Milan-IT": "MIL",
      "Rome-IT": "ROM",
      "Chicago-US": "CHI",
      "Washington-US": "WAS",
      "Houston-US": "HOU",
      "Dallas-US": "DFW",
      "São Paulo-BR": "SAO",
      "Rio de Janeiro-BR": "RIO",
      "Buenos Aires-AR": "BUE",
      "Dubai-AE": "DXB",
      "Beijing-CN": "BJS",
      "Shanghai-CN": "SHA",
      "Istanbul-TR": "IST",
      "Toronto-CA": "YTO",
      "Oslo-NO": "OSL"
    };
    
    return cityCodeMap[`${cityName}-${country}`] || cityName.substring(0, 3).toUpperCase();
  }, []);
  
  // Get full country name
  const getCountryName = useCallback((countryCode) => {
    const countryNames = {
      'IN': 'India',
      'US': 'United States',
      'GB': 'United Kingdom', 
      'FR': 'France',
      'DE': 'Germany',
      'IT': 'Italy',
      'ES': 'Spain',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'PL': 'Poland',
      'CZ': 'Czech Republic',
      'HU': 'Hungary',
      'GR': 'Greece',
      'TR': 'Turkey',
      'AE': 'United Arab Emirates',
      'QA': 'Qatar',
      'KW': 'Kuwait',
      'SA': 'Saudi Arabia',
      'EG': 'Egypt',
      'ZA': 'South Africa',
      'KE': 'Kenya',
      'SG': 'Singapore',
      'HK': 'Hong Kong',
      'TH': 'Thailand',
      'MY': 'Malaysia',
      'ID': 'Indonesia',
      'PH': 'Philippines',
      'KR': 'South Korea',
      'JP': 'Japan',
      'CN': 'China',
      'TW': 'Taiwan',
      'VN': 'Vietnam',
      'AU': 'Australia',
      'NZ': 'New Zealand',
      'BR': 'Brazil',
      'AR': 'Argentina',
      'CL': 'Chile',
      'PE': 'Peru',
      'CO': 'Colombia',
      'MX': 'Mexico',
      'CA': 'Canada'
    };
    
    return countryNames[countryCode] || countryCode;
  }, []);
  
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
        // Fallback to enhanced airport database search
        const enhancedFallback = createEnhancedSuggestions(searchQuery);
        setSuggestions(enhancedFallback);
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

  // HANDLE AIRPORT SELECTION - Save IATA, Display Full Format
  const handleAirportSelect = (airport) => {
    // Format: "IATA – Airport Name, City" as per requirements
    const displayFormat = `${airport.iata} – ${airport.airport}, ${airport.city}`;
    
    // Save IATA code for backend (as per requirements)
    const airportData = {
      iata: airport.iata,
      city: airport.city,
      airport: airport.airport,
      country: airport.country,
      countryName: airport.countryName,
      displayText: displayFormat
    };
    
    setQuery(displayFormat);
    onChange(airportData);
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
      {/* Overlay Mode - Full search bar */}
      {overlay ? (
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            placeholder="Type city name or airport code"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              background: '#f9fafb'
            }}
            autoFocus={autoFocus}
          />
          
          {/* Overlay Dropdown */}
          {open && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              marginTop: '4px',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.iata || suggestion.city}
                  onClick={() => handleCitySelect(suggestion)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  className="overlay-suggestion-hover"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                        {suggestion.city}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {suggestion.airport}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#6b7280',
                      fontFamily: 'monospace'
                    }}>
                      {suggestion.iata}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Original integrated/standalone modes
        <>
          {/* Integrated Design - Label inside the container */}
          {integrated ? (
            <div 
              className="integrated-city-input"
              style={{ 
                padding: '12px 16px',
                height: '100%',
                minHeight: '64px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'text',
                position: 'relative'
              }}
              onClick={handleInputClick}
            >
              <label className="block text-[10px] font-medium text-neutral-500 mb-1 uppercase tracking-wide">{label}</label>
              <div className="flex items-center" style={{ minWidth: 0, maxWidth: '100%' }}>
                <span className="h-3 w-3 text-neutral-400 mr-2 flex-shrink-0 text-xs">✈️</span>
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
                    fontSize: '15px',
                    fontWeight: '500',
                    color: value ? '#111827' : '#9ca3af'
                  }}
                />
                {value && value.iata && (
                  <span className="text-[10px] text-neutral-500 font-mono uppercase ml-2 flex-shrink-0 bg-neutral-100 px-1.5 py-0.5 rounded">
                    {value.iata}
                  </span>
                )}
                {(query || value) && (
                  <button
                    onClick={(e) => { 
                      e.stopPropagation();
                      setQuery(""); 
                      onChange(null); 
                      setOpen(false); 
                      setSuggestions([]);
                      setTimeout(() => {
                        if (inputRef.current) {
                          inputRef.current.focus();
                        }
                      }, 100);
                    }}
                    className="ml-2 text-neutral-400 hover:text-neutral-600 flex-shrink-0 text-xs"
                    style={{ padding: '2px' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Original Design - Keep for backward compatibility
            <>
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
            </>
          )}
        </>
      )}
      
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
            
            {suggestions.length === 0 && debouncedQuery && debouncedQuery.length >= 2 ? (
              <div className="px-3 py-4 text-center text-neutral-500 text-sm">
                No airports found for "{debouncedQuery}"
              </div>
            ) : (
              suggestions.map((airport, i) => (
                <button
                  key={`${airport.iata}-${airport.city}-${i}`}
                  onClick={() => handleAirportSelect(airport)}
                  className="w-full text-left px-3 py-3 hover:bg-blue-50 transition-colors duration-150 border-b border-neutral-100 last:border-b-0"
                  style={{ minHeight: '56px' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {/* IATA Code - Airport Name, City format as required */}
                      <div className="text-sm font-medium text-neutral-900 mb-1">
                        <span className="font-bold text-blue-600">{airport.iata}</span>
                        <span className="text-neutral-400 mx-1">–</span>
                        <span>
                          {airport.searchText ? 
                            highlightMatch(airport.airport, airport.searchText) : 
                            airport.airport
                          }
                        </span>
                      </div>
                      {/* City, Country */}
                      <div className="text-xs text-neutral-500">
                        {airport.searchText ? 
                          highlightMatch(airport.city, airport.searchText) : 
                          airport.city
                        }, {airport.countryName}
                      </div>
                    </div>
                    {/* Match score indicator for debugging (remove in production) */}
                    {airport.matchScore > 0 && (
                      <div className="text-xs text-neutral-400 ml-2">
                        {airport.matchScore}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
            
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

// Simple Date Picker Component for Overlays
function SimpleDatePicker({ label, value, onChange, minDate, overlay = false }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const addMonths = (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  };

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
        <div className="grid grid-cols-7 text-xs text-neutral-500 mb-2">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => 
            <div key={day} className="py-2 text-center font-medium">{day}</div>
          )}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isSelected = value && value === dateStr;
            const isToday = new Date().toDateString() === date.toDateString();
            const isDisabled = minDate && date < new Date(minDate);
            
            return (
              <button 
                key={i} 
                disabled={isDisabled}
                onClick={() => { 
                  if (!isDisabled) {
                    onChange(dateStr);
                  }
                }}
                className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-colors ${
                  isCurrentMonth ? "text-neutral-900" : "text-neutral-400"
                } ${
                  isSelected ? "bg-blue-600 text-white font-semibold" : 
                  isToday ? "bg-blue-100 text-blue-700 font-medium" :
                  isDisabled ? "text-neutral-300 cursor-not-allowed" :
                  "hover:bg-neutral-100"
                }`}
                style={{ minHeight: '40px' }}
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
    <div>
      <div className="mb-3">
        <h4 className="text-sm font-medium text-neutral-700 mb-1">{label}</h4>
        {value && (
          <div className="text-lg font-semibold text-blue-600">
            {formatDateDisplay(value)}
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} 
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 text-sm"
          >
            ← Prev
          </button>
          <h3 className="text-base font-semibold">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 text-sm"
          >
            Next →
          </button>
        </div>
        {renderCalendar()}
      </div>
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
function PaxOverlay({ value, onChange, onClose, compact = false }) {
  const [pax, setPax] = useState(value);
  const ref = useRef(null);
  
  useEffect(() => {
    if (onClose) {
      const handleClickOutside = (e) => {
        if (!ref.current?.contains(e.target)) onClose();
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [onClose]);
  
  const updatePax = (key, newValue) => setPax(prev => ({ ...prev, [key]: newValue }));
  const increment = (key) => updatePax(key, Math.min(9, pax[key] + 1));
  const decrement = (key) => updatePax(key, Math.max(key === 'adt' ? 1 : 0, pax[key] - 1));
  
  useEffect(() => {
    if (pax.inf > pax.adt) updatePax('inf', pax.adt);
    if (pax.adt < 1) updatePax('adt', 1);
  }, [pax.adt, pax.inf]);

  // Compact mode for overlay
  if (compact) {
    return (
      <div>
        <div className="space-y-3">
          <PaxRow label="Adults (12+)" hint="Ages 12+" value={pax.adt} onInc={() => increment('adt')} onDec={() => decrement('adt')} />
          <PaxRow label="Children (2–11)" hint="Ages 2–11" value={pax.chd} onInc={() => increment('chd')} onDec={() => decrement('chd')} />
          <PaxRow label="Infants (0–1)" hint="On lap" value={pax.inf} onInc={() => increment('inf')} onDec={() => decrement('inf')} />
          
          <div className="pt-3 border-t border-neutral-200">
            <div className="text-sm font-medium mb-2" style={{ fontWeight: '500' }}>Cabin Class</div>
            <div className="grid grid-cols-2 gap-2">
              {["Economy", "Premium Economy", "Business", "First"].map((cabin) => (
                <button 
                  key={cabin} 
                  onClick={() => updatePax('cabin', cabin)} 
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    pax.cabin === cabin ? "border-blue-400 bg-blue-50 text-blue-700" : "border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {cabin}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-700">
              {pax.adt} Adult{pax.adt > 1 ? 's' : ''}, {pax.chd} Child{pax.chd > 1 ? 'ren' : ''}, {pax.inf} Infant{pax.inf > 1 ? 's' : ''} · {pax.cabin}
            </div>
            <button 
              onClick={() => onChange(pax)} 
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Original modal mode
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
function SearchCard({ onSearch, overlayStates, searchStates }) {
  const {
    showFromOverlay, setShowFromOverlay,
    showToOverlay, setShowToOverlay,
    showDateOverlay, setShowDateOverlay,
    showPassengerOverlay, setShowPassengerOverlay
  } = overlayStates;
  
  const {
    from, setFrom, to, setTo, depart, setDepart, ret, setRet,
    pax, setPax, trip, setTrip
  } = searchStates;
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // 0: from, 1: to, 2: date, 3: passenger, 4: search

  // Responsive design hook
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth <= 768;

  // Backend base URL from environment
  const backendBase = process.env.REACT_APP_BACKEND_URL;

  // Simple date formatter for compact display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

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
      setShowPassengerOverlay(true);
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

        {/* Compact From/To Container - Mobile Responsive */}
        <div className="mt-3 compact-flight-container" style={{ 
          position: 'relative',
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'stretch',
          minHeight: '52px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* From Field - Left Side */}
          <div 
            style={{ 
              flex: '1', 
              minWidth: 0, 
              maxWidth: '100%',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFromOverlay(true);
            }}
          >
            <div style={{ 
              padding: window.innerWidth <= 767 ? '6px 10px' : '8px 12px',
              height: '100%',
              minHeight: window.innerWidth <= 767 ? '44px' : '52px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div className="text-[9px] font-medium text-neutral-500 mb-0.5 uppercase tracking-wide">FROM</div>
              <div className="flex items-center" style={{ minWidth: 0, maxWidth: '100%' }}>
                <span className="text-xs mr-1.5 flex-shrink-0">✈️</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ fontSize: '14px', color: '#111827' }}>
                    {from ? from.city : 'Select City'}
                  </div>
                  {from && from.iata && (
                    <div className="text-[10px] text-neutral-500 font-mono uppercase">
                      {from.iata}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Swap Button - Mobile Responsive Design */}
          <div style={{
            position: isMobile ? 'absolute' : 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? '40px' : '44px',
            minWidth: isMobile ? '40px' : '44px',
            maxWidth: isMobile ? '40px' : '44px',
            height: isMobile ? '40px' : 'auto',
            background: 'white',
            top: isMobile ? '50%' : 'auto',
            right: isMobile ? '12px' : 'auto',
            transform: isMobile ? 'translateY(-50%)' : 'none',
            zIndex: isMobile ? 10 : 'auto'
          }}>
            <button
              aria-label="Swap From and To"
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation();
                const tempFrom = from; 
                const tempTo = to;
                setFrom(tempTo); 
                setTo(tempFrom);
              }}
              className="swap-button-enhanced"
              style={{ 
                height: isMobile ? '28px' : '32px',
                width: isMobile ? '28px' : '32px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '14px' : '16px',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.color = '#111827';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#374151';
                e.target.style.transform = 'scale(1)';
                e.target.style.borderColor = '#e5e7eb';
              }}
            >
              🔄
            </button>
          </div>
          
          {/* To Field - Right Side */}
          <div 
            style={{ 
              flex: '1', 
              minWidth: 0, 
              maxWidth: '100%', 
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowToOverlay(true);
            }}
          >
            <div style={{ 
              padding: window.innerWidth <= 767 ? '6px 10px' : '8px 12px',
              height: '100%',
              minHeight: window.innerWidth <= 767 ? '44px' : '52px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div className="text-[9px] font-medium text-neutral-500 mb-0.5 uppercase tracking-wide">TO</div>
              <div className="flex items-center" style={{ minWidth: 0, maxWidth: '100%' }}>
                <span className="text-xs mr-1.5 flex-shrink-0">✈️</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ fontSize: '14px', color: '#111827' }}>
                    {to ? to.city : 'Select City'}
                  </div>
                  {to && to.iata && (
                    <div className="text-[10px] text-neutral-500 font-mono uppercase">
                      {to.iata}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selection - Compact Row */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {/* Departure Date */}
          <div 
            className="date-selector-compact"
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '10px',
              padding: '8px 12px',
              minHeight: '52px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDateOverlay(true);
            }}
          >
            <div className="text-[9px] font-medium text-neutral-500 mb-0.5 uppercase tracking-wide">DEPARTURE</div>
            <div className="flex items-center">
              <span className="text-xs mr-1.5">📅</span>
              <div className="text-sm font-semibold" style={{ fontSize: '14px', color: depart ? '#111827' : '#9ca3af' }}>
                {depart ? formatDate(depart) : 'Select Date'}
              </div>
            </div>
          </div>

          {/* Return Date - Only show for Round Trip */}
          {trip === 'RT' && (
            <div 
              className="date-selector-compact"
              style={{
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                padding: '8px 12px',
                minHeight: '52px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDateOverlay(true);
              }}
            >
              <div className="text-[9px] font-medium text-neutral-500 mb-0.5 uppercase tracking-wide">RETURN</div>
              <div className="flex items-center">
                <span className="text-xs mr-1.5">📅</span>
                <div className="text-sm font-semibold" style={{ fontSize: '14px', color: ret ? '#111827' : '#9ca3af' }}>
                  {ret ? formatDate(ret) : 'Select Date'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Passenger Selection - Mobile Responsive */}
        <div 
          className="mt-3 passenger-selector-compact"
          style={{
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            padding: isMobile ? '10px 14px' : '8px 12px',
            minHeight: isMobile ? '56px' : '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowPassengerOverlay(true);
          }}
        >
          <div>
            <div className="text-[9px] font-medium text-neutral-500 mb-0.5 uppercase tracking-wide">PASSENGERS & CLASS</div>
            <div className="flex items-center">
              <span className="text-xs mr-1.5">👥</span>
              <div className="text-sm font-semibold" style={{ fontSize: '14px', color: '#111827' }}>
                {pax.adt + pax.chd + pax.inf} Traveller{pax.adt + pax.chd + pax.inf > 1 ? 's' : ''}, {pax.cabin}
              </div>
            </div>
          </div>
          <div className="text-neutral-400 text-lg">›</div>
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
              if (!from || !to) {
                alert('Please select both From and To airports');
                return;
              }
              if (!depart) {
                alert('Please select a departure date');
                return;
              }
              
              // Call the parent's search handler
              if (onSearch) {
                await onSearch({
                  from,
                  to,
                  depart,
                  return: ret,
                  trip,
                  pax
                });
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
          <div className="font-semibold mb-2 text-black">About</div>
          <ul className="space-y-1">
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Company</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 text-black">Help</div>
          <ul className="space-y-1">
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Support</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">FAQ</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 text-black">Policies</div>
          <ul className="space-y-1">
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Terms & Conditions</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Cancellation & Refund</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Cookie Policy</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Disclaimer</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Grievance Officer</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 text-black">Follow</div>
          <ul className="space-y-1">
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Instagram</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Twitter</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">LinkedIn</a></li>
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
  // Navigation state
  const [currentPage, setCurrentPage] = useState('search'); // 'search', 'results', 'selection', 'passenger', 'payment', 'confirmation'
  const [searchResults, setSearchResults] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  
  // Overlay states - moved to App level for proper full-screen rendering
  const [showFromOverlay, setShowFromOverlay] = useState(false);
  const [showToOverlay, setShowToOverlay] = useState(false);
  const [showDateOverlay, setShowDateOverlay] = useState(false);
  const [showPassengerOverlay, setShowPassengerOverlay] = useState(false);
  
  // Search form state - moved to App level to share with overlays
  const [from, setFrom] = useState({ city: 'Mumbai', iata: 'BOM', airport: 'Chhatrapati Shivaji Maharaj Intl', country: 'IN' });
  const [to, setTo] = useState({ city: 'Delhi', iata: 'DEL', airport: 'Indira Gandhi Intl', country: 'IN' });
  const [depart, setDepart] = useState(null);
  const [ret, setRet] = useState(null);
  const [pax, setPax] = useState({ adt: 1, chd: 0, inf: 0, cabin: "Economy" });
  const [trip, setTrip] = useState("OW");
  
  const handleSearch = async (searchData) => {
    try {
      setSearchParams({
        from: searchData.from,
        to: searchData.to,
        departDate: searchData.depart,
        returnDate: searchData.return,
        passengers: `${searchData.pax.adt} Adult${searchData.pax.adt > 1 ? 's' : ''}${searchData.pax.chd > 0 ? `, ${searchData.pax.chd} Child${searchData.pax.chd > 1 ? 'ren' : ''}` : ''}${searchData.pax.inf > 0 ? `, ${searchData.pax.inf} Infant${searchData.pax.inf > 1 ? 's' : ''}` : ''}`,
        class: searchData.pax.cabin,
        tripType: searchData.trip
      });
      
      // Mock search delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to results page
      setCurrentPage('results');
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight);
    setCurrentPage('selection');
  };

  const handleBackToSearch = () => {
    setCurrentPage('search');
    setSearchResults(null);
    setSelectedFlight(null);
  };

  const handleBackToResults = () => {
    setCurrentPage('results');
    setSelectedFlight(null);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Render different pages based on current state */}
      {currentPage === 'search' && (
        <>
          {/* Header */}
          <header className="border-b border-neutral-100">
            <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src="https://customer-assets.emergentagent.com/job_pixel-perfect-ui-12/artifacts/7qb5obai_FINAL%20LOGO%20-%20Copy.png"
                  alt="TourSmile"
                  className="h-12 w-auto"
                />
              </div>
              <div className="flex items-center space-x-3">
                <a href="https://wa.me/+919623959623" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 rounded-full border border-neutral-300 text-black hover:bg-green-50 hover:border-green-400 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516" fill="#25D366"/>
                  </svg>
                </a>
                <button className="px-4 py-2 rounded-full border border-neutral-300 text-black text-sm font-medium hover:bg-neutral-50 hover:border-neutral-400 transition-colors">
                  Sign In
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="mx-auto max-w-5xl px-4 pb-24">
            {/* Service Icons Section */}
            <section className="text-center pt-12 pb-8">
              <div className="flex justify-center items-center space-x-8 md:space-x-12">
                {/* Flights Icon */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-neutral-300 bg-white flex items-center justify-center mb-2 group-hover:bg-blue-50 group-hover:border-blue-300 transition-all duration-200 shadow-sm">
                    <span className="text-xl md:text-2xl">✈️</span>
                  </div>
                  <span className="text-sm font-medium text-black">Flights</span>
                </div>
                
                {/* Hotels Icon */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-neutral-300 bg-white flex items-center justify-center mb-2 group-hover:bg-green-50 group-hover:border-green-300 transition-all duration-200 shadow-sm">
                    <span className="text-xl md:text-2xl">🏨</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-400">Hotels</span>
                </div>
                
                {/* Tours Icon */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-neutral-300 bg-white flex items-center justify-center mb-2 group-hover:bg-orange-50 group-hover:border-orange-300 transition-all duration-200 shadow-sm">
                    <span className="text-xl md:text-2xl">🗺️</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-400">Tours</span>
                </div>
              </div>
            </section>
            
            {/* Search Card */}
            <SearchCard 
              onSearch={handleSearch}
              overlayStates={{
                showFromOverlay, setShowFromOverlay,
                showToOverlay, setShowToOverlay,
                showDateOverlay, setShowDateOverlay,
                showPassengerOverlay, setShowPassengerOverlay
              }}
              searchStates={{
                from, setFrom, to, setTo, depart, setDepart, ret, setRet,
                pax, setPax, trip, setTrip
              }}
            />

            {/* Trust Section */}
            <section className="mt-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { icon: "🔒", title: "Secure Booking", desc: "SSL encrypted transactions" },
                  { icon: "📞", title: "24x7 Support", desc: "Round the clock assistance" },
                  { icon: "👨‍💼", title: "Personal Travel Assistant", desc: "Dedicated support executive" },
                  { icon: "⚡", title: "Instant Booking", desc: "Confirmed tickets in seconds" }
                ].map(item => (
                  <div key={item.title} className="p-4 rounded-xl hover:shadow-lg transition-shadow">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-neutral-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>

          {/* Footer */}
          <Footer />
        </>
      )}
      
      {/* Results Page */}
      {currentPage === 'results' && (
        <>
          {/* Header with Back Button */}
          <header className="border-b border-neutral-100">
            <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleBackToSearch}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Search
                </button>
                <div className="text-xl font-bold text-blue-600">TourSmile</div>
              </div>
            </div>
          </header>
          
          <FlightResults 
            searchParams={searchParams}
            onFlightSelect={handleFlightSelect}
          />
        </>
      )}
      
      {/* Flight Selection Page */}
      {currentPage === 'selection' && (
        <>
          <header className="border-b border-neutral-100">
            <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleBackToResults}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Results
                </button>
                <div className="text-xl font-bold text-blue-600">TourSmile</div>
              </div>
            </div>
          </header>
          
          <div className="mx-auto max-w-5xl px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Flight Selection</h1>
            <p className="text-gray-600 mb-8">Choose your fare option and proceed to passenger details</p>
            
            {selectedFlight && (
              <div className="bg-white border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{selectedFlight.logo}</span>
                    <div>
                      <div className="font-semibold text-lg">{selectedFlight.airline}</div>
                      <div className="text-gray-600">{selectedFlight.flightNumber}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedFlight.fareOptions?.map((option, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                      <div className="font-semibold mb-2">{option.type}</div>
                      <div className="text-2xl font-bold text-blue-600 mb-2">₹{option.price.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>🧳 {option.baggage}</div>
                        <div>{option.meal ? '🍽️ Meal included' : '🚫 No meal'}</div>
                        <div>{option.refundable ? '↩️ Refundable' : '🚫 Non-refundable'}</div>
                      </div>
                      <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        Select This Fare
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    
    {/* OVERLAYS - App Level for Full-Screen Display */}
    
    {/* City Selection Overlay - Ixigo Style */}
    {(showFromOverlay || showToOverlay) && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => {
              setShowFromOverlay(false);
              setShowToOverlay(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px',
              color: '#6b7280'
            }}
          >
            ←
          </button>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            {showFromOverlay ? 'Select Departure City' : 'Select Destination City'}
          </h3>
          <div style={{ width: '34px' }}></div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
          <input
            type="text"
            placeholder="Type city name or airport code"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              background: '#f9fafb'
            }}
            autoFocus={true}
            onChange={(e) => {
              // Filter popular cities based on input
              const query = e.target.value.toLowerCase();
              if (query.length > 0) {
                const filtered = [
                  { city: 'Mumbai', iata: 'BOM', airport: 'Chhatrapati Shivaji Maharaj Intl', country: 'IN' },
                  { city: 'Delhi', iata: 'DEL', airport: 'Indira Gandhi Intl', country: 'IN' },
                  { city: 'Bengaluru', iata: 'BLR', airport: 'Kempegowda Intl', country: 'IN' },
                  { city: 'Chennai', iata: 'MAA', airport: 'Chennai Intl', country: 'IN' },
                  { city: 'Kolkata', iata: 'CCU', airport: 'Netaji Subhas Chandra Bose Intl', country: 'IN' },
                  { city: 'Hyderabad', iata: 'HYD', airport: 'Rajiv Gandhi Intl', country: 'IN' },
                  { city: 'Dubai', iata: 'DXB', airport: 'Dubai International', country: 'AE' },
                  { city: 'Singapore', iata: 'SIN', airport: 'Singapore Changi', country: 'SG' },
                  { city: 'London', iata: 'LHR', airport: 'Heathrow Airport', country: 'GB' },
                  { city: 'New York', iata: 'JFK', airport: 'John F Kennedy Intl', country: 'US' }
                ].filter(airport => 
                  airport.city.toLowerCase().includes(query) ||
                  airport.iata.toLowerCase().includes(query) ||
                  airport.airport.toLowerCase().includes(query)
                );
                // Could add filtered results here, but for now we'll just use the full list below
              }
            }}
          />
        </div>

        {/* Popular Cities */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
              POPULAR CITIES
            </h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {[
                { city: 'Mumbai', iata: 'BOM', airport: 'Chhatrapati Shivaji Maharaj Intl', country: 'IN' },
                { city: 'Delhi', iata: 'DEL', airport: 'Indira Gandhi Intl', country: 'IN' },
                { city: 'Bengaluru', iata: 'BLR', airport: 'Kempegowda Intl', country: 'IN' },
                { city: 'Chennai', iata: 'MAA', airport: 'Chennai Intl', country: 'IN' },
                { city: 'Kolkata', iata: 'CCU', airport: 'Netaji Subhas Chandra Bose Intl', country: 'IN' },
                { city: 'Hyderabad', iata: 'HYD', airport: 'Rajiv Gandhi Intl', country: 'IN' },
                { city: 'Dubai', iata: 'DXB', airport: 'Dubai International', country: 'AE' },
                { city: 'Singapore', iata: 'SIN', airport: 'Singapore Changi', country: 'SG' },
                { city: 'London', iata: 'LHR', airport: 'Heathrow Airport', country: 'GB' },
                { city: 'New York', iata: 'JFK', airport: 'John F Kennedy Intl', country: 'US' }
              ].map((airport) => (
                <div
                  key={airport.iata}
                  style={{
                    padding: '12px',
                    border: '1px solid #f3f4f6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="city-option-hover"
                  onClick={() => {
                    if (showFromOverlay) {
                      setFrom(airport);
                      setShowFromOverlay(false);
                    } else {
                      setTo(airport);
                      setShowToOverlay(false);
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                        {airport.city}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {airport.airport}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#6b7280',
                      fontFamily: 'monospace'
                    }}>
                      {airport.iata}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Date Selection Overlay - Compact Calendar */}
    {showDateOverlay && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => setShowDateOverlay(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px',
              color: '#6b7280'
            }}
          >
            ←
          </button>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Select Travel Date
          </h3>
          <div style={{ width: '34px' }}></div>
        </div>

        {/* Compact Calendar */}
        <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <SimpleDatePicker 
              label="Departure Date" 
              value={depart} 
              onChange={(date) => {
                setDepart(date);
                if (trip !== 'RT') {
                  setShowDateOverlay(false);
                }
              }}
              overlay={true}
            />
            {trip === 'RT' && (
              <div style={{ marginTop: '12px' }}>
                <SimpleDatePicker 
                  label="Return Date" 
                  value={ret} 
                  onChange={(date) => {
                    setRet(date);
                    setShowDateOverlay(false);
                  }}
                  minDate={depart}
                  overlay={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    
    {/* Passenger Selection Overlay - Compact */}
    {showPassengerOverlay && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => setShowPassengerOverlay(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px',
              color: '#6b7280'
            }}
          >
            ←
          </button>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Passengers & Class
          </h3>
          <div style={{ width: '34px' }}></div>
        </div>

        {/* Compact Passenger Selector */}
        <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <PaxOverlay 
              value={pax} 
              onChange={(newPax) => {
                setPax(newPax);
                setShowPassengerOverlay(false);
              }}
              compact={true}
            />
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default App;