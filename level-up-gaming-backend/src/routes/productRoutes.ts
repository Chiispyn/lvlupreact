// level-up-gaming-backend/src/routes/productRoutes.ts (FINAL)

import express from 'express'; 
import { 
    getProducts, 
    getProductById, 
    getTopProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from '../controllers/productController';

const router = express.Router();

// Rutas Públicas (GET)
router.get('/', getProducts);
router.get('/top', getTopProducts);
router.get('/:id', getProductById);

// Rutas de Administración (CRUD Mocking)
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;