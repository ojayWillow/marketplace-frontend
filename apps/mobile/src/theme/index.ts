import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Brand colors
const brandColors = {
  primary: '#0ea5e9', // sky-500
  secondary: '#f59e0b', // amber-500
  tertiary: '#10b981', // emerald-500
  error: '#ef4444', // red-500
};

// Light theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...brandColors,
    background: '#ffffff',
    surface: '#f8fafc', // slate-50
    surfaceVariant: '#f1f5f9', // slate-100
    onSurface: '#0f172a', // slate-900
    onSurfaceVariant: '#475569', // slate-600
    outline: '#cbd5e1', // slate-300
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#f8fafc',
      level3: '#f1f5f9',
      level4: '#e2e8f0',
      level5: '#cbd5e1',
    },
  },
};

// Dark theme - Midnight Violet Premium
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8b5cf6', // vibrant violet
    secondary: '#6366f1', // indigo
    tertiary: '#10b981', // emerald (pops on purple)
    error: '#ef4444', // red-500
    background: '#0a0814', // deep purple-black
    surface: '#12101f', // dark purple card
    surfaceVariant: '#1a1828', // elevated violet
    onSurface: '#f8f7fc', // white with lavender hint
    onSurfaceVariant: '#c4b5fd', // soft violet-gray
    outline: '#2d2440', // violet border
    elevation: {
      level0: 'transparent',
      level1: '#12101f',
      level2: '#1a1828',
      level3: '#221e30',
      level4: '#2a2538',
      level5: '#322c40',
    },
  },
};

// Common style colors for use outside Paper components
export const colors = {
  light: {
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    background: '#ffffff',
    backgroundSecondary: '#f5f5f5',
    card: '#ffffff',
    border: '#e2e8f0',
    tabBar: '#ffffff',
    tabBarInactive: '#94a3b8',
    statusBar: 'dark' as const,
    // Accents
    primaryAccent: '#0ea5e9',
    secondaryAccent: '#f59e0b',
    success: '#10b981',
  },
  dark: {
    text: '#f8f7fc', // white with lavender
    textSecondary: '#c4b5fd', // soft violet-tinted gray
    textMuted: '#8b7fb8', // muted purple-gray
    background: '#0a0814', // deep purple-black
    backgroundSecondary: '#12101f', // dark purple
    card: '#12101f', // dark purple card
    border: '#2d2440', // violet border
    tabBar: '#12101f',
    tabBarInactive: '#8b7fb8',
    statusBar: 'light' as const,
    // Accents - Violet theme
    primaryAccent: '#8b5cf6', // vibrant violet
    secondaryAccent: '#6366f1', // indigo
    highlight: '#a78bfa', // light purple for selected
    success: '#10b981', // emerald
    warning: '#f59e0b', // amber
    error: '#ef4444', // red
    // Special effects
    glow: 'rgba(139, 92, 246, 0.2)', // purple glow
    elevated: '#1a1828', // elevated card
  },
};

export type AppTheme = typeof lightTheme;
export type ThemeColors = typeof colors.light;
