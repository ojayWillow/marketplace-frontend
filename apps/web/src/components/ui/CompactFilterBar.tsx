import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface CompactFilterValues {
  minPrice: number;
  maxPrice: number;
  distance: number;
  datePosted: string;
  category: string;
}

interface CategoryOption {
  value: string;
  label: string;
  icon?: string;
}

interface CompactFilterBarProps {
  filters: CompactFilterValues;
  onChange: (filters: CompactFilterValues) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  locationName: string;
  onLocationClick: () => void;
  maxPriceLimit?: number;
  categoryOptions?: CategoryOption[];
  variant?: 'jobs' | 'offerings';
}

const CompactFilterBar = ({
  filters,
  onChange,
  onSearchChange,
  searchQuery,
  locationName,
  onLocationClick,
  maxPriceLimit = 500,
  categoryOptions = [],
  variant = 'jobs'
}: CompactFilterBarProps) => {
  const { t } = useTranslation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateFilter = (key: keyof CompactFilterValues, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  // Check if any filters are active (not default)
  const hasActiveFilters = 
    filters.minPrice > 0 || 
    filters.maxPrice < maxPriceLimit || 
    filters.distance !== 25 ||
    filters.category !== 'all' ||
    filters.datePosted !== 'all';

  // Check if specific filters are changed from default
  const isRadiusActive = filters.distance !== 25;
  const isPriceActive = filters.minPrice > 0 || filters.maxPrice < maxPriceLimit;
  const isCategoryActive = filters.category !== 'all';
  const isPostedActive = filters.datePosted !== 'all';

  const clearAllFilters = () => {
    onChange({
      minPrice: 0,
      maxPrice: maxPriceLimit,
      distance: 25,
      datePosted: 'all',
      category: 'all'
    });
  };

  // Get display label for radius - always shows "Radius: [value]"
  const getRadiusLabel = () => {
    const prefix = t('filters.radius', 'Radius');
    if (filters.distance === 0) {
      return `${prefix}: ${t('tasks.allLatvia', 'All Latvia')}`;
    }
    return `${prefix}: ${filters.distance}km`;
  };

  // Get display label for price
  const getPriceLabel = () => {
    const prefix = t('filters.price', 'Price');
    if (filters.minPrice === 0 && filters.maxPrice >= maxPriceLimit) {
      return prefix;
    }
    if (filters.minPrice === 0) {
      return `${prefix}: €0-${filters.maxPrice}`;
    }
    if (filters.maxPrice >= maxPriceLimit) {
      return `${prefix}: €${filters.minPrice}+`;
    }
    return `${prefix}: €${filters.minPrice}-${filters.maxPrice}`;
  };

  // Get display label for category
  const getCategoryLabel = () => {
    const prefix = t('filters.category', 'Category');
    if (filters.category === 'all') {
      return prefix;
    }
    const cat = categoryOptions.find(c => c.value === filters.category);
    return `${prefix}: ${cat ? cat.label : filters.category}`;
  };

  // Get display label for posted date
  const getPostedLabel = () => {
    const prefix = t('filters.posted', 'Posted');
    switch (filters.datePosted) {
      case 'today': return `${prefix}: ${t('filters.today', 'Today')}`;
      case 'week': return `${prefix}: ${t('filters.thisWeek', 'This week')}`;
      case 'month': return `${prefix}: ${t('filters.thisMonth', 'This month')}`;
      default: return prefix;
    }
  };

  // Shorten location name for display
  const shortLocationName = locationName.length > 15 
    ? locationName.substring(0, 15) + '...' 
    : locationName;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-3" ref={dropdownRef}>
      <div className="flex items-center gap-3">
        {/* Search Input - expands to fill available space */}
        <div className="relative flex-1 min-w-[150px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('tasks.searchPlaceholder', 'Search jobs or offerings...')}
            className="w-full px-4 py-2 pl-9 border border-gray-200 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-700 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">🔍</span>
        </div>

        {/* Right side: Location + Filters */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Location Context */}
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 pr-2 border-r border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-700 dark:text-gray-300">{shortLocationName}</span>
            <button
              onClick={onLocationClick}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-xs ml-1"
            >
              {t('filters.change', 'change')}
            </button>
          </div>

          {/* Radius Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'distance' ? null : 'distance')}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all
                flex items-center gap-1
                ${isRadiusActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                }
                ${openDropdown === 'distance' ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
              `}
            >
              <span>{getRadiusLabel()}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">▼</span>
            </button>
            {openDropdown === 'distance' && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-gray-900/50 z-50 min-w-[140px] py-1">
                {[
                  { value: 5, label: '5 km' },
                  { value: 10, label: '10 km' },
                  { value: 25, label: '25 km' },
                  { value: 50, label: '50 km' },
                  { value: 100, label: '100 km' },
                  { value: 0, label: t('tasks.allLatvia', 'All Latvia') },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateFilter('distance', option.value);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700
                      ${filters.distance === option.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all
                flex items-center gap-1
                ${isPriceActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                }
                ${openDropdown === 'price' ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
              `}
            >
              <span>{getPriceLabel()}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">▼</span>
            </button>
            {openDropdown === 'price' && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-gray-900/50 z-50 p-3 min-w-[220px]">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  {t('filters.priceRange', 'Price Range')}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded text-sm text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      min={0}
                      max={filters.maxPrice}
                      placeholder="Min"
                    />
                  </div>
                  <span className="text-gray-400 dark:text-gray-500 text-sm">to</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', Math.min(maxPriceLimit, parseInt(e.target.value) || maxPriceLimit))}
                      className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded text-sm text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      min={filters.minPrice}
                      max={maxPriceLimit}
                      placeholder="Max"
                    />
                  </div>
                </div>
                {/* Quick presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: t('filters.any', 'Any'), min: 0, max: maxPriceLimit },
                    { label: '€0-25', min: 0, max: 25 },
                    { label: '€25-75', min: 25, max: 75 },
                    { label: '€75+', min: 75, max: maxPriceLimit },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        onChange({ ...filters, minPrice: preset.min, maxPrice: preset.max });
                      }}
                      className={`px-2 py-1 rounded text-xs transition-colors
                        ${filters.minPrice === preset.min && filters.maxPrice === preset.max
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-medium'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all
                flex items-center gap-1
                ${isCategoryActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                }
                ${openDropdown === 'category' ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
              `}
            >
              <span>{getCategoryLabel()}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">▼</span>
            </button>
            {openDropdown === 'category' && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-gray-900/50 z-50 min-w-[200px] max-h-[280px] overflow-y-auto py-1">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      updateFilter('category', cat.value);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap
                      ${filters.category === cat.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    {cat.icon && <span className="mr-2">{cat.icon}</span>}
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Posted Filter (renamed from More) */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'posted' ? null : 'posted')}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all
                flex items-center gap-1
                ${isPostedActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                }
                ${openDropdown === 'posted' ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
              `}
            >
              <span>{getPostedLabel()}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">▼</span>
            </button>
            {openDropdown === 'posted' && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-gray-900/50 z-50 min-w-[160px] py-1">
                {[
                  { value: 'all', label: t('filters.anyTime', 'Any time') },
                  { value: 'today', label: t('filters.today', 'Today') },
                  { value: 'week', label: t('filters.thisWeek', 'This week') },
                  { value: 'month', label: t('filters.thisMonth', 'This month') },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateFilter('datePosted', option.value);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700
                      ${filters.datePosted === option.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Filters - only show when filters are active */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-2 py-1.5 rounded-md text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={t('filters.clearAll', 'Clear all filters')}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompactFilterBar;
