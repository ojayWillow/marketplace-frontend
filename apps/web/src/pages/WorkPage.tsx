import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTasks, getOfferings } from '@marketplace/shared';
import { CATEGORIES, getCategoryIcon, getCategoryLabel } from '../constants/categories';

type MainTab = 'all' | 'jobs' | 'services';

interface WorkItem {
  id: string;
  type: 'job' | 'service';
  title: string;
  description?: string;
  category: string;
  budget?: number;
  price?: number;
  creator_name?: string;
  creator_id?: number;
  created_at: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

const MAX_CATEGORIES = 5;

const WorkPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [mainTab, setMainTab] = useState<MainTab>('all');
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch data based on tab and filters
  const fetchData = async (tab: MainTab, categories: string[]) => {
    setLoading(true);
    try {
      let allItems: WorkItem[] = [];

      // Fetch jobs if needed
      if (tab === 'all' || tab === 'jobs') {
        if (categories.length === 0) {
          const jobsResponse = await getTasks({ status: 'open' });
          const jobs = jobsResponse.tasks.map((task: any) => ({
            id: task.id,
            type: 'job' as const,
            title: task.title,
            description: task.description,
            category: task.category,
            budget: task.budget || task.reward,
            creator_name: task.creator_name,
            creator_id: task.creator_id,
            created_at: task.created_at,
            location: task.location,
            latitude: task.latitude,
            longitude: task.longitude,
          }));
          allItems = [...allItems, ...jobs];
        } else {
          // Fetch for each category
          for (const category of categories) {
            const jobsResponse = await getTasks({ status: 'open', category });
            const jobs = jobsResponse.tasks.map((task: any) => ({
              id: task.id,
              type: 'job' as const,
              title: task.title,
              description: task.description,
              category: task.category,
              budget: task.budget || task.reward,
              creator_name: task.creator_name,
              creator_id: task.creator_id,
              created_at: task.created_at,
              location: task.location,
              latitude: task.latitude,
              longitude: task.longitude,
            }));
            allItems = [...allItems, ...jobs];
          }
        }
      }

      // Fetch services if needed
      if (tab === 'all' || tab === 'services') {
        if (categories.length === 0) {
          const servicesResponse = await getOfferings({ status: 'active' });
          const services = servicesResponse.offerings.map((offering: any) => ({
            id: offering.id,
            type: 'service' as const,
            title: offering.title,
            description: offering.description,
            category: offering.category,
            price: offering.price,
            creator_name: offering.creator_name,
            creator_id: offering.creator_id,
            created_at: offering.created_at,
            location: offering.location,
            latitude: offering.latitude,
            longitude: offering.longitude,
          }));
          allItems = [...allItems, ...services];
        } else {
          // Fetch for each category
          for (const category of categories) {
            const servicesResponse = await getOfferings({ status: 'active', category });
            const services = servicesResponse.offerings.map((offering: any) => ({
              id: offering.id,
              type: 'service' as const,
              title: offering.title,
              description: offering.description,
              category: offering.category,
              price: offering.price,
              creator_name: offering.creator_name,
              creator_id: offering.creator_id,
              created_at: offering.created_at,
              location: offering.location,
              latitude: offering.latitude,
              longitude: offering.longitude,
            }));
            allItems = [...allItems, ...services];
          }
        }
      }

      // Remove duplicates and sort by created date (newest first)
      const uniqueItems = Array.from(
        new Map(allItems.map(item => [item.id, item])).values()
      );
      uniqueItems.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setItems(uniqueItems);
    } catch (error) {
      console.error('Failed to fetch work items:', error);
    }
    setLoading(false);
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchData(mainTab, selectedCategories);
  }, [mainTab, selectedCategories]);

  // Handle tab change
  const handleTabChange = (tab: MainTab) => {
    setMainTab(tab);
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryValue: string) => {
    if (selectedCategories.includes(categoryValue)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryValue));
    } else {
      if (selectedCategories.length < MAX_CATEGORIES) {
        setSelectedCategories([...selectedCategories, categoryValue]);
      }
    }
  };

  // Handle item click
  const handleItemClick = (item: WorkItem) => {
    if (item.type === 'job') {
      navigate(`/tasks/${item.id}`);
    } else {
      navigate(`/offerings/${item.id}`);
    }
  };

  // Get time ago string
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get difficulty level (based on price for jobs, just show for services)
  const getDifficulty = (item: WorkItem) => {
    const amount = item.type === 'job' ? item.budget : item.price;
    if (!amount) return 'Easy';
    if (amount < 30) return 'Easy';
    if (amount < 70) return 'Medium';
    return 'Hard';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Filter Sheet */}
      {showFilterSheet && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[10000]"
          onClick={() => setShowFilterSheet(false)}
        >
          <div 
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-[10001] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '85vh' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t('filters.title', 'Filters')}</h2>
              <button
                onClick={() => setShowFilterSheet(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏷️ {t('filters.categories', 'Categories')} 
                {selectedCategories.length > 0 && (
                  <span className="text-blue-600 ml-2">
                    ({selectedCategories.length}/{MAX_CATEGORIES} selected)
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.value);
                  const isDisabled = !isSelected && selectedCategories.length >= MAX_CATEGORIES;
                  
                  return (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryToggle(cat.value)}
                      disabled={isDisabled}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : isDisabled
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      {isSelected && (
                        <span className="ml-1 text-xs">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedCategories.length >= MAX_CATEGORIES && (
                <p className="text-xs text-gray-500 mt-2">
                  ℹ️ Maximum {MAX_CATEGORIES} categories selected. Deselect one to choose another.
                </p>
              )}
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setShowFilterSheet(false)}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium"
            >
              {t('filters.apply', 'Apply Filters')}
            </button>
          </div>
        </div>
      )}

      {/* Header with Tabs and Filter */}
      <div className="sticky top-0 bg-white shadow-sm z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Tab Pills */}
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mainTab === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {t('tasks.tabAll', 'All')}
            </button>
            <button
              onClick={() => handleTabChange('jobs')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mainTab === 'jobs'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {t('tasks.tabJobs', 'Jobs')}
            </button>
            <button
              onClick={() => handleTabChange('services')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mainTab === 'services'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {t('tasks.tabServices', 'Services')}
            </button>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterSheet(true)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full relative"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            {selectedCategories.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {selectedCategories.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {t('work.noItems', 'No items found')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('work.tryDifferentFilters', 'Try different filters or check back later')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const categoryIcon = getCategoryIcon(item.category);
              const categoryLabel = getCategoryLabel(item.category);
              const price = item.type === 'job' ? item.budget : item.price;
              const timeAgo = getTimeAgo(item.created_at);
              const difficulty = getDifficulty(item);
              
              // Color scheme based on type
              const isJob = item.type === 'job';
              const headerBgColor = isJob ? 'bg-blue-50' : 'bg-orange-50';
              const priceColor = isJob ? 'text-blue-600' : 'text-orange-600';
              const iconColor = isJob ? 'text-blue-600' : 'text-orange-600';
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden active:shadow-lg transition-all cursor-pointer"
                >
                  {/* Color-coded Header */}
                  <div className={`${headerBgColor} px-4 py-2.5 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${iconColor}`}>{categoryIcon}</span>
                      <span className="text-sm font-medium text-gray-700">{categoryLabel}</span>
                    </div>
                    {price && (
                      <div className={`text-xl font-bold ${priceColor}`}>
                        €{price}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 mb-3 line-clamp-2">
                      {item.title}
                    </h3>

                    {/* User Info Row */}
                    <div className="flex items-center gap-2 mb-3">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {item.creator_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      
                      {/* Username */}
                      <span className="text-sm font-medium text-gray-900">
                        {item.creator_name || 'Anonymous'}
                      </span>
                      
                      {/* Rating (placeholder - you can add real ratings later) */}
                      <span className="text-xs text-gray-500 flex items-center gap-0.5">
                        <span className="text-yellow-500">⭐</span>
                        <span>4.8</span>
                        <span className="text-gray-400">(23)</span>
                      </span>
                      
                      {/* Location */}
                      {item.location && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{item.location}</span>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Footer Metadata */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                      {/* Difficulty */}
                      <span className="flex items-center gap-1">
                        <span>🔨</span>
                        <span>{difficulty}</span>
                      </span>
                      
                      <span className="text-gray-300">•</span>
                      
                      {/* Time ago */}
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkPage;
