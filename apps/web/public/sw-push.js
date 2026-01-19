/**
 * Service Worker for Push Notifications
 * Handles incoming push notifications and notification clicks
 */

// Cache name for offline assets
const CACHE_NAME = 'marketplace-v1';

// Handle push events
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push received:', event);
  
  let data = {
    title: 'Marketplace',
    body: 'You have a new notification',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: { url: '/' }
  };
  
  // Parse the push data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        tag: payload.tag,
        data: payload.data || data.data
      };
    } catch (e) {
      console.error('[Service Worker] Error parsing push data:', e);
    }
  }
  
  // Show the notification
  const promiseChain = self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [100, 50, 100],
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' }
    ]
  });
  
  event.waitUntil(promiseChain);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click:', event);
  
  event.notification.close();
  
  // Handle action buttons
  if (event.action === 'close') {
    return;
  }
  
  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/';
  
  // Open or focus the app
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(function(windowClients) {
    // Check if there's already a window open
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      // If we already have a window, focus it and navigate
      if ('focus' in client) {
        return client.focus().then(function(focusedClient) {
          if ('navigate' in focusedClient) {
            return focusedClient.navigate(urlToOpen);
          }
        });
      }
    }
    // If no window is open, open a new one
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen);
    }
  });
  
  event.waitUntil(promiseChain);
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('[Service Worker] Notification closed:', event);
});

// Handle service worker install
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating...');
  // Claim all clients immediately
  event.waitUntil(clients.claim());
});
