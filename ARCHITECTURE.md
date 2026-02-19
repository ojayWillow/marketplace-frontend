# Marketplace Frontend — Architecture Guide

**Last Updated**: February 19, 2026

---

## Overview

The Marketplace is a full-stack web application for local services — users can post buy/sell listings, create Quick Help tasks (with location-based matching), offer professional services, message each other, and leave reviews. The frontend is a **React + TypeScript** single-page app built with **Vite**, managed in a **Turborepo monorepo**, and deployed on **Vercel**. The mobile experience is delivered as a **PWA** (Progressive Web App).

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18+ with TypeScript |
| Build Tool | Vite |
| Monorepo | Turborepo + pnpm workspaces |
| Styling | CSS (index.css) |
| State Management | Zustand (stores/) |
| API Communication | Custom hooks in api/hooks/ |
| Routing | React Router |
| Deployment | Vercel |
| Mobile | PWA (install prompt + service worker) |
| Real-time | Socket.io (SocketProvider) |

---

## How the System Works (End to End)

```
┌─────────────────────────────────────────────────────────┐
│                      USER (Browser)                      │
│                  Web View / Mobile PWA                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (This Repo)                         │
│                                                           │
│  pages/        → Full screen views (routes)               │
│  components/   → Reusable UI pieces                       │
│  api/hooks/    → Data fetching (talks to backend)         │
│  stores/       → Global state (auth, UI state)            │
│  hooks/        → Custom React logic                       │
│  lib/          → Libraries & configs                      │
│  utils/        → Helper functions                         │
│  constants/    → Static values & categories               │
└──────────────────────┬──────────────────────────────────┘
                       │  HTTP (REST API) + WebSocket
                       ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (marketplace-backend)                │
│                                                           │
│  Flask 3.x + SQLAlchemy + PyJWT                          │
│                                                           │
│  /api/auth       → Register, Login, JWT, Profile          │
│  /api/listings   → Buy/Sell classifieds (CRUD)            │
│  /api/tasks      → Quick Help tasks + applications        │
│  /api/offerings  → Service offerings + location search    │
│  /api/reviews    → User reviews & ratings                 │
│  /api/uploads    → Image upload & serving                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE                                     │
│  SQLite (development) / PostgreSQL (production)           │
│  Deployed on Railway                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
marketplace-frontend/
├── apps/
│   └── web/                   # The main web application
│       └── src/               # All source code lives here
├── packages/                  # Shared libraries across apps
├── docs/                      # Documentation
├── logo/                      # Brand assets
├── scripts/                   # Build & utility scripts
├── turbo.json                 # Turborepo pipeline config
├── pnpm-workspace.yaml        # Workspace definition
├── vercel.json                # Vercel deployment config
└── package.json               # Root package.json
```

---

## Frontend Source Code (`apps/web/src/`)

### Entry Points

| File | Purpose |
|------|--------|
| `main.tsx` | App bootstrap — renders `<App />` into the DOM, sets up providers |
| `App.tsx` | Root component — defines all routes, wraps app in layout & auth context |
| `index.css` | Global styles for the entire application |
| `vite-env.d.ts` | TypeScript type declarations for Vite environment variables |

---

### `pages/` — Every Screen in the App

Each folder or file here is a full-screen view mapped to a URL route.

