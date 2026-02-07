import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import { useIsMobile } from '../../hooks/useIsMobile';

const Layout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Landing page on mobile should have footer (not bottom nav)
  const isLandingPage = location.pathname === '/welcome';
  
  // Check if we're on pages that need fullscreen mobile experience
  // These pages get a fullscreen mobile experience without header/footer
  const isFullscreenMobilePage = isMobile && (
    location.pathname === '/tasks' || 
    location.pathname === '/quick-help' ||
    location.pathname === '/messages' ||
    location.pathname.startsWith('/messages/')
  );

  // For fullscreen mobile pages, render without header/footer but with bottom nav
  if (isFullscreenMobilePage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main id="main-content" tabIndex={-1} className="pb-20">
          <Outlet />
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  // Mobile landing page - has footer (no bottom nav)
  if (isMobile && isLandingPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          Skip to main content
        </a>
        
        <Header />
        
        <main 
          id="main-content" 
          className="flex-1"
          tabIndex={-1}
        >
          <Outlet />
        </main>
        
        <Footer />
      </div>
    );
  }

  // Mobile app pages - has bottom nav (no footer)
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          Skip to main content
        </a>
        
        <Header />
        
        <main 
          id="main-content" 
          className="flex-1 container mx-auto px-4 py-8 max-w-7xl pb-24"
          tabIndex={-1}
        >
          <Outlet />
        </main>
        
        <MobileBottomNav />
      </div>
    );
  }

  // Desktop layout with footer (no bottom nav)
  return (
    <div className="min-h-screen flex flex-col">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
      >
        Skip to main content
      </a>
      
      <Header />
      
      <main 
        id="main-content" 
        className="flex-1 container mx-auto px-4 py-8 max-w-7xl"
        tabIndex={-1}
      >
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
