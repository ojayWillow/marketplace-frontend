import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export interface FilterValues {
  minPrice: number;
  maxPrice: number;
  distance: number; // 0 = all
  datePosted: 'all' | 'today' | 'week' | 'month';
  category: string;
}

interface AdvancedFiltersProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  maxPriceLimit?: number;
  showCategory?: boolean;
  categoryOptions?: { value: string; label: string; icon?: string }[];
  variant?: 'jobs' | 'offerings' | 'listings';
}

// Custom dual range slider component
const DualRangeSlider = ({
  min,
  max,
  minValue,
  maxValue,
  onChange,
  step = 5,
  formatValue = (v: number) => `€${v}`,
  accentColor = 'blue'
}: {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  step?: number;
  formatValue?: (value: number) => string;
  accentColor?: 'blue' | 'amber' | 'green';
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

  const getPercent = (value: number) => ((value - min) / (max - min)) * 100;

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(thumb);
  };

  const handleTouchStart = (thumb: 'min' | 'max') => (e: React.TouchEvent) => {
    setDragging(thumb);
  };

  useEffect(() => {
    const handleMove = (clientX: number) => {
      if (!dragging || !trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const rawValue = min + (percent / 100) * (max - min);
      const value = Math.round(rawValue / step) * step;

      if (dragging === 'min') {
        onChange(Math.min(value, maxValue - step), maxValue);
      } else {
        onChange(minValue, Math.max(value, minValue + step));
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const handleEnd = () => setDragging(null);

    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [dragging, min, max, minValue, maxValue, step, onChange]);

  const colorClasses = {
    blue: {
      track: 'bg-blue-500',
      thumb: 'border-blue-500 hover:border-blue-600',
      thumbActive: 'border-blue-600 ring-2 ring-blue-200'
    },
    amber: {
      track: 'bg-amber-500',
      thumb: 'border-amber-500 hover:border-amber-600',
      thumbActive: 'border-amber-600 ring-2 ring-amber-200'
    },
    green: {
      track: 'bg-green-500',
      thumb: 'border-green-500 hover:border-green-600',
      thumbActive: 'border-green-600 ring-2 ring-green-200'
    }
  };

  const colors = colorClasses[accentColor];

  return (
    <div className="relative pt-6 pb-2">
      {/* Value labels */}
      <div className="absolute -top-1 left-0 right-0 flex justify-between text-xs font-medium text-gray-700">
        <span className="bg-white px-1">{formatValue(minValue)}</span>
        <span className="bg-white px-1">{formatValue(maxValue)}</span>
      </div>
      
      {/* Track */}
      <div ref={trackRef} className="relative h-2 bg-gray-200 rounded-full cursor-pointer">
        {/* Active range */}
        <div
          className={`absolute h-full ${colors.track} rounded-full`}
          style={{
            left: `${getPercent(minValue)}%`,
            width: `${getPercent(maxValue) - getPercent(minValue)}%`
          }}
        />
        
        {/* Min thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 rounded-full cursor-grab active:cursor-grabbing transition-shadow ${
            dragging === 'min' ? colors.thumbActive : colors.thumb
          }`}
          style={{ left: `calc(${getPercent(minValue)}% - 10px)` }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleTouchStart('min')}
        />
        
        {/* Max thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 rounded-full cursor-grab active:cursor-grabbing transition-shadow ${
            dragging === 'max' ? colors.thumbActive : colors.thumb
          }`}
          style={{ left: `calc(${getPercent(maxValue)}% - 10px)` }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleTouchStart('max')}
        />
      </div>

      {/* Scale markers */}
      <div className="flex justify-between mt-1 text-[10px] text-gray-400">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

// Single range slider for distance
const SingleRangeSlider = ({
  min,
  max,
  value,
  onChange,
  steps,
  formatValue = (v: number) => `${v}km`,
  accentColor = 'blue'
}: {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  steps: number[];
  formatValue?: (value: number) => string;
  accentColor?: 'blue' | 'amber' | 'red';
}) => {
  const { t } = useTranslation();
  
  const colorClasses = {
    blue: 'accent-blue-500',
    amber: 'accent-amber-500',
    red: 'accent-red-500'
  };

  // Find closest step
  const getClosestStep = (val: number) => {
    return steps.reduce((prev, curr) => 
      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseInt(e.target.value);
    onChange(getClosestStep(rawValue));
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {value === 0 ? t('tasks.allLatvia', 'All Latvia') : formatValue(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${colorClasses[accentColor]}`}
      />
      <div className="flex justify-between text-[10px] text-gray-400">
        {steps.map((step, i) => (
          <span key={step} className={value === step ? 'text-gray-700 font-medium' : ''}>
            {step === 0 ? '🇱🇻' : `${step}km`}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function AdvancedFilters({
  filters,
  onChange,
  maxPriceLimit = 500,
  showCategory = true,
  categoryOptions = [],
  variant = 'jobs'
}: AdvancedFiltersProps) {
  const { t } = useTranslation();

  const accentColor = variant === 'offerings' ? 'amber' : 'blue';

  const distanceSteps = [5, 10, 25, 50, 100, 0]; // 0 = all

  const dateOptions = [
    { value: 'all', label: t('filters.anyTime', 'Any time') },
    { value: 'today', label: t('filters.today', 'Today') },
    { value: 'week', label: t('filters.thisWeek', 'This week') },
    { value: 'month', label: t('filters.thisMonth', 'This month') }
  ];

  const handlePriceChange = (min: number, max: number) => {
    onChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const handleDistanceChange = (distance: number) => {
    onChange({ ...filters, distance });
  };

  const handleDateChange = (date: 'all' | 'today' | 'week' | 'month') => {
    onChange({ ...filters, datePosted: date });
  };

  const handleCategoryChange = (category: string) => {
    onChange({ ...filters, category });
  };

  const resetFilters = () => {
    onChange({
      minPrice: 0,
      maxPrice: maxPriceLimit,
      distance: 25,
      datePosted: 'all',
      category: 'all'
    });
  };

  const hasActiveFilters = 
    filters.minPrice > 0 || 
    filters.maxPrice < maxPriceLimit || 
    filters.datePosted !== 'all';

  return (
    <div className="space-y-5">
      {/* Header with reset */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span>⚙️</span> {t('filters.advancedFilters', 'Advanced Filters')}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {t('filters.reset', 'Reset')}
          </button>
        )}
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          💰 {variant === 'jobs' ? t('filters.budget', 'Budget') : t('filters.price', 'Price')}
        </label>
        <DualRangeSlider
          min={0}
          max={maxPriceLimit}
          minValue={filters.minPrice}
          maxValue={filters.maxPrice}
          onChange={handlePriceChange}
          step={5}
          formatValue={(v) => v === maxPriceLimit ? `€${v}+` : `€${v}`}
          accentColor={accentColor === 'amber' ? 'amber' : 'green'}
        />
      </div>

      {/* Distance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📍 {t('filters.distance', 'Distance')}
        </label>
        <SingleRangeSlider
          min={0}
          max={100}
          value={filters.distance}
          onChange={handleDistanceChange}
          steps={distanceSteps}
          formatValue={(v) => v === 0 ? t('tasks.allLatvia', 'All Latvia') : `${v}km`}
          accentColor="red"
        />
      </div>

      {/* Date Posted */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📅 {t('filters.datePosted', 'Date posted')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {dateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDateChange(option.value as any)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.datePosted === option.value
                  ? variant === 'offerings'
                    ? 'bg-amber-500 text-white'
                    : 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category (optional) */}
      {showCategory && categoryOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏷️ {t('filters.category', 'Category')}
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 ${
              variant === 'offerings' ? 'focus:ring-amber-500' : 'focus:ring-blue-500'
            } focus:border-transparent`}
          >
            {categoryOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className={`p-3 rounded-lg text-sm ${
          variant === 'offerings' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'
        }`}>
          <span className="font-medium">{t('filters.activeFilters', 'Active filters')}:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.minPrice > 0 && (
              <span className="px-2 py-1 bg-white rounded text-xs">
                {t('filters.minPrice', 'Min')}: €{filters.minPrice}
              </span>
            )}
            {filters.maxPrice < maxPriceLimit && (
              <span className="px-2 py-1 bg-white rounded text-xs">
                {t('filters.maxPrice', 'Max')}: €{filters.maxPrice}
              </span>
            )}
            {filters.datePosted !== 'all' && (
              <span className="px-2 py-1 bg-white rounded text-xs">
                📅 {dateOptions.find(d => d.value === filters.datePosted)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Utility function to filter items by date
export const filterByDate = <T extends { created_at?: string }>(
  items: T[],
  dateFilter: 'all' | 'today' | 'week' | 'month'
): T[] => {
  if (dateFilter === 'all') return items;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let cutoffDate: Date;
  switch (dateFilter) {
    case 'today':
      cutoffDate = startOfToday;
      break;
    case 'week':
      cutoffDate = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      cutoffDate = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      return items;
  }

  return items.filter(item => {
    if (!item.created_at) return true;
    return new Date(item.created_at) >= cutoffDate;
  });
};

// Utility function to filter items by price range
export const filterByPrice = <T extends { budget?: number; reward?: number; price?: number }>(
  items: T[],
  minPrice: number,
  maxPrice: number,
  maxLimit: number
): T[] => {
  return items.filter(item => {
    const price = item.budget || item.reward || item.price || 0;
    if (price < minPrice) return false;
    if (maxPrice < maxLimit && price > maxPrice) return false;
    return true;
  });
};
