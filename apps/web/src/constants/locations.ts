// Hardcoded locations for profile edit form
// Focused on Latvia and Baltic region

export const COUNTRIES = [
  { value: 'Latvia', label: { en: 'Latvia', lv: 'Latvija', ru: '\u041b\u0430\u0442\u0432\u0438\u044f' } },
  { value: 'Lithuania', label: { en: 'Lithuania', lv: 'Lietuva', ru: '\u041b\u0438\u0442\u0432\u0430' } },
  { value: 'Estonia', label: { en: 'Estonia', lv: 'Igaunija', ru: '\u042d\u0441\u0442\u043e\u043d\u0438\u044f' } },
] as const;

// Major cities/towns organized by country
export const CITIES: Record<string, Array<{ value: string; label: { en: string; lv: string; ru: string } }>> = {
  Latvia: [
    { value: 'R\u012bga', label: { en: 'Riga', lv: 'R\u012bga', ru: '\u0420\u0438\u0433\u0430' } },
    { value: 'Daugavpils', label: { en: 'Daugavpils', lv: 'Daugavpils', ru: '\u0414\u0430\u0443\u0433\u0430\u0432\u043f\u0438\u043b\u0441' } },
    { value: 'Liep\u0101ja', label: { en: 'Liepaja', lv: 'Liep\u0101ja', ru: '\u041b\u0438\u0435\u043f\u0430\u044f' } },
    { value: 'Jelgava', label: { en: 'Jelgava', lv: 'Jelgava', ru: '\u0415\u043b\u0433\u0430\u0432\u0430' } },
    { value: 'J\u016brmala', label: { en: 'Jurmala', lv: 'J\u016brmala', ru: '\u042e\u0440\u043c\u0430\u043b\u0430' } },
    { value: 'Ventspils', label: { en: 'Ventspils', lv: 'Ventspils', ru: '\u0412\u0435\u043d\u0442\u0441\u043f\u0438\u043b\u0441' } },
    { value: 'R\u0113zekne', label: { en: 'Rezekne', lv: 'R\u0113zekne', ru: '\u0420\u0435\u0437\u0435\u043a\u043d\u0435' } },
    { value: 'Valmiera', label: { en: 'Valmiera', lv: 'Valmiera', ru: '\u0412\u0430\u043b\u043c\u0438\u0435\u0440\u0430' } },
    { value: 'J\u0113kabpils', label: { en: 'Jekabpils', lv: 'J\u0113kabpils', ru: '\u0415\u043a\u0430\u0431\u043f\u0438\u043b\u0441' } },
    { value: 'Ogre', label: { en: 'Ogre', lv: 'Ogre', ru: '\u041e\u0433\u0440\u0435' } },
    { value: 'Tukums', label: { en: 'Tukums', lv: 'Tukums', ru: '\u0422\u0443\u043a\u0443\u043c\u0441' } },
    { value: 'Salaspils', label: { en: 'Salaspils', lv: 'Salaspils', ru: '\u0421\u0430\u043b\u0430\u0441\u043f\u0438\u043b\u0441' } },
    { value: 'C\u0113sis', label: { en: 'Cesis', lv: 'C\u0113sis', ru: '\u0426\u0435\u0441\u0438\u0441' } },
    { value: 'Kuld\u012bga', label: { en: 'Kuldiga', lv: 'Kuld\u012bga', ru: '\u041a\u0443\u043b\u0434\u0438\u0433\u0430' } },
    { value: 'Sigulda', label: { en: 'Sigulda', lv: 'Sigulda', ru: '\u0421\u0438\u0433\u0443\u043b\u0434\u0430' } },
    { value: 'Olaine', label: { en: 'Olaine', lv: 'Olaine', ru: '\u041e\u043b\u0430\u0439\u043d\u0435' } },
    { value: 'Talsi', label: { en: 'Talsi', lv: 'Talsi', ru: '\u0422\u0430\u043b\u0441\u0438' } },
    { value: 'Saldus', label: { en: 'Saldus', lv: 'Saldus', ru: '\u0421\u0430\u043b\u0434\u0443\u0441' } },
    { value: 'Dobele', label: { en: 'Dobele', lv: 'Dobele', ru: '\u0414\u043e\u0431\u0435\u043b\u0435' } },
    { value: 'Bauska', label: { en: 'Bauska', lv: 'Bauska', ru: '\u0411\u0430\u0443\u0441\u043a\u0430' } },
    { value: '\u0100da\u017ei', label: { en: 'Adazi', lv: '\u0100da\u017ei', ru: '\u0410\u0434\u0430\u0436\u0438' } },
    { value: 'M\u0101rupe', label: { en: 'Marupe', lv: 'M\u0101rupe', ru: '\u041c\u0430\u0440\u0443\u043f\u0435' } },
    { value: '\u0136ekava', label: { en: 'Kekava', lv: '\u0136ekava', ru: '\u041a\u0435\u043a\u0430\u0432\u0430' } },
    { value: 'Pi\u0146\u0137i', label: { en: 'Pinki', lv: 'Pi\u0146\u0137i', ru: '\u041f\u0438\u043d\u044c\u043a\u0438' } },
  ],
  Lithuania: [
    { value: 'Vilnius', label: { en: 'Vilnius', lv: 'Vi\u013c\u0146a', ru: '\u0412\u0438\u043b\u044c\u043d\u044e\u0441' } },
    { value: 'Kaunas', label: { en: 'Kaunas', lv: 'Kau\u0146a', ru: '\u041a\u0430\u0443\u043d\u0430\u0441' } },
    { value: 'Klaip\u0117da', label: { en: 'Klaipeda', lv: 'Klaip\u0113da', ru: '\u041a\u043b\u0430\u0439\u043f\u0435\u0434\u0430' } },
    { value: '\u0160iauliai', label: { en: 'Siauliai', lv: '\u0160au\u013ci', ru: '\u0428\u044f\u0443\u043b\u044f\u0439' } },
    { value: 'Panev\u0117\u017eys', label: { en: 'Panevezys', lv: 'Pa\u0146ev\u0113\u017ea', ru: '\u041f\u0430\u043d\u0435\u0432\u0435\u0436\u0438\u0441' } },
  ],
  Estonia: [
    { value: 'Tallinn', label: { en: 'Tallinn', lv: 'Tallina', ru: '\u0422\u0430\u043b\u043b\u0438\u043d\u043d' } },
    { value: 'Tartu', label: { en: 'Tartu', lv: 'Tartu', ru: '\u0422\u0430\u0440\u0442\u0443' } },
    { value: 'Narva', label: { en: 'Narva', lv: 'Narva', ru: '\u041d\u0430\u0440\u0432\u0430' } },
    { value: 'P\u00e4rnu', label: { en: 'Parnu', lv: 'P\u0113rnu', ru: '\u041f\u044f\u0440\u043d\u0443' } },
  ],
};

