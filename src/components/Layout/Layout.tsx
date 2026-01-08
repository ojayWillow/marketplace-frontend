import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useIsMobile } from '../../hooks/useIsMobile';

const Layout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Check if we're on the Tasks page (Quick Help) on mobile
  // These pages get a fullscreen mobile experience without header/footer
  const isFullscreenMobilePage = isMobile && (
    location.pathname === '/tasks' || 
    location.pathname === '/quick-help'
  );

  // For fullscreen mobile pages, render without header/footer/padding
  if (isFullscreenMobilePage) {
    return (
      <div className="min-h-screen">
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    );
  }

  // Normal layout with header and footer
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content link for keyboard users */}
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
