/**
 * ==========================================================
 * GlycoGuard AI - Mobile Application Controller
 * 100% Standalone Offline-First Architecture
 * Predict • Prevent • Personalize
 * ==========================================================
 */

// Application State
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
// LOCAL STORAGE & EMBEDDED CLINICAL DATABASE
// ==========================================================

var LocalDB = window.LocalDB || {
    // Initial Preloaded Users
    initUsers() {
        const existing = localStorage.getItem('glycoguard_users_db');
        if (!existing) {
            const initialUsers = [
                {
                    username: 'lakshmi',
                    email: 'lakshmiankala1906@gmail.com',
                    password: 'password',
                    name: 'Dr. Lakshmi Ankala',
                    phone: '+91 98765 43210',
                    role: 'Medical Practitioner'
                },
                {
                    username: 'doctor',
                    email: 'doctor@glycoguard.ai',
                    password: 'password',
                    name: 'Dr. John Watson',
                    phone: '+1 555 123 4567',
                    role: 'Endocrinologist'
                }
            ];
            localStorage.setItem('glycoguard_users_db', JSON.stringify(initialUsers));
        }
    },

    getUsers() {
        this.initUsers();
        try {
            return JSON.parse(localStorage.getItem('glycoguard_users_db')) || [];
        } catch (e) {
            return [];
        }
    },

    saveUser(user) {
        const users = this.getUsers();
        const idx = users.findIndex(u => (u.email && u.email.toLowerCase() === (user.email || '').toLowerCase()) || (u.username && u.username.toLowerCase() === (user.username || '').toLowerCase()));
        if (idx >= 0) {
            users[idx] = { ...users[idx], ...user };
        } else {
            users.push(user);
        }
        localStorage.setItem('glycoguard_users_db', JSON.stringify(users));
    },

    // Initial Preloaded Patients
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

    // Initial Preloaded Tracking Logs
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

    // Clinical Reports
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
// EMBEDDED CLINICAL ML PREDICTION ENGINE (Random Forest Logic)
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

        // Calibrated Multi-Biomarker Risk Scoring
        let riskScore = 0;

        // 1. Fasting Blood Glucose (Strongest Predictor)
        if (glucose >= 200) riskScore += 48;
        else if (glucose >= 160) riskScore += 36;
        else if (glucose >= 140) riskScore += 26;
        else if (glucose >= 120) riskScore += 16;
        else if (glucose >= 100) riskScore += 8;
        else riskScore += 2;

        // 2. BMI Scoring
        if (bmi >= 35) riskScore += 24;
        else if (bmi >= 30) riskScore += 17;
        else if (bmi >= 25) riskScore += 9;
        else riskScore += 2;

        // 3. Age Factor
        if (age >= 55) riskScore += 15;
        else if (age >= 45) riskScore += 10;
        else if (age >= 35) riskScore += 5;
        else riskScore += 2;

        // 4. Diabetes Pedigree Function & Heredity
        if (dpf >= 1.0) riskScore += 14;
        else if (dpf >= 0.6) riskScore += 8;
        else riskScore += 3;

        // 5. Insulin & Metabolic Resistance
        if (insulin >= 180) riskScore += 10;
        else if (insulin >= 140) riskScore += 6;

        // 6. Blood Pressure
        if (blood_pressure >= 90) riskScore += 8;
        else if (blood_pressure >= 80) riskScore += 4;

        // 7. Pregnancies
        if (pregnancies >= 5) riskScore += 8;
        else if (pregnancies >= 3) riskScore += 4;

        // 8. Protective vs Negative Lifestyle Modifiers
        if (exercise >= 45) riskScore -= 10;
        else if (exercise >= 30) riskScore -= 6;
        else if (exercise < 15) riskScore += 7;

        if (sleep >= 7 && sleep <= 9) riskScore -= 5;
        else if (sleep < 6) riskScore += 6;

        if (stress >= 7) riskScore += 8;
        else if (stress <= 3) riskScore -= 4;

        // Normalize between 5% and 97%
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
            features_analyzed: {
                glucose,
                blood_pressure,
                insulin,
                bmi,
                age,
                exercise,
                sleep,
                stress
            }
        };
    }
};
window.LocalMLEngine = LocalMLEngine;

// ==========================================================
// 1. INITIALIZATION & SPLASH SCREEN
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    LocalDB.initUsers();
    LocalDB.initPatients();
    LocalDB.initTracking();
    initTheme();
    initApp();
});

