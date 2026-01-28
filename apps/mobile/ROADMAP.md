# Marketplace Mobile App - Development Roadmap

**Last Updated**: January 28, 2026, 10:17 AM EET  
**Started**: January 19, 2026  
**Overall Status**: ~90% Complete 🎉

---

## Project Overview

**Goal**: Build a native mobile app for the Latvian Marketplace platform using React Native + Expo

**Two Main Segments**:
1. **Quick Help Jobs** - Task marketplace with map ✅
2. **Service Offerings** - Advertise your skills ✅

**Future Segment**:
3. **Buy/Sell Listings** - Like ss.lv (placeholder only)

**Languages**: Latvian 🇱🇻 | Russian 🇷🇺 | English 🇬🇧

---

## Tech Stack

| Category | Technology | Status |
|----------|------------|--------|
| Framework | React Native + Expo SDK 54 | ✅ |
| Routing | Expo Router v6 | ✅ |
| Language | TypeScript | ✅ |
| Styling | React Native Paper + Custom | ✅ |
| State | Zustand + React Query | ✅ |
| API | Axios (shared package) | ✅ |
| i18n | react-i18next | ✅ |
| Storage | expo-secure-store | ✅ |
| Maps | react-native-maps | ✅ |
| Location | expo-location | ✅ |
| Payments | Stripe | ✅ |
| Real-time | socket.io-client | ✅ Installed |
| Push | expo-notifications | 📦 Code ready, needs dev build |

---

## App Structure

### Bottom Tab Navigation (4 tabs)

| Tab | Icon | Screen | Status |
|-----|------|--------|--------|
| Home | 🏠 | Map + Jobs list | ✅ Full |
| Work | 💼 | Jobs & Offerings list | ✅ Full |
| Messages | 💬 | Conversations | ✅ Full |
| Profile | 👤 | User profile | ✅ Full |

### Hidden Tabs (accessible via navigation)

| Screen | Status |
|--------|--------|
| Listings (Buy/Sell) | ⬜ Placeholder |
| Offerings browse | ✅ Full |

---

## ✅ Phase 1: Foundation (COMPLETE)

- [x] Expo project with TypeScript
- [x] Expo Router file-based routing
- [x] Shared package integration (`@marketplace/shared`)
- [x] Metro bundler monorepo config
- [x] Environment variables
- [x] Theme system (light/dark)
- [x] Base layout with tab navigation

**Status**: ✅ 100%

---

## ✅ Phase 2: Authentication (COMPLETE)

- [x] Login screen (`/(auth)/login`)
- [x] Register screen (`/(auth)/register`)
- [x] Auth store with Zustand
- [x] Secure token storage (expo-secure-store)
- [x] Protected routes
- [x] Auto-redirect based on auth state
- [x] Logout functionality

**Status**: ✅ 100%

---

## ✅ Phase 3: Home Screen with Map (COMPLETE)

**File**: `app/(tabs)/index.tsx` (17KB)

### Features:
- [x] Full MapView with react-native-maps
- [x] Task markers with price labels (€25, €50, etc.)
- [x] Marker colors by category
- [x] User location detection
- [x] "My Location" button
- [x] Search bar with debounce
- [x] Category filter modal
- [x] Radius & difficulty filters modal
- [x] Bottom sheet with job list
- [x] Swipe up/down sheet behavior
- [x] Focused task card when marker tapped
- [x] Boosted offerings on map
- [x] Create modal (Post Job / Offer Service)
- [x] Dark/light map styles

**Status**: ✅ 100%

---

## ✅ Phase 4: Tasks/Work Tab (COMPLETE)

**File**: `app/(tabs)/tasks.tsx` (7.5KB)

### Features:
- [x] Tab bar: All | Jobs | Services
- [x] Task cards with category, price, distance
- [x] Offering cards with provider info
- [x] Category filter
- [x] Difficulty filter
- [x] Pull to refresh
- [x] Gradient FAB for create
- [x] Empty states

**Status**: ✅ 100%

---

## ✅ Phase 5: Task Detail & Workflow (COMPLETE)

### Screens:

| Screen | File | Size | Status |
|--------|------|------|--------|
| Task Detail | `task/[id].tsx` | 4.2KB | ✅ |
| Create Task | `task/create.tsx` | 20KB | ✅ |
| Edit Task | `task/[id]/edit.tsx` | 14KB | ✅ |
| Applications | `task/[id]/applications.tsx` | 18KB | ✅ |
| Payment | `task/[id]/payment.tsx` | 9.6KB | ✅ |
| Review | `task/[id]/review.tsx` | 12KB | ✅ |
| Dispute | `task/[id]/dispute.tsx` | 13KB | ✅ |

### Task Workflow:
- [x] View task details
- [x] Apply for task
- [x] View applications (task creator)
- [x] Accept/reject applicants
- [x] Mark task as done (worker)
- [x] Confirm completion (creator)
- [x] File dispute
- [x] Leave review after completion
- [x] Stripe payment for tasks

