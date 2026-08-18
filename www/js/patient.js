const API_URL = (window.CONFIG && window.CONFIG.API_BASE) ? window.CONFIG.API_BASE : "http://127.0.0.1:5000";

function getAuthHeaders() {
    const token = localStorage.getItem("glycoguard_token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

let editingPatientId = null;

// BMI Auto Calculation
const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");
const bmiInput = document.getElementById("bmi");

function calculateBMI() {
    if (!heightInput || !weightInput || !bmiInput) return;
    const h = parseFloat(heightInput.value) / 100;
    const w = parseFloat(weightInput.value);
    if (h > 0 && w > 0) {
        bmiInput.value = (w / (h * h)).toFixed(2);
    }
}

if (heightInput && weightInput) {
    heightInput.addEventListener("input", calculateBMI);
    weightInput.addEventListener("input", calculateBMI);
}

// Load Patients from Backend
async function loadPatients() {
    const tableBody = document.getElementById("patientTable");
    if (!tableBody) return;

    try {
        const res = await fetch(`${API_URL}/patients`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (data.status && data.patients) {
            if (data.patients.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #94a3b8;">No patient records found. Fill out the form above to add a new patient.</td></tr>`;
                return;
            }

            tableBody.innerHTML = data.patients.map(p => {
                const pId = p.id || p.patient_id;
                const pName = p.full_name || p.name || 'Anonymous';
                const pBmi = p.bmi ? parseFloat(p.bmi).toFixed(1) : '-';
                const riskClass = (parseFloat(p.bmi) > 25) ? 'medium' : 'low';
                const riskLabel = (parseFloat(p.bmi) > 25) ? 'Moderate Risk' : 'Normal';

                return `
                <tr data-id="${pId}">
                    <td><strong>#${pId}</strong></td>
                    <td><strong style="color: #f8fafc;">${pName}</strong></td>
                    <td>${p.age || '-'} yrs</td>
                    <td>${pBmi}</td>
                    <td><span class="${riskClass}">${riskLabel}</span></td>
                    <td style="white-space: nowrap;">
                        <button class="edit" onclick="editPatient(${pId})" style="margin-right:4px; cursor:pointer;"><i class="fa fa-pen"></i> Edit</button>
                        <button class="view" onclick="viewPatientDetails(${pId})" style="margin-right:4px; cursor:pointer;"><i class="fa fa-eye"></i> View</button>
                        <button class="delete" onclick="deletePatient(${pId}, '${pName.replace(/'/g, "\\'")}')" style="cursor:pointer;"><i class="fa fa-trash"></i> Delete</button>
                    </td>
                </tr>
                `;
            }).join("");
        }
    } catch (err) {
        console.error("Error loading patients:", err);
    }
}

// Save or Update Patient
async function savePatient() {
    const nameVal = document.getElementById("name") ? document.getElementById("name").value.trim() : "";
    const ageVal = document.getElementById("age") ? document.getElementById("age").value : "";
    const genderVal = document.getElementById("gender") ? document.getElementById("gender").value : "Male";
    const phoneVal = document.getElementById("phone") ? document.getElementById("phone").value.trim() : "";
    const emailVal = document.getElementById("email") ? document.getElementById("email").value.trim() : "";
    const heightVal = document.getElementById("height") ? document.getElementById("height").value : "";
    const weightVal = document.getElementById("weight") ? document.getElementById("weight").value : "";
    const bmiVal = document.getElementById("bmi") ? document.getElementById("bmi").value : "";
    const addressVal = document.getElementById("address") ? document.getElementById("address").value.trim() : "";
    const historyVal = document.getElementById("history") ? document.getElementById("history").value.trim() : "";

    if (!nameVal) {
        alert("Please enter patient name");
        return;
    }

    const payload = {
        full_name: nameVal,
        age: ageVal ? parseInt(ageVal) : 0,
        gender: genderVal,
        phone: phoneVal,
        email: emailVal,
        height: heightVal ? parseFloat(heightVal) : 0.0,
        weight: weightVal ? parseFloat(weightVal) : 0.0,
        bmi: bmiVal ? parseFloat(bmiVal) : 0.0,
        address: addressVal,
        family_history: historyVal
    };

    try {
        let response;
        if (editingPatientId) {
            response = await fetch(`${API_URL}/patients/${editingPatientId}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(`${API_URL}/patients`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
        }

        const resData = await response.json();
        if (resData.status) {
            alert(editingPatientId ? `Patient #${editingPatientId} updated successfully!` : "New Patient added successfully!");
            cancelEditMode();
            loadPatients();
        } else {
            alert(resData.message || "Failed to save patient.");
        }
    } catch (err) {
        console.error("Save error:", err);
        alert("Server error while saving patient.");
    }
}

// Edit Patient Function
async function editPatient(id) {
    try {
        const res = await fetch(`${API_URL}/patients/${id}`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.status && data.patient) {
            const p = data.patient;
            editingPatientId = p.id || p.patient_id;

            if (document.getElementById("name")) document.getElementById("name").value = p.full_name || p.name || "";
            if (document.getElementById("age")) document.getElementById("age").value = p.age || "";
            if (document.getElementById("gender")) document.getElementById("gender").value = p.gender || "Male";
            if (document.getElementById("phone")) document.getElementById("phone").value = p.phone || "";
            if (document.getElementById("email")) document.getElementById("email").value = p.email || "";
            if (document.getElementById("height")) document.getElementById("height").value = p.height || "";
            if (document.getElementById("weight")) document.getElementById("weight").value = p.weight || "";
            if (document.getElementById("bmi")) document.getElementById("bmi").value = p.bmi || "";
            if (document.getElementById("address")) document.getElementById("address").value = p.address || "";
            if (document.getElementById("history")) document.getElementById("history").value = p.family_history || "";

            // Update Form UI for Edit mode
            const formHeader = document.querySelector(".card h2");
            if (formHeader) formHeader.innerHTML = `✏ Edit Patient Record (ID: #${editingPatientId})`;

            const saveBtn = document.querySelector(".save");
            if (saveBtn) saveBtn.innerHTML = `<i class="fa fa-check"></i> Update Patient Details`;

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (err) {
        console.error("Edit fetch error:", err);
    }
}

function cancelEditMode() {
    editingPatientId = null;
    const form = document.getElementById("patientForm");
    if (form) form.reset();
    if (bmiInput) bmiInput.value = "";

    const formHeader = document.querySelector(".card h2");
    if (formHeader) formHeader.innerHTML = `Patient Information`;

    const saveBtn = document.querySelector(".save");
    if (saveBtn) saveBtn.innerHTML = `Save Patient`;
}

// View Patient Details Modal
async function viewPatientDetails(id) {
    try {
        const res = await fetch(`${API_URL}/patients/${id}`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (!data.status || !data.patient) {
            alert("Patient details not found.");
            return;
        }

        const p = data.patient;
        const pId = p.id || p.patient_id;
        const pName = p.full_name || p.name || 'N/A';

        let modal = document.getElementById("viewPatientModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "viewPatientModal";
            modal.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;justify-content:center;align-items:center;z-index:99999;";
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div style="width:460px; background:#1e293b; border-radius:20px; padding:30px; border:1px solid #334155; box-shadow:0 10px 40px rgba(0,0,0,0.7); color:white; font-family:sans-serif;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #334155; padding-bottom:12px;">
                    <h2 style="margin:0; font-size:20px; color:#38bdf8;">👤 Patient Details (#${pId})</h2>
                    <button onclick="closeViewPatientModal()" style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">&times;</button>
                </div>

                <div style="background:#0f172a; border-radius:12px; padding:18px; font-size:13px; border:1px solid #334155; display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div><strong style="color:#94a3b8; display:block; font-size:11px; text-transform:uppercase;">Full Name</strong><span style="font-size:14px; color:#f8fafc; font-weight:bold;">${pName}</span></div>
                    <div><strong style="color:#94a3b8; display:block; font-size:11px; text-transform:uppercase;">Age / Gender</strong><span>${p.age || '-'} yrs (${p.gender || 'N/A'})</span></div>
                    <div><strong style="color:#94a3b8; display:block; font-size:11px; text-transform:uppercase;">Phone</strong><span>${p.phone || 'N/A'}</span></div>
                    <div><strong style="color:#94a3b8; display:block; font-size:11px; text-transform:uppercase;">Email</strong><span>${p.email || 'N/A'}</span></div>
                    <div><strong style="color:#94a3b8; display:block; font-size:11px; text-transform:uppercase;">Height / Weight</strong><span>${p.height || '-'} cm / ${p.weight || '-'} kg</span></div>
                    <div><strong style="color:#94a3b8; display:block; font-size:11px; text-transform:uppercase;">BMI Score</strong><span style="color:#38bdf8; font-weight:bold;">${p.bmi || '-'}</span></div>
                    <div style="grid-column: span 2;"><strong style="color:#94a3b8; display:block; font-size:11px; text-transform:uppercase;">Address</strong><span>${p.address || 'No address specified'}</span></div>
                    <div style="grid-column: span 2;"><strong style="color:#94a3b8; display:block; font-size:11px; text-transform:uppercase;">Family History</strong><span>${p.family_history || 'None'}</span></div>
                </div>

                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button onclick="window.location.href='prediction.html?patient_id=${pId}'" style="flex:1; padding:12px; border:none; border-radius:10px; background:linear-gradient(to right, #2563EB, #06B6D4); color:white; font-weight:bold; cursor:pointer;">
                        <i class="fa fa-heart-pulse"></i> Run Risk Prediction
                    </button>
                    <button onclick="closeViewPatientModal()" style="padding:12px 20px; border:1px solid #334155; border-radius:10px; background:transparent; color:#cbd5e1; font-weight:bold; cursor:pointer;">
                        Close
                    </button>
                </div>
            </div>
        `;
        modal.style.display = "flex";
    } catch (err) {
        console.error("View error:", err);
        alert("Failed to load patient details.");
    }
}

function closeViewPatientModal() {
    const modal = document.getElementById("viewPatientModal");
    if (modal) modal.style.display = "none";
}

// Delete Patient
async function deletePatient(id, name = "this patient") {
    if (!confirm(`Are you sure you want to delete patient record #${id} (${name})?\n\nThis action cannot be undone.`)) return;

    try {
        const res = await fetch(`${API_URL}/patients/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.status) {
            alert(`Patient #${id} deleted successfully.`);
            if (editingPatientId === id) {
                cancelEditMode();
            }
            loadPatients();
        } else {
            alert("Delete failed: " + data.message);
        }
    } catch (err) {
        console.error("Delete error:", err);
        alert("Server error while deleting patient.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadPatients();

    const saveBtn = document.querySelector(".save");
    if (saveBtn) {
        saveBtn.addEventListener("click", (e) => {
            e.preventDefault();
            savePatient();
        });
    }

    const cancelBtn = document.querySelector(".cancel");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            cancelEditMode();
        });
    }
});