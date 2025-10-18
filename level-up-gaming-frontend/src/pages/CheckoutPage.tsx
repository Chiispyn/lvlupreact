// level-up-gaming-frontend/src/pages/CheckoutPage.tsx

import React, { useState, FormEvent, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Card, ListGroup, Alert, Badge, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth, User as AuthUser } from '../context/AuthContext';
import axios from 'axios';
import { Truck, CreditCard, CheckCircle, Download, MapPin } from 'react-feather'; 

// Definición de las interfaces de dirección
interface ShippingAddress { street: string; city: string; region: string; zipCode?: string; }
interface CartItem { product: { name: string; price: number }; quantity: number; }
interface Order { id: string; userId: string; items: CartItem[]; shippingAddress: ShippingAddress; paymentMethod: 'webpay' | 'transferencia' | 'efectivo'; totalPrice: number; shippingPrice: number; isPaid: boolean; status: string; createdAt: string; }

// 🚨 CONSTANTE GLOBAL PARA LA CONVERSIÓN Y FORMATO
const CLP_FORMATTER = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
});
const FREE_SHIPPING_THRESHOLD_CLP = 100000; // Envío gratis si la compra supera los $100.000 CLP
const POINTS_RATE = 1000; // 10 puntos por cada 1000 CLP gastados (Tasa de 10/1000)

// ----------------------------------------------------
// COMPONENTE: RESUMEN DE LA ORDEN (AUXILIAR)
// ----------------------------------------------------

interface SummaryProps { subtotal: number; shippingPrice: number; discount: number; discountRate: number; totalOrder: number; user: AuthUser | null; }

const OrderSummary: React.FC<SummaryProps> = ({ subtotal, shippingPrice, discount, discountRate, totalOrder, user }) => {
    // 🚨 Cálculo de Puntos a Ganar basado en la nueva tasa
    const pointsEarned = Math.floor(subtotal / POINTS_RATE) * 10;
    
    // Función de formato para el resumen
    const formatClp = (amount: number) => CLP_FORMATTER.format(amount);

    return (
        <Card className="p-4 shadow-lg" style={{ backgroundColor: '#111', border: '1px solid #39FF14', color: 'white' }}>
            <h4 className="mb-3" style={{ color: '#39FF14' }}>Resumen de Compra</h4>
            <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between" style={{ backgroundColor: 'transparent', borderBottomColor: '#333' }}>
                    <span>Subtotal Artículos:</span>
                    <span>{formatClp(subtotal)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between" style={{ backgroundColor: 'transparent', borderBottomColor: '#333' }}>
                    <span>Envío Estimado:</span>
                    <span style={{ color: shippingPrice === 0 ? 'yellow' : 'white' }}>
                        {shippingPrice === 0 ? 'GRATIS' : formatClp(shippingPrice)}
                    </span>
                </ListGroup.Item>
                
                {discount > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between fw-bold" style={{ backgroundColor: 'transparent', borderBottomColor: '#333', color: '#39FF14' }}>
                        <span>Descuento DUOCUC ({discountRate * 100}%):</span>
                        <span>-{formatClp(discount)}</span>
                    </ListGroup.Item>
                )}
                
                <ListGroup.Item className="d-flex justify-content-between fw-bold mt-3" style={{ backgroundColor: 'transparent', borderTop: '2px solid #1E90FF', color: 'white' }}>
                    <span>Total Final:</span>
                    <span style={{ color: '#39FF14', fontSize: '1.4rem' }}>{formatClp(totalOrder)}</span>
                </ListGroup.Item>

                {user && (
                    <ListGroup.Item className="mt-3 text-center" style={{ backgroundColor: 'transparent', color: 'white', borderTop: '1px dashed #333' }}>
                        <span style={{ color: '#1E90FF' }}>¡Ganarás {pointsEarned} puntos!</span> (Total: {user.points} pts)
                    </ListGroup.Item>
                )}
            </ListGroup>
        </Card>
    );
};


