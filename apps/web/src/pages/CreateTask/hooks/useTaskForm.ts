import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createTask, geocodeAddress, GeocodingResult, reverseGeocode, useAuthStore, useToastStore, uploadTaskImageFile } from '@marketplace/shared';
import { TaskFormData, INITIAL_TASK_FORM } from '../types';

/**
 * Strip any "URGENT:" prefix the user may have typed.
 * The is_urgent flag handles urgency — no need to bake it into the title.
 */
const stripUrgentPrefix = (title: string): string => {
  return title.replace(/^URGENT:\s*/i, '').trim();
};

export const useTaskForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();

  const [formData, setFormData] = useState<TaskFormData>(INITIAL_TASK_FORM);
  const [loading, setLoading] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning(t('tasks.pleaseLogin', 'Please login to create a task'));
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const updateField = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'location') {
      setLocationConfirmed(false);
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // When user selects an address from the suggestion dropdown
  const selectAddress = (result: GeocodingResult) => {
    setFormData(prev => ({
      ...prev,
      location: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    }));
    setLocationConfirmed(true);
  };

  // When user taps the map or drags the pin — reverse geocode to get address
  const setCoordsFromMap = useCallback(async (lat: number, lng: number) => {
    // Immediately update coordinates so pin moves
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    // Reverse geocode to get the address string
    try {
      const result = await reverseGeocode(lat, lng);
      if (result?.display_name) {
        setFormData(prev => ({
          ...prev,
          location: result.display_name,
          latitude: lat,
          longitude: lng,
        }));
        setLocationConfirmed(true);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      setFormData(prev => ({
        ...prev,
        location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      }));
      setLocationConfirmed(false);
    }
  }, []);

  // Auto-geocode if user typed but didn't select
  const ensureCoordinates = async (): Promise<boolean> => {
    if (locationConfirmed && formData.latitude !== 0 && formData.longitude !== 0) {
      return true;
    }
    if (!formData.location.trim()) {
      toast.error(t('createTask.locationRequired', 'Please enter a location'));
      return false;
    }
    try {
      const results = await geocodeAddress(formData.location);
      if (results.length > 0) {
        const first = results[0];
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(first.lat),
          longitude: parseFloat(first.lon),
        }));
        toast.info(t('createTask.locationApproximate', 'Location set to approximate area: {{area}}', {
          area: first.display_name.split(',').slice(0, 2).join(', '),
        }));
        return true;
      } else {
        toast.error(t('createTask.locationNotFound', 'Could not find this location. Please select from the suggestions or try a different address.'));
        return false;
      }
    } catch (error) {
      console.error('Auto-geocoding error:', error);
      toast.error(t('createTask.locationError', 'Failed to find location. Please try again.'));
      return false;
    }
  };

  // Upload images and return their URLs
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      try {
        const url = await uploadTaskImageFile(file);
        urls.push(url);
      } catch (error) {
        console.error('Error uploading image:', error);
        // Continue uploading remaining images
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error(t('createTask.loginRequired', 'You must be logged in to create a task'));
      navigate('/login');
      return;
    }
    if (!formData.title.trim()) {
      toast.error(t('createTask.titleRequired', 'Please enter a task title'));
      return;
    }
    if (!formData.description.trim()) {
      toast.error(t('createTask.descriptionRequired', 'Please enter a task description'));
      return;
    }
    if (!formData.location.trim()) {
      toast.error(t('createTask.locationRequired', 'Please enter a location'));
      return;
    }

    setLoading(true);
    const hasValidCoords = await ensureCoordinates();
    if (!hasValidCoords) {
      setLoading(false);
      return;
    }

    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        toast.info(t('createTask.uploadingImages', 'Uploading images...'));
        imageUrls = await uploadImages(formData.images);
        if (imageUrls.length < formData.images.length) {
          toast.warning(t('createTask.someImagesFailed', 'Some images failed to upload, but continuing with task creation.'));
        }
      }

      let deadline: string | undefined;
      if (formData.deadlineDate) {
        deadline = formData.deadlineTime
          ? `${formData.deadlineDate}T${formData.deadlineTime}`
          : `${formData.deadlineDate}T23:59`;
      }

      const taskData = {
        title: stripUrgentPrefix(formData.title),
        description: formData.description,
        category: formData.category,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        creator_id: user.id,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        deadline,
        difficulty: formData.difficulty,
        is_urgent: formData.is_urgent,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      };

      await createTask(taskData);
      toast.success(t('createTask.success', 'Task created successfully! It will now appear in Quick Help.'));
      navigate('/tasks');
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error?.response?.data?.error || t('createTask.error', 'Failed to create task. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    locationConfirmed,
    updateField,
    handleChange,
    selectAddress,
    setCoordsFromMap,
    handleSubmit,
  };
};
