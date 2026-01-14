import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/authStore'
import { useLogout } from '../../hooks/useAuth'
import LanguageSwitcher from './LanguageSwitcher'
import apiClient from '../../api/client'

interface NotificationCounts {
  unreadMessages: number;
  pendingApplications: number;
  pendingConfirmation: number;
  acceptedApplications: number; // NEW: For workers - their application was accepted
}

export default function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const logout = useLogout()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationCounts>({
    unreadMessages: 0,
    pendingApplications: 0,
    pendingConfirmation: 0,
    acceptedApplications: 0
  })
  const notificationDropdownRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  // Helper to navigate and close dropdown
  const handleNotificationClick = (path: string) => {
    setNotificationDropdownOpen(false);
    navigate(path);
  };

  // Fetch notification counts
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      // Fetch unread messages count
      const messagesResponse = await apiClient.get('/api/messages/unread-count');
      const unreadMessages = messagesResponse.data.unread_count || 0;
      
      // Fetch task notifications (pending applications on my tasks)
      const taskNotificationsResponse = await apiClient.get('/api/tasks/notifications');
      const pendingApplications = taskNotificationsResponse.data.pending_applications || 0;
      const pendingConfirmation = taskNotificationsResponse.data.pending_confirmation || 0;
      
      // Fetch real notifications (for accepted applications - worker side)
      let acceptedApplications = 0;
      try {
        const notificationsResponse = await apiClient.get('/api/notifications/unread-count');
        acceptedApplications = notificationsResponse.data.accepted_applications || 0;
      } catch (e) {
        // Notifications API might not be available, that's ok
        console.log('Notifications API not available');
      }
      
      setNotifications({
        unreadMessages,
        pendingApplications,
        pendingConfirmation,
        acceptedApplications
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch notifications on mount and periodically
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotificationDropdownOpen(false);
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const totalNotifications = notifications.unreadMessages + notifications.pendingApplications + notifications.pendingConfirmation + notifications.acceptedApplications;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
        ? 'bg-primary-100 text-primary-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  return (
    <header 
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-[9999]"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2"
            aria-label={`${t('common.appName')} - ${t('common.home')}`}
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              {t('common.appName')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main navigation">
            <NavLink to="/" end className={navLinkClass}>
              {t('common.home')}
            </NavLink>
            <NavLink to="/listings" className={navLinkClass}>
              {t('common.listings')}
            </NavLink>
            <NavLink to="/tasks" className={navLinkClass}>
              {t('common.quickHelp')}
            </NavLink>
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Favorites Link */}
                <Link
                  to="/favorites"
                  className="p-2 text-gray-600 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="My Favorites"
                  title="My Favorites"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>

                {/* Notification Bell */}
                <div className="relative" ref={notificationDropdownRef}>
                  <button
                    onClick={() => {
                      setNotificationDropdownOpen(!notificationDropdownOpen);
                      setProfileDropdownOpen(false);
                    }}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label={`Notifications${totalNotifications > 0 ? `, ${totalNotifications} unread` : ''}`}
                    aria-expanded={notificationDropdownOpen}
                    aria-haspopup="true"
                  >
                    {/* Bell Icon */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    
                    {/* Notification Badge */}
                    {totalNotifications > 0 && (
                      <span 
                        className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm"
                        aria-hidden="true"
                      >
                        {totalNotifications > 99 ? '99+' : totalNotifications}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notificationDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[9999]"
                      role="menu"
                      aria-label="Notifications"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      
                      {totalNotifications === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-500">
                          <span className="text-3xl mb-2 block" aria-hidden="true">✨</span>
                          <p className="font-medium">You're all caught up!</p>
                          <p className="text-sm mt-1">New notifications will appear here</p>
                          <button 
                            onClick={() => handleNotificationClick('/tasks')}
                            className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700"
                            role="menuitem"
                          >
                            Browse tasks to help others →
                          </button>
                        </div>
                      ) : (
                        <div className="max-h-80 overflow-y-auto">
                          {/* Accepted Applications - FOR WORKERS */}
                          {notifications.acceptedApplications > 0 && (
                            <button
                              onClick={() => handleNotificationClick('/profile?tab=tasks&view=my-jobs')}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left"
                              role="menuitem"
                            >
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600" aria-hidden="true">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  🎉 You got assigned to {notifications.acceptedApplications} job{notifications.acceptedApplications !== 1 ? 's' : ''}!
                                </p>
                                <p className="text-xs text-gray-500">Your application was accepted</p>
                              </div>
                              <span className="w-2 h-2 bg-purple-500 rounded-full" aria-hidden="true"></span>
                            </button>
                          )}
                          
                          {/* Unread Messages */}
                          {notifications.unreadMessages > 0 && (
                            <button
                              onClick={() => handleNotificationClick('/messages')}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                              role="menuitem"
                            >
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600" aria-hidden="true">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notifications.unreadMessages} new message{notifications.unreadMessages !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-gray-500">Click to view your messages</p>
                              </div>
                              <span className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></span>
                            </button>
                          )}
                          
                          {/* Pending Applications on My Tasks */}
                          {notifications.pendingApplications > 0 && (
                            <button
                              onClick={() => handleNotificationClick('/profile?tab=tasks&view=my-tasks')}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left"
                              role="menuitem"
                            >
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600" aria-hidden="true">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notifications.pendingApplications} new application{notifications.pendingApplications !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-gray-500">People want to help with your tasks</p>
                              </div>
                              <span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></span>
                            </button>
                          )}
                          
                          {/* Tasks Pending Confirmation */}
                          {notifications.pendingConfirmation > 0 && (
                            <button
                              onClick={() => handleNotificationClick('/profile?tab=tasks&view=my-tasks&status=in_progress')}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 transition-colors text-left"
                              role="menuitem"
                            >
                              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600" aria-hidden="true">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notifications.pendingConfirmation} task{notifications.pendingConfirmation !== 1 ? 's' : ''} awaiting confirmation
                                </p>
                                <p className="text-xs text-gray-500">Workers marked these as done</p>
                              </div>
                              <span className="w-2 h-2 bg-yellow-500 rounded-full" aria-hidden="true"></span>
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* View All Link */}
                      <div className="border-t border-gray-100 mt-2 pt-2 px-4 pb-1">
                        <button
                          onClick={() => handleNotificationClick('/profile?tab=tasks')}
                          className="block w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                          role="menuitem"
                        >
                          View all activity →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages Link */}
                <Link
                  to="/messages"
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label={`Messages${notifications.unreadMessages > 0 ? `, ${notifications.unreadMessages} unread` : ''}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {notifications.unreadMessages > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-blue-500 rounded-full"
                      aria-hidden="true"
                    >
                      {notifications.unreadMessages > 9 ? '9+' : notifications.unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotificationDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="User menu"
                    aria-expanded={profileDropdownOpen}
                    aria-haspopup="true"
                  >
                    {user?.avatar_url || user?.profile_picture_url ? (
                      <img 
                        src={user.avatar_url || user.profile_picture_url} 
                        alt="" 
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-gray-200" aria-hidden="true">
                        <span className="text-gray-500 text-sm font-medium">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[9999]"
                      role="menu"
                      aria-label="User menu"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1" role="none">
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                        
                        <Link
                          to="/favorites"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          My Favorites
                        </Link>
                        
                        <Link
                          to="/profile?tab=tasks"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          My Tasks
                          {(notifications.pendingApplications + notifications.pendingConfirmation + notifications.acceptedApplications) > 0 && (
                            <span className="ml-auto px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                              {notifications.pendingApplications + notifications.pendingConfirmation + notifications.acceptedApplications}
                            </span>
                          )}
                        </Link>
                        
                        <Link
                          to="/profile?tab=listings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          My Listings
                        </Link>
                        
                        <Link
                          to="/messages"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          Messages
                          {notifications.unreadMessages > 0 && (
                            <span className="ml-auto px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                              {notifications.unreadMessages}
                            </span>
                          )}
                        </Link>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="border-t border-gray-100 py-1" role="none">
                        <Link
                          to="/tasks/create"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Post a Task
                        </Link>
                        
                        <Link
                          to="/listings/create"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create Listing
                        </Link>
                      </div>
                      
                      {/* Logout */}
                      <div className="border-t border-gray-100 py-1" role="none">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          role="menuitem"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {t('common.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-secondary text-sm">
                  {t('common.login')}
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile notification bell */}
            {isAuthenticated && totalNotifications > 0 && (
              <Link
                to="/profile?tab=tasks"
                className="relative p-2 text-gray-600"
                aria-label={`Notifications, ${totalNotifications} unread`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full" aria-hidden="true">
                  {totalNotifications > 9 ? '9+' : totalNotifications}
                </span>
              </Link>
            )}
            
            <button
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden py-4 border-t border-gray-200"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <nav className="flex flex-col space-y-2">
              <NavLink
                to="/"
                end
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.home')}
              </NavLink>
              <NavLink
                to="/listings"
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.listings')}
              </NavLink>
              <NavLink
                to="/tasks"
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.quickHelp')}
              </NavLink>
              {isAuthenticated && (
                <>
                  <NavLink
                    to="/favorites"
                    className={navLinkClass}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-red-500" aria-hidden="true">❤️</span> My Favorites
                  </NavLink>
                  <NavLink
                    to="/messages"
                    className={navLinkClass}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span aria-hidden="true">💬</span> Messages
                    {notifications.unreadMessages > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                        {notifications.unreadMessages}
                      </span>
                    )}
                  </NavLink>
                </>
              )}
            </nav>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <LanguageSwitcher />
              
              <div className="mt-4 flex flex-col space-y-2">
                {isAuthenticated ? (
                  <>
                    {/* Mobile Notifications Summary */}
                    {totalNotifications > 0 && (
                      <div className="px-3 py-2 mb-2 bg-blue-50 rounded-lg" role="status" aria-live="polite">
                        <p className="text-sm font-medium text-blue-700">
                          <span aria-hidden="true">🔔</span> You have {totalNotifications} notification{totalNotifications !== 1 ? 's' : ''}
                        </p>
                        <div className="mt-1 text-xs text-blue-600 space-y-1">
                          {notifications.acceptedApplications > 0 && (
                            <p>• 🎉 Assigned to {notifications.acceptedApplications} job{notifications.acceptedApplications !== 1 ? 's' : ''}!</p>
                          )}
                          {notifications.unreadMessages > 0 && (
                            <p>• {notifications.unreadMessages} unread message{notifications.unreadMessages !== 1 ? 's' : ''}</p>
                          )}
                          {notifications.pendingApplications > 0 && (
                            <p>• {notifications.pendingApplications} new application{notifications.pendingApplications !== 1 ? 's' : ''}</p>
                          )}
                          {notifications.pendingConfirmation > 0 && (
                            <p>• {notifications.pendingConfirmation} task{notifications.pendingConfirmation !== 1 ? 's' : ''} pending confirmation</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {user?.avatar_url || user?.profile_picture_url ? (
                        <img 
                          src={user.avatar_url || user.profile_picture_url} 
                          alt="" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center" aria-hidden="true">
                          <span className="text-gray-500 text-sm">
                            {user?.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span>{user?.username} - My Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="btn-secondary text-sm"
                    >
                      {t('common.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn-secondary text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('common.login')}
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('common.register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