// ----------------------------------------------------
// PÁGINA PRINCIPAL DE CHECKOUT
// ----------------------------------------------------

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, totalPrice, clearCart, cartCount } = useCart();
    const { user, isLoggedIn, setUserFromRegistration } = useAuth();

    const [step, setStep] = useState(1);
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(user?.address || { street: '', city: '', region: '' });
    const [paymentMethod, setPaymentMethod] = useState<'webpay' | 'transferencia' | 'efectivo'>('webpay');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    // Redirigir si el carrito está vacío o no está logueado
    useEffect(() => {
        if (cartItems.length === 0) { navigate('/carrito'); }
        if (!isLoggedIn) { navigate('/login'); }
    }, [cartItems, isLoggedIn, navigate]);


    // CALCULAR COSTOS
    const subtotal = totalPrice; // Asumimos que totalPrice es el Subtotal en CLP
    
    // 🚨 Lógica de Envío Gratuito
    const shippingCostBase = 5000; // Costo base ficticio $5000 CLP
    const shippingPrice = subtotal >= FREE_SHIPPING_THRESHOLD_CLP ? 0 : shippingCostBase; 
    
    const discountRate = user?.hasDuocDiscount ? 0.20 : 0; 
    const discount = subtotal * discountRate;
    
    const totalOrder = subtotal + shippingPrice - discount;
    const pointsEarned = Math.floor(subtotal / POINTS_RATE) * 10; // 🚨 Cálculo de puntos

    
    // Función que simula la descarga de la boleta 
    const handleDownloadInvoice = (orderId: string) => {
        console.log(`Boleta #${orderId.slice(0, 8)} GENERADA y lista.`);
    };

    
    // ----------------------------------------------------
    // LÓGICA DE FINALIZACIÓN DE COMPRA (Place Order)
    // ----------------------------------------------------
    const placeOrderHandler = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const payload = {
                userId: user?.id,
                items: cartItems,
                shippingAddress,
                paymentMethod,
                totalPrice: totalOrder,
                shippingPrice: shippingPrice,
            };

            // 1. CREAR ORDEN
            const resOrder = await axios.post<Order>('/api/orders', payload);
            const createdOrder = resOrder.data;
            
            // 2. 🚨 ACTUALIZAR PUNTOS DEL USUARIO
            if (user && pointsEarned > 0) {
                const resPoints = await axios.put<AuthUser>(`/api/users/${user.id}/points`, { pointsToAdd: pointsEarned });
                setUserFromRegistration(resPoints.data); 
            }

            // 3. ABRIR MODAL DE BOLETA
            handleDownloadInvoice(createdOrder.id); 
            setOrderId(createdOrder.id);
            setShowInvoiceModal(true); 

        } catch (error: any) {
            setError(error.response?.data?.message || 'Error al completar la compra. Revisa la consola del servidor.');
        } finally {
            setLoading(false);
        }
    };
    
    // Función de formato CLP local para uso en JSX
    const formatClp = (amount: number) => CLP_FORMATTER.format(amount);

    // ----------------------------------------------------
    // VISTAS DE CADA PASO
    // ----------------------------------------------------

    const Step1Shipping = (
        <Card className="p-4" style={{ backgroundColor: '#111', border: '1px solid #1E90FF' }}>
            <h4 style={{ color: '#1E90FF' }}>1. Dirección de Envío</h4>
            <Alert variant="warning" style={{ backgroundColor: '#222', border: 'none', color: 'white' }}>
                Tu dirección registrada es: <strong>{user?.address?.street || 'No registrada'}</strong>. Edita tu perfil si necesitas cambiarla permanentemente.
            </Alert>

            <Form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <Form.Group className="mb-3"><Form.Label>Calle y Número</Form.Label>
                    <Form.Control type="text" value={shippingAddress.street} onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})} required style={{ backgroundColor: '#333', color: 'white' }}/>
                </Form.Group>
                <Row>
                    <Col><Form.Group className="mb-3"><Form.Label>Ciudad</Form.Label>
                        <Form.Control type="text" value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} required style={{ backgroundColor: '#333', color: 'white' }}/></Form.Group></Col>
                    <Col><Form.Group className="mb-3"><Form.Label>Región</Form.Label>
                        <Form.Control type="text" value={shippingAddress.region} onChange={(e) => setShippingAddress({...shippingAddress, region: e.target.value})} required style={{ backgroundColor: '#333', color: 'white' }}/></Form.Group></Col>
                </Row>
                <Button type="submit" variant="primary" className="mt-3 w-100">Continuar a Pago</Button>
            </Form>
        </Card>
    );

    const Step2Payment = (
        <Card className="p-4" style={{ backgroundColor: '#111', border: '1px solid #1E90FF' }}>
            <h4 style={{ color: '#1E90FF' }}>2. Método de Pago</h4>
            <ListGroup className="mt-3 mb-3">
                <ListGroup.Item style={{ backgroundColor: '#333', color: 'white' }} className="fw-bold">
                    Artículos en el Carrito: {cartCount} unidades.
                </ListGroup.Item>
            </ListGroup>

            <ListGroup>
                <ListGroup.Item style={{ backgroundColor: '#222', color: 'white' }}>
                    <Form.Check type="radio" label="WebPay / Tarjeta de Crédito (Recomendado)" name="paymentMethod" id="webpay" value="webpay" checked={paymentMethod === 'webpay'} onChange={(e) => setPaymentMethod(e.target.value as 'webpay')}/>
                </ListGroup.Item>
                <ListGroup.Item style={{ backgroundColor: '#222', color: 'white' }}>
                    <Form.Check type="radio" label="Transferencia Bancaria" name="paymentMethod" id="transferencia" value="transferencia" checked={paymentMethod === 'transferencia'} onChange={(e) => setPaymentMethod(e.target.value as 'transferencia')}/>
                </ListGroup.Item>
                <ListGroup.Item style={{ backgroundColor: '#222', color: 'white' }}>
                    <Form.Check type="radio" label="Efectivo (Solo Retiro en Tienda)" name="paymentMethod" id="efectivo" value="efectivo" checked={paymentMethod === 'efectivo'} onChange={(e) => setPaymentMethod(e.target.value as 'efectivo')}/>
                </ListGroup.Item>
            </ListGroup>

            <Button variant="secondary" onClick={() => setStep(1)} className="mt-4 me-2">Volver</Button>
            <Button variant="primary" onClick={() => setStep(3)} className="mt-4">Revisar y Pagar</Button>
        </Card>
    );

    const Step3Review = (
        <Card className="p-4" style={{ backgroundColor: '#111', border: '1px solid #1E90FF' }}>
            <h4 style={{ color: '#1E90FF' }}>3. Resumen y Confirmación</h4>
            
            <Alert variant="info" style={{ backgroundColor: '#222', border: 'none', color: 'white' }}>
                Revisa los detalles antes de finalizar la compra.
            </Alert>
            
            <h5 className="mt-3 border-bottom pb-2" style={{ color: '#39FF14' }}>Envío a:</h5>
            <p className="text-muted">{shippingAddress.street}, {shippingAddress.city}, {shippingAddress.region}</p>

            <h5 className="mt-3 border-bottom pb-2" style={{ color: '#39FF14' }}>Método de Pago:</h5>
            <p className="text-muted">{paymentMethod.toUpperCase()}</p>
            
            <h5 className="mt-3 border-bottom pb-2" style={{ color: '#39FF14' }}>Artículos:</h5>
            <ListGroup variant="flush">
                {cartItems.map(item => (
                    <ListGroup.Item key={item.product.id} className="d-flex justify-content-between" style={{ backgroundColor: 'transparent', color: 'white', borderBottomColor: '#333' }}>
                        <span>{item.product.name} ({item.quantity} ud.)</span>
                        <span>{formatClp(item.product.price * item.quantity)}</span>
                    </ListGroup.Item>
                ))}
            </ListGroup>
            
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

            <Button variant="secondary" onClick={() => setStep(2)} className="mt-4 me-2">Volver</Button>
            <Button variant="success" onClick={placeOrderHandler} disabled={loading} className="mt-4">
                {loading ? 'Procesando...' : `Pagar y Finalizar Orden (${formatClp(totalOrder)})`}
            </Button>
        </Card>
    );
    
    // Vista de Confirmación (Boleta aquí)
    const Step4Confirmation = (
        <Card className="p-5 text-center shadow-lg" style={{ backgroundColor: '#111', border: '2px solid #39FF14', color: 'white' }}>
            <CheckCircle size={80} color="#39FF14" className="mb-4 mx-auto"/>
            <h2 className="mb-3" style={{ color: '#39FF14' }}>¡Compra Finalizada con Éxito!</h2>
            <p className="lead">Tu orden **#{orderId}** ha sido procesada.</p>
            <p className="text-muted">Revisa tu historial de órdenes para ver los detalles completos.</p>
            
            <div className="d-flex justify-content-center mt-4">
                <Button variant="primary" onClick={() => navigate('/myorders')} className="me-3">Ver Mis Órdenes</Button>
                <Button variant="outline-light" onClick={() => navigate('/')}>Volver al Inicio</Button>
            </div>
        </Card>
    );

    // Renderizado principal
    const renderStep = () => {
        switch (step) {
            case 1: return Step1Shipping;
            case 2: return Step2Payment;
            case 3: return Step3Review;
            case 4: return Step4Confirmation;
            default: return null;
        }
    };
    
    return (
        <Container className="py-5">
            <h1 className="text-center mb-5" style={{ color: '#1E90FF' }}>Proceso de Pago</h1>
            
            <Row className="mb-4">
                <Col md={12}>
                    <div className="d-flex justify-content-between text-muted mb-4">
                        <span style={{ color: step >= 1 ? '#39FF14' : 'gray' }}><Truck size={20} className="me-1"/> 1. Envío</span>
                        <span style={{ color: step >= 2 ? '#39FF14' : 'gray' }}><CreditCard size={20} className="me-1"/> 2. Pago</span>
                        <span style={{ color: step >= 3 ? '#39FF14' : 'gray' }}><CheckCircle size={20} className="me-1"/> 3. Confirmación</span>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={7}>
                    {renderStep()}
                </Col>
                <Col md={5}>
                    {step < 4 && (
                        <OrderSummary 
                            subtotal={subtotal} 
                            shippingPrice={shippingPrice} 
                            discount={discount} 
                            discountRate={discountRate}
                            totalOrder={totalOrder}
                            user={user}
                        />
                    )}
                </Col>
            </Row>
            
            {/* MODAL DE BOLETA (Controla la aparición obligatoria al finalizar la compra) */}
            <InvoiceModal 
                show={showInvoiceModal}
                handleClose={() => setShowInvoiceModal(false)}
                orderId={orderId}
                totalOrder={totalOrder}
                shippingAddress={shippingAddress}
                cartItems={cartItems}
                // Pasar las funciones de avance al modal
                setStep={setStep}
                clearCart={clearCart}
            />

        </Container>
    );
};

