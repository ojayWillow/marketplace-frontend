import { useTranslation } from 'react-i18next';
import { GeocodingResult } from '@marketplace/shared';

interface LocationEditorProps {
  location: string;
  latitude: number;
  longitude: number;
  searchingAddress: boolean;
  addressSuggestions: GeocodingResult[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (result: GeocodingResult) => void;
}

const LocationEditor = ({
  location, latitude, longitude,
  searchingAddress, addressSuggestions,
  onChange, onSelect,
}: LocationEditorProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t('editOffering.location', 'Service Area')} *
        {searchingAddress && (
          <span className="text-amber-500 dark:text-amber-400 text-xs ml-1">({t('common.loading', 'searching...')})</span>
        )}
      </label>
      <input
        type="text"
        id="location"
        name="location"
        required
        value={location}
        onChange={onChange}
        placeholder={t('editOffering.locationPlaceholder', 'e.g., Riga, Centrs or your neighborhood')}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
        autoComplete="off"
      />

      {addressSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg dark:shadow-gray-900/50 max-h-60 overflow-y-auto">
          {addressSuggestions.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(result)}
              className="w-full text-left px-4 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="text-sm text-gray-900 dark:text-gray-100">{result.display_name}</div>
            </button>
          ))}
        </div>
      )}

      {location && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          \uD83D\uDCCD {t('editOffering.coordinates', 'Coordinates')}: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      )}
    </div>
  );
};

export default LocationEditor;
