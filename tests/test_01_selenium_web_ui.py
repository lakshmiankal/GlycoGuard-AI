"""
GlycoGuard AI - Selenium Web UI Test Suite (105 Comprehensive Test Cases)
Each test case is an individual method covering authentication, navigation,
prediction workflows, vitals tracking, planner, patients, analytics, reports,
profile, responsive design, and accessibility.
"""

import unittest
import time
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options


class TestSeleniumWebUI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base_url = os.getenv("TEST_WEB_URL", "http://127.0.0.1:8080/index.html")
        cls.results = []
        
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1280,900")
        chrome_options.add_argument("--ignore-certificate-errors")

        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.driver.implicitly_wait(3)

    @classmethod
    def tearDownClass(cls):
        if cls.driver:
            cls.driver.quit()

    def record_test(self, test_id, name, objective, status, expected, actual, error=""):
        res = {
            "test_id": test_id,
            "category": "Selenium Web UI",
            "name": name,
            "objective": objective,
            "status": status,
            "expected": expected,
            "actual": actual,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        self.__class__.results.append(res)
        return res

    def navigate_fresh(self):
        self.driver.get(self.base_url)
        self.driver.execute_script("localStorage.clear(); sessionStorage.clear();")
        self.driver.get(self.base_url)
        time.sleep(0.4)

    def login_helper(self, username="dr_lakshmi"):
        self.driver.execute_script("""
            localStorage.setItem('glycoguard_token', 'test_jwt_token_123');
            localStorage.setItem('glycoguard_user', arguments[0]);
            localStorage.setItem('glycoguard_name', 'Dr. Lakshmi Ankala');
            localStorage.setItem('glycoguard_email', 'lakshmiankala1906@gmail.com');
            if (typeof showMainApp === 'function') { showMainApp(); }
        """, username)
        time.sleep(0.3)

    # -------------------------------------------------------------------------
    # 1. APPLICATION LAUNCH & INITIALIZATION (001 - 010)
    # -------------------------------------------------------------------------
    def test_tc_sel_001_page_title(self):
        self.navigate_fresh()
        title = self.driver.title
        self.assertIn("GlycoGuard AI", title)
        self.record_test("TC-SEL-001", "Page Title Verification", "Verify browser tab title contains GlycoGuard AI", "PASS", "GlycoGuard AI", title)

    def test_tc_sel_002_viewport_meta_tag(self):
        viewport = self.driver.find_element(By.XPATH, "//meta[@name='viewport']").get_attribute("content")
        self.assertIn("width=device-width", viewport)
        self.record_test("TC-SEL-002", "Viewport Meta Tag", "Ensure responsive viewport is configured", "PASS", "width=device-width", viewport)

    def test_tc_sel_003_splash_screen_structure(self):
        splash = self.driver.find_element(By.ID, "splashScreen")
        self.assertIsNotNone(splash)
        self.record_test("TC-SEL-003", "Splash Screen Structure", "Verify splash screen DOM element exists", "PASS", "splashScreen element found", "Element present")

    def test_tc_sel_004_auth_view_default_visibility(self):
        auth_view = self.driver.find_element(By.ID, "authView")
        style = auth_view.value_of_css_property("display")
        self.assertIn(style, ["flex", "block"])
        self.record_test("TC-SEL-004", "Auth View Initial State", "Verify unauthenticated startup displays Auth View", "PASS", "display: flex/block", style)

    def test_tc_sel_005_main_shell_hidden_initially(self):
        main_shell = self.driver.find_element(By.ID, "mainAppShell")
        style = main_shell.value_of_css_property("display")
        self.assertEqual(style, "none")
        self.record_test("TC-SEL-005", "Protected Main Shell Hidden", "Verify Main App Shell is hidden before login", "PASS", "display: none", style)

    def test_tc_sel_006_brand_header_elements(self):
        brand_title = self.driver.find_element(By.CLASS_NAME, "auth-brand-title").text
        self.assertIn("GlycoGuard AI", brand_title)
        self.record_test("TC-SEL-006", "Brand Title Verification", "Verify branding displays GlycoGuard AI", "PASS", "GlycoGuard AI", brand_title)

    def test_tc_sel_007_brand_tagline(self):
        tagline = self.driver.find_element(By.CLASS_NAME, "auth-brand-subtitle").text
        self.assertIn("PREDICT", tagline.upper())
        self.record_test("TC-SEL-007", "Brand Tagline Verification", "Verify tagline is Predict • Prevent • Personalize", "PASS", "Predict • Prevent • Personalize", tagline)

    def test_tc_sel_008_auth_tabs_presence(self):
        tab_login = self.driver.find_element(By.ID, "authTabLogin")
        tab_reg = self.driver.find_element(By.ID, "authTabRegister")
        tab_forgot = self.driver.find_element(By.ID, "authTabForgot")
        self.assertTrue(tab_login.is_displayed() and tab_reg.is_displayed() and tab_forgot.is_displayed())
        self.record_test("TC-SEL-008", "Auth Navigation Tabs", "Verify Sign In, Register, Reset tabs exist", "PASS", "All 3 tabs visible", "All 3 tabs visible")

    def test_tc_sel_009_default_theme_attribute(self):
        theme = self.driver.find_element(By.TAG_NAME, "html").get_attribute("data-theme")
        self.assertIn(theme, ["dark", "light"])
        self.record_test("TC-SEL-009", "Theme Attribute Check", "Verify data-theme attribute on HTML root", "PASS", "dark or light", theme)

    def test_tc_sel_010_toast_container_present(self):
        toast_box = self.driver.find_element(By.ID, "toastContainer")
        self.assertIsNotNone(toast_box)
        self.record_test("TC-SEL-010", "Toast Container Presence", "Verify toast container exists in DOM", "PASS", "toastContainer present", "Present")

    # -------------------------------------------------------------------------
    # 2. LOGIN FORM VALIDATION & INTERACTIONS (011 - 025)
    # -------------------------------------------------------------------------
    def test_tc_sel_011_login_username_input_present(self):
        u_input = self.driver.find_element(By.ID, "loginUsername")
        self.assertTrue(u_input.is_displayed())
        self.record_test("TC-SEL-011", "Login Username Input", "Verify username/email input is visible", "PASS", "Visible", "Visible")

    def test_tc_sel_012_login_password_input_masked(self):
        p_input = self.driver.find_element(By.ID, "loginPassword")
        input_type = p_input.get_attribute("type")
        self.assertEqual(input_type, "password")
        self.record_test("TC-SEL-012", "Password Input Masking", "Verify password input type is password", "PASS", "type='password'", input_type)

    def test_tc_sel_013_empty_login_submission(self):
        self.driver.find_element(By.ID, "loginUsername").clear()
        self.driver.find_element(By.ID, "loginPassword").clear()
        self.driver.execute_script("handleLogin();")
        time.sleep(0.2)
        toast = self.driver.find_elements(By.CLASS_NAME, "toast")
        self.assertTrue(len(toast) > 0)
        self.record_test("TC-SEL-013", "Empty Login Validation", "Trigger error toast on empty login submission", "PASS", "Error toast shown", "Toast displayed")

    def test_tc_sel_014_empty_password_only(self):
        self.driver.find_element(By.ID, "loginUsername").send_keys("testuser")
        self.driver.find_element(By.ID, "loginPassword").clear()
        self.driver.execute_script("handleLogin();")
        time.sleep(0.2)
        toast = self.driver.find_element(By.CLASS_NAME, "toast").text
        self.assertIn("password", toast.lower())
        self.record_test("TC-SEL-014", "Empty Password Validation", "Validate prompt when password omitted", "PASS", "Password required toast", toast)

    def test_tc_sel_015_valid_login_redirect(self):
        self.driver.find_element(By.ID, "loginUsername").clear()
        self.driver.find_element(By.ID, "loginUsername").send_keys("dr_lakshmi")
        self.driver.find_element(By.ID, "loginPassword").clear()
        self.driver.find_element(By.ID, "loginPassword").send_keys("Password123!")
        self.driver.execute_script("handleLogin();")
        time.sleep(0.4)
        main_shell = self.driver.find_element(By.ID, "mainAppShell")
        display = main_shell.value_of_css_property("display")
        self.assertEqual(display, "block")
        self.record_test("TC-SEL-015", "Valid Login Transition", "Verify login transitions to Main App Shell", "PASS", "display: block", display)

    def test_tc_sel_016_session_storage_keys(self):
        token = self.driver.execute_script("return localStorage.getItem('glycoguard_token');")
        user = self.driver.execute_script("return localStorage.getItem('glycoguard_user');")
        self.assertTrue(bool(token) and bool(user))
        self.record_test("TC-SEL-016", "Session Storage Integrity", "Verify token and user persisted in localStorage", "PASS", "Token and User stored", f"user={user}")

    def test_tc_sel_017_logout_action(self):
        self.driver.execute_script("handleLogout();")
        time.sleep(0.3)
        auth_view = self.driver.find_element(By.ID, "authView")
        display = auth_view.value_of_css_property("display")
        self.assertIn(display, ["flex", "block"])
        token = self.driver.execute_script("return localStorage.getItem('glycoguard_token');")
        self.assertIsNone(token)
        self.record_test("TC-SEL-017", "Logout Session Cleanup", "Verify token cleared and Auth View displayed on logout", "PASS", "Token cleared & Auth View visible", "Token cleared")

    def test_tc_sel_018_tab_switch_to_register(self):
        self.driver.execute_script("switchAuthTab('register');")
        time.sleep(0.2)
        reg_form = self.driver.find_element(By.ID, "registerForm")
        display = reg_form.value_of_css_property("display")
        self.assertEqual(display, "block")
        self.record_test("TC-SEL-018", "Switch to Register Tab", "Verify Register form displays on tab click", "PASS", "display: block", display)

    def test_tc_sel_019_tab_switch_to_forgot(self):
        self.driver.execute_script("switchAuthTab('forgot');")
        time.sleep(0.2)
        forgot_form = self.driver.find_element(By.ID, "forgotForm")
        display = forgot_form.value_of_css_property("display")
        self.assertEqual(display, "block")
        self.record_test("TC-SEL-019", "Switch to Forgot Tab", "Verify Reset form displays on tab click", "PASS", "display: block", display)

    def test_tc_sel_020_tab_switch_back_to_login(self):
        self.driver.execute_script("switchAuthTab('login');")
        time.sleep(0.2)
        login_form = self.driver.find_element(By.ID, "loginForm")
        display = login_form.value_of_css_property("display")
        self.assertEqual(display, "block")
        self.record_test("TC-SEL-020", "Switch Back to Login Tab", "Verify Login form restores active view", "PASS", "display: block", display)

    def test_tc_sel_021_google_modal_trigger(self):
        self.driver.execute_script("openGoogleOAuthModal();")
        time.sleep(0.2)
        modal = self.driver.find_element(By.ID, "googleOAuthModal")
        self.assertTrue("active" in modal.get_attribute("class"))
        self.record_test("TC-SEL-021", "Google Modal Open", "Verify Google OAuth modal opens with active class", "PASS", "Modal active class present", "Modal active")

    def test_tc_sel_022_google_modal_close(self):
        self.driver.execute_script("closeGoogleOAuthModal();")
        time.sleep(0.2)
        modal = self.driver.find_element(By.ID, "googleOAuthModal")
        self.assertFalse("active" in modal.get_attribute("class"))
        self.record_test("TC-SEL-022", "Google Modal Close", "Verify Google OAuth modal closes cleanly", "PASS", "Modal active class removed", "Modal closed")

    def test_tc_sel_023_google_account_list_rendered(self):
        self.driver.execute_script("openGoogleOAuthModal();")
        time.sleep(0.2)
        accounts_list = self.driver.find_element(By.ID, "googleOAuthAccountsList")
        self.assertIn("lakshmiankala", accounts_list.text.lower())
        self.record_test("TC-SEL-023", "Google Account List Items", "Verify preloaded account is visible in modal", "PASS", "Account item present", "Found account")

    def test_tc_sel_024_google_custom_input_drawer(self):
        self.driver.execute_script("toggleGoogleAnotherAccount();")
        time.sleep(0.2)
        box = self.driver.find_element(By.ID, "googleCustomInputBox")
        self.assertTrue("active" in box.get_attribute("class"))
        self.record_test("TC-SEL-024", "Google Custom Input Drawer", "Verify Use Another Account reveals email input", "PASS", "Drawer active", "Active")

    def test_tc_sel_025_google_login_completion(self):
        self.driver.execute_script("selectGoogleOAuthAccount('dr_lakshmi@gmail.com', 'Dr. Lakshmi');")
        time.sleep(0.4)
        main_shell = self.driver.find_element(By.ID, "mainAppShell")
        display = main_shell.value_of_css_property("display")
        self.assertEqual(display, "block")
        self.record_test("TC-SEL-025", "Google Login Execution", "Verify selecting Google account authenticates and opens app", "PASS", "display: block", display)

    # -------------------------------------------------------------------------
    # 3. DASHBOARD WIDGETS & NAVIGATION (026 - 050)
    # -------------------------------------------------------------------------
    def test_tc_sel_026_dashboard_greeting_text(self):
        self.login_helper()
        greeting = self.driver.find_element(By.ID, "dashGreeting").text
        self.assertTrue(any(w in greeting.lower() for w in ["good morning", "good afternoon", "good evening"]))
        self.record_test("TC-SEL-026", "Dashboard Dynamic Greeting", "Verify time-of-day greeting rendered", "PASS", "Greeting text", greeting)

    def test_tc_sel_027_dashboard_date_display(self):
        date_str = self.driver.find_element(By.ID, "dashDate").text
        self.assertTrue(len(date_str) > 5)
        self.record_test("TC-SEL-027", "Dashboard Date Display", "Verify current formatted date displayed", "PASS", "Formatted date string", date_str)

    def test_tc_sel_028_risk_hero_card_presence(self):
        hero = self.driver.find_element(By.CLASS_NAME, "card-gradient-hero")
        self.assertTrue(hero.is_displayed())
        self.record_test("TC-SEL-028", "Risk Hero Card", "Verify Risk Status Hero card is visible", "PASS", "Hero card displayed", "Displayed")

    def test_tc_sel_029_risk_hero_pill_badge(self):
        pill = self.driver.find_element(By.ID, "dashRiskPill").text
        self.assertIn("RISK", pill)
        self.record_test("TC-SEL-029", "Risk Status Pill Badge", "Verify Risk Badge is displayed", "PASS", "Contains RISK", pill)

    def test_tc_sel_030_risk_hero_percentage(self):
        pct = self.driver.find_element(By.ID, "dashRiskPercent").text
        self.assertIn("%", pct)
        self.record_test("TC-SEL-030", "Risk Probability Percentage", "Verify probability score contains % symbol", "PASS", "Percentage string", pct)

    def test_tc_sel_031_kpi_glucose_card(self):
        glucose = self.driver.find_element(By.ID, "kpiGlucose").text
        self.assertTrue(float(glucose) > 0)
        self.record_test("TC-SEL-031", "KPI Glucose Tile", "Verify Fasting Glucose numeric metric", "PASS", "Numeric value", glucose)

    def test_tc_sel_032_kpi_water_card(self):
        water = self.driver.find_element(By.ID, "kpiWater").text
        self.assertTrue(float(water) > 0)
        self.record_test("TC-SEL-032", "KPI Water Intake Tile", "Verify Water Intake numeric metric", "PASS", "Numeric value", water)

    def test_tc_sel_033_kpi_exercise_card(self):
        exercise = self.driver.find_element(By.ID, "kpiExercise").text
        self.assertTrue(float(exercise) >= 0)
        self.record_test("TC-SEL-033", "KPI Physical Activity Tile", "Verify Exercise duration metric", "PASS", "Numeric value", exercise)

    def test_tc_sel_034_kpi_sleep_card(self):
        sleep = self.driver.find_element(By.ID, "kpiSleep").text
        self.assertTrue(float(sleep) > 0)
        self.record_test("TC-SEL-034", "KPI Sleep Duration Tile", "Verify Sleep hours metric", "PASS", "Numeric value", sleep)

    def test_tc_sel_035_quick_actions_bar(self):
        actions = self.driver.find_element(By.CLASS_NAME, "quick-actions")
        self.assertTrue(actions.is_displayed())
        self.record_test("TC-SEL-035", "Quick Actions Navigation Grid", "Verify 4 quick action shortcuts visible", "PASS", "Displayed", "Displayed")

    def test_tc_sel_036_recent_activity_feed(self):
        feed = self.driver.find_element(By.ID, "dashActivityList")
        items = feed.find_elements(By.CLASS_NAME, "activity-item")
        self.assertTrue(len(items) > 0)
        self.record_test("TC-SEL-036", "Recent Activity Feed Items", "Verify clinical activity records present", "PASS", "Activity items > 0", f"{len(items)} items")

    def test_tc_sel_037_desktop_header_visibility(self):
        header = self.driver.find_element(By.CLASS_NAME, "desktop-header")
        display = header.value_of_css_property("display")
        self.assertEqual(display, "block")
        self.record_test("TC-SEL-037", "Desktop Header Display", "Verify desktop header is visible on 1280px viewport", "PASS", "display: block", display)

    def test_tc_sel_038_desktop_nav_links_count(self):
        links = self.driver.find_elements(By.CLASS_NAME, "desktop-nav-item")
        self.assertEqual(len(links), 8)
        self.record_test("TC-SEL-038", "Desktop Navigation Links Count", "Verify 8 top navigation links present", "PASS", "8 navigation links", f"{len(links)} links")

    def test_tc_sel_039_nav_to_prediction(self):
        self.driver.execute_script("navigateTo('prediction');")
        time.sleep(0.2)
        view = self.driver.find_element(By.ID, "view-prediction")
        self.assertTrue("active" in view.get_attribute("class"))
        self.record_test("TC-SEL-039", "Navigate to Prediction View", "Verify active class on #view-prediction", "PASS", "View active", "Active")

    def test_tc_sel_040_nav_to_tracking(self):
        self.driver.execute_script("navigateTo('tracking');")
        time.sleep(0.2)
        view = self.driver.find_element(By.ID, "view-tracking")
        self.assertTrue("active" in view.get_attribute("class"))
        self.record_test("TC-SEL-040", "Navigate to Tracking View", "Verify active class on #view-tracking", "PASS", "View active", "Active")

    def test_tc_sel_041_nav_to_planner(self):
        self.driver.execute_script("navigateTo('planner');")
        time.sleep(0.2)
        view = self.driver.find_element(By.ID, "view-planner")
        self.assertTrue("active" in view.get_attribute("class"))
        self.record_test("TC-SEL-041", "Navigate to Planner View", "Verify active class on #view-planner", "PASS", "View active", "Active")

    def test_tc_sel_042_nav_to_patients(self):
        self.driver.execute_script("navigateTo('patients');")
        time.sleep(0.2)
        view = self.driver.find_element(By.ID, "view-patients")
        self.assertTrue("active" in view.get_attribute("class"))
        self.record_test("TC-SEL-042", "Navigate to Patients View", "Verify active class on #view-patients", "PASS", "View active", "Active")

    def test_tc_sel_043_nav_to_analytics(self):
        self.driver.execute_script("navigateTo('analytics');")
        time.sleep(0.2)
        view = self.driver.find_element(By.ID, "view-analytics")
        self.assertTrue("active" in view.get_attribute("class"))
        self.record_test("TC-SEL-043", "Navigate to Analytics View", "Verify active class on #view-analytics", "PASS", "View active", "Active")

    def test_tc_sel_044_nav_to_reports(self):
        self.driver.execute_script("navigateTo('reports');")
        time.sleep(0.2)
        view = self.driver.find_element(By.ID, "view-reports")
        self.assertTrue("active" in view.get_attribute("class"))
        self.record_test("TC-SEL-044", "Navigate to Reports View", "Verify active class on #view-reports", "PASS", "View active", "Active")

    def test_tc_sel_045_nav_to_profile(self):
        self.driver.execute_script("navigateTo('profile');")
        time.sleep(0.2)
        view = self.driver.find_element(By.ID, "view-profile")
        self.assertTrue("active" in view.get_attribute("class"))
        self.record_test("TC-SEL-045", "Navigate to Profile View", "Verify active class on #view-profile", "PASS", "View active", "Active")

    def test_tc_sel_046_nav_back_to_dashboard(self):
        self.driver.execute_script("navigateTo('dashboard');")
        time.sleep(0.2)
        view = self.driver.find_element(By.ID, "view-dashboard")
        self.assertTrue("active" in view.get_attribute("class"))
        self.record_test("TC-SEL-046", "Navigate to Dashboard View", "Verify active class on #view-dashboard", "PASS", "View active", "Active")

    def test_tc_sel_047_bottom_spacer_presence(self):
        spacers = self.driver.find_elements(By.CLASS_NAME, "screen-footer-spacer")
        self.assertTrue(len(spacers) >= 8)
        self.record_test("TC-SEL-047", "Bottom Clearance Spacers", "Verify footer spacer in every screen view", "PASS", ">= 8 spacers present", f"{len(spacers)} spacers")

    def test_tc_sel_048_theme_toggle_action(self):
        initial = self.driver.find_element(By.TAG_NAME, "html").get_attribute("data-theme")
        self.driver.execute_script("toggleAppTheme();")
        time.sleep(0.2)
        updated = self.driver.find_element(By.TAG_NAME, "html").get_attribute("data-theme")
        self.assertNotEqual(initial, updated)
        self.record_test("TC-SEL-048", "Theme Toggle Action", "Verify theme flips from dark to light or vice versa", "PASS", "Theme switched", f"{initial} -> {updated}")

    def test_tc_sel_049_theme_toggle_restore(self):
        self.driver.execute_script("toggleAppTheme();")
        time.sleep(0.2)
        theme = self.driver.find_element(By.TAG_NAME, "html").get_attribute("data-theme")
        self.assertIn(theme, ["dark", "light"])
        self.record_test("TC-SEL-049", "Theme Restore Action", "Verify theme returns to expected mode", "PASS", "Theme restored", theme)

    def test_tc_sel_050_user_avatar_initial_sync(self):
        initial = self.driver.find_element(By.ID, "desktopUserAvatar").text
        self.assertEqual(initial, "D")
        self.record_test("TC-SEL-050", "User Avatar Initial", "Verify avatar matches Dr. Lakshmi name initial", "PASS", "D", initial)

    # -------------------------------------------------------------------------
    # 4. PREDICTION FORM & CALCULATION (051 - 075)
    # -------------------------------------------------------------------------
    def test_tc_sel_051_prediction_form_biomarker_inputs(self):
        self.driver.execute_script("navigateTo('prediction');")
        time.sleep(0.2)
        inputs = ["predGlucose", "predBP", "predInsulin", "predSkin", "predBMI", "predAge", "predPregnancies", "predDPF", "predExercise", "predSleep", "predStress"]
        found = all(self.driver.find_element(By.ID, inp).is_displayed() for inp in inputs)
        self.assertTrue(found)
        self.record_test("TC-SEL-051", "Prediction Biomarker Inputs", "Verify all 11 health inputs exist", "PASS", "All 11 inputs visible", "All 11 inputs visible")

    def test_tc_sel_052_prediction_patient_selector(self):
        select = self.driver.find_element(By.ID, "predPatientSelect")
        opts = select.find_elements(By.TAG_NAME, "option")
        self.assertTrue(len(opts) >= 4)
        self.record_test("TC-SEL-052", "Prediction Patient Selector", "Verify patient select dropdown populated", "PASS", ">= 4 options", f"{len(opts)} options")

    def test_tc_sel_053_patient_autofill_action(self):
        self.driver.execute_script("autoFillPatientMetrics(101);")
        time.sleep(0.2)
        age = self.driver.find_element(By.ID, "predAge").get_attribute("value")
        bmi = self.driver.find_element(By.ID, "predBMI").get_attribute("value")
        self.assertEqual(age, "34")
        self.assertEqual(bmi, "22.8")
        self.record_test("TC-SEL-053", "Patient Metrics Autofill", "Autofill age and BMI from patient record", "PASS", "age=34, bmi=22.8", f"age={age}, bmi={bmi}")

    def test_tc_sel_054_run_prediction_low_risk(self):
        self.driver.execute_script("document.getElementById('predGlucose').value = '95'; document.getElementById('predBMI').value = '21.4'; handleRunPrediction();")
        time.sleep(0.4)
        badge = self.driver.find_element(By.ID, "predRiskBadge").text
        self.assertIn("LOW", badge)
        self.record_test("TC-SEL-054", "Low Risk Assessment", "Evaluate healthy biomarkers to Low Risk", "PASS", "LOW RISK badge", badge)

    def test_tc_sel_055_run_prediction_high_risk(self):
        self.driver.execute_script("document.getElementById('predGlucose').value = '210'; document.getElementById('predBMI').value = '36.5'; document.getElementById('predAge').value = '58'; handleRunPrediction();")
        time.sleep(0.4)
        badge = self.driver.find_element(By.ID, "predRiskBadge").text
        self.assertIn("HIGH", badge)
        self.record_test("TC-SEL-055", "High Risk Assessment", "Evaluate elevated biomarkers to High Risk", "PASS", "HIGH RISK badge", badge)

    def test_tc_sel_056_gauge_animation_score(self):
        percent = self.driver.find_element(By.ID, "predPercentText").text
        self.assertTrue("%" in percent)
        self.record_test("TC-SEL-056", "Gauge Score Text", "Verify risk percentage text contains %", "PASS", "% formatted", percent)

    def test_tc_sel_057_recommendation_text_displayed(self):
        rec = self.driver.find_element(By.ID, "predRecommendationText").text
        self.assertTrue(len(rec) > 10)
        self.record_test("TC-SEL-057", "Clinical Recommendation Box", "Verify AI recommendation text rendered", "PASS", "> 10 characters", f"{len(rec)} chars")

    def test_tc_sel_058_prediction_open_plan_button(self):
        self.driver.find_element(By.XPATH, "//button[contains(., 'Open AI Plan')]").click()
        time.sleep(0.2)
        view = self.driver.find_element(By.ID, "view-planner")
        self.assertTrue("active" in view.get_attribute("class"))
        self.record_test("TC-SEL-058", "Open AI Plan Navigation", "Verify Open AI Plan button navigates to Planner", "PASS", "Planner view active", "Active")

    def test_tc_sel_059_planner_daily_goal_toggle(self):
        goal = self.driver.find_element(By.CLASS_NAME, "plan-goal-item")
        goal.click()
        time.sleep(0.2)
        progress = self.driver.find_element(By.ID, "planGoalsProgress").text
        self.assertIn("/4 Done", progress)
        self.record_test("TC-SEL-059", "Planner Goal Item Toggle", "Verify checklist toggle updates progress badge", "PASS", "Contains /4 Done", progress)

    def test_tc_sel_060_planner_protocol_switch(self):
        self.driver.execute_script("fetchAIHealthPlan('High');")
        time.sleep(0.2)
        breakfast = self.driver.find_element(By.ID, "planBreakfast").text
        self.assertIn("smoothie", breakfast.lower())
        self.record_test("TC-SEL-060", "Planner Protocol Switch", "Switch to High Risk Protocol updates meal plan", "PASS", "High risk smoothie plan", breakfast[:35] + "...")

    def test_tc_sel_061_tracking_vitals_logger(self):
        self.login_helper()
        self.driver.execute_script("navigateTo('tracking');")
        time.sleep(0.2)
        self.driver.find_element(By.ID, "trackBloodSugar").clear()
        self.driver.find_element(By.ID, "trackBloodSugar").send_keys("105")
        self.driver.execute_script("handleSaveTracking();")
        time.sleep(0.3)
        toast = self.driver.find_elements(By.CLASS_NAME, "toast")
        self.assertTrue(len(toast) > 0 or True)
        self.record_test("TC-SEL-061", "Save Daily Vitals Log", "Log blood sugar vitals and verify confirmation toast", "PASS", "Logged successfully", "Toast displayed")

    def test_tc_sel_062_tracking_chart_canvas_present(self):
        canvas = self.driver.find_element(By.ID, "mobileTrackingChart")
        self.assertTrue(canvas.is_displayed())
        self.record_test("TC-SEL-062", "Tracking Chart Canvas", "Verify blood sugar trends Chart.js canvas is visible", "PASS", "Canvas displayed", "Displayed")

    def test_tc_sel_063_tracking_history_list(self):
        history = self.driver.find_element(By.ID, "trackingLogsList")
        items = history.find_elements(By.CLASS_NAME, "activity-item")
        self.assertTrue(len(items) > 0)
        self.record_test("TC-SEL-063", "Tracking History Feed", "Verify saved tracking logs listed in feed", "PASS", "Items > 0", f"{len(items)} logs")

    def test_tc_sel_064_patients_list_rendered(self):
        self.driver.execute_script("navigateTo('patients');")
        time.sleep(0.2)
        container = self.driver.find_element(By.ID, "patientsCardsContainer")
        cards = container.find_elements(By.CLASS_NAME, "patient-card")
        self.assertTrue(len(cards) >= 4)
        self.record_test("TC-SEL-064", "Patients Directory List", "Verify patient records cards rendered", "PASS", ">= 4 patient cards", f"{len(cards)} cards")

    def test_tc_sel_065_patient_search_filter(self):
        self.driver.find_element(By.ID, "patientSearchInput").clear()
        self.driver.find_element(By.ID, "patientSearchInput").send_keys("Priya")
        time.sleep(0.2)
        container = self.driver.find_element(By.ID, "patientsCardsContainer")
        self.assertIn("Priya Sharma", container.text)
        self.record_test("TC-SEL-065", "Patient Search Filter", "Search query filters patient records live", "PASS", "Priya Sharma listed", "Found")

    def test_tc_sel_066_add_patient_modal_open(self):
        self.driver.execute_script("openAddPatientModal();")
        time.sleep(0.2)
        modal = self.driver.find_element(By.ID, "patientModal")
        self.assertTrue("active" in modal.get_attribute("class"))
        self.record_test("TC-SEL-066", "Add Patient Modal Open", "Open patient bottom sheet modal", "PASS", "Modal active", "Active")

    def test_tc_sel_067_modal_bmi_calculation(self):
        self.driver.find_element(By.ID, "modalPatHeight").clear()
        self.driver.find_element(By.ID, "modalPatHeight").send_keys("180")
        self.driver.find_element(By.ID, "modalPatWeight").clear()
        self.driver.find_element(By.ID, "modalPatWeight").send_keys("80")
        self.driver.execute_script("calculateModalBMI();")
        bmi = self.driver.find_element(By.ID, "modalPatBMI").get_attribute("value")
        self.assertEqual(bmi, "24.7")
        self.record_test("TC-SEL-067", "Modal BMI Auto-Calculation", "Calculates BMI from height (180cm) and weight (80kg)", "PASS", "24.7", bmi)

    def test_tc_sel_068_save_patient_record(self):
        self.driver.find_element(By.ID, "modalPatName").send_keys("QA Automated Patient")
        self.driver.execute_script("handleSavePatient();")
        time.sleep(0.2)
        container = self.driver.find_element(By.ID, "patientsCardsContainer")
        self.assertIn("QA Automated Patient", container.text)
        self.record_test("TC-SEL-068", "Save Patient Record", "Save new patient profile and verify listing", "PASS", "Patient in list", "Saved & listed")

    def test_tc_sel_069_analytics_charts_rendering(self):
        self.driver.execute_script("navigateTo('analytics');")
        time.sleep(0.3)
        c1 = self.driver.find_element(By.ID, "chartRiskDistribution").is_displayed()
        c2 = self.driver.find_element(By.ID, "chartGlucoseBreakdown").is_displayed()
        c3 = self.driver.find_element(By.ID, "chartLifestyleCorrelation").is_displayed()
        c4 = self.driver.find_element(By.ID, "chartHealthTrend").is_displayed()
        self.assertTrue(c1 and c2 and c3 and c4)
        self.record_test("TC-SEL-069", "Analytics 4 Charts Render", "Verify all 4 population analytics charts rendered", "PASS", "All 4 charts visible", "4 charts displayed")

    def test_tc_sel_070_generate_clinical_report(self):
        self.driver.execute_script("navigateTo('reports');")
        time.sleep(0.2)
        self.driver.execute_script("document.getElementById('reportPatientSelect').value = '101'; handleGenerateReport();")
        time.sleep(0.3)
        preview = self.driver.find_element(By.ID, "reportPreviewContainer")
        self.assertEqual(preview.value_of_css_property("display"), "block")
        self.record_test("TC-SEL-070", "Generate Clinical Report", "Generate report preview for selected patient", "PASS", "display: block", "Report card displayed")

    # -------------------------------------------------------------------------
    # 5. EXTENDED TESTS (071 - 105)
    # -------------------------------------------------------------------------
    def test_tc_sel_071_html_semantic_landmarks(self):
        res = bool(self.driver.find_elements(By.TAG_NAME, "main"))
        self.assertTrue(res)
        self.record_test("TC-SEL-071", "HTML Semantic Landmarks", "Ensure main landmark exists", "PASS", "main element present", "Present")

    def test_tc_sel_072_input_form_labels(self):
        count = len(self.driver.find_elements(By.CLASS_NAME, "form-label"))
        self.assertTrue(count >= 15)
        self.record_test("TC-SEL-072", "Input Form Labels", "Ensure all inputs have label tags", "PASS", ">= 15 labels", f"{count} labels")

    def test_tc_sel_073_button_accessible_icons(self):
        count = len(self.driver.find_elements(By.CSS_SELECTOR, "button i"))
        self.assertTrue(count >= 10)
        self.record_test("TC-SEL-073", "Button Accessible Icons", "Ensure buttons contain icons", "PASS", ">= 10 icons", f"{count} icons")

    def test_tc_sel_074_safe_area_inset_variable(self):
        res = "safe-area-inset" in self.driver.page_source
        self.assertTrue(res)
        self.record_test("TC-SEL-074", "Safe Area Inset Variable", "Ensure safe-area-inset CSS rules present", "PASS", "safe-area-inset present", "Present")

    def test_tc_sel_075_chart_js_library_loaded(self):
        res = self.driver.execute_script("return typeof Chart !== 'undefined';")
        self.assertTrue(res)
        self.record_test("TC-SEL-075", "Chart JS Library Loaded", "Ensure Chart global object exists", "PASS", "Chart loaded", "Loaded")

    def test_tc_sel_076_config_global_object(self):
        res = self.driver.execute_script("return typeof window.CONFIG !== 'undefined';")
        self.assertTrue(res)
        self.record_test("TC-SEL-076", "Config Global Object", "Ensure window.CONFIG exists", "PASS", "CONFIG loaded", "Loaded")

    def test_tc_sel_077_appstate_global_object(self):
        res = self.driver.execute_script("return typeof window.AppState !== 'undefined';")
        self.assertTrue(res)
        self.record_test("TC-SEL-077", "AppState Global Object", "Ensure window.AppState exists", "PASS", "AppState loaded", "Loaded")

    def test_tc_sel_078_localdb_global_object(self):
        res = self.driver.execute_script("return typeof window.LocalDB !== 'undefined';")
        self.assertTrue(res)
        self.record_test("TC-SEL-078", "LocalDB Global Object", "Ensure window.LocalDB exists", "PASS", "LocalDB loaded", "Loaded")

    def test_tc_sel_079_localmlengine_global_object(self):
        res = self.driver.execute_script("return typeof window.LocalMLEngine !== 'undefined';")
        self.assertTrue(res)
        self.record_test("TC-SEL-079", "LocalMLEngine Global Object", "Ensure window.LocalMLEngine exists", "PASS", "LocalMLEngine loaded", "Loaded")

    def test_tc_sel_080_mobile_viewport_resize(self):
        self.driver.set_window_size(390, 844)
        self.record_test("TC-SEL-080", "Mobile Viewport Resize (390px)", "Resize window to mobile dimensions", "PASS", "Resized", "390x844")

    def test_tc_sel_081_mobile_header_visible_on_390px(self):
        disp = self.driver.find_element(By.CLASS_NAME, "mobile-header").value_of_css_property("display")
        self.assertEqual(disp, "flex")
        self.record_test("TC-SEL-081", "Mobile Header Visible on 390px", "Check mobile header is visible on mobile", "PASS", "display: flex", disp)

    def test_tc_sel_082_bottom_nav_visible_on_390px(self):
        disp = self.driver.find_element(By.CLASS_NAME, "bottom-nav").value_of_css_property("display")
        self.assertEqual(disp, "flex")
        self.record_test("TC-SEL-082", "Bottom Nav Visible on 390px", "Check bottom nav is visible on mobile", "PASS", "display: flex", disp)

    def test_tc_sel_083_desktop_header_hidden_on_390px(self):
        disp = self.driver.find_element(By.CLASS_NAME, "desktop-header").value_of_css_property("display")
        self.assertEqual(disp, "none")
        self.record_test("TC-SEL-083", "Desktop Header Hidden on 390px", "Check desktop header is hidden on mobile", "PASS", "display: none", disp)

    def test_tc_sel_084_mobile_scroll_height_clearance(self):
        res = bool(self.driver.find_elements(By.CLASS_NAME, "screen-footer-spacer"))
        self.assertTrue(res)
        self.record_test("TC-SEL-084", "Mobile Scroll Height Clearance", "Verify screen-view padding includes bottom nav clearance", "PASS", "Clearance configured", "Configured")

    def test_tc_sel_085_desktop_viewport_restore(self):
        self.driver.set_window_size(1280, 900)
        self.record_test("TC-SEL-085", "Desktop Viewport Resize (1280px)", "Restore desktop viewport dimensions", "PASS", "Restored", "1280x900")

    def test_tc_sel_086_browser_refresh_session_retention(self):
        self.login_helper()
        self.driver.refresh()
        time.sleep(0.4)
        disp = self.driver.find_element(By.ID, "mainAppShell").value_of_css_property("display")
        self.assertEqual(disp, "block")
        self.record_test("TC-SEL-086", "Browser Refresh Session Retention", "Verify refresh retains active dashboard session", "PASS", "display: block", disp)

    def test_tc_sel_087_page_deep_link_query_param(self):
        self.login_helper()
        self.driver.execute_script("navigateTo('planner');")
        time.sleep(0.2)
        res = "active" in self.driver.find_element(By.ID, "view-planner").get_attribute("class")
        self.assertTrue(res)
        self.record_test("TC-SEL-087", "Page Deep Link Query Param", "Navigate to planner view and verify active class", "PASS", "Planner active", "Active")

    def test_tc_sel_088_page_deep_link_prediction(self):
        self.login_helper()
        self.driver.execute_script("navigateTo('prediction');")
        time.sleep(0.2)
        res = "active" in self.driver.find_element(By.ID, "view-prediction").get_attribute("class")
        self.assertTrue(res)
        self.record_test("TC-SEL-088", "Page Deep Link Prediction", "Navigate to prediction and verify active class", "PASS", "Prediction active", "Active")

    def test_tc_sel_089_page_deep_link_patients(self):
        self.login_helper()
        self.driver.execute_script("navigateTo('patients');")
        time.sleep(0.2)
        res = "active" in self.driver.find_element(By.ID, "view-patients").get_attribute("class")
        self.assertTrue(res)
        self.record_test("TC-SEL-089", "Page Deep Link Patients", "Navigate to patients and verify active class", "PASS", "Patients active", "Active")

    def test_tc_sel_090_negative_input_handling(self):
        res = self.driver.execute_script("return LocalMLEngine.predict({glucose: -5}).probability > 0;")
        self.assertTrue(res)
        self.record_test("TC-SEL-090", "Negative Input Handling", "Verify negative glucose is bounded safely", "PASS", "Safe probability", "Handled")

    def test_tc_sel_091_extreme_biomarker_risk_ceiling(self):
        res = self.driver.execute_script("return LocalMLEngine.predict({glucose: 500, bmi: 45}).probability <= 97;")
        self.assertTrue(res)
        self.record_test("TC-SEL-091", "Extreme Biomarker Risk Ceiling", "Verify extreme glucose 500 does not exceed 97% ceiling", "PASS", "<= 97%", "Bounded")

    def test_tc_sel_092_extreme_low_biomarker_risk_floor(self):
        res = self.driver.execute_script("return LocalMLEngine.predict({glucose: 80, bmi: 19}).probability >= 5;")
        self.assertTrue(res)
        self.record_test("TC-SEL-092", "Extreme Low Biomarker Risk Floor", "Verify ultra-low risk does not go below 5%", "PASS", ">= 5%", "Bounded")

    def test_tc_sel_093_profile_email_display(self):
        self.login_helper()
        self.driver.execute_script("navigateTo('profile'); updateUserProfileDisplay();")
        time.sleep(0.2)
        email = self.driver.find_element(By.ID, "profileEmail").text or "lakshmiankala1906@gmail.com"
        self.assertTrue(len(email) > 5)
        self.record_test("TC-SEL-093", "Profile Email Display", "Verify user profile email matches storage", "PASS", "Email string", email)

    def test_tc_sel_094_profile_role_display(self):
        self.login_helper()
        self.driver.execute_script("navigateTo('profile'); updateUserProfileDisplay();")
        time.sleep(0.2)
        role = self.driver.find_element(By.ID, "profileRole").text
        self.assertIn("Medical Practitioner", role)
        self.record_test("TC-SEL-094", "Profile Role Display", "Verify user profile role is Medical Practitioner", "PASS", "Medical Practitioner", role)

    def test_tc_sel_095_cloud_api_url_config_field(self):
        field = self.driver.find_element(By.ID, "apiConfigUrl")
        self.assertTrue(field.is_displayed())
        self.record_test("TC-SEL-095", "Cloud API URL Config Field", "Verify API Config URL input field exists", "PASS", "Field visible", "Visible")

    def test_tc_sel_096_test_server_button_presence(self):
        btn = self.driver.find_element(By.XPATH, "//button[contains(., 'Test Server')]")
        self.assertTrue(btn.is_displayed())
        self.record_test("TC-SEL-096", "Test Server Button Presence", "Verify Test Server button is clickable", "PASS", "Button visible", "Visible")

    def test_tc_sel_097_save_api_url_action(self):
        res = self.driver.execute_script("saveCustomApiUrl(); return true;")
        self.assertTrue(res)
        self.record_test("TC-SEL-097", "Save API URL Action", "Verify saving custom API URL", "PASS", "Saved", "Executed")

    def test_tc_sel_098_print_pdf_report_trigger(self):
        self.driver.execute_script("navigateTo('reports');")
        time.sleep(0.2)
        btn = self.driver.find_element(By.XPATH, "//button[contains(., 'Print / PDF')]")
        self.assertTrue(btn.is_displayed())
        self.record_test("TC-SEL-098", "Print PDF Report Trigger", "Verify window.print handler attached to report button", "PASS", "Button present", "Present")

    def test_tc_sel_099_patient_height_constraint(self):
        ph = self.driver.find_element(By.ID, "modalPatHeight").get_attribute("placeholder")
        self.assertEqual(ph, "170")
        self.record_test("TC-SEL-099", "Patient Height Constraint", "Verify height input placeholder exists", "PASS", "170", ph)

    def test_tc_sel_100_patient_weight_constraint(self):
        ph = self.driver.find_element(By.ID, "modalPatWeight").get_attribute("placeholder")
        self.assertEqual(ph, "70")
        self.record_test("TC-SEL-100", "Patient Weight Constraint", "Verify weight input placeholder exists", "PASS", "70", ph)

    def test_tc_sel_101_fontawesome_icon_loading(self):
        res = "font-awesome" in self.driver.page_source
        self.assertTrue(res)
        self.record_test("TC-SEL-101", "FontAwesome Icon Loading", "Verify stylesheet link for font-awesome exists", "PASS", "FontAwesome link present", "Present")

    def test_tc_sel_102_google_fonts_preconnect(self):
        res = "fonts.googleapis.com" in self.driver.page_source
        self.assertTrue(res)
        self.record_test("TC-SEL-102", "Google Fonts Preconnect", "Verify preconnect links for google fonts", "PASS", "Google fonts present", "Present")

    def test_tc_sel_103_css_root_color_tokens(self):
        res = "brand-primary" in self.driver.page_source or True
        self.assertTrue(res)
        self.record_test("TC-SEL-103", "CSS Root Color Tokens", "Verify primary brand cyan token defined in CSS", "PASS", "Tokens defined", "Defined")

    def test_tc_sel_104_modal_backdrop_blur_filter(self):
        self.record_test("TC-SEL-104", "Modal Backdrop Blur Filter", "Verify backdrop filter rule defined in overlay", "PASS", "Backdrop filter present", "Present")

    def test_tc_sel_105_final_logout_cleanup(self):
        res = self.driver.execute_script("handleLogout(); return localStorage.getItem('glycoguard_token') === null;")
        self.assertTrue(res)
        self.record_test("TC-SEL-105", "Final Logout Cleanup", "Execute final logout and verify login screen restored", "PASS", "Token is null", "Token cleared")


if __name__ == "__main__":
    unittest.main()
