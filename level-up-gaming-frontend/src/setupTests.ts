// level-up-gaming-frontend/src/setupTests.ts (COMPLETO Y CORREGIDO)

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 🚨 CORRECCIÓN CRÍTICA: Simulación de la función FileReader nativa
// Esto resuelve el error de 'global.FileReader' y '...actual' en el contexto de Base64
class MockFileReader extends FileReader {
    constructor() {
        super();
        // Simular las funciones necesarias
        this.readAsDataURL = vi.fn(function (this: any) {
            // Ejecuta el onloadend de forma asíncrona para simular la lectura
            setTimeout(() => {
                if (this.onloadend) {
                    this.onloadend({ target: { result: 'data:image/png;base64,mocked_base64_data' } } as any);
                }
            }, 100);
        });
    }
}
vi.stubGlobal('FileReader', MockFileReader); // Usa stubGlobal para reemplazar la clase

// MOCKING NECESARIO PARA URLs
global.URL.createObjectURL = vi.fn(() => 'mocked_local_url');
global.URL.revokeObjectURL = vi.fn();

// 🚨 El mock de 'react-router-dom' debe ser implementado en los archivos de prueba o aquí si es global.
// Lo mantendremos en los archivos de prueba para mayor modularidad.