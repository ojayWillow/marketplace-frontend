import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue with Vite
import L from 'leaflet'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

interface Task {
  id: number
  title: string
  description: string
  category: string
  reward: number
  distance: number
  lat: number
  lng: number
  icon: string
}

// Mock task data centered around Riga, Latvia
const MOCK_TASKS: Task[] = [
  {
    id: 1,
    title: 'Walk my dog',
    description: 'Need someone to walk my Golden Retriever for 30 minutes',
    category: 'pet-care',
    reward: 8,
    distance: 0.5,
    lat: 56.9496,
    lng: 24.1052,
    icon: '🐕'
  },
  {
    id: 2,
    title: 'Move furniture',
    description: 'Help moving a couch to 3rd floor apartment',
    category: 'moving',
    reward: 25,
    distance: 1.2,
    lat: 56.9539,
    lng: 24.1139,
    icon: '📦'
  },
  {
    id: 3,
    title: 'Grocery shopping',
    description: 'Buy groceries from local store - list provided',
    category: 'shopping',
    reward: 12,
    distance: 0.8,
    lat: 56.9463,
    lng: 24.0963,
    icon: '🛒'
  },
  {
    id: 4,
    title: 'Clean apartment',
    description: '2-bedroom apartment needs cleaning',
    category: 'cleaning',
    reward: 35,
    distance: 1.5,
    lat: 56.9520,
    lng: 24.1185,
    icon: '🧹'
  },
  {
    id: 5,
    title: 'Deliver documents',
    description: 'Important papers need delivery across town',
    category: 'delivery',
    reward: 15,
    distance: 2.1,
    lat: 56.9575,
    lng: 24.1235,
    icon: '📄'
  },
  {
    id: 6,
    title: 'Garden work',
    description: 'Rake leaves and trim hedges',
    category: 'outdoor',
    reward: 20,
    distance: 1.0,
    lat: 56.9440,
    lng: 24.1010,
    icon: '🌿'
  },
]

const Tasks = () => {
  const [tasks] = useState<Task[]>(MOCK_TASKS)
  const [userLocation] = useState({ lat: 56.9496, lng: 24.1052 }) // Default to Riga center

  useEffect(() => {
    // Get user's location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('User location:', position.coords)
        },
        (error) => {
          console.log('Geolocation error:', error)
        }
      )
    }
  }, [])

  // Create custom marker icons
    // Use default Leaflet markers - emojis cause btoa encoding issues
    const createCustomIcon = (category: string) => new Icon.Default();

  return (  <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Help</h1>
          <p className="text-gray-600">
            Browse nearby tasks and earn money by helping others
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {tasks.map((task) => (
              <Marker
                key={task.id}
                position={[task.lat, task.lng]}
                icon={createCustomIcon(task.icon)}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-bold">${task.reward}</span>
                      <span className="text-gray-500 text-sm">{task.distance}km away</span>
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
                      <span className="text-gray-500">📍 {task.distance}km away</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      ${task.reward}
                    </div>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tasks
