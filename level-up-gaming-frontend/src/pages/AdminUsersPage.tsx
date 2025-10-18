// level-up-gaming-frontend/src/pages/AdminUsersPage.tsx

import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Alert, Spinner, Badge, Button, Modal, ListGroup, Row, Col, Form } from 'react-bootstrap';
import { Users, Edit, Trash, ArrowLeft, PlusCircle, AlertTriangle } from 'react-feather';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User } from '../context/AuthContext'; 

const API_URL = '/api/users';

// FUNCIÓN DE VALIDACIÓN DE RUT FINAL: Asegura el formato de 9 dígitos (cuerpo + dígito)
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


const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null); 
    const [showCreateModal, setShowCreateModal] = useState(false); 
    
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);
    
    // ESTADOS PARA ELIMINACIÓN
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);


    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(API_URL); 
            setUsers(data);
            setError(null);
        } catch (err: any) {
            setError('Error al cargar la lista. Asegúrate de estar logueado como Administrador.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000); 
    };

    // Función que abre el modal de confirmación de eliminación
    const confirmDelete = (id: string, name: string) => {
        if (id === 'u1') {
            showStatus('¡ERROR! No puedes eliminar al administrador principal.', 'danger');
            return;
        }
        setUserToDelete({ id, name });
        setShowDeleteModal(true);
    };
    
    // Función que ejecuta la eliminación (llamada desde el modal)
    const handleDelete = async () => {
        if (!userToDelete) return;
        
        try {
            await axios.delete(`${API_URL}/${userToDelete.id}`); 
            
            setUsers(users.filter(u => u.id !== userToDelete.id));
            showStatus(`Usuario ${userToDelete.name} ha sido eliminado.`, 'success');
            
        } catch (err: any) {
            showStatus('Fallo al eliminar el usuario en el backend.', 'danger');
        } finally {
            setShowDeleteModal(false);
            setUserToDelete(null);
        }
    };


    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
    
    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <Link to="/admin">
                    <Button variant="outline-secondary" size="sm">
                        <ArrowLeft size={16} className="me-2"/> Volver al Panel
                    </Button>
                </Link>
                <h1 style={{ color: '#1E90FF' }}>Gestión de Usuarios</h1>
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                    <PlusCircle size={18} className="me-2"/> Nuevo Usuario
                </Button>
            </div>
            
            {statusMessage && (
                <Alert variant={statusMessage.type} onClose={() => setStatusMessage(null)} dismissible className="mb-4">
                    {statusMessage.msg}
                </Alert>
            )}

            <Table striped bordered hover responsive style={{ backgroundColor: '#111', color: 'white' }}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>RUT</th>
                        <th>Rol</th>
                        <th>Puntos</th>
                        <th>Descuento</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td className="text-muted">{user.rut}</td>
                            <td>
                                <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                                    {user.role.toUpperCase()}
                                </Badge>
                            </td>
                            <td>{user.points}</td>
                            <td>
                                <Badge bg={user.hasDuocDiscount ? 'success' : 'secondary'}>
                                    {user.hasDuocDiscount ? '20% OFF' : 'No'}
                                </Badge>
                            </td>
                            <td>
                                <Button 
                                    variant="info" 
                                    size="sm" 
                                    className="me-2" 
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <Edit size={14} />
                                </Button>
                                <Button 
                                    variant="danger" 
                                    size="sm" 
                                    onClick={() => confirmDelete(user.id, user.name)} 
                                >
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            
            {/* Modal de Edición */}
            <UserEditModal 
                user={selectedUser} 
                handleClose={() => setSelectedUser(null)} 
                fetchUsers={fetchUsers}
                showStatus={showStatus} 
            />
            
            {/* Modal de Creación */}
            <UserCreateModal
                show={showCreateModal}
                handleClose={() => setShowCreateModal(false)}
                fetchUsers={fetchUsers}
                showStatus={showStatus}
            />

            {/* DEFINICIÓN DEL MODAL DE ELIMINACIÓN */}
            <ConfirmDeleteModal 
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDelete}
                userName={userToDelete?.name || ''}
            />

        </Container>
    );
};

export default AdminUsersPage;


// ----------------------------------------------------
// COMPONENTE MODAL DE EDICIÓN (AUXILIAR)
// ----------------------------------------------------

interface EditModalProps {
    user: User | null;
    handleClose: () => void;
    fetchUsers: () => void;
    showStatus: (msg: string, type: 'success' | 'danger') => void;
}

