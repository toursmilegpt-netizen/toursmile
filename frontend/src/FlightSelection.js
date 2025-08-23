import React, { useState, useEffect } from "react";

// Flight Selection Component - Step 1 of Booking Flow
const FlightSelection = ({ selectedFlight, searchParams, onNext, onBack }) => {
  const [selectedFare, setSelectedFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fareDetails, setFareDetails] = useState(null);

  // Mock fare types with realistic Indian LCC pricing
  const generateFareTypes = (basePriceNum) => {
    const base = typeof basePriceNum === 'string' 
      ? parseInt(basePriceNum.replace(/[₹,]/g, '')) 
      : basePriceNum || 5000;
    
    return [
      {
        id: 'saver',
        name: 'Saver',
        type: 'Non-Refundable',
        price: base,
        savings: 0,
        originalPrice: base,
        features: {
          cancellation: '❌ Non-refundable',
          changes: '❌ Non-changeable', 
          seatSelection: '❌ No free seat selection',
          baggage: '✅ 7kg cabin bag',
          meal: '❌ No meal included',
          priority: '❌ Standard boarding'
        },
        popular: false
      },
      {
        id: 'flexi',
        name: 'Flexi',
        type: 'Partially Refundable',
        price: base + Math.round(base * 0.15),
        savings: Math.round(base * 0.05),
        originalPrice: base + Math.round(base * 0.20),
        features: {
          cancellation: '✅ Refund with charges',
          changes: '✅ 1 free change allowed',
          seatSelection: '✅ Standard seat selection',
          baggage: '✅ 7kg cabin + 15kg checked',
          meal: '✅ Light meal included',
          priority: '✅ Priority check-in'
        },
        popular: true
      },
      {
        id: 'business',
        name: 'Business Flexi',
        type: 'Fully Refundable',
        price: base + Math.round(base * 0.35),
        savings: Math.round(base * 0.10),
        originalPrice: base + Math.round(base * 0.45),
        features: {
          cancellation: '✅ Full refund available',
          changes: '✅ Unlimited free changes',
          seatSelection: '✅ Premium seat selection',
          baggage: '✅ 7kg cabin + 25kg checked',
          meal: '✅ Premium meal included',
          priority: '✅ Fast track & lounge access'
        },
        popular: false
      }
    ];
  };

  // Load fare details when component mounts
  useEffect(() => {
    if (selectedFlight) {
      const fares = generateFareTypes(selectedFlight.price);
      setFareDetails(fares);
      // Auto-select the popular fare
      const popularFare = fares.find(f => f.popular) || fares[0];
      setSelectedFare(popularFare);
    }
  }, [selectedFlight]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleFareSelection = (fare) => {
    setSelectedFare(fare);
  };

  const handleContinue = () => {
    if (!selectedFare) return;
    
    setLoading(true);
    // Simulate API call for fare rules
    setTimeout(() => {
      onNext({
        flight: selectedFlight,
        selectedFare: selectedFare,
        totalPrice: selectedFare.price,
        passengers: searchParams.passengers
      });
      setLoading(false);
    }, 1500);
  };

  if (!selectedFlight || !fareDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flight details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Results
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Select Your Fare</h1>
          <p className="text-gray-600 mt-2">Choose the fare that works best for you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Summary - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Flight Summary</h3>
              
              {/* Flight Info */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {selectedFlight.airline?.substring(0, 2) || 'AI'}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{selectedFlight.airline}</p>
                      <p className="text-sm text-gray-500">{selectedFlight.flightNumber}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{selectedFlight.aircraft}</span>
                </div>

                {/* Route */}
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{selectedFlight.departure?.time}</p>
                    <p className="text-sm text-gray-500">{searchParams.origin}</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center px-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1 h-0.5 bg-blue-600 mx-2"></div>
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2L3 9h4v9h6V9h4l-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{selectedFlight.arrival?.time}</p>
                    <p className="text-sm text-gray-500">{searchParams.destination}</p>
                  </div>
                </div>

                {/* Duration and Date */}
                <div className="mt-4 flex justify-between text-sm text-gray-500">
                  <span>{selectedFlight.duration}</span>
                  <span>{searchParams.departureDate}</span>
                </div>
              </div>

              {/* Passenger Info */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers</span>
                  <span className="font-medium">{searchParams.passengers} Adult(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Class</span>
                  <span className="font-medium capitalize">{searchParams.class || 'Economy'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trip Type</span>
                  <span className="font-medium">{searchParams.tripType || 'One Way'}</span>
                </div>
              </div>

              {/* Price Summary */}
              {selectedFare && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">Price Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Fare</span>
                      <span>{formatPrice(selectedFare.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span>{formatPrice(Math.round(selectedFare.price * 0.12))}</span>
                    </div>
                    {selectedFare.savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Savings</span>
                        <span>-{formatPrice(selectedFare.savings)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>{formatPrice(selectedFare.price + Math.round(selectedFare.price * 0.12) - (selectedFare.savings || 0))}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fare Options - Right Column */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fareDetails.map((fare) => (
                <div
                  key={fare.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition-all duration-200 ${
                    selectedFare?.id === fare.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:shadow-xl hover:-translate-y-1'
                  } ${fare.popular ? 'relative' : ''}`}
                  onClick={() => handleFareSelection(fare)}
                >
                  {fare.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Fare Header */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{fare.name}</h3>
                    <p className="text-sm text-gray-500">{fare.type}</p>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-blue-600">{formatPrice(fare.price)}</span>
                      {fare.savings > 0 && (
                        <p className="text-sm text-green-600 font-medium">Save {formatPrice(fare.savings)}</p>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    {Object.entries(fare.features).map(([key, value]) => (
                      <div key={key} className="flex items-start text-sm">
                        <span className="mr-2 mt-0.5 flex-shrink-0">{value.split(' ')[0]}</span>
                        <span className={`${value.startsWith('✅') ? 'text-green-600' : 'text-gray-500'}`}>
                          {value.substring(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Selection Indicator */}
                  <div className="text-center">
                    <div className={`w-6 h-6 rounded-full mx-auto border-2 flex items-center justify-center ${
                      selectedFare?.id === fare.id
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedFare?.id === fare.id && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleContinue}
                disabled={!selectedFare || loading}
                className={`px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 ${
                  !selectedFare || loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing...
                  </div>
                ) : (
                  'Continue to Passenger Details'
                )}
              </button>
              
              {selectedFare && (
                <p className="text-sm text-gray-500 mt-2">
                  You selected <strong>{selectedFare.name}</strong> - {formatPrice(selectedFare.price + Math.round(selectedFare.price * 0.12))} total
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSelection;