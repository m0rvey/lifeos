# 🛠️ LifeOS Code Documentation

This document provides a comprehensive technical overview of the **LifeOS** codebase, architecture, state management patterns, storage subsystems, algorithms, and development workflows.

---

## 1. System Architecture Overview

LifeOS is an **Offline-First Single Page Application (SPA)** built with React 19, TypeScript, and Vite. The system is designed around local data sovereignty, zero network dependencies, and strict schema validation.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                               React 19 UI Layer                         │
│   ├── Hub & Tasks (Eisenhower Matrix, TaskModal, Daily Summary)         │
│   ├── Reflect (Knowledge Graph, Journal, Habits, Workouts, Schedule)    │
│   ├── Cycling (Telemetry Journal, Bike Garage, Maintenance, Routes)     │
│   ├── Finance (Double-Entry Ledger, Category Budgets, Goals, Bills)     │
│   ├── Social (CRM Directory, Decay Diagnostics, Physics Graph Worker)   │
│   └── Analytics (5-Dimension Balance Radar, Fatigue Score Engine)       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌──────────────────────────────┐              ┌───────────────────────────────────┐
│         AppContext           │              │            DataContext            │
│  - Active Module & Theme     │              │  - AppData State Snapshot         │
│  - Adaptive Theme Controller │              │  - Action Reducers & Dispatcher   │
│  - UI Flags & Performance    │              │  - 50-step Undo/Redo History Stack│
│  - Toast Notifications       │              └─────────────────┬─────────────────┘
└──────────────┬───────────────┘                                │
               │                                                ▼
               ▼                                      ┌───────────────────┐
┌──────────────────────────────┐                      │    TagRegistry    │
│         Theme Engine         │                      │  - Dynamic Index  │
│  - CSS Custom Properties     │                      │  - Autocompletion │
│  - MindVey / Cyclist /       │                      └───────────────────┘
│    Reflect / Slate Tokens    │
└──────────────────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │     Storage Layer     │
                     │  - idbEngine (IndexedDB)
                     │  - Atomic Fallback    │
                     │  - Migrations (v1-v10)│
                     │  - Zod Schema Guard   │
                     └───────────────────────┘
```

---

## 2. State Management & Data Flow

### 2.1 `DataContext` (`src/context/DataContext.tsx`)
The central state container for user data.
* **State Tree:** Exposes `data: AppData`, `setData: (data: AppData) => void`, `updateData: (fn: (prev: AppData) => AppData) => void`, and `undo` / `redo` helpers.
* **Undo / Redo History Stack:** Implemented via `dataHistory.ts`. Maintains up to 50 historical snapshots, allowing seamless step-back / step-forward operations across all entities.
* **Storage Synchronization:** Every state transition triggers asynchronous debounced persistence into the IndexedDB subsystem via `saveDataIDB()`, while maintaining atomic fallback to `localStorage`.

### 2.2 `AppContext` (`src/context/AppContext.tsx`)
Manages UI shell state, navigation, theme styling, and global notification modals:
* **Active Module:** Tracks current view (`hub`, `tasks`, `reflect`, `cycling`, `finance`, `social`, `stats`).
* **Theming:** Handles theme switching (`mindvey`, `cyclist`, `reflect`, `slate`), `adaptiveTheme` (automatic theme switching matching module context), and `highPerformance` (toggles CSS backdrop filters for low-power devices).
* **Toast System:** Dispatches non-blocking notifications with automatic expiration timers.
* **Search / Settings Modals:** Controls global overlay visibilities.

### 2.3 `TagRegistry` (`src/context/TagRegistry.tsx`)
A reactive index that aggregates all tags across tasks, journal entries, knowledge notes, workouts, contacts, and routes into a sorted, normalized index for instant autocomplete in form fields.

---

## 3. Storage & Persistence Subsystem

Located in `src/storage/`:

```
src/storage/
├── atomic.ts         # Fallback atomic localStorage handler with error dispatching
├── backup.ts         # JSON snapshot backup/restore, Obsidian Markdown & CSV exporters
├── defaults.ts       # Initial empty and seed data structures
├── engine.ts         # High-level storage facade abstraction
├── idbEngine.ts      # Primary IndexedDB v10 transaction manager (17 stores)
└── migrations.ts     # Schema migration pipelines (v1 -> v10) with Zod validation
```

### 3.1 Object Stores (IndexedDB v10)
IndexedDB manages 17 dedicated stores:
1. `tasks` — Eisenhower matrix tasks, status, deadlines, tags.
2. `journal` — Daily reflections, mood (1–5), thoughts, tags.
3. `knowledge` — Zettelkasten notes, categories, connections.
4. `habits` — Habit targets, frequencies, streak tracking logs.
5. `workouts` — Training logs, duration, intensity, muscle groups.
6. `schedules` — Weekly routine blocks (Mon–Sun) and time slots.
7. `museum` — Quotes, life lessons, achievements, digital artifacts.
8. `rides` — Cycling telemetry (km, elevation, speed, power, HR).
9. `bikes` — Multi-bike garage specifications and odometer totals.
10. `maintenance` — Component wear tracking and service records.
11. `routes` — Route planner tracks, difficulty, surface types.
12. `transactions` — Financial operations (income/expense), dates, tags.
13. `budgets` — Monthly category spending limit definitions.
14. `goals` — Financial savings milestones and target amounts.
15. `reminders` — Recurring bills, subscription invoices, due dates.
16. `persons` — Social contacts, interaction records, relationship tiers.
17. `settings` — App theme, locale, performance mode, user prefs.

### 3.2 Schema Migrations & Validation
* **Zod Schemas (`src/validation/`):** All records read from or written to storage are parsed and sanitized against strict Zod definitions.
* **Migrations Engine (`migrations.ts`):** Handles automatic step-wise data transformations across schema versions 1 through 10, ensuring backward compatibility with legacy snapshots.

### 3.3 Data Portability (`backup.ts`)
* **Full Snapshot:** Exports/imports all 17 stores as a unified, timestamped `.json` bundle.
* **Obsidian / PKM Export:** Exports all knowledge base and journal entries as `.md` files equipped with standard YAML Frontmatter (`title`, `date`, `tags`, `category`).
* **CSV Export:** Converts transactions and financial ledger items into standard RFC 4180 CSV files.

---

## 4. Cognitive & Mathematical Algorithms

Located in `src/cognitive/`:

### 4.1 Habit Streaks Engine (`habits.ts`)
* **Timezone Normalization:** Date arithmetic uses local date strings (`YYYY-MM-DD`) rather than UTC timestamps to prevent off-by-one streak breaks across midnight.
* **Streak Computation:**
  $$\text{Streak} = \sum_{k=0}^{N} 1 \quad \text{where } d_k - d_{k-1} = 1 \text{ day}$$
  Evaluates active streak, best streak, and compliance rate according to target weekly frequency.

### 4.2 Social Decay & Reciprocity Engine (`social.ts`)
* **Decay Function:** Calculates the relationship "warmth / temperature" based on the elapsed time $\Delta t$ (in days) since the last logged interaction:
  $$\text{DecayScore}(\Delta t) = \max\left(0, 100 - \Delta t \times \text{decayRate}\right)$$
* **Reciprocity Ratio:** Measures communication balance by comparing incoming vs outgoing interactions:
  $$\text{Reciprocity} = \frac{\text{Initiated by Self}}{\text{Total Interactions}} \times 100\%$$

### 4.3 Fatigue & Life Balance Radar (`helpers.ts`)
* **Fatigue Score (0–100):** Aggregates mental stress (overdue tasks, high urgency ratio), physical exertion (recent ride elevation + distance, workout volume), and rest markers.
* **Life Balance 5-Dimension Vector:** Computes normalized 0–100 scores for *Cognitive*, *Social*, *Financial*, *Physical*, and *Mindful* dimensions.

---

## 5. Web Worker & Physics Simulation

Located in `src/modules/social/graphPhysics.worker.ts`:
* **Off-Main-Thread Execution:** The 2D force-directed layout computation runs inside a dedicated Web Worker to ensure 60 FPS UI rendering during graph dragging and zooming.
* **Forces Implemented:**
  - **Repulsion (Coulomb Force):** Pushes unconnected nodes apart.
  - **Spring Attraction (Hooke's Law):** Pulls connected contacts and shared-circle nodes together.
  - **Centering Gravity:** Prevents isolated nodes from drifting away.
  - **Friction / Damping:** Gradually settles node velocities to an equilibrium state.

---

## 6. Design System & CSS Architecture

Styles are organized in `src/styles/`:
* `base.css`: CSS reset, typography, modern font family variables, focus rings.
* `themes.css`: HSL color tokens for all 4 themes:
  - `--theme-mindvey`: Neon purple / dark glassmorphism.
  - `--theme-cyclist`: High-contrast dark / sports orange accents.
  - `--theme-reflect`: Minimalist editorial light theme.
  - `--theme-slate`: Muted focus dark theme.
* `components.css`: Buttons, cards, form inputs, modals, badges, progress bars, tables.
* `layout.css`: App shell grid, collapsible sidebar, header, module containers.

---

## 7. Testing & Quality Assurance

LifeOS maintains strict test coverage across unit, integration, and end-to-end boundaries:

| Test Type | Runner / Tool | Target Areas |
| :--- | :--- | :--- |
| **Unit & Integration** | Vitest + Testing Library | Cognitive algorithms, storage engine, schema migrations, hooks, UI components |
| **End-to-End (E2E)** | Playwright | Full user flows: task creation, modal CRUD, theme toggling, search palette |
| **Component Catalog** | Storybook | Isolated UI component development, visual regression checks, accessibility |
| **Static Analysis** | TypeScript (`tsc --noEmit`) + ESLint | Strict type safety, React 19 Hooks rules, dead code elimination |

### Running Tests

```bash
# Unit & integration tests
npm run test

# Watch mode
npm run test:watch

# Browser E2E tests
npm run test:e2e

# Storybook development server
npm run storybook
```

---

## 8. Directory & File Reference

```
src/
├── App.tsx                     # Main router & root application shell
├── cognitive/                  # Pure mathematical & cognitive calculation models
│   ├── habits.ts               # Habit streak calculator
│   ├── helpers.ts              # Life balance radar & fatigue calculation
│   └── social.ts               # Social decay & reciprocity logic
├── context/                    # React Context providers
│   ├── AppContext.tsx          # Navigation, theme, modal visibility
│   ├── DataContext.tsx         # Data state, reducer, persistence sync
│   ├── TagRegistry.tsx         # Tag taxonomy & autocomplete index
│   └── dataHistory.ts          # Undo/Redo snapshot stack
├── hooks/                      # Custom React hooks
│   ├── useCrudModal.ts         # Generic modal state handler
│   ├── useGlobalSearch.ts      # Fuzzy search command palette
│   └── useRideStats.ts         # Cycling telemetry aggregator
├── i18n/                       # Localization
│   ├── en.ts                   # English dictionary
│   ├── ru.ts                   # Russian dictionary
│   └── index.ts                # i18n helper hook
├── modules/                    # Domain feature modules
│   ├── analytics/              # StatisticsPage, Fatigue Gauge, Radar
│   ├── cycling/                # CyclingModule, Dashboard, Rides, Garage, Routes
│   ├── finance/                # FinanceModule, CapitalPage, Budgets, Reminders
│   ├── hub/                    # HubPage, TasksPage, Eisenhower Matrix
│   ├── reflect/                # ReflectModule, KnowledgePage, Journal, Habits, Workouts, Schedule, Museum
│   └── social/                 # SocialModule, SocialPage, SocialGraph, Web Worker
├── shell/                      # Application shell components
│   ├── AppHeader.tsx           # Top navigation bar, search trigger, backup button
│   ├── AppSidebar.tsx          # Responsive navigation sidebar
│   ├── AppShell.tsx            # Structural grid container
│   └── SettingsModal.tsx       # Global configuration & backup manager
├── storage/                    # Storage engine & database drivers
│   ├── atomic.ts               # Atomic localStorage fallback
│   ├── backup.ts               # Backup import/export & Markdown exporter
│   ├── defaults.ts             # Initial state definitions
│   ├── engine.ts               # Storage abstraction layer
│   ├── idbEngine.ts            # IndexedDB v10 driver
│   └── migrations.ts           # Schema migrations v1 -> v10
├── styles/                     # CSS stylesheets & theme tokens
├── types/                      # TypeScript domain definitions
├── ui/                         # Base reusable UI components
│   ├── DataTable.tsx           # Paginated, filterable data table
│   ├── FormField.tsx           # Form input wrapper with label & error
│   ├── Modal.tsx               # Accessible modal overlay with trap focus
│   └── StatCard.tsx            # KPI metric card with trend indicator
└── validation/                 # Zod validation schemas
```
