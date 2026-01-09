import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import apiClient from '../api/client';
import { listingsApi, type Listing } from '../api/listings';
import { reviewsApi } from '../api/reviews';
import { getImageUrl, uploadImage } from '../api/uploads';
import { Task, TaskApplication, getCreatedTasks, getMyApplications, cancelTask, confirmTaskCompletion } from '../api/tasks';
import { getMyOfferings, deleteOffering, Offering, getOfferings } from '../api/offerings';
import { getCategoryIcon, getCategoryLabel } from '../constants/categories';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
  profile_picture_url?: string;
  is_verified: boolean;
  reputation_score: number;
  completion_rate: number;
  reviews_count?: number;
  average_rating?: number;
  tasks_completed?: number;
  created_at: string;
}

interface Review {
  id: number;
  rating: number;
  content?: string;
  reviewer_id: number;
  reviewer_name: string;
  reviewer_avatar?: string;
  review_type?: string;
  created_at: string;
}

// Match count for tasks
interface TaskMatchCounts {
  [taskId: number]: number;
}

// Pre-made avatar options using DiceBear API
const AVATAR_STYLES = [
  { id: 'avataaars', name: 'Cartoon' },
  { id: 'bottts', name: 'Robot' },
  { id: 'fun-emoji', name: 'Emoji' },
  { id: 'lorelei', name: 'Artistic' },
  { id: 'micah', name: 'Simple' },
  { id: 'notionists', name: 'Minimalist' },
  { id: 'personas', name: 'Person' },
  { id: 'adventurer', name: 'Adventure' },
];

// Generate avatar URL from DiceBear
const generateAvatarUrl = (style: string, seed: string) => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};

