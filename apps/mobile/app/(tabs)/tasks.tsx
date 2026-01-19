import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { router } from 'expo-router';
import { tasksAPI, useAuthStore } from '@marketplace/shared';

type FilterTab = 'all' | 'my_tasks' | 'applied';

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { user } = useAuthStore();

  // Fetch tasks based on active tab
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['tasks', activeTab, user?.id],
    queryFn: async () => {
      let response;
      
      if (activeTab === 'my_tasks' && user) {
        // Fetch tasks created by the user
        response = await tasksAPI.getUserTasks(user.id);
      } else if (activeTab === 'applied' && user) {
        // Fetch tasks user has applied to
        response = await tasksAPI.getAppliedTasks();
      } else {
        // Fetch all tasks
        response = await tasksAPI.getTasks({ page: 1, limit: 20 });
      }
      
      return response.data;
    },
    enabled: activeTab !== 'my_tasks' && activeTab !== 'applied' || !!user,
  });

  const tasks = data?.tasks || data || [];

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All Tasks' },
    { id: 'my_tasks', label: 'My Tasks' },
    { id: 'applied', label: 'Applied' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Tasks</Text>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-3"
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className="mr-4"
            >
              <View
                className={`pb-2 ${
                  activeTab === tab.id ? 'border-b-2 border-primary-500' : ''
                }`}
              >
                <Text
                  className={`text-base ${
                    activeTab === tab.id
                      ? 'text-primary-500 font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View className="p-4">
          {/* Loading State */}
          {isLoading && (
            <View className="items-center py-12">
              <Text className="text-gray-500">Loading tasks...</Text>
            </View>
          )}

          {/* Error State */}
          {isError && (
            <View className="items-center py-12">
              <Text className="text-red-500 mb-2">Failed to load tasks</Text>
              <Pressable onPress={() => refetch()} className="bg-primary-500 px-4 py-2 rounded-lg">
                <Text className="text-white font-semibold">Retry</Text>
              </Pressable>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !isError && tasks.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-4xl mb-2">📋</Text>
              <Text className="text-gray-500 text-center">
                {activeTab === 'my_tasks'
                  ? 'You haven\'t created any tasks yet'
                  : activeTab === 'applied'
                  ? 'You haven\'t applied to any tasks yet'
                  : 'No tasks available'}
              </Text>
            </View>
          )}

          {/* Tasks List */}
          {!isLoading && !isError && tasks.length > 0 && (
            <>
              {tasks.map((task: any) => (
                <Pressable
                  key={task.id}
                  onPress={() => router.push(`/task/${task.id}`)}
                  className="bg-white rounded-xl p-4 mb-3 border border-gray-100 active:bg-gray-50"
                >
                  {/* Header */}
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-2">
                      <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
                        {task.title}
                      </Text>
                      {task.category && (
                        <Text className="text-primary-500 text-sm mt-1">
                          {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                        </Text>
                      )}
                    </View>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        task.status === 'open'
                          ? 'bg-green-100'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          task.status === 'open'
                            ? 'text-green-700'
                            : task.status === 'in_progress'
                            ? 'text-blue-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {task.status === 'open'
                          ? 'Open'
                          : task.status === 'in_progress'
                          ? 'In Progress'
                          : 'Closed'}
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  <Text className="text-gray-600 mb-3" numberOfLines={2}>
                    {task.description}
                  </Text>

                  {/* Footer */}
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Text className="text-primary-500 font-bold mr-4">
                        €{task.budget ? task.budget.toFixed(2) : '0.00'}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        📍 {task.location?.city || 'Location'}
                      </Text>
                    </View>
                    {task.responses_count !== undefined && (
                      <Text className="text-gray-400 text-sm">
                        👥 {task.responses_count} {task.responses_count === 1 ? 'applicant' : 'applicants'}
                      </Text>
                    )}
                  </View>

                  {/* Due Date */}
                  {task.due_date && (
                    <Text className="text-gray-400 text-xs mt-2">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </Text>
                  )}
                </Pressable>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
