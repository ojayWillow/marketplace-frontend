import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import { getTasks, Task as APITask } from '../api/tasks';
import { getOfferings, getBoostedOfferings, Offering } from '../api/offerings';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { useMatchingStore } from '../stores/matchingStore';
import { getCategoryIcon, getCategoryLabel, CATEGORY_OPTIONS } from '../constants/categories';
import FavoriteButton from '../components/ui/FavoriteButton';
import CompactFilterBar, { CompactFilterValues } from '../components/ui/CompactFilterBar';
import { filterByDate, filterByPrice } from '../components/ui/AdvancedFilters';
import { useIsMobile } from '../hooks/useIsMobile';
import MobileTasksView from '../components/MobileTasksView';
import QuickHelpIntroModal from '../components/QuickHelpIntroModal';

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

// Format time ago - compact (needs t function passed in for full i18n)
const formatTimeAgo = (dateString: string, t?: (key: string, fallback: string) => string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return t ? t('tasks.time.justNow', 'Just now') : 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

// Function to add offset to overlapping markers
const addMarkerOffsets = (tasks: Task[]): Task[] => {
  const coordMap = new Map<string, Task[]>();
  
  tasks.forEach(task => {
    const key = `${task.latitude.toFixed(4)},${task.longitude.toFixed(4)}`;
    if (!coordMap.has(key)) {
      coordMap.set(key, []);
    }
    coordMap.get(key)!.push(task);
  });
  
  const result: Task[] = [];
  coordMap.forEach((groupedTasks) => {
    if (groupedTasks.length === 1) {
      result.push({
        ...groupedTasks[0],
        displayLatitude: groupedTasks[0].latitude,
        displayLongitude: groupedTasks[0].longitude
      });
    } else {
      const offsetDistance = 0.0008;
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
      else if (radius <= 100) zoom = 9;
      else zoom = 8;
      
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, radius, map]);
  return null;
};

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

const getJobPriceIcon = (budget: number = 0, isUrgent: boolean = false) => {
  let bgColor = '#22c55e';
  let textColor = 'white';
  let extraClass = '';
  let shadow = '0 2px 4px rgba(0,0,0,0.2)';
  let border = '2px solid white';
  
  if (budget <= 25) {
    bgColor = '#22c55e';
  } else if (budget <= 75) {
    bgColor = '#3b82f6';
  } else {
    bgColor = 'linear-gradient(135deg, #8b5cf6 0%, #d97706 100%)';
    extraClass = ' job-price--premium';
    shadow = '0 2px 8px rgba(139, 92, 246, 0.5), 0 0 12px rgba(217, 119, 6, 0.3)';
  }
  
  if (isUrgent) {
    border = '3px solid #ef4444';
    shadow = '0 0 0 2px rgba(239, 68, 68, 0.3), ' + shadow;
    extraClass += ' job-price--urgent';
  }
  
  const priceText = budget >= 1000 ? `€${(budget/1000).toFixed(1)}k` : `€${budget}`;
  const isLongPrice = priceText.length > 4;
  const fontSize = isLongPrice ? '11px' : '12px';
  const padding = isLongPrice ? '2px 6px' : '2px 8px';
  
  const bgStyle = bgColor.includes('gradient') 
    ? `background: ${bgColor};` 
    : `background-color: ${bgColor};`;

  return divIcon({
    className: `job-price-icon${extraClass}`,
    html: `
      <div class="job-price-marker" style="
        ${bgStyle}
        color: ${textColor};
        font-size: ${fontSize};
        font-weight: 700;
        padding: ${padding};
        border-radius: 12px;
        white-space: nowrap;
        box-shadow: ${shadow};
        border: ${border};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        height: 24px;
        cursor: pointer;
        transition: transform 0.15s ease;
      ">
        ${priceText}
      </div>
    `,
    iconSize: [50, 28],
    iconAnchor: [25, 14],
  });
};

const getBoostedOfferingIcon = (category: string = 'other') => {
  const categoryEmoji = getCategoryIcon(category);

  return divIcon({
    className: 'offering-category-icon',
    html: `
      <div class="offering-category-marker" style="
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        font-size: 16px;
        padding: 6px;
        border-radius: 50%;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);
        border: 2px solid white;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        cursor: pointer;
        transition: transform 0.15s ease;
      ">
        ${categoryEmoji}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const JobMapPopup = ({ task, userLocation }: { task: Task; userLocation: { lat: number; lng: number } }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
  const budget = task.budget || task.reward || 0;
  const categoryIcon = getCategoryIcon(task.category);
  const categoryLabel = getCategoryLabel(task.category);
  const shortLocation = task.location?.split(',').slice(0, 2).join(', ') || t('tasks.nearby', 'Nearby');
  const applicantsCount = task.applications_count || 0;
  
  return (
    <div className="job-popup" style={{ width: '240px' }}>
      {task.is_urgent && (
        <div className="mb-2 px-2 py-1 bg-red-100 border border-red-200 rounded-lg text-center">
          <span className="text-red-700 font-semibold text-xs">⚡ {t('tasks.urgent', 'URGENT')}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          <span>{categoryIcon}</span>
          <span>{categoryLabel}</span>
        </span>
        <span className="text-xs text-gray-500">📍 {formatDistance(distance)}</span>
      </div>
      
      <div className="text-center mb-2">
        <span className="text-2xl font-bold text-green-600">€{budget}</span>
      </div>
      
      <h3 className="font-semibold text-gray-900 text-sm leading-tight text-center mb-3 line-clamp-2">
        {task.title}
      </h3>
      
      <div className="grid grid-cols-3 gap-1 mb-3 py-2 bg-gray-50 rounded-lg text-center">
        <div>
          <div className="text-[10px] text-gray-400 uppercase">{t('tasks.distance', 'Distance')}</div>
          <div className="text-xs font-semibold text-gray-700">{formatDistance(distance)}</div>
        </div>
        <div className="border-x border-gray-200">
          <div className="text-[10px] text-gray-400 uppercase">{t('tasks.posted', 'Posted')}</div>
          <div className="text-xs font-semibold text-gray-700">{task.created_at ? formatTimeAgo(task.created_at, t) : t('tasks.new', 'New')}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 uppercase">{t('tasks.applicants', 'Applicants')}</div>
          <div className="text-xs font-semibold text-gray-700">{applicantsCount}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        <span>📍</span>
        <span className="truncate">{shortLocation}</span>
      </div>
      
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
        <span>👤</span>
        <span>{task.creator_name || t('tasks.anonymous', 'Anonymous')}</span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/tasks/${task.id}`);
          }}
          className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-all"
        >
          {t('tasks.viewAndApply', 'View & Apply')} →
        </button>
        <FavoriteButton
          itemType="task"
          itemId={task.id}
          size="sm"
          className="!rounded-lg"
        />
      </div>
    </div>
  );
};

