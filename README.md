# 🧠 Navora — Crowd Intelligence System

> **Real-time crowd estimation, AI-driven decision-making, and hybrid sensor fusion for large-scale venue management.**

Navora is a full-stack crowd management platform that combines **simulation**, **real-world sensor inputs**, and **AI reasoning** to help event organizers and attendees make smarter decisions — even in low-connectivity environments.

---

## 🎯 Problem

Large-scale events (festivals, stadiums, expos) face a recurring challenge:

- **No real-time visibility** into crowd distribution across zones
- **Reactive management** — staff respond to problems *after* they happen
- **Single-sensor dependency** — if one data source fails, the system goes blind

## 💡 Solution

Navora provides:

- **Hybrid Crowd Estimation** — combines gate counts, Bluetooth device detection, and manual corrections using weighted fusion
- **AI-Powered Decision Engine** — Groq LLM analyzes crowd state and generates explainable routing recommendations
- **Dual-Mode Architecture** — seamless switching between simulation (demo/testing) and real-time (production) modes
- **Offline-Ready Design** — works without internet using physical input signals

---

## 🏗 Architecture

```
         ┌──────────────┬──────────────┬──────────────┐
         │  Gate Count   │  Bluetooth   │   Manual     │
         │  (Physical)   │  (Wireless)  │  (Operator)  │
         └──────┬───────┴──────┬───────┴──────┬───────┘
                │              │              │
                ▼              ▼              ▼
         ┌─────────────────────────────────────────┐
         │    Hybrid Estimation Engine              │
         │    density = gate×0.6 + bt×0.3 + man×0.1│
         └────────────────┬────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │      State Manager             │
         │  (Clamped, History-Tracked)    │
         └────────┬───────────────────────┘
                  │
          ┌───────┴────────┐
          ▼                ▼
   ┌─────────────┐  ┌──────────────┐
   │  AI Engine  │  │  WebSocket   │
   │  (Groq LLM) │  │  Broadcast   │
   └─────────────┘  └──────────────┘
          │                │
          ▼                ▼
     ┌──────────────────────────┐
     │     React Dashboard      │
     │  (Real-time, Responsive) │
     └──────────────────────────┘
```

---

## 🎛 Modes

| Mode | Purpose | Data Source |
|------|---------|-------------|
| **🧪 Simulation** | Demo & testing | Auto-generated crowd fluctuations |
| **⚡ Real-Time** | Production | Gate entries, BT scans, manual adjustments |

Switching modes is instant — one click in the Navbar. Simulation data is completely isolated from real-time signals using separate internal fields (`simulated_density` vs `gate_count + bluetooth_count + manual_adjustment`).

---

## 🧠 AI Decision Engine

Powered by **Groq (LLaMA 3.3 70B)**, the AI:

- Analyzes utilization, queue times, and crowd density across all zones
- Generates **user actions** (where to go) and **organizer actions** (where to deploy staff)
- Provides **explainable reasoning** with confidence levels
- Enforced safety: **never routes users to zones above 80% capacity**

---

## 🖥 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite |
| **Visualization** | Plotly.js (spline charts, bar ranking) |
| **Backend** | FastAPI + Uvicorn |
| **AI** | Groq API (LLaMA 3.3 70B Versatile) |
| **Communication** | WebSocket (real-time broadcast) |
| **State** | In-memory with Pydantic computed fields |

---

## 🚀 How to Run

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API Key (set in `backend/.env`)

### Backend
```bash
cd backend
python -m venv env
env\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `backend/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```

---

## 📊 Features

- **Live Zone Cards** — density, queue time, utilization bar with trend indicators (🔺 Rising / 🔻 Falling)
- **Peak Load Alerts** — 🔥 visual warning when zones exceed 90% capacity
- **Critical Alert Banner** — staggered animation alerts for dangerous congestion
- **Toast Notifications** — debounced AI recommendation and alert toasts
- **Comparison Chart** — sorted bar chart ranking all zones by utilization
- **Trajectory Analytics** — per-zone spline charts tracking utilization over time
- **Mode Switching** — persistent across browser refresh (localStorage)
- **Real-Time Controls** — interactive +1 Entry, +5 Adjust, Scan BT buttons (only visible in Real-Time mode)
- **WCAG Accessible** — semantic HTML, `aria-live` regions, focus-visible outlines, screen reader support

---

## 🗣 One-Liner

*"Navora uses a hybrid estimation model combining physical entry counts, wireless device detection, and manual corrections to handle real-world uncertainty in large-scale venues — powered by AI that doesn't just monitor crowds, but predicts, explains, and guides decisions in real time."*

---

## 📁 Project Structure

```
Navora/
├── backend/
│   ├── app/
│   │   ├── ai/              # Groq pipeline, prompts, safety bounds
│   │   ├── api/             # FastAPI routes (state, mode, hybrid inputs)
│   │   ├── core/            # Config, state manager, initialization
│   │   ├── data/            # Pydantic schema (Zone model)
│   │   ├── simulation/      # Auto-simulation engine + event triggers
│   │   └── websocket/       # WebSocket manager + broadcast
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ZoneCard, AIPanel, Charts, Toast
│   │   ├── context/         # React Context (global state + WebSocket)
│   │   ├── pages/           # Dashboard layout
│   │   ├── services/        # API + Socket clients
│   │   └── styles/          # Theme + Global CSS
│   └── index.html
└── README.md
```

---

Built with precision for real-world impact. 🚀


## ☁️ Google Services Integration

Navora is designed to integrate with Google ecosystem for scalability:

- **Google Firebase (planned)** — real-time sync and multi-device state sharing
- **Google Maps API (planned)** — zone-based navigation and spatial routing
- **Google Cloud Platform (ready)** — backend deployment and scaling

## 🧪 Testing

- API endpoints validated (state, simulation, AI decision)
- WebSocket real-time updates tested across multiple clients
- AI output validated for strict JSON structure
- Offline mode tested via network disconnection
- Action queue sync verified after reconnection

## 🚀 Future Scope

- Real Bluetooth scanning integration
- Full map-based navigation system
- Multi-device sync using Firebase
- Deployment in stadium-scale environments