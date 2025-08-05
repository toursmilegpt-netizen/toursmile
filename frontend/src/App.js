import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_booking-buddy-5/artifacts/5qov7o4f_FINAL%20LOGO%20-%20Copy.png" 
                alt="TourSmile Logo" 
                className="h-12 w-auto"
              />
              <div className="ml-3 text-sm text-gray-500 font-medium">AI-Powered Travel Platform</div>
            </div>
            
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'home' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('flights')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'flights' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Flights
              </button>
              <button
                onClick={() => setActiveTab('hotels')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'hotels' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Hotels
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'activities' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Activities
              </button>
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'itinerary' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                AI Planner
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'home' && (
              <div>
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Plan Your Perfect Trip with AI
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Discover amazing destinations, book flights & hotels, and get personalized travel recommendations powered by artificial intelligence.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <div className="text-3xl mb-3">✈️</div>
                      <h3 className="font-semibold text-gray-900 mb-2">Smart Flight Search</h3>
                      <p className="text-gray-600 text-sm">Find the best flights with AI-powered recommendations</p>
                    </div>
                    
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <div className="text-3xl mb-3">🏨</div>
                      <h3 className="font-semibold text-gray-900 mb-2">Perfect Hotels</h3>
                      <p className="text-gray-600 text-sm">Discover ideal accommodations tailored to your preferences</p>
                    </div>
                    
                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                      <div className="text-3xl mb-3">🗺️</div>
                      <h3 className="font-semibold text-gray-900 mb-2">AI Trip Planner</h3>
                      <p className="text-gray-600 text-sm">Get personalized itineraries created by AI</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Destinations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative rounded-lg overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop" alt="India Gate" className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                        <div className="text-white p-4">
                          <h3 className="text-xl font-semibold">Delhi</h3>
                          <p className="text-sm">India's vibrant capital</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative rounded-lg overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=400&h=300&fit=crop" alt="Mumbai" className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                        <div className="text-white p-4">
                          <h3 className="text-xl font-semibold">Mumbai</h3>
                          <p className="text-sm">The city of dreams</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'flights' && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Flights</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                    <input
                      type="text"
                      placeholder="Origin city"
                      value={flightSearch.origin}
                      onChange={(e) => setFlightSearch({...flightSearch, origin: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                    <input
                      type="text"
                      placeholder="Destination city"
                      value={flightSearch.destination}
                      onChange={(e) => setFlightSearch({...flightSearch, destination: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
                    <input
                      type="date"
                      value={flightSearch.departure_date}
                      onChange={(e) => setFlightSearch({...flightSearch, departure_date: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                    <select
                      value={flightSearch.passengers}
                      onChange={(e) => setFlightSearch({...flightSearch, passengers: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                >
                  {flightSearching ? 'Searching...' : 'Search Flights'}
                </button>

                {flightResults.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Available Flights</h3>
                    <div className="space-y-4">
                      {flightResults.map(flight => (
                        <div key={flight.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-4 mb-2">
                                <span className="font-semibold text-lg">{flight.airline}</span>
                                <span className="text-gray-500">{flight.flight_number}</span>
                              </div>
                              <div className="flex items-center space-x-6 text-sm text-gray-600">
                                <span>{flight.departure_time} - {flight.arrival_time}</span>
                                <span>{flight.duration}</span>
                                <span>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-indigo-600">₹{flight.price.toLocaleString()}</div>
                              <button className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm">
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
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Hotels</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      placeholder="City or hotel name"
                      value={hotelSearch.location}
                      onChange={(e) => setHotelSearch({...hotelSearch, location: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                    <select
                      value={hotelSearch.guests}
                      onChange={(e) => setHotelSearch({...hotelSearch, guests: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                    <input
                      type="date"
                      value={hotelSearch.checkin_date}
                      onChange={(e) => setHotelSearch({...hotelSearch, checkin_date: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                    <input
                      type="date"
                      value={hotelSearch.checkout_date}
                      onChange={(e) => setHotelSearch({...hotelSearch, checkout_date: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <button
                  onClick={searchHotels}
                  disabled={hotelSearching}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                >
                  {hotelSearching ? 'Searching...' : 'Search Hotels'}
                </button>

                {hotelResults.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Available Hotels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {hotelResults.map(hotel => (
                        <div key={hotel.id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 transition-colors">
                          <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover" />
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-lg">{hotel.name}</h4>
                              <div className="flex items-center">
                                <span className="text-yellow-400">★</span>
                                <span className="text-sm text-gray-600 ml-1">{hotel.rating}</span>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{hotel.description}</p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {hotel.amenities.slice(0, 4).map(amenity => (
                                <span key={amenity} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-2xl font-bold text-indigo-600">₹{hotel.price_per_night.toLocaleString()}</span>
                                <span className="text-gray-500 text-sm">/night</span>
                              </div>
                              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm">
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
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Activities & Attractions</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Location</label>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      placeholder="Enter city name"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={() => getActivities(selectedLocation)}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {activities.length > 0 && (
                  <div className="space-y-4">
                    {activities.map(activity => (
                      <div key={activity.id} className="border border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{activity.name}</h3>
                            <p className="text-gray-600 mb-3">{activity.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>📍 {activity.location}</span>
                              <span>⏱️ {activity.duration}</span>
                              <span>⭐ {activity.rating}</span>
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <div className="text-2xl font-bold text-indigo-600 mb-2">₹{activity.price}</div>
                            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
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
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Trip Planner</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                    <input
                      type="text"
                      placeholder="Where do you want to go?"
                      value={itineraryForm.destination}
                      onChange={(e) => setItineraryForm({...itineraryForm, destination: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                    <select
                      value={itineraryForm.days}
                      onChange={(e) => setItineraryForm({...itineraryForm, days: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num} Day{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                    <select
                      value={itineraryForm.budget}
                      onChange={(e) => setItineraryForm({...itineraryForm, budget: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="budget">Budget-Friendly</option>
                      <option value="medium">Medium Range</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                    <input
                      type="text"
                      placeholder="e.g., culture, food, adventure"
                      value={itineraryForm.interests.join(', ')}
                      onChange={(e) => setItineraryForm({...itineraryForm, interests: e.target.value.split(', ').filter(i => i.trim())})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <button
                  onClick={generateItinerary}
                  disabled={generatingItinerary}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                >
                  {generatingItinerary ? 'Creating Your Perfect Trip...' : 'Generate AI Itinerary'}
                </button>

                {generatedItinerary && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Your Personalized Itinerary</h3>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                        {generatedItinerary}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                🤖 TourSmile AI Assistant
              </h3>
              
              <div className="h-80 overflow-y-auto mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 mt-16">
                    <p className="mb-2">👋 Hi! I'm your AI travel assistant.</p>
                    <p className="text-sm">Ask me about destinations, travel tips, or help with planning your trip!</p>
                  </div>
                )}
                
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-xs lg:max-w-sm px-4 py-2 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="text-left mb-4">
                    <div className="inline-block bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
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
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={isLoading || !chatInput.trim()}
                  className="bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}

export default App;