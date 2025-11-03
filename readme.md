# 🎮 Level-Up Gaming E-commerce

Este proyecto es una aplicación de comercio electrónico Fullstack para la tienda "Level-Up Gamer", un destino online para entusiastas de los videojuegos en Chile. El proyecto está desarrollado con React, TypeScript y Node.js/Express.

## ✨ Características Principales

- **Arquitectura Frontend/Backend Separada**: Desarrollo modular y escalable.
- **Persistencia de Datos sin Base de Datos**: Los datos de usuarios y órdenes se guardan en archivos `.json`, sobreviviendo a reinicios del servidor.
- **Sistema de Cuentas de Usuario**: Registro, inicio de sesión y actualización de perfiles.
- **Gestión de Órdenes**: Creación y seguimiento de órdenes de compra.
- **Sistema de Puntos de Fidelidad**: Los usuarios ganan puntos por registrarse, por referidos y, más importante, **por cada compra realizada**.

## ⚙️ Stack Tecnológico

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Vite, React Router | Interfaz de usuario dinámica y gestión de estado del lado del cliente. |
| **Backend** | Node.js, Express, TypeScript, SWC | Servidor API RESTful para gestionar usuarios, órdenes y productos. |
| **Estilos** | React-Bootstrap | Diseño responsivo con un tema oscuro y acentos de neón. |

---

## 💾 Persistencia de Datos (Backend)

Este proyecto **simula una base de datos utilizando archivos JSON**, lo que permite que los datos sean persistentes sin necesidad de configurar un motor de base de datos completo.

- **Ubicación**: `level-up-gaming-backend/src/db/`
- **Archivos**: 
    - `users.json`: Almacena todos los usuarios registrados, incluyendo el administrador de prueba. Aquí se actualizan los puntos de fidelidad.
    - `orders.json`: Almacena todas las órdenes de compra generadas.

Este enfoque hace que el proyecto sea completamente portable y funcional por sí mismo.

---

## 🚀 Cómo Ejecutar el Proyecto

El proyecto requiere que se ejecuten **dos servidores por separado**: uno para el Frontend y otro para el Backend.

### Requisitos
- **Node.js** (se recomienda v18 o superior)
- **npm** (generalmente se instala con Node.js)

### 1. Iniciar el Servidor Backend (Terminal 1)

```bash
# Navegar a la carpeta del backend
cd level-up-gaming-backend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar el servidor en modo de desarrollo (en http://localhost:5000)
npm run dev
```

### 2. Iniciar la Aplicación Frontend (Terminal 2)

```bash
# Navegar a la carpeta del frontend
cd level-up-gaming-frontend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar la aplicación de React (en http://localhost:5173)
npm run dev
```

Una vez completados estos pasos, abre tu navegador y visita `http://localhost:5173`.

---

## 🧪 Cómo Ejecutar las Pruebas (Frontend)

Para ejecutar los tests unitarios y de integración del frontend, usa los siguientes comandos dentro de la carpeta `level-up-gaming-frontend`:

```bash
# Ejecutar los tests una vez en la terminal
npm test

# Ejecutar tests y abrir la UI de Vitest para una vista interactiva
npx vitest --ui

# Generar un reporte de cobertura de tests
npm test -- --coverage
```