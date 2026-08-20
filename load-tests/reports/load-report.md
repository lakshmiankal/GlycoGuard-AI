# GlycoGuard AI - 100 Virtual Users Baseline Load Test Report

**Execution Date:** 2026-08-20 11:20:18  
**Target Concurrency:** 100 Virtual Users (VUs)  
**Duration:** 64.02 Seconds (1 Continuous Minute)  
**Overall Status:** **PASS**  

---

## 1. Key Performance Indicators (KPIs)

| Metric | Measured Result | SLA Target | Operational Meaning |
| :--- | :--- | :--- | :--- |
| **Throughput (RPS)** | **252.2 req/sec** | > 100 req/sec | API handles ~252.2 requests every second |
| **Average Response Time** | **377.2 ms** | < 250 ms | Mean round-trip latency |
| **Fastest Latency (Min)** | **0.3 ms** | < 50 ms | Fastest response recorded |
| **Median Latency (p50)** | **229.7 ms** | < 150 ms | 50% of requests faster than this |
| **90th Percentile (p90)** | **971.2 ms** | < 350 ms | 90% of requests faster than this |
| **95th Percentile (p95)** | **1257.5 ms** | < 500 ms | 95% of requests faster than this |
| **99th Percentile (p99)** | **2001.8 ms** | < 1000 ms | 99% of requests faster than this |
| **Slowest Latency (Max)** | **4682.4 ms** | < 1500 ms | Slowest response recorded |
| **Total Requests Sent** | **16,147 reqs** | Thousands in 1 min | Total requests during the 1-minute test |
| **Success Rate / Errors** | **100.00%** | Error < 1.0% | 0 socket drops or timeout failures |

## 2. Endpoint Breakdown Table

| Endpoint | Scope | Requests | Throughput | Min Latency | Avg Latency | p95 Latency | Max Latency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/health` | Health Check Probe | 3,989 | 62.3 req/s | 0.3 ms | 0.5 ms | 0.7 ms | 20.2 ms |
| `/predict` | ML Diabetes Risk Prediction | 4,883 | 76.3 req/s | 11.8 ms | 716.4 ms | 1528.5 ms | 3767.4 ms |
| `/dashboard/stats` | Clinic Dashboard KPI Stats | 2,479 | 38.7 req/s | 9.5 ms | 563.1 ms | 1747.8 ms | 4682.4 ms |
| `/patients` | Patient Directory Query | 1,589 | 24.8 req/s | 1.9 ms | 200.4 ms | 673.8 ms | 1975.4 ms |
| `/tracking` | Daily Vitals Tracking Query | 1,576 | 24.6 req/s | 2.0 ms | 203.2 ms | 674.4 ms | 2015.1 ms |
| `/planner` | AI Care Planner Protocol | 797 | 12.4 req/s | 6.2 ms | 492.5 ms | 1334.7 ms | 2649.5 ms |
| `/reports` | Clinical Reports Archive | 834 | 13.0 req/s | 2.1 ms | 196.9 ms | 656.1 ms | 1820.6 ms |
