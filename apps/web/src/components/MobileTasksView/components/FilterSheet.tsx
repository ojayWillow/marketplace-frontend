import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../../../constants/categories';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  searchRadius: number;
  onRadiusChange: (radius: number) => void;
  selectedCategories: string[];
  onCategoryToggle: (categoryValue: string) => void;
  maxCategories: number;
}

/**
 * Full-screen filter overlay for radius and category selection.
 * Appears as a centered sheet that’s immediately visible.
 */
const FilterSheet = ({
  isOpen,
  onClose,
  searchRadius,
  onRadiusChange,
  selectedCategories,
  onCategoryToggle,
  maxCategories,
}: FilterSheetProps) => {
  const { t } = useTranslation();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl p-5 overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '80vh' }}
      >
        {/* Handle bar for mobile */}
        <div className="flex justify-center mb-3 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('filters.title', 'Filters')}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Location/Radius */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
            📍 {t('filters.location', 'Location')}
          </label>
          <select
            value={searchRadius}
            onChange={(e) => onRadiusChange(parseInt(e.target.value))}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm border-0 focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>{t('filters.withinKm', { km: 5, defaultValue: 'Within 5 km' })}</option>
            <option value={10}>{t('filters.withinKm', { km: 10, defaultValue: 'Within 10 km' })}</option>
            <option value={25}>{t('filters.withinKm', { km: 25, defaultValue: 'Within 25 km' })}</option>
            <option value={50}>{t('filters.withinKm', { km: 50, defaultValue: 'Within 50 km' })}</option>
            <option value={0}>
              🇱🇻 {t('tasks.allLatvia', 'All Latvia')}
            </option>
          </select>
        </div>

        {/* Categories — Multi-select */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
            🏷️ {t('filters.categories', 'Categories')}
            {selectedCategories.length > 0 && (
              <span className="text-blue-600 dark:text-blue-400 ml-2 normal-case">
                ({t('filters.selected', { count: selectedCategories.length, max: maxCategories, defaultValue: `${selectedCategories.length}/${maxCategories} selected` })})
              </span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.value);
              const isDisabled =
                !isSelected && selectedCategories.length >= maxCategories;

              return (
                <button
                  key={cat.value}
                  onClick={() => onCategoryToggle(cat.value)}
                  disabled={isDisabled}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-500 text-white shadow-sm'
                      : isDisabled
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{t(`tasks.categories.${cat.value}`, cat.label)}</span>
                  {isSelected && <span className="ml-0.5 text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
          {selectedCategories.length >= maxCategories && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
              ℹ️ {t('filters.maxCategoriesHint', { max: maxCategories, defaultValue: `Maximum ${maxCategories} categories selected. Deselect one to choose another.` })}
            </p>
          )}
        </div>

        {/* Apply Button */}
        <button
          onClick={onClose}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          {t('filters.apply', 'Apply Filters')}
        </button>
      </div>
    </div>
  );
};

export default FilterSheet;
