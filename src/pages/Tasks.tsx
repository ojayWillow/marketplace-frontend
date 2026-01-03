import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { getTasks, acceptTask, getMyTasks, Task as APITask } from '../api/tasks';
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

const Tasks = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'available' | 'my-tasks'>('available');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingTask, setAcceptingTask] = useState<number | null>(null);
    const [userLocation, setUserLocation] = useState({ lat: 56.9496, lng: 24.1052 }); // Default to Riga
    const [locationGranted, setLocationGranted] = useState(false);
  useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(newLocation);
        setLocationGranted(true);
        console.log('User location:', newLocation);
      },
      (error) => {
        console.log('Geolocation error:', error);
        setLocationGranted(false);
        setError('Location access is required to use Quick Help. Please enable location in your browser settings.');
      }
    );
  } else {
    setError('Geolocation is not supported by your browser. Quick Help requires location access.');
  }
}, []);


  useEffect(() => {
    // Get user's location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          console.log('User location:', newLocation);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Fetch available tasks
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
      
      // Fetch user's assigned tasks if logged in
     // Fetch user's accepted tasks if logged in
    if (isAuthenticated && user?.id) {
      const myTasksResponse = await getMyTasks();
      
      const userTasks = myTasksResponse.tasks.map(task => ({
        ...task,
        icon: getCategoryIcon(task.category),
        distance: task.distance || 0
      }));
      
      setError(null);    }         }));
        
        setMyTasks(userTasks);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userLocation, isAuthenticated, user?.id]);

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

  const createCustomIcon = (category: string) => new Icon.Default();
  
  // Create custom icon for user location
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
      await fetchTasks();
      setActiveTab('my-tasks');
    } catch (error) {
      console.error('Error accepting task:', error);
      alert('Failed to accept task. Please try again.');
    } finally {
      setAcceptingTask(null);
    }
  };

  if (!locationGranted && !loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-6xl mb-4">📍</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Location Required</h2>
        <p className="text-gray-600 mb-4">
          Quick Help needs your location to show nearby tasks and help you earn money.
        </p>
        <p className="text-sm text-gray-500">
          Please enable location access in your browser settings and reload the page.
        </p>
      </div>
    </div>
  );
}


  const getNavigationUrl = (task: Task) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${task.latitude},${task.longitude}`;
  };

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
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayTasks = activeTab === 'available' ? tasks : myTasks;

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

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
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
          )}
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6" style={{ height: '500px' }}>
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User location marker */}
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-bold">📍 Your Location</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Task markers */}
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
                      <span className="text-gray-500 text-sm">{task.distance?.toFixed(1) || '0.0'}km away</span>
                    </div>
                    {activeTab === 'available' ? (
                      <button 
                        onClick={() => handleAcceptTask(task.id)}
                        disabled={acceptingTask === task.id}
                        className="w-full bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 disabled:bg-gray-400"
                      >
                        {acceptingTask === task.id ? 'Accepting...' : 'Accept Task'}
                      </button>
                    ) : (
                      <a
                        href={getNavigationUrl(task)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 text-center"
                      >
                        🗺️ Navigate
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {activeTab === 'available' ? 'Available Tasks' : 'My Accepted Tasks'}
          </h2>
          {displayTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {activeTab === 'available'
                ? 'No tasks available in your area. Check back later!'
                : 'You haven\'t accepted any tasks yet.'}
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
                      {activeTab === 'available' ? (
                        <button 
                          onClick={() => handleAcceptTask(task.id)}
                          disabled={acceptingTask === task.id}
                          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {acceptingTask === task.id ? 'Accepting...' : 'Accept'}
                        </button>
                      ) : (
                        <a
                          href={getNavigationUrl(task)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                        >
                          🗺️ Navigate
                        </a>
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
