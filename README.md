# 🛒 Kolab Marketplace — Frontend

A **Latvian marketplace platform** built as a pnpm monorepo PWA, featuring Buy/Sell classifieds, Quick Help task jobs with interactive maps, and Service Offerings. Supports Latvian 🇱🇻, Russian 🇷🇺, and English 🇬🇧.

## Live URLs

| Environment | URL |
|---|---|
| **Web App** | [marketplace-frontend-tau-seven.vercel.app](https://marketplace-frontend-tau-seven.vercel.app) |
| **Backend API** | [marketplace-backend-production-e808.up.railway.app](https://marketplace-backend-production-e808.up.railway.app/) |
| **Supabase (Files/Images)** | [supabase.com/dashboard/project/fkxgqvcubfpqjwhiftej](https://supabase.com/dashboard/project/fkxgqvcubfpqjwhiftej) |

## Three Marketplace Segments

1. **Buy/Sell Classifieds** — Browse and post items for sale (like ss.lv)
2. **Quick Help Jobs** — Task marketplace with an interactive Leaflet map showing nearby service requests, price-colored markers (green €0–30, blue €31–70, purple-gold €71+)
3. **Service Offerings** — Advertise your skills and services to potential clients

## Monorepo Structure

```
marketplace-frontend/
├── apps/
│   └── web/                  # React 18 PWA (Vite + TypeScript)
├── packages/
│   └── shared/               # API clients, stores, types, i18n
├── turbo.json                # Turborepo task orchestration
├── pnpm-workspace.yaml       # pnpm workspace config
└── package.json              # Root scripts
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed breakdown of the codebase, including mobile vs desktop rendering patterns, data fetching layers, and guidelines for new code.

## Tech Stack

- **React 18 + TypeScript** with **Vite** build tool
- **React Router v6** for routing
- **Tailwind CSS** for mobile-first responsive styling
- **Leaflet + react-leaflet** for interactive maps
- **TanStack Query** for server state / data fetching
- **Zustand** for client state management
- **i18next** for internationalization (EN, LV, RU)
- **Firebase** phone authentication
- **PWA** support via vite-plugin-pwa
- **Vitest** unit tests + **Playwright** E2E tests

## Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** 9+ (see `packageManager` in root `package.json`)
- Backend running (see [marketplace-backend](https://github.com/ojayWillow/marketplace-backend))

### Install & Run

```bash
# Install all dependencies
pnpm install

# Run in dev mode
pnpm dev
```

The web app starts at `http://localhost:3000`.

### Build

```bash
pnpm build                    # Build all packages
pnpm --filter @marketplace/web build   # Build web only
```

### Testing

```bash
# Unit tests
cd apps/web
pnpm test
pnpm test:coverage

# E2E tests (requires backend running on port 5000)
pnpm test:e2e
pnpm test:e2e:ui          # Interactive mode
pnpm test:e2e:headed      # Visible browser
```

## Environment Variables

Create `apps/web/.env`:

```bash
VITE_API_URL=http://localhost:5000
VITE_DEFAULT_LANG=lv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
```

See `apps/web/.env.example` for the full list.

## Mobile Experience

This is a **responsive PWA**, not a separate mobile app. On small screens (< 768px), the app renders a dedicated mobile UI:

- Full-screen Leaflet map with job markers
- Swipeable bottom sheet (collapsed / half / full positions)
- Horizontal scrolling job cards
- Bottom tab navigation
- Floating "+" create button

See the [Mobile vs Desktop Rendering](./ARCHITECTURE.md#mobile-vs-desktop-rendering) section in ARCHITECTURE.md for details.

## Deployment

- **Web** → Vercel (auto-deploys from `main` branch)
- **Backend** → Railway
- **Files/Images** → Supabase Storage
