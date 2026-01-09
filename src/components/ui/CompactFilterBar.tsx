import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface CompactFilterValues {
  minPrice: number;
  maxPrice: number;
  distance: number; // 0 = all Latvia
  datePosted: 'all' | 'today' | 'week' | 'month';
  category: string;
}

interface CompactFilterBarProps {
  filters: CompactFilterValues;
  onChange: (filters: CompactFilterValues) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  locationName: string;
  onLocationClick: () => void;
  maxPriceLimit?: number;
  categoryOptions?: { value: string; label: string; icon?: string }[];
  variant?: 'jobs' | 'offerings';
}

// Dropdown wrapper component
const FilterDropdown = ({ 
  trigger, 
  children, 
  isOpen, 
  onToggle,
  align = 'left'
}: { 
  trigger: React.ReactNode; 
  children: React.ReactNode; 
  isOpen: boolean;
  onToggle: () => void;
  align?: 'left' | 'right' | 'center';
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={onToggle}>{trigger}</div>
      {isOpen && (
        <div className={`absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ${alignClasses[align]}`}>
          {children}
        </div>
      )}
    </div>
  );
};

// Budget Range Slider Popover
const BudgetPopover = ({ 
  minPrice, 
  maxPrice, 
  maxLimit,
  onChange,
  onClose,
  accentColor = 'blue'
}: { 
  minPrice: number; 
  maxPrice: number;
  maxLimit: number;
  onChange: (min: number, max: number) => void;
  onClose: () => void;
  accentColor?: 'blue' | 'amber';
}) => {
  const { t } = useTranslation();
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  const handleApply = () => {
    onChange(localMin, localMax);
    onClose();
  };

  const presets = [
    { label: t('filters.any', 'Any'), min: 0, max: maxLimit },
    { label: '€0-25', min: 0, max: 25 },
    { label: '€25-50', min: 25, max: 50 },
    { label: '€50-100', min: 50, max: 100 },
    { label: '€100+', min: 100, max: maxLimit },
  ];

  const colorClasses = accentColor === 'amber' 
    ? 'bg-amber-500 hover:bg-amber-600' 
    : 'bg-blue-500 hover:bg-blue-600';

  return (
    <div className="p-4 w-64">
      <div className="text-sm font-medium text-gray-700 mb-3">💰 {t('filters.budget', 'Budget')}</div>
      
      {/* Quick presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => { setLocalMin(preset.min); setLocalMax(preset.max); }}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              localMin === preset.min && localMax === preset.max
                ? `${colorClasses} text-white border-transparent`
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Range inputs */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1">
          <label className="text-xs text-gray-500">{t('filters.min', 'Min')}</label>
          <input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            min={0}
            max={localMax}
          />
        </div>
        <span className="text-gray-400 mt-4">–</span>
        <div className="flex-1">
          <label className="text-xs text-gray-500">{t('filters.max', 'Max')}</label>
          <input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(Math.min(maxLimit, parseInt(e.target.value) || maxLimit))}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            min={localMin}
            max={maxLimit}
          />
        </div>
      </div>

      {/* Apply button */}
      <button
        onClick={handleApply}
        className={`w-full py-2 rounded-lg text-white text-sm font-medium ${colorClasses}`}
      >
        {t('filters.apply', 'Apply')}
      </button>
    </div>
  );
};

