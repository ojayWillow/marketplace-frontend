import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, Avatar, TextInput, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, createTaskReview, canReviewTask, useAuthStore } from '@marketplace/shared';
import { useState } from 'react';
import { useThemeStore } from '../../../src/stores/themeStore';
import { colors } from '../../../src/theme';

const MIN_REVIEW_LENGTH = 10;

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.backgroundSecondary,
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
      fontSize: 64,
      marginBottom: 20,
    },
    errorTitle: {
      fontWeight: 'bold',
      color: themeColors.text,
      marginBottom: 12,
      fontSize: 22,
    },
    errorText: {
      color: themeColors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      fontSize: 15,
      lineHeight: 22,
    },
    backButton: {
      minWidth: 140,
      backgroundColor: '#0ea5e9',
    },
    taskCard: {
      backgroundColor: themeColors.card,
      padding: 16,
      margin: 16,
      marginBottom: 0,
      borderRadius: 12,
    },
    taskLabel: {
      color: themeColors.textSecondary,
      marginBottom: 4,
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    taskTitle: {
      fontWeight: '600',
      color: themeColors.text,
      fontSize: 16,
    },
    section: {
      backgroundColor: themeColors.card,
      padding: 20,
      marginTop: 16,
      marginHorizontal: 16,
      borderRadius: 12,
    },
    sectionTitle: {
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 16,
      fontSize: 17,
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
      color: themeColors.text,
      fontSize: 18,
    },
    revieweeRole: {
      color: themeColors.textSecondary,
      marginTop: 4,
      fontSize: 14,
    },
    ratingHint: {
      color: themeColors.textMuted,
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
      color: themeColors.border,
    },
    starFilled: {
      color: '#fbbf24',
    },
    ratingLabel: {
      textAlign: 'center',
      marginTop: 8,
      color: themeColors.text,
      fontWeight: '500',
      fontSize: 16,
    },
    textInput: {
      backgroundColor: themeColors.card,
      minHeight: 120,
    },
    textInputOutline: {
      borderColor: themeColors.border,
    },
    charCount: {
      marginTop: 8,
      color: themeColors.textMuted,
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
      backgroundColor: themeColors.card,
      padding: 16,
      paddingBottom: 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    submitButton: {
      borderRadius: 12,
      backgroundColor: '#0ea5e9',
    },
    submitButtonContent: {
      paddingVertical: 8,
    },
  });

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
          <Text style={styles.errorIcon}>🔍</Text>
          <Text style={styles.errorTitle}>Task not found</Text>
          <Text style={styles.errorText}>This task could not be loaded. It may have been deleted or you don't have permission to view it.</Text>
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
          <Text style={styles.errorTitle}>
            {canReview?.existing_review ? 'Already Reviewed' : 'Cannot Review'}
          </Text>
          <Text style={styles.errorText}>
            {canReview?.existing_review 
              ? 'You have already reviewed this task'
              : (canReview?.reason || 'You cannot review this task at this time.')}
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
          <Text style={styles.taskLabel}>Task</Text>
          <Text style={styles.taskTitle}>{task.title}</Text>
        </Surface>

        {/* Reviewee Card */}
        <Surface style={styles.section} elevation={0}>
          <Text style={styles.sectionTitle}>
            Review {revieweeRole === 'worker' ? 'Worker' : 'Client'}
          </Text>
          <View style={styles.revieweeRow}>
            <Avatar.Text 
              size={56} 
              label={revieweeName?.charAt(0).toUpperCase() || 'U'} 
              style={styles.avatar}
            />
            <View style={styles.revieweeInfo}>
              <Text style={styles.revieweeName}>
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
          <Text style={styles.sectionTitle}>Rating</Text>
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
          <Text style={styles.sectionTitle}>Your Review</Text>
          <TextInput
            mode="outlined"
            placeholder="Share your experience..."
            placeholderTextColor={themeColors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={5}
            style={styles.textInput}
            outlineStyle={styles.textInputOutline}
            textColor={themeColors.text}
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
