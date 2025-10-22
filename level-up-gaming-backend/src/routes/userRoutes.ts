// level-up-gaming-backend/src/routes/userRoutes.ts

import express from 'express';
// 🚨 CORRECCIÓN: Cambiar la importación de 'addPoints' a 'updatePoints'
import { 
    authUser, 
    registerUser, 
    updateUserProfile, 
    getUsers, 
    createUser, 
    updateUserByAdmin, 
    updatePoints, // 🚨 Importación Correcta
    toggleUserStatus
} from '../controllers/userController'; 

const router = express.Router();

// Rutas Públicas y de Escritura
router.post('/login', authUser);
router.post('/register', registerUser);
router.put('/profile', updateUserProfile); 

// Rutas de Administración
router.get('/', getUsers); 
router.post('/admin', createUser); 
router.put('/:id/admin', updateUserByAdmin); 

// 🚨 RUTA CRÍTICA: PUT /api/users/:id/points
router.put('/:id/points', updatePoints); // ✅ Uso de la función updatePoints
router.put('/:id/status', toggleUserStatus);

export default router;