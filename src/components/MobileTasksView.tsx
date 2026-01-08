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
import BottomSheet from './ui/BottomSheet';

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
const MapController = ({ lat, lng, radius }: { lat: number; lng: number; radius: number }) => {
  const map = useMap();
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
  }, [lat, lng, radius, map]);
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

// Job price icon - Fixed euro symbol
const getJobPriceIcon = (budget: number = 0) => {
  let bgColor = '#22c55e';
  let shadow = '0 2px 4px rgba(0,0,0,0.2)';
  
  if (budget <= 25) bgColor = '#22c55e';
  else if (budget <= 75) bgColor = '#3b82f6';
  else {
    bgColor = 'linear-gradient(135deg, #8b5cf6 0%, #d97706 100%)';
    shadow = '0 2px 8px rgba(139, 92, 246, 0.5)';
  }
  
  // Use actual euro symbol, not unicode escape
  const priceText = budget >= 1000 ? `€${(budget/1000).toFixed(1)}k` : `€${budget}`;
  const bgStyle = bgColor.includes('gradient') ? `background: ${bgColor};` : `background-color: ${bgColor};`;

  return divIcon({
    className: 'job-price-icon',
    html: `<div style="
      ${bgStyle}
      color: white;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 14px;
      white-space: nowrap;
      box-shadow: ${shadow};
      border: 2px solid white;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
    ">${priceText}</div>`,
    iconSize: [60, 32],
    iconAnchor: [30, 16],
  });
};

