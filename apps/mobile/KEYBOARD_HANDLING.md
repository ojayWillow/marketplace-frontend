# Keyboard Handling in Mobile App

## Overview

This document explains how keyboard overlap issues are handled in the mobile app to ensure input fields remain visible when the keyboard appears.

## The Problem

On mobile devices, when the keyboard appears, it can cover input fields, making it impossible for users to see what they're typing. This is especially problematic for:

- Login/Registration forms
- Review/Comment text areas
- Message composition
- Any screen with input fields at the bottom

## The Solution

We've implemented a reusable `KeyboardAwareContainer` component that automatically handles keyboard appearance on both iOS and Android.

### Component Location

```
apps/mobile/components/KeyboardAwareContainer.tsx
```

## Usage

### Basic Usage

Wrap your screen content with `KeyboardAwareContainer`:

```tsx
import { KeyboardAwareContainer } from '../../components/KeyboardAwareContainer';

export default function MyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareContainer>
        <TextInput ... />
        <TextInput ... />
        <Button ... />
      </KeyboardAwareContainer>
    </SafeAreaView>
  );
}
```

### With Custom Offset

For screens with headers or navigation bars:

```tsx
<KeyboardAwareContainer keyboardVerticalOffset={100}>
  {/* Your content */}
</KeyboardAwareContainer>
```

### Without Scroll (Fixed Layout)

If your screen shouldn't scroll:

```tsx
<KeyboardAwareContainer enableScroll={false}>
  {/* Your content */}
</KeyboardAwareContainer>
```

### With Custom ScrollView Props

```tsx
<KeyboardAwareContainer 
  scrollViewProps={{
    bounces: false,
    showsVerticalScrollIndicator: true
  }}
>
  {/* Your content */}
</KeyboardAwareContainer>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | The content to render |
| `style` | `ViewStyle` | `undefined` | Additional container styles |
| `contentContainerStyle` | `ViewStyle` | `undefined` | ScrollView content styles |
| `keyboardVerticalOffset` | `number` | `0` (Android), `64` (iOS) | Keyboard offset adjustment |
| `enableScroll` | `boolean` | `true` | Whether to enable scrolling |
| `scrollViewProps` | `ScrollViewProps` | `{}` | Additional ScrollView props |

## Platform Differences

### iOS
- Uses `behavior="padding"` for `KeyboardAvoidingView`
- Default offset: `64` (accounts for header)
- Shifts entire view upward when keyboard appears

### Android
- Uses `behavior="height"` for `KeyboardAvoidingView`
- Default offset: `0` (Android handles this natively better)
- Adjusts view height when keyboard appears

## Screens Already Implemented

✅ **Login Screen** (`apps/mobile/app/(auth)/login.tsx`)
- Already has KeyboardAvoidingView
- May need minor tweaks if issues persist

✅ **Review Screen** (`apps/mobile/app/task/[id]/review.tsx`)
- Updated with KeyboardAwareContainer
- Fixes text input visibility issue

✅ **Conversation Screen** (`apps/mobile/app/conversation/[id].tsx`)
- Already has KeyboardAvoidingView
- Message input properly handled

## Screens That May Need Updates

If you encounter keyboard overlap issues on these screens, apply the `KeyboardAwareContainer`:

### Authentication Screens
- ✅ `app/(auth)/login.tsx` - Already implemented
- `app/(auth)/register.tsx` - Check if needed
- `app/(auth)/forgot-password.tsx` - Check if needed
- `app/(auth)/phone.tsx` - Check if needed

### Task Screens
- `app/task/create.tsx` - Likely needs it (long description field)
- `app/task/[id]/edit.tsx` - Likely needs it
- ✅ `app/task/[id]/review.tsx` - Already implemented
- `app/task/[id]/applications.tsx` - Check proposal fields

### Profile/Settings
- `app/profile/edit.tsx` - If exists
- `app/settings/*` - Any forms with text inputs

### Offering Screens
- `app/offering/*` - Check any creation/edit forms

### Dispute Screens
- `app/dispute/*` - Check message/evidence inputs

## Implementation Checklist

When adding keyboard handling to a new screen:

1. **Import the component**
   ```tsx
   import { KeyboardAwareContainer } from '../../components/KeyboardAwareContainer';
   ```

2. **Replace ScrollView or View wrapper**
   ```tsx
   // Before
   <ScrollView>
     {content}
   </ScrollView>

   // After
   <KeyboardAwareContainer>
     {content}
   </KeyboardAwareContainer>
   ```

3. **Test on both platforms**
   - iOS simulator/device
   - Android simulator/device

4. **Adjust offset if needed**
   - If keyboard still covers input, increase `keyboardVerticalOffset`
   - If content jumps too high, decrease offset

5. **Test with different keyboard types**
   - Default keyboard
   - Email keyboard
   - Numeric keyboard

## Troubleshooting

### Keyboard Still Covers Input

**Solution 1:** Increase vertical offset
```tsx
<KeyboardAwareContainer keyboardVerticalOffset={80}>
```

**Solution 2:** Check if you're inside another KeyboardAvoidingView
- Remove nested KeyboardAvoidingViews
- Use only one at the top level

### Content Jumps Too Much

**Solution:** Reduce vertical offset
```tsx
<KeyboardAwareContainer keyboardVerticalOffset={0}>
```

### Scroll Not Working

**Solution:** Make sure `enableScroll` is true (default)
```tsx
<KeyboardAwareContainer enableScroll={true}>
```

### Android Keyboard Behavior Issues

Add to `AndroidManifest.xml` if not already present:
```xml
<activity
  android:windowSoftInputMode="adjustResize"
>
```

### iOS Safe Area Issues

Make sure you're using `SafeAreaView` correctly:
```tsx
<SafeAreaView style={styles.container} edges={['bottom']}>
  <KeyboardAwareContainer>
    {content}
  </KeyboardAwareContainer>
</SafeAreaView>
```

## Best Practices

1. **Always test with real devices** - Simulators may not perfectly replicate keyboard behavior

2. **Use appropriate keyboard types**
   ```tsx
   <TextInput keyboardType="email-address" /> // For emails
   <TextInput keyboardType="numeric" /> // For numbers
   ```

3. **Add keyboardShouldPersistTaps="handled"** - Already handled by KeyboardAwareContainer

4. **Consider input height** - Multi-line inputs need more scroll space

5. **Test landscape mode** - Keyboard takes more space in landscape

## Additional Resources

- [React Native KeyboardAvoidingView Docs](https://reactnative.dev/docs/keyboardavoidingview)
- [Expo Keyboard Docs](https://docs.expo.dev/versions/latest/react-native/keyboard/)
- [React Native Keyboard Aware ScrollView](https://github.com/APSL/react-native-keyboard-aware-scroll-view) - Alternative library if needed

## Future Improvements

Consider these enhancements if needed:

1. **Automatic scrolling to focused input**
2. **Keyboard dismiss on tap outside**
3. **Custom animations for keyboard appearance**
4. **Support for bottom sheets with inputs**

## Support

If you encounter issues not covered here:
1. Check existing screens with working keyboard handling
2. Review the KeyboardAwareContainer component source
3. Test with different `keyboardVerticalOffset` values
4. Consider using the alternative `react-native-keyboard-aware-scroll-view` library for complex cases
