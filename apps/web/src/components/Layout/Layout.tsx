import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useAutoPromptPush } from '../../hooks/useAutoPromptPush';
import AuthBottomSheet from '../AuthBottomSheet';

const Layout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Auto-prompt push notification permission for authenticated users
  useAutoPromptPush();
  
  // Landing page on mobile should have footer (not bottom nav)
  const isLandingPage = location.pathname === '/welcome';
  
  // All primary mobile screens get the fullscreen treatment.
  // This ensures they fit exactly within the dynamic viewport (100dvh)
  // with proper safe-area handling and no Header/gray background leaking through.
  //
  // Detail pages (/tasks/:id, /quick-help/:id) are also fullscreen because
  // they have their own Back/Share header bar and the Layout Header would
  // overlap it (both sticky top-0, different z-indexes).
  const isFullscreenMobilePage = isMobile && (
    location.pathname === '/' ||
    location.pathname === '/tasks' || 
    location.pathname === '/quick-help' ||
    location.pathname === '/messages' ||
    location.pathname.startsWith('/messages/') ||
    location.pathname === '/work' ||
    location.pathname === '/profile' ||
    /^\/tasks\/\d+$/.test(location.pathname) ||
    /^\/quick-help\/\d+$/.test(location.pathname)
  );

  // For fullscreen mobile pages, render without header/footer but with bottom nav.
  // Use dvh so the page fits exactly within the dynamic viewport (accounting for
  // mobile browser chrome). The main area is flex-1 + overflow-hidden so child
  // pages handle their own scrolling.
  if (isFullscreenMobilePage) {
    return (
      <div
        className="flex flex-col bg-white dark:bg-gray-950"
        style={{ height: '100dvh' }}
      >
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-950"
          style={{ paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}
        >
          <Outlet />
        </main>
        <MobileBottomNav />
        <AuthBottomSheet />
      </div>
    );
  }

  // Mobile landing page - has footer (no bottom nav)
  if (isMobile && isLandingPage) {
    return (
      <div className="min-h-screen flex flex-col dark:bg-gray-950">
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
        <AuthBottomSheet />
      </div>
    );
  }

  // Mobile app pages (secondary pages like /users/:id, etc.)
  // These still get Header + bottom nav + scroll padding
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col dark:bg-gray-950">
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
        <AuthBottomSheet />
      </div>
    );
  }

  // Desktop layout with footer (no bottom nav)
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-950">
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
      <AuthBottomSheet />
    </div>
  );
};

export default Layout;
