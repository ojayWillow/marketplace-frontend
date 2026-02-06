import { useTranslation } from 'react-i18next';
import { CATEGORY_OPTIONS } from '../../../constants/categories';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  searchRadius: number;
  onRadiusChange: (radius: number) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  locationName?: string;
  onLocationClick?: () => void;
}

export const FilterSheet = ({
  isOpen,
  onClose,
  searchRadius,
  onRadiusChange,
  selectedCategory,
  onCategoryChange,
  locationName,
  onLocationClick,
}: FilterSheetProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[15000]"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[15001] max-h-[80vh] flex flex-col"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Handle */}
        <div className="flex flex-col items-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {t('filter.title', 'Filters')}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#374151"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Location */}
          {onLocationClick && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📍 {t('filter.location', 'Location')}
              </label>
              <button
                onClick={onLocationClick}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <span className="text-gray-900">
                  {locationName || t('location.notSet', 'Not set')}
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}

          {/* Search Radius */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📏 {t('filter.radius', 'Search Radius')}
            </label>
            <div className="space-y-2">
              {[5, 10, 25, 50, 0].map((radius) => (
                <button
                  key={radius}
                  onClick={() => onRadiusChange(radius)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    searchRadius === radius
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">
                    {radius === 0
                      ? `🇱🇻 ${t('tasks.allLatvia', 'All Latvia')}`
                      : `${radius}km`}
                  </span>
                  {searchRadius === radius && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🏷️ {t('filter.category', 'Category')}
            </label>
            <div className="space-y-2">
              {[{ value: 'all', icon: '🌐', label: 'All' }, ...CATEGORY_OPTIONS].map(
                (cat) => (
                  <button
                    key={cat.value}
                    onClick={() => onCategoryChange(cat.value)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                      selectedCategory === cat.value
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="flex-1 text-left font-medium">{cat.label}</span>
                    {selectedCategory === cat.value && (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-6" />
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};
