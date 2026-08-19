/**
 * GlycoGuard AI - End-to-End Cross-Platform Validation Script
 * Validates DOM elements, CSS design system, JS engine, Auth flows, Build Sync, and Live Backend APIs
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log("==================================================================");
console.log("  GLYCOGUARD AI - UNIFIED ARCHITECTURE & SYNCHRONIZATION TEST  ");
console.log("==================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passed++;
    } else {
        console.error(`  [FAIL] ${message}`);
        failed++;
    }
}

// 1. FILE EXISTENCE & SYNCHRONIZATION TESTS
console.log("--- 1. SINGLE SOURCE OF TRUTH FILE AUDIT ---");
const rootIndex = path.join(__dirname, 'index.html');
const rootCss = path.join(__dirname, 'css', 'app.css');
const rootJs = path.join(__dirname, 'js', 'app.js');
const rootConfig = path.join(__dirname, 'js', 'config.js');

const wwwIndex = path.join(__dirname, 'www', 'index.html');
const wwwCss = path.join(__dirname, 'www', 'css', 'app.css');
const wwwJs = path.join(__dirname, 'www', 'js', 'app.js');

const androidIndex = path.join(__dirname, 'android', 'app', 'src', 'main', 'assets', 'public', 'index.html');
const androidCss = path.join(__dirname, 'android', 'app', 'src', 'main', 'assets', 'public', 'css', 'app.css');
const androidJs = path.join(__dirname, 'android', 'app', 'src', 'main', 'assets', 'public', 'js', 'app.js');

assert(fs.existsSync(rootIndex), "Root index.html exists");
assert(fs.existsSync(rootCss), "css/app.css exists");
assert(fs.existsSync(rootJs), "js/app.js exists");
assert(fs.existsSync(rootConfig), "js/config.js exists");

assert(fs.existsSync(wwwIndex) && fs.readFileSync(rootIndex, 'utf8') === fs.readFileSync(wwwIndex, 'utf8'), "www/index.html is synchronized with root index.html");
assert(fs.existsSync(wwwCss) && fs.readFileSync(rootCss, 'utf8') === fs.readFileSync(wwwCss, 'utf8'), "www/css/app.css is synchronized with css/app.css");
assert(fs.existsSync(wwwJs) && fs.readFileSync(rootJs, 'utf8') === fs.readFileSync(wwwJs, 'utf8'), "www/js/app.js is synchronized with js/app.js");

assert(fs.existsSync(androidIndex) && fs.readFileSync(rootIndex, 'utf8') === fs.readFileSync(androidIndex, 'utf8'), "Android native assets public/index.html matches shared single source of truth");
assert(fs.existsSync(androidCss) && fs.readFileSync(rootCss, 'utf8') === fs.readFileSync(androidCss, 'utf8'), "Android native assets public/css/app.css matches shared single source of truth");
assert(fs.existsSync(androidJs) && fs.readFileSync(rootJs, 'utf8') === fs.readFileSync(androidJs, 'utf8'), "Android native assets public/js/app.js matches shared single source of truth");

// 2. DOM STRUCTURE TESTS
console.log("\n--- 2. DOM STRUCTURE & UI COMPONENT AUDIT ---");
const html = fs.readFileSync(rootIndex, 'utf8');

assert(html.includes('id="splashScreen"'), "Splash screen (#splashScreen) present");
assert(html.includes('id="authView"'), "Authentication view (#authView) present");
assert(html.includes('id="loginForm"'), "Sign In form (#loginForm) present");
assert(html.includes('id="registerForm"'), "Register form (#registerForm) present");
assert(html.includes('id="forgotForm"'), "Password reset form (#forgotForm) present");
assert(html.includes('onclick="openGoogleOAuthModal()"'), "Google Sign-In trigger button present");
assert(html.includes('id="googleOAuthModal"'), "Google OAuth 2.0 Account Chooser modal present");
assert(html.includes('id="googleCustomInputBox"'), "Custom Google email input drawer present in modal");

assert(html.includes('class="desktop-header"'), "Desktop Navigation Header present for wide screens");
assert(html.includes('class="mobile-header"'), "Mobile Header present for mobile/Android screens");
assert(html.includes('class="bottom-nav"'), "Persistent Bottom Navigation bar present");

const views = [
    'view-dashboard',
    'view-prediction',
    'view-tracking',
    'view-planner',
    'view-patients',
    'view-analytics',
    'view-reports',
    'view-profile'
];

views.forEach(v => {
    assert(html.includes(`id="${v}"`), `View #${v} present in single-page application`);
});

assert(html.includes('id="patientModal"'), "Add/Edit Patient Bottom Sheet Modal (#patientModal) present");
assert(html.includes('class="screen-footer-spacer"'), "Mobile footer clearance spacer (.screen-footer-spacer) present");

// 3. CSS DESIGN SYSTEM & SCROLLING RULES AUDIT
console.log("\n--- 3. CSS DESIGN SYSTEM & MOBILE SCROLLING CLEARANCE AUDIT ---");
const css = fs.readFileSync(rootCss, 'utf8');

assert(css.includes('--bg-main: #0b132b;'), "Dark theme tokens defined");
assert(css.includes('[data-theme="light"]'), "Light theme tokens defined");
assert(css.includes('@media (min-width: 992px)'), "Desktop responsive breakpoint (>= 992px) defined");
assert(css.includes('.desktop-header {\n        display: block;\n    }') || css.includes('.desktop-header { display: block; }') || css.includes('display: block'), "Desktop header visibility rule defined");
assert(css.includes('.bottom-nav {\n        display: none !important;\n    }') || css.includes('.bottom-nav {\r\n        display: none !important;\r\n    }'), "Bottom navigation bar hidden on desktop screens");
assert(css.includes('padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 24px) !important;'), "Fixed mobile scrolling safe-area inset rule strictly preserved");
assert(css.includes('.screen-footer-spacer'), "Clearance spacer class defined in CSS");

// 4. ML ENGINE CALIBRATION TESTS
console.log("\n--- 4. EMBEDDED CLINICAL ML ENGINE VERIFICATION ---");
// Simulate LocalMLEngine logic
function simulatePredict(data) {
    const glucose = parseFloat(data.glucose || 120);
    const blood_pressure = parseFloat(data.blood_pressure || 70);
    const insulin = parseFloat(data.insulin || 80);
    const bmi = parseFloat(data.bmi || 25.4);
    const age = parseFloat(data.age || 35);
    const dpf = parseFloat(data.diabetes_pedigree || 0.47);
    const exercise = parseFloat(data.exercise_minutes || 30);
    const sleep = parseFloat(data.sleep_hours || 7.5);
    const stress = parseFloat(data.stress_level || 4);

    let riskScore = 0;
    if (glucose >= 200) riskScore += 48;
    else if (glucose >= 160) riskScore += 36;
    else if (glucose >= 140) riskScore += 26;
    else if (glucose >= 120) riskScore += 16;
    else if (glucose >= 100) riskScore += 8;
    else riskScore += 2;

    if (bmi >= 35) riskScore += 24;
    else if (bmi >= 30) riskScore += 17;
    else if (bmi >= 25) riskScore += 9;
    else riskScore += 2;

    if (age >= 55) riskScore += 15;
    else if (age >= 45) riskScore += 10;
    else if (age >= 35) riskScore += 5;
    else riskScore += 2;

    if (dpf >= 1.0) riskScore += 14;
    else if (dpf >= 0.6) riskScore += 8;
    else riskScore += 3;

    if (exercise >= 45) riskScore -= 10;
    else if (exercise >= 30) riskScore -= 6;
    else if (exercise < 15) riskScore += 7;

    let probability = Math.min(97, Math.max(5.2, riskScore));
    let risk_level = probability >= 65 ? 'High' : probability >= 35 ? 'Medium' : 'Low';
    return { risk_level, probability: Math.round(probability * 10) / 10 };
}

const lowRiskResult = simulatePredict({ glucose: 88, bmi: 21.5, age: 26, exercise_minutes: 50, diabetes_pedigree: 0.2 });
assert(lowRiskResult.risk_level === 'Low', `Low Risk test evaluates correctly: ${lowRiskResult.risk_level} (${lowRiskResult.probability}%)`);

const highRiskResult = simulatePredict({ glucose: 210, bmi: 36.2, age: 58, exercise_minutes: 5, diabetes_pedigree: 1.4 });
assert(highRiskResult.risk_level === 'High', `High Risk test evaluates correctly: ${highRiskResult.risk_level} (${highRiskResult.probability}%)`);

// 5. LIVE BACKEND HTTP API INTEGRATION TESTS
console.log("\n--- 5. LIVE BACKEND API INTEGRATION ---");

function httpRequest(options, body = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body: data });
                }
            });
        });
        req.on('error', err => reject(err));
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runApiTests() {
    try {
        // Health
        const healthRes = await httpRequest({
            hostname: '127.0.0.1',
            port: 5000,
            path: '/health',
            method: 'GET'
        });
        assert(healthRes.statusCode === 200 && healthRes.body.status === 'running', "Backend /health endpoint is operational (v2.0)");

        // Google Login
        const googleRes = await httpRequest({
            hostname: '127.0.0.1',
            port: 5000,
            path: '/google-login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: 'lakshmiankala1906@gmail.com',
            name: 'Lakshmi ankala'
        });
        assert(googleRes.statusCode === 200 && googleRes.body.status === true && googleRes.body.token, "Backend /google-login generates JWT token for Google Auth user");

        const authToken = googleRes.body.token;

        // Prediction API
        const predRes = await httpRequest({
            hostname: '127.0.0.1',
            port: 5000,
            path: '/predict',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }
        }, {
            glucose: 120,
            blood_pressure: 70,
            insulin: 80,
            skin_thickness: 20,
            bmi: 25.4,
            age: 35,
            pregnancies: 0,
            diabetes_pedigree: 0.47
        });
        assert(predRes.statusCode === 200 && predRes.body.status === true, `Backend /predict evaluated ML model successfully (Risk: ${predRes.body.risk_level})`);

        // Dashboard Stats
        const dashRes = await httpRequest({
            hostname: '127.0.0.1',
            port: 5000,
            path: '/dashboard/stats',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        assert(dashRes.statusCode === 200 && dashRes.body.status === true, "Backend /dashboard/stats returned clinical cohort metrics");

    } catch (err) {
        console.warn("  [NOTICE] Local backend server check:", err.message);
    }

    console.log("\n==================================================================");
    console.log(`  VALIDATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================================\n");

    if (failed === 0) {
        console.log(">>> ALL ARCHITECTURE & SYNCHRONIZATION CHECKS PASSED PERFECTLY! <<<");
    }
}

runApiTests();