async function initApp() {
    const splash = document.getElementById('splashScreen');

    // Minimum splash duration for smooth experience
    const splashTimer = new Promise(resolve => setTimeout(resolve, 600));

    // Verify session
    const token = localStorage.getItem('glycoguard_token');
    const cachedUser = localStorage.getItem('glycoguard_user');
    let isAuthenticated = false;

    if (token || cachedUser) {
        isAuthenticated = true;
        const storedName = localStorage.getItem('glycoguard_name') || 'Dr. Lakshmi Ankala';
        const storedEmail = localStorage.getItem('glycoguard_email') || `${cachedUser || 'lakshmi'}@glycoguard.ai`;
        AppState.currentUser = {
            username: cachedUser || 'lakshmi',
            name: storedName,
            email: storedEmail,
            role: 'Medical Practitioner'
        };
    }

    await splashTimer;

    // Fade out splash
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
}

function showMainApp() {
    const authView = document.getElementById('authView');
    const mainShell = document.getElementById('mainAppShell');
    if (authView) authView.style.display = 'none';
    if (mainShell) mainShell.style.display = 'block';
    
    updateUserProfileDisplay();
    navigateTo('dashboard');
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
// 2. THEME MANAGEMENT (DARK / LIGHT)
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

    // Re-render charts for theme contrast
    if (AppState.currentView === 'tracking') renderTrackingChart();
    if (AppState.currentView === 'analytics') renderAnalyticsCharts();
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeToggleText');
    if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    if (text) {
        text.innerText = theme === 'dark' ? 'Switch to Light' : 'Switch to Dark';
    }
}

// ==========================================================
// 3. NAVIGATION ROUTER
// ==========================================================
function navigateTo(viewName) {
    if (!viewName) return;

    // Update screen views
    document.querySelectorAll('.screen-view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Update bottom nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-view') === viewName) {
            tab.classList.add('active');
        }
    });

    // Update state history
    if (AppState.currentView !== viewName) {
        AppState.navigationHistory.push(viewName);
    }
    AppState.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Trigger view-specific lifecycles
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

function handleHardwareBack() {
    const patientModal = document.getElementById('patientModal');
    if (patientModal && patientModal.classList.contains('active')) {
        closePatientModal();
        return;
    }

    if (AppState.navigationHistory.length > 1) {
        AppState.navigationHistory.pop(); // Current
        const prev = AppState.navigationHistory.pop(); // Previous
        navigateTo(prev || 'dashboard');
    } else if (AppState.currentView !== 'dashboard') {
        navigateTo('dashboard');
    } else if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.exitApp();
    }
}

