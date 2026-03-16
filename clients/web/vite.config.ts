import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://arnostar.by',
        changeOrigin: true,
        secure: false
      },
      '/video': {
        target: 'https://arnostar.by',
        changeOrigin: true,
        secure: false
      },
    }
  }
})
