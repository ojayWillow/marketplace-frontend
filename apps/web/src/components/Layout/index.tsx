import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ToastContainer from '../ui/ToastContainer'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function Layout() {
  const location = useLocation()
  const isMobile = useIsMobile()
  
  // Hide header on mobile for pages that have their own mobile-specific header
  // Currently: /tasks and /quick-help (which redirects to /tasks)
  const hideHeaderOnMobile = isMobile && (
    location.pathname === '/tasks' || 
    location.pathname === '/quick-help' ||
    location.pathname.startsWith('/tasks?')
  )

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderOnMobile && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideHeaderOnMobile && <Footer />}
      <ToastContainer />
    </div>
  )
}
