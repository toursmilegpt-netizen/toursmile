import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ComingSoon from "./ComingSoon";
import FlightResults from "./FlightResults";
import FlightSelection from "./FlightSelection";

// For development - set to true to show coming soon page
const SHOW_COMING_SOON = true;

// Check for development override in URL parameters
const urlParams = new URLSearchParams(window.location.search);
const isDevelopmentMode = urlParams.get('dev') === 'true';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Comprehensive Indian and International Airports Database
const AIRPORTS_DATABASE = [
  // Major Indian Airports
  { code: "DEL", name: "Delhi", fullName: "Indira Gandhi International Airport, Delhi", country: "India", popular: true },
  { code: "BOM", name: "Mumbai", fullName: "Chhatrapati Shivaji Maharaj International Airport, Mumbai", country: "India", popular: true },
  { code: "BLR", name: "Bangalore", fullName: "Kempegowda International Airport, Bangalore", country: "India", popular: true },
  { code: "MAA", name: "Chennai", fullName: "Chennai International Airport, Chennai", country: "India", popular: true },
  { code: "CCU", name: "Kolkata", fullName: "Netaji Subhash Chandra Bose International Airport, Kolkata", country: "India", popular: true },
  { code: "HYD", name: "Hyderabad", fullName: "Rajiv Gandhi International Airport, Hyderabad", country: "India", popular: true },
  { code: "PNQ", name: "Pune", fullName: "Pune Airport, Pune", country: "India", popular: true },
  { code: "AMD", name: "Ahmedabad", fullName: "Sardar Vallabhbhai Patel International Airport, Ahmedabad", country: "India", popular: true },
  { code: "GOI", name: "Goa", fullName: "Goa International Airport, Dabolim", country: "India", popular: true },
  { code: "COK", name: "Kochi", fullName: "Cochin International Airport, Kochi", country: "India", popular: true },
  { code: "JAI", name: "Jaipur", fullName: "Jaipur International Airport, Jaipur", country: "India", popular: true },
  { code: "TRV", name: "Trivandrum", fullName: "Trivandrum International Airport, Trivandrum", country: "India", popular: true },
  { code: "IXC", name: "Chandigarh", fullName: "Chandigarh Airport, Chandigarh", country: "India", popular: true },
  { code: "GAU", name: "Guwahati", fullName: "Lokpriya Gopinath Bordoloi International Airport, Guwahati", country: "India", popular: true },
  { code: "IXB", name: "Bagdogra", fullName: "Bagdogra Airport, Siliguri", country: "India", popular: false },
  { code: "IXJ", name: "Jammu", fullName: "Jammu Airport, Jammu", country: "India", popular: false },
  { code: "LEH", name: "Leh", fullName: "Kushok Bakula Rimpochee Airport, Leh", country: "India", popular: false },
  { code: "SXR", name: "Srinagar", fullName: "Sheikh ul-Alam International Airport, Srinagar", country: "India", popular: false },
  { code: "IXA", name: "Agartala", fullName: "Maharaja Bir Bikram Airport, Agartala", country: "India", popular: false },
  { code: "IXI", name: "Lilabari", fullName: "Lilabari Airport, North Lakhimpur", country: "India", popular: false },
  { code: "IMF", name: "Imphal", fullName: "Imphal Airport, Imphal", country: "India", popular: false },
  { code: "AJL", name: "Aizawl", fullName: "Lengpui Airport, Aizawl", country: "India", popular: false },
  { code: "DIB", name: "Dibrugarh", fullName: "Dibrugarh Airport, Dibrugarh", country: "India", popular: false },
  { code: "JRH", name: "Jorhat", fullName: "Jorhat Airport, Jorhat", country: "India", popular: false },
  { code: "TEZ", name: "Tezpur", fullName: "Tezpur Airport, Tezpur", country: "India", popular: false },
  { code: "VTZ", name: "Visakhapatnam", fullName: "Visakhapatnam Airport, Visakhapatnam", country: "India", popular: true },
  { code: "VGA", name: "Vijayawada", fullName: "Vijayawada Airport, Vijayawada", country: "India", popular: false },
  { code: "TIR", name: "Tirupati", fullName: "Tirupati Airport, Tirupati", country: "India", popular: false },
  { code: "RJA", name: "Rajahmundry", fullName: "Rajahmundry Airport, Rajahmundry", country: "India", popular: false },
  { code: "CDP", name: "Cuddapah", fullName: "Cuddapah Airport, Cuddapah", country: "India", popular: false },
  { code: "BZA", name: "Vijayawada", fullName: "Vijayawada Airport, Vijayawada", country: "India", popular: false },
  { code: "WGC", name: "Warangal", fullName: "Warangal Airport, Warangal", country: "India", popular: false },
  { code: "NDC", name: "Nanded", fullName: "Nanded Airport, Nanded", country: "India", popular: false },
  { code: "NAG", name: "Nagpur", fullName: "Dr. Babasaheb Ambedkar International Airport, Nagpur", country: "India", popular: true },
  { code: "IXU", name: "Aurangabad", fullName: "Aurangabad Airport, Aurangabad", country: "India", popular: false },
  { code: "KLH", name: "Kolhapur", fullName: "Kolhapur Airport, Kolhapur", country: "India", popular: false },
  { code: "STV", name: "Surat", fullName: "Surat Airport, Surat", country: "India", popular: false },
  { code: "BHJ", name: "Bhuj", fullName: "Bhuj Airport, Bhuj", country: "India", popular: false },
  { code: "HSS", name: "Hissar", fullName: "Hissar Airport, Hissar", country: "India", popular: false },
  { code: "KNU", name: "Kanpur", fullName: "Kanpur Airport, Kanpur", country: "India", popular: false },
  { code: "LKO", name: "Lucknow", fullName: "Chaudhary Charan Singh International Airport, Lucknow", country: "India", popular: true },
  { code: "VNS", name: "Varanasi", fullName: "Lal Bahadur Shastri Airport, Varanasi", country: "India", popular: true },
  { code: "GWL", name: "Gwalior", fullName: "Gwalior Airport, Gwalior", country: "India", popular: false },
  { code: "IDR", name: "Indore", fullName: "Devi Ahilyabai Holkar Airport, Indore", country: "India", popular: true },
  { code: "JLR", name: "Jabalpur", fullName: "Jabalpur Airport, Jabalpur", country: "India", popular: false },
  { code: "BHO", name: "Bhopal", fullName: "Raja Bhoj Airport, Bhopal", country: "India", popular: false },
  { code: "UDR", name: "Udaipur", fullName: "Maharana Pratap Airport, Udaipur", country: "India", popular: false },
  { code: "JDH", name: "Jodhpur", fullName: "Jodhpur Airport, Jodhpur", country: "India", popular: false },
  { code: "BKB", name: "Bikaner", fullName: "Nal Airport, Bikaner", country: "India", popular: false },
  { code: "KTU", name: "Kota", fullName: "Kota Airport, Kota", country: "India", popular: false },
  { code: "JSA", name: "Jaisalmer", fullName: "Jaisalmer Airport, Jaisalmer", country: "India", popular: false },
  { code: "IXD", name: "Dehradun", fullName: "Jolly Grant Airport, Dehradun", country: "India", popular: false },
  { code: "PGH", name: "Pantnagar", fullName: "Pantnagar Airport, Pantnagar", country: "India", popular: false },
  { code: "DED", name: "Dehra Dun", fullName: "Jolly Grant Airport, Dehradun", country: "India", popular: false },
  { code: "IXL", name: "Leh", fullName: "Kushok Bakula Rimpochee Airport, Leh", country: "India", popular: false },
  { code: "SLV", name: "Shimla", fullName: "Shimla Airport, Shimla", country: "India", popular: false },
  { code: "KUU", name: "Kullu", fullName: "Kullu-Manali Airport, Bhuntar", country: "India", popular: false },
  { code: "KTU", name: "Kangra", fullName: "Kangra Airport, Gaggal", country: "India", popular: false },
  { code: "IXP", name: "Pathankot", fullName: "Pathankot Airport, Pathankot", country: "India", popular: false },
  { code: "ATQ", name: "Amritsar", fullName: "Sri Guru Ram Dass Jee International Airport, Amritsar", country: "India", popular: true },
  { code: "LUH", name: "Ludhiana", fullName: "Ludhiana Airport, Ludhiana", country: "India", popular: false },
  { code: "BUP", name: "Bathinda", fullName: "Bathinda Airport, Bathinda", country: "India", popular: false },
  { code: "HSS", name: "Hissar", fullName: "Hissar Airport, Hissar", country: "India", popular: false },
  { code: "PGH", name: "Pantnagar", fullName: "Pantnagar Airport, Pantnagar", country: "India", popular: false },
  { code: "RTC", name: "Ratnagiri", fullName: "Ratnagiri Airport, Ratnagiri", country: "India", popular: false },
  { code: "JGA", name: "Jamnagar", fullName: "Jamnagar Airport, Jamnagar", country: "India", popular: false },
  { code: "PBD", name: "Porbandar", fullName: "Porbandar Airport, Porbandar", country: "India", popular: false },
  { code: "BHU", name: "Bhavnagar", fullName: "Bhavnagar Airport, Bhavnagar", country: "India", popular: false },
  { code: "IXZ", name: "Port Blair", fullName: "Veer Savarkar International Airport, Port Blair", country: "India", popular: false },
  { code: "IXR", name: "Ranchi", fullName: "Birsa Munda Airport, Ranchi", country: "India", popular: false },
  { code: "IXW", name: "Jamshedpur", fullName: "Sonari Airport, Jamshedpur", country: "India", popular: false },
  { code: "DGH", name: "Deoghar", fullName: "Deoghar Airport, Deoghar", country: "India", popular: false },
  { code: "DHN", name: "Dhanbad", fullName: "Dhanbad Airport, Dhanbad", country: "India", popular: false },
  { code: "PAT", name: "Patna", fullName: "Jay Prakash Narayan International Airport, Patna", country: "India", popular: true },
  { code: "GAY", name: "Gaya", fullName: "Gaya Airport, Gaya", country: "India", popular: false },
  { code: "MUZ", name: "Muzaffarpur", fullName: "Muzaffarpur Airport, Muzaffarpur", country: "India", popular: false },
  { code: "DBD", name: "Dhanbad", fullName: "Dhanbad Airport, Dhanbad", country: "India", popular: false },
  { code: "RPR", name: "Raipur", fullName: "Swami Vivekananda Airport, Raipur", country: "India", popular: false },
  { code: "JGB", name: "Jagdalpur", fullName: "Jagdalpur Airport, Jagdalpur", country: "India", popular: false },
  { code: "BBI", name: "Bhubaneswar", fullName: "Biju Patnaik International Airport, Bhubaneswar", country: "India", popular: true },
  { code: "JHB", name: "Jharsuguda", fullName: "Veer Surendra Sai Airport, Jharsuguda", country: "India", popular: false },

  // International Airports - Popular Destinations
  { code: "DXB", name: "Dubai", fullName: "Dubai International Airport, Dubai", country: "UAE", popular: true },
  { code: "DWC", name: "Dubai Al Maktoum", fullName: "Al Maktoum International Airport, Dubai", country: "UAE", popular: false },
  { code: "AUH", name: "Abu Dhabi", fullName: "Abu Dhabi International Airport, Abu Dhabi", country: "UAE", popular: true },
  { code: "SHJ", name: "Sharjah", fullName: "Sharjah International Airport, Sharjah", country: "UAE", popular: false },
  { code: "DOH", name: "Doha", fullName: "Hamad International Airport, Doha", country: "Qatar", popular: true },
  { code: "KWI", name: "Kuwait", fullName: "Kuwait International Airport, Kuwait City", country: "Kuwait", popular: true },
  { code: "BAH", name: "Bahrain", fullName: "Bahrain International Airport, Manama", country: "Bahrain", popular: true },
  { code: "MCT", name: "Muscat", fullName: "Muscat International Airport, Muscat", country: "Oman", popular: true },
  { code: "RUH", name: "Riyadh", fullName: "King Khalid International Airport, Riyadh", country: "Saudi Arabia", popular: true },
  { code: "JED", name: "Jeddah", fullName: "King Abdulaziz International Airport, Jeddah", country: "Saudi Arabia", popular: true },
  { code: "DMM", name: "Dammam", fullName: "King Fahd International Airport, Dammam", country: "Saudi Arabia", popular: false },

  // Southeast Asia
  { code: "SIN", name: "Singapore", fullName: "Singapore Changi Airport, Singapore", country: "Singapore", popular: true },
  { code: "BKK", name: "Bangkok", fullName: "Suvarnabhumi Airport, Bangkok", country: "Thailand", popular: true },
  { code: "DMK", name: "Bangkok Don Mueang", fullName: "Don Mueang International Airport, Bangkok", country: "Thailand", popular: false },
  { code: "HKT", name: "Phuket", fullName: "Phuket International Airport, Phuket", country: "Thailand", popular: true },
  { code: "CNX", name: "Chiang Mai", fullName: "Chiang Mai International Airport, Chiang Mai", country: "Thailand", popular: false },
  { code: "KUL", name: "Kuala Lumpur", fullName: "Kuala Lumpur International Airport, Kuala Lumpur", country: "Malaysia", popular: true },
  { code: "SZB", name: "Kuala Lumpur Subang", fullName: "Sultan Abdul Aziz Shah Airport, Kuala Lumpur", country: "Malaysia", popular: false },
  { code: "PEN", name: "Penang", fullName: "Penang International Airport, Penang", country: "Malaysia", popular: false },
  { code: "DPS", name: "Bali", fullName: "Ngurah Rai International Airport, Denpasar", country: "Indonesia", popular: true },
  { code: "CGK", name: "Jakarta", fullName: "Soekarno-Hatta International Airport, Jakarta", country: "Indonesia", popular: true },
  { code: "SUB", name: "Surabaya", fullName: "Juanda International Airport, Surabaya", country: "Indonesia", popular: false },
  { code: "MNL", name: "Manila", fullName: "Ninoy Aquino International Airport, Manila", country: "Philippines", popular: true },
  { code: "CEB", name: "Cebu", fullName: "Mactan-Cebu International Airport, Cebu", country: "Philippines", popular: false },
  { code: "SGN", name: "Ho Chi Minh City", fullName: "Tan Son Nhat International Airport, Ho Chi Minh City", country: "Vietnam", popular: true },
  { code: "HAN", name: "Hanoi", fullName: "Noi Bai International Airport, Hanoi", country: "Vietnam", popular: true },
  { code: "DAD", name: "Da Nang", fullName: "Da Nang International Airport, Da Nang", country: "Vietnam", popular: false },
  { code: "RGN", name: "Yangon", fullName: "Yangon International Airport, Yangon", country: "Myanmar", popular: false },

  // East Asia
  { code: "NRT", name: "Tokyo Narita", fullName: "Narita International Airport, Tokyo", country: "Japan", popular: true },
  { code: "HND", name: "Tokyo Haneda", fullName: "Tokyo Haneda Airport, Tokyo", country: "Japan", popular: true },
  { code: "KIX", name: "Osaka", fullName: "Kansai International Airport, Osaka", country: "Japan", popular: true },
  { code: "ITM", name: "Osaka Itami", fullName: "Itami Airport, Osaka", country: "Japan", popular: false },
  { code: "NGO", name: "Nagoya", fullName: "Chubu Centrair International Airport, Nagoya", country: "Japan", popular: false },
  { code: "ICN", name: "Seoul", fullName: "Incheon International Airport, Seoul", country: "South Korea", popular: true },
  { code: "GMP", name: "Seoul Gimpo", fullName: "Gimpo International Airport, Seoul", country: "South Korea", popular: false },
  { code: "PUS", name: "Busan", fullName: "Gimhae International Airport, Busan", country: "South Korea", popular: false },
  { code: "PEK", name: "Beijing", fullName: "Beijing Capital International Airport, Beijing", country: "China", popular: true },
  { code: "PKX", name: "Beijing Daxing", fullName: "Beijing Daxing International Airport, Beijing", country: "China", popular: false },
  { code: "PVG", name: "Shanghai Pudong", fullName: "Shanghai Pudong International Airport, Shanghai", country: "China", popular: true },
  { code: "SHA", name: "Shanghai Hongqiao", fullName: "Shanghai Hongqiao International Airport, Shanghai", country: "China", popular: false },
  { code: "CAN", name: "Guangzhou", fullName: "Guangzhou Baiyun International Airport, Guangzhou", country: "China", popular: true },
  { code: "HKG", name: "Hong Kong", fullName: "Hong Kong International Airport, Hong Kong", country: "Hong Kong", popular: true },
  { code: "TPE", name: "Taipei", fullName: "Taiwan Taoyuan International Airport, Taipei", country: "Taiwan", popular: true },
  { code: "TSA", name: "Taipei Songshan", fullName: "Taipei Songshan Airport, Taipei", country: "Taiwan", popular: false },

  // Europe
  { code: "LHR", name: "London Heathrow", fullName: "Heathrow Airport, London", country: "United Kingdom", popular: true },
  { code: "LGW", name: "London Gatwick", fullName: "Gatwick Airport, London", country: "United Kingdom", popular: false },
  { code: "STN", name: "London Stansted", fullName: "Stansted Airport, London", country: "United Kingdom", popular: false },
  { code: "LTN", name: "London Luton", fullName: "Luton Airport, London", country: "United Kingdom", popular: false },
  { code: "MAN", name: "Manchester", fullName: "Manchester Airport, Manchester", country: "United Kingdom", popular: false },
  { code: "EDI", name: "Edinburgh", fullName: "Edinburgh Airport, Edinburgh", country: "United Kingdom", popular: false },
  { code: "CDG", name: "Paris", fullName: "Charles de Gaulle Airport, Paris", country: "France", popular: true },
  { code: "ORY", name: "Paris Orly", fullName: "Orly Airport, Paris", country: "France", popular: false },
  { code: "FRA", name: "Frankfurt", fullName: "Frankfurt Airport, Frankfurt", country: "Germany", popular: true },
  { code: "MUC", name: "Munich", fullName: "Munich Airport, Munich", country: "Germany", popular: true },
  { code: "BER", name: "Berlin", fullName: "Berlin Brandenburg Airport, Berlin", country: "Germany", popular: true },
  { code: "DUS", name: "Düsseldorf", fullName: "Düsseldorf Airport, Düsseldorf", country: "Germany", popular: false },
  { code: "AMS", name: "Amsterdam", fullName: "Amsterdam Airport Schiphol, Amsterdam", country: "Netherlands", popular: true },
  { code: "ZUR", name: "Zurich", fullName: "Zurich Airport, Zurich", country: "Switzerland", popular: true },
  { code: "GVA", name: "Geneva", fullName: "Geneva Airport, Geneva", country: "Switzerland", popular: false },
  { code: "VIE", name: "Vienna", fullName: "Vienna International Airport, Vienna", country: "Austria", popular: true },
  { code: "FCO", name: "Rome", fullName: "Leonardo da Vinci-Fiumicino Airport, Rome", country: "Italy", popular: true },
  { code: "CIA", name: "Rome Ciampino", fullName: "Ciampino Airport, Rome", country: "Italy", popular: false },
  { code: "MXP", name: "Milan", fullName: "Malpensa Airport, Milan", country: "Italy", popular: true },
  { code: "LIN", name: "Milan Linate", fullName: "Linate Airport, Milan", country: "Italy", popular: false },
  { code: "MAD", name: "Madrid", fullName: "Adolfo Suárez Madrid–Barajas Airport, Madrid", country: "Spain", popular: true },
  { code: "BCN", name: "Barcelona", fullName: "Barcelona-El Prat Airport, Barcelona", country: "Spain", popular: true },
  { code: "LIS", name: "Lisbon", fullName: "Humberto Delgado Airport, Lisbon", country: "Portugal", popular: true },
  { code: "IST", name: "Istanbul", fullName: "Istanbul Airport, Istanbul", country: "Turkey", popular: true },
  { code: "SAW", name: "Istanbul Sabiha", fullName: "Sabiha Gökçen International Airport, Istanbul", country: "Turkey", popular: false },
  { code: "ATH", name: "Athens", fullName: "Athens International Airport, Athens", country: "Greece", popular: true },

  // North America
  { code: "JFK", name: "New York JFK", fullName: "John F. Kennedy International Airport, New York", country: "USA", popular: true },
  { code: "LGA", name: "New York LaGuardia", fullName: "LaGuardia Airport, New York", country: "USA", popular: false },
  { code: "EWR", name: "Newark", fullName: "Newark Liberty International Airport, Newark", country: "USA", popular: false },
  { code: "LAX", name: "Los Angeles", fullName: "Los Angeles International Airport, Los Angeles", country: "USA", popular: true },
  { code: "SFO", name: "San Francisco", fullName: "San Francisco International Airport, San Francisco", country: "USA", popular: true },
  { code: "ORD", name: "Chicago", fullName: "O'Hare International Airport, Chicago", country: "USA", popular: true },
  { code: "MDW", name: "Chicago Midway", fullName: "Midway International Airport, Chicago", country: "USA", popular: false },
  { code: "MIA", name: "Miami", fullName: "Miami International Airport, Miami", country: "USA", popular: true },
  { code: "LAS", name: "Las Vegas", fullName: "McCarran International Airport, Las Vegas", country: "USA", popular: true },
  { code: "SEA", name: "Seattle", fullName: "Seattle-Tacoma International Airport, Seattle", country: "USA", popular: true },
  { code: "DFW", name: "Dallas", fullName: "Dallas/Fort Worth International Airport, Dallas", country: "USA", popular: true },
  { code: "IAH", name: "Houston", fullName: "George Bush Intercontinental Airport, Houston", country: "USA", popular: true },
  { code: "ATL", name: "Atlanta", fullName: "Hartsfield-Jackson Atlanta International Airport, Atlanta", country: "USA", popular: true },
  { code: "BOS", name: "Boston", fullName: "Logan International Airport, Boston", country: "USA", popular: true },
  { code: "DEN", name: "Denver", fullName: "Denver International Airport, Denver", country: "USA", popular: true },
  { code: "YYZ", name: "Toronto", fullName: "Toronto Pearson International Airport, Toronto", country: "Canada", popular: true },
  { code: "YVR", name: "Vancouver", fullName: "Vancouver International Airport, Vancouver", country: "Canada", popular: true },
  { code: "YUL", name: "Montreal", fullName: "Montréal-Pierre Elliott Trudeau International Airport, Montreal", country: "Canada", popular: true },

  // Oceania
  { code: "SYD", name: "Sydney", fullName: "Sydney Kingsford Smith Airport, Sydney", country: "Australia", popular: true },
  { code: "MEL", name: "Melbourne", fullName: "Melbourne Airport, Melbourne", country: "Australia", popular: true },
  { code: "BNE", name: "Brisbane", fullName: "Brisbane Airport, Brisbane", country: "Australia", popular: true },
  { code: "PER", name: "Perth", fullName: "Perth Airport, Perth", country: "Australia", popular: true },
  { code: "ADL", name: "Adelaide", fullName: "Adelaide Airport, Adelaide", country: "Australia", popular: false },
  { code: "AKL", name: "Auckland", fullName: "Auckland Airport, Auckland", country: "New Zealand", popular: true },
  { code: "WLG", name: "Wellington", fullName: "Wellington Airport, Wellington", country: "New Zealand", popular: false },
  { code: "CHC", name: "Christchurch", fullName: "Christchurch Airport, Christchurch", country: "New Zealand", popular: false },

  // Africa & Others
  { code: "CPT", name: "Cape Town", fullName: "Cape Town International Airport, Cape Town", country: "South Africa", popular: true },
  { code: "JNB", name: "Johannesburg", fullName: "O.R. Tambo International Airport, Johannesburg", country: "South Africa", popular: true },
  { code: "CAI", name: "Cairo", fullName: "Cairo International Airport, Cairo", country: "Egypt", popular: true },
  { code: "CMN", name: "Casablanca", fullName: "Mohammed V International Airport, Casablanca", country: "Morocco", popular: true },
  { code: "NBO", name: "Nairobi", fullName: "Jomo Kenyatta International Airport, Nairobi", country: "Kenya", popular: true },
];

