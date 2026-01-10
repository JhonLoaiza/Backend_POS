import express from 'express';
import compraController from '../controllers/compra.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = express.Router();

// POST /api/compras
router.post('/', 
    authMiddleware, 
    adminMiddleware, // Solo Lorena puede registrar facturas
    compraController.handleRegistrarCompra
);

router.get('/', authMiddleware, adminMiddleware, compraController.handleObtenerCompras);

// GET /api/compras/:id (Detalle)
router.get('/:id', authMiddleware, adminMiddleware, compraController.handleObtenerDetalleCompra);
export default router;