/**
 * useUserPresence Hook
 * 
 * Gets user presence with correct priority to prevent the bug where
 * users flip from "online" to "last seen 2 hours ago".
 * 
 * Priority order:
 * 1. Socket.IO real-time data (from presence store) - SOURCE OF TRUTH
 * 2. API cached data (only if no Socket data exists)
 * 
 * This ensures real-time Socket.IO events always override stale REST API data.
 */

import { useMemo } from 'react';
import { usePresenceStore } from '../stores/presenceStore';

interface UserPresenceResult {
  isOnline: boolean;
  onlineStatus: 'online' | 'offline' | 'recently';
  lastSeenDisplay: string | null;
  source: 'socket' | 'api' | 'unknown';
}

/**
 * Hook to get user presence with Socket.IO priority
 * 
 * @param userId - The user ID to get presence for
 * @param apiData - Optional API data as fallback
 * @returns User presence with correct priority
 */
export function useUserPresence(
  userId: number | undefined,
  apiData?: {
    is_online?: boolean;
    online_status?: 'online' | 'offline' | 'recently';
    last_seen_display?: string | null;
  }
): UserPresenceResult {
  const { getPresence, updateFromAPI } = usePresenceStore();
  
  return useMemo(() => {
    if (!userId) {
      return {
        isOnline: false,
        onlineStatus: 'offline' as const,
        lastSeenDisplay: null,
        source: 'unknown' as const,
      };
    }
    
    // Priority 1: Check Socket.IO presence store (SOURCE OF TRUTH)
    const socketPresence = getPresence(userId);
    
    if (socketPresence) {
      // Socket.IO data exists - use it unconditionally
      console.log(
        `[useUserPresence] User ${userId}: Using Socket.IO data -`,
        socketPresence.is_online ? '🟢 ONLINE' : '🔴 OFFLINE',
        socketPresence.last_seen_display || ''
      );
      
      return {
        isOnline: socketPresence.is_online,
        onlineStatus: socketPresence.online_status,
        lastSeenDisplay: socketPresence.last_seen_display || null,
        source: 'socket' as const,
      };
    }
    
    // Priority 2: Fallback to API data (only if no Socket data)
    if (apiData) {
      // Update store with API data as fallback
      // This will be ignored if Socket data arrives later
      updateFromAPI(userId, apiData);
      
      console.log(
        `[useUserPresence] User ${userId}: Using API fallback -`,
        apiData.online_status || 'offline'
      );
      
      return {
        isOnline: apiData.is_online || false,
        onlineStatus: apiData.online_status || 'offline',
        lastSeenDisplay: apiData.last_seen_display || null,
        source: 'api' as const,
      };
    }
    
    // No data available
    console.log(`[useUserPresence] User ${userId}: No data available`);
    
    return {
      isOnline: false,
      onlineStatus: 'offline' as const,
      lastSeenDisplay: null,
      source: 'unknown' as const,
    };
  }, [userId, apiData?.is_online, apiData?.online_status, apiData?.last_seen_display, getPresence, updateFromAPI]);
}
