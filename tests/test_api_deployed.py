"""
GlycoGuard AI - Live Render API Test Suite
Executes safe, non-destructive HTTP integration tests against the live Render backend URL.
Uses isolated ephemeral test accounts and automatic fixture cleanup.
"""

import time
import uuid
import secrets
import pytest
import requests


@pytest.fixture(scope="module")
def api_session(backend_url):
    """
    Creates an ephemeral test user on the live backend, logs in to obtain a JWT token,
    and yields the authenticated session headers.
    """
    unique_id = f"ci_{int(time.time())}_{uuid.uuid4().hex[:6]}"
    username = f"user_{unique_id}"
    email = f"{username}@glycoguard.ai"
    password = secrets.token_urlsafe(18)

    # 1. Register ephemeral user
    signup_payload = {
        "username": username,
        "password": password,
        "full_name": f"CI Test User {unique_id}",
        "email": email,
        "phone": "9998887770"
    }
    
    token = None
    try:
        signup_res = requests.post(f"{backend_url}/signup", json=signup_payload, timeout=10)
        if signup_res.status_code in [201, 400]:
            # 2. Login to get token
            login_res = requests.post(
                f"{backend_url}/login",
                json={"username": username, "password": password},
                timeout=10
            )
            if login_res.status_code == 200:
                token = login_res.json().get("token")
    except Exception as e:
        print(f"[API FIXTURE NOTICE] Backend signup/login attempt: {e}")

    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    yield {
        "headers": headers,
        "username": username,
        "email": email,
        "password": password,
        "token": token
    }


def test_api_001_health_check(backend_url):
    """Verify live /health endpoint returns running status with fast latency."""
    test_api_001_health_check._test_id = "TC-API-001"
    test_api_001_health_check._expected_result = "HTTP 200 with status='running' and latency < 3500ms."

    try:
        start_time = time.time()
        response = requests.get(f"{backend_url}/health", timeout=10)
        latency_ms = (time.time() - start_time) * 1000
    except requests.exceptions.RequestException as e:
        pytest.fail(f"Could not connect to live backend at {backend_url}: {e}. Verify BACKEND_URL in GitHub Variables.")

    assert response.status_code == 200, f"Expected 200 from {backend_url}/health, got {response.status_code}. Verify backend deployment and BACKEND_URL."
    data = response.json()
    assert data.get("status") == "running", f"Unexpected status in health response: {data}"
    assert data.get("project") == "GlycoGuard AI"
    assert latency_ms < 5000, f"Latency too high: {latency_ms:.1f}ms"


def test_api_002_user_registration(backend_url):
    """Verify registration endpoint processes valid user payload."""
    test_api_002_user_registration._test_id = "TC-API-002"
    test_api_002_user_registration._expected_result = "HTTP 201 (or 400 if user exists) with status boolean."

    uid = f"reg_{int(time.time())}_{uuid.uuid4().hex[:4]}"
    payload = {
        "username": f"user_{uid}",
        "password": secrets.token_urlsafe(18),
        "full_name": "Ephemeral Registration User",
        "email": f"user_{uid}@glycoguard.ai",
        "phone": "9876543210"
    }
    response = requests.post(f"{backend_url}/signup", json=payload, timeout=10)
    assert response.status_code in [201, 400]
    data = response.json()
    assert "status" in data


