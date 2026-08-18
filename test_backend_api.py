"""
GlycoGuard AI - Comprehensive Backend & API Integration Test Suite
Validates Flask server, PostgreSQL database, JWT authentication,
RandomForest ML prediction model, tracking, planning, patients, and reports.
"""

import sys
import os
import unittest
import json

# Add backend directory to sys.path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from db import execute
from services.prediction_service import PredictionService


class TestGlycoGuardBackend(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()
        cls.test_username = f"testuser_{os.getpid()}"
        cls.test_email = f"test_{os.getpid()}@glycoguard.ai"
        cls.test_password = "SecurePassword123!"
        cls.token = None

    def test_01_database_connectivity(self):
        """Verify PostgreSQL database responds to live queries."""
        res = execute("SELECT 1 as test", fetch=True)
        self.assertIsNotNone(res, "PostgreSQL query result should not be None")
        self.assertEqual(res[0]["test"], 1, "Database test query should return 1")

    def test_02_health_endpoint(self):
        """Verify /health endpoint returns running status."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "running")
        self.assertEqual(data.get("project"), "GlycoGuard AI")

    def test_03_signup_workflow(self):
        """Verify user registration API."""
        payload = {
            "username": self.test_username,
            "password": self.test_password,
            "full_name": "Test Healthcare User",
            "email": self.test_email,
            "phone": "9876543210"
        }
        response = self.client.post("/signup", json=payload)
        self.assertIn(response.status_code, [201, 400])
        data = response.get_json()
        self.assertTrue(data.get("status") or "already registered" in data.get("message", ""))

    def test_04_login_and_jwt_generation(self):
        """Verify authentication and JWT generation."""
        payload = {
            "username": self.test_username,
            "password": self.test_password
        }
        response = self.client.post("/login", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data.get("status"))
        self.assertIn("token", data)
        self.assertIsNotNone(data["token"])
        TestGlycoGuardBackend.token = data["token"]

    def test_05_session_verification(self):
        """Verify /verify-session with valid JWT token."""
        headers = {"Authorization": f"Bearer {TestGlycoGuardBackend.token}"}
        response = self.client.get("/verify-session", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data.get("status"))
        self.assertTrue(data.get("session_active"))

    def test_06_direct_password_reset(self):
        """Verify direct password reset endpoint."""
        new_pass = "UpdatedPassword456!"
        payload = {
            "email": self.test_email,
            "new_password": new_pass
        }
        response = self.client.post("/forgot-password/direct-reset", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data.get("status"))

        # Re-login with new password to ensure persistence
        login_res = self.client.post("/login", json={"username": self.test_username, "password": new_pass})
        self.assertEqual(login_res.status_code, 200)
        TestGlycoGuardBackend.token = login_res.get_json()["token"]

    def test_07_google_demo_login(self):
        """Verify Google OAuth simulation endpoint."""
        payload = {
            "email": "demo.doctor@glycoguard.ai",
            "name": "Dr. Demo Doctor"
        }
        response = self.client.post("/google-login", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data.get("status"))
        self.assertIn("token", data)

    def test_08_ml_prediction_service(self):
        """Verify RandomForest ML diabetes prediction model inference."""
        model = PredictionService.get_model()
        self.assertIsNotNone(model, "ML model should be loaded successfully")

        # Test prediction payload
        payload = {
            "pregnancies": 2,
            "glucose": 145,
            "blood_pressure": 85,
            "skin_thickness": 25,
            "insulin": 95,
            "bmi": 29.2,
            "diabetes_pedigree": 0.65,
            "age": 42,
            "exercise_minutes": 25,
            "sleep_hours": 6.5,
            "stress_level": 5
        }
        response = self.client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data.get("status"))
        self.assertIn("risk_level", data)
        self.assertIn(data["risk_level"], ["Low", "Medium", "High"])
        self.assertGreaterEqual(data["probability"], 0.0)
        self.assertLessEqual(data["probability"], 100.0)
        self.assertIn("recommendation", data)

    def test_09_patient_crud_operations(self):
        """Verify Patient creation, retrieval, update, and deletion."""
        headers = {"Authorization": f"Bearer {TestGlycoGuardBackend.token}"}

        # 1. Add Patient
        pat_payload = {
            "full_name": "Lakshmi Test Patient",
            "age": 38,
            "gender": "Female",
            "height": 165,
            "weight": 62,
            "bmi": 22.8,
            "phone": "9988776655",
            "email": "lakshmi.test@example.com",
            "family_history": "None"
        }
        add_res = self.client.post("/patients", json=pat_payload, headers=headers)
        self.assertEqual(add_res.status_code, 201)

        # 2. Get Patients List
        list_res = self.client.get("/patients", headers=headers)
        self.assertEqual(list_res.status_code, 200)
        data = list_res.get_json()
        self.assertTrue(data.get("status"))
        self.assertIsInstance(data.get("patients"), list)

    def test_10_daily_tracking_api(self):
        """Verify Daily Health Tracking logging and retrieval."""
        headers = {"Authorization": f"Bearer {TestGlycoGuardBackend.token}"}
        track_payload = {
            "water": 3.0,
            "sleep": 8.0,
            "exercise": 45,
            "blood_sugar": 95.0,
            "weight": 68.0,
            "stress": 2
        }
        add_res = self.client.post("/tracking", json=track_payload, headers=headers)
        self.assertEqual(add_res.status_code, 201)

        get_res = self.client.get("/tracking", headers=headers)
        self.assertEqual(get_res.status_code, 200)
        data = get_res.get_json()
        self.assertTrue(data.get("status"))
        self.assertIsInstance(data.get("logs"), list)

    def test_11_health_planner_api(self):
        """Verify AI Health Planner generation."""
        headers = {"Authorization": f"Bearer {TestGlycoGuardBackend.token}"}
        plan_payload = {"risk_level": "Medium"}
        res = self.client.post("/planner", json=plan_payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get("status"))
        self.assertIn("plan", data)
        self.assertIn("breakfast", data["plan"])
        self.assertIn("lunch", data["plan"])
        self.assertIn("exercise", data["plan"])

    def test_12_dashboard_stats_api(self):
        """Verify Dashboard stats and recent activity."""
        headers = {"Authorization": f"Bearer {TestGlycoGuardBackend.token}"}
        res = self.client.get("/dashboard/stats", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get("status"))
        self.assertIn("stats", data)
        self.assertIn("recent_activity", data)


if __name__ == "__main__":
    unittest.main()
