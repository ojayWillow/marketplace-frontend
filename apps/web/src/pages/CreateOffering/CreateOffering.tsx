import { useNavigate } from 'react-router-dom';
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

const CreateOffering = () => {
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              👋 Create Service Offering
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Advertise your skills, get hired nearby</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Category */}
            <CategoryPicker
              value={formData.category}
              onChange={(cat) => updateField('category', cat)}
            />

            {/* 2. Title */}
            <TitleInput
              value={formData.title}
              category={formData.category}
              onChange={handleChange}
              onSelect={(title) => updateField('title', title)}
            />

            {/* 3. Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="What do you offer? What makes you stand out?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>

            {/* 4. Pricing */}
            <PriceTypeSelector
              value={formData.price_type}
              price={formData.price}
              onTypeChange={(type) => updateField('price_type', type)}
              onPriceChange={handleChange}
            />

            {/* 5. Location with map */}
            <LocationInput
              location={formData.location}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={handleChange}
              onSelect={selectAddress}
              onCoordsChange={setCoordsFromMap}
              locationConfirmed={locationConfirmed}
            />

            {/* 6. Radius */}
            <ServiceRadiusChips
              value={formData.service_radius}
              onChange={(r) => updateField('service_radius', r)}
            />

            {/* 7. Availability */}
            <AvailabilityPicker
              value={formData.availability}
              onChange={(a) => updateField('availability', a)}
            />

            {/* 8. Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Experience <span className="text-gray-400 font-normal text-xs">(Optional)</span>
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows={2}
                placeholder="Your qualifications, relevant background..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Tips */}
            <FormTips category={formData.category} />

            {/* Submit */}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-500 text-white py-2.5 px-4 rounded-xl hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-sm shadow-sm"
              >
                {loading ? 'Creating...' : '✨ Publish'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/tasks')}
                className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
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
