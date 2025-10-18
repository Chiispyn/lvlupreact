// level-up-gaming-frontend/src/pages/RewardsPage.tsx

import React, { useState } from 'react';
import { Container, Card, Row, Col, Button, Badge, ProgressBar, Table, Alert } from 'react-bootstrap';
import { Award, ShoppingBag, Percent } from 'react-feather';
import { mockRewards } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


// ----------------------------------------------------
// COMPONENTE PARA CADA FILA DE RECOMPENSA
// ----------------------------------------------------

// Interfaces necesarias (se asume que Reward está definido en mockData.ts)
interface Reward { id: number; type: 'Producto' | 'Descuento'; name: string; pointsCost: number; description: string; }

const RewardRow: React.FC<{ reward: Reward; currentPoints: number; userId: string; showStatus: (msg: string, type: 'success' | 'danger') => void; updateContextUser: (user: any) => void; productAddToCart: (product: any) => void; }> = ({ reward, currentPoints, userId, showStatus, updateContextUser, productAddToCart }) => {
    const canAfford = currentPoints >= reward.pointsCost;
    const [loading, setLoading] = useState(false);
    
    // 🚨 Función principal de canje
    const handleRedeem = async () => {
        if (!canAfford) return;

        setLoading(true);
        try {
            // 1. LLAMADA A LA API: Restar puntos (pointsChange: -costo)
            const payload = { pointsToAdd: -reward.pointsCost }; // 🚨 Enviar valor negativo
            // El backend responde con el objeto de usuario completo y actualizado
            const { data } = await axios.put(`/api/users/${userId}/points`, payload);
            
            // 2. ACTUALIZAR CONTEXTO: Sincronizar el nuevo balance de puntos
            updateContextUser(data); 

            // 3. LÓGICA DE CANJE ESPECÍFICA
            if (reward.type === 'Producto') {
                // SIMULACIÓN: Añadir el producto al carrito con precio 0
                const mockProduct = {
                    id: `reward-${reward.id}`,
                    name: `RECOMPENSA: ${reward.name}`,
                    price: 0, 
                    imageUrl: 'https://picsum.photos/id/40/100/100',
                    countInStock: 1, 
                    rating: 5, numReviews: 1, isTopSelling: false, description: reward.description
                };
                productAddToCart(mockProduct);
                showStatus(`¡Canje Exitoso! ${reward.name} añadido a tu carrito.`, 'success');
            } else {
                 showStatus(`¡Descuento de ${reward.name} aplicado a tu cuenta!`, 'success');
            }

        } catch (err: any) {
             showStatus(err.response?.data?.message || 'Error al canjear puntos. Intenta de nuevo.', 'danger');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <tr>
            <td className="align-middle">
                {reward.type === 'Producto' ? <ShoppingBag size={20} className="me-2 text-info" /> : <Percent size={20} className="me-2 text-warning" />}
                {reward.name}
                <Badge bg={reward.type === 'Producto' ? 'info' : 'warning'} className="ms-2" pill>{reward.type}</Badge>
            </td>
            <td className="align-middle text-end">
                <strong style={{ color: '#39FF14' }}>{reward.pointsCost} pts</strong>
            </td>
            <td className="align-middle text-muted">{reward.description}</td>
            <td className="align-middle text-center">
                <Button 
                    variant={canAfford ? 'success' : 'secondary'} 
                    disabled={!canAfford || loading}
                    onClick={handleRedeem}
                >
                    {loading ? 'Procesando...' : (canAfford ? 'Canjear' : `Faltan ${reward.pointsCost - currentPoints} pts`)}
                </Button>
            </td>
        </tr>
    );
};


// ----------------------------------------------------
// PÁGINA PRINCIPAL
// ----------------------------------------------------

const RewardsPage: React.FC = () => {
    const { user, isLoggedIn, setUserFromRegistration } = useAuth();
    const { addToCart } = useCart(); 
    const navigate = useNavigate();

    // 🚨 Estado para la notificación de éxito/error
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);

    // Redirigir si no está logueado
    if (!isLoggedIn || !user) {
        navigate('/login');
        return null;
    }
    
    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000); 
    };

    // DATOS DINÁMICOS DEL USUARIO LOGUEADO
    const currentPoints = user.points;
    const userId = user.id;

    // Valores Ficticios para Nivel (Usamos valores altos para la simulación)
    const nextLevelPoints = 1500; 
    const levelName = currentPoints >= nextLevelPoints ? 'Oro' : (currentPoints >= 500 ? 'Plata' : 'Bronce');
    
    const progress = Math.min((currentPoints / nextLevelPoints) * 100, 100);
    
    return (
        <Container className="py-5">
            <h1 className="text-center mb-5 display-4" style={{ color: '#1E90FF' }}><Award className="me-3" size={36}/> Centro de Recompensas</h1>

            {/* 🚨 NOTIFICACIÓN ESTILIZADA */}
            {statusMessage && (
                <Alert variant={statusMessage.type} onClose={() => setStatusMessage(null)} dismissible className="mb-4">
                    {statusMessage.msg}
                </Alert>
            )}

            {/* SECCIÓN 1: BALANCE DE PUNTOS */}
            <Card className="mb-5 shadow-lg border-primary" style={{ backgroundColor: '#111', color: 'white', border: '1px solid #1E90FF' }}>
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={4} className="text-center border-end border-secondary">
                            <p className="mb-0 text-muted">Tus Puntos Acumulados</p>
                            <h2 className="display-3" style={{ color: '#39FF14' }}>{currentPoints}</h2>
                        </Col>
                        <Col md={8}>
                            <h4>Nivel Actual: <Badge bg="dark">{levelName}</Badge></h4>
                            <p className="text-muted">
                                {currentPoints < nextLevelPoints 
                                    ? `Acumula ${nextLevelPoints - currentPoints} pts más para alcanzar el nivel Oro.`
                                    : '¡Máximo Nivel Alcanzado!'}
                            </p>
                            <ProgressBar animated variant="warning" now={progress} label={`${Math.round(progress)}%`}/>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* SECCIÓN 2: OPCIONES DE CANJE */}
            <h2 className="text-center mb-4 border-bottom pb-2" style={{ color: '#1E90FF' }}>🎁 Canjea tus Puntos</h2>
            
            {mockRewards.length === 0 ? (
                <Alert variant="secondary" className="text-center">No hay recompensas disponibles en este momento.</Alert>
            ) : (
                <Table striped bordered hover responsive className="shadow-sm" style={{ backgroundColor: '#111', color: 'white' }}>
                    <thead>
                        <tr><th>Recompensa</th><th className="text-end">Costo en Puntos</th><th>Descripción</th><th className="text-center">Acción</th></tr>
                    </thead>
                    <tbody>
                        {mockRewards.map((reward) => (
                            <RewardRow 
                                key={reward.id} 
                                reward={reward} 
                                currentPoints={currentPoints} 
                                userId={userId}
                                showStatus={showStatus}
                                updateContextUser={setUserFromRegistration}
                                productAddToCart={addToCart}
                            />
                        ))}
                    </tbody>
                </Table>
            )}
            
            {user.hasDuocDiscount && (
                <Alert variant="success" className="mt-4 text-center">
                    ¡Tienes el **20% de descuento DUOCUC** activo en todas tus compras!
                </Alert>
            )}
        </Container>
    );
};
export default RewardsPage;