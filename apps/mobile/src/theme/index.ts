import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Professional Blue Theme - Clean, Modern, Business-Ready

// Light theme - CLEAN WHITE + PROFESSIONAL BLUE
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0ea5e9', // Sky blue - professional!
    secondary: '#0284c7', // Darker sky blue
    tertiary: '#10b981', // Emerald green
    error: '#ef4444', // Red 500
    background: '#ffffff', // Clean white
    surface: '#ffffff', // White cards
    surfaceVariant: '#f8fafc', // Slate 50
    onSurface: '#0f172a', // Slate 900 - professional black
    onSurfaceVariant: '#475569', // Slate 600
    outline: '#e2e8f0', // Slate 300
    outlineVariant: '#cbd5e1', // Slate 300
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

// Dark theme - DEEP NAVY + BRIGHT BLUE (Like Tirgus!)
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#38bdf8', // Bright sky blue 400
    secondary: '#0ea5e9', // Sky blue 500
    tertiary: '#10b981', // Emerald green
    error: '#ef4444', // Red 500
    background: '#0f172a', // Deep navy (slate 900)
    surface: '#1e293b', // Slate 800
    surfaceVariant: '#334155', // Slate 700
    onSurface: '#f1f5f9', // Slate 100
    onSurfaceVariant: '#94a3b8', // Slate 400
    outline: '#475569', // Slate 600
    elevation: {
      level0: 'transparent',
      level1: '#1e293b',
      level2: '#334155',
      level3: '#475569',
      level4: '#64748b',
      level5: '#94a3b8',
    },
  },
};

// Common style colors for use outside Paper components
export const colors = {
  light: {
    // Text colors - PROFESSIONAL
    text: '#0f172a', // Slate 900 - strong black
    textSecondary: '#475569', // Slate 600
    textMuted: '#94a3b8', // Slate 400
    
    // Backgrounds - CLEAN WHITE
    background: '#ffffff',
    backgroundSecondary: '#f8fafc', // Slate 50
    card: '#ffffff',
    
    // Borders - SUBTLE
    border: '#e2e8f0', // Slate 200
    borderLight: '#f1f5f9', // Slate 100
    
    // UI Elements
    tabBar: '#ffffff',
    tabBarInactive: '#94a3b8',
    statusBar: 'dark' as const,
    header: '#ffffff',
    
    // Accent colors - PROFESSIONAL BLUE
    primaryAccent: '#0ea5e9', // Sky blue 500
    primaryAccentHover: '#0284c7', // Sky blue 600
    primaryAccentLight: '#38bdf8', // Sky blue 400
    secondaryAccent: '#0891b2', // Cyan 600
    
    // Gradient
    gradientStart: '#0ea5e9',
    gradientEnd: '#06b6d4',
    
    // Status colors
    success: '#10b981', // Emerald
    warning: '#f59e0b', // Amber
    error: '#ef4444', // Red
    info: '#0ea5e9', // Sky blue
    
    // Input states
    inputBackground: '#ffffff',
    inputBorder: '#e2e8f0',
    inputFocus: '#0ea5e9',
    inputPlaceholder: '#94a3b8',
  },
  dark: {
    // Text colors
    text: '#f1f5f9', // Slate 100
    textSecondary: '#cbd5e1', // Slate 300
    textMuted: '#94a3b8', // Slate 400
    
    // Backgrounds - DEEP NAVY
    background: '#0f172a', // Slate 900 - deep navy like Tirgus!
    backgroundSecondary: '#1e293b', // Slate 800
    card: '#1e293b', // Slate 800
    
    // Borders
    border: '#334155', // Slate 700
    borderLight: '#475569', // Slate 600
    
    // UI Elements
    tabBar: '#1e293b',
    tabBarInactive: '#64748b',
    statusBar: 'light' as const,
    header: '#0f172a',
    
    // Accent colors - BRIGHT BLUE
    primaryAccent: '#38bdf8', // Bright sky blue 400
    primaryAccentHover: '#0ea5e9', // Sky blue 500
    primaryAccentLight: '#7dd3fc', // Sky blue 300
    secondaryAccent: '#22d3ee', // Cyan 400
    highlight: '#38bdf8',
    
    // Gradient
    gradientStart: '#38bdf8',
    gradientEnd: '#22d3ee',
    
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#38bdf8',
    
    // Special effects
    glow: 'rgba(56, 189, 248, 0.2)', // Blue glow
    elevated: '#334155',
    
    // Input states
    inputBackground: '#1e293b',
    inputBorder: '#334155',
    inputFocus: '#38bdf8',
    inputPlaceholder: '#64748b',
  },
};

export type AppTheme = typeof lightTheme;
export type ThemeColors = typeof colors.light;
