# Kolab Onboarding - Quick Start Guide

## What Was Built

A complete 5-screen onboarding flow that runs after first login:

1. 🎉 **Welcome Animation** - Animated Kolab logo
2. 📜 **Terms & Privacy** - Legal acceptance (required)
3. 🔔 **Notifications** - Permission request (optional)
4. 🤝 **Community Values** - Safety & respect messaging
5. 📚 **Tutorial** - Swipeable tips

## Files Created

```
apps/mobile/app/onboarding/
  ├── _layout.tsx          # Navigation setup
  ├── welcome.tsx          # Screen 1: Animated welcome
  ├── terms.tsx            # Screen 2: Terms acceptance
  ├── notifications.tsx    # Screen 3: Push permissions
  ├── values.tsx           # Screen 4: Community values ⭐
  └── tutorial.tsx         # Screen 5: Quick tips

apps/mobile/
  ├── ONBOARDING.md        # Full documentation
  └── ONBOARDING_QUICKSTART.md  # This file
```

## Integration Steps

### 1. Install Dependencies

```bash
cd apps/mobile
npm install expo-notifications react-native-reanimated-carousel
```

### 2. Update Backend User Model

Add `onboarding_completed` field:

```typescript
// In your User model/schema
interface User {
  // ... existing fields
  onboarding_completed: boolean; // Add this
}

// In migration or model default
onboarding_completed: false
```

### 3. Update API Endpoint

Ensure your user update endpoint handles the new field:

```typescript
// PATCH /api/users/:id
{
  onboarding_completed: true
}
```

### 4. Add Reanimated Plugin

Update `babel.config.js`:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Add this line
    ],
  };
};
```

### 5. Configure Notification Permissions

Update `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSUserNotificationUsageDescription": "Get notified about messages, jobs, and updates"
      }
    },
    "android": {
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ]
    },
    "notification": {
      "icon": "./assets/notification-icon.png"
    }
  }
}
```

### 6. Update Login Flow

Modify your login success handler:

**Before:**
```typescript
// After successful login
router.replace('/(tabs)');
```

**After:**
```typescript
// After successful login
if (user && !user.onboarding_completed) {
  router.replace('/onboarding/welcome');
} else {
  router.replace('/(tabs)');
}
```

**Example in login screen:**

```typescript
import { useAuthStore } from '@marketplace/shared';
import { router } from 'expo-router';

export default function LoginScreen() {
  const { login, user } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      
      // Check if onboarding is needed
      if (!user?.onboarding_completed) {
        router.replace('/onboarding/welcome');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      // Handle error
    }
  };

  // ... rest of component
}
```

### 7. Rebuild App

```bash
# Clear cache and rebuild
rm -rf node_modules/.cache
npm run ios  # or npm run android
```

## Testing the Flow

### 1. Create Test User

Create a fresh user account with `onboarding_completed: false`

### 2. Login and Verify

1. Login with test account
2. Should see welcome animation
3. Auto-advances to terms screen
4. Accept both checkboxes
5. Click Continue
6. Enable or skip notifications
7. Read community values
8. Swipe through tutorial
9. Click "Get Started"
10. Should land on home screen

### 3. Verify Completion

- Login again with same account
- Should skip onboarding and go straight to home
- Check database: `onboarding_completed` should be `true`

## Customization

### Change Brand Colors

All screens use the theme system automatically. Update `src/theme/colors.ts`:

```typescript
export const colors = {
  light: {
    primaryAccent: '#0ea5e9', // Change this
    // ...
  },
  dark: {
    primaryAccent: '#38bdf8', // And this
    // ...
  },
};
```

### Modify Community Values

Edit `apps/mobile/app/onboarding/values.tsx`:

1. Change the 4 value cards
2. Update icons and descriptions
3. Modify the commitment message

### Add/Remove Tutorial Slides

Edit `apps/mobile/app/onboarding/tutorial.tsx`:

```typescript
const tips: TipSlide[] = [
  {
    icon: '📝',
    title: 'Your Title',
    description: 'Your description',
  },
  // Add more slides here
];
```

### Skip Screens

To remove a screen from the flow:

1. Open the previous screen
2. Change navigation target:

```typescript
// Skip notifications screen
router.push('/onboarding/values'); // Instead of '/onboarding/notifications'
```

## Troubleshooting

### Onboarding Repeats Every Login

**Cause:** `onboarding_completed` flag not saving

**Fix:**
1. Check backend endpoint accepts the field
2. Verify `updateUser()` function calls API correctly
3. Check user state refreshes after tutorial

### Carousel Not Working

**Cause:** Reanimated plugin not configured

**Fix:**
1. Add plugin to `babel.config.js` (see step 4)
2. Clear cache: `rm -rf node_modules/.cache`
3. Rebuild app completely

### Notification Permission Doesn't Ask

**Cause:** Permissions not configured

**Fix:**
1. Add permissions to `app.json` (see step 5)
2. Test on physical device (not simulator)
3. Check device settings allow notifications

### Animation Laggy

**Cause:** Running on simulator or `useNativeDriver: false`

**Fix:**
1. Test on physical device
2. Ensure all animations use `useNativeDriver: true`
3. Check for unnecessary re-renders

## Next Steps

### Recommended Enhancements

1. **Analytics**
   - Track screen views
   - Measure completion rate
   - A/B test messaging

2. **Backend API**
   - Create dedicated onboarding completion endpoint
   - Log completion timestamp
   - Track which screens were viewed

3. **User Preferences**
   - Save notification preference choice
   - Remember if tutorial was skipped
   - Offer to re-watch tutorial later

4. **Localization**
   - Translate all text
   - Support multiple languages
   - Adjust for cultural differences

### Future Features

- Video tutorial instead of slides
- Progress bar showing "3 of 5"
- Role selection (worker/employer)
- Personalized tips based on role
- Gamification (badge for completing)

## Support

For detailed information, see:
- [Full Documentation](./ONBOARDING.md)
- [Theme System](./src/theme/README.md)
- Individual screen files in `app/onboarding/`

## Summary

You now have a complete, polished onboarding flow that:
- ✅ Sets community expectations
- ✅ Gets necessary permissions
- ✅ Teaches platform basics
- ✅ Creates a warm, safe feeling
- ✅ Only runs once per user

The flow emphasizes **Kolab's core values: Safety, Respect, Trust, and Growth**.

Ready to test! 🚀
