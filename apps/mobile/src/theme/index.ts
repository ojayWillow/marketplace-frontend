import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Light theme - Royal Purple Premium
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#7c3aed', // Royal Purple - BOLD primary
    secondary: '#a855f7', // Bright purple secondary
    tertiary: '#10b981', // emerald (works with purple)
    error: '#dc2626', // red-600 (stronger)
    background: '#faf5ff', // lightest purple tint
    surface: '#ffffff', // pure white cards
    surfaceVariant: '#f3e8ff', // light purple surface
    onSurface: '#1e1b4b', // deep indigo-black
    onSurfaceVariant: '#5b21b6', // purple-tinted text
    outline: '#e9d5ff', // light purple border
    outlineVariant: '#ddd6fe', // softer purple border
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#fefbff',
      level3: '#faf5ff',
      level4: '#f5f3ff',
      level5: '#f3e8ff',
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
    // Text colors
    text: '#1e1b4b', // deep indigo-black (softer than pure black)
    textSecondary: '#6b21a8', // purple-tinted secondary
    textMuted: '#9333ea', // muted purple
    
    // Backgrounds
    background: '#faf5ff', // lightest purple tint
    backgroundSecondary: '#f5f3ff', // light purple
    card: '#ffffff', // pure white cards
    
    // Borders
    border: '#e9d5ff', // light purple border
    borderLight: '#f3e8ff', // very light purple
    
    // UI Elements
    tabBar: '#ffffff',
    tabBarInactive: '#9333ea',
    statusBar: 'dark' as const,
    
    // Accent colors - Royal Purple system
    primaryAccent: '#7c3aed', // Royal Purple (main buttons)
    primaryAccentHover: '#6d28d9', // Deeper on press
    primaryAccentLight: '#a855f7', // Bright purple
    secondaryAccent: '#c084fc', // Light vibrant purple
    
    // Gradient (for premium buttons)
    gradientStart: '#7c3aed',
    gradientEnd: '#a855f7',
    
    // Status colors
    success: '#10b981', // emerald
    warning: '#f59e0b', // amber
    error: '#dc2626', // red-600
    info: '#6366f1', // indigo
    
    // Input states
    inputBackground: '#ffffff',
    inputBorder: '#e9d5ff',
    inputFocus: '#a855f7', // bright purple on focus
    inputPlaceholder: '#9333ea',
  },
  dark: {
    // Text colors
    text: '#f8f7fc', // white with lavender
    textSecondary: '#c4b5fd', // soft violet-tinted gray
    textMuted: '#8b7fb8', // muted purple-gray
    
    // Backgrounds
    background: '#0a0814', // deep purple-black
    backgroundSecondary: '#12101f', // dark purple
    card: '#12101f', // dark purple card
    
    // Borders
    border: '#2d2440', // violet border
    borderLight: '#1a1828',
    
    // UI Elements
    tabBar: '#12101f',
    tabBarInactive: '#8b7fb8',
    statusBar: 'light' as const,
    
    // Accent colors - Violet theme
    primaryAccent: '#8b5cf6', // vibrant violet
    primaryAccentHover: '#7c3aed', // slightly deeper
    primaryAccentLight: '#a78bfa', // light purple
    secondaryAccent: '#6366f1', // indigo
    highlight: '#a78bfa', // light purple for selected
    
    // Gradient
    gradientStart: '#8b5cf6',
    gradientEnd: '#a78bfa',
    
    // Status colors
    success: '#10b981', // emerald
    warning: '#f59e0b', // amber
    error: '#ef4444', // red
    info: '#6366f1', // indigo
    
    // Special effects
    glow: 'rgba(139, 92, 246, 0.2)', // purple glow
    elevated: '#1a1828', // elevated card
    
    // Input states
    inputBackground: '#12101f',
    inputBorder: '#2d2440',
    inputFocus: '#8b5cf6',
    inputPlaceholder: '#8b7fb8',
  },
};

export type AppTheme = typeof lightTheme;
export type ThemeColors = typeof colors.light;
