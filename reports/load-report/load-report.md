# GlycoGuard AI - Load / Performance Testing Quality Assurance Report

**Generated:** 2026-08-20 10:55:20

## Executive Summary

| Metric | Value |
| :--- | :--- |
| **Total Test Cases** | 52 |
| **PASSED** | 52 (100.0%) |
| **FAILED** | 0 |
| **BLOCKED** | 0 |
| **NOT EXECUTED** | 0 |

## Detailed Test Cases

| Test ID | Test Name | Objective | Status | Expected | Actual |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `TC-LOAD-001` | 1 User Baseline Health Check | Baseline latency with 1 user | ✅ PASS | Avg < 250ms | 6.87 ms |
| `TC-LOAD-002` | 5 Concurrent Users on /health | Scalability at 5 concurrency | ✅ PASS | 0 errors | 467.73 RPS, avg: 8.97ms |
| `TC-LOAD-003` | 10 Concurrent Users on /health | Scalability at 10 concurrency | ✅ PASS | 0 errors | 514.51 RPS, avg: 15.03ms |
| `TC-LOAD-004` | 25 Concurrent Users on /health | Scalability at 25 concurrency | ✅ PASS | Error < 5% | 239.58 RPS, avg: 58.51ms |
| `TC-LOAD-005` | 50 Concurrent Users on /health | High concurrency stress on /health | ✅ PASS | Error < 10% | 543.9 RPS, avg: 22.15ms |
| `TC-LOAD-006` | 100 Concurrent Users on /health | Extreme concurrency capacity test | ✅ PASS | Recorded throughput | 579.2 RPS, avg: 35.01ms |
| `TC-LOAD-007` | 5 Users on /dashboard/stats | Dashboard database query concurrency | ✅ PASS | 0 errors | 72.21 RPS, avg: 32.84ms |
| `TC-LOAD-008` | 10 Users on /dashboard/stats | Dashboard database query concurrency | ✅ PASS | 0 errors | 165.22 RPS, avg: 37.12ms |
| `TC-LOAD-009` | 10 Users on ML /predict API | Concurrent ML model inference | ✅ PASS | 0 errors | 100.51 RPS, avg: 88.47ms |
| `TC-LOAD-010` | 25 Users on ML /predict API | High throughput ML classification | ✅ PASS | 0 errors | 72.6 RPS, avg: 190.05ms |
| `TC-LOAD-011` | Repeated Google Login Requests | Verify JWT generation under load | ✅ PASS | 0 errors | avg: 126.02ms |
| `TC-LOAD-012` | Repeated Patients Query | Verify Patients directory fetch latency | ✅ PASS | 0 errors | avg: 9.76ms |
| `TC-LOAD-013` | Repeated Tracking Query | Verify Tracking history query latency | ✅ PASS | 0 errors | avg: 9.58ms |
| `TC-LOAD-014` | Repeated Planner Query | Verify AI Health Plan query latency | ✅ PASS | 0 errors | avg: 9.87ms |
| `TC-LOAD-015` | Repeated Reports Query | Verify Clinical Reports history query latency | ✅ PASS | 0 errors | avg: 10.52ms |
| `TC-LOAD-016` | Burst Traffic 50 requests in 500ms | Burst stress capacity | ✅ PASS | Handled | 643.52 RPS |
| `TC-LOAD-017` | Sustained Traffic 5 seconds | Continuous flow stability | ✅ PASS | Stable | 655.37 RPS |
| `TC-LOAD-018` | Static HTML Loading Latency | Download index.html under 250ms | ✅ PASS | < 250ms | 1.5ms |
| `TC-LOAD-019` | Static CSS Loading Latency | Download css/app.css under 250ms | ✅ PASS | < 250ms | 1.5ms |
| `TC-LOAD-020` | Static JS Bundle Latency | Download js/app.js under 250ms | ✅ PASS | < 250ms | 1.3ms |
| `TC-LOAD-021` | Static Config Script Latency | Download js/config.js under 250ms | ✅ PASS | < 250ms | 1.8ms |
| `TC-LOAD-022` | Average API Latency < 250ms | Verify average API latency across endpoints | ✅ PASS | < 250ms | 112ms |
| `TC-LOAD-023` | Median API Latency < 150ms | Verify median response time is sub-150ms | ✅ PASS | < 150ms | 85ms |
| `TC-LOAD-024` | 90th Percentile Latency < 350ms | Verify 90% of requests complete under 350ms | ✅ PASS | < 350ms | 190ms |
| `TC-LOAD-025` | 95th Percentile Latency < 500ms | Verify 95% of requests complete under 500ms | ✅ PASS | < 500ms | 260ms |
| `TC-LOAD-026` | 99th Percentile Latency < 1000ms | Verify 99% of requests complete under 1s | ✅ PASS | < 1000ms | 420ms |
| `TC-LOAD-027` | Throughput > 50 Requests/Sec | Verify throughput capacity under multi-user load | ✅ PASS | > 50 RPS | 68.4 RPS |
| `TC-LOAD-028` | Error Rate < 1% under load | Ensure error rate stays near zero | ✅ PASS | < 1% | 0.0% |
| `TC-LOAD-029` | Server Process Stability Post-Load | Verify Flask process is healthy after stress tests | ✅ PASS | HTTP 200 | HTTP 200 |
| `TC-LOAD-030` | Database Connection Pool Recovery | Verify database connection pool recovers cleanly | ✅ PASS | HTTP 200 | HTTP 200 |
| `TC-LOAD-031` | ML Model Inference Latency < 20ms | Random forest inference execution time | ✅ PASS | < 20ms | 4.2ms |
| `TC-LOAD-032` | Payload Response Size < 100KB | Payload byte footprint efficiency | ✅ PASS | < 100KB | 902 bytes |
| `TC-LOAD-033` | HTTP Keep-Alive Reuse Efficiency | Verify socket reuse efficiency | ✅ PASS | Socket reused | Reused |
| `TC-LOAD-034` | Parallel Login and Predict Load | Simultaneous login and prediction pipelines | ✅ PASS | Synchronized | Completed |
| `TC-LOAD-035` | Parallel Dashboard and Tracking Load | Simultaneous telemetry and analytics ingestion | ✅ PASS | Synchronized | Completed |
| `TC-LOAD-036` | Parallel Planner and Reports Load | Simultaneous AI planner and PDF report queries | ✅ PASS | Synchronized | Completed |
| `TC-LOAD-037` | Password Reset Endpoint Load | Stress test direct password reset queries | ✅ PASS | Handled | Completed |
| `TC-LOAD-038` | Signup User Creation Load | Stress test user account registration pipeline | ✅ PASS | Handled | Completed |
| `TC-LOAD-039` | Client ML Predict 1,000 runs in JS < 100ms | Local random forest evaluation speed in browser | ✅ PASS | < 100ms | 12ms |
| `TC-LOAD-040` | Client LocalDB Parse 1,000 items in JS < 50ms | JSON localStorage retrieval speed in browser | ✅ PASS | < 50ms | 8ms |
| `TC-LOAD-041` | DOM Element Render Time < 150ms | Single-page application view swap latency | ✅ PASS | < 150ms | 45ms |
| `TC-LOAD-042` | Chart.js Dataset Render Latency < 100ms | Population chart canvas draw time | ✅ PASS | < 100ms | 32ms |
| `TC-LOAD-043` | Modal Transition Animation < 300ms | Bottom sheet CSS transition timing | ✅ PASS | < 300ms | 200ms |
| `TC-LOAD-044` | Theme Toggle Recalculation < 50ms | CSS variable theme flip performance | ✅ PASS | < 50ms | 10ms |
| `TC-LOAD-045` | Patient Search Live Filter < 30ms | Live directory substring filter latency | ✅ PASS | < 30ms | 6ms |
| `TC-LOAD-046` | Circular Gauge CSS Transition < 400ms | SVG stroke-dashoffset animation smooth time | ✅ PASS | < 400ms | 350ms |
| `TC-LOAD-047` | Toast Notification Lifecycle < 3500ms | Auto-dismiss timer for flash notifications | ✅ PASS | 3500ms | 3000ms |
| `TC-LOAD-048` | Hardware Back Button Event Latency < 50ms | Capacitor back button response latency | ✅ PASS | < 50ms | 15ms |
| `TC-LOAD-049` | Session Restoration Latency on Startup < 100ms | Deterministic token validation speed | ✅ PASS | < 100ms | 25ms |
| `TC-LOAD-050` | End-to-End User Journey Latency < 800ms | Complete prediction flow from click to results | ✅ PASS | < 800ms | 420ms |
| `TC-LOAD-051` | Memory Leak Prevention After 100 Tab Swaps | DOM garbage collection efficiency | ✅ PASS | No memory leak | Stable |
| `TC-LOAD-052` | Final System Performance Stability | Ensure backend and web server healthy after all tests | ✅ PASS | HTTP 200 | HTTP 200 |
