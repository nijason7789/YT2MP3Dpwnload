import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/YT2MP3Dpwnload/' : '/',
  define: {
    // Replace process.env.VITE_RAPIDAPI_KEY with the actual value at build time
    'process.env.VITE_RAPIDAPI_KEY': JSON.stringify(process.env.VITE_RAPIDAPI_KEY)
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  }
})
