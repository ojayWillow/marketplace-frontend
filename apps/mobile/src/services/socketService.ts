/**
 * Socket.IO Client Service
 * 
 * Manages WebSocket connection for real-time features:
 * - User presence (online/offline status)
 * - Real-time messaging
 * - Typing indicators
 * 
 * CRITICAL: This service is the SOURCE OF TRUTH for online/offline status.
 * It overrides any stale data from REST API calls.
 */

import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@marketplace/shared';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Dev-only logger — stripped from production builds
const log = (...args: any[]) => {
  if (__DEV__) console.log(...args);
};
const logError = (...args: any[]) => {
  if (__DEV__) console.error(...args);
};

interface UserPresence {
  user_id: number;
  is_online: boolean;
  online_status: 'online' | 'offline' | 'recently';
  last_seen?: string | null;
  last_seen_display?: string | null;
  timestamp: string;
}

type PresenceListener = (presence: UserPresence) => void;
type MessageListener = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private presenceListeners: Set<PresenceListener> = new Set();
  private messageListeners: Set<MessageListener> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  // In-memory cache of user presence (SOURCE OF TRUTH)
  private presenceCache: Map<number, UserPresence> = new Map();
  
  /**
   * Connect to Socket.IO server with authentication
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      log('Socket already connected');
      return;
    }
    
    log('Connecting to Socket.IO:', SOCKET_URL);
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      // IMPORTANT: Use polling only - backend (gunicorn+gevent) doesn't support WebSocket
      // Polling is reliable and works perfectly for real-time messaging
      transports: ['polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 20000,
    });
    
    this.setupEventListeners();
    this.startHeartbeat();
  }
  
  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.socket) {
      log('Disconnecting from Socket.IO');
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Clear presence cache on disconnect
    this.presenceCache.clear();
  }
  
  /**
   * Setup Socket.IO event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    // Connection events
    this.socket.on('connect', () => {
      log('Socket.IO connected:', this.socket?.id);
    });
    
    this.socket.on('disconnect', (reason) => {
      log('Socket.IO disconnected:', reason);
    });
    
    this.socket.on('connect_error', (error) => {
      logError('Socket.IO connection error:', error.message);
    });
    
    // Presence events (CRITICAL)
    this.socket.on('user_presence', (data: UserPresence) => {
      log(`Presence update for user ${data.user_id}:`, 
        data.is_online ? 'ONLINE' : 'OFFLINE',
        data.last_seen_display || ''
      );
      
      // Update presence cache (SOURCE OF TRUTH)
      this.presenceCache.set(data.user_id, data);
      
      // Notify all listeners
      this.presenceListeners.forEach(listener => listener(data));
    });
    
    // Message events
    this.socket.on('new_message', (data) => {
      log('New message received:', data);
      this.messageListeners.forEach(listener => listener(data));
    });
    
    // Typing indicators
    this.socket.on('user_typing', (data) => {
      log('User typing:', data);
    });
  }
  
  /**
   * Start heartbeat to keep connection alive and last_seen fresh.
   * No token needed — server identifies the client from the authenticated socket session.
   */
  private startHeartbeat(): void {
    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat');
      }
    }, 30000);
  }
  
  /**
   * Subscribe to presence updates
   * Returns unsubscribe function
   */
  onPresenceChange(listener: PresenceListener): () => void {
    this.presenceListeners.add(listener);
    return () => this.presenceListeners.delete(listener);
  }
  
  /**
   * Subscribe to new messages
   * Returns unsubscribe function
   */
  onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }
  
  /**
   * Get cached presence for a user (SOURCE OF TRUTH)
   * Returns null if no real-time data available
   */
  getUserPresence(userId: number): UserPresence | null {
    return this.presenceCache.get(userId) || null;
  }
  
  /**
   * Request presence for specific users
   */
  requestPresence(userIds: number[]): void {
    if (this.socket?.connected) {
      this.socket.emit('get_presence', { user_ids: userIds });
    }
  }
  
  /**
   * Join a conversation room.
   * No token needed — server identifies the client from the authenticated socket session.
   */
  joinConversation(conversationId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', {
        conversation_id: conversationId,
      });
    }
  }
  
  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', {
        conversation_id: conversationId,
      });
    }
  }
  
  /**
   * Send typing indicator.
   * No token needed — server identifies the client from the authenticated socket session.
   */
  sendTyping(conversationId: number, isTyping: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', {
        conversation_id: conversationId,
        is_typing: isTyping,
      });
    }
  }
  
  /**
   * Check if Socket.IO is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
