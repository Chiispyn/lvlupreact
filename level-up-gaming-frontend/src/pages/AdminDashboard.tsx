// level-up-gaming-frontend/src/pages/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { Users, Package, ShoppingCart, BookOpen, Settings, MapPin, Video, DollarSign, AlertTriangle, Award } from 'react-feather'; 
import { Link } from 'react-router-dom';
import axios from 'axios';

// Interfaz para el producto que cargaremos desde la API
interface Product {
    id: string;
    name: string;
    countInStock: number;
}
// Interfaz simplificada para la orden
interface Order {
    id: string;
    totalPrice: number;
    createdAt: string;
    items: any[];
}

// URL de la API de productos y órdenes
const API_URL_PRODUCTS = '/api/products';
const API_URL_ORDERS = '/api/orders';

// Formato CLP
const CLP_FORMATTER = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
const formatClp = (amount: number) => CLP_FORMATTER.format(amount);

// Umbral de stock crítico
const CRITICAL_STOCK_LEVEL = 5;


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
    const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
    const [ordersToday, setOrdersToday] = useState<number>(0);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [topSellingProductName, setTopSellingProductName] = useState<string>('Cargando...');
    const [loadingStock, setLoadingStock] = useState(true);
    
    // Función para obtener todos los productos y verificar el stock
    const fetchStockStatus = async () => {
        try {
            const { data } = await axios.get(API_URL_PRODUCTS); 
            
            const lowStock = data.filter((p: Product) => p.countInStock <= CRITICAL_STOCK_LEVEL);
            setLowStockItems(lowStock);
        } catch (error) {
            console.error("Fallo al verificar el stock.");
        } 
    };

    // 🚨 FUNCIÓN RESTAURADA: Cálculo de Ventas y Estadísticas
    const fetchAnalytics = async () => {
        setLoadingStock(true);
        try {
            const { data: allOrders } = await axios.get(API_URL_ORDERS); // GET /api/orders (todas las órdenes)
            
            const today = new Date().toISOString().slice(0, 10);
            let revenue = 0;
            let ordersCountToday = 0;
            const productSales: { [key: string]: number } = {};

            allOrders.forEach((order: Order) => {
                // Cálculo de órdenes y revenue
                revenue += order.totalPrice;
                if (order.createdAt.slice(0, 10) === today) {
                    ordersCountToday++;
                }

                // Cálculo de Top Producto
                order.items.forEach(item => {
                    const itemName = item.product.name;
                    productSales[itemName] = (productSales[itemName] || 0) + item.quantity;
                });
            });

            // Determinar el producto más vendido
            let topProduct = 'N/A';
            let maxSales = 0;
            for (const name in productSales) {
                if (productSales[name] > maxSales) {
                    maxSales = productSales[name];
                    topProduct = name;
                }
            }

            setTotalRevenue(revenue);
            setOrdersToday(ordersCountToday);
            setTopSellingProductName(topProduct);

        } catch (error) {
            setTopSellingProductName('Error de carga');
            console.error("Fallo al cargar la analítica.");
        } finally {
            setLoadingStock(false); 
        }
    };
    
    useEffect(() => {
        fetchStockStatus();
        fetchAnalytics(); // 🚨 Llamada a la analítica restaurada
    }, []);


    return (
        <Container className="py-5">
            <h1 className="text-center mb-5 display-4" style={{ color: '#1E90FF' }}><Settings className="me-3" size={36}/> Panel de Administración</h1>
            
            {/* 🚨 ALERTA CRÍTICA DE BAJO STOCK */}
            {lowStockItems.length > 0 && !loadingStock && (
                <Alert variant="danger" className="mb-4 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <AlertTriangle size={24} className="me-3"/>
                        <strong>ALERTA DE INVENTARIO:</strong> {lowStockItems.length} producto(s) están por debajo de {CRITICAL_STOCK_LEVEL} unidades. 
                    </div>
                    <Link to="/admin/products" className="btn btn-sm btn-outline-danger">Gestionar Stock</Link>
                </Alert>
            )}

            {/* 🚨 SECCIÓN RESTAURADA: DATOS ANALÍTICOS (BOLETÍN DINÁMICO) */}
            <h2 className="mt-5 pt-3 border-top" style={{ color: '#39FF14' }}>Boletín de Ventas (Datos Reales)</h2>
            <Row className="mb-5">
                <Col md={4} className="mb-3">
                    <Card style={{ backgroundColor: '#222', border: '1px solid #39FF14', color: 'white' }}>
                        <Card.Body>
                            <DollarSign size={24} style={{ color: '#39FF14' }}/>
                            <Card.Title className="mt-2" style={{ color: 'var(--color-gris-claro)' }}>Ingresos Totales</Card.Title>
                            <Card.Text className="display-6" style={{ color: '#1E90FF' }}>
                                {loadingStock ? <Spinner animation="border" size="sm"/> : formatClp(totalRevenue)}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card style={{ backgroundColor: '#222', border: '1px solid #1E90FF', color: 'white' }}>
                        <Card.Body>
                            <ShoppingCart size={24} style={{ color: '#1E90FF' }}/>
                            <Card.Title className="mt-2" style={{ color: 'var(--color-gris-claro)' }}>Órdenes Nuevas (Hoy)</Card.Title>
                            <Card.Text className="display-6" style={{ color: '#39FF14' }}>
                                {loadingStock ? <Spinner animation="border" size="sm"/> : ordersToday}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card style={{ backgroundColor: '#222', border: '1px solid #1E90FF', color: 'white' }}>
                        <Card.Body>
                            <Package size={24} style={{ color: '#39FF14' }}/>
                            <Card.Title className="mt-2" style={{ color: 'var(--color-gris-claro)' }}>Producto Más Vendido</Card.Title>
                            <Card.Text className="lead" style={{ color: '#1E90FF', fontWeight: 'bold' }}>
                                {loadingStock ? <Spinner animation="border" size="sm"/> : topSellingProductName}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            

            {/* SECCIÓN DE NAVEGACIÓN (Admin Cards) */}
            <h2 className="mt-5 pt-3 border-top" style={{ color: '#39FF14' }}>Herramientas de Gestión</h2>
            <Row className="justify-content-center">
                
                <AdminCard title="Gestión de Productos" icon={<Package size={48} />} to="/admin/products" />
                <AdminCard title="Gestión de Órdenes" icon={<ShoppingCart size={48} />} to="/admin/orders" />
                <AdminCard title="Gestión de Usuarios" icon={<Users size={48} />} to="/admin/users" />
                <AdminCard title="Gestión de Eventos" icon={<MapPin size={48} />} to="/admin/events" />
                <AdminCard title="Gestión de Recompensas" icon={<Award size={48} />} to="/admin/rewards" />
                <AdminCard title="Gestión de Blog/Noticias" icon={<BookOpen size={48} />} to="/admin/blog" />
                <AdminCard title="Gestión de Videos" icon={<Video size={48} />} to="/admin/videos" />
            
            </Row>

        </Container>
    );
};

export default AdminDashboard;