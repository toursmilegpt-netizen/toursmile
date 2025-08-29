import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// TOURSMILE FLIGHT SEARCH - FIGMA IMPLEMENTATION V1.0
// Mobile-first design: 390px frame width
// Colors: Primary Blue #4285F4, Accent Orange #FFA382

// Airport Database with IATA codes - as per backend integration
const AIRPORTS_DATABASE = [
  { code: 'DEL', name: 'Delhi', city: 'New Delhi', country: 'India', popular: true },
  { code: 'BOM', name: 'Mumbai', city: 'Mumbai', country: 'India', popular: true },
  { code: 'BLR', name: 'Bangalore', city: 'Bangalore', country: 'India', popular: true },
  { code: 'MAA', name: 'Chennai', city: 'Chennai', country: 'India', popular: true },
  { code: 'CCU', name: 'Kolkata', city: 'Kolkata', country: 'India', popular: true },
  { code: 'HYD', name: 'Hyderabad', city: 'Hyderabad', country: 'India', popular: true },
  { code: 'AMD', name: 'Ahmedabad', city: 'Ahmedabad', country: 'India', popular: true },
  { code: 'PNQ', name: 'Pune', city: 'Pune', country: 'India', popular: true },
  { code: 'GOI', name: 'Goa', city: 'Goa', country: 'India', popular: true },
  { code: 'JAI', name: 'Jaipur', city: 'Jaipur', country: 'India', popular: true },
  { code: 'DXB', name: 'Dubai', city: 'Dubai', country: 'UAE', popular: true },
  { code: 'SIN', name: 'Singapore', city: 'Singapore', country: 'Singapore', popular: true }
];

