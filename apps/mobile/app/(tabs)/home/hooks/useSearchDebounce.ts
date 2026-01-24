import { useState, useEffect, useRef, useCallback } from 'react';
import { haptic } from '../../../../utils/haptics';

interface UseSearchDebounceResult {
  searchQuery: string;
  debouncedSearchQuery: string;
  setSearchQuery: (query: string) => void;
  handleClearSearch: () => void;
}

export const useSearchDebounce = (delay: number = 300): UseSearchDebounceResult => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      setDebouncedSearchQuery('');
      return;
    }
    
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, delay);
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, delay]);

  const handleClearSearch = useCallback(() => {
    haptic.soft();
    setSearchQuery('');
    setDebouncedSearchQuery('');
  }, []);

  return {
    searchQuery,
    debouncedSearchQuery,
    setSearchQuery,
    handleClearSearch,
  };
};
