// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; 

export default defineConfig({
  plugins: [react()],
  server: {
    // Configuración del Proxy: Redirige las llamadas /api al futuro Backend (puerto 5000)
    proxy: {
      '/api': {
        target: 'http://localhost:5000', 
        changeOrigin: true, 
        secure: false, 
      },
    },
  },
});