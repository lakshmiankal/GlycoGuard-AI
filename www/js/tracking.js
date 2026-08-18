const API_URL = (window.CONFIG && window.CONFIG.API_BASE) ? window.CONFIG.API_BASE : "http://127.0.0.1:5000";

function getAuthHeaders() {
    const token = localStorage.getItem("glycoguard_token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

async function loadPatientsDropdown() {
    const select = document.getElementById("trackPatientSelect");
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

async function saveTrackingLog() {
    const patient_id = document.getElementById("trackPatientSelect").value;
    const water = parseFloat(document.getElementById("trackWater").value || 2.5);
    const sleep = parseFloat(document.getElementById("trackSleep").value || 7.5);
    const exercise = parseFloat(document.getElementById("trackExercise").value || 30);
    const blood_sugar = parseFloat(document.getElementById("trackBloodSugar").value || 98);
    const weight = parseFloat(document.getElementById("trackWeight").value || 68.5);
    const stress = parseInt(document.getElementById("trackStress").value || 3);

    const payload = {
        patient_id: patient_id ? parseInt(patient_id) : null,
        water, sleep, exercise, blood_sugar, weight, stress
    };

    try {
        const res = await fetch(`${API_URL}/tracking`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.status) {
            alert("Tracking entry logged successfully!");
            loadTrackingLogs();
        } else {
            alert("Failed to save entry: " + data.message);
        }
    } catch (err) {
        console.error("Tracking save error:", err);
    }
}

async function loadTrackingLogs() {
    const tableBody = document.getElementById("trackingTable");
    if (!tableBody) return;

    try {
        const res = await fetch(`${API_URL}/tracking`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (data.status && data.logs) {
            if (data.logs.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No tracking entries found. Log one above!</td></tr>`;
                return;
            }

            tableBody.innerHTML = data.logs.map(log => `
                <tr>
                    <td>${strDate(log.tracking_date)}</td>
                    <td>${log.patient_name || 'Patient #' + (log.patient_id || '-')}</td>
                    <td>${log.water || '-'} L</td>
                    <td>${log.sleep || '-'} hrs</td>
                    <td>${log.exercise || '-'} mins</td>
                    <td><strong style="color: ${log.blood_sugar > 125 ? '#ef4444' : '#10b981'};">${log.blood_sugar || '-'} mg/dL</strong></td>
                    <td>${log.stress || '-'}/10</td>
                </tr>
            `).join("");
        }
    } catch (err) {
        console.error("Tracking fetch error:", err);
    }
}

function strDate(dateStr) {
    if (!dateStr) return "Today";
    return String(dateStr).replace("T", " ").substring(0, 16);
}

document.addEventListener("DOMContentLoaded", () => {
    loadPatientsDropdown();
    loadTrackingLogs();
});
