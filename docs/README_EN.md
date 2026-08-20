<div align="center">

# 🌱 LifeOS

**Autonomous, offline-first personal operating system for productivity, knowledge, telemetry, and reflection.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Storage](https://img.shields.io/badge/Storage-IndexedDB%20(idb)-10B981?style=flat-square)](#-architecture--privacy)
[![Storybook](https://img.shields.io/badge/Storybook-10-FF4785?style=flat-square&logo=storybook&logoColor=white)](https://storybook.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](../LICENSE)

[Features](#-core-modules) • [Architecture](#-architecture--privacy) • [Quick Start](#-quick-start) • [Code Documentation](CODE_DOCUMENTATION.md) • [Russian Version / Русская версия](README.md)

</div>

---

## 📌 Overview

**LifeOS** is a privacy-first, client-side personal dashboard engineered with an **Offline-First** philosophy. It unites task management, knowledge graphs, sports telemetry, personal budgeting, and social connections into a single cohesive interface with **zero external telemetry and zero cloud lock-in**.

---

## ✨ Core Modules

<table>
  <tr>
    <td width="50%" valign="top">
      <h4>🎛️ Hub & Eisenhower Matrix</h4>
      <ul>
        <li>4-quadrant task prioritization based on urgency and importance.</li>
        <li>Daily cognitive load status and fast action launchers.</li>
        <li>Tagging, deadlines, status filters, and checklist tracking.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h4>🧠 Zettelkasten Knowledge Graph</h4>
      <ul>
        <li>Interactive 2D graph visualising interconnected markdown notes.</li>
        <li>Tag-based clustering, zoom, pan, and live note previews.</li>
        <li>1-click export to clean Markdown (Obsidian / Notion ready).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h4>🚴 Cycling Garage & Telemetry</h4>
      <ul>
        <li>Multi-bike garage tracking total distance and service history.</li>
        <li>Component wear tracker (chain, cassette, tires, brake pads).</li>
        <li>Detailed ride logger (distance, elevation, power, speed, RPE).</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h4>💳 Capital & Budgeting Engine</h4>
      <ul>
        <li>Monthly category budgeting with dynamic limit meters.</li>
        <li>Savings goals with target dates and visual milestones.</li>
        <li>Recurring subscription tracker and offline CSV export.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h4>🤝 Social Network Graph (CRM)</h4>
      <ul>
        <li>Force-directed 2D physical relationship simulation in a Web Worker.</li>
        <li>Contact decay detection based on elapsed interaction intervals.</li>
        <li>Reciprocity analysis and inner/outer circle grouping.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h4>📈 Habits & Reflection Diary</h4>
      <ul>
        <li>Habit streak tracker with timezone-safe normalization.</li>
        <li>Daily reflection journal with mood tracking (1–5 scale).</li>
        <li>Museum of memories: collection of quotes and milestones.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🔒 Architecture & Privacy

- **100% Client-Side:** All application data is stored in the browser using **IndexedDB** (`idb`).
- **Strict Data Contracts:** Runtime validation on storage boundaries via **Zod schemas**.
- **Heavy Compute Isolation:** Force-directed graph layouts and physics simulations run inside dedicated **Web Workers** to guarantee 60 FPS UI responsiveness.
- **Zero Telemetry:** No external analytics or tracking scripts.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

```bash
# Clone the repository
git clone https://github.com/m0rvey/lifeos.git
cd lifeos

# Install dependencies
npm install

# Start local development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🧪 Testing & Verification

```bash
# Run unit tests
npm run test

# Type checking
npm run typecheck

# Code linting
npm run lint

# Launch Storybook component catalog
npm run storybook
```

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](../LICENSE) for more information.  
Crafted by [m0rvey](https://github.com/m0rvey).
