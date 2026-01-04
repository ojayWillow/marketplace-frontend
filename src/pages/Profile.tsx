import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import apiClient from '../api/client';
import { listingsApi, type Listing } from '../api/listings';
import { getImageUrl } from '../api/uploads';

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

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuth, token } = useAuthStore();
  const toast = useToastStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'listings' | 'reviews'>('about');
  
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
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'listings' && myListings.length === 0 && !listingsLoading) {
      fetchMyListings();
    }
  }, [activeTab]);

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
      toast.error('Failed to load your listings');
    } finally {
      setListingsLoading(false);
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

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put('/api/auth/profile', formData);
      setProfile(response.data.user);
      
      // Update auth store with new user data
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'sold':
        return 'bg-blue-100 text-blue-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profile.avatar_url || profile.profile_picture_url ? (
                  <img 
                    src={profile.avatar_url || profile.profile_picture_url} 
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                  <input
                    type="url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleChange}
                    placeholder="https://example.com/my-photo.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter a URL to your profile picture</p>
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
                    </div>
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
