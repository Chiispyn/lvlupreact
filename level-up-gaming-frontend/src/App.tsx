// level-up-gaming-frontend/src/App.tsx (CÓDIGO COMPLETO)

import React from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom'; 

// Componentes del Layout
import Header from './components/Header';
import Footer from './components/Footer';

// Componentes de Protección
import AdminRoute from './components/AdminRoute'; 

// Componentes de Páginas Públicas y de Sesión
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CommunityPage from './pages/CommunityPage';
import RewardsPage from './pages/RewardsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import LoginPage from './pages/LoginPage';         
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// Componentes de Checkout y Pedidos
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';

// 🚨 Componentes de Administración (Verificar importación)
import AdminDashboard from './pages/AdminDashboard'; 
import AdminProductsPage from './pages/AdminProductsPage'; 
import AdminOrdersPage from './pages/AdminOrdersPage'; 
import AdminUsersPage from './pages/AdminUsersPage'; 
import AdminEventsPage from './pages/AdminEventsPage'; 
import AdminBlogPage from './pages/AdminBlogPage'; 
import AdminVideosPage from './pages/AdminVideosPage'; 
import AdminRewardsPage from './pages/AdminRewardsPage'; // 🚨 IMPORTACIÓN CRÍTICA
import ProductDetailPage from './pages/ProductDetailPage';


const App: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100"> 
      
      <Header />
      
      <main className="flex-grow-1"> 
        <Routes>
          
          {/* =================================== */}
          {/* 1. RUTAS PÚBLICAS Y DE AUTENTICACIÓN */}
          {/* =================================== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/comunidad" element={<CommunityPage />} />
          <Route path="/recompensas" element={<RewardsPage />} /> 
          <Route path="/blog" element={<BlogPage />} /> 
          <Route path="/blog/:id" element={<BlogPostPage />} />
          
          {/* Rutas de Sesión y Perfil */}
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Rutas de Compra y Pedidos */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/myorders" element={<MyOrdersPage />} /> 

          {/* Ruta de detalle de producto (futura) */}
          <Route path="/producto/:id" element={<ProductDetailPage />} /> 
          

          {/* ============================================================== */}
          {/* 2. RUTAS PROTEGIDAS PARA ADMINISTRADORES */}
          {/* ============================================================== */}
          <Route path="/admin" element={<AdminRoute />}>
              <Route index element={<AdminDashboard />} /> 
              <Route path="products" element={<AdminProductsPage />} /> 
              <Route path="orders" element={<AdminOrdersPage />} /> 
              <Route path="users" element={<AdminUsersPage />} /> 
              <Route path="events" element={<AdminEventsPage />} /> 
              <Route path="blog" element={<AdminBlogPage />} /> 
              <Route path="videos" element={<AdminVideosPage />} />
              
              <Route path="rewards" element={<AdminRewardsPage />} /> {/* 🚨 RUTA CRÍTICA AÑADIDA */}
          </Route>
          

          {/* =================================== */}
          {/* 3. RUTA 404 (Not Found) */}
          {/* =================================== */}
          <Route path="*" element={
            <Container className="py-5">
              <h1>404: Página no encontrada</h1>
              <p>El recurso que buscas no existe en Level-Up Gaming.</p>
            </Container>
          } />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;