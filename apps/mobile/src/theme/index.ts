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

// Dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...brandColors,
    primary: '#38bdf8', // sky-400 (brighter for dark mode)
    secondary: '#fbbf24', // amber-400
    tertiary: '#34d399', // emerald-400
    background: '#0f172a', // slate-900
    surface: '#1e293b', // slate-800
    surfaceVariant: '#334155', // slate-700
    onSurface: '#f1f5f9', // slate-100
    onSurfaceVariant: '#94a3b8', // slate-400
    outline: '#475569', // slate-600
    elevation: {
      level0: 'transparent',
      level1: '#1e293b',
      level2: '#273548',
      level3: '#334155',
      level4: '#3f4f63',
      level5: '#475569',
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
  },
  dark: {
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    card: '#1e293b',
    border: '#334155',
    tabBar: '#1e293b',
    tabBarInactive: '#64748b',
    statusBar: 'light' as const,
  },
};

export type AppTheme = typeof lightTheme;
export type ThemeColors = typeof colors.light;
