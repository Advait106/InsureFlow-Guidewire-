# 🚀 InsureFlow — AI-Powered Earnings Protection Engine

> **Warn → Protect → Pay**
> Real-time parametric insurance for Zomato delivery partners in India.

---

## Overview

InsureFlow is a production-grade PWA that automatically protects Zomato delivery partners' weekly earnings from disruptions — rain, AQI, traffic, and demand crashes — with zero-touch payouts in under 60 seconds.

**Core promise:** If your earnings fall below your protection floor due to a verified external disruption, we pay the gap to your UPI automatically. No claims, no forms, no calls.

---

## System Flow

```
User → Earnings DNA → Weekly Policy → Risk Engine
     → Trigger Detection → Fraud Validation → Auto Claim → Payout
```

**Three-Phase Model:**
- 🟡 **WARN** — 6:30 AM AI advisory, zone risk grid, rainfall/AQI alerts before disruption
- 🟠 **PROTECT** — Real-time earnings velocity monitoring, bridge advance on mid-week crash
- 🟢 **PAY** — Sunday auto-settlement, 4-point fraud validation, UPI in 58 seconds

---

## Features

| Feature | Description |
|---------|-------------|
| Earnings DNA | Personal 12-week baseline, protection floor at 75% |
| Dynamic Premium | ₹35–80/week — Base + ZoneRisk + ForecastRisk + BehaviorFactor - SafetyDiscount |
| Zone Intelligence Grid | Red/Amber/Green/Blue zone UI (no heavy maps) |
| Parametric Triggers | Rainfall >65mm, AQI >300, Traffic >75, Earnings <40%, Inactivity >70% |
| Customer Karma Risk | Risk score for each incoming order |
| Fraud Detection | 6-layer system — GPS, kinematics, DNA, peers, device, velocity |
| Zero-touch Claims | Auto-triggered, instant UPI payout |
| Demo Mode | 7-step guided walkthrough with tooltips |
| PWA/Offline | Service worker, manifest, installable, works on 2GB RAM phones |

---

## Tech Stack

- **Frontend:** Vanilla JS (no framework — max performance on low-end devices)
- **CSS:** Custom design system — Pink fintech glassmorphism
- **Fonts:** Sora (display) + DM Sans (body) + DM Mono (data)
- **PWA:** Service Worker (offline-first caching), Web App Manifest
- **Storage:** localStorage for user data, IndexedDB-ready
- **APIs:** Mock — Weather, AQI, Traffic, Earnings, Payment (labeled "Source: API")

---

## File Structure

```
insureflow/
├── index.html          # User PWA app
├── app.js              # Core logic, mock APIs, demo mode
├── styles.css          # Full design system
├── service-worker.js   # Offline-first caching
├── manifest.json       # PWA manifest
├── admin/
│   ├── admin.html      # Admin dashboard (separate, not linked from user app)
│   └── admin.js        # Admin logic, charts, live feed
└── README.md
```

---

## Setup & Running Locally

```bash
# No build step needed — pure HTML/CSS/JS
# Serve with any static server:

npx serve .           # Node.js
python -m http.server # Python
# or use Live Server in VS Code
```

Open `http://localhost:3000` for the user app.
Open `http://localhost:3000/admin/admin.html` for the admin dashboard.

---

## Deploy

**Vercel:**
```bash
npx vercel --prod
```

**Netlify:**
Drag the `insureflow/` folder to app.netlify.com/drop

---

## Demo Flow (7 Steps)

1. **Meet Raju Sharma** — Load demo account, see active shield
2. **WARN** — IMD rainfall alert fires for BTM Layout
3. **PROTECT** — Rainfall >65mm, earnings drop >60%, triggers activate
4. **Fraud Validation** — 6 layers run silently, score: 20/100 (LOW)
5. **Auto Claim** — Zero-touch timeline: Trigger → Validate → Fraud Check → Approved
6. **PAY** — ₹450 sent to raju@upi in 58 seconds
7. **Done** — Raju's daughter goes to school on Monday

To run: tap the 🔔 bell icon on the home screen.

---

## Admin Dashboard

**Access:** `/admin/admin.html`
**Credentials:** admin / insureflow2025
**NOT linked from user app** — completely segregated

Admin panels:
- Dashboard — KPIs, charts, trigger events
- Users — Partner management
- Claims — Payout logs, fraud flags
- Trigger Config — Live threshold tuning
- Zone Heatmap — Bengaluru risk grid
- Fraud Detection — 6-layer analysis table
- API Monitor — Integration status
- Live Feed — Real-time event stream

---

## Fraud System

> **"GPS is a claim. Behavior is evidence."**

6 layers:
1. **GPS Validation** — Was user in the affected zone?
2. **Movement Kinematics** — v_implied = haversine(t, t-1)/Δt — catches teleports
3. **Earnings DNA** — p_active = P(active | zone, day, hour, weather) via KDE
4. **Peer Network** — T_spike = (N_claims - μ) / σ — coordination is confession
5. **Device Fingerprint** — IMEI + Android ID + screen resolution
6. **Velocity Fraud** — Claim frequency against historical baseline

Graduated response: Auto-approve → Soft Flag → Hold+Verify → Manual Review → Auto-Reject

---

## Parametric Triggers

| Trigger | Threshold | Source |
|---------|-----------|--------|
| Rainfall | ≥65mm / 3hr | IMD API |
| AQI | ≥300 sustained 4hrs | CPCB API |
| Heat | ≥44°C for 3hrs | NIOH threshold |
| Earnings Velocity | v_ratio <0.40 for 2hrs | Internal LSTM |
| Peer Inactivity | ≥70% zone inactive | Peer GPS network |

---

*Built for Guidewire DEVTrails 2026 · Gig Economy Track*
*InsureFlow — Warn. Protect. Pay.*
*Because ₹450 on a Sunday night means Raju's daughter goes to school on Monday.*
