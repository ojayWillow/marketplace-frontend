import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated 404 Illustration */}
        <div className="mb-8 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full opacity-50 animate-pulse" />
          </div>
          
          {/* 404 Number */}
          <div className="relative">
            <span className="text-[10rem] sm:text-[12rem] font-black bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-none">
              404
            </span>
          </div>
          
          {/* Floating icons */}
          <div className="absolute top-4 left-1/4 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>
            📍
          </div>
          <div className="absolute top-8 right-1/4 text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>
            🔍
          </div>
          <div className="absolute bottom-4 left-1/3 text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>
            📦
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('notFound.title')}
        </h1>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-md mx-auto">
          {t('notFound.message')}
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('listings.searchPlaceholder')}
              className="w-full px-5 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
        
        {/* Main action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t('notFound.goHome')}
          </Link>
          <Link
            to="/listings"
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {t('notFound.browseListings')}
          </Link>
          <Link
            to="/tasks"
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('notFound.viewTasks')}
          </Link>
        </div>

        {/* Quick category links */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('notFound.lookingFor')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              to="/listings?category=electronics"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              📱 {t('listings.categories.electronics')}
            </Link>
            <Link
              to="/listings?category=vehicles"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              🚗 {t('listings.categories.vehicles')}
            </Link>
            <Link
              to="/listings?category=property"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              🏠 {t('listings.categories.property')}
            </Link>
            <Link
              to="/tasks"
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
            >
              🛠️ {t('common.quickHelp')}
            </Link>
          </div>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-gray-400 dark:text-gray-500">
          {t('notFound.tryNavigation')}
        </p>
      </div>
    </div>
  )
}
