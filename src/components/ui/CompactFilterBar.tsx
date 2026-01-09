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
    filters.datePosted !== 'all' ||
    filters.category !== 'all';

  const clearAllFilters = () => {
    onChange({
      minPrice: 0,
      maxPrice: maxPriceLimit,
      distance: filters.distance, // Keep distance
      datePosted: 'all',
      category: 'all'
    });
  };

  // Format price display for the pill
  const getPriceLabel = () => {
    if (filters.minPrice === 0 && filters.maxPrice >= maxPriceLimit) {
      return t('filters.anyPrice', 'Any');
    }
    if (filters.minPrice === 0) {
      return `≤€${filters.maxPrice}`;
    }
    if (filters.maxPrice >= maxPriceLimit) {
      return `€${filters.minPrice}+`;
    }
    return `€${filters.minPrice}-${filters.maxPrice}`;
  };

  // Format distance display
  const getDistanceLabel = () => {
    if (filters.distance === 0) {
      return '🇱🇻 LV';
    }
    return `${filters.distance}km`;
  };

  // Format date display
  const getDateLabel = () => {
    switch (filters.datePosted) {
      case 'today': return t('filters.today', 'Today');
      case 'week': return t('filters.thisWeek', 'Week');
      case 'month': return t('filters.thisMonth', 'Month');
      default: return t('filters.allTime', 'All');
    }
  };

  // Get category label for the pill button
  const getCategoryLabel = () => {
    if (filters.category === 'all') {
      return t('filters.allCategories', 'All');
    }
    const cat = categoryOptions.find(c => c.value === filters.category);
    return cat ? `${cat.icon || ''} ${cat.label}`.trim() : filters.category;
  };

  const accentColor = variant === 'offerings' ? 'amber' : 'blue';

  // Pill button component
  const FilterPill = ({ 
    label, 
    icon, 
    isActive, 
    onClick, 
    dropdown 
  }: { 
    label: string; 
    icon: string; 
    isActive?: boolean; 
    onClick: () => void;
    dropdown?: string;
  }) => (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
        border transition-all whitespace-nowrap
        ${isActive 
          ? `bg-${accentColor}-100 border-${accentColor}-300 text-${accentColor}-700` 
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        }
        ${openDropdown === dropdown ? 'ring-2 ring-' + accentColor + '-200' : ''}
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {dropdown && <span className="text-gray-400 text-xs">▼</span>}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4" ref={dropdownRef}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input - takes available space */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('tasks.searchPlaceholder', 'Search jobs or offerings...')}
            className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Location Pill */}
          <FilterPill
            icon="📍"
            label={locationName.length > 15 ? locationName.substring(0, 15) + '...' : locationName}
            onClick={onLocationClick}
            isActive={false}
          />

          {/* Distance Dropdown */}
          <div className="relative">
            <FilterPill
              icon="📏"
              label={getDistanceLabel()}
              onClick={() => setOpenDropdown(openDropdown === 'distance' ? null : 'distance')}
              dropdown="distance"
              isActive={filters.distance !== 25}
            />
            {openDropdown === 'distance' && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
                {[5, 10, 25, 50, 100, 0].map((km) => (
                  <button
                    key={km}
                    onClick={() => {
                      updateFilter('distance', km);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg
                      ${filters.distance === km ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                    `}
                  >
                    {km === 0 ? '🇱🇻 ' + t('tasks.allLatvia', 'All Latvia') : `${km} km`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Dropdown */}
          <div className="relative">
            <FilterPill
              icon="💰"
              label={getPriceLabel()}
              onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
              dropdown="price"
              isActive={filters.minPrice > 0 || filters.maxPrice < maxPriceLimit}
            />
            {openDropdown === 'price' && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[240px]">
                <div className="text-sm font-medium text-gray-700 mb-3">{t('filters.priceRange', 'Price Range')}</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">{t('filters.min', 'Min')}</label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                      min={0}
                      max={filters.maxPrice}
                    />
                  </div>
                  <span className="text-gray-400 mt-5">—</span>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">{t('filters.max', 'Max')}</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', Math.min(maxPriceLimit, parseInt(e.target.value) || maxPriceLimit))}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                      min={filters.minPrice}
                      max={maxPriceLimit}
                    />
                  </div>
                </div>
                {/* Quick presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: t('filters.any', 'Any'), min: 0, max: maxPriceLimit },
                    { label: '≤€25', min: 0, max: 25 },
                    { label: '€25-75', min: 25, max: 75 },
                    { label: '€75+', min: 75, max: maxPriceLimit },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        onChange({ ...filters, minPrice: preset.min, maxPrice: preset.max });
                      }}
                      className={`px-2 py-1 rounded text-xs border transition-colors
                        ${filters.minPrice === preset.min && filters.maxPrice === preset.max
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
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

          {/* Date Posted Dropdown */}
          <div className="relative">
            <FilterPill
              icon="📅"
              label={getDateLabel()}
              onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
              dropdown="date"
              isActive={filters.datePosted !== 'all'}
            />
            {openDropdown === 'date' && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
                {[
                  { value: 'all', label: t('filters.allTime', 'All time') },
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
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg
                      ${filters.datePosted === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <FilterPill
              icon="🏷️"
              label={getCategoryLabel()}
              onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
              dropdown="category"
              isActive={filters.category !== 'all'}
            />
            {openDropdown === 'category' && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px] max-h-[300px] overflow-y-auto">
                {/* Loop through all categoryOptions - includes 'all' from constants */}
                {categoryOptions.map((cat, index) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      updateFilter('category', cat.value);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50
                      ${index === 0 ? 'rounded-t-lg' : ''}
                      ${index === categoryOptions.length - 1 ? 'rounded-b-lg' : ''}
                      ${filters.category === cat.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                    `}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Filters - only show when filters are active */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                         text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
            >
              <span>✕</span>
              <span>{t('filters.clear', 'Clear')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompactFilterBar;
