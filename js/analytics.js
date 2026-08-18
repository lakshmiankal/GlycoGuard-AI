document.addEventListener("DOMContentLoaded", () => {
    // Risk Distribution Chart (Doughnut)
    const ctxRisk = document.getElementById("riskDistributionChart");
    if (ctxRisk && typeof Chart !== "undefined") {
        new Chart(ctxRisk, {
            type: "doughnut",
            data: {
                labels: ["Low Risk", "Moderate Risk", "High Risk"],
                datasets: [{
                    data: [58, 28, 14],
                    backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom", labels: { color: "#e2e8f0" } }
                }
            }
        });
    }

    // Glucose Breakdown Chart (Bar)
    const ctxGlucose = document.getElementById("glucoseChart");
    if (ctxGlucose && typeof Chart !== "undefined") {
        new Chart(ctxGlucose, {
            type: "bar",
            data: {
                labels: ["<100 (Normal)", "100-125 (Prediabetes)", ">125 (High)"],
                datasets: [{
                    label: "Patient Count",
                    data: [64, 42, 20],
                    backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { ticks: { color: "#cbd5e1" } },
                    y: { ticks: { color: "#cbd5e1" } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // Lifestyle Correlation Chart (Bar)
    const ctxLife = document.getElementById("lifestyleChart");
    if (ctxLife && typeof Chart !== "undefined") {
        new Chart(ctxLife, {
            type: "bar",
            data: {
                labels: ["Group A (<20m Ex)", "Group B (20-40m Ex)", "Group C (>40m Ex)"],
                datasets: [
                    {
                        label: "Avg Stress (1-10)",
                        data: [7.2, 4.8, 3.1],
                        backgroundColor: "#f59e0b"
                    },
                    {
                        label: "Avg Glucose (mg/dL)",
                        data: [142, 118, 96],
                        backgroundColor: "#2563eb"
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: { ticks: { color: "#cbd5e1" } },
                    y: { ticks: { color: "#cbd5e1" } }
                },
                plugins: { legend: { labels: { color: "#e2e8f0" } } }
            }
        });
    }

    // Cohort Progress Chart (Line)
    const ctxTrend = document.getElementById("trendChart");
    if (ctxTrend && typeof Chart !== "undefined") {
        new Chart(ctxTrend, {
            type: "line",
            data: {
                labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
                datasets: [{
                    label: "Overall Health Score",
                    data: [68, 72, 76, 81, 85, 89],
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { ticks: { color: "#cbd5e1" } },
                    y: { ticks: { color: "#cbd5e1" } }
                },
                plugins: { legend: { labels: { color: "#e2e8f0" } } }
            }
        });
    }
});
