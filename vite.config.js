import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-icon.png', 'img/logo.jpeg'],
      workbox: {
        // Elimina automáticamente cachés creadas por versiones anteriores
        cleanupOutdatedCaches: true,
        // Obliga al nuevo Service Worker a tomar control sin esperar a reiniciar la pestaña
        clientsClaim: true,
        skipWaiting: true
      },
      manifest: {
        name: 'Meraki Sistema de Ordenes',
        short_name: 'Meraki',
        description: 'Aplicación para la toma de órdenes y gestión de cocina de Meraki.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon1.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/apple-icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore']
        }
      }
    }
  }
})