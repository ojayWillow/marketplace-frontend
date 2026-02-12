import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTaskForm } from './hooks';
import {
  CategoryPicker,
  DifficultyPicker,
  DeadlinePicker,
  LocationInput,
  BudgetInput,
  UrgentToggle,
  FormTips,
} from './components';
import ImagePicker from '../../components/ImagePicker';
import { FEATURES } from '../../constants/featureFlags';

const CreateTask = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    formData,
    loading,
    locationConfirmed,
    updateField,
    handleChange,
    selectAddress,
    setCoordsFromMap,
    handleSubmit,
  } = useTaskForm();

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              ⚡ {t('createTask.title', 'Create Quick Help Job')}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              {t('createTask.subtitle', 'Post a task and get help from people nearby')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Category */}
            <CategoryPicker
              value={formData.category}
              onChange={(cat) => updateField('category', cat)}
            />

            {/* 2. Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* 3. Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('createTask.description', 'Description')} *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder={t('createTask.descriptionPlaceholder', 'Provide details about what help you need...')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* 4. Photos */}
            <ImagePicker
              images={formData.images}
              onChange={(imgs) => updateField('images', imgs)}
              maxImages={5}
              label={t('createTask.photos', '📸 Photos (optional)')}
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

            {/* 6. Budget */}
            <BudgetInput value={formData.budget} onChange={handleChange} />

            {/* 7. Deadline with time slots */}
            <DeadlinePicker
              deadlineDate={formData.deadlineDate}
              deadlineTime={formData.deadlineTime}
              onChange={handleChange}
              onTimeChange={(time) => updateField('deadlineTime', time)}
            />

            {/* 8. Difficulty */}
            <DifficultyPicker
              value={formData.difficulty}
              onChange={(d) => updateField('difficulty', d)}
            />

            {/* 9. Urgent — hidden until feature is launched */}
            {FEATURES.URGENT && (
              <UrgentToggle
                value={formData.is_urgent}
                onChange={(u) => updateField('is_urgent', u)}
              />
            )}

            {/* Tips */}
            <FormTips category={formData.category} />

            {/* Submit */}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2.5 px-4 rounded-xl hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-sm shadow-sm"
              >
                {loading
                  ? t('createTask.creating', 'Creating...')
                  : t('createTask.createButton', '⚡ Create Task')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/tasks')}
                className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 font-medium text-sm"
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
