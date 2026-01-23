import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AddressSuggestion } from '@marketplace/shared';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number, name?: string) => void;
  onResetToAuto: () => void;
  manualLocationSet: boolean;
}

const LocationModal = ({ 
  isOpen, 
  onClose, 
  onLocationSelect, 
  onResetToAuto,
  manualLocationSet 
}: LocationModalProps) => {
  const { t } = useTranslation();
  const [addressSearch, setAddressSearch] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const searchAddressSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=lv&limit=8&addressdetails=1`,
        { headers: { 'Accept-Language': 'lv,en' } }
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.error('Error searching address:', err);
      setSuggestions([]);
    } finally {
      setSearchingAddress(false);
    }
  };

  const handleAddressInputChange = (value: string) => {
    setAddressSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchAddressSuggestions(value), 300);
  };

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const name = suggestion.display_name.split(',').slice(0, 3).join(', ');
    onLocationSelect(lat, lng, name);
    setAddressSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    >
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📍 {t('tasks.changeLocation', 'Change Location')}
        </label>
        <input 
          type="text" 
          value={addressSearch} 
          onChange={(e) => handleAddressInputChange(e.target.value)} 
          placeholder={t('tasks.searchAddress', 'Search address or city...')} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
          autoFocus
        />
        {searchingAddress && (
          <span className="text-sm text-gray-500 mt-1">
            {t('common.loading', 'Searching...')}
          </span>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
          {suggestions.map((suggestion, index) => (
            <button 
              key={index} 
              onClick={() => selectSuggestion(suggestion)} 
              className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b last:border-b-0 text-sm"
            >
              {suggestion.display_name}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
        {manualLocationSet && (
          <button 
            onClick={onResetToAuto} 
            className="text-sm text-blue-600 hover:underline"
          >
            {t('tasks.resetLocation', 'Reset to auto-detect')}
          </button>
        )}
        <button 
          onClick={onClose} 
          className="ml-auto text-sm text-gray-500 hover:text-gray-700"
        >
          {t('common.close', 'Close')}
        </button>
      </div>
    </div>
  );
};

export default LocationModal;