export default CheckoutPage;


// ----------------------------------------------------
// COMPONENTE MODAL DE BOLETA (Simula el PDF)
// ----------------------------------------------------

interface InvoiceModalProps {
    show: boolean;
    handleClose: () => void;
    orderId: string | null;
    totalOrder: number;
    shippingAddress: ShippingAddress;
    cartItems: CartItem[];
    // Props de avance
    setStep: (step: number) => void;
    clearCart: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ show, handleClose, orderId, totalOrder, shippingAddress, cartItems, setStep, clearCart }) => {
    
    // Función que limpia el carrito, cierra el modal y avanza
    const handleCloseAndAdvance = () => {
        clearCart(); 
        handleClose(); 
        setStep(4); // 🚨 AVANZAR EL PASO A LA CONFIRMACIÓN FINAL
    };

    const handlePrint = () => {
        window.print(); 
    };
    
    // Función de formato CLP local
    const formatClp = (amount: number) => CLP_FORMATTER.format(amount);

    // Aseguramos que el modal no se cierre accidentalmente con click
    if (!orderId) return null;

    return (
        <Modal show={show} onHide={handleCloseAndAdvance} size="lg" centered id="invoiceModal">
            <Modal.Header closeButton style={{ backgroundColor: '#000', borderBottomColor: '#39FF14' }}>
                <Modal.Title style={{ color: '#39FF14' }}>
                    <Download size={24} className="me-2"/> BOLETA ELECTRÓNICA #{orderId?.slice(0, 8)}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <Alert variant="success" style={{ backgroundColor: '#333', border: '1px solid #39FF14', color: 'white' }}>
                    **¡Pago Exitoso!** Este es tu comprobante de compra.
                </Alert>
                
                <h5 style={{ color: '#1E90FF' }}>Detalles de Envío</h5>
                <p className="text-muted mb-3">
                    **Orden #:** {orderId?.slice(0, 8)}... <br/>
                    **Dirección:** {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.region}
                </p>
                
                <h5 style={{ color: '#1E90FF' }}>Productos</h5>
                <ListGroup className="mb-4">
                    {cartItems.map((item, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between" style={{ backgroundColor: 'transparent', color: 'white', borderBottomColor: '#333' }}>
                            <span>{item.product.name}</span>
                            <strong>x{item.quantity}</strong>
                            <span style={{ color: '#39FF14' }}>{formatClp(item.product.price * item.quantity)}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                
                <h3 className="text-end" style={{ color: '#1E90FF' }}>TOTAL: <span style={{ color: '#39FF14' }}>{formatClp(totalOrder)}</span></h3>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#000', borderTopColor: '#333' }}>
                <Button variant="secondary" onClick={handleCloseAndAdvance}>
                    Cerrar y Continuar
                </Button>
                <Button variant="success" onClick={handlePrint}>
                    Imprimir Comprobante
                </Button>
            </Modal.Footer>
        </Modal>
    );
};