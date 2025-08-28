import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ComingSoon from "./ComingSoon";
import FlightResults from "./FlightResults";
import FlightSelection from "./FlightSelection";
import PassengerInfo from "./PassengerInfo";
import Payment from "./Payment";
import BookingConfirmation from "./BookingConfirmation";

// For development - set to true to show coming soon page
// For beta subdomain, always show the full booking system
const SHOW_COMING_SOON = false; // Always show full booking system

// Check for development override in URL parameters
const urlParams = new URLSearchParams(window.location.search);
const isDevelopmentMode = urlParams.get('dev') === 'true';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = BACKEND_URL + '/api';

// Comprehensive Indian and International Airports Database
const AIRPORTS_DATABASE = [
  // Major Indian Airports
  { code: "DEL", name: "Delhi", fullName: "Indira Gandhi International Airport, Delhi", country: "India", popular: true },
  { code: "BOM", name: "Mumbai", fullName: "Chhatrapati Shivaji Maharaj International Airport, Mumbai", country: "India", popular: true },
  { code: "BLR", name: "Bangalore", fullName: "Kempegowda International Airport, Bangalore", country: "India", popular: true },
  { code: "MAA", name: "Chennai", fullName: "Chennai International Airport, Chennai", country: "India", popular: true },
  { code: "CCU", name: "Kolkata", fullName: "Netaji Subhash Chandra Bose International Airport, Kolkata", country: "India", popular: true },
  { code: "HYD", name: "Hyderabad", fullName: "Rajiv Gandhi International Airport, Hyderabad", country: "India", popular: true },
  { code: "PNQ", name: "Pune", fullName: "Pune Airport, Pune", country: "India", popular: true },
  { code: "AMD", name: "Ahmedabad", fullName: "Sardar Vallabhbhai Patel International Airport, Ahmedabad", country: "India", popular: true },
  { code: "GOI", name: "Goa", fullName: "Goa International Airport, Dabolim", country: "India", popular: true },
  { code: "COK", name: "Kochi", fullName: "Cochin International Airport, Kochi", country: "India", popular: true },
  { code: "JAI", name: "Jaipur", fullName: "Jaipur International Airport, Jaipur", country: "India", popular: true },
  { code: "TRV", name: "Trivandrum", fullName: "Trivandrum International Airport, Trivandrum", country: "India", popular: true },
  { code: "IXC", name: "Chandigarh", fullName: "Chandigarh Airport, Chandigarh", country: "India", popular: true },
  { code: "GAU", name: "Guwahati", fullName: "Lokpriya Gopinath Bordoloi International Airport, Guwahati", country: "India", popular: true },
  { code: "IXB", name: "Bagdogra", fullName: "Bagdogra Airport, Siliguri", country: "India", popular: false },
  { code: "IXJ", name: "Jammu", fullName: "Jammu Airport, Jammu", country: "India", popular: false },
  { code: "LEH", name: "Leh", fullName: "Kushok Bakula Rimpochee Airport, Leh", country: "India", popular: false },
  { code: "SXR", name: "Srinagar", fullName: "Sheikh ul-Alam International Airport, Srinagar", country: "India", popular: false },
  { code: "IXA", name: "Agartala", fullName: "Maharaja Bir Bikram Airport, Agartala", country: "India", popular: false },
  { code: "IXI", name: "Lilabari", fullName: "Lilabari Airport, North Lakhimpur", country: "India", popular: false },
  { code: "IMF", name: "Imphal", fullName: "Imphal Airport, Imphal", country: "India", popular: false },

  // Other Major Asian Airports
  { code: "DXB", name: "Dubai", fullName: "Dubai International Airport, Dubai", country: "UAE", popular: true },
  { code: "DWC", name: "Dubai Al Maktoum", fullName: "Al Maktoum International Airport, Dubai", country: "UAE", popular: false },
  { code: "AUH", name: "Abu Dhabi", fullName: "Abu Dhabi International Airport, Abu Dhabi", country: "UAE", popular: true },
  { code: "DOH", name: "Doha", fullName: "Hamad International Airport, Doha", country: "Qatar", popular: true },
  { code: "KWI", name: "Kuwait City", fullName: "Kuwait International Airport, Kuwait City", country: "Kuwait", popular: true },
  { code: "RUH", name: "Riyadh", fullName: "King Khalid International Airport, Riyadh", country: "Saudi Arabia", popular: true },
  { code: "JED", name: "Jeddah", fullName: "King Abdulaziz International Airport, Jeddah", country: "Saudi Arabia", popular: true },
  { code: "MCT", name: "Muscat", fullName: "Muscat International Airport, Muscat", country: "Oman", popular: true },
  { code: "BAH", name: "Manama", fullName: "Bahrain International Airport, Manama", country: "Bahrain", popular: true },
  { code: "SIN", name: "Singapore", fullName: "Changi Airport, Singapore", country: "Singapore", popular: true },
  { code: "KUL", name: "Kuala Lumpur", fullName: "Kuala Lumpur International Airport, Kuala Lumpur", country: "Malaysia", popular: true },
  { code: "CGK", name: "Jakarta", fullName: "Soekarno-Hatta International Airport, Jakarta", country: "Indonesia", popular: true },
  { code: "BKK", name: "Bangkok", fullName: "Suvarnabhumi Airport, Bangkok", country: "Thailand", popular: true },
  { code: "DMK", name: "Bangkok Don Mueang", fullName: "Don Mueang International Airport, Bangkok", country: "Thailand", popular: false },
  { code: "HKG", name: "Hong Kong", fullName: "Hong Kong International Airport, Hong Kong", country: "Hong Kong", popular: true },
  { code: "TPE", name: "Taipei", fullName: "Taiwan Taoyuan International Airport, Taipei", country: "Taiwan", popular: true },
  { code: "TSA", name: "Taipei Songshan", fullName: "Taipei Songshan Airport, Taipei", country: "Taiwan", popular: false },

  // Europe
  { code: "LHR", name: "London Heathrow", fullName: "Heathrow Airport, London", country: "United Kingdom", popular: true },
  { code: "LGW", name: "London Gatwick", fullName: "Gatwick Airport, London", country: "United Kingdom", popular: false },
  { code: "STN", name: "London Stansted", fullName: "Stansted Airport, London", country: "United Kingdom", popular: false },
  { code: "LTN", name: "London Luton", fullName: "Luton Airport, London", country: "United Kingdom", popular: false },
  { code: "LCY", name: "London City", fullName: "London City Airport, London", country: "United Kingdom", popular: false },
  { code: "MAN", name: "Manchester", fullName: "Manchester Airport, Manchester", country: "United Kingdom", popular: false },
  { code: "EDI", name: "Edinburgh", fullName: "Edinburgh Airport, Edinburgh", country: "United Kingdom", popular: false },
  { code: "CDG", name: "Paris", fullName: "Charles de Gaulle Airport, Paris", country: "France", popular: true },
  { code: "ORY", name: "Paris Orly", fullName: "Orly Airport, Paris", country: "France", popular: false },
  { code: "BVA", name: "Paris Beauvais", fullName: "Beauvais-Tillé Airport, Paris", country: "France", popular: false },
  { code: "FRA", name: "Frankfurt", fullName: "Frankfurt Airport, Frankfurt", country: "Germany", popular: true },
  { code: "MUC", name: "Munich", fullName: "Munich Airport, Munich", country: "Germany", popular: true },
  { code: "BER", name: "Berlin", fullName: "Berlin Brandenburg Airport, Berlin", country: "Germany", popular: true },
  { code: "AMS", name: "Amsterdam", fullName: "Amsterdam Airport Schiphol, Amsterdam", country: "Netherlands", popular: true },
  { code: "ZUR", name: "Zurich", fullName: "Zurich Airport, Zurich", country: "Switzerland", popular: true },
  { code: "VIE", name: "Vienna", fullName: "Vienna International Airport, Vienna", country: "Austria", popular: true },
  { code: "FCO", name: "Rome", fullName: "Leonardo da Vinci International Airport, Rome", country: "Italy", popular: true },
  { code: "MXP", name: "Milan", fullName: "Malpensa Airport, Milan", country: "Italy", popular: true },
  { code: "LIN", name: "Milan Linate", fullName: "Linate Airport, Milan", country: "Italy", popular: false },
  { code: "MAD", name: "Madrid", fullName: "Adolfo Suárez Madrid–Barajas Airport, Madrid", country: "Spain", popular: true },
  { code: "BCN", name: "Barcelona", fullName: "Barcelona-El Prat Airport, Barcelona", country: "Spain", popular: true },
  { code: "LIS", name: "Lisbon", fullName: "Humberto Delgado Airport, Lisbon", country: "Portugal", popular: true },
  { code: "IST", name: "Istanbul", fullName: "Istanbul Airport, Istanbul", country: "Turkey", popular: true },
  { code: "SAW", name: "Istanbul Sabiha", fullName: "Sabiha Gökçen International Airport, Istanbul", country: "Turkey", popular: false },
  { code: "ATH", name: "Athens", fullName: "Athens International Airport, Athens", country: "Greece", popular: true },

  // North America
  { code: "JFK", name: "New York JFK", fullName: "John F. Kennedy International Airport, New York", country: "USA", popular: true },
  { code: "LGA", name: "New York LaGuardia", fullName: "LaGuardia Airport, New York", country: "USA", popular: false },
  { code: "EWR", name: "Newark", fullName: "Newark Liberty International Airport, Newark", country: "USA", popular: false },
  { code: "LAX", name: "Los Angeles", fullName: "Los Angeles International Airport, Los Angeles", country: "USA", popular: true },
  { code: "SFO", name: "San Francisco", fullName: "San Francisco International Airport, San Francisco", country: "USA", popular: true },
  { code: "ORD", name: "Chicago", fullName: "O'Hare International Airport, Chicago", country: "USA", popular: true },
  { code: "MDW", name: "Chicago Midway", fullName: "Chicago Midway International Airport, Chicago", country: "USA", popular: false },
  { code: "MIA", name: "Miami", fullName: "Miami International Airport, Miami", country: "USA", popular: true },
  { code: "DFW", name: "Dallas", fullName: "Dallas/Fort Worth International Airport, Dallas", country: "USA", popular: true },
  { code: "ATL", name: "Atlanta", fullName: "Hartsfield-Jackson Atlanta International Airport, Atlanta", country: "USA", popular: true },
  { code: "SEA", name: "Seattle", fullName: "Seattle-Tacoma International Airport, Seattle", country: "USA", popular: true },
  { code: "DEN", name: "Denver", fullName: "Denver International Airport, Denver", country: "USA", popular: true },
  { code: "LAS", name: "Las Vegas", fullName: "McCarran International Airport, Las Vegas", country: "USA", popular: true },
  { code: "PHX", name: "Phoenix", fullName: "Phoenix Sky Harbor International Airport, Phoenix", country: "USA", popular: true },
  { code: "YYZ", name: "Toronto", fullName: "Toronto Pearson International Airport, Toronto", country: "Canada", popular: true },
  { code: "YVR", name: "Vancouver", fullName: "Vancouver International Airport, Vancouver", country: "Canada", popular: true },

  // Oceania
  { code: "SYD", name: "Sydney", fullName: "Kingsford Smith Airport, Sydney", country: "Australia", popular: true },
  { code: "MEL", name: "Melbourne", fullName: "Melbourne Airport, Melbourne", country: "Australia", popular: true },
  { code: "BNE", name: "Brisbane", fullName: "Brisbane Airport, Brisbane", country: "Australia", popular: true },
  { code: "PER", name: "Perth", fullName: "Perth Airport, Perth", country: "Australia", popular: true },
  { code: "AKL", name: "Auckland", fullName: "Auckland Airport, Auckland", country: "New Zealand", popular: true },
  { code: "CHC", name: "Christchurch", fullName: "Christchurch Airport, Christchurch", country: "New Zealand", popular: false },
];

