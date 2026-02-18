import { useTranslation } from 'react-i18next';
import { useEditTaskForm } from './hooks';
import { LocationInput, LoadingSpinner, NotFoundState } from './components';
import { getCategoryByValue } from '../../constants/categories';

const TASK_CATEGORY_VALUES = ['pet-care', 'moving', 'shopping', 'cleaning', 'delivery', 'outdoor', 'handyman', 'tutoring', 'tech-help', 'other'];
const DIFFICULTY_VALUES = ['easy', 'medium', 'hard'] as const;

const EditTask = () => {
  const { t } = useTranslation();
  const {
    formData,
    task,
    loading,
    saving,
    searchingAddress,
    addressSuggestions,
    handleChange,
    selectAddress,
    handleSubmit,
    navigate,
  } = useEditTaskForm();

  if (loading) return <LoadingSpinner />;
  if (!task) return <NotFoundState onBack={() => navigate('/tasks')} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('editTask.title', 'Edit Task')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('editTask.subtitle', 'Update your task details')}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editTask.taskTitle', 'Task Title')} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder={t('editTask.taskTitlePlaceholder', 'e.g., Need help moving furniture')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('common.description', 'Description')} *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder={t('editTask.descriptionPlaceholder', 'Provide details about what help you need...')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('common.category', 'Category')} *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {TASK_CATEGORY_VALUES.map(val => {
                  const cat = getCategoryByValue(val);
                  return (
                    <option key={val} value={val}>
                      {cat?.icon} {t(`tasks.categories.${val}`, cat?.label || val)}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Location */}
            <LocationInput
              location={formData.location}
              latitude={formData.latitude}
              longitude={formData.longitude}
              searchingAddress={searchingAddress}
              addressSuggestions={addressSuggestions}
              onChange={handleChange}
              onSelect={selectAddress}
            />

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editTask.budget', 'Budget (EUR)')} *
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
                placeholder={t('editTask.budgetPlaceholder', 'e.g., 25.00')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('editTask.budgetHint', 'How much are you willing to pay for this task?')}</p>
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editTask.deadline', 'Deadline')} <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">({t('common.optional', 'Optional')})</span>
              </label>
              <input
                type="datetime-local"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editTask.difficulty', 'Difficulty')}
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DIFFICULTY_VALUES.map(val => (
                  <option key={val} value={val}>{t(`createTask.difficulty${val.charAt(0).toUpperCase() + val.slice(1)}`, val)}</option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium"
              >
                {saving ? t('editTask.saving', 'Saving...') : t('editTask.saveChanges', 'Save Changes')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/tasks')}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
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

export default EditTask;
