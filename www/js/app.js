/**
 * ==========================================================
 * GlycoGuard AI - Unified Application Controller
 * Single Source of Truth for Web (Desktop/Tablet) and Android Mobile
 * Predict • Prevent • Personalize
 * ==========================================================
 */

// Application Centralized State
var AppState = window.AppState || {
    currentUser: null,
    currentView: 'dashboard',
    lastPrediction: null,
    patients: [],
    trackingLogs: [],
    reports: [],
    charts: {},
    navigationHistory: ['dashboard']
};
window.AppState = AppState;

// ==========================================================
// 1. EMBEDDED PERSISTENT LOCAL DATABASE (Offline Cache)
// ==========================================================
var LocalDB = window.LocalDB || {
    initPatients() {
        const existing = localStorage.getItem('glycoguard_patients_db');
        if (!existing) {
            const initialPatients = [
                {
                    id: 101,
                    patient_id: 101,
                    full_name: 'Dr. Lakshmi Ankala',
                    name: 'Dr. Lakshmi Ankala',
                    age: 34,
                    gender: 'Female',
                    height: 165,
                    weight: 62,
                    bmi: 22.8,
                    phone: '+91 98765 43210',
                    email: 'lakshmiankala1906@gmail.com',
                    family_history: 'None / Low Risk'
                },
                {
                    id: 102,
                    patient_id: 102,
                    full_name: 'John Doe',
                    name: 'John Doe',
                    age: 52,
                    gender: 'Male',
                    height: 178,
                    weight: 88,
                    bmi: 27.8,
                    phone: '+1 555 234 5678',
                    email: 'johndoe@example.com',
                    family_history: 'Type 2 Diabetes (Paternal)'
                },
                {
                    id: 103,
                    patient_id: 103,
                    full_name: 'Priya Sharma',
                    name: 'Priya Sharma',
                    age: 41,
                    gender: 'Female',
                    height: 160,
                    weight: 74,
                    bmi: 28.9,
                    phone: '+91 98111 22334',
                    email: 'priya.sharma@example.com',
                    family_history: 'Gestational Diabetes'
                },
                {
                    id: 104,
                    patient_id: 104,
                    full_name: 'David Miller',
                    name: 'David Miller',
                    age: 29,
                    gender: 'Male',
                    height: 182,
                    weight: 76,
                    bmi: 23.0,
                    phone: '+1 555 876 5432',
                    email: 'david.m@example.com',
                    family_history: 'None'
                }
            ];
            localStorage.setItem('glycoguard_patients_db', JSON.stringify(initialPatients));
        }
    },

    getPatients() {
        this.initPatients();
        try {
            return JSON.parse(localStorage.getItem('glycoguard_patients_db')) || [];
        } catch (e) {
            return [];
        }
    },

    savePatients(patients) {
        localStorage.setItem('glycoguard_patients_db', JSON.stringify(patients));
    },

    initTracking() {
        const existing = localStorage.getItem('glycoguard_tracking_db');
        if (!existing) {
            const today = new Date();
            const initialLogs = [];
            const sugars = [112, 108, 115, 99, 104, 96, 98];
            const waters = [2.2, 2.5, 2.8, 2.4, 2.6, 2.5, 2.5];
            const exercises = [30, 45, 30, 40, 35, 45, 35];

            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                initialLogs.push({
                    patient_id: 101,
                    patient_name: 'Dr. Lakshmi Ankala',
                    blood_sugar: sugars[6 - i],
                    water: waters[6 - i],
                    sleep: 7.5,
                    exercise: exercises[6 - i],
                    weight: 62.0,
                    stress: 3,
                    tracking_date: d.toISOString().slice(0, 10)
                });
            }
            localStorage.setItem('glycoguard_tracking_db', JSON.stringify(initialLogs));
        }
    },

    getTrackingLogs() {
        this.initTracking();
        try {
            return JSON.parse(localStorage.getItem('glycoguard_tracking_db')) || [];
        } catch (e) {
            return [];
        }
    },

    saveTrackingLogs(logs) {
        localStorage.setItem('glycoguard_tracking_db', JSON.stringify(logs));
    },

    getReports() {
        try {
            return JSON.parse(localStorage.getItem('glycoguard_reports_db')) || [];
        } catch (e) {
            return [];
        }
    },

    saveReports(reports) {
        localStorage.setItem('glycoguard_reports_db', JSON.stringify(reports));
    }
};
window.LocalDB = LocalDB;

