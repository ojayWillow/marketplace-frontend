import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import apiClient from '../api/client';
import { listingsApi, type Listing } from '../api/listings';
import { reviewsApi } from '../api/reviews';
import { getImageUrl, uploadImage } from '../api/uploads';
import { Task, TaskApplication, getCreatedTasks, getMyApplications, cancelTask, confirmTaskCompletion } from '../api/tasks';

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

type ActiveTab = 'about' | 'listings' | 'tasks' | 'reviews';
type TaskSubTab = 'created' | 'applications';
type CreatedStatusFilter = 'open' | 'in_progress' | 'completed' | 'all';
type ApplicationStatusFilter = 'pending' | 'accepted' | 'rejected' | 'all';

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user, setAuth, token } = useAuthStore();
  const toast = useToastStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [myApplications, setMyApplications] = useState<TaskApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [reviewEditData, setReviewEditData] = useState<{ rating: number; content: string }>({ rating: 5, content: '' });
  
  // Read state from URL params with defaults
  const activeTab = (searchParams.get('tab') as ActiveTab) || 'about';
  const taskSubTab = (searchParams.get('subtab') as TaskSubTab) || 'created';
  const createdStatusFilter = (searchParams.get('created_filter') as CreatedStatusFilter) || 'all';
  const applicationStatusFilter = (searchParams.get('application_filter') as ApplicationStatusFilter) || 'all';

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
    updateParams({ tab, subtab: '', created_filter: '', application_filter: '' });
  };

  const setTaskSubTab = (subtab: TaskSubTab) => {
    updateParams({ subtab });
  };

  const setCreatedStatusFilter = (filter: CreatedStatusFilter) => {
    updateParams({ created_filter: filter });
  };

  const setApplicationStatusFilter = (filter: ApplicationStatusFilter) => {
    updateParams({ application_filter: filter });
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
    fetchTasks();
    fetchApplications();
  }, [isAuthenticated]);

  useEffect(() => {
    // Set initial avatar seed from username
    if (profile?.username) {
      setAvatarSeed(profile.username);
    }
  }, [profile?.username]);

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
        return 'bg-gray-100 text-gray-700';
      case 'disputed':
        return 'bg-red-100 text-red-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { class: 'bg-yellow-100 text-yellow-700', label: '⏳ Pending', icon: '⏳' };
      case 'accepted':
        return { class: 'bg-green-100 text-green-700', label: '✅ Accepted', icon: '✅' };
      case 'rejected':
        return { class: 'bg-red-100 text-red-700', label: '❌ Rejected', icon: '❌' };
      default:
        return { class: 'bg-gray-100 text-gray-700', label: status, icon: '📋' };
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'pet-care': '🐕',
      'moving': '📦',
      'shopping': '🛒',
      'cleaning': '🧹',
      'delivery': '📄',
      'outdoor': '🌿',
      'babysitting': '👶',
      'car-wash': '🚗',
      'assembly': '🔧',
    };
    return icons[category] || '📋';
  };

  // Filter created tasks by status
  const filteredCreatedTasks = createdTasks.filter(task => {
    if (createdStatusFilter === 'all') return true;
    if (createdStatusFilter === 'open') return task.status === 'open';
    if (createdStatusFilter === 'in_progress') {
      return ['assigned', 'in_progress', 'pending_confirmation'].includes(task.status);
    }
    if (createdStatusFilter === 'completed') return task.status === 'completed';
    return true;
  });

  // Filter applications by status
  const filteredApplications = myApplications.filter(app => {
    if (applicationStatusFilter === 'all') return true;
    return app.status === applicationStatusFilter;
  });

  // Count created tasks by status
  const createdOpenTasks = createdTasks.filter(t => t.status === 'open').length;
  const createdInProgressTasks = createdTasks.filter(t => ['assigned', 'in_progress', 'pending_confirmation'].includes(t.status)).length;
  const createdCompletedTasks = createdTasks.filter(t => t.status === 'completed').length;

  // Count applications by status
  const pendingApplications = myApplications.filter(a => a.status === 'pending').length;
  const acceptedApplications = myApplications.filter(a => a.status === 'accepted').length;
  const rejectedApplications = myApplications.filter(a => a.status === 'rejected').length;

  // Count total pending applications across all open tasks
  const totalPendingApplicationsOnMyTasks = createdTasks.reduce((sum, task) => {
    return sum + (task.pending_applications_count || 0);
  }, 0);

  // Helper to get full avatar URL (handles both relative and absolute URLs)
  const getAvatarDisplayUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return getImageUrl(url);
  };

  // Build URL with current params for "View Details" links
  const buildTaskDetailUrl = (taskId: number) => {
    const params = new URLSearchParams();
    params.set('from', 'profile');
    params.set('tab', activeTab);
    params.set('subtab', taskSubTab);
    if (taskSubTab === 'created') {
      params.set('created_filter', createdStatusFilter);
    } else {
      params.set('application_filter', applicationStatusFilter);
    }
    return `/tasks/${taskId}?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading profile...</div>
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

  const totalTasks = createdTasks.length + myApplications.length;
  const currentAvatarUrl = getAvatarDisplayUrl(formData.avatar_url || profile.avatar_url || profile.profile_picture_url);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {currentAvatarUrl ? (
                  <img 
                    src={currentAvatarUrl} 
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl text-gray-400">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {profile.is_verified && (
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {editing && (
                <button
                  onClick={() => setShowAvatarPicker(true)}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs hover:bg-blue-600 transition-colors shadow-md"
                >
                  📷 Change
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                {profile.is_verified && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Verified
                  </span>
                )}
              </div>
              
              {(profile.first_name || profile.last_name) && (
                <p className="text-gray-600 mb-1">
                  {profile.first_name} {profile.last_name}
                </p>
              )}
              
              {(profile.city || profile.country) && (
                <p className="text-gray-500 text-sm mb-2">
                  📍 {[profile.city, profile.country].filter(Boolean).join(', ')}
                </p>
              )}
              
              <p className="text-gray-400 text-sm">Member since {memberSince}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-center">
              <div>
                <div className="flex items-center justify-center gap-1">
                  {renderStars(profile.average_rating || 0)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {profile.average_rating?.toFixed(1) || '0.0'} ({profile.reviews_count || 0} reviews)
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {profile.completion_rate?.toFixed(0) || 0}%
                </div>
                <p className="text-sm text-gray-500">Completion</p>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-6 flex justify-end">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAvatarPicker(false)}>
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Choose Your Avatar</h3>
                <button onClick={() => setShowAvatarPicker(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>

              {/* Upload Custom Photo */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">📷 Upload Your Photo</h4>
                <div className="flex items-center gap-4">
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
                    className="flex-1 border-2 border-dashed border-gray-300 rounded-lg py-8 px-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    {uploadingAvatar ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl mb-2">📁</div>
                        <p className="text-gray-600">Click to upload an image</p>
                        <p className="text-xs text-gray-400 mt-1">Max 5MB, JPG/PNG</p>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-700 mb-3">🎨 Or Choose a Generated Avatar</h4>
                
                {/* Style Selection */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Avatar Style</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedAvatarStyle(style.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedAvatarStyle === style.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seed Input */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Seed (customize your avatar)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={avatarSeed}
                      onChange={(e) => setAvatarSeed(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter any text..."
                    />
                    <button
                      onClick={handleRandomizeSeed}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      🎲 Random
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center justify-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Preview</p>
                    <img
                      src={generateAvatarUrl(selectedAvatarStyle, avatarSeed)}
                      alt="Avatar Preview"
                      className="w-24 h-24 rounded-full border-4 border-white shadow-md"
                    />
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={handleSelectGeneratedAvatar}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  ✅ Use This Avatar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'about'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'listings'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            My Listings ({myListings.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors relative ${
              activeTab === 'tasks'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            My Tasks ({totalTasks})
            {totalPendingApplicationsOnMyTasks > 0 && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white font-bold animate-pulse">
                {totalPendingApplicationsOnMyTasks}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell others about yourself..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Riga"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.bio ? (
                  <p className="text-gray-700">{profile.bio}</p>
                ) : (
                  <p className="text-gray-400 italic">No bio yet. Click "Edit Profile" to add one!</p>
                )}
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 text-gray-700">{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <span className="ml-2 text-gray-700">{profile.phone}</span>
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Listings</h2>
              <Link
                to="/listings/create"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                + Create Listing
              </Link>
            </div>
            
            {listingsLoading ? (
              <div className="text-center py-8 text-gray-600">Loading listings...</div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 mb-4">You haven't created any listings yet.</p>
                <Link
                  to="/listings/create"
                  className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Your First Listing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myListings.map(listing => {
                  const images = listing.images ? listing.images.split(',').filter(Boolean) : [];
                  const firstImage = images[0];
                  
                  return (
                    <div key={listing.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex">
                        {/* Image */}
                        <div className="w-32 h-32 bg-gray-100 flex-shrink-0">
                          {firstImage ? (
                            <img
                              src={getImageUrl(firstImage)}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 p-3 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-gray-900 line-clamp-1">{listing.title}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(listing.status)}`}>
                              {listing.status}
                            </span>
                          </div>
                          
                          <p className="text-blue-600 font-semibold mt-1">
                            €{Number(listing.price).toLocaleString()}
                          </p>
                          
                          <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                            {listing.location || 'No location'}
                          </p>
                          
                          <div className="flex gap-2 mt-auto pt-2">
                            <Link
                              to={`/listings/${listing.id}`}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              View
                            </Link>
                            <Link
                              to={`/listings/${listing.id}/edit`}
                              className="text-sm text-gray-600 hover:text-gray-700"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteListing(listing.id)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
              <Link
                to="/tasks/create"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                + Create Task
              </Link>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 mb-4 border-b">
              <button
                onClick={() => setTaskSubTab('created')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors relative ${
                  taskSubTab === 'created'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Created by Me ({createdTasks.length})
                {totalPendingApplicationsOnMyTasks > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white font-bold">
                    {totalPendingApplicationsOnMyTasks} new
                  </span>
                )}
              </button>
              <button
                onClick={() => setTaskSubTab('applications')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  taskSubTab === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Applications ({myApplications.length})
                {pendingApplications > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
                    {pendingApplications} pending
                  </span>
                )}
              </button>
            </div>

            {tasksLoading || applicationsLoading ? (
              <div className="text-center py-8 text-gray-600">Loading...</div>
            ) : (
              <>
                {/* Created Tasks */}
                {taskSubTab === 'created' && (
                  <>
                    {/* Status Filter Pills */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <button
                        onClick={() => setCreatedStatusFilter('open')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          createdStatusFilter === 'open'
                            ? 'bg-green-100 text-green-700 ring-2 ring-green-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        📢 Open ({createdOpenTasks})
                      </button>
                      <button
                        onClick={() => setCreatedStatusFilter('in_progress')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          createdStatusFilter === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        🔄 In Progress ({createdInProgressTasks})
                      </button>
                      <button
                        onClick={() => setCreatedStatusFilter('completed')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          createdStatusFilter === 'completed'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        ✅ Completed ({createdCompletedTasks})
                      </button>
                      <button
                        onClick={() => setCreatedStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          createdStatusFilter === 'all'
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        All ({createdTasks.length})
                      </button>
                    </div>

                    {filteredCreatedTasks.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-gray-500 mb-4">
                          {createdTasks.length === 0 
                            ? "You haven't created any tasks yet." 
                            : `No ${createdStatusFilter === 'all' ? '' : createdStatusFilter.replace('_', ' ')} tasks.`}
                        </p>
                        {createdTasks.length === 0 && (
                          <Link
                            to="/tasks/create"
                            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Create Your First Task
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredCreatedTasks.map(task => (
                          <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-xl">{getCategoryIcon(task.category)}</span>
                                  <Link 
                                    to={buildTaskDetailUrl(task.id)}
                                    className="font-medium text-gray-900 hover:text-blue-600"
                                  >
                                    {task.title}
                                  </Link>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(task.status)}`}>
                                    {task.status.replace('_', ' ')}
                                  </span>
                                  {task.is_urgent && (
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
                                      Urgent
                                    </span>
                                  )}
                                  {/* Application count badge */}
                                  {task.status === 'open' && task.pending_applications_count !== undefined && task.pending_applications_count > 0 && (
                                    <Link
                                      to={buildTaskDetailUrl(task.id)}
                                      className="px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors animate-pulse"
                                    >
                                      📩 {task.pending_applications_count} application{task.pending_applications_count !== 1 ? 's' : ''}
                                    </Link>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-2">{task.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>📍 {task.location}</span>
                                  {task.budget && <span className="text-green-600 font-medium">€{task.budget}</span>}
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex flex-col gap-2 min-w-[120px]">
                                {task.status === 'pending_confirmation' && (
                                  <button
                                    onClick={() => handleConfirmTask(task.id)}
                                    className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                  >
                                    ✓ Confirm Done
                                  </button>
                                )}
                                {task.status === 'open' && (
                                  <>
                                    {task.pending_applications_count !== undefined && task.pending_applications_count > 0 ? (
                                      <Link
                                        to={buildTaskDetailUrl(task.id)}
                                        className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center font-medium"
                                      >
                                        👀 Review Applications
                                      </Link>
                                    ) : (
                                      <Link
                                        to={`/tasks/${task.id}/edit`}
                                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                                      >
                                        ✏️ Edit
                                      </Link>
                                    )}
                                    <button
                                      onClick={() => handleCancelTask(task.id)}
                                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                                {['assigned', 'in_progress'].includes(task.status) && (
                                  <Link
                                    to={buildTaskDetailUrl(task.id)}
                                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                                  >
                                    View Details
                                  </Link>
                                )}
                                {task.status === 'completed' && (
                                  <Link
                                    to={buildTaskDetailUrl(task.id)}
                                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                                  >
                                    View Details
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* My Applications Tab */}
                {taskSubTab === 'applications' && (
                  <>
                    {/* Status Filter Pills */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <button
                        onClick={() => setApplicationStatusFilter('pending')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          applicationStatusFilter === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        ⏳ Pending ({pendingApplications})
                      </button>
                      <button
                        onClick={() => setApplicationStatusFilter('accepted')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          applicationStatusFilter === 'accepted'
                            ? 'bg-green-100 text-green-700 ring-2 ring-green-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        ✅ Accepted ({acceptedApplications})
                      </button>
                      <button
                        onClick={() => setApplicationStatusFilter('rejected')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          applicationStatusFilter === 'rejected'
                            ? 'bg-red-100 text-red-700 ring-2 ring-red-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        ❌ Rejected ({rejectedApplications})
                      </button>
                      <button
                        onClick={() => setApplicationStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          applicationStatusFilter === 'all'
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        All ({myApplications.length})
                      </button>
                    </div>

                    {filteredApplications.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📨</div>
                        <p className="text-gray-500 mb-4">
                          {myApplications.length === 0 
                            ? "You haven't applied to any tasks yet." 
                            : `No ${applicationStatusFilter} applications.`}
                        </p>
                        {myApplications.length === 0 && (
                          <Link
                            to="/tasks"
                            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Browse Available Tasks
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredApplications.map(application => {
                          const task = application.task;
                          const statusBadge = getApplicationStatusBadge(application.status);
                          
                          return (
                            <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    {task && <span className="text-xl">{getCategoryIcon(task.category)}</span>}
                                    {task ? (
                                      <Link 
                                        to={`/tasks/${task.id}`}
                                        className="font-medium text-gray-900 hover:text-blue-600"
                                      >
                                        {task.title}
                                      </Link>
                                    ) : (
                                      <span className="font-medium text-gray-500">Task #{application.task_id}</span>
                                    )}
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${statusBadge.class}`}>
                                      {statusBadge.label}
                                    </span>
                                  </div>
                                  
                                  {task && (
                                    <>
                                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">{task.description}</p>
                                      <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>📍 {task.location}</span>
                                        {task.budget && <span className="text-green-600 font-medium">€{task.budget}</span>}
                                      </div>
                                    </>
                                  )}
                                  
                                  {application.message && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                      <span className="font-medium">Your message:</span> {application.message}
                                    </div>
                                  )}
                                  
                                  <p className="text-xs text-gray-400 mt-2">
                                    Applied on {new Date(application.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex flex-col gap-2 min-w-[120px]">
                                  {task && (
                                    <Link
                                      to={`/tasks/${task.id}`}
                                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                                    >
                                      View Task
                                    </Link>
                                  )}
                                  
                                  {application.status === 'pending' && (
                                    <button
                                      onClick={() => handleWithdrawApplication(application.id, application.task_id)}
                                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                      Withdraw
                                    </button>
                                  )}
                                  
                                  {application.status === 'accepted' && task && (
                                    <div className="text-center">
                                      <span className="text-xs text-green-600 font-medium">🎉 You got the job!</span>
                                    </div>
                                  )}
                                  
                                  {application.status === 'rejected' && (
                                    <div className="text-center">
                                      <span className="text-xs text-gray-500">Better luck next time</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
            
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No reviews yet. Complete tasks to receive reviews!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    {editingReview === review.id ? (
                      // Edit mode
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                          {renderEditableStars(reviewEditData.rating, (rating) => 
                            setReviewEditData(prev => ({ ...prev, rating }))
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                          <textarea
                            value={reviewEditData.content}
                            onChange={(e) => setReviewEditData(prev => ({ ...prev, content: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveReview(review.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingReview(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {review.reviewer_avatar ? (
                            <img src={review.reviewer_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-gray-500">{review.reviewer_name?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{review.reviewer_name}</span>
                            {renderStars(review.rating)}
                          </div>
                          {review.content && (
                            <p className="text-gray-600">{review.content}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {user && review.reviewer_id === user.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditReview(review)}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
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
