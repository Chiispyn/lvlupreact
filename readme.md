# 🎮 Level-Up Gaming E-commerce (Fullstack Mocking - Experiencia 2)

Este proyecto es una aplicación de comercio electrónico Fullstack desarrollada con **React, TypeScript, y Node.js/Express**, utilizando una arquitectura de microservicios con **Mocking de API** para simular la persistencia de datos y el flujo de la Experiencia 2.

## ⚙️ Stack Tecnológico

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | **React, TypeScript, Vitest, React Router, Axios** | Interfaz dinámica, gestión de estado (Carrito/Auth) y pruebas unitarias. |
| **Backend** | **Node.js, Express, TypeScript, SWC** | Servidor API RESTful simulando CRUD para Productos, Usuarios, y Órdenes. |
| **Estilos** | **React-Bootstrap** | Diseño responsivo con tema Dark Mode/Neon dinámico. |

---

## 🚀 Montaje y Ejecución del Proyecto

El proyecto requiere **dos servidores separados** para funcionar (Frontend en 5173 y Backend en 5000).

### 1. Requisitos Iniciales (En Cualquier Computador)

1.  Asegúrese de tener **Node.js (v18+)** y **npm** instalados.
2.  Las imágenes estáticas de la tienda (ej: `logo.png`, `ps5.png`) deben estar en la carpeta **`level-up-gaming-frontend/public/images/`**.

### 2. Inicio del Backend (Terminal 1)

El servidor de API Mocking (datos de productos, usuarios, órdenes).

```bash
# 1. Navegar y limpiar dependencias
cd level-up-gaming-backend
del /s /q node_modules package-lock.json 
npm install
# 2. Iniciar el servidor Express (Asegurar puerto 5000)
npm run dev

# 1. Navegar y limpiar dependencias
cd ../level-up-gaming-frontend
del /s /q node_modules package-lock.json 
npm install
# 2. Iniciar la Aplicación
npm run dev

npm test
# Opcional: npm test -- --coverage para ver el reporte de cobertura.