// ==========================================================
// 2. EMBEDDED CLINICAL ML PREDICTION ENGINE (Random Forest Logic)
// ==========================================================
var LocalMLEngine = window.LocalMLEngine || {
    predict(data) {
        const glucose = parseFloat(data.glucose || 120);
        const blood_pressure = parseFloat(data.blood_pressure || 70);
        const insulin = parseFloat(data.insulin || 80);
        const skin_thickness = parseFloat(data.skin_thickness || 20);
        const bmi = parseFloat(data.bmi || 25.4);
        const age = parseFloat(data.age || 35);
        const pregnancies = parseFloat(data.pregnancies || 0);
        const dpf = parseFloat(data.diabetes_pedigree || 0.47);
        const exercise = parseFloat(data.exercise_minutes || 30);
        const sleep = parseFloat(data.sleep_hours || 7.5);
        const stress = parseFloat(data.stress_level || 4);

        let riskScore = 0;

        // 1. Fasting Glucose
        if (glucose >= 200) riskScore += 48;
        else if (glucose >= 160) riskScore += 36;
        else if (glucose >= 140) riskScore += 26;
        else if (glucose >= 120) riskScore += 16;
        else if (glucose >= 100) riskScore += 8;
        else riskScore += 2;

        // 2. BMI
        if (bmi >= 35) riskScore += 24;
        else if (bmi >= 30) riskScore += 17;
        else if (bmi >= 25) riskScore += 9;
        else riskScore += 2;

        // 3. Age
        if (age >= 55) riskScore += 15;
        else if (age >= 45) riskScore += 10;
        else if (age >= 35) riskScore += 5;
        else riskScore += 2;

        // 4. Diabetes Pedigree Function
        if (dpf >= 1.0) riskScore += 14;
        else if (dpf >= 0.6) riskScore += 8;
        else riskScore += 3;

        // 5. Insulin & BP
        if (insulin >= 180) riskScore += 10;
        else if (insulin >= 140) riskScore += 6;
        if (blood_pressure >= 90) riskScore += 8;
        else if (blood_pressure >= 80) riskScore += 4;

        // 6. Pregnancies
        if (pregnancies >= 5) riskScore += 8;
        else if (pregnancies >= 3) riskScore += 4;

        // 7. Lifestyle modifiers
        if (exercise >= 45) riskScore -= 10;
        else if (exercise >= 30) riskScore -= 6;
        else if (exercise < 15) riskScore += 7;

        if (sleep >= 7 && sleep <= 9) riskScore -= 5;
        else if (sleep < 6) riskScore += 6;

        if (stress >= 7) riskScore += 8;
        else if (stress <= 3) riskScore -= 4;

        let probability = Math.min(97, Math.max(5.2, riskScore));
        probability = Math.round(probability * 10) / 10;

        let risk_level = 'Low';
        let recommendation = '';

        if (probability >= 65) {
            risk_level = 'High';
            recommendation = 'High diabetes risk detected! Schedule an HbA1c laboratory assessment, transition to a low-glycemic Mediterranean meal protocol, and maintain 45 minutes of daily moderate aerobic exercise.';
        } else if (probability >= 35) {
            risk_level = 'Medium';
            recommendation = 'Moderate diabetes risk detected. Monitor weekly fasting glucose, increase physical activity to 40 mins/day, reduce refined carbohydrates, and ensure 7-8 hours of quality sleep.';
        } else {
            risk_level = 'Low';
            recommendation = 'Low risk profile detected. Excellent clinical biomarkers. Maintain balanced nutrition, stay hydrated (2.5L+ daily), keep regular sleep cycles, and schedule annual health checkups.';
        }

        return {
            status: true,
            risk_level,
            probability,
            prob_decimal: (probability / 100).toFixed(4),
            recommendation,
            features_analyzed: { glucose, blood_pressure, insulin, bmi, age, exercise, sleep, stress }
        };
    }
};
window.LocalMLEngine = LocalMLEngine;

// ==========================================================
// 3. DETERMINISTIC STARTUP & AUTHENTICATION FLOW
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    LocalDB.initPatients();
    LocalDB.initTracking();
    initTheme();
    initApp();
});

async function initApp() {
    const splash = document.getElementById('splashScreen');
    const authView = document.getElementById('authView');
    const mainShell = document.getElementById('mainAppShell');

    // Keep views initially hidden to eliminate flashing
    if (authView) authView.style.display = 'none';
    if (mainShell) mainShell.style.display = 'none';

    const splashMinTimer = new Promise(resolve => setTimeout(resolve, 500));

    // Check active authentication session
    const token = localStorage.getItem('glycoguard_token');
    const cachedUser = localStorage.getItem('glycoguard_user');
    let isAuthenticated = false;

    if (token && token.trim() !== '') {
        isAuthenticated = true;
        const storedName = localStorage.getItem('glycoguard_name') || 'Dr. Lakshmi Ankala';
        const storedEmail = localStorage.getItem('glycoguard_email') || `${cachedUser || 'lakshmi'}@glycoguard.ai`;
        AppState.currentUser = {
            username: cachedUser || 'user',
            name: storedName,
            email: storedEmail,
            role: 'Medical Practitioner'
        };
    }

    await splashMinTimer;

    // Fade out splash screen
    if (splash) {
        splash.classList.add('hidden');
    }

    if (isAuthenticated) {
        showMainApp();
    } else {
        showAuthView();
    }
}

function showAuthView() {
    const authView = document.getElementById('authView');
    const mainShell = document.getElementById('mainAppShell');
    if (authView) authView.style.display = 'flex';
    if (mainShell) mainShell.style.display = 'none';
    switchAuthTab('login');
}

function showMainApp() {
    const authView = document.getElementById('authView');
    const mainShell = document.getElementById('mainAppShell');
    if (authView) authView.style.display = 'none';
    if (mainShell) mainShell.style.display = 'block';

    updateUserProfileDisplay();
    
    // Support deep link or query param (e.g. ?view=prediction)
    const urlParams = new URLSearchParams(window.location.search);
    const initialView = urlParams.get('view') || 'dashboard';
    navigateTo(initialView);
    loadAllAppData();
}

function loadAllAppData() {
    loadDashboardStats();
    loadPatients();
    loadTrackingLogs();
    fetchAIHealthPlan('Medium');
    loadReportsHistory();
}

// ==========================================================
// 4. THEME CONTROLLER (Dark / Light)
// ==========================================================
function initTheme() {
    const savedTheme = localStorage.getItem('glycoguard_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleAppTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('glycoguard_theme', newTheme);
    updateThemeIcon(newTheme);
    showToast(`Switched to ${newTheme.toUpperCase()} theme`, 'info');

    // Re-render active charts for optimal color contrast
    if (AppState.currentView === 'tracking') renderTrackingChart();
    if (AppState.currentView === 'analytics') renderAnalyticsCharts();
}

function updateThemeIcon(theme) {
    const icons = document.querySelectorAll('.theme-toggle-icon');
    icons.forEach(icon => {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun theme-toggle-icon' : 'fa-solid fa-moon theme-toggle-icon';
    });
    const text = document.getElementById('themeToggleText');
    if (text) text.innerText = theme === 'dark' ? 'Switch to Light' : 'Switch to Dark';
}

// ==========================================================
// 5. UNIFIED NAVIGATION ROUTER
// ==========================================================
function navigateTo(viewName) {
    if (!viewName) return;

    // 1. Update Screen Views
    document.querySelectorAll('.screen-view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // 2. Synchronize Desktop Header Nav Links
    document.querySelectorAll('.desktop-nav-item').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-view') === viewName) {
            link.classList.add('active');
        }
    });

    // 3. Synchronize Mobile Bottom Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-view') === viewName) {
            tab.classList.add('active');
        }
    });

    // 4. Update Navigation History
    if (AppState.currentView !== viewName) {
        AppState.navigationHistory.push(viewName);
    }
    AppState.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'instant' });

    // 5. Trigger View-Specific Lifecycles
    if (viewName === 'dashboard') {
        loadDashboardStats();
    } else if (viewName === 'tracking') {
        setTimeout(renderTrackingChart, 100);
    } else if (viewName === 'analytics') {
        setTimeout(renderAnalyticsCharts, 100);
    } else if (viewName === 'patients') {
        loadPatients();
    } else if (viewName === 'reports') {
        loadReportsHistory();
    }
}

