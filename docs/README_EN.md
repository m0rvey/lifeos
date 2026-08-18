<div align="center">

# 🌿 LifeOS

**Private, offline-first personal command center and knowledge operating system**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=flat-square)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![Storage](https://img.shields.io/badge/Storage-IndexedDB%20%2B%20Offline--First-10B981?style=flat-square)](#-architecture--storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](../LICENSE)
[![Storybook](https://img.shields.io/badge/Storybook-UI%20Catalog-FF4785?logo=storybook&logoColor=white&style=flat-square)](#-development--testing)

[Russian Version / Русская версия](README.md) | [Architecture & Code (Code Docs)](CODE_DOCUMENTATION.md) | [Design Philosophy](DESIGN_PHILOSOPHY.md) | [Contributing](CONTRIBUTING.md)

</div>

---

## 📌 Overview

**LifeOS** is an **Offline-First** personal command center designed to centralize key aspects of daily life into a single private workspace: task prioritization, habit streaks, household accounting, multi-bike cycling telemetry, Zettelkasten knowledge graphing, weekly routine scheduling, digital museum artifacts, and relationship diagnostics.

> **🔒 100% Privacy by Default:** All data lives strictly in your browser (IndexedDB + atomic fallback). Zero third-party cloud servers, external databases, trackers, or telemetry. Your data belongs solely to you.

---

## ✨ Key Modules & Capabilities

### 1. 🎛️ Hub & Eisenhower Tasks (Hub & Tasks)
* **Eisenhower Priority Matrix:** Automatically sorts tasks into 4 quadrants based on urgency and emotional importance (*Do First*, *Schedule*, *Delegate / Quick*, *Backlog*).
* **Daily Overview:** Cognitive workload indicator, active habit counts, upcoming bills, recent notes, and quick action shortcuts.
* **Execution List:** Filter by active/completed status, tags, deadlines, and direct checkmark toggles.

### 2. 🧠 Reflection, Knowledge & Habits (Reflect & Knowledge)
* **Interactive 2D Knowledge Graph:** Visualizes connections between notes based on shared tags and categories with zoom, pan, and live preview drawers.
* **Obsidian / Notion Ready:** One-click structured Markdown (`.md`) export with YAML Frontmatter metadata for external PKM workflows.
* **Daily Journal:** Mood tracking (scale 1–5), stream of thoughts, and tag organization.
* **Habit Streaks:** Continuous streak tracking with timezone-accurate local date stepping.
* **Workout Journal:** Log strength, cardio, mobility, running, and recovery sessions with muscle group tags and intensity ratings.
* **Routine & Schedule Planner:** Weekly calendar blocks (Monday–Sunday) with time ranges, category coloring, and routine planning.
* **Digital Museum (Museum of Memories & Quotes):** Preserve memorable quotes, life milestones, insights, and digital artifacts.

### 3. 🚴 Cycling & Multi-Bike Garage (Cycling & Garage)
* **Multi-Bike Garage:** Individual odometer, ride count, and maintenance logs per bicycle (Road, Gravel, MTB, Commuter, TT).
* **Telemetry Journal:** Log distance (km), elevation gain (m), duration, average/max speed (km/h), power (W), heart rate (bpm), and Rate of Perceived Exertion (RPE).
* **Service Book (Maintenance):** Monitor component wear (chains, cassettes, tires, brake pads, cables) and schedule service intervals.
* **Route Planner:** Catalog favorite tracks with waypoints, surface type (paved, gravel, trail), and difficulty ratings.

### 4. 💳 Capital & Budgets (Finance & Budgets)
* **Monthly Budgets:** Automatically tracks current month expenses across categories against customizable limit bars.
* **Savings Goals:** Interactive goal cards with visual progress rings and target dates.
* **Bill Calendar:** Reminders for recurring subscriptions, invoices, and obligations with payment tracking.
* **Ledger & Export:** Categorized double-entry transaction log with local CSV export.

### 5. 🤝 Social Graph & CRM
* **Physics-based Relationship Map:** 2D force-directed simulation running in a background **Web Worker** without main UI thread frame drops.
* **Decay Diagnostics (Decay Engine):** Temperature tracking based on days elapsed since last contact to prevent connection loss.
* **Reciprocity Scoring:** Evaluates balance, initiative, and energy exchange for each contact.
* **Contact Directory:** Interaction logs, notes, birthdays, and relationship tiers (Inner Circle, Close Friends, Network).

### 6. 📊 Cross-Module Analytics (Analytics & Fatigue Engine)
* **5-Dimension Life Balance Radar:** *Cognitive*, *Social*, *Financial*, *Physical*, *Mindful*.
* **Integrated Fatigue Score:** Mathematical model calculating physical and mental load based on overdue tasks, workout strain, ride exertion, and recovery markers.

---

## 🏛️ Architecture & Storage

```
┌─────────────────────────────────────────────────────────────────────────┐
│                               React 19 UI                               │
│        (Hub / Tasks / Reflect / Finance / Cycling / Social / Stats)     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
       AppContext (UI / Theme)               DataContext (State + History)
                 │                                       │
                 ▼                                       ▼
        TagRegistry (Tags Index)             dataHistory (50 Undo/Redo)
                                                         │
                                                         ▼
                                                idbEngine (IndexedDB v10)
                                            ┌────┴──────────────────────┐
                                            ▼                           ▼
                                  IndexedDB Stores             Atomic localStorage
                                  (Primary Engine)             (Resilient Fallback)
                                            │
                                            ▼
                                  Zod Schema Validation &
                                  Versioned Migrations Engine
```

* **Transactional Storage:** IndexedDB engine (17 dedicated object stores) with non-blocking async operations and data integrity checks.
* **Schema Validation:** Zod schemas enforce type correctness and safe runtime data sanitization across schema migrations (v1 → v10).
* **Backup & Restore:** Instant single-file JSON full-system snapshots.
* **Undo/Redo History:** In-memory 50-step action history stack for instant recovery.

---

## 📂 Project Structure

```
lifeos/
├── docs/                     # Documentation (README.md, README_EN.md, CODE_DOCUMENTATION.md, DESIGN_PHILOSOPHY.md)
├── e2e/                      # Playwright E2E tests
├── public/                   # Static assets and icons
├── src/
│   ├── cognitive/            # Algorithms (habit streaks, social decay, fatigue score)
│   ├── context/              # React Contexts (Data, App, TagRegistry, dataHistory)
│   ├── hooks/                # Custom hooks (useGlobalSearch, useCrudModal, useRideStats)
│   ├── i18n/                 # Bilingual localization (RU / EN)
│   ├── modules/              # Feature modules
│   │   ├── analytics/        # Cross-module analytics and 5-dimension radar
│   │   ├── cycling/          # Rides, routes, garage, and maintenance
│   │   ├── finance/          # Transactions, budgets, savings goals, and bills
│   │   ├── hub/              # Hub dashboard, tasks, and Eisenhower matrix
│   │   ├── reflect/          # Journal, Zettelkasten, habits, workouts, routine, museum
│   │   └── social/           # Force-directed social graph, contact CRM, Web Worker
│   ├── shell/                # Navigation, header, sidebar, global settings modal
│   ├── storage/              # IndexedDB engine, schema migrations, Markdown/CSV/JSON exports
│   ├── styles/               # CSS tokens, design system, theme definitions
│   ├── test/                 # Unit and integration test suite (Vitest)
│   ├── types/                # TypeScript interfaces and domain types
│   ├── ui/                   # Modular UI design system components (Modal, DataTable, StatCard, FormField)
│   └── validation/           # Zod schema validation rules
├── package.json              # Dependencies and scripts
└── vite.config.ts            # Vite configuration
```

---

## 🎨 Themes

| Theme | Description |
| :--- | :--- |
| **MindVey** | Glassmorphic dark theme with purple neon accents and backdrop glow |
| **Cyclist** | High-contrast sporty dark theme with vivid orange highlights |
| **Reflect** | Minimalist clean light palette tailored for reading and writing |
| **Slate** | Subtle neutral dark palette for deep focused work |

> **Special Modes:**
> * **Adaptive Mode:** Dynamically adapts the active theme based on the current module.
> * **High-Performance Mode:** Disables backdrop blur filters for smooth 60fps performance on lower-spec hardware.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Alt + 1` … `Alt + 5` | Fast module navigation |
| `Ctrl + K` / `Cmd + K` | Universal global fuzzy search |
| `Ctrl + S` / `Cmd + S` | Instant JSON full backup export |
| `?` | Interactive keyboard shortcuts cheat sheet |
| `Escape` | Dismiss open modals and overlays |

---

## 🚀 Quickstart

### Prerequisites
* **Node.js** `>= 18.0.0`
* **npm** `>= 9.0.0`

### Setup & Run

```bash
# 1. Clone the repository
git clone https://github.com/m0rvey/lifeos.git
cd lifeos

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build production bundle
npm run build
```

---

## 🧪 Development & Testing

The project includes an extensive test suite and component catalog:

```bash
# Run unit and integration tests (Vitest)
npm run test

# Run tests in interactive watch mode
npm run test:watch

# Run browser End-to-End tests (Playwright)
npm run test:e2e

# Run TypeScript type verification
npm run typecheck

# Run linter (ESLint)
npm run lint

# Auto-format codebase (Prettier)
npm run format

# Start Storybook component catalog
npm run storybook
```

---

## 📚 Technical Documentation

* 📖 [**CODE_DOCUMENTATION.md**](CODE_DOCUMENTATION.md) — Comprehensive technical architecture, storage engine, state management, and algorithm contracts.
* 💡 [**DESIGN_PHILOSOPHY.md**](DESIGN_PHILOSOPHY.md) — Local-first privacy manifesto, cognitive ergonomics, and long-term data sovereignty.
* 🤝 [**CONTRIBUTING.md**](CONTRIBUTING.md) — Development setup, coding standards, and pull request workflow.

---

## 📄 License

Distributed under the **MIT** License. See [LICENSE](../LICENSE) for details.