const UserEditModal: React.FC<EditModalProps> = ({ user, handleClose, fetchUsers, showStatus }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '', email: user?.email || '', role: user?.role || 'customer' as 'admin' | 'customer' | 'seller',
        rut: user?.rut || '', age: user?.age ? user.age.toString() : '0', street: user?.address?.street || '', city: user?.address?.city || '', region: user?.address?.region || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({ 
                name: user.name, email: user.email, role: user.role, rut: user.rut, age: user.age.toString(), 
                street: user.address.street, city: user.address.city, region: user.address.region,
            });
            setError(null);
        }
    }, [user]);

    if (!user) return null;
    
    const disableRoleChange = user.id === 'u1'; 

    const updateFormData = (name: string, value: string) => {
        if (name === 'rut' && value.length > 9) return;
        if (name === 'age' && parseInt(value) > 95) return;
        
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // --- VALIDACIONES DE EDICIÓN ---
        if (!validateRut(formData.rut)) { setError('El RUT ingresado es inválido.'); setLoading(false); return; }
        if (parseInt(formData.age) < 18 || parseInt(formData.age) > 95) { setError('La edad debe estar entre 18 y 95 años.'); setLoading(false); return; }
        // --- FIN VALIDACIONES ---

        try {
            const payload = {
                name: formData.name, email: formData.email, role: formData.role, rut: formData.rut, age: formData.age, 
                address: { street: formData.street, city: formData.city, region: formData.region, zipCode: '' },
            };
            
            await axios.put(`${API_URL}/${user.id}/admin`, payload);
            
            fetchUsers();
            handleClose();
            showStatus(`Usuario ${formData.name} actualizado con éxito.`, 'success');

        } catch (err: any) {
            setError(err.response?.data?.message || 'Fallo al actualizar el usuario.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={!!user} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#1E90FF' }}>Editar Usuario: {user.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <h6 className="mb-3" style={{ color: '#39FF14' }}>Datos Principales</h6>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control type="text" name="name" value={formData.name} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" name="email" value={formData.email} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>RUT</Form.Label>
                                <Form.Control type="text" name="rut" value={formData.rut} onChange={(e) => updateFormData(e.target.name, e.target.value)} style={{ backgroundColor: '#333', color: 'white' }}/>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group className="mb-3">
                                <Form.Label>Edad</Form.Label>
                                <Form.Control type="number" name="age" value={formData.age} onChange={(e) => updateFormData(e.target.name, e.target.value)} style={{ backgroundColor: '#333', color: 'white' }}/>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Rol del Sistema</Form.Label>
                                <Form.Select
                                    name="role"
                                    value={formData.role}
                                    onChange={(e) => updateFormData(e.target.name, e.target.value)}
                                    disabled={disableRoleChange} 
                                    style={{ backgroundColor: '#333', color: 'white' }}
                                >
                                    <option value="customer">Cliente</option>
                                    <option value="seller">Vendedor</option>
                                    <option value="admin">Administrador</option>
                                </Form.Select>
                                {disableRoleChange && <Form.Text className="text-danger">No puedes cambiar el rol del administrador principal.</Form.Text>}
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <h6 className="mb-3 mt-3" style={{ color: '#39FF14' }}>Dirección de Envío</h6>
                    <Form.Group className="mb-3">
                        <Form.Label>Calle</Form.Label>
                        <Form.Control type="text" name="street" value={formData.street} onChange={(e) => updateFormData(e.target.name, e.target.value)} style={{ backgroundColor: '#333', color: 'white' }}/>
                    </Form.Group>

                    <Row>
                        <Col><Form.Group className="mb-3">
                            <Form.Label>Ciudad</Form.Label>
                            <Form.Control type="text" name="city" value={formData.city} onChange={(e) => updateFormData(e.target.name, e.target.value)} style={{ backgroundColor: '#333', color: 'white' }}/>
                        </Form.Group></Col>
                        <Col><Form.Group className="mb-3">
                            <Form.Label>Región</Form.Label>
                            <Form.Control type="text" name="region" value={formData.region} onChange={(e) => updateFormData(e.target.name, e.target.value)} style={{ backgroundColor: '#333', color: 'white' }}/>
                        </Form.Group></Col>
                    </Row>
                    
                    <Button type="submit" variant="primary" className="w-100 mt-3" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

// ----------------------------------------------------
// COMPONENTE MODAL DE CREACIÓN DE USUARIO (AUXILIAR)
// ----------------------------------------------------

interface CreateModalProps {
    show: boolean;
    handleClose: () => void;
    fetchUsers: () => void;
    showStatus: (msg: string, type: 'success' | 'danger') => void;
}

const UserCreateModal: React.FC<CreateModalProps> = ({ show, handleClose, fetchUsers, showStatus }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'customer' as 'admin' | 'customer' | 'seller',
        rut: '', age: '0', street: '', city: '', region: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateFormData = (name: string, value: string) => {
        // VALIDACIÓN EN TIEMPO REAL: RUT (máx 9 dígitos)
        if (name === 'rut' && value.length > 9) return;
        // VALIDACIÓN EN TIEMPO REAL: Edad (máx 95)
        if (name === 'age' && parseInt(value) > 95) return;
        
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        // --- VALIDACIONES DE CREACIÓN ---
        if (!validateRut(formData.rut)) { setError('El RUT ingresado es inválido.'); setLoading(false); return; }
        if (parseInt(formData.age) < 18 || parseInt(formData.age) > 95) { setError('La edad debe estar entre 18 y 95 años.'); setLoading(false); return; }
        if (formData.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); setLoading(false); return; }
        // --- FIN VALIDACIONES ---

        try {
            const payload = {
                ...formData,
                age: parseInt(formData.age),
                address: { street: formData.street, city: formData.city, region: formData.region, zipCode: '' },
            };
            
            await axios.post(`${API_URL}/admin`, payload);
            
            fetchUsers();
            handleClose();
            showStatus(`Usuario ${formData.name} creado con éxito.`, 'success');

        } catch (err: any) {
            setError(err.response?.data?.message || 'Fallo al crear el usuario. El email podría estar duplicado.');
        } finally {
            setLoading(false);
        }
    };
    
    // Reiniciar el formulario al cerrar
    useEffect(() => {
        if (!show) {
            setFormData({ name: '', email: '', password: '', role: 'customer', rut: '', age: '0', street: '', city: '', region: '' });
            setError(null);
        }
    }, [show]);


    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#39FF14' }}>Crear Nuevo Usuario</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <h6 className="mb-3" style={{ color: '#39FF14' }}>Información de Cuenta</h6>
                    <Row>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" name="name" value={formData.name} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Email</Form.Label>
                            <Form.Control type="email" name="email" value={formData.email} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/></Form.Group></Col>
                    </Row>
                    <Row>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Contraseña Inicial</Form.Label>
                            <Form.Control type="password" name="password" value={formData.password} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-3"><Form.Label>RUT</Form.Label>
                            <Form.Control type="text" name="rut" value={formData.rut} onChange={(e) => updateFormData(e.target.name, e.target.value)} style={{ backgroundColor: '#333', color: 'white' }}/></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-3"><Form.Label>Edad</Form.Label>
                            <Form.Control type="number" name="age" value={formData.age} onChange={(e) => updateFormData(e.target.name, e.target.value)} style={{ backgroundColor: '#333', color: 'white' }}/></Form.Group></Col>
                    </Row>
                    <Form.Group className="mb-4">
                        <Form.Label>Rol</Form.Label>
                        <Form.Select
                            name="role"
                            value={formData.role}
                            onChange={(e) => updateFormData(e.target.name, e.target.value)}
                            style={{ backgroundColor: '#333', color: 'white' }}
                        >
                            <option value="customer">Cliente</option>
                            <option value="seller">Vendedor</option>
                            <option value="admin">Administrador</option>
                        </Form.Select>
                    </Form.Group>

                    <h6 className="mb-3 mt-3" style={{ color: '#39FF14' }}>Dirección Inicial</h6>
                    <Form.Group className="mb-3"><Form.Label>Calle</Form.Label>
                        <Form.Control type="text" name="street" value={formData.street} onChange={(e) => updateFormData(e.target.name, e.target.value)} style={{ backgroundColor: '#333', color: 'white' }}/></Form.Group>
                    <Row>
                        <Col><Form.Group className="mb-3"><Form.Label>Ciudad</Form.Label>
                            <Form.Control type="text" name="city" value={formData.city} onChange={(e) => updateFormData(e.target.name, e.target.value)} style={{ backgroundColor: '#333', color: 'white' }}/></Form.Group></Col>
                        <Col><Form.Group className="mb-3"><Form.Label>Región</Form.Label>
                            <Form.Control type="text" name="region" value={formData.region} onChange={(e) => updateFormData(e.target.name, e.target.value)} style={{ backgroundColor: '#333', color: 'white' }}/></Form.Group></Col>
                    </Row>
                    
                    <Button type="submit" variant="success" className="w-100 mt-3" disabled={loading}>
                        {loading ? 'Creando...' : 'Crear Usuario'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};


// ----------------------------------------------------
// COMPONENTE MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
// ----------------------------------------------------

interface ConfirmDeleteModalProps {
    show: boolean;
    handleClose: () => void;
    handleDelete: () => void;
    userName: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    show,
    handleClose,
    handleDelete,
    userName,
}) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#FF4444' }}>
                    <AlertTriangle size={24} className="me-2"/> Confirmar Eliminación
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <p>
                    ¿Estás seguro de que deseas eliminar al usuario{' '}
                    <strong style={{ color: '#39FF14' }}>{userName}</strong>?
                </p>
                <Alert variant="warning" className="mt-3">
                    Esta acción no se puede deshacer.
                </Alert>
            </Modal.Body>

            <Modal.Footer style={{ backgroundColor: '#111' }}>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                    Eliminar Usuario
                </Button>
            </Modal.Footer>
        </Modal>
    );
};