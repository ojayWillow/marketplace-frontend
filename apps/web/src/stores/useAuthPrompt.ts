import { create } from 'zustand';

interface AuthPromptState {
  isOpen: boolean;
  onSuccess: (() => void) | null;
  show: (onSuccess?: () => void) => void;
  hide: () => void;
}

export const useAuthPrompt = create<AuthPromptState>((set) => ({
  isOpen: false,
  onSuccess: null,
  show: (onSuccess) => set({ isOpen: true, onSuccess: onSuccess ?? null }),
  hide: () => set({ isOpen: false, onSuccess: null }),
}));
