// Hardcoded locations for profile edit form
// Focused on Latvia and Baltic region

import { CATEGORIES } from './categories';

// ── Geo constants ─────────────────────────────────────────────────────

/** Default map center: Riga, Latvia */
export const DEFAULT_LOCATION = { lat: 56.9496, lng: 24.1052 } as const;

/** Geographic center of Latvia (for "All Latvia" view) */
export const LATVIA_CENTER = { lat: 56.8796, lng: 24.6032 } as const;

/** Zoom level for full-country view */
export const LATVIA_ZOOM = 7;

/** Earth's radius in kilometers (for Haversine formula) */
export const EARTH_RADIUS_KM = 6371;

// ── Phone constants ───────────────────────────────────────────────────

/** Default country dial code */
export const DEFAULT_DIAL_CODE = '+371';

/** Default country code */
export const DEFAULT_COUNTRY_CODE = 'LV';

// ── Country / city data ───────────────────────────────────────────────

export const COUNTRIES = [
  { value: 'Latvia', label: { en: 'Latvia', lv: 'Latvija', ru: 'Латвия' } },
  { value: 'Lithuania', label: { en: 'Lithuania', lv: 'Lietuva', ru: 'Литва' } },
  { value: 'Estonia', label: { en: 'Estonia', lv: 'Igaunija', ru: 'Эстония' } },
] as const;

// Major cities/towns organized by country
export const CITIES: Record<string, Array<{ value: string; label: { en: string; lv: string; ru: string } }>> = {
  Latvia: [
    { value: 'Rīga', label: { en: 'Riga', lv: 'Rīga', ru: 'Рига' } },
    { value: 'Daugavpils', label: { en: 'Daugavpils', lv: 'Daugavpils', ru: 'Даугавпилс' } },
    { value: 'Liepāja', label: { en: 'Liepaja', lv: 'Liepāja', ru: 'Лиепая' } },
    { value: 'Jelgava', label: { en: 'Jelgava', lv: 'Jelgava', ru: 'Елгава' } },
    { value: 'Jūrmala', label: { en: 'Jurmala', lv: 'Jūrmala', ru: 'Юрмала' } },
    { value: 'Ventspils', label: { en: 'Ventspils', lv: 'Ventspils', ru: 'Вентспилс' } },
    { value: 'Rēzekne', label: { en: 'Rezekne', lv: 'Rēzekne', ru: 'Резекне' } },
    { value: 'Valmiera', label: { en: 'Valmiera', lv: 'Valmiera', ru: 'Валмиера' } },
    { value: 'Jēkabpils', label: { en: 'Jekabpils', lv: 'Jēkabpils', ru: 'Екабпилс' } },
    { value: 'Ogre', label: { en: 'Ogre', lv: 'Ogre', ru: 'Огре' } },
    { value: 'Tukums', label: { en: 'Tukums', lv: 'Tukums', ru: 'Тукумс' } },
    { value: 'Salaspils', label: { en: 'Salaspils', lv: 'Salaspils', ru: 'Саласпилс' } },
    { value: 'Cēsis', label: { en: 'Cesis', lv: 'Cēsis', ru: 'Цесис' } },
    { value: 'Kuldīga', label: { en: 'Kuldiga', lv: 'Kuldīga', ru: 'Кулдига' } },
    { value: 'Sigulda', label: { en: 'Sigulda', lv: 'Sigulda', ru: 'Сигулда' } },
    { value: 'Olaine', label: { en: 'Olaine', lv: 'Olaine', ru: 'Олайне' } },
    { value: 'Talsi', label: { en: 'Talsi', lv: 'Talsi', ru: 'Талси' } },
    { value: 'Saldus', label: { en: 'Saldus', lv: 'Saldus', ru: 'Салдус' } },
    { value: 'Dobele', label: { en: 'Dobele', lv: 'Dobele', ru: 'Добеле' } },
    { value: 'Bauska', label: { en: 'Bauska', lv: 'Bauska', ru: 'Бауска' } },
    { value: 'Ādaži', label: { en: 'Adazi', lv: 'Ādaži', ru: 'Адажи' } },
    { value: 'Mārupe', label: { en: 'Marupe', lv: 'Mārupe', ru: 'Марупе' } },
    { value: 'Ķekava', label: { en: 'Kekava', lv: 'Ķekava', ru: 'Кекава' } },
    { value: 'Piņķi', label: { en: 'Pinki', lv: 'Piņķi', ru: 'Пиньки' } },
  ],
  Lithuania: [
    { value: 'Vilnius', label: { en: 'Vilnius', lv: 'Viļņa', ru: 'Вильнюс' } },
    { value: 'Kaunas', label: { en: 'Kaunas', lv: 'Kauņa', ru: 'Каунас' } },
    { value: 'Klaipėda', label: { en: 'Klaipeda', lv: 'Klaipēda', ru: 'Клайпеда' } },
    { value: 'Šiauliai', label: { en: 'Siauliai', lv: 'Šauļi', ru: 'Шяуляй' } },
    { value: 'Panevėžys', label: { en: 'Panevezys', lv: 'Paņevēža', ru: 'Паневежис' } },
  ],
  Estonia: [
    { value: 'Tallinn', label: { en: 'Tallinn', lv: 'Tallina', ru: 'Таллинн' } },
    { value: 'Tartu', label: { en: 'Tartu', lv: 'Tartu', ru: 'Тарту' } },
    { value: 'Narva', label: { en: 'Narva', lv: 'Narva', ru: 'Нарва' } },
    { value: 'Pärnu', label: { en: 'Parnu', lv: 'Pērnu', ru: 'Пярну' } },
  ],
};

// Derived from CATEGORIES — single source of truth
// Consumers use `.key` so we map `.value` → `.key`
export const AVAILABLE_SKILLS = CATEGORIES.map(c => ({
  key: c.value,
  label: c.label,
  icon: c.icon,
}));

// Helper to get localized label
export const getLocalizedLabel = (labels: { en: string; lv: string; ru: string }, lang: string): string => {
  if (lang === 'lv') return labels.lv;
  if (lang === 'ru') return labels.ru;
  return labels.en;
};
