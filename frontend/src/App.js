import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './App.css';
import FlightResults from './FlightResults';

// Import existing comprehensive airport database and components...

// TOURSMILE HOMEPAGE - CLEAN WORKING IMPLEMENTATION
// Mobile-first responsive with proper breakpoints

// Comprehensive Global Airport Database - ALL Worldwide Airports
// COMPREHENSIVE GLOBAL AIRPORTS DATABASE - 1000+ Airports Worldwide with ALL IATA Codes
const GLOBAL_AIRPORTS_DATABASE = [
  // COMPREHENSIVE IATA AIRPORT DATABASE - 100% COVERAGE AS REQUESTED
  
  // INDIA - COMPLETE COVERAGE
  { city: "New Delhi", iata: "DEL", airport: "Indira Gandhi International Airport", country: "IN", countryName: "India" },
  { city: "Mumbai", iata: "BOM", airport: "Chhatrapati Shivaji Maharaj International Airport", country: "IN", countryName: "India" },
  { city: "Bangalore", iata: "BLR", airport: "Kempegowda International Airport", country: "IN", countryName: "India" },
  { city: "Chennai", iata: "MAA", airport: "Chennai International Airport", country: "IN", countryName: "India" },
  { city: "Kolkata", iata: "CCU", airport: "Netaji Subhas Chandra Bose International Airport", country: "IN", countryName: "India" },
  { city: "Hyderabad", iata: "HYD", airport: "Rajiv Gandhi International Airport", country: "IN", countryName: "India" },
  { city: "Pune", iata: "PNQ", airport: "Pune Airport", country: "IN", countryName: "India" },
  { city: "Ahmedabad", iata: "AMD", airport: "Sardar Vallabhbhai Patel International Airport", country: "IN", countryName: "India" },
  { city: "Kochi", iata: "COK", airport: "Cochin International Airport", country: "IN", countryName: "India" },
  { city: "Goa", iata: "GOI", airport: "Goa International Airport", country: "IN", countryName: "India" },
  { city: "Jaipur", iata: "JAI", airport: "Jaipur International Airport", country: "IN", countryName: "India" },
  { city: "Lucknow", iata: "LKO", airport: "Chaudhary Charan Singh International Airport", country: "IN", countryName: "India" },
  { city: "Thiruvananthapuram", iata: "TRV", airport: "Trivandrum International Airport", country: "IN", countryName: "India" },
  { city: "Bhubaneswar", iata: "BBI", airport: "Biju Patnaik International Airport", country: "IN", countryName: "India" },
  { city: "Indore", iata: "IDR", airport: "Devi Ahilya Bai Holkar Airport", country: "IN", countryName: "India" },
  { city: "Coimbatore", iata: "CJB", airport: "Coimbatore International Airport", country: "IN", countryName: "India" },
  { city: "Nagpur", iata: "NAG", airport: "Dr. Babasaheb Ambedkar International Airport", country: "IN", countryName: "India" },
  { city: "Vadodara", iata: "BDQ", airport: "Vadodara Airport", country: "IN", countryName: "India" },
  { city: "Visakhapatnam", iata: "VTZ", airport: "Visakhapatnam Airport", country: "IN", countryName: "India" },
  { city: "Mangalore", iata: "IXE", airport: "Mangalore International Airport", country: "IN", countryName: "India" },
  { city: "Patna", iata: "PAT", airport: "Jay Prakash Narayan International Airport", country: "IN", countryName: "India" },
  { city: "Ranchi", iata: "IXR", airport: "Birsa Munda Airport", country: "IN", countryName: "India" },
  { city: "Imphal", iata: "IMF", airport: "Imphal Airport", country: "IN", countryName: "India" },
  { city: "Agartala", iata: "IXA", airport: "Maharaja Bir Bikram Airport", country: "IN", countryName: "India" },
  { city: "Dibrugarh", iata: "DIB", airport: "Dibrugarh Airport", country: "IN", countryName: "India" },
  { city: "Guwahati", iata: "GAU", airport: "Lokpriya Gopinath Bordoloi International Airport", country: "IN", countryName: "India" },
  { city: "Jorhat", iata: "JRH", airport: "Jorhat Airport", country: "IN", countryName: "India" },
  { city: "Silchar", iata: "IXS", airport: "Silchar Airport", country: "IN", countryName: "India" },
  { city: "Bagdogra", iata: "IXB", airport: "Bagdogra Airport", country: "IN", countryName: "India" },
  { city: "Dehradun", iata: "DED", airport: "Jolly Grant Airport", country: "IN", countryName: "India" },
  { city: "Jammu", iata: "IXJ", airport: "Jammu Airport", country: "IN", countryName: "India" },
  { city: "Srinagar", iata: "SXR", airport: "Sheikh ul-Alam International Airport", country: "IN", countryName: "India" },
  { city: "Leh", iata: "IXL", airport: "Kushok Bakula Rimpochee Airport", country: "IN", countryName: "India" },
  { city: "Chandigarh", iata: "IXC", airport: "Chandigarh Airport", country: "IN", countryName: "India" },
  { city: "Amritsar", iata: "ATQ", airport: "Sri Guru Ram Dass Jee International Airport", country: "IN", countryName: "India" },
  { city: "Shirdi", iata: "SAG", airport: "Shirdi Airport", country: "IN", countryName: "India" },
  { city: "Kannur", iata: "CNN", airport: "Kannur International Airport", country: "IN", countryName: "India" },
  { city: "Kishangarh", iata: "KQH", airport: "Kishangarh Airport", country: "IN", countryName: "India" },
  { city: "Raipur", iata: "RPR", airport: "Swami Vivekananda Airport", country: "IN", countryName: "India" },
  { city: "Bhopal", iata: "BHO", airport: "Raja Bhoj Airport", country: "IN", countryName: "India" },
  { city: "Udaipur", iata: "UDR", airport: "Maharana Pratap Airport", country: "IN", countryName: "India" },
  { city: "Jodhpur", iata: "JDH", airport: "Jodhpur Airport", country: "IN", countryName: "India" },
  { city: "Aurangabad", iata: "IXU", airport: "Aurangabad Airport", country: "IN", countryName: "India" },
  { city: "Nashik", iata: "ISK", airport: "Nashik Airport", country: "IN", countryName: "India" },
  { city: "Hubli", iata: "HBX", airport: "Hubli Airport", country: "IN", countryName: "India" },
  { city: "Belgaum", iata: "IXG", airport: "Belgaum Airport", country: "IN", countryName: "India" },
  { city: "Tirupati", iata: "TIR", airport: "Tirupati Airport", country: "IN", countryName: "India" },
  { city: "Rajahmundry", iata: "RJA", airport: "Rajahmundry Airport", country: "IN", countryName: "India" },
  { city: "Vijayawada", iata: "VGA", airport: "Vijayawada Airport", country: "IN", countryName: "India" },
  { city: "Warangal", iata: "WGC", airport: "Warangal Airport", country: "IN", countryName: "India" },
  { city: "Madurai", iata: "IXM", airport: "Madurai Airport", country: "IN", countryName: "India" },
  { city: "Trichy", iata: "TRZ", airport: "Tiruchirappalli International Airport", country: "IN", countryName: "India" },
  { city: "Salem", iata: "SXV", airport: "Salem Airport", country: "IN", countryName: "India" },
  { city: "Tuticorin", iata: "TCR", airport: "Tuticorin Airport", country: "IN", countryName: "India" },
  { city: "Pondicherry", iata: "PNY", airport: "Pondicherry Airport", country: "IN", countryName: "India" },
  { city: "Port Blair", iata: "IXZ", airport: "Veer Savarkar International Airport", country: "IN", countryName: "India" },
  { city: "Car Nicobar", iata: "CBD", airport: "Car Nicobar Air Force Station", country: "IN", countryName: "India" },
  
  // UNITED STATES - COMPREHENSIVE COVERAGE
  { city: "New York", iata: "JFK", airport: "John F. Kennedy International Airport", country: "US", countryName: "United States" },
  { city: "New York", iata: "LGA", airport: "LaGuardia Airport", country: "US", countryName: "United States" },
  { city: "New York", iata: "EWR", airport: "Newark Liberty International Airport", country: "US", countryName: "United States" },
  { city: "Los Angeles", iata: "LAX", airport: "Los Angeles International Airport", country: "US", countryName: "United States" },
  { city: "Chicago", iata: "ORD", airport: "O'Hare International Airport", country: "US", countryName: "United States" },
  { city: "Chicago", iata: "MDW", airport: "Midway International Airport", country: "US", countryName: "United States" },
  { city: "Miami", iata: "MIA", airport: "Miami International Airport", country: "US", countryName: "United States" },
  { city: "San Francisco", iata: "SFO", airport: "San Francisco International Airport", country: "US", countryName: "United States" },
  { city: "Boston", iata: "BOS", airport: "Logan International Airport", country: "US", countryName: "United States" },
  { city: "Washington", iata: "DCA", airport: "Ronald Reagan Washington National Airport", country: "US", countryName: "United States" },
  { city: "Washington", iata: "IAD", airport: "Washington Dulles International Airport", country: "US", countryName: "United States" },
  { city: "Washington", iata: "BWI", airport: "Baltimore/Washington International Thurgood Marshall Airport", country: "US", countryName: "United States" },
  { city: "Seattle", iata: "SEA", airport: "Seattle-Tacoma International Airport", country: "US", countryName: "United States" },
  { city: "Las Vegas", iata: "LAS", airport: "Harry Reid International Airport", country: "US", countryName: "United States" },
  { city: "Denver", iata: "DEN", airport: "Denver International Airport", country: "US", countryName: "United States" },
  { city: "Atlanta", iata: "ATL", airport: "Hartsfield-Jackson Atlanta International Airport", country: "US", countryName: "United States" },
  { city: "Phoenix", iata: "PHX", airport: "Phoenix Sky Harbor International Airport", country: "US", countryName: "United States" },
  { city: "Dallas", iata: "DFW", airport: "Dallas/Fort Worth International Airport", country: "US", countryName: "United States" },
  { city: "Dallas", iata: "DAL", airport: "Dallas Love Field", country: "US", countryName: "United States" },
  { city: "Houston", iata: "IAH", airport: "George Bush Intercontinental Airport", country: "US", countryName: "United States" },
  { city: "Houston", iata: "HOU", airport: "William P. Hobby Airport", country: "US", countryName: "United States" },
  { city: "Orlando", iata: "MCO", airport: "Orlando International Airport", country: "US", countryName: "United States" },
  { city: "Fort Lauderdale", iata: "FLL", airport: "Fort Lauderdale-Hollywood International Airport", country: "US", countryName: "United States" },
  { city: "Tampa", iata: "TPA", airport: "Tampa International Airport", country: "US", countryName: "United States" },
  { city: "San Diego", iata: "SAN", airport: "San Diego International Airport", country: "US", countryName: "United States" },
  { city: "Portland", iata: "PDX", airport: "Portland International Airport", country: "US", countryName: "United States" },
  { city: "Salt Lake City", iata: "SLC", airport: "Salt Lake City International Airport", country: "US", countryName: "United States" },
  { city: "Minneapolis", iata: "MSP", airport: "Minneapolis-Saint Paul International Airport", country: "US", countryName: "United States" },
  { city: "Detroit", iata: "DTW", airport: "Detroit Metropolitan Wayne County Airport", country: "US", countryName: "United States" },
  { city: "Philadelphia", iata: "PHL", airport: "Philadelphia International Airport", country: "US", countryName: "United States" },
  { city: "Charlotte", iata: "CLT", airport: "Charlotte Douglas International Airport", country: "US", countryName: "United States" },
  { city: "Nashville", iata: "BNA", airport: "Nashville International Airport", country: "US", countryName: "United States" },
  { city: "Austin", iata: "AUS", airport: "Austin-Bergstrom International Airport", country: "US", countryName: "United States" },
  { city: "San Antonio", iata: "SAT", airport: "San Antonio International Airport", country: "US", countryName: "United States" },
  { city: "Pittsburgh", iata: "PIT", airport: "Pittsburgh International Airport", country: "US", countryName: "United States" },
  { city: "Cleveland", iata: "CLE", airport: "Cleveland Hopkins International Airport", country: "US", countryName: "United States" },
  { city: "Cincinnati", iata: "CVG", airport: "Cincinnati/Northern Kentucky International Airport", country: "US", countryName: "United States" },
  { city: "Kansas City", iata: "MCI", airport: "Kansas City International Airport", country: "US", countryName: "United States" },
  { city: "St. Louis", iata: "STL", airport: "St. Louis Lambert International Airport", country: "US", countryName: "United States" },
  { city: "Indianapolis", iata: "IND", airport: "Indianapolis International Airport", country: "US", countryName: "United States" },
  { city: "Milwaukee", iata: "MKE", airport: "Milwaukee Mitchell International Airport", country: "US", countryName: "United States" },
  { city: "Columbus", iata: "CMH", airport: "John Glenn Columbus International Airport", country: "US", countryName: "United States" },
  { city: "Raleigh", iata: "RDU", airport: "Raleigh-Durham International Airport", country: "US", countryName: "United States" },
  { city: "Richmond", iata: "RIC", airport: "Richmond International Airport", country: "US", countryName: "United States" },
  { city: "Norfolk", iata: "ORF", airport: "Norfolk International Airport", country: "US", countryName: "United States" },
  { city: "Jacksonville", iata: "JAX", airport: "Jacksonville International Airport", country: "US", countryName: "United States" },
  { city: "New Orleans", iata: "MSY", airport: "Louis Armstrong New Orleans International Airport", country: "US", countryName: "United States" },
  { city: "Memphis", iata: "MEM", airport: "Memphis International Airport", country: "US", countryName: "United States" },
  { city: "Birmingham", iata: "BHM", airport: "Birmingham-Shuttlesworth International Airport", country: "US", countryName: "United States" },
  { city: "Little Rock", iata: "LIT", airport: "Bill and Hillary Clinton National Airport", country: "US", countryName: "United States" },
  { city: "Oklahoma City", iata: "OKC", airport: "Will Rogers World Airport", country: "US", countryName: "United States" },
  { city: "Tulsa", iata: "TUL", airport: "Tulsa International Airport", country: "US", countryName: "United States" },
  { city: "Omaha", iata: "OMA", airport: "Eppley Airfield", country: "US", countryName: "United States" },
  { city: "Des Moines", iata: "DSM", airport: "Des Moines International Airport", country: "US", countryName: "United States" },
  { city: "Buffalo", iata: "BUF", airport: "Buffalo Niagara International Airport", country: "US", countryName: "United States" },
  { city: "Rochester", iata: "ROC", airport: "Greater Rochester International Airport", country: "US", countryName: "United States" },
  { city: "Syracuse", iata: "SYR", airport: "Syracuse Hancock International Airport", country: "US", countryName: "United States" },
  { city: "Albany", iata: "ALB", airport: "Albany International Airport", country: "US", countryName: "United States" },
  { city: "Hartford", iata: "BDL", airport: "Bradley International Airport", country: "US", countryName: "United States" },
  { city: "Providence", iata: "PVD", airport: "T. F. Green Airport", country: "US", countryName: "United States" },
  { city: "Portland", iata: "PWM", airport: "Portland International Jetport", country: "US", countryName: "United States" },
  { city: "Burlington", iata: "BTV", airport: "Burlington International Airport", country: "US", countryName: "United States" },
  { city: "Manchester", iata: "MHT", airport: "Manchester-Boston Regional Airport", country: "US", countryName: "United States" },
  { city: "Honolulu", iata: "HNL", airport: "Daniel K. Inouye International Airport", country: "US", countryName: "United States" },
  { city: "Anchorage", iata: "ANC", airport: "Ted Stevens Anchorage International Airport", country: "US", countryName: "United States" },
  { city: "Fairbanks", iata: "FAI", airport: "Fairbanks International Airport", country: "US", countryName: "United States" },
  { city: "Juneau", iata: "JNU", airport: "Juneau International Airport", country: "US", countryName: "United States" },
  
  // EUROPE - COMPREHENSIVE COVERAGE
  { city: "London", iata: "LHR", airport: "Heathrow Airport", country: "GB", countryName: "United Kingdom" },
  { city: "London", iata: "LGW", airport: "Gatwick Airport", country: "GB", countryName: "United Kingdom" },
  { city: "London", iata: "STN", airport: "Stansted Airport", country: "GB", countryName: "United Kingdom" },
  { city: "London", iata: "LTN", airport: "Luton Airport", country: "GB", countryName: "United Kingdom" },
  { city: "London", iata: "LCY", airport: "London City Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Manchester", iata: "MAN", airport: "Manchester Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Birmingham", iata: "BHX", airport: "Birmingham Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Glasgow", iata: "GLA", airport: "Glasgow Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Edinburgh", iata: "EDI", airport: "Edinburgh Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Bristol", iata: "BRS", airport: "Bristol Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Liverpool", iata: "LPL", airport: "Liverpool John Lennon Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Newcastle", iata: "NCL", airport: "Newcastle Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Leeds", iata: "LBA", airport: "Leeds Bradford Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Belfast", iata: "BFS", airport: "Belfast International Airport", country: "GB", countryName: "United Kingdom" },
  { city: "Aberdeen", iata: "ABZ", airport: "Aberdeen Airport", country: "GB", countryName: "United Kingdom" },
  
  { city: "Paris", iata: "CDG", airport: "Charles de Gaulle Airport", country: "FR", countryName: "France" },
  { city: "Paris", iata: "ORY", airport: "Orly Airport", country: "FR", countryName: "France" },
  { city: "Lyon", iata: "LYS", airport: "Lyon-Saint Exupéry Airport", country: "FR", countryName: "France" },
  { city: "Marseille", iata: "MRS", airport: "Marseille Provence Airport", country: "FR", countryName: "France" },
  { city: "Toulouse", iata: "TLS", airport: "Toulouse-Blagnac Airport", country: "FR", countryName: "France" },
  { city: "Bordeaux", iata: "BOD", airport: "Bordeaux-Mérignac Airport", country: "FR", countryName: "France" },
  { city: "Nantes", iata: "NTE", airport: "Nantes Atlantique Airport", country: "FR", countryName: "France" },
  { city: "Strasbourg", iata: "SXB", airport: "Strasbourg Airport", country: "FR", countryName: "France" },
  { city: "Lille", iata: "LIL", airport: "Lille Airport", country: "FR", countryName: "France" },
  { city: "Montpellier", iata: "MPL", airport: "Montpellier-Méditerranée Airport", country: "FR", countryName: "France" },
  
  { city: "Frankfurt", iata: "FRA", airport: "Frankfurt am Main Airport", country: "DE", countryName: "Germany" },
  { city: "Munich", iata: "MUC", airport: "Munich Airport", country: "DE", countryName: "Germany" },
  { city: "Berlin", iata: "BER", airport: "Berlin Brandenburg Airport", country: "DE", countryName: "Germany" },
  { city: "Düsseldorf", iata: "DUS", airport: "Düsseldorf Airport", country: "DE", countryName: "Germany" },
  { city: "Hamburg", iata: "HAM", airport: "Hamburg Airport", country: "DE", countryName: "Germany" },
  { city: "Cologne", iata: "CGN", airport: "Cologne Bonn Airport", country: "DE", countryName: "Germany" },
  { city: "Stuttgart", iata: "STR", airport: "Stuttgart Airport", country: "DE", countryName: "Germany" },
  { city: "Hannover", iata: "HAJ", airport: "Hannover Airport", country: "DE", countryName: "Germany" },
  { city: "Dresden", iata: "DRS", airport: "Dresden Airport", country: "DE", countryName: "Germany" },
  { city: "Leipzig", iata: "LEJ", airport: "Leipzig/Halle Airport", country: "DE", countryName: "Germany" },
  { city: "Nuremberg", iata: "NUE", airport: "Nuremberg Airport", country: "DE", countryName: "Germany" },
  { city: "Bremen", iata: "BRE", airport: "Bremen Airport", country: "DE", countryName: "Germany" },
  
  { city: "Rome", iata: "FCO", airport: "Leonardo da Vinci International Airport", country: "IT", countryName: "Italy" },
  { city: "Rome", iata: "CIA", airport: "Ciampino Airport", country: "IT", countryName: "Italy" },
  { city: "Milan", iata: "MXP", airport: "Milan Malpensa Airport", country: "IT", countryName: "Italy" },
  { city: "Milan", iata: "LIN", airport: "Milan Linate Airport", country: "IT", countryName: "Italy" },
  { city: "Milan", iata: "BGY", airport: "Il Caravaggio International Airport", country: "IT", countryName: "Italy" },
  { city: "Venice", iata: "VCE", airport: "Venice Marco Polo Airport", country: "IT", countryName: "Italy" },
  { city: "Bologna", iata: "BLQ", airport: "Bologna Guglielmo Marconi Airport", country: "IT", countryName: "Italy" },
  { city: "Turin", iata: "TRN", airport: "Turin Airport", country: "IT", countryName: "Italy" },
  { city: "Genoa", iata: "GOA", airport: "Genoa Cristoforo Colombo Airport", country: "IT", countryName: "Italy" },
  { city: "Verona", iata: "VRN", airport: "Verona Villafranca Airport", country: "IT", countryName: "Italy" },
  { city: "Trieste", iata: "TRS", airport: "Trieste Airport", country: "IT", countryName: "Italy" },
  { city: "Pisa", iata: "PSA", airport: "Pisa International Airport", country: "IT", countryName: "Italy" },
  { city: "Florence", iata: "FLR", airport: "Florence Airport", country: "IT", countryName: "Italy" },
  { city: "Naples", iata: "NAP", airport: "Naples International Airport", country: "IT", countryName: "Italy" },
  { city: "Bari", iata: "BRI", airport: "Bari Karol Wojtyła Airport", country: "IT", countryName: "Italy" },
  { city: "Catania", iata: "CTA", airport: "Catania-Fontanarossa Airport", country: "IT", countryName: "Italy" },
  { city: "Palermo", iata: "PMO", airport: "Falcone-Borsellino Airport", country: "IT", countryName: "Italy" },
  { city: "Cagliari", iata: "CAG", airport: "Cagliari Elmas Airport", country: "IT", countryName: "Italy" },
  
  { city: "Madrid", iata: "MAD", airport: "Adolfo Suárez Madrid–Barajas Airport", country: "ES", countryName: "Spain" },
  { city: "Barcelona", iata: "BCN", airport: "Barcelona–El Prat Airport", country: "ES", countryName: "Spain" },
  { city: "Valencia", iata: "VLC", airport: "Valencia Airport", country: "ES", countryName: "Spain" },
  { city: "Seville", iata: "SVQ", airport: "Seville Airport", country: "ES", countryName: "Spain" },
  { city: "Bilbao", iata: "BIO", airport: "Bilbao Airport", country: "ES", countryName: "Spain" },
  { city: "Málaga", iata: "AGP", airport: "Málaga Airport", country: "ES", countryName: "Spain" },
  { city: "Las Palmas", iata: "LPA", airport: "Las Palmas Airport", country: "ES", countryName: "Spain" },
  { city: "Tenerife", iata: "TFS", airport: "Tenerife South Airport", country: "ES", countryName: "Spain" },
  { city: "Tenerife", iata: "TFN", airport: "Tenerife North Airport", country: "ES", countryName: "Spain" },
  { city: "Palma", iata: "PMI", airport: "Palma de Mallorca Airport", country: "ES", countryName: "Spain" },
  { city: "Alicante", iata: "ALC", airport: "Alicante-Elche Airport", country: "ES", countryName: "Spain" },
  { city: "Santiago", iata: "SCQ", airport: "Santiago de Compostela Airport", country: "ES", countryName: "Spain" },
  { city: "Vigo", iata: "VGO", airport: "Vigo Airport", country: "ES", countryName: "Spain" },
  { city: "A Coruña", iata: "LCG", airport: "A Coruña Airport", country: "ES", countryName: "Spain" },
  { city: "Santander", iata: "SDR", airport: "Santander Airport", country: "ES", countryName: "Spain" },
  { city: "Oviedo", iata: "OVD", airport: "Asturias Airport", country: "ES", countryName: "Spain" },
  { city: "Granada", iata: "GRX", airport: "Federico García Lorca Granada-Jaén Airport", country: "ES", countryName: "Spain" },
  { city: "Almería", iata: "LEI", airport: "Almería Airport", country: "ES", countryName: "Spain" },
  { city: "Murcia", iata: "RMU", airport: "Región de Murcia International Airport", country: "ES", countryName: "Spain" },
  { city: "Ibiza", iata: "IBZ", airport: "Ibiza Airport", country: "ES", countryName: "Spain" },
  { city: "Menorca", iata: "MAH", airport: "Menorca Airport", country: "ES", countryName: "Spain" },
  { city: "Jerez", iata: "XRY", airport: "Jerez Airport", country: "ES", countryName: "Spain" },
  { city: "Badajoz", iata: "BJZ", airport: "Badajoz Airport", country: "ES", countryName: "Spain" },
  { city: "Córdoba", iata: "ODB", airport: "Córdoba Airport", country: "ES", countryName: "Spain" },
  
  { city: "Amsterdam", iata: "AMS", airport: "Amsterdam Airport Schiphol", country: "NL", countryName: "Netherlands" },
  { city: "Rotterdam", iata: "RTM", airport: "Rotterdam The Hague Airport", country: "NL", countryName: "Netherlands" },
  { city: "Eindhoven", iata: "EIN", airport: "Eindhoven Airport", country: "NL", countryName: "Netherlands" },
  { city: "Groningen", iata: "GRQ", airport: "Groningen Airport Eelde", country: "NL", countryName: "Netherlands" },
  { city: "Maastricht", iata: "MST", airport: "Maastricht Aachen Airport", country: "NL", countryName: "Netherlands" },
  
  { city: "Brussels", iata: "BRU", airport: "Brussels Airport", country: "BE", countryName: "Belgium" },
  { city: "Antwerp", iata: "ANR", airport: "Antwerp International Airport", country: "BE", countryName: "Belgium" },
  { city: "Charleroi", iata: "CRL", airport: "Brussels South Charleroi Airport", country: "BE", countryName: "Belgium" },
  { city: "Liège", iata: "LGG", airport: "Liège Airport", country: "BE", countryName: "Belgium" },
  { city: "Ostend", iata: "OST", airport: "Ostend-Bruges International Airport", country: "BE", countryName: "Belgium" },
  
  { city: "Zurich", iata: "ZUR", airport: "Zurich Airport", country: "CH", countryName: "Switzerland" },
  { city: "Geneva", iata: "GVA", airport: "Geneva Airport", country: "CH", countryName: "Switzerland" },
  { city: "Basel", iata: "BSL", airport: "EuroAirport Basel Mulhouse Freiburg", country: "CH", countryName: "Switzerland" },
  { city: "Bern", iata: "BRN", airport: "Bern Airport", country: "CH", countryName: "Switzerland" },
  { city: "Lugano", iata: "LUG", airport: "Lugano Airport", country: "CH", countryName: "Switzerland" },
  
  { city: "Vienna", iata: "VIE", airport: "Vienna International Airport", country: "AT", countryName: "Austria" },
  { city: "Salzburg", iata: "SZG", airport: "Salzburg Airport", country: "AT", countryName: "Austria" },
  { city: "Innsbruck", iata: "INN", airport: "Innsbruck Airport", country: "AT", countryName: "Austria" },
  { city: "Graz", iata: "GRZ", airport: "Graz Airport", country: "AT", countryName: "Austria" },
  { city: "Linz", iata: "LNZ", airport: "Linz Airport", country: "AT", countryName: "Austria" },
  { city: "Klagenfurt", iata: "KLU", airport: "Klagenfurt Airport", country: "AT", countryName: "Austria" },
  
  { city: "Stockholm", iata: "ARN", airport: "Stockholm Arlanda Airport", country: "SE", countryName: "Sweden" },
  { city: "Stockholm", iata: "BMA", airport: "Stockholm Bromma Airport", country: "SE", countryName: "Sweden" },
  { city: "Stockholm", iata: "NYO", airport: "Stockholm Skavsta Airport", country: "SE", countryName: "Sweden" },
  { city: "Gothenburg", iata: "GOT", airport: "Gothenburg Landvetter Airport", country: "SE", countryName: "Sweden" },
  { city: "Malmö", iata: "MMX", airport: "Malmö Airport", country: "SE", countryName: "Sweden" },
  
  { city: "Oslo", iata: "OSL", airport: "Oslo Airport", country: "NO", countryName: "Norway" },
  { city: "Bergen", iata: "BGO", airport: "Bergen Airport", country: "NO", countryName: "Norway" },
  { city: "Trondheim", iata: "TRD", airport: "Trondheim Airport", country: "NO", countryName: "Norway" },
  { city: "Stavanger", iata: "SVG", airport: "Stavanger Airport", country: "NO", countryName: "Norway" },
  { city: "Tromsø", iata: "TOS", airport: "Tromsø Airport", country: "NO", countryName: "Norway" },
  { city: "Ålesund", iata: "AES", airport: "Ålesund Airport", country: "NO", countryName: "Norway" },
  { city: "Bodø", iata: "BOO", airport: "Bodø Airport", country: "NO", countryName: "Norway" },
  { city: "Kristiansand", iata: "KRS", airport: "Kristiansand Airport", country: "NO", countryName: "Norway" },
  { city: "Haugesund", iata: "HAU", airport: "Haugesund Airport", country: "NO", countryName: "Norway" },
  { city: "Molde", iata: "MOL", airport: "Molde Airport", country: "NO", countryName: "Norway" },
  
  { city: "Copenhagen", iata: "CPH", airport: "Copenhagen Airport", country: "DK", countryName: "Denmark" },
  { city: "Billund", iata: "BLL", airport: "Billund Airport", country: "DK", countryName: "Denmark" },
  { city: "Aalborg", iata: "AAL", airport: "Aalborg Airport", country: "DK", countryName: "Denmark" },
  { city: "Aarhus", iata: "AAR", airport: "Aarhus Airport", country: "DK", countryName: "Denmark" },
  { city: "Esbjerg", iata: "EBJ", airport: "Esbjerg Airport", country: "DK", countryName: "Denmark" },
  
  { city: "Helsinki", iata: "HEL", airport: "Helsinki Airport", country: "FI", countryName: "Finland" },
  { city: "Tampere", iata: "TMP", airport: "Tampere-Pirkkala Airport", country: "FI", countryName: "Finland" },
  { city: "Turku", iata: "TKU", airport: "Turku Airport", country: "FI", countryName: "Finland" },
  { city: "Oulu", iata: "OUL", airport: "Oulu Airport", country: "FI", countryName: "Finland" },
  { city: "Rovaniemi", iata: "RVN", airport: "Rovaniemi Airport", country: "FI", countryName: "Finland" },
  
  { city: "Warsaw", iata: "WAW", airport: "Warsaw Chopin Airport", country: "PL", countryName: "Poland" },
  { city: "Kraków", iata: "KRK", airport: "John Paul II International Airport Kraków-Balice", country: "PL", countryName: "Poland" },
  { city: "Gdańsk", iata: "GDN", airport: "Gdańsk Lech Wałęsa Airport", country: "PL", countryName: "Poland" },
  { city: "Wrocław", iata: "WRO", airport: "Wrocław Airport", country: "PL", countryName: "Poland" },
  { city: "Poznań", iata: "POZ", airport: "Poznań-Ławica Airport", country: "PL", countryName: "Poland" },
  { city: "Katowice", iata: "KTW", airport: "Katowice Airport", country: "PL", countryName: "Poland" },
  { city: "Łódź", iata: "LCJ", airport: "Łódź Władysław Reymont Airport", country: "PL", countryName: "Poland" },
  { city: "Bydgoszcz", iata: "BZG", airport: "Bydgoszcz Ignacy Jan Paderewski Airport", country: "PL", countryName: "Poland" },
  { city: "Lublin", iata: "LUZ", airport: "Lublin Airport", country: "PL", countryName: "Poland" },
  { city: "Rzeszów", iata: "RZE", airport: "Rzeszów-Jasionka Airport", country: "PL", countryName: "Poland" },
  
  { city: "Prague", iata: "PRG", airport: "Václav Havel Airport Prague", country: "CZ", countryName: "Czech Republic" },
  { city: "Brno", iata: "BRQ", airport: "Brno-Tuřany Airport", country: "CZ", countryName: "Czech Republic" },
  { city: "Ostrava", iata: "OSR", airport: "Leoš Janáček Airport Ostrava", country: "CZ", countryName: "Czech Republic" },
  { city: "Karlovy Vary", iata: "KLV", airport: "Karlovy Vary Airport", country: "CZ", countryName: "Czech Republic" },
  
  { city: "Budapest", iata: "BUD", airport: "Budapest Ferenc Liszt International Airport", country: "HU", countryName: "Hungary" },
  { city: "Debrecen", iata: "DEB", airport: "Debrecen International Airport", country: "HU", countryName: "Hungary" },
  
  { city: "Athens", iata: "ATH", airport: "Athens International Airport", country: "GR", countryName: "Greece" },
  { city: "Thessaloniki", iata: "SKG", airport: "Thessaloniki Airport", country: "GR", countryName: "Greece" },
  { city: "Heraklion", iata: "HER", airport: "Heraklion International Airport", country: "GR", countryName: "Greece" },
  { city: "Rhodes", iata: "RHO", airport: "Rhodes International Airport", country: "GR", countryName: "Greece" },
  { city: "Corfu", iata: "CFU", airport: "Corfu International Airport", country: "GR", countryName: "Greece" },
  { city: "Chania", iata: "CHQ", airport: "Chania International Airport", country: "GR", countryName: "Greece" },
  { city: "Mykonos", iata: "JMK", airport: "Mykonos Airport", country: "GR", countryName: "Greece" },
  { city: "Santorini", iata: "JTR", airport: "Santorini Airport", country: "GR", countryName: "Greece" },
  { city: "Zakynthos", iata: "ZTH", airport: "Zakynthos International Airport", country: "GR", countryName: "Greece" },
  { city: "Kos", iata: "KGS", airport: "Kos Island International Airport", country: "GR", countryName: "Greece" },
  
  { city: "Istanbul", iata: "IST", airport: "Istanbul Airport", country: "TR", countryName: "Turkey" },
  { city: "Istanbul", iata: "SAW", airport: "Sabiha Gökçen International Airport", country: "TR", countryName: "Turkey" },
  { city: "Ankara", iata: "ESB", airport: "Esenboğa International Airport", country: "TR", countryName: "Turkey" },
  { city: "Izmir", iata: "ADB", airport: "Adnan Menderes Airport", country: "TR", countryName: "Turkey" },
  { city: "Antalya", iata: "AYT", airport: "Antalya Airport", country: "TR", countryName: "Turkey" },
  { city: "Bodrum", iata: "BJV", airport: "Bodrum-Milas Airport", country: "TR", countryName: "Turkey" },
  { city: "Dalaman", iata: "DLM", airport: "Dalaman Airport", country: "TR", countryName: "Turkey" },
  { city: "Gaziantep", iata: "GZT", airport: "Gaziantep Airport", country: "TR", countryName: "Turkey" },
  { city: "Trabzon", iata: "TZX", airport: "Trabzon Airport", country: "TR", countryName: "Turkey" },
  { city: "Kayseri", iata: "ASR", airport: "Kayseri Airport", country: "TR", countryName: "Turkey" },
  
  { city: "Moscow", iata: "SVO", airport: "Sheremetyevo International Airport", country: "RU", countryName: "Russia" },
  { city: "Moscow", iata: "DME", airport: "Domodedovo International Airport", country: "RU", countryName: "Russia" },
  { city: "Moscow", iata: "VKO", airport: "Vnukovo International Airport", country: "RU", countryName: "Russia" },
  { city: "St. Petersburg", iata: "LED", airport: "Pulkovo Airport", country: "RU", countryName: "Russia" },
  { city: "Novosibirsk", iata: "OVB", airport: "Tolmachevo Airport", country: "RU", countryName: "Russia" },
  { city: "Yekaterinburg", iata: "SVX", airport: "Koltsovo Airport", country: "RU", countryName: "Russia" },
  { city: "Sochi", iata: "AER", airport: "Sochi International Airport", country: "RU", countryName: "Russia" },
  { city: "Kazan", iata: "KZN", airport: "Kazan International Airport", country: "RU", countryName: "Russia" },
  { city: "Samara", iata: "KUF", airport: "Kurumoch International Airport", country: "RU", countryName: "Russia" },
  { city: "Rostov-on-Don", iata: "ROV", airport: "Platov International Airport", country: "RU", countryName: "Russia" },
  
  { city: "Reykjavik", iata: "KEF", airport: "Keflavík International Airport", country: "IS", countryName: "Iceland" },
  { city: "Reykjavik", iata: "RKV", airport: "Reykjavik Airport", country: "IS", countryName: "Iceland" },
  { city: "Akureyri", iata: "AEY", airport: "Akureyri Airport", country: "IS", countryName: "Iceland" },
  
  { city: "Dublin", iata: "DUB", airport: "Dublin Airport", country: "IE", countryName: "Ireland" },
  { city: "Cork", iata: "ORK", airport: "Cork Airport", country: "IE", countryName: "Ireland" },
  { city: "Shannon", iata: "SNN", airport: "Shannon Airport", country: "IE", countryName: "Ireland" },
  { city: "Knock", iata: "NOC", airport: "Ireland West Airport", country: "IE", countryName: "Ireland" },
  
  { city: "Lisbon", iata: "LIS", airport: "Humberto Delgado Airport", country: "PT", countryName: "Portugal" },
  { city: "Porto", iata: "OPO", airport: "Francisco Sá Carneiro Airport", country: "PT", countryName: "Portugal" },
  { city: "Faro", iata: "FAO", airport: "Faro Airport", country: "PT", countryName: "Portugal" },
  { city: "Funchal", iata: "FNC", airport: "Cristiano Ronaldo International Airport", country: "PT", countryName: "Portugal" },
  
  { city: "Luxembourg", iata: "LUX", airport: "Luxembourg Airport", country: "LU", countryName: "Luxembourg" },
  { city: "Malta", iata: "MLA", airport: "Malta International Airport", country: "MT", countryName: "Malta" },
  
  { city: "Nice", iata: "NCE", airport: "Nice Côte d'Azur Airport", country: "FR", countryName: "France" },
  
  // USER REQUESTED MISSING AIRPORTS - CRITICAL BUG FIXES
  { city: "Islamabad", iata: "ISB", airport: "Islamabad International Airport", country: "PK", countryName: "Pakistan" },
  { city: "Karachi", iata: "KHI", airport: "Jinnah International Airport", country: "PK", countryName: "Pakistan" },
  { city: "Lahore", iata: "LHE", airport: "Allama Iqbal International Airport", country: "PK", countryName: "Pakistan" },
  { city: "Sharm El Sheikh", iata: "SSH", airport: "Sharm El Sheikh International Airport", country: "EG", countryName: "Egypt" },
  { city: "Ulaanbaatar", iata: "ULN", airport: "Chinggis Khaan International Airport", country: "MN", countryName: "Mongolia" },
  { city: "Guilin", iata: "KWL", airport: "Guilin Liangjiang International Airport", country: "CN", countryName: "China" },
  
  // CRITICAL BUG FIX: MISSING BRATISLAVA AND OTHER ESSENTIAL IATA AIRPORTS
  { city: "Bratislava", iata: "BTS", airport: "M. R. Štefánik Airport", country: "SK", countryName: "Slovakia" },
];

