import React, { useState } from 'react';

const Header = ({ variant = 'default', searchParams, onEdit, onBack }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const isResultsMode = variant === 'results' || variant === 'loading';

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-[100] h-[64px]">
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* LEFT SECTION: Logo & Back Button */}
          <div className="flex items-center gap-4">
            {/* Mobile Back Button (Only in Results Mode) */}
            {isResultsMode && (
              <button 
                onClick={onBack}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}

            {/* Logo */}
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center hover:opacity-80 transition-opacity"
              title="Return to Homepage"
            >
              <img 
                src="https://customer-assets.emergentagent.com/job_flywise-search/artifacts/kdx1ncq0_FINAL%20LOGO.png"
                alt="TourSmile"
                className={`w-auto object-contain transition-all duration-300 ${
                  isResultsMode ? 'h-8 md:h-10' : 'h-10 md:h-12'
                }`}
              />
            </button>

            {/* DESKTOP SEARCH SUMMARY (Only in Results Mode) */}
            {isResultsMode && (
              <div className="hidden md:flex items-center gap-4 ml-6 border-l border-gray-200 pl-6 h-8">
                {/* Back Arrow for Desktop */}
                <button 
                  onClick={onBack}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                  title="Back to Search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>

                <div className="flex items-center gap-3 text-sm">
                  <div className="font-bold text-gray-900">
                    {searchParams?.from?.city || 'Origin'} 
                    <span className="mx-2 text-gray-400">→</span> 
                    {searchParams?.to?.city || 'Destination'}
                  </div>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <div className="text-gray-600 font-medium">
                    {formatDate(searchParams?.departDate) || 'Date'}
                  </div>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <div className="text-gray-600">
                    {searchParams?.passengers?.split(' ')[0] || '1'} Traveller
                  </div>
                </div>
              </div>
            )}

            {/* DEFAULT NAVIGATION (Only in Default Mode) */}
            {!isResultsMode && (
              <nav className="hidden md:flex space-x-6 ml-8">
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
            )}
          </div>
          
          {/* RIGHT SECTION: Actions */}
          <div className="flex items-center gap-3">
            {/* Edit Button (Only in Results Mode) */}
            {isResultsMode ? (
              <button 
                onClick={onEdit}
                className="text-blue-600 text-sm font-semibold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="hidden md:inline">Modify Search</span>
                <span className="md:hidden">Edit</span>
                <svg className="w-4 h-4 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            ) : (
              /* Default Actions (WhatsApp/Sign In) */
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                  <span className="hidden sm:inline text-sm font-medium">WhatsApp</span>
                </button>
                <button className="text-gray-700 hover:text-blue-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
