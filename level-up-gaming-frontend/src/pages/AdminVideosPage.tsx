// level-up-gaming-frontend/src/pages/AdminVideosPage.tsx

import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Alert, Spinner, Badge, Button, Modal, Row, Col, Form, Card } from 'react-bootstrap';
import { Edit, Trash, ArrowLeft, PlusCircle, Video, Star, AlertTriangle, Check, X } from 'react-feather'; 
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout'; 

// Interfaces (deben coincidir con el Backend)
interface Video {
    id: string;
    title: string;
    embedUrl: string; 
    isFeatured: boolean;
}

const API_URL = '/api/videos';
const REWARD_TYPES = ['Producto', 'Descuento', 'Envio'];
const REWARD_SEASONS = ['Standard', 'Halloween', 'Navidad', 'BlackFriday', 'Verano']; 


const AdminVideosPage: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null); 
    const [showCreateModal, setShowCreateModal] = useState(false); 
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);
    
    // ESTADOS PARA EL MODAL DE ELIMINACIÓN
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);


    const fetchVideos = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(API_URL); 
            setVideos(data.reverse()); 
            setError(null);
        } catch (err: any) {
            setError('Error al cargar los videos. Asegúrate de que el Backend esté corriendo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);
    
    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000); 
    };

    // Función que abre el modal de confirmación de eliminación
    const confirmDelete = (id: string, name: string) => {
        setItemToDelete({ id, name });
        setShowDeleteModal(true);
    };

    // Función que ejecuta la eliminación (llamada desde el modal)
    const handleDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            await axios.delete(`${API_URL}/${itemToDelete.id}/admin`); 
            setVideos(videos.filter(v => v.id !== itemToDelete.id));
            showStatus(`Video "${itemToDelete.name}" eliminado con éxito.`, 'success');
        } catch (err: any) {
            showStatus('Fallo al eliminar el video.', 'danger');
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };
    
    const handleEdit = (event: Video) => {
        setSelectedVideo(event);
    };
    
    // FUNCIÓN CRÍTICA: Toggle de Activación Rápida
    const handleToggleFeatured = async (id: string, currentStatus: boolean, name: string) => {
        const newStatus = !currentStatus;
        try {
            // Llama al endpoint PUT para cambiar el estado
            const { data } = await axios.put<Video>(`${API_URL}/${id}/feature`);
            
            // Actualizar el estado localmente con el objeto devuelto por el Backend
            setVideos(prevVideos => prevVideos.map(v => v.id === id ? data : v));

            showStatus(`Visibilidad en Home cambiada a: ${!currentStatus ? 'Destacado' : 'Normal'}.`, 'success');

        } catch (err: any) {
            showStatus('Fallo al actualizar el estado de destacado.', 'danger');
        }
    };


    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
    
    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                {/* Se quita el botón "Volver al Panel" */}
                <div style={{ visibility: 'hidden', width: '150px' }}></div> 
                
                <h1 style={{ color: '#1E90FF' }}>Gestión de Videos</h1>
                
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                    <PlusCircle size={18} className="me-2"/> Nuevo Video
                </Button>
            </div>
            
            {statusMessage && (
                <Alert variant={statusMessage.type} onClose={() => setStatusMessage(null)} dismissible className="mb-4">
                    {statusMessage.msg}
                </Alert>
            )}

            {/* VISTA 1: TABLA COMPLETA (Escritorio/Tablet) */}
            <div className="table-responsive d-none d-md-block"> 
                <Table striped bordered hover className="table-dark" style={{ backgroundColor: '#111', color: 'white' }}>
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>URL Embed</th>
                            <th>Destacado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.map((video) => (
                            <tr key={video.id}>
                                <td style={{ color: 'white' }}>{video.title}</td>
                                <td><a href={video.embedUrl} target="_blank" rel="noopener noreferrer">Ver Video</a></td>
                                <td>
                                    <Button variant={video.isFeatured ? 'success' : 'secondary'} size="sm" onClick={() => handleToggleFeatured(video.id, video.isFeatured, video.title)} title={video.isFeatured ? 'Quitar de Home' : 'Destacar en Home'}>
                                        <Star size={14} fill={video.isFeatured ? 'black' : 'none'} stroke={video.isFeatured ? 'black' : 'white'}/>
                                    </Button>
                                </td>
                                <td>
                                    <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(video)}><Edit size={14} /></Button>
                                    <Button variant="danger" size="sm" onClick={() => confirmDelete(video.id, video.title)}><Trash size={14} /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* 🚨 VISTA 2: TARJETAS APILADAS (Móvil) */}
            <Row className="d-block d-md-none g-3">
                {videos.map((video) => (
                    <Col xs={12} key={video.id}>
                        <Card style={{ backgroundColor: '#222', border: '1px solid #1E90FF', color: 'white' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0" style={{ color: '#39FF14' }}>{video.title}</h5>
                                    <Badge bg={video.isFeatured ? 'success' : 'secondary'}>Destacado</Badge>
                                </div>
                                <hr style={{ borderColor: '#444' }}/>
                                
                                <div className="ratio ratio-16x9 mb-3">
                                    <iframe src={video.embedUrl} style={{ border: 0 }} allowFullScreen title={`Video de ${video.title}`}></iframe>
                                </div>
                                
                                <div className="d-grid gap-2">
                                    <Button variant="info" size="sm" onClick={() => handleEdit(video)}><Edit size={14} className="me-1"/> Editar</Button>
                                    <Button variant={video.isFeatured ? 'danger' : 'success'} size="sm" onClick={() => handleToggleFeatured(video.id, video.isFeatured, video.title)}>
                                        {video.isFeatured ? 'Quitar de Home' : 'Destacar en Home'}
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(video.id, video.title)}><Trash size={14} className="me-1"/> Eliminar</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>


            {/* Modal de Creación/Edición */}
            <VideoModal
                video={selectedVideo} 
                show={showCreateModal || !!selectedVideo}
                handleClose={() => { setSelectedVideo(null); setShowCreateModal(false); }}
                fetchVideos={fetchVideos}
                showStatus={showStatus}
            />
            
            {/* Modal de Confirmación de Eliminación */}
            <ConfirmDeleteModal 
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDelete}
                itemName={itemToDelete?.name || 'este video'}
            />
        </AdminLayout>
    );
};

export default AdminVideosPage;


// ----------------------------------------------------
// COMPONENTES MODAL AUXILIARES
// ----------------------------------------------------
// (Implementamos los modales auxiliares para que el archivo compile)

interface ConfirmDeleteModalProps { show: boolean; handleClose: () => void; handleDelete: () => void; itemName: string; }

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ show, handleClose, handleDelete, itemName }) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#FF4444' }}><Modal.Title style={{ color: '#FF4444' }}><AlertTriangle size={24} className="me-2"/> Confirmar Eliminación</Modal.Title></Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}><p>¿Estás seguro de que deseas eliminar a <strong style={{ color: '#39FF14' }}>{itemName}</strong>?</p><Alert variant="warning" className="mt-3">Esta acción no se puede deshacer.</Alert></Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#111' }}><Button variant="secondary" onClick={handleClose}>Cancelar</Button><Button variant="danger" onClick={handleDelete}>Eliminar</Button></Modal.Footer>
        </Modal>
    );
};

