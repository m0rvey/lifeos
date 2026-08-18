# 🌿 LifeOS Design Philosophy & Manifest

> *"A life operating system should serve the human, not the cloud."*

---

## 1. The Core Ideology

Modern productivity software is fundamentally broken. Personal journals, task lists, financial balance sheets, training logs, and relationship notes are scattered across dozens of proprietary cloud platforms. Each platform charges recurring monthly subscriptions, monetizes user telemetry, locks data behind closed APIs, and introduces friction through latency and network dependency.

**LifeOS was conceived as an antidote to digital fragmentation and surveillance capitalism.**

It is an autonomous, private, single-tenant personal command center built on the premise that **your digital life belongs exclusively to you**.

---

## 2. Guiding Principles

### 🔒 1. Radical Privacy & Data Sovereignty
* **Zero Telemetry:** LifeOS includes zero trackers, analytics scripts, third-party CDNs, or telemetry pixels.
* **100% In-Browser Execution:** The entire system runs directly in the client browser. Data never leaves your device unless you explicitly choose to export it.
* **No Authentication Gates:** There are no logins, passwords to reset, or remote OAuth tokens that can expire or be revoked.

### ⚡ 2. Local-First & Offline-Always
* **Sub-16ms Latency:** Because all state queries and mutations execute against local IndexedDB storage, every interaction feels instantaneous (60–120 FPS).
* **Work Anywhere:** On a transatlantic flight, in a remote mountain trail cabin, or during network outages — LifeOS is 100% functional without an internet connection.
* **Service Resilience:** LifeOS cannot be deprecated, acquired, or shut down by a corporate entity. The code and data are yours forever.

### 🌐 3. The Unified Life Mental Model
Human experience is holistic, not partitioned into disconnected browser tabs:
* Cognitive focus is intimately tied to physical recovery and sleep.
* Relationship health directly affects emotional mood and daily energy.
* Financial security provides the foundation for creative and intellectual work.

LifeOS integrates these domains into a unified cognitive model:
* The **Eisenhower Matrix** prevents task overwhelm.
* The **Zettelkasten Graph** fosters serendipitous intellectual connections.
* The **Multi-Bike Garage & Telemetry** tracks physical endurance and equipment maintenance.
* The **Social Graph & Decay Engine** gently nudges you before important relationships fade away.
* The **Fatigue Engine & Radar** harmonizes all five life dimensions (*Cognitive*, *Social*, *Financial*, *Physical*, *Mindful*).

### ⌨️ 4. Cognitive Ergonomics & Flow State
* **Keyboard-First Navigation:** Seamless navigation via `Alt + 1` … `Alt + 5`, universal command search via `Ctrl + K` / `Cmd + K`, instant backups via `Ctrl + S`, and `?` shortcuts cheat sheet.
* **Sensory Harmony:** Designed with bespoke visual identities:
  - **MindVey:** Immersive neon-purple glassmorphism with subtle light blooms.
  - **Cyclist:** High-contrast sports telemetry palette.
  - **Reflect:** Serene editorial light theme for contemplative writing.
  - **Slate:** Minimalist muted dark palette for deep work.
* **Hardware Inclusivity:** High-Performance mode dynamically eliminates backdrop blur to ensure fluid responsiveness on modest hardware.

### 📦 5. Data Longevity & Open Formats (Zero Lock-In)
* **Open Standards First:** Your data is never trapped in a proprietary database binary.
* **Single-Click Snapshots:** Instant full-system backup and restore via standard JSON files.
* **Obsidian & PKM Interoperability:** Knowledge base notes and journal entries export directly to clean Markdown (`.md`) with YAML Frontmatter.
* **Spreadsheet Ready:** Financial transactions export to standard RFC 4180 CSV for spreadsheet analysis.

---

## 3. The Architectural Pact

When designing new features or refactoring existing modules for LifeOS, adhere to this pact:

1. **No External Network Dependencies:** All calculations, simulations (like social physics), and storage must remain client-side.
2. **Deterministic & Safe Migrations:** Every schema alteration must be accompanied by versioned migrations and runtime Zod validation.
3. **Graceful Degradation:** If IndexedDB is blocked in private browsing mode, fall back atomically without crashing.
4. **Clean Domain Separation:** Each life sphere (Finance, Cycling, Reflect, Social, Hub) must be modular and testable in isolation.
5. **Respect Human Attention:** Avoid anxiety-inducing notifications, artificial urgency badges, or dark UX patterns.
