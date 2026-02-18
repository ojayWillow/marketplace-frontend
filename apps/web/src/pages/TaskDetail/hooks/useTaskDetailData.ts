import { useState, useEffect, useCallback } from 'react';
import { TaskApplication, getTaskApplications, getOfferings, Offering, apiClient } from '@marketplace/shared';
import { Review, CanReviewResponse } from '../types';
import { Task } from '@marketplace/shared';

interface UseTaskDetailDataProps {
  taskId: number;
  task: Task | undefined;
  userId: number | undefined;
  isAuthenticated: boolean;
}

export const useTaskDetailData = ({
  taskId,
  task,
  userId,
  isAuthenticated,
}: UseTaskDetailDataProps) => {
  // Applications
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  // Recommended helpers
  const [recommendedHelpers, setRecommendedHelpers] = useState<Offering[]>([]);
  const [helpersLoading, setHelpersLoading] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState<CanReviewResponse | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setApplicationsLoading(true);
      const response = await getTaskApplications(taskId);
      setApplications(response.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  }, [taskId]);

  const fetchRecommendedHelpers = useCallback(async () => {
    if (!task || !task.latitude || !task.longitude) return;
    try {
      setHelpersLoading(true);
      const response = await getOfferings({
        category: task.category,
        latitude: task.latitude,
        longitude: task.longitude,
        radius: 50,
        status: 'active',
        per_page: 6,
      });
      const filtered = (response.offerings || []).filter(
        (o) => o.creator_id !== task.creator_id
      );
      setRecommendedHelpers(filtered);
    } catch (error) {
      console.error('Error fetching recommended helpers:', error);
    } finally {
      setHelpersLoading(false);
    }
  }, [task]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await apiClient.get(`/api/reviews/task/${taskId}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [taskId]);

  const checkCanReview = useCallback(async () => {
    try {
      const response = await apiClient.get(
        `/api/reviews/task/${taskId}/can-review`
      );
      setCanReview(response.data);
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  }, [taskId]);

  // Fetch applications + helpers when owner views an open task
  useEffect(() => {
    if (task && userId === task.creator_id && task.status === 'open') {
      fetchApplications();
      fetchRecommendedHelpers();
    }
    if (task && task.status === 'completed') {
      fetchReviews();
      if (isAuthenticated) {
        checkCanReview();
      }
    }
  }, [task, userId, isAuthenticated, fetchApplications, fetchRecommendedHelpers, fetchReviews, checkCanReview]);

  return {
    applications,
    applicationsLoading,
    fetchApplications,
    recommendedHelpers,
    helpersLoading,
    reviews,
    canReview,
    fetchReviews,
    checkCanReview,
  };
};
