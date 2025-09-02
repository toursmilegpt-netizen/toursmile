import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// TOURSMILE FLIGHT PAGE - EXACT IMPLEMENTATION 
// PIXEL PERFECT - NO MODIFICATIONS OR INTERPRETATIONS

const AIRPORTS_DATABASE = [
  // EXACT DATA STRUCTURE - NO CHANGES
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', popular: true },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', popular: true },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India', popular: true },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', popular: true },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', country: 'India', popular: true },
  { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', popular: true },
  { code: 'PNQ', name: 'Pune International Airport', city: 'Pune', country: 'India', popular: true },
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', country: 'India', popular: true },
  { code: 'GOI', name: 'Goa International Airport', city: 'Goa', country: 'India', popular: true },
  { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India', popular: true },
  { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', country: 'India', popular: true },
  { code: 'LKO', name: 'Chaudhary Charan Singh International Airport', city: 'Lucknow', country: 'India', popular: true },
  
  // INTERNATIONAL - EXACT LIST
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', popular: true },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', popular: true },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', popular: true },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', popular: true },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', popular: true },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', popular: true },
  { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'UK', popular: true },
  { code: 'LGW', name: 'London Gatwick Airport', city: 'London', country: 'UK', popular: true },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', popular: true },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', popular: true }
];

