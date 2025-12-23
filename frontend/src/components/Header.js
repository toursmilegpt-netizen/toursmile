import React, { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo as Home Button (UX Standard) */}
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center hover:opacity-80 transition-opacity"
              title="Return to Homepage"
            >
              <img 
                src="https://customer-assets.emergentagent.com/job_flywise-search/artifacts/kdx1ncq0_FINAL%20LOGO.png"
                alt="TourSmile - Return to Homepage"
                className="h-10 sm:h-12 w-auto"
              />
            </button>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <button className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1 text-sm">
                Flights
              </button>
              <button className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                Hotels
              </button>
              <button className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                Tours
              </button>
            </nav>
          </div>
          
          {/* WhatsApp Support & Sign In */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button className="flex items-center space-x-1.5 text-green-600 hover:bg-green-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                <path d="M.109 24l1.645-6.015c-1.01-1.759-1.544-3.748-1.544-5.786 0-6.378 5.185-11.563 11.563-11.563 3.096 0 6.009 1.207 8.2 3.399 2.191 2.192 3.398 5.104 3.398 8.2-.001 6.379-5.185 11.564-11.564 11.564-2.015 0-3.986-.525-5.739-1.518l-5.959 1.719z"/>
              </svg>
              <span className="hidden sm:inline text-xs sm:text-sm font-medium">WhatsApp</span>
            </button>
            <button className="text-gray-700 hover:text-blue-600 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              Sign In
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
            <button className="block w-full text-left px-4 py-2 text-blue-600 font-semibold bg-blue-50 rounded-lg">
              Flights
            </button>
            <button className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              Hotels
            </button>
            <button className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              Tours
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
