import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../api/tasks';
import { geocodeAddress, GeocodingResult } from '../api/geocoding';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

const CreateTask = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const [loading, setLoading] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<GeocodingResult[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'delivery',
    budget: '',
    location: '',
    latitude: 56.9496,
    longitude: 24.1052,
    deadlineDate: '',
    deadlineTime: '',
    difficulty: 'medium',
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

  const difficulties = [
    { value: 'easy', label: '🟢 Easy', description: 'Simple task, minimal effort' },
    { value: 'medium', label: '🟡 Medium', description: 'Moderate effort required' },
    { value: 'hard', label: '🔴 Hard', description: 'Challenging, requires skill or strength' },
  ];

  // Generate time options in 15-minute intervals
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      const time24 = `${hourStr}:${minuteStr}`;
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const timeLabel = `${hour12}:${minuteStr} ${ampm}`;
      timeOptions.push({ value: time24, label: timeLabel });
    }
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Please login to create a task');
      navigate('/login');
    }
  }, [isAuthenticated]);

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
    
    if (!user?.id) {
      toast.error('You must be logged in to create a task');
      navigate('/login');
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
    
    setLoading(true);

    try {
      // Combine date and time for deadline
      let deadline: string | undefined;
      if (formData.deadlineDate) {
        if (formData.deadlineTime) {
          deadline = `${formData.deadlineDate}T${formData.deadlineTime}`;
        } else {
          deadline = `${formData.deadlineDate}T23:59`;
        }
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
        deadline: deadline,
        priority: formData.difficulty, // Map difficulty to priority field in backend
        is_urgent: formData.is_urgent
      };

      await createTask(taskData);
      toast.success('Task created successfully! It will now appear in Quick Help.');
      navigate('/tasks');
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error?.response?.data?.error || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
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

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Quick Help Job</h1>
          <p className="text-gray-600 mb-6">Post a task and get help from people nearby</p>

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

            {/* Deadline - Split into Date and Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline (Optional)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="deadlineDate" className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    id="deadlineDate"
                    name="deadlineDate"
                    value={formData.deadlineDate}
                    onChange={handleChange}
                    min={today}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="deadlineTime" className="block text-xs text-gray-500 mb-1">Time</label>
                  <select
                    id="deadlineTime"
                    name="deadlineTime"
                    value={formData.deadlineTime}
                    onChange={handleChange}
                    disabled={!formData.deadlineDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Any time</option>
                    {timeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">When do you need this task completed by?</p>
            </div>

            {/* Difficulty (was Priority) */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                How hard is this task?
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {difficulties.find(d => d.value === formData.difficulty)?.description}
              </p>
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
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Creating...' : 'Create Task'}
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

export default CreateTask;
