import React, { useState, useEffect } from "react";
import axios from "axios";

// Payment Component - Step 3 of Booking Flow
const Payment = ({ bookingData, onNext, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  // Mock promo codes
  const validPromoCodes = {
    'FIRST10': { discount: 0.10, description: 'First booking discount' },
    'SAVE500': { discount: 500, description: 'Flat ₹500 off', type: 'flat' },
    'TOURSMILE15': { discount: 0.15, description: 'TourSmile special offer' }
  };

  const calculatePrice = () => {
    const basePrice = (bookingData.selectedFare?.price || 0) * bookingData.passengers.length;
    const taxes = Math.round(basePrice * 0.12);
    const subtotal = basePrice + taxes;
    
    let discount = 0;
    if (promoApplied) {
      if (promoApplied.type === 'flat') {
        discount = promoApplied.discount;
      } else {
        discount = Math.round(subtotal * promoApplied.discount);
      }
    }
    
    const total = Math.max(0, subtotal - discount);
    
    return { basePrice, taxes, subtotal, discount, total };
  };

  const { basePrice, taxes, subtotal, discount, total } = calculatePrice();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Process booking confirmation with PNR generation and email sending
  const processBookingConfirmation = async (paymentResponse) => {
    try {
      // Call backend to generate PNR and send confirmation email
      const confirmationResponse = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/confirm`, {
        bookingData: bookingData,
        payment: {
          id: paymentResponse.razorpay_payment_id,
          orderId: paymentResponse.razorpay_order_id,
          signature: paymentResponse.razorpay_signature,
          amount: total,
          currency: 'INR',
          status: 'completed',
          method: paymentMethod,
          timestamp: new Date().toISOString()
        },
        promo: promoApplied,
        finalPrice: total
      });

      if (confirmationResponse.data.success) {
        return {
          ...bookingData,
          payment: {
            id: paymentResponse.razorpay_payment_id,
            orderId: paymentResponse.razorpay_order_id,
            signature: paymentResponse.razorpay_signature,
            amount: total,
            currency: 'INR',
            status: 'completed',
            method: paymentMethod,
            timestamp: new Date().toISOString()
          },
          promo: promoApplied,
          finalPrice: total,
          pnr: confirmationResponse.data.pnr,
          bookingReference: confirmationResponse.data.bookingReference,
          eTicket: confirmationResponse.data.eTicket,
          emailSent: confirmationResponse.data.emailSent,
          step: 'booking-confirmed'
        };
      } else {
        throw new Error('Booking confirmation failed');
      }
    } catch (error) {
      console.error('Booking confirmation error:', error);
      // Generate fallback data
      return {
        ...bookingData,
        payment: {
          id: paymentResponse.razorpay_payment_id,
          orderId: paymentResponse.razorpay_order_id,
          signature: paymentResponse.razorpay_signature,
          amount: total,
          currency: 'INR',
          status: 'completed',
          method: paymentMethod,
          timestamp: new Date().toISOString()
        },
        promo: promoApplied,
        finalPrice: total,
        pnr: `TS${Date.now().toString().slice(-6)}`, // Fallback PNR
        bookingReference: `TS${Date.now()}`,
        eTicket: null,
        emailSent: false,
        step: 'booking-confirmed',
        confirmationError: true
      };
    }
  };

  const applyPromoCode = () => {
    const code = promoCode.toUpperCase();
    if (validPromoCodes[code]) {
      setPromoApplied({ ...validPromoCodes[code], code });
      setErrors(prev => ({ ...prev, promo: '' }));
    } else {
      setErrors(prev => ({ ...prev, promo: 'Invalid promo code' }));
      setPromoApplied(null);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setPromoApplied(null);
    setErrors(prev => ({ ...prev, promo: '' }));
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Initialize Razorpay
      const isRazorpayLoaded = await initializeRazorpay();
      
      if (!isRazorpayLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Create order on backend
      const orderResponse = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/payments/create-order`, {
        amount: total,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        bookingData: bookingData
      });

      if (!orderResponse.data.success) {
        throw new Error('Failed to create payment order');
      }

      const orderData = orderResponse.data.order;

      // Mock API call to create order
      console.log('Creating order:', orderData);
      
      // Simulate API response
      const order = {
        id: `order_${Date.now()}`,
        amount: orderData.amount,
        currency: orderData.currency,
        status: 'created'
      };

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_1234567890', // Test key
        amount: order.amount,
        currency: order.currency,
        name: 'TourSmile',
        description: `Flight Booking - ${bookingData.flight.flightNumber}`,
        image: 'https://customer-assets.emergentagent.com/job_travelgenius/artifacts/ojpqneqb_FINAL%20LOGO.png',
        order_id: order.id,
        handler: async function (response) {
          // Payment successful
          console.log('Payment successful:', response);
          
          try {
            // Generate PNR and send confirmation email
            const bookingConfirmationData = await processBookingConfirmation(response);
            setLoading(false);
            onNext(bookingConfirmationData);
          } catch (error) {
            console.error('Post-payment processing failed:', error);
            // Still proceed to confirmation but with error flag
            const paymentData = {
              ...bookingData,
              payment: {
                id: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                amount: total,
                currency: 'INR',
                status: 'completed',
                method: paymentMethod,
                timestamp: new Date().toISOString()
              },
              promo: promoApplied,
              finalPrice: total,
              bookingReference: `TS${Date.now()}`,
              step: 'payment-completed',
              postPaymentError: true
            };
            setLoading(false);
            onNext(paymentData);
          }
        },
        prefill: {
          name: `${bookingData.passengers[0]?.firstName} ${bookingData.passengers[0]?.lastName}`,
          email: bookingData.contactInfo.email,
          contact: `${bookingData.contactInfo.countryCode}${bookingData.contactInfo.phone}`
        },
        notes: {
          address: 'TourSmile Corporate Office'
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            console.log('Payment cancelled by user');
          }
        }
      };

      const razor = new window.Razorpay(options);
      razor.open();

    } catch (error) {
      console.error('Payment initialization failed:', error);
      setLoading(false);
      setErrors(prev => ({ 
        ...prev, 
        payment: 'Payment initialization failed. Please try again.' 
      }));
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
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
            Back to Passenger Details
          </button>
          
          {/* Progress Steps */}
          <div className="flex items-center mb-6">
            <div className="flex items-center text-blue-600">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <span className="ml-2 font-medium">Flight Selected</span>
            </div>
            <div className="w-8 h-1 bg-blue-600 mx-4"></div>
            <div className="flex items-center text-blue-600">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <span className="ml-2 font-medium">Passenger Details</span>
            </div>
            <div className="w-8 h-1 bg-blue-600 mx-4"></div>
            <div className="flex items-center text-blue-600">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">Secure payment processing with 256-bit SSL encryption</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Options - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Promo Code */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Promo Code</h3>
              
              {promoApplied ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                    <div className="ml-3">
                      <p className="font-medium text-green-900">{promoApplied.code} Applied</p>
                      <p className="text-sm text-green-700">{promoApplied.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Save {formatPrice(discount)}</p>
                    <button
                      onClick={removePromoCode}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.promo ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={!promoCode.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              
              {errors.promo && (
                <p className="mt-2 text-sm text-red-600">{errors.promo}</p>
              )}
              
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium mb-1">Available Codes:</p>
                <p>• <code className="bg-gray-100 px-2 py-1 rounded">FIRST10</code> - 10% off first booking</p>
                <p>• <code className="bg-gray-100 px-2 py-1 rounded">SAVE500</code> - Flat ₹500 off</p>
                <p>• <code className="bg-gray-100 px-2 py-1 rounded">TOURSMILE15</code> - 15% off special</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
              
              <div className="space-y-4">
                {/* Razorpay Option */}
                <div className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Credit/Debit Card, UPI, Net Banking</h4>
                          <p className="text-sm text-gray-600">Powered by Razorpay - India's most trusted payment gateway</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <img src="https://logos-world.net/wp-content/uploads/2021/02/Mastercard-Logo.png" alt="Mastercard" className="h-6" />
                          <img src="https://logos-world.net/wp-content/uploads/2020/04/Visa-Logo.png" alt="Visa" className="h-6" />
                          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH-p4FtE8ZL5vD_j6Xph4OU52YwQH8NTezrw&s" alt="UPI" className="h-6" />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-green-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2L3 9h4v9h6V9h4l-7-7z" />
                        </svg>
                        Instant confirmation • 100% secure • No extra charges
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Payment Summary</h3>
                <button
                  onClick={() => setShowPriceDetails(!showPriceDetails)}
                  className="text-blue-600 text-sm hover:text-blue-800"
                >
                  {showPriceDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showPriceDetails && (
                <div className="space-y-3 text-sm border-b border-gray-200 pb-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Base Fare ({bookingData.passengers.length} passenger(s))
                    </span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span>{formatPrice(taxes)}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({promoApplied.code})</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total Amount</span>
                <span className="text-blue-600">{formatPrice(total)}</span>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full mt-6 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Pay {formatPrice(total)} Securely
                  </div>
                )}
              </button>

              {errors.payment && (
                <p className="mt-3 text-sm text-red-600 text-center">{errors.payment}</p>
              )}
            </div>
          </div>

          {/* Booking Summary - Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Details</h3>

              {/* Flight Info */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {bookingData.flight?.airline?.substring(0, 2) || 'AI'}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{bookingData.flight?.airline}</p>
                      <p className="text-sm text-gray-500">{bookingData.flight?.flightNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="flex justify-between">
                    <span>{bookingData.flight?.departure?.time}</span>
                    <span>{bookingData.flight?.arrival?.time}</span>
                  </p>
                  <p className="text-center text-xs text-gray-500 mt-1">
                    {bookingData.flight?.duration} • {bookingData.selectedFare?.name}
                  </p>
                </div>
              </div>

              {/* Passengers */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Passengers</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {bookingData.passengers.map((passenger, index) => (
                    <div key={index}>
                      {passenger.title} {passenger.firstName} {passenger.lastName}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Contact Details</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{bookingData.contactInfo.email}</p>
                  <p>{bookingData.contactInfo.countryCode} {bookingData.contactInfo.phone}</p>
                </div>
              </div>

              {/* Security Badge */}
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Secure Payment</span>
                </div>
                <p className="text-xs text-gray-500">
                  256-bit SSL encryption
                  <br />
                  PCI DSS compliant
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;