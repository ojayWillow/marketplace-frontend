import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { useNavigate, Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { getTasks, Task as APITask } from '../api/tasks';
import { getOfferings, Offering } from '../api/offerings';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { useMatchingStore } from '../stores/matchingStore';
import { getCategoryIcon, getCategoryLabel, CATEGORY_OPTIONS } from '../constants/categories';

// Fix Leaflet default icon issue with Vite
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Extend API Task with UI-specific properties
interface Task extends APITask {
  icon?: string;
  // Added for map offset handling
  displayLatitude?: number;
  displayLongitude?: number;
}

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Format distance for display
const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  } else if (km < 10) {
    return `${km.toFixed(1)}km`;
  } else {
    return `${Math.round(km)}km`;
  }
};

// Format time ago - compact
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

// Function to add offset to overlapping markers
const addMarkerOffsets = (tasks: Task[]): Task[] => {
  const coordMap = new Map<string, Task[]>();
  
  // Group tasks by their coordinates (rounded to 4 decimal places for grouping nearby points)
  tasks.forEach(task => {
    const key = `${task.latitude.toFixed(4)},${task.longitude.toFixed(4)}`;
    if (!coordMap.has(key)) {
      coordMap.set(key, []);
    }
    coordMap.get(key)!.push(task);
  });
  
  // Apply offsets to overlapping markers
  const result: Task[] = [];
  coordMap.forEach((groupedTasks, key) => {
    if (groupedTasks.length === 1) {
      // Single task at this location, no offset needed
      result.push({
        ...groupedTasks[0],
        displayLatitude: groupedTasks[0].latitude,
        displayLongitude: groupedTasks[0].longitude
      });
    } else {
      // Multiple tasks at same location - spread them in a circle
      const offsetDistance = 0.0008; // Approximately 80-90 meters
      const angleStep = (2 * Math.PI) / groupedTasks.length;
      
      groupedTasks.forEach((task, index) => {
        const angle = angleStep * index;
        const latOffset = offsetDistance * Math.cos(angle);
        const lonOffset = offsetDistance * Math.sin(angle);
        
        result.push({
          ...task,
          displayLatitude: task.latitude + latOffset,
          displayLongitude: task.longitude + lonOffset
        });
      });
    }
  });
  
  return result;
};

const LocationPicker = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapRecenter = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
};

// Helper function to render star rating
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <span className="text-yellow-500">
      {'★'.repeat(fullStars)}
      {hasHalfStar && '½'}
      {'☆'.repeat(emptyStars)}
    </span>
  );
};

// =====================================================
// CUSTOM MARKER ICON FACTORIES
// =====================================================

// User Location Icon - Red pin marker (distinct from money markers)
const createUserLocationIcon = () => divIcon({
  className: 'user-location-icon',
  html: `
    <div class="user-location-pin">
      <div class="user-location-inner"></div>
    </div>
  `,
  iconSize: [30, 36],
  iconAnchor: [15, 36],
});