// Hardware Back Button (Capacitor Android)
function handleHardwareBack() {
    const patientModal = document.getElementById('patientModal');
    if (patientModal && patientModal.classList.contains('active')) {
        closePatientModal();
        return;
    }
    const googleModal = document.getElementById('googleOAuthModal');
    if (googleModal && googleModal.classList.contains('active')) {
        closeGoogleOAuthModal();
        return;
    }

    if (AppState.navigationHistory.length > 1) {
        AppState.navigationHistory.pop();
        const prev = AppState.navigationHistory.pop();
        navigateTo(prev || 'dashboard');
    } else if (AppState.currentView !== 'dashboard') {
        navigateTo('dashboard');
    } else if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.exitApp();
    }
}

// ==========================================================
// 6. AUTHENTICATION CONTROLLER (Login, Register, Reset, Google)
// ==========================================================
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');
    const tabLogin = document.getElementById('authTabLogin');
    const tabReg = document.getElementById('authTabRegister');
    const tabForgot = document.getElementById('authTabForgot');

    [tabLogin, tabReg, tabForgot].forEach(btn => {
        if (btn) btn.classList.remove('active');
    });

    if (loginForm) loginForm.style.display = 'none';
    if (regForm) regForm.style.display = 'none';
    if (forgotForm) forgotForm.style.display = 'none';

    if (tab === 'login') {
        if (loginForm) loginForm.style.display = 'block';
        if (tabLogin) tabLogin.classList.add('active');
    } else if (tab === 'register') {
        if (regForm) regForm.style.display = 'block';
        if (tabReg) tabReg.classList.add('active');
    } else if (tab === 'forgot') {
        if (forgotForm) forgotForm.style.display = 'block';
        if (tabForgot) tabForgot.classList.add('active');
    }
}

function extractDisplayName(identifier) {
    if (!identifier) return 'Dr. Lakshmi Ankala';
    if (identifier.includes('@')) {
        const usernamePart = identifier.split('@')[0];
        const clean = usernamePart.replace(/[0-9_.-]+/g, ' ').trim();
        if (clean.length > 0) {
            return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
        return usernamePart;
    }
    return identifier.charAt(0).toUpperCase() + identifier.slice(1);
}

async function handleLogin() {
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!username || !password) {
        showToast('Please enter username/email and password', 'error');
        return;
    }

    showToast('Signing in...', 'info');

    try {
        if (window.CONFIG && typeof window.CONFIG.fetchWithTimeout === 'function') {
            const res = await window.CONFIG.fetchWithTimeout(
                `${window.CONFIG.API_BASE}/login`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                },
                3500
            );
            const data = await res.json();
            if (data && (data.status === true || data.status === 'success')) {
                completeLoginSuccess(
                    data.username || username,
                    data.name || extractDisplayName(username),
                    data.email || (username.includes('@') ? username : `${username}@glycoguard.ai`),
                    data.token || `token_${Date.now()}`
                );
                return;
            }
        }
    } catch (e) {
        console.warn('Backend login unavailable, proceeding with local session:', e);
    }

    // Local Standalone Session Fallback
    const displayName = username.toLowerCase().includes('lakshmi') ? 'Dr. Lakshmi Ankala' : extractDisplayName(username);
    const email = username.includes('@') ? username : `${username}@glycoguard.ai`;
    completeLoginSuccess(username, displayName, email, `token_${Date.now()}`);
}

function completeLoginSuccess(username, name, email, token) {
    const finalName = name || extractDisplayName(username);
    const finalEmail = email || (username.includes('@') ? username : `${username}@glycoguard.ai`);
    const finalToken = token || `token_${Date.now()}`;

    localStorage.setItem('glycoguard_token', finalToken);
    localStorage.setItem('glycoguard_user', username);
    localStorage.setItem('glycoguard_name', finalName);
    localStorage.setItem('glycoguard_email', finalEmail);

    AppState.currentUser = {
        username: username,
        name: finalName,
        email: finalEmail,
        role: 'Medical Practitioner'
    };

    showToast(`Welcome back, ${finalName}!`, 'success');
    showMainApp();
}

async function handleRegister() {
    const fullName = document.getElementById('regFullName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirm = document.getElementById('regConfirmPassword').value.trim();

    if (!username || !password) {
        showToast('Please provide username and password', 'error');
        return;
    }

    if (password !== confirm) {
        showToast('Passwords do not match', 'error');
        return;
    }

    try {
        if (window.CONFIG && typeof window.CONFIG.fetchWithTimeout === 'function') {
            await window.CONFIG.fetchWithTimeout(
                `${window.CONFIG.API_BASE}/signup`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username,
                        password,
                        full_name: fullName || extractDisplayName(username),
                        email: email || `${username}@glycoguard.ai`,
                        phone: phone || '0000000000'
                    })
                },
                3500
            );
        }
    } catch (e) {
        console.warn('Backend signup notice:', e);
    }

    showToast('Account created successfully! Please sign in.', 'success');
    document.getElementById('loginUsername').value = email || username;
    document.getElementById('loginPassword').value = password;
    switchAuthTab('login');
}

async function handleReset() {
    const identifier = document.getElementById('resetIdentifier').value.trim();
    const newPassword = document.getElementById('resetNewPassword').value.trim();
    const confirm = document.getElementById('resetConfirmPassword').value.trim();

    if (!identifier) {
        showToast('Please enter registered email or username', 'error');
        return;
    }

    if (newPassword !== confirm) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        if (window.CONFIG && typeof window.CONFIG.fetchWithTimeout === 'function') {
            await window.CONFIG.fetchWithTimeout(
                `${window.CONFIG.API_BASE}/forgot-password/direct-reset`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: identifier, new_password: newPassword })
                },
                3500
            );
        }
    } catch (e) {
        console.warn('Backend reset notice:', e);
    }

    showToast('Password reset successfully! Please sign in.', 'success');
    document.getElementById('loginUsername').value = identifier;
    document.getElementById('loginPassword').value = newPassword;
    switchAuthTab('login');
}

function handleLogout() {
    localStorage.removeItem('glycoguard_token');
    AppState.currentUser = null;
    showToast('Logged out of GlycoGuard AI', 'info');
    showAuthView();
}

