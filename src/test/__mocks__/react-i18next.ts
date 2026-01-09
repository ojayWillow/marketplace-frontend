import { vi } from 'vitest';

export const useTranslation = () => ({
  t: (key: string, defaultValue?: string) => defaultValue || key,
  i18n: {
    changeLanguage: vi.fn(),
    language: 'en',
  },
});

export const Trans = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const initReactI18next = {
  type: '3rdParty',
  init: vi.fn(),
};
