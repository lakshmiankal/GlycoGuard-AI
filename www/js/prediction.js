const API_URL = (window.CONFIG && window.CONFIG.API_BASE) ? window.CONFIG.API_BASE : "http://127.0.0.1:5000";

function getAuthHeaders() {
    const token = localStorage.getItem("glycoguard_token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

let currentPredictionResult = null;

async function loadPatientsDropdown() {
    const select = document.getElementById("patientSelect");
    if (!select) return;

    try {
        const res = await fetch(`${API_URL}/patients`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.status && data.patients) {
            data.patients.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.id || p.patient_id;
                opt.textContent = `${p.full_name || p.name} (ID: ${p.id || p.patient_id})`;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        console.log("Dropdown fetch error:", err);
    }
}

async function runPrediction() {
    const patient_id = document.getElementById("patientSelect").value;
    const glucose = parseFloat(document.getElementById("glucose").value || 120);
    const blood_pressure = parseFloat(document.getElementById("bloodPressure").value || 70);
    const bmi = parseFloat(document.getElementById("bmi").value || 25.4);
    const age = parseFloat(document.getElementById("age").value || 35);
    const pregnancies = parseFloat(document.getElementById("pregnancies").value || 0);
    const skin_thickness = parseFloat(document.getElementById("skinThickness").value || 20);
    const insulin = parseFloat(document.getElementById("insulin").value || 80);
    const dpf = parseFloat(document.getElementById("dpf").value || 0.47);
    const exercise = parseFloat(document.getElementById("exercise").value || 30);
    const sleep = parseFloat(document.getElementById("sleep").value || 7.5);
    const stress = parseFloat(document.getElementById("stress").value || 4);

    const payload = {
        patient_id: patient_id ? parseInt(patient_id) : null,
        glucose, blood_pressure, bmi, age, pregnancies,
        skin_thickness, insulin, diabetes_pedigree: dpf,
        exercise_minutes: exercise, sleep_hours: sleep, stress_level: stress
    };

    try {
        const res = await fetch(`${API_URL}/predict`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.status) {
            currentPredictionResult = data;
            localStorage.setItem("last_prediction", JSON.stringify(data));

            const riskTag = document.getElementById("riskTag");
            const probText = document.getElementById("probText");
            const riskBar = document.getElementById("riskBar");
            const recText = document.getElementById("recText");

            probText.innerText = `${data.probability}%`;
            recText.innerText = data.recommendation;

            if (data.risk_level === "High") {
                riskTag.innerText = "High Risk";
                riskTag.className = "pill high";
                riskBar.style.backgroundColor = "#ef4444";
            } else if (data.risk_level === "Medium") {
                riskTag.innerText = "Medium Risk";
                riskTag.className = "pill medium";
                riskBar.style.backgroundColor = "#f59e0b";
            } else {
                riskTag.innerText = "Low Risk";
                riskTag.className = "pill low";
                riskBar.style.backgroundColor = "#10b981";
            }

            riskBar.style.width = `${Math.min(data.probability, 100)}%`;
        } else {
            alert("Prediction error: " + data.message);
        }
    } catch (err) {
        console.error("Prediction API error:", err);
        alert("Failed to connect to prediction server.");
    }
}

function goToPlanner() {
    if (currentPredictionResult) {
        window.location.href = "planner.html";
    } else {
        alert("Please run a prediction first!");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadPatientsDropdown();

    const urlParams = new URLSearchParams(window.location.search);
    const pId = urlParams.get("patient_id");
    if (pId) {
        setTimeout(() => {
            const select = document.getElementById("patientSelect");
            if (select) select.value = pId;
        }, 500);
    }
});
