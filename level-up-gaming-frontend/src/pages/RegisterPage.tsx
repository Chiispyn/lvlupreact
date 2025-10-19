// level-up-gaming-frontend/src/pages/RegisterPage.tsx

import React, { useState, FormEvent } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rut, setRut] = useState('');
    const [age, setAge] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [region, setRegion] = useState('');
    const [referralCodeInput, setReferralCodeInput] = useState(''); 
    
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { setUserFromRegistration, isLoggedIn } = useAuth(); 

    if (isLoggedIn) {
        navigate('/');
        return null;
    }
    
    // FUNCIÓN DE VERIFICACIÓN DE RUT
    const validateRut = (rutValue: string): boolean => {
        let rutLimpio = rutValue.replace(/[^0-9kK]/g, ''); 
        if (rutLimpio.length < 2) return false;

        let dv = rutLimpio.charAt(rutLimpio.length - 1);
        let rutNumeros = rutLimpio.substring(0, rutLimpio.length - 1);
        
        if (!/^\d+$/.test(rutNumeros)) return false; 

        let suma = 0;
        let multiplo = 2;
        for (let i = rutNumeros.length - 1; i >= 0; i--) {
            suma += parseInt(rutNumeros.charAt(i)) * multiplo;
            multiplo = multiplo < 7 ? multiplo + 1 : 2;
        }
        let dvEsperado = 11 - (suma % 11);
        let dvFinal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

        return dv.toUpperCase() === dvFinal;
    };


    const submitHandler = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // --- VALIDACIONES DE FRONTEND (Ajustadas) ---
        if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); setLoading(false); return; }
        if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); setLoading(false); return; }
        if (!validateRut(rut)) { setError('El RUT ingresado es inválido.'); setLoading(false); return; }
        
        const ageInt = parseInt(age);
        // 🚨 VALIDACIÓN DE EDAD: Restringir entre 18 y 95
        if (ageInt < 18 || ageInt > 95) { setError('La edad debe estar entre 18 y 95 años.'); setLoading(false); return; }
        
        if (!street || !city || !region) { setError('Todos los campos de dirección son obligatorios.'); setLoading(false); return; }
        // --- FIN VALIDACIONES ---

        try {
            const payload = { 
                name, email, password,
                rut: rut.replace(/[^0-9kK]/g, ''), 
                age: ageInt, // Usamos la variable ya parseada
                address: { street, city, region, zipCode: '' },
                referredBy: referralCodeInput || null
            };

            const res = await axios.post('/api/users/register', payload);
            
            setUserFromRegistration(res.data); 
            navigate('/'); 

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error desconocido durante el registro.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-5">
            <Row className="justify-content-md-center">
                <Col xs={12} md={8}> 
                    <Card className="p-4" style={{ backgroundColor: '#111', border: '1px solid #39FF14' }}>
                        <h2 className="text-center mb-4" style={{ color: '#39FF14' }}>Registro de Cuenta</h2>
                        <p className="text-center text-muted"><Badge bg="info" className="me-1">¡Regalo!</Badge> Obtienes 100 puntos y código de referido.</p>
                        
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form onSubmit={submitHandler}>
                            {/* 1. DATOS PERSONALES */}
                            <h5 className="mb-3" style={{ color: '#1E90FF' }}>Información de Usuario</h5>
                            <Form.Group className="mb-3" controlId="name">
                                <Form.Label>Nombre Completo</Form.Label>
                                <Form.Control type="text" placeholder="Ingresa tu nombre" value={name} onChange={(e) => setName(e.target.value)} required style={{ backgroundColor: '#222', color: 'white' }}/>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="email">
                                <Form.Label>Correo Electrónico</Form.Label>
                                <Form.Control type="email" placeholder="Incluye @duocuc.cl para 20% OFF de por vida" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ backgroundColor: '#222', color: 'white' }}/>
                            </Form.Group>
                            
                            <Row>
                                <Col xs={8}> {/* Campo RUT */}
                                    <Form.Group className="mb-3" controlId="rut"><Form.Label>RUT</Form.Label>
                                        <Form.Control type="text" placeholder="Sin puntos ni guión (Ej: 12345678K)" value={rut} onChange={(e) => setRut(e.target.value)} required isInvalid={rut.length > 0 && !validateRut(rut)} style={{ backgroundColor: '#222', color: 'white' }}/></Form.Group>
                                </Col>
                                <Col xs={4}> {/* Campo Edad */}
                                    <Form.Group className="mb-3" controlId="age"><Form.Label>Edad</Form.Label>
                                        <Form.Control 
                                            type="number" 
                                            value={age} 
                                            onChange={(e) => setAge(e.target.value)} 
                                            required 
                                            min={18} 
                                            max={95} // 🚨 Límite de la UI
                                            isInvalid={parseInt(age) < 18 || parseInt(age) > 95} // 🚨 Límite de la validación
                                            style={{ backgroundColor: '#222', color: 'white' }}
                                        />
                                        <Form.Control.Feedback type="invalid">Edad debe estar entre 18 y 95.</Form.Control.Feedback>
                                        </Form.Group>
                                </Col>
                            </Row>
                            
                            {/* NUEVO CAMPO: CÓDIGO DE REFERIDO */}
                            <Form.Group className="mb-3" controlId="referral">
                                <Form.Label>Código de Referido (Opcional)</Form.Label>
                                <Form.Control type="text" placeholder="Ingresa un código de amigo" value={referralCodeInput} onChange={(e) => setReferralCodeInput(e.target.value)} style={{ backgroundColor: '#222', color: 'white' }}/>
                                <Form.Text className="text-muted">Si ingresas un código, tú y tu amigo ganarán 50 puntos extra.</Form.Text>
                            </Form.Group>


                            {/* 2. DIRECCIÓN DE ENVÍO */}
                            <h5 className="mb-3 mt-4 border-top pt-3" style={{ color: '#1E90FF' }}>Dirección de Envío</h5>
                            <Form.Group className="mb-3" controlId="street"><Form.Label>Calle y Número</Form.Label>
                                <Form.Control type="text" value={street} onChange={(e) => setStreet(e.target.value)} required style={{ backgroundColor: '#222', color: 'white' }}/></Form.Group>
                            
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3" controlId="city"><Form.Label>Ciudad</Form.Label>
                                        <Form.Control type="text" value={city} onChange={(e) => setCity(e.target.value)} required style={{ backgroundColor: '#222', color: 'white' }}/></Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3" controlId="region"><Form.Label>Región</Form.Label>
                                        <Form.Control type="text" value={region} onChange={(e) => setRegion(e.target.value)} required style={{ backgroundColor: '#222', color: 'white' }}/></Form.Group>
                                </Col>
                            </Row>

                            {/* 3. SEGURIDAD */}
                            <h5 className="mb-3 mt-4 border-top pt-3" style={{ color: '#1E90FF' }}>Contraseña</h5>
                            <Form.Group className="mb-3" controlId="password">
                                <Form.Label>Contraseña</Form.Label>
                                <Form.Control type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ backgroundColor: '#222', color: 'white' }} isInvalid={password !== confirmPassword && confirmPassword.length > 0}/>
                            </Form.Group>
                            
                            <Form.Group className="mb-4" controlId="confirmPassword">
                                <Form.Label>Confirmar Contraseña</Form.Label>
                                <Form.Control type="password" placeholder="Confirma tu contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ backgroundColor: '#222', color: 'white' }} isInvalid={password !== confirmPassword}/>
                                <Form.Control.Feedback type="invalid">Las contraseñas no coinciden.</Form.Control.Feedback>
                            </Form.Group>

                            <Button type="submit" variant="success" className="w-100" disabled={loading}>
                                {loading ? 'Registrando...' : 'Registrarse'}
                            </Button>
                        </Form>
                        
                        <Row className="py-3">
                            <Col className="text-center text-muted">
                                ¿Ya tienes una cuenta? <Link to="/login" style={{ color: '#1E90FF' }}>Inicia Sesión</Link>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RegisterPage;