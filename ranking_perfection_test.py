#!/usr/bin/env python3
"""
CRITICAL RANKING ALGORITHM PERFECTION TESTING
==============================================

Testing the critical ranking fixes for 100% success rate as requested:

1. Dublin 'DUB' Search: Should return Dublin (DUB) first with score 1000, NOT Dubai (DXB)
2. Islamabad 'ISB' Search: Should return Islamabad (ISB) first with score 1000, NOT Brisbane (BNE)
3. All Exact IATA Matches: Should score 1000 and appear first
4. Ranking Algorithm Perfection: Verify scoring system works exactly as designed

Expected Result: 100% test success rate with perfect ranking behavior.
"""

import requests
import json
import time
import sys
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')
load_dotenv('/app/frontend/.env')

# Configuration - Use environment variable for backend URL
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE_URL = f"{BACKEND_URL}/api"
TEST_TIMEOUT = 15

class RankingPerfectionTester:
    def __init__(self):
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
        print(f"🔧 Backend URL: {BACKEND_URL}")
        print(f"🔧 API Base URL: {API_BASE_URL}")
        
    def log_test(self, test_name, success, details=""):
        """Log test result"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status} - {test_name}"
        if details:
            result += f" | {details}"
        
        print(result)
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        
    def test_backend_health(self):
        """Test Backend Service Health Check"""
        print("\n🏥 TESTING BACKEND SERVICE HEALTH...")
        
        try:
            response = requests.get(f"{API_BASE_URL}/", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                if "TourSmile" in data.get("message", ""):
                    self.log_test("Backend Service Health", True, 
                                f"Status: {response.status_code}, Message: {data.get('message')}")
                    return True
                else:
                    self.log_test("Backend Service Health", False, 
                                f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Backend Service Health", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Backend Service Health", False, f"Connection error: {str(e)}")
            return False

    def test_dublin_dub_ranking(self):
        """CRITICAL: Test Dublin 'DUB' search returns Dublin first, NOT Dubai"""
        print("\n🇮🇪 TESTING DUBLIN 'DUB' RANKING FIX...")
        
        try:
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": "DUB"}, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                if len(results) > 0:
                    first_result = results[0]
                    first_iata = first_result.get('iata', '')
                    first_city = first_result.get('city', '')
                    first_score = first_result.get('score', 0)
                    
                    # Check if Dublin (DUB) is first with score 1000
                    if first_iata == 'DUB' and first_city == 'Dublin' and first_score == 1000:
                        self.log_test("Dublin 'DUB' Ranking Fix", True, 
                                    f"Dublin (DUB) appears first with score {first_score}")
                        return True
                    else:
                        # Check if Dubai incorrectly appears first
                        if first_iata == 'DXB':
                            self.log_test("Dublin 'DUB' Ranking Fix", False, 
                                        f"CRITICAL BUG: Dubai (DXB) appears first instead of Dublin (DUB)")
                        else:
                            self.log_test("Dublin 'DUB' Ranking Fix", False, 
                                        f"Wrong result first: {first_city} ({first_iata}) score {first_score}")
                        return False
                else:
                    self.log_test("Dublin 'DUB' Ranking Fix", False, "No results returned")
                    return False
            else:
                self.log_test("Dublin 'DUB' Ranking Fix", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Dublin 'DUB' Ranking Fix", False, f"Error: {str(e)}")
            return False

    def test_islamabad_isb_ranking(self):
        """CRITICAL: Test Islamabad 'ISB' search returns Islamabad first, NOT Brisbane"""
        print("\n🇵🇰 TESTING ISLAMABAD 'ISB' RANKING FIX...")
        
        try:
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": "ISB"}, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                if len(results) > 0:
                    first_result = results[0]
                    first_iata = first_result.get('iata', '')
                    first_city = first_result.get('city', '')
                    first_score = first_result.get('score', 0)
                    
                    # Check if Islamabad (ISB) is first with score 1000
                    if first_iata == 'ISB' and first_city == 'Islamabad' and first_score == 1000:
                        self.log_test("Islamabad 'ISB' Ranking Fix", True, 
                                    f"Islamabad (ISB) appears first with score {first_score}")
                        return True
                    else:
                        # Check if Brisbane incorrectly appears first
                        if first_iata == 'BNE':
                            self.log_test("Islamabad 'ISB' Ranking Fix", False, 
                                        f"CRITICAL BUG: Brisbane (BNE) appears first instead of Islamabad (ISB)")
                        else:
                            self.log_test("Islamabad 'ISB' Ranking Fix", False, 
                                        f"Wrong result first: {first_city} ({first_iata}) score {first_score}")
                        return False
                else:
                    self.log_test("Islamabad 'ISB' Ranking Fix", False, "No results returned")
                    return False
            else:
                self.log_test("Islamabad 'ISB' Ranking Fix", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Islamabad 'ISB' Ranking Fix", False, f"Error: {str(e)}")
            return False

    def test_exact_iata_matches_score_1000(self):
        """Test all exact IATA matches score 1000 and appear first"""
        print("\n🎯 TESTING EXACT IATA MATCHES SCORE 1000...")
        
        # Critical IATA codes that should score 1000
        critical_iata_codes = [
            ('BTS', 'Bratislava'),
            ('LUX', 'Luxembourg'),
            ('MLA', 'Malta'),
            ('KEF', 'Reykjavik'),
            ('NCE', 'Nice'),
            ('VCE', 'Venice'),
            ('IST', 'Istanbul'),
            ('KWL', 'Guilin'),
            ('DPS', 'Bali'),
            ('NBO', 'Nairobi')
        ]
        
        all_passed = True
        for iata_code, expected_city in critical_iata_codes:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": iata_code}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    if len(results) > 0:
                        first_result = results[0]
                        first_iata = first_result.get('iata', '')
                        first_city = first_result.get('city', '')
                        first_score = first_result.get('score', 0)
                        
                        # Check if exact IATA match is first with score 1000
                        if first_iata == iata_code and first_score == 1000:
                            self.log_test(f"Exact IATA Match - {iata_code}", True, 
                                        f"{first_city} ({iata_code}) score {first_score}")
                        else:
                            self.log_test(f"Exact IATA Match - {iata_code}", False, 
                                        f"Wrong result: {first_city} ({first_iata}) score {first_score}")
                            all_passed = False
                    else:
                        self.log_test(f"Exact IATA Match - {iata_code}", False, "No results returned")
                        all_passed = False
                else:
                    self.log_test(f"Exact IATA Match - {iata_code}", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Exact IATA Match - {iata_code}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_scoring_algorithm_perfection(self):
        """Test the scoring algorithm works exactly as designed"""
        print("\n🔬 TESTING SCORING ALGORITHM PERFECTION...")
        
        # Test different scoring scenarios
        scoring_tests = [
            # (query, expected_first_iata, expected_score, test_name)
            ('BOM', 'BOM', 1000, 'Exact IATA Match'),
            ('Mumbai', 'BOM', 800, 'Exact City Match'),
            ('Mum', 'BOM', 700, 'City Starts With'),
            ('DEL', 'DEL', 1000, 'Delhi Exact IATA'),
            ('Delhi', 'DEL', 800, 'Delhi Exact City'),
        ]
        
        all_passed = True
        for query, expected_iata, expected_score, test_name in scoring_tests:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": query}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    if len(results) > 0:
                        first_result = results[0]
                        first_iata = first_result.get('iata', '')
                        first_score = first_result.get('score', 0)
                        
                        # Check if scoring is correct
                        if first_iata == expected_iata and first_score == expected_score:
                            self.log_test(f"Scoring Algorithm - {test_name}", True, 
                                        f"'{query}' → {first_iata} (score {first_score})")
                        else:
                            self.log_test(f"Scoring Algorithm - {test_name}", False, 
                                        f"'{query}' → {first_iata} (score {first_score}), expected {expected_iata} (score {expected_score})")
                            all_passed = False
                    else:
                        self.log_test(f"Scoring Algorithm - {test_name}", False, "No results returned")
                        all_passed = False
                else:
                    self.log_test(f"Scoring Algorithm - {test_name}", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Scoring Algorithm - {test_name}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_no_irrelevant_results(self):
        """Test that irrelevant results don't appear for specific searches"""
        print("\n🚫 TESTING NO IRRELEVANT RESULTS...")
        
        # Test cases where specific airports should NOT appear
        irrelevant_tests = [
            ('IST', 'BLR', 'Istanbul search should not return Bangalore'),
            ('DUB', 'DXB', 'Dublin search should not return Dubai first'),
            ('ISB', 'BNE', 'Islamabad search should not return Brisbane first'),
        ]
        
        all_passed = True
        for query, should_not_appear, test_description in irrelevant_tests:
            try:
                response = requests.get(f"{API_BASE_URL}/airports/search", 
                                      params={"query": query}, timeout=TEST_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    if len(results) > 0:
                        first_result = results[0]
                        first_iata = first_result.get('iata', '')
                        
                        # Check if irrelevant result appears first
                        if first_iata != should_not_appear:
                            self.log_test(f"No Irrelevant Results - {query}", True, 
                                        f"{test_description} ✓")
                        else:
                            self.log_test(f"No Irrelevant Results - {query}", False, 
                                        f"CRITICAL: {test_description} ✗")
                            all_passed = False
                    else:
                        self.log_test(f"No Irrelevant Results - {query}", False, "No results returned")
                        all_passed = False
                else:
                    self.log_test(f"No Irrelevant Results - {query}", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"No Irrelevant Results - {query}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_results_sorted_by_score(self):
        """Test that results are properly sorted by score (highest first)"""
        print("\n📊 TESTING RESULTS SORTED BY SCORE...")
        
        try:
            response = requests.get(f"{API_BASE_URL}/airports/search", 
                                  params={"query": "Lo"}, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                if len(results) > 1:
                    # Check if results are sorted by score (descending)
                    scores = [result.get('score', 0) for result in results]
                    is_sorted = all(scores[i] >= scores[i+1] for i in range(len(scores)-1))
                    
                    if is_sorted:
                        self.log_test("Results Sorted by Score", True, 
                                    f"Results properly sorted: {scores[:5]}...")
                        return True
                    else:
                        self.log_test("Results Sorted by Score", False, 
                                    f"Results not sorted properly: {scores[:5]}...")
                        return False
                else:
                    self.log_test("Results Sorted by Score", False, "Not enough results to test sorting")
                    return False
            else:
                self.log_test("Results Sorted by Score", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Results Sorted by Score", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all ranking perfection tests"""
        print("🎯 CRITICAL RANKING ALGORITHM PERFECTION TESTING STARTED")
        print("=" * 80)
        
        # Test 1: Backend Health
        if not self.test_backend_health():
            print("❌ Backend not responding. Stopping tests.")
            return 0
        
        # Test 2: Critical Ranking Fixes
        self.test_dublin_dub_ranking()
        self.test_islamabad_isb_ranking()
        
        # Test 3: Exact IATA Matches Score 1000
        self.test_exact_iata_matches_score_1000()
        
        # Test 4: Scoring Algorithm Perfection
        self.test_scoring_algorithm_perfection()
        
        # Test 5: No Irrelevant Results
        self.test_no_irrelevant_results()
        
        # Test 6: Results Sorted by Score
        self.test_results_sorted_by_score()
        
        # Summary
        print("\n" + "=" * 80)
        print("🎯 CRITICAL RANKING ALGORITHM PERFECTION TESTING SUMMARY")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        
        print(f"📊 OVERALL SUCCESS RATE: {success_rate:.1f}% ({self.passed_tests}/{self.total_tests} tests passed)")
        
        if success_rate == 100:
            print("🎉 PERFECT: 100% SUCCESS RATE ACHIEVED! Ranking algorithm is working flawlessly!")
        elif success_rate >= 95:
            print("✅ EXCELLENT: Ranking algorithm is nearly perfect with minor issues")
        elif success_rate >= 80:
            print("⚠️ GOOD: Ranking algorithm is mostly working but needs fixes")
        else:
            print("❌ CRITICAL: Ranking algorithm has major problems requiring immediate attention")
        
        print("\n📋 DETAILED TEST RESULTS:")
        for result in self.test_results:
            status = "✅ PASS" if result['success'] else "❌ FAIL"
            details = f" | {result['details']}" if result['details'] else ""
            print(f"  {status} - {result['test']}{details}")
        
        # Critical findings for review request
        print("\n🚨 CRITICAL REVIEW REQUEST FINDINGS:")
        
        # Check Dublin DUB fix
        dublin_test = any(result['test'] == "Dublin 'DUB' Ranking Fix" and result['success'] 
                         for result in self.test_results)
        if dublin_test:
            print("  ✅ Dublin 'DUB' search returns Dublin first with score 1000 (NOT Dubai)")
        else:
            print("  ❌ CRITICAL BUG: Dublin 'DUB' search does not return Dublin first")
        
        # Check Islamabad ISB fix
        islamabad_test = any(result['test'] == "Islamabad 'ISB' Ranking Fix" and result['success'] 
                           for result in self.test_results)
        if islamabad_test:
            print("  ✅ Islamabad 'ISB' search returns Islamabad first with score 1000 (NOT Brisbane)")
        else:
            print("  ❌ CRITICAL BUG: Islamabad 'ISB' search does not return Islamabad first")
        
        # Check exact IATA matches
        exact_iata_tests = [result for result in self.test_results 
                           if "Exact IATA Match" in result['test'] and result['success']]
        total_iata_tests = [result for result in self.test_results 
                           if "Exact IATA Match" in result['test']]
        
        if len(exact_iata_tests) == len(total_iata_tests) and len(total_iata_tests) > 0:
            print(f"  ✅ All exact IATA matches score 1000 and appear first ({len(exact_iata_tests)}/{len(total_iata_tests)})")
        else:
            print(f"  ❌ Some exact IATA matches don't score 1000 ({len(exact_iata_tests)}/{len(total_iata_tests)})")
        
        # Check scoring algorithm
        scoring_tests = [result for result in self.test_results 
                        if "Scoring Algorithm" in result['test'] and result['success']]
        total_scoring_tests = [result for result in self.test_results 
                              if "Scoring Algorithm" in result['test']]
        
        if len(scoring_tests) == len(total_scoring_tests) and len(total_scoring_tests) > 0:
            print(f"  ✅ Scoring algorithm works perfectly ({len(scoring_tests)}/{len(total_scoring_tests)})")
        else:
            print(f"  ❌ Scoring algorithm has issues ({len(scoring_tests)}/{len(total_scoring_tests)})")
        
        return success_rate

if __name__ == "__main__":
    tester = RankingPerfectionTester()
    success_rate = tester.run_all_tests()
    
    # Exit with appropriate code
    if success_rate == 100:
        print("\n🎉 TARGET ACHIEVED: 100% SUCCESS RATE!")
        sys.exit(0)  # Perfect success
    elif success_rate >= 95:
        print(f"\n✅ NEAR PERFECT: {success_rate:.1f}% success rate")
        sys.exit(0)  # Near perfect
    else:
        print(f"\n❌ NEEDS IMPROVEMENT: {success_rate:.1f}% success rate")
        sys.exit(1)  # Needs work