**Status**: ✅ 100%

---

## ✅ Phase 6: Service Offerings (COMPLETE)

### Screens:

| Screen | File | Size | Status |
|--------|------|------|--------|
| Browse Offerings | `(tabs)/offerings.tsx` | 14KB | ✅ |
| Offering Detail | `offering/[id].tsx` | 20KB | ✅ |
| Create Offering | `offering/create.tsx` | 14KB | ✅ |

### Features:
- [x] Browse offerings with cards
- [x] Provider info with avatar & rating
- [x] Price display (hourly/fixed/negotiable)
- [x] Category filtering
- [x] Contact provider (starts conversation)
- [x] Share offering
- [x] Pause/Activate offering
- [x] Boost offering
- [x] Delete offering
- [x] Image gallery
- [x] Service area with radius

**Status**: ✅ 100%

---

## ✅ Phase 7: Messaging (COMPLETE)

### Screens:

| Screen | File | Size | Status |
|--------|------|------|--------|
| Conversations | `(tabs)/messages.tsx` | 11KB | ✅ |
| Chat | `conversation/[id].tsx` | 25KB | ✅ |

### Features:
- [x] Conversation list with previews
- [x] Send text messages
- [x] Message timestamps
- [x] Auto-scroll to latest
- [x] Link to user profile
- [x] Start conversation from task/offering

### Not Yet:
- [ ] Send images in chat
- [ ] Real-time updates (Socket.IO configured but not active)
- [ ] Typing indicators

**Status**: ✅ 90%

---

## ✅ Phase 8: User Profile (COMPLETE)

### Screens:

| Screen | File | Size | Status |
|--------|------|------|--------|
| Own Profile | `(tabs)/profile.tsx` | 18KB | ✅ |
| Public Profile | `user/[id].tsx` | 11KB | ✅ |
| Edit Profile | `profile/edit.tsx` | Full | ✅ |
| Settings | `settings/index.tsx` | Full | ✅ |

### Features:
- [x] Profile header with gradient
- [x] Avatar display
- [x] User stats (rating, reviews, completed)
- [x] Skills display with category icons
- [x] Edit name, bio, phone, city
- [x] Avatar upload (camera + gallery)
- [x] Skills selection
- [x] Helper mode toggle
- [x] Hourly rate setting
- [x] Notification badge
- [x] Logout

**Status**: ✅ 100%

---

## ✅ Phase 9: Reviews (COMPLETE)

### Features:
- [x] Leave review after task completion (`task/[id]/review.tsx`)
- [x] Star rating input
- [x] Review text
- [x] View reviews on user profiles
- [x] Review stats (average rating, count)

**Status**: ✅ 100%

---

## ✅ Phase 10: Notifications (COMPLETE)

**File**: `notifications/index.tsx`

### Features:
- [x] Notification list
- [x] Notification type icons
- [x] Mark as read
- [x] Mark all as read
- [x] Delete notification
- [x] Deep linking to relevant screens
- [x] Pull to refresh
- [x] Empty state

### Notification Types:
- [x] NEW_APPLICATION
- [x] APPLICATION_ACCEPTED
- [x] APPLICATION_REJECTED
- [x] TASK_MARKED_DONE
- [x] TASK_COMPLETED

**Status**: ✅ 100%

---

## ✅ Phase 11: Disputes (COMPLETE)

**File**: `task/[id]/dispute.tsx` (13KB)

### Features:
- [x] Dispute form
- [x] Dispute reasons
- [x] Submit dispute
- [x] View dispute status

**Status**: ✅ 100%

---

## ✅ Phase 12: Payments (COMPLETE)

**File**: `task/[id]/payment.tsx` (9.6KB)

### Features:
- [x] Payment toggle on task creation
- [x] Payment screen
- [x] Stripe integration
- [x] Payment status display

**Status**: ✅ 100%

---

## ⬜ Phase 13: Buy/Sell Listings (NOT STARTED)

**File**: `(tabs)/listings.tsx` (3.3KB) - **PLACEHOLDER ONLY**

Current state: Shows "Coming Soon" message with feature preview.

### Needs Implementation:
- [ ] Listing cards with images
- [ ] Browse listings
- [ ] Category filtering
- [ ] Search
- [ ] Listing detail screen
- [ ] Create listing
- [ ] Edit listing
- [ ] Delete listing
- [ ] Contact seller
- [ ] Mark as sold

**Status**: ⬜ 5%

---

## 🟡 Phase 14: Push Notifications (CODE READY - BLOCKED)

> ⚠️ **Cannot test in Expo Go** - Push notifications require a development build.

### Current State:
- [x] `expo-notifications` package installed
- [x] `utils/pushNotifications.ts` fully implemented
- [x] Permission request flow ready
- [x] Device token registration ready
- [x] Backend API endpoints ready (`/push/subscribe`, `/push/unsubscribe`)
- [x] Notification listeners ready
- [x] In-app notifications working ✅

