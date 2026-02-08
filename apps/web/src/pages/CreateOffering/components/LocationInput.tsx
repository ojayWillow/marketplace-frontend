import { useAddressSearch } from '../hooks';
import { OfferingFormData } from '../types';
import { GeocodingResult } from '@marketplace/shared';

interface LocationInputProps {
  location: string;
  latitude: number;
  longitude: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (result: GeocodingResult) => void;
}

const LocationInput = ({ location, latitude, longitude, onChange, onSelect }: LocationInputProps) => {
  const { searching, suggestions, clearSuggestions } = useAddressSearch(location);

  const handleSelect = (result: GeocodingResult) => {
    onSelect(result);
    clearSuggestions();
  };

  return (
    <div className="relative">
      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
        Your Location *
        {searching && <span className="text-amber-500 text-xs ml-2">(searching...)</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
        <input
          type="text"
          id="location"
          name="location"
          required
          value={location}
          onChange={onChange}
          placeholder="Where do you offer this service?"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          autoComplete="off"
        />
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-2.5 hover:bg-amber-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="text-sm text-gray-900">{result.display_name}</div>
            </button>
          ))}
        </div>
      )}

      {location && (
        <p className="text-xs text-gray-500 mt-1">
          📍 Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      )}
    </div>
  );
};

export default LocationInput;
