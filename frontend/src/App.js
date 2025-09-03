import React, { useState, useRef, useEffect, useMemo } from 'react';
import './App.css';

// TOURSMILE HOMEPAGE - CLEAN WORKING IMPLEMENTATION
// Mobile-first responsive with proper breakpoints

// Airport data
const CITIES = [
  { city: "Mumbai", iata: "BOM", airport: "Chhatrapati Shivaji Maharaj Intl" },
  { city: "Delhi", iata: "DEL", airport: "Indira Gandhi Intl" },
  { city: "Bengaluru", iata: "BLR", airport: "Kempegowda Intl" },
  { city: "Hyderabad", iata: "HYD", airport: "Rajiv Gandhi Intl" },
  { city: "Pune", iata: "PNQ", airport: "Lohegaon" },
  { city: "Chennai", iata: "MAA", airport: "Chennai Intl" },
  { city: "Kolkata", iata: "CCU", airport: "Netaji Subhas Chandra Bose Intl" },
  { city: "Dubai", iata: "DXB", airport: "Dubai International" },
  { city: "Singapore", iata: "SIN", airport: "Singapore Changi" },
  { city: "Bangkok", iata: "BKK", airport: "Suvarnabhumi" }
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

// City Input Component
function CityInput({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 250);
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const filteredCities = useMemo(() => {
    if (!debouncedQuery) return [];
    return CITIES.filter(c => 
      (c.city + " " + c.iata + " " + c.airport).toLowerCase().includes(debouncedQuery.toLowerCase())
    ).slice(0, 6);
  }, [debouncedQuery]);
  
  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
      <div className="h-12 rounded-xl border border-neutral-300 flex items-center px-3 focus-within:ring-2 focus-within:ring-blue-200">
        <span className="h-4 w-4 text-neutral-500 mr-2">✈️</span>
        <input
          value={query || value.city}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setQuery(""); setOpen(true); }}
          placeholder="City or airport"
          className="outline-none bg-transparent text-sm flex-1"
        />
        <span className="text-[11px] text-neutral-500 font-mono uppercase">{value.iata}</span>
      </div>
      {open && filteredCities.length > 0 && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-md overflow-hidden">
          {filteredCities.map((c, i) => (
            <button
              key={i}
              onClick={() => { onChange(c); setOpen(false); setQuery(""); }}
              className="w-full text-left px-3 py-2 hover:bg-neutral-50"
            >
              <div className="text-sm font-medium text-neutral-900">
                {c.city} <span className="text-xs text-neutral-500">({c.iata})</span>
              </div>
              <div className="text-xs text-neutral-600">{c.airport}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Date Input Component
function DateInput({ label, value, onChange, title, disabled }) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const ref = useRef(null);
  
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
            const dateStr = date.toISOString().slice(0, 10);
            const isCurrentMonth = date.getMonth() === month;
            const isSelected = value === dateStr;
            
            return (
              <button 
                key={i} 
                onClick={() => { onChange(dateStr); setOpen(false); }}
                className={`aspect-square rounded-md text-sm flex items-center justify-center transition-colors ${
                  isCurrentMonth ? "text-neutral-900" : "text-neutral-400"
                } ${
                  isSelected ? "bg-blue-600 text-white" : "hover:bg-neutral-50"
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
        disabled={disabled} 
        onClick={() => !disabled && setOpen(true)} 
        className="h-12 w-full px-4 rounded-xl border border-neutral-300 text-left hover:bg-neutral-50 flex items-center justify-between disabled:opacity-50"
      >
        <span className="text-sm text-neutral-700">{value || label}</span>
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
function SearchCard() {
  const [trip, setTrip] = useState("RT");
  const [from, setFrom] = useState(CITIES[0]);
  const [to, setTo] = useState(CITIES[1]);
  const [depart, setDepart] = useState(null);
  const [ret, setRet] = useState(null);
  const [openPax, setOpenPax] = useState(false);
  const [pax, setPax] = useState({ adt: 1, chd: 0, inf: 0, cabin: "Economy" });
  const [results, setResults] = useState(null); // { flights: [], total_found, data_source, ai_recommendation }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const backendBase = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BACKEND_URL) || (typeof importMeta !== 'undefined' && import.meta.env && import.meta.env.REACT_APP_BACKEND_URL) || undefined;

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="rounded-2xl shadow-sm border border-neutral-200 bg-white p-4 md:p-6">
        {/* Trip Type Tabs */}
        <div className="inline-flex rounded-full bg-neutral-100 p-1">
          {[
            { id: "RT", label: "Round Trip" },
            { id: "OW", label: "One Way" },
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

        {/* From/To Row - Responsive Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <CityInput label="From" value={from} onChange={setFrom} />
          
          <button
            aria-label="Swap From and To"
            onClick={() => { const temp = from; setFrom(to); setTo(temp); }}
            className="h-11 w-11 mx-auto rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center"
          >
            <span className="text-lg">⇄</span>
          </button>
          
          <CityInput label="To" value={to} onChange={setTo} />
        </div>

        {/* Date and Passenger Row */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <DateInput label="Select Date" value={depart} onChange={setDepart} title="Departure" />
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
            <input type="checkbox" className="h-4 w-4" /> Direct flights
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4" /> Flexible dates ±3 days
          </label>
        </div>

        {/* Search Button */}
        <div className="mt-4">
          <button className="w-full h-12 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            Search Flights
          </button>
        </div>
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