| Page | Route (approx) | What It Does | Backend API Used |
|------|----------------|-------------|------------------|
| `LandingPage/` | `/` | Marketing page for unauthenticated users | None |
| `Onboarding/` | `/onboarding` | New user setup wizard after registration | `PUT /api/auth/profile` |
| `auth/` | `/login`, `/register` | Login & registration forms | `POST /api/auth/login`, `POST /api/auth/register` |
| `Home.tsx` | `/home` | Main dashboard — entry point after login | Multiple |
| `MapHomePage/` | `/map` | Map-based view showing tasks/offerings by location | `GET /api/tasks`, `GET /api/offerings` |
| `Tasks/` | `/tasks` | Browse all Quick Help tasks | `GET /api/tasks` |
| `CreateTask/` | `/tasks/create` | Form to post a new task | `POST /api/tasks` |
| `EditTask/` | `/tasks/:id/edit` | Edit an existing task | `PUT /api/tasks/:id` |
| `TaskDetail/` | `/tasks/:id` | View task, apply, accept workers, mark done | `GET /api/tasks/:id`, `POST /api/tasks/:id/apply`, etc. |
| `CreateOffering/` | `/offerings/create` | Form to create a service offering | `POST /api/offerings` |
| `EditOffering/` | `/offerings/:id/edit` | Edit an existing offering | `PUT /api/offerings/:id` |
| `OfferingDetail/` | `/offerings/:id` | View offering details | `GET /api/offerings/:id` |
| `WorkPage/` | `/work` | Your active work dashboard (assigned tasks, your offerings) | `GET /api/tasks/my`, `GET /api/offerings/my` |
| `Profile/` | `/profile` | Your own profile with edit capabilities | `GET /api/auth/profile`, `PUT /api/auth/profile` |
| `UserProfile/` | `/users/:id` | Public profile of another user | `GET /api/auth/users/:id`, `GET /api/auth/users/:id/reviews` |
| `Messages.tsx` | `/messages` | Conversations list | WebSocket / API |
| `Messages/` | `/messages` | Messages components directory | WebSocket / API |
| `Conversation/` | `/messages/:id` | Individual chat thread | WebSocket / API |
| `admin/` | `/admin` | Admin panel for moderation | Admin endpoints |
| `legal/` | `/legal/*` | Terms of service, privacy policy | None (static) |
| `NotFound.tsx` | `*` | 404 error page | None |

---

### `components/` — Reusable UI Building Blocks

| Component | What It Does |
|-----------|--------------|
| `Layout/` | Main app shell — header, navigation bar, footer, responsive wrapper |
| `ProtectedRoute.tsx` | Route guard — redirects to login if user is not authenticated |
| `AuthBottomSheet.tsx` + `AuthBottomSheet/` | Mobile-style bottom sheet for login/register prompts |
| `auth/` | Auth-related form components (login form, register form) |
| `MobileTasksView/` | Mobile-optimized task browsing interface |
| `offerings/` | Offering-specific components (cards, lists, filters) |
| `ui/` | Base UI primitives (buttons, inputs, modals, etc.) |
| `ConfirmTaskModal.tsx` | Modal dialog for confirming task completion |
| `ReviewModal.tsx` | Modal for writing/submitting user reviews |
| `QuickHelpIntroModal.tsx` | Intro/tutorial modal explaining how Quick Help works |
| `ImagePicker.tsx` | Image selection and upload component |
| `ScrollToTop.tsx` | Utility that scrolls to top on route change |
| `PWAInstallPrompt.tsx` | Prompt for users to install the app as PWA on mobile |
| `PWAUpdatePrompt.tsx` | Notification when a new version of the PWA is available |
| `SocketProvider.tsx` | WebSocket connection provider for real-time features |
| `NotificationBell/` | Bell icon with notification count |

---

### `api/` — Backend Communication

| Path | Purpose |
|------|---------|
| `api/hooks/` | Custom React hooks that handle API calls (fetch, create, update, delete) |

These hooks encapsulate all HTTP communication with the Flask backend. Each hook likely corresponds to a resource: `useAuth`, `useTasks`, `useOfferings`, `useListings`, `useReviews`, etc.

**Pattern**: Page → calls api hook → hook makes `fetch()` to backend → returns data → page renders

---

### `stores/` — Global State

| File | Purpose |
|------|---------|
| `useAuthPrompt.ts` | Zustand store that controls when the auth bottom sheet appears (triggers login prompt for unauthenticated actions) |

Additional auth state (JWT token, user info) is likely managed in `hooks/` or within the auth API hooks.

---

### `hooks/` — Custom React Hooks

Reusable logic extracted from components. Could include:
- `useAuth` — authentication state and token management
- `useLocation` — browser geolocation for map features
- `useDebounce` — input debouncing for search
- Other shared behavioral logic

---

### `lib/` — Libraries & Configuration

Utility library wrappers and configuration files (e.g., API base URL config, axios/fetch setup).

---

### `utils/` — Helper Functions

Pure utility functions: date formatting, price formatting, distance calculations, validation helpers, etc.

---

### `constants/` — Static Values

