// level-up-gaming-frontend/src/components/ProductCard.tsx

import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { ShoppingCart, Star } from 'react-feather';
import { Product } from '../types/Product';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Importar useCart

// 🚨 FORMATO CLP GLOBAL (Definición auxiliar)
const CLP_FORMATTER = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
});

const formatClp = (amount: number) => CLP_FORMATTER.format(amount);


interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    // Estado para manejar el fallo de carga de la imagen
    const [imageError, setImageError] = useState(false);
    
    // Placeholder neutro en caso de error o imagen faltante
    const fallbackImage = 'https://via.placeholder.com/300x200/000000/FFFFFF?text=FOTO+DEL+PRODUCTO';
    
    const { addToCart } = useCart(); 

    const handleAddToCart = () => {
        addToCart(product);
    };

    const renderRating = () => {
        const fullStars = Math.floor(product.rating);
        const stars = [];
        for (let i = 0; i < fullStars; i++) { stars.push(<Star key={i} size={16} fill="#FFC107" stroke="#FFC107" />); }
        for (let i = fullStars; i < 5; i++) { stars.push(<Star key={i} size={16} fill="none" stroke="#FFC107" />); }
        return (
            <div className="d-flex align-items-center mb-2">
                {stars}
                <span className="ms-2 text-muted">({product.numReviews} opiniones)</span>
            </div>
        );
    };

    return (
        <Card className="h-100 shadow-sm border-0" style={{ backgroundColor: '#111', color: 'white' }}>
            <Link to={`/producto/${product.id}`}>
                <Card.Img 
                    variant="top" 
                    // 🚨 Manejo de la URL y Error
                    src={imageError ? fallbackImage : product.imageUrl} 
                    alt={product.name} 
                    onError={() => setImageError(true)} // Si la carga falla, activa el estado imageError
                    style={{ height: '200px', objectFit: 'cover' }}
                />
            </Link>
            
            <Card.Body className="d-flex flex-column">
                <Card.Title className="text-truncate" style={{ fontSize: '1.25rem', color: '#1E90FF' }}>
                    <Link to={`/producto/${product.id}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                        {product.name}
                    </Link>
                </Card.Title>
                
                {renderRating()}
                
                <Card.Text as="h3" className="text-primary mt-auto" style={{ color: '#39FF14' }}>
                    {formatClp(product.price)} {/* 🚨 Formato CLP */}
                </Card.Text>
                
                <Button 
                    variant="success" 
                    className="w-100 mt-2 d-flex align-items-center justify-content-center"
                    onClick={handleAddToCart}
                    disabled={product.countInStock === 0} 
                >
                    <ShoppingCart size={18} className="me-2" />
                    {product.countInStock === 0 ? 'AGOTADO' : 'Añadir al Carrito'}
                </Button>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;