### What's Blocking:
Push notifications **do not work in Expo Go**. They require:

1. **Development Build** via EAS Build (`expo-dev-client`)
2. **Apple Developer Account** ($99/year) for iOS testing
3. **Physical device** (not simulator)

### To Enable Push Notifications:
```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Configure EAS
eas build:configure

# 3. Create development build
eas build --profile development --platform ios
eas build --profile development --platform android

# 4. Install the .ipa/.apk on physical device
# 5. Call registerPushToken() after user login
```

### Code Location:
- `utils/pushNotifications.ts` - All push notification logic
- Ready to integrate once dev build is available

**Status**: 🟡 Code 100% ready, blocked by Expo Go limitations

---

## ⬜ Phase 15: Polish & App Store (FUTURE)

- [ ] Final app icon
- [ ] Splash screen
- [ ] Loading states audit
- [ ] Error boundaries
- [ ] Offline handling
- [ ] Performance optimization
- [ ] App Store screenshots
- [ ] Privacy policy screen
- [ ] Terms of service screen
- [ ] EAS Build configuration
- [ ] TestFlight (iOS)
- [ ] Play Store (Android)

**Status**: ⬜ 0%

---

## Progress Summary

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation | ✅ 100% |
| 2 | Authentication | ✅ 100% |
| 3 | Home Map | ✅ 100% |
| 4 | Tasks/Work Tab | ✅ 100% |
| 5 | Task Detail & Workflow | ✅ 100% |
| 6 | Service Offerings | ✅ 100% |
| 7 | Messaging | ✅ 90% |
| 8 | User Profile | ✅ 100% |
| 9 | Reviews | ✅ 100% |
| 10 | Notifications (In-App) | ✅ 100% |
| 11 | Disputes | ✅ 100% |
| 12 | Payments | ✅ 100% |
| 13 | Buy/Sell Listings | ⬜ 5% |
| 14 | Push Notifications | 🟡 Code ready, blocked |
| 15 | Polish & App Store | ⬜ 0% |

---

## What's Working Right Now

### ✅ Complete Features:
- Full map view with task markers
- Browse and search jobs
- Create, edit, delete tasks
- Apply for tasks
- Accept/reject applicants
- Complete task workflow
- Stripe payments
- Leave reviews
- File disputes
- Browse and create offerings
- Messaging between users
- User profiles with reviews
- In-app notifications
- Profile editing with avatar upload
- Skills management
- Dark/light theme

### ⬜ Not Yet Built:
- Buy/Sell Listings (classifieds)
- Real-time chat updates
- Image sending in messages

### 🟡 Ready But Blocked:
- Push notifications (needs dev build, not possible in Expo Go)

---

## File Size Reference

| Screen | File | Size | Complexity |
|--------|------|------|------------|
| Home (Map) | `(tabs)/index.tsx` | 17KB | High |
| Tasks List | `(tabs)/tasks.tsx` | 7.5KB | Medium |
| Messages | `(tabs)/messages.tsx` | 11KB | Medium |
| Profile | `(tabs)/profile.tsx` | 18KB | High |
| Offerings Browse | `(tabs)/offerings.tsx` | 14KB | Medium |
| Listings | `(tabs)/listings.tsx` | 3.3KB | Placeholder |
| Task Detail | `task/[id].tsx` | 4.2KB | Low |
| Task Create | `task/create.tsx` | 20KB | High |
| Task Edit | `task/[id]/edit.tsx` | 14KB | Medium |
| Applications | `task/[id]/applications.tsx` | 18KB | High |
| Payment | `task/[id]/payment.tsx` | 9.6KB | Medium |
| Review | `task/[id]/review.tsx` | 12KB | Medium |
| Dispute | `task/[id]/dispute.tsx` | 13KB | Medium |
| Offering Detail | `offering/[id].tsx` | 20KB | High |
| Offering Create | `offering/create.tsx` | 14KB | Medium |
| Chat | `conversation/[id].tsx` | 25KB | High |
| User Profile | `user/[id].tsx` | 11KB | Medium |

---

## Next Steps

### Priority 1 - When Ready for App Store:
1. 🔔 **Push Notifications** - Create EAS dev build, integrate `pushNotifications.ts`
2. 🎨 **App Icon & Splash** - Final branding

### Priority 2 - Nice to Have:
3. 🛍️ **Buy/Sell Listings** - Third segment
4. 📷 **Image Messages** - Send photos in chat
5. ⚡ **Real-time Chat** - Socket.IO integration

### Priority 3 - Future:
6. 📱 **App Store Submission**

---

## How to Run

```bash
cd apps/mobile
npm install
npm start

# Or specific platform
npm run ios
npm run android
```

---

**Last Updated**: January 28, 2026, 10:17 AM EET  
**Verified by**: Full code audit of every screen