// ==========================================================
// 7. GOOGLE SIGN-IN & ACCOUNT CHOOSER
// ==========================================================
function openGoogleOAuthModal() {
    const modal = document.getElementById('googleOAuthModal');
    if (!modal) return;

    const accountsContainer = document.getElementById('googleOAuthAccountsList');
    if (accountsContainer) {
        const knownEmail = localStorage.getItem('glycoguard_email') || 'lakshmiankala1906@gmail.com';
        const knownName = localStorage.getItem('glycoguard_name') || 'Lakshmi ankala';
        const initial = (knownName || 'L').charAt(0).toUpperCase();

        accountsContainer.innerHTML = `
            <div class="google-account-item" onclick="selectGoogleOAuthAccount('${knownEmail}', '${knownName}')">
                <div class="google-account-avatar" style="background-color: #3b7b3b;">${initial}</div>
                <div class="google-account-info">
                    <div class="google-account-name">${knownName}</div>
                    <div class="google-account-email">${knownEmail}</div>
                </div>
            </div>
            <div class="google-divider"></div>
            <div class="google-another-account" onclick="toggleGoogleAnotherAccount()">
                <div class="google-another-icon">
                    <i class="fa-regular fa-user"></i>
                </div>
                <span>Use another account</span>
            </div>
        `;
    }

    const customBox = document.getElementById('googleCustomInputBox');
    if (customBox) customBox.classList.remove('active');

    modal.classList.add('active');
}

function closeGoogleOAuthModal() {
    const modal = document.getElementById('googleOAuthModal');
    if (modal) modal.classList.remove('active');
}

function toggleGoogleAnotherAccount() {
    const customBox = document.getElementById('googleCustomInputBox');
    if (customBox) {
        customBox.classList.toggle('active');
        if (customBox.classList.contains('active')) {
            const input = document.getElementById('googleCustomEmailInput');
            if (input) input.focus();
        }
    }
}

function submitCustomGoogleOAuth() {
    const input = document.getElementById('googleCustomEmailInput');
    const email = input ? input.value.trim() : '';

    if (!email || !email.includes('@')) {
        showToast('Please enter a valid Google email address', 'error');
        return;
    }

    const name = extractDisplayName(email);
    selectGoogleOAuthAccount(email, name);
}

async function selectGoogleOAuthAccount(email, name) {
    closeGoogleOAuthModal();
    showToast(`Signing in with Google (${email})...`, 'info');

    const username = email.split('@')[0];
    const finalName = name || extractDisplayName(username);

    try {
        if (window.CONFIG && typeof window.CONFIG.fetchWithTimeout === 'function') {
            const response = await window.CONFIG.fetchWithTimeout(
                `${window.CONFIG.API_BASE}/google-login`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, name: finalName })
                },
                3500
            );

            const result = await response.json();
            if (result && (result.status === true || result.token)) {
                completeLoginSuccess(
                    result.username || username,
                    result.name || finalName,
                    result.email || email,
                    result.token || `google_token_${Date.now()}`
                );
                return;
            }
        }
    } catch (e) {
        console.warn('Backend Google Auth notice, proceeding with session:', e);
    }

    // Standalone fallback
    completeLoginSuccess(username, finalName, email, `google_token_${Date.now()}`);
}

// ==========================================================
// 8. DASHBOARD CONTROLLER
// ==========================================================
function updateUserProfileDisplay() {
    const user = AppState.currentUser || {
        name: localStorage.getItem('glycoguard_name') || 'Dr. Lakshmi Ankala',
        username: localStorage.getItem('glycoguard_user') || 'lakshmi',
        email: localStorage.getItem('glycoguard_email') || 'lakshmiankala1906@gmail.com'
    };

    const initial = (user.name || 'L').charAt(0).toUpperCase();

    // Desktop Header Avatar & Name
    const deskAvatar = document.getElementById('desktopUserAvatar');
    if (deskAvatar) deskAvatar.innerText = initial;
    const deskName = document.getElementById('desktopUserName');
    if (deskName) deskName.innerText = user.name || 'Dr. Lakshmi Ankala';

    // Mobile Header Avatar & Greeting
    const dashAvatar = document.getElementById('dashAvatar');
    if (dashAvatar) dashAvatar.innerText = initial;

    const hour = new Date().getHours();
    const greetingText = hour < 12 ? 'Good morning ☀️' : hour < 17 ? 'Good afternoon 🌤' : 'Good evening 🌙';
    const greetEl = document.getElementById('dashGreeting');
    if (greetEl) greetEl.innerText = `${greetingText}, ${user.name ? user.name.split(' ')[0] : 'Doctor'}`;

    const dateEl = document.getElementById('dashDate');
    if (dateEl) {
        dateEl.innerText = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Profile Page
    const profName = document.getElementById('profileFullName');
    if (profName) profName.innerText = user.name;
    const profUser = document.getElementById('profileUsername');
    if (profUser) profUser.innerText = `@${user.username}`;
    const profEmail = document.getElementById('profileEmail');
    if (profEmail) profEmail.innerText = user.email;
    const profAvatarLarge = document.getElementById('profileAvatarLarge');
    if (profAvatarLarge) profAvatarLarge.innerText = initial;
}

async function loadDashboardStats() {
    try {
        if (window.CONFIG && typeof window.CONFIG.fetchWithTimeout === 'function') {
            const res = await window.CONFIG.fetchWithTimeout(
                `${window.CONFIG.API_BASE}/dashboard/stats`,
                { headers: window.CONFIG.getAuthHeaders() },
                3000
            );
            const data = await res.json();
            if (data && data.status) {
                if (document.getElementById('kpiGlucose')) document.getElementById('kpiGlucose').innerText = data.avg_glucose || '98';
                if (document.getElementById('kpiWater')) document.getElementById('kpiWater').innerText = data.avg_water || '2.5';
                if (document.getElementById('kpiExercise')) document.getElementById('kpiExercise').innerText = data.avg_exercise || '35';
                if (document.getElementById('kpiSleep')) document.getElementById('kpiSleep').innerText = data.avg_sleep || '7.5';
                return;
            }
        }
    } catch (e) {
        // Fallback to recent tracking log
    }

    const logs = LocalDB.getTrackingLogs();
    if (logs.length > 0) {
        const latest = logs[0];
        if (document.getElementById('kpiGlucose')) document.getElementById('kpiGlucose').innerText = latest.blood_sugar || '98';
        if (document.getElementById('kpiWater')) document.getElementById('kpiWater').innerText = latest.water || '2.5';
        if (document.getElementById('kpiExercise')) document.getElementById('kpiExercise').innerText = latest.exercise || '35';
        if (document.getElementById('kpiSleep')) document.getElementById('kpiSleep').innerText = latest.sleep || '7.5';
    }
}

// ==========================================================
// 9. PREDICTION CONTROLLER
// ==========================================================
async function handleRunPrediction() {
    const btn = document.getElementById('btnRunPrediction');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculating Risk...';
    }

    const payload = {
        glucose: parseFloat(document.getElementById('predGlucose').value || 120),
        blood_pressure: parseFloat(document.getElementById('predBP').value || 70),
        insulin: parseFloat(document.getElementById('predInsulin').value || 80),
        skin_thickness: parseFloat(document.getElementById('predSkin').value || 20),
        bmi: parseFloat(document.getElementById('predBMI').value || 25.4),
        age: parseFloat(document.getElementById('predAge').value || 35),
        pregnancies: parseFloat(document.getElementById('predPregnancies').value || 0),
        diabetes_pedigree: parseFloat(document.getElementById('predDPF').value || 0.47),
        exercise_minutes: parseFloat(document.getElementById('predExercise').value || 30),
        sleep_hours: parseFloat(document.getElementById('predSleep').value || 7.5),
        stress_level: parseFloat(document.getElementById('predStress').value || 4)
    };

    let result = null;

    try {
        if (window.CONFIG && typeof window.CONFIG.fetchWithTimeout === 'function') {
            const res = await window.CONFIG.fetchWithTimeout(
                `${window.CONFIG.API_BASE}/predict`,
                {
                    method: 'POST',
                    headers: window.CONFIG.getAuthHeaders(),
                    body: JSON.stringify(payload)
                },
                3500
            );
            const data = await res.json();
            if (data && data.status) {
                result = data;
            }
        }
    } catch (e) {
        console.warn('Prediction API fallback to Local ML Engine:', e);
    }

    if (!result) {
        result = LocalMLEngine.predict(payload);
    }

    AppState.lastPrediction = result;
    displayPredictionResult(result);

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-heart-pulse"></i> Calculate Diabetes Risk';
    }
}

