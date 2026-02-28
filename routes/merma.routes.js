import express from 'express';
import mermaController from '../controllers/merma.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- RUTAS DE MERMAS ---

// POST: Registrar merma (Cualquier usuario logueado)
router.post('/', authMiddleware, mermaController.registrar);

// GET: Obtener todas las mermas (Cualquier usuario logueado)
router.get('/', authMiddleware, mermaController.obtenerTodas);

// GET: Obtener mermas de hoy (Cualquier usuario logueado)
router.get('/hoy', authMiddleware, mermaController.obtenerHoy);

// GET: Obtener mermas por rango de fechas (Cualquier usuario logueado)
router.get('/rango', authMiddleware, mermaController.obtenerPorRango);

// GET: Obtener estadísticas de mermas (Cualquier usuario logueado)
router.get('/estadisticas', authMiddleware, mermaController.obtenerEstadisticas);

// GET: Obtener productos con más mermas (Cualquier usuario logueado)
router.get('/productos-mas-mermas', authMiddleware, mermaController.obtenerProductosConMasMermas);

export default router;