// Guided Search Form Component with Progressive Disclosure
const GuidedSearchForm = ({ onSearch, isSearching }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchData, setSearchData] = useState({
    tripType: 'oneway',
    segments: [
      { origin: '', destination: '', departureDate: '' }
    ],
    passengers: { adults: 1, children: 0, infants: 0 },
    class: 'economy'
  });

  // Auto-focus refs
  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    // Set tomorrow as default departure date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSearchData(prev => ({
      ...prev,
      segments: [{ ...prev.segments[0], departureDate: tomorrow.toISOString().split('T')[0] }]
    }));
  }, []);

  const addCitySegment = () => {
    setSearchData(prev => ({
      ...prev,
      segments: [...prev.segments, { origin: '', destination: '', departureDate: '' }]
    }));
  };

  const removeCitySegment = (index) => {
    if (searchData.segments.length > 1) {
      setSearchData(prev => ({
        ...prev,
        segments: prev.segments.filter((_, i) => i !== index)
      }));
    }
  };

  const updateSegment = (index, field, value) => {
    setSearchData(prev => ({
      ...prev,
      segments: prev.segments.map((segment, i) => 
        i === index ? { ...segment, [field]: value } : segment
      )
    }));
  };

  const handleStepProgression = () => {
    const segment = searchData.segments[0];
    if (currentStep === 1 && segment.origin) {
      setCurrentStep(2);
      setTimeout(() => destinationRef.current?.focus(), 100);
    } else if (currentStep === 2 && segment.destination) {
      setCurrentStep(3);
      setTimeout(() => dateRef.current?.focus(), 100);
    } else if (currentStep === 3 && segment.departureDate) {
      setCurrentStep(4);
    }
  };

  useEffect(() => {
    handleStepProgression();
  }, [searchData.segments[0].origin, searchData.segments[0].destination, searchData.segments[0].departureDate]);

  const isStepComplete = (step) => {
    const segment = searchData.segments[0];
    switch (step) {
      case 1: return segment.origin;
      case 2: return segment.destination;
      case 3: return segment.departureDate;
      case 4: return true;
      default: return false;
    }
  };

  const canSearch = () => {
    return searchData.segments.every(segment => 
      segment.origin && segment.destination && segment.departureDate
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
              currentStep >= step 
                ? 'bg-blue-600 text-white shadow-lg' 
                : isStepComplete(step)
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {isStepComplete(step) && currentStep > step ? '✓' : step}
            </div>
            {step < 4 && (
              <div className={`w-12 h-1 mx-2 rounded transition-all duration-300 ${
                currentStep > step ? 'bg-green-600' : currentStep === step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="grid grid-cols-4 gap-4 mb-8 text-center">
        <div className={`text-sm font-medium transition-colors ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          From Where?
        </div>
        <div className={`text-sm font-medium transition-colors ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          To Where?
        </div>
        <div className={`text-sm font-medium transition-colors ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
          When?
        </div>
        <div className={`text-sm font-medium transition-colors ${currentStep >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
          Details
        </div>
      </div>

      {/* Trip Type Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-2">
          {['oneway', 'return', 'multicity'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSearchData({...searchData, tripType: type})}
              className={`px-6 py-2 rounded-full font-medium transition-all capitalize ${
                searchData.tripType === type
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'oneway' ? 'One Way' : type === 'return' ? 'Round Trip' : 'Multi-City'}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Form Fields */}
      <div className="space-y-6">
        {searchData.segments.map((segment, index) => (
          <div key={index} className="space-y-4">
            {/* Origin & Destination Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Origin */}
              <div className={`transition-all duration-500 ${currentStep >= 1 || isStepComplete(1) ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <CityAutocomplete
                  ref={index === 0 ? originRef : null}
                  label={index === 0 ? "From" : `From (${index + 1})`}
                  placeholder="Departure city"
                  value={segment.origin}
                  onChange={(value) => updateSegment(index, 'origin', value)}
                  icon="✈️"
                  autoFocus={index === 0 && currentStep === 1}
                  airports={AIRPORTS_DATABASE}
                />
                {currentStep === 1 && index === 0 && !segment.origin && (
                  <div className="mt-2 text-sm text-blue-600 animate-pulse">
                    👆 Start by selecting your departure city
                  </div>
                )}
              </div>

              {/* Destination */}
              <div className={`transition-all duration-500 ${currentStep >= 2 || isStepComplete(2) ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <CityAutocomplete
                  ref={index === 0 ? destinationRef : null}
                  label={index === 0 ? "To" : `To (${index + 1})`}
                  placeholder="Arrival city"
                  value={segment.destination}
                  onChange={(value) => updateSegment(index, 'destination', value)}
                  icon="📍"
                  airports={AIRPORTS_DATABASE}
                  excludeCity={segment.origin}
                />
                {currentStep === 2 && index === 0 && !segment.destination && (
                  <div className="mt-2 text-sm text-green-600 animate-pulse">
                    ✅ Great! Now choose your destination
                  </div>
                )}
              </div>
            </div>

            {/* Date & Multi-city Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Departure Date */}
              <div className={`transition-all duration-500 ${currentStep >= 3 || isStepComplete(3) ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {index === 0 ? "Departure Date" : `Date (${index + 1})`}
                </label>
                <input
                  ref={index === 0 ? dateRef : null}
                  type="date"
                  value={segment.departureDate}
                  onChange={(e) => updateSegment(index, 'departureDate', e.target.value)}
                  min={index === 0 ? new Date().toISOString().split('T')[0] : searchData.segments[index-1]?.departureDate}
                  className="w-full px-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                {currentStep === 3 && index === 0 && !segment.departureDate && (
                  <div className="mt-2 text-sm text-green-600 animate-pulse">
                    ✅ Perfect! When would you like to travel?
                  </div>
                )}
              </div>

              {/* Multi-city Controls */}
              {searchData.tripType === 'multicity' && (
                <div className="flex items-end space-x-2">
                  {index === searchData.segments.length - 1 && searchData.segments.length < 6 && (
                    <button
                      type="button"
                      onClick={addCitySegment}
                      className="px-4 py-4 bg-blue-100 text-blue-600 rounded-2xl hover:bg-blue-200 transition-colors font-medium"
                    >
                      + Add City
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeCitySegment(index)}
                      className="px-4 py-4 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Return Date for Round Trip */}
            {searchData.tripType === 'return' && index === 0 && (
              <div className={`transition-all duration-500 ${currentStep >= 3 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
                <input
                  type="date"
                  value={searchData.returnDate || ''}
                  onChange={(e) => setSearchData({...searchData, returnDate: e.target.value})}
                  min={segment.departureDate}
                  className="w-full px-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            )}
          </div>
        ))}

        {/* Passengers & Class - Step 4 */}
        <div className={`transition-all duration-500 ${currentStep >= 4 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PassengerSelector
              passengers={searchData.passengers}
              onChange={(passengers) => setSearchData({...searchData, passengers})}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={searchData.class}
                onChange={(e) => setSearchData({...searchData, class: e.target.value})}
                className="w-full px-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              >
                <option value="economy">Economy</option>
                <option value="premium_economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>

          {currentStep === 4 && (
            <div className="mt-4 text-sm text-green-600 animate-pulse">
              ✅ Excellent! All set - ready to search for flights?
            </div>
          )}
        </div>

        {/* Search Button */}
        <div className={`pt-6 transition-all duration-500 ${canSearch() ? 'opacity-100' : 'opacity-50'}`}>
          <button
            type="submit"
            disabled={!canSearch() || isSearching}
            onClick={() => onSearch(searchData)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 px-8 rounded-2xl text-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            {isSearching ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Searching Best Flights...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="mr-3">🚀</span>
                Search Flights
                <span className="ml-3">✈️</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced City Autocomplete with comprehensive airport data
const CityAutocomplete = React.forwardRef(({ label, placeholder, value, onChange, icon, autoFocus, airports, excludeCity }, ref) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && ref?.current) {
      setTimeout(() => ref.current.focus(), 100);
    }
  }, [autoFocus]);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setInputValue(input);
    onChange(input);

    if (input.length > 0) {
      const filtered = airports
        .filter(airport => 
          (airport.name.toLowerCase().includes(input.toLowerCase()) ||
           airport.fullName.toLowerCase().includes(input.toLowerCase()) ||
           airport.code.toLowerCase().includes(input.toLowerCase()) ||
           airport.country.toLowerCase().includes(input.toLowerCase())) &&
           airport.name !== excludeCity
        )
        .sort((a, b) => {
          // Prioritize popular airports
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          // Then by exact name match
          if (a.name.toLowerCase() === input.toLowerCase()) return -1;
          if (b.name.toLowerCase() === input.toLowerCase()) return 1;
          // Then by name starts with
          if (a.name.toLowerCase().startsWith(input.toLowerCase())) return -1;
          if (b.name.toLowerCase().startsWith(input.toLowerCase())) return 1;
          return 0;
        })
        .slice(0, 8);
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      // Show popular airports when empty
      const popular = airports.filter(airport => airport.popular && airport.name !== excludeCity).slice(0, 6);
      setSuggestions(popular);
      setShowSuggestions(input.length === 0);
    }
  };

  const selectCity = (airport) => {
    setInputValue(airport.name);
    onChange(airport.name);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleFocus = () => {
    if (inputValue.length === 0) {
      const popular = airports.filter(airport => airport.popular && airport.name !== excludeCity).slice(0, 6);
      setSuggestions(popular);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(suggestions.length > 0);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
          {icon}
        </div>
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full pl-14 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto">
            {inputValue.length === 0 && (
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                <div className="text-sm font-medium text-blue-800">Popular Destinations</div>
              </div>
            )}
            {suggestions.map((airport) => (
              <div
                key={airport.code}
                onClick={() => selectCity(airport)}
                className="px-4 py-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="font-semibold text-gray-900">{airport.name}</div>
                      {airport.popular && (
                        <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">Popular</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{airport.fullName}</div>
                    <div className="text-xs text-gray-500">{airport.country}</div>
                  </div>
                  <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg text-gray-600">
                    {airport.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// Passenger Selector Component
const PassengerSelector = ({ passengers, onChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const updatePassenger = (type, value) => {
    onChange({
      ...passengers,
      [type]: Math.max(0, Math.min(9, value))
    });
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-left flex items-center justify-between bg-white shadow-sm hover:shadow-md"
      >
        <span>
          {totalPassengers} Passenger{totalPassengers > 1 ? 's' : ''}
        </span>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-6">
          <div className="space-y-6">
            {[
              { key: 'adults', title: 'Adults', subtitle: '12+ years', min: 1 },
              { key: 'children', title: 'Children', subtitle: '2-12 years', min: 0 },
              { key: 'infants', title: 'Infants', subtitle: '0-2 years', min: 0 }
            ].map(({ key, title, subtitle, min }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{title}</div>
                  <div className="text-sm text-gray-500">{subtitle}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => updatePassenger(key, passengers[key] - 1)}
                    disabled={passengers[key] <= min}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">{passengers[key]}</span>
                  <button
                    type="button"
                    onClick={() => updatePassenger(key, passengers[key] + 1)}
                    disabled={passengers[key] >= 9}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={() => setShowDropdown(false)}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

function App() {
  // Show coming soon page unless development mode is active
  if (SHOW_COMING_SOON && !isDevelopmentMode) {
    return <ComingSoon />;
  }

  // Original flight search functionality
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchData, setSearchData] = useState(null);
  
  // Booking flow state management
  const [bookingStep, setBookingStep] = useState('search'); // search, flight-selection, passenger-info, payment, confirmation
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  const handleSearch = async (formData) => {
    setIsSearching(true);
    setSearchData(formData);
    setShowResults(true);
    
    try {
      console.log('Searching with:', formData);
      
      // Convert to backend format
      const searchPayload = {
        tripType: formData.tripType,
        origin: formData.segments[0].origin,
        destination: formData.segments[0].destination,
        departureDate: formData.segments[0].departureDate,
        returnDate: formData.returnDate,
        passengers: formData.passengers.adults + formData.passengers.children + formData.passengers.infants,
        class: formData.class,
        segments: formData.segments
      };
      
      const response = await axios.post(`${API}/flights/search`, searchPayload);
      setSearchResults(response.data.flights || []);
      
      console.log('Search results:', response.data);
    } catch (error) {
      console.error('Search error:', error);
      
      // For demo purposes, show sample flights if API fails
      const sampleFlights = [
        {
          airline: "IndiGo",
          flight_number: "6E-2031",
          departure_time: "06:30",
          arrival_time: "08:45",
          origin: formData.segments[0].origin,
          destination: formData.segments[0].destination,
          duration_minutes: 135,
          stops: 0,
          price: 4500,
          original_price: 5200,
          total_price: 4500,
          is_lcc: true,
          refundable: false,
          aircraft_type: "A320"
        },
        {
          airline: "Air India",
          flight_number: "AI-131",
          departure_time: "09:15",
          arrival_time: "11:30",
          origin: formData.segments[0].origin,
          destination: formData.segments[0].destination,
          duration_minutes: 135,
          stops: 0,
          price: 6200,
          total_price: 6200,
          is_lcc: false,
          refundable: true,
          aircraft_type: "A321"
        },
        {
          airline: "Vistara",
          flight_number: "UK-955",
          departure_time: "14:20",
          arrival_time: "16:45",
          origin: formData.segments[0].origin,
          destination: formData.segments[0].destination,
          duration_minutes: 145,
          stops: 0,
          price: 7800,
          total_price: 7800,
          is_lcc: false,
          refundable: true,
          aircraft_type: "A320neo"
        },
        {
          airline: "SpiceJet",
          flight_number: "SG-8709",
          departure_time: "18:50",
          arrival_time: "21:15",
          origin: formData.segments[0].origin,
          destination: formData.segments[0].destination,
          duration_minutes: 145,
          stops: 0,
          price: 3900,
          total_price: 3900,
          is_lcc: true,
          refundable: false,
          aircraft_type: "B737"
        },
        {
          airline: "Emirates",
          flight_number: "EK-512",
          departure_time: "23:30",
          arrival_time: "08:15+1",
          origin: formData.segments[0].origin,
          destination: formData.segments[0].destination,
          duration_minutes: 525,
          stops: 1,
          price: 28500,
          total_price: 28500,
          is_lcc: false,
          refundable: true,
          aircraft_type: "B777"
        }
      ];
      
      setSearchResults(sampleFlights);
      console.log('Using sample flight data for demo');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFlightSelect = (flight) => {
    console.log('Selected flight:', flight);
    setSelectedFlight(flight);
    setBookingStep('flight-selection');
  };

  const handleBackToResults = () => {
    setBookingStep('search');
    setSelectedFlight(null);
  };

  const handleBackToSearch = () => {
    setShowResults(false);
    setSearchResults([]);
    setBookingStep('search');
    setSelectedFlight(null);
    setBookingData(null);
  };

  const handleFlightSelectionNext = (selectionData) => {
    console.log('Flight selection completed:', selectionData);
    setBookingData(selectionData);
    setBookingStep('passenger-info');
  };

  // Show results page if user has searched
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header with back button */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={handleBackToSearch}
                  className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center">
                  <span className="text-3xl mr-2">✈️</span>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    TourSmile
                  </h1>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <span className="text-blue-600 font-semibold">Flights</span>
                <span className="text-gray-400 hover:text-gray-600 cursor-pointer">Hotels</span>
                <span className="text-gray-400 hover:text-gray-600 cursor-pointer">Activities</span>
              </div>
            </div>
          </div>
        </header>

        {/* Flight Results */}
        <FlightResults 
          searchData={searchData}
          flights={searchResults}
          onFlightSelect={handleFlightSelect}
          isLoading={isSearching}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center">
                <span className="text-3xl mr-2">✈️</span>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  TourSmile
                </h1>
              </div>
              <div className="ml-4 flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  World-Class Travel
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Simplified
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-blue-600 font-semibold">Flights</span>
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer">Hotels</span>
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer">Activities</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Flight Booking Made
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Simple</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            No complex forms. No hidden fees. No confusion. 
            <br />Just tell us where you want to go, and we'll handle the rest.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-gray-500">
            <span className="flex items-center"><span className="text-green-500 mr-1">✓</span> Instant Search</span>
            <span className="flex items-center"><span className="text-green-500 mr-1">✓</span> Best Prices</span>
            <span className="flex items-center"><span className="text-green-500 mr-1">✓</span> Easy Booking</span>
          </div>
        </div>

        {/* Guided Search Form */}
        <div className="mb-12">
          <GuidedSearchForm onSearch={handleSearch} isSearching={isSearching} />
        </div>
      </main>
    </div>
  );
}

export default App;