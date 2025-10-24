// level-up-gaming-frontend/src/pages/AdminOrdersPage.tsx (CÓDIGO COMPLETO)

import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner, Badge, Button, Modal, Row, Col, Form, Card, ListGroup } from 'react-bootstrap';
import { Edit, Trash, ArrowLeft, ShoppingCart, Check, X, Truck, DollarSign, AlertTriangle } from 'react-feather';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Interfaces (deben coincidir con el Backend)
interface Order {
    id: string;
    userId: string;
    items: { product: { name: string; price: number }; quantity: number }[];
    shippingAddress: { street: string; city: string; region: string };
    totalPrice: number;
    status: 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
    createdAt: string;
}

const API_URL = '/api/orders';

// Formato CLP
const CLP_FORMATTER = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
const formatClp = (amount: number) => CLP_FORMATTER.format(amount);

// Opciones de estado
const STATUS_OPTIONS = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];

// ----------------------------------------------------
// PÁGINA PRINCIPAL DE ADMINISTRACIÓN DE ÓRDENES
// ----------------------------------------------------

const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);


    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(API_URL);
            setOrders(data.reverse()); 
            setError(null);
        } catch (err: any) {
            setError('Error al cargar las órdenes. Asegúrate de que el Backend esté corriendo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000);
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const { data } = await axios.put(`${API_URL}/${orderId}/status`, { status: newStatus });
            
            // Actualizar el estado local
            setOrders(orders.map(o => (o.id === orderId ? data : o)));
            showStatus(`Estado de la orden ${orderId.slice(0, 5)}... actualizado a ${newStatus}.`, 'success');
        } catch (err: any) {
            showStatus('Fallo al actualizar el estado.', 'danger');
        }
    };


    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <Link to="/admin">
                    <Button variant="outline-secondary" size="sm">
                        <ArrowLeft size={16} className="me-2" /> Volver al Panel
                    </Button>
                </Link>
                <h1 style={{ color: '#1E90FF' }}>Gestión de Órdenes</h1>
            </div>

            {statusMessage && (
                <Alert variant={statusMessage.type} onClose={() => setStatusMessage(null)} dismissible className="mb-4">
                    {statusMessage.msg}
                </Alert>
            )}

            {/* 🚨 VISTA 1: TABLA COMPLETA (Escritorio/Tablet) */}
            <div className="table-responsive d-none d-md-block"> 
                <Table striped bordered hover style={{ backgroundColor: '#111', color: 'white' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Total</th>
                            <th>Fecha</th>
                            <th>Usuario ID</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id.slice(0, 8)}...</td>
                                <td style={{ color: '#39FF14' }}>{formatClp(order.totalPrice)}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>{order.userId.slice(0, 8)}...</td>
                                <td><StatusBadge status={order.status} /></td>
                                <td>
                                    <Button variant="info" size="sm" className="me-2" onClick={() => setSelectedOrder(order)}><Edit size={14} /></Button>
                                    <StatusSelect status={order.status} onUpdate={handleUpdateStatus} orderId={order.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>


            {/* 🚨 VISTA 2: TARJETAS APILADAS (Móvil) */}
            <Row className="d-block d-md-none g-3">
                {orders.map((order) => (
                    <Col xs={12} key={order.id}>
                        <Card style={{ backgroundColor: '#222', border: '1px solid #1E90FF', color: 'white' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0" style={{ color: '#39FF14' }}>Orden #{order.id.slice(0, 8)}...</h5>
                                    <StatusBadge status={order.status} />
                                </div>
                                <hr style={{ borderColor: '#444' }}/>
                                <p className="mb-1">Total: <strong>{formatClp(order.totalPrice)}</strong></p>
                                <p className="mb-3 text-muted small">Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>

                                <div className="d-grid gap-2">
                                    <Button variant="info" size="sm" onClick={() => setSelectedOrder(order)}><Edit size={14} className="me-1"/> Ver Detalles</Button>
                                    <StatusSelect status={order.status} onUpdate={handleUpdateStatus} orderId={order.id} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>


            {/* Modal de Detalle/Edición */}
            <OrderDetailsModal
                order={selectedOrder}
                show={!!selectedOrder}
                handleClose={() => setSelectedOrder(null)}
                handleUpdateStatus={handleUpdateStatus}
            />
        </Container>
    );
};

export default AdminOrdersPage;


// ----------------------------------------------------
// COMPONENTES AUXILIARES
// ----------------------------------------------------

// Badge de Estado
const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    let bg: string;
    switch (status) {
        case 'Entregado': bg = 'success'; break;
        case 'Enviado': bg = 'info'; break;
        case 'Procesando': bg = 'primary'; break;
        case 'Cancelado': bg = 'danger'; break;
        default: bg = 'secondary';
    }
    return <Badge bg={bg}>{status.toUpperCase()}</Badge>;
};

// Selector de Estado Rápido
const StatusSelect: React.FC<{ status: Order['status']; onUpdate: (id: string, status: string) => void; orderId: string }> = ({ status, onUpdate, orderId }) => {
    return (
        <Form.Select
            value={status}
            onChange={(e) => onUpdate(orderId, e.target.value)}
            style={{ backgroundColor: '#333', color: 'white', borderColor: '#555' }}
        >
            {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </Form.Select>
    );
};


// Modal de Detalles y Edición
interface OrderDetailsModalProps { order: Order | null; show: boolean; handleClose: () => void; handleUpdateStatus: (id: string, status: string) => void; }

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, show, handleClose, handleUpdateStatus }) => {
    if (!order) return null;

    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [loading, setLoading] = useState(false);

    const handleSaveStatus = async () => {
        setLoading(true);
        try {
            await handleUpdateStatus(order.id, currentStatus);
        } finally {
            setLoading(false);
            handleClose();
        }
    };
    
    // 🚨 Handler de cambio para el select
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentStatus(e.target.value as Order['status']);
    };


    return (
        <Modal show={show} onHide={handleClose} centered size="xl">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#1E90FF' }}>Detalle Orden #{order.id.slice(0, 8)}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <Row>
                    <Col md={6} xs={12}>
                        <h5 style={{ color: '#39FF14' }}>Detalles de Envío</h5>
                        <ListGroup variant="flush">
                            <ListGroup.Item style={{ backgroundColor: 'transparent', color: 'white' }}>Cliente ID: <strong className="text-muted">{order.userId.slice(0, 8)}...</strong></ListGroup.Item>
                            <ListGroup.Item style={{ backgroundColor: 'transparent', color: 'white' }}>Fecha: <strong className="text-muted">{new Date(order.createdAt).toLocaleString()}</strong></ListGroup.Item>
                            <ListGroup.Item style={{ backgroundColor: 'transparent', color: 'white' }}>Total: <strong style={{ color: '#39FF14' }}>{formatClp(order.totalPrice)}</strong></ListGroup.Item>
                            <ListGroup.Item style={{ backgroundColor: 'transparent', color: 'white' }}>Dirección: <strong className="text-muted">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.region}</strong></ListGroup.Item>
                        </ListGroup>
                    </Col>
                    <Col md={6} xs={12}>
                        <h5 style={{ color: '#39FF14' }} className="mt-3 mt-md-0">Actualizar Estado</h5>
                        <Form.Group className="mb-3">
                            <Form.Label>Estado Actual: <StatusBadge status={order.status} /></Form.Label>
                            <Form.Select 
                                value={currentStatus} 
                                onChange={handleSelectChange} // 🚨 Usamos el nuevo handler
                                style={{ backgroundColor: '#333', color: 'white' }}
                            >
                                {STATUS_OPTIONS.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                            </Form.Select>
                        </Form.Group>
                        <Button variant="success" onClick={handleSaveStatus} disabled={loading} className="w-100">
                            {loading ? 'Guardando...' : 'Guardar Estado'}
                        </Button>
                    </Col>
                </Row>

                <h5 style={{ color: '#39FF14' }} className="mt-4 border-top pt-3">Productos Comprados</h5>
                <ListGroup variant="flush">
                    {order.items.map((item, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between" style={{ backgroundColor: '#222', color: 'white', borderBottom: '1px dashed #444' }}>
                            <span>{item.product.name}</span>
                            <strong>x{item.quantity}</strong>
                            <span style={{ color: '#39FF14' }}>{formatClp(item.product.price * item.quantity)}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
        </Modal>
    );
};