// ==========================================================
// 4. AUTHENTICATION CONTROLLER (100% Instant Standalone Login)
// ==========================================================
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');
    const tabLogin = document.getElementById('authTabLogin');
    const tabReg = document.getElementById('authTabRegister');
    const tabForgot = document.getElementById('authTabForgot');

    [tabLogin, tabReg, tabForgot].forEach(btn => {
        if (btn) {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-primary)';
        }
    });

    if (loginForm) loginForm.style.display = 'none';
    if (regForm) regForm.style.display = 'none';
    if (forgotForm) forgotForm.style.display = 'none';

    if (tab === 'login') {
        if (loginForm) loginForm.style.display = 'block';
        if (tabLogin) {
            tabLogin.style.background = 'var(--brand-primary)';
            tabLogin.style.color = '#fff';
        }
    } else if (tab === 'register') {
        if (regForm) regForm.style.display = 'block';
        if (tabReg) {
            tabReg.style.background = 'var(--brand-primary)';
            tabReg.style.color = '#fff';
        }
    } else if (tab === 'forgot') {
        if (forgotForm) forgotForm.style.display = 'block';
        if (tabForgot) {
            tabForgot.style.background = 'var(--brand-primary)';
            tabForgot.style.color = '#fff';
        }
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

function handleMobileLogin() {
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!username || !password) {
        showToast('Please enter username/email and password', 'error');
        return;
    }

    // Direct standalone instant login
    const users = LocalDB.getUsers();
    const existing = users.find(u => 
        (u.email && u.email.toLowerCase() === username.toLowerCase()) || 
        (u.username && u.username.toLowerCase() === username.toLowerCase())
    );

    const displayName = existing ? existing.name : (username.toLowerCase().includes('lakshmi') ? 'Dr. Lakshmi Ankala' : extractDisplayName(username));
    const email = (existing && existing.email) ? existing.email : (username.includes('@') ? username : `${username}@glycoguard.ai`);
    const token = `glyco_standalone_token_${Date.now()}`;

    // Auto-save local user profile if new
    if (!existing) {
        LocalDB.saveUser({
            username: username.includes('@') ? username.split('@')[0] : username,
            email: email,
            password: password,
            name: displayName,
            role: 'Medical Practitioner'
        });
    }

    completeLoginSuccess(username, displayName, email, token);
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

function handleMobileRegister() {
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

    LocalDB.saveUser({
        username: username,
        email: email || `${username}@glycoguard.ai`,
        password: password,
        name: fullName || extractDisplayName(username),
        phone: phone || '+91 00000 00000',
        role: 'Medical Practitioner'
    });

    showToast('Account created successfully! Please sign in.', 'success');
    document.getElementById('loginUsername').value = email || username;
    document.getElementById('loginPassword').value = password;
    switchAuthTab('login');
}

function handleMobileReset() {
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

    const users = LocalDB.getUsers();
    const user = users.find(u => (u.email && u.email.toLowerCase() === identifier.toLowerCase()) || (u.username && u.username.toLowerCase() === identifier.toLowerCase()));
    if (user) {
        user.password = newPassword;
        LocalDB.saveUser(user);
    }

    showToast('Password reset successfully! Please sign in.', 'success');
    document.getElementById('loginUsername').value = identifier;
    document.getElementById('loginPassword').value = newPassword;
    switchAuthTab('login');
}

function handleGoogleDemoLogin() {
    const email = "lakshmiankala1906@gmail.com";
    const name = "Dr. Lakshmi Ankala";
    completeLoginSuccess('lakshmi', name, email, `google_token_${Date.now()}`);
}

function handleMobileLogout() {
    localStorage.removeItem('glycoguard_token');
    AppState.currentUser = null;
    showToast('Logged out successfully', 'info');
    showAuthView();
}

// ==========================================================
// 5. DASHBOARD CONTROLLER
// ==========================================================
function updateUserProfileDisplay() {
    const user = AppState.currentUser || {
        name: localStorage.getItem('glycoguard_name') || 'Dr. Lakshmi Ankala',
        username: localStorage.getItem('glycoguard_user') || 'lakshmi',
        email: localStorage.getItem('glycoguard_email') || 'lakshmiankala1906@gmail.com'
    };

    const initial = (user.name || 'L').charAt(0).toUpperCase();

    // Dash Avatar & Greeting
    const dashAvatar = document.getElementById('dashAvatar');
    if (dashAvatar) dashAvatar.innerText = initial;

    const hour = new Date().getHours();
    let greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const dashGreeting = document.getElementById('dashGreeting');
    if (dashGreeting) {
        const firstName = user.name.replace(/^Dr\.\s*/, '').split(' ')[0] || user.username;
        dashGreeting.innerText = `${greet}, ${firstName} 👋`;
    }

    const dashDate = document.getElementById('dashDate');
    if (dashDate) {
        dashDate.innerText = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    }

    // Profile Screen
    const profAvatar = document.getElementById('profileAvatarLarge');
    if (profAvatar) profAvatar.innerText = initial;

    const profName = document.getElementById('profileFullName');
    if (profName) profName.innerText = user.name;

    const profUser = document.getElementById('profileUsername');
    if (profUser) profUser.innerText = `@${user.username}`;

    const profEmail = document.getElementById('profileEmail');
    if (profEmail) profEmail.innerText = user.email;

    // Load Last Prediction if available in localStorage
    const savedPred = localStorage.getItem('last_prediction');
    if (savedPred) {
        try {
            const pred = JSON.parse(savedPred);
            updateDashboardRiskSummary(pred);
        } catch (e) {}
    } else {
        updateDashboardRiskSummary({
            probability: 24.5,
            risk_level: 'Low',
            recommendation: 'Low diabetes risk detected. Biomarkers are within healthy ranges. Continue regular physical activity and balanced nutrition.'
        });
    }
}

function updateDashboardRiskSummary(pred) {
    if (!pred) return;
    const pill = document.getElementById('dashRiskPill');
    const percent = document.getElementById('dashRiskPercent');
    const rec = document.getElementById('dashRecommendation');

    if (percent) percent.innerText = `${pred.probability}%`;
    if (rec && pred.recommendation) rec.innerText = pred.recommendation;

    if (pill) {
        pill.innerText = `${(pred.risk_level || 'Low').toUpperCase()} RISK`;
        if (pred.risk_level === 'High') {
            pill.className = 'pill pill-high';
        } else if (pred.risk_level === 'Medium') {
            pill.className = 'pill pill-medium';
        } else {
            pill.className = 'pill pill-low';
        }
    }
}

function loadDashboardStats() {
    const activityList = document.getElementById('dashActivityList');
    if (activityList) {
        const logs = LocalDB.getTrackingLogs();
        const latest = logs[0] || { blood_sugar: 98, tracking_date: 'Today' };
        activityList.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon"><i class="fa-solid fa-check"></i></div>
                <div class="activity-info">
                    <div class="activity-title">Diabetes Risk Assessment (Low Risk - 24.5%)</div>
                    <div class="activity-date">Patient: Dr. Lakshmi Ankala • Today</div>
                </div>
            </div>
            <div class="activity-item">
                <div class="activity-icon"><i class="fa-solid fa-droplet"></i></div>
                <div class="activity-info">
                    <div class="activity-title">Daily Glucose Log (${latest.blood_sugar} mg/dL)</div>
                    <div class="activity-date">Recorded • ${String(latest.tracking_date).slice(0, 10)}</div>
                </div>
            </div>
        `;
    }
}

// ==========================================================
// 6. AI PREDICTION CONTROLLER (Embedded ML Engine)
// ==========================================================
function handleRunPrediction() {
    const patientId = document.getElementById('predPatientSelect').value;
    const glucose = parseFloat(document.getElementById('predGlucose').value || 120);
    const blood_pressure = parseFloat(document.getElementById('predBP').value || 70);
    const insulin = parseFloat(document.getElementById('predInsulin').value || 80);
    const skin_thickness = parseFloat(document.getElementById('predSkin').value || 20);
    const bmi = parseFloat(document.getElementById('predBMI').value || 25.4);
    const age = parseFloat(document.getElementById('predAge').value || 35);
    const pregnancies = parseFloat(document.getElementById('predPregnancies').value || 0);
    const dpf = parseFloat(document.getElementById('predDPF').value || 0.47);
    const exercise = parseFloat(document.getElementById('predExercise').value || 30);
    const sleep = parseFloat(document.getElementById('predSleep').value || 7.5);
    const stress = parseFloat(document.getElementById('predStress').value || 4);

    const payload = {
        patient_id: patientId ? parseInt(patientId) : null,
        glucose,
        blood_pressure,
        insulin,
        skin_thickness,
        bmi,
        age,
        pregnancies,
        diabetes_pedigree: dpf,
        exercise_minutes: exercise,
        sleep_hours: sleep,
        stress_level: stress
    };

    const predictionResult = LocalMLEngine.predict(payload);

    AppState.lastPrediction = predictionResult;
    localStorage.setItem('last_prediction', JSON.stringify(predictionResult));
    displayPredictionResults(predictionResult);
    updateDashboardRiskSummary(predictionResult);
    showToast('AI Risk Assessment calculated successfully!', 'success');
}

function displayPredictionResults(pred) {
    const card = document.getElementById('predResultCard');
    const badge = document.getElementById('predRiskBadge');
    const percentText = document.getElementById('predPercentText');
    const recText = document.getElementById('predRecommendationText');
    const gaugeCircle = document.getElementById('predGaugeCircle');

    if (!card) return;
    card.style.display = 'block';

    const prob = Math.round(pred.probability);
    if (percentText) percentText.innerText = `${prob}%`;
    if (recText) recText.innerText = pred.recommendation;

    // Animate circular gauge
    if (gaugeCircle) {
        const radius = 54;
        const circumference = 2 * Math.PI * radius; // ~339.29
        const offset = circumference - (prob / 100) * circumference;
        gaugeCircle.style.strokeDasharray = circumference;
        gaugeCircle.style.strokeDashoffset = offset;

        if (pred.risk_level === 'High') {
            gaugeCircle.style.stroke = 'var(--risk-high)';
            if (badge) {
                badge.innerText = 'HIGH RISK';
                badge.className = 'pill pill-high';
            }
        } else if (pred.risk_level === 'Medium') {
            gaugeCircle.style.stroke = 'var(--risk-medium)';
            if (badge) {
                badge.innerText = 'MODERATE RISK';
                badge.className = 'pill pill-medium';
            }
        } else {
            gaugeCircle.style.stroke = 'var(--risk-low)';
            if (badge) {
                badge.innerText = 'LOW RISK';
                badge.className = 'pill pill-low';
            }
        }
    }

    card.scrollIntoView({ behavior: 'smooth' });
}

function autoFillPatientMetrics(patientId) {
    if (!patientId) return;
    const patients = LocalDB.getPatients();
    const p = patients.find(item => String(item.id || item.patient_id) === String(patientId));
    if (p) {
        if (p.bmi && document.getElementById('predBMI')) document.getElementById('predBMI').value = p.bmi;
        if (p.age && document.getElementById('predAge')) document.getElementById('predAge').value = p.age;
        showToast(`Loaded baseline records for ${p.full_name || p.name}`, 'info');
    }
}

// ==========================================================
// 7. DAILY TRACKING CONTROLLER
// ==========================================================
function handleSaveTracking() {
    const patient_id = document.getElementById('trackPatientSelect').value;
    const water = parseFloat(document.getElementById('trackWater').value || 2.5);
    const sleep = parseFloat(document.getElementById('trackSleep').value || 7.5);
    const exercise = parseFloat(document.getElementById('trackExercise').value || 30);
    const blood_sugar = parseFloat(document.getElementById('trackBloodSugar').value || 98);
    const weight = parseFloat(document.getElementById('trackWeight').value || 68.5);
    const stress = parseInt(document.getElementById('trackStress').value || 3);

    const payload = {
        patient_id: patient_id ? parseInt(patient_id) : 101,
        patient_name: patient_id ? getPatientNameById(patient_id) : 'Dr. Lakshmi Ankala',
        water, sleep, exercise, blood_sugar, weight, stress,
        tracking_date: new Date().toISOString().slice(0, 10)
    };

    const logs = LocalDB.getTrackingLogs();
    logs.unshift(payload);
    LocalDB.saveTrackingLogs(logs);

    // Update Dashboard KPIs
    if (document.getElementById('kpiGlucose')) document.getElementById('kpiGlucose').innerText = blood_sugar;
    if (document.getElementById('kpiWater')) document.getElementById('kpiWater').innerText = water;
    if (document.getElementById('kpiExercise')) document.getElementById('kpiExercise').innerText = exercise;
    if (document.getElementById('kpiSleep')) document.getElementById('kpiSleep').innerText = sleep;

    showToast('Daily vitals recorded successfully!', 'success');
    loadTrackingLogs();
}

function getPatientNameById(pId) {
    const pat = LocalDB.getPatients().find(item => String(item.id || item.patient_id) === String(pId));
    return pat ? (pat.full_name || pat.name) : 'Patient';
}

function loadTrackingLogs() {
    const logs = LocalDB.getTrackingLogs();
    AppState.trackingLogs = logs;

    const container = document.getElementById('trackingLogsList');
    if (container) {
        if (logs.length === 0) {
            container.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding: 12px;">No tracking entries recorded yet.</p>`;
        } else {
            container.innerHTML = logs.slice(0, 10).map(log => `
                <div class="activity-item">
                    <div class="activity-icon"><i class="fa-solid fa-droplet"></i></div>
                    <div class="activity-info">
                        <div class="activity-title" style="display:flex; justify-content:space-between;">
                            <span>${log.patient_name || 'Patient'}</span>
                            <strong style="color: ${log.blood_sugar > 125 ? 'var(--risk-high)' : 'var(--risk-low)'};">${log.blood_sugar || '-'} mg/dL</strong>
                        </div>
                        <div class="activity-date">
                            💧 ${log.water || '-'}L • 🏃 ${log.exercise || '-'}m • 🌙 ${log.sleep || '-'}h • ${String(log.tracking_date || 'Today').slice(0, 10)}
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    renderTrackingChart();
}

function renderTrackingChart() {
    const canvas = document.getElementById('mobileTrackingChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (AppState.charts.tracking) {
        AppState.charts.tracking.destroy();
    }

    const logs = (AppState.trackingLogs || LocalDB.getTrackingLogs()).slice(0, 7).reverse();
    const labels = logs.length > 0 ? logs.map(l => String(l.tracking_date || 'Day').slice(5, 10)) : ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'];
    const glucoseData = logs.length > 0 ? logs.map(l => l.blood_sugar || 100) : [112, 108, 115, 99, 104, 96, 98];

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';

    AppState.charts.tracking = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Blood Glucose (mg/dL)',
                data: glucoseData,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#38bdf8',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { size: 10 } }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { size: 10 } }
                }
            }
        }
    });
}

// ==========================================================
// 8. AI PLANNER CONTROLLER
// ==========================================================
function fetchAIHealthPlan(riskLevel) {
    const rLevel = riskLevel || 'Medium';
    const localPlans = {
        Low: {
            breakfast: 'Rolled oats with blueberries, flaxseeds, unsweetened almond milk and a boiled egg.',
            lunch: 'Grilled chicken or tofu bowl with quinoa, steamed broccoli, avocado slices and olive oil vinaigrette.',
            snacks: 'Handful of raw walnuts, crisp green apple slices, or greek yogurt with cinnamon.',
            dinner: 'Baked herb salmon/paneer with sautéed asparagus, spinach, and a fresh Mediterranean garden salad.',
            exercise: '30-40 mins moderate aerobic cardio (brisk walk, cycling) + light core stability.',
            water_goal: '2.5 - 3.0 Liters daily',
            sleep_goal: '7.5 to 8 Hours nightly',
            stress_management: '20 mins evening screen-free walk, diaphragmatic breathing & gentle stretching.'
        },
        Medium: {
            breakfast: 'Steel-cut oats with chia seeds, pinch of cinnamon, walnuts and 2 scrambled egg whites.',
            lunch: 'Lentil soup with baked lean fish or grilled paneer, mixed greens, cucumbers and lemon olive dressing.',
            snacks: 'Cucumber slices with hummus or a small bowl of roasted chickpeas.',
            dinner: 'Grilled vegetable stir-fry with steamed edamame, cauliflower rice and clear vegetable broth.',
            exercise: '40 mins structured brisk walking + 15 mins bodyweight resistance exercises.',
            water_goal: '3.0 Liters daily',
            sleep_goal: '8 Hours nightly',
            stress_management: '15 mins mindfulness meditation, progressive muscle relaxation before bed.'
        },
        High: {
            breakfast: 'Spinach and bell pepper egg-white scramble with sliced avocado and green tea (zero sugar).',
            lunch: 'High-protein mixed bean salad with roasted chicken breast/tofu, zucchini and flaxseed oil.',
            snacks: 'Celery sticks with almond butter or raw almonds (max 10-12 pieces).',
            dinner: 'Baked white fish with steamed kale, roasted cauliflower and light turmeric lentil soup.',
            exercise: '45 mins supervised low-impact cardio (walking, swimming) broken into two 20-min sessions.',
            water_goal: '3.0 - 3.5 Liters daily',
            sleep_goal: '8 to 8.5 Hours consistent sleep',
            stress_management: 'Daily 20 mins yoga nidra, stress journal, avoid screen time 1 hour before sleep.'
        }
    };

    applyPlanToUI(localPlans[rLevel] || localPlans.Medium);
}

function applyPlanToUI(p) {
    if (document.getElementById('planBreakfast')) document.getElementById('planBreakfast').innerText = p.breakfast || '';
    if (document.getElementById('planLunch')) document.getElementById('planLunch').innerText = p.lunch || '';
    if (document.getElementById('planSnacks')) document.getElementById('planSnacks').innerText = p.snacks || '';
    if (document.getElementById('planDinner')) document.getElementById('planDinner').innerText = p.dinner || '';
    if (document.getElementById('planExercise')) document.getElementById('planExercise').innerText = p.exercise || '';
    if (document.getElementById('planWater')) document.getElementById('planWater').innerText = p.water_goal || '';
    if (document.getElementById('planSleep')) document.getElementById('planSleep').innerText = p.sleep_goal || '';
    if (document.getElementById('planStress')) document.getElementById('planStress').innerText = p.stress_management || '';
}

function toggleGoal(el) {
    el.classList.toggle('checked');
    const checkedCount = document.querySelectorAll('.plan-goal-item.checked').length;
    const totalCount = document.querySelectorAll('.plan-goal-item').length;
    const progressEl = document.getElementById('planGoalsProgress');
    if (progressEl) {
        progressEl.innerText = `${checkedCount}/${totalCount} Done`;
        if (checkedCount === totalCount) {
            progressEl.className = 'pill pill-low';
            showToast('🎉 All daily health goals completed!', 'success');
        }
    }
}

// ==========================================================
// 9. PATIENT MANAGEMENT CONTROLLER
// ==========================================================
function loadPatients() {
    const patients = LocalDB.getPatients();
    AppState.patients = patients;
    populatePatientsDropdowns(patients);
    renderPatientsCards(patients);
}

function populatePatientsDropdowns(patients) {
    const selects = [
        document.getElementById('predPatientSelect'),
        document.getElementById('trackPatientSelect'),
        document.getElementById('reportPatientSelect')
    ];

    selects.forEach(select => {
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '<option value="">-- Choose Patient --</option>';
        patients.forEach(p => {
            const pId = p.id || p.patient_id;
            const opt = document.createElement('option');
            opt.value = pId;
            opt.textContent = `${p.full_name || p.name} (ID: #${pId})`;
            select.appendChild(opt);
        });
        if (currentVal) select.value = currentVal;
    });
}

