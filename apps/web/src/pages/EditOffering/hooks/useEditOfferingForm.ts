import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { updateOffering, geocodeAddress, GeocodingResult, useAuthStore, useToastStore } from '@marketplace/shared';
import { useOffering } from '../../../api/hooks';
import { EditOfferingFormData, INITIAL_EDIT_FORM } from '../types';

export const useEditOfferingForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const queryClient = useQueryClient();

  const { data: offering, isLoading: loading, error } = useOffering(Number(id));

  const [formData, setFormData] = useState<EditOfferingFormData>(INITIAL_EDIT_FORM);
  const [saving, setSaving] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<GeocodingResult[]>([]);
  const [formInitialized, setFormInitialized] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning(t('offerings.loginToEdit', 'Please login to edit offerings'));
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Initialize form when offering loads
  useEffect(() => {
    if (offering && !formInitialized) {
      if (offering.creator_id !== user?.id) {
        toast.error(t('editOffering.notOwner', 'You can only edit your own offerings'));
        navigate('/profile?tab=offerings');
        return;
      }
      setFormData({
        title: offering.title || '',
        description: offering.description || '',
        category: offering.category || 'cleaning',
        price: offering.price?.toString() || '',
        price_type: offering.price_type || 'hourly',
        location: offering.location || '',
        latitude: offering.latitude || 56.9496,
        longitude: offering.longitude || 24.1052,
        availability: offering.availability || '',
        experience: offering.experience || '',
        service_radius: '25',
        status: offering.status || 'active',
      });
      setFormInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offering, formInitialized, user?.id]);

  // Handle load error
  useEffect(() => {
    if (error) {
      toast.error(t('editOffering.loadError', 'Failed to load offering'));
      navigate('/profile?tab=offerings');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // Debounced geocoding search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.location.length > 3) {
        try {
          setSearchingAddress(true);
          const results = await geocodeAddress(formData.location);
          setAddressSuggestions(results);
        } catch (err) {
          console.error('Geocoding error:', err);
          setAddressSuggestions([]);
        } finally {
          setSearchingAddress(false);
        }
      } else {
        setAddressSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateField = <K extends keyof EditOfferingFormData>(field: K, value: EditOfferingFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectAddress = (result: GeocodingResult) => {
    setFormData(prev => ({
      ...prev,
      location: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    }));
    setAddressSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !offering) {
      toast.error(t('editOffering.unableToUpdate', 'Unable to update offering'));
      return;
    }
    if (!formData.title.trim()) {
      toast.error(t('editOffering.titleRequired', 'Please enter a title for your offering'));
      return;
    }
    if (!formData.description.trim()) {
      toast.error(t('editOffering.descriptionRequired', 'Please describe your service'));
      return;
    }
    if (!formData.location.trim()) {
      toast.error(t('editOffering.locationRequired', 'Please enter your service area'));
      return;
    }

    // Price range validation (skip for negotiable)
    if (formData.price_type !== 'negotiable') {
      const priceNum = formData.price ? parseFloat(formData.price) : 0;
      if (!formData.price || isNaN(priceNum) || priceNum < 10 || priceNum > 10000) {
        toast.error(t('editOffering.priceRange', 'Price must be between €10 and €10,000'));
        return;
      }
    }

    setSaving(true);
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        price: formData.price ? parseFloat(formData.price) : undefined,
        price_type: formData.price_type as 'hourly' | 'fixed' | 'negotiable',
        availability: formData.availability || undefined,
        experience: formData.experience || undefined,
        status: formData.status as 'active' | 'paused' | 'closed',
      };

      await updateOffering(Number(id), updateData);
      queryClient.invalidateQueries({ queryKey: ['offering', Number(id)] });
      toast.success(t('editOffering.success', 'Offering updated successfully!'));
      navigate('/profile?tab=offerings');
    } catch (err: any) {
      console.error('Error updating offering:', err);
      toast.error(err?.response?.data?.error || t('editOffering.error', 'Failed to update offering. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    offering,
    loading,
    saving,
    searchingAddress,
    addressSuggestions,
    handleChange,
    updateField,
    selectAddress,
    handleSubmit,
    navigate,
  };
};
