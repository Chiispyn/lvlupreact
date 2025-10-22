// level-up-gaming-frontend/src/pages/AdminEventsPage.tsx

import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Alert, Spinner, Button, Modal, Row, Col, Form } from 'react-bootstrap';
import { Edit, Trash, ArrowLeft, PlusCircle, MapPin, AlertTriangle } from 'react-feather'; // 🚨 Importar AlertTriangle
import { Link } from 'react-router-dom';
import axios from 'axios';

// Interfaces (deben coincidir con el Backend)
interface Event {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    location: string;
    mapEmbed: string;
}

const API_URL = '/api/events';

// ----------------------------------------------------
// PÁGINA PRINCIPAL DE ADMINISTRACIÓN DE EVENTOS
// ----------------------------------------------------

const AdminEventsPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null); 
    const [showCreateModal, setShowCreateModal] = useState(false); 
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);
    
    // 🚨 ESTADOS PARA EL MODAL DE ELIMINACIÓN
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<{ id: string, title: string } | null>(null);


    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(API_URL); 
            setEvents(data.reverse()); 
            setError(null);
        } catch (err: any) {
            setError('Error al cargar los eventos. Asegúrate de que el Backend esté corriendo en :5000.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);
    
    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000); 
    };

    // 🚨 FUNCIÓN: Abre el modal de confirmación
    const confirmDelete = (id: string, title: string) => {
        setEventToDelete({ id, title });
        setShowDeleteModal(true);
    };

    // 🚨 FUNCIÓN: Ejecuta la eliminación después de la confirmación del modal
    const handleDelete = async () => {
        if (!eventToDelete) return;
        
        try {
            await axios.delete(`${API_URL}/${eventToDelete.id}/admin`); 
            setEvents(events.filter(e => e.id !== eventToDelete.id));
            showStatus(`Evento "${eventToDelete.title}" eliminado con éxito.`, 'success');
            
        } catch (err: any) {
            showStatus('Fallo al eliminar el evento.', 'danger');
        } finally {
            setShowDeleteModal(false);
            setEventToDelete(null);
        }
    };
    
    const handleEdit = (event: Event) => {
        setSelectedEvent(event);
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
                <h1 style={{ color: '#1E90FF' }}>Gestión de Eventos</h1>
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                    <PlusCircle size={18} className="me-2"/> Nuevo Evento
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
                        <th>Título</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Ubicación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event) => (
                        <tr key={event.id}>
                            <td style={{ color: '#39FF14' }}>{event.title}</td>
                            <td>{new Date(event.date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                            <td>{event.time}</td>
                            <td><MapPin size={14} className="me-1"/>{event.location}</td>
                            <td>
                                <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(event)}>
                                    <Edit size={14} /> Editar
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => confirmDelete(event.id, event.title)}>
                                    <Trash size={14} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            
            {/* Modal de Creación/Edición */}
            <EventModal
                event={selectedEvent} 
                show={showCreateModal || !!selectedEvent}
                handleClose={() => { setSelectedEvent(null); setShowCreateModal(false); }}
                fetchEvents={fetchEvents}
                showStatus={showStatus}
            />
            
            {/* 🚨 NUEVO MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            <ConfirmDeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDelete}
                eventName={eventToDelete?.title || ''}
            />
        </Container>
    );
};

export default AdminEventsPage;


// ----------------------------------------------------
// COMPONENTE MODAL DE CREACIÓN/EDICIÓN DE EVENTO
// ----------------------------------------------------

interface EventModalProps {
    event: Event | null;
    show: boolean;
    handleClose: () => void;
    fetchEvents: () => void;
    showStatus: (msg: string, type: 'success' | 'danger') => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, show, handleClose, fetchEvents, showStatus }) => {
    const isEditing = !!event;
    // Obtener la fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);
    // Obtener la fecha máxima permitida (ej. 1 año a partir de ahora)
    const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10);

    // Inicialización del estado del formulario
    const [formData, setFormData] = useState({
        title: event?.title || '',
        date: event?.date || today, // Usar la fecha de hoy como default
        time: event?.time || '18:00',
        location: event?.location || '',
        mapEmbed: event?.mapEmbed || '', // Almacena el código completo
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (event) {
            setFormData({ title: event.title, date: event.date, time: event.time, location: event.location, mapEmbed: event.mapEmbed });
        } else {
            // Resetear a valores iniciales (fecha de hoy)
            setFormData({ title: '', date: today, time: '18:00', location: '', mapEmbed: '' });
        }
        setError(null);
    }, [event, show]);

    const updateFormData = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // FUNCIÓN CRÍTICA: Extrae la URL de incrustación del iframe completo
    const extractEmbedSrc = (fullCode: string): string => {
        // Usa una expresión regular simple para encontrar el valor de src="..."
        const match = fullCode.match(/src="([^"]+)"/);
        // Si encuentra el src, devuelve la URL limpia, si no, devuelve el código si parece una URL, si no, vacío.
        return match ? match[1] : fullCode.includes('http') ? fullCode : ''; 
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const payload = { ...formData };
        
        // 1. Procesar el código que pegó el administrador (extraer solo la URL)
        if (payload.mapEmbed.includes('<iframe') || payload.mapEmbed.includes('http')) {
             payload.mapEmbed = extractEmbedSrc(payload.mapEmbed);
        }
        
        // 2. VALIDACIÓN DE FECHA: No permitir fechas pasadas
        if (new Date(formData.date) < new Date(today) && !isEditing) {
            setError('No puedes agendar eventos en el pasado.');
            setLoading(false);
            return;
        }

        // 3. Validación Final
        if (payload.mapEmbed && !payload.mapEmbed.startsWith('http')) {
             setError('La URL de incrustación es inválida. Debe ser una URL web (http/https).');
             setLoading(false);
             return;
        }


        const url = isEditing ? `${API_URL}/${event!.id}/admin` : `${API_URL}/admin`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            await axios({
                method: method,
                url: url,
                data: payload,
            });
            
            fetchEvents();
            handleClose();
            showStatus(`Evento "${formData.title}" ${isEditing ? 'actualizado' : 'creado'} con éxito.`, 'success');

        } catch (err: any) {
            setError(err.response?.data?.message || `Fallo al ${isEditing ? 'actualizar' : 'crear'} el evento.`);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#39FF14' }}>{isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Título</Form.Label>
                        <Form.Control type="text" name="title" value={formData.title} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/>
                    </Form.Group>
                    
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="date" 
                                    value={formData.date} 
                                    onChange={(e) => updateFormData(e.target.name, e.target.value)} 
                                    required 
                                    min={today} // MÍNIMO HOY
                                    max={maxDate} // MÁXIMO 1 AÑO
                                    style={{ backgroundColor: '#333', color: 'white' }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Hora</Form.Label>
                                <Form.Control type="time" name="time" value={formData.time} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Ubicación</Form.Label>
                        <Form.Control type="text" name="location" value={formData.location} onChange={(e) => updateFormData(e.target.name, e.target.value)} required style={{ backgroundColor: '#333', color: 'white' }}/>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>URL Embed de Mapa (Iframe Completo)</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            name="mapEmbed" 
                            value={formData.mapEmbed} 
                            onChange={(e) => updateFormData(e.target.name, e.target.value)} 
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                        <Form.Text className="text-muted">
                            Paso: Pegue aquí el código iframe que Google Maps le proporciona. (Se guardará solo la URL del 'src').
                        </Form.Text>
                    </Form.Group>
                    
                    <Button type="submit" variant="success" className="w-100 mt-3" disabled={loading}>
                        {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Evento')}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};


// ----------------------------------------------------
// 🚨 COMPONENTE MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
// ----------------------------------------------------

interface ConfirmDeleteModalProps {
    show: boolean;
    handleClose: () => void;
    handleDelete: () => void;
    eventName: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ show, handleClose, handleDelete, eventName }) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#FF4444' }}>
                <Modal.Title style={{ color: '#FF4444' }}>
                    <AlertTriangle size={24} className="me-2"/> Confirmar Eliminación
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <p>
                    ¿Estás seguro de que deseas eliminar el evento{' '}
                    <strong style={{ color: '#39FF14' }}>{eventName}</strong>?
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
                    Eliminar Evento
                </Button>
            </Modal.Footer>
        </Modal>
    );
};