// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // Usando el plugin SWC para velocidad

export default defineConfig({
  plugins: [react()],
  
  // ======================================
  // CONFIGURACIÓN DE DESARROLLO (Proxy/CORS)
  // ======================================
  server: {
    // Redirige /api al servidor de Node.js (Backend, puerto 5000)
    proxy: {
      '/api': {
        target: 'http://localhost:5000', 
        changeOrigin: true, // Necesario para que el Backend acepte la petición
        secure: false,
      },
    },
  },
  
  // ======================================
  // CONFIGURACIÓN DE PRUEBAS UNITARIAS (VITEST)
  // ======================================
  test: {
    globals: true, // Habilita expect, describe, it globalmente
    environment: 'jsdom', // Simula el entorno del navegador para probar componentes React
    setupFiles: './src/setupTests.ts', // Archivo de configuración inicial (para jest-dom)
    css: true // Permite a Vitest ignorar la importación de archivos CSS (como Bootstrap)
  },
});