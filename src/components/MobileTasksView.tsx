import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import { getTasks, Task as APITask } from '../api/tasks';
import { useAuthStore } from '../stores/authStore';
import { getCategoryIcon, getCategoryLabel, CATEGORY_OPTIONS } from '../constants/categories';
import FavoriteButton from './ui/FavoriteButton';

// Extend API Task with UI-specific properties
interface Task extends APITask {
  icon?: string;
  displayLatitude?: number;
  displayLongitude?: number;
}

// Haversine formula to calculate distance
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

const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
};

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

// Add offset to overlapping markers
const addMarkerOffsets = (tasks: Task[]): Task[] => {
  const coordMap = new Map<string, Task[]>();
  
  tasks.forEach(task => {
    const key = `${task.latitude.toFixed(4)},${task.longitude.toFixed(4)}`;
    if (!coordMap.has(key)) coordMap.set(key, []);
    coordMap.get(key)!.push(task);
  });
  
  const result: Task[] = [];
  coordMap.forEach((groupedTasks) => {
    if (groupedTasks.length === 1) {
      result.push({ ...groupedTasks[0], displayLatitude: groupedTasks[0].latitude, displayLongitude: groupedTasks[0].longitude });
    } else {
      const offsetDistance = 0.0008;
      const angleStep = (2 * Math.PI) / groupedTasks.length;
      groupedTasks.forEach((task, index) => {
        const angle = angleStep * index;
        result.push({
          ...task,
          displayLatitude: task.latitude + offsetDistance * Math.cos(angle),
          displayLongitude: task.longitude + offsetDistance * Math.sin(angle)
        });
      });
    }
  });
  
  return result;
};

// Map controller for zoom/center
const MapController = ({ 
  lat, 
  lng, 
  radius, 
  recenterTrigger,
  selectedTask,
  previewCardHeight
}: { 
  lat: number; 
  lng: number; 
  radius: number; 
  recenterTrigger: number;
  selectedTask: Task | null;
  previewCardHeight: number;
}) => {
  const map = useMap();
  
  // Handle radius changes and recenter
  useEffect(() => {
    if (radius === 0) {
      map.setView([56.8796, 24.6032], 7);
    } else {
      let zoom = 13;
      if (radius <= 5) zoom = 13;
      else if (radius <= 10) zoom = 12;
      else if (radius <= 25) zoom = 11;
      else if (radius <= 50) zoom = 10;
      else zoom = 9;
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, radius, map, recenterTrigger]);
  
  // Pan to selected task - Position marker ABOVE the preview card
  useEffect(() => {
    if (selectedTask) {
      const taskLat = selectedTask.displayLatitude || selectedTask.latitude;
      const taskLng = selectedTask.displayLongitude || selectedTask.longitude;
      
      // First, set view to the task location at zoom 14
      map.setView([taskLat, taskLng], 14, { animate: false });
      
      // Then pan down so the marker appears in upper portion of visible map
      // The preview card is ~350px tall, we want marker to be ~80px from top of map
      // So we need to pan the map DOWN by (mapHeight/2 - 80) pixels
      // This moves the CENTER down, which moves the MARKER up visually
      setTimeout(() => {
        const mapHeight = map.getSize().y;
        const targetMarkerY = 60; // Where we want marker to appear (pixels from top)
        const panDownBy = (mapHeight / 2) - targetMarkerY - (previewCardHeight / 2);
        
        map.panBy([0, -panDownBy], { animate: true, duration: 0.3 });
      }, 50);
    }
  }, [selectedTask, map, previewCardHeight]);
  
  // Handle map resize when container changes
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  });
  
  return null;
};

