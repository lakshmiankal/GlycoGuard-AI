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
    const select = document.getElementById("reportPatientSelect");
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

async function generateReport() {
    const pId = document.getElementById("reportPatientSelect").value;
    if (!pId) {
        alert("Please select a patient first!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/reports`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ patient_id: parseInt(pId), report_name: "GlycoGuard AI Diabetes Clinical Report" })
        });
        const data = await res.json();

        if (data.status && data.report) {
            const r = data.report;
            const patient = r.patient || {};
            const pred = r.latest_prediction || {};

            document.getElementById("repName").innerText = patient.full_name || patient.name || "N/A";
            document.getElementById("repAgeGender").innerText = `${patient.age || '-'} yrs / ${patient.gender || '-'}`;
            document.getElementById("repPhone").innerText = patient.phone || "-";
            document.getElementById("repEmail").innerText = patient.email || "-";
            document.getElementById("repHW").innerText = `${patient.height || '-'} cm / ${patient.weight || '-'} kg`;
            document.getElementById("repBMI").innerText = patient.bmi || "-";

            document.getElementById("repRisk").innerText = pred.risk_level || "Not Evaluated";
            document.getElementById("repProb").innerText = pred.probability ? `${pred.probability}%` : "N/A";
            document.getElementById("repRec").innerText = pred.recommendation || "No prediction on file yet.";

            document.getElementById("repDate").innerText = "Date: " + new Date().toLocaleDateString();
            document.getElementById("repId").innerText = "Report #: GG-2026-" + Math.floor(1000 + Math.random() * 9000);

            document.getElementById("reportContainer").style.display = "block";
            window.scrollTo({ top: 300, behavior: 'smooth' });

            loadReportHistory();
        }
    } catch (err) {
        console.error("Report error:", err);
        alert("Failed to generate report.");
    }
}

async function loadReportHistory() {
    const tableBody = document.getElementById("reportsTable");
    if (!tableBody) return;

    try {
        const res = await fetch(`${API_URL}/reports`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (data.status && data.reports) {
            if (data.reports.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No generated reports found.</td></tr>`;
                return;
            }

            tableBody.innerHTML = data.reports.map(rep => `
                <tr>
                    <td>${strDate(rep.generated_on)}</td>
                    <td>${rep.patient_name || 'Patient #' + (rep.patient_id || '-')}</td>
                    <td>${rep.report_name || 'Assessment Report'}</td>
                    <td><button class="view" onclick="generateReportForId(${rep.patient_id})">View Report</button></td>
                </tr>
            `).join("");
        }
    } catch (err) {
        console.error("Reports history fetch error:", err);
    }
}

function generateReportForId(id) {
    const select = document.getElementById("reportPatientSelect");
    if (select) select.value = id;
    generateReport();
}

function strDate(dateStr) {
    if (!dateStr) return "Today";
    return String(dateStr).replace("T", " ").substring(0, 16);
}

document.addEventListener("DOMContentLoaded", () => {
    loadPatientsDropdown();
    loadReportHistory();
});
