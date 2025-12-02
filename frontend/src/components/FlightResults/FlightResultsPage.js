import React, { useState, useEffect } from 'react';
import FlightCard from './FlightCard';

// Temporary Mock Data to validate the layout immediately
const MOCK_RESULTS = [
  {
    id: '1',
    airline: 'IndiGo',
    airline_code: '6E',
    flight_number: '6E-2045',
    departure_time: '06:00',
    arrival_time: '08:15',
    duration_minutes: 135,
    origin: 'DEL',
    destination: 'BOM',
    price: 4500,
    stops: 0
  },
  {
    id: '2',
    airline: 'Air India',
    airline_code: 'AI',
    flight_number: 'AI-805',
    departure_time: '10:00',
    arrival_time: '12:30',
    duration_minutes: 150,
    origin: 'DEL',
    destination: 'BOM',
    price: 5200,
    stops: 0
  },
  {
    id: '3',
    airline: 'Vistara',
    airline_code: 'UK',
    flight_number: 'UK-993',
    departure_time: '17:45',
    arrival_time: '22:15',
    duration_minutes: 270,
    origin: 'DEL',
    destination: 'BOM',
    price: 4100,
    stops: 1
  }
];

const FlightResultsPage = ({ searchParams, onBack }) => {
  // State
  const [expandedId, setExpandedId] = useState(null);
  const [flights, setFlights] = useState(MOCK_RESULTS);

  // Handlers
  const handleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleBook = (flight) => {
    alert(`Booking ${flight.airline} for ₹${flight.price}`);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-20">
      
      {/* 1. Top Search Summary Bar (Sticky) */}
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Route Info */}
            <div className="flex items-center gap-2" onClick={onBack}>
              <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <span>DEL</span>
                  <span className="text-gray-400">→</span>
                  <span>BOM</span>
                </div>
                <div className="text-xs text-gray-500">
                  Tue, 15 Oct • 1 Traveller
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button className="text-[#4F46E5] text-sm font-semibold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
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
        {flights.map(flight => (
          <FlightCard 
            key={flight.id} 
            flight={flight} 
            isExpanded={expandedId === flight.id}
            onExpand={handleExpand}
            onBook={handleBook}
          />
        ))}
      </div>

    </div>
  );
};

export default FlightResultsPage;
