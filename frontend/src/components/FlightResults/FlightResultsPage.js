import React, { useState, useEffect } from 'react';
import FlightCard from './FlightCard';

const FlightResultsPage = ({ searchParams, onBack }) => {
  // State
  const [expandedId, setExpandedId] = useState(null);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Flights from TBO API
  useEffect(() => {
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
      }
    };

    fetchFlights();
  }, [searchParams]);

  // Handlers
  const handleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleBook = (flight) => {
    alert(`Booking ${flight.airline} for ₹${flight.price}`);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5] mb-4"></div>
        <p className="text-gray-600 font-medium">Searching live flights...</p>
      </div>
    );
  }

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
      
      {/* 1. Top Search Summary Bar (Sticky) */}
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Route Info */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
              <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <span>{searchParams?.from?.iata || 'DEL'}</span>
                  <span className="text-gray-400">→</span>
                  <span>{searchParams?.to?.iata || 'BOM'}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {searchParams?.departDate ? new Date(searchParams.departDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Date'} • {searchParams?.passengers?.adt || 1} Traveller
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button 
              onClick={onBack}
              className="text-[#4F46E5] text-sm font-semibold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Filters Bar (Horizontal Scroll) */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 overflow-x-auto no-scrollbar sticky top-[61px] z-20">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
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

      {/* 3. Main Results List */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
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
