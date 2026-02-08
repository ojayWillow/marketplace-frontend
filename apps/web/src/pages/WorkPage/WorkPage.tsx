import FilterSheet from '../../components/MobileTasksView/components/FilterSheet';
import { useWorkPage } from './hooks';
import { MAX_CATEGORIES } from './types';
import {
  TabBar,
  SkeletonCard,
  WorkItemCard,
  ErrorState,
  EmptyState,
  InlineError,
} from './components';

const WorkPage = () => {
  const {
    mainTab,
    setMainTab,
    items,
    itemsWithDistance,
    initialLoading,
    refreshing,
    error,
    showFilterSheet,
    setShowFilterSheet,
    selectedCategories,
    userLocation,
    handleCategoryToggle,
    handleItemClick,
    handleRetry,
    getCategoryInfo,
  } = useWorkPage();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <FilterSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        searchRadius={0}
        onRadiusChange={() => {}}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        maxCategories={MAX_CATEGORIES}
      />

      <TabBar
        mainTab={mainTab}
        onTabChange={setMainTab}
        onFilterClick={() => setShowFilterSheet(true)}
        selectedCategoryCount={selectedCategories.length}
        itemCount={items.length}
        refreshing={refreshing}
        initialLoading={initialLoading}
        hasError={!!error}
        hasUserLocation={!!userLocation}
      />

      <div className="px-4 py-4">
        {initialLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error && items.length === 0 ? (
          <ErrorState error={error} onRetry={handleRetry} />
        ) : itemsWithDistance.length === 0 ? (
          <EmptyState mainTab={mainTab} hasFilters={selectedCategories.length > 0} />
        ) : (
          <>
            {error && <InlineError error={error} onRetry={handleRetry} />}
            <div className="space-y-2">
              {itemsWithDistance.map((item) => (
                <WorkItemCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  categoryInfo={getCategoryInfo(item.category)}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkPage;
