import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// TOURSMILE FLIGHT SEARCH - PIXEL-PERFECT FIGMA DEV MODE IMPLEMENTATION
// Using EXACT Figma Inspect values - no substitutions
// Mobile Frame: 390px | Colors: #4285F4, #FFA382 | Typography: Exact Figma specs

const AIRPORTS_DATABASE = [
  // INDIA - DOMESTIC AIRPORTS (Major & Secondary)
  
  // Delhi NCR - Multiple Airports
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', popular: true },
  { code: 'DWK', name: 'Dwarka Sector 21 Metro Airport', city: 'Delhi', country: 'India', popular: false },
  
  // Mumbai - Multiple Airports  
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', popular: true },
  { code: 'JUI', name: 'Juhu Aerodrome', city: 'Mumbai', country: 'India', popular: false },
  
  // Bangalore
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India', popular: true },
  
  // Chennai
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', popular: true },
  
  // Kolkata  
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', country: 'India', popular: true },
  
  // Hyderabad
  { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', popular: true },
  
  // Pune - Multiple Airports
  { code: 'PNQ', name: 'Pune International Airport', city: 'Pune', country: 'India', popular: true },
  { code: 'LNK', name: 'Lohegaon Air Force Station', city: 'Pune', country: 'India', popular: false },
  
  // Ahmedabad
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', country: 'India', popular: true },
  
  // Goa - Multiple Airports
  { code: 'GOI', name: 'Goa International Airport', city: 'Goa', country: 'India', popular: true },
  { code: 'INS', name: 'INS Hansa Naval Air Station', city: 'Goa', country: 'India', popular: false },
  
  // Kochi
  { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India', popular: true },
  
  // Thiruvananthapuram
  { code: 'TRV', name: 'Trivandrum International Airport', city: 'Thiruvananthapuram', country: 'India', popular: true },
  
  // Jaipur
  { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', country: 'India', popular: true },
  
  // Lucknow
  { code: 'LKO', name: 'Chaudhary Charan Singh International Airport', city: 'Lucknow', country: 'India', popular: true },
  
  // Chandigarh
  { code: 'IXC', name: 'Chandigarh International Airport', city: 'Chandigarh', country: 'India', popular: true },
  
  // Indore
  { code: 'IDR', name: 'Devi Ahilya Bai Holkar Airport', city: 'Indore', country: 'India', popular: true },
  
  // Bhubaneswar
  { code: 'BBI', name: 'Biju Patnaik International Airport', city: 'Bhubaneswar', country: 'India', popular: true },
  
  // Vishakhapatnam
  { code: 'VTZ', name: 'Visakhapatnam International Airport', city: 'Visakhapatnam', country: 'India', popular: true },
  
  // Coimbatore
  { code: 'CJB', name: 'Coimbatore International Airport', city: 'Coimbatore', country: 'India', popular: true },
  
  // Mangalore
  { code: 'IXE', name: 'Mangalore International Airport', city: 'Mangalore', country: 'India', popular: true },
  
  // Calicut
  { code: 'CCJ', name: 'Calicut International Airport', city: 'Calicut', country: 'India', popular: true },
  
  // Nagpur
  { code: 'NAG', name: 'Dr. Babasaheb Ambedkar International Airport', city: 'Nagpur', country: 'India', popular: true },
  
  // Vadodara
  { code: 'BDQ', name: 'Vadodara Airport', city: 'Vadodara', country: 'India', popular: true },
  
  // Surat
  { code: 'STV', name: 'Surat Airport', city: 'Surat', country: 'India', popular: true },
  
  // Patna
  { code: 'PAT', name: 'Jay Prakash Narayan Airport', city: 'Patna', country: 'India', popular: true },
  
  // Ranchi
  { code: 'IXR', name: 'Birsa Munda Airport', city: 'Ranchi', country: 'India', popular: true },
  
  // Guwahati
  { code: 'GAU', name: 'Lokpriya Gopinath Bordoloi International Airport', city: 'Guwahati', country: 'India', popular: true },
  
  // Bagdogra
  { code: 'IXB', name: 'Bagdogra Airport', city: 'Siliguri', country: 'India', popular: true },
  
  // Raipur
  { code: 'RPR', name: 'Swami Vivekananda Airport', city: 'Raipur', country: 'India', popular: true },
  
  // Jammu
  { code: 'IXJ', name: 'Jammu Airport', city: 'Jammu', country: 'India', popular: true },
  
  // Srinagar
  { code: 'SXR', name: 'Sheikh ul-Alam International Airport', city: 'Srinagar', country: 'India', popular: true },
  
  // Dehradun
  { code: 'DED', name: 'Jolly Grant Airport', city: 'Dehradun', country: 'India', popular: true },
  
  // Udaipur
  { code: 'UDR', name: 'Maharana Pratap Airport', city: 'Udaipur', country: 'India', popular: true },
  
  // Jodhpur
  { code: 'JDH', name: 'Jodhpur Airport', city: 'Jodhpur', country: 'India', popular: true },
  
  // Varanasi
  { code: 'VNS', name: 'Lal Bahadur Shastri Airport', city: 'Varanasi', country: 'India', popular: true },
  
  // Agra
  { code: 'AGR', name: 'Pandit Deen Dayal Upadhyay Airport', city: 'Agra', country: 'India', popular: true },
  
  // INTERNATIONAL AIRPORTS - POPULAR DESTINATIONS
  
  // UAE - Multiple Airports
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', popular: true },
  { code: 'DWC', name: 'Al Maktoum International Airport', city: 'Dubai', country: 'UAE', popular: false },
  { code: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'UAE', popular: true },
  { code: 'SHJ', name: 'Sharjah International Airport', city: 'Sharjah', country: 'UAE', popular: true },
  
  // Singapore
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', popular: true },
  
  // Thailand - Multiple Airports
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', popular: true },
  { code: 'DMK', name: 'Don Mueang International Airport', city: 'Bangkok', country: 'Thailand', popular: true },
  { code: 'HKT', name: 'Phuket International Airport', city: 'Phuket', country: 'Thailand', popular: true },
  
  // Malaysia
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', popular: true },
  
  // Hong Kong
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', popular: true },
  
  // Qatar
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', popular: true },
  
  // Saudi Arabia - Multiple Airports
  { code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', popular: true },
  { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia', popular: true },
  { code: 'DMM', name: 'King Fahd International Airport', city: 'Dammam', country: 'Saudi Arabia', popular: true },
  
  // Kuwait
  { code: 'KWI', name: 'Kuwait International Airport', city: 'Kuwait City', country: 'Kuwait', popular: true },
  
  // Oman
  { code: 'MCT', name: 'Muscat International Airport', city: 'Muscat', country: 'Oman', popular: true },
  
  // Bahrain
  { code: 'BAH', name: 'Bahrain International Airport', city: 'Manama', country: 'Bahrain', popular: true },
  
  // Turkey - Multiple Airports
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', popular: true },
  { code: 'SAW', name: 'Sabiha Gokcen International Airport', city: 'Istanbul', country: 'Turkey', popular: true },
  
  // UK - Multiple Airports
  { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'UK', popular: true },
  { code: 'LGW', name: 'London Gatwick Airport', city: 'London', country: 'UK', popular: true },
  { code: 'STN', name: 'London Stansted Airport', city: 'London', country: 'UK', popular: true },
  { code: 'LTN', name: 'London Luton Airport', city: 'London', country: 'UK', popular: false },
  { code: 'LCY', name: 'London City Airport', city: 'London', country: 'UK', popular: false },
  
  // USA - Multiple Airports
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', popular: true },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'USA', popular: true },
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'New York', country: 'USA', popular: true },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', popular: true },
  { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'USA', popular: true },
  { code: 'MDW', name: 'Midway International Airport', city: 'Chicago', country: 'USA', popular: false },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', popular: true },
  
  // Canada - Multiple Airports
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', popular: true },
  { code: 'YTZ', name: 'Billy Bishop Toronto City Airport', city: 'Toronto', country: 'Canada', popular: false },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', popular: true },
  
  // France - Multiple Airports
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', popular: true },
  { code: 'ORY', name: 'Orly Airport', city: 'Paris', country: 'France', popular: true },
  { code: 'BVA', name: 'Beauvais Airport', city: 'Paris', country: 'France', popular: false },
  
  // Germany - Multiple Airports
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', popular: true },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', popular: true },
  { code: 'TXL', name: 'Berlin Tegel Airport', city: 'Berlin', country: 'Germany', popular: true },
  { code: 'SXF', name: 'Berlin Schonefeld Airport', city: 'Berlin', country: 'Germany', popular: false },
  
  // Netherlands
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', popular: true },
  
  // Switzerland
  { code: 'ZUR', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', popular: true },
  
  // Italy - Multiple Airports
  { code: 'FCO', name: 'Leonardo da Vinci Airport', city: 'Rome', country: 'Italy', popular: true },
  { code: 'CIA', name: 'Ciampino Airport', city: 'Rome', country: 'Italy', popular: false },
  { code: 'MXP', name: 'Malpensa Airport', city: 'Milan', country: 'Italy', popular: true },
  { code: 'LIN', name: 'Linate Airport', city: 'Milan', country: 'Italy', popular: false },
  
  // Spain - Multiple Airports
  { code: 'MAD', name: 'Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', popular: true },
  { code: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', popular: true },
  
  // Russia - Multiple Airports
  { code: 'SVO', name: 'Sheremetyevo International Airport', city: 'Moscow', country: 'Russia', popular: true },
  { code: 'DME', name: 'Domodedovo International Airport', city: 'Moscow', country: 'Russia', popular: true },
  { code: 'VKO', name: 'Vnukovo International Airport', city: 'Moscow', country: 'Russia', popular: false },
  
  // Japan - Multiple Airports
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', popular: true },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', popular: true },
  { code: 'KIX', name: 'Kansai International Airport', city: 'Osaka', country: 'Japan', popular: true },
  { code: 'ITM', name: 'Osaka International Airport', city: 'Osaka', country: 'Japan', popular: false },
  
  // South Korea
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', popular: true },
  { code: 'GMP', name: 'Gimpo Airport', city: 'Seoul', country: 'South Korea', popular: false },
  
  // China - Multiple Airports
  { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', popular: true },
  { code: 'PKX', name: 'Beijing Daxing International Airport', city: 'Beijing', country: 'China', popular: true },
  { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', popular: true },
  { code: 'SHA', name: 'Shanghai Hongqiao International Airport', city: 'Shanghai', country: 'China', popular: true },
  { code: 'CAN', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China', popular: true },
  
  // Australia - Multiple Airports
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', popular: true },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', popular: true },
  { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', popular: true },
  { code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', popular: true },
  
  // Indonesia
  { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia', popular: true },
  { code: 'DPS', name: 'Ngurah Rai International Airport', city: 'Bali', country: 'Indonesia', popular: true },
  
  // Philippines
  { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', popular: true },
  { code: 'CEB', name: 'Mactan-Cebu International Airport', city: 'Cebu', country: 'Philippines', popular: true },
  
  // Vietnam
  { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam', popular: true },
  { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam', popular: true },
  
  // Sri Lanka
  { code: 'CMB', name: 'Bandaranaike International Airport', city: 'Colombo', country: 'Sri Lanka', popular: true },
  
  // Bangladesh
  { code: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', country: 'Bangladesh', popular: true },
  
  // Nepal
  { code: 'KTM', name: 'Tribhuvan International Airport', city: 'Kathmandu', country: 'Nepal', popular: true },
  
  // Maldives
  { code: 'MLE', name: 'Velana International Airport', city: 'Male', country: 'Maldives', popular: true },
  
  // Myanmar
  { code: 'RGN', name: 'Yangon International Airport', city: 'Yangon', country: 'Myanmar', popular: true },
  
  // Iran
  { code: 'IKA', name: 'Imam Khomeini International Airport', city: 'Tehran', country: 'Iran', popular: true },
  
  // Iraq
  { code: 'BGW', name: 'Baghdad International Airport', city: 'Baghdad', country: 'Iraq', popular: true },
  
  // Afghanistan  
  { code: 'KBL', name: 'Hamid Karzai International Airport', city: 'Kabul', country: 'Afghanistan', popular: true },
  
  // Pakistan
  { code: 'KHI', name: 'Jinnah International Airport', city: 'Karachi', country: 'Pakistan', popular: true },
  { code: 'LHE', name: 'Allama Iqbal International Airport', city: 'Lahore', country: 'Pakistan', popular: true },
  { code: 'ISB', name: 'Islamabad International Airport', city: 'Islamabad', country: 'Pakistan', popular: true },
  
  // AFRICA
  
  // South Africa - Multiple Airports
  { code: 'JNB', name: 'OR Tambo International Airport', city: 'Johannesburg', country: 'South Africa', popular: true },
  { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', popular: true },
  { code: 'DUR', name: 'King Shaka International Airport', city: 'Durban', country: 'South Africa', popular: true },
  
  // Egypt - Multiple Airports
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', popular: true },
  { code: 'HRG', name: 'Hurghada International Airport', city: 'Hurghada', country: 'Egypt', popular: true },
  { code: 'SSH', name: 'Sharm el-Sheikh International Airport', city: 'Sharm el-Sheikh', country: 'Egypt', popular: true },
  
  // Kenya
  { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', popular: true },
  
  // Ethiopia
  { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia', popular: true },
  
  // Morocco
  { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco', popular: true },
  
  // AMERICAS
  
  // Brazil - Multiple Airports
  { code: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', popular: true },
  { code: 'CGH', name: 'São Paulo-Congonhas Airport', city: 'São Paulo', country: 'Brazil', popular: false },
  { code: 'GIG', name: 'Rio de Janeiro/Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', popular: true },
  { code: 'SDU', name: 'Santos Dumont Airport', city: 'Rio de Janeiro', country: 'Brazil', popular: false },
  
  // Mexico
  { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', popular: true },
  { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico', popular: true },
  
  // Argentina
  { code: 'EZE', name: 'Ezeiza International Airport', city: 'Buenos Aires', country: 'Argentina', popular: true },
  { code: 'AEP', name: 'Jorge Newbery Airfield', city: 'Buenos Aires', country: 'Argentina', popular: false },
  
  // Chile
  { code: 'SCL', name: 'Santiago International Airport', city: 'Santiago', country: 'Chile', popular: true },
  
  // OCEANIA
  
  // New Zealand
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', popular: true },
  { code: 'CHC', name: 'Christchurch Airport', city: 'Christchurch', country: 'New Zealand', popular: true },
  
  // Fiji
  { code: 'NAN', name: 'Nadi International Airport', city: 'Nadi', country: 'Fiji', popular: true }
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
    
    // Validation: infants ≤ adults (airline rule)
    if (type === 'infants' && newTravellers.infants > newTravellers.adults) {
      return; // Block infants > adults
    }
    
    // Maximum 9 passengers total enforcement
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
    const { adults, children, infants } = travellers;
    const parts = [];
    
    // Build dynamic summary with proper pluralization
    if (adults > 0) {
      parts.push(`${adults} Adult${adults > 1 ? 's' : ''}`);
    }
    if (children > 0) {
      parts.push(`${children} Child${children > 1 ? 'ren' : ''}`);
    }
    if (infants > 0) {
      parts.push(`${infants} Infant${infants > 1 ? 's' : ''}`);
    }
    
    const passengerText = parts.length > 0 ? parts.join(', ') : '1 Adult';
    return `${passengerText}, ${travelClass}`;
  };

  // Interactivity Handoff.txt: Group Booking Form Modal for >9 passengers
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
            {/* Passenger Categories - Clear split with live counts */}
            <div className="passenger-categories">
              <h4 className="categories-title">Passengers</h4>
              
              {[
                { key: 'adults', label: 'Adults', age: '12+ years', min: 1, description: 'Age 12 and above' },
                { key: 'children', label: 'Children', age: '2–11 years', min: 0, description: 'Age 2 to 11' },
                { key: 'infants', label: 'Infants', age: 'Under 2 years', min: 0, description: 'Under 2 years (on lap)' }
              ].map(({ key, label, age, min, description }) => (
                <div key={key} className="passenger-category">
                  <div className="category-info">
                    <div className="category-label">{label}</div>
                    <div className="category-age">{age}</div>
                  </div>
                  <div className="category-stepper">
                    <button
                      type="button"
                      onClick={() => updateCount(key, false)}
                      disabled={travellers[key] <= min}
                      className="stepper-btn minus"
                      aria-label={`Decrease ${label.toLowerCase()}`}
                    >
                      −
                    </button>
                    <span className="stepper-count" aria-label={`${travellers[key]} ${label.toLowerCase()}`}>
                      {travellers[key]}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCount(key, true)}
                      disabled={getTotalPassengers() >= 9}
                      className="stepper-btn plus"
                      aria-label={`Increase ${label.toLowerCase()}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Passenger Total & Limit Warning */}
              <div className="passenger-summary">
                <div className="total-count">
                  Total: {getTotalPassengers()}/9 passengers
                </div>
                {getTotalPassengers() >= 8 && (
                  <div className="limit-warning">
                    Maximum 9 passengers allowed
                  </div>
                )}
              </div>
            </div>

            {/* Travel Class Selection */}
            <div className="class-section">
              <h4 className="class-title">Travel Class</h4>
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
  // Interactivity Handoff.txt: Default: 1 adult, 0 child, 0 infant
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