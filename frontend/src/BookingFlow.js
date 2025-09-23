import React, { useState, useEffect } from 'react';

// Booking Flow Component - Handles fare rules, passenger details, and booking confirmation
const BookingFlow = ({ selectedFlight, searchParams, onBack, onBookingComplete }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Fare Rules, 2: Passenger Details, 3: Review & Pay
  const [fareRules, setFareRules] = useState(null);
  const [fareQuote, setFareQuote] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [gstDetails, setGstDetails] = useState({ required: false, gstNumber: '', companyName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize passengers based on search params
  useEffect(() => {
    if (searchParams) {
      const passengers = [];
      const passengerCount = searchParams.passengers || 1;
      
      // For demo, assume 1 adult passenger
      for (let i = 0; i < passengerCount; i++) {
        passengers.push({
          id: i + 1,
          type: 'adult',
          title: '',
          firstName: '',
          lastName: '',
          gender: '',
          dateOfBirth: '',
          passport: { number: '', expiry: '', nationality: '' },
          frequent_flyer: { airline: '', number: '' }
        });
      }
      
      setPassengerDetails(passengers);
    }
  }, [searchParams]);

  const fetchFareRules = async () => {
    try {
      setLoading(true);
      setError(null);

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      const response = await fetch(`${backendUrl}/api/flights/fare-rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flight_id: selectedFlight.id,
          validation_key: selectedFlight.validation_key || ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fare rules');
      }

      const data = await response.json();
      setFareRules(data.fare_rules || {});
      
    } catch (err) {
      setError(err.message);
      // Set demo fare rules for testing
      setFareRules({
        cancellation: "Cancellation allowed up to 2 hours before departure with charges",
        changes: "Date/time changes allowed with fare difference",
        baggage: "15kg check-in baggage included",
        refund: selectedFlight.refundable ? "Fully refundable" : "Non-refundable"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFlight) {
      fetchFareRules();
    }
  }, [selectedFlight]);

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengerDetails];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedPassengers[index] = {
        ...updatedPassengers[index],
        [parent]: {
          ...updatedPassengers[index][parent],
          [child]: value
        }
      };
    } else {
      updatedPassengers[index] = {
        ...updatedPassengers[index],
        [field]: value
      };
    }
    setPassengerDetails(updatedPassengers);
  };

  const validatePassengerDetails = () => {
    for (const passenger of passengerDetails) {
      if (!passenger.title || !passenger.firstName || !passenger.lastName || !passenger.gender) {
        return false;
      }
      // Add more validation for children/infants requiring DOB
    }
    return true;
  };

  const handleProceedToPayment = async () => {
    if (!validatePassengerDetails()) {
      setError('Please fill all required passenger details');
      return;
    }

    try {
      setLoading(true);
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      // Get fare quote
      const quoteResponse = await fetch(`${backendUrl}/api/flights/fare-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flight_id: selectedFlight.id,
          passengers: passengerDetails
        })
      });

      const quoteData = await quoteResponse.json();
      setFareQuote(quoteData);
      setCurrentStep(3);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderFareRules = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Fare Rules & Policies</h2>
        
        {/* Flight Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{selectedFlight.airline}</h3>
              <p className="text-gray-600">{selectedFlight.flight_number}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">
                {selectedFlight.currency === 'INR' ? '₹' : selectedFlight.currency}{selectedFlight.price?.toLocaleString()}
              </div>
              <p className="text-gray-600">per person</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>{selectedFlight.departure_time} - {selectedFlight.arrival_time}</span>
            <span>{selectedFlight.origin} → {selectedFlight.destination}</span>
          </div>
        </div>

        {/* Fare Rules */}
        {fareRules && (
          <div className="space-y-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-red-600">Cancellation</h4>
                <p className="text-sm text-gray-700">{fareRules.cancellation}</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-orange-600">Changes</h4>
                <p className="text-sm text-gray-700">{fareRules.changes}</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-600">Baggage</h4>
                <p className="text-sm text-gray-700">{fareRules.baggage}</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-green-600">Refund Policy</h4>
                <p className="text-sm text-gray-700">{fareRules.refund}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            ← Back to Results
          </button>
          
          <button
            onClick={() => setCurrentStep(2)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Accept & Continue →
          </button>
        </div>
      </div>
    </div>
  );

  const renderPassengerDetails = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Passenger Details</h2>
        
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">Step 2 of 3</span>
            <span className="text-sm text-gray-500">Passenger Information</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-2/3"></div>
          </div>
        </div>

        {passengerDetails.map((passenger, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-4">Passenger {index + 1} (Adult)</h3>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <select
                  value={passenger.title}
                  onChange={(e) => handlePassengerChange(index, 'title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select</option>
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={passenger.firstName}
                  onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="First Name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={passenger.lastName}
                  onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Last Name"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  value={passenger.gender}
                  onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={passenger.dateOfBirth}
                  onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* International flights would require passport details */}
            {searchParams.destination && ['DXB', 'SIN', 'BKK', 'KUL'].includes(searchParams.destination) && (
              <div>
                <h4 className="font-medium mb-2">Passport Details (International Flight)</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                    <input
                      type="text"
                      value={passenger.passport.number}
                      onChange={(e) => handlePassengerChange(index, 'passport.number', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Passport Number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={passenger.passport.expiry}
                      onChange={(e) => handlePassengerChange(index, 'passport.expiry', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                    <select
                      value={passenger.passport.nationality}
                      onChange={(e) => handlePassengerChange(index, 'passport.nationality', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Select</option>
                      <option value="Indian">Indian</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* GST Details */}
        <div className="border rounded-lg p-4 mb-6">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="gstRequired"
              checked={gstDetails.required}
              onChange={(e) => setGstDetails(prev => ({ ...prev, required: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="gstRequired" className="text-sm font-medium text-gray-700">
              I need GST invoice for this booking
            </label>
          </div>
          
          {gstDetails.required && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  value={gstDetails.gstNumber}
                  onChange={(e) => setGstDetails(prev => ({ ...prev, gstNumber: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter GST Number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={gstDetails.companyName}
                  onChange={(e) => setGstDetails(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter Company Name"
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(1)}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            ← Back
          </button>
          
          <button
            onClick={handleProceedToPayment}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Continue to Payment →'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderReviewAndPayment = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Review & Payment</h2>
        
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">Step 3 of 3</span>
            <span className="text-sm text-gray-500">Review & Payment</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-full"></div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
            
            {/* Flight Details */}
            <div className="border rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">{selectedFlight.airline} - {selectedFlight.flight_number}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>{selectedFlight.departure_time} → {selectedFlight.arrival_time}</div>
                <div>{selectedFlight.origin} → {selectedFlight.destination}</div>
                <div>Duration: {selectedFlight.duration}</div>
                <div>Aircraft: {selectedFlight.aircraft_type}</div>
              </div>
            </div>

            {/* Passengers */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Passengers</h4>
              {passengerDetails.map((passenger, index) => (
                <div key={index} className="text-sm text-gray-600 mb-1">
                  {passenger.title} {passenger.firstName} {passenger.lastName}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Payment Summary</h3>
            
            <div className="border rounded-lg p-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Base Fare ({passengerDetails.length} passenger{passengerDetails.length > 1 ? 's' : ''})</span>
                  <span>₹{(selectedFlight.price * passengerDetails.length).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>₹{Math.round(selectedFlight.price * 0.1 * passengerDetails.length).toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>₹{Math.round(selectedFlight.price * 1.1 * passengerDetails.length).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  // Here we would integrate with payment gateway
                  onBookingComplete({
                    flight: selectedFlight,
                    passengers: passengerDetails,
                    gst: gstDetails,
                    totalAmount: Math.round(selectedFlight.price * 1.1 * passengerDetails.length)
                  });
                }}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
              >
                Pay ₹{Math.round(selectedFlight.price * 1.1 * passengerDetails.length).toLocaleString()} & Book
              </button>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="mt-6">
          <button
            onClick={() => setCurrentStep(2)}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            ← Back to Passenger Details
          </button>
        </div>
      </div>
    </div>
  );

  if (loading && currentStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fare rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold">Complete Your Booking</h1>
          <div className="text-sm text-gray-600">
            Step {currentStep} of 3
          </div>
        </div>
      </header>

      {currentStep === 1 && renderFareRules()}
      {currentStep === 2 && renderPassengerDetails()}
      {currentStep === 3 && renderReviewAndPayment()}
    </div>
  );
};

export default BookingFlow;