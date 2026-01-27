import { useState, useEffect, useRef, useCallback } from 'react';

export function useSearchDebounce(delay: number = 300) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setDebouncedSearchQuery('');
      return;
    }
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, delay);
    
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, delay]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    clearSearch,
  };
}
