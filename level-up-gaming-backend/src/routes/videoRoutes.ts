// level-up-gaming-backend/src/routes/videoRoutes.ts

import express from 'express';
// 🚨 Asegurar que TODAS las funciones requeridas, incluyendo toggleVideoFeature, sean importadas
import { getFeaturedVideos, getAllVideos, createVideo, updateVideo, deleteVideo, toggleVideoFeature } from '../controllers/videoController';

const router = express.Router();

// Rutas Públicas (Lectura)
router.get('/featured', getFeaturedVideos); 
router.get('/', getAllVideos);             

// Rutas de Administración (CRUD)
router.post('/admin', createVideo); 
router.put('/:id/admin', updateVideo); 
router.delete('/:id/admin', deleteVideo); 

// 🚨 RUTA CRÍTICA AÑADIDA: PUT /api/videos/:id/feature
router.put('/:id/feature', toggleVideoFeature); 

export default router;