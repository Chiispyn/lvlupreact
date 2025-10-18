// level-up-gaming-backend/src/routes/videoRoutes.ts

import express from 'express';
import { getFeaturedVideos, getAllVideos, createVideo, updateVideo, deleteVideo } from '../controllers/videoController';

const router = express.Router();

// Rutas Públicas (Lectura)
router.get('/featured', getFeaturedVideos); // GET /api/videos/featured
router.get('/', getAllVideos);             // GET /api/videos (Admin)

// Rutas de Administración (CRUD)
router.post('/admin', createVideo); 
router.put('/:id/admin', updateVideo); 
router.delete('/:id/admin', deleteVideo); 

export default router;