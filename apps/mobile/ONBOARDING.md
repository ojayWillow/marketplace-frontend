# Kolab Onboarding Flow

## Overview

The onboarding flow introduces new users to Kolab's community values, obtains necessary permissions, and provides a quick tutorial. It runs **once** after a user's first successful login.

## Design Philosophy

The onboarding emphasizes:
- **Safety First** - Creating a safe, respectful workspace
- **Transparency** - Clear terms, privacy, and expectations  
- **Empowerment** - Helping users succeed on the platform
- **Community** - Building trust and mutual respect

## Flow Sequence

```
🔑 Login Success
    ↓
🎉 Welcome Animation (2s auto-advance)
    ↓
📜 Terms & Privacy (must accept)
    ↓
🔔 Notifications (optional, recommended)
    ↓
🤝 Community Values (core messaging)
    ↓
📚 Quick Tutorial (swipeable, can skip)
    ↓
✅ Onboarding Complete → Home Screen
```

## Screen Breakdown

### 1. Welcome Animation (`/onboarding/welcome`)

**Purpose:** Create excitement and set positive expectations

**Content:**
- Animated Kolab logo (🤝)
- Brand name: "Kolab"
- Tagline: "Work Together, Safely"
- Fade-in + scale animation (800ms)
- Auto-advances after 2 seconds

**Technical:**
- Uses React Native Animated API
- Parallel fade and scale animations
- `router.replace()` to prevent back navigation

**File:** `apps/mobile/app/onboarding/welcome.tsx`

---

### 2. Terms & Privacy (`/onboarding/terms`)

**Purpose:** Legal compliance and setting expectations

**Content:**
- Scrollable terms of service
- Privacy policy highlights
- User rights information
- Two required checkboxes:
  - ☑️ Terms of Service
  - ☑️ Privacy Policy
- "Continue" button (disabled until both checked)

**Key Terms Covered:**
- Respectful treatment of users
- Job completion expectations
- Payment obligations
- Reporting violations

**Privacy Highlights:**
- Data encryption
- No selling of user data
- Profile visibility control
- Account deletion rights

**Technical:**
- ScrollView for long content
- Checkbox state management
- Button disabled state based on acceptance

**File:** `apps/mobile/app/onboarding/terms.tsx`

---

### 3. Notification Permissions (`/onboarding/notifications`)

**Purpose:** Request push notification permissions (optional)

**Content:**
- Large bell icon 🔔
- Benefits explanation:
  - 📬 New messages
  - ✅ Job applications  
  - 🎉 Job completions
- Two buttons:
  - **Enable Notifications** (primary)
  - **Skip for Now** (secondary)

**Behavior:**
- Requests system notification permission
- If denied, shows "No worries" message
- Always proceeds to next screen
- Users can enable later in Settings

**Technical:**
- Uses `expo-notifications`
- Handles permission states gracefully
- Platform-aware (iOS/Android)

**File:** `apps/mobile/app/onboarding/notifications.tsx`

---

### 4. Community Values (`/onboarding/values`) ❤️

**Purpose:** **CORE SCREEN** - Establish community culture and safety

**Content:**

#### Header
- 🤝 Handshake icon
- "Welcome to Kolab"
- Subtitle about building a safe community

#### Four Core Values

**1. 🛡️ Safety First**
- User verification
- Secure payments
- Reporting tools
- Protection at every step

**2. ❤️ Respect Everyone**
- Dignity for all
- Zero tolerance for harassment
- Anti-discrimination
- Golden rule

**3. 🔒 Trust & Transparency**  
- Honest communication
- Fair pricing
- Reliable work
- Deliver on promises

**4. 🚀 Grow Together**
- Help others succeed
- Honest reviews
- Supportive feedback
- Collective benefit

#### Our Commitment
- 24/7 support
- Immediate action on reports
- Taking concerns seriously
- Active protection

**Design:**
- Scrollable cards for each value
- Warm, empowering tone
- Blue highlight box for commitment
- Emoji-rich for visual engagement

**Technical:**
- ScrollView with value cards
- Fixed bottom button
- Theme-aware colors
- High polish, inspiring design

**File:** `apps/mobile/app/onboarding/values.tsx`

---

### 5. Quick Tutorial (`/onboarding/tutorial`)

**Purpose:** Teach basic platform usage

**Content:**

#### 4 Swipeable Slides

