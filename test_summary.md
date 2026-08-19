# 🩺 GlycoGuard AI - CI/CD Automated Test Report

### 🎯 Overall Status: ❌ **FAILED (ISSUES DETECTED)**

| Metric | Value |
| :--- | :--- |
| **Commit SHA** | `Manual-L` |
| **Branch** | `main` |
| **Total Test Duration** | **12.1s** |
| **Pass Rate** | **76.5%** |
| **Total Tests Executed** | **17** (Passed: 13, Failed: 4, Skipped: 0) |

---

### 📊 Results Breakdown by Test Category

| Test Category | Total | Passed | Failed | Skipped | Pass Rate | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Unit Tests** | 10 | 10 | 0 | 0 | 100.0% | ✅ PASS |
| **Live API Tests (Render)** | 0 | 0 | 0 | 0 | N/A | ⚠️ NONE |
| **Selenium E2E Tests (GitHub Pages)** | 0 | 0 | 0 | 0 | N/A | ⚠️ NONE |
| **Security & Vulnerability** | 7 | 3 | 4 | 0 | 42.9% | ❌ FAIL |
| **TOTAL** | **17** | **13** | **4** | **0** | **76.5%** | ❌ **FAILED (ISSUES DETECTED)** |

### ❌ Failed Tests Breakdown

| Test ID | Test Category | Description | Failure Details |
| :--- | :--- | :--- | :--- |
| `TC-SEC-001` | Security/Vulnerability Test | Execute Bandit SAST scan on backend source code to detect high-severity vulnerabilities. | `Failed: tests\test_security_vulnerability.py:32: AssertionError` |
| `TC-SEC-003` | Security/Vulnerability Test | Verify live protected endpoints reject requests lacking Authorization header with HTTP 401. | `Failed: tests\test_security_vulnerability.py:67: AssertionError` |
| `TC-SEC-004` | Security/Vulnerability Test | Verify live backend rejects tampered or forged JWT signatures with HTTP 401. | `Failed: tests\test_security_vulnerability.py:81: AssertionError` |
| `TC-SEC-007` | Security/Vulnerability Test | Verify backend includes CORS headers allowing secure browser API interaction. | `Failed: tests\test_security_vulnerability.py:138: AssertionError` |

📥 **Artifacts Generated**: `GlycoGuard_CI_CD_Test_Report.xlsx` is uploaded as an artifact in this workflow run.
