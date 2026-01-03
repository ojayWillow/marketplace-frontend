import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { getTasks, acceptTask, getMyTasks, getCreatedTasks, markTaskDone, confirmTaskCompletion, disputeTask, Task as APITask } from '../api/tasks';
import { useAuthStore } from '../stores/authStore';

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

// Component to handle map clicks for location selection
const LocationPicker = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to recenter map when location changes
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
  const [activeTab, setActiveTab] = useState<'available' | 'my-tasks' | 'my-posted'>('available');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [postedTasks, setPostedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingTask, setAcceptingTask] = useState<number | null>(null);
  const [processingTask, setProcessingTask] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: 56.9496, lng: 24.1052 }); // Default to Riga
  const [locationGranted, setLocationGranted] = useState(false);
  const [manualLocationSet, setManualLocationSet] = useState(false);
  const [addressSearch, setAddressSearch] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [locationName, setLocationName] = useState('');
  const hasFetchedRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
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
    // Check if we have a saved manual location
    const savedLocation = localStorage.getItem('userManualLocation');
    if (savedLocation) {
      const { lat, lng, name } = JSON.parse(savedLocation);
      setUserLocation({ lat, lng });
      setLocationName(name || '');
      setManualLocationSet(true);
      setLocationGranted(true);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          setLocationGranted(true);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Still allow access but with default location
          setLocationGranted(true);
        }
      );
    } else {
      // Still allow access with default location
      setLocationGranted(true);
    }
  }, []);

  const handleLocationSelect = (lat: number, lng: number, name?: string) => {
    const newLocation = { lat, lng };
    setUserLocation(newLocation);
    setManualLocationSet(true);
    setLocationName(name || '');
    // Save to localStorage for persistence
    localStorage.setItem('userManualLocation', JSON.stringify({ ...newLocation, name: name || '' }));
    // Refetch tasks for new location
    hasFetchedRef.current = false;
    fetchTasks(true);
  };

  // Debounced address search for autocomplete
  const searchAddressSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en,lv'
          }
        }
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

  // Handle input change with debounce
  const handleAddressInputChange = (value: string) => {
    setAddressSearch(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce: wait 300ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      searchAddressSuggestions(value);
    }, 300);
  };

  // Select a suggestion
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
    localStorage.removeItem('userManualLocation');
    setManualLocationSet(false);
    setLocationName('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          hasFetchedRef.current = false;
          fetchTasks(true);
        }
      );
    }
  };

  const getCategoryIcon = (category: string): string => {
    const iconMap: { [key: string]: string } = {
      'pet-care': '🐕',
      'moving': '📦',
      'shopping': '🛒',
      'cleaning': '🧹',
      'delivery': '📄',
      'outdoor': '🌿',
      'default': '💼'
    };
    return iconMap[category] || iconMap['default'];
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
    
    // Fetch available tasks
    try {
      const availableResponse = await getTasks({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radius: 10,
        status: 'open'
      });
      
      const tasksWithIcons = availableResponse.tasks.map(task => ({
        ...task,
        icon: getCategoryIcon(task.category)
      }));
      
      setTasks(tasksWithIcons);
      hasFetchedRef.current = true;
    } catch (err) {
      console.error('Error fetching available tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    }
    
    // Fetch user's tasks if logged in
    if (isAuthenticated && user?.id) {
      try {
        // Tasks I'm working on
        const myTasksResponse = await getMyTasks();
        const userTasks = myTasksResponse.tasks.map(task => ({
          ...task,
          icon: getCategoryIcon(task.category),
          distance: task.distance || 0
        }));
        setMyTasks(userTasks);
        
        // Tasks I created
        const createdResponse = await getCreatedTasks();
        const createdTasks = createdResponse.tasks.map(task => ({
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
    if (locationGranted) {
      fetchTasks();
    }
  }, [locationGranted, isAuthenticated]);

  const createCustomIcon = (category: string) => new Icon.Default();
  
  const userLocationIcon = divIcon({
    className: 'custom-user-icon',
    html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const handleAcceptTask = async (taskId: number) => {
    if (!isAuthenticated) {
      alert('Please login to accept tasks');
      navigate('/login');
      return;
    }

    if (!user?.id) {
      alert('User information not available');
      return;
    }

    try {
      setAcceptingTask(taskId);
      await acceptTask(taskId, user.id);
      alert('Task accepted! Check "My Tasks" tab for navigation.');
      hasFetchedRef.current = false;
      await fetchTasks(true);
      setActiveTab('my-tasks');
    } catch (error: any) {
      console.error('Error accepting task:', error);
      alert(error?.response?.data?.error || 'Failed to accept task. Please try again.');
    } finally {
      setAcceptingTask(null);
    }
  };

  const handleMarkDone = async (taskId: number) => {
    try {
      setProcessingTask(taskId);
      await markTaskDone(taskId);
      alert('Task marked as done! Waiting for the client to confirm.');
      hasFetchedRef.current = false;
      await fetchTasks(true);
    } catch (error: any) {
      console.error('Error marking task done:', error);
      alert(error?.response?.data?.error || 'Failed to mark task as done.');
    } finally {
      setProcessingTask(null);
    }
  };

  const handleConfirmCompletion = async (taskId: number) => {
    try {
      setProcessingTask(taskId);
      await confirmTaskCompletion(taskId);
      alert('Task completed! You can now leave a review for the worker.');
      hasFetchedRef.current = false;
      await fetchTasks(true);
    } catch (error: any) {
      console.error('Error confirming task:', error);
      alert(error?.response?.data?.error || 'Failed to confirm task completion.');
    } finally {
      setProcessingTask(null);
    }
  };

  const handleDispute = async (taskId: number) => {
    const reason = prompt('Please describe the issue:');
    if (reason === null) return; // User cancelled
    
    try {
      setProcessingTask(taskId);
      await disputeTask(taskId, reason);
      alert('Task has been disputed. Please contact the worker to resolve.');
      hasFetchedRef.current = false;
      await fetchTasks(true);
    } catch (error: any) {
      console.error('Error disputing task:', error);
      alert(error?.response?.data?.error || 'Failed to dispute task.');
    } finally {
      setProcessingTask(null);
    }
  };

  const getNavigationUrl = (task: Task) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${task.latitude},${task.longitude}`;
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
          <button 
            onClick={() => {
              hasFetchedRef.current = false;
              fetchTasks(true);
            }} 
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayTasks = activeTab === 'available' ? tasks : activeTab === 'my-tasks' ? myTasks : postedTasks;

  // Pending confirmation tasks for creator
  const pendingConfirmation = postedTasks.filter(t => t.status === 'pending_confirmation');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Help</h1>
            <p className="text-gray-600">
              Browse nearby tasks and earn money by helping others
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => navigate('/tasks/create')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium"
            >
              + Create Task
            </button>
          )}
        </div>

        {/* Location search and info */}
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col gap-3">
            {/* Address search with autocomplete */}
            <div className="relative" ref={suggestionsRef}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={addressSearch}
                    onChange={(e) => handleAddressInputChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Search address or city (e.g., Upes 15, Jelgava)"
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchingAddress && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">📍</span>
                        <span className="text-sm text-gray-700">{suggestion.display_name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Current location info */}
            <div className="flex items-center justify-between text-sm">
              <p className="text-blue-800">
                📍 {manualLocationSet && locationName ? (
                  <span><strong>{locationName}</strong></span>
                ) : manualLocationSet ? (
                  <span>Custom location (click map to change)</span>
                ) : (
                  <span>Auto-detected location • Search or click map to change</span>
                )}
              </p>
              {manualLocationSet && (
                <button
                  onClick={resetToAutoLocation}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Reset to auto-detect
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notification for pending confirmations */}
        {pendingConfirmation.length > 0 && activeTab !== 'my-posted' && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              📢 You have {pendingConfirmation.length} task(s) waiting for your confirmation!
              <button 
                onClick={() => setActiveTab('my-posted')}
                className="ml-2 text-yellow-600 underline hover:text-yellow-700"
              >
                View now
              </button>
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'available'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Available Tasks ({tasks.length})
          </button>
          {isAuthenticated && (
            <>
              <button
                onClick={() => setActiveTab('my-tasks')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'my-tasks'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                My Tasks ({myTasks.length})
              </button>
              <button
                onClick={() => setActiveTab('my-posted')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors relative ${
                  activeTab === 'my-posted'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                My Posted Tasks ({postedTasks.length})
                {pendingConfirmation.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingConfirmation.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6" style={{ height: '400px' }}>
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Recenter map when location changes */}
            <MapRecenter lat={userLocation.lat} lng={userLocation.lng} />
            
            {/* Click handler for manual location selection */}
            <LocationPicker onLocationSelect={(lat, lng) => handleLocationSelect(lat, lng)} />
            
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-bold">📍 Your Location</p>
                  {locationName && <p className="text-sm text-gray-600">{locationName}</p>}
                  <p className="text-xs text-gray-500">
                    {manualLocationSet ? '(Manually set)' : '(Auto-detected)'}
                  </p>
                </div>
              </Popup>
            </Marker>
            
            {displayTasks.map((task) => (
              <Marker
                key={task.id}
                position={[task.latitude, task.longitude]}
                icon={createCustomIcon(task.category)}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-600 font-bold">€{task.budget || task.reward || 0}</span>
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {activeTab === 'available' ? 'Available Tasks' : activeTab === 'my-tasks' ? 'My Accepted Tasks' : 'My Posted Tasks'}
          </h2>
          {displayTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {activeTab === 'available'
                ? 'No tasks available in your area. Check back later!'
                : activeTab === 'my-tasks'
                ? "You haven't accepted any tasks yet."
                : "You haven't posted any tasks yet."}
            </div>
          ) : (
            <div className="space-y-4">
              {displayTasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{task.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        {getStatusBadge(task.status)}
                      </div>
                      <p className="text-gray-600 mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm mb-2">
                        <span className="text-gray-500">📍 {task.distance?.toFixed(1) || '0.0'}km away</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {task.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">📍 {task.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        €{task.budget || task.reward || 0}
                      </div>
                      
                      {/* Available Tasks - Accept button */}
                      {activeTab === 'available' && (
                        <button 
                          onClick={() => handleAcceptTask(task.id)}
                          disabled={acceptingTask === task.id}
                          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {acceptingTask === task.id ? 'Accepting...' : 'Accept'}
                        </button>
                      )}
                      
                      {/* My Tasks (Worker view) */}
                      {activeTab === 'my-tasks' && (
                        <div className="space-y-2">
                          <a
                            href={getNavigationUrl(task)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center"
                          >
                            🗺️ Navigate
                          </a>
                          {task.status === 'assigned' && (
                            <button
                              onClick={() => handleMarkDone(task.id)}
                              disabled={processingTask === task.id}
                              className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:bg-gray-400"
                            >
                              {processingTask === task.id ? 'Processing...' : '✅ Mark as Done'}
                            </button>
                          )}
                          {task.status === 'pending_confirmation' && (
                            <p className="text-sm text-yellow-600">Waiting for client confirmation...</p>
                          )}
                        </div>
                      )}
                      
                      {/* My Posted Tasks (Creator view) */}
                      {activeTab === 'my-posted' && (
                        <div className="space-y-2">
                          {task.status === 'pending_confirmation' && (
                            <>
                              <button
                                onClick={() => handleConfirmCompletion(task.id)}
                                disabled={processingTask === task.id}
                                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400"
                              >
                                {processingTask === task.id ? 'Processing...' : '✅ Confirm Done'}
                              </button>
                              <button
                                onClick={() => handleDispute(task.id)}
                                disabled={processingTask === task.id}
                                className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:bg-gray-400"
                              >
                                ⚠️ Dispute
                              </button>
                            </>
                          )}
                          {task.status === 'open' && (
                            <p className="text-sm text-gray-500">Waiting for someone to accept...</p>
                          )}
                          {task.status === 'assigned' && (
                            <p className="text-sm text-blue-600">Worker is on it!</p>
                          )}
                          {task.status === 'completed' && (
                            <p className="text-sm text-green-600">✅ Completed</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