// CITY PICKER COMPONENT - EXACT IMPLEMENTATION
const CityPicker = ({ value, onSelect, label, placeholder, isOpen, onOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Load recent searches - EXACT FUNCTION
  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem('toursmile_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
    return [];
  };

  // Save recent search - EXACT FUNCTION
  const saveRecentSearch = (airport) => {
    try {
      let recents = loadRecentSearches();
      recents = recents.filter(item => item.code !== airport.code);
      recents.unshift({
        code: airport.code,
        name: airport.name,
        city: airport.city,
        country: airport.country,
        timestamp: Date.now()
      });
      recents = recents.slice(0, 5);
      localStorage.setItem('toursmile_recent_searches', JSON.stringify(recents));
      setRecentSearches(recents);
    } catch (error) {
      console.warn('Failed to save recent search:', error);
    }
  };

  // Clear recent searches - EXACT FUNCTION
  const clearRecentSearches = () => {
    try {
      localStorage.removeItem('toursmile_recent_searches');
      setRecentSearches([]);
    } catch (error) {
      console.warn('Failed to clear recent searches:', error);
    }
  };

  // Search cities - EXACT IMPLEMENTATION
  useEffect(() => {
    const searchCities = async () => {
      if (!query || query.length < 1) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // Debounced search - 150ms as specified
      setTimeout(() => {
        const filtered = AIRPORTS_DATABASE.filter(airport =>
          airport.city.toLowerCase().includes(query.toLowerCase()) ||
          airport.name.toLowerCase().includes(query.toLowerCase()) ||
          airport.code.toLowerCase().includes(query.toLowerCase())
        );

        // Sort by relevance - EXACT ALGORITHM
        const sorted = filtered.sort((a, b) => {
          const aExact = a.city.toLowerCase().startsWith(query.toLowerCase());
          const bExact = b.city.toLowerCase().startsWith(query.toLowerCase());
          
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          return a.city.localeCompare(b.city);
        });

        setSearchResults(sorted.slice(0, 8));
        setIsLoading(false);
      }, 150);
    };

    searchCities();
  }, [query]);

  // Load recents on mount
  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);

  // Handle selection - EXACT FUNCTION
  const handleSelect = (airport) => {
    saveRecentSearch(airport);
    onSelect(airport);
    onClose();
  };

  // Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  // Handle escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="city-picker-overlay">
      <div className="city-picker-backdrop" onClick={onClose}></div>
      <div className="city-picker-container">
        {/* Header Section - EXACT */}
        <div className="city-picker-header">
          <h3 className="picker-title">Select {label}</h3>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close city picker"
          >
            ×
          </button>
        </div>

        {/* Search Input Section - EXACT */}
        <div className="search-input-container">
          <svg className="search-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search cities or airports..."
            className="search-input-field"
            autoComplete="off"
          />
        </div>

        {/* Results Container */}
        <div className="search-results-container">
          {/* Recent Searches Section - EXACT */}
          {!query && recentSearches.length > 0 && (
            <div className="recent-searches-section">
              <div className="recent-header">
                <span>Recent Searches</span>
                <button className="clear-recent-button" onClick={clearRecentSearches}>
                  Clear
                </button>
              </div>
              {recentSearches.map((airport, index) => (
                <div
                  key={`recent-${index}`}
                  className="search-result-item recent-item"
                  onClick={() => handleSelect(airport)}
                >
                  <div className="result-icon">🕒</div>
                  <div className="result-content">
                    <div className="result-primary">{airport.city}, {airport.country}</div>
                    <div className="result-secondary">{airport.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Results - EXACT */}
          {query && (
            <>
              {isLoading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                  No cities found for "{query}"
                </div>
              ) : (
                searchResults.map((airport) => (
                  <div
                    key={airport.code}
                    className="search-result-item"
                    onClick={() => handleSelect(airport)}
                  >
                    <div className="result-icon">📍</div>
                    <div className="result-content">
                      <div className="result-primary">{airport.city}, {airport.country}</div>
                      <div className="result-secondary">{airport.name} ({airport.code})</div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Empty State */}
          {!query && recentSearches.length === 0 && (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔍</div>
              <div>Start typing to search cities and airports</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// CALENDAR OVERLAY COMPONENT - EXACT IMPLEMENTATION
const CalendarOverlay = ({ isOpen, onClose, onDateSelect, selectedDate, minDate, isReturn }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!isOpen) return null;

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    if (minDate && date < minDate) return true;
    
    return false;
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!isDateDisabled(selectedDate)) {
      onDateSelect(selectedDate);
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isDisabled = isDateDisabled(date);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-overlay">
      <div className="calendar-backdrop" onClick={onClose}></div>
      <div className="calendar-modal">
        <div className="modal-header">
          <h3 className="modal-title">{isReturn ? 'Return Date' : 'Departure Date'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="calendar-navigation">
          <button
            className="nav-button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          >
            ‹
          </button>
          <span className="month-year">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            className="nav-button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          >
            ›
          </button>
        </div>
        
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-grid">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
};

// PASSENGER SELECTOR OVERLAY - EXACT IMPLEMENTATION
const PassengerSelector = ({ 
  travellers, 
  onTravellersChange, 
  travelClass, 
  onClassChange, 
  isOpen, 
  onClose 
}) => {
  const [showGroupBooking, setShowGroupBooking] = useState(false);

  if (!isOpen) return null;

  const getTotalPassengers = () => {
    return travellers.adults + travellers.children + travellers.infants;
  };

  const updateCount = (type, increment) => {
    const current = travellers[type];
    let newCount;
    
    if (increment) {
      newCount = current + 1;
    } else {
      newCount = Math.max(type === 'adults' ? 1 : 0, current - 1);
    }
    
    const newTravellers = { ...travellers, [type]: newCount };
    
    // Validation
    if (type === 'infants' && newTravellers.infants > newTravellers.adults) {
      return;
    }
    
    const total = newTravellers.adults + newTravellers.children + newTravellers.infants;
    if (total > 9) {
      setShowGroupBooking(true);
      return;
    }
    
    onTravellersChange(newTravellers);
  };

  return (
    <>
      <div className="passenger-overlay">
        <div className="passenger-backdrop" onClick={onClose}></div>
        <div className="passenger-modal">
          <div className="passenger-header">
            <h3 className="passenger-title">Travelers & Class</h3>
            <button className="passenger-close" onClick={onClose}>×</button>
          </div>

          <div className="passenger-content">
            <div className="passenger-categories-fresh">
              {[
                { key: 'adults', label: 'Adults', age: '12+ years', min: 1 },
                { key: 'children', label: 'Children', age: '2–11 years', min: 0 },
                { key: 'infants', label: 'Infants', age: 'Under 2 years', min: 0 }
              ].map(({ key, label, age, min }) => (
                <div key={key} className="passenger-row-fresh">
                  <div className="passenger-info">
                    <div className="passenger-label">{label}</div>
                    <div className="passenger-age">{age}</div>
                  </div>
                  <div className="passenger-stepper">
                    <button
                      onClick={() => updateCount(key, false)}
                      disabled={travellers[key] <= min}
                      className="stepper-btn minus"
                    >
                      −
                    </button>
                    <span className="stepper-count">{travellers[key]}</span>
                    <button
                      onClick={() => updateCount(key, true)}
                      disabled={getTotalPassengers() >= 9}
                      className="stepper-btn plus"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="class-section-fresh">
              <h4 className="class-title">Travel Class</h4>
              <div className="class-options-fresh">
                {['Economy', 'Premium Economy', 'Business', 'First'].map((cls) => (
                  <button
                    key={cls}
                    onClick={() => onClassChange(cls)}
                    className={`class-option-fresh ${travelClass === cls ? 'active' : ''}`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            <div className="passenger-actions">
              <button onClick={onClose} className="apply-button">
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Group Booking Modal */}
      {showGroupBooking && (
        <div className="group-booking-overlay">
          <div className="group-backdrop" onClick={() => setShowGroupBooking(false)}></div>
          <div className="group-modal">
            <h3>Group Booking Request</h3>
            <p>For 10 or more passengers, please request a Group Booking</p>
            <button 
              onClick={() => setShowGroupBooking(false)}
              className="group-close-btn"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// FLIGHT SEARCH FORM - EXACT IMPLEMENTATION
const FlightSearchForm = () => {
  const [tripType, setTripType] = useState('round-trip');
  const [departure, setDeparture] = useState(null);
  const [destination, setDestination] = useState(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [travellers, setTravellers] = useState({ adults: 1, children: 0, infants: 0 });
  const [travelClass, setTravelClass] = useState('Economy');
  const [directFlights, setDirectFlights] = useState(false);
  const [flexibleDates, setFlexibleDates] = useState(false);
  
  // UI state
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState('departure');
  const [showPassengers, setShowPassengers] = useState(false);

  // REQUIRED FUNCTIONS - EXACT IMPLEMENTATION

  const openCityPicker = (field) => {
    if (field === 'from') {
      setShowFromPicker(true);
    } else {
      setShowToPicker(true);
    }
  };

  const closeCityPicker = () => {
    setShowFromPicker(false);
    setShowToPicker(false);
  };

  const swapLocations = () => {
    if (departure && destination) {
      const temp = departure;
      setDeparture(destination);
      setDestination(temp);
    }
  };

  const searchFlights = () => {
    if (!departure || !destination || !departureDate || (tripType === 'round-trip' && !returnDate)) {
      alert('Please fill all required fields');
      return;
    }

    console.log('Flight Search:', {
      tripType,
      departure: departure.code,
      destination: destination.code,
      departureDate: departureDate.toISOString().split('T')[0],
      returnDate: tripType === 'round-trip' ? returnDate?.toISOString().split('T')[0] : null,
      travellers,
      travelClass,
      directFlights,
      flexibleDates
    });
  };

  const isFormValid = () => {
    return departure && destination && departureDate && (tripType === 'one-way' || returnDate);
  };

  const getPassengerText = () => {
    const { adults, children, infants } = travellers;
    const parts = [];
    if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} Child${children > 1 ? 'ren' : ''}`);
    if (infants > 0) parts.push(`${infants} Infant${infants > 1 ? 's' : ''}`);
    return `${parts.length > 0 ? parts.join(', ') : '1 Adult'}, ${travelClass}`;
  };

  return (
    <div className="search-form">
      {/* Trip Type Tabs - EXACT */}
      <div className="trip-segmented-control">
        {['round-trip', 'one-way', 'multi-city'].map((type) => (
          <button
            key={type}
            onClick={() => setTripType(type)}
            className={`segment-option ${tripType === type ? 'active' : ''}`}
          >
            {type === 'round-trip' ? 'Round Trip' : type === 'one-way' ? 'One Way' : 'Multi City'}
          </button>
        ))}
      </div>

      {/* Location Inputs - EXACT SPECS */}
      <div className="route-row">
        <div className="direct-typing-field">
          <label className="field-label">FROM</label>
          <input
            type="text"
            value={departure?.city || ''}
            onClick={() => openCityPicker('from')}
            readOnly
            placeholder="City or airport"
            className="city-input"
          />
        </div>
        
        <button
          onClick={swapLocations}
          className="swap-button-fresh"
          disabled={!departure || !destination}
          aria-label="Swap From and To"
        >
          ⇄
        </button>
        
        <div className="direct-typing-field">
          <label className="field-label">TO</label>
          <input
            type="text"
            value={destination?.city || ''}
            onClick={() => openCityPicker('to')}
            readOnly
            placeholder="City or airport"
            className="city-input"
          />
        </div>
      </div>

      {/* Date and Passenger Row - EXACT SPECS */}
      <div className="date-row">
        <div className="date-field">
          <label className="field-label">DEPARTURE</label>
          <button
            onClick={() => {
              setCalendarType('departure');
              setShowCalendar(true);
            }}
            className="date-input-clean"
          >
            {departureDate ? departureDate.toLocaleDateString('en-GB', { 
              day: 'numeric', month: 'short', year: 'numeric' 
            }) : 'Select date'}
          </button>
        </div>

        {tripType === 'round-trip' && (
          <div className="date-field">
            <label className="field-label">RETURN</label>
            <button
              onClick={() => {
                setCalendarType('return');
                setShowCalendar(true);
              }}
              className="date-input-clean"
            >
              {returnDate ? returnDate.toLocaleDateString('en-GB', { 
                day: 'numeric', month: 'short', year: 'numeric' 
              }) : 'Select date'}
            </button>
          </div>
        )}

        <div className="passenger-field">
          <label className="field-label">PASSENGERS</label>
          <button
            onClick={() => setShowPassengers(true)}
            className="traveller-input-compact"
          >
            {getPassengerText()}
          </button>
        </div>
      </div>

      {/* Options Row */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={directFlights}
            onChange={(e) => setDirectFlights(e.target.checked)}
          />
          Direct flights
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={flexibleDates}
            onChange={(e) => setFlexibleDates(e.target.checked)}
          />
          Flexible dates ±3 days
        </label>
      </div>

      {/* Search Button - EXACT */}
      <button
        onClick={searchFlights}
        disabled={!isFormValid()}
        className={`search-button ${isFormValid() ? 'enabled' : 'disabled'}`}
      >
        Search Flights
      </button>

      {/* Overlays */}
      <CityPicker
        value={departure?.city || ''}
        onSelect={setDeparture}
        label="FROM"
        placeholder="City or airport"
        isOpen={showFromPicker}
        onOpen={() => setShowFromPicker(true)}
        onClose={() => setShowFromPicker(false)}
      />

      <CityPicker
        value={destination?.city || ''}
        onSelect={setDestination}
        label="TO"
        placeholder="City or airport"
        isOpen={showToPicker}
        onOpen={() => setShowToPicker(true)}
        onClose={() => setShowToPicker(false)}
      />

      <CalendarOverlay
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={(date) => {
          if (calendarType === 'departure') {
            setDepartureDate(date);
          } else {
            setReturnDate(date);
          }
          setShowCalendar(false);
        }}
        selectedDate={calendarType === 'departure' ? departureDate : returnDate}
        minDate={calendarType === 'return' ? departureDate : new Date()}
        isReturn={calendarType === 'return'}
      />

      <PassengerSelector
        travellers={travellers}
        onTravellersChange={setTravellers}
        travelClass={travelClass}
        onClassChange={setTravelClass}
        isOpen={showPassengers}
        onClose={() => setShowPassengers(false)}
      />
    </div>
  );
};

// MAIN APP COMPONENT - EXACT IMPLEMENTATION
function App() {
  return (
    <div className="App">
      {/* Header - EXACT SPECIFICATIONS */}
      <header className="app-header">
        <div className="header-container">
          <div className="header-main">
            <div className="logo-main"></div>
            
            <nav className="main-navigation">
              <button className="nav-link active">
                <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
                </svg>
                Flights
              </button>
              <button className="nav-link">
                <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V6H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" fill="currentColor"/>
                </svg>
                Hotels
              </button>
              <button className="nav-link">
                <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                </svg>
                Packages
              </button>
              <button className="nav-link">
                <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 10v6c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2v-6c0-1.11.89-2 2-2h16c1.11 0 2 .89 2 2zm-2 0H4v6h16v-6zM6 11h2v2H6v-2zm0 3h8v1H6v-1z" fill="currentColor"/>
                </svg>
                Activities
              </button>
            </nav>
          </div>
          
          <div className="header-actions">
            <button className="support-btn">24×7 Support</button>
            <button className="account-btn">Sign In</button>
          </div>
        </div>
      </header>

      {/* Hero Section - EXACT SPECS */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Book Your Perfect Flight</h1>
            <p className="hero-subtitle">Search and compare flights from 100+ airlines worldwide</p>
          </div>
          
          <div className="search-card-hero">
            <FlightSearchForm />
          </div>
        </div>
      </section>

      {/* Trust Section - EXACT EMOJI ICONS */}
      <section className="trust-section">
        <div className="trust-container">
          <div className="trust-indicators">
            <div className="trust-item">
              <div className="trust-icon">🔒</div>
              <div className="trust-content">
                <h3>Secure Booking</h3>
                <p>SSL encrypted payments</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📞</div>
              <div className="trust-content">
                <h3>24×7 Support</h3>
                <p>WhatsApp & phone support</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">✈️</div>
              <div className="trust-content">
                <h3>100+ Airlines</h3>
                <p>Best prices guaranteed</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">⚡</div>
              <div className="trust-content">
                <h3>Instant Booking</h3>
                <p>Confirmed in seconds</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations - EXACT */}
      <section className="destinations-section">
        <div className="section-container">
          <h2 className="section-title">Popular Destinations</h2>
          <div className="destinations-grid">
            {[
              { route: 'Delhi → Mumbai', price: '₹3,999', emoji: '🏙️', popular: true },
              { route: 'Bangalore → Hyderabad', price: '₹4,299', emoji: '🌆', popular: true },
              { route: 'Mumbai → Dubai', price: '₹12,999', emoji: '🏗️', popular: true }
            ].map((dest, index) => (
              <div key={index} className={`destination-card ${dest.popular ? 'popular' : ''}`}>
                <div className="dest-image">{dest.emoji}</div>
                <div className="dest-content">
                  <h3 className="dest-route">{dest.route}</h3>
                  <p className="dest-price">Starting from {dest.price}</p>
                  {dest.popular && <span className="popular-tag">POPULAR</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - LEGAL STANDARDS */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-section">
              <h4>About TourSmile</h4>
              <a href="#about">About Us</a>
              <a href="#careers">Careers</a>
              <a href="#press">Press</a>
              <a href="#blog">Blog</a>
            </div>
            <div className="footer-section">
              <h4>Help/Support</h4>
              <a href="#contact">Contact Us</a>
              <a href="#faq">FAQ</a>
              <a href="#help">Help Center</a>
              <a href="#support">24×7 Support</a>
            </div>
            <div className="footer-section">
              <h4>Legal/Policies</h4>
              <a href="#terms">Terms & Conditions</a>
              <a href="#privacy">Privacy Policy</a>
              <a href="#cancellation">Cancellation & Refund Policy</a>
              <a href="#cookies">Cookie Policy</a>
              <a href="#disclaimer">Disclaimer</a>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <a href="#facebook">Facebook</a>
              <a href="#twitter">Twitter</a>
              <a href="#instagram">Instagram</a>
              <a href="#linkedin">LinkedIn</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 TourSmile. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;