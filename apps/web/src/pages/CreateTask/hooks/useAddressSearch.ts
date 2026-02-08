import { useState, useEffect } from 'react';
import { geocodeAddress, GeocodingResult } from '@marketplace/shared';

export const useAddressSearch = (query: string) => {
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 3) {
        try {
          setSearching(true);
          const results = await geocodeAddress(query);
          setSuggestions(results);
        } catch (error) {
          console.error('Geocoding error:', error);
          setSuggestions([]);
        } finally {
          setSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const clearSuggestions = () => setSuggestions([]);

  return { searching, suggestions, clearSuggestions };
};
