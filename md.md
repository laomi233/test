Here is a comprehensive **Performance Test Strategy Plan** written in professional English. You can use this document for stakeholder reviews, test planning, and execution guidance.

---

# Performance Test Strategy Plan
**Project:** Hybrid Architecture Migration (AEM Cloud + On-Premise) & CloudFront Routing
**Version:** 1.0
**Date:** January 15, 2026

---

## 1. Executive Summary
The purpose of this strategy is to validate the performance and stability of the new **CloudFront Routing implementation**. As we migrate partial traffic (approx. 2%) to AEM Cloud while keeping the majority (98%) on the legacy On-Premise infrastructure, it is critical to ensure that the routing logic is accurate under load and that the On-Premise infrastructure remains stable when served behind the CDN layer.

## 2. Test Scope

### 2.1 In-Scope
*   **CloudFront Routing Logic:** Verifying that traffic is correctly directed to *AEM Cloud* or *On-Prem* origins based on URL paths.
*   **On-Premise Stability:** Assessing CPU, Memory, and Connection Pool health of the On-Prem servers under the new CDN architecture.
*   **End-to-End Latency:** Measuring the Time To First Byte (TTFB) and total page load time including the CloudFront overhead.
*   **Cache Behavior:** Validating Cache Hit vs. Cache Miss/Bypass scenarios.

### 2.2 Out-of-Scope
*   **AEM Cloud Capacity Limit:** Since AEM Cloud is an auto-scaling SaaS, we will not test its breaking point. We will only validate connectivity and basic response.
*   **Static Asset Stress:** The primary TPS target is calculated based on HTML Document/Page Views. Static assets (CSS/JS) will be downloaded as background traffic but are not the primary metric for throughput.

---

## 3. Workload Modeling

Based on production analytics (Adobe Analytics), the peak 15-minute traffic is **87 TPS**.

### 3.1 Sizing & Targets
We apply a **1.5x Safety Factor** to account for micro-bursts and future growth.

| Metric | Value | Calculation |
| :--- | :--- | :--- |
| **Baseline Peak TPS** | 87 TPS | Derived from Peak PVs |
| **Safety Buffer** | 1.5x | Industry Standard |
| **Target Test TPS** | **130 TPS** | $87 \times 1.5$ |

### 3.2 Traffic Distribution (98/2 Split)

| Target System | Share | Target TPS | Objective |
| :--- | :--- | :--- | :--- |
| **On-Premise** | 98% | **~127 TPS** | Stress test legacy infrastructure behind CDN. |
| **AEM Cloud** | 2% | **~3 TPS** | Validate routing rules and connectivity. |
| **Total** | 100% | **130 TPS** | Verify total system throughput. |

---

## 4. Test Scenarios

### 4.1 Scenario A: Routing Validation (Smoke Test)
*   **Objective:** Ensure zero "cross-talk" (e.g., On-Prem pages routing to AEM or vice versa).
*   **Load:** Low (1–5 TPS).
*   **Method:** Request a mix of AEM and On-Prem URLs.
*   **Validation:** Strict Assertion on Response Body content (Check for legacy vs. new DOM elements).

### 4.2 Scenario B: Peak Load Test
*   **Objective:** Validate system stability at 150% of expected peak traffic.
*   **Duration:** 1 Hour (Must cover multiple CDN TTL cycles).
*   **Load:** 130 TPS.
*   **Cache Strategy:**
    *   **90% Standard Requests:** Mimic normal user behavior (hitting CloudFront Cache).
    *   **10% Cache Busting:** Append random query params (e.g., `?cb=${UUID}`) to force requests through to the Origin (On-Prem).

### 4.3 Scenario C: Soak Test (Endurance)
*   **Objective:** Detect memory leaks, connection pool exhaustion, and Keep-Alive issues.
*   **Duration:** 4 – 8 Hours.
*   **Load:** 87 TPS (100% Baseline Peak).
*   **Focus:** Monitor On-Premise TCP connection counts and AEM authentication token validity over time.

---

## 5. Test Data & Sampling Strategy

Since we are testing a subset of pages, the URL selection is critical.

### 5.1 URL Sources (CSV Data)
*   **`onprem_urls.csv`:** Contains Top 20 high-traffic pages + 5 heavy-logic pages (Search, User Profile) from the legacy site.
*   **`aem_urls.csv`:** Contains the specific pages migrated to AEM.

### 5.2 Boundary Testing
*   Include URLs with similar path patterns to verify Regex priority in CloudFront Behaviors.
    *   *Example:* `/products/legacy-item` (Target: On-Prem) vs. `/products/new-feature` (Target: AEM).

---

## 6. Execution Strategy (Distributed)

To ensure accurate load generation for the uneven split (98/2), we will use a **Role-Based Injection Strategy** with 3 Load Injectors (Users/Machines).

| Injector ID | Role / Thread Group | Target Load | Rationale |
| :--- | :--- | :--- | :--- |
| **Injector A** | **AEM (Full)** + On-Prem (Partial) | ~43 TPS | Concentrates all 3 TPS of AEM traffic here for better monitoring, plus helps with On-Prem load. |
| **Injector B** | On-Prem Only | ~43 TPS | Pure load generation for legacy server. |
| **Injector C** | On-Prem Only | ~44 TPS | Pure load generation for legacy server. |
| **Total** | | **130 TPS** | |

*   **Note:** Ensure unique random seeds or split CSV files per injector to prevent all users from hitting the exact same URL at the exact same millisecond.

---

## 7. Success Criteria (KPIs)

The test will be considered successful only if **ALL** the following criteria are met:

1.  **Throughput:** System sustains **130 TPS** for the duration of the Peak Test.
2.  **Routing Accuracy:** **0% Routing Errors**. (No On-Prem content served for AEM URLs, and vice versa).
3.  **Error Rate:** **< 1%** (excluding valid 404s). Zero 502/503/504 Gateway errors.
4.  **Latency:**
    *   CloudFront Cache Hit: < 100ms.
    *   CloudFront Cache Miss (Origin Fetch): Baseline On-Prem Response Time + <100ms overhead.
5.  **Server Health (On-Prem):** CPU and Memory utilization remains below **80%**. No linear growth in TCP connections during the Soak Test.

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **WAF Blocking** | Test IPs might be flagged as DDoS attackers by AWS WAF or Akamai. | Whitelist Test Injector IPs in WAF rules prior to execution. |
| **Artificial Caching** | Testing with too few URLs leads to 100% Cache Hit, failing to stress the Origin. | Implement **Cache Busting** (random query strings) on 10-20% of requests. |
| **False Positive TPS** | Tools might count static assets (images/css) as transactions. | Configure Load Tool (JMeter/K6) to count only **HTML Documents** as Transactions, while downloading assets in parallel threads. |
| **Session Stickiness** | CloudFront might strip session cookies, breaking On-Prem logic. | Verify CloudFront **Origin Request Policy** allows `JSESSIONID` and other critical cookies. |

---

## 9. Tools & Monitoring

*   **Load Generation:** JMeter / K6 / Gatling.
*   **CDN Monitoring:** AWS CloudWatch (Requests, Bytes Downloaded, 4xx/5xx Error Rate, Origin Latency).
*   **Origin Monitoring:**
    *   *On-Prem:* Linux tools (top, netstat), APM tools (Dynatrace/New Relic/Splunk).
    *   *AEM Cloud:* Adobe Cloud Manager logs & CDN logs.