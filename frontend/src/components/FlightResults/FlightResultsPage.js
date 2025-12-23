import React, { useState, useEffect } from 'react';
import FlightCard from './FlightCard';

const FlightResultsPage = ({ searchParams, onBack, onEdit, onSearchComplete, onFlightSelect }) => {
  // State
  const [expandedId, setExpandedId] = useState(null);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Flights from TBO API
  useEffect(() => {
    // Only fetch if we haven't already loaded data or if params changed
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use environment variable for backend URL
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
        
        // Prepare payload from searchParams
        const payload = {
          origin: searchParams?.from?.city || 'Delhi',
          destination: searchParams?.to?.city || 'Mumbai', 
          departure_date: searchParams?.departDate || new Date().toISOString().split('T')[0],
          return_date: searchParams?.returnDate,
          passengers: searchParams?.passengers?.adt || 1, // Assuming passengers object or number
          class_type: 'economy',
          trip_type: searchParams?.returnDate || searchParams?.tripType === 'RT' ? 'round_trip' : 'one_way'
        };

        console.log("Searching flights with payload:", payload);

        const response = await fetch(`${backendUrl}/api/flights/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("TBO API Response:", data);
        
        // Ensure flights is always an array
        // The backend returns { flights: [...] } or just [...]
        const flightResults = data.flights || (Array.isArray(data) ? data : []);
        setFlights(flightResults);
        
      } catch (err) {
        setError(err.message);
        console.error('Flight search error:', err);
        setFlights([]); 
      } finally {
        setLoading(false);
        // Signal parent App.js that loading is complete
        if (onSearchComplete) {
          onSearchComplete();
        }
      }
    };

    fetchFlights();
  }, [searchParams, onSearchComplete]);

  // Handlers
  const handleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleBook = (flight) => {
    // FARE SELECTION LOGIC - MANDATORY VALIDATION
    console.log("FARE SELECTED:", flight);

    // 1. Validate mandatory TBO fields
    // TBO requires ResultIndex (or id in our mapped object), TraceId (usually from search response), and Fare info
    
    // In our mapped object:
    // id = ResultIndex
    // validation_key = TraceId (mapped from backend) - wait, check backend mapping
    
    // Check backend mapping in tbo_flight_api.py:
    // "id": option.get("ResultIndex"...
    // "validation_key": option.get("Key"... -> This might need to be TraceId passed down
    
    // For now, we ensure 'flight' object has the fare details.
    // If selectedFare is missing (direct Book click on card), use default/first fare
    const selectedFare = flight.selectedFare || (flight.fare_types && flight.fare_types[0]) || {};
    
    // 2. Validate Price
    if (!selectedFare.price && !flight.price) {
      console.error("CRITICAL: Missing price in selected flight");
      return; 
    }

    // 3. Construct Payload for Passenger Page
    const flightPayload = {
      ...flight,
      selectedFareType: selectedFare,
      price: selectedFare.price || flight.price,
      // Pass full date context from search params if not in flight object
      travelDate: searchParams?.departDate,
      // Ensure we pass TBO specific identifiers
      ResultIndex: flight.id, 
      TraceId: flight.trace_id // Ensure backend passes this
    };

    console.log("NAVIGATING TO PASSENGER PAGE WITH PAYLOAD:", flightPayload);
    
    // 4. Navigate
    if (onFlightSelect) {
      onFlightSelect(flightPayload);
    }
  };

  // Note: We no longer render loading state here, as it's handled by App.js
  
  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm max-w-md w-full text-center">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to fetch flights</h3>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button 
            onClick={onBack}
            className="bg-[#4F46E5] text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-20">
      
      {/* Quick Filters Bar (Sticky below Global Header) */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 overflow-x-auto no-scrollbar sticky top-[64px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button className="flex items-center gap-1 px-4 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700 whitespace-nowrap hover:bg-gray-200 transition-colors border border-transparent active:border-[#4F46E5] active:text-[#4F46E5] active:bg-indigo-50">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" /></svg>
            Filters
          </button>
          <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 whitespace-nowrap hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">
            Non-stop
          </button>
          <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 whitespace-nowrap hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">
            Morning Departures
          </button>
          <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 whitespace-nowrap hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">
            Under ₹5,000
          </button>
        </div>
      </div>

      {/* Main Results List */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        {flights.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-5xl mb-3">✈️</div>
            <h3 className="text-gray-900 font-semibold">No flights found</h3>
            <p className="text-gray-500 text-sm">Try changing your dates or route.</p>
          </div>
        ) : (
          flights.map((flight, index) => (
            <FlightCard 
              key={flight.id || index} 
              flight={flight} 
              isExpanded={expandedId === (flight.id || index)}
              onExpand={() => handleExpand(flight.id || index)}
              onBook={handleBook}
            />
          ))
        )}
      </div>

    </div>
  );
};

export default FlightResultsPage;
