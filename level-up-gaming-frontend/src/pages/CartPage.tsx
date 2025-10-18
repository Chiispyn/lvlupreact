// level-up-gaming-frontend/src/pages/CartPage.tsx

import React from 'react';
import { Container, Row, Col, Alert, ListGroup, Button, Image, Badge } from 'react-bootstrap';
import { ShoppingCart, Trash, Plus, Minus } from 'react-feather';
import { useCart } from '../context/CartContext'; 
import { Link } from 'react-router-dom'; // Importación clave

const CartPage: React.FC = () => {
    const { cartItems, totalPrice, cartCount, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();
    
    // Si la lista está vacía
    if (cartItems.length === 0) {
        return (
            <Container className="py-5">
                <h1 className="mb-4" style={{ color: '#1E90FF' }}><ShoppingCart className="me-2"/> Carrito de Compras</h1>
                
                {/* Alerta de Carrito Vacío */}
                <Alert variant="info" className="text-center" style={{ backgroundColor: '#333', border: '1px solid #1E90FF', color: 'white' }}>
                    ¡Tu carrito está actualmente vacío! Explora nuestro <Link to="/productos" style={{ color: '#39FF14' }}>catálogo</Link> para empezar a comprar.
                </Alert>
                
                <div className="text-center mt-4">
                    {/* 🚨 CORRECCIÓN: Usar Link y aplicar clases de Bootstrap button */}
                    <Link 
                        to="/productos"
                        className="btn btn-outline-primary" // Clases de Button de Bootstrap
                    >
                        Ver Productos
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="mb-4" style={{ color: '#1E90FF' }}><ShoppingCart className="me-2"/> Carrito de Compras ({cartCount})</h1>
            
            <Row>
                <Col md={8}>
                    <ListGroup className="mb-3">
                        {cartItems.map((item) => (
                            <ListGroup.Item key={item.product.id} className="d-flex align-items-center" style={{ backgroundColor: '#111', border: '1px solid #333', color: 'white' }}>
                                
                                <Image src={item.product.imageUrl} alt={item.product.name} style={{ width: '60px', height: '60px', objectFit: 'cover' }} className="me-3 rounded"/>

                                <div className="flex-grow-1">
                                    <h5 className="mb-1" style={{ color: '#1E90FF' }}>{item.product.name}</h5>
                                    <p className="mb-0 text-muted">${item.product.price.toFixed(2)}</p>
                                    {item.product.countInStock === item.quantity && (
                                        <Badge bg="warning" text="dark" className="mt-1">Máx. Stock</Badge>
                                    )}
                                </div>

                                {/* Control de Cantidad */}
                                <div className="d-flex align-items-center mx-4">
                                    <Button variant="outline-light" size="sm" onClick={() => decreaseQuantity(item.product.id)} disabled={item.quantity <= 1}>
                                        <Minus size={16} />
                                    </Button>
                                    <span className="mx-2">{item.quantity}</span>
                                    <Button variant="outline-light" size="sm" onClick={() => increaseQuantity(item.product.id)} disabled={item.product.countInStock <= item.quantity}>
                                        <Plus size={16} />
                                    </Button>
                                </div>
                                
                                {/* Subtotal y Eliminar */}
                                <div className="ms-auto text-end">
                                    <strong style={{ color: '#39FF14' }}>${(item.product.price * item.quantity).toFixed(2)}</strong>
                                    <Button variant="link" size="sm" className="ms-3 text-danger" onClick={() => removeFromCart(item.product.id)}>
                                        <Trash size={18} />
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                    
                    <div className="text-end">
                        <Button variant="outline-danger" onClick={clearCart}>Vaciar Carrito</Button>
                    </div>

                </Col>
                <Col md={4}>
                    <div className="p-3 rounded shadow-lg" style={{ backgroundColor: '#111', border: '1px solid #1E90FF' }}>
                        <h4 className="mb-3" style={{ color: '#1E90FF' }}>Resumen del Pedido</h4>
                        <div className="d-flex justify-content-between my-2 text-muted">
                            <span>Subtotal:</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold border-top pt-2" style={{ color: '#39FF14' }}>
                            <span>Total Estimado:</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        
                        <Alert variant="warning" className="mt-3" style={{ backgroundColor: '#222', border: 'none', color: 'white' }}>
                           **Finalizando:** El 20% de descuento y los puntos se aplicarán en la fase de Checkout.
                        </Alert>
                        
                        {/* 🚨 CORRECCIÓN: Usar Link y aplicar clases de Bootstrap button */}
                        <Link 
                            to="/checkout"
                            className="btn btn-success w-100 mt-3" // Clases de Button de Bootstrap
                        >
                            Proceder al Pago
                        </Link>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default CartPage;