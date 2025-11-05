// level-up-gaming-frontend/src/pages/ProductDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Image, Button, Badge, ListGroup } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ReviewsSection from '../components/ReviewsSection'; 
import { Product, Review } from '../types/Product'; // 🚨 Importamos Review y Product
import { ShoppingCart, Star, ArrowLeft } from 'react-feather';
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext'; // Para obtener el nombre del usuario

const API_URL = '/api/products';

// FORMATO CLP GLOBAL
const CLP_FORMATTER = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
});
const formatClp = (amount: number) => CLP_FORMATTER.format(amount);


const ProductDetailPage: React.FC = () => {
    // Obtener el ID del producto desde la URL
    const { id } = useParams<{ id: string }>(); 
    const { addToCart } = useCart();
    const { user } = useAuth(); // Obtener el usuario logueado
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) { setError("ID de producto no proporcionado."); setLoading(false); return; }

            try {
                const response = await axios.get(`${API_URL}/${id}`);
                setProduct(response.data);
            } catch (err: any) {
                setError('No se pudo encontrar el producto con el ID proporcionado.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // 🚨 FUNCIÓN CRÍTICA: Añadir la reseña al estado local y recalcular ratings
    const addReviewToProduct = (newRating: number, newComment: string) => {
        if (!product) return;
        
        const newReview: Review = {
            id: Date.now().toString(), // ID único de Mocking
            name: user?.name || 'Usuario Anónimo', // Nombre del usuario logueado
            rating: newRating,
            comment: newComment,
            createdAt: new Date().toISOString(),
        };
        
        // 1. Actualizar la lista de reviews localmente (la nueva va primero)
        const updatedReviews = [newReview, ...product.reviews];
        
        // 2. Simular la actualización de numReviews y averageRating
        const newNumReviews = product.numReviews + 1;
        const totalRating = (product.rating * product.numReviews) + newRating;
        const newAverageRating = totalRating / newNumReviews;

        // 3. 🚨 Actualizar el estado del producto
        setProduct({
            ...product,
            reviews: updatedReviews,
            numReviews: newNumReviews,
            rating: newAverageRating,
        });
    };


    // Manejo de Estados
    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert><Link to="/productos"><Button variant="secondary" className="mt-3">Volver al Catálogo</Button></Link></Container>;
    if (!product) return null;


    const renderRating = () => {
        const stars = [];
        for (let i = 0; i < Math.floor(product.rating); i++) { stars.push(<Star key={i} size={18} fill="#FFC107" stroke="#FFC107" />); }
        return (
            <div className="d-flex align-items-center my-3">
                {stars}
                <span className="ms-2 text-muted">({product.numReviews} opiniones)</span>
            </div>
        );
    };
    
    const renderSpecifications = () => {
        try {
            const specs = JSON.parse(product.specifications);
            
            return (
                <ListGroup variant="flush" style={{ backgroundColor: 'transparent' }}>
                    {Object.entries(specs).map(([key, value]) => (
                        <ListGroup.Item key={key} className="d-flex justify-content-between" style={{ backgroundColor: 'transparent', color: '#D3D3D3', borderBottom: '1px dashed #333' }}>
                            <strong style={{ color: '#1E90FF' }}>{key}:</strong>
                            <span>{value as string}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            );
        } catch (e) {
            return <p className="text-muted">{product.description || 'Especificaciones no disponibles.'}</p>;
        }
    };


    const handleAddToCart = () => {
        addToCart(product);
        toast.success(`${product.name} añadido al carrito!`);
    };


    return (
        <Container className="py-5">
            <Link to="/productos" className="text-decoration-none">
                <Button variant="outline-secondary" size="sm" className="mb-4">
                    <ArrowLeft size={16} className="me-2"/> Volver al Catálogo
                </Button>
            </Link>

            <Row>
                {/* Columna de Imagen */}
                <Col md={6}>
                    <Image 
                        src={imageError ? 'https://via.placeholder.com/600x400?text=IMAGEN+NO+DISPONIBLE' : product.imageUrl} 
                        alt={product.name} 
                        fluid 
                        rounded 
                        className="shadow-lg"
                        onError={() => setImageError(true)}
                    />
                </Col>

                {/* Columna de Detalles */}
                <Col md={6} className="text-white">
                    <h1 className="mb-3" style={{ color: '#39FF14' }}>{product.name}</h1>
                    
                    {renderRating()}

                    <p className="lead text-muted">{product.description}</p>

                    <div className="my-4 p-3 rounded" style={{ backgroundColor: '#111', border: '1px solid #1E90FF' }}>
                        <h2 style={{ color: '#1E90FF' }}>{formatClp(product.price)}</h2>
                        
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <Badge bg={product.countInStock > 0 ? 'success' : 'danger'} className="fs-6">
                                {product.countInStock > 0 ? `${product.countInStock} en Stock` : 'Agotado'}
                            </Badge>
                            
                            <Button 
                                variant="success" 
                                size="lg" 
                                onClick={handleAddToCart}
                                disabled={product.countInStock === 0}
                            >
                                <ShoppingCart size={20} className="me-2"/> Añadir al Carrito
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col>
                    <h3 style={{ color: '#1E90FF' }}>Especificaciones Técnicas</h3>
                    {renderSpecifications()}
                </Col>
            </Row>
            
            <ReviewsSection 
                productId={product.id}
                averageRating={product.rating}
                numReviews={product.numReviews}
                reviews={product.reviews}
                // 🚨 PASAMOS LA FUNCIÓN DE INSERCIÓN
                onReviewSubmit={addReviewToProduct} 
            />

        </Container>
    );
};

export default ProductDetailPage;