import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTasks, getOfferings } from '@marketplace/shared';
import { CATEGORIES } from '../constants/categories';

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
  created_at: string;
  location?: string;
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
            created_at: task.created_at,
            location: task.location,
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
              created_at: task.created_at,
              location: task.location,
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
            created_at: offering.created_at,
            location: offering.location,
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
              created_at: offering.created_at,
              location: offering.location,
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

  // Get category info
  const getCategoryInfo = (categoryKey: string) => {
    const cat = CATEGORIES.find(c => c.value === categoryKey);
    return cat || { icon: '📋', label: categoryKey };
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
              const category = getCategoryInfo(item.category);
              const price = item.type === 'job' ? item.budget : item.price;
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="bg-white rounded-xl p-4 shadow-sm active:shadow-md transition-all cursor-pointer"
                >
                  {/* Type Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.type === 'job'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {item.type === 'job' ? '💼 Job' : '🛠️ Service'}
                    </span>
                    {price && (
                      <span className="text-lg font-bold text-gray-900">
                        €{price}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span>{category.icon} {category.label}</span>
                    </div>
                    {item.creator_name && (
                      <span>by {item.creator_name}</span>
                    )}
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