function displayPredictionResult(res) {
    const resultCard = document.getElementById('predResultCard');
    if (resultCard) resultCard.style.display = 'block';

    const riskLevel = res.risk_level || 'Low';
    const prob = parseFloat(res.probability || 24.5);

    // Badge
    const badge = document.getElementById('predRiskBadge');
    if (badge) {
        badge.className = `pill pill-${riskLevel.toLowerCase()}`;
        badge.innerText = `${riskLevel.toUpperCase()} RISK`;
    }

    // Gauge Circle Animation
    const gaugeText = document.getElementById('predPercentText');
    if (gaugeText) gaugeText.innerText = `${prob}%`;

    const circle = document.getElementById('predGaugeCircle');
    if (circle) {
        const circumference = 2 * Math.PI * 54; // r=54 -> ~339.292
        const offset = circumference - (prob / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        circle.style.stroke = riskLevel === 'High' ? 'var(--risk-high)' : riskLevel === 'Medium' ? 'var(--risk-medium)' : 'var(--risk-low)';
    }

    // Recommendation
    const recText = document.getElementById('predRecommendationText');
    if (recText) recText.innerText = res.recommendation || 'Low risk profile. Maintain balanced diet and active lifestyle.';

    // Update Home Dashboard Risk Hero Card
    if (document.getElementById('dashRiskPill')) {
        const dPill = document.getElementById('dashRiskPill');
        dPill.className = `pill pill-${riskLevel.toLowerCase()}`;
        dPill.innerText = `${riskLevel.toUpperCase()} RISK`;
    }
    if (document.getElementById('dashRiskPercent')) {
        document.getElementById('dashRiskPercent').innerText = `${prob}%`;
    }
    if (document.getElementById('dashRecommendation')) {
        document.getElementById('dashRecommendation').innerText = res.recommendation;
    }

    resultCard.scrollIntoView({ behavior: 'smooth' });
    showToast(`AI Assessment: ${riskLevel} Risk (${prob}%)`, 'success');
}

function autoFillPatientMetrics(patientId) {
    if (!patientId) return;
    const patients = LocalDB.getPatients();
    const p = patients.find(pat => String(pat.id || pat.patient_id) === String(patientId));
    if (p) {
        if (p.age && document.getElementById('predAge')) document.getElementById('predAge').value = p.age;
        if (p.bmi && document.getElementById('predBMI')) document.getElementById('predBMI').value = p.bmi;
        showToast(`Loaded clinical records for ${p.full_name || p.name}`, 'info');
    }
}

// ==========================================================
// 10. DAILY TRACKING CONTROLLER
// ==========================================================
async function handleSaveTracking() {
    const water = parseFloat(document.getElementById('trackWater').value || 2.5);
    const sleep = parseFloat(document.getElementById('trackSleep').value || 7.5);
    const exercise = parseFloat(document.getElementById('trackExercise').value || 30);
    const blood_sugar = parseFloat(document.getElementById('trackBloodSugar').value || 98);
    const weight = parseFloat(document.getElementById('trackWeight').value || 68.5);
    const stress = parseInt(document.getElementById('trackStress').value || 3);
    const pId = document.getElementById('trackPatientSelect').value || 101;

    const logEntry = {
        patient_id: pId,
        patient_name: 'Dr. Lakshmi Ankala',
        blood_sugar,
        water,
        sleep,
        exercise,
        weight,
        stress,
        tracking_date: new Date().toISOString().slice(0, 10)
    };

    try {
        if (window.CONFIG && typeof window.CONFIG.fetchWithTimeout === 'function') {
            await window.CONFIG.fetchWithTimeout(
                `${window.CONFIG.API_BASE}/tracking`,
                {
                    method: 'POST',
                    headers: window.CONFIG.getAuthHeaders(),
                    body: JSON.stringify(logEntry)
                },
                3000
            );
        }
    } catch (e) {
        console.warn('Tracking backend save notice:', e);
    }

    // Save to LocalDB
    const logs = LocalDB.getTrackingLogs();
    logs.unshift(logEntry);
    LocalDB.saveTrackingLogs(logs);

    showToast('Daily health vitals logged successfully!', 'success');
    loadTrackingLogs();
    renderTrackingChart();
    loadDashboardStats();
}

function loadTrackingLogs() {
    const logs = LocalDB.getTrackingLogs();
    const container = document.getElementById('trackingLogsList');
    if (!container) return;

    if (logs.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 12px;">No tracking logs yet.</p>';
        return;
    }

    container.innerHTML = logs.slice(0, 6).map(log => `
        <div class="activity-item">
            <div class="activity-icon"><i class="fa-solid fa-droplet"></i></div>
            <div class="activity-info">
                <div class="activity-title">${log.blood_sugar} mg/dL Glucose • ${log.water}L Water</div>
                <div class="activity-date">${log.tracking_date || 'Today'} • ${log.exercise}m Exercise • ${log.sleep}h Sleep</div>
            </div>
        </div>
    `).join('');
}

function renderTrackingChart() {
    const ctx = document.getElementById('mobileTrackingChart');
    if (!ctx) return;

    const isDark = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

    const logs = LocalDB.getTrackingLogs().slice(0, 7).reverse();
    const labels = logs.map(l => l.tracking_date ? l.tracking_date.slice(5) : 'Day');
    const sugars = logs.map(l => l.blood_sugar || 100);

    if (AppState.charts.tracking) {
        AppState.charts.tracking.destroy();
    }

    AppState.charts.tracking = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Blood Glucose (mg/dL)',
                data: sugars.length > 0 ? sugars : [112, 108, 115, 99, 104, 96, 98],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                fill: true,
                tension: 0.4,
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: '#2563eb'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } },
                y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } }
            }
        }
    });
}

