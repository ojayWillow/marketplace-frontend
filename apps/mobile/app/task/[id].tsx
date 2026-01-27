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
  
  // CRITICAL FIX: Wait for screen transition to complete before rendering content
  // This prevents the slide-in animation from affecting the content layout
  const [isTransitionComplete, setIsTransitionComplete] = useState(false);

  // Data fetching
  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: taskId > 0,
  });

  // Wait for screen transition animation to complete (250ms from _layout.tsx)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitionComplete(true);
    }, 300); // Slightly longer than animation duration
    return () => clearTimeout(timer);
  }, []);

  // All actions and mutations
  const actions = useTaskActions(taskId, task);

  // Computed values
  const isOwnTask = user?.id === task?.creator_id;
  const taskImages = parseTaskImages(task?.images, getImageUrl);
  
  // Show loading if data is loading OR transition isn't complete yet
  const showLoading = isLoading || !isTransitionComplete;

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
          headerTransparent: false,
          headerLargeTitle: false,
          title: '',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: '#f3f4f6',
          },
          headerShadowVisible: false,
          animation: 'none', // DISABLE animation on this specific screen
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

      {!showLoading && !error && task && (
        <TaskBottomBar task={task} taskId={taskId} actions={actions} />
      )}
    </View>
  );
}
