import { useTranslation } from 'react-i18next';
import { GeocodingResult } from '@marketplace/shared';

interface LocationInputProps {
  location: string;
  latitude: number;
  longitude: number;
  locationStatus: 'none' | 'typing' | 'exact' | 'approximate';
  searchingAddress: boolean;
  addressSuggestions: GeocodingResult[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (result: GeocodingResult) => void;
}

const LocationInput = ({
  location, latitude, longitude,
  locationStatus, searchingAddress, addressSuggestions,
  onChange, onSelect,
}: LocationInputProps) => {
  const { t } = useTranslation();

  const statusUI = () => {
    switch (locationStatus) {
      case 'exact':
        return (
          <div className="flex items-center gap-2 text-green-600 text-xs mt-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>📍 {t('createTask.locationExact', 'Exact location set')}: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
          </div>
        );
      case 'approximate':
        return (
          <div className="flex items-center gap-2 text-amber-600 text-xs mt-1">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            <span>📍 {t('createTask.locationApproximateLabel', 'Approximate location')}: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
          </div>
        );
      case 'typing':
        return (
          <div className="flex items-center gap-2 text-blue-600 text-xs mt-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span>{t('createTask.locationSelectHint', "Select from suggestions below for exact location, or we'll use approximate area")}</span>
          </div>
        );
      default:
        return (
          <p className="text-xs text-gray-500 mt-1">
            {t('createTask.locationTypeHint', 'Start typing and select from suggestions for exact location')}
          </p>
        );
    }
  };

  return (
    <div className="relative">
      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
        {t('createTask.location', 'Location')} *
        {searchingAddress && <span className="text-blue-500 text-xs ml-1">({t('common.loading', 'searching...')})</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          id="location"
          name="location"
          required
          value={location}
          onChange={onChange}
          placeholder={t('createTask.locationPlaceholder', 'e.g., Teika, Riga or Brivibas iela 1, Riga')}
          autoComplete="off"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
            locationStatus === 'exact'
              ? 'border-green-300 bg-green-50'
              : locationStatus === 'approximate'
                ? 'border-amber-300 bg-amber-50'
                : 'border-gray-300'
          }`}
        />
        {locationStatus === 'exact' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
        )}
      </div>

      {addressSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="px-3 py-1.5 bg-blue-50 border-b text-xs text-blue-700">
            👆 {t('createTask.selectForExact', 'Select for exact location on map')}
          </div>
          {addressSuggestions.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(result)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 text-sm text-gray-900"
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}

      {statusUI()}
    </div>
  );
};

export default LocationInput;