// Job Icon Factory - 💰 sized by budget
// Budget thresholds: ≤25 (small), ≤50 (medium), ≤100 (large), >100 (XL + glow)
const getJobIconForBudget = (budget: number = 0) => {
  let size = 28;
  let fontSize = 14;
  let extraClass = '';

  if (budget <= 25) {
    size = 28;
    fontSize = 14;
  } else if (budget <= 50) {
    size = 34;
    fontSize = 17;
  } else if (budget <= 100) {
    size = 42;
    fontSize = 21;
  } else {
    // €100+ = XL with glow animation
    size = 50;
    fontSize = 25;
    extraClass = ' job-icon--xl';
  }

  return divIcon({
    className: `job-money-icon${extraClass}`,
    html: `
      <div class="job-money-pin" style="width:${size}px;height:${size}px;">
        <span class="job-money-emoji" style="font-size:${fontSize}px;">💰</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Offering Icon - Orange/Amber (only shown when premium/boosted - for now hidden from map)
const createOfferingIcon = () => divIcon({
  className: 'custom-offering-icon',
  html: '<div class="offering-pin"><span style="font-size:12px;">👋</span></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// =====================================================
// CLEAN MAP POPUP - Blue theme for jobs
// =====================================================
const JobMapPopup = ({ task, userLocation }: { task: Task; userLocation: { lat: number; lng: number } }) => {
  const navigate = useNavigate();
  const toast = useToastStore();
  const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
  const budget = task.budget || task.reward || 0;
  const categoryIcon = getCategoryIcon(task.category);
  const categoryLabel = getCategoryLabel(task.category);
  
  // Truncate location
  const shortLocation = task.location?.split(',').slice(0, 2).join(', ') || 'Nearby';
  
  // Simulated applicants count
  const applicantsCount = task.applications_count || 0;
  
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success('Saved!');
  };
  
  return (
    <div className="job-popup" style={{ width: '240px' }}>
      {/* Top row: Category bubble (blue) + Distance */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          <span>{categoryIcon}</span>
          <span>{categoryLabel}</span>
        </span>
        <span className="text-xs text-gray-500">📍 {formatDistance(distance)}</span>
      </div>
      
      {/* Price - prominent (green for money) */}
      <div className="text-center mb-2">
        <span className="text-2xl font-bold text-green-600">€{budget}</span>
      </div>
      
      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-sm leading-tight text-center mb-3 line-clamp-2">
        {task.title}
      </h3>
      
      {/* Labeled Info Grid */}
      <div className="grid grid-cols-3 gap-1 mb-3 py-2 bg-gray-50 rounded-lg text-center">
        <div>
          <div className="text-[10px] text-gray-400 uppercase">Distance</div>
          <div className="text-xs font-semibold text-gray-700">{formatDistance(distance)}</div>
        </div>
        <div className="border-x border-gray-200">
          <div className="text-[10px] text-gray-400 uppercase">Posted</div>
          <div className="text-xs font-semibold text-gray-700">{task.created_at ? formatTimeAgo(task.created_at) : 'New'}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 uppercase">Applicants</div>
          <div className="text-xs font-semibold text-gray-700">{applicantsCount}</div>
        </div>
      </div>
      
      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        <span>📍</span>
        <span className="truncate">{shortLocation}</span>
      </div>
      
      {/* Posted by */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
        <span>👤</span>
        <span>{task.creator_name || 'Anonymous'}</span>
      </div>
      
      {/* Dual CTAs - Blue for jobs */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/tasks/${task.id}`);
          }}
          className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-all"
        >
          View & Apply →
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-2 rounded-lg text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
          title="Save for later"
        >
          🔖
        </button>
      </div>
    </div>
  );
};

