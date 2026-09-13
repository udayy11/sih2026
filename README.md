<div align="center">

<img width="100%" src="https://img.shields.io/badge/-%20-1e3a8a?style=flat-square" height="4"/>

# NirmaanX

### AI-Powered Predictive & Prescriptive Infrastructure Intelligence Platform

<h3>Predict → Explain → Simulate → Act → Measure</h3>

Don't just monitor infrastructure. Predict it. Explain it. Act before it fails.

<br/>

[![Status](https://img.shields.io/badge/STATUS-SIH_PROTOTYPE-2ea44f?style=for-the-badge&labelColor=0d1117)](#)
[![License](https://img.shields.io/badge/LICENSE-MIT-3b82f6?style=for-the-badge&labelColor=0d1117)](LICENSE)
[![Problem Statement](https://img.shields.io/badge/SIH-26103-a855f7?style=for-the-badge&labelColor=0d1117)](#)

<br/>

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-EB0028?style=flat-square&logo=xgboost&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_+_PostGIS-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_3.7_Flash_RAG-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)

<img width="100%" src="https://img.shields.io/badge/-%20-1e3a8a?style=flat-square" height="4"/>

</div>

<br/>

<table align="center">
<tr>
<td align="center" width="20%"><h3>7</h3><sub>CORE FEATURES</sub></td>
<td align="center" width="20%"><h3>0–100</h3><sub>PROJECT RISK SCORE</sub></td>
<td align="center" width="20%"><h3>2</h3><sub>INTELLIGENCE SOURCES</sub></td>
<td align="center" width="20%"><h3>1</h3><sub>COMMAND CENTER</sub></td>
</tr>
</table>

<br/>

## Project & Team Details

| Attribute | Details |
|:--|:--|
| **Project Title** | NirmaanX |
| **Team Name** | InfraMinds |
| **Team Leader** | Uday — [udayverma112006@gmail.com](mailto:udayverma112006@gmail.com) · +91 9354572705 |
| **Team Members** | Lavanya — [lavanyagoyal1212@gmail.com](mailto:lavanyagoyal1212@gmail.com) · +91 9810572488 <br/> Nikhil — [nikhiltyagi8093@gmail.com](mailto:nikhiltyagi8093@gmail.com) · +91 8750925694 <br/> Vrinda — [gargvrinda11@gmail.com](mailto:gargvrinda11@gmail.com) · +91 9050558390 <br/> Piyush — [piyushkumarb2510@gmail.com](mailto:piyushkumarb2510@gmail.com) · +91 7982927100 <br/> Ashika — [ashikajain2401@gmail.com](mailto:ashikajain2401@gmail.com) · +91 9899129177 |
| **Target Organization** | Ministry of Statistics and Programme Implementation (MoSPI), Govt. of India |
| **Division** | Data Informatics & Innovation Division (DIID) / Infrastructure and Project Monitoring Division (IPMD) |
| **Problem Statement ID** | SIH 26103 — Web-Based Integrated Project-Monitoring Platform |
| **Core Architecture** | React 19 + Vite 6 + TypeScript + Tailwind CSS + Express Node Server + Gemini 3.7 Flash RAG + LightGBM/XGBoost ML Pipeline |
| **Repository** | [github.com/udayy11/sih2026](https://github.com/udayy11/sih2026) |

<br/>

## Table of Contents

`01` [The Problem](#01--the-problem) · `02` [Core Idea](#02--core-idea--the-intelligence-loop) · `03` [Workflow](#03--end-to-end-workflow) · `04` [Architecture](#04--system-architecture) · `05` [Tech Stack](#05--technology-stack)

`06` [Ground Reality Intelligence](#06--ground-reality-intelligence) · `07` [Prediction Engine](#07--cost-time--risk-prediction-engine) · `08` [Explainability & Early Warning](#08--explainable-ai--early-warning) · `09` [Forecasting & Benchmarking](#09--forecasting--benchmarking) · `10` [What-If Simulator](#10--what-if-simulator)

`11` [Citizen Intelligence](#11--citizen--community-intelligence) · `12` [AI Assistant & RAG](#12--ai-project-intelligence-assistant--rag) · `13` [Human-in-the-Loop](#13--human-in-the-loop--responsible-ai) · `14` [Command Center](#14--government-command-center) · `15` [Project Structure](#15--project-structure)

`16` [Data Model](#16--data-model--prototype-dataset) · `17` [User Journeys](#17--key-user-journeys) · `18` [Why It's Different](#18--why-this-is-different) · `19` [Demo Walkthrough](#19--demo-walkthrough) · `20` [Roadmap & Setup](#20--roadmap--getting-started)

<br/>

## 01 — The Problem

Large infrastructure projects involve massive budgets, long timelines, multiple departments, contractors, and shifting ground conditions. A small deviation in cost, expenditure, or progress can quietly become a major delay or overrun.

<table>
<tr>
<td width="50%" valign="top">

**Today — reactive monitoring**

```mermaid
flowchart TD
    A[Project Data] --> B[Periodic Monitoring]
    B --> C[Problem Occurs]
    C --> D[Problem Detected]
    D --> E[Investigation]
    E --> F[Corrective Action]
    style A fill:#450a0a,stroke:#ef4444,color:#fecaca
    style B fill:#450a0a,stroke:#ef4444,color:#fecaca
    style C fill:#451a03,stroke:#f59e0b,color:#fed7aa
    style D fill:#451a03,stroke:#f59e0b,color:#fed7aa
    style E fill:#451a03,stroke:#f59e0b,color:#fed7aa
    style F fill:#052e16,stroke:#22c55e,color:#bbf7d0
```

</td>
<td width="50%" valign="top">

**NirmaanX — predictive governance**

```mermaid
flowchart TD
    A[Project Data] --> B[AI Analysis]
    B --> C[Risk Prediction]
    C --> D[Explain Why]
    D --> E[Early Warning]
    E --> F[Forecast + Simulate]
    F --> G[Government Intervention]
    style A fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style B fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style C fill:#312e81,stroke:#a78bfa,color:#ede9fe
    style D fill:#312e81,stroke:#a78bfa,color:#ede9fe
    style E fill:#4c1d95,stroke:#c084fc,color:#f3e8ff
    style F fill:#4c1d95,stroke:#c084fc,color:#f3e8ff
    style G fill:#052e16,stroke:#22c55e,color:#bbf7d0
```

</td>
</tr>
</table>

> Traditional monitoring asks **"What went wrong?"**
> NirmaanX asks — **"What is likely to go wrong, why is it happening, what happens if we do nothing, and what should we do now?"**

<br/>

## 02 — Core Idea · The Intelligence Loop

NirmaanX creates a predictive and prescriptive intelligence layer over infrastructure project data, continuously scanning for early warning signals.

```mermaid
flowchart LR
    A(("Predict")) --> B(("Explain")) --> C(("Simulate")) --> D(("Act")) --> E(("Measure"))
    E -.feeds.-> A
    classDef loop fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff,stroke-width:2px
    class A,B,C,D,E loop
```

NirmaanX is built on two connected intelligence sources:

| Source | Signals |
|:--|:--|
| **Official Intelligence** | Progress, expenditure, original & revised cost, planned completion, milestones, delay duration, sector, history |
| **Community Intelligence** | Citizen complaints, photos, GPS, RWA verification, issue severity and duration, community support |

Together, these create a far more complete picture of real infrastructure performance than official data alone.

<br/>

## 03 — End-to-End Workflow

```mermaid
flowchart TD
    A[PAIMANA / OCMS Project Data] --> B[Ingestion, Cleaning & Feature Engineering]
    B --> C[AI / ML Prediction Engine]
    C --> D[Cost Prediction]
    C --> E[Time Prediction]
    D --> F[Project Risk Engine · 0-100]
    E --> F
    F --> G[Explainable AI · SHAP]
    F --> H[Early Warning Engine]
    G --> I[Government Command Center]
    H --> I
    I --> J[Prioritise & Act]
    K[Community Intelligence · Reports, Photos, GPS] --> I

    classDef ingest fill:#082f49,stroke:#0ea5e9,color:#e0f2fe
    classDef ai fill:#3b0764,stroke:#c084fc,color:#f3e8ff
    classDef action fill:#052e16,stroke:#22c55e,color:#dcfce7
    class A,B ingest
    class C,D,E,F,G,H ai
    class I,J,K action
```

<br/>

## 04 — System Architecture

```mermaid
flowchart TB
    subgraph L1["Frontend"]
        A1["React 19 + Vite 6 + TypeScript"]
    end
    subgraph L2["UI & Visualization"]
        B1["Tailwind CSS · ECharts · Map Integration"]
    end
    subgraph L3["Backend"]
        C1["FastAPI / Express · REST APIs"]
    end
    subgraph L4["Data Layer"]
        D1["PostgreSQL + PostGIS"]
    end
    subgraph L5["ML Engine"]
        E1["XGBoost / LightGBM · SHAP · Forecasting"]
    end
    subgraph L6["AI Assistant"]
        F1["Gemini 3.7 Flash · RAG · Vector Retrieval"]
    end
    subgraph L7["Risk & Alert Engine"]
        G1["Risk Scoring · Early Warnings"]
    end
    subgraph L8["Government Action"]
        H1["Command Center · Human Review · Corrective Action"]
    end

    A1 --> B1 --> C1
    C1 --> D1
    C1 --> E1
    C1 --> F1
    D1 --> G1
    E1 --> G1
    F1 --> G1
    G1 --> H1

    style L1 fill:#0c1e3e,stroke:#38bdf8,color:#e2e8f0
    style L2 fill:#0f2942,stroke:#0ea5e9,color:#e2e8f0
    style L3 fill:#1c1a3e,stroke:#818cf8,color:#e2e8f0
    style L4 fill:#083344,stroke:#22d3ee,color:#cffafe
    style L5 fill:#2e1065,stroke:#c084fc,color:#f3e8ff
    style L6 fill:#3b1d0f,stroke:#fb923c,color:#ffedd5
    style L7 fill:#4c1d95,stroke:#e879f9,color:#fdf4ff
    style L8 fill:#1a2e1a,stroke:#22c55e,color:#dcfce7
```

<br/>

## 05 — Technology Stack

<table>
<tr><th>Layer</th><th>Stack</th><th>Purpose</th></tr>
<tr><td><b>Frontend</b></td><td><img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black"/> <img src="https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white"/> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"/></td><td>Web application</td></tr>
<tr><td><b>UI</b></td><td><img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"/></td><td>Responsive interface</td></tr>
<tr><td><b>Visualization</b></td><td><img src="https://img.shields.io/badge/ECharts-AA344D?style=flat-square&logo=apacheecharts&logoColor=white"/></td><td>Risk & analytics charts</td></tr>
<tr><td><b>Maps</b></td><td>Map Integration</td><td>Project & issue visualization</td></tr>
<tr><td><b>Backend</b></td><td><img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white"/> <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white"/></td><td>REST APIs</td></tr>
<tr><td><b>Database</b></td><td><img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white"/> <img src="https://img.shields.io/badge/PostGIS-336791?style=flat-square&logo=postgresql&logoColor=white"/></td><td>Project, complaint & geospatial data</td></tr>
<tr><td><b>Data Processing</b></td><td><img src="https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white"/> <img src="https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white"/></td><td>Cleaning & feature engineering</td></tr>
<tr><td><b>Prediction</b></td><td><img src="https://img.shields.io/badge/XGBoost-EB0028?style=flat-square&logo=xgboost&logoColor=white"/> LightGBM</td><td>Cost & time overrun prediction</td></tr>
<tr><td><b>Explainability</b></td><td>SHAP</td><td>Model explanations</td></tr>
<tr><td><b>Forecasting</b></td><td>Statsmodels / custom models</td><td>Project trajectory</td></tr>
<tr><td><b>AI Assistant</b></td><td><img src="https://img.shields.io/badge/Gemini_3.7_Flash-8E75B2?style=flat-square&logo=googlegemini&logoColor=white"/></td><td>Natural-language project Q&A</td></tr>
<tr><td><b>RAG</b></td><td>Vector Retrieval</td><td>Context-grounded responses</td></tr>
<tr><td><b>Storage</b></td><td>Object Storage</td><td>Photos & documents</td></tr>
</table>

<br/>

## 06 — Ground Reality Intelligence

NirmaanX's strongest capability: catching the gap between what official records say and what is actually happening on the ground.

```mermaid
flowchart TD
    subgraph Official["Official Data"]
        A1["Progress: 92%"]
        A2["Risk: LOW"]
    end
    subgraph Community["Community Data"]
        B1["Citizen Reports"]
        B2["RWA Verification"]
        B3["Photos + GPS"]
    end
    Official --> M[Ground Reality Engine]
    Community --> M
    M --> R["47 Issues Reported → GROUND REALITY MISMATCH"]

    style A1 fill:#052e16,stroke:#22c55e,color:#dcfce7
    style A2 fill:#052e16,stroke:#22c55e,color:#dcfce7
    style B1 fill:#0c2f4a,stroke:#38bdf8,color:#e0f2fe
    style B2 fill:#0c2f4a,stroke:#38bdf8,color:#e0f2fe
    style B3 fill:#0c2f4a,stroke:#38bdf8,color:#e0f2fe
    style M fill:#3b0764,stroke:#c084fc,color:#f3e8ff
    style R fill:#450a0a,stroke:#ef4444,color:#fee2e2
```

> Official data may show a project as nearly complete, while verified community intelligence shows unresolved ground-level problems. This turns citizen feedback into a decision-making signal — not just a complaint log.

<br/>

## 07 — Cost, Time & Risk Prediction Engine

**Cost Overrun Prediction** — inputs: original cost, expenditure, physical progress, milestone slippage, historical patterns.

```
Cost Overrun Probability: 78%
Expected Overrun:         ₹42 Crore
```

**Time Overrun Prediction** — inputs: planned completion, progress, milestone delays, expenditure.

```
Delay Probability:     84%
Expected Delay:        5.2 Months
Planned Completion:    March 2027
Predicted Completion:  August 2027
```

**Project Risk Score** — a single 0–100 score combining every risk indicator.

```mermaid
flowchart LR
    A["Cost Risk · 78"] --> F((("RISK = 79<br/>HIGH")))
    B["Time Risk · 84"] --> F
    C["Progress Risk · 72"] --> F
    D["Milestone Risk · 80"] --> F
    E["Implementation Risk · 65"] --> F
    style A fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style B fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style C fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style D fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style E fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style F fill:#7c2d12,stroke:#fb923c,color:#ffedd5
```

| Score | Risk Level |
|--:|:--|
| 0–30 | Low |
| 31–60 | Moderate |
| 61–80 | High |
| 81–100 | Critical |

Primary model: **XGBoost**, with Random Forest / Logistic Regression used for comparison and validation.

<br/>

## 08 — Explainable AI & Early Warning

A risk score alone isn't enough for a decision-maker — NirmaanX uses **SHAP** to explain *why*.

```
WHY IS PROJECT P001 AT RISK?

Delayed Milestones        ██████████  +24
Slow Physical Progress    ████████    +19
Cost Deviation            ██████      +15
High Expenditure Rate     ████         +9
Historical Pattern        ███          +6
```

> Instead of just "Risk = 79," NirmaanX explains: *Project P001 is high-risk primarily because milestone slippage, slow physical progress, and rising expenditure relative to progress indicate a potential execution problem.*

**Early Warning Engine** surfaces the risk before it becomes a failure:

```
EARLY WARNING — Project P001
Risk Score: 79/100 · Cost Overrun Probability: 78% (₹42 Cr)

Detected Signals:
- 2 milestones missed
- Expenditure rising faster than progress
- Progress below expected trajectory

Recommended Action:
Review upcoming milestone schedule and investigate the
expenditure-progress mismatch.
```

<br/>

## 09 — Forecasting & Benchmarking

```mermaid
flowchart LR
    N["Now · 62% Progress"] --> F1["Expected · 74%"]
    F1 --> F2["Planned Completion · Mar 2027"]
    F2 --> F3["Predicted Completion · Aug 2027"]
    style N fill:#052e16,stroke:#22c55e,color:#dcfce7
    style F1 fill:#422006,stroke:#f59e0b,color:#fef3c7
    style F2 fill:#422006,stroke:#f59e0b,color:#fef3c7
    style F3 fill:#450a0a,stroke:#ef4444,color:#fee2e2
```

**Benchmarking** compares a project against similar projects, sector, and agency averages:

```
PROJECT RISK
Your Project        79
Similar Projects     52
Sector Average       61
Agency Average        55
```

> Project P001 is performing worse than comparable projects and above the sector risk average.

<br/>

## 10 — What-If Simulator

Officials can test hypothetical scenarios before making a decision.

```mermaid
flowchart LR
    A["+3 Months Delay<br/>+10% Expenditure<br/>-5% Progress"] --> S(("Simulate"))
    S --> B["Current Risk: 64"]
    S --> C["Simulated Risk: 78"]
    style A fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style S fill:#4c1d95,stroke:#e879f9,color:#fdf4ff
    style B fill:#422006,stroke:#f59e0b,color:#fef3c7
    style C fill:#450a0a,stroke:#ef4444,color:#fee2e2
```

> Answers: *"What could happen if current conditions worsen?"* — making NirmaanX a decision-support platform, not just a dashboard.

<br/>

## 11 — Citizen & Community Intelligence

```mermaid
flowchart TD
    A[Citizen Report] --> B[AI Classification]
    B --> C[Photo / Text Analysis]
    C --> D[Duplicate Detection]
    D --> E[Location Matching]
    E --> F[Project Matching]
    F --> G[Community Validation]
    G --> H[Priority Score]
    H --> I[Government Dashboard]

    classDef c fill:#082f49,stroke:#38bdf8,color:#e0f2fe
    class A,B,C,D,E,F,G,H,I c
```

**Duplicate Detection** prevents complaint fragmentation:

```
SIMILAR ISSUE DETECTED
38 citizens have already reported a similar problem nearby.
[ SUPPORT EXISTING ISSUE ]
```

**Community Priority Score:**

```
Citizens Affected        82
Supporting Reports       38
Severity                 HIGH
Photo Evidence           YES
Community Verification   YES
Issue Duration           3 Months
                          →  87/100 · HIGH PRIORITY
```

<br/>

## 12 — AI Project Intelligence Assistant & RAG

Officials query project data in natural language, grounded by Retrieval-Augmented Generation.

```mermaid
flowchart LR
    A[Project Database] --> D[Document Retrieval]
    B[Government Documents] --> D
    C[Project Reports] --> D
    D --> E[Relevant Context] --> F[LLM] --> G[Grounded Answer]

    classDef rag fill:#3b0764,stroke:#c084fc,color:#f3e8ff
    class A,B,C,D,E,F,G rag
```

```
Official:  Which projects are at highest risk?
NirmaanX:  12 projects are currently classified as Critical Risk.
           5 projects show both high cost and schedule risk.

Official:  Why is Project P001 high risk?
NirmaanX:  Milestone slippage, slow physical progress, and rising
           expenditure relative to progress.
```

<br/>

## 13 — Human-in-the-Loop & Responsible AI

NirmaanX is a decision-support system, not an autonomous authority.

```mermaid
flowchart LR
    A[Community Report] --> B[AI Prioritisation] --> C[Human Verification] --> D[Relevant Department] --> E[Corrective Action] --> F[Resolution]
    classDef ai fill:#3b0764,stroke:#c084fc,color:#f3e8ff
    classDef human fill:#052e16,stroke:#22c55e,color:#dcfce7
    class A,B ai
    class C,D,E,F human
```

| AI handles | Humans handle |
|:--|:--|
| Prediction, Explanation, Prioritization, Recommendation | Verification, Review, Approval, Corrective Action |

**Complaint Lifecycle:** `SUBMITTED → UNDER REVIEW → ACTION INITIATED → RESOLVED`

<br/>

## 14 — Government Command Center

```
NIRMAANX COMMAND CENTER
Projects: 1,247   High: 182   Critical: 47   Avg. Risk: 56/100

RISK DISTRIBUTION
LOW          620
MODERATE     398
HIGH         182
CRITICAL      47

PRIORITY PROJECTS
Project A    89 · Critical
Project B    84 · Critical
Project C    76 · High
Project D    72 · High
```

**Dashboard modules:** Project Overview · Risk Distribution · Early Warnings · Project Risk Map · Cost Trends · Delay Trends · Forecasts · Community Issues · What-If Simulator · AI Assistant

<br/>

## 15 — Project Structure

```
nirmaanx/
├── frontend/
│   └── src/            components · pages · charts · maps · services
├── backend/
│   └── app/             main.py · routes · models · services · database
├── ml/                  data · preprocessing · models · training · prediction · explainability
├── rag/                  documents · embeddings · retrieval
├── database/            schema.sql · seed.sql
├── docs/                 architecture · screenshots
├── .env.example
└── README.md
```

<br/>

## 16 — Data Model & Prototype Dataset

| Project | Sector | Original Cost | Revised Cost | Expenditure | Progress | Delay | Missed Milestones |
|:--|:--|--:|--:|--:|--:|--:|--:|
| P001 | Road | ₹500 Cr | ₹540 Cr | ₹380 Cr | 72% | 4 months | 2 |
| P002 | Railway | ₹800 Cr | ₹800 Cr | ₹600 Cr | 82% | 1 month | 0 |
| P003 | Bridge | ₹350 Cr | ₹410 Cr | ₹300 Cr | 55% | 7 months | 4 |

```mermaid
flowchart LR
    A[Raw Data] --> B[Cleaning] --> C[Missing Value Handling] --> D[Feature Engineering] --> E[Training / Inference Dataset]
    classDef f fill:#082f49,stroke:#0ea5e9,color:#e0f2fe
    class A,B,C,D,E f
```

Key features: cost deviation · expenditure rate · physical progress · planned vs. actual progress · delayed milestone count · delay duration · project age · sector · historical performance.

<br/>

## 17 — Key User Journeys

<table>
<tr><th>Government</th><th>Citizen</th></tr>
<tr valign="top">
<td>Login → Dashboard → Project List → Project Details → Early Warnings → What-If Simulator → Community Issues → AI Assistant</td>
<td>Dashboard → Report Issue → Issue Details → Community Support → Complaint Tracking</td>
</tr>
</table>

<br/>

## 18 — Why This Is Different

| Traditional Monitoring | NirmaanX |
|:--|:--|
| Reactive | Predictive |
| "What happened?" | "What will happen, why, and what should we do?" |
| Official data only | Official + community ground-reality intelligence |
| Static reports | Explainable, evolving risk scores |
| Manual investigation | AI-prioritized, human-verified action |
| No scenario testing | What-if simulation before decisions |

<br/>

## 19 — Demo Walkthrough

```mermaid
flowchart TD
    A[Open Government Dashboard] --> B["Select High-Risk Project · Risk 79"]
    B --> C[Click WHY → SHAP Explanation]
    C --> D[View Cost & Time Predictions]
    D --> E[Early Warning Generated]
    E --> F[Run What-If Simulation]
    F --> G["Open Community Issues · 47 Reports"]
    G --> H[Ground Reality Mismatch Flagged]
    H --> I[AI Recommends Investigation]
    I --> J[Human Verification] --> K[Corrective Action] --> L[Resolution]

    classDef s fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    class A,B,C,D,E,F,G,H,I,J,K,L s
```

The story in one line: **Data → Prediction → Explanation → Warning → Ground Reality → Action → Resolution.**

<br/>

## 20 — Roadmap & Getting Started

| Phase | Focus |
|:--|:--|
| **1 · Core AI** | Dataset, preprocessing, XGBoost, cost/time prediction, risk score |
| **2 · Government Dashboard** | Login, project list/details, SHAP explanation, early warnings |
| **3 · Advanced Intelligence** | Forecasting, benchmarking, what-if simulator, trend comparisons |
| **4 · Community Intelligence** | Citizen reports, photo/GPS, duplicate detection, community priority |
| **5 · AI Assistant** | RAG over project data + government documents, LLM-grounded answers |

**Prerequisites:** Node.js, npm, Python 3.10+, PostgreSQL, Git

```bash
git clone https://github.com/udayy11/sih2026.git
cd sih2026

# Backend
cd backend
python -m venv venv && source venv/bin/activate   # venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Create a `.env` file from `.env.example`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/nirmaanx
LLM_API_KEY=your_api_key
VECTOR_DB_URL=your_vector_database_url
STORAGE_BUCKET=your_storage_bucket
```

> Never commit real API keys or credentials to GitHub.

---

<div align="center">

<img width="100%" src="https://img.shields.io/badge/-%20-1e3a8a?style=flat-square" height="4"/>

### NirmaanX
**Predict · Explain · Simulate · Act · Measure**

*From project monitoring to project foresight.*

</div>
