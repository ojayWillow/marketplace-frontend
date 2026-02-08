import { GeocodingResult } from '@marketplace/shared';

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
}: LocationInputProps) => (
  <div className="relative">
    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
      Location * {searchingAddress && <span className="text-blue-500 text-xs">(searching...)</span>}
    </label>
    <input
      type="text"
      id="location"
      name="location"
      required
      value={location}
      onChange={onChange}
      placeholder="e.g., Riga, Centrs or Brivibas iela 1, Riga"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      autoComplete="off"
    />

    {addressSuggestions.length > 0 && (
      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
        {addressSuggestions.map((result, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(result)}
            className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
          >
            <div className="text-sm text-gray-900">{result.display_name}</div>
          </button>
        ))}
      </div>
    )}

    {location && (
      <p className="text-xs text-gray-500 mt-1">
        \uD83D\uDCCD Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </p>
    )}
  </div>
);

export default LocationInput;
