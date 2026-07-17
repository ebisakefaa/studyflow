import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    minify: false,
    target: 'es2020',
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        format: 'es',
        generatedCode: 'es2020'
      }
    }
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'react-pdf', 'pdfjs-dist'],
    force: true
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
}