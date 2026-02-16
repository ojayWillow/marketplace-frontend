import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { geocodeAddress, GeocodingResult, useAuthStore, useToastStore, apiClient } from '@marketplace/shared';
import { useTask } from '../../../api/hooks';
import { EditTaskFormData, INITIAL_EDIT_TASK_FORM } from '../types';

export const useEditTaskForm = () => {
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
  // This prevents geocoding from firing when the form first loads
  // with the existing task location, which would show the suggestions
  // dropdown immediately and make it look like two location boxes.
  const locationTouched = useRef(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Please login to edit tasks');
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Initialize form when task loads
  useEffect(() => {
    if (task && !formInitialized) {
      if (task.creator_id !== user?.id) {
        toast.error('You can only edit your own tasks');
        navigate('/tasks');
        return;
      }
      if (task.status !== 'open') {
        toast.error('Only open tasks can be edited');
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
      });
      setFormInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, formInitialized, user?.id]);

  // Handle load error
  useEffect(() => {
    if (error) {
      toast.error('Failed to load task');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !task) {
      toast.error('Unable to update task');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a task description');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Please enter a location');
      return;
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
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        deadline: formData.deadline || undefined,
        difficulty: formData.difficulty,
      };

      await apiClient.put(`/api/tasks/${id}`, updateData);
      queryClient.invalidateQueries({ queryKey: ['task', Number(id)] });
      toast.success('Task updated successfully!');
      navigate('/tasks');
    } catch (err: any) {
      console.error('Error updating task:', err);
      toast.error(err?.response?.data?.error || 'Failed to update task. Please try again.');
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
    selectAddress,
    handleSubmit,
    navigate,
  };
};
