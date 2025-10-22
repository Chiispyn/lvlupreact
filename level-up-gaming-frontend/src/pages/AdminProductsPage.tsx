// level-up-gaming-frontend/src/pages/AdminProductsPage.tsx (CÓDIGO COMPLETO)

import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Alert, Spinner, Button, Modal, Row, Col, Form } from 'react-bootstrap';
import { Edit, Trash, ArrowLeft, PlusCircle, AlertTriangle } from 'react-feather'; // 🚨 Importar AlertTriangle
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Product } from '../types/Product';

const API_URL = '/api/products';
const CATEGORIES = ['Consolas', 'Juegos', 'Accesorios', 'Laptops', 'Computadores', 'Juegos de Mesa'];

// ----------------------------------------------------
// PÁGINA PRINCIPAL DE ADMINISTRACIÓN DE PRODUCTOS
// ----------------------------------------------------

const AdminProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);

    // 🚨 ESTADOS PARA ELIMINACIÓN
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);


    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(API_URL);
            setProducts(data);
            setError(null);
        } catch (err: any) {
            setError('No se pudo cargar la lista. Asegúrate de que el Backend esté corriendo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000);
    };

    // 🚨 FUNCIÓN: Abre el modal de confirmación
    const confirmDelete = (id: string, name: string) => {
        setItemToDelete({ id, name });
        setShowDeleteModal(true);
    };

    // 🚨 FUNCIÓN: Ejecuta la eliminación después de la confirmación del modal
    const handleDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            await axios.delete(`${API_URL}/${itemToDelete.id}`);
            setProducts(products.filter(p => p.id !== itemToDelete.id));
            showStatus(`Producto "${itemToDelete.name}" eliminado con éxito.`, 'success');
        } catch (err: any) {
            showStatus('Fallo al eliminar el producto.', 'danger');
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
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
                <h1 style={{ color: '#1E90FF' }}>Gestión de Productos</h1>
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                    <PlusCircle size={18} className="me-2" /> Nuevo Producto
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
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Top</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td style={{ fontSize: '0.8rem' }}>{product.id.slice(0, 8)}...</td>
                            <td>{product.name}</td>
                            <td>${product.price.toFixed(2)}</td>
                            <td>{product.countInStock}</td>
                            <td>{product.isTopSelling ? '✅' : '❌'}</td>
                            <td>
                                <Button variant="info" size="sm" className="me-2" onClick={() => setSelectedProduct(product)}>
                                    <Edit size={14} />
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => confirmDelete(product.id, product.name)}>
                                    <Trash size={14} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal de Creación/Edición */}
            <ProductModal
                show={showCreateModal || !!selectedProduct}
                handleClose={() => { setSelectedProduct(null); setShowCreateModal(false); }}
                currentProduct={selectedProduct}
                fetchProducts={fetchProducts}
                showStatus={showStatus}
            />
            
            {/* 🚨 MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            <ConfirmDeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDelete}
                itemName={itemToDelete?.name || 'este producto'}
            />
        </Container>
    );
};

export default AdminProductsPage;


// ----------------------------------------------------
// COMPONENTE MODAL DE CREACIÓN/EDICIÓN DE PRODUCTO
// ----------------------------------------------------

interface ProductModalProps {
    show: boolean;
    handleClose: () => void;
    currentProduct: Product | null;
    fetchProducts: () => void;
    showStatus: (msg: string, type: 'success' | 'danger') => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ show, handleClose, currentProduct, fetchProducts, showStatus }) => {
    const isEditing = !!currentProduct;
    const [formData, setFormData] = useState<Partial<Product> | any>({}); 
    
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Inicializa o limpia estados al abrir/cerrar
        if (currentProduct) {
            setFormData(currentProduct);
            setPreviewUrl(currentProduct.imageUrl); // Usa la URL existente para edición
        } else {
            setFormData({
                name: '', description: '', price: 0, imageUrl: '', specifications: '', category: 'Consolas', 
                countInStock: 0, isTopSelling: false, rating: 0, numReviews: 0,
            });
            setPreviewUrl(null);
        }
        setError(null);
    }, [currentProduct, show]);


    // FUNCIÓN DE UTILIDAD: Para actualizar el estado
    const updateFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // 🚨 Validación estricta para Price y Stock (enteros positivos)
        if (name === 'price' || name === 'countInStock') {
            const integerValue = parseInt(value);
            if (value === '' || !isNaN(integerValue)) {
                setFormData((prev: any) => ({ ...prev, [name]: integerValue }));
            }
            return;
        }

        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    // HANDLER DE ARCHIVO: Muestra la imagen local seleccionada y guarda Base64 en imageUrl
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData((prev: any) => ({ ...prev, imageUrl: base64String })); 
                setPreviewUrl(base64String); // Muestra la imagen Base64 localmente
            };
            reader.readAsDataURL(file);

        } else {
            setPreviewUrl(currentProduct?.imageUrl || null);
            setFormData((prev: any) => ({ ...prev, imageUrl: currentProduct?.imageUrl || '' }));
        }
    };
    

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const price = formData.price;
        const stock = formData.countInStock;

        // 🚨 VALIDACIONES CRÍTICAS DE STOCK Y PRECIO
        if (price === null || price < 1 || isNaN(price) || !Number.isInteger(price)) {
            setError('El precio debe ser un número entero y positivo (CLP).');
            setLoading(false);
            return;
        }
        
        if (stock === null || stock < 0 || isNaN(stock) || !Number.isInteger(stock)) {
            setError('El stock debe ser un número entero no negativo.');
            setLoading(false);
            return;
        }
        // -------------------------------------------


        let payload: any = { ...formData };

        // --- VALIDACIÓN FINAL ---
        if (!payload.imageUrl) {
            setError('Debe proporcionar una imagen.');
            setLoading(false);
            return;
        }
        
        delete payload.base64Image; 

        const url = isEditing ? `${API_URL}/${currentProduct!.id}` : API_URL;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            await axios({
                method: method,
                url: url,
                data: payload,
            });

            fetchProducts(); 
            handleClose();
            showStatus(`Producto "${formData.name}" ${isEditing ? 'actualizado' : 'creado'} con éxito.`, 'success');

        } catch (err: any) {
            setError(err.response?.data?.message || `Fallo al ${isEditing ? 'actualizar' : 'crear'} el producto.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#1E90FF' }}>{currentProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" name="name" value={formData.name || ''} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }} />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Categoría</Form.Label>
                        <Form.Select
                            name="category"
                            value={formData.category || 'Consolas'} // Valor por defecto
                            onChange={updateFormData}
                            required
                            style={{ backgroundColor: '#333', color: 'white' }}
                        >
                            <option value="">Seleccione una categoría</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción del Producto</Form.Label> 
                        <Form.Control as="textarea" rows={3} name="description" value={formData.description || ''} onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }} />
                        <Form.Text className="text-muted">Texto general de marketing.</Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Especificaciones Técnicas</Form.Label> 
                        <Form.Control 
                            as="textarea" 
                            rows={4} 
                            name="specifications" 
                            value={formData.specifications || ''} 
                            onChange={updateFormData} 
                            style={{ backgroundColor: '#333', color: 'white' }} 
                        />
                        <Form.Text className="text-muted">Detalles (Modelo, Fabricante, Tasa de Refresco, etc.).</Form.Text>
                    </Form.Group>

                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Precio (CLP)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name="price" 
                                    value={formData.price ?? 0} 
                                    onChange={updateFormData} 
                                    required 
                                    step="1" // Solo permite enteros en el UI
                                    min="1"
                                    style={{ backgroundColor: '#333', color: 'white' }} 
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Stock Disponible</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name="countInStock" 
                                    value={formData.countInStock ?? 0} 
                                    onChange={updateFormData} 
                                    required 
                                    step="1" // Solo permite enteros en el UI
                                    min="0"
                                    style={{ backgroundColor: '#333', color: 'white' }} 
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* CAMPO DE ARCHIVO LOCAL (Subida Base64) */}
                    <Form.Group className="mb-3">
                        <Form.Label>Imagen del Producto</Form.Label>
                        <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
                        <Form.Text className="text-muted">
                            Selecciona un archivo (se guardará como texto Base64).
                        </Form.Text>
                    </Form.Group>

                    {/* PREVISUALIZACIÓN INMEDIATA */}
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
                            value={formData.imageUrl || ''}
                            onChange={updateFormData}
                            // Deshabilitar si hay un Base64 activo (y es muy largo)
                            disabled={formData.imageUrl && formData.imageUrl.startsWith('data:image')} 
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Check type="checkbox" label="Producto Más Vendido" name="isTopSelling" checked={!!formData.isTopSelling} onChange={updateFormData} />
                    </Form.Group>

                    <Button type="submit" variant="primary" className="w-100 mt-3" disabled={loading}>
                        {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Producto')}
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