import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Text, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { getTask, useAuthStore, getImageUrl } from '@marketplace/shared';
import { useState, useEffect } from 'react';

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
  
  // CRITICAL FIX: Force minimum render delay to allow layout to stabilize
  // This prevents content jumping when React Query returns cached data instantly
  const [isRenderReady, setIsRenderReady] = useState(false);

  // Data fetching
  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: taskId > 0,
  });

  // Wait for next frame before rendering content
  // This gives iOS time to calculate header layout
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsRenderReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // All actions and mutations
  const actions = useTaskActions(taskId, task);

  // Computed values
  const isOwnTask = user?.id === task?.creator_id;
  const taskImages = parseTaskImages(task?.images, getImageUrl);
  
  // Show loading if data is loading OR layout isn't ready yet
  const showLoading = isLoading || !isRenderReady;

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
    <View style={styles.container}>
      {/* CRITICAL: Header configuration must be STATIC to prevent layout recalculation */}
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: false,
          headerLargeTitle: false,
          title: '',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: '#f3f4f6',
          },
          headerShadowVisible: false,
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
        }}
      />

      {/* Main ScrollView */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
      >
        {showLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={ACCENT_COLOR} />
          </View>
        ) : error || !task ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>Task not found</Text>
            <Button mode="contained" onPress={() => router.back()}>
              Go Back
            </Button>
          </View>
        ) : (
          <>
            <TaskHeroCard
              task={task}
              isOwnTask={isOwnTask}
              onMessage={actions.handleMessage}
              onReport={actions.handleReport}
              onViewProfile={actions.handleViewProfile}
            />

            <TaskImageGallery images={taskImages} />

            <TaskDescription task={task} onOpenMap={actions.handleOpenMap} />

            <TaskNotices task={task} />
          </>
        )}
      </ScrollView>

      {/* Bottom bar */}
      {!showLoading && !error && task && (
        <TaskBottomBar task={task} taskId={taskId} actions={actions} />
      )}
    </View>
  );
}
