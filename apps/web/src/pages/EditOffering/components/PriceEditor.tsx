import { useTranslation } from 'react-i18next';
import { PRICE_TYPES } from '../types';

interface PriceEditorProps {
  price: string;
  priceType: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const PriceEditor = ({ price, priceType, onChange }: PriceEditorProps) => {
  const { t } = useTranslation();
  const selectedPriceType = PRICE_TYPES.find(pt => pt.value === priceType);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            {t('editOffering.price', 'Price (EUR)')}
          </label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            min="0"
            value={price}
            onChange={onChange}
            placeholder={t('editOffering.pricePlaceholder', 'e.g., 20.00')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="price_type" className="block text-sm font-medium text-gray-700 mb-2">
            {t('editOffering.priceType', 'Price Type')}
          </label>
          <select
            id="price_type"
            name="price_type"
            value={priceType}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {PRICE_TYPES.map(pt => (
              <option key={pt.value} value={pt.value}>
                {t(pt.labelKey, pt.labelDefault)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {selectedPriceType && (
        <p className="text-xs text-gray-500 -mt-4">
          {t(selectedPriceType.descKey, selectedPriceType.descDefault)}
        </p>
      )}
    </>
  );
};

export default PriceEditor;
