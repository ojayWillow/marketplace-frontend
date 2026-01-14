import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { useToastStore } from '../../../stores/toastStore';
import apiClient from '../../../api/client';
import { listingsApi, type Listing } from '../../../api/listings';
import { Task, TaskApplication, getCreatedTasks, getMyApplications } from '../../../api/tasks';
import { getMyOfferings, Offering, getOfferings } from '../../../api/offerings';
import type { UserProfile, Review, TaskMatchCounts, ProfileFormData } from '../types';

export const useProfileData = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuth, token } = useAuthStore();
  const toast = useToastStore();
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myOfferings, setMyOfferings] = useState<Offering[]>([]);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [myApplications, setMyApplications] = useState<TaskApplication[]>([]);
  const [taskMatchCounts, setTaskMatchCounts] = useState<TaskMatchCounts>({});
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  
  // Edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    bio: '',
    phone: '',
    city: '',
    country: '',
    avatar_url: '',
  });

  // Fetch functions
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
        const filtered = (response.offerings || []).filter(o => o.creator_id !== user?.id);
        counts[task.id] = filtered.length;
      } catch (error) {
        console.error(`Error fetching matches for task ${task.id}:`, error);
        counts[task.id] = 0;
      }
    }));

    setTaskMatchCounts(counts);
  };

  // Save profile
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

  // Initial data fetch
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

  // Fetch match counts when tasks are loaded
  useEffect(() => {
    if (createdTasks.length > 0 && user?.id) {
      fetchMatchCountsForTasks();
    }
  }, [createdTasks, user?.id]);

  return {
    // Data
    profile,
    reviews,
    setReviews,
    myListings,
    setMyListings,
    myOfferings,
    setMyOfferings,
    createdTasks,
    myApplications,
    taskMatchCounts,
    user,
    token,
    
    // Loading states
    loading,
    listingsLoading,
    offeringsLoading,
    tasksLoading,
    applicationsLoading,
    
    // Edit state
    editing,
    setEditing,
    saving,
    formData,
    setFormData,
    
    // Actions
    handleSave,
    handleChange,
    fetchTasks,
    fetchApplications,
  };
};