// User location icon - Blue pulsing dot
const createUserLocationIcon = () => divIcon({
  className: 'user-location-icon',
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        background: rgba(59, 130, 246, 0.2);
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 14px;
        height: 14px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(59,130,246,0.5);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Job price icon - Normal size, good visibility
const getJobPriceIcon = (budget: number = 0, isSelected: boolean = false) => {
  let bgColor = '#22c55e';
  let shadow = '0 2px 6px rgba(0,0,0,0.3)';
  
  if (budget <= 25) bgColor = '#22c55e';
  else if (budget <= 75) bgColor = '#3b82f6';
  else {
    bgColor = 'linear-gradient(135deg, #8b5cf6 0%, #d97706 100%)';
    shadow = '0 2px 10px rgba(139, 92, 246, 0.6)';
  }
  
  // Selected marker slightly larger
  const fontSize = isSelected ? 14 : 12;
  const padding = isSelected ? '5px 11px' : '4px 10px';
  const borderWidth = isSelected ? 3 : 2;
  const selectedShadow = isSelected ? '0 4px 16px rgba(0,0,0,0.4)' : shadow;
  
  const priceText = budget >= 1000 ? `&euro;${(budget/1000).toFixed(1)}k` : `&euro;${budget}`;
  const bgStyle = bgColor.includes('gradient') ? `background: ${bgColor};` : `background-color: ${bgColor};`;

  return divIcon({
    className: `job-price-icon ${isSelected ? 'selected-marker' : ''}`,
    html: `<div style="
      ${bgStyle}
      color: white;
      font-size: ${fontSize}px;
      font-weight: 700;
      padding: ${padding};
      border-radius: 14px;
      white-space: nowrap;
      box-shadow: ${selectedShadow};
      border: ${borderWidth}px solid white;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
    ">${priceText}</div>`,
    iconSize: isSelected ? [65, 36] : [55, 30],
    iconAnchor: isSelected ? [32, 18] : [27, 15],
  });
};

// Mobile Job Card - Compact (for list)
const MobileJobCard = ({ task, userLocation, onClick, isSelected }: { 
  task: Task; 
  userLocation: { lat: number; lng: number };
  onClick?: () => void;
  isSelected?: boolean;
}) => {
  const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
  const budget = task.budget || task.reward || 0;
  
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 border-b border-gray-100 active:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
        isSelected ? 'bg-blue-100' : 'bg-blue-50'
      }`}>
        {task.icon || '📋'}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{task.title}</h3>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
          <span>📍 {formatDistance(distance)}</span>
          <span>•</span>
          <span>{task.created_at ? formatTimeAgo(task.created_at) : 'New'}</span>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-lg font-bold ${
          budget <= 25 ? 'text-green-600' : 
          budget <= 75 ? 'text-blue-600' : 
          'text-purple-600'
        }`}>
          €{budget}
        </span>
        <FavoriteButton itemType="task" itemId={task.id} size="sm" />
      </div>
    </div>
  );
};

// Job Preview Card - Shows when job is selected (like the desktop popup)
const JobPreviewCard = ({ 
  task, 
  userLocation, 
  onViewDetails, 
  onClose,
  onCreatorClick 
}: { 
  task: Task; 
  userLocation: { lat: number; lng: number };
  onViewDetails: () => void;
  onClose: () => void;
  onCreatorClick: () => void;
}) => {
  const { t } = useTranslation();
  const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
  const budget = task.budget || task.reward || 0;
  const categoryIcon = getCategoryIcon(task.category);
  const categoryLabel = getCategoryLabel(task.category);
  const applicantsCount = task.applications_count || 0;
  
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl z-[1001] overflow-hidden animate-slideUp">
      <div className="p-4">
        {/* Top row: Category on left, Distance in CENTER, X button on right */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <span>{categoryIcon}</span>
            <span>{categoryLabel}</span>
          </span>
          
          {/* Distance - Centered */}
          <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
            📍 {formatDistance(distance)}
          </span>
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>
        
        {/* Price - BIG and prominent */}
        <div className="text-center mb-2">
          <span className={`text-3xl font-bold ${
            budget <= 25 ? 'text-green-600' : 
            budget <= 75 ? 'text-blue-600' : 
            'text-purple-600'
          }`}>
            €{budget}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg text-center mb-3 line-clamp-2">
          {task.title}
        </h3>
        
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4 py-2 bg-gray-50 rounded-xl text-center">
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">
              {t('tasks.distance', 'ATTĀLUMS')}
            </div>
            <div className="text-sm font-bold text-gray-700">{formatDistance(distance)}</div>
          </div>
          <div className="border-x border-gray-200">
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">
              {t('tasks.posted', 'PUBLICĒTS')}
            </div>
            <div className="text-sm font-bold text-gray-700">
              {task.created_at ? formatTimeAgo(task.created_at) : 'New'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">
              {t('tasks.applicants', 'PIETEIKUMI')}
            </div>
            <div className="text-sm font-bold text-gray-700">{applicantsCount}</div>
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>📍</span>
          <span className="truncate">{task.location?.split(',').slice(0, 2).join(', ') || 'Nearby'}</span>
        </div>
        
        {/* Posted by - CLICKABLE */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onCreatorClick();
          }}
          className="flex items-center gap-2 text-sm text-blue-600 mb-4 hover:underline active:opacity-70"
        >
          <span>👤</span>
          <span className="font-medium">{task.creator_name || 'Anonymous'}</span>
          <span className="text-gray-400">→</span>
        </button>
        
        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onViewDetails}
            className="flex-1 py-3 px-4 rounded-xl text-base font-bold text-white bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {t('tasks.viewAndApply', 'Skatīt un pieteikties')} →
          </button>
          <FavoriteButton
            itemType="task"
            itemId={task.id}
            size="md"
            className="!rounded-xl !w-12 !h-12"
          />
        </div>
      </div>
    </div>
  );
};

