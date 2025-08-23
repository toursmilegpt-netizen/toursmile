import React, { useState, useEffect } from "react";

// Airline logos and brand colors
const AIRLINE_INFO = {
  "IndiGo": { logo: "6E", color: "bg-indigo-600", textColor: "text-white" },
  "Air India": { logo: "AI", color: "bg-red-600", textColor: "text-white" },
  "SpiceJet": { logo: "SG", color: "bg-yellow-500", textColor: "text-white" },
  "Vistara": { logo: "UK", color: "bg-purple-600", textColor: "text-white" },
  "GoFirst": { logo: "G8", color: "bg-orange-500", textColor: "text-white" },
  "AirAsia India": { logo: "I5", color: "bg-red-500", textColor: "text-white" },
  "Emirates": { logo: "EK", color: "bg-red-700", textColor: "text-white" },
  "Qatar Airways": { logo: "QR", color: "bg-purple-800", textColor: "text-white" },
  "Singapore Airlines": { logo: "SQ", color: "bg-blue-800", textColor: "text-white" },
  "Thai Airways": { logo: "TG", color: "bg-purple-700", textColor: "text-white" },
  "Lufthansa": { logo: "LH", color: "bg-blue-900", textColor: "text-white" },
  "British Airways": { logo: "BA", color: "bg-blue-700", textColor: "text-white" },
  "Default": { logo: "✈️", color: "bg-gray-600", textColor: "text-white" }
};

