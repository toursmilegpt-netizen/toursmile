import React from 'react';

const SearchLoader = ({ searchParams }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full bg-white">
      {/* Brand Logo Animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
          <img 
            src="https://customer-assets.emergentagent.com/job_flywise-search/artifacts/kdx1ncq0_FINAL%20LOGO.png"
            alt="TourSmile"
            className="h-12 w-auto object-contain"
          />
        </div>
        
        {/* Orbiting Plane */}
        <div className="absolute inset-0 w-full h-full animate-spin-slow">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg className="w-6 h-6 text-blue-600 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Premium Loading Text */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">Searching live flights...</h3>
      
      {/* Route Context */}
      <p className="text-gray-500 font-medium mb-8 text-center">
        {searchParams?.from?.city || 'Origin'} 
        <span className="mx-2">→</span> 
        {searchParams?.to?.city || 'Destination'}
      </p>

      {/* Progress Bar (Apple/MMT Style) */}
      <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-1/3 animate-indeterminate-bar rounded-full"></div>
      </div>
      
      {/* Trust Badges */}
      <div className="mt-12 flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-xs font-semibold text-gray-600">Live Prices</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          <span className="text-xs font-semibold text-gray-600">Secure</span>
        </div>
      </div>
    </div>
  );
};

export default SearchLoader;
