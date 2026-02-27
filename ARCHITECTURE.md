# Architecture

> Last updated: February 2026 — after removing the React Native mobile app (Phase 1 of #166)

## Monorepo Overview

This is a **pnpm workspace monorepo** managed with [Turborepo](https://turbo.build/).

```
marketplace-frontend/
├── apps/
│   └── web/                  # Vite + React 18 PWA (the only app)
├── packages/
│   └── shared/               # Shared API clients, stores, types, i18n
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

The web app imports from the shared package via `@marketplace/shared`:

```ts
import { useAuthStore, apiClient, Task } from '@marketplace/shared';
```

---

## Shared Package (`packages/shared/`)

Platform-agnostic code that could serve any JavaScript app. No React components, no DOM APIs.

```
packages/shared/src/
├── index.ts                  # Barrel — re-exports everything
├── api/                      # REST API clients (one file per domain)
│   ├── client.ts             # Axios instance + interceptors
│   ├── types.ts              # All shared TypeScript interfaces
│   ├── auth.ts               # Login, register, verify, password reset
│   ├── tasks.ts              # CRUD + apply, withdraw, mark done
│   ├── offerings.ts          # CRUD + boost
│   ├── messages.ts           # Conversations + messages
│   ├── notifications.ts      # Push + in-app notifications
│   ├── reviews.ts            # Submit + fetch reviews
│   ├── favorites.ts          # Add/remove favorites
│   ├── disputes.ts           # Create + respond to disputes
│   ├── geocoding.ts          # Address lookup + reverse geocode
│   ├── listings.ts           # Marketplace listings
│   ├── uploads.ts            # Image upload (avatar, task, chat)
│   ├── users.ts              # Public profiles
│   ├── payments.ts           # Payment endpoints
│   ├── push.ts               # Push subscription management
│   └── index.ts              # Barrel for api/
├── stores/                   # Zustand stores (shared state)
│   ├── authStore.ts          # Auth state, tokens, user profile
│   ├── toastStore.ts         # Toast notification queue
│   ├── matchingStore.ts      # Job-offering matching state
│   ├── favoritesStore.ts     # Favorites cache
│   ├── storage.ts            # Storage adapter (localStorage)
│   └── index.ts
├── constants/
│   └── categories.ts         # Task/offering category definitions + icons
├── services/
│   └── socket.ts             # Socket.IO client
├── i18n/                     # Internationalization (i18next)
│   ├── index.ts              # i18n setup
│   └── locales/
│       ├── en/               # English (27 namespace files)
│       ├── lv/               # Latvian (27 namespace files)
│       └── ru/               # Russian (27 namespace files)
└── types/
    └── index.ts              # Empty — all types now live in api/types.ts
```

### Barrel export rules

`src/index.ts` re-exports everything:

```ts
export * from './api';
export * from './stores';
export * from './constants/categories';
export * from './i18n';
export * from './types';
```

**Important:** If two modules export the same name, the **last export wins**. This caused duplicate type bugs in the past (see #166 Phase 2). All canonical types now live in `api/types.ts`.

### What belongs in shared

- API client functions (REST calls)
- TypeScript interfaces and types
- Zustand stores (auth, toast, favorites, matching)
- i18n configuration and translation files
- Pure constants (categories, enums)
- Socket.IO client

### What does NOT belong in shared

- React components (those go in `apps/web/`)
- DOM APIs (`window`, `document`, `navigator`)
- Browser-specific hooks (`useIsMobile`, `usePushNotifications`)
- Vite/build configuration

---

## Web App (`apps/web/`)

Vite + React 18 + TypeScript PWA. Tailwind CSS for styling. React Router for navigation.

```
apps/web/src/
├── App.tsx                   # Router + providers
├── main.tsx                  # Entry point
├── index.css                 # Global styles + Tailwind
├── vite-env.d.ts             # Vite type declarations
├── api/hooks/                # React Query hooks (data fetching)
├── components/               # Reusable components
├── constants/                # Web-specific constants
├── hooks/                    # Web-specific React hooks
├── lib/                      # Third-party setup (Firebase, React Query)
├── pages/                    # Route-level page components
├── stores/                   # Web-only Zustand stores
├── test/                     # Test setup + mocks
└── utils/                    # Web-specific utility functions
```

---

## Page Structure Convention

Larger pages follow a consistent modular pattern:

```
pages/TaskDetail/
├── index.ts                  # Re-export
├── TaskDetail.tsx            # Main page component
├── types.ts                  # Page-specific types
├── components/               # Page-specific UI components
│   ├── index.ts
│   ├── TaskHeader.tsx
│   ├── TaskInfoGrid.tsx
│   └── ...
└── hooks/                    # Page-specific hooks
    ├── index.ts
    ├── useTaskDetailData.ts
    └── useTaskActions.ts
```

Pages that follow this pattern: `TaskDetail`, `Tasks`, `Profile`, `CreateTask`, `CreateOffering`, `EditTask`, `EditOffering`, `Conversation`, `WorkPage`, `MapHomePage`, `LandingPage`, `OfferingDetail`.

Smaller pages are single files: `Home.tsx`, `Messages.tsx`, `NotFound.tsx`, `UserProfile.tsx`.

---

## Mobile vs Desktop Rendering

This is a **responsive PWA**, not separate apps. The same codebase serves both mobile and desktop users. The rendering split happens at the **page level** using a single hook:

```ts
// hooks/useIsMobile.ts
export const useIsMobile = (breakpoint: number = 768): boolean => { ... }
```

### Three rendering patterns

#### 1. Full view swap (separate mobile module)

Used by the main map/task browsing experience. Mobile gets a completely different UI — map-first with bottom sheets.

```tsx
// MapHomePage.tsx / Tasks.tsx
const isMobile = useIsMobile();
return isMobile ? <MobileTasksView /> : <DesktopTasksView />;
```

`MobileTasksView` is a self-contained module with its own components, hooks, stores, and utils:

```
components/MobileTasksView/
├── MobileTasksView.tsx       # Main mobile map + bottom sheet view
├── constants.ts
├── styles.ts
├── types.ts
├── components/               # Mobile-specific UI
│   ├── FilterSheet.tsx
│   ├── FloatingSearchBar.tsx
│   ├── JobPreviewCard.tsx
│   ├── MapController.tsx
│   ├── MobileJobCard.tsx
│   └── VirtualizedJobList.tsx
├── hooks/
│   ├── useBottomSheet.ts
│   ├── useTasksData.ts
│   └── useUserLocation.ts
├── stores/
│   └── mobileMapStore.ts
└── utils/
    ├── distance.ts           # Haversine distance calculation
    ├── formatting.ts         # Display formatting
    └── markers.ts            # Map marker helpers
```

#### 2. Mobile subfolder (parallel component sets)

Used by `Profile`. Desktop uses `tabs/` components, mobile uses `mobile/` components.

```
pages/Profile/components/
├── mobile/                   # Mobile-only profile UI
│   ├── MobileActivitySection.tsx
│   ├── MobileFavoritesSection.tsx
│   ├── MobileListingsTeaser.tsx
│   ├── MobileReviewsSection.tsx
│   └── MobileSettingsSheet.tsx
├── tabs/                     # Desktop tab panels
│   ├── AboutTab.tsx
│   ├── TasksTab.tsx
│   ├── OfferingsTab.tsx
│   ├── ReviewsTab.tsx
│   ├── ListingsTab.tsx
│   └── SettingsTab.tsx
└── ProfileHeader/            # Shared across both
```

#### 3. Inline `isMobile` prop (same component, different layout)

Used by smaller components where the differences are minor (padding, positioning, layout direction).

```tsx
// Conversation.tsx
const isMobile = useIsMobile();
if (isMobile) {
  return <MobileConversationLayout ... />;
}
return <DesktopConversationLayout ... />;
```

Components using this pattern: `Conversation`, `Messages`, `WorkPage`, `AuthBottomSheet`, `Layout`, `NotificationBell`, `ChatHeader`, `MessageInput`, `LoadingState`.

### Mobile-specific layout components

| Component | Location | Purpose |
|-----------|----------|---------|
| `MobileBottomNav` | `components/Layout/` | Bottom tab bar (Home, Tasks, Messages, Work, Profile) |
| `MobileMenu` | `components/Layout/Header/` | Hamburger menu for mobile header |
| `BottomSheet` | `components/ui/` | Reusable bottom sheet primitive |
| `FilterSheet` | `MobileTasksView/components/` | Task/offering filter panel |

---

## API / Data Fetching Layers

Data flows through two layers:

```
Component → React Query hook (apps/web) → API client (packages/shared) → Backend
```

### Layer 1: API clients (`packages/shared/src/api/`)

Raw REST calls using Axios. One file per domain. Returns typed responses.

```ts
// packages/shared/src/api/tasks.ts
export const getTasks = (params?: TasksParams): Promise<Task[]> => ...
export const getTask = (id: number): Promise<Task> => ...
export const createTask = (data: CreateTaskData): Promise<Task> => ...
```

### Layer 2: React Query hooks (`apps/web/src/api/hooks/`)

Wrap API clients with caching, loading states, and error handling.

```ts
// apps/web/src/api/hooks/useTasks.ts
export const useTasks = (params?: TasksParams) => useQuery({ ... });
export const useTask = (id: number) => useQuery({ ... });
```

**Some pages also call API clients directly** (without React Query) for mutations or one-off calls. This is inconsistent but functional.

---

## State Management

| Store | Package | Purpose |
|-------|---------|---------|
| `authStore` | shared | User auth state, tokens, profile |
| `toastStore` | shared | Toast notification queue |
| `matchingStore` | shared | Job-offering matching preferences |
| `favoritesStore` | shared | Favorites cache |
| `mobileMapStore` | web (MobileTasksView) | Mobile map view state (zoom, center, selected task) |
| `useAuthPrompt` | web | Auth bottom sheet open/close state |

All stores use [Zustand](https://github.com/pmndrs/zustand). Shared stores persist via `storage.ts` (localStorage adapter).

---

## Constants

| File | Package | What |
|------|---------|------|
| `categories.ts` | shared | Task/offering categories with icons |
| `categories.ts` | web | Additional web-specific category config |
| `featureFlags.ts` | web | Feature toggles |
| `locations.ts` | web | Default locations / map bounds |
| `map.ts` | web | Map tile URLs, default zoom levels |

---

## i18n (Internationalization)

Using [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/).

- **3 languages**: English (`en`), Latvian (`lv`), Russian (`ru`)
- **27 namespaces** per language (auth, common, tasks, profile, etc.)
- All translation files live in `packages/shared/src/i18n/locales/`
- i18n setup is in `packages/shared/src/i18n/index.ts`

---

## Known Tech Debt

### Cross-module imports from MobileTasksView

`WorkPage` imports directly from `MobileTasksView` internals:
- `WorkPage.tsx` → `MobileTasksView/components/FilterSheet`
- `useWorkPage.ts` → `MobileTasksView/utils/distance`

`MobileTasksView` is the dedicated mobile PWA experience (map + bottom sheet). These cross-imports are pragmatic reuse. If `FilterSheet` or `distance.ts` are needed by more consumers in the future, extract them to a shared location.

### Duplicate deep imports

Two files bypass the barrel export and import directly from shared package internals:

```ts
import { NotificationType } from '@marketplace/shared/src/api/notifications';
import type { Notification } from '@marketplace/shared/src/api/notifications';
```

These should use `@marketplace/shared` instead. The types need to be re-exported through the barrel.

### `react-native` peer dependency

`packages/shared/package.json` may still list `react-native` as a dependency from the pre-removal era. This causes harmless but noisy peer dependency warnings during `pnpm install`.

### Inconsistent data fetching

Some pages use React Query hooks (`api/hooks/`), others call shared API clients directly. Consider migrating all data fetching to React Query for consistent caching and loading states.

---

## Guidelines for New Code

### Where does it go?

| Type of code | Location |
|-------------|----------|
| REST API call | `packages/shared/src/api/` |
| TypeScript interface / type | `packages/shared/src/api/types.ts` |
| Zustand store (app-agnostic) | `packages/shared/src/stores/` |
| Translation strings | `packages/shared/src/i18n/locales/{lang}/` |
| React Query hook | `apps/web/src/api/hooks/` |
| React component (reusable) | `apps/web/src/components/` or `components/ui/` |
| React component (page-specific) | `apps/web/src/pages/{PageName}/components/` |
| Page-specific hook | `apps/web/src/pages/{PageName}/hooks/` |
| Browser-dependent utility | `apps/web/src/utils/` |
| Pure utility (no DOM) | `packages/shared/src/utils/` (create if needed) |
| Web-only constant | `apps/web/src/constants/` |
| Mobile-specific map UI | `apps/web/src/components/MobileTasksView/` |

### Import rules

1. **Always import from `@marketplace/shared`** — never from deep paths like `@marketplace/shared/src/api/tasks`
2. **Never add duplicate types** — all shared interfaces live in `packages/shared/src/api/types.ts`
3. **Page modules are self-contained** — a page's `components/` and `hooks/` should not be imported by other pages (extract to `components/` or `shared` if reuse is needed)
