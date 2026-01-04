import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTask, Task } from '../api/tasks';
import { geocodeAddress, GeocodingResult } from '../api/geocoding';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import apiClient from '../api/client';

const EditTask = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<GeocodingResult[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'delivery',
    budget: '',
    location: '',
    latitude: 56.9496,
    longitude: 24.1052,
    deadline: '',
    priority: 'normal',
    is_urgent: false
  });

  const categories = [
    { value: 'pet-care', label: '🐕 Pet Care', icon: '🐕' },
    { value: 'moving', label: '📦 Moving', icon: '📦' },
    { value: 'shopping', label: '🛒 Shopping', icon: '🛒' },
    { value: 'cleaning', label: '🧹 Cleaning', icon: '🧹' },
    { value: 'delivery', label: '📄 Delivery', icon: '📄' },
    { value: 'outdoor', label: '🌿 Outdoor', icon: '🌿' },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Please login to edit tasks');
      navigate('/login');
      return;
    }
    
    if (id) {
      fetchTask();
    }
  }, [id, isAuthenticated]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const taskData = await getTask(Number(id));
      setTask(taskData);
      
      // Check if user owns this task
      if (taskData.creator_id !== user?.id) {
        toast.error('You can only edit your own tasks');
        navigate('/tasks');
        return;
      }
      
      // Check if task can be edited (only open tasks)
      if (taskData.status !== 'open') {
        toast.error('Only open tasks can be edited');
        navigate('/tasks');
        return;
      }
      
      setFormData({
        title: taskData.title || '',
        description: taskData.description || '',
        category: taskData.category || 'delivery',
        budget: taskData.budget?.toString() || '',
        location: taskData.location || '',
        latitude: taskData.latitude || 56.9496,
        longitude: taskData.longitude || 24.1052,
        deadline: taskData.deadline ? taskData.deadline.slice(0, 16) : '',
        priority: taskData.priority || 'normal',
        is_urgent: taskData.is_urgent || false
      });
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Failed to load task');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  // Debounced geocoding search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.location.length > 3) {
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
      } else {
        setAddressSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.location]);

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
        priority: formData.priority,
        is_urgent: formData.is_urgent
      };

      await apiClient.put(`/api/tasks/${id}`, updateData);
      toast.success('Task updated successfully!');
      navigate('/tasks');
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error(error?.response?.data?.error || 'Failed to update task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const selectAddress = (result: GeocodingResult) => {
    setFormData(prev => ({
      ...prev,
      location: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    }));
    setAddressSuggestions([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task not found</h2>
          <button
            onClick={() => navigate('/tasks')}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Task</h1>
          <p className="text-gray-600 mb-6">Update your task details</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Need help moving furniture"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Provide details about what help you need..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location with Geocoding */}
            <div className="relative">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location * {searchingAddress && <span className="text-blue-500 text-xs">(searching...)</span>}
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Riga, Centrs or Brivibas iela 1, Riga"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="off"
              />
              
              {/* Address Suggestions Dropdown */}
              {addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {addressSuggestions.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectAddress(result)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm text-gray-900">{result.display_name}</div>
                    </button>
                  ))}
                </div>
              )}
              
              {formData.location && (
                <p className="text-xs text-gray-500 mt-1">
                  📍 Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </p>
              )}
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget (EUR) *
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                step="0.01"
                min="0"
                required
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., 25.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">How much are you willing to pay for this task?</p>
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="datetime-local"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Urgent Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_urgent"
                name="is_urgent"
                checked={formData.is_urgent}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_urgent" className="ml-2 text-sm text-gray-700">
                This is an urgent task
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/tasks')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTask;
