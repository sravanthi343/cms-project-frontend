import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://cms-project-frontend.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
