import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Tasks</Text>
        
        {/* Filter Tabs */}
        <View className="flex-row mt-4 gap-2">
          {[
            { key: 'all', label: 'All Tasks' },
            { key: 'my', label: 'My Tasks' },
            { key: 'applied', label: 'Applied' },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full ${
                activeTab === tab.key
                  ? 'bg-primary-500'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                className={`font-medium ${
                  activeTab === tab.key ? 'text-white' : 'text-gray-600'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Task cards */}
        {[1, 2, 3, 4].map((i) => (
          <Pressable
            key={i}
            className="bg-white rounded-xl p-4 mb-3 border border-gray-100 active:bg-gray-50"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">Task Title {i}</Text>
                <Text className="text-gray-500 mt-1" numberOfLines={2}>
                  Looking for someone to help with this task...
                </Text>
              </View>
              <View className="bg-green-100 px-2 py-1 rounded">
                <Text className="text-green-700 text-sm font-medium">Open</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-gray-100">
              <Text className="text-primary-500 font-bold">€{i * 30}</Text>
              <Text className="text-gray-400 text-sm">📍 2.{i} km away</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* FAB for creating new task */}
      <Pressable className="absolute bottom-6 right-6 w-14 h-14 bg-primary-500 rounded-full items-center justify-center shadow-lg active:bg-primary-600">
        <Text className="text-white text-2xl">+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
