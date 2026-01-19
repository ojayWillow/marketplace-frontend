import { View, ScrollView, RefreshControl, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, Button, Surface, Avatar, Badge } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { messagesAPI, useAuthStore } from '@marketplace/shared';

export default function MessagesScreen() {
  const { user, isAuthenticated } = useAuthStore();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      const response = await messagesAPI.getConversations();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const conversations = data?.conversations || [];

  // Not logged in
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Surface style={styles.header} elevation={1}>
          <Text variant="headlineMedium" style={styles.title}>Messages</Text>
        </Surface>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text variant="titleLarge" style={styles.signInTitle}>Sign In to View Messages</Text>
          <Text style={styles.signInSubtitle}>
            Log in to start conversations and see your messages
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(auth)/login')}
            style={styles.signInButton}
          >
            Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>Messages</Text>
      </Surface>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Loading */}
        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.statusText}>Loading conversations...</Text>
          </View>
        )}

        {/* Error */}
        {isError && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Failed to load messages</Text>
            <Button mode="contained" onPress={() => refetch()}>
              Retry
            </Button>
          </View>
        )}

        {/* Empty */}
        {!isLoading && !isError && conversations.length === 0 && (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.statusText}>
              No conversations yet.{"\n"}Start by contacting someone!
            </Text>
          </View>
        )}

        {/* Conversations List */}
        {!isLoading && !isError && conversations.length > 0 && (
          <Surface style={styles.listContainer} elevation={0}>
            {conversations.map((conversation: any, index: number) => {
              const otherUser = conversation.participants?.find(
                (p: any) => p.id !== user?.id
              );
              const lastMessage = conversation.last_message;
              const unreadCount = conversation.unread_count || 0;
              const isLastItem = index === conversations.length - 1;

              return (
                <Pressable
                  key={conversation.id}
                  onPress={() => router.push(`/conversation/${conversation.id}`)}
                  style={({ pressed }) => [
                    styles.conversationItem,
                    !isLastItem && styles.conversationBorder,
                    pressed && styles.conversationPressed,
                  ]}
                >
                  {/* Avatar */}
                  <Avatar.Text
                    size={48}
                    label={otherUser?.username?.charAt(0).toUpperCase() || '?'}
                    style={styles.avatar}
                  />

                  {/* Content */}
                  <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                      <Text variant="titleMedium" style={styles.username} numberOfLines={1}>
                        {otherUser?.username || 'Unknown User'}
                      </Text>
                      {lastMessage?.created_at && (
                        <Text style={styles.time}>
                          {formatMessageTime(lastMessage.created_at)}
                        </Text>
                      )}
                    </View>

                    <View style={styles.messageRow}>
                      <Text
                        style={[
                          styles.lastMessage,
                          unreadCount > 0 && styles.unreadMessage,
                        ]}
                        numberOfLines={1}
                      >
                        {lastMessage?.content || 'No messages yet'}
                      </Text>

                      {unreadCount > 0 && (
                        <Badge style={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </Surface>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  signInTitle: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  signInSubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    paddingHorizontal: 24,
  },
  statusText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
  },
  listContainer: {
    backgroundColor: '#ffffff',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  conversationBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  conversationPressed: {
    backgroundColor: '#f9fafb',
  },
  avatar: {
    marginRight: 12,
    backgroundColor: '#0ea5e9',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    flex: 1,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  unreadMessage: {
    color: '#1f2937',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#0ea5e9',
    marginLeft: 8,
  },
});
