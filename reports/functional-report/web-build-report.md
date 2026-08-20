# GlycoGuard AI - Web Build / Application Functional Validation Quality Assurance Report

**Generated:** 2026-08-20 10:55:22

## Executive Summary

| Metric | Value |
| :--- | :--- |
| **Total Test Cases** | 38 |
| **PASSED** | 38 (100.0%) |
| **FAILED** | 0 |
| **BLOCKED** | 0 |
| **NOT EXECUTED** | 0 |

## Detailed Test Cases

| Test ID | Test Name | Objective | Status | Expected | Actual |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `TC-FUNC-001` | Build Script Execution | Execute build_www.py without error | ✅ PASS | Return code 0 | Code 0 |
| `TC-FUNC-002` | www/index.html Presence | Verify www/index.html bundled | ✅ PASS | File exists > 1KB | 65166 bytes |
| `TC-FUNC-003` | www/css/app.css Presence | Verify www/css/app.css bundled | ✅ PASS | File exists > 1KB | 33754 bytes |
| `TC-FUNC-004` | www/js/app.js Presence | Verify www/js/app.js bundled | ✅ PASS | File exists > 1KB | 62401 bytes |
| `TC-FUNC-005` | www/js/config.js Presence | Verify www/js/config.js bundled | ✅ PASS | File exists > 500B | 3876 bytes |
| `TC-FUNC-006` | Android index.html Sync | Verify Android index matches root exactly | ✅ PASS | Exact match | 100% Match |
| `TC-FUNC-007` | Android css/app.css Sync | Verify Android CSS matches root exactly | ✅ PASS | Exact match | 100% Match |
| `TC-FUNC-008` | Android js/app.js Sync | Verify Android JS matches root exactly | ✅ PASS | Exact match | 100% Match |
| `TC-FUNC-009` | mobile/index.html Alias Sync | Verify mobile/index.html matches single source of truth | ✅ PASS | Exact match | 100% Match |
| `TC-FUNC-010` | auth.html Alias Sync | Verify root auth.html is in sync with index.html | ✅ PASS | Exact match | 100% Match |
| `TC-FUNC-011` | ML Model Pickle Deserialization | Load model.pkl and verify predict methods | ✅ PASS | Model loaded | Type: RandomForestClassifier |
| `TC-FUNC-012` | ML Model Benchmark Classification | Evaluate clinical sample with trained model | ✅ PASS | Valid probability score | Risk Prob: 0.71 |
| `TC-FUNC-013` | Clinical Datasets Integrity | Verify raw and cleaned diabetes CSV datasets exist | ✅ PASS | Both datasets present | Present |
| `TC-FUNC-014` | Model Evaluation Artifact | Verify confusion matrix chart PNG exists | ✅ PASS | PNG artifact present | 15209 bytes |
| `TC-FUNC-015` | Cloud Procfile Configuration | Verify Procfile specifies gunicorn entrypoint | ✅ PASS | web: gunicorn wsgi:app | web: gunicorn --chdir backend app:app -- |
| `TC-FUNC-016` | render.yaml Manifest Validity | Verify render deployment manifest | ✅ PASS | Valid manifest | Valid |
| `TC-FUNC-017` | package.json Build Scripts | Verify package.json build script configured | ✅ PASS | Build script present | Present |
| `TC-FUNC-018` | Capacitor App Dependencies | Verify Capacitor android dependency declared | ✅ PASS | Capacitor present | Present |
| `TC-FUNC-019` | Frontend Redirect: dashboard.html | Verify legacy dashboard redirect | ✅ PASS | Redirect configured | Configured |
| `TC-FUNC-020` | Frontend Redirect: prediction.html | Verify legacy prediction redirect | ✅ PASS | Redirect configured | Configured |
| `TC-FUNC-021` | Frontend Redirect: patients.html | Verify legacy patients redirect | ✅ PASS | Redirect configured | Configured |
| `TC-FUNC-022` | Frontend Redirect: tracking.html | Verify legacy tracking redirect | ✅ PASS | Redirect configured | Configured |
| `TC-FUNC-023` | Frontend Redirect: planner.html | Verify legacy planner redirect | ✅ PASS | Redirect configured | Configured |
| `TC-FUNC-024` | Frontend Redirect: analytics.html | Verify legacy analytics redirect | ✅ PASS | Redirect configured | Configured |
| `TC-FUNC-025` | Frontend Redirect: reports.html | Verify legacy reports redirect | ✅ PASS | Redirect configured | Configured |
| `TC-FUNC-026` | Backend Blueprint: auth.py | Verify auth blueprint exists | ✅ PASS | File exists | Exists |
| `TC-FUNC-027` | Backend Blueprint: prediction.py | Verify prediction blueprint exists | ✅ PASS | File exists | Exists |
| `TC-FUNC-028` | Backend Blueprint: patient.py | Verify patient blueprint exists | ✅ PASS | File exists | Exists |
| `TC-FUNC-029` | Backend Blueprint: tracking.py | Verify tracking blueprint exists | ✅ PASS | File exists | Exists |
| `TC-FUNC-030` | Backend Blueprint: planner.py | Verify planner blueprint exists | ✅ PASS | File exists | Exists |
| `TC-FUNC-031` | Backend Blueprint: reports.py | Verify reports blueprint exists | ✅ PASS | File exists | Exists |
| `TC-FUNC-032` | Backend Blueprint: dashboard.py | Verify dashboard blueprint exists | ✅ PASS | File exists | Exists |
| `TC-FUNC-033` | Backend Live /health Verification | Verify backend responds with v2.0 | ✅ PASS | version 2.0 | v2.0 |
| `TC-FUNC-034` | Live Signup & JWT Generation | Verify live JWT issue from backend | ✅ PASS | JWT issued | Issued |
| `TC-FUNC-035` | Live Prediction ML Pipeline | Verify live end-to-end prediction response | ✅ PASS | HTTP 200 | HTTP 200 |
| `TC-FUNC-036` | Live Dashboard Metrics Fetch | Verify live dashboard statistics endpoint | ✅ PASS | HTTP 200 | HTTP 200 |
| `TC-FUNC-037` | Static Web Server Asset Serving | Verify HTTP 200 on index.html serving | ✅ PASS | HTTP 200 | HTTP 200 |
| `TC-FUNC-038` | End-to-End System Operational Integrity | Complete end-to-end operational check | ✅ PASS | All components operational | Operational |
