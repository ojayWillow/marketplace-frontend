import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getTasks, Task as APITask } from '../api/tasks';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: 56.9496, lng: 24.1052 }); // Default to Riga center

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

  useEffect(() => {
    // Fetch tasks from backend
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await getTasks({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: 10, // 10km radius
          status: 'open'
        });
        
        // Map backend tasks to include UI icons based on category
        const tasksWithIcons = response.tasks.map(task => ({
          ...task,
          icon: getCategoryIcon(task.category)
        }));
        
        setTasks(tasksWithIcons);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userLocation]);

  // Get icon emoji based on category
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

  // Create custom marker icons
  const createCustomIcon = (category: string) => new Icon.Default();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Help</h1>
          <p className="text-gray-600">
            Browse nearby tasks and earn money by helping others
          </p>
          <p className="text-sm text-green-600 mt-1">
            ✓ Connected to backend - Showing {tasks.length} tasks within 10km
          </p>
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
            
            {tasks.map((task) => (
              <Marker
                key={task.id}
                position={[task.latitude, task.longitude]}
                icon={createCustomIcon(task.category)}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-bold">${task.budget || task.reward || 0}</span>
                      <span className="text-gray-500 text-sm">{task.distance?.toFixed(1) || '0.0'}km away</span>
                    </div>
                    <button className="mt-2 w-full bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">
                      Accept Task
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Tasks</h2>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks available in your area. Check back later!
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{task.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">📍 {task.distance?.toFixed(1) || '0.0'}km away</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {task.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        ${task.budget || task.reward || 0}
                      </div>
                      <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                        Accept
                      </button>
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
