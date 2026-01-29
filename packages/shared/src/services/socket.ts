/**
 * Socket.IO client for real-time messaging
 */
import { io, Socket } from 'socket.io-client';
import type { Message } from '../api/messages';

type MessageHandler = (message: Message) => void;
type TypingHandler = (data: { user_id: number; is_typing: boolean; conversation_id: number }) => void;
type UserStatusHandler = (data: { user_id: number; status: 'online' | 'offline'; last_seen: string | null }) => void;

class SocketService {
  private socket: Socket | null = null;
  private baseUrl: string = '';
  private token: string = '';
  private messageHandlers: Map<number, MessageHandler[]> = new Map();
  private typingHandlers: Map<number, TypingHandler[]> = new Map();
  private userStatusHandlers: Map<number, UserStatusHandler[]> = new Map();
  private globalStatusHandlers: UserStatusHandler[] = [];
  private currentConversationId: number | null = null;

  /**
   * Initialize the socket service with base URL
   */
  init(baseUrl: string) {
    this.baseUrl = baseUrl.replace('/api', ''); // Remove /api if present
  }

  /**
   * Connect to WebSocket server
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.token = token;
      
      this.socket = io(this.baseUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
      });

      this.socket.on('new_message', (data: { message: Message; conversation_id: number }) => {
        const handlers = this.messageHandlers.get(data.conversation_id) || [];
        handlers.forEach(handler => handler(data.message));
      });

      this.socket.on('user_typing', (data: { user_id: number; is_typing: boolean; conversation_id: number }) => {
        const handlers = this.typingHandlers.get(data.conversation_id) || [];
        handlers.forEach(handler => handler(data));
      });

      // Handle user status changes (online/offline broadcasts)
      this.socket.on('user_status_changed', (data: { user_id: number; status: 'online' | 'offline'; last_seen: string }) => {
        console.log('[Socket] User status changed:', data);
        // Notify user-specific handlers
        const handlers = this.userStatusHandlers.get(data.user_id) || [];
        handlers.forEach(handler => handler(data));
        // Notify global handlers
        this.globalStatusHandlers.forEach(handler => handler(data));
      });

      // Handle user status response (from get_user_status request)
      this.socket.on('user_status', (data: { user_id: number; status: 'online' | 'offline'; last_seen: string | null }) => {
        console.log('[Socket] User status received:', data);
        const handlers = this.userStatusHandlers.get(data.user_id) || [];
        handlers.forEach(handler => handler(data));
      });

      this.socket.on('error', (data: { message: string }) => {
        console.error('[Socket] Error:', data.message);
      });
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageHandlers.clear();
    this.typingHandlers.clear();
    this.userStatusHandlers.clear();
    this.globalStatusHandlers = [];
    this.currentConversationId = null;
  }

  /**
   * Join a conversation room to receive messages
   */
  joinConversation(conversationId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      // Leave previous conversation if any
      if (this.currentConversationId && this.currentConversationId !== conversationId) {
        this.leaveConversation(this.currentConversationId);
      }

      this.socket.emit('join_conversation', {
        conversation_id: conversationId,
        token: this.token,
      });

      this.socket.once('joined_conversation', (data: { conversation_id: number }) => {
        console.log('[Socket] Joined conversation:', data.conversation_id);
        this.currentConversationId = conversationId;
        resolve();
      });

      this.socket.once('error', (data: { message: string }) => {
        reject(new Error(data.message));
      });
    });
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: number) {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', { conversation_id: conversationId });
    }
    this.messageHandlers.delete(conversationId);
    this.typingHandlers.delete(conversationId);
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }
  }

  /**
   * Subscribe to new messages in a conversation
   */
  onMessage(conversationId: number, handler: MessageHandler) {
    const handlers = this.messageHandlers.get(conversationId) || [];
    handlers.push(handler);
    this.messageHandlers.set(conversationId, handlers);

    // Return unsubscribe function
    return () => {
      const current = this.messageHandlers.get(conversationId) || [];
      const filtered = current.filter(h => h !== handler);
      this.messageHandlers.set(conversationId, filtered);
    };
  }

  /**
   * Subscribe to typing indicators in a conversation
   */
  onTyping(conversationId: number, handler: TypingHandler) {
    const handlers = this.typingHandlers.get(conversationId) || [];
    handlers.push(handler);
    this.typingHandlers.set(conversationId, handlers);

    // Return unsubscribe function
    return () => {
      const current = this.typingHandlers.get(conversationId) || [];
      const filtered = current.filter(h => h !== handler);
      this.typingHandlers.set(conversationId, filtered);
    };
  }

  /**
   * Subscribe to status changes for a specific user
   */
  onUserStatus(userId: number, handler: UserStatusHandler) {
    const handlers = this.userStatusHandlers.get(userId) || [];
    handlers.push(handler);
    this.userStatusHandlers.set(userId, handlers);

    // Return unsubscribe function
    return () => {
      const current = this.userStatusHandlers.get(userId) || [];
      const filtered = current.filter(h => h !== handler);
      this.userStatusHandlers.set(userId, filtered);
    };
  }

  /**
   * Subscribe to all user status changes (global)
   */
  onAnyUserStatus(handler: UserStatusHandler) {
    this.globalStatusHandlers.push(handler);

    // Return unsubscribe function
    return () => {
      this.globalStatusHandlers = this.globalStatusHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Request current status of a user
   */
  requestUserStatus(userId: number) {
    if (this.socket?.connected) {
      this.socket.emit('get_user_status', { user_id: userId });
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: number, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', {
        conversation_id: conversationId,
        is_typing: isTyping,
        token: this.token,
      });
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
