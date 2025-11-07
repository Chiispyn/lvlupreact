// level-up-gaming-frontend/src/pages/AdminOrdersPage.tsx (CÓDIGO COMPLETO)

import React, { useState, useEffect } from 'react';
import {
    Container, Table, Alert, Spinner, Badge, Button, Modal,
    Row, Col, Form, Card, ListGroup
} from 'react-bootstrap';
import { Edit, ArrowLeft } from 'react-feather';
import { Link } from 'react-router-dom';
import axios from 'axios';

import AdminLayout from '../layouts/AdminLayout';

// -----------------------------
// Interfaces (coinciden backend)
// -----------------------------
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

const CLP_FORMATTER = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
});
const formatClp = (amount: number) => CLP_FORMATTER.format(amount);

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
        } catch {
            setError('Error al cargar las órdenes. Asegúrate de que el Backend esté corriendo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000);
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const { data } = await axios.put(`${API_URL}/${orderId}/status`, { status: newStatus });
            setOrders(orders.map(o => (o.id === orderId ? data : o)));
            showStatus(`Estado actualizado a ${newStatus}.`, 'success');
        } catch {
            showStatus('Fallo al actualizar el estado.', 'danger');
        }
    };

    if (loading)
        return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

    if (error)
        return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <AdminLayout>

            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <Link to="/admin">
                    <Button variant="outline-secondary" size="sm">
                        <ArrowLeft size={16} className="me-2" /> Volver al Panel
                    </Button>
                </Link>
                <h1 style={{ color: '#1E90FF' }}>Gestión de Órdenes</h1>
            </div>

            {statusMessage && (
                <Alert variant={statusMessage.type}
                    dismissible
                    onClose={() => setStatusMessage(null)}
                    className="mb-4">
                    {statusMessage.msg}
                </Alert>
            )}

            {/* TABLA ESCRITORIO */}
            <div className="table-responsive d-none d-md-block">
                <Table striped bordered className="table-dark" hover style={{ backgroundColor: '#111', color: 'white' }}>
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
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id.slice(0, 8)}...</td>
                                <td>{formatClp(order.totalPrice)}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>{order.userId.slice(0, 8)}...</td>
                                <td><StatusBadge status={order.status} /></td>
                                <td>
                                    <Button variant="info" size="sm"
                                        className="me-2"
                                        onClick={() => setSelectedOrder(order)}>
                                        <Edit size={14} />
                                    </Button>
                                    <StatusSelect
                                        status={order.status}
                                        orderId={order.id}
                                        onUpdate={handleUpdateStatus}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* MÓVIL */}
            <Row className="d-block d-md-none g-3">
                {orders.map(order => (
                    <Col xs={12} key={order.id}>
                        <Card style={{ backgroundColor: '#222', border: '1px solid #1E90FF', color: 'white' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 style={{ color: '#39FF14' }}>Orden #{order.id.slice(0, 8)}...</h5>
                                    <StatusBadge status={order.status} />
                                </div>
                                <hr />
                                <p>Total: <strong>{formatClp(order.totalPrice)}</strong></p>
                                <p className="text-muted small">Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>

                                <div className="d-grid gap-2">
                                    <Button variant="info" size="sm" onClick={() => setSelectedOrder(order)}>
                                        <Edit size={14} className="me-1" /> Ver Detalles
                                    </Button>

                                    <StatusSelect
                                        status={order.status}
                                        orderId={order.id}
                                        onUpdate={handleUpdateStatus}
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* MODAL */}
            <OrderDetailsModal
                order={selectedOrder}
                show={!!selectedOrder}
                handleClose={() => setSelectedOrder(null)}
                handleUpdateStatus={handleUpdateStatus}
            />

        </AdminLayout>
    );
};

export default AdminOrdersPage;

// ----------------------------------------------------
// COMPONENTES AUXILIARES (NO llevan imports extra)
// ----------------------------------------------------

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

const StatusSelect: React.FC<{
    status: Order['status'];
    onUpdate: (id: string, status: string) => void;
    orderId: string;
}> = ({ status, onUpdate, orderId }) => {

    const isFinal = status === 'Entregado' || status === 'Cancelado';

    return (
        <Form.Select
            value={status}
            onChange={(e) => onUpdate(orderId, e.target.value)}
            disabled={isFinal}
            style={{
                backgroundColor: '#333',
                color: 'white',
                borderColor: '#555'
            }}
        >
            {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </Form.Select>
    );
};

interface OrderDetailsModalProps {
    order: Order | null;
    show: boolean;
    handleClose: () => void;
    handleUpdateStatus: (id: string, status: string) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
    order, show, handleClose, handleUpdateStatus
}) => {

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

    return (
        <Modal show={show} onHide={handleClose} centered size="xl">
            <Modal.Header closeButton style={{ backgroundColor: '#111' }}>
                <Modal.Title style={{ color: '#1E90FF' }}>
                    Detalle Orden #{order.id.slice(0, 8)}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <Row>

                    <Col md={6}>
                        <h5 style={{ color: '#39FF14' }}>Detalles de Envío</h5>
                        <ListGroup variant="flush" style={{ color: 'white' }}>
                            <ListGroup.Item style={{ background: 'transparent' }}>
                                Cliente ID: {order.userId.slice(0, 8)}...
                            </ListGroup.Item>
                            <ListGroup.Item style={{ background: 'transparent' }}>
                                Fecha: {new Date(order.createdAt).toLocaleString()}
                            </ListGroup.Item>
                            <ListGroup.Item style={{ background: 'transparent' }}>
                                Total: {formatClp(order.totalPrice)}
                            </ListGroup.Item>
                            <ListGroup.Item style={{ background: 'transparent' }}>
                                Dirección: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.region}
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>

                    <Col md={6}>
                        <h5 style={{ color: '#39FF14' }}>Actualizar Estado</h5>

                        <Form.Select
                            value={currentStatus}
                            onChange={(e) => setCurrentStatus(e.target.value as Order['status'])}
                            style={{ backgroundColor: '#333', color: 'white' }}
                            className="mb-3"
                        >
                            {STATUS_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                        </Form.Select>

                        <Button variant="success" className="w-100"
                            disabled={loading}
                            onClick={handleSaveStatus}>
                            {loading ? 'Guardando...' : 'Guardar Estado'}
                        </Button>
                    </Col>

                </Row>

                <h5 className="mt-4" style={{ color: '#39FF14' }}>Productos Comprados</h5>
                <ListGroup variant="flush">
                    {order.items.map((item, i) => (
                        <ListGroup.Item key={i}
                            style={{ backgroundColor: '#222', color: 'white', borderBottom: '1px dashed #444' }}>
                            <div className="d-flex justify-content-between">
                                <span>{item.product.name}</span>
                                <strong>x{item.quantity}</strong>
                                <span style={{ color: '#39FF14' }}>
                                    {formatClp(item.product.price * item.quantity)}
                                </span>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

            </Modal.Body>
        </Modal>
    );
};
