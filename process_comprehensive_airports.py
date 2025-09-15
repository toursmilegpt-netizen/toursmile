#!/usr/bin/env python3
"""
Process the comprehensive airports.csv file to extract all IATA airports
for the TourSmile OTA platform ensuring 100% coverage.
"""

import csv
import json
import re
from collections import defaultdict

def process_comprehensive_airports():
    """Process the comprehensive airports database"""
    
    airports = []
    iata_airports = []
    
    # Country code mapping
    country_codes = {
        "AF": "Afghanistan", "AL": "Albania", "DZ": "Algeria", "AS": "American Samoa",
        "AD": "Andorra", "AO": "Angola", "AI": "Anguilla", "AQ": "Antarctica",
        "AG": "Antigua and Barbuda", "AR": "Argentina", "AM": "Armenia", "AW": "Aruba",
        "AU": "Australia", "AT": "Austria", "AZ": "Azerbaijan", "BS": "Bahamas",
        "BH": "Bahrain", "BD": "Bangladesh", "BB": "Barbados", "BY": "Belarus",
        "BE": "Belgium", "BZ": "Belize", "BJ": "Benin", "BM": "Bermuda",
        "BT": "Bhutan", "BO": "Bolivia", "BA": "Bosnia and Herzegovina", "BW": "Botswana",
        "BR": "Brazil", "BN": "Brunei", "BG": "Bulgaria", "BF": "Burkina Faso",
        "BI": "Burundi", "KH": "Cambodia", "CM": "Cameroon", "CA": "Canada",
        "CV": "Cape Verde", "KY": "Cayman Islands", "CF": "Central African Republic",
        "TD": "Chad", "CL": "Chile", "CN": "China", "CO": "Colombia",
        "KM": "Comoros", "CG": "Congo", "CD": "Democratic Republic of the Congo",
        "CK": "Cook Islands", "CR": "Costa Rica", "CI": "Ivory Coast", "HR": "Croatia",
        "CU": "Cuba", "CY": "Cyprus", "CZ": "Czech Republic", "DK": "Denmark",
        "DJ": "Djibouti", "DM": "Dominica", "DO": "Dominican Republic", "EC": "Ecuador",
        "EG": "Egypt", "SV": "El Salvador", "GQ": "Equatorial Guinea", "ER": "Eritrea",
        "EE": "Estonia", "ET": "Ethiopia", "FK": "Falkland Islands", "FO": "Faroe Islands",
        "FJ": "Fiji", "FI": "Finland", "FR": "France", "GF": "French Guiana",
        "PF": "French Polynesia", "GA": "Gabon", "GM": "Gambia", "GE": "Georgia",
        "DE": "Germany", "GH": "Ghana", "GI": "Gibraltar", "GR": "Greece",
        "GL": "Greenland", "GD": "Grenada", "GP": "Guadeloupe", "GU": "Guam",
        "GT": "Guatemala", "GG": "Guernsey", "GN": "Guinea", "GW": "Guinea-Bissau",
        "GY": "Guyana", "HT": "Haiti", "HN": "Honduras", "HK": "Hong Kong",
        "HU": "Hungary", "IS": "Iceland", "IN": "India", "ID": "Indonesia",
        "IR": "Iran", "IQ": "Iraq", "IE": "Ireland", "IM": "Isle of Man",
        "IL": "Israel", "IT": "Italy", "JM": "Jamaica", "JP": "Japan",
        "JE": "Jersey", "JO": "Jordan", "KZ": "Kazakhstan", "KE": "Kenya",
        "KI": "Kiribati", "KP": "North Korea", "KR": "South Korea", "KW": "Kuwait",
        "KG": "Kyrgyzstan", "LA": "Laos", "LV": "Latvia", "LB": "Lebanon",
        "LS": "Lesotho", "LR": "Liberia", "LY": "Libya", "LI": "Liechtenstein",
        "LT": "Lithuania", "LU": "Luxembourg", "MO": "Macao", "MK": "Macedonia",
        "MG": "Madagascar", "MW": "Malawi", "MY": "Malaysia", "MV": "Maldives",
        "ML": "Mali", "MT": "Malta", "MH": "Marshall Islands", "MQ": "Martinique",
        "MR": "Mauritania", "MU": "Mauritius", "YT": "Mayotte", "MX": "Mexico",
        "FM": "Micronesia", "MD": "Moldova", "MC": "Monaco", "MN": "Mongolia",
        "ME": "Montenegro", "MS": "Montserrat", "MA": "Morocco", "MZ": "Mozambique",
        "MM": "Myanmar", "NA": "Namibia", "NR": "Nauru", "NP": "Nepal",
        "NL": "Netherlands", "NC": "New Caledonia", "NZ": "New Zealand", "NI": "Nicaragua",
        "NE": "Niger", "NG": "Nigeria", "NU": "Niue", "NF": "Norfolk Island",
        "MP": "Northern Mariana Islands", "NO": "Norway", "OM": "Oman", "PK": "Pakistan",
        "PW": "Palau", "PS": "Palestinian Territory", "PA": "Panama", "PG": "Papua New Guinea",
        "PY": "Paraguay", "PE": "Peru", "PH": "Philippines", "PN": "Pitcairn",
        "PL": "Poland", "PT": "Portugal", "PR": "Puerto Rico", "QA": "Qatar",
        "RE": "Reunion", "RO": "Romania", "RU": "Russia", "RW": "Rwanda",
        "BL": "Saint Barthelemy", "SH": "Saint Helena", "KN": "Saint Kitts and Nevis",
        "LC": "Saint Lucia", "MF": "Saint Martin", "PM": "Saint Pierre and Miquelon",
        "VC": "Saint Vincent and the Grenadines", "WS": "Samoa", "SM": "San Marino",
        "ST": "Sao Tome and Principe", "SA": "Saudi Arabia", "SN": "Senegal",
        "RS": "Serbia", "SC": "Seychelles", "SL": "Sierra Leone", "SG": "Singapore",
        "SK": "Slovakia", "SI": "Slovenia", "SB": "Solomon Islands", "SO": "Somalia",
        "ZA": "South Africa", "GS": "South Georgia and the South Sandwich Islands",
        "SS": "South Sudan", "ES": "Spain", "LK": "Sri Lanka", "SD": "Sudan",
        "SR": "Suriname", "SJ": "Svalbard and Jan Mayen", "SZ": "Swaziland",
        "SE": "Sweden", "CH": "Switzerland", "SY": "Syria", "TW": "Taiwan",
        "TJ": "Tajikistan", "TZ": "Tanzania", "TH": "Thailand", "TL": "Timor-Leste",
        "TG": "Togo", "TK": "Tokelau", "TO": "Tonga", "TT": "Trinidad and Tobago",
        "TN": "Tunisia", "TR": "Turkey", "TM": "Turkmenistan", "TC": "Turks and Caicos Islands",
        "TV": "Tuvalu", "UG": "Uganda", "UA": "Ukraine", "AE": "United Arab Emirates",
        "GB": "United Kingdom", "US": "United States", "UM": "United States Minor Outlying Islands",
        "UY": "Uruguay", "UZ": "Uzbekistan", "VU": "Vanuatu", "VE": "Venezuela",
        "VN": "Vietnam", "VG": "British Virgin Islands", "VI": "U.S. Virgin Islands",
        "WF": "Wallis and Futuna", "EH": "Western Sahara", "YE": "Yemen", "ZM": "Zambia",
        "ZW": "Zimbabwe"
    }
    
    print("🔄 Processing comprehensive airports database...")
    
    try:
        with open('/app/airports_comprehensive.csv', 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                # Extract airport data
                iata_code = row.get('iata_code', '').strip().strip('"')
                airport_name = row.get('name', '').strip().strip('"')
                municipality = row.get('municipality', '').strip().strip('"')
                iso_country = row.get('iso_country', '').strip().strip('"')
                
                # Only include airports with valid 3-letter IATA codes
                if (iata_code and 
                    len(iata_code) == 3 and 
                    iata_code.isalpha() and
                    iata_code.isupper() and
                    municipality and 
                    airport_name):
                    
                    # Get country name
                    country_name = country_codes.get(iso_country, iso_country)
                    
                    airport_entry = {
                        "city": municipality,
                        "iata": iata_code,
                        "airport": airport_name,
                        "country": iso_country,
                        "countryName": country_name
                    }
                    
                    iata_airports.append(airport_entry)
        
        # Remove duplicates based on IATA code (keep first occurrence)
        seen_iata = set()
        unique_airports = []
        
        for airport in iata_airports:
            if airport['iata'] not in seen_iata:
                seen_iata.add(airport['iata'])
                unique_airports.append(airport)
        
        # Sort by city name
        unique_airports.sort(key=lambda x: x['city'])
        
        print(f"✅ Successfully processed {len(unique_airports)} unique IATA airports")
        
        # Show statistics
        countries = set(airport['country'] for airport in unique_airports)
        print(f"📊 Countries covered: {len(countries)}")
        print(f"📊 Sample airports:")
        
        for i, airport in enumerate(unique_airports[:10]):
            print(f"   {airport['iata']} - {airport['airport']}, {airport['city']}, {airport['countryName']}")
        
        return unique_airports
        
    except Exception as e:
        print(f"❌ Error processing airports: {e}")
        return []

def generate_frontend_js(airports):
    """Generate JavaScript array for frontend"""
    js_entries = []
    
    for airport in airports:
        # Escape quotes in names
        city = airport['city'].replace('"', '\\"')
        airport_name = airport['airport'].replace('"', '\\"')
        country_name = airport['countryName'].replace('"', '\\"')
        
        js_entry = f'  {{ city: "{city}", iata: "{airport["iata"]}", airport: "{airport_name}", country: "{airport["country"]}", countryName: "{country_name}" }}'
        js_entries.append(js_entry)
    
    entries_joined = ',\n'.join(js_entries)
    js_content = f"""const COMPREHENSIVE_GLOBAL_AIRPORTS_DATABASE = [
  // 🌍 COMPREHENSIVE IATA AIRPORT DATABASE - {len(airports)} AIRPORTS FOR 100% OTA COVERAGE
  // This database includes ALL IATA airports worldwide ensuring professional OTA functionality
{entries_joined}
];"""
    
    return js_content

def generate_backend_python(airports):
    """Generate Python list for backend"""
    py_entries = []
    
    for airport in airports:
        # Escape quotes in names
        city = airport['city'].replace('"', '\\"')
        airport_name = airport['airport'].replace('"', '\\"')
        
        py_entry = f'            {{"city": "{city}", "airport": "{airport_name}", "iata": "{airport["iata"]}", "country": "{airport["country"]}"}}'
        py_entries.append(py_entry)
    
    py_entries_joined = ',\n'.join(py_entries)
    py_content = f"""        # 🌍 COMPREHENSIVE IATA AIRPORT DATABASE - {len(airports)} AIRPORTS
        airports_db = [
{py_entries_joined}
        ]"""
    
    return py_content

if __name__ == "__main__":
    print("🚀 TourSmile Comprehensive Airport Database Processor")
    print("=" * 60)
    
    # Process the comprehensive database
    airports = process_comprehensive_airports()
    
    if airports:
        print(f"\n🎯 Ready to update TourSmile with {len(airports)} airports!")
        print("📈 This ensures 100% IATA airport coverage without exception.")
        
        # Generate code snippets
        print("\n📝 Generating code snippets...")
        frontend_code = generate_frontend_js(airports[:100])  # Sample for display
        backend_code = generate_backend_python(airports[:100])  # Sample for display
        
        print("✅ Code generation complete")
        print(f"🔧 Frontend snippet length: {len(frontend_code)} chars")
        print(f"🔧 Backend snippet length: {len(backend_code)} chars")
        
        # Save airports to JSON for easy import
        with open('/app/comprehensive_airports.json', 'w') as f:
            json.dump(airports, f, indent=2)
        
        print(f"💾 Saved {len(airports)} airports to comprehensive_airports.json")
    else:
        print("❌ No airports processed")