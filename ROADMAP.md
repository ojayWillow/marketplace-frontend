# Marketplace Frontend - Development Roadmap

> **Last Updated**: January 2, 2026  
> **Current Phase**: Phase 1 - Project Setup  
> **Status**: Planning Complete ✅

---

## Project Overview

**Goal**: Build a React-based web UI for the Latvian Marketplace platform

**Two Segments**:
1. **Buy/Sell Classifieds** (Priority 1) - like ss.lv
2. **Quick Help Services** (Priority 2) - task marketplace with map

**Languages**: Latvian 🇱🇻 | Russian 🇷🇺 | English 🇬🇧

**Design**: Mobile-first responsive

---

## Tech Stack

| Category | Technology | Why |
|----------|------------|-----|
| Framework | React 18 + Vite | Fast builds, modern DX |
| Language | TypeScript | Type safety, better IDE support |
| Styling | Tailwind CSS | Rapid development, mobile-first |
| State | Zustand | Simple, scalable global state |
| API | React Query (TanStack) | Caching, loading states, refetching |
| Routing | React Router v6 | Industry standard |
| i18n | react-i18next | LV/RU/EN support |
| Forms | React Hook Form + Zod | Validation, performance |
| Maps | Leaflet + react-leaflet | For Quick Help segment |
| Icons | Lucide React | Clean, consistent icons |

---

## Phase 1: Project Foundation ⬅️ WE ARE HERE

**Goal**: Working dev environment with basic structure

### Tasks:
- [ ] 1.1 Initialize Vite + React + TypeScript project
- [ ] 1.2 Configure Tailwind CSS
- [ ] 1.3 Set up folder structure
- [ ] 1.4 Configure ESLint + Prettier
- [ ] 1.5 Create API client (axios instance)
- [ ] 1.6 Set up React Router with basic routes
- [ ] 1.7 Set up i18n with LV/RU/EN skeleton
- [ ] 1.8 Create base Layout component (Header, Footer)
- [ ] 1.9 Create .env.example with backend URL
- [ ] 1.10 Update README with setup instructions

**Deliverable**: `npm install && npm run dev` works, shows placeholder home page with language switcher

---

## Phase 2: Authentication UI

**Goal**: Users can register, login, and see their profile

### Tasks:
- [ ] 2.1 Create Register page (`/register`)
- [ ] 2.2 Create Login page (`/login`)
- [ ] 2.3 Create auth store (Zustand) for token management
- [ ] 2.4 Create Protected Route component
- [ ] 2.5 Create Profile page (`/profile`)
- [ ] 2.6 Add logout functionality
- [ ] 2.7 Persist auth token in localStorage
- [ ] 2.8 Add auth state to header (Login/Register vs Profile/Logout)
- [ ] 2.9 Handle API errors (wrong password, email taken, etc.)
- [ ] 2.10 Add form validation with Zod

**Deliverable**: Full auth flow working with backend API

### API Endpoints Used:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

---

## Phase 3: Buy/Sell Classifieds (Core)

**Goal**: Users can browse and create listings

### Tasks:
- [ ] 3.1 Create Listings Browse page (`/listings`)
- [ ] 3.2 Create Listing Card component
- [ ] 3.3 Add category filter sidebar/dropdown
- [ ] 3.4 Add search functionality
- [ ] 3.5 Create Listing Detail page (`/listings/:id`)
- [ ] 3.6 Create New Listing page (`/listings/new`) - protected
- [ ] 3.7 Create Edit Listing page (`/listings/:id/edit`) - protected
- [ ] 3.8 Add pagination or infinite scroll
- [ ] 3.9 Create "My Listings" page (`/my-listings`) - protected
- [ ] 3.10 Add listing status badges (active, sold, etc.)

**Deliverable**: Complete Buy/Sell segment functional

### API Endpoints Used:
- `GET /api/listings`
- `GET /api/listings/:id`
- `POST /api/listings`
- `PUT /api/listings/:id`
- `DELETE /api/listings/:id`

---

## Phase 4: Reviews & User Trust

**Goal**: Users can leave and view reviews

### Tasks:
- [ ] 4.1 Create Review component (stars + text)
- [ ] 4.2 Add reviews section to Listing Detail page
- [ ] 4.3 Create "Leave Review" form
- [ ] 4.4 Show seller rating on listing cards
- [ ] 4.5 Create User Profile public page (`/users/:id`)
- [ ] 4.6 Show user's reviews on their profile
- [ ] 4.7 Add review editing/deletion for reviewer

**Deliverable**: Trust system visible throughout app