// Skills = same as marketplace categories
// This keeps skills, search filters, and job/offering categories all in sync
// Each skill maps 1:1 to a category key from packages/shared/src/constants/categories.ts
export const AVAILABLE_SKILLS = [
  { key: 'cleaning', label: 'Cleaning', icon: '\ud83e\uddf9' },
  { key: 'moving', label: 'Moving & Lifting', icon: '\ud83d\udce6' },
  { key: 'assembly', label: 'Assembly', icon: '\ud83d\udd27' },
  { key: 'handyman', label: 'Handyman', icon: '\ud83d\udee0\ufe0f' },
  { key: 'plumbing', label: 'Plumbing', icon: '\ud83d\udebf' },
  { key: 'electrical', label: 'Electrical', icon: '\u26a1' },
  { key: 'painting', label: 'Painting', icon: '\ud83c\udfa8' },
  { key: 'outdoor', label: 'Outdoor', icon: '\ud83c\udf3f' },
  { key: 'delivery', label: 'Delivery & Errands', icon: '\ud83d\ude9a' },
  { key: 'care', label: 'Care', icon: '\ud83e\udd1d' },
  { key: 'tutoring', label: 'Tutoring', icon: '\ud83d\udcda' },
  { key: 'tech', label: 'Tech Help', icon: '\ud83d\udcbb' },
  { key: 'beauty', label: 'Beauty', icon: '\ud83d\udc87' },
  { key: 'events', label: 'Events', icon: '\ud83c\udf89' },
  { key: 'other', label: 'Other', icon: '\ud83d\udccb' },
] as const;

// Helper to get localized label
export const getLocalizedLabel = (labels: { en: string; lv: string; ru: string }, lang: string): string => {
  if (lang === 'lv') return labels.lv;
  if (lang === 'ru') return labels.ru;
  return labels.en;
};
