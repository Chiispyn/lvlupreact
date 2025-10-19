// level-up-gaming-backend/src/routes/orderRoutes.ts

import express from 'express'; 
import { addOrderItems, getMyOrders, getAllOrders, updateOrderStatus } from '../controllers/orderController';

const router = express.Router();

// 🚨 RUTA CRÍTICA PARA EL CHECKOUT
router.post('/', addOrderItems);    // POST /api/orders

router.get('/myorders', getMyOrders); // GET /api/orders/myorders

router.get('/', getAllOrders); // GET /api/orders (Admin)

router.put('/:id/status', updateOrderStatus); 

export default router;