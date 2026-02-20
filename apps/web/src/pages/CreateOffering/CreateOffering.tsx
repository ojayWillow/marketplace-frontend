import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOfferingForm } from './hooks';
import {
  CategoryPicker,
  TitleInput,
  PriceTypeSelector,
  LocationInput,
  ServiceRadiusChips,
  AvailabilityPicker,
  FormTips,
  SuccessModal,
} from './components';
import ImagePicker from '../../components/ImagePicker';

const CreateOffering = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    formData,
    loading,
    showSuccessModal,
    createdOfferingId,
    activating,
    isBoosted,
    locationConfirmed,
    updateField,
    handleChange,
    selectAddress,
    setCoordsFromMap,
    handleSubmit,
    handleBoostTrial,
    handleViewOnMap,
    closeModalAndNavigate,
  } = useOfferingForm();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 p-4 sm:p-6">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              👋 {t('createOffering.title', 'Create Service Offering')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">{t('createOffering.subtitle', 'Advertise your skills, get hired nearby')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <CategoryPicker
              value={formData.category}
              onChange={(cat) => updateField('category', cat)}
            />

            <TitleInput
              value={formData.title}
              category={formData.category}
              onChange={handleChange}
              onSelect={(title) => updateField('title', title)}
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('createOffering.description', 'Description')} *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder={t('createOffering.descriptionPlaceholder', 'What do you offer? What makes you stand out?')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <ImagePicker
              images={formData.images}
              onChange={(imgs) => updateField('images', imgs)}
              maxImages={5}
              label={`${t('createOffering.photos', 'Photos')} (${t('common.optional', 'Optional')})`}
            />

            <PriceTypeSelector
              value={formData.price_type}
              price={formData.price}
              onTypeChange={(type) => updateField('price_type', type)}
              onPriceChange={handleChange}
            />

            <LocationInput
              location={formData.location}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={handleChange}
              onSelect={selectAddress}
              onCoordsChange={setCoordsFromMap}
              locationConfirmed={locationConfirmed}
            />

            <ServiceRadiusChips
              value={formData.service_radius}
              onChange={(r) => updateField('service_radius', r)}
            />

            <AvailabilityPicker
              value={formData.availability}
              onChange={(a) => updateField('availability', a)}
            />

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('createOffering.experience', 'Experience')} <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">({t('common.optional', 'Optional')})</span>
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows={2}
                placeholder={t('createOffering.experiencePlaceholder', 'Your qualifications, relevant background...')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <FormTips category={formData.category} />

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-500 text-white py-2.5 px-4 rounded-xl hover:bg-amber-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-semibold text-sm shadow-sm"
              >
                {loading ? t('createOffering.creating', 'Creating...') : `✨ ${t('createOffering.createButton', 'Publish')}`}
              </button>
              <button
                type="button"
                onClick={() => navigate('/tasks')}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-sm"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal
          createdOfferingId={createdOfferingId}
          isBoosted={isBoosted}
          activating={activating}
          onBoost={handleBoostTrial}
          onViewOnMap={handleViewOnMap}
          onNavigate={closeModalAndNavigate}
        />
      )}
    </div>
  );
};

export default CreateOffering;