// Enhanced Results Header with Modify and Date Navigation
const ResultsHeader = ({ searchData, filteredFlights, onModifySearch, onDateChange }) => {
  const [showModifyModal, setShowModifyModal] = useState(false);
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const generateDateOptions = () => {
    const today = new Date();
    const dates = [];
    
    // Generate 7 days from today
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        display: formatDate(date.toISOString().split('T')[0]),
        day: date.getDate(),
        price: Math.floor(Math.random() * 5000) + 2000 // Mock price variation
      });
    }
    
    return dates;
  };

  const dateOptions = generateDateOptions();
  const currentDate = searchData?.segments?.[0]?.departureDate;

  return (
    <>
      {/* Main Results Header */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        {/* Search Summary Bar */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              {/* Route Info */}
              <div className="flex items-center space-x-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{searchData?.segments?.[0]?.origin || 'Origin'}</div>
                  <div className="text-sm text-gray-500">From</div>
                </div>
                <div className="text-2xl text-blue-600">✈️</div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{searchData?.segments?.[0]?.destination || 'Destination'}</div>
                  <div className="text-sm text-gray-500">To</div>
                </div>
              </div>
              
              {/* Travel Details */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span>📅</span>
                  <span>{formatDate(currentDate)} • {searchData?.tripType === 'return' ? 'Round Trip' : 'One Way'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>👥</span>
                  <span>{(searchData?.passengers?.adults || 1) + (searchData?.passengers?.children || 0)} Passenger{((searchData?.passengers?.adults || 1) + (searchData?.passengers?.children || 0)) > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🎫</span>
                  <span className="capitalize">{searchData?.class || 'Economy'}</span>
                </div>
              </div>
            </div>
            
            {/* Modify Button */}
            <button
              onClick={() => setShowModifyModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <span>✏️</span>
              <span>Modify Search</span>
            </button>
          </div>
        </div>

        {/* Date Navigation Bar */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {filteredFlights.length} Flight{filteredFlights.length !== 1 ? 's' : ''} Found
            </h3>
            <div className="text-sm text-gray-600">
              Compare prices for different dates
            </div>
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <button className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {dateOptions.map((dateOption) => {
              const isSelected = dateOption.date === currentDate;
              return (
                <button
                  key={dateOption.date}
                  onClick={() => onDateChange && onDateChange(dateOption.date)}
                  className={`flex-shrink-0 p-3 rounded-xl text-center min-w-[80px] transition-all ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-xs font-medium">{dateOption.display.split(' ')[0]}</div>
                  <div className="text-lg font-bold">{dateOption.day}</div>
                  <div className="text-xs">₹{dateOption.price.toLocaleString()}</div>
                </button>
              );
            })}
            
            <button className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modify Search Modal */}
      {showModifyModal && (
        <ModifySearchModal 
          searchData={searchData}
          onClose={() => setShowModifyModal(false)}
          onModify={onModifySearch}
        />
      )}
    </>
  );
};
const FlightFilters = ({ filters, onFilterChange, flights }) => {
  // Extract unique airlines from flights
  const airlines = [...new Set(flights.map(f => f.airline))];
  
  // Price range
  const prices = flights.map(f => f.price || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
        🔧 Filters
        <button 
          onClick={() => onFilterChange({sortBy: 'price', priceRange: [0, 50000], airlines: [], stops: []})}
          className="ml-auto text-sm text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </h3>
      
      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          💰 Price Range
        </label>
        <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 mb-2">
          ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
        </div>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={filters.priceRange[1]}
          onChange={(e) => onFilterChange({...filters, priceRange: [minPrice, parseInt(e.target.value)]})}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Airlines */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          ✈️ Airlines
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {airlines.map(airline => (
            <label key={airline} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters.airlines.includes(airline)}
                onChange={(e) => {
                  const newAirlines = e.target.checked 
                    ? [...filters.airlines, airline]
                    : filters.airlines.filter(a => a !== airline);
                  onFilterChange({...filters, airlines: newAirlines});
                }}
                className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-700">{airline}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {flights.filter(f => f.airline === airline).length}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Stops */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          🛑 Stops
        </label>
        <div className="space-y-2">
          {[
            { value: 0, label: 'Non-stop', icon: '🟢' },
            { value: 1, label: '1 Stop', icon: '🟡' },
            { value: 2, label: '2+ Stops', icon: '🔴' }
          ].map(stop => (
            <label key={stop.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters.stops.includes(stop.value)}
                onChange={(e) => {
                  const newStops = e.target.checked 
                    ? [...filters.stops, stop.value]
                    : filters.stops.filter(s => s !== stop.value);
                  onFilterChange({...filters, stops: newStops});
                }}
                className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-700">
                  {stop.icon} {stop.label}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {flights.filter(f => {
                    if (stop.value === 2) return f.stops >= 2;
                    return f.stops === stop.value;
                  }).length}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// Individual Flight Card Component with Fare Options
const FlightCard = ({ flight, onSelect, isSelected }) => {
  const airlineInfo = AIRLINE_INFO[flight.airline] || AIRLINE_INFO["Default"];
  const [showFares, setShowFares] = useState(false);
  
  // Generate fare options for this flight with cancellation charges
  const baseFare = flight.price || 5000;
  const fareOptions = [
    {
      id: 'saver',
      name: 'Saver',
      type: 'Non-Refundable',
      price: baseFare,
      originalPrice: baseFare + Math.round(baseFare * 0.05),
      features: ['❌ Non-refundable', '7kg cabin bag'],
      cancellationCharges: 'No refund allowed',
      popular: false,
      savings: Math.round(baseFare * 0.05)
    },
    {
      id: 'flexi', 
      name: 'Flexi',
      type: 'Partially Refundable',
      price: baseFare + Math.round(baseFare * 0.15),
      originalPrice: baseFare + Math.round(baseFare * 0.20),
      features: ['✅ Refund with charges', '15kg checked bag', '1 free change'],
      cancellationCharges: 'Starting from ₹2,500',
      popular: true,
      savings: Math.round(baseFare * 0.05)
    },
    {
      id: 'business',
      name: 'Business',
      type: 'Fully Refundable', 
      price: baseFare + Math.round(baseFare * 0.35),
      originalPrice: baseFare + Math.round(baseFare * 0.45),
      features: ['✅ Full refund', '25kg checked bag', 'Priority boarding'],
      cancellationCharges: 'Starting from ₹1,000',
      popular: false,
      savings: Math.round(baseFare * 0.10)
    }
  ];
  
  // Parse departure time to determine time slot
  const getDepartureIcon = (time) => {
    if (!time) return "🕐";
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return "🌅";
    if (hour >= 12 && hour < 18) return "☀️";
    if (hour >= 18 && hour < 24) return "🌅";
    return "🌙";
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    // Convert minutes to hours and minutes
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const getStopText = (stops) => {
    if (stops === 0) return "Non-stop";
    if (stops === 1) return "1 stop";
    return `${stops} stops`;
  };

  const handleFareSelect = (fare) => {
    const flightWithFare = {
      ...flight,
      selectedFare: fare,
      finalPrice: fare.price
    };
    onSelect(flightWithFare);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 mb-4 border-2 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-200'
    }`}>
      {/* Main Flight Info */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Left: Airline and Flight Info */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Airline Logo */}
            <div className={`${airlineInfo.color} ${airlineInfo.textColor} w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg`}>
              {airlineInfo.logo}
            </div>
            
            {/* Flight Details */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="font-bold text-lg text-gray-900">{flight.airline}</div>
                {flight.is_lcc && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                    💰 Low Cost
                  </span>
                )}
                {flight.refundable && (
                  <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                    ✅ Refundable
                  </span>
                )}
              </div>
              
              {/* Time and Route */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{flight.departure_time}</div>
                  <div className="text-sm text-gray-500">{flight.origin}</div>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">{formatDuration(flight.duration_minutes)}</div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                      <div className={`flex-1 h-0.5 ${flight.stops === 0 ? 'bg-green-400' : 'bg-orange-400'} mx-2`}></div>
                      <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{getStopText(flight.stops)}</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{flight.arrival_time}</div>
                  <div className="text-sm text-gray-500">{flight.destination}</div>
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center">
                  {getDepartureIcon(flight.departure_time)} Departure
                </span>
                <span>Flight {flight.flight_number || 'N/A'}</span>
                <span>{flight.aircraft_type || 'Aircraft'}</span>
              </div>
            </div>
          </div>

          {/* Right: Price and Action */}
          <div className="text-right ml-6">
            <div className="mb-4">
              <div className="text-sm text-gray-500">Starting from</div>
              <div className="text-3xl font-bold text-blue-600">₹{(flight.price || 0).toLocaleString()}</div>
              <div className="text-sm text-gray-500">per person</div>
            </div>
            
            <button
              onClick={() => setShowFares(!showFares)}
              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl mb-2 block w-full ${
                showFares
                  ? 'bg-blue-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {showFares ? 'Hide Fares' : 'View Fares'}
            </button>
          </div>
        </div>
      </div>

      {/* Fare Options Panel */}
      {showFares && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="mb-3">
            <h4 className="text-lg font-semibold text-gray-800">Select Fare Type</h4>
            <p className="text-sm text-gray-600">Choose the fare that suits your needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fareOptions.map((fare) => (
              <div
                key={fare.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  fare.popular ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
                onClick={() => handleFareSelect(fare)}
              >
                {fare.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-3">
                  <h5 className="font-bold text-gray-900">{fare.name}</h5>
                  <p className="text-xs text-gray-600">{fare.type}</p>
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    📋 {fare.cancellationCharges}
                  </p>
                </div>
                
                <div className="text-center mb-3">
                  {fare.originalPrice > fare.price && (
                    <div className="text-sm text-gray-500 line-through">₹{fare.originalPrice.toLocaleString()}</div>
                  )}
                  <div className="text-2xl font-bold text-blue-600">₹{fare.price.toLocaleString()}</div>
                  {fare.savings > 0 && (
                    <div className="text-xs text-green-600 font-medium">Save ₹{fare.savings}</div>
                  )}
                </div>
                
                <div className="space-y-1">
                  {fare.features.map((feature, idx) => (
                    <div key={idx} className="text-xs text-gray-700 flex items-center">
                      <span className="mr-2">•</span>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                  Select {fare.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Flight Results Component
const FlightResults = ({ searchData, flights, onFlightSelect, isLoading }) => {
  const [filters, setFilters] = useState({
    sortBy: 'price',
    priceRange: [0, 100000],
    airlines: [],
    stops: [0, 1, 2], // Show all by default
    timeSlots: ['early', 'afternoon', 'evening', 'night']
  });
  
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Update price range when flights change
  useEffect(() => {
    if (flights.length > 0) {
      const prices = flights.map(f => f.price || 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setFilters(prev => ({
        ...prev,
        priceRange: [minPrice, maxPrice]
      }));
    }
  }, [flights]);

  // Filter and sort flights
  const getFilteredFlights = () => {
    if (!flights || flights.length === 0) return [];

    let filtered = flights.filter(flight => {
      // Price filter
      const price = flight.price || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;

      // Airline filter
      if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) return false;

      // Stops filter
      const stops = flight.stops || 0;
      const stopCategory = stops === 0 ? 0 : stops === 1 ? 1 : 2;
      if (!filters.stops.includes(stopCategory)) return false;

      // Time slot filter
      if (filters.timeSlots.length > 0) {
        const hour = parseInt((flight.departure_time || '12:00').split(':')[0]);
        let timeSlot;
        if (hour >= 6 && hour < 12) timeSlot = 'early';
        else if (hour >= 12 && hour < 18) timeSlot = 'afternoon';
        else if (hour >= 18 && hour < 24) timeSlot = 'evening';
        else timeSlot = 'night';
        
        if (!filters.timeSlots.includes(timeSlot)) return false;
      }

      return true;
    });

    // Sort flights
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'duration':
          return (a.duration_minutes || 0) - (b.duration_minutes || 0);
        case 'departure':
          return (a.departure_time || '').localeCompare(b.departure_time || '');
        case 'arrival':
          return (a.arrival_time || '').localeCompare(b.arrival_time || '');
        case 'stops':
          return (a.stops || 0) - (b.stops || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredFlights = getFilteredFlights();

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight);
    onFlightSelect(flight);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Searching Best Flights...</h3>
          <p className="text-gray-600">Finding the perfect flights for your trip</p>
        </div>
      </div>
    );
  }

  if (!flights || flights.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Header - Compact & Modern */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredFlights.length} Flight{filteredFlights.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-gray-600 mt-1">
                {searchData?.origin} → {searchData?.destination} • {searchData?.departureDate}
              </p>
            </div>
            
            {/* Quick Sort - Mobile Friendly */}
            <div className="flex items-center space-x-4">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="price">💰 Price (Low to High)</option>
                <option value="duration">⏱️ Duration (Shortest)</option>
                <option value="departure">🛫 Departure Time</option>
                <option value="arrival">🛬 Arrival Time</option>
                <option value="stops">✈️ Stops (Fewest)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Collapsible on Mobile */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <FlightFilters 
                filters={filters}
                onFilterChange={setFilters}
                flights={flights}
              />
            </div>
          </div>

          {/* Flight Results - Enhanced Layout */}
          <div className="lg:col-span-3">
            <div className="space-y-3">
              {filteredFlights.map((flight, index) => (
                <FlightCard
                  key={index}
                  flight={flight}
                  onSelect={handleFlightSelect}
                  isSelected={selectedFlight === flight}
                />
              ))}
            </div>
            
            {filteredFlights.length === 0 && flights.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights match your filters</h3>
                <p className="text-gray-600">Try removing some filters to see more results</p>
                <button 
                  onClick={() => setFilters({sortBy: 'price', priceRange: [0, 50000], airlines: [], stops: []})}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightResults;