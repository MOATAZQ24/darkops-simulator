#!/usr/bin/env python3
"""
DarkOps Lab Backend API Testing Suite
Tests all backend endpoints for the cybersecurity attack simulator
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://darkops-lab.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class DarkOpsLabTester:
    def __init__(self):
        self.session_id = None
        self.test_results = []
        self.failed_tests = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        
        if not success:
            self.failed_tests.append(test_name)
    
    def test_session_management(self):
        """Test session creation and retrieval endpoints"""
        print("\n=== Testing Session Management ===")
        
        # Test 1: Create session without nickname
        try:
            response = requests.post(f"{API_BASE}/sessions", json={})
            if response.status_code == 200:
                session_data = response.json()
                self.session_id = session_data['id']
                self.log_test("Create session without nickname", True, 
                            f"Session ID: {self.session_id}")
            else:
                self.log_test("Create session without nickname", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create session without nickname", False, f"Exception: {str(e)}")
            return False
        
        # Test 2: Create session with nickname
        try:
            response = requests.post(f"{API_BASE}/sessions", json={"nickname": "CyberNinja"})
            if response.status_code == 200:
                session_data = response.json()
                nickname_session_id = session_data['id']
                if session_data.get('nickname') == 'CyberNinja':
                    self.log_test("Create session with nickname", True, 
                                f"Session ID: {nickname_session_id}, Nickname: {session_data['nickname']}")
                else:
                    self.log_test("Create session with nickname", False, 
                                "Nickname not properly stored")
            else:
                self.log_test("Create session with nickname", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Create session with nickname", False, f"Exception: {str(e)}")
        
        # Test 3: Retrieve session and verify last_active updates
        if self.session_id:
            try:
                # Get initial last_active time
                response1 = requests.get(f"{API_BASE}/sessions/{self.session_id}")
                if response1.status_code == 200:
                    initial_data = response1.json()
                    initial_last_active = initial_data['last_active']
                    
                    # Wait a moment and get again to verify last_active updates
                    time.sleep(1)
                    response2 = requests.get(f"{API_BASE}/sessions/{self.session_id}")
                    if response2.status_code == 200:
                        updated_data = response2.json()
                        updated_last_active = updated_data['last_active']
                        
                        if updated_last_active != initial_last_active:
                            self.log_test("Session retrieval and last_active update", True,
                                        f"last_active updated from {initial_last_active} to {updated_last_active}")
                        else:
                            self.log_test("Session retrieval and last_active update", False,
                                        "last_active was not updated on retrieval")
                    else:
                        self.log_test("Session retrieval and last_active update", False,
                                    f"Second retrieval failed: {response2.status_code}")
                else:
                    self.log_test("Session retrieval and last_active update", False,
                                f"Initial retrieval failed: {response1.status_code}")
            except Exception as e:
                self.log_test("Session retrieval and last_active update", False, f"Exception: {str(e)}")
        
        # Test 4: Test non-existent session
        try:
            response = requests.get(f"{API_BASE}/sessions/non-existent-id")
            if response.status_code == 404:
                self.log_test("Non-existent session error handling", True, 
                            "Correctly returned 404 for non-existent session")
            else:
                self.log_test("Non-existent session error handling", False,
                            f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Non-existent session error handling", False, f"Exception: {str(e)}")
        
        return True
    
    def test_attack_data_endpoints(self):
        """Test attack data retrieval endpoints"""
        print("\n=== Testing Attack Data Endpoints ===")
        
        # Test 1: Get all attacks
        try:
            response = requests.get(f"{API_BASE}/attacks")
            if response.status_code == 200:
                attacks = response.json()
                if isinstance(attacks, list) and len(attacks) > 0:
                    attack_ids = [attack['id'] for attack in attacks]
                    self.log_test("Get all attacks", True, 
                                f"Retrieved {len(attacks)} attacks: {attack_ids}")
                else:
                    self.log_test("Get all attacks", False, "No attacks returned or invalid format")
                    return False
            else:
                self.log_test("Get all attacks", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get all attacks", False, f"Exception: {str(e)}")
            return False
        
        # Test 2: Get specific attacks
        test_attack_ids = ['ddos_attack', 'ransomware_attack', 'mitm_attack', 'sql_injection']
        
        for attack_id in test_attack_ids:
            try:
                response = requests.get(f"{API_BASE}/attacks/{attack_id}")
                if response.status_code == 200:
                    attack_data = response.json()
                    if attack_data.get('id') == attack_id:
                        self.log_test(f"Get attack: {attack_id}", True,
                                    f"Name: {attack_data.get('name')}, Category: {attack_data.get('category')}")
                    else:
                        self.log_test(f"Get attack: {attack_id}", False,
                                    "Attack ID mismatch in response")
                else:
                    self.log_test(f"Get attack: {attack_id}", False,
                                f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_test(f"Get attack: {attack_id}", False, f"Exception: {str(e)}")
        
        # Test 3: Test non-existent attack
        try:
            response = requests.get(f"{API_BASE}/attacks/non-existent-attack")
            if response.status_code == 404:
                self.log_test("Non-existent attack error handling", True,
                            "Correctly returned 404 for non-existent attack")
            else:
                self.log_test("Non-existent attack error handling", False,
                            f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Non-existent attack error handling", False, f"Exception: {str(e)}")
        
        return True
    
    def test_progress_tracking(self):
        """Test progress tracking endpoints"""
        print("\n=== Testing Progress Tracking ===")
        
        if not self.session_id:
            self.log_test("Progress tracking setup", False, "No session ID available")
            return False
        
        # Test 1: Create new progress
        try:
            progress_data = {
                "session_id": self.session_id,
                "attack_id": "ddos_attack",
                "current_step": 1,
                "time_spent": 120
            }
            
            response = requests.post(f"{API_BASE}/progress", json=progress_data)
            if response.status_code == 200:
                progress_result = response.json()
                if progress_result.get('session_id') == self.session_id:
                    self.log_test("Create new progress", True,
                                f"Progress ID: {progress_result.get('id')}, Step: {progress_result.get('current_step')}")
                else:
                    self.log_test("Create new progress", False, "Session ID mismatch in progress")
            else:
                self.log_test("Create new progress", False,
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Create new progress", False, f"Exception: {str(e)}")
        
        # Test 2: Update existing progress
        try:
            update_data = {
                "session_id": self.session_id,
                "attack_id": "ddos_attack",
                "current_step": 3,
                "time_spent": 300
            }
            
            response = requests.post(f"{API_BASE}/progress", json=update_data)
            if response.status_code == 200:
                progress_result = response.json()
                if progress_result.get('current_step') == 3:
                    self.log_test("Update existing progress", True,
                                f"Updated to step: {progress_result.get('current_step')}, Time: {progress_result.get('time_spent')}")
                else:
                    self.log_test("Update existing progress", False, "Progress not properly updated")
            else:
                self.log_test("Update existing progress", False,
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Update existing progress", False, f"Exception: {str(e)}")
        
        # Test 3: Complete attack (step 4 of 4 for ddos_attack)
        try:
            complete_data = {
                "session_id": self.session_id,
                "attack_id": "ddos_attack",
                "current_step": 4,
                "time_spent": 450
            }
            
            response = requests.post(f"{API_BASE}/progress", json=complete_data)
            if response.status_code == 200:
                progress_result = response.json()
                if progress_result.get('is_completed'):
                    self.log_test("Complete attack progress", True,
                                f"Attack completed: {progress_result.get('is_completed')}, Completed at: {progress_result.get('completed_at')}")
                else:
                    self.log_test("Complete attack progress", False, "Attack not marked as completed")
            else:
                self.log_test("Complete attack progress", False,
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Complete attack progress", False, f"Exception: {str(e)}")
        
        # Test 4: Get user progress
        try:
            response = requests.get(f"{API_BASE}/progress/{self.session_id}")
            if response.status_code == 200:
                progress_list = response.json()
                if isinstance(progress_list, list) and len(progress_list) > 0:
                    self.log_test("Get user progress", True,
                                f"Retrieved {len(progress_list)} progress records")
                else:
                    self.log_test("Get user progress", False, "No progress records found")
            else:
                self.log_test("Get user progress", False,
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Get user progress", False, f"Exception: {str(e)}")
        
        return True
    
    def test_quiz_management(self):
        """Test quiz management endpoints"""
        print("\n=== Testing Quiz Management ===")
        
        if not self.session_id:
            self.log_test("Quiz management setup", False, "No session ID available")
            return False
        
        # Test 1: Submit quiz with correct answers
        try:
            quiz_data = {
                "session_id": self.session_id,
                "attack_id": "ddos_attack",
                "answers": [
                    {"question_id": "q1", "selected_answer": 1},  # Correct answer
                    {"question_id": "q2", "selected_answer": 2}   # Correct answer
                ]
            }
            
            response = requests.post(f"{API_BASE}/quiz/submit", json=quiz_data)
            if response.status_code == 200:
                quiz_result = response.json()
                if quiz_result.get('score') == 2 and quiz_result.get('total_questions') == 2:
                    self.log_test("Submit quiz with correct answers", True,
                                f"Score: {quiz_result.get('score')}/{quiz_result.get('total_questions')}")
                else:
                    self.log_test("Submit quiz with correct answers", False,
                                f"Unexpected score: {quiz_result.get('score')}/{quiz_result.get('total_questions')}")
            else:
                self.log_test("Submit quiz with correct answers", False,
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Submit quiz with correct answers", False, f"Exception: {str(e)}")
        
        # Test 2: Submit quiz with mixed answers
        try:
            quiz_data = {
                "session_id": self.session_id,
                "attack_id": "ransomware_attack",
                "answers": [
                    {"question_id": "q1", "selected_answer": 2}  # Correct answer for ransomware
                ]
            }
            
            response = requests.post(f"{API_BASE}/quiz/submit", json=quiz_data)
            if response.status_code == 200:
                quiz_result = response.json()
                if quiz_result.get('score') == 1 and quiz_result.get('total_questions') == 1:
                    self.log_test("Submit quiz for ransomware attack", True,
                                f"Score: {quiz_result.get('score')}/{quiz_result.get('total_questions')}")
                else:
                    self.log_test("Submit quiz for ransomware attack", False,
                                f"Unexpected score: {quiz_result.get('score')}/{quiz_result.get('total_questions')}")
            else:
                self.log_test("Submit quiz for ransomware attack", False,
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Submit quiz for ransomware attack", False, f"Exception: {str(e)}")
        
        # Test 3: Submit quiz with incorrect answers
        try:
            quiz_data = {
                "session_id": self.session_id,
                "attack_id": "mitm_attack",
                "answers": [
                    {"question_id": "q1", "selected_answer": 0}  # Incorrect answer (correct is 2)
                ]
            }
            
            response = requests.post(f"{API_BASE}/quiz/submit", json=quiz_data)
            if response.status_code == 200:
                quiz_result = response.json()
                if quiz_result.get('score') == 0 and quiz_result.get('total_questions') == 1:
                    self.log_test("Submit quiz with incorrect answers", True,
                                f"Score: {quiz_result.get('score')}/{quiz_result.get('total_questions')}")
                else:
                    self.log_test("Submit quiz with incorrect answers", False,
                                f"Unexpected score: {quiz_result.get('score')}/{quiz_result.get('total_questions')}")
            else:
                self.log_test("Submit quiz with incorrect answers", False,
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Submit quiz with incorrect answers", False, f"Exception: {str(e)}")
        
        # Test 4: Get quiz scores
        try:
            response = requests.get(f"{API_BASE}/quiz/scores/{self.session_id}")
            if response.status_code == 200:
                scores = response.json()
                if isinstance(scores, list) and len(scores) > 0:
                    total_score = sum(score.get('score', 0) for score in scores)
                    self.log_test("Get quiz scores", True,
                                f"Retrieved {len(scores)} quiz scores, Total score: {total_score}")
                else:
                    self.log_test("Get quiz scores", False, "No quiz scores found")
            else:
                self.log_test("Get quiz scores", False,
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Get quiz scores", False, f"Exception: {str(e)}")
        
        # Test 5: Test quiz for non-existent attack
        try:
            quiz_data = {
                "session_id": self.session_id,
                "attack_id": "non-existent-attack",
                "answers": [{"question_id": "q1", "selected_answer": 0}]
            }
            
            response = requests.post(f"{API_BASE}/quiz/submit", json=quiz_data)
            if response.status_code == 404:
                self.log_test("Quiz for non-existent attack error handling", True,
                            "Correctly returned 404 for non-existent attack")
            else:
                self.log_test("Quiz for non-existent attack error handling", False,
                            f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Quiz for non-existent attack error handling", False, f"Exception: {str(e)}")
        
        return True
    
    def test_session_stats_updates(self):
        """Test that session stats are properly updated"""
        print("\n=== Testing Session Stats Updates ===")
        
        if not self.session_id:
            self.log_test("Session stats test setup", False, "No session ID available")
            return False
        
        try:
            response = requests.get(f"{API_BASE}/sessions/{self.session_id}")
            if response.status_code == 200:
                session_data = response.json()
                attacks_completed = session_data.get('total_attacks_completed', 0)
                quiz_score = session_data.get('total_quiz_score', 0)
                
                if attacks_completed > 0:
                    self.log_test("Session attack completion tracking", True,
                                f"Total attacks completed: {attacks_completed}")
                else:
                    self.log_test("Session attack completion tracking", False,
                                "No attacks marked as completed in session")
                
                if quiz_score > 0:
                    self.log_test("Session quiz score tracking", True,
                                f"Total quiz score: {quiz_score}")
                else:
                    self.log_test("Session quiz score tracking", False,
                                "No quiz scores accumulated in session")
            else:
                self.log_test("Session stats verification", False,
                            f"Could not retrieve session: {response.status_code}")
        except Exception as e:
            self.log_test("Session stats verification", False, f"Exception: {str(e)}")
        
        return True
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting DarkOps Lab Backend API Tests")
        print(f"📡 Backend URL: {BACKEND_URL}")
        print(f"🔗 API Base: {API_BASE}")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run all test suites
        self.test_session_management()
        self.test_attack_data_endpoints()
        self.test_progress_tracking()
        self.test_quiz_management()
        self.test_session_stats_updates()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Print summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['success']])
        failed_tests = len(self.failed_tests)
        
        print(f"📊 Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"⏱️  Duration: {duration:.2f} seconds")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"   - {test}")
        
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        print(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🎉 Excellent! Backend is working well.")
        elif success_rate >= 70:
            print("⚠️  Good, but some issues need attention.")
        else:
            print("🚨 Critical issues found. Backend needs fixes.")
        
        return success_rate >= 70

if __name__ == "__main__":
    tester = DarkOpsLabTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)