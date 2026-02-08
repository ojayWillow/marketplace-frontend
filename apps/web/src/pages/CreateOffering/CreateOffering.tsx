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
    updateField,
    handleChange,
    selectAddress,
    handleSubmit,
    handleBoostTrial,
    handleViewOnMap,
    closeModalAndNavigate,
  } = useOfferingForm();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">👋</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Service Offering</h1>
          </div>
          <p className="text-gray-600 mb-6">Advertise your skills and get hired by people nearby</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Category — visual grid */}
            <CategoryPicker
              value={formData.category}
              onChange={(cat) => updateField('category', cat)}
            />

            {/* 2. Title — with smart suggestions */}
            <TitleInput
              value={formData.title}
              category={formData.category}
              onChange={handleChange}
              onSelect={(title) => updateField('title', title)}
            />

            {/* 3. Description */}
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* 4. Pricing — pill buttons + price input */}
            <PriceTypeSelector
              value={formData.price_type}
              price={formData.price}
              onTypeChange={(type) => updateField('price_type', type)}
              onPriceChange={handleChange}
            />

            {/* 5. Location */}
            <LocationInput
              location={formData.location}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={handleChange}
              onSelect={selectAddress}
            />

            {/* 6. Service radius — tappable chips */}
            <ServiceRadiusChips
              value={formData.service_radius}
              onChange={(r) => updateField('service_radius', r)}
            />

            {/* 7. Availability — day + time picker */}
            <AvailabilityPicker
              value={formData.availability}
              onChange={(a) => updateField('availability', a)}
            />

            {/* 8. Experience (optional, still free text) */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                Experience <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows={3}
                placeholder="Tell potential clients about your experience, qualifications, or relevant background..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Tips & matching info */}
            <FormTips category={formData.category} />

            {/* Submit buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-500 text-white py-3 px-6 rounded-xl hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-base shadow-sm"
              >
                {loading ? 'Creating...' : '✨ Publish Offering'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/tasks')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
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
