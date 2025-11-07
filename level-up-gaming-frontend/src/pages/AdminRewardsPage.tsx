// level-up-gaming-frontend/src/pages/AdminRewardsPage.tsx (CÓDIGO COMPLETO)

import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Alert, Spinner, Badge, Button, Modal, Row, Col, Form, Card } from 'react-bootstrap';
import { Edit, Trash, ArrowLeft, PlusCircle, Check, X, AlertTriangle } from 'react-feather';
import { Link } from 'react-router-dom';
import axios from 'axios';

import AdminLayout from '../layouts/AdminLayout';

// Interfaces
interface Reward {
    id: string;
    name: string;
    type: 'Producto' | 'Descuento' | 'Envio';
    pointsCost: number;
    description: string;
    isActive: boolean;
    season: string;
    imageUrl: string;
}

const API_URL = '/api/rewards';
const REWARD_TYPES = ['Producto', 'Descuento', 'Envio'];
const REWARD_SEASONS = ['Standard', 'Halloween', 'Navidad', 'BlackFriday', 'Verano'];

const AdminRewardsPage: React.FC = () => {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);

    const fetchRewards = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/admin`);
            setRewards(data.reverse());
            setError(null);
        } catch (err: any) {
            setError('Error al cargar las recompensas. Asegúrate de que el Backend esté corriendo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000);
    };

    const confirmDelete = (id: string, name: string) => {
        setItemToDelete({ id, name });
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            await axios.delete(`${API_URL}/${itemToDelete.id}/admin`);
            setRewards(rewards.filter(r => r.id !== itemToDelete.id));
            showStatus(`Recompensa "${itemToDelete.name}" eliminada.`, 'success');
        } catch (err: any) {
            showStatus('Fallo al eliminar la recompensa.', 'danger');
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const handleEdit = (reward: Reward) => {
        setSelectedReward(reward);
    };

    const handleToggleActive = async (id: string, currentStatus: boolean, name: string) => {
        const newStatus = !currentStatus;
        try {
            const { data } = await axios.put<Reward>(`${API_URL}/${id}/admin`, { isActive: newStatus });

            setRewards(prevRewards => prevRewards.map(r => r.id === id ? data : r));
            showStatus(`Recompensa "${name}" cambiada a: ${newStatus ? 'ACTIVA' : 'INACTIVA'}.`, 'success');
        } catch (err) {
            showStatus('Fallo al cambiar el estado de la recompensa.', 'danger');
        }
    };

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <AdminLayout>

            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <Link to="/admin">
                    <Button variant="outline-secondary" size="sm">
                        <ArrowLeft size={16} className="me-2" /> Volver al Panel
                    </Button>
                </Link>
                <h1 style={{ color: '#1E90FF' }}>Gestión de Recompensas</h1>
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                    <PlusCircle size={18} className="me-2" /> Nueva Recompensa
                </Button>
            </div>

            {statusMessage && (
                <Alert variant={statusMessage.type} onClose={() => setStatusMessage(null)} dismissible className="mb-4">
                    {statusMessage.msg}
                </Alert>
            )}

            {/* TABLA */}
            <div className="table-responsive d-none d-md-block">
                <Table striped bordered hover className="table-dark" style={{ backgroundColor: '#111', color: 'white' }}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Costo (Ptos)</th>
                            <th>Tipo</th>
                            <th>Temporada</th>
                            <th>Activar/Desactivar</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rewards.map((reward) => (
                            <tr key={reward.id}>
                                <td>{reward.name}</td>
                                <td>{reward.pointsCost}</td>
                                <td><Badge bg="info">{reward.type}</Badge></td>
                                <td><Badge bg={reward.season === 'Standard' ? 'secondary' : 'warning'}>{reward.season}</Badge></td>
                                <td>
                                    <Button variant={reward.isActive ? 'success' : 'danger'} size="sm" onClick={() => handleToggleActive(reward.id, reward.isActive, reward.name)}>
                                        {reward.isActive ? <Check size={14} /> : <X size={14} />}
                                    </Button>
                                </td>
                                <td>
                                    <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(reward)}><Edit size={14} /></Button>
                                    <Button variant="danger" size="sm" onClick={() => confirmDelete(reward.id, reward.name)}><Trash size={14} /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* MÓVIL */}
            <Row className="d-block d-md-none g-3">
                {rewards.map((reward) => (
                    <Col xs={12} key={reward.id}>
                        <Card style={{ backgroundColor: '#222', border: '1px solid #1E90FF', color: 'white' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <h5 style={{ color: '#39FF14' }}>{reward.name}</h5>
                                    <Badge bg="info">{reward.type}</Badge>
                                </div>
                                <p className="text-muted small">{reward.description}</p>

                                <hr />

                                <div className="d-flex justify-content-between mb-3">
                                    <span>Costo: <Badge bg="success">{reward.pointsCost} Pts</Badge></span>
                                    <span>Temporada: <Badge bg="secondary">{reward.season}</Badge></span>
                                </div>

                                <div className="d-grid gap-2">
                                    <Button variant="info" size="sm" onClick={() => handleEdit(reward)}><Edit size={14} /> Editar</Button>
                                    <Button variant={reward.isActive ? 'danger' : 'success'} size="sm" onClick={() => handleToggleActive(reward.id, reward.isActive, reward.name)}>
                                        {reward.isActive ? 'Desactivar' : 'Activar'}
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(reward.id, reward.name)}><Trash size={14} /> Eliminar</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* ✅ Modales no se tocan */}
            <RewardModal
                reward={selectedReward}
                show={showCreateModal || !!selectedReward}
                handleClose={() => { setSelectedReward(null); setShowCreateModal(false); }}
                fetchRewards={fetchRewards}
                showStatus={showStatus}
            />

            <ConfirmDeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDelete}
                itemName={itemToDelete?.name || 'esta recompensa'}
            />

        </AdminLayout>
    );
};

export default AdminRewardsPage;

// ----------------------------------------------------
// TUS MODALES ORIGINALES (NO SE TOCAN)
// ----------------------------------------------------

// ConfirmDeleteModal
interface ConfirmDeleteModalProps {
    show: boolean;
    handleClose: () => void;
    handleDelete: () => void;
    itemName: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ show, handleClose, handleDelete, itemName }) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#FF4444' }}>
                <Modal.Title style={{ color: '#FF4444' }}>
                    <AlertTriangle size={24} className="me-2" /> Confirmar Eliminación
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <p>¿Estás seguro de que deseas eliminar <strong style={{ color: '#39FF14' }}>{itemName}</strong>?</p>
                <Alert variant="warning">Esta acción no se puede deshacer.</Alert>
            </Modal.Body>

            <Modal.Footer style={{ backgroundColor: '#111' }}>
                <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </Modal.Footer>
        </Modal>
    );
};

// RewardModal
interface RewardModalProps {
    reward: Reward | null;
    show: boolean;
    handleClose: () => void;
    fetchRewards: () => void;
    showStatus: (msg: string, type: 'success' | 'danger') => void;
}

const RewardModal: React.FC<RewardModalProps> = ({ reward, show, handleClose, fetchRewards, showStatus }) => {
    const isEditing = !!reward;

    const [formData, setFormData] = useState({
        name: reward?.name || '',
        type: reward?.type || 'Producto',
        pointsCost: reward?.pointsCost || 0,
        description: reward?.description || '',
        isActive: reward?.isActive ?? true,
        season: reward?.season || 'Standard',
        imageUrl: reward?.imageUrl || '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(reward?.imageUrl || null);

    useEffect(() => {
        if (reward) {
            setFormData({
                name: reward.name,
                type: reward.type,
                pointsCost: reward.pointsCost,
                description: reward.description,
                isActive: reward.isActive,
                season: reward.season,
                imageUrl: reward.imageUrl
            });
            setPreviewUrl(reward.imageUrl || null);
        } else {
            setFormData({
                name: '',
                type: 'Producto',
                pointsCost: 0,
                description: '',
                isActive: true,
                season: 'Standard',
                imageUrl: ''
            });
            setPreviewUrl(null);
        }
        setError(null);
    }, [reward, show]);

    const updateFormData = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]:
                name === 'isActive'
                    ? (e.target as HTMLInputElement).checked
                    : name === 'pointsCost'
                        ? parseInt(value) || 0
                        : value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev, imageUrl: base64String }));
                setPreviewUrl(base64String);
            };

            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(reward?.imageUrl || null);
            setFormData(prev => ({ ...prev, imageUrl: reward?.imageUrl || '' }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.pointsCost < 1) {
            setError('El costo debe ser mayor a 0 puntos.');
            setLoading(false);
            return;
        }

        if (formData.name.length < 3) {
            setError('El nombre debe tener al menos 3 caracteres.');
            setLoading(false);
            return;
        }

        if (!formData.imageUrl) {
            setError('Debe proporcionar una imagen.');
            setLoading(false);
            return;
        }

        const url = isEditing ? `${API_URL}/${reward!.id}/admin` : `${API_URL}/admin`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            await axios({ method, url, data: formData });

            fetchRewards();
            handleClose();
            showStatus(`Recompensa "${formData.name}" ${isEditing ? 'actualizada' : 'creada'} con éxito.`, 'success');
        } catch (err: any) {
            setError(err.response?.data?.message || `Fallo al ${isEditing ? 'actualizar' : 'crear'} la recompensa.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="xl">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#39FF14' }}>
                    {isEditing ? 'Editar Recompensa' : 'Crear Nueva Recompensa'}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={updateFormData}
                            required
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                    </Form.Group>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Costo en Puntos</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="pointsCost"
                                    value={formData.pointsCost}
                                    min={1}
                                    required
                                    onChange={updateFormData}
                                    style={{ backgroundColor: '#333', color: 'white' }}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tipo</Form.Label>
                                <Form.Select
                                    name="type"
                                    value={formData.type}
                                    required
                                    onChange={updateFormData}
                                    style={{ backgroundColor: '#333', color: 'white' }}
                                >
                                    {REWARD_TYPES.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Temporada</Form.Label>
                                <Form.Select
                                    name="season"
                                    value={formData.season}
                                    required
                                    onChange={updateFormData}
                                    style={{ backgroundColor: '#333', color: 'white' }}
                                >
                                    {REWARD_SEASONS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            rows={3}
                            value={formData.description}
                            required
                            onChange={updateFormData}
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                    </Form.Group>

                    {/* Imagen */}
                    <h6 className="mb-3 mt-4 border-top pt-3" style={{ color: '#39FF14' }}>Imagen</h6>

                    <Row className="mb-3 align-items-center">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Imagen (Archivo)</Form.Label>
                                <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
                                <Form.Text className="text-muted">Se recomienda cargar un archivo local.</Form.Text>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>URL Imagen (Respaldo)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={updateFormData}
                                    disabled={formData.imageUrl.startsWith('data:image')}
                                    style={{ backgroundColor: '#333', color: 'white' }}
                                />
                            </Form.Group>
                        </Col>

                        {previewUrl && (
                            <Col xs={12} className="text-center mt-3">
                                <img
                                    src={previewUrl}
                                    alt="preview"
                                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                                    className="rounded shadow"
                                />
                            </Col>
                        )}
                    </Row>

                    <Form.Group className="mb-4">
                        <Form.Check
                            type="checkbox"
                            label="Recompensa Activa"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={updateFormData}
                        />
                    </Form.Group>

                    <Button type="submit" variant="success" className="w-100" disabled={loading}>
                        {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Recompensa'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};
