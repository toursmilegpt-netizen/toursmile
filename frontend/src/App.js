import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// MAJOR TRAVEL PORTAL STYLE - FRESH START
const AIRPORTS = [
  { code: 'DEL', name: 'Delhi', city: 'New Delhi' },
  { code: 'BOM', name: 'Mumbai', city: 'Mumbai' },
  { code: 'BLR', name: 'Bangalore', city: 'Bangalore' },
  { code: 'MAA', name: 'Chennai', city: 'Chennai' },
  { code: 'CCU', name: 'Kolkata', city: 'Kolkata' },
  { code: 'HYD', name: 'Hyderabad', city: 'Hyderabad' },
  { code: 'AMD', name: 'Ahmedabad', city: 'Ahmedabad' },
  { code: 'PNQ', name: 'Pune', city: 'Pune' },
  { code: 'GOI', name: 'Goa', city: 'Goa' },
  { code: 'JAI', name: 'Jaipur', city: 'Jaipur' }
];

// Simple City Selector Component
const CitySelector = ({ value, onChange, placeholder, isFrom = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredCities = AIRPORTS.filter(airport => 
    airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    airport.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    onChange(airport.city);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => {
          onChange(e.target.value);
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="city-input"
      />
      
      {isOpen && (
        <div className="city-dropdown">
          {filteredCities.map((airport) => (
            <div
              key={airport.code}
              onClick={() => handleSelect(airport)}
              className="city-option"
            >
              <div className="city-name">{airport.city}</div>
              <div className="airport-code">{airport.code}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Simple Date Selector Component
const DateSelector = ({ value, onChange, label, minDate }) => {
  return (
    <div>
      <label className="date-label">{label}</label>
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        min={minDate}
        className="date-input"
      />
    </div>
  );
};

// Simple Passenger Selector Component
const PassengerSelector = ({ passengers, onChange, travelClass, onClassChange }) => {
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
    const currentCount = passengers[type] || (type === 'adults' ? 1 : 0);
    const newCount = increment ? currentCount + 1 : Math.max(type === 'adults' ? 1 : 0, currentCount - 1);
    
    onChange({
      ...passengers,
      [type]: newCount
    });
  };

  const getTotalPassengers = () => {
    return (passengers.adults || 1) + (passengers.children || 0) + (passengers.infants || 0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="passenger-button"
      >
        <span>{getTotalPassengers()} Passengers, {travelClass || 'Economy'}</span>
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="passenger-dropdown">
          <div className="passenger-row">
            <span>Adults</span>
            <div className="passenger-controls">
              <button 
                type="button"
                onClick={() => updateCount('adults', false)}
                disabled={passengers.adults <= 1}
                className="passenger-btn"
              >
                -
              </button>
              <span className="passenger-count">{passengers.adults || 1}</span>
              <button 
                type="button"
                onClick={() => updateCount('adults', true)}
                className="passenger-btn"
              >
                +
              </button>
            </div>
          </div>

          <div className="passenger-row">
            <span>Children</span>
            <div className="passenger-controls">
              <button 
                type="button"
                onClick={() => updateCount('children', false)}
                disabled={passengers.children <= 0}
                className="passenger-btn"
              >
                -
              </button>
              <span className="passenger-count">{passengers.children || 0}</span>
              <button 
                type="button"
                onClick={() => updateCount('children', true)}
                className="passenger-btn"
              >
                +
              </button>
            </div>
          </div>

          <div className="class-selection">
            <div className="class-title">Travel Class</div>
            <div className="class-options">
              {['Economy', 'Business', 'First'].map((cls) => (
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

// Main Flight Search Form - MakeMyTrip Style
const FlightSearchForm = ({ onSearch, isSearching = false }) => {
  const [tripType, setTripType] = useState('one-way');
  const [fromCity, setFromCity] = useState('Delhi');
  const [toCity, setToCity] = useState('Mumbai');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [travelClass, setTravelClass] = useState('Economy');

  const handleSwap = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleSearch = () => {
    if (!fromCity || !toCity || !departDate) {
      alert('Please fill all required fields');
      return;
    }
    
    const searchData = {
      tripType,
      from: fromCity,
      to: toCity,
      departDate,
      returnDate: tripType === 'return' ? returnDate : null,
      passengers,
      travelClass
    };
    
    onSearch && onSearch(searchData);
  };

  const today = new Date().toISOString().split('T')[0];
  const isFormValid = fromCity && toCity && departDate && (tripType !== 'return' || returnDate);

  return (
    <div className="search-form-container">
      {/* Trip Type Tabs */}
      <div className="trip-tabs">
        {[
          { key: 'one-way', label: 'One Way' },
          { key: 'return', label: 'Round Trip' },
          { key: 'multi-city', label: 'Multi City' }
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTripType(key)}
            className={`trip-tab ${tripType === key ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search Fields */}
      <div className="search-fields">
        <div className="route-section">
          <div className="city-field">
            <label className="field-label">FROM</label>
            <CitySelector
              value={fromCity}
              onChange={setFromCity}
              placeholder="Departure City"
              isFrom={true}
            />
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="swap-button"
            title="Swap Cities"
          >
            ⇄
          </button>

          <div className="city-field">
            <label className="field-label">TO</label>
            <CitySelector
              value={toCity}
              onChange={setToCity}
              placeholder="Destination City"
              isFrom={false}
            />
          </div>
        </div>

        <div className="date-passenger-section">
          <div className="date-fields">
            <DateSelector
              value={departDate}
              onChange={setDepartDate}
              label="DEPARTURE"
              minDate={today}
            />
            
            {tripType === 'return' && (
              <DateSelector
                value={returnDate}
                onChange={setReturnDate}
                label="RETURN"
                minDate={departDate || today}
              />
            )}
          </div>

          <div className="passenger-field">
            <label className="field-label">PASSENGERS & CLASS</label>
            <PassengerSelector
              passengers={passengers}
              onChange={setPassengers}
              travelClass={travelClass}
              onClassChange={setTravelClass}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={!isFormValid || isSearching}
          className={`search-button ${isFormValid ? 'enabled' : 'disabled'}`}
        >
          {isSearching ? 'Searching...' : 'Search Flights'}
        </button>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (searchData) => {
    setIsSearching(true);
    console.log('Search data:', searchData);
    
    // Simulate search
    setTimeout(() => {
      setIsSearching(false);
      alert(`Searching flights from ${searchData.from} to ${searchData.to}`);
    }, 2000);
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <img
              src="https://customer-assets.emergentagent.com/job_travelgenius/artifacts/ojpqneqb_FINAL%20LOGO.png"
              alt="TourSmile"
              className="logo"
            />
          </div>
          <nav className="main-nav">
            <span className="nav-item active">✈️ Flights</span>
            <span className="nav-item">🏨 Hotels</span>
            <span className="nav-item">🚗 Cars</span>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Book Your Perfect Flight</h1>
          <p className="hero-subtitle">Find the best deals on flights worldwide</p>
          
          {/* Main Search Form */}
          <FlightSearchForm onSearch={handleSearch} isSearching={isSearching} />
          
          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-icon">✅</span>
              <span className="trust-text">Instant Booking</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              <span className="trust-text">Secure Payment</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">⚡</span>
              <span className="trust-text">Best Prices</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;