// Airport Autocomplete Component - Figma Specs Implementation
const AirportAutocomplete = ({ value, onChange, placeholder, label, isDestination = false, highlight = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [filteredAirports, setFilteredAirports] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter airports after typing 3 characters - as per interactivity specs
  useEffect(() => {
    if (inputValue.length >= 3) {
      const filtered = AIRPORTS_DATABASE.filter(airport =>
        airport.city.toLowerCase().includes(inputValue.toLowerCase()) ||
        airport.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        airport.code.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 6); // Show max 6 results
      setFilteredAirports(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredAirports([]);
      setIsOpen(false);
    }
  }, [inputValue]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const handleSelect = (airport) => {
    const selectedValue = `${airport.city} – ${airport.name} (${airport.code})`;
    setInputValue(selectedValue);
    onChange(airport);
    setIsOpen(false);
  };

  const handleFocus = () => {
    // Show popular routes immediately on focus if empty
    if (!inputValue && !isDestination) {
      setFilteredAirports(AIRPORTS_DATABASE.filter(a => a.popular).slice(0, 6));
      setIsOpen(true);
    }
  };

  return (
    <div className="airport-autocomplete" ref={dropdownRef}>
      <label className="field-label">{label}</label>
      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`airport-input ${highlight ? 'highlight' : ''}`}
          autoComplete="off"
        />
        
        {/* Dropdown with smooth fade/slide animation */}
        {isOpen && (
          <div className="airport-dropdown">
            {filteredAirports.map((airport) => (
              <div
                key={airport.code}
                onClick={() => handleSelect(airport)}
                className="airport-option"
              >
                <div className="airport-city">{airport.city} – {airport.name}</div>
                <div className="airport-code">({airport.code})</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Full-Screen Calendar Overlay - as per interactivity specs
const CalendarOverlay = ({ isOpen, onClose, onDateSelect, selectedDate, minDate, isReturn = false, departureDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOneWay, setIsOneWay] = useState(false);

  if (!isOpen) return null;

  const today = new Date();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const handleDateClick = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(selectedDate);
    
    // Auto-advance to return if departure is selected
    if (!isReturn && !isOneWay) {
      // Will auto-open return date picker in parent component
    } else {
      onClose();
    }
  };

  const isDateDisabled = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (minDate && date < minDate) return true;
    if (isReturn && departureDate && date <= departureDate) return true;
    return false;
  };

  const isToday = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === today.toDateString();
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const isCurrentToday = isToday(day);
      
      days.push(
        <div
          key={day}
          onClick={() => !disabled && handleDateClick(day)}
          className={`calendar-day ${disabled ? 'disabled' : ''} ${isCurrentToday ? 'today' : ''}`}
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
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="calendar-title">
            {isReturn ? 'Return Date' : 'Departure Date'}
          </div>
          
          {/* One-way toggle at top */}
          {!isReturn && (
            <div className="oneway-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={isOneWay}
                  onChange={(e) => setIsOneWay(e.target.checked)}
                />
                <span>One-way</span>
              </label>
            </div>
          )}
        </div>

        <div className="calendar-nav">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="calendar-nav-btn"
          >
            ‹
          </button>
          <div className="calendar-month">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="calendar-nav-btn"
          >
            ›
          </button>
        </div>

        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
};

// Travellers and Class Selector - with validation as per specs
const TravellersClassSelector = ({ travellers, onTravellersChange, travelClass, onClassChange, highlight = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateCount = (type, increment) => {
    const current = travellers[type];
    let newCount;
    
    if (increment) {
      newCount = current + 1;
    } else {
      newCount = Math.max(type === 'adults' ? 1 : 0, current - 1);
    }
    
    const newTravellers = { ...travellers, [type]: newCount };
    
    // Validation: infants ≤ adults
    if (type === 'infants' && newTravellers.infants > newTravellers.adults) {
      return;
    }
    
    // Validation: total ≤ 9
    const total = newTravellers.adults + newTravellers.children + newTravellers.infants;
    if (total > 9) {
      return;
    }
    
    onTravellersChange(newTravellers);
  };

  const getTotalPassengers = () => {
    return travellers.adults + travellers.children + travellers.infants;
  };

  const getDisplayText = () => {
    const total = getTotalPassengers();
    if (total > 9) {
      return "Group Booking Required";
    }
    return `${total} Traveller${total > 1 ? 's' : ''}, ${travelClass}`;
  };

  // Group booking for 10+ passengers
  if (getTotalPassengers() > 9) {
    return (
      <div className="group-booking-notice">
        <div className="group-booking-message">
          For 10 or more passengers, please request a Group Booking
        </div>
        <button className="group-booking-btn">
          Request Group Booking
        </button>
      </div>
    );
  }

  return (
    <div className="travellers-selector" ref={dropdownRef}>
      <label className="field-label">TRAVELLERS & CLASS</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`travellers-button ${highlight ? 'highlight' : ''}`}
      >
        <span>{getDisplayText()}</span>
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="travellers-dropdown">
          {/* Adults */}
          <div className="traveller-row">
            <div className="traveller-info">
              <div className="traveller-type">Adults</div>
              <div className="traveller-age">(12+)</div>
            </div>
            <div className="traveller-controls">
              <button
                type="button"
                onClick={() => updateCount('adults', false)}
                disabled={travellers.adults <= 1}
                className="stepper-btn"
              >
                -
              </button>
              <span className="traveller-count">{travellers.adults}</span>
              <button
                type="button"
                onClick={() => updateCount('adults', true)}
                className="stepper-btn"
              >
                +
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="traveller-row">
            <div className="traveller-info">
              <div className="traveller-type">Children</div>
              <div className="traveller-age">(2–11)</div>
            </div>
            <div className="traveller-controls">
              <button
                type="button"
                onClick={() => updateCount('children', false)}
                disabled={travellers.children <= 0}
                className="stepper-btn"
              >
                -
              </button>
              <span className="traveller-count">{travellers.children}</span>
              <button
                type="button"
                onClick={() => updateCount('children', true)}
                className="stepper-btn"
              >
                +
              </button>
            </div>
          </div>

          {/* Infants */}
          <div className="traveller-row">
            <div className="traveller-info">
              <div className="traveller-type">Infants</div>
              <div className="traveller-age">(&lt;2)</div>
            </div>
            <div className="traveller-controls">
              <button
                type="button"
                onClick={() => updateCount('infants', false)}
                disabled={travellers.infants <= 0}
                className="stepper-btn"
              >
                -
              </button>
              <span className="traveller-count">{travellers.infants}</span>
              <button
                type="button"
                onClick={() => updateCount('infants', true)}
                disabled={travellers.infants >= travellers.adults}
                className="stepper-btn"
              >
                +
              </button>
            </div>
          </div>

          {/* Travel Class */}
          <div className="class-selection">
            <div className="class-title">Travel Class</div>
            <div className="class-options">
              {['Economy', 'Premium Economy', 'Business', 'First'].map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => onClassChange(cls)}
                  className={`class-btn ${travelClass === cls ? 'active' : ''}`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Flight Search Form - Figma Implementation
const FlightSearchForm = ({ onSearch, isSearching }) => {
  // Form state
  const [tripType, setTripType] = useState('round-trip');
  const [departure, setDeparture] = useState(null);
  const [destination, setDestination] = useState(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [travellers, setTravellers] = useState({
    adults: 1,
    children: 0,
    infants: 0
  });
  const [travelClass, setTravelClass] = useState('Economy');

  // UI state
  const [currentField, setCurrentField] = useState('departure');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState('departure');

  // Guidance effects - highlight next field after selection
  const getFieldHighlight = (fieldName) => {
    return currentField === fieldName;
  };

  const handleDepartureSelect = (airport) => {
    setDeparture(airport);
    setCurrentField('destination');
  };

  const handleDestinationSelect = (airport) => {
    setDestination(airport);
    setCurrentField('departureDate');
    // Auto-open date picker after destination selection
    setTimeout(() => {
      setCalendarType('departure');
      setShowCalendar(true);
    }, 200);
  };

  const handleDepartureDateSelect = (date) => {
    setDepartureDate(date);
    setShowCalendar(false);
    
    if (tripType === 'round-trip') {
      // Auto-advance to return date
      setTimeout(() => {
        setCalendarType('return');
        setShowCalendar(true);
        setCurrentField('return');
      }, 300);
    } else {
      setCurrentField('travellers');
    }
  };

  const handleReturnDateSelect = (date) => {
    setReturnDate(date);
    setShowCalendar(false);
    setCurrentField('travellers');
  };

  const handleSwap = () => {
    const temp = departure;
    setDeparture(destination);
    setDestination(temp);
  };

  const handleSearch = () => {
    if (!departure || !destination || !departureDate || (tripType === 'round-trip' && !returnDate)) {
      alert('Please fill all required fields');
      return;
    }

    const searchData = {
      tripType,
      departure: departure.code,
      destination: destination.code,
      departureDate: departureDate.toISOString().split('T')[0],
      returnDate: tripType === 'round-trip' ? returnDate?.toISOString().split('T')[0] : null,
      travellers,
      travelClass
    };

    onSearch(searchData);
  };

  const isFormValid = departure && destination && departureDate && (tripType === 'one-way' || returnDate);

  return (
    <div className="flight-search-form">
      {/* Trip Type Toggle */}
      <div className="trip-type-selector">
        <button
          type="button"
          onClick={() => setTripType('round-trip')}
          className={`trip-type-btn ${tripType === 'round-trip' ? 'active' : ''}`}
        >
          Round Trip
        </button>
        <button
          type="button"
          onClick={() => setTripType('one-way')}
          className={`trip-type-btn ${tripType === 'one-way' ? 'active' : ''}`}
        >
          One Way
        </button>
      </div>

      {/* Route Selection */}
      <div className="route-selection">
        <div className="route-inputs">
          <AirportAutocomplete
            value={departure?.city || ''}
            onChange={handleDepartureSelect}
            placeholder="From"
            label="FROM"
            highlight={getFieldHighlight('departure')}
          />
          
          <button
            type="button"
            onClick={handleSwap}
            className="swap-button"
            disabled={!departure && !destination}
          >
            ⇄
          </button>
          
          <AirportAutocomplete
            value={destination?.city || ''}
            onChange={handleDestinationSelect}
            placeholder="To"
            label="TO"
            isDestination={true}
            highlight={getFieldHighlight('destination')}
          />
        </div>
      </div>

      {/* Date Selection */}
      <div className="date-selection">
        <div className="date-inputs">
          <div className="date-field">
            <label className="field-label">DEPARTURE</label>
            <button
              type="button"
              onClick={() => {
                setCalendarType('departure');
                setShowCalendar(true);
              }}
              className={`date-button ${getFieldHighlight('departureDate') ? 'highlight' : ''}`}
            >
              {departureDate ? departureDate.toLocaleDateString('en-GB') : 'Select Date'}
            </button>
          </div>

          {tripType === 'round-trip' && (
            <div className="date-field">
              <label className="field-label">RETURN</label>
              <button
                type="button"
                onClick={() => {
                  setCalendarType('return');
                  setShowCalendar(true);
                }}
                className={`date-button ${getFieldHighlight('return') ? 'highlight' : ''}`}
              >
                {returnDate ? returnDate.toLocaleDateString('en-GB') : 'Select Date'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Travellers and Class */}
      <TravellersClassSelector
        travellers={travellers}
        onTravellersChange={setTravellers}
        travelClass={travelClass}
        onClassChange={setTravelClass}
        highlight={getFieldHighlight('travellers')}
      />

      {/* Search Button - Sticky at bottom */}
      <div className="search-section">
        <button
          type="button"
          onClick={handleSearch}
          disabled={!isFormValid || isSearching}
          className={`search-button ${isFormValid ? 'enabled' : 'disabled'}`}
        >
          {isSearching ? (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              Searching...
            </div>
          ) : (
            'Search Flights'
          )}
        </button>
      </div>

      {/* Calendar Overlay */}
      <CalendarOverlay
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={calendarType === 'departure' ? handleDepartureDateSelect : handleReturnDateSelect}
        selectedDate={calendarType === 'departure' ? departureDate : returnDate}
        minDate={calendarType === 'departure' ? new Date() : departureDate}
        isReturn={calendarType === 'return'}
        departureDate={departureDate}
      />
    </div>
  );
};

// Main App Component
function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (searchData) => {
    setIsSearching(true);
    console.log('Flight Search Data:', searchData);
    
    try {
      // Connect to existing TripJack backend
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/search-flights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
      });
      
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        console.error('Search failed:', response.statusText);
        alert('Search failed. Please try again.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="App">
      {/* Trust Strip */}
      <div className="trust-strip">
        Trusted by travellers · 24×7 WhatsApp support · Secure payments
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <img
            src="https://customer-assets.emergentagent.com/job_travelgenius/artifacts/ojpqneqb_FINAL%20LOGO.png"
            alt="TourSmile"
            className="app-logo"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <FlightSearchForm onSearch={handleSearch} isSearching={isSearching} />
        
        {/* Popular Routes */}
        <div className="popular-routes">
          <h3 className="popular-title">Popular Routes</h3>
          <div className="routes-grid">
            {['Delhi–Mumbai', 'Bangalore–Hyderabad', 'Mumbai–Dubai', 'Delhi–Singapore'].map((route) => (
              <div key={route} className="route-card">
                {route}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;