interface VideoModalProps { video: Video | null; show: boolean; handleClose: () => void; fetchVideos: () => void; showStatus: (msg: string, type: 'success' | 'danger') => void; }

const VideoModal: React.FC<VideoModalProps> = ({ video, show, handleClose, fetchVideos, showStatus }) => {
    const isEditing = !!video;
    const [formData, setFormData] = useState({
        title: video?.title || '',
        embedUrl: video?.embedUrl || 'https://www.youtube.com/embed/VIDEO_ID_AQUÍ',
        isFeatured: video?.isFeatured || false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (video) {
            setFormData({ title: video.title, embedUrl: video.embedUrl, isFeatured: video.isFeatured });
        } else {
            setFormData({ title: '', embedUrl: 'https://www.youtube.com/embed/VIDEO_ID_AQUÍ', isFeatured: false });
        }
        setError(null);
    }, [video, show]);

    const updateFormData = (e: React.ChangeEvent<any>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const url = isEditing ? `${API_URL}/${video!.id}/admin` : `${API_URL}/admin`;
        const method = isEditing ? 'PUT' : 'POST';
        
        if (!formData.embedUrl.includes('youtube.com/embed/')) {
            setError('La URL de incrustación debe ser el formato /embed/ de YouTube.');
            setLoading(false);
            return;
        }

        try {
            const payload = { ...formData, isFeatured: !!formData.isFeatured };

            await axios({
                method: method,
                url: url,
                data: payload,
            });
            
            fetchVideos();
            handleClose();
            showStatus(`Video "${formData.title}" ${isEditing ? 'actualizado' : 'creado'} con éxito.`, 'success');

        } catch (err: any) {
            setError(err.response?.data?.message || `Fallo al ${isEditing ? 'actualizar' : 'crear'} el video.`);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Modal show={show} onHide={handleClose} centered size="xl">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#39FF14' }}>{isEditing ? 'Editar Video' : 'Crear Nuevo Video'}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Título</Form.Label>
                        <Form.Control type="text" name="title" value={formData.title} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }}/>
                    </Form.Group>
                    
                    <Row>
                        <Col md={12} xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>URL iframe (YouTube)</Form.Label>
                                <Form.Control as="textarea" rows={3} name="embedUrl" value={formData.embedUrl} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }}/>
                                <Form.Text className="text-muted">
                                    Debe ser la URL de incrustación de YouTube (Ej: https://www.youtube.com/embed/...)
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                        <Form.Check 
                            type="checkbox" 
                            label="Destacar en la página de inicio" 
                            name="isFeatured" 
                            checked={formData.isFeatured}
                            onChange={updateFormData} 
                        />
                    </Form.Group>
                    
                    <Button type="submit" variant="success" className="w-100 mt-3" disabled={loading}>
                        {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Video')}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};