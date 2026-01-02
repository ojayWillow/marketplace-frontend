import { useState } from 'react'

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
    lat: 56.9559,
    lng: 24.1193,
    icon: '📦'
  },
  {
    id: 3,
    title: 'Grocery shopping',
    description: 'Buy groceries from local store - list provided',
    category: 'shopping',
    reward: 12,
    distance: 0.8,
    lat: 56.9436,
    lng: 24.0981,
    icon: '🛒'
  },
  {
    id: 4,
    title: 'Clean apartment',
    description: '2-bedroom apartment needs cleaning',
    category: 'cleaning',
    reward: 35,
    distance: 2.1,
    lat: 56.9611,
    lng: 24.1311,
    icon: '🧹'
  },
  {
    id: 5,
    title: 'Deliver package',
    description: 'Pick up and deliver small package across town',
    category: 'delivery',
    reward: 15,
    distance: 1.5,
    lat: 56.9387,
    lng: 24.1121,
    icon: '🚚'
  },
  {
    id: 6,
    title: 'Fix leaking faucet',
    description: 'Kitchen faucet needs repair',
    category: 'handyman',
    reward: 30,
    distance: 1.8,
    lat: 56.9521,
    lng: 24.0911,
    icon: '🔧'
  },
  {
    id: 7,
    title: 'Babysitting',
    description: 'Watch 2 kids (ages 5 and 7) for 3 hours',
    category: 'childcare',
    reward: 20,
    distance: 0.9,
    lat: 56.9467,
    lng: 24.1287,
    icon: '👶'
  },
  {
    id: 8,
    title: 'Garden work',
    description: 'Help with weeding and planting flowers',
    category: 'garden',
    reward: 18,
    distance: 2.5,
    lat: 56.9322,
    lng: 24.1165,
    icon: '🌱'
  }
]

export default function Tasks() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredTasks = categoryFilter === 'all'
    ? MOCK_TASKS
    : MOCK_TASKS.filter(task => task.category === categoryFilter)

  const categories = [
    { value: 'all', label: 'All Tasks', icon: '📍' },
    { value: 'pet-care', label: 'Pet Care', icon: '🐕' },
    { value: 'moving', label: 'Moving', icon: '📦' },
    { value: 'shopping', label: 'Shopping', icon: '🛒' },
    { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
    { value: 'delivery', label: 'Delivery', icon: '🚚' },
    { value: 'handyman', label: 'Handyman', icon: '🔧' },
    { value: 'childcare', label: 'Childcare', icon: '👶' },
    { value: 'garden', label: 'Garden', icon: '🌱' }
  ]

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quick Help Map</h1>
          <p className="text-gray-600">Find tasks near you and start earning!</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white border-b px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-gray-100">
        {/* Placeholder map - will be replaced with real map library */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-gray-600 mb-2">Interactive Map View</p>
            <p className="text-sm text-gray-500">Map library integration coming soon</p>
          </div>
        </div>

        {/* Task Markers Overlay (positioned absolutely) */}
        <div className="absolute inset-0 pointer-events-none">
          {filteredTasks.map((task, index) => (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-full"
              style={{
                left: `${30 + (index % 3) * 20}%`,
                top: `${30 + Math.floor(index / 3) * 20}%`
              }}
              title={task.title}
            >
              <div className="relative group">
                <div className="text-4xl animate-bounce hover:scale-110 transition-transform">
                  {task.icon}
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                  <div className="bg-white rounded-lg shadow-lg p-2 text-xs whitespace-nowrap">
                    <div className="font-semibold">{task.title}</div>
                    <div className="text-green-600">€{task.reward}</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-4xl mb-2">{selectedTask.icon}</div>
                <h3 className="text-xl font-bold">{selectedTask.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Reward</div>
                  <div className="text-2xl font-bold text-green-600">€{selectedTask.reward}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Distance</div>
                  <div className="text-2xl font-bold text-blue-600">{selectedTask.distance} km</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Accept Task
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="bg-white border-t px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div>
            <span className="font-semibold">{filteredTasks.length}</span>
            <span className="text-gray-600"> tasks available nearby</span>
          </div>
          <div className="text-gray-600">
            <span className="mr-4">📍 Riga, Latvia</span>
            <span>🔵 You are here</span>
          </div>
        </div>
      </div>
    </div>
  )
}