Hardcoded values used across the app: task categories, offering categories, status labels, error messages, etc.

---

### `test/` — Testing

Test setup files and test utilities for the frontend.

---

## Web vs. Mobile View

The app is **NOT two separate apps** — it's a single responsive web app with **PWA capabilities**:

| Feature | Web (Desktop) | Mobile (PWA) |
|---------|--------------|-------------|
| Layout | Full navigation bar, sidebar | Bottom tab bar, hamburger menu |
| Tasks View | Grid/list with map sidebar | `MobileTasksView/` — swipeable cards |
| Auth Flow | Standard forms | `AuthBottomSheet` — slides up from bottom |
| Install | Accessed via browser | `PWAInstallPrompt` — "Add to Home Screen" |
| Updates | Auto on refresh | `PWAUpdatePrompt` — manual reload notification |
| Real-time | WebSocket via `SocketProvider` | Same |

The `Layout/` component detects screen size and renders the appropriate navigation pattern.

---

## Data Flow Examples

### Creating a Quick Help Task
```
1. User navigates to /tasks/create
2. CreateTask/ page renders the task form
3. User fills in: title, description, budget, location (lat/lng), category
4. On submit → api/hooks/ calls POST /api/tasks with JWT token
5. Backend validates, creates task in DB, returns task object
6. Frontend redirects to TaskDetail/ for the new task
```

### Task Application Workflow
```
1. Worker browses Tasks/ or MapHomePage/
2. Clicks a task → TaskDetail/ page loads (GET /api/tasks/:id)
3. Worker clicks "Apply" → POST /api/tasks/:id/apply
4. Task creator sees applications → accepts one (POST /api/tasks/:id/accept-application)
5. Worker marks done → POST /api/tasks/:id/done
6. Creator confirms → POST /api/tasks/:id/confirm
7. ReviewModal.tsx appears → creator leaves review (POST /api/reviews)
8. Task status: open → assigned → pending_confirmation → completed
```

### Authentication Flow
```
1. User opens app → LandingPage/ shown
2. Clicks "Sign Up" → auth/ registration page
3. Submits form → POST /api/auth/register → JWT token returned
4. Token stored in memory/localStorage
5. ProtectedRoute.tsx checks token on every protected page
6. If expired/missing → AuthBottomSheet prompts re-login
7. All subsequent API calls include Authorization: Bearer <token>
```

---

## Deployment Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel     │     │   Railway    │     │  PostgreSQL  │
│  (Frontend)  │────▶│  (Backend)   │────▶│  (Database)  │
│              │     │  Flask API   │     │              │
│  React SPA   │     │              │     │  On Railway  │
│  + PWA       │     │  + Uploads   │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
      ▲                                         
      │                                         
  CDN cached                                    
  static assets                                 
```

- **Frontend**: Vercel serves the built React app as static files with CDN
- **Backend**: Railway runs the Flask server with auto-deploy from GitHub
- **Database**: PostgreSQL on Railway (SQLite for local development)
- **Files**: Uploaded images stored on Railway's filesystem

---

## Key Design Patterns

1. **Page-per-feature**: Each major feature has its own page folder with co-located components
2. **API hooks pattern**: All backend communication goes through `api/hooks/` — no direct fetch calls in pages
3. **Protected routes**: `ProtectedRoute.tsx` wraps pages that need authentication
4. **Mobile-first responsive**: Components adapt between mobile and desktop via CSS + conditional rendering (e.g., `MobileTasksView`)
5. **PWA architecture**: Service worker handles offline caching, install prompts, and update notifications
6. **Real-time via WebSocket**: `SocketProvider.tsx` manages the connection for messaging and notifications

---

## Related Documentation

- [Frontend README](README.md)
- [Mobile README](README_MOBILE.md)
- [Development Roadmap](ROADMAP.md)
- [Backend Project Status](https://github.com/ojayWillow/marketplace-backend/blob/main/PROJECT_STATUS.md)
- [Backend API Endpoints](https://github.com/ojayWillow/marketplace-backend/blob/main/PROJECT_STATUS.md#-api-endpoints)
- [Production URLs](https://github.com/ojayWillow/marketplace-backend/blob/main/PRODUCTION_URLS.md)
