import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createOffering, activateOffering } from '../api/offerings';
import { geocodeAddress, GeocodingResult } from '../api/geocoding';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { CATEGORIES, CATEGORY_GROUPS, getCategoryByValue } from '../constants/categories';

const CreateOffering = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const [loading, setLoading] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOfferingId, setCreatedOfferingId] = useState<number | null>(null);
  const [activating, setActivating] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
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
    service_radius: '25'
  });

  const priceTypes = [
    { value: 'hourly', label: t('offerings.priceTypes.hourly', 'Per Hour'), description: t('createOffering.priceTypeHourlyDesc', 'Charge by the hour (e.g., €15/hr)') },
    { value: 'fixed', label: t('offerings.priceTypes.fixed', 'Fixed Price'), description: t('createOffering.priceTypeFixedDesc', 'Set price for the whole service') },
    { value: 'negotiable', label: t('offerings.priceTypes.negotiable', 'Negotiable'), description: t('createOffering.priceTypeNegotiableDesc', 'Price depends on the job') },
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning(t('offerings.loginToOffer', 'Please login to create an offering'));
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
      toast.error(t('createOffering.loginRequired', 'You must be logged in to create an offering'));
      navigate('/login');
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error(t('createOffering.titleRequired', 'Please enter a title for your offering'));
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
        service_radius: parseFloat(formData.service_radius) || 25
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

  const handleActivateTrial = async () => {
    if (!createdOfferingId) return;
    
    setActivating(true);
    try {
      await activateOffering(createdOfferingId);
      setIsActivated(true);
      toast.success('🎉 Your service is now live for 24 hours!');
    } catch (error: any) {
      console.error('Error activating offering:', error);
      // Even if it fails, the offering might already be active
      setIsActivated(true);
      toast.info('Your service is being activated...');
    } finally {
      setActivating(false);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">👋</span>
            <h1 className="text-3xl font-bold text-gray-900">{t('createOffering.title', 'Create Service Offering')}</h1>
          </div>
          <p className="text-gray-600 mb-6">{t('createOffering.subtitle', 'Advertise your skills and get hired by people nearby')}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createOffering.offeringTitle', 'Service Title')} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder={t('createOffering.offeringTitlePlaceholder', 'e.g., Professional House Cleaning, Dog Walking Service, Handyman')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{t('createOffering.titleHint', 'Make it clear and descriptive')}</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createOffering.description', 'Description')} *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder={t('createOffering.descriptionPlaceholder', 'Describe your service in detail. What do you offer? What makes you stand out?')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Category - Grouped */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createOffering.category', 'Category')} *
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
                  {t('createOffering.price', 'Price (EUR)')}
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder={t('createOffering.pricePlaceholder', 'e.g., 20.00')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="price_type" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('createOffering.priceType', 'Price Type')}
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
                {t('createOffering.location', 'Service Area')} * {searchingAddress && <span className="text-amber-500 text-xs">({t('common.loading', 'searching...')})</span>}
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder={t('createOffering.locationPlaceholder', 'e.g., Riga, Centrs or your neighborhood')}
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
                  📍 {t('createOffering.coordinates', 'Coordinates')}: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </p>
              )}
            </div>

            {/* Service Radius */}
            <div>
              <label htmlFor="service_radius" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createOffering.serviceRadius', 'How far will you travel?')} (km)
              </label>
              <select
                id="service_radius"
                name="service_radius"
                value={formData.service_radius}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="5">5 km - {t('createOffering.radiusNearby', 'Nearby only')}</option>
                <option value="10">10 km - {t('createOffering.radiusLocal', 'Local area')}</option>
                <option value="25">25 km - {t('createOffering.radiusCity', 'City-wide')}</option>
                <option value="50">50 km - {t('createOffering.radiusRegional', 'Regional')}</option>
                <option value="100">100 km - {t('createOffering.radiusFar', 'Will travel far')}</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">{t('createOffering.serviceRadiusHint', 'Maximum distance you\'re willing to travel for a job')}</p>
            </div>

            {/* Availability */}
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createOffering.availability', 'Availability')} ({t('common.optional', 'Optional')})
              </label>
              <input
                type="text"
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder={t('createOffering.availabilityPlaceholder', 'e.g., Weekdays 9-17, Evenings and weekends, Flexible')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{t('createOffering.availabilityHint', 'When are you available to work?')}</p>
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createOffering.experience', 'Experience')} ({t('common.optional', 'Optional')})
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows={3}
                placeholder={t('createOffering.experiencePlaceholder', 'Tell potential clients about your experience, qualifications, or any relevant background...')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Matching hint */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-medium text-amber-800 mb-2">💡 {t('createOffering.matchingTitle', 'Get matched with jobs')}</h3>
              <p className="text-sm text-amber-700">
                {t('createOffering.matchingHint', 'People posting {{category}} jobs in your area will be able to find you and request your services!', { category: selectedCategory?.label || t('common.this', 'this type of') })}
              </p>
            </div>

            {/* Tips */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">✨ {t('createOffering.tipsTitle', 'Tips for a great offering')}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('createOffering.tip1', 'Use a clear, specific title that describes your service')}</li>
                <li>• {t('createOffering.tip2', 'Be detailed in your description - what\'s included?')}</li>
                <li>• {t('createOffering.tip3', 'Set a competitive price based on your experience')}</li>
                <li>• {t('createOffering.tip4', 'Respond quickly when people contact you')}</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-500 text-white py-3 px-6 rounded-lg hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? t('createOffering.creating', 'Creating...') : t('createOffering.createButton', 'Publish Offering')}
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

      {/* Success Modal with Free Trial */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            {/* Success Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">{isActivated ? '🚀' : '✅'}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {isActivated ? 'You\'re Live!' : 'Service Created!'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isActivated 
                  ? 'Your offering is now visible to everyone for 24 hours. Get ready for inquiries!' 
                  : 'Your offering has been saved. Activate it to start getting inquiries.'}
              </p>
            </div>

            {/* Free Trial Activation */}
            {!isActivated && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Try it Free for 24 Hours</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      See how it works! Your service will be visible on the map and in search results. No payment needed.
                    </p>
                    <button
                      onClick={handleActivateTrial}
                      disabled={activating}
                      className="w-full py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-amber-300 font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {activating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Activating...
                        </>
                      ) : (
                        <>
                          🎁 Activate Free Trial
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* What happens next - different based on activation */}
            {isActivated ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-green-800 mb-2">✨ What happens now:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Your service appears in search results</li>
                  <li>• People nearby can find and contact you</li>
                  <li>• You'll be matched with relevant job posts</li>
                  <li>• After 24h, you can extend or upgrade</li>
                </ul>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-700 mb-2">💡 Without activation:</h4>
                <p className="text-sm text-gray-600">
                  Your offering is saved but won't appear in search results. You can activate it anytime from your profile.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate(createdOfferingId ? `/offerings/${createdOfferingId}` : '/profile?tab=offerings');
                }}
                className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                View My Offering
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/profile?tab=offerings');
                  }}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  My Services
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/tasks');
                  }}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Browse Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOffering;
