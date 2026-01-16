import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Search, 
  Plus, 
  Users, 
  Wrench, 
  Truck, 
  Sparkles, 
  Dog, 
  GraduationCap,
  ArrowRight,
  HelpCircle
} from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuthStore } from '../stores/authStore'

const categories = [
  { id: 'household', icon: Wrench, label: 'tasks.categories.household', color: 'text-blue-400 bg-blue-500/10' },
  { id: 'delivery', icon: Truck, label: 'tasks.categories.delivery', color: 'text-green-400 bg-green-500/10' },
  { id: 'cleaning', icon: Sparkles, label: 'tasks.categories.cleaning', color: 'text-purple-400 bg-purple-500/10' },
  { id: 'pets', icon: Dog, label: 'tasks.categories.pets', color: 'text-orange-400 bg-orange-500/10' },
  { id: 'tutoring', icon: GraduationCap, label: 'tasks.categories.tutoring', color: 'text-pink-400 bg-pink-500/10' },
  { id: 'other', icon: Users, label: 'tasks.categories.other', color: 'text-gray-400 bg-gray-500/10' },
]

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { isAuthenticated } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  // Redirect mobile users to Quick Help (Tasks) page
  if (isMobile) {
    return <Navigate to="/tasks" replace />
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/tasks')
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/tasks?category=${categoryId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        
        {/* Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t('home.hero')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('home.heroSubtitle')}
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-700">
          <form onSubmit={handleSearch}>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Search className="w-4 h-4 inline mr-2" />
              {t('home.searchLabel', 'What do you need help with?')}
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.searchPlaceholder', 'e.g., furniture assembly, dog walking...')}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-700 bg-gray-900 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">{t('common.search', 'Search')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Post a Task CTA */}
        <Link
          to={isAuthenticated ? "/tasks/create" : "/login"}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors mb-6"
        >
          <Plus className="w-5 h-5" />
          {t('home.postTask', 'Post a Task')}
          <ArrowRight className="w-5 h-5 ml-auto" />
        </Link>

        {/* Categories Card */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-700">
          <h2 className="text-sm font-medium text-gray-300 mb-4">
            {t('home.browseCategories', 'Browse by Category')}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-700/50 transition-colors group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors text-center">
                    {t(category.label)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Auth Links (if not logged in) */}
        {!isAuthenticated && (
          <div className="text-center">
            <p className="text-gray-400">
              {t('home.haveAccount', 'Already have an account?')}{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                {t('common.login', 'Sign In')}
              </Link>
              {' '}{t('common.or', 'or')}{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                {t('common.register', 'Register')}
              </Link>
            </p>
          </div>
        )}

        {/* Browse All Tasks Link */}
        {isAuthenticated && (
          <div className="text-center">
            <Link 
              to="/tasks" 
              className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
            >
              {t('home.browseAllTasks', 'Browse all tasks')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
