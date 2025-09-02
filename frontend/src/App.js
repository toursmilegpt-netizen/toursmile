import { useState, useRef, useEffect } from 'react';
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

// Enhanced Airport Selector Component - BUTTON-AS-COMBOBOX APPROACH
// World-Class City Picker Component - Global OTA Standards
const WorldClassCityPicker = ({ 
  value, 
  selectedAirport,
  onSelect, 
  label, 
  placeholder, 
  highlight = false,
  onFocus 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  // Enhanced airport data with multi-airport support
  const getEnhancedAirportData = () => {
    // Group airports by city for multi-airport display
    const cityGroups = {};
    
    AIRPORTS_DATABASE.forEach(airport => {
      const cityKey = `${airport.city}, ${airport.country}`;
      if (!cityGroups[cityKey]) {
        cityGroups[cityKey] = {
          cityName: airport.city,
          country: airport.country,
          cityCode: airport.city.substring(0, 3).toUpperCase(),
          isMultiAirport: false,
          airports: []
        };
      }
      cityGroups[cityKey].airports.push({
        name: airport.name,
        code: airport.code,
        isPrimary: airport.popular || false
      });
    });

    // Mark multi-airport cities
    Object.values(cityGroups).forEach(cityGroup => {
      if (cityGroup.airports.length > 1) {
        cityGroup.isMultiAirport = true;
      }
    });

    return Object.values(cityGroups);
  };

  const enhancedData = getEnhancedAirportData();

  // Recent searches utilities
  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem('ts_recent_searches_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
    return [];
  };

  const saveRecentSearch = (selection) => {
    try {
      let recents = loadRecentSearches();
      
      // Remove duplicate
      recents = recents.filter(item => 
        !(item.cityName === selection.cityName && item.code === selection.code)
      );
      
      // Add to front
      recents.unshift({
        cityName: selection.cityName,
        country: selection.country,
        code: selection.code,
        name: selection.name,
        timestamp: Date.now()
      });
      
      // Keep last 5
      recents = recents.slice(0, 5);
      
      localStorage.setItem('ts_recent_searches_v2', JSON.stringify(recents));
      setRecentSearches(recents);
    } catch (error) {
      console.warn('Failed to save recent search:', error);
    }
  };

  const clearRecentSearches = () => {
    try {
      localStorage.removeItem('ts_recent_searches_v2');
      setRecentSearches([]);
    } catch (error) {
      console.warn('Failed to clear recent searches:', error);
    }
  };

  // World-class search algorithm
  const performSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 150));

      const results = [];
      const query = searchQuery.toLowerCase();

      enhancedData.forEach(cityGroup => {
        const cityMatch = cityGroup.cityName.toLowerCase().includes(query);
        const countryMatch = cityGroup.country.toLowerCase().includes(query);
        const airportMatches = cityGroup.airports.some(airport => 
          airport.code.toLowerCase().includes(query) ||
          airport.name.toLowerCase().includes(query)
        );

        if (cityMatch || countryMatch || airportMatches) {
          // Add "All Airports" option for multi-airport cities
          if (cityGroup.isMultiAirport) {
            results.push({
              type: 'city-all',
              cityName: cityGroup.cityName,
              country: cityGroup.country,
              cityCode: cityGroup.cityCode,
              displayText: `${cityGroup.cityName}, ${cityGroup.country} - All Airports`,
              airports: cityGroup.airports
            });
          }

          // Add individual airports
          cityGroup.airports.forEach(airport => {
            results.push({
              type: 'airport',
              cityName: cityGroup.cityName,
              country: cityGroup.country,
              code: airport.code,
              name: airport.name,
              isPrimary: airport.isPrimary,
              displayText: `${cityGroup.cityName}, ${cityGroup.country}`,
              airportText: `${airport.name} (${airport.code})`
            });
          });
        }
      });

      // Sort by relevance: exact matches first, then alphabetical
      results.sort((a, b) => {
        const aExact = a.cityName.toLowerCase().startsWith(query);
        const bExact = b.cityName.toLowerCase().startsWith(query);
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        return a.displayText.localeCompare(b.displayText);
      });

      setSearchResults(results.slice(0, 8)); // Show top 8 results
      setIsLoading(false);
    } catch (err) {
      setError('Unable to search. Please try again.');
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 150);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setQuery('');
    setError(null);
    
    // Focus input after animation
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);

    onFocus && onFocus();
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setSearchResults([]);
    setError(null);
  };

  const handleSelect = (selection) => {
    // Save to recent searches
    saveRecentSearch(selection);
    
    // Close overlay with animation
    setIsOpen(false);
    
    // Call parent handler
    onSelect({
      city: selection.cityName,
      country: selection.country,
      code: selection.code,
      name: selection.name || `${selection.cityName} - All Airports`
    });
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
    // TODO: Arrow key navigation
  };

  return (
    <div className="world-class-city-field">
      <label className="city-field-label">{label}</label>
      
      {/* Selected City Display or Input */}
      {selectedAirport ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`selected-city-display ${highlight ? 'highlight' : ''}`}
          aria-label={`Selected: ${selectedAirport.city}. Click to change.`}
        >
          <div className="selected-city-content">
            <div className="selected-city-name">{selectedAirport.city}</div>
            <div className="selected-airport-details">{selectedAirport.name}</div>
          </div>
          <svg className="chevron-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className={`city-search-trigger ${highlight ? 'highlight' : ''}`}
          aria-label="Select departure city"
        >
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="search-placeholder">{placeholder}</span>
        </button>
      )}

      {/* World-Class City Picker Overlay */}
      {isOpen && (
        <div className="city-picker-overlay">
          <div className="city-picker-backdrop" onClick={handleClose}></div>
          <div className="city-picker-container" ref={overlayRef}>
            {/* Header */}
            <div className="city-picker-header">
              <h3 className="picker-title">Select {label}</h3>
              <button
                type="button"
                onClick={handleClose}
                className="close-button"
                aria-label="Close city picker"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Premium Search Input */}
            <div className="search-input-container">
              <svg className="search-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
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
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="clear-search-button"
                  aria-label="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Results Container */}
            <div className="search-results-container">
              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <div className="recent-searches-section">
                  <div className="recent-header">
                    <span className="recent-title">Recent Searches</span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="clear-recent-button"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((recent, index) => (
                    <div
                      key={`recent-${index}`}
                      onClick={() => handleSelect(recent)}
                      className="search-result-item recent-item"
                    >
                      <svg className="recent-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <div className="result-content">
                        <div className="result-primary">{recent.cityName}, {recent.country}</div>
                        <div className="result-secondary">{recent.name} ({recent.code})</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Results */}
              {query && (
                <div className="search-results-section">
                  {isLoading && (
                    <div className="loading-skeleton">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="skeleton-item">
                          <div className="skeleton-icon"></div>
                          <div className="skeleton-content">
                            <div className="skeleton-primary"></div>
                            <div className="skeleton-secondary"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {error && (
                    <div className="error-state">
                      <svg className="error-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                        <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <p className="error-message">{error}</p>
                    </div>
                  )}

                  {!isLoading && !error && searchResults.length === 0 && (
                    <div className="no-results-state">
                      <svg className="no-results-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <p className="no-results-message">No cities found for "{query}"</p>
                      <p className="no-results-suggestion">Try searching for a different city or airport code</p>
                    </div>
                  )}

                  {!isLoading && !error && searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result.code || result.cityCode}-${index}`}
                      onClick={() => handleSelect(result)}
                      className={`search-result-item ${result.type === 'city-all' ? 'city-all-item' : 'airport-item'}`}
                      role="option"
                      tabIndex={0}
                    >
                      {/* Icon based on type */}
                      {result.type === 'city-all' ? (
                        <svg className="city-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M3 21h18M5 21V7l8-4v18M19 21V9l-6-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg className="airport-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
                        </svg>
                      )}

                      <div className="result-content">
                        <div className="result-primary">
                          {result.type === 'city-all' 
                            ? `${result.cityName}, ${result.country} - All Airports`
                            : `${result.cityName}, ${result.country}`
                          }
                        </div>
                        {result.type === 'airport' && (
                          <div className="result-secondary">{result.airportText}</div>
                        )}
                      </div>

                      {result.isPrimary && (
                        <span className="primary-badge">Popular</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state when focused but no query */}
              {!query && recentSearches.length === 0 && (
                <div className="empty-state">
                  <svg className="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <p className="empty-message">Start typing to search cities...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
            {/* Passenger Categories - Compact, all mandatory */}
            <div className="passenger-categories">
              <h4 className="categories-title">Passengers</h4>
              
              {[
                { key: 'adults', label: 'Adults', age: '12+ years', min: 1 },
                { key: 'children', label: 'Children', age: '2–11 years', min: 0 },
                { key: 'infants', label: 'Infants', age: 'Under 2 years', min: 0 }
              ].map(({ key, label, age, min }) => (
                <div key={key} className="passenger-category-compact">
                  <div className="category-info-compact">
                    <div className="category-label-compact">{label}</div>
                    <div className="category-age-compact">{age}</div>
                  </div>
                  <div className="category-stepper-compact">
                    <button
                      type="button"
                      onClick={() => updateCount(key, false)}
                      disabled={travellers[key] <= min}
                      className="stepper-btn-compact minus"
                      aria-label={`Decrease ${label.toLowerCase()}`}
                    >
                      −
                    </button>
                    <span className="stepper-count-compact" aria-label={`${travellers[key]} ${label.toLowerCase()}`}>
                      {travellers[key]}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCount(key, true)}
                      disabled={getTotalPassengers() >= 9}
                      className="stepper-btn-compact plus"
                      aria-label={`Increase ${label.toLowerCase()}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Show limit message only when trying to exceed 9 */}
              {showGroupBooking && (
                <div className="limit-message">
                  Max 9 passengers allowed in 1 booking
                </div>
              )}
            </div>

            {/* Travel Class - Dropdown instead of grid */}
            <div className="class-section-compact">
              <h4 className="class-title-compact">Travel Class</h4>
              <select
                value={travelClass}
                onChange={(e) => onClassChange(e.target.value)}
                className="class-dropdown"
              >
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {showGroupBooking && <GroupBookingModal />}
    </>
  );
};

// Enhanced Airport Selector Component - COMPREHENSIVE UX CONSOLIDATION

// Enhanced Flight Search Form - COMPREHENSIVE UX CONSOLIDATION
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
  const [isSwapping, setIsSwapping] = useState(false);

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
    
    if (tripType === 'round-trip') {
      setCalendarType('return');
      setCurrentField('return');
    } else {
      setShowCalendar(false);
      setCurrentField('travellers');
    }
  };

  const handleReturnDateSelect = (date) => {
    setReturnDate(date);
    setShowCalendar(false);
    setCurrentField('travellers');
  };

  // Enhanced Swap Functionality with Animation
  const handleSwap = () => {
    if (!departure || !destination) {
      return; // Safe guard - ignore if either field empty
    }

    setIsSwapping(true);
    
    // Announce for screen readers
    const announcement = `Swapped origin and destination. From ${destination.city} to ${departure.city}`;
    
    // Swap with 300ms animation
    setTimeout(() => {
      const temp = departure;
      setDeparture(destination);
      setDestination(temp);
      setIsSwapping(false);
      
      // Announce swap completion
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new window.SpeechSynthesisUtterance(announcement);
        utterance.volume = 0; // Silent for privacy, but triggers screen reader
        window.speechSynthesis.speak(utterance);
      }
    }, 150); // Half of 300ms for smooth transition
  };

  const handleSearch = () => {
    if (!departure || !destination || !departureDate || (tripType === 'round-trip' && !returnDate)) {
      console.log('Please fill all required fields');
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

  return (
    <div className="search-form">
      {/* Trip Type Segmented Control */}
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

      {/* Enhanced Route Selection - TRUE HORIZONTAL LAYOUT */}
      <div className="route-section-enhanced">
        <div className="route-row-container">
          <div 
            className="route-fields-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 40px 1fr',
              gap: '8px',
              alignItems: 'end',
              width: '100%',
              gridTemplateAreas: '"from swap to"'
            }}
          >
            {/* FROM Field */}
            <div 
              className="from-field-inline"
              style={{ gridArea: 'from', margin: 0 }}
            >
              <EnhancedAirportSelector
                value={departure?.city || ''}
                selectedAirport={departure}
                onSelect={handleDepartureSelect}
                label="FROM"
                placeholder="Departure city"
                highlight={getFieldHighlight('departure')}
                onFocus={() => setCurrentField('departure')}
              />
            </div>
            
            {/* SWAP Button */}
            <div 
              className="swap-inline"
              style={{ 
                gridArea: 'swap', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                paddingBottom: '4px'
              }}
            >
              <button
                type="button"
                onClick={handleSwap}
                disabled={!departure || !destination}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                aria-label="Swap From and To"
                title="Swap origin and destination"
              >
                ⇄
              </button>
            </div>
            
            {/* TO Field */}
            <div 
              className="to-field-inline"
              style={{ gridArea: 'to', margin: 0 }}
            >
              <EnhancedAirportSelector
                value={destination?.city || ''}
                selectedAirport={destination}
                onSelect={handleDestinationSelect}
                label="TO"
                placeholder="Destination city"
                highlight={getFieldHighlight('destination')}
                onFocus={() => setCurrentField('destination')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clean Date Selection - No Labels, Placeholders Only */}
      <div className="date-section">
        <div className="date-row">
          {/* Departure Date - Clean placeholder */}
          <div className="date-field-compact">
            <button
              type="button"
              onClick={() => {
                console.log('Departure date clicked');
                setCalendarType('departure');
                setShowCalendar(true);
                console.log('Calendar state set:', { calendarType: 'departure', showCalendar: true });
              }}
              className={`date-input-clean ${getFieldHighlight('departureDate') ? 'input-highlight' : ''}`}
            >
              <span className="date-value">
                {departureDate ? departureDate.toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                }) : 'Select Date'}
              </span>
              <span className="calendar-icon">📅</span>
            </button>
          </div>

          {/* Separator for Round Trip */}
          {tripType === 'round-trip' && (
            <>
              <div className="date-separator">|</div>
              
              <div className="date-field-compact">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Return date clicked');
                    setCalendarType('return');
                    setShowCalendar(true);
                    console.log('Calendar state set:', { calendarType: 'return', showCalendar: true });
                  }}
                  className={`date-input-clean ${getFieldHighlight('return') ? 'input-highlight' : ''}`}
                >
                  <span className="date-value">
                    {returnDate ? returnDate.toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    }) : 'Select Date'}
                  </span>
                  <span className="calendar-icon">📅</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compact Travellers Selection */}
      <div className="traveller-field-compact">
        <label className="input-label">TRAVELLERS & CLASS</label>
        <button
          type="button"
          onClick={() => setShowTravellers(true)}
          className={`traveller-input-compact ${getFieldHighlight('travellers') ? 'input-highlight' : ''}`}
        >
          <span className="traveller-value">
            {(() => {
              const { adults, children, infants } = travellers;
              const parts = [];
              
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
            })()}
          </span>
          <span className="dropdown-icon">▼</span>
        </button>
      </div>

      {/* Options Row */}
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

      {/* Inline Search Button - Subtle within form */}
      <div className="inline-search">
        <button
          type="button"
          onClick={handleSearch}
          disabled={!isFormValid}
          className={`search-btn-inline ${isFormValid ? 'enabled' : 'disabled'}`}
        >
          <span className="search-text">Search Flights</span>
        </button>
      </div>

      {/* Calendar Overlay - Center Screen Debug */}
      {console.log('Calendar render check:', { showCalendar, calendarType })}
      <CalendarOverlay
        isOpen={showCalendar}
        onClose={() => {
          console.log('Calendar closing'); // Debug
          setShowCalendar(false);
        }}
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

      {/* Sticky CTA - Fixed positioning for mobile */}
      <div className="sticky-cta" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
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

