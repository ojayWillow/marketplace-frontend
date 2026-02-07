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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[10000]"
      onClick={onClose}
    >
      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-[10001] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '85vh' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t('filters.title', 'Filters')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              width="24"
              height="24"
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
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📍 {t('filters.location', 'Location')}
          </label>
          <select
            value={searchRadius}
            onChange={(e) => onRadiusChange(parseInt(e.target.value))}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 text-base border-0 focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>Within 5 km</option>
            <option value={10}>Within 10 km</option>
            <option value={25}>Within 25 km</option>
            <option value={50}>Within 50 km</option>
            <option value={0}>
              🇱🇻 {t('tasks.allLatvia', 'All Latvia')}
            </option>
          </select>
        </div>

        {/* Categories — Multi-select */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏷️ {t('filters.categories', 'Categories')}
            {selectedCategories.length > 0 && (
              <span className="text-blue-600 ml-2">
                ({selectedCategories.length}/{maxCategories} selected)
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
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : isDisabled
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  {isSelected && <span className="ml-1 text-xs">✓</span>}
                </button>
              );
            })}
          </div>
          {selectedCategories.length >= maxCategories && (
            <p className="text-xs text-gray-500 mt-2">
              ℹ️ Maximum {maxCategories} categories selected. Deselect one to
              choose another.
            </p>
          )}
        </div>

        {/* Apply Button */}
        <button
          onClick={onClose}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium"
        >
          {t('filters.apply', 'Apply Filters')}
        </button>
      </div>
    </div>
  );
};

export default FilterSheet;