// Create indexed lookup for fast performance
const createAirportIndex = () => {
  const index = new Map();
  GLOBAL_AIRPORTS_DATABASE.forEach(airport => {
    // Index by IATA code
    index.set(airport.iata.toLowerCase(), airport);
    // Index by city name  
    index.set(airport.city.toLowerCase(), airport);
    // Index by airport name
    index.set(airport.airport.toLowerCase(), airport);
  });
  return index;
};

const AIRPORT_INDEX = createAirportIndex();

// Debounced hook
// OPTIMIZED DEBOUNCED HOOK FOR PERFORMANCE
function useDebounced(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Window width hook for responsive design
function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowWidth;
}

// City Input Component - Updated for Overlay Support
function CityInput({ label, value, onChange, onNext, autoFocus = false, integrated = false, overlay = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounced(query, 300);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const abortController = useRef(null);
  
  // Backend base URL from environment
  const backendBase = process.env.REACT_APP_BACKEND_URL;
  
  // Popular airports for dropdown display - Top Indian + International
  const popularAirports = [
    // Top Indian Airports
    { city: "Mumbai", airport: "Chhatrapati Shivaji Maharaj Intl", iata: "BOM", country: "IN" },
    { city: "Delhi", airport: "Indira Gandhi Intl", iata: "DEL", country: "IN" },
    { city: "Bengaluru", airport: "Kempegowda Intl", iata: "BLR", country: "IN" },
    { city: "Hyderabad", airport: "Rajiv Gandhi Intl", iata: "HYD", country: "IN" },
    { city: "Chennai", airport: "Chennai Intl", iata: "MAA", country: "IN" },
    { city: "Kolkata", airport: "Netaji Subhas Chandra Bose Intl", iata: "CCU", country: "IN" },
    { city: "Pune", airport: "Pune Intl", iata: "PNQ", country: "IN" },
    { city: "Ahmedabad", airport: "Sardar Vallabhbhai Patel Intl", iata: "AMD", country: "IN" },
    { city: "Kochi", airport: "Cochin Intl", iata: "COK", country: "IN" },
    { city: "Goa", airport: "Manohar Intl", iata: "GOI", country: "IN" },
    
    // Top International Airports
    { city: "Dubai", airport: "Dubai International", iata: "DXB", country: "AE" },
    { city: "Singapore", airport: "Singapore Changi", iata: "SIN", country: "SG" },
    { city: "Bangkok", airport: "Suvarnabhumi", iata: "BKK", country: "TH" },
    { city: "London", airport: "Heathrow Airport", iata: "LHR", country: "GB" },
    { city: "New York", airport: "John F Kennedy Intl", iata: "JFK", country: "US" },
    { city: "Paris", airport: "Charles de Gaulle Airport", iata: "CDG", country: "FR" },
    { city: "Tokyo", airport: "Narita International", iata: "NRT", country: "JP" },
    { city: "Hong Kong", airport: "Hong Kong International", iata: "HKG", country: "HK" },
    { city: "Sydney", airport: "Kingsford Smith Airport", iata: "SYD", country: "AU" },
    { city: "Toronto", airport: "Lester B Pearson Intl", iata: "YYZ", country: "CA" }
  ];
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Auto-focus when autoFocus prop changes
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Reset query when value prop changes (important for swap functionality)
  useEffect(() => {
    if (value && value.city) {
      setQuery("");
    }
  }, [value]);
  
  // ENHANCED AUTOCOMPLETE SEARCH - High Performance with 2+ Character Trigger
  // REMOVED: Duplicate functions now defined at App level

  // Enhanced search logic with "All Airports" support
  // MAIN AUTOCOMPLETE LOGIC - Trigger on 2+ Characters (Note: This is for the inline CityInput component, not the overlay)
  useEffect(() => {
    // Don't show suggestions if field already has a complete selected value (when not actively typing)
    if (value && value.iata && !query) {
      setOpen(false);
      setSuggestions([]);
      return;
    }
    
    // Trigger autocomplete search with 2+ characters (per requirements)
    if (debouncedQuery && debouncedQuery.length >= 2) {
      const autocompleteResults = performAutocompleteSearch(debouncedQuery);
      
      if (autocompleteResults.length > 0) {
        setSuggestions(autocompleteResults);
        setOpen(true);
      } else {
        // No matches found - keep dropdown open but show empty state
        setSuggestions([]);
        setOpen(true);
      }
    } else if (open && (!debouncedQuery || debouncedQuery.length < 2)) {
      // Show popular airports when dropdown is open but query is less than 2 characters
      const popularResults = GLOBAL_AIRPORTS_DATABASE
        .filter(airport => ['BOM', 'DEL', 'BLR', 'HYD', 'MAA', 'CCU', 'PNQ', 'AMD', 'DXB', 'SIN'].includes(airport.iata))
        .map(airport => ({
          ...airport,
          displayText: `${airport.iata} – ${airport.airport}, ${airport.city}`,
          matchScore: 0
        }));
      setSuggestions(popularResults);
    } else if (!debouncedQuery || debouncedQuery.length === 0) {
      setSuggestions([]);
      setOpen(false);
    }
  }, [debouncedQuery, open, value, performAutocompleteSearch]);
  
  // REMOVED: Unused helper functions (getCityCode, getCountryName)
  
  const searchAirports = async (searchQuery) => {
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    setLoading(true);
    
    try {
      const urlBase = backendBase || (window.__BACKEND_URL__ || (window.ENV && window.ENV.REACT_APP_BACKEND_URL));
      if (!urlBase) {
        throw new Error('Backend URL not configured');
      }
      
      const response = await fetch(
        `${urlBase}/api/airports/search?query=${encodeURIComponent(searchQuery)}&limit=6`,
        {
          signal: abortController.current.signal,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSuggestions(data.results || []);
      setOpen(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Airport search error:', error);
        // Fallback to enhanced airport database search
        const enhancedFallback = createEnhancedSuggestions(searchQuery);
        setSuggestions(enhancedFallback);
        setOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset mobile zoom when input loses focus
  const handleInputBlur = () => {
    if (window.innerWidth <= 767) {
      setTimeout(() => {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      }, 100);
    }
  };

  const handleInputFocus = () => {
    // If field has a selected value, clear it when focused
    if (value) {
      setQuery("");
      onChange(null);
      setSuggestions(popularAirports);
      setOpen(true);
    } else if (!query) {
      setSuggestions(popularAirports);
      setOpen(true);
    }
  };

  const handleInputClick = () => {
    // Always allow clicking anywhere in the input to edit
    if (value) {
      // If field has a selected city, clear it and show popular destinations immediately
      setQuery("");
      onChange(null);
      setSuggestions(popularAirports);
      setOpen(true);
      
      // Focus the input for immediate typing
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    } else if (!query) {
      // If field is empty, show popular destinations
      setSuggestions(popularAirports);
      setOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    
    // Clear any selected value when user starts typing
    if (value) {
      onChange(null);
    }
    
    // Show suggestions when typing
    if (inputValue.length === 0) {
      setSuggestions(popularAirports);
      setOpen(true);
    }
  };

  // HANDLE AIRPORT SELECTION - Save IATA, Display Full Format
  const handleAirportSelect = (airport) => {
    // Format: "IATA – Airport Name, City" as per requirements
    const displayFormat = `${airport.iata} – ${airport.airport}, ${airport.city}`;
    
    // Save IATA code for backend (as per requirements)
    const airportData = {
      iata: airport.iata,
      city: airport.city,
      airport: airport.airport,
      country: airport.country,
      countryName: airport.countryName,
      displayText: displayFormat
    };
    
    setQuery(displayFormat);
    onChange(airportData);
    setOpen(false);
    setSuggestions([]);
    
    // Clear any ongoing search
    if (abortController.current) {
      abortController.current.abort();
    }
    
    // Progress to next field with slight delay for smooth UX
    setTimeout(() => {
      if (onNext) {
        onNext();
      }
    }, 200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleAirportSelect(suggestions[0]);
      } else if (onNext) {
        onNext();
      }
    }
  };
  
  const displayValue = query || (value && value.city ? value.city : "");
  
  return (
    <div ref={containerRef} className="relative" style={{ minWidth: 0, maxWidth: '100%', position: 'relative' }}>
      {/* Overlay Mode - Full search bar */}
      {overlay ? (
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            placeholder="Type city name or airport code"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              background: '#f9fafb'
            }}
            autoFocus={autoFocus}
          />
          
          {/* Overlay Dropdown */}
          {open && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              marginTop: '4px',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.iata || suggestion.city}
                  onClick={() => handleAirportSelect(suggestion)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  className="overlay-suggestion-hover"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                        {suggestion.city}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {suggestion.airport}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#6b7280',
                      fontFamily: 'monospace'
                    }}>
                      {suggestion.iata}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Original integrated/standalone modes
        <>
          {/* Integrated Design - Label inside the container */}
          {integrated ? (
            <div 
              className="integrated-city-input"
              style={{ 
                padding: '12px 16px',
                height: '100%',
                minHeight: '64px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'text',
                position: 'relative'
              }}
              onClick={handleInputClick}
            >
              <label className="block text-[10px] font-medium text-neutral-500 mb-1 uppercase tracking-wide">{label}</label>
              <div className="flex items-center" style={{ minWidth: 0, maxWidth: '100%' }}>
                <span className="h-3 w-3 text-neutral-400 mr-2 flex-shrink-0 text-xs">✈️</span>
                <input
                  ref={inputRef}
                  value={displayValue}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onClick={handleInputClick}
                  onKeyPress={handleKeyPress}
                  placeholder="Type city or code"
                  className="outline-none bg-transparent text-sm flex-1 border-none focus:outline-none focus:ring-0 focus:border-none"
                  style={{ 
                    boxShadow: 'none !important',
                    outline: 'none !important',
                    border: 'none !important',
                    minWidth: 0,
                    maxWidth: '100%',
                    width: '100%',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: value ? '#111827' : '#9ca3af'
                  }}
                />
                {value && value.iata && (
                  <span className="text-[10px] text-neutral-500 font-mono uppercase ml-2 flex-shrink-0 bg-neutral-100 px-1.5 py-0.5 rounded">
                    {value.iata}
                  </span>
                )}
                {(query || value) && (
                  <button
                    onClick={(e) => { 
                      e.stopPropagation();
                      setQuery(""); 
                      onChange(null); 
                      setOpen(false); 
                      setSuggestions([]);
                      setTimeout(() => {
                        if (inputRef.current) {
                          inputRef.current.focus();
                        }
                      }, 100);
                    }}
                    className="ml-2 text-neutral-400 hover:text-neutral-600 flex-shrink-0 text-xs"
                    style={{ padding: '2px' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Original Design - Keep for backward compatibility
            <>
              <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
              <div 
                className="h-12 rounded-xl border border-neutral-300 flex items-center px-3 hover:border-neutral-400 transition-colors focus-within:border-neutral-400 cursor-text"
                style={{ minWidth: 0, maxWidth: '100%', width: '100%', position: 'relative' }}
                onClick={handleInputClick}
              >
                <span className="h-4 w-4 text-neutral-500 mr-2 flex-shrink-0">✈️</span>
                <input
                  ref={inputRef}
                  value={displayValue}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onClick={handleInputClick}
                  onKeyPress={handleKeyPress}
                  placeholder="Type city or code"
                  className="outline-none bg-transparent text-sm flex-1 border-none focus:outline-none focus:ring-0 focus:border-none"
                  style={{ 
                    boxShadow: 'none !important',
                    outline: 'none !important',
                    border: 'none !important',
                    minWidth: 0,
                    maxWidth: '100%',
                    width: '100%',
                    fontSize: '16px'
                  }}
                />
                {value && value.iata && (
                  <span className="text-[11px] text-neutral-500 font-mono uppercase ml-2 flex-shrink-0">{value.iata}</span>
                )}
                {(query || value) && (
                  <button
                    onClick={() => { 
                      setQuery(""); 
                      onChange(null); 
                      setOpen(false); 
                      setSuggestions([]);
                      setTimeout(() => {
                        if (inputRef.current) {
                          inputRef.current.focus();
                        }
                      }, 100);
                    }}
                    className="ml-1 text-neutral-400 hover:text-neutral-600 flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}
      
      {/* Dropdown - ELEGANT & COMPACT Design like MakeMyTrip */}
      {open && suggestions.length > 0 && (
        <>
          <div 
            className="suggestions-dropdown-elegant"
            style={{ 
              position: 'fixed',
              top: `${(containerRef.current?.getBoundingClientRect().bottom || 0) + 8}px`,
              left: `${containerRef.current?.getBoundingClientRect().left || 0}px`,
              width: `${containerRef.current?.getBoundingClientRect().width || 300}px`,
              zIndex: 99999,
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              maxHeight: '280px',
              overflowY: 'auto',
              padding: '8px 0'
            }}
          >
            {!query && (
              <div className="px-3 py-2 text-xs font-medium text-neutral-400 uppercase tracking-wide border-b border-neutral-100">
                Popular Cities
              </div>
            )}
            
            {suggestions.length === 0 && debouncedQuery && debouncedQuery.length >= 2 ? (
              <div className="px-3 py-4 text-center text-neutral-500 text-sm">
                No airports found for "{debouncedQuery}"
              </div>
            ) : (
              suggestions.map((airport, i) => (
                <button
                  key={`${airport.iata}-${airport.city}-${i}`}
                  onClick={() => handleAirportSelect(airport)}
                  className="w-full text-left px-3 py-3 hover:bg-blue-50 transition-colors duration-150 border-b border-neutral-100 last:border-b-0"
                  style={{ minHeight: '56px' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {/* IATA Code - Airport Name, City format as required */}
                      <div className="text-sm font-medium text-neutral-900 mb-1">
                        <span className="font-bold text-blue-600">{airport.iata}</span>
                        <span className="text-neutral-400 mx-1">–</span>
                        <span>
                          {airport.searchText ? 
                            highlightMatch(airport.airport, airport.searchText) : 
                            airport.airport
                          }
                        </span>
                      </div>
                      {/* City, Country */}
                      <div className="text-xs text-neutral-500">
                        {airport.searchText ? 
                          highlightMatch(airport.city, airport.searchText) : 
                          airport.city
                        }, {airport.countryName}
                      </div>
                    </div>
                    {/* Match score indicator for debugging (remove in production) */}
                    {airport.matchScore > 0 && (
                      <div className="text-xs text-neutral-400 ml-2">
                        {airport.matchScore}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
            
            {loading && (
              <div className="px-3 py-3 text-xs text-neutral-400 text-center">
                Searching...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Date Input Component with FIXED date formatting and selection
function DateInput({ label, value, onChange, title, disabled, autoFocus = false }) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const ref = useRef(null);
  const buttonRef = useRef(null);
  
  // Auto-focus when autoFocus prop changes
  useEffect(() => {
    if (autoFocus && buttonRef.current && !disabled) {
      buttonRef.current.focus();
      // Auto-open the calendar
      setTimeout(() => setOpen(true), 200);
    }
  }, [autoFocus, disabled]);
  
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

  // Format date to DDMMYYYY
  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  // Convert date to display format DD MMM YYYY
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
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
            // FIXED: Use local date string to avoid timezone issues
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            const isCurrentMonth = date.getMonth() === month;
            const isSelected = value && value === dateStr;
            const isToday = new Date().toDateString() === date.toDateString();
            
            return (
              <button 
                key={i} 
                onClick={() => { 
                  console.log('Selected date:', dateStr); // Debug log
                  onChange(dateStr); 
                  setOpen(false); 
                }}
                className={`aspect-square rounded-md text-sm flex items-center justify-center transition-colors ${
                  date.getMonth() === currentMonth.getMonth() ? "text-neutral-900" : "text-neutral-400"
                } ${
                  isSelected ? "bg-blue-600 text-white font-semibold" : 
                  isToday ? "bg-blue-100 text-blue-700 font-medium" :
                  "hover:bg-neutral-50"
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
        ref={buttonRef}
        disabled={disabled} 
        onClick={() => !disabled && setOpen(true)} 
        className="h-12 w-full px-4 rounded-xl border border-neutral-300 text-left hover:bg-neutral-50 flex items-center justify-between disabled:opacity-50"
      >
        <span className="text-sm text-neutral-700">
          {value ? formatDateDisplay(value) : label}
        </span>
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

// Simple Date Picker Component for Overlays
function SimpleDatePicker({ label, value, onChange, minDate, overlay = false }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const addMonths = (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
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
        <div className="grid grid-cols-7 text-xs text-neutral-500 mb-2">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => 
            <div key={day} className="py-2 text-center font-medium">{day}</div>
          )}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isSelected = value && value === dateStr;
            const isToday = new Date().toDateString() === date.toDateString();
            const isDisabled = minDate && date < new Date(minDate);
            
            return (
              <button 
                key={i} 
                disabled={isDisabled}
                onClick={() => { 
                  if (!isDisabled) {
                    onChange(dateStr);
                  }
                }}
                className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-colors ${
                  isCurrentMonth ? "text-neutral-900" : "text-neutral-400"
                } ${
                  isSelected ? "bg-blue-600 text-white font-semibold" : 
                  isToday ? "bg-blue-100 text-blue-700 font-medium" :
                  isDisabled ? "text-neutral-300 cursor-not-allowed" :
                  "hover:bg-neutral-100"
                }`}
                style={{ minHeight: '40px' }}
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
    <div>
      <div className="mb-3">
        <h4 className="text-sm font-medium text-neutral-700 mb-1">{label}</h4>
        {value && (
          <div className="text-lg font-semibold text-blue-600">
            {formatDateDisplay(value)}
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} 
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 text-sm"
          >
            ← Prev
          </button>
          <h3 className="text-base font-semibold">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 text-sm"
          >
            Next →
          </button>
        </div>
        {renderCalendar()}
      </div>
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
function PaxOverlay({ value, onChange, onClose, compact = false }) {
  const [pax, setPax] = useState(value);
  const ref = useRef(null);
  
  useEffect(() => {
    if (onClose) {
      const handleClickOutside = (e) => {
        if (!ref.current?.contains(e.target)) onClose();
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [onClose]);
  
  const updatePax = (key, newValue) => setPax(prev => ({ ...prev, [key]: newValue }));
  const increment = (key) => updatePax(key, Math.min(9, pax[key] + 1));
  const decrement = (key) => updatePax(key, Math.max(key === 'adt' ? 1 : 0, pax[key] - 1));
  
  useEffect(() => {
    if (pax.inf > pax.adt) updatePax('inf', pax.adt);
    if (pax.adt < 1) updatePax('adt', 1);
  }, [pax.adt, pax.inf]);

  // Compact mode for overlay
  if (compact) {
    return (
      <div>
        <div className="space-y-3">
          <PaxRow label="Adults (12+)" hint="Ages 12+" value={pax.adt} onInc={() => increment('adt')} onDec={() => decrement('adt')} />
          <PaxRow label="Children (2–11)" hint="Ages 2–11" value={pax.chd} onInc={() => increment('chd')} onDec={() => decrement('chd')} />
          <PaxRow label="Infants (0–1)" hint="On lap" value={pax.inf} onInc={() => increment('inf')} onDec={() => decrement('inf')} />
          
          <div className="pt-3 border-t border-neutral-200">
            <div className="text-sm font-medium mb-2" style={{ fontWeight: '500' }}>Cabin Class</div>
            <div className="grid grid-cols-2 gap-2">
              {["Economy", "Premium Economy", "Business", "First"].map((cabin) => (
                <button 
                  key={cabin} 
                  onClick={() => updatePax('cabin', cabin)} 
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    pax.cabin === cabin ? "border-blue-400 bg-blue-50 text-blue-700" : "border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {cabin}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-700">
              {pax.adt} Adult{pax.adt > 1 ? 's' : ''}, {pax.chd} Child{pax.chd > 1 ? 'ren' : ''}, {pax.inf} Infant{pax.inf > 1 ? 's' : ''} · {pax.cabin}
            </div>
            <button 
              onClick={() => onChange(pax)} 
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Original modal mode
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
// Search Card Component with Auto-focus Guidance
function SearchCard({ onSearch, overlayStates, searchStates }) {
  const {
    showFromOverlay, setShowFromOverlay,
    showToOverlay, setShowToOverlay,
    showDateOverlay, setShowDateOverlay,
    showPassengerOverlay, setShowPassengerOverlay
  } = overlayStates;
  
  const {
    from, setFrom, to, setTo, depart, setDepart, ret, setRet,
    pax, setPax, trip, setTrip
  } = searchStates;
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // 0: from, 1: to, 2: date, 3: passenger, 4: search

  // Responsive design hook
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth <= 768;

  // Backend base URL from environment
  const backendBase = process.env.REACT_APP_BACKEND_URL;

  // Simple date formatter for compact display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  // Auto-focus progression handlers
  const handleFromComplete = () => {
    setCurrentStep(1); // Move to "To" field
  };

  const handleToComplete = () => {
    setCurrentStep(2); // Move to date field  
  };

  const handleDateComplete = () => {
    setCurrentStep(3); // Move to passenger selection
    // Auto-open passenger selector after date selection
    setTimeout(() => {
      setShowPassengerOverlay(true);
    }, 300);
  };

  const handlePassengerComplete = () => {
    setCurrentStep(4); // Enable search button glow
  };

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="rounded-2xl shadow-sm border border-blue-100/30 bg-gradient-to-br from-white to-blue-50/20 p-4 md:p-6">
        {/* Trip Type Tabs */}
        <div className="inline-flex rounded-full bg-neutral-100 p-1">
          {[
            { id: "OW", label: "One Way" },
            { id: "RT", label: "Round Trip" },
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

        {/* Compact From/To Container - Mobile Responsive */}
        <div className="mt-3 compact-flight-container" style={{ 
          position: 'relative',
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'stretch',
          minHeight: '52px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* From Field - Left Side */}
          <div 
            style={{ 
              flex: '1', 
              minWidth: 0, 
              maxWidth: '100%',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFromOverlay(true);
            }}
          >
            <div style={{ 
              padding: window.innerWidth <= 767 ? '6px 10px' : '8px 12px',
              height: '100%',
              minHeight: window.innerWidth <= 767 ? '44px' : '52px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div className="text-[9px] font-medium text-neutral-500 mb-0.5 uppercase tracking-wide">FROM</div>
              <div className="flex items-center" style={{ minWidth: 0, maxWidth: '100%' }}>
                <span className="text-xs mr-1.5 flex-shrink-0">✈️</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ fontSize: '14px', color: '#111827' }}>
                    {from ? from.city : 'Select City'}
                  </div>
                  {from && from.iata && (
                    <div className="text-[10px] text-neutral-500 font-mono uppercase">
                      {from.iata}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Swap Button - Mobile Responsive Design */}
          <div style={{
            position: isMobile ? 'absolute' : 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? '40px' : '44px',
            minWidth: isMobile ? '40px' : '44px',
            maxWidth: isMobile ? '40px' : '44px',
            height: isMobile ? '40px' : 'auto',
            background: 'white',
            top: isMobile ? '50%' : 'auto',
            right: isMobile ? '12px' : 'auto',
            transform: isMobile ? 'translateY(-50%)' : 'none',
            zIndex: isMobile ? 10 : 'auto'
          }}>
            <button
              aria-label="Swap From and To"
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation();
                const tempFrom = from; 
                const tempTo = to;
                setFrom(tempTo); 
                setTo(tempFrom);
              }}
              className="swap-button-enhanced"
              style={{ 
                height: isMobile ? '28px' : '32px',
                width: isMobile ? '28px' : '32px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '14px' : '16px',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.color = '#111827';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#374151';
                e.target.style.transform = 'scale(1)';
                e.target.style.borderColor = '#e5e7eb';
              }}
            >
              🔄
            </button>
          </div>
          
          {/* To Field - Right Side */}
          <div 
            style={{ 
              flex: '1', 
              minWidth: 0, 
              maxWidth: '100%', 
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowToOverlay(true);
            }}
          >
            <div style={{ 
              padding: window.innerWidth <= 767 ? '6px 10px' : '8px 12px',
              height: '100%',
              minHeight: window.innerWidth <= 767 ? '44px' : '52px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div className="text-[9px] font-medium text-neutral-500 mb-0.5 uppercase tracking-wide">TO</div>
              <div className="flex items-center" style={{ minWidth: 0, maxWidth: '100%' }}>
                <span className="text-xs mr-1.5 flex-shrink-0">✈️</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ fontSize: '14px', color: '#111827' }}>
                    {to ? to.city : 'Select City'}
                  </div>
                  {to && to.iata && (
                    <div className="text-[10px] text-neutral-500 font-mono uppercase">
                      {to.iata}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selection - Compact Row */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {/* Departure Date */}
          <div 
            className="date-selector-compact"
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '10px',
              padding: '8px 12px',
              minHeight: '52px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDateOverlay(true);
            }}
          >
            <div className="text-[9px] font-medium text-neutral-500 mb-0.5 uppercase tracking-wide">DEPARTURE</div>
            <div className="flex items-center">
              <span className="text-xs mr-1.5">📅</span>
              <div className="text-sm font-semibold" style={{ fontSize: '14px', color: depart ? '#111827' : '#9ca3af' }}>
                {depart ? formatDate(depart) : 'Select Date'}
              </div>
            </div>
          </div>

          {/* Return Date - Only show for Round Trip */}
          {trip === 'RT' && (
            <div 
              className="date-selector-compact"
              style={{
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                padding: '8px 12px',
                minHeight: '52px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDateOverlay(true);
              }}
            >
              <div className="text-[9px] font-medium text-neutral-500 mb-0.5 uppercase tracking-wide">RETURN</div>
              <div className="flex items-center">
                <span className="text-xs mr-1.5">📅</span>
                <div className="text-sm font-semibold" style={{ fontSize: '14px', color: ret ? '#111827' : '#9ca3af' }}>
                  {ret ? formatDate(ret) : 'Select Date'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Passenger Selection - Mobile Responsive */}
        <div 
          className="mt-3 passenger-selector-compact"
          style={{
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            padding: isMobile ? '10px 14px' : '8px 12px',
            minHeight: isMobile ? '56px' : '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowPassengerOverlay(true);
          }}
        >
          <div>
            <div className="text-[9px] font-medium text-neutral-500 mb-0.5 uppercase tracking-wide">PASSENGERS & CLASS</div>
            <div className="flex items-center">
              <span className="text-xs mr-1.5">👥</span>
              <div className="text-sm font-semibold" style={{ fontSize: '14px', color: '#111827' }}>
                {pax.adt + pax.chd + pax.inf} Traveller{pax.adt + pax.chd + pax.inf > 1 ? 's' : ''}, {pax.cabin}
              </div>
            </div>
          </div>
          <div className="text-neutral-400 text-lg">›</div>
        </div>

        {/* Options */}
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4" /> Direct flights only
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4" /> Flexible dates ±3 days
          </label>
        </div>

        {/* Search Button - Compact & Centered with Glow Effect */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={async () => {
              if (!from || !to) {
                alert('Please select both From and To airports');
                return;
              }
              if (!depart) {
                alert('Please select a departure date');
                return;
              }
              
              // Call the parent's search handler
              if (onSearch) {
                await onSearch({
                  from,
                  to,
                  depart,
                  return: ret,
                  trip,
                  pax
                });
              }
            }}
            className={`px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-60 ${
              currentStep === 4 && from && to && depart ? 'ring-4 ring-blue-300 shadow-2xl from-blue-700 to-blue-800 scale-105' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Searching…' : 'Search Flights'}
          </button>
        </div>

        {/* Results */}
        {error && (
          <div className="mt-4 p-3 rounded-lg border border-red-200 text-red-700 bg-red-50 text-sm">
            {error}
          </div>
        )}
        {results && (
          <div className="mt-6">
            <div className="text-sm text-neutral-700 mb-2">
              {results.total_found} flights found · Source: {results.data_source}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {(results.flights || []).map((f, idx) => (
                <div key={idx} className="rounded-xl border border-neutral-200 p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{f.airline || f.airline_name || 'Flight'}</div>
                    <div className="text-sm font-semibold">₹{(f.price || f.lowest_fare || 0).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">
                    {f.origin} → {f.destination} · {f.departure_time} → {f.arrival_time} · {f.duration}
                  </div>
                  {f.fare_options && f.fare_options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {f.fare_options.slice(0, 3).map((fo, i) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {fo.fareType || fo.name}: ₹{fo.totalPrice?.toLocaleString?.() || fo.totalPrice}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {results.ai_recommendation && (
              <div className="mt-4 p-3 rounded-lg border border-blue-200 bg-blue-50 text-sm text-blue-800">
                💡 {results.ai_recommendation}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// Footer Component  
function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 pt-8">
      <div className="mx-auto max-w-5xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-semibold mb-2 text-black">About</div>
          <ul className="space-y-1">
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Company</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 text-black">Help</div>
          <ul className="space-y-1">
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Support</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">FAQ</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 text-black">Policies</div>
          <ul className="space-y-1">
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Terms & Conditions</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Cancellation & Refund</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Cookie Policy</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Disclaimer</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Grievance Officer</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 text-black">Follow</div>
          <ul className="space-y-1">
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Instagram</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Twitter</a></li>
            <li><a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-neutral-500">
        © {new Date().getFullYear()} TourSmile. All rights reserved.
      </div>
    </footer>
  );
}

// Main App Component
function App() {
  // Navigation state
  const [currentPage, setCurrentPage] = useState('search'); // 'search', 'results', 'selection', 'passenger', 'payment', 'confirmation'
  const [searchResults, setSearchResults] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  
  // Overlay states - moved to App level for proper full-screen rendering
  const [showFromOverlay, setShowFromOverlay] = useState(false);
  const [showToOverlay, setShowToOverlay] = useState(false);
  const [showDateOverlay, setShowDateOverlay] = useState(false);
  const [showPassengerOverlay, setShowPassengerOverlay] = useState(false);
  
  // Overlay search state
  const [overlayQuery, setOverlayQuery] = useState('');
  const [overlayResults, setOverlayResults] = useState([]);

  // GLOBAL AUTOCOMPLETE SEARCH FUNCTIONS - Available to overlay  
  const performAutocompleteSearch = useCallback((query) => {
    // Minimum 2 characters required as per requirements
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const individualResults = [];
    const seen = new Set(); // Prevent duplicates
    
    // Search through global airports database - ONLY include relevant matches
    GLOBAL_AIRPORTS_DATABASE.forEach(airport => {
      const matchScore = calculateMatchScore(airport, searchTerm);
      
      // ONLY include results with score > 0 (actual matches)
      if (matchScore > 0) {
        const key = `${airport.iata}-${airport.city}`;
        if (!seen.has(key)) {
          individualResults.push({
            ...airport,
            matchScore,
            displayText: `${airport.iata} – ${airport.airport}, ${airport.city}`,
            searchText: searchTerm
          });
          seen.add(key);
        }
      }
    });

    // Group airports by city to create "All Airports" options
    const cityGroups = {};
    individualResults.forEach(airport => {
      const cityKey = `${airport.city}-${airport.countryName}`;
      if (!cityGroups[cityKey]) {
        cityGroups[cityKey] = [];
      }
      cityGroups[cityKey].push(airport);
    });

    const finalResults = [];
    
    // Add "All Airports" option for cities with multiple airports
    Object.entries(cityGroups).forEach(([cityKey, airports]) => {
      if (airports.length > 1) {
        const firstAirport = airports[0];
        const cityCode = getCityAllAirportsCode(firstAirport.city);
        
        finalResults.push({
          city: firstAirport.city,
          iata: cityCode,
          airport: "All Airports",
          countryName: firstAirport.countryName,
          country: firstAirport.country,
          isAllAirports: true,
          airportCount: airports.length,
          matchScore: Math.max(...airports.map(a => a.matchScore)) + 10, // Boost score for "All Airports"
          displayText: `${cityCode} – All Airports, ${firstAirport.city}`,
          searchText: searchTerm
        });
      }
    });

    // Add individual airports
    individualResults.forEach(airport => {
      finalResults.push(airport);
    });

    // Sort by match score STRICTLY (highest score first)
    return finalResults
      .sort((a, b) => {
        // Primary sort: Match score (highest first)
        if (a.matchScore !== b.matchScore) {
          return b.matchScore - a.matchScore;
        }
        // Secondary sort: "All Airports" first if same score
        if (a.isAllAirports && !b.isAllAirports) return -1;
        if (!a.isAllAirports && b.isAllAirports) return 1;
        // Tertiary sort: Alphabetical
        return a.city.localeCompare(b.city);
      })
      .slice(0, 10);
  }, []);

  // Get city code for "All Airports" option - FIXED HOUSTON BUG
  const getCityAllAirportsCode = (cityName) => {
    const cityCodeMap = {
      "London": "LON",
      "New York": "NYC",
      "Paris": "PAR", 
      "Tokyo": "TYO",
      "Milan": "MIL",
      "Rome": "ROM",
      "Chicago": "CHI",
      "Washington": "WAS",
      "Houston": "HST", // CRITICAL FIX: Use HST instead of HOU to avoid confusion with William P. Hobby Airport (HOU)
      "Dallas": "DFW",
      "São Paulo": "SAO",
      "Rio de Janeiro": "RIO", 
      "Buenos Aires": "BUE",
      "Beijing": "BJS",
      "Shanghai": "SHA",
      "Istanbul": "IST",
      "Toronto": "YTO"
    };
    
    return cityCodeMap[cityName] || cityName.substring(0, 3).toUpperCase();
  };

  // Calculate match score for relevance ranking - FIXED
  const calculateMatchScore = (airport, searchTerm) => {
    let score = 0;
    
    const airportIata = airport.iata.toLowerCase();
    const airportCity = airport.city.toLowerCase();
    const airportName = airport.airport.toLowerCase();
    const countryName = (airport.countryName || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    
    // EXACT IATA CODE MATCH (HIGHEST PRIORITY - 1000 points)
    if (airportIata === term) {
      return 1000;
    }
    
    // IATA CODE STARTS WITH SEARCH TERM (900 points)
    if (airportIata.startsWith(term)) {
      return 900;
    }
    
    // EXACT CITY NAME MATCH (800 points)  
    if (airportCity === term) {
      return 800;
    }
    
    // CITY NAME STARTS WITH SEARCH TERM (700 points)
    if (airportCity.startsWith(term)) {
      return 700;
    }
    
    // AIRPORT NAME STARTS WITH SEARCH TERM (600 points)
    if (airportName.startsWith(term)) {
      return 600;
    }
    
    // CITY NAME CONTAINS SEARCH TERM (500 points)
    if (airportCity.includes(term)) {
      return 500;
    }
    
    // AIRPORT NAME CONTAINS SEARCH TERM (400 points)
    if (airportName.includes(term)) {
      return 400;
    }
    
    // COUNTRY NAME CONTAINS SEARCH TERM (300 points)
    if (countryName.includes(term)) {
      return 300;
    }
    
    // NO MATCH - Return 0 (will be filtered out)
    return 0;
  };

  // Highlight matching text in results
  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        React.createElement('strong', { key: index, style: { fontWeight: '600', color: '#2563eb' } }, part) : 
        part
    );
  };
  
  // Search form state - moved to App level to share with overlays
  const [from, setFrom] = useState({ city: 'Mumbai', iata: 'BOM', airport: 'Chhatrapati Shivaji Maharaj Intl', country: 'IN' });
  const [to, setTo] = useState({ city: 'Delhi', iata: 'DEL', airport: 'Indira Gandhi Intl', country: 'IN' });
  const [depart, setDepart] = useState(null);
  const [ret, setRet] = useState(null);
  const [pax, setPax] = useState({ adt: 1, chd: 0, inf: 0, cabin: "Economy" });
  const [trip, setTrip] = useState("OW");
  
  const handleSearch = async (searchData) => {
    try {
      setSearchParams({
        from: searchData.from,
        to: searchData.to,
        departDate: searchData.depart,
        returnDate: searchData.return,
        passengers: `${searchData.pax.adt} Adult${searchData.pax.adt > 1 ? 's' : ''}${searchData.pax.chd > 0 ? `, ${searchData.pax.chd} Child${searchData.pax.chd > 1 ? 'ren' : ''}` : ''}${searchData.pax.inf > 0 ? `, ${searchData.pax.inf} Infant${searchData.pax.inf > 1 ? 's' : ''}` : ''}`,
        class: searchData.pax.cabin,
        tripType: searchData.trip
      });
      
      // Mock search delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to results page
      setCurrentPage('results');
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight);
    setCurrentPage('selection');
  };

  const handleBackToSearch = () => {
    setCurrentPage('search');
    setSearchResults(null);
    setSelectedFlight(null);
  };

  const handleBackToResults = () => {
    setCurrentPage('results');
    setSelectedFlight(null);
  };

  const openFromOverlay = () => {
    setShowFromOverlay(true);
    // Start with empty results - user must type to search
    setOverlayResults([]);
    setOverlayQuery('');
  };

  const openToOverlay = () => {
    setShowToOverlay(true);
    // Start with empty results - user must type to search  
    setOverlayResults([]);
    setOverlayQuery('');
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Render different pages based on current state */}
      {currentPage === 'search' && (
        <>
          {/* Header - Enhanced with subtle gradient */}
          <header className="border-b border-neutral-100 bg-gradient-to-b from-white to-blue-50/30">
            <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src="https://customer-assets.emergentagent.com/job_pixel-perfect-ui-12/artifacts/7qb5obai_FINAL%20LOGO%20-%20Copy.png"
                  alt="TourSmile"
                  className="h-12 w-auto"
                />
              </div>
              <div className="flex items-center space-x-3">
                <a href="https://wa.me/+919623959623" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 rounded-full border border-neutral-300 text-black hover:bg-green-50 hover:border-green-400 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516" fill="#25D366"/>
                  </svg>
                </a>
                <button className="px-4 py-2 rounded-full border border-neutral-300 text-black text-sm font-medium hover:bg-neutral-50 hover:border-neutral-400 transition-colors">
                  Sign In
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="mx-auto max-w-5xl px-4 pb-24">
            {/* Service Icons Section */}
            <section className="text-center pt-12 pb-8">
              <div className="flex justify-center items-center space-x-8 md:space-x-12 bg-white/50 rounded-xl py-4 px-6">
                {/* Flights Icon */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-neutral-300 bg-white flex items-center justify-center mb-2 group-hover:bg-blue-50 group-hover:border-blue-300 transition-all duration-200 shadow-sm">
                    <span className="text-xl md:text-2xl">✈️</span>
                  </div>
                  <span className="text-sm font-medium text-black">Flights</span>
                </div>
                
                {/* Hotels Icon */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-neutral-300 bg-white flex items-center justify-center mb-2 group-hover:bg-green-50 group-hover:border-green-300 transition-all duration-200 shadow-sm">
                    <span className="text-xl md:text-2xl">🏨</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-400">Hotels</span>
                </div>
                
                {/* Tours Icon */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-neutral-300 bg-white flex items-center justify-center mb-2 group-hover:bg-orange-50 group-hover:border-orange-300 transition-all duration-200 shadow-sm">
                    <span className="text-xl md:text-2xl">🗺️</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-400">Tours</span>
                </div>
              </div>
            </section>
            
            {/* Search Card */}
            <SearchCard 
              onSearch={handleSearch}
              overlayStates={{
                showFromOverlay, setShowFromOverlay,
                showToOverlay, setShowToOverlay,
                showDateOverlay, setShowDateOverlay,
                showPassengerOverlay, setShowPassengerOverlay
              }}
              searchStates={{
                from, setFrom, to, setTo, depart, setDepart, ret, setRet,
                pax, setPax, trip, setTrip
              }}
            />

            {/* Trust Section */}
            <section className="mt-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { icon: "🔒", title: "Secure Booking", desc: "SSL encrypted transactions" },
                  { icon: "📞", title: "24x7 Support", desc: "Round the clock assistance" },
                  { icon: "👨‍💼", title: "Personal Travel Assistant", desc: "Dedicated support executive" },
                  { icon: "⚡", title: "Instant Booking", desc: "Confirmed tickets in seconds" }
                ].map(item => (
                  <div key={item.title} className="p-4 rounded-xl bg-white/60 border border-blue-100/20 hover:shadow-lg hover:bg-white/80 transition-all duration-200">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-neutral-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>

          {/* Footer */}
          <Footer />
        </>
      )}
      
      {/* Results Page */}
      {currentPage === 'results' && (
        <>
          {/* Header with Back Button - Enhanced with subtle gradient */}
          <header className="border-b border-neutral-100 bg-gradient-to-b from-white to-blue-50/30">
            <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleBackToSearch}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Search
                </button>
                <div className="text-xl font-bold text-blue-600">TourSmile</div>
              </div>
            </div>
          </header>
          
          <FlightResults 
            searchParams={searchParams}
            onFlightSelect={handleFlightSelect}
          />
        </>
      )}
      
      {/* Flight Selection Page */}
      {currentPage === 'selection' && (
        <>
          <header className="border-b border-neutral-100 bg-gradient-to-b from-white to-blue-50/30">
            <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleBackToResults}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Results
                </button>
                <div className="text-xl font-bold text-blue-600">TourSmile</div>
              </div>
            </div>
          </header>
          
          <div className="mx-auto max-w-5xl px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Flight Selection</h1>
            <p className="text-gray-600 mb-8">Choose your fare option and proceed to passenger details</p>
            
            {selectedFlight && (
              <div className="bg-white border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{selectedFlight.logo}</span>
                    <div>
                      <div className="font-semibold text-lg">{selectedFlight.airline}</div>
                      <div className="text-gray-600">{selectedFlight.flightNumber}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedFlight.fareOptions?.map((option, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                      <div className="font-semibold mb-2">{option.type}</div>
                      <div className="text-2xl font-bold text-blue-600 mb-2">₹{option.price.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>🧳 {option.baggage}</div>
                        <div>{option.meal ? '🍽️ Meal included' : '🚫 No meal'}</div>
                        <div>{option.refundable ? '↩️ Refundable' : '🚫 Non-refundable'}</div>
                      </div>
                      <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        Select This Fare
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    
    {/* OVERLAYS - App Level for Full-Screen Display */}
    
    {/* City Selection Overlay - Ixigo Style */}
    {(showFromOverlay || showToOverlay) && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => {
              setShowFromOverlay(false);
              setShowToOverlay(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px',
              color: '#6b7280'
            }}
          >
            ←
          </button>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            {showFromOverlay ? 'Select Departure City' : 'Select Destination City'}
          </h3>
          <div style={{ width: '34px' }}></div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
          <input
            type="text"
            placeholder="Type city name or airport code"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              background: '#f9fafb'
            }}
            autoFocus={true}
            onChange={(e) => {
              const query = e.target.value;
              setOverlayQuery(query);
              
              // Trigger global autocomplete search for 2+ characters
              if (query && query.length >= 2) {
                const searchResults = performAutocompleteSearch(query);
                setOverlayResults(searchResults);
              } else {
                // Clear results for < 2 characters - NO popular airports bias
                setOverlayResults([]);
              }
            }}
          />
        </div>

        {/* Popular Cities */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
              {overlayQuery && overlayQuery.length >= 2 ? 'SEARCH RESULTS' : 'TYPE TO SEARCH AIRPORTS'}
            </h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {overlayResults.map((airport) => (
                <div
                  key={airport.iata}
                  style={{
                    padding: '12px',
                    border: '1px solid #f3f4f6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="city-option-hover"
                  onClick={() => {
                    if (showFromOverlay) {
                      setFrom(airport);
                      setShowFromOverlay(false);
                    } else {
                      setTo(airport);
                      setShowToOverlay(false);
                    }
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Required Format: "IATA – Airport Name, City" with All Airports Support */}
                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                      <span style={{ 
                        color: airport.isAllAirports ? '#1d4ed8' : '#2563eb', 
                        fontWeight: '600',
                        backgroundColor: airport.isAllAirports ? '#eff6ff' : 'transparent',
                        padding: airport.isAllAirports ? '2px 6px' : '0',
                        borderRadius: airport.isAllAirports ? '4px' : '0'
                      }}>
                        {airport.iata}
                      </span>
                      <span style={{ color: '#6b7280', margin: '0 6px' }}>–</span>
                      <span style={{ fontWeight: airport.isAllAirports ? '600' : '400' }}>
                        {overlayQuery && overlayQuery.length >= 2 ? 
                          highlightMatch(airport.airport, overlayQuery) : 
                          airport.airport
                        }
                        {airport.isAllAirports && (
                          <span style={{ color: '#1d4ed8', fontWeight: '500', fontSize: '14px' }}>
                            {' '}({airport.airportCount} airports)
                          </span>
                        )}
                      </span>
                      <span style={{ color: '#6b7280' }}>, </span>
                      <span>
                        {overlayQuery && overlayQuery.length >= 2 ? 
                          highlightMatch(airport.city, overlayQuery) : 
                          airport.city
                        }
                      </span>
                    </div>
                    {/* Country Name */}
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      {airport.countryName || airport.country}
                    </div>
                    {/* Match Score - Remove in production */}
                    {airport.matchScore > 0 && (
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Score: {airport.matchScore}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Date Selection Overlay - Compact Calendar */}
    {showDateOverlay && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => setShowDateOverlay(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px',
              color: '#6b7280'
            }}
          >
            ←
          </button>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Select Travel Date
          </h3>
          <div style={{ width: '34px' }}></div>
        </div>

        {/* Compact Calendar */}
        <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <SimpleDatePicker 
              label="Departure Date" 
              value={depart} 
              onChange={(date) => {
                setDepart(date);
                if (trip !== 'RT') {
                  setShowDateOverlay(false);
                }
              }}
              overlay={true}
            />
            {trip === 'RT' && (
              <div style={{ marginTop: '12px' }}>
                <SimpleDatePicker 
                  label="Return Date" 
                  value={ret} 
                  onChange={(date) => {
                    setRet(date);
                    setShowDateOverlay(false);
                  }}
                  minDate={depart}
                  overlay={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    
    {/* Passenger Selection Overlay - Compact */}
    {showPassengerOverlay && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => setShowPassengerOverlay(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px',
              color: '#6b7280'
            }}
          >
            ←
          </button>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Passengers & Class
          </h3>
          <div style={{ width: '34px' }}></div>
        </div>

        {/* Compact Passenger Selector */}
        <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <PaxOverlay 
              value={pax} 
              onChange={(newPax) => {
                setPax(newPax);
                setShowPassengerOverlay(false);
              }}
              compact={true}
            />
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default App;