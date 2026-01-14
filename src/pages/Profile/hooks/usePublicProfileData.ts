import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import apiClient from '../../../api/client';
import { listingsApi, type Listing } from '../../../api/listings';
import { Task, getTasksByUser } from '../../../api/tasks';
import { getOfferingsByUser, Offering } from '../../../api/offerings';
import type { UserProfile, Review } from '../types';

export const usePublicProfileData = (userId: number | undefined) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === userId;

  // Fetch profile
  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/api/auth/users/${userId}`);
      setProfile(response.data);
      
      // Fetch reviews
      try {
        const reviewsResponse = await apiClient.get(`/api/auth/users/${userId}/reviews`);
        setReviews(reviewsResponse.data.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err?.response?.data?.error || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's listings
  const fetchListings = async () => {
    if (!userId) return;
    
    try {
      setListingsLoading(true);
      const response = await listingsApi.getByUser(userId);
      // Filter to only active listings for public view
      setListings((response.listings || []).filter((l: Listing) => l.status === 'active'));
    } catch (err) {
      console.error('Error fetching listings:', err);
      setListings([]);
    } finally {
      setListingsLoading(false);
    }
  };

  // Fetch user's offerings
  const fetchOfferings = async () => {
    if (!userId) return;
    
    try {
      setOfferingsLoading(true);
      const response = await getOfferingsByUser(userId);
      // Filter to only active offerings for public view
      setOfferings((response.offerings || []).filter((o: Offering) => o.status === 'active'));
    } catch (err) {
      console.error('Error fetching offerings:', err);
      setOfferings([]);
    } finally {
      setOfferingsLoading(false);
    }
  };

  // Fetch user's tasks
  const fetchTasks = async () => {
    if (!userId) return;
    
    try {
      setTasksLoading(true);
      const response = await getTasksByUser(userId);
      // Filter to only open tasks for public view
      setTasks((response.tasks || []).filter((t: Task) => t.status === 'open'));
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!userId) return;
    
    // If viewing own profile, redirect to /profile
    if (isOwnProfile) {
      navigate('/profile');
      return;
    }
    
    fetchProfile();
    fetchListings();
    fetchOfferings();
    fetchTasks();
  }, [userId, isOwnProfile]);

  return {
    // Data
    profile,
    reviews,
    setReviews,
    listings,
    offerings,
    tasks,
    
    // Loading states
    loading,
    listingsLoading,
    offeringsLoading,
    tasksLoading,
    
    // Error
    error,
    
    // User info
    currentUser,
    isOwnProfile,
  };
};
