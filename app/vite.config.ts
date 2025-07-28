import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
})
