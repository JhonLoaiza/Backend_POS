import express from 'express';
import cierreCajaController from '../controllers/cierreCaja.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- RUTAS DE CIERRE DE CAJA ---

// POST: Registrar cierre de caja (Cualquier usuario logueado)
router.post('/', authMiddleware, cierreCajaController.registrarCierre);

// GET: Obtener historial de cierres (Cualquier usuario logueado)
router.get('/', authMiddleware, cierreCajaController.obtenerHistorial);

// GET: Obtener cierre específico por ID (Cualquier usuario logueado)
router.get('/:id', authMiddleware, cierreCajaController.obtenerPorId);

export default router;
