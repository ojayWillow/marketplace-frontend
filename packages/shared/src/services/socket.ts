/**
 * Socket.IO client for real-time messaging
 * 
 * RESILIENT DESIGN:
 * - Never show errors to users for socket issues
 * - Auto-reconnect continuously
 * - Keep last known user status until new data arrives
 * - Graceful degradation when offline
 */
import { io, Socket } from 'socket.io-client';
import type { Message } from '../api/messages';

type MessageHandler = (message: Message) => void;
type TypingHandler = (data: { user_id: number; is_typing: boolean; conversation_id: number }) => void;
type UserStatusHandler = (data: { user_id: number; status: 'online' | 'offline'; last_seen: string | null }) => void;
type ConnectionStateHandler = (connected: boolean) => void;

// Heartbeat interval - match backend's ping_interval (25s)
const HEARTBEAT_INTERVAL = 25000;

class SocketService {
  private socket: Socket | null = null;
  private baseUrl: string = '';
  private token: string = '';
  private messageHandlers: Map<number, MessageHandler[]> = new Map();
  private typingHandlers: Map<number, TypingHandler[]> = new Map();
  private userStatusHandlers: Map<number, UserStatusHandler[]> = new Map();
  private globalStatusHandlers: UserStatusHandler[] = [];
  private connectionStateHandlers: ConnectionStateHandler[] = [];
  private currentConversationId: number | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  
  // Resilience: cache user statuses
  private lastKnownStatuses: Map<number, { status: 'online' | 'offline'; last_seen: string | null }> = new Map();
  private connectionPromise: Promise<void> | null = null;

  /**
   * Initialize the socket service with base URL
   */
  init(baseUrl: string) {
    this.baseUrl = baseUrl.replace('/api', '');
  }

  /**
   * Connect to WebSocket server - NEVER throws errors
   */
  connect(token: string): Promise<void> {
    // Return existing connection promise if already connecting
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Already connected
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    this.token = token;
    
    this.connectionPromise = new Promise((resolve) => {
      // Socket.IO config - optimized for resilience
      this.socket = io(this.baseUrl, {
        auth: { token },
        transports: ['polling'],
        upgrade: false,
        reconnection: true,
        reconnectionAttempts: Infinity, // Never stop trying
        reconnectionDelay: 2000,
        reconnectionDelayMax: 30000,
        timeout: 30000, // Increased for mobile networks
        forceNew: false,
        path: '/socket.io/',
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected to', this.baseUrl);
        this.connectionPromise = null;
        this.startHeartbeat();
        this.notifyConnectionState(true);
        
        // Rejoin conversation room if we were in one
        if (this.currentConversationId) {
          this.rejoinConversation(this.currentConversationId);
        }
        
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        // Log but NEVER reject - let socket.io handle reconnection
        console.log('[Socket] Connection error (will retry):', error.message);
        this.connectionPromise = null;
        // Resolve anyway so the app doesn't hang
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
        this.stopHeartbeat();
        this.notifyConnectionState(false);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
        this.startHeartbeat();
        this.notifyConnectionState(true);
        
        // Rejoin conversation
        if (this.currentConversationId) {
          this.rejoinConversation(this.currentConversationId);
        }
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
        // Cache the status
        this.lastKnownStatuses.set(data.user_id, { status: data.status, last_seen: data.last_seen });
        // Notify handlers
        const handlers = this.userStatusHandlers.get(data.user_id) || [];
        handlers.forEach(handler => handler(data));
        this.globalStatusHandlers.forEach(handler => handler(data));
      });

      // Handle user status response (from get_user_status request)
      this.socket.on('user_status', (data: { user_id: number; status: 'online' | 'offline'; last_seen: string | null }) => {
        console.log('[Socket] User status received:', data);
        // Cache the status
        this.lastKnownStatuses.set(data.user_id, { status: data.status, last_seen: data.last_seen });
        // Notify handlers
        const handlers = this.userStatusHandlers.get(data.user_id) || [];
        handlers.forEach(handler => handler(data));
      });

      // Handle heartbeat acknowledgment
      this.socket.on('heartbeat_ack', () => {
        // Heartbeat acknowledged - connection is healthy
      });

      this.socket.on('error', (data: { message: string }) => {
        // Log but don't show to user
        console.log('[Socket] Server error:', data.message);
      });

      // Timeout safety - resolve anyway after 10s so app doesn't hang
      setTimeout(() => {
        if (this.connectionPromise) {
          this.connectionPromise = null;
          resolve();
        }
      }, 10000);
    });

    return this.connectionPromise;
  }

