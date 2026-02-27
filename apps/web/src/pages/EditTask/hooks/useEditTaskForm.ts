import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { geocodeAddress, GeocodingResult, useAuthStore, useToastStore, apiClient, uploadTaskImageFile } from '@marketplace/shared';
import { useTask } from '../../../api/hooks';
import { EditTaskFormData, INITIAL_EDIT_TASK_FORM } from '../types';

export const useEditTaskForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const queryClient = useQueryClient();

  const { data: task, isLoading: loading, error } = useTask(Number(id));

  const [formData, setFormData] = useState<EditTaskFormData>(INITIAL_EDIT_TASK_FORM);
  const [saving, setSaving] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<GeocodingResult[]>([]);
  const [formInitialized, setFormInitialized] = useState(false);

  // Track whether the user has manually edited the location field.
  const locationTouched = useRef(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning(t('editTask.pleaseLogin', 'Please login to edit tasks'));
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Initialize form when task loads
  useEffect(() => {
    if (task && !formInitialized) {
      if (task.creator_id !== user?.id) {
        toast.error(t('editTask.onlyOwnTasks', 'You can only edit your own tasks'));
        navigate('/tasks');
        return;
      }
      if (task.status !== 'open') {
        toast.error(t('editTask.onlyOpenTasks', 'Only open tasks can be edited'));
        navigate('/tasks');
        return;
      }
      setFormData({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'delivery',
        budget: task.budget?.toString() || '',
        location: task.location || '',
        latitude: task.latitude || 56.9496,
        longitude: task.longitude || 24.1052,
        deadline: task.deadline ? task.deadline.slice(0, 16) : '',
        difficulty: task.difficulty || 'medium',
        images: [],
        existingImageUrls: task.images || [],
      });
      setFormInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, formInitialized, user?.id]);

  // Handle load error
  useEffect(() => {
    if (error) {
      toast.error(t('editTask.loadError', 'Failed to load task'));
      navigate('/tasks');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // Debounced geocoding — only when user has manually typed in the field
  useEffect(() => {
    if (!locationTouched.current) return;

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
    const { name, value, type } = e.target;
    if (name === 'location') {
      locationTouched.current = true;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const updateField = <K extends keyof EditTaskFormData>(field: K, value: EditTaskFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectAddress = (result: GeocodingResult) => {
    locationTouched.current = false;
    setFormData(prev => ({
      ...prev,
      location: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    }));
    setAddressSuggestions([]);
  };

  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existingImageUrls: prev.existingImageUrls.filter((_, i) => i !== index),
    }));
  };

  // Upload new images and return their URLs
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      try {
        const url = await uploadTaskImageFile(file);
        urls.push(url);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !task) {
      toast.error(t('editTask.unableToUpdate', 'Unable to update task'));
      return;
    }
    if (!formData.title.trim()) {
      toast.error(t('editTask.titleRequired', 'Please enter a task title'));
      return;
    }
    if (!formData.description.trim()) {
      toast.error(t('editTask.descriptionRequired', 'Please enter a task description'));
      return;
    }
    if (!formData.location.trim()) {
      toast.error(t('editTask.locationRequired', 'Please enter a location'));
      return;
    }

    // Budget range validation
    const budgetNum = formData.budget ? parseFloat(formData.budget) : 0;
    if (!formData.budget || isNaN(budgetNum) || budgetNum < 10 || budgetNum > 10000) {
      toast.error(t('editTask.budgetRange', 'Budget must be between \u20AC10 and \u20AC10,000'));
      return;
    }

    setSaving(true);
    try {
      // Upload new images if any
      let newImageUrls: string[] = [];
      if (formData.images.length > 0) {
        toast.info(t('editTask.uploadingImages', 'Uploading images...'));
        newImageUrls = await uploadImages(formData.images);
        if (newImageUrls.length < formData.images.length) {
          toast.warning(t('editTask.someImagesFailed', 'Some images failed to upload, but continuing with update.'));
        }
      }

      // Combine existing (kept) images with newly uploaded ones
      const allImageUrls = [...formData.existingImageUrls, ...newImageUrls];

      const updateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        deadline: formData.deadline || undefined,
        difficulty: formData.difficulty,
        images: allImageUrls.length > 0 ? allImageUrls : undefined,
      };

      await apiClient.put(`/api/tasks/${id}`, updateData);
      queryClient.invalidateQueries({ queryKey: ['task', Number(id)] });
      toast.success(t('editTask.success', 'Task updated successfully!'));
      navigate('/tasks');
    } catch (err: any) {
      console.error('Error updating task:', err);
      toast.error(err?.response?.data?.error || t('editTask.error', 'Failed to update task. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    task,
    loading,
    saving,
    searchingAddress,
    addressSuggestions,
    handleChange,
    updateField,
    selectAddress,
    removeExistingImage,
    handleSubmit,
    navigate,
  };
};
