export type MainTab = 'all' | 'jobs' | 'services';

export interface WorkItem {
  id: string;
  type: 'job' | 'service';
  title: string;
  description?: string;
  category: string;
  budget?: number;
  price?: number;
  creator_name?: string;
  created_at: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  difficulty?: string;
  creator_rating?: number;
  creator_review_count?: number;
  is_urgent?: boolean;
}

export interface WorkItemWithDistance extends WorkItem {
  distance?: number;
}

export const MAX_CATEGORIES = 5;
export const LOCATION_TIMEOUT_MS = 3000;
