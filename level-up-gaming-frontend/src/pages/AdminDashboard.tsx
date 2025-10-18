// level-up-gaming-frontend/src/pages/AdminDashboard.tsx

import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Users, Package, ShoppingCart, BookOpen, Settings, MapPin, Video } from 'react-feather'; 
import { Link } from 'react-router-dom';

// Componente para una tarjeta de acceso rápido
const AdminCard: React.FC<{ title: string; icon: React.ReactNode; to: string }> = ({ title, icon, to }) => (
    <Col xs={12} md={6} lg={4} className="mb-4">
        <Card className="h-100 shadow-sm border-0 text-center" style={{ backgroundColor: '#111', border: '1px solid #1E90FF', color: 'white' }}>
            <Card.Body>
                <div className="mb-3" style={{ color: '#1E90FF' }}>{icon}</div>
                <Card.Title style={{ color: '#39FF14' }}>{title}</Card.Title>
                <Link to={to} className="btn btn-outline-primary mt-2">
                    Administrar
                </Link>
            </Card.Body>
        </Card>
    </Col>
);


const AdminDashboard: React.FC = () => {
    return (
        <Container className="py-5">
            <h1 className="text-center mb-5 display-4" style={{ color: '#1E90FF' }}><Settings className="me-3" size={36}/> Panel de Administración</h1>
            <p className="text-center lead mb-5 text-muted">
                Bienvenido al centro de control de Level-Up Gaming.
            </p>

            <Row className="justify-content-center">
                
                <AdminCard 
                    title="Gestión de Productos" 
                    icon={<Package size={48} />} 
                    to="/admin/products" 
                />
                
                <AdminCard 
                    title="Gestión de Órdenes" 
                    icon={<ShoppingCart size={48} />} 
                    to="/admin/orders" 
                />

                <AdminCard 
                    title="Gestión de Usuarios" 
                    icon={<Users size={48} />} 
                    to="/admin/users" 
                />
                
                <AdminCard 
                    title="Gestión de Eventos" 
                    icon={<MapPin size={48} />} 
                    to="/admin/events" 
                />

                <AdminCard 
                    title="Gestión de Blog/Noticias" 
                    icon={<BookOpen size={48} />} 
                    to="/admin/blog" 
                />

                {/* 🚨 TARJETA AÑADIDA: GESTIÓN DE VIDEOS */}
                <AdminCard 
                    title="Gestión de Videos" 
                    icon={<Video size={48} />} 
                    to="/admin/videos" 
                />
            
            </Row>

            <h2 className="mt-5 pt-3 border-top" style={{ color: '#39FF14' }}>Boletín de Ventas</h2>
            <Card className="shadow-sm" style={{ backgroundColor: '#222', color: 'white' }}>
                <Card.Body>
                    <p className="text-muted">
                        **(Simulación de Ventas):** Aquí se mostrarían gráficos de ventas, ingresos, y productos más vendidos en tiempo real.
                    </p>
                    <Link to="/admin/orders" className="btn btn-success">Ver Órdenes Pendientes</Link>
                </Card.Body>
            </Card>


        </Container>
    );
};

export default AdminDashboard;