**Slide 1: 📝 Post or Find Jobs**
- Post jobs when you need help
- Browse and apply to opportunities

**Slide 2: 💬 Communicate Safely**
- Secure in-app messaging
- Monitored conversations

**Slide 3: ✅ Complete & Review**
- Job completion process
- Review system for reputation

**Slide 4: ⭐ Build Your Profile**
- Importance of reviews
- Profile completeness
- Trust building

**Navigation:**
- Swipe between slides
- Pagination dots
- "Next" button (changes to "Get Started" on last slide)
- "Skip Tutorial" button (except last slide)

**Completion:**
- Marks `onboarding_completed: true` in user profile
- Navigates to main app with `router.replace()`

**Technical:**
- Uses `react-native-reanimated-carousel`
- Pagination indicator
- Updates user state via `updateUser()`
- Prevents back navigation

**File:** `apps/mobile/app/onboarding/tutorial.tsx`

---

## Implementation Details

### Navigation Structure

**Layout:** `apps/mobile/app/onboarding/_layout.tsx`

```tsx
<Stack>
  <Stack.Screen name="welcome" />
  <Stack.Screen name="terms" />
  <Stack.Screen name="notifications" />
  <Stack.Screen name="values" />
  <Stack.Screen name="tutorial" />
</Stack>
```

**Properties:**
- `headerShown: false` - No nav headers
- `animation: 'slide_from_right'` - Smooth transitions
- Theme-aware background colors

### Triggering Onboarding

**When to Show:**
- After successful login/registration
- Only if `user.onboarding_completed === false`
- Before accessing main app

**Implementation:**

```tsx
// In your login success handler:
if (user && !user.onboarding_completed) {
  router.replace('/onboarding/welcome');
} else {
  router.replace('/(tabs)');
}
```

### State Management

**User State Update:**

```tsx
import { useAuthStore } from '@marketplace/shared';

const { updateUser } = useAuthStore();

// After tutorial completion:
await updateUser({ onboarding_completed: true });
```

**Backend Requirement:**
- Add `onboarding_completed` boolean field to User model
- Default: `false`
- Updated via API on tutorial completion

### Navigation Guards

**Prevent Skipping:**
- Use `router.replace()` instead of `router.push()`
- Removes back button capability
- Users can't skip required steps

**Allow Going Back:**
- Within onboarding, users CAN go back (except from Welcome)
- Useful for re-reading terms or values

## Customization Guide

### Changing Colors

All colors use theme system:

```tsx
const themeColors = colors[activeTheme];
```

**Key Colors:**
- `primaryAccent` - Buttons, highlights
- `background` - Screen backgrounds
- `card` - Card backgrounds
- `text` - Primary text
- `textSecondary` - Descriptions
- `border` - Borders, dividers

### Modifying Text

**Terms & Privacy:**
Edit `apps/mobile/app/onboarding/terms.tsx`
- Update bullet points in ScrollView
- Add/remove sections as needed
- Link to full legal docs if needed

**Community Values:**
Edit `apps/mobile/app/onboarding/values.tsx`
- Modify the 4 value cards
- Update commitment message
- Change icons (🛡️ ❤️ 🔒 🚀)

**Tutorial Slides:**
Edit `apps/mobile/app/onboarding/tutorial.tsx`
- Modify `tips` array
- Add/remove slides
- Change icons and descriptions

### Adjusting Flow

**Skip a Screen:**
Comment out navigation in previous screen:

```tsx
// Skip notifications screen
router.push('/onboarding/values'); // Instead of '/onboarding/notifications'
```

**Add a Screen:**
1. Create new file in `app/onboarding/`
2. Add to `_layout.tsx`
3. Link from previous screen

**Change Order:**
Update navigation calls in each screen

## Testing Checklist

### Visual Testing
- [ ] All screens render correctly on iOS
- [ ] All screens render correctly on Android  
- [ ] Animations are smooth (Welcome screen)
- [ ] Text is readable in light theme
- [ ] Text is readable in dark theme
- [ ] Buttons are properly sized and clickable
- [ ] ScrollViews scroll smoothly

### Flow Testing
- [ ] Welcome screen auto-advances after 2s
- [ ] Terms screen requires both checkboxes
- [ ] Notification permission request works
- [ ] Can skip notification request
- [ ] Values screen scrolls properly
- [ ] Tutorial carousel swipes smoothly
- [ ] Tutorial pagination dots update
- [ ] Can skip tutorial
- [ ] "Get Started" completes onboarding

