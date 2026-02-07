# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Kolab Marketplace** - A React/TypeScript marketplace platform with three segments:
1. **Buy/Sell Classifieds** - Like ss.lv, browse and post items for sale
2. **Quick Help Jobs** - Task marketplace with interactive map (find jobs nearby)
3. **Service Offerings** - Advertise your skills and services

**Monorepo Structure:**
- `apps/web/` - React web app (Vite + React 18 + TypeScript)
- `apps/mobile/` - Expo React Native mobile app
- `packages/shared/` - Shared code (API client, types, stores, services)

**Languages:** Latvian 🇱🇻 (primary), Russian 🇷🇺, English 🇬🇧

**Live URLs:**
- Frontend: https://marketplace-frontend-tau-seven.vercel.app
- Backend: https://marketplace-backend-rnj4.onrender.com

## Development Commands

### Root Level (Monorepo)
```bash
# Install all dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Run specific app
pnpm dev:web      # Web app only
pnpm dev:mobile   # Mobile app only

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Type check all packages
turbo type-check
```

### Web App (`apps/web/`)
```bash
cd apps/web

# Development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run unit tests (Jest)
pnpm test
pnpm test:watch
pnpm test:coverage

# Run E2E tests (Playwright)
# IMPORTANT: Start backend first (python wsgi.py in marketplace-backend)
pnpm test:e2e
pnpm test:e2e:ui        # Interactive mode
pnpm test:e2e:headed    # With visible browser
pnpm test:e2e:debug     # Debug mode
pnpm test:e2e:report    # View HTML report

# Lint
pnpm lint
```

### Mobile App (`apps/mobile/`)
```bash
cd apps/mobile

# Start Expo dev server
pnpm dev

# Start with cache cleared
pnpm dev:clear

# Kill stuck ports and restart
pnpm restart

# Run on specific platform
pnpm android
pnpm ios
pnpm web

# Build for production
pnpm build:android
pnpm build:ios

# Type check
pnpm type-check
```

### Backend (Separate Repository)
```bash
cd marketplace-backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server (http://localhost:5000)
python wsgi.py
```

## Architecture

### Monorepo Setup
- **Package Manager:** pnpm with workspaces
- **Build System:** Turborepo for task orchestration
- **Workspace Packages:**
  - `@marketplace/web` - Web application
  - `@marketplace/mobile` - Mobile application
  - `@marketplace/shared` - Shared utilities

### Shared Package (`packages/shared/`)
Contains code shared between web and mobile apps:

**API Layer (`src/api/`):**
- `client.ts` - Axios instance with auth interceptors
- `auth.ts`, `tasks.ts`, `offerings.ts`, `listings.ts`, etc. - API endpoint functions
- Environment-agnostic API URL handling (works with Vite and Expo)

**State Management (`src/stores/`):**
- Zustand stores: `authStore`, `favoritesStore`, `matchingStore`, `toastStore`
- Persistent storage abstraction for web (localStorage) and mobile (AsyncStorage)

**Types (`src/types/`):**
- TypeScript interfaces for User, Task, Offering, Listing, etc.
- API response types and pagination types

**Services (`src/services/`):**
- `socket.ts` - Socket.io client for real-time features (messaging, presence)

**Constants (`src/constants/`):**
- `categories.ts` - Unified category system (15 categories with icons, labels, descriptions)
- Legacy category mapping for backward compatibility

### Web App Architecture (`apps/web/`)

**Tech Stack:**
- React 18 + TypeScript
- Vite (build tool)
- React Router v6 (routing)
- Tailwind CSS (styling)
- Leaflet + react-leaflet (maps)
- TanStack Query (data fetching)
- Zustand (state management)
- i18next (internationalization)
- Firebase (phone authentication)

**Key Directories:**
- `src/pages/` - Route components (Home, Tasks, Listings, Profile, etc.)
- `src/components/` - Reusable UI components
- `src/components/MobileTasksView/` - Mobile-optimized map view with bottom sheet
- `src/api/hooks/` - React Query hooks (will be moved to shared package in Phase 2)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities (Firebase config, React Query client)
- `src/constants/` - App constants (categories, etc.)
- `e2e/` - Playwright E2E tests

