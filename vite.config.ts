import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are loaded relatively
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Increase limit slightly to avoid warnings for the vendor chunks themselves
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React core to ensure long-term caching (these change rarely)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // Split heavy UI libraries (Recharts is usually large)
          'vendor-ui': ['recharts', 'lucide-react'],
          
          // Split the AI SDK so it doesn't load on pages that don't need it (like Login)
          'vendor-ai': ['@google/genai']
        }
      }
    }
  },
  server: {
    port: 3000,
  }
});