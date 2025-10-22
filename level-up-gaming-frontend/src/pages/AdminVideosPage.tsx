// level-up-gaming-frontend/src/pages/AdminVideosPage.tsx

import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Alert, Spinner, Badge, Button, Modal, Form } from 'react-bootstrap';
import { Edit, Trash, ArrowLeft, PlusCircle, Video, Check, X, AlertTriangle } from 'react-feather'; // 🚨 Importar AlertTriangle
import { Link } from 'react-router-dom';
import axios from 'axios';

// Interfaces (deben coincidir con el Backend)
interface Video {
    id: string;
    title: string;
    embedUrl: string; 
    isFeatured: boolean;
}

const API_URL = '/api/videos';

const AdminVideosPage: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null); 
    const [showCreateModal, setShowCreateModal] = useState(false); 
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);
    
    // ESTADOS PARA ELIMINACIÓN
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

            <Table striped bordered hover responsive style={{ backgroundColor: '#111', color: 'white' }}>
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
                            <td style={{ color: '#39FF14' }}>{video.title}</td>
                            <td><a href={video.embedUrl} target="_blank" rel="noopener noreferrer">Ver Video</a></td>
                            <td>
                                <Badge bg={video.isFeatured ? 'success' : 'secondary'}>
                                    {video.isFeatured ? <Check size={14} /> : <X size={14} />}
                                </Badge>
                            </td>
                            <td>
                                <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(video)}>
                                    <Edit size={14} /> Editar
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => confirmDelete(video.id, video.title)}>
                                    <Trash size={14} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            
            <VideoModal
                video={selectedVideo} 
                show={showCreateModal || !!selectedVideo}
                handleClose={() => { setSelectedVideo(null); setShowCreateModal(false); }}
                fetchVideos={fetchVideos}
                showStatus={showStatus}
            />
            
            {/* 🚨 DEFINICIÓN DEL MODAL DE ELIMINACIÓN DE VIDEOS */}
            <ConfirmDeleteModal 
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDelete}
                itemName={itemToDelete?.name || 'este video'}
            />
        </Container>
    );
};

export default AdminVideosPage;


// ----------------------------------------------------
// COMPONENTE MODAL DE CREACIÓN/EDICIÓN
// ----------------------------------------------------

interface VideoModalProps {
    video: Video | null;
    show: boolean;
    handleClose: () => void;
    fetchVideos: () => void;
    showStatus: (msg: string, type: 'success' | 'danger') => void;
}

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

    const updateFormData = (name: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const url = isEditing ? `${API_URL}/${video!.id}/admin` : `${API_URL}/admin`;
        const method = isEditing ? 'PUT' : 'POST';
        
        // VALIDACIÓN CLAVE: Asegurar que se pegó el IFRAME completo
        if (!formData.embedUrl.includes('<iframe')) {
            setError('Debe pegar el código de incrustación completo (etiqueta <iframe>) de YouTube.');
            setLoading(false);
            return;
        }

        try {
            // Aseguramos que el isFeatured sea booleano
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
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#39FF14' }}>{isEditing ? 'Editar Video' : 'Crear Nuevo Video'}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Título</Form.Label>
                        <Form.Control type="text" name="title" value={formData.title} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>CÓDIGO DE INCRUSTACIÓN (Iframe Completo)</Form.Label>
                        <Form.Control as="textarea" rows={4} name="embedUrl" value={formData.embedUrl} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/>
                        <Form.Text className="text-muted">
                            Paso: Ve a YouTube, haz clic en "Compartir" $\rightarrow$ "Insertar" $\rightarrow$ Copia el código completo.
                        </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Check 
                            type="checkbox" 
                            label="Destacar en la página de inicio" 
                            name="isFeatured" 
                            checked={formData.isFeatured}
                            onChange={(e) => updateFormData(e.target.name, e.target.checked)} // Usar e.target.checked para checkbox
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


// ----------------------------------------------------
// 🚨 COMPONENTE MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
// ----------------------------------------------------

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
                    <AlertTriangle size={24} className="me-2"/> Confirmar Eliminación
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <p>
                    ¿Estás seguro de que deseas eliminar a{' '}
                    <strong style={{ color: '#39FF14' }}>{itemName}</strong>?
                </p>
                <Alert variant="warning" className="mt-3">
                    Esta acción no se puede deshacer.
                </Alert>
            </Modal.Body>

            <Modal.Footer style={{ backgroundColor: '#111' }}>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                    Eliminar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};