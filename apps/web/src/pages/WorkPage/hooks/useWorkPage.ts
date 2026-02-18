import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, getOfferings } from '@marketplace/shared';
import { CATEGORIES } from '../../../constants/categories';
import { calculateDistance } from '../../../components/MobileTasksView/utils/distance';
import { MainTab, WorkItem, WorkItemWithDistance, MAX_CATEGORIES, LOCATION_TIMEOUT_MS } from '../types';
import { mapTask, mapOffering, getErrorMessage } from '../utils';
import { useMyWork } from '../../../hooks/useMyWork';

const DEFAULT_MIN_RESULTS = 5;

export const useWorkPage = () => {
  const navigate = useNavigate();

  const [mainTab, setMainTab] = useState<MainTab>('all');
  const [items, setItems] = useState<WorkItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(() => {
    const saved = localStorage.getItem('workSearchRadius');
    return saved ? parseInt(saved, 10) : 25;
  });

  const fetchVersionRef = useRef(0);
  const hasLoadedOnce = useRef(false);
  const userChangedRadius = useRef(false);

  // My Work data (only fetched when needed)
  const myWork = useMyWork();
  const myWorkLoadedRef = useRef(false);

  // Load my-work data when user switches to mine tab
  useEffect(() => {
    if (mainTab === 'mine' && !myWorkLoadedRef.current) {
      myWork.fetchAll();
      myWorkLoadedRef.current = true;
    }
  }, [mainTab]);

  // Geolocation: resolve in background
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {},
      { timeout: LOCATION_TIMEOUT_MS, enableHighAccuracy: false }
    );
  }, []);

  // Fetch logic — skip when in mine tab
  const fetchItems = useCallback(async (tab: MainTab, categories: string[], loc: { lat: number; lng: number } | null, radius: number, isUserRadiusChange: boolean) => {
    if (tab === 'mine') return; // Mine tab uses its own data source

    const version = ++fetchVersionRef.current;
    const isFirstLoad = !hasLoadedOnce.current;

    if (isFirstLoad) setInitialLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const effectiveRadius = radius === 0 ? 500 : radius;

      const fetchJobs = async (): Promise<WorkItem[]> => {
        if (tab === 'services') return [];
        const baseParams: Record<string, unknown> = { status: 'open' as const };

        // Add location + radius if we have user's location
        if (loc) {
          baseParams.latitude = loc.lat;
          baseParams.longitude = loc.lng;
          baseParams.radius = effectiveRadius;
          // Only use min_results on initial load
          if (!isUserRadiusChange) {
            baseParams.min_results = DEFAULT_MIN_RESULTS;
          }
        }

        const response = categories.length === 0
          ? await getTasks(baseParams as Parameters<typeof getTasks>[0])
          : await Promise.all(categories.map((cat) => getTasks({ ...baseParams, category: cat } as Parameters<typeof getTasks>[0])))
              .then((res) => ({ tasks: res.flatMap((r) => r.tasks) }));
        return response.tasks.map(mapTask);
      };

      const fetchServices = async (): Promise<WorkItem[]> => {
        if (tab === 'jobs') return [];
        const baseParams: Record<string, unknown> = { status: 'active' as const };

        if (loc) {
          baseParams.latitude = loc.lat;
          baseParams.longitude = loc.lng;
          baseParams.radius = effectiveRadius;
          if (!isUserRadiusChange) {
            baseParams.min_results = DEFAULT_MIN_RESULTS;
          }
        }

        const response = categories.length === 0
          ? await getOfferings(baseParams as Parameters<typeof getOfferings>[0])
          : await Promise.all(categories.map((cat) => getOfferings({ ...baseParams, category: cat } as Parameters<typeof getOfferings>[0])))
              .then((res) => ({ offerings: res.flatMap((r) => r.offerings) }));
        return response.offerings.map(mapOffering);
      };

      const [jobs, services] = await Promise.all([fetchJobs(), fetchServices()]);
      const allItems = [...jobs, ...services];

      if (version !== fetchVersionRef.current) return;

      const uniqueItems = Array.from(
        new Map(allItems.map((item) => [`${item.type}-${item.id}`, item])).values()
      );
      uniqueItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setItems(uniqueItems);
      hasLoadedOnce.current = true;
    } catch (err) {
      if (version !== fetchVersionRef.current) return;
      const message = getErrorMessage(err);
      console.error('Failed to fetch work items:', err);
      setError(message);
      if (!hasLoadedOnce.current) setItems([]);
    }

    if (version === fetchVersionRef.current) {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch on mount and when tab/filters/radius/location change (but not for mine tab)
  useEffect(() => {
    if (mainTab !== 'mine') {
      fetchItems(mainTab, selectedCategories, userLocation, searchRadius, userChangedRadius.current);
    }
  }, [mainTab, selectedCategories, fetchItems, userLocation, searchRadius]);

  // Distance computation + sorting
  const itemsWithDistance: WorkItemWithDistance[] = useMemo(() => {
    const enriched = items.map((item) => {
      if (!userLocation || !item.latitude || !item.longitude) {
        return { ...item, distance: undefined as number | undefined };
      }
      return {
        ...item,
        distance: calculateDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude),
      };
    });

    if (userLocation) {
      enriched.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    return enriched;
  }, [items, userLocation]);

  // Handlers
  const handleCategoryToggle = useCallback((categoryValue: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryValue)) return prev.filter((c) => c !== categoryValue);
      if (prev.length < MAX_CATEGORIES) return [...prev, categoryValue];
      return prev;
    });
  }, []);

  const handleRadiusChange = useCallback((newRadius: number) => {
    userChangedRadius.current = true;
    setSearchRadius(newRadius);
    localStorage.setItem('workSearchRadius', newRadius.toString());
  }, []);

  const handleItemClick = useCallback((item: WorkItem) => {
    navigate(item.type === 'job' ? `/tasks/${item.id}` : `/offerings/${item.id}`);
  }, [navigate]);

  const handleRetry = useCallback(() => {
    fetchItems(mainTab, selectedCategories, userLocation, searchRadius, userChangedRadius.current);
  }, [fetchItems, mainTab, selectedCategories, userLocation, searchRadius]);

  const getCategoryInfo = useCallback((categoryKey: string) => {
    return CATEGORIES.find((c) => c.value === categoryKey) || { icon: '\uD83D\uDCCB', label: categoryKey };
  }, []);

  return {
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
    userChangedRadius: userChangedRadius.current,
    // My Work data
    myWork,
  };
};
