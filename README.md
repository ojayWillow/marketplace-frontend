# 🛒 Kolab Marketplace — Frontend

A **Latvian marketplace platform** built as a pnpm monorepo, featuring Buy/Sell classifieds, Quick Help task jobs with interactive maps, and Service Offerings. Supports Latvian 🇱🇻, Russian 🇷🇺, and English 🇬🇧.

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
│   ├── web/                  # React 18 web app (Vite + TypeScript)
│   └── mobile/               # Expo React Native mobile app (SDK 54)
├── packages/
│   └── shared/               # Shared API client, stores, types, services
├── turbo.json                # Turborepo task orchestration
├── pnpm-workspace.yaml       # pnpm workspace config
└── package.json              # Root scripts
```

### `apps/web/` — Web Application

- **React 18 + TypeScript** with **Vite** build tool
- **React Router v6** for routing
- **Tailwind CSS** for mobile-first responsive styling
- **Leaflet + react-leaflet** for interactive maps
- **TanStack Query** for server state / data fetching
- **Zustand** for client state management
- **i18next** for internationalization (3 languages)
- **Firebase** phone authentication
- **Playwright** E2E tests + **Jest** unit tests
- **PWA** support via vite-plugin-pwa

Key routes: `/` (map view), `/listings` (classifieds), `/tasks` (jobs), `/offerings/:id`, `/messages`, `/profile`, `/admin/*`

### `apps/mobile/` — Mobile Application

- **Expo SDK 54** + **React Native 0.81**
- **Expo Router** (file-based navigation)
- **React Native Maps** for native map experience
- **TanStack Query + Zustand** (shared with web)
- **Firebase Authentication**
- Tab-based navigation: Home, Work, Messages, Profile

### `packages/shared/` — Shared Code

Code shared between web and mobile:

- **API Layer** (`src/api/`) — Axios client with auth interceptors, endpoint functions for tasks, listings, offerings, auth, messages, etc.
- **Stores** (`src/stores/`) — Zustand stores: `authStore`, `favoritesStore`, `matchingStore`, `toastStore`
- **Types** (`src/types/`) — TypeScript interfaces (User, Task, Offering, Listing, etc.)
- **Services** (`src/services/`) — Socket.io client for real-time messaging and presence
- **Constants** (`src/constants/`) — Unified 15-category system with icons, labels, descriptions

## Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** 8+
- Backend running (see [marketplace-backend](https://github.com/ojayWillow/marketplace-backend))

### Install & Run

```bash
# Install all dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Or run individually
pnpm dev:web        # Web app at http://localhost:3000
pnpm dev:mobile     # Expo mobile app
```

### Build

```bash
pnpm build          # Build all packages

# Mobile builds (requires Expo EAS)
cd apps/mobile
pnpm build:android
pnpm build:ios
```

### Testing

```bash
# Unit tests (web)
cd apps/web
pnpm test
pnpm test:coverage

# E2E tests (requires backend running on port 5000)
pnpm test:e2e
pnpm test:e2e:ui          # Interactive mode
pnpm test:e2e:headed      # Visible browser
```

## Environment Variables

### Web (`apps/web/.env`)

```bash
VITE_API_URL=http://localhost:5000
VITE_DEFAULT_LANG=lv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
```

### Mobile (`apps/mobile/.env`)

```bash
EXPO_PUBLIC_API_URL=https://marketplace-backend-production-e808.up.railway.app
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

## Mobile-First Web Design

The web app has a dedicated `MobileTasksView` component providing a native-like experience on mobile browsers:

- Full-screen Leaflet map with job markers
- Swipeable bottom sheet (collapsed / half / full positions)
- Horizontal scrolling job cards
- Floating "+" create button
- Hamburger menu navigation

Located at `apps/web/src/components/MobileTasksView/` with its own components, hooks, utils, styles, and types.

## Deployment

- **Web** → Vercel (auto-deploys from `main` branch)
- **Mobile** → Expo EAS builds
- **Backend** → Railway

## Migration Status

**Phase 1 (In Progress):** Migrating web app imports to use `@marketplace/shared` instead of local paths. The mobile app already uses the shared package. When editing web app files, prefer `@marketplace/shared` imports over local ones.

---

## Current Status (Feb 2026)

- ✅ Web app, mobile app, and backend all functional
- ✅ Backend migrated to Railway
- ✅ Supabase for file/image storage
- 🔧 **Next: Tweaking mobile view** — polishing the web app's mobile-responsive experience
- 🔧 Phase 1 shared package migration ongoing
