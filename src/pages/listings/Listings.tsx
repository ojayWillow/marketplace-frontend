import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { CATEGORIES } from './constants'

// Category icons mapping
const categoryIcons: Record<string, string> = {
  electronics: '📱',
  vehicles: '🚗',
  property: '🏠',
  furniture: '🪑',
  clothing: '👕',
  sports: '⚽',
  books: '📚',
  toys: '🧸',
  tools: '🔧',
  garden: '🌱',
  pets: '🐾',
  music: '🎵',
  art: '🎨',
  jewelry: '💍',
  health: '💊',
  food: '🍔',
  services: '🛠️',
  other: '📦',
}

export default function Listings() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Categories</h1>
          <p className="text-gray-600 mt-2">Select a category to view listings</p>
        </div>
        {isAuthenticated && (
          <Link
            to="/listings/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Listing
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            to={`/listings?category=${category}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-center text-center group"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-200">
              {categoryIcons[category] || '📦'}
            </div>
            <h3 className="text-lg font-semibold capitalize text-gray-800 group-hover:text-blue-600">
              {category}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  )
}
