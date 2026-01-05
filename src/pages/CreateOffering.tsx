import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOffering } from '../api/offerings';
import { geocodeAddress, GeocodingResult } from '../api/geocoding';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { CATEGORIES, CATEGORY_GROUPS, getCategoryByValue } from '../constants/categories';

const CreateOffering = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const [loading, setLoading] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<GeocodingResult[]>([]);
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
    { value: 'hourly', label: 'Per Hour', description: 'Charge by the hour (e.g., €15/hr)' },
    { value: 'fixed', label: 'Fixed Price', description: 'Set price for the whole service' },
    { value: 'negotiable', label: 'Negotiable', description: 'Price depends on the job' },
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Please login to create an offering');
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
      toast.error('You must be logged in to create an offering');
      navigate('/login');
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title for your offering');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please describe your service');
      return;
    }
    
    if (!formData.location.trim()) {
      toast.error('Please enter your service area');
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

      await createOffering(offeringData);
      toast.success('Your offering is now live! People can find and contact you.');
      navigate('/tasks');
    } catch (error: any) {
      console.error('Error creating offering:', error);
      toast.error(error?.response?.data?.error || 'Failed to create offering. Please try again.');
    } finally {
      setLoading(false);
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
            <h1 className="text-3xl font-bold text-gray-900">Create Service Offering</h1>
          </div>
          <p className="text-gray-600 mb-6">Advertise your skills and get hired by people nearby</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Service Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Professional House Cleaning, Dog Walking Service, Handyman"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Make it clear and descriptive</p>
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
                placeholder="Describe your service in detail. What do you offer? What makes you stand out?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Category - Grouped */}
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
                  Price (EUR)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 20.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="price_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Price Type
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
                Service Area * {searchingAddress && <span className="text-amber-500 text-xs">(searching...)</span>}
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Riga, Centrs or your neighborhood"
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
                  📍 Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </p>
              )}
            </div>

            {/* Service Radius */}
            <div>
              <label htmlFor="service_radius" className="block text-sm font-medium text-gray-700 mb-2">
                How far will you travel? (km)
              </label>
              <select
                id="service_radius"
                name="service_radius"
                value={formData.service_radius}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="5">5 km - Nearby only</option>
                <option value="10">10 km - Local area</option>
                <option value="25">25 km - City-wide</option>
                <option value="50">50 km - Regional</option>
                <option value="100">100 km - Will travel far</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Maximum distance you're willing to travel for a job</p>
            </div>

            {/* Availability */}
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                Availability (Optional)
              </label>
              <input
                type="text"
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="e.g., Weekdays 9-17, Evenings and weekends, Flexible"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">When are you available to work?</p>
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                Experience (Optional)
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows={3}
                placeholder="Tell potential clients about your experience, qualifications, or any relevant background..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Matching hint */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-medium text-amber-800 mb-2">💡 Get matched with jobs</h3>
              <p className="text-sm text-amber-700">
                People posting <strong>{selectedCategory?.label || 'this type of'}</strong> jobs in your area will be able to find you and request your services!
              </p>
            </div>

            {/* Tips */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">✨ Tips for a great offering</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use a clear, specific title that describes your service</li>
                <li>• Be detailed in your description - what's included?</li>
                <li>• Set a competitive price based on your experience</li>
                <li>• Respond quickly when people contact you</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-500 text-white py-3 px-6 rounded-lg hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Creating...' : 'Publish Offering'}
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

export default CreateOffering;
