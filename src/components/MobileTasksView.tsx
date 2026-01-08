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
  selectedTask
}: { 
  lat: number; 
  lng: number; 
  radius: number; 
  recenterTrigger: number;
  selectedTask: Task | null;
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
  
  // Pan to selected task - Position marker in UPPER portion of map
  useEffect(() => {
    if (selectedTask) {
      const taskLat = selectedTask.displayLatitude || selectedTask.latitude;
      const taskLng = selectedTask.displayLongitude || selectedTask.longitude;
      
      map.invalidateSize();
      map.setView([taskLat, taskLng], 14, { animate: false });
      
      setTimeout(() => {
        const mapContainer = map.getContainer();
        const mapHeight = mapContainer.offsetHeight;
        const desiredMarkerPosition = mapHeight * 0.25;
        const currentMarkerPosition = mapHeight * 0.5;
        const panAmount = currentMarkerPosition - desiredMarkerPosition;
        
        map.panBy([0, panAmount], { animate: true, duration: 0.4 });
      }, 150);
    }
  }, [selectedTask, map]);
  
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

// Job price icon
const getJobPriceIcon = (budget: number = 0, isSelected: boolean = false) => {
  let bgColor = '#22c55e';
  let shadow = '0 2px 6px rgba(0,0,0,0.3)';
  
  if (budget <= 25) bgColor = '#22c55e';
  else if (budget <= 75) bgColor = '#3b82f6';
  else {
    bgColor = 'linear-gradient(135deg, #8b5cf6 0%, #d97706 100%)';
    shadow = '0 2px 10px rgba(139, 92, 246, 0.6)';
  }
  
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

// Job Preview Card - Shows when job is selected
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
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[1001] overflow-hidden animate-slideUp">
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
      
      {/* Safe area padding for phones with home indicator */}
      <div className="h-6 bg-white" />
    </div>
  );
};

// Create Choice Modal Component - NEW
const CreateChoiceModal = ({
  isOpen,
  onClose,
  onPostJob,
  onOfferService
}: {
  isOpen: boolean;
  onClose: () => void;
  onPostJob: () => void;
  onOfferService: () => void;
}) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/40">
      <div 
        className="w-full max-w-sm mx-4 rounded-2xl bg-white p-5 shadow-lg animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          {t('createModal.title', 'What would you like to do?')}
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          {t('createModal.description', 'Choose if you need help or if you want to offer your services.')}
        </p>

        <div className="space-y-3">
          {/* Post a Job Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onPostJob();
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-left text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            <span className="text-xl">📋</span>
            <div>
              <div className="text-sm font-semibold">
                {t('createModal.postJob', 'Post a Job')}
              </div>
              <div className="text-xs text-blue-100">
                {t('createModal.postJobDesc', 'I need help with something')}
              </div>
            </div>
          </button>

          {/* Offer a Service Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOfferService();
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-amber-500 px-4 py-3 text-left text-white hover:bg-amber-600 active:scale-[0.98] transition-all"
          >
            <span className="text-xl">🛠️</span>
            <div>
              <div className="text-sm font-semibold">
                {t('createModal.offerService', 'Offer a Service')}
              </div>
              <div className="text-xs text-amber-100">
                {t('createModal.offerServiceDesc', 'I can help other people')}
              </div>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          {t('common.cancel', 'Cancel')}
        </button>
      </div>
    </div>
  );
};

// Slide-out Menu Component - UPDATED with both create options
const SlideOutMenu = ({ 
  isOpen, 
  onClose, 
  isAuthenticated,
  user,
  onLogout,
  navigate
}: { 
  isOpen: boolean; 
  onClose: () => void;
  isAuthenticated: boolean;
  user: any;
  onLogout: () => void;
  navigate: (path: string) => void;
}) => {
  const { t } = useTranslation();
  
  // Main menu items
  const menuItems = isAuthenticated ? [
    { icon: '👤', label: t('menu.profile', 'My Profile'), path: '/profile' },
    { icon: '📋', label: t('menu.myJobs', 'My Jobs'), path: '/profile?tab=tasks' },
    { icon: '❤️', label: t('menu.favorites', 'Favorites'), path: '/favorites' },
    { icon: '💬', label: t('menu.messages', 'Messages'), path: '/messages' },
  ] : [
    { icon: '🔑', label: t('menu.login', 'Login'), path: '/login' },
    { icon: '📝', label: t('menu.register', 'Register'), path: '/register' },
  ];

  // Create options - separate section
  const createOptions = isAuthenticated ? [
    { icon: '📋', label: t('menu.postJob', 'Post a Job'), path: '/tasks/create', color: 'text-blue-600', bgHover: 'hover:bg-blue-50' },
    { icon: '🛠️', label: t('menu.offerService', 'Offer a Service'), path: '/offerings/create', color: 'text-amber-600', bgHover: 'hover:bg-amber-50' },
  ] : [];

  const handleItemClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[10000] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-[10001] shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-blue-500 p-6 pt-12">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-lg truncate">
                  {user.name || user.username || 'User'}
                </h3>
                <p className="text-white/70 text-sm truncate">
                  {user.email || ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                👋
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Welcome!</h3>
                <p className="text-white/70 text-sm">Sign in to get started</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item.path)}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium text-gray-700">{item.label}</span>
            </button>
          ))}
          
          {/* Create Options Section - Only for authenticated users */}
          {isAuthenticated && createOptions.length > 0 && (
            <>
              <div className="h-px bg-gray-200 my-2 mx-6" />
              <div className="px-6 py-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {t('menu.createSection', 'Create')}
                </span>
              </div>
              {createOptions.map((item, index) => (
                <button
                  key={`create-${index}`}
                  onClick={() => handleItemClick(item.path)}
                  className={`w-full flex items-center gap-4 px-6 py-4 ${item.bgHover} active:bg-gray-100 transition-colors`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`font-medium ${item.color}`}>{item.label}</span>
                </button>
              ))}
            </>
          )}
          
          {/* Logout */}
          {isAuthenticated && (
            <>
              <div className="h-px bg-gray-200 my-2 mx-6" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-50 active:bg-red-100 transition-colors"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium text-red-600">{t('menu.logout', 'Logout')}</span>
              </button>
            </>
          )}
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
        >
          ✕
        </button>
      </div>
    </>
  );
};