**Routing:**
- `/` - Home (map view for Quick Help jobs)
- `/welcome` - Landing page for marketing
- `/login`, `/register` - Authentication
- `/listings` - Buy/Sell classifieds
- `/tasks` - Quick Help jobs (map view)
- `/offerings/:id` - Service offering details
- `/profile` - User profile and settings
- `/messages` - Real-time messaging
- `/admin/*` - Admin dashboard

**Mobile-First Design:**
- `MobileTasksView` component provides native-like experience:
  - Full-screen map with job markers
  - Swipeable bottom sheet (collapsed/half/full positions)
  - Horizontal scrolling job cards
  - Floating "+" create button
  - Hamburger menu with navigation

### Mobile App Architecture (`apps/mobile/`)

**Tech Stack:**
- Expo SDK 54
- React Native 0.81
- Expo Router (file-based navigation)
- React Native Maps
- TanStack Query
- Zustand
- Firebase Authentication

**Key Directories:**
- `app/` - Expo Router file-based routes
- `app/(tabs)/` - Bottom tab navigation
- `app/(auth)/` - Authentication screens
- `src/components/` - Reusable components
- `src/hooks/` - Custom hooks
- `src/stores/` - Mobile-specific stores (language, theme, presence)
- `src/config/` - Environment configuration

**Navigation Structure:**
- Tab-based navigation (Home, Work, Messages, Profile)
- Stack navigation within each tab
- Modal screens for create/edit flows

## Important Patterns

### API Client Usage
```typescript
// Import from shared package
import { apiClient, getTasks, createTask } from '@marketplace/shared';

// API client has auth interceptors built-in
// Automatically adds Bearer token from authStore
// Handles 401 responses (auto-logout)
```

### State Management
```typescript
// Import stores from shared package
import { useAuthStore, useFavoritesStore } from '@marketplace/shared';

// Access state and actions
const { user, isAuthenticated, login, logout } = useAuthStore();
```

### Environment Variables

**Web (`.env`):**
```bash
VITE_API_URL=http://localhost:5000
VITE_DEFAULT_LANG=lv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# etc.
```

**Mobile (`.env`):**
```bash
EXPO_PUBLIC_API_URL=https://marketplace-backend-production.up.railway.app
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

### Internationalization (i18n)

**Web:** Uses `react-i18next`
```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();
const text = t('tasks.createJob'); // "Izveidot darbu" in Latvian
i18n.changeLanguage('en'); // Switch language
```

**Mobile:** Uses custom translation hook
```typescript
import { useTranslation } from '@/hooks/useTranslation';

const { t, changeLanguage } = useTranslation();
```

**Translation Files:**
- Web: `apps/web/src/translations/{lv,ru,en}.json`
- Mobile: `apps/mobile/src/translations/{lv,ru,en}.json`

### Category System

Use the unified category system from `@marketplace/shared`:
```typescript
import {
  CATEGORIES,           // All categories including 'all'
  FORM_CATEGORIES,      // Categories for forms (excludes 'all')
  getCategoryIcon,      // Get emoji icon
  getCategoryLabel,     // Get display label
  normalizeCategory,    // Convert legacy keys
  isValidCategory       // Validate category key
} from '@marketplace/shared';
```

**15 Categories:** cleaning, moving, assembly, handyman, plumbing, electrical, painting, outdoor, delivery, care, tutoring, tech, beauty, events, other

### Map Integration (Web)

**Leaflet Setup:**
```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icons
import { createUserLocationIcon, getJobPriceIcon } from './utils';
```

**Price-based Marker Colors:**
- Green: €0-30 (budget jobs)
- Blue: €31-70 (standard jobs)
- Purple-gold: €71+ (premium jobs)

### Real-time Features

**Socket.io Integration:**
```typescript
import { socketService } from '@marketplace/shared';

// Connect (happens automatically on auth)
socketService.connect(token);

// Listen for events
socketService.on('new_message', handleNewMessage);
socketService.on('user_online', handleUserOnline);

// Emit events
socketService.emit('join_conversation', conversationId);

