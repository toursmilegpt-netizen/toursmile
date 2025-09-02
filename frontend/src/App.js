import React, { useState, useRef, useEffect, useMemo } from 'react';
import './App.css';

// TOURSMILE HOMEPAGE - EXACT PREVIEW IMPLEMENTATION
// React + Tailwind + Premium White Theme - EXACT MATCH

// Fake data for city autocomplete - EXACT AS PREVIEW
const CITIES = [
  { city: "Mumbai", iata: "BOM", airport: "Chhatrapati Shivaji Maharaj Intl" },
  { city: "Delhi", iata: "DEL", airport: "Indira Gandhi Intl" },
  { city: "Bengaluru", iata: "BLR", airport: "Kempegowda Intl" },
  { city: "Hyderabad", iata: "HYD", airport: "Rajiv Gandhi Intl" },
  { city: "Pune", iata: "PNQ", airport: "Lohegaon" },
  { city: "Chennai", iata: "MAA", airport: "Chennai Intl" },
  { city: "Kolkata", iata: "CCU", airport: "Netaji Subhas Chandra Bose Intl" },
  { city: "Ahmedabad", iata: "AMD", airport: "Sardar Vallabhbhai Patel Intl" },
  { city: "Goa", iata: "GOI", airport: "Goa International" },
  { city: "Kochi", iata: "COK", airport: "Cochin International" },
  { city: "Dubai", iata: "DXB", airport: "Dubai International" },
  { city: "Singapore", iata: "SIN", airport: "Singapore Changi" },
  { city: "Bangkok", iata: "BKK", airport: "Suvarnabhumi" },
  { city: "London", iata: "LHR", airport: "London Heathrow" },
  { city: "New York", iata: "JFK", airport: "John F. Kennedy Intl" }
];

