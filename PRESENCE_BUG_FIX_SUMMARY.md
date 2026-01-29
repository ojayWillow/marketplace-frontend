# Presence Tracking Bug Fix - Implementation Summary

## Problem Statement
Users were experiencing a bug where online status would flip between "online" and "last seen X hours ago" because:
1. React Query was aggressively refetching API data
2. API data was overwriting real-time Socket.IO presence updates
3. No priority system existed to prefer Socket.IO data over API data

## Solution Architecture

### Priority System
```
Socket.IO real-time events (HIGHEST PRIORITY)
    ↓
Presence Store (in-memory cache)
    ↓
API data (LOWEST PRIORITY - fallback only)
```

## Files Created/Modified

### ✅ Created: `apps/mobile/src/hooks/useUserPresence.ts`
- **Purpose**: React hook that returns user presence with correct priority
- **Key Feature**: Always prefers Socket.IO data over API data
- **Usage**: Call this hook in any component that displays user online status

**Example**:
```typescript
import { useUserPresence } from '../../src/hooks/useUserPresence';

const presence = useUserPresence(userId, {
  is_online: apiData?.is_online,
  online_status: apiData?.online_status,
  last_seen_display: apiData?.last_seen_display,
});

// Use: presence.isOnline, presence.lastSeenDisplay, presence.source
```

### ✅ Modified: `apps/mobile/app/_layout.tsx`
1. **Added**: `useSocket()` hook initialization
   - Automatically connects Socket.IO when app starts
   - Syncs real-time presence events to presence store
   - Handles app foreground/background states

2. **Updated**: QueryClient configuration
   ```typescript
   staleTime: 5 * 60 * 1000, // Prevents aggressive refetching
   refetchOnWindowFocus: false, // Don't refetch on focus
   refetchOnReconnect: false, // Don't refetch on reconnect
   ```

### ✅ Already Existed (No changes needed)
- `apps/mobile/src/hooks/useSocket.ts` - Already correctly implemented
- `apps/mobile/src/stores/presenceStore.ts` - Already has priority logic
- `apps/mobile/src/services/socketService.ts` - Already working correctly
- `backend/socketio_server.py` - Backend already sending presence correctly

## Next Steps (TODO)

### 🔴 CRITICAL: Update Chat Screen
**File**: `apps/mobile/app/conversation/[id].tsx`

**Replace** the current presence logic (lines ~130-165) with:

```typescript
import { useUserPresence } from '../../src/hooks/useUserPresence';

// Inside component:
const otherUser = conversation?.other_participant;

// Replace userStatus/lastSeen state with:
const presence = useUserPresence(otherUser?.id, {
  is_online: otherUser?.is_online,
  online_status: otherUser?.online_status,
  last_seen_display: otherUser?.last_seen_display,
});

// Update getStatusText() to:
const getStatusText = () => {
  if (presence.isOnline) return 'Online';
  if (presence.lastSeenDisplay) return `Last seen ${presence.lastSeenDisplay}`;
  return null;
};

// Update online indicator check to:
{presence.isOnline && (
  <View style={styles.onlineIndicator} />
)}

// Update status text color to:
{ color: presence.isOnline ? '#22c55e' : themeColors.textMuted }
```

### Additional Integration Points

Update any other screens that display user online status:
1. Messages list (`apps/mobile/app/(tabs)/messages/index.tsx`)
2. User profile screen (`apps/mobile/app/user/[id].tsx`)
3. Application list screens (if showing applicant status)

## Testing Instructions

### Prerequisites
```bash
# Backend
cd marketplace-backend
python wsgi.py

# Frontend
cd marketplace-frontend/apps/mobile
pnpm dev
```

### Test Scenario 1: Online Status Persistence
1. Device A: User 1 logs in and opens chat with User 2
2. Device B: User 2 logs in (should show "Online" on Device A)
3. Device A: Pull to refresh chat
4. ✅ Expected: User 2 remains "Online" (not flipping to "2 hours ago")
5. ❌ Bug: Status flips to old "last seen" time

### Test Scenario 2: Real-Time Updates
1. Device A: User 1 in chat with User 2
2. Device B: User 2 closes app (goes offline)
3. ✅ Expected: Device A shows "Last seen just now" within 5 seconds
4. Device B: User 2 reopens app
5. ✅ Expected: Device A shows "Online" within 5 seconds

### Debug Logging

Look for these logs in Metro bundler:
```
🚀 [useSocket] Initializing Socket.IO connection
✅ Socket.IO connected: <socket_id>
👤 Presence update for user X: 🟢 ONLINE / 🔴 OFFLINE
[useUserPresence] User X: Using Socket.IO data - 🟢 ONLINE
🔄 [PresenceStore] Socket update for user X: 🟢 ONLINE
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Opens App                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Root Layout (_layout.tsx)                                   │
│  ├─ useSocket() hook initializes                            │
│  └─ Connects Socket.IO                                       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Socket.IO Events (socketService.ts)                         │
│  ├─ 'user_presence' event received                           │
│  └─ Triggers presence listeners                              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Presence Store (presenceStore.ts)                           │
│  ├─ updateFromSocket() - HIGHEST PRIORITY                    │
│  ├─ updateFromAPI() - Only if no Socket data                 │
│  └─ In-memory cache (SOURCE OF TRUTH)                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  UI Components                                               │
│  ├─ useUserPresence(userId, apiData)                         │
│  ├─ Returns: isOnline, lastSeenDisplay, source              │
│  └─ Displays: "Online" or "Last seen 5m ago"                │
└─────────────────────────────────────────────────────────────┘
```

## Key Benefits

1. **Real-time**: Socket.IO events update UI instantly (< 1 second)
2. **Reliable**: Priority system prevents API data from overwriting Socket data
3. **Debug-friendly**: All presence updates logged with source tracking
4. **Fallback**: API data used when Socket.IO not connected (graceful degradation)
5. **Performance**: Less aggressive React Query refetching reduces API calls

## Commits Made

1. ✅ [6411cdc](https://github.com/ojayWillow/marketplace-frontend/commit/6411cdcb74a38a4693e27eae665d5989f40dbe32) - Add useUserPresence hook
2. ✅ [2f7a3b6](https://github.com/ojayWillow/marketplace-frontend/commit/2f7a3b61e1b2e5ed58b4e684e41a411eb76d348e) - Integrate useSocket in root layout
3. 🔴 **TODO**: Update conversation screen to use useUserPresence
4. 🔴 **TODO**: Update other screens displaying user status

## Support

If presence still flips after these changes:
1. Check Metro bundler logs for Socket.IO connection errors
2. Verify backend is sending `user_presence` events (check Python logs)
3. Confirm `__DEV__` logs show "Using Socket.IO data" (not "Using API fallback")
4. Test with `reactotron` or React DevTools to inspect presence store state
