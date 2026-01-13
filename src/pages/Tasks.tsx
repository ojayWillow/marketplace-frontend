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