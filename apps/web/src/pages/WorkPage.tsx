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
  latitude?: number;
  longitude?: number;
  difficulty?: string;
  creator_rating?: number;
  creator_review_count?: number;
  distance?: number; // Distance in km from API
}

const MAX_CATEGORIES = 5;

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper function to get difficulty color
const getDifficultyColor = (difficulty?: string): string => {
  const diff = difficulty?.toLowerCase();
  if (diff === 'easy') return 'text-green-600';
  if (diff === 'hard') return 'text-red-600';
  return 'text-yellow-600'; // medium or default
};

// Helper function to render star rating
const renderStars = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '⭐'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
};

// Helper function to calculate distance using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Helper function to format distance
const formatDistance = (distance?: number): string => {
  if (distance === undefined || distance === null) return '-- km';
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

const WorkPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [mainTab, setMainTab] = useState<MainTab>('all');
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          console.log('User location obtained:', location);
          setUserLocation(location);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Fetch data based on tab and filters
  const fetchData = async (tab: MainTab, categories: string[]) => {
    setLoading(true);
    try {
      let allItems: WorkItem[] = [];

      // Prepare params with location if available
      const locationParams = userLocation ? {
        latitude: userLocation.lat,
        longitude: userLocation.lon,
        radius: 50
      } : {};

      console.log('Fetching with location params:', locationParams);

      // Fetch jobs if needed
      if (tab === 'all' || tab === 'jobs') {
        if (categories.length === 0) {
          const jobsResponse = await getTasks({ status: 'open', ...locationParams });
          const jobs = jobsResponse.tasks.map((task: any) => {
            // Calculate distance client-side if not provided by API
            let distance = task.distance;
            if (!distance && userLocation && task.latitude && task.longitude) {
              distance = calculateDistance(
                userLocation.lat,
                userLocation.lon,
                task.latitude,
                task.longitude
              );
              console.log(`Calculated distance for task ${task.id}:`, distance);
            }
            
            return {
              id: task.id,
              type: 'job' as const,
              title: task.title,
              description: task.description,
              category: task.category,
              budget: task.budget || task.reward,
              creator_name: task.creator_name,
              created_at: task.created_at,
              location: task.location,
              latitude: task.latitude,
              longitude: task.longitude,
              difficulty: task.difficulty,
              creator_rating: task.creator_rating,
              creator_review_count: task.creator_review_count,
              distance: distance,
            };
          });
          allItems = [...allItems, ...jobs];
        } else {
          // Fetch for each category
          for (const category of categories) {
            const jobsResponse = await getTasks({ status: 'open', category, ...locationParams });
            const jobs = jobsResponse.tasks.map((task: any) => {
              let distance = task.distance;
              if (!distance && userLocation && task.latitude && task.longitude) {
                distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lon,
                  task.latitude,
                  task.longitude
                );
              }
              
              return {
                id: task.id,
                type: 'job' as const,
                title: task.title,
                description: task.description,
                category: task.category,
                budget: task.budget || task.reward,
                creator_name: task.creator_name,
                created_at: task.created_at,
                location: task.location,
                latitude: task.latitude,
                longitude: task.longitude,
                difficulty: task.difficulty,
                creator_rating: task.creator_rating,
                creator_review_count: task.creator_review_count,
                distance: distance,
              };
            });
            allItems = [...allItems, ...jobs];
          }
        }
      }

      // Fetch services if needed
      if (tab === 'all' || tab === 'services') {
        if (categories.length === 0) {
          const servicesResponse = await getOfferings({ status: 'active', ...locationParams });
          const services = servicesResponse.offerings.map((offering: any) => {
            let distance = offering.distance;
            if (!distance && userLocation && offering.latitude && offering.longitude) {
              distance = calculateDistance(
                userLocation.lat,
                userLocation.lon,
                offering.latitude,
                offering.longitude
              );
              console.log(`Calculated distance for offering ${offering.id}:`, distance);
            }
            
            return {
              id: offering.id,
              type: 'service' as const,
              title: offering.title,
              description: offering.description,
              category: offering.category,
              price: offering.price,
              creator_name: offering.creator_name,
              created_at: offering.created_at,
              location: offering.location,
              latitude: offering.latitude,
              longitude: offering.longitude,
              difficulty: offering.difficulty,
              creator_rating: offering.creator_rating,
              creator_review_count: offering.creator_review_count,
              distance: distance,
            };
          });
          allItems = [...allItems, ...services];
        } else {
          // Fetch for each category
          for (const category of categories) {
            const servicesResponse = await getOfferings({ status: 'active', category, ...locationParams });
            const services = servicesResponse.offerings.map((offering: any) => {
              let distance = offering.distance;
              if (!distance && userLocation && offering.latitude && offering.longitude) {
                distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lon,
                  offering.latitude,
                  offering.longitude
                );
              }
              
              return {
                id: offering.id,
                type: 'service' as const,
                title: offering.title,
                description: offering.description,
                category: offering.category,
                price: offering.price,
                creator_name: offering.creator_name,
                created_at: offering.created_at,
                location: offering.location,
                latitude: offering.latitude,
                longitude: offering.longitude,
                difficulty: offering.difficulty,
                creator_rating: offering.creator_rating,
                creator_review_count: offering.creator_review_count,
                distance: distance,
              };
            });
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

      console.log('Final items with distances:', uniqueItems.map(i => ({ id: i.id, distance: i.distance })));
      setItems(uniqueItems);
    } catch (error) {
      console.error('Failed to fetch work items:', error);
    }
    setLoading(false);
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchData(mainTab, selectedCategories);
  }, [mainTab, selectedCategories, userLocation]);

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
          <div className="flex gap-2 flex-1">
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
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full relative flex-shrink-0 ml-2"
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
          <div className="space-y-2">
            {items.map((item) => {
              const category = getCategoryInfo(item.category);
              const price = item.type === 'job' ? item.budget : item.price;
              const timeAgo = item.created_at ? formatTimeAgo(item.created_at) : '';
              const isUrgent = (item as any).is_urgent;
              const hasReviews = item.creator_review_count && item.creator_review_count > 0;
              const difficultyColor = getDifficultyColor(item.difficulty);
              const distance = formatDistance(item.distance);

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`bg-white rounded-xl p-3 shadow-sm border border-gray-100 active:shadow-md active:scale-[0.98] transition-all cursor-pointer ${
                    item.type === 'job' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-amber-500'
                  }`}
                >
                  {/* LINE 1: Category | Urgent | Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-xs font-semibold text-gray-700">{category.label}</span>
                    </div>
                    {isUrgent && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                        🔥 Urgent
                      </span>
                    )}
                    {price && (
                      <span className={`text-lg font-bold ${
                        item.type === 'job' ? 'text-blue-600' : 'text-amber-600'
                      }`}>
                        €{price}
                      </span>
                    )}
                  </div>

                  {/* LINE 2: Title (bold) */}
                  <h3 className="text-sm font-bold text-gray-900 truncate mb-3">
                    {item.title}
                  </h3>

                  {/* LINES 3 & 4: BIG AVATAR + User Info */}
                  <div className="flex gap-2.5 mb-3">
                    {/* BIG AVATAR spanning both lines - now with self-start to prevent stretching */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0 self-start">
                      {(item.creator_name || 'A').charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Right side: Name + Reviews/City stacked - now with better spacing */}
                    <div className="flex flex-col justify-center gap-1 flex-1 min-w-0">
                      {/* Line 3: Name */}
                      <span className="text-xs font-semibold text-gray-800 truncate">
                        {item.creator_name || 'Anonymous'}
                      </span>
                      
                      {/* Line 4: Reviews + City */}
                      <div className="flex items-center gap-1.5 text-xs">
                        {hasReviews ? (
                          <>
                            <span className="text-yellow-500 leading-none">{renderStars(item.creator_rating || 0)}</span>
                            <span className="text-gray-400">({item.creator_review_count})</span>
                          </>
                        ) : (
                          <span className="text-gray-400">New user</span>
                        )}
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500 truncate">
                          📍 {item.location?.split(',')[0] || 'Location'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* LINE 5: Description */}
                  {item.description && (
                    <p className="text-xs text-gray-500 truncate mb-3">
                      {item.description}
                    </p>
                  )}

                  {/* LINE 6: Distance (left) | Difficulty (center) | Time (right) */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">📏 {distance}</span>
                    <span className={`font-semibold ${difficultyColor}`}>
                      ⚡ {item.difficulty || 'Medium'}
                    </span>
                    <span className="text-gray-400">{timeAgo}</span>
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