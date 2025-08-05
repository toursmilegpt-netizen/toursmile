import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Popular Indian cities for autocomplete
const POPULAR_CITIES = [
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
  { code: "IXB", name: "Bagdogra", fullName: "Bagdogra, India" }
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
          className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 pr-10"
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
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef(null);

  // Flight search state
  const [flightSearch, setFlightSearch] = useState({
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
    passengers: 1,
    class_type: 'economy'
  });
  const [flightResults, setFlightResults] = useState([]);
  const [flightSearching, setFlightSearching] = useState(false);

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
      const response = await axios.post(`${API}/flights/search`, flightSearch);
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

  const NavButton = ({ tabName, children, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_booking-buddy-5/artifacts/5qov7o4f_FINAL%20LOGO%20-%20Copy.png" 
                alt="TourSmile Logo" 
                className="h-10 w-auto sm:h-12"
              />
              <div className="ml-3 text-xs sm:text-sm text-gray-500 font-medium">AI-Powered Travel Platform</div>
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
              <NavButton tabName="itinerary" isActive={activeTab === 'itinerary'} onClick={() => setActiveTab('itinerary')}>
                🤖 AI Planner
              </NavButton>
            </nav>

            {/* Mobile menu button and chat toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 md:hidden"
              >
                💬
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-600 hover:text-blue-600 p-2"
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
                <NavButton tabName="itinerary" isActive={activeTab === 'itinerary'} onClick={() => {setActiveTab('itinerary'); setIsMobileMenuOpen(false);}}>
                  🤖 AI Planner
                </NavButton>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'home' && (
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20 hover:shadow-2xl transition-all duration-500">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                      Plan Your Perfect Trip with AI
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                      Discover amazing destinations, book flights & hotels, and get personalized travel recommendations powered by artificial intelligence.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="group text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 cursor-pointer transform hover:scale-105">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">✈️</div>
                      <h3 className="font-semibold text-gray-900 mb-2">Smart Flight Search</h3>
                      <p className="text-gray-600 text-sm">Find the best flights with AI-powered recommendations</p>
                    </div>
                    
                    <div className="group text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 cursor-pointer transform hover:scale-105">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🏨</div>
                      <h3 className="font-semibold text-gray-900 mb-2">Perfect Hotels</h3>
                      <p className="text-gray-600 text-sm">Discover ideal accommodations tailored to your preferences</p>
                    </div>
                    
                    <div className="group text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 cursor-pointer transform hover:scale-105 sm:col-span-2 lg:col-span-1">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🗺️</div>
                      <h3 className="font-semibold text-gray-900 mb-2">AI Trip Planner</h3>
                      <p className="text-gray-600 text-sm">Get personalized itineraries created by AI</p>
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
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                <div className="flex items-center mb-6">
                  <div className="text-3xl mr-3">✈️</div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Search Flights</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
                    <label className="block text-sm font-medium text-gray-700">Departure Date</label>
                    <input
                      type="date"
                      value={flightSearch.departure_date}
                      onChange={(e) => setFlightSearch({...flightSearch, departure_date: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Passengers</label>
                    <select
                      value={flightSearch.passengers}
                      onChange={(e) => setFlightSearch({...flightSearch, passengers: parseInt(e.target.value)})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    >
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
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
                      Searching...
                    </div>
                  ) : 'Search Flights'}
                </button>

                {flightResults.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <span className="mr-2">🎯</span>Available Flights
                    </h3>
                    <div className="space-y-4">
                      {flightResults.map(flight => (
                        <div key={flight.id} className="group border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-3">
                                <span className="font-bold text-lg text-gray-900">{flight.airline}</span>
                                <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">{flight.flight_number}</span>
                              </div>
                              <div className="grid grid-cols-2 sm:flex sm:items-center sm:space-x-6 gap-2 text-sm text-gray-600">
                                <span className="font-medium">{flight.departure_time} - {flight.arrival_time}</span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{flight.duration}</span>
                                <span className="text-green-600 font-medium">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
                              </div>
                            </div>
                            <div className="text-center sm:text-right">
                              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">₹{flight.price.toLocaleString()}</div>
                              <button className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                Select Flight
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
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Guests</label>
                    <select
                      value={hotelSearch.guests}
                      onChange={(e) => setHotelSearch({...hotelSearch, guests: parseInt(e.target.value)})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
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
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
                    <input
                      type="date"
                      value={hotelSearch.checkout_date}
                      onChange={(e) => setHotelSearch({...hotelSearch, checkout_date: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Location</label>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <input
                      type="text"
                      placeholder="Enter city name"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="flex-1 p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    />
                    <button
                      onClick={() => getActivities(selectedLocation)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Search
                    </button>
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
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Duration (days)</label>
                    <select
                      value={itineraryForm.days}
                      onChange={(e) => setItineraryForm({...itineraryForm, days: parseInt(e.target.value)})}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
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
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
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
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
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

          {/* AI Chat Sidebar - Desktop */}
          <div className="hidden lg:block">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sticky top-24 border border-white/20">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🤖</span>TourSmile AI Assistant
              </h3>
              
              <div className="h-80 overflow-y-auto mb-4 border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-blue-50">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 mt-16">
                    <div className="text-4xl mb-4">👋</div>
                    <p className="mb-2 font-medium">Hi! I'm your AI travel assistant.</p>
                    <p className="text-sm">Ask me about destinations, travel tips, or help with planning your trip!</p>
                  </div>
                )}
                
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-sm px-4 py-3 rounded-2xl shadow-sm ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="text-left mb-4">
                    <div className="inline-block bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about travel..."
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/50 transition-all duration-300"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={isLoading || !chatInput.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Chat Modal */}
      {isChatOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full h-3/4 rounded-t-2xl p-6 transform transition-transform duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="mr-2">🤖</span>TourSmile AI Assistant
              </h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="h-64 overflow-y-auto mb-4 border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-blue-50">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 mt-16">
                  <div className="text-4xl mb-4">👋</div>
                  <p className="mb-2 font-medium">Hi! I'm your AI travel assistant.</p>
                  <p className="text-sm">Ask me about destinations, travel tips, or help with planning your trip!</p>
                </div>
              )}
              
              {chatMessages.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-xs px-4 py-3 rounded-2xl ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="text-left mb-4">
                  <div className="inline-block bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about travel..."
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={sendChatMessage}
                disabled={isLoading || !chatInput.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;