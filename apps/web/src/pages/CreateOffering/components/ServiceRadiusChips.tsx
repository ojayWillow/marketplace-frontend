import { RADIUS_OPTIONS } from '../types';

interface ServiceRadiusChipsProps {
  value: string;
  onChange: (radius: string) => void;
}

const ServiceRadiusChips = ({ value, onChange }: ServiceRadiusChipsProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">
      How far will you travel?
    </label>
    <div className="flex flex-wrap gap-2">
      {RADIUS_OPTIONS.map(opt => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-full border-2 transition-all text-sm font-medium ${
              isSelected
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {opt.label}
            <span className={`ml-1 text-xs ${isSelected ? 'text-amber-500' : 'text-gray-400'}`}>
              {opt.desc}
            </span>
          </button>
        );
      })}
    </div>
    <p className="text-xs text-gray-500 mt-2">Maximum distance you're willing to travel to work</p>
  </div>
);

export default ServiceRadiusChips;
