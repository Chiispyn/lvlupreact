// level-up-gaming-frontend/src/pages/RegisterPage.tsx

import React, { useState, FormEvent, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

// 🚨 BASE DE DATOS JERÁRQUICA CHILENA (JSON COMPLETO)
interface Provincia { provincia: string; comunas: string[] }
interface ChileanRegion { region: string; provincias: Provincia[]; numero_romano: string; }

const CHILEAN_REGIONS_DATA: ChileanRegion[] = [
    { region: 'Arica y Parinacota', numero_romano: 'XV', provincias: [{ provincia: 'Arica', comunas: ["Arica", "Camarones"] }, { provincia: 'Parinacota', comunas: ["Putre", "General Lagos"] }] },
    { region: 'Tarapacá', numero_romano: 'I', provincias: [{ provincia: 'Iquique', comunas: ["Iquique", "Alto Hospicio"] }, { provincia: 'Tamarugal', comunas: ["Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"] }] },
    { region: 'Antofagasta', numero_romano: 'II', provincias: [{ provincia: 'Antofagasta', comunas: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal"] }, { provincia: 'El Loa', comunas: ["Calama", "Ollagüe", "San Pedro de Atacama"] }, { provincia: 'Tocopilla', comunas: ["Tocopilla", "María Elena"] }] },
    { region: 'Atacama', numero_romano: 'III', provincias: [{ provincia: 'Copiapó', comunas: ["Copiapó", "Caldera", "Tierra Amarilla"] }, { provincia: 'Chañaral', comunas: ["Chañaral", "Diego de Almagro"] }, { provincia: 'Huasco', comunas: ["Vallenar", "Alto del Carmen", "Freirina", "Huasco"] }] },
    { region: 'Coquimbo', numero_romano: 'IV', provincias: [{ provincia: 'Elqui', comunas: ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña"] }, { provincia: 'Limarí', comunas: ["Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"] }, { provincia: 'Choapa', comunas: ["Illapel", "Canela", "Los Vilos", "Salamanca"] }] },
    { region: 'Valparaíso', numero_romano: 'V', provincias: [{ provincia: 'Valparaíso', comunas: ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar"] }, { provincia: 'Isla de Pascua', comunas: ["Isla de Pascua"] }, { provincia: 'Los Andes', comunas: ["Los Andes", "Calle Larga", "Rinconada", "San Esteban"] }, { provincia: 'Petorca', comunas: ["La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar"] }, { provincia: 'Quillota', comunas: ["Quillota", "La Calera", "Hijuelas", "La Cruz", "Nogales"] }, { provincia: 'San Antonio', comunas: ["San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo"] }, { provincia: 'San Felipe de Aconcagua', comunas: ["San Felipe", "Catemu", "Llay-Llay", "Panquehue", "Putaendo", "Santa María"] }, { provincia: 'Marga Marga', comunas: ["Villa Alemana", "Limache", "Olmué", "Quilpué"] }] },
    { region: 'Libertador General Bernardo O\'Higgins', numero_romano: 'VI', provincias: [{ provincia: 'Cachapoal', comunas: ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente de Tagua Tagua"] }, { provincia: 'Cardenal Caro', comunas: ["Pichilemu", "La Estrella", "Litueche", "Marchigüe", "Navidad", "Paredones"] }, { provincia: 'Colchagua', comunas: ["San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"] }] },
    { region: 'Maule', numero_romano: 'VII', provincias: [{ provincia: 'Talca', comunas: ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael"] }, { provincia: 'Cauquenes', comunas: ["Cauquenes", "Chanco", "Pelluhue"] }, { provincia: 'Curicó', comunas: ["Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén"] }, { provincia: 'Linares', comunas: ["Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"] }] },
    { region: 'Biobío', numero_romano: 'VIII', provincias: [{ provincia: 'Concepción', comunas: ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén"] }, { provincia: 'Arauco', comunas: ["Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa"] }, { provincia: 'Biobío', comunas: ["Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"] }] },
    { region: 'La Araucanía', numero_romano: 'IX', provincias: [{ provincia: 'Cautín', comunas: ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol"] }, { provincia: 'Malleco', comunas: ["Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"] }] },
    { region: 'Los Lagos', numero_romano: 'X', provincias: [{ provincia: 'Llanquihue', comunas: ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas"] }, { provincia: 'Chiloé', comunas: ["Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao"] }, { provincia: 'Osorno', comunas: ["Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo"] }, { provincia: 'Palena', comunas: ["Chaitén", "Futaleufú", "Hualaihué", "Palena"] }] },
    { region: 'Aysén del General Carlos Ibáñez del Campo', numero_romano: 'XI', provincias: [{ provincia: 'Coihaique', comunas: ["Coihaique", "Lago Verde"] }, { provincia: 'Aysén', comunas: ["Aysén", "Cisnes", "Guaitecas"] }, { provincia: 'Capitán Prat', comunas: ["Cochrane", "O’Higgins", "Tortel"] }, { provincia: 'General Carrera', comunas: ["Chile Chico", "Río Ibáñez"] }] },
    { region: 'Magallanes y de la Antártica Chilena', numero_romano: 'XII', provincias: [{ provincia: 'Magallanes', comunas: ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio"] }, { provincia: 'Antártica Chilena', comunas: ["Cabo de Hornos (Ex Navarino)", "Antártica"] }, { provincia: 'Tierra del Fuego', comunas: ["Porvenir", "Primavera", "Timaukel"] }, { provincia: 'Última Esperanza', comunas: ["Natales", "Torres del Paine"] }] },
    { region: 'Región Metropolitana de Santiago', numero_romano: 'XIII', provincias: [{ provincia: 'Santiago', comunas: ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Santiago", "Vitacura"] }, { provincia: 'Cordillera', comunas: ["Puente Alto", "Pirque", "San José de Maipo"] }, { provincia: 'Chacabuco', comunas: ["Colina", "Lampa", "Tiltil"] }, { provincia: 'Maipo', comunas: ["San Bernardo", "Buin", "Calera de Tango", "Paine"] }, { provincia: 'Melipilla', comunas: ["Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro"] }, { provincia: 'Talagante', comunas: ["Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"] }] },
    { region: 'Los Ríos', numero_romano: 'XIV', provincias: [{ provincia: 'Valdivia', comunas: ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli"] }, { provincia: 'Ranco', comunas: ["La Unión", "Futrono", "Lago Ranco", "Río Bueno"] }] },
    { region: 'Ñuble', numero_romano: 'XVI', provincias: [{ provincia: 'Diguillín', comunas: ["Bulnes", "Chillán Viejo", "Chillán", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay"] }, { provincia: 'Itata', comunas: ["Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Quirihue", "Ránquil", "Treguaco"] }, { provincia: 'Punilla', comunas: ["Coihueco", "Ñiquén", "San Carlos", "San Fabián", "San Nicolás"] }] },
];

const getCommunesByRegionName = (regionName: string): string[] => {
    // 🚨 Búsqueda en el JSON por la propiedad 'region'
    const regionData: any = CHILEAN_REGIONS_DATA.find((r: any) => r.region === regionName);
    
    if (!regionData) return [];
    
    // Recorre todas las provincias y concatena las comunas
    return regionData.provincias.flatMap((p: any) => p.comunas);
};


const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rut, setRut] = useState('');
    const [age, setAge] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [region, setRegion] = useState(''); // 🚨 Estado para la Región
    const [referralCodeInput, setReferralCodeInput] = useState(''); 
    
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    // 🚨 NUEVO: Estado para las comunas disponibles
    const [availableCommunes, setAvailableCommunes] = useState<string[]>([]); 

    const navigate = useNavigate();
    const { setUserFromRegistration, isLoggedIn } = useAuth(); 

    if (isLoggedIn) {
        navigate('/');
        return null;
    }
    
    // 🚨 EFECTO PARA SINCRONIZAR LAS COMUNAS AL CAMBIAR LA REGIÓN
    useEffect(() => {
        const communes = getCommunesByRegionName(region);
        setAvailableCommunes(communes);
        // Si la ciudad actual no existe en la nueva región, la limpiamos
        if (city && !communes.includes(city)) {
            setCity('');
        }
    }, [region]);
    
    // FUNCIÓN DE VERIFICACIÓN DE RUT
    const validateRut = (rutValue: string): boolean => {
        let rutLimpio = rutValue.replace(/[^0-9kK]/g, ''); 
        if (rutLimpio.length < 2) return false;

        let dv = rutLimpio.charAt(rutLimpio.length - 1).toUpperCase();
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

        return dv === dvFinal;
    };


    const submitHandler = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // --- VALIDACIONES DE FRONTEND ---
        if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); setLoading(false); return; }
        if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); setLoading(false); return; }
        if (!validateRut(rut)) { setError('El RUT ingresado es inválido.'); setLoading(false); return; }
        
        const ageInt = parseInt(age);
        if (ageInt < 18 || ageInt > 95) { setError('La edad debe estar entre 18 y 95 años.'); setLoading(false); return; }
        
        if (!street || !city || !region) { setError('Todos los campos de dirección son obligatorios.'); setLoading(false); return; }
        // --- FIN VALIDACIONES ---

        try {
            const payload = { 
                name, email, password,
                rut: rut.replace(/[^0-9kK]/g, ''), 
                age: ageInt,
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
                        <p className="text-center text-muted"><Badge bg="info" className="me-1">¡Regalo!</Badge> Obtienes **100 puntos** y código de referido.</p>
                        
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
                                            max={95} 
                                            isInvalid={parseInt(age) < 18 || parseInt(age) > 95} 
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
                            <Form.Group className="mb-3" controlId="street">
                                <Form.Label>Calle y Número</Form.Label>
                                <Form.Control type="text" value={street} onChange={(e) => setStreet(e.target.value)} required style={{ backgroundColor: '#222', color: 'white' }}/>
                            </Form.Group>
                            
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="region">
                                        <Form.Label>Región</Form.Label>
                                        <Form.Select 
                                            value={region} 
                                            onChange={(e) => setRegion(e.target.value)} 
                                            required 
                                            style={{ backgroundColor: '#222', color: 'white' }}
                                        >
                                            <option value="">Seleccione Región</option>
                                            {/* 🚨 Renderiza las regiones desde el JSON */}
                                            {CHILEAN_REGIONS_DATA.map((reg: any) => (<option key={reg.region} value={reg.region}>{reg.region}</option>))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="city">
                                        <Form.Label>Ciudad / Comuna</Form.Label>
                                        <Form.Select 
                                            value={city} 
                                            onChange={(e) => setCity(e.target.value)} 
                                            required 
                                            disabled={availableCommunes.length === 0}
                                            style={{ backgroundColor: '#222', color: 'white' }}
                                        >
                                            <option value="">Seleccione Comuna</option>
                                            {/* 🚨 Renderiza las comunas disponibles */}
                                            {availableCommunes.map(commune => (<option key={commune} value={commune}>{commune}</option>))}
                                        </Form.Select>
                                        {availableCommunes.length === 0 && region && (
                                            <Form.Text className="text-danger">Seleccione una región válida primero.</Form.Text>
                                        )}
                                    </Form.Group>
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