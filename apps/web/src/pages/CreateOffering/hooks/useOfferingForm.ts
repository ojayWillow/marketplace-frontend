import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createOffering, boostOffering, useAuthStore, useToastStore } from '@marketplace/shared';
import { GeocodingResult } from '@marketplace/shared';
import { OfferingFormData, INITIAL_FORM_DATA } from '../types';

export const useOfferingForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();

  const [formData, setFormData] = useState<OfferingFormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOfferingId, setCreatedOfferingId] = useState<number | null>(null);
  const [activating, setActivating] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning(t('offerings.loginToOffer', 'Please login to create an offering'));
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const updateField = <K extends keyof OfferingFormData>(field: K, value: OfferingFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectAddress = (result: GeocodingResult) => {
    setFormData(prev => ({
      ...prev,
      location: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error(t('createOffering.loginRequired', 'You must be logged in to create an offering'));
      navigate('/login');
      return;
    }

    if (!formData.title.trim()) {
      toast.error(t('createOffering.titleRequired', 'Please enter a title for your offering'));
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (!formData.description.trim()) {
      toast.error(t('createOffering.descriptionRequired', 'Please describe your service'));
      return;
    }

    if (!formData.location.trim()) {
      toast.error(t('createOffering.locationRequired', 'Please enter your service area'));
      return;
    }

    setLoading(true);

    try {
      const offeringData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        price: formData.price ? parseFloat(formData.price) : undefined,
        price_type: formData.price_type,
        availability: formData.availability || undefined,
        experience: formData.experience || undefined,
        service_radius: parseFloat(formData.service_radius) || 25,
      };

      const response = await createOffering(offeringData);
      setCreatedOfferingId(response.offering?.id || response.id || null);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error creating offering:', error);
      toast.error(error?.response?.data?.error || t('createOffering.error', 'Failed to create offering. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleBoostTrial = async () => {
    if (!createdOfferingId) return;

    setActivating(true);
    try {
      await boostOffering(createdOfferingId);
      setIsBoosted(true);
      toast.success(t('createOffering.boostActivated', '🚀 Boost activated! Your service is now visible on the map.'));
    } catch (error: any) {
      console.error('Error boosting offering:', error);
      toast.error(error?.response?.data?.error || t('createOffering.boostError', 'Failed to activate boost. Please try again.'));
    } finally {
      setActivating(false);
    }
  };

  const handleViewOnMap = () => {
    setShowSuccessModal(false);
    navigate('/tasks?tab=offerings');
  };

  const closeModalAndNavigate = (path: string) => {
    setShowSuccessModal(false);
    navigate(path);
  };

  return {
    formData,
    loading,
    showSuccessModal,
    createdOfferingId,
    activating,
    isBoosted,
    updateField,
    handleChange,
    selectAddress,
    handleSubmit,
    handleBoostTrial,
    handleViewOnMap,
    closeModalAndNavigate,
  };
};
