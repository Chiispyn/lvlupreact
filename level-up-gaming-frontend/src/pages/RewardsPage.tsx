// level-up-gaming-frontend/src/pages/RewardsPage.tsx

import React, { useState } from 'react'; 
import { Container, Card, Row, Col, Button, Badge, ProgressBar, Table, Alert } from 'react-bootstrap';
import { Award, ShoppingBag, Percent } from 'react-feather';
import { mockRewards, mockLevels } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 
import { useNavigate } from 'react-router-dom';


// ----------------------------------------------------
// COMPONENTE PARA CADA FILA DE RECOMPENSA (SIN CAMBIOS)
// ----------------------------------------------------

interface Reward { id: number; type: 'Producto' | 'Descuento'; name: string; pointsCost: number; description: string; }
type ProductAddToCartFunction = (product: any, quantity?: number, isRedeemed?: boolean, pointsCost?: number) => void;

const RewardRow: React.FC<{ reward: Reward; currentPoints: number; userId: string; showStatus: (msg: string, type: 'success' | 'danger') => void; updateContextUser: (user: any) => void; productAddToCart: ProductAddToCartFunction; }> = ({ reward, currentPoints, showStatus, productAddToCart }) => {
    
    const canAfford = currentPoints >= reward.pointsCost;
    const [loading, setLoading] = useState(false);
    
    
    const handleRedeem = async () => {
        if (!canAfford) return;

        setLoading(true);
        try {
            
            const mockProduct = {
                id: `reward-${reward.id}`, name: `[CANJE] ${reward.name}`, price: 0, 
                imageUrl: 'https://picsum.photos/id/40/100/100', countInStock: 1, 
                rating: 5, numReviews: 1, isTopSelling: false, description: reward.description
            };
            
            productAddToCart(mockProduct, 1, true, reward.pointsCost);

            showStatus(`¡Canje Exitoso! ${reward.name} añadido al carrito.`, 'success');

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
// PÁGINA PRINCIPAL (CORRECCIÓN DE PROGRESO)
// ----------------------------------------------------

const RewardsPage: React.FC = () => {
    const { user, isLoggedIn, setUserFromRegistration } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

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

    // 🚨 LÓGICA DINÁMICA DE NIVELES (CORREGIDA)
    const currentPoints = user.points;
    const userId = user.id;

    // 1. Encontrar todos los niveles que el usuario AÚN NO alcanza
    const levelsAboveCurrent = mockLevels.filter(level => level.minPoints > currentPoints);
    
    // 2. Determinar el PRÓXIMO nivel objetivo (el que tiene el minPoints más bajo de los que no ha alcanzado)
    const nextLevel = levelsAboveCurrent.length > 0 
        ? levelsAboveCurrent.reduce((min, level) => level.minPoints < min.minPoints ? level : min)
        : null; // Si no hay más niveles, es null

    // 3. Determinar el nivel actual (el que tiene el minPoints más alto que el usuario ya alcanzó)
    const currentLevel = mockLevels.filter(level => level.minPoints <= currentPoints)
        .sort((a, b) => b.minPoints - a.minPoints)[0]; // Ordena descendente y toma el primero

    const levelName = currentLevel ? currentLevel.name : 'Bronce (Nivel 1)';
    const pointsNeeded = nextLevel ? nextLevel.minPoints - currentPoints : 0;
    
    // Para la barra de progreso, usamos el umbral del nivel actual y el próximo.
    const basePoints = currentLevel ? currentLevel.minPoints : 0;
    const range = nextLevel ? (nextLevel.minPoints - basePoints) : 1000; // Rango entre niveles
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
                                        Acumula {pointsNeeded} puntos más para alcanzar el nivel {nextLevel.name.split(' ')[0]}.
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
                    ¡Tienes el 20% de descuento DUOCUC activo en todas tus compras!
                </Alert>
            )}
        </Container>
    );
};
export default RewardsPage;