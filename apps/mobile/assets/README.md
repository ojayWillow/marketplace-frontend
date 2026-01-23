# Mobile App Assets

This folder contains the required assets for the Expo mobile app.

## Required Files

| File | Size | Description |
|------|------|-------------|
| `icon.png` | 1024x1024 | App icon (iOS & Android) |
| `splash.png` | 1284x2778 | Splash screen image |
| `adaptive-icon.png` | 1024x1024 | Android adaptive icon foreground |
| `favicon.png` | 48x48 | Web favicon |
| `notification-icon.png` | 96x96 | Push notification icon (Android) |

## Quick Setup

Run the asset generation script to create placeholder icons:

```bash
cd apps/mobile
node scripts/generate-assets.js
```

This creates simple placeholder images so the app can run. Replace them with your actual branded assets before publishing.

## Design Guidelines

### App Icon (`icon.png`)
- 1024x1024 pixels, PNG format
- No transparency for iOS
- Keep important content within the center 80%

### Splash Screen (`splash.png`)
- 1284x2778 pixels recommended
- Design for the center; edges may be cropped on different devices
- Use `resizeMode: 'contain'` in app.json

### Adaptive Icon (`adaptive-icon.png`)
- 1024x1024 pixels with safe zone
- Android will mask this into various shapes (circle, squircle, etc.)
- Keep logo within center 66% for safety

### Notification Icon (`notification-icon.png`)
- 96x96 pixels, white icon on transparent background
- Android uses this for status bar notifications
