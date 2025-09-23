import React, { useState, useEffect, useMemo } from 'react';

// Flight Results Page Component - Updated for App.js integration
const FlightResults = ({ searchParams, onFlightSelect }) => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
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
      <div className="min-h-screen bg-gray-50">
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
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              {renderFilters()}
            </div>
          </div>
          
          {/* Results Column */}
          <div className="lg:col-span-3">
            {/* Mobile Filters Button & Sorting */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium"
              >
                Filters
              </button>
              
              {/* Sorting */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
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
            <div className="space-y-4">
              {filteredAndSortedFlights.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">✈️</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No flights found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
                </div>
              ) : (
                filteredAndSortedFlights.map((flight, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    {/* Main Flight Info */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        {/* Flight Details */}
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                              <span className="text-blue-600 text-xs font-bold">
                                {(flight.airline || 'UK').substring(0, 2)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {flight.airline || 'Unknown Airline'}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center space-x-2">
                                <span>{flight.flight_number || 'N/A'}</span>
                                {flight.aircraft_type && (
                                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                    {flight.aircraft_type}
                                  </span>
                                )}
                                {flight.is_lcc && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                    LCC
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Route & Time */}
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="text-center">
                              <div className="font-semibold text-lg">
                                {formatTime(flight.departure_time)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {flight.origin || searchParams?.from?.iata || 'DEL'}
                              </div>
                            </div>
                            
                            <div className="flex-1 text-center">
                              <div className="text-sm text-gray-500 mb-1">
                                {formatDuration(flight.duration_minutes)}
                              </div>
                              <div className="flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                                {(flight.stops || 0) > 0 && (
                                  <>
                                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                    <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                                  </>
                                )}
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {(flight.stops || 0) === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-semibold text-lg">
                                {formatTime(flight.arrival_time)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {flight.destination || searchParams?.to?.iata || 'BOM'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Starting Price Display */}
                        <div className="text-right ml-6">
                          <div className="text-sm text-gray-500 mb-1">Starting from</div>
                          <div className="text-2xl font-bold text-gray-800">
                            {flight.currency === 'INR' ? '₹' : flight.currency || '₹'}
                            {flight.fare_types && flight.fare_types.length > 0 
                              ? flight.fare_types[0].price.toLocaleString()
                              : (flight.price || flight.base_price || 0).toLocaleString()
                            }
                          </div>
                          <div className="text-sm text-gray-500">per person</div>
                        </div>
                      </div>
                    </div>

                    {/* Fare Type Options */}
                    {flight.fare_types && flight.fare_types.length > 0 ? (
                      <div className="p-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {flight.fare_types.map((fareType, fareIndex) => (
                            <div 
                              key={fareIndex} 
                              className="border rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                              onClick={() => onFlightSelect && onFlightSelect({
                                ...flight,
                                selectedFareType: fareType,
                                price: fareType.price
                              })}
                            >
                              {/* Fare Type Header */}
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-800">{fareType.name}</h4>
                                  <div className="text-2xl font-bold text-blue-600">
                                    ₹{fareType.price.toLocaleString()}
                                  </div>
                                </div>
                                <div className="text-right text-xs text-gray-500">
                                  <div>Base: ₹{fareType.base_fare.toLocaleString()}</div>
                                  <div>Taxes: ₹{fareType.taxes.toLocaleString()}</div>
                                </div>
                              </div>

                              {/* Cancellation Policy */}
                              <div className="mb-3 p-2 bg-red-50 rounded border-l-4 border-red-300">
                                <div className="text-xs font-medium text-red-700 mb-1">Cancellation</div>
                                <div className="text-xs text-red-600">
                                  {fareType.cancellation_charges.description}
                                </div>
                              </div>

                              {/* Key Features */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Changes:</span>
                                  <span className={fareType.changeable ? 'text-green-600' : 'text-red-600'}>
                                    {fareType.changeable ? '✓ Allowed' : '✗ Not allowed'}
                                  </span>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Baggage:</span>
                                  <span className="text-gray-800">{fareType.baggage}</span>
                                </div>
                                
                                {fareType.seat_selection && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Seat Selection:</span>
                                    <span className="text-green-600">✓ Free</span>
                                  </div>
                                )}
                                
                                {fareType.meal && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Meal:</span>
                                    <span className="text-green-600">✓ Included</span>
                                  </div>
                                )}
                              </div>

                              {/* Features Tags */}
                              <div className="mt-3 flex flex-wrap gap-1">
                                {fareType.features.slice(0, 3).map((feature, featureIndex) => (
                                  <span 
                                    key={featureIndex}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>

                              {/* Select Button */}
                              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                                Select {fareType.name}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Fallback for flights without fare types */
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>🧳 {flight.baggage_allowance || '15 kg'}</span>
                            <span className={flight.refundable ? 'text-green-600' : 'text-orange-600'}>
                              {flight.refundable ? '✓ Refundable' : '⚠ Non-refundable'}
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => onFlightSelect && onFlightSelect(flight)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Select Flight
                          </button>
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