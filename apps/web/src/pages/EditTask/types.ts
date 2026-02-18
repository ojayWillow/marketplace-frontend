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