export default function CompactFilterBar({
  filters,
  onChange,
  onSearchChange,
  searchQuery,
  locationName,
  onLocationClick,
  maxPriceLimit = 500,
  categoryOptions = [],
  variant = 'jobs'
}: CompactFilterBarProps) {
  const { t } = useTranslation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const accentColor = variant === 'offerings' ? 'amber' : 'blue';
  const accentClasses = variant === 'offerings'
    ? 'bg-amber-500 text-white'
    : 'bg-blue-500 text-white';

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const distanceOptions = [
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 25, label: '25 km' },
    { value: 50, label: '50 km' },
    { value: 100, label: '100 km' },
    { value: 0, label: `🇱🇻 ${t('tasks.allLatvia', 'All Latvia')}` },
  ];

  const dateOptions = [
    { value: 'all', label: t('filters.anyTime', 'Any time'), short: t('filters.any', 'Any') },
    { value: 'today', label: t('filters.today', 'Today'), short: t('filters.today', 'Today') },
    { value: 'week', label: t('filters.thisWeek', 'This week'), short: t('filters.week', 'Week') },
    { value: 'month', label: t('filters.thisMonth', 'This month'), short: t('filters.month', 'Month') },
  ];

  // Format budget display
  const getBudgetLabel = () => {
    if (filters.minPrice === 0 && filters.maxPrice >= maxPriceLimit) {
      return t('filters.any', 'Any');
    }
    if (filters.minPrice === 0) {
      return `€0-${filters.maxPrice}`;
    }
    if (filters.maxPrice >= maxPriceLimit) {
      return `€${filters.minPrice}+`;
    }
    return `€${filters.minPrice}-${filters.maxPrice}`;
  };

  // Format distance display
  const getDistanceLabel = () => {
    if (filters.distance === 0) return '🇱🇻';
    return `${filters.distance}km`;
  };

  // Format date display
  const getDateLabel = () => {
    const option = dateOptions.find(o => o.value === filters.datePosted);
    return option?.short || t('filters.any', 'Any');
  };

  // Format category display
  const getCategoryLabel = () => {
    if (filters.category === 'all') return t('filters.all', 'All');
    const option = categoryOptions.find(o => o.value === filters.category);
    return option?.icon || '🏷️';
  };

  // Check if filter is active (non-default)
  const isActive = (filter: string) => {
    switch (filter) {
      case 'budget': return filters.minPrice > 0 || filters.maxPrice < maxPriceLimit;
      case 'distance': return filters.distance !== 25;
      case 'date': return filters.datePosted !== 'all';
      case 'category': return filters.category !== 'all';
      default: return false;
    }
  };

  const pillBaseClass = "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border";
  const pillDefaultClass = "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50";
  const pillActiveClass = variant === 'offerings' 
    ? "bg-amber-50 border-amber-300 text-amber-700"
    : "bg-blue-50 border-blue-300 text-blue-700";

  return (
    <div className="bg-white rounded-lg shadow-md p-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search Input - expands on focus */}
        <div className={`relative transition-all duration-200 ${searchFocused ? 'flex-1 min-w-[200px]' : 'w-40'}`}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder={t('tasks.search', 'Search...')}
            className="w-full px-3 py-2 pl-9 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        </div>

        {/* Location Button */}
        <button
          onClick={onLocationClick}
          className={`${pillBaseClass} ${pillDefaultClass} bg-red-50 border-red-200 text-red-700 hover:bg-red-100`}
        >
          <span>📍</span>
          <span className="max-w-[80px] truncate">{locationName.split(',')[0]}</span>
        </button>

        {/* Distance Dropdown */}
        <FilterDropdown
          isOpen={openDropdown === 'distance'}
          onToggle={() => toggleDropdown('distance')}
          trigger={
            <div className={`${pillBaseClass} ${isActive('distance') ? pillActiveClass : pillDefaultClass}`}>
              <span>📏</span>
              <span>{getDistanceLabel()}</span>
              <span className="text-gray-400 text-xs">▼</span>
            </div>
          }
        >
          <div className="py-1 min-w-[140px]">
            {distanceOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange({ ...filters, distance: option.value });
                  setOpenDropdown(null);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                  filters.distance === option.value ? accentClasses : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Budget Dropdown */}
        <FilterDropdown
          isOpen={openDropdown === 'budget'}
          onToggle={() => toggleDropdown('budget')}
          trigger={
            <div className={`${pillBaseClass} ${isActive('budget') ? pillActiveClass : pillDefaultClass}`}>
              <span>💰</span>
              <span>{getBudgetLabel()}</span>
              <span className="text-gray-400 text-xs">▼</span>
            </div>
          }
        >
          <BudgetPopover
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            maxLimit={maxPriceLimit}
            onChange={(min, max) => onChange({ ...filters, minPrice: min, maxPrice: max })}
            onClose={() => setOpenDropdown(null)}
            accentColor={accentColor}
          />
        </FilterDropdown>

        {/* Date Dropdown */}
        <FilterDropdown
          isOpen={openDropdown === 'date'}
          onToggle={() => toggleDropdown('date')}
          trigger={
            <div className={`${pillBaseClass} ${isActive('date') ? pillActiveClass : pillDefaultClass}`}>
              <span>📅</span>
              <span>{getDateLabel()}</span>
              <span className="text-gray-400 text-xs">▼</span>
            </div>
          }
        >
          <div className="py-1 min-w-[140px]">
            {dateOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange({ ...filters, datePosted: option.value as any });
                  setOpenDropdown(null);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                  filters.datePosted === option.value ? accentClasses : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Category Dropdown */}
        <FilterDropdown
          isOpen={openDropdown === 'category'}
          onToggle={() => toggleDropdown('category')}
          align="right"
          trigger={
            <div className={`${pillBaseClass} ${isActive('category') ? pillActiveClass : pillDefaultClass}`}>
              <span>🏷️</span>
              <span>{getCategoryLabel()}</span>
              <span className="text-gray-400 text-xs">▼</span>
            </div>
          }
        >
          <div className="py-1 min-w-[180px] max-h-[300px] overflow-y-auto">
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange({ ...filters, category: option.value });
                  setOpenDropdown(null);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  filters.category === option.value ? accentClasses : 'text-gray-700'
                }`}
              >
                {option.icon && <span>{option.icon}</span>}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Clear Filters - only show when filters active */}
        {(isActive('budget') || isActive('date') || isActive('category')) && (
          <button
            onClick={() => onChange({
              minPrice: 0,
              maxPrice: maxPriceLimit,
              distance: filters.distance, // Keep distance
              datePosted: 'all',
              category: 'all'
            })}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {t('filters.clear', 'Clear')}
          </button>
        )}
      </div>
    </div>
  );
}
