function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    const dateElem = document.getElementById("currentDateTime");
    if (dateElem) {
        dateElem.innerHTML =
            now.toLocaleDateString("en-US", options) +
            " | " +
            now.toLocaleTimeString();
    }
}

setInterval(updateDateTime, 1000);

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = "Welcome Back 👋";
    if (hour < 12) {
        greeting = "Good Morning ☀";
    } else if (hour < 17) {
        greeting = "Good Afternoon 🌤";
    } else {
        greeting = "Good Evening 🌙";
    }

    const userName = localStorage.getItem("glycoguard_name") || localStorage.getItem("glycoguard_user");
    if (userName) {
        greeting += `, ${userName}`;
    }

    const topbarTitle = document.querySelector(".topbar h1");
    if (topbarTitle) {
        topbarTitle.innerHTML = greeting;
    }
}

function checkUserSession() {
    const token = localStorage.getItem("glycoguard_token");
    const user = localStorage.getItem("glycoguard_user");

    if (!token && !user) {
        console.warn("Notice: No active user session found. Redirecting to login page...");
        // If unauthenticated session on dashboard page
        window.location.href = "../auth.html";
        return false;
    }
    return true;
}

function animateValue(id, start, end, duration) {
    let obj = document.getElementById(id);
    if (!obj) return;
    if (end === 0) {
        obj.innerHTML = 0;
        return;
    }
    let range = end - start;
    let increment = range / 30;
    let current = start;
    let timer = setInterval(() => {
        current += increment;
        obj.innerHTML = Math.floor(current);
        if (current >= end) {
            obj.innerHTML = end;
            clearInterval(timer);
        }
    }, duration / 30);
}

// User profile active modal component
function showProfileModal() {
    let modal = document.getElementById("userProfileModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "userProfileModal";
        modal.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;justify-content:center;align-items:center;z-index:99999;";
        document.body.appendChild(modal);
    }

    const uName = localStorage.getItem("glycoguard_name") || "Medical Practitioner";
    const uUsername = localStorage.getItem("glycoguard_user") || "User";
    const uEmail = localStorage.getItem("glycoguard_email") || `${uUsername}@glycoguard.ai`;

    modal.innerHTML = `
        <div style="width:380px; background:#1e293b; border-radius:20px; padding:30px; border:1px solid #334155; box-shadow:0 10px 40px rgba(0,0,0,0.7); text-align:center; color:white; font-family:sans-serif;">
            <div style="width:70px; height:70px; border-radius:50%; background:linear-gradient(135deg, #2563EB, #06B6D4); color:white; display:flex; justify-content:center; align-items:center; font-size:32px; font-weight:bold; margin:0 auto 15px auto;">
                ${uName.charAt(0).toUpperCase()}
            </div>
            <h2 style="margin-bottom:4px; font-size:20px; color:#f8fafc;">${uName}</h2>
            <div style="font-size:13px; color:#38bdf8; margin-bottom:15px; font-weight:600;">@${uUsername}</div>

            <div style="background:#0f172a; border-radius:12px; padding:15px; text-align:left; margin-bottom:20px; font-size:13px; border:1px solid #334155;">
                <div style="margin-bottom:12px;">
                    <span style="color:#94a3b8; display:block; font-size:11px; font-weight:bold; text-transform:uppercase;">Registered Email Address</span>
                    <span style="color:#f8fafc; font-weight:600; font-size:14px; word-break:break-all;">✉ ${uEmail}</span>
                </div>
                <div style="margin-bottom:12px;">
                    <span style="color:#94a3b8; display:block; font-size:11px; font-weight:bold; text-transform:uppercase;">Session Status</span>
                    <span style="color:#4ade80; font-weight:600;">● Active Dashboard Session</span>
                </div>
                <div>
                    <span style="color:#94a3b8; display:block; font-size:11px; font-weight:bold; text-transform:uppercase;">Account Role</span>
                    <span style="color:#38bdf8; font-weight:600;">Patient / Practitioner</span>
                </div>
            </div>

            <button onclick="logoutUser()" style="width:100%; padding:12px; border:none; border-radius:10px; background:#ef4444; color:white; font-weight:bold; cursor:pointer; font-size:14px; margin-bottom:10px;">
                <i class="fa-solid fa-right-from-bracket"></i> End Session & Log Out
            </button>
            <button onclick="closeProfileModal()" style="width:100%; padding:10px; border:1px solid #334155; border-radius:10px; background:transparent; color:#cbd5e1; font-weight:600; cursor:pointer; font-size:13px;">
                Close
            </button>
        </div>
    `;
    modal.style.display = "flex";
}

