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
};

export const DIFFICULTIES = [
  { value: 'easy', label: '🟢 Easy', color: 'green', description: 'Simple task, minimal effort' },
  { value: 'medium', label: '🟡 Medium', color: 'amber', description: 'Moderate effort required' },
  { value: 'hard', label: '🔴 Hard', color: 'red', description: 'Challenging, requires skill or strength' },
] as const;

export const TIME_OPTIONS = (() => {
  const options: { value: string; label: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      const time24 = `${hourStr}:${minuteStr}`;
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      options.push({ value: time24, label: `${hour12}:${minuteStr} ${ampm}` });
    }
  }
  return options;
})();
