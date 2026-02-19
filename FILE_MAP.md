# Marketplace Frontend — File Map

> Quick-reference index of every file and folder. Ctrl+F to find what anything does.

**Last Updated**: February 19, 2026

---

## Root Files

| File | Purpose |
|------|---------|
| `package.json` | Root package — defines workspace scripts |
| `pnpm-workspace.yaml` | Declares pnpm workspace packages (apps/ and packages/) |
| `pnpm-lock.yaml` | Lockfile for deterministic installs |
| `turbo.json` | Turborepo pipeline config — defines build/dev/lint tasks |
| `vercel.json` | Vercel deployment configuration (rewrites, build settings) |
| `.gitignore` | Git ignore rules |
| `.npmrc` | npm/pnpm configuration |
| `.prettierrc` | Code formatting rules |
| `README.md` | Main project documentation |
| `README_MOBILE.md` | Mobile/PWA-specific documentation |
| `ROADMAP.md` | Feature development roadmap |
| `ARCHITECTURE.md` | This architecture guide |
| `FILE_MAP.md` | This file — quick reference for every file |

---

## `apps/web/src/` — Main Application Source

### Entry & Config

| File | One-Line Description |
|------|---------------------|
| `main.tsx` | Bootstraps React app, renders `<App />` into DOM |
| `App.tsx` | Root component — all routes defined here, wraps everything in providers |
| `index.css` | Global CSS styles for the entire application |
| `vite-env.d.ts` | TypeScript declarations for Vite env variables (VITE_API_URL, etc.) |

### `pages/` — Full Screen Views

| File/Folder | One-Line Description |
|-------------|---------------------|
| `LandingPage/` | Marketing/intro page shown to unauthenticated visitors |
| `Onboarding/` | New user setup wizard (after first registration) |
| `auth/` | Login and registration page(s) |
| `Home.tsx` | Main dashboard — first screen after login |
| `MapHomePage/` | Map-based view with tasks/offerings plotted by location |
| `Tasks/` | Browse/search all Quick Help tasks |
| `CreateTask/` | Form page to post a new Quick Help task |
| `EditTask/` | Form page to edit an existing task |
| `TaskDetail/` | Single task view — apply, accept workers, mark done, confirm |
| `CreateOffering/` | Form page to create a new service offering |
| `EditOffering/` | Form page to edit an existing offering |
| `OfferingDetail/` | Single offering view with provider info |
| `WorkPage/` | Active work dashboard (your assigned tasks + your offerings) |
| `Profile/` | Your own profile page (view + edit) |
| `UserProfile.tsx` | Public profile page for viewing other users |
| `UserProfile/` | Components for the public user profile page |
| `Messages.tsx` | Conversations list page |
| `Messages/` | Message-related components |
| `Conversation/` | Individual chat thread page |
| `admin/` | Admin moderation panel |
| `legal/` | Static legal pages (terms, privacy) |
| `NotFound.tsx` | 404 error page |

### `components/` — Reusable UI

| File/Folder | One-Line Description |
|-------------|---------------------|
| `Layout/` | App shell — header, navigation, footer, responsive container |
| `ProtectedRoute.tsx` | Route guard — redirects unauthenticated users to login |
| `AuthBottomSheet.tsx` | Mobile bottom sheet for login/register (standalone) |
| `AuthBottomSheet/` | Components for the auth bottom sheet |
| `auth/` | Auth-related form components |
| `MobileTasksView/` | Mobile-optimized task browsing (cards, swipe) |
| `offerings/` | Offering cards, list components, filters |
| `ui/` | Base UI primitives — buttons, inputs, modals, spinners |
| `ConfirmTaskModal.tsx` | Modal popup for confirming a task is complete |
| `ReviewModal.tsx` | Modal for writing and submitting user reviews |
| `QuickHelpIntroModal.tsx` | Tutorial/intro modal explaining Quick Help feature |
| `ImagePicker.tsx` | Image upload and selection component |
| `ScrollToTop.tsx` | Scrolls page to top on route navigation |
| `PWAInstallPrompt.tsx` | "Add to Home Screen" prompt for mobile users |
| `PWAUpdatePrompt.tsx` | Notification when new app version is available |
| `SocketProvider.tsx` | WebSocket connection provider (real-time messaging) |
| `NotificationBell/` | Notification icon with unread count badge |

### `api/` — Backend Communication

| File/Folder | One-Line Description |
|-------------|---------------------|
| `api/hooks/` | React hooks for every API call (useTasks, useAuth, useOfferings, etc.) |

### `stores/` — Global State

| File | One-Line Description |
|------|---------------------|
| `useAuthPrompt.ts` | Zustand store — controls auth bottom sheet visibility |

### `hooks/` — Custom React Hooks

| Folder | One-Line Description |
|--------|---------------------|
| `hooks/` | Reusable React logic (auth state, geolocation, debounce, etc.) |

### `lib/` — Library Configs

| Folder | One-Line Description |
|--------|---------------------|
| `lib/` | API client setup, library wrappers, configuration |

### `utils/` — Helper Functions

| Folder | One-Line Description |
|--------|---------------------|
| `utils/` | Pure functions — date formatting, validation, distance calc |

### `constants/` — Static Values

| Folder | One-Line Description |
|--------|---------------------|
| `constants/` | Categories, status labels, config strings, error messages |

### `test/` — Testing

| Folder | One-Line Description |
|--------|---------------------|
| `test/` | Test setup, utilities, and test files |

---

## `packages/` — Shared Code

Shared libraries used across apps in the monorepo.

---

## `docs/` — Documentation

Additional project documentation files.

---

## `logo/` — Brand Assets

Logo files and brand imagery.

---

## `scripts/` — Build Scripts

Build utilities and automation scripts.

---

## `.github/` — GitHub Config

GitHub Actions workflows, issue templates, and PR templates.
