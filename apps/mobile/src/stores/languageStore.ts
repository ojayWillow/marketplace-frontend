import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language, Translations } from '../translations';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Helper function to get nested translation value
const getNestedValue = (obj: any, path: string): string => {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // Return the key itself if not found
    }
  }
  
  return typeof value === 'string' ? value : path;
};

export const useLanguageStore = create<LanguageStore>()(persist(
  (set, get) => ({
    language: 'en',
    
    setLanguage: (lang: Language) => {
      set({ language: lang });
    },
    
    t: (key: string): string => {
      const { language } = get();
      const translation = translations[language];
      return getNestedValue(translation, key);
    },
  }),
  {
    name: 'language-storage',
    storage: createJSONStorage(() => AsyncStorage),
  }
));
