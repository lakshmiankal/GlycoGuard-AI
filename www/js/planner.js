const API_URL = (window.CONFIG && window.CONFIG.API_BASE) ? window.CONFIG.API_BASE : "http://127.0.0.1:5000";

function getAuthHeaders() {
    const token = localStorage.getItem("glycoguard_token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

async function generateAIPlan() {
    const riskSelect = document.getElementById("plannerRiskLevel");
    const riskLevel = riskSelect ? riskSelect.value : "Medium";

    try {
        const res = await fetch(`${API_URL}/planner`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ risk_level: riskLevel })
        });
        const data = await res.json();

        if (data.status && data.plan) {
            const p = data.plan;
            if (document.getElementById("planBreakfast")) document.getElementById("planBreakfast").innerText = p.breakfast || "";
            if (document.getElementById("planLunch")) document.getElementById("planLunch").innerText = p.lunch || "";
            if (document.getElementById("planSnacks")) document.getElementById("planSnacks").innerText = p.snacks || "";
            if (document.getElementById("planDinner")) document.getElementById("planDinner").innerText = p.dinner || "";
            if (document.getElementById("planExercise")) document.getElementById("planExercise").innerText = p.exercise || "";
            if (document.getElementById("planWaterSleep")) {
                document.getElementById("planWaterSleep").innerHTML = `
                    <strong>Water:</strong> ${p.water_goal || ''}<br>
                    <strong>Sleep:</strong> ${p.sleep_goal || ''}<br>
                    <strong>Stress Relief:</strong> ${p.stress_management || ''}
                `;
            }
        }
    } catch (err) {
        console.error("Planner API error:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const lastPred = localStorage.getItem("last_prediction");
    if (lastPred) {
        try {
            const predData = JSON.parse(lastPred);
            if (predData && predData.risk_level) {
                const select = document.getElementById("plannerRiskLevel");
                if (select) select.value = predData.risk_level;
            }
        } catch (e) {}
    }
    generateAIPlan();
});