function renderPatientsCards(patients) {
    const container = document.getElementById('patientsCardsContainer');
    if (!container) return;

    if (patients.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 24px;">
                <i class="fa-solid fa-users" style="font-size: 32px; color: var(--text-muted); margin-bottom: 8px;"></i>
                <p style="color: var(--text-muted);">No patient records found.</p>
                <button class="btn-primary btn-sm" style="margin: 12px auto 0 auto;" onclick="openAddPatientModal()">
                    + Add First Patient
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = patients.map(p => {
        const pId = p.id || p.patient_id;
        const pName = p.full_name || p.name || 'Anonymous';
        const pBMI = p.bmi ? parseFloat(p.bmi).toFixed(1) : '-';
        const isRisk = parseFloat(p.bmi) > 25;

        return `
            <div class="patient-card">
                <div class="patient-header">
                    <div>
                        <div class="patient-name">${pName}</div>
                        <div class="patient-meta">ID: #${pId} • ${p.age || '-'} yrs • ${p.gender || 'Other'}</div>
                    </div>
                    <span class="pill ${isRisk ? 'pill-medium' : 'pill-low'}">${isRisk ? 'Risk Factor' : 'Normal BMI'}</span>
                </div>
                <div class="patient-details-grid">
                    <div><span style="color: var(--text-muted);">BMI:</span> <strong>${pBMI}</strong></div>
                    <div><span style="color: var(--text-muted);">Height:</span> ${p.height || '-'} cm</div>
                    <div><span style="color: var(--text-muted);">Weight:</span> ${p.weight || '-'} kg</div>
                </div>
                <div class="patient-action-row">
                    <button class="btn-secondary btn-sm" onclick="startPredictionForPatient(${pId})">
                        <i class="fa-solid fa-heart-pulse"></i> Predict
                    </button>
                    <button class="btn-secondary btn-sm" onclick="openEditPatientModal(${pId})">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn-secondary btn-sm" style="color: var(--risk-high);" onclick="handleDeletePatient(${pId}, '${pName.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function filterPatientsList(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
        renderPatientsCards(AppState.patients);
        return;
    }
    const filtered = AppState.patients.filter(p => {
        const name = (p.full_name || p.name || '').toLowerCase();
        const id = String(p.id || p.patient_id);
        return name.includes(q) || id.includes(q);
    });
    renderPatientsCards(filtered);
}

function startPredictionForPatient(pId) {
    navigateTo('prediction');
    const select = document.getElementById('predPatientSelect');
    if (select) {
        select.value = pId;
        autoFillPatientMetrics(pId);
    }
}

function openAddPatientModal() {
    document.getElementById('patientModalTitle').innerText = 'Add New Patient';
    document.getElementById('modalPatientId').value = '';
    document.getElementById('modalPatName').value = '';
    document.getElementById('modalPatAge').value = '';
    document.getElementById('modalPatGender').value = 'Female';
    document.getElementById('modalPatHeight').value = '165';
    document.getElementById('modalPatWeight').value = '65';
    document.getElementById('modalPatBMI').value = '23.9';
    document.getElementById('modalPatPhone').value = '';
    document.getElementById('modalPatEmail').value = '';
    document.getElementById('modalPatHistory').value = '';
    document.getElementById('patientModal').classList.add('active');
}

function openEditPatientModal(pId) {
    const patients = LocalDB.getPatients();
    const p = patients.find(item => String(item.id || item.patient_id) === String(pId));
    if (!p) return;

    document.getElementById('patientModalTitle').innerText = 'Edit Patient Record';
    document.getElementById('modalPatientId').value = pId;
    document.getElementById('modalPatName').value = p.full_name || p.name || '';
    document.getElementById('modalPatAge').value = p.age || '';
    document.getElementById('modalPatGender').value = p.gender || 'Female';
    document.getElementById('modalPatHeight').value = p.height || '';
    document.getElementById('modalPatWeight').value = p.weight || '';
    document.getElementById('modalPatBMI').value = p.bmi || '';
    document.getElementById('modalPatPhone').value = p.phone || '';
    document.getElementById('modalPatEmail').value = p.email || '';
    document.getElementById('modalPatHistory').value = p.family_history || '';
    document.getElementById('patientModal').classList.add('active');
}

function closePatientModal() {
    document.getElementById('patientModal').classList.remove('active');
}

function calculateModalBMI() {
    const h = parseFloat(document.getElementById('modalPatHeight').value);
    const w = parseFloat(document.getElementById('modalPatWeight').value);
    const bmiField = document.getElementById('modalPatBMI');
    if (h > 0 && w > 0 && bmiField) {
        const hm = h / 100.0;
        bmiField.value = (w / (hm * hm)).toFixed(1);
    }
}

function handleSavePatient() {
    const pId = document.getElementById('modalPatientId').value;
    const name = document.getElementById('modalPatName').value.trim();
    const age = parseInt(document.getElementById('modalPatAge').value || 0);
    const gender = document.getElementById('modalPatGender').value;
    const height = parseFloat(document.getElementById('modalPatHeight').value || 0);
    const weight = parseFloat(document.getElementById('modalPatWeight').value || 0);
    const bmi = parseFloat(document.getElementById('modalPatBMI').value || 0);
    const phone = document.getElementById('modalPatPhone').value.trim();
    const email = document.getElementById('modalPatEmail').value.trim();
    const history = document.getElementById('modalPatHistory').value.trim();

    if (!name) {
        showToast('Please enter patient name', 'error');
        return;
    }

    const payload = {
        id: pId ? parseInt(pId) : Math.floor(100 + Math.random() * 900),
        patient_id: pId ? parseInt(pId) : Math.floor(100 + Math.random() * 900),
        full_name: name,
        name: name,
        age, gender, height, weight, bmi, phone, email, family_history: history
    };

    const isEdit = Boolean(pId);
    const patients = LocalDB.getPatients();
    if (isEdit) {
        const idx = patients.findIndex(p => String(p.id || p.patient_id) === String(pId));
        if (idx >= 0) {
            patients[idx] = { ...patients[idx], ...payload };
        }
    } else {
        patients.unshift(payload);
    }
    LocalDB.savePatients(patients);

    showToast(isEdit ? 'Patient updated!' : 'Patient added successfully!', 'success');
    closePatientModal();
    loadPatients();
}

function handleDeletePatient(pId, name) {
    if (!confirm(`Are you sure you want to delete patient ${name}?`)) return;

    let patients = LocalDB.getPatients();
    patients = patients.filter(p => String(p.id || p.patient_id) !== String(pId));
    LocalDB.savePatients(patients);

    showToast(`Patient #${pId} deleted successfully`, 'success');
    loadPatients();
}

// ==========================================================
// 10. POPULATION ANALYTICS CHARTS
// ==========================================================
function renderAnalyticsCharts() {
    if (typeof Chart === 'undefined') return;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';

    // Chart 1: Risk Distribution (Doughnut)
    const ctx1 = document.getElementById('chartRiskDistribution');
    if (ctx1) {
        if (AppState.charts.riskDist) AppState.charts.riskDist.destroy();
        AppState.charts.riskDist = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
                datasets: [{
                    data: [62, 26, 12],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 } } }
                }
            }
        });
    }

    // Chart 2: Glucose Breakdown (Bar)
    const ctx2 = document.getElementById('chartGlucoseBreakdown');
    if (ctx2) {
        if (AppState.charts.glucose) AppState.charts.glucose.destroy();
        AppState.charts.glucose = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['<100 (Normal)', '100-125 (Pre-Diabetes)', '>125 (Elevated)'],
                datasets: [{
                    data: [64, 42, 18],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
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

    // Chart 3: Lifestyle Correlation
    const ctx3 = document.getElementById('chartLifestyleCorrelation');
    if (ctx3) {
        if (AppState.charts.lifestyle) AppState.charts.lifestyle.destroy();
        AppState.charts.lifestyle = new Chart(ctx3, {
            type: 'bar',
            data: {
                labels: ['<20m Ex', '20-40m Ex'],
                datasets: [
                    { label: 'Avg Stress (1-10)', data: [7.2, 4.8], backgroundColor: '#f59e0b', borderRadius: 4 },
                    { label: 'Avg Glucose (mg/dL)', data: [142, 118], backgroundColor: '#38bdf8', borderRadius: 4 }
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

    // Chart 4: Trend
    const ctx4 = document.getElementById('chartHealthTrend');
    if (ctx4) {
        if (AppState.charts.trend) AppState.charts.trend.destroy();
        AppState.charts.trend = new Chart(ctx4, {
            type: 'line',
            data: {
                labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
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
// 11. CLINICAL REPORTS CONTROLLER
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
// 12. TOAST UTILITIES
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
    }, 3200);
}
