import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMyOfferings, Offering } from '../api/offerings';

interface MatchNotification {
  id: string;
  type: 'new_job_match' | 'new_helper_match';
  title: string;
  message: string;
  jobId?: number;
  offeringId?: number;
  category: string;
  createdAt: Date;
  read: boolean;
}

interface MatchingState {
  // User's offering categories (for matching jobs)
  myOfferingCategories: string[];
  myOfferings: Offering[];

  // Notifications
  notifications: MatchNotification[];
  unreadCount: number;

  // Last check timestamp
  lastChecked: string | null;

  // Actions
  loadMyOfferings: () => Promise<void>;
  addNotification: (notification: Omit<MatchNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  reset: () => void;
  isJobMatchingMyOfferings: (jobCategory: string) => boolean;
  getMatchingOfferingsForJob: (jobCategory: string) => Offering[];
}

export const useMatchingStore = create<MatchingState>()(
  persist(
    (set, get) => ({
      myOfferingCategories: [],
      myOfferings: [],
      notifications: [],
      unreadCount: 0,
      lastChecked: null,

      loadMyOfferings: async () => {
        try {
          const response = await getMyOfferings();
          const offerings = response.offerings || [];
          const categories = [...new Set(offerings.map(o => o.category))];

          set({
            myOfferings: offerings,
            myOfferingCategories: categories,
            lastChecked: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error loading my offerings:', error);
        }
      },

      addNotification: (notification) => {
        const newNotification: MatchNotification = {
          ...notification,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          read: false
        };

        set(state => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
          unreadCount: state.unreadCount + 1
        }));
      },

      markAsRead: (id) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification && !notification.read) {
            return {
              notifications: state.notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1)
            };
          }
          return state;
        });
      },

      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        }));
      },

      clearNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0
        });
      },

      reset: () => {
        set({
          myOfferingCategories: [],
          myOfferings: [],
          notifications: [],
          unreadCount: 0,
          lastChecked: null,
        });
      },

      isJobMatchingMyOfferings: (jobCategory) => {
        const { myOfferingCategories } = get();
        return myOfferingCategories.includes(jobCategory);
      },

      getMatchingOfferingsForJob: (jobCategory) => {
        const { myOfferings } = get();
        return myOfferings.filter(o => o.category === jobCategory && o.status === 'active');
      }
    }),
    {
      name: 'matching-store',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        lastChecked: state.lastChecked,
        myOfferingCategories: state.myOfferingCategories
      })
    }
  )
);
