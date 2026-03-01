import { initSentry } from './lib/sentry';
initSentry();

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { ThemeProvider } from './hooks/useTheme'
import App from './App'
import '@marketplace/shared/src/i18n' // Import i18n from shared package to initialize it
import './index.css'

// Handle chunk loading errors after new deployments
// When old JS chunks are gone, the browser gets HTML instead of JS and throws a MIME type error
window.addEventListener('error', (e) => {
  const msg = e.message || '';
  if (
    msg.includes('MIME type') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module')
  ) {
    // Only reload once to avoid infinite loops
    const reloadKey = 'chunk-reload';
    const lastReload = sessionStorage.getItem(reloadKey);
    const now = Date.now();
    if (!lastReload || now - Number(lastReload) > 10000) {
      sessionStorage.setItem(reloadKey, String(now));
      window.location.reload();
    }
  }
});

// Also catch unhandled promise rejections (dynamic import() returns promises)
window.addEventListener('unhandledrejection', (e) => {
  const msg = e.reason?.message || '';
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Importing a module script failed')
  ) {
    const reloadKey = 'chunk-reload';
    const lastReload = sessionStorage.getItem(reloadKey);
    const now = Date.now();
    if (!lastReload || now - Number(lastReload) > 10000) {
      sessionStorage.setItem(reloadKey, String(now));
      window.location.reload();
    }
  }
});

// Service worker is registered by Vite PWA plugin
// Push notification handlers are imported via workbox.importScripts in vite.config.ts

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
