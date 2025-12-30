import React, { useState } from 'react';
import { formatSectorDate, formatSectorTime, cleanSectorLabel } from '../../utils/dateFormatter';

const PassengerDetailsPage = ({ selectedFlight, onBack }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Proceeding to payment... (Demo)');
  };

  if (!selectedFlight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No flight selected.</p>
        <button onClick={onBack} className="ml-4 text-blue-600 underline">Go Back</button>
      </div>
    );
  }

  // Detect Round Trip - check for returnFlight object
  const isRoundTrip = !!selectedFlight.returnFlight;
  
  // Extract Flight Data
  // For round trip, selectedFlight is the Onward flight, and selectedFlight.returnFlight is Return
  const flights = isRoundTrip 
    ? [selectedFlight, selectedFlight.returnFlight] 
    : [selectedFlight];

  // Helper Formatters
  const formatDate = (dateStr) => formatSectorDate(dateStr);
  const formatTime = (timeStr) => formatSectorTime(timeStr);
  const cleanLabel = (label) => cleanSectorLabel(label);
  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        
        {/* Flight Summary Card(s) - Stacked for Round Trip */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              {isRoundTrip ? 'Trip Summary' : 'Flight Summary'}
            </span>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {selectedFlight.selectedFareType?.name || 'Standard'} Fare
            </span>
          </div>
          
          <div className="divide-y divide-gray-100">
            {flights.map((flight, index) => (
              <div key={index} className="p-5">
                {/* Leg Header (Onward/Return) */}
                {isRoundTrip && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${index === 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {index === 0 ? 'ONWARD' : 'RETURN'}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      {formatDate(flight.travelDate || flight.departure_date)}
                    </span>
                  </div>
                )}

                {/* Route & Airline */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                      {flight.airline?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{flight.airline}</h3>
                      <p className="text-sm text-gray-500">{flight.flight_number}</p>
                    </div>
                  </div>
                  {/* Show Price only on first card (Total) or per leg? Usually Total is better */}
                  {index === 0 && (
                    <div className="text-right">
                      {isRoundTrip ? (
                        <div className="text-xl font-bold text-gray-900">
                          ₹{((selectedFlight.price || 0) + (selectedFlight.returnFlight?.price || 0)).toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-xl font-bold text-gray-900">₹{flight.price?.toLocaleString()}</div>
                      )}
                      {isRoundTrip && <div className="text-xs text-gray-500">Total Price</div>}
                    </div>
                  )}
                </div>

                {/* Time & Duration */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{formatTime(flight.departure_time)}</div>
                    <div className="text-sm font-semibold text-gray-600">{cleanLabel(flight.origin)}</div>
                  </div>

                  <div className="flex flex-col items-center px-4 flex-1">
                    <div className="text-xs text-gray-500 mb-1">{formatDuration(flight.duration_minutes)}</div>
                    <div className="w-full h-[2px] bg-gray-300 relative flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">Non-stop</div>
                  </div>

                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{formatTime(flight.arrival_time)}</div>
                    <div className="text-sm font-semibold text-gray-600">{cleanLabel(flight.destination)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Passenger Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Traveller Details
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                  placeholder="As on passport"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                  placeholder="Surname"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                placeholder="Ticket will be sent here"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                placeholder="For flight updates"
                required
              />
            </div>

            <button type="submit" className="w-full bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-bold py-3.5 rounded-xl mt-4 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Continue to Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetailsPage;