// Disconnect
socketService.disconnect();
```

## Testing

### Unit Tests (Jest)
- Located in `apps/web/src/**/*.test.{ts,tsx}`
- Uses `@testing-library/react` for component testing
- Mock setup in `apps/web/src/test/setup.ts`

### E2E Tests (Playwright)
- Located in `apps/web/e2e/`
- Tests: `auth.spec.ts`, `tasks.spec.ts`, `listings.spec.ts`
- **CRITICAL:** Backend must be running before E2E tests
- Run on multiple browsers: Chromium, Firefox, WebKit
- Mobile viewports: Pixel 5, iPhone 12

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- Use interfaces for object types
- Avoid `any` - use `unknown` or proper types
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### React
- Functional components with hooks
- Use `React.lazy()` for route-based code splitting
- Prefer composition over prop drilling
- Use custom hooks for reusable logic

### Styling
- Tailwind CSS utility classes
- Mobile-first responsive design
- Custom colors: `primary-*` (blue), `secondary-*` (gray)
- Animations: `animate-spin-slow`, `animate-slide-up`

### Imports
- Use `@marketplace/shared` for shared code
- Use `@/` path alias for local imports (web app)
- Group imports: React, third-party, local, types

## Migration Status

**Phase 1 (In Progress):** Migrating web app to use `@marketplace/shared`
- Mobile app already uses shared package ✅
- Web app partially migrated (some files still use local imports)
- See `MIGRATION_STATUS.md` for details

**When editing web app files:**
- Prefer imports from `@marketplace/shared` over local paths
- Update old imports: `../api/client` → `@marketplace/shared`
- Update store imports: `../stores/authStore` → `@marketplace/shared`

## Common Tasks

### Adding a New API Endpoint
1. Add function to `packages/shared/src/api/{module}.ts`
2. Export from `packages/shared/src/api/index.ts`
3. Create React Query hook in `apps/web/src/api/hooks/` (temporary)
4. Use in components

### Adding a New Page (Web)
1. Create component in `apps/web/src/pages/`
2. Add route in `apps/web/src/App.tsx`
3. Add lazy import with `React.lazy()`
4. Add translations to all language files

### Adding a New Screen (Mobile)
1. Create file in `apps/mobile/app/` (Expo Router)
2. Use file-based routing conventions
3. Add translations to mobile translation files

### Adding a New Category
1. Update `packages/shared/src/constants/categories.ts`
2. Add to `CATEGORIES` array with icon, label, description
3. Update legacy mapping if needed
4. Add translations for category label

### Updating Translations
1. Add keys to all three language files (lv, ru, en)
2. Keep structure consistent across languages
3. Use nested objects for organization
4. Test language switching in UI

## Known Issues & Gotchas

### API Client
- Don't set `Content-Type` manually for FormData uploads
- Auth interceptor automatically adds Bearer token
- 401 responses trigger auto-logout (except for auth endpoints)

### Environment Variables
- Vite uses `VITE_` prefix, Expo uses `EXPO_PUBLIC_` prefix
- API URL handling is environment-agnostic in shared package
- Restart dev server after changing `.env` files

### Maps (Leaflet)
- Import CSS: `import 'leaflet/dist/leaflet.css'`
- Custom icons need explicit size and anchor configuration
- Use `react-leaflet` v4 (not v3)

### Mobile Development
- Clear Expo cache if seeing stale code: `pnpm dev:clear`
- Kill stuck ports: `pnpm restart`
- iOS requires Mac for development
- Android requires Android Studio and emulator setup

### Testing
- E2E tests require backend running on port 5000
- Use unique test data (timestamps) to avoid conflicts
- Playwright tests run in parallel by default

## Deployment

### Web App (Vercel)
- Automatic deploys from `main` branch
- Build command: `pnpm build`
- Output directory: `apps/web/dist`
- Environment variables set in Vercel dashboard

### Mobile App (Expo)
- Build with EAS: `pnpm build:android` or `pnpm build:ios`
- Requires Expo account and EAS CLI
- Configure in `apps/mobile/app.json`

### Backend (Render.com)
- Separate repository: marketplace-backend
- Python Flask application
- PostgreSQL database

## Resources

- **Roadmap:** See `ROADMAP.md` for feature status and progress
- **Migration Guide:** See `MIGRATION_STATUS.md` for Phase 1 details
- **E2E Tests:** See `apps/web/e2e/README.md` for testing guide
- **Mobile Setup:** See `README_MOBILE.md` for mobile-specific instructions
