export interface TaskFormData {
  title: string;
  description: string;
  category: string;
  budget: string;
  location: string;
  latitude: number;
  longitude: number;
  deadlineDate: string;
  deadlineTime: string;
  difficulty: string;
  is_urgent: boolean;
  images: File[];
}

export const INITIAL_TASK_FORM: TaskFormData = {
  title: '',
  description: '',
  category: 'delivery',
  budget: '',
  location: '',
  latitude: 0,
  longitude: 0,
  deadlineDate: '',
  deadlineTime: '',
  difficulty: 'medium',
  is_urgent: false,
  images: [],
};

const localeMap: Record<string, string> = {
  en: 'en-US',
  lv: 'lv-LV',
  ru: 'ru-RU',
};

export const getTimeOptions = (lang?: string): { value: string; label: string }[] => {
  const locale = lang ? (localeMap[lang] || lang) : undefined;
  const options: { value: string; label: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      const time24 = `${hourStr}:${minuteStr}`;
      const date = new Date(2000, 0, 1, hour, minute);
      const label = date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      });
      options.push({ value: time24, label });
    }
  }
  return options;
};

// Keep backward-compatible export for any external imports
export const TIME_OPTIONS = getTimeOptions();
