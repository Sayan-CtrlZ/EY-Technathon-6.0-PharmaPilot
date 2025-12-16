import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // Reduce chunk size warning threshold
    chunkSizeWarningLimit: 1000,

    // Enable minification
    minify: 'terser',

    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'pdf-vendor': ['jspdf', 'html2canvas'],
        }
      }
    }
  },

  // Force optimization of ESM dependencies
  optimizeDeps: {
    include: ['react-markdown', 'remark-gfm']
  }
})
