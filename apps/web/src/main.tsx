import { initSentry } from './lib/sentry';
initSentry();

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { ThemeProvider } from './hooks/useTheme'
import App from './App'
import '@marketplace/shared/src/i18n'
import './index.css'

// Handle chunk loading errors after new deployments (Issues KOLAB-WEB-2, 3, 5)
// Vite fires this event when a dynamic import preload fails
window.addEventListener('vite:preloadError', () => {
  const reloadKey = 'chunk-reload';
  const lastReload = sessionStorage.getItem(reloadKey);
  const now = Date.now();
  if (!lastReload || now - Number(lastReload) > 10000) {
    sessionStorage.setItem(reloadKey, String(now));
    window.location.reload();
  }
});

// Fallback: catch MIME type and dynamic import errors not caught by vite:preloadError
window.addEventListener('error', (e) => {
  const msg = e.message || '';
  if (
    msg.includes('MIME type') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module')
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

window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason;
  const msg = reason?.message || String(reason || '');

  // Chunk loading errors — auto-reload (KOLAB-WEB-2, 3, 5)
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
    return;
  }

  // reCAPTCHA timeout rejections — suppress (KOLAB-WEB-9, KOLAB-WEB-8)
  // Firebase reCAPTCHA rejects with plain string "Timeout" or "Timeout (u)"
  if (typeof reason === 'string' && reason.startsWith('Timeout')) {
    e.preventDefault();
    return;
  }

  // IndexedDB connection lost — suppress (KOLAB-WEB-C)
  // iOS Safari kills IndexedDB connections when app is backgrounded
  if (msg.includes('Indexed Database') || msg.includes('IndexedDB')) {
    e.preventDefault();
    return;
  }
});

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
