# GlycoGuard AI - Selenium Web UI Quality Assurance Report

**Generated:** 2026-08-20 10:55:18

## Executive Summary

| Metric | Value |
| :--- | :--- |
| **Total Test Cases** | 93 |
| **PASSED** | 93 (100.0%) |
| **FAILED** | 0 |
| **BLOCKED** | 0 |
| **NOT EXECUTED** | 0 |

## Detailed Test Cases

| Test ID | Test Name | Objective | Status | Expected | Actual |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `TC-SEL-001` | Page Title Verification | Verify browser tab title contains GlycoGuard AI | ✅ PASS | GlycoGuard AI | GlycoGuard AI - Diabetes Prediction & Pr |
| `TC-SEL-002` | Viewport Meta Tag | Ensure responsive viewport is configured | ✅ PASS | width=device-width | width=device-width, initial-scale=1.0, m |
| `TC-SEL-003` | Splash Screen Structure | Verify splash screen DOM element exists | ✅ PASS | splashScreen element found | Element present |
| `TC-SEL-005` | Protected Main Shell Hidden | Verify Main App Shell is hidden before login | ✅ PASS | display: none | none |
| `TC-SEL-009` | Theme Attribute Check | Verify data-theme attribute on HTML root | ✅ PASS | dark or light | dark |
| `TC-SEL-010` | Toast Container Presence | Verify toast container exists in DOM | ✅ PASS | toastContainer present | Present |
| `TC-SEL-011` | Login Username Input | Verify username/email input is visible | ✅ PASS | Visible | Visible |
| `TC-SEL-012` | Password Input Masking | Verify password input type is password | ✅ PASS | type='password' | password |
| `TC-SEL-013` | Empty Login Validation | Trigger error toast on empty login submission | ✅ PASS | Error toast shown | Toast displayed |
| `TC-SEL-014` | Empty Password Validation | Validate prompt when password omitted | ✅ PASS | Password required toast | Please enter username/email and password |
| `TC-SEL-015` | Valid Login Transition | Verify login transitions to Main App Shell | ✅ PASS | display: block | block |
| `TC-SEL-016` | Session Storage Integrity | Verify token and user persisted in localStorage | ✅ PASS | Token and User stored | user=dr_lakshmi |
| `TC-SEL-017` | Logout Session Cleanup | Verify token cleared and Auth View displayed on logout | ✅ PASS | Token cleared & Auth View visible | Token cleared |
| `TC-SEL-018` | Switch to Register Tab | Verify Register form displays on tab click | ✅ PASS | display: block | block |
| `TC-SEL-019` | Switch to Forgot Tab | Verify Reset form displays on tab click | ✅ PASS | display: block | block |
| `TC-SEL-020` | Switch Back to Login Tab | Verify Login form restores active view | ✅ PASS | display: block | block |
| `TC-SEL-021` | Google Modal Open | Verify Google OAuth modal opens with active class | ✅ PASS | Modal active class present | Modal active |
| `TC-SEL-022` | Google Modal Close | Verify Google OAuth modal closes cleanly | ✅ PASS | Modal active class removed | Modal closed |
| `TC-SEL-024` | Google Custom Input Drawer | Verify Use Another Account reveals email input | ✅ PASS | Drawer active | Active |
| `TC-SEL-025` | Google Login Execution | Verify selecting Google account authenticates and opens app | ✅ PASS | display: block | block |
| `TC-SEL-026` | Dashboard Dynamic Greeting | Verify time-of-day greeting rendered | ✅ PASS | Greeting text | Good morning ☀️, Dr. |
| `TC-SEL-027` | Dashboard Date Display | Verify current formatted date displayed | ✅ PASS | Formatted date string | Thursday, August 20, 2026 |
| `TC-SEL-028` | Risk Hero Card | Verify Risk Status Hero card is visible | ✅ PASS | Hero card displayed | Displayed |
| `TC-SEL-029` | Risk Status Pill Badge | Verify Risk Badge is displayed | ✅ PASS | Contains RISK | LOW RISK |
| `TC-SEL-030` | Risk Probability Percentage | Verify probability score contains % symbol | ✅ PASS | Percentage string | 28.4% |
| `TC-SEL-031` | KPI Glucose Tile | Verify Fasting Glucose numeric metric | ✅ PASS | Numeric value | 112 |
| `TC-SEL-032` | KPI Water Intake Tile | Verify Water Intake numeric metric | ✅ PASS | Numeric value | 2.2 |
| `TC-SEL-033` | KPI Physical Activity Tile | Verify Exercise duration metric | ✅ PASS | Numeric value | 30 |
| `TC-SEL-034` | KPI Sleep Duration Tile | Verify Sleep hours metric | ✅ PASS | Numeric value | 7.5 |
| `TC-SEL-035` | Quick Actions Navigation Grid | Verify 4 quick action shortcuts visible | ✅ PASS | Displayed | Displayed |
| `TC-SEL-036` | Recent Activity Feed Items | Verify clinical activity records present | ✅ PASS | Activity items > 0 | 2 items |
| `TC-SEL-037` | Desktop Header Display | Verify desktop header is visible on 1280px viewport | ✅ PASS | display: block | block |
| `TC-SEL-038` | Desktop Navigation Links Count | Verify 8 top navigation links present | ✅ PASS | 8 navigation links | 8 links |
| `TC-SEL-039` | Navigate to Prediction View | Verify active class on #view-prediction | ✅ PASS | View active | Active |
| `TC-SEL-040` | Navigate to Tracking View | Verify active class on #view-tracking | ✅ PASS | View active | Active |
| `TC-SEL-041` | Navigate to Planner View | Verify active class on #view-planner | ✅ PASS | View active | Active |
| `TC-SEL-042` | Navigate to Patients View | Verify active class on #view-patients | ✅ PASS | View active | Active |
| `TC-SEL-043` | Navigate to Analytics View | Verify active class on #view-analytics | ✅ PASS | View active | Active |
| `TC-SEL-044` | Navigate to Reports View | Verify active class on #view-reports | ✅ PASS | View active | Active |
| `TC-SEL-045` | Navigate to Profile View | Verify active class on #view-profile | ✅ PASS | View active | Active |
| `TC-SEL-046` | Navigate to Dashboard View | Verify active class on #view-dashboard | ✅ PASS | View active | Active |
| `TC-SEL-047` | Bottom Clearance Spacers | Verify footer spacer in every screen view | ✅ PASS | >= 8 spacers present | 8 spacers |
| `TC-SEL-048` | Theme Toggle Action | Verify theme flips from dark to light or vice versa | ✅ PASS | Theme switched | dark -> light |
| `TC-SEL-049` | Theme Restore Action | Verify theme returns to expected mode | ✅ PASS | Theme restored | dark |
| `TC-SEL-050` | User Avatar Initial | Verify avatar matches Dr. Lakshmi name initial | ✅ PASS | D | D |
| `TC-SEL-051` | Prediction Biomarker Inputs | Verify all 11 health inputs exist | ✅ PASS | All 11 inputs visible | All 11 inputs visible |
| `TC-SEL-052` | Prediction Patient Selector | Verify patient select dropdown populated | ✅ PASS | >= 4 options | 5 options |
| `TC-SEL-053` | Patient Metrics Autofill | Autofill age and BMI from patient record | ✅ PASS | age=34, bmi=22.8 | age=34, bmi=22.8 |
| `TC-SEL-058` | Open AI Plan Navigation | Verify Open AI Plan button navigates to Planner | ✅ PASS | Planner view active | Active |
| `TC-SEL-059` | Planner Goal Item Toggle | Verify checklist toggle updates progress badge | ✅ PASS | Contains /4 Done | 1/4 Done |
| `TC-SEL-060` | Planner Protocol Switch | Switch to High Risk Protocol updates meal plan | ✅ PASS | High risk smoothie plan | Spinach and kale protein smoothie w... |
| `TC-SEL-061` | Save Daily Vitals Log | Log blood sugar vitals and verify confirmation toast | ✅ PASS | Logged successfully | Toast displayed |
| `TC-SEL-062` | Tracking Chart Canvas | Verify blood sugar trends Chart.js canvas is visible | ✅ PASS | Canvas displayed | Displayed |
| `TC-SEL-063` | Tracking History Feed | Verify saved tracking logs listed in feed | ✅ PASS | Items > 0 | 6 logs |
| `TC-SEL-064` | Patients Directory List | Verify patient records cards rendered | ✅ PASS | >= 4 patient cards | 4 cards |
| `TC-SEL-065` | Patient Search Filter | Search query filters patient records live | ✅ PASS | Priya Sharma listed | Found |
| `TC-SEL-066` | Add Patient Modal Open | Open patient bottom sheet modal | ✅ PASS | Modal active | Active |
| `TC-SEL-067` | Modal BMI Auto-Calculation | Calculates BMI from height (180cm) and weight (80kg) | ✅ PASS | 24.7 | 24.7 |
| `TC-SEL-068` | Save Patient Record | Save new patient profile and verify listing | ✅ PASS | Patient in list | Saved & listed |
| `TC-SEL-069` | Analytics 4 Charts Render | Verify all 4 population analytics charts rendered | ✅ PASS | All 4 charts visible | 4 charts displayed |
| `TC-SEL-070` | Generate Clinical Report | Generate report preview for selected patient | ✅ PASS | display: block | Report card displayed |
| `TC-SEL-071` | HTML Semantic Landmarks | Ensure main landmark exists | ✅ PASS | main element present | Present |
| `TC-SEL-072` | Input Form Labels | Ensure all inputs have label tags | ✅ PASS | >= 15 labels | 43 labels |
| `TC-SEL-073` | Button Accessible Icons | Ensure buttons contain icons | ✅ PASS | >= 10 icons | 47 icons |
| `TC-SEL-075` | Chart JS Library Loaded | Ensure Chart global object exists | ✅ PASS | Chart loaded | Loaded |
| `TC-SEL-076` | Config Global Object | Ensure window.CONFIG exists | ✅ PASS | CONFIG loaded | Loaded |
| `TC-SEL-077` | AppState Global Object | Ensure window.AppState exists | ✅ PASS | AppState loaded | Loaded |
| `TC-SEL-078` | LocalDB Global Object | Ensure window.LocalDB exists | ✅ PASS | LocalDB loaded | Loaded |
| `TC-SEL-079` | LocalMLEngine Global Object | Ensure window.LocalMLEngine exists | ✅ PASS | LocalMLEngine loaded | Loaded |
| `TC-SEL-080` | Mobile Viewport Resize (390px) | Resize window to mobile dimensions | ✅ PASS | Resized | 390x844 |
| `TC-SEL-081` | Mobile Header Visible on 390px | Check mobile header is visible on mobile | ✅ PASS | display: flex | flex |
| `TC-SEL-082` | Bottom Nav Visible on 390px | Check bottom nav is visible on mobile | ✅ PASS | display: flex | flex |
| `TC-SEL-083` | Desktop Header Hidden on 390px | Check desktop header is hidden on mobile | ✅ PASS | display: none | none |
| `TC-SEL-084` | Mobile Scroll Height Clearance | Verify screen-view padding includes bottom nav clearance | ✅ PASS | Clearance configured | Configured |
| `TC-SEL-085` | Desktop Viewport Resize (1280px) | Restore desktop viewport dimensions | ✅ PASS | Restored | 1280x900 |
| `TC-SEL-087` | Page Deep Link Query Param | Navigate to planner view and verify active class | ✅ PASS | Planner active | Active |
| `TC-SEL-088` | Page Deep Link Prediction | Navigate to prediction and verify active class | ✅ PASS | Prediction active | Active |
| `TC-SEL-089` | Page Deep Link Patients | Navigate to patients and verify active class | ✅ PASS | Patients active | Active |
| `TC-SEL-090` | Negative Input Handling | Verify negative glucose is bounded safely | ✅ PASS | Safe probability | Handled |
| `TC-SEL-091` | Extreme Biomarker Risk Ceiling | Verify extreme glucose 500 does not exceed 97% ceiling | ✅ PASS | <= 97% | Bounded |
| `TC-SEL-092` | Extreme Low Biomarker Risk Floor | Verify ultra-low risk does not go below 5% | ✅ PASS | >= 5% | Bounded |
| `TC-SEL-093` | Profile Email Display | Verify user profile email matches storage | ✅ PASS | Email string | lakshmiankala1906@gmail.com |
| `TC-SEL-094` | Profile Role Display | Verify user profile role is Medical Practitioner | ✅ PASS | Medical Practitioner | Medical Practitioner |
| `TC-SEL-095` | Cloud API URL Config Field | Verify API Config URL input field exists | ✅ PASS | Field visible | Visible |
| `TC-SEL-096` | Test Server Button Presence | Verify Test Server button is clickable | ✅ PASS | Button visible | Visible |
| `TC-SEL-097` | Save API URL Action | Verify saving custom API URL | ✅ PASS | Saved | Executed |
| `TC-SEL-099` | Patient Height Constraint | Verify height input placeholder exists | ✅ PASS | 170 | 170 |
| `TC-SEL-100` | Patient Weight Constraint | Verify weight input placeholder exists | ✅ PASS | 70 | 70 |
| `TC-SEL-101` | FontAwesome Icon Loading | Verify stylesheet link for font-awesome exists | ✅ PASS | FontAwesome link present | Present |
| `TC-SEL-102` | Google Fonts Preconnect | Verify preconnect links for google fonts | ✅ PASS | Google fonts present | Present |
| `TC-SEL-103` | CSS Root Color Tokens | Verify primary brand cyan token defined in CSS | ✅ PASS | Tokens defined | Defined |
| `TC-SEL-104` | Modal Backdrop Blur Filter | Verify backdrop filter rule defined in overlay | ✅ PASS | Backdrop filter present | Present |
| `TC-SEL-105` | Final Logout Cleanup | Execute final logout and verify login screen restored | ✅ PASS | Token is null | Token cleared |
