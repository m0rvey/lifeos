# 🌿 LifeOS

[Русская версия / Russian Version](README.ru.md)

**LifeOS** is an offline-first, private personal command center. It is designed to help you track habits, manage finances, log cycling activities, structure reflections, and visualize social connections in a single, cohesive dashboard.

All data is stored **locally on your device** (via IndexedDB and localStorage), giving you 100% ownership and privacy over your personal logs.

---

## 🎯 What is LifeOS & Who is it for?

LifeOS is built for individuals who want to centralize their personal tracking without relying on cloud-based SaaS products that monetize personal logs.

### 👥 This project is useful for:
* **Privacy Enthusiasts:** Anyone who wants to keep journals, finances, and habits strictly local and offline.
* **Self-Reflectors & Journalers:** Users wanting to build a digital brain using a structured journal and a Zettelkasten-style knowledge base.
* **Active Networkers:** People managing large social circles who want to diagnose relationship decay and track contact reciprocity.
* **Cyclists & Athletes:** Riders who need to journal their rides, plan routes, and track bicycle maintenance intervals in one place.
* **Financial Trackers:** Anyone looking for simple transaction logging and bill reminders without linking their actual bank accounts.

---

## 📦 What's Inside? (Modules)

LifeOS is split into six main modules, each designed to handle a key aspect of your daily life:

### 1. 🎛️ Hub (Dashboard)
Your central landing page. It provides a quick glance at today's stats, outstanding tasks, upcoming bill reminders, active habits, and recent journal entries.

### 2. 🤝 Social Graph
An interactive, physics-based relationship visualizer (running in a background Web Worker).
* **Decay Diagnostics:** Shows relationship temperature based on contact recency.
* **Reciprocity Calculations:** Evaluates balance and energy weights for each contact.
* **Tags & Notes:** Filter and group connections by tags.

### 3. 💳 Finance
A clean ledger for transaction logging and bills management.
* **Double-entry style logging:** Categorize your income and expenses.
* **Bill Reminders:** Set notifications for recurring bills to ensure you never miss a payment.
* **CSV Export:** Easily export transactions for advanced analysis in Excel/Google Sheets.

### 4. 🚴 Cycling
A specialized journal and toolset for active cyclists.
* **Ride Log:** Track distances, durations, elevation gain, heart rate, and power.
* **Route Planner:** Map your favorite routes, assign difficulty levels, and mark waypoints.
* **Maintenance Tracker:** Schedule bicycle part servicing (repairs, replacements, cleanings) based on logged mileage and time.

### 5. 🧘 Reflection
A cognitive module designed to capture thoughts and develop habits.
* **Daily Journal:** Record thoughts, tags, and daily mood ratings.
* **Knowledge Base:** Build a personal wiki / Zettelkasten system to link ideas together.
* **Habit Tracker:** Log daily streaks across different life categories.
* **Workout Log:** Track gym sessions, runs, yoga, and other physical activities.
* **Schedule:** Block time for tasks and plans.

### 6. 📊 Analytics
Cross-module analysis that merges data from all parts of the app. It provides automated health/productivity recommendations and computes your fatigue index based on workouts, habits, and sleep.

---

## 🛠️ Tech Stack & Key Principles

* **React 19 + TypeScript 6** — Modern, type-safe components.
* **Vite 8** — Ultra-fast build tool and development server.
* **React Router 7** — Declarative routing and transitions.
* **Offline-First Persistence** — Data is safely stored in **IndexedDB** (via `idb`) for complex records and auto-saves to **localStorage** (with 2.5s debounce).
* **Zod** — Strict runtime schema validation to prevent database corruption.
* **Zero Cloud dependencies** — No databases to configure, no logins required, and no data tracking.

---

## 🎨 Theme & Performance Engine

LifeOS features 4 built-in themes:
1. **MindVey** — Glassmorphic dark purple.
2. **Cyclist** — Sports dark orange.
3. **Reflect** — Minimalist light mode.
4. **Slate** — Neutral dark gray.

### Modes:
* **Manual** — Choose your favorite theme.
* **Adaptive** — The theme changes automatically depending on the active module.
* **System** — Syncs with your operating system's light/dark mode.

### ⚡ Performance Mode (Windows & Low-end devices)
If you experience lag during page transitions (caused by GPU-heavy CSS blurs and live backgrounds):
1. Open **Settings** (Gear icon in the top right or `Ctrl + ,`).
2. Set **Graphics Mode** to `Performance (No blur and live backgrounds)`.
3. Set **Interface Animations** to `Disabled` (or `Enabled (forced)` to override Windows system-level animation blocks).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + 1` | Navigate to Hub |
| `Alt + 2` | Navigate to Social Graph |
| `Alt + 3` | Navigate to Finance |
| `Alt + 4` | Navigate to Cycling |
| `Alt + 5` | Navigate to Reflection |
| `Ctrl + K` | Open Global Search overlay |
| `Ctrl + S` | Export complete database JSON backup |
| `?` | Toggle keyboard shortcuts help screen |

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/m0rvey/lifeos.git
   cd lifeos
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## 🧪 Testing

The codebase is thoroughly tested using **Vitest**.

* Run unit and integration tests:
  ```bash
  npm run test
  ```
* Run type checks:
  ```bash
  npm run typecheck
  ```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
