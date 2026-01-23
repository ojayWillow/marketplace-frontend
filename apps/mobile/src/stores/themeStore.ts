import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  _hasHydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  setHasHydrated: (state: boolean) => void;
  getActiveTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      _hasHydrated: false,
      
      setMode: (mode: ThemeMode) => set({ mode }),
      
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
      
      getActiveTheme: () => {
        const { mode } = get();
        if (mode === 'system') {
          const systemTheme = Appearance.getColorScheme();
          return systemTheme === 'dark' ? 'dark' : 'light';
        }
        return mode;
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
