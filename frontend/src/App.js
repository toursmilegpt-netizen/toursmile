import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Popular Indian and International cities for autocomplete
const POPULAR_CITIES = [
  // Indian Cities - Top destinations
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
  
  // International - Popular destinations
  { code: "DXB", name: "Dubai", fullName: "Dubai, UAE" },
  { code: "SIN", name: "Singapore", fullName: "Singapore" },
  { code: "BKK", name: "Bangkok", fullName: "Bangkok, Thailand" },
  { code: "KUL", name: "Kuala Lumpur", fullName: "Kuala Lumpur, Malaysia" },
  { code: "LHR", name: "London", fullName: "London, UK" },
  { code: "JFK", name: "New York", fullName: "New York, USA" },
  { code: "NRT", name: "Tokyo", fullName: "Tokyo, Japan" },
  { code: "CDG", name: "Paris", fullName: "Paris, France" }
];

// Clean City Autocomplete Component
const CityInput = ({ label, placeholder, value, onChange, icon }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setInputValue(input);
    onChange(input);

    if (input.length > 0) {
      const filtered = POPULAR_CITIES.filter(city =>
        city.name.toLowerCase().includes(input.toLowerCase()) ||
        city.fullName.toLowerCase().includes(input.toLowerCase()) ||
        city.code.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 6);
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCity = (city) => {
    setInputValue(city.name);
    onChange(city.name);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleFocus = () => {
    if (inputValue.length > 0) {
      const filtered = POPULAR_CITIES.filter(city =>
        city.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        city.fullName.toLowerCase().includes(inputValue.toLowerCase()) ||
        city.code.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 6);
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
          {icon}
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-80 overflow-y-auto">
            {suggestions.map((city) => (
              <div
                key={city.code}
                onClick={() => selectCity(city)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
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

// Passenger Counter Component
const PassengerCounter = ({ label, value, onChange, min = 0, max = 9 }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="font-medium text-gray-900">{label.title}</div>
        <div className="text-sm text-gray-500">{label.subtitle}</div>
      </div>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <span className="w-8 text-center font-medium">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

function App() {
  // Search form state
  const [searchForm, setSearchForm] = useState({
    tripType: 'oneway',
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    class: 'economy'
  });

  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Get tomorrow's date as default
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  useEffect(() => {
    setSearchForm(prev => ({
      ...prev,
      departureDate: getTomorrowDate()
    }));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchForm.origin || !searchForm.destination || !searchForm.departureDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSearching(true);
    
    try {
      const searchData = {
        ...searchForm,
        passengers: searchForm.passengers.adults + searchForm.passengers.children + searchForm.passengers.infants
      };
      
      const response = await axios.post(`${API}/flights/search`, searchData);
      setSearchResults(response.data.flights || []);
      
      console.log('Search results:', response.data);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const totalPassengers = searchForm.passengers.adults + searchForm.passengers.children + searchForm.passengers.infants;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">TourSmile</h1>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Simple Travel
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-sm text-gray-600">Flights</span>
              <span className="text-sm text-gray-400">Hotels</span>
              <span className="text-sm text-gray-400">Activities</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Flight
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple, fast, and reliable flight booking. No hidden fees, no complex forms.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Trip Type */}
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <button
                  type="button"
                  onClick={() => setSearchForm({...searchForm, tripType: 'oneway'})}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    searchForm.tripType === 'oneway'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  One Way
                </button>
                <button
                  type="button"
                  onClick={() => setSearchForm({...searchForm, tripType: 'return'})}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    searchForm.tripType === 'return'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Round Trip
                </button>
              </div>
            </div>

            {/* Origin & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CityInput
                label="From"
                placeholder="Departure city"
                value={searchForm.origin}
                onChange={(value) => setSearchForm({...searchForm, origin: value})}
                icon="✈️"
              />
              
              <CityInput
                label="To"
                placeholder="Arrival city"
                value={searchForm.destination}
                onChange={(value) => setSearchForm({...searchForm, destination: value})}
                icon="📍"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
                <input
                  type="date"
                  value={searchForm.departureDate}
                  onChange={(e) => setSearchForm({...searchForm, departureDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
              
              {searchForm.tripType === 'return' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
                  <input
                    type="date"
                    value={searchForm.returnDate}
                    onChange={(e) => setSearchForm({...searchForm, returnDate: e.target.value})}
                    min={searchForm.departureDate}
                    className="w-full px-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              )}
            </div>

            {/* Passengers & Class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Passengers */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                <button
                  type="button"
                  onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                  className="w-full px-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-left flex items-center justify-between bg-white"
                >
                  <span>
                    {totalPassengers} Passenger{totalPassengers > 1 ? 's' : ''}
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showPassengerDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
                    <div className="space-y-4">
                      <PassengerCounter
                        label={{title: "Adults", subtitle: "12+ years"}}
                        value={searchForm.passengers.adults}
                        onChange={(value) => setSearchForm({
                          ...searchForm,
                          passengers: {...searchForm.passengers, adults: value}
                        })}
                        min={1}
                      />
                      <PassengerCounter
                        label={{title: "Children", subtitle: "2-12 years"}}
                        value={searchForm.passengers.children}
                        onChange={(value) => setSearchForm({
                          ...searchForm,
                          passengers: {...searchForm.passengers, children: value}
                        })}
                      />
                      <PassengerCounter
                        label={{title: "Infants", subtitle: "0-2 years"}}
                        value={searchForm.passengers.infants}
                        onChange={(value) => setSearchForm({
                          ...searchForm,
                          passengers: {...searchForm.passengers, infants: value}
                        })}
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowPassengerDropdown(false)}
                      className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  value={searchForm.class}
                  onChange={(e) => setSearchForm({...searchForm, class: e.target.value})}
                  className="w-full px-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                >
                  <option value="economy">Economy</option>
                  <option value="premium_economy">Premium Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full bg-blue-600 text-white py-4 px-8 rounded-2xl text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSearching ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Searching Flights...
                  </div>
                ) : (
                  'Search Flights'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search Results Preview */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Flights</h3>
            <div className="space-y-4">
              {searchResults.map((flight, index) => (
                <div key={index} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg text-gray-900">{flight.airline}</div>
                      <div className="text-gray-600">{flight.departure_time} - {flight.arrival_time}</div>
                      <div className="text-sm text-gray-500">{flight.duration} • {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stops`}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">₹{flight.price?.toLocaleString()}</div>
                      <button className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;