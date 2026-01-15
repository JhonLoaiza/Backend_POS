import express from 'express';
import ventaController from '../controllers/venta.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- RUTAS DE VENTAS ---

// POST: Crear Venta (Cualquier usuario logueado)
router.post('/', authMiddleware, ventaController.handleCrearVenta);

// GET: Historial (Cualquier usuario logueado)
router.get('/', authMiddleware, ventaController.getHistorial);

// DELETE: Anular Venta (Cualquier usuario logueado)
router.delete('/:id', authMiddleware, ventaController.anular);

export default router;