const OfferingMapPopup = ({ offering, userLocation }: { offering: Offering; userLocation: { lat: number; lng: number } }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const distance = calculateDistance(userLocation.lat, userLocation.lng, offering.latitude, offering.longitude);
  const categoryIcon = getCategoryIcon(offering.category);
  const categoryLabel = getCategoryLabel(offering.category);
  
  return (
    <div className="offering-popup" style={{ width: '220px' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          🔥 {t('offerings.boosted', 'Boosted')}
        </span>
        <span className="text-xs text-gray-500">📍 {formatDistance(distance)}</span>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          <span>{categoryIcon}</span>
          <span>{categoryLabel}</span>
        </span>
      </div>
      
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
          {offering.price_type === 'hourly' && <span className="text-xs font-normal">/h</span>}
        </div>
      </div>
      
      <h3 className="font-semibold text-gray-900 text-xs mb-3 line-clamp-2">{offering.title}</h3>
      
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/offerings/${offering.id}`);
          }}
          className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-all"
        >
          {t('offerings.viewProfile', 'View Profile')} →
        </button>
        <FavoriteButton
          itemType="offering"
          itemId={offering.id}
          size="sm"
          className="!rounded-lg"
        />
      </div>
    </div>
  );
};

const MapMarkers = ({ 
  tasks, 
  boostedOfferings, 
  userLocation, 
  locationName,
  manualLocationSet,
  onLocationSelect,
  searchRadius
}: {
  tasks: Task[];
  boostedOfferings: Offering[];
  userLocation: { lat: number; lng: number };
  locationName: string;
  manualLocationSet: boolean;
  onLocationSelect: (lat: number, lng: number) => void;
  searchRadius: number;
}) => {
  const { t } = useTranslation();
  const userLocationIcon = useMemo(() => createUserLocationIcon(), []);
  const tasksWithOffsets = useMemo(() => addMarkerOffsets(tasks), [tasks]);

  return (
    <>
      <MapController lat={userLocation.lat} lng={userLocation.lng} radius={searchRadius} />
      <LocationPicker onLocationSelect={onLocationSelect} />
      
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
        <Popup>
          <div className="p-1 text-center" style={{ width: '120px' }}>
            <p className="font-medium text-gray-900 text-sm">📍 {t('map.you', 'You')}</p>
            <p className="text-xs text-gray-500">{t('map.yourLocation', 'Your location')}</p>
          </div>
        </Popup>
      </Marker>
      
      {tasksWithOffsets.map((task) => {
        const budget = task.budget || task.reward || 0;
        const jobIcon = getJobPriceIcon(budget, task.is_urgent);
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
      
      {boostedOfferings.map((offering) => {
        const offeringIcon = getBoostedOfferingIcon(offering.category);
        
        return (
          <Marker 
            key={`offering-${offering.id}`} 
            position={[offering.latitude, offering.longitude]} 
            icon={offeringIcon}
          >
            <Popup>
              <OfferingMapPopup offering={offering} userLocation={userLocation} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

type LocationType = 'auto' | 'default' | 'manual';

const DEFAULT_FILTERS: CompactFilterValues = {
  minPrice: 0,
  maxPrice: 500,
  distance: 25,
  datePosted: 'all',
  category: 'all'
};

// =====================================================
// JOB CARD COMPONENT - For desktop list view
// =====================================================
const JobCard = ({ 
  task, 
  userLocation, 
  isMatching 
}: { 
  task: Task; 
  userLocation: { lat: number; lng: number }; 
  isMatching?: boolean;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
  const budget = task.budget || task.reward || 0;
  const categoryIcon = getCategoryIcon(task.category);
  const categoryLabel = getCategoryLabel(task.category);
  const applicantsCount = task.applications_count || 0;

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer ${
        task.is_urgent ? 'border-red-200 ring-1 ring-red-100' : 
        isMatching ? 'border-blue-200 ring-1 ring-blue-100' : 
        'border-gray-100'
      }`}
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <div className="p-4">
        {/* Top badges row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {task.is_urgent && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
              ⚡ {t('tasks.urgent', 'URGENT')}
            </span>
          )}
          {isMatching && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              ✨ {t('tasks.matchesYou', 'Matches your skills')}
            </span>
          )}
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
            {categoryIcon} {categoryLabel}
          </span>
        </div>

        {/* Title and price row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{task.title}</h3>
          <span className={`text-xl font-bold whitespace-nowrap ${
            budget <= 25 ? 'text-green-600' : 
            budget <= 75 ? 'text-blue-600' : 
            'text-purple-600'
          }`}>
            €{budget}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{task.description}</p>

        {/* Meta info row */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            📍 {formatDistance(distance)}
          </span>
          <span className="flex items-center gap-1">
            🕐 {task.created_at ? formatTimeAgo(task.created_at, t) : t('tasks.new', 'New')}
          </span>
          <span className="flex items-center gap-1">
            👥 {applicantsCount} {t('tasks.applicants', 'applicants')}
          </span>
        </div>

        {/* Location and creator */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 truncate flex-1">
            📍 {task.location?.split(',').slice(0, 2).join(', ') || t('tasks.nearby', 'Nearby')}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">
              👤 {task.creator_name || t('tasks.anonymous', 'Anonymous')}
            </span>
            <FavoriteButton
              itemType="task"
              itemId={task.id}
              size="sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// OFFERING CARD COMPONENT - For desktop list view
// =====================================================
const OfferingCard = ({ 
  offering, 
  userLocation 
}: { 
  offering: Offering; 
  userLocation: { lat: number; lng: number };
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const distance = calculateDistance(userLocation.lat, userLocation.lng, offering.latitude, offering.longitude);
  const categoryIcon = getCategoryIcon(offering.category);
  const categoryLabel = getCategoryLabel(offering.category);

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
      onClick={() => navigate(`/offerings/${offering.id}`)}
    >
      <div className="p-4">
        {/* Top badges row */}
        <div className="flex items-center gap-2 mb-3">
          {offering.is_boosted && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
              🔥 {t('offerings.boosted', 'Boosted')}
            </span>
          )}
          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium flex items-center gap-1">
            {categoryIcon} {categoryLabel}
          </span>
        </div>

        {/* Provider info and price */}
        <div className="flex items-start gap-3 mb-3">
          {offering.creator_avatar ? (
            <img 
              src={offering.creator_avatar} 
              alt={offering.creator_name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
              {offering.creator_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{offering.title}</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">{offering.creator_name}</span>
              {offering.creator_rating !== undefined && offering.creator_rating > 0 && (
                <span className="flex items-center gap-1">
                  <StarRating rating={offering.creator_rating} />
                  <span className="text-gray-400 text-xs">({offering.creator_rating.toFixed(1)})</span>
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-green-600">
              €{offering.price || 0}
            </span>
            {offering.price_type === 'hourly' && (
              <span className="text-sm text-gray-500">/h</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{offering.description}</p>

        {/* Meta info row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1">
              📍 {formatDistance(distance)}
            </span>
            <span className="flex items-center gap-1">
              🕐 {offering.created_at ? formatTimeAgo(offering.created_at, t) : t('tasks.new', 'New')}
            </span>
          </div>
          <FavoriteButton
            itemType="offering"
            itemId={offering.id}
            size="sm"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
};

// =====================================================
// MAIN TASKS COMPONENT WITH MOBILE/DESKTOP SWITCH
// =====================================================
const Tasks = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileTasksView />;
  }
  
  return <DesktopTasksView />;
};

// Desktop Tasks View
const DesktopTasksView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const toast = useToastStore();
  const { loadMyOfferings, isJobMatchingMyOfferings, myOfferingCategories } = useMatchingStore();
  
  const [activeTab, setActiveTab] = useState<'jobs' | 'offerings' | 'all'>('all');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [boostedOfferings, setBoostedOfferings] = useState<Offering[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: 56.9496, lng: 24.1052 });
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationType, setLocationType] = useState<LocationType>('default');
  const [manualLocationName, setManualLocationName] = useState<string | null>(null);
  const [addressSearch, setAddressSearch] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  
  const [showIntroModal, setShowIntroModal] = useState(false);
  
  const [filters, setFilters] = useState<CompactFilterValues>(() => {
    const saved = localStorage.getItem('taskAdvancedFilters');
    if (saved) {
      try {
        return { ...DEFAULT_FILTERS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_FILTERS;
      }
    }
    const savedRadius = localStorage.getItem('taskSearchRadius');
    if (savedRadius) {
      return { ...DEFAULT_FILTERS, distance: parseInt(savedRadius, 10) };
    }
    return DEFAULT_FILTERS;
  });
  
  const searchRadius = filters.distance;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  const hasFetchedRef = useRef(false);
  const hasEverLoadedRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('quickHelpIntroSeen');
    if (!hasSeenIntro) {
      setShowIntroModal(true);
    }
  }, []);

  const getLocationDisplayName = () => {
    switch (locationType) {
      case 'auto':
        return t('tasks.yourLocation', 'Your location');
      case 'manual':
        return manualLocationName || t('tasks.selectedLocation', 'Selected location');
      case 'default':
      default:
        return t('tasks.defaultLocation', 'Riga, Latvia');
    }
  };

  const locationName = getLocationDisplayName();
  const manualLocationSet = locationType === 'manual';

  useEffect(() => {
    if (isAuthenticated) {
      loadMyOfferings();
    }
  }, [isAuthenticated, loadMyOfferings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowLocationModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const skipLocationDetection = () => {
    setLocationLoading(false);
    setLocationGranted(true);
    setLocationType('default');
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }
  };

  useEffect(() => {
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
          setLocationType('auto');
          if (locationTimeoutRef.current) {
            clearTimeout(locationTimeoutRef.current);
          }
        },
        (error) => {
          console.log('Geolocation error:', error);
          setLocationGranted(true);
          setLocationLoading(false);
          setLocationType('default');
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
    setLocationType('manual');
    setManualLocationName(name || null);
    hasFetchedRef.current = false;
    fetchData(true);
    setShowLocationModal(false);
  };

  const handleFiltersChange = (newFilters: CompactFilterValues) => {
    const distanceChanged = newFilters.distance !== filters.distance;
    const categoryChanged = newFilters.category !== filters.category;
    
    setFilters(newFilters);
    localStorage.setItem('taskAdvancedFilters', JSON.stringify(newFilters));
    localStorage.setItem('taskSearchRadius', newFilters.distance.toString());
    
    if (distanceChanged || categoryChanged) {
      hasFetchedRef.current = false;
      fetchData(true, newFilters.distance, newFilters.category);
    }
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
    setLocationType('auto');
    setManualLocationName(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        hasFetchedRef.current = false;
        fetchData(true);
      });
    }
  };

  const fetchData = async (forceRefresh = false, radiusOverride?: number, categoryOverride?: string) => {
    if (hasFetchedRef.current && !forceRefresh) return;
    
    if (!hasEverLoadedRef.current) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    
    try {
      const baseRadius = radiusOverride ?? searchRadius;
      const selectedCategory = categoryOverride ?? filters.category;
      const effectiveRadius = baseRadius === 0 ? 500 : baseRadius;
      
      const tasksResponse = await getTasks({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radius: effectiveRadius,
        status: 'open',
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });
      
      const tasksWithIcons = tasksResponse.tasks.map(task => ({
        ...task,
        icon: getCategoryIcon(task.category)
      }));
      
      setTasks(tasksWithIcons);
      
      try {
        const offeringsResponse = await getOfferings({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: effectiveRadius,
          status: 'active',
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        });
        setOfferings(offeringsResponse.offerings || []);
      } catch (err) {
        console.log('Offerings API not available yet');
        setOfferings([]);
      }
      
      try {
        const boostedResponse = await getBoostedOfferings({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: effectiveRadius,
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        });
        setBoostedOfferings(boostedResponse.offerings || []);
      } catch (err) {
        console.log('Boosted offerings API not available yet');
        setBoostedOfferings([]);
      }
      
      hasFetchedRef.current = true;
      hasEverLoadedRef.current = true;
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t('tasks.errorLoad', 'Failed to load data. Please try again later.'));
    }
    
    setInitialLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (locationGranted) fetchData();
  }, [locationGranted]);

  const filterTasks = (taskList: Task[]) => {
    let filtered = taskList;
    
    filtered = filtered.filter(task => {
      const matchesSearch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
    
    filtered = filterByPrice(filtered, filters.minPrice, filters.maxPrice, 500);
    filtered = filterByDate(filtered, filters.datePosted);
    
    filtered = filtered.sort((a, b) => {
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
    
    return filtered;
  };

  const filterOfferings = (offeringList: Offering[]) => {
    let filtered = offeringList;
    
    filtered = filtered.filter(offering => {
      const matchesSearch = searchQuery === '' || 
        offering.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offering.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offering.experience && offering.experience.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesSearch;
    });
    
    filtered = filterByPrice(filtered, filters.minPrice, filters.maxPrice, 500);
    filtered = filterByDate(filtered, filters.datePosted);
    
    return filtered;
  };

  if (locationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">📍</div>
          </div>
          <div className="text-xl font-bold text-gray-900 mb-2">{t('tasks.findingLocation', 'Finding your location...')}</div>
          <div className="text-gray-600 mb-4">{t('tasks.locationHelp', 'This helps show nearby jobs and services')}</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <button 
            onClick={skipLocationDetection}
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            {t('tasks.skipLocation', 'Skip → Use Riga as default')}
          </button>
        </div>
      </div>
    );
  }

  if (initialLoading && !hasEverLoadedRef.current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <div className="text-xl font-bold text-gray-900 mb-2">💰 {t('tasks.findingOpportunities', 'Finding opportunities...')}</div>
          <div className="text-gray-600">
            {searchRadius === 0 
              ? t('tasks.searchingAllLatvia', 'Searching all of Latvia')
              : t('tasks.searchingWithin', 'Searching within {{radius}}km of {{location}}', { radius: searchRadius, location: locationName })
            }
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-5xl mb-4">⚠️</div>
          <div className="text-2xl font-bold text-red-600 mb-2">{t('tasks.errorTitle', 'Oops!')}</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button onClick={() => { hasFetchedRef.current = false; fetchData(true); }} className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors">
            {t('tasks.tryAgain', 'Try Again')}
          </button>
        </div>
      </div>
    );
  }

  const filteredTasks = filterTasks(tasks);
  const filteredOfferings = filterOfferings(offerings);
  
  const matchingJobsCount = isAuthenticated 
    ? filteredTasks.filter(t => isJobMatchingMyOfferings(t.category)).length 
    : 0;
  
  const urgentJobsCount = filteredTasks.filter(t => t.is_urgent).length;

  const getMapMarkers = () => {
    if (activeTab === 'jobs') return { tasks: filteredTasks, boostedOfferings: [] };
    if (activeTab === 'offerings') return { tasks: [], boostedOfferings: boostedOfferings };
    return { tasks: filteredTasks, boostedOfferings: boostedOfferings };
  };

  const { tasks: mapTasks, boostedOfferings: mapBoostedOfferings } = getMapMarkers();
  
  const maxBudget = Math.max(...filteredTasks.map(t => t.budget || t.reward || 0), 0);
  const hasHighValueJobs = filteredTasks.some(t => (t.budget || t.reward || 0) > 75);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tasks.title', 'Quick Help')}</h1>
              <p className="text-gray-600">{t('tasks.subtitle', 'Find jobs nearby and earn money')} 💰</p>
            </div>
            <button
              onClick={() => setShowIntroModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
              title={t('quickHelp.howItWorks', 'How it works')}
            >
              <span>❓</span>
              <span className="hidden sm:inline">{t('quickHelp.howItWorks', 'How it works')}</span>
            </button>
          </div>
          <div className="flex gap-3 flex-wrap">
            {isAuthenticated ? (
              <>
                <button onClick={() => navigate('/tasks/create')} className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 font-medium transition-colors flex items-center gap-2">
                  <span>💰</span> {t('tasks.postJob', 'Post a Job')}
                </button>
                <button onClick={() => navigate('/offerings/create')} className="bg-amber-500 text-white px-5 py-2.5 rounded-lg hover:bg-amber-600 font-medium transition-colors flex items-center gap-2">
                  <span>👋</span> {t('tasks.offerService', 'Offer Service')}
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium transition-colors">
                {t('tasks.loginToPost', 'Login to Post Jobs or Offer Services')}
              </button>
            )}
          </div>
        </div>

        {/* Urgent jobs banner */}
        {urgentJobsCount > 0 && (
          <div className="mb-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-semibold">{t('tasks.urgentJobsAvailable', '{{count}} urgent job(s) need help ASAP!', { count: urgentJobsCount })}</p>
                  <p className="text-red-100 text-sm">{t('tasks.urgentJobsDesc', 'These jobs are time-sensitive and need immediate attention')}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('jobs')}
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors whitespace-nowrap"
              >
                {t('tasks.viewUrgentJobs', 'View Urgent Jobs')} →
              </button>
            </div>
          </div>
        )}

        {/* Matching notification banner */}
        {isAuthenticated && matchingJobsCount > 0 && myOfferingCategories.length > 0 && (
          <div className="mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-semibold">{t('tasks.matchingJobs', '{{count}} job(s) match your offerings!', { count: matchingJobsCount })}</p>
                  <p className="text-blue-100 text-sm">{t('tasks.basedOnServices', 'Based on your services')}: {myOfferingCategories.map(c => getCategoryLabel(c)).join(', ')}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('jobs')}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                {t('tasks.viewMatchingJobs', 'View Matching Jobs')} →
              </button>
            </div>
          </div>
        )}

        {/* Compact Filter Bar */}
        <div className="mb-4 relative" style={{ zIndex: 1000 }}>
          <CompactFilterBar
            filters={filters}
            onChange={handleFiltersChange}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
            locationName={locationName}
            onLocationClick={() => setShowLocationModal(!showLocationModal)}
            maxPriceLimit={500}
            categoryOptions={CATEGORY_OPTIONS}
            variant={activeTab === 'offerings' ? 'offerings' : 'jobs'}
          />
          
          {/* Location Search Modal */}
          {showLocationModal && (
            <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50" ref={suggestionsRef}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">📍 {t('tasks.changeLocation', 'Change Location')}</label>
                <input 
                  type="text" 
                  value={addressSearch} 
                  onChange={(e) => handleAddressInputChange(e.target.value)} 
                  placeholder={t('tasks.searchAddress', 'Search address or city...')} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  autoFocus
                />
                {searchingAddress && <span className="text-sm text-gray-500 mt-1">{t('common.loading', 'Searching...')}</span>}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {suggestions.map((suggestion, index) => (
                    <button 
                      key={index} 
                      onClick={() => selectSuggestion(suggestion)} 
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b last:border-b-0 text-sm"
                    >
                      {suggestion.display_name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                {manualLocationSet && (
                  <button onClick={resetToAutoLocation} className="text-sm text-blue-600 hover:underline">
                    {t('tasks.resetLocation', 'Reset to auto-detect')}
                  </button>
                )}
                <button 
                  onClick={() => setShowLocationModal(false)} 
                  className="ml-auto text-sm text-gray-500 hover:text-gray-700"
                >
                  {t('common.close', 'Close')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2 flex-wrap relative" style={{ zIndex: 1 }}>
          <button onClick={() => setActiveTab('all')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            🌐 {t('common.all', 'All')} ({filteredTasks.length + filteredOfferings.length})
          </button>
          <button onClick={() => setActiveTab('jobs')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors relative ${activeTab === 'jobs' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            💰 {t('common.jobs', 'Jobs')} ({filteredTasks.length})
            {urgentJobsCount > 0 && activeTab !== 'jobs' && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {urgentJobsCount} ⚡
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('offerings')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'offerings' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            👋 {t('common.offerings', 'Offerings')} ({filteredOfferings.length})
          </button>
          
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-500 ml-auto">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>{t('tasks.updating', 'Updating...')}</span>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b flex flex-wrap items-center gap-4 text-sm">
            <span className="font-semibold text-gray-700">{t('map.legend', 'Map')}:</span>
            
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow" style={{ transform: 'rotate(-45deg)', borderRadius: '50% 50% 50% 0' }}></div>
              <span className="text-gray-600">{t('map.you', 'You')}</span>
            </div>
            
            {searchRadius === 0 && (
              <div className="flex items-center gap-1.5 bg-blue-100 px-2 py-1 rounded-full">
                <span className="text-sm">🇱🇻</span>
                <span className="text-blue-700 font-medium text-xs">{t('tasks.viewingAllLatvia', 'Viewing all of Latvia')}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-bold">€25</span>
              <span className="text-gray-500 text-xs">{t('map.quickTasks', 'Quick tasks')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-bold">€50</span>
              <span className="text-gray-500 text-xs">{t('map.mediumJobs', 'Medium')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-white rounded-full text-xs font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #d97706 100%)' }}>€100+</span>
              <span className="text-gray-500 text-xs">{t('map.premiumJobs', 'Premium')} ✨</span>
            </div>
            
            <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
              <span className="w-6 h-6 flex items-center justify-center text-white rounded-full text-sm" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>🧹</span>
              <span className="text-gray-500 text-xs">{t('map.boostedOfferings', 'Boosted services')}</span>
            </div>
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
                boostedOfferings={mapBoostedOfferings}
                userLocation={userLocation}
                locationName={locationName}
                manualLocationSet={manualLocationSet}
                onLocationSelect={(lat, lng) => handleLocationSelect(lat, lng)}
                searchRadius={searchRadius}
              />
            </MapContainer>
          </div>
          
          {(filteredTasks.length > 0 || mapBoostedOfferings.length > 0) && (
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium text-blue-700">
                💰 {t('tasks.jobsOnMap', '{{count}} job(s) on map', { count: mapTasks.length })}
              </span>
              {urgentJobsCount > 0 && (
                <span className="font-medium text-red-600">
                  ⚡ {t('tasks.urgentOnMap', '{{count}} urgent', { count: urgentJobsCount })}
                </span>
              )}
              {mapBoostedOfferings.length > 0 && (
                <span className="font-medium text-amber-700">
                  👋 {t('offerings.boostedOnMap', '{{count}} boosted service(s)', { count: mapBoostedOfferings.length })}
                </span>
              )}
              {maxBudget > 0 && (
                <span className="text-green-600">{t('tasks.topPayout', 'Top payout')}: €{maxBudget}</span>
              )}
              {hasHighValueJobs && (
                <span className="text-purple-600 font-medium">✨ {t('tasks.premiumAvailable', 'Premium jobs available!')}</span>
              )}
            </div>
          )}
        </div>

        {/* =====================================================
            LIST SECTION - Jobs and Offerings cards
            ===================================================== */}
        <div className="space-y-4">
          {/* Jobs Section */}
          {(activeTab === 'all' || activeTab === 'jobs') && (
            <>
              {activeTab === 'all' && filteredTasks.length > 0 && (
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  💰 {t('common.jobs', 'Jobs')}
                  <span className="text-sm font-normal text-gray-500">({filteredTasks.length})</span>
                </h2>
              )}
              
              {filteredTasks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('tasks.noJobsFound', 'No jobs found')}</h3>
                  <p className="text-gray-600">{t('tasks.tryDifferentFilters', 'Try adjusting your filters or search radius')}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            </>
          )}

          {/* Offerings Section */}
          {(activeTab === 'all' || activeTab === 'offerings') && (
            <>
              {activeTab === 'all' && filteredOfferings.length > 0 && (
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mt-8">
                  👋 {t('common.offerings', 'Offerings')}
                  <span className="text-sm font-normal text-gray-500">({filteredOfferings.length})</span>
                </h2>
              )}
              
              {filteredOfferings.length === 0 ? (
                activeTab === 'offerings' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="text-4xl mb-3">👋</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('offerings.noOfferingsFound', 'No offerings found')}</h3>
                    <p className="text-gray-600">{t('offerings.tryDifferentFilters', 'Try adjusting your filters or search radius')}</p>
                  </div>
                )
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredOfferings.map((offering) => (
                    <OfferingCard
                      key={offering.id}
                      offering={offering}
                      userLocation={userLocation}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Intro Modal */}
      <QuickHelpIntroModal
        isOpen={showIntroModal}
        onClose={() => setShowIntroModal(false)}
        showCheckboxes={!localStorage.getItem('quickHelpIntroSeen')}
      />
    </div>
  );
};

export default Tasks;