  /**
   * Force reconnect - call this when app comes to foreground
   */
  forceReconnect() {
    if (!this.token) return;
    
    console.log('[Socket] Force reconnect requested');
    
    if (this.socket?.connected) {
      // Already connected, just send heartbeat to verify
      this.sendHeartbeat();
      return;
    }
    
    // Try to reconnect
    if (this.socket) {
      this.socket.connect();
    } else {
      this.connect(this.token);
    }
  }

  /**
   * Rejoin conversation room after reconnect
   */
  private rejoinConversation(conversationId: number) {
    if (!this.socket?.connected || !this.token) return;
    
    console.log('[Socket] Rejoining conversation:', conversationId);
    this.socket.emit('join_conversation', {
      conversation_id: conversationId,
      token: this.token,
    });
  }

  /**
   * Start sending heartbeats
   */
  private startHeartbeat() {
    this.stopHeartbeat();
    this.sendHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * Stop sending heartbeats
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Send a heartbeat
   */
  private sendHeartbeat() {
    if (this.socket?.connected && this.token) {
      this.socket.emit('heartbeat', { token: this.token });
    }
  }

  /**
   * Notify connection state handlers
   */
  private notifyConnectionState(connected: boolean) {
    this.connectionStateHandlers.forEach(handler => handler(connected));
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionStateChange(handler: ConnectionStateHandler) {
    this.connectionStateHandlers.push(handler);
    
    // Immediately notify current state
    handler(this.socket?.connected || false);
    
    return () => {
      this.connectionStateHandlers = this.connectionStateHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Get last known status for a user (returns cached value if offline)
   */
  getLastKnownStatus(userId: number): { status: 'online' | 'offline'; last_seen: string | null } | null {
    return this.lastKnownStatuses.get(userId) || null;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageHandlers.clear();
    this.typingHandlers.clear();
    this.userStatusHandlers.clear();
    this.globalStatusHandlers = [];
    this.connectionStateHandlers = [];
    this.currentConversationId = null;
    this.connectionPromise = null;
    // Keep lastKnownStatuses for potential future use
  }

  /**
   * Join a conversation room - NEVER throws
   */
  joinConversation(conversationId: number): Promise<void> {
    return new Promise((resolve) => {
      // Store current conversation for auto-rejoin on reconnect
      this.currentConversationId = conversationId;
      
      if (!this.socket?.connected) {
        console.log('[Socket] Not connected, will join when connected');
        resolve(); // Don't throw - we'll join on reconnect
        return;
      }

      // Leave previous conversation if different
      if (this.currentConversationId && this.currentConversationId !== conversationId) {
        this.leaveConversation(this.currentConversationId);
      }

      this.socket.emit('join_conversation', {
        conversation_id: conversationId,
        token: this.token,
      });

      // Listen for join confirmation with timeout
      const timeout = setTimeout(() => {
        console.log('[Socket] Join timeout, assuming joined');
        resolve();
      }, 5000);

      this.socket.once('joined_conversation', (data: { conversation_id: number }) => {
        clearTimeout(timeout);
        console.log('[Socket] Joined conversation:', data.conversation_id);
        resolve();
      });

      this.socket.once('error', () => {
        clearTimeout(timeout);
        // Don't reject - just resolve silently
        resolve();
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
    
    // Immediately send last known status if available (graceful degradation)
    const cached = this.lastKnownStatuses.get(userId);
    if (cached) {
      handler({ user_id: userId, ...cached });
    }

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

    return () => {
      this.globalStatusHandlers = this.globalStatusHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Request current status of a user
   */
  requestUserStatus(userId: number) {
    // If not connected, return cached status immediately
    if (!this.socket?.connected) {
      const cached = this.lastKnownStatuses.get(userId);
      if (cached) {
        const handlers = this.userStatusHandlers.get(userId) || [];
        handlers.forEach(handler => handler({ user_id: userId, ...cached }));
      }
      return;
    }
    
    this.socket.emit('get_user_status', { user_id: userId });
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
