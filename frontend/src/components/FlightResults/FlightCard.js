import React from 'react';
import { formatSectorTime, cleanSectorLabel } from '../../utils/dateFormatter';

const FlightCard = ({ flight, onBook, onExpand, isExpanded }) => {
  // Helper to format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  // Airline Logo Logic
  const airlineCode = flight.airline_code || 'AI';
  const airlineName = flight.airline || 'Airline';

  // Determine fares to show
  const fareOptions = flight.fare_types && flight.fare_types.length > 0 
    ? flight.fare_types 
    : [{
        name: 'Standard',
        price: flight.price || flight.base_price,
        baggage: flight.baggage_allowance || '15 kg',
        refundable: flight.refundable || false,
        features: ['Standard Seat', 'Meal Available']
      }];

  // Primary price to show on the main card (usually the cheapest/first option)
  const displayPrice = flight.price || flight.base_price || 0;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 mb-4 overflow-hidden ${isExpanded ? 'ring-2 ring-blue-100 border-blue-200' : ''}`}>
      
      {/* Main Row - Always Visible */}
      <div className="p-4 sm:p-5 cursor-pointer" onClick={() => onExpand(flight.id)}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          
          {/* 1. Airline Info (Left) */}
          <div className="flex items-center gap-3 w-full sm:w-1/4">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-gray-600">{airlineCode}</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{airlineName}</h3>
              <p className="text-xs text-gray-500">{flight.flight_number || `${airlineCode}-123`}</p>
            </div>
          </div>

          {/* 2. Flight Timing & Duration (Center) */}
          <div className="flex items-center justify-between flex-1 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0 mt-2 sm:mt-0">
            <div className="text-left">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 leading-none">
                {formatSectorTime(flight.departure_time)}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1">
                {cleanSectorLabel(flight.origin || 'DEL')}
              </div>
            </div>

            <div className="flex flex-col items-center px-4">
              <div className="text-xs text-gray-400 mb-1">{formatDuration(flight.duration_minutes)}</div>
              <div className="w-20 sm:w-32 h-[2px] bg-gray-200 relative flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${flight.stops === 0 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop`}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 leading-none">
                {formatSectorTime(flight.arrival_time)}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1">
                {cleanSectorLabel(flight.destination || 'BOM')}
              </div>
            </div>
          </div>

          {/* 3. Price & Action (Right) */}
          <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0 mt-2 sm:mt-0 gap-2">
            <div className="text-left sm:text-right">
              <div className="text-2xl font-bold text-[#1e293b]">
                ₹{displayPrice.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">
                per adult
              </div>
            </div>
            
            {/* Desktop: View Fares Button / Mobile: Chevron */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent double triggering if row click is enabled
                onExpand(flight.id);
              }}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold py-2 px-6 rounded-xl transition-colors text-sm flex items-center gap-2 group"
            >
              <span className="hidden sm:inline">{isExpanded ? 'Hide Fares' : 'View Fares'}</span>
              <span className="sm:hidden">{isExpanded ? 'Hide' : 'Select'}</span>
              <svg 
                className={`w-4 h-4 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* 4. Expanded Content - INLINE ACCORDION */}
      {/* Uses simple conditional rendering for instant "snap" effect as requested, no heavy animations */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-6 animate-fade-in">
          
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* A. Flight Details Column (Optional - Keep simple for now) */}
            <div className="hidden lg:block w-1/4 pr-4 border-r border-gray-200">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Flight Details</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  {airlineName} {flight.aircraft_type ? `• ${flight.aircraft_type}` : ''}
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {formatDuration(flight.duration_minutes)}
                </li>
              </ul>
            </div>

            {/* B. Fare Options Column - The Core Deliverable */}
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block lg:hidden">Select Fare</h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fareOptions.map((fare, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer relative group"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBook({...flight, selectedFare: fare});
                    }}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md tracking-wide">
                          {fare.name || 'Standard'}
                        </span>
                      </div>
                      {/* Price Difference Indicator */}
                      {fare.price > displayPrice && (
                        <div className="text-xs text-gray-400">
                          +₹{(fare.price - displayPrice).toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    {/* Main Price */}
                    <div className="text-xl font-bold text-gray-900 mb-3">
                      ₹{fare.price?.toLocaleString()}
                    </div>
                    
                    {/* Features List */}
                    <div className="space-y-2 text-xs text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">🎒</span> 
                        <span className="font-medium text-gray-700">{fare.baggage || '15 kg'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">🔄</span> 
                        <span className={`${fare.refundable ? 'text-green-600' : 'text-red-500'} font-medium`}>
                          {fare.refundable ? 'Refundable' : 'Non-Refundable'}
                        </span>
                      </div>
                      {fare.meal && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">🍽️</span> 
                          <span className="font-medium text-gray-700">Meal Included</span>
                        </div>
                      )}
                    </div>

                    {/* Book Button - Visible on Hover (Desktop) or Always (Mobile) */}
                    <button className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg group-hover:bg-blue-600 transition-colors shadow-sm">
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default FlightCard;
