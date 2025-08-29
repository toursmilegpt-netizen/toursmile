import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// TOURSMILE FLIGHT SEARCH - PIXEL-PERFECT FIGMA REBUILD
// 390px mobile frame, exact typography and colors from specs
// Following README.txt tokens and Interactivity Handoff.txt behaviors

const AIRPORTS_DATABASE = [
  { code: 'DEL', name: 'New Delhi', city: 'Delhi', country: 'India', popular: true },
  { code: 'BOM', name: 'Mumbai', city: 'Mumbai', country: 'India', popular: true },
  { code: 'BLR', name: 'Bangalore', city: 'Bangalore', country: 'India', popular: true },
  { code: 'MAA', name: 'Chennai', city: 'Chennai', country: 'India', popular: true },
  { code: 'CCU', name: 'Kolkata', city: 'Kolkata', country: 'India', popular: true },
  { code: 'HYD', name: 'Hyderabad', city: 'Hyderabad', country: 'India', popular: true },
  { code: 'DXB', name: 'Dubai', city: 'Dubai', country: 'UAE', popular: true },
  { code: 'SIN', name: 'Singapore', city: 'Singapore', country: 'Singapore', popular: true }
];

// Airport Autocomplete Component - Exact Figma Implementation
const AirportAutocomplete = ({ 
  value, 
  onChange, 
  label, 
  placeholder, 
  highlight = false,
  onFocus 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [filteredAirports, setFilteredAirports] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Trigger autocomplete after 3 characters as per specs
  useEffect(() => {
    if (inputValue.length >= 3) {
      const filtered = AIRPORTS_DATABASE.filter(airport =>
        airport.city.toLowerCase().includes(inputValue.toLowerCase()) ||
        airport.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        airport.code.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 6);
      setFilteredAirports(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredAirports([]);
      setIsOpen(false);
    }
  }, [inputValue]);

  // Close on outside click
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

  const handleInputFocus = () => {
    // Show popular airports on focus if empty
    if (!inputValue) {
      setFilteredAirports(AIRPORTS_DATABASE.filter(a => a.popular).slice(0, 6));
      setIsOpen(true);
    }
    onFocus && onFocus();
  };

  const handleSelect = (airport) => {
    const selectedValue = `${airport.city} – ${airport.name} (${airport.code})`; // City – Airport (IATA) format
    setInputValue(selectedValue);
    onChange(airport);
    setIsOpen(false);
  };

  return (
    <div className="field-container" ref={dropdownRef}>
      <label className="field-label">{label}</label>
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`field-input ${highlight ? 'field-highlight' : ''}`}
          autoComplete="off"
        />
        
        {/* Dropdown with fade/slide animation */}
        {isOpen && (
          <div className="autocomplete-dropdown">
            {filteredAirports.map((airport) => (
              <div
                key={airport.code}
                onClick={() => handleSelect(airport)}
                className="autocomplete-option"
              >
                <div className="option-main">{airport.city} – {airport.name}</div>
                <div className="option-code">({airport.code})</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Calendar Overlay Component - Full-screen with auto-advance
const CalendarOverlay = ({ 
  isOpen, 
  onClose, 
  onDateSelect, 
  selectedDate, 
  minDate, 
  isReturn = false,
  departureDate 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOneWay, setIsOneWay] = useState(false);

  if (!isOpen) return null;

  const today = new Date();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const handleDateClick = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(selected);
    
    // Auto-advance: Departure → Return, close after Return
    if (!isReturn && !isOneWay) {
      // Will trigger return calendar in parent
    } else {
      onClose(); // Close overlay after return date chosen
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
      <div className="calendar-modal">
        <div className="calendar-header">
          <h3 className="calendar-title">
            {isReturn ? 'Return Date' : 'Departure Date'}
          </h3>
          
          {/* One-way toggle at top */}
          {!isReturn && (
            <label className="oneway-toggle">
              <input
                type="checkbox"
                checked={isOneWay}
                onChange={(e) => setIsOneWay(e.target.checked)}
              />
              <span>One-way</span>
            </label>
          )}
        </div>

        <div className="calendar-nav">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="nav-btn prev"
          >
            ‹
          </button>
          <div className="current-month">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="nav-btn next"
          >
            ›
          </button>
        </div>

        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday-label">{day}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
};

// Travellers Selector Component - With validation as per specs
const TravellersSelector = ({ 
  travellers, 
  onTravellersChange, 
  travelClass, 
  onClassChange, 
  highlight = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGroupBooking, setShowGroupBooking] = useState(false);
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
    
    // Validation: total ≤ 9, show group booking for 10+
    const total = newTravellers.adults + newTravellers.children + newTravellers.infants;
    if (total > 9) {
      setShowGroupBooking(true);
      return;
    }
    
    onTravellersChange(newTravellers);
  };

  const getTotalPassengers = () => {
    return travellers.adults + travellers.children + travellers.infants;
  };

  const getDisplayText = () => {
    const total = getTotalPassengers();
    return `${total} Traveller${total > 1 ? 's' : ''}, ${travelClass}`;
  };

  // Group Booking Modal for 10+ passengers
  const GroupBookingModal = () => (
    <div className="group-booking-overlay">
      <div className="group-booking-backdrop" onClick={() => setShowGroupBooking(false)}></div>
      <div className="group-booking-modal">
        <h3>Group Booking Request</h3>
        <p>For 10 or more passengers, please request a Group Booking</p>
        <form className="group-booking-form">
          <input type="text" placeholder="Name" required />
          <input type="tel" placeholder="Phone" required />
          <input type="email" placeholder="Email" required />
          <input type="text" placeholder="Route" required />
          <input type="text" placeholder="Dates" required />
          <input type="number" placeholder="Passengers" min="10" required />
          <div className="form-actions">
            <button type="button" onClick={() => setShowGroupBooking(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Request Group Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="field-container" ref={dropdownRef}>
      <label className="field-label">TRAVELLERS & CLASS</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`field-input travellers-input ${highlight ? 'field-highlight' : ''}`}
      >
        <span className="input-value">{getDisplayText()}</span>
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
            <div className="stepper-controls">
              <button
                type="button"
                onClick={() => updateCount('adults', false)}
                disabled={travellers.adults <= 1}
                className="stepper-btn minus"
              >
                -
              </button>
              <span className="stepper-value">{travellers.adults}</span>
              <button
                type="button"
                onClick={() => updateCount('adults', true)}
                className="stepper-btn plus"
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
            <div className="stepper-controls">
              <button
                type="button"
                onClick={() => updateCount('children', false)}
                disabled={travellers.children <= 0}
                className="stepper-btn minus"
              >
                -
              </button>
              <span className="stepper-value">{travellers.children}</span>
              <button
                type="button"
                onClick={() => updateCount('children', true)}
                className="stepper-btn plus"
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
            <div className="stepper-controls">
              <button
                type="button"
                onClick={() => updateCount('infants', false)}
                disabled={travellers.infants <= 0}
                className="stepper-btn minus"
              >
                -
              </button>
              <span className="stepper-value">{travellers.infants}</span>
              <button
                type="button"
                onClick={() => updateCount('infants', true)}
                disabled={travellers.infants >= travellers.adults}
                className="stepper-btn plus"
              >
                +
              </button>
            </div>
          </div>

          {/* Travel Class */}
          <div className="class-section">
            <div className="class-title">Travel Class</div>
            <div className="class-grid">
              {['Economy', 'Premium Economy', 'Business', 'First'].map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => onClassChange(cls)}
                  className={`class-option ${travelClass === cls ? 'active' : ''}`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showGroupBooking && <GroupBookingModal />}
    </div>
  );
};

// Main Flight Search Form - Pixel-Perfect Implementation
const FlightSearchForm = () => {
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

  // UI state for guidance effects
  const [currentField, setCurrentField] = useState('departure');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState('departure');

  // Guidance effects - highlight next field after selection
  const getFieldHighlight = (fieldName) => {
    return currentField === fieldName;
  };

  const handleDepartureSelect = (airport) => {
    setDeparture(airport);
    setCurrentField('destination'); // Highlight next field
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

    console.log('Flight Search:', searchData);
    // Backend integration will be wired after UI is approved
  };

  const isFormValid = departure && destination && departureDate && (tripType === 'one-way' || returnDate);

  return (
    <div className="search-form">
      {/* Trip Type Tabs */}
      <div className="trip-tabs">
        <button
          type="button"
          onClick={() => setTripType('round-trip')}
          className={`trip-tab ${tripType === 'round-trip' ? 'active' : ''}`}
        >
          Round Trip
        </button>
        <button
          type="button"
          onClick={() => setTripType('one-way')}
          className={`trip-tab ${tripType === 'one-way' ? 'active' : ''}`}
        >
          One Way
        </button>
        <button
          type="button"
          onClick={() => setTripType('multi-city')}
          className={`trip-tab ${tripType === 'multi-city' ? 'active' : ''}`}
        >
          Multi City
        </button>
      </div>

      {/* Route Selection */}
      <div className="route-section">
        <div className="route-row">
          <AirportAutocomplete
            value={departure?.city || ''}
            onChange={handleDepartureSelect}
            label="FROM"
            placeholder="Delhi"
            highlight={getFieldHighlight('departure')}
            onFocus={() => setCurrentField('departure')}
          />
          
          <button
            type="button"
            onClick={handleSwap}
            className="swap-btn"
            disabled={!departure && !destination}
          >
            ⇄
          </button>
          
          <AirportAutocomplete
            value={destination?.city || ''}
            onChange={handleDestinationSelect}
            label="TO"
            placeholder="Mumbai"
            highlight={getFieldHighlight('destination')}
            onFocus={() => setCurrentField('destination')}
          />
        </div>
      </div>

      {/* Date Selection */}
      <div className="date-section">
        <div className={`date-row ${tripType === 'round-trip' ? 'two-dates' : 'one-date'}`}>
          <div className="field-container">
            <label className="field-label">DEPARTURE</label>
            <button
              type="button"
              onClick={() => {
                setCalendarType('departure');
                setShowCalendar(true);
              }}
              className={`field-input date-input ${getFieldHighlight('departureDate') ? 'field-highlight' : ''}`}
            >
              <span className="input-value">
                {departureDate ? departureDate.toLocaleDateString('en-GB') : 'Select Date'}
              </span>
            </button>
          </div>

          {tripType === 'round-trip' && (
            <div className="field-container">
              <label className="field-label">RETURN</label>
              <button
                type="button"
                onClick={() => {
                  setCalendarType('return');
                  setShowCalendar(true);
                }}
                className={`field-input date-input ${getFieldHighlight('return') ? 'field-highlight' : ''}`}
              >
                <span className="input-value">
                  {returnDate ? returnDate.toLocaleDateString('en-GB') : 'Select Date'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Travellers Selection */}
      <TravellersSelector
        travellers={travellers}
        onTravellersChange={setTravellers}
        travelClass={travelClass}
        onClassChange={setTravelClass}
        highlight={getFieldHighlight('travellers')}
      />

      {/* Search Button - Sticky at bottom with orange gradient */}
      <div className="search-section">
        <button
          type="button"
          onClick={handleSearch}
          disabled={!isFormValid}
          className={`search-btn ${isFormValid ? 'enabled' : 'disabled'}`}
        >
          Search Flights
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

// Main App Component - Exact Figma Layout
function App() {
  return (
    <div className="App">
      {/* Header with Logo and Navigation */}
      <header className="app-header">
        <div className="header-content">
          <img
            src="https://customer-assets.emergentagent.com/job_travelgenius/artifacts/ojpqneqb_FINAL%20LOGO.png"
            alt="TourSmile"
            className="app-logo"
          />
          
          <nav className="nav-chips">
            <span className="nav-chip active">Flights</span>
            <span className="nav-chip">Hotels</span>
            <span className="nav-chip">Packages</span>
          </nav>
        </div>
      </header>

      {/* Main Search Card */}
      <main className="main-content">
        <div className="search-card">
          <FlightSearchForm />
        </div>

        {/* Trust Strip - Below search card as per Figma */}
        <div className="trust-strip">
          Trusted by travellers · 24×7 WhatsApp support · Secure payments
        </div>

        {/* Popular Routes */}
        <div className="popular-routes">
          <h3 className="section-title">Popular Routes</h3>
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