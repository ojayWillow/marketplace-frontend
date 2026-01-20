# Mobile App Development Roadmap

## Overview
Expo-based React Native mobile app for the QuickHelp marketplace platform.

---

## Phase 1: Foundation ✅ COMPLETED
- [x] Project setup with Expo SDK 54
- [x] Expo Router file-based navigation
- [x] Shared packages integration (@marketplace/shared)
- [x] Environment configuration (.env with API URL)
- [x] React Native Paper UI library setup

## Phase 2: Authentication ✅ COMPLETED
- [x] Login screen with email/password
- [x] Token storage with expo-secure-store
- [x] Zustand auth store with persist middleware
- [x] Auth state hydration on app start
- [x] Auto-logout on 401 responses
- [x] Register screen
- [ ] Phone authentication (requires development build, not Expo Go)
- [ ] Forgot password flow

## Phase 3: Core Screens ✅ COMPLETED
- [x] Tab navigation (Home, Messages, Profile)
- [x] Tasks list with category filtering
- [x] Task cards with pricing and location
- [x] Messages/conversations list
- [x] Conversation detail with message thread
- [x] Profile screen with user info
- [x] Guest mode (browse without login)

## Phase 4: Task Features 🔄 IN PROGRESS
- [x] Task detail view
- [x] Create new task form
- [x] FAB button for task creation
- [x] Task applications view (view who applied)
- [x] Accept/reject applications
- [x] Task status management (mark done, cancel)
- [ ] Task search with filters
- [ ] Confirm task completion (creator side)
- [ ] Dispute task

## Phase 5: Messaging Enhancements
- [ ] Real-time message updates (polling or WebSocket)
- [ ] Push notifications for new messages
- [ ] Message read receipts
- [ ] Image attachments in messages
- [ ] Typing indicators

## Phase 6: User Features
- [ ] Edit profile screen
- [ ] Profile picture upload
- [ ] User reviews display
- [ ] Become a helper flow
- [ ] Skills/categories selection

## Phase 7: Location & Maps
- [x] expo-location for device location (basic)
- [x] react-native-maps integration (basic)
- [ ] Nearby tasks map view (enhanced)
- [ ] Location picker for task creation
- [ ] Distance-based filtering

## Phase 8: Notifications
- [ ] expo-notifications setup
- [ ] Push notification registration
- [ ] Backend integration for push tokens
- [ ] Notification preferences
- [ ] In-app notification center

## Phase 9: Offline & Performance
- [ ] Offline data caching
- [ ] Image caching with expo-image
- [x] Pull-to-refresh on lists
- [ ] Infinite scroll pagination
- [ ] Skeleton loading states

## Phase 10: Production Build
- [ ] EAS Build configuration
- [ ] App icons and splash screen
- [ ] iOS App Store submission
- [ ] Google Play Store submission
- [ ] Over-the-air updates setup

---

## Technical Stack
- **Framework**: Expo SDK 54 with Expo Router
- **UI**: React Native Paper (Material Design 3)
- **State**: Zustand with persist middleware
- **API**: Axios with shared client
- **Storage**: expo-secure-store (auth), AsyncStorage (cache)
- **Navigation**: Expo Router (file-based)
- **Maps**: react-native-maps
- **Location**: expo-location

## Known Issues
- Phone authentication requires development build (not available in Expo Go)
- Backend returns `token` field (not `access_token`) - handled in login
- DateTimePicker requires native module (works in Expo Go)

## Recent Changes (Jan 20, 2026)
- Added task applications screen (`/task/[id]/applications`)
- Added accept/reject application functionality
- Added task status actions (mark done, cancel)
- Shows assigned helper on task detail
- Task owner can view and manage applications

## Last Updated
January 20, 2026
