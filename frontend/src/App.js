import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// TOURSMILE FRESH WHITE THEME - PREMIUM TRAVEL PLATFORM
// Direct typing city picker, center screen modals, clean design

const AIRPORTS_DATABASE = [
  // INDIA - DOMESTIC AIRPORTS
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
  
  // INTERNATIONAL AIRPORTS
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', popular: true },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', popular: true },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', popular: true },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', popular: true },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', popular: true },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', popular: true },
  { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'UK', popular: true },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', popular: true }
];

// Direct Typing City Picker Component
const DirectCityPicker = ({ 
  value, 
  selectedAirport,
  onSelect, 
  label, 
  placeholder 
}) => {
  const [inputValue, setInputValue] = useState(selectedAirport?.city || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (inputValue.length >= 1) {
        const filtered = AIRPORTS_DATABASE.filter(airport =>
          airport.city.toLowerCase().includes(inputValue.toLowerCase()) ||
          airport.name.toLowerCase().includes(inputValue.toLowerCase()) ||
          airport.code.toLowerCase().includes(inputValue.toLowerCase())
        ).slice(0, 6);
        
        setSuggestions(filtered);
        setIsOpen(filtered.length > 0);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  // Outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (airport) => {
    setInputValue(airport.city);
    setIsOpen(false);
    onSelect(airport);
  };

  return (
    <div className="direct-typing-field" ref={dropdownRef}>
      <label className="field-label">{label}</label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="city-input"
        autoComplete="off"
      />
      
      {isOpen && (
        <div className="suggestions-dropdown">
          {suggestions.map((airport) => (
            <div
              key={airport.code}
              onClick={() => handleSelect(airport)}
              className="suggestion-item"
            >
              <div className="suggestion-city">{airport.city}</div>
              <div className="suggestion-details">{airport.name} ({airport.code})</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Calendar Overlay Component
const CalendarOverlay = ({ 
  isOpen, 
  onClose, 
  onDateSelect, 
  selectedDate,
  minDate,
  isReturn 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!isOpen) return null;

  const handleDateClick = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(selected);
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isPast = date < new Date().setHours(0, 0, 0, 0);
      const isMinDate = minDate && date < minDate;

      days.push(
        <div
          key={day}
          onClick={() => !isPast && !isMinDate && handleDateClick(day)}
          className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${(isPast || isMinDate) ? 'disabled' : ''}`}
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
          <h3 className="modal-title">{isReturn ? 'Return Date' : 'Departure Date'}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="calendar-navigation">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="nav-button"
          >
            ‹
          </button>
          <span className="month-year">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="nav-button"
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

// Premium Passenger Selector Component
const PassengerSelector = ({ 
  travellers,
  onTravellersChange, 
  travelClass, 
  onClassChange,
  isOpen,
  onClose 
}) => {
  const getTotalPassengers = () => travellers.adults + travellers.children + travellers.infants;

  const updateCount = (type, increment) => {
    const current = travellers[type];
    let newCount = increment ? current + 1 : Math.max(type === 'adults' ? 1 : 0, current - 1);
    
    const newTravellers = { ...travellers, [type]: newCount };
    
    if (type === 'infants' && newTravellers.infants > newTravellers.adults) return;
    if (getTotalPassengers() >= 9 && increment) return;
    
    onTravellersChange(newTravellers);
  };

  if (!isOpen) return null;

  return (
    <div className="passenger-overlay">
      <div className="passenger-backdrop" onClick={onClose}></div>
      <div className="passenger-modal">
        <div className="passenger-header">
          <h3 className="passenger-title">Travelers & Class</h3>
          <button onClick={onClose} className="passenger-close">×</button>
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
  );
};

// Flight Search Form Component
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
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState('departure');
  const [showTravellers, setShowTravellers] = useState(false);

  const handleSearch = () => {
    console.log('Search clicked', {
      tripType, departure, destination, departureDate, returnDate, travellers, travelClass
    });
  };

  const isFormValid = departure && destination && departureDate && (tripType === 'one-way' || returnDate);

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
      {/* Trip Type Tabs - Pill group */}
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

      {/* From/To Row - Horizontal */}
      <div className="route-row">
        <DirectCityPicker
          selectedAirport={departure}
          onSelect={setDeparture}
          label="FROM"
          placeholder="City or airport"
        />
        
        <button
          onClick={() => {
            if (departure && destination) {
              const temp = departure;
              setDeparture(destination);
              setDestination(temp);
            }
          }}
          className="swap-button-fresh"
          aria-label="Swap From and To"
        >
          ⇄
        </button>
        
        <DirectCityPicker
          selectedAirport={destination}
          onSelect={setDestination}
          label="TO"
          placeholder="City or airport"
        />
      </div>

      {/* Date Inputs */}
      <div className="date-row">
        <div className="date-field">
          <button
            onClick={() => {
              setCalendarType('departure');
              setShowCalendar(true);
            }}
            className="date-input-clean"
          >
            <span>
              {departureDate ? departureDate.toLocaleDateString('en-GB', { 
                day: 'numeric', month: 'short', year: 'numeric' 
              }) : 'Departure'}
            </span>
            <span>📅</span>
          </button>
        </div>

        {tripType === 'round-trip' && (
          <div className="date-field">
            <button
              onClick={() => {
                setCalendarType('return');
                setShowCalendar(true);
              }}
              className="date-input-clean"
            >
              <span>
                {returnDate ? returnDate.toLocaleDateString('en-GB', { 
                  day: 'numeric', month: 'short', year: 'numeric' 
                }) : 'Return'}
              </span>
              <span>📅</span>
            </button>
          </div>
        )}
      </div>

      {/* Passenger Selector */}
      <div className="passenger-field">
        <label className="field-label">TRAVELERS & CLASS</label>
        <button
          onClick={() => setShowTravellers(true)}
          className="traveller-input-compact"
        >
          {getPassengerText()}
        </button>
      </div>

      {/* Options */}
      <div className="options-row">
        <label className="option-checkbox">
          <input
            type="checkbox"
            checked={directFlights}
            onChange={(e) => setDirectFlights(e.target.checked)}
          />
          <span className="checkmark">✓</span>
          <span>Direct flights</span>
        </label>

        <label className="option-checkbox">
          <input
            type="checkbox"
            checked={flexibleDates}
            onChange={(e) => setFlexibleDates(e.target.checked)}
          />
          <span className="checkmark">✓</span>
          <span>Flexible dates ±3 days</span>
        </label>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={!isFormValid}
        className={`search-button ${isFormValid ? 'enabled' : 'disabled'}`}
      >
        Search Flights
      </button>

      {/* Calendar Modal */}
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

      {/* Passenger Modal */}
      <PassengerSelector
        travellers={travellers}
        onTravellersChange={setTravellers}
        travelClass={travelClass}
        onClassChange={setTravelClass}
        isOpen={showTravellers}
        onClose={() => setShowTravellers(false)}
      />
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="header-main">
            <img
              src="https://customer-assets.emergentagent.com/job_travelgenius/artifacts/ojpqneqb_FINAL%20LOGO.png"
              alt="TourSmile"
              className="logo-main"
            />
            
            <nav className="main-navigation">
              <span className="nav-link active">
                <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
                </svg>
                Flights
              </span>
              <span className="nav-link">
                <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V6H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" fill="currentColor"/>
                </svg>
                Hotels
              </span>
              <span className="nav-link">
                <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                </svg>
                Packages
              </span>
              <span className="nav-link">
                <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 10v6c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2v-6c0-1.11.89-2 2-2h16c1.11 0 2 .89 2 2zm-2 0H4v6h16v-6zM6 11h2v2H6v-2zm0 3h8v1H6v-1z" fill="currentColor"/>
                </svg>
                Activities
              </span>
            </nav>
          </div>
          
          <div className="header-actions">
            <button className="support-btn">24×7 Support</button>
            <button className="account-btn">Sign In</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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

      {/* Trust Section */}
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

      {/* Popular Destinations */}
      <section className="destinations-section">
        <div className="section-container">
          <h2 className="section-title">Popular Destinations</h2>
          <div className="destinations-grid">
            {[
              { route: 'Delhi → Mumbai', price: '₹3,999', emoji: '🏙️', popular: true },
              { route: 'Bangalore → Hyderabad', price: '₹4,299', emoji: '🌆', popular: true },
              { route: 'Mumbai → Dubai', price: '₹12,999', emoji: '🏗️', popular: true },
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

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-section">
              <h4>About TourSmile</h4>
              <p>Your trusted travel companion for flights worldwide.</p>
            </div>
            <div className="footer-section">
              <h4>Help/Support</h4>
              <a href="#contact">Contact Us</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer-section">
              <h4>Legal/Policies</h4>
              <a href="#terms">Terms & Conditions</a>
              <a href="#privacy">Privacy Policy</a>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <a href="#facebook">Facebook</a>
              <a href="#twitter">Twitter</a>
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