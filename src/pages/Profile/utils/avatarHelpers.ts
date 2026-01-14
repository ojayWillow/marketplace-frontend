// Avatar generation utilities

export interface AvatarStyle {
  id: string;
  name: string;
}

// Pre-made avatar options using DiceBear API
export const AVATAR_STYLES: AvatarStyle[] = [
  { id: 'avataaars', name: 'Cartoon' },
  { id: 'bottts', name: 'Robot' },
  { id: 'fun-emoji', name: 'Emoji' },
  { id: 'lorelei', name: 'Artistic' },
  { id: 'micah', name: 'Simple' },
  { id: 'notionists', name: 'Minimalist' },
  { id: 'personas', name: 'Person' },
  { id: 'adventurer', name: 'Adventure' },
];

// Generate avatar URL from DiceBear
export const generateAvatarUrl = (style: string, seed: string): string => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};

// Generate random seed for avatar
export const generateRandomSeed = (): string => {
  return Math.random().toString(36).substring(2, 10);
};