// Main Mobile View Component - Google Maps Style
const MobileTasksView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({ lat: 56.9496, lng: 24.1052 });
  const [searchRadius, setSearchRadius] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  
  // Selected job for preview
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Preview card height (approximate, used for map offset calculation)
  const previewCardHeight = 350;
  
  // Sheet state - use percentage of viewport height
  const [sheetPosition, setSheetPosition] = useState<'collapsed' | 'half' | 'full'>('half');
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startPositionRef = useRef<'collapsed' | 'half' | 'full'>('half');
  
  // Calculate heights based on viewport
  const getSheetHeight = () => {
    const vh = window.innerHeight;
    switch (sheetPosition) {
      case 'collapsed': return 100; // Just header visible
      case 'half': return Math.round(vh * 0.4); // 40% of screen
      case 'full': return Math.round(vh * 0.85); // 85% of screen
      default: return Math.round(vh * 0.4);
    }
  };
  
  const sheetHeight = getSheetHeight();

  // Get user location
  useEffect(() => {
    const savedRadius = localStorage.getItem('taskSearchRadius');
    if (savedRadius) setSearchRadius(parseInt(savedRadius, 10));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {},
        { timeout: 5000, enableHighAccuracy: false }
      );
    }
  }, []);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const effectiveRadius = searchRadius === 0 ? 500 : searchRadius;
        const response = await getTasks({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: effectiveRadius,
          status: 'open',
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        });
        
        const tasksWithIcons = response.tasks.map(task => ({
          ...task,
          icon: getCategoryIcon(task.category)
        }));
        
        setTasks(tasksWithIcons);
      } catch (err) {
        console.error('Failed to load jobs', err);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [userLocation, searchRadius, selectedCategory]);

  // Process tasks for map markers
  const tasksWithOffsets = useMemo(() => addMarkerOffsets(tasks), [tasks]);
  const userLocationIcon = useMemo(() => createUserLocationIcon(), []);
  
  // Filter tasks by search
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  // Handle radius change
  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    localStorage.setItem('taskSearchRadius', newRadius.toString());
  };

  // Recenter map to user location
  const handleRecenter = () => {
    setSelectedTask(null);
    setRecenterTrigger(prev => prev + 1);
  };

  // Handle job selection from list
  const handleJobSelect = (task: Task) => {
    setSelectedTask(task);
    setSheetPosition('collapsed'); // Collapse sheet to show map
  };

  // Handle marker click on map
  const handleMarkerClick = (task: Task) => {
    setSelectedTask(task);
    setSheetPosition('collapsed');
  };

  // Close preview and go back to list
  const handleClosePreview = () => {
    setSelectedTask(null);
    setSheetPosition('half');
  };

  // Go to job details
  const handleViewDetails = () => {
    if (selectedTask) {
      navigate(`/tasks/${selectedTask.id}`);
    }
  };

  // Go to creator profile - correct route is /users/:id
  const handleCreatorClick = () => {
    if (selectedTask) {
      // Try different possible field names for creator ID
      const creatorId = selectedTask.creator_id || selectedTask.user_id || selectedTask.created_by;
      if (creatorId) {
        navigate(`/users/${creatorId}`);
      }
    }
  };

  // Sheet drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startYRef.current = e.touches[0].clientY;
    startPositionRef.current = sheetPosition;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    // Just track movement, actual position change happens on end
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const endY = e.changedTouches[0].clientY;
    const deltaY = startYRef.current - endY;
    const threshold = 50; // pixels needed to trigger state change
    
    if (deltaY > threshold) {
      // Swiped UP - expand
      if (sheetPosition === 'collapsed') setSheetPosition('half');
      else if (sheetPosition === 'half') setSheetPosition('full');
    } else if (deltaY < -threshold) {
      // Swiped DOWN - collapse
      if (sheetPosition === 'full') setSheetPosition('half');
      else if (sheetPosition === 'half') setSheetPosition('collapsed');
    }
  };

  // Category pills for horizontal scroll
  const categories = [
    { value: 'all', icon: '🌐', label: 'All' },
    ...CATEGORY_OPTIONS.slice(1, 10)
  ];

  return (
    <>
      {/* Global styles */}
      <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mobile-tasks-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          background: #f3f4f6;
          z-index: 9999;
        }
        /* Make selected markers appear on top */
        .selected-marker {
          z-index: 1000 !important;
        }
        .leaflet-marker-icon.selected-marker {
          z-index: 1000 !important;
        }
      `}</style>

      <div className="mobile-tasks-container">
        {/* ============================================ */}
        {/* TOP BAR - Search + Filters (FIXED) */}
        {/* ============================================ */}
        <div className="bg-white shadow-md z-50 flex-shrink-0">
          {/* Search Bar */}
          <div className="p-3 pb-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full bg-gray-100 rounded-full px-4 py-2.5 pl-10 text-sm text-gray-700 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>
              
              {/* Radius dropdown */}
              <select
                value={searchRadius}
                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                className="bg-gray-100 rounded-full px-3 py-2.5 text-sm font-medium text-gray-700 border-0 appearance-none focus:ring-2 focus:ring-blue-500"
                style={{ minWidth: '75px' }}
              >
                <option value={5}>5km</option>
                <option value={10}>10km</option>
                <option value={25}>25km</option>
                <option value={50}>50km</option>
                <option value={0}>🇱🇻 All</option>
              </select>
            </div>
          </div>
          
          {/* Category Pills - Horizontal Scroll */}
          <div className="px-3 pb-3">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* MAP AREA - Takes remaining space above sheet */}
        {/* ============================================ */}
        <div 
          className="flex-1 relative"
          style={{ minHeight: '200px' }}
        >
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController 
              lat={userLocation.lat} 
              lng={userLocation.lng} 
              radius={searchRadius} 
              recenterTrigger={recenterTrigger}
              selectedTask={selectedTask}
              previewCardHeight={previewCardHeight}
            />
            
            {/* User Location */}
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
              <Popup>
                <div className="text-center p-2">
                  <p className="font-semibold text-blue-600">📍 You are here</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Job Markers */}
            {tasksWithOffsets.map((task) => {
              const budget = task.budget || task.reward || 0;
              const isSelected = selectedTask?.id === task.id;
              return (
                <Marker
                  key={task.id}
                  position={[task.displayLatitude || task.latitude, task.displayLongitude || task.longitude]}
                  icon={getJobPriceIcon(budget, isSelected)}
                  eventHandlers={{
                    click: () => handleMarkerClick(task)
                  }}
                  zIndexOffset={isSelected ? 1000 : 0}
                />
              );
            })}
          </MapContainer>

          {/* Floating Buttons - Above sheet */}
          {!selectedTask && (
            <div 
              className="absolute left-0 right-0 flex justify-between px-4 z-[1000]"
              style={{ bottom: '16px' }}
            >
              {/* Post Job FAB */}
              {isAuthenticated && (
                <button
                  onClick={() => navigate('/tasks/create')}
                  className="w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white text-3xl font-light active:scale-95 transition-transform"
                >
                  +
                </button>
              )}
              {!isAuthenticated && <div />}
              
              {/* Recenter Button */}
              <button
                onClick={handleRecenter}
                className="w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center active:bg-gray-100"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v4m0 12v4m10-10h-4M6 12H2"/>
                </svg>
              </button>
            </div>
          )}

          {/* Job Preview Card - Shows when job is selected */}
          {selectedTask && (
            <JobPreviewCard
              task={selectedTask}
              userLocation={userLocation}
              onViewDetails={handleViewDetails}
              onClose={handleClosePreview}
              onCreatorClick={handleCreatorClick}
            />
          )}
        </div>

        {/* ============================================ */}
        {/* BOTTOM SHEET - Jobs List */}
        {/* ============================================ */}
        <div
          className="bg-white rounded-t-3xl shadow-2xl flex-shrink-0 flex flex-col"
          style={{
            height: `${sheetHeight}px`,
            transition: isDragging ? 'none' : 'height 0.3s ease-out',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Drag Handle Area */}
          <div
            className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing flex-shrink-0"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
          >
            {/* Visible drag handle bar */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2" />
            
            {/* Job count header */}
            <div className="flex items-center justify-between w-full px-4">
              <span className="text-base font-bold text-gray-800">
                💰 {filteredTasks.length} jobs nearby
              </span>
              {sheetPosition === 'collapsed' && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span>↑</span> Swipe up for jobs
                </span>
              )}
            </div>
          </div>

          {/* Jobs List - Scrollable */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{ touchAction: 'pan-y' }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="text-3xl mb-2">📋</div>
                <h3 className="font-semibold text-gray-900 mb-1">No jobs found</h3>
                <p className="text-sm text-gray-500">Try a different category or increase radius</p>
              </div>
            ) : (
              <div>
                {filteredTasks.map((task) => (
                  <MobileJobCard
                    key={task.id}
                    task={task}
                    userLocation={userLocation}
                    onClick={() => handleJobSelect(task)}
                    isSelected={selectedTask?.id === task.id}
                  />
                ))}
                <div className="h-8" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileTasksView;
