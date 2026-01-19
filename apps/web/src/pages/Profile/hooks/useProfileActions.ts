import { useToastStore } from '@marketplace/shared';
import { apiClient } from '@marketplace/shared';
import { listingsApi, type Listing } from '@marketplace/shared';
import { reviewsApi } from '@marketplace/shared';
import { cancelTask, confirmTaskCompletion } from '@marketplace/shared';
import { deleteOffering, Offering } from '@marketplace/shared';
import type { Review } from '@marketplace/shared';

interface UseProfileActionsProps {
  setMyListings: React.Dispatch<React.SetStateAction<Listing[]>>;
  setMyOfferings: React.Dispatch<React.SetStateAction<Offering[]>>;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  fetchTasks: () => Promise<void>;
  fetchApplications: () => Promise<void>;
}

export const useProfileActions = ({
  setMyListings,
  setMyOfferings,
  setReviews,
  fetchTasks,
  fetchApplications,
}: UseProfileActionsProps) => {
  const toast = useToastStore();

  const handleDeleteListing = async (listingId: number) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      await listingsApi.delete(listingId);
      setMyListings(prev => prev.filter(l => l.id !== listingId));
      toast.success('Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  const handleDeleteOffering = async (offeringId: number) => {
    if (!window.confirm('Are you sure you want to delete this service offering?')) return;
    
    try {
      await deleteOffering(offeringId);
      setMyOfferings(prev => prev.filter(o => o.id !== offeringId));
      toast.success('Offering deleted successfully');
    } catch (error) {
      console.error('Error deleting offering:', error);
      toast.error('Failed to delete offering');
    }
  };

  const handleCancelTask = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to cancel this task?')) return;
    
    try {
      await cancelTask(taskId);
      toast.success('Task cancelled');
      fetchTasks();
    } catch (error) {
      console.error('Error cancelling task:', error);
      toast.error('Failed to cancel task');
    }
  };

  const handleConfirmTask = async (taskId: number) => {
    try {
      await confirmTaskCompletion(taskId);
      toast.success('Task marked as completed!');
      fetchTasks();
    } catch (error) {
      console.error('Error confirming task:', error);
      toast.error('Failed to confirm task');
    }
  };

  const handleWithdrawApplication = async (applicationId: number, taskId: number) => {
    if (!window.confirm('Are you sure you want to withdraw your application?')) return;
    
    try {
      await apiClient.delete(`/api/tasks/${taskId}/applications/${applicationId}`);
      toast.success('Application withdrawn successfully');
      fetchApplications();
    } catch (error: any) {
      console.error('Error withdrawing application:', error);
      toast.error(error?.response?.data?.error || 'Failed to withdraw application');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await reviewsApi.delete(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  return {
    handleDeleteListing,
    handleDeleteOffering,
    handleCancelTask,
    handleConfirmTask,
    handleWithdrawApplication,
    handleDeleteReview,
  };
};
