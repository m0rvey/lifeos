# 🤝 Contributing to LifeOS

Thank you for your interest in contributing to **LifeOS**! We welcome contributions from developers, designers, writers, and thinkers who share our passion for local-first software, digital privacy, and cognitive ergonomics.

---

## 📜 Table of Contents
1. [Core Principles](#-core-principles)
2. [How to Contribute](#-how-to-contribute)
3. [Development Setup](#-development-setup)
4. [Branching & Workflow](#-branching--workflow)
5. [Code Quality & Style Guidelines](#-code-quality--style-guidelines)
6. [Testing Standards](#-testing-standards)
7. [Commit Message Conventions](#-commit-message-conventions)
8. [Submitting a Pull Request](#-submitting-a-pull-request)

---

## 🧭 Core Principles

Before submitting any code or proposal, please keep our core tenets in mind:
* **Radical Privacy:** Never introduce external network calls, analytics SDKs, trackers, or cloud storage dependencies. Everything must remain 100% in-browser.
* **Local-First & Resilient:** All data operations must target IndexedDB with atomic fallback and schema validation via Zod.
* **Performance First:** Keep UI rendering smooth (60+ FPS). CPU-intensive operations (such as graph layout physics) must be run in background Web Workers.
* **Respect Human Attention:** Avoid dark UX patterns, artificial urgency indicators, or clutter.

---

## 🛠️ How to Contribute

* **🐛 Report Bugs:** Open an issue with clear reproduction steps, browser version, and OS.
* **💡 Suggest Features:** Propose ideas aligned with our [Design Philosophy](DESIGN_PHILOSOPHY.md).
* **💻 Code Contributions:** Fix open issues, optimize performance, or implement approved features.
* **🎨 UI/UX Design:** Refine themes, enhance accessibility, or add new Storybook components.
* **📖 Documentation:** Improve guides, translate strings in `src/i18n/`, or fix typos.

---

## 💻 Development Setup

### Prerequisites
* **Node.js** `>= 18.0.0`
* **npm** `>= 9.0.0`
* **Git**

### Installation

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/lifeos.git
cd lifeos

# 2. Add upstream remote
git remote add upstream https://github.com/m0rvey/lifeos.git

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 🌿 Branching & Workflow

1. Create a dedicated branch off `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```
2. Keep your branch up to date with `upstream/main`:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

---

## 🎨 Code Quality & Style Guidelines

* **Language:** Use strict TypeScript. Avoid `any`; define explicit interfaces in `src/types/`.
* **State Management:** Use `DataContext` for user state and `AppContext` for shell/theme state.
* **Styling:** Use CSS variables and classes from `src/styles/` (`themes.css`, `components.css`, `base.css`). Do not hardcode ad-hoc color hex codes in JSX styles.
* **Schema Validation:** If you modify storage structures, update Zod schemas in `src/validation/` and write a migration in `src/storage/migrations.ts`.
* **Localization:** Always add localization strings in both `src/i18n/ru.ts` and `src/i18n/en.ts`.

---

## 🧪 Testing Standards

All pull requests must pass our automated quality checks:

```bash
# 1. Type verification
npm run typecheck

# 2. ESLint code analysis
npm run lint

# 3. Unit and integration tests (Vitest)
npm run test

# 4. End-to-End tests (Playwright)
npm run test:e2e

# 5. Component catalog (Storybook)
npm run storybook
```

If you add new utility functions, cognitive calculations, or storage methods, write corresponding tests under `src/test/`.

---

## 💬 Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

* `feat:` A new user-facing feature
* `fix:` A bug fix
* `docs:` Documentation changes
* `refactor:` Code refactoring without behavioral changes
* `perf:` Performance improvements
* `test:` Adding or updating tests
* `chore:` Build scripts, dependencies, or tool updates

**Examples:**
```bash
feat(reflect): add weekly schedule planner module
fix(storage): handle indexeddb quota exceeded gracefully
docs(readme): add contributing guide and storybook links
```

---

## 🚀 Submitting a Pull Request

1. Push your branch to your GitHub fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request against the `main` branch of `m0rvey/lifeos`.
3. Provide a clear description of your changes, referencing any related issue (e.g., `Closes #42`).
4. Ensure all GitHub Actions CI checks pass.

Thank you for making **LifeOS** better! 🌿
