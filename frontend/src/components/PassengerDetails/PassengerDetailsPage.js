import React, { useState } from 'react';

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

  const { airline, flight_number, origin, destination, departure_time, arrival_time, price, selectedFareType } = selectedFlight;
  const fare = selectedFareType || {};

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Passenger Details</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Flight Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-gray-900">{origin} → {destination}</h3>
              <p className="text-sm text-gray-500">{airline} • {flight_number}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">₹{price?.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{fare.name || 'Standard'} Fare</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
            <div className="font-medium">{departure_time}</div>
            <div className="h-[1px] flex-1 bg-gray-300"></div>
            <div className="font-medium">{arrival_time}</div>
          </div>
        </div>

        {/* Passenger Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Traveller Details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="e.g. John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="e.g. Doe"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="booking@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="10-digit number"
                required
              />
            </div>

            <button type="submit" className="w-full bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-bold py-3 rounded-xl mt-6 transition-colors shadow-md">
              Continue to Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetailsPage;
