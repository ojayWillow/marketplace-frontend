import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <span className="text-9xl font-bold text-gray-200">404</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary px-6 py-3"
          >
            ← Go to Homepage
          </Link>
          <Link
            to="/listings"
            className="btn-secondary px-6 py-3"
          >
            Browse Listings
          </Link>
          <Link
            to="/tasks"
            className="btn-secondary px-6 py-3"
          >
            View Tasks
          </Link>
        </div>

        {/* Helpful suggestions */}
        <div className="mt-12 text-sm text-gray-500">
          <p>Looking for something specific?</p>
          <p className="mt-1">
            Try using the navigation menu or search for what you need.
          </p>
        </div>
      </div>
    </div>
  )
}
