import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'
import ToastContainer from '../ui/ToastContainer'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function Layout() {
  const location = useLocation()
  const isMobile = useIsMobile()
  
  // Pages that show the mobile bottom nav (only the tasks/map page)
  const showMobileBottomNav = isMobile && (
    location.pathname === '/tasks' || 
    location.pathname === '/quick-help'
  )

  // Fullscreen mobile pages: no header/footer, just content + bottom nav
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

  // Mobile layout without bottom nav (messages, profile, etc)
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
