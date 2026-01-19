# Marketplace Mobile App

This repository now contains both the web application and the mobile application in a monorepo structure.

## Structure

```
marketplace-frontend/
├── apps/
│   ├── web/              # Vite React web app (to be moved here)
│   └── mobile/           # Expo React Native app
├── packages/
│   └── shared/           # Shared code (API, types, stores)
├── pnpm-workspace.yaml   # PNPM workspace config
└── turbo.json            # Turborepo config
```

## Prerequisites

- Node.js 18+
- pnpm 8+ (`npm install -g pnpm`)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your physical device (optional)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Run the mobile app

```bash
cd apps/mobile
pnpm dev
```

Or from the root:

```bash
pnpm --filter @marketplace/mobile dev
```

### 3. Run on specific platform

```bash
# iOS Simulator
pnpm --filter @marketplace/mobile ios

# Android Emulator
pnpm --filter @marketplace/mobile android
```

## Development

### Mobile App Tech Stack

- **Expo SDK 52** - React Native framework
- **Expo Router** - File-based navigation
- **NativeWind** - Tailwind CSS for React Native
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Firebase** - Authentication

### Shared Package

The `@marketplace/shared` package contains code shared between web and mobile:

- `api/` - API client and endpoint functions
- `types/` - TypeScript type definitions
- `stores/` - Zustand stores

### Adding Icons

Before running the app, add the required assets to `apps/mobile/assets/`:

- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen (1284x2778)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `favicon.png` - Web favicon (48x48)

## Useful Commands

```bash
# Run all apps in dev mode
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check

# Run only mobile app
pnpm --filter @marketplace/mobile dev

# Run only web app
pnpm --filter @marketplace/web dev
```

## Roadmap

See [Issue #19](https://github.com/ojayWillow/marketplace-frontend/issues/19) for the full mobile app development roadmap.
