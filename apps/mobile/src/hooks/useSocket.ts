/**
 * useSocket Hook
 * 
 * Manages Socket.IO connection lifecycle:
 * - Connects when user logs in
 * - Disconnects when user logs out or app backgrounds
 * - Subscribes to presence updates
 * - Handles reconnection logic
 */

import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@marketplace/shared';
import { socketService } from '../services/socketService';
import { usePresenceStore } from '../stores/presenceStore';

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore();
  const { updateFromSocket } = usePresenceStore();
  
  useEffect(() => {
    if (!isAuthenticated || !token) {
      // User logged out - disconnect
      socketService.disconnect();
      return;
    }
    
    // User logged in - connect
    console.log('🚀 [useSocket] Initializing Socket.IO connection');
    socketService.connect(token);
    
    // Subscribe to all user status changes
    const unsubscribePresence = socketService.onAnyUserStatus((data) => {
      // Update Zustand store with real-time presence
      updateFromSocket({
        user_id: data.user_id,
        is_online: data.status === 'online',
        online_status: data.status,
        last_seen: data.last_seen,
        timestamp: new Date().toISOString(),
      });
    });
    
    // Handle app state changes (background/foreground)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - reconnect if needed
        if (!socketService.isConnected() && token) {
          console.log('🔄 [useSocket] Reconnecting (app foregrounded)');
          socketService.connect(token);
        }
      } else if (nextAppState === 'background') {
        // App went to background - keep connection alive
        // We don't disconnect to maintain real-time updates
        console.log('🔋 [useSocket] App backgrounded, keeping connection');
      }
    });
    
    // Cleanup
    return () => {
      console.log('🧹 [useSocket] Cleaning up');
      unsubscribePresence();
      subscription.remove();
      // Don't disconnect here - let logout handle it
    };
  }, [isAuthenticated, token, updateFromSocket]);
  
  return {
    isConnected: socketService.isConnected(),
    requestPresence: (userIds: number[]) => {
      // Request status for each user
      userIds.forEach(id => socketService.requestUserStatus(id));
    },
    joinConversation: (conversationId: number) => 
      token && socketService.joinConversation(conversationId),
    leaveConversation: (conversationId: number) => 
      socketService.leaveConversation(conversationId),
    sendTyping: (conversationId: number, isTyping: boolean) => 
      socketService.sendTyping(conversationId, isTyping),
  };
}
