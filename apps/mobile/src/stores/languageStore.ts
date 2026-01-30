import { create } from 'zustand';
import { Language } from '../translations';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

// Simple in-memory language store for now.
// We can later extend this to persist the choice using AsyncStorage/mobileStorage.
export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',
  setLanguage: (language) => set({ language }),
}));
