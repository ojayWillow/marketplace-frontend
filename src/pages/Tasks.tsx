import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { useNavigate, Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { getTasks, getHelpers, Helper, Task as APITask } from '../api/tasks';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

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

// Category definitions
const CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: '📋' },
  { value: 'pet-care', label: 'Pet Care', icon: '🐕' },
  { value: 'moving', label: 'Moving', icon: '📦' },
  { value: 'shopping', label: 'Shopping', icon: '🛒' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'delivery', label: 'Delivery', icon: '📄' },
  { value: 'outdoor', label: 'Outdoor', icon: '🌿' },
];

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

const Tasks = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const toast = useToastStore();
  
  // Three main tabs: jobs, helpers, all
  const [activeTab, setActiveTab] = useState<'jobs' | 'helpers' | 'all'>('all');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: 56.9496, lng: 24.1052 });
  const [locationGranted, setLocationGranted] = useState(false);
  const [manualLocationSet, setManualLocationSet] = useState(false);
  const [addressSearch, setAddressSearch] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [searchRadius, setSearchRadius] = useState(25);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  const hasFetchedRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const savedRadius = localStorage.getItem('taskSearchRadius');
    if (savedRadius) {
      setSearchRadius(parseInt(savedRadius, 10));
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationGranted(true);
        },
        (error) => {
          console.log('Geolocation error:', error);
          setLocationGranted(true);
        }
      );
    } else {
      setLocationGranted(true);
    }
  }, []);

  const handleLocationSelect = (lat: number, lng: number, name?: string) => {
    setUserLocation({ lat, lng });
    setManualLocationSet(true);
    setLocationName(name || '');
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
    setLocationName('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        hasFetchedRef.current = false;
        fetchData(true);
      });
    }
  };

  const getCategoryIcon = (category: string): string => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.icon || '💼';
  };

  const fetchData = async (forceRefresh = false) => {
    if (hasFetchedRef.current && !forceRefresh) return;
    
    setLoading(true);
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
      
      // Fetch helpers
      try {
        const helpersResponse = await getHelpers({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: searchRadius,
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        });
        setHelpers(helpersResponse.helpers || []);
      } catch (err) {
        console.log('Helpers API not available yet');
        setHelpers([]);
      }
      
      hasFetchedRef.current = true;
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (locationGranted) fetchData();
  }, [locationGranted]);

  useEffect(() => {
    if (locationGranted) {
      hasFetchedRef.current = false;
      fetchData(true);
    }
  }, [selectedCategory]);
  
  const userLocationIcon = divIcon({
    className: 'custom-user-icon',
    html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const helperLocationIcon = divIcon({
    className: 'custom-helper-icon',
    html: '<div style="background: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const filterTasks = (taskList: Task[]) => {
    return taskList.filter(task => {
      const matchesSearch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  };

  const filterHelpers = (helperList: Helper[]) => {
    return helperList.filter(helper => {
      const matchesSearch = searchQuery === '' || 
        helper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (helper.bio && helper.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (helper.skills && helper.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
      
      return matchesSearch;
    });
  };

  if (loading && !locationGranted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">Loading...</div>
          <div className="text-gray-600">Getting your location</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">Loading...</div>
          <div className="text-gray-600">Finding nearby opportunities</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
          <button onClick={() => { hasFetchedRef.current = false; fetchData(true); }} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredTasks = filterTasks(tasks);
  const filteredHelpers = filterHelpers(helpers);

  // Get map markers based on active tab
  const getMapMarkers = () => {
    if (activeTab === 'jobs') return { tasks: filteredTasks, helpers: [] };
    if (activeTab === 'helpers') return { tasks: [], helpers: filteredHelpers };
    return { tasks: filteredTasks, helpers: filteredHelpers };
  };

  const { tasks: mapTasks, helpers: mapHelpers } = getMapMarkers();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Help</h1>
            <p className="text-gray-600">Find help or offer your services</p>
          </div>
          <div className="flex gap-3">
            {isAuthenticated && (
              <button onClick={() => navigate('/tasks/create')} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium">
                + Post a Job
              </button>
            )}
            {!isAuthenticated && (
              <button onClick={() => navigate('/login')} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium">
                Login to Get Started
              </button>
            )}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-4 bg-white rounded-lg shadow-md p-4" style={{ zIndex: 1000 }}>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search jobs or helpers..." className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button onClick={() => setShowLocationModal(!showLocationModal)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              <span>📍</span>
              <span className="text-sm text-gray-700">{manualLocationSet && locationName ? locationName.split(',')[0] : 'Auto-detected'}</span>
            </button>
            <select value={searchRadius} onChange={(e) => handleRadiusChange(parseInt(e.target.value, 10))} className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
            <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 rounded-lg border transition-colors ${showFilters ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
              ⚙️
            </button>
          </div>
          
          {showLocationModal && (
            <div className="mt-3 p-3 bg-blue-50 border-t border-blue-200 rounded-lg" ref={suggestionsRef}>
              <div className="mb-2">
                <input type="text" value={addressSearch} onChange={(e) => handleAddressInputChange(e.target.value)} placeholder="Search address or city..." className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                {searchingAddress && <span className="text-sm text-blue-600">Searching...</span>}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-lg">
                  {suggestions.map((suggestion, index) => (
                    <button key={index} onClick={() => selectSuggestion(suggestion)} className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b last:border-b-0">
                      <span className="text-sm">{suggestion.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
              {manualLocationSet && (
                <button onClick={resetToAutoLocation} className="mt-2 text-sm text-blue-600 hover:underline">Reset to auto-detect</button>
              )}
            </div>
          )}
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* THREE TABS: Jobs, Helpers, All */}
        <div className="mb-6 flex gap-2 flex-wrap relative" style={{ zIndex: 1 }}>
          <button onClick={() => setActiveTab('all')} className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            🌐 All ({filteredTasks.length + filteredHelpers.length})
          </button>
          <button onClick={() => setActiveTab('jobs')} className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'jobs' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            💼 Jobs ({filteredTasks.length})
          </button>
          <button onClick={() => setActiveTab('helpers')} className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'helpers' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            🤝 Helpers ({filteredHelpers.length})
          </button>
        </div>

        {/* MAP */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6" style={{ height: '400px' }}>
          <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapRecenter lat={userLocation.lat} lng={userLocation.lng} />
            <LocationPicker onLocationSelect={(lat, lng) => handleLocationSelect(lat, lng)} />
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
              <Popup>
                <div className="p-2">
                  <p className="font-bold">📍 Your Location</p>
                  {locationName && <p className="text-sm text-gray-600">{locationName}</p>}
                  <p className="text-xs text-gray-500">{manualLocationSet ? '(Manually set)' : '(Auto-detected)'}</p>
                </div>
              </Popup>
            </Marker>
            {/* Task markers (blue) */}
            {mapTasks.map((task) => (
              <Marker key={`task-${task.id}`} position={[task.latitude, task.longitude]}>
                <Popup>
                  <div className="p-2">
                    <Link to={`/tasks/${task.id}`} className="font-bold text-lg mb-1 text-blue-600 hover:text-blue-800 hover:underline">{task.title}</Link>
                    <p className="text-sm text-gray-600 mb-2">{task.description.substring(0, 100)}...</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-600 font-bold">€{task.budget || task.reward || 0}</span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">{task.category}</span>
                    </div>
                    <Link to={`/tasks/${task.id}`} className="text-xs text-blue-500 hover:text-blue-700">View Details →</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
            {/* Helper markers (green) */}
            {mapHelpers.map((helper) => (
              <Marker key={`helper-${helper.id}`} position={[helper.latitude || userLocation.lat, helper.longitude || userLocation.lng]} icon={helperLocationIcon}>
                <Popup>
                  <div className="p-2">
                    <Link to={`/users/${helper.id}`} className="font-bold text-lg mb-1 text-green-600 hover:text-green-800 hover:underline">{helper.name}</Link>
                    <p className="text-sm text-gray-600 mb-2">{helper.bio?.substring(0, 100) || 'Available for help'}...</p>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={helper.rating || 0} />
                      <span className="text-sm text-gray-500">({helper.review_count || 0})</span>
                    </div>
                    <Link to={`/users/${helper.id}`} className="text-xs text-green-500 hover:text-green-700">View Profile →</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Helpers</span>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {activeTab === 'all' && 'Jobs & Helpers'}
            {activeTab === 'jobs' && 'Available Jobs'}
            {activeTab === 'helpers' && 'Available Helpers'}
            {searchQuery && <span className="text-sm font-normal text-gray-500 ml-2">• Searching: "{searchQuery}"</span>}
          </h2>
          
          {/* Jobs Section (shown in 'all' and 'jobs' tabs) */}
          {(activeTab === 'all' || activeTab === 'jobs') && (
            <div className="mb-8">
              {activeTab === 'all' && <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">💼 Jobs <span className="text-sm font-normal text-gray-500">({filteredTasks.length})</span></h3>}
              
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">💼</div>
                  <p>No jobs found in your area</p>
                  {isAuthenticated && (
                    <button onClick={() => navigate('/tasks/create')} className="mt-4 text-blue-500 hover:text-blue-600 underline">Post the first job</button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredTasks.map((task) => (
                    <JobCard key={task.id} task={task} userLocation={userLocation} />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Helpers Section (shown in 'all' and 'helpers' tabs) */}
          {(activeTab === 'all' || activeTab === 'helpers') && (
            <div>
              {activeTab === 'all' && <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">🤝 Helpers <span className="text-sm font-normal text-gray-500">({filteredHelpers.length})</span></h3>}
              
              {filteredHelpers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">🤝</div>
                  <p>No helpers available in your area yet</p>
                  {isAuthenticated && (
                    <Link to="/profile" className="mt-4 text-green-500 hover:text-green-600 underline block">Become a helper</Link>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredHelpers.map((helper) => (
                    <HelperCard key={helper.id} helper={helper} userLocation={userLocation} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* CTA for logged-in users */}
        {isAuthenticated && (
          <div className="mt-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Manage Your Activity</h3>
                <p className="text-blue-100">View your posted jobs, applications, and helper profile in your profile page.</p>
              </div>
              <Link to="/profile" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors whitespace-nowrap">
                Go to Profile →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Job Card Component
const JobCard = ({ task, userLocation }: { task: Task; userLocation: { lat: number; lng: number } }) => {
  const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
  
  return (
    <Link to={`/tasks/${task.id}`} className="block border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{task.icon}</span>
            <h4 className="text-lg font-semibold text-gray-900">{task.title}</h4>
          </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">📍 {distance.toFixed(1)}km</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{task.category}</span>
          </div>
          {task.creator_name && (
            <p className="text-xs text-gray-500 mt-2">Posted by {task.creator_name}</p>
          )}
        </div>
        <div className="text-right ml-4">
          <div className="text-xl font-bold text-green-600">€{task.budget || task.reward || 0}</div>
        </div>
      </div>
    </Link>
  );
};

// Helper Card Component
const HelperCard = ({ helper, userLocation }: { helper: Helper; userLocation: { lat: number; lng: number } }) => {
  const distance = helper.latitude && helper.longitude 
    ? calculateDistance(userLocation.lat, userLocation.lng, helper.latitude, helper.longitude)
    : null;
  
  return (
    <Link to={`/users/${helper.id}`} className="block border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-green-300 transition-all">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {helper.avatar ? (
            <img src={helper.avatar} alt={helper.name} className="w-14 h-14 rounded-full object-cover border-2 border-green-200" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold">
              {helper.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{helper.name}</h4>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <StarRating rating={helper.rating || 0} />
            <span className="text-sm text-gray-500">({helper.review_count || 0})</span>
          </div>
          
          {/* Skills */}
          {helper.skills && helper.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {helper.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{skill}</span>
              ))}
              {helper.skills.length > 3 && (
                <span className="text-xs text-gray-500">+{helper.skills.length - 3}</span>
              )}
            </div>
          )}
          
          {/* Distance & Stats */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {distance !== null && <span>📍 {distance.toFixed(1)}km</span>}
            <span>✅ {helper.completed_tasks || 0} tasks</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Tasks;
