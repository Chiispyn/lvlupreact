// level-up-gaming-backend/src/routes/rewardRoutes.ts (VERIFICACIÓN COMPLETA)

import express from 'express';
import { getActiveRewards, getAllRewards, createReward, updateReward, deleteReward } from '../controllers/rewardController';

const router = express.Router();

// Rutas Públicas
router.get('/', getActiveRewards); // GET /api/rewards

// Rutas de Administración
router.get('/admin', getAllRewards);
router.post('/admin', createReward);
router.put('/:id/admin', updateReward);
router.delete('/:id/admin', deleteReward);

export default router; // ✅ Exportación correcta