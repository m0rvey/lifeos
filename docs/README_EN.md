<div align="center">

# 🌿 LifeOS

**Private, offline-first personal command center and knowledge operating system**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=flat-square)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![Storage](https://img.shields.io/badge/Storage-IndexedDB%20%2B%20Offline--First-10B981?style=flat-square)](#-architecture--storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](../LICENSE)

[Русская версия / Russian Version](README.md)

</div>

---

## 📌 Overview

**LifeOS** is an **Offline-First** personal command center designed to centralize key aspects of daily life into a single private workspace: task prioritization, habit streaks, household accounting, multi-bike cycling telemetry, Zettelkasten knowledge graphing, and relationship diagnostics.

> **🔒 100% Privacy by Default:** All data lives strictly in your browser (IndexedDB + local fallback). Zero third-party cloud servers, external databases, trackers, or telemetry.

---

## ✨ Key Modules & Capabilities

### 1. 🎛️ Hub & Eisenhower Tasks (Hub & Tasks)
* **Eisenhower Matrix:** Automatically sorts tasks into 4 quadrants based on urgency and emotional importance (*Do First*, *Schedule*, *Delegate/Quick*, *Backlog*).
* **Daily Overview:** Cognitive workload tracking, active habit counts, upcoming bills, and quick navigation.
* **Execution List:** Filter by active/completed status, tags, deadlines, and direct checkmark toggles.

### 2. 🧠 Reflection & Knowledge Graph (Reflect & Knowledge)
* **Interactive 2D Knowledge Graph:** Visualizes connections between notes based on shared tags and categories with zoom, pan, and live preview drawers.
* **Obsidian / Notion Ready:** One-click structured Markdown (`.md`) export with Frontmatter metadata for external PKM workflows.
* **Daily Journal:** Mood tracking, stream of thoughts, and tag organization.
* **Habit Streaks:** Continuous streak tracking with timezone-accurate local date stepping.
* **Workout Journal:** Log gym sessions, runs, yoga, and recovery routines.

### 3. 🚴 Cycling & Multi-Bike Garage (Cycling & Garage)
* **Bike Garage:** Individual mileage, ride count, and maintenance logs per bicycle (Road, Gravel, MTB, Commuter).
* **Telemetry Journal:** Log distance, elevation gain, duration, average/max speed, power (W), and heart rate (bpm).
* **Service Book (Maintenance):** Monitor component wear (chains, cassettes, tires, brakes) and schedule service intervals.
* **Route Planner:** Catalog favorite tracks with waypoints and difficulty ratings.

### 4. 💳 Finance & Savings Goals (Finance & Budgets)
* **Monthly Budgets:** Automatically tracks current month expenses across categories against customizable limit bars.
* **Savings Goals:** Interactive goal cards with visual progress rings and amounts.
* **Bill Calendar:** Reminders for recurring subscriptions, invoices, and obligations.
* **Ledger & Export:** Categorized double-entry transaction log with local CSV export.

### 5. 🤝 Social Graph
* **Physics-based Relationship Map:** 2D force-directed simulation running in a background Web Worker without UI frame drops.
* **Decay Diagnostics:** Temperature tracking based on days elapsed since last contact to prevent connection loss.
* **Reciprocity Scoring:** Evaluates balance, initiative, and energy exchange for each contact.

### 6. 📊 Cross-Module Analytics (Analytics)
* 5-Dimension Life Balance Radar: *Cognitive*, *Social*, *Financial*, *Physical*, *Mindful*.
* Integrated Fatigue Score calculation based on workload, sleep, and recovery.

---

## 🏛️ Architecture & Storage

```
┌─────────────────────────────────────────────────────────────┐
│                       React 19 UI                           │
│  (Hub / Tasks / Finance / Cycling / Reflection / Social)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                      DataContext & Reducer
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   ┌─────────────────┐                  ┌──────────────────┐
   │ IndexedDB (idb) │ ──[Async Sync]── │  localStorage    │
   │ (Primary Store) │                  │ (Atomic Fallback)│
   └─────────────────┘                  └──────────────────┘
            │
            ▼
    Zod Validation & Migrations Engine
```

* **Transactional Storage:** IndexedDB engine with non-blocking async operations and data integrity checks.
* **Schema Validation:** Zod schemas enforce type correctness and safe runtime data sanitization.
* **Backup & Restore:** Instant single-file JSON full-system snapshots.

---

## 📂 Project Structure

```
lifeos/
├── docs/                     # Documentation (README.md, README_EN.md)
├── src/
│   ├── cognitive/            # Habit calculations, social decay algorithms
│   ├── context/              # React Context (Data, App State, TagRegistry)
│   ├── hooks/                # Custom hooks (useGlobalSearch, useCrudModal, etc.)
│   ├── i18n/                 # Localization dictionaries (RU / EN)
│   ├── modules/              # Application modules
│   │   ├── analytics/        # Cross-module analytics and fatigue radar
│   │   ├── cycling/          # Rides, routes, garage, and maintenance
│   │   ├── finance/          # Transactions, budgets, savings goals, and bills
│   │   ├── hub/              # Hub dashboard, tasks, and Eisenhower matrix
│   │   ├── reflect/          # Journal, Zettelkasten, 2D knowledge graph, habits
│   │   └── social/           # Force-directed social graph and CRM
│   ├── shell/                # Navigation, header, sidebar, settings modal
│   ├── storage/              # IndexedDB engine, migrations, exports
│   ├── styles/               # CSS tokens, design system, theme definitions
│   ├── types/                # TypeScript interface definitions
│   ├── ui/                   # Modular UI design system components
│   └── validation/           # Zod schema validation
└── package.json
```

---

## 🎨 Themes

| Theme | Description |
| :--- | :--- |
| **MindVey** | Glassmorphic dark theme with purple neon accents |
| **Cyclist** | High-contrast sporty dark theme with orange highlights |
| **Reflect** | Minimalist clean light palette |
| **Slate** | Subtle neutral dark palette |

> Includes **Adaptive Mode** (theme dynamically adjusts to the active module) and **High-Performance Mode** (disables backdrop blur for lower-spec hardware).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Alt + 1` … `Alt + 5` | Quick module navigation |
| `Ctrl + K` / `Cmd + K` | Universal global search |
| `Ctrl + S` / `Cmd + S` | Instant JSON backup export |
| `?` | Keyboard shortcuts cheat sheet |

---

## 🚀 Quickstart

### Prerequisites
* **Node.js** `>= 18.0.0`
* **npm** `>= 9.0.0`

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/m0rvey/lifeos.git
cd lifeos

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run test suite
npm run test

# 5. Build production bundle
npm run build
```

---

## 📄 License

Distributed under the **MIT** License. See [LICENSE](../LICENSE) for details.
