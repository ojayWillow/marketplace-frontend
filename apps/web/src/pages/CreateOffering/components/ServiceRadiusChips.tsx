import { RADIUS_OPTIONS } from '../types';

interface ServiceRadiusChipsProps {
  value: string;
  onChange: (radius: string) => void;
}

const ServiceRadiusChips = ({ value, onChange }: ServiceRadiusChipsProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      How far will you travel?
    </label>
    <div className="flex flex-wrap gap-1.5">
      {RADIUS_OPTIONS.map(opt => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              isSelected
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

export default ServiceRadiusChips;
