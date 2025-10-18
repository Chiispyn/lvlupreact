// level-up-gaming-frontend/src/pages/AdminOrdersPage.tsx (Código Completo)

import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Alert, Spinner, Badge, Button, Modal, ListGroup, Row, Col, Form } from 'react-bootstrap';
import { ShoppingBag, Truck, Check, X, ArrowLeft, Eye, Clock, Box } from 'react-feather';
import { Link } from 'react-router-dom';
import axios from 'axios';

// 🚨 Interfaces de la Orden (Actualizadas)
interface ShippingAddress { street: string; city: string; region: string; zipCode?: string; }
interface CartItem { product: { name: string; price: number }; quantity: number; }
type OrderStatus = 'Pendiente' | 'Preparacion' | 'Enviada' | 'Entregada';

interface Order {
    id: string; userId: string; items: CartItem[]; shippingAddress: ShippingAddress; 
    paymentMethod: string; totalPrice: number; status: OrderStatus; // Uso del nuevo tipo
    isPaid: boolean; isDelivered: boolean; createdAt: string; shippingPrice: number;
}

const API_URL = '/api/orders';

// ----------------------------------------------------
// PÁGINA PRINCIPAL DE ADMINISTRACIÓN DE ÓRDENES
// ----------------------------------------------------

const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    
    // 🚨 NUEVO ESTADO: Para la notificación de éxito/error de la actualización
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);


    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(API_URL); 
            const cleanedData = data.map((order: any) => ({
                ...order,
                status: order.status || 'Pendiente', 
            }));
            setOrders(cleanedData.reverse());
            setError(null);
            // Limpiar mensaje de estado al recargar
            setStatusMessage(null); 
        } catch (err: any) {
            setError('Error al cargar las órdenes. ¿Estás logueado como Admin y el Backend está corriendo?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);
    
    // Función para obtener el color de la Badge según el estado
    const getStatusVariant = (status: OrderStatus) => {
        switch (status) {
            case 'Pendiente': return 'danger';
            case 'Preparacion': return 'primary';
            case 'Enviada': return 'warning';
            case 'Entregada': return 'success';
            default: return 'secondary';
        }
    };
    
    // Función para actualizar el estado en la lista local (tras la llamada a la API)
    const updateLocalOrder = (updatedOrder: Order) => {
        setOrders(prevOrders => 
            prevOrders.map(order => order.id === updatedOrder.id ? updatedOrder : order)
        );
        // 🚨 Mostrar mensaje de éxito
        setStatusMessage({ msg: `Orden #${updatedOrder.id.slice(0, 8)} actualizada a: ${updatedOrder.status.toUpperCase()}.`, type: 'success' });
    };

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
    
    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <Link to="/admin">
                    <Button variant="outline-secondary" size="sm">
                        <ArrowLeft size={16} className="me-2"/> Volver al Panel
                    </Button>
                </Link>
                <h1 style={{ color: '#1E90FF' }}>Gestión de Ventas</h1>
                <p className="text-muted mb-0">Total de Órdenes: {orders.length}</p>
            </div>
            
            {/* 🚨 COMPONENTE DE NOTIFICACIÓN ESTILIZADA */}
            {statusMessage && (
                <Alert variant={statusMessage.type} onClose={() => setStatusMessage(null)} dismissible className="mb-4">
                    {statusMessage.msg}
                </Alert>
            )}
            
            <Table striped bordered hover responsive style={{ backgroundColor: '#111', color: 'white' }}>
                <thead>
                    <tr>
                        <th>ID Orden</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Destino</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td style={{ color: '#1E90FF', fontSize: '0.85rem' }}>{order.id.slice(0, 8)}...</td>
                            <td>{new Date(order.createdAt).toLocaleDateString('es-CL')}</td>
                            <td style={{ color: '#39FF14' }}>${order.totalPrice.toFixed(2)}</td>
                            <td>{order.shippingAddress.city}</td>
                            <td>
                                <Badge bg={getStatusVariant(order.status as OrderStatus)}>
                                    {order.status.toUpperCase()}
                                </Badge>
                            </td>
                            <td>
                                <Button variant="info" size="sm" className="me-2" onClick={() => setSelectedOrder(order)}>
                                    <Eye size={14} /> Detalles
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <OrderDetailModal order={selectedOrder} handleClose={() => setSelectedOrder(null)} updateLocalOrder={updateLocalOrder} />
        </Container>
    );
};

export default AdminOrdersPage;


// ----------------------------------------------------
// COMPONENTE MODAL DE DETALLES DE ORDEN (AUXILIAR)
// ----------------------------------------------------

interface DetailModalProps {
    order: Order | null;
    handleClose: () => void;
    updateLocalOrder: (order: Order) => void;
}

