import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { messagesAPI, useAuthStore } from '@marketplace/shared';

export default function MessagesScreen() {
  const { user, isAuthenticated } = useAuthStore();

  // Fetch conversations
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      const response = await messagesAPI.getConversations();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const conversations = data?.conversations || [];

  // Not logged in state
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-white px-4 py-4 border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">Messages</Text>
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-4xl mb-4">💬</Text>
          <Text className="text-xl font-semibold text-gray-900 mb-2">Sign In to View Messages</Text>
          <Text className="text-gray-500 text-center mb-6">
            Log in to start conversations and see your messages
          </Text>
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            className="bg-primary-500 px-8 py-3 rounded-xl active:bg-primary-600"
          >
            <Text className="text-white font-semibold">Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Messages</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Loading State */}
        {isLoading && (
          <View className="items-center py-12">
            <Text className="text-gray-500">Loading conversations...</Text>
          </View>
        )}

        {/* Error State */}
        {isError && (
          <View className="items-center py-12">
            <Text className="text-red-500 mb-2">Failed to load messages</Text>
            <Pressable onPress={() => refetch()} className="bg-primary-500 px-4 py-2 rounded-lg">
              <Text className="text-white font-semibold">Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !isError && conversations.length === 0 && (
          <View className="items-center py-12">
            <Text className="text-4xl mb-2">💬</Text>
            <Text className="text-gray-500 text-center">
              No conversations yet.{' \n'}Start by contacting someone!
            </Text>
          </View>
        )}

        {/* Conversations List */}
        {!isLoading && !isError && conversations.length > 0 && (
          <View className="bg-white">
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
                  className={`flex-row p-4 active:bg-gray-50 ${
                    !isLastItem ? 'border-b border-gray-100' : ''
                  }`}
                >
                  {/* Avatar */}
                  <View className="w-12 h-12 rounded-full bg-primary-500 items-center justify-center mr-3">
                    <Text className="text-white text-lg font-bold">
                      {otherUser?.username?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    {/* Name and Time */}
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                        {otherUser?.username || 'Unknown User'}
                      </Text>
                      {lastMessage?.created_at && (
                        <Text className="text-xs text-gray-400 ml-2">
                          {formatMessageTime(lastMessage.created_at)}
                        </Text>
                      )}
                    </View>

                    {/* Last Message */}
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`flex-1 text-sm ${
                          unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}
                        numberOfLines={1}
                      >
                        {lastMessage?.content || 'No messages yet'}
                      </Text>
                      
                      {/* Unread Badge */}
                      {unreadCount > 0 && (
                        <View className="bg-primary-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 ml-2">
                          <Text className="text-white text-xs font-bold">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to format message time
function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
