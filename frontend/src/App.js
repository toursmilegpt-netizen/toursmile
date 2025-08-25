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
const SHOW_COMING_SOON = window.location.hostname !== 'beta.vimanpravas.com';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [searchData, setSearchData] = useState({
    tripType: 'one-way',
    segments: [
      { origin: '', destination: '', departureDate: '' }
    ],
    passengers: { adults: 1, children: 0, infants: 0 },
    class: 'economy',
    preferences: {
      nonStop: false,
      student: false,
      seniorCitizen: false,
      timePreference: 'any', // morning, afternoon, evening, night, any
      flexibleDates: false,
      nearbyAirports: false,
      budgetRange: [0, 50000],
      corporateBooking: false
    }
  });

  // Auto-focus refs
  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    // Set tomorrow as default departure date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSearchData(prev => ({
      ...prev,
      segments: [{ ...prev.segments[0], departureDate: tomorrow.toISOString().split('T')[0] }]
    }));
  }, []);

  const addCitySegment = () => {
    setSearchData(prev => ({
      ...prev,
      segments: [...prev.segments, { origin: '', destination: '', departureDate: '' }]
    }));
  };

  const removeCitySegment = (index) => {
    if (searchData.segments.length > 1) {
      setSearchData(prev => ({
        ...prev,
        segments: prev.segments.filter((_, i) => i !== index)
      }));
    }
  };

  const updateSegment = (index, field, value) => {
    setSearchData(prev => ({
      ...prev,
      segments: prev.segments.map((segment, i) => 
        i === index ? { ...segment, [field]: value } : segment
      )
    }));
  };

  const handleStepProgression = () => {
    const segment = searchData.segments[0];
    if (currentStep === 1 && segment.origin) {
      setCurrentStep(2);
      setTimeout(() => destinationRef.current?.focus(), 100);
    } else if (currentStep === 2 && segment.destination) {
      setCurrentStep(3);
      setTimeout(() => dateRef.current?.focus(), 100);
    } else if (currentStep === 3 && segment.departureDate) {
      setCurrentStep(4);
    }
  };

  useEffect(() => {
    handleStepProgression();
  }, [searchData.segments[0].origin, searchData.segments[0].destination, searchData.segments[0].departureDate]);

  const isStepComplete = (step) => {
    const segment = searchData.segments[0];
    switch (step) {
      case 1: return segment.origin;
      case 2: return segment.destination;
      case 3: return segment.departureDate;
      case 4: return true;
      default: return false;
    }
  };

  const addSegment = () => {
    if (searchData.segments.length < 6) {
      setSearchData({
        ...searchData,
        segments: [...searchData.segments, { origin: '', destination: '', departureDate: '' }]
      });
    }
  };

  const removeSegment = (index) => {
    if (searchData.segments.length > 1) {
      setSearchData({
        ...searchData,
        segments: searchData.segments.filter((_, i) => i !== index)
      });
    }
  };

  const canSearch = () => {
    if (!searchData || !searchData.segments || searchData.segments.length === 0) {
      return false;
    }
    
    // For multi-city, check all segments
    if (searchData.tripType === 'multi-city') {
      return searchData.segments.every(segment => 
        segment.origin && segment.origin.trim().length > 2 && 
        segment.destination && segment.destination.trim().length > 2 && 
        segment.origin !== segment.destination &&
        segment.departureDate && segment.departureDate.length > 0
      );
    }
    
    // For one-way and return, check first segment
    const segment = searchData.segments[0];
    return segment.origin && segment.origin.trim().length > 2 && 
           segment.destination && segment.destination.trim().length > 2 && 
           segment.origin !== segment.destination &&
           segment.departureDate && segment.departureDate.length > 0;
  };

  return (
    <div className={`${compact ? 'max-w-none' : 'max-w-4xl'} mx-auto`}>
      <div className={`bg-white rounded-3xl shadow-2xl p-6 ${compact ? 'md:p-6' : 'md:p-8'} backdrop-blur-md border border-gray-100`}>
        {/* Trip Type Toggle - With Multicity */}
        <div className={`flex items-center justify-center ${compact ? 'mb-4' : 'mb-6'}`}>
          <div className="bg-gray-100 rounded-2xl p-1 flex">
            <button
              onClick={() => setSearchData({...searchData, tripType: 'one-way'})}
              className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${
                searchData.tripType === 'one-way' 
                  ? 'bg-white text-gray-900 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              One Way
            </button>
            <button
              onClick={() => setSearchData({...searchData, tripType: 'return'})}
              className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${
                searchData.tripType === 'return' 
                  ? 'bg-white text-gray-900 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Round Trip
            </button>
            <button
              onClick={() => setSearchData({
                ...searchData, 
                tripType: 'multi-city',
                segments: searchData.segments.length === 1 ? [
                  ...searchData.segments,
                  { origin: '', destination: '', departureDate: '' }
                ] : searchData.segments
              })}
              className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${
                searchData.tripType === 'multi-city' 
                  ? 'bg-white text-gray-900 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Multi-City
            </button>
          </div>
        </div>

        {/* Route Selection - Different Logic for Each Trip Type */}
        <div className="space-y-4 mb-4">
          {searchData.tripType === 'multi-city' ? (
            // Multi-city: Show all segments with inline dates
            searchData.segments.map((segment, index) => (
              <div key={index} className={`${index > 0 ? 'border-t border-gray-200 pt-4' : ''}`}>
                {/* Segment Header for Multi-city */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Flight {index + 1} {index === 0 ? '(Departure)' : index === searchData.segments.length - 1 ? '(Final)' : '(Connecting)'}
                  </h4>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeSegment(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* From */}
                  <div>
                    <CityAutocomplete
                      label="From"
                      placeholder="Departure city"
                      value={segment.origin}
                      onChange={(city) => updateSegment(index, 'origin', city)}
                      airports={AIRPORTS_DATABASE}
                      excludeCity={segment.destination}
                      autoFocus={index === 0}
                    />
                  </div>

                  {/* To */}
                  <div>
                    <CityAutocomplete
                      label="To"
                      placeholder="Arrival city"
                      value={segment.destination}
                      onChange={(city) => updateSegment(index, 'destination', city)}
                      airports={AIRPORTS_DATABASE}
                      excludeCity={segment.origin}
                    />
                  </div>

                  {/* Date - Inline for Multi-city */}
                  <div>
                    <SimpleDatePicker
                      value={segment.departureDate}
                      onChange={(date) => updateSegment(index, 'departureDate', date)}
                      label={`Date ${index + 1}`}
                      minDate={index === 0 ? new Date().toISOString().split('T')[0] : searchData.segments[index-1]?.departureDate}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            // One-way & Round-trip: Show only first segment for cities (dates handled separately)
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* From */}
                <div>
                  <CityAutocomplete
                    label="From"
                    placeholder="Enter departure city"
                    value={searchData.segments[0]?.origin || ''}
                    onChange={(city) => updateSegment(0, 'origin', city)}
                    airports={AIRPORTS_DATABASE}
                    excludeCity={searchData.segments[0]?.destination}
                    autoFocus={true}
                  />
                </div>

                {/* To */}
                <div>
                  <CityAutocomplete
                    label="To"
                    placeholder="Enter destination city"
                    value={searchData.segments[0]?.destination || ''}
                    onChange={(city) => updateSegment(0, 'destination', city)}
                    airports={AIRPORTS_DATABASE}
                    excludeCity={searchData.segments[0]?.origin}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Add City Button for Multi-city */}
          {searchData.tripType === 'multi-city' && searchData.segments.length < 6 && (
            <div className="pt-3">
              <button
                type="button"
                onClick={addSegment}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">+</span>
                <span>Add Another City (Max 6 flights)</span>
              </button>
            </div>
          )}

        </div>

        {/* Date Selection - Smart Logic Based on Trip Type */}
        {searchData.tripType !== 'multi-city' && (
          <div className={`grid ${
            searchData.tripType === 'return' 
              ? 'grid-cols-1 md:grid-cols-2' 
              : 'grid-cols-1'
          } gap-4 mb-4`}>
            
            {/* Departure Date - Always Present for One-Way and Round-Trip */}
            <div>
              <SimpleDatePicker
                value={searchData.segments[0]?.departureDate || ''}
                onChange={(date) => updateSegment(0, 'departureDate', date)}
                label="Departure Date"
                minDate={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Return Date - Only for Round Trip */}
            {searchData.tripType === 'return' && (
              <div>
                <SimpleDatePicker
                  value={searchData.returnDate || ''}
                  onChange={(date) => setSearchData({...searchData, returnDate: date})}
                  label="Return Date" 
                  minDate={searchData.segments[0]?.departureDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
          </div>
        )}

        {/* Passengers & Class Selection */}
        {searchData.tripType !== 'multi-city' && (
          <div className="mb-4">
            <PassengerSelector 
              passengers={searchData.passengers}
              classType={searchData.class}
              onPassengerChange={(passengers) => setSearchData({...searchData, passengers})}
              onClassChange={(classType) => setSearchData({...searchData, class: classType})}
            />
          </div>
        )}

        {/* Flight Preferences - Basic Options Only */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Flight Preferences</div>
          
          {/* Basic Quick Options Only */}
          <div className="flex items-center flex-wrap gap-3 p-3 bg-gray-50 rounded-xl">
            {/* Non-Stop */}
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={searchData.preferences.nonStop}
                onChange={(e) => setSearchData({...searchData, preferences: {...searchData.preferences, nonStop: e.target.checked}})}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center space-x-1">
                <span className="text-lg">🚀</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Non-Stop</span>
              </div>
            </label>

            {/* Student */}
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox" 
                checked={searchData.preferences.student}
                onChange={(e) => setSearchData({...searchData, preferences: {...searchData.preferences, student: e.target.checked}})}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center space-x-1">
                <span className="text-lg">🎓</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Student</span>
              </div>
            </label>

            {/* Senior Citizen */}
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={searchData.preferences.seniorCitizen}
                onChange={(e) => setSearchData({...searchData, preferences: {...searchData.preferences, seniorCitizen: e.target.checked}})}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center space-x-1">
                <span className="text-lg">👴</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Senior 60+</span>
              </div>
            </label>

            {/* Flexible Dates */}
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={searchData.preferences.flexibleDates}
                onChange={(e) => setSearchData({...searchData, preferences: {...searchData.preferences, flexibleDates: e.target.checked}})}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center space-x-1">
                <span className="text-lg">📅</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">±3 Days</span>
              </div>
            </label>

            {/* Nearby Airports */}
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={searchData.preferences.nearbyAirports}
                onChange={(e) => setSearchData({...searchData, preferences: {...searchData.preferences, nearbyAirports: e.target.checked}})}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center space-x-1">
                <span className="text-lg">✈️</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Nearby Airports</span>
              </div>
            </label>

            {/* Corporate Booking */}
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={searchData.preferences.corporateBooking}
                onChange={(e) => setSearchData({...searchData, preferences: {...searchData.preferences, corporateBooking: e.target.checked}})}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center space-x-1">
                <span className="text-lg">💼</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Corporate</span>
              </div>
            </label>
          </div>
        </div>

        {/* Search Button - Compact */}
        <button
          type="submit"
          disabled={!canSearch() || isSearching}
          onClick={() => onSearch(searchData)}
          className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white ${compact ? 'py-4 px-6' : 'py-5 px-8'} rounded-2xl ${compact ? 'text-lg' : 'text-xl'} font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 ${canSearch() && !isSearching ? 'search-ready-glow' : ''}`}
        >
          {isSearching ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Searching Best Flights...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-3">🚀</span>
              Search Flights
              <span className="ml-3">✈️</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

// Passenger Selector Component with Adults, Children, Infants
const PassengerSelector = ({ passengers, classType, onPassengerChange, onClassChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const updatePassengerCount = (type, increment) => {
    const newPassengers = { ...passengers };
    
    if (increment) {
      newPassengers[type] = (newPassengers[type] || 0) + 1;
    } else {
      if (type === 'adults') {
        newPassengers[type] = Math.max(1, (newPassengers[type] || 1) - 1);
      } else {
        newPassengers[type] = Math.max(0, (newPassengers[type] || 0) - 1);
      }
    }
    
    onPassengerChange(newPassengers);
  };

  const getTotalPassengers = () => {
    return (passengers.adults || 1) + (passengers.children || 0) + (passengers.infants || 0);
  };

  const getPassengerSummary = () => {
    const total = getTotalPassengers();
    const parts = [];
    
    if (passengers.adults || 1) parts.push(`${passengers.adults || 1} Adult${(passengers.adults || 1) > 1 ? 's' : ''}`);
    if (passengers.children) parts.push(`${passengers.children} Child${passengers.children > 1 ? 'ren' : ''}`);
    if (passengers.infants) parts.push(`${passengers.infants} Infant${passengers.infants > 1 ? 's' : ''}`);
    
    return parts.join(', ');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">Passengers & Class</label>
      
      {/* Passenger Display Button */}
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`w-full px-4 py-4 text-lg border-2 rounded-2xl transition-all duration-200 flex items-center justify-between text-left ${
          showDropdown ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div>
          <div className="font-medium text-gray-900">{getPassengerSummary()}</div>
          <div className="text-sm text-gray-600 capitalize">{classType} Class</div>
        </div>
        <div className="text-2xl">👥</div>
      </button>

      {/* Passenger Selection Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border-2 border-blue-200 rounded-2xl shadow-2xl p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Select Passengers</h3>
            <p className="text-sm text-gray-600">Choose number of travelers</p>
          </div>

          {/* Adults */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-900">Adults</div>
              <div className="text-sm text-gray-600">12+ years</div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => updatePassengerCount('adults', false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-sm font-bold"
                disabled={(passengers.adults || 1) <= 1}
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{passengers.adults || 1}</span>
              <button
                type="button"
                onClick={() => updatePassengerCount('adults', true)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-900">Children</div>
              <div className="text-sm text-gray-600">2-12 years</div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => updatePassengerCount('children', false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-sm font-bold"
                disabled={(passengers.children || 0) <= 0}
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{passengers.children || 0}</span>
              <button
                type="button"
                onClick={() => updatePassengerCount('children', true)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Infants */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-900">Infants</div>
              <div className="text-sm text-gray-600">Under 2 years</div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => updatePassengerCount('infants', false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-sm font-bold"
                disabled={(passengers.infants || 0) <= 0}
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{passengers.infants || 0}</span>
              <button
                type="button"
                onClick={() => updatePassengerCount('infants', true)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Class Selection */}
          <div className="pt-4">
            <div className="font-medium text-gray-900 mb-3">Travel Class</div>
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
                  className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                    classType === cls.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-lg mb-1">{cls.icon}</div>
                  <div className="text-sm font-medium">{cls.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => setShowDropdown(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Proper Calendar Date Picker Component
const SimpleDatePicker = ({ value, onChange, minDate, label, className }) => {
  const [showCalendar, setShowCalendar] = useState(false);
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
      
      days.push({
        date: date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isSelected
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
    <div className="relative" ref={calendarRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {/* Date Input Display */}
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className={`w-full px-3 py-3 text-base border rounded-xl transition-all duration-200 flex items-center justify-between text-left ${
          showCalendar ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        } ${className}`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {formatDisplayDate(value)}
        </span>
        <div className="text-xl">📅</div>
      </button>

      {/* Proper Calendar Popup */}
      {showCalendar && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-blue-200 rounded-xl shadow-xl p-3 max-w-md sm:max-w-lg md:max-w-xl">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-2">
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

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => !day.isPast && handleDateClick(day.date)}
                disabled={day.isPast}
                className={`p-2 text-center rounded-lg transition-all duration-200 ${
                  day.isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-lg'
                    : day.isToday
                      ? 'bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200'
                      : day.isCurrentMonth
                        ? day.isPast
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        : 'text-gray-300'
                }`}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const CityAutocomplete = React.forwardRef(({ label, placeholder, value, onChange, icon, autoFocus, airports, excludeCity }, ref) => {
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
    // Remove onChange(input) call - only call onChange when city is selected from dropdown

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
      // Show popular with All Airports variants when empty
      const pool = [
        ...airports,
        ...Object.keys(MULTI_AIRPORT_CITIES).flatMap(code => buildAllAirportsVariants(MULTI_AIRPORT_CITIES[code]))
      ];
      const popular = pool.filter(item => item.popular && item.name !== excludeCity)
        // Ensure All Airports show first in the empty state too
        .sort((a, b) => {
          const aAll = a.__type === 'all_airports';
          const bAll = b.__type === 'all_airports';
          if (aAll && !bAll) return -1;
          if (!aAll && bAll) return 1;
          return 0;
        })
        .slice(0, 6);
      setSuggestions(popular);
      setShowSuggestions(input.length === 0);
    }
  };

  const selectCity = (airport) => {
    const cityName = airport.name;
    setShowSuggestions(false);
    setInputValue(cityName);

    // When selecting an "All Airports" option, pass the city IATA code instead of the label
    if (airport.__type === 'all_airports' && airport.code) {
      onChange(airport.code);
      return;
    }
    
    // For regular airports, pass the human-friendly name as before
    onChange(cityName);
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
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
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
          className="w-full pl-14 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto">
            {inputValue.length === 0 && (
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                <div className="text-sm font-medium text-blue-800">Popular Destinations</div>
              </div>
            )}
            {suggestions.map((airport) => (
              <div
                key={`${airport.code}-${airport.name}`}
                onClick={() => selectCity(airport)}
                className="px-4 py-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="font-semibold text-gray-900">{airport.name}</div>
                      {airport.popular && (
                        <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">Popular</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{airport.fullName}</div>
                    <div className="text-xs text-gray-500">{airport.country}</div>
                  </div>
                  <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg text-gray-600">
                    {airport.code}
                  </div>
                </div>
              </div>
            ))}
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

    // Default: Flight Results
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header with back button */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
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
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center">
                <img
                  src="https://customer-assets.emergentagent.com/job_travelgenius/artifacts/ojpqneqb_FINAL%20LOGO.png"
                  alt="TourSmile"
                  className="h-20 md:h-24"
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

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm">
                ✈️ Flights
              </div>
              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium text-sm">
                🏨 Hotels
              </div>
              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium text-sm">
                🎯 Activities
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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