import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import apiClient from '../api/client';
import { listingsApi, type Listing } from '../api/listings';
import { reviewsApi } from '../api/reviews';
import { getImageUrl, uploadImage } from '../api/uploads';
import { Task, getMyTasks, getCreatedTasks, cancelTask, confirmTaskCompletion } from '../api/tasks';

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

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuth, token } = useAuthStore();
  const toast = useToastStore();
  const [profile, setProfile] = useState&lt;UserProfile | null&gt;(null);
  const [reviews, setReviews] = useState&lt;Review[]&gt;([]);
  const [myListings, setMyListings] = useState&lt;Listing[]&gt;([]);
  const [myTasks, setMyTasks] = useState&lt;Task[]&gt;([]);
  const [createdTasks, setCreatedTasks] = useState&lt;Task[]&gt;([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState&lt;'about' | 'listings' | 'tasks' | 'reviews'&gt;('about');
  const [taskSubTab, setTaskSubTab] = useState&lt;'assigned' | 'created'&gt;('assigned');
  const [assignedStatusFilter, setAssignedStatusFilter] = useState&lt;'active' | 'completed' | 'all'&gt;('active');
  const [createdStatusFilter, setCreatedStatusFilter] = useState&lt;'open' | 'in_progress' | 'completed' | 'all'&gt;('all');
  const [editingReview, setEditingReview] = useState&lt;number | null&gt;(null);
  const [reviewEditData, setReviewEditData] = useState&lt;{ rating: number; content: string }&gt;({ rating: 5, content: '' });
  
  // Avatar picker state
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState('avataaars');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef&lt;HTMLInputElement&gt;(null);
  
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
      const [assigned, created] = await Promise.all([
        getMyTasks(),
        getCreatedTasks()
      ]);
      setMyTasks(assigned.tasks || []);
      setCreatedTasks(created.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setTasksLoading(false);
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

  const handleMarkTaskDone = async (taskId: number) => {
    try {
      // This marks the task as done from the helper's side (pending confirmation from owner)
      await apiClient.post(`/api/tasks/${taskId}/mark-done`);
      toast.success('Task marked as done! Waiting for owner confirmation.');
      fetchTasks();
    } catch (error: any) {
      console.error('Error marking task done:', error);
      toast.error(error?.response?.data?.error || 'Failed to mark task as done');
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

  const handleChange = (e: React.ChangeEvent&lt;HTMLInputElement | HTMLTextAreaElement&gt;) => {
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

  const handleFileUpload = async (e: React.ChangeEvent&lt;HTMLInputElement&gt;) => {
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
      &lt;div className="flex items-center"&gt;
        {[1, 2, 3, 4, 5].map(star => (
          &lt;span 
            key={star} 
            className={`text-lg ${star &lt;= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          &gt;
            ★
          &lt;/span&gt;
        ))}
      &lt;/div&gt;
    );
  };

  const renderEditableStars = (rating: number, onChange: (rating: number) => void) => {
    return (
      &lt;div className="flex items-center gap-1"&gt;
        {[1, 2, 3, 4, 5].map(star => (
          &lt;button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl ${star &lt;= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
          &gt;
            ★
          &lt;/button&gt;
        ))}
      &lt;/div&gt;
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
        return 'bg-purple-100 text-purple-700';
      case 'cancelled':
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      case 'disputed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record&lt;string, string&gt; = {
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

  // Filter assigned tasks by status
  const filteredAssignedTasks = myTasks.filter(task => {
    if (assignedStatusFilter === 'all') return true;
    if (assignedStatusFilter === 'active') {
      return ['assigned', 'in_progress', 'pending_confirmation'].includes(task.status);
    }
    if (assignedStatusFilter === 'completed') {
      return task.status === 'completed';
    }
    return true;
  });

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

  // Count tasks by status for badges
  const assignedActiveTasks = myTasks.filter(t => ['assigned', 'in_progress', 'pending_confirmation'].includes(t.status)).length;
  const assignedCompletedTasks = myTasks.filter(t => t.status === 'completed').length;
  
  const createdOpenTasks = createdTasks.filter(t => t.status === 'open').length;
  const createdInProgressTasks = createdTasks.filter(t => ['assigned', 'in_progress', 'pending_confirmation'].includes(t.status)).length;
  const createdCompletedTasks = createdTasks.filter(t => t.status === 'completed').length;

  // Helper to get full avatar URL (handles both relative and absolute URLs)
  const getAvatarDisplayUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return getImageUrl(url);
  };

  if (loading) {
    return (
      &lt;div className="min-h-screen bg-gray-50 flex items-center justify-center"&gt;
        &lt;div className="text-xl text-gray-600"&gt;Loading profile...&lt;/div&gt;
      &lt;/div&gt;
    );
  }

  if (!profile) {
    return (
      &lt;div className="min-h-screen bg-gray-50 flex items-center justify-center"&gt;
        &lt;div className="text-xl text-red-600"&gt;Failed to load profile&lt;/div&gt;
      &lt;/div&gt;
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  const totalTasks = myTasks.length + createdTasks.length;
  const currentAvatarUrl = getAvatarDisplayUrl(formData.avatar_url || profile.avatar_url || profile.profile_picture_url);

  return (
    &lt;div className="min-h-screen bg-gray-50 py-8"&gt;
      &lt;div className="max-w-4xl mx-auto px-4"&gt;
        {/* Profile Header */}
        &lt;div className="bg-white rounded-lg shadow-md p-6 mb-6"&gt;
          &lt;div className="flex flex-col md:flex-row items-start md:items-center gap-6"&gt;
            {/* Avatar */}
            &lt;div className="relative"&gt;
              &lt;div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"&gt;
                {currentAvatarUrl ? (
                  &lt;img 
                    src={currentAvatarUrl} 
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  /&gt;
                ) : (
                  &lt;span className="text-5xl text-gray-400"&gt;
                    {profile.username.charAt(0).toUpperCase()}
                  &lt;/span&gt;
                )}
              &lt;/div&gt;
              {profile.is_verified &amp;&amp; (
                &lt;div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1"&gt;
                  &lt;svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"&gt;
                    &lt;path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /&gt;
                  &lt;/svg&gt;
                &lt;/div&gt;
              )}
              {editing &amp;&amp; (
                &lt;button
                  onClick={() => setShowAvatarPicker(true)}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs hover:bg-blue-600 transition-colors shadow-md"
                &gt;
                  📷 Change
                &lt;/button&gt;
              )}
            &lt;/div&gt;

            {/* User Info */}
            &lt;div className="flex-1"&gt;
              &lt;div className="flex items-center gap-3 mb-2"&gt;
                &lt;h1 className="text-2xl font-bold text-gray-900"&gt;{profile.username}&lt;/h1&gt;
                {profile.is_verified &amp;&amp; (
                  &lt;span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"&gt;
                    Verified
                  &lt;/span&gt;
                )}
              &lt;/div&gt;
              
              {(profile.first_name || profile.last_name) &amp;&amp; (
                &lt;p className="text-gray-600 mb-1"&gt;
                  {profile.first_name} {profile.last_name}
                &lt;/p&gt;
              )}
              
              {(profile.city || profile.country) &amp;&amp; (
                &lt;p className="text-gray-500 text-sm mb-2"&gt;
                  📍 {[profile.city, profile.country].filter(Boolean).join(', ')}
                &lt;/p&gt;
              )}
              
              &lt;p className="text-gray-400 text-sm"&gt;Member since {memberSince}&lt;/p&gt;
            &lt;/div&gt;

            {/* Stats */}
            &lt;div className="flex gap-6 text-center"&gt;
              &lt;div&gt;
                &lt;div className="flex items-center justify-center gap-1"&gt;
                  {renderStars(profile.average_rating || 0)}
                &lt;/div&gt;
                &lt;p className="text-sm text-gray-500 mt-1"&gt;
                  {profile.average_rating?.toFixed(1) || '0.0'} ({profile.reviews_count || 0} reviews)
                &lt;/p&gt;
              &lt;/div&gt;
              &lt;div&gt;
                &lt;div className="text-2xl font-bold text-green-600"&gt;
                  {profile.completion_rate?.toFixed(0) || 0}%
                &lt;/div&gt;
                &lt;p className="text-sm text-gray-500"&gt;Completion&lt;/p&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          {/* Edit Button */}
          &lt;div className="mt-6 flex justify-end"&gt;
            {!editing ? (
              &lt;button
                onClick={() => setEditing(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              &gt;
                Edit Profile
              &lt;/button&gt;
            ) : (
              &lt;div className="flex gap-3"&gt;
                &lt;button
                  onClick={() => setEditing(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                &gt;
                  Cancel
                &lt;/button&gt;
                &lt;button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                &gt;
                  {saving ? 'Saving...' : 'Save Changes'}
                &lt;/button&gt;
              &lt;/div&gt;
            )}
          &lt;/div&gt;
        &lt;/div&gt;

        {/* Avatar Picker Modal */}
        {showAvatarPicker &amp;&amp; (
          &lt;div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAvatarPicker(false)}&gt;
            &lt;div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}&gt;
              &lt;div className="flex justify-between items-center mb-6"&gt;
                &lt;h3 className="text-xl font-bold text-gray-900"&gt;Choose Your Avatar&lt;/h3&gt;
                &lt;button onClick={() => setShowAvatarPicker(false)} className="text-gray-400 hover:text-gray-600 text-2xl"&gt;×&lt;/button&gt;
              &lt;/div&gt;

              {/* Upload Custom Photo */}
              &lt;div className="mb-6"&gt;
                &lt;h4 className="font-medium text-gray-700 mb-3"&gt;📷 Upload Your Photo&lt;/h4&gt;
                &lt;div className="flex items-center gap-4"&gt;
                  &lt;input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  /&gt;
                  &lt;button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="flex-1 border-2 border-dashed border-gray-300 rounded-lg py-8 px-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  &gt;
                    {uploadingAvatar ? (
                      &lt;div className="flex items-center justify-center gap-2"&gt;
                        &lt;div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"&gt;&lt;/div&gt;
                        &lt;span&gt;Uploading...&lt;/span&gt;
                      &lt;/div&gt;
                    ) : (
                      &lt;&gt;
                        &lt;div className="text-4xl mb-2"&gt;📁&lt;/div&gt;
                        &lt;p className="text-gray-600"&gt;Click to upload an image&lt;/p&gt;
                        &lt;p className="text-xs text-gray-400 mt-1"&gt;Max 5MB, JPG/PNG&lt;/p&gt;
                      &lt;/&gt;
                    )}
                  &lt;/button&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              &lt;div className="border-t pt-6"&gt;
                &lt;h4 className="font-medium text-gray-700 mb-3"&gt;🎨 Or Choose a Generated Avatar&lt;/h4&gt;
                
                {/* Style Selection */}
                &lt;div className="mb-4"&gt;
                  &lt;label className="block text-sm text-gray-600 mb-2"&gt;Avatar Style&lt;/label&gt;
                  &lt;div className="flex flex-wrap gap-2"&gt;
                    {AVATAR_STYLES.map(style => (
                      &lt;button
                        key={style.id}
                        onClick={() => setSelectedAvatarStyle(style.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedAvatarStyle === style.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      &gt;
                        {style.name}
                      &lt;/button&gt;
                    ))}
                  &lt;/div&gt;
                &lt;/div&gt;

                {/* Seed Input */}
                &lt;div className="mb-4"&gt;
                  &lt;label className="block text-sm text-gray-600 mb-2"&gt;Seed (customize your avatar)&lt;/label&gt;
                  &lt;div className="flex gap-2"&gt;
                    &lt;input
                      type="text"
                      value={avatarSeed}
                      onChange={(e) => setAvatarSeed(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter any text..."
                    /&gt;
                    &lt;button
                      onClick={handleRandomizeSeed}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    &gt;
                      🎲 Random
                    &lt;/button&gt;
                  &lt;/div&gt;
                &lt;/div&gt;

                {/* Preview */}
                &lt;div className="flex items-center justify-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg"&gt;
                  &lt;div className="text-center"&gt;
                    &lt;p className="text-sm text-gray-500 mb-2"&gt;Preview&lt;/p&gt;
                    &lt;img
                      src={generateAvatarUrl(selectedAvatarStyle, avatarSeed)}
                      alt="Avatar Preview"
                      className="w-24 h-24 rounded-full border-4 border-white shadow-md"
                    /&gt;
                  &lt;/div&gt;
                &lt;/div&gt;

                {/* Select Button */}
                &lt;button
                  onClick={handleSelectGeneratedAvatar}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                &gt;
                  ✅ Use This Avatar
                &lt;/button&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        )}

        {/* Tabs */}
        &lt;div className="flex gap-2 mb-6 flex-wrap"&gt;
          &lt;button
            onClick={() => setActiveTab('about')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'about'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          &gt;
            About
          &lt;/button&gt;
          &lt;button
            onClick={() => setActiveTab('listings')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'listings'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          &gt;
            My Listings ({myListings.length})
          &lt;/button&gt;
          &lt;button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          &gt;
            My Tasks ({totalTasks})
          &lt;/button&gt;
          &lt;button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          &gt;
            Reviews ({reviews.length})
          &lt;/button&gt;
        &lt;/div&gt;

        {/* About Tab */}
        {activeTab === 'about' &amp;&amp; (
          &lt;div className="bg-white rounded-lg shadow-md p-6"&gt;
            &lt;h2 className="text-xl font-bold text-gray-900 mb-4"&gt;About&lt;/h2&gt;
            
            {editing ? (
              &lt;div className="space-y-4"&gt;
                &lt;div className="grid grid-cols-1 md:grid-cols-2 gap-4"&gt;
                  &lt;div&gt;
                    &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;First Name&lt;/label&gt;
                    &lt;input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    /&gt;
                  &lt;/div&gt;
                  &lt;div&gt;
                    &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;Last Name&lt;/label&gt;
                    &lt;input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    /&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
                
                &lt;div&gt;
                  &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;Bio&lt;/label&gt;
                  &lt;textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell others about yourself..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  /&gt;
                &lt;/div&gt;
                
                &lt;div&gt;
                  &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;Phone&lt;/label&gt;
                  &lt;input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+371 20000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  /&gt;
                &lt;/div&gt;
                
                &lt;div className="grid grid-cols-1 md:grid-cols-2 gap-4"&gt;
                  &lt;div&gt;
                    &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;City&lt;/label&gt;
                    &lt;input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Riga"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    /&gt;
                  &lt;/div&gt;
                  &lt;div&gt;
                    &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;Country&lt;/label&gt;
                    &lt;input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Latvia"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    /&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            ) : (
              &lt;div className="space-y-4"&gt;
                {profile.bio ? (
                  &lt;p className="text-gray-700"&gt;{profile.bio}&lt;/p&gt;
                ) : (
                  &lt;p className="text-gray-400 italic"&gt;No bio yet. Click "Edit Profile" to add one!&lt;/p&gt;
                )}
                
                &lt;div className="border-t pt-4 mt-4"&gt;
                  &lt;h3 className="font-medium text-gray-900 mb-3"&gt;Contact Information&lt;/h3&gt;
                  &lt;div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"&gt;
                    &lt;div&gt;
                      &lt;span className="text-gray-500"&gt;Email:&lt;/span&gt;
                      &lt;span className="ml-2 text-gray-700"&gt;{profile.email}&lt;/span&gt;
                    &lt;/div&gt;
                    {profile.phone &amp;&amp; (
                      &lt;div&gt;
                        &lt;span className="text-gray-500"&gt;Phone:&lt;/span&gt;
                        &lt;span className="ml-2 text-gray-700"&gt;{profile.phone}&lt;/span&gt;
                      &lt;/div&gt;
                    )}
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            )}
          &lt;/div&gt;
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' &amp;&amp; (
          &lt;div className="bg-white rounded-lg shadow-md p-6"&gt;
            &lt;div className="flex justify-between items-center mb-6"&gt;
              &lt;h2 className="text-xl font-bold text-gray-900"&gt;My Listings&lt;/h2&gt;
              &lt;Link
                to="/listings/create"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              &gt;
                + Create Listing
              &lt;/Link&gt;
            &lt;/div&gt;
            
            {listingsLoading ? (
              &lt;div className="text-center py-8 text-gray-600"&gt;Loading listings...&lt;/div&gt;
            ) : myListings.length === 0 ? (
              &lt;div className="text-center py-12"&gt;
                &lt;div className="text-6xl mb-4"&gt;📝&lt;/div&gt;
                &lt;p className="text-gray-500 mb-4"&gt;You haven't created any listings yet.&lt;/p&gt;
                &lt;Link
                  to="/listings/create"
                  className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                &gt;
                  Create Your First Listing
                &lt;/Link&gt;
              &lt;/div&gt;
            ) : (
              &lt;div className="grid grid-cols-1 md:grid-cols-2 gap-4"&gt;
                {myListings.map(listing => {
                  const images = listing.images ? listing.images.split(',').filter(Boolean) : [];
                  const firstImage = images[0];
                  
                  return (
                    &lt;div key={listing.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"&gt;
                      &lt;div className="flex"&gt;
                        {/* Image */}
                        &lt;div className="w-32 h-32 bg-gray-100 flex-shrink-0"&gt;
                          {firstImage ? (
                            &lt;img
                              src={getImageUrl(firstImage)}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            /&gt;
                          ) : (
                            &lt;div className="w-full h-full flex items-center justify-center text-gray-300"&gt;
                              &lt;svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
                                &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /&gt;
                              &lt;/svg&gt;
                            &lt;/div&gt;
                          )}
                        &lt;/div&gt;
                        
                        {/* Content */}
                        &lt;div className="flex-1 p-3 flex flex-col"&gt;
                          &lt;div className="flex items-start justify-between gap-2"&gt;
                            &lt;h3 className="font-medium text-gray-900 line-clamp-1"&gt;{listing.title}&lt;/h3&gt;
                            &lt;span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(listing.status)}`}&gt;
                              {listing.status}
                            &lt;/span&gt;
                          &lt;/div&gt;
                          
                          &lt;p className="text-blue-600 font-semibold mt-1"&gt;
                            €{Number(listing.price).toLocaleString()}
                          &lt;/p&gt;
                          
                          &lt;p className="text-gray-500 text-sm mt-1 line-clamp-1"&gt;
                            {listing.location || 'No location'}
                          &lt;/p&gt;
                          
                          &lt;div className="flex gap-2 mt-auto pt-2"&gt;
                            &lt;Link
                              to={`/listings/${listing.id}`}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            &gt;
                              View
                            &lt;/Link&gt;
                            &lt;Link
                              to={`/listings/${listing.id}/edit`}
                              className="text-sm text-gray-600 hover:text-gray-700"
                            &gt;
                              Edit
                            &lt;/Link&gt;
                            &lt;button
                              onClick={() => handleDeleteListing(listing.id)}
                              className="text-sm text-red-600 hover:text-red-700"
                            &gt;
                              Delete
                            &lt;/button&gt;
                          &lt;/div&gt;
                        &lt;/div&gt;
                      &lt;/div&gt;
                    &lt;/div&gt;
                  );
                })}
              &lt;/div&gt;
            )}
          &lt;/div&gt;
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' &amp;&amp; (
          &lt;div className="bg-white rounded-lg shadow-md p-6"&gt;
            &lt;div className="flex justify-between items-center mb-6"&gt;
              &lt;h2 className="text-xl font-bold text-gray-900"&gt;My Tasks&lt;/h2&gt;
              &lt;Link
                to="/tasks/create"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              &gt;
                + Create Task
              &lt;/Link&gt;
            &lt;/div&gt;

            {/* Sub-tabs */}
            &lt;div className="flex gap-2 mb-4 border-b"&gt;
              &lt;button
                onClick={() => setTaskSubTab('assigned')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  taskSubTab === 'assigned'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              &gt;
                Assigned to Me ({myTasks.length})
              &lt;/button&gt;
              &lt;button
                onClick={() => setTaskSubTab('created')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  taskSubTab === 'created'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              &gt;
                Created by Me ({createdTasks.length})
              &lt;/button&gt;
            &lt;/div&gt;

            {tasksLoading ? (
              &lt;div className="text-center py-8 text-gray-600"&gt;Loading tasks...&lt;/div&gt;
            ) : (
              &lt;&gt;
                {/* Assigned Tasks */}
                {taskSubTab === 'assigned' &amp;&amp; (
                  &lt;&gt;
                    {/* Status Filter Pills */}
                    &lt;div className="flex gap-2 mb-4 flex-wrap"&gt;
                      &lt;button
                        onClick={() => setAssignedStatusFilter('active')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          assignedStatusFilter === 'active'
                            ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      &gt;
                        🔄 Active ({assignedActiveTasks})
                      &lt;/button&gt;
                      &lt;button
                        onClick={() => setAssignedStatusFilter('completed')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          assignedStatusFilter === 'completed'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      &gt;
                        ✅ Completed ({assignedCompletedTasks})
                      &lt;/button&gt;
                      &lt;button
                        onClick={() => setAssignedStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          assignedStatusFilter === 'all'
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      &gt;
                        All ({myTasks.length})
                      &lt;/button&gt;
                    &lt;/div&gt;

                    {filteredAssignedTasks.length === 0 ? (
                      &lt;div className="text-center py-12"&gt;
                        &lt;div className="text-6xl mb-4"&gt;🔍&lt;/div&gt;
                        &lt;p className="text-gray-500 mb-4"&gt;
                          {myTasks.length === 0 
                            ? 'No tasks assigned to you yet.' 
                            : `No ${assignedStatusFilter} tasks.`}
                        &lt;/p&gt;
                        {myTasks.length === 0 &amp;&amp; (
                          &lt;Link
                            to="/tasks"
                            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                          &gt;
                            Browse Available Tasks
                          &lt;/Link&gt;
                        )}
                      &lt;/div&gt;
                    ) : (
                      &lt;div className="space-y-4"&gt;
                        {filteredAssignedTasks.map(task => (
                          &lt;div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow"&gt;
                            &lt;div className="flex items-start justify-between gap-4"&gt;
                              &lt;div className="flex-1"&gt;
                                &lt;div className="flex items-center gap-2 mb-1 flex-wrap"&gt;
                                  &lt;span className="text-xl"&gt;{getCategoryIcon(task.category)}&lt;/span&gt;
                                  &lt;Link 
                                    to={`/tasks/${task.id}`}
                                    className="font-medium text-gray-900 hover:text-blue-600"
                                  &gt;
                                    {task.title}
                                  &lt;/Link&gt;
                                  &lt;span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(task.status)}`}&gt;
                                    {task.status.replace('_', ' ')}
                                  &lt;/span&gt;
                                &lt;/div&gt;
                                &lt;p className="text-gray-600 text-sm line-clamp-2 mb-2"&gt;{task.description}&lt;/p&gt;
                                &lt;div className="flex items-center gap-4 text-sm text-gray-500"&gt;
                                  &lt;span&gt;📍 {task.location}&lt;/span&gt;
                                  {task.budget &amp;&amp; &lt;span className="text-green-600 font-medium"&gt;€{task.budget}&lt;/span&gt;}
                                &lt;/div&gt;
                              &lt;/div&gt;
                              
                              {/* Action Buttons */}
                              &lt;div className="flex flex-col gap-2 min-w-[120px]"&gt;
                                {/* Active task actions */}
                                {['assigned', 'in_progress'].includes(task.status) &amp;&amp; (
                                  &lt;&gt;
                                    &lt;button
                                      onClick={() => handleMarkTaskDone(task.id)}
                                      className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    &gt;
                                      ✓ Mark Done
                                    &lt;/button&gt;
                                    &lt;Link
                                      to={`/tasks/${task.id}`}
                                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                                    &gt;
                                      View Details
                                    &lt;/Link&gt;
                                  &lt;/&gt;
                                )}
                                
                                {/* Pending confirmation */}
                                {task.status === 'pending_confirmation' &amp;&amp; (
                                  &lt;div className="text-center"&gt;
                                    &lt;span className="text-sm text-purple-600 font-medium"&gt;⏳ Waiting for confirmation&lt;/span&gt;
                                    &lt;Link
                                      to={`/tasks/${task.id}`}
                                      className="mt-2 block px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                                    &gt;
                                      View Details
                                    &lt;/Link&gt;
                                  &lt;/div&gt;
                                )}

                                {/* Completed task */}
                                {task.status === 'completed' &amp;&amp; (
                                  &lt;Link
                                    to={`/tasks/${task.id}`}
                                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                                  &gt;
                                    View Details
                                  &lt;/Link&gt;
                                )}
                              &lt;/div&gt;
                            &lt;/div&gt;
                          &lt;/div&gt;
                        ))}
                      &lt;/div&gt;
                    )}
                  &lt;/&gt;
                )}

                {/* Created Tasks */}
                {taskSubTab === 'created' &amp;&amp; (
                  &lt;&gt;
                    {/* Status Filter Pills */}
                    &lt;div className="flex gap-2 mb-4 flex-wrap"&gt;
                      &lt;button
                        onClick={() => setCreatedStatusFilter('open')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          createdStatusFilter === 'open'
                            ? 'bg-green-100 text-green-700 ring-2 ring-green-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      &gt;
                        📢 Open ({createdOpenTasks})
                      &lt;/button&gt;
                      &lt;button
                        onClick={() => setCreatedStatusFilter('in_progress')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          createdStatusFilter === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      &gt;
                        🔄 In Progress ({createdInProgressTasks})
                      &lt;/button&gt;
                      &lt;button
                        onClick={() => setCreatedStatusFilter('completed')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          createdStatusFilter === 'completed'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      &gt;
                        ✅ Completed ({createdCompletedTasks})
                      &lt;/button&gt;
                      &lt;button
                        onClick={() => setCreatedStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          createdStatusFilter === 'all'
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      &gt;
                        All ({createdTasks.length})
                      &lt;/button&gt;
                    &lt;/div&gt;

                    {filteredCreatedTasks.length === 0 ? (
                      &lt;div className="text-center py-12"&gt;
                        &lt;div className="text-6xl mb-4"&gt;📋&lt;/div&gt;
                        &lt;p className="text-gray-500 mb-4"&gt;
                          {createdTasks.length === 0 
                            ? "You haven't created any tasks yet." 
                            : `No ${createdStatusFilter === 'all' ? '' : createdStatusFilter.replace('_', ' ')} tasks.`}
                        &lt;/p&gt;
                        {createdTasks.length === 0 &amp;&amp; (
                          &lt;Link
                            to="/tasks/create"
                            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                          &gt;
                            Create Your First Task
                          &lt;/Link&gt;
                        )}
                      &lt;/div&gt;
                    ) : (
                      &lt;div className="space-y-4"&gt;
                        {filteredCreatedTasks.map(task => (
                          &lt;div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow"&gt;
                            &lt;div className="flex items-start justify-between gap-4"&gt;
                              &lt;div className="flex-1"&gt;
                                &lt;div className="flex items-center gap-2 mb-1 flex-wrap"&gt;
                                  &lt;span className="text-xl"&gt;{getCategoryIcon(task.category)}&lt;/span&gt;
                                  &lt;Link 
                                    to={`/tasks/${task.id}`}
                                    className="font-medium text-gray-900 hover:text-blue-600"
                                  &gt;
                                    {task.title}
                                  &lt;/Link&gt;
                                  &lt;span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(task.status)}`}&gt;
                                    {task.status.replace('_', ' ')}
                                  &lt;/span&gt;
                                  {task.is_urgent &amp;&amp; (
                                    &lt;span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700"&gt;
                                      Urgent
                                    &lt;/span&gt;
                                  )}
                                &lt;/div&gt;
                                &lt;p className="text-gray-600 text-sm line-clamp-2 mb-2"&gt;{task.description}&lt;/p&gt;
                                &lt;div className="flex items-center gap-4 text-sm text-gray-500"&gt;
                                  &lt;span&gt;📍 {task.location}&lt;/span&gt;
                                  {task.budget &amp;&amp; &lt;span className="text-green-600 font-medium"&gt;€{task.budget}&lt;/span&gt;}
                                &lt;/div&gt;
                              &lt;/div&gt;
                              
                              {/* Actions */}
                              &lt;div className="flex flex-col gap-2 min-w-[120px]"&gt;
                                {task.status === 'pending_confirmation' &amp;&amp; (
                                  &lt;button
                                    onClick={() => handleConfirmTask(task.id)}
                                    className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                  &gt;
                                    ✓ Confirm Done
                                  &lt;/button&gt;
                                )}
                                {task.status === 'open' &amp;&amp; (
                                  &lt;&gt;
                                    &lt;Link
                                      to={`/tasks/${task.id}/edit`}
                                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                                    &gt;
                                      ✏️ Edit
                                    &lt;/Link&gt;
                                    &lt;button
                                      onClick={() => handleCancelTask(task.id)}
                                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    &gt;
                                      Cancel
                                    &lt;/button&gt;
                                  &lt;/&gt;
                                )}
                                {['assigned', 'in_progress'].includes(task.status) &amp;&amp; (
                                  &lt;Link
                                    to={`/tasks/${task.id}`}
                                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                                  &gt;
                                    View Details
                                  &lt;/Link&gt;
                                )}
                                {task.status === 'completed' &amp;&amp; (
                                  &lt;Link
                                    to={`/tasks/${task.id}`}
                                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                                  &gt;
                                    View Details
                                  &lt;/Link&gt;
                                )}
                              &lt;/div&gt;
                            &lt;/div&gt;
                          &lt;/div&gt;
                        ))}
                      &lt;/div&gt;
                    )}
                  &lt;/&gt;
                )}
              &lt;/&gt;
            )}
          &lt;/div&gt;
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' &amp;&amp; (
          &lt;div className="bg-white rounded-lg shadow-md p-6"&gt;
            &lt;h2 className="text-xl font-bold text-gray-900 mb-4"&gt;Reviews&lt;/h2&gt;
            
            {reviews.length === 0 ? (
              &lt;p className="text-gray-500 text-center py-8"&gt;
                No reviews yet. Complete tasks to receive reviews!
              &lt;/p&gt;
            ) : (
              &lt;div className="space-y-4"&gt;
                {reviews.map(review => (
                  &lt;div key={review.id} className="border-b pb-4 last:border-b-0"&gt;
                    {editingReview === review.id ? (
                      // Edit mode
                      &lt;div className="space-y-3"&gt;
                        &lt;div&gt;
                          &lt;label className="block text-sm font-medium text-gray-700 mb-2"&gt;Rating&lt;/label&gt;
                          {renderEditableStars(reviewEditData.rating, (rating) =&gt; 
                            setReviewEditData(prev => ({ ...prev, rating }))
                          )}
                        &lt;/div&gt;
                        &lt;div&gt;
                          &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;Comment&lt;/label&gt;
                          &lt;textarea
                            value={reviewEditData.content}
                            onChange={(e) => setReviewEditData(prev => ({ ...prev, content: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          /&gt;
                        &lt;/div&gt;
                        &lt;div className="flex gap-2"&gt;
                          &lt;button
                            onClick={() => handleSaveReview(review.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          &gt;
                            Save
                          &lt;/button&gt;
                          &lt;button
                            onClick={() => setEditingReview(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          &gt;
                            Cancel
                          &lt;/button&gt;
                        &lt;/div&gt;
                      &lt;/div&gt;
                    ) : (
                      // View mode
                      &lt;div className="flex items-start gap-3"&gt;
                        &lt;div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"&gt;
                          {review.reviewer_avatar ? (
                            &lt;img src={review.reviewer_avatar} alt="" className="w-full h-full rounded-full object-cover" /&gt;
                          ) : (
                            &lt;span className="text-gray-500"&gt;{review.reviewer_name?.charAt(0).toUpperCase()}&lt;/span&gt;
                          )}
                        &lt;/div&gt;
                        &lt;div className="flex-1"&gt;
                          &lt;div className="flex items-center gap-2 mb-1"&gt;
                            &lt;span className="font-medium text-gray-900"&gt;{review.reviewer_name}&lt;/span&gt;
                            {renderStars(review.rating)}
                          &lt;/div&gt;
                          {review.content &amp;&amp; (
                            &lt;p className="text-gray-600"&gt;{review.content}&lt;/p&gt;
                          )}
                          &lt;p className="text-xs text-gray-400 mt-1"&gt;
                            {new Date(review.created_at).toLocaleDateString()}
                          &lt;/p&gt;
                        &lt;/div&gt;
                        {user &amp;&amp; review.reviewer_id === user.id &amp;&amp; (
                          &lt;div className="flex gap-2"&gt;
                            &lt;button
                              onClick={() => handleEditReview(review)}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            &gt;
                              Edit
                            &lt;/button&gt;
                            &lt;button
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-sm text-red-600 hover:text-red-700"
                            &gt;
                              Delete
                            &lt;/button&gt;
                          &lt;/div&gt;
                        )}
                      &lt;/div&gt;
                    )}
                  &lt;/div&gt;
                ))}
              &lt;/div&gt;
            )}
          &lt;/div&gt;
        )}
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default Profile;
