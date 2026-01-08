import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import { getTasks, Task as APITask } from '../api/tasks';
import { getOfferings, Offering } from '../api/offerings';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
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

// User location icon
const createUserLocationIcon = () => divIcon({
  className: 'user-location-icon',
  html: `<div style="
    width: 20px;
    height: 20px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(59,130,246,0.5);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Job price icon
const getJobPriceIcon = (budget: number = 0) => {
  let bgColor = '#22c55e';
  let shadow = '0 2px 4px rgba(0,0,0,0.2)';
  
  if (budget <= 25) bgColor = '#22c55e';
  else if (budget <= 75) bgColor = '#3b82f6';
  else {
    bgColor = 'linear-gradient(135deg, #8b5cf6 0%, #d97706 100%)';
    shadow = '0 2px 8px rgba(139, 92, 246, 0.5)';
  }
  
  const priceText = budget >= 1000 ? `\u20AC${(budget/1000).toFixed(1)}k` : `\u20AC${budget}`;
  const bgStyle = bgColor.includes('gradient') ? `background: ${bgColor};` : `background-color: ${bgColor};`;

  return divIcon({
    className: 'job-price-icon',
    html: `<div style="
      ${bgStyle}
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 12px;
      white-space: nowrap;
      box-shadow: ${shadow};
      border: 2px solid white;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    ">${priceText}</div>`,
    iconSize: [50, 28],
    iconAnchor: [25, 14],
  });
};

// Mobile Job Card - Compact design
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
      
      {/* Price */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-lg font-bold ${
          budget <= 25 ? 'text-green-600' : 
          budget <= 75 ? 'text-blue-600' : 
          'text-purple-600'
        }`}>
          \u20AC{budget}
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
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: 56.9496, lng: 24.1052 });
  const [searchRadius, setSearchRadius] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sheetPosition, setSheetPosition] = useState<'min' | 'mid' | 'max'>('mid');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
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
        () => {}, // Use default Riga location on error
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
        setError('Failed to load jobs');
      }
      setLoading(false);
    };

    fetchTasks();
  }, [userLocation, searchRadius, selectedCategory]);

  // Process tasks for map markers
  const tasksWithOffsets = useMemo(() => addMarkerOffsets(tasks), [tasks]);
  const userLocationIcon = useMemo(() => createUserLocationIcon(), []);

  // Handle task selection from list
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setSheetPosition('min'); // Collapse sheet to show map
    // Could also center map on task here
  };

  // Handle radius change
  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    localStorage.setItem('taskSearchRadius', newRadius.toString());
  };

  // Calculate map height based on sheet position
  const getMapHeight = () => {
    switch (sheetPosition) {
      case 'min': return 'calc(100vh - 60px)';
      case 'mid': return 'calc(100vh - 300px)';
      case 'max': return '15vh';
      default: return 'calc(100vh - 300px)';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 overflow-hidden">
      {/* Top Bar - Floating over map */}
      <div className="absolute top-0 left-0 right-0 z-40 p-3 pointer-events-none">
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
            className="bg-white rounded-full px-3 py-2.5 shadow-lg text-sm font-medium text-gray-700 border-0"
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
              {CATEGORY_OPTIONS.slice(0, 8).map(cat => (
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

      {/* Map - Resizes based on sheet position */}
      <div 
        className="transition-all duration-300 ease-out"
        style={{ height: getMapHeight() }}
      >
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController lat={userLocation.lat} lng={userLocation.lng} radius={searchRadius} />
          
          {/* User Location */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="text-center p-1">
                <p className="font-medium">📍 You</p>
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
                    setSelectedTask(task);
                    setSheetPosition('mid');
                  }
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-green-600 font-bold text-lg mb-2">\u20AC{budget}</p>
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
      </div>

      {/* Floating Action Button - Post Job */}
      {isAuthenticated && sheetPosition !== 'max' && (
        <button
          onClick={() => navigate('/tasks/create')}
          className="absolute bottom-72 right-4 z-40 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl hover:bg-blue-600 active:scale-95 transition-all"
          style={{ bottom: sheetPosition === 'min' ? '80px' : '320px' }}
        >
          +
        </button>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        snapPosition={sheetPosition}
        onSnapChange={setSheetPosition}
        minHeight={60}
        midHeight={300}
        maxHeightPercent={85}
        header={
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">
                💰 {tasks.length} Jobs Nearby
              </h2>
              <p className="text-xs text-gray-500">
                {searchRadius === 0 ? 'All of Latvia' : `Within ${searchRadius}km`}
              </p>
            </div>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs text-blue-600 font-medium"
              >
                Clear filter
              </button>
            )}
          </div>
        }
      >
        {/* Job List */}
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
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default MobileTasksView;
