import { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Pressable,
  TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  IconButton,
  ActivityIndicator,
  Avatar,
} from 'react-native-paper';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConversation,
  getMessages,
  sendMessage,
  markAsRead,
  startConversation,
  useAuthStore,
  type Message,
} from '@marketplace/shared';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function ConversationScreen() {
  // Support both conversation ID and user ID for new conversations
  const { id, userId, username } = useLocalSearchParams<{ 
    id: string; 
    userId?: string;
    username?: string;
  }>();
  
  const [conversationId, setConversationId] = useState<number | null>(
    id && id !== 'new' ? parseInt(id) : null
  );
  const targetUserId = userId ? parseInt(userId) : null;
  
  const { user } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messageText, setMessageText] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  // Create conversation if we have userId but no conversationId
  useEffect(() => {
    if (targetUserId && !conversationId && !isCreatingConversation) {
      setIsCreatingConversation(true);
      startConversation(targetUserId)
        .then((result) => {
          setConversationId(result.conversation.id);
          setIsCreatingConversation(false);
        })
        .catch((error) => {
          console.error('Failed to create conversation:', error);
          setIsCreatingConversation(false);
        });
    }
  }, [targetUserId, conversationId, isCreatingConversation]);

  // Fetch conversation details
  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => getConversation(conversationId!),
    enabled: !!conversationId,
    retry: false,
    onError: (error: any) => {
      if (error?.response?.status === 403) {
        setAccessDenied(true);
        // Clear this conversation from cache
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });

  // Fetch messages
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    isError,
    error: messagesError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId && !accessDenied,
    refetchInterval: 10000, // Poll every 10 seconds for new messages
    retry: false,
    onError: (error: any) => {
      if (error?.response?.status === 403) {
        setAccessDenied(true);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });

  const messages = messagesData?.messages || [];
  const isLoading = isCreatingConversation || (!conversationId && targetUserId) || isLoadingMessages;

  // Auto-redirect after 3 seconds if access denied
  useEffect(() => {
    if (accessDenied) {
      const timer = setTimeout(() => {
        router.replace('/(tabs)/messages');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [accessDenied]);

  // Mark as read on mount
  useEffect(() => {
    if (conversationId && !accessDenied) {
      markAsRead(conversationId).catch(console.error);
    }
  }, [conversationId, accessDenied]);

  // Scroll to bottom when messages load or new message sent
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      // If no conversation yet, create one with the first message
      if (!conversationId && targetUserId) {
        const result = await startConversation(targetUserId, content);
        setConversationId(result.conversation.id);
        return result.conversation.last_message;
      }
      // Otherwise send to existing conversation
      return sendMessage(conversationId!, content);
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Refetch messages after a short delay
      setTimeout(() => {
        if (conversationId) {
          refetch();
        }
      }, 500);
    },
    onError: (error: any) => {
      console.error('Failed to send message:', error);
    },
  });

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (trimmed && !sendMutation.isPending) {
      sendMutation.mutate(trimmed);
    }
  };

  const otherUser = conversation?.other_participant;
  const headerTitle = otherUser?.username || username || 'Chat';
  const avatarLabel = (otherUser?.username || username || '?').charAt(0).toUpperCase();

  // Format message time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format date separator
  const formatDateSeparator = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Check if we need a date separator
  const needsDateSeparator = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();
    return currentDate !== prevDate;
  };

  // Custom header with avatar
  const CustomHeader = () => (
    <View style={[styles.customHeader, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={[styles.backText, { color: '#0ea5e9' }]}>‹ Back</Text>
      </Pressable>
      
      <Pressable 
        style={styles.headerCenter}
        onPress={() => otherUser?.id && router.push(`/user/${otherUser.id}`)}
      >
        <Avatar.Text
          size={36}
          label={avatarLabel}
          style={styles.headerAvatar}
        />
        <Text style={[styles.headerTitle, { color: themeColors.text }]} numberOfLines={1}>
          {headerTitle}
        </Text>
      </Pressable>

      <Pressable 
        style={styles.infoButton}
        onPress={() => otherUser?.id && router.push(`/user/${otherUser.id}`)}
      >
        <Text style={styles.infoIcon}>ℹ️</Text>
      </Pressable>
    </View>
  );

  // Access Denied Screen
  if (accessDenied) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader />
        <View style={styles.centerContainer}>
          <View style={[styles.errorIconContainer, { backgroundColor: themeColors.card }]}>
            <Text style={styles.errorIconLarge}>🚫</Text>
          </View>
          <Text style={[styles.errorTitle, { color: themeColors.text }]}>Access Denied</Text>
          <Text style={[styles.errorSubtext, { color: themeColors.textSecondary }]}>
            You don't have permission to view this conversation.
          </Text>
          <Text style={[styles.errorSubtext, { color: themeColors.textMuted }]}>
            Redirecting to messages...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={[styles.statusText, { color: themeColors.textSecondary }]}>
            {isCreatingConversation ? 'Starting conversation...' : 'Loading messages...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load messages</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Can send if we have text AND either a conversation or a target user
  const canSend = messageText.trim() && !sendMutation.isPending && (conversationId || targetUserId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <CustomHeader />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          style={[styles.messagesContainer, { backgroundColor: themeColors.backgroundSecondary }]}
          contentContainerStyle={styles.messagesContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: themeColors.card }]}>
                <Text style={styles.emptyIcon}>👋</Text>
              </View>
              <Text style={[styles.emptyText, { color: themeColors.text }]}>Say hello!</Text>
              <Text style={[styles.emptySubtext, { color: themeColors.textSecondary }]}>
                Send a message to start the conversation
              </Text>
            </View>
          ) : (
            messages.map((message: Message, index: number) => {
              const isOwnMessage = message.sender_id === user?.id;
              const prevMessage = index > 0 ? messages[index - 1] : undefined;
              const showDateSeparator = needsDateSeparator(message, prevMessage);

              return (
                <View key={message.id}>
                  {/* Date Separator */}
                  {showDateSeparator && (
                    <View style={styles.dateSeparator}>
                      <View style={[styles.dateLine, { backgroundColor: themeColors.border }]} />
                      <Text style={[styles.dateText, { color: themeColors.textMuted }]}>
                        {formatDateSeparator(message.created_at)}
                      </Text>
                      <View style={[styles.dateLine, { backgroundColor: themeColors.border }]} />
                    </View>
                  )}

                  {/* Message Bubble */}
                  <View
                    style={[
                      styles.messageBubbleContainer,
                      isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
                    ]}
                  >
                    {!isOwnMessage && (
                      <Avatar.Text
                        size={32}
                        label={message.sender?.username?.charAt(0).toUpperCase() || '?'}
                        style={[styles.messageAvatar, { backgroundColor: activeTheme === 'dark' ? themeColors.secondaryAccent : '#6b7280' }]}
                      />
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        isOwnMessage 
                          ? [styles.ownMessage, activeTheme === 'dark' && styles.ownMessageDark]
                          : [styles.otherMessage, { backgroundColor: themeColors.card, borderColor: themeColors.border }],
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isOwnMessage ? styles.ownMessageText : [styles.otherMessageText, { color: themeColors.text }],
                        ]}
                      >
                        {message.content}
                      </Text>
                      <Text
                        style={[
                          styles.messageTime,
                          isOwnMessage ? styles.ownMessageTime : [styles.otherMessageTime, { color: themeColors.textMuted }],
                        ]}
                      >
                        {formatTime(message.created_at)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Input Area - Redesigned */}
        <View style={[styles.inputContainer, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
          <Pressable style={[styles.attachButton, { backgroundColor: themeColors.backgroundSecondary }]}>
            <Text style={styles.attachIcon}>📎</Text>
          </Pressable>
          
          <View style={[styles.textInputContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
            <RNTextInput
              style={[styles.textInput, { color: themeColors.text }]}
              placeholder="Type a message..."
              placeholderTextColor={themeColors.textMuted}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
            />
          </View>

          <Pressable 
            style={[
              styles.sendButton,
              !canSend && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!canSend}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  
  // Custom Header
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backText: {
    fontSize: 17,
    fontWeight: '400',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  headerAvatar: {
    backgroundColor: '#0ea5e9',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  infoButton: {
    padding: 4,
  },
  infoIcon: {
    fontSize: 20,
  },

  // Center states
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusText: {
    marginTop: 12,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorIconLarge: {
    fontSize: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },

  // Date Separator
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateText: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '500',
  },

  // Message Bubbles
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ownMessage: {
    backgroundColor: '#0ea5e9',
    borderBottomRightRadius: 6,
  },
  ownMessageDark: {
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  otherMessage: {
    borderBottomLeftRadius: 6,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {},
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {},

  // Input Area
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachIcon: {
    fontSize: 18,
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
});
