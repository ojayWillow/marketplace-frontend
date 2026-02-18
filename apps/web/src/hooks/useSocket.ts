/**
 * useSocket - Global Socket.IO hook for real-time communication.
 *
 * Connects when user is authenticated, disconnects on logout.
 * Sends heartbeats every 25s to keep last_seen fresh.
 * Exposes the socket instance and connection state.
 *
 * Events emitted:
 *   - heartbeat { token }
 *   - join_conversation { conversation_id, token }
 *   - leave_conversation { conversation_id }
 *   - typing { conversation_id, is_typing, token }
 *   - get_user_status { user_id }
 *
 * Events listened:
 *   - connected
 *   - user_presence / user_status_changed
 *   - new_message
 *   - user_typing
 *   - user_status
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore, API_URL } from '@marketplace/shared';

// ── Zustand store for socket state (accessible anywhere) ──────────────
interface SocketState {
  isConnected: boolean;
  presenceMap: Record<number, {
    status: 'online' | 'recently' | 'offline';
    lastSeen: string | null;
    lastSeenDisplay: string | null;
  }>;
  typingMap: Record<number, number[]>;
  setConnected: (v: boolean) => void;
  updatePresence: (userId: number, data: {
    status: 'online' | 'recently' | 'offline';
    lastSeen: string | null;
    lastSeenDisplay: string | null;
  }) => void;
  setTyping: (conversationId: number, userId: number, isTyping: boolean) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  presenceMap: {},
  typingMap: {},

  setConnected: (v) => set({ isConnected: v }),

  updatePresence: (userId, data) =>
    set((s) => ({
      presenceMap: { ...s.presenceMap, [userId]: data },
    })),

  setTyping: (conversationId, userId, isTyping) =>
    set((s) => {
      const current = s.typingMap[conversationId] || [];
      const next = isTyping
        ? current.includes(userId) ? current : [...current, userId]
        : current.filter((id) => id !== userId);
      return { typingMap: { ...s.typingMap, [conversationId]: next } };
    }),
}));

// ── Singleton socket management (outside React) ───────────────────────
let globalSocket: Socket | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let currentToken: string | null = null;

function cleanupSocket() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (globalSocket) {
    globalSocket.removeAllListeners();
    globalSocket.disconnect();
    globalSocket = null;
  }
  currentToken = null;
  useSocketStore.getState().setConnected(false);
}

function setupSocket(token: string, socketUrl: string) {
  // Already connected with same token? Skip.
  if (globalSocket?.connected && currentToken === token) return;

  // Different token or disconnected — clean up old socket first
  if (globalSocket) {
    cleanupSocket();
  }

  currentToken = token;
  const store = useSocketStore.getState();

  const socket = io(socketUrl, {
    auth: { token: `Bearer ${token}` },
    transports: ['polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 30000,
    timeout: 60000,
  });

  globalSocket = socket;

  // ─── Connection events ──────────────────────────────────
  socket.on('connect', () => {
    console.debug('[Socket] Connected:', socket.id);
    useSocketStore.getState().setConnected(true);
  });

  socket.on('disconnect', (reason) => {
    console.warn('[Socket] Disconnected:', reason);
    useSocketStore.getState().setConnected(false);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
    useSocketStore.getState().setConnected(false);
  });

  // ─── Presence events ────────────────────────────────────
  const handlePresence = (data: any) => {
    if (!data?.user_id) return;
    useSocketStore.getState().updatePresence(data.user_id, {
      status: data.status || (data.is_online ? 'online' : 'offline'),
      lastSeen: data.last_seen || null,
      lastSeenDisplay: data.last_seen_display || null,
    });
  };

  socket.on('user_presence', handlePresence);
  socket.on('user_status_changed', handlePresence);
  socket.on('user_status', handlePresence);

  // ─── Typing events ──────────────────────────────────────
  socket.on('user_typing', (data: any) => {
    if (data?.conversation_id && data?.user_id != null) {
      useSocketStore.getState().setTyping(data.conversation_id, data.user_id, data.is_typing);

      if (data.is_typing) {
        setTimeout(() => {
          useSocketStore.getState().setTyping(data.conversation_id, data.user_id, false);
        }, 5000);
      }
    }
  });

  // ─── Heartbeat ──────────────────────────────────────────
  heartbeatInterval = setInterval(() => {
    if (globalSocket?.connected && currentToken) {
      globalSocket.emit('heartbeat', { token: `Bearer ${currentToken}` });
    }
  }, 25000);
}

// ── React hook ────────────────────────────────────────────────────────
export function useSocket() {
  const { token, isAuthenticated } = useAuthStore();
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const socketUrl = useMemo(() => {
    if (!API_URL || API_URL === '') {
      return 'http://localhost:5000';
    }
    return API_URL;
  }, []);

  // Only depend on isAuthenticated + token — NOT on Zustand actions
  useEffect(() => {
    if (!isAuthenticated || !token) {
      cleanupSocket();
      return;
    }

    setupSocket(token, socketUrl);

    // Only cleanup on actual unmount of the app or logout
    // Do NOT cleanup on re-renders
  }, [isAuthenticated, token, socketUrl]);

  // Also cleanup on full page unload
  useEffect(() => {
    const handleUnload = () => cleanupSocket();
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // ── Imperative helpers ──────────────────────────────────────────────
  const joinConversation = useCallback((conversationId: number) => {
    if (globalSocket?.connected && currentToken) {
      globalSocket.emit('join_conversation', {
        conversation_id: conversationId,
        token: `Bearer ${currentToken}`,
      });
    }
  }, []);

  const leaveConversation = useCallback((conversationId: number) => {
    if (globalSocket?.connected) {
      globalSocket.emit('leave_conversation', {
        conversation_id: conversationId,
      });
    }
  }, []);

  const emitTyping = useCallback((conversationId: number, isTyping: boolean) => {
    if (globalSocket?.connected && currentToken) {
      globalSocket.emit('typing', {
        conversation_id: conversationId,
        is_typing: isTyping,
        token: `Bearer ${currentToken}`,
      });
    }
  }, []);

  const requestUserStatus = useCallback((userId: number) => {
    if (globalSocket?.connected) {
      globalSocket.emit('get_user_status', { user_id: userId });
    }
  }, []);

  const onNewMessage = useCallback((cb: (data: any) => void) => {
    if (!globalSocket) return () => {};
    globalSocket.on('new_message', cb);
    return () => {
      globalSocket?.off('new_message', cb);
    };
  }, []);

  return {
    isConnected: useSocketStore((s) => s.isConnected),
    joinConversation,
    leaveConversation,
    emitTyping,
    requestUserStatus,
    onNewMessage,
  };
}

export default useSocket;
