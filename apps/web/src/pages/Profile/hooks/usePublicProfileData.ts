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
  
  // Single loading state for everything
  const [loading, setLoading] = useState(true);
  
  // Individual loading states (for tab spinners if needed)
  const [listingsLoading, setListingsLoading] = useState(false);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === userId;

  // Fetch all data in parallel
  const fetchAllData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch everything in parallel
      const [profileRes, reviewsRes, offeringsRes, tasksRes, listingsRes] = await Promise.all([
        apiClient.get(`/api/auth/users/${userId}`).catch(err => ({ data: null, error: err })),
        apiClient.get(`/api/auth/users/${userId}/reviews`).catch(() => ({ data: { reviews: [] } })),
        getOfferingsByUser(userId).catch(() => ({ offerings: [] })),
        getTasksByUser(userId).catch(() => ({ tasks: [] })),
        listingsApi.getByUser(userId).catch(() => ({ listings: [] })),
      ]);
      
      // Check if profile fetch failed
      if (!profileRes.data || (profileRes as any).error) {
        const err = (profileRes as any).error;
        setError(err?.response?.data?.error || 'User not found');
        setLoading(false);
        return;
      }
      
      // Set all data at once
      setProfile(profileRes.data);
      setReviews(reviewsRes.data?.reviews || []);
      setOfferings((offeringsRes.offerings || []).filter((o: Offering) => o.status === 'active'));
      setTasks((tasksRes.tasks || []).filter((t: Task) => t.status === 'open'));
      setListings((listingsRes.listings || []).filter((l: Listing) => l.status === 'active'));
      
    } catch (err: any) {
      console.error('Error fetching profile data:', err);
      setError(err?.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
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
    
    fetchAllData();
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
