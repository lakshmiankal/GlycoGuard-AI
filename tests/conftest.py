"""
GlycoGuard AI - Pytest Configuration & Test Results Collector
Handles test timing, result recording for Excel reporting, and Selenium screenshot capture on failure.
"""

import os
import json
import time
import pytest
from datetime import datetime
from pathlib import Path

# Result collector path
RESULTS_FILE = Path(__file__).parent / "test_results.json"
SCREENSHOTS_DIR = Path(__file__).parent.parent / "screenshots"


def pytest_configure(config):
    """Ensure screenshots directory exists."""
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    if not RESULTS_FILE.exists():
        with open(RESULTS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)


@pytest.fixture(scope="session")
def frontend_url():
    """Returns the Frontend URL (GitHub Pages or custom override)."""
    return os.getenv("FRONTEND_URL", "https://lakshmiankal.github.io/GlycoGuard-AI/").rstrip("/")


@pytest.fixture(scope="session")
def backend_url():
    """Returns the Backend URL (Render cloud backend or custom override)."""
    return os.getenv("BACKEND_URL", "https://glycoguard-api.onrender.com").rstrip("/")


@pytest.fixture(scope="session")
def test_credentials():
    """
    Returns credentials for authenticated Selenium E2E tests strictly from environment variables.
    Fails immediately with a clear diagnostic message if either variable is missing.
    """
    username = os.getenv("TEST_USERNAME")
    password = os.getenv("TEST_PASSWORD")

    missing = []
    if not username:
        missing.append("TEST_USERNAME")
    if not password:
        missing.append("TEST_PASSWORD")

    if missing:
        pytest.fail(
            f"Missing required environment variable(s): {', '.join(missing)}. "
            "Please configure TEST_USERNAME and TEST_PASSWORD in GitHub Secrets or environment variables."
        )

    return {
        "username": username.strip(),
        "password": password.strip()
    }


@pytest.fixture(scope="function")
def driver(request):
    """
    Selenium WebDriver fixture with headless Chrome configuration and
    automatic screenshot capture on test failure.
    """
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service

    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--ignore-certificate-errors")

    driver = None
    try:
        try:
            from webdriver_manager.chrome import ChromeDriverManager
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
        except Exception:
            driver = webdriver.Chrome(options=chrome_options)

        driver.implicitly_wait(10)
        yield driver

    finally:
        if driver:
            # Capture screenshot if test failed
            if hasattr(request.node, "rep_call") and request.node.rep_call.failed:
                test_name = request.node.name.replace("/", "_").replace(":", "_")
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                screenshot_path = SCREENSHOTS_DIR / f"{test_name}_{timestamp}.png"
                try:
                    driver.save_screenshot(str(screenshot_path))
                    print(f"\n[SELENIUM SCREENSHOT] Captured failure screenshot: {screenshot_path}")
                except Exception as e:
                    print(f"\n[SELENIUM SCREENSHOT ERROR] Failed to save screenshot: {e}")

            driver.quit()


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook to capture test status, execution time, and failure details."""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)

    if rep.when == "call" or (rep.when == "setup" and rep.failed):
        test_file = Path(item.fspath).name
        
        # Categorize test type
        if "unit" in test_file:
            test_type = "Unit Test"
        elif "api" in test_file:
            test_type = "API Test"
        elif "selenium" in test_file:
            test_type = "Selenium E2E Test"
        elif "security" in test_file:
            test_type = "Security/Vulnerability Test"
        else:
            test_type = "Automated Test"

        # Determine Test Case ID & Description
        doc = item.obj.__doc__.strip() if item.obj and item.obj.__doc__ else item.name
        first_line = doc.split("\n")[0].strip()
        
        # Extract or generate TC-ID
        test_id = getattr(item.obj, "_test_id", None)
        if not test_id:
            if "unit" in test_file:
                prefix = "TC-UNIT"
            elif "api" in test_file:
                prefix = "TC-API"
            elif "selenium" in test_file:
                prefix = "TC-E2E"
            elif "security" in test_file:
                prefix = "TC-SEC"
            else:
                prefix = "TC-AUTO"
            test_id = f"{prefix}-{item.name}"

        # Status determination
        if rep.passed:
            status = "PASS"
            failure_details = "N/A"
            actual_result = getattr(item, "_actual_result", "Test completed with expected assertions.")
        elif rep.failed:
            status = "FAIL"
            failure_details = str(rep.longrepr)
            actual_result = f"Failed: {rep.longreprtext.splitlines()[-1] if rep.longreprtext else 'Assertion failure'}"
        else:
            status = "SKIPPED"
            failure_details = "N/A"
            actual_result = "Test was skipped"

        expected_result = getattr(item.obj, "_expected_result", "Assertion succeeds and matches specification.")

        record = {
            "test_id": test_id,
            "test_name": item.name,
            "test_type": test_type,
            "test_description": first_line,
            "expected_result": expected_result,
            "actual_result": actual_result,
            "status": status,
            "execution_time": round(rep.duration, 4),
            "failure_details": failure_details,
            "timestamp": datetime.now().isoformat()
        }

        # Append to RESULTS_FILE atomically
        try:
            records = []
            if RESULTS_FILE.exists():
                with open(RESULTS_FILE, "r", encoding="utf-8") as f:
                    try:
                        records = json.load(f)
                    except json.JSONDecodeError:
                        records = []
            
            # Update existing or append
            updated = False
            for i, r in enumerate(records):
                if r.get("test_id") == test_id or r.get("test_name") == item.name:
                    records[i] = record
                    updated = True
                    break
            if not updated:
                records.append(record)

            with open(RESULTS_FILE, "w", encoding="utf-8") as f:
                json.dump(records, f, indent=2)
        except Exception as e:
            print(f"[RESULTS RECORDING NOTICE] Failed to update test_results.json: {e}")