type ActiveTab = 'about' | 'listings' | 'offerings' | 'tasks' | 'reviews';
type TaskViewMode = 'my-tasks' | 'my-jobs';
type TaskStatusFilter = 'all' | 'active' | 'completed';

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user, setAuth, token } = useAuthStore();
  const toast = useToastStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myOfferings, setMyOfferings] = useState<Offering[]>([]);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [myApplications, setMyApplications] = useState<TaskApplication[]>([]);
  const [taskMatchCounts, setTaskMatchCounts] = useState<TaskMatchCounts>({});
  const [expandedMatchHint, setExpandedMatchHint] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [reviewEditData, setReviewEditData] = useState<{ rating: number; content: string }>({ rating: 5, content: '' });
  const [showMapTipDismissed, setShowMapTipDismissed] = useState(() => {
    return localStorage.getItem('mapTipDismissed') === 'true';
  });
  
  // Read state from URL params with defaults
  const activeTab = (searchParams.get('tab') as ActiveTab) || 'about';
  const taskViewMode = (searchParams.get('view') as TaskViewMode) || 'my-tasks';
  const taskStatusFilter = (searchParams.get('status') as TaskStatusFilter) || 'all';

  // Helper to update URL params
  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  // Tab/filter setters that update URL
  const setActiveTab = (tab: ActiveTab) => {
    updateParams({ tab, view: '', status: '' });
  };

  const setTaskViewMode = (view: TaskViewMode) => {
    updateParams({ view, status: 'all' });
  };

  const setTaskStatusFilter = (status: TaskStatusFilter) => {
    updateParams({ status });
  };
  
  // Avatar picker state
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState('avataaars');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone: '',
    city: '',
    country: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchMyListings();
    fetchMyOfferings();
    fetchTasks();
    fetchApplications();
  }, [isAuthenticated]);

  useEffect(() => {
    // Set initial avatar seed from username
    if (profile?.username) {
      setAvatarSeed(profile.username);
    }
  }, [profile?.username]);

  // Fetch match counts when tasks are loaded
  useEffect(() => {
    if (createdTasks.length > 0 && user?.id) {
      fetchMatchCountsForTasks();
    }
  }, [createdTasks, user?.id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/auth/profile');
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        bio: response.data.bio || '',
        phone: response.data.phone || '',
        city: response.data.city || '',
        country: response.data.country || '',
        avatar_url: response.data.avatar_url || response.data.profile_picture_url || '',
      });
      
      // Fetch reviews
      if (response.data.id) {
        const reviewsResponse = await apiClient.get(`/api/auth/users/${response.data.id}/reviews`);
        setReviews(reviewsResponse.data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    try {
      setListingsLoading(true);
      const response = await listingsApi.getMy();
      setMyListings(response.listings || []);
    } catch (error) {
      console.error('Error fetching my listings:', error);
    } finally {
      setListingsLoading(false);
    }
  };

  const fetchMyOfferings = async () => {
    try {
      setOfferingsLoading(true);
      const response = await getMyOfferings();
      setMyOfferings(response.offerings || []);
    } catch (error) {
      console.error('Error fetching my offerings:', error);
    } finally {
      setOfferingsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const created = await getCreatedTasks();
      setCreatedTasks(created.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      const response = await getMyApplications();
      setMyApplications(response.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Fetch match counts for open tasks
  const fetchMatchCountsForTasks = async () => {
    const openTasks = createdTasks.filter(t => t.status === 'open' && t.latitude && t.longitude);
    if (openTasks.length === 0) return;

    const counts: TaskMatchCounts = {};
    
    // Fetch in parallel for all open tasks
    await Promise.all(openTasks.map(async (task) => {
      try {
        const response = await getOfferings({
          category: task.category,
          latitude: task.latitude!,
          longitude: task.longitude!,
          radius: 50,
          status: 'active',
          per_page: 10
        });
        // Filter out own offerings
        const filtered = (response.offerings || []).filter(o => o.creator_id !== user?.id);
        counts[task.id] = filtered.length;
      } catch (error) {
        console.error(`Error fetching matches for task ${task.id}:`, error);
        counts[task.id] = 0;
      }
    }));

    setTaskMatchCounts(counts);
  };

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

  const handleEditReview = (review: Review) => {
    setEditingReview(review.id);
    setReviewEditData({ rating: review.rating, content: review.content || '' });
  };

  const handleSaveReview = async (reviewId: number) => {
    try {
      await reviewsApi.update(reviewId, reviewEditData);
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, ...reviewEditData } : r
      ));
      setEditingReview(null);
      toast.success('Review updated successfully');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
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

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put('/api/auth/profile', formData);
      setProfile(response.data.user);
      
      if (token) {
        setAuth(response.data.user, token);
      }
      
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Avatar functions
  const handleSelectGeneratedAvatar = () => {
    const avatarUrl = generateAvatarUrl(selectedAvatarStyle, avatarSeed);
    setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
    setShowAvatarPicker(false);
  };

  const handleRandomizeSeed = () => {
    const randomSeed = Math.random().toString(36).substring(2, 10);
    setAvatarSeed(randomSeed);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const result = await uploadImage(file);
      const imageUrl = getImageUrl(result.url);
      setFormData(prev => ({ ...prev, avatar_url: imageUrl }));
      setShowAvatarPicker(false);
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDismissMapTip = () => {
    setShowMapTipDismissed(true);
    localStorage.setItem('mapTipDismissed', 'true');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderEditableStars = (rating: number, onChange: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
      case 'open':
        return 'bg-green-100 text-green-700';
      case 'sold':
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'assigned':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'pending_confirmation':
      case 'pending':
        return 'bg-purple-100 text-purple-700';
      case 'cancelled':
      case 'expired':
      case 'rejected':
      case 'paused':
        return 'bg-gray-100 text-gray-700';
      case 'disputed':
        return 'bg-red-100 text-red-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get tasks for current view mode
  const getDisplayTasks = () => {
    if (taskViewMode === 'my-tasks') {
      // Tasks I created
      return createdTasks.filter(task => {
        if (taskStatusFilter === 'active') {
          return ['open', 'assigned', 'in_progress', 'pending_confirmation'].includes(task.status);
        }
        if (taskStatusFilter === 'completed') {
          return task.status === 'completed';
        }
        return true;
      });
    } else {
      // Jobs I'm working on (accepted applications)
      const acceptedApps = myApplications.filter(app => app.status === 'accepted');
      return acceptedApps.filter(app => {
        const task = app.task;
        if (!task) return false;
        if (taskStatusFilter === 'active') {
          return ['assigned', 'in_progress', 'pending_confirmation'].includes(task.status);
        }
        if (taskStatusFilter === 'completed') {
          return task.status === 'completed';
        }
        return true;
      }).map(app => app.task!).filter(Boolean);
    }
  };

  // Count tasks by type
  const myTasksCount = createdTasks.length;
  const myJobsCount = myApplications.filter(app => app.status === 'accepted').length;
  const pendingAppsCount = myApplications.filter(app => app.status === 'pending').length;
  const totalPendingApplicationsOnMyTasks = createdTasks.reduce((sum, task) => {
    return sum + (task.pending_applications_count || 0);
  }, 0);

  // Count tasks with matches
  const tasksWithMatches = Object.entries(taskMatchCounts).filter(([_, count]) => count > 0).length;

  // Tasks completed count (for profile stats)
  const tasksCompletedAsWorker = myApplications.filter(app => 
    app.status === 'accepted' && app.task?.status === 'completed'
  ).length;
  const tasksCompletedAsCreator = createdTasks.filter(t => t.status === 'completed').length;
  const totalTasksCompleted = tasksCompletedAsWorker + tasksCompletedAsCreator;

  // Check if user has content for each tab
  const hasListings = myListings.length > 0;
  const hasOfferings = myOfferings.length > 0;
  const hasTasks = createdTasks.length > 0 || myApplications.length > 0;
  const hasReviews = reviews.length > 0;

  // Helper to get full avatar URL (handles both relative and absolute URLs)
  const getAvatarDisplayUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return getImageUrl(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Failed to load profile</div>
      </div>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  const currentAvatarUrl = getAvatarDisplayUrl(formData.avatar_url || profile.avatar_url || profile.profile_picture_url);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header - Clean & Simple */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ring-4 ring-gray-50">
                {currentAvatarUrl ? (
                  <img 
                    src={currentAvatarUrl} 
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-400 font-semibold">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 shadow border-2 border-white">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {editing && (
                <button
                  onClick={() => setShowAvatarPicker(true)}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-0.5 rounded-full text-xs hover:bg-gray-700 transition-colors"
                >
                  Change
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{profile.username}</h1>
                {profile.is_verified && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                    ✓ Verified
                  </span>
                )}
              </div>
              
              {(profile.first_name || profile.last_name) && (
                <p className="text-gray-600">{profile.first_name} {profile.last_name}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                {(profile.city || profile.country) && (
                  <span className="flex items-center gap-1">
                    📍 {[profile.city, profile.country].filter(Boolean).join(', ')}
                  </span>
                )}
                <span>Member since {memberSince}</span>
              </div>

              {/* Stats inline */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold text-gray-900">{profile.average_rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-400 text-sm">({profile.reviews_count || 0})</span>
                </div>
                <div className="text-gray-300">|</div>
                <div className="flex items-center gap-1">
                  <span className="text-green-500 font-semibold">{profile.tasks_completed || totalTasksCompleted}</span>
                  <span className="text-gray-500 text-sm">tasks done</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex-shrink-0">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions - Small Inline Pills */}
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
            <Link
              to="/tasks/create"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              📋 Post Job
            </Link>
            <Link
              to="/offerings/create"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium hover:bg-amber-100 transition-colors"
            >
              👋 Offer Service
            </Link>
            <Link
              to="/listings/create"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors"
            >
              🏷️ Sell Item
            </Link>
            <Link
              to="/favorites"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-sm font-medium hover:bg-pink-100 transition-colors"
            >
              ❤️ Favorites
            </Link>
          </div>
        </div>

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAvatarPicker(false)}>
            <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Choose Avatar</h3>
                <button onClick={() => setShowAvatarPicker(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              {/* Upload Custom Photo */}
              <div className="mb-5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="w-full border-2 border-dashed border-gray-200 rounded-lg py-6 px-4 text-center hover:border-blue-300 hover:bg-blue-50/50 transition-colors disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <span className="text-gray-500">Uploading...</span>
                  ) : (
                    <>
                      <div className="text-2xl mb-1">📷</div>
                      <p className="text-gray-600 text-sm">Upload photo</p>
                    </>
                  )}
                </button>
              </div>

              <div className="border-t pt-5">
                <p className="text-sm text-gray-500 mb-3">Or generate an avatar</p>
                
                {/* Style Selection */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {AVATAR_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedAvatarStyle(style.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedAvatarStyle === style.id
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>

                {/* Seed Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={avatarSeed}
                    onChange={(e) => setAvatarSeed(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type anything..."
                  />
                  <button
                    onClick={handleRandomizeSeed}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    🎲
                  </button>
                </div>

                {/* Preview */}
                <div className="flex justify-center mb-4">
                  <img
                    src={generateAvatarUrl(selectedAvatarStyle, avatarSeed)}
                    alt="Preview"
                    className="w-20 h-20 rounded-full border-4 border-gray-100"
                  />
                </div>

                <button
                  onClick={handleSelectGeneratedAvatar}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
                >
                  Use This Avatar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'about'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            About
          </button>
          
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
              activeTab === 'tasks'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Jobs {hasTasks && <span className="text-gray-400">({myTasksCount + myJobsCount})</span>}
            {(totalPendingApplicationsOnMyTasks + pendingAppsCount) > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white font-bold">
                {totalPendingApplicationsOnMyTasks + pendingAppsCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('offerings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'offerings'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Services {hasOfferings && <span className="text-gray-400">({myOfferings.length})</span>}
          </button>
          
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'listings'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Listings {hasListings && <span className="text-gray-400">({myListings.length})</span>}
          </button>
          
          {hasReviews && (
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'reviews'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          )}
        </div>

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell others about yourself..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+371 20000000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Riga"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Latvia"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {profile.bio ? (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">About</h3>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">No bio yet. Click "Edit Profile" to add one!</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Contact</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400">📧</span>
                      <span className="text-gray-700">{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400">📱</span>
                        <span className="text-gray-700">{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">My Listings</h2>
              <Link
                to="/listings/create"
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                + New Listing
              </Link>
            </div>
            
            {listingsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-2">🏷️</div>
                <p className="text-gray-500 mb-4">No listings yet</p>
                <Link
                  to="/listings/create"
                  className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  Create your first listing →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myListings.map(listing => {
                  const images = listing.images ? listing.images.split(',').filter(Boolean) : [];
                  const firstImage = images[0];
                  
                  return (
                    <div key={listing.id} className="flex gap-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {firstImage ? (
                          <img src={getImageUrl(firstImage)} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">🖼</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/listings/${listing.id}`} className="font-medium text-gray-900 hover:text-purple-600 truncate">
                            {listing.title}
                          </Link>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${getStatusBadgeClass(listing.status)}`}>
                            {listing.status}
                          </span>
                        </div>
                        <p className="text-purple-600 font-semibold">€{Number(listing.price).toLocaleString()}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Link to={`/listings/${listing.id}`} className="text-xs text-blue-600 hover:underline">View</Link>
                          <Link to={`/listings/${listing.id}/edit`} className="text-xs text-gray-500 hover:underline">Edit</Link>
                          <button onClick={() => handleDeleteListing(listing.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Offerings Tab */}
        {activeTab === 'offerings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">My Services</h2>
              <Link
                to="/offerings/create"
                className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
              >
                + New Service
              </Link>
            </div>

            {/* Soft Map Visibility Tip - Dismissable */}
            {hasOfferings && !showMapTipDismissed && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">💡</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Pro tip:</span> Your services can appear on the map for people searching nearby. 
                      Map visibility is a premium feature coming soon!
                    </p>
                  </div>
                  <button 
                    onClick={handleDismissMapTip}
                    className="text-blue-400 hover:text-blue-600 text-sm flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            
            {offeringsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : myOfferings.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-2">👋</div>
                <p className="text-gray-500 mb-4">No services yet</p>
                <Link
                  to="/offerings/create"
                  className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium text-sm"
                >
                  Create your first service →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myOfferings.map(offering => (
                  <div key={offering.id} className="p-4 border border-gray-100 rounded-lg hover:bg-amber-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{getCategoryIcon(offering.category)}</span>
                          <Link to={`/offerings/${offering.id}`} className="font-medium text-gray-900 hover:text-amber-600">
                            {offering.title}
                          </Link>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadgeClass(offering.status)}`}>
                            {offering.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-1">{offering.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="text-green-600 font-semibold">
                            €{offering.price || 0}{offering.price_type === 'hourly' && '/hr'}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">{getCategoryLabel(offering.category)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/offerings/${offering.id}`} className="text-xs text-blue-600 hover:underline">View</Link>
                        <Link to={`/offerings/${offering.id}/edit`} className="text-xs text-gray-500 hover:underline">Edit</Link>
                        <button onClick={() => handleDeleteOffering(offering.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">My Jobs</h2>
              <Link
                to="/tasks/create"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Post Job
              </Link>
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setTaskViewMode('my-tasks')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all relative ${
                  taskViewMode === 'my-tasks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Jobs I Posted
                {totalPendingApplicationsOnMyTasks > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[10px] rounded-full bg-green-500 text-white font-bold">
                    {totalPendingApplicationsOnMyTasks}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTaskViewMode('my-jobs')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  taskViewMode === 'my-jobs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Jobs I'm Doing
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-1 mb-4">
              {[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Done' },
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setTaskStatusFilter(filter.value as TaskStatusFilter)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    taskStatusFilter === filter.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Matches Summary Banner - only show if there are matches and viewing "Jobs I Posted" */}
            {taskViewMode === 'my-tasks' && tasksWithMatches > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <span className="text-lg">✨</span>
                  <p className="text-sm">
                    <span className="font-medium">{tasksWithMatches} of your jobs</span> have potential helpers nearby
                  </p>
                </div>
              </div>
            )}

            {tasksLoading || applicationsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : getDisplayTasks().length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-2">{taskViewMode === 'my-tasks' ? '📋' : '🛠️'}</div>
                <p className="text-gray-500 mb-4">
                  {taskViewMode === 'my-tasks' ? 'No jobs posted yet' : 'No jobs yet'}
                </p>
                <Link
                  to={taskViewMode === 'my-tasks' ? '/tasks/create' : '/tasks'}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  {taskViewMode === 'my-tasks' ? 'Post your first job →' : 'Browse available jobs →'}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {taskViewMode === 'my-tasks' ? (
                  getDisplayTasks().map(task => {
                    const hasApplications = task.status === 'open' && (task.pending_applications_count || 0) > 0;
                    const matchCount = taskMatchCounts[task.id] || 0;
                    const hasMatches = task.status === 'open' && matchCount > 0;
                    const isExpanded = expandedMatchHint === task.id;
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`p-4 border rounded-lg transition-colors ${
                          hasApplications ? 'border-green-300 bg-green-50' : 
                          hasMatches ? 'border-amber-200 bg-amber-50/30' :
                          'border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        {hasApplications && (
                          <Link 
                            to={`/tasks/${task.id}`}
                            className="flex items-center justify-between bg-green-500 text-white p-2.5 rounded-lg mb-3 text-sm"
                          >
                            <span>📩 {task.pending_applications_count} application{task.pending_applications_count !== 1 ? 's' : ''}!</span>
                            <span className="font-medium">Review →</span>
                          </Link>
                        )}
                        
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span>{getCategoryIcon(task.category)}</span>
                              <Link to={`/tasks/${task.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                                {task.title}
                              </Link>
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadgeClass(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                              {/* Subtle match badge */}
                              {hasMatches && !hasApplications && (
                                <button
                                  onClick={() => setExpandedMatchHint(isExpanded ? null : task.id)}
                                  className="px-2 py-0.5 text-xs rounded-full font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors flex items-center gap-1"
                                >
                                  ✨ {matchCount}
                                </button>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-1">{task.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                              <span>📍 {task.location}</span>
                              {task.budget && <span className="text-green-600 font-semibold">€{task.budget}</span>}
                            </div>
                            
                            {/* Expandable match hint */}
                            {isExpanded && hasMatches && (
                              <Link
                                to={`/tasks/${task.id}`}
                                className="mt-3 flex items-center justify-between p-2.5 bg-amber-100 rounded-lg text-sm text-amber-800 hover:bg-amber-200 transition-colors"
                              >
                                <span>
                                  💡 {matchCount} helper{matchCount !== 1 ? 's' : ''} offering <strong>{getCategoryLabel(task.category)}</strong> nearby
                                </span>
                                <span className="font-medium">View matches →</span>
                              </Link>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            {task.status === 'pending_confirmation' && (
                              <button
                                onClick={() => handleConfirmTask(task.id)}
                                className="px-2.5 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600"
                              >
                                ✓ Confirm
                              </button>
                            )}
                            <Link to={`/tasks/${task.id}`} className="text-xs text-blue-600 hover:underline text-center">View</Link>
                            {task.status === 'open' && !hasApplications && (
                              <>
                                <Link to={`/tasks/${task.id}/edit`} className="text-xs text-gray-500 hover:underline text-center">Edit</Link>
                                <button onClick={() => handleCancelTask(task.id)} className="text-xs text-red-500 hover:underline">Cancel</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  myApplications.filter(app => app.status === 'accepted').map(application => {
                    const task = application.task;
                    if (!task) return null;
                    
                    if (taskStatusFilter === 'active' && !['assigned', 'in_progress', 'pending_confirmation'].includes(task.status)) return null;
                    if (taskStatusFilter === 'completed' && task.status !== 'completed') return null;
                    
                    return (
                      <div key={application.id} className="p-4 border border-green-200 rounded-lg bg-green-50/50">
                        <div className="flex items-center gap-2 text-green-700 text-sm mb-2">
                          <span>🎉</span>
                          <span className="font-medium">
                            {task.status === 'completed' ? 'Completed!' : 'You\'re assigned'}
                          </span>
                        </div>
                        
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span>{getCategoryIcon(task.category)}</span>
                              <Link to={`/tasks/${task.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                                {task.title}
                              </Link>
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadgeClass(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span>📍 {task.location}</span>
                              {task.budget && <span className="text-green-600 font-semibold">€{task.budget}</span>}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Posted by {task.creator_name || 'Unknown'}</p>
                          </div>
                          <Link
                            to={`/tasks/${task.id}`}
                            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Reviews</h2>
            
            {reviews.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-2">⭐</div>
                <p className="text-gray-500">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                    {editingReview === review.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                          {renderEditableStars(reviewEditData.rating, (rating) => 
                            setReviewEditData(prev => ({ ...prev, rating }))
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                          <textarea
                            value={reviewEditData.content}
                            onChange={(e) => setReviewEditData(prev => ({ ...prev, content: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveReview(review.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">Save</button>
                          <button onClick={() => setEditingReview(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          {review.reviewer_avatar ? (
                            <img src={review.reviewer_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-gray-500 text-sm font-medium">{review.reviewer_name?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">{review.reviewer_name}</span>
                            {renderStars(review.rating)}
                          </div>
                          {review.content ? (
                            <p className="text-gray-600 text-sm">{review.content}</p>
                          ) : (
                            <p className="text-gray-400 text-sm italic">No comment</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                        {user && review.reviewer_id === user.id && (
                          <div className="flex gap-2">
                            <button onClick={() => handleEditReview(review)} className="text-xs text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDeleteReview(review.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
