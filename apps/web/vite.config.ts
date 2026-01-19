import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'favicon-32x32.png', 'favicon-16x16.png', 'apple-touch-icon.png', 'logo.svg', 'sw-push.js'],
      manifest: {
        name: 'Quick Help - Local Task Marketplace',
        short_name: 'Quick Help',
        description: 'Get help with everyday tasks or earn money by helping others. Dog walking, moving, cleaning, repairs, and more in Latvia.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3B82F6',
        orientation: 'portrait-primary',
        lang: 'en',
        categories: ['business', 'lifestyle', 'productivity'],
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Browse Tasks',
            short_name: 'Tasks',
            description: 'Find tasks near you or post your own',
            url: '/tasks',
            icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'My Applications',
            short_name: 'Applications',
            description: 'View your task applications',
            url: '/applications',
            icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        // Import the push notification handlers into the service worker
        importScripts: ['/sw-push.js'],
        // Don't cache API routes - always fetch fresh data
        navigateFallbackDenylist: [/^\/api\/.*/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'dicebear-avatars',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/uploads\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'uploaded-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        // Disable service worker in development to avoid caching issues
        enabled: false
      }
    })
  ],
  optimizeDeps: {
    exclude: ['react-native']
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web'
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
