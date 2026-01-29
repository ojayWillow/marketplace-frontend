/**
 * Presence Store
 * 
 * Manages user online/offline status with these priorities:
 * 1. Socket.IO real-time events (highest priority)
 * 2. In-memory cache from socketService
 * 3. API data (fallback only, ignored if Socket.IO has data)
 * 
 * CRITICAL: This prevents the bug where users flip from "online" to "2 hours ago"
 * by ensuring Socket.IO presence data always overrides stale REST API data.
 */

import { create } from 'zustand';

interface UserPresence {
  user_id: number;
  is_online: boolean;
  online_status: 'online' | 'offline' | 'recently';
  last_seen?: string | null;
  last_seen_display?: string | null;
  timestamp: string;
  source: 'socket' | 'api';  // Track data source
}

interface PresenceState {
  // Map of user_id -> presence data
  presence: Map<number, UserPresence>;
  
  // Update presence from Socket.IO (HIGHEST PRIORITY)
  updateFromSocket: (data: Omit<UserPresence, 'source'>) => void;
  
  // Update presence from API (LOWEST PRIORITY - only if no Socket data)
  updateFromAPI: (userId: number, data: {
    is_online?: boolean;
    online_status?: 'online' | 'offline' | 'recently';
    last_seen?: string | null;
    last_seen_display?: string | null;
  }) => void;
  
  // Get presence for a user
  getPresence: (userId: number) => UserPresence | null;
  
  // Check if user is online
  isUserOnline: (userId: number) => boolean;
  
  // Clear all presence data
  clearPresence: () => void;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  presence: new Map(),
  
  updateFromSocket: (data) => {
    set((state) => {
      const newPresence = new Map(state.presence);
      
      // Socket.IO data is SOURCE OF TRUTH
      newPresence.set(data.user_id, {
        ...data,
        source: 'socket',
        timestamp: data.timestamp || new Date().toISOString(),
      });
      
      console.log(
        `🔄 [PresenceStore] Socket update for user ${data.user_id}:`,
        data.is_online ? '🟢 ONLINE' : '🔴 OFFLINE',
        data.last_seen_display || ''
      );
      
      return { presence: newPresence };
    });
  },
  
  updateFromAPI: (userId, data) => {
    set((state) => {
      const newPresence = new Map(state.presence);
      const existing = newPresence.get(userId);
      
      // CRITICAL: Don't overwrite Socket.IO data with API data
      if (existing && existing.source === 'socket') {
        console.log(
          `⏭️  [PresenceStore] Ignoring API data for user ${userId} - Socket.IO has priority`
        );
        return state; // Don't update
      }
      
      // Only use API data if no Socket.IO data exists
      newPresence.set(userId, {
        user_id: userId,
        is_online: data.is_online || false,
        online_status: data.online_status || 'offline',
        last_seen: data.last_seen || null,
        last_seen_display: data.last_seen_display || null,
        timestamp: new Date().toISOString(),
        source: 'api',
      });
      
      console.log(
        `📡 [PresenceStore] API fallback for user ${userId}:`,
        data.online_status || 'offline'
      );
      
      return { presence: newPresence };
    });
  },
  
  getPresence: (userId) => {
    return get().presence.get(userId) || null;
  },
  
  isUserOnline: (userId) => {
    const presence = get().presence.get(userId);
    return presence?.is_online || false;
  },
  
  clearPresence: () => {
    set({ presence: new Map() });
  },
}));
