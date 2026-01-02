import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useListings } from '../../hooks/useListings'
import { useAuthStore } from '../../stores/authStore'
import ListingCard from './components/ListingCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { CATEGORIES } from './constants'

export default function Listings() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const { data: listings, isLoading, isError } = useListings({
    search: search || undefined,
    category: category || undefined,
  }}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold">Listings Page</h1>
      <p>This page is working!</p>
    </div>
  )
}
