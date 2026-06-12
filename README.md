# LifeOS

Open-source life management platform: social connections, finance, cycling, reflection, and habits.

## Features

- **Hub** — dashboard with overview of all modules
- **Social** — relationship graph with decay diagnostics
- **Finance** — transaction management and bill reminders
- **Cycling** — ride journal, routes, maintenance tracking
- **Reflection** — journal, knowledge base, schedule, habits, workouts, thoughts
- **Analytics** — cross-module statistics and recommendations

## Tech Stack

- React 19 + TypeScript 6
- Vite 8
- React Router 7
- Lucide React (icons)
- Zod (schema validation)
- Vitest (testing)
- CSS Custom Properties (design system)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |
| `npm run format` | Prettier formatting |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + 1-5` | Navigate modules |
| `Ctrl + S` | Export backup |
| `?` | Show keyboard shortcuts |

## Project Structure

```
src/
├── cognitive/      # Business logic (helpers, calculations)
├── context/        # React Context (AppContext, DataContext)
├── hooks/          # Custom hooks
├── modules/        # Application modules
│   ├── hub/        # Dashboard
│   ├── social/     # Social graph
│   ├── finance/    # Finance
│   ├── cycling/    # Cycling
│   ├── reflect/    # Reflection
│   └── analytics/  # Analytics
├── shell/          # App shell (Header, Sidebar, Settings)
├── storage/        # Persistence (localStorage, migrations)
├── styles/         # CSS (themes, components, layouts)
├── test/           # Vitest tests
├── types/          # TypeScript types
├── ui/             # Reusable components
└── validation/     # Zod schemas
```

## Data

All data is stored in `localStorage`. Features:
- JSON backup export/import
- CSV export (transactions, rides, contacts)
- Auto-save (2.5s debounce)
- Version migrations
- Theme modes: manual, adaptive, system

## Themes

4 built-in themes + 3 modes:
- **mindveyz** — dark purple (Glasswind)
- **cyclist** — dark orange
- **reflect** — light minimal
- **slate** — dark neutral

Modes: manual selection, adaptive by module, system (prefers-color-scheme).

## License

MIT

## Author

[m0rvey](https://github.com/m0rvey)
