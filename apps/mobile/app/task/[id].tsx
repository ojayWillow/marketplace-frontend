import { View, ScrollView, InteractionManager } from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { Text, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { getTask, useAuthStore, getImageUrl } from '@marketplace/shared';
import { useState, useCallback } from 'react';

// Feature imports
import {
  TaskHeroCard,
  TaskImageGallery,
  TaskDescription,
  TaskNotices,
  TaskBottomBar,
  TaskReviewPrompt,
  TaskDisputeInfo,
  TaskProgressStepper,
} from '../../src/features/tasks/components/detail';
import { useTaskActions } from '../../src/features/tasks/hooks/useTaskActions';
import { styles, ACCENT_COLOR } from '../../src/features/tasks/styles/taskDetailStyles';
import { parseTaskImages } from '../../src/features/tasks/utils/taskHelpers';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user } = useAuthStore();
  
  // Wait for screen transition to complete before rendering content
  const [isScreenReady, setIsScreenReady] = useState(false);

  // Data fetching
  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: taskId > 0,
  });

  // CRITICAL: Wait for navigation animation to complete
  useFocusEffect(
    useCallback(() => {
      setIsScreenReady(false);
      const task = InteractionManager.runAfterInteractions(() => {
        setIsScreenReady(true);
      });
      return () => task.cancel();
    }, [])
  );

  // All actions and mutations
  const actions = useTaskActions(taskId, task);

  // Computed values
  const isOwnTask = user?.id === task?.creator_id;
  const taskImages = parseTaskImages(task?.images, getImageUrl);
  
  // Only show content when BOTH data is ready AND screen transition is complete
  const showContent = !isLoading && isScreenReady;

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
      <Stack.Screen
        options={{
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
            />
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {!showContent ? (
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

            {/* Progress Stepper - Shows workflow steps for involved users */}
            <TaskProgressStepper task={task} />

            <TaskImageGallery images={taskImages} />

            <TaskDescription task={task} onOpenMap={actions.handleOpenMap} />

            {/* Show dispute info if task has disputes */}
            {(task.status === 'disputed' || task.status === 'pending_confirmation') && (
              <TaskDisputeInfo taskId={taskId} />
            )}

            <TaskNotices task={task} />
          </>
        )}
      </ScrollView>

      {showContent && !error && task && (
        <TaskBottomBar task={task} taskId={taskId} actions={actions} />
      )}
    </View>
  );
}
