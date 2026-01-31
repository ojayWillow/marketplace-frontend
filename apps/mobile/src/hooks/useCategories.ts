import { useMemo } from 'react';
import { useTranslation } from './useTranslation';
import { CATEGORIES, FORM_CATEGORIES, type Category } from '@marketplace/shared';

// Translated category interface
export interface TranslatedCategory {
  key: string;
  label: string;
  icon: string;
  description: string;
}

/**
 * Hook to get categories with translated labels and descriptions.
 * Uses the current language from the translation system.
 */
export function useCategories() {
  const { t } = useTranslation();

  // Get translated categories (all categories including 'all')
  const categories = useMemo((): TranslatedCategory[] => {
    return CATEGORIES.map((category) => ({
      key: category.key,
      icon: category.icon,
      label: (t.categories as Record<string, string>)[category.key] || category.label,
      description: (t.categories.descriptions as Record<string, string>)[category.key] || category.description,
    }));
  }, [t]);

  // Get translated form categories (excludes 'all')
  const formCategories = useMemo((): TranslatedCategory[] => {
    return FORM_CATEGORIES.map((category) => ({
      key: category.key,
      icon: category.icon,
      label: (t.categories as Record<string, string>)[category.key] || category.label,
      description: (t.categories.descriptions as Record<string, string>)[category.key] || category.description,
    }));
  }, [t]);

  // Get translated label for a category key
  const getCategoryLabel = (key: string): string => {
    return (t.categories as Record<string, string>)[key] || key;
  };

  // Get translated description for a category key
  const getCategoryDescription = (key: string): string => {
    return (t.categories.descriptions as Record<string, string>)[key] || '';
  };

  // Get icon for a category key (icons don't need translation)
  const getCategoryIcon = (key: string): string => {
    const category = CATEGORIES.find(c => c.key === key);
    return category?.icon || '📋';
  };

  // Get full translated category by key
  const getCategoryByKey = (key: string): TranslatedCategory | undefined => {
    const category = CATEGORIES.find(c => c.key === key);
    if (!category) return undefined;
    
    return {
      key: category.key,
      icon: category.icon,
      label: (t.categories as Record<string, string>)[category.key] || category.label,
      description: (t.categories.descriptions as Record<string, string>)[category.key] || category.description,
    };
  };

  return {
    categories,
    formCategories,
    getCategoryLabel,
    getCategoryDescription,
    getCategoryIcon,
    getCategoryByKey,
  };
}
