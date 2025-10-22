// level-up-gaming-frontend/src/pages/RewardsPage.tsx

import React, { useState, useEffect } from 'react'; 
import { Container, Card, Row, Col, Button, Badge, ProgressBar, Table, Alert, Spinner } from 'react-bootstrap'; // 🚨 Spinner y Alert añadidos
import { Award, ShoppingBag, Percent } from 'react-feather';
import { mockLevels } from '../data/mockData'; // Solo necesitamos los niveles estáticos
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ----------------------------------------------------
// INTERFACES (Debe coincidir con la API de Recompensas)
// ----------------------------------------------------
interface Reward { id: string; type: 'Producto' | 'Descuento' | 'Envio'; name: string; pointsCost: number; description: string; isActive: boolean; season: string; imageUrl: string; }

// Tipado para la función de carrito
type ProductAddToCartFunction = (product: any, quantity?: number, isRedeemed?: boolean, pointsCost?: number) => void;

const API_URL = '/api/rewards'; // Endpoint para recompensas activas


// ----------------------------------------------------
// COMPONENTE PARA CADA FILA DE RECOMPENSA (SIN CAMBIOS)
// ----------------------------------------------------

const RewardRow: React.FC<{ reward: Reward; currentPoints: number; userId: string; showStatus: (msg: string, type: 'success' | 'danger') => void; updateContextUser: (user: any) => void; productAddToCart: ProductAddToCartFunction; }> = ({ reward, currentPoints, showStatus, productAddToCart }) => {
    
    const canAfford = currentPoints >= reward.pointsCost;
    const [loading, setLoading] = useState(false);
    
    
    const handleRedeem = async () => {
        if (!canAfford) return;

        setLoading(true);
        try {
            
            // 1. Simulación: Añadir el producto canjeado al carrito (sin restar puntos AÚN)
            const mockProduct = {
                id: `reward-${reward.id}`, name: `[CANJE] ${reward.name}`, price: 0, 
                imageUrl: reward.imageUrl, // Usamos la URL real del reward
                countInStock: 1, rating: 5, numReviews: 1, isTopSelling: false, description: reward.description
            };
            
            productAddToCart(mockProduct, 1, true, reward.pointsCost);

            // 2. NOTIFICACIÓN
            showStatus(`¡${reward.name} añadido al carrito! Los puntos se descontarán al finalizar la compra.`, 'success');

        } catch (err: any) {
             showStatus('Error al añadir el canje al carrito.', 'danger');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <tr>
            <td className="align-middle">
                {reward.type === 'Producto' ? <ShoppingBag size={20} className="me-2 text-info" /> : <Percent size={20} className="me-2 text-warning" />}
                {reward.name}
                <Badge bg={reward.type === 'Producto' ? 'info' : reward.type === 'Envio' ? 'danger' : 'warning'} className="ms-2" pill>{reward.type}</Badge>
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
// PÁGINA PRINCIPAL (CARGA DINÁMICA DE RECOMPENSAS)
// ----------------------------------------------------

const RewardsPage: React.FC = () => {
    const { user, isLoggedIn, setUserFromRegistration } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // 🚨 NUEVO ESTADO: Lista de recompensas cargadas de la API
    const [rewardsList, setRewardsList] = useState<Reward[]>([]);
    const [loadingRewards, setLoadingRewards] = useState(true);
    
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);

    // Redirigir si no está logueado
    if (!isLoggedIn || !user) {
        navigate('/login');
        return null;
    }
    
    // 🚨 FUNCIÓN: Fetch de las recompensas activas
    const fetchRewards = async () => {
        setLoadingRewards(true);
        try {
            const { data } = await axios.get(API_URL); // GET /api/rewards (solo activas)
            setRewardsList(data);
        } catch (err) {
            console.error('Error al cargar recompensas:', err);
        } finally {
            setLoadingRewards(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);
    
    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000); 
    };

    // 🚨 LÓGICA DINÁMICA DE NIVELES
    const currentPoints = user.points;
    const userId = user.id;

    // Determinar el nivel actual y el próximo
    const currentLevel = mockLevels.filter(level => level.minPoints <= currentPoints)
        .sort((a, b) => b.minPoints - a.minPoints)[0] || mockLevels[0];

    const nextLevel = mockLevels.find(level => level.minPoints > currentPoints);

    const levelName = currentLevel.name;
    const pointsNeeded = nextLevel ? nextLevel.minPoints - currentPoints : 0;
    
    const basePoints = currentLevel ? currentLevel.minPoints : 0;
    const range = nextLevel ? (nextLevel.minPoints - basePoints) : 1000;
    const progressValue = nextLevel ? currentPoints - basePoints : currentPoints;
    
    const progress = Math.min((progressValue / range) * 100, 100);
    
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
                            
                            {nextLevel ? (
                                <>
                                    <p className="text-muted">
                                        Acumula {pointsNeeded} pts más para alcanzar el nivel {nextLevel.name.split(' ')[0]}.
                                    </p>
                                    <ProgressBar animated variant="warning" now={progress} label={`${Math.round(progress)}%`}/>
                                </>
                            ) : (
                                <p className="text-success">¡Has alcanzado el nivel Diamante VIP!</p>
                            )}

                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* SECCIÓN 2: OPCIONES DE CANJE */}
            <h2 className="text-center mb-4 border-bottom pb-2" style={{ color: '#1E90FF' }}>🎁 Canjea tus Puntos</h2>
            
            {loadingRewards ? (
                <Container className="py-3 text-center"><Spinner animation="border" /></Container>
            ) : rewardsList.length === 0 ? (
                <Alert variant="secondary" className="text-center">No hay recompensas activas en este momento. El administrador debe activar promociones.</Alert>
            ) : (
                <Table striped bordered hover responsive className="shadow-sm" style={{ backgroundColor: '#111', color: 'white' }}>
                    <thead>
                        <tr><th>Recompensa</th><th className="text-end">Costo en Puntos</th><th>Descripción</th><th className="text-center">Acción</th></tr>
                    </thead>
                    <tbody>
                        {rewardsList.map((reward) => (
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
                    ¡Tienes el 20% de descuento DUOCUC activo en todas tus compras!
                </Alert>
            )}
        </Container>
    );
};
export default RewardsPage;