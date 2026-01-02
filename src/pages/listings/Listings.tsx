import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useListings } from '../../hooks/useListings'
import { useAuthStore } from '../../stores/authStore'
import ListingCard from './components/ListingCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { CATEGORIES } from './constants'

export default function Listings() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const { isAuthenticated } = useAuthStore()

  const { data: listings, isLoading, isError } = useListings({
    search: search || undefined,
    category: category || undefined
  })

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage message="Failed to load listings" />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Listings</h1>
        {isAuthenticated && (
          <Link
            to="/listings/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Listing
          </Link>
        )}
      </div>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No listings found. Be the first to create one!</p>
        </div>
      )}
    </div>
  )
}