### State Testing
- [ ] `onboarding_completed` flag is set after tutorial
- [ ] User can't access onboarding again after completion
- [ ] Back button is disabled where appropriate
- [ ] App navigates to home after completion

### Permission Testing  
- [ ] Notification permission dialog appears (iOS)
- [ ] Notification permission dialog appears (Android)
- [ ] App continues if permission denied
- [ ] No crashes if permission API fails

## Analytics Events

**Recommended Tracking:**

```tsx
// Screen views
trackEvent('onboarding_welcome_viewed');
trackEvent('onboarding_terms_viewed');
trackEvent('onboarding_notifications_viewed');
trackEvent('onboarding_values_viewed');
trackEvent('onboarding_tutorial_viewed');

// User actions
trackEvent('onboarding_terms_accepted');
trackEvent('onboarding_notifications_enabled');
trackEvent('onboarding_notifications_skipped');
trackEvent('onboarding_tutorial_completed');
trackEvent('onboarding_tutorial_skipped');
trackEvent('onboarding_completed');
```

## Accessibility

### Screen Reader Support

**Labels:**
- All buttons have descriptive labels
- Images have alt text
- Icons are supplemented with text

**Navigation:**
- Logical tab order
- Focus management between screens

**Text:**
- High contrast colors
- Readable font sizes (14px minimum)
- Clear hierarchy

### Keyboard Navigation

- Checkboxes accessible via keyboard
- Buttons can be triggered via Enter/Space
- Carousel navigation with arrow keys (if supported)

## Performance Considerations

**Optimization:**
- Animations use `useNativeDriver: true`
- Images are optimized
- Minimal re-renders with proper state management
- Lazy loading not needed (flow is short)

**Bundle Size:**
- Carousel library adds ~50KB
- Total onboarding flow ~30KB

## Troubleshooting

### Onboarding Shows on Every Login

**Problem:** `onboarding_completed` flag not persisting

**Solutions:**
1. Check API endpoint updates user correctly
2. Verify `updateUser()` function works
3. Check user state is refreshed after update
4. Ensure backend saves the flag

### Carousel Not Swiping

**Problem:** `react-native-reanimated-carousel` not working

**Solutions:**
1. Ensure `react-native-reanimated` is installed
2. Add Reanimated plugin to `babel.config.js`
3. Rebuild app after adding plugin
4. Check carousel width/height props

### Notification Permission Not Requesting

**Problem:** Permission dialog doesn't appear

**Solutions:**
1. Check `expo-notifications` is installed
2. Add notification permissions to `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSUserNotificationPermission": "We'll notify you about important updates"
      }
    },
    "android": {
      "permissions": ["RECEIVE_BOOT_COMPLETED"]
    }
  }
}
```
3. Test on physical device (simulator may not show dialog)

### Animations Laggy

**Problem:** Welcome screen animation stutters

**Solutions:**
1. Ensure `useNativeDriver: true` is set
2. Reduce animation duration
3. Test on physical device (simulators can be slow)
4. Check for unnecessary re-renders

## Future Enhancements

### Planned Features

1. **A/B Testing**
   - Test different value messaging
   - Measure completion rates
   - Optimize conversion

2. **Personalization**
   - Ask user role (worker/employer/both)
   - Customize tutorial based on role
   - Show relevant features first

3. **Video Tutorial**
   - Replace slides with short video
   - More engaging for visual learners
   - Showcase real app usage

4. **Progress Bar**
   - Show "3 of 5" progress
   - Reduce drop-off
   - Set expectations

5. **Localization**
   - Translate all content
   - Support multiple languages
   - Cultural customization

6. **Gamification**
   - Award badge for completing onboarding
   - Confetti animation on completion
   - Small reward (credits/boost)

## Related Documentation

- [Theme System](./src/theme/README.md) - Color and styling
- [Navigation](./app/README.md) - Router setup
- [Authentication](../packages/shared/auth/README.md) - Login flow
- [User State](../packages/shared/stores/authStore.ts) - State management

## Support

For questions or issues:
1. Check this documentation
2. Review individual screen files
3. Test on both iOS and Android
4. Check expo-notifications setup
5. Verify backend API endpoints
