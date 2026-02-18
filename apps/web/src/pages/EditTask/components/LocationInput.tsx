import { useTranslation } from 'react-i18next';
import { GeocodingResult } from '@marketplace/shared';
import { DEFAULT_LOCATION } from '../../../constants/locations';

interface LocationInputProps {
  location: string;
  latitude: number;
  longitude: number;
  searchingAddress: boolean;
  addressSuggestions: GeocodingResult[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (result: GeocodingResult) => void;
}

const LocationInput = ({
  location, latitude, longitude,
  searchingAddress, addressSuggestions,
  onChange, onSelect,
}: LocationInputProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t('common.location', 'Location')} * {searchingAddress && <span className="text-blue-500 dark:text-blue-400 text-xs">({t('editTask.searching', 'searching...')})</span>}
      </label>
      <input
        type="text"
        id="location"
        name="location"
        required
        value={location}
        onChange={onChange}
        placeholder={t('editTask.locationPlaceholder', 'e.g., Riga, Centrs or Brivibas iela 1, Riga')}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
        autoComplete="off"
      />

      {addressSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg dark:shadow-gray-900/50 max-h-60 overflow-y-auto">
          {addressSuggestions.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(result)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="text-sm text-gray-900 dark:text-gray-100">{result.display_name}</div>
            </button>
          ))}
        </div>
      )}

      {location && latitude !== DEFAULT_LOCATION.lat && longitude !== DEFAULT_LOCATION.lng && (
        <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {t('editTask.locationConfirmed', 'Location confirmed')}
        </p>
      )}
    </div>
  );
};

export default LocationInput;
