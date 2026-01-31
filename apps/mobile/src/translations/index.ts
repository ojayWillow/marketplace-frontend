import { en } from './en/index';
import { lv } from './lv';
import { ru } from './ru';

export type Language = 'en' | 'lv' | 'ru';

export type Translations = typeof en;

export const translations = {
  en,
  lv,
  ru,
};
