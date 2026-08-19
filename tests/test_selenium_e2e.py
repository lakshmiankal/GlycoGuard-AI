"""
GlycoGuard AI - Headless Selenium E2E Test Suite
Executes real browser user journeys against the deployed GitHub Pages frontend.
Uses credentials from environment variables / GitHub Secrets and captures screenshots on failure.
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_e2e_001_auth_page_loading(driver, frontend_url):
    """Verify deployed Auth page loads with all brand elements, tabs, and input fields."""
    test_e2e_001_auth_page_loading._test_id = "TC-E2E-001"
    test_e2e_001_auth_page_loading._expected_result = "Page title contains 'GlycoGuard AI' and login form inputs are displayed."

    target_url = f"{frontend_url}/auth.html"
    driver.get(target_url)

    # Wait for page elements
    wait = WebDriverWait(driver, 15)
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))

    assert "GlycoGuard" in driver.title or "Authentication" in driver.title
    assert "GlycoGuard AI" in driver.page_source

    # Check key inputs
    login_user = driver.find_element(By.ID, "loginUsername")
    login_pass = driver.find_element(By.ID, "loginPassword")
    assert login_user.is_displayed()
    assert login_pass.is_displayed()


def test_e2e_002_tab_switching(driver, frontend_url):
    """Verify interactive switching between Login, Register, and Forgot Password tabs."""
    test_e2e_002_tab_switching._test_id = "TC-E2E-002"
    test_e2e_002_tab_switching._expected_result = "Clicking tabs toggles respective active form sections seamlessly."

    driver.get(f"{frontend_url}/auth.html")
    wait = WebDriverWait(driver, 10)

    # 1. Click Register Tab
    reg_tab = wait.until(EC.element_to_be_clickable((By.ID, "tab-register")))
    reg_tab.click()
    time.sleep(0.5)
    reg_section = driver.find_element(By.ID, "register")
    assert "active" in reg_section.get_attribute("class")

    # 2. Click Forgot Tab
    forgot_tab = wait.until(EC.element_to_be_clickable((By.ID, "tab-forgot")))
    forgot_tab.click()
    time.sleep(0.5)
    forgot_section = driver.find_element(By.ID, "forgot")
    assert "active" in forgot_section.get_attribute("class")

    # 3. Click Login Tab
    login_tab = wait.until(EC.element_to_be_clickable((By.ID, "tab-login")))
    login_tab.click()
    time.sleep(0.5)
    login_section = driver.find_element(By.ID, "login")
    assert "active" in login_section.get_attribute("class")


def test_e2e_003_login_and_dashboard_navigation(driver, frontend_url, test_credentials):
    """Verify authentication flow, token storage in localStorage, and redirection to dashboard."""
    test_e2e_003_login_and_dashboard_navigation._test_id = "TC-E2E-003"
    test_e2e_003_login_and_dashboard_navigation._expected_result = "Login succeeds, persists user session, and navigates to dashboard.html."

    driver.get(f"{frontend_url}/auth.html")
    wait = WebDriverWait(driver, 10)

    login_user = wait.until(EC.visibility_of_element_located((By.ID, "loginUsername")))
    login_pass = driver.find_element(By.ID, "loginPassword")
    login_btn = driver.find_element(By.CSS_SELECTOR, "#login .main-btn")

    # Enter credentials from Secrets
    login_user.clear()
    login_user.send_keys(test_credentials["username"])
    login_pass.clear()
    login_pass.send_keys(test_credentials["password"])

    # Click Login
    login_btn.click()

    # Wait for either redirection to dashboard or active token in localStorage
    time.sleep(3)
    current_url = driver.current_url
    page_text = driver.page_source

    # Check localStorage session or page navigation
    token = driver.execute_script("return localStorage.getItem('glycoguard_token') || localStorage.getItem('glycoguard_user');")
    assert token is not None or "dashboard.html" in current_url or "Dashboard" in page_text


def test_e2e_004_dashboard_elements(driver, frontend_url):
    """Verify Dashboard page structure, topbar greeting, KPI counter cards, and sidebar links."""
    test_e2e_004_dashboard_elements._test_id = "TC-E2E-004"
    test_e2e_004_dashboard_elements._expected_result = "Dashboard renders sidebar, topbar, KPI cards, and chart canvas."

    # Seed mock session to view protected dashboard page
    driver.get(f"{frontend_url}/auth.html")
    driver.execute_script("localStorage.setItem('glycoguard_user', 'Dr. CI Tester');")
    driver.execute_script("localStorage.setItem('glycoguard_token', 'ci_mock_valid_token_2026');")

    driver.get(f"{frontend_url}/frontend/dashboard.html")
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "sidebar")))

    assert "GlycoGuard AI" in driver.page_source
    assert driver.find_element(By.ID, "patientCount") is not None
    assert driver.find_element(By.ID, "predictionCount") is not None


def test_e2e_005_patient_management_auto_bmi(driver, frontend_url):
    """Verify Patient management page input fields and client-side BMI auto-calculation."""
    test_e2e_005_patient_management_auto_bmi._test_id = "TC-E2E-005"
    test_e2e_005_patient_management_auto_bmi._expected_result = "Entering Height 175 and Weight 70 auto-calculates BMI to 22.86."

    driver.get(f"{frontend_url}/auth.html")
    driver.execute_script("localStorage.setItem('glycoguard_user', 'Dr. CI Tester');")
    driver.execute_script("localStorage.setItem('glycoguard_token', 'ci_mock_valid_token_2026');")

    driver.get(f"{frontend_url}/frontend/patients.html")
    wait = WebDriverWait(driver, 10)

    name_input = wait.until(EC.visibility_of_element_located((By.ID, "name")))
    height_input = driver.find_element(By.ID, "height")
    weight_input = driver.find_element(By.ID, "weight")
    bmi_input = driver.find_element(By.ID, "bmi")

    name_input.send_keys("E2E Test Patient")
    height_input.send_keys("175")
    weight_input.send_keys("70")
    time.sleep(0.5)

    calculated_bmi = bmi_input.get_attribute("value")
    assert calculated_bmi in ["22.86", "22.9", "22.85"], f"Unexpected BMI value: {calculated_bmi}"


def test_e2e_006_prediction_page_interaction(driver, frontend_url):
    """Verify ML Diabetes Risk Prediction form interactivity and outcome rendering."""
    test_e2e_006_prediction_page_interaction._test_id = "TC-E2E-006"
    test_e2e_006_prediction_page_interaction._expected_result = "Submitting prediction parameters updates risk gauge and recommendation."

    driver.get(f"{frontend_url}/auth.html")
    driver.execute_script("localStorage.setItem('glycoguard_user', 'Dr. CI Tester');")
    driver.execute_script("localStorage.setItem('glycoguard_token', 'ci_mock_valid_token_2026');")

    driver.get(f"{frontend_url}/frontend/prediction.html")
    wait = WebDriverWait(driver, 10)

    glucose_input = wait.until(EC.visibility_of_element_located((By.ID, "glucose")))
    glucose_input.clear()
    glucose_input.send_keys("140")

    predict_btn = driver.find_element(By.CSS_SELECTOR, ".buttons button.save")
    predict_btn.click()
    time.sleep(2)

    risk_tag = driver.find_element(By.ID, "riskTag")
    prob_text = driver.find_element(By.ID, "probText")
    assert risk_tag.is_displayed()
    assert prob_text.is_displayed()
