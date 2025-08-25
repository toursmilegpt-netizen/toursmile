import React, { useState } from "react";
import axios from "axios";

// Passenger Information Component - Step 2 of Booking Flow  
const PassengerInfo = ({ bookingData, onNext, onBack }) => {
  const [passengers, setPassengers] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    email: '',
    countryCode: '+91',
    mobile: '',
    isVerified: false
  });
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize passengers based on booking data
  React.useEffect(() => {
    if (bookingData) {
      const passengerCount = bookingData.passengers || 1;
      const initialPassengers = Array.from({ length: passengerCount }, (_, index) => ({
        id: index + 1,
        type: 'adult',
        title: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        nationality: 'Indian',
        passportNumber: '',
        passportExpiry: '',
        specialRequests: ''
      }));
      setPassengers(initialPassengers);
    }
  }, [bookingData]);

  const validatePassenger = (passenger) => {
    const errors = {};
    
    if (!passenger.title) errors.title = 'Title is required';
    if (!passenger.firstName.trim()) errors.firstName = 'First name is required';
    if (!passenger.lastName.trim()) errors.lastName = 'Last name is required';
    if (!passenger.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    if (!passenger.gender) errors.gender = 'Gender is required';
    
    // Age validation
    if (passenger.dateOfBirth) {
      const today = new Date();
      const dob = new Date(passenger.dateOfBirth);
      const age = today.getFullYear() - dob.getFullYear();
      
      if (age < 2) {
        passenger.type = 'infant';
      } else if (age < 12) {
        passenger.type = 'child';
      } else {
        passenger.type = 'adult';
      }

      if (age > 120 || age < 0) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    return errors;
  };

  const validateContactInfo = () => {
    const errors = {};
    
    if (!contactInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!contactInfo.mobile.trim()) {
      errors.mobile = 'Phone number is required';
    } else if (!/^\d{10}$/.test(contactInfo.mobile)) {
      errors.mobile = 'Please enter a valid 10-digit phone number';
    }

    return errors;
  };

  const updatePassenger = (index, field, value) => {
    setPassengers(prev => prev.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ));
    
    // Clear errors for this field
    if (errors[`passenger_${index}_${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`passenger_${index}_${field}`]: ''
      }));
    }
  };

  const updateContactInfo = (field, value) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
    
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContinue = () => {
    // Validate all passengers
    let allErrors = {};
    let isValid = true;

    passengers.forEach((passenger, index) => {
      const passengerErrors = validatePassenger(passenger);
      if (Object.keys(passengerErrors).length > 0) {
        isValid = false;
        Object.keys(passengerErrors).forEach(field => {
          allErrors[`passenger_${index}_${field}`] = passengerErrors[field];
        });
      }
    });

    // Validate contact info
    const contactErrors = validateContactInfo();
    if (Object.keys(contactErrors).length > 0) {
      isValid = false;
      allErrors = { ...allErrors, ...contactErrors };
    }

    setErrors(allErrors);

    if (!isValid) {
      // Scroll to first error
      const firstError = document.querySelector('.error-field');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      onNext({
        ...bookingData,
        passengers,
        contactInfo,
        step: 'passenger-info-completed'
      });
      setLoading(false);
    }, 1500);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const totalPrice = bookingData.selectedFare?.price + Math.round(bookingData.selectedFare?.price * 0.12);

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
            Back to Fare Selection
          </button>
          
          {/* Progress Steps */}
          <div className="flex items-center mb-6">
            <div className="flex items-center text-blue-600">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <span className="ml-2 font-medium">Flight Selected</span>
            </div>
            <div className="w-8 h-1 bg-blue-600 mx-4"></div>
            <div className="flex items-center text-blue-600">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="ml-2 font-medium">Passenger Details</span>
            </div>
            <div className="w-8 h-1 bg-gray-300 mx-4"></div>
            <div className="flex items-center text-gray-400">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="ml-2">Payment</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Passenger Information</h1>
          <p className="text-gray-600 mt-2">Please provide details for all travelers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Passenger Forms - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => updateContactInfo('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500 error-field' : 'border-gray-300'}`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <div className="flex">
                    <select
                      value={contactInfo.countryCode}
                      onChange={(e) => updateContactInfo('countryCode', e.target.value)}
                      className="px-3 py-3 border border-r-0 border-gray-300 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+65">🇸🇬 +65</option>
                    </select>
                    <input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => updateContactInfo('phone', e.target.value.replace(/\D/g, ''))}
                      className={`flex-1 px-4 py-3 border rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-500 error-field' : 'border-gray-300'}`}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            {passengers.map((passenger, index) => (
              <div key={passenger.id} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Passenger {index + 1} 
                  <span className="ml-2 text-sm font-normal text-gray-500 capitalize">
                    ({passenger.type})
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <select
                      value={passenger.title}
                      onChange={(e) => updatePassenger(index, 'title', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`passenger_${index}_title`] ? 'border-red-500 error-field' : 'border-gray-300'}`}
                    >
                      <option value="">Select Title</option>
                      <option value="Mr">Mr</option>
                      <option value="Ms">Ms</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Master">Master</option>
                    </select>
                    {errors[`passenger_${index}_title`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger_${index}_title`]}</p>
                    )}
                  </div>

                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={passenger.firstName}
                      onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`passenger_${index}_firstName`] ? 'border-red-500 error-field' : 'border-gray-300'}`}
                      placeholder="First Name"
                    />
                    {errors[`passenger_${index}_firstName`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger_${index}_firstName`]}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={passenger.lastName}
                      onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`passenger_${index}_lastName`] ? 'border-red-500 error-field' : 'border-gray-300'}`}
                      placeholder="Last Name"
                    />
                    {errors[`passenger_${index}_lastName`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger_${index}_lastName`]}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={passenger.dateOfBirth}
                      onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`passenger_${index}_dateOfBirth`] ? 'border-red-500 error-field' : 'border-gray-300'}`}
                    />
                    {errors[`passenger_${index}_dateOfBirth`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger_${index}_dateOfBirth`]}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      value={passenger.gender}
                      onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`passenger_${index}_gender`] ? 'border-red-500 error-field' : 'border-gray-300'}`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors[`passenger_${index}_gender`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger_${index}_gender`]}</p>
                    )}
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nationality
                    </label>
                    <select
                      value={passenger.nationality}
                      onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Indian">Indian</option>
                      <option value="American">American</option>
                      <option value="British">British</option>
                      <option value="Canadian">Canadian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={passenger.specialRequests}
                    onChange={(e) => updatePassenger(index, 'specialRequests', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Wheelchair assistance, Special meal, etc."
                  />
                </div>
              </div>
            ))}

            {/* Continue Button */}
            <div className="text-center pt-6">
              <button
                onClick={handleContinue}
                disabled={loading}
                className={`px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Validating Information...
                  </div>
                ) : (
                  'Continue to Payment'
                )}
              </button>
            </div>
          </div>

          {/* Booking Summary - Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>

              {/* Flight Info */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {bookingData.flight?.airline?.substring(0, 2) || 'AI'}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{bookingData.flight?.airline}</p>
                      <p className="text-sm text-gray-500">{bookingData.selectedFare?.name} Fare</p>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>{bookingData.flight?.departure?.time} → {bookingData.flight?.arrival?.time}</p>
                  <p>{bookingData.flight?.duration} • {passengers.length} Passenger(s)</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare ({passengers.length} × {formatPrice(bookingData.selectedFare?.price)})</span>
                  <span>{formatPrice((bookingData.selectedFare?.price || 0) * passengers.length)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span>{formatPrice(Math.round((bookingData.selectedFare?.price || 0) * passengers.length * 0.12))}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total Amount</span>
                  <span className="text-blue-600">{formatPrice(totalPrice * passengers.length)}</span>
                </div>
              </div>

              {/* Important Information */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-2">Important</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Names must match government ID exactly</li>
                  <li>• Check passport validity for international travel</li>
                  <li>• Carry valid ID documents while traveling</li>
                  <li>• Prices are subject to availability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerInfo;