import express from 'express';
import ventaController from '../controllers/venta.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/ventas (Crear una Venta)
// Seguridad: Cualquiera logueado (admin o cajero)
router.post('/', 
    authMiddleware, 
    ventaController.handleCrearVenta
);
router.get('/', ventaController.getHistorial);
router.delete('/:id', ventaController.anular);

// (Aquí irán las rutas de reportes, que serán solo para admin)

export default router;