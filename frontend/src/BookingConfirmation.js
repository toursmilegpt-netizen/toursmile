import React, { useState, useEffect } from "react";

// Booking Confirmation Component - Step 4 of Booking Flow
const BookingConfirmation = ({ bookingData, onStartOver }) => {
  const [emailSent, setEmailSent] = useState(false);
  const [downloadingTicket, setDownloadingTicket] = useState(false);

  useEffect(() => {
    // Simulate sending confirmation email
    setTimeout(() => {
      setEmailSent(true);
    }, 2000);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const downloadTicket = () => {
    setDownloadingTicket(true);
    
    // Simulate ticket download
    setTimeout(() => {
      // Create a simple ticket content
      const ticketContent = `
TOURSMILE E-TICKET
==================

Booking Reference: ${bookingData.bookingReference}
Flight: ${bookingData.flight.airline} ${bookingData.flight.flightNumber}
Route: ${bookingData.flight.origin} → ${bookingData.flight.destination}
Date: ${bookingData.flight.date}
Time: ${bookingData.flight.departure?.time} - ${bookingData.flight.arrival?.time}

Passengers:
${bookingData.passengers.map(p => `- ${p.title} ${p.firstName} ${p.lastName}`).join('\n')}

Total Paid: ${formatPrice(bookingData.finalPrice)}
Payment ID: ${bookingData.payment.id}

Contact: ${bookingData.contactInfo.email}
Phone: ${bookingData.contactInfo.countryCode} ${bookingData.contactInfo.phone}

Important: Please carry valid ID for travel.
For support: support@toursmile.com | +91-9876543210
      `;

      // Create and download file
      const element = document.createElement('a');
      const file = new Blob([ticketContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `TourSmile-Ticket-${bookingData.bookingReference}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      setDownloadingTicket(false);
    }, 1500);
  };

  const shareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'TourSmile Flight Booking',
        text: `Flight booked successfully! Booking Reference: ${bookingData.bookingReference}`,
        url: window.location.href,
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(
        `Flight booked with TourSmile! Reference: ${bookingData.bookingReference} - ${bookingData.flight.airline} from ${bookingData.flight.origin} to ${bookingData.flight.destination}`
      );
      alert('Booking details copied to clipboard!');
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed! 🎉</h1>
          <p className="text-xl text-gray-600 mb-4">Your flight has been successfully booked</p>
          
          {/* Booking Reference */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Booking Reference</h2>
            <div className="text-3xl font-bold text-blue-600 tracking-wider">
              {bookingData.bookingReference}
            </div>
            <p className="text-sm text-gray-500 mt-2">Save this reference number for future use</p>
          </div>

          {/* Email Status */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${emailSent ? 'bg-green-500' : 'bg-yellow-500'}`}>
              {emailSent ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              )}
            </div>
            <span className={`text-sm font-medium ${emailSent ? 'text-green-600' : 'text-yellow-600'}`}>
              {emailSent ? 'Confirmation email sent' : 'Sending confirmation email...'}
            </span>
          </div>
        </div>

        {/* Flight Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Flight Details</h2>
          
          {/* Flight Info Header */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {bookingData.flight?.airline?.substring(0, 2) || 'AI'}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">{bookingData.flight?.airline}</h3>
                <p className="text-gray-600">{bookingData.flight?.flightNumber} • {bookingData.flight?.aircraft}</p>
                <p className="text-sm text-green-600 font-medium">{bookingData.selectedFare?.name} Fare</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{formatPrice(bookingData.finalPrice)}</p>
              <p className="text-sm text-gray-500">{bookingData.passengers.length} passenger(s)</p>
            </div>
          </div>

          {/* Route Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Departure */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{formatTime(bookingData.flight?.departure?.time)}</div>
              <div className="text-lg font-semibold text-gray-700">{bookingData.flight?.origin}</div>
              <div className="text-sm text-gray-500">{formatDate(bookingData.flight?.date)}</div>
            </div>

            {/* Flight Duration */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div className="flex-1 h-1 bg-blue-600 mx-4"></div>
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L3 9h4v9h6V9h4l-7-7z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-600">{bookingData.flight?.duration}</div>
                <div className="text-xs text-green-600">Non-stop</div>
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{formatTime(bookingData.flight?.arrival?.time)}</div>
              <div className="text-lg font-semibold text-gray-700">{bookingData.flight?.destination}</div>
              <div className="text-sm text-gray-500">{formatDate(bookingData.flight?.date)}</div>
            </div>
          </div>

          {/* Passengers List */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Passengers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookingData.passengers.map((passenger, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">
                      {passenger.title} {passenger.firstName} {passenger.lastName}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{passenger.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Payment Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare</span>
                  <span>{formatPrice((bookingData.selectedFare?.price || 0) * bookingData.passengers.length)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span>{formatPrice(Math.round((bookingData.selectedFare?.price || 0) * bookingData.passengers.length * 0.12))}</span>
                </div>
                {bookingData.promo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({bookingData.promo.code})</span>
                    <span>-{formatPrice(bookingData.promo.discount)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total Paid</span>
                  <span className="text-blue-600">{formatPrice(bookingData.finalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-900">Payment Successful</p>
                    <p className="text-sm text-green-700">Razorpay Gateway</p>
                  </div>
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Payment ID: {bookingData.payment.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Download Ticket */}
          <button
            onClick={downloadTicket}
            disabled={downloadingTicket}
            className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
          >
            {downloadingTicket ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download E-Ticket
              </>
            )}
          </button>

          {/* Share Booking */}
          <button
            onClick={shareBooking}
            className="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share Booking
          </button>

          {/* Book Another Flight */}
          <button
            onClick={onStartOver}
            className="flex items-center justify-center px-6 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Book Another Flight
          </button>
        </div>

        {/* Important Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-yellow-900 mb-4">✈️ Important Travel Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
            <div>
              <h4 className="font-semibold mb-2">Before You Travel:</h4>
              <ul className="space-y-1">
                <li>• Check-in online 24 hours before departure</li>
                <li>• Carry valid government-issued photo ID</li>
                <li>• Arrive at airport 2 hours before domestic flights</li>
                <li>• Check baggage weight limits with airline</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contact Support:</h4>
              <ul className="space-y-1">
                <li>• Email: support@toursmile.com</li>
                <li>• Phone: +91-9876543210</li>
                <li>• 24/7 customer support available</li>
                <li>• Cancellation/modification policies apply</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <p className="mb-2">Thank you for choosing TourSmile!</p>
          <p className="text-sm">Your journey begins with us. Safe travels! ✈️</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;