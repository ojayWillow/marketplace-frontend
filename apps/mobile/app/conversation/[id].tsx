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
  Image as RNImage,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import ImageView from 'react-native-image-viewing';
import {
  getConversation,
  getMessages,
  sendMessage,
  sendMessageWithAttachment,
  markAsRead,
  startConversation,
  useAuthStore,
  socketService,
  type Message,
} from '@marketplace/shared';
import { useThemeStore } from '../../src/stores/themeStore';
import { useLanguageStore } from '../../src/stores/languageStore';
import { colors } from '../../src/theme';
import Constants from 'expo-constants';

// Import extracted components from _components (ignored by Expo Router)
import { ConversationHeader } from './_components/ConversationHeader';
import { MessageBubble } from './_components/MessageBubble';
import { DateSeparator } from './_components/DateSeparator';
import { EmptyConversation } from './_components/EmptyConversation';
import { formatLastSeen, formatDateSeparator, needsDateSeparator } from './_utils/messageFormatters';

export default function ConversationScreen() {
  const { id, userId, username } = useLocalSearchParams<{ 
    id: string; 
    userId?: string;
    username?: string;
  }>();
  
  const [conversationId, setConversationId] = useState<number | null>(
    id && id !== 'new' ? parseInt(id) : null
  );
  const targetUserId = userId ? parseInt(userId) : null;
  
  const { user, token } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const { t } = useLanguageStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messageText, setMessageText] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);
  
  // Online status state
  const [userStatus, setUserStatus] = useState<'online' | 'offline' | null>(null);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000';

  // Handle app state changes - reconnect socket when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - force reconnect socket
        console.log('[AppState] App active - reconnecting socket');
        socketService.forceReconnect();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

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
          // Don't show error - silently handle
        });
    }
  }, [targetUserId, conversationId, isCreatingConversation]);

  // Setup WebSocket connection - NEVER throws errors to UI
  useEffect(() => {
    if (!conversationId || !token) return;

    socketService.init(apiUrl);

    const connectSocket = async () => {
      // connect() never throws now - always resolves
      await socketService.connect(token);
      setSocketConnected(socketService.isConnected());
      await socketService.joinConversation(conversationId);
      console.log('[Socket] Setup complete for conversation:', conversationId);
    };

    connectSocket();

    // Subscribe to connection state changes
    const unsubscribeConnection = socketService.onConnectionStateChange((connected) => {
      setSocketConnected(connected);
    });

    return () => {
      if (conversationId) {
        socketService.leaveConversation(conversationId);
      }
      unsubscribeConnection();
    };
  }, [conversationId, token, apiUrl]);

  // Handle real-time messages
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = socketService.onMessage(conversationId, (newMessage: Message) => {
      console.log('[Socket] New message received:', newMessage.id);
      
      queryClient.setQueryData(['messages', conversationId], (old: any) => {
        if (!old) return old;
        const exists = old.messages.some((m: Message) => m.id === newMessage.id);
        if (exists) return old;
        return { ...old, messages: [...old.messages, newMessage] };
      });

      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return unsubscribe;
  }, [conversationId, queryClient]);

  // Fetch conversation details
  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => getConversation(conversationId!),
    enabled: !!conversationId,
    retry: false,
    onError: (error: any) => {
      if (error?.response?.status === 403) {
        setAccessDenied(true);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });

  const otherUser = conversation?.other_participant;
  const otherUserId = otherUser?.id;

  // Subscribe to user status updates and request immediately when ready
  useEffect(() => {
    if (!otherUserId) return;

    const requestStatus = () => {
      // This now works even when offline - returns cached status
      socketService.requestUserStatus(otherUserId);
    };

    // Request status immediately
    requestStatus();

    // Also request after a short delay in case socket is still connecting
    const retryTimer = setTimeout(requestStatus, 500);

    const unsubscribe = socketService.onUserStatus(otherUserId, (data) => {
      console.log('[Socket] User status update:', data);
      setUserStatus(data.status);
      setLastSeen(data.last_seen);
    });

    return () => {
      clearTimeout(retryTimer);
      unsubscribe();
    };
  }, [otherUserId, socketConnected]);

  // Fetch messages
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId && !accessDenied,
    refetchInterval: false,
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

  const imageMessages = messages.filter((m: Message) => m.attachment_url && m.attachment_type === 'image');
  const viewerImages = imageMessages.map((m: Message) => ({ uri: m.attachment_url! }));

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
      markAsRead(conversationId).catch(() => {
        // Silently ignore - not critical
      });
    }
  }, [conversationId, accessDenied]);

  // Scroll to bottom when messages load
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(t('conversation.permissionNeeded'), t('conversation.photoLibraryAccess'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const clearImage = () => setSelectedImage(null);

  const openImageViewer = (imageUrl: string) => {
    const index = imageMessages.findIndex((m: Message) => m.attachment_url === imageUrl);
    if (index !== -1) {
      setViewerImageIndex(index);
      setViewerVisible(true);
    }
  };

  // Send message mutation - NO ERROR ALERTS
  const sendMutation = useMutation({
    mutationFn: async ({ content, image }: { content: string; image?: ImagePicker.ImagePickerAsset }) => {
      if (!conversationId && targetUserId) {
        const result = await startConversation(targetUserId, content);
        setConversationId(result.conversation.id);
        return result.conversation.last_message;
      }
      
      if (image) {
        const file = {
          uri: image.uri,
          type: image.mimeType || 'image/jpeg',
          name: image.fileName || `image_${Date.now()}.jpg`,
        };
        return sendMessageWithAttachment(conversationId!, content, file);
      }
      
      return sendMessage(conversationId!, content);
    },
    onSuccess: () => {
      setMessageText('');
      setSelectedImage(null);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      // Log error but DON'T show alert to user
      console.log('[Message] Send failed (silent):', error?.message || error);
      // Keep the message text so user can retry by pressing send again
      // The mutation will auto-reset isPending so they can retry
    },
  });

  const handleSend = () => {
    const trimmed = messageText.trim();
    if ((trimmed || selectedImage) && !sendMutation.isPending) {
      sendMutation.mutate({ content: trimmed, image: selectedImage || undefined });
    }
  };

  const headerTitle = otherUser?.username || username || t('conversation.chat');

  // Get status text for header
  const getStatusText = () => {
    if (userStatus === 'online') return t('conversation.online');
    if (userStatus === 'offline' && lastSeen) return `${t('conversation.lastSeen')} ${formatLastSeen(lastSeen)}`;
    return null;
  };

  // Access Denied Screen
  if (accessDenied) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ConversationHeader
          username={headerTitle}
          userId={otherUser?.id}
          userStatus={userStatus}
          statusText={getStatusText()}
          onBack={() => router.back()}
          themeColors={themeColors}
        />
        <View style={styles.centerContainer}>
          <View style={[styles.errorIconContainer, { backgroundColor: themeColors.card }]}>
            <Text style={styles.errorIconLarge}>🚫</Text>
          </View>
          <Text style={[styles.errorTitle, { color: themeColors.text }]}>{t('conversation.accessDenied')}</Text>
          <Text style={[styles.errorSubtext, { color: themeColors.textSecondary }]}>
            {t('conversation.accessDeniedMessage')}
          </Text>
          <Text style={[styles.errorSubtext, { color: themeColors.textMuted }]}>
            {t('conversation.redirecting')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ConversationHeader
          username={headerTitle}
          userId={otherUser?.id}
          userStatus={userStatus}
          statusText={getStatusText()}
          onBack={() => router.back()}
          themeColors={themeColors}
        />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            {isCreatingConversation ? t('conversation.startingConversation') : t('conversation.loadingMessages')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ConversationHeader
          username={headerTitle}
          userId={otherUser?.id}
          userStatus={userStatus}
          statusText={getStatusText()}
          onBack={() => router.back()}
          themeColors={themeColors}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{t('conversation.failedToLoad')}</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>{t('conversation.retry')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const canSend = (messageText.trim() || selectedImage) && !sendMutation.isPending && (conversationId || targetUserId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ConversationHeader
        username={headerTitle}
        userId={otherUser?.id}
        userStatus={userStatus}
        statusText={getStatusText()}
        onBack={() => router.back()}
        themeColors={themeColors}
      />

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
            <EmptyConversation themeColors={themeColors} />
          ) : (
            messages.map((message: Message, index: number) => {
              const isOwnMessage = message.sender_id === user?.id;
              const prevMessage = index > 0 ? messages[index - 1] : undefined;
              const showDateSeparator = needsDateSeparator(
                message.created_at,
                prevMessage?.created_at
              );

              return (
                <View key={message.id}>
                  {showDateSeparator && (
                    <DateSeparator
                      date={formatDateSeparator(message.created_at)}
                      themeColors={themeColors}
                    />
                  )}

                  <MessageBubble
                    message={message}
                    isOwnMessage={isOwnMessage}
                    senderAvatar={message.sender?.username?.charAt(0).toUpperCase() || '?'}
                    onImagePress={openImageViewer}
                    activeTheme={activeTheme}
                    themeColors={themeColors}
                  />
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Image Preview */}
        {selectedImage && (
          <View style={[styles.imagePreview, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
            <RNImage source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            <IconButton icon="close" size={20} onPress={clearImage} />
          </View>
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
          <Pressable 
            style={[styles.attachButton, { backgroundColor: themeColors.backgroundSecondary }]}
            onPress={pickImage}
          >
            <Text style={styles.attachIcon}>📎</Text>
          </Pressable>
          
          <View style={[styles.textInputContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
            <RNTextInput
              style={[styles.textInput, { color: themeColors.text }]}
              placeholder={t('conversation.typeMessage')}
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

      {/* Full-screen Image Viewer */}
      <ImageView
        images={viewerImages}
        imageIndex={viewerImageIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
      />
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

  // Center states
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
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

  // Image Preview
  imagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },

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