function closeProfileModal() {
    const modal = document.getElementById("userProfileModal");
    if (modal) modal.style.display = "none";
}

function logoutUser() {
    localStorage.removeItem("glycoguard_token");
    localStorage.removeItem("glycoguard_user");
    localStorage.removeItem("glycoguard_name");
    localStorage.removeItem("glycoguard_email");
    window.location.href = "../auth.html";
}

// Fetch live dashboard statistics from Flask API
async function loadDashboardStats() {
    const token = localStorage.getItem("glycoguard_token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const apiBase = (window.CONFIG && window.CONFIG.API_BASE) ? window.CONFIG.API_BASE : "http://127.0.0.1:5000";
        const res = await fetch(`${apiBase}/dashboard/stats`, { headers });
        
        if (res.status === 401) {
            console.warn("Session expired or unauthorized. Redirecting to login...");
            logoutUser();
            return;
        }

        const data = await res.json();

        if (data.status && data.stats) {
            animateValue("patientCount", 0, data.stats.total_patients || 0, 800);
            animateValue("predictionCount", 0, data.stats.total_predictions || 0, 800);
            
            const planElem = document.getElementById("planCount");
            if (planElem) animateValue("planCount", 0, data.stats.total_plans || 0, 800);

            // Update AI Summary List
            const sumPatients = document.getElementById("sumPatients");
            if (sumPatients) sumPatients.innerHTML = `✔ <strong>${data.stats.total_patients || 0}</strong> Registered Patients`;

            const sumPredictions = document.getElementById("sumPredictions");
            if (sumPredictions) sumPredictions.innerHTML = `✔ <strong>${data.stats.total_predictions || 0}</strong> Predictions Executed`;

            const sumPlans = document.getElementById("sumPlans");
            if (sumPlans) sumPlans.innerHTML = `✔ <strong>${data.stats.total_plans || 0}</strong> AI Health Plans Generated`;
        } else {
            animateValue("patientCount", 0, 0, 500);
            animateValue("predictionCount", 0, 0, 500);
        }

        const tableBody = document.querySelector(".activity-table tbody");
        if (tableBody) {
            if (data.recent_activity && data.recent_activity.length > 0) {
                tableBody.innerHTML = data.recent_activity.map(act => {
                    const statusClass = act.status === "Completed" ? "success" : "pending";
                    return `
                    <tr>
                        <td><strong style="color:#f8fafc;">${act.patient_name}</strong></td>
                        <td>${act.activity}</td>
                        <td>${act.date}</td>
                        <td><span class="${statusClass}">${act.status}</span></td>
                    </tr>
                    `;
                }).join("");
            } else {
                tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:15px;">No recent database activity found. Perform predictions or add patients above!</td></tr>`;
            }
        }

    } catch (err) {
        console.log("Notice: Dashboard API offline or unauthenticated", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateDateTime();
    updateGreeting();

    if (checkUserSession()) {
        loadDashboardStats();
    }

    // Refresh stats when user returns to window tab
    window.addEventListener("focus", loadDashboardStats);

    const ctx = document.getElementById("progressChart");
    if (ctx && typeof Chart !== "undefined") {
        new Chart(ctx, {
            type: "line",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [{
                    label: "Health Index",
                    data: [75, 80, 78, 82, 86, 90, 94],
                    borderColor: "#2563EB",
                    backgroundColor: "rgba(37,99,235,.15)",
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
});