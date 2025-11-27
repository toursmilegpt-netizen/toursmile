import React, { useState, useEffect, useMemo } from 'react';

// DESIGN CONSISTENCY RULE: ALL PAGES MUST MAINTAIN TOURSMILE HEADER BRANDING
// This ensures consistent user experience and brand recognition across the application
// Header includes: TourSmile logo, navigation, WhatsApp support, and Sign In

// Flight Results Page Component - Updated for App.js integration
const FlightResults = ({ searchParams, onFlightSelect }) => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // State for expanded fare options
  const [expandedFlightId, setExpandedFlightId] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    stops: [],
    airlines: [],
    priceRange: [0, 50000],
    departureTime: [],
    arrivalTime: [],
    durationRange: [0, 720], // in minutes
    refundable: null,
    aircraftTypes: [],
    serviceTypes: [] // lcc, full
  });
  
  // Sorting state
  const [sortBy, setSortBy] = useState('price_low');
  
  // Load flights on component mount
  useEffect(() => {
    fetchFlights();
  }, [searchParams]);
  
  const fetchFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TEMP: Add sample data for visual enhancement - matching expected field format
      setTimeout(() => {
        console.log('Setting sample flights for visual enhancement');
        const sampleFlights = [
          {
            id: 1,
            airline_name: "IndiGo",
            airline_code: "6E", 
            flight_number: "6E-2024",
            departure_time: "06:30",
            arrival_time: "08:45",
            departure_airport: "DEL",
            departure_city: "Delhi",
            arrival_airport: "BOM", 
            arrival_city: "Mumbai",
            duration_minutes: 135,
            duration: "2h 15m",
            stops: 0,
            stop_description: "Non-stop",
            price: 4850,
            refundable: true,
            aircraft_type: "A320",
            is_lcc: true,
            fare_types: [
              { name: "Saver", price: 4850, savings: 0, cancellation: "₹3,500 + Fare difference" },
              { name: "Flexi", price: 5650, savings: 0, cancellation: "₹3,000 + Fare difference" }
            ]
          },
          {
            id: 2,
            airline_name: "Air India",
            airline_code: "AI",
            flight_number: "AI-131", 
            departure_time: "09:15",
            arrival_time: "11:30",
            departure_airport: "DEL",
            departure_city: "Delhi",
            arrival_airport: "BOM",
            arrival_city: "Mumbai", 
            duration_minutes: 135,
            duration: "2h 15m",
            stops: 0,
            stop_description: "Non-stop",
            price: 5200,
            refundable: true,
            aircraft_type: "B737",
            is_lcc: false,
            fare_types: [
              { name: "Saver", price: 5200, savings: 0, cancellation: "₹3,500 + Fare difference" },
              { name: "Flexi", price: 6100, savings: 0, cancellation: "₹2,500 + Fare difference" }
            ]
          }
        ];
        console.log('Sample flights data:', sampleFlights);
        setFlights(sampleFlights);
        setLoading(false);
      }, 1000);
      return;
      
      // Use environment variable for backend URL
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      const response = await fetch(`${backendUrl}/api/flights/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: searchParams?.from?.city || 'Delhi',
          destination: searchParams?.to?.city || 'Mumbai', 
          departure_date: searchParams?.departDate || '2025-01-20',
          return_date: searchParams?.returnDate,
          passengers: 1,
          class_type: 'economy',
          trip_type: 'one_way'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure flights is always an array
      const flightResults = data.flights || data || [];
      setFlights(Array.isArray(flightResults) ? flightResults : []);
      
    } catch (err) {
      setError(err.message);
      console.error('Flight search error:', err);
      setFlights([]); // Ensure flights is empty array on error
    } finally {
      setLoading(false);
    }
  };
  
  // Filter and sort flights with safe array operations
  const filteredAndSortedFlights = useMemo(() => {
    // Ensure flights is always an array
    const safeFlights = Array.isArray(flights) ? flights : [];
    
    // TEMP: Skip filtering to show sample flights for visual enhancement
    let filtered = safeFlights;
    
    /* ORIGINAL FILTERING CODE - temporarily disabled
    let filtered = safeFlights.filter(flight => {
      if (!flight) return false;
      
      // Stops filter
      if (filters.stops && filters.stops.length > 0) {
        const stops = flight.stops || 0;
        const hasMatchingStops = filters.stops.some(stopFilter => {
          if (stopFilter === 'non-stop') return stops === 0;
          if (stopFilter === '1-stop') return stops === 1;
          if (stopFilter === '2+-stops') return stops >= 2;
          return false;
        });
        if (!hasMatchingStops) return false;
      }
      
      // Airlines filter
      if (filters.airlines && filters.airlines.length > 0) {
        if (!filters.airlines.includes(flight.airline)) return false;
      }
      
      // Price range filter
      const price = flight.price || 0;
      if (filters.priceRange && filters.priceRange.length >= 2) {
        if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      }
      
      // Departure time filter
      if (filters.departureTime && filters.departureTime.length > 0) {
        const depTime = flight.departure_time || '';
        const hour = parseInt(depTime.split(':')[0]) || 0;
        const hasMatchingDepTime = filters.departureTime.some(timeFilter => {
          if (timeFilter === 'morning') return hour >= 6 && hour < 12;
          if (timeFilter === 'afternoon') return hour >= 12 && hour < 18;
          if (timeFilter === 'evening') return hour >= 18 && hour < 22;
          if (timeFilter === 'night') return hour >= 22 || hour < 6;
          return false;
        });
        if (!hasMatchingDepTime) return false;
      }
      
      // Duration filter
      const duration = flight.duration_minutes || 0;
      if (filters.durationRange && filters.durationRange.length >= 2) {
        if (duration < filters.durationRange[0] || duration > filters.durationRange[1]) return false;
      }
      
      // Refundable filter
      if (filters.refundable !== null) {
        if (filters.refundable !== flight.refundable) return false;
      }
      
      // Aircraft type filter
      if (filters.aircraftTypes && filters.aircraftTypes.length > 0) {
        if (!filters.aircraftTypes.includes(flight.aircraft_type)) return false;
      }
      
      // Service type filter (LCC vs Full Service)
      if (filters.serviceTypes && filters.serviceTypes.length > 0) {
        const isLcc = flight.is_lcc;
        const hasLcc = filters.serviceTypes.includes('lcc');
        const hasFull = filters.serviceTypes.includes('full');
        
        if (hasLcc && hasFull) {
          // Both selected, show all
        } else if (hasLcc && !isLcc) {
          return false;
        } else if (hasFull && isLcc) {
          return false;
        }
      }
      
      return true;
    });
    */ // END ORIGINAL FILTERING CODE
    
    // Sort flights
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'duration':
          return (a.duration_minutes || 0) - (b.duration_minutes || 0);
        case 'departure':
          return (a.departure_time || '').localeCompare(b.departure_time || '');
        case 'arrival':
          return (a.arrival_time || '').localeCompare(b.arrival_time || '');
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [flights, filters, sortBy]);
  
  // Get unique airlines for filter with safe array operations
  const uniqueAirlines = useMemo(() => {
    const safeFlights = Array.isArray(flights) ? flights : [];
    const airlines = [...new Set(safeFlights.map(f => f && f.airline).filter(Boolean))];
    return airlines.sort();
  }, [flights]);
  
  // Get unique aircraft types for filter
  const uniqueAircraftTypes = useMemo(() => {
    const safeFlights = Array.isArray(flights) ? flights : [];
    const aircraftTypes = [...new Set(safeFlights.map(f => f && f.aircraft_type).filter(Boolean))];
    return aircraftTypes.sort();
  }, [flights]);
  
  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Format time
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    return timeStr.substring(0, 5);
  };
  
  // Render filter sidebar
  const renderFilters = () => (
    <div className="bg-white rounded-lg p-4 space-y-4">
      {/* Stops Filter */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Stops</h3>
        <div className="space-y-2">
          {['non-stop', '1-stop', '2+-stops'].map(stop => (
            <label key={stop} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.stops && filters.stops.includes(stop)}
                onChange={(e) => {
                  const currentStops = filters.stops || [];
                  const newStops = e.target.checked 
                    ? [...currentStops, stop]
                    : currentStops.filter(s => s !== stop);
                  setFilters(prev => ({ ...prev, stops: newStops }));
                }}
                className="mr-2"
              />
              <span className="text-sm capitalize">{stop.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Airlines Filter */}
      {uniqueAirlines.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Airlines</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {uniqueAirlines.map(airline => (
              <label key={airline} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.airlines && filters.airlines.includes(airline)}
                  onChange={(e) => {
                    const currentAirlines = filters.airlines || [];
                    const newAirlines = e.target.checked 
                      ? [...currentAirlines, airline]
                      : currentAirlines.filter(a => a !== airline);
                    setFilters(prev => ({ ...prev, airlines: newAirlines }));
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{airline}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      
      {/* Price Range Filter */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Price Range</h3>
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="50000"
            step="500"
            value={filters.priceRange ? filters.priceRange[1] : 50000}
            onChange={(e) => {
              setFilters(prev => ({ 
                ...prev, 
                priceRange: [0, parseInt(e.target.value)] 
              }));
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>₹0</span>
            <span>₹{filters.priceRange ? filters.priceRange[1].toLocaleString() : '50,000'}</span>
          </div>
        </div>
      </div>
      
      {/* Departure Time Filter */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Departure Time</h3>
        <div className="space-y-2">
          {['morning', 'afternoon', 'evening', 'night'].map(time => (
            <label key={time} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.departureTime && filters.departureTime.includes(time)}
                onChange={(e) => {
                  const currentTimes = filters.departureTime || [];
                  const newTimes = e.target.checked 
                    ? [...currentTimes, time]
                    : currentTimes.filter(t => t !== time);
                  setFilters(prev => ({ ...prev, departureTime: newTimes }));
                }}
                className="mr-2"
              />
              <span className="text-sm capitalize">{time}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Aircraft Type Filter */}
      {uniqueAircraftTypes.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Aircraft Type</h3>
          <div className="space-y-2 max-h-24 overflow-y-auto">
            {uniqueAircraftTypes.map(aircraft => (
              <label key={aircraft} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.aircraftTypes && filters.aircraftTypes.includes(aircraft)}
                  onChange={(e) => {
                    const currentTypes = filters.aircraftTypes || [];
                    const newTypes = e.target.checked 
                      ? [...currentTypes, aircraft]
                      : currentTypes.filter(t => t !== aircraft);
                    setFilters(prev => ({ ...prev, aircraftTypes: newTypes }));
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{aircraft}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      
      {/* LCC/Full Service Filter */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Service Type</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.serviceTypes && filters.serviceTypes.includes('lcc')}
              onChange={(e) => {
                const currentTypes = filters.serviceTypes || [];
                const newTypes = e.target.checked 
                  ? [...currentTypes, 'lcc']
                  : currentTypes.filter(t => t !== 'lcc');
                setFilters(prev => ({ ...prev, serviceTypes: newTypes }));
              }}
              className="mr-2"
            />
            <span className="text-sm">Low Cost Carriers</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.serviceTypes && filters.serviceTypes.includes('full')}
              onChange={(e) => {
                const currentTypes = filters.serviceTypes || [];
                const newTypes = e.target.checked 
                  ? [...currentTypes, 'full']
                  : currentTypes.filter(t => t !== 'full');
                setFilters(prev => ({ ...prev, serviceTypes: newTypes }));
              }}
              className="mr-2"
            />
            <span className="text-sm">Full Service</span>
          </label>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Ticket Type</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="refundable"
              checked={filters.refundable === null}
              onChange={() => setFilters(prev => ({ ...prev, refundable: null }))}
              className="mr-2"
            />
            <span className="text-sm">All</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="refundable"
              checked={filters.refundable === true}
              onChange={() => setFilters(prev => ({ ...prev, refundable: true }))}
              className="mr-2"
            />
            <span className="text-sm">Refundable</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="refundable"
              checked={filters.refundable === false}
              onChange={() => setFilters(prev => ({ ...prev, refundable: false }))}
              className="mr-2"
            />
            <span className="text-sm">Non-refundable</span>
          </label>
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
        {/* CONSISTENT TOURSMILE HEADER - SAME AS HOMEPAGE */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo as Home Button (UX Standard) */}
              <div className="flex items-center space-x-8">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="flex items-center hover:opacity-80 transition-opacity"
                  title="Return to Homepage"
                >
                  <img 
                    src="https://customer-assets.emergentagent.com/job_flywise-search/artifacts/kdx1ncq0_FINAL%20LOGO.png"
                    alt="TourSmile - Return to Homepage"
                    className="h-6 w-auto"
                  />
                </button>
                
                {/* Navigation */}
                <nav className="hidden md:flex space-x-6">
                  <button className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">
                    Flights
                  </button>
                  <button className="text-gray-600 hover:text-blue-600 transition-colors">
                    Hotels
                  </button>
                  <button className="text-gray-600 hover:text-blue-600 transition-colors">
                    Tours
                  </button>
                </nav>
              </div>
              
              {/* WhatsApp Support & Sign In */}
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                    <path d="M.109 24l1.645-6.015c-1.01-1.759-1.544-3.748-1.544-5.786 0-6.378 5.185-11.563 11.563-11.563 3.096 0 6.009 1.207 8.2 3.399 2.191 2.192 3.398 5.104 3.398 8.2-.001 6.379-5.185 11.564-11.564 11.564-2.015 0-3.986-.525-5.739-1.518l-5.959 1.719z"/>
                  </svg>
                  <span className="hidden sm:inline text-sm font-medium">WhatsApp</span>
                </button>
                <button className="text-gray-700 hover:text-blue-600 text-sm font-medium">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Loading */}
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for flights...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
        {/* CONSISTENT TOURSMILE HEADER - SAME AS HOMEPAGE */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo as Home Button (UX Standard) */}
              <div className="flex items-center space-x-8">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="flex items-center hover:opacity-80 transition-opacity"
                  title="Return to Homepage"
                >
                  <img 
                    src="https://customer-assets.emergentagent.com/job_flywise-search/artifacts/kdx1ncq0_FINAL%20LOGO.png"
                    alt="TourSmile - Return to Homepage"
                    className="h-6 w-auto"
                  />
                </button>
                
                {/* Navigation */}
                <nav className="hidden md:flex space-x-6">
                  <button className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">
                    Flights
                  </button>
                  <button className="text-gray-600 hover:text-blue-600 transition-colors">
                    Hotels
                  </button>
                  <button className="text-gray-600 hover:text-blue-600 transition-colors">
                    Tours
                  </button>
                </nav>
              </div>
              
              {/* WhatsApp Support & Sign In */}
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                    <path d="M.109 24l1.645-6.015c-1.01-1.759-1.544-3.748-1.544-5.786 0-6.378 5.185-11.563 11.563-11.563 3.096 0 6.009 1.207 8.2 3.399 2.191 2.192 3.398 5.104 3.398 8.2-.001 6.379-5.185 11.564-11.564 11.564-2.015 0-3.986-.525-5.739-1.518l-5.959 1.719z"/>
                  </svg>
                  <span className="hidden sm:inline text-sm font-medium">WhatsApp</span>
                </button>
                <button className="text-gray-700 hover:text-blue-600 text-sm font-medium">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Error */}
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Search Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* CONSISTENT TOURSMILE HEADER - SAME AS HOMEPAGE */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo as Home Button (UX Standard) */}
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => window.location.href = '/'}
                className="flex items-center hover:opacity-80 transition-opacity"
                title="Return to Homepage"
              >
                <img 
                  src="https://customer-assets.emergentagent.com/job_flywise-search/artifacts/kdx1ncq0_FINAL%20LOGO.png"
                  alt="TourSmile - Return to Homepage"
                  className="h-6 w-auto"
                />
              </button>
              
              {/* Navigation */}
              <nav className="hidden md:flex space-x-6">
                <button className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">
                  Flights
                </button>
                <button className="text-gray-600 hover:text-blue-600 transition-colors">
                  Hotels
                </button>
                <button className="text-gray-600 hover:text-blue-600 transition-colors">
                  Tours
                </button>
              </nav>
            </div>
            
            {/* WhatsApp Support & Sign In */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                  <path d="M.109 24l1.645-6.015c-1.01-1.759-1.544-3.748-1.544-5.786 0-6.378 5.185-11.563 11.563-11.563 3.096 0 6.009 1.207 8.2 3.399 2.191 2.192 3.398 5.104 3.398 8.2-.001 6.379-5.185 11.564-11.564 11.564-2.015 0-3.986-.525-5.739-1.518l-5.959 1.719z"/>
                </svg>
                <span className="hidden sm:inline text-sm font-medium">WhatsApp</span>
              </button>
              <button className="text-gray-700 hover:text-blue-600 text-sm font-medium">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Filters</h2>
                {renderFilters()}
              </div>
            </div>
          </div>
          
          {/* Results Column */}
          <div className="lg:col-span-3">
            {/* Mobile Filters Button & Sorting */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"></path>
                  </svg>
                  Filters
                </span>
              </button>
              
              {/* Sorting */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                >
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="duration">Duration: Shortest</option>
                  <option value="departure">Departure: Earliest</option>
                  <option value="arrival">Arrival: Earliest</option>
                </select>
              </div>
            </div>
            
            {/* Flight Results */}
            <div className="space-y-6">
              {filteredAndSortedFlights.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">✈️</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No flights found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
                </div>
              ) : (
                filteredAndSortedFlights.map((flight, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                    {/* Main Flight Info Row */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        {/* Flight Details */}
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-4 shadow-sm">
                              <span className="text-blue-700 text-sm font-bold">
                                {(flight.airline || 'UK').substring(0, 2)}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 text-lg">
                                {flight.airline || 'Unknown Airline'}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center space-x-2">
                                <span>{flight.flight_number || 'N/A'}</span>
                                {flight.aircraft_type && (
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                    {flight.aircraft_type}
                                  </span>
                                )}
                                {flight.is_lcc && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                    LCC
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Route & Time */}
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="font-bold text-xl text-gray-800">
                                {formatTime(flight.departure_time)}
                              </div>
                              <div className="text-sm text-gray-500 font-medium">
                                {flight.origin || searchParams?.from?.iata || 'DEL'}
                              </div>
                            </div>
                            
                            <div className="flex-1 text-center px-4">
                              <div className="text-sm text-gray-500 mb-1 font-medium">
                                {formatDuration(flight.duration_minutes)}
                              </div>
                              <div className="flex items-center justify-center">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 mx-2"></div>
                                {(flight.stops || 0) > 0 && (
                                  <>
                                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                    <div className="flex-1 h-0.5 bg-gradient-to-r from-orange-400 to-orange-300 mx-2"></div>
                                  </>
                                )}
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1 font-medium">
                                {(flight.stops || 0) === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-bold text-xl text-gray-800">
                                {formatTime(flight.arrival_time)}
                              </div>
                              <div className="text-sm text-gray-500 font-medium">
                                {flight.destination || searchParams?.to?.iata || 'BOM'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Price & Select Button */}
                        <div className="text-center ml-6">
                          <div className="text-3xl font-bold text-gray-900 mb-1">
                            ₹{flight.fare_types && flight.fare_types.length > 0 
                              ? flight.fare_types[0].price.toLocaleString()
                              : (flight.price || flight.base_price || 0).toLocaleString()
                            }
                          </div>
                          <div className="text-sm text-gray-500 mb-4">per person</div>
                          
                          <button 
                            onClick={() => setExpandedFlightId(
                              expandedFlightId === flight.id ? null : flight.id
                            )}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            {expandedFlightId === flight.id ? 'Hide Options' : 'Select Flight'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Fare Options */}
                    {expandedFlightId === flight.id && flight.fare_types && flight.fare_types.length > 0 && (
                      <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Fare</h4>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {flight.fare_types.map((fareType, fareIndex) => (
                            <div 
                              key={fareIndex} 
                              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
                              onClick={() => onFlightSelect && onFlightSelect({
                                ...flight,
                                selectedFareType: fareType,
                                price: fareType.price
                              })}
                            >
                              {/* Fare Type Header */}
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h5 className="font-bold text-gray-900 text-lg">{fareType.name}</h5>
                                  <div className="text-2xl font-bold text-blue-600">
                                    ₹{fareType.price.toLocaleString()}
                                  </div>
                                </div>
                                <div className="text-right text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                  <div>Base: ₹{fareType.base_fare.toLocaleString()}</div>
                                  <div>Taxes: ₹{fareType.taxes.toLocaleString()}</div>
                                </div>
                              </div>

                              {/* Cancellation Policy */}
                              <div className="mb-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                                <div className="text-xs font-semibold text-red-800 mb-1">Cancellation Policy</div>
                                <div className="text-xs text-red-700">
                                  {fareType.cancellation_charges.description}
                                </div>
                              </div>

                              {/* Key Features */}
                              <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Changes:</span>
                                  <span className={fareType.changeable ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
                                    {fareType.changeable ? '✓ Allowed' : '✗ Not allowed'}
                                  </span>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Baggage:</span>
                                  <span className="text-gray-800 font-medium">{fareType.baggage}</span>
                                </div>
                                
                                {fareType.seat_selection && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Seat Selection:</span>
                                    <span className="text-green-700 font-medium">✓ Free</span>
                                  </div>
                                )}
                                
                                {fareType.meal && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Meal:</span>
                                    <span className="text-green-700 font-medium">✓ Included</span>
                                  </div>
                                )}
                              </div>

                              {/* Features Tags */}
                              <div className="mb-4 flex flex-wrap gap-2">
                                {fareType.features.slice(0, 3).map((feature, featureIndex) => (
                                  <span 
                                    key={featureIndex}
                                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>

                              {/* Select Button */}
                              <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg">
                                Book {fareType.name} - ₹{fareType.price.toLocaleString()}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {renderFilters()}
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => {
                    setFilters({
                      stops: [],
                      airlines: [],
                      priceRange: [0, 50000],
                      departureTime: [],
                      arrivalTime: [],
                      durationRange: [0, 720],
                      refundable: null,
                      aircraftTypes: [],
                      serviceTypes: []
                    });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightResults;