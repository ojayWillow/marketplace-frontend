import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { useNavigate, Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { getTasks, applyToTask, getMyTasks, getCreatedTasks, markTaskDone, confirmTaskCompletion, disputeTask, cancelTask, getTaskApplications, acceptApplication, rejectApplication, Task as APITask, TaskApplication } from '../api/tasks';
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
  applicationCount?: number;
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
  const distance = R * c;
  return distance;
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

const Tasks = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const toast = useToastStore();
  
  // NEW: Simplified to 2 tabs
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [postedTasks, setPostedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingTask, setApplyingTask] = useState<number | null>(null);
  const [processingTask, setProcessingTask] = useState<number | null>(null);
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
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Application management state
  const [viewingApplications, setViewingApplications] = useState<number | null>(null);
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  
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
    fetchTasks(true);
    setShowLocationModal(false);
  };

  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    localStorage.setItem('taskSearchRadius', newRadius.toString());
    hasFetchedRef.current = false;
    fetchTasks(true);
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
        fetchTasks(true);
      });
    }
  };

  const getCategoryIcon = (category: string): string => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.icon || '💼';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; label: string } } = {
      'open': { color: 'bg-green-100 text-green-700', label: 'Open' },
      'assigned': { color: 'bg-blue-100 text-blue-700', label: 'In Progress' },
      'in_progress': { color: 'bg-blue-100 text-blue-700', label: 'In Progress' },
      'pending_confirmation': { color: 'bg-yellow-100 text-yellow-700', label: 'Awaiting Confirmation' },
      'completed': { color: 'bg-gray-100 text-gray-700', label: 'Completed' },
      'disputed': { color: 'bg-red-100 text-red-700', label: 'Disputed' },
      'cancelled': { color: 'bg-gray-100 text-gray-500', label: 'Cancelled' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700', label: status };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const fetchTasks = async (forceRefresh = false) => {
    if (hasFetchedRef.current && !forceRefresh) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const availableResponse = await getTasks({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radius: searchRadius,
        status: 'open',
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });
      
      const filteredTasks = availableResponse.tasks.filter(task => {
        if (!user?.id) return true;
        return task.creator_id !== user.id;
      });
      
      const tasksWithIcons = filteredTasks.map(task => ({
        ...task,
        icon: getCategoryIcon(task.category)
      }));
      
      setTasks(tasksWithIcons);
      hasFetchedRef.current = true;
    } catch (err) {
      console.error('Error fetching available tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    }
    
    if (isAuthenticated && user?.id) {
      try {
        const myTasksResponse = await getMyTasks();
        const userTasks = myTasksResponse.tasks
          .filter(t => !['completed', 'cancelled'].includes(t.status)) // Filter out completed/cancelled
          .map(task => {
            const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
            return { ...task, icon: getCategoryIcon(task.category), distance };
          });
        setMyTasks(userTasks);
        
        const createdResponse = await getCreatedTasks();
        const createdTasks = createdResponse.tasks
          .filter(t => !['completed', 'cancelled'].includes(t.status)) // Filter out completed/cancelled
          .map(task => ({
            ...task,
            icon: getCategoryIcon(task.category)
          }));
        setPostedTasks(createdTasks);
      } catch (err: any) {
        if (err?.response?.status !== 401) {
          console.error('Error fetching user tasks:', err);
        }
        setMyTasks([]);
        setPostedTasks([]);
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (locationGranted) fetchTasks();
  }, [locationGranted, isAuthenticated]);

  useEffect(() => {
    if (locationGranted) {
      hasFetchedRef.current = false;
      fetchTasks(true);
    }
  }, [user?.id, selectedCategory]);

  useEffect(() => {
    if (locationGranted && myTasks.length > 0) {
      const updatedMyTasks = myTasks.map(task => {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
        return { ...task, distance };
      });
      setMyTasks(updatedMyTasks);
    }
  }, [userLocation]);

  const createCustomIcon = (category: string) => new Icon.Default();
  
  const userLocationIcon = divIcon({
    className: 'custom-user-icon',
    html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const handleApplyTask = async (taskId: number) => {
    if (!isAuthenticated) {
      toast.warning('Please login to apply');
      navigate('/login');
      return;
    }

    try {
      setApplyingTask(taskId);
      await applyToTask(taskId);
      toast.success('Application submitted! The task owner will review your application.');
      hasFetchedRef.current = false;
      await fetchTasks(true);
    } catch (error: any) {
      console.error('Error applying to task:', error);
      toast.error(error?.response?.data?.error || 'Failed to apply. Please try again.');
    } finally {
      setApplyingTask(null);
    }
  };

  const handleViewApplications = async (taskId: number) => {
    setLoadingApplications(true);
    setViewingApplications(taskId);
    try {
      const response = await getTaskApplications(taskId);
      setApplications(response.applications);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
      setViewingApplications(null);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleAcceptApplication = async (taskId: number, applicationId: number) => {
    try {
      await acceptApplication(taskId, applicationId);
      toast.success('Application accepted! Task has been assigned.');
      setViewingApplications(null);
      hasFetchedRef.current = false;
      await fetchTasks(true);
    } catch (error: any) {
      console.error('Error accepting application:', error);
      toast.error(error?.response?.data?.error || 'Failed to accept application');
    }
  };

  const handleRejectApplication = async (taskId: number, applicationId: number) => {
    try {
      await rejectApplication(taskId, applicationId);
      toast.success('Application rejected');
      const response = await getTaskApplications(taskId);
      setApplications(response.applications);
    } catch (error: any) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const handleMarkDone = async (taskId: number) => {
    try {
      setProcessingTask(taskId);
      await markTaskDone(taskId);
      toast.success('Task marked as done! Waiting for the client to confirm.');
      hasFetchedRef.current = false;
      await fetchTasks(true);
    } catch (error: any) {
      console.error('Error marking task done:', error);
      toast.error(error?.response?.data?.error || 'Failed to mark task as done.');
    } finally {
      setProcessingTask(null);
    }
  };

  const handleConfirmCompletion = async (taskId: number) => {
    try {
      setProcessingTask(taskId);
      await confirmTaskCompletion(taskId);
      toast.success('Task completed! Thank you.');
      hasFetchedRef.current = false;
      await fetchTasks(true);
    } catch (error: any) {
      console.error('Error confirming task:', error);
      toast.error(error?.response?.data?.error || 'Failed to confirm task completion.');
    } finally {
      setProcessingTask(null);
    }
  };

  const handleDispute = async (taskId: number) => {
    const reason = prompt('Please describe the issue:');
    if (reason === null) return;
    
    try {
      setProcessingTask(taskId);
      await disputeTask(taskId, reason);
      toast.warning('Task has been disputed.');
      hasFetchedRef.current = false;
      await fetchTasks(true);
    } catch (error: any) {
      console.error('Error disputing task:', error);
      toast.error(error?.response?.data?.error || 'Failed to dispute task.');
    } finally {
      setProcessingTask(null);
    }
  };

  const handleCancelTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to cancel this task?')) return;
    
    try {
      setProcessingTask(taskId);
      await cancelTask(taskId);
      toast.success('Task has been cancelled.');
      hasFetchedRef.current = false;
      await fetchTasks(true);
    } catch (error: any) {
      console.error('Error cancelling task:', error);
      toast.error(error?.response?.data?.error || 'Failed to cancel task.');
    } finally {
      setProcessingTask(null);
    }
  };

  const handleEditTask = (taskId: number) => {
    navigate(`/tasks/${taskId}/edit`);
  };

  const getNavigationUrl = (task: Task) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${task.latitude},${task.longitude}`;
  };

  const filterTasks = (taskList: Task[]) => {
    return taskList.filter(task => {
      const matchesSearch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const taskPrice = task.budget || task.reward || 0;
      const matchesPrice = taskPrice >= priceRange.min && taskPrice <= priceRange.max;
      
      return matchesSearch && matchesPrice;
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
          <div className="text-2xl font-bold text-gray-900 mb-2">Loading tasks...</div>
          <div className="text-gray-600">Finding nearby Quick Help opportunities</div>
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
          <button onClick={() => { hasFetchedRef.current = false; fetchTasks(true); }} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // NEW: Combined active tasks (my tasks + posted tasks)
  const combinedActiveTasks = [...myTasks, ...postedTasks];
  const rawDisplayTasks = activeTab === 'available' ? tasks : combinedActiveTasks;
  const displayTasks = filterTasks(rawDisplayTasks);
  const mapTasks = displayTasks.filter(task => !['completed', 'cancelled'].includes(task.status));
  const pendingConfirmation = postedTasks.filter(t => t.status === 'pending_confirmation');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Help</h1>
            <p className="text-gray-600">Browse nearby tasks and earn money by helping others</p>
          </div>
          {isAuthenticated ? (
            <button onClick={() => navigate('/tasks/create')} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium">
              + Create Task
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium">
              Login to Create Task
            </button>
          )}
        </div>

        {/* SINGLE UNIFIED BAR */}
        <div className="mb-4 bg-white rounded-lg shadow-md p-4" style={{ zIndex: 1000 }}>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tasks..." className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (€)</label>
                <input type="number" min="0" value={priceRange.min} onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (€)</label>
                <input type="number" min="0" value={priceRange.max} onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 1000 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}
        </div>

        {pendingConfirmation.length > 0 && activeTab !== 'active' && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              📢 You have {pendingConfirmation.length} task(s) waiting for your confirmation!
              <button onClick={() => setActiveTab('active')} className="ml-2 text-yellow-600 underline hover:text-yellow-700">View now</button>
            </p>
          </div>
        )}

        {/* NEW: Simplified 2-tab system */}
        <div className="mb-6 flex gap-2 flex-wrap relative" style={{ zIndex: 1 }}>
          <button onClick={() => setActiveTab('available')} className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'available' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
            Available Tasks ({filterTasks(tasks).length})
          </button>
          {isAuthenticated && (
            <button onClick={() => setActiveTab('active')} className={`px-6 py-2 rounded-lg font-medium transition-colors relative ${activeTab === 'active' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              My Active Tasks ({combinedActiveTasks.length})
              {pendingConfirmation.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{pendingConfirmation.length}</span>
              )}
            </button>
          )}
        </div>

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
            {mapTasks.map((task) => (
              <Marker key={task.id} position={[task.latitude, task.longitude]} icon={createCustomIcon(task.category)}>
                <Popup>
                  <div className="p-2">
                    <Link to={`/tasks/${task.id}`} className="font-bold text-lg mb-1 text-blue-600 hover:text-blue-800 hover:underline">{task.title}</Link>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-600 font-bold">€{task.budget || task.reward || 0}</span>
                      {getStatusBadge(task.status)}
                    </div>
                    <Link to={`/tasks/${task.id}`} className="text-xs text-blue-500 hover:text-blue-700">View Details →</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {activeTab === 'available' ? 'Available Tasks' : 'My Active Tasks'}
            {searchQuery && <span className="text-sm font-normal text-gray-500 ml-2">• Searching: "{searchQuery}"</span>}
          </h2>
          
          {displayTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">{activeTab === 'available' ? '🔍' : '📋'}</div>
              <p>
                {activeTab === 'available'
                  ? searchQuery ? `No tasks found matching "${searchQuery}"` : `No tasks available within ${searchRadius}km.`
                  : "You don't have any active tasks."}
              </p>
              {activeTab === 'available' && (searchQuery || selectedCategory !== 'all') && (
                <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="mt-4 text-blue-500 hover:text-blue-600 underline">Clear filters</button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayTasks.map((task) => {
                // Determine which view mode based on task ownership
                const isMyAcceptedTask = myTasks.some(t => t.id === task.id);
                const isMyPostedTask = postedTasks.some(t => t.id === task.id);
                
                return (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    viewMode={activeTab === 'available' ? 'available' : isMyPostedTask ? 'posted' : 'accepted'}
                    processingTask={processingTask} 
                    applyingTask={applyingTask}
                    onApply={handleApplyTask} 
                    onMarkDone={handleMarkDone} 
                    onConfirm={handleConfirmCompletion} 
                    onDispute={handleDispute}
                    onCancel={handleCancelTask} 
                    onEdit={handleEditTask} 
                    onViewApplications={handleViewApplications}
                    getStatusBadge={getStatusBadge} 
                    getNavigationUrl={getNavigationUrl} 
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Application Modal */}
        {viewingApplications && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setViewingApplications(null)}>
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Applications</h3>
                <button onClick={() => setViewingApplications(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              {loadingApplications ? (
                <p className="text-center py-8 text-gray-500">Loading...</p>
              ) : applications.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {applications.map(app => (
                    <div key={app.id} className={`border rounded-lg p-4 ${app.status === 'accepted' ? 'bg-green-50 border-green-200' : app.status === 'rejected' ? 'bg-gray-50' : 'bg-white'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{app.applicant_name}</p>
                          <p className="text-sm text-gray-600">{app.applicant_email}</p>
                          {app.message && <p className="text-sm text-gray-700 mt-2">"{app.message}"</p>}
                          <p className="text-xs text-gray-500 mt-1">{new Date(app.created_at).toLocaleString()}</p>
                        </div>
                        <div className="ml-4">
                          {app.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button onClick={() => handleAcceptApplication(viewingApplications, app.id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">✓ Accept</button>
                              <button onClick={() => handleRejectApplication(viewingApplications, app.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">× Reject</button>
                            </div>
                          ) : (
                            <span className={`text-sm font-medium px-2 py-1 rounded ${app.status === 'accepted' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                              {app.status === 'accepted' ? '✓ Accepted' : '× Rejected'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  viewMode: 'available' | 'accepted' | 'posted';
  processingTask: number | null;
  applyingTask: number | null;
  onApply: (taskId: number) => void;
  onMarkDone: (taskId: number) => void;
  onConfirm: (taskId: number) => void;
  onDispute: (taskId: number) => void;
  onCancel: (taskId: number) => void;
  onEdit: (taskId: number) => void;
  onViewApplications: (taskId: number) => void;
  getStatusBadge: (status: string) => JSX.Element;
  getNavigationUrl: (task: Task) => string;
}

const TaskCard = ({ task, viewMode, processingTask, applyingTask, onApply, onMarkDone, onConfirm, onDispute, onCancel, onEdit, onViewApplications, getStatusBadge, getNavigationUrl }: TaskCardProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{task.icon}</span>
            <Link to={`/tasks/${task.id}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600 hover:underline">{task.title}</Link>
            {getStatusBadge(task.status)}
          </div>
          <p className="text-gray-600 mb-2 line-clamp-2">{task.description}</p>
          <div className="flex items-center gap-4 text-sm mb-2">
            <span className="text-gray-500">📍 {task.distance?.toFixed(1) || '0.0'}km away</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{task.category}</span>
          </div>
          <p className="text-xs text-gray-500">📍 {task.location}</p>
          <Link to={`/tasks/${task.id}`} className="text-sm text-blue-500 hover:text-blue-700 mt-2 inline-block">View Details →</Link>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-green-600 mb-2">€{task.budget || task.reward || 0}</div>
          
          {/* Available Tasks - Apply button */}
          {viewMode === 'available' && (
            <button onClick={(e) => { e.preventDefault(); onApply(task.id); }} disabled={applyingTask === task.id}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {applyingTask === task.id ? 'Applying...' : 'Apply'}
            </button>
          )}
          
          {/* My Accepted Tasks (Worker view) */}
          {viewMode === 'accepted' && (
            <div className="space-y-2">
              <a href={getNavigationUrl(task)} target="_blank" rel="noopener noreferrer"
                className="block bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center">
                🗺️ Navigate
              </a>
              {task.status === 'assigned' && (
                <button onClick={() => onMarkDone(task.id)} disabled={processingTask === task.id}
                  className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:bg-gray-400">
                  {processingTask === task.id ? 'Processing...' : '✅ Mark as Done'}
                </button>
              )}
              {task.status === 'pending_confirmation' && <p className="text-sm text-yellow-600">Waiting for client confirmation...</p>}
            </div>
          )}
          
          {/* My Posted Tasks (Creator view) */}
          {viewMode === 'posted' && (
            <div className="space-y-2">
              {task.status === 'pending_confirmation' && (
                <>
                  <button onClick={() => onConfirm(task.id)} disabled={processingTask === task.id}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400">
                    {processingTask === task.id ? 'Processing...' : '✅ Confirm Done'}
                  </button>
                  <button onClick={() => onDispute(task.id)} disabled={processingTask === task.id}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:bg-gray-400">
                    ⚠️ Dispute
                  </button>
                </>
              )}
              {task.status === 'open' && (
                <>
                  <button onClick={() => onViewApplications(task.id)} className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 mb-2">
                    📜 View Applications
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(task.id)} className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded hover:bg-gray-300 text-sm">✏️ Edit</button>
                    <button onClick={() => onCancel(task.id)} disabled={processingTask === task.id}
                      className="flex-1 bg-red-100 text-red-600 py-2 px-3 rounded hover:bg-red-200 text-sm disabled:opacity-50">Cancel</button>
                  </div>
                </>
              )}
              {task.status === 'assigned' && <p className="text-sm text-blue-600">Worker is on it!</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;