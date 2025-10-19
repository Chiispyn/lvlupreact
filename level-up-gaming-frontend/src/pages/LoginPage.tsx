// level-up-gaming-frontend/src/pages/LoginPage.tsx

import React, { useState, FormEvent, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const LoginPage: React.FC = () => {
    // 🚨 Usamos useState sin valor por defecto si es la versión final
    const [loginIdentifier, setLoginIdentifier] = useState('admin@levelup.com'); 
    const [password, setPassword] = useState('admin123'); 
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { login, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // 🚨 CORRECCIÓN CLAVE: Redirigir el usuario LOGUEADO SÓLO después del renderizado
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    // Si ya está logueado, retornamos null para evitar el renderizado
    if (isLoggedIn) {
        return null;
    }

    const submitHandler = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const success = await login(loginIdentifier, password);

        if (success) {
            // El estado 'isLoggedIn' en useAuth cambiará, lo que activará el useEffect de arriba
            // y ejecutará navigate('/') de forma segura.
        } else {
            setError('Credenciales incorrectas. Intenta de nuevo.');
        }

        setLoading(false);
    };

    return (
        <Container className="my-5">
            <Row className="justify-content-md-center">
                <Col xs={12} md={6}>
                    <Card className="p-4" style={{ backgroundColor: '#111', border: '1px solid #1E90FF' }}>
                        <h2 className="text-center mb-4">Iniciar Sesión</h2>
                        
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form onSubmit={submitHandler}>
                            <Form.Group className="mb-3" controlId="loginIdentifier">
                                <Form.Label>Email o Nombre de Usuario</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingresa email o nombre"
                                    value={loginIdentifier}
                                    onChange={(e) => setLoginIdentifier(e.target.value)}
                                    required
                                    style={{ backgroundColor: '#222', color: 'white' }}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="password">
                                <Form.Label>Contraseña</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ backgroundColor: '#222', color: 'white' }}
                                />
                            </Form.Group>

                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="w-100" 
                                disabled={loading}
                            >
                                {loading ? 'Cargando...' : 'Iniciar Sesión'}
                            </Button>
                        </Form>
                        
                        <Row className="py-3">
                            <Col className="text-center text-muted">
                                ¿No tienes cuenta? <Link to="/register" style={{ color: '#39FF14' }}>Regístrate</Link>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;