const OrderDetailModal: React.FC<DetailModalProps> = ({ order, handleClose, updateLocalOrder }) => {
    const [newStatus, setNewStatus] = useState<OrderStatus>(order?.status as OrderStatus || 'Pendiente');
    const [loading, setLoading] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);

    useEffect(() => {
        if (order) {
            setNewStatus(order.status as OrderStatus);
            setUpdateError(null);
        }
    }, [order]);

    if (!order) return null;
    
    const subtotalItems = order.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    const handleStatusChange = async (e: FormEvent) => {
        e.preventDefault(); 
        setLoading(true);
        setUpdateError(null);
        
        if (newStatus === order.status) {
            setUpdateError('El estado seleccionado ya es el actual.');
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.put(`${API_URL}/${order.id}/status`, { status: newStatus });
            
            // 🚨 Llamar a la función del padre (AdminOrdersPage) para actualizar la tabla y mostrar el mensaje
            updateLocalOrder(data); 
            handleClose();

        } catch (error) {
            setUpdateError('Fallo en la API al guardar el nuevo estado.');
        } finally {
            setLoading(false);
        }
    };
    
    // Función para obtener el color de la Badge según el estado
    const getStatusVariant = (status: OrderStatus) => {
        switch (status) {
            case 'Pendiente': return 'danger';
            case 'Preparacion': return 'primary';
            case 'Enviada': return 'warning';
            case 'Entregada': return 'success';
            default: return 'secondary';
        }
    };


    return (
        <Modal show={!!order} onHide={handleClose} size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#1E90FF' }}>Detalle de Orden #{order.id.slice(0, 8)}...</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <Row>
                    <Col md={6}>
                        <h5 style={{ color: '#39FF14' }}>Información de Envío</h5>
                        <p className="text-muted">**Destino:** {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.region}</p>
                        <p className="text-muted">**Método Pago:** {order.paymentMethod.toUpperCase()}</p>
                        <p className="text-muted">**Fecha:** {new Date(order.createdAt).toLocaleString('es-CL')}</p>
                        <p className="text-muted">**Estado:** <Badge bg={getStatusVariant(order.status as OrderStatus)}>{order.status.toUpperCase()}</Badge></p>
                    </Col>
                    <Col md={6}>
                        <h5 style={{ color: '#39FF14' }}>Resumen de Pago</h5>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex justify-content-between" style={{ backgroundColor: 'transparent', color: 'white' }}>Subtotal: <span>${subtotalItems.toFixed(2)}</span></ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between" style={{ backgroundColor: 'transparent', color: 'white' }}>Envío: <span>${order.shippingPrice.toFixed(2)}</span></ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between fw-bold" style={{ backgroundColor: 'transparent', borderTop: '1px solid #333', color: '#39FF14' }}>Total: <span>${order.totalPrice.toFixed(2)}</span></ListGroup.Item>
                        </ListGroup>
                    </Col>
                </Row>
                
                <h5 className="mt-4 border-bottom pb-2" style={{ color: '#39FF14' }}>Productos ({order.items.length})</h5>
                <ListGroup className="mb-4">
                    {order.items.map((item, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between" style={{ backgroundColor: '#111', color: 'white', borderBottomColor: '#333' }}>
                            <span>{item.product.name}</span>
                            <span>{item.quantity} ud. @ ${item.product.price.toFixed(2)}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                {/* CONTROL DE ESTADO POR EL ADMINISTRADOR */}
                <h5 style={{ color: '#39FF14' }}>Actualizar Estado</h5>
                {updateError && <Alert variant="danger" className="mb-3">{updateError}</Alert>}
                
                <Form onSubmit={handleStatusChange}>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <Form.Select 
                                value={newStatus} 
                                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                                style={{ backgroundColor: '#333', color: 'white', border: '1px solid #1E90FF' }}
                                disabled={order.status === 'Entregada' || loading}
                            >
                                <option value="Pendiente">1. Pendiente (Pago Recibido)</option>
                                <option value="Preparacion">2. En Preparación</option>
                                <option value="Enviada">3. Enviada</option>
                                <option value="Entregada">4. Entregada al Cliente</option>
                            </Form.Select>
                        </Col>
                        <Col md={6}>
                            <Button 
                                type="submit" 
                                variant="warning" 
                                className="w-100 mt-2 mt-md-0"
                                disabled={loading || newStatus === order.status || order.status === 'Entregada'}
                            >
                                {loading ? 'Actualizando...' : 
                                    <>
                                        <Box size={16} className="me-1"/> Guardar Nuevo Estado
                                    </>
                                }
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#111', borderTopColor: '#333' }}>
                <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
                <Button variant="primary">Generar Boleta (Simulación)</Button>
            </Modal.Footer>
        </Modal>
    );
};