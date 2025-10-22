// level-up-gaming-frontend/src/pages/AdminRewardsPage.tsx (CÓDIGO COMPLETO)

import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Alert, Spinner, Badge, Button, Modal, Row, Col, Form } from 'react-bootstrap';
import { Edit, Trash, ArrowLeft, PlusCircle, Check, X } from 'react-feather';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Interfaces (deben coincidir con el Backend)
interface Reward {
    id: string;
    name: string;
    type: 'Producto' | 'Descuento' | 'Envio';
    pointsCost: number;
    description: string;
    isActive: boolean;
    season: string; // Permitir que sea string para nuevas temporadas
    imageUrl: string; 
}

const API_URL = '/api/rewards';
const REWARD_TYPES = ['Producto', 'Descuento', 'Envio'];
// 🚨 TEMPORADAS DISPONIBLES (El administrador puede extender esta lista en el código si lo desea)
const REWARD_SEASONS = ['Standard', 'Halloween', 'Navidad', 'BlackFriday', 'Verano']; 


const AdminRewardsPage: React.FC = () => {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null); 
    const [showCreateModal, setShowCreateModal] = useState(false); 
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);


    const fetchRewards = async () => {
        setLoading(true);
        try {
            // Llama al endpoint GET /api/rewards/admin para obtener TODAS
            const { data } = await axios.get(`${API_URL}/admin`); 
            setRewards(data.reverse()); // Los más recientes primero
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

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la recompensa "${name}"?`)) {
            try {
                await axios.delete(`${API_URL}/${id}/admin`); 
                setRewards(rewards.filter(r => r.id !== id));
                showStatus(`Recompensa "${name}" eliminada.`, 'success');
            } catch (err: any) {
                showStatus('Fallo al eliminar la recompensa.', 'danger');
            }
        }
    };

    const handleEdit = (reward: Reward) => {
        setSelectedReward(reward);
    };
    
    // 🚨 FUNCIÓN CRÍTICA: Toggle de Activación Rápida
    const handleToggleActive = async (id: string, currentStatus: boolean, name: string) => {
        const newStatus = !currentStatus;
        try {
            // Simulación de PUT para cambiar solo el estado
            const { data } = await axios.put(`${API_URL}/${id}/admin`, { isActive: newStatus }); 
            
            // Actualizar la lista localmente
            setRewards(prevRewards => 
                prevRewards.map(r => r.id === id ? data : r)
            );
            showStatus(`Recompensa "${name}" cambiada a: ${newStatus ? 'ACTIVA' : 'INACTIVA'}.`, 'success');
        } catch (err) {
            showStatus('Fallo al cambiar el estado de la recompensa.', 'danger');
        }
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
                <h1 style={{ color: '#1E90FF' }}>Gestión de Recompensas</h1>
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                    <PlusCircle size={18} className="me-2"/> Nueva Recompensa
                </Button>
            </div>
            
            {statusMessage && (
                <Alert variant={statusMessage.type} onClose={() => setStatusMessage(null)} dismissible className="mb-4">
                    {statusMessage.msg}
                </Alert>
            )}

            <Table striped bordered hover responsive style={{ backgroundColor: '#111', color: 'white' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Costo (Ptos)</th>
                        <th>Tipo</th>
                        <th>Temporada</th>
                        <th>Activar/Desactivar</th> {/* 🚨 ENCABEZADO ACTUALIZADO */}
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {rewards.map((reward) => (
                        <tr key={reward.id}>
                            <td className="text-muted">{reward.id.slice(0, 5)}...</td>
                            <td style={{ color: '#39FF14' }}>{reward.name}</td>
                            <td>{reward.pointsCost}</td>
                            <td><Badge bg="info">{reward.type}</Badge></td>
                            <td><Badge bg={reward.season === 'Standard' ? 'secondary' : 'warning'}>{reward.season}</Badge></td>
                            
                            {/* 🚨 BOTÓN DE ACCIÓN RÁPIDA (TOGGLE) */}
                            <td>
                                <Button 
                                    variant={reward.isActive ? 'success' : 'danger'} 
                                    size="sm"
                                    onClick={() => handleToggleActive(reward.id, reward.isActive, reward.name)}
                                >
                                    {reward.isActive ? <Check size={14} /> : <X size={14} />}
                                </Button>
                            </td>
                            
                            <td>
                                <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(reward)}>
                                    <Edit size={14} />
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(reward.id, reward.name)}>
                                    <Trash size={14} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            
            {/* Modal de Creación/Edición */}
            <RewardModal
                reward={selectedReward} 
                show={showCreateModal || !!selectedReward}
                handleClose={() => { setSelectedReward(null); setShowCreateModal(false); }}
                fetchRewards={fetchRewards}
                showStatus={showStatus}
            />
        </Container>
    );
};

export default AdminRewardsPage;


// ----------------------------------------------------
// COMPONENTE MODAL DE CREACIÓN/EDICIÓN
// ----------------------------------------------------

interface RewardModalProps {
    reward: Reward | null;
    show: boolean;
    handleClose: () => void;
    fetchRewards: () => void;
    showStatus: (msg: string, type: 'success' | 'danger') => void;
}

const RewardModal: React.FC<RewardModalProps> = ({ reward, show, handleClose, fetchRewards, showStatus }) => {
    const isEditing = !!reward;
    // 🚨 Aquí usamos la lista de temporadas disponibles
    const [formData, setFormData] = useState({
        name: reward?.name || '',
        type: reward?.type || 'Producto' as 'Producto' | 'Descuento' | 'Envio',
        pointsCost: reward?.pointsCost || 0,
        description: reward?.description || '',
        isActive: reward?.isActive !== undefined ? reward.isActive : true,
        season: reward?.season || 'Standard' as 'Standard' | 'Halloween' | 'Navidad',
        imageUrl: reward?.imageUrl || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(reward?.imageUrl || null);


    useEffect(() => {
        if (reward) {
            setFormData({ name: reward.name, type: reward.type, pointsCost: reward.pointsCost, description: reward.description, isActive: reward.isActive, season: reward.season, imageUrl: reward.imageUrl });
            setPreviewUrl(reward.imageUrl || null);
        } else {
            setFormData({ name: '', type: 'Producto', pointsCost: 0, description: '', isActive: true, season: 'Standard', imageUrl: '' });
            setPreviewUrl(null);
        }
        setError(null);
    }, [reward, show]);

    const updateFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (name === 'pointsCost' ? parseInt(value) || 0 : value), 
        }));
    };
    
    // HANDLER DE ARCHIVO: Muestra la previsualización Base64
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

        // VALIDACIÓN: Nombre y Costo
        if (formData.pointsCost < 1) { setError('El costo debe ser mayor a 0 puntos.'); setLoading(false); return; }
        if (formData.name.length < 3) { setError('El nombre debe tener al menos 3 caracteres.'); setLoading(false); return; }
        if (!formData.imageUrl) { setError('Debe proporcionar una imagen.'); setLoading(false); return; }


        const url = isEditing ? `${API_URL}/${reward!.id}/admin` : `${API_URL}/admin`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            // El payload ya contiene la URL (Base64 o Link) en formData.imageUrl
            await axios({
                method: method,
                url: url,
                data: formData,
            });
            
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
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#39FF14' }}>{isEditing ? 'Editar Recompensa' : 'Crear Nueva Recompensa'}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" name="name" value={formData.name} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }}/>
                    </Form.Group>
                    
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Costo en Puntos</Form.Label>
                                <Form.Control type="number" name="pointsCost" value={formData.pointsCost} onChange={updateFormData} required min={1} style={{ backgroundColor: '#333', color: 'white' }}/>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tipo</Form.Label>
                                <Form.Select name="type" value={formData.type} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }}>
                                    {REWARD_TYPES.map(type => (<option key={type} value={type}>{type}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Temporada</Form.Label>
                                <Form.Select name="season" value={formData.season} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }}>
                                    {REWARD_SEASONS.map(season => (<option key={season} value={season}>{season}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }}/>
                    </Form.Group>
                    
                    {/* 🚨 GESTIÓN DE IMAGEN */}
                    <Row className="mb-3 align-items-center">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Imagen (Archivo)</Form.Label>
                                <Form.Control type="file" onChange={handleFileChange} accept="image/*"/>
                                <Form.Text className="text-muted">
                                    Se recomienda cargar un archivo local (Base64).
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>URL Imagen (Respaldo)</Form.Label>
                                <Form.Control type="text" name="imageUrl" value={formData.imageUrl} onChange={updateFormData} disabled={formData.imageUrl.startsWith('data:image')} style={{ backgroundColor: '#333', color: 'white' }}/>
                            </Form.Group>
                        </Col>
                        {/* Previsualización */}
                        {previewUrl && (
                            <Col xs={12} className="text-center mt-3">
                                <img src={previewUrl} alt="Previsualización" style={{ maxWidth: '100px', maxHeight: '100px' }} className="rounded shadow" />
                            </Col>
                        )}
                    </Row>
                    
                    <Form.Group className="mb-4">
                        <Form.Check 
                            type="checkbox" 
                            label="Recompensa Activa (Mostrar al Cliente)" 
                            name="isActive" 
                            checked={formData.isActive}
                            onChange={updateFormData}
                        />
                    </Form.Group>
                    
                    <Button type="submit" variant="success" className="w-100 mt-3" disabled={loading}>
                        {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Recompensa')}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};