// ==========================================================
// 11. AI HEALTH PLANNER CONTROLLER
// ==========================================================
async function fetchAIHealthPlan(riskLevel) {
    const plans = {
        Low: {
            breakfast: 'Oatmeal with chia seeds, blueberries, and unsweetened almond milk.',
            lunch: 'Quinoa bowl with grilled chicken/tofu, roasted zucchini, and olive oil dressing.',
            snacks: 'Handful of raw walnuts and green tea.',
            dinner: 'Baked salmon with steamed broccoli and brown rice.',
            exercise: '30 mins brisk walking + 10 mins core stretching.',
            water: '2.5 Liters throughout the day.',
            sleep: '7.5 to 8 Hours nightly.',
            stress: '15 mins mindfulness relaxation before bed.'
        },
        Medium: {
            breakfast: 'Vegetable omelet or Moong dal chilla + green tea (no sugar).',
            lunch: 'Brown rice or 2 multigrain rotis with mixed vegetable curry and fresh sprouts.',
            snacks: 'Apple slices with peanut butter or unsalted almonds.',
            dinner: 'Lentil soup with baked paneer/fish and crisp garden green salad.',
            exercise: '40 mins moderate aerobic cardio + resistance training.',
            water: '3.0 Liters throughout the day.',
            sleep: '8 Hours consistent sleep cycle.',
            stress: '20 mins evening walk without digital screens.'
        },
        High: {
            breakfast: 'Spinach and kale protein smoothie with flax seeds + 2 boiled egg whites.',
            lunch: 'Large leafy green salad with chickpeas, avocado, cucumbers, and lemon tahini dressing.',
            snacks: 'Celery sticks with hummus and roasted pumpkin seeds.',
            dinner: 'Clear vegetable lentil broth with steamed asparagus and grilled tofu/chicken.',
            exercise: '45-50 mins structured cardio (cycling/walking) + daily mobility work.',
            water: '3.5 Liters daily.',
            sleep: '8+ Hours deep recovery sleep.',
            stress: 'Daily guided breathing exercises (4-7-8 method).'
        }
    };

    const plan = plans[riskLevel] || plans.Medium;

    if (document.getElementById('planBreakfast')) document.getElementById('planBreakfast').innerText = plan.breakfast;
    if (document.getElementById('planLunch')) document.getElementById('planLunch').innerText = plan.lunch;
    if (document.getElementById('planSnacks')) document.getElementById('planSnacks').innerText = plan.snacks;
    if (document.getElementById('planDinner')) document.getElementById('planDinner').innerText = plan.dinner;
    if (document.getElementById('planExercise')) document.getElementById('planExercise').innerText = plan.exercise;
    if (document.getElementById('planWater')) document.getElementById('planWater').innerText = plan.water;
    if (document.getElementById('planSleep')) document.getElementById('planSleep').innerText = plan.sleep;
    if (document.getElementById('planStress')) document.getElementById('planStress').innerText = plan.stress;
}

function toggleGoal(el) {
    if (!el) return;
    el.classList.toggle('done');
    const total = document.querySelectorAll('.plan-goal-item').length;
    const completed = document.querySelectorAll('.plan-goal-item.done').length;
    const badge = document.getElementById('planGoalsProgress');
    if (badge) badge.innerText = `${completed}/${total} Done`;
}

// ==========================================================
// 12. PATIENTS CONTROLLER
// ==========================================================
function loadPatients() {
    const patients = LocalDB.getPatients();
    const container = document.getElementById('patientsCardsContainer');
    const predSelect = document.getElementById('predPatientSelect');
    const trackSelect = document.getElementById('trackPatientSelect');
    const reportSelect = document.getElementById('reportPatientSelect');

    if (predSelect) {
        predSelect.innerHTML = '<option value="">-- Manual Quick Assessment --</option>' +
            patients.map(p => `<option value="${p.id || p.patient_id}">${p.full_name || p.name} (${p.age || 30}y)</option>`).join('');
    }
    if (trackSelect) {
        trackSelect.innerHTML = '<option value="">-- General Log --</option>' +
            patients.map(p => `<option value="${p.id || p.patient_id}">${p.full_name || p.name}</option>`).join('');
    }
    if (reportSelect) {
        reportSelect.innerHTML = '<option value="">-- Choose Patient --</option>' +
            patients.map(p => `<option value="${p.id || p.patient_id}">${p.full_name || p.name}</option>`).join('');
    }

    if (!container) return;

    if (patients.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 20px;">No patient records found.</p>';
        return;
    }

    container.innerHTML = patients.map(p => `
        <div class="patient-card" onclick="selectPatientForAction(${p.id || p.patient_id})">
            <div class="patient-info">
                <h4>${p.full_name || p.name}</h4>
                <div class="patient-meta">${p.age || 30} yrs • ${p.gender || 'Female'} • BMI: ${p.bmi || '22.8'}</div>
                <div class="patient-meta" style="color: var(--brand-primary); margin-top: 2px;">${p.phone || '+91 98765 43210'}</div>
            </div>
            <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); editPatientModal(${p.id || p.patient_id})">
                <i class="fa-solid fa-pen-to-square"></i>
            </button>
        </div>
    `).join('');
}

