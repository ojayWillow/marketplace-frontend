export interface EditTaskFormData {
  title: string;
  description: string;
  category: string;
  budget: string;
  location: string;
  latitude: number;
  longitude: number;
  deadline: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const INITIAL_EDIT_TASK_FORM: EditTaskFormData = {
  title: '',
  description: '',
  category: 'delivery',
  budget: '',
  location: '',
  latitude: 56.9496,
  longitude: 24.1052,
  deadline: '',
  difficulty: 'medium',
};

export const TASK_CATEGORIES = [
  { value: 'pet-care', label: '\uD83D\uDC15 Pet Care', icon: '\uD83D\uDC15' },
  { value: 'moving', label: '\uD83D\uDCE6 Moving', icon: '\uD83D\uDCE6' },
  { value: 'shopping', label: '\uD83D\uDED2 Shopping', icon: '\uD83D\uDED2' },
  { value: 'cleaning', label: '\uD83E\uDDF9 Cleaning', icon: '\uD83E\uDDF9' },
  { value: 'delivery', label: '\uD83D\uDCC4 Delivery', icon: '\uD83D\uDCC4' },
  { value: 'outdoor', label: '\uD83C\uDF3F Outdoor', icon: '\uD83C\uDF3F' },
] as const;

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
] as const;