// Debounced hook - EXACT IMPLEMENTATION
function useDebounced(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// Container Component - EXACT AS PREVIEW
const Container = ({ children }) => (
  <div className="min-h-screen bg-white text-neutral-900">
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-xl">
          <img 
            src="https://customer-assets.emergentagent.com/job_pixel-perfect-ui-12/artifacts/7qb5obai_FINAL%20LOGO%20-%20Copy.png"
            alt="TourSmile"
            className="h-10 w-auto"
          />
        </div>
        <nav className="hidden md:flex items-center gap-2">
          {[
            { label: "Flights", icon: "✈️" },
            { label: "Hotels", icon: "🏨" },
            { label: "Packages", icon: "🎁" },
            { label: "Activities", icon: "🎟️" },
          ].map((t, i) => (
            <button
              key={i}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                i === 0 ? "bg-blue-50 text-blue-700" : "text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              <span className="opacity-90">{t.icon}</span>
              <span className="text-sm font-medium">{t.label}</span>
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
    {children}
  </div>
);

// City Input Component - EXACT IMPLEMENTATION
function CityInput({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const deb = useDebounced(q, 250);
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const data = useMemo(() => {
    const results = CITIES.filter(c => 
      (c.city + " " + c.iata + " " + c.airport).toLowerCase().includes(deb.toLowerCase())
    );
    return results;
  }, [deb]);
  
  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
      <div className="h-12 rounded-xl border border-neutral-300 flex items-center px-3 focus-within:ring-2 focus-within:ring-blue-200">
        <span className="h-4 w-4 text-neutral-500 mr-2">✈️</span>
        <input
          value={q || `${value.city}`}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => { setQ(""); setOpen(true); }}
          placeholder="City or airport"
          className="outline-none bg-transparent text-sm flex-1"
        />
        <span className="text-[11px] text-neutral-500 font-mono uppercase">{value.iata}</span>
      </div>
      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-md overflow-hidden">
          {data.length === 0 && (
            <div className="px-3 py-3 text-sm text-neutral-600">No results</div>
          )}
          {data.map((c, i) => (
            <button
              key={i}
              onClick={() => { onChange(c); setOpen(false); setQ(""); }}
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

// Date Input Component - EXACT IMPLEMENTATION
function DateInput({ label, value, onChange, title, disabled }) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(new Date());
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addMonths = (d, n) => {
    const x = new Date(d);
    x.setMonth(x.getMonth() + n);
    return x;
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
        <div className="absolute z-30 mt-2 w-[22rem] rounded-xl border border-neutral-200 bg-white shadow-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">{title}</div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCursor(addMonths(cursor, -1))} 
                className="p-1 rounded hover:bg-neutral-50"
              >
                ‹
              </button>
              <button 
                onClick={() => setCursor(addMonths(cursor, 1))} 
                className="p-1 rounded hover:bg-neutral-50"
              >
                ›
              </button>
            </div>
          </div>
          <CalendarGrid month={cursor} value={value} onPick={(d) => { onChange(d); setOpen(false); }} />
        </div>
      )}
    </div>
  );
}

// Calendar Grid Component - EXACT IMPLEMENTATION
function CalendarGrid({ month, value, onPick }) {
  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1);
  const start = new Date(y, m, 1 - ((first.getDay() + 6) % 7)); // Week starts Monday
  const days = [];
  
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  
  const fmt = (d) => d.toISOString().slice(0, 10);
  const isSameMonth = (d) => d.getMonth() === m;
  const sel = value;
  
  return (
    <div>
      <div className="grid grid-cols-7 text-xs text-neutral-500 mb-1">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((w) => 
          <div key={w} className="py-1 text-center">{w}</div>
        )}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const ds = fmt(d);
          const isSel = sel === ds;
          return (
            <button 
              key={i} 
              onClick={() => onPick(ds)} 
              className={`aspect-square rounded-md text-sm flex items-center justify-center transition-colors ${
                isSameMonth(d) ? "text-neutral-900" : "text-neutral-400"
              } ${
                isSel ? "bg-blue-600 text-white" : "hover:bg-neutral-50"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Passenger Overlay - EXACT IMPLEMENTATION
function PaxOverlay({ value, onChange, onClose }) {
  const [p, setP] = useState(value);
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ref.current?.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);
  
  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }));
  const inc = (k) => set(k, Math.min(9, p[k] + 1));
  const dec = (k) => set(k, Math.max(0, p[k] - 1));
  
  useEffect(() => {
    if (p.inf > p.adt) set('inf', p.adt);
    if (p.adt < 1) set('adt', 1);
  }, [p.adt, p.inf]);

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
          <PaxRow label="Adults (12+)" hint="Ages 12+" value={p.adt} onInc={() => inc('adt')} onDec={() => dec('adt')} />
          <PaxRow label="Children (2–11)" hint="Ages 2–11" value={p.chd} onInc={() => inc('chd')} onDec={() => dec('chd')} />
          <PaxRow label="Infants (0–1)" hint="On lap" value={p.inf} onInc={() => inc('inf')} onDec={() => dec('inf')} />
          <div className="pt-2">
            <div className="text-sm font-medium mb-1">Cabin Class</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["Economy", "Premium Economy", "Business", "First"].map((c) => (
                <button 
                  key={c} 
                  onClick={() => set('cabin', c)} 
                  className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                    p.cabin === c ? "border-blue-400 bg-blue-50" : "border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-neutral-700">
            {p.adt}A, {p.chd}C, {p.inf}Inf · {p.cabin}
          </div>
          <button 
            onClick={() => { onChange(p); onClose(); }} 
            className="h-10 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// Passenger Row Component - EXACT IMPLEMENTATION
function PaxRow({ label, hint, value, onInc, onDec }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium" style={{ fontWeight: '500' }}>{label}</div>
        <div className="text-xs text-neutral-500">{hint}</div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onDec} 
          className="h-10 w-10 rounded-full border border-neutral-300 hover:bg-neutral-50 flex items-center justify-content center text-lg"
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

// Search Card Component - EXACT IMPLEMENTATION
function SearchCard() {
  const [trip, setTrip] = useState("RT");
  const [from, setFrom] = useState(CITIES[0]);
  const [to, setTo] = useState(CITIES[1]);
  const [depart, setDepart] = useState(null);
  const [ret, setRet] = useState(null);
  const [openPax, setOpenPax] = useState(false);
  const [pax, setPax] = useState({ adt: 1, chd: 0, inf: 0, cabin: "Economy" });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-2xl shadow-sm border border-neutral-200 bg-white p-4 md:p-6">
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

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <CityInput label="From" value={from} onChange={setFrom} />
          <button
            aria-label="Swap From and To"
            onClick={() => { const t = from; setFrom(to); setTo(t); }}
            className="h-11 w-11 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center"
          >
            <span className="text-lg">⇄</span>
          </button>
          <CityInput label="To" value={to} onChange={setTo} />
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <DateInput label="Select Date" value={depart} onChange={setDepart} title="Departure" />
          <DateInput label="Select Date" value={ret} onChange={setRet} title="Return" disabled={trip === "OW"} />
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

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4" /> Direct flights
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4" /> Flexible dates ±3 days
          </label>
        </div>

        <div className="mt-4">
          <button className="w-full h-12 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            Search Flights
          </button>
        </div>
      </div>
    </div>
  );
}

// Footer Component - EXACT IMPLEMENTATION
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

// Main App Component - EXACT IMPLEMENTATION
export default function App() {
  return (
    <Container>
      <main className="mx-auto max-w-7xl px-4 pb-24">
        <section className="text-center pt-14 md:pt-20 pb-8">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ letterSpacing: '-0.75px' }}>
            Book Your Perfect Flight
          </h1>
          <p className="mt-3 text-neutral-600">
            Smart search, best fares, effortless travel
          </p>
        </section>
        <SearchCard />

        <section className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🔒", t: "Secure Booking", s: "SSL encrypted payments" },
            { icon: "💬", t: "24×7 Support", s: "WhatsApp & phone support" },
            { icon: "🎯", t: "Personal Travel Assistant", s: "AI-powered recommendations just for you" },
            { icon: "⚡", t: "Instant Booking", s: "Confirmed in seconds" },
          ].map((b, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 p-4 bg-white hover:shadow-sm transition-shadow">
              <div className="text-2xl mb-2" aria-hidden>{b.icon}</div>
              <div className="text-sm font-medium" style={{ fontWeight: '500' }}>{b.t}</div>
              <div className="text-xs text-neutral-600 mt-0.5" style={{ fontWeight: '300' }}>{b.s}</div>
            </div>
          ))}
        </section>

        <Footer />
      </main>
    </Container>
  );
}