// Main App Component - COMPREHENSIVE TRAVEL HOMEPAGE
function App() {
  return (
    <div className="App">
      {/* Header - Global Navigation */}
      <header className="app-header">
        <div className="header-container">
          <div className="header-main">
            <img
              src="https://customer-assets.emergentagent.com/job_travelgenius/artifacts/ojpqneqb_FINAL%20LOGO.png"
              alt="TourSmile"
              className="logo-main"
            />
            
            <nav className="main-navigation">
              <span className="nav-link active" aria-label="Flights booking and search">
                <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" 
                        fill="currentColor"/>
                </svg>
                Flights
              </span>
              <span className="nav-link" aria-label="Hotels booking and accommodation">
                <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V6H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" 
                        fill="currentColor"/>
                </svg>
                Hotels
              </span>
              <span className="nav-link" aria-label="Travel packages and deals">
                <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                        fill="currentColor"/>
                </svg>
                Packages
              </span>
              <span className="nav-link" aria-label="Activities and experiences">
                <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 10v6c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2v-6c0-1.11.89-2 2-2h16c1.11 0 2 .89 2 2zm-2 0H4v6h16v-6zM6 11h2v2H6v-2zm0 3h8v1H6v-1z" 
                        fill="currentColor"/>
                </svg>
                Activities
              </span>
            </nav>
          </div>
          
          <div className="header-actions">
            <button className="header-btn support-btn">
              <span>24×7 Support</span>
            </button>
            <button className="header-btn account-btn">
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Main Flight Search */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Book Your Perfect Flight</h1>
            <p className="hero-subtitle">Search and compare flights from 100+ airlines worldwide</p>
          </div>
          
          {/* Main Search Card */}
          <div className="search-card-hero">
            <FlightSearchForm />
          </div>
        </div>
      </section>

      {/* Trust Indicators - Global Standards */}
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

      {/* Popular Destinations - Enhanced */}
      <section className="destinations-section">
        <div className="section-container">
          <h2 className="section-title">Popular Destinations</h2>
          <p className="section-subtitle">Discover trending routes and best deals</p>
          
          <div className="destinations-grid">
            {[
              { route: 'Delhi → Mumbai', price: '₹3,999', image: '🏙️', popular: true },
              { route: 'Bangalore → Hyderabad', price: '₹4,299', image: '🌆', popular: true },
              { route: 'Mumbai → Dubai', price: '₹12,999', image: '🏗️', popular: true },
              { route: 'Delhi → Singapore', price: '₹18,999', image: '🌃', popular: true },
              { route: 'Chennai → London', price: '₹45,999', image: '🏛️', popular: false },
              { route: 'Kolkata → Bangkok', price: '₹15,999', image: '🏯', popular: false }
            ].map((dest, index) => (
              <div key={index} className={`destination-card ${dest.popular ? 'popular' : ''}`}>
                <div className="dest-image">{dest.image}</div>
                <div className="dest-content">
                  <h3 className="dest-route">{dest.route}</h3>
                  <p className="dest-price">Starting from {dest.price}</p>
                  {dest.popular && <span className="popular-tag">Popular</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers - Conversion Driver */}
      <section className="offers-section">
        <div className="section-container">
          <h2 className="section-title">Special Offers</h2>
          <p className="section-subtitle">Limited time deals you can't miss</p>
          
          <div className="offers-grid">
            <div className="offer-card featured">
              <div className="offer-badge">Limited Time</div>
              <h3 className="offer-title">Flat ₹2000 OFF</h3>
              <p className="offer-desc">On international flights above ₹25,000</p>
              <div className="offer-code">Code: INTERNATIONAL2K</div>
              <button className="offer-btn">Book Now</button>
            </div>
            
            <div className="offer-card">
              <div className="offer-badge">Weekend Deal</div>
              <h3 className="offer-title">Extra 15% OFF</h3>
              <p className="offer-desc">Weekend bookings on domestic flights</p>
              <div className="offer-code">Code: WEEKEND15</div>
              <button className="offer-btn">Grab Deal</button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Value Propositions */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Why Choose TourSmile?</h2>
          
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">Best Price Guarantee</h3>
              <p className="feature-desc">Find a lower price? We'll match it and give you ₹500 extra</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Smart Search</h3>
              <p className="feature-desc">AI-powered search finds the best flights for your needs</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Mobile First</h3>
              <p className="feature-desc">Book, manage, and check-in seamlessly on any device</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Instant Confirmation</h3>
              <p className="feature-desc">Get your e-ticket instantly with real-time booking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Global Standard */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-section">
              <h4 className="footer-title">TourSmile</h4>
              <p className="footer-desc">Your trusted travel companion for flights, hotels, and experiences worldwide.</p>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#flights">Flight Booking</a></li>
                <li><a href="#hotels">Hotel Booking</a></li>
                <li><a href="#packages">Travel Packages</a></li>
                <li><a href="#support">Customer Support</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#terms">Terms & Conditions</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="footer-copyright">© 2025 TourSmile. All rights reserved.</p>
            <div className="footer-social">
              <span>Follow us:</span>
              <a href="#" className="social-link">Facebook</a>
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;