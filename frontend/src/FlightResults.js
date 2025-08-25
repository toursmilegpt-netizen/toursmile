import React, { useState, useEffect } from "react";

// Friendly labels for multi-airport cities (layman-friendly display)
const MULTI_AIRPORT_LABELS = {
  NYC: 'New York - All Airports',
  LON: 'London - All Airports',
  PAR: 'Paris - All Airports',
  MIL: 'Milan - All Airports',
  IST: 'Istanbul - All Airports',
  BKK: 'Bangkok - All Airports',
  CHI: 'Chicago - All Airports',
  TPE: 'Taipei - All Airports',
  DXB: 'Dubai - All Airports'
};

const prettyCity = (val) => {
  if (!val) return '';
  const v = String(val).trim().toUpperCase();
  if (MULTI_AIRPORT_LABELS[v]) return MULTI_AIRPORT_LABELS[v];
  return String(val);
};

// Lightweight mobile-friendly inputs for the quick panel
const CityAutocomplete = ({ placeholder, value, onChange, airports = [], excludeCity, highlight = false }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const filter = (q) => {
    const term = (q || '').toLowerCase();
    const pool = airports || [];
    const filtered = pool.filter(a => {
      const n = (a.name || '').toLowerCase();
      const f = (a.fullName || '').toLowerCase();
      const c = (a.code || '').toLowerCase();
      const country = (a.country || '').toLowerCase();
      if (excludeCity && a.name === excludeCity) return false;
      return n.includes(term) || f.includes(term) || c.includes(term) || country.includes(term);
    }).slice(0, 8);
    setSuggestions(filtered);
  };

  useEffect(() => { filter(inputValue); }, [inputValue]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onFocus={() => { setOpen(true); filter(inputValue); }}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`w-full px-3 py-2 border rounded-xl focus:ring-2 transition-all ${highlight ? 'border-blue-400 ring-2 ring-blue-200 animate-soft-pulse' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto">
          {suggestions.map((a, idx) => (
            <div
              key={`${a.code || a.name}-${idx}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const isAll = (a.name || '').toLowerCase().includes('all airports');
                onChange(isAll ? (a.code || inputValue) : (a.name || inputValue));
                setInputValue(isAll ? (a.name || a.code || '') : (a.name || ''));
                setOpen(false);
              }}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 text-sm"
            >
              <div className="font-medium text-gray-800">{a.name} {a.code ? `(${a.code})` : ''}</div>
              {a.fullName && <div className="text-xs text-gray-500">{a.fullName}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SimpleDatePicker = ({ value, onChange, minDate, highlight = false }) => {
  const today = new Date();
  const fmt = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split('T')[0];
  const min = minDate || fmt(today);
  const addDays = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return fmt(d);
  };
  const nextSaturday = () => {
    const d = new Date();
    const diff = (6 - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);
    return fmt(d);
  };
  const nextWeekend = () => {
    const d = new Date();
    const diff = (6 - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff + 7);
    return fmt(d);
  };

  const chips = [
    { label: 'Today', date: fmt(today) },
    { label: 'Tomorrow', date: addDays(1) },
    { label: 'This Weekend', date: nextSaturday() },
    { label: 'Next Weekend', date: nextWeekend() },
  ];

  const disabled = (d) => (d < min);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-2">
        {chips.map((c) => (
          <button
            key={c.label}
            disabled={disabled(c.date)}
            onClick={() => onChange(c.date)}
            className={`px-2.5 py-1.5 rounded-full text-xs border ${disabled(c.date) ? 'border-gray-200 text-gray-300' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <input
        type="date"
        value={value || ''}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-xl focus:ring-2 transition-all ${highlight ? 'border-blue-400 ring-2 ring-blue-200 animate-soft-pulse' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
      />
    </div>
  );
};

// Airline logos and brand colors
const AIRLINE_INFO = {
  "IndiGo": { logo: "6E", color: "bg-indigo-600", textColor: "text-white" },
  "Air India": { logo: "AI", color: "bg-red-600", textColor: "text-white" },
  "SpiceJet": { logo: "SG", color: "bg-yellow-500", textColor: "text-white" },
  "Vistara": { logo: "UK", color: "bg-purple-600", textColor: "text-white" },
  "GoFirst": { logo: "G8", color: "bg-orange-500", textColor: "text-white" },
  "AirAsia India": { logo: "I5", color: "bg-red-500", textColor: "text-white" },
  "Emirates": { logo: "EK", color: "bg-red-700", textColor: "text-white" },
  "Qatar Airways": { logo: "QR", color: "bg-purple-800", textColor: "text-white" },
  "Singapore Airlines": { logo: "SQ", color: "bg-blue-800", textColor: "text-white" },
  "Thai Airways": { logo: "TG", color: "bg-purple-700", textColor: "text-white" },
  "Lufthansa": { logo: "LH", color: "bg-blue-900", textColor: "text-white" },
  "British Airways": { logo: "BA", color: "bg-blue-700", textColor: "text-white" },
  "Default": { logo: "✈️", color: "bg-gray-600", textColor: "text-white" }
};

// Enhanced Results Header with Modify and Date Navigation
const ResultsHeader = ({ searchData, filteredFlights, onModifySearch, onDateChange, onSetSort, activeSort }) => {
  const [showModifyModal, setShowModifyModal] = useState(false);
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const generateDateOptions = () => {
    const today = new Date();
    const dates = [];
    
    // Generate 7 days from today
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        display: formatDate(date.toISOString().split('T')[0]),
        day: date.getDate(),
        price: Math.floor(Math.random() * 5000) + 2000 // Mock price variation
      });
    }
    
    return dates;
  };

  const dateOptions = generateDateOptions();
  const currentDate = searchData?.segments?.[0]?.departureDate;

  return (
    <>
      {/* Main Results Header */}
      <div className="bg-white rounded-xl shadow-sm mb-6 sticky top-0 z-40">
        {/* Search Summary Bar */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              {/* Route Info */}
              <div className="flex items-center space-x-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{prettyCity(searchData?.segments?.[0]?.origin) || 'Origin'}</div>
                  <div className="text-sm text-gray-500">From</div>
                </div>
                <div className="text-2xl text-blue-600">✈️</div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{prettyCity(searchData?.segments?.[0]?.destination) || 'Destination'}</div>
                  <div className="text-sm text-gray-500">To</div>
                </div>
              </div>
              
              {/* Travel Details */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span>📅</span>
                  <span>{formatDate(currentDate)} • {searchData?.tripType === 'return' ? 'Round Trip' : 'One Way'}</span>
            <div className="md:hidden">
              <button
                onClick={() => setShowModifyModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                ✏️ Change Search
              </button>
            </div>

                </div>
                <div className="flex items-center space-x-2">
                  <span>👥</span>
                  <span>{(searchData?.passengers?.adults || 1) + (searchData?.passengers?.children || 0)} Passenger{((searchData?.passengers?.adults || 1) + (searchData?.passengers?.children || 0)) > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🎫</span>
                  <span className="capitalize">{searchData?.class || 'Economy'}</span>
                </div>
              </div>
            </div>
            
            {/* Modify Button */}
            <button
              onClick={() => setShowModifyModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <span>✏️</span>
              <span>Modify Search</span>
            </button>
          </div>
        </div>

        {/* Simple Sort Buttons for layman-friendliness */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              {filteredFlights.length} Flight{filteredFlights.length !== 1 ? 's' : ''} Found
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 mr-1">Sort:</span>
              {[
                { key: 'price', label: 'Cheapest' },
                { key: 'departure', label: 'Earliest' },
                { key: 'duration', label: 'Fastest' }
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => onSetSort && onSetSort(opt.key)}
                  className={`px-3 py-1.5 rounded-full border ${activeSort === opt.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date Navigation Bar */}
        <div className="p-4">
          <div className="text-sm text-gray-600 mb-2">Compare prices for different dates</div>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <button className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {dateOptions.map((dateOption) => {
              const isSelected = dateOption.date === currentDate;
              return (
                <button
                  key={dateOption.date}
                  onClick={() => onDateChange && onDateChange(dateOption.date)}
                  className={`flex-shrink-0 p-3 rounded-xl text-center min-w-[80px] transition-all ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-xs font-medium">{dateOption.display.split(' ')[0]}</div>
                  <div className="text-lg font-bold">{dateOption.day}</div>
                  <div className="text-xs">₹{dateOption.price.toLocaleString()}</div>
                </button>
              );
            })}
            <button className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modify Search Modal */}
      {showModifyModal && (
        <ModifySearchModal 
          searchData={searchData}
          onClose={() => setShowModifyModal(false)}
          onModify={onModifySearch}
        />
      )}
    </>
  );
};
// Modify Search Modal with Guided Experience
const ModifySearchModal = ({ searchData, onClose, onModify }) => {
  const [formData, setFormData] = useState({
    origin: searchData?.segments?.[0]?.origin || '',
    destination: searchData?.segments?.[0]?.destination || '',
    departureDate: searchData?.segments?.[0]?.departureDate || '',
    passengers: searchData?.passengers || { adults: 1, children: 0, infants: 0 },
    class: searchData?.class || 'economy',
    tripType: searchData?.tripType || 'one-way'
  });
  
  const [step, setStep] = useState(1);
  
  const canProceed = (stepNum) => {
    switch(stepNum) {
      case 1: return formData.origin.length > 2;
      case 2: return formData.destination.length > 2;
      case 3: return formData.departureDate;
      case 4: return true;
      default: return false;
    }
  };

  const handleSearch = () => {
    const modifiedData = {
      ...searchData,
      segments: [{
        origin: formData.origin,
        destination: formData.destination,
        departureDate: formData.departureDate
      }],
      passengers: formData.passengers,
      class: formData.class,
      tripType: formData.tripType
    };
    onModify(modifiedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Modify Your Search</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-2">Update your travel preferences and search again</p>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className={`flex items-center ${stepNum < 4 ? 'flex-1' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  canProceed(stepNum) ? 'bg-green-500 text-white' : 
                  step === stepNum ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {canProceed(stepNum) ? '✓' : stepNum}
                </div>
                {stepNum < 4 && <div className={`flex-1 h-1 mx-2 ${canProceed(stepNum) ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Origin */}
          <div className={step >= 1 ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => {setFormData({...formData, origin: e.target.value}); setStep(2);}}
              placeholder="Departure city"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {step === 1 && !formData.origin && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center text-blue-700">
                  <span className="text-xl mr-2">👆</span>
                  <span className="text-sm font-medium">Start by entering your departure city</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Destination */}
          <div className={step >= 2 ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => {setFormData({...formData, destination: e.target.value}); setStep(3);}}
              placeholder="Arrival city"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {step === 2 && !formData.destination && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center text-green-700">
                  <span className="text-xl mr-2">✈️</span>
                  <span className="text-sm font-medium">Great! Now enter your destination</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Date */}
          <div className={step >= 3 ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
            <input
              type="date"
              value={formData.departureDate}
              onChange={(e) => {setFormData({...formData, departureDate: e.target.value}); setStep(4);}}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {step === 3 && !formData.departureDate && (
              <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-center text-purple-700">
                  <span className="text-xl mr-2">📅</span>
                  <span className="text-sm font-medium">Perfect! When would you like to travel?</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Passengers & Class */}
          <div className={step >= 4 ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                <div className="flex items-center space-x-4 p-3 border-2 border-gray-200 rounded-xl">
                  <span className="text-sm text-gray-600">Adults:</span>
                  <button 
                    onClick={() => setFormData({...formData, passengers: {...formData.passengers, adults: Math.max(1, formData.passengers.adults - 1)}})}
                    className="w-8 h-8 bg-gray-100 rounded-full"
                  >-</button>
                  <span className="font-bold">{formData.passengers.adults}</span>
                  <button 
                    onClick={() => setFormData({...formData, passengers: {...formData.passengers, adults: formData.passengers.adults + 1}})}
                    className="w-8 h-8 bg-gray-100 rounded-full"
                  >+</button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  value={formData.class}
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="economy">Economy</option>
                  <option value="premium-economy">Premium Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>
            </div>
            
            {step === 4 && (
              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-center text-orange-700">
                  <span className="text-xl mr-2">👥</span>
                  <span className="text-sm font-medium">Almost done! Review your passenger and class preferences</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSearch}
              disabled={!canProceed(4)}
              className={`px-8 py-3 font-semibold rounded-xl transition-all ${
                canProceed(4)
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              🚀 Search Modified Flights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const FlightFilters = ({ filters, onFilterChange, flights }) => {
  // Extract unique airlines from flights
  const airlines = [...new Set(flights.map(f => f.airline))];
  
  // Price range
  const prices = flights.map(f => f.price || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
        🔧 Filters
        <button 
          onClick={() => onFilterChange({
            sortBy: 'price', 
            priceRange: [0, 50000], 
            airlines: [], 
            stops: [],
            departureTime: [],
            flightDuration: [],
            services: [],
            refundPolicy: []
          })}
          className="ml-auto text-sm text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </h3>
      
      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          💰 Price Range
        </label>
        <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 mb-2">
          ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
        </div>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={filters.priceRange[1]}
          onChange={(e) => onFilterChange({...filters, priceRange: [minPrice, parseInt(e.target.value)]})}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Airlines */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          ✈️ Airlines
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {airlines.map(airline => (
            <label key={airline} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters.airlines.includes(airline)}
                onChange={(e) => {
                  const newAirlines = e.target.checked 
                    ? [...filters.airlines, airline]
                    : filters.airlines.filter(a => a !== airline);
                  onFilterChange({...filters, airlines: newAirlines});
                }}
                className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-700">{airline}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {flights.filter(f => f.airline === airline).length}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Stops */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          🛑 Stops
        </label>
        <div className="space-y-2">
          {[
            { value: 0, label: 'Non-stop', icon: '🟢' },
            { value: 1, label: '1 Stop', icon: '🟡' },
            { value: 2, label: '2+ Stops', icon: '🔴' }
          ].map(stop => (
            <label key={stop.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters.stops.includes(stop.value)}
                onChange={(e) => {
                  const newStops = e.target.checked 
                    ? [...filters.stops, stop.value]
                    : filters.stops.filter(s => s !== stop.value);
                  onFilterChange({...filters, stops: newStops});
                }}
                className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-700">
                  {stop.icon} {stop.label}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {flights.filter(f => {
                    if (stop.value === 2) return f.stops >= 2;
                    return f.stops === stop.value;
                  }).length}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Departure Time Ranges */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          🕐 Departure Time
        </label>
        <div className="space-y-2">
          {[
            { value: 'early-morning', label: 'Early Morning', icon: '🌅', time: '6-12 AM' },
            { value: 'afternoon', label: 'Afternoon', icon: '☀️', time: '12-6 PM' },
            { value: 'evening', label: 'Evening', icon: '🌆', time: '6-12 PM' },
            { value: 'night', label: 'Night', icon: '🌙', time: '12-6 AM' }
          ].map(timeSlot => (
            <label key={timeSlot.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters.departureTime?.includes(timeSlot.value)}
                onChange={(e) => {
                  const newDepartureTimes = e.target.checked 
                    ? [...(filters.departureTime || []), timeSlot.value]
                    : (filters.departureTime || []).filter(t => t !== timeSlot.value);
                  onFilterChange({...filters, departureTime: newDepartureTimes});
                }}
                className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{timeSlot.icon}</span>
                  <div>
                    <div className="text-sm text-gray-700">{timeSlot.label}</div>
                    <div className="text-xs text-gray-500">{timeSlot.time}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {flights.filter(f => {
                    if (!f.departure_time) return false;
                    const hour = parseInt(f.departure_time.split(':')[0]);
                    switch(timeSlot.value) {
                      case 'early-morning': return hour >= 6 && hour < 12;
                      case 'afternoon': return hour >= 12 && hour < 18;
                      case 'evening': return hour >= 18 && hour < 24;
                      case 'night': return hour >= 0 && hour < 6;
                      default: return false;
                    }
                  }).length}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Flight Duration */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          ⏱️ Flight Duration
        </label>
        <div className="space-y-2">
          {[
            { value: 'short', label: 'Short (<2 hours)', icon: '⚡' },
            { value: 'medium', label: 'Medium (2-4 hours)', icon: '✈️' },
            { value: 'long', label: 'Long (4-6 hours)', icon: '🛫' },
            { value: 'very-long', label: 'Very Long (6+ hours)', icon: '🌍' }
          ].map(duration => (
            <label key={duration.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters.flightDuration?.includes(duration.value)}
                onChange={(e) => {
                  const newDurations = e.target.checked 
                    ? [...(filters.flightDuration || []), duration.value]
                    : (filters.flightDuration || []).filter(d => d !== duration.value);
                  onFilterChange({...filters, flightDuration: newDurations});
                }}
                className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-700">
                  {duration.icon} {duration.label}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {flights.filter(f => {
                    const durationMinutes = f.duration_minutes || 0;
                    const hours = durationMinutes / 60;
                    switch(duration.value) {
                      case 'short': return hours < 2;
                      case 'medium': return hours >= 2 && hours < 4;
                      case 'long': return hours >= 4 && hours < 6;
                      case 'very-long': return hours >= 6;
                      default: return false;
                    }
                  }).length}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Baggage & Services */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          🎒 Baggage & Services  
        </label>
        <div className="space-y-2">
          {[
            { value: 'free-baggage', label: 'Free Checked Baggage', icon: '🎒' },
            { value: 'meal-included', label: 'Meal Included', icon: '🍽️' },
            { value: 'wifi', label: 'In-flight WiFi', icon: '📶' },
            { value: 'entertainment', label: 'Entertainment System', icon: '📺' }
          ].map(service => (
            <label key={service.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters.services?.includes(service.value)}
                onChange={(e) => {
                  const newServices = e.target.checked 
                    ? [...(filters.services || []), service.value]
                    : (filters.services || []).filter(s => s !== service.value);
                  onFilterChange({...filters, services: newServices});
                }}
                className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-700">
                  {service.icon} {service.label}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {Math.floor(Math.random() * flights.length / 2) + 1}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Refundability */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          🔄 Refund Policy
        </label>
        <div className="space-y-2">
          {[
            { value: 'refundable', label: 'Refundable', icon: '✅' },
            { value: 'partially-refundable', label: 'Partially Refundable', icon: '⚠️' },
            { value: 'non-refundable', label: 'Non-Refundable', icon: '❌' }
          ].map(refund => (
            <label key={refund.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters.refundPolicy?.includes(refund.value)}
                onChange={(e) => {
                  const newRefundPolicies = e.target.checked 
                    ? [...(filters.refundPolicy || []), refund.value]
                    : (filters.refundPolicy || []).filter(r => r !== refund.value);
                  onFilterChange({...filters, refundPolicy: newRefundPolicies});
                }}
                className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-700">
                  {refund.icon} {refund.label}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {Math.floor(Math.random() * flights.length / 3) + 1}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// Individual Flight Card Component with Fare Options
const FlightCard = ({ flight, onSelect, isSelected }) => {
  const airlineInfo = AIRLINE_INFO[flight.airline] || AIRLINE_INFO["Default"];
  const [showFares, setShowFares] = useState(false);
  
  // Generate fare options for this flight with cancellation charges
  const baseFare = flight.price || 5000;
  const fareOptions = [
    {
      id: 'saver',
      name: 'Saver',
      type: 'Non-Refundable',
      price: baseFare,
      originalPrice: baseFare + Math.round(baseFare * 0.05),
      features: ['❌ Non-refundable', '7kg cabin bag'],
      cancellationCharges: 'No refund allowed',
      popular: false,
      savings: Math.round(baseFare * 0.05)
    },
    {
      id: 'flexi', 
      name: 'Flexi',
      type: 'Partially Refundable',
      price: baseFare + Math.round(baseFare * 0.15),
      originalPrice: baseFare + Math.round(baseFare * 0.20),
      features: ['✅ Refund with charges', '15kg checked bag', '1 free change'],
      cancellationCharges: 'Starting from ₹2,500',
      popular: true,
      savings: Math.round(baseFare * 0.05)
    },
    {
      id: 'business',
      name: 'Business',
      type: 'Fully Refundable', 
      price: baseFare + Math.round(baseFare * 0.35),
      originalPrice: baseFare + Math.round(baseFare * 0.45),
      features: ['✅ Full refund', '25kg checked bag', 'Priority boarding'],
      cancellationCharges: 'Starting from ₹1,000',
      popular: false,
      savings: Math.round(baseFare * 0.10)
    }
  ];
  
  // Parse departure time to determine time slot
  const getDepartureIcon = (time) => {
    if (!time) return "🕐";
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return "🌅";
    if (hour >= 12 && hour < 18) return "☀️";
    if (hour >= 18 && hour < 24) return "🌅";
    return "🌙";
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    // Convert minutes to hours and minutes
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const getStopText = (stops) => {
    if (stops === 0) return "Non-stop";
    if (stops === 1) return "1 stop";
    return `${stops} stops`;
  };

  const handleFareSelect = (fare) => {
    const flightWithFare = {
      ...flight,
      selectedFare: fare,
      finalPrice: fare.price
    };
    onSelect(flightWithFare);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 mb-4 border-2 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-200'
    }`}>
      {/* Main Flight Info */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Left: Airline and Flight Info */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Airline Logo */}
            <div className={`${airlineInfo.color} ${airlineInfo.textColor} w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg`}>
              {airlineInfo.logo}
            </div>
            
            {/* Flight Details */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="font-bold text-lg text-gray-900">{flight.airline}</div>
                {flight.is_lcc && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                    💰 Low Cost
                  </span>
                )}
                {flight.refundable && (
                  <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                    ✅ Refundable
                  </span>
                )}
              </div>
              
              {/* Time and Route */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{flight.departure_time}</div>
                  <div className="text-sm text-gray-500">{flight.origin}</div>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">{formatDuration(flight.duration_minutes)}</div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                      <div className={`flex-1 h-0.5 ${flight.stops === 0 ? 'bg-green-400' : 'bg-orange-400'} mx-2`}></div>
                      <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{getStopText(flight.stops)}</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{flight.arrival_time}</div>
                  <div className="text-sm text-gray-500">{flight.destination}</div>
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center">
                  {getDepartureIcon(flight.departure_time)} Departure
                </span>
                <span>Flight {flight.flight_number || 'N/A'}</span>
                <span>{flight.aircraft_type || 'Aircraft'}</span>
              </div>
            </div>
          </div>

          {/* Right: Price and Action */}
          <div className="text-right ml-6">
            <div className="mb-4">
              <div className="text-sm text-gray-500">Starting from</div>
              <div className="text-3xl font-bold text-blue-600">₹{(flight.price || 0).toLocaleString()}</div>
              <div className="text-sm text-gray-500">per person</div>
            </div>
            
            <button
              onClick={() => setShowFares(!showFares)}
              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl mb-2 block w-full ${
                showFares
                  ? 'bg-blue-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {showFares ? 'Hide Fares' : 'View Fares'}
            </button>
          </div>
        </div>
      </div>

      {/* Fare Options Panel */}
      {showFares && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="mb-3">
            <h4 className="text-lg font-semibold text-gray-800">Select Fare Type</h4>
            <p className="text-sm text-gray-600">Choose the fare that suits your needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fareOptions.map((fare) => (
              <div
                key={fare.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  fare.popular ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
                onClick={() => handleFareSelect(fare)}
              >
                {fare.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-3">
                  <h5 className="font-bold text-gray-900">{fare.name}</h5>
                  <p className="text-xs text-gray-600">{fare.type}</p>
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    📋 {fare.cancellationCharges}
                  </p>
                </div>
                
                <div className="text-center mb-3">
                  {fare.originalPrice > fare.price && (
                    <div className="text-sm text-gray-500 line-through">₹{fare.originalPrice.toLocaleString()}</div>
                  )}
                  <div className="text-2xl font-bold text-blue-600">₹{fare.price.toLocaleString()}</div>
                  {fare.savings > 0 && (
                    <div className="text-xs text-green-600 font-medium">Save ₹{fare.savings}</div>
                  )}
                </div>
                
                <div className="space-y-1">
                  {fare.features.map((feature, idx) => (
                    <div key={idx} className="text-xs text-gray-700 flex items-center">
                      <span className="mr-2">•</span>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                  Select {fare.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Flight Results Component
const FlightResults = ({ searchData, flights, onFlightSelect, isLoading, onModifySearch, onDateChange, airports }) => {
  const [filters, setFilters] = useState({
    sortBy: 'price',
    priceRange: [0, 100000],
    airlines: [],
    stops: [], // No filters selected by default - show all flights
    timeSlots: [], // No time filters selected by default
    departureTime: [], // New enhanced filters
    flightDuration: [],
    services: [],
    refundPolicy: []
  });
  
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showMobileModify, setShowMobileModify] = useState(false);
  const [mobileForm, setMobileForm] = useState({
    origin: searchData?.segments?.[0]?.origin || '',
    destination: searchData?.segments?.[0]?.destination || '',
    departureDate: searchData?.segments?.[0]?.departureDate || '',
    returnDate: searchData?.returnDate || '',
    tripType: searchData?.tripType || 'one-way'
  });

  // Update price range when flights change
  useEffect(() => {
    if (flights.length > 0) {
      const prices = flights.map(f => f.price || 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setFilters(prev => ({
        ...prev,
        priceRange: [minPrice, maxPrice]
      }));
    }
  }, [flights]);

  // Filter and sort flights
  const getFilteredFlights = () => {
    if (!flights || flights.length === 0) return [];

    let filtered = flights.filter(flight => {
      // Price filter
      const price = flight.price || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;

      // Airline filter
      if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) return false;

      // Stops filter - show all if no filter selected
      if (filters.stops.length > 0) {
        const stops = flight.stops || 0;
        const stopCategory = stops === 0 ? 0 : stops === 1 ? 1 : 2;
        if (!filters.stops.includes(stopCategory)) return false;
      }

      // Time slot filter
      if (filters.timeSlots.length > 0) {
        const hour = parseInt((flight.departure_time || '12:00').split(':')[0]);
        let timeSlot;
        if (hour >= 6 && hour < 12) timeSlot = 'early';
        else if (hour >= 12 && hour < 18) timeSlot = 'afternoon';
        else if (hour >= 18 && hour < 24) timeSlot = 'evening';
        else timeSlot = 'night';
        
        if (!filters.timeSlots.includes(timeSlot)) return false;
      }

      // Enhanced Departure Time Filter
      if (filters.departureTime.length > 0) {
        const hour = parseInt((flight.departure_time || '12:00').split(':')[0]);
        let matchesTimeFilter = false;
        
        filters.departureTime.forEach(timeFilter => {
          switch(timeFilter) {
            case 'early-morning':
              if (hour >= 6 && hour < 12) matchesTimeFilter = true;
              break;
            case 'afternoon':
              if (hour >= 12 && hour < 18) matchesTimeFilter = true;
              break;
            case 'evening':
              if (hour >= 18 && hour < 24) matchesTimeFilter = true;
              break;
            case 'night':
              if (hour >= 0 && hour < 6) matchesTimeFilter = true;
              break;
          }
        });
        
        if (!matchesTimeFilter) return false;
      }

      // Flight Duration Filter
      if (filters.flightDuration.length > 0) {
        const durationMinutes = flight.duration_minutes || 0;
        const hours = durationMinutes / 60;
        let matchesDurationFilter = false;
        
        filters.flightDuration.forEach(duration => {
          switch(duration) {
            case 'short':
              if (hours < 2) matchesDurationFilter = true;
              break;
            case 'medium':
              if (hours >= 2 && hours < 4) matchesDurationFilter = true;
              break;
            case 'long':
              if (hours >= 4 && hours < 6) matchesDurationFilter = true;
              break;
            case 'very-long':
              if (hours >= 6) matchesDurationFilter = true;
              break;
          }
        });
        
        if (!matchesDurationFilter) return false;
      }

      // Services Filter (mock implementation)
      if (filters.services.length > 0) {
        // In a real implementation, this would check flight.services or similar
        // For now, we'll simulate some flights having these services
        const flightServices = [];
        if (flight.price > 5000) flightServices.push('free-baggage');
        if (flight.airline && ['Air India', 'Vistara', 'Emirates'].includes(flight.airline)) {
          flightServices.push('meal-included', 'entertainment');
        }
        if (flight.airline && ['Emirates', 'Qatar Airways', 'Singapore Airlines'].includes(flight.airline)) {
          flightServices.push('wifi');
        }
        
        const hasRequiredServices = filters.services.some(service => 
          flightServices.includes(service)
        );
        
        if (!hasRequiredServices) return false;
      }

      // Refund Policy Filter (mock implementation)
      if (filters.refundPolicy.length > 0) {
        // In a real implementation, this would check flight.refundable or similar
        let flightRefundPolicy = 'non-refundable';
        if (flight.refundable) flightRefundPolicy = 'refundable';
        else if (flight.price > 7000) flightRefundPolicy = 'partially-refundable';
        
        if (!filters.refundPolicy.includes(flightRefundPolicy)) return false;
      }

      return true;
    });

    // Sort flights
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'duration':
          return (a.duration_minutes || 0) - (b.duration_minutes || 0);
        case 'departure':
          return (a.departure_time || '').localeCompare(b.departure_time || '');
        case 'arrival':
          return (a.arrival_time || '').localeCompare(b.arrival_time || '');
        case 'stops':
          return (a.stops || 0) - (b.stops || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredFlights = getFilteredFlights();

  const handleFlightSelect = (flight) => {
    console.log('🔍 FlightResults handleFlightSelect called with:', flight);
    setSelectedFlight(flight);
    onFlightSelect(flight);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Searching Best Flights...</h3>
          <p className="text-gray-600">Finding the perfect flights for your trip</p>
        </div>
      </div>
    );
  }

  if (!flights || flights.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Enhanced Results Header */}
          <ResultsHeader 
            searchData={searchData}
            filteredFlights={filteredFlights}
            onModifySearch={onModifySearch}
            onDateChange={onDateChange}
            onSetSort={(key) => setFilters(prev => ({ ...prev, sortBy: key }))}
            activeSort={filters.sortBy}
          />

          {/* Mobile Quick Change Search Button */}
          <div className="md:hidden sticky top-14 z-30 mb-3">
            <div className="flex justify-center">
              <button
                onClick={() => setShowMobileModify(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 text-sm"
              >
                ✏️ Change Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar - Collapsible on Mobile */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <FlightFilters 
                  filters={filters}
                  onFilterChange={setFilters}
                  flights={flights}
                />
              </div>
            </div>

            {/* Flight Results - Enhanced Layout */}
            <div className="lg:col-span-3">
              <div className="space-y-3">
                {filteredFlights.map((flight, index) => (
                  <FlightCard
                    key={index}
                    flight={flight}
                    onSelect={handleFlightSelect}
                    isSelected={selectedFlight === flight}
                  />
                ))}
              </div>
              
              {filteredFlights.length === 0 && flights.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights match your filters</h3>
                  <p className="text-gray-600">Try removing some filters to see more results</p>
                  <button 
                    onClick={() => setFilters({sortBy: 'price', priceRange: [0, 50000], airlines: [], stops: []})}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Modify Panel */}
      {showMobileModify && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Change Search</h3>
              <button onClick={() => setShowMobileModify(false)} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
              <div className="inline-flex bg-gray-100 rounded-full p-1">
                <button
                  className={`px-3 py-1 text-xs rounded-full ${mobileForm.tripType !== 'return' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setMobileForm(prev => ({ ...prev, tripType: 'one-way', returnDate: '' }))}
                >
                  One-way
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-full ${mobileForm.tripType === 'return' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setMobileForm(prev => ({ ...prev, tripType: 'return' }))}
                >
                  Return
                </button>
              </div>
              <span className="text-gray-500">Update your trip details and search again</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <CityAutocomplete
                  placeholder="Departure city"
                  value={mobileForm.origin}
                  onChange={(city) => setMobileForm(prev => ({ ...prev, origin: city }))}
                  airports={airports}
                  excludeCity={mobileForm.destination}
                  highlight={!mobileForm.origin}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <CityAutocomplete
                    placeholder="Arrival city"
                    value={mobileForm.destination}
                    onChange={(city) => setMobileForm(prev => ({ ...prev, destination: city }))}
                    airports={airports}
                    excludeCity={mobileForm.origin}
                    highlight={mobileForm.origin && !mobileForm.destination}
                  />
                </div>
                <button
                  onClick={() => setMobileForm(prev => ({ ...prev, origin: prev.destination, destination: prev.origin }))}
                  className="px-3 py-2 border rounded-xl text-sm text-gray-700 hover:bg-gray-50"
                  aria-label="Swap From and To"
                >
                  ⇄ Swap
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                <SimpleDatePicker
                  value={mobileForm.departureDate}
                  onChange={(date) => setMobileForm(prev => ({ ...prev, departureDate: date }))}
                  minDate={new Date().toISOString().split('T')[0]}
                  highlight={mobileForm.origin && mobileForm.destination && !mobileForm.departureDate}
                />
              </div>
              {mobileForm.tripType === 'return' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                  <SimpleDatePicker
                    value={mobileForm.returnDate}
                    onChange={(date) => setMobileForm(prev => ({ ...prev, returnDate: date }))}
                    minDate={mobileForm.departureDate || new Date().toISOString().split('T')[0]}
                    highlight={mobileForm.departureDate && !mobileForm.returnDate}
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setShowMobileModify(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const canSearch = mobileForm.origin?.length > 2 && mobileForm.destination?.length > 2 && mobileForm.departureDate && (mobileForm.tripType !== 'return' || (mobileForm.returnDate && mobileForm.returnDate >= mobileForm.departureDate));
                    if (!canSearch) return;
                    const modifiedData = {
                      ...searchData,
                      segments: [{ ...searchData.segments[0], origin: mobileForm.origin, destination: mobileForm.destination, departureDate: mobileForm.departureDate }],
                      returnDate: mobileForm.returnDate,
                      tripType: mobileForm.tripType
                    };
                    onModifySearch && onModifySearch(modifiedData);
                    setShowMobileModify(false);
                  }}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl shadow-md disabled:opacity-50"
                  disabled={!(mobileForm.origin?.length > 2 && mobileForm.destination?.length > 2 && mobileForm.departureDate && (mobileForm.tripType !== 'return' || (mobileForm.returnDate && mobileForm.returnDate >= mobileForm.departureDate)))}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FlightResults;