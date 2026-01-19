import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function MessagesScreen() {
  const conversations = [
    { id: 1, name: 'John Doe', lastMessage: 'Sure, I can help with that!', time: '2m ago', unread: true },
    { id: 2, name: 'Jane Smith', lastMessage: 'Thanks for your offer', time: '1h ago', unread: false },
    { id: 3, name: 'Mike Johnson', lastMessage: 'When are you available?', time: '3h ago', unread: false },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Messages</Text>
      </View>

      <ScrollView className="flex-1">
        {conversations.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-400 text-lg">No messages yet</Text>
            <Text className="text-gray-400 mt-2">Start a conversation!</Text>
          </View>
        ) : (
          conversations.map((conversation) => (
            <Pressable
              key={conversation.id}
              onPress={() => router.push(`/conversation/${conversation.id}`)}
              className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center active:bg-gray-50"
            >
              {/* Avatar */}
              <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
                <Text className="text-primary-600 font-semibold text-lg">
                  {conversation.name.charAt(0)}
                </Text>
              </View>
              
              {/* Content */}
              <View className="flex-1">
                <View className="flex-row justify-between items-center">
                  <Text className={`font-semibold ${conversation.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {conversation.name}
                  </Text>
                  <Text className="text-gray-400 text-sm">{conversation.time}</Text>
                </View>
                <Text
                  className={`mt-1 ${conversation.unread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
                  numberOfLines={1}
                >
                  {conversation.lastMessage}
                </Text>
              </View>
              
              {/* Unread indicator */}
              {conversation.unread && (
                <View className="w-3 h-3 bg-primary-500 rounded-full ml-2" />
              )}
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
