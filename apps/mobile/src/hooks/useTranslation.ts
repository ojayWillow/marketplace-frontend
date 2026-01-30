import { useMemo } from 'react';
import { en } from '../translations/en';
import { lv } from '../translations/lv';
import { ru } from '../translations/ru';
import { Language, Translations } from '../translations';
import { useLanguageStore } from '../stores/languageStore';

const allTranslations: Record<Language, Translations> = {
  en,
  lv,
  ru,
};

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);

  const t = useMemo(() => {
    return allTranslations[language] || en;
  }, [language]);

  return { t, language };
}
