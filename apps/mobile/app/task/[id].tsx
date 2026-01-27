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

  // Header options - ALWAYS CONSISTENT to prevent layout shift
  // Share button always present, just disabled/hidden when loading
  const headerOptions = {
    headerShown: true,
    title: '',
    headerBackTitle: 'Back',
    headerRight: () => (
      <IconButton
        icon="share-variant"
        iconColor={ACCENT_COLOR}
        size={24}
        onPress={task ? actions.handleShare : undefined}
        disabled={!task}
        style={{ opacity: task ? 1 : 0 }}
      />
    ),
  };

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
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <Stack.Screen options={headerOptions} />
      
      <SafeAreaView 
        style={styles.container} 
        edges={['bottom']} 
      >
        {/* Main ScrollView - ALWAYS present */}
        {/* CRITICAL FIX: contentInsetAdjustmentBehavior="never" prevents iOS */}
        {/* from automatically adjusting content insets when header appears, */}
        {/* which causes the "content behind header then slides down" issue */}
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          automaticallyAdjustsScrollIndicatorInsets={false}
        >
          {isLoading ? (
            // Loading state - show centered spinner INSIDE the scroll view
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={ACCENT_COLOR} />
            </View>
          ) : error || !task ? (
            // Error state - show error INSIDE the scroll view
            <View style={styles.centered}>
              <Text style={styles.errorText}>Task not found</Text>
              <Button mode="contained" onPress={() => router.back()}>Go Back</Button>
            </View>
          ) : (
            // Success state - render task content
            <>
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
            </>
          )}
        </ScrollView>

        {/* Bottom bar - ALWAYS present */}
        {/* Only render TaskBottomBar when we have task data */}
        {!isLoading && !error && task && (
          <TaskBottomBar
            task={task}
            taskId={taskId}
            actions={actions}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
