import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Define global constants that get replaced at build time
  // This avoids import.meta usage which doesn't work in React Native/Hermes
  define: {
    __VITE_API_URL__: JSON.stringify(process.env.VITE_API_URL || '')
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon-32x32.png',
        'favicon-16x16.png',
        'apple-touch-icon.png',
        'android-chrome-192x192.png',
        'android-chrome-512x512.png',
        'logo.png',
        'sw-push.js'
      ],
      manifest: {
        name: 'Kolab',
        short_name: 'Kolab',
        description: 'Earn money by helping others with everyday tasks.',
        start_url: '/',
        scope: '/',
        id: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3B82F6',
        orientation: 'portrait-primary',
        lang: 'en',
        categories: ['business', 'lifestyle', 'productivity'],
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        importScripts: ['/sw-push.js'],
        navigateFallbackDenylist: [/^\/api\/.*/],
        globPatterns: ['**/*.{js,css,html,ico,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'dicebear-avatars',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
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
                maxAgeSeconds: 60 * 60 * 24 * 7
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
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
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
