import { useTranslation } from 'react-i18next';
import { CATEGORY_GROUPS, getCategoryByValue } from '../../constants/categories';
import { useEditOfferingForm } from './hooks';
import { RADIUS_OPTIONS } from './types';
import {
  StatusPicker,
  PriceEditor,
  LocationEditor,
  LoadingSpinner,
  NotFoundState,
} from './components';

const EditOffering = () => {
  const { t } = useTranslation();
  const {
    formData,
    offering,
    loading,
    saving,
    searchingAddress,
    addressSuggestions,
    handleChange,
    updateField,
    selectAddress,
    handleSubmit,
    navigate,
  } = useEditOfferingForm();

  if (loading) return <LoadingSpinner />;
  if (!offering) return <NotFoundState onBack={() => navigate('/profile?tab=offerings')} />;

  const selectedCategory = getCategoryByValue(formData.category);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">\u270F\uFE0F</span>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('editOffering.title', 'Edit Service Offering')}
            </h1>
          </div>
          <p className="text-gray-600 mb-6">
            {t('editOffering.subtitle', 'Update your service details')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status */}
            <StatusPicker
              value={formData.status}
              onChange={(status) => updateField('status', status)}
            />

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

            {/* Category */}
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

            {/* Price */}
            <PriceEditor
              price={formData.price}
              priceType={formData.price_type}
              onChange={handleChange}
            />

            {/* Location */}
            <LocationEditor
              location={formData.location}
              latitude={formData.latitude}
              longitude={formData.longitude}
              searchingAddress={searchingAddress}
              addressSuggestions={addressSuggestions}
              onChange={handleChange}
              onSelect={selectAddress}
            />

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
                {RADIUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value} km - {t(opt.labelKey, opt.labelDefault)}
                  </option>
                ))}
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
