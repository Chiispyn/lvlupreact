# 🎮 Level-Up Gaming E-commerce

Este proyecto es una aplicación de comercio electrónico Fullstack para la tienda "Level-Up Gamer", un destino online para entusiastas de los videojuegos en Chile. El proyecto está desarrollado con React, TypeScript y Node.js/Express.

## ✨ Características Principales

- **Arquitectura Frontend/Backend Separada**: Desarrollo modular y escalable.
- **Persistencia de Datos sin Base de Datos**: Los datos de usuarios, órdenes, productos, blogs, eventos, recompensas y videos se guardan en archivos `.json`, sobreviviendo a reinicios del servidor. Las operaciones CRUD realizadas desde el panel de administración ahora se persisten en estos archivos.
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
    - `blog.json`: Almacena las entradas del blog.
    - `event.json`: Almacena los eventos.
    - `reward.json`: Almacena las recompensas.
    - `product.json`: Almacena los productos.
    - `video.json`: Almacena los videos.

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


Tests Implementados

Hemos agregado tests para la página AdminDashboard usando data-testid en los componentes críticos. Los tests verifican que:

Tarjetas de Administración (AdminCard) se renderizan correctamente:

card-products, card-orders, card-users, card-events, card-rewards, card-blog, card-videos.

Esto asegura que los enlaces a cada sección de administración existan.

Cards de Analítica se muestran correctamente:

card-total-revenue: Muestra los ingresos totales.

card-orders-today: Muestra la cantidad de órdenes de hoy.

card-top-product: Muestra el producto más vendido.

Alerta de Stock Bajo (alert-low-stock) se renderiza si hay productos con stock crítico.

Ejemplo de Test con Vitest / React Testing Library
import { render, screen } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import { BrowserRouter } from 'react-router-dom';

describe('AdminDashboard', () => {
  test('renderiza todas las tarjetas de administración', () => {
    render(<BrowserRouter><AdminDashboard /></BrowserRouter>);
    expect(screen.getByTestId('card-products')).toBeInTheDocument();
    expect(screen.getByTestId('card-orders')).toBeInTheDocument();
    expect(screen.getByTestId('card-users')).toBeInTheDocument();
  });

  test('renderiza cards de analítica', () => {
    render(<BrowserRouter><AdminDashboard /></BrowserRouter>);
    expect(screen.getByTestId('card-total-revenue')).toBeInTheDocument();
    expect(screen.getByTestId('card-orders-today')).toBeInTheDocument();
    expect(screen.getByTestId('card-top-product')).toBeInTheDocument();
  });

  test('muestra alerta de stock bajo si hay productos críticos', async () => {
    render(<BrowserRouter><AdminDashboard /></BrowserRouter>);
    // Nota: Este test requiere que la API devuelva al menos un producto con stock <= 5
    const alert = await screen.findByTestId('alert-low-stock');
    expect(alert).toBeInTheDocument();
  });
});

Cómo Funciona Cada Test

render: Renderiza el componente en un entorno de pruebas simulando un navegador real.

screen.getByTestId: Busca un elemento por el atributo data-testid.

toBeInTheDocument: Asegura que el elemento realmente existe en el DOM.

findByTestId: Busca elementos que pueden aparecer después de una acción asíncrona (por ejemplo, datos cargados desde la API).

expect(...).toBeInTheDocument(): Compara que el componente esperado esté presente, garantizando que la UI se renderiza correctamente y los tests detecten fallos si algo no aparece.