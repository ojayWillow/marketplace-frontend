# Notification Badges

## Overview

Notification badges are visual indicators (small red circles with numbers) that appear on navigation tabs to alert users about pending actions that require their attention.

## Problem Solved

Users were relying solely on the notification bell to see pending actions. If they:
- Dismissed a notification
- Missed the notification
- Deleted the notification accidentally

They would have no visual reminder that action was needed. The badge provides a persistent, always-visible indicator on the relevant tab.

## Implementation

### Where Badges Appear

**Work Tab (💼)**
- Shows total count of pending actions across:
  - Posted jobs needing review (applicants to review, completion to confirm)
  - Applied/assigned work needing action (disputed tasks, etc.)

### What Triggers a Badge

Badges appear when:

#### For Job Creators ("Requests" category)
1. **Pending Applications** - New applicants waiting for review
2. **Pending Confirmation** - Worker marked job complete, needs confirmation
3. **Disputed** - Task is in dispute status

#### For Workers ("My Work" category)
1. **Disputed** - Task is in dispute status
2. *(Can be extended for other statuses)*

### Badge Display Logic

- Shows count from **1 to 9**
- Shows **9+** for counts of 10 or higher
- Badge only appears when count > 0
- Updates automatically when data changes
- Red background (#ef4444) with white text
- Positioned at top-right corner of tab icon

## Technical Architecture

### Components

#### 1. `useActivityCounts` Hook
**Location:** `apps/mobile/src/hooks/useActivityCounts.ts`

**Purpose:** Tracks all pending actions across user activities

**Returns:**
```typescript
interface ActivityCounts {
  total: number;      // Total pending actions
  requests: number;   // Posted jobs needing action
  work: number;       // Applied/assigned work needing action
  isLoading: boolean; // Loading state
}
```

**Features:**
- Fetches data from multiple endpoints (posted tasks, applications, assigned tasks)
- Filters and counts items needing action
- Caches results for 30 seconds to reduce API calls
- Automatically refetches when data is stale

#### 2. Tab Badge Component
**Location:** `apps/mobile/app/(tabs)/_layout.tsx`

**Features:**
- Integrates with `useActivityCounts` hook
- Renders badge on tab icon when count > 0
- Responsive to theme changes
- Proper z-index layering

### Data Flow

```
┌─────────────────────────────────────────┐
│  API Endpoints                          │
│  - getCreatedTasks()                    │
│  - getMyApplications()                  │
│  - getMyTasks()                         │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  useActivityCounts Hook                 │
│  - Fetches all activity data            │
│  - Filters items needing action         │
│  - Counts pending actions               │
│  - Caches for 30s                       │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Tab Layout (_layout.tsx)               │
│  - Uses activity counts                 │
│  - Renders badge on Work tab            │
│  - Updates automatically                │
└─────────────────────────────────────────┘
```

### needsAction Logic

The `needsAction` function determines if a task requires user attention:

```typescript
const needsAction = (task: Task, userId: number, isCreator: boolean): boolean => {
  // Always needs action if disputed
  if (task.status === 'disputed') return true;
  
  if (isCreator) {
    // Creator must confirm completion
    if (task.status === 'pending_confirmation') return true;
    
    // Creator must review new applicants
    if (task.status === 'open' && task.pending_applications_count > 0) return true;
  } else {
    // Worker-specific actions can be added here
    // Example: if (task.status === 'assigned' && !task.started) return true;
  }
  
  return false;
};
```

## Usage Examples

### In Tab Layout

```tsx
import { useActivityCounts } from '../../src/hooks/useActivityCounts';

export default function TabsLayout() {
  const { total: activityCount } = useActivityCounts();
  
  return (
    <Tabs>
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Work',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💼" focused={focused} badge={activityCount} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### In Other Components

```tsx
import { useActivityCounts } from '../hooks';

function MyComponent() {
  const { total, requests, work, isLoading } = useActivityCounts();
  
  if (isLoading) return <ActivityIndicator />;
  
  return (
    <View>
      <Text>You have {total} pending actions</Text>
      <Text>{requests} job requests need review</Text>
      <Text>{work} work items need attention</Text>
    </View>
  );
}
```

## Performance Considerations

### Caching Strategy
- **Stale Time:** 30 seconds - Data is considered fresh for 30s
- **Automatic Refetch:** When user switches tabs or pulls to refresh
- **Background Updates:** React Query handles automatic background updates

### API Call Optimization
- Hook only makes API calls when user is authenticated
- Results are cached and shared across components
- No redundant requests if multiple components use the hook

### Memory Usage
- Minimal overhead - only stores counts, not full data objects
- Automatic garbage collection of stale queries

## Extending the System

### Adding New Badge Categories

1. **Add count to `ActivityCounts` interface:**
```typescript
export interface ActivityCounts {
  total: number;
  requests: number;
  work: number;
  services: number;  // NEW
  isLoading: boolean;
}
```

2. **Fetch relevant data in hook:**
```typescript
const { data: servicesData } = useQuery({
  queryKey: ['myServices'],
  queryFn: getMyServices,
  enabled: !!user,
  staleTime: 30000,
});
```

3. **Add to counts calculation:**
```typescript
const servicesCount = services.filter(needsServiceAction).length;

return {
  total: requestsCount + workCount + servicesCount,
  requests: requestsCount,
  work: workCount,
  services: servicesCount,
  isLoading: /* ... */,
};
```

### Adding Badges to Other Tabs

**Messages Tab Example:**

```tsx
// In useActivityCounts.ts, add:
const { data: conversationsData } = useQuery({
  queryKey: ['conversations'],
  queryFn: getConversations,
  enabled: !!user,
});

const unreadMessages = conversations.filter(c => c.unread_count > 0).length;

// In _layout.tsx:
<Tabs.Screen
  name="messages"
  options={{
    title: 'Messages',
    tabBarIcon: ({ focused }) => (
      <TabIcon emoji="💬" focused={focused} badge={unreadMessages} />
    ),
  }}
/>
```

## Testing

### Manual Testing Checklist

**Badge Appearance:**
- [ ] Badge appears on Work tab when there are pending actions
- [ ] Badge shows correct count (1-9 or 9+)
- [ ] Badge disappears when all actions are resolved
- [ ] Badge color is red (#ef4444) with white text
- [ ] Badge is positioned at top-right of icon

**Badge Updates:**
- [ ] Badge updates when new application is accepted
- [ ] Badge updates when job completion is confirmed
- [ ] Badge updates when dispute is resolved
- [ ] Badge updates after 30s cache expires
- [ ] Badge updates on pull-to-refresh

**Performance:**
- [ ] No noticeable lag when switching tabs
- [ ] API calls are not duplicated unnecessarily
- [ ] Badge works on both iOS and Android

**Edge Cases:**
- [ ] Badge works when count is exactly 9
- [ ] Badge works when count is > 100
- [ ] Badge doesn't appear when not authenticated
- [ ] Badge handles loading state gracefully
- [ ] Badge handles API errors gracefully

## Troubleshooting

### Badge Not Appearing

**Check:**
1. User is authenticated
2. `useActivityCounts` is imported correctly
3. API endpoints are returning data
4. `needsAction` logic matches your requirements
5. Badge styles have proper z-index

### Badge Count Wrong

**Check:**
1. Review `needsAction` logic for your use case
2. Check for duplicate data (e.g., task in both applications and assigned)
3. Verify API response structure matches expected format
4. Clear app cache and reload

### Badge Not Updating

**Check:**
1. Stale time setting (default 30s)
2. Query invalidation after actions (create, update, complete)
3. React Query dev tools for cache status
4. Network tab for API call frequency

## Future Enhancements

### Planned Features
1. **Messages Badge** - Show unread message count
2. **Profile Badge** - Show incomplete profile sections
3. **Animation** - Badge bounce/pulse animation for new items
4. **Priority Colors** - Different colors for urgency levels
5. **Dot vs Number** - Simple dot for low counts, number for high

### Potential Improvements
1. **Real-time Updates** - WebSocket integration for instant updates
2. **Custom Thresholds** - User preference for what triggers badges
3. **Grouping** - Separate badges for different action types
4. **Sound/Haptic** - Feedback when new badge appears

## Related Documentation

- [Jobs and Offerings Screen](./apps/mobile/app/activity/jobs-and-offerings.tsx) - Implements detailed badge UI
- [Activity Counts Hook](./apps/mobile/src/hooks/useActivityCounts.ts) - Core counting logic
- [Tab Layout](./apps/mobile/app/(tabs)/_layout.tsx) - Badge integration

## Support

For issues or questions about notification badges:
1. Review this documentation
2. Check the `useActivityCounts` hook implementation
3. Review the Jobs & Offerings screen for reference
4. Test with React Query Dev Tools to inspect cache
