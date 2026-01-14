import { useState, useEffect, useCallback } from 'react';
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
  
  // Loading states - main loading covers initial page load
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

  // Individual fetch functions (for refreshing specific data)
  const fetchProfile = useCallback(async () => {
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
    
    return response.data;
  }, []);

  const fetchMyListings = useCallback(async () => {
    setListingsLoading(true);
    try {
      const response = await listingsApi.getMy();
      setMyListings(response.listings || []);
      return response.listings || [];
    } finally {
      setListingsLoading(false);
    }
  }, []);

  const fetchMyOfferings = useCallback(async () => {
    setOfferingsLoading(true);
    try {
      const response = await getMyOfferings();
      setMyOfferings(response.offerings || []);
      return response.offerings || [];
    } finally {
      setOfferingsLoading(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const created = await getCreatedTasks();
      setCreatedTasks(created.tasks || []);
      return created.tasks || [];
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setApplicationsLoading(true);
    try {
      const response = await getMyApplications();
      setMyApplications(response.applications || []);
      return response.applications || [];
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  // Fetch match counts for open tasks
  const fetchMatchCountsForTasks = useCallback(async (tasks: Task[], userId?: number) => {
    const openTasks = tasks.filter(t => t.status === 'open' && t.latitude && t.longitude);
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
        const filtered = (response.offerings || []).filter(o => o.creator_id !== userId);
        counts[task.id] = filtered.length;
      } catch (error) {
        console.error(`Error fetching matches for task ${task.id}:`, error);
        counts[task.id] = 0;
      }
    }));

    setTaskMatchCounts(counts);
  }, []);

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

  // Initial data fetch - ALL DATA IN PARALLEL
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadAllData = async () => {
      setLoading(true);
      
      try {
        // Fetch ALL data in parallel for faster loading
        const [profileData, listings, offerings, tasks, applications] = await Promise.all([
          // Profile + reviews
          (async () => {
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
            
            // Fetch reviews (can be parallel with profile data processing)
            if (response.data.id) {
              try {
                const reviewsResponse = await apiClient.get(`/api/auth/users/${response.data.id}/reviews`);
                setReviews(reviewsResponse.data.reviews || []);
              } catch (e) {
                console.error('Error fetching reviews:', e);
              }
            }
            
            return response.data;
          })(),
          
          // Listings
          listingsApi.getMy().then(r => {
            const items = r.listings || [];
            setMyListings(items);
            return items;
          }).catch(e => {
            console.error('Error fetching listings:', e);
            return [];
          }),
          
          // Offerings
          getMyOfferings().then(r => {
            const items = r.offerings || [];
            setMyOfferings(items);
            return items;
          }).catch(e => {
            console.error('Error fetching offerings:', e);
            return [];
          }),
          
          // Created tasks
          getCreatedTasks().then(r => {
            const items = r.tasks || [];
            setCreatedTasks(items);
            return items;
          }).catch(e => {
            console.error('Error fetching tasks:', e);
            return [];
          }),
          
          // Applications
          getMyApplications().then(r => {
            const items = r.applications || [];
            setMyApplications(items);
            return items;
          }).catch(e => {
            console.error('Error fetching applications:', e);
            return [];
          }),
        ]);

        // Fetch match counts for tasks (secondary priority, can load after main content)
        if (tasks.length > 0 && profileData?.id) {
          // Don't await this - let it load in background
          fetchMatchCountsForTasks(tasks, profileData.id);
        }
        
      } catch (error) {
        console.error('Error loading profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [isAuthenticated, navigate, toast, fetchMatchCountsForTasks]);

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
