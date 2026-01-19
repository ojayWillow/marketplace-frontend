// Shared types between web and mobile
// These will be migrated from apps/web/src/types/

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  budget?: number;
  location?: Location;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Offering {
  id: string;
  title: string;
  description: string;
  price?: number;
  priceType?: 'fixed' | 'hourly' | 'negotiable';
  images: string[];
  category: string;
  location?: Location;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}
