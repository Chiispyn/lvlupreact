// level-up-gaming-frontend/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './index.css'; 
import { BrowserRouter } from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext.tsx'; 
import { CartProvider } from './context/CartContext.tsx'; // 🚨 Importar CartProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider> {/* 🚨 NUEVO: Envolver con CartProvider */}
            <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);