// level-up-gaming-frontend/src/components/Header.tsx

import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogIn, User, ShoppingBag } from 'react-feather'; 
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// 🚨 URL del logo, accesible desde la carpeta /public
const LOGO_URL = '/images/logo.png'; 

const Header: React.FC = () => {
    const { user, isLoggedIn, logout } = useAuth();
    const { cartCount } = useCart(); 
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Cierra la sesión
        navigate('/'); // Redirige al inicio
    };
    
    // Definición del Menú Desplegable para Usuarios Logueados
    const UserDropdown = (
        <NavDropdown 
            title={user ? user.name : 'Usuario'} 
            id="user-nav-dropdown"
            align="end"
            className="ms-2" 
        >
            {user && user.role === 'admin' && (
                <NavDropdown.Item as={Link} to="/admin">
                    Panel Admin
                </NavDropdown.Item>
            )}
            <NavDropdown.Item as={Link} to="/profile">
                <User size={16} className="me-2"/> Mi Perfil
            </NavDropdown.Item>
            {/* Historial de Compras */}
            <NavDropdown.Item as={Link} to="/myorders">
                <ShoppingBag size={16} className="me-2"/> Mis Órdenes
            </NavDropdown.Item>
            
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout}>
                Cerrar Sesión
            </NavDropdown.Item>
        </NavDropdown>
    );

    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
            <Container>
                {/* 🚨 USO DEL LOGO EN LA MARCA DEL SITIO */}
                <Navbar.Brand as={Link} to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <img src={LOGO_URL} alt="Level-Up Logo" height="30" className="d-inline-block align-top me-2"/>
                    Level-Up Gaming
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Enlaces Principales de Navegación */}
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Inicio</Nav.Link>
                        <Nav.Link as={Link} to="/productos">Productos</Nav.Link>
                        <Nav.Link as={Link} to="/comunidad">Comunidad</Nav.Link>
                        <Nav.Link as={Link} to="/recompensas">Recompensas</Nav.Link>
                        <Nav.Link as={Link} to="/blog">Blog</Nav.Link>
                    </Nav>

                    {/* Íconos y Acciones de la Derecha */}
                    <Nav>
                        {/* Enlace al Carrito */}
                        <Nav.Link as={Link} to="/carrito" className="d-flex align-items-center me-3">
                            <ShoppingCart size={20} className="me-1" />
                            Carrito ({cartCount}) 
                        </Nav.Link>

                        {/* LÓGICA CONDICIONAL: Muestra UserDropdown o Botón de Login */}
                        {isLoggedIn ? (
                            UserDropdown
                        ) : (
                            <Link 
                                to="/login" 
                                className="btn btn-outline-primary d-flex align-items-center"
                                role="button"
                            >
                                <LogIn size={20} className="me-1" />
                                Iniciar Sesión
                            </Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;