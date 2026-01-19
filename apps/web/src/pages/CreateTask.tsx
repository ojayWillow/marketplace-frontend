import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createTask } from '../api/tasks';
import { geocodeAddress, GeocodingResult } from '../api/geocoding';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { CATEGORIES, CATEGORY_GROUPS, getCategoryByValue } from '../constants/categories';

const CreateTask = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const [loading, setLoading] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<GeocodingResult[]>([]);
  const [locationStatus, setLocationStatus] = useState<'none' | 'typing' | 'exact' | 'approximate'>('none');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'delivery',
    budget: '',
    location: '',
    latitude: 0, // Start with 0 to know if coordinates were set
    longitude: 0,
    deadlineDate: '',
    deadlineTime: '',
    difficulty: 'medium',
    is_urgent: false
  });

  // Track if user selected from suggestions
  const selectedFromSuggestions = useRef(false);

  const difficulties = [
    { value: 'easy', label: t('createTask.difficultyEasy', '🟢 Easy'), description: t('createTask.difficultyEasyDesc', 'Simple task, minimal effort') },
    { value: 'medium', label: t('createTask.difficultyMedium', '🟡 Medium'), description: t('createTask.difficultyMediumDesc', 'Moderate effort required') },
    { value: 'hard', label: t('createTask.difficultyHard', '🔴 Hard'), description: t('createTask.difficultyHardDesc', 'Challenging, requires skill or strength') },
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
      toast.warning(t('tasks.pleaseLogin', 'Please login to create a task'));
      navigate('/login');
    }
  }, [isAuthenticated]);

  // Debounced geocoding search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.location.length > 3) {
        // Only search if user hasn't already selected from suggestions
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
        if (formData.location.length === 0) {
          setLocationStatus('none');
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.location]);

  // Auto-geocode if user typed location but didn't select from suggestions
  const ensureCoordinates = async (): Promise<boolean> => {
    // If coordinates are already set (user selected from suggestions), we're good
    if (formData.latitude !== 0 && formData.longitude !== 0 && selectedFromSuggestions.current) {
      return true;
    }

    // If no location entered, fail
    if (!formData.location.trim()) {
      toast.error(t('createTask.locationRequired', 'Please enter a location'));
      return false;
    }

    // Try to geocode the typed location
    try {
      setSearchingAddress(true);
      const results = await geocodeAddress(formData.location);
      
      if (results.length > 0) {
        const firstResult = results[0];
        const lat = parseFloat(firstResult.lat);
        const lon = parseFloat(firstResult.lon);
        
        // Update form with geocoded coordinates
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon
        }));
        setLocationStatus('approximate');
        
        toast.info(t('createTask.locationApproximate', 'Location set to approximate area: {{area}}', { area: firstResult.display_name.split(',').slice(0, 2).join(', ') }));
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

    // Ensure we have valid coordinates
    const hasValidCoords = await ensureCoordinates();
    if (!hasValidCoords) {
      setLoading(false);
      return;
    }

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
      toast.success(t('createTask.success', 'Task created successfully! It will now appear in Quick Help.'));
      navigate('/tasks');
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error?.response?.data?.error || t('createTask.error', 'Failed to create task. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Reset selection flag when user manually changes location
    if (name === 'location') {
      selectedFromSuggestions.current = false;
      setLocationStatus('typing');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const selectAddress = (result: GeocodingResult) => {
    selectedFromSuggestions.current = true;
    setFormData(prev => ({
      ...prev,
      location: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    }));
    setAddressSuggestions([]);
    setLocationStatus('exact');
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  // Get selected category info
  const selectedCategory = getCategoryByValue(formData.category);

  // Location status indicator
  const getLocationStatusUI = () => {
    switch (locationStatus) {
      case 'exact':
        return (
          <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>📍 {t('createTask.locationExact', 'Exact location set')}: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</span>
          </div>
        );
      case 'approximate':
        return (
          <div className="flex items-center gap-2 text-amber-600 text-sm mt-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            <span>📍 {t('createTask.locationApproximateLabel', 'Approximate location')}: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</span>
          </div>
        );
      case 'typing':
        return (
          <div className="flex items-center gap-2 text-blue-600 text-sm mt-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span>{t('createTask.locationSelectHint', 'Select from suggestions below for exact location, or we\'ll use approximate area')}</span>
          </div>
        );
      default:
        return (
          <p className="text-xs text-gray-500 mt-1">
            {t('createTask.locationTypeHint', 'Start typing and select from suggestions for exact location')}
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('createTask.title', 'Create Quick Help Job')}</h1>
          <p className="text-gray-600 mb-6">{t('createTask.subtitle', 'Post a task and get help from people nearby')}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createTask.taskTitle', 'Task Title')} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder={t('createTask.taskTitlePlaceholder', 'e.g., Need help moving furniture')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createTask.description', 'Description')} *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder={t('createTask.descriptionPlaceholder', 'Provide details about what help you need...')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category - Grouped */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createTask.category', 'Category')} *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORY_GROUPS.map(group => (
                  <optgroup key={group.name} label={group.name}>
                    {group.categories.map(catValue => {
                      const cat = getCategoryByValue(catValue);
                      if (!cat) return null;
                      return (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
              {selectedCategory && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedCategory.icon} {selectedCategory.description}
                </p>
              )}
            </div>

            {/* Location with Geocoding */}
            <div className="relative">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createTask.location', 'Location')} * {searchingAddress && <span className="text-blue-500 text-xs">({t('common.loading', 'searching...')})</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={t('createTask.locationPlaceholder', 'e.g., Teika, Riga or Brivibas iela 1, Riga')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    locationStatus === 'exact' 
                      ? 'border-green-300 bg-green-50' 
                      : locationStatus === 'approximate'
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-gray-300'
                  }`}
                  autoComplete="off"
                />
                {locationStatus === 'exact' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
                )}
              </div>
              
              {/* Address Suggestions Dropdown */}
              {addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="px-3 py-2 bg-blue-50 border-b text-xs text-blue-700">
                    👆 {t('createTask.selectForExact', 'Select for exact location on map')}
                  </div>
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
              
              {/* Location status indicator */}
              {getLocationStatusUI()}
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createTask.budget', 'Budget (EUR)')} *
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
                placeholder={t('createTask.budgetPlaceholder', 'e.g., 25.00')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{t('createTask.budgetHint', 'How much are you willing to pay for this task?')}</p>
            </div>

            {/* Deadline - Split into Date and Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createTask.deadline', 'Deadline')} ({t('common.optional', 'Optional')})
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="deadlineDate" className="block text-xs text-gray-500 mb-1">{t('createTask.date', 'Date')}</label>
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
                  <label htmlFor="deadlineTime" className="block text-xs text-gray-500 mb-1">{t('createTask.time', 'Time')}</label>
                  <select
                    id="deadlineTime"
                    name="deadlineTime"
                    value={formData.deadlineTime}
                    onChange={handleChange}
                    disabled={!formData.deadlineDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">{t('createTask.anyTime', 'Any time')}</option>
                    {timeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t('createTask.deadlineHint', 'When do you need this task completed by?')}</p>
            </div>

            {/* Difficulty (was Priority) */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createTask.difficulty', 'How hard is this task?')}
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
                {t('createTask.urgent', 'This is an urgent task')}
              </label>
            </div>

            {/* Location warning if approximate */}
            {locationStatus === 'typing' && formData.location.length > 3 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-medium text-amber-800 mb-2">📍 {t('createTask.locationTipTitle', 'Location tip')}</h3>
                <p className="text-sm text-amber-700">
                  {t('createTask.locationTip', 'For better visibility on the map, select a specific address from the suggestions above. If you proceed without selecting, we\'ll use the general area which may be less precise.')}
                </p>
              </div>
            )}

            {/* Matching hint */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">💡 {t('createTask.matchingTitle', 'Get matched with helpers')}</h3>
              <p className="text-sm text-blue-700">
                {t('createTask.matchingHint', 'People offering {{category}} services in your area will see your job and can apply to help you!', { category: selectedCategory?.label || t('common.this', 'this type of') })}
              </p>
            </div>

            {/* How it works */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">💡 {t('createTask.howItWorksTitle', 'How it works')}</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• {t('createTask.howItWorks1', 'Post your job and wait for applicants')}</li>
                <li>• {t('createTask.howItWorks2', 'Review profiles and pick a helper')}</li>
                <li>• {t('createTask.howItWorks3', 'Agree on details and get it done')}</li>
                <li>• {t('createTask.howItWorks4', 'Pay when you\'re satisfied')}</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || searchingAddress}
                className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? t('createTask.creating', 'Creating...') : searchingAddress ? t('createTask.findingLocation', 'Finding location...') : t('createTask.createButton', 'Create Task')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/tasks')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