// Compact Offering Popup - Orange theme
const OfferingMapPopup = ({ offering, userLocation }: { offering: Offering; userLocation: { lat: number; lng: number } }) => {
  const navigate = useNavigate();
  const distance = calculateDistance(userLocation.lat, userLocation.lng, offering.latitude, offering.longitude);
  const categoryIcon = getCategoryIcon(offering.category);
  const categoryLabel = getCategoryLabel(offering.category);
  
  return (
    <div className="offering-popup" style={{ width: '220px' }}>
      {/* Top row: Category bubble (orange) + Distance */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          <span>{categoryIcon}</span>
          <span>{categoryLabel}</span>
        </span>
        <span className="text-xs text-gray-500">📍 {formatDistance(distance)}</span>
      </div>
      
      {/* Provider info + Price */}
      <div className="flex items-center gap-2 mb-3">
        {offering.creator_avatar ? (
          <img src={offering.creator_avatar} alt={offering.creator_name} className="w-10 h-10 rounded-full object-cover border border-amber-200" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold">
            {offering.creator_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">{offering.creator_name}</div>
          {offering.creator_rating !== undefined && offering.creator_rating > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <StarRating rating={offering.creator_rating} />
            </div>
          )}
        </div>
        <div className="text-lg font-bold text-green-600">
          €{offering.price || 0}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-xs mb-3 line-clamp-2">{offering.title}</h3>
      
      {/* Action Button - Orange */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate(`/offerings/${offering.id}`);
        }}
        className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-all"
      >
        View Profile →
      </button>
    </div>
  );
};

// Memoized Map Markers Component - updates without re-creating the map
const MapMarkers = ({ 
  tasks, 
  offerings, 
  userLocation, 
  locationName,
  manualLocationSet,
  onLocationSelect,
  showOfferingsOnMap
}: {
  tasks: Task[];
  offerings: Offering[];
  userLocation: { lat: number; lng: number };
  locationName: string;
  manualLocationSet: boolean;
  onLocationSelect: (lat: number, lng: number) => void;
  showOfferingsOnMap: boolean;
}) => {
  // Memoize the user location icon
  const userLocationIcon = useMemo(() => createUserLocationIcon(), []);
  const offeringIcon = useMemo(() => createOfferingIcon(), []);

  // Apply offsets to tasks with overlapping coordinates
  const tasksWithOffsets = useMemo(() => addMarkerOffsets(tasks), [tasks]);

  return (
    <>
      <MapRecenter lat={userLocation.lat} lng={userLocation.lng} />
      <LocationPicker onLocationSelect={onLocationSelect} />
      
      {/* User Location Marker - Red pin */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
        <Popup>
          <div className="p-1 text-center" style={{ width: '100px' }}>
            <p className="font-medium text-gray-900 text-sm">📍 You</p>
          </div>
        </Popup>
      </Marker>
      
      {/* Job/Task markers - 💰 Money bags sized by budget */}
      {tasksWithOffsets.map((task) => {
        const budget = task.budget || task.reward || 0;
        const jobIcon = getJobIconForBudget(budget);
        // Use display coordinates (with offset if overlapping) or fall back to original
        const displayLat = task.displayLatitude || task.latitude;
        const displayLng = task.displayLongitude || task.longitude;
        
        return (
          <Marker 
            key={`task-${task.id}`} 
            position={[displayLat, displayLng]}
            icon={jobIcon}
          >
            <Popup>
              <JobMapPopup task={task} userLocation={userLocation} />
            </Popup>
          </Marker>
        );
      })}
      
      {/* Offering markers - Only shown if showOfferingsOnMap is true (future premium feature) */}
      {showOfferingsOnMap && offerings.map((offering) => (
        <Marker 
          key={`offering-${offering.id}`} 
          position={[offering.latitude, offering.longitude]} 
          icon={offeringIcon}
        >
          <Popup>
            <OfferingMapPopup offering={offering} userLocation={userLocation} />
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const Tasks = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const toast = useToastStore();
  const { loadMyOfferings, isJobMatchingMyOfferings, myOfferingCategories } = useMatchingStore();
  
  // Three main tabs: jobs, offerings, all
  const [activeTab, setActiveTab] = useState<'jobs' | 'offerings' | 'all'>('all');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [initialLoading, setInitialLoading] = useState(true); // Only for first load
  const [refreshing, setRefreshing] = useState(false); // For filter changes (doesn't hide content)
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: 56.9496, lng: 24.1052 }); // Default: Riga
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [manualLocationSet, setManualLocationSet] = useState(false);
  const [addressSearch, setAddressSearch] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [locationName, setLocationName] = useState('Riga, Latvia');
  const [searchRadius, setSearchRadius] = useState(25);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // For now, offerings are NOT shown on map (future premium feature)
  const showOfferingsOnMap = false;
  
  const hasFetchedRef = useRef(false);
  const hasEverLoadedRef = useRef(false); // Track if we've ever loaded data
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load user's offerings for matching (when logged in)
  useEffect(() => {
    if (isAuthenticated) {
      loadMyOfferings();
    }
  }, [isAuthenticated, loadMyOfferings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Skip location detection function
  const skipLocationDetection = () => {
    setLocationLoading(false);
    setLocationGranted(true);
    setLocationName('Riga, Latvia');
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }
  };

  useEffect(() => {
    const savedRadius = localStorage.getItem('taskSearchRadius');
    if (savedRadius) {
      setSearchRadius(parseInt(savedRadius, 10));
    }

    // Set a timeout to auto-skip after 5 seconds
    locationTimeoutRef.current = setTimeout(() => {
      if (locationLoading) {
        skipLocationDetection();
      }
    }, 5000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationGranted(true);
          setLocationLoading(false);
          setLocationName('Your location');
          if (locationTimeoutRef.current) {
            clearTimeout(locationTimeoutRef.current);
          }
        },
        (error) => {
          console.log('Geolocation error:', error);
          setLocationGranted(true);
          setLocationLoading(false);
          setLocationName('Riga, Latvia');
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      setLocationGranted(true);
      setLocationLoading(false);
    }

    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, []);

  const handleLocationSelect = (lat: number, lng: number, name?: string) => {
    setUserLocation({ lat, lng });
    setManualLocationSet(true);
    setLocationName(name || 'Selected location');
    hasFetchedRef.current = false;
    fetchData(true);
    setShowLocationModal(false);
  };

  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    localStorage.setItem('taskSearchRadius', newRadius.toString());
    hasFetchedRef.current = false;
    fetchData(true);
  };

  const searchAddressSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=lv&limit=8&addressdetails=1`,
        { headers: { 'Accept-Language': 'lv,en' } }
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.error('Error searching address:', err);
      setSuggestions([]);
    } finally {
      setSearchingAddress(false);
    }
  };

  const handleAddressInputChange = (value: string) => {
    setAddressSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchAddressSuggestions(value), 300);
  };

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const name = suggestion.display_name.split(',').slice(0, 3).join(', ');
    handleLocationSelect(lat, lng, name);
    setAddressSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const resetToAutoLocation = () => {
    setManualLocationSet(false);
    setLocationName('Your location');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        hasFetchedRef.current = false;
        fetchData(true);
      });
    }
  };

  const fetchData = async (forceRefresh = false) => {
    if (hasFetchedRef.current && !forceRefresh) return;
    
    // Only show full-page loading on first ever load
    // After that, show small refreshing indicator
    if (!hasEverLoadedRef.current) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    
    try {
      // Fetch available tasks (jobs)
      const tasksResponse = await getTasks({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radius: searchRadius,
        status: 'open',
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });
      
      const tasksWithIcons = tasksResponse.tasks.map(task => ({
        ...task,
        icon: getCategoryIcon(task.category)
      }));
      
      setTasks(tasksWithIcons);
      
      // Fetch offerings
      try {
        const offeringsResponse = await getOfferings({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: searchRadius,
          status: 'active',
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        });
        setOfferings(offeringsResponse.offerings || []);
      } catch (err) {
        console.log('Offerings API not available yet');
        setOfferings([]);
      }
      
      hasFetchedRef.current = true;
      hasEverLoadedRef.current = true; // Mark that we've loaded at least once
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    }
    
    setInitialLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (locationGranted) fetchData();
  }, [locationGranted]);

  useEffect(() => {
    if (locationGranted && hasEverLoadedRef.current) {
      hasFetchedRef.current = false;
      fetchData(true);
    }
  }, [selectedCategory]);

  const filterTasks = (taskList: Task[]) => {
    return taskList.filter(task => {
      const matchesSearch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  };

  const filterOfferings = (offeringList: Offering[]) => {
    return offeringList.filter(offering => {
      const matchesSearch = searchQuery === '' || 
        offering.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offering.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offering.experience && offering.experience.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesSearch;
    });
  };

  // Improved loading state with skip option - Blue theme
  if (locationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">📍</div>
          </div>
          <div className="text-xl font-bold text-gray-900 mb-2">Finding your location...</div>
          <div className="text-gray-600 mb-4">This helps show nearby jobs and services</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <button 
            onClick={skipLocationDetection}
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Skip → Use Riga as default
          </button>
        </div>
      </div>
    );
  }

  // Only show full-page loading on very first load - Blue theme
  if (initialLoading && !hasEverLoadedRef.current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <div className="text-xl font-bold text-gray-900 mb-2">💰 Finding opportunities...</div>
          <div className="text-gray-600">Searching within {searchRadius}km of {locationName}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-5xl mb-4">⚠️</div>
          <div className="text-2xl font-bold text-red-600 mb-2">Oops!</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button onClick={() => { hasFetchedRef.current = false; fetchData(true); }} className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredTasks = filterTasks(tasks);
  const filteredOfferings = filterOfferings(offerings);
  
  // Count matching jobs for the badge
  const matchingJobsCount = isAuthenticated 
    ? filteredTasks.filter(t => isJobMatchingMyOfferings(t.category)).length 
    : 0;

  // Get map markers based on active tab
  // Note: Offerings are NOT shown on map for now (kept in list only)
  const getMapMarkers = () => {
    if (activeTab === 'jobs') return { tasks: filteredTasks, offerings: [] };
    if (activeTab === 'offerings') return { tasks: [], offerings: showOfferingsOnMap ? filteredOfferings : [] };
    return { tasks: filteredTasks, offerings: showOfferingsOnMap ? filteredOfferings : [] };
  };

  const { tasks: mapTasks, offerings: mapOfferings } = getMapMarkers();
  
  // Calculate budget stats for legend
  const maxBudget = Math.max(...filteredTasks.map(t => t.budget || t.reward || 0), 0);
  const hasHighValueJobs = filteredTasks.some(t => (t.budget || t.reward || 0) > 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Help</h1>
            <p className="text-gray-600">Find jobs nearby and earn money 💰</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {isAuthenticated ? (
              <>
                {/* Post a Job - BLUE */}
                <button onClick={() => navigate('/tasks/create')} className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 font-medium transition-colors flex items-center gap-2">
                  <span>💰</span> Post a Job
                </button>
                {/* Offer Service - ORANGE */}
                <button onClick={() => navigate('/offerings/create')} className="bg-amber-500 text-white px-5 py-2.5 rounded-lg hover:bg-amber-600 font-medium transition-colors flex items-center gap-2">
                  <span>👋</span> Offer Service
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium transition-colors">
                Login to Post Jobs or Offer Services
              </button>
            )}
          </div>
        </div>

        {/* Matching notification banner - Blue theme */}
        {isAuthenticated && matchingJobsCount > 0 && myOfferingCategories.length > 0 && (
          <div className="mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-semibold">{matchingJobsCount} job{matchingJobsCount !== 1 ? 's' : ''} match your offerings!</p>
                  <p className="text-blue-100 text-sm">Based on your services: {myOfferingCategories.map(c => getCategoryLabel(c)).join(', ')}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('jobs')}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                View Matching Jobs →
              </button>
            </div>
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="mb-4 bg-white rounded-lg shadow-md p-4" style={{ zIndex: 1000 }}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search jobs or offerings..." className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <button onClick={() => setShowLocationModal(!showLocationModal)} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex-1 sm:flex-initial justify-center">
                <span>📍</span>
                <span className="text-sm text-gray-700 truncate max-w-[120px]">{manualLocationSet && locationName ? locationName.split(',')[0] : locationName}</span>
              </button>
              <select value={searchRadius} onChange={(e) => handleRadiusChange(parseInt(e.target.value, 10))} className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
              <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 rounded-lg border transition-colors ${showFilters ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                ⚙️ Filters
              </button>
            </div>
          </div>
          
          {showLocationModal && (
            <div className="mt-3 p-3 bg-red-50 border-t border-red-200 rounded-lg" ref={suggestionsRef}>
              <div className="mb-2">
                <input type="text" value={addressSearch} onChange={(e) => handleAddressInputChange(e.target.value)} placeholder="Search address or city..." className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                {searchingAddress && <span className="text-sm text-red-600">Searching...</span>}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-lg">
                  {suggestions.map((suggestion, index) => (
                    <button key={index} onClick={() => selectSuggestion(suggestion)} className="w-full px-3 py-2 text-left hover:bg-red-50 border-b last:border-b-0">
                      <span className="text-sm">{suggestion.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
              {manualLocationSet && (
                <button onClick={resetToAutoLocation} className="mt-2 text-sm text-red-600 hover:underline">Reset to auto-detect</button>
              )}
            </div>
          )}
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {CATEGORY_OPTIONS.map(cat => <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* THREE TABS: All, Jobs, Offerings - Blue + Orange */}
        <div className="mb-4 flex gap-2 flex-wrap relative" style={{ zIndex: 1 }}>
          <button onClick={() => setActiveTab('all')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            🌐 All ({filteredTasks.length + filteredOfferings.length})
          </button>
          <button onClick={() => setActiveTab('jobs')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors relative ${activeTab === 'jobs' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            💰 Jobs ({filteredTasks.length})
            {isAuthenticated && matchingJobsCount > 0 && activeTab !== 'jobs' && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {matchingJobsCount} match
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('offerings')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'offerings' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            👋 Offerings ({filteredOfferings.length})
          </button>
          
          {/* Refreshing indicator */}
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-500 ml-auto">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Updating...</span>
            </div>
          )}
        </div>

        {/* MAP with integrated legend - Blue theme */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Map Legend - Shows marker meanings */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b flex flex-wrap items-center gap-4 text-sm">
            <span className="font-semibold text-gray-700">Map Legend:</span>
            
            {/* User location */}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow" style={{ transform: 'rotate(-45deg)', borderRadius: '50% 50% 50% 0' }}></div>
              <span className="text-gray-600">📍 You</span>
            </div>
            
            {/* Job markers by size */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm">💰</span>
              <span className="text-gray-600">Jobs (size = budget)</span>
            </div>
            
            {/* Size examples - Blue theme */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <span className="px-1.5 py-0.5 bg-blue-100 rounded">≤25€ small</span>
              <span className="px-1.5 py-0.5 bg-blue-200 rounded">≤50€ med</span>
              <span className="px-1.5 py-0.5 bg-blue-300 rounded">≤100€ large</span>
              <span className="px-1.5 py-0.5 bg-blue-400 text-white rounded animate-pulse">&gt;100€ ✨</span>
            </div>
            
            {/* Matching indicator */}
            {isAuthenticated && myOfferingCategories.length > 0 && (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">✨ Your matches</span>
              </div>
            )}
          </div>
          <div style={{ height: '350px' }}>
            <MapContainer 
              center={[userLocation.lat, userLocation.lng]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              />
              <MapMarkers
                tasks={mapTasks}
                offerings={mapOfferings}
                userLocation={userLocation}
                locationName={locationName}
                manualLocationSet={manualLocationSet}
                onLocationSelect={(lat, lng) => handleLocationSelect(lat, lng)}
                showOfferingsOnMap={showOfferingsOnMap}
              />
            </MapContainer>
          </div>
          
          {/* Quick stats below map - Blue theme */}
          {filteredTasks.length > 0 && (
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium text-blue-700">
                💰 {mapTasks.length} job{mapTasks.length !== 1 ? 's' : ''} on map
              </span>
              {maxBudget > 0 && (
                <span className="text-green-600">Top payout: €{maxBudget}</span>
              )}
              {hasHighValueJobs && (
                <span className="text-blue-600 font-medium animate-pulse">✨ High-value jobs available!</span>
              )}
            </div>
          )}
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            {activeTab === 'all' && 'Jobs & Offerings'}
            {activeTab === 'jobs' && '💰 Available Jobs'}
            {activeTab === 'offerings' && '👋 Service Offerings'}
            {searchQuery && <span className="text-sm font-normal text-gray-500 ml-2">• Searching: "{searchQuery}"</span>}
          </h2>
          
          {/* Jobs Section (shown in 'all' and 'jobs' tabs) */}
          {(activeTab === 'all' || activeTab === 'jobs') && (
            <div className="mb-8">
              {activeTab === 'all' && <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">💰 Jobs <span className="text-sm font-normal text-gray-500">({filteredTasks.length})</span></h3>}
              
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-dashed border-blue-200">
                  <div className="text-5xl mb-4">💰</div>
                  <p className="text-gray-900 font-semibold text-lg mb-2">No jobs posted nearby yet</p>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Be the first to post a job in your area! Need help with moving, cleaning, or any task? Post it here.
                  </p>
                  {isAuthenticated ? (
                    <button onClick={() => navigate('/tasks/create')} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium transition-colors">
                      💰 Post Your First Job
                    </button>
                  ) : (
                    <button onClick={() => navigate('/login')} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium transition-colors">
                      Login to Post a Job
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredTasks.map((task) => (
                    <JobCard 
                      key={task.id} 
                      task={task} 
                      userLocation={userLocation} 
                      isMatching={isAuthenticated && isJobMatchingMyOfferings(task.category)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Offerings Section (shown in 'all' and 'offerings' tabs) */}
          {(activeTab === 'all' || activeTab === 'offerings') && (
            <div>
              {activeTab === 'all' && <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">👋 Offerings <span className="text-sm font-normal text-gray-500">({filteredOfferings.length})</span></h3>}
              
              {/* Info banner about offerings not on map */}
              {activeTab === 'offerings' && filteredOfferings.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  <span className="font-medium">💡 Tip:</span> Offerings are shown in the list below. Want your offering to appear on the map? Premium features coming soon!
                </div>
              )}
              
              {filteredOfferings.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-amber-50 to-white rounded-xl border-2 border-dashed border-amber-200">
                  <div className="text-5xl mb-4">👋</div>
                  <p className="text-gray-900 font-semibold text-lg mb-2">No service providers in your area yet</p>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Are you skilled at something? Advertise your services here and get hired by people nearby!
                  </p>
                  {isAuthenticated ? (
                    <button onClick={() => navigate('/offerings/create')} className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 font-medium transition-colors">
                      👋 Offer Your Services
                    </button>
                  ) : (
                    <button onClick={() => navigate('/login')} className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 font-medium transition-colors">
                      Login to Offer Services
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredOfferings.map((offering) => (
                    <OfferingCard key={offering.id} offering={offering} userLocation={userLocation} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* CTA for logged-in users - Blue theme */}
        {isAuthenticated && (
          <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Manage Your Activity</h3>
                <p className="text-blue-100">View your posted jobs, offerings, and applications in your profile page.</p>
              </div>
              <Link to="/profile?tab=tasks" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors whitespace-nowrap">
                Go to My Tasks →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Job Card Component with matching indicator and budget display - Blue theme
const JobCard = ({ task, userLocation, isMatching }: { task: Task; userLocation: { lat: number; lng: number }; isMatching?: boolean }) => {
  const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
  const budget = task.budget || task.reward || 0;
  const isHighValue = budget > 100;
  
  return (
    <Link 
      to={`/tasks/${task.id}`} 
      className={`block border rounded-lg p-4 hover:shadow-md transition-all ${
        isHighValue 
          ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-500 ring-1 ring-blue-200'
          : isMatching 
            ? 'border-blue-300 bg-blue-50 hover:border-blue-400' 
            : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      {/* High value badge */}
      {isHighValue && (
        <div className="flex items-center gap-2 mb-2 text-blue-700">
          <span className="px-2 py-0.5 bg-blue-200 rounded text-xs font-semibold animate-pulse">✨ High-value opportunity!</span>
        </div>
      )}
      
      {/* Matching badge */}
      {isMatching && !isHighValue && (
        <div className="flex items-center gap-2 mb-2 text-blue-700">
          <span className="px-2 py-0.5 bg-blue-200 rounded text-xs font-semibold">✨ Matches your offering</span>
        </div>
      )}
      
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl sm:text-2xl flex-shrink-0">{task.icon}</span>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{task.title}</h4>
          </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-500">📍 {distance.toFixed(1)}km</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{getCategoryLabel(task.category)}</span>
          </div>
          {task.creator_name && (
            <p className="text-xs text-gray-500 mt-2">Posted by {task.creator_name}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          {/* Price stays GREEN (money color) */}
          <div className={`text-xl sm:text-2xl font-bold text-green-600`}>
            €{budget}
          </div>
          {isHighValue && <div className="text-xs text-green-500 mt-1">💰💰💰</div>}
        </div>
      </div>
    </Link>
  );
};

// Offering Card Component - Orange theme
const OfferingCard = ({ offering, userLocation }: { offering: Offering; userLocation: { lat: number; lng: number } }) => {
  const distance = calculateDistance(userLocation.lat, userLocation.lng, offering.latitude, offering.longitude);
  
  return (
    <Link to={`/offerings/${offering.id}`} className="block border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-amber-300 transition-all">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {offering.creator_avatar ? (
            <img src={offering.creator_avatar} alt={offering.creator_name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-amber-200" />
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold">
              {offering.creator_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{offering.title}</h4>
          <p className="text-xs text-gray-500 mb-1">by {offering.creator_name}</p>
          
          {/* Rating */}
          {offering.creator_rating !== undefined && offering.creator_rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <StarRating rating={offering.creator_rating} />
              <span className="text-xs sm:text-sm text-gray-500">({offering.creator_review_count || 0})</span>
            </div>
          )}
          
          {/* Price - GREEN (money color) */}
          <div className="text-base sm:text-lg font-bold text-green-600 mb-2">
            €{offering.price || 0}
            {offering.price_type === 'hourly' && '/hr'}
            {offering.price_type === 'fixed' && ' fixed'}
            {offering.price_type === 'negotiable' && ' (neg)'}
          </div>
          
          {/* Category & Distance - Orange badge */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded">{getCategoryLabel(offering.category)}</span>
            <span className="text-gray-500">📍 {distance.toFixed(1)}km</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Tasks;
