import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'
import ToastContainer from '../ui/ToastContainer'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function Layout() {
  const location = useLocation()
  const isMobile = useIsMobile()
  
  // Pages that should NOT show the mobile bottom nav (exclusion list)
  // These are "outside the app" - landing, auth, admin, legal
  const excludeBottomNav = [
    '/welcome',           // Landing/marketing page
    '/login',
    '/register', 
    '/phone-login',
    '/verify-phone',
    '/complete-profile',
    '/forgot-password',
    '/reset-password',
    '/terms',
    '/privacy',
  ].some(path => location.pathname.startsWith(path)) || 
  location.pathname.startsWith('/admin')

  // Show mobile bottom nav on ALL pages except the exclusion list
  const showMobileBottomNav = isMobile && !excludeBottomNav

  // Mobile layout WITH bottom nav (persistent across app)
  if (showMobileBottomNav) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="pb-20">
          <Outlet />
        </main>
        <MobileBottomNav />
        <ToastContainer />
      </div>
    )
  }

  // Mobile layout WITHOUT bottom nav (auth pages, landing, etc)
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <ToastContainer />
      </div>
    )
  }

  // Desktop layout: header + content + footer
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  )
}
