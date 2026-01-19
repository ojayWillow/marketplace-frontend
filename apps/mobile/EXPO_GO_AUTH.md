# Expo Go Compatible Authentication

## Problem

Firebase Phone Authentication with SMS verification doesn't work in Expo Go due to native module requirements (reCAPTCHA). This blocked development and testing of the mobile app.

## Solution Implemented

Environment-aware authentication that automatically adapts based on the runtime environment:

### Detection Method

```typescript
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';
const isPhoneAuthAvailable = !isExpoGo;
```

### Behavior

| Environment | Email Login | Phone Login | Notes |
|-------------|-------------|-------------|-------|
| **Expo Go** | ✅ Available | ❌ Hidden | Info banner shown |
| **Dev Client** | ✅ Available | ✅ Available | Full functionality |
| **Production Build** | ✅ Available | ✅ Available | Full functionality |

## Changes Made

### 1. Login Screen (`apps/mobile/app/(auth)/login.tsx`)

**Added:**
- Expo Go detection using `Constants.appOwnership`
- Conditional info banner explaining phone auth limitation
- Conditional rendering of "Sign In with Phone" button
- Improved button labels ("Sign In with Email" vs "Sign In")

**UI Flow in Expo Go:**
```
┌─────────────────────────────┐
│  Welcome Back              │
│  Sign in to continue       │
│                            │
│  [📱 Info Banner]        │  ← Only shown in Expo Go
│  Running in Expo Go...     │
│                            │
│  Email: [______________]   │
│  Password: [__________]    │
│                            │
│  [Sign In with Email]      │
│                            │
│  (No phone option shown)   │
└─────────────────────────────┘
```

**UI Flow in Production:**
```
┌─────────────────────────────┐
│  Welcome Back              │
│  Sign in to continue       │
│                            │
│  Email: [______________]   │
│  Password: [__________]    │
│                            │
│  [Sign In with Email]      │
│                            │
│       or                   │  ← Divider
│                            │
│  [Sign In with Phone]      │  ← Shown in production
└─────────────────────────────┘
```

### 2. Register Screen (`apps/mobile/app/(auth)/register.tsx`)

**Added:**
- Same Expo Go detection logic
- Conditional info banner
- Conditional "Register with Phone" button
- Updated button text for clarity

## Testing Instructions

### In Expo Go (Development)

```bash
# From project root
cd apps/mobile

# Start Expo
npx expo start

# Scan QR code with Expo Go app
```

**Expected Result:**
- ✅ Email login form visible
- ✅ Info banner explaining phone auth is unavailable
- ❌ No phone login button
- ✅ Can successfully login with email/password

### In Production Build

```bash
# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

**Expected Result:**
- ✅ Email login form visible
- ❌ No info banner
- ✅ Phone login button visible
- ✅ Both email and phone auth work

## Technical Details

### Why This Works

**`Constants.appOwnership` Values:**
- `'expo'` - Running in Expo Go
- `'standalone'` - Production build (APK/IPA)
- `'guest'` - Development build (dev client)

**Firebase Phone Auth Requirements:**
- Native reCAPTCHA module (not available in Expo Go)
- Works in:
  - Expo Dev Client (custom development build)
  - Production builds (via EAS Build)

### Alternative: Expo Dev Client

For full phone auth testing during development:

```bash
# Create a development build
eas build --profile development --platform ios
# or
eas build --profile development --platform android

# Install the dev build on your device
# Then run:
npx expo start --dev-client
```

Dev Client = Expo Go + Native Modules = Phone Auth Works! ✅

## Future Considerations

### If Phone Auth Becomes Primary

If you later want phone auth as the primary method:

1. Swap button order (phone first, email second)
2. Update info banner message
3. Consider hiding email option in production if desired

### Code Changes Needed:

```typescript
// login.tsx - Make phone auth primary
<Button mode="contained">Sign In with Phone</Button>
<View style={styles.divider}>or</View>
<Button mode="outlined">Sign In with Email</Button>
```

## Related Files

- `apps/mobile/app/(auth)/login.tsx` - Login screen
- `apps/mobile/app/(auth)/register.tsx` - Registration screen  
- `apps/mobile/app/(auth)/phone.tsx` - Phone auth flow (hidden in Expo Go)
- `packages/shared/src/api/auth.ts` - Shared auth API

## Troubleshooting

### "Phone button shows in Expo Go"

**Check:** Is `expo-constants` installed?
```bash
npx expo install expo-constants
```

### "Email login not working"

**Check:** Backend connection
- Verify `.env` has correct `EXPO_PUBLIC_API_URL`
- Check backend is running
- Test with curl/Postman first

### "Info banner not showing"

**Normal if:**
- Running in dev client (not Expo Go)
- Running production build

## Summary

✅ **Email authentication works everywhere**  
✅ **Phone authentication works in production builds**  
✅ **Clear user messaging in Expo Go**  
✅ **No code changes needed when deploying to production**  

---

**Last Updated:** January 19, 2026  
**Implementation:** [Commit c4a0fce](https://github.com/ojayWillow/marketplace-frontend/commit/c4a0fceca53375b6c6aa2ef4f30b56a48384a8c9)
