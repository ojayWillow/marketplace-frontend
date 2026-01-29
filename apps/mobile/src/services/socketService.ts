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
      console.log('✅ Socket already connected');
      return;
    }
    
    console.log('🔌 Connecting to Socket.IO:', SOCKET_URL);
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      query: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
    
    this.setupEventListeners();
    this.startHeartbeat(token);
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
      console.log('🔌 Disconnecting from Socket.IO');
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
      console.log('✅ Socket.IO connected:', this.socket?.id);
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error.message);
    });
    
    // Presence events (CRITICAL)
    this.socket.on('user_presence', (data: UserPresence) => {
      console.log(`👤 Presence update for user ${data.user_id}:`, 
        data.is_online ? '🟢 ONLINE' : '🔴 OFFLINE',
        data.last_seen_display || ''
      );
      
      // Update presence cache (SOURCE OF TRUTH)
      this.presenceCache.set(data.user_id, data);
      
      // Notify all listeners
      this.presenceListeners.forEach(listener => listener(data));
    });
    
    // Message events
    this.socket.on('new_message', (data) => {
      console.log('💬 New message received:', data);
      this.messageListeners.forEach(listener => listener(data));
    });
    
    // Typing indicators
    this.socket.on('user_typing', (data) => {
      console.log('✍️ User typing:', data);
    });
  }
  
  /**
   * Start heartbeat to keep connection alive and last_seen fresh
   */
  private startHeartbeat(token: string): void {
    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat', { token });
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
   * Join a conversation room
   */
  joinConversation(conversationId: number, token: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', {
        conversation_id: conversationId,
        token,
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
   * Send typing indicator
   */
  sendTyping(conversationId: number, isTyping: boolean, token: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', {
        conversation_id: conversationId,
        is_typing: isTyping,
        token,
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
