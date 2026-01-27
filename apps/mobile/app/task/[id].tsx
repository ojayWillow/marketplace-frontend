import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { getTask, useAuthStore, getImageUrl } from '@marketplace/shared';

// Feature imports
import {
  TaskHeroCard,
  TaskImageGallery,
  TaskDescription,
  TaskNotices,
  TaskBottomBar,
  TaskReviewPrompt,
} from '../../src/features/tasks/components/detail';
import { useTaskActions } from '../../src/features/tasks/hooks/useTaskActions';
import { styles, ACCENT_COLOR } from '../../src/features/tasks/styles/taskDetailStyles';
import { parseTaskImages } from '../../src/features/tasks/utils/taskHelpers';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user } = useAuthStore();

  // Data fetching
  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: taskId > 0,
  });

  // All actions and mutations
  const actions = useTaskActions(taskId, task);

  // Computed values
  const isOwnTask = user?.id === task?.creator_id;
  const taskImages = parseTaskImages(task?.images, getImageUrl);

  // Loading state - use same SafeAreaView edges to prevent layout shift
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ headerShown: true, title: 'Task Details', headerBackTitle: 'Back' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ACCENT_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !task) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ headerShown: true, title: 'Task Details', headerBackTitle: 'Back' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Task not found</Text>
          <Button mode="contained" onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  // Review prompt after completion
  if (actions.showReviewPrompt) {
    return (
      <TaskReviewPrompt 
        taskId={taskId} 
        onSkip={() => actions.setShowReviewPrompt(false)} 
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Task Details', 
          headerBackTitle: 'Back',
          headerRight: () => (
            <IconButton 
              icon="share-variant" 
              iconColor={ACCENT_COLOR} 
              size={24} 
              onPress={actions.handleShare} 
            />
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TaskHeroCard 
          task={task} 
          isOwnTask={isOwnTask}
          onMessage={actions.handleMessage}
          onReport={actions.handleReport}
          onViewProfile={actions.handleViewProfile}
        />

        <TaskImageGallery images={taskImages} />

        <TaskDescription 
          task={task} 
          onOpenMap={actions.handleOpenMap} 
        />

        <TaskNotices task={task} />
      </ScrollView>

      <TaskBottomBar 
        task={task} 
        taskId={taskId} 
        actions={actions} 
      />
    </SafeAreaView>
  );
}
