// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ✅ Configuración completa con reporter HTML para Vitest
export default defineConfig({
  plugins: [react()],

  // ======================================
  // CONFIGURACIÓN DE DESARROLLO (Proxy/CORS)
  // ======================================
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ======================================
  // CONFIGURACIÓN DE PRUEBAS UNITARIAS (VITEST)
  // ======================================
  test: {
    globals: true, // Habilita expect, describe, it globalmente
    environment: 'jsdom', // Simula entorno del navegador
    setupFiles: './src/setupTests.ts', // Config inicial (por ejemplo, jest-dom)
    css: true, // Permite importar CSS sin errores

    // 🧾 Reporte visual tipo "Swagger" (HTML)
    reporters: ['default', 'html'],
    outputFile: 'test-report.html', // 📄 archivo generado en la raíz del proyecto
  },
});
