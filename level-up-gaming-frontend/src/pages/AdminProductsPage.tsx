// level-up-gaming-frontend/src/pages/AdminProductsPage.tsx (CÓDIGO FINAL CORREGIDO)

import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Alert, Spinner, Badge, Button, Modal, Row, Col, Form, Card } from 'react-bootstrap';
import { Edit, Trash, ArrowLeft, PlusCircle, AlertTriangle } from 'react-feather';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Product } from '../types/Product';

import AdminLayout from '../layouts/AdminLayout'; 

// ------------------ CONSTANTES -------------------
const CLP_FORMATTER = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
const formatClp = (amount: number) => CLP_FORMATTER.format(amount);

const API_URL = '/api/products';
const CATEGORIES = ['Consolas', 'Juegos', 'Accesorios', 'Laptops', 'Computadores', 'Juegos de Mesa'];
const MAX_STOCK = 1000;
const MAX_PRICE_CLP = 10000000;

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

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}?_=${new Date().getTime()}`);
            setProducts(data);
            setError(null);
        } catch (err) {
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

    const confirmDelete = (id: string, name: string) => {
        setItemToDelete({ id, name });
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            await axios.delete(`${API_URL}/${itemToDelete.id}`);
            fetchProducts(); // Refetch products after deletion
            showStatus(`Producto "${itemToDelete.name}" eliminado con éxito.`, 'success');
        } catch (err) {
            showStatus('Fallo al eliminar el producto.', 'danger');
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <AdminLayout>

            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                {/* 🚨 CAMBIO 4: Eliminamos el botón "Volver al Panel" */}
                <div style={{ visibility: 'hidden', width: '150px' }}></div> 
                
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

            {/* TABLA ESCRITORIO (d-none d-md-block) */}
            <div className="table-responsive d-none d-md-block"> 
                <Table striped bordered hover  className="table-dark"style={{ backgroundColor: '#111', color: 'white' }}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{formatClp(product.price)}</td>
                                <td>{product.countInStock}</td>
                                <td><Badge bg="info">{product.category}</Badge></td>
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
            </div>

            {/* VISTA TARJETAS MÓVIL (d-block d-md-none) */}
            <Row className="d-block d-md-none g-3">
                {products.map(product => (
                    <Col xs={12} key={product.id}>
                        <Card style={{ backgroundColor: '#222', border: '1px solid #1E90FF', color: 'white' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0" style={{ color: '#39FF14' }}>{product.name}</h5>
                                    <Badge bg="info">{product.category}</Badge>
                                </div>

                                <hr style={{ borderColor: '#444' }}/>

                                <p className="mb-1">Precio: <strong>{formatClp(product.price)} CLP</strong></p>
                                <p className="mb-3">Stock: <Badge bg={product.countInStock > 5 ? 'success' : 'warning'}>{product.countInStock}</Badge></p>

                                <div className="d-grid gap-2">
                                    <Button variant="info" size="sm" onClick={() => setSelectedProduct(product)}>
                                        <Edit size={14} className="me-1"/> Editar
                                    </Button>

                                    <Button variant="danger" size="sm" onClick={() => confirmDelete(product.id, product.name)}>
                                        <Trash size={14} className="me-1"/> Eliminar
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modales */}
            <ProductModal
                show={showCreateModal || !!selectedProduct}
                handleClose={() => { setSelectedProduct(null); setShowCreateModal(false); }}
                currentProduct={selectedProduct}
                fetchProducts={fetchProducts}
                showStatus={showStatus}
            />

            <ConfirmDeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDelete}
                itemName={itemToDelete?.name || 'este producto'}
            />
        </AdminLayout>
    );
};

export default AdminProductsPage;


// ----------------------------------------------------
// COMPONENTES MODAL AUXILIARES
// ----------------------------------------------------

interface ConfirmDeleteModalProps { 
    show: boolean; 
    handleClose: () => void; 
    handleDelete: () => void; 
    itemName: string; 
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ show, handleClose, handleDelete, itemName }) => (
    <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#FF4444' }}>
            <Modal.Title style={{ color: '#FF4444' }}>
                <AlertTriangle size={24} className="me-2"/> Confirmar Eliminación
            </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
            <p>¿Estás seguro de que deseas eliminar <strong style={{ color: '#39FF14' }}>{itemName}</strong>?</p>
            <Alert variant="warning" className="mt-3">Esta acción no se puede deshacer.</Alert>
        </Modal.Body>

        <Modal.Footer style={{ backgroundColor: '#111' }}>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </Modal.Footer>
    </Modal>
);

// ----------------------------------------------------
// PRODUCT MODAL
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

    // ✅ AQUI está la corrección de TIPADO:
    const [formData, setFormData] = useState<Partial<Product>>({});

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentProduct) {
            setFormData(currentProduct);
            setPreviewUrl(currentProduct.imageUrl);
        } else {
            setFormData({
                name: '',
                description: '',
                price: 0,
                imageUrl: '',
                specifications: '',
                category: 'Consolas',
                countInStock: 0,
                isTopSelling: false,
                rating: 0,
                numReviews: 0,
            });
            setPreviewUrl(null);
        }
        setError(null);
    }, [currentProduct, show]);

    const updateFormData = (e: React.ChangeEvent<any>) => {
        const { name, value, type } = e.target;

        if (name === 'price' || name === 'countInStock') {
            const intValue = parseInt(value);

            if (value === '' || !isNaN(intValue)) {
                if (name === 'countInStock' && intValue > MAX_STOCK) return;
                if (name === 'price' && intValue > MAX_PRICE_CLP) return;

                setFormData(prev => ({ ...prev, [name]: intValue }));
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? e.target.checked : value,
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
            setFormData(prev => ({ ...prev, imageUrl: currentProduct?.imageUrl || '' }));
            setPreviewUrl(currentProduct?.imageUrl || null);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const price = formData.price ?? 0;
        const stock = formData.countInStock ?? 0;

        if (price < 1 || price > MAX_PRICE_CLP || isNaN(price) || !Number.isInteger(price)) {
            setError(`El precio debe ser un número entero positivo, máximo ${formatClp(MAX_PRICE_CLP)}.`);
            setLoading(false);
            return;
        }

        if (stock < 0 || stock > MAX_STOCK || isNaN(stock) || !Number.isInteger(stock)) {
            setError(`El stock debe ser un número entero no negativo, máximo ${MAX_STOCK}.`);
            setLoading(false);
            return;
        }

        if (!formData.imageUrl) {
            setError('Debe proporcionar una imagen.');
            setLoading(false);
            return;
        }

        const payload = { ...formData };
        const url = isEditing ? `${API_URL}/${currentProduct!.id}` : API_URL;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            await axios({ method, url, data: payload });

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
        <Modal show={show} onHide={handleClose} centered size="xl">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#1E90FF' }}>
                    {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <h6 className="mb-3" style={{ color: '#39FF14' }}>Información Básica</h6>

                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" name="name" value={formData.name || ''} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }} />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Categoría</Form.Label>
                                <Form.Select name="category" value={formData.category || ''} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }}>
                                    <option value="">Seleccione una categoría</option>
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Stock Disponible</Form.Label>
                                <Form.Control type="number" name="countInStock" value={formData.countInStock ?? 0} onChange={updateFormData} min="0" max={MAX_STOCK} style={{ backgroundColor: '#333', color: 'white' }} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Descripción del Producto</Form.Label>
                        <Form.Control as="textarea" rows={3} name="description" value={formData.description || ''} onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Especificaciones Técnicas</Form.Label>
                        <Form.Control as="textarea" rows={4} name="specifications" value={formData.specifications || ''} onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }} />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Precio (CLP)</Form.Label>
                                <Form.Control type="number" name="price" value={formData.price ?? 0} onChange={updateFormData} min="1" max={MAX_PRICE_CLP} style={{ backgroundColor: '#333', color: 'white' }} />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Producto Más Vendido</Form.Label>
                                <Form.Check type="checkbox" label="Marcar como Top Selling" name="isTopSelling" checked={formData.isTopSelling || false} onChange={updateFormData} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <h6 className="mb-3 mt-4 border-top pt-3" style={{ color: '#39FF14' }}>Imagen</h6>

                    <Row className="mb-3 align-items-center">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Cargar Archivo Local</Form.Label>
                                <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>URL Imagen (Respaldo)</Form.Label>
                                <Form.Control type="text" name="imageUrl" value={formData.imageUrl || ''} onChange={updateFormData} disabled={formData.imageUrl?.startsWith('data:image')} style={{ backgroundColor: '#333', color: 'white' }} />
                            </Form.Group>
                        </Col>

                        {previewUrl && (
                            <Col xs={12} className="text-center mt-3">
                                <img src={previewUrl} alt="preview" style={{ maxWidth: '150px', maxHeight: '150px' }} className="rounded shadow" />
                            </Col>
                        )}
                    </Row>

                    <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                        {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Producto'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};
