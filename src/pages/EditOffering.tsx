import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getOffering, updateOffering, Offering } from '../api/offerings';
import { geocodeAddress, GeocodingResult } from '../api/geocoding';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { CATEGORY_GROUPS, getCategoryByValue } from '../constants/categories';

const EditOffering = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<GeocodingResult[]>([]);
  const [offering, setOffering] = useState<Offering | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cleaning',
    price: '',
    price_type: 'hourly',
    location: '',
    latitude: 56.9496,
    longitude: 24.1052,
    availability: '',
    experience: '',
    service_radius: '25',
    status: 'active'
  });

  const priceTypes = [
    { value: 'hourly', label: t('offerings.priceTypes.hourly', 'Per Hour'), description: t('editOffering.priceTypeHourlyDesc', 'Charge by the hour (e.g., €15/hr)') },
    { value: 'fixed', label: t('offerings.priceTypes.fixed', 'Fixed Price'), description: t('editOffering.priceTypeFixedDesc', 'Set price for the whole service') },
    { value: 'negotiable', label: t('offerings.priceTypes.negotiable', 'Negotiable'), description: t('editOffering.priceTypeNegotiableDesc', 'Price depends on the job') },
  ];

  const statusOptions = [
    { value: 'active', label: t('offerings.status.active', 'Active'), description: 'Visible to everyone' },
    { value: 'paused', label: t('offerings.status.paused', 'Paused'), description: 'Temporarily hidden' },
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning(t('offerings.loginToEdit', 'Please login to edit offerings'));
      navigate('/login');
      return;
    }
    
    if (id) {
      fetchOffering();
    }
  }, [id, isAuthenticated]);

  const fetchOffering = async () => {
    try {
      setLoading(true);
      const offeringData = await getOffering(Number(id));
      setOffering(offeringData);
      
      // Check if user owns this offering
      if (offeringData.creator_id !== user?.id) {
        toast.error(t('editOffering.notOwner', 'You can only edit your own offerings'));
        navigate('/profile?tab=offerings');
        return;
      }
      
      setFormData({
        title: offeringData.title || '',
        description: offeringData.description || '',
        category: offeringData.category || 'cleaning',
        price: offeringData.price?.toString() || '',
        price_type: offeringData.price_type || 'hourly',
        location: offeringData.location || '',
        latitude: offeringData.latitude || 56.9496,
        longitude: offeringData.longitude || 24.1052,
        availability: offeringData.availability || '',
        experience: offeringData.experience || '',
        service_radius: '25', // Default, not stored in current API
        status: offeringData.status || 'active'
      });
    } catch (error) {
      console.error('Error fetching offering:', error);
      toast.error(t('editOffering.loadError', 'Failed to load offering'));
      navigate('/profile?tab=offerings');
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
        status: formData.status as 'active' | 'paused' | 'closed'
      };

      await updateOffering(Number(id), updateData);
      toast.success(t('editOffering.success', 'Offering updated successfully!'));
      navigate('/profile?tab=offerings');
    } catch (error: any) {
      console.error('Error updating offering:', error);
      toast.error(error?.response?.data?.error || t('editOffering.error', 'Failed to update offering. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  // Get selected category info
  const selectedCategory = getCategoryByValue(formData.category);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (!offering) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('editOffering.notFound', 'Offering not found')}</h2>
          <button
            onClick={() => navigate('/profile?tab=offerings')}
            className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600"
          >
            {t('editOffering.backToServices', 'Back to My Services')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">✏️</span>
            <h1 className="text-3xl font-bold text-gray-900">{t('editOffering.title', 'Edit Service Offering')}</h1>
          </div>
          <p className="text-gray-600 mb-6">{t('editOffering.subtitle', 'Update your service details')}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                {t('editOffering.status', 'Status')}
              </label>
              <div className="flex gap-3">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: option.value }))}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.status === option.value
                        ? option.value === 'active' 
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-400 bg-gray-50 text-gray-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-75">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t('editOffering.offeringTitle', 'Service Title')} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder={t('editOffering.offeringTitlePlaceholder', 'e.g., Professional House Cleaning, Dog Walking Service, Handyman')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('editOffering.description', 'Description')} *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder={t('editOffering.descriptionPlaceholder', 'Describe your service in detail. What do you offer? What makes you stand out?')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Category - Grouped */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                {t('editOffering.category', 'Category')} *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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

            {/* Price and Price Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('editOffering.price', 'Price (EUR)')}
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder={t('editOffering.pricePlaceholder', 'e.g., 20.00')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="price_type" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('editOffering.priceType', 'Price Type')}
                </label>
                <select
                  id="price_type"
                  name="price_type"
                  value={formData.price_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {priceTypes.map(pt => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 -mt-4">
              {priceTypes.find(pt => pt.value === formData.price_type)?.description}
            </p>

            {/* Location with Geocoding */}
            <div className="relative">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                {t('editOffering.location', 'Service Area')} * {searchingAddress && <span className="text-amber-500 text-xs">({t('common.loading', 'searching...')})</span>}
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder={t('editOffering.locationPlaceholder', 'e.g., Riga, Centrs or your neighborhood')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                      className="w-full text-left px-4 py-2 hover:bg-amber-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm text-gray-900">{result.display_name}</div>
                    </button>
                  ))}
                </div>
              )}
              
              {formData.location && (
                <p className="text-xs text-gray-500 mt-1">
                  📍 {t('editOffering.coordinates', 'Coordinates')}: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </p>
              )}
            </div>

            {/* Service Radius */}
            <div>
              <label htmlFor="service_radius" className="block text-sm font-medium text-gray-700 mb-2">
                {t('editOffering.serviceRadius', 'How far will you travel?')} (km)
              </label>
              <select
                id="service_radius"
                name="service_radius"
                value={formData.service_radius}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="5">5 km - {t('editOffering.radiusNearby', 'Nearby only')}</option>
                <option value="10">10 km - {t('editOffering.radiusLocal', 'Local area')}</option>
                <option value="25">25 km - {t('editOffering.radiusCity', 'City-wide')}</option>
                <option value="50">50 km - {t('editOffering.radiusRegional', 'Regional')}</option>
                <option value="100">100 km - {t('editOffering.radiusFar', 'Will travel far')}</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                {t('editOffering.availability', 'Availability')} ({t('common.optional', 'Optional')})
              </label>
              <input
                type="text"
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder={t('editOffering.availabilityPlaceholder', 'e.g., Weekdays 9-17, Evenings and weekends, Flexible')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                {t('editOffering.experience', 'Experience')} ({t('common.optional', 'Optional')})
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows={3}
                placeholder={t('editOffering.experiencePlaceholder', 'Tell potential clients about your experience, qualifications, or any relevant background...')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-amber-500 text-white py-3 px-6 rounded-lg hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {saving ? t('editOffering.saving', 'Saving...') : t('editOffering.saveButton', 'Save Changes')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile?tab=offerings')}
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

export default EditOffering;
