# 🌿 LifeOS

[Русская версия / Russian Version](README.md)

**LifeOS** is an offline-first, private personal command center. It centralizes task and habit management, personal finances, cycling and workout logs, personal notes with a Zettelkasten knowledge base, and social network visualization into a single, cohesive dashboard.

All data is stored **strictly locally on your device** (in IndexedDB and localStorage) without external servers, tracking, or cloud telemetry.

---

## 📦 System Modules

### 1. 🎛️ Hub & Tasks
* **Daily Overview:** Current status, active habits, upcoming bill reminders, and fatigue index calculation.
* **Eisenhower Matrix:** Intelligent task board categorized into 4 quadrants based on urgency and importance (*Do First*, *Schedule*, *Delegate/Quick*, *Eliminate/Backlog*).
* **Task List:** Filtering, tags, deadlines, and direct completion tracking.

### 2. 🤝 Social Graph
* **Interactive Relationship Map:** 2D force-directed relationship graph running in a background Web Worker.
* **Decay Diagnostics:** Contact recency monitoring with automated alerts for cooling relationships.
* **Connection Balance:** Weighting energy, resonance, and reciprocity for each contact.

### 3. 💳 Finance
* **Ledger Logging:** Streamlined categorization of income and expenses.
* **Monthly Budgets:** Category expense limits with visual progress indicators.
* **Savings Goals:** Goal tracking with clear progress visualization.
* **Bill Calendar:** Reminders for upcoming recurring payments.
* **Export:** CSV export for spreadsheet analysis.

### 4. 🚴 Cycling
* **Ride Journal:** Track distance, duration, elevation gain, average/max speed, heart rate, and power.
* **Bike Garage:** Multi-bike support with mileage and ride count tracking per bicycle (Road, Gravel, MTB, Commuter).
* **Route Planner:** Route catalog with waypoints and difficulty ratings.
* **Maintenance Tracker:** Wear-and-tear monitoring and scheduled servicing (repairs, replacements, cleanings).

### 5. 🧘 Reflection
* **Daily Journal:** Record thoughts with daily mood ratings and tags.
* **Knowledge Base (Wiki / Zettelkasten):** Organize insights, articles, and book summaries.
* **Interactive Knowledge Graph:** 2D graph view connecting notes by shared tags and categories.
* **Markdown Export:** Export journal entries and notes into structured `.md` files for Obsidian and Notion.
* **Habit Tracker:** Daily streaks calculation with local timezone handling.
* **Workout Journal:** Log gym sessions, runs, yoga, and other activities.
* **Schedule:** Block scheduling for daily routines.

### 6. 📊 Analytics
* Multi-dimensional life balance radar (cognitive, social, financial, physical, mindful).
* Automated workload diagnostics and actionable balance recommendations.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, React Router 7, Vite.
* **Storage:** IndexedDB (`idb`) + localStorage fallback (offline-first).
* **Validation:** Zod.
* **Styling:** Vanilla CSS with theme custom properties and a high-performance rendering mode.
* **Testing:** Vitest, Testing Library.

---

## 🎨 Themes

Four built-in visual themes:
1. **MindVey** — Dark neon glassmorphic style.
2. **Cyclist** — High-contrast dark orange style.
3. **Reflect** — Minimalist clean light theme.
4. **Slate** — Subtle neutral dark theme.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + 1` | Hub |
| `Alt + 2` | Social Graph |
| `Alt + 3` | Finance |
| `Alt + 4` | Cycling |
| `Alt + 5` | Reflection |
| `Ctrl + K` / `Cmd + K` | Global Search |
| `Ctrl + S` / `Cmd + S` | Export Backup (JSON) |
| `?` | Keyboard Shortcuts Help |

---

## 🚀 Quickstart

### Prerequisites
* [Node.js](https://nodejs.org/) v18 or higher.

### Commands
```bash
# Clone the repository
git clone https://github.com/m0rvey/lifeos.git
cd lifeos

# Install dependencies
npm install

# Start local dev server
npm run dev

# Build production bundle
npm run build

# Run tests
npm run test
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](../LICENSE) for details.
