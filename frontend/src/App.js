import React, { useState, useRef, useEffect, useMemo } from 'react';
import './App.css';

// TOURSMILE HOMEPAGE - CLEAN WORKING IMPLEMENTATION
// Mobile-first responsive with proper breakpoints

// Airport data
const POPULAR_AIRPORTS = [
  { city: "Mumbai", iata: "BOM", airport: "Chhatrapati Shivaji Maharaj Intl", country: "IN" },
  { city: "Delhi", iata: "DEL", airport: "Indira Gandhi Intl", country: "IN" },
  { city: "Bengaluru", iata: "BLR", airport: "Kempegowda Intl", country: "IN" },
  { city: "Hyderabad", iata: "HYD", airport: "Rajiv Gandhi Intl", country: "IN" },
  { city: "Pune", iata: "PNQ", airport: "Pune Intl", country: "IN" },
  { city: "Chennai", iata: "MAA", airport: "Chennai Intl", country: "IN" },
  { city: "Kolkata", iata: "CCU", airport: "Netaji Subhas Chandra Bose Intl", country: "IN" },
  { city: "Dubai", iata: "DXB", airport: "Dubai International", country: "AE" },
  { city: "Singapore", iata: "SIN", airport: "Singapore Changi", country: "SG" },
  { city: "Bangkok", iata: "BKK", airport: "Suvarnabhumi", country: "TH" }
];

