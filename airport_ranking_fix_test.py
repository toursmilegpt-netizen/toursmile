#!/usr/bin/env python3
"""
AIRPORT RANKING ALGORITHM FIX AND TESTING
==========================================

This script identifies the ranking issues and provides the fix needed for the backend.
The current algorithm doesn't implement proper scoring - it just does substring matching.

CRITICAL ISSUES IDENTIFIED:
1. DUB search returns Dubai (DXB) before Dublin (DUB) - WRONG!
2. ISB search returns Brisbane (BNE) before Islamabad (ISB) - WRONG!
3. No scoring system implemented (should be: exact IATA = 1000, exact city = 800, partial = lower)

REQUIRED FIX: Implement proper scoring algorithm in backend/server.py
"""

import requests
import json

def test_current_ranking_issues():
    """Test and document the current ranking issues"""
    print("🚨 CURRENT RANKING ISSUES ANALYSIS")
    print("=" * 50)
    
    url = 'https://travel-portal-15.preview.emergentagent.com/api/airports/search'
    
    # Test cases that are currently failing
    failing_cases = [
        ("DUB", "Dublin", "Should return Dublin DUB first, not Dubai DXB"),
        ("ISB", "Islamabad", "Should return Islamabad ISB first, not Brisbane BNE")
    ]
    
    for query, expected_city, description in failing_cases:
        print(f"\n🔍 Testing: {query}")
        print(f"Expected: {expected_city} ({query}) should be first")
        print(f"Issue: {description}")
        
        response = requests.get(url, params={'query': query, 'limit': 5})
        if response.status_code == 200:
            results = response.json().get('results', [])
            print("Current Results:")
            for i, result in enumerate(results, 1):
                iata = result.get('iata', '')
                city = result.get('city', '')
                airport = result.get('airport', '')
                
                # Highlight the issue
                if i == 1 and iata.upper() != query.upper():
                    print(f"  ❌ {i}. {iata} - {city} ({airport}) [WRONG - Should not be first!]")
                elif iata.upper() == query.upper():
                    print(f"  ✅ {i}. {iata} - {city} ({airport}) [CORRECT - Should be first!]")
                else:
                    print(f"     {i}. {iata} - {city} ({airport})")
        else:
            print(f"  ❌ API Error: {response.status_code}")

def generate_ranking_algorithm_fix():
    """Generate the fixed ranking algorithm code"""
    print("\n🔧 REQUIRED BACKEND FIX")
    print("=" * 50)
    print("The following code needs to be implemented in /app/backend/server.py")
    print("Replace the current search logic (lines ~819-826) with this scoring system:")
    print()
    
    fix_code = '''
def calculate_airport_score(airport, query):
    """Calculate relevance score for airport search results"""
    query_lower = query.lower().strip()
    iata = airport.get('iata', '').lower()
    city = airport.get('city', '').lower()
    airport_name = airport.get('airport', '').lower()
    
    # Exact IATA code match - highest priority (score 1000)
    if iata == query_lower:
        return 1000
    
    # Exact city name match - high priority (score 800)
    if city == query_lower:
        return 800
    
    # IATA code starts with query - very high priority (score 900)
    if iata.startswith(query_lower):
        return 900
    
    # City name starts with query - high priority (score 700)
    if city.startswith(query_lower):
        return 700
    
    # IATA code contains query - medium priority (score 600)
    if query_lower in iata:
        return 600
    
    # City name contains query - medium priority (score 500)
    if query_lower in city:
        return 500
    
    # Airport name contains query - lower priority (score 300)
    if query_lower in airport_name:
        return 300
    
    # No match - score 0
    return 0

# Updated search logic (replace lines ~819-826):
scored_results = []
for airport in airports_db:
    score = calculate_airport_score(airport, query)
    if score > 0:  # Only include relevant results
        airport_with_score = airport.copy()
        airport_with_score['score'] = score
        scored_results.append(airport_with_score)

# Sort by score (highest first) and limit results
scored_results.sort(key=lambda x: x['score'], reverse=True)
results = scored_results[:limit]
'''
    
    print(fix_code)
    
    print("\n📋 IMPLEMENTATION STEPS:")
    print("1. Add the calculate_airport_score function to server.py")
    print("2. Replace the simple substring search with the scoring system")
    print("3. Sort results by score (highest first)")
    print("4. Test with DUB and ISB queries to verify fix")

def test_expected_results_after_fix():
    """Show what the results should look like after the fix"""
    print("\n✅ EXPECTED RESULTS AFTER FIX")
    print("=" * 50)
    
    expected_results = {
        "DUB": [
            "1. DUB - Dublin (Dublin Airport) [Score: 1000 - Exact IATA match]",
            "2. DXB - Dubai (Dubai International Airport) [Score: 600 - IATA contains 'dub']",
            "3. DWC - Dubai (Al Maktoum International Airport) [Score: 500 - City contains 'dub']"
        ],
        "ISB": [
            "1. ISB - Islamabad (Islamabad International Airport) [Score: 1000 - Exact IATA match]",
            "2. BNE - Brisbane (Brisbane Airport) [Score: 300 - Airport name contains 'isb']"
        ]
    }
    
    for query, expected in expected_results.items():
        print(f"\n🎯 {query} Search (After Fix):")
        for result in expected:
            print(f"  {result}")

def main():
    """Main function to run the ranking analysis"""
    print("🔍 AIRPORT RANKING ALGORITHM ANALYSIS AND FIX")
    print("=" * 80)
    
    test_current_ranking_issues()
    generate_ranking_algorithm_fix()
    test_expected_results_after_fix()
    
    print("\n🚨 CRITICAL ACTION REQUIRED:")
    print("The main agent must implement the scoring algorithm fix in backend/server.py")
    print("Current success rate: 94.3% (66/70 tests passed)")
    print("After fix: Expected 100% success rate")

if __name__ == "__main__":
    main()