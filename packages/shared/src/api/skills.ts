import { apiClient } from './client';

export interface Skill {
  id: number;
  key: string;
  name: string;
  category: string;
  description?: string;
  is_active: boolean;
}

export interface UserSkill {
  id: number;
  user_id: number;
  skill_id: number;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience?: number;
  is_verified: boolean;
  added_at: string;
  updated_at: string;
  skill?: Skill;
}

export const skillsApi = {
  // Get all available skills
  getAllSkills: async (params?: { category?: string; search?: string }) => {
    const response = await apiClient.get('/skills', { params });
    return response.data;
  },

  // Get skills organized by category
  getSkillsByCategory: async () => {
    const response = await apiClient.get('/skills/by-category');
    return response.data;
  },

  // Get current user's skills
  getMySkills: async (): Promise<{ skills: UserSkill[]; total: number }> => {
    const response = await apiClient.get('/users/me/skills');
    return response.data;
  },

  // Get another user's skills
  getUserSkills: async (userId: number): Promise<{ skills: UserSkill[]; total: number }> => {
    const response = await apiClient.get(`/users/${userId}/skills`);
    return response.data;
  },

  // Add skill to current user
  addSkill: async (data: {
    skill_id: number;
    proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    years_experience?: number;
  }) => {
    const response = await apiClient.post('/users/me/skills', data);
    return response.data;
  },

  // Update user skill
  updateSkill: async (
    userSkillId: number,
    data: {
      proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      years_experience?: number;
    }
  ) => {
    const response = await apiClient.put(`/users/me/skills/${userSkillId}`, data);
    return response.data;
  },

  // Remove skill from current user
  removeSkill: async (userSkillId: number) => {
    const response = await apiClient.delete(`/users/me/skills/${userSkillId}`);
    return response.data;
  },
};
