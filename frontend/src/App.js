import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// TOURSMILE FLIGHT SEARCH - PIXEL-PERFECT FIGMA DEV MODE IMPLEMENTATION
// Using EXACT Figma Inspect values - no substitutions
// Mobile Frame: 390px | Colors: #4285F4, #FFA382 | Typography: Exact Figma specs

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

// Airport Autocomplete Component - EXACT Figma Specifications
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

  // Trigger after 3 characters as per Interactivity Handoff
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
    setInputValue(e.target.value);
  };

  const handleInputFocus = () => {
    if (!inputValue) {
      setFilteredAirports(AIRPORTS_DATABASE.filter(a => a.popular).slice(0, 6));
      setIsOpen(true);
    }
    onFocus && onFocus();
  };

  const handleSelect = (airport) => {
    // City – Airport (IATA) format as per specs
    const selectedValue = `${airport.city} – ${airport.name} (${airport.code})`;
    setInputValue(selectedValue);
    onChange(airport);
    setIsOpen(false);
  };

  return (
    <div className="input-field" ref={dropdownRef}>
      <label className="input-label">{label}</label>
      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`input-box ${highlight ? 'input-highlight' : ''}`}
          autoComplete="off"
        />
        
        {/* Dropdown with 200ms fade/slide animation */}
        {isOpen && (
          <div className="autocomplete-dropdown">
            {filteredAirports.map((airport) => (
              <div
                key={airport.code}
                onClick={() => handleSelect(airport)}
                className="dropdown-item"
              >
                <div className="item-primary">{airport.city} – {airport.name}</div>
                <div className="item-secondary">({airport.code})</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Calendar Overlay - Full-screen with auto-advance
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
    
    // Interactivity Handoff.txt: Auto-advance behavior
    // Departure → Return within same overlay, Return → Close
    if (!isReturn) {
      // Departure date selected - parent handles auto-advance to return
    } else {
      // Return date selected - close overlay
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
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const isCurrentToday = isToday(day);
      
      days.push(
        <div
          key={day}
          onClick={() => !disabled && handleDateClick(day)}
          className={`calendar-cell ${disabled ? 'disabled' : ''} ${isCurrentToday ? 'today' : ''}`}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="calendar-overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="calendar-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {isReturn ? 'Return Date' : 'Departure Date'}
          </h3>
          
          {!isReturn && (
            <label className="toggle-oneway">
              <input
                type="checkbox"
                checked={isOneWay}
                onChange={(e) => setIsOneWay(e.target.checked)}
              />
              <span>One-way</span>
            </label>
          )}
        </div>

        <div className="calendar-navigation">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="nav-button prev"
          >
            ‹
          </button>
          <div className="month-year">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="nav-button next"
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

// Travellers Bottom Sheet - With validation rules
const TravellersBottomSheet = ({ 
  travellers, 
  onTravellersChange, 
  travelClass, 
  onClassChange, 
  highlight = false,
  isOpen,
  onClose 
}) => {
  const [showGroupBooking, setShowGroupBooking] = useState(false);

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
    
    // Max 9 rule - 10+ opens Group Booking
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

  // Group Booking Form Modal for 10+ passengers
  const GroupBookingModal = () => (
    <div className="group-booking-overlay">
      <div className="group-backdrop" onClick={() => setShowGroupBooking(false)}></div>
      <div className="group-modal">
        <h3>Group Booking Request</h3>
        <p>For 10 or more passengers, please request a Group Booking</p>
        <form className="group-form">
          <input type="text" placeholder="Name" required />
          <input type="tel" placeholder="Phone" required />
          <input type="email" placeholder="Email" required />
          <input type="text" placeholder="Route" required />
          <input type="text" placeholder="Dates" required />
          <input type="number" placeholder="Passengers" min="10" required />
          <div className="form-buttons">
            <button type="button" onClick={() => setShowGroupBooking(false)} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Request Group Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="bottom-sheet-overlay">
        <div className="sheet-backdrop" onClick={onClose}></div>
        <div className="bottom-sheet">
          <div className="sheet-header">
            <h3>Travellers & Class</h3>
            <button onClick={onClose} className="close-button">×</button>
          </div>

          <div className="sheet-content">
            {/* Traveller Types */}
            {[
              { key: 'adults', label: 'Adults', age: '(12+)', min: 1 },
              { key: 'children', label: 'Children', age: '(2–11)', min: 0 },
              { key: 'infants', label: 'Infants', age: '(<2)', min: 0 }
            ].map(({ key, label, age, min }) => (
              <div key={key} className="traveller-row">
                <div className="traveller-info">
                  <div className="traveller-label">{label}</div>
                  <div className="traveller-age">{age}</div>
                </div>
                <div className="stepper">
                  <button
                    type="button"
                    onClick={() => updateCount(key, false)}
                    disabled={travellers[key] <= min}
                    className="stepper-btn minus"
                  >
                    -
                  </button>
                  <span className="stepper-count">{travellers[key]}</span>
                  <button
                    type="button"
                    onClick={() => updateCount(key, true)}
                    className="stepper-btn plus"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            {/* Travel Class */}
            <div className="class-section">
              <div className="class-title">Travel Class</div>
              <div className="class-options">
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
        </div>
      </div>

      {showGroupBooking && <GroupBookingModal />}
    </>
  );
};

// Main Flight Search Form - EXACT Figma Layout
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
  const [directFlights, setDirectFlights] = useState(false);
  const [flexibleDates, setFlexibleDates] = useState(false);

  // UI state for guidance effects
  const [currentField, setCurrentField] = useState('departure');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState('departure');
  const [showTravellers, setShowTravellers] = useState(false);

  // Guidance effects - highlight next field
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
  };

  const handleDepartureDateSelect = (date) => {
    setDepartureDate(date);
    
    // Interactivity Handoff.txt: "On selecting departure date → auto-advance to return"
    if (tripType === 'round-trip') {
      // Auto-advance to return within same overlay
      setCalendarType('return');
      setCurrentField('return');
      // Keep calendar open for return date selection
    } else {
      // One-way: close overlay and advance to travellers
      setShowCalendar(false);
      setCurrentField('travellers');
    }
  };

  const handleReturnDateSelect = (date) => {
    setReturnDate(date);
    // Interactivity Handoff.txt: "Overlay closes after return date chosen"
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

    console.log('Flight Search Data:', {
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

  const isFormValid = departure && destination && departureDate && (tripType === 'one-way' || returnDate);
  const getTotalTravellers = () => travellers.adults + travellers.children + travellers.infants;

  return (
    <div className="search-form">
      {/* Trip Type Segmented Control - EXACT Figma */}
      <div className="trip-segmented-control">
        {['round-trip', 'one-way', 'multi-city'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTripType(type)}
            className={`segment-option ${tripType === type ? 'active' : ''}`}
          >
            {type === 'round-trip' ? 'Round Trip' : type === 'one-way' ? 'One Way' : 'Multi City'}
          </button>
        ))}
      </div>

      {/* Route Selection */}
      <div className="route-section">
        <div className="route-fields">
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
            className="swap-button"
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
        <div className={`date-fields ${tripType === 'round-trip' ? 'two-dates' : 'one-date'}`}>
          <div className="input-field">
            <label className="input-label">DEPARTURE</label>
            <button
              type="button"
              onClick={() => {
                setCalendarType('departure');
                setShowCalendar(true);
              }}
              className={`input-box date-selector ${getFieldHighlight('departureDate') ? 'input-highlight' : ''}`}
            >
              <span className="input-value">
                {departureDate ? departureDate.toLocaleDateString('en-GB') : 'Select Date'}
              </span>
            </button>
          </div>

          {tripType === 'round-trip' && (
            <div className="input-field">
              <label className="input-label">RETURN</label>
              <button
                type="button"
                onClick={() => {
                  setCalendarType('return');
                  setShowCalendar(true);
                }}
                className={`input-box date-selector ${getFieldHighlight('return') ? 'input-highlight' : ''}`}
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
      <div className="input-field">
        <label className="input-label">TRAVELLERS & CLASS</label>
        <button
          type="button"
          onClick={() => setShowTravellers(true)}
          className={`input-box traveller-selector ${getFieldHighlight('travellers') ? 'input-highlight' : ''}`}
        >
          <span className="input-value">
            {getTotalTravellers()} Traveller{getTotalTravellers() > 1 ? 's' : ''}, {travelClass}
          </span>
          <span className="dropdown-icon">▼</span>
        </button>
      </div>

      {/* Options Row - EXACT Figma Position */}
      <div className="options-row">
        <label className="option-checkbox">
          <input
            type="checkbox"
            checked={directFlights}
            onChange={(e) => setDirectFlights(e.target.checked)}
          />
          <span className="checkmark"></span>
          <span className="option-text">Direct flights</span>
        </label>

        <label className="option-checkbox">
          <input
            type="checkbox"
            checked={flexibleDates}
            onChange={(e) => setFlexibleDates(e.target.checked)}
          />
          <span className="checkmark"></span>
          <span className="option-text">Flexible dates ±3 days</span>
        </label>
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

      {/* Travellers Bottom Sheet */}
      <TravellersBottomSheet
        travellers={travellers}
        onTravellersChange={setTravellers}
        travelClass={travelClass}
        onClassChange={setTravelClass}
        highlight={getFieldHighlight('travellers')}
        isOpen={showTravellers}
        onClose={() => setShowTravellers(false)}
      />

      {/* Sticky CTA - Orange Gradient */}
      <div className="sticky-cta">
        <button
          type="button"
          onClick={handleSearch}
          disabled={!isFormValid}
          className={`cta-button ${isFormValid ? 'enabled' : 'disabled'}`}
        >
          <span className="cta-text">Search Flights</span>
        </button>
      </div>
    </div>
  );
};

// Main App Component - EXACT Figma Layout
function App() {
  return (
    <div className="App">
      {/* Header with centered logo and nav chips */}
      <header className="app-header">
        <div className="header-container">
          <img
            src="https://customer-assets.emergentagent.com/job_travelgenius/artifacts/ojpqneqb_FINAL%20LOGO.png"
            alt="TourSmile"
            className="logo-centered"
          />
          
          <nav className="nav-chips">
            <span className="nav-chip active">Flights</span>
            <span className="nav-chip">Hotels</span>
            <span className="nav-chip">Packages</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-container">
        {/* Search Card with 12px radius and shadows per Figma */}
        <div className="search-card">
          <FlightSearchForm />
        </div>

        {/* Trust Strip - README.txt: Exact text below search card */}
        <div className="trust-strip">
          Trusted by travellers · 24×7 WhatsApp support · Secure payments
        </div>

        {/* Popular Routes - README.txt: Exact routes */}
        <section className="popular-routes">
          <h2 className="section-title-centered">Popular Routes</h2>
          <div className="route-chips">
            {['Delhi–Mumbai', 'Bangalore–Hyderabad', 'Mumbai–Dubai', 'Delhi–Singapore'].map((route) => (
              <div key={route} className="route-chip">
                {route}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;