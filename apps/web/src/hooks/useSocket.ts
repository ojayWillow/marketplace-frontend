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
  // Map<userId, { status, lastSeen, lastSeenDisplay }>
  presenceMap: Record<number, {
    status: 'online' | 'recently' | 'offline';
    lastSeen: string | null;
    lastSeenDisplay: string | null;
  }>;
  // Map<conversationId, userId[]> — who is currently typing
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

// ── Singleton socket ref (shared across hook instances) ───────────────
let globalSocket: Socket | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore();
  const { setConnected, updatePresence, setTyping } = useSocketStore();
  const tokenRef = useRef(token);
  tokenRef.current = token;

  // Derive the Socket.IO server URL from API_URL
  const socketUrl = useMemo(() => {
    // API_URL might be empty string in dev (proxy), or full URL in prod
    if (!API_URL || API_URL === '') {
      // Dev: vite proxies /api but socket needs the actual backend
      return 'http://localhost:5000';
    }
    // Prod: same origin as the API
    return API_URL;
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Disconnect if we have a lingering socket
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      setConnected(false);
      return;
    }

    // Already connected with this token? Skip.
    if (globalSocket?.connected) return;

    // Create socket — matches backend's Flask-SocketIO config
    const socket = io(socketUrl, {
      auth: { token: `Bearer ${token}` },
      transports: ['polling'], // Backend has allow_upgrades=False
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 30000,
      timeout: 60000,
    });

    globalSocket = socket;

    // ─── Connection events ──────────────────────────────────
    socket.on('connect', () => {
      console.log('[Socket] ✅ Connected:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] ❌ Disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
      setConnected(false);
    });

    // ─── Presence events ────────────────────────────────────
    const handlePresence = (data: any) => {
      if (!data?.user_id) return;
      updatePresence(data.user_id, {
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
        setTyping(data.conversation_id, data.user_id, data.is_typing);

        // Auto-clear typing after 5s (safety net)
        if (data.is_typing) {
          setTimeout(() => {
            setTyping(data.conversation_id, data.user_id, false);
          }, 5000);
        }
      }
    });

    // ─── Heartbeat ──────────────────────────────────────────
    heartbeatInterval = setInterval(() => {
      if (socket.connected && tokenRef.current) {
        socket.emit('heartbeat', { token: `Bearer ${tokenRef.current}` });
      }
    }, 25000);

    // ─── Cleanup ────────────────────────────────────────────
    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      socket.disconnect();
      globalSocket = null;
      setConnected(false);
    };
  }, [isAuthenticated, token, socketUrl, setConnected, updatePresence, setTyping]);

  // ── Imperative helpers ──────────────────────────────────────────────
  const joinConversation = useCallback((conversationId: number) => {
    if (globalSocket?.connected && tokenRef.current) {
      globalSocket.emit('join_conversation', {
        conversation_id: conversationId,
        token: `Bearer ${tokenRef.current}`,
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
    if (globalSocket?.connected && tokenRef.current) {
      globalSocket.emit('typing', {
        conversation_id: conversationId,
        is_typing: isTyping,
        token: `Bearer ${tokenRef.current}`,
      });
    }
  }, []);

  const requestUserStatus = useCallback((userId: number) => {
    if (globalSocket?.connected) {
      globalSocket.emit('get_user_status', { user_id: userId });
    }
  }, []);

  // Listen for new_message events (caller provides callback)
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
