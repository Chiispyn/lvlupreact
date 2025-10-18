// level-up-gaming-frontend/src/pages/AdminBlogPage.tsx

import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Alert, Spinner, Badge, Button, Modal, Row, Col, Form } from 'react-bootstrap';
import { Edit, Trash, ArrowLeft, PlusCircle, BookOpen } from 'react-feather';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Interface del Post (debe coincidir con el Backend)
interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    author: string;
    createdAt: string;
}

const API_URL = '/api/blog';

const AdminBlogPage: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null); 
    const [showCreateModal, setShowCreateModal] = useState(false); 
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);


    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(API_URL); 
            setPosts(data.reverse()); 
            setError(null);
        } catch (err: any) {
            setError('Error al cargar los posts. Asegúrate de que el Backend esté corriendo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);
    
    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000); 
    };

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el post "${title}"?`)) {
            try {
                await axios.delete(`${API_URL}/${id}/admin`); 
                setPosts(posts.filter(p => p.id !== id));
                showStatus(`Post "${title}" eliminado con éxito.`, 'success');
            } catch (err: any) {
                showStatus('Fallo al eliminar el post.', 'danger');
            }
        }
    };
    
    const handleEdit = (post: BlogPost) => {
        setSelectedPost(post);
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
                <h1 style={{ color: '#1E90FF' }}>Gestión de Blog/Noticias</h1>
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                    <PlusCircle size={18} className="me-2"/> Nuevo Artículo
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
                        <th>Autor</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post) => (
                        <tr key={post.id}>
                            <td style={{ color: '#39FF14' }}>{post.title}</td>
                            <td>{post.author}</td>
                            <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                            <td>
                                <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(post)}>
                                    <Edit size={14} /> Editar
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(post.id, post.title)}>
                                    <Trash size={14} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            
            {/* Modal de Creación/Edición */}
            <PostModal
                post={selectedPost} 
                show={showCreateModal || !!selectedPost}
                handleClose={() => { setSelectedPost(null); setShowCreateModal(false); }}
                fetchPosts={fetchPosts}
                showStatus={showStatus}
            />

        </Container>
    );
};

export default AdminBlogPage;


// ----------------------------------------------------
// COMPONENTE MODAL DE CREACIÓN/EDICIÓN DE POST
// ----------------------------------------------------

interface PostModalProps {
    post: BlogPost | null;
    show: boolean;
    handleClose: () => void;
    fetchPosts: () => void;
    showStatus: (msg: string, type: 'success' | 'danger') => void;
}

const PostModal: React.FC<PostModalProps> = ({ post, show, handleClose, fetchPosts, showStatus }) => {
    const isEditing = !!post;
    const [formData, setFormData] = useState({
        title: post?.title || '',
        excerpt: post?.excerpt || '',
        content: post?.content || '',
        imageUrl: post?.imageUrl || '',
        author: post?.author || 'Admin',
    });
    // Estados para la subida de archivos
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (post) {
            setFormData({ title: post.title, excerpt: post.excerpt, content: post.content, imageUrl: post.imageUrl, author: post.author });
            setPreviewUrl(post.imageUrl); // Inicializar preview con la URL existente
        } else {
            setFormData({ title: '', excerpt: '', content: '', imageUrl: '', author: 'Admin' });
            setPreviewUrl(null);
        }
        setImageFile(null);
        setError(null);
    }, [post, show]);

    const updateFormData = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // Handler para el input de archivo (simulación de subida)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Crea una URL local para la previsualización
        } else {
            setImageFile(null);
            setPreviewUrl(post?.imageUrl || null); 
        }
    };


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        // 🚨 CORRECCIÓN CLAVE: Usar 'any' en payload para permitir la bandera base64Image
        let payload: any = { ...formData }; 
        
        // LÓGICA DE MOCKING DE SUBIDA DE ARCHIVO
        if (imageFile) {
            payload = { ...payload, base64Image: 'SIMULATED_FILE_UPLOAD' };
        } else if (!formData.imageUrl) {
             setError('Debe proporcionar una imagen (URL o seleccionar un archivo).');
             setLoading(false);
             return;
        }


        const url = isEditing ? `${API_URL}/${post!.id}/admin` : `${API_URL}/admin`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            await axios({
                method: method,
                url: url,
                data: payload,
            });
            
            fetchPosts();
            handleClose();
            showStatus(`Artículo "${formData.title}" ${isEditing ? 'actualizado' : 'creado'} con éxito.`, 'success');

        } catch (err: any) {
            setError(err.response?.data?.message || `Fallo al ${isEditing ? 'actualizar' : 'crear'} el post.`);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#39FF14' }}>{isEditing ? 'Editar Artículo' : 'Crear Nuevo Post'}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Título</Form.Label>
                        <Form.Control type="text" name="title" value={formData.title} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Resumen (Excerpt)</Form.Label>
                        <Form.Control as="textarea" rows={2} name="excerpt" value={formData.excerpt} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/>
                    </Form.Group>
                    
                    {/* CAMPO DE ARCHIVO LOCAL (Subida Simulada) */}
                    <Form.Group className="mb-3">
                        <Form.Label>Imagen Principal (Archivo Local)</Form.Label>
                        <Form.Control 
                            type="file" 
                            onChange={handleFileChange} 
                            accept="image/*"
                        />
                        <Form.Text className="text-muted">
                            Selecciona un archivo para previsualizar y simular la subida.
                        </Form.Text>
                    </Form.Group>
                    
                    {/* PREVISUALIZACIÓN O URL ACTUAL */}
                    {previewUrl && (
                        <div className="mb-3 text-center">
                            <img 
                                src={previewUrl} 
                                alt="Previsualización" 
                                style={{ maxWidth: '100%', maxHeight: '150px' }} 
                                className="rounded shadow"
                            />
                        </div>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>URL Imagen (Respaldo)</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="imageUrl" 
                            value={formData.imageUrl} 
                            onChange={(e) => updateFormData(e.target.name, e.target.value)} 
                            disabled={!!imageFile} // Deshabilitar si ya se seleccionó un archivo
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Contenido (HTML permitido)</Form.Label>
                        <Form.Control as="textarea" rows={5} name="content" value={formData.content} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Autor</Form.Label>
                        <Form.Control type="text" name="author" value={formData.author} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/>
                    </Form.Group>
                    
                    <Button type="submit" variant="success" className="w-100 mt-3" disabled={loading}>
                        {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Post')}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};