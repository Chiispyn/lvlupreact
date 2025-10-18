// level-up-gaming-backend/src/routes/blogRoutes.ts (COMPLETO)

import express from 'express';
// 🚨 Importar getBlogPostById
import { getBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost } from '../controllers/blogController';

const router = express.Router();

// Rutas Públicas (Lectura)
router.get('/', getBlogPosts); 
router.get('/:id', getBlogPostById); // 🚨 NUEVA RUTA: GET /api/blog/:id

// Rutas de Administración (CRUD)
router.post('/admin', createBlogPost); 
router.put('/:id/admin', updateBlogPost); 
router.delete('/:id/admin', deleteBlogPost); 

export default router;