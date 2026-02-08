import { PRICE_TYPES } from '../types';

interface PriceTypeSelectorProps {
  value: string;
  price: string;
  onTypeChange: (type: string) => void;
  onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PriceTypeSelector = ({ value, price, onTypeChange, onPriceChange }: PriceTypeSelectorProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">Pricing</label>

    {/* Price type pills */}
    <div className="flex gap-2 mb-3">
      {PRICE_TYPES.map(pt => {
        const isSelected = value === pt.value;
        return (
          <button
            key={pt.value}
            type="button"
            onClick={() => onTypeChange(pt.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 transition-all text-sm font-medium ${
              isSelected
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <span>{pt.icon}</span>
            <span>{pt.label}</span>
          </button>
        );
      })}
    </div>

    {/* Price input — hide for negotiable */}
    {value !== 'negotiable' && (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
        <input
          type="number"
          name="price"
          step="0.01"
          min="0"
          value={price}
          onChange={onPriceChange}
          placeholder={value === 'hourly' ? 'e.g., 15.00 per hour' : 'e.g., 50.00 total'}
          className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
        />
      </div>
    )}

    {value === 'negotiable' && (
      <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        💡 Clients will discuss pricing with you directly. You can still enter a starting price if you want.
      </p>
    )}
  </div>
);

export default PriceTypeSelector;