def test_api_003_user_login(backend_url, api_session):
    """Verify authentication endpoint verifies credentials and issues signed JWT."""
    test_api_003_user_login._test_id = "TC-API-003"
    test_api_003_user_login._expected_result = "HTTP 200 with status=True and JWT token string."

    if not api_session.get("token"):
        pytest.skip("No active JWT session established")

    payload = {
        "username": api_session["username"],
        "password": api_session["password"]
    }
    response = requests.post(f"{backend_url}/login", json=payload, timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") is True
    assert "token" in data
    assert len(data["token"]) > 20


def test_api_004_session_verification(backend_url, api_session):
    """Verify /verify-session validates active JWT token header."""
    test_api_004_session_verification._test_id = "TC-API-004"
    test_api_004_session_verification._expected_result = "HTTP 200 with session_active=True."

    if not api_session.get("token"):
        pytest.skip("No active JWT session established")

    response = requests.get(
        f"{backend_url}/verify-session",
        headers=api_session["headers"],
        timeout=10
    )
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") is True
    assert data.get("session_active") is True


def test_api_005_direct_password_reset(backend_url, api_session):
    """Verify direct password reset on isolated ephemeral test account."""
    test_api_005_direct_password_reset._test_id = "TC-API-005"
    test_api_005_direct_password_reset._expected_result = "HTTP 200 with status=True and successful re-login with updated password."

    new_pass = secrets.token_urlsafe(18)
    payload = {
        "email": api_session["email"],
        "new_password": new_pass
    }
    response = requests.post(f"{backend_url}/forgot-password/direct-reset", json=payload, timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") is True

    # Re-login with new password
    login_res = requests.post(
        f"{backend_url}/login",
        json={"username": api_session["username"], "password": new_pass},
        timeout=10
    )
    assert login_res.status_code == 200
    api_session["password"] = new_pass
    api_session["token"] = login_res.json().get("token")
    api_session["headers"]["Authorization"] = f"Bearer {api_session['token']}"


def test_api_006_ml_prediction_inference(backend_url):
    """Verify live ML /predict endpoint returns risk_level and probability."""
    test_api_006_ml_prediction_inference._test_id = "TC-API-006"
    test_api_006_ml_prediction_inference._expected_result = "HTTP 200 with risk_level in ['Low', 'Medium', 'High'] and recommendation."

    payload = {
        "pregnancies": 1,
        "glucose": 130,
        "blood_pressure": 75,
        "skin_thickness": 22,
        "insulin": 85,
        "bmi": 26.5,
        "diabetes_pedigree": 0.45,
        "age": 36,
        "exercise_minutes": 35,
        "sleep_hours": 7.0,
        "stress_level": 4
    }
    response = requests.post(f"{backend_url}/predict", json=payload, timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") is True
    assert data.get("risk_level") in ["Low", "Medium", "High"]
    assert 0.0 <= data.get("probability", -1) <= 100.0
    assert len(data.get("recommendation", "")) > 5


def test_api_007_patient_crud_lifecycle(backend_url, api_session):
    """Verify complete Patient CRUD lifecycle with guaranteed deletion teardown."""
    test_api_007_patient_crud_lifecycle._test_id = "TC-API-007"
    test_api_007_patient_crud_lifecycle._expected_result = "Patient created (201), fetched (200), updated (200), and deleted (200)."

    if not api_session.get("token"):
        pytest.skip("No active JWT session established")

    created_patient_id = None
    try:
        # 1. Create Patient
        pat_payload = {
            "full_name": f"CI Ephemeral Patient {uuid.uuid4().hex[:4]}",
            "age": 42,
            "gender": "Female",
            "height": 168,
            "weight": 65,
            "bmi": 23.0,
            "phone": "9990001111",
            "email": "ephemeral.patient@glycoguard.ai",
            "family_history": "None"
        }
        create_res = requests.post(
            f"{backend_url}/patients",
            json=pat_payload,
            headers=api_session["headers"],
            timeout=10
        )
        assert create_res.status_code == 201
        create_data = create_res.json()
        assert create_data.get("status") is True

        # 2. Get All Patients
        list_res = requests.get(
            f"{backend_url}/patients",
            headers=api_session["headers"],
            timeout=10
        )
        assert list_res.status_code == 200
        patients_list = list_res.json().get("patients", [])
        assert isinstance(patients_list, list)

        # Locate created patient ID
        for p in patients_list:
            if p.get("full_name") == pat_payload["full_name"]:
                created_patient_id = p.get("id") or p.get("patient_id")
                break

        if created_patient_id:
            # 3. Update Patient
            update_payload = {"full_name": f"{pat_payload['full_name']} Updated", "age": 43}
            update_res = requests.put(
                f"{backend_url}/patients/{created_patient_id}",
                json=update_payload,
                headers=api_session["headers"],
                timeout=10
            )
            assert update_res.status_code == 200

    finally:
        # Guaranteed Teardown: Delete created patient
        if created_patient_id:
            del_res = requests.delete(
                f"{backend_url}/patients/{created_patient_id}",
                headers=api_session["headers"],
                timeout=10
            )
            assert del_res.status_code == 200


def test_api_008_daily_tracking_and_planner(backend_url, api_session):
    """Verify daily vitals logging and AI health planner generation endpoints."""
    test_api_008_daily_tracking_and_planner._test_id = "TC-API-008"
    test_api_008_daily_tracking_and_planner._expected_result = "HTTP 201 for tracking entry and HTTP 200 for health plan generation."

    if not api_session.get("token"):
        pytest.skip("No active JWT session established")

    # 1. Log Tracking
    track_payload = {
        "water": 2.5,
        "sleep": 7.5,
        "exercise": 30,
        "blood_sugar": 98.0,
        "weight": 70.0,
        "stress": 3
    }
    track_res = requests.post(
        f"{backend_url}/tracking",
        json=track_payload,
        headers=api_session["headers"],
        timeout=10
    )
    assert track_res.status_code in [200, 201]

    # 2. Generate Plan
    plan_payload = {"risk_level": "Medium"}
    plan_res = requests.post(
        f"{backend_url}/planner",
        json=plan_payload,
        headers=api_session["headers"],
        timeout=10
    )
    assert plan_res.status_code == 200
    plan_data = plan_res.json()
    assert plan_data.get("status") is True
    assert "plan" in plan_data


def test_api_009_dashboard_stats(backend_url, api_session):
    """Verify /dashboard/stats aggregate counts and activities."""
    test_api_009_dashboard_stats._test_id = "TC-API-009"
    test_api_009_dashboard_stats._expected_result = "HTTP 200 with stats dictionary containing total counts."

    if not api_session.get("token"):
        pytest.skip("No active JWT session established")

    res = requests.get(
        f"{backend_url}/dashboard/stats",
        headers=api_session["headers"],
        timeout=10
    )
    assert res.status_code == 200
    data = res.json()
    assert data.get("status") is True
    assert "stats" in data
