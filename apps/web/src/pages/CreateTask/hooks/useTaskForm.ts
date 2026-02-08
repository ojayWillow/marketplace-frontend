import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createTask, geocodeAddress, GeocodingResult, useAuthStore, useToastStore } from '@marketplace/shared';
import { TaskFormData, INITIAL_TASK_FORM } from '../types';

export const useTaskForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();

  const [formData, setFormData] = useState<TaskFormData>(INITIAL_TASK_FORM);
  const [loading, setLoading] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<GeocodingResult[]>([]);
  const [locationStatus, setLocationStatus] = useState<'none' | 'typing' | 'exact' | 'approximate'>('none');
  const selectedFromSuggestions = useRef(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning(t('tasks.pleaseLogin', 'Please login to create a task'));
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Debounced geocoding search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.location.length > 3) {
        if (!selectedFromSuggestions.current) {
          setLocationStatus('typing');
          try {
            setSearchingAddress(true);
            const results = await geocodeAddress(formData.location);
            setAddressSuggestions(results);
          } catch (error) {
            console.error('Geocoding error:', error);
            setAddressSuggestions([]);
          } finally {
            setSearchingAddress(false);
          }
        }
      } else {
        setAddressSuggestions([]);
        if (formData.location.length === 0) setLocationStatus('none');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.location]);

  const updateField = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'location') {
      selectedFromSuggestions.current = false;
      setLocationStatus('typing');
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const selectAddress = (result: GeocodingResult) => {
    selectedFromSuggestions.current = true;
    setFormData(prev => ({
      ...prev,
      location: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    }));
    setAddressSuggestions([]);
    setLocationStatus('exact');
  };

  // Auto-geocode if user typed but didn't select
  const ensureCoordinates = async (): Promise<boolean> => {
    if (formData.latitude !== 0 && formData.longitude !== 0 && selectedFromSuggestions.current) {
      return true;
    }
    if (!formData.location.trim()) {
      toast.error(t('createTask.locationRequired', 'Please enter a location'));
      return false;
    }
    try {
      setSearchingAddress(true);
      const results = await geocodeAddress(formData.location);
      if (results.length > 0) {
        const first = results[0];
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(first.lat),
          longitude: parseFloat(first.lon),
        }));
        setLocationStatus('approximate');
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
    } finally {
      setSearchingAddress(false);
    }
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
      let deadline: string | undefined;
      if (formData.deadlineDate) {
        deadline = formData.deadlineTime
          ? `${formData.deadlineDate}T${formData.deadlineTime}`
          : `${formData.deadlineDate}T23:59`;
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        creator_id: user.id,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        deadline,
        priority: formData.difficulty,
        is_urgent: formData.is_urgent,
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
    searchingAddress,
    addressSuggestions,
    locationStatus,
    updateField,
    handleChange,
    selectAddress,
    handleSubmit,
  };
};
