import { useTranslation } from 'react-i18next';
import { getCategoryLabel } from '../../constants/categories';

interface SmartEmptyStateProps {
  // Current filter values
  searchRadius: number;
  category: string;
  searchQuery: string;
  minPrice: number;
  maxPrice: number;
  datePosted: string;
  
  // Counts at different radius levels (optional - for smart suggestions)
  nearbyCount?: {
    radius: number;
    count: number;
  };
  
  // Total unfiltered count
  totalUnfilteredCount?: number;
  
  // Callbacks
  onExpandRadius?: (newRadius: number) => void;
  onClearCategory?: () => void;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
  
  // Type: jobs or offerings
  type: 'jobs' | 'offerings';
  
  // Is user authenticated
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onCreate?: () => void;
}

const SmartEmptyState = ({
  searchRadius,
  category,
  searchQuery,
  minPrice,
  maxPrice,
  datePosted,
  nearbyCount,
  totalUnfilteredCount,
  onExpandRadius,
  onClearCategory,
  onClearFilters,
  onClearSearch,
  type,
  isAuthenticated,
  onLogin,
  onCreate
}: SmartEmptyStateProps) => {
  const { t } = useTranslation();
  
  const isJobs = type === 'jobs';
  const emoji = isJobs ? '💰' : '👋';
  const themeColor = isJobs ? 'blue' : 'amber';
  const itemName = isJobs ? t('common.jobs', 'jobs') : t('common.offerings', 'offerings');
  const categoryLabel = category !== 'all' ? getCategoryLabel(category) : null;
  
  // Determine what filters are active
  const hasRadiusFilter = searchRadius > 0 && searchRadius < 100;
  const hasCategoryFilter = category !== 'all';
  const hasSearchQuery = searchQuery.length > 0;
  const hasPriceFilter = minPrice > 0 || maxPrice < 500;
  const hasDateFilter = datePosted !== 'all';
  const hasAnyFilter = hasRadiusFilter || hasCategoryFilter || hasSearchQuery || hasPriceFilter || hasDateFilter;
  
  // Suggest next radius level
  const getNextRadius = (current: number): number => {
    if (current <= 5) return 10;
    if (current <= 10) return 25;
    if (current <= 25) return 50;
    if (current <= 50) return 100;
    return 0; // All Latvia
  };
  
  const nextRadius = getNextRadius(searchRadius);
  
  // Build contextual message
  const buildMainMessage = (): string => {
    const parts: string[] = [];
    
    if (hasCategoryFilter && categoryLabel) {
      parts.push(categoryLabel.toLowerCase());
    }
    
    if (hasSearchQuery) {
      parts.push(`"${searchQuery}"`);
    }
    
    if (parts.length > 0) {
      if (hasRadiusFilter) {
        return t('emptyState.noResultsWithFilters', 'No {{items}} matching {{filters}} within {{radius}}km', {
          items: itemName,
          filters: parts.join(' '),
          radius: searchRadius
        });
      }
      return t('emptyState.noResultsMatching', 'No {{items}} matching {{filters}}', {
        items: itemName,
        filters: parts.join(' ')
      });
    }
    
    if (hasRadiusFilter) {
      return t('emptyState.noResultsInRadius', 'No {{items}} within {{radius}}km', {
        items: itemName,
        radius: searchRadius
      });
    }
    
    if (hasPriceFilter) {
      return t('emptyState.noResultsInPriceRange', 'No {{items}} in your price range (€{{min}}-€{{max}})', {
        items: itemName,
        min: minPrice,
        max: maxPrice
      });
    }
    
    if (hasDateFilter) {
      const dateLabels: Record<string, string> = {
        'today': t('filters.today', 'today'),
        'week': t('filters.thisWeek', 'this week'),
        'month': t('filters.thisMonth', 'this month')
      };
      return t('emptyState.noResultsPosted', 'No {{items}} posted {{period}}', {
        items: itemName,
        period: dateLabels[datePosted] || datePosted
      });
    }
    
    return searchRadius === 0
      ? t('emptyState.noResultsInLatvia', 'No {{items}} in Latvia yet', { items: itemName })
      : t('emptyState.noResultsNearby', 'No {{items}} nearby', { items: itemName });
  };
  
  // Build suggestion message
  const buildSuggestion = (): string | null => {
    // If we have nearby count data, show it
    if (nearbyCount && nearbyCount.count > 0) {
      return t('emptyState.foundAtRadius', 'We found {{count}} {{items}} within {{radius}}km', {
        count: nearbyCount.count,
        items: itemName,
        radius: nearbyCount.radius
      });
    }
    
    // If total unfiltered count exists
    if (totalUnfilteredCount && totalUnfilteredCount > 0) {
      if (hasCategoryFilter) {
        return t('emptyState.totalWithoutCategory', '{{count}} {{items}} available if you remove the category filter', {
          count: totalUnfilteredCount,
          items: itemName
        });
      }
      if (hasPriceFilter) {
        return t('emptyState.totalWithoutPrice', '{{count}} {{items}} available in all price ranges', {
          count: totalUnfilteredCount,
          items: itemName
        });
      }
    }
    
    return null;
  };
  
  const mainMessage = buildMainMessage();
  const suggestion = buildSuggestion();
  
  return (
    <div className={`text-center py-12 bg-gradient-to-br from-${themeColor}-50 to-white rounded-xl border-2 border-dashed border-${themeColor}-200`}>
      <div className="text-5xl mb-4">{emoji}</div>
      
      {/* Main message */}
      <p className="text-gray-900 font-semibold text-lg mb-2">
        {mainMessage}
      </p>
      
      {/* Suggestion with count */}
      {suggestion && (
        <p className="text-green-600 font-medium mb-3">
          💡 {suggestion}
        </p>
      )}
      
      {/* Contextual help text */}
      <p className="text-gray-500 mb-4 max-w-md mx-auto">
        {hasAnyFilter
          ? t('emptyState.tryAdjusting', 'Try adjusting your filters to see more results')
          : isJobs
            ? t('emptyState.beFirstJob', 'Be the first to post a job in your area!')
            : t('emptyState.beFirstOffering', 'Be the first to offer your services here!')
        }
      </p>
      
      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {/* Expand radius button */}
        {hasRadiusFilter && nextRadius > 0 && onExpandRadius && (
          <button
            onClick={() => onExpandRadius(nextRadius)}
            className={`px-4 py-2 bg-${themeColor}-100 text-${themeColor}-700 rounded-lg hover:bg-${themeColor}-200 font-medium transition-colors flex items-center gap-2`}
          >
            📍 {t('emptyState.expandTo', 'Expand to {{radius}}km', { radius: nextRadius })}
          </button>
        )}
        
        {/* View all Latvia button */}
        {hasRadiusFilter && searchRadius > 0 && onExpandRadius && (
          <button
            onClick={() => onExpandRadius(0)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors flex items-center gap-2"
          >
            🇱🇻 {t('emptyState.viewAllLatvia', 'View all Latvia')}
          </button>
        )}
        
        {/* Clear category button */}
        {hasCategoryFilter && onClearCategory && (
          <button
            onClick={onClearCategory}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            🏷️ {t('emptyState.allCategories', 'All categories')}
          </button>
        )}
        
        {/* Clear search button */}
        {hasSearchQuery && onClearSearch && (
          <button
            onClick={onClearSearch}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            ✕ {t('emptyState.clearSearch', 'Clear search')}
          </button>
        )}
        
        {/* Clear all filters */}
        {hasAnyFilter && onClearFilters && (
          <button
            onClick={onClearFilters}
            className={`px-4 py-2 bg-${themeColor}-500 text-white rounded-lg hover:bg-${themeColor}-600 font-medium transition-colors`}
          >
            {t('filters.clearFilters', 'Clear all filters')}
          </button>
        )}
        
        {/* Create button (when no filters active) */}
        {!hasAnyFilter && isAuthenticated && onCreate && (
          <button
            onClick={onCreate}
            className={`px-6 py-3 bg-${themeColor}-500 text-white rounded-lg hover:bg-${themeColor}-600 font-medium transition-colors`}
          >
            {emoji} {isJobs 
              ? t('tasks.postFirstJob', 'Post Your First Job')
              : t('offerings.offerYourServices', 'Offer Your Services')
            }
          </button>
        )}
        
        {/* Login button (when not authenticated) */}
        {!hasAnyFilter && !isAuthenticated && onLogin && (
          <button
            onClick={onLogin}
            className={`px-6 py-3 bg-${themeColor}-500 text-white rounded-lg hover:bg-${themeColor}-600 font-medium transition-colors`}
          >
            {isJobs 
              ? t('tasks.loginToPostJob', 'Login to Post a Job')
              : t('offerings.loginToOffer', 'Login to Offer Services')
            }
          </button>
        )}
      </div>
    </div>
  );
};

export default SmartEmptyState;
