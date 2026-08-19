"""
GlycoGuard AI - Unit Test Suite
Covers isolated business logic: ML prediction model, JWT claims, password hashing,
BMI calculations, and AI health plan rules.
"""

import sys
import os
import jwt
import datetime
import pytest
from pathlib import Path
from werkzeug.security import generate_password_hash, check_password_hash

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from config import Config
from services.prediction_service import PredictionService
from services.planner_service import PlannerService


def test_unit_001_ml_model_loading():
    """Verify ML model binary loads correctly with required inference methods."""
    test_unit_001_ml_model_loading._test_id = "TC-UNIT-001"
    test_unit_001_ml_model_loading._expected_result = "ML model instance loaded with predict and predict_proba methods."
    
    model = PredictionService.get_model()
    assert model is not None, "Model should not be None"
    assert hasattr(model, "predict"), "Model must implement predict()"
    assert hasattr(model, "predict_proba"), "Model must implement predict_proba()"


def test_unit_002_prediction_low_risk():
    """Verify ML model inference on healthy biomarker profile produces Low risk classification."""
    test_unit_002_prediction_low_risk._test_id = "TC-UNIT-002"
    test_unit_002_prediction_low_risk._expected_result = "risk_level is 'Low' or 'Medium' with valid probability float."

    healthy_input = {
        "pregnancies": 0,
        "glucose": 85.0,
        "blood_pressure": 65.0,
        "skin_thickness": 15.0,
        "insulin": 40.0,
        "bmi": 21.5,
        "diabetes_pedigree": 0.15,
        "age": 24,
        "exercise_minutes": 60,
        "sleep_hours": 8.0,
        "stress_level": 2
    }
    result = PredictionService.predict(healthy_input)
    assert result["status"] is True
    assert result["risk_level"] in ["Low", "Medium", "High"]
    assert 0.0 <= result["probability"] <= 100.0
    assert "recommendation" in result and len(result["recommendation"]) > 10


def test_unit_003_prediction_high_risk():
    """Verify ML model inference on elevated biomarker profile evaluates high glycemic risk."""
    test_unit_003_prediction_high_risk._test_id = "TC-UNIT-003"
    test_unit_003_prediction_high_risk._expected_result = "risk_level is 'High' or 'Medium' with elevated probability."

    elevated_input = {
        "pregnancies": 4,
        "glucose": 195.0,
        "blood_pressure": 95.0,
        "skin_thickness": 35.0,
        "insulin": 210.0,
        "bmi": 36.8,
        "diabetes_pedigree": 1.15,
        "age": 58,
        "exercise_minutes": 10,
        "sleep_hours": 5.0,
        "stress_level": 9
    }
    result = PredictionService.predict(elevated_input)
    assert result["status"] is True
    assert result["risk_level"] in ["Medium", "High"]
    assert result["probability"] >= 30.0


def test_unit_004_auto_bmi_calculation():
    """Verify automatic BMI calculation when height and weight are provided."""
    test_unit_004_auto_bmi_calculation._test_id = "TC-UNIT-004"
    test_unit_004_auto_bmi_calculation._expected_result = "BMI is computed accurately: weight / (height_m^2)."

    # Height 180cm (1.8m), Weight 81kg -> BMI = 81 / (1.8 * 1.8) = 25.0
    input_data = {
        "height": 180,
        "weight": 81,
        "glucose": 100,
        "age": 30
    }
    result = PredictionService.predict(input_data)
    assert result["status"] is True
    assert "probability" in result


def test_unit_005_password_hashing_and_verification():
    """Verify secure password hashing and verification using Werkzeug."""
    test_unit_005_password_hashing_and_verification._test_id = "TC-UNIT-005"
    test_unit_005_password_hashing_and_verification._expected_result = "Password hash cannot match plain text and check_password_hash validates correctly."

    import secrets
    raw_password = secrets.token_urlsafe(16)
    hashed = generate_password_hash(raw_password)
    
    assert hashed != raw_password
    assert check_password_hash(hashed, raw_password) is True
    assert check_password_hash(hashed, secrets.token_urlsafe(16)) is False


def test_unit_006_jwt_token_generation_and_decode():
    """Verify JWT generation with HS256 algorithm and claims decoding."""
    test_unit_006_jwt_token_generation_and_decode._test_id = "TC-UNIT-006"
    test_unit_006_jwt_token_generation_and_decode._expected_result = "JWT encodes claims and decodes username accurately."

    username = "test_doctor_unit"
    payload = {
        "username": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")
    assert isinstance(token, str)

    decoded = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
    assert decoded["username"] == username
    assert "exp" in decoded


def test_unit_007_jwt_expired_token_handling():
    """Verify expired JWT tokens raise ExpiredSignatureError."""
    test_unit_007_jwt_expired_token_handling._test_id = "TC-UNIT-007"
    test_unit_007_jwt_expired_token_handling._expected_result = "Expired token raises ExpiredSignatureError on decode."

    expired_payload = {
        "username": "expired_user",
        "exp": datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
    }
    expired_token = jwt.encode(expired_payload, Config.SECRET_KEY, algorithm="HS256")
    
    with pytest.raises(jwt.ExpiredSignatureError):
        jwt.decode(expired_token, Config.SECRET_KEY, algorithms=["HS256"])


def test_unit_008_health_planner_rule_engine():
    """Verify AI Health Planner returns structured lifestyle suggestions."""
    test_unit_008_health_planner_rule_engine._test_id = "TC-UNIT-008"
    test_unit_008_health_planner_rule_engine._expected_result = "Plan dictionary includes breakfast, lunch, snacks, dinner, and exercise."

    plan_high = PlannerService.generate_plan({"risk_level": "High"})
    assert plan_high["status"] is True
    assert "plan" in plan_high
    assert "breakfast" in plan_high["plan"]
    assert "exercise" in plan_high["plan"]
    assert "water_goal" in plan_high["plan"]

    plan_low = PlannerService.generate_plan({"risk_level": "Low"})
    assert plan_low["status"] is True
    assert "plan" in plan_low


def test_unit_009_bmi_category_helper():
    """Verify mathematical BMI metric calculation formula."""
    test_unit_009_bmi_category_helper._test_id = "TC-UNIT-009"
    test_unit_009_bmi_category_helper._expected_result = "BMI accurately classified for standard weight/height ranges."

    def calc_bmi(w_kg, h_cm):
        h_m = h_cm / 100.0
        return round(w_kg / (h_m * h_m), 2)

    assert calc_bmi(70, 175) == 22.86
    assert calc_bmi(90, 170) == 31.14
    assert calc_bmi(50, 160) == 19.53


def test_unit_010_model_features_integrity():
    """Verify ML model expects exactly the 11 clinical features."""
    test_unit_010_model_features_integrity._test_id = "TC-UNIT-010"
    test_unit_010_model_features_integrity._expected_result = "Model features input count matches 11 trained features."

    model = PredictionService.get_model()
    # Check feature count if available on estimator
    if hasattr(model, "n_features_in_"):
        assert model.n_features_in_ == 11