// Multi-Airport City Groups
const MULTI_AIRPORT_CITIES = {
  "NYC": {
    cityName: "New York",
    cityCode: "NYC", 
    country: "USA",
    airports: ["JFK", "LGA", "EWR"],
    popular: true
  },
  "LON": {
    cityName: "London",
    cityCode: "LON",
    country: "United Kingdom", 
    airports: ["LHR", "LGW", "STN", "LTN", "LCY"],
    popular: true
  },
  "PAR": {
    cityName: "Paris",
    cityCode: "PAR",
    country: "France",
    airports: ["CDG", "ORY", "BVA"], 
    popular: true
  },
  "MIL": {
    cityName: "Milan", 
    cityCode: "MIL",
    country: "Italy",
    airports: ["MXP", "LIN"],
    popular: true
  },
  "IST": {
    cityName: "Istanbul",
    cityCode: "IST", 
    country: "Turkey",
    airports: ["IST", "SAW"],
    popular: true
  },
  "BKK": {
    cityName: "Bangkok",
    cityCode: "BKK",
    country: "Thailand", 
    airports: ["BKK", "DMK"],
    popular: true
  },
  "CHI": {
    cityName: "Chicago",
    cityCode: "CHI",
    country: "USA",
    airports: ["ORD", "MDW"], 
    popular: true
  },
  "TPE": {
    cityName: "Taipei",
    cityCode: "TPE", 
    country: "Taiwan",
    airports: ["TPE", "TSA"],
    popular: true
  },
  "DXB": {
    cityName: "Dubai",
    cityCode: "DXB",
    country: "UAE",
    airports: ["DXB", "DWC"],
    popular: true
  }
};

