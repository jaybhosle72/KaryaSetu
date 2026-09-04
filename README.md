# KaryaSetu (कार्य सेतू) 🇮🇳
### A Cooperative-Owned Digital Marketplace for Household, Community & Institutional Services
**Built for the Smart India Hackathon (SIH)**
**Technology Stack:** MERN (MongoDB, Express.js, React, Node.js) + Tailwind CSS + Recharts

---

## 🌟 The Core Pitch: Why KaryaSetu is NOT Urban Company

| Feature / Dimension | Commercial Aggregators (Urban Company) | **KaryaSetu (Cooperative-Owned)** |
| :--- | :--- | :--- |
| **Model** | Customer ➔ Individual Gig Worker | **Customer ➔ Labour Cooperative ➔ Suitable Worker** |
| **Governance** | Corporate-owned, profit-maximizing extraction | **Democratic cooperative federation owned by workers** |
| **Worker Compensation** | Takes 25% – 35% commission + arbitrary penalties | **80% Direct Worker Take-Home Guaranteed** |
| **Social Security & Insurance** | Gig workers bear 100% risk without safety net | **6% Transparent Welfare Fund (Ayushman Bharat + PMSBY)** |
| **AI Utilization** | Surveillance algorithms & rating penalties | **Demand Forecasting & Workforce Pre-Positioning** |
| **Market Scope** | Individual household gigs only | **Dual Market: Households + Institutional SLAs (Housing Societies/RWAs)** |
| **Reputation System** | Reductionist 1-to-5 star ratings | **Multi-Metric: Verified Skills, Reliability %, Cooperative Endorsement** |

---

## 🚀 Key Innovations & Differentiators

### 1. Cooperative-First Service Allocation Engine
Instead of directly matching customers with isolated gig workers, our allocation algorithm coordinates through accredited primary labour cooperatives (e.g., *Pune Electrical Sahakari*, *Maha Jal Sahakari*, *Brihan Multi-Trade Coop*).
$$\text{Allocation Score} = (0.35 \times \text{Proximity}) + (0.30 \times \text{Skill Match}) + (0.20 \times \text{Fair Workload Balance}) + (0.15 \times \text{Reliability})$$
- **Fair Workload Balance**: Prevents monopolies where only a handful of workers get all bookings; guarantees fair income equity across all cooperative members.
- **Explainable Rationale**: Every customer booking displays the exact rationale: *"Allocated via Pune Electrical Sahakari • 98% Skill Match • 1.4 km away (12 min ETA) • Equity Index: 88/100"*.

### 2. Fair Earnings & 4-Way Transparent Welfare Split
Every single payment generates an audited, printable Cooperative Tax Invoice with a transparent 4-way split:
- **80% (₹400 on ₹500)**: Direct to Worker Personal Bank/UPI Account
- **10% (₹50)**: Cooperative Society Operations, Branch Kendra & Tool Depot
- **6% (₹30)**: Worker Social Security, Health & Insurance Vault (PM-JAY, Accidental Cover, Child Education Scholarships)
- **4% (₹20)**: Platform Cloud Infrastructure & Payment Gateway

### 3. AI-Powered Demand & Workforce Pre-Positioning
No useless chatbots! AI is applied to real civic infrastructure:
- Analyzes monsoon precipitation warnings, tree falls, and festive seasons to predict demand spikes by ward.
- Generates actionable pre-positioning alerts: e.g., *"Heavy Monsoon alert in Baner (+185% plumbing demand). Pre-position 8 emergency plumbers to Baner Sahakar Kendra before 07:00 AM."*

### 4. Dual Market: Households + Institutional Society (RWA) SLAs
Extends beyond individual apartments to Housing Societies (RWAs), Schools, and Tech Parks.
- Example: *Green Meadows Housing Society (Baner)* retains 2 Electricians + 2 Plumbers + 3 Cleaners on an annual maintenance contract, providing continuous, stable livelihoods to cooperative workers.

### 5. 🚨 Rapid Emergency SOS Dispatch
1-click emergency assistance for water pipe ruptures, electrical short circuits, and jammed doors with instant nearby cooperative priority allocation and rapid arrival countdowns.

---

## 🏛️ System Architecture (MERN)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REACT FRONTEND (Vite)                             │
│  - Presenter Persona Bar (Customer ↔ Worker ↔ Cooperative ↔ Federation)     │
│  - Customer Portal (Household & Institutional Services, 🚨 Emergency SOS)   │
│  - Worker App / Shramik Portal (Dispatch, Navigation, Welfare Vault)        │
│  - Cooperative Hub (Worker Verification, AI Demand Forecast, Roster)        │
│  - Federation Dashboard (City-wide Social Security Corpus, Macro Analytics) │
│  - Interactive Geospatial Radar (Shramiks, Coops & Demand Heatmaps)         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST APIs / JSON
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS.JS + NODE.JS BACKEND                        │
│  - Cooperative-First AI Matching Engine                                     │
│  - Predictive AI Demand & Pre-positioning Simulator                         │
│  - 4-Way Transparent Payment Split & Invoice Generator                     │
│  - Emergency SOS Broadcast Dispatcher                                       │
│  - Institutional Contract Management Service                                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Mongoose ODM
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MONGODB DATABASE LAYER                           │
│  - Cooperatives Collection (Bylaws, Welfare Reserve, Registrations)         │
│  - Workers Collection (Verified Skills, Reliability, Welfare Details)       │
│  - Bookings Collection (Status Steps, Payment Breakdown, Invoices)          │
│  - InstitutionalContracts Collection (Housing Society Retainers)            │
│  - DemandForecasts Collection (Ward Level Predictions)                      │
│  - WelfareClaims Collection (Disbursed Healthcare & Scholarship Grants)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Quick Start & Running Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Run Everything with One Command
From the root folder `sahakar-seva`:
```bash
# Starts both the Express Backend (Port 5000) and React Frontend (Port 5173)
npm start
```

Or start them individually:

**Backend:**
```bash
cd server
npm start
# Server running at http://localhost:5000
```

**Frontend:**
```bash
cd client
npm run dev
# React Vite App running at http://localhost:5173
```

---

## 🎯 Demo Walkthrough for SIH Judges

Use the **Presenter Persona Switcher Bar** at the top of the app to demonstrate the complete lifecycle in 3 minutes:

1. **Step 1: The Citizen / Customer Experience**
   - Click **"🚨 SOS Emergency Demo"** or select **"Water Leakage"**.
   - See the platform evaluate proximity and assign an accredited worker through the local cooperative with an explainable matching score.
2. **Step 2: The Worker / Shramik Portal**
   - Switch persona to **"2. Worker App (Shramik)"**.
   - Inspect the incoming job dispatch, click **"1. Start Navigation"**, then **"2. Arrive & Begin Work"**, and **"3. Complete Job"**.
   - Switch to the **"Welfare & Benefits Vault"** tab to show how the 6% welfare allocation immediately grew their personal health and scholarship reserve!
3. **Step 3: The Cooperative Society Manager Hub**
   - Switch persona to **"3. Cooperative Hub"**.
   - Open **"AI Demand Forecast & Pre-Positioning"** to view ward demand charts and automated worker deployment directives.
   - Open **"Configurable Split Policy"** to show how democratic bylaws configure the 80/10/6/4 split.
4. **Step 4: The Apex Federation Board**
   - Switch persona to **"4. Federation Board"** to show the macro city-wide social security pool, multi-cooperative benchmarking, and institutional housing society contracts.

---
**Built with pride for the Smart India Hackathon.**
