// level-up-gaming-backend/src/routes/eventRoutes.ts

import express from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController';

const router = express.Router();

// Rutas Públicas (Lectura)
router.get('/', getEvents); 

// Rutas de Administración (CRUD)
router.post('/admin', createEvent); 
router.put('/:id/admin', updateEvent); 
router.delete('/:id/admin', deleteEvent); 

export default router;