import { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  TextInput,
  IconButton,
  ActivityIndicator,
  Avatar,
  Surface,
} from 'react-native-paper';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConversation,
  getMessages,
  sendMessage,
  markAsRead,
  useAuthStore,
  type Message,
  type Conversation,
} from '@marketplace/shared';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = parseInt(id);
  const { user } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messageText, setMessageText] = useState('');

  // Fetch conversation details
  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => getConversation(conversationId),
    enabled: !!conversationId,
  });

  // Fetch messages
  const {
    data: messagesData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 10000, // Poll every 10 seconds for new messages
  });

  const messages = messagesData?.messages || [];

  // Mark as read on mount
  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId).catch(console.error);
    }
  }, [conversationId]);

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
    mutationFn: (content: string) => sendMessage(conversationId, content),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
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
  const headerTitle = otherUser?.username || 'Chat';

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

  // Dynamic styles based on theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    keyboardView: {
      flex: 1,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    statusText: {
      marginTop: 12,
      color: themeColors.textSecondary,
    },
    errorText: {
      color: activeTheme === 'dark' ? themeColors.error : '#ef4444',
      marginBottom: 12,
      fontSize: 16,
    },
    retryButton: {
      backgroundColor: activeTheme === 'dark' ? themeColors.primaryAccent : '#0ea5e9',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#ffffff',
      fontWeight: '600',
    },
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
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: themeColors.textSecondary,
      textAlign: 'center',
    },
    dateSeparator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    dateLine: {
      flex: 1,
      height: 1,
      backgroundColor: themeColors.border,
    },
    dateText: {
      paddingHorizontal: 12,
      fontSize: 12,
      color: themeColors.textMuted,
      fontWeight: '500',
    },
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
      backgroundColor: activeTheme === 'dark' ? themeColors.secondaryAccent : '#6b7280',
      marginRight: 8,
    },
    messageBubble: {
      maxWidth: '75%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
    },
    ownMessage: {
      backgroundColor: activeTheme === 'dark' ? themeColors.primaryAccent : '#0ea5e9',
      borderBottomRightRadius: 4,
      // Purple glow effect in dark mode
      ...(activeTheme === 'dark' && {
        shadowColor: themeColors.primaryAccent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      }),
    },
    otherMessage: {
      backgroundColor: themeColors.card,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    messageText: {
      fontSize: 15,
      lineHeight: 20,
    },
    ownMessageText: {
      color: '#ffffff',
    },
    otherMessageText: {
      color: themeColors.text,
    },
    messageTime: {
      fontSize: 11,
      marginTop: 4,
    },
    ownMessageTime: {
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'right',
    },
    otherMessageTime: {
      color: themeColors.textMuted,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: 12,
      paddingBottom: 8,
      backgroundColor: themeColors.card,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    textInput: {
      flex: 1,
      marginRight: 8,
      maxHeight: 100,
      backgroundColor: themeColors.card,
      color: themeColors.text,
    },
    textInputOutline: {
      borderRadius: 20,
      borderColor: themeColors.border,
    },
    sendButton: {
      marginBottom: 4,
      backgroundColor: activeTheme === 'dark' ? themeColors.primaryAccent : undefined,
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Loading...', headerShown: true }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={activeTheme === 'dark' ? themeColors.primaryAccent : undefined} />
          <Text style={styles.statusText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Error', headerShown: true }} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load messages</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: headerTitle,
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
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
                      <View style={styles.dateLine} />
                      <Text style={styles.dateText}>
                        {formatDateSeparator(message.created_at)}
                      </Text>
                      <View style={styles.dateLine} />
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
                        style={styles.messageAvatar}
                      />
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        isOwnMessage ? styles.ownMessage : styles.otherMessage,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                        ]}
                      >
                        {message.content}
                      </Text>
                      <Text
                        style={[
                          styles.messageTime,
                          isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
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

        {/* Input Area */}
        <Surface style={styles.inputContainer} elevation={2}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={themeColors.textMuted}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            mode="outlined"
            outlineStyle={styles.textInputOutline}
            dense
            textColor={themeColors.text}
          />
          <IconButton
            icon="send"
            mode="contained"
            size={24}
            onPress={handleSend}
            disabled={!messageText.trim() || sendMutation.isPending}
            loading={sendMutation.isPending}
            style={styles.sendButton}
            iconColor="#ffffff"
          />
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