// Debounced hook
function useDebounced(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// City Input Component with Working Dropdown Suggestions
function CityInput({ label, value, onChange, onNext, autoFocus = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounced(query, 300);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const abortController = useRef(null);
  
  // Backend base URL from environment
  const backendBase = process.env.REACT_APP_BACKEND_URL;
  
  // Popular airports for dropdown display
  const popularAirports = [
    { city: "Pune", airport: "Pune Intl", iata: "PNQ", country: "IN" },
    { city: "Mumbai", airport: "Chhatrapati Shivaji Maharaj Intl", iata: "BOM", country: "IN" },
    { city: "Delhi", airport: "Indira Gandhi Intl", iata: "DEL", country: "IN" },
    { city: "Bengaluru", airport: "Kempegowda Intl", iata: "BLR", country: "IN" },
    { city: "Hyderabad", airport: "Rajiv Gandhi Intl", iata: "HYD", country: "IN" },
    { city: "Chennai", airport: "Chennai Intl", iata: "MAA", country: "IN" },
    { city: "Kolkata", airport: "Netaji Subhash Chandra Bose Intl", iata: "CCU", country: "IN" },
    { city: "Ahmedabad", airport: "Sardar Vallabhbhai Patel Intl", iata: "AMD", country: "IN" },
    { city: "Goa", airport: "Manohar Intl", iata: "GOX", country: "IN" },
    { city: "Kochi", airport: "Cochin Intl", iata: "COK", country: "IN" }
  ];
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Auto-focus when autoFocus prop changes
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Handle search when user types - FIXED LOGIC with value check
  useEffect(() => {
    // Don't show suggestions if field already has a selected value
    if (value) {
      setOpen(false);
      setSuggestions([]);
      return;
    }
    
    if (debouncedQuery && debouncedQuery.length >= 1) {
      console.log('Searching for:', debouncedQuery); // Debug log
      
      // Search in popular airports first
      const localMatches = popularAirports.filter(airport => 
        airport.city.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        airport.iata.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        airport.airport.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
      
      console.log('Local matches found:', localMatches); // Debug log
      
      if (localMatches.length > 0) {
        setSuggestions(localMatches);
        setOpen(true);
      } else {
        // Search via API if no local matches
        searchAirports(debouncedQuery);
      }
    } else if (open && !debouncedQuery) {
      // Show popular destinations when dropdown is open but no query
      setSuggestions(popularAirports);
    } else if (!debouncedQuery) {
      setSuggestions([]);
      setOpen(false);
    }
  }, [debouncedQuery, open, value]); // Added value to dependency array
  
  const searchAirports = async (searchQuery) => {
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    setLoading(true);
    
    try {
      const urlBase = backendBase || (window.__BACKEND_URL__ || (window.ENV && window.ENV.REACT_APP_BACKEND_URL));
      if (!urlBase) {
        throw new Error('Backend URL not configured');
      }
      
      const response = await fetch(
        `${urlBase}/api/airports/search?query=${encodeURIComponent(searchQuery)}&limit=6`,
        {
          signal: abortController.current.signal,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSuggestions(data.results || []);
      setOpen(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Airport search error:', error);
        setSuggestions(popularAirports.filter(airport => 
          (airport.city + " " + airport.iata + " " + airport.airport).toLowerCase().includes(searchQuery.toLowerCase())
        ));
        setOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset mobile zoom when input loses focus
  const handleInputBlur = () => {
    if (window.innerWidth <= 767) {
      setTimeout(() => {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      }, 100);
    }
  };

  const handleInputFocus = () => {
    // Only show dropdown if field is completely empty (no value selected)
    if (!value && !query) {
      setSuggestions(popularAirports);
      setOpen(true);
    }
  };

  const handleInputClick = () => {
    // Show popular destinations on click only if field is completely empty
    if (!query && !value) {
      setSuggestions(popularAirports);
      setOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    
    // Only show suggestions when actively typing in THIS field and field has no selected value
    if (inputValue.length === 0) {
      if (!value) {
        setSuggestions(popularAirports);
        setOpen(true);
      } else {
        setOpen(false);
        setSuggestions([]);
      }
    } else if (!value) {
      // Only show suggestions if no city is already selected
      setOpen(true);
    }
  };

  const handleCitySelect = (city) => {
    // Set the selected city
    onChange(city);
    setQuery(city.city);
    
    // IMMEDIATELY close dropdown
    setOpen(false);
    setSuggestions([]);
    
    // Clear any ongoing search
    if (abortController.current) {
      abortController.current.abort();
    }
    
    // Progress to next field with slight delay for smooth UX
    setTimeout(() => {
      if (onNext) {
        onNext();
      }
    }, 200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleCitySelect(suggestions[0]);
      } else if (onNext) {
        onNext();
      }
    }
  };
  
  const displayValue = query || (value && value.city ? value.city : "");
  
  return (
    <div ref={containerRef} className="relative" style={{ minWidth: 0, maxWidth: '100%', position: 'relative' }}>
      <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
      <div 
        className="h-12 rounded-xl border border-neutral-300 flex items-center px-3 hover:border-neutral-400 transition-colors focus-within:border-neutral-400"
        style={{ minWidth: 0, maxWidth: '100%', width: '100%', position: 'relative' }}
      >
        <span className="h-4 w-4 text-neutral-500 mr-2 flex-shrink-0">✈️</span>
        <input
          ref={inputRef}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onClick={handleInputClick}
          onKeyPress={handleKeyPress}
          placeholder="Type city or code"
          className="outline-none bg-transparent text-sm flex-1 border-none focus:outline-none focus:ring-0 focus:border-none"
          style={{ 
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
            minWidth: 0,
            maxWidth: '100%',
            width: '100%',
            fontSize: '16px'
          }}
          readOnly={!!value} // Make input read-only if value is selected
        />
        {value && value.iata && (
          <span className="text-[11px] text-neutral-500 font-mono uppercase ml-2 flex-shrink-0">{value.iata}</span>
        )}
        {(query || value) && (
          <button
            onClick={() => { 
              setQuery(""); 
              onChange(null); 
              setOpen(false); 
              setSuggestions([]);
              // Focus the input after clearing
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }, 100);
            }}
            className="ml-1 text-neutral-400 hover:text-neutral-600 flex-shrink-0"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Dropdown - PORTAL APPROACH FOR VISIBILITY */}
      {open && suggestions.length > 0 && (
        <>
          {/* Invisible positioning div */}
          <div 
            id={`dropdown-anchor-${label.toLowerCase()}`}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              height: '1px',
              zIndex: 1
            }}
          />
          {/* Visible dropdown with fixed positioning */}
          <div 
            className="suggestions-dropdown"
            style={{ 
              position: 'fixed',
              top: `${(containerRef.current?.getBoundingClientRect().bottom || 0) + 4}px`,
              left: `${containerRef.current?.getBoundingClientRect().left || 0}px`,
              width: `${containerRef.current?.getBoundingClientRect().width || 300}px`,
              zIndex: 99999,
              backgroundColor: 'white',
              border: '2px solid #3b82f6',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              maxHeight: '320px',
              overflowY: 'auto'
            }}
          >
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-t-lg">
              {!query ? '✈️ Popular Destinations' : `🔍 Search results for "${query}"`}
            </div>
            
            {suggestions.map((airport, i) => (
              <button
                key={`${airport.iata}-${i}`}
                onClick={() => handleCitySelect(airport)}
                className="w-full text-left px-4 py-4 hover:bg-blue-50 flex items-center justify-between border-b border-neutral-100 last:border-b-0 transition-all duration-200"
                style={{ 
                  display: 'flex',
                  backgroundColor: 'white',
                  minHeight: '60px'
                }}
              >
                <div className="flex-1">
                  <div className="text-base font-bold text-neutral-900 mb-1">
                    {airport.city}
                  </div>
                  <div className="text-xs text-neutral-600">{airport.airport}</div>
                </div>
                <div className="text-lg font-bold text-white bg-blue-500 px-3 py-2 rounded-lg">
                  {airport.iata}
                </div>
              </button>
            ))}
            
            {loading && (
              <div className="px-4 py-4 text-sm text-neutral-500 text-center bg-yellow-50">
                ⏳ Searching airports...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Date Input Component with FIXED date formatting and selection
function DateInput({ label, value, onChange, title, disabled, autoFocus = false }) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const ref = useRef(null);
  const buttonRef = useRef(null);
  
  // Auto-focus when autoFocus prop changes
  useEffect(() => {
    if (autoFocus && buttonRef.current && !disabled) {
      buttonRef.current.focus();
      // Auto-open the calendar
      setTimeout(() => setOpen(true), 200);
    }
  }, [autoFocus, disabled]);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addMonths = (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  };

  // Format date to DDMMYYYY
  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  // Convert date to display format DD MMM YYYY
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return (
      <div>
        <div className="grid grid-cols-7 text-xs text-neutral-500 mb-1">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => 
            <div key={day} className="py-1 text-center">{day}</div>
          )}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            // FIXED: Use local date string to avoid timezone issues
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            const isCurrentMonth = date.getMonth() === month;
            const isSelected = value && value === dateStr;
            const isToday = new Date().toDateString() === date.toDateString();
            
            return (
              <button 
                key={i} 
                onClick={() => { 
                  console.log('Selected date:', dateStr); // Debug log
                  onChange(dateStr); 
                  setOpen(false); 
                }}
                className={`aspect-square rounded-md text-sm flex items-center justify-center transition-colors ${
                  date.getMonth() === currentMonth.getMonth() ? "text-neutral-900" : "text-neutral-400"
                } ${
                  isSelected ? "bg-blue-600 text-white font-semibold" : 
                  isToday ? "bg-blue-100 text-blue-700 font-medium" :
                  "hover:bg-neutral-50"
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} className="relative">
      <label className="sr-only">{title}</label>
      <button 
        ref={buttonRef}
        disabled={disabled} 
        onClick={() => !disabled && setOpen(true)} 
        className="h-12 w-full px-4 rounded-xl border border-neutral-300 text-left hover:bg-neutral-50 flex items-center justify-between disabled:opacity-50"
      >
        <span className="text-sm text-neutral-700">
          {value ? formatDateDisplay(value) : label}
        </span>
        <span className="h-4 w-4 text-neutral-500">📅</span>
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">{title}</div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} 
                className="p-1 rounded hover:bg-neutral-50"
              >
                ‹
              </button>
              <span className="text-sm">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
                className="p-1 rounded hover:bg-neutral-50"
              >
                ›
              </button>
            </div>
          </div>
          {renderCalendar()}
        </div>
      )}
    </div>
  );
}

// Passenger Row Component
function PaxRow({ label, hint, value, onInc, onDec }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium" style={{ fontWeight: '500' }}>{label}</div>
        <div className="text-xs text-neutral-500" style={{ fontWeight: '300' }}>{hint}</div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onDec} 
          className="h-10 w-10 rounded-full border border-neutral-300 hover:bg-neutral-50 flex items-center justify-center text-lg"
        >
          −
        </button>
        <div className="w-8 text-center text-sm">{value}</div>
        <button 
          onClick={onInc} 
          className="h-10 w-10 rounded-full border border-neutral-300 hover:bg-neutral-50 flex items-center justify-center text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}

// Passenger Overlay Component
function PaxOverlay({ value, onChange, onClose }) {
  const [pax, setPax] = useState(value);
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ref.current?.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);
  
  const updatePax = (key, newValue) => setPax(prev => ({ ...prev, [key]: newValue }));
  const increment = (key) => updatePax(key, Math.min(9, pax[key] + 1));
  const decrement = (key) => updatePax(key, Math.max(key === 'adt' ? 1 : 0, pax[key] - 1));
  
  useEffect(() => {
    if (pax.inf > pax.adt) updatePax('inf', pax.adt);
    if (pax.adt < 1) updatePax('adt', 1);
  }, [pax.adt, pax.inf]);

  return (
    <div className="fixed inset-0 z-40 bg-black/20 flex items-end md:items-center md:justify-center">
      <div ref={ref} className="w-full md:w-[32rem] bg-white rounded-t-2xl md:rounded-2xl shadow-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-base font-medium" style={{ fontWeight: '500' }}>Travellers & Class</div>
          <button 
            onClick={onClose} 
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Close
          </button>
        </div>
        <div className="space-y-3">
          <PaxRow label="Adults (12+)" hint="Ages 12+" value={pax.adt} onInc={() => increment('adt')} onDec={() => decrement('adt')} />
          <PaxRow label="Children (2–11)" hint="Ages 2–11" value={pax.chd} onInc={() => increment('chd')} onDec={() => decrement('chd')} />
          <PaxRow label="Infants (0–1)" hint="On lap" value={pax.inf} onInc={() => increment('inf')} onDec={() => decrement('inf')} />
          <div className="pt-2">
            <div className="text-sm font-medium mb-1" style={{ fontWeight: '500' }}>Cabin Class</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["Economy", "Premium Economy", "Business", "First"].map((cabin) => (
                <button 
                  key={cabin} 
                  onClick={() => updatePax('cabin', cabin)} 
                  className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                    pax.cabin === cabin ? "border-blue-400 bg-blue-50" : "border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {cabin}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-neutral-700">
            {pax.adt}A, {pax.chd}C, {pax.inf}Inf · {pax.cabin}
          </div>
          <button 
            onClick={() => { onChange(pax); onClose(); }} 
            className="h-10 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// Search Card Component
// Search Card Component with Auto-focus Guidance
function SearchCard() {
  const [trip, setTrip] = useState("OW"); // Default to One Way
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [depart, setDepart] = useState(null);
  const [ret, setRet] = useState(null);
  const [openPax, setOpenPax] = useState(false);
  const [pax, setPax] = useState({ adt: 1, chd: 0, inf: 0, cabin: "Economy" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // 0: from, 1: to, 2: date, 3: passenger, 4: search

  // Backend base URL from environment
  const backendBase = process.env.REACT_APP_BACKEND_URL;

  // Auto-focus progression handlers
  const handleFromComplete = () => {
    setCurrentStep(1); // Move to "To" field
  };

  const handleToComplete = () => {
    setCurrentStep(2); // Move to date field  
  };

  const handleDateComplete = () => {
    setCurrentStep(3); // Move to passenger selection
    // Auto-open passenger selector after date selection
    setTimeout(() => {
      setOpenPax(true);
    }, 300);
  };

  const handlePassengerComplete = () => {
    setCurrentStep(4); // Enable search button glow
  };

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="rounded-2xl shadow-sm border border-neutral-200 bg-white p-4 md:p-6">
        {/* Trip Type Tabs */}
        <div className="inline-flex rounded-full bg-neutral-100 p-1">
          {[
            { id: "OW", label: "One Way" },
            { id: "RT", label: "Round Trip" },
            { id: "MC", label: "Multi City" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTrip(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                trip === tab.id ? "bg-white shadow-sm" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* From/To Row - MOBILE OPTIMIZED Horizontal Layout */}
        <div className="mt-4 mobile-horizontal" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 44px 1fr', 
          gap: '6px', 
          alignItems: 'end',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <div style={{ minWidth: 0, maxWidth: '100%' }}>
            <CityInput 
              label="From" 
              value={from} 
              onChange={setFrom}
              onNext={handleFromComplete}
              autoFocus={currentStep === 0}
            />
          </div>
          
          <button
            aria-label="Swap From and To"
            onClick={() => { const temp = from; setFrom(to); setTo(temp); }}
            className="h-11 w-11 mx-auto rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center"
            style={{ 
              flexShrink: 0,
              minWidth: '44px',
              maxWidth: '44px',
              height: '44px',
              width: '44px'
            }}
          >
            <span className="text-lg">⇄</span>
          </button>
          
          <div style={{ minWidth: 0, maxWidth: '100%' }}>
            <CityInput 
              label="To" 
              value={to} 
              onChange={setTo}
              onNext={handleToComplete}
              autoFocus={currentStep === 1}
            />
          </div>
        </div>

        {/* Date and Passenger Row */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <DateInput 
            label="Select Date" 
            value={depart} 
            onChange={(date) => { setDepart(date); handleDateComplete(); }}
            title="Departure" 
            autoFocus={currentStep === 2}
          />
          {trip !== "OW" && (
            <DateInput label="Select Date" value={ret} onChange={setRet} title="Return" disabled={trip === "OW"} />
          )}
          <div>
            <label className="sr-only">Travellers & Class</label>
            <button
              onClick={() => setOpenPax(true)}
              className="h-12 w-full px-4 rounded-xl border border-neutral-300 text-left hover:bg-neutral-50 flex items-center justify-between"
            >
              <span className="text-sm text-neutral-700">
                {pax.adt} Adult{pax.adt > 1 ? "s" : ""}{pax.chd ? `, ${pax.chd} Child${pax.chd > 1 ? "ren" : ""}` : ""}{pax.inf ? `, ${pax.inf} Infant${pax.inf > 1 ? "s" : ""}` : ""} · {pax.cabin}
              </span>
              <span className="h-4 w-4 text-neutral-500">▼</span>
            </button>
            {openPax && (
              <PaxOverlay onClose={() => setOpenPax(false)} value={pax} onChange={setPax} />
            )}
          </div>
        </div>

        {/* Options */}
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4" /> Direct flights only
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4" /> Flexible dates ±3 days
          </label>
        </div>

        {/* Search Button - Compact & Centered with Glow Effect */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={async () => {
              setError(null);
              setResults(null);
              if (!from || !to) {
                alert('Please select both departure and destination cities');
                return;
              }
              if (!depart) {
                alert('Please select a departure date');
                return;
              }
              try {
                setLoading(true);
                const urlBase = backendBase || (window.__BACKEND_URL__ || (window.ENV && window.ENV.REACT_APP_BACKEND_URL));
                if (!urlBase) {
                  throw new Error('Backend URL not configured');
                }
                const payload = {
                  origin: from.city,
                  destination: to.city,
                  departure_date: depart,
                  return_date: trip !== 'OW' ? ret : null,
                  passengers: pax.adt + pax.chd + pax.inf,
                  class_type: (pax.cabin || 'Economy').toLowerCase().includes('business') ? 'business' : (pax.cabin || 'Economy').toLowerCase().includes('first') ? 'first' : 'economy',
                  timePreference: null,
                  flexibleDates: false,
                  nearbyAirports: false,
                  corporateBooking: false,
                  budgetRange: null
                };
                const res = await fetch(`${urlBase}/api/flights/search`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                if (!res.ok) {
                  const txt = await res.text();
                  throw new Error(`Search failed (${res.status}): ${txt}`);
                }
                const data = await res.json();
                setResults(data);
              } catch (e) {
                console.error('Search error', e);
                setError(e.message || 'Search failed');
              } finally {
                setLoading(false);
              }
            }}
            className={`px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 ${
              currentStep === 3 && from && to && depart ? 'ring-2 ring-blue-300 shadow-lg' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Searching…' : 'Search Flights'}
          </button>
        </div>

        {/* Results */}
        {error && (
          <div className="mt-4 p-3 rounded-lg border border-red-200 text-red-700 bg-red-50 text-sm">
            {error}
          </div>
        )}
        {results && (
          <div className="mt-6">
            <div className="text-sm text-neutral-700 mb-2">
              {results.total_found} flights found · Source: {results.data_source}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {(results.flights || []).map((f, idx) => (
                <div key={idx} className="rounded-xl border border-neutral-200 p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{f.airline || f.airline_name || 'Flight'}</div>
                    <div className="text-sm font-semibold">₹{(f.price || f.lowest_fare || 0).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">
                    {f.origin} → {f.destination} · {f.departure_time} → {f.arrival_time} · {f.duration}
                  </div>
                  {f.fare_options && f.fare_options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {f.fare_options.slice(0, 3).map((fo, i) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {fo.fareType || fo.name}: ₹{fo.totalPrice?.toLocaleString?.() || fo.totalPrice}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {results.ai_recommendation && (
              <div className="mt-4 p-3 rounded-lg border border-blue-200 bg-blue-50 text-sm text-blue-800">
                💡 {results.ai_recommendation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Footer Component  
function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 pt-8">
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-medium mb-2" style={{ fontWeight: '500' }}>About</div>
          <ul className="space-y-1 text-neutral-600" style={{ fontWeight: '300' }}>
            <li><a href="#" className="hover:text-neutral-900">Company</a></li>
            <li><a href="#" className="hover:text-neutral-900">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2" style={{ fontWeight: '500' }}>Help</div>
          <ul className="space-y-1 text-neutral-600" style={{ fontWeight: '300' }}>
            <li><a href="#" className="hover:text-neutral-900">Support</a></li>
            <li><a href="#" className="hover:text-neutral-900">FAQ</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2" style={{ fontWeight: '500' }}>Policies</div>
          <ul className="space-y-1 text-neutral-600" style={{ fontWeight: '300' }}>
            <li><a href="#" className="hover:text-neutral-900">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-neutral-900">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-neutral-900">Cancellation & Refund</a></li>
            <li><a href="#" className="hover:text-neutral-900">Cookie Policy</a></li>
            <li><a href="#" className="hover:text-neutral-900">Disclaimer</a></li>
            <li><a href="#" className="hover:text-neutral-900">Grievance Officer</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2" style={{ fontWeight: '500' }}>Follow</div>
          <ul className="space-y-1 text-neutral-600" style={{ fontWeight: '300' }}>
            <li><a href="#" className="hover:text-neutral-900">Instagram</a></li>
            <li><a href="#" className="hover:text-neutral-900">Twitter</a></li>
            <li><a href="#" className="hover:text-neutral-900">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-neutral-500">
        © {new Date().getFullYear()} TourSmile. All rights reserved.
      </div>
    </footer>
  );
}

// Main App Component
function App() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-xl">
            <img 
              src="https://customer-assets.emergentagent.com/job_pixel-perfect-ui-12/artifacts/7qb5obai_FINAL%20LOGO%20-%20Copy.png"
              alt="TourSmile"
              className="h-10 w-auto"
            />
          </div>
          
          {/* Navigation - Hidden on mobile, flex on desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {[
              { label: "Flights", icon: "✈️" },
              { label: "Hotels", icon: "🏨" },
              { label: "Packages", icon: "🎁" },
              { label: "Activities", icon: "🎟️" },
            ].map((tab, i) => (
              <button
                key={i}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                  i === 0 ? "bg-blue-50 text-blue-700" : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <span className="opacity-90">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-full border border-neutral-300 text-sm hover:bg-neutral-50">
              24×7 Support
            </button>
            <button className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-sm">
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pb-24">
        {/* Hero Section */}
        <section className="text-center pt-14 md:pt-20 pb-8">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ letterSpacing: '-0.75px' }}>
            Book Your Perfect Flight
          </h1>
          <p className="mt-3 text-neutral-600">
            Smart search, best fares, effortless travel
          </p>
        </section>
        
        {/* Search Card */}
        <SearchCard />

        {/* Trust Section - Responsive Grid */}
        <section className="mt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
            {[
              { icon: "🔒", t: "Secure Booking", s: "SSL encrypted payments" },
              { icon: "💬", t: "24×7 Support", s: "WhatsApp & phone support" },
              { icon: "🎯", t: "Personal Travel Assistant", s: "AI-powered recommendations just for you" },
              { icon: "⚡", t: "Instant Booking", s: "Confirmed in seconds" },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 p-4 bg-white hover:shadow-sm transition-shadow">
                <div className="text-2xl mb-2" aria-hidden>{item.icon}</div>
                <div className="text-sm font-medium" style={{ fontWeight: '500' }}>{item.t}</div>
                <div className="text-xs text-neutral-600 mt-0.5" style={{ fontWeight: '300' }}>{item.s}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}

export default App;