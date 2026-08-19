# CI/CD Automated Testing Implementation Plan for GlycoGuard AI

Comprehensive automated CI/CD pipeline for **GlycoGuard AI** to execute on every GitHub push, running Unit Tests, Live Render API Tests, GitHub Pages Selenium E2E Tests, and Security/Vulnerability Scans, generating a professional styled XLSX report, uploading it as an artifact, and outputting a GitHub Actions test summary.

---

## 1. Repository Inspection & Architecture Analysis

Based on thorough inspection of the repository files, here is the full analysis:

### 1.1 Frontend Technology
- **Core**: Vanilla HTML5, CSS3 (Custom Glassmorphism Design System), JavaScript (ES6+ with Fetch API & DOM manipulation).
- **Libraries**:
  - [Chart.js](https://cdn.jsdelivr.net/npm/chart.js) for analytics and dashboard visualization.
  - [FontAwesome 6.6.0](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css) for UI iconography.
  - [Google Identity Services](https://accounts.google.com/gsi/client) for Google OAuth integration.
- **Mobile Packaging**: [Capacitor 6.2.0](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/package.json) (`@capacitor/android`, `@capacitor/core`, `@capacitor/app`, `@capacitor/cli`) with native Android bridge in [android/](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/android).
- **Client Architecture**: Offline-ready hybrid storage using `localStorage` (`glycoguard_token`, `glycoguard_user`, `glycoguard_name`, `glycoguard_email`), with centralized HTTP/HTTPS routing handled in [js/config.js](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/js/config.js).

### 1.2 Backend Technology
- **Runtime & Web Framework**: Python 3.11 with [Flask 3.0.3](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/backend/requirements.txt) & [Flask-CORS 5.0.0](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/backend/requirements.txt).
- **WSGI Production Server**: [Gunicorn 23.0.0](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/backend/requirements.txt).
- **Database Layer**: Cloud PostgreSQL (Supabase / Render PostgreSQL) managed with [SQLAlchemy 2.0.36](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/backend/requirements.txt) and [psycopg2-binary 2.9.10](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/backend/requirements.txt).
- **Machine Learning**: [scikit-learn 1.6.0](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/backend/requirements.txt) (RandomForestClassifier serialized in [backend/model.pkl](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/backend/model.pkl)), Pandas 2.2.3, NumPy 2.2.1, Joblib 1.4.2.
- **Security & Authentication**:
  - [PyJWT 2.9.0](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/backend/requirements.txt) (HS256 algorithm).
  - [Werkzeug 3.1.3](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/backend/requirements.txt) (`generate_password_hash`, `check_password_hash` with pbkdf2/scrypt).
- **Report Generation**: [ReportLab 4.2.5](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/backend/requirements.txt) (PDF clinical reports generation).

### 1.3 Existing Test Framework
- Standard Library `unittest` in [test_backend_api.py](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/test_backend_api.py) (12 integration tests covering local backend app creation, DB queries, endpoints, ML model).
- Basic Selenium script in [selenium_tests/test_login.py](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/selenium_tests/test_login.py) targeting localhost.
- No automated CI/CD pipeline or `.github/workflows` configured currently.

### 1.4 Existing Application Structure
```
glycoguard-ai/
├── auth.html                 # Main Auth Page (Login, Register, Direct Reset, Google OAuth)
├── index.html                # Standalone Risk Estimator Page
├── render.yaml               # Render Cloud infrastructure config
├── package.json              # Capacitor mobile build config
├── build_www.py              # Mobile web assets synchronizer
├── model.pkl                 # Pretrained ML model binary
├── test_backend_api.py       # Integration tests for Flask backend
│
├── frontend/                 # Application Web Pages
│   ├── dashboard.html        # Main dashboard with KPI cards & live database feed
│   ├── patients.html         # Patient management (CRUD, table, BMI calculation)
│   ├── prediction.html       # ML Risk prediction form with live gauge
│   ├── planner.html          # AI Nutrition & Lifestyle health planner
│   ├── tracking.html         # Daily tracking log (glucose, sleep, water, stress)
│   ├── analytics.html        # Chart analytics
│   └── reports.html          # Medical report download
│
├── js/                       # Modular Client Scripts
│   ├── config.js             # API URLs, token header interceptor, network handlers
│   ├── dashboard.js          # Live dashboard statistics & session validation
│   ├── patient.js            # Patient CRUD AJAX operations
│   ├── prediction.js         # ML Prediction form submission
│   ├── planner.js            # AI Health Planner logic
│   ├── tracking.js           # Health tracking AJAX
│   ├── analytics.js          # Chart rendering
│   └── reports.js            # PDF Report generation AJAX
│
├── css/                      # Stylesheets (dashboard.css, patient.css, etc.)
│
├── backend/                  # Flask REST API Server
│   ├── app.py                # App factory, blueprints, table auto-creation
│   ├── config.py             # DATABASE_URL, SECRET_KEY, SMTP, MODEL_PATH
│   ├── db.py                 # SQLAlchemy engine and raw SQL execution helper
│   ├── requirements.txt      # Python dependencies
│   ├── middleware/
│   │   └── auth_middleware.py # @token_required JWT decorator
│   ├── routes/               # Blueprint routes
│   │   ├── auth.py           # /signup, /login, /forgot-password/*, /verify-session, /health
│   │   ├── patient.py        # /patients CRUD endpoints
│   │   ├── prediction.py     # /predict endpoint
│   │   ├── dashboard.py      # /dashboard/stats endpoint
│   │   ├── planner.py        # /planner endpoints
│   │   ├── tracking.py       # /tracking endpoints
│   │   └── reports.py        # /reports endpoints
│   └── services/             # Business Logic & Database operations
│       ├── auth_service.py
│       ├── patient_service.py
│       ├── prediction_service.py
│       ├── dashboard_service.py
│       ├── planner_service.py
│       ├── tracking_service.py
│       └── report_service.py
│
├── selenium_tests/           # Selenium scripts
│   └── test_login.py
└── android/                  # Android Native Studio Project (Capacitor)
```

### 1.5 Frontend Deployed URL & Configuration
- **GitHub Repository**: `https://github.com/lakshmiankal/GlycoGuard-AI` (from [.git/config](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/.git/config))
- **Live GitHub Pages URL**: `https://lakshmiankal.github.io/GlycoGuard-AI/auth.html` (Primary Auth entry point) and `https://lakshmiankal.github.io/GlycoGuard-AI/index.html` (Predictor).
- **Client Configuration**: [js/config.js](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/js/config.js) automatically resolves `PRODUCTION_HTTPS_URL = "https://glycoguard-api.onrender.com"`.

### 1.6 Backend Deployed URL & Configuration
- **Live Render Backend URL**: `https://glycoguard-api.onrender.com`
- **Render Configuration**: [render.yaml](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/render.yaml) specifies service `glycoguard-api`, health check at `/health`, connecting to `glycoguard-db` PostgreSQL.

### 1.7 Existing Authentication Flow
1. **Registration (`POST /signup`)**:
   - Accepts `username`, `password`, `full_name`, `email`, `phone`.
   - Checks duplicate username/email, hashes password with `generate_password_hash`, stores in `users` table.
2. **Login (`POST /login`)**:
   - Accepts `username` (or email) and `password`.
   - Verifies hash using `check_password_hash`.
   - Issues a signed JWT token (`HS256`, 24h expiration) containing `{"username": user, "exp": ...}`.
3. **Session Verification (`GET /verify-session`)**:
   - Validates `Authorization: Bearer <token>` and returns user details.
4. **Direct Password Reset (`POST /forgot-password/direct-reset`)**:
   - Takes `email` / `username` and `new_password` (min 6 chars), updates hashed password directly.
5. **OTP Flow (`POST /forgot-password/request-otp` & `verify-otp`)**:
   - Sends 6-digit OTP via SMTP (with 10m expiry and 5 max attempts).
6. **Google Login (`POST /google-login`)**:
   - Accepts Google credential/email, resolves or provisions user record, and issues JWT.

### 1.8 Existing API Endpoints (Complete Inventory)
| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/health` | `GET` | No | API status & version check |
| `/signup` | `POST` | No | User registration |
| `/login` | `POST` | No | Authentication & JWT token issue |
| `/verify-session` | `GET` | Yes (JWT) | Validates active session token |
| `/forgot-password/direct-reset` | `POST` | No | Direct password update |
| `/forgot-password/request-otp` | `POST` | No | Request email OTP code |
| `/forgot-password/verify-otp` | `POST` | No | Verify OTP code & reset password |
| `/google-login` | `POST` | No | Google authentication handler |
| `/predict` | `POST` | No | RandomForest ML diabetes risk inference |
| `/patients` | `POST` | Yes (JWT) | Create patient record |
| `/patients` | `GET` | Yes (JWT) | List all registered patients |
| `/patients/<id>` | `GET` | Yes (JWT) | Retrieve single patient by ID |
| `/patients/<id>` | `PUT` | Yes (JWT) | Update patient record by ID |
| `/patients/<id>` | `DELETE` | Yes (JWT) | Delete patient record by ID |
| `/dashboard/stats` | `GET` | Yes (JWT) | Fetch aggregate counts & recent logs |
| `/planner` | `POST` | Yes (JWT) | Generate personalized health/diet plan |
| `/planner/<patient_id>` | `GET` | Yes (JWT) | Fetch health plan for patient |
| `/tracking` | `POST` | Yes (JWT) | Insert daily health log |
| `/tracking` | `GET` | Yes (JWT) | Get tracking logs (optional `?patient_id=`) |
| `/reports` | `POST` | Yes (JWT) | Generate downloadable PDF report |
| `/reports` | `GET` | Yes (JWT) | List generated reports |

---

## 2. Recommended Testing Strategy & Approaches

### 2.1 Best Approach for Unit Testing
- **Framework**: `pytest`
- **Scope**:
  - Test pure Python algorithms without external server dependencies:
    - ML Feature Vector formulation and prediction thresholds in `PredictionService.predict`.
    - Password hashing & verification logic with `werkzeug.security`.
    - JWT Token generation and claims extraction with `jwt`.
    - Client configuration parsing and sanitization.
    - Patient BMI calculation formulas ($BMI = \frac{weight}{(height/100)^2}$).
    - Health planner rule engine risk categorization.

### 2.2 Best Approach for API Testing
- **Framework**: `pytest` + `requests` targeting the **REAL deployed Render Backend** (`https://glycoguard-api.onrender.com`).
- **Scope**:
  - Live `/health` endpoint verification.
  - End-to-end user registration with unique timestamped credentials.
  - Live login and JWT token validation.
  - `/verify-session` token validation.
  - Direct password reset on live cloud database.
  - Live ML `/predict` inference with multiple test vectors (High risk, Low risk, Borderline).
  - Authenticated `/patients` CRUD lifecycle (Create $\rightarrow$ Get All $\rightarrow$ Get By ID $\rightarrow$ Update $\rightarrow$ Delete).
  - Authenticated `/tracking`, `/planner`, `/dashboard/stats`, `/reports`.
  - Latency and HTTP status code contract assertions ($< 3500$ ms response time).

### 2.3 Best Approach for Selenium E2E Testing
- **Framework**: `selenium` with Headless Chrome in GitHub Actions (`--headless=new`, `--no-sandbox`, `--disable-dev-shm-usage`, `--window-size=1920,1080`).
- **Target**: **REAL deployed GitHub Pages** (`https://lakshmiankal.github.io/GlycoGuard-AI/auth.html` and pages in `frontend/`).
- **Scope**:
  - **Auth Page Flow**:
    - Verify page title, header, logo, and form elements.
    - Switch tabs: Login $\rightarrow$ Register $\rightarrow$ Forgot Password.
    - Perform live user login with valid credentials against the Render backend.
    - Verify redirection to `frontend/dashboard.html` and token persistence in `localStorage`.
  - **Dashboard Page Flow**:
    - Verify greeting message, KPI counter cards (`patientCount`, `predictionCount`), navigation sidebar.
  - **Patients Management Flow**:
    - Navigate to `frontend/patients.html`.
    - Fill out patient form (Name, Age, Gender, Height, Weight), verify auto-calculated BMI.
    - Submit patient and verify new row insertion in table.
  - **AI Prediction Page Flow**:
    - Navigate to `frontend/prediction.html`.
    - Fill out clinical metrics (Glucose, BP, BMI, Age, Insulin, DPF, Lifestyle).
    - Click "Predict Risk Now", verify result badge, probability gauge update, and recommendation box.
  - **AI Planner & Tracking Page Flow**:
    - Navigate to `frontend/planner.html` and `frontend/tracking.html`, verify form submissions.

### 2.4 Best Approach for Vulnerability & Security Testing
- **Static Application Security Testing (SAST)**:
  - `bandit` scanning all Python source code in `backend/` for hardcoded secrets, SQL injection vulnerabilities, unsafe imports, and insecure hashes.
- **Software Composition Analysis (SCA)**:
  - `pip-audit` / `safety` scanning `backend/requirements.txt` for known CVEs.
- **Dynamic Security & Penetration Checks (DAST / API Security)**:
  - **Auth Bypass Prevention**: Verify that calling protected endpoints (`/patients`, `/dashboard/stats`, `/planner`, `/tracking`, `/reports`) without `Authorization` header returns `401 Unauthorized`.
  - **JWT Tampering**: Verify that sending an invalid or forged JWT signature returns `401 Unauthorized`.
  - **SQL Injection Resilience**: Submit SQL injection payloads (e.g. `' OR '1'='1`) into `/login`, `/patients`, and `/forgot-password/direct-reset` to verify parameterized query safety.
  - **XSS Sanitization**: Submit `<script>alert('xss')</script>` in patient name and verify no script execution occurs.
  - **CORS Headers Check**: Verify `Access-Control-Allow-Origin` headers on backend responses.

---

## 3. XLSX Test Report Architecture

A dedicated Python script (`tests/generate_excel_report.py`) will capture structured results from all test suites and compile a professionally formatted Excel spreadsheet:

### 3.1 Required Columns in the XLSX Report:
1. **Test Case ID** (e.g., `TC-UNIT-001`, `TC-API-004`, `TC-E2E-002`, `TC-SEC-003`)
2. **Test Type** (`Unit Test`, `API Test`, `Selenium E2E Test`, `Security/Vulnerability Test`)
3. **Test Description** (Clear explanation of the test objective)
4. **Expected Result** (Specific expected response code, DOM element, or security rule)
5. **Actual Result** (Observed status code, returned data, UI state)
6. **Status** (`PASS` or `FAIL` with colored fill: Green `#D1FAE5` / Red `#FEE2E2`)
7. **Execution Time** (Duration in seconds / milliseconds)
8. **Failure Details** (Exception message, traceback, or `N/A`)

### 3.2 Excel Summary Sheet & KPIs:
- Total Test Cases Executed, Passed, Failed, Total Duration.
- High-level status banner (`ALL SYSTEMS OPERATIONAL` or `ISSUES DETECTED`).
- Styled headers with dark blue theme (`#0F172A`), white text, auto-fitted columns, borders, and filters.

---

## 4. Proposed Changes & File Additions

### [NEW] Test Suite & Report Generator Files
- [NEW] [tests/test_unit.py](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/tests/test_unit.py): Unit tests for ML inference math, JWT generation/verification, BMI calculation, and data validation.
- [NEW] [tests/test_api_deployed.py](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/tests/test_api_deployed.py): Live API test suite targeting `https://glycoguard-api.onrender.com`.
- [NEW] [tests/test_selenium_e2e.py](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/tests/test_selenium_e2e.py): Headless Chrome Selenium test suite targeting `https://lakshmiankal.github.io/GlycoGuard-AI/`.
- [NEW] [tests/test_security_vulnerability.py](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/tests/test_security_vulnerability.py): Security scan suite (SAST runner, dependency audit, Auth bypass, JWT tampering, SQLi/XSS resilience).
- [NEW] [tests/test_runner.py](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/tests/test_runner.py): Orchestrates all test suites, logs detailed metrics, and saves JSON execution summary.
- [NEW] [tests/generate_excel_report.py](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/tests/generate_excel_report.py): Reads execution results, builds formatted XLSX workbook with `openpyxl`, and outputs GitHub Markdown summary.
- [NEW] [requirements-test.txt](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/requirements-test.txt): Test execution dependencies (`pytest`, `requests`, `selenium`, `webdriver-manager`, `openpyxl`, `bandit`, `pip-audit`).

### [NEW] GitHub Actions CI/CD Pipeline
- [NEW] [.github/workflows/ci_cd_tests.yml](file:///c:/Users/ankal/Desktop/per%20diabates%20perdication/.github/workflows/ci_cd_tests.yml):
  - **Triggers**: `on: [push, pull_request]` on `main` branch (plus `workflow_dispatch` for manual runs).
  - **Runner**: `ubuntu-latest` with Python 3.11 and Google Chrome.
  - **Steps**:
    1. Checkout repository.
    2. Set up Python 3.11 with pip caching.
    3. Install backend and testing dependencies (`requirements.txt` + `requirements-test.txt`).
    4. Install Google Chrome for headless Selenium execution.
    5. Execute Master Test Runner (`python tests/test_runner.py`):
       - Phase 1: Unit Tests
       - Phase 2: Live Render API Tests
       - Phase 3: Live GitHub Pages Selenium E2E Tests
       - Phase 4: Security & Vulnerability Tests
    6. Generate XLSX Test Report (`python tests/generate_excel_report.py`).
    7. Upload XLSX report as GitHub Actions Artifact using `actions/upload-artifact@v4`.
    8. Write rich markdown test summary to `$GITHUB_STEP_SUMMARY`.
    9. Assert overall PASS/FAIL condition and enforce pipeline pass/fail status.

---

## 5. Verification Plan

### Automated Verification
1. Run test suite locally using mock/live endpoints:
   ```bash
   python tests/test_runner.py
   python tests/generate_excel_report.py
   ```
2. Verify `GlycoGuard_CI_CD_Test_Report.xlsx` is created, correctly populated with all required columns, and formatted.
3. Validate GitHub Actions YAML syntax using action linter.

### Live Cloud Verification
1. Push code to GitHub repository `lakshmiankal/GlycoGuard-AI`.
2. Inspect GitHub Actions tab to confirm automated workflow trigger.
3. Verify all 4 test phases execute, XLSX artifact is generated and downloadable, and Step Summary renders correctly.
