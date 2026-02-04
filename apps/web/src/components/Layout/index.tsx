import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'
import ToastContainer from '../ui/ToastContainer'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function Layout() {
  const location = useLocation()
  const isMobile = useIsMobile()
  
  // Pages that get fullscreen mobile experience (no header/footer, just bottom nav)
  const isFullscreenMobilePage = isMobile && (
    location.pathname === '/tasks' || 
    location.pathname === '/quick-help' ||
    location.pathname === '/messages' ||
    location.pathname.startsWith('/messages/')
  )

  // Fullscreen mobile pages: no header/footer, just content + bottom nav
  if (isFullscreenMobilePage) {
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

  // Mobile layout: header + content + bottom nav (no footer)
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pb-20">
          <Outlet />
        </main>
        <MobileBottomNav />
        <ToastContainer />
      </div>
    )
  }

  // Desktop layout: header + content + footer (no bottom nav)
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
