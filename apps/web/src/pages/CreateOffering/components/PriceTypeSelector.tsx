import { PRICE_TYPES } from '../types';

interface PriceTypeSelectorProps {
  value: string;
  price: string;
  onTypeChange: (type: string) => void;
  onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PriceTypeSelector = ({ value, price, onTypeChange, onPriceChange }: PriceTypeSelectorProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Pricing</label>

    <div className="flex gap-1.5 mb-2">
      {PRICE_TYPES.map(pt => {
        const isSelected = value === pt.value;
        return (
          <button
            key={pt.value}
            type="button"
            onClick={() => onTypeChange(pt.value)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border transition-all text-xs font-semibold ${
              isSelected
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            <span className="text-sm">{pt.icon}</span>
            <span>{pt.label}</span>
          </button>
        );
      })}
    </div>

    {value !== 'negotiable' ? (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">€</span>
        <input
          type="number"
          name="price"
          step="0.01"
          min="0"
          value={price}
          onChange={onPriceChange}
          placeholder={value === 'hourly' ? 'e.g., 15' : 'e.g., 50'}
          className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
        />
      </div>
    ) : (
      <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        💡 Clients will discuss pricing with you directly.
      </p>
    )}
  </div>
);

export default PriceTypeSelector;