// Mobile Job Card - Compact design with proper euro symbol
const MobileJobCard = ({ task, userLocation, onClick }: { 
  task: Task; 
  userLocation: { lat: number; lng: number };
  onClick?: () => void;
}) => {
  const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
  const budget = task.budget || task.reward || 0;
  
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-white border-b border-gray-100 active:bg-gray-50 cursor-pointer"
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">
        {task.icon || '💼'}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{task.title}</h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span>📍 {formatDistance(distance)}</span>
          <span>•</span>
          <span>{task.created_at ? formatTimeAgo(task.created_at) : 'New'}</span>
        </div>
      </div>
      
      {/* Price - Using actual euro symbol */}
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

// Main Mobile View Component
const MobileTasksView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({ lat: 56.9496, lng: 24.1052 });
  const [searchRadius, setSearchRadius] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sheetPosition, setSheetPosition] = useState<'min' | 'mid' | 'max'>('mid');
  const [showFilters, setShowFilters] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  
  const mapRef = useRef<any>(null);

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

  // Handle radius change
  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    localStorage.setItem('taskSearchRadius', newRadius.toString());
  };

  // Toggle fullscreen map
  const toggleMapFullscreen = () => {
    if (isMapFullscreen) {
      setIsMapFullscreen(false);
      setSheetPosition('mid');
    } else {
      setIsMapFullscreen(true);
      setSheetPosition('min');
    }
  };

  // Calculate map height based on sheet position
  const getMapHeight = () => {
    if (isMapFullscreen) return 'calc(100vh - 70px)';
    switch (sheetPosition) {
      case 'min': return 'calc(100vh - 80px)';
      case 'mid': return '45vh';
      case 'max': return '20vh';
      default: return '45vh';
    }
  };

  // Handle sheet position change
  const handleSheetChange = (position: 'min' | 'mid' | 'max') => {
    setSheetPosition(position);
    if (position !== 'min') {
      setIsMapFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 overflow-hidden">
      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        .leaflet-container {
          touch-action: pan-x pan-y;
        }
      `}</style>

      {/* Top Bar - Floating over map */}
      <div className="absolute top-0 left-0 right-0 z-40 p-3 pointer-events-none safe-area-top">
        <div className="flex gap-2 pointer-events-auto">
          {/* Search/Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 bg-white rounded-full px-4 py-2.5 shadow-lg flex items-center gap-2 text-gray-700"
          >
            <span>🔍</span>
            <span className="text-sm">Search jobs...</span>
          </button>
          
          {/* Radius Selector */}
          <select
            value={searchRadius}
            onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
            className="bg-white rounded-full px-3 py-2.5 shadow-lg text-sm font-medium text-gray-700 border-0 appearance-none"
            style={{ minWidth: '80px' }}
          >
            <option value={5}>5km</option>
            <option value={10}>10km</option>
            <option value={25}>25km</option>
            <option value={50}>50km</option>
            <option value={0}>🇱🇻 All</option>
          </select>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-2 bg-white rounded-2xl shadow-lg p-4 pointer-events-auto">
            <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setShowFilters(false);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                🌐 All
              </button>
              {CATEGORY_OPTIONS.slice(1, 9).map(cat => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setShowFilters(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map Container - With touch handling */}
      <div 
        className="transition-all duration-300 ease-out relative"
        style={{ height: getMapHeight() }}
      >
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          ref={mapRef}
          // Prevent map from capturing all touch events
          dragging={true}
          touchZoom={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController lat={userLocation.lat} lng={userLocation.lng} radius={searchRadius} />
          
          {/* User Location - Blue pulsing dot */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold text-blue-600">📍 You are here</p>
                <p className="text-xs text-gray-500 mt-1">Your current location</p>
              </div>
            </Popup>
          </Marker>
          
          {/* Job Markers */}
          {tasksWithOffsets.map((task) => {
            const budget = task.budget || task.reward || 0;
            return (
              <Marker
                key={task.id}
                position={[task.displayLatitude || task.latitude, task.displayLongitude || task.longitude]}
                icon={getJobPriceIcon(budget)}
                eventHandlers={{
                  click: () => {
                    navigate(`/tasks/${task.id}`);
                  }
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-green-600 font-bold text-lg mb-2">€{budget}</p>
                    <button
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Fullscreen Toggle Button */}
        <button
          onClick={toggleMapFullscreen}
          className="absolute bottom-4 right-4 z-30 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 active:bg-gray-100"
        >
          {isMapFullscreen ? (
            <span className="text-lg">↙</span>
          ) : (
            <span className="text-lg">⛶</span>
          )}
        </button>

        {/* Recenter Button */}
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.setView([userLocation.lat, userLocation.lng], 13);
            }
          }}
          className="absolute bottom-4 left-4 z-30 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-500 active:bg-gray-100"
        >
          <span className="text-lg">◎</span>
        </button>
      </div>

      {/* Floating Action Button - Post Job */}
      {isAuthenticated && !isMapFullscreen && (
        <button
          onClick={() => navigate('/tasks/create')}
          className="absolute z-40 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl hover:bg-blue-600 active:scale-95 transition-all"
          style={{ 
            bottom: sheetPosition === 'min' ? '100px' : sheetPosition === 'mid' ? '340px' : '75%',
            right: '16px',
            transition: 'bottom 0.3s ease-out'
          }}
        >
          +
        </button>
      )}

      {/* Bottom Sheet - Only show when not fullscreen */}
      {!isMapFullscreen && (
        <BottomSheet
          snapPosition={sheetPosition}
          onSnapChange={handleSheetChange}
          minHeight={70}
          midHeight={320}
          maxHeightPercent={80}
          header={
            <div className="flex items-center justify-between py-1">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  💰 {tasks.length} Jobs Nearby
                </h2>
                <p className="text-xs text-gray-500">
                  {searchRadius === 0 ? 'All of Latvia' : `Within ${searchRadius}km`}
                  {selectedCategory !== 'all' && ` • ${getCategoryLabel(selectedCategory)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-50 rounded-full"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>
          }
        >
          {/* Job List */}
          <div 
            className="overflow-y-auto overscroll-contain"
            style={{ 
              height: 'calc(100% - 20px)',
              touchAction: 'pan-y'
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-4xl mb-3">💼</div>
                <h3 className="font-semibold text-gray-900 mb-1">No jobs nearby</h3>
                <p className="text-sm text-gray-500 mb-4">Try increasing your search radius</p>
                {isAuthenticated && (
                  <button
                    onClick={() => navigate('/tasks/create')}
                    className="bg-blue-500 text-white px-6 py-2.5 rounded-full font-medium text-sm"
                  >
                    Post a Job
                  </button>
                )}
              </div>
            ) : (
              <div>
                {tasks.map((task) => (
                  <MobileJobCard
                    key={task.id}
                    task={task}
                    userLocation={userLocation}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  />
                ))}
                {/* Bottom padding for safe area */}
                <div className="h-20" />
              </div>
            )}
          </div>
        </BottomSheet>
      )}

      {/* Fullscreen mode hint */}
      {isMapFullscreen && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <button
            onClick={toggleMapFullscreen}
            className="bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <span>↑</span> Show jobs list
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileTasksView;