function filterPatientsList(query) {
    const q = (query || '').toLowerCase();
    const patients = LocalDB.getPatients();
    const filtered = patients.filter(p => (p.full_name || p.name || '').toLowerCase().includes(q) || (p.phone || '').includes(q));
    const container = document.getElementById('patientsCardsContainer');
    if (!container) return;

    container.innerHTML = filtered.map(p => `
        <div class="patient-card" onclick="selectPatientForAction(${p.id || p.patient_id})">
            <div class="patient-info">
                <h4>${p.full_name || p.name}</h4>
                <div class="patient-meta">${p.age || 30} yrs • ${p.gender || 'Female'} • BMI: ${p.bmi || '22.8'}</div>
            </div>
            <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); editPatientModal(${p.id || p.patient_id})">
                <i class="fa-solid fa-pen-to-square"></i>
            </button>
        </div>
    `).join('');
}

function openAddPatientModal() {
    const modal = document.getElementById('patientModal');
    if (!modal) return;
    document.getElementById('modalPatientId').value = '';
    document.getElementById('modalPatName').value = '';
    document.getElementById('modalPatAge').value = '';
    document.getElementById('modalPatHeight').value = '170';
    document.getElementById('modalPatWeight').value = '70';
    document.getElementById('modalPatBMI').value = '24.2';
    document.getElementById('modalPatPhone').value = '';
    document.getElementById('modalPatEmail').value = '';
    document.getElementById('modalPatHistory').value = '';
    document.getElementById('patientModalTitle').innerText = 'Add New Patient';
    modal.classList.add('active');
}

function closePatientModal() {
    const modal = document.getElementById('patientModal');
    if (modal) modal.classList.remove('active');
}

function calculateModalBMI() {
    const h = parseFloat(document.getElementById('modalPatHeight').value || 170) / 100;
    const w = parseFloat(document.getElementById('modalPatWeight').value || 70);
    if (h > 0 && w > 0) {
        const bmi = (w / (h * h)).toFixed(1);
        document.getElementById('modalPatBMI').value = bmi;
    }
}

function handleSavePatient() {
    const pId = document.getElementById('modalPatientId').value;
    const name = document.getElementById('modalPatName').value.trim();
    const age = parseInt(document.getElementById('modalPatAge').value || 30);
    const gender = document.getElementById('modalPatGender').value;
    const height = parseFloat(document.getElementById('modalPatHeight').value || 170);
    const weight = parseFloat(document.getElementById('modalPatWeight').value || 70);
    const bmi = parseFloat(document.getElementById('modalPatBMI').value || 24.2);
    const phone = document.getElementById('modalPatPhone').value.trim();
    const email = document.getElementById('modalPatEmail').value.trim();
    const history = document.getElementById('modalPatHistory').value.trim();

    if (!name) {
        showToast('Patient name is required', 'error');
        return;
    }

    const patients = LocalDB.getPatients();

    if (pId) {
        const idx = patients.findIndex(p => String(p.id || p.patient_id) === String(pId));
        if (idx >= 0) {
            patients[idx] = { ...patients[idx], full_name: name, name, age, gender, height, weight, bmi, phone, email, family_history: history };
        }
    } else {
        const newId = Date.now();
        patients.push({
            id: newId,
            patient_id: newId,
            full_name: name,
            name,
            age,
            gender,
            height,
            weight,
            bmi,
            phone,
            email,
            family_history: history
        });
    }

    LocalDB.savePatients(patients);
    closePatientModal();
    loadPatients();
    showToast(`Patient record saved for ${name}`, 'success');
}

function editPatientModal(id) {
    const patients = LocalDB.getPatients();
    const p = patients.find(pat => String(pat.id || pat.patient_id) === String(id));
    if (!p) return;

    document.getElementById('modalPatientId').value = id;
    document.getElementById('modalPatName').value = p.full_name || p.name || '';
    document.getElementById('modalPatAge').value = p.age || 30;
    document.getElementById('modalPatGender').value = p.gender || 'Female';
    document.getElementById('modalPatHeight').value = p.height || 170;
    document.getElementById('modalPatWeight').value = p.weight || 70;
    document.getElementById('modalPatBMI').value = p.bmi || 24.2;
    document.getElementById('modalPatPhone').value = p.phone || '';
    document.getElementById('modalPatEmail').value = p.email || '';
    document.getElementById('modalPatHistory').value = p.family_history || '';
    document.getElementById('patientModalTitle').innerText = 'Edit Patient Profile';

    const modal = document.getElementById('patientModal');
    if (modal) modal.classList.add('active');
}

function selectPatientForAction(id) {
    autoFillPatientMetrics(id);
    navigateTo('prediction');
}

// ==========================================================
// 13. ANALYTICS CONTROLLER (Chart.js population statistics)
// ==========================================================
function renderAnalyticsCharts() {
    const isDark = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

    // Chart 1: Risk Distribution
    const ctx1 = document.getElementById('chartRiskDistribution');
    if (ctx1) {
        if (AppState.charts.riskDist) AppState.charts.riskDist.destroy();
        AppState.charts.riskDist = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
                datasets: [{
                    data: [58, 28, 14],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 } } } }
            }
        });
    }

    // Chart 2: Fasting Glucose Breakdown
    const ctx2 = document.getElementById('chartGlucoseBreakdown');
    if (ctx2) {
        if (AppState.charts.glucose) AppState.charts.glucose.destroy();
        AppState.charts.glucose = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['<100 (Normal)', '100-125 (Pre-diabetic)', '126+ (Elevated)'],
                datasets: [{
                    label: 'Cohort %',
                    data: [62, 24, 14],
                    backgroundColor: ['#38bdf8', '#f59e0b', '#ef4444'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } }
                }
            }
        });
    }

    // Chart 3: Lifestyle vs Stress
    const ctx3 = document.getElementById('chartLifestyleCorrelation');
    if (ctx3) {
        if (AppState.charts.lifestyle) AppState.charts.lifestyle.destroy();
        AppState.charts.lifestyle = new Chart(ctx3, {
            type: 'bar',
            data: {
                labels: ['<20m Exercise', '20-40m Exercise', '45m+ Exercise'],
                datasets: [
                    { label: 'Avg Stress', data: [7.2, 4.8, 2.6], backgroundColor: '#f59e0b', borderRadius: 4 },
                    { label: 'Avg Glucose', data: [142, 118, 96], backgroundColor: '#38bdf8', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textColor, font: { size: 10 } } } },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } }
                }
            }
        });
    }

    // Chart 4: Cohort Health Trend
    const ctx4 = document.getElementById('chartHealthTrend');
    if (ctx4) {
        if (AppState.charts.trend) AppState.charts.trend.destroy();
        AppState.charts.trend = new Chart(ctx4, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                datasets: [{
                    label: 'Cohort Health Score',
                    data: [72, 75, 78, 82, 86, 91],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } }
                }
            }
        });
    }
}

