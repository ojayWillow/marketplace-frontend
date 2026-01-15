import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { useToastStore } from '../../../stores/toastStore';
import apiClient from '../../../api/client';
import type { Listing } from '../../../api/listings';
import { Task, TaskApplication } from '../../../api/tasks';
import { Offering } from '../../../api/offerings';
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
  
  // Loading states - single loading state for the combined endpoint
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

  // Individual fetch functions (for refreshing specific data after actions)
  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const response = await apiClient.get('/api/tasks/created');
      setCreatedTasks(response.data.tasks || []);
      return response.data.tasks || [];
    } catch (e) {
      console.error('Error fetching tasks:', e);
      return [];
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setApplicationsLoading(true);
    try {
      const response = await apiClient.get('/api/tasks/applications/mine');
      setMyApplications(response.data.applications || []);
      return response.data.applications || [];
    } catch (e) {
      console.error('Error fetching applications:', e);
      return [];
    } finally {
      setApplicationsLoading(false);
    }
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

  // Initial data fetch - SINGLE API CALL for all data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadAllData = async () => {
      setLoading(true);
      
      try {
        // Single API call that returns everything
        const response = await apiClient.get('/api/auth/profile/full');
        const data = response.data;
        
        // Set profile
        setProfile(data.profile);
        setFormData({
          first_name: data.profile.first_name || '',
          last_name: data.profile.last_name || '',
          bio: data.profile.bio || '',
          phone: data.profile.phone || '',
          city: data.profile.city || '',
          country: data.profile.country || '',
          avatar_url: data.profile.avatar_url || data.profile.profile_picture_url || '',
        });
        
        // Set all related data
        setReviews(data.reviews || []);
        setMyListings(data.listings || []);
        setMyOfferings(data.offerings || []);
        setCreatedTasks(data.created_tasks || []);
        setMyApplications(data.applications || []);
        
      } catch (error) {
        console.error('Error loading profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [isAuthenticated, navigate, toast]);

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