### API Endpoints Used:
- `GET /api/reviews?user_id=X`
- `POST /api/reviews`
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`

---

## Phase 5: Quick Help Services

**Goal**: Task marketplace with map view

### Tasks:
- [ ] 5.1 Create Tasks Browse page (`/tasks`)
- [ ] 5.2 Create Task Card component
- [ ] 5.3 Integrate Leaflet map view
- [ ] 5.4 Show tasks as markers on map
- [ ] 5.5 Create Task Detail page (`/tasks/:id`)
- [ ] 5.6 Create New Task page (`/tasks/new`) - protected
- [ ] 5.7 Create "Apply to Task" functionality
- [ ] 5.8 Create "My Tasks" page (posted tasks)
- [ ] 5.9 Create "My Applications" page (tasks applied to)
- [ ] 5.10 Task creator can accept/reject applicants

**Deliverable**: Complete Quick Help segment functional

### API Endpoints Used:
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/task_responses`
- `POST /api/task_responses`
- `PUT /api/task_responses/:id`

---

## Phase 6: Polish & UX

**Goal**: Production-ready user experience

### Tasks:
- [ ] 6.1 Add loading skeletons/spinners
- [ ] 6.2 Add toast notifications (success/error)
- [ ] 6.3 Improve mobile navigation (hamburger menu)
- [ ] 6.4 Add 404 page
- [ ] 6.5 Add empty states (no listings, no tasks)
- [ ] 6.6 SEO meta tags
- [ ] 6.7 Favicon and app icons
- [ ] 6.8 Performance optimization (lazy loading)
- [ ] 6.9 Accessibility audit (a11y)
- [ ] 6.10 Cross-browser testing

**Deliverable**: Polished, professional UI

---

## Phase 7: Advanced Features (Future)

**Goal**: Enhanced functionality

### Tasks:
- [ ] 7.1 Image upload for listings
- [ ] 7.2 Real-time notifications (WebSocket)
- [ ] 7.3 Messaging system between users
- [ ] 7.4 Favorites/Watchlist
- [ ] 7.5 Advanced search filters
- [ ] 7.6 Price history / price alerts
- [ ] 7.7 Admin dashboard
- [ ] 7.8 Analytics integration
- [ ] 7.9 PWA support (offline, installable)
- [ ] 7.10 Payment integration (Stripe)

---

## Folder Structure (Target)

```
marketplace-frontend/
├── public/
│   └── locales/           # Translation JSON files
│       ├── lv/
│       ├── ru/
│       └── en/
├── src/
│   ├── api/               # API client & React Query hooks
│   │   ├── client.ts      # Axios instance
│   │   └── hooks/         # useListings, useAuth, etc.
│   ├── components/        # Reusable UI components
│   │   ├── ui/            # Buttons, Inputs, Cards, etc.
│   │   └── layout/        # Header, Footer, Sidebar
│   ├── pages/             # Route pages
│   │   ├── Home.tsx
│   │   ├── auth/          # Login, Register, Profile
│   │   ├── listings/      # Browse, Detail, Create, Edit
│   │   └── tasks/         # Browse, Detail, Create
│   ├── stores/            # Zustand stores
│   │   └── authStore.ts
│   ├── i18n/              # i18n configuration
│   │   └── index.ts
│   ├── lib/               # Utilities, helpers
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Main app with routes
│   └── main.tsx           # Entry point
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── .env.example
├── ROADMAP.md             # This file
└── README.md
```

---

## Definition of Done (Per Phase)

Each phase is complete when:
- [ ] All tasks checked off
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Works on mobile (responsive)
- [ ] All 3 languages have translations
- [ ] Tested with backend API
- [ ] Code committed and pushed

---

## Progress Tracker

| Phase | Status | Started | Completed |
|-------|--------|---------|-----------|
| 1. Project Foundation | 🔲 Not Started | - | - |
| 2. Authentication UI | 🔲 Not Started | - | - |
| 3. Buy/Sell Classifieds | 🔲 Not Started | - | - |
| 4. Reviews & Trust | 🔲 Not Started | - | - |
| 5. Quick Help Services | 🔲 Not Started | - | - |
| 6. Polish & UX | 🔲 Not Started | - | - |
| 7. Advanced Features | 🔲 Not Started | - | - |

---

## How We Work

1. **One phase at a time** - Complete each phase before moving on
2. **Small commits** - Each task = one commit when possible
3. **Test with backend** - Verify API integration at each step
4. **Mobile-first** - Design for phone, enhance for desktop
5. **Translations together** - Add all 3 languages for each new text

---

## Next Action

**Start Phase 1, Task 1.1**: Initialize Vite + React + TypeScript project

Ready to begin? ✅
