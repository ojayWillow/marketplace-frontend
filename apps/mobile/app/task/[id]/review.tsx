import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, Avatar, TextInput, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, createTaskReview, canReviewTask, useAuthStore } from '@marketplace/shared';
import { useState } from 'react';

const MIN_REVIEW_LENGTH = 10;

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: taskId > 0,
  });

  const { data: canReview, isLoading: canReviewLoading } = useQuery({
    queryKey: ['canReviewTask', taskId],
    queryFn: () => canReviewTask(taskId),
    enabled: taskId > 0,
  });

  const reviewMutation = useMutation({
    mutationFn: () => createTaskReview(taskId, { rating, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['canReviewTask', taskId] });
      Alert.alert(
        'Review Submitted',
        'Thank you for your feedback!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to submit review.';
      Alert.alert('Error', message);
    },
  });

  const isLoading = taskLoading || canReviewLoading;

  const isOwnTask = user?.id === task?.creator_id;
  const revieweeName = isOwnTask ? task?.assigned_to_name : task?.creator_name;
  const revieweeRole = isOwnTask ? 'worker' : 'client';

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }
    if (content.trim().length < MIN_REVIEW_LENGTH) {
      Alert.alert('Review Required', `Please write a review (at least ${MIN_REVIEW_LENGTH} characters).`);
      return;
    }
    reviewMutation.mutate();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Leave Review' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Leave Review' }} />
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorText}>Task not found</Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!canReview?.can_review) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Leave Review' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📝</Text>
          <Text variant="titleLarge" style={styles.errorTitle}>
            {canReview?.existing_review ? 'Already Reviewed' : 'Cannot Review'}
          </Text>
          <Text style={styles.errorText}>
            {canReview?.reason || 'You cannot review this task.'}
          </Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Leave Review',
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Task Info */}
        <Surface style={styles.taskCard} elevation={1}>
          <Text variant="labelMedium" style={styles.taskLabel}>Task</Text>
          <Text variant="titleMedium" style={styles.taskTitle}>{task.title}</Text>
        </Surface>

        {/* Reviewee Card */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Review {revieweeRole === 'worker' ? 'Worker' : 'Client'}
          </Text>
          <View style={styles.revieweeRow}>
            <Avatar.Text 
              size={56} 
              label={revieweeName?.charAt(0).toUpperCase() || 'U'} 
              style={styles.avatar}
            />
            <View style={styles.revieweeInfo}>
              <Text variant="titleLarge" style={styles.revieweeName}>
                {revieweeName || 'Unknown'}
              </Text>
              <Text style={styles.revieweeRole}>
                {revieweeRole === 'worker' ? '🛠️ Completed the task' : '📋 Posted the task'}
              </Text>
            </View>
          </View>
        </Surface>

        {/* Star Rating */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Rating</Text>
          <Text style={styles.ratingHint}>Tap a star to rate</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
                activeOpacity={0.7}
              >
                <Text style={[styles.star, star <= rating && styles.starFilled]}>
                  {star <= rating ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 ? (
            <Text style={styles.ratingLabel}>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </Text>
          ) : null}
        </Surface>

        {/* Review Text */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Your Review</Text>
          <TextInput
            mode="outlined"
            placeholder="Share your experience..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={5}
            style={styles.textInput}
            outlineStyle={styles.textInputOutline}
          />
          <Text style={[
            styles.charCount,
            content.trim().length < MIN_REVIEW_LENGTH && content.length > 0 && styles.charCountError
          ]}>
            {content.trim().length}/{MIN_REVIEW_LENGTH} minimum characters
          </Text>
        </Surface>

        {/* Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Submit Button */}
      <Surface style={styles.bottomBar} elevation={4}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={reviewMutation.isPending}
          disabled={reviewMutation.isPending || rating === 0 || content.trim().length < MIN_REVIEW_LENGTH}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Submit Review
        </Button>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  errorText: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    minWidth: 120,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
  },
  taskLabel: {
    color: '#6b7280',
    marginBottom: 4,
  },
  taskTitle: {
    fontWeight: '600',
    color: '#1f2937',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  revieweeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#0ea5e9',
    marginRight: 16,
  },
  revieweeInfo: {
    flex: 1,
  },
  revieweeName: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  revieweeRole: {
    color: '#6b7280',
    marginTop: 4,
  },
  ratingHint: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 40,
    color: '#d1d5db',
  },
  starFilled: {
    color: '#fbbf24',
  },
  ratingLabel: {
    textAlign: 'center',
    marginTop: 8,
    color: '#1f2937',
    fontWeight: '500',
    fontSize: 16,
  },
  textInput: {
    backgroundColor: '#ffffff',
    minHeight: 120,
  },
  textInputOutline: {
    borderColor: '#e5e7eb',
  },
  charCount: {
    marginTop: 8,
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'right',
  },
  charCountError: {
    color: '#ef4444',
  },
  bottomSpacer: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    paddingBottom: 32,
  },
  submitButton: {
    borderRadius: 12,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});