// Main Mobile View Component
const MobileTasksView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({ lat: 56.9496, lng: 24.1052 });
  const [searchRadius, setSearchRadius] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  
  // Menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Create modal state - NEW
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Selected job for preview - when set, job list is hidden
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Track if job list should animate in
  const [showJobList, setShowJobList] = useState(true);
  
  // Sheet state for job list (only used when no job is selected)
  const [sheetPosition, setSheetPosition] = useState<'collapsed' | 'half' | 'full'>('half');
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  
  // Calculate sheet height (only matters when job list is visible)
  const getSheetHeight = () => {
    const vh = window.innerHeight;
    switch (sheetPosition) {
      case 'collapsed': return 100;
      case 'half': return Math.round(vh * 0.4);
      case 'full': return Math.round(vh * 0.85);
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
    setShowJobList(true);
    setRecenterTrigger(prev => prev + 1);
  };

  // Handle job selection from list - HIDE the job list
  const handleJobSelect = (task: Task) => {
    setShowJobList(false);
    setTimeout(() => {
      setSelectedTask(task);
    }, 50);
  };

  // Handle marker click on map
  const handleMarkerClick = (task: Task) => {
    setShowJobList(false);
    setTimeout(() => {
      setSelectedTask(task);
    }, 50);
  };

  // Close preview and SHOW job list again with animation
  const handleClosePreview = () => {
    setSelectedTask(null);
    setTimeout(() => {
      setShowJobList(true);
      setSheetPosition('half');
    }, 100);
  };

  // Go to job details
  const handleViewDetails = () => {
    if (selectedTask) {
      navigate(`/tasks/${selectedTask.id}`);
    }
  };

  // Go to creator profile
  const handleCreatorClick = () => {
    if (selectedTask) {
      const creatorId = selectedTask.creator_id || selectedTask.user_id || selectedTask.created_by;
      if (creatorId) {
        navigate(`/users/${creatorId}`);
      }
    }
  };

  // Handle create button click - NEW: Opens modal instead of direct navigation
  const handleCreateClick = () => {
    if (isAuthenticated) {
      setShowCreateModal(true);
    } else {
      navigate('/login');
    }
  };

  // Handle post job from modal
  const handlePostJob = () => {
    navigate('/tasks/create');
  };

  // Handle offer service from modal
  const handleOfferService = () => {
    navigate('/offerings/create');
  };

  // Sheet drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = () => {
    // Track movement
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const endY = e.changedTouches[0].clientY;
    const deltaY = startYRef.current - endY;
    const threshold = 50;
    
    if (deltaY > threshold) {
      if (sheetPosition === 'collapsed') setSheetPosition('half');
      else if (sheetPosition === 'half') setSheetPosition('full');
    } else if (deltaY < -threshold) {
      if (sheetPosition === 'full') setSheetPosition('half');
      else if (sheetPosition === 'half') setSheetPosition('collapsed');
    }
  };

  // Category pills
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
        @keyframes slideDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-in forwards;
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
        .selected-marker {
          z-index: 1000 !important;
        }
        .leaflet-marker-icon.selected-marker {
          z-index: 1000 !important;
        }
      `}</style>

      {/* Slide-out Menu */}
      <SlideOutMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={logout}
        navigate={navigate}
      />

      {/* Create Choice Modal - NEW */}
      <CreateChoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostJob={handlePostJob}
        onOfferService={handleOfferService}
      />

      <div className="mobile-tasks-container">
        {/* ============================================ */}
        {/* TOP BAR - Menu + Search + Radius */}
        {/* ============================================ */}
        <div className="bg-white shadow-md z-50 flex-shrink-0">
          {/* Search Bar Row */}
          <div className="p-3 pb-2">
            <div className="flex gap-2 items-center">
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 active:bg-gray-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              
              {/* Search Input - Takes remaining space */}
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
              
              {/* Radius Selector */}
              <select
                value={searchRadius}
                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                className="bg-gray-100 rounded-full px-3 py-2.5 text-sm font-medium text-gray-700 border-0 appearance-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                style={{ minWidth: '70px' }}
              >
                <option value={5}>5km</option>
                <option value={10}>10km</option>
                <option value={25}>25km</option>
                <option value={50}>50km</option>
                <option value={0}>🇱🇻 All</option>
              </select>
            </div>
          </div>
          
          {/* Category Pills */}
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
        {/* MAP AREA - Expands when job is selected */}
        {/* ============================================ */}
        <div className="flex-1 relative" style={{ minHeight: '200px' }}>
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

          {/* Floating Recenter Button - Only on map, right side */}
          {!selectedTask && showJobList && (
            <div 
              className="absolute right-4 z-[1000]"
              style={{ bottom: '16px' }}
            >
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

          {/* Job Preview Card - Shows when a job is selected */}
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
        {/* BOTTOM SHEET - Job List (HIDDEN when job selected) */}
        {/* ============================================ */}
        {!selectedTask && showJobList && (
          <div
            className="bg-white rounded-t-3xl shadow-2xl flex-shrink-0 flex flex-col animate-slideUp"
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
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2" />
              
              {/* Header Row: Job count on left, Single "+" button on right - UPDATED */}
              <div className="flex items-center justify-between w-full px-4">
                <span className="text-base font-bold text-gray-800">
                  💰 {filteredTasks.length} {t('tasks.jobsNearby', 'jobs nearby')}
                </span>
                
                {/* Single "+" Create Button - NEW */}
                <button
                  type="button"
                  onClick={handleCreateClick}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                  aria-label={t('tasks.createJobOrService', 'Create job or service')}
                >
                  <span className="text-xl leading-none font-bold">+</span>
                </button>
              </div>
              
              {sheetPosition === 'collapsed' && (
                <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <span>↑</span> {t('tasks.swipeUpForJobs', 'Swipe up for jobs')}
                </span>
              )}
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
                  <h3 className="font-semibold text-gray-900 mb-1">{t('tasks.noJobsFound', 'No jobs found')}</h3>
                  <p className="text-sm text-gray-500">{t('tasks.tryDifferentCategory', 'Try a different category or increase radius')}</p>
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
        )}
      </div>
    </>
  );
};

export default MobileTasksView;
