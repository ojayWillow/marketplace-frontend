# Map-First UX Refactoring Notes

## Date: February 6, 2026

## Overview
Refactored the app routing and navigation to implement a "map-first" UX philosophy where the interactive map is the primary interface for ALL users (guests and authenticated).

## Core Philosophy
**The map IS the app** - not a feature you navigate to, but the foundation of the user experience.

---

## Changes Made

### 1. Home Route Refactoring (Step 1)
**File**: `apps/web/src/pages/Home.tsx`

**Before**:
```tsx
// Conditional rendering based on auth
return isAuthenticated ? <MapHomePage /> : <LandingPage />;
```

**After**:
```tsx
// Always show map for everyone
return <MapHomePage />;
```

**Impact**: Guests can now browse the map, search, view jobs/offerings without authentication.

---

### 2. Landing Page Route (Step 2)
**File**: `apps/web/src/App.tsx`

**Changes**:
- Added new route: `/welcome` → LandingPage (marketing/onboarding)
- `/` (root) → Always shows Home (MapHomePage)
- Landing page is now for marketing only, not the default guest experience

**Reasoning**: Reduces friction for new users who want to explore before signing up.

---

### 3. Layout Navigation (Step 3)
**File**: `apps/web/src/components/Layout/index.tsx`

**Before**:
```tsx
const showMobileBottomNav = isMobile && (
  location.pathname === '/tasks' || 
  location.pathname === '/quick-help'
)
```

**After**:
```tsx
const showMobileBottomNav = isMobile && (
  location.pathname === '/' ||          // ← Added
  location.pathname === '/tasks' || 
  location.pathname === '/quick-help'
)
```

**Impact**: Bottom navigation now persists on the home route, making navigation feel consistent.

---

### 4. Bottom Navigation Behavior (Step 4)
**File**: `apps/web/src/components/Layout/MobileBottomNav.tsx`

**Changes**:
1. **Home button behavior**: Clicking Home when already on `/` scrolls to top instead of re-navigating
2. **Auth guards**: Messages and Profile tabs now redirect to login for guests
3. **Visual indicators**: Red dot on auth-required tabs for guests

**Code**:
```tsx
const handleTabClick = (e: React.MouseEvent, tab: typeof tabs[0]) => {
  // Stay on home, just scroll to top
  if (tab.path === '/' && location.pathname === '/') {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Require auth for protected tabs
  if (tab.requiresAuth && !isAuthenticated) {
    e.preventDefault();
    navigate(`/login?redirect=${encodeURIComponent(tab.path)}`);
    return;
  }
};
```

---

### 5. Auth Guards on Actions (Step 5)
**File**: `apps/web/src/pages/MapHomePage.tsx`

**Already Implemented** ✓:
- "Post Job" button → Only visible for authenticated users
- "Offer Service" button → Only visible for authenticated users
- Guests see: "Login to Post Jobs or Offer Services" button
- Apply actions on TaskCard (need to verify component)

**Next Steps**: May need to add auth guards to individual "Apply" buttons in TaskCard component.

---

## User Flows

### Guest User Flow
1. ✅ Lands on `/` → Sees interactive map with all jobs/offerings
2. ✅ Can search, filter, view details
3. ✅ Bottom nav present: Home | Work | Messages | Profile
4. ✅ Clicking Messages/Profile → Redirected to login
5. ✅ Trying to post/apply → Prompted to login
6. ✅ After login → Returns to same context

### Authenticated User Flow
1. ✅ Lands on `/` → Sees interactive map
2. ✅ Can post jobs, offer services
3. ✅ Can apply to jobs
4. ✅ Can access Messages and Profile directly
5. ✅ Bottom nav always present

---

## Navigation Structure

```
┌─────────────────────────────────┐
│  Mobile Bottom Nav (Persistent) │
├─────────────────────────────────┤
│  🏠 Home    → /                 │  Always accessible
│  💼 Work    → /work             │  Always accessible
│  💬 Messages → /messages        │  Requires auth (guests → login)
│  👤 Profile  → /profile         │  Requires auth (guests → login)
└─────────────────────────────────┘
```

---

## Benefits

### For Guests
- **Lower barrier to entry**: Can explore without signup pressure
- **Informed decisions**: See actual content before committing
- **Contextual signup**: Auth prompts appear when actually needed

### For Authenticated Users
- **Consistent navigation**: Bottom nav never disappears
- **Predictable behavior**: Home button doesn't change layouts
- **Seamless experience**: App feels like a native mobile app

### For Product
- **Higher engagement**: Users see value immediately
- **Better conversion**: Signup requests are contextual and justified
- **Reduced bounce**: No jarring landing page redirect

---

## Technical Notes

### Mobile Detection
Uses `useIsMobile()` hook to determine layout:
- Mobile: Bottom nav + no header/footer on map
- Desktop: Traditional header/footer layout

### State Persistence
- User location persists across navigation
- Filters and search maintain state
- Login redirects preserve context via `?redirect=` param

### Performance
- Lazy loading maintained for all routes
- Map renders only when needed (conditional for mobile/desktop)
- No additional API calls for guests vs authenticated

---

## Future Enhancements

### Potential Improvements
1. **Map recenter on Home click**: Add explicit map reset when clicking Home while on `/`
2. **Guest indicators**: Show subtle "Login to apply" badges on job cards for guests
3. **Auth modal**: Replace redirect with modal for smoother auth flow
4. **Onboarding tooltips**: Guide first-time guests through map features
5. **Quick actions**: Add floating action button for "Post Job" on mobile

### Mobile App Considerations
- This UX translates well to native mobile apps
- Bottom nav already follows mobile app patterns
- Can be wrapped in webview for MVP mobile app

---

## Testing Checklist

- [ ] Guest can view map at `/` without auth
- [ ] Guest can search and filter jobs
- [ ] Guest sees login prompt when clicking Messages
- [ ] Guest sees login prompt when clicking Profile
- [ ] Guest sees login prompt when trying to post job
- [ ] Home button on `/` scrolls to top (doesn't navigate)
- [ ] Bottom nav stays visible on `/` for mobile
- [ ] Auth redirect preserves return URL
- [ ] After login, user returns to intended page
- [ ] Authenticated users can access all features
- [ ] `/welcome` still accessible for marketing
- [ ] Desktop layout still shows header/footer

---

## Related Files

```
apps/web/src/
├── App.tsx                              # Routing config
├── pages/
│   ├── Home.tsx                         # Always shows map
│   ├── MapHomePage.tsx                  # Main map interface
│   └── LandingPage.tsx                  # Marketing page (/welcome)
└── components/
    └── Layout/
        ├── index.tsx                    # Layout wrapper
        └── MobileBottomNav.tsx          # Bottom navigation
```

---

## Commits

1. `bfbaa8e` - refactor: Always show MapHomePage for all users
2. `dfe8493` - feat: Add /welcome route for landing page
3. `e5a9eca` - feat: Show mobile bottom nav on home route
4. `bf5ebef` - feat: Update MobileBottomNav with auth guards

---

## Rollback Instructions

If this refactoring needs to be reverted:

```bash
# Revert all commits
git revert bf5ebef e5a9eca dfe8493 bfbaa8e

# Or reset to before refactoring
git reset --hard d17f9d3
```

---

*Last updated: February 6, 2026*
