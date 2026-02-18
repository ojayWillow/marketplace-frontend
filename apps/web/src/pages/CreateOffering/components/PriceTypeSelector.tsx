import { useTranslation } from 'react-i18next';

const PRICE_TYPES = [
  { value: 'hourly', icon: '⏱️' },
  { value: 'fixed', icon: '🎯' },
  { value: 'negotiable', icon: '🤝' },
] as const;

interface PriceTypeSelectorProps {
  value: string;
  price: string;
  onTypeChange: (type: string) => void;
  onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PriceTypeSelector = ({ value, price, onTypeChange, onPriceChange }: PriceTypeSelectorProps) => {
  const { t } = useTranslation();

  const labelKeys: Record<string, string> = {
    hourly: 'createOffering.priceTypeHourly',
    fixed: 'createOffering.priceTypeFixed',
    negotiable: 'createOffering.priceTypeNegotiable',
  };
  const labelFallbacks: Record<string, string> = { hourly: '/hr', fixed: 'Fixed', negotiable: 'Nego' };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('createOffering.priceType', 'Pricing')}</label>

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
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <span className="text-sm">{pt.icon}</span>
              <span>{t(labelKeys[pt.value], labelFallbacks[pt.value])}</span>
            </button>
          );
        })}
      </div>

      {value !== 'negotiable' ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium">€</span>
          <input
            type="number"
            name="price"
            step="0.01"
            min="0"
            value={price}
            onChange={onPriceChange}
            placeholder={t('createOffering.pricePlaceholder', value === 'hourly' ? 'e.g., 15' : 'e.g., 50')}
            className="w-full pl-7 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
          💡 {t('createOffering.priceTypeNegotiableDesc', 'Clients will discuss pricing with you directly.')}
        </p>
      )}
    </div>
  );
};

export default PriceTypeSelector;
