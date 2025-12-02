import React from 'react';

const FlightCard = ({ flight, onBook, onExpand, isExpanded }) => {
  // Helper to format time
  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return timeStr.substring(0, 5);
  };

  // Helper to format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  // Airline Logo Logic (Placeholder for now, matching App.js style later)
  const airlineCode = flight.airline_code || 'AI';
  const airlineName = flight.airline || 'Airline';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 mb-4 overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          
          {/* 1. Airline Info (Left) */}
          <div className="flex items-center gap-3 w-full sm:w-1/4">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
              {/* Logo Placeholder - In production, use actual img tags */}
              <span className="text-xs font-bold text-gray-600">{airlineCode}</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{airlineName}</h3>
              <p className="text-xs text-gray-500">{flight.flight_number || `${airlineCode}-123`}</p>
            </div>
          </div>

          {/* 2. Flight Timing & Duration (Center) - The core UX from video */}
          <div className="flex items-center justify-between flex-1 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0 mt-2 sm:mt-0">
            <div className="text-left">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 leading-none">
                {formatTime(flight.departure_time)}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1">
                {flight.origin || 'DEL'}
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
                {formatTime(flight.arrival_time)}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1">
                {flight.destination || 'BOM'}
              </div>
            </div>
          </div>

          {/* 3. Price & Action (Right) */}
          <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0 mt-2 sm:mt-0 gap-2">
            <div className="text-left sm:text-right">
              <div className="text-2xl font-bold text-[#1e293b]">
                ₹{flight.price?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-gray-400 line-through">
                ₹{Math.round((flight.price || 0) * 1.15).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => onBook(flight)}
              className="bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-semibold py-2 px-6 rounded-xl transition-colors shadow-sm text-sm sm:text-base"
            >
              Book
            </button>
          </div>

        </div>
      </div>

      {/* 4. "View Fares" Footer Link (Expandable) */}
      <div className="bg-gray-50 px-5 py-2 border-t border-gray-100 flex justify-center sm:justify-start">
        <button 
          onClick={() => onExpand(flight.id)}
          className="text-xs font-medium text-[#4F46E5] hover:text-indigo-700 flex items-center gap-1 transition-colors"
        >
          {isExpanded ? 'Hide fares' : 'View more fares'}
          <svg 
            className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* 5. Expanded Content (Placeholder for next iteration) */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-100 bg-white animate-fade-in">
          <p className="text-sm text-gray-500 text-center">Fare details and options will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default FlightCard;