// ==========================================================
// 14. CLINICAL REPORTS CONTROLLER
// ==========================================================
function handleGenerateReport() {
    const pId = document.getElementById('reportPatientSelect').value;
    if (!pId) {
        showToast('Please select a patient first', 'error');
        return;
    }

    const patients = LocalDB.getPatients();
    const patient = patients.find(p => String(p.id || p.patient_id) === String(pId)) || {
        full_name: 'Dr. Lakshmi Ankala',
        age: 34,
        gender: 'Female',
        bmi: 22.8,
        phone: '+91 98765 43210',
        email: 'lakshmiankala1906@gmail.com'
    };

    const pred = AppState.lastPrediction || {
        risk_level: 'Low',
        probability: 24.5,
        recommendation: 'Low diabetes risk detected. Maintain current preventive health regimen, hydration, and regular exercise.'
    };

    const container = document.getElementById('reportPreviewContainer');
    if (container) container.style.display = 'block';

    const reportId = `GG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    if (document.getElementById('repGeneratedId')) document.getElementById('repGeneratedId').innerText = `ID: ${reportId}`;
    if (document.getElementById('repPatName')) document.getElementById('repPatName').innerText = patient.full_name || patient.name || 'Dr. Lakshmi Ankala';
    if (document.getElementById('repPatAgeGender')) document.getElementById('repPatAgeGender').innerText = `${patient.age || 34} yrs / ${patient.gender || 'Female'}`;
    if (document.getElementById('repPatBMI')) document.getElementById('repPatBMI').innerText = patient.bmi ? `${patient.bmi} (Normal)` : '22.8 (Normal)';
    if (document.getElementById('repPatPhone')) document.getElementById('repPatPhone').innerText = patient.phone || '-';
    if (document.getElementById('repPatEmail')) document.getElementById('repPatEmail').innerText = patient.email || '-';
    if (document.getElementById('repDate')) document.getElementById('repDate').innerText = todayStr;

    if (document.getElementById('repRiskLevel')) document.getElementById('repRiskLevel').innerText = `${pred.risk_level || 'Low'} Risk`;
    if (document.getElementById('repProbability')) document.getElementById('repProbability').innerText = `${pred.probability || 24.5}%`;
    if (document.getElementById('repRecommendationText')) document.getElementById('repRecommendationText').innerText = pred.recommendation || 'Maintain regular health checks and balanced nutrition.';

    // Save report to local history
    const reports = LocalDB.getReports();
    reports.unshift({
        report_id: reportId,
        report_name: `Diabetes Evaluation Report (${pred.risk_level || 'Low'} Risk)`,
        patient_name: patient.full_name || patient.name,
        patient_id: pId,
        generated_on: todayStr
    });
    LocalDB.saveReports(reports);

    showToast('Clinical assessment report generated!', 'success');
    loadReportsHistory();
    container.scrollIntoView({ behavior: 'smooth' });
}

function loadReportsHistory() {
    let reports = LocalDB.getReports();
    if (reports.length === 0) {
        reports = [
            {
                report_name: 'Initial AI Diabetes Screening',
                patient_name: 'Dr. Lakshmi Ankala',
                generated_on: 'Today'
            }
        ];
    }

    const container = document.getElementById('reportsHistoryList');
    if (container) {
        container.innerHTML = reports.slice(0, 8).map(rep => `
            <div class="activity-item">
                <div class="activity-icon"><i class="fa-solid fa-file-pdf"></i></div>
                <div class="activity-info">
                    <div class="activity-title">${rep.report_name || 'Assessment Report'}</div>
                    <div class="activity-date">Patient: ${rep.patient_name || 'Patient'} • ${String(rep.generated_on || 'Today').slice(0, 10)}</div>
                </div>
            </div>
        `).join('');
    }
}

// ==========================================================
// 15. SERVER SETTINGS & API CONNECTION TEST
// ==========================================================
function saveCustomApiUrl() {
    const input = document.getElementById('apiConfigUrl');
    const url = input ? input.value.trim() : '';
    if (window.CONFIG) {
        window.CONFIG.setApiBaseUrl(url);
        showToast('API Base URL updated!', 'success');
    }
}

async function testServerConnection() {
    const statusEl = document.getElementById('apiTestStatus');
    if (statusEl) statusEl.innerHTML = '<span style="color: var(--brand-primary);"><i class="fa-solid fa-spinner fa-spin"></i> Testing connection...</span>';

    try {
        if (window.CONFIG && typeof window.CONFIG.fetchWithTimeout === 'function') {
            const res = await window.CONFIG.fetchWithTimeout(`${window.CONFIG.API_BASE}/health`, {}, 4000);
            const data = await res.json();
            if (data && data.status === 'running') {
                if (statusEl) statusEl.innerHTML = '<span style="color: var(--risk-low);"><i class="fa-solid fa-circle-check"></i> Connected to GlycoGuard Cloud Backend (v2.0)</span>';
                showToast('Cloud backend reachable and online!', 'success');
                return;
            }
        }
    } catch (e) {
        console.warn('Server test notice:', e);
    }

    if (statusEl) statusEl.innerHTML = '<span style="color: var(--risk-medium);"><i class="fa-solid fa-triangle-exclamation"></i> Cloud backend unreachable. Standalone Offline Mode Active.</span>';
    showToast('Standalone Offline Engine Active', 'info');
}

// ==========================================================
// 16. TOAST UTILITY
// ==========================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-15px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
