document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const data = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };
fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === "success") {
            window.location.href = "index.html";
        } else {
            document.getElementById("msg").innerText = "Login failed";
        }
    })
    .catch(err => {
        console.log(err);
    });
});
async function predictRisk() {

    const data = {
        pregnancies: parseFloat(document.getElementById("pregnancies").value),
        glucose: parseFloat(document.getElementById("glucose").value),
        bloodPressure: parseFloat(document.getElementById("bloodPressure").value),
        skinThickness: parseFloat(document.getElementById("skinThickness").value),
        insulin: parseFloat(document.getElementById("insulin").value),
        bmi: parseFloat(document.getElementById("bmi").value),
        diabetesPedigree: parseFloat(document.getElementById("diabetesPedigree").value),
        age: parseFloat(document.getElementById("age").value),
        exerciseMinutes: parseFloat(document.getElementById("exerciseMinutes").value),
        sleepHours: parseFloat(document.getElementById("sleepHours").value),
        stressLevel: parseFloat(document.getElementById("stressLevel").value),
        waterIntake: parseFloat(document.getElementById("waterIntake").value)
    };

    const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    document.getElementById("riskLevel").innerText =
        `Risk Level: ${result.risk_level}`;

    document.getElementById("probability").innerText =
        `Probability: ${result.probability}%`;

    document.getElementById("recommendation").innerText =
        `Recommendation: ${result.recommendation}`;
}