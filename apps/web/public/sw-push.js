/**
 * Push notification handlers for the Service Worker.
 * Imported by Workbox via importScripts — do NOT add install/activate
 * listeners here because Workbox already manages them through
 * skipWaiting + clientsClaim in vite.config.ts.
 */

// Handle push events
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push received:', event);
  
  let data = {
    title: 'Kolab',
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
    requireInteraction: false
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
