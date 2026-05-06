import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind CSS v4 dùng Vite plugin thay vì PostCSS
  ],
  server: {
    port: 5173,
    // Proxy API calls đến backend Spring Boot — tránh CORS trong dev
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
    },
  },
})