// Guided Search Form Component with Progressive Disclosure
const GuidedSearchForm = ({ onSearch, isSearching, compact = false }) => {
  // All existing state and functions remain the same...
  const [searchData, setSearchData] = useState({
    tripType: 'one-way',
    segments: [{ origin: '', destination: '', departureDate: '' }],
    returnDate: '',
    passengers: { adults: 1, children: 0, infants: 0 },
    classType: 'economy',
    preferences: { nonStop: false, student: false, senior: false, armed: false, flexibleDates: false, nearbyAirports: false, corporateBooking: false }
  });

  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [depAutoOpenToken, setDepAutoOpenToken] = useState(0);
  const [retAutoOpenToken, setRetAutoOpenToken] = useState(0);
  const [passengersAutoOpenToken, setPassengersAutoOpenToken] = useState(0);

  const departButtonRef = useRef(null);
  const returnButtonRef = useRef(null);
  const passengerButtonRef = useRef(null);

  const canSwap = searchData.segments[0]?.origin && searchData.segments[0]?.destination;

  const swapCities = () => {
    if (canSwap) {
      const newSegments = [...searchData.segments];
      const temp = newSegments[0].origin;
      newSegments[0].origin = newSegments[0].destination;
      newSegments[0].destination = temp;
      setSearchData({...searchData, segments: newSegments});
    }
  };

  const updateSegment = (index, field, value) => {
    const newSegments = [...searchData.segments];
    if (!newSegments[index]) newSegments[index] = {};
    newSegments[index][field] = value;
    setSearchData({...searchData, segments: newSegments});
  };

  const handleSearch = () => {
    if (onSearch && !isSearching) {
      onSearch(searchData);
    }
  };

  // BRAND NEW LIGHT MOBILE-FIRST DESIGN - COMPLETELY REBUILT
  return (
    <div className="w-full">
      {/* NEW LIGHT MOBILE DESIGN - EDGE TO EDGE */}
      <div className="mobile-search-form w-full bg-white shadow-sm border-t border-gray-100">
        
        {/* NEW SIMPLE TRIP TYPE TABS */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex space-x-2">
            {['one-way', 'return', 'multi-city'].map((type) => (
              <button
                key={type}
                onClick={() => setSearchData({...searchData, tripType: type})}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchData.tripType === type 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'one-way' ? 'One Way' : type === 'return' ? 'Round Trip' : 'Multi-City'}
              </button>
            ))}
          </div>
        </div>

        {/* NEW LIGHT FORM CONTENT */}
        <div className="p-4 space-y-4">
          
          {/* NEW SIMPLE FROM/TO LAYOUT */}
          <div className="space-y-3">
            {/* From/To Row */}
            <div className="grid grid-cols-3 gap-2 items-end">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-2">From</label>
                <SimpleCityInput
                  value={searchData.segments[0]?.origin || ''}
                  onChange={(city) => updateSegment(0, 'origin', city)}
                  placeholder="Delhi"
                  airports={AIRPORTS_DATABASE}
                />
              </div>
              
              <div className="col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={swapCities}
                  disabled={!canSwap}
                  className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                  aria-label="Swap cities"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                    <path d="M7 16l3 3 3-3M14 8l-3-3-3 3"/>
                  </svg>
                </button>
              </div>
              
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-2">To</label>
                <SimpleCityInput
                  value={searchData.segments[0]?.destination || ''}
                  onChange={(city) => updateSegment(0, 'destination', city)}
                  placeholder="Mumbai"
                  airports={AIRPORTS_DATABASE}
                />
              </div>
            </div>

            {/* Date Row */}
            <div className={`grid gap-3 ${searchData.tripType === 'return' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Departure</label>
                <input
                  type="date"
                  value={searchData.segments[0]?.departureDate || ''}
                  onChange={(e) => updateSegment(0, 'departureDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {searchData.tripType === 'return' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Return</label>
                  <input
                    type="date"
                    value={searchData.returnDate || ''}
                    onChange={(e) => setSearchData({...searchData, returnDate: e.target.value})}
                    min={searchData.segments[0]?.departureDate || new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Passengers Row */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Passengers & Class</label>
              <SimplePassengerSelector
                passengers={searchData.passengers}
                onPassengerChange={(passengers) => setSearchData({...searchData, passengers})}
                classType={searchData.classType}
                onClassChange={(classType) => setSearchData({...searchData, classType})}
              />
            </div>

            {/* Search Button */}
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching || !searchData.segments[0]?.origin || !searchData.segments[0]?.destination || !searchData.segments[0]?.departureDate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search Flights'}
            </button>
          </div>
        </div>


      </div>
    </div>
  );
};

// NEW SIMPLE MOBILE-FIRST COMPONENTS

// Simple City Input Component
const SimpleCityInput = ({ value, onChange, placeholder, airports }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  // Filter airports for mobile (show only major cities)
  const filteredAirports = airports
    .filter(airport => airport.popular || airport.name.length <= 15)
    .filter(airport => 
      airport.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      airport.code.toLowerCase().includes(inputValue.toLowerCase())
    )
    .slice(0, 8); // Limit to 8 results

  const handleSelect = (airport) => {
    const cityName = airport.name;
    setInputValue(cityName);
    onChange(cityName);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredAirports.map((airport) => (
            <div
              key={airport.code}
              onClick={() => handleSelect(airport)}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{airport.name}</div>
              <div className="text-sm text-gray-500">{airport.code}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Simple Passenger Selector Component  
const SimplePassengerSelector = ({ passengers, onPassengerChange, classType, onClassChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const updatePassengerCount = (type, increment) => {
    const current = passengers[type] || (type === 'adults' ? 1 : 0);
    const newValue = increment ? current + 1 : Math.max(type === 'adults' ? 1 : 0, current - 1);
    
    const newPassengers = {
      ...passengers,
      [type]: newValue
    };
    onPassengerChange(newPassengers);
  };

  const getTotalPassengers = () => {
    return (passengers.adults || 1) + (passengers.children || 0) + (passengers.infants || 0);
  };

  const getDisplayText = () => {
    const total = getTotalPassengers();
    const classNames = {
      'economy': 'Economy',
      'premium-economy': 'Premium',
      'business': 'Business',
      'first': 'First'
    };
    return `${total} Passenger${total > 1 ? 's' : ''}, ${classNames[classType] || 'Economy'}`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between"
      >
        <span>{getDisplayText()}</span>
        <svg className={`w-5 h-5 transform transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          {/* Passenger Counts */}
          <div className="space-y-4 mb-4">
            {[
              { key: 'adults', label: 'Adults', min: 1 },
              { key: 'children', label: 'Children', min: 0 },
              { key: 'infants', label: 'Infants', min: 0 }
            ].map(({ key, label, min }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => updatePassengerCount(key, false)}
                    disabled={passengers[key] <= min}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{passengers[key] || (key === 'adults' ? 1 : 0)}</span>
                  <button
                    type="button"
                    onClick={() => updatePassengerCount(key, true)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Class Selection */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'economy', label: 'Economy' },
                { key: 'premium-economy', label: 'Premium' },
                { key: 'business', label: 'Business' },
                { key: 'first', label: 'First' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onClassChange(key)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    classType === key
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDropdown(false)}
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

// Enhanced Flexible Calendar Date Picker Component (Priority 2 Feature)

// Promotional Integration Component (Priority 2 Feature)
const PromotionalBanner = ({ onPromoApply, compact = false }) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Active promotional campaigns (Priority 2 Feature)
  const activePromotions = [
    {
      id: 'NEWUSER50',
      title: '50% OFF',
      description: 'First booking discount',
      code: 'NEWUSER50',
      discount: '₹2,500 off',
      type: 'percentage',
      value: 50,
      icon: '🎉',
      bgColor: 'from-green-400 to-green-600'
    },
    {
      id: 'WEEKEND25',
      title: '25% OFF',
      description: 'Weekend getaway special',
      code: 'WEEKEND25',
      discount: 'Up to ₹1,500 off',
      type: 'percentage',
      value: 25,
      icon: '🌴',
      bgColor: 'from-blue-400 to-blue-600'
    },
    {
      id: 'FLASH500',
      title: '₹500 OFF',
      description: 'Flash sale - Limited time',
      code: 'FLASH500',
      discount: '₹500 instant discount',
      type: 'fixed',
      value: 500,
      icon: '⚡',
      bgColor: 'from-orange-400 to-red-500'
    }
  ];

  const [currentPromotion] = useState(activePromotions[0]); // Rotate or show based on logic

  const handlePromoApply = () => {
    // Mock promo validation
    const validPromo = activePromotions.find(p => p.code.toLowerCase() === promoCode.toLowerCase());
    
    if (validPromo) {
      setAppliedPromo(validPromo);
      onPromoApply?.(validPromo);
    } else {
      // Invalid promo code handling
      setAppliedPromo({ error: 'Invalid promo code' });
      setTimeout(() => setAppliedPromo(null), 3000);
    }
  };

  if (compact) {
    // Enhanced promotional display for compact mode with promo code input
    return (
      <div className="promotional-section mb-3 space-y-2">
        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-3 text-white text-center">
          <div className="font-bold text-sm">🎉 50% OFF First Booking!</div>
          <div className="text-xs mt-1">Code: NEWUSER50</div>
        </div>
        
        {/* Compact Promo Code Input - Always Visible */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🏷️</span>
            <span className="text-sm font-medium text-gray-700">Enter Promo Code:</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code (e.g. NEWUSER50)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handlePromoApply}
                disabled={!promoCode.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Apply
              </button>
            </div>
            
            {appliedPromo && (
              <div className={`text-sm p-2 rounded-lg ${
                appliedPromo.error 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {appliedPromo.error ? (
                  <span>❌ {appliedPromo.error}</span>
                ) : (
                  <span>✅ Promo applied! You'll save {appliedPromo.discount}</span>
                )}
              </div>
            )}
            
            {/* Quick Apply Buttons */}
            <div className="flex space-x-1">
              <button onClick={() => { setPromoCode('NEWUSER50'); }} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">NEWUSER50</button>
              <button onClick={() => { setPromoCode('WEEKEND25'); }} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">WEEKEND25</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="promotional-section space-y-3 mb-4">
      {/* Main Promotional Banner */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${currentPromotion.bgColor} p-4 text-white shadow-lg promotional-banner`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl animate-pulse">{currentPromotion.icon}</span>
              <div>
                <div className="text-lg font-bold">{currentPromotion.title}</div>
                <div className="text-sm opacity-90">{currentPromotion.description}</div>
                <div className="text-xs opacity-75 mt-1">Code: {currentPromotion.code}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{currentPromotion.discount}</div>
              <button
                onClick={() => {
                  setPromoCode(currentPromotion.code);
                  // Auto-apply the promo when clicked
                  setTimeout(() => handlePromoApply(), 100);
                }}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
        </div>
      </div>

      {/* Promo Code Input Section - Always Visible */}
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg">🏷️</span>
          <span className="text-sm font-medium text-gray-700">Enter Promo Code:</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code (e.g. NEWUSER50)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handlePromoApply}
              disabled={!promoCode.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Apply
            </button>
          </div>
          
          {/* Applied Promo Status */}
          {appliedPromo && (
            <div className={`text-sm p-2 rounded-lg ${
              appliedPromo.error 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {appliedPromo.error ? (
                <div className="flex items-center space-x-1">
                  <span>❌</span>
                  <span>{appliedPromo.error}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <span>✅</span>
                  <span>Promo applied! You'll save {appliedPromo.discount}</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Apply Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Quick codes:</span>
            <button 
              onClick={() => { setPromoCode('NEWUSER50'); }}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              NEWUSER50
            </button>
            <button 
              onClick={() => { setPromoCode('WEEKEND25'); }}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              WEEKEND25
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact Mobile-Optimized Passenger Selector Component (Enhanced)
const PassengerSelector = ({ passengers, onPassengerChange, classType, onClassChange, highlight = false, autoOpenToken = 0 }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Auto-open based on guidance flow
  useEffect(() => {
    if (autoOpenToken > 0) {
      setTimeout(() => {
        setShowDropdown(true);
      }, 300);
    }
  }, [autoOpenToken]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updatePassengerCount = (type, increment) => {
    const current = passengers[type] || (type === 'adults' ? 1 : 0);
    const newValue = increment ? current + 1 : Math.max(type === 'adults' ? 1 : 0, current - 1);
    
    const newPassengers = {
      ...passengers,
      [type]: newValue
    };
    onPassengerChange(newPassengers);
  };

  const getTotalPassengers = () => {
    return (passengers.adults || 1) + (passengers.children || 0) + (passengers.infants || 0);
  };

  const getCompactSummary = () => {
    const total = getTotalPassengers();
    const adults = passengers.adults || 1;
    const children = passengers.children || 0;
    const infants = passengers.infants || 0;
    
    // Mobile-friendly compact format
    if (children === 0 && infants === 0) {
      return `${adults} Adult${adults > 1 ? 's' : ''}`;
    } else {
      return `${total} Passenger${total > 1 ? 's' : ''}`;
    }
  };

  const getClassIcon = () => {
    const icons = {
      'economy': '🪑',
      'premium-economy': '✨',
      'business': '💼',
      'first': '👑'
    };
    return icons[classType] || '🪑';
  };

  const getClassName = () => {
    const names = {
      'economy': 'Economy',
      'premium-economy': 'Premium',
      'business': 'Business',
      'first': 'First'
    };
    return names[classType] || 'Economy';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">Passengers & Class</label>
      
      {/* Compact Passenger Display Button */}
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`w-full px-3 py-3 text-sm border-2 rounded-2xl transition-all duration-200 flex items-center justify-between text-left passenger-selector-button ${
          showDropdown ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        } ${highlight ? 'ring-2 ring-blue-200 animate-soft-pulse' : ''}`}
        aria-label="Select passengers and travel class"
        data-testid="passenger-selector-button"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">👥</span>
          <div>
            <div className="font-medium text-gray-900">{getCompactSummary()}</div>
            <div className="text-xs text-gray-600 flex items-center">
              <span className="mr-1">{getClassIcon()}</span>
              <span>{getClassName()}</span>
            </div>
          </div>
        </div>
        <div className={`text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>

      {/* Compact Mobile-Optimized Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-sm">
          {/* Header */}
          <div className="p-3 border-b border-gray-100 bg-blue-50 rounded-t-2xl">
            <h3 className="text-sm font-semibold text-gray-900">Select Passengers & Class</h3>
          </div>

          {/* Compact Passenger Counters */}
          <div className="p-3 space-y-3">
            {/* Adults - Compact Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm">👨‍👩‍👧‍👦</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">Adults</div>
                  <div className="text-xs text-gray-500">12+ years</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => updatePassengerCount('adults', false)}
                  className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-xs font-bold transition-colors disabled:opacity-50"
                  disabled={(passengers.adults || 1) <= 1}
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-medium">{passengers.adults || 1}</span>
                <button
                  type="button"
                  onClick={() => updatePassengerCount('adults', true)}
                  className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 text-xs font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Children - Compact Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm">🧒</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">Children</div>
                  <div className="text-xs text-gray-500">2-12 years</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => updatePassengerCount('children', false)}
                  className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-xs font-bold transition-colors disabled:opacity-50"
                  disabled={(passengers.children || 0) <= 0}
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-medium">{passengers.children || 0}</span>
                <button
                  type="button"
                  onClick={() => updatePassengerCount('children', true)}
                  className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 text-xs font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Infants - Compact Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm">👶</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">Infants</div>
                  <div className="text-xs text-gray-500">Under 2 years</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => updatePassengerCount('infants', false)}
                  className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-xs font-bold transition-colors disabled:opacity-50"
                  disabled={(passengers.infants || 0) <= 0}
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-medium">{passengers.infants || 0}</span>
                <button
                  type="button"
                  onClick={() => updatePassengerCount('infants', true)}
                  className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 text-xs font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Compact Travel Class Selection */}
          <div className="p-3 border-t border-gray-100">
            <div className="text-sm font-medium text-gray-900 mb-2">Travel Class</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'economy', label: 'Economy', icon: '🪑' },
                { value: 'premium-economy', label: 'Premium', icon: '✨' },
                { value: 'business', label: 'Business', icon: '💼' },
                { value: 'first', label: 'First', icon: '👑' }
              ].map((cls) => (
                <button
                  key={cls.value}
                  type="button"
                  onClick={() => onClassChange(cls.value)}
                  className={`p-2 rounded-lg border text-center transition-all duration-200 ${
                    classType === cls.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-sm mb-0.5">{cls.icon}</div>
                  <div className="text-xs font-medium">{cls.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Compact Apply Button */}
          <div className="p-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowDropdown(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Apply Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Flexible Calendar Date Picker Component (Priority 2 Feature)
const SimpleDatePicker = ({ value, onChange, minDate, label, className, onRangeSelect, enableRangeChips = false, highlight = false, buttonRef = null, autoOpenToken = 0, enableFlexibleDates = false, origin = '', destination = '' }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [flexibleRange, setFlexibleRange] = useState(null); // ±3 days from selected date
  const [priceData, setPriceData] = useState({}); // Mock price data for dates
  
  // Mock price data generator for flexible dates
  useEffect(() => {
    if (enableFlexibleDates && origin && destination) {
      const mockPrices = {};
      for (let i = -3; i <= 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Mock price generation with some variation
        const basePrice = 4500;
        const variation = Math.floor(Math.random() * 2000) - 1000; // ±1000
        mockPrices[dateStr] = Math.max(basePrice + variation, 2500);
      }
      setPriceData(mockPrices);
    }
  }, [enableFlexibleDates, origin, destination]);
  
  // Calculate flexible date range (±3 days)
  useEffect(() => {
    if (enableFlexibleDates && value) {
      const selectedDate = new Date(value);
      const range = [];
      for (let i = -3; i <= 3; i++) {
        const rangeDate = new Date(selectedDate);
        rangeDate.setDate(selectedDate.getDate() + i);
        range.push(rangeDate);
      }
      setFlexibleRange(range);
    } else {
      setFlexibleRange(null);
    }
  }, [enableFlexibleDates, value]);
  
  // Debug wrapper for setShowCalendar
  const setShowCalendarDebug = (value) => {
    console.log(`🔍 setShowCalendar(${value}) called from:`, new Error().stack.split('\n')[2]);
    setShowCalendar(value);
  };
  const [autoOpened, setAutoOpened] = useState(false);
  const [manuallyClosing, setManuallyClosing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCalendar]);

  // Auto-focus button when highlight becomes true (to "take me" to next step)
  useEffect(() => {
    if (highlight && buttonRef && buttonRef.current) {
      try { buttonRef.current.focus(); } catch (e) {}
    }
  }, [highlight]);

  // Single-trigger auto-open system (no multiple attempts causing flickering)
  useEffect(() => {
    if (autoOpenToken > 0 && !manuallyClosing) {
      const safariSafeOpen = () => {
        try {
          if (buttonRef && buttonRef.current) {
            buttonRef.current.focus();
            setTimeout(() => {
              try {
                if (!showCalendar && !manuallyClosing && buttonRef.current) {
                  buttonRef.current.click();
                }
              } catch (e) {}
              // Single fallback only
              setTimeout(() => {
                try {
                  if (!showCalendar && !manuallyClosing) {
                    setShowCalendar(true);
                  }
                } catch (e) {}
              }, 200);
            }, 100);
          }
        } catch (e) {}
      };
      
      safariSafeOpen();
    }
  }, [autoOpenToken, manuallyClosing]); // Removed showCalendar from dependencies!

  // Helpers for quick-pick chips (Phase 1 - essentials + optional range chips)
  const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const fmt = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split('T')[0];
  const today = normalize(new Date());
  const minDT = minDate ? normalize(new Date(minDate)) : today;

  const nextSaturday = (base) => {
    const d = new Date(base);
    const day = d.getDay(); // 0 Sun .. 6 Sat
    const diff = (6 - day + 7) % 7; // days to Saturday (0..6)
    d.setDate(d.getDate() + diff);
    return normalize(d);
  };
  const nextWeekend = (base) => {
    const sat = nextSaturday(base);
    const next = new Date(sat); next.setDate(sat.getDate() + 7);
    return normalize(next);
  };
  const addDays = (base, n) => { const d = new Date(base); d.setDate(d.getDate() + n); return normalize(d); };
  const sameOrAfter = (a, b) => normalize(a) >= normalize(b);

  const buildQuickPicks = () => {
    const picks = [];
    // Essentials
    const tdy = today;
    const tmr = addDays(today, 1);
    const thisSat = nextSaturday(today);
    const nxtSat = nextWeekend(today);

    picks.push({ key: 'today', label: 'Today', date: tdy, disabled: !sameOrAfter(tdy, minDT) });
    picks.push({ key: 'tomorrow', label: 'Tomorrow', date: tmr, disabled: !sameOrAfter(tmr, minDT) });

    // This Weekend: if today is Sat/Sun and >= minDT, use today (Sat) or tomorrow (Sun); else upcoming Sat
    const day = today.getDay();
    let thisWeekendDate = thisSat;
    if (day === 6) thisWeekendDate = today; // Sat
    if (day === 0) thisWeekendDate = today; // Sun (we’ll still allow picking today if >= minDT)
    picks.push({ key: 'this_weekend', label: 'This Weekend', date: thisWeekendDate, disabled: !sameOrAfter(thisWeekendDate, minDT) });

    picks.push({ key: 'next_weekend', label: 'Next Weekend', date: nxtSat, disabled: !sameOrAfter(nxtSat, minDT) });
    const plus3 = addDays(today, 3);
    const plus7 = addDays(today, 7);
    picks.push({ key: '+3d', label: '+3 days', date: plus3, disabled: !sameOrAfter(plus3, minDT) });
    picks.push({ key: '+7d', label: '+7 days', date: plus7, disabled: !sameOrAfter(plus7, minDT) });

    // Next Month chip: jump to same day next month if valid else first valid day of next month
    const nm = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const nextMonthFirst = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nmValid = sameOrAfter(nm, minDT) ? nm : (sameOrAfter(nextMonthFirst, minDT) ? nextMonthFirst : null);
    if (nmValid) picks.push({ key: 'next_month', label: 'Next Month', date: nmValid, disabled: !sameOrAfter(nmValid, minDT) });

    // Optional: Range chips for round-trip via onRangeSelect
    if (enableRangeChips && typeof onRangeSelect === 'function') {
      // Weekend Getaway: Fri → Sun from nearest upcoming Fri that is >= minDT
      const nextFri = (() => { const d = new Date(today); const diff = (5 - d.getDay() + 7) % 7; d.setDate(d.getDate() + diff); return normalize(d); })();
      const fri = sameOrAfter(nextFri, minDT) ? nextFri : addDays(minDT, (5 - minDT.getDay() + 7) % 7);
      const sun = addDays(fri, 2);
      if (sameOrAfter(sun, minDT)) picks.push({ key: 'weekend_getaway', label: 'Weekend Getaway (Fri–Sun)', range: [fri, sun], type: 'range' });

      // 3N/4D: Thu → Sun
      const nextThu = (() => { const d = new Date(today); const diff = (4 - d.getDay() + 7) % 7; d.setDate(d.getDate() + diff); return normalize(d); })();
      const thu = sameOrAfter(nextThu, minDT) ? nextThu : addDays(minDT, (4 - minDT.getDay() + 7) % 7);
      const sun2 = addDays(thu, 3);
      if (sameOrAfter(sun2, minDT)) picks.push({ key: '3n4d', label: '3N/4D (Thu–Sun)', range: [thu, sun2], type: 'range' });
    }

    // Context-aware ordering
    const weekday = today.getDay();
    picks.sort((a, b) => {
      const score = (p) => {
        let s = 0;
        if (p.key === 'today') s += 5;
        if (p.key === 'tomorrow') s += 4;
        if (p.key === 'this_weekend') s += (weekday <= 3 ? 6 : 3);
        if (p.key === 'next_weekend') s += (weekday >= 4 ? 6 : 2);
        if (p.key === 'next_month') s += 1;
        if (p.type === 'range') s += 7;
        return -s;
      };
      return score(a) - score(b);
    });

    return picks;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Select Date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    onChange(dateStr);
    setShowCalendar(false);
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month  
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first day of the week that contains the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    const minDateTime = minDate ? new Date(minDate) : new Date();
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < minDateTime;
      const isSelected = value && date.toISOString().split('T')[0] === value;
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if this date is in flexible range
      const isInFlexibleRange = flexibleRange && flexibleRange.some(
        rangeDate => rangeDate.toDateString() === date.toDateString()
      );
      
      // Get price for this date
      const price = priceData[dateStr];
      
      days.push({
        date: date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isSelected,
        isInFlexibleRange,
        price: price || null
      });
    }
    
    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="relative date-picker-compact" ref={calendarRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {/* Date Input Display */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className={`w-full px-3 py-3 text-sm border rounded-xl transition-all duration-200 flex items-center justify-between text-left date-picker-button ${
          showCalendar ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        } ${className}`}
        aria-label={`Select ${label || 'date'}`}
        data-testid="date-picker-button"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {formatDisplayDate(value)}
        </span>
        <div className="text-xl">📅</div>
      </button>

      {/* Proper Calendar Popup */}
      {showCalendar && (
        <div ref={calendarRef} className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-blue-200 rounded-xl shadow-xl p-2 max-w-sm sm:max-w-md md:max-w-lg calendar-container">
          {/* Flexible Date Range Info (Priority 2 Feature) */}
          {enableFlexibleDates && flexibleRange && (
            <div className="mb-2 p-2 bg-white rounded-lg border border-green-200">
              <div className="flex items-center text-xs text-green-700">
                <span className="mr-1">🎯</span>
                <span className="font-medium">Flexible Dates: ±3 days</span>
              </div>
              <p className="text-[10px] text-green-600 mt-0.5">
                Highlighted dates show price variations. Green = Better deals!
              </p>
            </div>
          )}

          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-1 date-picker-header">
            <button
              type="button"
              onClick={previousMonth}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
            >
              ←
            </button>
            <h3 className="text-base font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
            >
              →
            </button>
          </div>

          {/* Quick Pick Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 mb-1 -mt-1">
            {buildQuickPicks().map((p) => (
              <button
                key={p.key}
                type="button"
                disabled={p.disabled}
                onClick={() => {
                  if (p.type === 'range' && typeof onRangeSelect === 'function') {
                    const [d1, d2] = p.range;
                    onRangeSelect(fmt(d1), fmt(d2));
                    setShowCalendar(false);
                  } else if (p.date) {
                    onChange(fmt(p.date));
                    setShowCalendar(false);
                  }
                }}
                className={`whitespace-nowrap px-2 py-1 rounded-full text-xs border transition-colors ${
                  p.disabled ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-0.5">
            {dayNames.map(day => (
              <div key={day} className="text-center text-[9px] font-medium text-gray-500 p-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days with Price Display (Priority 2 Enhancement) */}
          <div className="grid grid-cols-7 gap-0.5">
            {generateCalendarDays().map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => !day.isPast && handleDateClick(day.date)}
                disabled={day.isPast}
                className={`p-1 text-center rounded-lg transition-all duration-200 text-[10px] relative group ${
                  day.isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                    : day.isInFlexibleRange
                      ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                      : day.isToday
                        ? 'bg-blue-100 text-blue-600 font-medium hover:bg-blue-200'
                        : day.isCurrentMonth
                          ? day.isPast
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                          : 'text-gray-300'
                }`}
              >
                <div>{day.day}</div>
                {/* Price display for flexible dates */}
                {enableFlexibleDates && day.price && day.isCurrentMonth && !day.isPast && (
                  <div className={`text-[8px] leading-none ${
                    day.isSelected ? 'text-white' : 
                    day.isInFlexibleRange ? 'text-green-600 font-medium' : 
                    'text-gray-500'
                  }`}>
                    ₹{Math.floor(day.price/100)}k
                  </div>
                )}
                
                {/* Price comparison tooltip */}
                {enableFlexibleDates && day.price && !day.isPast && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    ₹{day.price.toLocaleString()}
                    {day.isInFlexibleRange && <div className="text-green-400">±3 day range</div>}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
// Smart Enhanced City Autocomplete Component (Priority 2 Feature)
const CityAutocomplete = React.forwardRef(({ label, placeholder, value, onChange, icon, autoFocus, airports, excludeCity, highlight = false }, ref) => {
  // Recent searches management (Priority 2 Feature)
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vimanpravas_recent_searches') || '[]');
    } catch {
      return [];
    }
  });

  const addToRecentSearches = (city) => {
    const updated = [city, ...recentSearches.filter(item => item !== city)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('vimanpravas_recent_searches', JSON.stringify(updated));
  };

  // Intelligent suggestions based on popular routes (Priority 2 Feature)
  const getIntelligentSuggestions = (currentCity) => {
    const intelligentRoutes = {
      'Mumbai': ['Delhi', 'Bangalore', 'Dubai', 'London', 'New York JFK'],
      'Delhi': ['Mumbai', 'Bangalore', 'Goa', 'Dubai', 'London'],
      'Bangalore': ['Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Singapore'],
      'Chennai': ['Bangalore', 'Delhi', 'Mumbai', 'Dubai', 'Singapore'],
      'Hyderabad': ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Dubai'],
      'Kolkata': ['Delhi', 'Mumbai', 'Bangkok', 'Singapore', 'Dubai'],
      'Goa': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'],
      'Dubai': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'London'],
      'London': ['Mumbai', 'Delhi', 'Dubai', 'New York JFK', 'Paris'],
      'Singapore': ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Bangkok']
    };

    const suggestions = intelligentRoutes[currentCity] || [];
    return airports.filter(airport => 
      suggestions.some(suggestion => 
        airport.name.includes(suggestion) || airport.fullName.includes(suggestion)
      )
    );
  };

  // Mobile-responsive display names
  const getDisplayName = (airport, isMobile = false) => {
    if (airport.__type === 'all_airports') {
      return isMobile ? airport.cityName || airport.name.split(' - ')[0] : airport.name;
    }
    
    // Mobile: Show only city name for compact display
    if (isMobile) {
      return airport.name; // Just "Mumbai", "Delhi", etc.
    }
    
    // Desktop: Show detailed information
    if (airport.country === 'India') {
      return `${airport.name}, ${airport.country}`;
    } else {
      return `${airport.name}, ${airport.country}`;
    }
  };
  
  // Detect if mobile viewport
  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  // Build "All Airports" suggestion variants for multi-airport cities
  const buildAllAirportsVariants = (cityRecord) => {
    const code = cityRecord.cityCode;
    const name = cityRecord.cityName;
    const country = cityRecord.country;
    const airportsList = cityRecord.airports.join(', ');
    const baseFull = `${name} (${code}) • Includes: ${airportsList}`;
    return [
      {
        code, // important: send city code when selected
        name: `${code} - All Airports`,
        fullName: baseFull,
        country,
        popular: true,
        __type: 'all_airports',
      },
      {
        code,
        name: `${name} - All Airports`,
        fullName: baseFull,
        country,
        popular: true,
        __type: 'all_airports',
      },
      {
        code,
        name: `${code} (All Airports)`,
        fullName: baseFull,
        country,
        popular: true,
        __type: 'all_airports',
      },
    ];
  };

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  // Only update local inputValue if parent value changes and is different
  useEffect(() => {
    // Simple condition to prevent race conditions
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && ref?.current) {
      setTimeout(() => ref.current.focus(), 100);
    }
  }, [autoFocus]);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setInputValue(input);
    
    // Enhanced search with intelligent suggestions (Priority 2 Feature)
    if (input.length > 0) {
      // Build a combined pool including airports plus multi-airport city variants
      const pool = [
        ...airports,
        ...Object.keys(MULTI_AIRPORT_CITIES).flatMap(code => buildAllAirportsVariants(MULTI_AIRPORT_CITIES[code]))
      ];

      const filtered = pool
        .filter(airport => 
          (airport.name.toLowerCase().includes(input.toLowerCase()) ||
           airport.fullName.toLowerCase().includes(input.toLowerCase()) ||
           (airport.code && airport.code.toLowerCase().includes(input.toLowerCase())) ||
           (airport.country && airport.country.toLowerCase().includes(input.toLowerCase()))) &&
           airport.name !== excludeCity
        )
        // de-duplicate by name+code to avoid triple entries colliding with actual airport items
        .filter((item, idx, arr) => arr.findIndex(x => `${x.name}|${x.code}` === `${item.name}|${item.code}`) === idx)
        .sort((a, b) => {
          // Ensure All Airports appear above individual airports when relevant
          const aAll = a.__type === 'all_airports';
          const bAll = b.__type === 'all_airports';
          if (aAll && !bAll) return -1;
          if (!aAll && bAll) return 1;

          // Prioritize recent searches
          const aRecent = recentSearches.includes(a.name);
          const bRecent = recentSearches.includes(b.name);
          if (aRecent && !bRecent) return -1;
          if (!aRecent && bRecent) return 1;

          // Prioritize popular items
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          
          // Then by exact name match
          if (a.name.toLowerCase() === input.toLowerCase()) return -1;
          if (b.name.toLowerCase() === input.toLowerCase()) return 1;
          // Then by name starts with
          if (a.name.toLowerCase().startsWith(input.toLowerCase())) return -1;
          if (b.name.toLowerCase().startsWith(input.toLowerCase())) return 1;
          return 0;
        })
        .slice(0, 8);

      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      // Enhanced empty input suggestions (Priority 2 Feature)
      const pinned = [
        'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata'
      ];
      const pool = [
        ...airports,
        ...Object.keys(MULTI_AIRPORT_CITIES).flatMap(code => buildAllAirportsVariants(MULTI_AIRPORT_CITIES[code]))
      ];
      
      // Combine recent searches with popular destinations
      const recentAirports = pool.filter(airport => recentSearches.includes(airport.name));
      const popularAirports = pool
        .filter(item => item.popular && item.name !== excludeCity && !recentSearches.includes(item.name))
        .sort((a, b) => {
          const aPinned = pinned.includes(a.name);
          const bPinned = pinned.includes(b.name);
          if (aPinned && !bPinned) return -1;
          if (!aPinned && bPinned) return 1;
          const aAll = a.__type === 'all_airports';
          const bAll = b.__type === 'all_airports';
          if (aAll && !bAll) return -1;
          if (!aAll && bAll) return 1;
          return 0;
        });
      
      const combined = [...recentAirports, ...popularAirports].slice(0, 8);
      setSuggestions(combined);
      setShowSuggestions(true); // Always show suggestions on empty input
    }
  };

  const selectCity = (airport) => {
    const cityName = airport.name;
    setInputValue(cityName);
    setShowSuggestions(false);
    
    // Add to recent searches (Priority 2 Feature)
    addToRecentSearches(cityName);

    // Multi-airport city handling
    if (airport.__type === 'all_airports' && airport.code) {
      onChange(airport.code);
    } else {
      // For regular airports, pass the human-friendly name as before
      onChange(cityName);
    }
    
    // Immediately trigger next step in guidance flow
    setTimeout(() => {
      const nextInput = document.querySelector(`input[placeholder*="${label === 'From' ? 'destination' : 'departure'}"]`);
      if (nextInput && label === 'From') {
        nextInput.focus();
      }
    }, 100);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleFocus = (e) => {
    // Select all text when user focuses on the field for easy replacement
    if (e && e.target) {
      e.target.select();
    }
    
    // Always show suggestions on focus/click
    if (inputValue.length === 0) {
      // Show popular airports when empty
      const popular = airports.filter(airport => airport.popular && airport.name !== excludeCity).slice(0, 6);
      setSuggestions(popular);
      setShowSuggestions(true);
    } else {
      // Show filtered suggestions based on current input
      const pool = [
        ...airports,
        ...Object.keys(MULTI_AIRPORT_CITIES).flatMap(code => buildAllAirportsVariants(MULTI_AIRPORT_CITIES[code]))
      ];

      const filtered = pool
        .filter(airport => 
          (airport.name.toLowerCase().includes(inputValue.toLowerCase()) ||
           airport.fullName.toLowerCase().includes(inputValue.toLowerCase()) ||
           (airport.code && airport.code.toLowerCase().includes(inputValue.toLowerCase())) ||
           (airport.country && airport.country.toLowerCase().includes(inputValue.toLowerCase()))) &&
           airport.name !== excludeCity
        )
        .filter((item, idx, arr) => arr.findIndex(x => `${x.name}|${x.code}` === `${item.name}|${item.code}`) === idx)
        .sort((a, b) => {
          const aAll = a.__type === 'all_airports';
          const bAll = b.__type === 'all_airports';
          if (aAll && !bAll) return -1;
          if (!aAll && bAll) return 1;

          // Prioritize popular airports
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          // Then by exact name match
          if (a.name.toLowerCase() === inputValue.toLowerCase()) return -1;
          if (b.name.toLowerCase() === inputValue.toLowerCase()) return 1;
          // Then by name starts with
          if (a.name.toLowerCase().startsWith(inputValue.toLowerCase())) return -1;
          if (b.name.toLowerCase().startsWith(inputValue.toLowerCase())) return 1;
          return 0;
        })
        .slice(0, 8);
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    }
  };

  const handleInputClick = (e) => {
    // Same as focus - always show dropdown on click and select text
    handleFocus(e);
  };

  return (
    <div className="relative">
      <label className={`block text-sm font-medium mb-2 ${highlight ? 'text-blue-700' : 'text-gray-700'}`}>{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
          {icon}
        </div>
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onClick={handleInputClick}
          onBlur={handleBlur}
          autoComplete="off"
          className={`w-full pl-14 pr-4 py-3 text-sm border rounded-2xl transition-all duration-200 bg-white shadow-sm hover:shadow-md ${highlight ? 'border-blue-400 ring-2 ring-blue-200 animate-bounce-glow' : 'border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto">
            {inputValue.length === 0 && (
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                <div className="text-sm font-medium text-blue-800">
                  {recentSearches.length > 0 ? 'Recent & Popular Destinations' : 'Popular Destinations'}
                </div>
              </div>
            )}
            {suggestions.map((airport) => {
              const isRecentSearch = recentSearches.includes(airport.name);
              return (
                <div
                  key={`${airport.code}-${airport.name}`}
                  onClick={() => selectCity(airport)}
                  className={`px-4 py-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-150 ${isRecentSearch ? 'recent-search-item bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {isRecentSearch && <span className="mr-2 text-blue-500">🕒</span>}
                        <div className="font-semibold text-gray-900">{getDisplayName(airport, isMobile())}</div>
                        {airport.popular && (
                          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">Popular</span>
                        )}
                        {isRecentSearch && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Recent</span>
                        )}
                      </div>
                      {!isMobile() && (
                        <div className="text-sm text-gray-600 mt-1">{airport.fullName}</div>
                      )}
                      {!isMobile() && (
                        <div className="text-xs text-gray-500">{airport.country}</div>
                      )}
                    </div>
                    <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg text-gray-600">
                      {airport.code}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

function App() {
  // TEMPORARY FIX: Force show full booking interface for preview
  // Show coming soon page unless development mode is active
  // if (SHOW_COMING_SOON && !isDevelopmentMode) {
  //   return <ComingSoon />;
  // }

  // Original flight search functionality
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchData, setSearchData] = useState(null);
  
  // Booking flow state management
  const [bookingStep, setBookingStep] = useState('search'); // search, flight-selection, passenger-info, payment, confirmation
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  const handleSearch = async (formData) => {
    setIsSearching(true);
    setSearchData(formData);
    
    // Clear previous results first
    setSearchResults([]);
    
    try {
      // Convert to backend format
      const searchPayload = {
        tripType: formData.tripType,
        origin: formData.segments[0].origin,
        destination: formData.segments[0].destination,
        departure_date: formData.segments[0].departureDate,
        return_date: formData.returnDate,
        passengers: formData.passengers.adults + formData.passengers.children + formData.passengers.infants,
        class: formData.class,
        segments: formData.segments
      };
      
      const response = await axios.post(`${API}/flights/search`, searchPayload);
      const flights = response.data.flights || [];
      
      // Update state synchronously
      setSearchResults(flights);
      setShowResults(true);
      
    } catch (error) {
      console.error('Flight search error:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFlightSelect = (flight) => {
    console.log('🔍 handleFlightSelect called with:', flight);
    console.log('🔍 Current bookingStep:', bookingStep);
    setSelectedFlight(flight);
    setBookingStep('flight-selection');
    console.log('🔍 Set bookingStep to: flight-selection');
  };

  const handleBackToResults = () => {
    setBookingStep('search');
    setSelectedFlight(null);
  };

  const handleBackToSearch = () => {
    setShowResults(false);
    setSearchResults([]);
    setBookingStep('search');
    setSelectedFlight(null);
    setBookingData(null);
  };

  const handleModifySearch = (newSearchData) => {
    setSearchData(newSearchData);
    handleSearch(newSearchData);
  };

  const handleDateChange = (newDate) => {
    const updatedSearchData = {
      ...searchData,
      segments: searchData.segments.map((segment, index) => 
        index === 0 ? { ...segment, departureDate: newDate } : segment
      )
    };
    setSearchData(updatedSearchData);
    handleSearch(updatedSearchData);
  };

  const handleFlightSelectionNext = (selectionData) => {
    console.log('Flight selection completed:', selectionData);
    setBookingData(selectionData);
    setBookingStep('passenger-info');
  };

  const handlePassengerInfoNext = (passengerData) => {
    console.log('Passenger info completed:', passengerData);
    setBookingData(passengerData);
    setBookingStep('payment');
  };

  const handlePaymentNext = (paymentData) => {
    console.log('Payment completed:', paymentData);
    setBookingData(paymentData);
    setBookingStep('confirmation');
  };

  const handleStartOver = () => {
    setShowResults(false);
    setSearchResults([]);
    setBookingStep('search');
    setSelectedFlight(null);
    setBookingData(null);
    setSearchData(null);
  };

  // Show booking flow if user has searched
  if (showResults) {
    // Booking Confirmation Step
    if (bookingStep === 'confirmation' && bookingData) {
      return (
        <BookingConfirmation
          bookingData={bookingData}
          onStartOver={handleStartOver}
        />
      );
    }

    // Payment Step
    if (bookingStep === 'payment' && bookingData) {
      return (
        <Payment
          bookingData={bookingData}
          onNext={handlePaymentNext}
          onBack={() => setBookingStep('passenger-info')}
        />
      );
    }

    // Passenger Information Step
    if (bookingStep === 'passenger-info' && bookingData) {
      return (
        <PassengerInfo
          bookingData={bookingData}
          onNext={handlePassengerInfoNext}
          onBack={() => setBookingStep('flight-selection')}
        />
      );
    }

    // Flight Selection Step
    if (bookingStep === 'flight-selection' && selectedFlight) {
      console.log('🎯 Rendering FlightSelection component with:', selectedFlight);
      return (
        <FlightSelection
          selectedFlight={selectedFlight}
          searchParams={searchData}
          onNext={handleFlightSelectionNext}
          onBack={handleBackToResults}
        />
      );
    }

    // Homepage: Show search form when no results are being displayed
    if (!showResults) {
      return (
        <div className="min-h-screen" style={{backgroundColor: 'white'}}>
          {/* CLEAN SIMPLE HEADER */}
          <header className="bg-white border-b border-gray-100">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="https://customer-assets.emergentagent.com/job_travelgenius/artifacts/ojpqneqb_FINAL%20LOGO.png"
                    alt="TourSmile"
                    className="h-10"
                  />
                </div>
                <div className="flex items-center space-x-6">
                  <span className="text-blue-600 font-semibold">Flights</span>
                  <span className="text-gray-500 hover:text-gray-700 cursor-pointer hidden md:inline">Hotels</span>
                  <span className="text-gray-500 hover:text-gray-700 cursor-pointer hidden md:inline">Activities</span>
                </div>
              </div>
            </div>
          </header>

          {/* NEW CLEAN MAIN CONTENT */}
          <main>
            <div className="text-center mb-6 px-4">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Find Your Flight
              </h1>
              <p className="text-gray-600 hidden md:block">
                Simple, fast flight search
              </p>
            </div>

            {/* NEW LIGHT SEARCH FORM */}
            <GuidedSearchForm onSearch={handleSearch} isSearching={isSearching} />

            {/* Trust Indicators - Hidden on Mobile */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 hidden md:grid">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Booking</h3>
                <p className="text-gray-600">Get confirmed tickets in seconds with our advanced booking system.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
                <p className="text-gray-600">Your transactions are protected with bank-level security.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Deals</h3>
                <p className="text-gray-600">AI-powered price comparison finds you the lowest fares.</p>
              </div>
            </div>
          </main>
        </div>
      );
    }

    // Default: Flight Results
    return (
      <div className="min-h-screen bg-white">
        {/* Header with back button */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40 mobile-search-sticky">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={handleBackToSearch}
                  className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center">
                  <img
                    src="https://customer-assets.emergentagent.com/job_travelgenius/artifacts/ojpqneqb_FINAL%20LOGO.png"
                    alt="TourSmile"
                    className="h-12 mr-2"
                  />
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <span className="text-blue-600 font-semibold">Flights</span>
                <span className="text-gray-400 hover:text-gray-600 cursor-pointer">Hotels</span>
                <span className="text-gray-400 hover:text-gray-600 cursor-pointer">Activities</span>
              </div>
            </div>
          </div>
        </header>

        {/* Flight Results */}
        <FlightResults 
          searchData={searchData}
          flights={searchResults}
          onFlightSelect={handleFlightSelect}
          isLoading={isSearching}
          onModifySearch={handleModifySearch}
          onDateChange={handleDateChange}
          airports={AIRPORTS_DATABASE}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center">
                <img
                  src="https://customer-assets.emergentagent.com/job_travelgenius/artifacts/ojpqneqb_FINAL%20LOGO.png"
                  alt="TourSmile"
                  className="h-8 sm:h-10 md:h-12 max-w-[120px] sm:max-w-none"
                />
              </div>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Flight Button - Active */}
              <div className="relative group">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">✈️</span>
                    <span>Flights</span>
                  </div>
                </div>
              </div>

              {/* Hotels Button */}
              <div className="relative group">
                <div className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold text-base hover:border-orange-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🏨</span>
                    <span>Hotels</span>
                  </div>
                </div>
              </div>

              {/* Activities Button */}
              <div className="relative group">
                <div className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold text-base hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎯</span>
                    <span>Activities</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Navigation - Improved */}
            <div className="md:hidden flex items-center space-x-1">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-lg font-medium text-sm">
                ✈️ Flights
              </div>
              <div className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium text-sm">
                🏨 Hotels
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 max-w-7xl md:mx-auto">
        {/* Hero Section - Compact Multi-Product Layout */}
        <div className="mb-8">
          {/* Key Features - Compact Version */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-8 md:space-x-12">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">Instant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">Easy</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Search Form (Compact) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                {/* Product Tabs */}
                <div className="flex items-center space-x-1 mb-6 bg-gray-100 rounded-xl p-1">
                  <div className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 rounded-xl font-semibold">
                    ✈️ Flights
                  </div>
                  <div className="flex-1 text-gray-600 text-center py-3 rounded-xl font-medium hover:bg-gray-200 cursor-pointer">
                    🏨 Hotels
                  </div>
                  <div className="flex-1 text-gray-600 text-center py-3 rounded-xl font-medium hover:bg-gray-200 cursor-pointer">
                    🎯 Activities
                  </div>
                </div>

                {/* Compact Search Form */}
                <GuidedSearchForm onSearch={handleSearch} isSearching={isSearching} compact={true} />

                {/* Trending Searches Below Compact Form - Mobile Priority */}
                <div className="mt-4 bg-white rounded-2xl shadow-lg p-4 md:p-6">
                  <div className="trending-section">
                    {/* Trending Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg trending-icon">🔥</span>
                        <h3 className="text-base md:text-lg font-semibold text-gray-800">Trending Routes</h3>
                      </div>
                      <span className="text-xs text-gray-500 hidden md:block">Popular destinations</span>
                    </div>

                    {/* Mobile Trending Routes */}
                    <div className="block md:hidden">
                      <div className="space-y-3">
                        {[
                          { from: "New York, NY (NYC)", to: "Dubai, AE (DXB)", price: "₹65,400", icon: "🏙️" },
                          { from: "Mumbai, IN (BOM)", to: "London, GB (LHR)", price: "₹58,200", icon: "🇬🇧" },
                          { from: "Delhi, IN (DEL)", to: "Singapore, SG (SIN)", price: "₹45,600", icon: "🌆" },
                          { from: "Bangalore, IN (BLR)", to: "San Francisco, CA (SFO)", price: "₹78,900", icon: "🌉" }
                        ].slice(0, 4).map((route, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              // Auto-fill search form with trending route
                              const searchEvent = {
                                tripType: 'one-way',
                                segments: [{
                                  origin: route.from,
                                  destination: route.to,
                                  departureDate: ''
                                }],
                                returnDate: '',
                                passengers: { adults: 1, children: 0, infants: 0 },
                                preferences: { nonStop: false, student: false, senior: false, armed: false }
                              };
                              console.log('Trending route clicked:', route);
                            }}
                            className="trending-route w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 
                                     rounded-2xl p-4 border border-blue-100 hover:border-blue-200
                                     transition-all duration-200 hover:shadow-lg hover:scale-105
                                     focus:outline-none focus:ring-4 focus:ring-blue-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl trending-icon">{route.icon}</span>
                                <div className="text-left">
                                  <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                    <span className="truncate max-w-[80px]">{route.from.split(',')[0]}</span>
                                    <span className="text-blue-500">→</span>
                                    <span className="truncate max-w-[80px]">{route.to.split(',')[0]}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {route.from.match(/\([^)]*\)/)?.[0]} → {route.to.match(/\([^)]*\)/)?.[0]}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600 trending-price">{route.price}</div>
                                <div className="text-xs text-gray-500">onwards</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Desktop Trending Routes */}
                    <div className="hidden md:block">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { from: "New York, NY (NYC)", to: "Dubai, AE (DXB)", price: "₹65,400", icon: "🏙️" },
                          { from: "Mumbai, IN (BOM)", to: "London, GB (LHR)", price: "₹58,200", icon: "🇬🇧" },
                          { from: "Delhi, IN (DEL)", to: "Singapore, SG (SIN)", price: "₹45,600", icon: "🌆" },
                          { from: "Bangalore, IN (BLR)", to: "San Francisco, CA (SFO)", price: "₹78,900", icon: "🌉" },
                          { from: "London, GB (LHR)", to: "Tokyo, JP (NRT)", price: "₹89,500", icon: "🗾" },
                          { from: "Paris, FR (CDG)", to: "New York, NY (JFK)", price: "₹72,300", icon: "🗽" }
                        ].map((route, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              console.log('Desktop trending route clicked:', route);
                            }}
                            className="trending-route bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 
                                     rounded-xl p-3 border border-gray-200 hover:border-blue-200
                                     transition-all duration-200 hover:shadow-md hover:-translate-y-1
                                     focus:outline-none focus:ring-4 focus:ring-blue-300 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg trending-icon group-hover:scale-110 transition-transform">{route.icon}</span>
                                <div className="text-left">
                                  <div className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                                    <span className="truncate max-w-[50px]">{route.from.split(',')[0]}</span>
                                    <span className="text-blue-500 group-hover:text-blue-600">→</span>
                                    <span className="truncate max-w-[50px]">{route.to.split(',')[0]}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {route.from.match(/\([^)]*\)/)?.[0]} → {route.to.match(/\([^)]*\)/)?.[0]}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-bold text-blue-600 trending-price group-hover:text-blue-700">{route.price}</div>
                                <div className="text-xs text-gray-500">onwards</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* View All Destinations Link */}
                    <div className="mt-4 text-center">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline
                                       focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 py-1">
                        View All Popular Destinations →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Additional Content */}
            <div className="lg:col-span-1 space-y-6">
              {/* Popular Destinations */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🔥 Popular Destinations</h3>
                <div className="space-y-3">
                  {[
                    { city: "Goa", price: "₹3,200", image: "🏖️" },
                    { city: "Dubai", price: "₹8,500", image: "🏙️" },
                    { city: "Bangkok", price: "₹12,400", image: "🛕" },
                    { city: "Singapore", price: "₹15,600", image: "🌆" }
                  ].map((dest, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{dest.image}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{dest.city}</div>
                          <div className="text-sm text-gray-600">Starting from</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-blue-600">{dest.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Deals */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-3">⚡ Limited Time Offer</h3>
                <div className="text-2xl font-bold mb-2">Save up to 25%</div>
                <div className="text-orange-100 text-sm mb-4">On domestic flights • Valid till Dec 31</div>
                <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors">
                  Grab Deal
                </button>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">✨ Why Choose Us</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">2M+</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Happy Travelers</div>
                      <div className="text-sm text-gray-600">Booked with us</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">50K+</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Routes Covered</div>
                      <div className="text-sm text-gray-600">Worldwide</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold">24/7</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Support</div>
                      <div className="text-sm text-gray-600">Always here to help</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Results Section */}
        {showResults && (
          <div className="mb-12">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {searchResults.length} Flights Found
              </h3>
              <button
                onClick={handleBackToSearch}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Modify Search
              </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <select className="px-3 py-2 border rounded-lg text-sm">
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Departure: Early to Late</option>
                  <option>Duration: Shortest</option>
                </select>
                <select className="px-3 py-2 border rounded-lg text-sm">
                  <option>All Airlines</option>
                  <option>IndiGo</option>
                  <option>Air India</option>
                  <option>SpiceJet</option>
                  <option>Vistara</option>
                </select>
                <select className="px-3 py-2 border rounded-lg text-sm">
                  <option>All Stops</option>
                  <option>Non-stop</option>
                  <option>1+ Stop</option>
                </select>
                <select className="px-3 py-2 border rounded-lg text-sm">
                  <option>All Prices</option>
                  <option>Under ₹5,000</option>
                  <option>₹5,000 - ₹10,000</option>
                  <option>Above ₹10,000</option>
                </select>
              </div>
            </div>

            {/* Flight Results */}
            <div className="space-y-4">
              {isSearching ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Searching Best Flights...</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((flight, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        {/* Flight Info */}
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-lg font-semibold text-gray-900 mr-3">
                              {flight.airline}
                            </span>
                            <span className="text-sm text-gray-500">
                              {flight.flight_number}
                            </span>
                            {flight.is_lcc && (
                              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">
                                LCC
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-900">
                                {flight.departure_time}
                              </div>
                              <div className="text-sm text-gray-500">
                                {flight.origin}
                              </div>
                            </div>
                            <div className="flex-1 px-4">
                              <div className="border-t border-gray-300 relative">
                                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                                  {Math.floor(flight.duration_minutes / 60)}h {flight.duration_minutes % 60}m
                                </span>
                              </div>
                              <div className="text-center text-xs text-gray-500 mt-1">
                                {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop(s)`}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-900">
                                {flight.arrival_time}
                              </div>
                              <div className="text-sm text-gray-500">
                                {flight.destination}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price and Fare Options */}
                        <div className="ml-8 text-right">
                          <div className="mb-3">
                            <div className="text-2xl font-bold text-gray-900">
                              ₹{flight.price > 0 ? flight.price.toLocaleString() : '4,500'}
                            </div>
                            {flight.original_price && flight.original_price > flight.price && (
                              <div className="text-sm text-gray-500 line-through">
                                ₹{flight.original_price.toLocaleString()}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">per person</div>
                          </div>

                          {/* Fare Type Dropdown */}
                          <div className="mb-3">
                            <select className="w-full px-3 py-2 text-sm border rounded-lg bg-white">
                              <option>Regular Fare - ₹{flight.price > 0 ? flight.price.toLocaleString() : '4,500'}</option>
                              <option>Flexi Fare - ₹{flight.price > 0 ? (flight.price + 1000).toLocaleString() : '5,500'}</option>
                              <option>Super Saver - ₹{flight.price > 0 ? (flight.price - 500).toLocaleString() : '4,000'}</option>
                            </select>
                          </div>

                          {/* Refundable Tag */}
                          <div className="mb-3">
                            <span className={`inline-block px-2 py-1 text-xs rounded ${
                              flight.refundable 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {flight.refundable ? 'Refundable' : 'Non-Refundable'}
                            </span>
                          </div>

                          {/* Select Flight Button */}
                          <button
                            onClick={() => handleFlightSelect(flight)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                          >
                            Select Flight
                          </button>
                        </div>
                      </div>

                      {/* Flight Details */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Aircraft: {flight.aircraft_type}</span>
                          <span>Baggage: 15kg</span>
                          <span>Cabin: 7kg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No flights found. Please try different search criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;