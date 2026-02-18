import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FilterSheet from '../../components/MobileTasksView/components/FilterSheet';
import { useWorkPage } from './hooks';
import { MAX_CATEGORIES } from './types';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  TabBar,
  SkeletonCard,
  WorkItemCard,
  ErrorState,
  EmptyState,
  InlineError,
  WorkFAB,
  MyWorkDashboard,
} from './components';

const WorkPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
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
    searchRadius,
    handleRadiusChange,
    handleCategoryToggle,
    handleItemClick,
    handleRetry,
    getCategoryInfo,
    userChangedRadius,
    myWork,
  } = useWorkPage();

  const isMineTab = mainTab === 'mine';

  // Radius-aware empty state
  const renderRadiusEmptyState = () => {
    if (userChangedRadius && itemsWithDistance.length === 0 && !initialLoading) {
      return (
        <div className="text-center py-8 px-4">
          <div className="text-3xl mb-2">📍</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {t('tasks.work.noJobsAtRadius', 'No results within {{radius}}km', { radius: searchRadius })}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('tasks.work.tryExpandRadius', 'Try increasing your search radius to find more results')}
          </p>
        </div>
      );
    }
    return <EmptyState mainTab={mainTab} hasFilters={selectedCategories.length > 0} />;
  };

  // Marketplace feed content (shared between mobile and desktop)
  const renderMarketplaceFeed = () => (
    <>
      {initialLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error && items.length === 0 ? (
        <ErrorState error={error} onRetry={handleRetry} />
      ) : itemsWithDistance.length === 0 ? (
        renderRadiusEmptyState()
      ) : (
        <>
          {error && <InlineError error={error} onRetry={handleRetry} />}
          <div className="space-y-2">
            {itemsWithDistance.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
              >
                <WorkItemCard
                  item={item}
                  categoryInfo={getCategoryInfo(item.category)}
                  onClick={() => handleItemClick(item)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );

  // Mine tab content
  const renderMyWork = () => (
    <MyWorkDashboard
      activeMode={myWork.activeMode}
      onModeChange={myWork.setActiveMode}
      createdTasks={myWork.createdTasks}
      myApplications={myWork.myApplications}
      taskMatchCounts={myWork.taskMatchCounts}
      tasksLoading={myWork.tasksLoading}
      applicationsLoading={myWork.applicationsLoading}
      taskViewMode={myWork.taskViewMode}
      taskStatusFilter={myWork.taskStatusFilter}
      onViewModeChange={myWork.setTaskViewMode}
      onStatusFilterChange={myWork.setTaskStatusFilter}
      onCancelTask={myWork.handleCancelTask}
      onTaskConfirmed={myWork.fetchTasks}
      userId={myWork.userId}
      offerings={myWork.myOfferings}
      offeringsLoading={myWork.offeringsLoading}
      onDeleteOffering={myWork.handleDeleteOffering}
      pendingNotifications={myWork.totalPendingApplicationsOnMyTasks}
      loading={myWork.loading}
    />
  );

  // Mobile: flex layout that fills the space from fullscreen Layout
  if (isMobile) {
    return (
      <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-950 animate-page-enter">
        <FilterSheet
          isOpen={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          searchRadius={searchRadius}
          onRadiusChange={handleRadiusChange}
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
          pendingNotifications={myWork.totalPendingApplicationsOnMyTasks}
        />

        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4">
          {isMineTab ? renderMyWork() : renderMarketplaceFeed()}
        </div>

        <WorkFAB />
      </div>
    );
  }

  // Desktop: standard layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-page-enter">
      <FilterSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        searchRadius={searchRadius}
        onRadiusChange={handleRadiusChange}
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
        pendingNotifications={myWork.totalPendingApplicationsOnMyTasks}
      />

      <div className="px-4 py-4">
        {isMineTab ? renderMyWork() : renderMarketplaceFeed()}
      </div>

      <WorkFAB />
    </div>
  );
};

export default WorkPage;
